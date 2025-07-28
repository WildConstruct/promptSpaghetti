/**
 * Classification-Based Access Control Service
 *
 * Implements access control policies based on data classification levels.
 * Enforces handling requirements and ensures compliance with security policies.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, AccessRequirements, OperationContext } from '../types/DataClassification';
export interface AccessControlPolicy {
    id: string;
    name: string;
    description: string;
    classification: DataClassificationLevel;
    requirements: AccessRequirements;
    created: Date;
    lastModified: Date;
    version: string;
}
export interface AccessRequest {
    userId: string;
    dataId: string;
    classification: DataClassificationLevel;
    operation: 'read' | 'write' | 'update' | 'delete' | 'export' | 'share';
    purpose: string;
    context: OperationContext;
    requestedAt: Date;
}
export interface AccessDecision {
    granted: boolean;
    reason: string;
    conditions: AccessCondition;
    expiresAt?: Date;
    auditRequired: boolean;
    monitoringLevel: 'STANDARD' | 'ENHANCED' | 'REALTIME';
}
export interface AccessCondition {
    type: 'TIME_RESTRICTION' | 'PURPOSE_LIMITATION' | 'APPROVAL_REQUIRED' | 'AUDIT_LOGGING' | 'EXPORT_RESTRICTED';
    description: string;
    parameters: Record<string, any>;
    mandatory: boolean;
}
export interface UserAccessProfile {
    userId: string;
    roles: string;
    clearanceLevel: DataClassificationLevel;
    permissions: string;
    restrictions: AccessRestriction;
    mfaVerified: boolean;
    lastAuthenticationAt: Date;
    authenticationLevel: 'STANDARD' | 'MFA' | 'STRONG_MFA' | 'BIOMETRIC';
}
export interface AccessRestriction {
    type: 'TIME_BASED' | 'IP_BASED' | 'DEVICE_BASED' | 'PURPOSE_BASED';
    description: string;
    configuration: Record<string, any>;
    active: boolean;
    expiresAt?: Date;
}
export declare class ClassificationAccessControlService {
    private policies;
    private auditEvents;
    private userProfiles;
    constructor();
    /**
    * Initialize default access control policies for each classification level
    */
    private initializeDefaultPolicies;
    conditions: [];
    auditRequired: true;
    monitoringLevel: 'ENHANCED';
}
//# sourceMappingURL=ClassificationAccessControlService.d.ts.map