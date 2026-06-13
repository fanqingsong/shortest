import { BaseDIContainer, ServiceLifecycle, ServiceConfig } from "./container.interface";

/**
 * Standard dependency injection container implementation.
 * Provides comprehensive dependency injection with lifecycle management.
 *
 * @class DIContainer
 * @extends {BaseDIContainer}
 *
 * @example
 * ```typescript
 * const container = new DIContainer();
 *
 * // Register services
 * container.register("BrowserManager", {
 *   factory: () => new BrowserManager(config),
 *   lifecycle: ServiceLifecycle.SINGLETON
 * });
 *
 * container.register("TestReporter", {
 *   factory: () => new TestReporter(),
 *   lifecycle: ServiceLifecycle.TRANSIENT
 * });
 *
 * // Resolve services
 * const browserManager = container.resolve<BrowserManager>("BrowserManager");
 * const reporter = container.resolve<TestReporter>("TestReporter");
 *
 * // Check registration
 * if (container.has("BrowserManager")) {
 *   // Service is registered
 * }
 * ```
 */
export class DIContainer extends BaseDIContainer {
  private parent?: DIContainer;

  /**
   * Creates a new DI container instance.
   *
   * @param {DIContainer} parent - Optional parent container for scoping
   */
  constructor(parent?: DIContainer) {
    super();
    this.parent = parent;
  }

  /**
   * Resolves a service from the container.
   * Checks parent container if service not found in current container.
   *
   * @template T - The service type
   * @param {string} name - Service name/identifier
   * @returns {T} The service instance
   * @throws {Error} If service is not registered
   */
  resolve<T>(name: string): T {
    // Check if we have the service
    if (this.has(name)) {
      return super.resolve<T>(name);
    }

    // Check parent container
    if (this.parent && this.parent.has(name)) {
      return this.parent.resolve<T>(name);
    }

    throw new Error(`Service '${name}' is not registered`);
  }

  /**
   * Checks if a service is registered.
   * Also checks parent container if available.
   *
   * @param {string} name - Service name/identifier
   * @returns {boolean} True if service is registered
   */
  has(name: string): boolean {
    return super.has(name) || (this.parent?.has(name) ?? false);
  }

  /**
   * Creates a new scope for scoped services.
   * Returns a new container with this container as parent.
   *
   * @returns {DIContainer} New container with scope
   */
  createScope(): DIContainer {
    return new DIContainer(this);
  }

  /**
   * Registers a service with automatic dependency resolution.
   * Resolves dependencies before calling the factory.
   *
   * @template T - The service type
   * @param {string} name - Unique service name/identifier
   * @param {ServiceConfig<T>} config - Service configuration
   */
  register<T>(name: string, config: ServiceConfig<T>): void {
    const wrappedFactory = () => {
      // Resolve dependencies if specified
      if (config.dependencies && config.dependencies.length > 0) {
        const resolvedDeps = config.dependencies.map((dep) =>
          this.resolve(dep),
        );
        return config.factory(...resolvedDeps);
      }
      return config.factory();
    };

    super.register(name, {
      ...config,
      factory: wrappedFactory,
    });
  }

  /**
   * Registers a service factory with multiple parameters.
   * Useful for constructor injection.
   *
   * @template T - The service type
   * @param {string} name - Unique service name/identifier
   * @param {new (...args: any[]) => T} constructor - Service constructor
   * @param {ServiceLifecycle} lifecycle - Service lifecycle
   * @param {...string} dependencies - Service dependencies
   *
   * @example
   * ```typescript
   * container.registerConstructor("TestRunner", TestRunner, ServiceLifecycle.TRANSIENT, "BrowserManager", "TestCompiler");
   * ```
   */
  registerConstructor<T>(
    name: string,
    constructor: new (...args: any[]) => T,
    lifecycle: ServiceLifecycle = ServiceLifecycle.SINGLETON,
    ...dependencies: string[]
  ): void {
    this.register(name, {
      factory: (...deps: any[]) => new constructor(...deps),
      lifecycle,
      dependencies,
    });
  }

  /**
   * Registers a singleton service (convenience method).
   *
   * @template T - The service type
   * @param {string} name - Unique service name/identifier
   * @param {ServiceConfig<T>} config - Service configuration
   *
   * @example
   * ```typescript
   * container.registerSingleton("BrowserManager", {
   *   factory: () => new BrowserManager(config)
   * });
   * ```
   */
  registerSingleton<T>(name: string, config: ServiceConfig<T>): void {
    this.register(name, { ...config, lifecycle: ServiceLifecycle.SINGLETON });
  }

  /**
   * Registers a transient service (convenience method).
   *
   * @template T - The service type
   * @param {string} name - Unique service name/identifier
   * @param {ServiceConfig<T>} config - Service configuration
   *
   * @example
   * ```typescript
   * container.registerTransient("TestReporter", {
   *   factory: () => new TestReporter()
   * });
   * ```
   */
  registerTransient<T>(name: string, config: ServiceConfig<T>): void {
    this.register(name, { ...config, lifecycle: ServiceLifecycle.TRANSIENT });
  }

  /**
   * Registers a scoped service (convenience method).
   *
   * @template T - The service type
   * @param {string} name - Unique service name/identifier
   * @param {ServiceConfig<T>} config - Service configuration
   *
   * @example
   * ```typescript
   * container.registerScoped("TestContext", {
   *   factory: () => new TestContext()
   * });
   * ```
   */
  registerScoped<T>(name: string, config: ServiceConfig<T>): void {
    this.register(name, { ...config, lifecycle: ServiceLifecycle.SCOPED });
  }

  /**
   * Tries to resolve a service, returning undefined if not found.
   *
   * @template T - The service type
   * @param {string} name - Service name/identifier
   * @returns {T | undefined} The service instance or undefined
   *
   * @example
   * ```typescript
   * const service = container.tryResolve<SomeService>("SomeService");
   * if (service) {
   *   // Use service
   * }
   * ```
   */
  tryResolve<T>(name: string): T | undefined {
    try {
      return this.resolve<T>(name);
    } catch {
      return undefined;
    }
  }

  /**
   * Resolves all services that match a predicate.
   *
   * @template T - The service type
   * @param {(name: string) => boolean} predicate - Predicate function
   * @returns {T[]} Array of resolved services
   *
   * @example
   * ```typescript
   * const services = container.resolveAll<IService>((name) => name.startsWith("Service"));
   * ```
   */
  resolveAll<T>(predicate: (name: string) => boolean): T[] {
    const services: T[] = [];
    for (const name of this.getRegisteredServices()) {
      if (predicate(name)) {
        services.push(this.resolve<T>(name));
      }
    }
    return services;
  }

  /**
   * Disposes all disposable services in reverse registration order.
   * Useful for cleanup and resource management.
   *
   * @example
   * ```typescript
   * container.dispose();
   * ```
   */
  dispose(): void {
    const services = Array.from(this.instances.entries()).reverse();

    for (const [name, instance] of services) {
      if (instance && typeof instance.dispose === "function") {
        try {
          instance.dispose();
        } catch (error) {
          console.error(`Error disposing service '${name}':`, error);
        }
      }
    }

    this.instances.clear();
  }
}
