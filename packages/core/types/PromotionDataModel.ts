/**
 * Promotion Data Model - Epic 17.5
 * 
 * Comprehensive data model for marketplace template promotion system,
 * enabling featured content management, campaign orchestration, and 
 * performance-driven content placement with advanced targeting capabilities.
 * 
 * Task: E17-1753114397315-003606 - Create promotion data model
 * Epic: 17 - Backstage Admin Controls
 */
import { 
  PlacementSlot, 
  ContentPlacement, 
  PlacementTargetingRules,
  PlacementStyling,
  ContentType,
  PlacementStatus,
  MetricsPeriod
} from './PlacementTypes';

// ==========================================
// CORE PROMOTION ENTITIES
// ==========================================

export interface PromotionCampaign {
  campaignId: string;
  name: string;
  displayName: string;
  description: string;
  // Campaign Strategy
  promotionType: PromotionType;
  promotionStrategy: PromotionStrategy;
  contentSelectionMethod: ContentSelectionMethod;
  // Target Content
  promotedContent: PromotionContent[];
  contentCriteria?: ContentSelectionCriteria;
  // Scheduling and Rotation
  schedule: PromotionSchedule;
  rotationConfig: RotationConfiguration;
  // Performance and Optimization
  performanceGoals: PromotionGoal[];
  optimizationSettings: OptimizationSettings;
  abTestConfig?: ABTestConfiguration;
  // Targeting and Personalization
  targeting: PromotionTargeting;
  personalizationRules?: PersonalizationRule[];
  // Budget and Resources
  budget?: PromotionBudget;
  resourceAllocation: ResourceAllocation;
  // Status and Lifecycle
  status: PromotionStatus;
  lifecycle: PromotionLifecycle;
  // Analytics and Insights
  performanceMetrics?: PromotionMetrics;
  insights?: PromotionInsight[];
  // Metadata and Governance
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
  approvalHistory: ApprovalRecord[];
  tags: string[];
  categories: string[];
  // Integration Points
  integrationConfig?: {
    analyticsTracking: AnalyticsTrackingConfig;
    externalPlatforms?: ExternalPlatformConfig[];
    customEventTracking?: CustomEventConfig[];
  };
}

export enum PromotionType {
  // Content-Based Promotions
  FEATURED_TEMPLATES = 'featured_templates',
  NEW_RELEASES = 'new_releases',
  TRENDING_NOW = 'trending_now',
  EDITORS_CHOICE = 'editors_choice',
  SEASONAL_HIGHLIGHTS = 'seasonal_highlights',
  // User-Based Promotions
  PERSONALIZED_RECOMMENDATIONS = 'personalized_recommendations',
  BASED_ON_HISTORY = 'based_on_history',
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  // Category-Based Promotions
  CATEGORY_SPOTLIGHT = 'category_spotlight',
  CROSS_CATEGORY = 'cross_category',
  NICHE_DISCOVERY = 'niche_discovery',
  // Performance-Based Promotions
  TOP_RATED = 'top_rated',
  BEST_SELLERS = 'best_sellers',
  HIGH_ENGAGEMENT = 'high_engagement',
  RISING_STARS = 'rising_stars',
  // Event-Based Promotions
  LIMITED_TIME_OFFERS = 'limited_time_offers',
  FLASH_PROMOTIONS = 'flash_promotions',
  EXCLUSIVE_ACCESS = 'exclusive_access',
  EARLY_BIRD = 'early_bird',
  // Campaign-Based Promotions
  BRAND_PARTNERSHIPS = 'brand_partnerships',
  CREATOR_SPOTLIGHTS = 'creator_spotlights',
  THEMED_COLLECTIONS = 'themed_collections',
  EDUCATIONAL_SERIES = 'educational_series'
}

export enum PromotionStrategy {
  // Selection Strategies
  MANUAL_CURATION = 'manual_curation',
  ALGORITHMIC_SELECTION = 'algorithmic_selection',
  PERFORMANCE_DRIVEN = 'performance_driven',
  HYBRID_APPROACH = 'hybrid_approach',
  // Rotation Strategies
  EQUAL_ROTATION = 'equal_rotation',
  WEIGHTED_ROTATION = 'weighted_rotation',
  PERFORMANCE_WEIGHTED = 'performance_weighted',
  TIME_BASED_ROTATION = 'time_based_rotation',
  // Optimization Strategies
  CTR_OPTIMIZATION = 'ctr_optimization',
  CONVERSION_OPTIMIZATION = 'conversion_optimization',
  REVENUE_OPTIMIZATION = 'revenue_optimization',
  ENGAGEMENT_OPTIMIZATION = 'engagement_optimization',
  // Personalization Strategies
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  CONTENT_BASED_FILTERING = 'content_based_filtering',
  DEMOGRAPHIC_TARGETING = 'demographic_targeting',
  BEHAVIORAL_TARGETING = 'behavioral_targeting'
}

