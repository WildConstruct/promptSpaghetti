/**
 * Epic 16 - Community Components Export Index
 * Tasks: E16-1753114247131-3FFAA7 (Version Control) & E16-1753114247130-02122C (Quality Assessment)
 *
 * Central export file for all community content management components.
 */
export { ContentVersionControl } from './ContentVersionControl';
export type { ContentVersionControlProps } from './ContentVersionControl';
export { QualityAssessmentDashboard } from './QualityAssessmentDashboard';
export type { QualityAssessmentDashboardProps } from './QualityAssessmentDashboard';
export type { CommunityContent, ContentVersion, ContentVersionDiff, ContentContributor, ContentQualityScore, ContentImportOptions, ContentExportOptions, ReviewFeedback, PlagiarismResult, FactCheckResult, ContentMediaAttachment, ContentBundle } from '../../community/ContentVersionManager';
export { ContentVersionManager } from '../../community/ContentVersionManager';
export type { CommunityContentQualityMetrics, EditorialQualityMetrics, TechnicalQualityMetrics, ContentEngagementMetrics, CommunityValueMetrics, AutomatedContentAnalysis, EditorialReview, QualityRecommendation, QualityFlag, QualityAssessmentWorkflow, AutomatedIssue } from '../../community/ContentQualityAssessment';
export { ContentQualityAssessmentService, QUALITY_ASSESSMENT_CONFIG } from '../../community/ContentQualityAssessment';
export type ContentVersionControlMode = 'author' | 'editor' | 'reviewer' | 'admin';
export type QualityAssessmentType = 'automated' | 'editorial' | 'community' | 'comprehensive';
export type WorkflowStage = 'automated_analysis' | 'editorial_review' | 'specialist_review' | 'final_approval' | 'published';
export declare const CONTENT_VERSION_DEFAULTS: {
    readonly showEditorialWorkflow: true;
    readonly readOnly: false;
    readonly defaultBranch: "main";
    readonly autoSave: true;
    readonly versioningStrategy: "semantic";
};
export declare const QUALITY_ASSESSMENT_DEFAULTS: {
    readonly showReviewInterface: false;
    readonly readOnly: false;
    readonly assessmentType: QualityAssessmentType;
    readonly autoRunChecks: true;
    readonly confidenceThreshold: 80;
};
export declare const CONTENT_WORKFLOWS: {
    readonly author: {
        readonly stages: readonly ["draft", "review", "published"];
        readonly permissions: readonly ["create", "edit", "submit_review"];
        readonly assessmentType: QualityAssessmentType;
    };
    readonly editorial: {
        readonly stages: readonly ["draft", "automated_check", "editorial_review", "approved", "published"];
        readonly permissions: readonly ["create", "edit", "review", "approve", "publish"];
        readonly assessmentType: QualityAssessmentType;
        readonly qualityGates: {
            readonly minimum_score: 70;
            readonly required_checks: readonly ["grammar", "plagiarism", "factual"];
        };
    };
    readonly enterprise: {
        readonly stages: readonly ["draft", "automated_check", "editorial_review", "specialist_review", "legal_review", "approved", "published"];
        readonly permissions: readonly ["create", "edit", "review", "specialist_review", "legal_review", "approve", "publish"];
        readonly assessmentType: QualityAssessmentType;
        readonly qualityGates: {
            readonly minimum_score: 85;
            readonly required_checks: readonly ["grammar", "plagiarism", "factual", "legal", "accessibility"];
        };
        readonly escalation: {
            readonly auto_escalate_threshold: "high";
            readonly specialist_required_topics: readonly ["technical", "legal", "medical", "financial"];
        };
    };
};
export declare const QUALITY_THRESHOLDS_BY_TYPE: {
    readonly article: {
        readonly minimum_publication_score: 75;
        readonly recommended_score: 85;
        readonly dimensions: {
            readonly editorial: 80;
            readonly technical: 70;
            readonly engagement: 75;
            readonly community: 70;
        };
    };
    readonly tutorial: {
        readonly minimum_publication_score: 80;
        readonly recommended_score: 90;
        readonly dimensions: {
            readonly editorial: 85;
            readonly technical: 85;
            readonly engagement: 80;
            readonly community: 75;
        };
    };
    readonly 'case-study': {
        readonly minimum_publication_score: 75;
        readonly recommended_score: 85;
        readonly dimensions: {
            readonly editorial: 80;
            readonly technical: 70;
            readonly engagement: 85;
            readonly community: 80;
        };
    };
    readonly guide: {
        readonly minimum_publication_score: 85;
        readonly recommended_score: 90;
        readonly dimensions: {
            readonly editorial: 90;
            readonly technical: 80;
            readonly engagement: 80;
            readonly community: 85;
        };
    };
    readonly documentation: {
        readonly minimum_publication_score: 90;
        readonly recommended_score: 95;
        readonly dimensions: {
            readonly editorial: 95;
            readonly technical: 95;
            readonly engagement: 70;
            readonly community: 80;
        };
    };
};
export declare const COMMUNITY_INTEGRATIONS: {
    readonly marketplace: {
        readonly template_integration: true;
        readonly case_study_showcase: true;
        readonly community_ratings: true;
        readonly creator_profiles: true;
    };
    readonly admin: {
        readonly policy_enforcement: true;
        readonly compliance_monitoring: true;
        readonly content_moderation: true;
        readonly analytics_tracking: true;
    };
    readonly platform: {
        readonly user_authentication: true;
        readonly notification_system: true;
        readonly search_indexing: true;
        readonly analytics_collection: true;
    };
};
export interface CommunityComponentEvents {
    'version:created': {
        version: ContentVersion;
        contentId: string;
    };
    'version:published': {
        version: ContentVersion;
        contentId: string;
    };
    'version:reviewed': {
        version: ContentVersion;
        feedback: ReviewFeedback;
    };
    'quality:assessed': {
        metrics: CommunityContentQualityMetrics;
        contentId: string;
    };
    'quality:improved': {
        oldScore: number;
        newScore: number;
        contentId: string;
    };
    'quality:flagged': {
        flag: QualityFlag;
        contentId: string;
    };
    'workflow:updated': {
        workflow: QualityAssessmentWorkflow;
        contentId: string;
    };
    'workflow:escalated': {
        workflow: QualityAssessmentWorkflow;
        reason: string;
    };
    'workflow:completed': {
        workflow: QualityAssessmentWorkflow;
        outcome: string;
    };
}
export declare const CommunityUtils: {
    readonly compareVersions: (a: string, b: string) => number;
    readonly calculateOverallScore: (dimensions: Record<string, number>) => number;
    readonly calculateGrade: (score: number) => "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
    readonly validateWorkflowTransition: (currentStage: WorkflowStage, targetStage: WorkflowStage, userRole: ContentVersionControlMode) => boolean;
};
//# sourceMappingURL=index.d.ts.map