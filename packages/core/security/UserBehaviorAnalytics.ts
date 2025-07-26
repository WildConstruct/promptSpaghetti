/**
 * Epic 31.4.2 - User Behavior Modeling and Anomaly Detection
 * 
 * Implements advanced user behavior analytics to detect anomalous patterns
 * and potential security threats through machine learning algorithms.
 * Integrates with Epic 1 analytics infrastructure and Epic 17 user management.
 * 
 * Task: E31-1753313263588-A09495
 */

import { EventEmitter } from 'events';

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface UserBehaviorEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  actionType: UserActionType;
  resource: string;
  metadata: Record<string, unknown>;
  sourceIP: string;
  userAgent: string;
  geolocation?: GeolocationData;
  success: boolean;
  duration?: number;
  dataVolumeBytes?: number;
}

export enum UserActionType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  FILE_ACCESS = 'file_access',
  FILE_DOWNLOAD = 'file_download',
  FILE_UPLOAD = 'file_upload',
  API_CALL = 'api_call',
  PERMISSION_REQUEST = 'permission_request',
  CONFIGURATION_CHANGE = 'configuration_change',
  DATA_EXPORT = 'data_export',
  ADMIN_ACTION = 'admin_action',
  SEARCH_QUERY = 'search_query',
  NAVIGATION = 'navigation'
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface UserBehaviorProfile {
  userId: string;
  createdAt: Date;
  lastUpdated: Date;
  totalEvents: number;
  
  // Temporal patterns
  typicalLoginTimes: number[]; // Hours of day (0-23)
  typicalDaysOfWeek: number[]; // Days (0-6, Sunday=0)
  averageSessionDuration: number;
  typicalLoginFrequency: number; // Logins per day
  
  // Geographic patterns
  commonLocations: GeolocationData[];
  travelPatterns: TravelPattern[];
  suspiciousLocationThreshold: number;
  
  // Access patterns
  commonResources: ResourceAccess[];
  typicalActionDistribution: Record<UserActionType, number>;
  peakActivityHours: number[];
  
  // Security patterns
  failureRate: number;
  riskyBehaviorScore: number;
  privilegedAccessFrequency: number;
  
  // Device and technical patterns
  commonUserAgents: string[];
  typicalDeviceCount: number;
  ipAddressStability: number;
  
  // Behavioral scoring
  baselineRiskScore: number;
  anomalyThreshold: number;
  adaptationRate: number;
}

export interface TravelPattern {
  fromLocation: GeolocationData;
  toLocation: GeolocationData;
  frequency: number;
  typicalDuration: number;
  lastOccurrence: Date;
}

export interface ResourceAccess {
  resource: string;
  accessCount: number;
  averageAccessTime: number;
  typicalAccessPattern: number[]; // Hours when typically accessed
  lastAccessed: Date;
  riskScore: number;
}

export interface BehaviorAnomaly {
  id: string;
  userId: string;
  detectedAt: Date;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  confidence: number;
  description: string;
  triggeringEvents: UserBehaviorEvent[];
  deviationScore: number;
  baselineValue: number;
  observedValue: number;
  riskAssessment: RiskAssessment;
  recommendedActions: string[];
  isResolved: boolean;
  resolvedAt?: Date;
  falsePositive?: boolean;
}

