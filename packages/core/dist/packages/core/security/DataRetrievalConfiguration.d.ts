/**
 * Data Retrieval Rate Limiting Configuration
 *
 * Provides comprehensive configuration presets and management for data retrieval
 * rate limiting across different data classifications and operational contexts.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-95 - Add rate limiting for data retrieval
 */
import { DataRetrievalLimits, GlobalDataLimits } from './DataRetrievalRateLimit';
import { DataClassificationLevel } from '../types/DataClassification';
import { DataOperation } from './DataClassificationAccessControl';
/**
 * Standard Rate Limiting Configurations by Classification Level
 */
export declare const STANDARD_DATA_RETRIEVAL_LIMITS: Record<DataClassificationLevel, DataRetrievalLimits>, DataClassificationLevel: any, INTERNAL: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, BackoffStrategy: any, EXPONENTIAL: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, DataClassificationLevel: any, CONFIDENTIAL: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, BackoffStrategy: any, EXPONENTIAL: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, DataClassificationLevel: any, RESTRICTED: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, BackoffStrategy: any, EXPONENTIAL: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, DataClassificationLevel: any, TOP_SECRET: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, BackoffStrategy: any, EXPONENTIAL: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any;
/**
 * Operation-Specific Rate Limiting Modifiers
 */
export declare const OPERATION_MODIFIERS: Record<DataOperation, OperationModifier>, number: any;
export declare const ENVIRONMENT_CONFIGURATIONS: {
    DEVELOPMENT: {
        globalLimits: {
            maxConcurrentUsers: number;
            maxDailyBytes: number;
            maxDailyRecords: number;
            maxRequestRate: number;
            emergencyThrottle: GlobalDataLimits;
            relaxedMode: boolean;
            debugLogging: boolean;
        };
        STAGING: {
            globalLimits: {
                maxConcurrentUsers: number;
                maxDailyBytes: number;
                maxDailyRecords: number;
                maxRequestRate: number;
                emergencyThrottle: GlobalDataLimits;
                relaxedMode: boolean;
                debugLogging: boolean;
            };
            PRODUCTION: {
                globalLimits: {
                    maxConcurrentUsers: number;
                    maxDailyBytes: number;
                    maxDailyRecords: number;
                    maxRequestRate: number;
                    emergencyThrottle: GlobalDataLimits;
                    relaxedMode: boolean;
                    debugLogging: boolean;
                };
                /**
                 * Standard Alert Thresholds
                 */
                const: any;
                AlertThresholds: {
                    volumeSpike: {
                        percentIncrease: number;
                        timeWindow: number;
                    };
                    userQuotaUsage: {
                        warningPercent: number;
                        criticalPercent: number;
                    };
                    classificationAccess: {
                        restrictedAccessCount: number;
                        timeWindow: number;
                    };
                    anomalyScore: {
                        warningThreshold: number;
                        criticalThreshold: number;
                    };
                    /**
                     * Role-Based Exemption Templates
                     */
                    const: {
                        SYSTEM_ADMIN: {
                            exemptionType: "RATE_LIMIT";
                            reason: string;
                            conditions: {
                                type: "EMERGENCY";
                                specification: {
                                    severity: string;
                                };
                                required: boolean;
                            }[];
                            auditRequired: boolean;
                        };
                        DATA_OWNER: {
                            exemptionType: "QUOTA";
                            reason: string;
                            conditions: {
                                type: "BUSINESS_CRITICAL";
                                specification: {
                                    justification_required: boolean;
                                };
                                required: boolean;
                            }[];
                            auditRequired: boolean;
                        };
                        SECURITY_OFFICER: {
                            exemptionType: "CLASSIFICATION";
                            reason: string;
                            conditions: any[];
                            auditRequired: boolean;
                        };
                        COMPLIANCE_OFFICER: {
                            exemptionType: "TIME_RESTRICTION";
                            reason: string;
                            conditions: {
                                type: "OPERATION";
                                specification: {
                                    operations: string[];
                                };
                                required: boolean;
                            }[];
                            auditRequired: boolean;
                        };
                        /**
                         * Configuration Factory Class
                         */
                        class: any;
                    };
                };
            };
        };
    };
}, 
/**
 * Create configuration for specific environment
 */
public: any, static: any, createConfiguration: any;
//# sourceMappingURL=DataRetrievalConfiguration.d.ts.map