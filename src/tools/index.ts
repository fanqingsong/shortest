import { z } from "zod";
import { createCheckEmailTool } from "@/ai/tools/custom/check_email";
import { createGithubLoginTool } from "@/ai/tools/custom/github_login";
import { createNavigateTool } from "@/ai/tools/custom/navigate";
import { createRunCallbackTool } from "@/ai/tools/custom/run_callback";
import { createSleepTool } from "@/ai/tools/custom/sleep";
import { toolFactorySchema, ToolRegistry } from "@/tools/tool-registry";

export { ToolRegistry };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toolToRegisterSchema = z.object({
  name: z.string(),
  category: z.literal("custom"),
  factory: toolFactorySchema,
});
type ToolToRegister = z.infer<typeof toolToRegisterSchema>;

/**
 * Creates and configures a new ToolRegistry with all available tools
 *
 * @returns Configured ToolRegistry instance with all tools registered
 *
 * @private
 */
export const createToolRegistry = (): ToolRegistry => {
  const toolRegistry = new ToolRegistry();
  const toolsToRegister: Record<string, ToolToRegister> = {
    check_email: {
      name: "check_email",
      category: "custom",
      factory: createCheckEmailTool,
    },
    github_login: {
      name: "github_login",
      category: "custom",
      factory: createGithubLoginTool,
    },
    navigate: {
      name: "navigate",
      category: "custom",
      factory: createNavigateTool,
    },
    run_callback: {
      name: "run_callback",
      category: "custom",
      factory: createRunCallbackTool,
    },
    sleep: {
      name: "sleep",
      category: "custom",
      factory: createSleepTool,
    },
  };
  Object.entries(toolsToRegister).forEach(([key, value]) => {
    toolRegistry.registerTool(key, value);
  });
  return toolRegistry;
};
