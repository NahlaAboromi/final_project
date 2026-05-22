require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash"
];

async function testModel(modelName) {
  const start = Date.now();

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 200,
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(`
Return only JSON:
{
  "status": "ok",
  "model": "${modelName}"
}
`);

    const time = Date.now() - start;

    console.log("✅ SUCCESS:", modelName);
    console.log("⏱️ Time:", time, "ms");
    console.log(result.response.text());
    console.log("--------------------------------");

  } catch (error) {
    const time = Date.now() - start;

    console.log("❌ FAILED:", modelName);
    console.log("⏱️ Time:", time, "ms");
    console.log(error.message);
    console.log("--------------------------------");
  }
}

async function run() {
  for (const model of models) {
    await testModel(model);
  }
}

run();