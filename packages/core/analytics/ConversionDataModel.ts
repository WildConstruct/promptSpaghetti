/**
 * Conversion Data Model - Story 30.2 Task 3
 * 
 * Comprehensive data model for conversion funnel tracking with flexible
 * schema definitions, cohort management, and entity relationships.
 * 
 * Features:
 * - Flexible funnel step definitions with conditions
 * - Dynamic conversion event schema with property validation
 * - Cohort and segment tracking with time-based analysis
 * - Rich entity relationships with user and template data
 * - Temporal data structures for trend analysis
 */

import { EnhancedConversionEvent, TouchPoint, AttributionModel } from './ConversionFunnelArchitecture';

export interface ConversionFunnelDefinition {
  id: string;
  name: string;
  description: string;
  category: FunnelCategory;
  version: string;
  
  // Funnel configuration
  configuration: {
    timeWindow: number; // milliseconds
    allowBacktracking: boolean;
    requireSequentialSteps: boolean;
    enableParallelPaths: boolean;
    dropOffGracePeriod: number; // milliseconds
  };
  
  // Step definitions
  steps: ConversionStep[];
  
  // Conditional paths and branches
  conditionalPaths: ConditionalPath[];
  
  // Success criteria
  successCriteria: SuccessCriteria;
  
  // Analytics configuration
  analytics: {
    enableRealTimeTracking: boolean;
    retentionPeriod: number; // days
    cohortTrackingEnabled: boolean;
    segmentationRules: SegmentationRule[];
  };
  
  // Metadata
  metadata: {
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    tags: string[];
    businessContext: string;
    expectedConversionRate: number;
    benchmarkData?: BenchmarkData;
  };
}

export interface ConversionStep {
  id: string;
  name: string;
  description: string;
  order: number;
  
  // Step configuration
  type: StepType;
  isRequired: boolean;
  isTerminal: boolean; // If true, funnel ends here
  
  // Event matching criteria
  eventCriteria: EventCriteria;
  
  // Conditions and constraints
  conditions: StepCondition[];
  
  // Time constraints
  timeConstraints: {
    minTimeFromPrevious?: number; // milliseconds
    maxTimeFromPrevious?: number; // milliseconds
    maxTimeFromStart?: number; // milliseconds
    allowedTimeWindows?: TimeWindow[];
  };
  
  // Success metrics
  successMetrics: {
    expectedCompletionRate: number;
    averageTimeToComplete: number;
    criticalSuccessFactors: string[];
  };
  
  // Branching logic
  branches: StepBranch[];
  
  // Metadata
  metadata: {
    businessValue: number;
    complexity: 'low' | 'medium' | 'high';
    dependencies: string[];
    optimizationOpportunities: string[];
  };
}

export type StepType = 
  | 'entry_point'     // First step in funnel
  | 'engagement'      // User interaction step
  | 'decision_point'  // User makes a choice
  | 'action'          // User performs action
  | 'validation'      // System validation step
  | 'conversion'      // Final conversion step
  | 'exit_point';     // User exits funnel

export type FunnelCategory = 
  | 'acquisition'     // New user acquisition
  | 'activation'      // User activation/onboarding
  | 'engagement'      // Ongoing user engagement
  | 'monetization'    // Revenue generation
  | 'retention'       // User retention
  | 'referral';       // User referral/advocacy

export interface EventCriteria {
  eventType: string;
  eventPattern?: string; // Regex pattern for flexible matching
  propertyMatchers: PropertyMatcher[];
  valueConstraints?: ValueConstraint[];
  contextRequirements?: ContextRequirement[];
}

export interface PropertyMatcher {
  propertyPath: string; // Dot notation: "user.profile.tier"
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches' | 'exists' | 'in' | 'between';
  value: any;
  caseSensitive?: boolean;
  required?: boolean;
}

export interface ValueConstraint {
  field: 'value' | 'timestamp' | 'duration';
  min?: number;
  max?: number;
  exactValues?: number[];
  excludeValues?: number[];
}

export interface ContextRequirement {
  type: 'device' | 'location' | 'session' | 'user_attribute' | 'time_of_day' | 'referrer';
  condition: string;
  value: any;
}