export enum AnomalyType {
  UNUSUAL_LOGIN_TIME = 'unusual_login_time',
  UNUSUAL_LOCATION = 'unusual_location',
  EXCESSIVE_ACCESS_VOLUME = 'excessive_access_volume',
  UNUSUAL_RESOURCE_ACCESS = 'unusual_resource_access',
  RAPID_PERMISSION_ESCALATION = 'rapid_permission_escalation',
  SUSPICIOUS_DATA_EXPORT = 'suspicious_data_export',
  ABNORMAL_SESSION_DURATION = 'abnormal_session_duration',
  UNUSUAL_DEVICE_USAGE = 'unusual_device_usage',
  ATYPICAL_NAVIGATION_PATTERN = 'atypical_navigation_pattern',
  BULK_DATA_ACCESS = 'bulk_data_access',
  OFF_HOURS_ACTIVITY = 'off_hours_activity',
  IMPOSSIBLE_TRAVEL = 'impossible_travel'
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RiskAssessment {
  overallRisk: number; // 0-100
  businessImpact: number; // 0-100
  probabilityOfThreat: number; // 0-100
  potentialDamage: string[];
  mitigationUrgency: 'low' | 'medium' | 'high' | 'immediate';
}

export interface BehaviorAnalyticsConfig {
  profileUpdateInterval: number;
  anomalyDetectionSensitivity: number;
  baselineTrainingPeriod: number;
  maxProfileAge: number;
  enableRealTimeDetection: boolean;
  enableGeolocationTracking: boolean;
  minEventsForProfile: number;
  adaptiveThresholding: boolean;
}

// ==========================================
// MAIN SERVICE CLASS
// ==========================================

export class UserBehaviorAnalytics extends EventEmitter {
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private recentEvents: Map<string, UserBehaviorEvent[]> = new Map();
  private detectedAnomalies: Map<string, BehaviorAnomaly> = new Map();
  private config: BehaviorAnalyticsConfig;
  private analysisInterval?: NodeJS.Timeout;
  private isAnalyzing = false;

  constructor(config: Partial<BehaviorAnalyticsConfig> = {}) {
    super();
    
    this.config = {
      profileUpdateInterval: 3600000, // 1 hour
      anomalyDetectionSensitivity: 0.7,
      baselineTrainingPeriod: 604800000, // 7 days
      maxProfileAge: 7776000000, // 90 days
      enableRealTimeDetection: true,
      enableGeolocationTracking: true,
      minEventsForProfile: 50,
      adaptiveThresholding: true,
      ...config
    };

    if (this.config.enableRealTimeDetection) {
      this.startRealTimeAnalysis();
    }
  }

  // ==========================================
  // EVENT PROCESSING
  // ==========================================

  /**
   * Process incoming user behavior event
   */
  public async processUserEvent(event: UserBehaviorEvent): Promise<void> {
    try {
      // Store event in recent events
      if (!this.recentEvents.has(event.userId)) {
        this.recentEvents.set(event.userId, []);
      }
      this.recentEvents.get(event.userId)!.push(event);
      this.cleanupOldEvents(event.userId);

      // Update or create user profile
      await this.updateUserProfile(event);

      // Detect anomalies in real-time
      if (this.config.enableRealTimeDetection) {
        await this.detectAnomalies(event);
      }

      this.emit('eventProcessed', event);
    } catch (error) {
      console.error('Error processing user behavior event:', error);
      this.emit('error', { error, event });
    }
  }

  /**
   * Update user behavioral profile based on new event
   */
  private async updateUserProfile(event: UserBehaviorEvent): Promise<void> {
    let profile = this.userProfiles.get(event.userId);
    
    if (!profile) {
      profile = this.createNewProfile(event.userId);
      this.userProfiles.set(event.userId, profile);
    }

    // Update temporal patterns
    this.updateTemporalPatterns(profile, event);
    
    // Update geographic patterns
    if (this.config.enableGeolocationTracking && event.geolocation) {
      this.updateGeographicPatterns(profile, event);
    }
    
    // Update access patterns
    this.updateAccessPatterns(profile, event);
    
    // Update security patterns
    this.updateSecurityPatterns(profile, event);
    
    // Update device patterns
    this.updateDevicePatterns(profile, event);
    
    // Recalculate risk scores
    this.updateRiskScores(profile);
    
    profile.lastUpdated = new Date();
    profile.totalEvents += 1;

    this.emit('profileUpdated', { userId: event.userId, profile });
  }

  // ==========================================
  // PROFILE MANAGEMENT
  // ==========================================

