// ClassDetails.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import SimulationBox from './SimulationBox';
import NewStudentAnswerCard from './NewStudentAnswerCard';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const ClassDetailsContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { classCode: encoded } = useParams();
  const classCode = decodeURIComponent(encoded || '');

  const [classInfo, setClassInfo] = useState(null);
  const [classInsight, setClassInsight] = useState('');
  const { user } = useContext(UserContext);

  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('classDetails');

  useEffect(() => {
    const fetchClassInfo = async () => {
      const url = `/api/classes/get-class-by-code?classCode=${classCode}`;
      try {
        const res = await fetch(url);
        const data = await res.json().catch(e => {
          console.warn('JSON parse failed:', e);
          return null;
        });
        setClassInfo(data);
      } catch (error) {
        console.error('❌ Failed to fetch class data:', error);
      }
    };
    fetchClassInfo();
  }, [classCode]);

  const groupedStudents = useMemo(() => {
    if (!Array.isArray(classInfo?.students)) return [];
    const groups = {};
    classInfo.students.forEach((attempt) => {
      const id = attempt?.studentId || attempt?._id || 'unknown';
      if (!groups[id]) {
        groups[id] = { studentId: id, student: attempt, attempts: [] };
      }
      groups[id].attempts.push(attempt);
    });
    return Object.values(groups).map((group) => {
      const sortedAttempts = [...group.attempts].sort((a, b) => {
        const dateA = new Date(a?.submittedAt || 0).getTime();
        const dateB = new Date(b?.submittedAt || 0).getTime();
        return dateB - dateA;
      });
      return { ...group, attempts: sortedAttempts, latestAttempt: sortedAttempts[0] };
    });
  }, [classInfo]);

  const getClassInsightFromAI = async () => {
    try {
      const res = await fetch('/api/classes/ai-class-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode }),
      });
      const data = await res.json().catch(e => {
        console.warn('JSON parse failed:', e);
        return null;
      });
      if (res.ok && data) {
        setClassInsight(data.insight);
        return data.insight;
      } else {
        const msg = `⚠️ ${data?.message || ''}`.trim() || t('aiServerError');
        setClassInsight(msg);
        return msg;
      }
    } catch (error) {
      console.error('❌ Error getting AI class insight:', error);
      setClassInsight(t('aiServerError'));
      return t('aiServerError');
    }
  };

  if (!ready) return null;

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 px-4 py-2 shadow-sm ${
        isDark ? 'bg-slate-900 border-b border-slate-700' : 'bg-white border-b border-slate-200'
      }`}>
        <TeacherHeader />
      </div>

      {/* Main layout: content + sticky sidebar */}
      <div className={`flex flex-1 w-full items-start ${
        lang === 'he' ? 'flex-row' : 'flex-row-reverse'
      }`} dir="ltr">

        {/* Left/Main scrollable content */}
        <main className="flex-1 px-4 py-6 min-w-0">
          {classInfo ? (
            <>
              <SimulationBox
                classCode={classCode}
                simulationText={classInfo.question}
                situation={classInfo.situation}
                onGetClassInsight={getClassInsightFromAI}
                hideChatSide={true}
              />

              {/* Students list */}
              <div className="mt-4 space-y-3">
                {Array.isArray(classInfo.students) ? (
                  groupedStudents.map((group) => (
                    <NewStudentAnswerCard
                      key={group.studentId}
                      answer={group.latestAttempt}
                      student={group.student}
                      attempts={group.attempts}
                      isDark={isDark}
                    />
                  ))
                ) : (
                  <p className="text-red-500 text-sm">{t('studentsNotArray')}</p>
                )}
              </div>
            </>
          ) : (
<div className="flex flex-col items-center justify-center py-20">
  <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
 <div
  className="mt-4 text-sm"
  dir={lang === 'he' ? 'rtl' : 'ltr'}
>
  {t('loading')}
</div>
</div>          )}


        </main>

        {/* Sticky AI Chat Sidebar */}
        <aside
          className={`hidden lg:flex flex-col w-[400px] shrink-0 sticky top-[88px] h-[calc(100vh-112px)] self-start p-4 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}
        >
          <AIChatPanel
            classCode={classCode}
            onGetClassInsight={getClassInsightFromAI}
            classInsight={classInsight}
            lang={lang}
            isDark={isDark}
          />
        </aside>
      </div>
{/* Footer */}
<div className="mt-auto px-4 pb-4">
  <Footer />
</div>
      {/* Mobile: floating AIChat button */}
      {user?.id && (
        <div className="lg:hidden">
          <AIChat teacherId={user.id} />
        </div>
      )}
    </div>
  );
};

