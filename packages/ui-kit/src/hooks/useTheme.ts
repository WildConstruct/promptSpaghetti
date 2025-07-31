/**
 * Theme management hook
 */

import { createContext, useContext } from 'react';
import { Theme } from '../types';
import { createTheme } from '../platform';

// Theme context
export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  toggleColorMode: () => void;
  colorMode: 'light' | 'dark';
}>({
  theme: createTheme(),
  setTheme: () => {},
  toggleColorMode: () => {},
  colorMode: 'light',
});

// Hook to use theme
export function useTheme(): Theme {
  const context = useContext(ThemeContext);

  if (!context) {
    // Return default theme if no provider
    return createTheme();
  }

  return context.theme;
}

// Hook to use theme controls
export function useThemeControls() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeControls must be used within a ThemeProvider');
  }

  return {
    setTheme: context.setTheme,
    toggleColorMode: context.toggleColorMode,
    colorMode: context.colorMode,
  };
}
