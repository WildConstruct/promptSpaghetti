/**
 * Epic 16 - Learning & Community Usage Analytics Extension
 * Task: E16-1753114247088-3E0D09 - Implement usage analytics
 *
 * Extends existing marketplace analytics to include learning outcomes, tutorial effectiveness,
 * community engagement, and knowledge base usage metrics.
 */
import { z } from 'zod';
// ====================================
// Extended Analytics Enums
// ====================================
export var LearningMetricType;
(function (LearningMetricType) {
    // Tutorial Analytics
    LearningMetricType["TUTORIAL_START"] = "tutorial_start";
    LearningMetricType["TUTORIAL_COMPLETION"] = "tutorial_completion";
    LearningMetricType["TUTORIAL_STEP_COMPLETION"] = "tutorial_step_completion";
    LearningMetricType["TUTORIAL_DROP_OFF"] = "tutorial_drop_off";
    LearningMetricType["TUTORIAL_RETRY"] = "tutorial_retry";
    LearningMetricType["TUTORIAL_SKIP"] = "tutorial_skip";
    // Learning Progress
    LearningMetricType["SKILL_ACQUISITION"] = "skill_acquisition";
    LearningMetricType["SKILL_LEVEL_PROGRESSION"] = "skill_level_progression";
    LearningMetricType["LEARNING_PATH_START"] = "learning_path_start";
    LearningMetricType["LEARNING_PATH_COMPLETION"] = "learning_path_completion";
    LearningMetricType["MILESTONE_ACHIEVEMENT"] = "milestone_achievement";
    // Knowledge Base Usage
    LearningMetricType["KNOWLEDGE_BASE_SEARCH"] = "knowledge_base_search";
    LearningMetricType["KNOWLEDGE_BASE_VIEW"] = "knowledge_base_view";
    LearningMetricType["HELP_REQUEST"] = "help_request";
    LearningMetricType["HELP_RESOLUTION"] = "help_resolution";
    LearningMetricType["CONTENT_RATING"] = "content_rating";
    LearningMetricType["CONTENT_FEEDBACK"] = "content_feedback";
    // Community Engagement
    LearningMetricType["COMMUNITY_CONTRIBUTION"] = "community_contribution";
    LearningMetricType["CONTENT_CREATION"] = "content_creation";
    LearningMetricType["PEER_REVIEW"] = "peer_review";
    LearningMetricType["COMMUNITY_DISCUSSION"] = "community_discussion";
    LearningMetricType["KNOWLEDGE_SHARING"] = "knowledge_sharing";
    // Learning Effectiveness
    LearningMetricType["KNOWLEDGE_RETENTION"] = "knowledge_retention";
    LearningMetricType["REAL_WORLD_APPLICATION"] = "real_world_application";
    LearningMetricType["USER_CONFIDENCE_GAIN"] = "user_confidence_gain";
    LearningMetricType["LEARNING_SATISFACTION"] = "learning_satisfaction";
    LearningMetricType[LearningMetricType["export"] = void 0] = "export";
    LearningMetricType[LearningMetricType["enum"] = void 0] = "enum";
    LearningMetricType[LearningMetricType["LearningAnalyticsSegment"] = void 0] = "LearningAnalyticsSegment";
})(LearningMetricType || (LearningMetricType = {}));
{
    // User Segments
    BEGINNER_LEARNERS = 'beginner_learners',
        INTERMEDIATE_LEARNERS = 'intermediate_learners',
        ADVANCED_LEARNERS = 'advanced_learners',
        EXPERT_PRACTITIONERS = 'expert_practitioners',
        // Role Segments
        MARKETPLACE_BUYERS = 'marketplace_buyers',
        TEMPLATE_CREATORS = 'template_creators',
        COMMUNITY_CONTRIBUTORS = 'community_contributors',
        CONTENT_REVIEWERS = 'content_reviewers',
        // Engagement Segments
        ACTIVE_LEARNERS = 'active_learners',
        PASSIVE_CONSUMERS = 'passive_consumers',
        COMMUNITY_LEADERS = 'community_leaders',
        STRUGGLING_LEARNERS = 'struggling_learners';
    export let ContentType;
    (function (ContentType) {
        ContentType["TUTORIAL"] = "tutorial";
        ContentType["LEARNING_PATH"] = "learning_path";
        ContentType["KNOWLEDGE_ARTICLE"] = "knowledge_article";
        ContentType["COMMUNITY_CONTRIBUTION"] = "community_contribution";
        ContentType["HELP_CONTENT"] = "help_content";
        ContentType["ASSESSMENT"] = "assessment";
        // ====================================
        // Learning Analytics Event Types
        // ====================================
        ContentType[ContentType["export"] = void 0] = "export";
        ContentType[ContentType["interface"] = void 0] = "interface";
        ContentType[ContentType["LearningAnalyticsEvent"] = void 0] = "LearningAnalyticsEvent";
        ContentType[ContentType["extends"] = void 0] = "extends";
        ContentType[ContentType["AnalyticsEvent"] = void 0] = "AnalyticsEvent";
    })(ContentType || (ContentType = {}));
    {
        learning_context: {
            content_type: ContentType;
            content_id: string;
            skill_domain ?  : SkillDomain;
            skill_level ?  : SkillLevel;
            learning_objective ?  : string;
            session_id ?  : string;
        }
        ;
        user_context: {
            user_role: string;
            skill_profile_snapshot ?  : Partial;
            learning_goals ?  : string;
            current_learning_path ?  : string;
        }
        ;
        performance_context: {
            completion_percentage ?  : number;
            time_spent_seconds ?  : number;
            interaction_count ?  : number;
            error_count ?  : number;
            help_requests ?  : number;
            satisfaction_score ?  : number;
        }
        ;
    }
    ;
    learning_outcomes: {
        skill_acquisition_rate: number;
        knowledge_retention_score: number;
        real_world_application_success: number;
        user_confidence_improvement: number;
        competency_demonstration_rate: number;
    }
    ;
    content_quality: {
        helpfulness_rating: number;
        accuracy_rating: number;
        clarity_rating: number;
        engagement_score: number;
        community_endorsement_rate: number;
    }
    ;
    user_progression: {
        skill_level_advancement_rate: number;
        learning_path_continuation_rate: number;
        follow_up_learning_engagement: number;
        marketplace_activity_correlation: number;
    }
    ;
    segmented_performance: {
        performance_by_skill_level: Record;
        performance_by_role: Record;
        performance_by_learning_style: Record;
    }
    ;
}
;
skill_development: {
    skills_acquired: Array;
    competencies_gained: string;
    learning_velocity: number; // skills acquired per month
    retention_score: number;
}
;
engagement_patterns: {
    preferred_learning_times: string;
    preferred_content_types: ContentType;
    learning_session_patterns: LearningSessionPattern;
    help_seeking_behavior: HelpSeekingBehavior;
    collaboration_engagement: CollaborationEngagement;
}
;
learning_effectiveness: {
    completion_rate_trend: number;
    time_to_competency_improvement: number;
    real_world_application_success: number;
    learning_satisfaction_trend: number;
    knowledge_transfer_rate: number;
}
;
marketplace_correlation: {
    learning_to_purchase_correlation: number;
    skill_development_to_creation_correlation: number;
    tutorial_completion_to_success_correlation: number;
    community_engagement_impact: number;
}
;
;
knowledge_sharing: {
    knowledge_transfer_events: number;
    peer_to_peer_learning_rate: number;
    expert_guidance_provision: number;
    community_question_resolution_rate: number;
    knowledge_amplification_factor: number;
}
;
community_health: {
    active_contributor_count: number;
    contributor_retention_rate: number;
    new_contributor_onboarding_success: number;
    community_satisfaction_score: number;
    collaboration_success_rate: number;
}
;
content_quality: {
    average_content_rating: number;
    peer_review_thoroughness: number;
    accuracy_verification_rate: number;
    content_freshness_score: number;
    accessibility_compliance_rate: number;
}
;
learning_impact: {
    community_content_effectiveness: number;
    skill_development_acceleration: number;
    marketplace_success_correlation: number;
    innovation_contribution_rate: number;
    knowledge_gap_closure_rate: number;
}
;
;
content_effectiveness: {
    content_utilization_rate: Record;
    resolution_success_rate: number;
    user_satisfaction_by_content: Record;
    content_gap_identification: ContentGap;
    outdated_content_detection: OutdatedContent;
}
;
search_intelligence: {
    popular_search_terms: Array;
    failed_search_patterns: Array;
    semantic_search_effectiveness: number;
    query_refinement_patterns: QueryRefinementPattern;
}
;
user_journey_analytics: {
    typical_user_paths: UserPath;
    bounce_rate_by_content: Record;
    cross_content_navigation: CrossContentNavigation;
    learning_progression_tracking: LearningProgressionMetric;
}
;
time_series_data: Array;
contributing_factors: string;
projected_continuation: boolean;
;
effectiveness_metrics: {
    skill_acquisition_success: number;
    real_world_application_rate: number;
    user_satisfaction_score: number;
    knowledge_retention_rate: number;
}
;
personalization_impact: {
    personalized_vs_standard_performance: number;
    adaptation_effectiveness: number;
    user_preference_alignment: number;
}
;
;
outcome_metrics: {
    skills_acquired: number;
    competency_improvements: number;
    marketplace_success_correlation: number;
    career_advancement_indicators: string;
}
;
roi_calculation: {
    learning_efficiency_score: number;
    skill_development_velocity: number;
    marketplace_outcome_correlation: number;
    overall_roi_score: number;
}
;
;
health_trends: {
    trend_direction: 'improving' | 'stable' | 'declining';
    key_improvements: string;
    areas_of_concern: string;
    recommended_interventions: string;
}
;
;
transfer_effectiveness: {
    knowledge_adoption_rate: number;
    application_success_rate: number;
    retention_rate: number;
    amplification_factor: number;
}
;
network_analysis: {
    knowledge_hub_identification: KnowledgeHub;
    transfer_pathway_analysis: TransferPathway;
    bottleneck_identification: KnowledgeBottleneck;
}
;
 > ;
