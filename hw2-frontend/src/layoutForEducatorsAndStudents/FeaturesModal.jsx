import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";

const FeaturesModal = ({ label }) => {
  const [showModal, setShowModal] = useState(false);
  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";

  const TEXTS = {
    en: {
      featuresTitle: "📋 Key Features",
      f1: "Educator and student management",
      f2: "Export progress reports as PDF",
      f3: "Interactive performance charts",
      f4: "Per-class statistics and summaries",
      f5: "Dark mode support 🌙",
      close: "Close",
      link: "Features",
    },
    he: {
      featuresTitle: "📋 תכונות מרכזיות",
      f1: "ניהול מרצים וסטודנטים",
      f2: "ייצוא דוחות התקדמות כ־PDF",
      f3: "גרפי ביצועים אינטראקטיביים",
      f4: "סטטיסטיקות וסיכומים לכל כיתה",
      f5: "תמיכה במצב כהה 🌙",
      close: "סגור",
      link: "תכונות",
    },
  };

  const T = TEXTS[lang] || TEXTS.en;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} lang={lang}>
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
        className="hover:text-blue-500"
      >
        {label || T.link}
      </Link>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-11/12 max-w-md text-slate-800 dark:text-white ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">{T.featuresTitle}</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>{T.f1}</li>
              <li>{T.f2}</li>
              <li>{T.f3}</li>
              <li>{T.f4}</li>
              <li>{T.f5}</li>
            </ul>

            <div className={`mt-6 ${isRTL ? "text-left" : "text-right"}`}>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {T.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesModal;