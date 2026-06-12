import { tool } from "ai";
import { z } from "zod";
import { AriaSnapshotSession } from "@/browser/snapshot/aria-snapshot-session";
import { createGLMBash } from "@/ai/tools/glm/bash";

const refSchema = z
  .string()
  .describe('Element reference from snapshot, e.g. "e12"');

export const createBrowserSnapshotTools = (
  session: AriaSnapshotSession,
): Record<string, ReturnType<typeof tool>> => {
  const bashTool = createGLMBash();

  return {
    browser_snapshot: tool({
      description:
        "Capture the current page accessibility snapshot with element refs like [ref=e12]. Use after navigation or when refs may be stale.",
      parameters: z.object({}),
      execute: async () => session.snapshotOnly(),
    }),
    browser_click: tool({
      description:
        "Click an element using its snapshot ref (e.g. e21 for button Sign In).",
      parameters: z.object({
        ref: refSchema,
      }),
      execute: async ({ ref }) => session.click(ref),
    }),
    browser_fill: tool({
      description:
        "Fill text into an input using its snapshot ref (e.g. e12 for email field).",
      parameters: z.object({
        ref: refSchema,
        text: z.string().describe("Text to enter into the element"),
      }),
      execute: async ({ ref, text }) => session.fill(ref, text),
    }),
    browser_press: tool({
      description:
        "Press a key on an element using its snapshot ref (e.g. Enter, Tab).",
      parameters: z.object({
        ref: refSchema,
        key: z.string().describe("Key to press, e.g. Enter or Tab"),
      }),
      execute: async ({ ref, key }) => session.press(ref, key),
    }),
    bash: bashTool,
  };
};
