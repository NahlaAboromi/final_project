import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { createRoot } from 'react-dom/client';
import FeedbackPDFContent from '../FeedbackPDFContent';

export default function EmailFeedbackCard({ anonId, lang = 'he', hasSocratic = true }) {
    const [includeChat, setIncludeChat] = useState(false);
  const [loading, setLoading] = useState(false);

  const isHeb = lang === 'he';

  const TEXT = {
    title: isHeb ? 'הורדת משוב אישי' : 'Download Personal Feedback',
description: isHeb
  ? hasSocratic
    ? 'ניתן להוריד דוח אישי הכולל את תוצאות ההתנסות שלכם במערכת.'
    : 'ניתן להוריד דוח אישי הכולל את תוצאות השאלונים והמשוב הקיים עבורכם במערכת.'
  : hasSocratic
    ? 'You can download a personal report including your results from the system.'
    : 'You can download a personal report including your questionnaire results and available feedback from the system.',
    includes: isHeb ? 'הדוח כולל:' : 'The report includes:',

    casel: isHeb
      ? 'תוצאות שאלוני CASEL (לפני ואחרי)'
      : 'CASEL questionnaire results (Pre & Post)',

    analysis: isHeb
      ? 'ניתוח AI על הסימולציה'
      : 'AI analysis of the simulation',

    summary: isHeb
      ? 'סיכום AI'
      : 'AI summary',

    chatOption: isHeb
      ? 'צרפו גם את תיעוד השיחה המלאה'
      : 'Include full conversation transcript',

    button: isHeb ? 'הורידו את המשוב' : 'Download Feedback',

    loading: isHeb ? 'מכין PDF...' : 'Generating PDF...',

    error: isHeb ? 'שגיאה ביצירת הקובץ' : 'Error generating file',
  };

  const handleDownload = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/trial/email-feedback-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
  anonId,
  includeChat: hasSocratic ? includeChat : false,
}),      });

      const data = await res.json();

      if (!data?.ok) {
        throw new Error('Failed to fetch data');
      }

      const element = document.createElement('div');
      element.style.background = '#ffffff';
      element.style.padding = '20px';
      document.body.appendChild(element);

      const root = createRoot(element);
      root.render(
        <div dir={lang === 'he' ? 'rtl' : 'ltr'}>
<FeedbackPDFContent
  data={data.feedback}
  lang={lang}
  hasSocratic={hasSocratic}
/>        </div>
      );

      await new Promise((resolve) => setTimeout(resolve, 700));

      await html2pdf()
        .set({
          margin: 10,
          filename: `feedback-${anonId}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(element)
        .save();

      root.unmount();
      document.body.removeChild(element);

    } catch (err) {
      console.error(err);
      alert(TEXT.error);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="mt-6 rounded-3xl shadow-xl p-6 border border-slate-200 bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:border-slate-700 dark:text-white">      <h3 className="text-lg font-semibold mb-3">
        {TEXT.title}
      </h3>

<p className="text-sm mb-4 text-gray-600 dark:text-slate-300">        {TEXT.description}
      </p>

      <p className="text-sm font-medium mb-2">{TEXT.includes}</p>

<ul className="text-sm mb-4 space-y-1 text-slate-800 dark:text-slate-200">  <li>✔️ {TEXT.casel}</li>
  <li>✔️ {TEXT.analysis}</li>
  {hasSocratic && <li>✔️ {TEXT.summary}</li>}
</ul>

{hasSocratic && (
<label className="flex items-center gap-2 mb-4 cursor-pointer text-slate-800 dark:text-slate-200">    <input
      type="checkbox"
      checked={includeChat}
      onChange={() => setIncludeChat(!includeChat)}
    />
    <span>{TEXT.chatOption}</span>
  </label>
)}

      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:scale-105 transition disabled:opacity-70"
      >
        {loading ? TEXT.loading : TEXT.button}
      </button>
    </div>
  );
}