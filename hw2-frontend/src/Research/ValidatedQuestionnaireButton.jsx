// src/Research/ValidatedQuestionnaireButton.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

/**
 * Button that navigates to the validated (POST) questionnaire.
 *
 * Props:
 * - anonId: string
 * - label?: string
 * - disabled?: boolean
 * - extraState?: object
 * - className?: string
 * - onClickBeforeNavigate?: fn
 */
export default function ValidatedQuestionnaireButton({
  anonId,
  label = 'Continue to Validated Questionnaire',
  disabled = false,
  extraState = {},
  className = '',
  onClickBeforeNavigate,
}) {
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const defaultLabel =
    lang === 'he'
      ? 'המשך לשאלון המתוקף'
      : 'Continue to Validated Questionnaire';

  const buttonLabel =
    label === 'Continue to Validated Questionnaire'
      ? defaultLabel
      : label;

  const handleClick = () => {
    if (typeof onClickBeforeNavigate === 'function') {
      onClickBeforeNavigate();
    }

    navigate('/validated-questionnaire', {
      state: { anonId, phase: 'post', ...extraState },
    });
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={[
        'mt-4 px-5 py-2 rounded-xl font-medium transition text-sm md:text-base',
        disabled
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow',
        lang === 'he' ? 'font-bold tracking-tight' : '',
        className,
      ].join(' ')}
      aria-disabled={disabled ? 'true' : 'false'}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      {buttonLabel}
    </button>
  );
}