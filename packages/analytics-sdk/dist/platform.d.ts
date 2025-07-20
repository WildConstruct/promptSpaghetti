/**
 * Platform-specific analytics adapters
 */
import { Platform } from './types';
import { AnalyticsClient } from './client';
export declare function createPlatformAnalytics(platform: Platform): AnalyticsClient;
export declare function getPlatformMetadata(platform: Platform): {
    userAgent: string;
    viewport: {
        width: number;
        height: number;
    } | null;
} | {
    device: string;
    os: string;
} | {
    platform: string;
    arch: string;
};
//# sourceMappingURL=platform.d.ts.map