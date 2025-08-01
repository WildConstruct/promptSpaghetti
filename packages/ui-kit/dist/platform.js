/**
 * Platform detection and adaptation utilities
 */
// Default theme colors
const defaultColors = {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    border: '#E5E5E7',
    error: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759',
    info: '#007AFF',
};
const darkColors = {
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
    info: '#64D2FF',
};
const defaultSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};
const defaultTypography = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
    },
    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};
export const detectPlatform = () => {
    if (typeof window === 'undefined')
        return 'desktop';
    const userAgent = window.navigator.userAgent;
    // Check for mobile devices
    if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return 'mobile';
    }
    // Check for Electron (desktop app)
    if (typeof window.process !== 'undefined' && window.process.type) {
        return 'desktop';
    }
    return 'web';
};
export const getPlatformCapabilities = () => {
    const platform = detectPlatform();
    if (typeof window === 'undefined') {
        return {
            touchSupport: false,
            hoverSupport: true,
            keyboardSupport: true,
            maxViewportWidth: 1920,
            maxViewportHeight: 1080,
            pixelRatio: 1,
        };
    }
    return {
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hoverSupport: platform !== 'mobile' && window.matchMedia('(hover: hover)').matches,
        keyboardSupport: true,
        maxViewportWidth: window.screen.width || window.innerWidth || 1920,
        maxViewportHeight: window.screen.height || window.innerHeight || 1080,
        pixelRatio: window.devicePixelRatio || 1,
    };
};
export const getBreakpoint = (width) => {
    if (width < 768)
        return 'mobile';
    if (width < 1024)
        return 'tablet';
    return 'desktop';
};
export const createTheme = (overrides) => {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const colors = prefersDark ? darkColors : defaultColors;
    return {
        colors: { ...colors, ...(overrides?.colors || {}) },
        spacing: { ...defaultSpacing, ...(overrides?.spacing || {}) },
        typography: { ...defaultTypography, ...(overrides?.typography || {}) },
        borderRadius: overrides?.borderRadius ?? 8,
        shadows: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            ...(overrides?.shadows || {}),
        },
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200,
            ...(overrides?.breakpoints || {}),
        },
    };
};
export const isReducedMotion = () => {
    if (typeof window === 'undefined')
        return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
export const isTouchDevice = () => {
    if (typeof window === 'undefined')
        return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
export const isApplePlatform = () => {
    if (typeof window === 'undefined')
        return false;
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
};
export const getViewportSize = () => {
    if (typeof window === 'undefined') {
        return { width: 1920, height: 1080 };
    }
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
};
// Platform-specific optimizations
export const getPlatformOptimizations = (platform) => {
    switch (platform) {
        case 'mobile':
            return {
                enableTouchOptimizations: true,
                reducedAnimations: isReducedMotion(),
                useLargerTouchTargets: true,
                enableVirtualization: true,
                prefersSystemTheme: true,
            };
        case 'desktop':
            return {
                enableTouchOptimizations: false,
                reducedAnimations: false,
                useLargerTouchTargets: false,
                enableVirtualization: false,
                prefersSystemTheme: false,
                enableKeyboardShortcuts: true,
            };
        case 'web':
        default:
            return {
                enableTouchOptimizations: isTouchDevice(),
                reducedAnimations: isReducedMotion(),
                useLargerTouchTargets: isTouchDevice(),
                enableVirtualization: true,
                prefersSystemTheme: true,
                enableKeyboardShortcuts: !isTouchDevice(),
            };
    }
};
// Legacy function for backward compatibility
export function getPlatformConfig(platform) {
    const capabilities = getPlatformCapabilities();
    const configs = {
        web: {
            touchEnabled: capabilities.touchSupport,
            screenSize: 'large',
            inputMethod: capabilities.touchSupport ? 'touch' : 'mouse',
        },
        mobile: {
            touchEnabled: true,
            screenSize: 'small',
            inputMethod: 'touch',
        },
        desktop: {
            touchEnabled: false,
            screenSize: 'large',
            inputMethod: 'mouse',
        },
    };
    return configs[platform];
}
//# sourceMappingURL=platform.js.map