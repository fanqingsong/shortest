/**
 * AI Error Handling Module
 *
 * This module provides a flexible, extensible error handling system for AI providers
 * that follows SOLID design principles, particularly the Open/Closed Principle,
 * Single Responsibility Principle, and Strategy Pattern.
 *
 * @module ai/error-handling
 * @see {@link AIErrorHandler} for error handler interface
 * @see {@link AIErrorHandlerFactory} for factory pattern implementation
 *
 * @example
 * ```typescript
 * import { getErrorHandlerFactory } from "@/ai/error-handling";
 *
 * const factory = getErrorHandlerFactory();
 * const handler = factory.getErrorHandler("glm");
 *
 * if (handler.isNonRetryable(error)) {
 *   // Handle non-retryable error
 * }
 * ```
 */

export {
  AIErrorHandler,
  BaseAIErrorHandler,
  AIErrorType,
  ErrorDetails,
  ErrorEvaluation,
} from "./error-handler.interface";
export { GLMErrorHandler } from "./glm-error-handler";
export { AzureErrorHandler } from "./azure-error-handler";
export { DashScopeErrorHandler } from "./dashscope-error-handler";
export { SiliconFlowErrorHandler } from "./siliconflow-error-handler";
export {
  AIErrorHandlerFactory,
  getErrorHandlerFactory,
} from "./error-handler.factory";
