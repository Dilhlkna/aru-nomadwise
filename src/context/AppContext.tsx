import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  CurrencyCode,
  Wallet,
  Transaction,
  User,
  RateSnapshot,
  CardTheme,
  Language,
  Theme,
} from '../types';
import { currencyService, roundToDecimals } from '../services/currencyService';
import { TRANSLATIONS } from '../i18n/translations';
import { auth, db } from '../firebase';

export interface CreateWalletOptions {
  currencyCode: CurrencyCode;
  cardTheme?: CardTheme;
  customNumber?: string;
  customHolder?: string;
  customExpiry?: string;
  customCvv?: string;
  isExternal?: boolean;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppContextType {
  user: User | null;
  /** С Firebase виден только текущий аккаунт (список чужих аккаунтов клиенту не отдаётся). */
  allUsers: User[];
  activeUserId: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  wallets: Wallet[];
  allWallets: Wallet[];
  transactions: Transaction[];
  ratesSnapshot: RateSnapshot;
  activeTab: string;
  isRatesLoading: boolean;
  language: Language;
  theme: Theme;
  t: typeof TRANSLATIONS['kk'];
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActiveTab: (tab: string) => void;
  switchUser: (userId: string) => void;
  login: (email: string, password?: string) => Promise<AuthResult>;
  register: (
    fullName: string,
    email: string,
    password?: string,
    phone?: string,
    country?: string,
    preferredCurrency?: CurrencyCode
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  createWallet: (options: CreateWalletOptions | CurrencyCode, cardTheme?: CardTheme) => Promise<Wallet>;
  toggleFreezeWallet: (walletId: string) => void;
  addDemoFunds: (walletId: string, amount: number) => Promise<void>;
  executeExchange: (
    sourceWalletId: string,
    targetWalletId: string,
    sourceAmount: number
  ) => Promise<{ success: boolean; message: string; transaction?: Transaction }>;
  refreshRates: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STARTER_BALANCE = 50000.0;

const decimalsFor = (code: CurrencyCode) => (code === 'JPY' ? 0 : 2);
const randomDigits = () => Math.floor(1000 + Math.random() * 9000);

class ExchangeError extends Error {}

function authErrorMessage(err: unknown, lang: Language): string {
  const code = (err as { code?: string })?.code || '';
  const M: Record<string, Record<Language, string>> = {
    'auth/invalid-email': {
      kk: 'Электрондық пошта форматы қате.',
      ru: 'Неверный формат email.',
      en: 'Invalid email address.',
    },
    'auth/invalid-credential': {
      kk: 'Пошта немесе құпиясөз қате.',
      ru: 'Неверный email или пароль.',
      en: 'Incorrect email or password.',
    },
    'auth/user-not-found': {
      kk: 'Мұндай аккаунт табылмады. Алдымен тіркеліңіз.',
      ru: 'Аккаунт не найден. Сначала зарегистрируйтесь.',
      en: 'Account not found. Please register first.',
    },
    'auth/wrong-password': {
      kk: 'Құпиясөз қате.',
      ru: 'Неверный пароль.',
      en: 'Wrong password.',
    },
    'auth/email-already-in-use': {
      kk: 'Бұл пошта бұрын тіркелген. «Кіру» арқылы кіріңіз.',
      ru: 'Этот email уже зарегистрирован. Войдите через «Вход».',
      en: 'This email is already registered. Please log in.',
    },
    'auth/weak-password': {
      kk: 'Құпиясөз тым қарапайым (кемінде 6 таңба).',
      ru: 'Слишком простой пароль (минимум 6 символов).',
      en: 'Password is too weak (min 6 characters).',
    },
    'auth/too-many-requests': {
      kk: 'Тым көп әрекет. Біраздан соң қайталаңыз.',
      ru: 'Слишком много попыток. Попробуйте позже.',
      en: 'Too many attempts. Try again later.',
    },
    'auth/network-request-failed': {
      kk: 'Желі қатесі. Интернетті тексеріңіз.',
      ru: 'Ошибка сети. Проверьте интернет.',
      en: 'Network error. Check your connection.',
    },
    'auth/operation-not-allowed': {
      kk: 'Firebase-те Email/Password кіру қосылмаған.',
      ru: 'В Firebase не включён вход Email/Password.',
      en: 'Email/Password sign-in is not enabled in Firebase.',
    },
  };
  if (M[code]) return M[code][lang];
  return lang === 'ru'
    ? `Ошибка: ${code || 'неизвестная ошибка'}`
    : lang === 'en'
    ? `Error: ${code || 'unknown error'}`
    : `Қате: ${code || 'белгісіз қате'}`;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('nomadwise_lang');
      return saved === 'ru' || saved === 'en' ? saved : 'kk';
    } catch {
      return 'kk';
    }
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('nomadwise_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // ---- Firebase state ----
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const isAuthenticated = !!user;

  const [ratesSnapshot, setRatesSnapshot] = useState<RateSnapshot>(() =>
    currencyService.getCurrentRates()
  );
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(false);

  // Следим за входом/выходом
  useEffect(() => {
    return onAuthStateChanged(auth, (fbUser) => {
      setAuthUid(fbUser?.uid ?? null);
      setIsAuthLoading(false);
    });
  }, []);

  // Подписки на данные текущего пользователя (обновляются в реальном времени)
  useEffect(() => {
    if (!authUid) {
      setUser(null);
      setWallets([]);
      setTransactions([]);
      return;
    }

    const onErr = (e: unknown) => console.error('Firestore error:', e);

    const unsubUser = onSnapshot(
      doc(db, 'users', authUid),
      (snap) => setUser(snap.exists() ? ({ ...(snap.data() as Omit<User, 'id'>), id: snap.id } as User) : null),
      onErr
    );

    const unsubWallets = onSnapshot(
      query(collection(db, 'wallets'), where('userId', '==', authUid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Wallet, 'id'>), id: d.id } as Wallet));
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setWallets(list);
      },
      onErr
    );

    const unsubTxs = onSnapshot(
      query(collection(db, 'transactions'), where('userId', '==', authUid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Transaction, 'id'>), id: d.id } as Transaction));
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setTransactions(list);
      },
      onErr
    );

    return () => {
      unsubUser();
      unsubWallets();
      unsubTxs();
    };
  }, [authUid]);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nomadwise_theme', theme);
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nomadwise_lang', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Live rates
  useEffect(() => {
    refreshRates();
    const timer = setInterval(() => {
      refreshRates();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const refreshRates = async () => {
    setIsRatesLoading(true);
    try {
      const snap = await currencyService.fetchLiveRates();
      setRatesSnapshot(snap);
    } finally {
      setIsRatesLoading(false);
    }
  };

  // Переключение аккаунтов теперь = выйти и войти другим email, поэтому это заглушка.
  const switchUser = (_targetUserId: string) => {};

  const login = async (email: string, password: string = ''): Promise<AuthResult> => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: authErrorMessage(err, language) };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string = '',
    phone?: string,
    country: string = 'Қазақстан',
    preferredCurrency: CurrencyCode = 'KZT'
  ): Promise<AuthResult> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;
      const name = fullName.trim() || 'Қолданушы';
      const now = new Date().toISOString();

      try {
        await updateAuthProfile(cred.user, { displayName: name });
      } catch {
        // не критично
      }

      const newUser: Omit<User, 'id'> = {
        fullName: name,
        email: email.trim(),
        phone: phone?.trim() || '',
        country,
        preferredCurrency,
        joinedDate: now,
        isDemoUser: false,
        isEmailVerified: true,
        isPhoneVerified: true,
      };

      const walletRef = doc(collection(db, 'wallets'));
      const txRef = doc(collection(db, 'transactions'));

      const firstWallet: Omit<Wallet, 'id'> = {
        userId: uid,
        currencyCode: preferredCurrency,
        balance: STARTER_BALANCE,
        cardholderName: name.toUpperCase(),
        virtualCardNumber: `5432 ${randomDigits()} ${randomDigits()} ${randomDigits()}`,
        expiryDate: '10/29',
        cvv: String(Math.floor(100 + Math.random() * 900)),
        isFrozen: false,
        cardTheme: 'forest',
        createdAt: now,
      };

      const welcomeTx: Omit<Transaction, 'id'> = {
        referenceCode: `NW-START-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: uid,
        type: 'DEMO_DEPOSIT',
        targetWalletId: walletRef.id,
        sourceCurrency: preferredCurrency,
        targetCurrency: preferredCurrency,
        sourceAmount: STARTER_BALANCE,
        targetAmount: STARTER_BALANCE,
        exchangeRate: 1.0,
        feeAmount: 0.0,
        feePercentage: 0.0,
        status: 'SUCCESS',
        createdAt: now,
        description: `Сәлемдесу бонустық балансы (+${STARTER_BALANCE.toLocaleString('en-US')} ${preferredCurrency})`,
      };

      const batch = writeBatch(db);
      batch.set(doc(db, 'users', uid), newUser);
      batch.set(walletRef, firstWallet);
      batch.set(txRef, welcomeTx);
      await batch.commit();

      return { ok: true };
    } catch (err) {
      return { ok: false, error: authErrorMessage(err, language) };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setActiveTab('home');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const { id: _id, ...rest } = data;
    try {
      await updateDoc(doc(db, 'users', user.id), rest);
    } catch (e) {
      console.error('updateProfile failed', e);
    }
  };

  const createWallet = async (
    optionsOrCode: CreateWalletOptions | CurrencyCode,
    cardThemeArg: CardTheme = 'forest'
  ): Promise<Wallet> => {
    if (!user) throw new Error('Авторизация қажет');

    const opts: CreateWalletOptions =
      typeof optionsOrCode === 'string'
        ? { currencyCode: optionsOrCode, cardTheme: cardThemeArg }
        : optionsOrCode;

    const isExternal = !!opts.isExternal;
    const walletRef = doc(collection(db, 'wallets'));

    const newWallet: Wallet = {
      id: walletRef.id,
      userId: user.id,
      currencyCode: opts.currencyCode,
      balance: isExternal ? STARTER_BALANCE : 0.0,
      cardholderName: (opts.customHolder || user.fullName).toUpperCase(),
      virtualCardNumber:
        opts.customNumber?.trim() || `4716 ${randomDigits()} ${randomDigits()} ${randomDigits()}`,
      expiryDate: opts.customExpiry?.trim() || '12/29',
      cvv: opts.customCvv?.trim() || String(Math.floor(100 + Math.random() * 900)),
      isFrozen: false,
      cardTheme: opts.cardTheme || 'forest',
      createdAt: new Date().toISOString(),
      isExternal,
    };

    const { id: _id, ...data } = newWallet;
    const batch = writeBatch(db);
    batch.set(walletRef, data);
    await batch.commit();
    return newWallet;
  };

  const toggleFreezeWallet = (walletId: string) => {
    const w = wallets.find((x) => x.id === walletId);
    if (!w) return;
    updateDoc(doc(db, 'wallets', walletId), { isFrozen: !w.isFrozen }).catch((e) =>
      console.error('toggleFreeze failed', e)
    );
  };

  const addDemoFunds = async (walletId: string, amount: number) => {
    if (!user || !(amount > 0)) return;
    const uid = user.id;

    try {
      await runTransaction(db, async (t) => {
        const wRef = doc(db, 'wallets', walletId);
        const snap = await t.get(wRef);
        if (!snap.exists() || snap.data().userId !== uid) {
          throw new Error('Әмиян табылмады');
        }
        const w = snap.data() as Omit<Wallet, 'id'>;
        const newBalance = roundToDecimals(w.balance + amount, decimalsFor(w.currencyCode));

        t.update(wRef, { balance: newBalance });
        t.set(doc(collection(db, 'transactions')), {
          referenceCode: `NW-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: uid,
          type: 'DEMO_DEPOSIT',
          targetWalletId: walletId,
          sourceCurrency: w.currencyCode,
          targetCurrency: w.currencyCode,
          sourceAmount: amount,
          targetAmount: amount,
          exchangeRate: 1.0,
          feeAmount: 0.0,
          feePercentage: 0.0,
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
          description: `Виртуалды тестілік толықтыру: +${amount} ${w.currencyCode}`,
        } satisfies Omit<Transaction, 'id'>);
      });
    } catch (e) {
      console.error('addDemoFunds failed', e);
    }
  };

  const executeExchange = async (
    sourceWalletId: string,
    targetWalletId: string,
    sourceAmount: number
  ): Promise<{ success: boolean; message: string; transaction?: Transaction }> => {
    if (!user) {
      return { success: false, message: 'Операция үшін жүйеге кіріңіз' };
    }
    if (sourceWalletId === targetWalletId) {
      return { success: false, message: 'Бастапқы және мақсатты әмиян бірдей болмауы керек' };
    }
    if (!(sourceAmount > 0)) {
      return { success: false, message: 'Айырбастау сомасы оң сан болуы тиіс' };
    }

    const uid = user.id;

    try {
      // Атомарная операция: либо оба кошелька обновятся и запись появится в истории, либо ничего.
      const tx = await runTransaction(db, async (t) => {
        const sRef = doc(db, 'wallets', sourceWalletId);
        const tRef = doc(db, 'wallets', targetWalletId);
        const sSnap = await t.get(sRef);
        const tSnap = await t.get(tRef);

        if (!sSnap.exists() || !tSnap.exists()) {
          throw new ExchangeError('Таңдалған әмиян табылмады');
        }
        const src = sSnap.data() as Omit<Wallet, 'id'>;
        const tgt = tSnap.data() as Omit<Wallet, 'id'>;

        if (src.userId !== uid || tgt.userId !== uid) {
          throw new ExchangeError('Таңдалған әмиян табылмады');
        }
        if (src.isFrozen || tgt.isFrozen) {
          throw new ExchangeError('Бұғатталған әмиянмен операция орындау мүмкін емес');
        }
        if (src.balance < sourceAmount) {
          throw new ExchangeError(
            `Баланс жеткіліксіз. Қолжетімді: ${src.balance} ${src.currencyCode}`
          );
        }

        const preview = currencyService.calculateExchangePreview(
          src.currencyCode,
          tgt.currencyCode,
          sourceAmount
        );

        t.update(sRef, {
          balance: roundToDecimals(src.balance - sourceAmount, decimalsFor(src.currencyCode)),
        });
        t.update(tRef, {
          balance: roundToDecimals(tgt.balance + preview.targetAmount, decimalsFor(tgt.currencyCode)),
        });

        const txRef = doc(collection(db, 'transactions'));
        const txData: Omit<Transaction, 'id'> = {
          referenceCode: `NW-EX-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: uid,
          type: 'EXCHANGE',
          sourceWalletId,
          targetWalletId,
          sourceCurrency: src.currencyCode,
          targetCurrency: tgt.currencyCode,
          sourceAmount,
          targetAmount: preview.targetAmount,
          exchangeRate: preview.marketRate,
          feeAmount: preview.feeAmount,
          feePercentage: preview.feePercentage,
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
          description: `${sourceAmount} ${src.currencyCode} ➔ ${preview.targetAmount} ${tgt.currencyCode} айырбасталды`,
        };
        t.set(txRef, txData);
        return { ...txData, id: txRef.id } as Transaction;
      });

      return { success: true, message: 'Валюта сәтті айырбасталды!', transaction: tx };
    } catch (e) {
      if (e instanceof ExchangeError) {
        return { success: false, message: e.message };
      }
      console.error('executeExchange failed', e);
      return { success: false, message: 'Серверлік қате. Қайталап көріңіз.' };
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.kk;

  return (
    <AppContext.Provider
      value={{
        user,
        allUsers: user ? [user] : [],
        activeUserId: user?.id ?? null,
        isAuthenticated,
        isAuthLoading,
        wallets,
        allWallets: wallets,
        transactions,
        ratesSnapshot,
        activeTab,
        isRatesLoading,
        language,
        theme,
        t,
        setLanguage,
        setTheme,
        toggleTheme,
        setActiveTab,
        switchUser,
        login,
        register,
        logout,
        updateProfile,
        createWallet,
        toggleFreezeWallet,
        addDemoFunds,
        executeExchange,
        refreshRates,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
