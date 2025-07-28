import { IntegrationMode, CoordinationStrategy, FallbackBehavior } from './AdaptiveRateLimitingIntegration';
export interface UnifiedSecurityConfig {
    rateLimiting: {
        enabled: boolean;
        strictMode: boolean;
        customEndpoints?: Record<string, any>;
    };
    throttling: {
        enabled: boolean;
        analyticsEnabled: boolean;
        defaultRules: boolean;
    };
    integration: {
        mode: IntegrationMode;
        strategy: CoordinationStrategy;
        fallback: FallbackBehavior;
        priorities: {
            rateLimiting: number;
            throttling: number;
        };
    };
    analytics: {
        enableUsagePatterns: boolean;
        enableScalingAnalytics: boolean;
        enableCrossSystemLearning: boolean;
        enableAnalyticsInsights: boolean;
    };
    monitoring: {
        enableMetrics: boolean;
        enableHealthChecks: boolean;
        alertThresholds: {
            errorRate: number;
            responseTime: number;
            systemHealth: number;
        };
    };
}
export declare enum SecurityProfile {
    DEVELOPMENT = "development",// Relaxed settings for development
    STAGING = "staging",// Balanced settings for testing
    PRODUCTION = "production",// Strict settings for production
    HIGH_SECURITY = "high_security",// Maximum security for sensitive applications
    HIGH_VOLUME = "high_volume",// Optimized for high-traffic applications
    export,
    class,
    UnifiedSecurityProtectionFactory
}
//# sourceMappingURL=UnifiedSecurityProtectionFactory.d.ts.map