import { BrowserContextOptions } from "playwright";
import { z } from "zod";

export const cliOptionsSchema = z.object({
  headless: z.boolean().optional(),
  baseUrl: z.string().optional().default("http://localhost:3000"),
  testPattern: z.string().optional().default("**/*.test.ts"),
  noCache: z.boolean().optional(),
});
export type CLIOptions = z.infer<typeof cliOptionsSchema>;

/**
 * List of Anthropic models that are supported by the AI client.
 *
 * @see https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic#model-capabilities
 * @see https://docs.anthropic.com/en/docs/about-claude/models/all-models
 */
export const ANTHROPIC_MODELS = [
  "claude-4-sonnet-20250514",
  "claude-4-sonnet-latest",
  "claude-4-opus-20250514",
  "claude-4-opus-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-latest",
  "claude-3-7-sonnet-20250219",
  "claude-3-7-sonnet-latest",
] as const;
export const anthropicModelSchema = z.enum(ANTHROPIC_MODELS);
export type AnthropicModel = z.infer<typeof anthropicModelSchema>;

/**
 * List of Zhipu GLM models that are supported by the AI client.
 *
 * @see https://open.bigmodel.cn/dev/api
 */
export const GLM_MODELS = [
  "glm-4-plus",
  "glm-4-0520",
  "glm-4",
  "glm-4-air",
  "glm-4-flash",
  "glm-4.7-flash",
  "glm-4.6v-flash",
  "glm-3-turbo",
] as const;
export const glmModelSchema = z.enum(GLM_MODELS);
export type GLMModel = z.infer<typeof glmModelSchema>;

/**
 * List of Azure OpenAI GPT-4 models that are supported by the AI client.
 *
 * @see https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
 */
export const AZURE_OPENAI_GPT_4_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
] as const;
export const azureOpenAIModelSchema = z.enum(AZURE_OPENAI_GPT_4_MODELS);
export type AzureOpenAIModel = z.infer<typeof azureOpenAIModelSchema>;

/**
 * List of Alibaba Cloud DashScope Qwen models that are supported by the AI client.
 *
 * @see https://help.aliyun.com/zh/model-builder/developer-reference/use-qwen-by-calling-api
 */
export const DASHSCOPE_QWEN_MODELS = [
  "qwen-max",
  "qwen-plus",
  "qwen-turbo",
  "qwen-flash",
  "qwen-long",
  "qwen-max-latest",
  "qwen-plus-latest",
] as const;
export const dashscopeModelSchema = z.enum(DASHSCOPE_QWEN_MODELS);
export type DashScopeModel = z.infer<typeof dashscopeModelSchema>;

/**
 * List of SiliconFlow models that are supported by the AI client.
 *
 * @see https://docs.siliconflow.cn/cn/userguide/quickstart
 * @see https://siliconflow.cn/models
 */
export const SILICONFLOW_MODELS = [
  // DeepSeek Series
  "deepseek-ai/DeepSeek-V3",
  "deepseek-ai/DeepSeek-R1",
  "Pro/deepseek-ai/DeepSeek-V3",
  "Pro/deepseek-ai/DeepSeek-R1",
  // Qwen Series
  "Qwen/Qwen2.5-72B-Instruct",
  "Qwen/Qwen2.5-7B-Instruct",
  "Qwen/Qwen2-72B-Instruct",
  "Qwen/Qwen2-7B-Instruct",
  // GLM Series
  "THUDM/glm-4-9b-chat",
  "THUDM/GLM-Z1-9B-0414",
  // Other popular models
  "meta-llama/Llama-3.1-70B-Instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "01-ai/Yi-1.5-34B-Chat",
] as const;
export const siliconflowModelSchema = z.enum(SILICONFLOW_MODELS);
export type SiliconFlowModel = z.infer<typeof siliconflowModelSchema>;

const SHORTEST_ENV_PREFIX = "SHORTEST_";

const getShortestEnvName = (key: string) => `${SHORTEST_ENV_PREFIX}${key}`;

const anthropicAiSchema = z
  .object({
    provider: z.literal("anthropic"),
    apiKey: z
      .string()
      .default(
        () =>
          process.env[getShortestEnvName("ANTHROPIC_API_KEY")] ||
          process.env.ANTHROPIC_API_KEY!,
      ),
    model: anthropicModelSchema.default(ANTHROPIC_MODELS[0]),
  })
  .strict();

