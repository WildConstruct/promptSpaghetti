import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Theme Provider component for cross-platform theming
 */
import { useState, useEffect, useMemo } from 'react';
import { ThemeContext } from '../hooks/useTheme';
import { createTheme } from '../platform';
export const ThemeProvider = ({ children, theme: themeOverrides, defaultColorMode = 'system' }) => {
    const [colorMode, setColorMode] = useState(() => {
        if (defaultColorMode === 'system') {
            return typeof window !== 'undefined' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }
        return defaultColorMode;
    });
    const [customTheme, setCustomTheme] = useState(themeOverrides || {});
    // Listen for system color mode changes
    useEffect(() => {
        if (defaultColorMode === 'system' && typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                setColorMode(e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [defaultColorMode]);
    // Create theme with color mode and custom overrides
    const theme = useMemo(() => {
        const baseTheme = createTheme();
        // Apply color mode
        const colorModeTheme = colorMode === 'dark' ? {
            ...baseTheme,
            colors: {
                primary: '#0A84FF',
                secondary: '#5E5CE6',
                accent: '#FF9F0A',
                background: '#000000',
                surface: '#1C1C1E',
                text: '#FFFFFF',
                textSecondary: '#8E8E93',
                border: '#38383A',
                error: '#FF453A',
                warning: '#FF9F0A',
                success: '#32D74B',
                info: '#64D2FF'
            }
        } : baseTheme;
        // Apply custom theme overrides
        return {
            ...colorModeTheme,
            ...customTheme,
            colors: {
                ...colorModeTheme.colors,
                ...(customTheme.colors || {})
            }
        };
    }, [colorMode, customTheme]);
    const setTheme = (themeOverrides) => {
        setCustomTheme(prev => ({
            ...prev,
            ...themeOverrides,
            colors: {
                ...prev.colors,
                ...(themeOverrides.colors || {})
            }
        }));
    };
    const toggleColorMode = () => {
        setColorMode(prev => prev === 'light' ? 'dark' : 'light');
    };
    const contextValue = {
        theme,
        setTheme,
        toggleColorMode,
        colorMode
    };
    return (_jsx(ThemeContext.Provider, { value: contextValue, children: _jsxs("div", { className: "ui-theme-provider", style: {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily,
                fontSize: `${theme.typography.fontSize.md}px`,
                lineHeight: theme.typography.lineHeight.normal,
                minHeight: '100%'
            }, children: [children, _jsx("style", { dangerouslySetInnerHTML: {
                        __html: `
            :root {
              --ui-primary: ${theme.colors.primary};
              --ui-secondary: ${theme.colors.secondary};
              --ui-accent: ${theme.colors.accent};
              --ui-background: ${theme.colors.background};
              --ui-surface: ${theme.colors.surface};
              --ui-text: ${theme.colors.text};
              --ui-text-secondary: ${theme.colors.textSecondary};
              --ui-border: ${theme.colors.border};
              --ui-error: ${theme.colors.error};
              --ui-warning: ${theme.colors.warning};
              --ui-success: ${theme.colors.success};
              --ui-info: ${theme.colors.info};
              
              --ui-spacing-xs: ${theme.spacing.xs}px;
              --ui-spacing-sm: ${theme.spacing.sm}px;
              --ui-spacing-md: ${theme.spacing.md}px;
              --ui-spacing-lg: ${theme.spacing.lg}px;
              --ui-spacing-xl: ${theme.spacing.xl}px;
              
              --ui-border-radius: ${theme.borderRadius}px;
              --ui-shadow-sm: ${theme.shadows.sm};
              --ui-shadow-md: ${theme.shadows.md};
              --ui-shadow-lg: ${theme.shadows.lg};
              
              --ui-font-family: ${theme.typography.fontFamily};
              --ui-font-size-xs: ${theme.typography.fontSize.xs}px;
              --ui-font-size-sm: ${theme.typography.fontSize.sm}px;
              --ui-font-size-md: ${theme.typography.fontSize.md}px;
              --ui-font-size-lg: ${theme.typography.fontSize.lg}px;
              --ui-font-size-xl: ${theme.typography.fontSize.xl}px;
              --ui-font-size-xxl: ${theme.typography.fontSize.xxl}px;
            }
            
            * {
              box-sizing: border-box;
            }
            
            .ui-theme-provider {
              transition: background-color 0.2s ease, color 0.2s ease;
            }
            
            /* Focus styles */
            .ui-theme-provider :focus {
              outline: 2px solid ${theme.colors.primary};
              outline-offset: 2px;
            }
            
            .ui-theme-provider :focus:not(:focus-visible) {
              outline: none;
            }
            
            /* Scrollbar styles */
            .ui-theme-provider ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            
            .ui-theme-provider ::-webkit-scrollbar-track {
              background: ${theme.colors.surface};
            }
            
            .ui-theme-provider ::-webkit-scrollbar-thumb {
              background: ${theme.colors.border};
              border-radius: 4px;
            }
            
            .ui-theme-provider ::-webkit-scrollbar-thumb:hover {
              background: ${theme.colors.textSecondary};
            }
            
            /* Selection styles */
            .ui-theme-provider ::selection {
              background: ${theme.colors.primary};
              color: ${theme.colors.background};
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
              .ui-theme-provider * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          `
                    } })] }) }));
};
//# sourceMappingURL=ThemeProvider.js.map