/**
 * Security Event Enrichment Service
 * Enhances security events with additional context, metadata, and threat intelligence
 */

import { SecurityEvent } from './SecurityEventCoordinator';
import { DeviceFingerprintingService } from './DeviceFingerprintingService';
import { LocationDetectionService } from './LocationDetectionService';
import { RiskScoringService } from './RiskScoringService';
import { logger } from '../utils/logger';

export interface GeolocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp?: string;
  organization?: string;
  asn?: string;
  isProxy?: boolean;
  isVPN?: boolean;
  isTor?: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeviceFingerprint {
  id: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  screenResolution?: string;
  timezone: string;
  language: string;
  plugins: string[];
  isKnown: boolean;
  firstSeen: Date;
  lastSeen: Date;
  trustLevel: number; // 0-100
}

export interface UserBehaviorContext {
  averageSessionDuration: number;
  typicalLoginTimes: number[]; // hours of day
  typicalDaysOfWeek: number[];
  frequentLocations: string[];
  typicalDevices: string[];
  averageActionsPerSession: number;
  riskScore: number;
  behaviorFlags: string[];
  lastLoginDate: Date;
  loginFrequency: number; // logins per day
}

export interface ThreatIntelligence {
  ipReputation: {
    score: number; // 0-100, lower is worse
    categories: string[]; // malware, spam, phishing, etc.
    lastSeen: Date;
    sources: string[];
  };
  knownAttackPatterns: {
    matches: string[];
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  compromisedCredentials: {
    isCompromised: boolean;
    breachSources: string[];
    lastBreachDate?: Date;
  };
}

export interface SessionAnalytics {
  sessionAge: number; // minutes
  activityCount: number;
  lastActivity: Date;
  concurrentSessions: number;
  locationChanges: number;
  deviceChanges: number;
  privilegeEscalations: number;
  suspiciousActivities: string[];
}

export class SecurityEventEnrichmentService {
  private deviceFingerprintingService: DeviceFingerprintingService;
  private locationDetectionService: LocationDetectionService;
  private riskScoringService: RiskScoringService;
  private ipReputationCache: Map<string, ThreatIntelligence> = new Map();
  private userBehaviorCache: Map<string, UserBehaviorContext> = new Map();
  private deviceFingerprintCache: Map<string, DeviceFingerprint> = new Map();

  constructor(
    deviceFingerprintingService: DeviceFingerprintingService,
    locationDetectionService: LocationDetectionService,
    riskScoringService: RiskScoringService
  ) {
    this.deviceFingerprintingService = deviceFingerprintingService;
    this.locationDetectionService = locationDetectionService;
    this.riskScoringService = riskScoringService;
    
    // Start cache cleanup interval
    this.startCacheCleanup();
  }

