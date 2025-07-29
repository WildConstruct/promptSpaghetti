/**
 * Epic 8.1 - Professional Visual Design System
 * Inspired by Cinema 4D and Substance Designer interface patterns
 * 
 * This design system provides professional-grade colors, typography,
 * shadows, and layout tokens for VFX industry standards.
 */

export interface ProfessionalColorPalette {
  // Primary Dark Theme (inspired by Cinema 4D R25 + Substance Designer)
  background: {
  primary: string;      // Main canvas background,
  secondary: string;    // Panel backgrounds,
  tertiary: string;     // Elevated surfaces,
  elevated: string;     // Modal/dialog backgrounds,
  inverse: string;      // Light surfaces for contrast,
};
  // Professional Text Colors
  text: {
  primary: string;      // Main text color,
  secondary: string;    // Secondary text,
  tertiary: string;     // Disabled text,
  inverse: string;      // Text on dark backgrounds,
  accent: string;       // Highlighted text,
};
  // VFX Industry Accent Colors
  accent: {
  orange: string;       // Cinema 4D signature orange,
  blue: string;         // Technical/data accent,
  cyan: string;         // Node connection highlights,
  purple: string;       // Advanced features,
  green: string;        // Success states,
  red: string;          // Error/warning states,
  yellow: string;       // Warning/attention,
};
  // Node Category Colors (Professional)
  nodes: {
  text: string;         // Text manipulation nodes,
  logic: string;        // Logic/flow control,
  output: string;       // Final output nodes,
  variable: string;     // Variable operations,
  advanced: string;     // Advanced/experimental features,
  transform: string;    // Data transformation,
};
  // Interface Elements
  ui: {
  border: string;       // Default borders,
  borderHover: string;  // Interactive borders,
  borderActive: string; // Active/selected borders,
  focus: string;        // Focus indicator,
  selection: string;    // Selection highlight,
  hover: string;        // Hover states,
};
}
export interface ProfessionalTypography {
  fontFamilies: {
  primary: string;      // Main UI font (technical-friendly),
  mono: string;         // Code/technical text,
  heading: string;      // Headers and titles,
};
  fontSizes: {
  xs: string;          // 11px - Small labels,
  sm: string;          // 13px - Body text,
  base: string;        // 14px - Default size,
  lg: string;          // 16px - Emphasized text,
  xl: string;          // 18px - Large text,
  '2xl': string;       // 20px - Section headers,
  '3xl': string;       // 24px - Page headers,
};
  fontWeights: {
  normal: number;      // 400,
  medium: number;      // 500,
  semibold: number;    // 600,
  bold: number;        // 700,
};
  lineHeights: {
  tight: number;       // 1.25,
  normal: number;      // 1.5,
  relaxed: number;     // 1.75,
};
  letterSpacing: {
  tight: string;       // -0.025em,
  normal: string;      // 0em,
  wide: string;        // 0.025em,
};
}
export interface ProfessionalShadows {
  // Elevation System (inspired by Material Design + VFX tools)
  elevation: {
  none: string;
  sm: string;          // Subtle elevation,
  md: string;          // Standard elevation,
  lg: string;          // Prominent elevation,
  xl: string;          // High elevation (modals),
  '2xl': string;       // Maximum elevation,
};
  // Specialized Shadows
  node: {
  default: string;     // Default node shadow,
  hover: string;       // Node hover state,
  selected: string;    // Selected node shadow,
  focus: string;       // Focused node shadow,
};
  // Glows and Effects
  glow: {
  subtle: string;      // Subtle glow,
  medium: string;      // Medium glow,
  strong: string;      // Strong glow effect,
  accent: string;      // Accent-colored glow,
};
}
export interface ProfessionalSpacing {
  // Spacing Scale (8px base grid)
  px: string;           // 1px,
  0.5: string;          // 2px,
  1: string;            // 4px,
  2: string;            // 8px,
  3: string;            // 12px,
  4: string;            // 16px,
  5: string;            // 20px,
  6: string;            // 24px,
  8: string;            // 32px,
  10: string;           // 40px,
  12: string;           // 48px,
  16: string;           // 64px,
  20: string;           // 80px,
  24: string;           // 96px,
  32: string;           // 128px,
}
export interface ProfessionalBorderRadius {
  none: string;         // 0px,
  sm: string;           // 3px,
  md: string;           // 6px,
  lg: string;           // 8px,
  xl: string;           // 12px,
  '2xl': string;        // 16px,
  full: string;         // 50%,
  // Professional Color Palette Implementation
}
export const professionalColors: ProfessionalColorPalette = {,
  background: {
  primary: '#1e1e1e',     // Cinema 4D-inspired dark gray,
  secondary: '#2a2a2a',   // Panel backgrounds,
  tertiary: '#353535',    // Elevated surfaces,
  elevated: '#404040',    // Modal backgrounds,
  inverse: '#f5f5f5'     // Light surfaces,
},
  text: {
  primary: '#e8e8e8',     // Primary text - high contrast,
  secondary: '#b8b8b8',   // Secondary text,
  tertiary: '#888888',    // Disabled text,
  inverse: '#1e1e1e',     // Text on light backgrounds,
  accent: '#ff7c00'      // Cinema 4D orange accent,
},
  accent: {
  orange: '#ff7c00',      // Cinema 4D signature orange,
  blue: '#4a9eff',        // Technical blue,
  cyan: '#00d4ff',        // Node highlight cyan,
  purple: '#b45cff',      // Advanced features purple,
  green: '#4ade80',       // Success green,
  red: '#ef4444',         // Error red,
  yellow: '#fbbf24'      // Warning yellow,
},
  nodes: {
  text: '#4f46e5',        // Indigo for text nodes,
  logic: '#059669',       // Emerald for logic,
  output: '#dc2626',      // Red for outputs,
  variable: '#7c3aed',    // Purple for variables,
  advanced: '#6366f1',    // Blue-violet for advanced,
  transform: '#f59e0b'   // Amber for transforms,
},
  ui: {
  border: '#404040',      // Default borders,
  borderHover: '#5a5a5a', // Hover borders,
  borderActive: '#ff7c00', // Active borders (Cinema 4D orange),
  focus: '#4a9eff',       // Focus ring color,
  selection: '#ff7c0040', // Selection highlight with opacity,
  hover: '#2d2d2d'       // Hover background,
};

// Professional Typography System
export const professionalTypography: ProfessionalTypography = {,
  fontFamilies: {
  // Technical-friendly font stack inspired by VFX tools
  primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", system-ui, sans-serif',
  mono: '"SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", "Consolas", monospace',
  heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", system-ui, sans-serif',
},
  fontSizes: {
  xs: '11px',
  sm: '13px',
  base: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
},
  fontWeights: {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
},
  lineHeights: {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
},
  letterSpacing: {
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
};

// Professional Shadow System
export const professionalShadows: ProfessionalShadows = {,
  elevation: {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
},
  node: {
  default: '0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2)',
  hover: '0 8px 25px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.25)',
  selected: '0 0 0 2px #ff7c00, 0 8px 25px rgba(255, 124, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.4)',
  focus: '0 0 0 3px rgba(74, 158, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.35)',
},
  glow: {
  subtle: '0 0 10px rgba(255, 124, 0, 0.1)',
  medium: '0 0 20px rgba(255, 124, 0, 0.2)',
  strong: '0 0 30px rgba(255, 124, 0, 0.3)',
  accent: '0 0 15px rgba(74, 158, 255, 0.25)',
};

// Professional Spacing System (8px grid)
export const professionalSpacing: ProfessionalSpacing = {,
  px: '1px',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

// Professional Border Radius
export const professionalBorderRadius: ProfessionalBorderRadius = {,
  none: '0px',
  sm: '3px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '50%',
};

// Complete Professional Design System

export interface ProfessionalDesignSystem {
  colors: ProfessionalColorPalette;
  typography: ProfessionalTypography;
  shadows: ProfessionalShadows;
  spacing: ProfessionalSpacing;
  borderRadius: ProfessionalBorderRadius;
}
export const professionalDesignSystem: ProfessionalDesignSystem = {,
  colors: professionalColors,
  typography: professionalTypography,
  shadows: professionalShadows,
  spacing: professionalSpacing,
  borderRadius: professionalBorderRadius,
};

// CSS Custom Properties Generator
export const generateCSSCustomProperties = ()
  colors = professionalColors,
  shadows = professionalShadows,
  spacing = professionalSpacing,
  borderRadius = professionalBorderRadius
) => {
  return {
  // Background Colors
  '--bg-primary': colors.background.primary,
  '--bg-secondary': colors.background.secondary,
  '--bg-tertiary': colors.background.tertiary,
  '--bg-elevated': colors.background.elevated,
  '--bg-hover': colors.ui.hover,
  // Text Colors
  '--text-primary': colors.text.primary,
  '--text-secondary': colors.text.secondary,
  '--text-tertiary': colors.text.tertiary,
  '--text-accent': colors.text.accent,
  // Accent Colors
  '--accent-orange': colors.accent.orange,
  '--accent-blue': colors.accent.blue,
  '--accent-cyan': colors.accent.cyan,
  '--accent-purple': colors.accent.purple,
  '--accent-green': colors.accent.green,
  '--accent-red': colors.accent.red,
  // UI Colors
  '--border': colors.ui.border,
  '--border-hover': colors.ui.borderHover,
  '--border-active': colors.ui.borderActive,
  '--focus': colors.ui.focus,
  '--selection': colors.ui.selection,
  // Shadows
  '--shadow-sm': shadows.elevation.sm,
  '--shadow-md': shadows.elevation.md,
  '--shadow-lg': shadows.elevation.lg,
  '--shadow-xl': shadows.elevation.xl,
  '--shadow-node': shadows.node.default,
  '--shadow-node-hover': shadows.node.hover,
  '--shadow-node-selected': shadows.node.selected,
  // Spacing
  '--space-1': spacing[1],
  '--space-2': spacing[2],
  '--space-3': spacing[3],
  '--space-4': spacing[4],
  '--space-6': spacing[6],
  '--space-8': spacing[8],
  // Border Radius
  '--radius-sm': borderRadius.sm,
  '--radius-md': borderRadius.md,
  '--radius-lg': borderRadius.lg,
};
};