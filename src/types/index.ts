export type CurrencyCode =
  | 'KZT'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'RUB'
  | 'CNY'
  | 'AED'
  | 'TRY'
  | 'JPY'
  | 'CHF'
  | 'CAD';

export type Language = 'kk' | 'ru' | 'en';
export type Theme = 'light' | 'dark';

export interface Currency {
  code: CurrencyCode;
  nameKz: string;
  nameRu: string;
  nameEn: string;
  symbol: string;
  flag: string;
  country: string;
  isPopular: boolean;
  decimalPlaces: number;
}

export type CardTheme =
  | 'forest'
  | 'emerald'
  | 'graphite'
  | 'navy'
  | 'burgundy'
  | 'copper';

export interface Wallet {
  id: string;
  userId: string;
  currencyCode: CurrencyCode;
  balance: number; // Stored and displayed with BigDecimal precision
  cardholderName: string;
  virtualCardNumber: string;
  expiryDate: string;
  cvv?: string; // 3-digit CVV for demo/exam representation
  isFrozen: boolean;
  cardTheme: CardTheme;
  createdAt: string;
  isExternal?: boolean;
}

export type TransactionType = 'EXCHANGE' | 'DEMO_DEPOSIT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'REJECTED';

export interface Transaction {
  id: string;
  referenceCode: string;
  userId: string;
  type: TransactionType;
  sourceWalletId?: string;
  targetWalletId?: string;
  sourceCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  sourceAmount: number;
  targetAmount: number;
  exchangeRate: number;
  feeAmount: number;
  feePercentage: number;
  status: TransactionStatus;
  createdAt: string;
  description: string;
}

export interface ExchangePreview {
  sourceCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  sourceAmount: number;
  marketRate: number;
  feePercentage: number;
  feeAmount: number;
  netSourceAmount: number;
  targetAmount: number;
  guaranteedSeconds: number;
  provider: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  preferredCurrency: CurrencyCode;
  joinedDate: string;
  isDemoUser: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface RateSnapshot {
  base: CurrencyCode;
  timestamp: string;
  provider: string;
  isLive: boolean;
  rates: Record<CurrencyCode, number>;
}

