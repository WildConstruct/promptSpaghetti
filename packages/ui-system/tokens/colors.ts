/**
 * Design System Color Tokens - Epic 16 UI Foundation
 * Comprehensive color system for sharing UI components
 */

// Base color palette
export const baseColors = {
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale (10 steps)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Primary brand colors
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary colors
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Success colors
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning colors
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error colors
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info colors
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },

  // Sharing-specific accent colors
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
} as const;

// Semantic color mappings
export const semanticColors = {
  // Primary brand
  primary: {
    50: baseColors.blue[50],
    100: baseColors.blue[100],
    200: baseColors.blue[200],
    300: baseColors.blue[300],
    400: baseColors.blue[400],
    500: baseColors.blue[500],
    600: baseColors.blue[600],
    700: baseColors.blue[700],
    800: baseColors.blue[800],
    900: baseColors.blue[900],
  },

  // Secondary brand
  secondary: {
    50: baseColors.indigo[50],
    100: baseColors.indigo[100],
    200: baseColors.indigo[200],
    300: baseColors.indigo[300],
    400: baseColors.indigo[400],
    500: baseColors.indigo[500],
    600: baseColors.indigo[600],
    700: baseColors.indigo[700],
    800: baseColors.indigo[800],
    900: baseColors.indigo[900],
  },

  // Status colors
  success: baseColors.green,
  warning: baseColors.amber,
  error: baseColors.red,
  info: baseColors.cyan,

  // Surface colors
  surface: {
    background: baseColors.white,
    paper: baseColors.gray[50],
    card: baseColors.white,
    overlay: 'rgba(0, 0, 0, 0.6)',
    modal: baseColors.white,
  },

  // Text colors
  text: {
    primary: baseColors.gray[900],
    secondary: baseColors.gray[700],
    tertiary: baseColors.gray[500],
    disabled: baseColors.gray[400],
    inverse: baseColors.white,
    link: baseColors.blue[600],
    linkHover: baseColors.blue[800],
  },

  // Border colors
  border: {
    default: baseColors.gray[200],
    hover: baseColors.gray[300],
    focus: baseColors.blue[500],
    error: baseColors.red[500],
    success: baseColors.green[500],
    warning: baseColors.amber[500],
    disabled: baseColors.gray[200],
  },

  // Sharing-specific colors
  sharing: {
    public: baseColors.green[500],
    restricted: baseColors.amber[500],
    private: baseColors.red[500],
    collaboration: baseColors.purple[500],
    analytics: baseColors.cyan[500],
  },
} as const;

