import path from "node:path";
import { shortest } from "@antiwork/shortest";

shortest("打开测试页面并验证标题", {
  url: `file://${path.join(process.cwd(), "test-page.html")}`,
  expectedTitle: "测试页面",
});
