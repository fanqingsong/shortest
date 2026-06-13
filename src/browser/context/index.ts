/**
 * Browser Context Management Module
 *
 * This module provides browser context management that follows
 * SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module browser/context
 * @see {@link BrowserContextManager} for context management
 *
 * @example
 * ```typescript
 * import { BrowserContextManager } from "@/browser/context";
 *
 * const manager = new BrowserContextManager(config);
 * await manager.initialize(browser);
 * const context = manager.getContext();
 * ```
 */

export { BrowserContextManager } from "./browser-context-manager";
export { BrowserContextState, ContextClearingOptions } from "./browser-context-manager";
