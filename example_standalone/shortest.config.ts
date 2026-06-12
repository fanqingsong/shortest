import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: false,
  baseUrl: "http://101.132.253.246:5173",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "glm",
    model: "glm-5.1",
    baseURL: "https://open.bigmodel.cn/api/paas/v4/",
  },
} satisfies ShortestConfig;
