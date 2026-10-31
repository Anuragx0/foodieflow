import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'foodieflow_theme';

export const ThemeProvider = ({ children }) => {
  // Theme state: 'system' | 'light' | 'dark'
  // Default MUST be 'system' (browser theme) as requested
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
      return 'system';
    } catch {
      return 'system';
    }
  });

  // Track system preference
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to system/OS dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Legacy fallback
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Compute resolved theme ('light' or 'dark')
  const resolvedTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Apply to document.documentElement whenever theme or system preference changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      root.setAttribute('data-theme-setting', 'system');
      if (systemIsDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.setAttribute('data-theme-setting', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.setAttribute('data-theme-setting', 'light');
      root.style.colorScheme = 'light';
    }
  }, [theme, systemIsDark]);

  // Set theme and persist
  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'system' || newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch (e) {
        console.warn('Failed to save theme preference', e);
      }
    }
  }, []);

  // Cycle through: system -> light -> dark -> system
  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      let next = 'system';
      if (prev === 'system') next = 'light';
      else if (prev === 'light') next = 'dark';
      else next = 'system';

      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {
        console.warn('Failed to save theme preference', e);
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        isDark: resolvedTheme === 'dark',
        setTheme,
        cycleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
