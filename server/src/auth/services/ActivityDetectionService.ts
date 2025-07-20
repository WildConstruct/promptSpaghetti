/**
 * Activity Detection Service - Epic 19 Implementation
 * Intelligent activity detection for timeout reset with pattern recognition and fraud prevention
 */

import { EventEmitter } from 'events';
import { RedisService } from '../database/RedisService';
import { IdleTimeoutDetectionService } from './IdleTimeoutDetectionService';

export interface ActivityDefinition {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  detection: {
    type: 'http_request' | 'websocket' | 'heartbeat' | 'user_interaction' | 'api_call' | 'file_operation';
    patterns: Array<{
      path?: string;
      method?: string;
      headers?: Record<string, string>;
      payloadPattern?: string;
      minDuration?: number; // milliseconds
      userInitiated: boolean;
    }>;
    
    filters: {
      excludePaths?: string[];
      excludeUserAgents?: string[];
      excludeIPs?: string[];
      requireAuthentication: boolean;
      minTimeBetweenActivities: number; // milliseconds
    };
  };
  
  validation: {
    requiresValidSession: boolean;
    requiresCSRFToken: boolean;
    checkUserAgent: boolean;
    checkIPConsistency: boolean;
    validateTimestamp: boolean;
    timestampTolerance: number; // milliseconds
  };
  
  scoring: {
    baseScore: number; // 1-100, how much this activity indicates user presence
    modifiers: Array<{
      condition: string;
      scoreMultiplier: number;
      reason: string;
    }>;
    
    antiPatterns: Array<{
      pattern: string;
      penaltyScore: number;
      description: string;
    }>;
  };
  
  timeoutReset: {
    shouldResetIdle: boolean;
    shouldResetInactivity: boolean;
    resetGracePeriod: number; // seconds
    minimumGapBetweenResets: number; // seconds
    resetScope: 'session' | 'user' | 'device';
  };
}

export interface DetectedActivity {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  
  source: {
    type: ActivityDefinition['detection']['type'];
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress: string;
    referrer?: string;
  };
  
  analysis: {
    definitionId: string;
    genuineScore: number; // 0-100, likelihood of genuine user activity
    automatedProbability: number; // 0-100, likelihood of automated activity
    fraudRisk: number; // 0-100, fraud risk assessment
    validationResults: Record<string, boolean>;
  };
  
  patterns: {
    sequencePosition: number;
    timingPattern: 'regular' | 'irregular' | 'burst' | 'suspicious';
    frequencyScore: number;
    velocityIndicator: 'normal' | 'fast' | 'very_fast' | 'impossible';
  };
  
  context: {
    deviceFingerprint?: string;
    geolocation?: {
      country: string;
      region: string;
      city: string;
      accuracy: number;
    };
    
    sessionContext: {
      totalActivities: number;
      recentActivities: number;
      averageGap: number; // milliseconds
      sessionDuration: number; // seconds
    };
    
    userContext: {
      typicalPattern?: string;
      deviationScore: number;
      riskProfile: 'low' | 'medium' | 'high';
    };
  };
  
  outcome: {
    shouldResetTimeout: boolean;
    resetType?: 'idle' | 'inactivity' | 'both';
    confidence: number; // 0-100
    reasons: string[];
    flags: string[];
  };
}

export interface ActivityPattern {
  id: string;
  name: string;
  description: string;
  
  pattern: {
    type: 'sequence' | 'frequency' | 'timing' | 'behavioral';
    windowSize: number; // milliseconds
    minOccurrences: number;
    
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'matches' | 'between' | 'greater' | 'less';
      value: any;
      weight: number;
    }>;
    
    relationships: Array<{
      activity1: string;
      activity2: string;
      relationship: 'follows' | 'concurrent' | 'excludes' | 'implies';
      maxTimeDiff?: number; // milliseconds
    }>;
  };
  
  scoring: {
    genuinessIndicator: number; // -100 to +100
    automationIndicator: number; // 0-100
    suspiciousIndicator: number; // 0-100
  };
  
  response: {
    blockActivity: boolean;
    requireAdditionalValidation: boolean;
    adjustTimeoutBehavior: boolean;
    notifySecurityTeam: boolean;
    logLevel: 'info' | 'warn' | 'error' | 'critical';
  };
}

