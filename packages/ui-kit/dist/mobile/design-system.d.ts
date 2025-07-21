/**
 * Mobile Design System
 * Touch-friendly specifications and guidelines
 */
import { Theme, ThemeColors, ThemeSpacing, ThemeTypography } from '../types';
export declare const TOUCH_TARGETS: {
    readonly minimum: 44;
    readonly preferred: 48;
    readonly large: 56;
    readonly xl: 64;
};
export declare const MOBILE_SPACING: ThemeSpacing;
export declare const MOBILE_TYPOGRAPHY: Partial<ThemeTypography>;
export declare const MOBILE_COLORS: Partial<ThemeColors>;
export declare const MOBILE_DARK_COLORS: Partial<ThemeColors>;
export declare const MOBILE_VIEWPORT: {
    maxWidth: number;
    maxHeight: number;
    safeAreaInsets: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
};
export declare const MOBILE_COMPONENTS: {
    button: {
        minHeight: 48;
        paddingHorizontal: number;
        borderRadius: number;
        fontSize: number;
    };
    input: {
        minHeight: 48;
        paddingHorizontal: number;
        borderRadius: number;
        fontSize: number;
    };
    card: {
        padding: number;
        borderRadius: number;
        gap: number;
    };
    modal: {
        maxWidth: string;
        maxHeight: string;
        borderRadius: number;
        padding: number;
    };
    listItem: {
        minHeight: 56;
        paddingHorizontal: number;
        paddingVertical: number;
    };
};
export declare const GESTURE_ZONES: {
    edge: number;
    threshold: number;
    velocity: number;
};
export declare const MOBILE_ANIMATIONS: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    reducedMotion: {
        instant: number;
        fast: number;
        normal: number;
        slow: number;
    };
};
export declare const MOBILE_BREAKPOINTS: {
    small: number;
    medium: number;
    large: number;
    tablet: number;
};
/**
 * Create mobile-optimized theme
 */
export declare function createMobileTheme(baseTheme: Theme, isDark?: boolean): Theme;
/**
 * Get safe area padding for notched devices
 */
export declare function getSafeAreaPadding(area?: 'top' | 'bottom' | 'left' | 'right'): string;
/**
 * Check if touch target meets minimum size
 */
export declare function isTouchTargetAccessible(width: number, height: number): boolean;
/**
 * Get responsive font size for mobile
 */
export declare function getMobileFontSize(
  baseSize: number,
  scaleFactor?: number,
  minSize?: number,
  maxSize?: number
): number;
/**
 * Mobile-specific utility classes
 */
export declare const mobileStyles: {
    safeTop: {
        paddingTop: string;
    };
    safeBottom: {
        paddingBottom: string;
    };
    safeHorizontal: {
        paddingLeft: string;
        paddingRight: string;
    };
    tapHighlight: {
        WebkitTapHighlightColor: string;
        touchAction: string;
    };
    noSelect: {
        userSelect: string;
        WebkitUserSelect: string;
        WebkitTouchCallout: string;
    };
    smoothScroll: {
        WebkitOverflowScrolling: string;
        overflowY: string;
        scrollBehavior: string;
    };
    fullHeight: {
        height: string;
    };
};
//# sourceMappingURL=design-system.d.ts.map