import React, { useContext, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { LanguageContext } from '../../context/LanguageContext';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';

const EMPTY_FORM = { studentId: '', fullName: '', department: '', email: '' };

const LecturerStudentExcelImport = ({ onSave, onStudentsChange }) => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const isHebrew = lang === 'he';
  const dir = isHebrew ? 'rtl' : 'ltr';

  const [students, setStudents] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editBuf, setEditBuf] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addBuf, setAddBuf] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState('');
  const fileInputRef = useRef(null);

  const t = {
    dropZone: isHebrew ? 'גרור קובץ Excel לכאן, או לחץ לבחירה' : 'Drag an Excel file here or click to browse',
    hint: isHebrew ? 'נתמך: .xlsx, .xls' : 'Supported: .xlsx, .xls',
    dropNow: isHebrew ? 'שחרר לטעינה' : 'Drop to load',
    changeFile: isHebrew ? 'החלפת קובץ' : 'Change file',
    showList: isHebrew ? 'הצגת הרשימה' : 'Show list',
    hideList: isHebrew ? 'הסתרת הרשימה' : 'Hide list',
    addManual: isHebrew ? 'הוספה ידנית' : 'Add manually',
    saveList: isHebrew ? 'שמירת הרשימה' : 'Save list',
    saving: isHebrew ? 'שומר…' : 'Saving…',
    saved: isHebrew ? 'נשמר!' : 'Saved!',
    download: isHebrew ? 'הורדת Excel' : 'Download Excel',
    studentId: isHebrew ? 'ת.ז.' : 'ID',
    fullName: isHebrew ? 'שם מלא' : 'Full Name',
    department: isHebrew ? 'מחלקה' : 'Department',
    email: isHebrew ? 'אימייל' : 'Email',
    phId: isHebrew ? 'לדוג׳ 123456789' : 'e.g. 123456789',
    phName: isHebrew ? 'לדוג׳ ישראל ישראלי' : 'e.g. Jane Smith',
    phDept: isHebrew ? 'לדוג׳ מדעי המחשב' : 'e.g. Computer Science',
    phEmail: isHebrew ? 'לדוג׳ israel@college.ac.il' : 'e.g. jane@college.edu',
    actions: isHebrew ? 'פעולות' : 'Actions',
    edit: isHebrew ? 'עריכה' : 'Edit',
    delete: isHebrew ? 'מחיקה' : 'Delete',
    saveRow: isHebrew ? 'שמור שורה' : 'Save row',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    addStudent: isHebrew ? 'הוספת סטודנט' : 'Add student',
    search: isHebrew ? 'חיפוש…' : 'Search…',
    noResults: isHebrew ? 'לא נמצאו תוצאות' : 'No results found',
    noStudents: isHebrew ? 'הרשימה ריקה' : 'No students yet',
    students: isHebrew ? 'סטודנטים' : 'students',
    errEmpty: isHebrew ? 'הקובץ ריק או שהפורמט אינו נתמך.' : 'File is empty or format not supported.',
    errFile: isHebrew ? 'שגיאה בקריאת הקובץ.' : 'Error reading the file.',
    errRequired: isHebrew ? 'ת.ז. ושם מלא הם שדות חובה.' : 'ID and full name are required.',
    errDup: isHebrew ? 'סטודנט עם ת.ז. זו כבר קיים ברשימה.' : 'A student with this ID already exists.',
    errSave: isHebrew ? 'שמירה נכשלה. נסה שוב.' : 'Save failed. Please try again.',
  };

  const colors = {
    mainBg: isDark ? '#334155' : '#F8FAFC',
    softBg: isDark ? '#475569' : '#FFFFFF',
    inputBg: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#64748B' : '#E2E8F0',
    borderStrong: isDark ? '#94A3B8' : '#CBD5E1',
    text: isDark ? '#F8FAFC' : '#1E293B',
    textSoft: isDark ? '#CBD5E1' : '#64748B',
    muted: isDark ? '#94A3B8' : '#94A3B8',
    hover: isDark ? '#334155' : '#F8FAFC',
    tableHeader: isDark ? '#334155' : '#F8FAFC',
    badgeBg: isDark ? '#1E293B' : '#F1F5F9',
    blueSoft: isDark ? '#1E3A5F' : '#DBEAFE',
    blueText: isDark ? '#BFDBFE' : '#1E40AF',
  };

  const parseFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setSaveStatus(null);
    setShowTable(false);
    setSearchQuery('');

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows.length) {
        alert(t.errEmpty);
        setStudents([]);
        return;
      }