causal_relationships: Array;
actionable_insights: Array;
;
download_url: string;
expiration_date: Date;
;
;
detailed_sections: Array;
appendices: {
    methodology: string;
    data_sources: string;
    limitations: string;
    definitions: Record;
}
;
export const LearningAnalyticsEventSchema = z.object({});
// Extends base AnalyticsEvent with learning-specific fields
learning_context: z.object({});
content_type: z.nativeEnum(ContentType),
    content_id;
z.string(),
    skill_domain;
z.enum(),
    ['programming',
        'web-development',
        'mobile-development',
        'data-science',
        'devops',
        'design',
        'business',
        'marketing',
        'writing',
        'tools',
        'soft-skills',
        'project-management',
        'security',
        'database',
        'ai-ml',
        'quality-assurance',
        'blockchain',
        'game-development'];
optional(),
    skill_level;
z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    learning_objective;
z.string().optional(),
    session_id;
z.string().optional(),
;
user_context: z.object({});
user_role: z.string(),
    skill_profile_snapshot;
z.unknown().optional(),
    learning_goals;
z.array(z.string()).optional(),
    current_learning_path;
z.string().optional(),
;
performance_context: z.object({});
completion_percentage: z.number().min(0).max(100).optional(),
    time_spent_seconds;
z.number().min(0).optional(),
    interaction_count;
