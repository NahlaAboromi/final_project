import React, { useContext, useEffect, useState, useMemo } from 'react';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext, ThemeProvider } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';
import { useLocation, useNavigate } from 'react-router-dom';
import AnswerCard from '../studentPages/AnswerCard';
import SocraticCoach from './SocraticCoach';
import ValidatedQuestionnaireButton from './ValidatedQuestionnaireButton';
import { useI18n } from '../utils/i18n'; // ✅ מילון מקומי ומהיר
import ProgressSteps from './ProgressSteps';
// Helper
const isExperimental = (g = '') => ['A', 'B', 'C'].includes(String(g).toUpperCase());

function AnonymousSimulationResultInner() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // ✅ i18n
  const { t, dir, lang } = useI18n('anonymousSimulationResult');

  const { student } = useStudent?.() || { student: null };
  const navigate = useNavigate();
  const location = useLocation();
useEffect(() => {
  // ✅ ביטול נעילת שפה אם המשתמש חזר לדף שבו לא אמורה להיות נעילה
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

  const navShowSocratic = location.state?.showSocratic; // true/false/undefined
  const anonId = location.state?.anonId || student?.anonId || null;

  const [answer, setAnswer] = useState(null);
  const [group, setGroup] = useState('');          // 'A'|'B'|'C'|'D'
  const [groupType, setGroupType] = useState('');  // 'experimental'|'control'
  const [chatCompleted, setChatCompleted] = useState(false);
const [showPostHint, setShowPostHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
const [showInfo, setShowInfo] = useState(false);
const [chatLog, setChatLog] = useState([]);
const [chatTiming, setChatTiming] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        if (!anonId) {
          setErr(t('missingAnon'));
          setLoading(false);
          return;
        }

        // 1) Load latest answer + AI analysis
        const res = await fetch(`/api/latest/${anonId}`);
        if (!res.ok) throw new Error(t('failAnalysis'));
        const data = await res.json();
        setChatLog(Array.isArray(data.chatLog) ? data.chatLog : []);
        if (data?.chatStats) {
  const stats = data.chatStats;

  const elapsed =
    stats.timerRunning && stats.currentRunStartedAt
      ? (stats.accumulatedSec || 0) +
        Math.floor((Date.now() - new Date(stats.currentRunStartedAt).getTime()) / 1000)
      : (stats.accumulatedSec || 0);

setChatTiming({
  elapsedSec: elapsed,
  remainingSec: Math.max(0, 480 - elapsed),
  targetSec: 480
});
}
        const lastAnswerText =
          Array.isArray(data.answers) && data.answers.length
            ? data.answers[data.answers.length - 1]
            : '';

        setAnswer({
          studentId: `Anonymous-${(anonId || '').slice(-4)}`,
          answerText: lastAnswerText,
          analysisResult: data.aiAnalysisJson || {},
          submittedAt: data.endedAt || new Date().toISOString(),
        });

        // 2) Load trial meta (group) — מבקשים לפי שפה
        const resTrial = await fetch(`/api/trial/${anonId}?lang=${encodeURIComponent(lang || 'en')}`);
        if (!resTrial.ok) throw new Error(t('failTrialMeta'));
        const tMeta = await resTrial.json();
        const g = String(tMeta.group || '').toUpperCase();
        setGroup(g);
        setGroupType(tMeta.groupType || (g === 'D' ? 'control' : 'experimental'));
      } catch (e) {
        setErr(e.message || 'Load error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonId, lang]);

  // Final decision: should we show the Socratic chat?
  const showSocratic = typeof navShowSocratic === 'boolean'
    ? !!navShowSocratic
    : isExperimental(group);
const MODAL_TEXT = lang === 'he'
  ? (
      showSocratic
        ? {
            title: 'עוד לא סיימנו!',
            body1: 'גלל/י למטה — הבוט הסוקרטי מחכה לך.',
            body2: 'זה חלק חשוב בניסוי,',
            body3: 'אל תדלג/י עליו.',
            go: 'קח/י אותי לשם ↓',
            stay: 'הבנתי, אגלגל לבד',
            time: 'השיחה בדרך כלל אורכת כ-7–8 דקות',
          }
        : {
            title: 'עוד לא סיימנו!',
            body1: 'סליחה שאנחנו קוטעים אותך בזמן קריאת הניתוח.',
            body2: 'חשוב לנו להזכיר שעדיין לא סיימנו כאן.',
            body3: 'אחרי הקריאה, גלל/י למטה — שם מחכה לך הכפתור למעבר לשלב הבא, שהוא שאלון ה-POST.',
            go: 'קח/י אותי לשם ↓',
            stay: 'הבנתי, אגלגל לבד',
          }
    )
  : (
      showSocratic
        ? {
            title: 'We’re not done yet!',
            body1: 'Scroll down — the Socratic bot is waiting for you.',
            body2: 'This is an important part of the study,',
            body3: 'please do not skip it.',
            go: 'Take me there ↓',
            stay: 'Got it, I’ll scroll myself',
            time: 'The conversation usually takes about 7–8 minutes',
          }
        : {
            title: 'We’re not done yet!',
            body1: 'Sorry for interrupting while you’re reading the analysis.',
            body2: 'We just wanted to remind you that there is still one short step left.',
            body3: 'After reading, scroll down — the button for the next step, the POST questionnaire, is waiting for you there.',
            go: 'Take me there ↓',
            stay: 'Got it, I’ll scroll myself',
          }
    ); 
    const CHAT_UI_TEXT = lang === 'he'
  ? {
      sectionLabel: 'חלק מרכזי בתהליך המחקר',
      duration: 'כ-7–8 דקות',
      noSkip: 'חשוב לא לדלג',
      shortLead: 'שיחה קצרה עם Casely שתעזור לך לחשוב על ההחלטות והרגשות שעלו אצלך בסימולציה.',
    }
  : {
      sectionLabel: 'A central part of the study',
      duration: 'About 7–8 minutes',
      noSkip: 'Important not to skip',
      shortLead: 'A short conversation with Casely to help you reflect on your decisions and feelings.',
    };
useEffect(() => {
  if (!loading && !err && group) {
    const timer = setTimeout(() => {
      setShowPostHint(true);
    }, 1000);

    return () => clearTimeout(timer);
  }
}, [loading, err, group]);
return (
  <div
    className={`flex flex-col min-h-screen w-screen ${
      isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
    }`}
    
    dir={dir}
    style={{
      fontFamily:
        'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
  >
  {showInfo && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    onClick={() => setShowInfo(false)}
  >
<div

  onClick={(e) => e.stopPropagation()}
  className={`relative max-w-md w-full p-5 rounded-2xl shadow-lg ${
    isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
  }`}
  dir={dir}
>
      <h4 className="font-bold text-lg mb-3">
        {lang === 'he' ? 'מה זה Casely?' : 'What is Casely?'}
      </h4>
<button
  type="button"
  onClick={() => setShowInfo(false)}
  className={`absolute top-3 ${
dir === 'rtl' ? 'left-3' : 'right-3'  } flex items-center justify-center w-8 h-8 rounded-full transition ${
    isDark
      ? 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'
      : 'bg-slate-100 text-slate-500 hover:text-black hover:bg-slate-200'
  }`}
>
  ✕
</button>
<p className="text-sm leading-6">
  {lang === 'he'
    ? `Casely הוא מאמן סוקרטי מבוסס בינה מלאכותית שמוביל שיחה קצרה ומונחית,
שמטרתה לעזור לך להבין טוב יותר את המחשבות, הרגשות וההחלטות שלך במהלך הסימולציה.

השיחה מבוססת על עקרונות SEL (למידה רגשית-חברתית), ומעודדת רפלקציה עצמית, מודעות רגשית וקבלת החלטות אחראית — בלי שיפוט, בלי תשובות נכונות או לא נכונות.

זהו חלק מרכזי במחקר, שנועד לבדוק כיצד שיחה קצרה יכולה לתרום להתפתחות אישית וללמידה רגשית.`
    : `Casely is an AI-based Socratic coach that guides a short, structured conversation designed to help you better understand your thoughts, emotions, and decisions during the simulation.

The dialogue is based on Social-Emotional Learning (SEL) principles, encouraging self-reflection, emotional awareness, and responsible decision-making — without judgment and without right or wrong answers.

This is a central part of the study, aiming to explore how a brief conversation can support personal growth and emotional learning.`}
</p>
    </div>
  </div>
)}
    {showPostHint && (
<div
  className="fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4"
  onClick={() => setShowPostHint(false)}
>   <div
  onClick={(e) => e.stopPropagation()}
  className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
          dir={dir}
        >
        
          <div className="flex justify-center mb-4">
<div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
  isDark ? 'bg-slate-700 text-slate-200' : 'bg-violet-50 text-violet-500'
}`}>
  <span className="animate-bounce [animation-duration:1.2s]">↓</span>
</div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-4">
            {MODAL_TEXT.title}
          </h3>

          <div className="text-center leading-8 text-base mb-5">
            <p>{MODAL_TEXT.body1}</p>
            <p>{MODAL_TEXT.body2}</p>
            <p>{MODAL_TEXT.body3}</p>
          </div>

{MODAL_TEXT.time && (
  <div className="flex justify-center mb-5">
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
      isDark ? 'bg-slate-700 text-slate-200' : 'bg-violet-50 text-violet-600'
    }`}>
      <span>🕒</span>
      {MODAL_TEXT.time}
    </span>
  </div>
)}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
document.getElementById(showSocratic ? 'socratic-section' : 'post-questionnaire')?.scrollIntoView({                  behavior: 'smooth',
                  block: 'start',
                });
                setShowPostHint(false);
              }}
              className={`w-full rounded-xl py-3 text-base font-semibold border transition ${
                isDark
                  ? 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              {MODAL_TEXT.go}
            </button>

            <button
              onClick={() => setShowPostHint(false)}
              className={`w-full rounded-xl py-3 text-base font-medium border transition ${
                isDark
                  ? 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              {MODAL_TEXT.stay}
            </button>
          </div>
        </div>
      </div>
    )}
      {/* Header */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* Main */}
      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
      <div className="mb-4 sm:mb-6">
<ProgressSteps
  groupType={groupType === 'control' ? 'control' : 'experiment'}
  currentStep={4}
  language={lang}
  isDark={isDark}
/>
</div>
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 md:p-7 rounded`}>
          <div className={`rounded-lg shadow-md p-6 md:p-8 ${isDark ? 'bg-slate-600 border border-slate-500 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
            <h2 className="text-2xl font-bold mb-2 text-center">{t('title')}</h2>
            {/* ✅ small green hint under title */}
{!loading && !err && group && (
<div className="mt-1 text-center text-sm font-bold text-green-600">    {group === 'D'
      ? (
        lang === 'he'
          ? 'סיימתם בהצלחה את הסימולציה. כדי להמשיך, רדו לתחתית הדף ולחצו על המעבר לשלב הבא.'
          : 'You have successfully completed the simulation. To continue, scroll to the bottom of the page and move to the next step.'
      )
      : (
        lang === 'he'
          ? 'סיימתם בהצלחה את הסימולציה. זה עדיין לא הסוף. רדו לתחתית הדף, שם מחכה לכם הבוט הסוקרטי.'
          : 'You have successfully completed the simulation. This is not the end yet. Scroll to the bottom of the page where the Socratic bot is waiting for you.'
      )
    }
  </div>
)}

            {/* קו מידע קבוצה (מוסתר לעת עתה) */}
            <p aria-hidden="true" className="hidden text-center text-sm opacity-80 mb-6">
              {t('groupLabel', 'Group')} <b>{group || '—'}</b> · {groupType === 'control' ? t('groupMetaControl') : t('groupMetaExp')}
            </p>

            {loading && (
              <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
                <div
                  className={`w-10 h-10 border-4 rounded-full animate-spin
                    ${isDark ? 'border-white/30 border-t-white' : 'border-slate-300 border-t-blue-600'}`}
                  aria-label="Loading"
                />
                <p className="mt-3 text-sm opacity-80">{t('preparing')}</p>
              </div>
            )}

            {err && (
              <div className={`text-center mb-4 p-4 rounded ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                <div className="mb-3 font-medium text-red-600 dark:text-red-300">{t('couldntLoad')}</div>
                <div className="text-sm opacity-80">{err}</div>
                <button onClick={() => navigate('/study/home')} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
                  {t('back')}
                </button>
              </div>
            )}

            {/* Analysis card */}
            {!loading && !err && answer && (
              <div className="w-full">
                <AnswerCard answer={answer} isDark={isDark} />
              </div>
            )}

            {/* CONTROL (D): Button only */}
   {!loading && !err && !showSocratic && (
  <div className="mt-6" id="post-questionnaire">
                <ValidatedQuestionnaireButton
                  anonId={anonId}
                  label={t('vqBtn')}
                />
              </div>
            )}

            {/* EXPERIMENTAL (A/B/C): Socratic chat → then button */}
{!loading && !err && showSocratic && (
  <div className="mt-8" id="socratic-section">
    <div
      className={`mb-6 rounded-2xl border p-5 md:p-6 shadow-sm ${
        isDark
          ? 'bg-slate-700 border-slate-500 text-white'
          : 'bg-gradient-to-br from-violet-50 via-white to-blue-50 border-violet-200 text-slate-800'
      }`}
    >
      <div className={`flex items-center gap-3 mb-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
            isDark ? 'bg-slate-600' : 'bg-violet-100'
          }`}
        >
          🤖
        </div>

        <div className="flex-1">
<div className="flex items-center gap-2">
  <h3 className="text-xl md:text-2xl font-bold leading-tight">
    {t('chatTitle')}
  </h3>

  <button
    className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
      isDark ? 'bg-slate-500 text-white' : 'bg-slate-200 text-slate-700'
    }`}
    onClick={() => setShowInfo(true)}
  >
    ?
  </button>
</div>
        </div>
      </div>

{/* שורה 1 — זמן + חשוב + מרגיע */}
<div className="flex flex-wrap gap-2 mb-2">
  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
    isDark ? 'bg-slate-600 text-slate-100' : 'bg-violet-100 text-violet-700'
  }`}>
    <span>🕒</span>
    {CHAT_UI_TEXT.duration}
  </span>

  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
    isDark ? 'bg-slate-600 text-slate-100' : 'bg-amber-100 text-amber-700'
  }`}>
    <span>⭐</span>
    {CHAT_UI_TEXT.noSkip}
  </span>

  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
    isDark ? 'bg-slate-600 text-slate-100' : 'bg-emerald-100 text-emerald-700'
  }`}>
    <span>😊</span>
    {lang === 'he' ? 'נגמר תוך כ-7–8 דקות' : 'Ends in ~7–8 minutes'}
  </span>
</div>

{/* שורה 2 — מה עושים בשיחה */}
<div className="flex flex-wrap gap-2 mb-4">
  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
    isDark ? 'bg-slate-600 text-slate-100' : 'bg-blue-100 text-blue-700'
  }`}>
    <span>💭</span>
    {lang === 'he' ? 'לחשוב על החלטות' : 'Reflect on decisions'}
  </span>

  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
    isDark ? 'bg-slate-600 text-slate-100' : 'bg-rose-100 text-rose-700'
  }`}>
    <span>❤️</span>
    {lang === 'he' ? 'להבין רגשות' : 'Understand feelings'}
  </span>

  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
    isDark ? 'bg-slate-600 text-slate-100' : 'bg-teal-100 text-teal-700'
  }`}>
    <span>🌱</span>
    {lang === 'he' ? 'מודעות עצמית' : 'Self-awareness'}
  </span>

  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
    isDark ? 'bg-slate-600 text-slate-100' : 'bg-indigo-100 text-indigo-700'
  }`}>
    <span>🎯</span>
    {lang === 'he' ? 'רפלקציה קצרה' : 'Short reflection'}
  </span>
</div>

    </div>

    <SocraticCoach
      anonId={anonId}
      situation={answer?.analysisResult?.situation || location.state?.situation}
      question={answer?.analysisResult?.question || location.state?.question}
      analysisText={answer?.analysisResult ? JSON.stringify(answer.analysisResult) : ''}
      initialChatLog={chatLog}
      initialTiming={chatTiming}
      onComplete={() => setChatCompleted(true)}

    />

    {chatCompleted && (
      <ValidatedQuestionnaireButton
        anonId={anonId}
        label={t('vqBtn')}
        extraState={{ chatCompleted: true }}
      />
    )}


  </div>
)}
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
  
}

export default function AnonymousSimulationResult() {
  return (
    <ThemeProvider>
      <AnonymousSimulationResultInner />
    </ThemeProvider>
  );
}