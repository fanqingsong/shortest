import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.SILICONFLOW_API_KEY;
console.log('=== 硅基流动诊断测试 ===\n');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');

if (!apiKey) {
  console.log('❌ 错误: SILICONFLOW_API_KEY 环境变量未设置');
  console.log('\n请确保在 .env.local 文件中设置了:');
  console.log('SILICONFLOW_API_KEY=sk-your-actual-key-here');
  process.exit(1);
}

console.log('\n测试1: 检查API Key有效性...');
try {
  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        { role: 'user', content: 'Hi' }
      ],
      max_tokens: 10
    })
  });

  console.log(`状态码: ${response.status}`);

  if (response.status === 200) {
    const data = await response.json();
    console.log('✅ API Key 有效！');
    console.log(`响应: ${data.choices[0].message.content}`);
  } else if (response.status === 401) {
    const error = await response.json();
    console.log('❌ API Key 无效');
    console.log(`错误: ${JSON.stringify(error, null, 2)}`);
  } else if (response.status === 403) {
    const error = await response.json();
    console.log('❌ 账户余额不足或权限问题');
    console.log(`错误: ${JSON.stringify(error, null, 2)}`);
    console.log('\n解决方案:');
    console.log('1. 访问 https://siliconflow.cn 充值账户');
    console.log('2. 检查账户状态和余额');
    console.log('3. 确认API Key权限');
  } else {
    const error = await response.text();
    console.log(`❌ 未知错误: ${error}`);
  }
} catch (error) {
  console.log('❌ 网络错误:', error.message);
}

console.log('\n测试2: 尝试不同的模型...');
const models = [
  'Qwen/Qwen2.5-7B-Instruct',
  'THUDM/glm-4-9b-chat'
];

for (const model of models) {
  console.log(`\n测试模型: ${model}`);
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 5
      })
    });

    if (response.status === 200) {
      console.log(`✅ ${model} 可用`);
      break;
    } else {
      console.log(`❌ ${model} 状态: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ${model} 错误: ${error.message}`);
  }
}

console.log('\n=== 诊断完成 ===');
