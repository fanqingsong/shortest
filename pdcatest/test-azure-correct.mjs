import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.AZURE_OPENAI_API_KEY;

console.log('=== 测试正确的 Azure OpenAI 配置 ===\n');

// Azure OpenAI 需要特殊的 baseURL 格式
const baseURL = "https://dcmc-openai-ins-kenneth.openai.azure.com/openai/deployments/gpt-4o-mini";

console.log('方法1: 使用完整 deployment 路径');
try {
  const azure = createOpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const result = await generateText({
    model: azure('gpt-4o-mini'), // 这里可能不需要再次指定模型名
    prompt: 'Hello',
    maxTokens: 10,
  });

  console.log('✅ 方法1成功:', result.text);
} catch (error) {
  console.log('❌ 方法1失败:', error.message);
}

console.log('\n方法2: 使用 baseURL + fetch API');
try {
  const response = await fetch(`${baseURL}/chat/completions?api-version=2024-02-01`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    })
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ 方法2成功:', data.choices[0].message.content);
  } else {
    console.log('❌ 方法2失败:', response.status, await response.text());
  }
} catch (error) {
  console.log('❌ 方法2失败:', error.message);
}
