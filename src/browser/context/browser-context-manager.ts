import { Browser, BrowserContext, Page } from "playwright";
import { Log, getLogger } from "@/log";
import { ShortestError } from "@/utils/errors";

/**
 * Browser context state.
 */
export interface BrowserContextState {
  /** Whether the context has been initialized */
  initialized: boolean;
  /** Number of pages in the context */
  pageCount: number;
  /** Current URL */
  currentUrl?: string;
  /** Whether cookies are cleared */
  cookiesCleared: boolean;
  /** Whether storage is cleared */
  storageCleared: boolean;
}

/**
 * Context clearing options.
 */
export interface ContextClearingOptions {
  /** Whether to clear cookies */
  clearCookies?: boolean;
  /** Whether to clear local storage */
  clearLocalStorage?: boolean;
  /** Whether to clear session storage */
  clearSessionStorage?: boolean;
  /** Whether to clear indexed DB */
  clearIndexedDB?: boolean;
  /** Whether to clear permissions */
  clearPermissions?: boolean;
  /** Whether to navigate pages to blank */
  navigateToBlank?: boolean;
  /** Whether to close additional pages */
  closeAdditionalPages?: boolean;
}

/**
 * Manager for browser context state and operations.
 * Handles context lifecycle, state management, and cleanup operations.
 *
 * This class follows the Single Responsibility Principle by focusing
 * solely on browser context management.
 *
 * @class BrowserContextManager
 *
 * @example
 * ```typescript
 * const manager = new BrowserContextManager(config);
 * await manager.initialize();
 * const context = await manager.getContext();
 * ```
 */
export class BrowserContextManager {
  private context: BrowserContext | null = null;
  private browser: Browser | null = null;
  private log: Log;
  private config: any; // ShortestConfig type

  /**
   * Creates a new browser context manager instance.
   *
   * @param {any} config - Browser configuration
   * @param {Log} log - Optional logger instance
   */
  constructor(config: any, log?: Log) {
    this.config = config;
    this.log = log || getLogger();
  }

