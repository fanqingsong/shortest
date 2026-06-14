// GLM API 连接调试脚本
const https = require('https');

console.log('🔍 GLM API 连接诊断\n');

const apiKey = process.env.ZHIPU_API_KEY || process.env.SHORTEST_GLM_API_KEY;
if (!apiKey) {
  console.log('❌ API Key 未配置');
  process.exit(1);
}

console.log('✅ API Key 已配置');
console.log('   Key:', apiKey.substring(0, 10) + '...');

// 测试 GLM API 连接
const testData = {
  model: "glm-4-flash",
  messages: [
    {
      role: "user",
      content: "你好，这是一个测试消息"
    }
  ]
};

const options = {
  hostname: 'open.bigmodel.cn',
  port: 443,
  path: '/api/paas/v4/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
};

console.log('\n🌐 测试 GLM API 连接...');
console.log('   Host: open.bigmodel.cn');
console.log('   Path: /api/paas/v4/chat/completions');
console.log('   Model: glm-4-flash');

const req = https.request(options, (res) => {
  console.log(`\n📡 响应状态码: ${res.statusCode}`);
  console.log('📋 响应头:', JSON.stringify(res.headers, null, 2));

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📄 响应内容:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));

      if (res.statusCode === 200) {
        console.log('\n✅ GLM API 连接成功！');
        console.log('✅ API Key 有效');
        console.log('✅ 模型可用');
      } else {
        console.log(`\n❌ API 错误: ${res.statusCode}`);
        if (jsonData.error) {
          console.log(`   错误信息: ${jsonData.error.message || JSON.stringify(jsonData.error)}`);
        }
      }
    } catch (e) {
      console.log('原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ 连接错误:', error.message);
  console.error('   错误详情:', error);
});

req.write(JSON.stringify(testData));
req.end();
