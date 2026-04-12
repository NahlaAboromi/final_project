// src/Research/Thanks.jsx
// src/Research/Thanks/index.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnonymousHeader from '../AnonymousHeader';
import Footer from '../../layout/Footer';
import { ThemeContext, ThemeProvider } from '../../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../../context/AnonymousStudentContext';
import { useI18n } from '../../utils/i18n';
import HeroSection from './HeroSection';
import AppreciationCard from './AppreciationCard';
import MetaInfoCard from './MetaInfoCard';
import LoadingScreen from './LoadingScreen';
import ErrorAlert from './ErrorAlert';
import EmailFeedbackCard from './EmailFeedbackCard';
import ProgressSteps from '../ProgressSteps';
function ThanksInner() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudent?.() || { student: null };

  useEffect(() => {
    try {
      const lock = localStorage.getItem("langLock");
      if (lock === "1") {
        localStorage.removeItem("langLock");
        window.dispatchEvent(new Event("lang-lock-change"));
        console.log("Language lock removed on this page");
      }
    } catch (e) {
      console.warn("Failed to clear langLock:", e);
    }
  }, []);

  const { t, dir, lang: langAttr, ready } = useI18n('thanks');


  const isRTL = dir === 'rtl';

  const anonId = location.state?.anonId || student?.anonId || '—';
      const supportEmail = "n0502898789@gmail.com"; // 😎 לשים את המייל שלכם

  const emailSubject =
    langAttr === 'he'
      ? "בקשה לניתוח מעמיק של תוצאות השאלונים – CASELy"
      : "Request for detailed analysis of questionnaire results – CASELy";

  const emailBody =
    langAttr === 'he'
      ? `שלום,\n\nאני משתתפ/ת במחקר CASELy ומבקשת לקבל ניתוח מעמיק יותר של התוצאות שלי.\n\nמזהה אנונימי: ${anonId}\n\nאשמח לקבל העמקה והבהרות לגבי החוזקות והתחומים שבהם ניתן להשתפר לפי הממצאים.\n\nתודה מראש,\n`
      : `Hello,\n\nI am participating in the CASELy study and would like to receive a more detailed analysis of my results.\n\nAnonymous ID: ${anonId}\n\nI would appreciate a deeper explanation of my strengths and the areas where I can improve, based on the findings.\n\nThank you in advance,\n`;

  const mailtoHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  const initialGroup = (location.state?.group || '').toString().toUpperCase();
  const initialType = location.state?.groupType || (initialGroup === 'D' ? 'control' : initialGroup ? 'experimental' : '');

  const [group, setGroup] = useState(initialGroup);
  const [groupType, setGroupType] = useState(initialType);
  const [fetchErr, setFetchErr] = useState('');
const [showExitPopup, setShowExitPopup] = useState(false);
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (group || !anonId || anonId === '—') return;
      try {
        const r = await fetch(`/api/trial/${anonId}`);
        if (!r.ok) throw new Error('Failed to load trial meta.');
        const tMeta = await r.json();
        if (ignore) return;
        const g = String(tMeta.group || '').toUpperCase();
        setGroup(g);
        setGroupType(tMeta.groupType || (g === 'D' ? 'control' : g ? 'experimental' : ''));
      } catch (e) {
        if (!ignore) setFetchErr(e.message || 'Load error');
      }
    })();
    return () => { ignore = true; };
  }, [anonId, group]);
useEffect(() => {
  const timer = setTimeout(() => {
    setShowExitPopup(true);
  }, 1200); // אחרי ~שנייה

  return () => clearTimeout(timer);
}, []);
  const hasSocratic = useMemo(() => !!group && group !== 'D', [group]);
  const aboutList = [t('about_1'), t('about_2'), t('about_3'), t('about_4')];

  const groupBadge = useMemo(() => {
    if (!group) return null;
    const isCtrl = group === 'D' || groupType === 'control';
    return {
      text: isCtrl ? t('ribbons_control') : t('ribbons_experimental'),
      tone: isCtrl
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    };
  }, [group, groupType, t]);

  if (!ready) {
    return <LoadingScreen isDark={isDark} dir={dir} langAttr={langAttr} />;
  }
