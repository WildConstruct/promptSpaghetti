/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Epic 16 - Contribution Management Service
 * Task: E16-1753114247115-253BF0 - Design contribution architecture
 *
 * Service implementation for managing community contributions through their lifecycle.
 * Integrates workflow management, quality assessment, and publication processes.
 */
import { ContributionSubmission, ContributionRepository, ContributionWorkflow, WorkflowStage, ReviewerAssignment, ReviewFeedbackEntry, QualityGateResult, ApprovalEntry, PublicationSchedule, ContributionEngagement, ContributorStatistics, ContributionSystemMetrics, ContributionStatus } from './ContributionArchitecture';
import { CommunityContentQualityMetrics } from './ContentQualityAssessment';
export declare class ContributionManagementService implements ContributionRepository {
    private apiClient;
    private versionManager;
    private qualityService;
    constructor(apiClient: any);
    submitContribution(submissionData: Omit<ContributionSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<ContributionSubmission>;
    updateContribution(id: string, updates: Partial<ContributionSubmission>): Promise<ContributionSubmission>;
    getContribution(id: string): Promise<ContributionSubmission>;
    getContributionsByUser(userId: string, status?: ContributionStatus): Promise<ContributionSubmission[]>;
    advanceWorkflowStage(contributionId: string, newStage: WorkflowStage, notes?: string): Promise<ContributionWorkflow>;
    assignReviewer(contributionId: string, assignment: ReviewerAssignment): Promise<void>;
    submitReviewFeedback(contributionId: string, feedback: ReviewFeedbackEntry): Promise<void>;
    approveContribution(contributionId: string, approval: ApprovalEntry): Promise<void>;
    runQualityAssessment(contributionId: string): Promise<CommunityContentQualityMetrics>;
    checkQualityGates(contributionId: string): Promise<QualityGateResult[]>;
    schedulePublication(contributionId: string, schedule: PublicationSchedule): Promise<void>;
    publishContribution(contributionId: string): Promise<void>;
    featureContribution(contributionId: string): Promise<void>;
    getContributionAnalytics(contributionId: string): Promise<ContributionEngagement>;
    getContributorStatistics(userId: string): Promise<ContributorStatistics>;
    getSystemMetrics(timeRange?: string): Promise<ContributionSystemMetrics>;
    private selectWorkflowTemplate;
    private initializeWorkflow;
    private initializeEngagement;
    private createQualityGates;
    private mapGateToStage;
    private mapStageToStatus;
    private isValidStageTransition;
    private executeStageActions;
    private evaluateQualityGate;
    private autoAssignReviewers;
    private openCommunityReview;
    private notifyReviewer;
    private notifyContributor;
    private updateReviewerAssignmentStatus;
    private checkReviewCompletion;
    private scheduleAutomaticPublication;
    private sendPublicationNotifications;
    private initializePostPublicationTracking;
    private awardContributorBadge;

//# sourceMappingURL=ContributionManagementService.d.ts.map