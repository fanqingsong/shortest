import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.ZHIPU_API_KEY;

console.log('=== 测试 Tuple 类型问题 ===\n');

const glm = createOpenAI({
  apiKey: apiKey,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
});

console.log('1. 测试包含 tuple 的工具...');
try {
  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: '请调用coordinate_tool，传入坐标[100, 200]',
    maxTokens: 50,
    tools: {
      coordinate_tool: {
        description: '坐标工具',
        parameters: z.object({
          action: z.enum(['click', 'move']),
          position: z.tuple([z.number(), z.number()]),
        }),
      },
    },
  });

  console.log('✅ Tuple工具成功!');
  console.log(`响应: ${result.text}`);
  console.log(`工具调用: ${JSON.stringify(result.toolCalls)}`);
} catch (error) {
  console.log('❌ Tuple工具失败:', error.message);
  console.log('错误详情:', error.cause || error);
}

console.log('\n2. 测试使用数组代替tuple...');
try {
  const result = await generateText({
    model: glm('glm-4.7-flash'),
    prompt: '请调用array_tool，传入坐标[100, 200]',
    maxTokens: 50,
    tools: {
      array_tool: {
        description: '数组工具',
        parameters: z.object({
          action: z.enum(['click', 'move']),
          position: z.array(z.number()).length(2),
        }),
      },
    },
  });

  console.log('✅ 数组工具成功!');
  console.log(`响应: ${result.text}`);
  console.log(`工具调用: ${JSON.stringify(result.toolCalls)}`);
} catch (error) {
  console.log('❌ 数组工具失败:', error.message);
  console.log('错误详情:', error.cause || error);
}

console.log('\n=== 测试完成 ===');
