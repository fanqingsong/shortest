/**
 * Service lifecycle types.
 */
export enum ServiceLifecycle {
  /** Service is created once and reused */
  SINGLETON = "singleton",
  /** Service is created each time it's requested */
  TRANSIENT = "transient",
  /** Service is created once per scope */
  SCOPED = "scoped",
}

/**
 * Service descriptor containing factory and lifecycle information.
 */
export interface ServiceDescriptor<T> {
  /** Factory function to create the service */
  factory: () => T;
  /** Service lifecycle */
  lifecycle: ServiceLifecycle;
  /** Optional dependencies for this service */
  dependencies?: string[];
}

/**
 * Service configuration for container registration.
 */
export interface ServiceConfig<T> {
  /** Factory function to create the service */
  factory: () => T;
  /** Service lifecycle (default: SINGLETON) */
  lifecycle?: ServiceLifecycle;
  /** Optional dependencies for this service */
  dependencies?: string[];
}

/**
 * Interface for dependency injection containers.
 * Defines the contract for service registration and resolution.
 *
 * This interface follows the Dependency Inversion Principle by allowing
 * high-level modules to depend on abstractions rather than concrete implementations.
 *
 * @interface DIContainer
 *
 * @example
 * ```typescript
 * const container = new DIContainer();
 * container.register("BrowserManager", {
 *   factory: () => new BrowserManager(config),
 *   lifecycle: ServiceLifecycle.SINGLETON
 * });
 *
 * const browserManager = container.resolve<BrowserManager>("BrowserManager");
 * ```
 */
export interface DIContainer {
  /**
   * Registers a service with the container.
   *
   * @template T - The service type
   * @param {string} name - Unique service name/identifier
   * @param {ServiceConfig<T>} config - Service configuration
   */
  register<T>(name: string, config: ServiceConfig<T>): void;

  /**
   * Resolves a service from the container.
   *
   * @template T - The service type
   * @param {string} name - Service name/identifier
   * @returns {T} The service instance
   * @throws {Error} If service is not registered
   */
  resolve<T>(name: string): T;

  /**
   * Checks if a service is registered.
   *
   * @param {string} name - Service name/identifier
   * @returns {boolean} True if service is registered
   */
  has(name: string): boolean;

  /**
   * Unregisters a service from the container.
   *
   * @param {string} name - Service name/identifier
   */
  unregister(name: string): void;

  /**
   * Clears all registered services.
   */
  clear(): void;

  /**
   * Gets all registered service names.
   *
   * @returns {string[]} Array of service names
   */
  getRegisteredServices(): string[];

  /**
   * Creates a new scope for scoped services.
   *
   * @returns {DIContainer} New container with scope
   */
  createScope(): DIContainer;
}

/**
 * Abstract base class for dependency injection containers.
 * Provides common functionality for service management.
 *
 * @abstract
 * @class BaseDIContainer
 * @implements {DIContainer}
 */
export abstract class BaseDIContainer implements DIContainer {
  protected services: Map<string, ServiceDescriptor<any>>;
  protected instances: Map<string, any>;

  /**
   * Creates a new DI container instance.
   */
  constructor() {
    this.services = new Map();
    this.instances = new Map();
  }

  /**
   * Registers a service with the container.
   *
   * @template T - The service type
   * @param {string} name - Unique service name/identifier
   * @param {ServiceConfig<T>} config - Service configuration
   */
  register<T>(name: string, config: ServiceConfig<T>): void {
    const descriptor: ServiceDescriptor<T> = {
      factory: config.factory,
      lifecycle: config.lifecycle ?? ServiceLifecycle.SINGLETON,
      dependencies: config.dependencies,
    };

    this.services.set(name, descriptor);
  }

  /**
   * Resolves a service from the container.
   *
   * @template T - The service type
   * @param {string} name - Service name/identifier
   * @returns {T} The service instance
   * @throws {Error} If service is not registered
   */
  resolve<T>(name: string): T {
    if (!this.has(name)) {
      throw new Error(`Service '${name}' is not registered`);
    }

    const descriptor = this.services.get(name)!;

    switch (descriptor.lifecycle) {
      case ServiceLifecycle.SINGLETON:
        return this.getSingletonInstance<T>(name, descriptor);
      case ServiceLifecycle.TRANSIENT:
        return descriptor.factory();
      case ServiceLifecycle.SCOPED:
        return this.getScopedInstance<T>(name, descriptor);
      default:
        throw new Error(`Unknown lifecycle: ${descriptor.lifecycle}`);
    }
  }

  /**
   * Checks if a service is registered.
   *
   * @param {string} name - Service name/identifier
   * @returns {boolean} True if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Unregisters a service from the container.
   *
   * @param {string} name - Service name/identifier
   */
  unregister(name: string): void {
    this.services.delete(name);
    this.instances.delete(name);
  }

  /**
   * Clears all registered services.
   */
  clear(): void {
    this.services.clear();
    this.instances.clear();
  }

  /**
   * Gets all registered service names.
   *
   * @returns {string[]} Array of service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Creates a new scope for scoped services.
   *
   * @returns {DIContainer} New container with scope
   */
  createScope(): DIContainer {
    throw new Error("createScope must be implemented by subclass");
  }

  /**
   * Gets or creates a singleton instance.
   *
   * @protected
   * @template T - The service type
   * @param {string} name - Service name
   * @param {ServiceDescriptor<T>} descriptor - Service descriptor
   * @returns {T} The service instance
   */
  protected getSingletonInstance<T>(
    name: string,
    descriptor: ServiceDescriptor<T>,
  ): T {
    if (!this.instances.has(name)) {
      const instance = descriptor.factory();
      this.instances.set(name, instance);
    }
    return this.instances.get(name) as T;
  }

  /**
   * Gets or creates a scoped instance.
   *
   * @protected
   * @template T - The service type
   * @param {string} name - Service name
   * @param {ServiceDescriptor<T>} descriptor - Service descriptor
   * @returns {T} The service instance
   */
  protected getScopedInstance<T>(
    name: string,
    descriptor: ServiceDescriptor<T>,
  ): T {
    // Default implementation treats scoped as transient
    // Subclasses can override for proper scoping
    return descriptor.factory();
  }
}