  /**
   * Enrich a security event with comprehensive context
   */
  public async enrichSecurityEvent(event: SecurityEvent): Promise<SecurityEvent> {
    try {
      const enrichmentData: Record<string, any> = {};

      // Parallel enrichment for better performance
      const enrichmentPromises = [];

      // Geographic enrichment
      if (event.ipAddress) {
        enrichmentPromises.push(
          this.enrichWithGeolocation(event.ipAddress)
            .then(data => { enrichmentData.geolocation = data; })
            .catch(err => logger.log(`Geolocation enrichment failed: ${err}`))
        );
        
        enrichmentPromises.push(
          this.enrichWithThreatIntelligence(event.ipAddress)
            .then(data => { enrichmentData.threatIntelligence = data; })
            .catch(err => logger.log(`Threat intelligence enrichment failed: ${err}`))
        );
      }

      // Device fingerprinting
      if (event.userAgent) {
        enrichmentPromises.push(
          this.enrichWithDeviceFingerprint(event.userAgent, event.userId)
            .then(data => { enrichmentData.deviceFingerprint = data; })
            .catch(err => logger.log(`Device fingerprint enrichment failed: ${err}`))
        );
      }

      // User behavior analysis
      if (event.userId) {
        enrichmentPromises.push(
          this.enrichWithUserBehavior(event.userId, event.timestamp)
            .then(data => { enrichmentData.userBehavior = data; })
            .catch(err => logger.log(`User behavior enrichment failed: ${err}`))
        );
        
        enrichmentPromises.push(
          this.riskScoringService.calculateUserRisk(event.userId, event.type, event.details)
            .then(score => { enrichmentData.riskScore = score; })
            .catch(err => logger.log(`Risk scoring failed: ${err}`))
        );
      }

      // Session analytics
      if (event.sessionId) {
        enrichmentPromises.push(
          this.enrichWithSessionAnalytics(event.sessionId)
            .then(data => { enrichmentData.sessionAnalytics = data; })
            .catch(err => logger.log(`Session analytics enrichment failed: ${err}`))
        );
      }

      // Time-based context
      enrichmentData.timeContext = this.enrichWithTimeContext(event.timestamp);
      
      // Event classification
      enrichmentData.eventClassification = this.classifyEvent(event);
      
      // Attack pattern analysis
      enrichmentData.attackPatterns = await this.analyzeAttackPatterns(event);

      // Wait for all enrichment to complete
      await Promise.all(enrichmentPromises);

      // Calculate overall threat level
      enrichmentData.overallThreatLevel = this.calculateOverallThreatLevel(enrichmentData);
      
      // Add enrichment metadata
      enrichmentData.enrichmentTimestamp = new Date();
      enrichmentData.enrichmentVersion = '1.0.0';
      
      return {
        ...event,
        enrichmentData
      };
      
    } catch (error) {
      logger.log(`Security event enrichment failed: ${error}`);
      // Return original event with minimal enrichment on failure
      return {
        ...event,
        enrichmentData: {
          enrichmentError: error.toString(),
          enrichmentTimestamp: new Date(),
          timeContext: this.enrichWithTimeContext(event.timestamp)
        }
      };
    }
  }

  /**
   * Enrich with geolocation data
   */
  private async enrichWithGeolocation(ipAddress: string): Promise<GeolocationData> {
    try {
      // Use location detection service
      const location = await this.locationDetectionService.detectLocation(ipAddress);
      
      // Enhance with additional threat indicators
      const threatLevel = this.assessLocationThreatLevel(location);
      
      return {
        country: location.country || 'Unknown',
        countryCode: location.countryCode || 'XX',
        region: location.region || 'Unknown',
        city: location.city || 'Unknown',
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        timezone: location.timezone || 'UTC',
        isp: location.isp,
        organization: location.organization,
        asn: location.asn,
        isProxy: location.isProxy || false,
        isVPN: location.isVPN || false,
        isTor: location.isTor || false,
        threatLevel
      };
    } catch (error) {
      return {
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        threatLevel: 'medium'
      };
    }
  }

  /**
   * Enrich with device fingerprinting data
   */
  private async enrichWithDeviceFingerprint(
    userAgent: string, 
    userId?: string
  ): Promise<DeviceFingerprint> {
    try {
      const fingerprintId = await this.deviceFingerprintingService.generateFingerprint({
        userAgent,
        // Additional fingerprinting data would be collected client-side
      });
      
      // Check cache first
      if (this.deviceFingerprintCache.has(fingerprintId)) {
        return this.deviceFingerprintCache.get(fingerprintId)!;
      }
      
      const deviceInfo = this.parseUserAgent(userAgent);
      const isKnown = userId ? await this.isKnownDevice(fingerprintId, userId) : false;
      const trustLevel = await this.calculateDeviceTrustLevel(fingerprintId, userId);
      
      const fingerprint: DeviceFingerprint = {
        id: fingerprintId,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        device: deviceInfo.device,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        plugins: deviceInfo.plugins,
        isKnown,
        firstSeen: isKnown ? await this.getDeviceFirstSeen(fingerprintId) : new Date(),
        lastSeen: new Date(),
        trustLevel
      };
      
      // Cache the result
      this.deviceFingerprintCache.set(fingerprintId, fingerprint);
      
      return fingerprint;
    } catch (error) {
      return {
        id: 'unknown',
        browser: 'Unknown',
        browserVersion: 'Unknown',
        os: 'Unknown',
        osVersion: 'Unknown',
        device: 'Unknown',
        timezone: 'UTC',
        language: 'en',
        plugins: [],
        isKnown: false,
        firstSeen: new Date(),
        lastSeen: new Date(),
        trustLevel: 50
      };
    }
  }

