/**
 * Epic 16 - Marketplace Content Filtering System
 * Task: E16-1753114247062-9DDA29 - Build content filtering system
 *
 * Enhanced content filtering system that integrates with marketplace, community,
 * and learning components. Provides real-time filtering, quality gates, and
 * intelligent content categorization for the Epic 16 ecosystem.
 */
import { AutomatedModerationService } from '../services/AutomatedModerationService';
import { ContributionSubmission, QualityGateResult } from './ContributionArchitecture';
import { SkillLevel, SkillDomain } from './SkillLevelTagging';
export type MarketplaceContentType = 'template_listing' | 'template_description' | 'template_metadata' | 'user_review' | 'marketplace_comment' | 'seller_profile' | 'tutorial_content' | 'knowledge_article' | 'community_post' | 'case_study' | 'help_content' | 'user_feedback' | 'contribution_submission';
export type FilteringCategory = 'content_quality' | 'marketplace_standards' | 'community_guidelines' | 'learning_effectiveness' | 'safety_compliance' | 'business_policy' | 'intellectual_property' | 'user_experience' | 'accessibility_standards' | 'localization_quality';
export type FilteringSeverity = 'info' | 'warning' | 'error' | 'critical' | 'blocking';
export type FilteringAction = 'allow' | 'allow_with_warnings' | 'require_review' | 'require_improvements' | 'block_publication' | 'quarantine_content' | 'escalate_to_expert' | 'request_additional_info' | 'suggest_alternative_category' | 'recommend_skill_level_change';
export interface ContentFilteringRequest {
    id: string;
    content_type: MarketplaceContentType;
    content_data: {
        title?: string;
        description?: string;
        body?: string;
        metadata?: Record<string, any>;
        tags?: string[];
        category?: string;
        skill_level?: SkillLevel;
        target_audience?: string[];
    };
    context: {
        user_id: string;
        user_role: 'buyer' | 'seller' | 'creator' | 'contributor' | 'moderator';
        submission_type: 'new' | 'update' | 'revision';
        marketplace_context?: MarketplaceContext;
        community_context?: CommunityContext;
        learning_context?: LearningContext;
    };
    integration_data: {
        contribution_id?: string;
        template_id?: string;
        tutorial_id?: string;
        learning_path_id?: string;
        related_content_ids?: string[];
    };
    filtering_config: {
        categories_to_check: FilteringCategory[];
        strictness_level: 'permissive' | 'standard' | 'strict' | 'enterprise';
        auto_fix_enabled: boolean;
        learning_mode: boolean;
        priority: 'low' | 'medium' | 'high' | 'urgent';
    };
}
export interface MarketplaceContext {
    template_type?: string;
    pricing_tier?: 'free' | 'premium' | 'enterprise';
    target_market?: string[];
    business_model?: string;
    competition_level?: 'low' | 'medium' | 'high';
    revenue_impact?: 'low' | 'medium' | 'high';
}
export interface CommunityContext {
    community_id?: string;
    discussion_thread_id?: string;
    parent_content_id?: string;
    community_role?: 'member' | 'contributor' | 'moderator' | 'expert';
    reputation_score?: number;
}
export interface LearningContext {
    skill_domain?: SkillDomain;
    target_skill_level?: SkillLevel;
    learning_objectives?: string[];
    prerequisite_content?: string[];
    learning_path_position?: 'foundation' | 'core' | 'advanced' | 'specialization';
}
export interface ContentFilteringResult {
    id: string;
    request_id: string;
    overall_decision: FilteringAction;
    overall_confidence: number;
    processing_time_ms: number;
    category_results: CategoryFilterResult[];
    quality_assessment: {
        overall_score: number;
        content_completeness: number;
        language_quality: number;
        technical_accuracy: number;
        user_experience_score: number;
        accessibility_score: number;
    };
    marketplace_analysis: {
        market_fit_score: number;
        competitive_differentiation: number;
        monetization_potential: number;
        user_demand_indicator: number;
        template_effectiveness_prediction: number;
    };
    community_integration: {
        knowledge_value_score: number;
        community_engagement_potential: number;
        expertise_level_match: number;
        contribution_uniqueness: number;
    };
    learning_effectiveness?: {
        skill_development_potential: number;
        learning_objective_alignment: number;
        difficulty_appropriateness: number;
        engagement_prediction: number;
        retention_likelihood: number;
    };
    issues_found: ContentIssue[];
    improvement_suggestions: ImprovementSuggestion[];
    auto_fix_suggestions: AutoFixSuggestion[];
    requires_human_review: boolean;
    review_priority: 'low' | 'medium' | 'high' | 'urgent';
    recommended_reviewer_type: 'general' | 'domain_expert' | 'accessibility_expert' | 'legal_reviewer';
    escalation_path?: string[];
    compliance_status: ComplianceStatus;
    safety_assessment: SafetyAssessment;
    timestamp: string;
    filtering_version: string;
    model_versions: Record<string, string>;
}
export interface CategoryFilterResult {
    category: FilteringCategory;
    status: 'passed' | 'warning' | 'failed' | 'not_applicable';
    score: number;
    confidence: number;
    severity: FilteringSeverity;
    specific_checks: SpecificCheckResult[];
    category_recommendations: string[];
    compliance_notes: string[];
}
export interface SpecificCheckResult {
    check_name: string;
    check_type: 'automated' | 'rule_based' | 'ml_powered' | 'policy_based';
    status: 'passed' | 'warning' | 'failed';
    score?: number;
    details: string;
    evidence?: string[];
    fix_suggestions?: string[];
}
export interface ContentIssue {
    issue_id: string;
    issue_type: 'quality' | 'policy' | 'safety' | 'accessibility' | 'technical' | 'business';
    severity: FilteringSeverity;
    category: FilteringCategory;
    description: string;
    location?: string;
    evidence: string[];
    impact_assessment: {
        user_experience_impact: 'low' | 'medium' | 'high';
        business_impact: 'low' | 'medium' | 'high';
        compliance_risk: 'low' | 'medium' | 'high';
        reputation_risk: 'low' | 'medium' | 'high';
    };
    resolution_required: boolean;
    resolution_deadline?: string;
}
export interface ImprovementSuggestion {
    suggestion_id: string;
    suggestion_type: 'content_enhancement' | 'structure_improvement' | 'quality_upgrade' | 'accessibility_fix';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    rationale: string;
    implementation: {
        difficulty: 'easy' | 'medium' | 'hard';
        estimated_time_minutes: number;
        required_expertise: string[];
        automated_assistance_available: boolean;
    };
    expected_impact: {
        quality_improvement: number;
        user_satisfaction_improvement: number;
        marketplace_performance_boost: number;
        community_engagement_boost: number;
    };
}
export interface AutoFixSuggestion {
    fix_id: string;
    fix_type: 'text_correction' | 'formatting_fix' | 'metadata_enhancement' | 'structure_optimization';
    description: string;
    confidence: number;
    current_content: string;
    suggested_content: string;
    application_method: 'automatic' | 'user_approval_required' | 'manual_implementation';
    risk_level: 'low' | 'medium' | 'high';
    validation_required: boolean;
    rollback_possible: boolean;
}
export interface ComplianceStatus {
    overall_compliant: boolean;
    compliance_score: number;
    policy_compliance: {
        community_guidelines: boolean;
        marketplace_terms: boolean;
        content_policy: boolean;
        intellectual_property: boolean;
        accessibility_standards: boolean;
    };
    regulatory_compliance: {
        data_protection: boolean;
        consumer_protection: boolean;
        advertising_standards: boolean;
        content_labeling: boolean;
    };
    platform_standards: {
        quality_thresholds: boolean;
        technical_requirements: boolean;
        user_experience_standards: boolean;
        performance_requirements: boolean;
    };
    violations_found: ComplianceViolation[];
}
export interface ComplianceViolation {
    violation_type: string;
    severity: FilteringSeverity;
    description: string;
    resolution_required: boolean;
    grace_period_days?: number;
    escalation_required: boolean;
}
export interface SafetyAssessment {
    overall_safe: boolean;
    safety_score: number;
    content_safety: {
        toxicity_level: number;
        spam_probability: number;
        misinformation_risk: number;
        harmful_content_detected: boolean;
    };
    user_safety: {
        privacy_risk: number;
        security_risk: number;
        financial_risk: number;
        reputation_risk: number;
    };
    community_safety: {
        disruption_potential: number;
        abuse_potential: number;
        manipulation_risk: number;
        trust_erosion_risk: number;
    };
    safety_recommendations: string[];
    monitoring_requirements: string[];
}
export interface MarketplaceContentFilteringService {
    filterContent(request: ContentFilteringRequest): Promise<ContentFilteringResult>;
    batchFilterContent(requests: ContentFilteringRequest[]): Promise<ContentFilteringResult[]>;
    revalidateContent(contentId: string, reason: string): Promise<ContentFilteringResult>;
    filterContribution(contribution: ContributionSubmission): Promise<ContentFilteringResult>;
    filterTemplateSubmission(templateData: TemplateSubmissionData): Promise<ContentFilteringResult>;
    filterTutorialContent(tutorialData: TutorialContentData): Promise<ContentFilteringResult>;
    filterCommunityContent(communityData: CommunityContentData): Promise<ContentFilteringResult>;
    filterContentStream(contentStream: AsyncIterable<ContentFilteringRequest>): AsyncIterable<ContentFilteringResult>;
    validateContentUpdate(contentId: string, updateData: any): Promise<ContentFilteringResult>;
    executeQualityGates(contentId: string, gateConfig: QualityGateConfiguration): Promise<QualityGateResult[]>;
    getFilteringAnalytics(timeRange: string): Promise<FilteringAnalytics>;
    getContentQualityTrends(contentType: MarketplaceContentType, timeRange: string): Promise<QualityTrend[]>;
    identifyFilteringPatterns(): Promise<FilteringPattern[]>;
    updateFilteringRules(rules: FilteringRule[]): Promise<void>;
    getFilteringConfiguration(): Promise<FilteringConfiguration>;
    calibrateFilteringThresholds(calibrationData: CalibrationData): Promise<ThresholdCalibration>;
}
export interface TemplateSubmissionData {
    template_id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    price: number;
    content_preview: string;
    full_content: any;
    target_audience: string[];
    use_cases: string[];
    technical_requirements: string[];
}
export interface TutorialContentData {
    tutorial_id: string;
    title: string;
    description: string;
    skill_domain: SkillDomain;
    skill_level: SkillLevel;
    learning_objectives: string[];
    content_structure: any;
    assessment_methods: string[];
    prerequisites: string[];
}
export interface CommunityContentData {
    content_id: string;
    content_type: 'post' | 'comment' | 'discussion' | 'knowledge_share';
    title?: string;
    body: string;
    community_id: string;
    author_reputation: number;
    tags: string[];
    related_topics: string[];
}
export interface QualityGateConfiguration {
    gate_name: string;
    quality_thresholds: Record<string, number>;
    blocking_conditions: string[];
    warning_conditions: string[];
    auto_fix_enabled: boolean;
    escalation_rules: EscalationRule[];
}
export interface EscalationRule {
    condition: string;
    escalation_type: 'immediate' | 'delayed' | 'conditional';
    escalation_target: string;
    notification_required: boolean;
}
export interface FilteringAnalytics {
    total_content_filtered: number;
    filtering_success_rate: number;
    average_processing_time: number;
    decision_breakdown: Record<FilteringAction, number>;
    category_performance: Record<FilteringCategory, CategoryPerformance>;
    quality_score_distribution: QualityDistribution;
    false_positive_rate: number;
    false_negative_rate: number;
    user_satisfaction_with_filtering: number;
}
export interface CategoryPerformance {
    total_checks: number;
    success_rate: number;
    average_confidence: number;
    common_issues: Array<{
        issue: string;
        frequency: number;
    }>;
    improvement_trend: 'improving' | 'stable' | 'declining';
}
export interface QualityDistribution {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    unacceptable: number;
}
export interface QualityTrend {
    date: string;
    average_quality_score: number;
    volume: number;
    notable_patterns: string[];
}
export interface FilteringPattern {
    pattern_type: 'quality_degradation' | 'category_shift' | 'user_behavior' | 'seasonal_variation';
    pattern_description: string;
    confidence: number;
    affected_content_types: MarketplaceContentType[];
    recommended_actions: string[];
    monitoring_priority: 'low' | 'medium' | 'high';
}
export interface FilteringRule {
    rule_id: string;
    rule_name: string;
    category: FilteringCategory;
    content_types: MarketplaceContentType[];
    conditions: FilteringCondition[];
    actions: FilteringRuleAction[];
    priority: number;
    enabled: boolean;
    learning_enabled: boolean;
    metadata: {
        created_by: string;
        created_at: string;
        updated_at: string;
        version: string;
    };
}
export interface FilteringCondition {
    condition_type: 'text_pattern' | 'metadata_check' | 'ml_prediction' | 'policy_violation';
    condition_config: Record<string, any>;
    threshold?: number;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches_pattern';
}
export interface FilteringRuleAction {
    action_type: FilteringAction;
    action_config: Record<string, any>;
    confidence_required: number;
    auto_execute: boolean;
    notification_required: boolean;
}
export interface FilteringConfiguration {
    global_settings: {
        default_strictness: 'permissive' | 'standard' | 'strict' | 'enterprise';
        auto_fix_enabled: boolean;
        learning_mode_enabled: boolean;
        real_time_filtering: boolean;
    };
    category_settings: Record<FilteringCategory, CategorySettings>;
    content_type_settings: Record<MarketplaceContentType, ContentTypeSettings>;
    integration_settings: {
        moderation_service_enabled: boolean;
        contribution_workflow_integration: boolean;
        analytics_tracking_enabled: boolean;
        quality_gate_enforcement: boolean;
    };
    performance_settings: {
        batch_size: number;
        timeout_ms: number;
        retry_attempts: number;
        cache_enabled: boolean;
        cache_ttl_minutes: number;
    };
}
export interface CategorySettings {
    enabled: boolean;
    strictness_multiplier: number;
    auto_fix_enabled: boolean;
    human_review_threshold: number;
    escalation_enabled: boolean;
}
export interface ContentTypeSettings {
    quality_threshold: number;
    required_categories: FilteringCategory[];
    optional_categories: FilteringCategory[];
    auto_approve_threshold: number;
    block_threshold: number;
}
export interface CalibrationData {
    historical_decisions: HistoricalDecision[];
    user_feedback: UserFeedback[];
    business_metrics: BusinessMetric[];
    quality_benchmarks: QualityBenchmark[];
}
export interface HistoricalDecision {
    content_id: string;
    filtering_result: ContentFilteringResult;
    actual_outcome: 'successful' | 'problematic' | 'excellent';
    user_satisfaction: number;
    business_impact: number;
}
export interface UserFeedback {
    content_id: string;
    feedback_type: 'quality_rating' | 'relevance_rating' | 'issue_report' | 'improvement_suggestion';
    feedback_data: any;
    user_context: any;
}
export interface BusinessMetric {
    metric_name: string;
    metric_value: number;
    content_correlation: number;
    quality_correlation: number;
}
export interface QualityBenchmark {
    benchmark_name: string;
    target_score: number;
    current_performance: number;
    improvement_required: number;
}
export interface ThresholdCalibration {
    calibration_id: string;
    calibration_date: string;
    recommended_thresholds: Record<string, number>;
    confidence_intervals: Record<string, [number, number]>;
    expected_performance_improvement: number;
    validation_results: ValidationResult[];
    rollback_plan: RollbackPlan;
}
export interface ValidationResult {
    validation_type: string;
    success_rate: number;
    false_positive_rate: number;
    false_negative_rate: number;
    user_satisfaction_impact: number;
}
export interface RollbackPlan {
    rollback_trigger_conditions: string[];
    rollback_procedure: string[];
    rollback_timeline_hours: number;
    notification_requirements: string[];
}
export declare class MarketplaceContentFilteringServiceImpl implements MarketplaceContentFilteringService {
    private moderationService;
    private apiClient;
    private configuration;
    private filteringRules;
    constructor(moderationService: AutomatedModerationService, apiClient: any, configuration?: Partial<FilteringConfiguration>);
    filterContent(request: ContentFilteringRequest): Promise<ContentFilteringResult>;
    batchFilterContent(requests: ContentFilteringRequest[]): Promise<ContentFilteringResult[]>;
    revalidateContent(contentId: string, reason: string): Promise<ContentFilteringResult>;
    filterContribution(contribution: ContributionSubmission): Promise<ContentFilteringResult>;
    filterTemplateSubmission(templateData: TemplateSubmissionData): Promise<ContentFilteringResult>;
    filterTutorialContent(tutorialData: TutorialContentData): Promise<ContentFilteringResult>;
    filterCommunityContent(communityData: CommunityContentData): Promise<ContentFilteringResult>;
    filterContentStream(contentStream: AsyncIterable<ContentFilteringRequest>): AsyncIterable<ContentFilteringResult>;
    validateContentUpdate(contentId: string, updateData: any): Promise<ContentFilteringResult>;
    executeQualityGates(contentId: string, gateConfig: QualityGateConfiguration): Promise<QualityGateResult[]>;
    getFilteringAnalytics(timeRange: string): Promise<FilteringAnalytics>;
    getContentQualityTrends(contentType: MarketplaceContentType, timeRange: string): Promise<QualityTrend[]>;
    identifyFilteringPatterns(): Promise<FilteringPattern[]>;
    updateFilteringRules(rules: FilteringRule[]): Promise<void>;
    getFilteringConfiguration(): Promise<FilteringConfiguration>;
    calibrateFilteringThresholds(calibrationData: CalibrationData): Promise<ThresholdCalibration>;
    private prepareModerationRequest;
    private mapContentType;
    private runCategoryFiltering;
    private runSingleCategoryFilter;
    private performQualityAssessment;
    private initializeDefaultConfiguration;
    private initializeDefaultRules;
    private analyzeMarketplaceFit;
    private assessCommunityIntegration;
    private evaluateLearningEffectiveness;
    private identifyIssuesAndSuggestions;
    private determineOverallDecision;
    private assessCompliance;
    private assessSafety;
    private determineReviewRequirements;
    private trackFilteringEvent;
    private fetchContentData;
    private logRevalidation;
}
//# sourceMappingURL=MarketplaceContentFilteringSystem.d.ts.map