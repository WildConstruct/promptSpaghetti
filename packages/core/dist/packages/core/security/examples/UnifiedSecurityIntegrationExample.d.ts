/**
 * Unified Security Integration Example
 * Task: E31-1753313263540-48653C - Integrate rate limiting with Epic 17 adaptive throttling
 *
 * This example demonstrates how to use the unified security protection system
 * that combines rate limiting, adaptive throttling, and security analytics.
 */
import { UnifiedSecurityProtectionFactory, SecurityProfile, IntegrationMode, CoordinationStrategy, FallbackBehavior } from '../UnifiedSecurityProtectionFactory';
import { AdaptiveRateLimitingIntegration } from '../AdaptiveRateLimitingIntegration';
export declare function createQuickSecuritySetup(): {
    rateLimitingService: import("../RateLimitingService").RateLimitingService;
    throttlingEngine: import("..").AdaptiveThrottlingRules;
    integration: AdaptiveRateLimitingIntegration;
    analytics?: {
        usagePatterns?: import("../ApiUsagePatternQuotaRecommendations").ApiUsagePatternQuotaRecommendations;
        scalingAnalytics?: import("../ApiScalingAnalyticsIntegration").ApiScalingAnalyticsIntegration;
    };
};
export declare function createCustomSecuritySetup(): {
    rateLimitingService: import("../RateLimitingService").RateLimitingService;
    throttlingEngine: import("..").AdaptiveThrottlingRules;
    integration: AdaptiveRateLimitingIntegration;
    analytics?: {
        usagePatterns?: import("../ApiUsagePatternQuotaRecommendations").ApiUsagePatternQuotaRecommendations;
        scalingAnalytics?: import("../ApiScalingAnalyticsIntegration").ApiScalingAnalyticsIntegration;
    };
};
export declare function handleSecurityRequest(integration: AdaptiveRateLimitingIntegration, requestData: {
    ip: string;
    endpoint: string;
    method: string;
    userId?: string;
    userAgent: string;
}): Promise<import("../AdaptiveRateLimitingIntegration").UnifiedProtectionResult>;
export declare function monitorSecurityHealth(integration: AdaptiveRateLimitingIntegration): {
    config: import("../AdaptiveRateLimitingIntegration").IntegrationConfig;
    performance: any;
    learning: import("../AdaptiveRateLimitingIntegration").CrossSystemLearning;
    systemHealth: {
        rateLimitingHealth: number;
        throttlingHealth: number;
        integrationHealth: number;
        overallHealth: number;
    };
};
export declare function demonstrateSecurityProfiles(): void;
export declare function demonstratePresetConfigurations(): void;
export declare function setupEventHandling(integration: AdaptiveRateLimitingIntegration): void;
export declare function completeIntegrationExample(): Promise<void>;
export { UnifiedSecurityProtectionFactory, SecurityProfile, IntegrationMode, CoordinationStrategy, FallbackBehavior };
//# sourceMappingURL=UnifiedSecurityIntegrationExample.d.ts.map