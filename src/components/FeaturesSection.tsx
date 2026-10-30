import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Database,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const FeaturesSection: React.FC<{ onNavigateToWallets: () => void }> = ({
  onNavigateToWallets,
}) => {
  const { language, t } = useApp();

  const isRu = language === 'ru';
  const isEn = language === 'en';

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200/60 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#9fe870]">
            {isRu ? 'Современная Финтех-Инфраструктура' : isEn ? 'Modern Fintech Infrastructure' : 'Заманауи Финтех Инфрақұрылымы'}
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight text-balance">
            {isRu ? 'Свобода от скрытых комиссий традиционных банков' : isEn ? 'Free from the hidden markups of traditional banks' : 'Дәстүрлі банктердің жасырын үстемесінен азат болыңыз'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {isRu
              ? 'NomadWise делает обмен валют честным, прозрачным и надежным по реальному курсу.'
              : isEn
              ? 'NomadWise makes foreign exchange fair, transparent, and seamless with true mid-market rates.'
              : 'NomadWise валюта айырбастау процесін әділ, ашық және сенімді етеді. Әрбір теңге мен центті нақты нарықтық бағаммен есептеңіз.'}
          </p>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Virtual Card Ecosystem (7 cols) */}
          <div className="md:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#9fe870] flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                {isRu ? 'Мультивалютные виртуальные карты' : isEn ? 'Multi-currency Virtual Cards' : 'Көпвалюталық виртуалды карталар'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                {isRu
                  ? 'Открывайте персональные карты для KZT, USD, EUR, GBP, RUB с защищенным номером и независимым балансом.'
                  : isEn
                  ? 'Open dedicated virtual cards for KZT, USD, EUR, GBP, and RUB with isolated balances and safe IDs.'
                  : 'Бір ғана аккаунтпен KZT, USD, EUR, GBP, RUB және басқа негізгі валюталарға жеке қауіпсіз виртуалды карталар ашыңыз.'}
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm bg-neutral-100 dark:bg-neutral-800 relative aspect-[16/9] max-h-64">
              <img
                src="/src/assets/images/virtual_cards_stack_1793258245140.jpg"
                alt="Virtual Cards"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Card 2: Transparent Real-Time Rates (5 cols) */}
          <div className="md:col-span-5 bg-[#0e2a14] dark:bg-[#07190b] rounded-3xl p-6 sm:p-8 text-white border border-[#1b4322] dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#9fe870]/20 text-[#9fe870] flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isRu ? 'Реальный рыночный курс' : isEn ? 'Mid-market Exchange Rate' : 'Нақты нарықтық бағам'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                {isRu
                  ? 'Прямые котировки Frankfurter API и ЕЦБ без скрытых надбавок — только честная комиссия 0.45%.'
                  : isEn
                  ? 'Direct rates from Frankfurter API and ECB with zero artificial spreads — only a clean 0.45% fee.'
                  : 'Frankfurter және Еуропалық Орталық Банк (ECB) API арқылы тікелей алынатын нақты валюта бағамдары. Тек 0.45% ашық комиссия.'}
              </p>
            </div>

            <div className="bg-white/10 dark:bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-neutral-300">
                <span>Frankfurter API Status:</span>
                <span className="text-[#9fe870] font-bold">LIVE ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span>{isRu ? 'Фиксация курса:' : isEn ? 'Rate guarantee:' : 'Кепілдендірілген уақыт:'}</span>
                <span className="text-white">30s</span>
              </div>
            </div>
          </div>

          {/* Card 3: ACID Transactions & Security (6 cols) */}
          <div className="md:col-span-6 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {isRu ? 'ACID транзакции базы данных' : isEn ? 'ACID Database Transactions' : 'Дерекқор деңгейіндегі ACID транзакциялары'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              {isRu
                ? 'Списание с исходного кошелька и зачисление на целевой происходят в единой атомарной транзакции Spring Boot @Transactional.'
                : isEn
                ? 'Debit from source and credit to target execute inside an atomic Spring Boot @Transactional block.'
                : 'Бастапқы әмияннан қаражатты алу және мақсатты әмиянға жазу бір атомдық транзакцияда (@Transactional) жүзеге асады.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#9fe870]" />
              <span>Decimal(18,4) BigDecimal precision</span>
            </div>
          </div>

          {/* Card 4: Safe Demo Mode for Education (6 cols) */}
          <div className="md:col-span-6 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {isRu ? 'Экзаменационный учебный проект & Demo' : isEn ? 'Exam Study Project & Demo Mode' : 'Емтихандық оқу жобасы және Demo'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              {isRu
                ? 'Это образовательный проект. Настоящие данные банковских карт не требуются. Все операции проводятся в безопасной виртуальной песочнице.'
                : isEn
                ? 'This is an educational examination project. Real credit card details are never requested or required.'
                : 'Бұл оқу жобасы. Нақты банк шоты немесе құпия деректер сұралмайды. Тестілік виртуалды балансты қалаған кезде сынақтан өткізе аласыз.'}
            </p>
            <button
              type="button"
              onClick={onNavigateToWallets}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e2a14] dark:text-[#9fe870] hover:underline"
            >
              <span>{t.goToWallets}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
