import { z } from "zod";
import { getLogger } from "@/log/index";
import {
  configSchema,
  ShortestConfig,
  ShortestStrictConfig,
  CLIOptions,
  cliOptionsSchema,
} from "@/types";
import { formatZodError, ConfigError } from "@/utils/errors";

/**
 * Parses and validates user configuration against the schema.
 *
 * @param {ShortestConfig} userConfig - Raw user configuration object
 * @returns {ShortestStrictConfig} - Validated configuration object
 * @throws {ConfigError} - When configuration is invalid
 *
 * @private
 */
export const parseConfig = (
  userConfig: ShortestConfig,
  cliOptions?: CLIOptions,
): ShortestStrictConfig => {
  const log = getLogger();
  try {
    let config: ShortestConfig = userConfig;
    if (cliOptions) {
      config = handleCliOptions(config, cliOptions);
    }
    return configSchema.parse(config) as ShortestStrictConfig;
  } catch (error) {
    log.error("Error parsing config", { error });
    if (error instanceof z.ZodError) {
      throw new ConfigError(
        "invalid-config",
        formatZodError(error, "Invalid shortest.config"),
      );
    }
    throw error;
  }
};

/**
 * Applies command line options to override user configuration.
 *
 * @param {ShortestConfig} userConfig - Raw user configuration object
 * @param {CLIOptions} cliOptions - Command line options to apply
 * @returns {ShortestConfig} - Configuration with CLI options applied
 *
 * @private
 */
const handleCliOptions = (
  userConfig: ShortestConfig,
  cliOptions: CLIOptions,
): ShortestConfig => {
  if (cliOptions.headless) {
    userConfig.headless = true;
  }
  if (
    cliOptions.baseUrl &&
    cliOptions.baseUrl !== cliOptionsSchema.shape.baseUrl._def.defaultValue()
  ) {
    userConfig.baseUrl = cliOptions.baseUrl;
  }
  if (
    cliOptions.testPattern &&
    cliOptions.testPattern !==
      cliOptionsSchema.shape.testPattern._def.defaultValue()
  ) {
    userConfig.testPattern = cliOptions.testPattern;
  }
  if (cliOptions.noCache) {
    if (userConfig.caching) {
      userConfig.caching.enabled = false;
    } else {
      userConfig.caching = { enabled: false };
    }
  }
  return userConfig;
};
