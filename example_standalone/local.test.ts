import { shortest } from "@antiwork/shortest";

shortest("打开测试页面并验证标题", {
  url: "file:///home/song/workspace/shortest_test/test-page.html",
  expectedTitle: "测试页面",
});
