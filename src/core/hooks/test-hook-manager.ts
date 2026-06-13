import { TestContext } from "@/types";

/**
 * Lifecycle hook types.
 */
export enum HookType {
  /** Before all tests */
  BEFORE_ALL = "beforeAll",
  /** After all tests */
  AFTER_ALL = "afterAll",
  /** Before each test */
  BEFORE_EACH = "beforeEach",
  /** After each test */
  AFTER_EACH = "afterEach",
}

/**
 * Hook function signature.
 */
export type HookFunction = (context: TestContext) => void | Promise<void>;

/**
 * Hook registration with metadata.
 */
export interface HookRegistration {
  /** The hook function */
  fn: HookFunction;
  /** Hook type */
  type: HookType;
  /** Optional hook name/description */
  name?: string;
  /** Registration timestamp */
  timestamp: number;
}

/**
 * Hook execution result.
 */
export interface HookExecutionResult {
  /** Whether the hook executed successfully */
  success: boolean;
  /** Error message if execution failed */
  error?: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Hook name */
  hookName?: string;
}

/**
 * Manager for test lifecycle hooks.
 * Provides centralized management of before/after hooks for test execution.
 *
 * This class follows the Single Responsibility Principle by focusing
 * solely on lifecycle hook management.
 *
 * @class TestHookManager
 *
 * @example
 * ```typescript
 * const hookManager = new TestHookManager();
 *
 * hookManager.registerHook(HookType.BEFORE_ALL, async (context) => {
 *   console.log("Running before all tests");
 * });
 *
 * await hookManager.executeBeforeAll(testContext);
 * ```
 */
export class TestHookManager {
  private hooks: Map<HookType, HookRegistration[]>;

  /**
   * Creates a new test hook manager instance.
   */
  constructor() {
    this.hooks = new Map();

    // Initialize hook arrays for each type
    Object.values(HookType).forEach((type) => {
      this.hooks.set(type as HookType, []);
    });
  }

  /**
   * Registers a lifecycle hook.
   *
   * @param {HookType} type - The hook type
   * @param {HookFunction} fn - The hook function
   * @param {string} name - Optional hook name
   *
   * @example
   * ```typescript
   * hookManager.registerHook(HookType.BEFORE_EACH, async (context) => {
   *   console.log("Before each test");
   * });
   * ```
   */
  registerHook(type: HookType, fn: HookFunction, name?: string): void {
    const registration: HookRegistration = {
      fn,
      type,
      name,
      timestamp: Date.now(),
    };

    const hooks = this.hooks.get(type) || [];
    hooks.push(registration);
    this.hooks.set(type, hooks);
  }

  /**
   * Registers a before all hook (convenience method).
   *
   * @param {HookFunction} fn - The hook function
   * @param {string} name - Optional hook name
   */
  registerBeforeAll(fn: HookFunction, name?: string): void {
    this.registerHook(HookType.BEFORE_ALL, fn, name);
  }

  /**
   * Registers an after all hook (convenience method).
   *
   * @param {HookFunction} fn - The hook function
   * @param {string} name - Optional hook name
   */
  registerAfterAll(fn: HookFunction, name?: string): void {
    this.registerHook(HookType.AFTER_ALL, fn, name);
  }

  /**
   * Registers a before each hook (convenience method).
   *
   * @param {HookFunction} fn - The hook function
   * @param {string} name - Optional hook name
   */
  registerBeforeEach(fn: HookFunction, name?: string): void {
    this.registerHook(HookType.BEFORE_EACH, fn, name);
  }

  /**
   * Registers an after each hook (convenience method).
   *
   * @param {HookFunction} fn - The hook function
   * @param {string} name - Optional hook name
   */
  registerAfterEach(fn: HookFunction, name?: string): void {
    this.registerHook(HookType.AFTER_EACH, fn, name);
  }

  /**
   * Executes all before all hooks.
   *
   * @param {TestContext} context - The test context
   * @returns {Promise<HookExecutionResult[]>} Array of execution results
   *
   * @example
   * ```typescript
   * const results = await hookManager.executeBeforeAll(testContext);
   * ```
   */
  async executeBeforeAll(context: TestContext): Promise<HookExecutionResult[]> {
    return this.executeHooks(HookType.BEFORE_ALL, context);
  }

