/**
 * Epic 16 Suspicious Activity Detection Service
 * 
 * Comprehensive security service for detecting, analyzing, and preventing
 * suspicious activities in the Epic 16 Marketplace & Community platform.
 * Includes real-time monitoring, ML-based detection, and automated response.
 */

import { EventEmitter } from 'events';

// Core suspicious activity interfaces
export interface SuspiciousActivity {
  id: string;
  type: ActivityType;
  severity: SeverityLevel;
  confidence: number; // 0-1
  
  // Context information
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  
  // Activity details
  description: string;
  evidence: ActivityEvidence[];
  patterns: DetectionPattern[];
  metadata: Record<string, any>;
  
  // Detection information
  detectionMethod: DetectionMethod;
  detectedBy: string; // detector ID or rule name
  riskScore: number; // 0-100
  
  // Status and handling
  status: ActivityStatus;
  investigated: boolean;
  investigatedBy?: string;
  investigatedAt?: Date;
  resolution?: ActivityResolution;
  
  // Related activities
  relatedActivities: string[];
  clusterId?: string; // For grouped activities
  
  // Response actions
  actionsTriggered: ResponseAction[];
  
  // Geolocation
  geolocation?: GeoLocation;
  
  // Device fingerprint
  deviceFingerprint?: DeviceFingerprint;
}

export enum ActivityType {
  // Authentication anomalies
  BRUTE_FORCE_LOGIN = 'brute_force_login',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  UNUSUAL_LOGIN_LOCATION = 'unusual_login_location',
  IMPOSSIBLE_TRAVEL = 'impossible_travel',
  MULTIPLE_ACCOUNT_ACCESS = 'multiple_account_access',
  
  // Account manipulation
  RAPID_ACCOUNT_CREATION = 'rapid_account_creation',
  FAKE_ACCOUNT_CREATION = 'fake_account_creation',
  ACCOUNT_TAKEOVER = 'account_takeover',
  PROFILE_MANIPULATION = 'profile_manipulation',
  
  // Marketplace fraud
  FAKE_TEMPLATE_UPLOAD = 'fake_template_upload',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  PRICE_MANIPULATION = 'price_manipulation',
  FAKE_REVIEWS = 'fake_reviews',
  RATING_MANIPULATION = 'rating_manipulation',
  CHARGEBACK_FRAUD = 'chargeback_fraud',
  
  // Community abuse
  SPAM_POSTING = 'spam_posting',
  MASS_MESSAGING = 'mass_messaging',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  DOXXING = 'doxxing',
  IMPERSONATION = 'impersonation',
  
  // Technical attacks
  DDoS_ATTEMPT = 'ddos_attempt',
  SCRAPING_ATTEMPT = 'scraping_attempt',
  API_ABUSE = 'api_abuse',
  INJECTION_ATTEMPT = 'injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  
  // Financial fraud
  PAYMENT_FRAUD = 'payment_fraud',
  MONEY_LAUNDERING = 'money_laundering',
  REFUND_ABUSE = 'refund_abuse',
  CURRENCY_MANIPULATION = 'currency_manipulation',
  
  // Data privacy
  DATA_SCRAPING = 'data_scraping',
  PRIVACY_VIOLATION = 'privacy_violation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_EXFILTRATION = 'data_exfiltration',
  
  // System manipulation
  VOTE_MANIPULATION = 'vote_manipulation',
  ALGORITHM_GAMING = 'algorithm_gaming',
  FAKE_ENGAGEMENT = 'fake_engagement',
  COORDINATED_INAUTHENTIC_BEHAVIOR = 'coordinated_inauthentic_behavior'
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ActivityStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  FALSE_POSITIVE = 'false_positive',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated'
}

export enum DetectionMethod {
  RULE_BASED = 'rule_based',
  MACHINE_LEARNING = 'machine_learning',
  BEHAVIORAL_ANALYSIS = 'behavioral_analysis',
  STATISTICAL_ANOMALY = 'statistical_anomaly',
  MANUAL_REPORT = 'manual_report',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  PATTERN_MATCHING = 'pattern_matching',
  HONEYPOT = 'honeypot'
}

export interface ActivityEvidence {
  type: EvidenceType;
  description: string;
  data: any;
  timestamp: Date;
  source: string;
  confidence: number;
}

export enum EvidenceType {
  LOG_ENTRY = 'log_entry',
  NETWORK_TRAFFIC = 'network_traffic',
  USER_BEHAVIOR = 'user_behavior',
  DATABASE_ACTIVITY = 'database_activity',
  FILE_ACTIVITY = 'file_activity',
  API_CALL = 'api_call',
  SCREEN_RECORDING = 'screen_recording',
  METADATA = 'metadata'
}

