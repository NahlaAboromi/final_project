import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';
import SubGroupStudentAnswerCard from './SubGroupStudentAnswerCard';
import { LanguageContext } from '../../context/LanguageContext';

const LearningClustersTracking = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const { lang } = useContext(LanguageContext) || { lang: 'he' };

  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  const { classCode: encodedClassCode } = useParams();
  const classCode = decodeURIComponent(encodedClassCode || '');

  const [clusterData, setClusterData] = useState(null);
  const [activeClusterCode, setActiveClusterCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
const [showClusterStudents, setShowClusterStudents] = useState(false);
  useEffect(() => {
    const fetchClustersData = async () => {
      if (!user?.id || !classCode) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/classes/learning-clusters/${user.id}/${classCode}`);
        const data = await res.json();

        if (res.ok) {
          setClusterData(data);
          if (data?.clusters?.length > 0) {
            setActiveClusterCode(data.clusters[0].cluster.clusterCode);
          }
        } else {
          setClusterData(null);
        }
      } catch (err) {
        console.error('Failed to fetch learning clusters:', err);
        setClusterData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClustersData();
  }, [user?.id, classCode]);

  const clusters = clusterData?.clusters || [];

  const filteredClusters = clusters.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;

    const cl = item.cluster;

    return (
      cl.clusterName?.toLowerCase().includes(q) ||
      cl.caselDomain?.toLowerCase().includes(q) ||
      cl.clusterCode?.toLowerCase().includes(q)
    );
  });

  const activeClusterData =
    clusters.find((item) => item.cluster?.clusterCode === activeClusterCode) ||
    clusters[0];

  const cluster = activeClusterData?.cluster;
  const answers = activeClusterData?.answers || [];
const completedStudentIds = new Set(
  answers.map((a) => String(a.studentId || a.id || ''))
);

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleString(isRTL ? 'he-IL' : 'en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const d = isDark;

  const c = {
    pageBg: d ? '#0f172a' : '#e9eff6',
    card: d ? '#111827' : '#ffffff',
    cardSoft: d ? '#1e293b' : '#f4f7fb',
    cardBorder: d ? '#253247' : '#dbe3ee',

    text: d ? '#f8fafc' : '#111827',
    subText: d ? '#cbd5e1' : '#4b5563',
    muted: d ? '#94a3b8' : '#6b7280',
    faint: d ? '#64748b' : '#9ca3af',

    blue: '#2563eb',
    blueBg: d ? 'rgba(37, 99, 235, 0.14)' : '#eaf1ff',
    blueBorder: d ? 'rgba(37, 99, 235, 0.35)' : '#c9dbff',

    green: '#059669',
    greenBg: d ? 'rgba(5, 150, 105, 0.15)' : '#e8f7ef',
    greenBorder: d ? 'rgba(5, 150, 105, 0.35)' : '#bde8d0',

    red: '#ef4444',
    redBg: d ? 'rgba(239, 68, 68, 0.14)' : '#feecec',
    redBorder: d ? 'rgba(239, 68, 68, 0.35)' : '#fecaca',

    purple: '#7c3aed',
    purpleBg: d ? 'rgba(124, 58, 237, 0.14)' : '#f1eafe',
    purpleBorder: d ? 'rgba(124, 58, 237, 0.35)' : '#ddd0fb',

    inputBg: d ? '#0f172a' : '#f8fafc',
    shadow: d
      ? '0 1px 3px rgba(0,0,0,0.35)'
      : '0 1px 3px rgba(15,23,42,0.08)',
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
style={{
  width: '100vw',
  maxWidth: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: c.pageBg,
  color: c.text,
  fontFamily: '"Inter", "DM Sans", system-ui, sans-serif',
  overflowX: 'hidden',
}}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .lct-item {
          transition: background .15s ease, box-shadow .15s ease;
        }

        .lct-item:hover {
          background: ${d ? 'rgba(255,255,255,0.04)' : '#f4f7fb'} !important;
        }

.lct-item.active {
  background: ${c.blueBg} !important;
}

        .lct-search:focus {
          border-color: ${c.blue} !important;
          box-shadow: 0 0 0 3px ${d ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.12)'} !important;
          outline: none;
        }

        .lct-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .lct-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .lct-scroll::-webkit-scrollbar-thumb {
          background: ${d ? '#334155' : '#cbd5e1'};
          border-radius: 999px;
        }
        @keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
      `}</style>

      <div style={{ padding: '12px 24px 0' }}>
        <TeacherHeader />
      </div>

      <div
        style={{
          padding: '34px 28px 28px',
          background: d ? '#111827' : '#f7f9fc',
          borderBottom: `1px solid ${c.cardBorder}`,
        }}
      >
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>
            {isRTL ? 'לוח בקרה' : 'Dashboard'}
          </span>
          <span style={{ color: c.faint, fontSize: 12 }}>/</span>
          <span style={{ fontSize: 12, color: c.blue, fontWeight: 700 }}>
            {isRTL ? 'מעקב קבוצות למידה' : 'Learning Groups Tracking'}
          </span>
        </div>

        <h1
          style={{
            margin: '0 0 16px',
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: '-0.7px',
            color: c.text,
          }}
        >
          {isRTL ? 'מעקב קבוצות למידה' : 'Learning Groups Tracking'}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <span
            style={{
              background: c.card,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 8,
              padding: '6px 13px',
              fontSize: 13,
              color: c.subText,
              boxShadow: c.shadow,
            }}
          >
            {isRTL ? 'קוד כיתה' : 'Class Code'}:{' '}
            <b style={{ color: c.text }}>{classCode}</b>
          </span>

          {clusterData?.className && (
            <span
              style={{
                background: c.card,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: 8,
                padding: '6px 13px',
                fontSize: 13,
                color: c.subText,
                boxShadow: c.shadow,
              }}
            >
              {isRTL ? 'שם כיתה' : 'Class Name'}:{' '}
              <b style={{ color: c.text }}>{clusterData.className}</b>
            </span>
          )}

          {!loading && clusters.length > 0 && (
            <span
              style={{
                background: c.greenBg,
                border: `1px solid ${c.greenBorder}`,
                borderRadius: 8,
                padding: '6px 13px',
                fontSize: 13,
                color: c.green,
                fontWeight: 700,
              }}
            >
              {clusters.length} {isRTL ? 'קבוצות' : 'Groups'}
            </span>
          )}
        </div>
      </div>
<main
  style={{
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
    padding: '20px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }}
>
        {loading ? (
          <div
            style={{
              background: c.card,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 12,
              padding: '48px 24px',
              textAlign: 'center',
              color: c.muted,
              boxShadow: c.shadow,
            }}
          >
<>
  <div
    style={{
      width: 40,
      height: 40,
      margin: '0 auto',
      border: '4px solid #d1d5db',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}
  />

  <div
    style={{
      marginTop: 14,
      color: c.muted,
      fontSize: 15,
    }}
  >
    {isRTL ? 'טוען נתונים...' : 'Loading data...'}
  </div>
</>
          </div>
        ) : !clusterData || clusters.length === 0 ? (
          <div
            style={{
              background: c.card,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 12,
              padding: '56px 24px',
              textAlign: 'center',
              color: c.muted,
              boxShadow: c.shadow,
            }}
          >
            {isRTL ? 'לא נמצאו קבוצות למידה לכיתה זו.' : 'No learning groups found for this class.'}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <aside
              style={{
                width: 280,
                flexShrink: 0,
                background: c.card,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: c.shadow,
                position: 'sticky',
                top: 16,
                maxHeight: 'calc(100vh - 140px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '14px',
                  borderBottom: `1px solid ${c.cardBorder}`,
                  background: c.card,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: c.muted,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {isRTL ? 'תתי קבוצות' : 'Clusters'} ({clusters.length})
                </div>

                <input
                  className="lct-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRTL ? 'חיפוש...' : 'Search...'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${c.cardBorder}`,
                    background: c.inputBg,
                    color: c.text,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div className="lct-scroll" style={{ overflowY: 'auto', flex: 1 }}>
                {filteredClusters.length === 0 ? (
                  <div style={{ padding: 24, fontSize: 13, color: c.muted, textAlign: 'center' }}>
                    {isRTL ? 'לא נמצאו תוצאות' : 'No results'}
                  </div>
                ) : (
                  filteredClusters.map((item) => {
                    const cl = item.cluster;
                    const isActive = cl.clusterCode === activeClusterCode;
                    const answerCount = item.answers?.length || 0;
                    const studentCount = cl.students?.length || 0;
                    const pct = studentCount > 0 ? Math.round((answerCount / studentCount) * 100) : 0;

                    return (
                      <button
                        key={cl.clusterCode}
                        type="button"
                        className={`lct-item${isActive ? ' active' : ''}`}
                        onClick={() => setActiveClusterCode(cl.clusterCode)}
                        style={{
                          width: '100%',
                          textAlign: isRTL ? 'right' : 'left',
                          padding: '14px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `1px solid ${c.cardBorder}`,
                          cursor: 'pointer',
                          color: c.text,
                          fontFamily: 'inherit',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <b style={{ fontSize: 14 }}>{cl.clusterName}</b>

                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              background: isActive ? c.greenBg : c.cardSoft,
                              color: isActive ? c.green : c.muted,
                              border: `1px solid ${isActive ? c.greenBorder : c.cardBorder}`,
                              borderRadius: 999,
                              padding: '2px 8px',
                            }}
                          >
                            {answerCount}/{studentCount}
                          </span>
                        </div>

                        <div style={{ fontSize: 11, color: isActive ? c.blue : c.faint, marginBottom: 4 }}>
                          #{cl.clusterCode}
                        </div>

                        {cl.caselDomain && (
                          <div style={{ fontSize: 12, color: c.muted, marginBottom: 7 }}>
                            {cl.caselDomain}
                          </div>
                        )}

                        {cl.approvedAt && (
                          <div style={{ fontSize: 11, color: c.faint, marginBottom: 8 }}>
                            {formatDateTime(cl.approvedAt)}
                          </div>
                        )}

                        <div
                          style={{
                            height: 4,
                            borderRadius: 999,
                            background: d ? '#263244' : '#e5eaf2',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              borderRadius: 999,
                              background: pct === 100 ? c.green : c.blue,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cluster && (
                <>
                  <div
                    style={{
                      background: c.card,
                      border: `1px solid ${c.cardBorder}`,
                      borderRadius: 12,
                      padding: '18px 22px',
                      boxShadow: c.shadow,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 14,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: c.muted,
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        {isRTL ? 'קבוצה פעילה' : 'Active Cluster'}
                      </div>

                      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                        {cluster.clusterName}
                      </h2>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 9 }}>
                        <span
                          style={{
                            background: c.blueBg,
                            border: `1px solid ${c.blueBorder}`,
                            color: c.blue,
                            borderRadius: 7,
                            padding: '3px 10px',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          #{cluster.clusterCode}
                        </span>

                        {cluster.caselDomain && (
                          <span
                            style={{
                              background: c.cardSoft,
                              border: `1px solid ${c.cardBorder}`,
                              color: c.subText,
                              borderRadius: 7,
                              padding: '3px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {cluster.caselDomain}
                          </span>
                        )}

                        {cluster.approvedAt && (
                          <span style={{ color: c.muted, fontSize: 12 }}>
                            {formatDateTime(cluster.approvedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <div
                        style={{
                          background: c.blueBg,
                          border: `1px solid ${c.blueBorder}`,
                          borderRadius: 10,
                          padding: '10px 18px',
                          textAlign: 'center',
                          minWidth: 78,
                        }}
                      >
                        <div style={{ fontSize: 24, fontWeight: 800, color: c.blue }}>
                          {cluster.students?.length || 0}
                        </div>
                        <div style={{ fontSize: 11, color: c.muted }}>
                          {isRTL ? 'סטודנטים' : 'Students'}
                        </div>
                      </div>

                      <div
                        style={{
                          background: c.greenBg,
                          border: `1px solid ${c.greenBorder}`,
                          borderRadius: 10,
                          padding: '10px 18px',
                          textAlign: 'center',
                          minWidth: 78,
                        }}
                      >
                        <div style={{ fontSize: 24, fontWeight: 800, color: c.green }}>
                          {answers.length}
                        </div>
                        <div style={{ fontSize: 11, color: c.muted }}>
                          {isRTL ? 'תשובות' : 'Answers'}
                        </div>
                      </div>
                    </div>
                  </div>
<div
  style={{
    background: c.card,
    border: `1px solid ${c.cardBorder}`,
    borderRadius: 12,
    boxShadow: c.shadow,
    overflow: 'hidden',
  }}
>
  <button
    type="button"
    onClick={() => setShowClusterStudents((prev) => !prev)}
    style={{
      width: '100%',
      border: 'none',
      background: 'transparent',
      padding: '14px 18px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: c.text,
      fontFamily: 'inherit',
      fontWeight: 800,
      fontSize: 15,
      textAlign: isRTL ? 'right' : 'left',
    }}
  >
    <span>
      {isRTL ? 'סטודנטים בתת־קבוצה' : 'Students in Subgroup'}
    </span>

    <span style={{ fontSize: 16 }}>
      {showClusterStudents ? '▲' : '▼'}
    </span>
  </button>

  {showClusterStudents && (
    <div style={{ padding: '0 18px 16px' }}>
      {(cluster.students || []).map((student) => {
        const studentId = String(student.studentId || student.id || '');
        const fullName = student.fullName || student.name || student.username || 'Unknown Student';
        const profilePic = student.profilePic;
        const isCompleted = completedStudentIds.has(studentId);

        return (
          <div
            key={studentId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '12px 0',
              borderTop: `1px solid ${c.cardBorder}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {profilePic && profilePic !== 'default_empty_profile_pic' ? (
                <img
                  src={profilePic}
                  alt={fullName}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `1px solid ${c.cardBorder}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: c.blueBg,
                    color: c.blue,
                    border: `1px solid ${c.blueBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {getInitials(fullName)}
                </div>
              )}

              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>
                  {fullName}
                </div>
                <div style={{ fontSize: 12, color: c.muted }}>
                  {isRTL ? 'תעודת זהות' : 'ID'}: {studentId}
                </div>
              </div>
            </div>

            <span
              style={{
                background: isCompleted ? c.greenBg : c.redBg,
                border: `1px solid ${isCompleted ? c.greenBorder : c.redBorder}`,
                color: isCompleted ? c.green : c.red,
                borderRadius: 999,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {isCompleted
                ? (isRTL ? 'הושלם' : 'Completed')
                : (isRTL ? 'לא השלים' : 'Not completed')}
            </span>
          </div>
        );
      })}
    </div>
  )}
</div>
                  {(cluster.suggestedScenario || cluster.scenarioQuestion) && (
                    <div
                      style={{
                        background: c.card,
                        border: `1px solid ${c.cardBorder}`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        boxShadow: c.shadow,
                      }}
                    >
                      <div style={{ height: 1, background: c.cardBorder }} />

                      <div style={{ padding: '20px 22px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 14,
                          }}
                        >
                          <span
                            style={{
                              background: c.greenBg,
                              border: `1px solid ${c.greenBorder}`,
                              color: c.green,
                              borderRadius: 7,
                              padding: '5px 10px',
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            {isRTL ? 'סימולציה מומלצת' : 'Recommended Simulation'}
                          </span>
                        </div>

                        {cluster.suggestedScenario && (
                          <div
                            style={{
                              background: c.cardSoft,
                              border: `1px solid ${c.cardBorder}`,
                              borderRadius: 10,
                              padding: '14px 16px',
                              marginBottom: 12,
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: c.subText }}>
                              {cluster.suggestedScenario}
                            </p>
                          </div>
                        )}

                        {cluster.scenarioQuestion && (
                          <div
                            style={{
                              background: c.blueBg,
                              border: `1px solid ${c.blueBorder}`,
                              borderRadius: 10,
                              padding: '14px 16px',
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: c.text, fontWeight: 600 }}>
                              {cluster.scenarioQuestion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                        {isRTL ? 'תשובות הסטודנטים' : 'Student Answers'}
                      </h3>

                      <span
                        style={{
                          background: answers.length > 0 ? c.greenBg : c.cardSoft,
                          border: `1px solid ${answers.length > 0 ? c.greenBorder : c.cardBorder}`,
                          color: answers.length > 0 ? c.green : c.muted,
                          borderRadius: 999,
                          padding: '3px 12px',
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {answers.length}
                      </span>
                    </div>

                    {answers.length === 0 ? (
                      <div
                        style={{
                          background: c.card,
                          border: `1px solid ${c.cardBorder}`,
                          borderRadius: 12,
                          padding: '34px 20px',
                          textAlign: 'center',
                          color: c.muted,
                          fontSize: 14,
                          boxShadow: c.shadow,
                        }}
                      >
                        {isRTL
                          ? 'עדיין אין תשובות עבור קבוצת למידה זו.'
                          : 'No answers submitted for this learning group yet.'}
                      </div>
                    ) : (
                      answers.map((answer, index) => (
                        <SubGroupStudentAnswerCard
                          key={answer._id || answer.studentId || index}
                          answer={answer}
                          student={answer}
                          isDark={isDark}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>

      {user?.id && <AIChat teacherId={user.id} />}

      <div style={{ padding: '0 24px 16px' }}>
        <Footer />
      </div>
    </div>
  );
};

export default LearningClustersTracking;