  /**
   * Initializes the browser context.
   *
   * @param {Browser} browser - The browser instance
   * @returns {Promise<BrowserContext>} The initialized context
   *
   * @example
   * ```typescript
   * const context = await manager.initialize(browser);
   * ```
   */
  async initialize(browser: Browser): Promise<BrowserContext> {
    if (this.context) {
      this.log.warn("Context already initialized, returning existing context");
      return this.context;
    }

    this.browser = browser;

    const contextOptions = {
      viewport: { width: 1920, height: 1080 },
      baseURL: this.config.baseUrl,
      ...this.config.browser?.contextOptions,
    };

    this.log.trace("Initializing browser context", { options: contextOptions });

    try {
      this.context = await browser.newContext(contextOptions);
      const page = await this.context.newPage();
      await this.navigateToBaseUrl(page);

      return this.context;
    } catch (error) {
      this.log.error("Failed to initialize browser context", { error });
      throw new ShortestError(
        `Failed to initialize browser context: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Gets the current browser context.
   *
   * @returns {BrowserContext | null} The current context or null
   *
   * @example
   * ```typescript
   * const context = manager.getContext();
   * if (context) {
   *   console.log("Context is active");
   * }
   * ```
   */
  getContext(): BrowserContext | null {
    return this.context;
  }

  /**
   * Gets the browser instance.
   *
   * @returns {Browser | null} The browser instance or null
   */
  getBrowser(): Browser | null {
    return this.browser;
  }

  /**
   * Clears the browser context state.
   *
   * @param {ContextClearingOptions} options - Clearing options
   * @returns {Promise<BrowserContext>} The cleared context
   * @throws {ShortestError} If no context is available
   *
   * @example
   * ```typescript
   * await manager.clearContext({ clearCookies: true, clearLocalStorage: true });
   * ```
   */
  async clearContext(
    options: ContextClearingOptions = {},
  ): Promise<BrowserContext> {
    if (!this.context) {
      throw new ShortestError("No context available");
    }

    const clearingOptions = {
      clearCookies: true,
      clearLocalStorage: true,
      clearSessionStorage: true,
      clearIndexedDB: true,
      clearPermissions: true,
      navigateToBlank: true,
      closeAdditionalPages: true,
      ...options,
    };

    this.log.trace("Clearing browser context", clearingOptions);

    try {
      // Clear cookies
      if (clearingOptions.clearCookies) {
        await this.context.clearCookies();
      }

      // Clear storage on all pages
      const pages = this.context.pages();
      if (clearingOptions.clearLocalStorage || clearingOptions.clearSessionStorage || clearingOptions.clearIndexedDB) {
        await Promise.all(
          pages.map((page) =>
            page.evaluate(() => {
              if ((clearingOptions.clearLocalStorage ?? true)) {
                localStorage.clear();
              }
              if ((clearingOptions.clearSessionStorage ?? true)) {
                sessionStorage.clear();
              }
              if ((clearingOptions.clearIndexedDB ?? true)) {
                indexedDB.deleteDatabase("shortest");
              }
            }),
          ),
        );
      }

      // Clear permissions
      if (clearingOptions.clearPermissions) {
        await this.context.clearPermissions();
      }

      // Navigate all pages to blank
      if (clearingOptions.navigateToBlank) {
        await Promise.all(
          pages.map((page) => page.goto("about:blank")),
        );
      }

      // Close all pages except first
      if (clearingOptions.closeAdditionalPages && pages.length > 1) {
        await Promise.all(pages.slice(1).map((page) => page.close()));
      }

      // Navigate first page to base URL
      if (clearingOptions.navigateToBlank) {
        const firstPage = this.context.pages()[0];
        if (firstPage) {
          await firstPage.goto(this.config.baseUrl);
          await firstPage.waitForLoadState("networkidle");
        }
      }

      this.log.trace("Browser context cleared successfully");
      return this.context;
    } catch (error) {
      this.log.error("Failed to clear browser context", { error });
      throw new ShortestError(
        `Failed to clear browser context: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Recreates the browser context (alias for clearContext).
   *
   * @returns {Promise<BrowserContext>} The recreated context
   */
  recreateContext(): Promise<BrowserContext> {
    return this.clearContext();
  }

  /**
   * Closes the browser context and browser.
   *
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * await manager.close();
   * ```
   */
  async close(): Promise<void> {
    this.log.trace("Closing browser context and browser");

    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.log.trace("Browser context and browser closed successfully");
    } catch (error) {
      this.log.error("Failed to close browser context or browser", { error });
      throw new ShortestError(
        `Failed to close browser: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Gets the current context state.
   *
   * @returns {Promise<BrowserContextState>} The context state
   *
   * @example
   * ```typescript
   * const state = await manager.getState();
   * console.log("Context state:", state);
   * ```
   */
  async getState(): Promise<BrowserContextState> {
    if (!this.context) {
      return {
        initialized: false,
        pageCount: 0,
        cookiesCleared: false,
        storageCleared: false,
      };
    }

    const pages = this.context.pages();
    const firstPage = pages[0];

    return {
      initialized: true,
      pageCount: pages.length,
      currentUrl: firstPage ? firstPage.url() : undefined,
      cookiesCleared: true, // This would need to be tracked
      storageCleared: true, // This would need to be tracked
    };
  }

  /**
   * Gets all pages in the context.
   *
   * @returns {Page[]} Array of pages
   *
   * @example
   * ```typescript
   * const pages = manager.getPages();
   * console.log(`Context has ${pages.length} pages`);
   * ```
   */
  getPages(): Page[] {
    if (!this.context) {
      return [];
    }
    return this.context.pages();
  }

  /**
   * Gets the first page in the context.
   *
   * @returns {Page | null} The first page or null
   */
  getFirstPage(): Page | null {
    const pages = this.getPages();
    return pages.length > 0 ? pages[0] : null;
  }

  /**
   * Navigates a page to the base URL.
   *
   * @private
   * @param {Page} page - The page to navigate
   */
  private async navigateToBaseUrl(page: Page): Promise<void> {
    try {
      await page.goto(this.config.baseUrl);
      await page.waitForLoadState("networkidle");
      this.log.trace("Navigated to base URL", { url: this.config.baseUrl });
    } catch (error) {
      this.log.error("Failed to navigate to base URL", { error });
      throw new ShortestError(
        `Failed to navigate to base URL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Checks if the context is initialized.
   *
   * @returns {boolean} True if context is initialized
   */
  isInitialized(): boolean {
    return this.context !== null;
  }

  /**
   * Checks if the browser is active.
   *
   * @returns {boolean} True if browser is active
   */
  isBrowserActive(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }
}
