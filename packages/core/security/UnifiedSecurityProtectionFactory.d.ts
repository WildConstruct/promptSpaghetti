/**
 * Unified Security Protection Factory
 * Task: E31-1753313263540-48653C - Integrate rate limiting with Epic 17 adaptive throttling
 * Epic 17: Advanced Rate Limiting & Threat Protection
 * Epic 31: Security Intelligence Platform
 *
 * Factory class for creating and configuring unified security protection systems
 * that combine rate limiting, adaptive throttling, and security analytics.
 */
import { RateLimitingService } from './RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from './AdaptiveThrottlingRules';
import { ApiUsagePatternQuotaRecommendations } from './ApiUsagePatternQuotaRecommendations';
import { ApiScalingAnalyticsIntegration } from './ApiScalingAnalyticsIntegration';
import { 
  AdaptiveRateLimitingIntegration,
  IntegrationMode,
  CoordinationStrategy,
  FallbackBehavior
} from './AdaptiveRateLimitingIntegration';
export interface UnifiedSecurityConfig {
    rateLimiting: {,
        enabled: boolean;
        strictMode: boolean;
        customEndpoints?: Record<string, any>;
    };
    throttling: {,
        enabled: boolean;
        analyticsEnabled: boolean;
        defaultRules: boolean;
    };
    integration: {,
        mode: IntegrationMode;
        strategy: CoordinationStrategy;
        fallback: FallbackBehavior;
        priorities: {,
            rateLimiting: number;
            throttling: number;
        };
    };
    analytics: {,
        enableUsagePatterns: boolean;
        enableScalingAnalytics: boolean;
        enableCrossSystemLearning: boolean;
        enableAnalyticsInsights: boolean;
    };
    monitoring: {,
        enableMetrics: boolean;
        enableHealthChecks: boolean;
        alertThresholds: {,
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
    HIGH_VOLUME = "high_volume"
}
export declare class UnifiedSecurityProtectionFactory {
    /**
     * Create a complete unified security protection system
     */
    static createUnifiedProtection(profile?: SecurityProfile, customConfig?: Partial<UnifiedSecurityConfig>): {
        rateLimitingService: RateLimitingService;
        throttlingEngine: AdaptiveThrottlingRulesEngine;
        integration: AdaptiveRateLimitingIntegration;
        analytics?: {
            usagePatterns?: ApiUsagePatternQuotaRecommendations;
            scalingAnalytics?: ApiScalingAnalyticsIntegration;
        };
    };
    /**
     * Create a lightweight rate limiting only system
     */
    static createRateLimitingOnly(): RateLimitingService;
    /**
     * Create an adaptive throttling only system
     */
    static createThrottlingOnly(enableAnalytics?: boolean): AdaptiveThrottlingRulesEngine;
    /**
     * Create usage pattern analytics service
     */
    private static createUsagePatternAnalytics;
    /**
     * Create scaling analytics service
     */
    private static createScalingAnalytics;
    /**
     * Generate configuration based on security profile
     */
    private static generateConfiguration;
    /**
     * Get base configuration for security profile
     */
    private static getBaseConfiguration;
    /**
     * Get usage pattern analytics configuration
     */
    private static getUsagePatternConfig;
    /**
     * Get scaling analytics configuration
     */
    private static getScalingAnalyticsConfig;
    /**
     * Merge configurations with deep merge
     */
    private static mergeConfigurations;
    /**
     * Create preset configurations for common use cases
     */
    static createPresetConfigurations(): Record<string, UnifiedSecurityConfig>;
    /**
     * Validate configuration
     */
    static validateConfiguration(config: UnifiedSecurityConfig): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
}
export default UnifiedSecurityProtectionFactory;
//# sourceMappingURL=UnifiedSecurityProtectionFactory.d.ts.map