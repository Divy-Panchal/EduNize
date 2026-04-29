import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, CheckSquare, User, CalendarDays, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navigationItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/timetable', icon: CalendarDays, label: 'Schedule' },
  { path: '/eduai', icon: Sparkles, label: 'EduAI' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Navigation() {
  const location = useLocation();
  const { themeConfig } = useTheme();

  return (
    <nav className="fixed bottom-12 sm:bottom-6 left-0 right-0 flex justify-center z-[9999] px-3 sm:px-4 md:px-6 safe-area-bottom">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`flex items-center gap-2 sm:gap-3 md:gap-4 ${themeConfig.card} backdrop-blur-lg rounded-full shadow-lg border ${themeConfig.text === 'text-white' ? 'border-gray-700/30' : 'border-gray-200/30'} px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 w-auto max-w-[98%] sm:max-w-[95%] md:max-w-5xl`}
      >
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative group flex-shrink-0"
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className="relative flex flex-col items-center justify-center px-4 sm:px-5 md:px-6 py-2"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {/* Active background pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-full shadow-md"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Hover background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ease-out ${isActive
                      ? 'text-white'
                      : `${themeConfig.textSecondary} group-hover:${themeConfig.text}`
                      }`}
                  />
                </motion.div>

                {/* Label */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="relative z-10 text-[10px] font-semibold text-white mt-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