  /**
   * Executes all after all hooks.
   *
   * @param {TestContext} context - The test context
   * @returns {Promise<HookExecutionResult[]>} Array of execution results
   */
  async executeAfterAll(context: TestContext): Promise<HookExecutionResult[]> {
    return this.executeHooks(HookType.AFTER_ALL, context);
  }

  /**
   * Executes all before each hooks.
   *
   * @param {TestContext} context - The test context
   * @returns {Promise<HookExecutionResult[]>} Array of execution results
   */
  async executeBeforeEach(context: TestContext): Promise<HookExecutionResult[]> {
    return this.executeHooks(HookType.BEFORE_EACH, context);
  }

  /**
   * Executes all after each hooks.
   *
   * @param {TestContext} context - The test context
   * @returns {Promise<HookExecutionResult[]>} Array of execution results
   */
  async executeAfterEach(context: TestContext): Promise<HookExecutionResult[]> {
    return this.executeHooks(HookType.AFTER_EACH, context);
  }

  /**
   * Executes all hooks of a specific type.
   *
   * @private
   * @param {HookType} type - The hook type
   * @param {TestContext} context - The test context
   * @returns {Promise<HookExecutionResult[]>} Array of execution results
   */
  private async executeHooks(
    type: HookType,
    context: TestContext,
  ): Promise<HookExecutionResult[]> {
    const hooks = this.hooks.get(type) || [];
    const results: HookExecutionResult[] = [];

    for (const hook of hooks) {
      const result = await this.executeHook(hook, context);
      results.push(result);

      // If hook failed and it's a before hook, stop execution
      if (!result.success && type.startsWith("before")) {
        break;
      }
    }

    return results;
  }

  /**
   * Executes a single hook.
   *
   * @private
   * @param {HookRegistration} hook - The hook to execute
   * @param {TestContext} context - The test context
   * @returns {Promise<HookExecutionResult>} Execution result
   */
  private async executeHook(
    hook: HookRegistration,
    context: TestContext,
  ): Promise<HookExecutionResult> {
    const startTime = Date.now();

    try {
      await hook.fn(context);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        executionTime,
        hookName: hook.name,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
        hookName: hook.name,
      };
    }
  }

  /**
   * Gets all registered hooks of a specific type.
   *
   * @param {HookType} type - The hook type
   * @returns {HookRegistration[]} Array of hooks
   */
  getHooks(type: HookType): HookRegistration[] {
    return [...(this.hooks.get(type) || [])];
  }

  /**
   * Gets all registered hooks.
   *
   * @returns {Map<HookType, HookRegistration[]>} Map of hooks by type
   */
  getAllHooks(): Map<HookType, HookRegistration[]> {
    const result = new Map<HookType, HookRegistration[]>();

    for (const [type, hooks] of this.hooks.entries()) {
      result.set(type, [...hooks]);
    }

    return result;
  }

  /**
   * Clears all hooks of a specific type.
   *
   * @param {HookType} type - The hook type to clear
   */
  clearHooks(type: HookType): void {
    this.hooks.set(type, []);
  }

  /**
   * Clears all registered hooks.
   */
  clearAllHooks(): void {
    for (const type of Object.values(HookType)) {
      this.hooks.set(type as HookType, []);
    }
  }

  /**
   * Checks if any hooks are registered for a specific type.
   *
   * @param {HookType} type - The hook type
   * @returns {boolean} True if hooks are registered
   */
  hasHooks(type: HookType): boolean {
    const hooks = this.hooks.get(type);
    return hooks ? hooks.length > 0 : false;
  }

  /**
   * Gets hook statistics.
   *
   * @returns {Object} Hook statistics
   */
  getStats(): {
    totalHooks: number;
    hooksByType: Record<string, number>;
  } {
    let totalHooks = 0;
    const hooksByType: Record<string, number> = {};

    for (const [type, hooks] of this.hooks.entries()) {
      hooksByType[type] = hooks.length;
      totalHooks += hooks.length;
    }

    return {
      totalHooks,
      hooksByType,
    };
  }

  /**
   * Removes a specific hook by name and type.
   *
   * @param {HookType} type - The hook type
   * @param {string} name - The hook name
   * @returns {boolean} True if hook was removed
   */
  removeHook(type: HookType, name: string): boolean {
    const hooks = this.hooks.get(type) || [];
    const originalLength = hooks.length;

    const filtered = hooks.filter((hook) => hook.name !== name);
    this.hooks.set(type, filtered);

    return filtered.length < originalLength;
  }
}
