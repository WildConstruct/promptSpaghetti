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
    MARKETPLACE = "MARKETPLACE"
}
export declare enum PolicyType {
    SECURITY_DASHBOARD = "SECURITY_DASHBOARD",
    AUTOMATED_ENFORCEMENT = "AUTOMATED_ENFORCEMENT",
    CONTENT_GENERATION = "CONTENT_GENERATION",
    HISTORICAL_ACCURACY = "HISTORICAL_ACCURACY",
    DATA_CLASSIFICATION = "DATA_CLASSIFICATION",
    USER_ACCESS = "USER_ACCESS",
    TEMPLATE_QUALITY = "TEMPLATE_QUALITY",
    TRANSACTION_SECURITY = "TRANSACTION_SECURITY",
    COMPLIANCE_FRAMEWORK = "COMPLIANCE_FRAMEWORK",
    VFX_WORKFLOW = "VFX_WORKFLOW"
}
export declare enum PolicyStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    DEPRECATED = "DEPRECATED",
    EMERGENCY = "EMERGENCY"
}
export declare enum ComplianceFramework {
    GDPR = "GDPR",
    CCPA = "CCPA",
    SOX = "SOX",
    HIPAA = "HIPAA",
    ISO_27001 = "ISO_27001",
    PCI_DSS = "PCI_DSS",
    ENTERTAINMENT_INDUSTRY = "ENTERTAINMENT_INDUSTRY"
}
export interface UnifiedPolicy {
    id: string;
    name: string;
    description: string;
    domain: PolicyDomain;
    type: PolicyType;
    status: PolicyStatus;
    configuration: {
        rules: PolicyRule[];
        conditions: PolicyCondition[];
        actions: PolicyAction[];
        exceptions: PolicyException[];
    };
    scope: {
        workspaceIds?: string[];
        projectIds?: string[];
        userRoles?: string[];
        contentTypes?: string[];
        vfxPipelines?: string[];
    };
    enforcement: {
        mode: 'ENFORCE' | 'WARN' | 'MONITOR' | 'DISABLED';
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        automated: boolean;
        reviewRequired: boolean;
    };
    compliance: {
        frameworks: ComplianceFramework[];
        requirements: string[];
        auditRequired: boolean;
        reportingRequired: boolean;
    };
    historicalAccuracy?: {
        timePeriods: string[];
        regions: string[];
        cultures: string[];
        accuracyLevel: 'STRICT' | 'MODERATE' | 'FLEXIBLE';
        expertValidationRequired: boolean;
    };
    metadata: {
        version: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        lastEvaluated?: Date;
        evaluationCount: number;
        violationCount: number;
        tags: string[];
    };
    dependencies?: {
        requiredPolicies: string[];
        conflictingPolicies: string[];
        supersededBy?: string;
    };
}
export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    ruleType: 'VALIDATION' | 'RESTRICTION' | 'REQUIREMENT' | 'THRESHOLD' | 'PATTERN';
    logic: {
        field: string;
        operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN' | 'REGEX' | 'CUSTOM';
        value: any;
        customFunction?: string;
    };
    context?: {
        timeBasedRules?: TimeBasedRule[];
        locationBasedRules?: LocationBasedRule[];
        roleBasedRules?: RoleBasedRule[];
        contentBasedRules?: ContentBasedRule[];
    };
    weight: number;
    enabled: boolean;
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
        requiredData: string[];
        externalServices?: string[];
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
        targetEntities: string[];
        executionMode: 'IMMEDIATE' | 'DEFERRED' | 'SCHEDULED';
        rollbackEnabled: boolean;
    };
    integrations?: {
        services: string[];
        webhooks: string[];
        notifications: string[];
    };
    priority: number;
    enabled: boolean;
}
export interface PolicyException {
    id: string;
    name: string;
    description: string;
    criteria: {
        userIds?: string[];
        roleIds?: string[];
        entityIds?: string[];
        contextConditions?: Record<string, any>;
    };
    scope: {
        rules?: string[];
        actions?: string[];
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
    timePeriods: string[];
    seasonality: boolean;
    historicalContext: boolean;
}
export interface LocationBasedRule {
    regions: string[];
    geopoliticalContext: boolean;
    culturalConsiderations: string[];
}
export interface RoleBasedRule {
    roles: string[];
    permissions: string[];
    clearanceLevel: string;
}
export interface ContentBasedRule {
    contentTypes: string[];
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
    ruleResults: Array<{
        ruleId: string;
        ruleName: string;
        result: 'PASS' | 'FAIL' | 'WARN';
        score: number;
        details: any;
    }>;
    conditionResults: Array<{
        conditionId: string;
        conditionName: string;
        result: 'MET' | 'NOT_MET' | 'ERROR';
        details: any;
    }>;
    triggeredActions: Array<{
        actionId: string;
        actionType: string;
        executed: boolean;
        result?: any;
        error?: string;
    }>;
    appliedExceptions: Array<{
        exceptionId: string;
        exceptionName: string;
        scope: string[];
    }>;
    complianceStatus: {
        frameworks: Array<{
            framework: ComplianceFramework;
            compliant: boolean;
            violations: string[];
        }>;
    };
    performance: {
        evaluationTimeMs: number;
        cacheHit: boolean;
        externalServiceCalls: number;
    };
    metadata: {
        evaluatedBy: string;
        reviewRequired: boolean;
        escalationRequired: boolean;
        auditRequired: boolean;
    };
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
        affectedEntities: string[];
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        businessImpact: string;
        complianceImpact: string[];
    };
    response: {
        actionsTaken: string[];
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
        tags: string[];
    };
}
/**
 * Unified Policy Management System
 */
