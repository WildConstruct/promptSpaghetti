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
})(LearningMetricType || (LearningMetricType = {}));
export var LearningAnalyticsSegment;
(function (LearningAnalyticsSegment) {
    // User Segments
    LearningAnalyticsSegment["BEGINNER_LEARNERS"] = "beginner_learners";
    LearningAnalyticsSegment["INTERMEDIATE_LEARNERS"] = "intermediate_learners";
    LearningAnalyticsSegment["ADVANCED_LEARNERS"] = "advanced_learners";
    LearningAnalyticsSegment["EXPERT_PRACTITIONERS"] = "expert_practitioners";
    // Role Segments
    LearningAnalyticsSegment["MARKETPLACE_BUYERS"] = "marketplace_buyers";
    LearningAnalyticsSegment["TEMPLATE_CREATORS"] = "template_creators";
    LearningAnalyticsSegment["COMMUNITY_CONTRIBUTORS"] = "community_contributors";
    LearningAnalyticsSegment["CONTENT_REVIEWERS"] = "content_reviewers";
    // Engagement Segments
    LearningAnalyticsSegment["ACTIVE_LEARNERS"] = "active_learners";
    LearningAnalyticsSegment["PASSIVE_CONSUMERS"] = "passive_consumers";
    LearningAnalyticsSegment["COMMUNITY_LEADERS"] = "community_leaders";
    LearningAnalyticsSegment["STRUGGLING_LEARNERS"] = "struggling_learners";
})(LearningAnalyticsSegment || (LearningAnalyticsSegment = {}));
export var ContentType;
(function (ContentType) {
    ContentType["TUTORIAL"] = "tutorial";
    ContentType["LEARNING_PATH"] = "learning_path";
    ContentType["KNOWLEDGE_ARTICLE"] = "knowledge_article";
    ContentType["COMMUNITY_CONTRIBUTION"] = "community_contribution";
    ContentType["HELP_CONTENT"] = "help_content";
    ContentType["ASSESSMENT"] = "assessment";
})(ContentType || (ContentType = {}));
// ====================================
// Validation Schemas
// ====================================
export const LearningAnalyticsEventSchema = z.object({
    // Extends base AnalyticsEvent with learning-specific fields
    learning_context: z.object({
        content_type: z.nativeEnum(ContentType),
        content_id: z.string(),
        skill_domain: z.nativeEnum(SkillDomain).optional(),
        skill_level: z.nativeEnum(SkillLevel).optional(),
        learning_objective: z.string().optional(),
        session_id: z.string().optional()
    }),
    user_context: z.object({
        user_role: z.string(),
        skill_profile_snapshot: z.any().optional(),
        learning_goals: z.array(z.string()).optional(),
        current_learning_path: z.string().optional()
    }),
    performance_context: z.object({
        completion_percentage: z.number().min(0).max(100).optional(),
        time_spent_seconds: z.number().min(0).optional(),
        interaction_count: z.number().min(0).optional(),
        error_count: z.number().min(0).optional(),
        help_requests: z.number().min(0).optional(),
        satisfaction_score: z.number().min(1).max(5).optional()
    })
});
export const LearningAnalyticsQuerySchema = z.object({
    learning_filters: z.object({
        skill_domains: z.array(z.nativeEnum(SkillDomain)).optional(),
        skill_levels: z.array(z.nativeEnum(SkillLevel)).optional(),
        content_types: z.array(z.nativeEnum(ContentType)).optional(),
        learning_objectives: z.array(z.string()).optional(),
        user_segments: z.array(z.nativeEnum(LearningAnalyticsSegment)).optional()
    }).optional(),
    performance_filters: z.object({
        min_completion_rate: z.number().min(0).max(100).optional(),
        min_satisfaction_score: z.number().min(1).max(5).optional(),
        min_skill_acquisition_rate: z.number().min(0).max(1).optional(),
        time_range_minutes: z.object({
            min: z.number().min(0),
            max: z.number().min(0)
        }).optional()
    }).optional()
});
