// 测试 @ai-sdk/openai 与 GLM 的集成
const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');
const path = require('path');

// 加载环境变量
const fs = require('fs');
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      process.env[key] = value;
    }
  });

console.log('🔍 测试 AI SDK 与 GLM 集成\n');

const apiKey = process.env.ZHIPU_API_KEY || process.env.SHORTEST_GLM_API_KEY;
if (!apiKey) {
  console.log('❌ API Key 未配置');
  process.exit(1);
}

console.log('✅ API Key 已配置');
console.log('   Key:', apiKey.substring(0, 10) + '...');

async function testGLMIntegration() {
  try {
    console.log('\n🧪 测试 @ai-sdk/openai + GLM 集成...');

    // 创建 OpenAI 客户端配置 GLM
    const glm = createOpenAI({
      apiKey: apiKey,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
    });

    console.log('✅ OpenAI 客户端创建成功');
    console.log('   Base URL: https://open.bigmodel.cn/api/paas/v4/');

    // 测试模型调用
    console.log('\n🤖 测试模型调用...');
    const result = await generateText({
      model: glm('glm-4-flash'),
      messages: [
        { role: 'user', content: '你好，请用一句话介绍你自己' }
      ],
      maxTokens: 100,
    });

    console.log('✅ 模型调用成功！');
    console.log('\n📄 响应:');
    console.log(result.text);
    console.log('\n📊 Token 使用:');
    console.log('   输入 tokens:', result.usage.promptTokens);
    console.log('   输出 tokens:', result.usage.completionTokens);
    console.log('   总计 tokens:', result.usage.totalTokens);

    console.log('\n✅ AI SDK + GLM 集成测试通过！');
    console.log('✅ shortest 框架应该可以正常使用 GLM');

  } catch (error) {
    console.error('\n❌ AI SDK 测试失败:', error.message);
    console.error('错误详情:', error);
    throw error;
  }
}

testGLMIntegration().then(() => {
  console.log('\n🎉 测试完成！');
  process.exit(0);
}).catch((error) => {
  console.log('\n💥 测试失败！');
  process.exit(1);
});
