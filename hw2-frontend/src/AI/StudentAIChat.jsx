import React, { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n';

const AIChat = ({ studentId, studentName }) => {
  const [showBox, setShowBox] = useState(false);
  const [input, setInput] = useState('');
const [showHelp, setShowHelp] = useState(false);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // language + i18n
  const ctx = useContext(LanguageContext) || {};
  const lang = ctx.lang ?? (document.documentElement.lang === 'he' ? 'he' : 'en');
  const isRTL = lang === 'he';
  const { t, ready } = useI18n('studentAiChat');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);
  const greetingRef = useRef('');

  const toggleChatBox = () => setShowBox(v => !v);
  const closeChat = () => setShowBox(false);

  const scrollToBottom = () => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Insert/update greeting based on language (safe name replacement)
  useEffect(() => {
    if (!showBox || !ready) return;

    const nameSafe = studentName || '';
    const rawGreeting = t('greeting') || '';
    const greeting = rawGreeting.replace('{name}', nameSafe);

    setMessages(prev => {
      if (prev.length === 0) {
        greetingRef.current = greeting;
        return [{ role: 'ai', content: greeting }];
      }

      if (prev[0]?.role === 'ai' && prev[0].content === greeting) return prev;

      if (prev[0]?.role === 'ai' && prev[0].content === greetingRef.current) {
        const updated = [...prev];
        updated[0] = { ...updated[0], content: greeting };
        greetingRef.current = greeting;
        return updated;
      }

      return prev;
    });
  }, [showBox, lang, ready, t, studentName]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/claude/student-chat-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setMessages([...newMessages, { role: 'ai', content: data.response }]);
      } else {
        setMessages([...newMessages, { role: 'ai', content: t('fallback') }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'ai', content: t('errGeneric') }]);
    } finally {
      setLoading(false);
    }
  };

  // RTL positioning for the whole widget
  const floatBtnPos = isRTL ? 'left-6 right-auto' : 'right-6 left-auto';
  const boxPos = isRTL ? 'left-6 right-auto' : 'right-6 left-auto';

  // Chat alignment rules:
  // LTR: user right, ai left
  // RTL: user left, ai right
  const rowAlign = (isUser) => {
    if (!isRTL) return isUser ? 'justify-end' : 'justify-start';
    return isUser ? 'justify-start' : 'justify-end';
  };

  const bubbleAlignText = () => (isRTL ? 'text-right' : 'text-left');

  // ✅ Your idea (fixed): Hebrew -> :AI , English -> AI:
  const labelWithColon = (isUser) => {
    const label = isUser ? t('labelYou') : t('labelAI');
    if (!isUser && isRTL) return `:${label}`; // Hebrew RTL: colon before (":AI")
    return `${label}:`; // normal ("AI:")
  };

  // ✅ IMPORTANT: keep AI label LTR, but keep YOU label RTL when Hebrew
  const labelDir = (isUser) => {
    if (!isUser) return 'ltr'; // AI always LTR
    return isRTL ? 'rtl' : 'ltr'; // You follows UI direction
  };

  return (
    <>
      <style>{`
        .dot {
          width: 6px;
          height: 6px;
          margin-inline-end: 4px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          animation: jump 1.4s infinite ease-in-out both;
        }
        .dot1 { animation-delay: -0.32s; }
        .dot2 { animation-delay: -0.16s; }
        .dot3 { animation-delay: 0; }

        @keyframes jump {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .chat-scrollbar {
  scrollbar-width: thin;
}

.chat-scrollbar.dark-scrollbar {
  scrollbar-color: #64748b #1e293b;
}

.chat-scrollbar.light-scrollbar {
  scrollbar-color: #cbd5e1 #f8fafc;
}

.chat-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.chat-scrollbar.dark-scrollbar::-webkit-scrollbar-track {
  background: #1e293b;
}

.chat-scrollbar.dark-scrollbar::-webkit-scrollbar-thumb {
  background: #64748b;
  border-radius: 999px;
}

.chat-scrollbar.light-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}

.chat-scrollbar.light-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}
      `}</style>

      {/* Floating button */}
      <button
        onClick={toggleChatBox}
        className={`fixed bottom-6 ${floatBtnPos} bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition`}
        title={t('tooltip')}
        aria-label={t('tooltip')}
      >
        💬
      </button>

      {/* Chat box */}
      {showBox && (
        <div
          key={lang}
          dir={isRTL ? 'rtl' : 'ltr'}
          lang={lang}
          className={`fixed bottom-24 ${boxPos} w-96 max-h-[80vh] flex flex-col border rounded-lg shadow-lg z-50 ${
            isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'
          }`}
        >
          <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold">{t('title')}</h4>

              <button
                title={t('helpTooltip')}
                onClick={() => setShowHelp(true)}
                className="bg-gray-200 text-blue-700 dark:bg-gray-700 dark:text-white px-3 py-1 rounded text-sm hover:bg-blue-400 disabled:opacity-50"
              >
                ?
              </button>
            </div>

            <button
              onClick={closeChat}
              className="bg-gray-200 text-blue-700 dark:bg-gray-700 dark:text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              aria-label={t('closeAria')}
              title={t('closeAria')}
            >
              &times;
            </button>
          </div>
{showHelp && (
  <div
    className={`mx-4 mt-3 p-3 rounded-lg border text-sm leading-6 ${
      isDark
        ? 'bg-slate-700 border-slate-600 text-white'
        : 'bg-blue-50 border-blue-200 text-slate-800'
    }`}
  >
    <div className="flex justify-between items-start gap-3">
      <p>{t('helpText')}</p>
<button
  onClick={() => setShowHelp(false)}
  className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-lg leading-none ${
    isDark
      ? 'bg-slate-600 text-white hover:bg-slate-500 hover:text-red-300'
      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-red-600'
  }`}
  aria-label={t('closeAria')}
>
  ×
</button>
    </div>
  </div>
)}
          {/* Messages */}
<div
  ref={chatRef}
  className={`flex-1 overflow-y-auto px-4 py-2 space-y-2 chat-scrollbar ${
    isDark ? 'dark-scrollbar' : 'light-scrollbar'
  }`}
>            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={index}
                  className={`w-full flex ${rowAlign(isUser)}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  lang={lang}
                >
                  <div
                    className={`p-2 rounded-md text-sm whitespace-pre-wrap max-w-[85%] ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : isDark
                          ? 'bg-slate-700 text-white'
                          : 'bg-gray-100 text-gray-800'
                    } ${bubbleAlignText()}`}
                  >
                    <strong>
                      <bdi dir={labelDir(isUser)}>{labelWithColon(isUser)}</bdi>
                    </strong>{' '}
                    <bdi>{msg.content}</bdi>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className={`w-full flex ${rowAlign(false)}`} dir={isRTL ? 'rtl' : 'ltr'} lang={lang}>
                <div
                  className={`p-2 rounded-md text-sm max-w-[85%] inline-flex items-center gap-1 ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'
                  } ${bubbleAlignText()}`}
                >
                  <strong>
                    <bdi dir="ltr">{labelWithColon(false)}</bdi>
                  </strong>
                  <div className="flex ms-2">
                    <span className="dot dot1" />
                    <span className="dot dot2" />
                    <span className="dot dot3" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className={`flex items-center p-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('placeholder')}
              className={`flex-1 border rounded p-2 text-sm me-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              lang={lang}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t('sending') : t('send')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;