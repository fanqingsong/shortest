import { shortest } from "@antiwork/shortest";

// 示例测试：使用自然语言描述测试场景
// shortest("访问首页并检查页面标题", {
//   expectedTitle: "首页",
// });

// 你可以添加更多测试
shortest("输入用户名和密码，然后点击登录按钮", {
  username: process.env.TEST_USERNAME || "test@example.com",
  password: process.env.TEST_PASSWORD || "password123",
});
