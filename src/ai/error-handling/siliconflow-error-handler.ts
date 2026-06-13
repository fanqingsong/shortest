import { BaseAIErrorHandler, AIErrorType } from "./error-handler.interface";

/**
 * Error handler for SiliconFlow provider.
 * Handles SiliconFlow-specific error codes and behaviors.
 *
 * @class SiliconFlowErrorHandler
 * @extends {BaseAIErrorHandler}
 *
 * @example
 * ```typescript
 * const handler = new SiliconFlowErrorHandler();
 * if (handler.isNonRetryable(error)) {
 *   // Handle non-retryable error
 * }
 * ```
 *
 * @see {@link https://docs.siliconflow.cn/} for SiliconFlow error codes
 */
export class SiliconFlowErrorHandler extends BaseAIErrorHandler {
  /**
   * Creates a new SiliconFlow error handler instance.
   */
  constructor() {
    super({
      providerName: "siliconflow",
      retryableStatusCodes: [429, 500, 502, 503, 504],
      // SiliconFlow-specific non-retryable codes
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
    });
  }

  /**
   * Maps SiliconFlow error characteristics to error type.
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
    if (status === 401 || errorCode === "invalid_api_key") {
      return AIErrorType.AUTH_ERROR;
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
   * Calculates retry delay for SiliconFlow-specific errors.
   *
   * @protected
   * @param {any} error - The error to calculate delay for
   * @returns {number} Retry delay in milliseconds
   */
  protected calculateRetryDelay(error: any): number {
    const status = error.status;

    // Rate limiting
    if (status === 429) {
      return 6000;
    }

    // Server errors
    if ([500, 502, 503, 504].includes(status)) {
      return 4000;
    }

    // Use base implementation for other cases
    return super.calculateRetryDelay(error);
  }
}
