/**
 * Enhanced device detection and targeting
 */
/**
 * Detect device type from user agent and screen size
 */
export function detectDeviceType() {
    if (typeof window === 'undefined')
        return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    const width = window.screen.width;
    // TV detection
    if (ua.includes('smart-tv') || ua.includes('smarttv') ||
        ua.includes('googletv') || ua.includes('appletv')) {
        return 'tv';
    }
    // Mobile detection
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
        return 'mobile';
    }
    // Tablet detection
    if (/ipad|tablet|playbook|silk/i.test(ua) ||
        (width >= 768 && width <= 1024 && 'ontouchstart' in window)) {
        return 'tablet';
    }
    return 'desktop';
}
/**
 * Detect operating system
 */
export function detectOS() {
    if (typeof window === 'undefined')
        return 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || platform.includes('mac')) {
        return 'ios';
    }
    if (ua.includes('android'))
        return 'android';
    if (ua.includes('windows') || platform.includes('win'))
        return 'windows';
    if (platform.includes('mac'))
        return 'macos';
    if (platform.includes('linux'))
        return 'linux';
    return 'unknown';
}
/**
 * Detect browser
 */
export function detectBrowser() {
    if (typeof window === 'undefined')
        return 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edge'))
        return 'chrome';
    if (ua.includes('firefox'))
        return 'firefox';
    if (ua.includes('safari') && !ua.includes('chrome'))
        return 'safari';
    if (ua.includes('edge'))
        return 'edge';
    if (ua.includes('opera') || ua.includes('opr'))
        return 'opera';
    return 'unknown';
}
/**
 * Detect device orientation
 */
export function detectOrientation() {
    if (typeof window === 'undefined')
        return 'portrait';
    if ('orientation' in window) {
        return Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
    }
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}
/**
 * Detect GPU performance tier
 */
export function detectGPU() {
    if (typeof window === 'undefined')
        return 'medium';
    // Simple heuristic based on device pixel ratio and screen size
    const dpr = window.devicePixelRatio || 1;
    const screenPixels = window.screen.width * window.screen.height;
    if (dpr >= 3 && screenPixels > 2000000)
        return 'high';
    if (dpr < 2 || screenPixels < 1000000)
        return 'low';
    return 'medium';
}
/**
 * Detect connection speed
 */
export function detectConnection() {
    if (typeof window === 'undefined')
        return 'fast';
    if (!navigator.onLine)
        return 'offline';
    // Use Network Information API if available
    const connection = navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
    if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g')
            return 'slow';
        if (effectiveType === '3g')
            return 'slow';
    }
    return 'fast';
}
/**
 * Get comprehensive device information
 */
export function getDeviceInfo() {
    return {
        type: detectDeviceType(),
        os: detectOS(),
        browser: detectBrowser(),
        orientation: detectOrientation(),
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        retina: window.devicePixelRatio > 1,
        dpr: window.devicePixelRatio || 1,
        gpu: detectGPU(),
        connection: detectConnection()
    };
}
/**
 * Device capability checks
 */
export const deviceCapabilities = {
    hasTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasHover: () => window.matchMedia('(hover: hover)').matches,
    hasPointer: () => window.matchMedia('(pointer: fine)').matches,
    hasKeyboard: () => !deviceCapabilities.hasTouch() || detectDeviceType() === 'desktop',
    hasNotch: () => {
        // iOS notch detection
        const hasNotch = window.CSS &&
            CSS.supports('padding-top: env(safe-area-inset-top)') &&
            parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0') > 0;
        return hasNotch;
    },
    supportsVibration: () => 'vibrate' in navigator,
    supportsClipboard: () => 'clipboard' in navigator,
    supportsShare: () => 'share' in navigator,
    supportsNotifications: () => 'Notification' in window,
    supportsFullscreen: () => 'requestFullscreen' in document.documentElement ||
        'webkitRequestFullscreen' in document.documentElement ||
        'mozRequestFullScreen' in document.documentElement ||
        'msRequestFullscreen' in document.documentElement
};
/**
 * Performance-based feature detection
 */
export function getPerformanceFeatures() {
    const info = getDeviceInfo();
    const isLowEnd = info.gpu === 'low' || info.connection === 'slow';
    return {
        enableAnimations: !isLowEnd && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        enableParallax: !isLowEnd && info.type === 'desktop',
        enableBlur: !isLowEnd,
        enableShadows: !isLowEnd,
        enableTransitions: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        maxConcurrentAnimations: isLowEnd ? 2 : 10,
        debounceDelay: isLowEnd ? 500 : 250,
        throttleDelay: isLowEnd ? 100 : 50
    };
}
/**
 * Platform-specific adjustments
 */
export function getPlatformAdjustments() {
    const info = getDeviceInfo();
    return {
        // Touch target sizes
        minTouchTarget: info.touch ? 44 : 24,
        // Scroll behavior
        scrollBehavior: info.os === 'ios' ? '-webkit-overflow-scrolling: touch' : 'auto',
        // Safe areas for notched devices
        safeAreaInsets: deviceCapabilities.hasNotch() ? {
            top: 'env(safe-area-inset-top)',
            right: 'env(safe-area-inset-right)',
            bottom: 'env(safe-area-inset-bottom)',
            left: 'env(safe-area-inset-left)'
        } : null,
        // Font adjustments
        fontSmoothing: info.os === 'macos' || info.os === 'ios' ? {
            '-webkit-font-smoothing': 'antialiased',
            '-moz-osx-font-smoothing': 'grayscale'
        } : {},
        // Input adjustments
        inputMode: info.type === 'mobile' ? {
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'off',
            spellCheck: false
        } : {}
    };
}
//# sourceMappingURL=device.js.map