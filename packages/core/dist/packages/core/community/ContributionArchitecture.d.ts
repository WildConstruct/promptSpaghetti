/**
 * Epic 16 - Community Contribution Architecture
 * Task: E16-1753114247115-253BF0 - Design contribution architecture
 *
 * Foundational architecture for community members to contribute content to the knowledge base.
 * Integrates with existing version control and quality assessment systems.
 */
import { CommunityContent } from './ContentVersionManager';
import { CommunityContentQualityMetrics } from './ContentQualityAssessment';
export type ContributionType = 'article' | 'tutorial' | 'case-study' | 'guide' | 'documentation' | 'example' | 'template' | 'resource' | 'translation' | 'update';
export type ContributionStatus = 'draft' | 'submitted' | 'under_review' | 'revision_needed' | 'approved' | 'published' | 'featured' | 'archived' | 'rejected';
export type ContributorRole = 'author' | 'co-author' | 'editor' | 'reviewer' | 'translator' | 'maintainer' | 'subject_expert';
export type ContributionCategory = 'getting-started' | 'tutorials' | 'best-practices' | 'case-studies' | 'troubleshooting' | 'advanced' | 'tools-resources' | 'community' | 'official' | 'experimental';
export interface ContributionSubmission {
    id: string;
    title: string;
    description: string;
    type: ContributionType;
    category: ContributionCategory;
    content: CommunityContent;
    submission: {
        submitted_by: string;
        submitted_at: string;
        submission_notes?: string;
        intended_audience: string;
        learning_objectives?: string;
        prerequisites?: string;
        estimated_completion_time?: number;
    };
    status: ContributionStatus;
    workflow: ContributionWorkflow;
    quality_assessment?: CommunityContentQualityMetrics;
    review_feedback: ReviewFeedbackEntry;
    contributors: ContributionContributor;
    attribution: ContributionAttribution;
    engagement: ContributionEngagement;
    publishing: PublishingConfiguration;
    monetization?: MonetizationConfiguration;
    version_history: string;
    current_version_id: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    featured_at?: string;
}
export interface ContributionWorkflow {
    current_stage: WorkflowStage;
    assigned_reviewers: string;
    review_deadlines: Record<string, string>;
    escalation_level: 'normal' | 'priority' | 'urgent';
    stage_history: WorkflowStageEntry;
    reviewer_assignments: ReviewerAssignment;
    quality_gates: QualityGate;
    quality_gate_results: QualityGateResult;
    approval_chain: ApprovalEntry;
    publication_schedule?: PublicationSchedule;
}
export type WorkflowStage = 'submission' | 'intake_review' | 'quality_check' | 'editorial_review' | 'technical_review' | 'community_review' | 'final_approval' | 'publication' | 'post_publication';
export interface WorkflowStageEntry {
    stage: WorkflowStage;
    entered_at: string;
    completed_at?: string;
    completed_by?: string;
    duration_hours?: number;
    notes?: string;
    outcome: 'completed' | 'skipped' | 'failed' | 'escalated';
}
export interface ReviewerAssignment {
    reviewer_id: string;
    reviewer_name: string;
    review_type: 'editorial' | 'technical' | 'subject_matter' | 'community' | 'accessibility';
    assigned_at: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'declined';
    expertise_areas: string;
    workload_capacity: number;
}
export interface QualityGate {
    name: string;
    type: 'automated' | 'manual' | 'hybrid';
    criteria: QualityGateCriteria;
    required: boolean;
    stage: WorkflowStage;
    timeout_hours?: number;
}
export interface QualityGateCriteria {
    minimum_score?: number;
    required_checks: string;
    blocking_issues: string;
    reviewer_consensus?: number;
    automated_thresholds: Record<string, number>;
}
export interface QualityGateResult {
    gate_name: string;
    passed: boolean;
    score?: number;
    issues_found: string;
    recommendations: string;
    checked_at: string;
    checked_by?: string;
    retry_count: number;
}
export interface ApprovalEntry {
    approver_id: string;
    approver_name: string;
    approver_role: string;
    approved_at: string;
    approval_type: 'conditional' | 'full' | 'escalated';
    conditions?: string;
    notes?: string;
}
export interface PublicationSchedule {
    scheduled_date?: string;
    publication_priority: 'low' | 'medium' | 'high' | 'urgent';
    target_channels: PublicationChannel;
    embargo_until?: string;
    auto_publish: boolean;
    notification_settings: NotificationConfiguration;
}
export type PublicationChannel = 'knowledge_base' | 'community_forum' | 'newsletter' | 'social_media' | 'rss_feed' | 'api_endpoints' | 'mobile_app';
export interface ContributionContributor {
    user_id: string;
    name: string;
    email?: string;
    role: ContributorRole;
    contribution_type: string;
    contribution_percentage: number;
    attribution_visible: boolean;
    contact_allowed: boolean;
    profile: {
        bio?: string;
        expertise_areas: string;
        website?: string;
        social_links: Record<string, string>;
        preferred_attribution: string;
    };
    contribution_date: string;
    previous_contributions: number;
    reputation_score: number;
}
export interface ContributionAttribution {
    attribution_model: 'individual' | 'collaborative' | 'organizational' | 'anonymous';
    primary_author: string;
    co_authors: string;
    acknowledgments: string;
    display_preferences: {
        show_contributors: boolean;
        contributor_order: 'contribution' | 'alphabetical' | 'chronological';
        show_roles: boolean;
        show_percentages: boolean;
    };
    copyright_holder: string;
    license_type: string;
    attribution_requirements: string;
}
export interface ContributionEngagement {
    total_views: number;
    unique_views: number;
    view_sources: Record<string, number>;
    likes: number;
    shares: number;
    bookmarks: number;
    comments: number;
    helpfulness_rating: number;
    accuracy_rating: number;
    clarity_rating: number;
    usefulness_rating: number;
    community_votes: {
        upvotes: number;
        downvotes: number;
        expert_endorsements: number;
    };
    completion_rate: number;
    success_rate: number;
    time_to_complete: number;
    feedback_summary: {
        positive_feedback: string;
        improvement_suggestions: string;
        error_reports: string;
        update_requests: string;
    };
}
export interface PublishingConfiguration {
    visibility: 'public' | 'community' | 'restricted' | 'private';
    access_level: 'free' | 'premium' | 'subscriber_only' | 'invitation_only';
    seo: {
        slug: string;
        meta_title: string;
        meta_description: string;
        keywords: string;
        canonical_url?: string;
        open_graph: {
            title: string;
            description: string;
            image?: string;
            type: string;
        };
    };
    categories: string;
    tags: string;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimated_reading_time: number;
    distribution: {
        include_in_search: boolean;
        include_in_recommendations: boolean;
        allow_syndication: boolean;
        allow_translations: boolean;
        allow_derivatives: boolean;
    };
    notifications: {
        notify_followers: boolean;
        send_newsletter: boolean;
        post_to_social: boolean;
        notify_collaborators: boolean;
    };
}
export interface MonetizationConfiguration {
    monetization_enabled: boolean;
    pricing_model: 'free' | 'one_time' | 'subscription' | 'donation' | 'sponsored';
    pricing: {
        base_price?: number;
        currency?: string;
        discount_percentage?: number;
        promotional_price?: number;
        promotion_end_date?: string;
    };
    revenue_sharing: {
        contributor_percentage: number;
        platform_percentage: number;
        charity_percentage?: number;
        charity_organization?: string;
    };
    sponsorship?: {
        sponsor_name: string;
        sponsor_logo?: string;
        sponsor_link?: string;
        sponsorship_type: 'brand' | 'product' | 'service' | 'educational';
        disclosure_required: boolean;
    };
}
export interface ReviewFeedbackEntry {
    id: string;
    reviewer_id: string;
    reviewer_name: string;
    review_type: 'editorial' | 'technical' | 'subject_matter' | 'community';
    overall_rating: number;
    detailed_feedback: DetailedFeedback;
    recommendation: 'approve' | 'approve_with_minor_edits' | 'request_major_revision' | 'reject';
    priority_level: 'low' | 'medium' | 'high' | 'critical';
    submitted_at: string;
    review_duration_hours: number;
    follow_up_required: boolean;
    follow_up_notes?: string;
    public_feedback?: string;
    private_notes?: string;
}
export interface DetailedFeedback {
    content_quality: {
        accuracy: number;
        clarity: number;
        completeness: number;
        usefulness: number;
        originality: number;
    };
    technical_quality: {
        formatting: number;
        code_quality?: number;
        accessibility: number;
        seo_optimization: number;
    };
    feedback_areas: FeedbackArea;
    suggestions: {
        high_priority: string;
        medium_priority: string;
        low_priority: string;
        nice_to_have: string;
    };
    issues_found: {
        factual_errors: string;
        grammar_issues: string;
        formatting_problems: string;
        broken_links: string;
        accessibility_issues: string;
    };
}
export interface FeedbackArea {
    section: string;
    line_number?: number;
    issue_type: 'error' | 'suggestion' | 'question' | 'praise';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggested_change?: string;
    explanation?: string;
}
export interface NotificationConfiguration {
    notify_contributors: boolean;
    notify_reviewers: boolean;
    notify_followers: boolean;
    notify_administrators: boolean;
    channels: {
        email: boolean;
        in_app: boolean;
        push_notification: boolean;
        slack?: boolean;
        discord?: boolean;
    };
    timing: {
        immediate: boolean;
        daily_digest: boolean;
        weekly_summary: boolean;
        milestone_only: boolean;
    };
    notification_types: {
        status_changes: boolean;
        review_feedback: boolean;
        publication: boolean;
        engagement_milestones: boolean;
        quality_improvements: boolean;
    };
}
export interface ContributionRepository {
    submitContribution(submission: Omit<ContributionSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<ContributionSubmission>;
    updateContribution(id: string, updates: Partial<ContributionSubmission>): Promise<ContributionSubmission>;
    getContribution(id: string): Promise<ContributionSubmission>;
    getContributionsByUser(userId: string, status?: ContributionStatus): Promise<ContributionSubmission>;
    advanceWorkflowStage(contributionId: string, newStage: WorkflowStage, notes?: string): Promise<ContributionWorkflow>;
    assignReviewer(contributionId: string, assignment: ReviewerAssignment): Promise<void>;
    submitReviewFeedback(contributionId: string, feedback: ReviewFeedbackEntry): Promise<void>;
    approveContribution(contributionId: string, approval: ApprovalEntry): Promise<void>;
    runQualityAssessment(contributionId: string): Promise<CommunityContentQualityMetrics>;
    checkQualityGates(contributionId: string): Promise<QualityGateResult>;
    schedulePublication(contributionId: string, schedule: PublicationSchedule): Promise<void>;
    publishContribution(contributionId: string): Promise<void>;
    featureContribution(contributionId: string): Promise<void>;
    getContributionAnalytics(contributionId: string): Promise<ContributionEngagement>;
    getContributorStatistics(userId: string): Promise<ContributorStatistics>;
    getSystemMetrics(timeRange?: string): Promise<ContributionSystemMetrics>;
}
export interface ContributorStatistics {
    user_id: string;
    total_contributions: number;
    published_contributions: number;
    featured_contributions: number;
    average_quality_score: number;
    quality_trend: 'improving' | 'stable' | 'declining';
    peer_review_rating: number;
    total_views: number;
    total_likes: number;
    total_shares: number;
    average_helpfulness_rating: number;
    badges_earned: ContributorBadge;
    reputation_score: number;
    expert_endorsements: number;
    contribution_frequency: number;
    review_participation: number;
    community_engagement: number;
    average_review_time: number;
    revision_rate: number;
    acceptance_rate: number;
}
export interface ContributorBadge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    earned_at: string;
    criteria_met: string;
}
export interface ContributionSystemMetrics {
    time_period: string;
    total_submissions: number;
    submissions_by_type: Record<ContributionType, number>;
    submissions_by_category: Record<ContributionCategory, number>;
    average_review_time: number;
    workflow_bottlenecks: Array<{}, stage>;
    WorkflowStage: any;
    average_duration: number;
    backlog_count: number;
}
export declare const CONTRIBUTION_WORKFLOW_TEMPLATES: {
    trusted_contributor: {
        stages: string[];
        quality_gates: string[];
        review_requirements: {
            min_reviewers: number;
            specialist_required: boolean;
        };
        auto_publish_threshold: number;
    };
    standard: {
        stages: string[];
        quality_gates: string[];
        review_requirements: {
            min_reviewers: number;
            specialist_required: boolean;
        };
        auto_publish_threshold: number;
    };
    comprehensive: {
        stages: string[];
        quality_gates: string[];
        review_requirements: {
            min_reviewers: number;
            specialist_required: boolean;
        };
        auto_publish_threshold: number;
    };
    express: {
        readonly stages: readonly ["submission", "quality_check", "editorial_review", "publication"];
        readonly quality_gates: readonly ["automated_quality", "expedited_review"];
        readonly review_requirements: {
            readonly min_reviewers: 1;
            readonly specialist_required: false;
        };
        readonly auto_publish_threshold: 80;
        readonly max_review_time: 24;
    };
    const: {
        automated_basic: {
            minimum_score: number;
            required_checks: string[];
            blocking_issues: string[];
            automated_thresholds: {
                grammar_score: number;
                plagiarism_similarity: number;
                readability_score: number;
            };
            automated_comprehensive: {
                minimum_score: number;
                required_checks: string[];
                blocking_issues: string[];
                automated_thresholds: {
                    grammar_score: number;
                    plagiarism_similarity: number;
                    readability_score: number;
                    seo_score: number;
                    accessibility_score: number;
                };
                editorial_standard: {
                    minimum_score: number;
                    required_checks: string[];
                    reviewer_consensus: number;
                    automated_thresholds: {
                        readonly editorial_score: 75;
                        readonly technical_accuracy: 80;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=ContributionArchitecture.d.ts.map