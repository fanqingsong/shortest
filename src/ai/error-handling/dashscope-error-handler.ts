import { BaseAIErrorHandler, AIErrorType } from "./error-handler.interface";

/**
 * Error handler for Alibaba Cloud DashScope provider.
 * Handles DashScope-specific error codes and behaviors.
 *
 * @class DashScopeErrorHandler
 * @extends {BaseAIErrorHandler}
 *
 * @example
 * ```typescript
 * const handler = new DashScopeErrorHandler();
 * if (handler.isNonRetryable(error)) {
 *   // Handle non-retryable error
 * }
 * ```
 *
 * @see {@link https://help.aliyun.com/zh/model-builder/developer-reference/api-error-code} for DashScope error codes
 */
export class DashScopeErrorHandler extends BaseAIErrorHandler {
  /**
   * Creates a new DashScope error handler instance.
   */
  constructor() {
    super({
      providerName: "dashscope",
      retryableStatusCodes: [429, 500, 502, 503, 504],
      // DashScope-specific non-retryable codes
      nonRetryableStatusCodes: [400, 401, 403, 404, 422],
    });
  }

  /**
   * Maps DashScope error characteristics to error type.
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

    // Content filter (DashScope calls it "content management")
    if (
      errorCode === "content_moderation" ||
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
   * Calculates retry delay for DashScope-specific errors.
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
