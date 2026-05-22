import React, { useContext, useEffect, useRef, useState } from 'react';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';
import { LanguageContext } from '../../context/LanguageContext';
import { useParams } from 'react-router-dom';
import ApproveClusterModal from './ApproveClusterModal';

const CASEL_COLORS = [
  { bg: '#E96F1C', border: '#C95B12', text: '#7C2D12', dot: '#E96F1C' },
  { bg: '#F08A22', border: '#D97706', text: '#7C2D12', dot: '#F08A22' },
  { bg: '#F4C430', border: '#D4A017', text: '#713F12', dot: '#F4C430' },
  { bg: '#8FAE32', border: '#6B8E23', text: '#365314', dot: '#8FAE32' },
  { bg: '#7FA334', border: '#5F7F24', text: '#365314', dot: '#7FA334' },
];

const CASEL_TRANSLATIONS = {
  'Self-Awareness': 'מודעות עצמית',
  'Self Awareness': 'מודעות עצמית',
  'Self-Management': 'ניהול עצמי',
  'Self Management': 'ניהול עצמי',
  'Social-Awareness': 'מודעות חברתית',
  'Social Awareness': 'מודעות חברתית',
  'Relationship-Skills': 'מיומנויות בין־אישיות',
  'Relationship Skills': 'מיומנויות בין־אישיות',
  'Responsible-Decision-Making': 'קבלת החלטות אחראית',
  'Responsible Decision-Making': 'קבלת החלטות אחראית',
  'Responsible Decision Making': 'קבלת החלטות אחראית',
};

const getGroupTitle = group => group?.caselDomain || group?.title || 'CASEL Domain';

