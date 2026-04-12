const claudeService = require('./claudeService');
// Analyzes a student's response using Claude AI and the CASEL 5 SEL framework
async function repairJsonWithClaude(badJsonText) {
  console.log("\n🛠️ Starting Claude JSON repair retry...");

  const repairMessages = [
    {
      role: 'user',
      content: `You are given a malformed JSON text that was supposed to represent an analysis result.

Your job:
- Return the SAME content as strictly valid JSON
- Do NOT change the meaning
- Do NOT add new fields
- Do NOT remove existing fields unless they are completely broken beyond recovery
- Preserve Hebrew if the content is in Hebrew
- Preserve English if the content is in English

CRITICAL RULES:
- Return ONLY valid JSON
- No markdown
- No code fences
- No explanations
- No text before or after the JSON
- Start with { and end with }

Malformed JSON:
${badJsonText}`
    }
  ];

  const repairResult = await claudeService.chat(repairMessages, {
    maxTokens: 4000,
    temperature: 0
  });

  console.log("\n📥 Claude repair raw result:");
  console.dir(repairResult, { depth: null });

  if (!repairResult?.success) {
    console.error("❌ Claude JSON repair retry failed completely");
    return null;
  }

  const repairedText = repairResult?.data?.content?.[0]?.text;

  if (!repairedText) {
    console.error("❌ Claude JSON repair returned empty text");
    return null;
  }

  console.log("\n========= RAW REPAIRED CLAUDE TEXT =========");
  console.log(repairedText);
  console.log("============================================");

  const repairedMatch = repairedText.match(/\{[\s\S]*\}/);

  if (!repairedMatch) {
    console.error("❌ Claude repair regex failed — no JSON found");
    return null;
  }

  try {
    const parsed = JSON.parse(repairedMatch[0]);
    console.log("✅ Claude JSON repair parse success");
    return parsed;
  } catch (repairParseError) {
    console.error("❌ Claude JSON repair parse failed");
    console.error(repairParseError.message);
    return null;
  }
}
async function analyzeStudentResponse({ situation, question, studentResponse, studentName }) {
    console.log("\n================ analyzeStudentResponse START ================");
  console.log("INPUT situation length:", situation?.length);
  console.log("INPUT question length:", question?.length);
  console.log("INPUT studentResponse length:", studentResponse?.length);
  console.log("INPUT studentName:", studentName);
  console.log("=============================================================\n");

  
  // Prepare the prompt message for Claude AI with all required analysis instructions
  const messages = [
    {
      role: 'user',
      content: `Analyze the following student response to a social-emotional learning situation according to the CASEL 5 framework.
IMPORTANT LANGUAGE RULE:
- If the student's response is in Hebrew, do ALL analysis and text outputs in Hebrew.
- Otherwise, respond in English.
DATA QUALITY RULE:
- Avoid leaving any field empty or undefined. 
- Always provide meaningful content for every required field (e.g., use short feedback instead of an empty string, and at least one item in lists like strengths or areas for improvement).
IMPORTANT VOICE RULE:
- If studentName starts with "Anonymous", speak directly to the student ("you").
- Otherwise, describe the student in third-person ("the student").


Situation: "${situation}"
Question: "${question}"
Student Response: "${studentResponse}"
Student Name: "${studentName}"
Analyze across:
1. Self-awareness
2. Self-management
3. Social awareness
4. Relationship skills
5. Responsible decision-making


Return a JSON object with:
- selfAwareness: { score: 1-5, feedback: string }
- selfManagement: { score: 1-5, feedback: string }
- socialAwareness: { score: 1-5, feedback: string }
- relationshipSkills: { score: 1-5, feedback: string }
- responsibleDecisionMaking: { score: 1-5, feedback: string }
- Observed strengths (list of strings; if none, return an empty list [])
- Areas for improvement (list of strings; if none, return an empty list [])
- Overall score
- suggestedIntervention (string)
- redFlags (list)
- estimatedDepthLevel (string)
Return ONLY a valid JSON object without code fences, markdown, or extra text.
CRITICAL OUTPUT RULE:
Your response MUST be valid JSON only.
Do NOT write any text before the JSON.
Do NOT write any text after the JSON.
Do NOT include explanations, notes, or markdown.
Do NOT include code fences.
Start with { and end with } only.
If you violate this rule, the response will be rejected.
CRITICAL REQUIREMENT – VALID JSON ONLY:

You MUST return strictly valid JSON.

Your response will be parsed programmatically using JSON.parse(). 
If the JSON is invalid, the system will fail and the user experience will be negatively affected.

Therefore:
- Do NOT include any syntax errors.
- Do NOT include trailing commas.
- Do NOT include extra brackets or missing brackets.
- Do NOT include comments.
- Do NOT include markdown or code fences (no triple backticks).
- Do NOT include any text before or after the JSON.
- Ensure all keys and values are properly formatted.
- Ensure arrays and objects are properly opened and closed.

Your response must start with "{" and end with "}".

If you are unsure, double-check your output before returning it.

ONLY return valid JSON.

`

    }
  ];
  console.log("📤 Sending to Claude...");
  console.log("Messages preview:");
  console.dir(messages, { depth: null });


  const result = await claudeService.chat(messages, {
    maxTokens: 7000,
    temperature: 0.3
  });

console.log("\n==============================");
console.log("STEP 1 - FULL RESULT OBJECT");
console.dir(result, { depth: null });

console.log("\nSTEP 2 - SUCCESS FIELD");
console.log(result.success);

console.log("\nSTEP 3 - DATA FIELD");
console.dir(result.data, { depth: null });

console.log("\nSTEP 4 - CONTENT FIELD");
console.dir(result.data?.content, { depth: null });

console.log("\nSTEP 5 - FIRST CONTENT ITEM");
console.dir(result.data?.content?.[0], { depth: null });

console.log("\nSTEP 6 - RAW TEXT FROM CLAUDE:");
console.log(result.data?.content?.[0]?.text);

console.log("==============================\n");
  console.log("\n📥 Claude raw result:");
  console.dir(result, { depth: null });


  if (!result.success) {

    console.error("❌ Claude failed completely");
    console.error(result.error);

    console.log("================ analyzeStudentResponse END (FAIL) ================\n");

    return null;
  }


  // חשוב מאוד לבדוק שהמבנה קיים

  if (!result.data) {

    console.error("❌ result.data is missing");
    return null;
  }

  if (!result.data.content) {

    console.error("❌ result.data.content is missing");
    return null;
  }

  if (!result.data.content[0]) {

    console.error("❌ result.data.content[0] is missing");
    return null;
  }

  if (!result.data.content[0].text) {

    console.error("❌ result.data.content[0].text is missing");
    return null;
  }


  const aiText = result.data.content[0].text;


  console.log("\n========= RAW CLAUDE TEXT =========");
  console.log(aiText);
  console.log("===================================");


  console.log("\n🔍 Trying regex extraction...");


  const jsonMatch = aiText.match(/\{[\s\S]*\}/);


  if (!jsonMatch) {

    console.error("❌ REGEX FAILED — no JSON found");

    console.log("================ analyzeStudentResponse END (REGEX FAIL) ================\n");

    return null;
  }


  console.log("✅ REGEX SUCCESS");
  console.log("Extracted JSON:");
  console.log(jsonMatch[0]);


  try {

    console.log("\n🔄 Parsing JSON...");

    const parsed = JSON.parse(jsonMatch[0]);

    console.log("✅ JSON PARSE SUCCESS");

    console.log("Parsed keys:", Object.keys(parsed));

    console.log("================ analyzeStudentResponse END (SUCCESS) ================\n");

    return parsed;

  } catch (error) {

    console.error("❌ JSON PARSE FAILED");
    console.error(error.message);

    console.log("Bad JSON:");
    console.log(jsonMatch[0]);

    console.log("🔧 Trying to fix JSON...");
let fixed = jsonMatch[0]
  .replace(/^```json\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/\s*```$/i, '')
  .replace(/,\s*]/g, ']')
  .replace(/,\s*}/g, '}')

  // אם strengths לא נסגר לפני areasForImprovement
  .replace(
    /("strengths"\s*:\s*\[[\s\S]*?)(\s*,\s*"areasForImprovement"\s*:)/,
    '$1]$2'
  )

  // אם areasForImprovement לא נסגר לפני overallScore
  .replace(
    /("areasForImprovement"\s*:\s*\[[\s\S]*?)(\s*,\s*"overallScore"\s*:)/,
    '$1]$2'
  )

  // אם redFlags לא נסגר לפני estimatedDepthLevel
  .replace(
    /("redFlags"\s*:\s*\[[\s\S]*?)(\s*,\s*"estimatedDepthLevel"\s*:)/,
    '$1]$2'
  )

  // אם יש ] מיותר אחרי suggestedIntervention
  .replace(
    /("suggestedIntervention"\s*:\s*"(?:[^"\\]|\\.)*")\s*]\s*(,\s*"redFlags"\s*:)/,
    '$1$2'
  )

  // ניקוי נוסף אחרי התיקונים
  .replace(/,\s*]/g, ']')
  .replace(/,\s*}/g, '}');

console.log("Fixed JSON:");
console.log(fixed);

    try {

      const parsed = JSON.parse(fixed);

      console.log("✅ JSON FIX SUCCESS");

      console.log("Parsed keys:", Object.keys(parsed));

      console.log("================ analyzeStudentResponse END (FIX SUCCESS) ================\n");

      return parsed;
    } catch (error2) {

      console.error("❌ JSON FIX FAILED");
      console.error(error2.message);

      console.log("🤖 Trying one more Claude retry for JSON repair only...");

const repairedParsed = await repairJsonWithClaude(fixed);
      if (repairedParsed) {
        console.log("✅ Claude retry repair SUCCESS");
        console.log("Parsed keys:", Object.keys(repairedParsed));
        console.log("================ analyzeStudentResponse END (CLAUDE RETRY SUCCESS) ================\n");
        return repairedParsed;
      }

      console.log("================ analyzeStudentResponse END (FINAL FAIL) ================\n");

      return null;
    }
  }
}

module.exports = { analyzeStudentResponse };