export declare class PolicyManagement extends EventEmitter {
    private policies;
    private evaluationCache;
    private violations;
    private performanceMetrics;
    private securityDashboardPolicies;
    private automatedEnforcementService;
    constructor(
      securityDashboardPolicies?: SecurityDashboardPolicies,
      automatedEnforcementService?: AutomatedEnforcementService
    );
    /**
     * Create a new policy
     */
    createPolicy(policyData: Omit<UnifiedPolicy, 'id' | 'metadata'>, createdBy: string): Promise<UnifiedPolicy>;
    /**
     * Update an existing policy
     */
    updatePolicy(policyId: string, updates: Partial<UnifiedPolicy>, updatedBy: string): Promise<UnifiedPolicy>;
    /**
     * Delete a policy
     */
    deletePolicy(policyId: string, deletedBy: string): Promise<void>;
    /**
     * Evaluate policies for a given context
     */
    evaluatePolicies(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult[]>;
    private evaluatePolicy;
    private evaluateRules;
    private evaluateRule;
    private evaluateRuleContext;
    private evaluateTimeBasedRule;
    private evaluateLocationBasedRule;
    private evaluateRoleBasedRule;
    private evaluateContentBasedRule;
    private initializeDefaultPolicies;
    private createDefaultPolicy;
    private createMockEnforcementService;
    private generatePolicyId;
    private generateEvaluationId;
    private generateCacheKey;
    private isCacheValid;
    private getCurrentSeason;
    private extractFieldValue;
    private extractQualityMetric;
    /**
     * Get all policies
     */
    getPolicies(filters?: {
        domain?: PolicyDomain;
        type?: PolicyType;
        status?: PolicyStatus;
        enabled?: boolean;
    }): UnifiedPolicy[];
    /**
     * Get policy by ID
     */
    getPolicy(policyId: string): UnifiedPolicy | null;
    /**
     * Generate compliance report
     */
    generateComplianceReport(framework: ComplianceFramework): Promise<any>;
    private validatePolicy;
    private findPoliciesDependingOn;
    private getApplicablePolicies;
    private isPolicyApplicable;
    private evaluateExceptions;
    private evaluateConditions;
    private calculatePolicyResult;
    private executeActions;
    private evaluateCompliance;
    private shouldRequireReview;
    private shouldEscalate;
    private finalizeResult;
    private consolidateResults;
    private recordPerformanceMetrics;
    private recordViolation;
    private evaluateCustomFunction;
    private setupEventListeners;
    private startBackgroundTasks;
    private cleanupCache;
    private collectPerformanceMetrics;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export default PolicyManagement;
//# sourceMappingURL=PolicyManagement.d.ts.map