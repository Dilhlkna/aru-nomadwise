import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet } from '../types';
import { formatCurrencyAmount } from '../services/currencyService';
import { CURRENCIES } from '../data/currencies';
import { X, PlusCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoTopUpModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DemoTopUpModal: React.FC<DemoTopUpModalProps> = ({
  wallet,
  isOpen,
  onClose,
}) => {
  const { addDemoFunds, t, language } = useApp();
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !wallet) return null;

  const currency = CURRENCIES[wallet.currencyCode] || {
    symbol: wallet.currencyCode,
    nameKz: wallet.currencyCode,
    nameRu: wallet.currencyCode,
    nameEn: wallet.currencyCode,
  };

  const currencyName =
    language === 'ru' ? currency.nameRu : language === 'en' ? currency.nameEn : currency.nameKz;

  const presets =
    wallet.currencyCode === 'KZT'
      ? [20000, 50000, 100000, 250000]
      : wallet.currencyCode === 'RUB'
      ? [5000, 10000, 25000, 50000]
      : [50, 100, 250, 500];

  const handleTopUp = (amountToAdd: number) => {
    if (amountToAdd <= 0) return;
    addDemoFunds(wallet.id, amountToAdd);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-700 dark:text-[#9fe870]" />
            <h3 className="text-base font-bold">
              {t.topUpTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#9fe870] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold">
              {t.topUpSuccess}
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-400 block">{t.cardVirtualWallet}</span>
                <strong className="text-sm">
                  {currencyName} ({wallet.currencyCode})
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">{t.cardAvailableBalance}</span>
                <strong className="font-mono text-emerald-800 dark:text-[#9fe870] text-sm tabular-nums">
                  {formatCurrencyAmount(wallet.balance, wallet.currencyCode)}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                {t.topUpExamNotice}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                {t.selectPresetAmount}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleTopUp(amt)}
                    className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#0e2a14] dark:hover:border-[#9fe870] hover:bg-[#0e2a14]/5 dark:hover:bg-[#9fe870]/10 font-mono font-bold text-xs transition-all active:scale-95"
                  >
                    +{formatCurrencyAmount(amt, wallet.currencyCode)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {t.orCustomAmount}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="50000"
                  className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent font-mono font-bold outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleTopUp(parseFloat(customAmount) || 0)}
                  className="px-4 py-2 rounded-xl bg-[#0e2a14] dark:bg-[#9fe870] text-[#9fe870] dark:text-[#0e2a14] font-bold text-xs hover:bg-[#183d1e] transition-colors"
                >
                  {t.btnAddFunds}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
