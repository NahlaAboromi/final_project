// File: src/pages/Create_New_Class.jsx
import React, { useContext, useState } from 'react';
import ClassForm from '../ClassForm';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';
import LecturerStudentExcelImport from '../lecturerEnhancements/LecturerStudentExcelImport';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const CreateClassContent = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const isDark = theme === 'dark';

  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = lang === 'he';
  const { t } = useI18n('createClass');

  const [showInfo, setShowInfo] = useState(false);
  const [showRosterInfo, setShowRosterInfo] = useState(false);
const [studentRoster, setStudentRoster] = useState([]);
const [excelResetKey, setExcelResetKey] = useState(0);
const hasStudentRoster = studentRoster.length > 0;
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
    >
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>

          {/* Page title + info button */}
          <div className="flex items-center gap-2 mb-2 px-2">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {t('title')}
            </h1>
            <button
              onClick={() => setShowInfo(true)}
              className="ms-1 p-1 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-blue-200 dark:hover:bg-slate-500 transition"
              aria-label={t('infoAria')}
              title={t('infoTitle')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
              </svg>
            </button>
          </div>

          <p className={`${isDark ? 'text-gray-300' : 'text-slate-500'} mb-6 px-2 text-sm`}>
            {t('lead')}
          </p>

          {/* ── Single unified card ── */}
          <div className={`rounded-xl shadow-md ${isDark ? 'bg-slate-600' : 'bg-white'}`}>

            {/* Section 1 — Student Roster */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white bg-blue-600 flex-shrink-0">
                  1
                </span>
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {isRTL ? 'רשימת סטודנטים לכיתה' : 'Class Student Roster'}
                </h2>
                <button
                  onClick={() => setShowRosterInfo(true)}
                  className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-slate-500 transition"
                  aria-label={isRTL ? 'מידע על ייבוא סטודנטים' : 'About student import'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                  </svg>
                </button>
              </div>

              <p className={`text-xs mb-5 ${isRTL ? 'me-9' : 'ms-9'} ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
{isRTL
  ? 'יש להעלות רשימת סטודנטים לפני יצירת הכיתה'
  : 'Please upload a student roster before creating the class'}
              </p>

             <LecturerStudentExcelImport
  key={excelResetKey}
  onStudentsChange={setStudentRoster}
/>
            </div>

            {/* Divider */}
            <div className={`mx-6 border-t ${isDark ? 'border-slate-500' : 'border-slate-100'}`} />

            {/* Section 2 — Class Details */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white bg-blue-600 flex-shrink-0">
                  2
                </span>
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {isRTL ? 'פרטי הכיתה' : 'Class Details'}
                </h2>
              </div>

              <ClassForm
  studentRoster={studentRoster}
  onClassCreated={() => {
  setStudentRoster([]);
  setExcelResetKey(prev => prev + 1);
}}
/>
            </div>

          </div>
        </div>
      </main>

      {/* Popup — How it works */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-10/12 max-w-xl text-slate-800 dark:text-white">
            <h3 className="font-medium text-blue-800 dark:text-blue-300">{t('popup.title')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{t('popup.p1')}</p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>{t('popup.li1')}</li>
              <li>{t('popup.li2')}</li>
              <li>{t('popup.li3')}</li>
              <li>{t('popup.li4')}</li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {t('popup.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup — Roster info */}
      {showRosterInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-10/12 max-w-md text-slate-800 dark:text-white">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
              {isRTL ? 'ייבוא רשימת סטודנטים' : 'Student Roster Import'}
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
              <li>{isRTL ? 'גרור קובץ Excel (.xlsx/.xls) עם רשימת הסטודנטים' : 'Drag an Excel file (.xlsx/.xls) with your student list'}</li>
              <li>{isRTL ? 'עמודות נתמכות: ת.ז., שם מלא, מחלקה, אימייל' : 'Supported columns: ID, Full Name, Department, Email'}</li>
              <li>{isRTL ? 'ניתן לערוך, למחוק ולהוסיף ידנית לאחר הייבוא' : 'Edit, delete, or add students manually after import'}</li>
              <li>{isRTL ? 'ניתן להוריד את הרשימה המעודכנת כ־Excel' : 'Download the updated list as Excel'}</li>
            </ul>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowRosterInfo(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                {isRTL ? 'הבנתי' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}

      {user?.id && <AIChat teacherId={user.id} />}

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const Create_New_Class = () => <CreateClassContent />;
export default Create_New_Class;