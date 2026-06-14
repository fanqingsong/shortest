import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: true,
  baseUrl: "http://localhost:8085",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "glm",
    model: "glm-5.1",
    baseURL: "https://open.bigmodel.cn/api/coding/paas/v4/",
  },
} satisfies ShortestConfig;
