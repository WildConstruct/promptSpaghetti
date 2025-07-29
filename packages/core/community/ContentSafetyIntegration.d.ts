/**
 * Epic 16 - Content Safety Integration
 * Tasks: E16-1753114247062-9DDA29 & E16-1753114247061-797978
 *
 * Unified content safety system that integrates content filtering and automated
 * moderation with the Epic 16 marketplace, community, and learning ecosystems.
 * Provides comprehensive safety coverage from submission to publication.
 */
import { MarketplaceContentFilteringService, ContentFilteringResult, MarketplaceContentType } from './MarketplaceContentFilteringSystem';
import { EnhancedModerationService, EnhancedModerationResult, ModerationPriority } from './EnhancedAutomatedModerationSystem';
import { ContributionManagementService, ContributionSubmission } from './ContributionManagementService';
import { MarketplaceTutorialSystemService } from './MarketplaceTutorialSystem';
import { LearningAnalyticsServiceImpl } from '../analytics/LearningAnalyticsService';
export type ContentSafetyStage = 'intake' | 'pre_filtering' | 'deep_analysis' | 'moderation' | 'quality_gates' | 'community_review' | 'final_approval' | 'post_publication' | 'appeals' | 'escalation';
export type SafetyDecision = 'approve' | 'approve_with_monitoring' | 'conditional_approval' | 'require_improvements' | 'require_review' | 'quarantine' | 'reject' | 'block' | 'escalate';
export type SafetyRisk = 'low' | 'medium' | 'high' | 'critical';