const AIChatPanel = ({ classCode, onGetClassInsight, classInsight, lang, isDark }) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const hasStarted = React.useRef(false);
  const messagesEndRef = React.useRef(null);
  const messagesContainerRef = React.useRef(null);

  const labels = {
    aiChat: lang === 'he' ? 'עוזר AI לכיתה' : 'Class AI Assistant',
    placeholder: lang === 'he' ? 'שאל שאלה על הכיתה...' : 'Ask about the class...',
    askAI: lang === 'he' ? 'שאל' : 'Ask',
    helpTitle: lang === 'he' ? 'איך להשתמש?' : 'How to use?',
    helpText: lang === 'he'
      ? `שאל שאלות כמו:\n• מה החולשה המרכזית?\n• אילו תלמידים צריכים עזרה?\n• הצע פעילות לחיזוק.`
      : `Ask questions like:\n• What is the main weakness?\n• Which students need help?\n• Suggest a reinforcement activity.`,
    emptyState: lang === 'he' ? 'התובנות יופיעו כאן' : 'Insights will appear here',
  };

  useEffect(() => {
    if (!classCode) return;
    if (hasStarted.current) return;
    hasStarted.current = true;
    handleFetchInsight();
  }, [classCode]);

  useEffect(() => {
    const box = messagesContainerRef.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [messages]);

  const handleFetchInsight = async () => {
    setLoading(true);
    const insight = await onGetClassInsight();
    if (insight) {
      setMessages([{ role: 'assistant', text: insight, ts: Date.now() }]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || loading) return;

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text, ts: Date.now() }]);
    setLoading(true);

    try {
      const res = await fetch('/api/classes/class-ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode, teacherMessage: text }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply, ts: Date.now() }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', text: data?.message || 'אירעה שגיאה בקבלת תשובה מה־AI.', ts: Date.now() }
        ]);
      }
    } catch (error) {
      console.error('❌ Error sending class AI chat message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'אירעה שגיאה בחיבור לשרת.', ts: Date.now() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className="flex h-full max-h-full min-h-0 flex-col overflow-hidden rounded-[24px] border-2 border-slate-300 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800"
    >
      {/* Panel Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isDark ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white text-sm">
            🧠
          </div>
          <div>
            <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {labels.aiChat}
            </h2>
            <p className={`mt-0.5 text-[11px] leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'he'
                ? 'זה העוזר שלך. תשוחח איתו על מצב הכיתה.'
                : 'This is your assistant. Chat with it about the class status.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition ${
            isDark
              ? 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          ?
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
className="m-3 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
style={{
  scrollbarColor: isDark ? '#475569 transparent' : '#94a3b8 transparent',
  scrollbarWidth: 'thin',
}}     >
        <div className="flex min-h-full flex-col justify-start gap-3">
          {loading && messages.length === 0 ? (
            <div className="flex justify-start">
              <div className={`flex items-center gap-1.5 rounded-xl px-4 py-3 ${
                isDark ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.15s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.3s]"></span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className={`flex h-full items-center justify-center text-xs ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {labels.emptyState}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                // ✅ תיקון: assistant תמיד שמאל, user תמיד ימין — ללא תלות בשפה
                className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                {msg.role === 'assistant' && (
<div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    🧠
                  </div>
                )}
                <div
                  className={`max-w-[72%] whitespace-pre-line rounded-2xl px-3 py-2 text-xs leading-6 ${
                    msg.role === 'user'
                      ? 'rounded-tl-sm bg-emerald-600 text-white'
                      : isDark
                      ? 'rounded-bl-sm bg-slate-700 text-slate-100'
                      : 'rounded-bl-sm bg-slate-100 text-slate-800'
                  }`}
                >
                  <div>{msg.text}</div>
                  <div
                    className={`mt-1 text-[9px] ${
                      msg.role === 'user'
                        ? 'text-emerald-100'
                        : isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {new Date(msg.ts || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading bubble when there are existing messages */}
          {loading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className={`mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white`}>
                🧠
              </div>
              <div className={`rounded-2xl rounded-bl-sm px-3 py-2 ${
                isDark ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0.3s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t p-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.placeholder}
            disabled={loading}
            className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-xs outline-none transition ${
              isDark
                ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-emerald-500'
                : 'border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            className="shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {labels.askAI}
          </button>
        </div>
        <p className={`mt-1.5 text-center text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {lang === 'he' ? 'Enter לשליחה' : 'Press Enter to send'}
        </p>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`w-full max-w-md rounded-2xl p-5 shadow-xl ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {labels.helpTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-lg font-bold transition ${
                  isDark
                    ? 'border-slate-600 bg-slate-700 text-white hover:bg-slate-600'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✕
              </button>
            </div>
            <p className={`whitespace-pre-line text-sm leading-7 ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {labels.helpText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewClassDetails = () => <ClassDetailsContent />;
export default ViewClassDetails;