const glmAiSchema = z
  .object({
    provider: z.literal("glm"),
    apiKey: z
      .string()
      .default(
        () =>
          process.env.ZHIPU_API_KEY ||
          process.env[getShortestEnvName("GLM_API_KEY")]!,
      ),
    model: glmModelSchema.default("glm-4"),
    baseURL: z.string().default("https://open.bigmodel.cn/api/paas/v4/"),
  })
  .strict();

const azureOpenAISchema = z
  .object({
    provider: z.literal("azure"),
    apiKey: z
      .string()
      .default(
        () =>
          process.env.AZURE_OPENAI_API_KEY ||
          process.env[getShortestEnvName("AZURE_OPENAI_API_KEY")]!,
      ),
    model: azureOpenAIModelSchema.default("gpt-4o"),
    baseURL: z.string().min(1, "Azure OpenAI baseURL is required"),
  })
  .strict();

const dashscopeAiSchema = z
  .object({
    provider: z.literal("dashscope"),
    apiKey: z
      .string()
      .default(
        () =>
          process.env.DASHSCOPE_API_KEY ||
          process.env[getShortestEnvName("DASHSCOPE_API_KEY")]!,
      ),
    model: dashscopeModelSchema.default("qwen-plus"),
    baseURL: z.string().default("https://dashscope.aliyuncs.com/compatible-mode/v1"),
  })
  .strict();

const siliconflowAiSchema = z
  .object({
    provider: z.literal("siliconflow"),
    apiKey: z
      .string()
      .default(
        () =>
          process.env.SILICONFLOW_API_KEY ||
          process.env[getShortestEnvName("SILICONFLOW_API_KEY")]!,
      ),
    model: siliconflowModelSchema.default("deepseek-ai/DeepSeek-V3"),
    baseURL: z.string().default("https://api.siliconflow.cn/v1"),
  })
  .strict();

const aiSchema = z.discriminatedUnion("provider", [anthropicAiSchema, glmAiSchema, azureOpenAISchema, dashscopeAiSchema, siliconflowAiSchema]);

// Partial versions for user config (allows optional fields)
// Note: provider must remain required for discriminated union to work
const anthropicAiPartialSchema = anthropicAiSchema
  .partial()
  .required({ provider: true });
const glmAiPartialSchema = glmAiSchema
  .partial()
  .required({ provider: true });
const azureOpenAIPartialSchema = azureOpenAISchema
  .partial()
  .required({ provider: true });
const dashscopeAiPartialSchema = dashscopeAiSchema
  .partial()
  .required({ provider: true });
const siliconflowAiPartialSchema = siliconflowAiSchema
  .partial()
  .required({ provider: true });
const aiPartialSchema = z.discriminatedUnion("provider", [anthropicAiPartialSchema, glmAiPartialSchema, azureOpenAIPartialSchema, dashscopeAiPartialSchema, siliconflowAiPartialSchema]);

export type AIConfig = z.infer<typeof aiSchema>;

const cachingSchema = z
  .object({
    enabled: z.boolean().default(true),
  })
  .strict();
export type CachingConfig = z.infer<typeof cachingSchema>;

const mailosaurSchema = z
  .object({
    apiKey: z.string(),
    serverId: z.string(),
  })
  .optional();

export const testPatternSchema = z.string().default("**/*.test.ts");

const browserSchema = z.object({
  /**
   * @see https://playwright.dev/docs/api/class-browser#browser-new-context
   */
  contextOptions: z.custom<BrowserContextOptions>().optional(),
});

export const configSchema = z
  .object({
    headless: z.boolean().default(true),
    baseUrl: z.string().url("must be a valid URL"),
    browser: browserSchema.strict().partial().default(browserSchema.parse({})),
    testPattern: testPatternSchema,
    anthropicKey: z.string().optional(),
    ai: aiSchema,
    mailosaur: mailosaurSchema.optional(),
    caching: cachingSchema.optional().default(cachingSchema.parse({})),
  })
  .strict();

export const userConfigSchema = configSchema.extend({
  browser: browserSchema.optional(),
  testPattern: testPatternSchema.optional(),
  ai: aiPartialSchema.optional(),
  caching: cachingSchema.strict().partial().optional(),
});

// User-provided config type - allows partial/optional AI settings
// Used when reading config from shortest.config.ts
export type ShortestConfig = z.infer<typeof userConfigSchema>;

// Internal fully-validated config type with required fields
// Used after config validation and defaults are applied
export type ShortestStrictConfig = z.infer<typeof configSchema>;
