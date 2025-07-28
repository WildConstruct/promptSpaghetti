import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface UserLifecycleTrackingProps {
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    lifecycleConfig: LifecycleConfiguration;
    userLifecycleData: UserLifecycleData;
    cohortAnalysisEnabled?: boolean;
    predictiveModelingEnabled?: boolean;
    onStageTransition?: (userId: string, transition: StageTransition) => void;
    onLifecycleInsight?: (insight: LifecycleInsight) => void;
    onInterventionRecommended?: (recommendation: InterventionRecommendation) => void;
    onExport?: (data: LifecycleTrackingExportData) => void;
}
export interface LifecycleConfiguration {
    stageDefinitions: LifecycleStage;
    transitionRules: TransitionRule;
    healthMetrics: LifecycleHealthMetric;
    interventionStrategies: InterventionStrategy;
    cohortSettings: CohortAnalysisSettings;
    predictionModels: LifecyclePredictionModel;
    trackingSettings: LifecycleTrackingSettings;
}
export interface LifecycleStage {
    stageId: string;
    name: string;
    description: string;
    category: StageCategory;
    sequence: number;
    duration: StageDuration;
    entryConditions: StageCondition;
    exitConditions: StageCondition;
    healthIndicators: HealthIndicator;
    typicalBehaviors: TypicalBehavior;
    riskFactors: RiskFactor;
    opportunities: StageOpportunity;
}
export type StageCategory = 'acquisition' | 'activation' | 'engagement' | 'retention' | 'growth' | 'advocacy' | 'dormancy' | 'churn';
export interface StageDuration {
    typical: number;
    minimum: number;
    maximum: number;
    variance: number;
}
export interface StageCondition {
    conditionId: string;
    type: ConditionType;
    field: string;
    operator: ConditionOperator;
    value: Error;
    weight: number;
    required: boolean;
}
export type ConditionType = 'behavioral' | 'temporal' | 'transactional' | 'engagement' | 'demographic' | 'contextual';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'contains' | 'exists' | 'not_exists';
export interface HealthIndicator {
    indicatorId: string;
    name: string;
    type: IndicatorType;
    measurement: IndicatorMeasurement;
    thresholds: IndicatorThreshold;
    weight: number;
}
export type IndicatorType = 'engagement_frequency' | 'engagement_depth' | 'progression_rate' | 'satisfaction_score' | 'value_realization' | 'risk_score';
export interface IndicatorMeasurement {
    metric: string;
    aggregation: AggregationMethod;
    timeWindow: number;
    normalization: NormalizationMethod;
}
export type AggregationMethod = 'sum' | 'average' | 'median' | 'max' | 'min' | 'count' | 'percentage';
export type NormalizationMethod = 'none' | 'z_score' | 'min_max' | 'percentile' | 'log_transform';
export interface IndicatorThreshold {
    level: ThresholdLevel;
    value: number;
    action: ThresholdAction;
}
export type ThresholdLevel = 'critical' | 'warning' | 'good' | 'excellent';
export type ThresholdAction = 'alert' | 'intervene' | 'optimize' | 'celebrate';
export interface TypicalBehavior {
    behaviorId: string;
    name: string;
    description: string;
    frequency: number;
    importance: number;
    indicators: BehaviorIndicator;
}
export interface BehaviorIndicator {
    indicator: string;
    expectedValue: number;
    variance: number;
    correlation: number;
}
export interface RiskFactor {
    factorId: string;
    name: string;
    description: string;
    severity: RiskSeverity;
    likelihood: number;
    impact: RiskImpact;
    mitigation: MitigationStrategy;
}
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface RiskImpact {
    stageProgression: number;
    userExperience: number;
    businessValue: number;
    retentionRisk: number;
}
export interface MitigationStrategy {
    strategyId: string;
    name: string;
    description: string;
    effectiveness: number;
    effort: EffortLevel;
    timeline: string;
}
export type EffortLevel = 'low' | 'medium' | 'high' | 'very_high';
export interface StageOpportunity {
    opportunityId: string;
    name: string;
    description: string;
    type: OpportunityType;
    potential: OpportunityPotential;
    requirements: OpportunityRequirement;
}
export type OpportunityType = 'engagement_increase' | 'progression_acceleration' | 'value_realization' | 'experience_enhancement' | 'personalization' | 'cross_sell' | 'up_sell';
export interface OpportunityPotential {
    engagementLift: number;
    progressionAcceleration: number;
    valueIncrease: number;
    satisfactionImprovement: number;
    confidence: number;
}
export interface OpportunityRequirement {
    requirement: string;
    complexity: ComplexityLevel;
    resources: string;
    timeline: string;
}
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'very_complex';
export interface TransitionRule {
    ruleId: string;
    name: string;
    fromStage: string;
    toStage: string;
    conditions: TransitionCondition;
    probability: TransitionProbability;
    triggers: TransitionTrigger;
    blockers: TransitionBlocker;
}
export interface TransitionCondition {
    conditionId: string;
    type: ConditionType;
    requirement: string;
    threshold: number;
    weight: number;
    temporal: TemporalRequirement;
}
export interface TemporalRequirement {
    minimumDuration: number;
    maximumDuration: number;
    timeWindow: number;
    consistency: number;
}
export interface TransitionProbability {
    baseRate: number;
    factors: ProbabilityFactor;
    timeDependent: boolean;
    probabilityFunction: ProbabilityFunction;
}
export interface ProbabilityFactor {
    factor: string;
    influence: number;
    confidence: number;
}
export interface ProbabilityFunction {
    type: FunctionType;
    parameters: FunctionParameters;
}
export type FunctionType = 'linear' | 'exponential' | 'logarithmic' | 'sigmoid' | 'custom';
export interface FunctionParameters {
    [key: string]: number;
}
export interface TransitionTrigger {
    triggerId: string;
    name: string;
    type: TriggerType;
    conditions: TriggerCondition;
    effectiveness: number;
}
export type TriggerType = 'behavioral_milestone' | 'engagement_threshold' | 'time_based' | 'value_realization' | 'external_event' | 'intervention_response';
export interface TriggerCondition {
    field: string;
    operator: ConditionOperator;
    value: Error;
    persistence: number;
}
export interface TransitionBlocker {
    blockerId: string;
    name: string;
    description: string;
    severity: BlockerSeverity;
    detection: BlockerDetection;
    resolution: BlockerResolution;
}
export type BlockerSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export interface BlockerDetection {
    indicators: string;
    threshold: number;
    timeWindow: number;
    confidence: number;
}
export interface BlockerResolution {
    resolutionId: string;
    method: string;
    effectiveness: number;
    effort: EffortLevel;
    timeline: string;
}
export interface LifecycleHealthMetric {
    metricId: string;
    name: string;
    description: string;
    category: HealthCategory;
    calculation: HealthCalculation;
    benchmarks: HealthBenchmark;
    trends: TrendAnalysis;
}
export type HealthCategory = 'progression_health' | 'engagement_health' | 'satisfaction_health' | 'value_health' | 'retention_health';
export interface HealthCalculation {
    formula: string;
    inputs: HealthInput;
    aggregation: AggregationMethod;
    normalization: NormalizationMethod;
    weighting: WeightingScheme;
}
export interface HealthInput {
    inputId: string;
    name: string;
    source: string;
    weight: number;
    transformation: InputTransformation;
}
export interface InputTransformation {
    method: TransformationMethod;
    parameters: TransformationParameters;
}
export type TransformationMethod = 'none' | 'logarithmic' | 'exponential' | 'polynomial' | 'threshold' | 'binning';
export interface TransformationParameters {
    [key: string]: unknown;
}
export type WeightingScheme = 'equal' | 'performance_based' | 'dynamic' | 'user_defined';
export interface HealthBenchmark {
    benchmarkId: string;
    name: string;
    type: BenchmarkType;
    value: number;
    percentile: number;
    context: BenchmarkContext;
}
export type BenchmarkType = 'industry' | 'company' | 'cohort' | 'historical' | 'target';
export interface BenchmarkContext {
    segment: string;
    timeframe: string;
    conditions: string;
    sampleSize: number;
}
export interface TrendAnalysis {
    direction: TrendDirection;
    strength: number;
    consistency: number;
    seasonality: SeasonalityPattern;
    forecast: TrendForecast;
}
export type TrendDirection = 'improving' | 'declining' | 'stable' | 'volatile';
export interface SeasonalityPattern {
    pattern: string;
    amplitude: number;
    period: number;
    confidence: number;
}
export interface TrendForecast {
    shortTerm: ForecastPeriod;
    mediumTerm: ForecastPeriod;
    longTerm: ForecastPeriod;
}
export interface ForecastPeriod {
    predictedValue: number;
    confidence: number;
    range: {
        min: number;
        max: number;
    };
    factors: ForecastFactor;
}
export interface ForecastFactor {
    factor: string;
    influence: number;
    certainty: number;
}
export interface InterventionStrategy {
    strategyId: string;
    name: string;
    description: string;
    targetStages: string;
    targetConditions: InterventionCondition;
    interventions: Intervention;
    effectiveness: InterventionEffectiveness;
    implementation: InterventionImplementation;
}
export interface InterventionCondition {
    condition: string;
    threshold: number;
    priority: InterventionPriority;
    urgency: InterventionUrgency;
}
export type InterventionPriority = 'low' | 'medium' | 'high' | 'critical';
export type InterventionUrgency = 'immediate' | 'within_day' | 'within_week' | 'within_month';
export interface Intervention {
    interventionId: string;
    name: string;
    type: InterventionType;
    delivery: InterventionDelivery;
    content: InterventionContent;
    timing: InterventionTiming;
    personalization: InterventionPersonalization;
}
export type InterventionType = 'educational' | 'motivational' | 'support' | 'incentive' | 'reminder' | 'guidance' | 'social_proof' | 'gamification';
export interface InterventionDelivery {
    channels: DeliveryChannel;
    frequency: DeliveryFrequency;
    duration: DeliveryDuration;
    fallback: FallbackStrategy;
}
export interface DeliveryChannel {
    channel: ChannelType;
    priority: number;
    effectiveness: number;
    constraints: ChannelConstraint;
}
export type ChannelType = 'email' | 'push_notification' | 'in_app' | 'sms' | 'web_notification' | 'phone_call' | 'chatbot' | 'human_outreach';
export interface ChannelConstraint {
    constraint: string;
    value: Error;
    impact: number;
}
export interface DeliveryFrequency {
    initial: FrequencySpec;
    ongoing: FrequencySpec;
    escalation: EscalationSpec;
}
export interface FrequencySpec {
    frequency: number;
    interval: number;
    maximum: number;
}
export interface EscalationSpec {
    triggers: EscalationTrigger;
    changes: EscalationChange;
}
export interface EscalationTrigger {
    condition: string;
    threshold: number;
    timeframe: number;
}
export interface EscalationChange {
    aspect: 'frequency' | 'channel' | 'content' | 'urgency';
    modification: string;
    factor: number;
}
export interface DeliveryDuration {
    campaign: number;
    cooldown: number;
    expiration: number;
}
export interface FallbackStrategy {
    enabled: boolean;
    triggers: FallbackTrigger;
    alternatives: AlternativeIntervention;
}
export interface FallbackTrigger {
    condition: string;
    threshold: number;
    timeframe: number;
}
export interface AlternativeIntervention {
    interventionId: string;
    probability: number;
    effectiveness: number;
}
export interface InterventionContent {
    templates: ContentTemplate;
    personalization: ContentPersonalization;
    localization: ContentLocalization;
    dynamic: DynamicContent;
}
export interface ContentTemplate {
    templateId: string;
    name: string;
    type: ContentType;
    content: string;
    variables: ContentVariable;
    effectiveness: number;
}
export type ContentType = 'text' | 'html' | 'rich_text' | 'interactive' | 'multimedia';
export interface ContentVariable {
    variable: string;
    source: string;
    fallback: string;
    format: string;
}
export interface ContentPersonalization {
    enabled: boolean;
    factors: PersonalizationFactor;
    rules: PersonalizationRule;
    testing: PersonalizationTesting;
}
export interface PersonalizationFactor {
    factor: string;
    weight: number;
    source: string;
    type: FactorType;
}
export type FactorType = 'demographic' | 'behavioral' | 'contextual' | 'preference' | 'historical' | 'predictive';
export interface PersonalizationRule {
    ruleId: string;
    condition: string;
    modification: string;
    impact: number;
}
export interface PersonalizationTesting {
    enabled: boolean;
    method: TestingMethod;
    variants: number;
    duration: number;
    metrics: string;
}
export type TestingMethod = 'ab_test' | 'multivariate' | 'bandit' | 'personalized';
export interface ContentLocalization {
    enabled: boolean;
    languages: string;
    regions: string;
    culturalAdaptation: boolean;
}
export interface DynamicContent {
    enabled: boolean;
    sources: DynamicSource;
    updateFrequency: number;
    caching: CachingStrategy;
}
export interface DynamicSource {
    sourceId: string;
    type: SourceType;
    endpoint: string;
    parameters: SourceParameters;
}
export type SourceType = 'api' | 'database' | 'file' | 'real_time_feed';
export interface SourceParameters {
    [key: string]: unknown;
}
export interface CachingStrategy {
    enabled: boolean;
    duration: number;
    invalidation: InvalidationRule;
}
export interface InvalidationRule {
    trigger: string;
    action: 'refresh' | 'clear' | 'validate';
}
export interface InterventionTiming {
    triggers: TimingTrigger;
    optimal: OptimalTiming;
    constraints: TimingConstraint;
}
export interface TimingTrigger {
    triggerId: string;
    type: TriggerType;
    conditions: TriggerCondition;
    delay: number;
}
export interface OptimalTiming {
    enabled: boolean;
    algorithm: TimingAlgorithm;
    factors: TimingFactor;
    learning: TimingLearning;
}
export type TimingAlgorithm = 'rule_based' | 'ml_optimized' | 'behavioral_prediction' | 'multi_armed_bandit';
export interface TimingFactor {
    factor: string;
    weight: number;
    type: FactorType;
}
export interface TimingLearning {
    enabled: boolean;
    feedbackLoop: boolean;
    adaptationRate: number;
    performanceMetrics: string;
}
export interface TimingConstraint {
    constraint: string;
    value: Error;
    flexibility: number;
}
export interface InterventionPersonalization {
    userProfile: UserProfilePersonalization;
    contextual: ContextualPersonalization;
    adaptive: AdaptivePersonalization;
}
export interface UserProfilePersonalization {
    demographics: boolean;
    preferences: boolean;
    history: boolean;
    behavior: boolean;
    lifecycle: boolean;
}
export interface ContextualPersonalization {
    device: boolean;
    location: boolean;
    time: boolean;
    environment: boolean;
    session: boolean;
}
export interface AdaptivePersonalization {
    enabled: boolean;
    learningRate: number;
    feedbackIncorporation: boolean;
    performanceTracking: boolean;
}
export interface InterventionEffectiveness {
    overall: EffectivenessMetric;
    byStage: StageEffectiveness;
    bySegment: SegmentEffectiveness;
    temporal: TemporalEffectiveness;
}
export interface EffectivenessMetric {
    metric: string;
    value: number;
    confidence: number;
    sampleSize: number;
    timeframe: string;
}
export interface StageEffectiveness {
    stageId: string;
    stageName: string;
    effectiveness: EffectivenessMetric;
    specificImpacts: SpecificImpact;
}
export interface SpecificImpact {
    aspect: string;
    impact: number;
    significance: number;
}
export interface SegmentEffectiveness {
    segment: string;
    effectiveness: EffectivenessMetric;
    differentialImpact: number;
}
export interface TemporalEffectiveness {
    immediate: EffectivenessMetric;
    shortTerm: EffectivenessMetric;
    mediumTerm: EffectivenessMetric;
    longTerm: EffectivenessMetric;
}
export interface InterventionImplementation {
    requirements: ImplementationRequirement;
    resources: ImplementationResource;
    timeline: ImplementationTimeline;
    risks: ImplementationRisk;
}
export interface ImplementationRequirement {
    requirement: string;
    type: RequirementType;
    priority: RequirementPriority;
    complexity: ComplexityLevel;
}
export type RequirementType = 'technical' | 'operational' | 'legal' | 'business' | 'creative';
export type RequirementPriority = 'must_have' | 'should_have' | 'could_have' | 'nice_to_have';
export interface ImplementationResource {
    resource: string;
    type: ResourceType;
    quantity: number;
    duration: number;
    cost: number;
}
export type ResourceType = 'human' | 'technical' | 'financial' | 'external' | 'infrastructure';
export interface ImplementationTimeline {
    phases: ImplementationPhase;
    totalDuration: number;
    criticalPath: CriticalPathItem;
    milestones: Milestone;
}
export interface ImplementationPhase {
    phaseId: string;
    name: string;
    duration: number;
    dependencies: string;
    deliverables: string;
    resources: string;
}
export interface CriticalPathItem {
    item: string;
    duration: number;
    dependencies: string;
    buffer: number;
}
export interface Milestone {
    milestoneId: string;
    name: string;
    date: number;
    criteria: string;
    importance: MilestoneImportance;
}
export type MilestoneImportance = 'minor' | 'major' | 'critical' | 'go_no_go';
export interface ImplementationRisk {
    riskId: string;
    description: string;
    probability: number;
    impact: RiskImpactLevel;
    mitigation: RiskMitigation;
}
export type RiskImpactLevel = 'low' | 'medium' | 'high' | 'critical';
export interface RiskMitigation {
    strategy: string;
    effectiveness: number;
    cost: number;
    timeline: string;
}
export interface CohortAnalysisSettings {
    enabled: boolean;
    cohortDefinitions: CohortDefinition;
    analysisTypes: CohortAnalysisType;
    comparisonMetrics: CohortMetric;
    timeHorizons: TimeHorizon;
}
export interface CohortDefinition {
    cohortId: string;
    name: string;
    description: string;
    criteria: CohortCriteria;
    size: CohortSize;
    characteristics: CohortCharacteristics;
}
export interface CohortCriteria {
    rules: CohortRule;
    timeframe: CohortTimeframe;
    inclusionConditions: InclusionCondition;
    exclusionConditions: ExclusionCondition;
}
export interface CohortRule {
    ruleId: string;
    field: string;
    operator: ConditionOperator;
    value: Error;
    weight: number;
}
export interface CohortTimeframe {
    startDate: number;
    endDate: number;
    period: TimePeriod;
}
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export interface InclusionCondition {
    condition: string;
    required: boolean;
    weight: number;
}
export interface ExclusionCondition {
    condition: string;
    reason: string;
    strictness: ConditionStrictness;
}
export type ConditionStrictness = 'strict' | 'moderate' | 'flexible';
export interface CohortSize {
    target: number;
    minimum: number;
    maximum: number;
    actual?: number;
}
export interface CohortCharacteristics {
    demographics: DemographicProfile;
    behaviors: BehaviorProfile;
    lifecycle: LifecycleProfile;
    performance: PerformanceProfile;
}
export interface DemographicProfile {
    [key: string]: unknown;
}
export interface BehaviorProfile {
    primaryBehaviors: string;
    engagementLevel: number;
    activityLevel: number;
    preferences: string;
}
export interface LifecycleProfile {
    averageStageProgression: number;
    completionRate: number;
    commonPathways: string;
    riskFactors: string;
}
export interface PerformanceProfile {
    conversionRate: number;
    retentionRate: number;
    engagementScore: number;
    satisfactionScore: number;
}
export type CohortAnalysisType = 'progression_analysis' | 'retention_analysis' | 'conversion_analysis' | 'engagement_analysis' | 'comparative_analysis';
export interface CohortMetric {
    metricId: string;
    name: string;
    description: string;
    calculation: MetricCalculation;
    benchmarks: MetricBenchmark;
}
export interface MetricCalculation {
    formula: string;
    inputs: string;
    aggregation: AggregationMethod;
    timeWindow: number;
}
export interface MetricBenchmark {
    benchmarkType: BenchmarkType;
    value: number;
    context: string;
}
export interface TimeHorizon {
    horizonId: string;
    name: string;
    duration: number;
    checkpoints: TimeCheckpoint;
}
export interface TimeCheckpoint {
    day: number;
    metrics: string;
    significance: CheckpointSignificance;
}
export type CheckpointSignificance = 'routine' | 'important' | 'critical' | 'milestone';
export interface LifecyclePredictionModel {
    modelId: string;
    name: string;
    description: string;
    type: PredictionModelType;
    targets: PredictionTarget;
    features: ModelFeature;
    performance: ModelPerformance;
    deployment: ModelDeployment;
}
export type PredictionModelType = 'stage_transition' | 'churn_prediction' | 'ltv_prediction' | 'engagement_prediction' | 'progression_speed' | 'intervention_response';
export interface PredictionTarget {
    targetId: string;
    name: string;
    type: TargetType;
    timeHorizon: number;
    accuracy: PredictionAccuracy;
}
export type TargetType = 'classification' | 'regression' | 'time_series' | 'survival';
export interface PredictionAccuracy {
    overall: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
}
export interface ModelFeature {
    featureId: string;
    name: string;
    type: FeatureDataType;
    importance: number;
    correlation: number;
    stability: number;
}
export type FeatureDataType = 'numerical' | 'categorical' | 'boolean' | 'temporal' | 'text' | 'embedded';
export interface ModelPerformance {
    trainingPerformance: PerformanceMetrics;
    validationPerformance: PerformanceMetrics;
    testPerformance: PerformanceMetrics;
    productionPerformance: ProductionPerformance;
}
export interface PerformanceMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    mse?: number;
    mae?: number;
}
export interface ProductionPerformance {
    currentPerformance: PerformanceMetrics;
    performanceTrend: PerformanceTrend;
    dataGrift: DataDrift;
    modelDrift: ModelDrift;
}
export interface PerformanceTrend {
    direction: TrendDirection;
    rate: number;
    significance: number;
    timeframe: number;
}
export interface DataDrift {
    detected: boolean;
    severity: DriftSeverity;
    affectedFeatures: string;
    detectionDate: number;
}
export type DriftSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface ModelDrift {
    detected: boolean;
    severity: DriftSeverity;
    impactedPredictions: number;
    recommendedActions: string;
}
export interface ModelDeployment {
    environment: DeploymentEnvironment;
    version: string;
    deployedAt: number;
    lastUpdated: number;
    configuration: DeploymentConfiguration;
    monitoring: ModelMonitoring;
}
export type DeploymentEnvironment = 'development' | 'staging' | 'production' | 'canary';
export interface DeploymentConfiguration {
    batchSize: number;
    updateFrequency: number;
    fallbackModel?: string;
    confidenceThreshold: number;
    explanabilityLevel: ExplanabilityLevel;
}
export type ExplanabilityLevel = 'none' | 'basic' | 'detailed' | 'comprehensive';
export interface ModelMonitoring {
    enabled: boolean;
    metrics: MonitoringMetric;
    alerts: MonitoringAlert;
    reporting: MonitoringReporting;
}
export interface MonitoringMetric {
    metric: string;
    threshold: number;
    frequency: number;
    action: MonitoringAction;
}
export type MonitoringAction = 'log' | 'alert' | 'rollback' | 'retrain';
export interface MonitoringAlert {
    alertId: string;
    condition: string;
    severity: AlertSeverity;
    recipients: string;
    escalation: AlertEscalation;
}
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export interface AlertEscalation {
    enabled: boolean;
    levels: EscalationLevel;
    timeouts: number;
}
export interface EscalationLevel {
    level: number;
    recipients: string;
    actions: string;
}
export interface MonitoringReporting {
    enabled: boolean;
    frequency: ReportingFrequency;
    recipients: string;
    format: ReportFormat;
    content: ReportContent;
}
export type ReportingFrequency = 'daily' | 'weekly' | 'monthly' | 'on_demand';
export type ReportFormat = 'email' | 'dashboard' | 'pdf' | 'json' | 'api';
export interface ReportContent {
    sections: ReportSection;
    visualizations: ReportVisualization;
    insights: boolean;
    recommendations: boolean;
}
export interface ReportSection {
    section: string;
    content: string;
    priority: SectionPriority;
}
export type SectionPriority = 'high' | 'medium' | 'low';
export interface ReportVisualization {
    type: VisualizationType;
    data: string;
    configuration: VisualizationConfiguration;
}
export type VisualizationType = 'line_chart' | 'bar_chart' | 'pie_chart' | 'heatmap' | 'scatter_plot' | 'histogram' | 'box_plot';
export interface VisualizationConfiguration {
    title: string;
    axes: AxisConfiguration;
    colors: ColorScheme;
    interactive: boolean;
}
export interface AxisConfiguration {
    x: AxisSettings;
    y: AxisSettings;
}
export interface AxisSettings {
    label: string;
    scale: ScaleType;
    range?: {
        min: number;
        max: number;
    };
}
export type ScaleType = 'linear' | 'logarithmic' | 'categorical' | 'time';
export type ColorScheme = 'default' | 'viridis' | 'plasma' | 'categorical' | 'custom';
export interface LifecycleTrackingSettings {
    realTimeTracking: boolean;
    batchUpdateFrequency: number;
    dataRetention: DataRetentionSettings;
    privacy: PrivacySettings;
    performance: PerformanceSettings;
    integration: IntegrationSettings;
}
export interface DataRetentionSettings {
    rawData: number;
    aggregatedData: number;
    predictions: number;
    reports: number;
    compliance: ComplianceRequirement;
}
export interface ComplianceRequirement {
    regulation: string;
    retention: number;
    anonymization: boolean;
    deletionTriggers: string;
}
export interface PrivacySettings {
    consentRequired: boolean;
    dataMinimization: boolean;
    anonymization: AnonymizationSettings;
    accessControl: AccessControlSettings;
}
export interface AnonymizationSettings {
    enabled: boolean;
    method: AnonymizationMethod;
    fields: string;
    preserveUtility: boolean;
}
export type AnonymizationMethod = 'hashing' | 'pseudonymization' | 'generalization' | 'suppression';
export interface AccessControlSettings {
    roleBasedAccess: boolean;
    dataClassification: DataClassification;
    auditLogging: boolean;
}
export interface DataClassification {
    classification: ClassificationLevel;
    fields: string;
    accessRoles: string;
    restrictions: string;
}
export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export interface PerformanceSettings {
    caching: CachingConfiguration;
    optimization: OptimizationSettings;
    scaling: ScalingSettings;
}
export interface CachingConfiguration {
    enabled: boolean;
    strategy: CachingStrategy;
    ttl: number;
    invalidation: CacheInvalidation;
}
export interface CacheInvalidation {
    triggers: InvalidationTrigger;
    strategy: InvalidationStrategy;
}
export interface InvalidationTrigger {
    event: string;
    delay: number;
    scope: InvalidationScope;
}
export type InvalidationStrategy = 'immediate' | 'lazy' | 'scheduled' | 'smart';
export type InvalidationScope = 'global' | 'user' | 'segment' | 'specific';
export interface OptimizationSettings {
    indexing: IndexingConfiguration;
    queryOptimization: boolean;
    parallelProcessing: boolean;
    compression: CompressionSettings;
}
export interface IndexingConfiguration {
    enabled: boolean;
    fields: IndexedField;
    strategy: IndexingStrategy;
}
export interface IndexedField {
    field: string;
    type: IndexType;
    priority: IndexPriority;
}
export type IndexType = 'btree' | 'hash' | 'bitmap' | 'full_text';
export type IndexPriority = 'high' | 'medium' | 'low';
export type IndexingStrategy = 'eager' | 'lazy' | 'adaptive';
export interface CompressionSettings {
    enabled: boolean;
    algorithm: CompressionAlgorithm;
    level: CompressionLevel;
    fields: string;
}
export type CompressionAlgorithm = 'gzip' | 'lz4' | 'snappy' | 'zstd';
export type CompressionLevel = 'low' | 'medium' | 'high' | 'maximum';
export interface ScalingSettings {
    autoScaling: boolean;
    triggers: ScalingTrigger;
    limits: ScalingLimits;
    strategy: ScalingStrategy;
}
export interface ScalingTrigger {
    metric: string;
    threshold: number;
    duration: number;
    action: ScalingAction;
}
export type ScalingAction = 'scale_up' | 'scale_down' | 'scale_out' | 'scale_in';
export interface ScalingLimits {
    minInstances: number;
    maxInstances: number;
    minCpu: number;
    maxCpu: number;
    minMemory: number;
    maxMemory: number;
}
export type ScalingStrategy = 'reactive' | 'predictive' | 'scheduled' | 'hybrid';
export interface IntegrationSettings {
    apis: ApiIntegration;
    webhooks: WebhookConfiguration;
    exports: ExportConfiguration;
    imports: ImportConfiguration;
}
export interface ApiIntegration {
    apiId: string;
    name: string;
    endpoint: string;
    authentication: AuthenticationSettings;
    rateLimit: RateLimitSettings;
    retryPolicy: RetryPolicy;
}
export interface AuthenticationSettings {
    type: AuthenticationType;
    credentials: AuthenticationCredentials;
    refreshPolicy: RefreshPolicy;
}
export type AuthenticationType = 'api_key' | 'oauth2' | 'jwt' | 'basic_auth' | 'certificate';
export interface AuthenticationCredentials {
    [key: string]: string;
}
export interface RefreshPolicy {
    enabled: boolean;
    frequency: number;
    buffer: number;
}
export interface RateLimitSettings {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    burstAllowance: number;
}
export interface RetryPolicy {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: BackoffStrategy;
    retryableErrors: string;
}
export type BackoffStrategy = 'fixed' | 'exponential' | 'linear' | 'random';
export interface WebhookConfiguration {
    webhookId: string;
    name: string;
    url: string;
    events: string;
    authentication: WebhookAuthentication;
    reliability: WebhookReliability;
}
export interface WebhookAuthentication {
    type: WebhookAuthType;
    secret: string;
    headers: Record<string, string>;
}
export type WebhookAuthType = 'none' | 'hmac' | 'bearer' | 'custom';
export interface WebhookReliability {
    retries: number;
    timeout: number;
    backoff: BackoffStrategy;
    failureHandling: FailureHandling;
}
export interface FailureHandling {
    strategy: FailureStrategy;
    deadLetterQueue: boolean;
    notification: FailureNotification;
}
export type FailureStrategy = 'ignore' | 'retry' | 'queue' | 'alert';
export interface FailureNotification {
    enabled: boolean;
    threshold: number;
    recipients: string;
    channels: string;
}
export interface ExportConfiguration {
    exportId: string;
    name: string;
    format: ExportFormat;
    schedule: ExportSchedule;
    destination: ExportDestination;
    content: ExportContentSettings;
}
export type ExportFormat = 'csv' | 'json' | 'xml' | 'parquet' | 'avro';
export interface ExportSchedule {
    frequency: ScheduleFrequency;
    time: string;
    timezone: string;
    enabled: boolean;
}
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on_demand';
export interface ExportDestination {
    type: DestinationType;
    configuration: DestinationConfiguration;
    credentials: DestinationCredentials;
}
export type DestinationType = 'file_system' | 's3' | 'gcs' | 'azure_blob' | 'ftp' | 'sftp' | 'database';
export interface DestinationConfiguration {
    [key: string]: unknown;
}
export interface DestinationCredentials {
    [key: string]: string;
}
export interface ExportContentSettings {
    fields: string;
    filters: ExportFilter;
    aggregations: ExportAggregation;
    formatting: ExportFormatting;
}
export interface ExportFilter {
    field: string;
    operator: ConditionOperator;
    value: Error;
}
export interface ExportAggregation {
    field: string;
    method: AggregationMethod;
    groupBy: string;
}
export interface ExportFormatting {
    dateFormat: string;
    numberFormat: string;
    nullValues: string;
    encoding: string;
}
export interface ImportConfiguration {
    importId: string;
    name: string;
    source: ImportSource;
    mapping: ImportMapping;
    validation: ImportValidation;
    processing: ImportProcessing;
}
export interface ImportSource {
    type: SourceType;
    configuration: SourceConfiguration;
    authentication: SourceAuthentication;
}
export interface SourceConfiguration {
    [key: string]: unknown;
}
export interface SourceAuthentication {
    type: AuthenticationType;
    credentials: AuthenticationCredentials;
}
export interface ImportMapping {
    fieldMappings: FieldMapping;
    transformations: FieldTransformation;
    defaults: DefaultValue;
}
export interface FieldMapping {
    sourceField: string;
    targetField: string;
    required: boolean;
    validation: FieldValidation;
}
export interface FieldValidation {
    rules: ValidationRule;
    errorHandling: ValidationErrorHandling;
}
export interface ValidationRule {
    rule: string;
    parameters: ValidationParameters;
    severity: ValidationSeverity;
}
export interface ValidationParameters {
    [key: string]: unknown;
}
export type ValidationSeverity = 'warning' | 'error' | 'critical';
export interface ValidationErrorHandling {
    strategy: ErrorHandlingStrategy;
    fallbackValue?: unknown;
    skipRecord: boolean;
}
export type ErrorHandlingStrategy = 'fail' | 'skip' | 'default' | 'transform';
export interface FieldTransformation {
    sourceField: string;
    transformation: TransformationFunction;
    parameters: TransformationParameters;
}
export interface TransformationFunction {
    name: string;
    code: string;
    language: TransformationLanguage;
}
export type TransformationLanguage = 'javascript' | 'python' | 'sql' | 'regex';
export interface DefaultValue {
    field: string;
    value: Error;
    condition?: string;
}
export interface ImportValidation {
    enabled: boolean;
    rules: ValidationRule;
    sampling: ValidationSampling;
    reporting: ValidationReporting;
}
export interface ValidationSampling {
    enabled: boolean;
    percentage: number;
    minimumRecords: number;
}
export interface ValidationReporting {
    enabled: boolean;
    detailLevel: ReportDetailLevel;
    recipients: string;
    format: ReportFormat;
}
export type ReportDetailLevel = 'summary' | 'detailed' | 'verbose';
export interface ImportProcessing {
    batchSize: number;
    parallelism: number;
    errorTolerance: ErrorTolerance;
    rollback: RollbackConfiguration;
}
export interface ErrorTolerance {
    maxErrors: number;
    errorRate: number;
    continueOnError: boolean;
}
export interface RollbackConfiguration {
    enabled: boolean;
    triggers: RollbackTrigger;
    strategy: RollbackStrategy;
}
export interface RollbackTrigger {
    condition: string;
    threshold: number;
    timeWindow: number;
}
export type RollbackStrategy = 'full' | 'partial' | 'checkpoint' | 'manual';
export interface UserLifecycleData {
    userId: string;
    lifecycleHistory: LifecycleStageRecord;
    currentStage: CurrentStageData;
    progressionAnalysis: ProgressionAnalysis;
    healthAssessment: LifecycleHealthAssessment;
    riskAssessment: LifecycleRiskAssessment;
    interventionHistory: InterventionRecord;
    predictions: LifecyclePrediction;
    cohortMemberships: CohortMembership;
}
export interface LifecycleStageRecord {
    recordId: string;
    stageId: string;
    stageName: string;
    entryDate: number;
    exitDate?: number;
    duration?: number;
    entryTriggers: StageTrigger;
    exitTriggers: StageTrigger;
    stageMetrics: StageMetrics;
    behaviors: StageBehavior;
    interventions: StageIntervention;
    outcomes: StageOutcome;
}
export interface StageTrigger {
    triggerId: string;
    type: TriggerType;
    description: string;
    timestamp: number;
    confidence: number;
    context: TriggerContext;
}
export interface TriggerContext {
    events: ContextEvent;
    conditions: ContextCondition;
    environment: EnvironmentContext;
}
export interface ContextEvent {
    eventType: string;
    timestamp: number;
    data: Record<string, any>;
    significance: number;
}
export interface ContextCondition {
    condition: string;
    value: Error;
    met: boolean;
    confidence: number;
}
export interface EnvironmentContext {
    device: string;
    platform: string;
    location?: string;
    timeOfDay: string;
    dayOfWeek: string;
    season: string;
}
export interface StageMetrics {
    engagementLevel: number;
    activityLevel: number;
    satisfactionScore: number;
    progressScore: number;
    riskScore: number;
    valueScore: number;
    customMetrics: CustomMetric;
}
export interface CustomMetric {
    metricId: string;
    name: string;
    value: number;
    unit: string;
    context: string;
}
export interface StageBehavior {
    behaviorId: string;
    name: string;
    frequency: number;
    intensity: number;
    duration: number;
    pattern: BehaviorPattern;
    context: BehaviorContext;
}
export interface BehaviorPattern {
    patternType: PatternType;
    regularity: number;
    predictability: number;
    seasonality?: SeasonalityInfo;
}
export type PatternType = 'consistent' | 'sporadic' | 'declining' | 'growing' | 'cyclical';
export interface SeasonalityInfo {
    period: number;
    amplitude: number;
    phase: number;
}
export interface BehaviorContext {
    triggers: string;
    inhibitors: string;
    facilitators: string;
    correlations: BehaviorCorrelation;
}
export interface BehaviorCorrelation {
    behavior: string;
    correlation: number;
    significance: number;
}
export interface StageIntervention {
    interventionId: string;
    type: InterventionType;
    timestamp: number;
    response: InterventionResponse;
    effectiveness: InterventionEffectiveness;
    followUp: InterventionFollowUp;
}
export interface InterventionResponse {
    responseType: ResponseType;
    responseTime: number;
    engagement: number;
    sentiment: ResponseSentiment;
    actions: ResponseAction;
}
export type ResponseType = 'positive' | 'negative' | 'neutral' | 'mixed' | 'no_response';
export interface ResponseSentiment {
    score: number;
    confidence: number;
    aspects: SentimentAspect;
}
export interface SentimentAspect {
    aspect: string;
    sentiment: number;
    confidence: number;
}
export interface ResponseAction {
    action: string;
    timestamp: number;
    context: ActionContext;
    outcome: ActionOutcome;
}
export interface ActionContext {
    page: string;
    feature: string;
    sessionId: string;
    deviceType: string;
}
export interface ActionOutcome {
    successful: boolean;
    valueGenerated: number;
    satisfactionImpact: number;
    progressionImpact: number;
}
export interface InterventionFollowUp {
    followUpId: string;
    type: FollowUpType;
    scheduledFor: number;
    completed: boolean;
    outcome?: FollowUpOutcome;
}
export type FollowUpType = 'check_in' | 'reminder' | 'escalation' | 'support' | 'feedback';
export interface FollowUpOutcome {
    success: boolean;
    feedback: string;
    nextActions: string;
    satisfaction: number;
}
export interface StageOutcome {
    outcomeType: OutcomeType;
    value: number;
    unit: string;
    timestamp: number;
    attribution: OutcomeAttribution;
}
export type OutcomeType = 'conversion' | 'engagement_increase' | 'satisfaction_improvement' | 'value_realization' | 'progression_acceleration' | 'risk_reduction';
export interface OutcomeAttribution {
    factor: string;
    contribution: number;
    confidence: number;
}
export interface CurrentStageData {
    stageId: string;
    stageName: string;
    entryDate: number;
    daysInStage: number;
    progress: StageProgress;
    health: StageHealth;
    risks: StageRisk;
    opportunities: StageOpportunityAssessment;
    nextStagePredictiuons: NextStagePrediction;
}
export interface StageProgress {
    overall: number;
    milestones: MilestoneProgress;
    trajectory: ProgressTrajectory;
    blockers: ProgressBlocker;
}
export interface MilestoneProgress {
    milestoneId: string;
    name: string;
    completed: boolean;
    progress: number;
    estimatedCompletion?: number;
}
export interface ProgressTrajectory {
    direction: TrajectoryDirection;
    velocity: number;
    acceleration: number;
    forecast: TrajectoryForecast;
}
export type TrajectoryDirection = 'forward' | 'stalled' | 'backward' | 'accelerating' | 'decelerating';
export interface TrajectoryForecast {
    shortTerm: ForecastPoint;
    mediumTerm: ForecastPoint;
    longTerm: ForecastPoint;
}
export interface ForecastPoint {
    predictedProgress: number;
    confidence: number;
    factors: ForecastingFactor;
}
export interface ForecastingFactor {
    factor: string;
    impact: number;
    certainty: number;
}
export interface ProgressBlocker {
    blockerId: string;
    name: string;
    severity: BlockerSeverity;
    impact: BlockerImpact;
    resolutionStrategies: BlockerResolutionStrategy;
}
export interface BlockerImpact {
    progressDelay: number;
    satisfactionImpact: number;
    riskIncrease: number;
}
export interface BlockerResolutionStrategy {
    strategy: string;
    effectiveness: number;
    effort: EffortLevel;
    timeline: string;
    resources: string;
}
export interface StageHealth {
    overall: number;
    dimensions: HealthDimension;
    trends: HealthTrend;
    alerts: HealthAlert;
}
export interface HealthDimension {
    dimension: string;
    score: number;
    weight: number;
    trend: DimensionTrend;
    contributors: HealthContributor;
}
export interface DimensionTrend {
    direction: TrendDirection;
    strength: number;
    duration: number;
    significance: number;
}
export interface HealthContributor {
    contributor: string;
    impact: number;
    confidence: number;
}
export interface HealthTrend {
    aspect: string;
    trend: TrendDirection;
    change: number;
    timeframe: number;
    significance: number;
}
export interface HealthAlert {
    alertId: string;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    timestamp: number;
    actionRequired: boolean;
    recommendedActions: string;
}
export type AlertType = 'health_decline' | 'risk_increase' | 'milestone_delay' | 'anomaly_detected';
export interface StageRisk {
    riskId: string;
    name: string;
    type: StageRiskType;
    severity: RiskSeverity;
    probability: number;
    impact: StageRiskImpact;
    indicators: RiskIndicator;
    mitigation: RiskMitigationPlan;
}
export type StageRiskType = 'churn_risk' | 'progression_stall' | 'satisfaction_decline' | 'engagement_drop' | 'value_erosion';
export interface StageRiskImpact {
    userExperience: number;
    businessValue: number;
    futureProgression: number;
    interventionCost: number;
}
export interface RiskIndicator {
    indicator: string;
    currentValue: number;
    threshold: number;
    severity: IndicatorSeverity;
    trend: IndicatorTrend;
}
export type IndicatorSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface IndicatorTrend {
    direction: TrendDirection;
    rate: number;
    consistency: number;
}
export interface RiskMitigationPlan {
    strategies: MitigationStrategy;
    priority: MitigationPriority;
    timeline: MitigationTimeline;
    resources: MitigationResource;
}
export interface MitigationPriority {
    immediate: string;
    shortTerm: string;
    longTerm: string;
}
export interface MitigationTimeline {
    immediate: number;
    shortTerm: number;
    longTerm: number;
}
export interface MitigationResource {
    resource: string;
    type: ResourceType;
    availability: number;
    cost: number;
}
export interface StageOpportunityAssessment {
    opportunityId: string;
    name: string;
    type: OpportunityType;
    potential: OpportunityPotentialAssessment;
    feasibility: OpportunityFeasibility;
    timeline: OpportunityTimeline;
    requirements: OpportunityRequirementAssessment;
}
export interface OpportunityPotentialAssessment {
    score: number;
    benefits: OpportunityBenefit;
    risks: OpportunityRisk;
    confidence: number;
}
export interface OpportunityBenefit {
    benefit: string;
    impact: number;
    likelihood: number;
    timeframe: string;
}
export interface OpportunityRisk {
    risk: string;
    impact: number;
    likelihood: number;
    mitigation: string;
}
export interface OpportunityFeasibility {
    technical: number;
    operational: number;
    financial: number;
    strategic: number;
    overall: number;
}
export interface OpportunityTimeline {
    planning: number;
    implementation: number;
    realization: number;
    total: number;
}
export interface OpportunityRequirementAssessment {
    requirement: string;
    complexity: ComplexityLevel;
    availability: number;
    cost: number;
    criticalPath: boolean;
}
export interface NextStagePrediction {
    stageId: string;
    stageName: string;
    probability: number;
    estimatedTransitionTime: number;
    confidence: number;
    requirements: TransitionRequirement;
    accelerators: TransitionAccelerator;
}
export interface TransitionRequirement {
    requirement: string;
    currentStatus: number;
    importance: number;
    timeToMeet: number;
}
export interface TransitionAccelerator {
    accelerator: string;
    potential: number;
    effort: EffortLevel;
    impact: AcceleratorImpact;
}
export interface AcceleratorImpact {
    transitionSpeedup: number;
    probabilityIncrease: number;
    confidenceIncrease: number;
}
export interface ProgressionAnalysis {
    overallProgression: OverallProgression;
    stageAnalysis: StageProgressionAnalysis;
    pathwayAnalysis: PathwayAnalysis;
    velocityAnalysis: VelocityAnalysis;
    benchmarkComparison: ProgressionBenchmark;
}
export interface OverallProgression {
    totalDuration: number;
    stagesCompleted: number;
    progressionRate: number;
    efficiency: number;
    trajectory: OverallTrajectory;
}
export interface OverallTrajectory {
    direction: TrajectoryDirection;
    consistency: number;
    momentum: number;
    forecast: ProgressionForecast;
}
export interface ProgressionForecast {
    nextMilestone: MilestoneForecast;
    completion: CompletionForecast;
    risks: ForecastRisk;
}
export interface MilestoneForecast {
    milestone: string;
    estimatedDate: number;
    confidence: number;
    requirements: ForecastRequirement;
}
export interface ForecastRequirement {
    requirement: string;
    probability: number;
    impact: number;
}
export interface CompletionForecast {
    estimatedCompletionDate: number;
    confidence: number;
    scenarios: CompletionScenario;
}
export interface CompletionScenario {
    scenario: string;
    probability: number;
    duration: number;
    conditions: string;
}
export interface ForecastRisk {
    risk: string;
    probability: number;
    impact: ForecastRiskImpact;
    mitigation: string;
}
export interface ForecastRiskImpact {
    delayDays: number;
    probabilityReduction: number;
    alternativePaths: string;
}
export interface StageProgressionAnalysis {
    stageId: string;
    stageName: string;
    performance: StagePerformance;
    comparison: StageComparison;
    insights: StageInsight;
}
export interface StagePerformance {
    duration: number;
    efficiency: number;
    satisfaction: number;
    valueRealized: number;
    challengesFaced: StageChallengeRecord;
}
export interface StageChallengeRecord {
    challenge: string;
    severity: ChallengeSeverity;
    duration: number;
    resolution: ChallengeResolution;
    impact: ChallengeImpact;
}
export type ChallengeSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export interface ChallengeResolution {
    resolved: boolean;
    method: string;
    timeToResolution: number;
    effectiveness: number;
}
export interface ChallengeImpact {
    progressDelay: number;
    satisfactionImpact: number;
    futureStageImpact: number;
}
export interface StageComparison {
    vsTypical: ComparisonResult;
    vsCohort: ComparisonResult;
    vsPersonalBest: ComparisonResult;
}
export interface ComparisonResult {
    metric: string;
    userValue: number;
    benchmarkValue: number;
    difference: number;
    percentile: number;
    significance: ComparisonSignificance;
}
export type ComparisonSignificance = 'much_better' | 'better' | 'average' | 'worse' | 'much_worse';
export interface StageInsight {
    insight: string;
    type: InsightType;
    impact: InsightImpact;
    actionable: boolean;
    recommendations: string;
}
export type InsightType = 'performance' | 'behavioral' | 'comparative' | 'predictive' | 'optimization';
export interface InsightImpact {
    scope: InsightScope;
    magnitude: ImpactMagnitude;
    confidence: number;
}
export type InsightScope = 'current_stage' | 'future_stages' | 'overall_journey' | 'experience';
export type ImpactMagnitude = 'low' | 'medium' | 'high' | 'transformative';
export interface LifecycleTrackingExportData {
    userLifecycleData: UserLifecycleData;
    stageTransitions: StageTransition;
    interventionEffectiveness: InterventionEffectivenessReport;
    cohortAnalysis: CohortAnalysisResult;
    predictions: LifecyclePredictionResult;
    insights: LifecycleInsight;
    metadata: LifecycleExportMetadata;
}
export interface StageTransition {
    userId: string;
    fromStage: string;
    toStage: string;
    transitionDate: number;
    duration: number;
    triggers: string;
    success: boolean;
}
export interface InterventionEffectivenessReport {
    interventionId: string;
    name: string;
    effectiveness: number;
    participants: number;
    outcomes: InterventionOutcome;
}
export interface InterventionOutcome {
    metric: string;
    improvement: number;
    significance: number;
}
export interface CohortAnalysisResult {
    cohortId: string;
    name: string;
    size: number;
    performance: CohortPerformanceMetrics;
    insights: string;
}
export interface CohortPerformanceMetrics {
    progressionRate: number;
    completionRate: number;
    satisfactionScore: number;
    retentionRate: number;
}
export interface LifecyclePredictionResult {
    userId: string;
    predictions: PredictionResult;
    confidence: number;
    timeHorizon: number;
}
export interface PredictionResult {
    metric: string;
    predictedValue: number;
    confidence: number;
    factors: string;
}
export interface LifecycleInsight {
    insightId: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    affectedUsers: number;
    potentialImpact: {
        scope: string;
        magnitude: string;
        confidence: number;
    };
    recommendations: Array<{}, recommendationId>;
    string: any;
    action: string;
    rationale: string;
    priority: string;
    effort: string;
    expectedOutcome: string;
    successMetrics: string;
}
export interface LifecycleExportMetadata {
    exportTimestamp: number;
    version: string;
    totalUsers: number;
    analysisePeriod: {
        start: number;
        end: number;
    };
    configurationVersion: string;
}
export interface PathwayAnalysis {
    primaryPath: string;
    alternativePaths: AlternativePath;
    efficiency: number;
    uniqueness: number;
}
export interface AlternativePath {
    path: string;
    frequency: number;
    efficiency: number;
    outcomes: PathOutcome;
}
export interface PathOutcome {
    outcome: string;
    probability: number;
    value: number;
}
export interface VelocityAnalysis {
    currentVelocity: number;
    averageVelocity: number;
    acceleration: number;
    factors: VelocityFactor;
}
export interface VelocityFactor {
    factor: string;
    impact: number;
    confidence: number;
}
export interface ProgressionBenchmark {
    vsIndustry: ComparisonResult;
    vsCohort: ComparisonResult;
    vsHistorical: ComparisonResult;
}
export interface LifecycleHealthAssessment {
    overall: number;
    dimensions: HealthDimension;
    trends: HealthTrend;
    alerts: HealthAlert;
    recommendations: HealthRecommendation;
}
export interface HealthRecommendation {
    recommendationId: string;
    aspect: string;
    action: string;
    priority: string;
    impact: number;
}
export interface LifecycleRiskAssessment {
    overall: number;
    risks: LifecycleRisk;
    mitigation: RiskMitigationStrategy;
    monitoring: RiskMonitoringPlan;
}
export interface LifecycleRisk {
    riskId: string;
    name: string;
    probability: number;
    impact: number;
    category: string;
    indicators: string;
}
export interface RiskMitigationStrategy {
    riskId: string;
    strategy: string;
    effectiveness: number;
    cost: number;
    timeline: string;
}
export interface RiskMonitoringPlan {
    riskId: string;
    monitors: RiskMonitor;
    alertThresholds: AlertThreshold;
    escalationProcedure: EscalationProcedure;
}
export interface RiskMonitor {
    metric: string;
    frequency: string;
    threshold: number;
    action: string;
}
export interface AlertThreshold {
    level: string;
    value: number;
    response: string;
}
export interface EscalationProcedure {
    levels: EscalationLevel;
    timeouts: number;
    notifications: NotificationSetting;
}
export interface NotificationSetting {
    level: string;
    recipients: string;
    methods: string;
}
export interface LifecyclePrediction {
    predictionId: string;
    type: string;
    target: string;
    value: number;
    confidence: number;
    timeHorizon: number;
    factors: PredictionFactor;
    alternatives: AlternativePrediction;
}
export interface AlternativePrediction {
    scenario: string;
    probability: number;
    value: number;
    conditions: string;
}
export interface CohortMembership {
    cohortId: string;
    cohortName: string;
    joinDate: number;
    membershipProbability: number;
    characteristics: CohortMemberCharacteristics;
    performance: CohortMemberPerformance;
}
export interface CohortMemberCharacteristics {
    demographics: Record<string, any>;
    behaviors: Record<string, any>;
    preferences: Record<string, any>;
}
export interface CohortMemberPerformance {
    relativeProgression: number;
    relativeEngagement: number;
    relativeSatisfaction: number;
    relativeValue: number;
}
export default UserLifecycleTracking;
//# sourceMappingURL=UserLifecycleTracking.d.ts.map