import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CurrencyCode, Transaction } from '../types';
import { CURRENCY_LIST } from '../data/currencies';
import { currencyService, formatCurrencyAmount, roundToDecimals } from '../services/currencyService';
import {
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  Receipt,
} from 'lucide-react';

interface ExchangeWidgetProps {
  initialSourceCurrency?: CurrencyCode;
  initialTargetCurrency?: CurrencyCode;
  isStandalone?: boolean;
}

export const ExchangeWidget: React.FC<ExchangeWidgetProps> = ({
  initialSourceCurrency = 'USD',
  initialTargetCurrency = 'KZT',
}) => {
  const {
    isAuthenticated,
    wallets,
    executeExchange,
    setActiveTab,
    createWallet,
    t,
    language,
  } = useApp();

  const [sourceCode, setSourceCode] = useState<CurrencyCode>(initialSourceCurrency);
  const [targetCode, setTargetCode] = useState<CurrencyCode>(initialTargetCurrency);
  const [amountStr, setAmountStr] = useState<string>('100');
  const [guaranteeSeconds, setGuaranteeSeconds] = useState<number>(30);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [lastSuccessTx, setLastSuccessTx] = useState<Transaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setGuaranteeSeconds((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parsedAmount = Math.max(0, parseFloat(amountStr) || 0);

  const sourceWallet = wallets.find((w) => w.currencyCode === sourceCode);
  const targetWallet = wallets.find((w) => w.currencyCode === targetCode);

  const preview = currencyService.calculateExchangePreview(
    sourceCode,
    targetCode,
    parsedAmount
  );

  const swapCurrencies = () => {
    const temp = sourceCode;
    setSourceCode(targetCode);
    setTargetCode(temp);
    setErrorMessage(null);
  };

  const setPresetPercentage = (pct: number) => {
    if (!sourceWallet) return;
    const calc = (sourceWallet.balance * pct) / 100;
    setAmountStr(String(roundToDecimals(calc, sourceCode === 'JPY' ? 0 : 2)));
    setErrorMessage(null);
  };

  const handleExchangeSubmit = () => {
    setErrorMessage(null);

    if (!isAuthenticated) {
      setErrorMessage(
        language === 'ru'
          ? 'Для обмена валюты, пожалуйста, войдите в систему или зарегистрируйтесь.'
          : language === 'en'
          ? 'Please sign in or register to execute currency exchange.'
          : 'Айырбастау жасау үшін алдымен жүйеге кіріңіз немесе тіркеліңіз.'
      );
      return;
    }

    if (parsedAmount <= 0) {
      setErrorMessage(
        language === 'ru'
          ? 'Сумма обмена должна быть больше нуля.'
          : language === 'en'
          ? 'Exchange amount must be greater than zero.'
          : 'Айырбастау сомасы нөлден үлкен болуы тиіс.'
      );
      return;
    }

    if (sourceCode === targetCode) {
      setErrorMessage(
        language === 'ru'
          ? 'Исходная и целевая валюты должны отличаться.'
          : language === 'en'
          ? 'Source and target currencies must be different.'
          : 'Бастапқы және мақсатты валюталар әртүрлі болуы керек.'
      );
      return;
    }

    if (!sourceWallet) {
      setErrorMessage(
        language === 'ru'
          ? `У вас еще нет кошелька ${sourceCode}. Сначала создайте его.`
          : language === 'en'
          ? `You don't have a ${sourceCode} wallet yet. Please create it first.`
          : `Сізде әлі ${sourceCode} әмияны жоқ. Алдымен әмиян жасаңыз.`
      );
      return;
    }

    if (sourceWallet.balance < parsedAmount) {
      setErrorMessage(
        language === 'ru'
          ? `Недостаточно средств. Доступно: ${formatCurrencyAmount(sourceWallet.balance, sourceCode)}`
          : language === 'en'
          ? `Insufficient funds. Available: ${formatCurrencyAmount(sourceWallet.balance, sourceCode)}`
          : `Баланс жеткіліксіз. Қолжетімді: ${formatCurrencyAmount(sourceWallet.balance, sourceCode)}`
      );
      return;
    }

    if (sourceWallet.isFrozen) {
      setErrorMessage(
        language === 'ru'
          ? `Кошелек ${sourceCode} заблокирован.`
          : language === 'en'
          ? `${sourceCode} wallet is frozen.`
          : `${sourceCode} әмияны бұғатталған. Операция тоқтатылды.`
      );
      return;
    }

    // Если кошелька целевой валюты нет, он создаётся при подтверждении (confirmAndExecute)
    setIsConfirmModalOpen(true);
  };

  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const confirmAndExecute = async () => {
    if (!sourceWallet || isExecuting) return;
    setIsExecuting(true);
    try {
      let currentTarget = wallets.find((w) => w.currencyCode === targetCode);
      if (!currentTarget) {
        currentTarget = await createWallet(targetCode, 'forest');
      }

      const result = await executeExchange(sourceWallet.id, currentTarget.id, parsedAmount);
      if (result.success && result.transaction) {
        setLastSuccessTx(result.transaction);
      } else {
        setErrorMessage(result.message);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Серверлік қате. Қайталап көріңіз.');
    } finally {
      setIsExecuting(false);
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl p-6 sm:p-8 max-w-xl mx-auto transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800 mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t.exchangeTitle}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.exchangeSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-[#9fe870]" />
          <span className="font-mono tabular-nums">{guaranteeSeconds}s</span>
          <span className="text-[11px] text-neutral-400">{t.guaranteedSec}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: You Send */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <span>{t.youSend}</span>
          {sourceWallet && (
            <span className="text-neutral-500">
              {t.availableBalance}:{' '}
              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                {formatCurrencyAmount(sourceWallet.balance, sourceCode)}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <input
            type="number"
            min="0"
            step="any"
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="0.00"
            className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white outline-none tabular-nums placeholder:text-neutral-300"
          />

          <div className="relative shrink-0">
            <select
              value={sourceCode}
              onChange={(e) => {
                setSourceCode(e.target.value as CurrencyCode);
                setErrorMessage(null);
              }}
              className="appearance-none flex items-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm font-bold py-2 pl-3 pr-8 rounded-xl cursor-pointer"
            >
              {CURRENCY_LIST.map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-neutral-900">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {sourceWallet && sourceWallet.balance > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-400">{t.quickSelect}</span>
            {[25, 50, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setPresetPercentage(pct)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                {pct === 100 ? t.all : `${pct}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div className="relative py-4 pl-6 my-2 border-l-2 border-dashed border-neutral-200 dark:border-neutral-700 ml-4 space-y-2 text-xs">
        <button
          type="button"
          onClick={swapCurrencies}
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0e2a14] dark:bg-[#9fe870] text-white dark:text-[#0e2a14] flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          title="Swap"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{t.commission} ({preview.feePercentage}%):</span>
          </div>
          <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
            {formatCurrencyAmount(preview.feeAmount, sourceCode)}
          </span>
        </div>

        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span>{t.netConvertedAmount}</span>
          </div>
          <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200 tabular-nums">
            {formatCurrencyAmount(preview.netSourceAmount, sourceCode)}
          </span>
        </div>

        <div className="flex items-center justify-between text-neutral-900 dark:text-white font-semibold pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0e2a14] dark:bg-[#9fe870]" />
            <span>{t.marketRate}</span>
          </div>
          <span className="font-mono tabular-nums text-emerald-800 dark:text-[#9fe870] bg-emerald-50 dark:bg-[#9fe870]/10 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">
            1 {sourceCode} = {preview.marketRate} {targetCode}
          </span>
        </div>
      </div>

      {/* Step 2: You Receive */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <span>{t.youReceive}</span>
          {targetWallet && (
            <span className="text-neutral-500">
              {t.availableBalance}:{' '}
              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                {formatCurrencyAmount(targetWallet.balance, targetCode)}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="w-full text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-950 dark:text-[#9fe870] tabular-nums py-0.5">
            {formatCurrencyAmount(preview.targetAmount, targetCode, false)}
          </div>

          <div className="relative shrink-0">
            <select
              value={targetCode}
              onChange={(e) => {
                setTargetCode(e.target.value as CurrencyCode);
                setErrorMessage(null);
              }}
              className="appearance-none flex items-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm font-bold py-2 pl-3 pr-8 rounded-xl cursor-pointer"
            >
              {CURRENCY_LIST.map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-neutral-900">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-6 pt-2">
        <button
          type="button"
          onClick={handleExchangeSubmit}
          className="w-full py-4 px-6 rounded-2xl bg-[#0e2a14] hover:bg-[#183d1e] dark:bg-[#9fe870] dark:hover:bg-[#b0f385] text-[#9fe870] dark:text-[#0e2a14] font-bold text-base shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>{t.btnExchangeNow}</span>
        </button>

        <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#9fe870]" />
            {t.securityEncrypted}
          </span>
          <span>·</span>
          <span>{t.securityAcid}</span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0e2a14] dark:text-[#9fe870]" />
                {t.modalConfirmTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">{t.modalDeduct}</span>
                  <span className="font-mono font-bold text-red-600 tabular-nums">
                    -{formatCurrencyAmount(parsedAmount, sourceCode)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">{t.commission} (0.45%):</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrencyAmount(preview.feeAmount, sourceCode)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700 text-xs">
                  <span className="font-semibold">{t.modalCredit}</span>
                  <span className="font-mono font-extrabold text-emerald-700 dark:text-[#9fe870] text-base tabular-nums">
                    +{formatCurrencyAmount(preview.targetAmount, targetCode)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                <p>
                  <strong>{t.modalAppliedRate}</strong> 1 {sourceCode} = {preview.marketRate} {targetCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs"
              >
                {t.modalCancel}
              </button>
              <button
                type="button"
                onClick={confirmAndExecute}
                disabled={isExecuting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0e2a14] hover:bg-[#183d1e] dark:bg-[#9fe870] dark:hover:bg-[#b0f385] text-[#9fe870] dark:text-[#0e2a14] font-bold text-xs shadow-md"
              >
                {t.modalConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {lastSuccessTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold mb-1">
              {t.txSuccessTitle}
            </h3>
            <p className="text-xs text-neutral-500 mb-5 font-mono">
              ID: {lastSuccessTx.referenceCode}
            </p>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.thDeducted}:</span>
                <span className="font-mono font-bold tabular-nums">
                  {formatCurrencyAmount(lastSuccessTx.sourceAmount, lastSuccessTx.sourceCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.thCredited}:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-[#9fe870] tabular-nums">
                  {formatCurrencyAmount(lastSuccessTx.targetAmount, lastSuccessTx.targetCurrency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLastSuccessTx(null);
                  setActiveTab('transactions');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
              >
                {t.viewHistory}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLastSuccessTx(null);
                  setActiveTab('wallets');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0e2a14] text-[#9fe870] dark:bg-[#9fe870] dark:text-[#0e2a14] text-xs font-bold"
              >
                {t.goToWallets}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
