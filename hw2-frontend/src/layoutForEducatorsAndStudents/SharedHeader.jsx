// src/layoutForEducatorsAndStudents/SharedHeader.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import ThemeToggle from '../DarkLightMood/ThemeToggle';
import FeaturesModal from './FeaturesModal';
import AboutModal from './AboutSEL';
import { LanguageContext } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SharedHeader = () => {
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext);
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  const TEXTS = {
    en: {
      features: 'Features',
      about: 'About SEL',
      aiBadge: 'AI POWERED',
      brand: 'Edu Map',
    },
    he: {
      features: 'תכונות',
      about: 'על SEL',
      aiBadge: 'מופעל על ידי AI',
      brand: 'Edu Map',
    },
  };

  const T = TEXTS[lang] || TEXTS.en;

  return (
    <header
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`
        w-full
        px-4 sm:px-6 py-3
        shadow-sm transition-all
        ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-b border-gray-200'}
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:justify-between
      `}
    >
      <div className="flex items-center gap-3">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
<svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-8 w-8"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth="2.4"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M3 10.5L12 3l9 7.5" />
  <path d="M5 10v10h14V10" />
  <path d="M9 20v-6h6v6" />
</svg>
          {T.brand}
        </Link>

        <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-red-400 to-green-300 text-white">
          {T.aiBadge}
        </span>
      </div>

      <div
        className={`
          flex flex-wrap items-center
          gap-3 sm:gap-6 text-sm font-semibold
          ${isRTL
            ? 'flex-row-reverse justify-center sm:justify-start'
            : 'justify-center sm:justify-end'}
        `}
      >
        <ThemeToggle />
        <LanguageSwitcher />
        <FeaturesModal label={T.features} />
        <AboutModal label={T.about} />
      </div>
    </header>
  );
};

export default SharedHeader;