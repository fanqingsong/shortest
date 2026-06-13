import { BaseAIErrorHandler, AIErrorType } from "./error-handler.interface";

/**
 * Error handler for Azure OpenAI provider.
 * Handles Azure OpenAI-specific error codes and behaviors.
 *
 * @class AzureErrorHandler
 * @extends {BaseAIErrorHandler}
 *
 * @example
 * ```typescript
 * const handler = new AzureErrorHandler();
 * if (handler.isNonRetryable(error)) {
 *   // Handle non-retryable error
 * }
 * ```
 *
 * @see {@link https://learn.microsoft.com/en-us/azure/ai-services/openai/reference} for Azure OpenAI error codes
 */
export class AzureErrorHandler extends BaseAIErrorHandler {
  /**
   * Creates a new Azure OpenAI error handler instance.
   */
  constructor() {
    super({
      providerName: "azure",
      retryableStatusCodes: [429, 500, 502, 503, 504],
      // Azure OpenAI-specific non-retryable codes
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
    });
  }

  /**
   * Maps Azure OpenAI error characteristics to error type.
   *
   * @protected
   * @param {any} error - The error to classify
   * @returns {AIErrorType} The error type
   */
  protected getErrorType(error: any): AIErrorType {
    const status = error.status;
    const message = error.message?.toLowerCase() || "";
    const errorCode = error.code?.toLowerCase() || "";

    // Authentication errors
    if (status === 401 || errorCode === "unauthorized") {
      return AIErrorType.AUTH_ERROR;
    }

    // Quota exceeded
    if (errorCode === "quota_exceeded" || message.includes("quota")) {
      return AIErrorType.TOKEN_LIMIT;
    }

    // Rate limiting
    if (status === 429 || errorCode === "rate_limit") {
      return AIErrorType.TOKEN_LIMIT;
    }

    // Content filter
    if (
      errorCode === "content_filter" ||
      message.includes("content filter") ||
      message.includes("safety")
    ) {
      return AIErrorType.CONTENT_FILTER;
    }

    // Token limit
    if (status === 400 && message.includes("token")) {
      return AIErrorType.TOKEN_LIMIT;
    }

    // Invalid configuration
    if (status === 400) {
      return AIErrorType.INVALID_CONFIG;
    }

    // Server errors
    if ([500, 502, 503, 504].includes(status)) {
      return AIErrorType.NETWORK_ERROR;
    }

    return AIErrorType.UNKNOWN;
  }

  /**
   * Calculates retry delay for Azure OpenAI-specific errors.
   *
   * @protected
   * @param {any} error - The error to calculate delay for
   * @returns {number} Retry delay in milliseconds
   */
  protected calculateRetryDelay(error: any): number {
    const status = error.status;
    const errorCode = error.code?.toLowerCase() || "";

    // Quota exceeded - long delay
    if (errorCode === "quota_exceeded") {
      return 10000;
    }

    // Rate limiting
    if (status === 429) {
      return 5000;
    }

    // Server errors
    if ([500, 502, 503, 504].includes(status)) {
      return 3000;
    }

    // Use base implementation for other cases
    return super.calculateRetryDelay(error);
  }
}
