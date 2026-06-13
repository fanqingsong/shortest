import { LanguageModelV1 } from "ai";
import { AIConfig } from "@/types/config";
import { AIError } from "@/utils/errors";
import { AIProviderFactory } from "./providers";

/**
 * Factory instance for creating AI providers.
 * Reused across the application for consistent provider creation.
 *
 * @private
 */
let providerFactory: AIProviderFactory | null = null;

/**
 * Gets or creates the AI provider factory instance.
 * Implements singleton pattern for factory instance.
 *
 * @private
 * @returns {AIProviderFactory} The factory instance
 */
function getFactory(): AIProviderFactory {
  if (!providerFactory) {
    providerFactory = new AIProviderFactory();
  }
  return providerFactory;
}

/**
 * Creates a language model instance based on the provided AI configuration.
 *
 * This function serves as a facade for the AI provider factory system.
 * It follows the Open/Closed Principle by delegating to the factory,
 * allowing new providers to be added without modifying this function.
 *
 * @param {AIConfig} aiConfig - The AI configuration including provider, apiKey, baseURL, and model
 * @returns {LanguageModelV1} The language model instance
 * @throws {AIError} If the provider is unsupported or configuration is invalid
 *
 * @example
 * ```typescript
 * const model = createProvider({
 *   provider: "glm",
 *   apiKey: "your-api-key",
 *   baseURL: "https://open.bigmodel.cn/api/paas/v4/",
 *   model: "glm-4"
 * });
 * ```
 *
 * @see {@link AIProviderFactory} for factory implementation
 * @see {@link AIProvider} for provider interface
 *
 * @private
 */
export const createProvider = (aiConfig: AIConfig): LanguageModelV1 => {
  const factory = getFactory();
  return factory.createModelFromConfig(aiConfig);
};

/**
 * Registers a custom AI provider.
 * Allows for dynamic provider registration at runtime.
 *
 * @param {string} providerName - The provider name/identifier
 * @param {new} providerClass - The provider class constructor
 *
 * @example
 * ```typescript
 * import { OpenAICompatibleProvider } from "@/ai/providers";
 *
 * class CustomProvider extends OpenAICompatibleProvider {
 *   // Implementation...
 * }
 *
 * registerProvider("custom", CustomProvider);
 * ```
 *
 * @see {@link AIProviderFactory.registerProvider} for more details
 */
export const registerProvider = (
  providerName: string,
  providerClass: new (config: {
    apiKey: string;
    baseURL: string;
    model: string;
  }) => import("./providers").AIProvider,
): void => {
  const factory = getFactory();
  factory.registerProvider(providerName, providerClass as any);
};

/**
 * Gets a list of all available AI providers.
 *
 * @returns {string[]} Array of provider names
 *
 * @example
 * ```typescript
 * const providers = getAvailableProviders();
 * console.log("Available providers:", providers);
 * // Output: ["glm", "azure", "dashscope", "siliconflow"]
 * ```
 */
export const getAvailableProviders = (): string[] => {
  const factory = getFactory();
  return factory.getAvailableProviders();
};

/**
 * Checks if a provider is supported.
 *
 * @param {string} providerName - The provider name to check
 * @returns {boolean} True if the provider is supported
 *
 * @example
 * ```typescript
 * if (isProviderSupported("glm")) {
 *   // Use GLM provider
 * }
 * ```
 */
export const isProviderSupported = (providerName: string): boolean => {
  const factory = getFactory();
  return factory.isProviderSupported(providerName);
};
