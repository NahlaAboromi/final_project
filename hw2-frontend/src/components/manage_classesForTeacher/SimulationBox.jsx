import React, { useState, useContext, useEffect, useRef } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * SimulationBox
 * Shows class details (situation + question).
 * When hideChatSide=true (used in ClassDetails with sticky sidebar),
 * the embedded chat column is hidden — the sidebar handles it.
 * When hideChatSide=false (default/standalone), the original embedded chat is shown.
 */
const SimulationBox = ({
  classCode,
  simulationText,
  situation,
  onGetClassInsight,
  hideChatSide = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [messages, setMessages] = useState([]);
  const hasStartedInsight = useRef(false);
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('simulationBox');

  const handleInsightClick = async () => {
    setLoading(true);
    const insight = await onGetClassInsight();
    if (insight) {
      setMessages([{ role: 'assistant', text: insight }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    if (!classCode) return;
    if (hideChatSide) return; // sidebar handles it
    if (hasStartedInsight.current) return;
    hasStartedInsight.current = true;
    handleInsightClick();
  }, [ready, classCode, hideChatSide]);

  if (!ready) return null;

  const labels = {
    classDetails: lang === 'he' ? 'פרטי כיתה' : 'Class Details',
    classCode: lang === 'he' ? 'קוד כיתה:' : 'Class Code:',
    aiChat: lang === 'he' ? 'שיחה עם AI' : 'AI Chat',
    helpTitle: lang === 'he' ? 'איך להשתמש בשיחת AI?' : 'How to use the AI chat?',
    helpText:
      lang === 'he'
        ? `המרצה יכול לשאול את ה־AI שאלות כמו:\n\n• מה החולשה המרכזית של הכיתה?\n• אילו תלמידים צריכים התערבות?\n• הצע פעילות לחיזוק המיומנות החלשה.\n\nהמערכת מנתחת את תשובות הסטודנטים ומספקת תובנות מבוססות AI.`
        : `The teacher can ask the AI questions such as:\n\n• What is the main class weakness?\n• Which students need intervention?\n• Suggest an activity for the weak skill.\n\nThe system analyzes student answers and provides AI-based insights.`,
    placeholder:
      lang === 'he' ? 'כתוב שאלה ל־AI על הכיתה...' : 'Write a question to the AI about the class...',
    askAI: lang === 'he' ? 'שאל AI' : 'Ask AI',
  };

  return (
    <section
      dir={dir}
      lang={lang}
      className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      {/* When hideChatSide=true — full-width details only */}
      {hideChatSide ? (
        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <div>
              <h1 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                <span role="img" aria-label="book">📘</span>
                {labels.classDetails}
              </h1>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span>{labels.classCode}</span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-900 dark:bg-slate-700 dark:text-white">
                  {classCode}
                </span>
              </div>
            </div>
          </div>

          {/* Two columns on md+ */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <h2 className="mb-1.5 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <span></span>
                {t('situationTitle')}
              </h2>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{situation}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <h2 className="mb-1.5 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <span></span>
                {t('questionTitle')}
              </h2>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{simulationText}</p>
            </article>
          </div>
        </div>
      ) : (
        /* Original two-column layout with embedded chat */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] min-h-[330px]">
          {/* Details Side */}
          <div className="bg-white p-4 dark:bg-slate-800">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
              <div>
                <h1 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  <span role="img" aria-label="book">📘</span>
                  {labels.classDetails}
                </h1>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span>{labels.classCode}</span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-900 dark:bg-slate-700 dark:text-white">
                    {classCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                <h2 className="mb-1.5 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <span>🧪</span>
                  {t('situationTitle')}
                </h2>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{situation}</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                <h2 className="mb-1.5 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <span>❓</span>
                  {t('questionTitle')}
                </h2>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{simulationText}</p>
              </article>
            </div>
          </div>

          {/* AI Chat Side (embedded) */}
          <aside className="flex flex-col border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900 lg:border-t-0 lg:border-s">
            <div className="mb-2.5 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                    <span>🧠</span>
                    {labels.aiChat}
                  </h2>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    {lang === 'he'
                      ? 'נהל שיחה עם עוזר ה־AI לקבלת תובנות אקדמיות על מצב הכיתה.'
                      : 'Manage an academic conversation with the AI assistant about the class status.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelp(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                  title={labels.helpTitle}
                >
                  ?
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              {loading && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-300"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-300 [animation-delay:0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-300 [animation-delay:0.3s]"></span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  {lang === 'he' ? 'השיחה תופיע כאן' : 'Conversation will appear here'}
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-6 text-slate-700 dark:bg-emerald-900/20 dark:text-slate-100"
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2.5 flex gap-2">
              <input
                disabled
                placeholder={labels.placeholder}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />
              <button
                onClick={handleInsightClick}
                disabled={loading}
                title={t('tooltip')}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold text-white transition ${
                  loading ? 'cursor-not-allowed bg-gray-500' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? t('buttonLoading') : labels.askAI}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{labels.helpTitle}</h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
              {labels.helpText}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SimulationBox;