import { Tool } from "ai";
import { z } from "zod";
import { BrowserTool } from "@/browser/core/browser-tool";
import { BashTool } from "@/browser/core/bash-tool";
import { getLogger, Log } from "@/log";
import { AnthropicModel, glmModelSchema, azureOpenAIModelSchema, dashscopeModelSchema, siliconflowModelSchema } from "@/types/config";
import { ShortestError } from "@/utils/errors";

const TOOL_ENTRY_CATEGORIES = ["provider", "custom"] as const;
const toolEntryCategorySchema = z.enum(TOOL_ENTRY_CATEGORIES);
const toolFactoryNoArgSchema = z.function().args().returns(z.custom<Tool>());

const toolFactoryWithArgSchema = z
  .function()
  .args(z.custom<BrowserTool>())
  .returns(z.custom<Tool>());
export const toolFactorySchema = z.union([
  toolFactoryWithArgSchema,
  toolFactoryNoArgSchema,
]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toolEntrySchema = z.union([
  z.object({
    name: z.literal("bash"),
    category: z.literal("provider"),
    factory: toolFactoryNoArgSchema,
  }),
  z.object({
    name: z.string(),
    category: toolEntryCategorySchema,
    factory: toolFactoryWithArgSchema,
  }),
]);
export type ToolEntry = z.infer<typeof toolEntrySchema>;

export const anthropicToolTypeSchema = z.enum(["computer", "bash"]);
export type AnthropicToolType = z.infer<typeof anthropicToolTypeSchema>;

// eslint-disable-next-line zod/require-zod-schema-types
export type AnthropicModelFamily = "claude-3-5" | "claude-3-7" | "claude-4";

/**
 * List of all Anthropic-defined tools for all models
 *
 * @see https://docs.anthropic.com/en/docs/agents-and-tools/computer-use#understand-anthropic-defined-tools
 */
// eslint-disable-next-line zod/require-zod-schema-types
export type AnthropicToolVersion = "20241022" | "20250124";

// eslint-disable-next-line zod/require-zod-schema-types
export type GLMModelFamily = "glm-4" | "glm-3";

export type GLMModel = z.infer<typeof glmModelSchema>;

// eslint-disable-next-line zod/require-zod-schema-types
export type AzureOpenAIModelFamily = "gpt-4o" | "gpt-4-turbo" | "gpt-4";

export type AzureOpenAIModel = z.infer<typeof azureOpenAIModelSchema>;

export type DashScopeModel = z.infer<typeof dashscopeModelSchema>;

// eslint-disable-next-line zod/require-zod-schema-types
export type DashScopeModelFamily = "qwen";

export type SiliconFlowModel = z.infer<typeof siliconflowModelSchema>;

// eslint-disable-next-line zod/require-zod-schema-types
export type SiliconFlowModelFamily = "deepseek" | "qwen" | "glm" | "llama" | "other";

const ANTHROPIC_MODEL_TO_FAMILY: Record<AnthropicModel, AnthropicModelFamily> =
  {
    "claude-4-sonnet-20250514": "claude-4",
    "claude-4-sonnet-latest": "claude-4",
    "claude-4-opus-20250514": "claude-4",
    "claude-4-opus-latest": "claude-4",
    "claude-3-5-sonnet-latest": "claude-3-5",
    "claude-3-5-sonnet-20241022": "claude-3-5",
    "claude-3-7-sonnet-latest": "claude-3-7",
    "claude-3-7-sonnet-20250219": "claude-3-7",
  };

const GLM_MODEL_TO_FAMILY: Record<GLMModel, GLMModelFamily> = {
  "glm-4-plus": "glm-4",
  "glm-4-0520": "glm-4",
  "glm-4": "glm-4",
  "glm-4-air": "glm-4",
  "glm-4-flash": "glm-4",
  "glm-3-turbo": "glm-3",
};

const AZURE_OPENAI_MODEL_TO_FAMILY: Record<AzureOpenAIModel, AzureOpenAIModelFamily> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o",
  "gpt-4-turbo": "gpt-4-turbo",
  "gpt-4": "gpt-4",
};

const DASHSCOPE_MODEL_TO_FAMILY: Record<DashScopeModel, DashScopeModelFamily> = {
  "qwen-max": "qwen",
  "qwen-plus": "qwen",
  "qwen-turbo": "qwen",
  "qwen-flash": "qwen",
  "qwen-long": "qwen",
  "qwen-max-latest": "qwen",
  "qwen-plus-latest": "qwen",
};

