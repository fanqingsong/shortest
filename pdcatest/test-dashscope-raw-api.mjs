const dashscopeApiKey = 'sk-8153cc338c3f414c836039a706a29361';

console.log('Testing DashScope raw API response format with tools...');

fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${dashscopeApiKey}`
  },
  body: JSON.stringify({
    model: 'qwen-plus',
    messages: [
      { role: 'user', content: 'Please call the test_tool with message "Hello"' }
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
.then(response => response.json())
.then(data => {
  console.log('Full response:', JSON.stringify(data, null, 2));

  // Check if there are tool calls
  if (data.choices && data.choices[0] && data.choices[0].message) {
    const message = data.choices[0].message;
    console.log('\n=== Message Analysis ===');
    console.log('Content:', message.content);
    console.log('Tool calls:', message.tool_calls);
    console.log('Finish reason:', data.choices[0].finish_reason);
  }
})
.catch(error => {
  console.error('Error:', error.message);
});
