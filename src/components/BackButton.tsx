import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface BackButtonProps {
    to?: string;
    label?: string;
    className?: string;
}

export function BackButton({ to, label, className = '' }: BackButtonProps) {
    const navigate = useNavigate();
    const { themeConfig } = useTheme();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            // go back in history, or fallback to dashboard if no history
            if (window.history.length > 2) {
                navigate(-1);
            } else {
                navigate('/');
            }
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className={`flex items-center gap-2 ${themeConfig.textSecondary} hover:${themeConfig.text} transition-colors group ${className}`}
        >
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </div>
            {label && <span className="font-medium">{label}</span>}
        </motion.button>
    );
}
