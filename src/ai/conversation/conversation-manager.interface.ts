import { CoreMessage } from "ai";

/**
 * Conversation message with metadata.
 */
export interface ConversationMessage extends CoreMessage {
  /** Message timestamp */
  timestamp?: number;
  /** Message ID for tracking */
  id?: string;
}

/**
 * Conversation statistics.
 */
export interface ConversationStats {
  /** Total number of messages */
  messageCount: number;
  /** Number of user messages */
  userMessageCount: number;
  /** Number of assistant messages */
  assistantMessageCount: number;
  /** Number of tool messages */
  toolMessageCount: number;
  /** Number of system messages */
  systemMessageCount: number;
}

/**
 * Interface for conversation managers.
 * Defines the contract for managing conversation history.
 *
 * This interface follows the Single Responsibility Principle by focusing
 * solely on conversation history management.
 *
 * @interface ConversationManager
 *
 * @example
 * ```typescript
 * const manager = new ConversationManager();
 * manager.addMessage({ role: "user", content: "Hello" });
 * const history = manager.getHistory();
 * ```
 */
export interface ConversationManager {
  /**
   * Adds a message to the conversation history.
   *
   * @param {ConversationMessage} message - The message to add
   */
  addMessage(message: ConversationMessage): void;

  /**
   * Adds multiple messages to the conversation history.
   *
   * @param {ConversationMessage[]} messages - The messages to add
   */
  addMessages(messages: ConversationMessage[]): void;

  /**
   * Gets the conversation history.
   *
   * @returns {ConversationMessage[]} Array of messages
   */
  getHistory(): ConversationMessage[];

  /**
   * Clears the conversation history.
   */
  clearHistory(): void;

  /**
   * Gets the last N messages from the conversation.
   *
   * @param {number} count - Number of messages to retrieve
   * @returns {ConversationMessage[]} Array of messages
   */
  getLastMessages(count: number): ConversationMessage[];

  /**
   * Gets conversation statistics.
   *
   * @returns {ConversationStats} Conversation statistics
   */
  getStats(): ConversationStats;

  /**
   * Sets a maximum history size. Oldest messages are removed when limit is exceeded.
   *
   * @param {number} maxSize - Maximum number of messages to keep
   */
  setMaxHistorySize(maxSize: number): void;

  /**
   * Gets the current maximum history size.
   *
   * @returns {number} Maximum history size
   */
  getMaxHistorySize(): number;
}

/**
 * Abstract base class for conversation managers.
 * Provides common functionality for conversation history management.
 *
 * @abstract
 * @class BaseConversationManager
 * @implements {ConversationManager}
 */
export abstract class BaseConversationManager implements ConversationManager {
  protected history: ConversationMessage[] = [];
  protected maxHistorySize: number = 1000;

  /**
   * Adds a message to the conversation history.
   *
   * @param {ConversationMessage} message - The message to add
   */
  addMessage(message: ConversationMessage): void {
    const messageWithMetadata: ConversationMessage = {
      ...message,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    this.history.push(messageWithMetadata);
    this.enforceHistoryLimit();
  }

  /**
   * Adds multiple messages to the conversation history.
   *
   * @param {ConversationMessage[]} messages - The messages to add
   */
  addMessages(messages: ConversationMessage[]): void {
    for (const message of messages) {
      this.addMessage(message);
    }
  }

  /**
   * Gets the conversation history.
   *
   * @returns {ConversationMessage[]} Array of messages
   */
  getHistory(): ConversationMessage[] {
    return [...this.history];
  }

  /**
   * Clears the conversation history.
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Gets the last N messages from the conversation.
   *
   * @param {number} count - Number of messages to retrieve
   * @returns {ConversationMessage[]} Array of messages
   */
  getLastMessages(count: number): ConversationMessage[] {
    const start = Math.max(0, this.history.length - count);
    return this.history.slice(start);
  }

  /**
   * Gets conversation statistics.
   *
   * @returns {ConversationStats} Conversation statistics
   */
  getStats(): ConversationStats {
    const stats: ConversationStats = {
      messageCount: this.history.length,
      userMessageCount: 0,
      assistantMessageCount: 0,
      toolMessageCount: 0,
      systemMessageCount: 0,
    };

    for (const message of this.history) {
      switch (message.role) {
        case "user":
          stats.userMessageCount++;
          break;
        case "assistant":
          stats.assistantMessageCount++;
          break;
        case "tool":
          stats.toolMessageCount++;
          break;
        case "system":
          stats.systemMessageCount++;
          break;
      }
    }

    return stats;
  }

  /**
   * Sets a maximum history size.
   *
   * @param {number} maxSize - Maximum number of messages to keep
   */
  setMaxHistorySize(maxSize: number): void {
    this.maxHistorySize = maxSize;
    this.enforceHistoryLimit();
  }

  /**
   * Gets the current maximum history size.
   *
   * @returns {number} Maximum history size
   */
  getMaxHistorySize(): number {
    return this.maxHistorySize;
  }

  /**
   * Enforces the history size limit by removing oldest messages.
   *
   * @protected
   */
  protected enforceHistoryLimit(): void {
    if (this.history.length > this.maxHistorySize) {
      const removeCount = this.history.length - this.maxHistorySize;
      this.history = this.history.slice(removeCount);
    }
  }

  /**
   * Generates a unique message ID.
   *
   * @protected
   * @returns {string} Unique message ID
   */
  protected generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
