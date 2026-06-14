import type { CoreMessage } from "ai";
import {
  omitPageSnapshotText,
  PAGE_SECTION_HEADER,
  STALE_TOOL_RESULT_PLACEHOLDER,
  truncateForContext,
} from "@/browser/snapshot/format-page-state";

export const MAX_RECENT_TOOL_RESULTS = 4;
export const MAX_ASSISTANT_TEXT_CHARS = 160;

export function messageHasToolResult(message: CoreMessage): boolean {
  if (message.role === "tool") {
    return true;
  }

  const content = message.content;
  if (!Array.isArray(content)) {
    return false;
  }

  return content.some(
    (part) =>
      typeof part === "object" &&
      part !== null &&
      "type" in part &&
      part.type === "tool-result",
  );
}

/** Keeps tool-result array shape (toolCallId, toolName) required by GLM/OpenAI APIs. */
export function omitToolResultMessage(message: CoreMessage): CoreMessage {
  if (message.role === "tool") {
    const content = message.content;
    if (!Array.isArray(content)) {
      return message;
    }

    return {
      ...message,
      content: content.map((part) => ({
        ...part,
        result: STALE_TOOL_RESULT_PLACEHOLDER,
      })),
    };
  }

  const content = message.content;
  if (!Array.isArray(content)) {
    return message;
  }

  return {
    ...message,
    content: content.map((part) => {
      if (
        typeof part === "object" &&
        part !== null &&
        "type" in part &&
        part.type === "tool-result"
      ) {
        return { ...part, result: STALE_TOOL_RESULT_PLACEHOLDER };
      }
      return part;
    }),
  };
}

export function truncateAssistantMessage(message: CoreMessage): CoreMessage {
  const content = message.content;

  if (typeof content === "string") {
    return {
      ...message,
      content: truncateForContext(content, MAX_ASSISTANT_TEXT_CHARS),
    };
  }

  if (!Array.isArray(content)) {
    return message;
  }

  return {
    ...message,
    content: content.map((part) => {
      if (typeof part === "string") {
        return truncateForContext(part, MAX_ASSISTANT_TEXT_CHARS);
      }

      if (part.type === "text") {
        return {
          ...part,
          text: truncateForContext(part.text, MAX_ASSISTANT_TEXT_CHARS),
        };
      }

      return part;
    }),
  };
}

export function extractMessageText(message: CoreMessage): string {
  const content = message.content;

  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (part.type === "text") {
        return part.text;
      }

      if (part.type === "tool-result") {
        const result = part.result;
        if (typeof result === "string") {
          return result;
        }
        if (result && typeof result === "object" && "output" in result) {
          return String((result as { output: string }).output);
        }
        return JSON.stringify(result);
      }

      return "";
    })
    .join("\n");
}

export function messageContainsPageSnapshot(message: CoreMessage): boolean {
  return extractMessageText(message).includes(PAGE_SECTION_HEADER);
}

export function omitPageSnapshotInMessage(message: CoreMessage): CoreMessage {
  const content = message.content;

  if (typeof content === "string") {
    return { ...message, content: omitPageSnapshotText(content) };
  }

  if (!Array.isArray(content)) {
    return message;
  }

  return {
    ...message,
    content: content.map((part) => {
      if (typeof part === "string") {
        return omitPageSnapshotText(part);
      }

      if (part.type === "text") {
        return { ...part, text: omitPageSnapshotText(part.text) };
      }

      if (part.type === "tool-result") {
        const result = part.result;
        if (typeof result === "string") {
          return { ...part, result: omitPageSnapshotText(result) };
        }
        if (result && typeof result === "object" && "output" in result) {
          return {
            ...part,
            result: {
              ...(result as Record<string, unknown>),
              output: omitPageSnapshotText(
                String((result as { output: string }).output),
              ),
            },
          };
        }
      }

      return part;
    }),
  };
}

export function pruneConversationHistory(history: CoreMessage[]): CoreMessage[] {
  const pruned = [...history];
  pruneStaleSnapshotsFromHistory(pruned);
  pruneStaleToolResultsFromHistory(pruned);
  pruneStaleAssistantTextFromHistory(pruned);
  return pruned;
}

function pruneStaleToolResultsFromHistory(history: CoreMessage[]): void {
  const toolResultIndices: number[] = [];

  for (let i = 0; i < history.length; i++) {
    if (messageHasToolResult(history[i])) {
      toolResultIndices.push(i);
    }
  }

  if (toolResultIndices.length <= MAX_RECENT_TOOL_RESULTS) {
    return;
  }

  const keepFrom = toolResultIndices.length - MAX_RECENT_TOOL_RESULTS;

  for (let j = 0; j < keepFrom; j++) {
    history[toolResultIndices[j]] = omitToolResultMessage(
      history[toolResultIndices[j]],
    );
  }
}

function pruneStaleAssistantTextFromHistory(history: CoreMessage[]): void {
  const assistantIndices: number[] = [];

  for (let i = 0; i < history.length; i++) {
    if (history[i].role === "assistant") {
      assistantIndices.push(i);
    }
  }

  if (assistantIndices.length <= 1) {
    return;
  }

  for (let j = 0; j < assistantIndices.length - 1; j++) {
    history[assistantIndices[j]] = truncateAssistantMessage(
      history[assistantIndices[j]],
    );
  }
}

function pruneStaleSnapshotsFromHistory(history: CoreMessage[]): void {
  const snapshotIndices: number[] = [];

  for (let i = 0; i < history.length; i++) {
    if (messageContainsPageSnapshot(history[i])) {
      snapshotIndices.push(i);
    }
  }

  if (snapshotIndices.length <= 1) {
    return;
  }

  const keepIndex = snapshotIndices[snapshotIndices.length - 1];

  for (const index of snapshotIndices) {
    if (index === keepIndex) {
      continue;
    }
    history[index] = omitPageSnapshotInMessage(history[index]);
  }
}
