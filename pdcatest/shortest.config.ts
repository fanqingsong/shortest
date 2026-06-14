import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: false,
  baseUrl: "http://localhost:5173",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "glm",
    model: "glm-4.7-flash",
    apiKey: process.env.ZHIPU_API_KEY || process.env.SHORTEST_GLM_API_KEY,
  },
  mailosaur: {
    apiKey: process.env.MAILOSAUR_API_KEY || "dummy-key",
    serverId: process.env.MAILOSAUR_SERVER_ID || "dummy-server-id",
  },
  browser: {
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
} satisfies ShortestConfig;