const mappedStudents = rows.map((r) => ({
  studentId: r.studentId || r.StudentID || r['Student ID'] || r['תעודת זהות'] || r['ת.ז.'] || '',
  fullName: r.fullName || r.FullName || r['Full Name'] || r['שם מלא'] || '',
  department: r.department || r.Department || r['מחלקה'] || '',
  email: r.email || r.Email || r['אימייל'] || r['מייל'] || '',
}));

setStudents(mappedStudents);
onStudentsChange?.(mappedStudents);
    } catch {
      alert(t.errFile);
    }
  };

  const handleFileChange = (e) => {
    parseFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) parseFile(f);
  };

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditBuf({ ...students[idx] });
  };

const commitEdit = () => {
  const updatedStudents = students.map((s, i) =>
    i === editingIdx ? { ...editBuf } : s
  );

  setStudents(updatedStudents);
  onStudentsChange?.(updatedStudents);
  setEditingIdx(null);
};

const deleteRow = (idx) => {
  const updatedStudents = students.filter((_, i) => i !== idx);

  setStudents(updatedStudents);
  onStudentsChange?.(updatedStudents);

  if (editingIdx === idx) setEditingIdx(null);
};

  const commitAdd = () => {
    if (!addBuf.studentId.trim() || !addBuf.fullName.trim()) {
      setAddError(t.errRequired);
      return;
    }

    if (students.some((s) => String(s.studentId) === addBuf.studentId.trim())) {
      setAddError(t.errDup);
      return;
    }

const updatedStudents = [
  ...students,
  {
    ...addBuf,
    studentId: addBuf.studentId.trim(),
    fullName: addBuf.fullName.trim(),
  },
];

setStudents(updatedStudents);
onStudentsChange?.(updatedStudents);
    setAddBuf(EMPTY_FORM);
    setAddError('');
    setShowAddForm(false);
    setShowTable(true);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await onSave?.(students);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleDownload = () => {
    const headers = [t.studentId, t.fullName, t.department, t.email];
    const rows = students.map((s) => [s.studentId, s.fullName, s.department, s.email]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students_updated.xlsx');
  };

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      String(s.studentId).includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  const hasStudents = students.length > 0;

  const inpStyle = (extra = {}) => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 11px',
    fontSize: 13,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 7,
    background: colors.inputBg,
    color: colors.text,
    fontFamily: 'inherit',
    outline: 'none',
    display: 'block',
    ...extra,
  });

  const btn = ({ variant = 'ghost', small = false } = {}) => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: small ? '5px 12px' : '8px 16px',
      borderRadius: 8,
      fontSize: small ? 12 : 13,
      fontWeight: 500,
      fontFamily: 'inherit',
      cursor: 'pointer',
      transition: 'opacity 0.15s',
      whiteSpace: 'nowrap',
      border: '0.5px solid transparent',
    };

    if (variant === 'primary') return { ...base, background: '#185FA5', color: '#fff', border: 'none' };
    if (variant === 'success') return { ...base, background: '#0F6E56', color: '#fff', border: 'none' };
    if (variant === 'teal') return { ...base, background: '#0F6E56', color: '#fff', border: 'none' };
    if (variant === 'outline') return { ...base, background: 'transparent', color: colors.text, border: `0.5px solid ${colors.border}` };

    return { ...base, background: 'transparent', color: colors.textSoft, border: `0.5px solid ${colors.border}` };
  };

  const iconBtn = (color = colors.textSoft) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 5,
    color,
    borderRadius: 5,
    lineHeight: 0,
    display: 'inline-flex',
  });

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: colors.textSoft,
    display: 'block',
    marginBottom: 5,
    letterSpacing: '0.02em',
  };

  return (
    <div dir={dir} style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)', color: colors.text }}>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label={t.dropZone}
        style={{
          border: `2px dashed ${isDragging ? '#378ADD' : colors.borderStrong}`,
          borderRadius: 14,
          background: isDragging ? (isDark ? '#1E3A5F' : '#EFF6FF') : colors.mainBg,
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: '1rem',
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: isDragging ? colors.blueSoft : colors.softBg,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.65rem',
          color: isDragging ? colors.blueText : colors.muted,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>

        {fileName ? (
          <>
            <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 2, color: colors.text }}>{fileName}</p>
            <p style={{ fontSize: 12, color: colors.textSoft, marginBottom: 8 }}>{students.length} {t.students}</p>
            <span
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{ fontSize: 12, color: isDark ? '#93C5FD' : '#185FA5', textDecoration: 'underline', cursor: 'pointer', textUnderlineOffset: 3 }}
            >
              {t.changeFile}
            </span>
          </>
        ) : (
          <>
            <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 4, color: isDragging ? colors.blueText : colors.text }}>
              {isDragging ? t.dropNow : t.dropZone}
            </p>
            <p style={{ fontSize: 12, color: colors.muted }}>{t.hint}</p>
          </>
        )}

        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} aria-hidden="true" />
      </div>

      {hasStudents && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          background: colors.mainBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: '11px 16px',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: colors.blueSoft, color: colors.blueText, fontWeight: 600, fontSize: 18, lineHeight: 1, padding: '5px 13px', borderRadius: 8 }}>
              {students.length}
            </span>
            <span style={{ fontSize: 13, color: colors.textSoft }}>{t.students}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
