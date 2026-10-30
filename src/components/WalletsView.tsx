import React from 'react';
import { useApp } from '../context/AppContext';
import { VirtualCard } from './VirtualCard';
import { Wallet } from '../types';
import { formatCurrencyAmount, currencyService, roundToDecimals } from '../services/currencyService';
import {
  CreditCard,
  Plus,
  ArrowLeftRight,
  Wallet as WalletIcon,
} from 'lucide-react';

interface WalletsViewProps {
  onOpenNewWallet: () => void;
  onOpenDemoTopUp: (wallet: Wallet) => void;
  onOpenExchangeForWallet: (wallet: Wallet) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({
  onOpenNewWallet,
  onOpenDemoTopUp,
  onOpenExchangeForWallet,
}) => {
  const { user, wallets, toggleFreezeWallet, setActiveTab, t } = useApp();

  const preferredCode = user?.preferredCurrency || 'KZT';
  const totalNetWorth = wallets.reduce((acc, w) => {
    const rateToPreferred = currencyService.getCrossRate(w.currencyCode, preferredCode);
    return acc + w.balance * rateToPreferred;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner: Total Portfolio Balance */}
      <div className="bg-[#0e2a14] dark:bg-[#07190b] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-[#1b4322] dark:border-neutral-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-300 mb-1">
              <WalletIcon className="w-4 h-4 text-[#9fe870]" />
              <span>{t.walletsTotalPortfolio} ({preferredCode})</span>
            </div>

            <div className="text-3xl sm:text-5xl font-extrabold font-mono tracking-tight text-white tabular-nums">
              {formatCurrencyAmount(
                roundToDecimals(totalNetWorth, preferredCode === 'JPY' ? 0 : 2),
                preferredCode
              )}
            </div>

            <p className="text-xs text-neutral-300 mt-2">
              {wallets.length} {t.activeWalletsCount}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenNewWallet}
              className="px-5 py-3 rounded-2xl bg-[#9fe870] hover:bg-[#b0f385] text-[#0e2a14] font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t.btnAddNewWallet}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exchange')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#9fe870]" />
              <span>{t.btnExchangeHeader}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0e2a14] dark:text-[#9fe870]" />
              {t.yourCardsTitle}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.yourCardsSubtitle}
            </p>
          </div>

          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {wallets.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <VirtualCard
              key={wallet.id}
              wallet={wallet}
              onExchangeClick={(w) => onOpenExchangeForWallet(w)}
              onTopUpDemo={(w) => onOpenDemoTopUp(w)}
              onToggleFreeze={(id) => toggleFreezeWallet(id)}
            />
          ))}

          {/* Add Wallet Placeholder card */}
          <button
            type="button"
            onClick={onOpenNewWallet}
            className="aspect-[1.586/1] w-full rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#0e2a14] dark:hover:border-[#9fe870] bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-all flex flex-col items-center justify-center p-6 text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-700 group-hover:bg-[#0e2a14] dark:group-hover:bg-[#9fe870] text-neutral-500 group-hover:text-[#9fe870] dark:group-hover:text-[#0e2a14] flex items-center justify-center transition-colors mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <strong className="text-sm font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white">
              {t.addNewWalletCardPlaceholder}
            </strong>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-[200px]">
              {t.addNewWalletCardDesc}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
