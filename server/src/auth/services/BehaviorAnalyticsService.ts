/**
 * Behavior Analytics Service - Epic 19 Security Implementation
 * Advanced user behavior analysis and anomaly detection system
 */

import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { AuditService } from './AuditService';

export interface BehaviorAnalyticsConfig {
  // Analysis parameters
  baselineWindowDays: number; // Days to establish baseline behavior
  anomalyThreshold: number; // 0-1 scale for anomaly detection
  updateFrequencyMinutes: number; // How often to update profiles
  
  // Pattern detection
  enablePatternDetection: boolean;
  patternTypes: BehaviorPatternType[];
  minimumDataPoints: number; // Min data points for pattern detection
  
  // Machine learning
  enableMLAnalysis: boolean;
  modelUpdateFrequencyHours: number;
  
  // Risk scoring
  riskWeights: {
    timeAnomaly: number;
    sequenceAnomaly: number;
    volumeAnomaly: number;
    velocityAnomaly: number;
    patternDeviation: number;
  };
  
  // Response configuration
  autoBlockThreshold: number; // Risk score to auto-block
  alertThreshold: number; // Risk score to alert
  requireManualReview: boolean;
}

export type BehaviorPatternType = 
  | 'login_time' 
  | 'action_sequence' 
  | 'resource_access' 
  | 'session_duration'
  | 'interaction_velocity'
  | 'feature_usage'
  | 'navigation_flow';

export interface UserBehaviorProfile {
  userId: string;
  baseline: BehaviorBaseline;
  patterns: BehaviorPattern[];
  anomalies: BehaviorAnomaly[];
  riskScore: number;
  lastUpdated: Date;
  profileConfidence: number; // 0-1 scale
  dataPoints: number;
  status: 'learning' | 'established' | 'suspicious' | 'blocked';
}

export interface BehaviorBaseline {
  // Temporal patterns
  typicalLoginTimes: TimeWindow[];
  typicalSessionDuration: { mean: number; stdDev: number };
  typicalActivityHours: number[]; // 0-23 hours
  weekdayVsWeekendRatio: number;
  
  // Activity patterns
  typicalActionsPerSession: { mean: number; stdDev: number };
  commonActionSequences: ActionSequence[];
  typicalResourcesAccessed: ResourceAccess[];
  
  // Interaction patterns
  averageClickVelocity: number; // clicks per minute
  averageScrollVelocity: number; // pixels per second
  typicalIdleTime: { mean: number; stdDev: number };
  keyboardToMouseRatio: number;
  
  // Feature usage
  featureUsageDistribution: Map<string, number>;
  navigationPaths: NavigationPath[];
  errorRate: number;
  retryPatterns: RetryPattern[];
}

export interface BehaviorPattern {
  id: string;
  type: BehaviorPatternType;
  description: string;
  frequency: number;
  lastOccurrence: Date;
  confidence: number;
  metadata: Record<string, any>;
}

export interface BehaviorAnomaly {
  id: string;
  timestamp: Date;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  deviationScore: number; // How far from baseline
  affectedMetrics: string[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export type AnomalyType = 
  | 'unusual_login_time'
  | 'abnormal_session_duration'
  | 'suspicious_action_sequence'
  | 'velocity_anomaly'
  | 'resource_access_anomaly'
  | 'pattern_deviation'
  | 'volume_spike'
  | 'bot_like_behavior';

export interface TimeWindow {
  startHour: number;
  endHour: number;
  dayOfWeek: number; // 0-6
  probability: number;
}

export interface ActionSequence {
  actions: string[];
  frequency: number;
  averageTimeBetween: number[]; // ms between each action
}

export interface ResourceAccess {
  resourceType: string;
  resourceId: string;
  frequency: number;
  averageAccessDuration: number;
}

export interface NavigationPath {
  path: string[];
  frequency: number;
  averageDuration: number;
}

export interface RetryPattern {
  action: string;
  averageRetries: number;
  successRate: number;
}

export interface BehaviorAnalysisResult {
  userId: string;
  timestamp: Date;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  anomalies: BehaviorAnomaly[];
  recommendation: 'allow' | 'monitor' | 'challenge' | 'block';
  confidence: number; // 0-1
  reasoning: string[];
}

export interface SessionBehaviorData {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  actions: UserAction[];
  resources: ResourceAccessLog[];
  interactions: InteractionEvent[];
  errors: ErrorEvent[];
}

export interface UserAction {
  timestamp: Date;
  action: string;
  category: string;
  metadata?: Record<string, any>;
  duration?: number;
  success: boolean;
}

export interface ResourceAccessLog {
  timestamp: Date;
  resourceType: string;
  resourceId: string;
  action: 'view' | 'edit' | 'delete' | 'create';
  duration: number;
}

export interface InteractionEvent {
  timestamp: Date;
  type: 'click' | 'scroll' | 'keypress' | 'focus' | 'blur';
  target?: string;
  metadata?: Record<string, any>;
}

export interface ErrorEvent {
  timestamp: Date;
  errorType: string;
  errorMessage: string;
  context: string;
  resolved: boolean;
}

export class BehaviorAnalyticsService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: BehaviorAnalyticsConfig;
  private updateInterval?: NodeJS.Timeout;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config?: Partial<BehaviorAnalyticsConfig>
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = {
      baselineWindowDays: 30,
      anomalyThreshold: 0.8,
      updateFrequencyMinutes: 60,
      enablePatternDetection: true,
      patternTypes: ['login_time', 'action_sequence', 'resource_access', 'session_duration'],
      minimumDataPoints: 20,
      enableMLAnalysis: false, // Can be enabled with proper ML models
      modelUpdateFrequencyHours: 24,
      riskWeights: {
        timeAnomaly: 0.2,
        sequenceAnomaly: 1.2,
        volumeAnomaly: 0.15,
        velocityAnomaly: 0.2,
        patternDeviation: 0.2
      },
      autoBlockThreshold: 85,
      alertThreshold: 65,
      requireManualReview: true,
      ...config
    };
  }

