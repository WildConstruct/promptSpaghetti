/**
 * Data Retrieval Rate Limiting Configuration
 *
 * Provides comprehensive configuration presets and management for data retrieval
 * rate limiting across different data classifications and operational contexts.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-95 - Add rate limiting for data retrieval
 */
import { 
  DataRetrievalConfig,
  DataRetrievalLimits,
  GlobalDataLimits,
  AlertThresholds,
  DataAccessExemption
} from './DataRetrievalRateLimit';
import { DataClassificationLevel, DataOperation } from './DataClassificationAccessControl';
/**
 * Standard Rate Limiting Configurations by Classification Level
 */
export declare const STANDARD_DATA_RETRIEVAL_LIMITS: Record<DataClassificationLevel, DataRetrievalLimits>;
/**
 * Operation-Specific Rate Limiting Modifiers
 */
export declare const OPERATION_MODIFIERS: Record<DataOperation, OperationModifier>;
export interface OperationModifier {
    requestMultiplier: number;
    volumeMultiplier: number;
    concurrencyMultiplier: number;
    riskMultiplier: number;
}
/**
 * Environment-Specific Configurations
 */
export declare const ENVIRONMENT_CONFIGURATIONS: {
    DEVELOPMENT: {
        globalLimits: GlobalDataLimits;
        relaxedMode: boolean;
        debugLogging: boolean;
    };
    STAGING: {
        globalLimits: GlobalDataLimits;
        relaxedMode: boolean;
        debugLogging: boolean;
    };
    PRODUCTION: {
        globalLimits: GlobalDataLimits;
        relaxedMode: boolean;
        debugLogging: boolean;
    };
};
/**
 * Standard Alert Thresholds
 */
export declare const STANDARD_ALERT_THRESHOLDS: AlertThresholds;
/**
 * Role-Based Exemption Templates
 */
export declare const ROLE_EXEMPTION_TEMPLATES: {
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
        conditions: {
            type: "TIME_RANGE";
            specification: {
                start: string;
                end: string;
                timezone: string;
            };
            required: boolean;
        }[];
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
};
/**
 * Configuration Factory Class
 */
export declare class DataRetrievalConfigurationFactory {
    /**
     * Create configuration for specific environment
     */
    static createConfiguration(
      environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION',
      customizations?: Partial<DataRetrievalConfig>
    ): DataRetrievalConfig;
    /**
     * Create operation-specific limits based on base limits and operation
     */
    static createOperationLimits(baseLimits: DataRetrievalLimits, operation: DataOperation): DataRetrievalLimits;
    /**
     * Create role-based exemption
     */
    static createRoleExemption(
      exemptionId: string,
      role: keyof typeof ROLE_EXEMPTION_TEMPLATES,
      userId?: string,
      approvedBy?: string,
      expiresAt?: Date
    ): DataAccessExemption;
    /**
     * Validate configuration
     */
    static validateConfiguration(config: DataRetrievalConfig): ValidationResult;
    /**
     * Optimize configuration for performance
     */
    static optimizeForPerformance(config: DataRetrievalConfig): DataRetrievalConfig;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export default DataRetrievalConfigurationFactory;
//# sourceMappingURL=DataRetrievalConfiguration.d.ts.map