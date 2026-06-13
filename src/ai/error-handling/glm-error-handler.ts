import { BaseAIErrorHandler, AIErrorType } from "./error-handler.interface";

/**
 * Error handler for GLM (Zhipu AI) provider.
 * Handles GLM-specific error codes and behaviors.
 *
 * @class GLMErrorHandler
 * @extends {BaseAIErrorHandler}
 *
 * @example
 * ```typescript
 * const handler = new GLMErrorHandler();
 * if (handler.isNonRetryable(error)) {
 *   // Handle non-retryable error
 * }
 * ```
 *
 * @see {@link https://open.bigmodel.cn/dev/api} for GLM error codes
 */
export class GLMErrorHandler extends BaseAIErrorHandler {
  /**
   * Creates a new GLM error handler instance.
   */
  constructor() {
    super({
      providerName: "glm",
      retryableStatusCodes: [429, 500, 502, 503, 504],
      // GLM-specific non-retryable codes
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
    });
  }

  /**
   * Maps GLM error characteristics to error type.
   *
   * @protected
   * @param {any} error - The error to classify
   * @returns {AIErrorType} The error type
   */
  protected getErrorType(error: any): AIErrorType {
    const status = error.status;
    const message = error.message?.toLowerCase() || "";

    // Authentication errors
    if (status === 401 || message.includes("unauthorized")) {
      return AIErrorType.AUTH_ERROR;
    }

    // Rate limiting
    if (status === 429 || message.includes("rate limit")) {
      return AIErrorType.TOKEN_LIMIT;
    }

    // Content filter
    if (message.includes("content filter") || message.includes("safety")) {
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
   * Calculates retry delay for GLM-specific errors.
   *
   * @protected
   * @param {any} error - The error to calculate delay for
   * @returns {number} Retry delay in milliseconds
   */
  protected calculateRetryDelay(error: any): number {
    const status = error.status;

    // Rate limiting - longer delay for GLM
    if (status === 429) {
      return 8000;
    }

    // Server errors
    if ([500, 502, 503, 504].includes(status)) {
      return 5000;
    }

    // Use base implementation for other cases
    return super.calculateRetryDelay(error);
  }
}
