import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const baseURL = "https://dcmc-openai-ins-kenneth.openai.azure.com/";

console.log('=== Azure OpenAI + Vercel AI SDK 集成测试 ===\n');

console.log('1. 创建 Azure OpenAI 客户端...');
const azure = createOpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
});

console.log('2. 测试简单文本生成...');
try {
  const result = await generateText({
    model: azure('gpt-4o-mini'),
    prompt: 'Hello, please respond with just "SDK working"',
    maxTokens: 20,
  });

  console.log('✅ 文本生成成功！');
  console.log(`响应: ${result.text}`);
  console.log(`Token 使用: ${result.usage.totalTokens}`);
} catch (error) {
  console.log('❌ 文本生成失败:', error.message);
  console.log('错误详情:', error);
  process.exit(1);
}

console.log('\n3. 测试工具调用...');
try {
  const result = await generateText({
    model: azure('gpt-4o-mini'),
    prompt: '请调用test_tool工具，参数为message: "Hello from Azure"',
    maxTokens: 100,
    tools: {
      test_tool: {
        description: 'A test tool',
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
    },
  });

  console.log('✅ 工具调用测试完成！');
  console.log(`响应: ${result.text}`);
  console.log(`工具调用: ${result.toolCalls ? JSON.stringify(result.toolCalls) : '无'}`);
  console.log(`完成原因: ${result.finishReason}`);
} catch (error) {
  console.log('❌ 工具调用失败:', error.message);
  console.log('错误详情:', JSON.stringify(error, null, 2));
}

console.log('\n=== 集成测试完成 ===');
