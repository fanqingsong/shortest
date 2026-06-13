/**
 * Test Registry Module
 *
 * This module provides test registration and management functionality that follows
 * SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module core/registry
 * @see {@link TestRegistry} for test registration
 *
 * @example
 * ```typescript
 * import { TestRegistry } from "@/core/registry";
 *
 * const registry = new TestRegistry();
 * const testCase = registry.registerTest({
 *   name: "My test",
 *   filePath: "/path/to/test.ts"
 * });
 * ```
 */

export { TestRegistry } from "./test-registry";
export { TestRegistryState } from "./test-registry";
