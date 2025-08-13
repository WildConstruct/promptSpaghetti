/**
 * Platform-specific adaptations exports
 */
// iOS adaptations
export { getIOSSafeAreaInsets, IOSSafeAreaContext, IOSSafeAreaProvider, IOSNavigationBar, IOSTabBar, IOSSwitch, IOSActionSheet, iOSHaptics, iOSStyles, } from './ios/IOSAdaptations';
// Android adaptations
export { materialElevation, materialMotion, MaterialAppBar, MaterialBottomNav, MaterialFAB, MaterialSwitch, MaterialRipple, MaterialSnackbar, materialStyles, } from './android/AndroidAdaptations';
// Desktop adaptations
export { useHoverState, KeyboardShortcutsManager, useKeyboardShortcuts, DesktopTooltip, DesktopContextMenu, DesktopWindowControls, desktopShortcuts, desktopHoverStyles, } from './desktop/DesktopAdaptations';
// Platform gestures
export { platformGestureConfigs, getPlatformGestureConfig, PlatformGestureHandler, PlatformScrollView, PlatformButton, platformGestureStyles, } from './PlatformGestures';
// Adaptive navigation
export { AdaptiveNavigation, AdaptiveBreadcrumb, } from './AdaptiveNavigation';
// Platform optimizations
export { platformPerformanceConfig, getPlatformPerformanceConfig, OptimizedImage, OptimizedScroll, OptimizedAnimation, usePlatformOptimization, platformOptimizationStyles, } from './PlatformOptimizations';
/**
 * Platform detection utilities
 */
export { deviceDetector } from '../responsive/device-detection';
/**
 * Initialize platform-specific features
 */
export function initializePlatformAdaptations(options) {
    const { enableHaptics = true, enableOptimizations = true, customStyles = true } = options || {};
    if (typeof window === 'undefined')
        return;
    // Add platform-specific styles
    if (customStyles) {
        const styleId = 'platform-adaptation-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            // Import all platform styles
            const { iOSStyles } = require('./ios/IOSAdaptations');
            const { materialStyles } = require('./android/AndroidAdaptations');
            const { desktopHoverStyles } = require('./desktop/DesktopAdaptations');
            const { platformGestureStyles } = require('./PlatformGestures');
            const { platformOptimizationStyles } = require('./PlatformOptimizations');
            style.textContent = `
        ${iOSStyles}
        ${materialStyles}
        ${desktopHoverStyles}
        ${platformGestureStyles}
        ${platformOptimizationStyles}
      `;
            document.head.appendChild(style);
        }
    }
    // Add platform class to body
    const { deviceDetector } = require('../responsive/device-detection');
    const platform = deviceDetector.getPlatform();
    const os = deviceDetector.getOS();
    document.body.classList.add(`platform-${platform}`);
    document.body.classList.add(`os-${os.toLowerCase().replace(/\s+/g, '-')}`);
    // Set CSS variables for safe areas (iOS)
    if (os === 'iOS') {
        const updateViewport = () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) {
                const meta = document.createElement('meta');
                meta.name = 'viewport';
                meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
                document.head.appendChild(meta);
            }
        };
        updateViewport();
    }
    // Enable platform-specific optimizations
    if (enableOptimizations) {
        // Disable hover effects on touch devices
        if (platform === 'mobile') {
            document.body.classList.add('touch-device');
        }
        // Enable hardware acceleration for animations
        if (platform === 'desktop' || os === 'iOS') {
            document.body.classList.add('hardware-acceleration');
        }
    }
}
/**
 * React hook for platform features
 */
export function usePlatformFeatures() {
    const { deviceDetector } = require('../responsive/device-detection');
    const platform = deviceDetector.getPlatform();
    const os = deviceDetector.getOS();
    const browser = deviceDetector.getBrowser();
    return {
        platform,
        os,
        browser,
        isMobile: platform === 'mobile',
        isTablet: platform === 'tablet',
        isDesktop: platform === 'desktop',
        isIOS: os === 'iOS',
        isAndroid: os === 'Android',
        isMacOS: os === 'macOS',
        isWindows: os === 'Windows',
        supportsTouch: 'ontouchstart' in window,
        supportsHaptics: 'vibrate' in navigator,
        supportsHover: window.matchMedia('(hover: hover)').matches,
    };
}
//# sourceMappingURL=index.js.map