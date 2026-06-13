import { OpenAICompatibleProvider } from "./ai-provider.interface";

/**
 * Azure OpenAI provider implementation.
 * Supports GPT-4 and GPT-4o models.
 *
 * @class AzureProvider
 * @extends {OpenAICompatibleProvider}
 *
 * @example
 * ```typescript
 * const provider = new AzureProvider({
 *   apiKey: "your-api-key",
 *   baseURL: "https://{resource}.openai.azure.com/openai/deployments/{deployment}",
 *   model: "gpt-4o"
 * });
 * const model = provider.createModel();
 * ```
 *
 * @see {@link https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models} for Azure OpenAI documentation
 */
export class AzureProvider extends OpenAICompatibleProvider {
  /**
   * Creates a new Azure OpenAI provider instance.
   *
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - Azure OpenAI API key (AZURE_OPENAI_API_KEY)
   * @param {string} config.baseURL - Base URL for Azure OpenAI API
   * @param {string} config.model - Deployment/model name (e.g., "gpt-4o")
   */
  constructor(config: { apiKey: string; baseURL: string; model: string }) {
    super({
      ...config,
      // Normalize Azure OpenAI base URL
      baseURL: this.normalizeAzureBaseURL(config.baseURL, config.model),
    });
  }

  /**
   * Normalizes Azure OpenAI base URL to ensure correct format.
   * Extracts base hostname and deployment name from the URL.
   *
   * @private
   * @param {string} baseURL - The original base URL
   * @param {string} model - The model/deployment name
   * @returns {string} The normalized base URL
   */
  private normalizeAzureBaseURL(baseURL: string, model: string): string {
    const baseHostName = baseURL.replace(/\/openai\/deployments\/.*$/, "");
    const deploymentName =
      baseURL.match(/\/openai\/deployments\/([^\/]+)$/)?.[1] || model;

    return `${baseHostName}/openai/deployments/${deploymentName}`;
  }

  /**
   * Returns the provider name.
   *
   * @returns {string} The provider name "azure"
   */
  getProviderName(): string {
    return "azure";
  }

  /**
   * Validates Azure-specific configuration.
   * Ensures the baseURL follows Azure OpenAI format.
   *
   * @returns {boolean} True if configuration is valid
   */
  validateConfig(): boolean {
    const baseValid = super.validateConfig();
    if (!baseValid) return false;

    // Azure OpenAI base URLs should follow specific patterns
    const azureURLPattern = /https:\/\/.*\.openai\.azure\.com\/openai\/deployments\/.+/;
    return azureURLPattern.test(this.baseURL);
  }
}
