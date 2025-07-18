/**
 * Platform detection and adaptation utilities
 */
import { Platform } from './types';
export declare function detectPlatform(): Platform;
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