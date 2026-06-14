import { shortest } from "@antiwork/shortest";

shortest("使用 GLM 模型测试用户登录和退出功能", {
  username: "admin@example.colm",
  password: "changethis",
});

// 测试流程说明：
// 1. 访问 http://localhost:5173/
// 2. 找到登录按钮并点击
// 3. 输入邮箱 admin@example.colm
// 4. 输入密码 changethis
// 5. 点击登录按钮
// 6. 验证登录成功
// 7. 测试退出功能
// 8. 验证退出成功
