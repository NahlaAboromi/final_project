// src/Research/SocraticCoach.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { useNavigate } from 'react-router-dom';

/**
 * SocraticCoach – real AI-backed Socratic chat (Claude/backend).
 * Redesigned with premium UI while preserving all logic intact.
 */
const DEFAULT_TITLE = "Hi! I'm your Socratic Coach ✋";

/* ─── Inline styles injected once ─── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  @keyframes progressShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(30px,-20px) scale(1.08); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-25px,18px) scale(1.05); }
  }
  @keyframes orb3 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(20px,25px) scale(1.06); }
  }
  @keyframes bounceDot {
    0%,80%,100% { transform: translateY(0); }
    40%          { transform: translateY(-6px); }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,.35); }
    50%      { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(6px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes spinnerRing {
    to { transform: rotate(360deg); }
  }

  .sc-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .sc-msg  { animation: msgIn .25s ease both; }

  .sc-input:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px rgba(99,102,241,.55);
  }

  .sc-send-btn:not(:disabled):hover  { filter: brightness(1.1); transform: translateY(-1px); }
  .sc-send-btn:not(:disabled):active { transform: scale(.96); }
  .sc-finish-btn:not(:disabled):hover  { filter: brightness(1.08); transform: translateY(-1px); }
  .sc-finish-btn:not(:disabled):active { transform: scale(.96); }
  .sc-send-btn, .sc-finish-btn { transition: filter .18s, transform .18s, box-shadow .18s; }

  /* scrollbar */
  .sc-chat::-webkit-scrollbar        { width: 5px; }
  .sc-chat::-webkit-scrollbar-track  { background: transparent; }
  .sc-chat::-webkit-scrollbar-thumb  { background: rgba(148,163,184,.35); border-radius: 99px; }
    .sc-input-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
  }

  @media (max-width: 600px) {
    .sc-input-row {
      flex-wrap: wrap;
    }

    .sc-mobile-input {
      flex-basis: 100%;
      width: 100%;
    }

    .sc-mobile-btn {
      flex: 1;
      min-height: 44px;
    }
  }
