/**
 * Epic 16 - Learning & Community Usage Analytics Extension
 * Task: E16-1753114247088-3E0D09 - Implement usage analytics
 *
 * Extends existing marketplace analytics to include learning outcomes, tutorial effectiveness,
 * community engagement, and knowledge base usage metrics.
 */
import { z } from 'zod';
import { MetricType, TimeRange, AnalyticsEvent, AnalyticsQuery } from '../../server/src/marketplace/analytics.types';
import { SkillLevel, SkillDomain, UserSkillProfile } from '../community/SkillLevelTagging';
export declare enum LearningMetricType {
    TUTORIAL_START = "tutorial_start",
    TUTORIAL_COMPLETION = "tutorial_completion",
    TUTORIAL_STEP_COMPLETION = "tutorial_step_completion",
    TUTORIAL_DROP_OFF = "tutorial_drop_off",
    TUTORIAL_RETRY = "tutorial_retry",
    TUTORIAL_SKIP = "tutorial_skip",
    SKILL_ACQUISITION = "skill_acquisition",
    SKILL_LEVEL_PROGRESSION = "skill_level_progression",
    LEARNING_PATH_START = "learning_path_start",
    LEARNING_PATH_COMPLETION = "learning_path_completion",
    MILESTONE_ACHIEVEMENT = "milestone_achievement",
    KNOWLEDGE_BASE_SEARCH = "knowledge_base_search",
    KNOWLEDGE_BASE_VIEW = "knowledge_base_view",
    HELP_REQUEST = "help_request",
    HELP_RESOLUTION = "help_resolution",
    CONTENT_RATING = "content_rating",
    CONTENT_FEEDBACK = "content_feedback",
    COMMUNITY_CONTRIBUTION = "community_contribution",
    CONTENT_CREATION = "content_creation",
    PEER_REVIEW = "peer_review",
    COMMUNITY_DISCUSSION = "community_discussion",
    KNOWLEDGE_SHARING = "knowledge_sharing",
    KNOWLEDGE_RETENTION = "knowledge_retention",
    REAL_WORLD_APPLICATION = "real_world_application",
    USER_CONFIDENCE_GAIN = "user_confidence_gain",
    LEARNING_SATISFACTION = "learning_satisfaction"
}
export declare enum LearningAnalyticsSegment {
    BEGINNER_LEARNERS = "beginner_learners",
    INTERMEDIATE_LEARNERS = "intermediate_learners",
    ADVANCED_LEARNERS = "advanced_learners",
    EXPERT_PRACTITIONERS = "expert_practitioners",
    MARKETPLACE_BUYERS = "marketplace_buyers",
    TEMPLATE_CREATORS = "template_creators",
    COMMUNITY_CONTRIBUTORS = "community_contributors",
    CONTENT_REVIEWERS = "content_reviewers",
    ACTIVE_LEARNERS = "active_learners",
    PASSIVE_CONSUMERS = "passive_consumers",
    COMMUNITY_LEADERS = "community_leaders",
    STRUGGLING_LEARNERS = "struggling_learners"
}
export declare enum ContentType {
    TUTORIAL = "tutorial",
    LEARNING_PATH = "learning_path",
    KNOWLEDGE_ARTICLE = "knowledge_article",
    COMMUNITY_CONTRIBUTION = "community_contribution",
    HELP_CONTENT = "help_content",
    ASSESSMENT = "assessment"
}
export interface LearningAnalyticsEvent extends AnalyticsEvent {
    learning_context: {
        content_type: ContentType;
        content_id: string;
        skill_domain?: SkillDomain;
        skill_level?: SkillLevel;
        learning_objective?: string;
        session_id?: string;
    };
    user_context: {
        user_role: string;
        skill_profile_snapshot?: Partial<UserSkillProfile>;
        learning_goals?: string[];
        current_learning_path?: string;
    };
    performance_context: {
        completion_percentage?: number;
        time_spent_seconds?: number;
        interaction_count?: number;
        error_count?: number;
        help_requests?: number;
        satisfaction_score?: number;
    };
}
export interface TutorialAnalyticsEvent extends LearningAnalyticsEvent {
    tutorial_context: {
        tutorial_id: string;
        tutorial_category: string;
        step_id?: string;
        step_type?: string;
        interaction_type?: string;
        validation_success?: boolean;
    };
    learning_outcomes: {
        skills_demonstrated?: string[];
        competencies_gained?: string[];
        confidence_improvement?: number;
        real_world_application_success?: boolean;
    };
}
export interface KnowledgeBaseAnalyticsEvent extends LearningAnalyticsEvent {
    knowledge_context: {
        search_query?: string;
        search_results_count?: number;
        content_relevance_score?: number;
        resolution_success?: boolean;
        follow_up_actions?: string[];
    };
    content_quality: {
        helpfulness_rating?: number;
        accuracy_rating?: number;
        clarity_rating?: number;
        completeness_rating?: number;
    };
}
export interface CommunityAnalyticsEvent extends LearningAnalyticsEvent {
    contribution_context: {
        contribution_type: string;
        contribution_id?: string;
        review_type?: string;
        collaboration_mode?: string;
        mentor_involvement?: boolean;
    };
    community_impact: {
        knowledge_sharing_score?: number;
        peer_help_provided?: number;
        expertise_demonstrated?: number;
        community_reputation_change?: number;
    };
}
export interface LearningEffectivenessMetrics {
    content_id: string;
    content_type: ContentType;
    period_start: Date;
    period_end: Date;
    engagement_metrics: {
        total_starts: number;
        unique_users: number;
        completion_rate: number;
        average_completion_time_minutes: number;
        drop_off_rate: number;
        retry_rate: number;
        user_satisfaction_score: number;
    };
    learning_outcomes: {
        skill_acquisition_rate: number;
        knowledge_retention_score: number;
        real_world_application_success: number;
        user_confidence_improvement: number;
        competency_demonstration_rate: number;
    };
    content_quality: {
        helpfulness_rating: number;
        accuracy_rating: number;
        clarity_rating: number;
        engagement_score: number;
        community_endorsement_rate: number;
    };
    user_progression: {
        skill_level_advancement_rate: number;
        learning_path_continuation_rate: number;
        follow_up_learning_engagement: number;
        marketplace_activity_correlation: number;
    };
    segmented_performance: {
        performance_by_skill_level: Record<SkillLevel, PerformanceMetrics>;
        performance_by_role: Record<string, PerformanceMetrics>;
        performance_by_learning_style: Record<string, PerformanceMetrics>;
    };
}
export interface PerformanceMetrics {
    completion_rate: number;
    average_time_minutes: number;
    satisfaction_score: number;
    skill_acquisition_rate: number;
    user_count: number;
}
export interface UserLearningAnalytics {
    user_id: string;
    analysis_period: string;
    learning_activity: {
        total_learning_time_hours: number;
        tutorials_completed: number;
        learning_paths_started: number;
        learning_paths_completed: number;
        knowledge_base_interactions: number;
        community_contributions: number;
    };
    skill_development: {
        skills_acquired: Array<{
            skill_domain: SkillDomain;
            previous_level: SkillLevel;
            current_level: SkillLevel;
            progression_date: string;
            confidence_improvement: number;
        }>;
        competencies_gained: string[];
        learning_velocity: number;
        retention_score: number;
    };
    engagement_patterns: {
        preferred_learning_times: string[];
        preferred_content_types: ContentType[];
        learning_session_patterns: LearningSessionPattern[];
        help_seeking_behavior: HelpSeekingBehavior;
        collaboration_engagement: CollaborationEngagement;
    };
    learning_effectiveness: {
        completion_rate_trend: number;
        time_to_competency_improvement: number;
        real_world_application_success: number;
        learning_satisfaction_trend: number;
        knowledge_transfer_rate: number;
    };
    marketplace_correlation: {
        learning_to_purchase_correlation: number;
        skill_development_to_creation_correlation: number;
        tutorial_completion_to_success_correlation: number;
        community_engagement_impact: number;
    };
}
export interface LearningSessionPattern {
    pattern_type: 'intensive' | 'distributed' | 'sporadic' | 'consistent';
    average_session_duration: number;
    sessions_per_week: number;
    peak_learning_hours: string[];
    interruption_frequency: number;
    multi_tasking_tendency: number;
}
export interface HelpSeekingBehavior {
    help_request_frequency: number;
    preferred_help_sources: string[];
    self_resolution_rate: number;
    community_help_participation: number;
    documentation_usage_rate: number;
}
export interface CollaborationEngagement {
    peer_interaction_frequency: number;
    mentoring_participation: number;
    knowledge_sharing_contributions: number;
    community_discussion_engagement: number;
    collaboration_success_rate: number;
}
export interface CommunityKnowledgeMetrics {
    community_id: string;
    analysis_period: string;
    content_creation: {
        total_contributions: number;
        unique_contributors: number;
        content_type_distribution: Record<ContentType, number>;
        contribution_quality_score: number;
        publication_rate: number;
        update_frequency: number;
    };
    knowledge_sharing: {
        knowledge_transfer_events: number;
        peer_to_peer_learning_rate: number;
        expert_guidance_provision: number;
        community_question_resolution_rate: number;
        knowledge_amplification_factor: number;
    };
    community_health: {
        active_contributor_count: number;
        contributor_retention_rate: number;
        new_contributor_onboarding_success: number;
        community_satisfaction_score: number;
        collaboration_success_rate: number;
    };
    content_quality: {
        average_content_rating: number;
        peer_review_thoroughness: number;
        accuracy_verification_rate: number;
        content_freshness_score: number;
        accessibility_compliance_rate: number;
    };
    learning_impact: {
        community_content_effectiveness: number;
        skill_development_acceleration: number;
        marketplace_success_correlation: number;
        innovation_contribution_rate: number;
        knowledge_gap_closure_rate: number;
    };
}
export interface KnowledgeBaseUsageMetrics {
    knowledge_base_id: string;
    analysis_period: string;
    usage_patterns: {
        total_searches: number;
        unique_searchers: number;
        search_success_rate: number;
        content_discovery_rate: number;
        repeat_usage_rate: number;
    };
    content_effectiveness: {
        content_utilization_rate: Record<ContentType, number>;
        resolution_success_rate: number;
        user_satisfaction_by_content: Record<ContentType, number>;
        content_gap_identification: ContentGap[];
        outdated_content_detection: OutdatedContent[];
    };
    search_intelligence: {
        popular_search_terms: Array<{
            term: string;
            frequency: number;
            success_rate: number;
        }>;
        failed_search_patterns: Array<{
            pattern: string;
            frequency: number;
            suggested_content: string[];
        }>;
        semantic_search_effectiveness: number;
        query_refinement_patterns: QueryRefinementPattern[];
    };
    user_journey_analytics: {
        typical_user_paths: UserPath[];
        bounce_rate_by_content: Record<ContentType, number>;
        cross_content_navigation: CrossContentNavigation[];
        learning_progression_tracking: LearningProgressionMetric[];
    };
}
export interface ContentGap {
    gap_type: 'missing_content' | 'insufficient_depth' | 'outdated_information' | 'accessibility_issue';
    topic_area: string;
    skill_level: SkillLevel;
    user_demand_score: number;
    business_impact: 'high' | 'medium' | 'low';
    suggested_content_type: ContentType;
}
export interface OutdatedContent {
    content_id: string;
    content_type: ContentType;
    last_updated: Date;
    staleness_score: number;
    user_reported_issues: string[];
    accuracy_decline_indicators: string[];
    update_priority: 'urgent' | 'high' | 'medium' | 'low';
}
export interface QueryRefinementPattern {
    initial_query: string;
    refined_query: string;
    refinement_type: 'spelling' | 'semantic' | 'scope' | 'specificity';
    success_improvement: number;
    frequency: number;
}
export interface UserPath {
    path_pattern: string[];
    frequency: number;
    success_rate: number;
    average_time_minutes: number;
    typical_outcomes: string[];
}
export interface CrossContentNavigation {
    from_content_type: ContentType;
    to_content_type: ContentType;
    navigation_frequency: number;
    success_correlation: number;
    typical_transition_triggers: string[];
}
export interface LearningProgressionMetric {
    progression_type: 'linear' | 'branching' | 'circular' | 'exploratory';
    skill_development_rate: number;
    content_effectiveness_score: number;
    user_satisfaction_progression: number;
    marketplace_outcome_correlation: number;
}
export interface LearningAnalyticsService {
    trackLearningEvent(event: LearningAnalyticsEvent): Promise<void>;
    trackTutorialEvent(event: TutorialAnalyticsEvent): Promise<void>;
    trackKnowledgeBaseEvent(event: KnowledgeBaseAnalyticsEvent): Promise<void>;
    trackCommunityEvent(event: CommunityAnalyticsEvent): Promise<void>;
    generateLearningEffectivenessMetrics(contentId: string, timeRange: TimeRange): Promise<LearningEffectivenessMetrics>;
    generateUserLearningAnalytics(userId: string, timeRange: TimeRange): Promise<UserLearningAnalytics>;
    generateCommunityKnowledgeMetrics(communityId: string, timeRange: TimeRange): Promise<CommunityKnowledgeMetrics>;
    generateKnowledgeBaseUsageMetrics(knowledgeBaseId: string, timeRange: TimeRange): Promise<KnowledgeBaseUsageMetrics>;
    identifyLearningTrends(timeRange: TimeRange): Promise<LearningTrend[]>;
    detectContentPerformanceAnomalies(contentType: ContentType, threshold: number): Promise<PerformanceAnomaly[]>;
    generatePersonalizedLearningInsights(userId: string): Promise<PersonalizedInsight[]>;
    identifyKnowledgeGaps(skillDomain?: SkillDomain): Promise<ContentGap[]>;
    analyzeLearningPathEffectiveness(learningPathId: string): Promise<LearningPathAnalytics>;
    measureSkillDevelopmentROI(userId: string, timeRange: TimeRange): Promise<SkillDevelopmentROI>;
    assessCommunityHealthScore(communityId: string): Promise<CommunityHealthScore>;
    calculateKnowledgeTransferMetrics(timeRange: TimeRange): Promise<KnowledgeTransferMetrics>;
    getLearningActivityRealTime(): Promise<RealTimeLearningActivity>;
    getCommunityEngagementRealTime(): Promise<RealTimeCommunityEngagement>;
    getKnowledgeBaseActivityRealTime(): Promise<RealTimeKnowledgeActivity>;
    exportLearningDataForAnalysis(query: LearningAnalyticsQuery): Promise<LearningDataExport>;
    integrateWithMarketplaceAnalytics(correlationQuery: AnalyticsCorrelationQuery): Promise<CrossPlatformInsights>;
    generateComprehensiveReport(reportConfig: LearningAnalyticsReportConfig): Promise<ComprehensiveAnalyticsReport>;
}
export interface LearningTrend {
    trend_type: 'skill_demand' | 'content_popularity' | 'learning_pattern' | 'community_growth';
    trend_description: string;
    confidence_score: number;
    impact_assessment: 'high' | 'medium' | 'low';
    time_series_data: Array<{
        date: Date;
        value: number;
    }>;
    contributing_factors: string[];
    projected_continuation: boolean;
}
export interface PerformanceAnomaly {
    anomaly_type: 'sudden_drop' | 'sudden_spike' | 'gradual_decline' | 'stagnation';
    content_id: string;
    content_type: ContentType;
    detection_date: Date;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affected_metrics: string[];
    potential_causes: string[];
    recommended_actions: string[];
}
export interface PersonalizedInsight {
    insight_type: 'learning_opportunity' | 'skill_gap' | 'performance_improvement' | 'engagement_optimization';
    title: string;
    description: string;
    actionable_recommendations: string[];
    expected_impact: 'high' | 'medium' | 'low';
    effort_required: 'low' | 'medium' | 'high';
    timeline_estimate: string;
}
export interface LearningPathAnalytics {
    learning_path_id: string;
    analysis_period: string;
    completion_analytics: {
        total_enrollments: number;
        completion_rate: number;
        average_completion_time: number;
        drop_off_points: Array<{
            step: string;
            drop_off_rate: number;
        }>;
    };
    effectiveness_metrics: {
        skill_acquisition_success: number;
        real_world_application_rate: number;
        user_satisfaction_score: number;
        knowledge_retention_rate: number;
    };
    personalization_impact: {
        personalized_vs_standard_performance: number;
        adaptation_effectiveness: number;
        user_preference_alignment: number;
    };
}
export interface SkillDevelopmentROI {
    user_id: string;
    analysis_period: string;
    investment_metrics: {
        time_invested_hours: number;
        learning_activities_completed: number;
        community_contributions: number;
    };
    outcome_metrics: {
        skills_acquired: number;
        competency_improvements: number;
        marketplace_success_correlation: number;
        career_advancement_indicators: string[];
    };
    roi_calculation: {
        learning_efficiency_score: number;
        skill_development_velocity: number;
        marketplace_outcome_correlation: number;
        overall_roi_score: number;
    };
}
export interface CommunityHealthScore {
    community_id: string;
    overall_health_score: number;
    health_dimensions: {
        activity_level: number;
        content_quality: number;
        member_satisfaction: number;
        knowledge_sharing: number;
        collaboration_effectiveness: number;
        innovation_rate: number;
    };
    health_trends: {
        trend_direction: 'improving' | 'stable' | 'declining';
        key_improvements: string[];
        areas_of_concern: string[];
        recommended_interventions: string[];
    };
}
export interface KnowledgeTransferMetrics {
    analysis_period: string;
    transfer_volume: {
        knowledge_creation_events: number;
        knowledge_sharing_events: number;
        peer_learning_interactions: number;
        expert_guidance_sessions: number;
    };
    transfer_effectiveness: {
        knowledge_adoption_rate: number;
        application_success_rate: number;
        retention_rate: number;
        amplification_factor: number;
    };
    network_analysis: {
        knowledge_hub_identification: KnowledgeHub[];
        transfer_pathway_analysis: TransferPathway[];
        bottleneck_identification: KnowledgeBottleneck[];
    };
}
export interface KnowledgeHub {
    hub_id: string;
    hub_type: 'individual_expert' | 'content_cluster' | 'community_group';
    influence_score: number;
    knowledge_domains: SkillDomain[];
    transfer_reach: number;
    expertise_recognition: number;
}
export interface TransferPathway {
    pathway_id: string;
    source_type: 'tutorial' | 'community' | 'expert' | 'content';
    destination_type: 'learner' | 'community' | 'marketplace' | 'application';
    transfer_efficiency: number;
    volume: number;
    success_rate: number;
}
export interface KnowledgeBottleneck {
    bottleneck_type: 'content_gap' | 'access_barrier' | 'quality_issue' | 'discovery_problem';
    impact_severity: 'high' | 'medium' | 'low';
    affected_domains: SkillDomain[];
    resolution_priority: number;
    suggested_solutions: string[];
}
export interface RealTimeLearningActivity {
    active_learners: number;
    tutorials_in_progress: number;
    knowledge_base_searches: number;
    community_interactions: number;
    skill_demonstrations: number;
    current_learning_velocity: number;
}
export interface RealTimeCommunityEngagement {
    active_contributors: number;
    contributions_in_review: number;
    peer_interactions: number;
    knowledge_sharing_events: number;
    community_discussions: number;
    collaboration_sessions: number;
}
export interface RealTimeKnowledgeActivity {
    search_queries_per_minute: number;
    content_views_per_minute: number;
    help_requests_per_minute: number;
    resolution_rate: number;
    user_satisfaction_realtime: number;
    content_effectiveness_realtime: number;
}
export interface LearningAnalyticsQuery extends AnalyticsQuery {
    learning_filters: {
        skill_domains?: SkillDomain[];
        skill_levels?: SkillLevel[];
        content_types?: ContentType[];
        learning_objectives?: string[];
        user_segments?: LearningAnalyticsSegment[];
    };
    performance_filters: {
        min_completion_rate?: number;
        min_satisfaction_score?: number;
        min_skill_acquisition_rate?: number;
        time_range_minutes?: {
            min: number;
            max: number;
        };
    };
}
export interface AnalyticsCorrelationQuery {
    primary_metrics: LearningMetricType[];
    marketplace_metrics: MetricType[];
    correlation_type: 'pearson' | 'spearman' | 'mutual_information';
    time_alignment: 'synchronous' | 'lagged' | 'causal';
    user_segment?: LearningAnalyticsSegment;
}
export interface CrossPlatformInsights {
    correlation_strength: number;
    significant_correlations: Array<{
        learning_metric: LearningMetricType;
        marketplace_metric: MetricType;
        correlation_coefficient: number;
        statistical_significance: number;
        business_interpretation: string;
    }>;
    causal_relationships: Array<{
        cause_metric: string;
        effect_metric: string;
        causal_strength: number;
        time_lag_hours: number;
        confidence_interval: [number, number];
    }>;
    actionable_insights: Array<{
        insight: string;
        impact_potential: 'high' | 'medium' | 'low';
        implementation_effort: 'low' | 'medium' | 'high';
        roi_estimate: string;
    }>;
}
export interface LearningDataExport {
    export_id: string;
    export_timestamp: Date;
    data_format: 'csv' | 'json' | 'parquet' | 'excel';
    data_summary: {
        total_records: number;
        time_range: {
            start: Date;
            end: Date;
        };
        metrics_included: string[];
        privacy_level: 'aggregated' | 'anonymized' | 'pseudonymized';
    };
    download_url: string;
    expiration_date: Date;
}
export interface LearningAnalyticsReportConfig {
    report_type: 'executive_summary' | 'detailed_analysis' | 'performance_review' | 'trend_analysis';
    target_audience: 'executives' | 'educators' | 'product_team' | 'community_managers';
    focus_areas: Array<'learning_effectiveness' | 'community_health' | 'content_quality' | 'user_engagement'>;
    time_range: TimeRange;
    comparison_periods?: TimeRange[];
    customizations: {
        include_recommendations: boolean;
        include_visualizations: boolean;
        include_raw_data: boolean;
        privacy_level: 'high' | 'medium' | 'low';
    };
}
export interface ComprehensiveAnalyticsReport {
    report_id: string;
    generated_at: Date;
    configuration: LearningAnalyticsReportConfig;
    executive_summary: {
        key_metrics: Record<string, number>;
        major_trends: string[];
        critical_insights: string[];
        priority_recommendations: string[];
    };
    detailed_sections: Array<{
        section_title: string;
        metrics: Record<string, any>;
        analysis: string;
        visualizations?: Array<{
            type: string;
            data: any;
            config: any;
        }>;
    }>;
    appendices: {
        methodology: string;
        data_sources: string[];
        limitations: string[];
        definitions: Record<string, string>;
    };
}
export declare const LearningAnalyticsEventSchema: z.ZodObject<{
    learning_context: z.ZodObject<{
        content_type: z.ZodNativeEnum<typeof ContentType>;
        content_id: z.ZodString;
        skill_domain: z.ZodOptional<z.ZodNativeEnum<any>>;
        skill_level: z.ZodOptional<z.ZodNativeEnum<any>>;
        learning_objective: z.ZodOptional<z.ZodString>;
        session_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        [x: string]: any;
        content_type?: unknown;
        content_id?: unknown;
        skill_domain?: unknown;
        skill_level?: unknown;
        learning_objective?: unknown;
        session_id?: unknown;
    }, {
        [x: string]: any;
        content_type?: unknown;
        content_id?: unknown;
        skill_domain?: unknown;
        skill_level?: unknown;
        learning_objective?: unknown;
        session_id?: unknown;
    }>;
    user_context: z.ZodObject<{
        user_role: z.ZodString;
        skill_profile_snapshot: z.ZodOptional<z.ZodAny>;
        learning_goals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        current_learning_path: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        user_role: string;
        skill_profile_snapshot?: any;
        learning_goals?: string[] | undefined;
        current_learning_path?: string | undefined;
    }, {
        user_role: string;
        skill_profile_snapshot?: any;
        learning_goals?: string[] | undefined;
        current_learning_path?: string | undefined;
    }>;
    performance_context: z.ZodObject<{
        completion_percentage: z.ZodOptional<z.ZodNumber>;
        time_spent_seconds: z.ZodOptional<z.ZodNumber>;
        interaction_count: z.ZodOptional<z.ZodNumber>;
        error_count: z.ZodOptional<z.ZodNumber>;
        help_requests: z.ZodOptional<z.ZodNumber>;
        satisfaction_score: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        completion_percentage?: number | undefined;
        time_spent_seconds?: number | undefined;
        interaction_count?: number | undefined;
        error_count?: number | undefined;
        help_requests?: number | undefined;
        satisfaction_score?: number | undefined;
    }, {
        completion_percentage?: number | undefined;
        time_spent_seconds?: number | undefined;
        interaction_count?: number | undefined;
        error_count?: number | undefined;
        help_requests?: number | undefined;
        satisfaction_score?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    learning_context: {
        [x: string]: any;
        content_type?: unknown;
        content_id?: unknown;
        skill_domain?: unknown;
        skill_level?: unknown;
        learning_objective?: unknown;
        session_id?: unknown;
    };
    user_context: {
        user_role: string;
        skill_profile_snapshot?: any;
        learning_goals?: string[] | undefined;
        current_learning_path?: string | undefined;
    };
    performance_context: {
        completion_percentage?: number | undefined;
        time_spent_seconds?: number | undefined;
        interaction_count?: number | undefined;
        error_count?: number | undefined;
        help_requests?: number | undefined;
        satisfaction_score?: number | undefined;
    };
}, {
    learning_context: {
        [x: string]: any;
        content_type?: unknown;
        content_id?: unknown;
        skill_domain?: unknown;
        skill_level?: unknown;
        learning_objective?: unknown;
        session_id?: unknown;
    };
    user_context: {
        user_role: string;
        skill_profile_snapshot?: any;
        learning_goals?: string[] | undefined;
        current_learning_path?: string | undefined;
    };
    performance_context: {
        completion_percentage?: number | undefined;
        time_spent_seconds?: number | undefined;
        interaction_count?: number | undefined;
        error_count?: number | undefined;
        help_requests?: number | undefined;
        satisfaction_score?: number | undefined;
    };
}>;
export declare const LearningAnalyticsQuerySchema: z.ZodObject<{
    learning_filters: z.ZodOptional<z.ZodObject<{
        skill_domains: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<any>, "many">>;
        skill_levels: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<any>, "many">>;
        content_types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ContentType>, "many">>;
        learning_objectives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        user_segments: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof LearningAnalyticsSegment>, "many">>;
    }, "strip", z.ZodTypeAny, {
        skill_domains?: any[] | undefined;
        skill_levels?: any[] | undefined;
        content_types?: ContentType[] | undefined;
        learning_objectives?: string[] | undefined;
        user_segments?: LearningAnalyticsSegment[] | undefined;
    }, {
        skill_domains?: any[] | undefined;
        skill_levels?: any[] | undefined;
        content_types?: ContentType[] | undefined;
        learning_objectives?: string[] | undefined;
        user_segments?: LearningAnalyticsSegment[] | undefined;
    }>>;
    performance_filters: z.ZodOptional<z.ZodObject<{
        min_completion_rate: z.ZodOptional<z.ZodNumber>;
        min_satisfaction_score: z.ZodOptional<z.ZodNumber>;
        min_skill_acquisition_rate: z.ZodOptional<z.ZodNumber>;
        time_range_minutes: z.ZodOptional<z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min: number;
            max: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        min_completion_rate?: number | undefined;
        min_satisfaction_score?: number | undefined;
        min_skill_acquisition_rate?: number | undefined;
        time_range_minutes?: {
            min: number;
            max: number;
        } | undefined;
    }, {
        min_completion_rate?: number | undefined;
        min_satisfaction_score?: number | undefined;
        min_skill_acquisition_rate?: number | undefined;
        time_range_minutes?: {
            min: number;
            max: number;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    learning_filters?: {
        skill_domains?: any[] | undefined;
        skill_levels?: any[] | undefined;
        content_types?: ContentType[] | undefined;
        learning_objectives?: string[] | undefined;
        user_segments?: LearningAnalyticsSegment[] | undefined;
    } | undefined;
    performance_filters?: {
        min_completion_rate?: number | undefined;
        min_satisfaction_score?: number | undefined;
        min_skill_acquisition_rate?: number | undefined;
        time_range_minutes?: {
            min: number;
            max: number;
        } | undefined;
    } | undefined;
}, {
    learning_filters?: {
        skill_domains?: any[] | undefined;
        skill_levels?: any[] | undefined;
        content_types?: ContentType[] | undefined;
        learning_objectives?: string[] | undefined;
        user_segments?: LearningAnalyticsSegment[] | undefined;
    } | undefined;
    performance_filters?: {
        min_completion_rate?: number | undefined;
        min_satisfaction_score?: number | undefined;
        min_skill_acquisition_rate?: number | undefined;
        time_range_minutes?: {
            min: number;
            max: number;
        } | undefined;
    } | undefined;
}>;
export type LearningAnalyticsEventInput = z.infer<typeof LearningAnalyticsEventSchema>;
export type LearningAnalyticsQueryInput = z.infer<typeof LearningAnalyticsQuerySchema>;
//# sourceMappingURL=LearningAnalyticsExtension.d.ts.map