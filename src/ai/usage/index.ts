/**
 * AI Token Usage Tracking Module
 *
 * This module provides token usage tracking for AI interactions that follows
 * SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module ai/usage
 * @see {@link TokenUsageTracker} for token usage tracking interface
 *
 * @example
 * ```typescript
 * import { TokenUsageTracker } from "@/ai/usage";
 *
 * const tracker = new TokenUsageTracker({
 *   trackPerRequest: true,
 *   pricing: { promptTokenPrice: 0.0001, completionTokenPrice: 0.0002 }
 * });
 *
 * tracker.trackUsage({ promptTokens: 50, completionTokens: 100, totalTokens: 150 });
 * const stats = tracker.getStats();
 * console.log(`Total cost: $${stats.estimatedCost}`);
 * ```
 */

export {
  TokenUsageTracker,
  BaseTokenUsageTracker,
  TokenUsageTrackerOptions,
  TokenUsageStats,
} from "./token-usage-tracker.interface";
export { TokenUsageTracker as DefaultTokenUsageTracker } from "./token-usage-tracker";