`;

/* ─── Typing dots ─── */
function TypingDots({ align = 'left', isDark }) {
  const dotStyle = (delay) => ({
    width: 7, height: 7,
    borderRadius: '50%',
    background: isDark ? '#94a3b8' : '#6366f1',
    animation: `bounceDot 1.1s ${delay}s ease-in-out infinite`,
    display: 'inline-block',
  });
  return (
    <div style={{ textAlign: align, marginTop: 4 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '10px 16px',
        borderRadius: 18,
        background: isDark ? 'rgba(51,65,85,.8)' : 'rgba(238,240,255,.9)',
        border: `1px solid ${isDark ? 'rgba(99,102,241,.25)' : 'rgba(99,102,241,.2)'}`,
        backdropFilter: 'blur(8px)',
      }}>
        <span style={dotStyle(0)} />
        <span style={dotStyle(.18)} />
        <span style={dotStyle(.36)} />
      </span>
    </div>
  );
}

/* ─── Spinner ─── */
function Spinner() {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: '50%',
      border: '2.5px solid rgba(255,255,255,.3)',
      borderTopColor: '#fff',
      display: 'inline-block',
      animation: 'spinnerRing .7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export default function SocraticCoach({
  anonId,
  situation,
  question,
  analysisText,
  initialChatLog = [],
  initialTiming = null,
  onComplete,
  title = DEFAULT_TITLE,
  disabled = false,
  startImmediately = true,
}) {
  /* ── contexts ── */
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { theme } = useContext(ThemeContext) || { theme: 'light' };
  const navigate = useNavigate();

  /* ── state ── */
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [finished, setFinished]   = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError]         = useState('');
  const [chatEnded, setChatEnded] = useState(false);
  const [timing, setTiming]       = useState({ elapsedSec: 0, remainingSec: 480, targetSec: 480 });
useEffect(() => {
  if (initialTiming) {
    setTiming(initialTiming);
  }
}, [initialTiming]);
const [startedByUser, setStartedByUser] = useState(false);
  const listRef    = useRef(null);
  const startedRef = useRef({ ran: false, anonId: null });
const [showImportantBox, setShowImportantBox] = useState(true);
  /* ── i18n ── */
  const T = lang === 'he' ? {
    title: 'היי! אני המאמן הסוקרטי שלך ✋',
    missingAnonId: 'חסר anonId', initFailed: 'אתחול נכשל', initError: 'שגיאת אתחול',
    sendFailed: 'שליחה נכשלה', sendError: 'שגיאת שליחה',
    finalizeError: 'לא ניתן היה לסיים את השיחה', aiSummaryFailed: 'יצירת סיכום AI נכשלה',
    inputPlaceholder: 'כתבי את התשובה שלך…', send: 'שלח', finish: 'סיום', processing: 'מעבד…',
    hintBeforeFinish: 'המשך השיחה במשך כ־7–8 דקות חשוב במיוחד למחקר שלנו ויעזור לנו להבין טוב יותר את דרך החשיבה וההתמודדות שלך.',
  } : {
    title: "Hi! I'm your Socratic Coach ✋",
    missingAnonId: 'Missing anonId', initFailed: 'Init failed', initError: 'Init error',
    sendFailed: 'Send failed', sendError: 'Send error',
    finalizeError: 'Failed to finalize conversation', aiSummaryFailed: 'AI summary failed',
    inputPlaceholder: 'Type your reply…', send: 'Send', finish: 'Finish', processing: 'Processing…',
    hintBeforeFinish: 'Continuing the conversation for about 7–8 minutes is especially important for our research and helps us better understand your thinking and coping process.',
  };
  const t = (k) => T[k] ?? k;

  /* ── deriveds ── */
  const isDark = theme === 'dark';
  const isRtl  = lang === 'he';
  const dir    = isRtl ? 'rtl' : 'ltr';

  const rawPercent      = ((timing.elapsedSec || 0) / (timing.targetSec || 480)) * 100;
  const progressPercent = chatEnded ? 100 : Math.min(97, Math.max(0, rawPercent));
  const remainingMinutes = Math.ceil((timing.remainingSec || 0) / 60);

  /* ── timer ── */
  useEffect(() => {
    if (!startedByUser) return;
    if (finished || chatEnded) return;
if ((timing?.remainingSec || 0) <= 0) {
  setChatEnded(true);
  return;
}
    const interval = setInterval(() => {
      setTiming((prev) => ({
        ...prev,
        remainingSec: Math.max(1, (prev?.remainingSec || 0) - 1),
        elapsedSec:   Math.min(prev?.targetSec || 480, (prev?.elapsedSec || 0) + 1),
      }));
    }, 1000);
    return () => clearInterval(interval);
}, [finished, chatEnded, timing.targetSec, startedByUser]);
  /* ── auto scroll ── */
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, chatLoading]);

  /* ── memos ── */
  const canType = useMemo(
    () => !chatEnded && !finished && !disabled && !chatLoading && !finishing,
    [chatEnded, finished, disabled, chatLoading, finishing],
  );
  const canSend = useMemo(() => canType && input.trim().length > 0, [canType, input]);

  /* ── helpers ── */
  const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };
const mapInitialChatLogToMessages = (chatLog = []) => {
  return (Array.isArray(chatLog) ? chatLog : [])
    .filter((m) => m?.text && m.text !== '__CHAT_SESSION_START__')
    .map((m) => ({
      role: m.sender === 'student' ? 'user' : 'assistant',
      text: (m.text || '').toString(),
      ts: m.timestamp || new Date().toISOString(),
    }));
};
useEffect(() => {
  const mapped = mapInitialChatLogToMessages(initialChatLog);
  if (mapped.length > 0) {
    setMessages(mapped);
  }
}, [initialChatLog]);
useEffect(() => {
  return () => {
    if (!anonId) return;

    fetch('/api/trial/chat/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId }),
      keepalive: true,
    }).catch(() => {});
  };
}, [anonId]);
  /* ── init ── */
  async function start() {
    if (startedRef.current.ran && startedRef.current.anonId === anonId) return;
    startedRef.current = { ran: true, anonId };
    try {
      if (!anonId) { setError(t('missingAnonId')); return; }
      setError(''); setChatLoading(true);
      const hasPreviousChat = Array.isArray(initialChatLog) && initialChatLog.some(
  (m) => m?.text && m.text !== '__CHAT_SESSION_START__'
);
      const res  = await fetch('/api/trial/chat/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
  anonId,
  init: !hasPreviousChat,
  situation,
  question,
  analysisText,
  maxTokens: 1000
}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || t('initFailed'));
      const replyRaw = data?.reply;
      const reply = Array.isArray(replyRaw)
        ? (lang === 'he' ? (replyRaw[1] || replyRaw[0]) : (replyRaw[0] || replyRaw[1]))
        : (replyRaw || '').toString();
      if (data?.chatEnded) setChatEnded(true);
      if (data?.timing)    setTiming(data.timing);
if (reply) {
  setMessages((prev) =>
    prev.length > 0
      ? [...prev, { role: 'assistant', text: reply, ts: new Date().toISOString() }]
      : [{ role: 'assistant', text: reply, ts: new Date().toISOString() }]
  );
}    } catch (e) { setError(e.message || t('initError')); }
    finally { setChatLoading(false); }
  }

  useEffect(() => {
    if (startImmediately && anonId) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonId, startImmediately, situation, question, analysisText]);

  /* ── send ── */
  async function send() {
if (!startedByUser) {
  setStartedByUser(true);
}
    const text = input.trim();
    if (!text || !canType) return;
    const nowIso = new Date().toISOString();
    try {
      setError(''); setChatLoading(true);
      setMessages((prev) => [...prev, { role: 'user', text, ts: nowIso }]);
      setInput('');
      const res  = await fetch('/api/trial/chat/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonId, userText: text, maxTokens: 1000 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || t('sendFailed'));
      const replyRaw = data?.reply;
      const reply = Array.isArray(replyRaw)
        ? (lang === 'he' ? (replyRaw[1] || replyRaw[0]) : (replyRaw[0] || replyRaw[1]))
        : (replyRaw || '').toString();
      if (data?.chatEnded) setChatEnded(true);
      if (data?.timing)    setTiming(data.timing);
      if (reply) setMessages((prev) => [...prev, { role: 'assistant', text: reply, ts: new Date().toISOString() }]);
    } catch (e) { setError(e.message || t('sendError')); }
    finally { setChatLoading(false); }
  }

  /* ── finalize ── */
  async function doFinish() {
    if (finished || finishing) return;
    try {
      setError(''); setFinished(true); setFinishing(true);
      if (!anonId) throw new Error(t('missingAnonId'));
      const resp = await fetch('/api/trial/summary/final', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonId, maxTokens: 2000 }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error(data?.error || t('aiSummaryFailed'));
      navigate('/simulation/final-summary', {
        state: { anonId, summaryText: (data.summaryText || '').toString(), from: 'coach-finish' },
      });
    } catch (e) {
      setFinished(false); setFinishing(false);
      setError(e.message || t('finalizeError'));
    }
  }

  function finish() {
    if (finished || finishing) return;
    setShowFinishConfirm(true);
  }

  const shownTitle = title === DEFAULT_TITLE ? t('title') : title;

  /* ──────────────────────── THEME TOKENS ──────────────────────── */
  const C = isDark ? {
    // backgrounds
    rootBg:      'linear-gradient(145deg, #0f172a 0%, #131d31 60%, #0d1829 100%)',
    headerBg:    'rgba(15,23,42,.6)',
    chatBg:      'rgba(8,14,28,.55)',
    inputBg:     'rgba(15,23,42,.7)',
    hintBg:      'rgba(20,30,55,.7)',
    modalBg:     '#0f1e38',
    cancelBg:    'rgba(30,42,68,.8)',
    // borders
    rootBorder:  'rgba(99,102,241,.22)',
    chatBorder:  'rgba(99,102,241,.14)',
    inputBorder: 'rgba(99,102,241,.3)',
    hintBorder:  'rgba(99,102,241,.2)',
    modalBorder: 'rgba(99,102,241,.25)',
    cancelBorder:'rgba(99,102,241,.25)',
    // text
    primary:     '#e2e8f0',
    secondary:   '#94a3b8',
    hint:        '#818cf8',
    hintText:    '#a5b4fc',
    // progress bar track
    trackBg:     'rgba(30,42,68,.8)',
    // assistant bubble
    asstBg:      'rgba(30,41,64,.9)',
    asstBorder:  'rgba(99,102,241,.25)',
    asstText:    '#e2e8f0',
    // orbs
    orb1: 'rgba(99,102,241,.12)',
    orb2: 'rgba(139,92,246,.09)',
    orb3: 'rgba(59,130,246,.08)',
  } : {
    rootBg:      'linear-gradient(145deg, #f8f9ff 0%, #f0f2ff 55%, #eef0fb 100%)',
    headerBg:    'rgba(255,255,255,.7)',
    chatBg:      'rgba(255,255,255,.65)',
    inputBg:     'rgba(255,255,255,.9)',
    hintBg:      'rgba(238,240,255,.7)',
    modalBg:     '#fff',
    cancelBg:    '#f8f9ff',
    rootBorder:  'rgba(99,102,241,.18)',
    chatBorder:  'rgba(99,102,241,.12)',
    inputBorder: 'rgba(99,102,241,.3)',
    hintBorder:  'rgba(99,102,241,.2)',
    modalBorder: 'rgba(99,102,241,.18)',
    cancelBorder:'rgba(99,102,241,.25)',
    primary:     '#1e1b4b',
    secondary:   '#64748b',
    hint:        '#6366f1',
    hintText:    '#4f46e5',
    trackBg:     'rgba(199,210,254,.4)',
    asstBg:      'rgba(238,240,255,.8)',
    asstBorder:  'rgba(99,102,241,.18)',
    asstText:    '#1e1b4b',
    orb1: 'rgba(99,102,241,.08)',
    orb2: 'rgba(139,92,246,.07)',
    orb3: 'rgba(79,70,229,.06)',
  };

  /* ── bubble border-radius by direction ── */
  const bubbleRadius = (isUser) => {
    if (isUser)  return isRtl ? '18px 18px 18px 4px' : '18px 18px 4px 18px';
    return isRtl ? '4px 18px 18px 18px' : '18px 4px 18px 18px';
  };

  /* ── message alignment by direction ── */
  const msgAlign      = (isUser) => (isUser ? (isRtl ? 'left'     : 'right'    ) : (isRtl ? 'right'    : 'left'    ));
  const msgItemsAlign = (isUser) => (isUser ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'));

  /* ──────────────────────── RENDER ──────────────────────── */
  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Confirm modal ── */}
      {showFinishConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          {/* backdrop */}
          <div
            onClick={() => setShowFinishConfirm(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)' }}
          />
          {/* card */}
          <div style={{
            position: 'relative', width: '100%', maxWidth: 420,
            background: C.modalBg, border: `1px solid ${C.modalBorder}`,
            borderRadius: 20, padding: '28px 28px 24px',
            boxShadow: '0 24px 64px rgba(0,0,0,.25)',
            animation: 'fadeSlideUp .22s ease both',
            fontFamily: "'DM Sans', sans-serif",
            color: C.primary, direction: dir,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
              {lang === 'he' ? 'לסיים את השיחה?' : 'Finish the chat?'}
            </h3>
            <p style={{ fontSize: 13.5, color: C.secondary, lineHeight: 1.6, marginBottom: 22 }}>
              {lang === 'he'
                ? 'לחיצה על Finish תעביר אותך לשלב הבא ולא ניתן לחזור.'
                : "Clicking Finish will move you forward and you won't be able to return."}
            </p>
            {/* ✅ flex-direction follows dir naturally via dir="rtl/ltr" on parent */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowFinishConfirm(false)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  border: `1.5px solid ${C.cancelBorder}`,
                  background: C.cancelBg, color: C.primary,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'filter .15s',
                }}
              >
                {lang === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                onClick={() => { setShowFinishConfirm(false); doFinish(); }}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none', color: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,.4)',
                  transition: 'filter .15s, transform .15s',
                }}
              >
                {lang === 'he' ? 'כן, לסיים' : 'Yes, finish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Root card ── */}
      <div
        className="sc-root"
        dir={dir}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 24,
          border: `1px solid ${C.rootBorder}`,
          background: C.rootBg,
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(99,102,241,.12)'
            : '0 8px 40px rgba(99,102,241,.1), inset 0 1px 0 rgba(255,255,255,.9)',
          padding: '28px 28px 22px',
          color: C.primary,
        }}
      >
        {/* Background orbs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 260, height: 260, borderRadius: '50%', background: C.orb1, filter: 'blur(60px)', animation: 'orb1 9s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-40px',  width: 220, height: 220, borderRadius: '50%', background: C.orb2, filter: 'blur(55px)', animation: 'orb2 11s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '40%', left: '30%',         width: 180, height: 180, borderRadius: '50%', background: C.orb3, filter: 'blur(50px)', animation: 'orb3 13s ease-in-out infinite' }} />
        </div>

        {/* All content above orbs */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── Header ── */}
          {/* ✅ removed manual flexDirection — dir="rtl/ltr" on root handles it */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 14, marginBottom: 22,
          }}>
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 0 0 3px rgba(99,102,241,.2), 0 4px 14px rgba(99,102,241,.35)',
              animation: 'pulseGlow 3s ease-in-out infinite',
            }}>✋</div>

            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.2 }}>
                {shownTitle.replace(' ✋', '')}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
<span
  style={{
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: chatEnded ? '#ef4444' : '#22c55e',
    display: 'inline-block',
    boxShadow: chatEnded
      ? '0 0 6px rgba(239,68,68,.7)'
      : '0 0 6px rgba(34,197,94,.7)',
  }}
/>

<span style={{ fontSize: 11.5, color: C.secondary, fontWeight: 500 }}>
  {chatEnded
    ? (lang === 'he' ? 'מנותק' : 'Offline')
    : (lang === 'he' ? 'מחובר' : 'Online')}
</span>
              </div>
            </div>
          </div>

          {/* ── Progress bar ── */}
          {!finished && (
            <div style={{ marginBottom: 18 }}>
              {/* ✅ dir on root already sets text-align; only fix needed is the badge direction lock */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: C.secondary,
                  textTransform: 'uppercase', letterSpacing: '.06em',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {lang === 'he' ? 'התקדמות' : 'Progress'}
                </span>

                <div style={{
                  flex: '0 1 180px',
                  height: 5,
                  borderRadius: 99,
                  overflow: 'hidden',
                  background: C.trackBg,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    borderRadius: 99,
                    background: progressPercent > 75
                      ? 'linear-gradient(90deg,#10b981,#34d399)'
                      : 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)',
                    transition: 'width 1s linear',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(120deg,transparent 25%,rgba(255,255,255,.4) 50%,transparent 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'progressShimmer 2s linear infinite',
                    }} />
                  </div>
                </div>

                {/* ✅ direction: ltr locks the time badge so "~X min" never reverses */}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  whiteSpace: 'nowrap', direction: 'ltr', flexShrink: 0,
                  color: progressPercent > 75 ? '#10b981' : C.hint,
                  background: progressPercent > 75
                    ? 'rgba(16,185,129,.1)' : (isDark ? 'rgba(99,102,241,.15)' : 'rgba(99,102,241,.1)'),
                  padding: '2px 8px', borderRadius: 20,
                  border: `1px solid ${progressPercent > 75 ? 'rgba(16,185,129,.2)' : 'rgba(99,102,241,.2)'}`,
                }}>
                  {lang === 'he' ? `~${remainingMinutes} דק׳` : `~${remainingMinutes} min`}
                </span>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{
              marginBottom: 14, fontSize: 13,
              background: 'rgba(239,68,68,.1)',
              border: '1px solid rgba(239,68,68,.25)',
              color: isDark ? '#fca5a5' : '#b91c1c',
              borderRadius: 12, padding: '10px 14px',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }} aria-live="polite">
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
              <span style={{ lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* ── Chat area ── */}
          {showImportantBox && (
  <div style={{
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(16,185,129,.35)',
    background: 'rgba(16,185,129,.12)',
    backdropFilter: 'blur(8px)',
  }}>
    
   

{/* body */}
<div style={{
  padding: '12px 14px',
  fontSize: 13,
  lineHeight: 1.6,
  color: isDark ? '#d1fae5' : '#065f46',
  textAlign: isRtl ? 'right' : 'left',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
}}>
<span>
  {lang === 'he'
    ? 'השיחה הזו היא חלק חשוב מהמחקר ונמשכת רק 8 דקות – נשמח מאוד אם תשלים אותה עד הסוף'
    : 'This conversation is an important part of the research and takes about 8 minutes — we would really appreciate if you complete it.'}
</span>

  <button
    onClick={() => setShowImportantBox(false)}
    style={{
      background: 'transparent',
      border: 'none',
      color: isDark ? '#d1fae5' : '#065f46',
      fontSize: 16,
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    ✕
  </button>
</div>
  </div>
)}
          <div
            ref={listRef}
            className="sc-chat"
            style={{
              height: 300,
              overflowY: 'auto',
              marginBottom: 14,
              borderRadius: 16,
              padding: '14px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
              background: C.chatBg,
              border: `1px solid ${C.chatBorder}`,
              backdropFilter: 'blur(12px)',
              scrollBehavior: 'smooth',
            }}
          >
            {messages.map((m, i) => {
              const isUser = m.role === 'user';
              return (
                <div key={i} className="sc-msg" style={{ textAlign: msgAlign(isUser) }}>
                  <div style={{
                    display: 'inline-flex', flexDirection: 'column',
                    alignItems: msgItemsAlign(isUser),
                    maxWidth: '85%',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '10px 15px',
                      borderRadius: bubbleRadius(isUser),
                      fontSize: 14, lineHeight: 1.6,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      ...(isUser ? {
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(99,102,241,.35)',
                        fontWeight: 500,
                      } : {
                        background: C.asstBg,
                        color: C.asstText,
                        border: `1px solid ${C.asstBorder}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                      }),
                    }}>
                      {m.text}
                    </span>
                    <span style={{ marginTop: 4, fontSize: 10.5, color: C.secondary, fontWeight: 500 }}>
                      {fmtTime(m.ts)}
                    </span>
                  </div>
                </div>
              );
            })}

            {chatLoading && !finishing && (
              <TypingDots align={isRtl ? 'right' : 'left'} isDark={isDark} />
            )}
          </div>

          {/* ── Input row ── */}
          {/* ✅ dir on root handles order; no manual flexDirection needed */}