const exitPopupText = {
  title: langAttr === 'he' ? 'רגע לפני שיוצאים' : 'Before you leave',
  body:
    langAttr === 'he'
      ? 'נשמח אם תבצע/י התנתקות לפני היציאה מהמערכת. בנוסף, ניתן לרדת למטה בעמוד כדי להוריד את הדוח האישי (PDF) – זה הפידבק האישי שלך.'
: 'Please log out before leaving the system. You can also scroll down to download your personal report (PDF) — this is your personal feedback.',  button: langAttr === 'he' ? 'הבנתי' : 'Got it'
};
  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${
        isDark
          ? 'bg-slate-950'
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}
      dir={dir}
      lang={langAttr}
style={{
  fontFamily:
    'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}}
    >
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      <main className="flex-1 w-full px-4 py-8 md:py-12">
      <div className="mb-4 sm:mb-6">
  <ProgressSteps
    groupType={groupType === "control" ? "control" : "experiment"}
    currentStep={groupType === "control" ? 7 : 9}
    language={langAttr}
    isDark={isDark}
  />
</div>
        <div className="max-w-5xl mx-auto">
          <HeroSection 
            hasSocratic={hasSocratic}
            groupBadge={groupBadge}
            isDark={isDark}
            isRTL={isRTL}
            t={t}
          />

          <ErrorAlert error={fetchErr} isDark={isDark} />

          {/* Main Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <AppreciationCard 
              aboutList={aboutList}
              isDark={isDark}
              isRTL={isRTL}
              t={t}
            />

            <MetaInfoCard 
              anonId={anonId}
              hasSocratic={hasSocratic}
              isDark={isDark}
              isRTL={isRTL}
              navigate={navigate}
              t={t}
            />
          </div>
<EmailFeedbackCard
  anonId={anonId}
  lang={langAttr}
  hasSocratic={hasSocratic}
/>
{anonId && anonId !== '—' && (
  <div
    className={`mt-6 rounded-3xl shadow-2xl overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700'
        : 'bg-white/90 border border-slate-200'
    }`}
  >
    {/* פס עליון */}
    <div
      className={`h-2 ${
        isDark
          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
          : 'bg-gradient-to-r from-emerald-400 to-teal-500'
      }`}
    />

<div className={`p-5 sm:p-6 md:p-7 text-sm md:text-base ${
  isDark ? 'text-slate-200' : 'text-slate-700'
}`}>
<p className={`mb-4 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>        {langAttr === 'he'
          ? 'במידה ותרצה/י לקבל ניתוח מעמיק יותר של התוצאות וההשוואה של התפקוד שלך, ניתן לפנות אלינו במייל:'
          : 'If you would like a deeper analysis of your results and a comparison of your functioning, you may contact us by email:'}
      </p>

      <button
        onClick={() => window.location.href = mailtoHref}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 ${
          isDark
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
        }`}
      >
        <span>📧</span>
        <span>{supportEmail}</span>
      </button>
    </div>
  </div>
)}



        </div>
      </main>
{showExitPopup && (
<div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
  onClick={() => setShowExitPopup(false)}
>   <div
  dir={dir}
  onClick={(e) => e.stopPropagation()}
  className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 text-center ${
        isDark
          ? 'bg-slate-900 text-slate-100 border border-slate-700'
          : 'bg-white text-slate-800 border border-slate-200'
      }`}
    >
<button
  type="button"
  onClick={() => setShowExitPopup(false)}
className={`absolute top-3 ${
  dir === 'rtl' ? 'right-3' : 'left-3'
} flex items-center justify-center w-9 h-9 rounded-full transition ${
  isDark
    ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
    : 'bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100'
}`}
  aria-label={langAttr === 'he' ? 'סגור' : 'Close'}
>
  ✕
</button>
      <h2 className="text-lg font-bold mb-3">
        {exitPopupText.title}
      </h2>

      <p
        className={`text-sm leading-relaxed mb-5 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {exitPopupText.body}
      </p>

      <button
        onClick={() => setShowExitPopup(false)}
        className={`px-5 py-2 rounded-lg font-medium transition ${
          isDark
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
      >
        {exitPopupText.button}
      </button>
    </div>
  </div>
)}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function Thanks() {
  return (
    
      <ThanksInner />
  
  );
}