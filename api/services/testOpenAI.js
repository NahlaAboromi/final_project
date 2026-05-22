const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

async function test() {

  const start = Date.now();

  try {

    const response = await client.chat.completions.create({
      model: "llama3.1-8b",
      messages: [
        {
          role: "user",
          content:
            "Analyze briefly: The student feels stressed before exams and avoids teamwork.",
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const end = Date.now();

    console.log("\n========================");
    console.log("MODEL: llama3.1-8b");
    console.log("TIME:", ((end - start) / 1000).toFixed(2), "seconds");
    console.log("RESPONSE:");
    console.log(response.choices[0].message.content);
    console.log("========================\n");

  } catch (error) {

    console.error("❌ ERROR:");
    console.error(error.message);

  }
}

test();