const SILICONFLOW_MODEL_TO_FAMILY: Record<SiliconFlowModel, SiliconFlowModelFamily> = {
  // DeepSeek Series
  "deepseek-ai/DeepSeek-V3": "deepseek",
  "deepseek-ai/DeepSeek-R1": "deepseek",
  "Pro/deepseek-ai/DeepSeek-V3": "deepseek",
  "Pro/deepseek-ai/DeepSeek-R1": "deepseek",
  // Qwen Series
  "Qwen/Qwen2.5-72B-Instruct": "qwen",
  "Qwen/Qwen2.5-7B-Instruct": "qwen",
  "Qwen/Qwen2-72B-Instruct": "qwen",
  "Qwen/Qwen2-7B-Instruct": "qwen",
  // GLM Series
  "THUDM/glm-4-9b-chat": "glm",
  "THUDM/GLM-Z1-9B-0414": "glm",
  // Other popular models
  "meta-llama/Llama-3.1-70B-Instruct": "llama",
  "meta-llama/Llama-3.1-8B-Instruct": "llama",
  "mistralai/Mistral-7B-Instruct-v0.3": "other",
  "01-ai/Yi-1.5-34B-Chat": "other",
};

const ANTHROPIC_TOOL_VERSION_MAP: Record<
  AnthropicModelFamily,
  Record<AnthropicToolType, AnthropicToolVersion>
> = {
  "claude-3-5": {
    computer: "20241022",
    bash: "20241022",
  },
  "claude-3-7": {
    computer: "20250124",
    bash: "20250124",
  },
  "claude-4": {
    computer: "20250124",
    bash: "20250124",
  },
};

/**
 * Registry for managing and retrieving tools for AI models
 *
 * @private
 */
export class ToolRegistry {
  private tools: Map<string, ToolEntry> = new Map();
  private log: Log;

  constructor() {
    this.log = getLogger();
  }

  /**
   * Registers a new tool with the registry
   *
   * @param key - Unique identifier for the tool
   * @param entry - Tool entry configuration
   * @throws Error if a tool with the same key is already registered
   */
  public registerTool(key: string, entry: ToolEntry) {
    if (this.tools.has(key)) {
      throw new Error(`Tool with key '${key}' already registered`);
    }
    this.tools.set(key, entry);
  }