export enum ContentSelectionMethod {
  MANUAL_SELECTION = 'manual_selection',
  RULE_BASED = 'rule_based',
  ML_RECOMMENDATIONS = 'ml_recommendations',
  PERFORMANCE_RANKING = 'performance_ranking',
  HYBRID_SCORING = 'hybrid_scoring',
  REAL_TIME_OPTIMIZATION = 'real_time_optimization'
}

// ==========================================
// PROMOTION CONTENT MANAGEMENT
// ==========================================

export interface PromotionContent {
  contentId: string;
  templateId: string;
  // Content Details
  contentInfo: {,
    title: string;
    description: string;
    creatorId: string;
    categoryId: string;
    tags: string[];
    thumbnailUrl?: string;
    previewUrl?: string;
  };
  // Promotion Configuration
  promotionConfig: {,
    priority: number;
    weight?: number;
    customMessage?: string;
    callToAction?: string;
    promotionalBadges?: PromotionalBadge[];
    customStyling?: Partial<PlacementStyling>;
  };
  // Performance Data
  performanceScore: number;
  metrics: ContentPromotionMetrics;
  // Scheduling
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  // Targeting Overrides
  targetingOverrides?: Partial<PromotionTargeting>;
  // Status and Lifecycle
  status: ContentPromotionStatus;
  addedAt: Date;
  lastPromoted?: Date;
  promotionCount: number;
  // A/B Testing
  experimentVariant?: string;
  controlGroup?: boolean;
}

export interface PromotionalBadge {
  badgeId: string;
  type: BadgeType;
  text: string;
  style: BadgeStyle;
  position: BadgePosition;
  visibility: BadgeVisibility;
  conditions?: BadgeConditions;
}

export enum BadgeType {
  NEW = 'new',
  FEATURED = 'featured',
  TRENDING = 'trending',
  BESTSELLER = 'bestseller',
  EDITOR_CHOICE = 'editor_choice',
  LIMITED_TIME = 'limited_time',
  EXCLUSIVE = 'exclusive',
  PREMIUM = 'premium',
  DISCOUNT = 'discount',
  CUSTOM = 'custom'
}

export interface BadgeStyle {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  fontSize?: string;
  fontWeight?: string;
  borderRadius?: number;
  animation?: 'pulse' | 'glow' | 'bounce' | 'none';
}

export enum BadgePosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  CENTER = 'center',
  OVERLAY = 'overlay'
}

export interface BadgeVisibility {
  showOnHover?: boolean;
  showAlways?: boolean;
  showOnMobile?: boolean;
  minScreenWidth?: number;
}

export interface BadgeConditions {
  timeframe?: {
    start: Date;
    end: Date;
  };
  performanceThreshold?: {
    metric: string;
    value: number;
    operator: 'gt' | 'lt' | 'eq';
  };
  userConditions?: {
    segments: string[];
    excludeSegments?: string[];
  };
}

export enum ContentPromotionStatus {
  ELIGIBLE = 'eligible',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  UNDERPERFORMING = 'underperforming',
  EXCLUDED = 'excluded'
}

// ==========================================
// CONTENT SELECTION AND CRITERIA
// ==========================================

export interface ContentSelectionCriteria {
  // Template Attributes
  templateCriteria: {,
    categories?: string[];
    excludeCategories?: string[];
    tags?: string[];
    excludeTags?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
    creatorIds?: string[];
    excludeCreatorIds?: string[];
    priceRange?: {
      min: number;
      max: number;
    };
  };
  // Performance Requirements
  performanceCriteria: {,
    minRating?: number;
    minPurchases?: number;
    minRevenue?: number;
    maxAge?: number; // days
    performancePercentile?: number; // top X%
    engagementScore?: {
      min: number;
      max?: number;
    };
  };
  // Quality Standards
  qualityCriteria: {,
    hasPreview?: boolean;
    hasDocumentation?: boolean;
    isVerified?: boolean;
    moderationStatus?: 'approved' | 'pending' | 'rejected';
    qualityScore?: {
      min: number;
      max?: number;
    };
  };
  // Content Freshness
  freshnessCriteria: {,
    preferNew?: boolean;
    newThresholdDays?: number;
    updateRecency?: number; // days
    trendingWeight?: number;
    seasonalRelevance?: string[];
  };
  // Diversity Requirements
  diversityCriteria: {,
    maxPerCreator?: number;
    maxPerCategory?: number;
    ensureVariety?: boolean;
    balancePopularAndNiche?: number; // ratio
  };
  // Exclusion Rules
  exclusionRules: {,
    recentlyPromoted?: number; // days
    currentlyPromoted?: boolean;
    userPurchaseHistory?: boolean;
    competitorTemplates?: boolean;
    lowPerformers?: boolean;
  };
}

