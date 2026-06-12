import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModelV1 } from "ai";
import { AIConfig } from "@/types";
import { AIError } from "@/utils/errors";

/**
 * Creates a custom AI provider based on the provided configuration.
 *
 * @private
 */
export const createProvider = (aiConfig: AIConfig): LanguageModelV1 => {
  switch (aiConfig.provider) {
    case "glm":
      const glm = createOpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.baseURL,
      });
      return glm(aiConfig.model) as LanguageModelV1;
    case "azure":
      const azureBaseURL = (aiConfig as any).baseURL;
      const baseHostName = azureBaseURL.replace(/\/openai\/deployments\/.*$/, "");
      const deploymentName =
        azureBaseURL.match(/\/openai\/deployments\/([^\/]+)$/)?.[1] ||
        aiConfig.model;

      const azure = createOpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: `${baseHostName}/openai/deployments/${deploymentName}`,
      });
      return azure(aiConfig.model) as LanguageModelV1;
    case "dashscope":
      const dashscope = createOpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: (aiConfig as any).baseURL,
      });
      return dashscope(aiConfig.model) as LanguageModelV1;
    case "siliconflow":
      const siliconflow = createOpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: (aiConfig as any).baseURL,
      });
      return siliconflow(aiConfig.model) as LanguageModelV1;
    default:
      const _exhaustiveCheck: never = aiConfig;
      throw new AIError(
        "unsupported-provider",
        `Unsupported provider: ${(aiConfig as any).provider}`,
      );
  }
};
