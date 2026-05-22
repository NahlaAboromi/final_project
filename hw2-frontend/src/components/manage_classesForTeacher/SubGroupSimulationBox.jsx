import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';

const SubGroupSimulationBox = ({ situation, question, isDark }) => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl shadow ${
        isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800'
      }`}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-2">
        {isRTL ? 'הסימולציה' : 'Simulation'}
      </h2>

      <p className="mb-4 text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {situation || (isRTL ? 'לא קיימת סימולציה' : 'No simulation available')}
      </p>

      <h2 className="text-lg sm:text-xl font-semibold mb-2">
        {isRTL ? 'השאלה' : 'Question'}
      </h2>

      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {question || (isRTL ? 'לא קיימת שאלה' : 'No question available')}
      </p>
    </div>
  );
};

export default SubGroupSimulationBox;