// ==========================================
// SCHEDULING AND ROTATION
// ==========================================

export interface PromotionSchedule {
  scheduleId: string;
  // Basic Timing
  startDate: Date;
  endDate?: Date;
  timezone: string;
  // Schedule Type
  scheduleType: ScheduleType;
  // Time-Based Rules
  timeRules: TimeBasedRules;
  // Recurrence
  recurrence?: RecurrenceConfig;
  // Dynamic Scheduling
  dynamicRules?: DynamicSchedulingRule[];
  // Status and Tracking
  isActive: boolean;
  nextExecution?: Date;
  lastExecution?: Date;
  executionHistory: ScheduleExecution[];
}

export enum ScheduleType {
  FIXED_DURATION = 'fixed_duration',
  PERFORMANCE_BASED = 'performance_based',
  DYNAMIC_ROTATION = 'dynamic_rotation',
  EVENT_TRIGGERED = 'event_triggered',
  CONTINUOUS = 'continuous'
}

export interface TimeBasedRules {
  // Daily Patterns
  hoursOfDay?: number[];
  excludeHours?: number[];
  // Weekly Patterns
  daysOfWeek?: number[];
  excludeDays?: number[];
  // Special Time Periods
  peakHours?: {
    start: string; // "09:00"
    end: string; // "17:00"
    multiplier: number;
  };
  // Geographic Time Zones
  primaryTimezones?: string[];
  followUserTimezone?: boolean;
  // Seasonal Adjustments
  seasonalPatterns?: SeasonalPattern[];
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'back_to_school';
  adjustmentFactor: number;
  specificDates?: Date[];
  geographicRegions?: string[];
}

export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  interval: number;
  endCondition: 'date' | 'count' | 'performance';
  endValue: Date | number;
  exceptions?: Date[];
}

export interface DynamicSchedulingRule {
  ruleId: string;
  name: string;
  condition: {,
    metric: string;
    threshold: number;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    timeWindow: number; // minutes
  };
  action: {,
    type: 'extend' | 'pause' | 'rotate' | 'boost' | 'end';
    parameters: Record<string, any>;
  };
  priority: number;
  isActive: boolean;
}

export interface ScheduleExecution {
  executionId: string;
  executedAt: Date;
  duration: number; // minutes
  contentRotated: number;
  performanceSnapshot: Record<string, number>;
  issues?: string[];
  success: boolean;
}

// ==========================================
// ROTATION AND OPTIMIZATION
// ==========================================

export interface RotationConfiguration {
  rotationId: string;
  // Rotation Strategy
  strategy: RotationStrategy;
  // Timing Configuration
  rotationFrequency: RotationFrequency;
  rotationTriggers: RotationTrigger[];
  // Content Management
  maxActiveContent: number;
  minActiveContent: number;
  contentBuffer: number; // extra content ready
  // Performance-Based Rotation
  performanceThresholds: PerformanceThreshold[];
  // Weighting System
  weightingFactors: WeightingFactor[];
  // Fallback Rules
  fallbackContent?: string[];
  emergencyContent?: string[];
  // Quality Assurance
  preRotationChecks: QualityCheck[];
  postRotationValidation: QualityCheck[];
}

export enum RotationStrategy {
  ROUND_ROBIN = 'round_robin',
  WEIGHTED_RANDOM = 'weighted_random',
  PERFORMANCE_OPTIMIZED = 'performance_optimized',
  TIME_BASED = 'time_based',
  USER_BEHAVIOR_DRIVEN = 'user_behavior_driven',
  MACHINE_LEARNING = 'machine_learning'
}

export interface RotationFrequency {
  type: 'fixed_interval' | 'performance_based' | 'traffic_based' | 'hybrid';
  interval?: number; // minutes
  minInterval?: number;
  maxInterval?: number;
  conditions?: RotationCondition[];
}

export interface RotationTrigger {
  triggerId: string;
  type: 'time' | 'performance' | 'user_activity' | 'external_event' | 'manual';
  condition: {,
    metric?: string;
    threshold?: number;
    operator?: 'gt' | 'lt' | 'eq';
    timeWindow?: number;
  };
  priority: number;
  isActive: boolean;
  lastTriggered?: Date;
}

export interface PerformanceThreshold {
  metric: string;
  threshold: number;
  action: 'promote' | 'demote' | 'pause' | 'remove' | 'boost';
  timeWindow: number; // minutes
  sampleSize?: number;
}

export interface WeightingFactor {
  factor: string;
  weight: number;
  source: 'historical_performance' | 'real_time_metrics' | 'user_preference' | 'content_attributes' | 'external_signals';
  decayRate?: number; // how quickly influence diminishes
}

export interface RotationCondition {
  conditionId: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  timeWindow: number;
}

