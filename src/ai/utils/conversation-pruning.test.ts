import { describe, expect, it } from "vitest";
import type { CoreMessage } from "ai";
import {
  omitToolResultMessage,
  pruneConversationHistory,
} from "./conversation-pruning";
import {
  STALE_SNAPSHOT_PLACEHOLDER,
  STALE_TOOL_RESULT_PLACEHOLDER,
} from "@/browser/snapshot/format-page-state";

describe("omitToolResultMessage", () => {
  it("preserves tool message content array shape for GLM compatibility", () => {
    const message: CoreMessage = {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "call_abc",
          toolName: "browser_fill",
          result: "filled email field",
        },
      ],
    };

    const pruned = omitToolResultMessage(message);

    expect(Array.isArray(pruned.content)).toBe(true);
    expect(pruned.content).toEqual([
      {
        type: "tool-result",
        toolCallId: "call_abc",
        toolName: "browser_fill",
        result: STALE_TOOL_RESULT_PLACEHOLDER,
      },
    ]);
  });
});

describe("pruneConversationHistory", () => {
  it("does not strip Context lines from the initial user message", () => {
    const history: CoreMessage[] = [
      {
        role: "user",
        content:
          'Test: "login"\nContext: {"authPayload":{"username":"a@b.com","password":"secret"}}\nAuth credentials: {"username":"a@b.com","password":"secret"}\n### Page\n- Page URL: http://localhost/login\n### Snapshot\n- textbox [ref=e1]',
      },
      {
        role: "assistant",
        content: [
          {
            type: "text",
            text: "I'll fill the login form using provided credentials.",
          },
          {
            type: "tool-call",
            toolCallId: "call_1",
            toolName: "browser_fill",
            args: { ref: "e1", value: "a@b.com" },
          },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "call_1",
            toolName: "browser_fill",
            result: "ok",
          },
        ],
      },
      {
        role: "user",
        content:
          "### Page\n- Page URL: http://localhost/login\n### Snapshot\n- textbox [ref=e2]",
      },
    ];

    const pruned = pruneConversationHistory(history);
    const initial = pruned[0];

    expect(typeof initial.content).toBe("string");
    expect(initial.content).toContain("authPayload");
    expect(initial.content).toContain("Auth credentials");
    expect(initial.content).toContain(STALE_SNAPSHOT_PLACEHOLDER);
  });
});