  /**
   * Enrich with user behavior context
   */
  private async enrichWithUserBehavior(
    userId: string, 
    eventTime: Date
  ): Promise<UserBehaviorContext> {
    try {
      // Check cache first
      if (this.userBehaviorCache.has(userId)) {
        return this.userBehaviorCache.get(userId)!;
      }
      
      // Analyze user's historical behavior patterns
      const behaviorAnalysis = await this.analyzeUserBehavior(userId);
      
      // Calculate behavior anomaly score
      const behaviorScore = this.calculateBehaviorAnomalyScore(behaviorAnalysis, eventTime);
      
      const behaviorContext: UserBehaviorContext = {
        averageSessionDuration: behaviorAnalysis.avgSessionDuration || 30,
        typicalLoginTimes: behaviorAnalysis.loginHours || [],
        typicalDaysOfWeek: behaviorAnalysis.loginDays || [],
        frequentLocations: behaviorAnalysis.locations || [],
        typicalDevices: behaviorAnalysis.devices || [],
        averageActionsPerSession: behaviorAnalysis.avgActions || 10,
        riskScore: behaviorScore,
        behaviorFlags: this.generateBehaviorFlags(behaviorAnalysis, eventTime),
        lastLoginDate: behaviorAnalysis.lastLogin || new Date(),
        loginFrequency: behaviorAnalysis.loginFreq || 1
      };
      
      // Cache with TTL
      this.userBehaviorCache.set(userId, behaviorContext);
      
      return behaviorContext;
    } catch (error) {
      return {
        averageSessionDuration: 30,
        typicalLoginTimes: [],
        typicalDaysOfWeek: [],
        frequentLocations: [],
        typicalDevices: [],
        averageActionsPerSession: 10,
        riskScore: 50,
        behaviorFlags: ['analysis_failed'],
        lastLoginDate: new Date(),
        loginFrequency: 1
      };
    }
  }

  /**
   * Enrich with threat intelligence data
   */
  private async enrichWithThreatIntelligence(ipAddress: string): Promise<ThreatIntelligence> {
    try {
      // Check cache first
      if (this.ipReputationCache.has(ipAddress)) {
        return this.ipReputationCache.get(ipAddress)!;
      }
      
      // Query multiple threat intelligence sources
      const [reputation, knownPatterns, credentialCheck] = await Promise.all([
        this.getIPReputation(ipAddress),
        this.checkKnownAttackPatterns(ipAddress),
        this.checkCompromisedCredentials(ipAddress)
      ]);
      
      const intelligence: ThreatIntelligence = {
        ipReputation: reputation,
        knownAttackPatterns: knownPatterns,
        compromisedCredentials: credentialCheck
      };
      
      // Cache with TTL
      this.ipReputationCache.set(ipAddress, intelligence);
      
      return intelligence;
    } catch (error) {
      return {
        ipReputation: {
          score: 50,
          categories: [],
          lastSeen: new Date(),
          sources: []
        },
        knownAttackPatterns: {
          matches: [],
          confidence: 0,
          severity: 'low'
        },
        compromisedCredentials: {
          isCompromised: false,
          breachSources: []
        }
      };
    }
  }

  /**
   * Enrich with session analytics
   */
  private async enrichWithSessionAnalytics(sessionId: string): Promise<SessionAnalytics> {
    try {
      // Analyze current session
      const sessionData = await this.getSessionData(sessionId);
      
      return {
        sessionAge: Math.floor((Date.now() - sessionData.startTime) / (1000 * 60)),
        activityCount: sessionData.activities?.length || 0,
        lastActivity: sessionData.lastActivity || new Date(),
        concurrentSessions: sessionData.concurrentSessions || 1,
        locationChanges: sessionData.locationChanges || 0,
        deviceChanges: sessionData.deviceChanges || 0,
        privilegeEscalations: sessionData.privilegeEscalations || 0,
        suspiciousActivities: sessionData.suspiciousActivities || []
      };
    } catch (error) {
      return {
        sessionAge: 0,
        activityCount: 0,
        lastActivity: new Date(),
        concurrentSessions: 1,
        locationChanges: 0,
        deviceChanges: 0,
        privilegeEscalations: 0,
        suspiciousActivities: []
      };
    }
  }