  private createNewProfile(userId: string): UserBehaviorProfile {
    return {
      userId,
      createdAt: new Date(),
      lastUpdated: new Date(),
      totalEvents: 0,
      typicalLoginTimes: [],
      typicalDaysOfWeek: [],
      averageSessionDuration: 0,
      typicalLoginFrequency: 0,
      commonLocations: [],
      travelPatterns: [],
      suspiciousLocationThreshold: 1000, // km
      commonResources: [],
      typicalActionDistribution: {} as Record<UserActionType, number>,
      peakActivityHours: [],
      failureRate: 0,
      riskyBehaviorScore: 0,
      privilegedAccessFrequency: 0,
      commonUserAgents: [],
      typicalDeviceCount: 1,
      ipAddressStability: 1.0,
      baselineRiskScore: 0,
      anomalyThreshold: 0.7,
      adaptationRate: 0.1
    };
  }

  private updateTemporalPatterns(profile: UserBehaviorProfile, event: UserBehaviorEvent): void {
    const hour = event.timestamp.getHours();
    const dayOfWeek = event.timestamp.getDay();

    // Update login times for login events
    if (event.actionType === UserActionType.LOGIN) {
      this.updateArrayPattern(profile.typicalLoginTimes, hour, 24);
      this.updateArrayPattern(profile.typicalDaysOfWeek, dayOfWeek, 7);
    }

    // Update peak activity hours
    this.updateArrayPattern(profile.peakActivityHours, hour, 24);
  }

  private updateGeographicPatterns(profile: UserBehaviorProfile, event: UserBehaviorEvent): void {
    if (!event.geolocation) return;

    // Add to common locations if not already present
    const existingLocation = profile.commonLocations.find(loc =>
      this.calculateDistance(loc, event.geolocation!) < 50 // 50km threshold
    );

    if (!existingLocation) {
      profile.commonLocations.push(event.geolocation);
      
      // Limit to most recent 10 locations
      if (profile.commonLocations.length > 10) {
        profile.commonLocations = profile.commonLocations.slice(-10);
      }
    }

    // Update travel patterns
    this.updateTravelPatterns(profile, event);
  }

  private updateAccessPatterns(profile: UserBehaviorProfile, event: UserBehaviorEvent): void {
    // Update action distribution
    profile.typicalActionDistribution[event.actionType] = 
      (profile.typicalActionDistribution[event.actionType] || 0) + 1;

    // Update resource access patterns
    let resourceAccess = profile.commonResources.find(r => r.resource === event.resource);
    if (!resourceAccess) {
      resourceAccess = {
        resource: event.resource,
        accessCount: 0,
        averageAccessTime: 0,
        typicalAccessPattern: new Array(24).fill(0),
        lastAccessed: event.timestamp,
        riskScore: 0
      };
      profile.commonResources.push(resourceAccess);
    }

    resourceAccess.accessCount += 1;
    resourceAccess.lastAccessed = event.timestamp;
    resourceAccess.typicalAccessPattern[event.timestamp.getHours()] += 1;
    
    // Calculate risk score based on resource sensitivity
    resourceAccess.riskScore = this.calculateResourceRiskScore(event.resource, event.actionType);
  }

  private updateSecurityPatterns(profile: UserBehaviorProfile, event: UserBehaviorEvent): void {
    // Update failure rate
    if (event.actionType === UserActionType.LOGIN) {
      const recentLogins = this.getRecentEvents(event.userId, UserActionType.LOGIN, 24 * 60 * 60 * 1000);
      const failures = recentLogins.filter(e => !e.success).length;
      profile.failureRate = failures / Math.max(recentLogins.length, 1);
    }

    // Update privileged access frequency
    if (this.isPrivilegedAction(event.actionType)) {
      profile.privilegedAccessFrequency += 1;
    }
  }

