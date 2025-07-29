/**
 * Epic 8.1 - Professional Visual Design System
 * Inspired by Cinema 4D and Substance Designer interface patterns
 *
 * This design system provides professional-grade colors, typography,
 * shadows, and layout tokens for VFX industry standards.
 */

export interface ProfessionalColorPalette {
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
        elevated: string;
        inverse: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        accent: string;
    };
    accent: {
        orange: string;
        blue: string;
        cyan: string;
        purple: string;
        green: string;
        red: string;
        yellow: string;
    };
    nodes: {
        text: string;
        logic: string;
        output: string;
        variable: string;
        advanced: string;
        transform: string;
    };
    ui: {
        border: string;
        borderHover: string;
        borderActive: string;
        focus: string;
        selection: string;
        hover: string;
    };

export interface ProfessionalTypography {
    fontFamilies: {
        primary: string;
        mono: string;
        heading: string;
    };
    fontSizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
    };
    fontWeights: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    lineHeights: {
        tight: number;
        normal: number;
        relaxed: number;
    };
    letterSpacing: {
        tight: string;
        normal: string;
        wide: string;
    };

export interface ProfessionalShadows {
    elevation: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
    node: {
        default: string;
        hover: string;
        selected: string;
        focus: string;
    };
    glow: {
        subtle: string;
        medium: string;
        strong: string;
        accent: string;
    };

export interface ProfessionalSpacing {
    px: string;
    0.5: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
    32: string;

export interface ProfessionalBorderRadius {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;

export declare const professionalColors: ProfessionalColorPalette;
export declare const professionalTypography: ProfessionalTypography;
export declare const professionalShadows: ProfessionalShadows;
export declare const professionalSpacing: ProfessionalSpacing;
export declare const professionalBorderRadius: ProfessionalBorderRadius;

export interface ProfessionalDesignSystem {
    colors: ProfessionalColorPalette;
    typography: ProfessionalTypography;
    shadows: ProfessionalShadows;
    spacing: ProfessionalSpacing;
    borderRadius: ProfessionalBorderRadius;

export declare const professionalDesignSystem: ProfessionalDesignSystem;
export declare const generateCSSCustomProperties: (colors?: ProfessionalColorPalette, shadows?: ProfessionalShadows, spacing?: ProfessionalSpacing, borderRadius?: ProfessionalBorderRadius) => {
    '--bg-primary': string;
    '--bg-secondary': string;
    '--bg-tertiary': string;
    '--bg-elevated': string;
    '--bg-hover': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-tertiary': string;
    '--text-accent': string;
    '--accent-orange': string;
    '--accent-blue': string;
    '--accent-cyan': string;
    '--accent-purple': string;
    '--accent-green': string;
    '--accent-red': string;
    '--border': string;
    '--border-hover': string;
    '--border-active': string;
    '--focus': string;
    '--selection': string;
    '--shadow-sm': string;
    '--shadow-md': string;
    '--shadow-lg': string;
    '--shadow-xl': string;
    '--shadow-node': string;
    '--shadow-node-hover': string;
    '--shadow-node-selected': string;
    '--space-1': string;
    '--space-2': string;
    '--space-3': string;
    '--space-4': string;
    '--space-6': string;
    '--space-8': string;
    '--radius-sm': string;
    '--radius-md': string;
    '--radius-lg': string;
};
//# sourceMappingURL=professional-design-system.d.ts.map