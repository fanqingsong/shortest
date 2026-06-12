import { Tool } from "ai";
import { z } from "zod";
import { createBrowserSnapshotTools } from "@/ai/tools/openai-compat/browser";
import { AriaSnapshotSession } from "@/browser/snapshot/aria-snapshot-session";
import { BrowserTool } from "@/browser/core/browser-tool";
import { getLogger, Log } from "@/log";
import {
  glmModelSchema,
  azureOpenAIModelSchema,
  dashscopeModelSchema,
  siliconflowModelSchema,
} from "@/types/config";
import { ShortestError } from "@/utils/errors";

const TOOL_ENTRY_CATEGORIES = ["custom"] as const;
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
const toolEntrySchema = z.object({
  name: z.string(),
  category: toolEntryCategorySchema,
  factory: toolFactoryWithArgSchema,
});
export type ToolEntry = z.infer<typeof toolEntrySchema>;

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
export type SiliconFlowModelFamily =
  | "deepseek"
  | "qwen"
  | "glm"
  | "llama"
  | "other";

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
   * @param model - The GLM, Azure OpenAI, DashScope, or SiliconFlow model
   * @param browserTool - Browser tool instance
   * @param ariaSnapshotSession - Snapshot session for browser ref tools
   * @returns Record of tool name to Tool instance
   *
   * @private
   */
  public getTools(
    provider: string,
    model: GLMModel | AzureOpenAIModel | DashScopeModel | SiliconFlowModel,
    browserTool: BrowserTool,
    ariaSnapshotSession?: AriaSnapshotSession,
  ): Record<string, Tool> {
    if (!ariaSnapshotSession) {
      throw new ShortestError(
        "AriaSnapshotSession is required for browser automation tools",
      );
    }

    this.log.trace("Loading tools for provider", { provider, model });

    const providerTools = createBrowserSnapshotTools(ariaSnapshotSession);
    const customTools = this.getCustomTools(browserTool);
    return { ...providerTools, ...customTools };
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
}
