const dashscopeApiKey = process.env.SILICONFLOW_API_KEY || 'sk-your-api-key-here';

console.log('Testing SiliconFlow API...');
console.log('API Key:', dashscopeApiKey.substring(0, 10) + '...');

fetch('https://api.siliconflow.cn/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${dashscopeApiKey}`
  },
  body: JSON.stringify({
    model: 'deepseek-ai/DeepSeek-V3',
    messages: [
      { role: 'user', content: 'Hello, can you respond with just "SiliconFlow API working"?' }
    ]
  })
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response data:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error.message);
});
