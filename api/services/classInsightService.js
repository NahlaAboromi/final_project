
//C:\Users\n0502\OneDrive\שולחן העבודה\final_project-main\final_project-main\api\services\classInsightService.js
const claudeService = require('./claudeService');

// Generates a general class insight using Claude AI based on student SEL analyses.
async function generateClassInsightFromClaude({ situation, question, studentAnalyses }) {
   // Combine all student analyses into a formatted string
  const joinedSummaries = studentAnalyses.map((a, i) => `Student ${i + 1}: ${JSON.stringify(a)}`).join('\n');
 // Prepare the prompt message for Claude AI
  const messages = [
    {
      role: 'user',
      content: `
Based on the following student analysis results, generate a general insight about the overall classroom performance in the 5 SEL domains.

Situation: "${situation}"
Question: "${question}"

Student Analyses:
${joinedSummaries}

Please respond with ONLY 2 very short sentences.

First sentence:
Give one short general insight about the class overall SEL state.

Second sentence:
Give one short practical recommendation for the teacher.

Put ONE empty line between the first sentence and the recommendation.

Respond in the same language as the Situation and Question. If they are in Hebrew, respond in Hebrew. If they are in English, respond in English.

Keep the response short, natural, conversational, and suitable as the opening message of an AI chat with the teacher.`
    }
  ];
  // Call Claude service to generate the class insight
  const result = await claudeService.chat(messages, {
    maxTokens: 1000,
    temperature: 0.3
  });
  // Handle errors from Claude service
  if (!result.success) {
    console.error('❌ Claude insight generation failed:', result.error);
    return '⚠️ AI failed to generate class insight.';
  }
  // Return the generated insight text
  return result.data.content[0].text;
}

module.exports = { generateClassInsightFromClaude };
