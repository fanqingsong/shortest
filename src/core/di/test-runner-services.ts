import { DIContainer, ServiceLifecycle } from "./container";
import { ShortestStrictConfig } from "@/types/config";
import { TestCompiler } from "@/core/compiler";
import { TestReporter } from "@/core/runner/test-reporter";
import { BrowserManager } from "@/browser/manager";

/**
 * Service registry for TestRunner and its dependencies.
 * Provides pre-configured services for test execution.
 *
 * This class follows the Dependency Inversion Principle by managing
 * dependencies through abstractions rather than concrete implementations.
 *
 * @class TestRunnerServiceRegistry
 *
 * @example
 * ```typescript
 * const config = parseConfig(userConfig);
 * const registry = new TestRunnerServiceRegistry(config);
 * const container = registry.createContainer();
 *
 * const browserManager = container.resolve<BrowserManager>("BrowserManager");
 * const testCompiler = container.resolve<TestCompiler>("TestCompiler");
 * ```
 */
export class TestRunnerServiceRegistry {
  private config: ShortestStrictConfig;

  /**
   * Creates a new TestRunner service registry instance.
   *
   * @param {ShortestStrictConfig} config - The application configuration
   */
  constructor(config: ShortestStrictConfig) {
    this.config = config;
  }

  /**
   * Creates and configures a DI container with all TestRunner services.
   *
   * @returns {DIContainer} Configured container with all services registered
   */
  createContainer(): DIContainer {
    const container = new DIContainer();

    this.registerBrowserServices(container);
    this.registerCompilerServices(container);
    this.registerReportingServices(container);
    this.registerAIServices(container);
    this.registerUtilityServices(container);

    return container;
  }

  /**
   * Registers browser-related services.
   *
   * @private
   * @param {DIContainer} container - The container to register services with
   */
  private registerBrowserServices(container: DIContainer): void {
    // BrowserManager - Singleton, manages browser lifecycle
    container.registerSingleton("BrowserManager", {
      factory: () => new BrowserManager(this.config),
    });

    // AriaSnapshotSession - Transient, created per test
    container.registerTransient("AriaSnapshotSession", {
      factory: () => {
        const { AriaSnapshotSession } = require("@/browser/snapshot/aria-snapshot-session");
        // Note: Page will be injected at runtime
        return null;
      },
    });
  }

  /**
   * Registers compiler-related services.
   *
   * @private
   * @param {DIContainer} container - The container to register services with
   */
  private registerCompilerServices(container: DIContainer): void {
    // TestCompiler - Singleton, compiles test files
    container.registerSingleton("TestCompiler", {
      factory: () => new TestCompiler(),
    });
  }

  /**
   * Registers reporting-related services.
   *
   * @private
   * @param {DIContainer} container - The container to register services with
   */
  private registerReportingServices(container: DIContainer): void {
    // TestReporter - Singleton, reports test results
    container.registerSingleton("TestReporter", {
      factory: () => new TestReporter(),
    });

    // TestRunRepository - Transient, manages test run data
    container.registerTransient("TestRunRepository", {
      factory: () => {
        const { TestRunRepository } = require("@/core/runner/test-run-repository");
        return TestRunRepository;
      },
    });
  }

  /**
   * Registers AI-related services.
   *
   * @private
   * @param {DIContainer} container - The container to register services with
   */
  private registerAIServices(container: DIContainer): void {
    // AIClient - Transient, created per test
    container.registerTransient("AIClient", {
      factory: () => {
        const { AIClient } = require("@/ai/client");
        return AIClient;
      },
    });

    // AIProviderFactory - Singleton, creates AI providers
    container.registerSingleton("AIProviderFactory", {
      factory: () => {
        const { AIProviderFactory } = require("@/ai/providers");
        return new AIProviderFactory();
      },
    });

    // AIErrorHandlerFactory - Singleton, creates error handlers
    container.registerSingleton("AIErrorHandlerFactory", {
      factory: () => {
        const { getErrorHandlerFactory } = require("@/ai/error-handling");
        return getErrorHandlerFactory();
      },
    });

    // ConversationManager - Scoped, manages conversation per test
    container.registerScoped("ConversationManager", {
      factory: () => {
        const { ConversationManager } = require("@/ai/conversation");
        return new ConversationManager();
      },
    });

    // TokenUsageTracker - Scoped, tracks usage per test
    container.registerScoped("TokenUsageTracker", {
      factory: () => {
        const { TokenUsageTracker } = require("@/ai/usage");
        return new TokenUsageTracker();
      },
    });

    // RetryStrategy - Scoped, manages retries per test
    container.registerScoped("RetryStrategy", {
      factory: () => {
        const { ErrorAwareRetryStrategy } = require("@/ai/retry");
        return new ErrorAwareRetryStrategy({
          maxRetries: 3,
          provider: this.config.ai.provider,
        });
      },
    });
  }

  /**
   * Registers utility services.
   *
   * @private
   * @param {DIContainer} container - The container to register services with
   */
  private registerUtilityServices(container: DIContainer): void {
    // Logger - Singleton, provides logging functionality
    container.registerSingleton("Logger", {
      factory: () => {
        const { getLogger } = require("@/log");
        return getLogger();
      },
    });

    // TestHookManager - Singleton, manages lifecycle hooks
    container.registerSingleton("TestHookManager", {
      factory: () => {
        const { TestHookManager } = require("@core/hooks/test-hook-manager");
        return new TestHookManager();
      },
    });

    // TestContextFactory - Transient, creates test contexts
    container.registerTransient("TestContextFactory", {
      factory: () => {
        const { TestContextFactory } = require("@/core/context/test-context-factory");
        return new TestContextFactory(this.config);
      },
    });
  }

  /**
   * Gets the configuration used by this registry.
   *
   * @returns {ShortestStrictConfig} The configuration
   */
  getConfig(): ShortestStrictConfig {
    return this.config;
  }

  /**
   * Updates the configuration and recreates the container.
   *
   * @param {ShortestStrictConfig} config - The new configuration
   * @returns {DIContainer} New container with updated configuration
   */
  updateConfig(config: ShortestStrictConfig): DIContainer {
    this.config = config;
    return this.createContainer();
  }
}
