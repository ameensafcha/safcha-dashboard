'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';

export interface ThemeMode {
  mode: 'light' | 'dark' | 'system';
}

export const DEFAULT_THEME: ThemeMode = {
  mode: 'system',
};

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode['mode']) => void;
  isLoading: boolean;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}

interface ThemeModeProviderProps {
  children: React.ReactNode;
  initialMode: ThemeMode['mode'];
}

export function ThemeModeProvider({ children, initialMode }: ThemeModeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>({ mode: initialMode });
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setThemeMode({ mode: initialMode });
    setIsLoading(false);
  }, [initialMode]);

  useEffect(() => {
    if (!isLoading) {
      applyTheme(themeMode.mode, resolvedTheme, setTheme);
    }
  }, [themeMode.mode, resolvedTheme, isLoading, setTheme]);

  const handleSetThemeMode = useCallback((mode: ThemeMode['mode']) => {
    setThemeMode({ mode });
    setHasChanges(true);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      setThemeMode: handleSetThemeMode,
      isLoading, 
      hasChanges,
      setHasChanges 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(mode: ThemeMode['mode'], resolvedTheme: string | undefined, setTheme: (theme: string) => void) {
  const effectiveMode = mode === 'system' ? (resolvedTheme || 'light') : mode;
  setTheme(effectiveMode);
}