export interface QualityCheck {
  checkId: string;
  name: string;
  type: 'content_availability' | 'performance_validation' | 'user_experience' | 'technical_health';
  isRequired: boolean;
  timeout: number; // seconds
  retryCount: number;
}

// ==========================================
// TARGETING AND PERSONALIZATION
// ==========================================

export interface PromotionTargeting extends PlacementTargetingRules {
  // Advanced User Targeting
  userTargeting: {,
    segments: string[];
    excludeSegments?: string[];
    lifeCycleStage?: UserLifeCycleStage[];
    valueTiers?: UserValueTier[];
    engagementLevels?: UserEngagementLevel[];
    purchaseHistory?: PurchaseHistoryTargeting;
  };
  // Contextual Targeting
  contextualTargeting: {,
    currentPage?: string[];
    referrerSource?: string[];
    searchQuery?: string[];
    userIntent?: UserIntent[];
    sessionStage?: SessionStage[];
    deviceCapabilities?: DeviceCapability[];
  };
  // Behavioral Targeting
  behavioralTargeting: {,
    browsingPatterns: BrowsingPattern[];
    interactionHistory: InteractionPattern[];
    purchasePatterns: PurchasePattern[];
    contentPreferences: ContentPreference[];
    temporalPatterns: TemporalPattern[];
  };
  // Performance-Based Targeting
  performanceTargeting: {,
    highValueUsers?: boolean;
    likelyConverters?: boolean;
    activeEngagers?: boolean;
    newUserFocus?: boolean;
    retentionRisk?: boolean;
  };
  // Social and Network Targeting
  socialTargeting?: {
    socialConnections?: string[];
    communityMembership?: string[];
    influencerFollowers?: string[];
    viralContent?: boolean;
  };
}

export enum UserLifeCycleStage {
  NEW_VISITOR = 'new_visitor',
  FIRST_PURCHASE = 'first_purchase',
  REPEAT_CUSTOMER = 'repeat_customer',
  VIP_CUSTOMER = 'vip_customer',
  DORMANT_USER = 'dormant_user',
  CHURNED_USER = 'churned_user'
}

export enum UserValueTier {
  LOW_VALUE = 'low_value',
  MEDIUM_VALUE = 'medium_value',
  HIGH_VALUE = 'high_value',
  VIP_VALUE = 'vip_value'
}

export enum UserEngagementLevel {
  PASSIVE = 'passive',
  CASUAL = 'casual',
  ENGAGED = 'engaged',
  HIGHLY_ENGAGED = 'highly_engaged',
  POWER_USER = 'power_user'
}

export interface PurchaseHistoryTargeting {
  totalPurchases?: {
    min: number;
    max?: number;
  };
  recentPurchases?: {
    days: number;
    count: number;
  };
  categoryPurchases?: string[];
  avgOrderValue?: {
    min: number;
    max?: number;
  };
  purchaseFrequency?: {
    min: number; // purchases per month
    max?: number;
  };
}

export enum UserIntent {
  BROWSING = 'browsing',
  RESEARCHING = 'researching',
  COMPARING = 'comparing',
  PURCHASING = 'purchasing',
  LEARNING = 'learning',
  EXPLORING = 'exploring'
}

export enum SessionStage {
  ENTRY = 'entry',
  EXPLORATION = 'exploration',
  CONSIDERATION = 'consideration',
  DECISION = 'decision',
  CHECKOUT = 'checkout',
  POST_PURCHASE = 'post_purchase'
}

export interface DeviceCapability {
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  touchSupport: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  processingPower: 'low' | 'medium' | 'high';
}

export interface BrowsingPattern {
  patternType: 'sequential' | 'comparative' | 'exploratory' | 'focused';
  categoryDepth: number;
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
}

export interface InteractionPattern {
  interactionType: 'click' | 'scroll' | 'hover' | 'search' | 'filter' | 'share';
  frequency: number;
  intensity: 'low' | 'medium' | 'high';
  recency: number; // hours ago
}

export interface PurchasePattern {
  frequency: 'impulse' | 'regular' | 'seasonal' | 'occasional';
  timing: 'morning' | 'afternoon' | 'evening' | 'weekend' | 'weekday';
  categories: string[];
  priceRange: {,
    min: number;
    max: number;
  };
}

export interface ContentPreference {
  categories: string[];
  creators: string[];
  styles: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  formats: string[];
}

export interface TemporalPattern {
  timeOfDay: number[];
  dayOfWeek: number[];
  seasonality: string[];
  eventTiming: string[];
}

// ==========================================
// PERSONALIZATION SYSTEM
// ==========================================

