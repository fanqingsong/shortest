import { TestCase } from "@/core/runner/test-case";
import { createTestCase } from "@/core/runner/test-case";

/**
 * Test registry state.
 */
export interface TestRegistryState {
  /** Map of test names to test cases */
  tests: Map<string, TestCase[]>;
  /** Tests in current file */
  currentFileTests: TestCase[];
  /** Current file path */
  currentFilePath: string;
  /** Before all hooks */
  beforeAllFns: Array<(context: any) => void | Promise<void>>;
  /** After all hooks */
  afterAllFns: Array<(context: any) => void | Promise<void>>;
  /** Before each hooks */
  beforeEachFns: Array<(context: any) => void | Promise<void>>;
  /** After each hooks */
  afterEachFns: Array<(context: any) => void | Promise<void>>;
  /** Direct test count */
  directTestCount: number;
}

/**
 * Manager for test registration and lifecycle hooks.
 * Handles test case registration and stores test-related state.
 *
 * This class follows the Single Responsibility Principle by focusing
 * solely on test registration and management.
 *
 * @class TestRegistry
 *
 * @example
 * ```typescript
 * const registry = new TestRegistry();
 *
 * const testCase = registry.registerTest({
 *   name: "My test",
 *   filePath: "/path/to/test.ts"
 * });
 * ```
 */
export class TestRegistry {
  private state: TestRegistryState;

  /**
   * Creates a new test registry instance.
   */
  constructor() {
    this.state = {
      tests: new Map<string, TestCase[]>(),
      currentFileTests: [],
      currentFilePath: "",
      beforeAllFns: [],
      afterAllFns: [],
      beforeEachFns: [],
      afterEachFns: [],
      directTestCount: 0,
    };
  }

  /**
   * Registers a test case.
   *
   * @param {Object} testConfig - Test configuration
   * @param {string} testConfig.name - Test name
   * @param {string} testConfig.filePath - Test file path
   * @param {any} testConfig.payload - Optional test payload
   * @param {Function} testConfig.fn - Optional test function
   * @param {boolean} testConfig.directExecution - Whether this is a direct execution test
   * @returns {TestCase} The created test case
   *
   * @example
   * ```typescript
   * const testCase = registry.registerTest({
   *   name: "My test",
   *   filePath: "/path/to/test.ts"
   * });
   * ```
   */
  registerTest(testConfig: {
    name: string;
    filePath: string;
    payload?: any;
    fn?: (context: any) => void | Promise<void>;
    directExecution?: boolean;
  }): TestCase {
    const testCase = createTestCase({
      name: this.normalizeName(testConfig.name),
      filePath: testConfig.filePath,
      payload: testConfig.payload,
      fn: testConfig.fn,
      directExecution: testConfig.directExecution,
      expectations: [],
    });

    // Add to tests map
    const existingTests = this.state.tests.get(testCase.name) || [];
    this.state.tests.set(testCase.name, [...existingTests, testCase]);

    // Add to current file tests
    this.state.currentFileTests.push(testCase);

    // Track direct execution tests
    if (testCase.directExecution) {
      this.state.directTestCount++;
    }

    return testCase;
  }

  /**
   * Registers multiple tests (array of test names).
   *
   * @param {string[]} names - Test names
   * @param {string} filePath - Test file path
   * @returns {TestCase[]} Array of created test cases
   *
   * @example
   * ```typescript
   * const tests = registry.registerTests(
   *   ["Test 1", "Test 2"],
   *   "/path/to/test.ts"
   * );
   * ```
   */
  registerTests(names: string[], filePath: string): TestCase[] {
    return names.map((name) =>
      this.registerTest({
        name,
        filePath,
      }),
    );
  }

  /**
   * Registers a before all hook.
   *
   * @param {Function} fn - The hook function
   *
   * @example
   * ```typescript
   * registry.registerBeforeAll(async (context) => {
   *   console.log("Before all tests");
   * });
   * ```
   */
  registerBeforeAll(fn: (context: any) => void | Promise<void>): void {
    this.state.beforeAllFns.push(fn);
  }

  /**
   * Registers an after all hook.
   *
   * @param {Function} fn - The hook function
   */
  registerAfterAll(fn: (context: any) => void | Promise<void>): void {
    this.state.afterAllFns.push(fn);
  }

  /**
   * Registers a before each hook.
   *
   * @param {Function} fn - The hook function
   */
  registerBeforeEach(fn: (context: any) => void | Promise<void>): void {
    this.state.beforeEachFns.push(fn);
  }

