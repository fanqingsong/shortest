/**
 * Test Lifecycle Hook Management Module
 *
 * This module provides lifecycle hook management for test execution that follows
 * SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module core/hooks
 * @see {@link TestHookManager} for hook management
 *
 * @example
 * ```typescript
 * import { TestHookManager, HookType } from "@/core/hooks";
 *
 * const hookManager = new TestHookManager();
 *
 * hookManager.registerHook(HookType.BEFORE_ALL, async (context) => {
 *   console.log("Running before all tests");
 * });
 *
 * await hookManager.executeBeforeAll(testContext);
 * ```
 */

export { TestHookManager } from "./test-hook-manager";
export { HookType, HookFunction, HookRegistration, HookExecutionResult } from "./test-hook-manager";
