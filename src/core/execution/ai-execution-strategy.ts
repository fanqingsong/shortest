import { BaseTestExecutionStrategy, TestExecutionContext, TestExecutionResult } from "./test-execution-strategy.interface";
import { AIClient } from "@/ai/client";
import { BrowserTool } from "@/browser/core/browser-tool";
import {
  AriaSnapshotSession,
  getAriaSnapshotSessionOptions,
} from "@/browser/snapshot/aria-snapshot-session";
import { Logger } from "@/log";

/**
 * AI-powered execution strategy for tests using AI interactions.
 * Handles tests that require AI-driven browser automation.
 *
 * @class AIExecutionStrategy
 * @extends {BaseTestExecutionStrategy}
 *
 * @example
 * ```typescript
 * const strategy = new AIExecutionStrategy(logger);
 * const result = await strategy.execute({
 *   context: browserContext,
 *   testRun: testRun,
 *   options: { skipCache: false }
 * });
 * ```
 */
export class AIExecutionStrategy extends BaseTestExecutionStrategy {
  private logger: Logger;

  /**
   * Creates a new AI execution strategy instance.
   *
   * @param {Logger} logger - Logger instance for logging execution details
   */
  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  /**
   * Executes a test using AI-driven browser automation.
   *
   * @protected
   * @param {TestExecutionContext} context - The execution context
   * @returns {Promise<TestExecutionResult>} The execution result
   */
  protected async executeInternal(
    context: TestExecutionContext,
  ): Promise<TestExecutionResult> {
    const { testRun, context: browserContext, options } = context;
    const testCase = testRun.testCase;

    if (testCase.directExecution) {
      throw new Error("Test is not an AI execution test");
    }

    // Create test context
    const testContext = await this.createTestContext(browserContext, testRun);

    // Create browser tool
    const browserTool = this.createBrowserTool(testContext, testRun);

    // Create aria snapshot session
    const ariaSnapshotSession = new AriaSnapshotSession(
      testContext.page,
      getAriaSnapshotSessionOptions(),
    );
    browserTool.setAriaSnapshotSession(ariaSnapshotSession);

    // Execute before hook if present
    if (testCase.beforeFn) {
      try {
        await testCase.beforeFn(testContext);
      } catch (error) {
        return {
          passed: false,
          reason: `Before hook failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }

    // Execute AI test
    const aiResult = await this.executeAITest(
      testCase,
      browserTool,
      ariaSnapshotSession,
      testRun,
      options?.skipCache,
    );

    // Execute after hook if present
    if (testCase.afterFn) {
      try {
        await testCase.afterFn(testContext);
      } catch (error) {
        // If AI test passed but after hook failed, mark as failed
        if (aiResult.passed) {
          return {
            passed: false,
            reason: `After hook failed: ${error instanceof Error ? error.message : String(error)}`,
            tokenUsage: aiResult.tokenUsage,
          };
        }
      }
    }

    return aiResult;
  }

  /**
   * Determines if this strategy can handle the given test.
   *
   * @param {TestRun} testRun - The test run to check
   * @returns {boolean} True if this strategy can handle the test
   */
  canHandle(testRun: TestRun): boolean {
    return testRun.testCase.directExecution !== true;
  }

  /**
   * Gets the strategy name.
   *
   * @returns {string} The strategy name
   */
  getStrategyName(): string {
    return "AIExecution";
  }

  /**
   * Executes the AI-powered test.
   *
   * @private
   * @param {any} testCase - The test case
   * @param {BrowserTool} browserTool - The browser tool
   * @param {AriaSnapshotSession} ariaSnapshotSession - The aria snapshot session
   * @param {TestRun} testRun - The test run
   * @param {boolean} skipCache - Whether to skip cache
   * @returns {Promise<TestExecutionResult>} The execution result
   */
  private async executeAITest(
    testCase: any,
    browserTool: BrowserTool,
    ariaSnapshotSession: AriaSnapshotSession,
    testRun: TestRun,
    skipCache: boolean = false,
  ): Promise<TestExecutionResult> {
    try {
      this.logger.setGroup("🤖");

      // Build prompt
      const prompt = await this.buildPrompt(testCase, ariaSnapshotSession);

      // Create AI client and execute
      const aiClient = new AIClient({
        browserTool,
        testRun,
        ariaSnapshotSession,
      });

      const aiResponse = await aiClient.runAction(prompt);

      return {
        passed: aiResponse.response.status === "passed",
        reason: aiResponse.response.reason,
        tokenUsage: aiResponse.metadata.usage,
      };
    } finally {
      this.logger.resetGroup();
    }
  }

  /**
   * Builds the AI prompt for test execution.
   *
   * @private
   * @param {any} testCase - The test case
   * @param {AriaSnapshotSession} ariaSnapshotSession - The aria snapshot session
   * @returns {Promise<string>} The built prompt
   */
  private async buildPrompt(
    testCase: any,
    ariaSnapshotSession: AriaSnapshotSession,
  ): Promise<string> {
    const pageStateSection = await ariaSnapshotSession.captureFormatted();

    const prompt = [
      `Test: "${testCase.name}"`,
      testCase.payload ? `Context: ${JSON.stringify(testCase.payload)}` : "",
      `Callback function: ${testCase.fn ? " [HAS_CALLBACK]" : " [NO_CALLBACK]"}`,

      // Add expectations if they exist
      ...(testCase.expectations?.length
        ? [
            "\nExpect:",
            ...testCase.expectations.map(
              (exp: any, i: number) =>
                `${i + 1}. ${exp.description}${exp.fn ? " [HAS_CALLBACK]" : "[NO_CALLBACK]"}`,
            ),
          ]
        : ["\nExpect:", `1. "${testCase.name}" expected to be successful`]),

      pageStateSection,
    ]
      .filter(Boolean)
      .join("\n");

    return prompt;
  }

  /**
   * Creates a browser tool for test execution.
   *
   * @private
   * @param {any} testContext - The test context
   * @param {TestRun} testRun - The test run
   * @returns {BrowserTool} The browser tool
   */
  private createBrowserTool(testContext: any, testRun: TestRun): BrowserTool {
    return new BrowserTool(testContext.page, null, {
      width: 1920,
      height: 1080,
      testContext: {
        ...testContext,
        testRun,
        currentStepIndex: 0,
      },
    });
  }

  /**
   * Creates a test context for AI execution.
   *
   * @private
   * @param {BrowserContext} context - The browser context
   * @param {TestRun} testRun - The test run
   * @returns {Promise<any>} The test context
   */
  private async createTestContext(context: any, testRun: TestRun): Promise<any> {
    // For now, return a simple context
    // This would be replaced with proper context factory usage
    return {
      page: context.pages()[0],
      testRun,
    };
  }
}