  /**
   * Registers an after each hook.
   *
   * @param {Function} fn - The hook function
   */
  registerAfterEach(fn: (context: any) => void | Promise<void>): void {
    this.state.afterEachFns.push(fn);
  }

  /**
   * Gets all tests.
   *
   * @returns {Map<string, TestCase[]>} Map of test names to test cases
   */
  getTests(): Map<string, TestCase[]> {
    return new Map(this.state.tests);
  }

  /**
   * Gets tests for a specific name.
   *
   * @param {string} name - Test name
   * @returns {TestCase[]} Array of test cases
   */
  getTestsByName(name: string): TestCase[] {
    return this.state.tests.get(name) || [];
  }

  /**
   * Gets current file tests.
   *
   * @returns {TestCase[]} Array of test cases
   */
  getCurrentFileTests(): TestCase[] {
    return [...this.state.currentFileTests];
  }

  /**
   * Gets current file path.
   *
   * @returns {string} Current file path
   */
  getCurrentFilePath(): string {
    return this.state.currentFilePath;
  }

  /**
   * Sets current file path.
   *
   * @param {string} filePath - The file path
   */
  setCurrentFilePath(filePath: string): void {
    this.state.currentFilePath = filePath;
  }

  /**
   * Gets before all hooks.
   *
   * @returns {Array<Function>} Array of hook functions
   */
  getBeforeAllHooks(): Array<(context: any) => void | Promise<void>> {
    return [...this.state.beforeAllFns];
  }

  /**
   * Gets after all hooks.
   *
   * @returns {Array<Function>} Array of hook functions
   */
  getAfterAllHooks(): Array<(context: any) => void | Promise<void>> {
    return [...this.state.afterAllFns];
  }

  /**
   * Gets before each hooks.
   *
   * @returns {Array<Function>} Array of hook functions
   */
  getBeforeEachHooks(): Array<(context: any) => void | Promise<void>> {
    return [...this.state.beforeEachFns];
  }

  /**
   * Gets after each hooks.
   *
   * @returns {Array<Function>} Array of hook functions
   */
  getAfterEachHooks(): Array<(context: any) => void | Promise<void>> {
    return [...this.state.afterEachFns];
  }

  /**
   * Clears all tests.
   */
  clearTests(): void {
    this.state.tests.clear();
  }

  /**
   * Clears current file tests.
   */
  clearCurrentFileTests(): void {
    this.state.currentFileTests = [];
  }

  /**
   * Clears all hooks.
   */
  clearHooks(): void {
    this.state.beforeAllFns = [];
    this.state.afterAllFns = [];
    this.state.beforeEachFns = [];
    this.state.afterEachFns = [];
  }

  /**
   * Resets the registry state.
   */
  reset(): void {
    this.clearTests();
    this.clearCurrentFileTests();
    this.clearHooks();
    this.state.currentFilePath = "";
    this.state.directTestCount = 0;
  }

  /**
   * Gets registry statistics.
   *
   * @returns {Object} Registry statistics
   */
  getStats(): {
    totalTests: number;
    uniqueTestNames: number;
    currentFileTests: number;
    directTestCount: number;
    hooksCount: {
      beforeAll: number;
      afterAll: number;
      beforeEach: number;
      afterEach: number;
    };
  } {
    const totalTests = Array.from(this.state.tests.values()).reduce(
      (sum, tests) => sum + tests.length,
      0,
    );

    return {
      totalTests,
      uniqueTestNames: this.state.tests.size,
      currentFileTests: this.state.currentFileTests.length,
      directTestCount: this.state.directTestCount,
      hooksCount: {
        beforeAll: this.state.beforeAllFns.length,
        afterAll: this.state.afterAllFns.length,
        beforeEach: this.state.beforeEachFns.length,
        afterEach: this.state.afterEachFns.length,
      },
    };
  }

  /**
   * Normalizes a test name.
   *
   * @private
   * @param {string} name - The test name
   * @returns {string} Normalized test name
   */
  private normalizeName(name: string): string {
    return name.replace(/\s+/g, " ").trim();
  }

  /**
   * Gets the raw registry state.
   *
   * @returns {TestRegistryState} The registry state
   */
  getState(): TestRegistryState {
    return {
      tests: new Map(this.state.tests),
      currentFileTests: [...this.state.currentFileTests],
      currentFilePath: this.state.currentFilePath,
      beforeAllFns: [...this.state.beforeAllFns],
      afterAllFns: [...this.state.afterAllFns],
      beforeEachFns: [...this.state.beforeEachFns],
      afterEachFns: [...this.state.afterEachFns],
      directTestCount: this.state.directTestCount,
    };
  }
}
