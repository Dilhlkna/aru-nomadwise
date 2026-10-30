import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ExchangeWidget } from './components/ExchangeWidget';
import { WalletsView } from './components/WalletsView';
import { RatesTable } from './components/RatesTable';
import { TransactionHistory } from './components/TransactionHistory';
import { UserProfile } from './components/UserProfile';
import { AuthModal } from './components/AuthModal';
import { AddWalletModal } from './components/AddWalletModal';
import { DemoTopUpModal } from './components/DemoTopUpModal';
import { Footer } from './components/Footer';
import { Wallet, CurrencyCode } from './types';
import { isFirebaseConfigured } from './firebase';

const FirebaseSetupNotice: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
    <div className="max-w-xl w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl text-neutral-900 dark:text-neutral-100">
      <h1 className="text-xl font-extrabold mb-2">Firebase не настроен</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Вставь ключи своего Firebase-проекта в файл <code className="font-mono">.env</code> и пересобери сайт.
      </p>
      <ol className="text-sm list-decimal pl-5 space-y-1.5 text-neutral-700 dark:text-neutral-300">
        <li>Скопируй <code className="font-mono">.env.example</code> в <code className="font-mono">.env</code></li>
        <li>Firebase Console → Project settings → Your apps → Web → скопируй значения в <code className="font-mono">VITE_FIREBASE_*</code></li>
        <li>Включи Authentication → Email/Password и создай базу Firestore</li>
        <li>Запусти <code className="font-mono">npm run build</code> (или <code className="font-mono">npm run dev</code>) заново</li>
      </ol>
    </div>
  </div>
);

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, t, language, isAuthLoading } = useApp();

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [newWalletModalOpen, setNewWalletModalOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [selectedWalletForTopUp, setSelectedWalletForTopUp] = useState<Wallet | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Exchange widget preset
  const [exchangePreset, setExchangePreset] = useState<{
    source: CurrencyCode;
    target: CurrencyCode;
  }>({ source: 'USD', target: 'KZT' });

  const handleOpenDemoTopUp = (wallet: Wallet) => {
    setSelectedWalletForTopUp(wallet);
    setTopUpModalOpen(true);
  };

  const handleOpenExchangeForWallet = (wallet: Wallet) => {
    const target: CurrencyCode = wallet.currencyCode === 'KZT' ? 'USD' : 'KZT';
    setExchangePreset({ source: wallet.currencyCode, target });
    setActiveTab('exchange');
  };

  const handleSelectPairFromRates = (from: CurrencyCode, to: CurrencyCode) => {
    setExchangePreset({ source: from, target: to });
    setActiveTab('exchange');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-500 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenNewWallet={() => setNewWalletModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div>
            <HeroSection onOpenAuth={handleOpenAuth} />
            
            {/* Live rates teaser on homepage */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <RatesTable onSelectPair={handleSelectPairFromRates} />
            </div>

            <FeaturesSection onNavigateToWallets={() => setActiveTab('wallets')} />
          </div>
        )}

        {/* TAB 2: EXCHANGE */}
        {activeTab === 'exchange' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
                {t.exchangeTitle}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                {t.exchangeSubtitle}
              </p>
            </div>

            <ExchangeWidget
              initialSourceCurrency={exchangePreset.source}
              initialTargetCurrency={exchangePreset.target}
            />
          </div>
        )}

        {/* TAB 3: WALLETS */}
        {activeTab === 'wallets' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <WalletsView
              onOpenNewWallet={() => setNewWalletModalOpen(true)}
              onOpenDemoTopUp={handleOpenDemoTopUp}
              onOpenExchangeForWallet={handleOpenExchangeForWallet}
            />
          </div>
        )}

        {/* TAB 4: RATES */}
        {activeTab === 'rates' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="max-w-3xl mb-8">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
                {t.ratesTitle}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Frankfurter API & European Central Bank (ECB) live rates feed.
              </p>
            </div>

            <RatesTable onSelectPair={handleSelectPairFromRates} />
          </div>
        )}

        {/* TAB 5: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <TransactionHistory />
          </div>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <UserProfile onOpenAuth={handleOpenAuth} />
          </div>
        )}

      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        defaultMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <AddWalletModal
        isOpen={newWalletModalOpen}
        onClose={() => setNewWalletModalOpen(false)}
      />

      <DemoTopUpModal
        isOpen={topUpModalOpen}
        wallet={selectedWalletForTopUp}
        onClose={() => {
          setTopUpModalOpen(false);
          setSelectedWalletForTopUp(null);
        }}
      />

      {/* Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
};

export default function App() {
  if (!isFirebaseConfigured) return <FirebaseSetupNotice />;
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
