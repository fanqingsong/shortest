import { Browser, BrowserContext, Page } from "playwright";
import { ShortestConfig } from "@/types/config";

/**
 * Interface for browser lifecycle management.
 * Defines the contract for browser creation, initialization, and cleanup.
 *
 * @interface IBrowserManager
 *
 * @example
 * ```typescript
 * class MyBrowserManager implements IBrowserManager {
 *   async launch(): Promise<BrowserContext> {
 *     // Implementation
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface IBrowserManager {
  /**
   * Launches the browser and creates a new context.
   *
   * @returns {Promise<BrowserContext>} The browser context
   * @throws {Error} If browser launch fails
   */
  launch(): Promise<BrowserContext>;

  /**
   * Gets the current browser context.
   *
   * @returns {BrowserContext | null} The current context or null
   */
  getContext(): BrowserContext | null;

  /**
   * Gets the browser instance.
   *
   * @returns {Browser | null} The browser instance or null
   */
  getBrowser(): Browser | null;

  /**
   * Clears the browser context state.
   *
   * @returns {Promise<BrowserContext>} The cleared context
   * @throws {Error} If context clearing fails
   */
  clearContext(): Promise<BrowserContext>;

  /**
   * Closes the browser and context.
   *
   * @returns {Promise<void>}
   * @throws {Error} If closing fails
   */
  close(): Promise<void>;
}

/**
 * Interface for browser context operations.
 * Defines the contract for context-level operations.
 *
 * @interface IBrowserContextOperations
 */
export interface IBrowserContextOperations {
  /**
   * Clears cookies from the context.
   *
   * @returns {Promise<void>}
   */
  clearCookies(): Promise<void>;

  /**
   * Clears permissions from the context.
   *
   * @returns {Promise<void>}
   */
  clearPermissions(): Promise<void>;

  /**
   * Gets all pages in the context.
   *
   * @returns {Page[]} Array of pages
   */
  getPages(): Page[];

  /**
   * Adds init script to the context.
   *
   * @param {string} script - Script content
   * @param {string} [arg] - Optional script argument
   * @returns {Promise<void>}
   */
  addInitScript(script: string, arg?: string): Promise<void>;

  /**
   * Sets extra HTTP headers for the context.
   *
   * @param {Record<string, string>} headers - Headers to set
   * @returns {Promise<void>}
   */
  setExtraHTTPHeaders(headers: Record<string, string>): Promise<void>;

  /**
   * Sets geolocation for the context.
   *
   * @param {Object} geolocation - Geolocation coordinates
   * @param {number} geolocation.latitude - Latitude
   * @param {number} geolocation.longitude - Longitude
   * @param {number} [geolocation.accuracy] - Accuracy in meters
   * @returns {Promise<void>}
   */
  setGeolocation(geolocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }): Promise<void>;
}

/**
 * Interface for browser installation.
 * Defines the contract for browser installation operations.
 *
 * @interface IBrowserInstaller
 */
export interface IBrowserInstaller {
  /**
   * Installs the browser.
   *
   * @returns {Promise<{ success: boolean; error?: string }>} Installation result
   */
  install(): Promise<{ success: boolean; error?: string }>;

  /**
   * Checks if browser is installed.
   *
   * @returns {Promise<boolean>} True if installed
   */
  isInstalled(): Promise<boolean>;

  /**
   * Gets the browser executable path.
   *
   * @returns {Promise<string>} The executable path
   */
  getExecutablePath(): Promise<string>;
}

/**
 * Configuration for browser operations.
 */
export interface BrowserConfig extends ShortestConfig {
  /** Whether to run in headless mode */
  headless?: boolean;
  /** Base URL for tests */
  baseUrl: string;
  /** Browser context options */
  contextOptions?: any;
}
