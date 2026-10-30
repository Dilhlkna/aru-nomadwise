import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CurrencyCode, CardTheme } from '../types';
import { CURRENCY_LIST } from '../data/currencies';
import {
  X,
  CreditCard,
  Check,
  Sparkles,
  ShieldAlert,
  Lock,
  Layers,
} from 'lucide-react';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { id: CardTheme; nameKz: string; nameRu: string; nameEn: string; bgClass: string }[] = [
  { id: 'forest', nameKz: 'Орман Жасылы (Wise)', nameRu: 'Лесной Зеленый (Wise)', nameEn: 'Forest Green (Wise)', bgClass: 'bg-[#0c2411]' },
  { id: 'emerald', nameKz: 'Жақұтты Изумруд', nameRu: 'Изумрудный', nameEn: 'Emerald Gold', bgClass: 'bg-[#047857]' },
  { id: 'graphite', nameKz: 'Қою Графит', nameRu: 'Темный Графит', nameEn: 'Graphite Titanium', bgClass: 'bg-[#1e293b]' },
  { id: 'navy', nameKz: 'Түнгі Сапфир', nameRu: 'Полуночный Сапфир', nameEn: 'Midnight Navy', bgClass: 'bg-[#1e3a8a]' },
  { id: 'burgundy', nameKz: 'Патшалық Шие', nameRu: 'Бордовый Бархат', nameEn: 'Royal Burgundy', bgClass: 'bg-[#701a75]' },
  { id: 'copper', nameKz: 'Мыс Жез', nameRu: 'Медный Бронзовый', nameEn: 'Copper Bronze', bgClass: 'bg-[#7c2d12]' },
];

export const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wallets, createWallet, setActiveTab, t, language, user } = useApp();
  const [modeTab, setModeTab] = useState<'generate' | 'custom'>('custom');

  // Form states
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('forest');

  // Custom card credentials
  const [cardNumber, setCardNumber] = useState<string>('4400 8921 4410 7829');
  const [cardHolder, setCardHolder] = useState<string>(user?.fullName || 'ARMAN SERIKULY');
  const [expiryDate, setExpiryDate] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('742');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const existingCodes = wallets.map((w) => w.currencyCode);

  // Auto-format card number with spaces (xxxx xxxx xxxx xxxx)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  // Auto-format expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiryDate(raw);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (modeTab === 'custom') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 12) {
        setError(
          language === 'ru'
            ? 'Номер карты должен содержать от 12 до 16 цифр.'
            : language === 'en'
            ? 'Card number must be 12 to 16 digits.'
            : 'Карта нөмірі 12-ден 16-ға дейінгі саннан тұруы керек.'
        );
        return;
      }

      if (!cardHolder.trim()) {
        setError(
          language === 'ru'
            ? 'Укажите имя держателя карты.'
            : language === 'en'
            ? 'Please specify cardholder name.'
            : 'Карта ұстаушының аты-жөнін жазыңыз.'
        );
        return;
      }

      if (cvv.length < 3) {
        setError(
          language === 'ru'
            ? 'CVV должен состоять из 3 цифр.'
            : language === 'en'
            ? 'CVV must be 3 digits.'
            : 'CVV коды 3 саннан тұруы тиіс.'
        );
        return;
      }

      await createWallet({
        currencyCode: selectedCurrency,
        cardTheme: selectedTheme,
        customNumber: cardNumber,
        customHolder: cardHolder,
        customExpiry: expiryDate || '12/28',
        customCvv: cvv,
        isExternal: true,
      });
    } else {
      await createWallet({
        currencyCode: selectedCurrency,
        cardTheme: selectedTheme,
        isExternal: false,
      });
    }

    onClose();
    setActiveTab('wallets');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0e2a14] dark:text-[#9fe870]" />
            <h3 className="text-base sm:text-lg font-bold">
              {t.addCardModalTitle}
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

        {/* Tab switcher: Generate vs Custom credentials */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setModeTab('custom');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              modeTab === 'custom'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {t.tabBindCustomCard}
          </button>
          <button
            type="button"
            onClick={() => {
              setModeTab('generate');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              modeTab === 'generate'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {t.tabGenerateVirtual}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          
          {/* Currency Selection */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t.selectCurrencyLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              {CURRENCY_LIST.map((c) => {
                const isSelected = selectedCurrency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCurrency(c.code)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-[#0e2a14] dark:border-[#9fe870] bg-[#0e2a14]/5 dark:bg-[#9fe870]/10 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="text-xs">{c.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Card Credentials Form (if modeTab === 'custom') */}
          {modeTab === 'custom' && (
            <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              
              {/* Card Number */}
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.cardNumberLabel}
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4400 1234 5678 9012"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-sm tracking-wider font-bold outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                />
              </div>

              {/* Cardholder name */}
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.cardholderNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="ARMAN SERIKULY"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 uppercase font-mono text-xs font-semibold outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                />
              </div>

              {/* Expiry and CVV Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.cardExpiryLabel}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="12/28"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-center text-xs font-bold outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.cardCvvLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={3}
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-center text-xs font-bold tracking-widest outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Theme Selector */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t.cardThemeLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                const themeName =
                  language === 'ru' ? theme.nameRu : language === 'en' ? theme.nameEn : theme.nameKz;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-[#0e2a14] dark:border-[#9fe870] ring-2 ring-[#0e2a14]/20 dark:ring-[#9fe870]/20'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <div className={`w-full h-6 rounded-lg ${theme.bgClass} flex items-center justify-center text-white`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-[10px] text-neutral-700 dark:text-neutral-300 truncate w-full">
                      {themeName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CRITICAL EXAM WARNING: Small red text in brackets as requested by user */}
          <div className="pt-2 px-1">
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium italic text-center leading-relaxed">
              *{t.examNoticeRed}*
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0e2a14] hover:bg-[#183d1e] dark:bg-[#9fe870] dark:hover:bg-[#b0f385] text-[#9fe870] dark:text-[#0e2a14] font-bold shadow-md transition-all active:scale-95"
            >
              {t.btnCreateCard}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
