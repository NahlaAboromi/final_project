import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentHeader from "./StudentHeader";
import Footer from "../layout/Footer";
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import StudentAIChat from '../AI/StudentAIChat';
import { useI18n } from '../utils/i18n';

const SkillSuggestionSimulationContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    studentId,
    classCode,
    clusterCode,
    clusterName,
    situation,
    question
  } = location.state || {};

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
  const { dir, lang } = useI18n('studentHome');

  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!answer.trim()) {
      setErrorMsg(lang === 'he' ? 'נא להזין תשובה לפני השליחה' : 'Please write an answer before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/classes/submit-skill-suggestion-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId || user?.id,
          classCode,
          clusterCode,
          clusterName,
          answerText: answer
        })
      });

      const data = await res.json();

if (res.ok) {
  navigate('/skill-suggestion-result', {
state: {
  answer: {
    ...data.answer,
    situation,
    question
  }
}
  });
}
      else {
        console.error(data);
        alert(lang === 'he' ? 'אירעה שגיאה בשליחה' : 'Submit failed');
      }
    } catch (err) {
      console.error('Submit skill suggestion error:', err);
      alert(lang === 'he' ? 'שגיאת שרת' : 'Server error');
    } finally {
      setIsSubmitting(false);
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

      <main className="flex-grow flex items-center justify-center py-12 px-4 w-full">
        <div className={`w-full max-w-2xl ${
          isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
        } p-8 rounded-xl shadow-lg`}>

          <h2 className="text-3xl font-extrabold mb-4 text-center text-blue-500">
            {lang === 'he' ? 'סימולציה לחיזוק מיומנות' : 'Skill Improvement Simulation'}
          </h2>

          <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-center mb-6`}>
            {lang === 'he' ? 'ענה/י על הסימולציה לפי ההצעה שנבחרה עבורך.' : 'Answer the simulation based on the selected suggestion.'}
          </p>

          <div className="mb-5 text-sm">
            <p><strong>{lang === 'he' ? 'קוד כיתה:' : 'Class Code:'}</strong> {classCode}</p>
            <p><strong>{lang === 'he' ? 'קוד תת־קבוצה:' : 'Subgroup Code:'}</strong> {clusterCode}</p>
            <p><strong>{lang === 'he' ? 'שם תת־קבוצה:' : 'Subgroup Name:'}</strong> {clusterName}</p>
          </div>

          <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-5`}>
            <h3 className="text-xl font-semibold mb-3 text-blue-500">
              {lang === 'he' ? 'הסיטואציה' : 'Situation'}
            </h3>

            <p className="mb-6">
              {situation || (lang === 'he' ? 'לא נמצאה סיטואציה.' : 'No situation found.')}
            </p>

            <h4 className="text-lg font-semibold mb-2 text-blue-500">
              {lang === 'he' ? 'השאלה' : 'Question'}
            </h4>

            <p className="mb-4">
              {question || (lang === 'he' ? 'לא נמצאה שאלה.' : 'No question found.')}
            </p>

            <form onSubmit={handleSubmit}>
              <textarea
                className={`w-full p-3 rounded mb-3 resize-none ${
                  isDark
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'bg-white text-black border border-slate-300'
                }`}
                rows="5"
                placeholder={lang === 'he' ? 'כתוב/י כאן את התשובה שלך...' : 'Write your answer here...'}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (e.target.value.trim()) setErrorMsg('');
                }}
              />

              {errorMsg && (
                <p className="text-sm mb-2 text-red-500">
                  {errorMsg}
                </p>
              )}
<button
  type="submit"
  disabled={isSubmitting}
  className={`mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full flex items-center justify-center gap-2 ${
    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
  }`}
>
  {isSubmitting ? (
    <>
      <div
        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
      />
      <span>
        {lang === 'he' ? 'שולח...' : 'Submitting...'}
      </span>
    </>
  ) : (
    lang === 'he' ? 'שליחת תשובה' : 'Submit Answer'
  )}
</button>
            </form>
          </div>
        </div>
      </main>

      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username} />}

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const SkillSuggestionSimulation = () => <SkillSuggestionSimulationContent />;

export default SkillSuggestionSimulation;