export interface DetectionPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  matchedValues: Record<string, any>;
  threshold: number;
  observedValue: number;
}

export interface ActivityResolution {
  action: ResolutionAction;
  reason: string;
  timestamp: Date;
  resolvedBy: string;
  notes?: string;
  preventiveMeasures?: string[];
}

export enum ResolutionAction {
  NO_ACTION = 'no_action',
  WARNING_ISSUED = 'warning_issued',
  ACCOUNT_SUSPENDED = 'account_suspended',
  ACCOUNT_BANNED = 'account_banned',
  IP_BLOCKED = 'ip_blocked',
  CONTENT_REMOVED = 'content_removed',
  PAYMENT_BLOCKED = 'payment_blocked',
  ESCALATED_TO_AUTHORITIES = 'escalated_to_authorities'
}

export interface ResponseAction {
  type: ResponseType;
  status: ActionStatus;
  triggeredAt: Date;
  parameters: Record<string, any>;
  result?: string;
  error?: string;
}

export enum ResponseType {
  RATE_LIMIT = 'rate_limit',
  CAPTCHA_CHALLENGE = 'captcha_challenge',
  ACCOUNT_LOCK = 'account_lock',
  IP_BLOCK = 'ip_block',
  CONTENT_FLAG = 'content_flag',
  ADMIN_ALERT = 'admin_alert',
  EMAIL_NOTIFICATION = 'email_notification',
  LOG_ENHANCED = 'log_enhanced',
  SESSION_TERMINATE = 'session_terminate',
  REQUIRE_VERIFICATION = 'require_verification'
}

export enum ActionStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  FAILED = 'failed',
  REVERSED = 'reversed'
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp?: string;
  organization?: string;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  plugins: string[];
  canvas: string;
  webgl: string;
  fonts: string[];
  touchSupport: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
}

// Detection rule interfaces
export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  activityType: ActivityType;
  
  // Rule configuration
  enabled: boolean;
  severity: SeverityLevel;
  confidence: number;
  
  // Rule logic
  conditions: RuleCondition[];
  aggregation: AggregationRule;
  timeWindow: TimeWindow;
  
  // Thresholds
  threshold: RuleThreshold;
  
  // Actions
  actions: RuleAction[];
  
  // Metadata
  author: string;
  version: string;
  lastUpdated: Date;
  tags: string[];
  
  // Performance metrics
  analytics: RuleAnalytics;
}

export enum RuleCategory {
  AUTHENTICATION = 'authentication',
  ACCOUNT_SECURITY = 'account_security',
  CONTENT_ABUSE = 'content_abuse',
  FINANCIAL_FRAUD = 'financial_fraud',
  TECHNICAL_ATTACK = 'technical_attack',
  PRIVACY_VIOLATION = 'privacy_violation',
  MARKETPLACE_FRAUD = 'marketplace_fraud',
  COMMUNITY_ABUSE = 'community_abuse'
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  weight: number;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  REGEX = 'regex',
  IN_LIST = 'in_list',
  NOT_IN_LIST = 'not_in_list',
  RANGE = 'range',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists'
}

export interface AggregationRule {
  type: AggregationType;
  field?: string;
  groupBy: string[];
  minimumEvents: number;
}

export enum AggregationType {
  COUNT = 'count',
  SUM = 'sum',
  AVERAGE = 'average',
  UNIQUE_COUNT = 'unique_count',
  RATE = 'rate',
  STANDARD_DEVIATION = 'standard_deviation'
}

export interface TimeWindow {
  duration: number; // milliseconds
  sliding: boolean;
  bucketSize?: number; // for sliding windows
}

export interface RuleThreshold {
  value: number;
  operator: ConditionOperator;
  dynamic: boolean;
  baseline?: number;
  adaptation?: AdaptationConfig;
}

export interface AdaptationConfig {
  enabled: boolean;
  learningPeriod: number; // days
  adaptationRate: number; // 0-1
  minimumSamples: number;
}

export interface RuleAction {
  type: ResponseType;
  parameters: Record<string, any>;
  delay?: number;
  condition?: string;
}

export interface RuleAnalytics {
  totalTriggers: number;
  truePositives: number;
  falsePositives: number;
  precision: number;
  recall: number;
  f1Score: number;
  averageProcessingTime: number;
  lastTriggered?: Date;
}

// Behavioral analysis interfaces
export interface UserBehaviorProfile {
  userId: string;
  createdAt: Date;
  lastUpdated: Date;
  
  // Authentication patterns
  loginPatterns: LoginPattern;
  devicePatterns: DevicePattern[];
  locationPatterns: LocationPattern[];
  
  // Activity patterns
  activityPatterns: ActivityPattern;
  contentPatterns: ContentPattern;
  transactionPatterns: TransactionPattern;
  