export interface ActivitySession {
  sessionId: string;
  userId: string;
  startTime: Date;
  
  activities: DetectedActivity[];
  
  statistics: {
    totalActivities: number;
    genuineActivities: number;
    suspiciousActivities: number;
    automatedActivities: number;
    averageGenuineness: number;
    timeoutResets: number;
  };
  
  patterns: {
    detectedPatterns: string[];
    behaviorProfile: 'human' | 'automated' | 'mixed' | 'suspicious';
    confidenceLevel: number;
    riskAssessment: 'low' | 'medium' | 'high' | 'critical';
  };
  
  baseline: {
    established: boolean;
    typicalFrequency: number; // activities per minute
    typicalGaps: number[]; // milliseconds between activities
    preferredEndpoints: string[];
    usualTimeOfDay: number[]; // hours when user is typically active
  };
}

export class ActivityDetectionService extends EventEmitter {
  private redis: RedisService;
  private timeoutService: IdleTimeoutDetectionService;
  private activityDefinitions: Map<string, ActivityDefinition> = new Map();
  private activityPatterns: Map<string, ActivityPattern> = new Map();
  private activeSessions: Map<string, ActivitySession> = new Map();
  private userBaselines: Map<string, any> = new Map();
  private recentActivities: Map<string, DetectedActivity[]> = new Map();
  
  private config: {
    maxActivitiesPerSession: number;
    baselineRequiredActivities: number;
    suspicoiusThreshold: number;
    automationThreshold: number;
    patternDetectionWindow: number; // milliseconds
    fraudPreventionEnabled: boolean;
  };

  constructor(
    redis: RedisService,
    timeoutService: IdleTimeoutDetectionService,
    config?: Partial<ActivityDetectionService['config']>
  ) {
    super();
    this.redis = redis;
    this.timeoutService = timeoutService;
    this.config = {
      maxActivitiesPerSession: 10000,
      baselineRequiredActivities: 50,
      suspicoiusThreshold: 70,
      automationThreshold: 80,
      patternDetectionWindow: 300000, // 5 minutes
      fraudPreventionEnabled: true,
      ...config
    };
    
    this.initializeDefaultDefinitions();
    this.initializeDefaultPatterns();
    this.startBackgroundProcessing();
  }

