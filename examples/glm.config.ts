import type { ShortestConfig } from "@antiwork/shortest";

/**
 * Example configuration for using GLM models with Shortest
 *
 * Setup:
 * 1. Set ZHIPU_API_KEY environment variable
 * 2. Copy this file to your project root as shortest.config.ts
 * 3. Run tests with: pnpm shortest
 *
 * Available GLM models:
 * - glm-5.1, glm-5.1-plus, glm-5.1-air, glm-5.1-flash (GLM 5.x Series - Latest)
 * - glm-4-plus, glm-4-0520, glm-4, glm-4-air, glm-4-flash (GLM 4.x Series)
 * - glm-4.7-flash, glm-4.6v-flash (GLM 4.x Flash Series)
 * - glm-3-turbo (GLM 3.x Series)
 */
export default {
  headless: true,
  baseUrl: "http://localhost:3000",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "glm",
    model: "glm-5.1-flash", // Latest GLM 5.x flash model for fast testing
  },
  browser: {
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
} satisfies ShortestConfig;
