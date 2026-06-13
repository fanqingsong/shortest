import { URL } from "url";

/**
 * URL normalization options.
 */
export interface URLNormalizationOptions {
  /** Whether to remove trailing slashes */
  removeTrailingSlash?: boolean;
  /** Whether to force HTTPS */
  forceHTTPS?: boolean;
  /** Whether to add default port */
  addDefaultPort?: boolean;
  /** Whether to lower case the hostname */
  lowercaseHost?: boolean;
}

/**
 * URL normalization result.
 */
export interface URLNormalizationResult {
  /** The normalized URL */
  normalized: string;
  /** The original URL */
  original: string;
  /** Whether any changes were made */
  changed: boolean;
  /** The changes that were made */
  changes: string[];
}

/**
 * Utility class for URL normalization.
 * Handles URL validation, normalization, and transformation.
 *
 * This class follows the Single Responsibility Principle by focusing
 * solely on URL normalization logic.
 *
 * @class URLNormalizer
 *
 * @example
 * ```typescript
 * const normalizer = new URLNormalizer();
 *
 * const result = normalizer.normalize("http://example.com/");
 * console.log(result.normalized); // "http://example.com"
 * ```
 */
export class URLNormalizer {
  private defaultOptions: URLNormalizationOptions;

  /**
   * Creates a new URL normalizer instance.
   *
   * @param {URLNormalizationOptions} options - Default normalization options
   */
  constructor(options: URLNormalizationOptions = {}) {
    this.defaultOptions = {
      removeTrailingSlash: options.removeTrailingSlash ?? true,
      forceHTTPS: options.forceHTTPS ?? false,
      addDefaultPort: options.addDefaultPort ?? false,
      lowercaseHost: options.lowercaseHost ?? true,
    };
  }

  /**
   * Normalizes a URL string.
   *
   * @param {string} urlString - The URL to normalize
   * @param {URLNormalizationOptions} options - Normalization options (overrides defaults)
   * @returns {URLNormalizationResult} Normalization result
   *
   * @example
   * ```typescript
   * const result = normalizer.normalize("http://Example.COM:80/");
   * // Returns: { normalized: "http://example.com", changed: true, changes: [...] }
   * ```
   */
  normalize(
    urlString: string,
    options: URLNormalizationOptions = {},
  ): URLNormalizationResult {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const changes: string[] = [];
    let changed = false;

    try {
      const url = new URL(urlString);
      const original = urlString;

      // Lowercase hostname
      if (mergedOptions.lowercaseHost && url.hostname !== url.hostname.toLowerCase()) {
        const originalHostname = url.hostname;
        url.hostname = url.hostname.toLowerCase();
        changes.push(`Lowercased hostname: ${originalHostname} → ${url.hostname}`);
        changed = true;
      }

      // Force HTTPS
      if (mergedOptions.forceHTTPS && url.protocol === "http:") {
        url.protocol = "https:";
        changes.push("Forced HTTPS");
        changed = true;
      }

      // Add default port
      if (mergedOptions.addDefaultPort && !url.port) {
        const defaultPort = url.protocol === "https:" ? "443" : "80";
        url.port = defaultPort;
        changes.push(`Added default port: ${defaultPort}`);
        changed = true;
      }

      // Remove trailing slash from pathname
      if (mergedOptions.removeTrailingSlash && url.pathname.length > 1 && url.pathname.endsWith("/")) {
        const originalPathname = url.pathname;
        url.pathname = url.pathname.replace(/\/+$/, "");
        changes.push(`Removed trailing slash: ${originalPathname} → ${url.pathname}`);
        changed = true;
      }

      return {
        normalized: url.toString(),
        original,
        changed,
        changes,
      };
    } catch (error) {
      // If URL parsing fails, return original URL with error note
      return {
        normalized: urlString,
        original: urlString,
        changed: false,
        changes: [`Invalid URL: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  }

  /**
   * Validates if a string is a valid URL.
   *
   * @param {string} urlString - The string to validate
   * @returns {boolean} True if the string is a valid URL
   *
   * @example
   * ```typescript
   * if (normalizer.isValidURL("http://example.com")) {
   *   console.log("Valid URL");
   * }
   * ```
   */
  isValidURL(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the base URL from a full URL.
   *
   * @param {string} urlString - The URL string
   * @returns {string} The base URL (origin + pathname)
   *
   * @example
   * ```typescript
   * const base = normalizer.getBaseURL("http://example.com/path?query=1");
   * // Returns: "http://example.com/path"
   * ```
   */
  getBaseURL(urlString: string): string {
    try {
      const url = new URL(urlString);
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch {
      return urlString;
    }
  }

  /**
   * Gets the origin from a URL (protocol + host).
   *
   * @param {string} urlString - The URL string
   * @returns {string} The origin
   *
   * @example
   * ```typescript
   * const origin = normalizer.getOrigin("http://example.com:8080/path");
   * // Returns: "http://example.com:8080"
   * ```
   */
  getOrigin(urlString: string): string {
    try {
      const url = new URL(urlString);
      return url.origin;
    } catch {
      return urlString;
    }
  }

  /**
   * Compares two URLs for equality, ignoring normalization differences.
   *
   * @param {string} url1 - First URL
   * @param {string} url2 - Second URL
   * @returns {boolean} True if URLs are equivalent
   *
   * @example
   * ```typescript
   * if (normalizer.areEqual("http://example.com/", "http://example.com")) {
   *   console.log("URLs are equivalent");
   * }
   * ```
   */
  areEqual(url1: string, url2: string): boolean {
    const result1 = this.normalize(url1);
    const result2 = this.normalize(url2);
    return result1.normalized === result2.normalized;
  }

  /**
   * Adds a path to a base URL.
   *
   * @param {string} baseURL - The base URL
   * @param {string} path - The path to add
   * @returns {string} The combined URL
   *
   * @example
   * ```typescript
   * const url = normalizer.addPath("http://example.com", "/api/users");
   * // Returns: "http://example.com/api/users"
   * ```
   */
  addPath(baseURL: string, path: string): string {
    try {
      const base = new URL(baseURL);
      base.pathname = base.pathname.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
      return base.toString();
    } catch {
      return baseURL + "/" + path.replace(/^\//, "");
    }
  }

  /**
   * Adds query parameters to a URL.
   *
   * @param {string} baseURL - The base URL
   * @param {Record<string, string>} params - Query parameters
   * @returns {string} The URL with query parameters
   *
   * @example
   * ```typescript
   * const url = normalizer.addQueryParams("http://example.com", { page: "1", limit: "10" });
   * // Returns: "http://example.com?page=1&limit=10"
   * ```
   */
  addQueryParams(baseURL: string, params: Record<string, string>): string {
    try {
      const url = new URL(baseURL);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      return url.toString();
    } catch {
      return baseURL;
    }
  }

  /**
   * Gets default normalization options.
   *
   * @returns {URLNormalizationOptions} Default options
   */
  getDefaultOptions(): URLNormalizationOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Sets default normalization options.
   *
   * @param {URLNormalizationOptions} options - New default options
   */
  setDefaultOptions(options: URLNormalizationOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
}
