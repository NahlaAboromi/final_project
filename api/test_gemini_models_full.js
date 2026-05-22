require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [

"gemini-2.5-flash-lite",
"gemini-2.5-flash",
"gemini-2.5-pro",

"gemini-flash-latest",
"gemini-flash-lite-latest",

"gemini-3.5-flash",
"gemini-3.1-flash-lite"

];

const prompt = `
Return ONLY valid JSON.

Analyze this small SEL case.

Student answer:
"I would first try to understand my friend's situation, but I also need to protect the group grade. I may talk to him and ask what he can still do."

Return JSON:
{
  "modelQuality": "",
  "detectedLanguage": "",
  "mainWeakness": "",
  "shortReason": "",
  "score": 0
}
`;

async function testModel(modelName) {
  const start = Date.now();

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 500,
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const time = Date.now() - start;

    const text = result.response.text();

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    console.log("✅ SUCCESS:", modelName);
    console.log("⏱️ Time:", time, "ms");
    console.log("📦 Response:", parsed);
    console.log("--------------------------------");

    return {
      model: modelName,
      success: true,
      time,
      response: parsed
    };

  } catch (error) {
    const time = Date.now() - start;

    console.log("❌ FAILED:", modelName);
    console.log("⏱️ Time:", time, "ms");
    console.log("⚠️ Error:", error.message);
    console.log("--------------------------------");

    return {
      model: modelName,
      success: false,
      time,
      error: error.message
    };
  }
}

async function run() {
  console.log("🚀 Testing Gemini models...\n");

  const results = [];

  for (const modelName of models) {
    const result = await testModel(modelName);
    results.push(result);
  }

  console.log("\n================ SUMMARY ================");

  results.forEach(r => {
    if (r.success) {
      console.log(`✅ ${r.model} | ${r.time} ms`);
    } else {
      console.log(`❌ ${r.model} | FAILED | ${r.time} ms`);
    }
  });

  const successful = results
    .filter(r => r.success)
    .sort((a, b) => a.time - b.time);

  console.log("\n🏆 FASTEST SUCCESSFUL MODEL:");

  if (successful.length > 0) {
    console.log(successful[0].model, "-", successful[0].time, "ms");
  } else {
    console.log("No successful models.");
  }
}

run();