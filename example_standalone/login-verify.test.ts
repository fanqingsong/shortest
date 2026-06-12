import { shortest } from "@antiwork/shortest";

const username = process.env.TEST_USERNAME || "admin@example.com";
const password = process.env.TEST_PASSWORD || "changethis";

// 登录后通过 URL 和页面内容验证是否真正进入系统
shortest("输入用户名和密码，然后点击登录按钮", {
  username,
  password,
}).after(async ({ page }) => {
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });
  // SPA 登录后需等待侧边栏渲染出当前用户邮箱
  await page.getByText(username, { exact: false }).first().waitFor({
    timeout: 15_000,
  });

  const { url, title, bodyText } = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    bodyText: document.body.innerText,
  }));

  const isLoggedIn =
    !url.includes("/login") &&
    bodyText.includes(username) &&
    bodyText.includes("Agent Hub");

  console.log("登录验证结果:", { isLoggedIn, url, title });

  if (!isLoggedIn) {
    throw new Error(
      `登录验证失败：URL=${url}, title=${title}，未找到登录后的页面特征`,
    );
  }
});
