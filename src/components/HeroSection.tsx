import React from 'react';
import { useApp } from '../context/AppContext';
import { ExchangeWidget } from './ExchangeWidget';
import {
  ShieldCheck,
  Zap,
  Globe2,
  ArrowRight,
  CreditCard,
  Layers,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth }) => {
  const { isAuthenticated, setActiveTab, t } = useApp();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0e2a14] via-[#091f0f] to-neutral-900 dark:from-[#051108] dark:via-[#091a0c] dark:to-neutral-950 text-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#9fe870]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Value Proposition & Copy */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Editorial Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#9fe870] tracking-wide">
              <span>{t.heroTag}</span>
              <span aria-hidden="true">·</span>
              <span>{t.heroTagSub}</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] max-w-2xl text-balance">
              {t.heroTitlePart1}
              <span className="text-[#9fe870]">{t.heroTitleAccent}</span>
              {t.heroTitlePart2}
            </h1>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('wallets')}
                  className="px-6 py-3.5 rounded-2xl bg-[#9fe870] hover:bg-[#b0f385] text-[#0e2a14] font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.heroBtnWallets}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3.5 rounded-2xl bg-[#9fe870] hover:bg-[#b0f385] text-[#0e2a14] font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>{t.heroBtnRegister}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-4 border-t border-white/10">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-[#9fe870]" />
                {t.heroBadge1}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Zap className="w-4 h-4 text-[#9fe870]" />
                {t.heroBadge2}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Globe2 className="w-4 h-4 text-[#9fe870]" />
                {t.heroBadge3}
              </span>
            </div>
          </div>

          {/* Right Column: Live Interactive Converter Widget */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10">
              <ExchangeWidget isStandalone={true} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
