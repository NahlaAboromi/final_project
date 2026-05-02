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
} from "lucide-react";

const LoginContent = () => {
  const { login } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext) || { lang: "he" };

  const { t, dir, lang: langAttr, ready } = useI18n("teacherLogin");
  const isDark = theme === "dark";
  const isHebrew = lang === "he";

  const iconClass = "inline w-3.5 h-3.5 mx-1 opacity-80";

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
          { Icon: Brain, title: "מודעות עצמית", desc: "זיהוי רגשות וחוזקות" },
          { Icon: Target, title: "ניהול עצמי", desc: "הצבת מטרות וניהול לחץ" },
          { Icon: Users, title: "מודעות חברתית", desc: "הבנת אחרים ורגישות חברתית" },
          { Icon: MessageCircle, title: "מיומנויות בינאישיות", desc: "תקשורת ושיתוף פעולה" },
          { Icon: CheckCircle, title: "קבלת החלטות אחראית", desc: "קבלת החלטות אתיות וחיוביות" },
        ]
      : [
          { Icon: Brain, title: "Self Awareness", desc: "Identifying emotions and strengths" },
          { Icon: Target, title: "Self Management", desc: "Setting goals and managing stress" },
          { Icon: Users, title: "Social Awareness", desc: "Understanding others" },
          { Icon: MessageCircle, title: "Relationship Skills", desc: "Communication and cooperation" },
          { Icon: CheckCircle, title: "Responsible Decisions", desc: "Making ethical and positive decisions" },
        ],

    benefitsItems: isHebrew
      ? [
          { Icon: GraduationCap, title: "למידה מותאמת אישית", desc: "התאמת תרחישים לפי רמת הסטודנט" },
          { Icon: Puzzle, title: "פיתוח מיומנויות SEL", desc: "חיזוק מודעות עצמית וקבלת החלטות" },
          { Icon: Zap, title: "למידה אינטראקטיבית", desc: "למידה דרך סימולציות ולא רק תיאוריה" },
          { Icon: Sprout, title: "צמיחה מתמשכת", desc: "מעקב אחרי התקדמות לאורך זמן" },
        ]
      : [
          { Icon: GraduationCap, title: "Personalized Learning", desc: "Scenarios adapted to student level" },
          { Icon: Puzzle, title: "SEL Skill Development", desc: "Strengthening awareness and decisions" },
          { Icon: Zap, title: "Interactive Learning", desc: "Learning through simulations" },
          { Icon: Sprout, title: "Continuous Growth", desc: "Tracking progress over time" },
        ],

    stepsItems: isHebrew
      ? [
          "התחבר לחשבון המרצה שלך",
          "צור כיתה או תרחיש AI",
          "עקוב אחרי התקדמות הסטודנטים",
          "ייצא דוחות PDF",
        ]
      : [
          "Log in to your teacher account",
          "Create a class or AI scenario",
          "Track student progress",
          "Export PDF reports",
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

  return (
    <div
      dir={dir}
      lang={langAttr}
      className={`min-h-screen w-screen flex flex-col font-sans ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      <main className="flex-1 w-full px-2 py-2 overflow-x-hidden">
        <div
          className={`min-h-[calc(100vh-140px)] rounded-xl p-3 ${
            isDark ? "bg-slate-700" : "bg-slate-100"
          }`}
        >
          <div className="w-full max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_0.85fr_0.8fr] gap-3 items-start">
            <aside className={`space-y-3 ${dir === "rtl" ? "order-3" : "order-1"}`}>
              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-3 rounded-xl shadow-lg`}>
                <h3 className="text-base font-semibold mb-1">Casely</h3>
                <p className="text-xs leading-5 opacity-80">
                  {pageText.eduMapDescription}
                </p>
              </div>

              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-2 rounded-lg shadow-lg`}>
<h4 className="text-xs font-medium opacity-70 mb-1">
  {isHebrew ? "מודל CASEL" : "CASEL Framework"}
</h4>

                {pageText.caselItems.map(({ Icon, title, desc }) => (
                  <div
                    key={title}
                    className={`mb-[2px] p-1 rounded-md ${
                      isDark ? "bg-slate-700" : "bg-slate-100"
                    }`}
                  >
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
              <div
                className={`max-w-xs mx-auto w-full space-y-2 ${
                  isDark ? "bg-slate-800" : "bg-white"
                } p-4 rounded-xl shadow-xl`}
              >
                <div className="flex flex-col items-center space-y-2">
<div
  className={`w-10 h-10 rounded-full flex items-center justify-center ${
    isDark ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-800"
  }`}
>
<UserRound className="w-6 h-6" strokeWidth={1.6} /></div>

                  <h2 className="text-xl font-bold text-center font-sans tracking-normal">
                    {t("title")}
                  </h2>

                  <p className="text-xs text-center">{t("subtitle")}</p>
                </div>

                {error && <Alert type="error" message={error} />}

                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="space-y-2">
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
                  </div>

                  <div className="text-xs mb-1">
                    <Link
                      to="/forgot-password?role=teacher"
                      className="text-blue-500 hover:underline"
                    >
                      {t("forgot")}
                    </Link>
                  </div>

                  <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                    {t("btnSignIn")}
                  </Button>
                </form>

                <p className="mt-4 text-xs text-center">
                  {t("noAccount")}{" "}
                  <Link to="/register?role=teacher" className="text-blue-500 hover:underline">
                    {t("registerNow")}
                  </Link>
                </p>
              </div>
            </section>

            <aside className={`space-y-3 ${dir === "rtl" ? "order-1" : "order-3"}`}>
              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-3 rounded-xl shadow-lg`}>
                <h3 className="text-xs font-bold mb-1 opacity-80">
                  {pageText.benefitsTitle}
                </h3>

                {pageText.benefitsItems.map(({ Icon, title, desc }) => (
                  <div key={title} className="mb-1">
                    <div className="text-xs font-medium leading-4">
                      <Icon className={iconClass} /> {title}
                    </div>
                    <div className="text-[11px] opacity-70 leading-4">{desc}</div>
                  </div>
                ))}
              </div>

              <div className={`${isDark ? "bg-slate-800" : "bg-white"} p-3 rounded-xl shadow-lg`}>
                <h3 className="text-xs font-bold mb-1 opacity-80">
                  {pageText.stepsTitle}
                </h3>

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

const Login = () => <LoginContent />;
export default Login;