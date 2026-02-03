import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw, Loader2, History, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useChatHistory } from '../context/ChatHistoryContext';
import { geminiService, Message } from '../services/geminiService';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { HistorySidebar } from '../components/ChatHistory/HistorySidebar';
import { v4 as uuidv4 } from 'uuid';

const SUGGESTED_PROMPTS = [
    {
        icon: '📅',
        text: 'Help me organize my study schedule',
    },
    {
        icon: '💡',
        text: 'Explain this concept to me',
    },
    {
        icon: '✅',
        text: 'Create practice questions',
    },
    {
        icon: '📝',
        text: 'Summarize my notes',
    },
    {
        icon: '🎯',
        text: 'Help me prepare for an exam',
    },
    {
        icon: '🧩',
        text: 'Break down a complex topic',
    },
];

export function EduAI() {
    const { theme, themeConfig } = useTheme();
    const {
        currentConversation,
        createNewConversation,
        saveMessage,
        clearCurrentConversation
    } = useChatHistory();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load conversation messages when conversation changes
    useEffect(() => {
        if (currentConversation) {
            setMessages(currentConversation.messages);
        } else {
            setMessages([]);
        }
    }, [currentConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Auto-create conversation when user starts typing without one
    useEffect(() => {
        if (messages.length > 0 && !currentConversation) {
            createNewConversation();
        }
    }, [messages, currentConversation, createNewConversation]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsTyping(true);

        // Save user message to history
        await saveMessage(userMessage);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const response = await geminiService.sendMessage(userMessage.content);

            const aiMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setIsTyping(false);
            setMessages((prev) => [...prev, aiMessage]);

            // Save AI message to history
            await saveMessage(aiMessage);
        } catch (error) {
            setIsTyping(false);
            toast.error(error instanceof Error ? error.message : 'Failed to get response');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptClick = (promptText: string) => {
        setInput(promptText);
        textareaRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);

        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
    };

    const handleReset = () => {
        clearCurrentConversation();
        setMessages([]);
        geminiService.resetChat();
        toast.success('Chat reset successfully');
    };

    const handleNewChat = () => {
        createNewConversation();
        setMessages([]);
        geminiService.resetChat();
    };

    const showWelcome = messages.length === 0;

    return (
        <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-7xl mx-auto gap-4">
            {/* History Sidebar */}
            <HistorySidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700 mb-4`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* History Toggle Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`p-2 rounded-lg ${theme === 'dark'
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    } transition-colors`}
                                title="Chat History"
                            >
                                {isMobile ? <Menu className="w-5 h-5" /> : <History className="w-5 h-5" />}
                            </motion.button>

                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-xl rounded-full" />
                                <div className="relative bg-white p-2 rounded-xl shadow-sm flex items-center justify-center">
                                    <img src="/eduai-logo.png" alt="EduAI" className="w-8 h-8 object-contain" />
                                </div>
                            </div>
                            <div>
                                <h1 className={`text-xl md:text-2xl font-bold ${themeConfig.text}`}>
                                    EduAI
                                </h1>
                                <p className={`text-sm ${themeConfig.textSecondary}`}>
                                    Your AI Study Companion
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNewChat}
                                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors hidden md:block"
                                        title="New chat"
                                    >
                                        New Chat
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleReset}
                                        className={`p-2 rounded-lg ${theme === 'dark'
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            } transition-colors`}
                                        title="Reset chat"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Chat Area */}
                <div className={`flex-1 ${themeConfig.card} rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col`}>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        <AnimatePresence mode="wait">
                            {showWelcome ? (
                                <motion.div
                                    key="welcome"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center justify-center h-full py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="mb-6"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-3xl rounded-full" />
                                            <div className="relative bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center">
                                                <img src="/eduai-logo.png" alt="EduAI" className="w-16 h-16 object-contain" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <h2 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2 text-center`}>
                                        Welcome to EduAI 👋
                                    </h2>
                                    <p className={`text-sm md:text-base ${themeConfig.textSecondary} mb-8 text-center max-w-md`}>
                                        Your AI study companion. How can I help you learn today?
                                    </p>

                                    <div className="w-full max-w-2xl">
                                        <p className={`text-sm font-semibold ${themeConfig.text} mb-4 uppercase tracking-wide`}>
                                            Suggested Prompts
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {SUGGESTED_PROMPTS.map((prompt, index) => (
                                                <motion.button
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handlePromptClick(prompt.text)}
                                                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${theme === 'dark'
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{prompt.icon}</span>
                                                    <span className={`text-sm font-medium ${themeConfig.text}`}>
                                                        {prompt.text}
                                                    </span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div key="messages" className="space-y-4">
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${message.role === 'user'
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                                    : theme === 'dark'
                                                        ? 'bg-gray-800 border border-gray-700'
                                                        : 'bg-gray-100 border border-gray-200'
                                                    }`}
                                            >
                                                {message.role === 'assistant' && (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="bg-white p-1 rounded-lg flex items-center justify-center">
                                                            <img src="/eduai-logo.png" alt="EduAI" className="w-5 h-5 object-contain" />
                                                        </div>
                                                        <span className={`text-xs font-semibold ${themeConfig.text}`}>
                                                            EduAI
                                                        </span>
                                                    </div>
                                                )}
                                                {message.role === 'user' ? (
                                                    <p className="text-sm md:text-base whitespace-pre-wrap text-white">
                                                        {message.content}
                                                    </p>
                                                ) : (
                                                    <div className={`text-sm md:text-base prose prose-sm max-w-none ${theme === 'dark' ? 'prose-invert' : ''
                                                        }`}>
                                                        <ReactMarkdown
                                                            components={{
                                                                p: ({ children }) => <p className={`mb-2 ${themeConfig.text}`}>{children}</p>,
                                                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                                                ul: ({ children }) => <ul className={`list-disc ml-4 mb-2 ${themeConfig.text}`}>{children}</ul>,
                                                                ol: ({ children }) => <ol className={`list-decimal ml-4 mb-2 ${themeConfig.text}`}>{children}</ol>,
                                                                li: ({ children }) => <li className={`mb-1 ${themeConfig.text}`}>{children}</li>,
                                                                code: ({ children }) => <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">{children}</code>,
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${theme === 'dark'
                                                    ? 'bg-gray-800 border border-gray-700'
                                                    : 'bg-gray-100 border border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-white p-1 rounded-lg flex items-center justify-center">
                                                        <img src="/eduai-logo.png" alt="EduAI" className="w-5 h-5 object-contain" />
                                                    </div>
                                                    <span className={`text-xs font-semibold ${themeConfig.text}`}>
                                                        EduAI
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                        className="w-2 h-2 bg-blue-500 rounded-full"
                                                    />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                        className="w-2 h-2 bg-blue-500 rounded-full"
                                                    />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                        className="w-2 h-2 bg-blue-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask EduAI anything..."
                                    disabled={isLoading}
                                    rows={1}
                                    className={`w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${theme === 'dark'
                                        ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700'
                                        : 'bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    style={{ maxHeight: '150px' }}
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isLoading}
                                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