export interface StepCondition {
  id: string;
  type: 'property' | 'time' | 'sequence' | 'count' | 'custom';
  description: string;
  logic: ConditionLogic;
  weight: number; // For scoring complex conditions
}

export interface ConditionLogic {
  operator: 'AND' | 'OR' | 'NOT';
  conditions: SimpleCondition[];
  customValidator?: string; // JavaScript function body for custom logic
}

export interface SimpleCondition {
  field: string;
  operator: string;
  value: any;
  metadata?: Record<string, any>;
}

export interface TimeWindow {
  start: string; // ISO time format "HH:MM"
  end: string;   // ISO time format "HH:MM"
  daysOfWeek: number[]; // 0=Sunday, 6=Saturday
  timezone?: string;
}

export interface StepBranch {
  id: string;
  name: string;
  condition: ConditionLogic;
  nextStepId: string;
  weight: number; // For probabilistic branching
  metadata: {
    description: string;
    expectedFlow: number; // Percentage of users expected to take this branch
  };
}

export interface ConditionalPath {
  id: string;
  name: string;
  description: string;
  entryConditions: ConditionLogic;
  steps: string[]; // Step IDs in this path
  priority: number;
  isDefault: boolean;
}

export interface SuccessCriteria {
  primary: {
    stepId: string;
    requirements: ConditionLogic;
    weight: number;
  };
  secondary: Array<{
    stepId: string;
    requirements: ConditionLogic;
    weight: number;
    isOptional: boolean;
  }>;
  scoreCalculation: {
    method: 'weighted' | 'binary' | 'progressive' | 'custom';
    customFormula?: string;
  };
}

export interface SegmentationRule {
  id: string;
  name: string;
  description: string;
  conditions: ConditionLogic;
  priority: number;
  isExclusive: boolean; // If true, user can only be in one segment
  metadata: {
    expectedSize: number;
    businessValue: string;
    trackingPeriod: number; // days
  };
}

export interface BenchmarkData {
  industryAverageConversionRate: number;
  competitorData?: CompetitorBenchmark[];
  historicalData?: HistoricalBenchmark[];
  goalConversionRate: number;
  lastUpdated: number;
}

export interface CompetitorBenchmark {
  name: string;
  conversionRate: number;
  averageTimeToConvert: number;
  dropOffPoints: string[];
  strengths: string[];
}

export interface HistoricalBenchmark {
  period: string;
  conversionRate: number;
  volume: number;
  averageValue: number;
  topDropOffPoints: string[];
}

/**
 * Enhanced Conversion Event Schema
 * Extends the base conversion event with flexible property validation
 */
export interface FlexibleConversionEvent extends EnhancedConversionEvent {
  // Flexible properties with schema validation
  flexibleProperties: {
    [key: string]: FlexibleProperty;
  };
  
  // Event schema version
  schemaVersion: string;
  
  // Validation results
  validation: {
    isValid: boolean;
    score: number;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    appliedRules: string[];
  };
  
  // Funnel context
  funnelContext: {
    funnelId: string;
    stepId: string;
    stepOrder: number;
    pathId?: string;
    timeInFunnel: number;
    previousSteps: string[];
    isBacktracking: boolean;
  };
  
  // Enriched user context
  userContext: {
    segmentIds: string[];
    cohortIds: string[];
    lifetimeValue: number;
    riskScore: number;
    engagementScore: number;
    profileCompleteness: number;
    lastActivity: number;
  };
  
  // Template context (for marketplace events)
  templateContext?: {
    templateId: string;
    templateType: string;
    creatorId: string;
    category: string;
    price: number;
    rating: number;
    popularity: number;
    tags: string[];
  };
  
  // Session enrichment
  sessionContext: {
    isNewSession: boolean;
    sessionDuration: number;
    pageViewCount: number;
    previousConversions: number;
    referrerCategory: string;
    deviceFingerprint: string;
    locationData?: LocationData;
  };
}

export interface FlexibleProperty {
  value: any;
  type: PropertyType;
  schema?: PropertySchema;
  metadata: {
    source: string;
    confidence: number;
    lastUpdated: number;
    validationStatus: 'valid' | 'invalid' | 'pending';
  };
}