  /**
   * Initialize the behavior analytics service
   */
  async initialize(): Promise<void> {
    await this.initializeSchema();
    
    // Start periodic profile updates
    if (this.config.updateFrequencyMinutes > 0) {
      this.updateInterval = setInterval(
        () => this.updateAllProfiles(),
        this.config.updateFrequencyMinutes * 60 * 1000
      );
    }
  }

  /**
   * Analyze user behavior for anomalies
   */
  async analyzeBehavior(
    userId: string,
    sessionData: SessionBehaviorData
  ): Promise<BehaviorAnalysisResult> {
    try {
      // Get or create user profile
      const profile = await this.getUserBehaviorProfile(userId);
      
      // Check if we have enough data for analysis
      if (profile.status === 'learning' && profile.dataPoints < this.config.minimumDataPoints) {
        // Still learning, just record the data
        await this.recordSessionBehavior(sessionData);
        return this.createLearningModeResult(userId);
      }

      // Analyze current session against baseline
      const anomalies = await this.detectAnomalies(sessionData, profile);
      
      // Calculate risk score
      const riskScore = this.calculateRiskScore(anomalies, profile);
      
      // Update profile with new data
      await this.updateUserProfile(userId, sessionData, anomalies);
      
      // Determine action
      const recommendation = this.determineRecommendation(riskScore, anomalies);
      
      // Log analysis result
      await this.logAnalysisResult(userId, riskScore, anomalies, recommendation);
      
      return {
        userId,
        timestamp: new Date(),
        riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        anomalies,
        recommendation,
        confidence: profile.profileConfidence,
        reasoning: this.generateReasoning(anomalies, riskScore)
      };

    } catch (error) {
      console.error('Error analyzing behavior:', error);
      throw new Error('Failed to analyze user behavior');
    }
  }

  /**
   * Detect anomalies in current session
   */
  private async detectAnomalies(
    sessionData: SessionBehaviorData,
    profile: UserBehaviorProfile
  ): Promise<BehaviorAnomaly[]> {
    const anomalies: BehaviorAnomaly[] = [];
    
    // Time-based anomalies
    const timeAnomalies = this.detectTimeAnomalies(sessionData, profile.baseline);
    anomalies.push(...timeAnomalies);
    
    // Action sequence anomalies
    const sequenceAnomalies = this.detectSequenceAnomalies(sessionData, profile.baseline);
    anomalies.push(...sequenceAnomalies);
    
    // Volume anomalies
    const volumeAnomalies = this.detectVolumeAnomalies(sessionData, profile.baseline);
    anomalies.push(...volumeAnomalies);
    
    // Velocity anomalies
    const velocityAnomalies = this.detectVelocityAnomalies(sessionData, profile.baseline);
    anomalies.push(...velocityAnomalies);
    
    // Pattern deviation
    if (this.config.enablePatternDetection) {
      const patternAnomalies = await this.detectPatternDeviations(sessionData, profile);
      anomalies.push(...patternAnomalies);
    }
    
    // Bot-like behavior detection
    const botAnomalies = this.detectBotBehavior(sessionData);
    anomalies.push(...botAnomalies);
    
    return anomalies;
  }

