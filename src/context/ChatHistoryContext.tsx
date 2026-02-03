import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, ChatMessage, ChatHistoryContextType } from '../types/chatHistory';
import { chatHistoryService } from '../services/chatHistoryService';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const useChatHistory = () => {
    const context = useContext(ChatHistoryContext);
    if (!context) {
        throw new Error('useChatHistory must be used within ChatHistoryProvider');
    }
    return context;
};

interface ChatHistoryProviderProps {
    children: ReactNode;
}

export const ChatHistoryProvider: React.FC<ChatHistoryProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load conversations when user logs in
    useEffect(() => {
        if (user) {
            loadUserConversations();
        } else {
            setConversations([]);
            setCurrentConversation(null);
        }
    }, [user]);

    const loadUserConversations = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const loadedConversations = await chatHistoryService.loadConversations(user.uid);
            setConversations(loadedConversations);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewConversation = () => {
        if (!user) return;

        const newConversation: Conversation = {
            id: uuidv4(),
            userId: user.uid,
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setCurrentConversation(newConversation);
    };

    const loadConversation = async (id: string) => {
        try {
            const conversation = await chatHistoryService.getConversation(id);
            if (conversation) {
                setCurrentConversation(conversation);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const saveMessage = async (message: ChatMessage) => {
        if (!currentConversation || !user) return;

        try {
            // Add message to current conversation
            const updatedConversation = {
                ...currentConversation,
                messages: [...currentConversation.messages, message],
                updatedAt: new Date(),
            };

            // Auto-generate title from first user message
            if (updatedConversation.messages.length === 1 && message.role === 'user') {
                updatedConversation.title = generateTitle(message.content);
            }

            // Save to database
            await chatHistoryService.saveConversation(updatedConversation);

            // Update state
            setCurrentConversation(updatedConversation);

            // Update conversations list
            setConversations(prev => {
                const existingIndex = prev.findIndex(c => c.id === updatedConversation.id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = updatedConversation;
                    return updated;
                } else {
                    return [updatedConversation, ...prev];
                }
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    };

    const deleteConversation = async (id: string) => {
        try {
            await chatHistoryService.deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));

            if (currentConversation?.id === id) {
                setCurrentConversation(null);
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const updateConversationTitle = async (id: string, title: string) => {
        try {
            await chatHistoryService.updateConversationTitle(id, title);

            setConversations(prev =>
                prev.map(c => c.id === id ? { ...c, title } : c)
            );

            if (currentConversation?.id === id) {
                setCurrentConversation({ ...currentConversation, title });
            }
        } catch (error) {
            console.error('Error updating conversation title:', error);
        }
    };

    const clearCurrentConversation = () => {
        setCurrentConversation(null);
    };

    // Helper function to generate title from first message
    const generateTitle = (content: string): string => {
        const maxLength = 50;
        const cleaned = content.trim();

        if (cleaned.length <= maxLength) {
            return cleaned;
        }

        return cleaned.substring(0, maxLength).trim() + '...';
    };

    const value: ChatHistoryContextType = {
        conversations,
        currentConversation,
        isLoading,
        createNewConversation,
        loadConversation,
        saveMessage,
        deleteConversation,
        updateConversationTitle,
        clearCurrentConversation,
    };

    return (
        <ChatHistoryContext.Provider value={value}>
            {children}
        </ChatHistoryContext.Provider>
    );
};
