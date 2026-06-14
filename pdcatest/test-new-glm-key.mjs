import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.ZHIPU_API_KEY;

console.log('=== 测试新的智谱 API Key ===\n');
console.log('新 API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');

if (!apiKey) {
  console.log('❌ 错误: ZHIPU_API_KEY 环境变量未设置');
  process.exit(1);
}

console.log('\n测试新的智谱 GLM API...');

try {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [
        { role: 'user', content: 'Hello, please respond with just "New API key working"' }
      ],
      max_tokens: 25
    })
  });

  console.log(`状态码: ${response.status}`);

  if (response.status === 200) {
    const data = await response.json();
    console.log('✅ 新的智谱 API Key 正常工作！');
    console.log(`响应: ${data.choices[0].message.content}`);
    console.log(`模型: ${data.model}`);
    console.log(`Token 使用: ${data.usage.total_tokens}`);
    console.log(`提示词 tokens: ${data.usage.prompt_tokens}`);
    console.log(`完成 tokens: ${data.usage.completion_tokens}`);
  } else if (response.status === 401) {
    console.log('❌ 新 API Key 无效或已过期');
    const error = await response.json();
    console.log(`错误: ${JSON.stringify(error, null, 2)}`);
  } else {
    const error = await response.text();
    console.log(`❌ API 错误 (${response.status}): ${error}`);
  }
} catch (error) {
  console.log('❌ 网络错误:', error.message);
}

console.log('\n=== 测试完成 ===');
