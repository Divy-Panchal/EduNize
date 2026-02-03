export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface Conversation {
    id: string;
    userId: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
    isPinned?: boolean;
}

export interface ChatHistoryContextType {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    isLoading: boolean;
    createNewConversation: () => void;
    loadConversation: (id: string) => void;
    saveMessage: (message: ChatMessage) => Promise<void>;
    deleteConversation: (id: string) => Promise<void>;
    updateConversationTitle: (id: string, title: string) => Promise<void>;
    clearCurrentConversation: () => void;
}
