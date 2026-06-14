import { shortest } from "@antiwork/shortest";

// 使用环境变量中的测试凭据
shortest("使用 GLM 模型测试 localhost:5173 的登录和退出功能", {
  username: process.env.TEST_USERNAME,
  password: process.env.TEST_PASSWORD,
});
