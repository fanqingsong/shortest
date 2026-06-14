import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.ZHIPU_API_KEY;

console.log('=== 智谱 GLM + Vercel AI SDK 集成诊断 ===\n');

console.log('1. 测试简单文本生成...');
try {
  const glm = createOpenAI({
    apiKey: apiKey,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  });

  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: 'Hello, please respond with just "SDK working"',
    maxTokens: 20,
  });

  console.log('✅ 简单文本生成成功！');
  console.log(`响应: ${result.text}`);
  console.log(`Token 使用: ${result.usage.totalTokens}`);
} catch (error) {
  console.log('❌ 简单文本生成失败:', error.message);
  console.log('错误详情:', error);
  process.exit(1);
}

console.log('\n2. 测试工具调用...');
try {
  const glm = createOpenAI({
    apiKey: apiKey,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  });

  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: '请调用test_tool工具，参数为message: "Hello from GLM SDK"',
    maxTokens: 100,
    temperature: 0.7,
    maxRetries: 2,
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

console.log('\n3. 测试复杂工具调用（浏览器自动化类型）...');
try {
  const glm = createOpenAI({
    apiKey: apiKey,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  });

  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: '我需要访问一个网页，请帮我制定一个简单的计划',
    maxTokens: 200,
    temperature: 0.7,
    tools: {
      browser_action: {
        description: '浏览器操作工具',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              description: '要执行的操作',
              enum: ['navigate', 'click', 'type', 'screenshot'],
            },
            target: {
              type: 'string',
              description: '操作目标',
            },
          },
          required: ['action'],
        },
      },
      page_analysis: {
        description: '页面分析工具',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: '要分析的页面URL',
            },
          },
          required: ['url'],
        },
      },
    },
  });

  console.log('✅ 复杂工具调用测试完成！');
  console.log(`响应: ${result.text}`);
  console.log(`完成原因: ${result.finishReason}`);
} catch (error) {
  console.log('❌ 复杂工具调用失败:', error.message);
}

console.log('\n=== 诊断完成 ===');
