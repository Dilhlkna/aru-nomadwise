import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { CURRENCY_LIST } from '../data/currencies';
import { formatCurrencyAmount } from '../services/currencyService';
import {
  History,
  Search,
  CheckCircle2,
  ArrowRight,
  Download,
  Receipt,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { transactions, t, language } = useApp();
  const [searchCode, setSearchCode] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = transactions.filter((tx) => {
    if (searchCode && !tx.referenceCode.toLowerCase().includes(searchCode.toLowerCase())) {
      return false;
    }
    if (
      currencyFilter !== 'ALL' &&
      tx.sourceCurrency !== currencyFilter &&
      tx.targetCurrency !== currencyFilter
    ) {
      return false;
    }
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportAsTextReceipt = (tx: Transaction) => {
    const receiptText = `
========================================
             NOMADWISE RECEIPT
========================================
Transaction ID: ${tx.referenceCode}
Timestamp: ${new Date(tx.createdAt).toLocaleString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'kk-KZ')}
Status: ${tx.status}
Type: ${tx.type}

Deducted: ${formatCurrencyAmount(tx.sourceAmount, tx.sourceCurrency)}
Credited: ${formatCurrencyAmount(tx.targetAmount, tx.targetCurrency)}
Rate: 1 ${tx.sourceCurrency} = ${tx.exchangeRate} ${tx.targetCurrency}
Fee: ${formatCurrencyAmount(tx.feeAmount, tx.sourceCurrency)} (${tx.feePercentage}%)

Security: 256-Bit SSL / MySQL ACID Transaction
Verified: NomadWise Banking Engine (Java 21)
========================================
    `;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${tx.referenceCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-md p-6 sm:p-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-[#0e2a14] dark:text-[#9fe870]" />
            {t.txHistoryTitle}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t.txHistorySubtitle}
          </p>
        </div>

        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {t.totalRecords} <span className="font-mono font-bold text-neutral-800 dark:text-white">{transactions.length}</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-5">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => {
              setSearchCode(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t.searchTxPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none"
          />
        </div>

        <div>
          <select
            value={currencyFilter}
            onChange={(e) => {
              setCurrencyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none"
          >
            <option value="ALL">{t.filterAllCurrencies}</option>
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none"
          >
            <option value="ALL">{t.filterAllTypes}</option>
            <option value="EXCHANGE">{t.typeExchange}</option>
            <option value="DEMO_DEPOSIT">{t.typeDemoDeposit}</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <th className="pb-3 pl-2">{t.thCodeAndType}</th>
              <th className="pb-3">{t.thDateTime}</th>
              <th className="pb-3">{t.thDeducted}</th>
              <th className="pb-3">{t.thCredited}</th>
              <th className="pb-3 text-right">{t.thRateAndFee}</th>
              <th className="pb-3 text-right pr-2">{t.thReceipt}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {currentItems.map((tx) => {
              const isExchange = tx.type === 'EXCHANGE';

              return (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isExchange
                            ? 'bg-[#0e2a14]/10 dark:bg-[#9fe870]/20 text-[#0e2a14] dark:text-[#9fe870]'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                        }`}
                      >
                        {isExchange ? <ArrowRight className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-mono font-semibold text-neutral-900 dark:text-white text-xs block">
                          {tx.referenceCode}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {isExchange ? t.typeExchange : t.typeDemoDeposit}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 text-xs text-neutral-600 dark:text-neutral-300">
                    {new Date(tx.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'kk-KZ')}
                  </td>

                  <td className="py-3.5 font-mono text-xs font-semibold tabular-nums">
                    {isExchange ? (
                      <span className="text-red-600 dark:text-red-400">
                        -{formatCurrencyAmount(tx.sourceAmount, tx.sourceCurrency)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 font-mono text-xs font-bold text-emerald-700 dark:text-[#9fe870] tabular-nums">
                    +{formatCurrencyAmount(tx.targetAmount, tx.targetCurrency)}
                  </td>

                  <td className="py-3.5 text-right font-mono text-xs text-neutral-600 dark:text-neutral-300 tabular-nums">
                    {isExchange ? (
                      <>
                        <div className="font-medium">{tx.exchangeRate.toFixed(4)}</div>
                        <div className="text-[10px] text-neutral-400">
                          {formatCurrencyAmount(tx.feeAmount, tx.sourceCurrency)}
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] text-neutral-400">0.00</span>
                    )}
                  </td>

                  <td className="py-3.5 text-right pr-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
                      title="Receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="text-neutral-500">
            {currentPage} / {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0e2a14] dark:text-[#9fe870]" />
                <h3 className="text-base font-bold">
                  Receipt #{selectedTx.referenceCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.thDeducted}:</span>
                <span className="font-mono font-bold">
                  {formatCurrencyAmount(selectedTx.sourceAmount, selectedTx.sourceCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.thCredited}:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-[#9fe870]">
                  {formatCurrencyAmount(selectedTx.targetAmount, selectedTx.targetCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.thRateAndFee}:</span>
                <span className="font-mono">
                  1 {selectedTx.sourceCurrency} = {selectedTx.exchangeRate} {selectedTx.targetCurrency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => exportAsTextReceipt(selectedTx)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {t.btnDownloadReceipt}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="py-2.5 px-5 rounded-xl bg-[#0e2a14] dark:bg-[#9fe870] text-[#9fe870] dark:text-[#0e2a14] text-xs font-bold"
              >
                {t.btnClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
