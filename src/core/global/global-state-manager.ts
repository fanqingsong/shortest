import { expect as jestExpect } from "expect";
import { TestRegistry } from "@/core/registry";
import { ShortestStrictConfig } from "@/types/config";

/**
 * Global state configuration.
 */
export interface GlobalStateConfig {
  /** Whether to initialize automatically */
  autoInitialize?: boolean;
  /** Custom expect function */
  customExpect?: any;
}

/**
 * Global state containing test registry and configuration.
 */
export interface GlobalState {
  /** Expect function for assertions */
  expect: any;
  /** Test registry */
  registry: {
    tests: Map<string, any[]>;
    currentFileTests: any[];
    currentFilePath: string;
    beforeAllFns: Array<(context: any) => void | Promise<void>>;
    afterAllFns: Array<(context: any) => void | Promise<void>>;
    beforeEachFns: Array<(context: any) => void | Promise<void>>;
    afterEachFns: Array<(context: any) => void | Promise<void>>;
    directTestCount: number;
  };
}

/**
 * Manager for global state in the Shortest testing framework.
 * Handles initialization, configuration, and global state access.
 *
 * This class follows the Single Responsibility Principle by focusing
 * solely on global state management.
 *
 * @class GlobalStateManager
 *
 * @example
 * ```typescript
 * const manager = new GlobalStateManager();
 * manager.initialize();
 * const state = manager.getState();
 * ```
 */
export class GlobalStateManager {
  private static instance: GlobalStateManager | null = null;
  private state: GlobalState | null = null;
  private config: ShortestStrictConfig | null = null;
  private testRegistry: TestRegistry;

  /**
   * Creates a new global state manager instance.
   * Private constructor to enforce singleton pattern.
   *
   * @private
   * @param {GlobalStateConfig} options - Configuration options
   */
  private constructor(options: GlobalStateConfig = {}) {
    this.testRegistry = new TestRegistry();

    if (options.autoInitialize !== false) {
      this.initialize(options);
    }
  }

  /**
   * Gets the singleton instance of the global state manager.
   *
   * @param {GlobalStateConfig} options - Configuration options (only used on first call)
   * @returns {GlobalStateManager} The singleton instance
   *
   * @example
   * ```typescript
   * const manager = GlobalStateManager.getInstance();
   * ```
   */
  static getInstance(options: GlobalStateConfig = {}): GlobalStateManager {
    if (!GlobalStateManager.instance) {
      GlobalStateManager.instance = new GlobalStateManager(options);
    }
    return GlobalStateManager.instance;
  }

  /**
   * Resets the singleton instance.
   * Useful for testing or resetting state.
   *
   * @example
   * ```typescript
   * GlobalStateManager.resetInstance();
   * const manager = GlobalStateManager.getInstance();
   * ```
   */
  static resetInstance(): void {
    GlobalStateManager.instance = null;
  }

  /**
   * Initializes the global state.
   *
   * @param {GlobalStateConfig} options - Configuration options
   *
   * @example
   * ```typescript
   * manager.initialize({ customExpect: myExpect });
   * ```
   */
  initialize(options: GlobalStateConfig = {}): void {
    if (this.state) {
      return; // Already initialized
    }

    const expectFunction = options.customExpect || jestExpect;

    this.state = {
      expect: expectFunction,
      registry: {
        tests: new Map<string, any[]>(),
        currentFileTests: [],
        currentFilePath: "",
        beforeAllFns: [],
        afterAllFns: [],
        beforeEachFns: [],
        afterEachFns: [],
        directTestCount: 0,
      },
    };

    // Attach to global scope
    if (typeof global !== "undefined") {
      (global as any).__shortest__ = this.state;
      (global as any).expect = this.state.expect;
    }
  }

  /**
   * Gets the global state.
   *
   * @returns {GlobalState} The global state
   * @throws {Error} If state is not initialized
   *
   * @example
   * ```typescript
   * const state = manager.getState();
   * ```
   */
  getState(): GlobalState {
    if (!this.state) {
      throw new Error("Global state not initialized. Call initialize() first.");
    }
    return this.state;
  }

