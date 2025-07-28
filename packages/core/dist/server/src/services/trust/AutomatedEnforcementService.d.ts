/**
 * Automated Enforcement Service - Epic 17
 *
 * Implements automated enforcement actions based on trust scores, risk factors,
 * and policy violations in the marketplace ecosystem. Provides real-time
 * enforcement of community standards and security policies.
 *
 * Task: E17-1753114397380-E8827E - Implement automated enforcement
 * Epic: 17 - Backstage Admin Controls
 */
import { Database } from '../../database';
import { TrustScoreService } from './TrustScoreService';
import { AuditService } from '../auth/services/AuditService';
import { UserTrustScore, TemplateTrustScore, TransactionTrustScore } from '../../../../packages/core/types/TrustTypes';
export interface EnforcementAction {
    actionId: string;
    entityType: 'user' | 'template' | 'transaction';
    entityId: string;
    actionType: 'suspend' | 'restrict' | 'flag' | 'require_verification' | 'block_transaction' | 'quarantine_template';
    severity: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    triggeredBy: 'trust_score' | 'risk_factor' | 'fraud_detection' | 'policy_violation' | 'manual_review';
    triggerDetails: unknown;
    autoApplied: boolean;
    actionTaken: boolean;
    actionTimestamp?: Date;
    expiresAt?: Date;
    reviewRequired: boolean;
    adminNotes?: string;
    reversal?: {
        reversedAt: Date;
        reversedBy: string;
        reason: string;
    };
}
export interface EnforcementPolicy {
    policyId: string;
    name: string;
    description: string;
    enabled: boolean;
    triggers: {
        trustScoreThresholds?: {
            suspend: number;
            restrict: number;
            flag: number;
        };
    };
    riskFactorRules?: {
        criticalRiskCount: number;
        highRiskCount: number;
        automaticSuspension: boolean;
    };
    fraudDetectionRules?: {
        fraudScoreThreshold: number;
        suspiciousIndicatorThreshold: number;
    };
}
export interface EnforcementConfig {
    enabled: boolean;
    policies: EnforcementPolicy[];
    notificationSettings: {
        adminAlerts: boolean;
        userNotifications: boolean;
        webhookUrl?: string;
    };
}
export declare class AutomatedEnforcementService {
    private db;
    private trustScoreService;
    private auditService;
    private config;
    constructor(database: Database, trustScoreService: TrustScoreService, auditService: AuditService, config?: EnforcementConfig);
    /**
     * Evaluate and enforce policies for a user trust score
     */
    enforceUserTrustPolicies(userTrustScore: UserTrustScore, triggeredBy?: string): Promise<EnforcementAction[]>;
    /**
     * Evaluate and enforce policies for a template trust score
     */
    enforceTemplateTrustPolicies(templateTrustScore: TemplateTrustScore, triggeredBy?: string): Promise<EnforcementAction[]>;
    /**
     * Evaluate and enforce policies for a transaction
     */
    enforceTransactionPolicies(transactionTrustScore: TransactionTrustScore, triggeredBy?: string): Promise<EnforcementAction[]>;
    /**
     * Process suspicious activity report and take automated actions
     */
    processSuspiciousActivity(report: {
        type: 'fraud' | 'abuse' | 'violation' | 'security' | 'quality';
        severity: 'low' | 'medium' | 'high' | 'critical';
        userId?: string;
        templateId?: string;
        transactionId?: string;
        evidence: string[];
        description: string;
    }): Promise<EnforcementAction[]>;
    private evaluateTrustScoreThresholds;
    private evaluateRiskFactors;
    private evaluateTemplateWarnings;
    private evaluateFraudIndicators;
    private createEnforcementAction;
    private applyEnforcementActions;
    private executeEnforcementAction;
    private applySuspension;
    private applyRestriction;
    private applyFlagging;
    private applyVerificationRequirement;
    private applyTransactionBlock;
    private applyTemplateQuarantine;
    private isUserExempt;
    private getEntityId;
    private getSuspiciousActivityAction;
    private generateActionId;
    private calculateExpirationDate;
    private storeEnforcementAction;
    private logEnforcementDecision;
    private sendEnforcementAlert;
    private getDefaultConfig;
    /**
     * Get enforcement actions for an entity
     */
    getEnforcementActions(entityType: 'user' | 'template' | 'transaction', entityId: string, options?: {
        limit?: number;
        includeExpired?: boolean;
    }): Promise<EnforcementAction[]>;
    /**
     * Manually trigger enforcement evaluation
     */
    triggerEnforcementEvaluation(entityType: 'user' | 'template' | 'transaction', entityId: string): Promise<EnforcementAction[]>;
}
//# sourceMappingURL=AutomatedEnforcementService.d.ts.map