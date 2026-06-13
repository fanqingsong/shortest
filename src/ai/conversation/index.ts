/**
 * AI Conversation Management Module
 *
 * This module provides conversation history management for AI interactions
 * that follows SOLID design principles, particularly the Single Responsibility Principle.
 *
 * @module ai/conversation
 * @see {@link ConversationManager} for conversation management interface
 *
 * @example
 * ```typescript
 * import { ConversationManager } from "@/ai/conversation";
 *
 * const manager = new ConversationManager({ maxHistorySize: 100 });
 * manager.addMessage({ role: "user", content: "Hello" });
 * const history = manager.getHistory();
 * ```
 */

export {
  ConversationManager,
  BaseConversationManager,
  ConversationMessage,
  ConversationStats,
} from "./conversation-manager.interface";
export { ConversationManager as DefaultConversationManager } from "./conversation-manager";
