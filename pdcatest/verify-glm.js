// 简单的 GLM 配置验证脚本
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 验证 GLM 配置集成...\n');

// 1. 验证配置文件存在
const configPath = join(process.cwd(), 'shortest.config.ts');
console.log('📁 配置文件:', configPath);
try {
  const configContent = readFileSync(configPath, 'utf-8');
  if (configContent.includes('provider: "glm"')) {
    console.log('✅ GLM provider 配置正确');
  } else {
    console.log('❌ GLM provider 配置缺失');
    process.exit(1);
  }

  if (configContent.includes('glm-4-flash')) {
    console.log('✅ GLM 模型配置正确');
  } else {
    console.log('❌ GLM 模型配置缺失');
    process.exit(1);
  }

  if (configContent.includes('localhost:5173')) {
    console.log('✅ Base URL 配置正确');
  } else {
    console.log('❌ Base URL 配置缺失');
    process.exit(1);
  }

} catch (error) {
  console.log('❌ 配置文件读取失败:', error.message);
  process.exit(1);
}

// 2. 验证环境变量
console.log('\n🔑 环境变量检查:');
const glmKey = process.env.ZHIPU_API_KEY || process.env.SHORTEST_GLM_API_KEY;
if (glmKey) {
  console.log('✅ GLM API Key 已配置');
  console.log('   Key 长度:', glmKey.length);
} else {
  console.log('❌ GLM API Key 未配置');
  process.exit(1);
}

// 3. 验证构建的包
console.log('\n📦 构建包检查:');
const packagePath = join(process.cwd(), '../packages/shortest/dist/index.js');
try {
  readFileSync(packagePath, 'utf-8');
  console.log('✅ shortest 包已构建');
} catch (error) {
  console.log('❌ shortest 包构建缺失');
  process.exit(1);
}

console.log('\n🎉 GLM 集成验证通过！');
console.log('\n✅ 所有配置正确，可以运行测试');
console.log('\n🚀 运行测试命令:');
console.log('   node ../packages/shortest/dist/cli/bin.js app/simple-glm-test.test.ts');
