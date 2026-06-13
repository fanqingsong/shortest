/**
 * Test Execution Strategy Module
 *
 * This module provides flexible test execution strategies that follow
 * SOLID design principles, particularly the Open/Closed Principle and Strategy Pattern.
 *
 * @module core/execution
 * @see {@link TestExecutionStrategy} for execution strategy interface
 *
 * @example
 * ```typescript
 * import { TestExecutionStrategyFactory } from "@/core/execution";
 *
 * const factory = new TestExecutionStrategyFactory(logger);
 * const strategy = factory.getStrategy(testRun);
 * const result = await strategy.execute(context);
 * ```
 */

export {
  TestExecutionStrategy,
  BaseTestExecutionStrategy,
  TestExecutionContext,
  TestExecutionOptions,
  TestExecutionResult,
} from "./test-execution-strategy.interface";
export { DirectExecutionStrategy } from "./direct-execution-strategy";
export { AIExecutionStrategy } from "./ai-execution-strategy";
export { TestExecutionStrategyFactory } from "./test-execution-factory";