<div className="sc-input-row">
            <input
              className="sc-input sc-mobile-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!canType}
              placeholder={chatEnded
                ? (lang === 'he' ? 'השיחה הסתיימה' : 'Chat ended')
                : t('inputPlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canSend) send(); }
              }}
              style={{
                flex: '1 1 auto', minWidth: 0,
                padding: '12px 16px',
                borderRadius: 14,
                border: `1.5px solid ${C.inputBorder}`,
                background: C.inputBg,
                backdropFilter: 'blur(8px)',
                color: C.primary,
                fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color .2s, box-shadow .2s',
                opacity: !canType ? .6 : 1,
                cursor: finishing ? 'wait' : 'text',
                /* ✅ input text direction always follows page dir via inheritance */
                textAlign: isRtl ? 'right' : 'left',
              }}
            />

            {/* Send */}
            <button
              className="sc-send-btn sc-mobile-btn"
              onClick={send}
              disabled={!canSend}
              style={{
                padding: '0 20px', borderRadius: 14, border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
                background: canSend
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : (isDark ? 'rgba(51,65,85,.5)' : 'rgba(203,213,225,.6)'),
                color: '#fff', fontWeight: 700, fontSize: 14,
                boxShadow: canSend ? '0 4px 14px rgba(99,102,241,.35)' : 'none',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {t('send')}
            </button>

            {/* Finish */}
            <button
              className="sc-finish-btn sc-mobile-btn"
              onClick={() => { if (chatEnded) { doFinish(); } else { setShowFinishConfirm(true); } }}
              disabled={finished || finishing}
              aria-busy={finishing ? 'true' : 'false'}
              style={{
                padding: '0 20px', borderRadius: 14, border: 'none',
                cursor: finished || finishing ? (finishing ? 'wait' : 'not-allowed') : 'pointer',
                background: finished || finishing
                  ? (isDark ? 'rgba(51,65,85,.5)' : 'rgba(203,213,225,.6)')
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                boxShadow: finished || finishing ? 'none' : '0 4px 14px rgba(16,185,129,.3)',
                display: 'flex', alignItems: 'center', gap: 7,
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
                opacity: finished && !finishing ? .6 : 1,
              }}
            >
              {finishing ? (
                <><Spinner /><span>{t('processing')}</span></>
              ) : chatEnded
                ? (lang === 'he' ? 'המשך לסיכום' : 'Continue')
                : t('finish')}
            </button>
          </div>

          {/* ── Hint ── */}
          {!finished && (
            <div style={{
              marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 9,
              padding: '11px 14px', borderRadius: 12,
              background: C.hintBg, border: `1px solid ${C.hintBorder}`,
              backdropFilter: 'blur(8px)',
              /* ✅ dir on root handles icon/text order automatically */
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: 12, color: C.hintText, lineHeight: 1.65, fontWeight: 500 }}>
                {t('hintBeforeFinish')}
              </p>
            </div>
          )}

        </div>{/* /z-index wrapper */}
      </div>{/* /root card */}
    </>
  );
}
