//C:\Users\n0502\OneDrive\שולחן העבודה\final_project-main\final_project-main\api\services\claudeService.js
const axios = require('axios');
const path = require('path');

// Loads environment variables from a .env file using an explicit path.
const dotenvPath = path.resolve(process.cwd(), '.env');
console.log("Looking for .env file at:", dotenvPath);
require('dotenv').config({ path: dotenvPath });

//Service for interacting with the Claude AI API.
 //Handles both single-prompt and multi-message chat requests.
 
class ClaudeService {
  constructor() {
     // Try to load the API key from environment variables
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    
    console.log("DEBUG - API Key in claudeService:", this.apiKey ? 
      `Loaded (starts with ${this.apiKey.substring(0, 15)}...)` : 
      "Not loaded - API key is undefined!");
    
   // If the API key is not loaded, use a hardcoded fallback key
    if (!this.apiKey) {
      console.log("WARNING: API key not loaded from .env");
       throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
       // Set the Claude API endpoint and default model
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
this.defaultModel = 'claude-sonnet-4-6';
this.fallbackModel = 'claude-haiku-4-5';

  }
  // Sends a single prompt to Claude and returns the response.
  async generateResponse(prompt, options = {}) {
    try {
      const { 
        maxTokens = 2000, 
        model = this.defaultModel,
        temperature = 0.7,
        system = '' 
      } = options;
      // Log the prompt and API key (partially)
      console.log(`Sending request to Claude API with prompt: "${prompt.substring(0, 30)}..."`);
console.log("API key loaded:", !!this.apiKey);      // Build the request body for the Claude API
      const requestBody = {
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [{ role: 'user', content: prompt }]
      };

           // Add the system prompt if provided
      if (system && system.trim()) {
        requestBody.system = system;
      }

      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      const tryRequest = async (modelToUse) => {
  const body = { ...requestBody, model: modelToUse };

  return axios.post(this.apiUrl, body, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
      'anthropic-version': '2023-06-01'
    }
  });
};

let response;
try {
  console.log("Trying Sonnet");
  response = await tryRequest(model);
} catch (error) {
  const status = error.response?.status;
  console.log("Sonnet failed:", status);

if (status === 529 || status === 429 || status >= 500 || status === 408) {
  try {
    console.log("Retry Sonnet...");
    await new Promise(r => setTimeout(r, 1000));
    response = await tryRequest(model);
  } catch (error2) {
    const status2 = error2.response?.status;

    if (status2 === 529 || status2 === 429 || status2 >= 500 || status2 === 408) {
      console.log("Fallback to Haiku...");
      response = await tryRequest(this.fallbackModel);
    } else {
      throw error2;
    }
  }
} else {
  throw error;
}
}
        // Log success and return the API response
      console.log("Claude API response received successfully");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
          // Log and handle errors from the API call
      console.error('Error calling Claude API:', error.response?.data || error.message);
      console.error('Full error object:', error);
      return {
        success: false,
        error: error.response?.data || { error: error.message }
      };
    }
  }

   // Sends a multi-message chat (conversation history) to Claude and returns the response.
  async chat(messages, options = {}) {
    try {
      const { 
        maxTokens = 1000, 
        model = this.defaultModel,
        temperature = 0.7,
        system = '',// Optional system prompt
        taskType = 'general'
      } = options;

      console.log(`Sending chat request to Claude API with ${messages.length} messages`);
console.log("API key loaded:", !!this.apiKey);      // Build the request body for the Claude API
      const requestBody = {
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages
      };
     // Add the system prompt if provided
      if (system && system.trim()) {
        requestBody.system = system;
      }
     
      console.log("Chat request body:", JSON.stringify(requestBody, null, 2));
     const tryRequest = async (modelToUse) => {
  const extraFallbackSocraticRules =
    modelToUse === this.fallbackModel && taskType === 'socratic_chat'
          ? `
The student is NOT the character inside the scenario.
Do NOT speak as if the student personally experienced the situation.
The student only read the scenario and responded to it as part of a research study.
Return EXACTLY ONE short Socratic question.
Do not greet the student.
Do not write introductions, summaries, validations, or explanations.
Do not write more than one sentence.
The entire reply must be a single question only.
Do not include any text before or after the question.
The purpose of the question is to gently challenge and strengthen the student's CASEL-related thinking.
Focus naturally on one or more of these five areas when relevant:
- self-awareness
- self-management
- social awareness
- relationship skills
- responsible decision-making
Do not list these skills to the student.
Do not explain the skills.
Only ask one short reflective question that helps the student think more deeply.
`
      : '';

  const body = {
    ...requestBody,
    model: modelToUse,
    system: `${requestBody.system || ''}\n${extraFallbackSocraticRules}`.trim(),
  };

  return axios.post(this.apiUrl, body, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
      'anthropic-version': '2023-06-01'
    }
  });
};
let response;

// 🔁 ניסיון ראשון עם Sonnet
try {
  console.log("Trying Sonnet");
  response = await tryRequest(model);
} catch (error) {
  const status = error.response?.status;
  console.log("Sonnet failed:", status);

  // 🔁 retry אחד
if (status === 529 || status === 429 || status >= 500 || status === 408) {
  try {
    console.log("Retry Sonnet...");
    await new Promise(r => setTimeout(r, 1000));
    response = await tryRequest(model);
  } catch (error2) {
    const status2 = error2.response?.status;

    if (status2 === 529 || status2 === 429 || status2 >= 500 || status2 === 408) {
      console.log("Fallback to Haiku...");
      response = await tryRequest(this.fallbackModel);
    } else {
      throw error2;
    }
  }
} else {
  throw error;
}
}

      console.log("Claude API chat response received successfully");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error in Claude chat:', error.response?.data || error.message);
      console.error('Full error object:', error);
      return {
        success: false,
        error: error.response?.data || { error: error.message }
      };
    }
  }
}

module.exports = new ClaudeService();