  /**
   * Detect and process activity
   */
  async detectActivity(
    sessionId: string,
    userId: string,
    activityData: {
      type: ActivityDefinition['detection']['type'];
      endpoint?: string;
      method?: string;
      headers?: Record<string, string>;
      payload?: any;
      timestamp?: Date;
      ipAddress: string;
      userAgent: string;
      referrer?: string;
    }
  ): Promise<{
    detected: boolean;
    activity?: DetectedActivity;
    timeoutReset: boolean;
    confidence: number;
    warnings: string[];
    blocked: boolean;
  }> {
    try {
      const timestamp = activityData.timestamp || new Date();
      
      // Find matching activity definitions
      const matchingDefinitions = await this.findMatchingDefinitions(activityData);
      if (matchingDefinitions.length === 0) {
        return {
          detected: false,
          timeoutReset: false,
          confidence: 0,
          warnings: ['No matching activity definitions'],
          blocked: false
        };
      }

      // Use the highest-scoring definition
      const bestDefinition = this.selectBestDefinition(matchingDefinitions, activityData);
      
      // Create detected activity
      const activity: DetectedActivity = {
        id: this.generateActivityId(),
        sessionId,
        userId,
        timestamp,
        source: {
          type: activityData.type,
          endpoint: activityData.endpoint,
          method: activityData.method,
          userAgent: activityData.userAgent,
          ipAddress: activityData.ipAddress,
          referrer: activityData.referrer
        },
        analysis: {
          definitionId: bestDefinition.id,
          genuineScore: 0,
          automatedProbability: 0,
          fraudRisk: 0,
          validationResults: {}
        },
        patterns: {
          sequencePosition: 0,
          timingPattern: 'regular',
          frequencyScore: 50,
          velocityIndicator: 'normal'
        },
        context: {
          sessionContext: {
            totalActivities: 0,
            recentActivities: 0,
            averageGap: 0,
            sessionDuration: 0
          },
          userContext: {
            deviationScore: 0,
            riskProfile: 'low'
          }
        },
        outcome: {
          shouldResetTimeout: false,
          confidence: 0,
          reasons: [],
          flags: []
        }
      };

      // Perform validation
      const validation = await this.validateActivity(activity, bestDefinition);
      activity.analysis.validationResults = validation.results;
      
      if (!validation.passed) {
        activity.outcome.flags.push('validation_failed');
        return {
          detected: true,
          activity,
          timeoutReset: false,
          confidence: 0,
          warnings: validation.warnings,
          blocked: validation.blocked
        };
      }

      // Analyze activity genuineness
      const analysis = await this.analyzeActivityGenuineness(activity, bestDefinition);
      activity.analysis = { ...activity.analysis, ...analysis };

      // Detect patterns
      const patternAnalysis = await this.detectActivityPatterns(activity);
      activity.patterns = { ...activity.patterns, ...patternAnalysis };

      // Calculate context
      const context = await this.calculateActivityContext(activity);
      activity.context = { ...activity.context, ...context };

      // Determine outcome
      const outcome = await this.determineActivityOutcome(activity, bestDefinition);
      activity.outcome = outcome;

      // Store activity
      await this.storeActivity(activity);

      // Reset timeout if appropriate
      let timeoutReset = false;
      if (outcome.shouldResetTimeout && outcome.confidence >= 70) {
        timeoutReset = await this.performTimeoutReset(activity, bestDefinition);
      }

      // Check for suspicious patterns
      const warnings: string[] = [];
      if (activity.analysis.fraudRisk > this.config.suspicoiusThreshold) {
        warnings.push('High fraud risk detected');
      }
      
      if (activity.analysis.automatedProbability > this.config.automationThreshold) {
        warnings.push('Possible automated activity');
      }

      // Emit activity detected event
      this.emit('activityDetected', {
        activity,
        timeoutReset,
        riskLevel: this.calculateRiskLevel(activity)
      });

      return {
        detected: true,
        activity,
        timeoutReset,
        confidence: outcome.confidence,
        warnings,
        blocked: false
      };

    } catch (error) {
      console.error('Error detecting activity:', error);
      return {
        detected: false,
        timeoutReset: false,
        confidence: 0,
        warnings: ['Activity detection failed'],
        blocked: false
      };
    }
  }

  /**
   * Establish baseline behavior for a user
   */
  async establishUserBaseline(
    userId: string,
    analysisDepth: 'basic' | 'detailed' | 'comprehensive' = 'basic'
  ): Promise<{
    baselineEstablished: boolean;
    confidenceLevel: number;
    profile: any;
    recommendations: string[];
  }> {
    try {
      // Get user's recent activities
      const userActivities = await this.getUserRecentActivities(userId, 30); // 30 days
      
      if (userActivities.length < this.config.baselineRequiredActivities) {
        return {
          baselineEstablished: false,
          confidenceLevel: 0,
          profile: {},
          recommendations: ['Insufficient activity data for baseline establishment']
        };
      }

      // Analyze activity patterns
      const baseline = await this.analyzeUserBehaviorPatterns(userActivities, analysisDepth);
      
      // Store baseline
      this.userBaselines.set(userId, baseline);
      await this.redis.setex(`baseline:${userId}`, 86400 * 7, JSON.stringify(baseline)); // 7 days TTL

      this.emit('baselineEstablished', {
        userId,
        confidenceLevel: baseline.confidence,
        profile: baseline.profile
      });

      return {
        baselineEstablished: true,
        confidenceLevel: baseline.confidence,
        profile: baseline.profile,
        recommendations: baseline.recommendations
      };

    } catch (error) {
      console.error('Error establishing user baseline:', error);
      return {
        baselineEstablished: false,
        confidenceLevel: 0,
        profile: {},
        recommendations: ['Failed to establish baseline']
      };
    }
  }

