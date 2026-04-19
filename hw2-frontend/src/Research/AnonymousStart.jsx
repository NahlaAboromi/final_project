import React, { useContext, useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { useAnonymousStudent as useStudent } from "../context/AnonymousStudentContext";
import SharedHeader from "../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../layout/Footer";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

const AnonymousStartContent = () => {
  const { theme } = useContext(ThemeContext);
  const UEQ_CACHE_KEY_HE = "ueq_questions_he_v1";
  const UEQ_CACHE_KEY_EN = "ueq_questions_en_v1";

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const hasHe = localStorage.getItem(UEQ_CACHE_KEY_HE);
        const hasEn = localStorage.getItem(UEQ_CACHE_KEY_EN);
        if (hasHe && hasEn) {
          console.log("UEQ-S cached in localStorage – skipping prefetch");
          return;
        }

        console.log("🔄 Prefetch UEQ-S HE+EN from server...");

        const [heRes, enRes] = await Promise.all([
          fetch("/api/questionnaires/ueq?lang=he", { signal: controller.signal }),
          fetch("/api/questionnaires/ueq?lang=en", { signal: controller.signal }),
        ]);

        if (heRes.ok) {
          const heData = await heRes.json();
          localStorage.setItem(UEQ_CACHE_KEY_HE, JSON.stringify(heData));
          console.log("✅ UEQ-S HE cached");
        } else {
          console.warn("⚠️ UEQ-S HE fetch failed:", heRes.status);
        }

        if (enRes.ok) {
          const enData = await enRes.json();
          localStorage.setItem(UEQ_CACHE_KEY_EN, JSON.stringify(enData));
          console.log("✅ UEQ-S EN cached");
        } else {
          console.warn("⚠️ UEQ-S EN fetch failed:", enRes.status);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("⚠️ UEQ-S prefetch error:", err);
        }
      }
    })();

    return () => controller.abort();
  }, []);

  const isDark = theme === "dark";
  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";
  const consentText = lang === "he"
  ? "השתתפותך מיועדת למחקר אקדמי בבראודה בנושא פיתוח מיומנויות חברתיות־רגשיות (SEL) באמצעות מערכת CASELy – דיאלוג סוקרטי מונחה בינה מלאכותית. ההשתתפות כוללת מילוי שאלונים והתנסות קצרה במערכת (כ־20–30 דקות), והשיוך לקבוצת ניסוי או ביקורת מתבצע באופן אקראי. ההשתתפות אנונימית, הנתונים נשמרים בצורה מאובטחת וישמשו למחקר בלבד. ההשתתפות היא מרצון חופשי, וניתן להפסיק בכל שלב ללא כל השלכה. בסימון התיבה והמשך, הנך מאשר/ת כי קראת והסכמת להשתתף במחקר."
  : "Participation is part of an academic study conducted at Braude College, examining the development of Social-Emotional Learning (SEL) skills using CASELy – an AI-guided Socratic dialogue system. Participation includes completing questionnaires and a short system interaction (approximately 20–30 minutes), with random assignment to an experimental or control group. Participation is anonymous, and all data will be securely stored and used for research purposes only. Participation is voluntary, and you may withdraw at any time without any consequences. By checking the box and proceeding, you confirm that you have read and agree to participate in this study.";

const consentLabel = lang === "he"
  ? "קראתי ואני מסכים/ה להשתתף במחקר"
  : "I have read and agree to participate in the study";

const consentErrorMsg = lang === "he"
  ? "יש לאשר את ההסכמה להשתתפות במחקר לפני ההמשך"
  : "You must confirm your consent before continuing";
  const { t } = useI18n("anonymousStart");
  const navigate = useNavigate();
  const { setStudent, startSessionTimer, loadQuestionnaire } = useStudent();
const [isTestUser, setIsTestUser] = useState(false);
  const [form, setForm] = useState({
    email: "",
    gender: "",
    ageRange: "",
    fieldOfStudy: "",
    customFieldOfStudy: "",
    semester: "",
  });

  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const refs = {
    fieldOfStudy: useRef(null),
    customFieldOfStudy: useRef(null),
    semester: useRef(null),
    gender: useRef(null),
    ageRange: useRef(null),
    email: useRef(null),
  };

