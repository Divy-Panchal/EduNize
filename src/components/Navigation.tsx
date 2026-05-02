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
  const { theme, themeConfig } = useTheme();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isSecondaryActive = secondaryItems.some((item) => location.pathname === item.path);
  const isDark = theme === 'dark';

  const navShellClass = isDark
    ? 'bg-[#12101f] border-white/10 shadow-[0_18px_44px_rgba(0,0,0,0.38)]'
    : 'bg-white border-gray-200/80 shadow-[0_18px_44px_rgba(15,23,42,0.14)]';
  const activePillClass = isDark
    ? 'bg-white shadow-[0_8px_22px_rgba(0,0,0,0.28)]'
    : 'bg-[#12101f] shadow-[0_8px_22px_rgba(15,23,42,0.24)]';
  const activeContentClass = isDark ? 'text-[#12101f]' : 'text-white';
  const inactiveIconClass = isDark
    ? 'text-slate-400 group-hover:text-white'
    : 'text-slate-500 group-hover:text-[#12101f]';
  const hoverPillClass = isDark
    ? 'bg-white/10'
    : 'bg-slate-100';

  const renderNavItem = (item: typeof primaryItems[number]) => {
    const isActive = !isMoreOpen && location.pathname === item.path;
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
          className={`relative flex h-12 items-center justify-center overflow-hidden rounded-full px-3 transition-[width] duration-300 ease-out ${isActive ? `w-[116px] sm:w-[126px] ${activeContentClass}` : 'w-12 sm:w-14'}`}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        >
          <AnimatePresence>
            {isActive && (
              <motion.div
                layoutId="navPill"
                className={`absolute inset-0 rounded-full ${activePillClass}`}
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
          </AnimatePresence>

          {!isActive && (
            <div className={`absolute inset-0 rounded-full ${hoverPillClass} opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 scale-75`} />
          )}

          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={{ x: isActive ? 0 : 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
          >
            <Icon
              className={`h-5 w-5 shrink-0 transition-colors duration-300 ease-out ${isActive ? 'text-current' : inactiveIconClass}`}
              strokeWidth={isActive ? 2.8 : 2.2}
            />
          </motion.div>

          <AnimatePresence>
            {isActive && (
              <motion.span
                initial={{ opacity: 0, x: -8, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: -8, width: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative z-10 ml-2 overflow-hidden whitespace-nowrap text-sm font-bold text-current"
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
                      className={`flex items-center gap-3 rounded-xl p-3 transition-all ${isActive ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-gray-700'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/15 dark:bg-slate-950/10' : 'bg-slate-100 dark:bg-blue-900/40'}`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white dark:text-slate-950' : 'text-blue-700 dark:text-blue-300'}`} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? 'text-white dark:text-slate-950' : themeConfig.text}`}>{item.label}</p>
                        <p className={`text-xs ${isActive ? 'text-slate-200 dark:text-slate-700' : themeConfig.textSecondary}`}>{item.description}</p>
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
        className={`flex w-auto max-w-[98%] items-center gap-1 rounded-full border px-3 py-3 backdrop-blur-xl sm:max-w-[95%] sm:gap-2 sm:px-4 md:max-w-5xl ${navShellClass}`}
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
            className={`relative flex h-12 items-center justify-center overflow-hidden rounded-full px-3 transition-[width] duration-300 ease-out ${isMoreOpen || isSecondaryActive ? `w-[104px] sm:w-[112px] ${activeContentClass}` : 'w-12 sm:w-14'}`}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <AnimatePresence>
              {(isMoreOpen || isSecondaryActive) && (
                <motion.div
                  layoutId="navPillMore"
                  className={`absolute inset-0 rounded-full ${activePillClass}`}
                  initial={{ opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
            </AnimatePresence>
            {!isMoreOpen && !isSecondaryActive && (
              <div className={`absolute inset-0 rounded-full ${hoverPillClass} opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 scale-75`} />
            )}
            <MoreHorizontal className={`relative z-10 h-5 w-5 shrink-0 transition-colors duration-300 ${isMoreOpen || isSecondaryActive ? 'text-current' : inactiveIconClass}`} strokeWidth={isMoreOpen || isSecondaryActive ? 2.8 : 2.2} />
            <AnimatePresence>
              {(isMoreOpen || isSecondaryActive) && (
                <motion.span
                  initial={{ opacity: 0, x: -8, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -8, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative z-10 ml-2 overflow-hidden whitespace-nowrap text-sm font-bold text-current"
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
