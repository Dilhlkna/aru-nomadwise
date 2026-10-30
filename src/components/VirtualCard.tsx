import React, { useState } from 'react';
import { Wallet, CardTheme } from '../types';
import { CURRENCIES } from '../data/currencies';
import { formatCurrencyAmount } from '../services/currencyService';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  Copy,
  Check,
  Lock,
  Unlock,
  ArrowLeftRight,
  PlusCircle,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';

interface VirtualCardProps {
  wallet: Wallet;
  onExchangeClick?: (wallet: Wallet) => void;
  onTopUpDemo?: (wallet: Wallet) => void;
  onToggleFreeze?: (walletId: string) => void;
}

const THEME_STYLES: Record<CardTheme, { bg: string; text: string; subtext: string; chip: string }> = {
  forest: {
    bg: 'bg-gradient-to-br from-[#0c2411] via-[#143d1c] to-[#08180b]',
    text: 'text-white',
    subtext: 'text-emerald-200/70',
    chip: 'bg-amber-300/80 border-amber-400',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22]',
    text: 'text-white',
    subtext: 'text-emerald-100/70',
    chip: 'bg-amber-200/80 border-amber-300',
  },
  graphite: {
    bg: 'bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617]',
    text: 'text-white',
    subtext: 'text-slate-400',
    chip: 'bg-slate-300 border-slate-400',
  },
  navy: {
    bg: 'bg-gradient-to-br from-[#1e3a8a] via-[#172554] to-[#0f172a]',
    text: 'text-white',
    subtext: 'text-blue-200/70',
    chip: 'bg-amber-300/80 border-amber-400',
  },
  burgundy: {
    bg: 'bg-gradient-to-br from-[#701a75] via-[#4a044e] to-[#2e0854]',
    text: 'text-white',
    subtext: 'text-fuchsia-200/70',
    chip: 'bg-amber-200 border-amber-300',
  },
  copper: {
    bg: 'bg-gradient-to-br from-[#7c2d12] via-[#9a3412] to-[#431407]',
    text: 'text-white',
    subtext: 'text-orange-200/70',
    chip: 'bg-amber-100 border-amber-200',
  },
};

export const VirtualCard: React.FC<VirtualCardProps> = ({
  wallet,
  onExchangeClick,
  onTopUpDemo,
  onToggleFreeze,
}) => {
  const { t, language } = useApp();
  const [copied, setCopied] = useState(false);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  const currency = CURRENCIES[wallet.currencyCode] || {
    nameKz: wallet.currencyCode,
    nameRu: wallet.currencyCode,
    nameEn: wallet.currencyCode,
    symbol: wallet.currencyCode,
    flag: '🌐',
  };

  const currencyName =
    language === 'ru' ? currency.nameRu : language === 'en' ? currency.nameEn : currency.nameKz;

  const theme = THEME_STYLES[wallet.cardTheme] || THEME_STYLES.forest;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.virtualCardNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayCardNumber = showFullNumber
    ? wallet.virtualCardNumber
    : `${wallet.virtualCardNumber.slice(0, 4)} •••• •••• ${wallet.virtualCardNumber.slice(-4)}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Visual Card Object */}
      <div
        className={`relative aspect-[1.586/1] w-full rounded-2xl p-5 shadow-lg border border-white/10 ${theme.bg} ${theme.text} flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 select-none`}
      >
        {/* Subtle patterned watermark background */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 top-6 text-7xl font-extrabold text-white/5 select-none pointer-events-none">
          {wallet.currencyCode}
        </div>

        {/* Card Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={currencyName}>
              {currency.flag}
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase opacity-90 truncate max-w-[140px]">
                {currencyName}
              </p>
              <p className={`text-[11px] ${theme.subtext}`}>{t.cardVirtualWallet}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 opacity-75 rotate-90" />
            <span className="text-xs font-bold tracking-tight text-[#9fe870]">
              NomadWise
            </span>
          </div>
        </div>

        {/* EMV Chip & Balance */}
        <div className="relative z-10 my-1">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-9 h-7 rounded-md border ${theme.chip} flex items-center justify-center shadow-inner`}>
              <div className="w-6 h-4 border-t border-b border-black/20 flex flex-col justify-between" />
            </div>

            {wallet.isFrozen && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-red-950/80 text-red-200 border border-red-700/50 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" /> {t.cardFrozen}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <span className={`text-[11px] ${theme.subtext}`}>{t.cardAvailableBalance}</span>
            <span className="text-2xl font-bold font-mono tracking-tight tabular-nums">
              {formatCurrencyAmount(wallet.balance, wallet.currencyCode)}
            </span>
          </div>
        </div>

        {/* Card Footer: Number, CVV & Expiry */}
        <div className="relative z-10 flex items-end justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-wider tabular-nums">
                {displayCardNumber}
              </span>
              <button
                type="button"
                onClick={() => setShowFullNumber(!showFullNumber)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
                title={showFullNumber ? 'Hide' : 'Show'}
              >
                {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
                title="Copy"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#9fe870]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-[10px] tracking-wider uppercase opacity-80">
                {wallet.cardholderName}
              </p>
              {wallet.cvv && (
                <div className="flex items-center gap-1 text-[10px] opacity-80">
                  <span>CVV:</span>
                  <span className="font-mono font-bold">
                    {showCvv ? wallet.cvv : '•••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="hover:opacity-100"
                  >
                    {showCvv ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[9px] uppercase ${theme.subtext}`}>{t.cardExpires}</span>
            <p className="font-mono text-xs font-semibold tabular-nums">
              {wallet.expiryDate}
            </p>
          </div>
        </div>
      </div>

      {/* Card Quick Actions */}
      <div className="flex items-center gap-2 pt-1">
        {onExchangeClick && (
          <button
            type="button"
            disabled={wallet.isFrozen}
            onClick={() => onExchangeClick(wallet)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#0e2a14] dark:text-[#9fe870]" />
            {t.cardActionExchange}
          </button>
        )}

        {onTopUpDemo && (
          <button
            type="button"
            disabled={wallet.isFrozen}
            onClick={() => onTopUpDemo(wallet)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#0e2a14]/5 dark:bg-[#9fe870]/10 hover:bg-[#0e2a14]/10 dark:hover:bg-[#9fe870]/20 text-[#0e2a14] dark:text-[#9fe870] text-xs font-semibold border border-[#0e2a14]/15 dark:border-[#9fe870]/30 transition-colors disabled:opacity-50"
            title="Demo funds"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-[#9fe870]" />
            {t.cardActionTopUp}
          </button>
        )}

        {onToggleFreeze && (
          <button
            type="button"
            onClick={() => onToggleFreeze(wallet.id)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              wallet.isFrozen
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900 hover:bg-amber-100'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
            }`}
            title={wallet.isFrozen ? t.cardActionUnfreeze : t.cardActionFreeze}
          >
            {wallet.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
