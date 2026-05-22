const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_CHAIN = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro"
];

async function generateWithFallback(prompt) {

  let lastError = null;

  for (const modelName of MODEL_CHAIN) {

    try {

      console.log("🤖 Trying:", modelName);

      const model =
        genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 10000,
            responseMimeType:
              "application/json"
          }
        });

      const result =
        await model.generateContent(prompt);

      console.log(
        "✅ Success:",
        modelName
      );

      return result;

    } catch (error) {

      lastError = error;

const retryable =
  error.message?.includes("503") ||
  error.message?.includes("429") ||
  error.message?.includes("Service Unavailable") ||
  error.message?.includes("Too Many Requests") ||
  error.message?.includes("timeout");

      console.log(
        "❌ Failed:",
        modelName
      );

      if (!retryable)
        throw error;

    }

  }

  throw lastError;
}
async function repairJsonWithAI(brokenText) {
  const repairPrompt = `
You are a JSON repair tool.

Fix the following broken JSON and return ONLY valid JSON.
Do not change the data meaning.
Do not add explanations.
Do not add markdown.
Output must start with { and end with }.

Broken JSON:
${brokenText}
`;

  const result =
    await generateWithFallback(repairPrompt);

  const repairedText = result.response.text()
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/``/g, '')
    .trim();

  return JSON.parse(repairedText);
}
async function generateSELGroups({ situation, question, students }) {
  try {
    const validStudents = (students || []).filter(
      student => student.answers && student.answers.length > 0
    );

    if (validStudents.length === 0) {
      return { groups: [] };
    }

    const compactStudents = validStudents.map(student => ({
      id: student.id,
      name: student.name,
      answers: student.answers.map(answer => ({
        answerText: answer.answerText,
        selScores: answer.selScores
      }))
    }));

    const prompt = `
    You are an expert SEL educational analyzer using the CASEL 5 framework.

Your task:
- Analyze SEL patterns.
- Group students ONLY by CASEL domain weaknesses.
- Never include students with scores 4 or 5 in that domain’s weakness group.
- Suggested scenarios must help students strengthen the CASEL domain where they are weak.
- Return STRICT JSON ONLY.
- Never use markdown.
- Never explain outside JSON.

You are an AI educational assistant specializing in SEL and the CASEL 5 framework.

Analyze the class data and group students ONLY according to the five CASEL domains.

Create exactly 5 groups:
1. Self-Awareness
2. Self-Management
3. Social Awareness
4. Relationship Skills
5. Responsible Decision-Making

Situation:
${situation}

Question:
${question}

Students:
${JSON.stringify(compactStudents, null, 2)}

IMPORTANT:
- Use ONLY the provided students.
- Do NOT invent students.
- Do NOT include students without answers.
- Each answer includes selScores for the five CASEL domains.
- Use selScores as the MAIN evidence for grouping students.
- Group students ONLY by weakness in the five CASEL domains.
- A score of 4 or 5 means the student is strong in that domain.
- Do NOT place a student in a CASEL weakness group if their score in that domain is 4 or 5.
- Only scores of 1, 2, or 3 may indicate weakness.
- If a student has 5/5 in any CASEL domain, they must NEVER appear in that domain’s weakness group.
- A student may appear in more than one CASEL group only if they have low scores in more than one domain.
- Detect the main language used by the students' answers.
- Return ALL group titles, reasons, scenarios, and questions in the SAME language used by most students.
- If the students answered mostly in Hebrew, ALL generated text MUST be written in Hebrew.
- If the students answered mostly in English, ALL generated text MUST be written in English.
- The suggestedScenario must specifically help students strengthen and improve the CASEL domain in which they are weak.
- The scenario must be designed as an educational SEL intervention targeting that exact weakness.
- The suggestedScenario must be between 50 and 60 words.
- The scenarioQuestion must ask the student how to respond or reflect in that situation.

Return ONLY valid JSON.

CRITICAL:
- Output must start with {
- Output must end with }
- Do not add ANY text before JSON.
- Do not add ANY text after JSON.
- Do not add markdown.
- Do not add backticks.
- Do not explain.
- If output is not strict JSON the response is considered FAILED.

DO NOT return:
Here is JSON
\`\`\`json
\`\`\`
Extra characters

Return format:

{
  "groups": [
    {
      "caselDomain": "",
      "title": "",
      "students": [
        {
          "id": "",
          "name": ""
        }
      ],
      "reason": "",
      "suggestedScenario": "",
      "scenarioQuestion": ""
    }
  ]
}
`;

        console.log("🚀 SENDING ONE REQUEST ONLY TO GEMINI");
    console.log("Students count:", compactStudents.length);

const result =
  await generateWithFallback(prompt);

    console.log("✅ GEMINI RESPONSE RECEIVED");

    const text = result.response.text();
    console.log("RAW AI RESPONSE:");
    console.log(text);

    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
const parsed = JSON.parse(cleanedText);

if (!parsed.groups || !Array.isArray(parsed.groups)) {
  return { groups: [] };
}

parsed.groups = parsed.groups.map(group => ({
  ...group,

  suggestedScenario:
    group.suggestedScenario ||
    group.scenario ||
    ""
}));

return parsed;
} catch (e) {
  console.error("❌ JSON parse failed:");
  console.error(cleanedText);

  try {
    console.log("🛠️ Trying to repair JSON with AI...");

    const repaired =
      await repairJsonWithAI(cleanedText);

    if (!repaired.groups || !Array.isArray(repaired.groups)) {
      return { groups: [] };
    }

    console.log("✅ JSON repaired successfully");

    return repaired;

  } catch (repairError) {
    console.error("❌ JSON repair failed:");
    console.error(repairError.message);

    return { groups: [] };
  }
}

  } catch (error) {
    console.error("❌ SEL GROUPING ERROR:");

    if (error.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    } else {
      console.error(error.message);
    }

    return { groups: [] };
  }
}

module.exports = { generateSELGroups };