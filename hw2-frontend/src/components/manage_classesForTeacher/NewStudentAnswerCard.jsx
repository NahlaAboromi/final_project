//C:\Users\n0502\OneDrive\שולחן העבודה\final_project_new\final_project\hw2-frontend\src\components\manage_classesForTeacher\NewStudentAnswerCard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const StudentAnswerCard = ({ answer, student = {}, attempts = [], isDark }) => {
  const { studentId, analysisResult } = answer || {};
  const [fullStudent, setFullStudent] = useState(student);
  const [imageError, setImageError] = useState(false);
  const [openAttemptId, setOpenAttemptId] = useState(null);

  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('studentAnswerCard');

  useEffect(() => {
    const fetchFullStudentData = async () => {
      const missingUsername = !student.username || student.username === 'Unknown';
      const missingPic = !student.profilePic || student.profilePic === 'default_empty_profile_pic';

      if (missingUsername || missingPic) {
        try {
          const res = await fetch(`/api/students/${studentId}`);
          const data = await res.json();
          if (res.ok && data) setFullStudent({ ...student, ...data });
        } catch (err) {
          console.error('Failed to fetch student data:', err);
        }
      }
    };

    if (studentId) fetchFullStudentData();
  }, [studentId, student.username, student.profilePic]);

  if (!ready || !analysisResult) return null;

  const { username, profilePic } = fullStudent;
  const validAttempts = attempts?.length ? attempts : [answer];

  const getProfileImage = () => {
    const needsDefault = !profilePic || profilePic === 'default_empty_profile_pic' || imageError;

    if (needsDefault) {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    }

    if (profilePic.startsWith('data:image')) return profilePic;

    const separator = profilePic.includes('?') ? '&' : '?';
    return `${profilePic}${separator}t=${new Date().getTime()}`;
  };

  const getScoreHex = (score) => {
    const num = Number(score || 0);
    if (num >= 4.5) return '#22c55e';
    if (num >= 3.5) return '#3b82f6';
    if (num >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return isDark ? 'text-green-300' : 'text-green-600';
    if (score >= 3.5) return isDark ? 'text-blue-300' : 'text-blue-600';
    if (score >= 2.5) return isDark ? 'text-yellow-300' : 'text-yellow-600';
    return isDark ? 'text-red-300' : 'text-red-600';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 4.5) return isDark ? 'bg-green-800' : 'bg-green-100';
    if (score >= 3.5) return isDark ? 'bg-blue-800' : 'bg-blue-100';
    if (score >= 2.5) return isDark ? 'bg-yellow-800' : 'bg-yellow-100';
    return isDark ? 'bg-red-800' : 'bg-red-100';
  };

  const getScoreLabel = (score) => {
    const num = Number(score || 0);
    if (num >= 4.5) return lang === 'he' ? 'מצוין' : 'Excellent';
    if (num >= 3.5) return lang === 'he' ? 'טוב' : 'Good';
    if (num >= 2.5) return lang === 'he' ? 'בינוני' : 'Average';
    return lang === 'he' ? 'דורש שיפור' : 'Needs Work';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleString(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categoryKeys = [
    'selfAwareness',
    'selfManagement',
    'socialAwareness',
    'relationshipSkills',
    'responsibleDecisionMaking',
  ];

  const displayNames = {
    selfAwareness: t('selfAwareness'),
    selfManagement: t('selfManagement'),
    socialAwareness: t('socialAwareness'),
    relationshipSkills: t('relationshipSkills'),
    responsibleDecisionMaking: t('responsibleDecisionMaking'),
  };

  const categoryIcons = {
    selfAwareness: '🧠',
    selfManagement: '⚙️',
    socialAwareness: '👥',
    relationshipSkills: '🤝',
    responsibleDecisionMaking: '⚖️',
  };

  const getScore = (attempt, key) => attempt?.analysisResult?.[key]?.score ?? 0;
  const getOverallScore = (attempt) => attempt?.analysisResult?.overallScore ?? 0;

  const getAttemptLabel = (index) => {
    if (lang === 'he') {
      if (index === 0) return 'ניסיון ראשון';
      if (index === 1) return 'ניסיון שני';
      if (index === 2) return 'ניסיון שלישי';
      return `ניסיון ${index + 1}`;
    }

    return `Attempt ${index + 1}`;
  };

  const averageScore = (() => {
    const scores = validAttempts
      .map((a) => Number(a?.analysisResult?.overallScore))
      .filter((s) => !Number.isNaN(s));

    if (!scores.length) return analysisResult.overallScore;

    return (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1);
  })();

  const bg = isDark ? '#1e293b' : '#ffffff';
  const bgCard = isDark ? '#1e293b' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#64748b';
  const scoreColor = getScoreHex(averageScore);

  const pct = (score) => Math.max(0, Math.min(100, (Number(score || 0) / 5) * 100));

  const RadialScore = ({ score, size = 64 }) => {
    const num = Math.min(5, Math.max(0, Number(score || 0)));
    const percent = (num / 5) * 100;
    const r = size / 2 - 6;
    const circ = 2 * Math.PI * r;
    const dash = (percent / 100) * circ;
    const color = getScoreHex(score);

    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isDark ? '#334155' : '#e2e8f0'} strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
    );
  };

  const renderAttemptDetail = (attempt) => {
    const ar = attempt?.analysisResult;
    if (!ar) return null;

    return (
      <div className={`p-4 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-white text-gray-800'}`}>
        <div className="mb-5">
          <h4 className="font-bold mb-2 flex items-center gap-2">✍️ {t('answer')}</h4>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} p-3 rounded-md`}>
            <p className="whitespace-pre-line">{attempt?.answerText}</p>
          </div>
        </div>

        <div className="mb-5">
          <h4 className="font-bold mb-3 flex items-center gap-2">📊 {t('caselAnalysis')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(ar)
              .filter(([key]) => Object.keys(displayNames).includes(key))
              .map(([key, val]) => (
                <div key={key} className={`p-3 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} border-l-4 ${getScoreBadgeColor(val.score)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{categoryIcons[key]}</span>
                    <h5 className="font-bold">{displayNames[key]}</h5>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`text-lg font-bold ${getScoreColor(val.score)}`}>{val.score}</div>
                    <div className="w-full bg-gray-300 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          val.score >= 4.5 ? 'bg-green-600'
                          : val.score >= 3.5 ? 'bg-blue-600'
                          : val.score >= 2.5 ? 'bg-yellow-600'
                          : 'bg-red-600'
                        }`}
                        style={{ width: `${pct(val.score)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm">{val.feedback}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-green-50'} p-3 rounded-md`}>
            <h4 className={`${isDark ? 'text-green-300' : 'text-green-800'} font-bold mb-2`}>💪 {t('strengths')}</h4>
            <ul className="list-disc list-inside space-y-1">
              {ar.observedStrengths?.map((s, i) => <li key={i} className="text-sm">{s}</li>)}
            </ul>
          </div>

          <div className={`${isDark ? 'bg-slate-800' : 'bg-yellow-50'} p-3 rounded-md`}>
            <h4 className={`${isDark ? 'text-yellow-300' : 'text-yellow-800'} font-bold mb-2`}>🔍 {t('areasForImprovement')}</h4>
            <ul className="list-disc list-inside space-y-1">
              {ar.areasForImprovement?.map((a, i) => <li key={i} className="text-sm">{a}</li>)}
            </ul>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800' : 'bg-blue-50'} p-3 rounded-md`}>
          <h4 className={`${isDark ? 'text-blue-300' : 'text-blue-800'} font-bold mb-2`}>💡 {t('suggestedIntervention')}</h4>
          <p className="text-sm">{ar.suggestedIntervention}</p>
        </div>

        {ar.estimatedDepthLevel && (
          <p className="text-right text-sm mt-2 text-slate-400">
            {t('depthLevel')}: <strong>{ar.estimatedDepthLevel}</strong>
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      dir={dir}
      lang={lang}
      style={{
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${border}`,
        background: bg,
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(15,23,42,0.08)',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          background: isDark
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={getProfileImage()}
              onError={() => setImageError(true)}
              alt="Profile"
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${scoreColor}`,
                boxShadow: `0 0 0 3px ${scoreColor}22`,
              }}
            />

            <div
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: scoreColor,
                border: `2px solid ${bg}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: '#fff',
                fontWeight: 800,
              }}
            >
              {validAttempts.length}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: textMain }}>
              {username || t('unknown', 'Unknown Student')}
            </div>

            <div style={{ fontSize: 12, color: textSub, marginTop: 2 }}>
              {t('studentId', 'ID')}: {studentId}
            </div>

            <div
              style={{
                display: 'inline-block',
                marginTop: 4,
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 99,
                background: `${scoreColor}22`,
                color: scoreColor,
                letterSpacing: 0.5,
              }}
            >
              {getScoreLabel(averageScore)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {categoryKeys.map((key) => {
              const score = getScore(validAttempts[0], key);
              const color = getScoreHex(score);
              const percent = (Math.min(5, Math.max(0, Number(score || 0))) / 5) * 100;

              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{categoryIcons[key]}</span>

                  <span style={{ fontSize: 11, color: textSub, width: 90, flexShrink: 0, textAlign: 'start' }}>
                    {displayNames[key]}
                  </span>

                  <div style={{ flex: 1, height: 5, background: isDark ? '#334155' : '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>

                  <span style={{ fontWeight: 800, fontSize: 13, color, minWidth: 32, textAlign: 'end' }}>
                    {score}
                    <span style={{ fontWeight: 400, fontSize: 10, color: textSub }}>/5</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
            <RadialScore score={averageScore} size={76} />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 19, color: scoreColor, lineHeight: 1 }}>
                {averageScore}
              </span>
              <span style={{ fontSize: 9, color: textSub, fontWeight: 600 }}>/5</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: textSub,
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {lang === 'he' ? `ניסיונות (${validAttempts.length})` : `Attempts (${validAttempts.length})`}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {validAttempts.map((attempt, index) => {
            const attemptId = attempt?._id || `${attempt?.studentId}-${attempt?.submittedAt}-${index}`;
            const isOpen = openAttemptId === attemptId;
            const overall = getOverallScore(attempt);
            const color = getScoreHex(overall);

            return (
              <div
                key={attemptId}
                style={{
                  border: `1px solid ${isOpen ? color : border}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  background: isOpen ? `${color}08` : bgCard,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenAttemptId(isOpen ? null : attemptId)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    padding: '14px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    textAlign: 'start',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isOpen ? color : isDark ? '#334155' : '#e2e8f0',
                        color: isOpen ? '#fff' : textSub,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: textMain }}>
                        {getAttemptLabel(index)}
                      </div>

                      <div style={{ fontSize: 12, color: textSub, marginTop: 2 }}>
                        🕒 {formatDate(attempt?.submittedAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {categoryKeys.map((key) => {
                        const s = getScore(attempt, key);
                        const c = getScoreHex(s);

                        return (
                          <div
                            key={key}
                            title={displayNames[key]}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: 99,
                              background: `${c}15`,
                              color: c,
                              border: `1px solid ${c}30`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span style={{ fontSize: 13 }}>{categoryIcons[key]}</span>
                            <span style={{ fontWeight: 800 }}>{s}</span>
                            <span style={{ fontWeight: 400, fontSize: 10, opacity: 0.7 }}>/5</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center', background: `${color}18`, borderRadius: 10, padding: '6px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color, opacity: 0.8 }}>
                        {lang === 'he' ? 'ממוצע' : 'Score'}
                      </div>

                      <div style={{ fontWeight: 900, fontSize: 20, color, lineHeight: 1.1 }}>
                        {overall}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                        background: isDark ? '#334155' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: textSub,
                        fontSize: 14,
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      ▾
                    </div>
                  </div>
                </button>

                {isOpen && renderAttemptDetail(attempt)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentAnswerCard;