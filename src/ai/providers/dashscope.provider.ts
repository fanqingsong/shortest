import { OpenAICompatibleProvider } from "./ai-provider.interface";

/**
 * Alibaba Cloud DashScope provider implementation.
 * Supports Qwen model series.
 *
 * @class DashScopeProvider
 * @extends {OpenAICompatibleProvider}
 *
 * @example
 * ```typescript
 * const provider = new DashScopeProvider({
 *   apiKey: "your-api-key",
 *   baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
 *   model: "qwen-plus"
 * });
 * const model = provider.createModel();
 * ```
 *
 * @see {@link https://help.aliyun.com/zh/model-builder/developer-reference/use-qwen-by-calling-api} for DashScope documentation
 */
export class DashScopeProvider extends OpenAICompatibleProvider {
  /**
   * Creates a new DashScope provider instance.
   *
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - DashScope API key (DASHSCOPE_API_KEY)
   * @param {string} config.baseURL - Base URL for DashScope API
   * @param {string} config.model - Model name (e.g., "qwen-plus", "qwen-max")
   */
  constructor(config: { apiKey: string; baseURL: string; model: string }) {
    super(config);
  }

  /**
   * Returns the provider name.
   *
   * @returns {string} The provider name "dashscope"
   */
  getProviderName(): string {
    return "dashscope";
  }

  /**
   * Validates DashScope-specific configuration.
   * Ensures the baseURL is a valid DashScope API endpoint.
   *
   * @returns {boolean} True if configuration is valid
   */
  validateConfig(): boolean {
    const baseValid = super.validateConfig();
    if (!baseValid) return false;

    // DashScope uses this base URL pattern
    const validBaseURLPrefix = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    return this.baseURL.startsWith(validBaseURLPrefix);
  }
}
