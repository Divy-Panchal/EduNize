import React from 'react';
import { motion } from 'framer-motion';
import { Plus, History, X } from 'lucide-react';
import { useChatHistory } from '../../context/ChatHistoryContext';
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

    // Desktop sidebar
    if (!isMobile) {
        return (
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="h-full bg-white dark:bg-gray-900 border-r dark:border-gray-700 overflow-hidden flex flex-col"
            >
                {isOpen && (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <History size={20} className="text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Chat History
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
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
                    className="fixed inset-0 bg-black/50 z-[90]"
                />
            )}

            {/* Drawer */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-gray-900 z-[100] flex flex-col shadow-2xl pt-12"
            >
                {/* Header */}
                <div className="p-3 sm:p-4 border-b dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <History size={18} className="text-blue-600 sm:w-5 sm:h-5" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Chat History
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
                    >
                        <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
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
