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
import { ContentVersion } from '../../community/ContentVersionManager';
export type { CommunityContentQualityMetrics, EditorialQualityMetrics, TechnicalQualityMetrics, ContentEngagementMetrics, CommunityValueMetrics, AutomatedContentAnalysis, EditorialReview, QualityRecommendation, QualityFlag, QualityAssessmentWorkflow, AutomatedIssue } from '../../community/ContentQualityAssessment';
export { ContentQualityAssessmentService, QUALITY_ASSESSMENT_CONFIG } from '../../community/ContentQualityAssessment';
export type ContentVersionControlMode = 'author' | 'editor' | 'reviewer' | 'admin';
export type QualityAssessmentType = 'automated' | 'editorial' | 'community' | 'comprehensive';
export type WorkflowStage = 'automated_analysis' | 'editorial_review' | 'specialist_review' | 'final_approval' | 'published';
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
export declare     calculateOverallScore: (dimensions: Record<string, number>) => number;
    calculateGrade: (score: number) => "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
    validateWorkflowTransition: (
      currentStage: WorkflowStage,
      targetStage: WorkflowStage,
      userRole: ContentVersionControlMode
    ) => boolean;
};
//# sourceMappingURL=index.d.ts.map