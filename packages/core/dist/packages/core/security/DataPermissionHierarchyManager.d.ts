/**
 * Data Permission Hierarchy Manager
 *
 * Manages the hierarchical permission system for data access control,
 * including inheritance, delegation, escalation, and emergency overrides.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { EventEmitter } from 'events';
import { PermissionHierarchy, OperationPermission, PermissionCondition, DelegationCondition } from './DataPermissionHierarchy';
import { DataClassificationLevel, OperationContext, DataOperation } from '../types/DataClassification';
export interface PermissionRequest {
    id: string;
    requesterId: string;
    operation: DataOperation;
    dataClassification: DataClassificationLevel;
    dataId: string;
    purpose: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    context: OperationContext;
    requestedAt: Date;
    expiresAt?: Date;
}
export interface PermissionGrant {
    id: string;
    requestId: string;
    grantedBy: string;
    grantedAt: Date;
    permissions: string;
    conditions: PermissionCondition;
    timeLimit?: Date;
    usageLimit?: number;
    usageCount: number;
    revoked: boolean;
    revokedAt?: Date;
    revokedBy?: string;
    auditTrail: PermissionAuditEntry;
}
export interface PermissionAuditEntry {
    timestamp: Date;
    userId: string;
    action: 'GRANTED' | 'USED' | 'DENIED' | 'REVOKED' | 'DELEGATED' | 'ESCALATED' | 'EXPIRED';
    details: Record<string, any>;
    riskScore: number;
}
export interface EscalationRequest {
    id: string;
    originalRequestId: string;
    escalationPath: string;
    currentStep: number;
    status: 'PENDING' | 'APPROVED' | 'DENIED' | 'TIMEOUT' | 'ESCALATED';
    createdAt: Date;
    updatedAt: Date;
    steps: EscalationStepStatus;
    finalDecision?: {
        decision: 'APPROVED' | 'DENIED';
        decisionBy: string;
        decisionAt: Date;
        reason: string;
    };
}
export interface EscalationStepStatus {
    stepId: string;
    status: 'PENDING' | 'APPROVED' | 'DENIED' | 'TIMEOUT' | 'SKIPPED';
    assignedTo: string;
    approvals: StepApproval;
    startedAt: Date;
    completedAt?: Date;
    timeoutAt: Date;
}
export interface StepApproval {
    approver: string;
    decision: 'APPROVED' | 'DENIED';
    timestamp: Date;
    comments?: string;
    conditions?: PermissionCondition;
}
export interface DelegationRequest {
    id: string;
    delegatorId: string;
    delegateeId: string;
    permissions: string;
    timeLimit: Date;
    usageLimit?: number;
    conditions: DelegationCondition;
    justification: string;
    status: 'PENDING' | 'APPROVED' | 'DENIED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
    createdAt: Date;
    approvedAt?: Date;
    approvedBy?: string;
}
export interface HierarchyAnalysis {
    userLevel: number;
    effectivePermissions: OperationPermission;
    inheritedFrom: string;
    delegatedPermissions: DelegationGrant;
    restrictions: PermissionRestriction;
    escalationPaths: string;
    riskProfile: HierarchyRiskProfile;
}
export interface DelegationGrant {
    id: string;
    delegatorId: string;
    permissions: string;
    conditions: DelegationCondition;
    expiresAt: Date;
    usageRemaining?: number;
    source: 'DIRECT' | 'INHERITED' | 'EMERGENCY';
}
export interface PermissionRestriction {
    type: 'TIME' | 'CONTEXT' | 'VOLUME' | 'FREQUENCY' | 'APPROVAL';
    description: string;
    configuration: Record<string, any>;
    active: boolean;
    bypassable: boolean;
}
export interface HierarchyRiskProfile {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskFactors: string;
    mitigationStatus: 'COMPLETE' | 'PARTIAL' | 'NONE';
    lastAssessment: Date;
    recommendedActions: string;
}
export declare class DataPermissionHierarchyManager extends EventEmitter {
    private hierarchy;
    private activeGrants;
    private pendingRequests;
    private escalationRequests;
    private delegationRequests;
    private emergencyOverrides;
    private userLevelCache;
    constructor(hierarchy?: PermissionHierarchy);
    private calculateRiskScore;
    private resolveApprovers;
    private processEscalationStep;
    private canAutoDelegateTo;
    private getInheritedPermissions;
    private getDelegatedPermissions;
    private getInheritanceSources;
    private getActiveRestrictions;
    private calculateUserRiskProfile;
}
//# sourceMappingURL=DataPermissionHierarchyManager.d.ts.map