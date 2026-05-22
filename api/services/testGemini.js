const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

async function runTest(modelName) {
  const start = Date.now();

  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(
      "Analyze briefly: The student feels stressed before exams and avoids teamwork."
    );

    const end = Date.now();

    console.log("\n========================");
    console.log("MODEL:", modelName);
    console.log("TIME:", ((end - start) / 1000).toFixed(2), "seconds");
    console.log("RESPONSE:");
    console.log(result.response.text());
    console.log("========================\n");

  } catch (error) {
    console.log("\n========================");
    console.log("MODEL:", modelName);
    console.log("FAILED ❌");
    console.log("ERROR:", error.message);
    console.log("========================\n");
  }
}

async function main() {
  for (const modelName of models) {
    await runTest(modelName);
  }
}

main();