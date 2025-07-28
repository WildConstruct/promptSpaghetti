/**
 * Unified Policy Management System - E17-1753114397370-5ABAA8
 *
 * Comprehensive policy management system for Wild Construct's VFX and content
 * generation ecosystem. Integrates security, compliance, governance, and quality
 * policies across all platform domains.
 *
 * Key Features:
 * - Multi-domain policy management (security, content, quality, compliance)
 * - Dynamic policy evaluation and enforcement
 * - Compliance framework integration (GDPR, SOX, HIPAA, ISO 27001)
 * - Historical accuracy policies for VFX content generation
 * - Role-based access control and data classification
 * - Real-time policy monitoring and violation detection
 */
import { EventEmitter } from 'events';
import { SecurityDashboardPolicies } from '../../../server/src/services/security/SecurityDashboardPolicies';
import { AutomatedEnforcementService } from '../../../server/src/services/trust/AutomatedEnforcementService';
export declare enum PolicyDomain {
    SECURITY = "SECURITY",
    CONTENT = "CONTENT",
    QUALITY = "QUALITY",
    COMPLIANCE = "COMPLIANCE",
    VFX_PIPELINE = "VFX_PIPELINE",
    DATA_PROTECTION = "DATA_PROTECTION",
    ACCESS_CONTROL = "ACCESS_CONTROL",
    MARKETPLACE = "MARKETPLACE",
    export,
    enum,
    PolicyType
}
export interface PolicyCondition {
    id: string;
    name: string;
    conditionType: 'PREREQUISITE' | 'CONTEXT' | 'STATE' | 'TEMPORAL' | 'ENVIRONMENTAL';
    logic: {
        expression: string;
        parameters: Record<string, any>;
        evaluationMode: 'AND' | 'OR' | 'NOT';
    };
    evaluationContext: {
        requiredData: string;
        externalServices?: string;
        cacheDuration?: number;
    };
    weight: number;
    critical: boolean;
}
export interface PolicyAction {
    id: string;
    name: string;
    actionType: 'ALLOW' | 'DENY' | 'RESTRICT' | 'ESCALATE' | 'NOTIFY' | 'LOG' | 'TRANSFORM';
    configuration: {
        parameters: Record<string, any>;
        targetEntities: string;
        executionMode: 'IMMEDIATE' | 'DEFERRED' | 'SCHEDULED';
        rollbackEnabled: boolean;
    };
    integrations?: {
        services: string;
        webhooks: string;
        notifications: string;
    };
    priority: number;
    enabled: boolean;
}
export interface PolicyException {
    id: string;
    name: string;
    description: string;
    criteria: {
        userIds?: string;
        roleIds?: string;
        entityIds?: string;
        contextConditions?: Record<string, any>;
    };
    scope: {
        rules?: string;
        actions?: string;
        fullPolicy?: boolean;
    };
    governance: {
        approvalRequired: boolean;
        approvedBy?: string;
        approvalDate?: Date;
        expiresAt?: Date;
        reviewRequired: boolean;
    };
    active: boolean;
}
export interface TimeBasedRule {
    timePeriods: string;
    seasonality: boolean;
    historicalContext: boolean;
}
export interface LocationBasedRule {
    regions: string;
    geopoliticalContext: boolean;
    culturalConsiderations: string;
}
export interface RoleBasedRule {
    roles: string;
    permissions: string;
    clearanceLevel: string;
}
export interface ContentBasedRule {
    contentTypes: string;
    qualityMetrics: Record<string, number>;
    historicalAccuracy: boolean;
}
export interface PolicyEvaluationContext {
    requestId: string;
    timestamp: Date;
    userId?: string;
    entityType: 'USER' | 'TEMPLATE' | 'PROJECT' | 'TRANSACTION' | 'CONTENT';
    entityId: string;
    sessionData: {
        ipAddress: string;
        userAgent: string;
        geolocation?: string;
        authenticationMethod: string;
    };
    operation: {
        type: string;
        parameters: Record<string, any>;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
    contentContext?: {
        historicalPeriod?: string;
        culturalContext?: string;
        accuracyLevel?: string;
        expertReviewed?: boolean;
    };
    additionalContext: Record<string, any>;
}
export interface PolicyEvaluationResult {
    requestId: string;
    evaluationId: string;
    timestamp: Date;
    policyId: string;
    policyName: string;
    result: 'ALLOW' | 'DENY' | 'RESTRICT' | 'ESCALATE';
    confidence: number;
    ruleResults: Array<{}, ruleId>;
    string: any;
    ruleName: string;
    result: 'PASS' | 'FAIL' | 'WARN';
    score: number;
    details: any;
}
export interface PolicyViolation {
    id: string;
    policyId: string;
    policyName: string;
    violation: {
        type: 'RULE_VIOLATION' | 'CONDITION_FAILURE' | 'THRESHOLD_EXCEEDED' | 'PATTERN_DETECTED';
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        description: string;
        details: any;
    };
    context: PolicyEvaluationContext;
    impact: {
        affectedEntities: string;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        businessImpact: string;
        complianceImpact: string;
    };
    response: {
        actionsTaken: string;
        escalated: boolean;
        resolved: boolean;
        resolvedAt?: Date;
        resolvedBy?: string;
    };
    metadata: {
        detectedAt: Date;
        detectedBy: string;
        reportedAt?: Date;
        acknowledgedAt?: Date;
        tags: string;
    };
}
export declare class PolicyManagement extends EventEmitter {
    private policies;
    private evaluationCache;
    private violations;
    private performanceMetrics;
    private securityDashboardPolicies;
    private automatedEnforcementService;
    constructor();
    securityDashboardPolicies?: SecurityDashboardPolicies;
    automatedEnforcementService?: AutomatedEnforcementService;
    super(): any;
}
//# sourceMappingURL=PolicyManagement.d.ts.map