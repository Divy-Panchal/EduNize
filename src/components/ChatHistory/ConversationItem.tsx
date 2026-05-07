import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Conversation } from '../../types/chatHistory';
import { useTheme } from '../../context/ThemeContext';
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
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const messageCount = conversation.messages.length;
    const lastMessageTime = conversation.updatedAt;

    const activeClasses = isDark
        ? 'bg-blue-900/40 border-l-4 border-blue-500 shadow-sm'
        : 'bg-blue-50 border-l-4 border-blue-600 shadow-sm';

    const inactiveClasses = isDark
        ? 'bg-gray-800 hover:bg-gray-700 border-l-4 border-transparent'
        : 'bg-white hover:bg-gray-50 border-l-4 border-transparent';

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${isActive ? activeClasses : inactiveClasses}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={16} className={`flex-shrink-0 ${isActive ? 'text-blue-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
                        <h4 className={`text-sm font-semibold truncate ${
                            isActive 
                                ? (isDark ? 'text-blue-300' : 'text-blue-700')
                                : (isDark ? 'text-gray-200' : 'text-gray-800')
                        }`}>
                            {conversation.title}
                        </h4>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true })}</span>
                    </div>
                </div>
                <button
                    onClick={onDelete}
                    className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-red-500 transition-opacity ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'}`}
                    title="Delete conversation"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};