export interface ContentSafetyRequest {
    id: string;
    content_id: string;
    content_type: MarketplaceContentType;
    content_data: {
        title?: string;
        description?: string;
        body?: string;
        metadata?: Record<string, any>;
        attachments?: ContentAttachment[];
    };
    submission_context: {
        submitter_id: string;
        submission_type: 'new' | 'update' | 'revision' | 'appeal';
        submission_source: 'marketplace' | 'community' | 'tutorial' | 'api';
        urgency: ModerationPriority;
    };
    integration_context: {
        contribution_id?: string;
        template_id?: string;
        tutorial_id?: string;
        learning_path_id?: string;
        parent_content_id?: string;
        workflow_stage?: string;
    };
    safety_config: {
        enable_filtering: boolean;
        enable_moderation: boolean;
        enable_community_review: boolean;
        strictness_level: 'permissive' | 'standard' | 'strict' | 'maximum';
        auto_publish_threshold: number;
        human_review_threshold: number;
    };
    business_context: {
        revenue_impact: 'none' | 'low' | 'medium' | 'high';
        brand_sensitivity: 'low' | 'medium' | 'high';
        regulatory_requirements: string[];
        stakeholder_visibility: 'internal' | 'public' | 'regulatory'
  };

export interface ContentAttachment {
    attachment_id: string;
    attachment_type: 'image' | 'video' | 'document' | 'code' | 'data';
    file_name: string;
    file_size: number;
    content_type: string;
    safety_scanned: boolean;
    scan_results?: AttachmentScanResult;

export interface AttachmentScanResult {
    virus_scan_clean: boolean;
    content_analysis: {
        inappropriate_content: boolean;
        copyright_issues: boolean;
        privacy_concerns: boolean;
        security_risks: boolean;
    };
    metadata_analysis: {
        personal_data_detected: boolean;
        sensitive_information: string[];
        compliance_issues: string[];
    };

export interface ContentSafetyResult {
    id: string;
    request_id: string;
    content_id: string;
    overall_decision: SafetyDecision;
    overall_risk: SafetyRisk;
    confidence_score: number;
    stage_results: SafetyStageResult[];
    filtering_result?: ContentFilteringResult;
    moderation_result?: EnhancedModerationResult;
    safety_assessment: SafetyAssessment;
    risk_analysis: RiskAnalysis;
    required_actions: RequiredAction[];
    monitoring_requirements: MonitoringRequirement[];
    appeal_eligibility: AppealEligibility;
    escalation_recommendations: EscalationRecommendation[];
    integration_updates: IntegrationUpdate[];
    compliance_status: ComplianceStatus;
    audit_trail: AuditEntry[];
    processing_metrics: ProcessingMetrics;
    timestamp: string;
    expires_at?: string;
    version: string;

export interface SafetyStageResult {
    stage: ContentSafetyStage;
    status: 'completed' | 'skipped' | 'failed' | 'pending';
    decision: SafetyDecision;
    confidence: number;
    processing_time_ms: number;
    findings: SafetyFinding[];
    recommendations: string[];
    next_stage_suggestions: ContentSafetyStage[];
    reviewer_info?: {
        reviewer_id: string;
        reviewer_type: 'automated' | 'human' | 'community';
        review_timestamp: string;
    };

export interface SafetyFinding {
    finding_id: string;
    finding_type: 'policy_violation' | 'quality_issue' | 'safety_concern' | 'compliance_issue';
    severity: SafetyRisk;
    category: string;
    description: string;
    evidence: string[];
    location?: string;
    resolution_required: boolean;
    resolution_suggestions: string[];
    auto_fixable: boolean;
    business_impact: BusinessImpactAssessment;

export interface SafetyAssessment {
    content_safety: {
        toxicity_score: number;
        harassment_score: number;
        hate_speech_score: number;
        violence_score: number;
        sexual_content_score: number;
        spam_score: number;
    };
    quality_safety: {
        accuracy_score: number;
        completeness_score: number;
        clarity_score: number;
        usefulness_score: number;
        originality_score: number;
    };
    technical_safety: {
        security_score: number;
        privacy_score: number;
        accessibility_score: number;
        performance_score: number;
        compatibility_score: number;
    };
    business_safety: {
        brand_alignment_score: number;
        legal_compliance_score: number;
        competitive_risk_score: number;
        revenue_protection_score: number;
    };
    community_safety: {
        community_standards_score: number;
        contribution_value_score: number;
        collaboration_potential_score: number;
        knowledge_sharing_score: number;
    };

export interface RiskAnalysis {
    immediate_risks: RiskFactor[];
    short_term_risks: RiskFactor[];
    long_term_risks: RiskFactor[];
    risk_mitigation: RiskMitigation[];
    monitoring_recommendations: RiskMonitoring[];
    risk_trend: 'increasing' | 'stable' | 'decreasing';
    risk_correlation: RiskCorrelation[];

export interface RiskFactor {
    risk_type: string;
    risk_level: SafetyRisk;
    probability: number;
    potential_impact: string;
    time_horizon: 'immediate' | 'short_term' | 'long_term';
    contributing_factors: string[];
    indicators: string[];
    thresholds: Record<string, number>;

export interface RiskMitigation {
    mitigation_type: 'preventive' | 'corrective' | 'monitoring' | 'escalation';
    mitigation_action: string;
    effectiveness: number;
    implementation_effort: 'low' | 'medium' | 'high';
    cost_estimate: string;
    timeline: string;

export interface RiskMonitoring {
    monitoring_type: string;
    monitoring_frequency: string;
    alert_thresholds: Record<string, number>;
    escalation_triggers: string[];
    automated_responses: string[];

export interface RiskCorrelation {
    primary_risk: string;
    correlated_risk: string;
    correlation_strength: number;
    correlation_type: 'causal' | 'concurrent' | 'consequential';

export interface RequiredAction {
    action_id: string;
    action_type: 'content_modification' | 'user_notification' | 'workflow_update' | 'monitoring_setup';
    action_description: string;
    urgency: ModerationPriority;
    responsible_party: string;
    due_date: string;
    dependencies: string[];
    success_criteria: string[];
    completion_validation: string[];
    automation_possible: boolean;
    user_involvement_required: boolean;

export interface MonitoringRequirement {
    monitoring_id: string;
    monitoring_scope: 'content' | 'user' | 'system' | 'business';
    monitoring_duration: string;
    metrics_to_track: string[];
    alert_conditions: AlertCondition[];
    reporting_requirements: ReportingRequirement[];
    integration_points: string[];
    automation_level: 'manual' | 'semi_automated' | 'fully_automated';

export interface AlertCondition {
    condition_name: string;
    condition_expression: string;
    alert_threshold: number;
    alert_priority: ModerationPriority;
    notification_recipients: string[];
    escalation_rules: string[];

export interface ReportingRequirement {
    report_type: string;
    report_frequency: string;
    report_recipients: string[];
    report_format: 'dashboard' | 'email' | 'api' | 'file';
    automated_generation: boolean;

export interface AppealEligibility {
    appeal_allowed: boolean;
    appeal_deadline: string;
    appeal_process: string;
    required_evidence: string[];
    appeal_success_probability: number;
    alternative_remedies: string[];

export interface EscalationRecommendation {
    escalation_type: 'technical' | 'legal' | 'business' | 'regulatory';
    escalation_urgency: ModerationPriority;
    escalation_target: string;
    escalation_rationale: string;
    expected_outcome: string;
    escalation_timeline: string;

export interface IntegrationUpdate {
    integration_type: 'contribution_workflow' | 'tutorial_system' | 'marketplace' | 'analytics';
    update_type: 'status_change' | 'metadata_update' | 'workflow_transition' | 'notification';
    update_data: Record<string, any>;
    update_timestamp: string;
    affected_systems: string[];

export interface ComplianceStatus {
    overall_compliant: boolean;
    compliance_score: number;
    policy_compliance: Record<string, boolean>;
    regulatory_compliance: Record<string, boolean>;
    platform_compliance: Record<string, boolean>;
    violations_found: ComplianceViolation[];
    remediation_required: ComplianceRemediation[];
    certification_status: CertificationStatus[];

export interface ComplianceViolation {
    violation_id: string;
    violation_type: string;
    severity: SafetyRisk;
    regulation_reference: string;
    violation_description: string;
    remediation_deadline: string;
    penalty_risk: string;

export interface ComplianceRemediation {
    remediation_id: string;
    remediation_type: string;
    remediation_actions: string[];
    timeline: string;
    responsible_party: string;
    validation_required: boolean;

export interface CertificationStatus {
    certification_name: string;
    certification_status: 'valid' | 'expired' | 'pending' | 'revoked';
    expiry_date?: string;
    renewal_requirements: string[];

export interface AuditEntry {
    entry_id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: Record<string, any>;
    security_classification: string;

export interface ProcessingMetrics {
    total_processing_time_ms: number;
    stage_breakdown: Record<ContentSafetyStage, number>;
    resource_utilization: ResourceUtilization;
    performance_indicators: PerformanceIndicator[];

export interface ResourceUtilization {
    cpu_time_ms: number;
    memory_peak_mb: number;
    api_calls_count: number;
    cache_hit_rate: number;
    database_queries: number;
    external_service_calls: number;

export interface PerformanceIndicator {
    indicator_name: string;
    indicator_value: number;
    benchmark_value: number;
    performance_rating: 'excellent' | 'good' | 'acceptable' | 'poor';

export interface BusinessImpactAssessment {
    revenue_impact: number;
    brand_impact: number;
    user_experience_impact: number;
    operational_impact: number;
    competitive_impact: number;
    regulatory_impact: number;

export interface ContentSafetyService {
    processContentSafety(request: ContentSafetyRequest): Promise<ContentSafetyResult>;
    batchProcessSafety(requests: ContentSafetyRequest[]): Promise<ContentSafetyResult[]>;
    runIntakeStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    runFilteringStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    runModerationStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    runQualityGatesStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    processContributionSafety(contribution: ContributionSubmission): Promise<ContentSafetyResult>;
    processTemplateSafety(templateData: any): Promise<ContentSafetyResult>;
    processTutorialSafety(tutorialData: any): Promise<ContentSafetyResult>;
    processCommunityContentSafety(communityData: any): Promise<ContentSafetyResult>;
    monitorContentSafety(contentId: string): Promise<SafetyMonitoringResult>;
    flagContentForReview(contentId: string, reason: string, urgency: ModerationPriority): Promise<void>;
    processAppeal(appealRequest: AppealRequest): Promise<AppealResult>;
    escalateContent(contentId: string, escalationReason: string): Promise<EscalationResult>;
    getSafetyAnalytics(timeRange: string): Promise<SafetyAnalytics>;
    getPredictiveRiskAnalysis(): Promise<PredictiveRiskAnalysis>;
    getComplianceReport(timeRange: string): Promise<ComplianceReport>;
    updateSafetyPolicies(policies: SafetyPolicy[]): Promise<void>;
    calibrateSafetyThresholds(calibrationData: SafetyCalibrationData): Promise<SafetyCalibrationResult>;
    getSafetySystemHealth(): Promise<SafetySystemHealth>;
    optimizeSafetyPipeline(): Promise<SafetyOptimizationResult>;

export interface SafetyMonitoringResult {
    monitoring_data: any;

export interface AppealRequest {
    appeal_data: any;

export interface AppealResult {
    result_data: any;

export interface EscalationResult {
    escalation_data: any;

export interface SafetyAnalytics {
    analytics_data: any;

export interface PredictiveRiskAnalysis {
    prediction_data: any;

export interface ComplianceReport {
    report_data: any;

export interface SafetyPolicy {
    policy_data: any;

export interface SafetyCalibrationData {
    calibration_data: any;

export interface SafetyCalibrationResult {
    result_data: any;

export interface SafetySystemHealth {
    health_data: any;

export interface SafetyOptimizationResult {
    optimization_data: any;

export declare class ContentSafetyServiceImpl implements ContentSafetyService {
    private filteringService;
    private moderationService;
    private contributionService;
    private tutorialService;
    private analyticsService;
    private apiClient;
    constructor(filteringService: MarketplaceContentFilteringService, moderationService: EnhancedModerationService, contributionService: ContributionManagementService, tutorialService: MarketplaceTutorialSystemService, analyticsService: LearningAnalyticsServiceImpl, apiClient: any);
    processContentSafety(request: ContentSafetyRequest): Promise<ContentSafetyResult>;
    batchProcessSafety(requests: ContentSafetyRequest[]): Promise<ContentSafetyResult[]>;
    runIntakeStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    runFilteringStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    runModerationStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    runQualityGatesStage(request: ContentSafetyRequest): Promise<SafetyStageResult>;
    processContributionSafety(contribution: ContributionSubmission): Promise<ContentSafetyResult>;
    processTemplateSafety(templateData: any): Promise<ContentSafetyResult>;
    processTutorialSafety(tutorialData: any): Promise<ContentSafetyResult>;
    processCommunityContentSafety(communityData: any): Promise<ContentSafetyResult>;
    monitorContentSafety(contentId: string): Promise<SafetyMonitoringResult>;
    flagContentForReview(contentId: string, reason: string, urgency: ModerationPriority): Promise<void>;
    processAppeal(appealRequest: AppealRequest): Promise<AppealResult>;
    escalateContent(contentId: string, escalationReason: string): Promise<EscalationResult>;
    getSafetyAnalytics(timeRange: string): Promise<SafetyAnalytics>;
    getPredictiveRiskAnalysis(): Promise<PredictiveRiskAnalysis>;
    getComplianceReport(timeRange: string): Promise<ComplianceReport>;
    updateSafetyPolicies(policies: SafetyPolicy[]): Promise<void>;
    calibrateSafetyThresholds(calibrationData: SafetyCalibrationData): Promise<SafetyCalibrationResult>;
    getSafetySystemHealth(): Promise<SafetySystemHealth>;
    optimizeSafetyPipeline(): Promise<SafetyOptimizationResult>;
    private exceedsSizeLimits;
    private hasValidStructure;
    private createEarlyExitResult;
    private makeFinalSafetyDecision;
    private generateComprehensiveResult;
    private createErrorResult;
    private trackSafetyEvent;
    private executeIntegrationUpdates;
    private determineFilteringCategories;
    private mapPriorityToFilteringPriority;
    private convertFilteringIssuesToFindings;
    private mapFilteringActionToSafetyDecision;
    private inferModerationContext;
    private determineWorkflowType;
    private convertModerationResultToFindings;
    private mapModerationActionToSafetyDecision;

//# sourceMappingURL=ContentSafetyIntegration.d.ts.map