/**
 * Core Interfaces Module
 *
 * This module provides interfaces for major dependencies that follow
 * SOLID design principles, particularly the Dependency Inversion Principle.
 *
 * @module core/interfaces
 *
 * @example
 * ```typescript
 * import { IBrowserManager, ITestCompiler } from "@/core/interfaces";
 *
 * class MyBrowserManager implements IBrowserManager {
 *   // Implementation...
 * }
 * ```
 */

// Browser interfaces
export * from "./browser.interfaces";

// AI interfaces
export * from "./ai.interfaces";

// Test interfaces
export * from "./test.interfaces";
