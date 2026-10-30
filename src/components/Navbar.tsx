import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import {
  ArrowLeftRight,
  CreditCard,
  LineChart,
  History,
  Code2,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  UserPlus,
  ChevronDown,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenNewWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenNewWallet }) => {
  const {
    user,
    allUsers,
    switchUser,
    isAuthenticated,
    logout,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    theme,
    toggleTheme,
    t,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'exchange', label: t.navExchange, icon: ArrowLeftRight },
    { id: 'wallets', label: t.navWallets, icon: CreditCard },
    { id: 'rates', label: t.navRates, icon: LineChart },
    { id: 'transactions', label: t.navTransactions, icon: History },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];
  const otherUsers = allUsers.filter((u) => u.id !== user?.id);

  return (
    <header className="sticky top-0 z-40 bg-[#0e2a14]/95 dark:bg-[#08160c]/95 backdrop-blur-md border-b border-[#1b4322] dark:border-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fe870] rounded-lg"
        >
          <div className="w-9 h-9 rounded-xl bg-[#9fe870] text-[#0e2a14] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            ₸
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
              Nomad<span className="text-[#9fe870]">Wise</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'text-[#9fe870] border-[#9fe870] font-semibold'
                    : 'text-neutral-300 hover:text-white border-transparent'
                }`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Controls (Language + Theme + Auth) */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition-colors"
              title="Тілді таңдау / Выбор языка / Select Language"
            >
              <span>{currentLangObj.flag}</span>
              <span className="font-semibold uppercase">{currentLangObj.code}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50 text-xs">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                      language === l.code ? 'font-bold text-[#0e2a14] dark:text-[#9fe870]' : ''
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-200 hover:text-white border border-white/10 transition-colors"
            title={theme === 'dark' ? t.themeLight : t.themeDark}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-300" />
            )}
          </button>


          {/* Auth Action: Authenticated with Multi-User Dropdown OR Guest Auth Buttons */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#183d1e] hover:bg-[#204e28] text-xs text-white border border-[#2a5d33] transition-all shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-[#9fe870] text-[#0e2a14] flex items-center justify-center font-bold text-xs shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="text-left max-w-[120px] truncate">
                  <div className="font-semibold truncate">{user.fullName}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-300" />
              </button>

              {/* Multi-Account Switcher & Actions Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  {/* Current Active User Card */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 mb-2">
                    <div className="text-[10px] text-emerald-800 dark:text-[#9fe870] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {t.activeAccount}
                    </div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                      {user.fullName}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">
                      {user.email}
                    </div>
                  </div>

                  {/* Switch to Other Accounts section */}
                  {otherUsers.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{t.switchAccount}:</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {otherUsers.map((other) => (
                          <button
                            key={other.id}
                            type="button"
                            onClick={() => {
                              switchUser(other.id);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                          >
                            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#9fe870] group-hover:text-[#0e2a14] transition-colors">
                              {other.fullName.charAt(0)}
                            </div>
                            <div className="truncate flex-1">
                              <div className="font-medium truncate">{other.fullName}</div>
                              <div className="text-[10px] text-neutral-400 truncate">{other.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions: Register another person & Log into other */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuth('register');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-[#9fe870] font-semibold transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{t.registerNewAccount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuth('login');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      <Users className="w-4 h-4 text-neutral-400" />
                      <span>{t.loginOtherAccount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick('profile');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-400" />
                      <span>{t.profile}</span>
                    </button>
                  </div>

                  {/* Log Out button */}
                  <div className="pt-2 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 transition-all whitespace-nowrap active:scale-95"
              >
                {t.loginBtn}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-bold text-[#0e2a14] bg-[#9fe870] hover:bg-[#b0f385] rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t.registerBtn}</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 text-neutral-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-[#183d1e]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1b4322] bg-[#0c2411] px-4 pt-3 pb-6 space-y-2">
          {/* Mobile Language buttons */}
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  language === l.code ? 'bg-[#9fe870] text-[#0e2a14]' : 'bg-white/10 text-white'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-[#183d1e] text-[#9fe870] font-semibold'
                    : 'text-neutral-300 hover:bg-[#15341a]'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4 text-neutral-400" />}
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-[#1b4322] flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-2 text-xs text-neutral-300 bg-white/5 rounded-xl">
                  <div className="font-bold text-white">{user.fullName}</div>
                  <div className="text-[#9fe870] text-[11px]">{user.email}</div>
                </div>

                {/* Other accounts for mobile switch */}
                {otherUsers.length > 0 && (
                  <div className="py-1">
                    <span className="text-[11px] text-neutral-400 px-1">{t.switchAccount}:</span>
                    <div className="space-y-1 mt-1">
                      {otherUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-neutral-200"
                        >
                          {u.fullName} ({u.email})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 text-xs font-semibold bg-[#9fe870] text-[#0e2a14] rounded-xl text-center flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.registerNewAccount}</span>
                </button>

                <button
                  onClick={() => {
                    handleNavClick('wallets');
                    onOpenNewWallet();
                  }}
                  className="w-full py-2 text-xs font-semibold bg-[#183d1e] text-white rounded-lg text-center"
                >
                  {t.btnAddNewWallet}
                </button>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs text-red-300 hover:text-red-200 text-center"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="py-2.5 text-center text-xs font-bold text-white bg-white/10 rounded-xl"
                >
                  {t.loginBtn}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="py-2.5 text-center text-xs font-bold text-[#0e2a14] bg-[#9fe870] rounded-xl flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.registerBtn}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
};
