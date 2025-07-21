/**
 * Platform detection and adaptation utilities
 */
import { Platform, DeviceCapabilities, Theme } from './types';
export declare export declare export declare export declare export declare export declare export declare export declare     height: number;
};
export declare     reducedAnimations: boolean;
    useLargerTouchTargets: boolean;
    enableVirtualization: boolean;
    prefersSystemTheme: boolean;
    enableKeyboardShortcuts?: undefined;
} | {
    enableTouchOptimizations: boolean;
    reducedAnimations: boolean;
    useLargerTouchTargets: boolean;
    enableVirtualization: boolean;
    prefersSystemTheme: boolean;
    enableKeyboardShortcuts: boolean;
};
export declare function getPlatformConfig(platform: Platform): {
    touchEnabled: boolean;
    screenSize: string;
    inputMethod: string;
} | {
    touchEnabled: boolean;
    screenSize: string;
    inputMethod: string;
} | {
    touchEnabled: boolean;
    screenSize: string;
    inputMethod: string;
};
//# sourceMappingURL=platform.d.ts.map