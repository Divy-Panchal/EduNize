import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

type Theme = 'default' | 'dark' | 'purple' | 'green';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeConfig: Record<string, string>;
  isTransitioning: boolean;
  transitionTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  default: {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    secondary: 'bg-purple-600',
    accent: 'bg-green-600',
    background: 'bg-gradient-to-br from-gray-50 to-blue-50',
    card: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
  },
  dark: {
    primary: 'bg-blue-500',
    primaryHover: 'hover:bg-blue-600',
    secondary: 'bg-purple-500',
    accent: 'bg-green-500',
    background: 'bg-gradient-to-br from-gray-900 to-gray-800',
    card: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-300',
  },
  purple: {
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    secondary: 'bg-indigo-600',
    accent: 'bg-pink-600',
    background: 'bg-gradient-to-br from-purple-50 to-pink-50',
    card: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
  },
  green: {
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    secondary: 'bg-teal-600',
    accent: 'bg-emerald-600',
    background: 'bg-gradient-to-br from-green-50 to-emerald-50',
    card: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTheme, setTransitionTheme] = useState<Theme>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('eduorganize-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
      setTransitionTheme(savedTheme);
    }
  }, []);

  // Memoize theme config to prevent unnecessary re-renders
  const themeConfig = useMemo(() => themes[theme], [theme]);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    if (newTheme !== theme) {
      setTransitionTheme(newTheme);
      setIsTransitioning(true);
      // Faster transition - reduced from 600ms to 200ms
      setTimeout(() => {
        setTheme(newTheme);
        localStorage.setItem('eduorganize-theme', newTheme);
      }, 200);

      // Faster completion - reduced from 1200ms to 400ms
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }
  }, [theme]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
    themeConfig,
    isTransitioning,
    transitionTheme,
  }), [theme, handleSetTheme, themeConfig, isTransitioning, transitionTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