  /**
   * Register custom activity definition
   */
  async registerActivityDefinition(
    definition: Omit<ActivityDefinition, 'id'>,
    createdBy: string
  ): Promise<{
    success: boolean;
    definitionId?: string;
    errors?: string[];
  }> {
    try {
      // Validate definition
      const validation = this.validateActivityDefinition(definition);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Create definition
      const activityDefinition: ActivityDefinition = {
        ...definition,
        id: this.generateDefinitionId()
      };

      // Store definition
      this.activityDefinitions.set(activityDefinition.id, activityDefinition);
      await this.saveActivityDefinition(activityDefinition);

      this.emit('definitionRegistered', {
        definitionId: activityDefinition.id,
        name: activityDefinition.name,
        createdBy
      });

      return {
        success: true,
        definitionId: activityDefinition.id
      };

    } catch (error) {
      console.error('Error registering activity definition:', error);
      return {
        success: false,
        errors: ['Failed to register activity definition']
      };
    }
  }

  /**
   * Get activity analytics
   */
  async getActivityAnalytics(
    filters: {
      sessionId?: string;
      userId?: string;
      timeRange?: { start: Date; end: Date };
      activityTypes?: string[];
    } = {}
  ): Promise<{
    summary: {
      totalActivities: number;
      genuineActivities: number;
      suspiciousActivities: number;
      timeoutResets: number;
      averageGenuineness: number;
    };
    patterns: {
      mostCommon: Array<{ type: string; count: number }>;
      timeDistribution: Array<{ hour: number; count: number }>;
      riskDistribution: Array<{ level: string; count: number }>;
    };
    trends: {
      activityTrend: Array<{ date: Date; count: number }>;
      genuinenessTrend: Array<{ date: Date; score: number }>;
      riskTrend: Array<{ date: Date; risk: number }>;
    };
  }> {
    try {
      // Get filtered activities
      const activities = await this.getFilteredActivities(filters);
      
      // Calculate summary statistics
      const summary = this.calculateActivitySummary(activities);
      
      // Analyze patterns
      const patterns = this.analyzeActivityPatterns(activities);
      
      // Calculate trends
      const trends = this.calculateActivityTrends(activities);

      return {
        summary,
        patterns,
        trends
      };

    } catch (error) {
      console.error('Error getting activity analytics:', error);
      throw new Error('Failed to get activity analytics');
    }
  }

  // Private helper methods

  private async findMatchingDefinitions(activityData: any): Promise<ActivityDefinition[]> {
    const matching: ActivityDefinition[] = [];
    
    for (const definition of this.activityDefinitions.values()) {
      if (!definition.enabled) continue;
      
      // Check type match
      if (definition.detection.type !== activityData.type) continue;
      
      // Check patterns
      for (const pattern of definition.detection.patterns) {
        if (this.matchesPattern(activityData, pattern)) {
          matching.push(definition);
          break;
        }
      }
    }
    
    return matching;
  }

  private matchesPattern(activityData: any, pattern: any): boolean {
    // Check path pattern
    if (pattern.path && activityData.endpoint) {
      const pathRegex = new RegExp(pattern.path);
      if (!pathRegex.test(activityData.endpoint)) return false;
    }
    
    // Check method
    if (pattern.method && activityData.method !== pattern.method) {
      return false;
    }
    
    // Check headers
    if (pattern.headers) {
      for (const [key, value] of Object.entries(pattern.headers)) {
        if (activityData.headers?.[key] !== value) return false;
      }
    }
    
    return true;
  }

  private selectBestDefinition(definitions: ActivityDefinition[], activityData: any): ActivityDefinition {
    // For now, return the first one. Could implement more sophisticated scoring
    return definitions[0];
  }

  private async validateActivity(
    activity: DetectedActivity,
    definition: ActivityDefinition
  ): Promise<{
    passed: boolean;
    results: Record<string, boolean>;
    warnings: string[];
    blocked: boolean;
  }> {
    const results: Record<string, boolean> = {};
    const warnings: string[] = [];
    let blocked = false;

    // Check session validity
    if (definition.validation.requiresValidSession) {
      const sessionValid = await this.validateSession(activity.sessionId);
      results.validSession = sessionValid;
      if (!sessionValid) {
        warnings.push('Invalid session');
        blocked = true;
      }
    }

    // Check CSRF token
    if (definition.validation.requiresCSRFToken) {
      // Implementation would check CSRF token
      results.validCSRF = true; // Placeholder
    }

    // Check timestamp validity
    if (definition.validation.validateTimestamp) {
      const timestampValid = this.validateTimestamp(
        activity.timestamp,
        definition.validation.timestampTolerance
      );
      results.validTimestamp = timestampValid;
      if (!timestampValid) {
        warnings.push('Invalid timestamp');
      }
    }

    return {
      passed: !blocked && Object.values(results).every(r => r !== false),
      results,
      warnings,
      blocked
    };
  }

