import { DataClassificationLevel } from '../types/DataClassification';
import { BackoffStrategy } from './RateLimitingService';
/**
 * Standard Rate Limiting Configurations by Classification Level
 */
export const STANDARD_DATA_RETRIEVAL_LIMITS = {
    [DataClassificationLevel.PUBLIC]: {
        classification: DataClassificationLevel.PUBLIC,
        operation: 'READ',
        limits: {
            requestsPerMinute: 200,
            requestsPerHour: 5000,
            requestsPerDay: 50000,
            bytesPerMinute: 52428800, // 50MB,
            bytesPerHour: 524288000, // 500MB,
            recordsPerMinute: 5000,
            recordsPerHour: 50000,
            concurrentRequests: 10,
        },
        backoff: {
            strategy: BackoffStrategy.LINEAR,
            baseDelay: 1,
            maxDelay: 60,
            multiplier: 1.5,
        },
        adaptiveFactors: {
            userRiskMultiplier: 0.9,
            timeOfDayMultiplier: 0.8,
            locationMultiplier: 0.7,
            deviceTrustMultiplier: 0.8,
        }[DataClassificationLevel.INTERNAL]
    }
}, { classification: DataClassificationLevel, INTERNAL, operation: , 'READ': , limits: { requestsPerMinute: , 100: , requestsPerHour: , 2000: , requestsPerDay: , 20000: , bytesPerMinute: , 20971520: , // 20MB,
bytesPerHour: , 209715200: , // 200MB,
recordsPerMinute: , 2000: , recordsPerHour: , 20000: , concurrentRequests: , 5: , }, backoff: { strategy: BackoffStrategy, EXPONENTIAL, baseDelay: , 2: , maxDelay: , 120: , multiplier: , 2: , }, adaptiveFactors: { userRiskMultiplier: , 0.8: , timeOfDayMultiplier: , 0.6: , locationMultiplier: , 0.5: , deviceTrustMultiplier: , 0.7: , }, [DataClassificationLevel.CONFIDENTIAL]: { classification: DataClassificationLevel, CONFIDENTIAL, operation: , 'READ': , limits: { requestsPerMinute: , 30: , requestsPerHour: , 500: , requestsPerDay: , 2000: , bytesPerMinute: , 5242880: , // 5MB,
bytesPerHour: , 52428800: , // 50MB,
recordsPerMinute: , 500: , recordsPerHour: , 5000: , concurrentRequests: , 3: , }, backoff: { strategy: BackoffStrategy, EXPONENTIAL, baseDelay: , 5: , maxDelay: , 300: , multiplier: , 3: , }, adaptiveFactors: { userRiskMultiplier: , 0.6: , timeOfDayMultiplier: , 0.4: , locationMultiplier: , 0.2: , deviceTrustMultiplier: , 0.5: , }, [DataClassificationLevel.RESTRICTED]: { classification: DataClassificationLevel, RESTRICTED, operation: , 'READ': , limits: { requestsPerMinute: , 10: , requestsPerHour: , 100: , requestsPerDay: , 500: , bytesPerMinute: , 1048576: , // 1MB,
bytesPerHour: , 10485760: , // 10MB,
recordsPerMinute: , 100: , recordsPerHour: , 1000: , concurrentRequests: , 1: , }, backoff: { strategy: BackoffStrategy, EXPONENTIAL, baseDelay: , 10: , maxDelay: , 600: , multiplier: , 4: , }, adaptiveFactors: { userRiskMultiplier: , 0.4: , timeOfDayMultiplier: , 0.2: , locationMultiplier: , 0.1: , deviceTrustMultiplier: , 0.3: , }, [DataClassificationLevel.TOP_SECRET]: { classification: DataClassificationLevel, TOP_SECRET, operation: , 'READ': , limits: { requestsPerMinute: , 5: , requestsPerHour: , 25: , requestsPerDay: , 100: , bytesPerMinute: , 524288: , // 512KB,
bytesPerHour: , 2621440: , // 2.5MB,
recordsPerMinute: , 25: , recordsPerHour: , 100: , concurrentRequests: , 1: , }, backoff: { strategy: BackoffStrategy, EXPONENTIAL, baseDelay: , 30: , maxDelay: , 1800: , multiplier: , 5: , }, adaptiveFactors: { userRiskMultiplier: , 0.2: , timeOfDayMultiplier: , 0.1: , locationMultiplier: , 0.05: , deviceTrustMultiplier: , 0.1: , } } } } };
/**
 * Operation-Specific Rate Limiting Modifiers
 */
