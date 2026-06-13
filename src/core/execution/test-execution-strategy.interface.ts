import { TestRun } from "@/core/runner/test-run";
import { BrowserContext } from "playwright";

/**
 * Test execution context containing dependencies needed for execution.
 */
export interface TestExecutionContext {
  /** Browser context for test execution */
  context: BrowserContext;
  /** Test run instance */
  testRun: TestRun;
  /** Additional execution options */
  options?: TestExecutionOptions;
}

/**
 * Test execution options.
 */
export interface TestExecutionOptions {
  /** Whether to skip cache */
  skipCache?: boolean;
  /** Whether to run in headless mode */
  headless?: boolean;
  /** Timeout for test execution in milliseconds */
  timeout?: number;
  /** Additional custom options */
  [key: string]: any;
}

/**
 * Test execution result.
 */
export interface TestExecutionResult {
  /** Whether the test passed */
  passed: boolean;
  /** Reason for test result */
  reason: string;
  /** Token usage if tracked */
  tokenUsage?: any;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Interface for test execution strategies.
 * Defines the contract for different test execution approaches.
 *
 * This interface follows the Strategy Pattern and Open/Closed Principle,
 * allowing new execution strategies to be added without modifying existing code.
 *
 * @interface TestExecutionStrategy
 *
 * @example
 * ```typescript
 * const strategy = new DirectExecutionStrategy();
 * const result = await strategy.execute(context);
 * ```
 */
export interface TestExecutionStrategy {
  /**
   * Executes a test using the specific strategy.
   *
   * @param {TestExecutionContext} context - The execution context
   * @returns {Promise<TestExecutionResult>} The execution result
   */
  execute(context: TestExecutionContext): Promise<TestExecutionResult>;

  /**
   * Determines if this strategy can handle the given test.
   *
   * @param {TestRun} testRun - The test run to check
   * @returns {boolean} True if this strategy can handle the test
   */
  canHandle(testRun: TestRun): boolean;

  /**
   * Gets the strategy name for identification purposes.
   *
   * @returns {string} The strategy name
   */
  getStrategyName(): string;

  /**
   * Validates that the execution context is valid for this strategy.
   *
   * @param {TestExecutionContext} context - The execution context to validate
   * @returns {boolean} True if context is valid
   * @throws {Error} If context is invalid
   */
  validateContext(context: TestExecutionContext): boolean;
}

/**
 * Abstract base class for test execution strategies.
 * Provides common functionality for test execution.
 *
 * @abstract
 * @class BaseTestExecutionStrategy
 * @implements {TestExecutionStrategy}
 */
export abstract class BaseTestExecutionStrategy implements TestExecutionStrategy {
  /**
   * Executes a test with timing and error handling.
   *
   * @param {TestExecutionContext} context - The execution context
   * @returns {Promise<TestExecutionResult>} The execution result
   */
  async execute(context: TestExecutionContext): Promise<TestExecutionResult> {
    const startTime = Date.now();

    // Validate context before execution
    this.validateContext(context);

    try {
      const result = await this.executeInternal(context);
      const executionTime = Date.now() - startTime;

      return {
        ...result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        passed: false,
        reason: error instanceof Error ? error.message : String(error),
        executionTime,
      };
    }
  }

  /**
   * Internal execution method to be implemented by subclasses.
   *
   * @protected
   * @abstract
   * @param {TestExecutionContext} context - The execution context
   * @returns {Promise<TestExecutionResult>} The execution result
   */
  protected abstract executeInternal(
    context: TestExecutionContext,
  ): Promise<TestExecutionResult>;

  /**
   * Validates that the execution context is valid for this strategy.
   *
   * @param {TestExecutionContext} context - The execution context to validate
   * @returns {boolean} True if context is valid
   * @throws {Error} If context is invalid
   */
  validateContext(context: TestExecutionContext): boolean {
    if (!context.context) {
      throw new Error("Browser context is required");
    }
    if (!context.testRun) {
      throw new Error("Test run is required");
    }
    return true;
  }

  /**
   * Gets the strategy name for identification purposes.
   *
   * @abstract
   * @returns {string} The strategy name
   */
  abstract getStrategyName(): string;

  /**
   * Determines if this strategy can handle the given test.
   * Default implementation checks if test case matches criteria.
   *
   * @param {TestRun} testRun - The test run to check
   * @returns {boolean} True if this strategy can handle the test
   */
  canHandle(testRun: TestRun): boolean {
    return true; // Default to handling all tests
  }
}
