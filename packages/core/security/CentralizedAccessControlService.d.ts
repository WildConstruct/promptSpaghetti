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
import { 
  AccessRequest,
  AccessDecision,
  RBACDecision,
  ABACDecision,
  SubjectAttributes,
  ClassificationAccessPolicy,
  PolicyObligation,
  DataOperation,
  DataClassificationLevel
} from './DataClassificationAccessControl';
import { InheritanceFramework, EffectivePermissions } from './DelegationInheritanceRules';
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
    obligations: PolicyObligation[];
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
/**
 * Main Access Control Service Implementation
 */
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
    constructor(
      config: AccessControlConfig,
      inheritanceFramework: InheritanceFramework,
      dataClassifier: DataClassifier
    );
    /**
     * Main access control decision method
     */
    evaluateAccess(request: AccessRequest): Promise<AccessDecision>;
    /**
     * Evaluate RBAC decision
     */
    evaluateRBAC(request: AccessRequest): Promise<RBACDecision>;
    /**
     * Evaluate ABAC decision
     */
    evaluateABAC(request: AccessRequest): Promise<ABACDecision>;
    /**
     * Get effective permissions including delegation and inheritance
     */
    getEffectivePermissions(subject: SubjectAttributes): Promise<EffectivePermissions>;
    /**
     * Add or update access policy
     */
    addPolicy(policy: ClassificationAccessPolicy): void;
    /**
     * Remove access policy
     */
    removePolicy(policyId: string): boolean;
    /**
     * Get current metrics
     */
    getMetrics(): AccessControlMetrics;
    /**
     * Get audit log entries
     */
    getAuditLog(limit?: number, offset?: number, filters?: Partial<AuditLogEntry>): AuditLogEntry[];
    /**
     * Clear decision cache
     */
    clearCache(): void;
    /**
     * Validate access request
     */
    private validateRequest;
    /**
     * Check if this is an emergency access request
     */
    private isEmergencyAccess;
    /**
     * Handle emergency access with special procedures
     */
    private handleEmergencyAccess;
    /**
     * Get basic permissions without delegation/inheritance
     */
    private getBasicPermissions;
    /**
     * Get permissions for a specific role and classification level
     */
    private getRolePermissions;
    /**
     * Combine RBAC and ABAC decisions
     */
    private combineDecisions;
    /**
     * Get monitoring requirements based on classification level
     */
    private getClassificationMonitoring;
    /**
     * Check compliance requirements
     */
    private checkCompliance;
    /**
     * Calculate risk level for the access request
     */
    private calculateRiskLevel;
    /**
     * Apply policy obligations
     */
    private applyObligations;
    /**
     * Send notification based on obligation
     */
    private sendNotification;
    /**
     * Enforce encryption obligation
     */
    private enforceEncryption;
    /**
     * Setup monitoring based on obligation
     */
    private setupMonitoring;
    /**
     * Generate cache key for request
     */
    private generateRequestHash;
    /**
     * Get cached decision if valid
     */
    private getCachedDecision;
    /**
     * Cache access decision
     */
    private cacheDecision;
    /**
     * Clean up expired cache entries
     */
    private cleanupCache;
    /**
     * Create access decision object
     */
    private createDecision;
    /**
     * Record access decision in audit log
     */
    private recordDecision;
    /**
     * Update service metrics
     */
    private updateMetrics;
    /**
     * Trigger real-time monitoring
     */
    private triggerMonitoring;
    /**
     * Emit security alert
     */
    private emitSecurityAlert;
    /**
     * Initialize service metrics
     */
    private initializeMetrics;
    /**
     * Load default access control policies
     */
    private loadDefaultPolicies;
    /**
     * Create default classification-based policies
     */
    private createDefaultPolicies;
    /**
     * Start periodic maintenance tasks
     */
    private startPeriodicTasks;
    /**
     * Reset hourly metrics
     */
    private resetHourlyMetrics;
    /**
     * Cleanup old audit log entries
     */
    private cleanupAuditLog;
    /**
     * Generate unique audit ID
     */
    private generateAuditId;
    /**
     * Generate unique alert ID
     */
    private generateAlertId;
    /**
     * Cleanup resources and stop service
     */
    destroy(): void;
}
export default CentralizedAccessControlService;
//# sourceMappingURL=CentralizedAccessControlService.d.ts.map