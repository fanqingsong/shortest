import { ErrorEvaluation } from "@/ai/error-handling";

/**
 * Retry configuration options.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial retry delay in milliseconds */
  initialDelay?: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff?: boolean;
  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;
  /** Maximum delay between retries */
  maxDelay?: number;
}

/**
 * Retry result containing success status and metadata.
 */
export interface RetryResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The result if successful */
  result?: T;
  /** The final error if failed */
  error?: Error;
  /** Number of attempts made */
  attempts: number;
  /** Total time spent retrying */
  totalTime: number;
}

/**
 * Interface for retry strategies.
 * Defines the contract for different retry behavior patterns.
 *
 * This interface follows the Strategy Pattern, allowing different retry
 * strategies to be interchanged without modifying the client code.
 *
 * @interface RetryStrategy
 *
 * @example
 * ```typescript
 * const strategy = new ExponentialBackoffStrategy({ maxRetries: 3 });
 * const result = await strategy.execute(
 *   async () => await apiCall(),
 *   (error) => handleError(error)
 * );
 * ```
 */
export interface RetryStrategy {
  /**
   * Executes an operation with retry logic.
   *
   * @template T - The return type of the operation
   * @param {() => Promise<T>} operation - The operation to execute
   * @param {(error: any, attempt: number) => void} onError - Callback for retry attempts
   * @returns {Promise<RetryResult<T>>} The retry result
   */
  execute<T>(
    operation: () => Promise<T>,
    onError?: (error: any, attempt: number) => void,
  ): Promise<RetryResult<T>>;

  /**
   * Gets the current retry configuration.
   *
   * @returns {RetryOptions} The retry options
   */
  getOptions(): RetryOptions;

  /**
   * Updates the retry configuration.
   *
   * @param {RetryOptions} options - The new retry options
   */
  setOptions(options: RetryOptions): void;
}

/**
 * Abstract base class for retry strategies.
 * Provides common functionality for retry operations.
 *
 * @abstract
 * @class BaseRetryStrategy
 * @implements {RetryStrategy}
 */
export abstract class BaseRetryStrategy implements RetryStrategy {
  protected options: Required<RetryOptions>;

  /**
   * Creates a new retry strategy instance.
   *
   * @param {RetryOptions} options - Retry configuration options
   */
  constructor(options: RetryOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelay: options.initialDelay ?? 1000,
      useExponentialBackoff: options.useExponentialBackoff ?? true,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      maxDelay: options.maxDelay ?? 30000,
    };
  }

  /**
   * Executes an operation with retry logic.
   *
   * @template T - The return type of the operation
   * @param {() => Promise<T>} operation - The operation to execute
   * @param {(error: any, attempt: number) => void} onError - Callback for retry attempts
   * @returns {Promise<RetryResult<T>>} The retry result
   */
  async execute<T>(
    operation: () => Promise<T>,
    onError?: (error: any, attempt: number) => void,
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        const result = await operation();
        const totalTime = Date.now() - startTime;

        return {
          success: true,
          result,
          attempts: attempt + 1,
          totalTime,
        };
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.options.maxRetries && this.shouldRetry(error, attempt)) {
          onError?.(error, attempt + 1);
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }

    const totalTime = Date.now() - startTime;
    return {
      success: false,
      error: lastError,
      attempts: this.options.maxRetries + 1,
      totalTime,
    };
  }

  /**
   * Gets the current retry configuration.
   *
   * @returns {RetryOptions} The retry options
   */
  getOptions(): RetryOptions {
    return { ...this.options };
  }

  /**
   * Updates the retry configuration.
   *
   * @param {RetryOptions} options - The new retry options
   */
  setOptions(options: RetryOptions): void {
    this.options = {
      ...this.options,
      ...options,
    } as Required<RetryOptions>;
  }

  /**
   * Determines if an operation should be retried based on the error.
   *
   * @protected
   * @abstract
   * @param {any} error - The error that occurred
   * @param {number} attempt - The current attempt number
   * @returns {boolean} True if the operation should be retried
   */
  protected abstract shouldRetry(error: any, attempt: number): boolean;

  /**
   * Calculates the delay before the next retry attempt.
   *
   * @protected
   * @param {number} attempt - The current attempt number
   * @returns {number} Delay in milliseconds
   */
  protected calculateDelay(attempt: number): number {
    if (!this.options.useExponentialBackoff) {
      return this.options.initialDelay;
    }

    const delay =
      this.options.initialDelay *
      Math.pow(this.options.backoffMultiplier, attempt);

    return Math.min(delay, this.options.maxDelay);
  }

  /**
   * Sleeps for the specified duration.
   *
   * @protected
   * @param {number} ms - Duration in milliseconds
   * @returns {Promise<void>}
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
