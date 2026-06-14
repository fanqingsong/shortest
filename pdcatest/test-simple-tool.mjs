import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.ZHIPU_API_KEY;

console.log('=== 测试简化的工具定义 ===\n');

const glm = createOpenAI({
  apiKey: apiKey,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
});

console.log('1. 测试最简单的工具...');
try {
  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: '请调用simple_tool',
    maxTokens: 50,
    tools: {
      simple_tool: {
        description: '简单工具',
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '消息',
            },
          },
          required: ['message'],
        },
      },
    },
  });

  console.log('✅ 简单工具成功!');
  console.log(`响应: ${result.text}`);
  console.log(`工具调用: ${JSON.stringify(result.toolCalls)}`);
} catch (error) {
  console.log('❌ 简单工具失败:', error.message);
}

console.log('\n2. 测试使用zod的工具...');
try {
  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: '请调用zod_tool',
    maxTokens: 50,
    tools: {
      zod_tool: {
        description: 'Zod工具',
        parameters: z.object({
          message: z.string(),
        }),
      },
    },
  });

  console.log('✅ Zod工具成功!');
  console.log(`响应: ${result.text}`);
  console.log(`工具调用: ${JSON.stringify(result.toolCalls)}`);
} catch (error) {
  console.log('❌ Zod工具失败:', error.message);
  console.log('错误详情:', error.cause || error);
}

console.log('\n3. 测试复杂的嵌套工具...');
try {
  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: '请调用complex_tool',
    maxTokens: 50,
    tools: {
      complex_tool: {
        description: '复杂工具',
        parameters: z.object({
          action: z.enum(['click', 'type', 'wait']),
          target: z.string().optional(),
          text: z.string().optional(),
        }),
      },
    },
  });

  console.log('✅ 复杂工具成功!');
  console.log(`响应: ${result.text}`);
  console.log(`工具调用: ${JSON.stringify(result.toolCalls)}`);
} catch (error) {
  console.log('❌ 复杂工具失败:', error.message);
  console.log('错误详情:', error.cause || error);
}

console.log('\n=== 测试完成 ===');
