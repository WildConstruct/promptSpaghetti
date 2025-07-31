/**
 * Bulk Assignment Tools Components
 * Task: E17-1753114396896-4DCBA7 - Create bulk assignment tools
 *
 * Comprehensive React components for bulk assignment operations including
 * API keys, permissions, roles, teams, and usage quotas with multi-step
 * wizard, conflict resolution, and progress tracking.
 */
import React from 'react';
import './BulkAssignmentTools.css';
export declare enum AssignmentType {
    API_KEY = "api_key",
    PERMISSION = "permission",
    ROLE = "role",
    TEAM = "team",
    QUOTA = "quota"

export declare enum BulkOperationType {
    ASSIGN = "assign",
    REVOKE = "revoke",
    UPDATE = "update",
    TRANSFER = "transfer"

}
export interface BulkAssignmentTarget {
    id: string;
    type: 'user' | 'team' | 'service' | 'role';
    name: string;
    email?: string;
    department?: string;
    currentAssignments?: Assignment[];
    conflicts?: AssignmentConflict[];
    metadata?: Record<string, any>;

}
export interface Assignment {
    id: string;
    assignmentType: AssignmentType;
    resourceId: string;
    resourceName: string;
    assignedAt: Date;
    expiresAt?: Date;
    status: 'active' | 'expired' | 'suspended';
    assignedBy: string;
    metadata?: Record<string, any>;

}
export interface AssignmentConflict {
    type: 'duplicate' | 'incompatible' | 'quota_exceeded' | 'permission_denied';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedAssignments: string[];
    resolution?: 'skip' | 'override' | 'merge' | 'escalate';

}
export interface BulkAssignmentOperation {
    operationId: string;
    operationType: BulkOperationType;
    assignmentType: AssignmentType;
    targets: BulkAssignmentTarget[];
    resources: AssignmentResource[];
    parameters: BulkAssignmentParameters;
    template?: AssignmentTemplate;
    status: 'draft' | 'validating' | 'pending_approval' | 'executing' | 'completed' | 'failed' | 'cancelled';
    progress?: BulkAssignmentProgress;
    conflicts?: AssignmentConflict[];
    results?: BulkAssignmentResult[];

}
export interface AssignmentResource {
    id: string;
    type: AssignmentType;
    name: string;
    description?: string;
    tier?: 'basic' | 'standard' | 'premium' | 'enterprise';
    permissions?: string[];
    restrictions?: string[];
    quotaLimits?: Record<string, number>;
    metadata?: Record<string, any>;

}
export interface BulkAssignmentParameters {
    executionMode: 'immediate' | 'scheduled' | 'staged';
    batchSize: number;
    maxConcurrency: number;
    continueOnError: boolean;
    notifyTargets: boolean;
    scheduledAt?: Date;
    expirationDate?: Date;
    gracePeriod?: number;
    rollbackOnFailure: boolean;
    requireApproval: boolean;
    autoResolveConflicts: boolean;
    customProperties: Record<string, any>;

}
export interface AssignmentTemplate {
    id: string;
    name: string;
    description: string;
    assignmentType: AssignmentType;
    operationType: BulkOperationType;
    defaultParameters: Partial<BulkAssignmentParameters>;
    defaultResources: string[];
    targetFilters: TargetFilter[];
    usage: {
        timesUsed: number;
        lastUsed?: Date;
        successRate: number;
}
    };
    createdBy: string;
    createdAt: Date;
    isSystemTemplate: boolean;

}
export interface TargetFilter {
    field: string;
    operator: 'eq' | 'ne' | 'in' | 'not_in' | 'contains' | 'starts_with';
    value: Error;
    logicalOperator?: 'AND' | 'OR';

}
export interface BulkAssignmentProgress {
    totalTargets: number;
    processedTargets: number;
    successfulAssignments: number;
    failedAssignments: number;
    skippedAssignments: number;
    conflictsResolved: number;
    currentBatch: number;
    totalBatches: number;
    percentComplete: number;
    estimatedTimeRemaining?: number;
    currentStep: string;

}
export interface BulkAssignmentResult {
    targetId: string;
    targetName: string;
    status: 'success' | 'failed' | 'skipped' | 'partial';
    assignedResources: string[];
    errors?: string[];
    warnings?: string[];
    conflictsEncountered?: AssignmentConflict[];
    processingTime: number;
    metadata?: Record<string, any>;

}
export interface BulkAssignmentToolsProps {
    assignmentType: AssignmentType;
    operationType: BulkOperationType;
    availableTargets: BulkAssignmentTarget[];
    availableResources: AssignmentResource[];
    availableTemplates: AssignmentTemplate[];
    onExecute: (operation: BulkAssignmentOperation) => Promise<string>;
    onCancel?: (operationId: string) => Promise<void>;
    onTemplateCreate?: (template: Omit<AssignmentTemplate, 'id' | 'createdAt' | 'usage'>) => Promise<string>;
    readonly?: boolean;

export declare const BulkAssignmentTools: React.FC<BulkAssignmentToolsProps>;
export default BulkAssignmentTools;
//# sourceMappingURL=BulkAssignmentTools.d.ts.map
}