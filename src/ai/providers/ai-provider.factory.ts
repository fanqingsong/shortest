import { LanguageModelV1 } from "ai";
import { AIProvider } from "./ai-provider.interface";
import { GLMProvider } from "./glm.provider";
import { AzureProvider } from "./azure.provider";
import { DashScopeProvider } from "./dashscope.provider";
import { SiliconFlowProvider } from "./siliconflow.provider";
import { AIConfig } from "@/types/config";
import { AIError } from "@/utils/errors";

/**
 * Factory class for creating AI provider instances.
 * Implements the Factory Pattern to encapsulate provider creation logic.
 *
 * This class follows the Open/Closed Principle - new providers can be added
 * by extending the factory without modifying existing client code.
 *
 * @class AIProviderFactory
 *
 * @example
 * ```typescript
 * const factory = new AIProviderFactory();
 * const config = { provider: "glm", apiKey: "...", model: "glm-4", baseURL: "..." };
 * const provider = factory.createProvider(config);
 * const model = provider.createModel();
 * ```
 *
 * @see {@link AIProvider} for provider interface
 * @see {@link https://refactoring.guru/design-patterns/factory-method} for Factory Pattern documentation
 */
export class AIProviderFactory {
  private providerRegistry: Map<string, new (config: {
    apiKey: string;
    baseURL: string;
    model: string;
  }) => AIProvider>;

  /**
   * Creates a new AI provider factory instance.
   * Initializes the provider registry with all available providers.
   */
  constructor() {
    this.providerRegistry = new Map([
      ["glm", GLMProvider],
      ["azure", AzureProvider],
      ["dashscope", DashScopeProvider],
      ["siliconflow", SiliconFlowProvider],
    ]);
  }

  /**
   * Registers a new AI provider.
   * Allows for dynamic provider registration at runtime.
   *
   * @param {string} providerName - The provider name/identifier
   * @param {new} providerClass - The provider class constructor
   * @returns {AIProviderFactory} This factory instance for method chaining
   *
   * @example
   * ```typescript
   * factory.registerProvider("custom", CustomProvider);
   * ```
   */
  registerProvider(
    providerName: string,
    providerClass: new (config: {
      apiKey: string;
      baseURL: string;
      model: string;
    }) => AIProvider,
  ): this {
    this.providerRegistry.set(providerName, providerClass);
    return this;
  }

  /**
   * Creates an AI provider instance based on the provided configuration.
   *
   * @param {AIConfig} config - The AI configuration
   * @returns {AIProvider} The provider instance
   * @throws {AIError} If the provider is not supported
   *
   * @example
   * ```typescript
   * const provider = factory.createProvider({
   *   provider: "glm",
   *   apiKey: "...",
   *   model: "glm-4",
   *   baseURL: "https://..."
   * });
   * ```
   */
  createProvider(config: AIConfig): AIProvider {
    const ProviderClass = this.providerRegistry.get(config.provider);

    if (!ProviderClass) {
      throw new AIError(
        "unsupported-provider",
        `Unsupported provider: ${config.provider}`,
      );
    }

    const provider = new ProviderClass({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      model: config.model,
    });

    // Validate the provider configuration
    if (!provider.validateConfig()) {
      throw new AIError(
        "invalid-config",
        `Invalid configuration for provider: ${config.provider}`,
      );
    }

    return provider;
  }

  /**
   * Gets a list of all registered provider names.
   *
   * @returns {string[]} Array of provider names
   *
   * @example
   * ```typescript
   * const providers = factory.getAvailableProviders();
   * console.log("Available providers:", providers);
   * ```
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providerRegistry.keys());
  }

  /**
   * Checks if a provider is supported.
   *
   * @param {string} providerName - The provider name to check
   * @returns {boolean} True if the provider is supported
   *
   * @example
   * ```typescript
   * if (factory.isProviderSupported("glm")) {
   *   // Use GLM provider
   * }
   * ```
   */
  isProviderSupported(providerName: string): boolean {
    return this.providerRegistry.has(providerName);
  }

  /**
   * Creates a language model instance directly from configuration.
   * Convenience method that combines provider creation and model instantiation.
   *
   * @param {AIConfig} config - The AI configuration
   * @returns {LanguageModelV1} The language model instance
   * @throws {AIError} If provider creation or model instantiation fails
   *
   * @example
   * ```typescript
   * const model = factory.createModelFromConfig(config);
   * ```
   */
  createModelFromConfig(config: AIConfig): LanguageModelV1 {
    const provider = this.createProvider(config);
    return provider.createModel();
  }
}
