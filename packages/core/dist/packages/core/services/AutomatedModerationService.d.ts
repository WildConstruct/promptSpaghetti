/**
 * Automated Moderation Service
 * Epic 17.2 - Content Management System
 * Task: E17-1753114396911-E56A3A
 *
 * Comprehensive automated moderation system that integrates with existing
 * policy management, trust scoring, and enforcement frameworks.
 */
import { PolicyCheckersService, PolicyCheckResult } from './PolicyCheckersService';
import { TrustScoreService } from './TrustScoreService';
import { AutomatedEnforcementService } from './AutomatedEnforcementService';
export type ModerationAction = 'approve' | 'reject' | 'flag_review' | 'auto_fix' | 'quarantine' | 'escalate' | 'warn_user' | 'suspend_user' | 'block_content';
export type ModerationReason = 'policy_violation' | 'quality_issues' | 'safety_concerns' | 'spam_detected' | 'inappropriate_content' | 'copyright_violation' | 'trust_score_low' | 'automated_flag' | 'community_reports';
export type ContentType = 'template' | 'prompt' | 'comment' | 'review' | 'user_profile' | 'marketplace_listing' | 'tutorial_content';
export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface ModerationRequest {
    id: string;
    contentId: string;
    contentType: ContentType;
    content: {
        title?: string;
        description?: string;
        body?: string;
        metadata?: Record<string, any>;
    };
    author: {
        userId: string;
        userEmail?: string;
        trustScore?: number;
        previousViolations?: number;
        accountAge?: number;
    };
    context: {
        source: string;
        timestamp: string;
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
    };
    priority?: 'normal' | 'high' | 'urgent';
    skipCache?: boolean;
}
export interface ModerationResult {
    id: string;
    requestId: string;
    decision: ModerationAction;
    confidence: number;
    severity: ModerationSeverity;
    reasons: ModerationReason;
    explanation: string;
    policyResults: PolicyCheckResult;
    policyViolations: number;
    overallComplianceScore: number;
    mlAnalysis?: {
        toxicityScore: number;
        spamProbability: number;
        sentimentScore: number;
        languageQuality: number;
        contentSimilarity?: number;
    };
    trustAnalysis: {
        authorTrustScore: number;
        trustTrend: 'increasing' | 'stable' | 'decreasing';
        riskFactors: string;
        historicalViolations: number;
    };
    recommendedActions: Array<{}, action>;
    ModerationAction: any;
    reason: string;
    priority: number;
    automated: boolean;
}
export interface ModerationRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: number;
    contentTypes: ContentType;
    triggers: {
        policyViolation?: boolean;
        trustScoreBelow?: number;
        mlFlagThreshold?: number;
        communityReports?: number;
        keywordMatches?: string;
    };
    actions: Array<{}, condition>;
    string: any;
    action: ModerationAction;
    parameters?: Record<string, any>;
}
export interface ModerationWorkflow {
    id: string;
    name: string;
    contentTypes: ContentType;
    steps: ModerationWorkflowStep;
    enabled: boolean;
}
export interface ModerationWorkflowStep {
    id: string;
    name: string;
    type: 'automated_check' | 'ml_analysis' | 'policy_check' | 'human_review' | 'action_execution';
    configuration: Record<string, any>;
    conditions: string;
    timeoutMs?: number;
    retryCount?: number;
}
export interface ModerationQueue {
    id: string;
    name: string;
    filters: {
        contentTypes?: ContentType;
        severityLevels?: ModerationSeverity;
        requiresReview?: boolean;
        assignedTo?: string;
    };
    priorityRules: Array<{}, condition>;
    string: any;
    priority: number;
}
export declare class AutomatedModerationService {
    private policyCheckersService;
    private trustScoreService;
    private enforcementService;
    private moderationRules;
    private moderationQueues;
    private cache;
    constructor();
    policyCheckersService: PolicyCheckersService;
    trustScoreService: TrustScoreService;
    enforcementService: AutomatedEnforcementService;
}
//# sourceMappingURL=AutomatedModerationService.d.ts.map