z.number().min(0).optional(),
    error_count;
z.number().min(0).optional(),
    help_requests;
z.number().min(0).optional(),
    satisfaction_score;
z.number().min(1).max(5).optional(),
;
;
export const LearningAnalyticsQuerySchema = z.object({});
learning_filters: z.object({});
skill_domains: z.array(),
    z.enum(['programming']);
'web-development',
    'mobile-development',
    'data-science',
    'devops',
    'design',
    'business',
    'marketing',
    'writing',
    'tools',
    'soft-skills',
    'project-management',
    'security',
    'database',
    'ai-ml',
    'quality-assurance',
    'blockchain',
    'game-development';
optional(),
    skill_levels;
z.array(z.enum(['beginner', 'intermediate', 'advanced', 'expert'])).optional(),
    content_types;
z.array(z.nativeEnum(ContentType)).optional(),
    learning_objectives;
z.array(z.string()).optional(),
    user_segments;
z.array(z.nativeEnum(LearningAnalyticsSegment)).optional(),
;
optional(),
    performance_filters;
z.object({});
min_completion_rate: z.number().min(0).max(100).optional(),
    min_satisfaction_score;
z.number().min(1).max(5).optional(),
    min_skill_acquisition_rate;
z.number().min(0).max(1).optional(),
    time_range_minutes;
z.object({});
min: z.number().min(0),
    max;
z.number().min(0),
;
optional();
optional();
;
