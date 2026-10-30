import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCY_LIST } from '../data/currencies';
import { CurrencyCode } from '../types';
import {
  User,
  Phone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  UserPlus,
  ArrowRightLeft,
} from 'lucide-react';

interface UserProfileProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onOpenAuth }) => {
  const {
    user,
    allUsers,
    switchUser,
    updateProfile,
    wallets,
    transactions,
    language,
    t,
  } = useApp();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '+7 (701) 450-88-21');
  const [country, setCountry] = useState(user?.country || 'Қазақстан');
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(
    user?.preferredCurrency || 'KZT'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Keep state in sync if active user changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
      setCountry(user.country || 'Қазақстан');
      setPreferredCurrency(user.preferredCurrency || 'KZT');
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">
          {language === 'ru' ? 'Вы находитесь в гостевом режиме' : language === 'en' ? 'You are in Guest Mode' : 'Сіз қонақ режиміндесіз'}
        </h3>
        <p className="text-xs text-neutral-500 mb-6">
          {language === 'ru'
            ? 'Войдите в существующий аккаунт или зарегистрируйте новый, чтобы управлять виртуальными картами.'
            : language === 'en'
            ? 'Sign in to an existing account or register a new one to manage virtual multi-currency cards.'
            : 'Виртуалды валюталық карталарды басқару үшін жүйеге кіріңіз немесе жаңадан тіркеліңіз.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => onOpenAuth?.('login')}
            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold"
          >
            {t.loginBtn}
          </button>
          <button
            onClick={() => onOpenAuth?.('register')}
            className="px-4 py-2 bg-[#9fe870] text-[#0e2a14] rounded-xl text-xs font-bold"
          >
            {t.registerBtn}
          </button>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      phone,
      country,
      preferredCurrency,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isRu = language === 'ru';
  const isEn = language === 'en';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-colors">
        <div className="w-20 h-20 rounded-2xl bg-[#0e2a14] dark:bg-[#9fe870] text-[#9fe870] dark:text-[#0e2a14] font-bold text-3xl flex items-center justify-center shadow-md shrink-0">
          {user.fullName.charAt(0)}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              {user.fullName}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-medium inline-block self-center sm:self-auto">
              {isRu ? 'Верифицированный аккаунт' : isEn ? 'Verified Account' : 'Верификацияланған аккаунт'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              {new Date(user.joinedDate).toLocaleDateString(isEn ? 'en-US' : isRu ? 'ru-RU' : 'kk-KZ')}
            </span>
            <span>·</span>
            <span>{wallets.length} {isRu ? 'кошельков' : isEn ? 'wallets' : 'әмиян'}</span>
            <span>·</span>
            <span>{transactions.length} {isRu ? 'транзакций' : isEn ? 'transactions' : 'транзакция'}</span>
          </div>
        </div>
      </div>

      {/* Multi-Account Management & Switcher Card */}
      <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0e2a14] dark:text-[#9fe870]" />
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isRu ? 'Управление аккаунтами и смена пользователя' : isEn ? 'Account Management & Fast Switcher' : 'Аккаунттарды басқару және ауыстыру'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {t.accountSwitchNotice}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenAuth?.('register')}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#0e2a14] dark:bg-[#9fe870] text-[#9fe870] dark:text-[#0e2a14] text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.registerNewAccount}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allUsers.map((u) => {
            const isCurrent = u.id === user.id;
            return (
              <div
                key={u.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 ring-2 ring-emerald-500/20'
                    : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-700/60 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCurrent
                        ? 'bg-[#0e2a14] dark:bg-[#9fe870] text-[#9fe870] dark:text-[#0e2a14]'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {u.fullName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-xs truncate flex items-center gap-1.5">
                      <span>{u.fullName}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-medium">
                          {isRu ? 'Текущий' : isEn ? 'Active' : 'Белсенді'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono truncate">{u.email}</div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => switchUser(u.id)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-200 dark:border-neutral-600 text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-[#0e2a14] dark:text-[#9fe870]" />
                    <span>{isRu ? 'Войти' : isEn ? 'Switch' : 'Өту'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
          <h3 className="text-lg font-bold">
            {isRu ? 'Управление личными данными' : isEn ? 'Personal Information Settings' : 'Жеке деректерді басқару'}
          </h3>
          {savedSuccess && (
            <span className="text-xs text-emerald-700 dark:text-[#9fe870] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> {isRu ? 'Сохранено!' : isEn ? 'Saved!' : 'Өзгерістер сақталды!'}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {isRu ? 'Полное имя:' : isEn ? 'Full Name:' : 'Толық аты-жөніңіз:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {isRu ? 'Номер телефона:' : isEn ? 'Phone Number:' : 'Телефон нөмірі:'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {isRu ? 'Страна проживания:' : isEn ? 'Country:' : 'Тұратын еліңіз:'}
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {isRu ? 'Основная валюта:' : isEn ? 'Preferred Currency:' : 'Негізгі валюта:'}
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none bg-white dark:bg-neutral-800"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0e2a14] hover:bg-[#183d1e] dark:bg-[#9fe870] dark:hover:bg-[#b0f385] text-[#9fe870] dark:text-[#0e2a14] font-bold text-xs shadow-sm transition-all"
            >
              {isRu ? 'Сохранить изменения' : isEn ? 'Save Changes' : 'Өзгерістерді сақтау'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Info Card */}
      <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-colors">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-[#9fe870]" />
          {isRu ? 'Безопасность и защита данных' : isEn ? 'Security & Data Protection' : 'Қауіпсіздік және деректерді қорғау'}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
          Spring Security BCrypt 12-round hashing + Stateless JWT authentication.
        </p>
      </div>
    </div>
  );
};
