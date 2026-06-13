import { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Abstract interface for AI provider implementations.
 * Each provider is responsible for creating its own language model instance.
 *
 * This follows the Strategy Pattern, allowing different AI providers to be
 * interchanged without modifying the client code.
 *
 * @interface AIProvider
 * @see {@link GLMProvider} for GLM implementation
 * @see {@link AzureProvider} for Azure OpenAI implementation
 * @see {@link DashScopeProvider} for DashScope implementation
 * @see {@link SiliconFlowProvider} for SiliconFlow implementation
 */
export interface AIProvider {
  /**
   * Creates a language model instance for this provider.
   *
   * @returns {LanguageModelV1} The language model instance
   * @throws {Error} If provider configuration is invalid
   */
  createModel(): LanguageModelV1;

  /**
   * Returns the provider name for identification purposes.
   *
   * @returns {string} The provider name
   */
  getProviderName(): string;

  /**
   * Validates the provider configuration.
   *
   * @returns {boolean} True if configuration is valid
   */
  validateConfig(): boolean;
}

/**
 * Abstract base class for OpenAI-compatible providers.
 * Provides common functionality for providers that use the OpenAI API format.
 *
 * @abstract
 * @class OpenAICompatibleProvider
 * @implements {AIProvider}
 */
export abstract class OpenAICompatibleProvider implements AIProvider {
  protected apiKey: string;
  protected baseURL: string;
  protected model: string;

  constructor(config: { apiKey: string; baseURL: string; model: string }) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.model = config.model;
  }

  /**
   * Creates a language model instance using OpenAI-compatible API.
   *
   * @returns {LanguageModelV1} The language model instance
   */
  createModel(): LanguageModelV1 {
    const client = createOpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
    });
    return client(this.model) as LanguageModelV1;
  }

  /**
   * Validates that required configuration fields are present.
   *
   * @returns {boolean} True if all required fields are present
   */
  validateConfig(): boolean {
    return !!(this.apiKey && this.baseURL && this.model);
  }

  /**
   * Gets the provider name.
   * Subclasses must implement this to return their specific name.
   *
   * @abstract
   * @returns {string} The provider name
   */
  abstract getProviderName(): string;
}
