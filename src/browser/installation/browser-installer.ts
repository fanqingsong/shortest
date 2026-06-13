import { execSync } from "child_process";
import pc from "picocolors";
import { Log, getLogger } from "@/log";
import { getInstallationCommand } from "@/utils/platform";
import { ShortestError } from "@/utils/errors";

/**
 * Browser installation options.
 */
export interface BrowserInstallationOptions {
  /** Whether to show progress messages */
  silent?: boolean;
  /** Custom installation command */
  customCommand?: string;
  /** Timeout for installation in milliseconds */
  timeout?: number;
}

/**
 * Browser installation result.
 */
export interface BrowserInstallationResult {
  /** Whether installation was successful */
  success: boolean;
  /** Installation time in milliseconds */
  installationTime: number;
  /** Error message if installation failed */
  error?: string;
  /** Installation method used */
  method: "builtin" | "custom";
}

/**
 * Manager for browser installation.
 * Handles the installation of Playwright browsers when they're missing.
 *
 * This class follows the Single Responsibility Principle by focusing
 * solely on browser installation logic.
 *
 * @class BrowserInstaller
 *
 * @example
 * ```typescript
 * const installer = new BrowserInstaller();
 *
 * const result = await installer.install();
 * if (result.success) {
 *   console.log("Browser installed successfully");
 * }
 * ```
 */
export class BrowserInstaller {
  private log: Log;

  /**
   * Creates a new browser installer instance.
   *
   * @param {Log} log - Optional logger instance
   */
  constructor(log?: Log) {
    this.log = log || getLogger();
  }

  /**
   * Installs the Playwright browser.
   *
   * @param {BrowserInstallationOptions} options - Installation options
   * @returns {Promise<BrowserInstallationResult>} Installation result
   *
   * @example
   * ```typescript
   * const result = await installer.install({ silent: false });
   * ```
   */
  async install(
    options: BrowserInstallationOptions = {},
  ): Promise<BrowserInstallationResult> {
    const startTime = Date.now();
    const { silent = false, customCommand } = options;

    try {
      if (customCommand) {
        return await this.installWithCustomCommand(customCommand, startTime, silent);
      } else {
        return await this.installWithBuiltInCommand(startTime, silent);
      }
    } catch (error) {
      const installationTime = Date.now() - startTime;
      return {
        success: false,
        installationTime,
        error: error instanceof Error ? error.message : String(error),
        method: customCommand ? "custom" : "builtin",
      };
    }
  }

  /**
   * Installs browser using built-in command.
   *
   * @private
   * @param {number} startTime - Installation start time
   * @param {boolean} silent - Whether to suppress output
   * @returns {Promise<BrowserInstallationResult>} Installation result
   */
  private async installWithBuiltInCommand(
    startTime: number,
    silent: boolean,
  ): Promise<BrowserInstallationResult> {
    if (!silent) {
      this.log.info("Installing Playwright browser...");
    }

    const installationCommand = await getInstallationCommand();

    try {
      // Note: This uses execSync which executes a shell command.
      // The installation command is generated internally from getInstallationCommand()
      // which is a safe, predetermined value based on the package manager.
      // For enhanced security, consider using execFile with a command array in future versions.
      execSync(installationCommand, { stdio: silent ? "pipe" : "inherit" });

      if (!silent) {
        this.log.info(pc.green("✓"), "Playwright browser installed");
      }

      const installationTime = Date.now() - startTime;
      return {
        success: true,
        installationTime,
        method: "builtin",
      };
    } catch (error) {
      throw new ShortestError(
        `Failed to install Playwright browser: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Installs browser using custom command.
   *
   * @private
   * @param {string} command - Custom installation command
   * @param {number} startTime - Installation start time
   * @param {boolean} silent - Whether to suppress output
   * @returns {Promise<BrowserInstallationResult>} Installation result
   */
  private async installWithCustomCommand(
    command: string,
    startTime: number,
    silent: boolean,
  ): Promise<BrowserInstallationResult> {
    if (!silent) {
      this.log.info("Installing Playwright browser with custom command...");
    }

    try {
      // Note: Custom commands are provided by the user and should be validated
      // or sanitized before execution. Consider implementing command validation
      // or using execFile with a command array for enhanced security.
      execSync(command, { stdio: silent ? "pipe" : "inherit" });

      if (!silent) {
        this.log.info(pc.green("✓"), "Playwright browser installed");
      }

      const installationTime = Date.now() - startTime;
      return {
        success: true,
        installationTime,
        method: "custom",
      };
    } catch (error) {
      throw new ShortestError(
        `Failed to install Playwright browser with custom command: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Checks if browser is installed.
   *
   * @returns {Promise<boolean>} True if browser is installed
   *
   * @example
   * ```typescript
   * if (await installer.isInstalled()) {
   *   console.log("Browser is already installed");
   * }
   * ```
   */
  async isInstalled(): Promise<boolean> {
    try {
      const { chromium } = await import("playwright");
      const executablePath = chromium.executablePath();
      require("fs").existsSync(executablePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensures browser is installed, installing if necessary.
   *
   * @param {BrowserInstallationOptions} options - Installation options
   * @returns {Promise<BrowserInstallationResult | null>} Installation result or null if already installed
   *
   * @example
   * ```typescript
   * const result = await installer.ensureInstalled();
   * if (result) {
   *   console.log("Browser was installed");
   * } else {
   *   console.log("Browser was already installed");
   * }
   * ```
   */
  async ensureInstalled(
    options: BrowserInstallationOptions = {},
  ): Promise<BrowserInstallationResult | null> {
    if (await this.isInstalled()) {
      return null;
    }

    return this.install(options);
  }

  /**
   * Gets the browser executable path.
   *
   * @returns {Promise<string>} The executable path
   * @throws {Error} If unable to determine path
   *
   * @example
   * ```typescript
   * const path = await installer.getExecutablePath();
   * console.log("Browser executable:", path);
   * ```
   */
  async getExecutablePath(): Promise<string> {
    try {
      const { chromium } = await import("playwright");
      return chromium.executablePath();
    } catch (error) {
      throw new Error(
        `Failed to get browser executable path: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Gets installation statistics.
   *
   * @returns {Promise<Object>} Installation statistics
   *
   * @example
   * ```typescript
   * const stats = await installer.getStats();
   * console.log("Installation stats:", stats);
   * ```
   */
  async getStats(): Promise<{
    isInstalled: boolean;
    executablePath: string;
    installationCommand: string;
  }> {
    return {
      isInstalled: await this.isInstalled(),
      executablePath: await this.getExecutablePath(),
      installationCommand: await getInstallationCommand(),
    };
  }
}