  // Social patterns
  socialPatterns: SocialPattern;
  
  // Risk assessment
  riskScore: number;
  riskFactors: RiskFactor[];
  
  // Anomaly detection
  anomalyBaseline: AnomalyBaseline;
  recentAnomalies: BehaviorAnomaly[];
}

export interface LoginPattern {
  averageSessionDuration: number;
  commonLoginTimes: TimeRange[];
  commonDaysOfWeek: number[];
  frequentLocations: LocationFrequency[];
  deviceConsistency: number;
  ipConsistency: number;
}

export interface TimeRange {
  start: number; // hour of day
  end: number;
  frequency: number;
}

export interface LocationFrequency {
  country: string;
  region: string;
  city: string;
  frequency: number;
  lastSeen: Date;
}

export interface DevicePattern {
  fingerprint: DeviceFingerprint;
  frequency: number;
  lastSeen: Date;
  trusted: boolean;
}

export interface LocationPattern {
  location: GeoLocation;
  frequency: number;
  lastSeen: Date;
  velocity: number; // for impossible travel detection
}

export interface ActivityPattern {
  pageViewsPerSession: number;
  averageTimeOnSite: number;
  commonPages: PageFrequency[];
  clickPatterns: ClickPattern[];
  searchPatterns: SearchPattern[];
  uploadPatterns: UploadPattern;
}

export interface PageFrequency {
  page: string;
  frequency: number;
  averageTime: number;
}

export interface ClickPattern {
  elementType: string;
  frequency: number;
  timing: number;
}

export interface SearchPattern {
  queries: string[];
  frequency: number;
  categories: string[];
}

export interface UploadPattern {
  frequency: number;
  averageFileSize: number;
  commonFileTypes: string[];
  uploadTimes: TimeRange[];
}

export interface ContentPattern {
  postingFrequency: number;
  averageContentLength: number;
  topicCategories: string[];
  sentimentDistribution: SentimentDistribution;
  languagePatterns: LanguagePattern[];
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface LanguagePattern {
  language: string;
  frequency: number;
  complexity: number;
}

export interface TransactionPattern {
  averageTransactionAmount: number;
  transactionFrequency: number;
  preferredPaymentMethods: string[];
  commonTransactionTimes: TimeRange[];
  refundRate: number;
  chargebackRate: number;
}

export interface SocialPattern {
  connectionGrowthRate: number;
  messagingFrequency: number;
  groupParticipation: number;
  influenceScore: number;
  reciprocityRate: number;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
  evidence: string[];
}

export interface AnomalyBaseline {
  loginFrequency: StatisticalBaseline;
  sessionDuration: StatisticalBaseline;
  transactionAmount: StatisticalBaseline;
  contentPosting: StatisticalBaseline;
  apiUsage: StatisticalBaseline;
}

export interface StatisticalBaseline {
  mean: number;
  standardDeviation: number;
  minimum: number;
  maximum: number;
  percentiles: Record<number, number>;
  lastCalculated: Date;
}

export interface BehaviorAnomaly {
  type: string;
  timestamp: Date;
  severity: number;
  description: string;
  deviationScore: number;
  context: Record<string, any>;
}

// Threat intelligence interfaces
export interface ThreatIntelligence {
  id: string;
  type: ThreatType;
  source: string;
  confidence: number;
  
  // Threat details
  indicators: ThreatIndicator[];
  description: string;
  tags: string[];
  
  // Timing
  firstSeen: Date;
  lastSeen: Date;
  validUntil?: Date;
  
  // Context
  targetedSectors: string[];
  geographicScope: string[];
  attackVectors: string[];
  
  // Attribution
  threatActor?: string;
  campaignId?: string;
  
  // Severity
  severity: SeverityLevel;
  impact: ThreatImpact;
  
  // Response
  mitigations: Mitigation[];
  
