import { LanguageModelV1 } from "ai";
import { CoreMessage, Tool } from "ai";
import { TokenUsage } from "@/types/ai";
import { TestRun } from "@/core/runner/test-run";
import { BrowserTool } from "@/browser/core/browser-tool";
import { AriaSnapshotSession } from "@/browser/snapshot/aria-snapshot-session";

/**
 * AI client response structure.
 */
export interface AIClientResponse {
  response: {
    status: "passed" | "failed";
    reason: string;
  };
  metadata: {
    usage: TokenUsage;
  };
}

/**
 * Interface for AI provider operations.
 * Defines the contract for creating AI model instances.
 *
 * @interface IAIProvider
 */
export interface IAIProvider {
  /**
   * Creates a language model instance.
   *
   * @returns {LanguageModelV1} The model instance
   * @throws {Error} If model creation fails
   */
  createModel(): LanguageModelV1;

  /**
   * Gets the provider name.
   *
   * @returns {string} The provider name
   */
  getProviderName(): string;

  /**
   * Validates provider configuration.
   *
   * @returns {boolean} True if configuration is valid
   */
  validateConfig(): boolean;
}

/**
 * Interface for AI client operations.
 * Defines the contract for AI-driven test execution.
 *
 * @interface IAIClient
 */
export interface IAIClient {
  /**
   * Runs an AI action with the provided prompt.
   *
   * @param {string} prompt - The prompt to send to the AI
   * @returns {Promise<AIClientResponse>} The AI response
   * @throws {Error} If AI execution fails
   */
  runAction(prompt: string): Promise<AIClientResponse>;

  /**
   * Gets the conversation history.
   *
   * @returns {CoreMessage[]} Array of conversation messages
   */
  getConversationHistory(): CoreMessage[];

  /**
   * Clears the conversation history.
   *
   * @returns {void}
   */
  clearConversationHistory(): void;

  /**
   * Gets the token usage statistics.
   *
   * @returns {TokenUsage} Token usage data
   */
  getTokenUsage(): TokenUsage;
}

/**
 * Interface for conversation history management.
 * Defines the contract for managing AI conversation state.
 *
 * @interface IConversationManager
 */
export interface IConversationManager {
  /**
   * Adds a message to the conversation history.
   *
   * @param {CoreMessage} message - The message to add
   * @returns {void}
   */
  addMessage(message: CoreMessage): void;

  /**
   * Gets the conversation history.
   *
   * @returns {CoreMessage[]} Array of messages
   */
  getHistory(): CoreMessage[];

  /**
   * Clears the conversation history.
   *
   * @returns {void}
   */
  clearHistory(): void;

  /**
   * Gets conversation statistics.
   *
   * @returns {Object} Statistics about the conversation
   */
  getStats(): {
    messageCount: number;
    userMessageCount: number;
    assistantMessageCount: number;
  };
}

/**
 * Interface for token usage tracking.
 * Defines the contract for tracking AI token usage.
 *
 * @interface ITokenUsageTracker
 */
export interface ITokenUsageTracker {
  /**
   * Tracks token usage for a request.
   *
   * @param {TokenUsage} usage - The token usage data
   * @returns {void}
   */
  trackUsage(usage: TokenUsage): void;

  /**
   * Gets total token usage.
   *
   * @returns {TokenUsage} Total usage data
   */
  getTotalUsage(): TokenUsage;

  /**
   * Resets the usage tracker.
   *
   * @returns {void}
   */
  reset(): void;

  /**
   * Gets the number of tracked requests.
   *
   * @returns {number} Number of requests
   */
  getRequestCount(): number;
}

/**
 * Interface for retry strategy.
 * Defines the contract for retry logic implementation.
 *
 * @interface IRetryStrategy
 */
export interface IRetryStrategy {
  /**
   * Executes an operation with retry logic.
   *
   * @template T - The return type
   * @param {() => Promise<T>} operation - The operation to execute
   * @param {(error: any, attempt: number) => void} onError - Error callback
   * @returns {Promise<T>} The operation result
   * @throws {Error} If all retry attempts fail
   */
  execute<T>(
    operation: () => Promise<T>,
    onError?: (error: any, attempt: number) => void,
  ): Promise<T>;

  /**
   * Gets the maximum number of retries.
   *
   * @returns {number} Maximum retry count
   */
  getMaxRetries(): number;
}

/**
 * AI configuration interface.
 */
export interface IAIConfig {
  provider: string;
  apiKey: string;
  baseURL: string;
  model: string;
}

/**
 * Tool registry interface.
 * Defines the contract for managing AI tools.
 *
 * @interface IToolRegistry
 */
export interface IToolRegistry {
  /**
   * Gets tools for a specific provider and model.
   *
   * @param {string} provider - The provider name
   * @param {string} model - The model name
   * @param {BrowserTool} browserTool - The browser tool instance
   * @param {AriaSnapshotSession} [ariaSnapshotSession] - Optional aria snapshot session
   * @returns {Record<string, Tool>} Map of tool names to tool definitions
   */
  getTools(
    provider: string,
    model: string,
    browserTool: BrowserTool,
    ariaSnapshotSession?: AriaSnapshotSession,
  ): Record<string, Tool>;

  /**
   * Registers a custom tool.
   *
   * @param {string} name - Tool name
   * @param {Tool} tool - Tool definition
   * @returns {void}
   */
  registerTool(name: string, tool: Tool): void;

  /**
   * Unregisters a tool.
   *
   * @param {string} name - Tool name
   * @returns {boolean} True if tool was removed
   */
  unregisterTool(name: string): boolean;
}
