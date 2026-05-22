import React, { useContext, useEffect, useMemo, useState } from 'react';
import StudentHeader from "./StudentHeader";
import Footer from "../layout/Footer";
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import StudentAIChat from '../AI/StudentAIChat';
import { useI18n } from '../utils/i18n';
import { useNavigate } from 'react-router-dom';

const SkillSuggestionsContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
  const { dir, lang } = useI18n('studentHome');
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameSearch, setNameSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/classes/student-skill-suggestions/${user.id}`);
        const data = await res.json();

        if (res.ok) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching skill suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSuggestions();
    }
  }, [user?.id]);

  const filteredSuggestions = useMemo(() => {
    const nameQ = nameSearch.trim().toLowerCase();
    const codeQ = codeSearch.trim().toLowerCase();

    return suggestions.filter(item => {
      const clusterName = String(item.clusterName || '').toLowerCase();
      const clusterCode = String(item.clusterCode || '').toLowerCase();
      const classCode = String(item.classCode || '').toLowerCase();

      const matchName = !nameQ || clusterName.includes(nameQ);
      const matchCode = !codeQ || clusterCode.includes(codeQ) || classCode.includes(codeQ);

      return matchName && matchCode;
    });
  }, [suggestions, nameSearch, codeSearch]);

  const visibleSuggestions = showAll
    ? filteredSuggestions
    : filteredSuggestions.slice(0, 6);

  const openSuggestion = (item) => {
    if (item.alreadySolved) {
      navigate('/skill-suggestion-result', {
        state: {
          answer: {
            ...item.answer,
            situation: item.suggestedScenario,
            question: item.scenarioQuestion
          }
        }
      });
    } else {
      navigate('/skill-suggestion-simulation', {
        state: {
          studentId: user.id,
          classCode: item.classCode,
          clusterCode: item.clusterCode,
          clusterName: item.clusterName,
          situation: item.suggestedScenario,
          question: item.scenarioQuestion
        }
      });
    }
  };

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
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8">
            {lang === 'he' ? 'הצעות לחיזוק מיומנויות' : 'Skill Improvement Suggestions'}
          </h1>

          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded shadow p-5 mb-8`}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_290px] gap-4">
              <div className="relative">
                <span className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 text-2xl`}>
                  🔍
                </span>

                <input
                  type="text"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  placeholder={lang === 'he' ? 'חיפוש לפי שם תת־קבוצה...' : 'Search by subgroup name...'}
                  className={`w-full h-14 rounded border outline-none text-lg ${
                    dir === 'rtl' ? 'pr-14 pl-4 text-right' : 'pl-14 pr-4 text-left'
                  } ${
                    isDark
                      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <input
                type="text"
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value)}
                placeholder={lang === 'he' ? 'קוד תת־קבוצה...' : 'Subgroup code...'}
                className={`h-14 rounded border outline-none px-4 text-lg ${
                  dir === 'rtl' ? 'text-right' : 'text-left'
                } ${
                  isDark
                    ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {loading ? (
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded shadow p-6 text-center`}>
              {lang === 'he' ? 'טוען הצעות...' : 'Loading suggestions...'}
            </div>
          ) : suggestions.length === 0 ? (
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded shadow p-6 text-center`}>
              {lang === 'he' ? 'אין עדיין הצעות לחיזוק מיומנויות.' : 'No skill improvement suggestions yet.'}
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded shadow p-6 text-center`}>
              {lang === 'he' ? 'לא נמצאו הצעות מתאימות לחיפוש.' : 'No suggestions match your search.'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleSuggestions.map((item, index) => (
  <div
  key={`${item.classCode}-${item.clusterCode}-${index}`}
  className={`${
    item.alreadySolved
      ? isDark
        ? 'bg-emerald-900/20 border border-emerald-700 text-white'
        : 'bg-emerald-50 border border-emerald-300 text-slate-900'
      : isDark
        ? 'bg-slate-800 text-white'
        : 'bg-white text-slate-900'
  } rounded-lg shadow p-6 w-full min-h-[150px] flex ${
    dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'
  } items-center justify-between gap-4`}
>
                    <button
                      onClick={() => openSuggestion(item)}
                      className={`${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} px-5 py-4 rounded-lg font-bold text-slate-900 dark:text-white transition`}
                    >
                      {item.alreadySolved
                        ? lang === 'he' ? 'צפייה בפתרון' : 'View Answer'
                        : lang === 'he' ? 'התחלת סימולציה' : 'Start Simulation'}
                    </button>

                    <div className={`${dir === 'rtl' ? 'text-right' : 'text-left'} flex-1`}>
                    {item.alreadySolved && (
  <div
    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
      isDark
        ? 'bg-emerald-800 text-emerald-100'
        : 'bg-emerald-100 text-emerald-700'
    }`}
  >
    {lang === 'he' ? '✓ הושלם' : '✓ Completed'}
  </div>
)}
                      <h2 className="text-2xl font-extrabold mb-3">
                        {item.clusterName}
                      </h2>

                      <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-base mb-1`}>
                        <strong>{lang === 'he' ? 'קוד:' : 'Code:'}</strong> {item.clusterCode}
                      </p>

                      <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-base mb-1`}>
                        <strong>{lang === 'he' ? 'קוד כיתה:' : 'Class Code:'}</strong> {item.classCode}
                      </p>

                      <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-base`}>
                        <strong>{lang === 'he' ? 'נושא:' : 'Subject:'}</strong> {item.caselDomain}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredSuggestions.length > 6 && (
                <div className="flex justify-center mt-8">
<button
  onClick={() => setShowAll(prev => !prev)}
  className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} px-8 py-3 rounded-lg font-bold shadow flex items-center gap-2 transition`}
>
  <span>
    {showAll
      ? lang === 'he' ? 'הצג פחות' : 'Show Less'
      : lang === 'he' ? 'הצג עוד' : 'Show More'}
  </span>

  <span style={{ fontSize: '18px' }}>
    {showAll ? '▲' : '▼'}
  </span>
</button>
                </div>
              )}
            </>
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

const SkillSuggestions = () => <SkillSuggestionsContent />;

export default SkillSuggestions;