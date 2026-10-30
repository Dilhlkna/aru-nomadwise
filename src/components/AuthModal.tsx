import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CurrencyCode, User as UserType } from '../types';
import { CURRENCY_LIST } from '../data/currencies';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Smartphone,
  KeyRound,
  Users,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

type RegisterStep = 'INFO' | 'EMAIL_VERIFY' | 'PHONE_VERIFY';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register, switchUser, allUsers, user: activeUser, t, language } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [registerStep, setRegisterStep] = useState<RegisterStep>('INFO');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+7 (701) 123-45-67');
  const [country, setCountry] = useState('Қазақстан');
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('KZT');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification codes
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState<string>('849201');
  const [inputEmailOtp, setInputEmailOtp] = useState<string>('');
  const [generatedSmsOtp, setGeneratedSmsOtp] = useState<string>('5821');
  const [inputSmsOtp, setInputSmsOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);

  // Reset or initialize state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setRegisterStep('INFO');
      setError(null);
      if (defaultMode === 'register') {
        setEmail('');
        setPassword('');
        setFullName('');
        setPhoneNumber('+7 (777) 456-78-90');
      } else {
        // In login mode, fill with active user or first user if available
        if (activeUser) {
          setEmail(activeUser.email);
        } else if (allUsers.length > 0) {
          setEmail(allUsers[0].email);
        }
        setPassword('');
      }
    }
  }, [isOpen, defaultMode, activeUser]);

  // Timer for resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0 && registerStep !== 'INFO') {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, registerStep]);

  if (!isOpen) return null;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!email || !email.includes('@')) {
      setError(
        language === 'ru'
          ? 'Пожалуйста, введите корректный адрес электронной почты.'
          : language === 'en'
          ? 'Please enter a valid email address.'
          : 'Дұрыс электрондық пошта мекенжайын енгізіңіз.'
      );
      return;
    }

    if (!password || password.length < 6) {
      setError(
        language === 'ru'
          ? 'Пароль должен содержать минимум 6 символов.'
          : language === 'en'
          ? 'Password must be at least 6 characters.'
          : 'Құпиясөз кем дегенде 6 таңбадан тұруы тиіс.'
      );
      return;
    }

    if (mode === 'login') {
      setIsSubmitting(true);
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.ok) {
        onClose();
      } else {
        setError(res.error || 'Error');
      }
      return;
    } else {
      if (!fullName.trim()) {
        setError(
          language === 'ru'
            ? 'Пожалуйста, введите ваше полное имя.'
            : language === 'en'
            ? 'Please enter your full name.'
            : 'Аты-жөніңізді енгізіңіз.'
        );
        return;
      }

      // Generate random 6-digit email OTP
      const newEmailOtp = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedEmailOtp(newEmailOtp);
      setInputEmailOtp('');
      setCountdown(60);
      setRegisterStep('EMAIL_VERIFY');
    }
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (inputEmailOtp.trim() !== generatedEmailOtp) {
      setError(
        language === 'ru'
          ? 'Неверный код подтверждения из почты! Проверьте проверочный код в уведомлении.'
          : language === 'en'
          ? 'Invalid email verification code! Please check the code in the notification.'
          : 'Поштадан келген растау коды дұрыс емес! Хабарламадағы кодты тексеріңіз.'
      );
      return;
    }

    // Step 2 succeeded, move to phone verification
    const newSmsOtp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedSmsOtp(newSmsOtp);
    setInputSmsOtp('');
    setCountdown(60);
    setRegisterStep('PHONE_VERIFY');
  };

  const handleVerifyPhoneAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      setError(
        language === 'ru'
          ? 'Введите корректный номер телефона.'
          : language === 'en'
          ? 'Please enter a valid phone number.'
          : 'Дұрыс телефон нөмірін жазыңыз.'
      );
      return;
    }

    if (inputSmsOtp.trim() !== generatedSmsOtp && inputSmsOtp.length < 4) {
      setError(
        language === 'ru'
          ? 'Введите 4-значный SMS-код подтверждения.'
          : language === 'en'
          ? 'Enter the 4-digit SMS verification code.'
          : '4-таңбалы СМС растау кодын жазыңыз.'
      );
      return;
    }

    // All steps verified!
    setIsSubmitting(true);
    const res = await register(fullName, email, password, phoneNumber, country, preferredCurrency);
    setIsSubmitting(false);
    if (res.ok) {
      onClose();
    } else {
      // Ошибка (например, email уже занят): возвращаем на первый шаг, где она видна
      setRegisterStep('INFO');
      setError(res.error || 'Error');
    }
  };

  const handleResendEmail = () => {
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedEmailOtp(newCode);
    setCountdown(60);
    setError(null);
  };

  const handleSelectExistingUser = (selectedUser: UserType) => {
    switchUser(selectedUser.id);
    onClose();
  };

  const isRu = language === 'ru';
  const isEn = language === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0e2a14] dark:bg-[#9fe870] text-[#9fe870] dark:text-[#0e2a14] flex items-center justify-center font-bold text-sm">
              ₸
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {mode === 'login' ? t.authModalTitleLogin : t.authModalTitleRegister}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                NomadWise Secure Core · {allUsers.length} {isRu ? 'аккаунтов' : isEn ? 'accounts' : 'аккаунт'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher (Only on step 1) */}
        {registerStep === 'INFO' && (
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t.authTabLogin}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setFullName('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {t.authTabRegister}
            </button>
          </div>
        )}

        {/* Quick User Switcher Carousel (Visible in Login Mode) */}
        {mode === 'login' && registerStep === 'INFO' && allUsers.length > 0 && (
          <div className="mb-5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0e2a14] dark:text-[#9fe870]" />
                {t.registeredAccounts}:
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFullName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-[10px] text-emerald-700 dark:text-[#9fe870] hover:underline font-bold flex items-center gap-0.5"
              >
                <UserPlus className="w-3 h-3" />
                {t.registerNewAccount}
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {allUsers.map((u) => {
                const isActive = activeUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectExistingUser(u)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#0e2a14] dark:bg-[#9fe870] text-white dark:text-[#0e2a14] shadow-sm font-semibold'
                        : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive
                          ? 'bg-[#9fe870] dark:bg-[#0e2a14] text-[#0e2a14] dark:text-[#9fe870]'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs truncate">{u.fullName}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'opacity-80' : 'text-neutral-400'}`}>
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isActive ? (
                        <span className="text-[10px] bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded font-mono">
                          {isRu ? 'Активен' : isEn ? 'Active' : 'Белсенді'}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress indicator during registration */}
        {mode === 'register' && (
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-4 px-1">
            <span className={registerStep === 'INFO' ? 'text-[#0e2a14] dark:text-[#9fe870] font-bold' : ''}>
              {t.step1Basic}
            </span>
            <span>➔</span>
            <span className={registerStep === 'EMAIL_VERIFY' ? 'text-[#0e2a14] dark:text-[#9fe870] font-bold' : ''}>
              {t.step2EmailConfirm}
            </span>
            <span>➔</span>
            <span className={registerStep === 'PHONE_VERIFY' ? 'text-[#0e2a14] dark:text-[#9fe870] font-bold' : ''}>
              {t.step3PhoneConfirm}
            </span>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ----------------- STEP 1: INFO ----------------- */}
        {registerStep === 'INFO' && (
          <form onSubmit={handleStep1Submit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.inputFullName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Мысалы: Бауыржан Момышұлы"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t.inputEmail}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t.inputPassword}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0e2a14] hover:bg-[#183d1e] dark:bg-[#9fe870] dark:hover:bg-[#b0f385] text-[#9fe870] dark:text-[#0e2a14] font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>{mode === 'login' ? t.authTabLogin : t.btnNextEmailConfirm}</span>
                {mode === 'register' && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        )}

        {/* ----------------- STEP 2: EMAIL VERIFICATION (OTP) ----------------- */}
        {registerStep === 'EMAIL_VERIFY' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4 text-xs">
            {/* Simulated Live Email Push Notification Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-100 space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 font-bold text-[11px] text-emerald-800 dark:text-emerald-300">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>{t.simulatedInboxKicker}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {t.emailConfirmNotice} <strong className="underline">{email}</strong>
              </p>
              <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-emerald-200 dark:border-neutral-700 flex items-center justify-between font-mono">
                <span className="text-[11px] text-neutral-500">Растау коды:</span>
                <span className="text-base font-extrabold text-[#0e2a14] dark:text-[#9fe870] tracking-widest">
                  {generatedEmailOtp}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                (Точно сіз бе? Жүйе қауіпсіздігі үшін поштаңызға жіберілген осы кодты төмендегі өріске енгізіңіз)
              </p>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {t.verificationCodeLabel}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={inputEmailOtp}
                  onChange={(e) => setInputEmailOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="849201"
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-center text-xl font-bold tracking-widest outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
              <span>{countdown > 0 ? `${countdown} сек` : 'Уақыты аяқталды'}</span>
              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleResendEmail}
                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline disabled:opacity-40"
              >
                {t.btnResendCode}
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegisterStep('INFO')}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
              >
                Кері
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0e2a14] hover:bg-[#183d1e] dark:bg-[#9fe870] dark:hover:bg-[#b0f385] text-[#9fe870] dark:text-[#0e2a14] font-bold text-xs transition-all active:scale-95"
              >
                {t.btnVerifyCode} ➔
              </button>
            </div>
          </form>
        )}

        {/* ----------------- STEP 3: PHONE VERIFICATION ----------------- */}
        {registerStep === 'PHONE_VERIFY' && (
          <form onSubmit={handleVerifyPhoneAndRegister} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>📱 {t.phoneStepTitle}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {t.phoneStepDesc}
              </p>
              <div className="bg-white dark:bg-neutral-800 p-2 rounded-lg border border-blue-200 dark:border-neutral-700 flex justify-between items-center font-mono mt-1">
                <span className="text-[10px] text-neutral-500">СМС тексеру коды:</span>
                <span className="font-bold text-blue-800 dark:text-blue-300 tracking-wider">
                  {generatedSmsOtp}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t.phoneNumberLabel}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+7 (707) 123-45-67"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent font-mono outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t.phoneCodeLabel}
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={inputSmsOtp}
                onChange={(e) => setInputSmsOtp(e.target.value.replace(/\D/g, ''))}
                placeholder={generatedSmsOtp}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent font-mono text-center text-lg font-bold tracking-widest outline-none focus:border-[#0e2a14] dark:focus:border-[#9fe870]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Ел:
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Валюта:
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs"
                >
                  {CURRENCY_LIST.map((c) => (
                    <option key={c.code} value={c.code} className="dark:bg-neutral-900">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0e2a14] hover:bg-[#183d1e] dark:bg-[#9fe870] dark:hover:bg-[#b0f385] text-[#9fe870] dark:text-[#0e2a14] font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.btnFinalizeRegister}</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        {registerStep === 'INFO' && (
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-[10px] text-neutral-400">
              {t.bcryptNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
