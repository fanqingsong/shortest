import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const dashscopeApiKey = 'sk-8153cc338c3f414c836039a706a29361';

console.log('Testing Vercel AI SDK with DashScope directly...');

const dashscope = createOpenAI({
  apiKey: dashscopeApiKey,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

console.log('Client created, testing generateText...');

try {
  const result = await generateText({
    model: dashscope('qwen-plus'),
    prompt: 'Hello, please respond with just "AI SDK working"',
    maxTokens: 100,
  });

  console.log('✅ Success!');
  console.log('Response:', result.text);
  console.log('Usage:', result.usage);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Full error:', error);
}
