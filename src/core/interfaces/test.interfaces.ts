import { TestCase } from "@/core/runner/test-case";
import { TestRun } from "@/core/runner/test-run";
import { FileResult } from "@/core/runner";

/**
 * Interface for test compiler.
 * Defines the contract for compiling test files.
 *
 * @interface ITestCompiler
 */
export interface ITestCompiler {
  /**
   * Compiles a test file.
   *
   * @param {string} filePath - Path to the test file
   * @returns {Promise<string>} Path to the compiled file
   * @throws {Error} If compilation fails
   */
  compileFile(filePath: string): Promise<string>;

  /**
   * Loads a module from a file.
   *
   * @param {string} filename - File name
   * @param {string} [dir] - Optional directory
   * @returns {Promise<any>} The loaded module
   * @throws {Error} If loading fails
   */
  loadModule(filename: string, dir?: string): Promise<any>;

  /**
   * Clears the compiler cache.
   *
   * @returns {void}
   */
  clearCache(): void;
}

/**
 * Interface for test reporter.
 * Defines the contract for reporting test results.
 *
 * @interface ITestReporter
 */
export interface ITestReporter {
  /**
   * Called when a test run starts.
   *
   * @param {number} totalTests - Total number of tests
   * @returns {void}
   */
  onRunStart(totalTests: number): void;

  /**
   * Called when a test file starts.
   *
   * @param {string} filePath - Path to the test file
   * @param {number} testCount - Number of tests in the file
   * @returns {void}
   */
  onFileStart(filePath: string, testCount: number): void;

  /**
   * Called when a test file ends.
   *
   * @param {FileResult} result - File result
   * @returns {void}
   */
  onFileEnd(result: FileResult): void;

  /**
   * Called when a test starts.
   *
   * @param {TestCase} testCase - The test case
   * @returns {void}
   */
  onTestStart(testCase: TestCase): void;

  /**
   * Called when a test ends.
   *
   * @param {TestRun} testRun - The test run
   * @returns {void}
   */
  onTestEnd(testRun: TestRun): void;

  /**
   * Called when a test run ends.
   *
   * @returns {void}
   */
  onRunEnd(): void;

  /**
   * Reports an error.
   *
   * @param {string} phase - Phase where error occurred
   * @param {string} message - Error message
   * @returns {void}
   */
  error(phase: string, message: string): void;

  /**
   * Checks if all tests passed.
   *
   * @returns {boolean} True if all tests passed
   */
  allTestsPassed(): boolean;
}

/**
 * Interface for test runner.
 * Defines the contract for test execution.
 *
 * @interface ITestRunner
 */
export interface ITestRunner {
  /**
   * Initializes the test runner.
   *
   * @returns {void}
   */
  initialize(): void;

  /**
   * Executes tests matching the pattern.
   *
   * @param {string} testPattern - Test file pattern
   * @param {number} [lineNumber] - Optional line number for single test
   * @returns {Promise<boolean>} True if all tests passed
   * @throws {Error} If test execution fails
   */
  execute(testPattern: string, lineNumber?: number): Promise<boolean>;

  /**
   * Gets the current configuration.
   *
   * @returns {any} The configuration
   */
  getConfig(): any;
}

/**
 * Interface for test execution strategy.
 * Defines the contract for different test execution approaches.
 *
 * @interface ITestExecutionStrategy
 */
export interface ITestExecutionStrategy {
  /**
   * Executes a test using the strategy.
   *
   * @param {Object} context - Execution context
   * @param {any} context.context - Browser context
   * @param {TestRun} context.testRun - Test run instance
   * @param {Object} [context.options] - Optional execution options
   * @returns {Promise<Object>} Execution result
   * @throws {Error} If execution fails
   */
  execute(context: {
    context: any;
    testRun: TestRun;
    options?: any;
  }): Promise<{
    passed: boolean;
    reason: string;
    tokenUsage?: any;
    executionTime: number;
  }>;

  /**
   * Checks if the strategy can handle the test.
   *
   * @param {TestRun} testRun - The test run
   * @returns {boolean} True if strategy can handle
   */
  canHandle(testRun: TestRun): boolean;

  /**
   * Gets the strategy name.
   *
   * @returns {string} Strategy name
   */
  getStrategyName(): string;
}

/**
 * Interface for test hook manager.
 * Defines the contract for lifecycle hook management.
 *
 * @interface ITestHookManager
 */
export interface ITestHookManager {
  /**
   * Registers a lifecycle hook.
   *
   * @param {string} type - Hook type (beforeAll, afterAll, beforeEach, afterEach)
   * @param {Function} fn - Hook function
   * @param {string} [name] - Optional hook name
   * @returns {void}
   */
  registerHook(
    type: string,
    fn: (context: any) => void | Promise<void>,
    name?: string,
  ): void;

  /**
   * Executes before all hooks.
   *
   * @param {any} context - Test context
   * @returns {Promise<Array>} Array of execution results
   */
  executeBeforeAll(context: any): Promise<Array<any>>;

  /**
   * Executes after all hooks.
   *
   * @param {any} context - Test context
   * @returns {Promise<Array>} Array of execution results
   */
  executeAfterAll(context: any): Promise<Array<any>>;

  /**
   * Executes before each hooks.
   *
   * @param {any} context - Test context
   * @returns {Promise<Array>} Array of execution results
   */
  executeBeforeEach(context: any): Promise<Array<any>>;

  /**
   * Executes after each hooks.
   *
   * @param {any} context - Test context
   * @returns {Promise<Array>} Array of execution results
   */
  executeAfterEach(context: any): Promise<Array<any>>;

  /**
   * Clears all hooks.
   *
   * @returns {void}
   */
  clearAllHooks(): void;
}

/**
 * Interface for test registry.
 * Defines the contract for test registration and management.
 *
 * @interface ITestRegistry
 */
export interface ITestRegistry {
  /**
   * Registers a test case.
   *
   * @param {Object} testConfig - Test configuration
   * @param {string} testConfig.name - Test name
   * @param {string} testConfig.filePath - Test file path
   * @param {any} [testConfig.payload] - Optional test payload
   * @param {Function} [testConfig.fn] - Optional test function
   * @returns {TestCase} The created test case
   */
  registerTest(testConfig: {
    name: string;
    filePath: string;
    payload?: any;
    fn?: (context: any) => void | Promise<void>;
  }): TestCase;

  /**
   * Gets all tests.
   *
   * @returns {Map<string, TestCase[]>} Map of tests
   */
  getTests(): Map<string, TestCase[]>;

  /**
   * Gets current file tests.
   *
   * @returns {TestCase[]} Array of test cases
   */
  getCurrentFileTests(): TestCase[];

  /**
   * Clears all tests.
   *
   * @returns {void}
   */
  clearTests(): void;

  /**
   * Resets the registry.
   *
   * @returns {void}
   */
  reset(): void;
}

/**
 * Interface for test context factory.
 * Defines the contract for creating test contexts.
 *
 * @interface ITestContextFactory
 */
export interface ITestContextFactory {
  /**
   * Creates a test context.
   *
   * @param {any} browserContext - Browser context
   * @param {TestRun} testRun - Test run instance
   * @returns {Promise<any>} The test context
   */
  createTestContext(browserContext: any, testRun: TestRun): Promise<any>;

  /**
   * Creates a file test context.
   *
   * @param {any} browserContext - Browser context
   * @returns {Promise<any>} The file test context
   */
  createFileTestContext(browserContext: any): Promise<any>;
}
