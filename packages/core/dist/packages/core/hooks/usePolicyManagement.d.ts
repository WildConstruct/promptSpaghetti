/**
 * React Hook for Policy Management Integration
 *
 * Provides easy-to-use React integration for the unified policy management system.
 * Handles policy evaluation, violation monitoring, and compliance tracking.
 */
import { PolicyManagement, UnifiedPolicy, PolicyDomain, PolicyType, PolicyStatus, PolicyEvaluationResult, PolicyViolation, ComplianceFramework } from '../services/PolicyManagement';
export interface PolicyManagementHookConfig {
    autoEvaluate?: boolean;
    cacheTimeout?: number;
    enableRealTimeUpdates?: boolean;
    complianceFrameworks?: ComplianceFramework[];
}
export interface PolicyEvaluationOptions {
    userId?: string;
    entityType: 'USER' | 'TEMPLATE' | 'PROJECT' | 'TRANSACTION' | 'CONTENT';
    entityId: string;
    operation: {
        type: string;
        parameters: Record<string, any>;
        riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
    contentContext?: {
        historicalPeriod?: string;
        culturalContext?: string;
        accuracyLevel?: 'STRICT' | 'MODERATE' | 'FLEXIBLE';
        expertReviewed?: boolean;
    };
    additionalContext?: Record<string, any>;
}
export declare const usePolicyManagement: (config?: PolicyManagementHookConfig) => {
    policies: UnifiedPolicy[];
    evaluationResults: PolicyEvaluationResult[];
    violations: PolicyViolation[];
    isLoading: boolean;
    error: string;
    loadPolicies: (filters?: {
        domain?: PolicyDomain;
        type?: PolicyType;
        status?: PolicyStatus;
        enabled?: boolean;
    }) => Promise<void>;
    createPolicy: (policyData: Omit<UnifiedPolicy, "id" | "metadata">, createdBy: string) => Promise<UnifiedPolicy>;
    updatePolicy: (policyId: string, updates: Partial<UnifiedPolicy>, updatedBy: string) => Promise<UnifiedPolicy>;
    deletePolicy: (policyId: string, deletedBy: string) => Promise<void>;
    evaluatePolicies: (evaluationOptions: PolicyEvaluationOptions) => Promise<PolicyEvaluationResult[]>;
    checkVFXHistoricalAccuracy: (templateId: string, historicalPeriod: string, culturalContext: string, expertReviewed?: boolean) => Promise<{
        allowed: boolean;
        violations: string[];
        reviewRequired: boolean;
    }>;
    checkDataProtectionCompliance: (userId: string, dataType: string, operation: string, dataClassification: string) => Promise<{
        compliant: boolean;
        frameworks: string[];
        actions: string[];
    }>;
    generateComplianceReport: (framework: ComplianceFramework) => Promise<any>;
    getPolicyStatistics: () => {
        totalPolicies: number;
        activePolicies: number;
        byDomain: Record<string, number>;
        byType: Record<string, number>;
        evaluationMetrics: {
            totalEvaluations: number;
            deniedRequests: number;
            restrictedRequests: number;
            averageEvaluationTime: number;
        };
    };
    getFilteredPolicies: (filters: {
        domain?: PolicyDomain;
        type?: PolicyType;
        status?: PolicyStatus;
        search?: string;
    }) => UnifiedPolicy[];
    getRecentEvaluations: (limit?: number) => PolicyEvaluationResult[];
    getPolicyViolations: (filters?: {
        severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        resolved?: boolean;
        entityType?: "USER" | "TEMPLATE" | "PROJECT" | "TRANSACTION" | "CONTENT";
        limit?: number;
    }) => PolicyViolation[];
    activePolicies: UnifiedPolicy[];
    vfxPolicies: UnifiedPolicy[];
    securityPolicies: UnifiedPolicy[];
    compliancePolicies: UnifiedPolicy[];
    domains: PolicyDomain[];
    types: PolicyType[];
    statuses: PolicyStatus[];
    frameworks: ComplianceFramework[];
    policyCount: number;
    activePolicyCount: number;
    violationCount: number;
    unresolvedViolationCount: number;
    getPolicyById: (id: string) => UnifiedPolicy;
    isPolicyActive: (policyId: string) => boolean;
    policyManager: PolicyManagement;
};
export default usePolicyManagement;
//# sourceMappingURL=usePolicyManagement.d.ts.map