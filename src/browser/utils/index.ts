/**
 * Browser Utilities Module
 *
 * This module provides utility classes for browser-related operations that follow
 * SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module browser/utils
 * @see {@link URLNormalizer} for URL normalization
 *
 * @example
 * ```typescript
 * import { URLNormalizer } from "@/browser/utils";
 *
 * const normalizer = new URLNormalizer();
 * const result = normalizer.normalize("http://example.com/");
 * ```
 */

export { URLNormalizer } from "./url-normalizer";
export { URLNormalizationOptions, URLNormalizationResult } from "./url-normalizer";
