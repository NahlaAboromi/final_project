const axios = require('axios');
const path = require('path');

const dotenvPath = path.resolve(process.cwd(), '.env');
require('dotenv').config({ path: dotenvPath });

const apiKey = process.env.ANTHROPIC_API_KEY;
const apiUrl = 'https://api.anthropic.com/v1/messages';

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

async function testModel(modelName) {
  try {
    console.log(`\n==============================`);
    console.log(`Testing model: ${modelName}`);
    console.log(`==============================`);

    const requestBody = {
      model: modelName,
      max_tokens: 100,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: 'Say only: test success'
        }
      ]
    };

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000
    });

    console.log(`SUCCESS for ${modelName}`);
    console.log('Status:', response.status);
    console.log('Response text:', response.data?.content?.[0]?.text || 'No text');
    return true;
  } catch (error) {
    console.log(`FAILED for ${modelName}`);
    console.log('HTTP Status:', error.response?.status || 'No status');
    console.log('Error data:', JSON.stringify(error.response?.data || error.message, null, 2));
    return false;
  }
}

async function run() {
  await testModel('claude-sonnet-4-6');
  await testModel('claude-haiku-4-5');
  await testModel('claude-opus-4-6');
}

run();