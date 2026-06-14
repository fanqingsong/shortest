import { shortest } from "@antiwork/shortest";

// 测试登录功能
shortest("用户可以使用邮箱和密码登录系统", {
  username: "admin@example.colm",
  password: "changethis",
});

// 测试退出功能
shortest("用户登录后可以成功退出系统");

// 测试完整的登录退出流程
shortest([
  "用户可以使用邮箱和密码登录系统",
  "用户登录后可以成功退出系统",
]);
