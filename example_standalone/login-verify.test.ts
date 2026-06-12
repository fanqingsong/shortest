import { shortest } from "@antiwork/shortest";

const username = process.env.TEST_USERNAME || "admin@example.com";
const password = process.env.TEST_PASSWORD || "changethis";

// 登录后通过 URL 和页面内容验证是否真正进入系统
shortest(
  "Type the username into the Email Address field, type the password into the Password field, then click the Sign In button",
  {
    username,
    password,
  },
).after(async ({ page }) => {
  // Hash-router SPA: pathname stays "/" — wait for hash to leave #login
  await page.waitForFunction(
    () => !window.location.hash.includes("login"),
    { timeout: 30_000 },
  );
  await page.getByText("Dashboard", { exact: false }).first().waitFor({
    timeout: 15_000,
  });

  const { url, title, bodyText } = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    bodyText: document.body.innerText,
  }));

  const isLoggedIn =
    url.includes("#dashboard") &&
    bodyText.includes("Dashboard") &&
    !url.includes("#login");

  console.log("登录验证结果:", { isLoggedIn, url, title });

  if (!isLoggedIn) {
    throw new Error(
      `登录验证失败：URL=${url}, title=${title}，未找到登录后的页面特征`,
    );
  }
});
