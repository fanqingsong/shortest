/**
 * Dependency Injection Module
 *
 * This module provides dependency injection functionality that follows
 * SOLID design principles, particularly the Dependency Inversion Principle.
 *
 * @module core/di
 * @see {@link DIContainer} for container implementation
 *
 * @example
 * ```typescript
 * import { DIContainer, ServiceLifecycle } from "@/core/di";
 *
 * const container = new DIContainer();
 * container.registerSingleton("BrowserManager", {
 *   factory: () => new BrowserManager(config)
 * });
 *
 * const browserManager = container.resolve<BrowserManager>("BrowserManager");
 * ```
 */

export {
  DIContainer,
  BaseDIContainer,
  DIContainer as DefaultDIContainer,
} from "./container";
export {
  DIContainer as ContainerInterface,
  BaseDIContainer as BaseContainerInterface,
  ServiceLifecycle,
  ServiceConfig,
  ServiceDescriptor,
} from "./container.interface";
