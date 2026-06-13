import { BaseTestExecutionStrategy, TestExecutionContext, TestExecutionResult } from "./test-execution-strategy.interface";

/**
 * Direct execution strategy for tests without AI interaction.
 * Handles tests that are executed directly via provided functions.
 *
 * @class DirectExecutionStrategy
 * @extends {BaseTestExecutionStrategy}
 *
 * @example
 * ```typescript
 * const strategy = new DirectExecutionStrategy();
 * const result = await strategy.execute({
 *   context: browserContext,
 *   testRun: testRun
 * });
 * ```
 */
export class DirectExecutionStrategy extends BaseTestExecutionStrategy {
  /**
   * Executes a test directly using its provided function.
   *
   * @protected
   * @param {TestExecutionContext} context - The execution context
   * @returns {Promise<TestExecutionResult>} The execution result
   */
  protected async executeInternal(
    context: TestExecutionContext,
  ): Promise<TestExecutionResult> {
    const { testRun, context: browserContext } = context;
    const testCase = testRun.testCase;

    if (!testCase.directExecution || !testCase.fn) {
      throw new Error("Test is not a direct execution test");
    }

    // Create test context
    const testContext = await this.createTestContext(browserContext, testRun);

    try {
      // Execute the test function
      await testCase.fn(testContext);

      return {
        passed: true,
        reason: "Direct execution successful",
      };
    } catch (error) {
      return {
        passed: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Determines if this strategy can handle the given test.
   *
   * @param {TestRun} testRun - The test run to check
   * @returns {boolean} True if this strategy can handle the test
   */
  canHandle(testRun: TestRun): boolean {
    return testRun.testCase.directExecution === true;
  }

  /**
   * Gets the strategy name.
   *
   * @returns {string} The strategy name
   */
  getStrategyName(): string {
    return "DirectExecution";
  }

  /**
   * Creates a test context for direct execution.
   *
   * @private
   * @param {BrowserContext} context - The browser context
   * @param {TestRun} testRun - The test run
   * @returns {Promise<any>} The test context
   */
  private async createTestContext(context: any, testRun: TestRun): Promise<any> {
    // Import TestContextFactory dynamically to avoid circular dependencies
    const { TestContextFactory } = await import("@/core/context/test-context-factory");

    // For now, return a simple context
    // This would be replaced with proper context factory usage
    return {
      page: context.pages()[0],
      testRun,
    };
  }
}