// Component-specific color tokens
export const componentColors = {
  // Button colors
  button: {
    primary: {
      background: semanticColors.primary[500],
      backgroundHover: semanticColors.primary[600],
      backgroundActive: semanticColors.primary[700],
      backgroundDisabled: baseColors.gray[300],
      text: baseColors.white,
      textDisabled: baseColors.gray[500],
      border: 'transparent',
      borderFocus: semanticColors.primary[500],
    },
    secondary: {
      background: baseColors.white,
      backgroundHover: baseColors.gray[50],
      backgroundActive: baseColors.gray[100],
      backgroundDisabled: baseColors.gray[100],
      text: baseColors.gray[900],
      textDisabled: baseColors.gray[500],
      border: baseColors.gray[300],
      borderHover: baseColors.gray[400],
      borderFocus: semanticColors.primary[500],
    },
    ghost: {
      background: 'transparent',
      backgroundHover: baseColors.gray[100],
      backgroundActive: baseColors.gray[200],
      backgroundDisabled: 'transparent',
      text: baseColors.gray[900],
      textDisabled: baseColors.gray[500],
      border: 'transparent',
      borderFocus: semanticColors.primary[500],
    },
    destructive: {
      background: semanticColors.error[500],
      backgroundHover: semanticColors.error[600],
      backgroundActive: semanticColors.error[700],
      backgroundDisabled: baseColors.gray[300],
      text: baseColors.white,
      textDisabled: baseColors.gray[500],
      border: 'transparent',
      borderFocus: semanticColors.error[500],
    },
  },

  // Input colors
  input: {
    background: baseColors.white,
    backgroundDisabled: baseColors.gray[50],
    border: baseColors.gray[300],
    borderHover: baseColors.gray[400],
    borderFocus: semanticColors.primary[500],
    borderError: semanticColors.error[500],
    text: baseColors.gray[900],
    textDisabled: baseColors.gray[500],
    placeholder: baseColors.gray[400],
  },

  // Modal colors
  modal: {
    background: baseColors.white,
    overlay: 'rgba(0, 0, 0, 0.6)',
    border: baseColors.gray[200],
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Card colors
  card: {
    background: baseColors.white,
    backgroundHover: baseColors.gray[50],
    border: baseColors.gray[200],
    borderHover: baseColors.gray[300],
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.15)',
  },

  // Toast/notification colors
  toast: {
    success: {
      background: semanticColors.success[50],
      border: semanticColors.success[200],
      text: semanticColors.success[800],
      icon: semanticColors.success[600],
    },
    warning: {
      background: semanticColors.warning[50],
      border: semanticColors.warning[200],
      text: semanticColors.warning[800],
      icon: semanticColors.warning[600],
    },
    error: {
      background: semanticColors.error[50],
      border: semanticColors.error[200],
      text: semanticColors.error[800],
      icon: semanticColors.error[600],
    },
    info: {
      background: semanticColors.info[50],
      border: semanticColors.info[200],
      text: semanticColors.info[800],
      icon: semanticColors.info[600],
    },
  },

  // Progress colors
  progress: {
    background: baseColors.gray[200],
    fill: semanticColors.primary[500],
    text: baseColors.gray[700],
  },

  // Badge colors
  badge: {
    default: {
      background: baseColors.gray[100],
      text: baseColors.gray[800],
      border: baseColors.gray[200],
    },
    primary: {
      background: semanticColors.primary[100],
      text: semanticColors.primary[800],
      border: semanticColors.primary[200],
    },
    success: {
      background: semanticColors.success[100],
      text: semanticColors.success[800],
      border: semanticColors.success[200],
    },
    warning: {
      background: semanticColors.warning[100],
      text: semanticColors.warning[800],
      border: semanticColors.warning[200],
    },
    error: {
      background: semanticColors.error[100],
      text: semanticColors.error[800],
      border: semanticColors.error[200],
    },
  },

  // Sharing-specific component colors
  shareStatus: {
    public: {
      background: semanticColors.success[100],
      text: semanticColors.success[800],
      icon: semanticColors.success[600],
      border: semanticColors.success[200],
    },
    restricted: {
      background: semanticColors.warning[100],
      text: semanticColors.warning[800],
      icon: semanticColors.warning[600],
      border: semanticColors.warning[200],
    },
    private: {
      background: semanticColors.error[100],
      text: semanticColors.error[800],
      icon: semanticColors.error[600],
      border: semanticColors.error[200],
    },
  },

  collaboratorRole: {
    view: {
      background: baseColors.blue[100],
      text: baseColors.blue[800],
      icon: baseColors.blue[600],
    },
    comment: {
      background: baseColors.cyan[100],
      text: baseColors.cyan[800],
      icon: baseColors.cyan[600],
    },
    edit: {
      background: baseColors.purple[100],
      text: baseColors.purple[800],
      icon: baseColors.purple[600],
    },
    admin: {
      background: baseColors.pink[100],
      text: baseColors.pink[800],
      icon: baseColors.pink[600],
    },
  },
} as const;

// Dark theme color overrides
export const darkThemeColors = {
  surface: {
    background: baseColors.gray[900],
    paper: baseColors.gray[800],
    card: baseColors.gray[800],
    overlay: 'rgba(0, 0, 0, 0.8)',
    modal: baseColors.gray[800],
  },

  text: {
    primary: baseColors.gray[100],
    secondary: baseColors.gray[300],
    tertiary: baseColors.gray[400],
    disabled: baseColors.gray[600],
    inverse: baseColors.gray[900],
    link: baseColors.blue[400],
    linkHover: baseColors.blue[300],
  },

  border: {
    default: baseColors.gray[700],
    hover: baseColors.gray[600],
    focus: baseColors.blue[400],
    error: baseColors.red[400],
    success: baseColors.green[400],
    warning: baseColors.amber[400],
    disabled: baseColors.gray[700],
  },

  card: {
    background: baseColors.gray[800],
    backgroundHover: baseColors.gray[700],
    border: baseColors.gray[700],
    borderHover: baseColors.gray[600],
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHover: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

// Color utility functions
export const colorUtils = {
  /**
   * Convert hex color to RGB values
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Add alpha to hex color
   */
  addAlpha: (hex: string, alpha: number): string => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  },

  /**
   * Get contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    // Simplified contrast ratio calculation
    // In production, use a proper color contrast library
    return 4.5; // Placeholder
  },

  /**
   * Determine if text should be light or dark on background
   */
  getTextColor: (backgroundColor: string): string => {
    // Simplified text color determination
    // In production, calculate based on luminance
    return colorUtils.getContrastRatio(backgroundColor, baseColors.white) > 3 ? baseColors.white : baseColors.gray[900];
  },
} as const;

// Export all color tokens
export const colors = {
  base: baseColors,
  semantic: semanticColors,
  component: componentColors,
  darkTheme: darkThemeColors,
  utils: colorUtils,
} as const;

export type ColorScale = typeof baseColors.gray;
export type SemanticColor = keyof typeof semanticColors;
export type ComponentColor = keyof typeof componentColors;
