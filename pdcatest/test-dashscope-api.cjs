const dashscopeApiKey = process.env.DASHSCOPE_API_KEY || 'sk-8153cc338c3f414c836039a706a29361';

console.log('Testing DashScope API...');
console.log('API Key:', dashscopeApiKey.substring(0, 10) + '...');

fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${dashscopeApiKey}`
  },
  body: JSON.stringify({
    model: 'qwen-plus',
    messages: [
      { role: 'user', content: 'Hello, can you respond with just "API working"?' }
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