const SEMESTER_VALUES = lang === "he"
  ? [
      "סמסטר ראשון",
      "סמסטר שני",
      "סמסטר שלישי",
      "סמסטר רביעי",
      "סמסטר חמישי",
      "סמסטר שישי",
      "סמסטר שביעי",
      "סמסטר שמיני או יותר",
    ]
  : [
      "1st Semester",
      "2nd Semester",
      "3rd Semester",
      "4th Semester",
      "5th Semester",
      "6th Semester",
      "7th Semester",
      "8th Semester or higher",
    ];

  const friendlyMissingMessage = useMemo(() => t("missing"), [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setOkMsg("");
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      if (name === "fieldOfStudy" && value !== "other") delete copy.customFieldOfStudy;
      return copy;
    });
  };

  const validate = () => {
    const errs = {};

    const email = (form.email || "").trim().toLowerCase();
    if (!email) errs.email = t("v_email");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("v_emailFormat");

    const finalField =
      form.fieldOfStudy === "other"
        ? (form.customFieldOfStudy || "").trim()
        : form.fieldOfStudy;

    if (!form.fieldOfStudy) errs.fieldOfStudy = t("v_field");
    if (form.fieldOfStudy === "other" && !finalField) errs.customFieldOfStudy = t("v_fieldOther");
    if (!form.semester) errs.semester = t("v_semester");
    if (!form.gender) errs.gender = t("v_gender");
    if (!form.ageRange) errs.ageRange = t("v_age");

    return { errs, finalField };
  };

  const focusFirstError = (errs) => {
    const order = ["email", "fieldOfStudy", "customFieldOfStudy", "semester", "gender", "ageRange"];
    const first = order.find((f) => errs[f]);
    if (first && refs[first]?.current) {
      refs[first].current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => refs[first].current?.focus?.(), 250);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  setOkMsg("");

  const { errs, finalField } = validate();
  if (Object.keys(errs).length > 0) {
    setFieldErrors(errs);
    focusFirstError(errs);
    setIsLoading(false);
    return;
  }

  if (!consent) {
    setError(consentErrorMsg);
    setIsLoading(false);
    return;
  }

  try {
    const authRes = await fetch("/api/anonymous/auth/anonymous", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
body: JSON.stringify({
  isTestUser
})    });
    if (!authRes.ok) throw new Error(t("err_auth"));
    const { user } = await authRes.json();
    const serverAnonId = user?.anonId;
    if (!serverAnonId) throw new Error(t("err_noAnon"));

    const payload = {
      anonId: serverAnonId,
      isTestUser,
      email: (form.email || "").trim().toLowerCase(),
      gender: form.gender,
      ageRange: form.ageRange,
      fieldOfStudy: finalField,
      semester: String(form.semester || "").trim(),
    };

    const demoRes = await fetch("/api/anonymous/demographics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!demoRes.ok) throw new Error(t("err_demo"));
    await demoRes.json();

    setStudent({
      anonId: serverAnonId,
      demographics: payload,
      assessmentStatus: "not-started",
      uiLang: lang,
    });
    startSessionTimer();

    await loadQuestionnaire({ lang });

    const asgRes = await fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId: serverAnonId }),
    });
    if (!asgRes.ok) throw new Error(t("err_assign"));
    const assignment = await asgRes.json();

    setStudent((s) => ({ ...s, assignment }));

    navigate("/assignment", { state: { assignment } });
  } catch (err) {
    console.error("❌ Anonymous start error:", err);
    setError(err.message || t("err_generic"));
  } finally {
    setIsLoading(false);
  }
};

  const baseFieldClass =
    "mt-1 block w-full rounded-md border p-2 md:p-3 text-sm md:text-base bg-white dark:bg-gray-700 dark:text-white transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorBorder = "border-red-500";
  const normalBorder = "border-gray-300 dark:border-gray-600";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      style={{ fontFamily: lang === "he" ? "Heebo, Rubik, Arial, sans-serif" : "inherit" }}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      <div className="px-2 md:px-4 py-1 md:py-2">
        <SharedHeader />
      </div>

      <main className="flex-1 w-full px-2 md:px-4 py-1 md:py-3 overflow-auto">
        <div className={`${isDark ? "bg-slate-700" : "bg-slate-200"} p-2 md:p-4 rounded max-w-4xl mx-auto`}>
          <div className="mb-2 md:mb-3 text-center">
            <h1
              className={`text-xl md:text-3xl font-extrabold bg-gradient-to-r ${
                isDark ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent mb-0.5 md:mb-1`}
            >
              {t("brandTitle")}
            </h1>
            <p
              className={`text-xs md:text-base ${
                isDark ? "text-gray-300" : "text-slate-600"
              } flex items-center justify-center gap-1 md:gap-2`}
            >
              <span className="text-sm md:text-base">💡</span>
              <span>{t("brandSubtitle")}</span>
              <span className="text-sm md:text-base">🎓</span>
            </p>
          </div>

          <div className={`rounded-lg shadow-md p-3 md:p-5 ${isDark ? "bg-slate-600" : "bg-white"}`}>
            <div className="mb-2 md:mb-3 text-center">
              <div className="text-2xl md:text-3xl mb-1">🤖💡</div>
              <h2 className={`text-lg md:text-xl font-bold ${isDark ? "text-white" : "text-slate-800"} mb-0.5 md:mb-1`}>
                {t("welcomeTitle")}
              </h2>
              <p className={`text-xs md:text-sm ${isDark ? "text-gray-300" : "text-slate-600"} leading-tight`}>
                {t("welcomeDesc")}
                <br />
                <span className="text-xs italic opacity-80 flex items-center justify-center gap-1 mt-0.5">
                  <span>🔒</span>
                  <span>{t("welcomeNote")}</span>
                </span>
              </p>
            </div>

            {error && <Alert type="error" message={error} />}
            {okMsg && <Alert type="success" message={okMsg} />}
            {Object.keys(fieldErrors).length > 0 && (
              <Alert
                type="warning"
                message={fieldErrors.email ? t("invalidEmailTop") : t("missing")}
              />
            )}

            <form className="mt-2 md:mt-3" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
                    <span>✉️</span> <span>{t("emailLabel")}</span> <span className="text-red-500">*</span>
                  </label>

                  <input
                    ref={refs.email}
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    value={form.email}
                    onChange={handleChange}
                    className={`${baseFieldClass} ${fieldErrors.email ? errorBorder : normalBorder}`}
                  />

                  <p className={`mt-1 text-[11px] md:text-xs ${isDark ? "text-gray-300" : "text-slate-500"}`}>
                    {t("emailNote")}
                  </p>

                  {fieldErrors.email && (
                    <p className="mt-1 text-[11px] md:text-xs text-red-500 font-medium">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="fieldOfStudy" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
                    <span>📚</span> <span>{t("fieldOfStudy")}</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={refs.fieldOfStudy}
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    value={form.fieldOfStudy}
                    onChange={handleChange}
                    className={`${baseFieldClass} ${
                      fieldErrors.fieldOfStudy ? errorBorder : normalBorder
                    }`}
                  >
<option value="" disabled>
  {t("selectField")}
</option>
<option value={lang === "he" ? "הנדסת תוכנה" : "Software Engineering"}>{t("fs_SW")}</option>
<option value={lang === "he" ? "מדעי המחשב" : "Computer Science"}>{t("fs_CS")}</option>
<option value={lang === "he" ? "מערכות מידע" : "Information Systems"}>{t("fs_IS")}</option>
<option value={lang === "he" ? "פסיכולוגיה" : "Psychology"}>{t("fs_PSY")}</option>
<option value={lang === "he" ? "חינוך" : "Education"}>{t("fs_EDU")}</option>
<option value={lang === "he" ? "מנהל עסקים" : "Business Management"}>{t("fs_BIZ")}</option>
<option value={lang === "he" ? "הנדסת תעשייה" : "Industrial Engineering"}>{t("fs_IE")}</option>
<option value={lang === "he" ? "ביולוגיה" : "Biology"}>{t("fs_BIO")}</option>
<option value={lang === "he" ? "סיעוד" : "Nursing"}>{t("fs_NUR")}</option>
<option value={lang === "he" ? "משפטים" : "Law"}>{t("fs_LAW")}</option>
<option value="other">{t("fs_OTHER")}</option>
                  </select>
                  {form.fieldOfStudy === "other" && (
                    <input
                      ref={refs.customFieldOfStudy}
                      type="text"
                      name="customFieldOfStudy"
                      placeholder={t("otherFieldPh")}
                      value={form.customFieldOfStudy}
                      onChange={handleChange}
                      className={`${baseFieldClass} mt-2 ${
                        fieldErrors.customFieldOfStudy ? errorBorder : normalBorder
                      }`}
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="semester" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
                    <span>📅</span> <span>{t("currentSemester")}</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={refs.semester}
                    id="semester"
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className={`${baseFieldClass} ${
                      fieldErrors.semester ? errorBorder : normalBorder
                    }`}
                  >
                    <option value="" disabled>
                      {t("selectSemester")}
                    </option>
{SEMESTER_VALUES.map((value, i) => (
  <option key={value} value={value}>
    {t(`s_${i + 1}`)}
  </option>
))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ageRange" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
                    <span>😊</span> <span>{t("ageRange")}</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={refs.ageRange}
                    id="ageRange"
                    name="ageRange"
                    value={form.ageRange}
                    onChange={handleChange}
                    className={`${baseFieldClass} ${
                      fieldErrors.ageRange ? errorBorder : normalBorder
                    }`}
                  >
                    <option value="" disabled>
                      {t("selectAgeRange")}
                    </option>
                    <option value="18-22">{t("ar_18_22")}</option>
                    <option value="23-26">{t("ar_23_26")}</option>
                    <option value="27-30">{t("ar_27_30")}</option>
                    <option value="31-35">{t("ar_31_35")}</option>
                    <option value="36+">{t("ar_36p")}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <span className="block text-xs md:text-sm font-semibold mb-2 flex gap-1 items-center">
                    <span>{t("gender")}</span> <span className="text-red-500">*</span>
                  </span>
                  <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
<label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
  <input
    type="radio"
    name="gender"
    value={lang === "he" ? "זכר" : "male"}
    checked={form.gender === (lang === "he" ? "זכר" : "male")}
    onChange={handleChange}
    className="w-4 h-4"
  />
  <span>{t("male")}</span>
</label>
<label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
  <input
    type="radio"
    name="gender"
    value={lang === "he" ? "נקבה" : "female"}
    checked={form.gender === (lang === "he" ? "נקבה" : "female")}
    onChange={handleChange}
    className="w-4 h-4"
  />
  <span>{t("female")}</span>
</label>
<label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
  <input
    type="radio"
    name="gender"
    value={lang === "he" ? "אחר" : "other"}
    checked={form.gender === (lang === "he" ? "אחר" : "other")}
    onChange={handleChange}
    className="w-4 h-4"
  />
  <span>{t("other")}</span>
</label>
                  </div>
                </div>
              </div>

              <div
                className={`mt-3 md:mt-4 p-2 md:p-3 rounded-lg ${
                  isDark ? "bg-slate-800/50" : "bg-blue-50"
                } border ${isDark ? "border-slate-600" : "border-blue-200"}`}
              >
<p className="text-xs md:text-sm opacity-90 leading-relaxed">
  {consentText}
</p>

                <label className="mt-3 flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setError("");
                    }}
                    className="mt-0.5 w-4 h-4"
                  />
                  <span className="text-xs md:text-sm font-medium">
{consentLabel}                  </span>
                </label>
              </div>

              <div className="mt-3 md:mt-4">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  variant="primary"
                >
                  <span className="flex items-center justify-center gap-2 text-base md:text-lg">
                    <span>🚀</span> <span>{t("startCTA")}</span>
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <div className="px-2 md:px-4 py-1 md:py-2">
<footer className="relative p-4 text-center bg-slate-300 dark:bg-slate-700 rounded">  
  {/* 👇 checkbox TEST */}
<div className="absolute bottom-2 right-2">
  <input
    type="checkbox"
    checked={isTestUser}
    onChange={(e) => setIsTestUser(e.target.checked)}
    className="w-3 h-3 opacity-40 hover:opacity-100 cursor-pointer"
  />
</div>

  &copy; {new Date().getFullYear()} Modular Skills Assessment Tool
</footer>      </div>
    </div>
  );
};

const AnonymousStart = () => (
    <AnonymousStartContent />
);

export default AnonymousStart;
