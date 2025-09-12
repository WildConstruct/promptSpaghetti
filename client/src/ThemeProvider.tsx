import React, { createContext, useContext, useEffect, useState } from 'react';

interface Theme {
  colors: Record<string, string>;
  typography: Record<string, string | number>;
  branding: Record<string, string>;
}

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setTheme] = useState<Theme>({
    colors: {},
    typography: {},
    branding: {}
  });

  useEffect(() => {
    fetch('/api/admin/theme')
      .then(res => res.json())
      .then(setTheme)
      .catch(err => console.error('Failed to load theme', err));
  }, []);

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement.style;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.setProperty(`--color-${key}`, value);
    });
    // Apply typography
    Object.entries(theme.typography).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.setProperty(`--typography-${key}`, value);
      }
    });
    // Apply branding
    if (theme.branding.defaultText) {
      root.setProperty(
        '--branding-text',
        '"' + theme.branding.defaultText + '"'
      );
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
