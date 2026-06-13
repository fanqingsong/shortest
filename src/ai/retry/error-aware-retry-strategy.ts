import { BaseRetryStrategy, RetryOptions } from "./retry-strategy.interface";
import { AIErrorHandler, getErrorHandlerFactory } from "@/ai/error-handling";

/**
 * Error-aware retry strategy that uses AI error handlers to determine retryability.
 * Integrates with the error handling system to make intelligent retry decisions.
 *
 * @class ErrorAwareRetryStrategy
 * @extends {BaseRetryStrategy}
 *
 * @example
 * ```typescript
 * const strategy = new ErrorAwareRetryStrategy({
 *   maxRetries: 3,
 *   provider: "glm"
 * });
 *
 * const result = await strategy.execute(
 *   async () => await aiClient.runAction(prompt),
 *   (error, attempt) => console.log(`Retry ${attempt}:`, error)
 * );
 * ```
 */
export class ErrorAwareRetryStrategy extends BaseRetryStrategy {
  private errorHandler: AIErrorHandler;
  private provider: string;

  /**
   * Creates a new error-aware retry strategy instance.
   *
   * @param {RetryOptions & { provider: string }} options - Retry options with provider name
   */
  constructor(options: RetryOptions & { provider: string }) {
    super(options);
    this.provider = options.provider;
    this.errorHandler = getErrorHandlerFactory().getErrorHandler(
      options.provider,
    );
  }

  /**
   * Determines if an operation should be retried based on error evaluation.
   * Uses the error handler to evaluate the error and determine retryability.
   *
   * @protected
   * @param {any} error - The error that occurred
   * @param {number} attempt - The current attempt number
   * @returns {boolean} True if the operation should be retried
   */
  protected shouldRetry(error: any, attempt: number): boolean {
    // Check if error is from the correct provider
    if (error.provider && error.provider !== this.provider) {
      return false;
    }

    // Use error handler to evaluate the error
    const evaluation = this.errorHandler.evaluateError(error);

    // Don't retry if error is non-retryable
    if (evaluation.nonRetryable) {
      return false;
    }

    // Retry if error is retryable and within attempt limit
    return evaluation.retryable && attempt < this.options.maxRetries;
  }

  /**
   * Calculates delay before next retry using error handler recommendations.
   *
   * @protected
   * @param {number} attempt - The current attempt number
   * @returns {number} Delay in milliseconds
   */
  protected calculateDelay(attempt: number): number {
    // Use base calculation as default
    const baseDelay = super.calculateDelay(attempt);

    // Error handler could provide specific delay recommendations
    // For now, we'll use the base implementation
    return baseDelay;
  }

  /**
   * Updates the provider for error handling.
   *
   * @param {string} provider - The new provider name
   */
  setProvider(provider: string): void {
    this.provider = provider;
    this.errorHandler = getErrorHandlerFactory().getErrorHandler(provider);
  }

  /**
   * Gets the current provider name.
   *
   * @returns {string} The provider name
   */
  getProvider(): string {
    return this.provider;
  }
}
