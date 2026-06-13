import { TokenUsage, TokenUsageSchema } from "@/types/ai";

/**
 * Token usage statistics with metadata.
 */
export interface TokenUsageStats extends TokenUsage {
  /** Number of API requests made */
  apiRequestCount: number;
  /** Average tokens per request */
  averageTokensPerRequest: number;
  /** Total cost estimate (if pricing is available) */
  estimatedCost?: number;
}

/**
 * Token usage tracking options.
 */
export interface TokenUsageTrackerOptions {
  /** Whether to track per-request usage */
  trackPerRequest?: boolean;
  /** Maximum number of request histories to keep */
  maxHistorySize?: number;
  /** Custom pricing for cost estimation */
  pricing?: {
    /** Price per 1K prompt tokens */
    promptTokenPrice: number;
    /** Price per 1K completion tokens */
    completionTokenPrice: number;
  };
}

/**
 * Interface for token usage trackers.
 * Defines the contract for tracking AI token usage.
 *
 * This interface follows the Single Responsibility Principle by focusing
 * solely on token usage tracking.
 *
 * @interface TokenUsageTracker
 *
 * @example
 * ```typescript
 * const tracker = new TokenUsageTracker();
 * tracker.trackUsage({ promptTokens: 50, completionTokens: 100, totalTokens: 150 });
 * const stats = tracker.getStats();
 * ```
 */
export interface TokenUsageTracker {
  /**
   * Tracks token usage for a single request.
   *
   * @param {TokenUsage} usage - Token usage data
   */
  trackUsage(usage: TokenUsage): void;

  /**
   * Gets the total accumulated token usage.
   *
   * @returns {TokenUsage} Total token usage
   */
  getTotalUsage(): TokenUsage;

  /**
   * Gets detailed usage statistics.
   *
   * @returns {TokenUsageStats} Detailed usage statistics
   */
  getStats(): TokenUsageStats;

  /**
   * Resets the usage tracker.
   */
  reset(): void;

  /**
   * Gets the number of tracked requests.
   *
   * @returns {number} Number of requests
   */
  getRequestCount(): number;

  /**
   * Gets usage history (if tracking is enabled).
   *
   * @returns {TokenUsage[]} Array of usage data per request
   */
  getHistory(): TokenUsage[];

  /**
   * Checks if per-request tracking is enabled.
   *
   * @returns {boolean} True if per-request tracking is enabled
   */
  isTrackingPerRequest(): boolean;

  /**
   * Sets the maximum history size.
   *
   * @param {number} maxSize - Maximum number of history entries
   */
  setMaxHistorySize(maxSize: number): void;

  /**
   * Gets the current maximum history size.
   *
   * @returns {number} Maximum history size
   */
  getMaxHistorySize(): number;
}

/**
 * Abstract base class for token usage trackers.
 * Provides common functionality for token usage tracking.
 *
 * @abstract
 * @class BaseTokenUsageTracker
 * @implements {TokenUsageTracker}
 */
export abstract class BaseTokenUsageTracker implements TokenUsageTracker {
  protected totalUsage: TokenUsage;
  protected requestCount: number = 0;
  protected history: TokenUsage[] = [];
  protected options: Required<TokenUsageTrackerOptions>;

  /**
   * Creates a new token usage tracker instance.
   *
   * @param {TokenUsageTrackerOptions} options - Tracker options
   */
  constructor(options: TokenUsageTrackerOptions = {}) {
    this.options = {
      trackPerRequest: options.trackPerRequest ?? true,
      maxHistorySize: options.maxHistorySize ?? 100,
      pricing: options.pricing ?? {
        promptTokenPrice: 0.0,
        completionTokenPrice: 0.0,
      },
    };

    this.totalUsage = TokenUsageSchema.parse({});
  }

  /**
   * Tracks token usage for a single request.
   *
   * @param {TokenUsage} usage - Token usage data
   */
  trackUsage(usage: TokenUsage): void {
    const validatedUsage = TokenUsageSchema.parse(usage);

    this.totalUsage.promptTokens += validatedUsage.promptTokens;
    this.totalUsage.completionTokens += validatedUsage.completionTokens;
    this.totalUsage.totalTokens += validatedUsage.totalTokens;

    this.requestCount++;

    if (this.options.trackPerRequest) {
      this.history.push(validatedUsage);
      this.enforceHistoryLimit();
    }
  }

  /**
   * Gets the total accumulated token usage.
   *
   * @returns {TokenUsage} Total token usage
   */
  getTotalUsage(): TokenUsage {
    return { ...this.totalUsage };
  }

  /**
   * Gets detailed usage statistics.
   *
   * @returns {TokenUsageStats} Detailed usage statistics
   */
  getStats(): TokenUsageStats {
    const averageTokensPerRequest =
      this.requestCount > 0
        ? Math.round(this.totalUsage.totalTokens / this.requestCount)
        : 0;

    const stats: TokenUsageStats = {
      ...this.totalUsage,
      apiRequestCount: this.requestCount,
      averageTokensPerRequest,
    };

    // Calculate estimated cost if pricing is available
    if (this.options.pricing) {
      const { promptTokenPrice, completionTokenPrice } = this.options.pricing;
      const promptCost =
        (this.totalUsage.promptTokens / 1000) * promptTokenPrice;
      const completionCost =
        (this.totalUsage.completionTokens / 1000) * completionTokenPrice;
      stats.estimatedCost = promptCost + completionCost;
    }

    return stats;
  }

  /**
   * Resets the usage tracker.
   */
  reset(): void {
    this.totalUsage = TokenUsageSchema.parse({});
    this.requestCount = 0;
    this.history = [];
  }

  /**
   * Gets the number of tracked requests.
   *
   * @returns {number} Number of requests
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Gets usage history (if tracking is enabled).
   *
   * @returns {TokenUsage[]} Array of usage data per request
   */
  getHistory(): TokenUsage[] {
    return [...this.history];
  }

  /**
   * Checks if per-request tracking is enabled.
   *
   * @returns {boolean} True if per-request tracking is enabled
   */
  isTrackingPerRequest(): boolean {
    return this.options.trackPerRequest;
  }

  /**
   * Sets the maximum history size.
   *
   * @param {number} maxSize - Maximum number of history entries
   */
  setMaxHistorySize(maxSize: number): void {
    this.options.maxHistorySize = maxSize;
    this.enforceHistoryLimit();
  }

  /**
   * Gets the current maximum history size.
   *
   * @returns {number} Maximum history size
   */
  getMaxHistorySize(): number {
    return this.options.maxHistorySize;
  }

  /**
   * Enforces the history size limit.
   *
   * @protected
   */
  protected enforceHistoryLimit(): void {
    if (this.history.length > this.options.maxHistorySize) {
      const removeCount = this.history.length - this.options.maxHistorySize;
      this.history = this.history.slice(removeCount);
    }
  }
}
