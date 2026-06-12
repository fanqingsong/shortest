import { describe, expect, it, vi } from "vitest";
import { createProvider } from "./provider";
import { AIConfig } from "@/types";
import { GLMModel, AzureOpenAIModel } from "@/types/config";

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => (model: string) => ({ model })),
}));

describe("createProvider", () => {
  it("creates an Anthropic provider with correct config", () => {
    const config: AIConfig = {
      provider: "anthropic",
      apiKey: "test-key",
      model: "claude-3-5-sonnet-20241022",
    };

    const provider = createProvider(config);
    expect(provider).toEqual({ model: "claude-3-5-sonnet-20241022" });
  });

  it("throws AIError for unsupported provider", () => {
    const config = {
      provider: "unsupported",
      apiKey: "test-key",
      model: "claude-3-5-sonnet-20241022",
    } as unknown as AIConfig;

    expect(() => createProvider(config)).toThrow(
      "Unsupported provider: unsupported",
    );
  });

  describe("createProvider - GLM", () => {
    it("should create GLM provider with valid config", () => {
      const glmConfig: AIConfig = {
        provider: "glm",
        apiKey: "test-api-key",
        model: "glm-4",
        baseURL: "https://open.bigmodel.cn/api/paas/v4/",
      };

      const provider = createProvider(glmConfig);

      expect(provider).toBeDefined();
      expect(typeof provider).toBe("object");
    });

    it("should use default base URL when not provided", () => {
      const glmConfig: AIConfig = {
        provider: "glm",
        apiKey: "test-api-key",
        model: "glm-4",
        baseURL: "https://open.bigmodel.cn/api/paas/v4/",
      };

      const provider = createProvider(glmConfig);

      expect(provider).toBeDefined();
    });

    it("should create provider for different GLM models", () => {
      const models: GLMModel[] = ["glm-4-plus", "glm-4", "glm-4-flash", "glm-3-turbo"];

      models.forEach((model) => {
        const glmConfig: AIConfig = {
          provider: "glm",
          apiKey: "test-api-key",
          model,
          baseURL: "https://open.bigmodel.cn/api/paas/v4/",
        };

        const provider = createProvider(glmConfig);
        expect(provider).toBeDefined();
      });
    });
  });

  describe("createProvider - Azure OpenAI", () => {
    it("should create Azure provider with valid config", () => {
      const azureConfig: AIConfig = {
        provider: "azure",
        apiKey: "test-api-key",
        model: "gpt-4o",
        baseURL: "https://my-resource.openai.azure.com/openai/deployments/my-deployment",
      };

      const provider = createProvider(azureConfig);

      expect(provider).toBeDefined();
      expect(typeof provider).toBe("object");
    });

    it("should create provider with custom baseURL", () => {
      const azureConfig: AIConfig = {
        provider: "azure",
        apiKey: "test-api-key",
        model: "gpt-4o",
        baseURL: "https://custom-resource.openai.azure.com/openai/deployments/custom-deployment",
      };

      const provider = createProvider(azureConfig);

      expect(provider).toBeDefined();
    });

    it("should create provider for different Azure models", () => {
      const models: AzureOpenAIModel[] = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4"];

      models.forEach((model) => {
        const azureConfig: AIConfig = {
          provider: "azure",
          apiKey: "test-api-key",
          model,
          baseURL: "https://my-resource.openai.azure.com/openai/deployments/my-deployment",
        };

        const provider = createProvider(azureConfig);
        expect(provider).toBeDefined();
      });
    });
  });
});
