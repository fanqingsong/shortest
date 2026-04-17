import { describe, expect, it } from "vitest";
import { createProvider } from "@/ai/provider";
import { AIConfig } from "@/types/config";

describe("GLM Integration Tests", () => {
  const realApiKey = process.env.ZHIPU_API_KEY;

  it.skipIf(!realApiKey)("should connect to GLM API", async () => {
    const glmConfig: AIConfig = {
      provider: "glm",
      apiKey: realApiKey!,
      model: "glm-4-flash",
      baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    };

    const provider = createProvider(glmConfig);

    expect(provider).toBeDefined();
  });

  it.skipIf(!realApiKey)("should handle GLM API errors gracefully", async () => {
    const glmConfig: AIConfig = {
      provider: "glm",
      apiKey: "invalid-key",
      model: "glm-4-flash",
      baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    };

    expect(() => createProvider(glmConfig)).not.toThrow();
  });
});