  /**
   * Retrieves all tools for a specific provider and model
   *
   * @param provider - The provider name
   * @param model - The Anthropic, GLM, or Azure OpenAI model to get tools for
   * @param browserTool - Browser tool instance
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  public getTools(
    provider: string,
    model: AnthropicModel | GLMModel | AzureOpenAIModel | DashScopeModel,
    browserTool: BrowserTool,
  ): Record<string, Tool> {
    const selectedTools: Record<string, Tool> = {};
    const providerTools = this.getProviderTools(provider, model, browserTool);
    const customTools = this.getCustomTools(browserTool);
    Object.assign(selectedTools, providerTools, customTools);

    return selectedTools;
  }

  /**
   * Retrieves all custom tools
   *
   * @param browserTool - Browser tool instance
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  private getCustomTools(browserTool: BrowserTool): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    const customTools = Array.from(this.tools.values()).filter(
      (entry) => entry.category === "custom",
    );
    customTools.forEach((entry) => {
      tools[entry.name] = entry.factory(browserTool);
    });

    return tools;
  }

  /**
   * Retrieves all GLM-specific tools
   *
   * GLM uses standard function calling via OpenAI SDK
   * Creates tool instances using GLM-specific factory functions
   *
   * @param browserTool - Browser tool instance
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  private getGLMTools(browserTool: BrowserTool): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    // GLM uses standard function calling via OpenAI SDK
    // Create tool instances using GLM-specific factory functions
    try {
      const { createGLMComputer } = require("@/ai/tools/glm/computer");
      const computerTool = createGLMComputer(browserTool);
      tools["computer"] = computerTool;
    } catch (error) {
      this.log.trace("Computer tool creation failed for GLM, skipping", { error });
    }

    try {
      const { createGLMBash } = require("@/ai/tools/glm/bash");
      const bashTool = createGLMBash();
      tools["bash"] = bashTool;
    } catch (error) {
      this.log.trace("Bash tool creation failed for GLM, skipping", { error });
    }

    return tools;
  }

  /**
   * Retrieves all Azure OpenAI-specific tools
   *
   * Azure OpenAI uses standard function calling via Azure SDK
   * Creates tool instances using Azure-specific factory functions
   *
   * @param browserTool - Browser tool instance
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  private getAzureTools(browserTool: BrowserTool): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    // Azure OpenAI uses standard function calling
    try {
      const { createAzureComputer } = require("@/ai/tools/azure/computer");
      const computerTool = createAzureComputer(browserTool);
      tools["computer"] = computerTool;
    } catch (error) {
      this.log.trace("Computer tool creation failed for Azure, skipping", { error });
    }

    try {
      const { createAzureBash } = require("@/ai/tools/azure/bash");
      const bashTool = createAzureBash();
      tools["bash"] = bashTool;
    } catch (error) {
      this.log.trace("Bash tool creation failed for Azure, skipping", { error });
    }

    return tools;
  }

  /**
   * Retrieves all DashScope-specific tools
   *
   * DashScope uses standard function calling via OpenAI SDK
   * Creates tool instances using DashScope-specific factory functions
   *
   * @param browserTool - Browser tool instance
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  private getDashScopeTools(browserTool: BrowserTool): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    // DashScope uses standard function calling via OpenAI SDK
    try {
      const { createDashScopeComputer } = require("@/ai/tools/dashscope/computer");
      const computerTool = createDashScopeComputer(browserTool);
      tools["computer"] = computerTool;
    } catch (error) {
      this.log.trace("Computer tool creation failed for DashScope, skipping", { error });
    }

    try {
      const { createDashScopeBash } = require("@/ai/tools/dashscope/bash");
      const bashTool = createDashScopeBash();
      tools["bash"] = bashTool;
    } catch (error) {
      this.log.trace("Bash tool creation failed for DashScope, skipping", { error });
    }

    return tools;
  }

  /**
   * Retrieves all SiliconFlow-specific tools
   *
   * SiliconFlow uses standard function calling via OpenAI SDK
   * Creates tool instances using SiliconFlow-specific factory functions
   *
   * @param browserTool - Browser tool instance
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  private getSiliconFlowTools(browserTool: BrowserTool): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    // SiliconFlow uses standard function calling via OpenAI SDK
    try {
      const { createSiliconFlowComputer } = require("@/ai/tools/siliconflow/computer");
      const computerTool = createSiliconFlowComputer(browserTool);
      tools["computer"] = computerTool;
    } catch (error) {
      this.log.trace("Computer tool creation failed for SiliconFlow, skipping", { error });
    }

    try {
      const { createSiliconFlowBash } = require("@/ai/tools/siliconflow/bash");
      const bashTool = createSiliconFlowBash();
      tools["bash"] = bashTool;
    } catch (error) {
      this.log.trace("Bash tool creation failed for SiliconFlow, skipping", { error });
    }

    return tools;
  }

  /**
   * Retrieves all provider-specific tools
   *
   * @param provider - The provider name
   * @param model - The Anthropic, GLM, Azure OpenAI, DashScope, or SiliconFlow model to get tools for
   * @param browserTool - Browser tool instance
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  private getProviderTools(
    provider: string,
    model: AnthropicModel | GLMModel | AzureOpenAIModel | DashScopeModel | SiliconFlowModel,
    browserTool: BrowserTool,
  ): Record<string, Tool> {
    if (provider === "glm") {
      return this.getGLMTools(browserTool);
    }

    if (provider === "azure") {
      return this.getAzureTools(browserTool);
    }

    if (provider === "dashscope") {
      return this.getDashScopeTools(browserTool);
    }

    if (provider === "siliconflow") {
      return this.getSiliconFlowTools(browserTool);
    }

    // Type narrowing: After the early return for GLM, Azure, DashScope, and SiliconFlow providers above,
    // we know 'model' must be an AnthropicModel, not a GLMModel, AzureOpenAIModel, DashScopeModel, or SiliconFlowModel.
    // The type casting below is safe because we've eliminated the GLM, Azure, DashScope, and SiliconFlow cases.
    const tools: Record<string, Tool> = {};

    try {
      const computerToolEntry = this.getProviderToolEntry(
        provider,
        model as AnthropicModel, // Safe: GLM, Azure, DashScope, and SiliconFlow cases already handled
        "computer",
      );
      tools[computerToolEntry.name] = computerToolEntry.factory(browserTool);
    } catch (error) {
      if (!(error instanceof ShortestError)) throw error;
      this.log.trace("Computer tool not found for model, skipping", { model });
    }

    try {
      const bashToolEntry = this.getProviderToolEntry(
        provider,
        model as AnthropicModel, // Safe: GLM, Azure, DashScope, and SiliconFlow cases already handled
        "bash",
      );
      // @ts-ignore
      // For some reason, it expects an argument, but it doesn't take any
      tools["bash"] = bashToolEntry.factory();
    } catch (error) {
      if (!(error instanceof ShortestError)) throw error;
      this.log.trace("Bash tool not found for model, skipping", { model });
    }

    return tools;
  }

  /**
   * Retrieves a specific provider tool entry
   *
   * @param provider - The provider name
   * @param model - The Anthropic model
   * @param toolType - Type of tool to retrieve
   * @returns Tool entry configuration
   * @throws ShortestError if tool not found
   *
   * @private
   */
  private getProviderToolEntry(
    provider: string,
    model: AnthropicModel,
    toolType: AnthropicToolType,
  ): ToolEntry {
    const toolEntryKey = this.getToolEntryKey(provider, model, toolType);
    const toolEntry = this.tools.get(toolEntryKey);
    if (toolEntry) {
      return toolEntry;
    }
    throw new ShortestError(
      `${toolType} tool not found for key: ${toolEntryKey}`,
    );
  }

  /**
   * Generates the key used to look up tool entries
   * @param provider - The provider name
   * @param model - The Anthropic model
   * @param toolType - Type of tool
   * @returns Tool entry key string
   *
   * @private
   */
  private getToolEntryKey(
    provider: string,
    model: AnthropicModel,
    toolType: AnthropicToolType,
  ): string {
    const family = ANTHROPIC_MODEL_TO_FAMILY[model];
    const version = ANTHROPIC_TOOL_VERSION_MAP[family][toolType];
    return `${provider}_${toolType}_${version}`;
  }
}
