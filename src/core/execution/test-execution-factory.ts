import { TestExecutionStrategy } from "./test-execution-strategy.interface";
import { DirectExecutionStrategy } from "./direct-execution-strategy";
import { AIExecutionStrategy } from "./ai-execution-strategy";
import { TestRun } from "@/core/runner/test-run";
import { Logger } from "@/log";
import { ShortestError } from "@/utils/errors";

/**
 * Factory for creating and managing test execution strategies.
 * Implements the Factory Pattern to encapsulate strategy creation logic.
 *
 * This class follows the Open/Closed Principle - new strategies can be added
 * without modifying existing client code.
 *
 * @class TestExecutionStrategyFactory
 *
 * @example
 * ```typescript
 * const factory = new TestExecutionStrategyFactory(logger);
 * const strategy = factory.getStrategy(testRun);
 * const result = await strategy.execute(context);
 * ```
 */
export class TestExecutionStrategyFactory {
  private strategies: Map<string, TestExecutionStrategy>;
  private logger: Logger;

  /**
   * Creates a new test execution strategy factory instance.
   *
   * @param {Logger} logger - Logger instance for strategy operations
   */
  constructor(logger: Logger) {
    this.logger = logger;
    this.strategies = new Map();

    // Register default strategies
    this.registerDefaultStrategies();
  }

  /**
   * Registers default execution strategies.
   *
   * @private
   */
  private registerDefaultStrategies(): void {
    this.registerStrategy("DirectExecution", new DirectExecutionStrategy());
    this.registerStrategy("AIExecution", new AIExecutionStrategy(this.logger));
  }

  /**
   * Registers a new execution strategy.
   *
   * @param {string} name - Unique strategy name
   * @param {TestExecutionStrategy} strategy - The strategy instance
   *
   * @example
   * ```typescript
   * factory.registerStrategy("Custom", new CustomExecutionStrategy());
   * ```
   */
  registerStrategy(name: string, strategy: TestExecutionStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * Unregisters an execution strategy.
   *
   * @param {string} name - Strategy name to unregister
   */
  unregisterStrategy(name: string): void {
    this.strategies.delete(name);
  }

  /**
   * Gets an appropriate execution strategy for the given test run.
   * Automatically selects the best strategy based on test characteristics.
   *
   * @param {TestRun} testRun - The test run to get strategy for
   * @returns {TestExecutionStrategy} The selected strategy
   * @throws {ShortestError} If no strategy can handle the test
   *
   * @example
   * ```typescript
   * const strategy = factory.getStrategy(testRun);
   * ```
   */
  getStrategy(testRun: TestRun): TestExecutionStrategy {
    // Find a strategy that can handle this test
    for (const strategy of this.strategies.values()) {
      if (strategy.canHandle(testRun)) {
        return strategy;
      }
    }

    throw new ShortestError("No execution strategy available for this test");
  }

  /**
   * Gets a specific execution strategy by name.
   *
   * @param {string} name - The strategy name
   * @returns {TestExecutionStrategy} The strategy
   * @throws {Error} If strategy is not found
   *
   * @example
   * ```typescript
   * const strategy = factory.getStrategyByName("AIExecution");
   * ```
   */
  getStrategyByName(name: string): TestExecutionStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Execution strategy '${name}' not found`);
    }
    return strategy;
  }

  /**
   * Checks if a strategy is registered.
   *
   * @param {string} name - Strategy name to check
   * @returns {boolean} True if strategy is registered
   */
  hasStrategy(name: string): boolean {
    return this.strategies.has(name);
  }

  /**
   * Gets all registered strategy names.
   *
   * @returns {string[]} Array of strategy names
   */
  getRegisteredStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Gets all registered strategies.
   *
   * @returns {TestExecutionStrategy[]} Array of strategies
   */
  getAllStrategies(): TestExecutionStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Clears all registered strategies.
   */
  clearStrategies(): void {
    this.strategies.clear();
  }

  /**
   * Gets strategy statistics.
   *
   * @returns {Object} Strategy statistics
   */
  getStats(): {
    totalStrategies: number;
    strategyNames: string[];
    defaultStrategies: string[];
  } {
    return {
      totalStrategies: this.strategies.size,
      strategyNames: this.getRegisteredStrategies(),
      defaultStrategies: ["DirectExecution", "AIExecution"],
    };
  }
}
