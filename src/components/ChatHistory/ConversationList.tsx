import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Conversation } from '../../types/chatHistory';
import { ConversationItem } from './ConversationItem';
import { useTheme } from '../../context/ThemeContext';

interface ConversationListProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    currentConversationId,
    onSelectConversation,
    onDeleteConversation
}) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            onDeleteConversation(id);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : ''}`}>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500' : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'}`}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <AnimatePresence>
                    {filteredConversations.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </motion.div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <motion.div
                                key={conversation.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ConversationItem
                                    conversation={conversation}
                                    isActive={conversation.id === currentConversationId}
                                    onClick={() => onSelectConversation(conversation.id)}
                                    onDelete={(e) => handleDelete(e, conversation.id)}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