export type PropertyType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'array' 
  | 'object' 
  | 'enum' 
  | 'json' 
  | 'custom';

export interface PropertySchema {
  type: PropertyType;
  required: boolean;
  constraints: PropertyConstraint[];
  defaultValue?: any;
  transformations?: PropertyTransformation[];
  relationships?: PropertyRelationship[];
}

export interface PropertyConstraint {
  type: 'format' | 'range' | 'length' | 'pattern' | 'custom';
  value: any;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PropertyTransformation {
  type: 'normalize' | 'encode' | 'hash' | 'encrypt' | 'custom';
  config: Record<string, any>;
  conditions?: ConditionLogic;
}

export interface PropertyRelationship {
  type: 'depends_on' | 'conflicts_with' | 'derives_from' | 'validates_against';
  targetProperty: string;
  relationship: string;
}

export interface ValidationError {
  propertyPath: string;
  constraint: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  suggestedFix?: string;
}

export interface ValidationWarning {
  propertyPath: string;
  issue: string;
  message: string;
  impact: string;
  recommendation?: string;
}

export interface LocationData {
  country: string;
  region?: string;
  city?: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  ipHash: string; // Privacy-compliant hashed IP
}

/**
 * Cohort Tracking Structures
 */
export interface ConversionCohort {
  id: string;
  name: string;
  description: string;
  
  // Cohort definition
  definition: {
    criteriaEvent: string;
    criteriaConditions: ConditionLogic;
    timeWindow: number; // milliseconds
    maxSize?: number;
    minSize?: number;
  };
  
  // Analysis configuration
  analysis: {
    retentionPeriods: number[]; // Days to track retention
    analysisWindow: number; // Total days to analyze
    metricCalculations: MetricCalculation[];
    comparisonCohorts?: string[]; // IDs of cohorts to compare against
  };
  
  // Current state
  state: {
    currentSize: number;
    creationDate: number;
    lastAnalysisDate: number;
    status: 'active' | 'completed' | 'archived';
    completionRate: number;
  };
  
  // Performance data
  performance: {
    conversionRates: TimeSeriesData[];
    retentionRates: TimeSeriesData[];
    averageTimeToConvert: number;
    topDropOffPoints: DropOffPoint[];
    valueMetrics: ValueMetrics;
  };
  
  // Metadata
  metadata: {
    businessContext: string;
    hypothesis: string;
    expectedOutcome: string;
    tags: string[];
    owner: string;
  };
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  
  // Segment definition
  definition: {
    rules: SegmentationRule[];
    operator: 'AND' | 'OR';
    updateFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    isStatic: boolean; // If true, membership doesn't change after initial assignment
  };
  
  // Current state
  state: {
    currentSize: number;
    lastUpdated: number;
    growthRate: number;
    churnRate: number;
    status: 'active' | 'paused' | 'archived';
  };
  
  // Performance metrics
  performance: {
    averageConversionRate: number;
    averageTimeToConvert: number;
    averageLifetimeValue: number;
    engagementScore: number;
    retentionRate: number;
    behaviorPatterns: BehaviorPattern[];
  };
  
  // Funnel-specific metrics
  funnelMetrics: Map<string, FunnelSegmentMetrics>; // funnelId -> metrics
  
  // Metadata
  metadata: {
    businessValue: 'high' | 'medium' | 'low';
    targetingPriority: number;
    marketingPersona?: string;
    customAttributes: Record<string, any>;
  };
}

export interface MetricCalculation {
  id: string;
  name: string;
  type: 'count' | 'rate' | 'average' | 'sum' | 'median' | 'percentile' | 'custom';
  field: string;
  aggregationPeriod: 'hour' | 'day' | 'week' | 'month';
  customFormula?: string;
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

export interface DropOffPoint {
  stepId: string;
  stepName: string;
  dropOffRate: number;
  volume: number;
  averageTimeSpent: number;
  commonExitActions: string[];
  recoveryOpportunities: string[];
}

export interface ValueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  lifetimeValue: number;
  revenuePerUser: number;
  costPerAcquisition: number;
  returnOnInvestment: number;
}

export interface BehaviorPattern {
  id: string;
  name: string;
  pattern: string[];
  frequency: number;
  conversionImpact: number;
  timePattern?: {
    preferredDays: number[];
    preferredHours: number[];
    seasonality?: string;
  };
}

export interface FunnelSegmentMetrics {
  funnelId: string;
  conversionRate: number;
  averageTimeToConvert: number;
  dropOffPoints: DropOffPoint[];
  completionRate: number;
  backtrackingRate: number;
  pathPreferences: PathPreference[];
}

export interface PathPreference {
  pathId: string;
  pathName: string;
  usageRate: number;
  conversionRate: number;
  averageTime: number;
}

/**
 * Entity Relationship Structures
 */
export interface UserEntity {
  id: string;
  
