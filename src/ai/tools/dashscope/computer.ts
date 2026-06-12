import { tool } from "ai";
import { z } from "zod";
import { BrowserTool } from "@/browser/core/browser-tool";
import { InternalActionEnum } from "@/types/browser";

/**
 * Creates a computer tool for DashScope models using OpenAI-compatible function calling
 *
 * DashScope uses standard function calling via the OpenAI SDK, so we create
 * a tool that wraps the BrowserTool functionality in a compatible format
 */
export const createDashScopeComputer = (browserTool: BrowserTool) => {
  return tool({
    description: "Computer control tool for automating browser interactions",
    parameters: z.object({
      action: z.enum([
        "screenshot",
        "mouse_move",
        "left_click",
        "right_click",
        "middle_click",
        "double_click",
        "left_click_drag",
        "type",
        "key",
      ]),
      coordinate: z
        .tuple([z.number(), z.number()])
        .optional()
        .describe("X, Y coordinates for mouse actions"),
      coordinates: z
        .tuple([z.number(), z.number()])
        .optional()
        .describe("Start X, Y coordinates for drag operations"),
      text: z.string().optional().describe("Text to type"),
      key: z
        .object({
          type: z.string().optional().describe("Key combination (e.g., 'ctrl+c')"),
          text: z.string().optional().describe("Text representation of key"),
        })
        .optional(),
    }),
    execute: async (input) => {
      const { action, ...restOfInput } = input;
      const internalAction = actionMap[action];
      if (!internalAction) {
        return {
          error: `Action '${action}' not supported`,
          output: `Action '${action}' not supported`,
        };
      }
      return await browserTool.execute({
        action: internalAction,
        ...restOfInput,
      });
    },
  });
};

/**
 * Map of DashScope computer tool actions to internal actions
 */
const actionMap: Record<string, InternalActionEnum> = {
  screenshot: InternalActionEnum.SCREENSHOT,
  mouse_move: InternalActionEnum.MOUSE_MOVE,
  left_click: InternalActionEnum.LEFT_CLICK,
  right_click: InternalActionEnum.RIGHT_CLICK,
  middle_click: InternalActionEnum.MIDDLE_CLICK,
  double_click: InternalActionEnum.DOUBLE_CLICK,
  left_click_drag: InternalActionEnum.LEFT_CLICK_DRAG,
  type: InternalActionEnum.TYPE,
  key: InternalActionEnum.KEY,
};
