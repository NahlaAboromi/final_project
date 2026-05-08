// src/studentPages/StudentLogin.jsx
import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import { UserContext } from "../context/UserContext";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Footer from "../layout/Footer";
import SharedHeader from "../layoutForEducatorsAndStudents/SharedHeader";
import { useI18n } from "../utils/i18n";

import {
  Brain,
  Target,
  Users,
  MessageCircle,
  CheckCircle,
  BookOpen,
  BarChart3,
  TrendingUp,
  Bot,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const LoginPage = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { t, dir, lang, ready } = useI18n("studentLogin");
  const isHebrew = lang === "he";

  // Mobile accordion toggles
  const [showCasel, setShowCasel] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  const pageText = {
    systemDescription: isHebrew
      ? "מערכת חכמה ללמידה דרך סימולציות, משוב אישי, ניתוח CASEL וצ'אט AI תומך."
      : "A smart learning platform with simulations, personal feedback, CASEL analysis, and AI chat support.",

    greenQuote: isHebrew
      ? "כל סימולציה עוזרת לך להבין את עצמך טוב יותר."
      : "Every simulation helps you understand yourself better.",

    caselTitle: isHebrew ? "מודל CASEL" : "CASEL Framework",
    caselItems: isHebrew
      ? [
          { Icon: Brain, title: "מודעות עצמית", desc: "זיהוי רגשות וחוזקות" },
          { Icon: Target, title: "ניהול עצמי", desc: "ניהול לחץ והצבת מטרות" },
          { Icon: Users, title: "מודעות חברתית", desc: "הבנת אחרים ורגישות חברתית" },
          { Icon: MessageCircle, title: "מיומנויות יחסים", desc: "תקשורת ושיתוף פעולה" },
          { Icon: CheckCircle, title: "קבלת החלטות", desc: "בחירות אחראיות וחיוביות" },
        ]
      : [
          { Icon: Brain, title: "Self Awareness", desc: "Recognizing emotions and strengths" },
          { Icon: Target, title: "Self Management", desc: "Managing stress and goals" },
          { Icon: Users, title: "Social Awareness", desc: "Understanding others" },
          { Icon: MessageCircle, title: "Relationship Skills", desc: "Communication and cooperation" },
          { Icon: CheckCircle, title: "Responsible Decisions", desc: "Positive and ethical choices" },
        ],

    featuresTitle: isHebrew ? "מה יש באזור הסטודנט?" : "What Can Students Do?",
    featuresItems: isHebrew
      ? [
          { Icon: BookOpen, title: "סימולציות", desc: "חיפוש וביצוע סימולציות לפי כיתה" },
          { Icon: BarChart3, title: "דוחות ותוצאות", desc: "צפייה בציונים ובניתוח אישי" },
          { Icon: TrendingUp, title: "התקדמות", desc: "גרפים ומעקב לאורך זמן" },
          { Icon: Bot, title: "צ'אט AI", desc: "עוזר חכם לשאלות ומשוב" },
        ]
      : [
          { Icon: BookOpen, title: "Simulations", desc: "Find and complete class simulations" },
          { Icon: BarChart3, title: "Reports", desc: "View scores and personal analysis" },
          { Icon: TrendingUp, title: "Progress", desc: "Charts and progress tracking" },
          { Icon: Bot, title: "AI Chat", desc: "Smart help for questions and feedback" },
        ],

    stepsTitle: isHebrew ? "איך זה עובד?" : "How It Works",
    stepsItems: isHebrew
      ? [
          { num: 1, text: "התחבר לחשבון הסטודנט" },
          { num: 2, text: "בחר כיתה מהרשימה" },
          { num: 3, text: "בצע סימולציה" },
          { num: 4, text: "צפה בדוח ובמשוב" },
        ]
      : [
          { num: 1, text: "Log in to your student account" },
          { num: 2, text: "Choose a class from the list" },
          { num: 3, text: "Complete a simulation" },
          { num: 4, text: "View your report and feedback" },
        ],
  };

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

    try {
      const response = await fetch("/api/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.student);
        navigate("/StudentHome");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || t("errors.loginFailed"));
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(t("errors.loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  const card = `${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-md p-5`;
  const iconBoxBlue = `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-slate-600" : "bg-blue-50"}`;
  const iconBoxPurple = `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-slate-600" : "bg-purple-50"}`;

  return (
    <div
      dir={dir}
      lang={lang}
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
          <div
            className="
              flex-1 w-full max-w-[1200px] mx-auto
              grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_1fr]
              gap-4 lg:gap-5
              lg:items-stretch
            "
          >

            {/* ══ LEFT aside ══ */}
            <aside className={`flex flex-col gap-3 lg:gap-4 ${dir === "rtl" ? "lg:order-3" : "lg:order-1"}`}>

              {/* Casely intro — always visible */}
              <div className={card}>
                <h3 className="text-base lg:text-lg font-bold mb-1 lg:mb-2">
  {isHebrew ? "קייסלי" : "Casely"}
</h3>
                <p className="text-sm leading-6 opacity-75">{pageText.systemDescription}</p>
              </div>

              {/* CASEL — accordion on mobile, always open on desktop */}
              <div className={`${card} lg:flex-1 lg:flex lg:flex-col`}>
                <button
                  type="button"
                  onClick={() => setShowCasel((v) => !v)}
                  className={`w-full flex items-center justify-between lg:cursor-default rounded-xl px-3 py-2 ${
  isDark ? "bg-slate-700 text-slate-100" : "bg-slate-50 text-slate-600"
}`}
                >
                  <h4 className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-slate-200" : "text-slate-500"}`}>
                    {pageText.caselTitle}
                  </h4>
                  <span className="lg:hidden opacity-40">
                    {showCasel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

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
                      isDark ? "bg-slate-700" : "bg-purple-50"
                    }`}
                    aria-label={t("studentAlt")}
                  >
                    <Users className="w-7 h-7 text-purple-500" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-center">{t("title")}</h2>
                  <p className="text-sm text-center opacity-60">
                    {t("noAccount")}{" "}
                    <Link
                      to="/register?role=student"
                      className="font-medium text-purple-500 hover:text-purple-600"
                      style={{ opacity: 1 }}
                    >
                      {t("registerNow")}
                    </Link>
                  </p>
                </div>

                {error && <Alert type="error" message={error} />}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <FormInput
                    id="id"
                    name="id"
                    label={t("fields.id.label")}
                    placeholder={t("fields.id.placeholder")}
                    value={form.id}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    id="password"
                    name="password"
                    type="password"
                    label={t("fields.password.label")}
                    placeholder={t("fields.password.placeholder")}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />

                  <div className="flex justify-start">
                    <Link
                      to="/forgot-password?role=student"
                      className="text-xs text-purple-500 hover:underline font-medium"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>

                  <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                    {t("signIn")}
                  </Button>
                </form>
              </div>
            </section>

            {/* ══ RIGHT aside ══ */}
            <aside className={`flex flex-col gap-3 lg:gap-4 ${dir === "rtl" ? "lg:order-1" : "lg:order-3"}`}>

              {/* Features — accordion on mobile, always open on desktop */}
              <div className={`${card} lg:flex-1 lg:flex lg:flex-col`}>
                <button
                  type="button"
                  onClick={() => setShowFeatures((v) => !v)}
                  className={`w-full flex items-center justify-between lg:cursor-default rounded-xl px-3 py-2 ${
                    isDark ? "bg-slate-700 text-slate-100" : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <h4 className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-slate-200" : "text-slate-500"}`}>
                    {pageText.featuresTitle}
                  </h4>
                  <span className="lg:hidden opacity-40">
                    {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                <div className={`flex flex-col gap-3 mt-3 lg:flex-1 ${showFeatures ? "flex" : "hidden lg:flex"}`}>
                  {pageText.featuresItems.map(({ Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className={iconBoxPurple}>
                        <Icon className="w-4 h-4 text-purple-500" />
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
                <h4 className="text-xs font-semibold opacity-50 mb-4 uppercase tracking-widest">
                  {pageText.stepsTitle}
                </h4>
                <div className="flex flex-col gap-3">
                  {pageText.stepsItems.map(({ num, text }) => (
                    <div key={num} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
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

const StudentLoginPage = () => <LoginPage />;
export default StudentLoginPage;
