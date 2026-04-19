import type { ShortestConfig } from "@antiwork/shortest";

/**
 * Example configuration for using Azure OpenAI models with Shortest
 *
 * Setup:
 * 1. Set AZURE_OPENAI_API_KEY environment variable
 * 2. Set your Azure OpenAI endpoint URL below
 * 3. Copy this file to your project root as shortest.config.ts
 * 4. Run tests with: pnpm shortest
 *
 * Azure OpenAI Service requirements:
 * - Azure OpenAI resource deployed in your Azure account
 * - GPT-4 model deployed (e.g., gpt-4o, gpt-4-turbo)
 * - API key from Azure portal
 *
 * Endpoint format: https://{resource-name}.openai.azure.com/openai/deployments/{deployment-name}
 */
export default {
  headless: true,
  baseUrl: "http://localhost:3000",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "azure",
    model: "gpt-4o", // Available: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4
    baseURL: "https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name",
  },
  browser: {
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
} satisfies ShortestConfig;
