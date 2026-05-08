import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "../../DarkLightMood/ThemeContext";
import { UserContext } from "../../context/UserContext";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../../layout/Footer";
import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";

import { useI18n } from "../../utils/i18n";
import { LanguageContext } from "../../context/LanguageContext";
import {
  Brain,
  Target,
  Users,
  MessageCircle,
  CheckCircle,
  GraduationCap,
  Puzzle,
  Zap,
  Sprout,
  UserRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const LoginContent = () => {
  const { login } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext) || { lang: "he" };

  const { t, dir, lang: langAttr, ready } = useI18n("teacherLogin");
  const isDark = theme === "dark";
  const isHebrew = lang === "he";

  // State for mobile accordion sections
  const [showCasel, setShowCasel] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);

  const pageText = {
    eduMapDescription: isHebrew
      ? "פלטפורמה חכמה לפיתוח מיומנויות SEL בעזרת AI, מבוססת מסגרת CASEL."
      : "A smart platform for developing SEL skills with AI, based on the CASEL framework.",

    greenQuote: isHebrew
      ? "כל סימולציה היא הזדמנות לסטודנט לצמוח."
      : "Every simulation is an opportunity for the student to grow.",

    benefitsTitle: isHebrew ? "יתרונות המערכת למרצה" : "System Benefits for Teachers",
    stepsTitle: isHebrew ? "איך זה עובד?" : "How It Works",

    caselItems: isHebrew
      ? [
          { Icon: Brain, title: "מודעות עצמית", desc: "זיהוי רגשות וחוזקות אישיות" },
          { Icon: Target, title: "ניהול עצמי", desc: "הצבת מטרות וניהול לחץ" },
          { Icon: Users, title: "מודעות חברתית", desc: "הבנת אחרים ורגישות חברתית" },
          { Icon: MessageCircle, title: "מיומנויות בינאישיות", desc: "תקשורת ושיתוף פעולה" },
          { Icon: CheckCircle, title: "קבלת החלטות אחראית", desc: "קבלת החלטות אתיות וחיוביות" },
        ]
      : [
          { Icon: Brain, title: "Self Awareness", desc: "Identifying emotions and strengths" },
          { Icon: Target, title: "Self Management", desc: "Setting goals and managing stress" },
          { Icon: Users, title: "Social Awareness", desc: "Understanding others and empathy" },
          { Icon: MessageCircle, title: "Relationship Skills", desc: "Communication and cooperation" },
          { Icon: CheckCircle, title: "Responsible Decisions", desc: "Making ethical and positive decisions" },
        ],

    benefitsItems: isHebrew
      ? [
          { Icon: GraduationCap, title: "למידה מותאמת אישית", desc: "התאמת תרחישים לפי רמת הסטודנט ומאפייניו" },
          { Icon: Puzzle, title: "פיתוח מיומנויות SEL", desc: "חיזוק מודעות עצמית וקבלת החלטות" },
          { Icon: Zap, title: "למידה אינטראקטיבית", desc: "למידה דרך סימולציות ולא רק תיאוריה" },
          { Icon: Sprout, title: "צמיחה מתמשכת", desc: "מעקב אחרי התקדמות הסטודנט לאורך זמן" },
        ]
      : [
          { Icon: GraduationCap, title: "Personalized Learning", desc: "Scenarios adapted to each student's level" },
          { Icon: Puzzle, title: "SEL Skill Development", desc: "Strengthening self-awareness and decision making" },
          { Icon: Zap, title: "Interactive Learning", desc: "Learning through simulations, not just theory" },
          { Icon: Sprout, title: "Continuous Growth", desc: "Tracking student progress over time" },
        ],

    stepsItems: isHebrew
      ? [
          { num: 1, text: "התחבר לחשבון המרצה שלך" },
          { num: 2, text: "צור כיתה או תרחיש AI" },
          { num: 3, text: "עקוב אחרי התקדמות הסטודנטים" },
          { num: 4, text: "ייצא דוחות PDF מפורטים" },
        ]
      : [
          { num: 1, text: "Log in to your teacher account" },
          { num: 2, text: "Create a class or AI scenario" },
          { num: 3, text: "Track student progress in real time" },
          { num: 4, text: "Export detailed PDF reports" },
        ],
  };

  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!form.id || !form.password) {
      setError(t("errFillBoth"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/teachers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.teacher);
        navigate("/teacher/Teacher");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || t("errLoginFailed"));
      }
    } catch (e2) {
      console.error("❌ Login error:", e2);
      setError(t("errLoginGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  const card = `${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-md p-5`;
  const iconBoxBlue = `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-slate-600" : "bg-blue-50"}`;
  const iconBoxGreen = `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-slate-600" : "bg-green-50"}`;

  return (
    <div
      dir={dir}
      lang={langAttr}
      className={`min-h-screen w-screen flex flex-col font-sans ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      {/* ── Header ── */}
      <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
        <SharedHeader />
      </div>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col w-full px-3 sm:px-4 pb-4 overflow-x-hidden">
        <div
          className={`flex-1 flex flex-col rounded-2xl p-3 sm:p-4 ${
            isDark ? "bg-slate-700" : "bg-slate-100"
          }`}
        >

          {/* ═══════════════════════════════════════
              DESKTOP (lg+): 3-column grid
              MOBILE/TABLET: single column, all visible
          ═══════════════════════════════════════ */}
          <div
            className="
              flex-1 w-full max-w-[1200px] mx-auto
              grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_1fr]
              gap-4 lg:gap-5
              lg:items-stretch
            "
          >

            {/* ══ LEFT aside ══
                Desktop: sidebar column
                Mobile:  shown ABOVE the form as compact info cards
            ══ */}
            <aside className={`flex flex-col gap-3 lg:gap-4 ${dir === "rtl" ? "lg:order-3" : "lg:order-1"}`}>

              {/* Casely intro — always visible */}
              <div className={card}>
                <h3 className="text-base lg:text-lg font-bold mb-1 lg:mb-2">
  {isHebrew ? "קייסלי" : "Casely"}
</h3>
                <p className="text-sm leading-6 opacity-75">{pageText.eduMapDescription}</p>
              </div>

              {/* CASEL — accordion on mobile, always open on desktop */}
              <div className={`${card} lg:flex-1 lg:flex lg:flex-col`}>
                {/* Header — clickable on mobile only */}
                <button
                  type="button"
                  onClick={() => setShowCasel((v) => !v)}
                  className={`w-full flex items-center justify-between lg:cursor-default rounded-xl px-3 py-2 ${
  isDark ? "bg-slate-700 text-slate-100" : "bg-slate-50 text-slate-600"
}`}
                >
                  <h4 className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-slate-200" : "text-slate-500"}`}>
                    {isHebrew ? "מודל CASEL" : "CASEL Framework"}
                  </h4>
                  <span className="lg:hidden opacity-40">
                    {showCasel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {/* Items — always visible on desktop, toggled on mobile */}
                <div className={`flex flex-col gap-2 mt-3 lg:flex-1 ${showCasel ? "flex" : "hidden lg:flex"}`}>
                  {pageText.caselItems.map(({ Icon, title, desc }) => (
                    <div
                      key={title}
                      className={`flex items-start gap-3 p-2 lg:p-3 rounded-xl ${
                        isDark ? "bg-slate-700" : "bg-slate-50"
                      }`}
                    >
                      <div className={iconBoxBlue}>
                        <Icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-5">{title}</div>
                        <div className="text-xs opacity-55 leading-4 mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Green quote — always visible */}
              <div className="bg-gradient-to-l from-green-500 to-emerald-400 text-white p-4 rounded-2xl shadow-md font-semibold text-sm text-center leading-6">
                {pageText.greenQuote}
              </div>
            </aside>

            {/* ══ CENTRE: login form ══ */}
            <section className="lg:order-2 flex items-center justify-center w-full py-2 lg:py-0">
              <div
                className={`w-full max-w-sm ${
                  isDark ? "bg-slate-800" : "bg-white"
                } p-6 sm:p-8 rounded-2xl shadow-xl`}
              >
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      isDark ? "bg-slate-700" : "bg-blue-50"
                    }`}
                  >
                    <UserRound className="w-7 h-7 text-blue-500" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-center">{t("title")}</h2>
                  <p className="text-sm text-center opacity-60">{t("subtitle")}</p>
                </div>

                {error && <Alert type="error" message={error} />}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormInput
                    id="id"
                    name="id"
                    label={t("fieldIdLabel")}
                    placeholder={t("fieldIdPlaceholder")}
                    value={form.id}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                  <FormInput
                    id="password"
                    name="password"
                    type="password"
                    label={t("fieldPasswordLabel")}
                    placeholder={t("fieldPasswordPlaceholder")}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                  <div className="flex justify-start">
                    <Link
                      to="/forgot-password?role=teacher"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {t("forgot")}
                    </Link>
                  </div>

                  <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                    {t("btnSignIn")}
                  </Button>
                </form>

                <p className="mt-6 text-sm text-center opacity-60">
                  {t("noAccount")}{" "}
                  <Link
                    to="/register?role=teacher"
                    className="text-blue-500 hover:underline font-medium"
                    style={{ opacity: 1 }}
                  >
                    {t("registerNow")}
                  </Link>
                </p>
              </div>
            </section>

            {/* ══ RIGHT aside ══
                Desktop: sidebar column
                Mobile:  shown BELOW the form
            ══ */}
            <aside className={`flex flex-col gap-3 lg:gap-4 ${dir === "rtl" ? "lg:order-1" : "lg:order-3"}`}>

              {/* Benefits — accordion on mobile, always open on desktop */}
              <div className={`${card} lg:flex-1 lg:flex lg:flex-col`}>
                <button
                  type="button"
                  onClick={() => setShowBenefits((v) => !v)}
                  className={`w-full flex items-center justify-between lg:cursor-default rounded-xl px-3 py-2 ${
  isDark ? "bg-slate-700 text-slate-100" : "bg-slate-50 text-slate-600"
}`}
                >
                  <h4 className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-slate-200" : "text-slate-500"}`}>
                    {pageText.benefitsTitle}
                  </h4>
                  <span className="lg:hidden opacity-40">
                    {showBenefits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                <div className={`flex flex-col gap-3 mt-3 lg:flex-1 ${showBenefits ? "flex" : "hidden lg:flex"}`}>
                  {pageText.benefitsItems.map(({ Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className={iconBoxGreen}>
                        <Icon className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-5">{title}</div>
                        <div className="text-xs opacity-55 leading-4 mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps — always visible */}
              <div className={card}>
                <h4 className={`text-xs font-semibold mb-4 uppercase tracking-widest ${isDark ? "text-slate-200" : "text-slate-500"}`}>
                  {pageText.stepsTitle}
                </h4>
                <div className="flex flex-col gap-3">
                  {pageText.stepsItems.map(({ num, text }) => (
                    <div key={num} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {num}
                      </span>
                      <span className="text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </aside>

          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <div className="px-4 sm:px-6 pb-4 shrink-0">
        <Footer />
      </div>
    </div>
  );
};

const Login = () => <LoginContent />;
export default Login;
