import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const dashscopeApiKey = 'sk-8153cc338c3f414c836039a706a29361';

console.log('Testing Vercel AI SDK with DashScope and function calling...');

const dashscope = createOpenAI({
  apiKey: dashscopeApiKey,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

console.log('Client created, testing with tools...');

const tools = {
  test_tool: {
    description: 'A simple test tool',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'A test message',
        },
      },
      required: ['message'],
    },
  },
};

try {
  console.log('Calling generateText with tools...');
  const result = await generateText({
    model: dashscope('qwen-plus'),
    prompt: 'Please call the test_tool with message "Hello from DashScope"',
    maxTokens: 100,
    tools,
    temperature: 0.7,
    maxRetries: 2,
  });

  console.log('✅ Success!');
  console.log('Response:', result.text);
  console.log('Tool calls:', result.toolCalls);
  console.log('Finish reason:', result.finishReason);
  console.log('Usage:', result.usage);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Full error:', JSON.stringify(error, null, 2));
}