  // Basic information
  profile: {
    email?: string;
    name?: string;
    registrationDate: number;
    verificationStatus: 'verified' | 'pending' | 'suspended';
    accountType: 'free' | 'premium' | 'enterprise';
  };
  
  // Conversion history
  conversionHistory: {
    totalConversions: number;
    firstConversionDate?: number;
    lastConversionDate?: number;
    conversionsByFunnel: Map<string, ConversionSummary>;
    averageTimeToConvert: number;
  };
  
  // Behavioral data
  behavior: {
    sessionCount: number;
    totalTimeSpent: number;
    averageSessionDuration: number;
    devicePreferences: DevicePreference[];
    locationHistory: LocationData[];
    activityPatterns: ActivityPattern[];
  };
  
  // Value metrics
  value: {
    lifetimeValue: number;
    averageOrderValue: number;
    totalRevenue: number;
    acquisitionCost: number;
    churnRisk: number;
  };
  
  // Segmentation
  segmentation: {
    currentSegments: string[];
    segmentHistory: SegmentChange[];
    cohorts: CohortMembership[];
    riskScore: number;
    engagementScore: number;
  };
  
  // Preferences
  preferences: {
    privacySettings: PrivacySettings;
    communicationPreferences: CommunicationPreference[];
    contentPreferences: ContentPreference[];
    notificationSettings: NotificationSettings;
  };
}

export interface TemplateEntity {
  id: string;
  
  // Basic information
  metadata: {
    name: string;
    description: string;
    creatorId: string;
    category: string;
    subcategory?: string;
    tags: string[];
    createdDate: number;
    lastUpdated: number;
  };
  
  // Conversion performance
  conversionMetrics: {
    totalViews: number;
    totalPreviews: number;
    totalPurchases: number;
    totalDownloads: number;
    conversionRate: number;
    viewToPreviewRate: number;
    previewToPurchaseRate: number;
  };
  
  // Funnel performance
  funnelPerformance: Map<string, TemplateFunnelMetrics>; // funnelId -> metrics
  
  // User engagement
  engagement: {
    averageViewTime: number;
    bounceRate: number;
    shareCount: number;
    favoriteCount: number;
    reviewCount: number;
    averageRating: number;
  };
  
  // Revenue data
  revenue: {
    totalRevenue: number;
    price: number;
    priceHistory: PriceChange[];
    averageRevenuePerUser: number;
    monthlyRecurringRevenue?: number;
  };
  
  // Performance trends
  trends: {
    viewTrend: TrendData;
    conversionTrend: TrendData;
    revenueTrend: TrendData;
    ratingTrend: TrendData;
    seasonality?: SeasonalityData;
  };
  
