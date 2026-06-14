import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const baseURL = "https://dcmc-openai-ins-kenneth.openai.azure.com/";

console.log('=== Azure OpenAI 诊断测试 ===\n');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');
console.log('Base URL:', baseURL);

if (!apiKey) {
  console.log('❌ 错误: AZURE_OPENAI_API_KEY 环境变量未设置');
  process.exit(1);
}

console.log('\n测试 Azure OpenAI API...');

try {
  const response = await fetch(`${baseURL}openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-01`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Hello, please respond with just "Azure OpenAI working"' }
      ],
      max_tokens: 20
    })
  });

  console.log(`状态码: ${response.status}`);

  if (response.status === 200) {
    const data = await response.json();
    console.log('✅ Azure OpenAI API 正常工作！');
    console.log(`响应: ${data.choices[0].message.content}`);
    console.log(`模型: ${data.model}`);
    console.log(`Token 使用: ${data.usage.total_tokens} tokens`);
  } else if (response.status === 401) {
    console.log('❌ API Key 无效或未授权');
    const error = await response.text();
    console.log(`错误详情: ${error}`);
  } else {
    const error = await response.text();
    console.log(`❌ API 错误 (${response.status}): ${error}`);
  }
} catch (error) {
  console.log('❌ 网络错误:', error.message);
}

console.log('\n=== 诊断完成 ===');
