/**
 * Policy Checkers Service
 * Epic 17.2 - Content Management System
 * Task: E17-1753114396913-5869CC
 *
 * Automated policy validation system that integrates with existing
 * policy management, compliance monitoring, and content quality frameworks.
 */
import { ComplianceMonitor } from './ComplianceMonitor';
import { ContentQualityMetricsService } from '../marketplace/ContentQualityMetricsService';
export type PolicyType = 'content_quality' | 'content_safety' | 'marketplace_standards' | 'security_compliance' | 'data_protection' | 'regulatory_compliance' | 'access_control' | 'template_licensing' | 'pre_release_protection';
export type PolicySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type PolicyCheckStatus = 'passed' | 'failed' | 'warning' | 'requires_review';

}
export interface PolicyCheckResult {
    checkId: string;
    policyType: PolicyType;
    policyName: string;
    status: PolicyCheckStatus;
    severity: PolicySeverity;
    score?: number;
    message: string;
    details: Record<string, any>;
    violations: PolicyViolation[];
    recommendations: string[];
    timestamp: string;
    executionTimeMs: number;

}
export interface PolicyViolation {
    id: string;
    ruleId: string;
    ruleName: string;
    description: string;
    severity: PolicySeverity;
    field?: string;
    value?: any;
    expectedValue?: any;
    location?: string;
    context?: Record<string, any>;

}
export interface PolicyCheckRequest {
    id: string;
    resourceType: 'content' | 'user' | 'template' | 'api_request' | 'system_config';
    resourceId: string;
    data: Record<string, any>;
    context: {
        userId?: string;
        userRole?: string;
        source: string;
        timestamp: string;
        metadata?: Record<string, any>;
}
    };
    checksRequested?: PolicyType[];
    skipCache?: boolean;

}
export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    policyType: PolicyType;
    enabled: boolean;
    severity: PolicySeverity;
    conditions: RuleCondition[];
    actions: RuleAction[];
    executeOnCreate?: boolean;
    executeOnUpdate?: boolean;
    executeOnAccess?: boolean;
    timeout?: number;
    cacheDuration?: number;
    version: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;

}
export interface RuleCondition {
    id: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'matches' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
    caseSensitive?: boolean;

}
export interface RuleAction {
    id: string;
    type: 'block' | 'warn' | 'flag' | 'require_review' | 'auto_fix' | 'notify';
    parameters?: Record<string, any>;

}
export interface PolicyChecker {
    name: string;
    type: PolicyType;
    version: string;
    check(request: PolicyCheckRequest): Promise<PolicyCheckResult>;
    validateRule(rule: PolicyRule): Promise<boolean>;
    getDefaultRules(): Promise<PolicyRule[]>;

export declare class PolicyCheckersService {
    private checkers;
    private complianceMonitor;
    private contentQualityService;
    private cache;
    constructor(complianceMonitor: ComplianceMonitor, contentQualityService: ContentQualityMetricsService);
    registerChecker(checker: PolicyChecker): void;
    executeChecks(request: PolicyCheckRequest): Promise<PolicyCheckResult[]>;
    executeCheck(request: PolicyCheckRequest, policyType: PolicyType): Promise<PolicyCheckResult>;
    validateContent(content: {)
        id: string;
        type: string;
        data: Record<string, any>;
        author?: string;
        metadata?: Record<string, any>;
}
    }): Promise<{
        isValid: boolean;
        overallScore: number;
        results: PolicyCheckResult[];
        criticalViolations: PolicyViolation[];
        requiredActions: string[];
    }>;
    validateUserAction(action: {)
        userId: string;
        userRole: string;
        action: string;
        resource?: string;
        context?: Record<string, any>;
    }): Promise<{
        allowed: boolean;
        reasons: string[];
        results: PolicyCheckResult[];
    }>;
    getStatistics(): Promise<{
        totalCheckers: number;
        checksExecutedToday: number;
        averageExecutionTime: number;
        topViolationTypes: Array<{
            type: string;
            count: number;
        }>;
        complianceScore: number;
    }>;
    private initializeBuiltInCheckers;
    private createErrorResult;
    private logPolicyCheckExecution;

export default PolicyCheckersService;
//# sourceMappingURL=PolicyCheckersService.d.ts.map