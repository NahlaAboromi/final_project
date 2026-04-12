import React from "react";

const experimentSteps = {
  he: [
    { id: 1, label: "פתיחה" },
    { id: 2, label: "Pre" },
    { id: 3, label: "סימולציה" },
    { id: 4, label: "ניתוח + בוט ↓" },
    { id: 5, label: "סיכום" },
    { id: 6, label: "Post" },
    { id: 7, label: "רפלקציה" },
    { id: 8, label: "UEQ" },
    { id: 9, label: "סיום" },
  ],
  en: [
    { id: 1, label: "Introduction" },
    { id: 2, label: "Pre" },
    { id: 3, label: "Simulation" },
    { id: 4, label: "Analysis + Bot ↓" },
    { id: 5, label: "Summary" },
    { id: 6, label: "Post" },
    { id: 7, label: "Reflection" },
    { id: 8, label: "UEQ" },
    { id: 9, label: "Finish" },
  ],
};

const controlSteps = {
  he: [
    { id: 1, label: "פתיחה" },
    { id: 2, label: "Pre" },
    { id: 3, label: "סימולציה" },
    { id: 4, label: "ניתוח" },
    { id: 5, label: "Post" },
    { id: 6, label: "UEQ" },
    { id: 7, label: "סיום" },
  ],
  en: [
    { id: 1, label: "Introduction" },
    { id: 2, label: "Pre" },
    { id: 3, label: "Simulation" },
    { id: 4, label: "Analysis" },
    { id: 5, label: "Post" },
    { id: 6, label: "UEQ" },
    { id: 7, label: "Finish" },
  ],
};

export default function ProgressSteps({
  groupType = "control",
  currentStep = 1,
  language = "he",
  isDark = false,
}) {
  const safeLanguage = language === "en" ? "en" : "he";
  const isRTL = safeLanguage === "he";

  const steps =
    groupType === "control"
      ? controlSteps[safeLanguage]
      : experimentSteps[safeLanguage];

  const safeCurrentStep = Math.min(Math.max(currentStep || 1, 1), steps.length);

  const colors = {
    containerBg: isDark ? "#2f3f58" : "#f7f7f5",
    containerBorder: isDark ? "#4e617d" : "#d9d9d4",
    inactiveStepBg: isDark ? "#41536f" : "#f2f1ec",
    inactiveStepText: isDark ? "#d6deea" : "#6f6f6a",
    inactiveStepBorder: isDark ? "#617796" : "#bdbdb7",
    activeBg: "#1fa971",
    activeText: "#ffffff",
    activeBorder: "#bfe8d7",
  };

  const displayedSteps = steps;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        width: "100%",
        background: colors.containerBg,
        border: `1px solid ${colors.containerBorder}`,
        borderRadius: "14px",
        padding: "14px 12px 10px",
        boxSizing: "border-box",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        {displayedSteps.map((step) => {
          const isActive = step.id === safeCurrentStep;
          const isCompleted = step.id < safeCurrentStep;

          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "40px",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: isActive ? "700" : "500",
                  background: isActive || isCompleted ? colors.activeBg : colors.inactiveStepBg,
                  color: isActive || isCompleted ? colors.activeText : colors.inactiveStepText,
                  border: isActive
                    ? `3px solid ${colors.activeBorder}`
                    : isCompleted
                    ? `1px solid ${colors.activeBg}`
                    : `1px solid ${colors.inactiveStepBorder}`,
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                }}
              >
                {step.id}
              </div>

              <span
                style={{
                  marginTop: "4px",
                  fontSize: "10px",
                  color: isActive || isCompleted ? colors.activeBg : colors.inactiveStepText,
                  fontWeight: isActive || isCompleted ? "600" : "400",
                  textAlign: "center",
                  lineHeight: "1.3",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}