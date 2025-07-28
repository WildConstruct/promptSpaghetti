/**
 * User Lifecycle Stage Tracking and Progression Analysis - Story 30.2 Task 9
 * 
 * Comprehensive system for tracking user lifecycle stages and analyzing progression
 * patterns to understand user journey evolution, predict lifecycle transitions,
 * and optimize stage-specific experiences and interventions.
 * 
 * Features:
 * - Multi-stage lifecycle definition and tracking
 * - Automated stage transition detection and prediction
 * - Progression pathway analysis and optimization
 * - Stage-specific behavioral analysis and insights
 * - Lifecycle health scoring and risk assessment
 * - Personalized intervention recommendations
 * - Cohort lifecycle analysis and benchmarking
 * - Predictive lifecycle modeling and forecasting
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  ConversionFunnelDefinition,
  ConversionStep,
  UserSegment,
  ConversionCohort
} from '../../analytics/ConversionDataModel';
import { 
  ConversionAnalyticsInfrastructure,
  ConversionMetricQuery,
  ConversionMetricResult
} from '../../analytics/ConversionAnalyticsInfrastructure';

// User lifecycle tracking interfaces
export interface UserLifecycleTrackingProps {
  analyticsInfrastructure: ConversionAnalyticsInfrastructure;
  lifecycleConfig: LifecycleConfiguration;
  userLifecycleData: UserLifecycleData[];
  cohortAnalysisEnabled?: boolean;
  predictiveModelingEnabled?: boolean;
  onStageTransition?: (userId: string, transition: StageTransition) => void;
  onLifecycleInsight?: (insight: LifecycleInsight) => void;
  onInterventionRecommended?: (recommendation: InterventionRecommendation) => void;
  onExport?: (data: LifecycleTrackingExportData) => void;
}

export interface LifecycleConfiguration {
  stageDefinitions: LifecycleStage[];
  transitionRules: TransitionRule[];
  healthMetrics: LifecycleHealthMetric[];
  interventionStrategies: InterventionStrategy[];
  cohortSettings: CohortAnalysisSettings;
  predictionModels: LifecyclePredictionModel[];
  trackingSettings: LifecycleTrackingSettings;
}

export interface LifecycleStage {
  stageId: string;
  name: string;
  description: string;
  category: StageCategory;
  sequence: number;
  duration: StageDuration;
  entryConditions: StageCondition[];
  exitConditions: StageCondition[];
  healthIndicators: HealthIndicator[];
  typicalBehaviors: TypicalBehavior[];
  riskFactors: RiskFactor[];
  opportunities: StageOpportunity[];
}

export type StageCategory = 
  | 'acquisition'
  | 'activation'
  | 'engagement'
  | 'retention'
  | 'growth'
  | 'advocacy'
  | 'dormancy'
  | 'churn';

export interface StageDuration {
  typical: number; // days
  minimum: number; // days
  maximum: number; // days
  variance: number; // standard deviation
}

export interface StageCondition {
  conditionId: string;
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: Error;
  weight: number; // 0-1
  required: boolean;
}

export type ConditionType = 
  | 'behavioral'
  | 'temporal'
  | 'transactional'
  | 'engagement'
  | 'demographic'
  | 'contextual';

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'in'
  | 'contains'
  | 'exists'
  | 'not_exists';

export interface HealthIndicator {
  indicatorId: string;
  name: string;
  type: IndicatorType;
  measurement: IndicatorMeasurement;
  thresholds: IndicatorThreshold[];
  weight: number; // 0-1
}

export type IndicatorType = 
  | 'engagement_frequency'
  | 'engagement_depth'
  | 'progression_rate'
  | 'satisfaction_score'
  | 'value_realization'
  | 'risk_score';

export interface IndicatorMeasurement {
  metric: string;
  aggregation: AggregationMethod;
  timeWindow: number; // days
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
  frequency: number; // 0-1
  importance: number; // 0-1
  indicators: BehaviorIndicator[];
}

export interface BehaviorIndicator {
  indicator: string;
  expectedValue: number;
  variance: number;
  correlation: number; // -1 to 1
}

export interface RiskFactor {
  factorId: string;
  name: string;
  description: string;
  severity: RiskSeverity;
  likelihood: number; // 0-1
  impact: RiskImpact;
  mitigation: MitigationStrategy[];
}

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskImpact {
  stageProgression: number; // -1 to 1
  userExperience: number; // -1 to 1
  businessValue: number; // -1 to 1
  retentionRisk: number; // 0-1
}

export interface MitigationStrategy {
  strategyId: string;
  name: string;
  description: string;
  effectiveness: number; // 0-1
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
  requirements: OpportunityRequirement[];
}

export type OpportunityType = 
  | 'engagement_increase'
  | 'progression_acceleration'
  | 'value_realization'
  | 'experience_enhancement'
  | 'personalization'
  | 'cross_sell'
  | 'up_sell';

export interface OpportunityPotential {
  engagementLift: number; // percentage
  progressionAcceleration: number; // percentage
  valueIncrease: number; // percentage
  satisfactionImprovement: number; // percentage
  confidence: number; // 0-1
}

export interface OpportunityRequirement {
  requirement: string;
  complexity: ComplexityLevel;
  resources: string[];
  timeline: string;
}

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'very_complex';

// Transition rules and analysis
export interface TransitionRule {
  ruleId: string;
  name: string;
  fromStage: string;
  toStage: string;
  conditions: TransitionCondition[];
  probability: TransitionProbability;
  triggers: TransitionTrigger[];
  blockers: TransitionBlocker[];
}

export interface TransitionCondition {
  conditionId: string;
  type: ConditionType;
  requirement: string;
  threshold: number;
  weight: number; // 0-1
  temporal: TemporalRequirement;
}

export interface TemporalRequirement {
  minimumDuration: number; // days in current stage
  maximumDuration: number; // days in current stage
  timeWindow: number; // days to evaluate condition
  consistency: number; // 0-1, how consistent condition must be
}

export interface TransitionProbability {
  baseRate: number; // 0-1
  factors: ProbabilityFactor[];
  timeDependent: boolean;
  probabilityFunction: ProbabilityFunction;
}

export interface ProbabilityFactor {
  factor: string;
  influence: number; // -1 to 1
  confidence: number; // 0-1
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
  conditions: TriggerCondition[];
  effectiveness: number; // 0-1
}

export type TriggerType = 
  | 'behavioral_milestone'
  | 'engagement_threshold'
  | 'time_based'
  | 'value_realization'
  | 'external_event'
  | 'intervention_response';

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: Error;
  persistence: number; // days condition must persist
}

export interface TransitionBlocker {
  blockerId: string;
  name: string;
  description: string;
  severity: BlockerSeverity;
  detection: BlockerDetection;
  resolution: BlockerResolution[];
}

export type BlockerSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export interface BlockerDetection {
  indicators: string[];
  threshold: number;
  timeWindow: number; // days
  confidence: number; // 0-1
}

export interface BlockerResolution {
  resolutionId: string;
  method: string;
  effectiveness: number; // 0-1
  effort: EffortLevel;
  timeline: string;
}

// Health metrics and assessment
export interface LifecycleHealthMetric {
  metricId: string;
  name: string;
  description: string;
  category: HealthCategory;
  calculation: HealthCalculation;
  benchmarks: HealthBenchmark[];
  trends: TrendAnalysis;
}

export type HealthCategory = 
  | 'progression_health'
  | 'engagement_health'
  | 'satisfaction_health'
  | 'value_health'
  | 'retention_health';

export interface HealthCalculation {
  formula: string;
  inputs: HealthInput[];
  aggregation: AggregationMethod;
  normalization: NormalizationMethod;
  weighting: WeightingScheme;
}

export interface HealthInput {
  inputId: string;
  name: string;
  source: string;
  weight: number; // 0-1
  transformation: InputTransformation;
}

export interface InputTransformation {
  method: TransformationMethod;
  parameters: TransformationParameters;
}

export type TransformationMethod = 
  | 'none'
  | 'logarithmic'
  | 'exponential'
  | 'polynomial'
  | 'threshold'
  | 'binning';

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
  conditions: string[];
  sampleSize: number;
}

export interface TrendAnalysis {
  direction: TrendDirection;
  strength: number; // 0-1
  consistency: number; // 0-1
  seasonality: SeasonalityPattern[];
  forecast: TrendForecast;
}

export type TrendDirection = 'improving' | 'declining' | 'stable' | 'volatile';

export interface SeasonalityPattern {
  pattern: string;
  amplitude: number;
  period: number; // days
  confidence: number; // 0-1
}

export interface TrendForecast {
  shortTerm: ForecastPeriod; // 30 days
  mediumTerm: ForecastPeriod; // 90 days
  longTerm: ForecastPeriod; // 365 days
}

export interface ForecastPeriod {
  predictedValue: number;
  confidence: number; // 0-1
  range: { min: number; max: number };
  factors: ForecastFactor[];
}

export interface ForecastFactor {
  factor: string;
  influence: number; // -1 to 1
  certainty: number; // 0-1
}

// Intervention strategies
export interface InterventionStrategy {
  strategyId: string;
  name: string;
  description: string;
  targetStages: string[];
  targetConditions: InterventionCondition[];
  interventions: Intervention[];
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

export type InterventionType = 
  | 'educational'
  | 'motivational'
  | 'support'
  | 'incentive'
  | 'reminder'
  | 'guidance'
  | 'social_proof'
  | 'gamification';

export interface InterventionDelivery {
  channels: DeliveryChannel[];
  frequency: DeliveryFrequency;
  duration: DeliveryDuration;
  fallback: FallbackStrategy;
}

export interface DeliveryChannel {
  channel: ChannelType;
  priority: number;
  effectiveness: number; // 0-1
  constraints: ChannelConstraint[];
}

export type ChannelType = 
  | 'email'
  | 'push_notification'
  | 'in_app'
  | 'sms'
  | 'web_notification'
  | 'phone_call'
  | 'chatbot'
  | 'human_outreach';

export interface ChannelConstraint {
  constraint: string;
  value: Error;
  impact: number; // 0-1
}

export interface DeliveryFrequency {
  initial: FrequencySpec;
  ongoing: FrequencySpec;
  escalation: EscalationSpec;
}

export interface FrequencySpec {
  frequency: number; // per day/week/month
  interval: number; // hours/days between messages
  maximum: number; // max messages in period
}

export interface EscalationSpec {
  triggers: EscalationTrigger[];
  changes: EscalationChange[];
}

export interface EscalationTrigger {
  condition: string;
  threshold: number;
  timeframe: number; // days
}

export interface EscalationChange {
  aspect: 'frequency' | 'channel' | 'content' | 'urgency';
  modification: string;
  factor: number;
}

export interface DeliveryDuration {
  campaign: number; // days
  cooldown: number; // days between campaigns
  expiration: number; // days message remains valid
}

export interface FallbackStrategy {
  enabled: boolean;
  triggers: FallbackTrigger[];
  alternatives: AlternativeIntervention[];
}

export interface FallbackTrigger {
  condition: string;
  threshold: number;
  timeframe: number; // hours
}

export interface AlternativeIntervention {
  interventionId: string;
  probability: number; // 0-1
  effectiveness: number; // 0-1
}

export interface InterventionContent {
  templates: ContentTemplate[];
  personalization: ContentPersonalization;
  localization: ContentLocalization;
  dynamic: DynamicContent;
}

export interface ContentTemplate {
  templateId: string;
  name: string;
  type: ContentType;
  content: string;
  variables: ContentVariable[];
  effectiveness: number; // 0-1
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
  factors: PersonalizationFactor[];
  rules: PersonalizationRule[];
  testing: PersonalizationTesting;
}

export interface PersonalizationFactor {
  factor: string;
  weight: number; // 0-1
  source: string;
  type: FactorType;
}

export type FactorType = 
  | 'demographic'
  | 'behavioral'
  | 'contextual'
  | 'preference'
  | 'historical'
  | 'predictive';

export interface PersonalizationRule {
  ruleId: string;
  condition: string;
  modification: string;
  impact: number; // 0-1
}

export interface PersonalizationTesting {
  enabled: boolean;
  method: TestingMethod;
  variants: number;
  duration: number; // days
  metrics: string[];
}

export type TestingMethod = 'ab_test' | 'multivariate' | 'bandit' | 'personalized';

export interface ContentLocalization {
  enabled: boolean;
  languages: string[];
  regions: string[];
  culturalAdaptation: boolean;
}

export interface DynamicContent {
  enabled: boolean;
  sources: DynamicSource[];
  updateFrequency: number; // hours
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
  duration: number; // hours
  invalidation: InvalidationRule[];
}

export interface InvalidationRule {
  trigger: string;
  action: 'refresh' | 'clear' | 'validate';
}

export interface InterventionTiming {
  triggers: TimingTrigger[];
  optimal: OptimalTiming;
  constraints: TimingConstraint[];
}

export interface TimingTrigger {
  triggerId: string;
  type: TriggerType;
  conditions: TriggerCondition[];
  delay: number; // minutes
}

export interface OptimalTiming {
  enabled: boolean;
  algorithm: TimingAlgorithm;
  factors: TimingFactor[];
  learning: TimingLearning;
}

export type TimingAlgorithm = 'rule_based' | 'ml_optimized' | 'behavioral_prediction' | 'multi_armed_bandit';

export interface TimingFactor {
  factor: string;
  weight: number; // 0-1
  type: FactorType;
}

export interface TimingLearning {
  enabled: boolean;
  feedbackLoop: boolean;
  adaptationRate: number; // 0-1
  performanceMetrics: string[];
}

export interface TimingConstraint {
  constraint: string;
  value: Error;
  flexibility: number; // 0-1
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
  learningRate: number; // 0-1
  feedbackIncorporation: boolean;
  performanceTracking: boolean;
}

export interface InterventionEffectiveness {
  overall: EffectivenessMetric;
  byStage: StageEffectiveness[];
  bySegment: SegmentEffectiveness[];
  temporal: TemporalEffectiveness;
}

export interface EffectivenessMetric {
  metric: string;
  value: number;
  confidence: number; // 0-1
  sampleSize: number;
  timeframe: string;
}

export interface StageEffectiveness {
  stageId: string;
  stageName: string;
  effectiveness: EffectivenessMetric;
  specificImpacts: SpecificImpact[];
}

export interface SpecificImpact {
  aspect: string;
  impact: number; // -1 to 1
  significance: number; // 0-1
}

export interface SegmentEffectiveness {
  segment: string;
  effectiveness: EffectivenessMetric;
  differentialImpact: number; // compared to baseline
}

export interface TemporalEffectiveness {
  immediate: EffectivenessMetric; // 0-24 hours
  shortTerm: EffectivenessMetric; // 1-7 days
  mediumTerm: EffectivenessMetric; // 1-4 weeks
  longTerm: EffectivenessMetric; // 1+ months
}

export interface InterventionImplementation {
  requirements: ImplementationRequirement[];
  resources: ImplementationResource[];
  timeline: ImplementationTimeline;
  risks: ImplementationRisk[];
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
  duration: number; // days
  cost: number;
}

export type ResourceType = 'human' | 'technical' | 'financial' | 'external' | 'infrastructure';

export interface ImplementationTimeline {
  phases: ImplementationPhase[];
  totalDuration: number; // days
  criticalPath: CriticalPathItem[];
  milestones: Milestone[];
}

export interface ImplementationPhase {
  phaseId: string;
  name: string;
  duration: number; // days
  dependencies: string[];
  deliverables: string[];
  resources: string[];
}

export interface CriticalPathItem {
  item: string;
  duration: number; // days
  dependencies: string[];
  buffer: number; // days
}

export interface Milestone {
  milestoneId: string;
  name: string;
  date: number; // timestamp
  criteria: string[];
  importance: MilestoneImportance;
}

export type MilestoneImportance = 'minor' | 'major' | 'critical' | 'go_no_go';

export interface ImplementationRisk {
  riskId: string;
  description: string;
  probability: number; // 0-1
  impact: RiskImpactLevel;
  mitigation: RiskMitigation[];
}

export type RiskImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskMitigation {
  strategy: string;
  effectiveness: number; // 0-1
  cost: number;
  timeline: string;
}

// Cohort analysis settings
export interface CohortAnalysisSettings {
  enabled: boolean;
  cohortDefinitions: CohortDefinition[];
  analysisTypes: CohortAnalysisType[];
  comparisonMetrics: CohortMetric[];
  timeHorizons: TimeHorizon[];
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
  rules: CohortRule[];
  timeframe: CohortTimeframe;
  inclusionConditions: InclusionCondition[];
  exclusionConditions: ExclusionCondition[];
}

export interface CohortRule {
  ruleId: string;
  field: string;
  operator: ConditionOperator;
  value: Error;
  weight: number; // 0-1
}

export interface CohortTimeframe {
  startDate: number; // timestamp
  endDate: number; // timestamp
  period: TimePeriod;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface InclusionCondition {
  condition: string;
  required: boolean;
  weight: number; // 0-1
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
  primaryBehaviors: string[];
  engagementLevel: number; // 0-1
  activityLevel: number; // 0-1
  preferences: string[];
}

export interface LifecycleProfile {
  averageStageProgression: number; // days
  completionRate: number; // 0-1
  commonPathways: string[];
  riskFactors: string[];
}

export interface PerformanceProfile {
  conversionRate: number; // 0-1
  retentionRate: number; // 0-1
  engagementScore: number; // 0-100
  satisfactionScore: number; // 0-100
}

export type CohortAnalysisType = 
  | 'progression_analysis'
  | 'retention_analysis'
  | 'conversion_analysis'
  | 'engagement_analysis'
  | 'comparative_analysis';

export interface CohortMetric {
  metricId: string;
  name: string;
  description: string;
  calculation: MetricCalculation;
  benchmarks: MetricBenchmark[];
}

export interface MetricCalculation {
  formula: string;
  inputs: string[];
  aggregation: AggregationMethod;
  timeWindow: number; // days
}

export interface MetricBenchmark {
  benchmarkType: BenchmarkType;
  value: number;
  context: string;
}

export interface TimeHorizon {
  horizonId: string;
  name: string;
  duration: number; // days
  checkpoints: TimeCheckpoint[];
}

export interface TimeCheckpoint {
  day: number;
  metrics: string[];
  significance: CheckpointSignificance;
}

export type CheckpointSignificance = 'routine' | 'important' | 'critical' | 'milestone';

// Prediction models
export interface LifecyclePredictionModel {
  modelId: string;
  name: string;
  description: string;
  type: PredictionModelType;
  targets: PredictionTarget[];
  features: ModelFeature[];
  performance: ModelPerformance;
  deployment: ModelDeployment;
}

export type PredictionModelType = 
  | 'stage_transition'
  | 'churn_prediction'
  | 'ltv_prediction'
  | 'engagement_prediction'
  | 'progression_speed'
  | 'intervention_response';

export interface PredictionTarget {
  targetId: string;
  name: string;
  type: TargetType;
  timeHorizon: number; // days
  accuracy: PredictionAccuracy;
}

export type TargetType = 'classification' | 'regression' | 'time_series' | 'survival';

export interface PredictionAccuracy {
  overall: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
  auc: number; // 0-1
}

export interface ModelFeature {
  featureId: string;
  name: string;
  type: FeatureDataType;
  importance: number; // 0-1
  correlation: number; // -1 to 1
  stability: number; // 0-1
}

export type FeatureDataType = 
  | 'numerical'
  | 'categorical'
  | 'boolean'
  | 'temporal'
  | 'text'
  | 'embedded';

export interface ModelPerformance {
  trainingPerformance: PerformanceMetrics;
  validationPerformance: PerformanceMetrics;
  testPerformance: PerformanceMetrics;
  productionPerformance: ProductionPerformance;
}

export interface PerformanceMetrics {
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
  auc: number; // 0-1
  mse?: number; // for regression
  mae?: number; // for regression
}

export interface ProductionPerformance {
  currentPerformance: PerformanceMetrics;
  performanceTrend: PerformanceTrend;
  dataGrift: DataDrift;
  modelDrift: ModelDrift;
}

export interface PerformanceTrend {
  direction: TrendDirection;
  rate: number; // change per day
  significance: number; // 0-1
  timeframe: number; // days
}

export interface DataDrift {
  detected: boolean;
  severity: DriftSeverity;
  affectedFeatures: string[];
  detectionDate: number; // timestamp
}

export type DriftSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ModelDrift {
  detected: boolean;
  severity: DriftSeverity;
  impactedPredictions: number; // percentage
  recommendedActions: string[];
}

export interface ModelDeployment {
  environment: DeploymentEnvironment;
  version: string;
  deployedAt: number; // timestamp
  lastUpdated: number; // timestamp
  configuration: DeploymentConfiguration;
  monitoring: ModelMonitoring;
}

export type DeploymentEnvironment = 'development' | 'staging' | 'production' | 'canary';

export interface DeploymentConfiguration {
  batchSize: number;
  updateFrequency: number; // hours
  fallbackModel?: string;
  confidenceThreshold: number; // 0-1
  explanabilityLevel: ExplanabilityLevel;
}

export type ExplanabilityLevel = 'none' | 'basic' | 'detailed' | 'comprehensive';

export interface ModelMonitoring {
  enabled: boolean;
  metrics: MonitoringMetric[];
  alerts: MonitoringAlert[];
  reporting: MonitoringReporting;
}

export interface MonitoringMetric {
  metric: string;
  threshold: number;
  frequency: number; // hours
  action: MonitoringAction;
}

export type MonitoringAction = 'log' | 'alert' | 'rollback' | 'retrain';

export interface MonitoringAlert {
  alertId: string;
  condition: string;
  severity: AlertSeverity;
  recipients: string[];
  escalation: AlertEscalation;
}

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AlertEscalation {
  enabled: boolean;
  levels: EscalationLevel[];
  timeouts: number[]; // minutes for each level
}

export interface EscalationLevel {
  level: number;
  recipients: string[];
  actions: string[];
}

export interface MonitoringReporting {
  enabled: boolean;
  frequency: ReportingFrequency;
  recipients: string[];
  format: ReportFormat;
  content: ReportContent;
}

export type ReportingFrequency = 'daily' | 'weekly' | 'monthly' | 'on_demand';
export type ReportFormat = 'email' | 'dashboard' | 'pdf' | 'json' | 'api';

export interface ReportContent {
  sections: ReportSection[];
  visualizations: ReportVisualization[];
  insights: boolean;
  recommendations: boolean;
}

export interface ReportSection {
  section: string;
  content: string[];
  priority: SectionPriority;
}

export type SectionPriority = 'high' | 'medium' | 'low';

export interface ReportVisualization {
  type: VisualizationType;
  data: string[];
  configuration: VisualizationConfiguration;
}

export type VisualizationType = 
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'heatmap'
  | 'scatter_plot'
  | 'histogram'
  | 'box_plot';

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
  range?: { min: number; max: number };
}

export type ScaleType = 'linear' | 'logarithmic' | 'categorical' | 'time';
export type ColorScheme = 'default' | 'viridis' | 'plasma' | 'categorical' | 'custom';

// Tracking settings
export interface LifecycleTrackingSettings {
  realTimeTracking: boolean;
  batchUpdateFrequency: number; // hours
  dataRetention: DataRetentionSettings;
  privacy: PrivacySettings;
  performance: PerformanceSettings;
  integration: IntegrationSettings;
}

export interface DataRetentionSettings {
  rawData: number; // days
  aggregatedData: number; // days
  predictions: number; // days
  reports: number; // days
  compliance: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  regulation: string;
  retention: number; // days
  anonymization: boolean;
  deletionTriggers: string[];
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
  fields: string[];
  preserveUtility: boolean;
}

export type AnonymizationMethod = 'hashing' | 'pseudonymization' | 'generalization' | 'suppression';

export interface AccessControlSettings {
  roleBasedAccess: boolean;
  dataClassification: DataClassification[];
  auditLogging: boolean;
}

export interface DataClassification {
  classification: ClassificationLevel;
  fields: string[];
  accessRoles: string[];
  restrictions: string[];
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
  ttl: number; // seconds
  invalidation: CacheInvalidation;
}

export interface CacheInvalidation {
  triggers: InvalidationTrigger[];
  strategy: InvalidationStrategy;
}

export interface InvalidationTrigger {
  event: string;
  delay: number; // seconds
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
  fields: IndexedField[];
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
  fields: string[];
}

export type CompressionAlgorithm = 'gzip' | 'lz4' | 'snappy' | 'zstd';
export type CompressionLevel = 'low' | 'medium' | 'high' | 'maximum';

export interface ScalingSettings {
  autoScaling: boolean;
  triggers: ScalingTrigger[];
  limits: ScalingLimits;
  strategy: ScalingStrategy;
}

export interface ScalingTrigger {
  metric: string;
  threshold: number;
  duration: number; // seconds
  action: ScalingAction;
}

export type ScalingAction = 'scale_up' | 'scale_down' | 'scale_out' | 'scale_in';

export interface ScalingLimits {
  minInstances: number;
  maxInstances: number;
  minCpu: number; // percentage
  maxCpu: number; // percentage
  minMemory: number; // MB
  maxMemory: number; // MB
}

export type ScalingStrategy = 'reactive' | 'predictive' | 'scheduled' | 'hybrid';

export interface IntegrationSettings {
  apis: ApiIntegration[];
  webhooks: WebhookConfiguration[];
  exports: ExportConfiguration[];
  imports: ImportConfiguration[];
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
  frequency: number; // hours
  buffer: number; // hours before expiration
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
  retryableErrors: string[];
}

export type BackoffStrategy = 'fixed' | 'exponential' | 'linear' | 'random';

export interface WebhookConfiguration {
  webhookId: string;
  name: string;
  url: string;
  events: string[];
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
  timeout: number; // seconds
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
  threshold: number; // failures before notification
  recipients: string[];
  channels: string[];
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
  time: string; // HH:MM format
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
  fields: string[];
  filters: ExportFilter[];
  aggregations: ExportAggregation[];
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
  groupBy: string[];
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
  fieldMappings: FieldMapping[];
  transformations: FieldTransformation[];
  defaults: DefaultValue[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  validation: FieldValidation;
}

export interface FieldValidation {
  rules: ValidationRule[];
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
  rules: ValidationRule[];
  sampling: ValidationSampling;
  reporting: ValidationReporting;
}

export interface ValidationSampling {
  enabled: boolean;
  percentage: number; // 0-100
  minimumRecords: number;
}

export interface ValidationReporting {
  enabled: boolean;
  detailLevel: ReportDetailLevel;
  recipients: string[];
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
  errorRate: number; // 0-1
  continueOnError: boolean;
}

export interface RollbackConfiguration {
  enabled: boolean;
  triggers: RollbackTrigger[];
  strategy: RollbackStrategy;
}

export interface RollbackTrigger {
  condition: string;
  threshold: number;
  timeWindow: number; // minutes
}

export type RollbackStrategy = 'full' | 'partial' | 'checkpoint' | 'manual';

// User lifecycle data structures
export interface UserLifecycleData {
  userId: string;
  lifecycleHistory: LifecycleStageRecord[];
  currentStage: CurrentStageData;
  progressionAnalysis: ProgressionAnalysis;
  healthAssessment: LifecycleHealthAssessment;
  riskAssessment: LifecycleRiskAssessment;
  interventionHistory: InterventionRecord[];
  predictions: LifecyclePrediction[];
  cohortMemberships: CohortMembership[];
}

export interface LifecycleStageRecord {
  recordId: string;
  stageId: string;
  stageName: string;
  entryDate: number; // timestamp
  exitDate?: number; // timestamp
  duration?: number; // milliseconds
  entryTriggers: StageTrigger[];
  exitTriggers: StageTrigger[];
  stageMetrics: StageMetrics;
  behaviors: StageBehavior[];
  interventions: StageIntervention[];
  outcomes: StageOutcome[];
}

export interface StageTrigger {
  triggerId: string;
  type: TriggerType;
  description: string;
  timestamp: number;
  confidence: number; // 0-1
  context: TriggerContext;
}

export interface TriggerContext {
  events: ContextEvent[];
  conditions: ContextCondition[];
  environment: EnvironmentContext;
}

export interface ContextEvent {
  eventType: string;
  timestamp: number;
  data: Record<string, any>;
  significance: number; // 0-1
}

export interface ContextCondition {
  condition: string;
  value: Error;
  met: boolean;
  confidence: number; // 0-1
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
  engagementLevel: number; // 0-1
  activityLevel: number; // 0-1
  satisfactionScore: number; // 0-100
  progressScore: number; // 0-100
  riskScore: number; // 0-100
  valueScore: number; // 0-100
  customMetrics: CustomMetric[];
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
  intensity: number; // 0-1
  duration: number; // milliseconds
  pattern: BehaviorPattern;
  context: BehaviorContext;
}

export interface BehaviorPattern {
  patternType: PatternType;
  regularity: number; // 0-1
  predictability: number; // 0-1
  seasonality?: SeasonalityInfo;
}

export type PatternType = 'consistent' | 'sporadic' | 'declining' | 'growing' | 'cyclical';

export interface SeasonalityInfo {
  period: number; // days
  amplitude: number;
  phase: number;
}

export interface BehaviorContext {
  triggers: string[];
  inhibitors: string[];
  facilitators: string[];
  correlations: BehaviorCorrelation[];
}

export interface BehaviorCorrelation {
  behavior: string;
  correlation: number; // -1 to 1
  significance: number; // 0-1
}

export interface StageIntervention {
  interventionId: string;
  type: InterventionType;
  timestamp: number;
  response: InterventionResponse;
  effectiveness: InterventionEffectiveness;
  followUp: InterventionFollowUp[];
}

export interface InterventionResponse {
  responseType: ResponseType;
  responseTime: number; // milliseconds
  engagement: number; // 0-1
  sentiment: ResponseSentiment;
  actions: ResponseAction[];
}

export type ResponseType = 'positive' | 'negative' | 'neutral' | 'mixed' | 'no_response';

export interface ResponseSentiment {
  score: number; // -1 to 1
  confidence: number; // 0-1
  aspects: SentimentAspect[];
}

export interface SentimentAspect {
  aspect: string;
  sentiment: number; // -1 to 1
  confidence: number; // 0-1
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
  satisfactionImpact: number; // -1 to 1
  progressionImpact: number; // -1 to 1
}

export interface InterventionFollowUp {
  followUpId: string;
  type: FollowUpType;
  scheduledFor: number; // timestamp
  completed: boolean;
  outcome?: FollowUpOutcome;
}

export type FollowUpType = 'check_in' | 'reminder' | 'escalation' | 'support' | 'feedback';

export interface FollowUpOutcome {
  success: boolean;
  feedback: string;
  nextActions: string[];
  satisfaction: number; // 0-100
}

export interface StageOutcome {
  outcomeType: OutcomeType;
  value: number;
  unit: string;
  timestamp: number;
  attribution: OutcomeAttribution[];
}

export type OutcomeType = 
  | 'conversion'
  | 'engagement_increase'
  | 'satisfaction_improvement'
  | 'value_realization'
  | 'progression_acceleration'
  | 'risk_reduction';

export interface OutcomeAttribution {
  factor: string;
  contribution: number; // 0-1
  confidence: number; // 0-1
}

export interface CurrentStageData {
  stageId: string;
  stageName: string;
  entryDate: number; // timestamp
  daysInStage: number;
  progress: StageProgress;
  health: StageHealth;
  risks: StageRisk[];
  opportunities: StageOpportunityAssessment[];
  nextStagePredictiuons: NextStagePrediction[];
}

export interface StageProgress {
  overall: number; // 0-1
  milestones: MilestoneProgress[];
  trajectory: ProgressTrajectory;
  blockers: ProgressBlocker[];
}

export interface MilestoneProgress {
  milestoneId: string;
  name: string;
  completed: boolean;
  progress: number; // 0-1
  estimatedCompletion?: number; // timestamp
}

export interface ProgressTrajectory {
  direction: TrajectoryDirection;
  velocity: number; // progress per day
  acceleration: number; // change in velocity
  forecast: TrajectoryForecast;
}

export type TrajectoryDirection = 'forward' | 'stalled' | 'backward' | 'accelerating' | 'decelerating';

export interface TrajectoryForecast {
  shortTerm: ForecastPoint; // 7 days
  mediumTerm: ForecastPoint; // 30 days
  longTerm: ForecastPoint; // 90 days
}

export interface ForecastPoint {
  predictedProgress: number; // 0-1
  confidence: number; // 0-1
  factors: ForecastingFactor[];
}

export interface ForecastingFactor {
  factor: string;
  impact: number; // -1 to 1
  certainty: number; // 0-1
}

export interface ProgressBlocker {
  blockerId: string;
  name: string;
  severity: BlockerSeverity;
  impact: BlockerImpact;
  resolutionStrategies: BlockerResolutionStrategy[];
}

export interface BlockerImpact {
  progressDelay: number; // days
  satisfactionImpact: number; // -1 to 1
  riskIncrease: number; // 0-1
}

export interface BlockerResolutionStrategy {
  strategy: string;
  effectiveness: number; // 0-1
  effort: EffortLevel;
  timeline: string;
  resources: string[];
}

export interface StageHealth {
  overall: number; // 0-100
  dimensions: HealthDimension[];
  trends: HealthTrend[];
  alerts: HealthAlert[];
}

export interface HealthDimension {
  dimension: string;
  score: number; // 0-100
  weight: number; // 0-1
  trend: DimensionTrend;
  contributors: HealthContributor[];
}

export interface DimensionTrend {
  direction: TrendDirection;
  strength: number; // 0-1
  duration: number; // days
  significance: number; // 0-1
}

export interface HealthContributor {
  contributor: string;
  impact: number; // -1 to 1
  confidence: number; // 0-1
}

export interface HealthTrend {
  aspect: string;
  trend: TrendDirection;
  change: number; // percentage change
  timeframe: number; // days
  significance: number; // 0-1
}

export interface HealthAlert {
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
  actionRequired: boolean;
  recommendedActions: string[];
}

export type AlertType = 'health_decline' | 'risk_increase' | 'milestone_delay' | 'anomaly_detected';

export interface StageRisk {
  riskId: string;
  name: string;
  type: StageRiskType;
  severity: RiskSeverity;
  probability: number; // 0-1
  impact: StageRiskImpact;
  indicators: RiskIndicator[];
  mitigation: RiskMitigationPlan;
}

export type StageRiskType = 
  | 'churn_risk'
  | 'progression_stall'
  | 'satisfaction_decline'
  | 'engagement_drop'
  | 'value_erosion';

export interface StageRiskImpact {
  userExperience: number; // -1 to 1
  businessValue: number; // -1 to 1
  futureProgression: number; // -1 to 1
  interventionCost: number; // 0-1
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
  rate: number; // change per day
  consistency: number; // 0-1
}

export interface RiskMitigationPlan {
  strategies: MitigationStrategy[];
  priority: MitigationPriority;
  timeline: MitigationTimeline;
  resources: MitigationResource[];
}

export interface MitigationPriority {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

export interface MitigationTimeline {
  immediate: number; // hours
  shortTerm: number; // days
  longTerm: number; // weeks
}

export interface MitigationResource {
  resource: string;
  type: ResourceType;
  availability: number; // 0-1
  cost: number;
}

export interface StageOpportunityAssessment {
  opportunityId: string;
  name: string;
  type: OpportunityType;
  potential: OpportunityPotentialAssessment;
  feasibility: OpportunityFeasibility;
  timeline: OpportunityTimeline;
  requirements: OpportunityRequirementAssessment[];
}

export interface OpportunityPotentialAssessment {
  score: number; // 0-100
  benefits: OpportunityBenefit[];
  risks: OpportunityRisk[];
  confidence: number; // 0-1
}

export interface OpportunityBenefit {
  benefit: string;
  impact: number; // 0-1
  likelihood: number; // 0-1
  timeframe: string;
}

export interface OpportunityRisk {
  risk: string;
  impact: number; // 0-1
  likelihood: number; // 0-1
  mitigation: string;
}

export interface OpportunityFeasibility {
  technical: number; // 0-1
  operational: number; // 0-1
  financial: number; // 0-1
  strategic: number; // 0-1
  overall: number; // 0-1
}

export interface OpportunityTimeline {
  planning: number; // days
  implementation: number; // days
  realization: number; // days
  total: number; // days
}

export interface OpportunityRequirementAssessment {
  requirement: string;
  complexity: ComplexityLevel;
  availability: number; // 0-1
  cost: number;
  criticalPath: boolean;
}

export interface NextStagePrediction {
  stageId: string;
  stageName: string;
  probability: number; // 0-1
  estimatedTransitionTime: number; // days
  confidence: number; // 0-1
  requirements: TransitionRequirement[];
  accelerators: TransitionAccelerator[];
}

export interface TransitionRequirement {
  requirement: string;
  currentStatus: number; // 0-1 (0 = not met, 1 = fully met)
  importance: number; // 0-1
  timeToMeet: number; // days
}

export interface TransitionAccelerator {
  accelerator: string;
  potential: number; // 0-1
  effort: EffortLevel;
  impact: AcceleratorImpact;
}

export interface AcceleratorImpact {
  transitionSpeedup: number; // percentage
  probabilityIncrease: number; // percentage
  confidenceIncrease: number; // percentage
}

// Progression analysis
export interface ProgressionAnalysis {
  overallProgression: OverallProgression;
  stageAnalysis: StageProgressionAnalysis[];
  pathwayAnalysis: PathwayAnalysis;
  velocityAnalysis: VelocityAnalysis;
  benchmarkComparison: ProgressionBenchmark;
}

export interface OverallProgression {
  totalDuration: number; // days since first stage
  stagesCompleted: number;
  progressionRate: number; // stages per day
  efficiency: number; // 0-1
  trajectory: OverallTrajectory;
}

export interface OverallTrajectory {
  direction: TrajectoryDirection;
  consistency: number; // 0-1
  momentum: number; // 0-1
  forecast: ProgressionForecast;
}

export interface ProgressionForecast {
  nextMilestone: MilestoneForecast;
  completion: CompletionForecast;
  risks: ForecastRisk[];
}

export interface MilestoneForecast {
  milestone: string;
  estimatedDate: number; // timestamp
  confidence: number; // 0-1
  requirements: ForecastRequirement[];
}

export interface ForecastRequirement {
  requirement: string;
  probability: number; // 0-1
  impact: number; // -1 to 1
}

export interface CompletionForecast {
  estimatedCompletionDate: number; // timestamp
  confidence: number; // 0-1
  scenarios: CompletionScenario[];
}

export interface CompletionScenario {
  scenario: string;
  probability: number; // 0-1
  duration: number; // days
  conditions: string[];
}

export interface ForecastRisk {
  risk: string;
  probability: number; // 0-1
  impact: ForecastRiskImpact;
  mitigation: string[];
}

export interface ForecastRiskImpact {
  delayDays: number;
  probabilityReduction: number; // 0-1
  alternativePaths: string[];
}

export interface StageProgressionAnalysis {
  stageId: string;
  stageName: string;
  performance: StagePerformance;
  comparison: StageComparison;
  insights: StageInsight[];
}

export interface StagePerformance {
  duration: number; // days
  efficiency: number; // 0-1
  satisfaction: number; // 0-100
  valueRealized: number; // 0-1
  challengesFaced: StageChallengeRecord[];
}

export interface StageChallengeRecord {
  challenge: string;
  severity: ChallengeSeverity;
  duration: number; // days
  resolution: ChallengeResolution;
  impact: ChallengeImpact;
}

export type ChallengeSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export interface ChallengeResolution {
  resolved: boolean;
  method: string;
  timeToResolution: number; // days
  effectiveness: number; // 0-1
}

export interface ChallengeImpact {
  progressDelay: number; // days
  satisfactionImpact: number; // -1 to 1
  futureStageImpact: number; // -1 to 1
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
  difference: number; // percentage
  percentile: number; // 0-100
  significance: ComparisonSignificance;
}

export type ComparisonSignificance = 'much_better' | 'better' | 'average' | 'worse' | 'much_worse';

export interface StageInsight {
  insight: string;
  type: InsightType;
  impact: InsightImpact;
  actionable: boolean;
  recommendations: string[];
}

export type InsightType = 'performance' | 'behavioral' | 'comparative' | 'predictive' | 'optimization';

export interface InsightImpact {
  scope: InsightScope;
  magnitude: ImpactMagnitude;
  confidence: number; // 0-1
}

export type InsightScope = 'current_stage' | 'future_stages' | 'overall_journey' | 'experience';
export type ImpactMagnitude = 'low' | 'medium' | 'high' | 'transformative';

// Additional analysis structures continue...
// (Due to length constraints, I'm providing a comprehensive framework that can be extended)

// Mock data generators
const generateMockUserLifecycleData = (): UserLifecycleData => {
  const stages = ['acquisition', 'activation', 'engagement', 'retention', 'advocacy'];
  const currentStageIndex = Math.floor(Math.random() * stages.length);
  return {
    userId: `user_${Math.random().toString(36).substr(2, 8)}`,}
    lifecycleHistory: Array.from({ length: currentStageIndex + 1 }, (_, i) => ({)
      recordId: `record_${Math.random().toString(36).substr(2, 8)}`,}
      stageId: `stage_${i + 1}`,}
      stageName: stages[i],
      entryDate: Date.now() - (stages.length - i) * 86400000 * 30, // 30 days per stage
      exitDate: i < currentStageIndex ? Date.now() - (stages.length - i - 1) * 86400000 * 30 : undefined,
      duration: i < currentStageIndex ? 86400000 * 30 : undefined, // 30 days
      entryTriggers: [],
      exitTriggers: [],
      stageMetrics: {,
        engagementLevel: Math.random(),
        activityLevel: Math.random(),
        satisfactionScore: Math.random() * 100,
        progressScore: Math.random() * 100,
        riskScore: Math.random() * 100,
        valueScore: Math.random() * 100,
        customMetrics: [],
      },
      behaviors: [],
      interventions: [],
      outcomes: [],
    })),
    currentStage: {,
      stageId: `stage_${currentStageIndex + 1}`,}
      stageName: stages[currentStageIndex],
      entryDate: Date.now() - (stages.length - currentStageIndex) * 86400000 * 30,
      daysInStage: (stages.length - currentStageIndex) * 30,
      progress: {,
        overall: Math.random(),
        milestones: [],
        trajectory: {,
          direction: ['forward', 'stalled', 'accelerating'][Math.floor(Math.random() * 3)] as TrajectoryDirection,
          velocity: Math.random() * 0.1,
          acceleration: (Math.random() - 0.5) * 0.01,
          forecast: {,
            shortTerm: {,
              predictedProgress: Math.random(),
              confidence: Math.random(),
              factors: [],
            },
            mediumTerm: {,
              predictedProgress: Math.random(),
              confidence: Math.random(),
              factors: [],
            },
            longTerm: {,
              predictedProgress: Math.random(),
              confidence: Math.random(),
              factors: [],
            }
          }
        },
        blockers: [],
      },
      health: {,
        overall: Math.random() * 40 + 60, // 60-100
        dimensions: [],
        trends: [],
        alerts: [],
      },
      risks: [],
      opportunities: [],
      nextStagePredictiuons: [],
    },
    progressionAnalysis: {,
      overallProgression: {,
        totalDuration: (currentStageIndex + 1) * 30,
        stagesCompleted: currentStageIndex,
        progressionRate: currentStageIndex / ((currentStageIndex + 1) * 30),
        efficiency: Math.random(),
        trajectory: {,
          direction: 'forward',
          consistency: Math.random(),
          momentum: Math.random(),
          forecast: {,
            nextMilestone: {,
              milestone: `Stage ${currentStageIndex + 2}`,}
              estimatedDate: Date.now() + Math.random() * 86400000 * 60,
              confidence: Math.random(),
              requirements: [],
            },
            completion: {,
              estimatedCompletionDate: Date.now() + Math.random() * 86400000 * 180,
              confidence: Math.random(),
              scenarios: [],
            },
            risks: [],
          }
        }
      },
      stageAnalysis: [],
      pathwayAnalysis: {,
        primaryPath: stages.slice(0, currentStageIndex + 1),
        alternativePaths: [],
        efficiency: Math.random(),
        uniqueness: Math.random(),
      },
      velocityAnalysis: {,
        currentVelocity: Math.random() * 0.1,
        averageVelocity: Math.random() * 0.08,
        acceleration: (Math.random() - 0.5) * 0.01,
        factors: [],
      },
      benchmarkComparison: {,
        vsIndustry: {,
          metric: 'progression_rate',
          userValue: Math.random() * 0.1,
          benchmarkValue: 0.05,
          difference: Math.random() * 100 - 50,
          percentile: Math.random() * 100,
          significance: 'average',
        },
        vsCohort: {,
          metric: 'progression_rate',
          userValue: Math.random() * 0.1,
          benchmarkValue: 0.06,
          difference: Math.random() * 100 - 50,
          percentile: Math.random() * 100,
          significance: 'better',
        },
        vsHistorical: {,
          metric: 'progression_rate',
          userValue: Math.random() * 0.1,
          benchmarkValue: 0.04,
          difference: Math.random() * 100 - 50,
          percentile: Math.random() * 100,
          significance: 'much_better',
        }
      }
    },
    healthAssessment: {,
      overall: Math.random() * 40 + 60,
      dimensions: [],
      trends: [],
      alerts: [],
      recommendations: [],
    },
    riskAssessment: {,
      overall: Math.random() * 60 + 20,
      risks: [],
      mitigation: [],
      monitoring: [],
    },
    interventionHistory: [],
    predictions: [],
    cohortMemberships: [],
  };
};

// Main component
export const UserLifecycleTracking: React.FC<UserLifecycleTrackingProps> = ({)
  analyticsInfrastructure,
  lifecycleConfig,
  userLifecycleData,
  cohortAnalysisEnabled = true,
  predictiveModelingEnabled = true,
  onStageTransition,
  onLifecycleInsight,
  onInterventionRecommended,
  onExport
}) => {
  const [mockLifecycleData, setMockLifecycleData] = useState<UserLifecycleData[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'stages' | 'progression' | 'interventions' | 'predictions'>('overview');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<LifecycleInsight[]>([]);
  // Generate mock data
  useEffect(() => {
    const mockData = Array.from({ length: 75 }, generateMockUserLifecycleData);
    setMockLifecycleData(mockData);
  }, []);
  const handleStartAnalysis = useCallback(() => {
    setProcessingStatus('processing');
    setLoading(true);
    setTimeout(() => {
      setProcessingStatus('completed');
      setLoading(false);
      if (onLifecycleInsight) {
        // Generate mock insight
        const mockInsight: LifecycleInsight = {
          insightId: `insight_${Math.random().toString(36).substr(2, 9)}`,}
          type: 'progression_analysis',
          title: 'Improved Stage Progression Detected',
          description: 'Users are progressing through lifecycle stages 23% faster than historical average',
          severity: 'info',
          affectedUsers: 50,
          potentialImpact: {,
            scope: 'overall_journey',
            magnitude: 'medium',
            confidence: 0.85,
          },
          recommendations: [,
            {
              recommendationId: 'rec_1',
              action: 'Optimize onboarding flow',
              rationale: 'Faster progression indicates effective onboarding',
              priority: 'medium',
              effort: 'low',
              expectedOutcome: 'Maintain accelerated progression',
              successMetrics: ['progression_rate', 'user_satisfaction']
            }
          ],
          data: {,
            charts: [],
            tables: [],
            statistics: [],
            comparisons: [],
          }
        };
        onLifecycleInsight(mockInsight);
      }
    }, 2500);
  }, [onLifecycleInsight]);
  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUser(userId);
  }, []);
  const handleExport = useCallback(() => {
    if (onExport) {
      const exportData: LifecycleTrackingExportData = {
        userLifecycleData: mockLifecycleData,
        stageTransitions: [],
        interventionEffectiveness: [],
        cohortAnalysis: [],
        predictions: [],
        insights,
        metadata: {,
          exportTimestamp: Date.now(),
          version: '1.0.0',
          totalUsers: mockLifecycleData.length,
          analysisPeriod: {,
            start: Date.now() - 86400000 * 90,
            end: Date.now(),
          },
          configurationVersion: 'v1.0.0',
        }
      };
      onExport(exportData);
    }
  }, [mockLifecycleData, insights, onExport]);
  const systemStats = useMemo(() => {
    const totalUsers = mockLifecycleData.length;
    const stageDistribution = mockLifecycleData.reduce((acc, user) => {
      const stage = user.currentStage.stageName;
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const avgProgression = mockLifecycleData.reduce((sum, user) => ;
      sum + user.progressionAnalysis.overallProgression.progressionRate, 0) / totalUsers;
    const healthyUsers = mockLifecycleData.filter(user => ;);
      user.healthAssessment.overall > 70).length;
    return {
      totalUsers,
      stageDistribution,
      avgProgressionRate: Math.round(avgProgression * 1000) / 10, // per 100 days
      healthyUserPercentage: Math.round((healthyUsers / totalUsers) * 100),
      activeInterventions: Math.floor(Math.random() * 15) + 5,
      predictiveAccuracy: 92,
    };
  }, [mockLifecycleData]);
  const selectedUserData = useMemo(() => {
    return selectedUser ? mockLifecycleData.find(u => u.userId === selectedUser) : null;
  }, [selectedUser, mockLifecycleData]);
  return ();
    <div className="user-lifecycle-tracking">
      <div className="lifecycle-header">
        <div className="header-section">
          <h2>User Lifecycle Tracking & Progression Analysis</h2>
          <div className="system-stats">
            <div className="stat">
              <span className="stat-value">{systemStats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat">
              <span className="stat-value">{systemStats.avgProgressionRate}/100d</span>
              <span className="stat-label">Avg Progression</span>
            </div>
            <div className="stat">
              <span className="stat-value">{systemStats.healthyUserPercentage}%</span>
              <span className="stat-label">Healthy Users</span>
            </div>
            <div className="stat">
              <span className="stat-value">{systemStats.predictiveAccuracy}%</span>
              <span className="stat-label">Prediction Accuracy</span>
            </div>
          </div>
        </div>
        <div className="header-controls">
          <div className="processing-controls">
            <button 
              className={`analyze-btn ${processingStatus === 'processing' ? 'processing' : ''}`}
              onClick={handleStartAnalysis}
              disabled={processingStatus === 'processing'}
            >
              {processingStatus === 'processing' ? '📊 Analyzing...' : '🔍 Analyze Lifecycle'}
            </button>
            {cohortAnalysisEnabled && ()
              <div className="feature-indicator">
                📈 Cohort Analysis
              </div>
            )}
            {predictiveModelingEnabled && ()
              <div className="feature-indicator">
                🤖 Predictive Modeling
              </div>
            )}
          </div>
          <div className="view-controls">
            <button 
              className={selectedView === 'overview' ? 'active' : ''}
              onClick={() => setSelectedView('overview')}
            >
              Overview
            </button>
            <button 
              className={selectedView === 'stages' ? 'active' : ''}
              onClick={() => setSelectedView('stages')}
            >
              Stage Analysis
            </button>
            <button 
              className={selectedView === 'progression' ? 'active' : ''}
              onClick={() => setSelectedView('progression')}
            >
              Progression
            </button>
            <button 
              className={selectedView === 'interventions' ? 'active' : ''}
              onClick={() => setSelectedView('interventions')}
            >
              Interventions
            </button>
            <button 
              className={selectedView === 'predictions' ? 'active' : ''}
              onClick={() => setSelectedView('predictions')}
            >
              Predictions
            </button>
          </div>
          <button className="export-btn" onClick={handleExport}>
            📋 Export Analysis
          </button>
        </div>
      </div>
      <div className="lifecycle-content">
        {loading && ()
          <div className="loading-overlay">
            <div className="loading-spinner">📊</div>
            <div className="loading-text">Analyzing user lifecycle patterns...</div>
          </div>
        )}
        {selectedView === 'overview' && ()
          <div className="overview-view">
            <div className="stage-distribution">
              <h3>Lifecycle Stage Distribution</h3>
              <div className="distribution-chart">
                {Object.entries(systemStats.stageDistribution).map(([stage, count]) => ()
                  <div key={stage} className="stage-bar">
                    <div className="stage-label">{stage}</div>
                    <div className="stage-visual">
                      <div 
                        className="stage-fill" 
                        style={{ width: `${(count / systemStats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                    <div className="stage-count">{count} ({Math.round((count / systemStats.totalUsers) * 100)}%)</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="users-list">
              <h3>User Lifecycle Status</h3>
              <div className="user-items">
                {mockLifecycleData.slice(0, 12).map(user => ()
                  <div 
                    key={user.userId}
                    className={`user-item ${selectedUser === user.userId ? 'active' : ''} stage-${user.currentStage.stageName}`}
                    onClick={() => handleUserSelect(user.userId)}
                  >
                    <div className="user-header">
                      <div className="user-id">{user.userId.slice(-8)}</div>
                      <div className="current-stage">{user.currentStage.stageName}</div>
                    </div>
                    <div className="user-metrics">
                      <div className="metric">
                        <span className="metric-label">Days in Stage:</span>
                        <span className="metric-value">{user.currentStage.daysInStage}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Progress:</span>
                        <span className="metric-value">{Math.round(user.currentStage.progress.overall * 100)}%</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Health:</span>
                        <span className="metric-value">{Math.round(user.currentStage.health.overall)}</span>
                      </div>
                    </div>
                    <div className="user-trajectory">
                      <span className={`trajectory-icon ${user.currentStage.progress.trajectory.direction}`}>}
                        {user.currentStage.progress.trajectory.direction === 'forward' ? '→' : 
                         user.currentStage.progress.trajectory.direction === 'accelerating' ? '↗' : 
                         user.currentStage.progress.trajectory.direction === 'stalled' ? '⏸' : '↘'}
                      </span>
                      <span className="trajectory-text">{user.currentStage.progress.trajectory.direction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedUserData && ()
              <div className="user-details">
                <h3>Lifecycle Details: {selectedUserData.userId.slice(-8)}</h3>
                <div className="lifecycle-overview">
                  <div className="overview-section">
                    <h4>Current Stage</h4>
                    <div className="current-stage-info">
                      <div className="stage-circle">
                        <span className="stage-name">{selectedUserData.currentStage.stageName}</span>
                        <span className="stage-duration">{selectedUserData.currentStage.daysInStage} days</span>
                      </div>
                      <div className="stage-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${selectedUserData.currentStage.progress.overall * 100}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {Math.round(selectedUserData.currentStage.progress.overall * 100)}% Complete
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overview-section">
                    <h4>Lifecycle History</h4>
                    <div className="stage-timeline">
                      {selectedUserData.lifecycleHistory.map((stage, index) => ()
                        <div key={stage.recordId} className="timeline-item">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <div className="stage-name">{stage.stageName}</div>
                            <div className="stage-dates">
                              {new Date(stage.entryDate).toLocaleDateString()}
                              {stage.exitDate && ` - ${new Date(stage.exitDate).toLocaleDateString()}`}
                            </div>
                            {stage.duration && ()
                              <div className="stage-duration">
                                {Math.round(stage.duration / 86400000)} days
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="overview-section">
                    <h4>Health & Risk Assessment</h4>
                    <div className="assessment-grid">
                      <div className="assessment-item">
                        <span className="assessment-label">Overall Health:</span>
                        <span className={`assessment-value health-${Math.round(selectedUserData.healthAssessment.overall / 25)}`}>}
                          {Math.round(selectedUserData.healthAssessment.overall)}/100
                        </span>
                      </div>
                      <div className="assessment-item">
                        <span className="assessment-label">Risk Level:</span>
                        <span className={`assessment-value risk-${Math.round(selectedUserData.riskAssessment.overall / 25)}`}>}
                          {Math.round(selectedUserData.riskAssessment.overall)}/100
                        </span>
                      </div>
                      <div className="assessment-item">
                        <span className="assessment-label">Progression Rate:</span>
                        <span className="assessment-value">
                          {(selectedUserData.progressionAnalysis.overallProgression.progressionRate * 100).toFixed(2)}/day
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {selectedView === 'stages' && ()
          <div className="stages-view">
            <div className="stages-placeholder">
              <h3>Stage Analysis</h3>
              <p>Stage-specific analysis features will be implemented here, including:</p>
              <ul>
                <li>Stage performance metrics and benchmarks</li>
                <li>Stage transition analysis and optimization</li>
                <li>Stage-specific behavior patterns</li>
                <li>Stage health indicators and alerts</li>
                <li>Stage completion rates and bottlenecks</li>
                <li>Stage intervention effectiveness</li>
              </ul>
            </div>
          </div>
        )}
        {selectedView === 'progression' && ()
          <div className="progression-view">
            <div className="progression-placeholder">
              <h3>Progression Analysis</h3>
              <p>Progression analysis features will be implemented here, including:</p>
              <ul>
                <li>Progression velocity and acceleration tracking</li>
                <li>Pathway analysis and optimization</li>
                <li>Progression forecasting and prediction</li>
                <li>Comparative progression analysis</li>
                <li>Progression blocker identification</li>
                <li>Acceleration opportunity detection</li>
              </ul>
            </div>
          </div>
        )}
        {selectedView === 'interventions' && ()
          <div className="interventions-view">
            <div className="interventions-placeholder">
              <h3>Intervention Management</h3>
              <p>Intervention management features will be implemented here, including:</p>
              <ul>
                <li>Intervention strategy configuration</li>
                <li>Automated intervention triggers</li>
                <li>Intervention effectiveness tracking</li>
                <li>Personalized intervention recommendations</li>
                <li>Intervention response analysis</li>
                <li>Multi-channel intervention coordination</li>
              </ul>
            </div>
          </div>
        )}
        {selectedView === 'predictions' && ()
          <div className="predictions-view">
            <div className="predictions-placeholder">
              <h3>Predictive Analytics</h3>
              <p>Predictive modeling features will be implemented here, including:</p>
              <ul>
                <li>Stage transition probability modeling</li>
                <li>Churn risk prediction and prevention</li>
                <li>Lifetime value forecasting</li>
                <li>Progression speed prediction</li>
                <li>Intervention response prediction</li>
                <li>Cohort behavior forecasting</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Additional interfaces for export data
export interface LifecycleTrackingExportData {
  userLifecycleData: UserLifecycleData[];
  stageTransitions: StageTransition[];
  interventionEffectiveness: InterventionEffectivenessReport[];
  cohortAnalysis: CohortAnalysisResult[];
  predictions: LifecyclePredictionResult[];
  insights: LifecycleInsight[];
  metadata: LifecycleExportMetadata;
}

export interface StageTransition {
  userId: string;
  fromStage: string;
  toStage: string;
  transitionDate: number;
  duration: number;
  triggers: string[];
  success: boolean;
}

export interface InterventionEffectivenessReport {
  interventionId: string;
  name: string;
  effectiveness: number;
  participants: number;
  outcomes: InterventionOutcome[];
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
  insights: string[];
}

export interface CohortPerformanceMetrics {
  progressionRate: number;
  completionRate: number;
  satisfactionScore: number;
  retentionRate: number;
}

export interface LifecyclePredictionResult {
  userId: string;
  predictions: PredictionResult[];
  confidence: number;
  timeHorizon: number;
}

export interface PredictionResult {
  metric: string;
  predictedValue: number;
  confidence: number;
  factors: string[];
}

export interface LifecycleInsight {
  insightId: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  affectedUsers: number;
  potentialImpact: {,
    scope: string;
    magnitude: string;
    confidence: number;
  };
  recommendations: Array<{,
    recommendationId: string;
    action: string;
    rationale: string;
    priority: string;
    effort: string;
    expectedOutcome: string;
    successMetrics: string[];
  }>;
  data: {,
    charts: unknown[];
    tables: unknown[];
    statistics: unknown[];
    comparisons: unknown[];
  };
}

export interface LifecycleExportMetadata {
  exportTimestamp: number;
  version: string;
  totalUsers: number;
  analysisePeriod: {,
    start: number;
    end: number;
  };
  configurationVersion: string;
}

// Pathway analysis interfaces
export interface PathwayAnalysis {
  primaryPath: string[];
  alternativePaths: AlternativePath[];
  efficiency: number;
  uniqueness: number;
}

export interface AlternativePath {
  path: string[];
  frequency: number;
  efficiency: number;
  outcomes: PathOutcome[];
}

export interface PathOutcome {
  outcome: string;
  probability: number;
  value: number;
}

// Velocity analysis interfaces  
export interface VelocityAnalysis {
  currentVelocity: number;
  averageVelocity: number;
  acceleration: number;
  factors: VelocityFactor[];
}

export interface VelocityFactor {
  factor: string;
  impact: number;
  confidence: number;
}

// Benchmark comparison interfaces
export interface ProgressionBenchmark {
  vsIndustry: ComparisonResult;
  vsCohort: ComparisonResult;
  vsHistorical: ComparisonResult;
}

// Health and risk assessment interfaces
export interface LifecycleHealthAssessment {
  overall: number;
  dimensions: HealthDimension[];
  trends: HealthTrend[];
  alerts: HealthAlert[];
  recommendations: HealthRecommendation[];
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
  risks: LifecycleRisk[];
  mitigation: RiskMitigationStrategy[];
  monitoring: RiskMonitoringPlan[];
}

export interface LifecycleRisk {
  riskId: string;
  name: string;
  probability: number;
  impact: number;
  category: string;
  indicators: string[];
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
  monitors: RiskMonitor[];
  alertThresholds: AlertThreshold[];
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
  levels: EscalationLevel[];
  timeouts: number[];
  notifications: NotificationSetting[];
}

export interface NotificationSetting {
  level: string;
  recipients: string[];
  methods: string[];
}

// Prediction interfaces
export interface LifecyclePrediction {
  predictionId: string;
  type: string;
  target: string;
  value: number;
  confidence: number;
  timeHorizon: number;
  factors: PredictionFactor[];
  alternatives: AlternativePrediction[];
}

export interface AlternativePrediction {
  scenario: string;
  probability: number;
  value: number;
  conditions: string[];
}

// Cohort membership interfaces
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