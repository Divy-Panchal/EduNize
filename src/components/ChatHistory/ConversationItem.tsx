import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Conversation } from '../../types/chatHistory';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    isActive,
    onClick,
    onDelete
}) => {
    const messageCount = conversation.messages.length;
    const lastMessageTime = conversation.updatedAt;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={16} className="text-blue-600 flex-shrink-0" />
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {conversation.title}
                        </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true })}</span>
                    </div>
                </div>
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-opacity"
                    title="Delete conversation"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};
