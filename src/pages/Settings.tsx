import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Bell, User, Shield, HelpCircle, LogOut, Download, Trash2, AlertTriangle, Eye, EyeOff, GraduationCap, School } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useGrade } from '../context/GradeContext';
import toast from 'react-hot-toast';

export function Settings() {
  const { theme, setTheme, themeConfig } = useTheme();
  const { signOut, deleteAccount, user } = useAuth();
  const { gradingSystem, setGradingSystem } = useGrade();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toastShownRef = useRef<{ [key: string]: number }>({});

  // Notification settings state with localStorage persistence
  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('notificationSettings');
      return saved ? JSON.parse(saved) : {
        taskReminders: true,
        pomodoroBreaks: true,
        weeklyProgress: false,
        achievementUnlocked: true
      };
    } catch {
      return {
        taskReminders: true,
        pomodoroBreaks: true,
        weeklyProgress: false,
        achievementUnlocked: true
      };
    }
  });

  // Save notification settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const toggleNotification = (key: string) => {
    setNotificationSettings((prev: any) => {
      const newSettings = {
        ...prev,
        [key]: !prev[key]
      };

      // Prevent duplicate toasts using ref
      const now = Date.now();
      const lastToast = toastShownRef.current[key] || 0;

      // Only show toast if more than 500ms has passed since last toast for this key
      if (now - lastToast > 500) {
        toastShownRef.current[key] = now;
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
        toast.success(`${capitalizedLabel} ${newSettings[key] ? 'enabled' : 'disabled'}`);
      }

      return newSettings;
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      setDeletePassword('');
      setShowPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setShowPassword(false);
    setIsDeleting(false);
  };

  const themes = [
    { id: 'default', name: 'Ocean Blue', colors: ['#3B82F6', '#8B5CF6', '#10B981'] },
    { id: 'dark', name: 'Dark Mode', colors: ['#374151', '#4B5563', '#6B7280'] },
    { id: 'purple', name: 'Purple Dream', colors: ['#8B5CF6', '#EC4899', '#F59E0B'] },
    { id: 'green', name: 'Nature', colors: ['#10B981', '#059669', '#047857'] }
  ];

  const notificationOptions = [
    { label: 'Task Reminders', key: 'taskReminders' },
    { label: 'Pomodoro Breaks', key: 'pomodoroBreaks' },
    { label: 'Weekly Progress', key: 'weeklyProgress' },
    { label: 'Achievement Unlocked', key: 'achievementUnlocked' }
  ];

  return (
    <div className="space-y-6 pb-40">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-2xl md:text-3xl font-bold ${themeConfig.text} mb-2`}>Settings</h1>
        <p className={themeConfig.textSecondary}>
          Customize your EduOrganize experience
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <div className="flex items-center gap-3 mb-6">
          <Palette className={`w-6 h-6 ${themeConfig.primary.replace('bg-', 'text-')}`} />
          <h2 className={`text-lg md:text-xl font-semibold ${themeConfig.text}`}>Theme</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((themeOption, index) => {
            const isActive = theme === themeOption.id;
            const activeCardBg = theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50';
            const inactiveCardBg = theme === 'dark' ? 'bg-gray-800/50' : 'bg-white';

            return (
              <motion.div
                key={themeOption.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(themeOption.id as any)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isActive
                  ? `border-blue-500 dark:border-blue-400 ${activeCardBg}`
                  : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 ${inactiveCardBg}`
                  }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1">
                    {themeOption.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className={`font-medium ${themeConfig.text} text-sm md:text-base`}>
                    {themeOption.name}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                  >
                    ✓ Currently active
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Grading System Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
      >
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className={`w-6 h-6 ${themeConfig.primary.replace('bg-', 'text-')}`} />
          <h2 className={`text-lg md:text-xl font-semibold ${themeConfig.text}`}>Grading System</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setGradingSystem('college')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${gradingSystem === 'college'
              ? `border-blue-500 dark:border-blue-400 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50'}`
              : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}`
              }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className={`w-5 h-5 ${gradingSystem === 'college' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`font-medium ${themeConfig.text}`}>College Student</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              International 10.0 scale (CGPA/SGPA) for university students.
            </p>
            {gradingSystem === 'college' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium"
              >
                ✓ Currently active
              </motion.div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setGradingSystem('school')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${gradingSystem === 'school'
              ? `border-teal-500 dark:border-teal-400 ${theme === 'dark' ? 'bg-teal-900/20' : 'bg-teal-50'}`
              : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}`
              }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <School className={`w-5 h-5 ${gradingSystem === 'school' ? 'text-teal-500' : 'text-gray-400'}`} />
              <span className={`font-medium ${themeConfig.text}`}>School Student</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Standard 100% scale (Percentage & Letter Grades) for school students.
            </p>
            {gradingSystem === 'school' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-teal-600 dark:text-teal-400 font-medium"
              >
                ✓ Currently active
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className={`w-5 h-5 ${themeConfig.secondary.replace('bg-', 'text-')}`} />
            <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>Notifications</h3>
          </div>

          <div className="space-y-4">
            {notificationOptions.map((setting) => (
              <div key={setting.label} className="flex items-center justify-between">
                <span className={`text-xs md:text-sm ${themeConfig.text}`}>{setting.label}</span>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleNotification(setting.key)}
                  className={`w-10 h-6 rounded-full cursor-pointer transition-colors duration-200 flex items-center ${notificationSettings[setting.key as keyof typeof notificationSettings] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full ml-1"
                    animate={{ x: notificationSettings[setting.key as keyof typeof notificationSettings] ? 16 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`${themeConfig.card} p-4 md:p-6 rounded-xl shadow-sm border dark:border-gray-700`}
        >
          <div className="flex items-center gap-3 mb-4">
            <User className={`w-5 h-5 ${themeConfig.accent.replace('bg-', 'text-')}`} />
            <h3 className={`text-base md:text-lg font-semibold ${themeConfig.text}`}>Account</h3>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className={`w-full p-3 rounded-lg ${themeConfig.card} border dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center gap-2 ${themeConfig.text}`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:border-red-500 transition-colors flex items-center gap-2 text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete Account</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${themeConfig.card} p-6 rounded-xl max-w-md w-full border dark:border-gray-700`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className={`text-lg font-semibold ${themeConfig.text}`}>Delete Account</h3>
              </div>

              <p className={`${themeConfig.textSecondary} mb-4 text-sm`}>
                This action cannot be undone. All your data will be permanently deleted.
              </p>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${themeConfig.text} mb-2`}>
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className={`w-full px-3 py-2 pr-10 rounded-lg border ${themeConfig.card} ${themeConfig.text} border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseModal}
                  className={`flex-1 px-4 py-2 rounded-lg border ${themeConfig.text} border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                  disabled={isDeleting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}