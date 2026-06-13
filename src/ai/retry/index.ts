/**
 * AI Retry Strategy Module
 *
 * This module provides flexible retry strategies for AI operations that follow
 * SOLID design principles, particularly the Open/Closed Principle and Strategy Pattern.
 *
 * @module ai/retry
 * @see {@link RetryStrategy} for retry strategy interface
 * @see {@link ErrorAwareRetryStrategy} for error-aware implementation
 *
 * @example
 * ```typescript
 * import { ErrorAwareRetryStrategy } from "@/ai/retry";
 *
 * const strategy = new ErrorAwareRetryStrategy({
 *   maxRetries: 3,
 *   provider: "glm"
 * });
 *
 * const result = await strategy.execute(
 *   async () => await apiCall(),
 *   (error, attempt) => console.log(`Retry ${attempt}:`, error)
 * );
 * ```
 */

export {
  RetryStrategy,
  BaseRetryStrategy,
  RetryOptions,
  RetryResult,
} from "./retry-strategy.interface";
export { ErrorAwareRetryStrategy } from "./error-aware-retry-strategy";
