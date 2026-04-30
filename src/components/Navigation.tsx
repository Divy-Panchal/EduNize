import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, BookOpen, CheckSquare, Clock, Home, MoreHorizontal, Settings, Trophy, User, X, CalendarDays, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const primaryItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/timetable', icon: CalendarDays, label: 'Schedule' },
  { path: '/eduai', icon: Sparkles, label: 'EduAI' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const secondaryItems = [
  { path: '/subjects', icon: BookOpen, label: 'Subjects', description: 'Notes, topics, resources' },
  { path: '/grades', icon: BarChart3, label: 'Grades', description: 'Scores and performance' },
  { path: '/pomodoro', icon: Clock, label: 'Focus', description: 'Study timer and sessions' },
  { path: '/results', icon: Trophy, label: 'Results', description: 'Progress insights' },
  { path: '/settings', icon: Settings, label: 'Settings', description: 'Preferences and account' },
];

export function Navigation() {
  const location = useLocation();
  const { themeConfig } = useTheme();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isSecondaryActive = secondaryItems.some((item) => location.pathname === item.path);

  const renderNavItem = (item: typeof primaryItems[number]) => {
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
          className="relative flex flex-col items-center justify-center px-3 sm:px-4 md:px-5 py-2 min-w-[58px]"
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
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

          {!isActive && (
            <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}

          <motion.div
            className="relative z-10"
            animate={{ y: isActive ? -2 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon
              className={`w-5 h-5 transition-all duration-300 ease-out ${isActive
                ? 'text-white'
                : `${themeConfig.textSecondary} group-hover:${themeConfig.text}`
                }`}
            />
          </motion.div>

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
  };

  return (
    <>
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className={`fixed bottom-32 sm:bottom-28 left-4 right-4 mx-auto max-w-md ${themeConfig.card} border dark:border-gray-700 rounded-2xl shadow-2xl z-[9999] p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className={`text-sm font-bold ${themeConfig.text}`}>More tools</h2>
                  <p className={`text-xs ${themeConfig.textSecondary}`}>Jump into the rest of your workspace</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close more tools"
                >
                  <X className={`w-4 h-4 ${themeConfig.textSecondary}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/15' : 'bg-blue-50 dark:bg-blue-900/40'}`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-300'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? 'text-white' : themeConfig.text}`}>{item.label}</p>
                        <p className={`text-xs ${isActive ? 'text-blue-100' : themeConfig.textSecondary}`}>{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-12 sm:bottom-6 left-0 right-0 flex justify-center z-[9999] px-3 sm:px-4 md:px-6 safe-area-bottom">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`flex items-center gap-1 sm:gap-2 ${themeConfig.card} backdrop-blur-lg rounded-full shadow-lg border ${themeConfig.text === 'text-white' ? 'border-gray-700/30' : 'border-gray-200/30'} px-3 sm:px-4 py-3 w-auto max-w-[98%] sm:max-w-[95%] md:max-w-5xl`}
      >
        {primaryItems.map(renderNavItem)}
        <button
          type="button"
          onClick={() => setIsMoreOpen((value) => !value)}
          className="relative group flex-shrink-0"
          aria-label="Open more tools"
          aria-expanded={isMoreOpen}
        >
          <motion.div
            className="relative flex flex-col items-center justify-center px-3 sm:px-4 md:px-5 py-2 min-w-[58px]"
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <AnimatePresence>
              {(isMoreOpen || isSecondaryActive) && (
                <motion.div
                  layoutId="navPillMore"
                  className="absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-full shadow-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>
            {!isMoreOpen && !isSecondaryActive && (
              <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
            <MoreHorizontal className={`relative z-10 w-5 h-5 ${isMoreOpen || isSecondaryActive ? 'text-white' : themeConfig.textSecondary}`} />
            <AnimatePresence>
              {(isMoreOpen || isSecondaryActive) && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative z-10 text-[10px] font-semibold text-white mt-1"
                >
                  More
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
      </motion.div>
      </nav>
    </>
  );
}
