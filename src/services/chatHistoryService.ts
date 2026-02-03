import Dexie, { Table } from 'dexie';
import { Conversation, ChatMessage } from '../types/chatHistory';

class ChatHistoryDatabase extends Dexie {
    conversations!: Table<Conversation, string>;

    constructor() {
        super('EduAIChatHistory');
        this.version(1).stores({
            conversations: 'id, userId, createdAt, updatedAt, isPinned'
        });
    }
}

const db = new ChatHistoryDatabase();

export const chatHistoryService = {
    // Save or update a conversation
    async saveConversation(conversation: Conversation): Promise<void> {
        await db.conversations.put(conversation);
    },

    // Load all conversations for a user
    async loadConversations(userId: string): Promise<Conversation[]> {
        return await db.conversations
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('updatedAt');
    },

    // Get a specific conversation
    async getConversation(id: string): Promise<Conversation | undefined> {
        return await db.conversations.get(id);
    },

    // Delete a conversation
    async deleteConversation(id: string): Promise<void> {
        await db.conversations.delete(id);
    },

    // Update conversation title
    async updateConversationTitle(id: string, title: string): Promise<void> {
        await db.conversations.update(id, { title, updatedAt: new Date() });
    },

    // Add a message to a conversation
    async addMessageToConversation(conversationId: string, message: ChatMessage): Promise<void> {
        const conversation = await db.conversations.get(conversationId);
        if (conversation) {
            conversation.messages.push(message);
            conversation.updatedAt = new Date();
            await db.conversations.put(conversation);
        }
    },

    // Clear all conversations (for testing or user preference)
    async clearAllConversations(): Promise<void> {
        await db.conversations.clear();
    }
};
