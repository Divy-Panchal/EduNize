import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ChevronDown } from 'lucide-react';

const getStoredUserData = (userId: string | undefined) => {
  const defaultData = {
    fullName: 'Student',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e0e0e0"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23999"/%3E%3Cpath d="M 20 85 Q 20 60 50 60 Q 80 60 80 85 Z" fill="%23999"/%3E%3C/svg%3E',
  };

  if (!userId) return defaultData;

  try {
    const stored = localStorage.getItem(`userData_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultData, ...parsed };
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error parsing user data:', error);
    }
  }

  return defaultData;
};

export function DashboardProfile() {
  const { themeConfig } = useTheme();
  const { user } = useAuth();
  const [userData, setUserData] = useState(() => getStoredUserData(user?.uid));
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorageUpdate = (event: StorageEvent) => {
      if (user && event.key === `userData_${user.uid}`) {
        setUserData(getStoredUserData(user.uid));
      }
    };

    setUserData(getStoredUserData(user?.uid));
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [user]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg"
        whileHover={{ backgroundColor: themeConfig.hover, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        <img
          src={userData.profilePhoto}
          alt="Profile"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-blue-400"
        />
        <div className='hidden md:block'>
          <h4 className={`font-semibold ${themeConfig.text}`}>{userData.fullName}</h4>
          <div className="flex items-center">
            <p className={`text-sm ${themeConfig.textSecondary}`}>View Options</p>
            <ChevronDown size={16} className={`${themeConfig.textSecondary} ml-1`} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
          >
            <div className="py-1">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