export const OPERATION_MODIFIERS = {
    READ: {
        requestMultiplier: 1.0,
        volumeMultiplier: 1.0,
        concurrencyMultiplier: 1.0,
        riskMultiplier: 1.0,
    },
    WRITE: {
        requestMultiplier: 0.5,
        volumeMultiplier: 0.7,
        concurrencyMultiplier: 0.8,
        riskMultiplier: 1.5,
    },
    UPDATE: {
        requestMultiplier: 0.6,
        volumeMultiplier: 0.8,
        concurrencyMultiplier: 0.9,
        riskMultiplier: 1.3,
    },
    DELETE: {
        requestMultiplier: 0.2,
        volumeMultiplier: 0.3,
        concurrencyMultiplier: 0.5,
        riskMultiplier: 3.0,
    },
    EXPORT: {
        requestMultiplier: 0.1,
        volumeMultiplier: 2.0,
        concurrencyMultiplier: 0.3,
        riskMultiplier: 2.5,
    },
    SHARE: {
        requestMultiplier: 0.3,
        volumeMultiplier: 0.5,
        concurrencyMultiplier: 0.6,
        riskMultiplier: 2.0,
    },
    COPY: {
        requestMultiplier: 0.4,
        volumeMultiplier: 1.5,
        concurrencyMultiplier: 0.7,
        riskMultiplier: 1.8,
    },
    MOVE: {
        requestMultiplier: 0.3,
        volumeMultiplier: 0.6,
        concurrencyMultiplier: 0.5,
        riskMultiplier: 2.2,
    },
    CLASSIFY: {
        requestMultiplier: 0.8,
        volumeMultiplier: 0.2,
        concurrencyMultiplier: 0.9,
        riskMultiplier: 1.2,
    },
    DECLASSIFY: {
        requestMultiplier: 0.2,
        volumeMultiplier: 0.1,
        concurrencyMultiplier: 0.3,
        riskMultiplier: 4.0,
    },
    SEARCH: {
        requestMultiplier: 2.0,
        volumeMultiplier: 0.3,
        concurrencyMultiplier: 1.5,
        riskMultiplier: 1.1,
    },
    AGGREGATE: {
        requestMultiplier: 0.5,
        volumeMultiplier: 3.0,
        concurrencyMultiplier: 0.4,
        riskMultiplier: 1.6,
    },
    TRANSFORM: {
        requestMultiplier: 0.3,
        volumeMultiplier: 1.2,
        concurrencyMultiplier: 0.6,
        riskMultiplier: 1.7,
    },
    BACKUP: {
        requestMultiplier: 0.1,
        volumeMultiplier: 5.0,
        concurrencyMultiplier: 0.2,
        riskMultiplier: 1.3,
    },
    RESTORE: {
        requestMultiplier: 0.1,
        volumeMultiplier: 4.0,
        concurrencyMultiplier: 0.2,
        riskMultiplier: 2.8,
    },
    ARCHIVE: {
        requestMultiplier: 0.2,
        volumeMultiplier: 3.0,
        concurrencyMultiplier: 0.3,
        riskMultiplier: 1.4,
    },
    PURGE: {
        requestMultiplier: 0.05,
        volumeMultiplier: 0.1,
        concurrencyMultiplier: 0.1,
        riskMultiplier: 5.0,
    },
    AUDIT: {
        requestMultiplier: 1.5,
        volumeMultiplier: 2.0,
        concurrencyMultiplier: 1.2,
        riskMultiplier: 0.8,
    },
    APPROVE: {
        requestMultiplier: 0.8,
        volumeMultiplier: 0.1,
        concurrencyMultiplier: 0.9,
        riskMultiplier: 1.1,
    }
};
export const ENVIRONMENT_CONFIGURATIONS = {
    DEVELOPMENT: {
        globalLimits: {
            maxConcurrentUsers: 100,
            maxDailyBytes: 107374182400, // 100GB,
            maxDailyRecords: 10000000,
            maxRequestRate: 1000,
            emergencyThrottle: {
                enabled: false,
                thresholdCpuPercent: 90,
                thresholdMemoryPercent: 90,
                throttlePercent: 50,
            },
            relaxedMode: true,
            debugLogging: true
        },
        STAGING: {
            globalLimits: {
                maxConcurrentUsers: 500,
                maxDailyBytes: 53687091200, // 50GB,
                maxDailyRecords: 5000000,
                maxRequestRate: 500,
                emergencyThrottle: {
                    enabled: true,
                    thresholdCpuPercent: 80,
                    thresholdMemoryPercent: 80,
                    throttlePercent: 30,
                },
                relaxedMode: false,
                debugLogging: true
            },
            PRODUCTION: {
                globalLimits: {
                    maxConcurrentUsers: 10000,
                    maxDailyBytes: 1073741824000, // 1TB,
                    maxDailyRecords: 100000000,
                    maxRequestRate: 5000,
                    emergencyThrottle: {
                        enabled: true,
                        thresholdCpuPercent: 70,
                        thresholdMemoryPercent: 75,
                        throttlePercent: 20,
                    },
                    relaxedMode: false,
                    debugLogging: false
                },
                /**
                 * Standard Alert Thresholds
                 */
                const: STANDARD_ALERT_THRESHOLDS, AlertThresholds = {
                    volumeSpike: {
                        percentIncrease: 300,
                        timeWindow: 15,
                    },
                    userQuotaUsage: {
                        warningPercent: 80,
                        criticalPercent: 95,
                    },
                    classificationAccess: {
                        restrictedAccessCount: 10,
                        timeWindow: 60,
                    },
                    anomalyScore: {
                        warningThreshold: 70,
                        criticalThreshold: 90,
                    },
                    /**
                     * Role-Based Exemption Templates
                     */
                    const: ROLE_EXEMPTION_TEMPLATES = {
                        SYSTEM_ADMIN: {
                            exemptionType: 'RATE_LIMIT',
                            reason: 'System administrator emergency access',
                            conditions: [,
                                {
                                    type: 'EMERGENCY',
                                    specification: { severity: 'HIGH' },
                                    required: true
                                }],
                            auditRequired: true
                        },
                        DATA_OWNER: {
                            exemptionType: 'QUOTA',
                            reason: 'Data owner administrative access',
                            conditions: [,
                                {
                                    type: 'BUSINESS_CRITICAL',
                                    specification: { justification_required: true },
                                    required: true
                                }],
                            auditRequired: true
                        },
                        SECURITY_OFFICER: {
                            exemptionType: 'CLASSIFICATION',
                            reason: 'Security investigation access',
                            conditions: [,
                                {
                                    type: 'TIME_RANGE',
                                    specification: {
                                        start: '09:00',
                                        end: '17:00',
                                        timezone: 'UTC',
                                    },
                                    required: false
                                }],
                            auditRequired: true
                        },
                        COMPLIANCE_OFFICER: {
                            exemptionType: 'TIME_RESTRICTION',
                            reason: 'Compliance audit access',
                            conditions: [,
                                {
                                    type: 'OPERATION',
                                    specification: { operations: ['AUDIT', 'read'] },
                                    required: true
                                }],
                            auditRequired: true
                        },
                        /**
                         * Configuration Factory Class
                         */
                        class: DataRetrievalConfigurationFactory
                    } }
            }
        }
    }
}, { 
/**
 * Create configuration for specific environment
 */
public, static, createConfiguration };
(environment) => customizations;
Partial;
DataRetrievalConfig;
{
    const envConfig = ENVIRONMENT_CONFIGURATIONS[environment];
    const baseConfig = {
        enableVolumeTracking: true,
        enableBehaviorAnalysis: environment !== 'DEVELOPMENT',
        enableAdaptiveLimits: environment === 'PRODUCTION',
        enableAnomalyDetection: environment !== 'DEVELOPMENT',
        quotaEnforcement: environment !== 'DEVELOPMENT',
        globalLimits: envConfig.globalLimits,
        classificationLimits: { ...STANDARD_DATA_RETRIEVAL_LIMITS },
        alertThresholds: { ...STANDARD_ALERT_THRESHOLDS },
        exemptions: []
    };
    // Apply customizations if provided
    if (customizations) {
        return { ...baseConfig, ...customizations };
        return baseConfig;
        createOperationLimits(((baseLimits, operation) => {
            const modifier = OPERATION_MODIFIERS[operation];
            if (!modifier) {
                return baseLimits;
                const operationLimits = JSON.parse(JSON.stringify(baseLimits));
                // Apply modifiers
                operationLimits.limits.requestsPerMinute = Math.floor();
                baseLimits.limits.requestsPerMinute * modifier.requestMultiplier;
            }
        }));
        operationLimits.limits.requestsPerHour = Math.floor();
        baseLimits.limits.requestsPerHour * modifier.requestMultiplier;
        ;
        operationLimits.limits.bytesPerMinute = Math.floor();
        baseLimits.limits.bytesPerMinute * modifier.volumeMultiplier;
        ;
        operationLimits.limits.bytesPerHour = Math.floor();
        baseLimits.limits.bytesPerHour * modifier.volumeMultiplier;
        ;
        operationLimits.limits.concurrentRequests = Math.floor();
        baseLimits.limits.concurrentRequests * modifier.concurrencyMultiplier;
        ;
        // Adjust backoff based on risk
        if (modifier.riskMultiplier > 2.0) {
            operationLimits.backoff.baseDelay = Math.min();
            baseLimits.backoff.baseDelay * modifier.riskMultiplier,
                operationLimits.backoff.maxDelay / 4;
            ;
            operationLimits.operation = operation;
            return operationLimits;
            createRoleExemption(exemptionId, string);
            role: keyof;
            typeof ROLE_EXEMPTION_TEMPLATES,
                userId ?  : string,
                approvedBy;
            string = 'system',
                expiresAt ?  : Date;
            DataAccessExemption;
            {
                const template = ROLE_EXEMPTION_TEMPLATES[role];
                return {
                    id: exemptionId,
                    userId,
                    role: role,
                    reason: template.reason,
                    exemptionType: template.exemptionType,
                    expiresAt,
                    conditions: template.conditions,
                    approvedBy,
                    approvedAt: new Date(),
                    auditRequired: template.auditRequired,
                };
                validateConfiguration(config, DataRetrievalConfig);
                ValidationResult;
                {
                    const errors = [];
                    const warnings = [];
                    // Validate global limits
                    if (config.globalLimits.maxRequestRate <= 0) {
                        errors.push('Global max request rate must be positive');
                        if (config.globalLimits.maxDailyBytes <= 0) {
                            errors.push('Global max daily bytes must be positive');
                            // Validate classification limits
                            Object.entries(config.classificationLimits).forEach(([classification, limits]) => {
                                if (limits.limits.requestsPerMinute > limits.limits.requestsPerHour) {
                                    warnings.push(`${classification}: requests per minute exceeds requests per hour`);
                                }
                                if (limits.limits.bytesPerMinute > limits.limits.bytesPerHour) {
                                    warnings.push(`${classification}: bytes per minute exceeds bytes per hour`);
                                }
                                if (limits.backoff.baseDelay >= limits.backoff.maxDelay) {
                                    errors.push(`${classification}: base delay must be less than max delay`);
                                }
                            });
                            // Validate alert thresholds
                            if (config.alertThresholds.userQuotaUsage.warningPercent >= config.alertThresholds.userQuotaUsage.criticalPercent) {
                                errors.push('Warning quota threshold must be less than critical threshold');
                                return {
                                    isValid: errors.length === 0,
                                    errors,
                                    warnings
                                };
                                optimizeForPerformance(config, DataRetrievalConfig);
                                DataRetrievalConfig;
                                {
                                    const optimized = JSON.parse(JSON.stringify(config));
                                    // Reduce tracking overhead in high-performance scenarios
                                    if (config.globalLimits.maxRequestRate > 1000) {
                                        optimized.enableBehaviorAnalysis = false;
                                        optimized.enableAnomalyDetection = false;
                                        // Optimize alert thresholds for high volume
                                        if (config.globalLimits.maxDailyBytes > 10737418240) { // 10GB
                                            optimized.alertThresholds.volumeSpike.percentIncrease = 500;
                                            optimized.alertThresholds.volumeSpike.timeWindow = 30;
                                            return optimized;
                                        }
                                        export default DataRetrievalConfigurationFactory;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