  private async analyzeActivityGenuineness(
    activity: DetectedActivity,
    definition: ActivityDefinition
  ): Promise<{
    genuineScore: number;
    automatedProbability: number;
    fraudRisk: number;
  }> {
    let genuineScore = definition.scoring.baseScore;
    let automatedProbability = 0;
    let fraudRisk = 0;

    // Apply scoring modifiers
    for (const modifier of definition.scoring.modifiers) {
      if (this.evaluateCondition(activity, modifier.condition)) {
        genuineScore *= modifier.scoreMultiplier;
      }
    }

    // Check anti-patterns
    for (const antiPattern of definition.scoring.antiPatterns) {
      if (this.matchesAntiPattern(activity, antiPattern.pattern)) {
        genuineScore -= antiPattern.penaltyScore;
        automatedProbability += 20;
        fraudRisk += 15;
      }
    }

    // Analyze timing patterns
    const timingAnalysis = await this.analyzeActivityTiming(activity);
    if (timingAnalysis.suspicious) {
      automatedProbability += 30;
      fraudRisk += 20;
    }

    // Clamp values
    genuineScore = Math.max(0, Math.min(100, genuineScore));
    automatedProbability = Math.max(0, Math.min(100, automatedProbability));
    fraudRisk = Math.max(0, Math.min(100, fraudRisk));

    return {
      genuineScore,
      automatedProbability,
      fraudRisk
    };
  }

  private async performTimeoutReset(
    activity: DetectedActivity,
    definition: ActivityDefinition
  ): Promise<boolean> {
    try {
      // Check minimum gap between resets
      const lastReset = await this.getLastTimeoutReset(activity.sessionId);
      if (lastReset) {
        const timeSinceReset = activity.timestamp.getTime() - lastReset.getTime();
        if (timeSinceReset < definition.timeoutReset.minimumGapBetweenResets * 1000) {
          return false;
        }
      }

      // Perform the timeout reset
      const resetResult = await this.timeoutService.recordActivity(
        activity.sessionId,
        `${activity.source.type}:${activity.source.endpoint || 'unknown'}`,
        {
          timestamp: activity.timestamp,
          resetIdle: definition.timeoutReset.shouldResetIdle,
          userInitiated: true
        }
      );

      if (resetResult.idleReset) {
        // Record the reset
        await this.recordTimeoutReset(activity, definition);
        
        this.emit('timeoutReset', {
          sessionId: activity.sessionId,
          userId: activity.userId,
          activityType: activity.source.type,
          confidence: activity.outcome.confidence
        });
      }

      return resetResult.idleReset;

    } catch (error) {
      console.error('Error performing timeout reset:', error);
      return false;
    }
  }

