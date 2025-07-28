/**
 * Classification Enforcement System
 *
 * Core enforcement module for data classification security policies
 * Epic 19 Task T-1752989143998-694: Build classification enforcement
 *
 * This module provides:
 * - Access control based on classification levels
 * - Operation validation against classification requirements
 * - Policy enforcement for data handling
 * - Integration with existing security middleware
 */
import { DataClassificationLevel, HandlingRequirements, OperationContext } from '../types/DataClassification';
/**
 * Enforcement configuration
 */
export interface ClassificationEnforcementConfig {
    /** Strict mode - blocks all non-compliant operations */
    strictMode: boolean;
    /** Enable real-time monitoring of access attempts */
    realtimeMonitoring: boolean;
    /** Block operations that violate classification policies */
    blockViolations: boolean;
    /** Log all access attempts for audit purposes */
    auditLogging: boolean;
    /** Alert on policy violations */
    alertingEnabled: boolean;
    /** Grace period for legacy data (in days) */
    gracePeriodDays: number;
    /** Custom policy overrides */
    policyOverrides?: Map<DataClassificationLevel, Partial<HandlingRequirements>>;
    /** Exempted users or roles */
    exemptions?: {
        users?: string;
        roles?: string;
        conditions?: string;
    };
}
export interface EnforcementResult {
    allowed: boolean;
    classification: DataClassificationLevel;
    violations: string;
    requiredControls: string;
    appliedControls: string;
    riskScore: number;
    auditId: string;
    recommendations?: string;
}
export interface AccessDecision {
    granted: boolean;
    reason: string;
    requiredAuthentication?: string;
    requiredAuthorization?: string;
    conditions?: string;
    expiresAt?: Date;
}
export declare class ClassificationEnforcer {
    private config;
    private auditLog;
    private violationCache;
    constructor(config?: Partial<ClassificationEnforcementConfig>);
    /**
     * Get effective requirements considering overrides
     */
    private getEffectiveRequirements;
    /**
     * Validate access requirements
     */
    private validateAccessRequirements;
    operation: OperationContext;
    currentControls: string;
    Promise<string>(): void;
    if(requirements: any, authorizationRequired: any): any;
}
//# sourceMappingURL=ClassificationEnforcer.d.ts.map