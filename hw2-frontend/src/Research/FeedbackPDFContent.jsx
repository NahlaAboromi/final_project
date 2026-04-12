import React from "react";
import { LanguageContext } from "../context/LanguageContext";
import StudentAnswerCard from "../studentPages/AnswerCard";

const QUESTIONS_EN = [
  "I am aware of the emotions I feel.",
  "I can calm myself down.",
  "I know what my strengths are.",
  "I am aware when my feelings are making it hard to focus.",

  "I can be patient during lessons that get me excited.",
  "I always manage to finish my tasks even if they are hard for me.",
  "I can set goals for myself.",
  "I complete my assignment even if I do not feel like it.",

  "I learn from people with different opinions than me.",
  "I am able to tell what people may be feeling.",
  "I know when someone needs help.",
  "I know how to get help when I’m having trouble with a classmate.",

  "I can respect a classmate’s opinions during disagreements.",
  "I get along well with my classmates.",
  "I always speak to an adult when I have problems at school.",
  "I build and maintain healthy relationships within my university community.",

  "I think about what might happen before making any decision.",
  "In a situation, I know what is right or wrong.",
  "I can strictly say “NO” to a friend who wants me to break the rules.",
  "I always seek advice or feedback from others before making important decisions."
];

const QUESTIONS_HE = [
  "אני מודע/ת לרגשות שאני מרגיש/ה.",
  "אני יודע/ת להרגיע את עצמי.",
  "אני יודע/ת מה החוזקות שלי.",
  "אני מודע/ת כשרגשות מקשים עליי להתרכז.",

  "אני מסוגל/ת להיות סבלני/ת במהלך שיעורים שמרגשים אותי.",
  "אני מצליח/ה לסיים משימות גם כשהן קשות לי.",
  "אני יודע/ת להציב לעצמי מטרות.",
  "אני מסיים/ת מטלות גם כשאין לי חשק.",

  "אני לומד/ת מאנשים עם דעות שונות משלי.",
  "אני מצליח/ה להבין מה אחרים מרגישים.",
  "אני יודע/ת לזהות מתי מישהו צריך עזרה.",
  "אני יודע/ת איך לבקש עזרה כשיש לי קושי עם חבר/ה.",

  "אני מכבד/ת דעות של אחרים גם כשאני לא מסכים/ה.",
  "אני מסתדר/ת טוב עם חבריי ללימודים.",
  "אני פונה למבוגר כשיש לי בעיה בבית הספר.",
  "אני בונה ושומר/ת על קשרים חיוביים בסביבה האקדמית.",

  "אני חושב/ת על ההשלכות לפני שאני מקבל/ת החלטה.",
  "אני יודע/ת להבחין בין נכון ללא נכון במצבים שונים.",
  "אני יודע/ת להגיד 'לא' כשמבקשים ממני לעבור על כללים.",
  "אני נוהג/ת לבקש עצה לפני קבלת החלטות חשובות."
];

const CATEGORY_LABELS = {
  en: [
    "Self Awareness",
    "Self Management",
    "Social Awareness",
    "Relationship Skills",
    "Responsible Decision-Making",
  ],
  he: [
    "מודעות עצמית",
    "ניהול עצמי",
    "מודעות חברתית",
    "מיומנויות בין-אישיות",
    "קבלת החלטות אחראית",
  ],
};

function calcCategoryAverages(answerArray = []) {
  const vals = answerArray.map((x) => Number(x?.value) || 0);

  const groups = [
    vals.slice(0, 4),
    vals.slice(4, 8),
    vals.slice(8, 12),
    vals.slice(12, 16),
    vals.slice(16, 20),
  ];

  return groups.map((group) => {
    const avg = group.length
      ? group.reduce((a, b) => a + b, 0) / group.length
      : 0;

    return {
      avg,
      percent: Math.round((avg / 4) * 100),
    };
  });
}