  private updateDevicePatterns(profile: UserBehaviorProfile, event: UserBehaviorEvent): void {
    // Update common user agents
    if (!profile.commonUserAgents.includes(event.userAgent)) {
      profile.commonUserAgents.push(event.userAgent);
      
      // Limit to 5 most recent user agents
      if (profile.commonUserAgents.length > 5) {
        profile.commonUserAgents = profile.commonUserAgents.slice(-5);
      }
    }

    // Update IP address stability
    const recentEvents = this.getRecentEvents(event.userId, undefined, 24 * 60 * 60 * 1000);
    const uniqueIPs = new Set(recentEvents.map(e => e.sourceIP)).size;
    profile.typicalDeviceCount = Math.max(profile.typicalDeviceCount, uniqueIPs);
    profile.ipAddressStability = 1 / Math.max(uniqueIPs, 1);
  }

  // ==========================================
  // ANOMALY DETECTION
  // ==========================================

  /**
   * Detect behavioral anomalies in user event
   */
  private async detectAnomalies(event: UserBehaviorEvent): Promise<void> {
    const profile = this.userProfiles.get(event.userId);
    if (!profile || profile.totalEvents < this.config.minEventsForProfile) {
      return; // Need baseline before detecting anomalies
    }

    const anomalies: BehaviorAnomaly[] = [];

    // Check temporal anomalies
    anomalies.push(...this.detectTemporalAnomalies(event, profile));
    
    // Check geographic anomalies
    if (this.config.enableGeolocationTracking && event.geolocation) {
      anomalies.push(...this.detectGeographicAnomalies(event, profile));
    }
    
    // Check access pattern anomalies
    anomalies.push(...this.detectAccessAnomalies(event, profile));
    
    // Check volume anomalies
    anomalies.push(...this.detectVolumeAnomalies(event, profile));
    
    // Check device anomalies
    anomalies.push(...this.detectDeviceAnomalies(event, profile));

    // Process detected anomalies
    for (const anomaly of anomalies) {
      if (anomaly.confidence >= this.config.anomalyDetectionSensitivity) {
        await this.handleAnomaly(anomaly);
      }
    }
  }

  private detectTemporalAnomalies(event: UserBehaviorEvent, profile: UserBehaviorProfile): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];
    const hour = event.timestamp.getHours();
    const dayOfWeek = event.timestamp.getDay();

    // Check unusual login time
    if (event.actionType === UserActionType.LOGIN) {
      const loginTimeFrequency = profile.typicalLoginTimes.filter(h => Math.abs(h - hour) <= 1).length;
      const totalLogins = profile.typicalLoginTimes.length;
      
      if (totalLogins > 10 && loginTimeFrequency / totalLogins < 0.1) {
        anomalies.push(this.createAnomaly(
          event,
          AnomalyType.UNUSUAL_LOGIN_TIME,
          0.8,
          `Login at unusual time: ${hour}:00`,
          AnomalySeverity.MEDIUM
        ));
      }
    }

    // Check off-hours activity
    if (hour < 6 || hour > 22) {
      const offHoursActivity = profile.peakActivityHours.filter(h => h < 6 || h > 22).length;
      const totalActivity = profile.peakActivityHours.length;
      
      if (totalActivity > 50 && offHoursActivity / totalActivity < 0.1) {
        anomalies.push(this.createAnomaly(
          event,
          AnomalyType.OFF_HOURS_ACTIVITY,
          0.6,
          `Activity during off hours: ${hour}:00`,
          AnomalySeverity.LOW
        ));
      }
    }

