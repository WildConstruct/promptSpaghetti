/**
 * Centralized Access Control Service
 *
 * Comprehensive access control service that implements:
 * - Role-Based Access Control (RBAC)
 * - Attribute-Based Access Control (ABAC)
 * - Data Classification-Aware Access Policies
 * - Real-time access decisions
 * - Audit logging and compliance
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-738 - Create centralized access control service
 */
import { EventEmitter } from 'events';
import { AccessDecision, PolicyObligation, DataOperation } from './DataClassificationAccessControl';
import { DataClassificationLevel } from '../types/DataClassification';
import { InheritanceFramework } from './DelegationInheritanceRules';
import { DataClassifier } from './DataClassifier';
export interface AccessControlConfig {
    enableRBAC: boolean;
    enableABAC: boolean;
    enableDelegation: boolean;
    enableInheritance: boolean;
    cacheDecisions: boolean;
    cacheTTL: number;
    auditAllDecisions: boolean;
    realTimeMonitoring: boolean;
    strictCompliance: boolean;
    emergencyBypass: boolean;
    performanceMode: 'HIGH_SECURITY' | 'BALANCED' | 'HIGH_PERFORMANCE';
}
export interface AccessControlMetrics {
    totalRequests: number;
    approvedRequests: number;
    deniedRequests: number;
    cacheHitRate: number;
    averageDecisionTime: number;
    p95DecisionTime: number;
    rbacDecisions: number;
    abacDecisions: number;
    delegatedDecisions: number;
    emergencyAccess: number;
    complianceViolations: number;
}
export interface CacheEntry {
    decision: AccessDecision;
    timestamp: Date;
    ttl: number;
    requestHash: string;
}
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    requestId: string;
    userId: string;
    resourceId: string;
    operation: DataOperation;
    decision: 'PERMIT' | 'DENY' | 'INDETERMINATE';
    reason: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    classification: DataClassificationLevel;
    delegated: boolean;
    emergency: boolean;
    obligations: PolicyObligation;
    decisionTime: number;
    metadata: Record<string, any>;
}
export interface SecurityAlert {
    id: string;
    type: 'UNAUTHORIZED_ACCESS' | 'POLICY_VIOLATION' | 'ANOMALOUS_BEHAVIOR' | 'DELEGATION_ABUSE' | 'EMERGENCY_ACCESS';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: Date;
    userId: string;
    resourceId: string;
    description: string;
    context: Record<string, any>;
    requiresResponse: boolean;
    autoRemediation: boolean;
}
export declare class CentralizedAccessControlService extends EventEmitter {
    private config;
    private rbacEngine;
    private abacEngine;
    private delegationEngine;
    private dataClassifier;
    private decisionCache;
    private auditLog;
    private metrics;
    private policies;
    constructor();
    config: AccessControlConfig;
    inheritanceFramework: InheritanceFramework;
    dataClassifier: DataClassifier;
    super(): any;
}
//# sourceMappingURL=CentralizedAccessControlService.d.ts.map