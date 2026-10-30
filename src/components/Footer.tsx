import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({
  onNavigate,
}) => {
  const { t, language } = useApp();

  const isRu = language === 'ru';
  const isEn = language === 'en';

  return (
    <footer className="bg-[#0b1f10] dark:bg-[#040e06] text-neutral-400 border-t border-[#16381e] dark:border-neutral-800 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#9fe870] text-[#0e2a14] flex items-center justify-center font-bold text-sm">
                ₸
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                Nomad<span className="text-[#9fe870]">Wise</span>
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {isRu
                ? 'Мультивалютные виртуальные кошельки и платформа обмена валют по реальному рыночному курсу в стиле Wise.'
                : isEn
                ? 'Wise-inspired multi-currency virtual wallets and currency exchange platform with mid-market rates.'
                : 'Wise стиліндегі көпвалюталық виртуалды әмияндар және нақты нарықтық бағаммен айырбастау веб-қосымшасы.'}
            </p>
          </div>

          {/* Nav links 1 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              {isRu ? 'Сервисы' : isEn ? 'Services' : 'Қызметтер'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('exchange')}
                  className="hover:text-white transition-colors"
                >
                  {t.navExchange}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('rates')}
                  className="hover:text-white transition-colors"
                >
                  {t.navRates}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wallets')}
                  className="hover:text-white transition-colors"
                >
                  {t.navWallets}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('transactions')}
                  className="hover:text-white transition-colors"
                >
                  {t.navTransactions}
                </button>
              </li>
            </ul>
          </div>

          {/* Academic & Backend */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              {isRu ? 'Технологический Стек' : isEn ? 'Tech Stack' : 'Технологиялық Стек'}
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-[#9fe870]/90 font-mono">React 19 + TypeScript + Vite</span>
              </li>
              <li>
                <span className="text-neutral-400">Firebase Authentication</span>
              </li>
              <li>
                <span className="text-neutral-400">Cloud Firestore (транзакции)</span>
              </li>
              <li>
                <span className="text-neutral-400">Frankfurter / ECB API</span>
              </li>
            </ul>
          </div>

          {/* Academic disclaimer */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              {isRu ? 'Экзаменационный Проект' : isEn ? 'Examination Project' : 'Емтихандық Оқу Жобасы'}
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {isRu
                ? 'Приложение использует виртуальные кошельки и тестовый баланс в учебных целях. Не является реальной банковской системой.'
                : isEn
                ? 'This app uses virtual sandbox wallets and demo balances for study and examination. Not a real bank.'
                : 'Бұл қосымша виртуалды әмияндар мен оқу мақсатындағы demo қаражатты пайдаланады. Нақты банк картасы емес.'}
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isRu ? 'Безопасная тестовая среда' : isEn ? 'Secure Sandbox Environment' : 'Қауіпсіз тестілік орта'}</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-[#16381e] dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
          <div>
            © 2026 NomadWise. {isRu ? 'Все права защищены.' : isEn ? 'All rights reserved.' : 'Барлық құқықтар қорғалған.'}
          </div>
          <div className="flex items-center gap-4">
            <span>{isRu ? 'Казахстан, Алматы' : isEn ? 'Kazakhstan, Almaty' : 'Қазақстан, Алматы'}</span>
            <span>·</span>
            <span>Narxoz University</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
