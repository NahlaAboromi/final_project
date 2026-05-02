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
} from "lucide-react";

const LoginPage = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { t, dir, lang, ready } = useI18n("studentLogin");
  const isHebrew = lang === "he";

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
  ? ["התחבר לחשבון הסטודנט", "בחר כיתה מהרשימה", "בצע סימולציה", "צפה בדוח ובמשוב"]
  : ["Log in to your student account", "Choose a class from the list", "Complete a simulation", "View your report and feedback"],
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
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(t("errors.loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  const iconClass = "inline w-3.5 h-3.5 mx-1 opacity-80";

  return (
    <div
      dir={dir}
      lang={lang}
      className={`min-h-screen w-screen flex flex-col font-sans ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      <main className="flex-1 w-full px-2 py-2 overflow-x-hidden">
        <div className={`min-h-[calc(100vh-140px)] rounded-xl p-3 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
          <div className="w-full max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_0.85fr_0.8fr] gap-3 items-start">
            <aside className={`space-y-3 ${dir === "rtl" ? "order-3" : "order-1"}`}>
              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-3 rounded-xl shadow-lg`}>
                <h3 className="text-base font-semibold mb-1">Casely</h3>
                <p className="text-xs leading-5 opacity-80">{pageText.systemDescription}</p>
              </div>

              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-2 rounded-lg shadow-lg`}>
                <h4 className="text-xs font-medium opacity-70 mb-1">{pageText.caselTitle}</h4>

                {pageText.caselItems.map(({ Icon, title, desc }) => (
                  <div key={title} className={`mb-[2px] p-1 rounded-md ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                    <div className="text-xs font-medium leading-4">
                      <Icon className={iconClass} /> {title}
                    </div>
                    <div className="text-[11px] opacity-70 leading-4">{desc}</div>
                  </div>
                ))}
              </div>

              <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg font-bold text-xs text-center">
                {pageText.greenQuote}
              </div>
            </aside>

            <section className="order-2">
              <div className={`max-w-xs mx-auto w-full space-y-2 ${isDark ? "bg-slate-800" : "bg-white"} p-4 rounded-xl shadow-xl`}>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-800"
                    }`}
                    aria-label={t("studentAlt")}
                  >
                    <Users className="w-6 h-6" strokeWidth={1.8} />
                  </div>

                  <h2 className="text-xl font-bold text-center font-sans tracking-normal">{t("title")}</h2>

                  <p className="text-xs text-center">
                    {t("noAccount")}{" "}
                    <Link to="/register?role=student" className="font-medium text-blue-500 hover:text-blue-600">
                      {t("registerNow")}
                    </Link>
                  </p>
                </div>

                {error && <Alert type="error" message={error} />}

                <form className="space-y-2" onSubmit={handleSubmit}>
                  <div className="space-y-2">
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
                  </div>

                  <div className="text-xs mb-1">
                    <Link to="/forgot-password?role=student" className="font-medium text-blue-500 hover:text-blue-600">
                      {t("forgotPassword")}
                    </Link>
                  </div>

                  <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                    {t("signIn")}
                  </Button>
                </form>
              </div>
            </section>

            <aside className={`space-y-3 ${dir === "rtl" ? "order-1" : "order-3"}`}>
              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-3 rounded-xl shadow-lg`}>
                <h3 className="text-xs font-bold mb-1 opacity-80">{pageText.featuresTitle}</h3>

                {pageText.featuresItems.map(({ Icon, title, desc }) => (
                  <div key={title} className="mb-1">
                    <div className="text-xs font-medium leading-4">
                      <Icon className={iconClass} /> {title}
                    </div>
                    <div className="text-[11px] opacity-70 leading-4">{desc}</div>
                  </div>
                ))}
              </div>

              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-3 rounded-xl shadow-lg`}>
                <h3 className="text-xs font-bold mb-1 opacity-80">{pageText.stepsTitle}</h3>

                {pageText.stepsItems.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span className="text-[11px]">{step}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const StudentLoginPage = () => {
  return <LoginPage />;
};

export default StudentLoginPage;