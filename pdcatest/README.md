# PDCATEST - SiliconFlow 硅基流动测试

使用本地修改后的 shortest 测试硅基流动平台的多模型支持。

## 测试环境

- **测试网址**: http://localhost:5173/
- **测试账号**: admin@example.colm / changethis
- **AI 平台**: 硅基流动
- **测试功能**: 用户登录和退出

## 配置说明

### 1. 设置 SiliconFlow API Key

编辑 `.env.local` 文件，填入您的 SiliconFlow API Key：

```bash
SILICONFLOW_API_KEY=your_actual_siliconflow_api_key_here
```

获取 API Key：https://siliconflow.cn/account/ak

### 2. 配置文件

`shortest.config.ts` 已配置：
- **Provider**: `siliconflow`
- **Model**: `deepseek-ai/DeepSeek-V3` (默认)
- **Base URL**: https://api.siliconflow.cn/v1 (自动配置)

### 3. 测试凭据

测试账号已在 `.env.local` 中配置：
```bash
TEST_USERNAME=admin@example.colm
TEST_PASSWORD=changethis
```

## 运行测试

### 方式 1: 运行所有测试

```bash
cd /home/fqs/workspace/self/shortest/pdcatest
node ../packages/shortest/dist/cli/bin.js
```

### 方式 2: 运行特定测试文件

```bash
# 简单测试
node ../packages/shortest/dist/cli/bin.js app/simple-glm-test.test.ts

# 登录退出测试
node ../packages/shortest/dist/cli/bin.js app/login-logout.test.ts
```

### 方式 3: 使用 pnpm（如果已完成构建）

```bash
cd /home/fqs/workspace/self/shortest/pdcatest
pnpm shortest
```

## 测试文件说明

### `app/simple-glm-test.test.ts`
简单的 GLM 模型测试，测试基本的登录退出功能。

### `app/login-logout.test.ts`
包含三个测试用例：
1. 登录功能测试
2. 退出功能测试
3. 完整登录退出流程测试

## 测试流程

AI 将自动执行以下步骤：

1. **访问应用**: 打开 http://localhost:5173/
2. **查找登录**: 定位登录按钮或链接
3. **输入凭据**: 输入邮箱和密码
4. **提交登录**: 点击登录按钮
5. **验证登录**: 检查登录成功的标识
6. **测试退出**: 点击退出按钮
7. **验证退出**: 确认退出成功

## 目录结构

```
pdcatest/
├── shortest.config.ts          # GLM 配置
├── .env.local                  # 环境变量
├── README.md                   # 说明文档
└── app/
    ├── simple-glm-test.test.ts     # 简单测试
    └── login-logout.test.ts        # 登录退出测试
```

## 可用的模型

修改 `shortest.config.ts` 中的 `model` 字段来切换模型：

### DeepSeek 系列 (推荐)
- `deepseek-ai/DeepSeek-V3` - DeepSeek V3 模型 (默认)
- `deepseek-ai/DeepSeek-R1` - DeepSeek R1 推理模型
- `Pro/deepseek-ai/DeepSeek-V3` - DeepSeek V3 专业版
- `Pro/deepseek-ai/DeepSeek-R1` - DeepSeek R1 专业版

### Qwen 系列
- `Qwen/Qwen2.5-72B-Instruct` - Qwen2.5 72B 模型
- `Qwen/Qwen2.5-7B-Instruct` - Qwen2.5 7B 模型
- `Qwen/Qwen2-72B-Instruct` - Qwen2 72B 模型
- `Qwen/Qwen2-7B-Instruct` - Qwen2 7B 模型

### GLM 系列
- `THUDM/glm-4-9b-chat` - GLM-4 9B 对话模型
- `THUDM/GLM-Z1-9B-0414` - GLM-Z1 9B 模型

### 其他流行模型
- `meta-llama/Llama-3.1-70B-Instruct` - Llama 3.1 70B
- `meta-llama/Llama-3.1-8B-Instruct` - Llama 3.1 8B
- `mistralai/Mistral-7B-Instruct-v0.3` - Mistral 7B
- `01-ai/Yi-1.5-34B-Chat` - Yi 1.5 34B

## 前置要求

1. ✅ SiliconFlow API Key 已配置
2. ✅ 测试应用运行在 http://localhost:5173/
3. ✅ SiliconFlow Provider 实现完成

**注意**: 确保您已申请并配置了硅基流动平台的 API Key。

## 平台优势

硅基流动提供：
- 🚀 **100+ 大模型**：支持 DeepSeek、Qwen、GLM、Llama 等主流模型
- 💰 **按量付费**：无需预付，按实际使用量计费
- ⚡ **高性能**：优化的推理速度
- 🔧 **OpenAI 兼容**：无缝迁移现有代码

更多信息请访问：https://siliconflow.cn