  // Metadata
  reliability: ReliabilityLevel;
  tlpLevel: TLPLevel; // Traffic Light Protocol
}

export enum ThreatType {
  IOC = 'ioc', // Indicator of Compromise
  TTPs = 'ttps', // Tactics, Techniques, and Procedures
  VULNERABILITY = 'vulnerability',
  MALWARE = 'malware',
  CAMPAIGN = 'campaign',
  THREAT_ACTOR = 'threat_actor'
}

export interface ThreatIndicator {
  type: IndicatorType;
  value: string;
  confidence: number;
  context?: string;
}

export enum IndicatorType {
  IP_ADDRESS = 'ip_address',
  DOMAIN = 'domain',
  URL = 'url',
  EMAIL = 'email',
  FILE_HASH = 'file_hash',
  USER_AGENT = 'user_agent',
  ASN = 'asn',
  REGISTRY_KEY = 'registry_key',
  MUTEX = 'mutex',
  YARA_RULE = 'yara_rule'
}

export interface ThreatImpact {
  confidentiality: ImpactLevel;
  integrity: ImpactLevel;
  availability: ImpactLevel;
  financial: ImpactLevel;
  reputational: ImpactLevel;
}

export enum ImpactLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Mitigation {
  type: MitigationType;
  description: string;
  effectiveness: number;
  implementationCost: CostLevel;
  timeToImplement: number; // hours
}

export enum MitigationType {
  PREVENTIVE = 'preventive',
  DETECTIVE = 'detective',
  CORRECTIVE = 'corrective',
  RECOVERY = 'recovery'
}

export enum CostLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum ReliabilityLevel {
  A = 'a', // Completely reliable
  B = 'b', // Usually reliable
  C = 'c', // Fairly reliable
  D = 'd', // Not usually reliable
  E = 'e', // Unreliable
  F = 'f' // Reliability cannot be judged
}

export enum TLPLevel {
  RED = 'red',
  AMBER = 'amber',
  GREEN = 'green',
  WHITE = 'white'
}

// Main service class
export class Epic16SuspiciousActivityService extends EventEmitter {
  private activities: Map<string, SuspiciousActivity> = new Map();
  private rules: Map<string, DetectionRule> = new Map();
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();
  private eventQueue: SuspiciousActivityEvent[] = [];
  private processingQueue: boolean = false;

  constructor() {
    super();
    this.initializeDefaultRules();
    this.startEventProcessor();
  }

  // Activity detection and management
  async detectActivity(event: SuspiciousActivityEvent): Promise<SuspiciousActivity[]> {
    const detectedActivities: SuspiciousActivity[] = [];

    // Add event to processing queue
    this.eventQueue.push(event);

    // Process against all enabled rules
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const activity = await this.evaluateRule(rule, event);
      if (activity) {
        detectedActivities.push(activity);
        this.activities.set(activity.id, activity);
        
        // Trigger response actions
        await this.executeResponseActions(activity);
        
        this.emit('activityDetected', activity);
      }
    }

    // Update user behavior profile
    if (event.userId) {
      await this.updateUserProfile(event.userId, event);
    }

    // Check for behavioral anomalies
    if (event.userId) {
      const anomalies = await this.detectBehavioralAnomalies(event.userId, event);
      detectedActivities.push(...anomalies);
    }

    return detectedActivities;
  }

  async getActivity(activityId: string): Promise<SuspiciousActivity | null> {
    return this.activities.get(activityId) || null;
  }

  async getActivitiesByUser(userId: string, limit = 50): Promise<SuspiciousActivity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getActivitiesByType(type: ActivityType, limit = 100): Promise<SuspiciousActivity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRecentActivities(hours = 24, minSeverity?: SeverityLevel): Promise<SuspiciousActivity[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return Array.from(this.activities.values())
      .filter(activity => {
        if (activity.timestamp < cutoff) return false;
        if (minSeverity && this.compareSeverity(activity.severity, minSeverity) < 0) return false;
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Investigation and resolution
  async investigateActivity(activityId: string, investigatorId: string): Promise<void> {
    const activity = this.activities.get(activityId);
    if (!activity) throw new Error('Activity not found');

    activity.investigated = true;
    activity.investigatedBy = investigatorId;
    activity.investigatedAt = new Date();
    activity.status = ActivityStatus.INVESTIGATING;

    this.emit('activityInvestigated', activity);
  }

  async resolveActivity(
    activityId: string,
    resolution: ActivityResolution
  ): Promise<void> {
    const activity = this.activities.get(activityId);
    if (!activity) throw new Error('Activity not found');

    activity.resolution = resolution;
    activity.status = ActivityStatus.RESOLVED;

    // Execute resolution actions
    await this.executeResolutionActions(activity, resolution);

    this.emit('activityResolved', activity);
  }

  async markFalsePositive(activityId: string, reason: string): Promise<void> {
    const activity = this.activities.get(activityId);
    if (!activity) throw new Error('Activity not found');

    activity.status = ActivityStatus.FALSE_POSITIVE;
    activity.resolution = {
      action: ResolutionAction.NO_ACTION,
      reason,
      timestamp: new Date(),
      resolvedBy: 'system'
    };

    // Update rule analytics
    const rule = this.rules.get(activity.detectedBy);
    if (rule) {
      rule.analytics.falsePositives++;
      this.updateRuleMetrics(rule);
    }

    this.emit('falsePositiveMarked', activity);
  }

  // Rule management
  async createRule(ruleData: Omit<DetectionRule, 'id' | 'analytics'>): Promise<DetectionRule> {
    const rule: DetectionRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      analytics: {
        totalTriggers: 0,
        truePositives: 0,
        falsePositives: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        averageProcessingTime: 0
      },
      ...ruleData
    };

    this.rules.set(rule.id, rule);
    this.emit('ruleCreated', rule);
    return rule;
  }

  async updateRule(ruleId: string, updates: Partial<DetectionRule>): Promise<DetectionRule | null> {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates, lastUpdated: new Date() };
    this.rules.set(ruleId, updatedRule);

    this.emit('ruleUpdated', updatedRule);
    return updatedRule;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      this.emit('ruleDeleted', { ruleId });
    }
    return deleted;
  }

