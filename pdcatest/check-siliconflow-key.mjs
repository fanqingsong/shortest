import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.SILICONFLOW_API_KEY;
console.log('API Key from .env.local:');
console.log(apiKey ? `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}` : 'NOT FOUND');
console.log('Full key length:', apiKey ? apiKey.length : 0);

if (apiKey) {
  console.log('\nTesting API key...');
  fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      max_tokens: 10
    })
  })
  .then(response => {
    console.log('Status:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('Response:', text);
  })
  .catch(error => {
    console.log('Error:', error.message);
  });
}