    return anomalies;
  }

  private detectGeographicAnomalies(event: UserBehaviorEvent, profile: UserBehaviorProfile): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];
    if (!event.geolocation) return anomalies;

    // Check for unknown location
    const minDistance = Math.min(...profile.commonLocations.map(loc =>
      this.calculateDistance(loc, event.geolocation!)
    ));

    if (minDistance > profile.suspiciousLocationThreshold) {
      anomalies.push(this.createAnomaly(
        event,
        AnomalyType.UNUSUAL_LOCATION,
        Math.min(0.9, minDistance / 5000), // Scale with distance
        `Access from unusual location: ${event.geolocation.city}, ${event.geolocation.country}`,
        minDistance > 5000 ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM
      ));
    }

    // Check for impossible travel
    const recentEvents = this.getRecentEvents(event.userId, undefined, 60 * 60 * 1000); // Last hour
    for (const recentEvent of recentEvents) {
      if (recentEvent.geolocation && recentEvent.id !== event.id) {
        const distance = this.calculateDistance(recentEvent.geolocation, event.geolocation);
        const timeDiff = (event.timestamp.getTime() - recentEvent.timestamp.getTime()) / 1000 / 3600; // hours
        const maxSpeed = distance / timeDiff; // km/h

        if (maxSpeed > 1000) { // Faster than commercial aircraft
          anomalies.push(this.createAnomaly(
            event,
            AnomalyType.IMPOSSIBLE_TRAVEL,
            0.95,
            `Impossible travel: ${distance.toFixed(0)}km in ${timeDiff.toFixed(1)}h`,
            AnomalySeverity.CRITICAL
          ));
        }
      }
    }

    return anomalies;
  }

  private detectAccessAnomalies(event: UserBehaviorEvent, profile: UserBehaviorProfile): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];

    // Check unusual resource access
    const resourceAccess = profile.commonResources.find(r => r.resource === event.resource);
    if (!resourceAccess && this.isHighRiskResource(event.resource)) {
      anomalies.push(this.createAnomaly(
        event,
        AnomalyType.UNUSUAL_RESOURCE_ACCESS,
        0.7,
        `First-time access to high-risk resource: ${event.resource}`,
        AnomalySeverity.HIGH
      ));
    }

    // Check rapid permission escalation
    if (this.isPrivilegedAction(event.actionType)) {
      const recentPrivilegedActions = this.getRecentEvents(event.userId, undefined, 60 * 60 * 1000)
        .filter(e => this.isPrivilegedAction(e.actionType));
      
      if (recentPrivilegedActions.length > 10) {
        anomalies.push(this.createAnomaly(
          event,
          AnomalyType.RAPID_PERMISSION_ESCALATION,
          0.8,
          `Rapid privileged actions: ${recentPrivilegedActions.length} in last hour`,
          AnomalySeverity.HIGH
        ));
      }
    }

    return anomalies;
  }

  private detectVolumeAnomalies(event: UserBehaviorEvent, profile: UserBehaviorProfile): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];

    // Check excessive access volume
    const recentEvents = this.getRecentEvents(event.userId, undefined, 60 * 60 * 1000); // Last hour
    const averageHourlyActivity = profile.totalEvents / Math.max(1, 
      (Date.now() - profile.createdAt.getTime()) / (60 * 60 * 1000)
    );

    if (recentEvents.length > averageHourlyActivity * 5) {
      anomalies.push(this.createAnomaly(
        event,
        AnomalyType.EXCESSIVE_ACCESS_VOLUME,
        0.7,
        `Excessive activity: ${recentEvents.length} events in last hour`,
        AnomalySeverity.MEDIUM
      ));
    }

    // Check bulk data access
    if (event.actionType === UserActionType.DATA_EXPORT || event.actionType === UserActionType.FILE_DOWNLOAD) {
      const dataVolume = event.dataVolumeBytes || 0;
      const recentDataEvents = this.getRecentEvents(event.userId, event.actionType, 24 * 60 * 60 * 1000);
      const averageVolume = recentDataEvents.reduce((sum, e) => sum + (e.dataVolumeBytes || 0), 0) / 
        Math.max(recentDataEvents.length, 1);

      if (dataVolume > averageVolume * 10) {
        anomalies.push(this.createAnomaly(
          event,
          AnomalyType.BULK_DATA_ACCESS,
          0.8,
          `Large data volume: ${(dataVolume / 1024 / 1024).toFixed(1)}MB`,
          AnomalySeverity.HIGH
        ));
      }
    }

    return anomalies;
  }

  private detectDeviceAnomalies(event: UserBehaviorEvent, profile: UserBehaviorProfile): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];

    // Check unusual device/user agent
    if (!profile.commonUserAgents.includes(event.userAgent)) {
      anomalies.push(this.createAnomaly(
        event,
        AnomalyType.UNUSUAL_DEVICE_USAGE,
        0.6,
        `New device/browser: ${event.userAgent.substring(0, 50)}...`,
        AnomalySeverity.LOW
      ));
    }

    return anomalies;
  }

  // ==========================================
  // ANOMALY HANDLING
  // ==========================================

  private async handleAnomaly(anomaly: BehaviorAnomaly): Promise<void> {
    // Store anomaly
    this.detectedAnomalies.set(anomaly.id, anomaly);

    // Emit anomaly event
    this.emit('anomalyDetected', anomaly);

    // Auto-resolve low confidence anomalies after time
    if (anomaly.confidence < 0.8) {
      setTimeout(() => {
        this.resolveAnomaly(anomaly.id, false);
      }, 24 * 60 * 60 * 1000); // 24 hours
    }

    console.log(`🔍 BEHAVIOR ANOMALY: ${anomaly.anomalyType} (confidence: ${anomaly.confidence})`);
  }

  private createAnomaly(
    event: UserBehaviorEvent,
    type: AnomalyType,
    confidence: number,
    description: string,
    severity: AnomalySeverity
  ): BehaviorAnomaly {
    return {
      id: this.generateAnomalyId(),
      userId: event.userId,
      detectedAt: new Date(),
      anomalyType: type,
      severity,
      confidence,
      description,
      triggeringEvents: [event],
      deviationScore: confidence * 100,
      baselineValue: 0, // Would be calculated based on profile
      observedValue: 0, // Would be calculated from event
      riskAssessment: this.assessRisk(type, confidence, severity),
      recommendedActions: this.getRecommendedActions(type, severity),
      isResolved: false
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private updateArrayPattern(array: number[], value: number, maxSize: number): void {
    array.push(value);
    if (array.length > maxSize * 10) { // Keep reasonable size
      array.splice(0, array.length - maxSize * 5);
    }
  }

  private updateTravelPatterns(profile: UserBehaviorProfile, event: UserBehaviorEvent): void {
    // Implementation would track location transitions
    // This is a simplified version
  }

  private calculateDistance(loc1: GeolocationData, loc2: GeolocationData): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.latitude)) * Math.cos(this.toRadians(loc2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateResourceRiskScore(resource: string, actionType: UserActionType): number {
    // Basic risk scoring - would be enhanced with actual resource classification
    let score = 0;
    
    if (resource.includes('admin') || resource.includes('config')) score += 30;
    if (resource.includes('user') || resource.includes('customer')) score += 20;
    if (resource.includes('financial') || resource.includes('payment')) score += 40;
    
    if (actionType === UserActionType.DATA_EXPORT) score += 20;
    if (actionType === UserActionType.ADMIN_ACTION) score += 25;
    
    return Math.min(100, score);
  }

  private isPrivilegedAction(actionType: UserActionType): boolean {
    return [
      UserActionType.ADMIN_ACTION,
      UserActionType.PERMISSION_REQUEST,
      UserActionType.CONFIGURATION_CHANGE,
      UserActionType.DATA_EXPORT
    ].includes(actionType);
  }

  private isHighRiskResource(resource: string): boolean {
    const highRiskKeywords = ['admin', 'config', 'financial', 'payment', 'customer', 'sensitive'];
    return highRiskKeywords.some(keyword => resource.toLowerCase().includes(keyword));
  }

  private getRecentEvents(
    userId: string, 
    actionType?: UserActionType, 
    timeframeMs: number = 24 * 60 * 60 * 1000
  ): UserBehaviorEvent[] {
    const userEvents = this.recentEvents.get(userId) || [];
    const cutoff = Date.now() - timeframeMs;
    
    return userEvents.filter(event => {
      const isRecent = event.timestamp.getTime() > cutoff;
      const matchesType = !actionType || event.actionType === actionType;
      return isRecent && matchesType;
    });
  }

  private updateRiskScores(profile: UserBehaviorProfile): void {
    let riskScore = 0;
    
    // Factor in failure rate
    riskScore += profile.failureRate * 20;
    
    // Factor in privileged access frequency
    riskScore += Math.min(30, profile.privilegedAccessFrequency / 10);
    
    // Factor in IP stability
    riskScore += (1 - profile.ipAddressStability) * 15;
    
    // Factor in location diversity
    riskScore += Math.min(20, profile.commonLocations.length * 2);
    
    profile.baselineRiskScore = Math.min(100, riskScore);
  }

  private assessRisk(type: AnomalyType, confidence: number, severity: AnomalySeverity): RiskAssessment {
    const severityMultiplier = {
      [AnomalySeverity.LOW]: 0.25,
      [AnomalySeverity.MEDIUM]: 0.5,
      [AnomalySeverity.HIGH]: 0.8,
      [AnomalySeverity.CRITICAL]: 1.0
    };

    const overallRisk = confidence * severityMultiplier[severity] * 100;
    const businessImpact = overallRisk * 0.8; // Slightly lower than overall risk
    const probabilityOfThreat = confidence * 100;

    return {
      overallRisk,
      businessImpact,
      probabilityOfThreat,
      potentialDamage: this.getPotentialDamage(type),
      mitigationUrgency: overallRisk > 80 ? 'immediate' : 
                         overallRisk > 60 ? 'high' : 
                         overallRisk > 40 ? 'medium' : 'low'
    };
  }

  private getPotentialDamage(type: AnomalyType): string[] {
    const damageMap: Record<AnomalyType, string[]> = {
      [AnomalyType.UNUSUAL_LOGIN_TIME]: ['Account compromise', 'Unauthorized access'],
      [AnomalyType.UNUSUAL_LOCATION]: ['Account takeover', 'Credential theft'],
      [AnomalyType.EXCESSIVE_ACCESS_VOLUME]: ['Data harvesting', 'System abuse'],
      [AnomalyType.UNUSUAL_RESOURCE_ACCESS]: ['Data breach', 'Privilege escalation'],
      [AnomalyType.RAPID_PERMISSION_ESCALATION]: ['System compromise', 'Insider threat'],
      [AnomalyType.SUSPICIOUS_DATA_EXPORT]: ['Data exfiltration', 'IP theft'],
      [AnomalyType.BULK_DATA_ACCESS]: ['Mass data theft', 'Compliance violation'],
      [AnomalyType.IMPOSSIBLE_TRAVEL]: ['Credential sharing', 'Account compromise'],
      [AnomalyType.OFF_HOURS_ACTIVITY]: ['Unauthorized access', 'Malicious activity'],
      [AnomalyType.UNUSUAL_DEVICE_USAGE]: ['Device compromise', 'Session hijacking'],
      [AnomalyType.ABNORMAL_SESSION_DURATION]: ['Session persistence attack', 'Automated access'],
      [AnomalyType.ATYPICAL_NAVIGATION_PATTERN]: ['Bot activity', 'Reconnaissance']
    };

    return damageMap[type] || ['Security incident'];
  }

  private getRecommendedActions(type: AnomalyType, severity: AnomalySeverity): string[] {
    const baseActions = ['Monitor user activity', 'Review access logs'];
    
    if (severity === AnomalySeverity.HIGH || severity === AnomalySeverity.CRITICAL) {
      baseActions.push('Alert security team', 'Consider temporary access restriction');
    }
    
    if (severity === AnomalySeverity.CRITICAL) {
      baseActions.push('Immediate investigation required', 'Consider account suspension');
    }

    return baseActions;
  }

  private generateAnomalyId(): string {
    return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldEvents(userId: string): void {
    const userEvents = this.recentEvents.get(userId);
    if (!userEvents) return;

    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    const filteredEvents = userEvents.filter(event => 
      event.timestamp.getTime() > cutoff
    );
    
    this.recentEvents.set(userId, filteredEvents);
  }

  private startRealTimeAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    this.analysisInterval = setInterval(async () => {
      if (!this.isAnalyzing) {
        this.isAnalyzing = true;
        try {
          await this.performBatchAnalysis();
        } catch (error) {
          console.error('Batch analysis error:', error);
        } finally {
          this.isAnalyzing = false;
        }
      }
    }, this.config.profileUpdateInterval);
  }

  private async performBatchAnalysis(): Promise<void> {
    // Update all user profiles periodically
    for (const [userId, profile] of this.userProfiles) {
      const userEvents = this.recentEvents.get(userId) || [];
      if (userEvents.length > 0) {
        // Recalculate profile statistics
        this.updateRiskScores(profile);
        
        // Adaptive threshold adjustment
        if (this.config.adaptiveThresholding) {
          this.adjustAnomalyThresholds(profile);
        }
      }
    }
  }

  private adjustAnomalyThresholds(profile: UserBehaviorProfile): void {
    // Adjust thresholds based on user's historical behavior
    const recentAnomalies = Array.from(this.detectedAnomalies.values())
      .filter(a => a.userId === profile.userId && !a.isResolved);
    
    if (recentAnomalies.length > 10) {
      // Too many false positives, reduce sensitivity
      profile.anomalyThreshold = Math.min(0.9, profile.anomalyThreshold + 0.1);
    } else if (recentAnomalies.length === 0 && profile.totalEvents > 1000) {
      // No anomalies detected, increase sensitivity
      profile.anomalyThreshold = Math.max(0.5, profile.anomalyThreshold - 0.05);
    }
  }

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  public getUserProfile(userId: string): UserBehaviorProfile | undefined {
    return this.userProfiles.get(userId);
  }

  public getUserAnomalies(userId: string): BehaviorAnomaly[] {
    return Array.from(this.detectedAnomalies.values())
      .filter(anomaly => anomaly.userId === userId);
  }

  public getAllAnomalies(): BehaviorAnomaly[] {
    return Array.from(this.detectedAnomalies.values());
  }

  public getActiveAnomalies(): BehaviorAnomaly[] {
    return Array.from(this.detectedAnomalies.values())
      .filter(anomaly => !anomaly.isResolved);
  }

  public resolveAnomaly(anomalyId: string, falsePositive = false): boolean {
    const anomaly = this.detectedAnomalies.get(anomalyId);
    if (!anomaly) return false;

    anomaly.isResolved = true;
    anomaly.resolvedAt = new Date();
    anomaly.falsePositive = falsePositive;

    this.emit('anomalyResolved', anomaly);
    return true;
  }

  public updateConfig(newConfig: Partial<BehaviorAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.enableRealTimeDetection !== undefined) {
      if (newConfig.enableRealTimeDetection) {
        this.startRealTimeAnalysis();
      } else if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
        this.analysisInterval = undefined;
      }
    }
  }

  public getAnalyticsStats(): Record<string, unknown> {
    return {
      totalUsers: this.userProfiles.size,
      totalAnomalies: this.detectedAnomalies.size,
      activeAnomalies: this.getActiveAnomalies().length,
      profilesWithBaseline: Array.from(this.userProfiles.values())
        .filter(p => p.totalEvents >= this.config.minEventsForProfile).length,
      config: this.config
    };
  }

  public destroy(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    this.removeAllListeners();
    this.userProfiles.clear();
    this.recentEvents.clear();
    this.detectedAnomalies.clear();
  }
}

// ==========================================
// FACTORY
// ==========================================

export class UserBehaviorAnalyticsFactory {
  private static instance: UserBehaviorAnalytics;

  public static getInstance(config?: Partial<BehaviorAnalyticsConfig>): UserBehaviorAnalytics {
    if (!this.instance) {
      this.instance = new UserBehaviorAnalytics(config);
    }
    return this.instance;
  }
}

export default UserBehaviorAnalytics;