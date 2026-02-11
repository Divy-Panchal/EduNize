import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { LogOut } from 'lucide-react';

interface ExitConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ExitConfirmationModal({ isOpen, onClose, onConfirm }: ExitConfirmationModalProps) {
    const { themeConfig } = useTheme();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`${themeConfig.card} rounded-2xl p-6 max-w-sm w-full shadow-2xl border ${themeConfig.text === 'text-white' ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4`}>
                                <LogOut className="w-6 h-6 text-red-500" />
                            </div>

                            <h2 className={`text-xl font-bold ${themeConfig.text} mb-2`}>
                                Exit App?
                            </h2>

                            <p className={`${themeConfig.textSecondary} mb-6`}>
                                Are you sure you want to exit the application?
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold ${themeConfig.background} ${themeConfig.text} border-2 ${themeConfig.text === 'text-white' ? 'border-gray-600' : 'border-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
                                >
                                    Exit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
