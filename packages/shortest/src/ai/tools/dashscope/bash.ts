import { tool } from "ai";
import { z } from "zod";
import { BashTool } from "@/browser/core/bash-tool";

/**
 * Creates a bash tool for DashScope models using OpenAI-compatible function calling
 *
 * DashScope uses standard function calling via the OpenAI SDK, so we create
 * a tool that wraps the BashTool functionality in a compatible format
 */
export const createDashScopeBash = () => {
  const bashTool = new BashTool();

  return tool({
    description: "Execute bash commands in the terminal",
    parameters: z.object({
      command: z.string().describe("The bash command to execute"),
    }),
    execute: async (input) => {
      const output = await bashTool.execute(input.command);
      return {
        output,
        success: true,
      };
    },
  });
};
