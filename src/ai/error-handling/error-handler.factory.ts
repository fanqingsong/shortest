import { AIErrorHandler } from "./error-handler.interface";
import { GLMErrorHandler } from "./glm-error-handler";
import { AzureErrorHandler } from "./azure-error-handler";
import { DashScopeErrorHandler } from "./dashscope-error-handler";
import { SiliconFlowErrorHandler } from "./siliconflow-error-handler";
import { AIError } from "@/utils/errors";

/**
 * Factory class for creating AI error handler instances.
 * Implements the Factory Pattern to encapsulate error handler creation logic.
 *
 * This class follows the Open/Closed Principle - new error handlers can be added
 * by extending the factory without modifying existing client code.
 *
 * @class AIErrorHandlerFactory
 *
 * @example
 * ```typescript
 * const factory = new AIErrorHandlerFactory();
 * const handler = factory.getErrorHandler("glm");
 * if (handler.isNonRetryable(error)) {
 *   // Handle non-retryable error
 * }
 * ```
 *
 * @see {@link AIErrorHandler} for error handler interface
 */
export class AIErrorHandlerFactory {
  private handlerRegistry: Map<string, () => AIErrorHandler>;

  /**
   * Creates a new AI error handler factory instance.
   * Initializes the handler registry with all available handlers.
   */
  constructor() {
    this.handlerRegistry = new Map([
      ["glm", () => new GLMErrorHandler()],
      ["azure", () => new AzureErrorHandler()],
      ["dashscope", () => new DashScopeErrorHandler()],
      ["siliconflow", () => new SiliconFlowErrorHandler()],
    ]);
  }

  /**
   * Registers a new AI error handler.
   * Allows for dynamic handler registration at runtime.
   *
   * @param {string} providerName - The provider name/identifier
   * @param {() => AIErrorHandler} handlerFactory - Factory function that creates handler instances
   * @returns {AIErrorHandlerFactory} This factory instance for method chaining
   *
   * @example
   * ```typescript
   * factory.registerErrorHandler("custom", () => new CustomErrorHandler());
   * ```
   */
  registerErrorHandler(
    providerName: string,
    handlerFactory: () => AIErrorHandler,
  ): this {
    this.handlerRegistry.set(providerName, handlerFactory);
    return this;
  }

  /**
   * Gets an error handler instance for the specified provider.
   *
   * @param {string} providerName - The provider name
   * @returns {AIErrorHandler} The error handler instance
   * @throws {AIError} If the provider is not supported
   *
   * @example
   * ```typescript
   * const handler = factory.getErrorHandler("glm");
   * const evaluation = handler.evaluateError(error);
   * ```
   */
  getErrorHandler(providerName: string): AIErrorHandler {
    const handlerFactory = this.handlerRegistry.get(providerName);

    if (!handlerFactory) {
      throw new AIError(
        "unsupported-provider",
        `Unsupported provider for error handling: ${providerName}`,
      );
    }

    return handlerFactory();
  }

  /**
   * Checks if an error handler is available for a provider.
   *
   * @param {string} providerName - The provider name to check
   * @returns {boolean} True if the handler is available
   *
   * @example
   * ```typescript
   * if (factory.hasErrorHandler("glm")) {
   *   const handler = factory.getErrorHandler("glm");
   * }
   * ```
   */
  hasErrorHandler(providerName: string): boolean {
    return this.handlerRegistry.has(providerName);
  }

  /**
   * Gets a list of all available error handler provider names.
   *
   * @returns {string[]} Array of provider names
   *
   * @example
   * ```typescript
   * const handlers = factory.getAvailableHandlers();
   * console.log("Available handlers:", handlers);
   * ```
   */
  getAvailableHandlers(): string[] {
    return Array.from(this.handlerRegistry.keys());
  }
}

/**
 * Singleton instance of the error handler factory.
 * Reused across the application for consistent handler creation.
 *
 * @private
 */
let errorHandlerFactory: AIErrorHandlerFactory | null = null;

/**
 * Gets or creates the error handler factory instance.
 * Implements singleton pattern for factory instance.
 *
 * @returns {AIErrorHandlerFactory} The factory instance
 *
 * @example
 * ```typescript
 * import { getErrorHandlerFactory } from "@/ai/error-handling";
 *
 * const factory = getErrorHandlerFactory();
 * const handler = factory.getErrorHandler("glm");
 * ```
 */
export const getErrorHandlerFactory = (): AIErrorHandlerFactory => {
  if (!errorHandlerFactory) {
    errorHandlerFactory = new AIErrorHandlerFactory();
  }
  return errorHandlerFactory;
};