<button
  type="button"
  style={btn({ variant: 'ghost', small: true })}
  onClick={() => {
    setShowTable((v) => !v);
    setSearchQuery('');
  }}
>
  {showTable ? (
    <>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>

      {t.hideList}
    </>
  ) : (
    <>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>

      {t.showList}
    </>
  )}
</button>

            <button type="button" style={btn({ variant: 'outline', small: true })} onClick={() => { setShowAddForm((v) => !v); setAddBuf(EMPTY_FORM); setAddError(''); }}>
              {t.addManual}
            </button>

            <button type="button" style={btn({ variant: 'outline', small: true })} onClick={handleDownload}>
              {t.download}
            </button>

           
          </div>
        </div>
      )}

      {showAddForm && (
        <div style={{
          background: colors.softBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: '1.1rem 1.25rem',
          marginBottom: '1rem',
          boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 14, color: colors.text }}>{t.addManual}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>{t.studentId}<span style={{ color: '#EF4444', marginInlineStart: 2 }}>*</span></label>
              <input type="text" value={addBuf.studentId} onChange={(e) => setAddBuf((b) => ({ ...b, studentId: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && commitAdd()} placeholder={t.phId} style={inpStyle()} />
            </div>

            <div>
              <label style={labelStyle}>{t.fullName}<span style={{ color: '#EF4444', marginInlineStart: 2 }}>*</span></label>
              <input type="text" value={addBuf.fullName} onChange={(e) => setAddBuf((b) => ({ ...b, fullName: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && commitAdd()} placeholder={t.phName} style={inpStyle()} />
            </div>

            <div>
              <label style={labelStyle}>{t.department}</label>
              <input type="text" value={addBuf.department} onChange={(e) => setAddBuf((b) => ({ ...b, department: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && commitAdd()} placeholder={t.phDept} style={inpStyle()} />
            </div>

            <div>
              <label style={labelStyle}>{t.email}</label>
              <input type="email" value={addBuf.email} onChange={(e) => setAddBuf((b) => ({ ...b, email: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && commitAdd()} placeholder={t.phEmail} style={inpStyle()} />
            </div>
          </div>

          {addError && (
            <p style={{ fontSize: 12, color: '#F87171', marginBottom: 10 }}>
              {addError}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={btn({ variant: 'primary', small: true })} onClick={commitAdd}>{t.addStudent}</button>
            <button type="button" style={btn({ variant: 'ghost', small: true })} onClick={() => { setShowAddForm(false); setAddError(''); setAddBuf(EMPTY_FORM); }}>{t.cancel}</button>
          </div>
        </div>
      )}

      {showTable && hasStudents && (
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '0.75rem', maxWidth: 260 }}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              style={inpStyle()}
            />
          </div>

          <div style={{ borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden', background: colors.softBg }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: colors.tableHeader, borderBottom: `1px solid ${colors.border}` }}>
                    {[t.studentId, t.fullName, t.department, t.email, t.actions].map((h) => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: isHebrew ? 'right' : 'left', fontWeight: 500, fontSize: 11, color: colors.textSoft, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: colors.muted, fontSize: 13 }}>
                        {searchQuery ? t.noResults : t.noStudents}
                      </td>
                    </tr>
                  ) : filtered.map((student) => {
                    const realIdx = students.indexOf(student);
                    const isEditing = editingIdx === realIdx;
                    const cell = { padding: '9px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: colors.text };

                    return (
                      <tr
                        key={realIdx}
                        style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.1s', background: colors.softBg }}
                        onMouseEnter={(e) => !isEditing && (e.currentTarget.style.background = colors.hover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = colors.softBg)}
                      >
                        {!isEditing ? (
                          <>
                            <td style={{ ...cell, fontFamily: 'monospace', fontSize: 12, color: colors.textSoft }}>{student.studentId}</td>
                            <td style={{ ...cell, fontWeight: 500 }}>{student.fullName}</td>
                            <td style={cell}>
                              {student.department && (
                                <span style={{ background: colors.badgeBg, border: `1px solid ${colors.border}`, borderRadius: 5, padding: '2px 7px', fontSize: 11, color: colors.textSoft }}>
                                  {student.department}
                                </span>
                              )}
                            </td>
                            <td style={{ ...cell, color: isDark ? '#93C5FD' : '#185FA5', fontSize: 12 }}>{student.email}</td>
                            <td style={{ ...cell, padding: '6px 10px' }}>
                              <div style={{ display: 'flex', gap: 2 }}>
                                <button type="button" title={t.edit} onClick={() => startEdit(realIdx)} style={iconBtn(colors.textSoft)}>✎</button>
                                <button type="button" title={t.delete} onClick={() => deleteRow(realIdx)} style={iconBtn('#F87171')}>🗑</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            {[
                              { key: 'studentId', ph: t.phId },
                              { key: 'fullName', ph: t.phName },
                              { key: 'department', ph: t.phDept },
                              { key: 'email', ph: t.phEmail },
                            ].map(({ key, ph }) => (
                              <td key={key} style={{ padding: '5px 7px' }}>
                                <input
                                  value={editBuf[key]}
                                  placeholder={ph}
                                  onChange={(e) => setEditBuf((b) => ({ ...b, [key]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitEdit();
                                    if (e.key === 'Escape') setEditingIdx(null);
                                  }}
                                  style={inpStyle({ padding: '5px 8px', fontSize: 12 })}
                                />
                              </td>
                            ))}

                            <td style={{ padding: '5px 10px' }}>
                              <div style={{ display: 'flex', gap: 2 }}>
                                <button type="button" title={t.saveRow} onClick={commitEdit} style={iconBtn('#34D399')}>✓</button>
                                <button type="button" title={t.cancel} onClick={() => setEditingIdx(null)} style={iconBtn(colors.textSoft)}>×</button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <p style={{ fontSize: 12, color: '#F87171', marginTop: 8 }}>{t.errSave}</p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #94A3B8; opacity: 1; }
      `}</style>
    </div>
  );
};

export default LecturerStudentExcelImport;