import { BaseTokenUsageTracker, TokenUsageTrackerOptions, TokenUsageStats } from "./token-usage-tracker.interface";
import { TokenUsage } from "@/types/ai";

/**
 * Standard token usage tracker implementation.
 * Provides comprehensive token usage tracking with history and statistics.
 *
 * @class TokenUsageTracker
 * @extends {BaseTokenUsageTracker}
 *
 * @example
 * ```typescript
 * const tracker = new TokenUsageTracker({
 *   trackPerRequest: true,
 *   maxHistorySize: 100,
 *   pricing: {
 *     promptTokenPrice: 0.0001,
 *     completionTokenPrice: 0.0002
 *   }
 * });
 *
 * tracker.trackUsage({
 *   promptTokens: 50,
 *   completionTokens: 100,
 *   totalTokens: 150
 * });
 *
 * const stats = tracker.getStats();
 * console.log(`Total cost: $${stats.estimatedCost}`);
 * ```
 */
export class TokenUsageTracker extends BaseTokenUsageTracker {
  /**
   * Creates a new token usage tracker instance.
   *
   * @param {TokenUsageTrackerOptions} options - Tracker options
   */
  constructor(options: TokenUsageTrackerOptions = {}) {
    super(options);
  }

  /**
   * Gets usage for a specific request number.
   *
   * @param {number} requestNumber - The request number (1-indexed)
   * @returns {TokenUsage | undefined} Usage data for the request, or undefined if not found
   *
   * @example
   * ```typescript
   * const firstRequestUsage = tracker.getRequestUsage(1);
   * ```
   */
  getRequestUsage(requestNumber: number): TokenUsage | undefined {
    if (requestNumber < 1 || requestNumber > this.history.length) {
      return undefined;
    }
    return { ...this.history[requestNumber - 1] };
  }

  /**
   * Gets usage for the most recent N requests.
   *
   * @param {number} count - Number of recent requests
   * @returns {TokenUsage[]} Array of usage data
   *
   * @example
   * ```typescript
   * const recentUsage = tracker.getRecentUsage(5);
   * ```
   */
  getRecentUsage(count: number): TokenUsage[] {
    const start = Math.max(0, this.history.length - count);
    return this.history.slice(start).map((usage) => ({ ...usage }));
  }

  /**
   * Calculates usage statistics for a window of requests.
   *
   * @param {number} startIndex - Start index (1-indexed)
   * @param {number} endIndex - End index (1-indexed, inclusive)
   * @returns {TokenUsageStats} Statistics for the window
   *
   * @example
   * ```typescript
   * const windowStats = tracker.getWindowStats(1, 10);
   * ```
   */
  getWindowStats(startIndex: number, endIndex: number): TokenUsageStats {
    const start = Math.max(0, startIndex - 1);
    const end = Math.min(this.history.length, endIndex);

    const windowUsage = this.history.slice(start, end).reduce(
      (acc, usage) => ({
        promptTokens: acc.promptTokens + usage.promptTokens,
        completionTokens: acc.completionTokens + usage.completionTokens,
        totalTokens: acc.totalTokens + usage.totalTokens,
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    );

    const requestCount = end - start;
    const averageTokensPerRequest =
      requestCount > 0 ? Math.round(windowUsage.totalTokens / requestCount) : 0;

    const stats: TokenUsageStats = {
      ...windowUsage,
      apiRequestCount: requestCount,
      averageTokensPerRequest,
    };

    // Calculate estimated cost if pricing is available
    if (this.options.pricing) {
      const { promptTokenPrice, completionTokenPrice } = this.options.pricing;
      const promptCost =
        (windowUsage.promptTokens / 1000) * promptTokenPrice;
      const completionCost =
        (windowUsage.completionTokens / 1000) * completionTokenPrice;
      stats.estimatedCost = promptCost + completionCost;
    }

    return stats;
  }

  /**
   * Exports usage statistics to a JSON string.
   *
   * @returns {string} JSON string representation of usage statistics
   *
   * @example
   * ```typescript
   * const json = tracker.exportToJSON();
   * ```
   */
  exportToJSON(): string {
    const data = {
      stats: this.getStats(),
      history: this.history,
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Gets usage comparison between two time periods.
   *
   * @param {number} firstStart - Start index of first period (1-indexed)
   * @param {number} firstEnd - End index of first period (1-indexed)
   * @param {number} secondStart - Start index of second period (1-indexed)
   * @param {number} secondEnd - End index of second period (1-indexed)
   * @returns {Object} Comparison data
   *
   * @example
   * ```typescript
   * const comparison = tracker.comparePeriods(1, 5, 6, 10);
   * console.log(`Period 1 vs Period 2: ${comparison.percentageChange}%`);
   * ```
   */
  comparePeriods(
    firstStart: number,
    firstEnd: number,
    secondStart: number,
    secondEnd: number,
  ): {
    first: TokenUsageStats;
    second: TokenUsageStats;
    percentageChange: number;
    difference: TokenUsage;
  } {
    const first = this.getWindowStats(firstStart, firstEnd);
    const second = this.getWindowStats(secondStart, secondEnd);

    const percentageChange =
      first.totalTokens > 0
        ? ((second.totalTokens - first.totalTokens) / first.totalTokens) * 100
        : 0;

    const difference: TokenUsage = {
      promptTokens: second.promptTokens - first.promptTokens,
      completionTokens: second.completionTokens - first.completionTokens,
      totalTokens: second.totalTokens - first.totalTokens,
    };

    return {
      first,
      second,
      percentageChange,
      difference,
    };
  }

  /**
   * Sets custom pricing for cost estimation.
   *
   * @param {Object} pricing - Pricing configuration
   * @param {number} pricing.promptTokenPrice - Price per 1K prompt tokens
   * @param {number} pricing.completionTokenPrice - Price per 1K completion tokens
   *
   * @example
   * ```typescript
   * tracker.setPricing({
   *   promptTokenPrice: 0.0001,
   *   completionTokenPrice: 0.0002
   * });
   * ```
   */
  setPricing(pricing: {
    promptTokenPrice: number;
    completionTokenPrice: number;
  }): void {
    this.options.pricing = pricing;
  }

  /**
   * Gets the current pricing configuration.
   *
   * @returns {Object | undefined} Current pricing configuration
   */
  getPricing():
    | {
        promptTokenPrice: number;
        completionTokenPrice: number;
      }
    | undefined {
    return this.options.pricing;
  }
}
