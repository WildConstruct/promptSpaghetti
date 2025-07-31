;
// Status and workflow
status: ContributionStatus;
workflow: ContributionWorkflow;
// Quality and assessment
quality_assessment ?  : CommunityContentQualityMetrics;
review_feedback: ReviewFeedbackEntry;
// Attribution and collaboration
contributors: ContributionContributor;
attribution: ContributionAttribution;
// Community engagement
engagement: ContributionEngagement;
// Publishing and distribution
publishing: PublishingConfiguration;
// Monetization (optional)
monetization ?  : MonetizationConfiguration;
// Version tracking
version_history: string; // Array of version IDs,
current_version_id: string;
// Metadata
created_at: string;
updated_at: string;
published_at ?  : string;
featured_at ?  : string;
;
// Contribution history
contribution_date: string;
previous_contributions: number;
reputation_score: number;
;
// Legal and licensing
copyright_holder: string;
license_type: string;
attribution_requirements: string;
;
// Usage analytics
completion_rate: number; // For tutorials,
success_rate: number; // How often people succeed following the content
time_to_complete: number; // Average completion time
// Feedback collection
feedback_summary: {
    positive_feedback: string;
    improvement_suggestions: string;
    error_reports: string;
    update_requests: string;
}
;
;
// Content organization
categories: string;
tags: string;
difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
estimated_reading_time: number;
// Distribution settings
distribution: {
    include_in_search: boolean;
    include_in_recommendations: boolean;
    allow_syndication: boolean;
    allow_translations: boolean;
    allow_derivatives: boolean;
}
;
// Notification settings
notifications: {
    notify_followers: boolean;
    send_newsletter: boolean;
    post_to_social: boolean;
    notify_collaborators: boolean;
}
;
;
// Revenue sharing
revenue_sharing: {
    contributor_percentage: number;
    platform_percentage: number;
    charity_percentage ?  : number;
    charity_organization ?  : string;
}
;
// Sponsorship
sponsorship ?  : {
    sponsor_name: string,
    sponsor_logo: string,
    sponsor_link: string,
    sponsorship_type: 'brand' | 'product' | 'service' | 'educational',
    disclosure_required: boolean
};
;
// Technical quality
technical_quality: {
    formatting: number; // 1-5,
    code_quality ?  : number; // 1-5 (if applicable),
    accessibility: number; // 1-5,
    seo_optimization: number; // 1-5,
}
;
// Specific feedback areas
feedback_areas: FeedbackArea;
// Improvement suggestions
suggestions: {
    high_priority: string;
    medium_priority: string;
    low_priority: string;
    nice_to_have: string;
}
;
// Errors and issues
issues_found: {
    factual_errors: string;
    grammar_issues: string;
    formatting_problems: string;
    broken_links: string;
    accessibility_issues: string;
}
;
;
// Notification timing
timing: {
    immediate: boolean;
    daily_digest: boolean;
    weekly_summary: boolean;
    milestone_only: boolean;
}
;
// Notification types
notification_types: {
    status_changes: boolean;
    review_feedback: boolean;
    publication: boolean;
    engagement_milestones: boolean;
    quality_improvements: boolean;
}
;
 > ;
// Quality metrics
average_quality_score: number;
quality_distribution: Record;
common_quality_issues: Array;
// Publication metrics
publication_rate: number;
featured_content_rate: number;
content_longevity: number; // average time content remains relevant
// Community engagement
community_participation: {
    active_contributors: number;
    active_reviewers: number;
    community_feedback_volume: number;
    collaboration_rate: number;
}
;
// System performance
processing_efficiency: {
    automated_approval_rate: number;
    quality_gate_pass_rate: number;
    escalation_rate: number;
    reviewer_workload_balance: number;
}
;
export const CONTRIBUTION_WORKFLOW_TEMPLATES = {
    // Simple workflow for trusted contributors
    trusted_contributor: {
        stages: ['submission', 'quality_check', 'final_approval', 'publication'],
        quality_gates: ['automated_quality', 'plagiarism_check'],
        review_requirements: { min_reviewers: 1, specialist_required: false },
        auto_publish_threshold: 85
    }
    // Standard workflow for regular contributors
    ,
    // Standard workflow for regular contributors
    standard: {
        stages: ['submission', 'intake_review', 'quality_check', 'editorial_review', 'final_approval', 'publication'],
        quality_gates: ['automated_quality', 'editorial_review', 'technical_review'],
        review_requirements: { min_reviewers: 2, specialist_required: false },
        auto_publish_threshold: 90
    }
    // Comprehensive workflow for new contributors or complex content
    ,
    // Comprehensive workflow for new contributors or complex content
    comprehensive: {
        stages: ['submission', 'intake_review', 'quality_check', 'editorial_review', 'technical_review', 'community_review', 'final_approval', 'publication'],
        quality_gates: ['automated_quality', 'editorial_review', 'technical_review', 'community_consensus'],
        review_requirements: { min_reviewers: 3, specialist_required: true },
        auto_publish_threshold: 95
    }
    // Express workflow for urgent content
    ,
    // Express workflow for urgent content
    express: {
        stages: ['submission', 'quality_check', 'editorial_review', 'publication'],
        quality_gates: ['automated_quality', 'expedited_review'],
        review_requirements: { min_reviewers: 1, specialist_required: false },
        auto_publish_threshold: 80,
        max_review_time: 24 // hours;
    },
    const: QUALITY_GATE_PRESETS = {
        automated_basic: {
            minimum_score: 70,
            required_checks: ['grammar', 'spelling', 'readability'],
            blocking_issues: ['plagiarism_detected', 'policy_violation'],
            automated_thresholds: {
                grammar_score: 80,
                plagiarism_similarity: 15, // max 15% similarity,
                readability_score: 70,
            },
            automated_comprehensive: {
                minimum_score: 80,
                required_checks: ['grammar', 'spelling', 'readability', 'seo', 'accessibility'],
                blocking_issues: ['plagiarism_detected', 'policy_violation', 'accessibility_violation'],
                automated_thresholds: {
                    grammar_score: 85,
                    plagiarism_similarity: 10,
                    readability_score: 75,
                    seo_score: 70,
                    accessibility_score: 80,
                },
                editorial_standard: {
                    minimum_score: 75,
                    required_checks: ['content_accuracy', 'style_consistency', 'target_audience'],
                    reviewer_consensus: 75, // 75% of reviewers must approve,
                    automated_thresholds: {
                        editorial_score: 75,
                        technical_accuracy: 80,
                    }
                }
            }
        }
    }
};