  private initializeDefaultDefinitions(): void {
    const definitions: Array<Omit<ActivityDefinition, 'id'>> = [
      {
        name: 'API Request Activity',
        description: 'User-initiated API requests',
        enabled: true,
        detection: {
          type: 'api_call',
          patterns: [{
            method: 'POST',
            userInitiated: true
          }, {
            method: 'PUT',
            userInitiated: true
          }],
          filters: {
            excludePaths: ['/health', '/metrics', '/ping'],
            requireAuthentication: true,
            minTimeBetweenActivities: 1000 // 1 second
          }
        },
        validation: {
          requiresValidSession: true,
          requiresCSRFToken: true,
          checkUserAgent: true,
          checkIPConsistency: true,
          validateTimestamp: true,
          timestampTolerance: 30000 // 30 seconds
        },
        scoring: {
          baseScore: 80,
          modifiers: [{
            condition: 'method === "POST"',
            scoreMultiplier: 1.2,
            reason: 'POST requests typically indicate user action'
          }],
          antiPatterns: [{
            pattern: 'rapid_successive_calls',
            penaltyScore: 30,
            description: 'Too many calls in short succession'
          }]
        },
        timeoutReset: {
          shouldResetIdle: true,
          shouldResetInactivity: true,
          resetGracePeriod: 5,
          minimumGapBetweenResets: 10,
          resetScope: 'session'
        }
      },
      {
        name: 'Page Navigation',
        description: 'User navigating between pages',
        enabled: true,
        detection: {
          type: 'http_request',
          patterns: [{
            method: 'GET',
            userInitiated: true
          }],
          filters: {
            excludePaths: ['/assets/', '/static/', '/api/'],
            requireAuthentication: true,
            minTimeBetweenActivities: 2000 // 2 seconds
          }
        },
        validation: {
          requiresValidSession: true,
          requiresCSRFToken: false,
          checkUserAgent: true,
          checkIPConsistency: true,
          validateTimestamp: true,
          timestampTolerance: 10000 // 10 seconds
        },
        scoring: {
          baseScore: 90,
          modifiers: [{
            condition: 'referrer !== null',
            scoreMultiplier: 1.1,
            reason: 'Referrer indicates natural navigation'
          }],
          antiPatterns: [{
            pattern: 'no_referrer_rapid_navigation',
            penaltyScore: 40,
            description: 'Rapid navigation without referrer'
          }]
        },
        timeoutReset: {
          shouldResetIdle: true,
          shouldResetInactivity: true,
          resetGracePeriod: 3,
          minimumGapBetweenResets: 5,
          resetScope: 'session'
        }
      },
      {
        name: 'User Interaction',
        description: 'Direct user interface interactions',
        enabled: true,
        detection: {
          type: 'user_interaction',
          patterns: [{
            userInitiated: true
          }],
          filters: {
            requireAuthentication: true,
            minTimeBetweenActivities: 500 // 0.5 seconds
          }
        },
        validation: {
          requiresValidSession: true,
          requiresCSRFToken: false,
          checkUserAgent: true,
          checkIPConsistency: false,
          validateTimestamp: true,
          timestampTolerance: 5000 // 5 seconds
        },
        scoring: {
          baseScore: 95,
          modifiers: [],
          antiPatterns: [{
            pattern: 'impossible_speed',
            penaltyScore: 80,
            description: 'Interactions happening faster than humanly possible'
          }]
        },
        timeoutReset: {
          shouldResetIdle: true,
          shouldResetInactivity: true,
          resetGracePeriod: 1,
          minimumGapBetweenResets: 2,
          resetScope: 'session'
        }
      }
    ];

    definitions.forEach(def => {
      const id = this.generateDefinitionId();
      this.activityDefinitions.set(id, { ...def, id });
    });
  }

  private initializeDefaultPatterns(): void {
    // Initialize default suspicious activity patterns
    const patterns: Array<Omit<ActivityPattern, 'id'>> = [
      {
        name: 'Rapid Fire Requests',
        description: 'Too many requests in short succession',
        pattern: {
          type: 'frequency',
          windowSize: 10000, // 10 seconds
          minOccurrences: 20,
          conditions: [{
            field: 'source.type',
            operator: 'equals',
            value: 'api_call',
            weight: 1
          }],
          relationships: []
        },
        scoring: {
          genuinessIndicator: -50,
          automationIndicator: 80,
          suspiciousIndicator: 70
        },
        response: {
          blockActivity: false,
          requireAdditionalValidation: true,
          adjustTimeoutBehavior: true,
          notifySecurityTeam: true,
          logLevel: 'warn'
        }
      }
    ];

    patterns.forEach(pattern => {
      const id = this.generatePatternId();
      this.activityPatterns.set(id, { ...pattern, id });
    });
  }

  private startBackgroundProcessing(): void {
    // Start periodic cleanup and analysis
    setInterval(() => {
      this.performMaintenance();
    }, 60000); // Every minute
  }

