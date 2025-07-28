import { ComplianceFramework } from '../services/PolicyManagement';
export interface PolicyManagementHookConfig {
    autoEvaluate?: boolean;
    cacheTimeout?: number;
    enableRealTimeUpdates?: boolean;
    complianceFrameworks?: ComplianceFramework;
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
export declare const usePolicyManagement: (config?: PolicyManagementHookConfig) => void;
//# sourceMappingURL=usePolicyManagement.d.ts.map