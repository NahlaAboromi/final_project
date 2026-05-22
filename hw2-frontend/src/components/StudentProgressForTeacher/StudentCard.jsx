import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const defaultAvatar =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const StudentCard = ({ student }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { t, dir, lang } = useI18n('studentCard');
  const { lang: currentLang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = currentLang === 'he';

  const {
    id,
    username = 'Unknown Student',
    profilePic,
    averageScore = 0,
    uniqueSimulations = 0,
    totalAttempts = 0,
    latestActivity,
    overallScore,
  } = student;

  useEffect(() => {
    console.log('📌 StudentCard received student:', student);
  }, [student]);

  const getScoreStyle = (score) => {
    const num = Number(score || 0);

    if (num >= 4.5) {
      return {
        color: '#22c55e',
        bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
        border: '#22c55e',
        label: currentLang === 'he' ? 'מצוין' : 'Excellent',
      };
    }

    if (num >= 3.5) {
      return {
        color: '#3b82f6',
        bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
        border: '#3b82f6',
        label: currentLang === 'he' ? 'טוב' : 'Good',
      };
    }

    if (num >= 2.5) {
      return {
        color: '#f59e0b',
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
        border: '#f59e0b',
        label: currentLang === 'he' ? 'בינוני' : 'Average',
      };
    }

    return {
      color: '#ef4444',
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
      border: '#ef4444',
      label: currentLang === 'he' ? 'דורש שיפור' : 'Needs Work',
    };
  };

  const scoreStyle = getScoreStyle(averageScore);

  const studentState = {
    id,
    username,
    profilePic,
    averageScore,
    uniqueSimulations,
    totalAttempts,
    overallScore,
  };

  const formatLatestActivity = (value) => {
    if (!value) return t('noActivity');

    const date = new Date(value);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      dir={dir}
      lang={lang}
      className={`rounded-lg shadow-md p-4 sm:p-6 w-full sm:w-[300px] transition-all hover:shadow-lg ${
        isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-800'
      }`}
style={{
  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
}}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <img
            src={
              profilePic && profilePic !== 'default_empty_profile_pic'
                ? profilePic
                : defaultAvatar
            }
            alt={t('profileAlt')}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
            style={{
              border: `3px solid ${scoreStyle.border}`,
              boxShadow: `0 0 0 3px ${scoreStyle.bg}`,
            }}
            onError={(e) => {
              e.target.src = defaultAvatar;
              e.target.onerror = null;
            }}
          />

          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold truncate" title={username}>
              {username}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500">
              {t('studentId')}: <span dir="ltr">{id}</span>
            </p>

            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                color: scoreStyle.color,
                backgroundColor: scoreStyle.bg,
              }}
            >
              {scoreStyle.label}
            </span>
          </div>
        </div>

        <div
          className="text-base sm:text-lg font-bold whitespace-nowrap flex-shrink-0"
          style={{ color: scoreStyle.color }}
        >
          <span dir="ltr">{averageScore} / 5</span>
        </div>
      </div>

      <div className={`text-xs sm:text-sm mb-3 sm:mb-4 space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        <p>
          {t('uniqueSimulations')}: <strong>{uniqueSimulations}</strong>
        </p>

        <p>
          {t('totalAttempts')}: <strong>{totalAttempts}</strong>
        </p>

        <p className="break-words">
          {t('latestActivity')}: <strong><span dir="ltr">{formatLatestActivity(latestActivity)}</span></strong>
        </p>
      </div>

      <Link
        to={`/progress-of-chosen-student/${id}`}
        state={{ student: studentState }}
        onClick={() => {
          console.log('🚀 Navigating to student details with state:', studentState);
        }}
        className="block text-white text-center py-2 sm:py-2.5 rounded mt-3 sm:mt-4 font-semibold text-sm sm:text-base transition-colors"
        style={{
          backgroundColor: scoreStyle.color,
        }}
      >
        {t('viewDetails')}
      </Link>
    </div>
  );
};

export default StudentCard;