import { shortest } from "@antiwork/shortest";

// 使用回调函数验证登录是否真的成功
shortest("输入用户名和密码，然后点击登录按钮", {
  username: process.env.TEST_USERNAME,
  password: process.env.TEST_PASSWORD,
}).after(async ({ page }) => {
  // 验证登录后页面是否包含特定元素
  const isLoggedIn = await page.evaluate(() => {
    // 检查页面是否有登录后的元素（比如用户名、登出按钮等）
    // 根据你的网站调整这个选择器
    return document.body.includes("欢迎") ||
           document.body.includes("用户") ||
           document.querySelector(".user-info") !== null ||
           document.querySelector("[class*='logout']") !== null;
  });

  console.log("登录验证结果:", isLoggedIn);

  if (!isLoggedIn) {
    throw new Error("登录验证失败：未找到登录后的页面元素");
  }
});
