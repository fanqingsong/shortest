/**
 * Browser Installation Module
 *
 * This module provides browser installation functionality that follows
 * SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module browser/installation
 * @see {@link BrowserInstaller} for installation management
 *
 * @example
 * ```typescript
 * import { BrowserInstaller } from "@/browser/installation";
 *
 * const installer = new BrowserInstaller();
 * const result = await installer.install();
 * ```
 */

export { BrowserInstaller } from "./browser-installer";
export { BrowserInstallationOptions, BrowserInstallationResult } from "./browser-installer";
