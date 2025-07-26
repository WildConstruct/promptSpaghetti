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
import { 
  DataClassificationLevel,
  HandlingRequirements,
  AccessRequirements,
  OperationContext,
  ClassificationAuditEvent
} from '../types/DataClassification';
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
        users?: string[];
        roles?: string[];
        conditions?: string[];
    };
}
/**
 * Enforcement result
 */
export interface EnforcementResult {
    allowed: boolean;
    classification: DataClassificationLevel;
    violations: string[];
    requiredControls: string[];
    appliedControls: string[];
    riskScore: number;
    auditId: string;
    recommendations?: string[];
}
/**
 * Access decision
 */
export interface AccessDecision {
    granted: boolean;
    reason: string;
    requiredAuthentication?: string;
    requiredAuthorization?: string[];
    conditions?: string[];
    expiresAt?: Date;
}
/**
 * Classification Enforcement Engine
 */
export declare class ClassificationEnforcer {
    private config;
    private auditLog;
    private violationCache;
    constructor(config?: Partial<ClassificationEnforcementConfig>);
    /**
     * Enforce classification policies for an operation
     */
    enforceClassification(
      classification: DataClassificationLevel,
      operation: OperationContext,
      currentControls?: string[]
    ): Promise<EnforcementResult>;
    /**
     * Make an access control decision
     */
    makeAccessDecision(
      userId: string,
      dataId: string,
      classification: DataClassificationLevel,
      operation: string,
      context: Partial<OperationContext>
    ): Promise<AccessDecision>;
    /**
     * Validate an operation against classification policies
     */
    validateOperation(operation: OperationContext, classification: DataClassificationLevel, dataElement: any): Promise<{
        valid: boolean;
        issues: string[];
        controls: string[];
    }>;
    /**
     * Get effective requirements considering overrides
     */
    private getEffectiveRequirements;
    /**
     * Validate access requirements
     */
    private validateAccessRequirements;
    /**
     * Validate operation-specific requirements
     */
    private validateOperationRequirements;
    /**
     * Calculate risk score
     */
    private calculateRiskScore;
    /**
     * Determine if operation should be allowed
     */
    private shouldAllowOperation;
    /**
     * Get required controls for an operation
     */
    private getRequiredControls;
    /**
     * Check if user is exempted
     */
    private isUserExempted;
    /**
     * Check if operation is in grace period
     */
    private isInGracePeriod;
    /**
     * Check authentication requirements
     */
    private checkAuthenticationRequirements;
    /**
     * Check authorization requirements
     */
    private checkAuthorizationRequirements;
    /**
     * Check time restrictions
     */
    private checkTimeRestrictions;
    /**
     * Check purpose limitation
     */
    private checkPurposeLimitation;
    /**
     * Get access conditions
     */
    private getAccessConditions;
    /**
     * Calculate access expiration
     */
    private calculateAccessExpiration;
    /**
     * Log enforcement decision
     */
    private logEnforcementDecision;
    /**
     * Alert on violation
     */
    private alertOnViolation;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Convert DataHandlingRequirements to HandlingRequirements
     */
    private convertDataHandlingToHandlingRequirements;
    /**
     * Get access controls for classification
     */
    private getAccessControlsForClassification;
    /**
     * Get retention days for classification
     */
    private getRetentionDaysForClassification;
    /**
     * Get approved locations for classification
     */
    private getApprovedLocationsForClassification;
    /**
     * Get redundancy level for classification
     */
    private getRedundancyLevelForClassification;
    /**
     * Get network restrictions for classification
     */
    private getNetworkRestrictionsForClassification;
    /**
     * Get cache TTL for classification
     */
    private getCacheTtlForClassification;
    /**
     * Merge requirements with overrides
     */
    private mergeRequirements;
    /**
     * Create enforcement result
     */
    private createEnforcementResult;
    /**
     * Generate audit ID
     */
    private generateAuditId;
    /**
     * Generate request ID
     */
    private generateRequestId;
    /**
     * Get audit log (for testing/monitoring)
     */
    getAuditLog(): ClassificationAuditEvent[];
    /**
     * Clear audit log (for testing)
     */
    clearAuditLog(): void;
}
/**
 * Factory function for creating enforcers with presets
 */
export declare function createClassificationEnforcer(preset?: 'development' | 'staging' | 'production'): ClassificationEnforcer;
/**
 * Export types for external use
 */
export type { DataClassificationLevel, HandlingRequirements, AccessRequirements, OperationContext, ClassificationAuditEvent };
//# sourceMappingURL=ClassificationEnforcer.d.ts.map