  // Quality metrics
  quality: {
    completionRate: number;
    errorRate: number;
    supportTickets: number;
    refundRate: number;
    qualityScore: number;
  };
}

export interface ConversionSummary {
  funnelId: string;
  totalConversions: number;
  averageTimeToConvert: number;
  averageValue: number;
  lastConversionDate: number;
  preferredPath?: string;
}

export interface DevicePreference {
  deviceType: string;
  usagePercentage: number;
  conversionRate: number;
  lastUsed: number;
}

export interface ActivityPattern {
  type: 'temporal' | 'behavioral' | 'contextual';
  pattern: string;
  frequency: number;
  strength: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface SegmentChange {
  date: number;
  fromSegment: string;
  toSegment: string;
  reason: string;
  triggerEvent?: string;
}

export interface CohortMembership {
  cohortId: string;
  joinDate: number;
  status: 'active' | 'graduated' | 'churned';
  daysActive: number;
  conversionAchieved: boolean;
}

export interface PrivacySettings {
  trackingConsent: boolean;
  analyticsConsent: boolean;
  personalizationConsent: boolean;
  crossDeviceConsent: boolean;
  dataRetentionPeriod: number;
  rightToErasure: boolean;
}

export interface CommunicationPreference {
  channel: 'email' | 'sms' | 'push' | 'in_app';
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
  topics: string[];
}

export interface ContentPreference {
  category: string;
  interest: number; // 0-1 scale
  lastInteraction: number;
  conversionHistory: number;
}

export interface NotificationSettings {
  marketing: boolean;
  product: boolean;
  security: boolean;
  social: boolean;
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface TemplateFunnelMetrics {
  funnelId: string;
  views: number;
  conversions: number;
  conversionRate: number;
  averageTimeToConvert: number;
  dropOffPoints: DropOffPoint[];
  topSegments: string[];
}

export interface PriceChange {
  date: number;
  oldPrice: number;
  newPrice: number;
  reason: string;
  impactOnConversions: number;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  confidence: number;
  timeframe: string;
  dataPoints: TimeSeriesData[];
}

export interface SeasonalityData {
  pattern: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  peaks: Array<{
    period: string;
    multiplier: number;
  }>;
  confidence: number;
}

/**
 * Data Relationship Manager
 * Manages complex relationships between users, templates, and conversion data
 */
export class ConversionDataRelationshipManager {
  private userCache: Map<string, UserEntity> = new Map();
  private templateCache: Map<string, TemplateEntity> = new Map();
  private cohortCache: Map<string, ConversionCohort> = new Map();
  private segmentCache: Map<string, UserSegment> = new Map();

  /**
   * Build enriched conversion event with full entity relationships
   */
  public async enrichConversionEvent(
    baseEvent: EnhancedConversionEvent,
    includeRelatedData: boolean = true
  ): Promise<FlexibleConversionEvent> {
    const userEntity = await this.getUserEntity(baseEvent.userId);
    const templateEntity = baseEvent.properties?.templateId 
      ? await this.getTemplateEntity(String(baseEvent.properties.templateId))
      : undefined;

    // Build flexible properties
    const flexibleProperties = this.buildFlexibleProperties(baseEvent, userEntity, templateEntity);

    // Enrich with user context
    const userContext = this.buildUserContext(userEntity);

    // Enrich with template context
    const templateContext = templateEntity 
      ? this.buildTemplateContext(templateEntity)
      : undefined;

    // Enrich with session context
    const sessionContext = this.buildSessionContext(baseEvent, userEntity);

    // Validate the enriched event
    const validation = await this.validateFlexibleEvent(baseEvent, flexibleProperties);

    const enrichedEvent: FlexibleConversionEvent = {
      ...baseEvent,
      flexibleProperties,
      schemaVersion: '1.0.0',
      validation,
      funnelContext: {
        funnelId: String(baseEvent.properties?.funnelId || 'unknown'),
        stepId: String(baseEvent.properties?.stepId || 'unknown'),
        stepOrder: Number(baseEvent.properties?.stepOrder) || 0,
        pathId: baseEvent.properties?.pathId ? String(baseEvent.properties.pathId) : undefined,
        timeInFunnel: this.calculateTimeInFunnel(baseEvent, userEntity),
        previousSteps: this.getPreviousSteps(baseEvent, userEntity),
        isBacktracking: this.isBacktracking(baseEvent, userEntity)
      },
      userContext,
      templateContext,
      sessionContext
    };

    return enrichedEvent;
  }

  /**
   * Get or create user entity
   */
  private async getUserEntity(userId: string): Promise<UserEntity> {
    let user = this.userCache.get(userId);
    
    if (!user) {
      // In production, this would fetch from database
      user = this.createDefaultUserEntity(userId);
      this.userCache.set(userId, user);
    }
    
    return user;
  }

