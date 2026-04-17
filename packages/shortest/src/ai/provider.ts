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
    default:
      const _exhaustiveCheck: never = aiConfig;
      throw new AIError(
        "unsupported-provider",
        `Unsupported provider: ${(aiConfig as any).provider}`,
      );
  }
};
