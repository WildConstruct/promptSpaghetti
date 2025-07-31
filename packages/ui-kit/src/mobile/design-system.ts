/**
 * Mobile Design System
 * Touch-friendly specifications and guidelines
 */

import { Theme, ThemeColors, ThemeSpacing, ThemeTypography } from '../types';

// Touch target sizes (following Apple and Material Design guidelines)
export const TOUCH_TARGETS = {
  minimum: 44, // Minimum touch target size (44x44px)
  preferred: 48, // Preferred touch target size
  large: 56, // Large touch targets for primary actions
  xl: 64, // Extra large for critical actions
} as const;

// Mobile-specific spacing scale
export const MOBILE_SPACING: ThemeSpacing = {
  xs: 4, // Tighter spacing for mobile
  sm: 8,
  md: 12, // Reduced from desktop 16
  lg: 20, // Reduced from desktop 24
  xl: 28, // Reduced from desktop 32
};

// Mobile typography scale
export const MOBILE_TYPOGRAPHY: Partial<ThemeTypography> = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16, // Base font size
    lg: 20,
    xl: 24,
    xxl: 28, // Reduced from desktop sizes
  },
  lineHeight: {
    tight: 1.3, // Slightly more relaxed for readability
    normal: 1.6,
    relaxed: 1.8,
  },
};

// Mobile-optimized colors with higher contrast
export const MOBILE_COLORS: Partial<ThemeColors> = {
  // Higher contrast for outdoor visibility
  text: '#000000',
  textSecondary: '#4A4A4A',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#D0D0D0',

  // Brighter accent colors for better visibility
  primary: '#0066FF',
  secondary: '#6B47DC',
  accent: '#FF6B00',
  error: '#DC2626',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',
};

// Mobile dark theme colors
export const MOBILE_DARK_COLORS: Partial<ThemeColors> = {
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  background: '#000000',
  surface: '#1A1A1A',
  border: '#333333',

  primary: '#4D94FF',
  secondary: '#8B67FC',
  accent: '#FF8533',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#34D399',
  info: '#60A5FA',
};

// Mobile viewport constraints
export const MOBILE_VIEWPORT = {
  maxWidth: 428, // iPhone 14 Pro Max width
  maxHeight: 926, // iPhone 14 Pro Max height
  safeAreaInsets: {
    top: 47, // Notch area
    bottom: 34, // Home indicator
    left: 0,
    right: 0,
  },
};

// Mobile-specific component configurations
export const MOBILE_COMPONENTS = {
  button: {
    minHeight: TOUCH_TARGETS.preferred,
    paddingHorizontal: MOBILE_SPACING.lg,
    borderRadius: 8,
    fontSize: MOBILE_TYPOGRAPHY.fontSize!.md,
  },
  input: {
    minHeight: TOUCH_TARGETS.preferred,
    paddingHorizontal: MOBILE_SPACING.md,
    borderRadius: 8,
    fontSize: MOBILE_TYPOGRAPHY.fontSize!.md,
  },
  card: {
    padding: MOBILE_SPACING.md,
    borderRadius: 12,
    gap: MOBILE_SPACING.sm,
  },
  modal: {
    maxWidth: '90vw',
    maxHeight: '80vh',
    borderRadius: 16,
    padding: MOBILE_SPACING.lg,
  },
  listItem: {
    minHeight: TOUCH_TARGETS.large,
    paddingHorizontal: MOBILE_SPACING.md,
    paddingVertical: MOBILE_SPACING.sm,
  },
};

// Gesture zones for edge swipes
export const GESTURE_ZONES = {
  edge: 20, // Edge swipe detection zone
  threshold: 50, // Minimum distance for gesture recognition
  velocity: 0.3, // Minimum velocity for quick swipes
};

// Mobile animation timings (reduced for performance)
export const MOBILE_ANIMATIONS = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  // Reduced motion for accessibility
  reducedMotion: {
    instant: 0,
    fast: 0,
    normal: 0,
    slow: 0,
  },
};

// Mobile breakpoints for different device sizes
export const MOBILE_BREAKPOINTS = {
  small: 360, // Small phones
  medium: 390, // Standard phones
  large: 428, // Large phones
  tablet: 768, // Small tablets
};

/**
 * Create mobile-optimized theme
 */
export function createMobileTheme(baseTheme: Theme, isDark = false): Theme {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...(isDark ? MOBILE_DARK_COLORS : MOBILE_COLORS),
    },
    spacing: MOBILE_SPACING,
    typography: {
      ...baseTheme.typography,
      ...MOBILE_TYPOGRAPHY,
    },
    borderRadius: 8,
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
      md: '0 2px 8px rgba(0, 0, 0, 0.12)',
      lg: '0 4px 16px rgba(0, 0, 0, 0.16)',
    },
    breakpoints: {
      ...baseTheme.breakpoints,
      mobile: MOBILE_BREAKPOINTS.medium,
    },
  };
}

/**
 * Get safe area padding for notched devices
 */
export function getSafeAreaPadding(area: 'top' | 'bottom' | 'left' | 'right' = 'top'): string {
  const envVar = `safe-area-inset-${area}`;
  return `max(${MOBILE_SPACING.md}px, env(${envVar}))`;
}

/**
 * Check if touch target meets minimum size
 */
export function isTouchTargetAccessible(width: number, height: number): boolean {
  return width >= TOUCH_TARGETS.minimum && height >= TOUCH_TARGETS.minimum;
}

/**
 * Get responsive font size for mobile
 */
export function getMobileFontSize(baseSize: number, scaleFactor = 1, minSize = 12, maxSize = 32): number {
  const scaled = baseSize * scaleFactor;
  return Math.max(minSize, Math.min(maxSize, scaled));
}

/**
 * Mobile-specific utility classes
 */
export const mobileStyles = {
  // Safe area padding
  safeTop: {
    paddingTop: getSafeAreaPadding('top'),
  },
  safeBottom: {
    paddingBottom: getSafeAreaPadding('bottom'),
  },
  safeHorizontal: {
    paddingLeft: getSafeAreaPadding('left'),
    paddingRight: getSafeAreaPadding('right'),
  },

  // Touch-friendly tap highlight
  tapHighlight: {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)',
    touchAction: 'manipulation',
  },

  // Prevent text selection on interactive elements
  noSelect: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  },

  // Smooth scrolling
  smoothScroll: {
    WebkitOverflowScrolling: 'touch',
    overflowY: 'auto',
    scrollBehavior: 'smooth',
  },

  // Full viewport height accounting for mobile browsers
  fullHeight: {
    height: '100vh',
    height: '100dvh', // Dynamic viewport height
  },
};
