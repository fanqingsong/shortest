import { BaseConversationManager, ConversationMessage } from "./conversation-manager.interface";

/**
 * Standard conversation manager implementation.
 * Provides full conversation history management functionality.
 *
 * @class ConversationManager
 * @extends {BaseConversationManager}
 *
 * @example
 * ```typescript
 * const manager = new ConversationManager({ maxHistorySize: 100 });
 *
 * manager.addMessage({
 *   role: "user",
 *   content: "Hello, how are you?"
 * });
 *
 * const history = manager.getHistory();
 * const stats = manager.getStats();
 * ```
 */
export class ConversationManager extends BaseConversationManager {
  /**
   * Creates a new conversation manager instance.
   *
   * @param {Object} options - Manager options
   * @param {number} options.maxHistorySize - Maximum history size (default: 1000)
   * @param {ConversationMessage[]} options.initialHistory - Initial conversation history
   */
  constructor(options: {
    maxHistorySize?: number;
    initialHistory?: ConversationMessage[];
  } = {}) {
    super();

    if (options.maxHistorySize !== undefined) {
      this.maxHistorySize = options.maxHistorySize;
    }

    if (options.initialHistory) {
      this.history = [...options.initialHistory];
      this.enforceHistoryLimit();
    }
  }

  /**
   * Filters conversation history by message role.
   *
   * @param {string} role - The role to filter by
   * @returns {ConversationMessage[]} Filtered messages
   *
   * @example
   * ```typescript
   * const userMessages = manager.filterByRole("user");
   * ```
   */
  filterByRole(role: string): ConversationMessage[] {
    return this.history.filter((message) => message.role === role);
  }

  /**
   * Gets messages within a time range.
   *
   * @param {number} startTime - Start timestamp in milliseconds
   * @param {number} endTime - End timestamp in milliseconds
   * @returns {ConversationMessage[]} Messages within the time range
   *
   * @example
   * ```typescript
   * const recentMessages = manager.getMessagesInTimeRange(
   *   Date.now() - 60000,
   *   Date.now()
   * );
   * ```
   */
  getMessagesInTimeRange(
    startTime: number,
    endTime: number,
  ): ConversationMessage[] {
    return this.history.filter(
      (message) =>
        message.timestamp &&
        message.timestamp >= startTime &&
        message.timestamp <= endTime,
    );
  }

  /**
   * Removes messages by their IDs.
   *
   * @param {string[]} messageIds - Array of message IDs to remove
   * @returns {number} Number of messages removed
   *
   * @example
   * ```typescript
 * const removed = manager.removeMessagesById([
 *   "msg_1234567890_abc123",
 *   "msg_1234567891_def456"
 * ]);
   * ```
   */
  removeMessagesById(messageIds: string[]): number {
    const idSet = new Set(messageIds);
    const originalLength = this.history.length;

    this.history = this.history.filter(
      (message) => !message.id || !idSet.has(message.id),
    );

    return originalLength - this.history.length;
  }

  /**
   * Creates a snapshot of the current conversation history.
   * Can be used for backup or restoration purposes.
   *
   * @returns {ConversationMessage[]} Snapshot of current history
   *
   * @example
   * ```typescript
   * const snapshot = manager.createSnapshot();
   * // ... make changes ...
   * manager.restoreSnapshot(snapshot);
   * ```
   */
  createSnapshot(): ConversationMessage[] {
    return this.getHistory();
  }

  /**
   * Restores conversation history from a snapshot.
   *
   * @param {ConversationMessage[]} snapshot - The snapshot to restore
   *
   * @example
   * ```typescript
   * manager.restoreSnapshot(snapshot);
   * ```
   */
  restoreSnapshot(snapshot: ConversationMessage[]): void {
    this.history = [...snapshot];
    this.enforceHistoryLimit();
  }

  /**
   * Exports conversation history to a JSON string.
   *
   * @returns {string} JSON string representation of history
   *
   * @example
   * ```typescript
   * const json = manager.exportToJSON();
   * ```
   */
  exportToJSON(): string {
    return JSON.stringify(this.history, null, 2);
  }

  /**
   * Imports conversation history from a JSON string.
   *
   * @param {string} json - JSON string to import
   * @throws {Error} If JSON is invalid
   *
   * @example
   * ```typescript
   * manager.importFromJSON(jsonString);
   * ```
   */
  importFromJSON(json: string): void {
    try {
      const history = JSON.parse(json) as ConversationMessage[];
      this.restoreSnapshot(history);
    } catch (error) {
      throw new Error("Invalid JSON format for conversation history");
    }
  }
}
