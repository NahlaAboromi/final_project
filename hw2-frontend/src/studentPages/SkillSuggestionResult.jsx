import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentHeader from "./StudentHeader";
import Footer from "../layout/Footer";
import StudentAnswerCard from '../components/manage_classesForTeacher/StudentAnswerCard';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import StudentAIChat from '../AI/StudentAIChat';
import { useI18n } from '../utils/i18n';

// ─── Meta pill ────────────────────────────────────────────────────────────────
const MetaPill = ({ label, value, isDark }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 14,
      padding: '12px 20px',
      minWidth: 120,
      flex: 1,
    }}
  >
    <span
      style={{
fontSize: 13,
fontWeight: 700,
color: isDark ? '#cbd5e1' : '#475569',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 15,
        fontWeight: 800,
        color: isDark ? '#f1f5f9' : '#0f172a',
      }}
    >
      {value}
    </span>
  </div>
);

// ─── Section block (Simulation / Question) ───────────────────────────────────
const SectionBlock = ({ icon, title, children, accent, isDark }) => (
  <div
    style={{
      background: isDark ? '#0f172a' : '#ffffff',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 20,
      padding: '24px 28px',
      boxShadow: isDark
        ? '0 4px 14px rgba(0,0,0,0.22)'
        : '0 4px 14px rgba(15,23,42,0.06)',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: `${accent}18`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 900,
          color: isDark ? '#f8fafc' : '#0f172a',
        }}
      >
        {title}
      </h2>
    </div>

    <p
      style={{
        margin: 0,
        fontSize: 16,
        lineHeight: 1.9,
        color: isDark ? '#cbd5e1' : '#334155',
      }}
    >
      {children}
    </p>
  </div>
);

// ─── Hero info card ───────────────────────────────────────────────────────────
const HeroCard = ({ answer, isDark, lang }) => {
  const isRTL = lang === 'he';

  return (
    <div
      style={{
background: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: 22,
        padding: '28px 28px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      {/* top row: domain badge + title */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: '#E96F1C',
            color: '#fff',
            borderRadius: 999,
            padding: '6px 16px',
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <span>🎯</span>
          <span>{isRTL ? 'תוצאת סימולציה' : 'Simulation Result'}</span>
        </div>

        <span
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: isDark ? '#f8fafc' : '#0f172a',
          }}
        >
          {answer.clusterName}
        </span>
      </div>

      {/* meta pills row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <MetaPill
          label={isRTL ? 'קוד כיתה' : 'Class Code'}
          value={answer.classCode}
          isDark={isDark}
        />
        <MetaPill
          label={isRTL ? 'קוד תת־קבוצה' : 'Subgroup Code'}
          value={answer.clusterCode}
          isDark={isDark}
        />
        <MetaPill
          label={isRTL ? 'שם תת־קבוצה' : 'Subgroup Name'}
          value={answer.clusterName}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const SkillSuggestionResultContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { answer } = location.state || {};

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
  const { dir, lang } = useI18n('studentHome');
  const isRTL = lang === 'he';

  return (
    <div
      dir={dir}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <div className="px-4 mt-4">
        <StudentHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div
          className={`${isDark ? 'bg-slate-800' : 'bg-slate-200'} p-6 rounded-xl`}
          style={{ width: '100%' }}
        >
          {answer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* ── Hero card ── */}
              <HeroCard answer={answer} isDark={isDark} lang={lang} />

              {/* ── Simulation ── */}
              <SectionBlock
               icon="💬"
                title={isRTL ? 'הסימולציה' : 'Simulation'}
                accent="#E96F1C"
                isDark={isDark}
              >
                {answer.situation}
              </SectionBlock>

              {/* ── Question ── */}
              <SectionBlock
                icon="❓"
                title={isRTL ? 'השאלה' : 'Question'}
                accent="#7FA334"
                isDark={isDark}
              >
                {answer.question}
              </SectionBlock>

              {/* ── Student answer card (unchanged) ── */}
              <StudentAnswerCard answer={answer} isDark={isDark} />

              {/* ── Back button ── */}
              <div>
                <button
                  onClick={() => navigate('/skill-suggestions')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: isDark ? '#1e293b' : '#ffffff',
                    border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    borderRadius: 12,
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark ? '#cbd5e1' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#E96F1C';
                    e.currentTarget.style.color = '#E96F1C';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                    e.currentTarget.style.color = isDark ? '#cbd5e1' : '#475569';
                  }}
                >
                  <span style={{ fontSize: 16 }}>{isRTL ? '→' : '←'}</span>
                  {isRTL ? 'חזרה להצעות' : 'Back to Suggestions'}
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: isDark ? '#1e293b' : '#ffffff',
                borderRadius: 18,
                padding: '64px 24px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                {isRTL ? 'לא נמצאה תוצאה להצגה.' : 'No result found to display.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username} />}

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const SkillSuggestionResult = () => <SkillSuggestionResultContent />;

export default SkillSuggestionResult;
