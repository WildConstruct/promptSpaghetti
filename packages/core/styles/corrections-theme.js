import { jsx as _jsx } from "react/jsx-runtime";
export const darkTheme = {
    colors: {
        primary: '#63b3ed',
        secondary: '#9f7aea',
        success: '#68d391',
        warning: '#fbb040',
        error: '#e53e3e',
        info: '#63b3ed',
        background: {
            primary: '#23272f',
            secondary: '#2a2e37',
            tertiary: '#1e2228',
            elevated: '#2d3748',
            overlay: 'rgba(0, 0, 0, 0.8)'
        },
        text: {
            primary: '#ffffff',
            secondary: '#a0aec0',
            disabled: '#718096',
            inverse: '#000000'
        },
        border: {
            primary: '#444444',
            secondary: '#2d3748',
            active: '#63b3ed'
        },
        status: {
            active: '#68d391',
            inactive: '#718096',
            regex: '#9f7aea',
            priority: '#fbb040'
        }
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px'
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: {
            xs: '10px',
            sm: '12px',
            md: '14px',
            lg: '16px',
            xl: '18px',
            xxl: '20px'
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
        },
        lineHeight: {
            tight: 1.25,
            normal: 1.5,
            loose: 1.75
        }
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
    },
    radius: {
        none: '0',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px'
    },
    transitions: {
        fast: 'all 0.1s ease',
        normal: 'all 0.2s ease',
        slow: 'all 0.3s ease'
    },
    breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1280px'
    }
};
export const lightTheme = {
    ...darkTheme,
    colors: {
        ...darkTheme.colors,
        background: {
            primary: '#ffffff',
            secondary: '#f7fafc',
            tertiary: '#edf2f7',
            elevated: '#e2e8f0',
            overlay: 'rgba(0, 0, 0, 0.6)'
        },
        text: {
            primary: '#1a202c',
            secondary: '#4a5568',
            disabled: '#a0aec0',
            inverse: '#ffffff'
        },
        border: {
            primary: '#e2e8f0',
            secondary: '#cbd5e0',
            active: '#63b3ed'
        }
    }
};
// Theme context and provider
import React, { createContext, useContext } from 'react';
const CorrectionsThemeContext = createContext(undefined);
export const CorrectionsThemeProvider = ({ children, initialTheme = 'dark' }) => {
    const [isDark, setIsDark] = React.useState(initialTheme === 'dark');
    const theme = isDark ? darkTheme : lightTheme;
    const toggleTheme = () => {
        setIsDark(!isDark);
    };
    return (_jsx(CorrectionsThemeContext.Provider, { value: { theme, isDark, toggleTheme }, children: children }));
};
export const useCorrectionsTheme = () => {
    const context = useContext(CorrectionsThemeContext);
    if (!context) {
        throw new Error('useCorrectionsTheme must be used within a CorrectionsThemeProvider');
    }
    return context;
};
// Utility functions for styles
export const createStyles = (theme) => ({
    // Button styles
    button: {
        primary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.text.inverse,
            border: 'none',
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            borderRadius: theme.radius.md,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: theme.transitions.normal
        },
        secondary: {
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            borderRadius: theme.radius.md,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: theme.transitions.normal
        },
        danger: {
            backgroundColor: theme.colors.error,
            color: theme.colors.text.inverse,
            border: 'none',
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            borderRadius: theme.radius.md,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: theme.transitions.normal
        }
    },
    // Input styles
    input: {
        base: {
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.radius.md,
            fontSize: theme.typography.fontSize.md,
            transition: theme.transitions.normal,
            '&:focus': {
                borderColor: theme.colors.border.active,
                outline: 'none'
            }
        },
        search: {
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: theme.radius.lg,
            fontSize: theme.typography.fontSize.md,
            width: '100%',
            transition: theme.transitions.normal,
            '&:focus': {
                borderColor: theme.colors.border.active,
                outline: 'none'
            }
        }
    },
    // Card styles
    card: {
        base: {
            backgroundColor: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            boxShadow: theme.shadows.sm,
            transition: theme.transitions.normal
        },
        elevated: {
            backgroundColor: theme.colors.background.elevated,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            boxShadow: theme.shadows.md,
            transition: theme.transitions.normal
        }
    },
    // Layout styles
    panel: {
        base: {
            backgroundColor: theme.colors.background.primary,
            color: theme.colors.text.primary,
            borderLeft: `1px solid ${theme.colors.border.primary}`,
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: theme.transitions.normal
        },
        mobile: {
            backgroundColor: theme.colors.background.primary,
            color: theme.colors.text.primary,
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }
    },
    // Status styles
    status: {
        active: {
            color: theme.colors.status.active
        },
        inactive: {
            color: theme.colors.status.inactive
        },
        regex: {
            backgroundColor: theme.colors.status.regex,
            color: theme.colors.text.inverse,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            borderRadius: theme.radius.sm,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium
        }
    },
    // Typography styles
    text: {
        heading: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            lineHeight: theme.typography.lineHeight.tight
        },
        subheading: {
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            lineHeight: theme.typography.lineHeight.normal
        },
        body: {
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.normal,
            color: theme.colors.text.primary,
            lineHeight: theme.typography.lineHeight.normal
        },
        caption: {
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.normal,
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.lineHeight.normal
        }
    }
});
// Media query helpers
export const mediaQueries = {
    mobile: `@media (max-width: ${darkTheme.breakpoints.mobile})`,
    tablet: `@media (max-width: ${darkTheme.breakpoints.tablet})`,
    desktop: `@media (min-width: ${darkTheme.breakpoints.desktop})`
};
// Animation presets
export const animations = {
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
    },
    slideIn: {
        from: { transform: 'translateX(100%)' },
        to: { transform: 'translateX(0)' }
    },
    scaleIn: {
        from: { transform: 'scale(0.95)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 }
    }
};