  private async performMaintenance(): Promise<void> {
    // Clean up old activities
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    
    for (const [sessionId, activities] of this.recentActivities.entries()) {
      const filtered = activities.filter(a => a.timestamp > cutoff);
      if (filtered.length === 0) {
        this.recentActivities.delete(sessionId);
      } else {
        this.recentActivities.set(sessionId, filtered);
      }
    }
  }

  private validateSession(sessionId: string): Promise<boolean> {
    // Implementation would validate session with session service
    return Promise.resolve(true);
  }

  private validateTimestamp(timestamp: Date, tolerance: number): boolean {
    const now = Date.now();
    const diff = Math.abs(now - timestamp.getTime());
    return diff <= tolerance;
  }

  private evaluateCondition(activity: DetectedActivity, condition: string): boolean {
    // Simple condition evaluation - would use a proper expression evaluator
    try {
      return eval(condition);
    } catch {
      return false;
    }
  }

  private matchesAntiPattern(activity: DetectedActivity, pattern: string): boolean {
    // Check for common anti-patterns
    switch (pattern) {
      case 'rapid_successive_calls':
        return this.checkRapidSuccessiveCalls(activity);
      case 'no_referrer_rapid_navigation':
        return !activity.source.referrer && this.checkRapidNavigation(activity);
      case 'impossible_speed':
        return this.checkImpossibleSpeed(activity);
      default:
        return false;
    }
  }

  private checkRapidSuccessiveCalls(activity: DetectedActivity): boolean {
    const recent = this.recentActivities.get(activity.sessionId) || [];
    const recentApiCalls = recent.filter(a => 
      a.source.type === 'api_call' &&
      a.timestamp.getTime() > activity.timestamp.getTime() - 5000 // 5 seconds
    );
    return recentApiCalls.length > 10;
  }

  private checkRapidNavigation(activity: DetectedActivity): boolean {
    const recent = this.recentActivities.get(activity.sessionId) || [];
    const recentNavigation = recent.filter(a => 
      a.source.type === 'http_request' &&
      a.timestamp.getTime() > activity.timestamp.getTime() - 10000 // 10 seconds
    );
    return recentNavigation.length > 5;
  }

  private checkImpossibleSpeed(activity: DetectedActivity): boolean {
    const recent = this.recentActivities.get(activity.sessionId) || [];
    if (recent.length === 0) return false;
    
    const lastActivity = recent[recent.length - 1];
    const timeDiff = activity.timestamp.getTime() - lastActivity.timestamp.getTime();
    return timeDiff < 100; // Less than 100ms between activities
  }

  private async analyzeActivityTiming(activity: DetectedActivity): Promise<{ suspicious: boolean }> {
    // Analyze timing patterns for suspicious behavior
    const recent = this.recentActivities.get(activity.sessionId) || [];
    
    if (recent.length < 3) {
      return { suspicious: false };
    }

    // Check for perfectly regular intervals (bot-like behavior)
    const intervals = [];
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i].timestamp.getTime() - recent[i-1].timestamp.getTime());
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    // If standard deviation is very low, it might be automated
    const suspicious = standardDeviation < avgInterval * 0.1 && avgInterval < 2000; // Less than 2 seconds

    return { suspicious };
  }

  private async storeActivity(activity: DetectedActivity): Promise<void> {
    // Add to session activities
    const sessionActivities = this.recentActivities.get(activity.sessionId) || [];
    sessionActivities.push(activity);
    
    // Keep only recent activities
    if (sessionActivities.length > 100) {
      sessionActivities.shift();
    }
    
    this.recentActivities.set(activity.sessionId, sessionActivities);

    // Store in Redis for persistence
    await this.redis.lpush(`activities:${activity.sessionId}`, JSON.stringify(activity));
    await this.redis.ltrim(`activities:${activity.sessionId}`, 0, 99); // Keep last 100
    await this.redis.expire(`activities:${activity.sessionId}`, 86400); // 24 hour TTL
  }

  private generateActivityId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  private generateDefinitionId(): string {
    return `DEF-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  private generatePatternId(): string {
    return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  destroy(): void {
    this.activityDefinitions.clear();
    this.activityPatterns.clear();
    this.activeSessions.clear();
    this.userBaselines.clear();
    this.recentActivities.clear();
  }
}