export interface PersonalizationRule {
  ruleId: string;
  name: string;
  description: string;
  // Rule Configuration
  ruleType: PersonalizationRuleType;
  priority: number;
  isActive: boolean;
  // Conditions
  conditions: PersonalizationCondition[];
  // Actions
  actions: PersonalizationAction[];
  // Performance
  effectivenessScore: number;
  lastOptimized: Date;
  testResults?: ABTestResult[];
  // Metadata
  createdAt: Date;
  createdBy: string;
  version: string;
}

export enum PersonalizationRuleType {
  CONTENT_BOOST = 'content_boost',
  CONTENT_SUPPRESS = 'content_suppress',
  LAYOUT_MODIFICATION = 'layout_modification',
  TIMING_ADJUSTMENT = 'timing_adjustment',
  MESSAGING_CUSTOMIZATION = 'messaging_customization',
  TARGETING_REFINEMENT = 'targeting_refinement'
}

export interface PersonalizationCondition {
  conditionId: string;
  type: 'user_attribute' | 'behavior' | 'context' | 'performance' | 'time';
  attribute: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains' | 'matches';
  value: any;
  weight: number;
}

export interface PersonalizationAction {
  actionId: string;
  type: 'boost_content' | 'change_position' | 'modify_message' | 'adjust_timing' | 'add_badge' | 'change_style';
  parameters: Record<string, any>;
  impact: number; // expected impact score
}

// ==========================================
// PERFORMANCE AND OPTIMIZATION
// ==========================================

export interface PromotionGoal {
  goalId: string;
  name: string;
  type: GoalType;
  // Goal Configuration
  metric: string;
  target: number;
  unit: string;
  timeframe: GoalTimeframe;
  // Progress Tracking
  currentValue: number;
  progress: number; // percentage
  trend: 'improving' | 'declining' | 'stable';
  // Priority and Weight
  priority: GoalPriority;
  weight: number; // for composite scoring
  // Status
  status: GoalStatus;
  achievedAt?: Date;
  lastUpdated: Date;
}

export enum GoalType {
  VISIBILITY = 'visibility',
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  REVENUE = 'revenue',
  RETENTION = 'retention',
  BRAND_AWARENESS = 'brand_awareness'
}

