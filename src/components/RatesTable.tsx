import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CurrencyCode } from '../types';
import { CURRENCIES, CURRENCY_LIST } from '../data/currencies';
import { currencyService } from '../services/currencyService';
import {
  Search,
  RefreshCw,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface RatesTableProps {
  onSelectPair?: (from: CurrencyCode, to: CurrencyCode) => void;
}

export const RatesTable: React.FC<RatesTableProps> = ({ onSelectPair }) => {
  const { ratesSnapshot, refreshRates, isRatesLoading, setActiveTab, t, language } = useApp();
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>('USD');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCurrencies = CURRENCY_LIST.filter((c) => {
    if (c.code === baseCurrency) return false;
    const q = searchQuery.toLowerCase();
    const name = language === 'ru' ? c.nameRu : language === 'en' ? c.nameEn : c.nameKz;
    return (
      c.code.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    );
  });

  const handleExchangeClick = (targetCode: CurrencyCode) => {
    if (onSelectPair) {
      onSelectPair(baseCurrency, targetCode);
    } else {
      setActiveTab('exchange');
    }
  };

  const formattedDate = new Date(ratesSnapshot.timestamp).toLocaleTimeString(
    language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'kk-KZ',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-md p-6 sm:p-8 transition-colors">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            {t.ratesTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{t.ratesLastUpdated} {formattedDate}</span>
            <span>·</span>
            <span className="text-emerald-700 dark:text-[#9fe870] font-medium">{ratesSnapshot.provider}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refreshRates}
            disabled={isRatesLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRatesLoading ? 'animate-spin' : ''}`} />
            <span>{t.btnRefresh}</span>
          </button>
        </div>
      </div>

      {/* Filter and Base currency selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-5">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-x-auto">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 px-2.5 font-medium whitespace-nowrap">
            {t.baseCurrencyLabel}
          </span>
          {(['USD', 'KZT', 'EUR', 'GBP'] as CurrencyCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setBaseCurrency(code)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                baseCurrency === code
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {CURRENCIES[code].flag} {code}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCurrencyPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
          />
        </div>
      </div>

      {/* Rates Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <th className="pb-3 pl-2">{t.thCurrency}</th>
              <th className="pb-3 text-right">
                1 {baseCurrency} {t.thRate}
              </th>
              <th className="pb-3 text-right hidden sm:table-cell">{t.thInverseRate}</th>
              <th className="pb-3 text-right pr-2">{t.thAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredCurrencies.map((currency) => {
              const forwardRate = currencyService.getCrossRate(baseCurrency, currency.code);
              const inverseRate = currencyService.getCrossRate(currency.code, baseCurrency);
              const currName =
                language === 'ru' ? currency.nameRu : language === 'en' ? currency.nameEn : currency.nameKz;

              return (
                <tr
                  key={currency.code}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/60 transition-colors group"
                >
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" role="img" aria-label={currName}>
                        {currency.flag}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {currency.code}
                          </span>
                          <span className="text-xs text-neutral-400">
                            ({currency.symbol})
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {currName} · {currency.country}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                    {forwardRate.toLocaleString('kk-KZ', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      {currency.symbol}
                    </span>
                  </td>

                  <td className="py-3.5 text-right font-mono text-xs text-neutral-500 dark:text-neutral-400 tabular-nums hidden sm:table-cell">
                    1 {currency.code} ={' '}
                    {inverseRate.toLocaleString('kk-KZ', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}{' '}
                    {CURRENCIES[baseCurrency].symbol}
                  </td>

                  <td className="py-3.5 text-right pr-2">
                    <button
                      type="button"
                      onClick={() => handleExchangeClick(currency.code)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0e2a14] dark:text-[#9fe870] bg-[#9fe870]/25 dark:bg-[#9fe870]/15 hover:bg-[#9fe870]/40 transition-colors"
                    >
                      <span>{t.cardActionExchange}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