const getLocalizedGroupTitle = (group, isRTL) => {
  const title = getGroupTitle(group);
  return isRTL ? CASEL_TRANSLATIONS[title] || title : title;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const hasRealProfilePic = (profilePic) => {
  return (
    profilePic &&
    profilePic !== 'default_empty_profile_pic' &&
    profilePic !== 'default_profile_pic' &&
    profilePic !== 'null' &&
    profilePic !== 'undefined'
  );
};

const getSvgTitleLines = (title, isRTL) => {
  if (!title) return ['', ''];
  if (isRTL) {
    if (title === 'קבלת החלטות אחראית') return ['קבלת החלטות', 'אחראית'];
    if (title === 'מיומנויות בין־אישיות') return ['מיומנויות', 'בין־אישיות'];
    if (title === 'מודעות חברתית') return ['מודעות', 'חברתית'];
    if (title === 'מודעות עצמית') return ['מודעות', 'עצמית'];
    if (title === 'ניהול עצמי') return ['ניהול', 'עצמי'];
  } else {
    if (title === 'Responsible Decision-Making') return ['Responsible', 'Decision-Making'];
if (title === 'Responsible-Decision-Making') return ['Responsible', 'Decision-Making'];
if (title === 'Responsible Decision Making') return ['Responsible', 'Decision-Making'];
    if (title === 'Relationship-Skills') return ['Relationship', 'Skills'];
    if (title === 'Self-Awareness') return ['Self', 'Awareness'];
    if (title === 'Self-Management') return ['Self', 'Management'];
    if (title === 'Social-Awareness') return ['Social', 'Awareness'];
  }

  const words = title.split(' ');
  if (words.length <= 2) return [title, ''];

  const middle = Math.ceil(words.length / 2);
  return [
    words.slice(0, middle).join(' '),
    words.slice(middle).join(' ')
  ];
};

const Avatar = ({ student, size = 34, colorDot }) => {
  const [imgErr, setImgErr] = useState(false);
  const initials = getInitials(student?.name);

  return (
    <div style={{ flexShrink: 0 }}>
      {hasRealProfilePic(student?.profilePic) && !imgErr ? (
        <img
          src={student.profilePic}
          alt={student.name || 'student'}
          onError={() => setImgErr(true)}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${colorDot}`,
            background: '#fff',
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px solid ${colorDot}`,
            background: '#E2E8F0',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

const StudentChip = ({ student, colorDot, isDark, isRTL }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: isDark ? '#0f172a' : '#ffffff',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 999,
      padding: isRTL ? '5px 5px 5px 12px' : '5px 12px 5px 5px',
    }}
  >
    <Avatar student={student} size={32} colorDot={colorDot} />

    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#e2e8f0' : '#334155' }}>
        {student?.name || (isRTL ? 'סטודנט ללא שם' : 'Unknown Student')}
      </span>
      <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>
        {isRTL ? 'ת״ז' : 'ID'}: {student?.id || '---'}
      </span>
    </div>
  </div>
);

const StatsBar = ({ isDark, isRTL }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
        {isRTL ? 'מפת תחומי CASEL' : 'CASEL Domain Map'}
      </h1>
      <p style={{ marginTop: 6, fontSize: 14, color: isDark ? '#94a3b8' : '#64748b' }}>
        {isRTL
          ? 'חלוקת סטודנטים לפי תחומי CASEL שבהם הם זקוקים לחיזוק'
          : 'Students grouped by CASEL domains that need strengthening'}
      </p>
    </div>
  </div>
);

const ViewToggle = ({ view, setView, isDark, isRTL }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-start',
      direction: isRTL ? 'rtl' : 'ltr',
    }}
  >
    <div
      style={{
        display: 'flex',
        gap: 6,
        background: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: 14,
        padding: 5,
      }}
    >
      {[
        { id: 'map', label: isRTL ? 'מפה' : 'Map' },
        { id: 'simulations', label: isRTL ? 'סימולציות' : 'Simulations' },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: '8px 20px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            background: view === item.id ? '#E96F1C' : 'transparent',
            color: view === item.id ? '#fff' : isDark ? '#cbd5e1' : '#475569',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
);

const CaselCircleMap = ({ groups = [], isDark, isRTL, setView }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showStudents, setShowStudents] = useState(false);
  const cx = 350;
  const cy = 350;
  const r = 285;
  const innerR = 98;
  const angleStep = 360 / 5;

  const safeGroups = Array.isArray(groups) ? groups.slice(0, 5) : [];
  
  // הגנה מפני מפתח אינדקס שאינו קיים במערך הנוכחי
  const activeIndex = selectedIndex >= safeGroups.length ? 0 : selectedIndex;
  const selectedGroup = safeGroups[activeIndex];
  const selectedColor = CASEL_COLORS[activeIndex % CASEL_COLORS.length] || CASEL_COLORS[0];

  if (safeGroups.length === 0) return null;

  const polar = (angle, radius) => {
    const rad = (Math.PI / 180) * angle;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const sectorPath = (startAngle, endAngle) => {
    const p1 = polar(startAngle, innerR);
    const p2 = polar(startAngle, r);
    const p3 = polar(endAngle, r);
    const p4 = polar(endAngle, innerR);

    return `
      M ${p1.x} ${p1.y}
      L ${p2.x} ${p2.y}
      A ${r} ${r} 0 0 1 ${p3.x} ${p3.y}
      L ${p4.x} ${p4.y}
      A ${innerR} ${innerR} 0 0 0 ${p1.x} ${p1.y}
      Z
    `;
  };

  return (
    <div
      style={{
        background: isDark ? '#0f172a' : '#fff',
        borderRadius: 24,
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        padding: '18px 20px',
        display: 'grid',
        gridTemplateColumns: 'minmax(520px, 1fr) 360px',
        gap: 18,
        alignItems: 'stretch',
        overflowX: 'auto',
        overflowY: 'visible',
      }}
    >
      <svg
        viewBox="0 0 700 700"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: 'min(68vh, 620px)',
          maxHeight: 620,
          minHeight: 500,
          display: 'block',
        }}
      >
        {safeGroups.map((group, i) => {
          const color = CASEL_COLORS[i % CASEL_COLORS.length];
          const start = -90 + i * angleStep;
          const end = start + angleStep;
          const mid = start + angleStep / 2;

          const labelPos = polar(mid, isRTL ? 198 : 188);
          const title = getLocalizedGroupTitle(group, isRTL);
          const [line1, line2] = getSvgTitleLines(title, isRTL);

          const students = group?.students || [];
          const visibleStudents = students.slice(0, 4);
          const hiddenCount = Math.max(students.length - visibleStudents.length, 0);

          return (
            <g
              key={group.id || `casel-sector-${i}`}
              onClick={() => {
                setSelectedIndex(i);
                setShowStudents(false);
              }}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={sectorPath(start, end)}
                fill={color.bg}
                stroke="#ffffff"
                strokeWidth="3"
                opacity={isDark ? 0.92 : 1}
              />

              <text
                x={labelPos.x}
                y={labelPos.y - 40}
                textAnchor="middle"
                fontSize={isRTL ? "18" : "14"}
                fontWeight="900"
                fill="#111827"
              >
                {line1}
              </text>

              {line2 && (
                <text
                  x={labelPos.x}
                  y={labelPos.y - 18}
                  textAnchor="middle"
                  fontSize={isRTL ? "16" : "13"}
                  fontWeight="900"
                  fill="#111827"
                >
                  {line2}
                </text>
              )}

              {(() => {
                const totalCircles = visibleStudents.length + (hiddenCount > 0 ? 1 : 0);
                const circleGap = 28;
                const startX = labelPos.x - ((totalCircles - 1) * circleGap) / 2;
                const avatarY = labelPos.y + 8;

                return (
                  <>
                    {visibleStudents.map((student, si) => {
                      const initials = getInitials(student?.name);
                      const avatarX = startX + si * circleGap;

                      return (
                        <g key={student?.id || `avatar-${i}-${si}`}>
                          <foreignObject
                            x={avatarX - 13}
                            y={avatarY - 13}
                            width="26"
                            height="26"
                          >
                            <div
                              xmlns="http://www.w3.org/1999/xhtml"
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: '#ffffff',
                                border: '1.4px solid #111827',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                              }}
                            >
                              {hasRealProfilePic(student?.profilePic) ? (
                                <img
                                  src={student.profilePic}
                                  alt={student.name || 'student'}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: '#E2E8F0',
                                    color: '#334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 7.5,
                                    fontWeight: 900,
                                    lineHeight: 1,
                                  }}
                                >
                                  {initials}
                                </span>
                              )}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}

                    {hiddenCount > 0 && (
                      <g>
                        <circle
                          cx={startX + visibleStudents.length * circleGap}
                          cy={avatarY}
                          r="13"
                          fill="#ffffff"
                          stroke="#cbd5e1"
                          strokeWidth="1.4"
                        />
                        <text
                          x={startX + visibleStudents.length * circleGap}
                          y={avatarY + 3.5}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="900"
                          fill="#111827"
                        >
                          <tspan unicodeBidi="bidi-override" direction="ltr">
  +{hiddenCount}
</tspan>
                        </text>
                      </g>
                    )}
                  </>
                );
              })()}

              <rect
                x={labelPos.x - 72}
                y={labelPos.y + 28}
                width="144"
                height="34"
                rx="17"
                fill="rgba(255,255,255,0.84)"
                stroke="rgba(17,24,39,0.18)"
              />

              <text
                x={labelPos.x}
                y={labelPos.y + 50}
                textAnchor="middle"
                fontSize="13"
                fontWeight="900"
                fill="#111827"
              >
                {students.length} {isRTL ? 'זקוקים לחיזוק' : 'need support'}
              </text>
            </g>
          );
        })}
        {selectedGroup && (() => {
          const start = -90 + activeIndex * angleStep;
          const end = start + angleStep;

          return (
            <path
              d={sectorPath(start, end)}
              fill="none"
              stroke="#111827"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />
          );
        })()}
        <circle cx={cx} cy={cy} r={innerR - 7} fill="#fff" stroke="#e5e7eb" strokeWidth="4" />
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={isRTL ? "28" : "24"} fontWeight="900" fill="#111827">
          SEL
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize={isRTL ? "14" : "11"} fontWeight="800" fill="#374151">
          {isRTL ? 'למידה רגשית־חברתית' : 'Social Emotional Learning'}
        </text>
      </svg>

      {selectedGroup && (
        <aside
          style={{
            background: isDark ? '#1e293b' : '#f8fafc',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: 20,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minWidth: 0,
          }}
        >
          <div>
            <div
              style={{
                width: 38,
                height: 6,
                borderRadius: 999,
                background: selectedColor.dot,
                marginBottom: 12,
              }}
            />

            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: isDark ? '#fff' : '#0f172a' }}>
              {getLocalizedGroupTitle(selectedGroup, isRTL)}
            </h2>

            <p style={{ margin: '6px 0 0', fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.7 }}>
              {isRTL
                ? 'זהו התחום שהמערכת זיהתה כזקוק לחיזוק אצל הסטודנטים המסומנים במפה.'
                : 'This is the CASEL domain identified as needing support.'}
            </p>
          </div>

          {selectedGroup.reason && (
            <div
              style={{
                background: isDark ? '#0f172a' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: '#E96F1C', marginBottom: 8 }}>
                {isRTL ? 'הסבר ה-AI' : 'AI Reason'}
              </div>

              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: isDark ? '#cbd5e1' : '#475569' }}>
                {selectedGroup.reason}
              </p>
            </div>
          )}

          <div
            style={{
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <button
              type="button"
              onClick={() => setShowStudents(prev => !prev)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: isDark ? '#e2e8f0' : '#334155',
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              <span>
                {isRTL ? 'רשימת הסטודנטים' : 'Students List'} ({selectedGroup.students?.length || 0})
              </span>

              <span style={{ fontSize: 16 }}>
                {showStudents ? '▲' : '▼'}
              </span>
            </button>

            {showStudents && (
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxHeight: 220,
                  overflowY: 'auto',
                  paddingInlineEnd: 4,
                }}
              >
                {(selectedGroup.students || []).map((student, idx) => (
                  <StudentChip
                    key={student?.id || `chip-${idx}`}
                    student={student}
                    colorDot={selectedColor.dot}
                    isDark={isDark}
                    isRTL={isRTL}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: '#E96F1C', marginBottom: 8 }}>
              {isRTL ? 'הצעת המשך' : 'Suggested Next Step'}
            </div>

            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: isDark ? '#cbd5e1' : '#475569' }}>
              {isRTL
                ? 'המערכת הציעה סימולציה לחיזוק הסטודנטים האלו. כדי ליצור תת־קבוצה עם הסימולציה, עברי ללשונית סימולציות ולחצי על יצירת תת־קבוצה.'
                : 'Open the Simulations tab to create a subgroup using the suggested simulation.'}
            </p>

            <button
              type="button"
              onClick={() => setView('simulations')}
              style={{
                marginTop: 12,
                width: '100%',
                border: 'none',
                borderRadius: 12,
                padding: '10px 14px',
                background: '#E96F1C',
                color: '#fff',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {isRTL ? 'מעבר ללשונית סימולציות' : 'Go to Simulations'}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

const SimulationsView = ({ groups = [], isDark, isRTL, onCreateCluster }) => {
  const safeGroups = Array.isArray(groups) ? groups : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {safeGroups.map((group, index) => {
        const color = CASEL_COLORS[index % CASEL_COLORS.length] || CASEL_COLORS[0];
        const students = group?.students || [];

        return (
          <div
            key={group.id || `sim-group-${index}`}
            style={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: 18,
              padding: 20,
            }}
          >
            <h3 style={{ margin: 0, color: isDark ? '#fff' : '#0f172a', fontSize: 19, fontWeight: 900 }}>
              {getLocalizedGroupTitle(group, isRTL)}
            </h3>

            <div
              style={{
                marginTop: 16,
                background: isDark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: isDark ? '#e2e8f0' : '#334155',
                  marginBottom: 12,
                }}
              >
                {isRTL ? 'סטודנטים בקבוצה' : 'Students in This Group'}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {students.length > 0 ? (
                  students.map((student, idx) => (
                    <StudentChip
                      key={student?.id || `sim-chip-${idx}`}
                      student={student}
                      colorDot={color.dot}
                      isDark={isDark}
                      isRTL={isRTL}
                    />
                  ))
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                    {isRTL ? 'לא זוהו סטודנטים חלשים בתחום זה.' : 'No students were identified in this domain.'}
                  </p>
                )}
              </div>
            </div>

            {group?.reason && (
              <div
                style={{
                  marginTop: 16,
                  background: isDark ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#E96F1C',
                    marginBottom: 8,
                  }}
                >
                  {isRTL ? 'הסבר ה-AI לבחירה' : 'AI Reason for This Suggestion'}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.9,
                    color: isDark ? '#cbd5e1' : '#475569',
                  }}
                >
                  {group.reason}
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: 16,
                background: isDark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isDark ? '#1e293b' : '#fff7ed',
                  color: '#E96F1C',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 14,
                }}
              >
                {isRTL ? 'סימולציה מוצעת על ידי AI' : 'AI Suggested Simulation'}
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: isDark ? '#e2e8f0' : '#334155',
                }}
              >
                {group?.suggestedScenario || (isRTL ? 'אין תרחיש מוצע כרגע.' : 'No suggested scenario yet.')}
              </p>

              {group?.scenarioQuestion && (
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#E96F1C',
                      marginBottom: 10,
                    }}
                  >
                    {isRTL ? 'שאלת הסימולציה' : 'Simulation Question'}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: isDark ? '#cbd5e1' : '#475569',
                    }}
                  >
                    {group.scenarioQuestion}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onCreateCluster && onCreateCluster(group)}
              style={{
                marginTop: 14,
                border: 'none',
                borderRadius: 12,
                padding: '9px 16px',
                background: color.dot,
                color: '#fff',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {isRTL ? 'יצירת תת־קבוצה' : 'Create Subgroup'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const ClassSELGroupsDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const langContext = useContext(LanguageContext);
  const lang = langContext?.lang || 'he';
  const { classCode } = useParams();

  const [groups, setGroups] = useState([]);
  const [view, setView] = useState('map');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const hasFetchedRef = useRef(false);

  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/classes/${classCode}/sel-analysis`);
        if (!res.ok) throw new Error('Network response error');
        const data = await res.json();
        setGroups(data?.groups || []);
      } catch (err) {
        console.error('Error fetching SEL analysis:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [classCode]);

  const innerBg = isDark ? '#1e293b' : '#fff';
  const textClr = isDark ? '#f1f5f9' : '#0f172a';
  const mutedClr = isDark ? '#94a3b8' : '#64748b';
  const borderClr = isDark ? '#334155' : '#e2e8f0';

  const handleCreateCluster = (group) => {
    setSelectedGroup(group);
    setIsApproveModalOpen(true);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
      }`}
    >
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-5 rounded-xl`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StatsBar isDark={isDark} isRTL={isRTL} />
            <ViewToggle view={view} setView={setView} isDark={isDark} isRTL={isRTL} />

            {loading ? (
              <div
                style={{
                  background: innerBg,
                  borderRadius: 20,
                  padding: '64px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  border: `1px solid ${borderClr}`,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    borderColor: borderClr,
                    borderTopColor: '#E96F1C',
                    animation: 'spin 0.9s linear infinite',
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: mutedClr, fontSize: 14, margin: 0 }}>
                  {isRTL ? 'מנתח נתוני CASEL...' : 'Analyzing CASEL data...'}
                </p>
              </div>
            ) : error ? (
              <div style={{ background: innerBg, borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ color: '#ef4444', fontWeight: 700, margin: 0 }}>
                  {isRTL ? 'שגיאה בטעינת הנתונים' : 'Failed to load analysis'}
                </p>
              </div>
            ) : groups.length === 0 ? (
              <div style={{ background: innerBg, borderRadius: 20, padding: '64px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: textClr, margin: 0 }}>
                  {isRTL ? 'לא זוהו תחומים הדורשים חיזוק' : 'No CASEL weaknesses detected'}
                </p>
              </div>
            ) : view === 'map' ? (
              <CaselCircleMap
                groups={groups}
                isDark={isDark}
                isRTL={isRTL}
                setView={setView}
              />
            ) : (
              <SimulationsView
                groups={groups}
                isDark={isDark}
                isRTL={isRTL}
                onCreateCluster={handleCreateCluster}
              />
            )}
          </div>
        </div>
      </main>

      {user?.id && <AIChat teacherId={user.id} />}

      <div className="px-4 pb-4">
        <Footer />
      </div>

      <ApproveClusterModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        group={selectedGroup}
        classCode={classCode}
        teacherId={user?.id}
        isDark={isDark}
        isRTL={isRTL}
      />
    </div>
  );
};

export default ClassSELGroupsDashboard;