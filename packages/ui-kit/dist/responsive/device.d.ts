/**
 * Enhanced device detection and targeting
 */
export interface DeviceInfo {
    type: 'mobile' | 'tablet' | 'desktop' | 'tv';
    os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
    browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';
    orientation: 'portrait' | 'landscape';
    touch: boolean;
    retina: boolean;
    dpr: number;
    gpu: 'high' | 'medium' | 'low';
    connection: 'fast' | 'slow' | 'offline';
}
/**
 * Detect device type from user agent and screen size
 */
export declare function detectDeviceType(): DeviceInfo['type'];
/**
 * Detect operating system
 */
export declare function detectOS(): DeviceInfo['os'];
/**
 * Detect browser
 */
export declare function detectBrowser(): DeviceInfo['browser'];
/**
 * Detect device orientation
 */
export declare function detectOrientation(): DeviceInfo['orientation'];
/**
 * Detect GPU performance tier
 */
export declare function detectGPU(): DeviceInfo['gpu'];
/**
 * Detect connection speed
 */
export declare function detectConnection(): DeviceInfo['connection'];
/**
 * Get comprehensive device information
 */
export declare function getDeviceInfo(): DeviceInfo;
/**
 * Device capability checks
 */
export declare     hasHover: () => boolean;
    hasPointer: () => boolean;
    hasKeyboard: () => boolean;
    hasNotch: () => any;
    supportsVibration: () => boolean;
    supportsClipboard: () => boolean;
    supportsShare: () => boolean;
    supportsNotifications: () => boolean;
    supportsFullscreen: () => boolean;
};
/**
 * Performance-based feature detection
 */
export declare function getPerformanceFeatures(): {
    enableAnimations: boolean;
    enableParallax: boolean;
    enableBlur: boolean;
    enableShadows: boolean;
    enableTransitions: boolean;
    maxConcurrentAnimations: number;
    debounceDelay: number;
    throttleDelay: number;
};
/**
 * Platform-specific adjustments
 */
export declare function getPlatformAdjustments(): {
    minTouchTarget: number;
    scrollBehavior: string;
    safeAreaInsets: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    } | null;
    fontSmoothing: {
        '-webkit-font-smoothing': string;
        '-moz-osx-font-smoothing': string;
    } | {
        '-webkit-font-smoothing'?: undefined;
        '-moz-osx-font-smoothing'?: undefined;
    };
    inputMode: {
        autoComplete: string;
        autoCorrect: string;
        autoCapitalize: string;
        spellCheck: boolean;
    } | {
        autoComplete?: undefined;
        autoCorrect?: undefined;
        autoCapitalize?: undefined;
        spellCheck?: undefined;
    };
};
//# sourceMappingURL=device.d.ts.map