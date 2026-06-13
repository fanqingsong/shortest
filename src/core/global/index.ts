/**
 * Global State Management Module
 *
 * This module provides global state management functionality that follows
 * SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module core/global
 * @see {@link GlobalStateManager} for global state management
 *
 * @example
 * ```typescript
 * import { GlobalStateManager } from "@/core/global";
 *
 * const manager = GlobalStateManager.getInstance();
 * manager.initialize();
 * const state = manager.getState();
 * ```
 */

export { GlobalStateManager } from "./global-state-manager";
export { GlobalState, GlobalStateConfig } from "./global-state-manager";
