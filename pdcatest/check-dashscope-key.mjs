import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.DASHSCOPE_API_KEY;
console.log('DASHSCOPE_API_KEY from .env.local:');
console.log(apiKey ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}` : 'NOT FOUND');
console.log('Full key length:', apiKey ? apiKey.length : 0);

if (apiKey) {
  console.log('\nTesting DashScope API key...');
  fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'user', content: 'Hello, please respond with just "API working"' }
      ],
      max_tokens: 20
    })
  })
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.choices && data.choices[0]) {
      console.log('\n✅ DashScope API is working!');
      console.log('Response:', data.choices[0].message.content);
    }
  })
  .catch(error => {
    console.log('Error:', error.message);
  });
}
