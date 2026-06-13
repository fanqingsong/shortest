import { OpenAICompatibleProvider } from "./ai-provider.interface";

/**
 * GLM (Zhipu AI) provider implementation.
 * Supports GLM 3.x, 4.x, and 5.x model series.
 *
 * @class GLMProvider
 * @extends {OpenAICompatibleProvider}
 *
 * @example
 * ```typescript
 * const provider = new GLMProvider({
 *   apiKey: "your-api-key",
 *   baseURL: "https://open.bigmodel.cn/api/paas/v4/",
 *   model: "glm-4"
 * });
 * const model = provider.createModel();
 * ```
 *
 * @see {@link https://open.bigmodel.cn/dev/api} for GLM API documentation
 */
export class GLMProvider extends OpenAICompatibleProvider {
  /**
   * Creates a new GLM provider instance.
   *
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - GLM API key (ZHIPU_API_KEY or GLM_API_KEY)
   * @param {string} config.baseURL - Base URL for GLM API
   * @param {string} config.model - Model name (e.g., "glm-4", "glm-5.1")
   */
  constructor(config: { apiKey: string; baseURL: string; model: string }) {
    super(config);
  }

  /**
   * Returns the provider name.
   *
   * @returns {string} The provider name "glm"
   */
  getProviderName(): string {
    return "glm";
  }

  /**
   * Validates GLM-specific configuration.
   * Ensures the baseURL is a valid GLM API endpoint.
   *
   * @returns {boolean} True if configuration is valid
   */
  validateConfig(): boolean {
    const baseValid = super.validateConfig();
    if (!baseValid) return false;

    // GLM typically uses these base URLs
    const validBaseURLs = [
      "https://open.bigmodel.cn/api/paas/v4/",
      "https://open.bigmodel.cn/api/coding/paas/v4/",
    ];

    // Check if baseURL starts with any valid prefix
    return validBaseURLs.some(url => this.baseURL.startsWith(url));
  }
}
