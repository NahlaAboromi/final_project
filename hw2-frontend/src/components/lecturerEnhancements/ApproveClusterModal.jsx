import React, { useState } from 'react';

const ApproveClusterModal = ({
  isOpen,
  onClose,
  group,
  classCode,
  teacherId,
  isDark,
  isRTL,
}) => {
  const [saving, setSaving] = useState(false);
  const [clusterCode, setClusterCode] = useState('');
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  if (!isOpen || !group) return null;

  const showNotice = (type, message) => {
    setNotice({ type, message });

    setTimeout(() => {
      setNotice(null);
    }, 2600);
  };

  const handleSave = async () => {
    if (!clusterCode.trim()) {
      showNotice(
        'error',
        isRTL ? 'נא להזין קוד לתת־הקבוצה' : 'Please enter a cluster code'
      );
      return;
    }

try {
  setSaving(true);

  const checkRes = await fetch(
    `/api/classes/${classCode}/check-learning-cluster-code/${encodeURIComponent(clusterCode.trim())}?teacherId=${encodeURIComponent(teacherId)}`
  );

  const checkData = await checkRes.json();

  if (!checkRes.ok) {
    throw new Error(checkData.message || 'Failed to check cluster code');
  }

  if (checkData.exists) {
    showNotice(
      'error',
      isRTL
        ? 'קוד תת־הקבוצה כבר קיים בכיתה הזאת'
        : 'This cluster code already exists in this class'
    );
    return;
  }

const payload = {
  classCode,
  teacherId,
  clusterCode: clusterCode.trim(),
  caselDomain: group.caselDomain || group.title,
  clusterName: group.caselDomain || group.title,
  students: (group.students || []).map((student) => ({
    id: student.id,
    name: student.name,
  })),
  suggestedScenario: group.suggestedScenario,
  scenarioQuestion: group.scenarioQuestion,
  aiReason: group.reason,
  status: 'active',
};

      const res = await fetch(`/api/classes/${classCode}/learning-clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save cluster');

      showNotice(
        'success',
        isRTL ? 'תת־הקבוצה נשמרה בהצלחה' : 'Cluster saved successfully'
      );

      setTimeout(() => {
        setClusterCode('');
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);

      showNotice(
        'error',
        isRTL ? 'שגיאה בשמירת תת־הקבוצה' : 'Error saving cluster'
      );
    } finally {
      setSaving(false);
    }
  };

  const d = isDark;
  const students = group.students || [];

  const c = {
    bg: d ? '#111827' : '#ffffff',
    border: d ? '#1f2d40' : '#e4eaf2',
    text: d ? '#f1f5f9' : '#0f172a',
    muted: d ? '#64748b' : '#94a3b8',
    sub: d ? '#94a3b8' : '#475569',
    alt: d ? '#1a2436' : '#f8fafc',
    altBorder: d ? '#243048' : '#edf0f5',
    accent: '#E96F1C',
    accentBg: d ? 'rgba(233,111,28,0.1)' : 'rgba(233,111,28,0.07)',
    accentBorder: 'rgba(233,111,28,0.3)',
    overlay: 'transparent',
  };

  const Label = ({ children }) => (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: c.muted }}>
      {children}
    </span>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .acm-input:focus { border-color: #E96F1C !important; box-shadow: 0 0 0 3px rgba(233,111,28,0.15) !important; }
        .acm-save { transition: opacity .15s, transform .12s, box-shadow .15s; box-shadow: 0 4px 14px rgba(233,111,28,0.3); }
        .acm-save:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); box-shadow: 0 6px 20px rgba(233,111,28,0.4); }
        .acm-cancel { transition: background .15s; }
        .acm-cancel:hover:not(:disabled) { background: ${d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} !important; }
        .acm-toggle:hover { background: ${d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} !important; }
        .acm-close:hover { background: ${d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'} !important; }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'transparent',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: '"DM Sans", sans-serif',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={e => e.stopPropagation()}
          style={{
            width: 'min(560px, 100%)',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 48px)',
            background: c.bg,
            color: c.text,
            borderRadius: 20,
            border: `1px solid ${c.border}`,
            boxShadow: d
              ? '0 24px 64px rgba(0,0,0,0.6)'
              : '0 24px 64px rgba(15,23,42,0.15)',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {notice && (
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                margin: '12px 18px 0',
                padding: '11px 14px',
                borderRadius: 12,
                border: notice.type === 'success'
                  ? '1px solid rgba(34,197,94,0.35)'
                  : '1px solid rgba(239,68,68,0.35)',
                background: notice.type === 'success'
                  ? (d ? 'rgba(34,197,94,0.16)' : '#ecfdf5')
                  : (d ? 'rgba(239,68,68,0.16)' : '#fef2f2'),
                color: notice.type === 'success'
                  ? (d ? '#bbf7d0' : '#166534')
                  : (d ? '#fecaca' : '#991b1b'),
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: d
                  ? '0 12px 30px rgba(0,0,0,0.35)'
                  : '0 12px 30px rgba(15,23,42,0.12)',
              }}
            >
              <span style={{ fontSize: 16 }}>
                {notice.type === 'success' ? '✓' : '!'}
              </span>
              <span>{notice.message}</span>
            </div>
          )}

          {/* Header */}
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: c.accentBg, border: `1px solid ${c.accentBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E96F1C" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {isRTL ? 'אישור יצירת תת־קבוצה' : 'Approve Learning Cluster'}
              </div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 1 }}>
                {isRTL ? 'בדקי לפני שמירה' : 'Review before saving'}
              </div>
            </div>
            <button
              className="acm-close"
              onClick={onClose}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: `1px solid ${c.border}`,
                background: d ? '#374151' : '#f8fafc',
                cursor: 'pointer',
                color: c.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background .15s',
              }}
            >
              <span style={{
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1,
                color: d ? '#ffffff' : '#0f172a',
              }}>
                ×
              </span>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Cluster Code */}
            <div>
              <Label>{isRTL ? 'קוד תת־קבוצה' : 'Cluster Code'}</Label>
              <input
                className="acm-input"
                type="text"
                value={clusterCode}
                onChange={e => setClusterCode(e.target.value)}
                placeholder={isRTL ? 'לדוגמה: SEL2026-G-SA-1' : 'e.g. SEL2026-G-SA-1'}
                style={{
                  display: 'block', width: '100%', marginTop: 7,
                  padding: '10px 13px', borderRadius: 10, outline: 'none',
                  border: `1.5px solid ${c.border}`,
                  background: d ? '#0f1824' : '#fff',
                  color: c.text, fontSize: 14, fontWeight: 500,
                  fontFamily: '"DM Mono", monospace',
                  transition: 'border-color .18s, box-shadow .18s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* CASEL Domain */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: c.alt, border: `1px solid ${c.altBorder}`,
              borderRadius: 10, padding: '10px 13px',
            }}>
              <Label>{isRTL ? 'תחום CASEL' : 'CASEL Domain'}</Label>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.text, [isRTL ? 'marginRight' : 'marginLeft']: 'auto' }}>
                {group.caselDomain || group.title}
              </span>
            </div>

            {/* Students — collapsible */}
            <div style={{ border: `1.5px solid ${c.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <button
                className="acm-toggle"
                onClick={() => setStudentsOpen(o => !o)}
                style={{
                  width: '100%', padding: '10px 13px', background: c.alt,
                  border: 'none', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 8, color: c.text,
                  fontFamily: '"DM Sans", sans-serif',
                  transition: 'background .15s',
                }}
              >
                <svg
                  width="11" height="11" viewBox="0 0 12 12" fill="none"
                  style={{ transform: studentsOpen ? 'rotate(90deg)' : (isRTL ? 'rotate(180deg)' : 'rotate(0deg)'), transition: 'transform .2s', flexShrink: 0 }}
                >
                  <path d="M4 2l4 4-4 4" stroke={c.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Label>{isRTL ? 'סטודנטים בתת־הקבוצה' : 'Students in Cluster'}</Label>
                <span style={{
                  [isRTL ? 'marginRight' : 'marginLeft']: 'auto',
                  fontSize: 11, fontWeight: 700, color: c.accent,
                  background: c.accentBg, border: `1px solid ${c.accentBorder}`,
                  borderRadius: 99, padding: '1px 8px',
                }}>
                  {students.length}
                </span>
              </button>

              {studentsOpen && (
                <div style={{ padding: '10px 13px', display: 'flex', flexWrap: 'wrap', gap: 7, borderTop: `1px solid ${c.border}` }}>
                  {students.map(s => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px 4px 5px', borderRadius: 99,
                      background: c.alt, border: `1px solid ${c.altBorder}`,
                      fontSize: 12, fontWeight: 600, color: c.sub,
                    }}>
                      {(s.profilePic || s.image || s.avatar) &&
                       !['default_empty_profile_pic', 'default', 'null', 'undefined', ''].includes(
                         String(s.profilePic || s.image || s.avatar).trim()
                       ) ? (
                        <img
                          src={s.profilePic || s.image || s.avatar}
                          alt={s.name}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: c.accentBg,
                            border: `1px solid ${c.accentBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            fontWeight: 800,
                            color: c.accent,
                            flexShrink: 0,
                          }}
                        >
                          {(s.name || '')
                            .split(' ')
                            .filter(Boolean)
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      {s.name}
                      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: c.muted }}>#{s.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulation */}
            <div style={{
              background: c.alt, border: `1px solid ${c.altBorder}`,
              borderRadius: 10, padding: '12px 14px',
              borderLeft: isRTL ? undefined : '3px solid #E96F1C',
              borderRight: isRTL ? '3px solid #E96F1C' : undefined,
            }}>
              <Label>{isRTL ? 'הסימולציה המומלצת' : 'Recommended Simulation'}</Label>
              <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.75, color: c.sub }}>
                {group.suggestedScenario || (isRTL ? 'אין סימולציה מוצעת.' : 'No suggested simulation.')}
              </p>
              {group.scenarioQuestion && (
                <p style={{ margin: '7px 0 0', fontSize: 12, lineHeight: 1.7, color: c.muted, fontStyle: 'italic' }}>
                  {group.scenarioQuestion}
                </p>
              )}
            </div>

            {/* AI Reason */}
            {group.reason && (
              <div style={{
                background: c.accentBg, border: `1px solid ${c.accentBorder}`,
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', gap: 9, alignItems: 'flex-start',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E96F1C" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <div>
                  <Label>{isRTL ? 'נימוק ה־AI' : 'AI Reasoning'}</Label>
                  <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.75, color: c.sub }}>{group.reason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 22px', borderTop: `1px solid ${c.border}`,
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            background: d ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)',
          }}>
            <button
              type="button"
              className="acm-cancel"
              onClick={onClose}
              disabled={saving}
              style={{
                border: `1.5px solid ${c.border}`, background: 'transparent',
                color: c.sub, borderRadius: 10, padding: '9px 18px',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {isRTL ? 'ביטול' : 'Cancel'}
            </button>

            <button
              type="button"
              className="acm-save"
              onClick={handleSave}
              disabled={saving}
              style={{
                border: 'none',
                background: 'linear-gradient(135deg, #f0822b, #E96F1C, #d45e0a)',
                color: '#fff', borderRadius: 10, padding: '9px 20px',
                fontWeight: 700, fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: '"DM Sans", sans-serif',
                display: 'flex', alignItems: 'center', gap: 7,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: 'spin .8s linear infinite' }}>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  {isRTL ? 'שומר...' : 'Saving...'}
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {isRTL ? 'אישור ושמירה' : 'Approve & Save'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApproveClusterModal;