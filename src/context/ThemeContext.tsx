'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AppTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'vocatai-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isValidTheme(value: string | null): value is AppTheme {
  return value === 'light' || value === 'dark';
}

function applyThemeToDocument(theme: AppTheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'light';

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(storedTheme) ? storedTheme : 'light';
  });

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    applyThemeToDocument(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
