import { OpenAICompatibleProvider } from "./ai-provider.interface";

/**
 * SiliconFlow provider implementation.
 * Supports DeepSeek, Qwen, Llama, GLM, Mistral, and Yi model series.
 *
 * @class SiliconFlowProvider
 * @extends {OpenAICompatibleProvider}
 *
 * @example
 * ```typescript
 * const provider = new SiliconFlowProvider({
 *   apiKey: "your-api-key",
 *   baseURL: "https://api.siliconflow.cn/v1",
 *   model: "deepseek-ai/DeepSeek-V3"
 * });
 * const model = provider.createModel();
 * ```
 *
 * @see {@link https://docs.siliconflow.cn/cn/userguide/quickstart} for SiliconFlow documentation
 * @see {@link https://siliconflow.cn/models} for available models
 */
export class SiliconFlowProvider extends OpenAICompatibleProvider {
  /**
   * Creates a new SiliconFlow provider instance.
   *
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - SiliconFlow API key (SILICONFLOW_API_KEY)
   * @param {string} config.baseURL - Base URL for SiliconFlow API
   * @param {string} config.model - Model name (e.g., "deepseek-ai/DeepSeek-V3", "Qwen/Qwen2.5-72B-Instruct")
   */
  constructor(config: { apiKey: string; baseURL: string; model: string }) {
    super(config);
  }

  /**
   * Returns the provider name.
   *
   * @returns {string} The provider name "siliconflow"
   */
  getProviderName(): string {
    return "siliconflow";
  }

  /**
   * Validates SiliconFlow-specific configuration.
   * Ensures the baseURL is a valid SiliconFlow API endpoint.
   *
   * @returns {boolean} True if configuration is valid
   */
  validateConfig(): boolean {
    const baseValid = super.validateConfig();
    if (!baseValid) return false;

    // SiliconFlow uses this base URL pattern
    const validBaseURLPrefix = "https://api.siliconflow.cn/v1";
    return this.baseURL.startsWith(validBaseURLPrefix);
  }
}
