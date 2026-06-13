/**
 * Error type for AI-related errors.
 *
 * @enum {string}
 */
export enum AIErrorType {
  /** Unsupported provider */
  UNSUPPORTED_PROVIDER = "unsupported-provider",
  /** Invalid configuration */
  INVALID_CONFIG = "invalid-config",
  /** Max retries reached */
  MAX_RETRIES = "max-retries-reached",
  /** Invalid response */
  INVALID_RESPONSE = "invalid-response",
  /** Token limit exceeded */
  TOKEN_LIMIT = "token-limit-exceeded",
  /** Content filter violation */
  CONTENT_FILTER = "unsafe-content-detected",
  /** Unknown error */
  UNKNOWN = "unknown",
  /** Network error */
  NETWORK_ERROR = "network-error",
  /** Authentication error */
  AUTH_ERROR = "auth-error",
}

/**
 * Error details structure.
 */
export interface ErrorDetails {
  /** Error message */
  message: string;
  /** Error type */
  type: AIErrorType;
  /** HTTP status code (if applicable) */
  status?: number;
  /** Provider name */
  provider?: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Result of error evaluation.
 */
export interface ErrorEvaluation {
  /** Whether the error is retryable */
  retryable: boolean;
  /** Whether the error is non-retryable */
  nonRetryable: boolean;
  /** Suggested retry delay in milliseconds */
  retryDelay?: number;
  /** Error severity level */
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Interface for AI error handlers.
 * Defines the contract for handling AI-related errors across different providers.
 *
 * This interface follows the Strategy Pattern, allowing different error handling
 * strategies for different AI providers.
 *
 * @interface AIErrorHandler
 *
 * @example
 * ```typescript
 * class GLMErrorHandler implements AIErrorHandler {
 *   isNonRetryable(error: any): boolean {
 *     return [401, 403, 429, 500].includes(error.status);
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface AIErrorHandler {
  /**
   * Determines if an error should not be retried based on its characteristics.
   *
   * @param {any} error - The error to evaluate
   * @returns {boolean} True if error should not be retried
   */
  isNonRetryable(error: any): boolean;

  /**
   * Determines if an error is retryable.
   *
   * @param {any} error - The error to evaluate
   * @returns {boolean} True if error should be retried
   */
  isRetryable(error: any): boolean;

  /**
   * Evaluates an error and provides detailed information about it.
   *
   * @param {any} error - The error to evaluate
   * @returns {ErrorEvaluation} Detailed error evaluation
   */
  evaluateError(error: any): ErrorEvaluation;

  /**
   * Extracts error details from an error object.
   *
   * @param {any} error - The error to extract details from
   * @returns {ErrorDetails} Structured error details
   */
  extractErrorDetails(error: any): ErrorDetails;

  /**
   * Gets the provider name for this error handler.
   *
   * @returns {string} The provider name
   */
  getProviderName(): string;
}

/**
 * Abstract base class for AI error handlers.
 * Provides common functionality for provider-specific error handlers.
 *
 * @abstract
 * @class BaseAIErrorHandler
 * @implements {AIErrorHandler}
 */
export abstract class BaseAIErrorHandler implements AIErrorHandler {
  protected providerName: string;
  protected retryableStatusCodes: Set<number>;
  protected nonRetryableStatusCodes: Set<number>;

  constructor(config: {
    providerName: string;
    retryableStatusCodes?: number[];
    nonRetryableStatusCodes?: number[];
  }) {
    this.providerName = config.providerName;
    this.retryableStatusCodes = new Set(
      config.retryableStatusCodes ?? [429, 500, 502, 503, 504],
    );
    this.nonRetryableStatusCodes = new Set(
      config.nonRetryableStatusCodes ?? [400, 401, 403, 404, 422],
    );
  }

  /**
   * Determines if an error should not be retried based on its characteristics.
   *
   * @param {any} error - The error to evaluate
   * @returns {boolean} True if error should not be retried
   */
  isNonRetryable(error: any): boolean {
    const status = error.status;
    return this.nonRetryableStatusCodes.has(status);
  }

  /**
   * Determines if an error is retryable.
   *
   * @param {any} error - The error to evaluate
   * @returns {boolean} True if error should be retried
   */
  isRetryable(error: any): boolean {
    const status = error.status;
    return this.retryableStatusCodes.has(status);
  }

  /**
   * Evaluates an error and provides detailed information about it.
   *
   * @param {any} error - The error to evaluate
   * @returns {ErrorEvaluation} Detailed error evaluation
   */
  evaluateError(error: any): ErrorEvaluation {
    const details = this.extractErrorDetails(error);

    if (this.isNonRetryable(error)) {
      return {
        retryable: false,
        nonRetryable: true,
        severity: this.getSeverityForErrorType(details.type),
      };
    }

    if (this.isRetryable(error)) {
      return {
        retryable: true,
        nonRetryable: false,
        retryDelay: this.calculateRetryDelay(error),
        severity: "medium",
      };
    }

    return {
      retryable: true,
      nonRetryable: false,
      severity: "low",
    };
  }

  /**
   * Extracts error details from an error object.
   *
   * @param {any} error - The error to extract details from
   * @returns {ErrorDetails} Structured error details
   */
  extractErrorDetails(error: any): ErrorDetails {
    const type = this.getErrorType(error);
    return {
      message: error.message || "Unknown error",
      type,
      status: error.status,
      provider: this.providerName,
    };
  }

  /**
   * Gets the provider name for this error handler.
   *
   * @returns {string} The provider name
   */
  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Calculates retry delay based on error characteristics.
   *
   * @protected
   * @param {any} error - The error to calculate delay for
   * @returns {number} Retry delay in milliseconds
   */
  protected calculateRetryDelay(error: any): number {
    const status = error.status;

    // Rate limiting - exponential backoff
    if (status === 429) {
      return 5000;
    }

    // Server errors - moderate delay
    if ([500, 502, 503, 504].includes(status)) {
      return 3000;
    }

    // Default delay
    return 1000;
  }

  /**
   * Maps error characteristics to error type.
   *
   * @protected
   * @abstract
   * @param {any} error - The error to classify
   * @returns {AIErrorType} The error type
   */
  protected abstract getErrorType(error: any): AIErrorType;

  /**
   * Gets severity level for error type.
   *
   * @protected
   * @param {AIErrorType} type - The error type
   * @returns {"low" | "medium" | "high" | "critical"} The severity level
   */
  protected getSeverityForErrorType(
    type: AIErrorType,
  ): "low" | "medium" | "high" | "critical" {
    const severityMap: Record<AIErrorType, "low" | "medium" | "high" | "critical"> =
      {
        [AIErrorType.INVALID_CONFIG]: "high",
        [AIErrorType.MAX_RETRIES]: "critical",
        [AIErrorType.INVALID_RESPONSE]: "medium",
        [AIErrorType.TOKEN_LIMIT]: "medium",
        [AIErrorType.CONTENT_FILTER]: "low",
        [AIErrorType.AUTH_ERROR]: "high",
        [AIErrorType.NETWORK_ERROR]: "medium",
        [AIErrorType.UNKNOWN]: "medium",
        [AIErrorType.UNSUPPORTED_PROVIDER]: "critical",
      };

    return severityMap[type] || "medium";
  }
}
