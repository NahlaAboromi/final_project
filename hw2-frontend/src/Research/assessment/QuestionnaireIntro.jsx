// src/Research/assessment/QuestionnaireIntro.jsx
import React, { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useI18n } from "../../utils/i18n";
import ProgressSteps from "../ProgressSteps";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../DarkLightMood/ThemeContext";
export default function QuestionnaireIntro({
  CATEGORIES = {},
  onStart,
  groupType = "control",
  currentStep = 1,
  language = "he",
}) {
    const { lang } = useContext(LanguageContext);
  const isHeb = lang === "he";
  const location = useLocation();
  const { t } = useI18n("questionnaireIntro");
  const T = {
    title: t("title"),
    subtitle: t("subtitle"),
    chip: t("chip"),
    quickOn: t("quickOn"),
    quickHelp1: t("quickHelp1"),
    quickHelp2: t("quickHelp2"),
    start: t("start"),
  };
  const { theme } = useContext(ThemeContext);
const isDark = theme === "dark";
const CATEGORY_LABELS = {
  he: {
    "Self Awareness": "מודעות עצמית",
    "Self- Awareness": "מודעות עצמית",
    "Self Management": "ניהול עצמי",
    "Self- Management": "ניהול עצמי",
    "Social Awareness": "מודעות חברתית",
    "Social- Awareness": "מודעות חברתית",
    "Relationship Skills": "מיומנויות יחסים",
    "Responsible Decision Making": "קבלת החלטות אחראית",
    "Responsible Decision-Making": "קבלת החלטות אחראית",
  },
  en: {
    "מודעות עצמית": "Self Awareness",
    "ניהול עצמי": "Self Management",
    "מודעות חברתית": "Social Awareness",
    "מיומנויות יחסים": "Relationship Skills",
    "קבלת החלטות אחראית": "Responsible Decision Making",
  },
};
  
  // —— render quickHelp2 with LTR numbers inside RTL sentence —— //
  const renderQuickHelp2 = () => {
    if (!isHeb) return T.quickHelp2;
    const parts = String(T.quickHelp2).split(/(1\s*\/\s*2\s*\/\s*3\s*\/\s*4)/);
    if (parts.length < 3) return T.quickHelp2;
    return (
      <>
        {parts[0]}
        <bdi dir="ltr" className="inline-block">
          1 / 2 / 3 / 4
        </bdi>
        {parts[2]}
      </>
    );
  };

  // emojis - סידור מחדש כך ש"קבלת החלטות אחראית" (🛡️) יהיה באמצע
  const emojis = ["🎯", "❤️", "🛡️", "👥", "💡"];

  // מיון הקטגוריות - שמים את "Responsible Decision Making" באמצע
  const sortedCategories = Object.entries(CATEGORIES).sort((a, b) => {
    const aName = a[0];
    const bName = b[0];
    
    // אם זו הקטגוריה של קבלת החלטות, שים אותה במיקום 2 (אמצע)
    if (aName.includes("Decision") || aName.includes("החלטות")) return 0;
    if (bName.includes("Decision") || bName.includes("החלטות")) return 1;
    
    return 0;
  });
return (
  <div
      dir={isHeb ? "rtl" : "ltr"}
      style={{ fontFamily: lang === "he" ? "Heebo, Rubik, Arial, sans-serif" : "inherit" }}
      className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 bg-white dark:bg-slate-800"
  >
      <ProgressSteps
        groupType={groupType}
        currentStep={currentStep}
        language={language}
        isDark={isDark}
      />
        
        {/* כותרת */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-4">🧠✨</div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-3 leading-tight">
            {T.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-4">
            {T.subtitle}
          </p>

          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 px-3 sm:px-4 py-2 rounded-full">
            <span className="text-lg sm:text-xl">⚡</span>
            <span className="text-sm sm:text-base text-emerald-700 dark:text-emerald-400 font-semibold">
              {T.chip}
            </span>
          </div>
        </div>
{/* 🔔 POST info banner */}
{location?.state?.phase === 'post' && (
  <div
    className="
      mb-6 sm:mb-8
      rounded-xl
      border
      px-4 sm:px-6
      py-3 sm:py-4
      bg-emerald-100 border-emerald-400
      dark:bg-emerald-950 dark:border-emerald-700
      shadow-sm
    "
  >
    <p className="text-sm sm:text-base font-semibold text-emerald-950 dark:text-emerald-100 leading-relaxed">
      {isHeb
        ? "לא חזרת להתחלה 🙂 זהו אותו שאלון שמילאת בתחילת התהליך — כעת לצורך השוואה בין שני שלבי המדידה"
        : "You have not returned to the beginning 🙂 This is the same questionnaire you completed at the start of the process — now for comparison between the two measurement stages."}
    </p>
  </div>
)}
        {/* קטגוריות - עם קבלת החלטות אחראית באמצע */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {sortedCategories.map(([name], index) => {
            const emoji = emojis[index % emojis.length];
            const isDecisionMaking = index === 4; // האחרון (🛡️)
            
            return (
              <div
                key={name}
                className={`
                  flex items-center justify-start rounded-xl border p-4 sm:p-5
                  bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600
                  ${isDecisionMaking ? 'sm:col-start-1 sm:col-span-2 sm:justify-center sm:max-w-md sm:mx-auto' : ''}
                `}
                dir={isHeb ? "rtl" : "ltr"}
              >
                <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 ml-1">{emoji}</div>
                <span
                  className={`text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-100 leading-snug break-words ${
                    isHeb ? "text-right" : "text-left"
                  }`}
                >
{CATEGORY_LABELS[lang]?.[name] || name}                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Mode */}
        <div
          dir={isHeb ? "rtl" : "ltr"}
          className="
            flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl mb-6 sm:mb-8 border p-4 sm:p-5
            bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600
          "
        >
          <div className="text-2xl sm:text-3xl">⌨️</div>
          <div className="text-slate-700 dark:text-slate-100">
            <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">
              ⚡ {T.quickOn}
            </div>
            <div className="text-xs sm:text-sm">
              {T.quickHelp1}
              <br />
              <span className="font-semibold">{renderQuickHelp2()}</span> 🚀
            </div>
          </div>
        </div>

        {/* כפתור התחלה */}
        <button
          onClick={() => {
            try {
              localStorage.setItem("langLock", "1");
            } catch {}
            window.dispatchEvent(new Event("lang-lock-change"));
            onStart?.();
          }}
          className="
            w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 
            transition-colors text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg
            flex items-center justify-center gap-2 rtl:space-x-reverse
          "
        >
          <span>{T.start}</span>
          <span className="text-lg sm:text-xl">🎯</span>
        </button>
      </div>
  );
}