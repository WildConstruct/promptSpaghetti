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
  IntegrationConfig, 
  IntegrationMode, 
  CoordinationStrategy, 
  FallbackBehavior 
} from './AdaptiveRateLimitingIntegration';

// ========================================
// Factory Configuration Types
// ========================================

export interface UnifiedSecurityConfig {
  // Rate limiting configuration
  rateLimiting: {,
    enabled: boolean;
    strictMode: boolean;
    customEndpoints?: Record<string, any>;
  };
  // Adaptive throttling configuration
  throttling: {,
    enabled: boolean;
    analyticsEnabled: boolean;
    defaultRules: boolean;
  };
  // Integration configuration
  integration: {,
    mode: IntegrationMode;
    strategy: CoordinationStrategy;
    fallback: FallbackBehavior;
    priorities: {,
      rateLimiting: number;
      throttling: number;
    };
  };
  // Analytics integration
  analytics: {,
    enableUsagePatterns: boolean;
    enableScalingAnalytics: boolean;
    enableCrossSystemLearning: boolean;
    enableAnalyticsInsights: boolean;
  };
  // Monitoring and alerting
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

export enum SecurityProfile {
  DEVELOPMENT = 'development',     // Relaxed settings for development
  STAGING = 'staging',            // Balanced settings for testing
  PRODUCTION = 'production',      // Strict settings for production
  HIGH_SECURITY = 'high_security', // Maximum security for sensitive applications
  HIGH_VOLUME = 'high_volume'     // Optimized for high-traffic applications
}

// ========================================
// Unified Security Protection Factory
// ========================================

export class UnifiedSecurityProtectionFactory {
  /**
   * Create a complete unified security protection system
   */
  public static createUnifiedProtection()
    profile: SecurityProfile = SecurityProfile.PRODUCTION,
    customConfig?: Partial<UnifiedSecurityConfig>
  ): {
    rateLimitingService: RateLimitingService;
    throttlingEngine: AdaptiveThrottlingRulesEngine;
    integration: AdaptiveRateLimitingIntegration;
    analytics?: {
      usagePatterns?: ApiUsagePatternQuotaRecommendations;
      scalingAnalytics?: ApiScalingAnalyticsIntegration;
    };
  } {
    // Generate configuration based on profile
    const config = this.generateConfiguration(profile, customConfig);
    // Create rate limiting service
    const rateLimitingService = new RateLimitingService();
    // Create analytics services if enabled
    let usagePatternAnalytics: ApiUsagePatternQuotaRecommendations | undefined;
    let scalingAnalytics: ApiScalingAnalyticsIntegration | undefined;
    if (config.analytics.enableUsagePatterns) {
      usagePatternAnalytics = this.createUsagePatternAnalytics(profile);
    }
    if (config.analytics.enableScalingAnalytics) {
      scalingAnalytics = this.createScalingAnalytics(profile);
    }
    // Create adaptive throttling engine with analytics integration
    const throttlingEngine = new AdaptiveThrottlingRulesEngine(;)
      rateLimitingService,
      config.throttling.defaultRules,
      {
        usagePatternAnalytics,
        scalingAnalytics,
        enableAnalytics: config.analytics.enableAnalyticsInsights,
      }
    );
    // Create integration configuration
    const integrationConfig: IntegrationConfig = {
      enableUnifiedProtection: true,
      rateLimitingPriority: config.integration.priorities.rateLimiting,
      throttlingPriority: config.integration.priorities.throttling,
      integrationMode: config.integration.mode,
      coordinationStrategy: config.integration.strategy,
      fallbackBehavior: config.integration.fallback,
      analyticsIntegration: config.analytics.enableAnalyticsInsights,
      crossSystemLearning: config.analytics.enableCrossSystemLearning,
    };
    // Create unified integration
    const integration = new AdaptiveRateLimitingIntegration(;)
      rateLimitingService,
      throttlingEngine,
      integrationConfig
    );
    return {
      rateLimitingService,
      throttlingEngine,
      integration,
      analytics: {,
        usagePatterns: usagePatternAnalytics,
        scalingAnalytics
      }
    };
  }
  /**
   * Create a lightweight rate limiting only system
   */
  public static createRateLimitingOnly(): RateLimitingService {
    return new RateLimitingService();
  }
  /**
   * Create an adaptive throttling only system
   */
  public static createThrottlingOnly()
    enableAnalytics: boolean = false
  ): AdaptiveThrottlingRulesEngine {
    const rateLimitingService = new RateLimitingService();
    return new AdaptiveThrottlingRulesEngine()
      rateLimitingService,
      true, // Initialize default rules
      {
        enableAnalytics
      }
    );
  }
  /**
   * Create usage pattern analytics service
   */
  private static createUsagePatternAnalytics()
    profile: SecurityProfile,
  ): ApiUsagePatternQuotaRecommendations {
    const config = this.getUsagePatternConfig(profile);
    return new ApiUsagePatternQuotaRecommendations(config);
  }
  /**
   * Create scaling analytics service
   */
  private static createScalingAnalytics()
    profile: SecurityProfile,
  ): ApiScalingAnalyticsIntegration {
    const config = this.getScalingAnalyticsConfig(profile);
    return new ApiScalingAnalyticsIntegration(config);
  }
  /**
   * Generate configuration based on security profile
   */
  private static generateConfiguration()
    profile: SecurityProfile,
    customConfig?: Partial<UnifiedSecurityConfig>
  ): UnifiedSecurityConfig {
    const baseConfig = this.getBaseConfiguration(profile);
    // Merge with custom configuration
    if (customConfig) {
      return this.mergeConfigurations(baseConfig, customConfig);
    }
    return baseConfig;
  }
  /**
   * Get base configuration for security profile
   */
  private static getBaseConfiguration(profile: SecurityProfile): UnifiedSecurityConfig {
    switch (profile) {
      case SecurityProfile.DEVELOPMENT:
        return {
          rateLimiting: {,
            enabled: true,
            strictMode: false,
          },
          throttling: {,
            enabled: true,
            analyticsEnabled: false,
            defaultRules: true,
          },
          integration: {,
            mode: IntegrationMode.PARALLEL,
            strategy: CoordinationStrategy.LEAST_RESTRICTIVE,
            fallback: FallbackBehavior.ALLOW,
            priorities: {,
              rateLimiting: 50,
              throttling: 60,
            }
          },
          analytics: {,
            enableUsagePatterns: false,
            enableScalingAnalytics: false,
            enableCrossSystemLearning: false,
            enableAnalyticsInsights: false,
          },
          monitoring: {,
            enableMetrics: true,
            enableHealthChecks: false,
            alertThresholds: {,
              errorRate: 20,
              responseTime: 5000,
              systemHealth: 60,
            }
          }
        };
      case SecurityProfile.STAGING:
        return {
          rateLimiting: {,
            enabled: true,
            strictMode: false,
          },
          throttling: {,
            enabled: true,
            analyticsEnabled: true,
            defaultRules: true,
          },
          integration: {,
            mode: IntegrationMode.HIERARCHICAL,
            strategy: CoordinationStrategy.WEIGHTED_AVERAGE,
            fallback: FallbackBehavior.USE_THROTTLING,
            priorities: {,
              rateLimiting: 60,
              throttling: 70,
            }
          },
          analytics: {,
            enableUsagePatterns: true,
            enableScalingAnalytics: true,
            enableCrossSystemLearning: true,
            enableAnalyticsInsights: true,
          },
          monitoring: {,
            enableMetrics: true,
            enableHealthChecks: true,
            alertThresholds: {,
              errorRate: 15,
              responseTime: 3000,
              systemHealth: 70,
            }
          }
        };
      case SecurityProfile.PRODUCTION:
        return {
          rateLimiting: {,
            enabled: true,
            strictMode: true,
          },
          throttling: {,
            enabled: true,
            analyticsEnabled: true,
            defaultRules: true,
          },
          integration: {,
            mode: IntegrationMode.HIERARCHICAL,
            strategy: CoordinationStrategy.MOST_RESTRICTIVE,
            fallback: FallbackBehavior.BLOCK,
            priorities: {,
              rateLimiting: 80,
              throttling: 85,
            }
          },
          analytics: {,
            enableUsagePatterns: true,
            enableScalingAnalytics: true,
            enableCrossSystemLearning: true,
            enableAnalyticsInsights: true,
          },
          monitoring: {,
            enableMetrics: true,
            enableHealthChecks: true,
            alertThresholds: {,
              errorRate: 10,
              responseTime: 2000,
              systemHealth: 85,
            }
          }
        };
      case SecurityProfile.HIGH_SECURITY:
        return {
          rateLimiting: {,
            enabled: true,
            strictMode: true,
          },
          throttling: {,
            enabled: true,
            analyticsEnabled: true,
            defaultRules: true,
          },
          integration: {,
            mode: IntegrationMode.SEQUENTIAL,
            strategy: CoordinationStrategy.MOST_RESTRICTIVE,
            fallback: FallbackBehavior.BLOCK,
            priorities: {,
              rateLimiting: 95,
              throttling: 90,
            }
          },
          analytics: {,
            enableUsagePatterns: true,
            enableScalingAnalytics: true,
            enableCrossSystemLearning: true,
            enableAnalyticsInsights: true,
          },
          monitoring: {,
            enableMetrics: true,
            enableHealthChecks: true,
            alertThresholds: {,
              errorRate: 5,
              responseTime: 1500,
              systemHealth: 95,
            }
          }
        };
      case SecurityProfile.HIGH_VOLUME:
        return {
          rateLimiting: {,
            enabled: true,
            strictMode: false,
          },
          throttling: {,
            enabled: true,
            analyticsEnabled: true,
            defaultRules: true,
          },
          integration: {,
            mode: IntegrationMode.PARALLEL,
            strategy: CoordinationStrategy.DYNAMIC_SELECTION,
            fallback: FallbackBehavior.USE_THROTTLING,
            priorities: {,
              rateLimiting: 70,
              throttling: 80,
            }
          },
          analytics: {,
            enableUsagePatterns: true,
            enableScalingAnalytics: true,
            enableCrossSystemLearning: true,
            enableAnalyticsInsights: true,
          },
          monitoring: {,
            enableMetrics: true,
            enableHealthChecks: true,
            alertThresholds: {,
              errorRate: 8,
              responseTime: 1000,
              systemHealth: 80,
            }
          }
        };
      default:
        return this.getBaseConfiguration(SecurityProfile.PRODUCTION);
    }
  }
  /**
   * Get usage pattern analytics configuration
   */
  private static getUsagePatternConfig(profile: SecurityProfile) {
    // This would return configuration specific to the ApiUsagePatternQuotaRecommendations
    // For now, return a basic configuration object
    return {
      enablePatternAnalysis: true,
      analysisWindow: profile === SecurityProfile.HIGH_VOLUME ? 2 : 6, // hours
      recommendationInterval: profile === SecurityProfile.HIGH_SECURITY ? 5 : 15, // minutes
      usagePatterns: [],
      quotaAdjustmentRules: [],
      fairnessConfig: {,
        enableFairnessAnalysis: true,
        fairnessThreshold: 0.8,
        fairnessMetrics: ['quota_utilization', 'request_distribution'],
        adjustmentStrategies: ['gradual_increase', 'priority_based']
      },
      abuseDetectionConfig: {,
        enableAbuseDetection: true,
        detectionAlgorithms: ['statistical_anomaly', 'pattern_based', 'threshold_based'],
        abuseThreshold: profile === SecurityProfile.HIGH_SECURITY ? 0.7 : 0.8,
        responseActions: ['throttle', 'temporary_block', 'alert_admin']
      },
      alertingConfig: {,
        enableAlerting: true,
        alertChannels: ['email', 'webhook'],
        alertThresholds: {,
          highUsage: 0.8,
          potentialAbuse: 0.9,
          systemOverload: 0.95,
        }
      }
    };
  }
  /**
   * Get scaling analytics configuration
   */
  private static getScalingAnalyticsConfig(profile: SecurityProfile) {
    // This would return configuration specific to the ApiScalingAnalyticsIntegration
    // For now, return a basic configuration object
    return {
      enableRealTimeAnalytics: true,
      analysisInterval: profile === SecurityProfile.HIGH_VOLUME ? 2 : 5, // minutes
      scalingThresholds: {,
        cpuUtilizationPercent: {,
          scaleUp: profile === SecurityProfile.HIGH_VOLUME ? 60 : 70,
          scaleDown: 30,
        },
        memoryUtilizationPercent: {,
          scaleUp: profile === SecurityProfile.HIGH_VOLUME ? 70 : 80,
          scaleDown: 40,
        },
        responseTimeMs: {,
          scaleUp: profile === SecurityProfile.HIGH_SECURITY ? 500 : 1000,
          scaleDown: 200,
        },
        throughputRps: {,
          scaleUp: 1000,
          scaleDown: 100,
        },
        errorRatePercent: {,
          scaleUp: profile === SecurityProfile.HIGH_SECURITY ? 2 : 5,
          scaleDown: 1,
        },
        queueDepth: {,
          scaleUp: 100,
          scaleDown: 10,
        },
        connectionCount: {,
          scaleUp: 1000,
          scaleDown: 100,
        }
      },
      loadBalancingConfig: {,
        enableIntelligentRouting: true,
        routingAlgorithm: 'adaptive',
        healthCheckConfig: {,
          enableHealthChecks: true,
          healthCheckInterval: 30,
          healthCheckTimeout: 5,
          healthCheckPath: '/health',
          unhealthyThreshold: 3,
          healthyThreshold: 2,
          customHealthChecks: [],
        },
        stickySessionConfig: {,
          enableStickySession: false,
          sessionAffinityDuration: 3600,
          sessionIdHeader: 'X-Session-ID',
        },
        circuitBreakerConfig: {,
          enableCircuitBreaker: true,
          failureThreshold: 5,
          recoveryTimeout: 60000,
          halfOpenRequests: 3,
        },
        trafficShaping: {,
          enableTrafficShaping: true,
          maxConcurrentRequests: 1000,
          queueTimeout: 30000,
        }
      },
      predictiveScalingConfig: {,
        enablePredictiveScaling: profile !== SecurityProfile.DEVELOPMENT,
        predictionWindow: 30, // minutes
        scalingModels: ['linear_regression', 'time_series'],
        confidenceThreshold: 0.8,
      },
      performanceTargets: {,
        targetResponseTime: profile === SecurityProfile.HIGH_SECURITY ? 200 : 500,
        targetThroughput: profile === SecurityProfile.HIGH_VOLUME ? 10000 : 1000,
        targetErrorRate: profile === SecurityProfile.HIGH_SECURITY ? 0.1 : 1.0,
        targetAvailability: profile === SecurityProfile.HIGH_SECURITY ? 99.9 : 99.5
      },
      costOptimizationConfig: {,
        enableCostOptimization: profile === SecurityProfile.HIGH_VOLUME,
        costThresholds: {,
          maxHourlyCost: 100,
          costPerRequest: 0.001,
        },
        optimizationStrategies: ['right_sizing', 'spot_instances', 'auto_shutdown']
      },
      alertingConfig: {,
        enableAlerting: true,
        alertChannels: ['email', 'slack', 'webhook'],
        escalationPolicy: {,
          levels: [,
            { threshold: 0.8, delay: 5 },
            { threshold: 0.9, delay: 2 },
            { threshold: 0.95, delay: 0 }
          ]
        }
      }
    };
  }
  /**
   * Merge configurations with deep merge
   */
  private static mergeConfigurations()
    base: UnifiedSecurityConfig,
    custom: Partial<UnifiedSecurityConfig>,
  ): UnifiedSecurityConfig {
    const merged = { ...base };
    if (custom.rateLimiting) {
      merged.rateLimiting = { ...merged.rateLimiting, ...custom.rateLimiting };
    }
    if (custom.throttling) {
      merged.throttling = { ...merged.throttling, ...custom.throttling };
    }
    if (custom.integration) {
      merged.integration = { ...merged.integration, ...custom.integration };
      if (custom.integration.priorities) {
        merged.integration.priorities = { ...merged.integration.priorities, ...custom.integration.priorities };
      }
    }
    if (custom.analytics) {
      merged.analytics = { ...merged.analytics, ...custom.analytics };
    }
    if (custom.monitoring) {
      merged.monitoring = { ...merged.monitoring, ...custom.monitoring };
      if (custom.monitoring.alertThresholds) {
        merged.monitoring.alertThresholds = { ...merged.monitoring.alertThresholds, ...custom.monitoring.alertThresholds };
      }
    }
    return merged;
  }
  /**
   * Create preset configurations for common use cases
   */
  public static createPresetConfigurations(): Record<string, UnifiedSecurityConfig> {
    return {
      // API Gateway protection
      apiGateway: {,
        rateLimiting: { enabled: true, strictMode: true },
        throttling: { enabled: true, analyticsEnabled: true, defaultRules: true },
        integration: {,
          mode: IntegrationMode.HIERARCHICAL,
          strategy: CoordinationStrategy.MOST_RESTRICTIVE,
          fallback: FallbackBehavior.BLOCK,
          priorities: { rateLimiting: 85, throttling: 80 }
        },
        analytics: {,
          enableUsagePatterns: true,
          enableScalingAnalytics: true,
          enableCrossSystemLearning: true,
          enableAnalyticsInsights: true,
        },
        monitoring: {,
          enableMetrics: true,
          enableHealthChecks: true,
          alertThresholds: { errorRate: 5, responseTime: 1000, systemHealth: 90 }
        }
      },
      // Authentication service protection
      authentication: {,
        rateLimiting: { enabled: true, strictMode: true },
        throttling: { enabled: true, analyticsEnabled: true, defaultRules: true },
        integration: {,
          mode: IntegrationMode.SEQUENTIAL,
          strategy: CoordinationStrategy.MOST_RESTRICTIVE,
          fallback: FallbackBehavior.BLOCK,
          priorities: { rateLimiting: 95, throttling: 85 }
        },
        analytics: {,
          enableUsagePatterns: true,
          enableScalingAnalytics: false,
          enableCrossSystemLearning: true,
          enableAnalyticsInsights: true,
        },
        monitoring: {,
          enableMetrics: true,
          enableHealthChecks: true,
          alertThresholds: { errorRate: 2, responseTime: 500, systemHealth: 95 }
        }
      },
      // Microservices protection
      microservices: {,
        rateLimiting: { enabled: true, strictMode: false },
        throttling: { enabled: true, analyticsEnabled: true, defaultRules: true },
        integration: {,
          mode: IntegrationMode.PARALLEL,
          strategy: CoordinationStrategy.DYNAMIC_SELECTION,
          fallback: FallbackBehavior.USE_THROTTLING,
          priorities: { rateLimiting: 70, throttling: 80 }
        },
        analytics: {,
          enableUsagePatterns: true,
          enableScalingAnalytics: true,
          enableCrossSystemLearning: true,
          enableAnalyticsInsights: true,
        },
        monitoring: {,
          enableMetrics: true,
          enableHealthChecks: true,
          alertThresholds: { errorRate: 8, responseTime: 2000, systemHealth: 80 }
        }
      }
    };
  }
  /**
   * Validate configuration
   */
  public static validateConfiguration(config: UnifiedSecurityConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Validate priorities
    if (config.integration.priorities.rateLimiting < 0 || config.integration.priorities.rateLimiting > 100) {
      errors.push('Rate limiting priority must be between 0 and 100');
    }
    if (config.integration.priorities.throttling < 0 || config.integration.priorities.throttling > 100) {
      errors.push('Throttling priority must be between 0 and 100');
    }
    // Validate alert thresholds
    if (config.monitoring.alertThresholds.errorRate < 0 || config.monitoring.alertThresholds.errorRate > 100) {
      errors.push('Error rate threshold must be between 0 and 100');
    }
    if (config.monitoring.alertThresholds.responseTime < 0) {
      errors.push('Response time threshold must be positive');
    }
    if (config.monitoring.alertThresholds.systemHealth < 0 || config.monitoring.alertThresholds.systemHealth > 100) {
      errors.push('System health threshold must be between 0 and 100');
    }
    // Warnings for potentially problematic configurations
    if (config.integration.strategy === CoordinationStrategy.LEAST_RESTRICTIVE && )
        config.integration.fallback === FallbackBehavior.ALLOW) {
      warnings.push('Least restrictive strategy with allow fallback may be too permissive for production');
    }
    if (config.analytics.enableAnalyticsInsights && !config.analytics.enableUsagePatterns) {
      warnings.push('Analytics insights enabled but usage patterns disabled - limited insights available');
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default UnifiedSecurityProtectionFactory;