/**
 * Style utilities for applying theme colors to inline styles
 * This provides a bridge between CSS variables and inline styles
 */

// Get computed style value for a CSS variable
export const getCSSVariable = (varName: string): string => {
  if (typeof window === 'undefined') {return '';}
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
};

// Common color getters
export const colors = {
  // Background colors
  bgPrimary: () => getCSSVariable('--color-bg-primary'),
  bgSecondary: () => getCSSVariable('--color-bg-secondary'),
  bgTertiary: () => getCSSVariable('--color-bg-tertiary'),
  bgQuaternary: () => getCSSVariable('--color-bg-quaternary'),
  bgOverlay: () => getCSSVariable('--color-bg-overlay'),

  // Text colors
  textPrimary: () => getCSSVariable('--color-text-primary'),
  textSecondary: () => getCSSVariable('--color-text-secondary'),
  textTertiary: () => getCSSVariable('--color-text-tertiary'),

  // Accent colors
  accentOrange: () => getCSSVariable('--color-accent-orange'),
  accentBlue: () => getCSSVariable('--color-accent-blue'),

  // Status colors
  statusError: () => getCSSVariable('--color-status-error'),
  statusSuccess: () => getCSSVariable('--color-status-success'),
  statusWarning: () => getCSSVariable('--color-status-warning'),
  statusInfo: () => getCSSVariable('--color-status-info'),

  // UI colors
  uiBorder: () => getCSSVariable('--color-ui-border'),
  uiBorderLight: () => getCSSVariable('--color-ui-border-light')
};

// Shadow getters
export const shadows = {
  sm: () => getCSSVariable('--shadow-sm'),
  md: () => getCSSVariable('--shadow-md'),
  lg: () => getCSSVariable('--shadow-lg'),
  xl: () => getCSSVariable('--shadow-xl'),
  '2xl': () => getCSSVariable('--shadow-2xl')
};

// Style presets for common patterns
export const stylePresets = {
  aboutModal: {
    container: {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'var(--color-bg-primary)',
      border: '2px solid var(--color-ui-border)',
      borderRadius: '12px',
      padding: '30px',
      zIndex: 10000,
      boxShadow: 'var(--shadow-2xl)',
      maxWidth: '400px',
      color: 'var(--color-text-primary)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },

    heading: {
      margin: '0 0 20px 0',
      color: 'var(--color-accent-orange)'
    },

    text: {
      margin: '10px 0',
      lineHeight: 1.6,
      color: 'var(--color-text-secondary)'
    },

    footer: {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid var(--color-ui-border)'
    },

    footerText: {
      margin: '5px 0',
      fontSize: '14px',
      color: 'var(--color-text-tertiary)'
    },

    button: {
      marginTop: '20px',
      padding: '10px 20px',
      backgroundColor: 'var(--color-accent-orange)',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '14px'
    },

    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--color-bg-overlay)',
      zIndex: 9999
    }
  },

  errorMessage: {
    padding: '20px',
    color: 'var(--color-status-error)'
  },

  loadingMessage: {
    padding: '20px',
    color: 'var(--color-text-secondary)'
  }
};

// Console styling helper
export const getConsoleStyle = () => {
  return `color: ${colors.accentOrange() || '#ff7c00'}; font-size: 16px; font-weight: bold`;
};
