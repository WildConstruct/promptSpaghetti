/**
 * Automated Funnel Optimization Suggestions - Story 30.2 Task 8
 *
 * Intelligent automation system that continuously monitors funnel performance
 * and generates real-time optimization suggestions based on data patterns,
 * user behavior, and market conditions.
 *
 * Features:
 * - Real-time funnel performance monitoring
 * - AI-powered suggestion generation
 * - Automated A/B test recommendations
 * - Smart alert system with contextual actions
 * - Machine learning-based pattern recognition
 * - Predictive optimization opportunities
 * - Automated implementation for low-risk changes
 * - Integration with external optimization tools
 */
import React from 'react';
import { ConversionFunnelDefinition } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface AutomatedOptimizationSuggestionsProps {
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    optimizationConfig?: OptimizationConfiguration;
    userContext?: UserContext;
    automationLevel?: AutomationLevel;
    onSuggestionGenerated?: (suggestion: OptimizationSuggestion) => void;
    onAutomatedAction?: (action: AutomatedAction) => void;
    onExport?: (data: OptimizationSuggestionsExportData) => void;
}
export interface OptimizationConfiguration {
    enabledSuggestionTypes: SuggestionType[];
    automationSettings: AutomationSettings;
    alertThresholds: AlertThreshold[];
    learningModels: LearningModel[];
    integrations: OptimizationIntegration[];
    constraints: OptimizationConstraint[];
    performance: PerformanceSettings;
}
export interface AutomationSettings {
    enableAutomatedImplementation: boolean;
    automationLevel: AutomationLevel;
    riskTolerance: RiskTolerance;
    approvalRequired: boolean;
    rollbackEnabled: boolean;
    testingRequired: boolean;
    minimumConfidence: number;
    maximumImpact: number;
}
export type AutomationLevel = 'manual' | 'assisted' | 'semi_automated' | 'fully_automated';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export interface AlertThreshold {
    metric: string;
    condition: ThresholdCondition;
    value: number;
    timeframe: number;
    severity: AlertSeverity;
    actionRequired: boolean;
}
export type ThresholdCondition = 'above' | 'below' | 'equals' | 'change_exceeds' | 'trend_reversal';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export interface LearningModel {
    modelId: string;
    modelType: ModelType;
    enabled: boolean;
    confidence: number;
    accuracy: number;
    lastTraining: number;
    dataRequirements: ModelDataRequirement[];
}
export type ModelType = 'conversion_prediction' | 'user_behavior_analysis' | 'pattern_recognition' | 'anomaly_detection' | 'optimization_recommendation' | 'a_b_test_analysis';
export interface ModelDataRequirement {
    dataType: string;
    minimumSampleSize: number;
    freshness: number;
    quality: number;
}
export interface OptimizationIntegration {
    integrationId: string;
    name: string;
    type: IntegrationType;
    enabled: boolean;
    configuration: IntegrationConfiguration;
    capabilities: IntegrationCapability[];
}
export type IntegrationType = 'analytics_platform' | 'a_b_testing_tool' | 'personalization_engine' | 'email_marketing' | 'ad_platform' | 'cms' | 'crm';
export interface IntegrationConfiguration {
    apiKey?: string;
    endpoint?: string;
    credentials?: Record<string, string>;
    settings: Record<string, any>;
}
export interface IntegrationCapability {
    capability: string;
    supported: boolean;
    configuration: Record<string, any>;
}
export interface OptimizationConstraint {
    constraintId: string;
    type: ConstraintType;
    description: string;
    parameters: ConstraintParameter[];
    enabled: boolean;
    priority: number;
}
export type ConstraintType = 'budget_limit' | 'time_restriction' | 'brand_guidelines' | 'technical_limitation' | 'regulatory_compliance' | 'user_impact_limit';
export interface ConstraintParameter {
    parameter: string;
    value: Error;
    required: boolean;
}
export interface PerformanceSettings {
    updateFrequency: number;
    batchSize: number;
    maxConcurrentSuggestions: number;
    suggestionLifetime: number;
    cacheDuration: number;
}
export interface UserContext {
    userId: string;
    userRole: UserRole;
    permissions: Permission[];
    preferences: UserPreferences;
    workflowState: WorkflowState;
}
export type UserRole = 'creator' | 'marketer' | 'analyst' | 'admin' | 'viewer';
export interface Permission {
    action: string;
    resource: string;
    allowed: boolean;
    conditions?: Record<string, any>;
}
export interface UserPreferences {
    notificationSettings: NotificationSettings;
    dashboardLayout: DashboardLayout;
    automationSettings: UserAutomationSettings;
    displaySettings: DisplaySettings;
}
export interface NotificationSettings {
    enablePushNotifications: boolean;
    enableEmailAlerts: boolean;
    frequency: NotificationFrequency;
    severityFilter: AlertSeverity[];
}
export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly';
export interface DashboardLayout {
    layout: 'grid' | 'list' | 'cards';
    density: 'compact' | 'comfortable' | 'spacious';
    sections: DashboardSection[];
}
export interface DashboardSection {
    sectionId: string;
    title: string;
    visible: boolean;
    order: number;
    size: 'small' | 'medium' | 'large';
}
export interface UserAutomationSettings {
    enableAutomatedSuggestions: boolean;
    autoApprovalLimits: AutoApprovalLimit[];
    reviewRequired: boolean;
    rollbackPermissions: boolean;
}
export interface AutoApprovalLimit {
    action: string;
    maxImpact: number;
    maxCost: number;
    requiresConfirmation: boolean;
}
export interface DisplaySettings {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
}
export interface WorkflowState {
    currentStep: string;
    completedSteps: string[];
    pendingActions: PendingAction[];
    activeExperiments: string[];
}
export interface PendingAction {
    actionId: string;
    actionType: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: number;
    dependencies: string[];
}
export interface OptimizationSuggestionsData {
    activeSuggestions: OptimizationSuggestion[];
    automatedActions: AutomatedAction[];
    learningInsights: LearningInsight[];
    performanceMetrics: SuggestionPerformanceMetrics;
    systemHealth: AutomationSystemHealth;
    experiments: ActiveExperiment[];
    patterns: RecognizedPattern[];
    predictions: OptimizationPrediction[];
}
export interface OptimizationSuggestion {
    suggestionId: string;
    type: SuggestionType;
    title: string;
    description: string;
    priority: SuggestionPriority;
    confidence: number;
    impact: SuggestionImpact;
    effort: SuggestionEffort;
    source: SuggestionSource;
    context: SuggestionContext;
    recommendations: ActionRecommendation[];
    constraints: ApplicableConstraint[];
    timeline: SuggestionTimeline;
    automation: AutomationOptions;
    testing: TestingRequirements;
    status: SuggestionStatus;
    feedback: SuggestionFeedback;
    createdAt: number;
    expiresAt: number;
}
export type SuggestionType = 'conversion_optimization' | 'user_experience_improvement' | 'performance_enhancement' | 'content_optimization' | 'pricing_adjustment' | 'traffic_acquisition' | 'retention_improvement' | 'technical_fix' | 'ab_test_opportunity' | 'personalization_opportunity';
export type SuggestionPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type SuggestionStatus = 'generated' | 'reviewing' | 'approved' | 'implementing' | 'testing' | 'completed' | 'rejected' | 'expired';
export interface SuggestionImpact {
    expectedLift: number;
    confidenceInterval: {,
        min: number;
        max: number;
    };
    affectedMetrics: AffectedMetric[];
    userImpact: UserImpact;
    businessImpact: BusinessImpact;
    riskAssessment: RiskAssessment;
}
export interface AffectedMetric {
    metric: string;
    currentValue: number;
    expectedValue: number;
    improvementPercentage: number;
    confidence: number;
}
export interface UserImpact {
    affectedUsers: number;
    userSegments: string[];
    experienceChange: 'positive' | 'negative' | 'neutral';
    adaptationTime: number;
}
export interface BusinessImpact {
    revenueImpact: number;
    costImpact: number;
    resourceRequirements: ResourceRequirement[];
    timeToValue: number;
    strategicAlignment: number;
}
export interface ResourceRequirement {
    resource: string;
    amount: number;
    duration: number;
    criticality: 'essential' | 'important' | 'optional';
}
export interface RiskAssessment {
    overallRisk: RiskLevel;
    riskFactors: RiskFactor[];
    mitigationStrategies: MitigationStrategy[];
    rollbackPlan: RollbackPlan;
}
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export interface RiskFactor {
    factor: string;
    probability: number;
    impact: number;
    description: string;
    category: RiskCategory;
}
export type RiskCategory = 'technical' | 'business' | 'user_experience' | 'compliance' | 'security';
export interface MitigationStrategy {
    strategy: string;
    effectiveness: number;
    cost: number;
    implementation: string;
}
export interface RollbackPlan {
    rollbackPossible: boolean;
    rollbackTime: number;
    rollbackSteps: string[];
    dataLoss: boolean;
}
export interface SuggestionEffort {
    estimatedHours: number;
    skillsRequired: RequiredSkill[];
    toolsRequired: RequiredTool[];
    complexity: ComplexityLevel;
    dependencies: SuggestionDependency[];
}
export interface RequiredSkill {
    skill: string;
    level: SkillLevel;
    essential: boolean;
}
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export interface RequiredTool {
    tool: string;
    version?: string;
    cost: number;
    availability: boolean;
}
export type ComplexityLevel = 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert';
export interface SuggestionDependency {
    dependencyId: string;
    type: DependencyType;
    description: string;
    blocking: boolean;
    estimatedResolution: number;
}
export type DependencyType = 'technical' | 'approval' | 'resource' | 'external' | 'sequential';
export interface SuggestionSource {
    sourceType: SourceType;
    sourceName: string;
    dataQuality: number;
    reliability: number;
    freshness: number;
    methodology: string;
}
export type SourceType = 'machine_learning' | 'statistical_analysis' | 'pattern_recognition' | 'user_feedback' | 'competitor_analysis' | 'industry_benchmark' | 'expert_knowledge' | 'historical_data';
export interface SuggestionContext {
    triggeringEvents: TriggeringEvent[];
    environmentalFactors: EnvironmentalFactor[];
    marketConditions: MarketCondition[];
    seasonality: SeasonalityFactor[];
    competitiveActivity: CompetitiveActivity[];
    userBehaviorChanges: UserBehaviorChange[];
}
export interface TriggeringEvent {
    eventType: string;
    eventName: string;
    timestamp: number;
    severity: number;
    correlation: number;
}
export interface EnvironmentalFactor {
    factor: string;
    value: Error;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
}
export interface MarketCondition {
    condition: string;
    value: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number;
}
export interface SeasonalityFactor {
    pattern: string;
    strength: number;
    phase: number;
    reliability: number;
}
export interface CompetitiveActivity {
    competitor: string;
    activity: string;
    impact: number;
    response: string;
}
export interface UserBehaviorChange {
    segment: string;
    change: string;
    magnitude: number;
    timeframe: number;
}
export interface ActionRecommendation {
    actionId: string;
    title: string;
    description: string;
    actionType: ActionType;
    priority: number;
    implementation: ActionImplementation;
    expectedOutcome: ActionOutcome;
    monitoring: ActionMonitoring;
}
export type ActionType = 'content_change' | 'design_modification' | 'pricing_update' | 'targeting_adjustment' | 'feature_toggle' | 'configuration_change' | 'workflow_optimization' | 'integration_update';
export interface ActionImplementation {
    method: ImplementationMethod;
    steps: ImplementationStep[];
    automation: AutomationCapability;
    validation: ValidationRequirement[];
}
export type ImplementationMethod = 'manual' | 'semi_automated' | 'fully_automated' | 'api_call' | 'configuration';
export interface ImplementationStep {
    stepNumber: number;
    description: string;
    estimatedTime: number;
    skills: string[];
    tools: string[];
    validation: string;
}
export interface AutomationCapability {
    automatable: boolean;
    automationLevel: AutomationLevel;
    requirements: AutomationRequirement[];
    limitations: string[];
}
export interface AutomationRequirement {
    requirement: string;
    type: 'technical' | 'approval' | 'configuration';
    satisfied: boolean;
}
export interface ValidationRequirement {
    validation: string;
    method: ValidationMethod;
    criteria: ValidationCriteria;
    automated: boolean;
}
export type ValidationMethod = 'testing' | 'review' | 'metrics' | 'user_feedback' | 'simulation';
export interface ValidationCriteria {
    metric: string;
    threshold: number;
    direction: 'increase' | 'decrease' | 'maintain';
    significance: number;
}
export interface ActionOutcome {
    primaryMetric: string;
    expectedChange: number;
    timeToEffect: number;
    duration: number;
    sideEffects: SideEffect[];
}
export interface SideEffect {
    effect: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
}
export interface ActionMonitoring {
    metricsToTrack: MonitoringMetric[];
    alertConditions: MonitoringAlert[];
    reportingFrequency: number;
    dashboardUpdates: boolean;
}
export interface MonitoringMetric {
    metric: string;
    baseline: number;
    targetChange: number;
    alertThreshold: number;
}
export interface MonitoringAlert {
    condition: string;
    threshold: number;
    severity: AlertSeverity;
    action: string;
}
export interface ApplicableConstraint {
    constraintId: string;
    constraint: string;
    impact: string;
    compliance: boolean;
    workaround?: string;
}
export interface SuggestionTimeline {
    estimatedImplementation: number;
    phases: TimelinePhase[];
    milestones: TimelineMilestone[];
    criticalPath: string[];
}
export interface TimelinePhase {
    phaseName: string;
    description: string;
    duration: number;
    dependencies: string[];
    deliverables: string[];
}
export interface TimelineMilestone {
    milestoneName: string;
    targetDate: number;
    criteria: string[];
    dependencies: string[];
}
export interface AutomationOptions {
    fullyAutomatable: boolean;
    partialAutomation: PartialAutomation[];
    userApprovalRequired: boolean;
    rollbackCapable: boolean;
    monitoringRequired: boolean;
}
export interface PartialAutomation {
    component: string;
    automatable: boolean;
    requirements: string[];
    limitations: string[];
}
export interface TestingRequirements {
    testingRecommended: boolean;
    testType: TestType;
    testDesign: TestDesign;
    testDuration: number;
    testCriteria: TestCriteria;
}
export type TestType = 'a_b_test' | 'multivariate_test' | 'split_test' | 'staged_rollout' | 'canary_release';
export interface TestDesign {
    variants: TestVariant[];
    trafficAllocation: TrafficAllocation;
    targetMetrics: string[];
    minimumSampleSize: number;
    statisticalPower: number;
}
export interface TestVariant {
    variantName: string;
    description: string;
    implementation: VariantImplementation;
    expectedOutcome: number;
}
export interface VariantImplementation {
    changes: VariantChange[];
    configuration: Record<string, any>;
}
export interface VariantChange {
    element: string;
    changeType: 'content' | 'design' | 'behavior' | 'configuration';
    before: Error;
    after: unknown;
}
export interface TrafficAllocation {
    control: number;
    variants: Record<string, number>;
    rampUpStrategy: RampUpStrategy;
}
export interface RampUpStrategy {
    enabled: boolean;
    initialPercentage: number;
    finalPercentage: number;
    incrementSize: number;
    incrementFrequency: number;
}
export interface TestCriteria {
    successMetrics: SuccessMetric[];
    guardrailMetrics: GuardrailMetric[];
    stopConditions: StopCondition[];
}
export interface SuccessMetric {
    metric: string;
    targetImprovement: number;
    minimumDetectableEffect: number;
    significance: number;
}
export interface GuardrailMetric {
    metric: string;
    maxAllowedChange: number;
    direction: 'increase' | 'decrease';
    severity: 'warning' | 'critical';
}
export interface StopCondition {
    condition: string;
    threshold: number;
    action: 'pause' | 'stop' | 'rollback';
}
export interface SuggestionFeedback {
    userRating: number;
    userComments: string;
    implementationFeedback: ImplementationFeedback;
    outcomeTracking: OutcomeTracking;
    lessonsLearned: string[];
}
export interface ImplementationFeedback {
    difficultyRating: number;
    timeActual: number;
    resourcesActual: ResourceActual[];
    challenges: Challenge[];
}
export interface ResourceActual {
    resource: string;
    amountUsed: number;
    effectiveness: number;
}
export interface Challenge {
    challenge: string;
    severity: 'low' | 'medium' | 'high';
    resolution: string;
    timeToResolve: number;
}
export interface OutcomeTracking {
    actualResults: ActualResult[];
    timeToEffect: number;
    duration: number;
    sideEffectsObserved: ObservedSideEffect[];
}
export interface ActualResult {
    metric: string;
    baseline: number;
    actualValue: number;
    improvementPercentage: number;
    statisticalSignificance: number;
}
export interface ObservedSideEffect {
    effect: string;
    severity: 'low' | 'medium' | 'high';
    impact: string;
    mitigation: string;
}
export interface AutomatedAction {
    actionId: string;
    suggestionId: string;
    actionType: AutomatedActionType;
    title: string;
    description: string;
    status: AutomatedActionStatus;
    automation: ActionAutomation;
    execution: ActionExecution;
    monitoring: ActionMonitoringState;
    rollback: RollbackState;
    createdAt: number;
    executedAt?: number;
    completedAt?: number;
}
export type AutomatedActionType = 'configuration_update' | 'content_modification' | 'test_deployment' | 'alert_acknowledgment' | 'data_collection' | 'report_generation' | 'notification_dispatch' | 'integration_sync';
export type AutomatedActionStatus = 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'rolled_back' | 'paused';
export interface ActionAutomation {
    automationLevel: AutomationLevel;
    approvalRequired: boolean;
    approvedBy?: string;
    approvedAt?: number;
    constraints: AutomationConstraint[];
}
export interface AutomationConstraint {
    constraint: string;
    satisfied: boolean;
    checkTime: number;
}
export interface ActionExecution {
    method: string;
    parameters: Record<string, any>;
    retryCount: number;
    maxRetries: number;
    timeoutDuration: number;
    executionLog: ExecutionLogEntry[];
}
export interface ExecutionLogEntry {
    timestamp: number;
    level: 'info' | 'warning' | 'error';
    message: string;
    details?: Record<string, any>;
}
export interface ActionMonitoringState {
    isMonitoring: boolean;
    metricsTracked: TrackedMetric[];
    alertsGenerated: GeneratedAlert[];
    lastCheck: number;
}
export interface TrackedMetric {
    metric: string;
    baseline: number;
    currentValue: number;
    trend: 'improving' | 'declining' | 'stable';
    alertThreshold: number;
}
export interface GeneratedAlert {
    alertId: string;
    severity: AlertSeverity;
    message: string;
    timestamp: number;
    resolved: boolean;
}
export interface RollbackState {
    rollbackAvailable: boolean;
    rollbackPrepared: boolean;
    rollbackReason?: string;
    rollbackExecutedAt?: number;
    rollbackSuccess?: boolean;
}
export interface LearningInsight {
    insightId: string;
    type: InsightType;
    title: string;
    description: string;
    confidence: number;
    supportingData: SupportingData;
    implications: InsightImplication[];
    recommendations: InsightRecommendation[];
    applicability: InsightApplicability;
    createdAt: number;
}
export type InsightType = 'pattern_discovery' | 'anomaly_detection' | 'trend_identification' | 'correlation_finding' | 'prediction_accuracy' | 'user_behavior_insight' | 'performance_insight';
export interface SupportingData {
    dataPoints: number;
    timeRange: {,
        start: number;
        end: number;
    };
    dataQuality: number;
    sources: string[];
    methodology: string;
}
export interface InsightImplication {
    implication: string;
    probability: number;
    impact: 'low' | 'medium' | 'high';
    timeframe: number;
}
export interface InsightRecommendation {
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    expectedBenefit: string;
}
export interface InsightApplicability {
    applicableScenarios: string[];
    limitations: string[];
    prerequisites: string[];
    confidence: number;
}
export interface SuggestionPerformanceMetrics {
    totalSuggestions: number;
    implementationRate: number;
    successRate: number;
    averageImpact: number;
    userSatisfaction: number;
    timeToValue: number;
    costEffectiveness: number;
    accuracyMetrics: AccuracyMetrics;
    trend: PerformanceTrend;
}
export interface AccuracyMetrics {
    predictionAccuracy: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    precisionScore: number;
    recallScore: number;
}
export interface PerformanceTrend {
    direction: 'improving' | 'declining' | 'stable';
    rate: number;
    confidence: number;
    factors: TrendFactor[];
}
export interface TrendFactor {
    factor: string;
    contribution: number;
    direction: 'positive' | 'negative';
}
export interface AutomationSystemHealth {
    overallStatus: 'healthy' | 'degraded' | 'critical';
    components: SystemComponent[];
    performance: SystemPerformance;
    errors: SystemError[];
    maintenance: MaintenanceInfo;
}
export interface SystemComponent {
    componentName: string;
    status: 'operational' | 'degraded' | 'failed';
    lastCheck: number;
    uptime: number;
    responseTime: number;
}
export interface SystemPerformance {
    throughput: number;
    latency: number;
    errorRate: number;
    resourceUtilization: ResourceUtilization;
}
export interface ResourceUtilization {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
}
export interface SystemError {
    errorId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
    component: string;
    resolved: boolean;
}
export interface MaintenanceInfo {
    lastMaintenance: number;
    nextMaintenance: number;
    maintenanceType: 'routine' | 'emergency' | 'upgrade';
    estimatedDowntime: number;
}
export interface ActiveExperiment {
    experimentId: string;
    name: string;
    type: TestType;
    status: ExperimentStatus;
    startDate: number;
    endDate: number;
    trafficAllocation: number;
    metrics: ExperimentMetric[];
    results: ExperimentResult[];
}
export type ExperimentStatus = 'planning' | 'running' | 'paused' | 'completed' | 'terminated';
export interface ExperimentMetric {
    metric: string;
    baseline: number;
    target: number;
    current: number;
    significance: number;
}
export interface ExperimentResult {
    variant: string;
    users: number;
    conversions: number;
    conversionRate: number;
    improvement: number;
    significance: number;
}
export interface RecognizedPattern {
    patternId: string;
    type: PatternType;
    description: string;
    frequency: number;
    reliability: number;
    context: PatternContext;
    implications: PatternImplication[];
    actionability: PatternActionability;
}
export type PatternType = 'user_behavior' | 'performance_cycle' | 'seasonal_trend' | 'conversion_path' | 'traffic_pattern' | 'engagement_pattern';
export interface PatternContext {
    timeRange: {,
        start: number;
        end: number;
    };
    conditions: string[];
    segments: string[];
    triggers: string[];
}
export interface PatternImplication {
    implication: string;
    confidence: number;
    impact: 'positive' | 'negative' | 'neutral';
}
export interface PatternActionability {
    actionable: boolean;
    suggestedActions: string[];
    constraints: string[];
    effort: 'low' | 'medium' | 'high';
}
export interface OptimizationPrediction {
    predictionId: string;
    type: PredictionType;
    target: string;
    predictedValue: number;
    confidenceInterval: {,
        min: number;
        max: number;
    };
    timeframe: number;
    factors: PredictionFactor[];
    scenarios: PredictionScenario[];
    recommendations: PredictionRecommendation[];
}
export type PredictionType = 'conversion_rate' | 'revenue_impact' | 'user_behavior' | 'traffic_volume' | 'performance_metric' | 'experiment_outcome';
export interface PredictionFactor {
    factor: string;
    weight: number;
    direction: 'positive' | 'negative';
    confidence: number;
}
export interface PredictionScenario {
    scenarioName: string;
    probability: number;
    predictedOutcome: number;
    conditions: string[];
}
export interface PredictionRecommendation {
    recommendation: string;
    impact: number;
    probability: number;
    effort: 'low' | 'medium' | 'high';
}
export interface OptimizationSuggestionsExportData {
    suggestions: OptimizationSuggestion[];
    automatedActions: AutomatedAction[];
    performanceMetrics: SuggestionPerformanceMetrics;
    learningInsights: LearningInsight[];
    patterns: RecognizedPattern[];
    predictions: OptimizationPrediction[];
    exportTimestamp: number;
    configuration: OptimizationConfiguration;
}
export declare const AutomatedOptimizationSuggestions: React.FC<AutomatedOptimizationSuggestionsProps>;
//# sourceMappingURL=AutomatedOptimizationSuggestions.d.ts.map