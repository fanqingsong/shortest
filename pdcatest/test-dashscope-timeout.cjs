const fetch = require('node-fetch');

const dashscopeApiKey = process.env.DASHSCOPE_API_KEY || 'sk-8153cc338c3f414c836039a706a29361';

console.log('Testing DashScope API with tools (function calling)...');
console.time('API Response Time');

const startTime = Date.now();

fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${dashscopeApiKey}`
  },
  body: JSON.stringify({
    model: 'qwen-plus',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, please respond with just "Working"' }
    ],
    tools: [{
      type: 'function',
      function: {
        name: 'test_tool',
        description: 'A test tool',
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'A message'
            }
          },
          required: ['message']
        }
      }
    }]
  })
})
.then(response => {
  console.log('Response status:', response.status);
  const responseTime = Date.now() - startTime;
  console.log('Response time:', responseTime, 'ms');
  console.timeEnd('API Response Time');
  return response.json();
})
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error.message);
  console.timeEnd('API Response Time');
});
