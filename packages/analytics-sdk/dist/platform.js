/**
 * Platform-specific analytics adapters
 */
import { AnalyticsClient } from './client';
export function createPlatformAnalytics(platform) {
    const config = {
        apiKey: process.env.ANALYTICS_API_KEY || 'dev-key',
        endpoint: process.env.ANALYTICS_ENDPOINT || 'http://localhost:8080/analytics',
        platform,
        batchSize: platform === 'mobile' ? 5 : 10,
        flushInterval: platform === 'mobile' ? 30000 : 10000
    };
    return new AnalyticsClient(config);
}
export function getPlatformMetadata(platform) {
    const metadata = {
        web: {
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            viewport: typeof window !== 'undefined' ? {
                width: window.innerWidth,
                height: window.innerHeight
            } : null
        },
        mobile: {
            // TODO: Get mobile-specific metadata
            device: 'unknown',
            os: 'unknown'
        },
        desktop: {
            // TODO: Get desktop-specific metadata
            platform: 'unknown',
            arch: 'unknown'
        }
    };
    return metadata[platform];
}
//# sourceMappingURL=platform.js.map