function QuestionnaireSummaryCard({ title, items, isHeb }) {
  return (
    <div
      style={{
        border: "1px solid #dbe2ea",
        borderRadius: "12px",
        padding: "14px",
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        marginBottom: "12px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "22px",
          fontWeight: "800",
          color: "#1e3a5f",
          marginTop: 0,
          marginBottom: "12px",
        }}
      >
        {title}
      </h2>

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #dbe2ea",
            borderRadius: "10px",
            padding: "10px 12px",
            marginBottom: "8px",
            background: "#f8fbff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#1e3a5f",
                textAlign: isHeb ? "right" : "left",
              }}
            >
              {item.label}
              <span style={{ marginInlineStart: 8, fontWeight: 600 }}>
                ({item.avg.toFixed(1)} / 4.0)
              </span>
            </div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#1e3a5f",
                minWidth: "42px",
                textAlign: "center",
              }}
            >
              {item.percent}%
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#d9e1ea",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${item.percent}%`,
                height: "100%",
                background: "#0f9d69",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeedbackPDFContent({ data, lang = "en", hasSocratic = true }) {
      const isHeb = lang === "he";

  const pre = data?.casel?.pre?.answers || [];
  const post = data?.casel?.post?.answers || [];
  const QUESTIONS = isHeb ? QUESTIONS_HE : QUESTIONS_EN;
  const labels = isHeb ? CATEGORY_LABELS.he : CATEGORY_LABELS.en;

  const preSummary = calcCategoryAverages(pre).map((item, i) => ({
    ...item,
    label: labels[i],
  }));

  const postSummary = calcCategoryAverages(post).map((item, i) => ({
    ...item,
    label: labels[i],
  }));


  return (
    <div
      style={{
padding: 30,        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#111827",
      }}
      dir={isHeb ? "rtl" : "ltr"}
    >
      {/* עמוד 1 - טבלת CASEL */}
{/* עמוד 1 - טבלת CASEL */}
<div
  style={{
    breakAfter: "page",
    pageBreakAfter: "always",
  }}
>
  <h2 style={{ textAlign: "center", marginBottom: 24 }}>        {isHeb ? "דוח משוב אישי" : "Personal Feedback Report"}
      </h2>

      <h3 style={{ marginBottom: 12 }}>
        {isHeb ? "תוצאות CASEL" : "CASEL Results"}
      </h3>

      <table
        border="1"
        cellPadding="6"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 24,
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: isHeb ? "right" : "left" }}>
              {isHeb ? "שאלה" : "Question"}
            </th>
            <th style={{ textAlign: "center", width: "80px" }}>Pre</th>
            <th style={{ textAlign: "center", width: "80px" }}>Post</th>
          </tr>
        </thead>

        <tbody>
          {QUESTIONS.map((q, i) => (
            <tr key={i}>
              <td style={{ textAlign: isHeb ? "right" : "left" }}>{q}</td>
              <td style={{ textAlign: "center" }}>{pre[i]?.value ?? "-"}</td>
              <td style={{ textAlign: "center" }}>{post[i]?.value ?? "-"}</td>
            </tr>
          ))}
        </tbody>

      </table>
</div>
{/* עמוד 2 - כרטיסיות סיכום PRE ו-POST */}
<div
  style={{
    marginTop: 0,
  }}
>
        <QuestionnaireSummaryCard
          title={isHeb ? "תוצאות השלמת שאלון PRE" : "PRE Questionnaire Results"}
          items={preSummary}
          isHeb={isHeb}
        />

        <QuestionnaireSummaryCard
          title={isHeb ? "תוצאות השלמת שאלון POST" : "POST Questionnaire Results"}
          items={postSummary}
          isHeb={isHeb}
        />
      </div>

      {/* עמוד 3 - ניתוח */}
      <div
        style={{
          breakBefore: "page",
          pageBreakBefore: "always",
          marginTop: 0,
        }}
      >
        <LanguageContext.Provider
          value={{ lang: isHeb ? "he" : "en", setLang: () => {} }}
        >
          <StudentAnswerCard
            isDark={false}
            answer={{
              answerText: (data?.answers || []).slice(-1)[0] || "—",
              analysisResult: data?.aiAnalysisJson || {},
              submittedAt: data?.timeline?.simulationEndedAt || new Date(),
            }}
          />
        </LanguageContext.Provider>
      </div>

      {/* עמוד 4 - תיעוד שיחה */}
{hasSocratic && Array.isArray(data?.chatLog) && data.chatLog.length > 0 && (
            <div
          style={{
            breakBefore: "page",
            pageBreakBefore: "always",
            marginTop: 0,
          }}
        >
          <h3 style={{ marginBottom: 12 }}>
            {isHeb ? "תיעוד השיחה" : "Conversation Transcript"}
          </h3>

          <div
            style={{
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "16px",
              lineHeight: 1.8,
            }}
          >
            {data.chatLog
              .filter((msg) => msg.text !== "__CHAT_SESSION_START__")
              .map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 12,
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background:
                      msg.sender === "student" ? "#e0f2fe" : "#f1f5f9",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {msg.sender === "student"
                      ? isHeb
                        ? "הסטודנט/ית"
                        : "Student"
                      : "CASELY"}
                  </div>

                  <div>{msg.text || "—"}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* עמוד 5 - סיכום */}
{hasSocratic && (
  <div
    style={{
      marginTop: 20,
      breakBefore: "page",
      pageBreakBefore: "always",
    }}
  >
    <h3 style={{ marginTop: 0, marginBottom: 12 }}>
      {isHeb ? "סיכום" : "Summary"}
    </h3>

    <div
      style={{
        background: "#dbeafe",
        padding: "15px",
        borderRadius: "10px",
        lineHeight: 1.7,
      }}
    >
      {data?.aiConversationSummary || "—"}
    </div>
  </div>
)}
    </div>
  );
}