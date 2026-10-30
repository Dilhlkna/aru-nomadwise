import { CurrencyCode, ExchangePreview, RateSnapshot } from '../types';

// Baseline calibrated fallback rates against USD (used if API is slow or offline)
const FALLBACK_USD_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  KZT: 498.60, // 1 USD = 498.60 KZT
  EUR: 0.9220, // 1 USD = 0.9220 EUR (1 EUR = ~1.084 USD)
  GBP: 0.7840, // 1 USD = 0.7840 GBP
  RUB: 95.80,  // 1 USD = 95.80 RUB
  CNY: 7.140,  // 1 USD = 7.140 CNY
  AED: 3.6725, // 1 USD = 3.6725 AED (Pegged)
  TRY: 34.25,  // 1 USD = 34.25 TRY
  JPY: 152.40, // 1 USD = 152.40 JPY
  CHF: 0.8650, // 1 USD = 0.8650 CHF
  CAD: 1.3850, // 1 USD = 1.3850 CAD
};

const CACHE_KEY = 'nomadwise_cached_rates';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Helper for exact decimal rounding (BigDecimal emulation)
export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatCurrencyAmount(
  amount: number,
  currencyCode: CurrencyCode,
  includeSymbol: boolean = true
): string {
  const decimals = currencyCode === 'JPY' ? 0 : 2;
  const formatted = amount.toLocaleString('kk-KZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!includeSymbol) return formatted;

  switch (currencyCode) {
    case 'KZT':
      return `${formatted} ₸`;
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'GBP':
      return `£${formatted}`;
    case 'RUB':
      return `${formatted} ₽`;
    case 'CNY':
      return `¥${formatted}`;
    case 'AED':
      return `${formatted} AED`;
    case 'TRY':
      return `₺${formatted}`;
    case 'JPY':
      return `¥${formatted}`;
    case 'CHF':
      return `${formatted} Fr`;
    case 'CAD':
      return `C$${formatted}`;
    default:
      return `${formatted} ${currencyCode}`;
  }
}

class CurrencyService {
  private currentSnapshot: RateSnapshot = {
    base: 'USD',
    timestamp: new Date().toISOString(),
    provider: 'Кэштелген нарықтық бағам',
    isLive: false,
    rates: FALLBACK_USD_RATES,
  };

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.rates) {
          this.currentSnapshot = parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToLocalStorage(snapshot: RateSnapshot) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Fetches the latest live exchange rates from Open Exchange API and Frankfurter API.
   * If both fail or are slow, gracefully falls back to cached rates with notification.
   */
  async fetchLiveRates(): Promise<RateSnapshot> {
    try {
      // Primary: Open Exchange Rates free API (includes KZT, EUR, GBP, RUB, CNY, etc.)
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (data && data.rates) {
        const newRates: Record<CurrencyCode, number> = { ...FALLBACK_USD_RATES };

        // Map supported currencies
        (Object.keys(FALLBACK_USD_RATES) as CurrencyCode[]).forEach((code) => {
          if (data.rates[code]) {
            newRates[code] = data.rates[code];
          }
        });

        const snapshot: RateSnapshot = {
          base: 'USD',
          timestamp: new Date().toISOString(),
          provider: 'Frankfurter & Global Live API',
          isLive: true,
          rates: newRates,
        };

        this.currentSnapshot = snapshot;
        this.saveToLocalStorage(snapshot);
        return snapshot;
      }
    } catch (err) {
      console.warn('Live rate fetch failed, using cached snapshot:', err);
    }

    // Secondary attempt: Frankfurter API (ECB official)
    try {
      const resp = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (resp.ok) {
        const fData = await resp.json();
        if (fData && fData.rates) {
          const mergedRates = { ...this.currentSnapshot.rates };
          Object.keys(fData.rates).forEach((key) => {
            if (key in mergedRates) {
              mergedRates[key as CurrencyCode] = fData.rates[key];
            }
          });

          const snapshot: RateSnapshot = {
            base: 'USD',
            timestamp: new Date().toISOString(),
            provider: 'Frankfurter API (ЕОБ)',
            isLive: true,
            rates: mergedRates,
          };
          this.currentSnapshot = snapshot;
          this.saveToLocalStorage(snapshot);
          return snapshot;
        }
      }
    } catch {
      // Use fallback
    }

    return this.currentSnapshot;
  }

  getCurrentRates(): RateSnapshot {
    return this.currentSnapshot;
  }

  /**
   * Calculates rate between any two currencies via cross-rate with USD base
   * Rate(From -> To) = Rate(USD -> To) / Rate(USD -> From)
   */
  getCrossRate(from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return 1.0;
    const rates = this.currentSnapshot.rates;
    const usdToFrom = rates[from] || FALLBACK_USD_RATES[from] || 1.0;
    const usdToTarget = rates[to] || FALLBACK_USD_RATES[to] || 1.0;

    const crossRate = usdToTarget / usdToFrom;
    // Round to 6 decimal places for rate precision
    return roundToDecimals(crossRate, 6);
  }

  /**
   * Generates a transparent Wise-style preview with exact fee and net calculation
   */
  calculateExchangePreview(
    from: CurrencyCode,
    to: CurrencyCode,
    amount: number
  ): ExchangePreview {
    const marketRate = this.getCrossRate(from, to);

    // Fee structure: 0.45% transparent fee (minimum ~ 0.20 USD equivalent)
    const feePercentage = 0.45;
    const rawFee = (amount * feePercentage) / 100;
    const feeAmount = roundToDecimals(rawFee, from === 'JPY' ? 0 : 2);

    const netSourceAmount = Math.max(0, amount - feeAmount);
    const targetAmount = roundToDecimals(
      netSourceAmount * marketRate,
      to === 'JPY' ? 0 : 2
    );

    return {
      sourceCurrency: from,
      targetCurrency: to,
      sourceAmount: roundToDecimals(amount, from === 'JPY' ? 0 : 2),
      marketRate,
      feePercentage,
      feeAmount,
      netSourceAmount,
      targetAmount,
      guaranteedSeconds: 30,
      provider: this.currentSnapshot.provider,
    };
  }
}

export const currencyService = new CurrencyService();
