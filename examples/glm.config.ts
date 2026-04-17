import type { ShortestConfig } from "@antiwork/shortest";

/**
 * Example configuration for using GLM models with Shortest
 *
 * Setup:
 * 1. Set ZHIPU_API_KEY environment variable
 * 2. Copy this file to your project root as shortest.config.ts
 * 3. Run tests with: pnpm shortest
 */
export default {
  headless: true,
  baseUrl: "http://localhost:3000",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "glm",
    model: "glm-4-flash", // Faster for testing
  },
  browser: {
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
} satisfies ShortestConfig;
