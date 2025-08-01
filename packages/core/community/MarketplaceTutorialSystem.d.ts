/**
 * Epic 16 - Marketplace Tutorial System
 * Task: E16-1753114247090-BB71B5 - Design tutorial system
 *
 * Marketplace-specific tutorial system that integrates with existing tutorial player,
 * contribution architecture, and skill level tagging for comprehensive learning experience.
 */
import { Tutorial, TutorialStep, TutorialProgress, TutorialAction } from '../components/Epic16/TutorialPlayer';
import { ContributionSubmission, ContributionRepository } from './ContributionArchitecture';
import { SkillLevel, SkillDomain, SkillAssessmentEngine, UserSkillProfile, LearningGoal } from './SkillLevelTagging';
export type MarketplaceTutorialCategory = 'marketplace-basics' | 'template-discovery' | 'template-creation' | 'marketplace-selling' | 'community-engagement' | 'advanced-analytics' | 'monetization' | 'collaboration' | 'quality-standards' | 'customer-support';
export type TutorialInteractionType = 'marketplace-navigation' | 'template-search' | 'template-preview' | 'purchase-flow' | 'template-upload' | 'pricing-strategy' | 'analytics-review' | 'community-contribution' | 'review-management' | 'support-interaction';

}
}
export interface MarketplaceTutorial extends Tutorial { marketplace_category: MarketplaceTutorialCategory;
    skill_requirements: Array<{
        domain: SkillDomain;
        level: SkillLevel;
        critical: boolean }>;
    skill_outcomes: Array<{ domain: SkillDomain;
        target_level: SkillLevel;
        competencies: string[] }>;
    marketplace_context: { user_roles: ('buyer' | 'seller' | 'creator' | 'contributor' | 'admin')[];
        template_types: string[];
        use_cases: string[];
        business_objectives: string[] };
    integration_points: { requires_real_templates: boolean;
        requires_marketplace_account: boolean;
        requires_payment_setup: boolean;
        requires_community_profile: boolean };
    success_metrics: { completion_threshold: number;
        time_limit_minutes?: number;
        accuracy_threshold?: number;
        engagement_score_target?: number };
    adaptive_elements: { personalizes_to_role: boolean;
        adjusts_to_skill_level: boolean;
        recommends_next_tutorials: boolean;
        integrates_user_data: boolean };

}
}
export interface MarketplaceTutorialStep extends TutorialStep { marketplace_interactions: MarketplaceTutorialInteraction[];
    real_world_context: {
        scenario_description: string;
        business_context: string;
        success_criteria: string[];
        common_mistakes: string[] };
    skill_checkpoints: SkillCheckpoint[];
    personalization: { role_specific_content: Record<string, string>;
        skill_level_variations: Record<SkillLevel, StepVariation>;
        user_data_integration: UserDataIntegration[] };

}
}
export interface MarketplaceTutorialInteraction extends TutorialAction { interaction_type: TutorialInteractionType;
    marketplace_element: string;
    validation_criteria: ValidationCriterion[];
    help_resources: {
        tooltip_text?: string;
        help_article_id?: string;
        video_explanation?: string;
        community_examples?: string[] };
    analytics_tracking: { event_name: string;
        parameters: Record<string, any>;
        success_metrics: string[] };

}
}
export interface SkillCheckpoint { skill_domain: SkillDomain;
    checkpoint_type: 'knowledge' | 'practical' | 'application' | 'mastery';
    assessment_method: 'quiz' | 'demonstration' | 'task_completion' | 'peer_evaluation';
    passing_criteria: {
        minimum_score?: number;
        required_actions?: string[];
        time_limit_seconds?: number;
        accuracy_threshold?: number }
}
    };
    feedback_mechanism: { immediate_feedback: boolean;
        detailed_explanation: boolean;
        improvement_suggestions: boolean;
        skill_gap_analysis: boolean };

}
}
export interface StepVariation { content_complexity: 'simplified' | 'standard' | 'advanced' | 'expert';
    explanation_depth: 'basic' | 'detailed' | 'comprehensive';
    example_sophistication: 'simple' | 'realistic' | 'complex';
    practice_difficulty: 'guided' | 'semi_guided' | 'independent' }
}
}
export interface UserDataIntegration { data_source: 'user_profile' | 'purchase_history' | 'creation_history' | 'engagement_metrics';
    integration_type: 'content_personalization' | 'example_selection' | 'difficulty_adjustment' | 'recommendation_enhancement';
    data_fields: string[];
    privacy_considerations: string[] }
}
}
export interface ValidationCriterion { criterion_type: 'element_interaction' | 'data_entry' | 'navigation' | 'completion_state';
    validation_method: 'dom_inspection' | 'api_verification' | 'user_confirmation' | 'automated_detection';
    success_condition: string;
    error_messages: {
        validation_failed: string;
        help_suggestion: string;
        retry_guidance: string }
}
    };

}
}
export interface MarketplaceTutorialService { discoverTutorials(userProfile: UserSkillProfile, context: TutorialDiscoveryContext): Promise<MarketplaceTutorial[]>;
    recommendNextTutorials(userId: string, completedTutorialId: string): Promise<MarketplaceTutorial[]>;
    getPersonalizedLearningPath(userId: string, goals: LearningGoal[]): Promise<LearningPath>;
    startTutorial(userId: string, tutorialId: string, context: TutorialExecutionContext): Promise<TutorialSession>;
    updateTutorialProgress(sessionId: string, stepProgress: StepProgress): Promise<TutorialProgress>;
    completeTutorial(sessionId: string, completionData: TutorialCompletionData): Promise<TutorialCompletionResult>;
    contributeTutorial(tutorialSubmission: CommunityTutorialSubmission): Promise<ContributionSubmission>;
    reviewTutorialContribution(contributionId: string, reviewData: TutorialReviewData): Promise<void>;
    publishCommunityTutorial(contributionId: string): Promise<MarketplaceTutorial>;
    analyzeTutorialEffectiveness(tutorialId: string): Promise<TutorialAnalytics>;
    identifyImprovementOpportunities(tutorialId: string): Promise<ImprovementRecommendation[]>;
    generateUsageInsights(timeRange?: string): Promise<TutorialSystemInsights> }
}
}
export interface TutorialDiscoveryContext { user_role: 'buyer' | 'seller' | 'creator' | 'contributor' | 'admin';
    skill_focus: SkillDomain[];
    time_availability: number;
    learning_style: 'visual' | 'hands_on' | 'reading' | 'interactive';
    current_challenges: string[];
    business_objectives: string[] }
}
}
export interface TutorialExecutionContext { execution_mode: 'guided' | 'self_paced' | 'practice' | 'assessment';
    real_data_mode: boolean;
    collaboration_enabled: boolean;
    mentor_support_available: boolean;
    integration_testing: boolean }
}
}
export interface TutorialSession { session_id: string;
    user_id: string;
    tutorial_id: string;
    started_at: string;
    current_step_index: number;
    personalization_applied: PersonalizationSettings;
    real_world_context: RealWorldContext;
    progress_tracking: ProgressTracking;
    support_resources: SupportResource[] }
}
}
export interface PersonalizationSettings { role_customization: string;
    skill_level_adjustments: Record<SkillDomain, SkillLevel>;
    content_preferences: ContentPreference[];
    example_personalization: ExamplePersonalization;
    difficulty_adaptation: DifficultyAdaptation }
}
}
export interface RealWorldContext { simulated_scenario: {
        business_situation: string;
        marketplace_conditions: string;
        user_goals: string[];
        success_metrics: string[] }
}
    };
    live_marketplace_integration: { uses_real_templates: boolean;
        connects_to_analytics: boolean;
        affects_real_data: boolean;
        requires_permissions: string[] };

}
}
export interface ProgressTracking { skill_development: Record<SkillDomain, SkillProgressMetric>;
    interaction_completion: Record<string, InteractionResult>;
    time_tracking: TimeTracking;
    engagement_metrics: EngagementMetric[];
    milestone_achievements: MilestoneAchievement[] }
}
}
export interface StepProgress { step_id: string;
    completed_interactions: string[];
    skill_demonstrations: SkillDemonstration[];
    time_spent_seconds: number;
    help_requests: HelpRequest[];
    errors_encountered: ErrorEncounter[];
    feedback_provided: string[] }
}
}
export interface TutorialCompletionData { final_score: number;
    skills_acquired: SkillAcquisition[];
    real_world_application: RealWorldApplication;
    user_feedback: UserFeedback;
    improvement_suggestions: string[];
    next_learning_goals: LearningGoal[] }
}
}
export interface TutorialCompletionResult { completion_certificate: CompletionCertificate;
    skill_level_updates: SkillLevelUpdate[];
    earned_achievements: Achievement[];
    recommended_next_tutorials: MarketplaceTutorial[];
    community_recognition: CommunityRecognition;
    marketplace_benefits: MarketplaceBenefit[] }
}
}
export interface CommunityTutorialSubmission { basic_info: {
        title: string;
        description: string;
        category: MarketplaceTutorialCategory;
        target_audience: string[];
        estimated_time_minutes: number }
}
    };
    content_structure: { learning_objectives: string[];
        prerequisites: SkillRequirement[];
        tutorial_steps: CommunityTutorialStepSubmission[];
        assessment_methods: AssessmentMethod[] };
    marketplace_integration: { required_marketplace_features: string[];
        template_dependencies: string[];
        real_data_requirements: string[];
        permission_requirements: string[] };
    quality_assurance: { self_testing_completed: boolean;
        accessibility_compliance: boolean;
        content_accuracy_verified: boolean;
        user_testing_feedback: UserTestingFeedback[] };
    contribution_metadata: { author_expertise: ExpertiseCredential[];
        collaboration_openness: 'individual' | 'collaborative' | 'community';
        maintenance_commitment: MaintenanceCommitment;
        licensing_terms: LicensingTerms };

}
}
export interface CommunityTutorialStepSubmission { step_content: Omit<MarketplaceTutorialStep, 'id'>;
    validation_data: {
        tested_interactions: string[];
        verified_outcomes: string[];
        accessibility_checked: boolean;
        cross_browser_tested: boolean }
}
    };
    author_notes: { implementation_notes: string[];
        known_limitations: string[];
        improvement_suggestions: string[];
        maintenance_requirements: string[] };

}
}
export interface TutorialReviewData { content_quality: {
        accuracy_score: number;
        clarity_score: number;
        completeness_score: number;
        engagement_score: number }
}
    };
    technical_validation: { interaction_testing_results: InteractionTestResult[];
        marketplace_integration_verification: IntegrationVerification[];
        accessibility_compliance: AccessibilityCheck[];
        performance_assessment: PerformanceMetric[] };
    educational_effectiveness: { learning_objective_alignment: number;
        skill_development_potential: number;
        real_world_applicability: number;
        progression_logic: number };
    community_value: { uniqueness_score: number;
        market_demand_score: number;
        contribution_quality: number;
        maintenance_sustainability: number };
    improvement_recommendations: ImprovementRecommendation[];
    approval_recommendation: 'approve' | 'approve_with_conditions' | 'request_revision' | 'reject';

}
}
export interface TutorialAnalytics { tutorial_id: string;
    analysis_period: string;
    engagement_metrics: {
        total_starts: number;
        completion_rate: number;
        average_time_to_complete: number;
        step_completion_rates: Record<string, number>;
        drop_off_points: DropOffAnalysis[];
        user_satisfaction_score: number }
}
    };
    learning_effectiveness: { skill_acquisition_rate: Record<SkillDomain, number>;
        knowledge_retention_score: number;
        real_world_application_success: number;
        user_confidence_improvement: number };
    community_impact: { marketplace_adoption_influence: number;
        community_discussion_generation: number;
        follow_up_contribution_rate: number;
        knowledge_sharing_amplification: number };
    technical_performance: { interaction_success_rates: Record<string, number>;
        error_frequency: ErrorFrequencyAnalysis[];
        performance_bottlenecks: PerformanceBottleneck[];
        accessibility_compliance_score: number };

}
}
export interface TutorialSystemInsights { time_period: string;
    system_health: {
        total_active_tutorials: number;
        average_completion_rate: number;
        user_engagement_trend: 'increasing' | 'stable' | 'declining';
        content_quality_score: number }
}
    };
    user_behavior_patterns: { popular_learning_paths: LearningPathPopularity[];
        skill_development_trends: SkillTrend[];
        user_progression_patterns: ProgressionPattern[];
        content_preference_analysis: ContentPreferenceAnalysis };
    marketplace_impact: { tutorial_to_marketplace_conversion: number;
        skill_development_to_revenue_correlation: number;
        community_contribution_growth: number;
        user_retention_improvement: number };
    content_optimization_opportunities: { high_impact_content_gaps: ContentGap[];
        underperforming_tutorials: TutorialPerformanceIssue[];
        improvement_priorities: ImprovementPriority[];
        community_contribution_opportunities: ContributionOpportunity[] };

}
}
export interface LearningPath { path_id: string;
    name: string;
    description: string;
    target_user_profile: UserProfilePattern;
    estimated_duration_hours: number;
    path_structure: {
        prerequisite_tutorials: string[];
        core_tutorial_sequence: PathTutorialEntry[];
        optional_enrichment_tutorials: string[];
        capstone_project?: CapstoneProject }
}
    };
    skill_progression: { entry_requirements: SkillRequirement[];
        intermediate_milestones: SkillMilestone[];
        completion_outcomes: SkillOutcome[];
        continuing_education_paths: string[] };
    personalization: { role_based_variations: Record<string, RoleVariation>;
        skill_based_adaptations: Record<SkillLevel, SkillAdaptation>;
        context_based_modifications: ContextModification[] };
    success_tracking: { completion_criteria: CompletionCriterion[];
        progress_milestones: ProgressMilestone[];
        assessment_points: AssessmentPoint[];
        success_metrics: SuccessMetric[] };

}
}
export interface SkillRequirement { domain: SkillDomain;
    minimum_level: SkillLevel;
    critical: boolean;
    alternative_paths: string[] }
}
}
export interface SkillAcquisition { domain: SkillDomain;
    previous_level: SkillLevel;
    achieved_level: SkillLevel;
    competencies_gained: string[];
    confidence_score: number }
}
}
export interface ExpertiseCredential { credential_type: 'certification' | 'experience' | 'education' | 'portfolio' | 'community_recognition';
    credential_name: string;
    issuing_authority?: string;
    verification_status: 'verified' | 'pending' | 'self_reported';
    relevance_score: number }
}
}
export interface MaintenanceCommitment { commitment_level: 'basic' | 'regular' | 'comprehensive';
    update_frequency: 'as_needed' | 'quarterly' | 'monthly' | 'weekly';
    response_time_hours: number;
    collaboration_willingness: boolean }
}
}
export interface LicensingTerms { license_type: 'MIT' | 'Creative_Commons' | 'Proprietary' | 'Custom';
    commercial_use_allowed: boolean;
    modification_allowed: boolean;
    attribution_required: boolean;
    share_alike_required: boolean }
}
}
export interface InteractionTestResult { interaction_id: string;
    test_status: 'passed' | 'failed' | 'warning';
    test_details: string;
    performance_metrics: PerformanceMetric[];
    accessibility_issues: string[] }
}
}
export interface IntegrationVerification { integration_point: string;
    verification_status: 'verified' | 'failed' | 'partial';
    test_results: string[];
    performance_impact: number;
    security_considerations: string[] }
}
}
export interface AccessibilityCheck { check_type: string;
    compliance_level: 'AA' | 'AAA' | 'non_compliant';
    issues_found: string[];
    recommendations: string[] }
}
}
export interface PerformanceMetric { metric_name: string;
    measurement_value: number;
    measurement_unit: string;
    benchmark_comparison: 'above' | 'at' | 'below';
    impact_assessment: 'high' | 'medium' | 'low' }
}
}
export interface DropOffAnalysis { step_id: string;
    drop_off_rate: number;
    common_exit_reasons: string[];
    user_feedback: string[];
    improvement_suggestions: string[] }
}
}
export interface ErrorFrequencyAnalysis { error_type: string;
    occurrence_count: number;
    affected_user_percentage: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    resolution_priority: number }
}
}
export interface ContentGap { gap_type: 'skill_coverage' | 'user_role' | 'marketplace_feature' | 'difficulty_level';
    gap_description: string;
    affected_user_segments: string[];
    business_impact: 'high' | 'medium' | 'low';
    effort_estimate: number }
}
}
export interface ImprovementPriority {
    improvement_type: string;
    priority_score: number;
    expected_impact: string;
    effort_required: string;
    timeline_estimate: string;

export declare class MarketplaceTutorialSystemService implements MarketplaceTutorialService {
    private apiClient;
    private skillAssessmentEngine;
    private contributionRepository;
    constructor(apiClient: any, skillAssessmentEngine: SkillAssessmentEngine, contributionRepository: ContributionRepository);
    discoverTutorials(userProfile: UserSkillProfile, context: TutorialDiscoveryContext): Promise<MarketplaceTutorial[]>;
    recommendNextTutorials(userId: string, completedTutorialId: string): Promise<MarketplaceTutorial[]>;
    getPersonalizedLearningPath(userId: string, goals: LearningGoal[]): Promise<LearningPath>;
    startTutorial(userId: string, tutorialId: string, context: TutorialExecutionContext): Promise<TutorialSession>;
    updateTutorialProgress(sessionId: string, stepProgress: StepProgress): Promise<TutorialProgress>;
    completeTutorial(sessionId: string, completionData: TutorialCompletionData): Promise<TutorialCompletionResult>;
    contributeTutorial(tutorialSubmission: CommunityTutorialSubmission): Promise<ContributionSubmission>;
    reviewTutorialContribution(contributionId: string, reviewData: TutorialReviewData): Promise<void>;
    publishCommunityTutorial(contributionId: string): Promise<MarketplaceTutorial>;
    analyzeTutorialEffectiveness(tutorialId: string): Promise<TutorialAnalytics>;
    identifyImprovementOpportunities(tutorialId: string): Promise<ImprovementRecommendation[]>;
    generateUsageInsights(timeRange?: string): Promise<TutorialSystemInsights>;
    private identifySkillGaps;
    private fetchTutorialsByContext;
    private rankTutorialsByRelevance;
    private applyTutorialPersonalization;
    private getUserSkillProfile;

//# sourceMappingURL=MarketplaceTutorialSystem.d.ts.map
}
}