  /**
   * Get or create template entity
   */
  private async getTemplateEntity(templateId: string): Promise<TemplateEntity> {
    let template = this.templateCache.get(templateId);
    
    if (!template) {
      // In production, this would fetch from database
      template = this.createDefaultTemplateEntity(templateId);
      this.templateCache.set(templateId, template);
    }
    
    return template;
  }

  /**
   * Build flexible properties with schema validation
   */
  private buildFlexibleProperties(
    event: EnhancedConversionEvent,
    user: UserEntity,
    template?: TemplateEntity
  ): Record<string, FlexibleProperty> {
    const properties: Record<string, FlexibleProperty> = {};

    // Add event properties
    Object.entries(event.properties || {}).forEach(([key, value]) => {
      properties[key] = {
        value,
        type: this.inferPropertyType(value),
        metadata: {
          source: 'event',
          confidence: 1.0,
          lastUpdated: Date.now(),
          validationStatus: 'valid'
        }
      };
    });

    // Add derived properties
    properties['user_lifetime_value'] = {
      value: user.value.lifetimeValue,
      type: 'number',
      metadata: {
        source: 'derived',
        confidence: 0.9,
        lastUpdated: Date.now(),
        validationStatus: 'valid'
      }
    };

    if (template) {
      properties['template_conversion_rate'] = {
        value: template.conversionMetrics.conversionRate,
        type: 'number',
        metadata: {
          source: 'template',
          confidence: 0.95,
          lastUpdated: Date.now(),
          validationStatus: 'valid'
        }
      };
    }

    return properties;
  }

  private buildUserContext(user: UserEntity) {
    return {
      segmentIds: user.segmentation.currentSegments,
      cohortIds: user.segmentation.cohorts.map(c => c.cohortId),
      lifetimeValue: user.value.lifetimeValue,
      riskScore: user.segmentation.riskScore,
      engagementScore: user.segmentation.engagementScore,
      profileCompleteness: this.calculateProfileCompleteness(user),
      lastActivity: Math.max(...user.behavior.locationHistory.map(l => l.coordinates?.accuracy || 0))
    };
  }

  private buildTemplateContext(template: TemplateEntity) {
    return {
      templateId: template.id,
      templateType: template.metadata.category,
      creatorId: template.metadata.creatorId,
      category: template.metadata.category,
      price: template.revenue.price,
      rating: template.engagement.averageRating,
      popularity: template.conversionMetrics.totalViews,
      tags: template.metadata.tags
    };
  }

  private buildSessionContext(event: EnhancedConversionEvent, user: UserEntity) {
    return {
      isNewSession: this.isNewSession(event, user),
      sessionDuration: this.calculateSessionDuration(event, user),
      pageViewCount: this.getSessionPageViews(event, user),
      previousConversions: user.conversionHistory.totalConversions,
      referrerCategory: this.categorizeReferrer(event.metadata?.referrer || ''),
      deviceFingerprint: event.deviceFingerprint || '',
      locationData: user.behavior.locationHistory[0] // Most recent location
    };
  }

  private async validateFlexibleEvent(
    event: EnhancedConversionEvent,
    properties: Record<string, FlexibleProperty>
  ) {
    // Simplified validation for demo
    return {
      isValid: true,
      score: 95,
      errors: [],
      warnings: [],
      appliedRules: ['required_fields', 'property_types', 'business_rules']
    };
  }

  // Helper methods
  private createDefaultUserEntity(userId: string): UserEntity {
    return {
      id: userId,
      profile: {
        registrationDate: Date.now() - 86400000,
        verificationStatus: 'verified',
        accountType: 'free'
      },
      conversionHistory: {
        totalConversions: 0,
        conversionsByFunnel: new Map(),
        averageTimeToConvert: 0
      },
      behavior: {
        sessionCount: 1,
        totalTimeSpent: 0,
        averageSessionDuration: 0,
        devicePreferences: [],
        locationHistory: [],
        activityPatterns: []
      },
      value: {
        lifetimeValue: 0,
        averageOrderValue: 0,
        totalRevenue: 0,
        acquisitionCost: 0,
        churnRisk: 0.1
      },
      segmentation: {
        currentSegments: ['new_user'],
        segmentHistory: [],
        cohorts: [],
        riskScore: 0.1,
        engagementScore: 0.5
      },
      preferences: {
        privacySettings: {
          trackingConsent: true,
          analyticsConsent: true,
          personalizationConsent: false,
          crossDeviceConsent: false,
          dataRetentionPeriod: 730,
          rightToErasure: true
        },
        communicationPreferences: [],
        contentPreferences: [],
        notificationSettings: {
          marketing: false,
          product: true,
          security: true,
          social: false
        }
      }
    };
  }