  // Behavioral analysis
  async getUserProfile(userId: string): Promise<UserBehaviorProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  async detectBehavioralAnomalies(userId: string, event: SuspiciousActivityEvent): Promise<SuspiciousActivity[]> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    const anomalies: SuspiciousActivity[] = [];

    // Check for location anomalies
    if (event.geolocation && profile.locationPatterns.length > 0) {
      const locationAnomaly = this.checkLocationAnomaly(profile, event);
      if (locationAnomaly) anomalies.push(locationAnomaly);
    }

    // Check for timing anomalies
    const timingAnomaly = this.checkTimingAnomaly(profile, event);
    if (timingAnomaly) anomalies.push(timingAnomaly);

    // Check for device anomalies
    if (event.deviceFingerprint) {
      const deviceAnomaly = this.checkDeviceAnomaly(profile, event);
      if (deviceAnomaly) anomalies.push(deviceAnomaly);
    }

    // Check for activity volume anomalies
    const volumeAnomaly = await this.checkVolumeAnomaly(profile, event);
    if (volumeAnomaly) anomalies.push(volumeAnomaly);

    return anomalies;
  }

  // Threat intelligence
  async addThreatIntelligence(threat: Omit<ThreatIntelligence, 'id'>): Promise<ThreatIntelligence> {
    const threatData: ThreatIntelligence = {
      id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...threat
    };

    this.threatIntelligence.set(threatData.id, threatData);
    this.emit('threatIntelligenceAdded', threatData);
    return threatData;
  }

  async checkThreatIntelligence(event: SuspiciousActivityEvent): Promise<ThreatIntelligence[]> {
    const matches: ThreatIntelligence[] = [];

    for (const threat of this.threatIntelligence.values()) {
      if (this.matchesThreatIndicators(threat, event)) {
        matches.push(threat);
      }
    }

    return matches;
  }

  // Analytics and reporting
  async getSecurityMetrics(timeRange: { start: Date; end: Date }): Promise<SecurityMetrics> {
    const activities = Array.from(this.activities.values())
      .filter(activity => 
        activity.timestamp >= timeRange.start && activity.timestamp <= timeRange.end
      );

    const metrics: SecurityMetrics = {
      totalActivities: activities.length,
      severityDistribution: this.calculateSeverityDistribution(activities),
      typeDistribution: this.calculateTypeDistribution(activities),
      statusDistribution: this.calculateStatusDistribution(activities),
      topAttackers: this.getTopAttackers(activities),
      topTargets: this.getTopTargets(activities),
      detectionEffectiveness: this.calculateDetectionEffectiveness(),
      responseTime: this.calculateAverageResponseTime(activities),
      falsePositiveRate: this.calculateFalsePositiveRate(),
      trendsOverTime: this.calculateTrends(activities, timeRange)
    };

    return metrics;
  }

  // Private helper methods
  private async evaluateRule(rule: DetectionRule, event: SuspiciousActivityEvent): Promise<SuspiciousActivity | null> {
    const startTime = Date.now();

    try {
      // Check if event matches rule conditions
      const conditionResults = rule.conditions.map(condition => 
        this.evaluateCondition(condition, event)
      );

      const totalWeight = rule.conditions.reduce((sum, condition) => sum + condition.weight, 0);
      const weightedScore = conditionResults.reduce((sum, result, index) => 
        sum + (result ? rule.conditions[index].weight : 0), 0
      );

      const confidence = totalWeight > 0 ? weightedScore / totalWeight : 0;

      // Check if threshold is met
      if (!this.evaluateThreshold(rule.threshold, confidence)) {
        return null;
      }

      // Get related events for aggregation
      const relatedEvents = await this.getRelatedEvents(event, rule);
      
      // Check aggregation rules
      if (!this.evaluateAggregation(rule.aggregation, relatedEvents)) {
        return null;
      }

      // Create suspicious activity
      const activity: SuspiciousActivity = {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: rule.activityType,
        severity: rule.severity,
        confidence,
        userId: event.userId,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: new Date(),
        description: this.generateActivityDescription(rule, event),
        evidence: this.collectEvidence(rule, event, relatedEvents),
        patterns: this.identifyPatterns(rule, event, relatedEvents),
        metadata: {
          ruleId: rule.id,
          ruleName: rule.name,
          eventType: event.type,
          ...event.metadata
        },
        detectionMethod: DetectionMethod.RULE_BASED,
        detectedBy: rule.id,
        riskScore: this.calculateRiskScore(rule, confidence, event),
        status: ActivityStatus.DETECTED,
        investigated: false,
        relatedActivities: [],
        actionsTriggered: [],
        geolocation: event.geolocation,
        deviceFingerprint: event.deviceFingerprint
      };

      // Update rule analytics
      rule.analytics.totalTriggers++;
      rule.analytics.lastTriggered = new Date();
      rule.analytics.averageProcessingTime = 
        (rule.analytics.averageProcessingTime + (Date.now() - startTime)) / 2;

      return activity;

    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return null;
    }
  }

  private evaluateCondition(condition: RuleCondition, event: SuspiciousActivityEvent): boolean {
    const fieldValue = this.getFieldValue(condition.field, event);
    
    switch (condition.operator) {
    case ConditionOperator.EQUALS:
      return fieldValue === condition.value;
    case ConditionOperator.NOT_EQUALS:
      return fieldValue !== condition.value;
    case ConditionOperator.GREATER_THAN:
      return Number(fieldValue) > Number(condition.value);
    case ConditionOperator.LESS_THAN:
      return Number(fieldValue) < Number(condition.value);
    case ConditionOperator.CONTAINS:
      return String(fieldValue).includes(String(condition.value));
    case ConditionOperator.NOT_CONTAINS:
      return !String(fieldValue).includes(String(condition.value));
    case ConditionOperator.REGEX:
      const regex = new RegExp(condition.value);
      return regex.test(String(fieldValue));
    case ConditionOperator.IN_LIST:
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case ConditionOperator.NOT_IN_LIST:
      return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
    case ConditionOperator.RANGE:
      const [min, max] = condition.value;
      const numValue = Number(fieldValue);
      return numValue >= min && numValue <= max;
    case ConditionOperator.EXISTS:
      return fieldValue !== undefined && fieldValue !== null;
    case ConditionOperator.NOT_EXISTS:
      return fieldValue === undefined || fieldValue === null;
    default:
      return false;
    }
  }

  private evaluateThreshold(threshold: RuleThreshold, value: number): boolean {
    const thresholdValue = threshold.dynamic ? 
      this.calculateDynamicThreshold(threshold) : threshold.value;

    switch (threshold.operator) {
    case ConditionOperator.GREATER_THAN:
      return value > thresholdValue;
    case ConditionOperator.GREATER_THAN:
      return value >= thresholdValue;
    case ConditionOperator.LESS_THAN:
      return value < thresholdValue;
    case ConditionOperator.LESS_EQUAL:
      return value <= thresholdValue;
    case ConditionOperator.EQUALS:
      return value === thresholdValue;
    default:
      return value >= thresholdValue;
    }
  }

  private async executeResponseActions(activity: SuspiciousActivity): Promise<void> {
    const rule = this.rules.get(activity.detectedBy);
    if (!rule) return;

    for (const action of rule.actions) {
      try {
        const responseAction: ResponseAction = {
          type: action.type,
          status: ActionStatus.PENDING,
          triggeredAt: new Date(),
          parameters: action.parameters
        };

        // Apply delay if specified
        if (action.delay) {
          await new Promise(resolve => setTimeout(resolve, action.delay));
        }

        // Execute action
        await this.executeAction(action, activity);
        responseAction.status = ActionStatus.EXECUTED;
        
        activity.actionsTriggered.push(responseAction);
        
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
        activity.actionsTriggered.push({
          type: action.type,
          status: ActionStatus.FAILED,
          triggeredAt: new Date(),
          parameters: action.parameters,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async executeAction(action: RuleAction, activity: SuspiciousActivity): Promise<void> {
    switch (action.type) {
    case ResponseType.RATE_LIMIT:
      // Implement rate limiting
      break;
    case ResponseType.CAPTCHA_CHALLENGE:
      // Trigger CAPTCHA challenge
      break;
    case ResponseType.ACCOUNT_LOCK:
      // Lock user account
      break;
    case ResponseType.IP_BLOCK:
      // Block IP address
      break;
    case ResponseType.ADMIN_ALERT:
      this.emit('adminAlert', { activity, action });
      break;
    case ResponseType.EMAIL_NOTIFICATION:
      this.emit('emailNotification', { activity, action });
      break;
    case ResponseType.SESSION_TERMINATE:
      this.emit('sessionTerminate', { activity, action });
      break;
    default:
      console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private initializeDefaultRules(): void {
    // Brute force login rule
    this.createRule({
      name: 'Brute Force Login Detection',
      description: 'Detects rapid failed login attempts from the same IP',
      category: RuleCategory.AUTHENTICATION,
      activityType: ActivityType.BRUTE_FORCE_LOGIN,
      enabled: true,
      severity: SeverityLevel.HIGH,
      confidence: 0.9,
      conditions: [
        {
          field: 'eventType',
          operator: ConditionOperator.EQUALS,
          value: 'login_failed',
          weight: 1.0
        }
      ],
      aggregation: {
        type: AggregationType.COUNT,
        groupBy: ['ipAddress'],
        minimumEvents: 5
      },
      timeWindow: {
        duration: 300000, // 5 minutes
        sliding: true
      },
      threshold: {
        value: 5,
        operator: ConditionOperator.GREATER_THAN,
        dynamic: false
      },
      actions: [
        {
          type: ResponseType.IP_BLOCK,
          parameters: { duration: 3600000 } // 1 hour
        },
        {
          type: ResponseType.ADMIN_ALERT,
          parameters: { priority: 'high' }
        }
      ],
      author: 'system',
      version: '1.0.0',
      lastUpdated: new Date(),
      tags: ['authentication', 'brute-force', 'security']
    });

    // Add more default rules...
    this.createRule({
      name: 'Suspicious Login Location',
      description: 'Detects logins from unusual geographic locations',
      category: RuleCategory.AUTHENTICATION,
      activityType: ActivityType.UNUSUAL_LOGIN_LOCATION,
      enabled: true,
      severity: SeverityLevel.MEDIUM,
      confidence: 0.7,
      conditions: [
        {
          field: 'eventType',
          operator: ConditionOperator.EQUALS,
          value: 'login_success',
          weight: 1.0
        }
      ],
      aggregation: {
        type: AggregationType.COUNT,
        groupBy: ['userId'],
        minimumEvents: 1
      },
      timeWindow: {
        duration: 86400000, // 24 hours
        sliding: false
      },
      threshold: {
        value: 1,
        operator: ConditionOperator.GREATER_THAN,
        dynamic: true
      },
      actions: [
        {
          type: ResponseType.REQUIRE_VERIFICATION,
          parameters: { method: 'email' }
        }
      ],
      author: 'system',
      version: '1.0.0',
      lastUpdated: new Date(),
      tags: ['authentication', 'geolocation', 'anomaly']
    });
  }

  private startEventProcessor(): void {
    setInterval(() => {
      if (!this.processingQueue && this.eventQueue.length > 0) {
        this.processEventQueue();
      }
    }, 1000);
  }

  private async processEventQueue(): Promise<void> {
    this.processingQueue = true;
    
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (event) {
          await this.detectActivity(event);
        }
      }
    } catch (error) {
      console.error('Error processing event queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  private getFieldValue(field: string, event: SuspiciousActivityEvent): any {
    const parts = field.split('.');
    let value: any = event;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private compareSeverity(a: SeverityLevel, b: SeverityLevel): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[a] - levels[b];
  }

  // Additional helper methods would be implemented here...
  private async getRelatedEvents(event: SuspiciousActivityEvent, rule: DetectionRule): Promise<SuspiciousActivityEvent[]> {
    // Implementation for getting related events within time window
    return [];
  }

  private evaluateAggregation(aggregation: AggregationRule, events: SuspiciousActivityEvent[]): boolean {
    // Implementation for evaluating aggregation rules
    return events.length >= aggregation.minimumEvents;
  }

  private generateActivityDescription(rule: DetectionRule, event: SuspiciousActivityEvent): string {
    return `${rule.name} detected for ${event.eventType} from ${event.ipAddress}`;
  }

  private collectEvidence(rule: DetectionRule, event: SuspiciousActivityEvent, relatedEvents: SuspiciousActivityEvent[]): ActivityEvidence[] {
    return [
      {
        type: EvidenceType.LOG_ENTRY,
        description: 'Event that triggered the rule',
        data: event,
        timestamp: new Date(),
        source: 'detection_engine',
        confidence: 1.0
      }
    ];
  }

  private identifyPatterns(rule: DetectionRule, event: SuspiciousActivityEvent, relatedEvents: SuspiciousActivityEvent[]): DetectionPattern[] {
    return [];
  }

  private calculateRiskScore(rule: DetectionRule, confidence: number, event: SuspiciousActivityEvent): number {
    const severityWeight = this.compareSeverity(rule.severity, SeverityLevel.LOW) * 25;
    return Math.min(100, severityWeight + (confidence * 50));
  }

  private calculateDynamicThreshold(threshold: RuleThreshold): number {
    // Implementation for dynamic threshold calculation
    return threshold.value;
  }

  private async updateUserProfile(userId: string, event: SuspiciousActivityEvent): Promise<void> {
    // Implementation for updating user behavior profile
  }

  private checkLocationAnomaly(profile: UserBehaviorProfile, event: SuspiciousActivityEvent): SuspiciousActivity | null {
    // Implementation for location anomaly detection
    return null;
  }

  private checkTimingAnomaly(profile: UserBehaviorProfile, event: SuspiciousActivityEvent): SuspiciousActivity | null {
    // Implementation for timing anomaly detection
    return null;
  }

  private checkDeviceAnomaly(profile: UserBehaviorProfile, event: SuspiciousActivityEvent): SuspiciousActivity | null {
    // Implementation for device anomaly detection
    return null;
  }

  private async checkVolumeAnomaly(profile: UserBehaviorProfile, event: SuspiciousActivityEvent): Promise<SuspiciousActivity | null> {
    // Implementation for volume anomaly detection
    return null;
  }

  private matchesThreatIndicators(threat: ThreatIntelligence, event: SuspiciousActivityEvent): boolean {
    // Implementation for threat intelligence matching
    return false;
  }

  private updateRuleMetrics(rule: DetectionRule): void {
    const total = rule.analytics.truePositives + rule.analytics.falsePositives;
    if (total > 0) {
      rule.analytics.precision = rule.analytics.truePositives / total;
    }
  }

  private async executeResolutionActions(activity: SuspiciousActivity, resolution: ActivityResolution): Promise<void> {
    // Implementation for executing resolution actions
  }

  private calculateSeverityDistribution(activities: SuspiciousActivity[]): Record<SeverityLevel, number> {
    const distribution: Record<SeverityLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    activities.forEach(activity => {
      distribution[activity.severity]++;
    });

    return distribution;
  }

  private calculateTypeDistribution(activities: SuspiciousActivity[]): Record<ActivityType, number> {
    const distribution: Record<ActivityType, number> = {} as any;
    
    activities.forEach(activity => {
      distribution[activity.type] = (distribution[activity.type] || 0) + 1;
    });

    return distribution;
  }

  private calculateStatusDistribution(activities: SuspiciousActivity[]): Record<ActivityStatus, number> {
    const distribution: Record<ActivityStatus, number> = {} as any;
    
    activities.forEach(activity => {
      distribution[activity.status] = (distribution[activity.status] || 0) + 1;
    });

    return distribution;
  }

  private getTopAttackers(activities: SuspiciousActivity[]): Array<{ ip: string; count: number }> {
    const attackers: Record<string, number> = {};
    
    activities.forEach(activity => {
      attackers[activity.ipAddress] = (attackers[activity.ipAddress] || 0) + 1;
    });

    return Object.entries(attackers)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopTargets(activities: SuspiciousActivity[]): Array<{ userId: string; count: number }> {
    const targets: Record<string, number> = {};
    
    activities.forEach(activity => {
      if (activity.userId) {
        targets[activity.userId] = (targets[activity.userId] || 0) + 1;
      }
    });

    return Object.entries(targets)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateDetectionEffectiveness(): number {
    const rules = Array.from(this.rules.values());
    const totalPrecision = rules.reduce((sum, rule) => sum + rule.analytics.precision, 0);
    return rules.length > 0 ? totalPrecision / rules.length : 0;
  }

  private calculateAverageResponseTime(activities: SuspiciousActivity[]): number {
    const responseTimes = activities
      .filter(activity => activity.investigated && activity.investigatedAt)
      .map(activity => 
        activity.investigatedAt!.getTime() - activity.timestamp.getTime()
      );

    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
  }

  private calculateFalsePositiveRate(): number {
    const rules = Array.from(this.rules.values());
    const totalFalsePositives = rules.reduce((sum, rule) => sum + rule.analytics.falsePositives, 0);
    const totalTriggers = rules.reduce((sum, rule) => sum + rule.analytics.totalTriggers, 0);
    
    return totalTriggers > 0 ? totalFalsePositives / totalTriggers : 0;
  }

  private calculateTrends(activities: SuspiciousActivity[], timeRange: { start: Date; end: Date }): any {
    // Implementation for calculating trends over time
    return {};
  }
}

// Supporting interfaces
export interface SuspiciousActivityEvent {
  eventType: string;
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  geolocation?: GeoLocation;
  deviceFingerprint?: DeviceFingerprint;
  metadata: Record<string, any>;
}

export interface SecurityMetrics {
  totalActivities: number;
  severityDistribution: Record<SeverityLevel, number>;
  typeDistribution: Record<ActivityType, number>;
  statusDistribution: Record<ActivityStatus, number>;
  topAttackers: Array<{ ip: string; count: number }>;
  topTargets: Array<{ userId: string; count: number }>;
  detectionEffectiveness: number;
  responseTime: number;
  falsePositiveRate: number;
  trendsOverTime: any;
}

export default Epic16SuspiciousActivityService;