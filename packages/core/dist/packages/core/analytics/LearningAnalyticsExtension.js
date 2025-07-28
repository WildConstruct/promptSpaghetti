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
         > ;
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
}
 > ;
causal_relationships: Array < {
    cause_metric: string,
    effect_metric: string,
    causal_strength: number,
    time_lag_hours: number,
    confidence_interval: [number, number]
} > ;
actionable_insights: Array < {
    insight: string,
    impact_potential: 'high' | 'medium' | 'low',
    implementation_effort: 'low' | 'medium' | 'high',
    roi_estimate: string
} > ;
 > ;
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