  /**
   * Detect time-based anomalies
   */
  private detectTimeAnomalies(
    sessionData: SessionBehaviorData,
    baseline: BehaviorBaseline
  ): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];
    const loginHour = sessionData.startTime.getHours();
    const dayOfWeek = sessionData.startTime.getDay();
    
    // Check if login time is unusual
    const isTypicalTime = baseline.typicalLoginTimes.some(window => 
      window.dayOfWeek === dayOfWeek &&
      loginHour >= window.startHour &&
      loginHour <= window.endHour &&
      window.probability > 0.1
    );
    
    if (!isTypicalTime) {
      anomalies.push({
        id: `anomaly-${Date.now()}-time`,
        timestamp: new Date(),
        type: 'unusual_login_time',
        severity: this.getTimeSeverity(loginHour, baseline.typicalActivityHours),
        description: `Login at unusual time: ${loginHour}:00`,
        deviationScore: this.calculateTimeDeviation(loginHour, baseline.typicalActivityHours),
        affectedMetrics: ['login_time'],
        resolved: false
      });
    }
    
    // Check session duration
    if (sessionData.endTime) {
      const duration = sessionData.endTime.getTime() - sessionData.startTime.getTime();
      const durationMinutes = duration / (1000 * 60);
      const deviation = Math.abs(durationMinutes - baseline.typicalSessionDuration.mean);
      const zScore = deviation / baseline.typicalSessionDuration.stdDev;
      
      if (zScore > 3) { // More than 3 standard deviations
        anomalies.push({
          id: `anomaly-${Date.now()}-duration`,
          timestamp: new Date(),
          type: 'abnormal_session_duration',
          severity: zScore > 4 ? 'high' : 'medium',
          description: `Abnormal session duration: ${durationMinutes.toFixed(0)} minutes`,
          deviationScore: zScore,
          affectedMetrics: ['session_duration'],
          resolved: false
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Detect action sequence anomalies
   */
  private detectSequenceAnomalies(
    sessionData: SessionBehaviorData,
    baseline: BehaviorBaseline
  ): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];
    const sessionActions = sessionData.actions.map(a => a.action);
    
    // Check for known suspicious sequences
    const suspiciousSequences = [
      ['login', 'export', 'logout'], // Quick data exfiltration
      ['settings', 'delete', 'delete', 'delete'], // Mass deletion
      ['admin', 'create', 'admin', 'create'] // Privilege escalation
    ];
    
    for (const suspicious of suspiciousSequences) {
      if (this.containsSequence(sessionActions, suspicious)) {
        anomalies.push({
          id: `anomaly-${Date.now()}-sequence`,
          timestamp: new Date(),
          type: 'suspicious_action_sequence',
          severity: 'high',
          description: `Suspicious action sequence detected: ${suspicious.join(' -> ')}`,
          deviationScore: 1.0,
          affectedMetrics: ['action_sequence'],
          resolved: false
        });
      }
    }
    
    // Check if sequences match baseline patterns
    const matchesBaseline = baseline.commonActionSequences.some(seq => 
      this.sequenceSimilarity(sessionActions, seq.actions) > 0.7
    );
    
    if (!matchesBaseline && sessionActions.length > 5) {
      anomalies.push({
        id: `anomaly-${Date.now()}-pattern`,
        timestamp: new Date(),
        type: 'pattern_deviation',
        severity: 'medium',
        description: 'Action sequence doesn\'t match typical patterns',
        deviationScore: 0.8,
        affectedMetrics: ['action_sequence'],
        resolved: false
      });
    }
    
    return anomalies;
  }

  /**
   * Detect volume anomalies
   */
  private detectVolumeAnomalies(
    sessionData: SessionBehaviorData,
    baseline: BehaviorBaseline
  ): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];
    const actionCount = sessionData.actions.length;
    
    // Check action volume
    const deviation = Math.abs(actionCount - baseline.typicalActionsPerSession.mean);
    const zScore = deviation / baseline.typicalActionsPerSession.stdDev;
    
    if (zScore > 3) {
      anomalies.push({
        id: `anomaly-${Date.now()}-volume`,
        timestamp: new Date(),
        type: 'volume_spike',
        severity: zScore > 5 ? 'high' : 'medium',
        description: `Abnormal action volume: ${actionCount} actions`,
        deviationScore: zScore,
        affectedMetrics: ['action_volume'],
        resolved: false
      });
    }
    
    // Check resource access volume
    const resourceTypes = new Map<string, number>();
    sessionData.resources.forEach(r => {
      resourceTypes.set(r.resourceType, (resourceTypes.get(r.resourceType) || 0) + 1);
    });
    
    for (const [type, count] of resourceTypes.entries()) {
      const typical = baseline.typicalResourcesAccessed.find(r => r.resourceType === type);
      if (typical && count > typical.frequency * 3) {
        anomalies.push({
          id: `anomaly-${Date.now()}-resource`,
          timestamp: new Date(),
          type: 'resource_access_anomaly',
          severity: 'medium',
          description: `Excessive ${type} access: ${count} times`,
          deviationScore: count / typical.frequency,
          affectedMetrics: ['resource_access'],
          resolved: false
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Detect velocity anomalies
   */
  private detectVelocityAnomalies(
    sessionData: SessionBehaviorData,
    baseline: BehaviorBaseline
  ): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];
    
    // Calculate click velocity
    const clicks = sessionData.interactions.filter(i => i.type === 'click');
    if (clicks.length > 10) {
      const sessionDuration = sessionData.endTime 
        ? (sessionData.endTime.getTime() - sessionData.startTime.getTime()) / 60000
        : (Date.now() - sessionData.startTime.getTime()) / 60000;
      
      const clickVelocity = clicks.length / sessionDuration;
      const velocityRatio = clickVelocity / baseline.averageClickVelocity;
      
      if (velocityRatio > 3 || velocityRatio < 0.2) {
        anomalies.push({
          id: `anomaly-${Date.now()}-velocity`,
          timestamp: new Date(),
          type: 'velocity_anomaly',
          severity: velocityRatio > 5 ? 'high' : 'medium',
          description: `Abnormal click velocity: ${clickVelocity.toFixed(1)} clicks/min`,
          deviationScore: Math.abs(Math.log(velocityRatio)),
          affectedMetrics: ['click_velocity'],
          resolved: false
        });
      }
    }
    
    // Check action velocity (rapid-fire actions)
    const actionTimestamps = sessionData.actions.map(a => a.timestamp.getTime());
    const rapidActions = this.detectRapidFireActions(actionTimestamps);
    
    if (rapidActions.length > 0) {
      anomalies.push({
        id: `anomaly-${Date.now()}-rapid`,
        timestamp: new Date(),
        type: 'velocity_anomaly',
        severity: 'high',
        description: `Rapid-fire actions detected: ${rapidActions.length} bursts`,
        deviationScore: rapidActions.length,
        affectedMetrics: ['action_velocity'],
        resolved: false
      });
    }
    
    return anomalies;
  }

  /**
   * Detect bot-like behavior
   */
  private detectBotBehavior(sessionData: SessionBehaviorData): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];
    const indicators: string[] = [];
    
    // Check for mechanical precision
    const clickIntervals = this.calculateIntervals(
      sessionData.interactions.filter(i => i.type === 'click').map(i => i.timestamp.getTime())
    );
    
    if (clickIntervals.length > 5) {
      const variance = this.calculateVariance(clickIntervals);
      if (variance < 100) { // Very consistent intervals
        indicators.push('mechanical_precision');
      }
    }
    
    // Check for lack of human-like behavior
    const hasScrolls = sessionData.interactions.some(i => i.type === 'scroll');
    const hasKeypress = sessionData.interactions.some(i => i.type === 'keypress');
    const hasFocusBlur = sessionData.interactions.some(i => i.type === 'focus' || i.type === 'blur');
    
    if (!hasScrolls && !hasKeypress && !hasFocusBlur && sessionData.actions.length > 5) {
      indicators.push('no_human_interactions');
    }
    
    // Check for impossible speeds
    const actionSpeeds = this.calculateActionSpeeds(sessionData.actions);
    const impossibleSpeeds = actionSpeeds.filter(speed => speed < 100); // Less than 100ms
    
    if (impossibleSpeeds.length > sessionData.actions.length * 0.3) {
      indicators.push('impossible_speeds');
    }
    
    if (indicators.length > 0) {
      anomalies.push({
        id: `anomaly-${Date.now()}-bot`,
        timestamp: new Date(),
        type: 'bot_like_behavior',
        severity: indicators.length > 2 ? 'critical' : 'high',
        description: `Bot-like behavior detected: ${indicators.join(', ')}`,
        deviationScore: indicators.length / 3,
        affectedMetrics: indicators,
        resolved: false
      });
    }
    
    return anomalies;
  }

  /**
   * Detect pattern deviations using stored patterns
   */
  private async detectPatternDeviations(
    sessionData: SessionBehaviorData,
    profile: UserBehaviorProfile
  ): Promise<BehaviorAnomaly[]> {
    const anomalies: BehaviorAnomaly[] = [];
    
    // Check each pattern type
    for (const pattern of profile.patterns) {
      const deviation = await this.calculatePatternDeviation(sessionData, pattern);
      
      if (deviation > this.config.anomalyThreshold) {
        anomalies.push({
          id: `anomaly-${Date.now()}-pattern-${pattern.type}`,
          timestamp: new Date(),
          type: 'pattern_deviation',
          severity: deviation > 0.9 ? 'high' : 'medium',
          description: `Deviation from ${pattern.type} pattern: ${pattern.description}`,
          deviationScore: deviation,
          affectedMetrics: [pattern.type],
          resolved: false
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Calculate risk score from anomalies
   */
  private calculateRiskScore(
    anomalies: BehaviorAnomaly[],
    profile: UserBehaviorProfile
  ): number {
    if (anomalies.length === 0) return 0;
    
    let totalScore = 0;
    const weights = this.config.riskWeights;
    
    // Group anomalies by type
    const timeAnomalies = anomalies.filter(a => a.type === 'unusual_login_time' || a.type === 'abnormal_session_duration');
    const sequenceAnomalies = anomalies.filter(a => a.type === 'suspicious_action_sequence');
    const volumeAnomalies = anomalies.filter(a => a.type === 'volume_spike' || a.type === 'resource_access_anomaly');
    const velocityAnomalies = anomalies.filter(a => a.type === 'velocity_anomaly');
    const patternAnomalies = anomalies.filter(a => a.type === 'pattern_deviation');
    
    // Calculate weighted scores
    totalScore += this.calculateAnomalyGroupScore(timeAnomalies) * weights.timeAnomaly;
    totalScore += this.calculateAnomalyGroupScore(sequenceAnomalies) * weights.sequenceAnomaly;
    totalScore += this.calculateAnomalyGroupScore(volumeAnomalies) * weights.volumeAnomaly;
    totalScore += this.calculateAnomalyGroupScore(velocityAnomalies) * weights.velocityAnomaly;
    totalScore += this.calculateAnomalyGroupScore(patternAnomalies) * weights.patternDeviation;
    
    // Boost score for bot-like behavior
    const botAnomaly = anomalies.find(a => a.type === 'bot_like_behavior');
    if (botAnomaly) {
      totalScore = Math.max(totalScore, 82); // Minimum >80 for bot detection
      if (botAnomaly.severity === 'critical') {
        totalScore = Math.max(totalScore, 95);
      }
    }
    
    // Apply profile confidence adjustment
    totalScore = totalScore * (0.7 + 0.3 * profile.profileConfidence);
    
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Calculate score for a group of anomalies
   */
  private calculateAnomalyGroupScore(anomalies: BehaviorAnomaly[]): number {
    if (anomalies.length === 0) return 0;
    
    const severityScores = {
      low: 25,
      medium: 50,
      high: 75,
      critical: 100
    };
    
    // Take the highest severity in the group
    const maxSeverity = anomalies.reduce((max, a) => 
      severityScores[a.severity] > severityScores[max] ? a.severity : max,
    anomalies[0].severity
    );
    
    // Apply a multiplier for multiple anomalies
    const multiplier = 1 + Math.min(0.5, (anomalies.length - 1) * 0.1);
    
    return severityScores[maxSeverity] * multiplier;
  }

  /**
   * Get or create user behavior profile
   */
  private async getUserBehaviorProfile(userId: string): Promise<UserBehaviorProfile> {
    // Try cache first
    const cacheKey = `behavior_profile:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error('Error parsing cached profile:', error);
      }
    }
    
    // Get from database
    const result = await this.db.query(`
      SELECT * FROM user_behavior_profiles
      WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length > 0) {
      const profile = this.mapDatabaseProfile(result.rows[0]);
      
      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(profile));
      
      return profile;
    }
    
    // Create new profile
    return this.createNewProfile(userId);
  }

  /**
   * Create new user profile
   */
  private async createNewProfile(userId: string): Promise<UserBehaviorProfile> {
    const profile: UserBehaviorProfile = {
      userId,
      baseline: this.createEmptyBaseline(),
      patterns: [],
      anomalies: [],
      riskScore: 0,
      lastUpdated: new Date(),
      profileConfidence: 0,
      dataPoints: 0,
      status: 'learning'
    };
    
    // Store in database
    await this.db.query(`
      INSERT INTO user_behavior_profiles (
        user_id, baseline_data, patterns_data, anomalies_data,
        risk_score, profile_confidence, data_points, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      userId,
      JSON.stringify(profile.baseline),
      JSON.stringify(profile.patterns),
      JSON.stringify(profile.anomalies),
      profile.riskScore,
      profile.profileConfidence,
      profile.dataPoints,
      profile.status
    ]);
    
    return profile;
  }

  /**
   * Create empty baseline
   */
  private createEmptyBaseline(): BehaviorBaseline {
    return {
      typicalLoginTimes: [],
      typicalSessionDuration: { mean: 30, stdDev: 15 }, // Default 30min ± 15min
      typicalActivityHours: [],
      weekdayVsWeekendRatio: 1,
      typicalActionsPerSession: { mean: 50, stdDev: 20 },
      commonActionSequences: [],
      typicalResourcesAccessed: [],
      averageClickVelocity: 10, // 10 clicks per minute default
      averageScrollVelocity: 100, // 100 pixels per second default
      typicalIdleTime: { mean: 5, stdDev: 3 }, // 5min ± 3min
      keyboardToMouseRatio: 0.3,
      featureUsageDistribution: new Map(),
      navigationPaths: [],
      errorRate: 0.05, // 5% default error rate
      retryPatterns: []
    };
  }

  /**
   * Record session behavior for learning
   */
  private async recordSessionBehavior(sessionData: SessionBehaviorData): Promise<void> {
    await this.db.query(`
      INSERT INTO user_behavior_sessions (
        session_id, user_id, start_time, end_time,
        actions_data, resources_data, interactions_data, errors_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      sessionData.sessionId,
      sessionData.userId,
      sessionData.startTime,
      sessionData.endTime,
      JSON.stringify(sessionData.actions),
      JSON.stringify(sessionData.resources),
      JSON.stringify(sessionData.interactions),
      JSON.stringify(sessionData.errors)
    ]);
  }

  /**
   * Update user profile with new data
   */
  private async updateUserProfile(
    userId: string,
    sessionData: SessionBehaviorData,
    anomalies: BehaviorAnomaly[]
  ): Promise<void> {
    const profile = await this.getUserBehaviorProfile(userId);
    
    // Update data points
    profile.dataPoints++;
    
    // Update baseline if in learning mode or established
    if (profile.status === 'learning' || profile.status === 'established') {
      await this.updateBaseline(profile, sessionData);
    }
    
    // Add new anomalies
    profile.anomalies.push(...anomalies);
    
    // Keep only recent anomalies (last 100)
    if (profile.anomalies.length > 100) {
      profile.anomalies = profile.anomalies.slice(-100);
    }
    
    // Update confidence
    profile.profileConfidence = Math.min(1, profile.dataPoints / 100);
    
    // Update status
    if (profile.dataPoints >= this.config.minimumDataPoints && profile.status === 'learning') {
      profile.status = 'established';
    }
    
    // Save updated profile
    await this.saveUserProfile(profile);
  }

  /**
   * Update baseline with new session data
   */
  private async updateBaseline(
    profile: UserBehaviorProfile,
    sessionData: SessionBehaviorData
  ): Promise<void> {
    const baseline = profile.baseline;
    
    // Update login times
    const loginHour = sessionData.startTime.getHours();
    const dayOfWeek = sessionData.startTime.getDay();
    
    const timeWindow = baseline.typicalLoginTimes.find(w => 
      w.dayOfWeek === dayOfWeek && 
      w.startHour <= loginHour && 
      w.endHour >= loginHour
    );
    
    if (timeWindow) {
      timeWindow.probability = (timeWindow.probability * 0.9) + 0.1; // Exponential average
    } else {
      baseline.typicalLoginTimes.push({
        startHour: loginHour,
        endHour: loginHour,
        dayOfWeek,
        probability: 0.1
      });
    }
    
    // Update session duration
    if (sessionData.endTime) {
      const duration = (sessionData.endTime.getTime() - sessionData.startTime.getTime()) / 60000;
      baseline.typicalSessionDuration.mean = 
        (baseline.typicalSessionDuration.mean * 0.95) + (duration * 0.05);
    }
    
    // Update actions per session
    const actionCount = sessionData.actions.length;
    baseline.typicalActionsPerSession.mean = 
      (baseline.typicalActionsPerSession.mean * 0.95) + (actionCount * 0.05);
    
    // Update action sequences
    if (sessionData.actions.length >= 3) {
      const sessionActions = sessionData.actions.map(a => a.action).slice(0, 5); // Top 5 actions
      const existingSequence = baseline.commonActionSequences.find(seq => 
        seq.actions.length === sessionActions.length &&
        seq.actions.every((action, idx) => action === sessionActions[idx])
      );
      
      if (existingSequence) {
        existingSequence.frequency = (existingSequence.frequency * 0.95) + 0.05;
      } else {
        baseline.commonActionSequences.push({
          actions: sessionActions,
          frequency: 0.05,
          lastSeen: new Date()
        });
      }
      
      // Keep only top 20 most frequent sequences
      baseline.commonActionSequences.sort((a, b) => b.frequency - a.frequency);
      baseline.commonActionSequences = baseline.commonActionSequences.slice(0, 20);
    }
    
    // Update other metrics similarly...
  }

  /**
   * Save user profile to database
   */
  private async saveUserProfile(profile: UserBehaviorProfile): Promise<void> {
    await this.db.query(`
      UPDATE user_behavior_profiles SET
        baseline_data = $2,
        patterns_data = $3,
        anomalies_data = $4,
        risk_score = $5,
        profile_confidence = $6,
        data_points = $7,
        status = $8,
        last_updated = NOW()
      WHERE user_id = $1
    `, [
      profile.userId,
      JSON.stringify(profile.baseline),
      JSON.stringify(profile.patterns),
      JSON.stringify(profile.anomalies),
      profile.riskScore,
      profile.profileConfidence,
      profile.dataPoints,
      profile.status
    ]);
    
    // Update cache
    const cacheKey = `behavior_profile:${profile.userId}`;
    await this.redis.setex(cacheKey, 3600, JSON.stringify(profile));
  }

  /**
   * Log analysis result
   */
  private async logAnalysisResult(
    userId: string,
    riskScore: number,
    anomalies: BehaviorAnomaly[],
    recommendation: 'allow' | 'monitor' | 'challenge' | 'block'
  ): Promise<void> {
    await this.auditService.logEvent({
      userId,
      action: 'behavior_analysis',
      resourceType: 'security',
      details: {
        riskScore,
        anomalyCount: anomalies.length,
        anomalyTypes: [...new Set(anomalies.map(a => a.type))],
        recommendation,
        severity: this.getRiskLevel(riskScore)
      },
      severity: riskScore > 80 ? 'critical' : riskScore > 60 ? 'warning' : 'info'
    });
  }

  /**
   * Helper methods
   */
  
  private containsSequence(actions: string[], sequence: string[]): boolean {
    for (let i = 0; i <= actions.length - sequence.length; i++) {
      if (sequence.every((action, j) => actions[i + j] === action)) {
        return true;
      }
    }
    return false;
  }

  private sequenceSimilarity(seq1: string[], seq2: string[]): number {
    const set1 = new Set(seq1);
    const set2 = new Set(seq2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private calculateIntervals(timestamps: number[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    return intervals;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateActionSpeeds(actions: UserAction[]): number[] {
    const speeds: number[] = [];
    for (let i = 1; i < actions.length; i++) {
      const timeDiff = actions[i].timestamp.getTime() - actions[i - 1].timestamp.getTime();
      speeds.push(timeDiff);
    }
    return speeds;
  }

  private detectRapidFireActions(timestamps: number[]): number[][] {
    const bursts: number[][] = [];
    let currentBurst: number[] = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      const interval = timestamps[i] - timestamps[i - 1];
      if (interval < 500) { // Less than 500ms between actions
        if (currentBurst.length === 0) {
          currentBurst.push(timestamps[i - 1]);
        }
        currentBurst.push(timestamps[i]);
      } else if (currentBurst.length > 3) {
        bursts.push(currentBurst);
        currentBurst = [];
      } else {
        currentBurst = [];
      }
    }
    
    if (currentBurst.length > 3) {
      bursts.push(currentBurst);
    }
    
    return bursts;
  }

  private getTimeSeverity(hour: number, typicalHours: number[]): 'low' | 'medium' | 'high' | 'critical' {
    if (typicalHours.includes(hour)) return 'low';
    
    // Check if within 2 hours of typical times
    const nearTypical = typicalHours.some(h => Math.abs(h - hour) <= 2);
    if (nearTypical) return 'medium';
    
    // Very unusual hours (e.g., 3am-5am)
    if (hour >= 3 && hour <= 5) return 'high';
    
    return 'medium';
  }

  private calculateTimeDeviation(hour: number, typicalHours: number[]): number {
    if (typicalHours.length === 0) return 0.5;
    
    const minDistance = Math.min(...typicalHours.map(h => Math.abs(h - hour)));
    return Math.min(1, minDistance / 12); // Normalize to 0-1
  }

  private async calculatePatternDeviation(
    sessionData: SessionBehaviorData,
    pattern: BehaviorPattern
  ): Promise<number> {
    // Simplified pattern deviation calculation
    // In production, this would use more sophisticated pattern matching
    return Math.random() * 0.5; // Placeholder
  }

  private determineRecommendation(
    riskScore: number,
    anomalies: BehaviorAnomaly[]
  ): 'allow' | 'monitor' | 'challenge' | 'block' {
    // Check for critical anomalies
    const hasCritical = anomalies.some(a => a.severity === 'critical');
    
    if (riskScore >= this.config.autoBlockThreshold || hasCritical) {
      return 'block';
    }
    
    if (riskScore >= 80) {
      return 'challenge';
    }
    
    if (riskScore >= 40 || anomalies.length > 2) {
      return 'monitor';
    }
    
    return 'allow';
  }

  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private createLearningModeResult(userId: string): BehaviorAnalysisResult {
    return {
      userId,
      timestamp: new Date(),
      riskScore: 0,
      riskLevel: 'low',
      anomalies: [],
      recommendation: 'allow',
      confidence: 0,
      reasoning: ['Profile still in learning mode - insufficient data for analysis']
    };
  }

  private generateReasoning(anomalies: BehaviorAnomaly[], riskScore: number): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Risk score: ${riskScore.toFixed(1)}/100`);
    
    if (anomalies.length === 0) {
      reasoning.push('No behavioral anomalies detected');
    } else {
      reasoning.push(`Detected ${anomalies.length} anomalies`);
      
      const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
      if (criticalAnomalies.length > 0) {
        reasoning.push(`Critical anomalies: ${criticalAnomalies.map(a => a.type).join(', ')}`);
      }
    }
    
    return reasoning;
  }

  private mapDatabaseProfile(row: any): UserBehaviorProfile {
    return {
      userId: row.user_id,
      baseline: JSON.parse(row.baseline_data),
      patterns: JSON.parse(row.patterns_data),
      anomalies: JSON.parse(row.anomalies_data),
      riskScore: row.risk_score,
      lastUpdated: row.last_updated,
      profileConfidence: row.profile_confidence,
      dataPoints: row.data_points,
      status: row.status
    };
  }

  /**
   * Update all user profiles periodically
   */
  private async updateAllProfiles(): Promise<void> {
    try {
      // Get users with recent activity
      const result = await this.db.query(`
        SELECT DISTINCT user_id 
        FROM user_behavior_sessions
        WHERE created_at >= NOW() - INTERVAL '${this.config.updateFrequencyMinutes} minutes'
      `);
      
      for (const row of result.rows) {
        await this.updateProfilePatterns(row.user_id);
      }
    } catch (error) {
      console.error('Error updating profiles:', error);
    }
  }

  /**
   * Update patterns for a specific user
   */
  private async updateProfilePatterns(userId: string): Promise<void> {
    try {
      const profile = await this.getUserBehaviorProfile(userId);
      
      // Get recent sessions for pattern analysis
      const sessions = await this.getRecentSessions(userId, this.config.baselineWindowDays);
      
      if (sessions.length < this.config.minimumDataPoints) {
        return; // Not enough data
      }
      
      // Detect patterns
      const patterns: BehaviorPattern[] = [];
      
      for (const patternType of this.config.patternTypes) {
        const detected = await this.detectPattern(patternType, sessions);
        if (detected) {
          patterns.push(detected);
        }
      }
      
      profile.patterns = patterns;
      await this.saveUserProfile(profile);
      
    } catch (error) {
      console.error(`Error updating patterns for user ${userId}:`, error);
    }
  }

  /**
   * Get recent sessions for a user
   */
  private async getRecentSessions(userId: string, days: number): Promise<SessionBehaviorData[]> {
    const result = await this.db.query(`
      SELECT * FROM user_behavior_sessions
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `, [userId]);
    
    return result.rows.map((row: any) => ({
      sessionId: row.session_id,
      userId: row.user_id,
      startTime: row.start_time,
      endTime: row.end_time,
      actions: JSON.parse(row.actions_data),
      resources: JSON.parse(row.resources_data),
      interactions: JSON.parse(row.interactions_data),
      errors: JSON.parse(row.errors_data)
    }));
  }

  /**
   * Detect specific pattern type
   */
  private async detectPattern(
    type: BehaviorPatternType,
    sessions: SessionBehaviorData[]
  ): Promise<BehaviorPattern | null> {
    // Simplified pattern detection
    // In production, this would use more sophisticated algorithms
    
    switch (type) {
    case 'login_time':
      return this.detectLoginTimePattern(sessions);
    case 'action_sequence':
      return this.detectActionSequencePattern(sessions);
    case 'resource_access':
      return this.detectResourceAccessPattern(sessions);
    case 'session_duration':
      return this.detectSessionDurationPattern(sessions);
    default:
      return null;
    }
  }

  private detectLoginTimePattern(sessions: SessionBehaviorData[]): BehaviorPattern | null {
    const loginHours = sessions.map(s => s.startTime.getHours());
    const hourCounts = new Map<number, number>();
    
    loginHours.forEach(hour => {
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    // Find most common login hours
    const sortedHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (sortedHours.length > 0) {
      return {
        id: `pattern-login-time-${Date.now()}`,
        type: 'login_time',
        description: `Typical login hours: ${sortedHours.map(h => h[0]).join(', ')}`,
        frequency: sortedHours[0][1] / sessions.length,
        lastOccurrence: new Date(),
        confidence: Math.min(1, sessions.length / 50),
        metadata: { hourDistribution: Object.fromEntries(hourCounts) }
      };
    }
    
    return null;
  }

  private detectActionSequencePattern(sessions: SessionBehaviorData[]): BehaviorPattern | null {
    // Extract common action sequences
    const sequences = new Map<string, number>();
    
    sessions.forEach(session => {
      const actions = session.actions.map(a => a.action);
      for (let i = 0; i < actions.length - 2; i++) {
        const seq = actions.slice(i, i + 3).join('-');
        sequences.set(seq, (sequences.get(seq) || 0) + 1);
      }
    });
    
    // Find most common sequences
    const commonSequences = Array.from(sequences.entries())
      .filter(([_, count]) => count > sessions.length * 0.1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (commonSequences.length > 0) {
      return {
        id: `pattern-sequence-${Date.now()}`,
        type: 'action_sequence',
        description: `Common sequences: ${commonSequences[0][0]}`,
        frequency: commonSequences[0][1] / sessions.length,
        lastOccurrence: new Date(),
        confidence: Math.min(1, sessions.length / 50),
        metadata: { sequences: commonSequences.map(s => ({ sequence: s[0], count: s[1] })) }
      };
    }
    
    return null;
  }

  private detectResourceAccessPattern(sessions: SessionBehaviorData[]): BehaviorPattern | null {
    const resourceTypes = new Map<string, number>();
    
    sessions.forEach(session => {
      session.resources.forEach(resource => {
        resourceTypes.set(resource.resourceType, (resourceTypes.get(resource.resourceType) || 0) + 1);
      });
    });
    
    const commonResources = Array.from(resourceTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (commonResources.length > 0) {
      return {
        id: `pattern-resource-${Date.now()}`,
        type: 'resource_access',
        description: `Common resources: ${commonResources.map(r => r[0]).join(', ')}`,
        frequency: commonResources[0][1] / sessions.length,
        lastOccurrence: new Date(),
        confidence: Math.min(1, sessions.length / 50),
        metadata: { resourceDistribution: Object.fromEntries(resourceTypes) }
      };
    }
    
    return null;
  }

  private detectSessionDurationPattern(sessions: SessionBehaviorData[]): BehaviorPattern | null {
    const durations = sessions
      .filter(s => s.endTime)
      .map(s => (s.endTime!.getTime() - s.startTime.getTime()) / 60000); // minutes
    
    if (durations.length > 0) {
      const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
      const stdDev = Math.sqrt(variance);
      
      return {
        id: `pattern-duration-${Date.now()}`,
        type: 'session_duration',
        description: `Typical session: ${mean.toFixed(0)}±${stdDev.toFixed(0)} minutes`,
        frequency: 1,
        lastOccurrence: new Date(),
        confidence: Math.min(1, sessions.length / 50),
        metadata: { mean, stdDev, min: Math.min(...durations), max: Math.max(...durations) }
      };
    }
    
    return null;
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    // User behavior profiles table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_behavior_profiles (
        user_id VARCHAR(255) PRIMARY KEY,
        baseline_data JSONB NOT NULL,
        patterns_data JSONB NOT NULL,
        anomalies_data JSONB NOT NULL,
        risk_score DECIMAL(5,2) DEFAULT 0,
        profile_confidence DECIMAL(3,2) DEFAULT 0,
        data_points INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'learning',
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Behavior sessions table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_behavior_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        actions_data JSONB NOT NULL,
        resources_data JSONB NOT NULL,
        interactions_data JSONB NOT NULL,
        errors_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(session_id)
      )
    `);

    // Behavior analysis results table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS behavior_analysis_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255),
        risk_score DECIMAL(5,2) NOT NULL,
        risk_level VARCHAR(20) NOT NULL,
        anomaly_count INTEGER DEFAULT 0,
        anomaly_types TEXT[],
        recommendation VARCHAR(20) NOT NULL,
        confidence DECIMAL(3,2) NOT NULL,
        reasoning TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_behavior_sessions_user_id 
      ON user_behavior_sessions(user_id);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_behavior_sessions_created 
      ON user_behavior_sessions(created_at);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_behavior_analysis_user_id 
      ON behavior_analysis_results(user_id);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_behavior_analysis_risk 
      ON behavior_analysis_results(risk_score);
    `);
  }

  /**
   * Stop the service
   */
  async stop(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}