  /**
   * Sets the global configuration.
   *
   * @param {ShortestStrictConfig} config - The configuration
   *
   * @example
   * ```typescript
   * manager.setConfig(parsedConfig);
   * ```
   */
  setConfig(config: ShortestStrictConfig): void {
    this.config = config;
  }

  /**
   * Gets the global configuration.
   *
   * @returns {ShortestStrictConfig | null} The configuration or null
   */
  getConfig(): ShortestStrictConfig | null {
    return this.config;
  }

  /**
   * Gets the test registry.
   *
   * @returns {TestRegistry} The test registry
   */
  getTestRegistry(): TestRegistry {
    return this.testRegistry;
  }

  /**
   * Gets the expect function.
   *
   * @returns {any} The expect function
   */
  getExpect(): any {
    const state = this.getState();
    return state.expect;
  }

  /**
   * Checks if the global state is initialized.
   *
   * @returns {boolean} True if initialized
   */
  isInitialized(): boolean {
    return this.state !== null;
  }

  /**
   * Resets the global state.
   * Clears all tests, hooks, and configuration.
   *
   * @example
   * ```typescript
   * manager.reset();
   * ```
   */
  reset(): void {
    this.state = null;
    this.config = null;
    this.testRegistry.reset();

    // Clear global scope
    if (typeof global !== "undefined") {
      delete (global as any).__shortest__;
      delete (global as any).expect;
    }
  }

  /**
   * Gets state statistics.
   *
   * @returns {Object} State statistics
   *
   * @example
   * ```typescript
   * const stats = manager.getStats();
   * console.log("State stats:", stats);
   * ```
   */
  getStats(): {
    initialized: boolean;
    hasConfig: boolean;
    registryStats: ReturnType<TestRegistry["getStats"]>;
  } {
    return {
      initialized: this.isInitialized(),
      hasConfig: this.config !== null,
      registryStats: this.testRegistry.getStats(),
    };
  }

  /**
   * Synchronizes the test registry with global state.
   * Ensures the global registry matches the TestRegistry state.
   *
   * @private
   */
  private syncRegistryWithGlobal(): void {
    if (!this.state) {
      return;
    }

    const registryState = this.testRegistry.getState();

    this.state.registry = {
      tests: registryState.tests,
      currentFileTests: registryState.currentFileTests,
      currentFilePath: registryState.currentFilePath,
      beforeAllFns: registryState.beforeAllFns,
      afterAllFns: registryState.afterAllFns,
      beforeEachFns: registryState.beforeEachFns,
      afterEachFns: registryState.afterEachFns,
      directTestCount: registryState.directTestCount,
    };
  }

  /**
   * Gets a snapshot of the current global state.
   * Useful for debugging or logging.
   *
   * @returns {Object} State snapshot
   *
   * @example
   * ```typescript
   * const snapshot = manager.getSnapshot();
   * console.log("Current state:", snapshot);
   * ```
   */
  getSnapshot(): {
    state: GlobalState | null;
    config: ShortestStrictConfig | null;
    registryState: ReturnType<TestRegistry["getState"]>;
  } {
    return {
      state: this.state ? { ...this.state, registry: { ...this.state.registry } } : null,
      config: this.config,
      registryState: this.testRegistry.getState(),
    };
  }

  /**
   * Validates the global state integrity.
   *
   * @returns {Object} Validation result
   *
   * @example
   * ```typescript
   * const validation = manager.validateState();
   * if (!validation.valid) {
   *   console.log("State issues:", validation.issues);
   * }
   * ```
   */
  validateState(): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!this.state) {
      issues.push("Global state is not initialized");
      return { valid: false, issues };
    }

    if (!this.state.expect) {
      issues.push("Expect function is not set");
    }

    if (!this.state.registry) {
      issues.push("Registry is not set");
    }

    if (!this.config) {
      issues.push("Configuration is not set");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
