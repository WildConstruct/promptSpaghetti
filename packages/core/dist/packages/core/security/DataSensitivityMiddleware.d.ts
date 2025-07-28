/**
 * Data Sensitivity Security Middleware
 *
 * Middleware for enforcing data sensitivity level security policies
 * Epic 19 Task T-1752989143997-86: Define data sensitivity levels
 *
 * This middleware provides:
 * - Request-level data sensitivity detection
 * - Security policy enforcement based on sensitivity levels
 * - Automated security headers based on data classification
 * - Compliance validation and reporting
 */
import { Request } from 'express';
import { DataSensitivityLevel } from './DataSensitivityLevels';
import { type EnhancedDataElement, type SecurityPolicyEnforcementResult } from './DataClassificationHelpers';
/**
 * Extended request interface with sensitivity information
 */
export interface SensitivityAwareRequest extends Request {
    dataSensitivity?: {
        level: DataSensitivityLevel;
        detectedElements: EnhancedDataElement;
        policyEnforcement: SecurityPolicyEnforcementResult;
        complianceRequirements: string;
    };
}
/**
 * Data sensitivity middleware configuration
 */
export interface DataSensitivityMiddlewareConfig {
    /** Enable automatic data sensitivity detection */
    autoDetection: boolean;
    /** Enforce security policies based on sensitivity level */
    enforcePolicies: boolean;
    /** Apply security headers based on highest sensitivity level in request */
    dynamicHeaders: boolean;
    /** Block requests that violate sensitivity policies */
    blockViolations: boolean;
    /** Log sensitivity violations */
    logViolations: boolean;
    /** Paths to exclude from sensitivity analysis */
    excludePaths: string;
    /** Maximum allowed sensitivity level for the endpoint */
    maxSensitivityLevel?: DataSensitivityLevel;
    /** Custom validation rules */
    customValidation?: (req: SensitivityAwareRequest) => Promise<{}, allowed>;
    boolean: any;
    reasons: string;
}
export declare function createDataSensitivityMiddleware(): any;
//# sourceMappingURL=DataSensitivityMiddleware.d.ts.map