  /**
   * Enrich with time-based context
   */
  private enrichWithTimeContext(timestamp: Date): any {
    const hour = timestamp.getHours();
    const day = timestamp.getDay();
    const date = timestamp.getDate();
    const month = timestamp.getMonth();
    
    return {
      hour,
      day,
      date,
      month,
      isWeekend: day === 0 || day === 6,
      isBusinessHours: hour >= 9 && hour <= 17,
      isNightTime: hour >= 22 || hour <= 6,
      isEarlyMorning: hour >= 4 && hour <= 8,
      isLateEvening: hour >= 20 && hour <= 23,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
      monthName: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month],
      quarter: Math.floor(month / 3) + 1,
      timestamp: timestamp.toISOString()
    };
  }

  /**
   * Classify the security event
   */
  private classifyEvent(event: SecurityEvent): any {
    const classifications = [];
    
    // Authentication-related events
    if (['login_success', 'login_failed', 'logout', '2fa_attempted'].includes(event.type)) {
      classifications.push('authentication');
    }
    
    // Authorization-related events
    if (['permission_granted', 'permission_revoked', 'role_assigned'].includes(event.type)) {
      classifications.push('authorization');
    }
    
    // Suspicious activity
    if (['suspicious_login', 'brute_force_attempt', 'unusual_location'].includes(event.type)) {
      classifications.push('suspicious', 'potential_threat');
    }
    
    // Account management
    if (['user_created', 'user_updated', 'account_locked'].includes(event.type)) {
      classifications.push('account_management');
    }
    
    return {
      categories: classifications,
      severity: event.severity,
      confidence: this.calculateClassificationConfidence(event),
      tags: this.generateEventTags(event)
    };
  }

  /**
   * Analyze potential attack patterns
   */
  private async analyzeAttackPatterns(event: SecurityEvent): Promise<any> {
    const patterns = [];
    
    // Check for common attack patterns
    if (event.type === 'login_failed' && event.details?.attemptCount > 3) {
      patterns.push({
        type: 'credential_stuffing',
        confidence: 0.7,
        indicators: ['multiple_failures', 'rapid_attempts']
      });
    }
    
    if (event.ipAddress && await this.isFromSuspiciousLocation(event.ipAddress)) {
      patterns.push({
        type: 'geographic_anomaly',
        confidence: 0.6,
        indicators: ['unusual_location', 'geographic_distance']
      });
    }
    
    return {
      detectedPatterns: patterns,
      riskScore: patterns.reduce((sum, p) => sum + p.confidence, 0) / Math.max(patterns.length, 1),
      indicators: patterns.flatMap(p => p.indicators)
    };
  }

