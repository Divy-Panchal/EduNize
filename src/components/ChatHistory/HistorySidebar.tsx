import React from 'react';
import { motion } from 'framer-motion';
import { Plus, History, X } from 'lucide-react';
import { useChatHistory } from '../../context/ChatHistoryContext';
import { useTheme } from '../../context/ThemeContext';
import { ConversationList } from './ConversationList';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isMobile?: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, isMobile = false }) => {
    const {
        conversations,
        currentConversation,
        createNewConversation,
        loadConversation,
        deleteConversation
    } = useChatHistory();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handleNewChat = () => {
        createNewConversation();
        if (isMobile) {
            onClose();
        }
    };

    const handleSelectConversation = (id: string) => {
        loadConversation(id);
        if (isMobile) {
            onClose();
        }
    };

    const sidebarBg = isDark ? 'bg-gray-900' : 'bg-white';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const headerTextColor = isDark ? 'text-gray-200' : 'text-gray-800';
    const closeButtonHover = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
    const closeButtonText = isDark ? 'text-gray-400' : 'text-gray-600';

    // Desktop sidebar
    if (!isMobile) {
        return (
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className={`h-full ${sidebarBg} border-r ${borderColor} overflow-hidden flex flex-col`}
            >
                {isOpen && (
                    <>
                        {/* Header */}
                        <div className={`p-4 border-b ${borderColor}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <History size={20} className="text-blue-500" />
                                    <h2 className={`text-lg font-semibold ${headerTextColor}`}>
                                        Chat History
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`p-1 rounded-md ${closeButtonHover} ${closeButtonText}`}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNewChat}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Plus size={18} />
                                New Chat
                            </motion.button>
                        </div>

                        {/* Conversation List */}
                        <ConversationList
                            conversations={conversations}
                            currentConversationId={currentConversation?.id || null}
                            onSelectConversation={handleSelectConversation}
                            onDeleteConversation={deleteConversation}
                        />
                    </>
                )}
            </motion.div>
        );
    }

    // Mobile drawer
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-40"
                />
            )}

            {/* Drawer */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`fixed left-0 top-0 bottom-0 w-80 ${sidebarBg} z-50 flex flex-col shadow-2xl border-r ${borderColor}`}
            >
                {/* Header */}
                <div className={`p-4 border-b ${borderColor}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <History size={20} className="text-blue-500" />
                            <h2 className={`text-lg font-semibold ${headerTextColor}`}>
                                Chat History
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-1 rounded-md ${closeButtonHover} ${closeButtonText}`}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus size={18} />
                        New Chat
                    </motion.button>
                </div>

                {/* Conversation List */}
                <ConversationList
                    conversations={conversations}
                    currentConversationId={currentConversation?.id || null}
                    onSelectConversation={handleSelectConversation}
                    onDeleteConversation={deleteConversation}
                />
            </motion.div>
        </>
    );
};
