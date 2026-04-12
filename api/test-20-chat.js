const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

if (!API_KEY) {
  console.error("❌ Missing ANTHROPIC_API_KEY in api/.env");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendOne(i) {
  const start = Date.now();

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        max_tokens: 120,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `Hello Claude, this is staggered test request #${i}. Please reply with one short sentence and include the number ${i}.`
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": API_KEY,
          "anthropic-version": "2023-06-01"
        },
        timeout: 60000
      }
    );

    const text =
      response.data?.content
        ?.filter((item) => item.type === "text")
        ?.map((item) => item.text)
        ?.join(" ") || "";

    return {
      request: i,
      ok: true,
      status: response.status,
      timeMs: Date.now() - start,
      reply: text.slice(0, 100)
    };
  } catch (error) {
    return {
      request: i,
      ok: false,
      status: error.response?.status || "NO_RESPONSE",
      timeMs: Date.now() - start,
      error:
        error.response?.data?.error?.message ||
        JSON.stringify(error.response?.data) ||
        error.message
    };
  }
}

async function run() {
  console.log("🚀 Starting staggered Claude test with 20 requests...");
  console.log(`🤖 Model: ${MODEL}`);
  console.log("⏳ Delay between requests: 300ms");

  const results = [];

  for (let i = 1; i <= 20; i++) {
    console.log(`Sending request #${i}...`);
    const result = await sendOne(i);
    results.push(result);

    if (i < 20) {
      await sleep(300);
    }
  }

  const success = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  const rateLimited = results.filter((r) => String(r.status) === "429").length;

  console.log("\n=== SUMMARY ===");
  console.log("✅ Success:", success);
  console.log("❌ Failed:", failed);
  console.log("⛔ 429 Rate Limited:", rateLimited);

  console.log("\n=== DETAILS ===");
  console.table(results);

  const failedItems = results.filter((r) => !r.ok);
  if (failedItems.length > 0) {
    console.log("\n=== FAILURES ===");
    failedItems.forEach((item) => {
      console.log(
        `#${item.request} | status=${item.status} | time=${item.timeMs}ms | error=${item.error}`
      );
    });
  }
}

run().catch((err) => {
  console.error("❌ Fatal error:", err.message);
});