/**
 * AI Provider Module
 *
 * This module provides a flexible, extensible AI provider system that follows
 * SOLID design principles, particularly the Open/Closed Principle and Single Responsibility Principle.
 *
 * @module ai/providers
 * @see {@link AIProvider} for provider interface
 * @see {@link AIProviderFactory} for factory pattern implementation
 *
 * @example
 * ```typescript
 * import { AIProviderFactory } from "@/ai/providers";
 *
 * const factory = new AIProviderFactory();
 * const provider = factory.createProvider(config);
 * const model = provider.createModel();
 * ```
 */

export { AIProvider, OpenAICompatibleProvider } from "./ai-provider.interface";
export { GLMProvider } from "./glm.provider";
export { AzureProvider } from "./azure.provider";
export { DashScopeProvider } from "./dashscope.provider";
export { SiliconFlowProvider } from "./siliconflow.provider";
export { AIProviderFactory } from "./ai-provider.factory";