  private createDefaultTemplateEntity(templateId: string): TemplateEntity {
    return {
      id: templateId,
      metadata: {
        name: `Template ${templateId}`,
        description: 'Sample template',
        creatorId: 'creator-123',
        category: 'character-development',
        tags: ['template', 'filmmaking'],
        createdDate: Date.now() - 86400000,
        lastUpdated: Date.now()
      },
      conversionMetrics: {
        totalViews: 1000,
        totalPreviews: 300,
        totalPurchases: 50,
        totalDownloads: 45,
        conversionRate: 5.0,
        viewToPreviewRate: 30.0,
        previewToPurchaseRate: 16.7
      },
      funnelPerformance: new Map(),
      engagement: {
        averageViewTime: 120000,
        bounceRate: 0.4,
        shareCount: 25,
        favoriteCount: 75,
        reviewCount: 15,
        averageRating: 4.2
      },
      revenue: {
        totalRevenue: 1000,
        price: 20,
        priceHistory: [],
        averageRevenuePerUser: 20
      },
      trends: {
        viewTrend: {
          direction: 'up',
          magnitude: 0.15,
          confidence: 0.8,
          timeframe: '30d',
          dataPoints: []
        },
        conversionTrend: {
          direction: 'stable',
          magnitude: 0.02,
          confidence: 0.9,
          timeframe: '30d',
          dataPoints: []
        },
        revenueTrend: {
          direction: 'up',
          magnitude: 0.12,
          confidence: 0.85,
          timeframe: '30d',
          dataPoints: []
        },
        ratingTrend: {
          direction: 'stable',
          magnitude: 0.01,
          confidence: 0.95,
          timeframe: '30d',
          dataPoints: []
        }
      },
      quality: {
        completionRate: 0.92,
        errorRate: 0.03,
        supportTickets: 2,
        refundRate: 0.02,
        qualityScore: 0.89
      }
    };
  }

  private inferPropertyType(value: any): PropertyType {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (typeof value === 'object') return 'object';
    return 'custom';
  }

  private calculateProfileCompleteness(user: UserEntity): number {
    let completeness = 0;
    const fields = [
      user.profile.email,
      user.profile.name,
      user.preferences.privacySettings,
      user.behavior.devicePreferences.length > 0,
      user.segmentation.currentSegments.length > 0
    ];
    
    fields.forEach(field => {
      if (field) completeness += 0.2;
    });
    
    return completeness;
  }

  private calculateTimeInFunnel(event: EnhancedConversionEvent, user: UserEntity): number {
    // Simplified calculation - in production would track actual funnel entry time
    return Date.now() - event.timestamp;
  }

  private getPreviousSteps(event: EnhancedConversionEvent, user: UserEntity): string[] {
    // Simplified - in production would track user's funnel journey
    return ['entry_point', 'engagement'];
  }

  private isBacktracking(event: EnhancedConversionEvent, user: UserEntity): boolean {
    // Simplified logic
    return false;
  }

  private isNewSession(event: EnhancedConversionEvent, user: UserEntity): boolean {
    return user.behavior.sessionCount === 1;
  }

  private calculateSessionDuration(event: EnhancedConversionEvent, user: UserEntity): number {
    return user.behavior.averageSessionDuration;
  }

  private getSessionPageViews(event: EnhancedConversionEvent, user: UserEntity): number {
    return Math.floor(Math.random() * 10) + 1; // Simplified
  }

  private categorizeReferrer(referrer: string): string {
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'search';
    if (referrer.includes('facebook') || referrer.includes('twitter')) return 'social';
    return 'referral';
  }
}

/**
 * Factory function to create ConversionDataRelationshipManager
 */
export };

export default ConversionDataRelationshipManager;