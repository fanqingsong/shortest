import { createAnthropic } from "@ai-sdk/anthropic";
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
    case "anthropic":
      const anthropic = createAnthropic({ apiKey: aiConfig.apiKey });
      return anthropic(aiConfig.model) as LanguageModelV1;
    case "glm":
      const glm = createOpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.baseURL,
      });
      return glm(aiConfig.model) as LanguageModelV1;
    case "azure":
      // Azure OpenAI 需要特殊配置
      // baseURL 应该指向完整的 deployment 路径，但 createOpenAI 会自动添加 /chat/completions
      // 所以我们这里需要提供不包含 deployment 名称的基础 URL
      const azureBaseURL = (aiConfig as any).baseURL;
      // 从 baseURL 中提取基础 URL (移除 deployment 部分)
      const baseHostName = azureBaseURL.replace(/\/openai\/deployments\/.*$/, '');
      const deploymentName = azureBaseURL.match(/\/openai\/deployments\/([^\/]+)$/)?.[1] || aiConfig.model;

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