  /**
   * Calculate overall threat level based on all enrichment data
   */
  private calculateOverallThreatLevel(enrichmentData: any): string {
    let score = 0;
    let factors = 0;
    
    // IP reputation
    if (enrichmentData.threatIntelligence?.ipReputation) {
      score += (100 - enrichmentData.threatIntelligence.ipReputation.score);
      factors++;
    }
    
    // Geolocation threat level
    if (enrichmentData.geolocation?.threatLevel) {
      const threatScores = { low: 10, medium: 30, high: 60, critical: 90 };
      score += threatScores[enrichmentData.geolocation.threatLevel];
      factors++;
    }
    
    // User behavior risk
    if (enrichmentData.userBehavior?.riskScore) {
      score += enrichmentData.userBehavior.riskScore;
      factors++;
    }
    
    // Device trust level
    if (enrichmentData.deviceFingerprint?.trustLevel) {
      score += (100 - enrichmentData.deviceFingerprint.trustLevel);
      factors++;
    }
    
    const averageScore = factors > 0 ? score / factors : 50;
    
    if (averageScore >= 80) return 'critical';
    if (averageScore >= 60) return 'high';
    if (averageScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Helper methods (would be implemented with real data sources)
   */
  private assessLocationThreatLevel(location: any): 'low' | 'medium' | 'high' | 'critical' {
    if (location.isTor || location.isVPN) return 'high';
    if (location.isProxy) return 'medium';
    return 'low';
  }

  private parseUserAgent(userAgent: string): any {
    // Mock implementation - would use a proper user agent parser
    return {
      browser: 'Unknown',
      browserVersion: '0.0',
      os: 'Unknown',
      osVersion: '0.0',
      device: 'Unknown',
      timezone: 'UTC',
      language: 'en',
      plugins: []
    };
  }

  private async isKnownDevice(fingerprintId: string, userId?: string): Promise<boolean> {
    // Mock implementation - would check device history
    return false;
  }

  private async calculateDeviceTrustLevel(fingerprintId: string, userId?: string): Promise<number> {
    // Mock implementation - would calculate based on device history
    return 50;
  }

  private async getDeviceFirstSeen(fingerprintId: string): Promise<Date> {
    // Mock implementation
    return new Date();
  }

  private async analyzeUserBehavior(userId: string): Promise<any> {
    // Mock implementation - would analyze historical behavior
    return {
      avgSessionDuration: 30,
      loginHours: [9, 10, 14, 16],
      loginDays: [1, 2, 3, 4, 5],
      locations: [],
      devices: [],
      avgActions: 10,
      lastLogin: new Date(),
      loginFreq: 1
    };
  }

  private calculateBehaviorAnomalyScore(analysis: any, eventTime: Date): number {
    // Mock implementation - would calculate behavioral anomaly score
    return 50;
  }

  private generateBehaviorFlags(analysis: any, eventTime: Date): string[] {
    const flags = [];
    const hour = eventTime.getHours();
    const day = eventTime.getDay();
    
    if (!analysis.loginHours.includes(hour)) {
      flags.push('unusual_time');
    }
    
    if (!analysis.loginDays.includes(day)) {
      flags.push('unusual_day');
    }
    
    return flags;
  }

  private async getIPReputation(ipAddress: string): Promise<any> {
    // Mock implementation - would query threat intelligence feeds
    return {
      score: 75,
      categories: [],
      lastSeen: new Date(),
      sources: ['mock_feed']
    };
  }

  private async checkKnownAttackPatterns(ipAddress: string): Promise<any> {
    // Mock implementation - would check against known attack patterns
    return {
      matches: [],
      confidence: 0,
      severity: 'low'
    };
  }

  private async checkCompromisedCredentials(ipAddress: string): Promise<any> {
    // Mock implementation - would check breach databases
    return {
      isCompromised: false,
      breachSources: []
    };
  }

  private async getSessionData(sessionId: string): Promise<any> {
    // Mock implementation - would get session analytics
    return {
      startTime: Date.now() - 1800000, // 30 minutes ago
      activities: [],
      lastActivity: new Date(),
      concurrentSessions: 1,
      locationChanges: 0,
      deviceChanges: 0,
      privilegeEscalations: 0,
      suspiciousActivities: []
    };
  }

  private calculateClassificationConfidence(event: SecurityEvent): number {
    // Mock implementation - would calculate classification confidence
    return 0.8;
  }

  private generateEventTags(event: SecurityEvent): string[] {
    const tags = [event.type, event.severity];
    
    if (event.userId) tags.push('user_related');
    if (event.sessionId) tags.push('session_related');
    if (event.ipAddress) tags.push('network_related');
    
    return tags;
  }

  private async isFromSuspiciousLocation(ipAddress: string): Promise<boolean> {
    // Mock implementation - would check against suspicious location database
    return false;
  }

  /**
   * Start cache cleanup to prevent memory leaks
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      // Clean up caches periodically
      if (this.ipReputationCache.size > 10000) {
        this.ipReputationCache.clear();
      }
      if (this.userBehaviorCache.size > 5000) {
        this.userBehaviorCache.clear();
      }
      if (this.deviceFingerprintCache.size > 5000) {
        this.deviceFingerprintCache.clear();
      }
    }, 60 * 60 * 1000); // Clean every hour
  }
}