export interface GoalTimeframe {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'campaign_duration';
  duration?: number;
  endDate?: Date;
  milestone?: boolean;
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum GoalStatus {
  ACTIVE = 'active',
  ACHIEVED = 'achieved',
  PAUSED = 'paused',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

export interface OptimizationSettings {
  // Optimization Strategy
  optimizationStrategy: OptimizationStrategy;
  optimizationGoals: string[]; // goal IDs
  // Machine Learning Configuration
  mlConfig?: MachineLearningConfig;
  // Real-Time Optimization
  realTimeOptimization: boolean;
  optimizationFrequency: number; // minutes
  minSampleSize: number;
  confidenceThreshold: number;
  // Constraints
  constraints: OptimizationConstraint[];
  // Fallback Rules
  fallbackRules: FallbackRule[];
}

export enum OptimizationStrategy {
  MANUAL_CONTROL = 'manual_control',
  RULE_BASED = 'rule_based',
  MACHINE_LEARNING = 'machine_learning',
  HYBRID_APPROACH = 'hybrid_approach',
  MULTI_ARMED_BANDIT = 'multi_armed_bandit',
  BAYESIAN_OPTIMIZATION = 'bayesian_optimization'
}

export interface MachineLearningConfig {
  algorithm: 'collaborative_filtering' | 'content_based' | 'deep_learning' | 'ensemble';
  features: MLFeature[];
  trainingData: MLTrainingConfig;
  modelUpdate: MLModelUpdateConfig;
  explainability: boolean;
}

export interface MLFeature {
  name: string;
  type: 'categorical' | 'numerical' | 'text' | 'boolean';
  importance: number;
  preprocessing: string[];
}

export interface MLTrainingConfig {
  dataWindow: number; // days
  minSamples: number;
  validationSplit: number;
  crossValidation: boolean;
  hyperparameterTuning: boolean;
}

export interface MLModelUpdateConfig {
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  performanceDrift: number;
  retrainingTrigger: number;
  modelVersion: boolean;
}

export interface OptimizationConstraint {
  constraintId: string;
  type: 'min_value' | 'max_value' | 'equality' | 'ratio' | 'budget';
  parameter: string;
  value: number;
  priority: number;
}

export interface FallbackRule {
  ruleId: string;
  trigger: string;
  action: string;
  priority: number;
}

// ==========================================
// A/B TESTING FRAMEWORK
// ==========================================

export interface ABTestConfiguration {
  testId: string;
  name: string;
  description: string;
  // Test Design
  testType: ABTestType;
  variants: ABTestVariant[];
  trafficAllocation: TrafficAllocation;
  // Success Metrics
  primaryMetric: string;
  secondaryMetrics: string[];
  minimumDetectableEffect: number;
  // Statistical Configuration
  significanceLevel: number;
  power: number;
  minSampleSize: number;
  maxDuration: number; // days
  // Test Management
  status: ABTestStatus;
  startDate: Date;
  endDate?: Date;
  results?: ABTestResult[];
  // Quality Assurance
  qualityChecks: ABTestQualityCheck[];
  biasDetection: boolean;
  multipleComparisonCorrection: boolean;
}

export enum ABTestType {
  SIMPLE_AB = 'simple_ab',
  MULTIVARIATE = 'multivariate',
  MULTI_ARMED_BANDIT = 'multi_armed_bandit',
  SEQUENTIAL = 'sequential'
}

export interface ABTestVariant {
  variantId: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  trafficPercentage: number;
  isControl: boolean;
}

export interface TrafficAllocation {
  strategy: 'random' | 'deterministic' | 'weighted';
  totalTrafficPercentage: number;
  segments?: string[];
  exclusionRules?: string[];
}

export enum ABTestStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ABTestResult {
  variantId: string;
  metric: string;
  value: number;
  sampleSize: number;
  confidenceInterval: {,
    lower: number;
    upper: number;
  };
  pValue: number;
  effect: number;
  significance: boolean;
}

export interface ABTestQualityCheck {
  checkType: 'sample_ratio' | 'novelty_effect' | 'external_validity' | 'implementation';
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

// ==========================================
// BUDGET AND RESOURCE MANAGEMENT
// ==========================================

export interface PromotionBudget {
  budgetId: string;
  // Budget Configuration
  totalBudget: number;
  currency: string;
  budgetType: BudgetType;
  // Spending Controls
  dailyBudget?: number;
  weeklyBudget?: number;
  monthlyBudget?: number;
  spendingPace: SpendingPace;
  // Cost Structure
  costModel: CostModel;
  bidStrategy?: BidStrategy;
  // Tracking and Alerts
  spentAmount: number;
  remainingBudget: number;
  spendingRate: number; // per day
  budgetAlerts: BudgetAlert[];
  // Performance
  costPerClick: number;
  costPerConversion: number;
  returnOnAdSpend: number;
  // Allocation
  allocationBySlot: Record<string, number>;
  allocationByTime: Record<string, number>;
}

export enum BudgetType {
  LIFETIME = 'lifetime',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CAMPAIGN_DURATION = 'campaign_duration'
}

export enum SpendingPace {
  EVEN = 'even',
  ACCELERATED = 'accelerated',
  FRONT_LOADED = 'front_loaded',
  BACK_LOADED = 'back_loaded'
}

export interface CostModel {
  model: 'cpm' | 'cpc' | 'cpa' | 'cpcv' | 'fixed';
  baseRate: number;
  multipliers?: CostMultiplier[];
}

export interface CostMultiplier {
  factor: string;
  multiplier: number;
  conditions?: Record<string, any>;
}

export interface BidStrategy {
  strategy: 'manual' | 'target_cpa' | 'target_roas' | 'maximize_clicks' | 'maximize_conversions';
  targetValue?: number;
  constraints?: BidConstraint[];
}

export interface BidConstraint {
  type: 'min_bid' | 'max_bid' | 'bid_adjustment';
  value: number;
  conditions?: Record<string, any>;
}

export interface BudgetAlert {
  alertId: string;
  threshold: number;
  thresholdType: 'percentage' | 'amount';
  alertType: 'email' | 'dashboard' | 'webhook';
  recipients: string[];
  isActive: boolean;
  triggered?: boolean;
  lastTriggered?: Date;
}

export interface ResourceAllocation {
  // Slot Allocation
  slotPriority: Record<string, number>;
  slotBudgetShare: Record<string, number>;
  // Time Allocation
  timeDistribution: TimeDistribution[];
  peakHourMultiplier: number;
  // Content Allocation
  contentRotationRate: number;
  maxContentPerSlot: number;
  contentQualityThreshold: number;
  // Performance Allocation
  performanceBasedReallocation: boolean;
  reallocationThreshold: number;
  reallocationFrequency: number; // hours
}

export interface TimeDistribution {
  timeSlot: string;
  percentage: number;
  priority: number;
}

// ==========================================
// ANALYTICS AND INSIGHTS
// ==========================================

export interface PromotionMetrics {
  campaignId: string;
  period: MetricsPeriod;
  lastUpdated: Date;
  // Visibility Metrics
  impressions: number;
  reach: number;
  frequency: number;
  shareOfVoice: number;
  // Engagement Metrics
  clicks: number;
  clickThroughRate: number;
  interactions: number;
  interactionRate: number;
  timeSpent: number;
  bounceRate: number;
  // Conversion Metrics
  conversions: number;
  conversionRate: number;
  assistedConversions: number;
  attributedRevenue: number;
  averageOrderValue: number;
  // Quality Metrics
  qualityScore: number;
  brandSafety: number;
  userSatisfaction: number;
  // Efficiency Metrics
  costPerImpression: number;
  costPerClick: number;
  costPerConversion: number;
  returnOnAdSpend: number;
  // Performance Comparisons
  performanceVsBaseline: PerformanceComparison;
  performanceVsGoals: GoalComparison[];
  competitiveBenchmarks?: CompetitiveBenchmark[];
  // Segmentation
  performanceBySegment: SegmentPerformance[];
  performanceBySlot: SlotPerformance[];
  performanceByTime: TimePerformance[];
}

export interface ContentPromotionMetrics {
  contentId: string;
  period: MetricsPeriod;
  // Content-Specific Metrics
  promotionImpressions: number;
  organicImpressions: number;
  promotionClicks: number;
  organicClicks: number;
  promotionConversions: number;
  organicConversions: number;
  // Performance Scores
  promotionLift: number;
  engagementLift: number;
  conversionLift: number;
  revenueLift: number;
  // Quality Indicators
  contentQualityScore: number;
  userFeedback: number;
  shareRate: number;
  saveRate: number;
  // Lifecycle Metrics
  promotionFrequency: number;
  totalPromotionTime: number; // hours
  averagePromotionDuration: number;
  lastPromotionDate: Date;
}

export interface PerformanceComparison {
  metric: string;
  current: number;
  baseline: number;
  change: number;
  changePercent: number;
  significance: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface GoalComparison {
  goalId: string;
  goalName: string;
  target: number;
  actual: number;
  achievement: number; // percentage
  status: 'ahead' | 'on_track' | 'behind' | 'achieved';
}

export interface CompetitiveBenchmark {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topPerformer: number;
  percentile: number;
}

export interface SegmentPerformance {
  segmentId: string;
  segmentName: string;
  metrics: Record<string, number>;
  sampleSize: number;
  significance: boolean;
}

export interface SlotPerformance {
  slotId: string;
  slotName: string;
  metrics: Record<string, number>;
  performance: 'high' | 'medium' | 'low';
  ranking: number;
}

export interface TimePerformance {
  timeSlot: string;
  metrics: Record<string, number>;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: number;
}

// ==========================================
// INSIGHTS AND RECOMMENDATIONS
// ==========================================

export interface PromotionInsight {
  insightId: string;
  campaignId: string;
  // Insight Classification
  category: InsightCategory;
  type: InsightType;
  priority: InsightPriority;
  // Insight Content
  title: string;
  description: string;
  findings: InsightFinding[];
  evidence: InsightEvidence[];
  // Impact and Significance
  impactLevel: ImpactLevel;
  confidence: number;
  statisticalSignificance: boolean;
  // Recommendations
  recommendations: InsightRecommendation[];
  // Metadata
  generatedAt: Date;
  generatedBy: 'system' | 'analyst' | 'ml_model';
  validUntil?: Date;
  // Follow-up
  actionTaken?: boolean;
  actionDate?: Date;
  actionResult?: ActionResult;
}

export enum InsightCategory {
  PERFORMANCE = 'performance',
  AUDIENCE = 'audience',
  CONTENT = 'content',
  TIMING = 'timing',
  BUDGET = 'budget',
  COMPETITION = 'competition',
  TECHNICAL = 'technical',
  CREATIVE = 'creative'
}

export enum InsightType {
  ANOMALY = 'anomaly',
  TREND = 'trend',
  PATTERN = 'pattern',
  OPPORTUNITY = 'opportunity',
  RISK = 'risk',
  OPTIMIZATION = 'optimization',
  ALERT = 'alert'
}

export enum InsightPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface InsightFinding {
  metric: string;
  observation: string;
  value: number;
  context: string;
  timeframe: string;
}

export interface InsightEvidence {
  type: 'chart' | 'table' | 'comparison' | 'statistical_test';
  data: any;
  description: string;
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface InsightRecommendation {
  recommendationId: string;
  action: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  priority: number;
}

export interface ActionResult {
  implemented: boolean;
  implementationDate: Date;
  result: 'positive' | 'negative' | 'neutral' | 'inconclusive';
  impactMeasured: number;
  notes: string;
}

// ==========================================
// STATUS AND LIFECYCLE MANAGEMENT
// ==========================================

export enum PromotionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export interface PromotionLifecycle {
  currentStage: LifecycleStage;
  stages: LifecycleStageHistory[];
  nextStage?: LifecycleStage;
  stageTransitionRules: StageTransitionRule[];
}

export enum LifecycleStage {
  PLANNING = 'planning',
  APPROVAL = 'approval',
  SETUP = 'setup',
  LAUNCH = 'launch',
  OPTIMIZATION = 'optimization',
  MONITORING = 'monitoring',
  COMPLETION = 'completion',
  ANALYSIS = 'analysis',
  ARCHIVAL = 'archival'
}

export interface LifecycleStageHistory {
  stage: LifecycleStage;
  enteredAt: Date;
  exitedAt?: Date;
  duration?: number; // minutes
  status: 'completed' | 'in_progress' | 'failed' | 'skipped';
  notes?: string;
  performedBy: string;
}

export interface StageTransitionRule {
  fromStage: LifecycleStage;
  toStage: LifecycleStage;
  conditions: TransitionCondition[];
  isAutomatic: boolean;
  requiredRole?: string;
}

export interface TransitionCondition {
  type: 'approval' | 'performance' | 'time' | 'budget' | 'manual';
  condition: string;
  value?: any;
  isMet: boolean;
}

export interface ApprovalRecord {
  recordId: string;
  stage: LifecycleStage;
  approver: string;
  approverRole: string;
  action: 'approved' | 'rejected' | 'requested_changes';
  timestamp: Date;
  comments?: string;
  conditions?: string[];
}

// ==========================================
// INTEGRATION AND EXTERNAL PLATFORMS
// ==========================================

export interface AnalyticsTrackingConfig {
  enabled: boolean;
  trackingId: string;
  customEvents: CustomEventDefinition[];
  conversionTracking: ConversionTrackingConfig;
  crossDomainTracking?: boolean;
  privacyCompliant: boolean;
}

export interface CustomEventDefinition {
  eventName: string;
  eventCategory: string;
  parameters: Record<string, any>;
  trackingCode: string;
}

export interface ConversionTrackingConfig {
  conversionEvents: string[];
  conversionValue: boolean;
  attributionModel: 'first_click' | 'last_click' | 'linear' | 'time_decay' | 'position_based';
  lookbackWindow: number; // days
}

export interface ExternalPlatformConfig {
  platform: 'google_ads' | 'facebook_ads' | 'microsoft_ads' | 'twitter_ads' | 'linkedin_ads' | 'custom';
  accountId: string;
  campaignSync: boolean;
  bidSync: boolean;
  audienceSync: boolean;
  conversionSync: boolean;
  apiCredentials: Record<string, string>;
}

export interface CustomEventConfig {
  eventId: string;
  eventName: string;
  eventType: 'impression' | 'click' | 'conversion' | 'custom';
  parameters: Record<string, any>;
  frequency: 'once' | 'session' | 'always';
  conditions?: Record<string, any>;
}

// ==========================================
// UTILITY TYPES AND HELPERS
// ==========================================

export interface PromotionFilterCriteria {
  campaignIds?: string[];
  status?: PromotionStatus[];
  types?: PromotionType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  performance?: {
    metric: string;
    threshold: number;
    operator: 'gt' | 'lt' | 'eq';
  };
  tags?: string[];
  createdBy?: string[];
  approvalStatus?: string[];
}

export interface PromotionSortOptions {
  field: 'createdAt' | 'performance' | 'budget' | 'status' | 'name';
  direction: 'asc' | 'desc';
  secondarySort?: PromotionSortOptions;
}

export interface PromotionBulkOperation {
  operationType: 'activate' | 'pause' | 'cancel' | 'duplicate' | 'update' | 'delete';
  campaignIds: string[];
  parameters?: Record<string, any>;
  dryRun?: boolean;
}

export interface PromotionValidationError {
  errorCode: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PromotionTemplate {
  templateId: string;
  name: string;
  description: string;
  category: string;
  template: Partial<PromotionCampaign>;
  usageCount: number;
  averagePerformance: Record<string, number>;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

// ==========================================
// DATA MODEL EXPORTS
// ==========================================

export type {
  // Core Entities
  PromotionCampaign,
  PromotionContent,
  PromotionSchedule,
  RotationConfiguration,
  PromotionTargeting,
  PersonalizationRule,
  PromotionGoal,
  OptimizationSettings,
  ABTestConfiguration,
  PromotionBudget,
  ResourceAllocation,
  PromotionMetrics,
  ContentPromotionMetrics,
  PromotionInsight,
  PromotionLifecycle,
  // Configuration Objects
  ContentSelectionCriteria,
  PromotionalBadge,
  TimeBasedRules,
  RecurrenceConfig,
  DynamicSchedulingRule,
  RotationTrigger,
  PerformanceThreshold,
  WeightingFactor,
  MachineLearningConfig,
  ABTestVariant,
  TrafficAllocation,
  CostModel,
  BidStrategy,
  // Analytics and Performance
  PerformanceComparison,
  GoalComparison,
  CompetitiveBenchmark,
  SegmentPerformance,
  SlotPerformance,
  TimePerformance,
  InsightFinding,
  InsightEvidence,
  InsightRecommendation,
  // Utility Types
  PromotionFilterCriteria,
  PromotionSortOptions,
  PromotionBulkOperation,
  PromotionValidationError,
  PromotionTemplate
};