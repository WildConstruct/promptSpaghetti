/**
 * Unusual Location Detection Service - Epic 19 Implementation
 * Advanced detection logic for identifying and responding to unusual login locations
 */

import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { AuditService } from './AuditService';
import { GeolocationService, GeolocationData, LocationHistory } from './GeolocationService';

export interface UnusualLocationConfig {
  // Detection thresholds
  newLocationSuspicionThreshold: number; // km distance to be considered unusual
  velocityThresholdKmh: number; // impossible travel speed threshold
  timeWindowMinutes: number; // time window for velocity analysis
  riskScoreThreshold: number; // 0-100 scale, above which location is flagged
  
  // Machine learning parameters
  enableMLDetection: boolean;
  modelUpdateFrequencyDays: number;
  trainingDataRetentionDays: number;
  
  // Behavioral analysis
  enableBehavioralAnalysis: boolean;
  typicalCountryLimit: number; // max countries for typical user
  frequentTravellerThreshold: number; // logins from different locations in timeframe
  
  // Response configuration
  autoBlockHighRisk: boolean;
  requireAdditionalAuth: boolean;
  notificationChannels: ('email' | 'sms' | 'push' | 'slack')[];
  
  // Whitelist/Blocklist
  trustedCountries: string[]; // Country codes that are never flagged
  blockedCountries: string[]; // Country codes that are always flagged
  trustedASNs: string[]; // Trusted Autonomous System Numbers
  blockedASNs: string[]; // Blocked ASNs
}

export interface LocationRiskAssessment {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: LocationRiskFactor[];
  recommendation: 'allow' | 'challenge' | 'block';
  confidence: number; // 0-1
  reasoning: string[];
}

export interface LocationRiskFactor {
  factor: string;
  weight: number;
  value: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UnusualLocationEvent {
  id: string;
  userId: string;
  timestamp: Date;
  ipAddress: string;
  location: GeolocationData;
  riskAssessment: LocationRiskAssessment;
  previousLocation?: GeolocationData;
  timeSincePreviousLocation?: number; // minutes
  distanceFromPrevious?: number; // km
  travelVelocity?: number; // km/h
  userAgent: string;
  sessionId: string;
  action: 'allow' | 'challenge' | 'block';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

export interface UserLocationProfile {
  userId: string;
  typicalCountries: string[];
  typicalRegions: string[];
  typicalCities: string[];
  homeLocation?: GeolocationData;
  workLocation?: GeolocationData;
  frequentLocations: LocationHistory[];
  travelPatterns: {
    isFrequentTraveller: boolean;
    averageDistanceBetweenLogins: number;
    uniqueCountriesCount: number;
    uniqueRegionsCount: number;
    typicalLoginHours: number[];
    weekendTravelFrequency: number;
  };
  riskProfile: {
    baselineRisk: number;
    lastUpdated: Date;
    suspiciousLocationCount: number;
    falsePosativeRate: number;
  };
  lastAnalysis: Date;
}

export class UnusualLocationDetectionService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private geolocationService: GeolocationService;
  private config: UnusualLocationConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    geolocationService: GeolocationService,
    config?: Partial<UnusualLocationConfig>
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.geolocationService = geolocationService;
    this.config = {
      newLocationSuspicionThreshold: 200, // 200km
      velocityThresholdKmh: 800, // Commercial jet speed
      timeWindowMinutes: 60,
      riskScoreThreshold: 75,
      enableMLDetection: true,
      modelUpdateFrequencyDays: 7,
      trainingDataRetentionDays: 90,
      enableBehavioralAnalysis: true,
      typicalCountryLimit: 3,
      frequentTravellerThreshold: 5,
      autoBlockHighRisk: false,
      requireAdditionalAuth: true,
      notificationChannels: ['email'],
      trustedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
      blockedCountries: [],
      trustedASNs: [],
      blockedASNs: [],
      ...config
    };
  }

  /**
   * Main method to detect unusual location for a login attempt
   */
  async detectUnusualLocation(
    userId: string,
    ipAddress: string,
    userAgent: string,
    sessionId: string,
    fallbackHeaders?: Record<string, string>
  ): Promise<{
    isUnusual: boolean;
    riskAssessment: LocationRiskAssessment;
    event: UnusualLocationEvent;
    action: 'allow' | 'challenge' | 'block';
  }> {
    try {
      // Get geolocation data
      const location = await this.geolocationService.getGeolocationData(
        ipAddress, 
        fallbackHeaders
      );

      // Get user's location profile
      const userProfile = await this.getUserLocationProfile(userId);
      
      // Get recent location history for velocity analysis
      const recentLocations = await this.getRecentLocationHistory(userId, this.config.timeWindowMinutes);
      
      // Perform comprehensive risk assessment
      const riskAssessment = await this.assessLocationRisk(
        userId,
        location,
        userProfile,
        recentLocations
      );

      // Determine if location is unusual
      const isUnusual = riskAssessment.riskScore >= this.config.riskScoreThreshold;
      
      // Determine action based on risk assessment
      const action = this.determineAction(riskAssessment);

      // Create event record
      const event = await this.createUnusualLocationEvent(
        userId,
        ipAddress,
        location,
        riskAssessment,
        recentLocations[0]?.location,
        userAgent,
        sessionId,
        action
      );

      // Log the event
      await this.auditService.logSecurityEvent({
        type: 'unusual_location_detection',
        userId,
        ipAddress,
        userAgent,
        success: action === 'allow',
        metadata: {
          location,
          riskScore: riskAssessment.riskScore,
          riskLevel: riskAssessment.riskLevel,
          action,
          isUnusual
        }
      });

      // Update user's location profile
      await this.updateUserLocationProfile(userId, location, riskAssessment);

      return {
        isUnusual,
        riskAssessment,
        event,
        action
      };

    } catch (error) {
      console.error('Error in unusual location detection:', error);
      throw new Error('Failed to detect unusual location');
    }
  }

  /**
   * Assess risk level for a location based on multiple factors
   */
  private async assessLocationRisk(
    userId: string,
    location: GeolocationData,
    userProfile: UserLocationProfile,
    recentLocations: LocationHistory[]
  ): Promise<LocationRiskAssessment> {
    const riskFactors: LocationRiskFactor[] = [];
    let totalRiskScore = 0;

    // Factor 1: Country/Region familiarity
    const locationFamiliarityRisk = this.assessLocationFamiliarity(location, userProfile);
    riskFactors.push(locationFamiliarityRisk);
    totalRiskScore += locationFamiliarityRisk.weight * locationFamiliarityRisk.value;

    // Factor 2: Distance from previous location
    const distanceRisk = this.assessDistanceRisk(location, recentLocations);
    if (distanceRisk) {
      riskFactors.push(distanceRisk);
      totalRiskScore += distanceRisk.weight * distanceRisk.value;
    }

    // Factor 3: Travel velocity analysis
    const velocityRisk = this.assessTravelVelocity(location, recentLocations);
    if (velocityRisk) {
      riskFactors.push(velocityRisk);
      totalRiskScore += velocityRisk.weight * velocityRisk.value;
    }

    // Factor 4: IP reputation and hosting indicators
    const ipReputationRisk = this.assessIPReputation(location);
    riskFactors.push(ipReputationRisk);
    totalRiskScore += ipReputationRisk.weight * ipReputationRisk.value;

    // Factor 5: Time zone consistency
    const timezoneRisk = this.assessTimezoneConsistency(location, userProfile);
    riskFactors.push(timezoneRisk);
    totalRiskScore += timezoneRisk.weight * timezoneRisk.value;

    // Factor 6: Geopolitical risk
    const geopoliticalRisk = this.assessGeopoliticalRisk(location);
    riskFactors.push(geopoliticalRisk);
    totalRiskScore += geopoliticalRisk.weight * geopoliticalRisk.value;

    // Factor 7: Behavioral consistency
    const behavioralRisk = this.assessBehavioralConsistency(location, userProfile);
    riskFactors.push(behavioralRisk);
    totalRiskScore += behavioralRisk.weight * behavioralRisk.value;

    // Normalize risk score to 0-100 scale
    const normalizedRiskScore = Math.min(100, Math.max(0, totalRiskScore));
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(normalizedRiskScore);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(normalizedRiskScore, riskFactors);
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(location, userProfile, riskFactors);

    return {
      riskScore: normalizedRiskScore,
      riskLevel,
      riskFactors,
      recommendation,
      confidence,
      reasoning: this.generateReasoning(riskFactors, normalizedRiskScore)
    };
  }

  /**
   * Assess location familiarity based on user's history
   */
  private assessLocationFamiliarity(
    location: GeolocationData,
    userProfile: UserLocationProfile
  ): LocationRiskFactor {
    let familiarityScore = 0;
    
    // Check if country is typical
    if (userProfile.typicalCountries.includes(location.countryCode)) {
      familiarityScore += 40;
    }
    
    // Check if region is typical
    if (userProfile.typicalRegions.includes(location.region)) {
      familiarityScore += 30;
    }
    
    // Check if city is typical
    if (userProfile.typicalCities.includes(location.city)) {
      familiarityScore += 30;
    }

    // Check against frequent locations
    const isFrequentLocation = userProfile.frequentLocations.some(fl => 
      fl.location.countryCode === location.countryCode &&
      fl.location.region === location.region &&
      fl.location.city === location.city
    );

    if (isFrequentLocation) {
      familiarityScore += 20;
    }

    // Invert score - higher familiarity = lower risk
    const riskValue = Math.max(0, 100 - familiarityScore);

    return {
      factor: 'location_familiarity',
      weight: 0.25,
      value: riskValue,
      description: `Location familiarity assessment: ${familiarityScore}% familiar`,
      severity: riskValue > 75 ? 'high' : riskValue > 50 ? 'medium' : 'low'
    };
  }

  /**
   * Assess risk based on distance from previous location
   */
  private assessDistanceRisk(
    location: GeolocationData,
    recentLocations: LocationHistory[]
  ): LocationRiskFactor | null {
    if (recentLocations.length === 0 || !location.coordinates) {
      return null;
    }

    const mostRecentLocation = recentLocations[0];
    if (!mostRecentLocation.location.coordinates) {
      return null;
    }

    // Calculate distance using geolocation service's Haversine implementation
    const distance = this.calculateDistance(
      location.coordinates.latitude,
      location.coordinates.longitude,
      mostRecentLocation.location.coordinates.latitude,
      mostRecentLocation.location.coordinates.longitude
    );

    // Risk increases exponentially with distance
    let riskValue = 0;
    if (distance > this.config.newLocationSuspicionThreshold) {
      riskValue = Math.min(100, (distance / this.config.newLocationSuspicionThreshold) * 50);
    }

    return {
      factor: 'distance_from_previous',
      weight: 0.2,
      value: riskValue,
      description: `Distance from previous location: ${distance.toFixed(1)}km`,
      severity: riskValue > 75 ? 'high' : riskValue > 50 ? 'medium' : 'low'
    };
  }

  /**
   * Assess impossible travel velocity
   */
  private assessTravelVelocity(
    location: GeolocationData,
    recentLocations: LocationHistory[]
  ): LocationRiskFactor | null {
    if (recentLocations.length === 0 || !location.coordinates) {
      return null;
    }

    const mostRecentLocation = recentLocations[0];
    if (!mostRecentLocation.location.coordinates) {
      return null;
    }

    const distance = this.calculateDistance(
      location.coordinates.latitude,
      location.coordinates.longitude,
      mostRecentLocation.location.coordinates.latitude,
      mostRecentLocation.location.coordinates.longitude
    );

    const timeDifferenceHours = (Date.now() - mostRecentLocation.lastSeen.getTime()) / (1000 * 60 * 60);
    
    if (timeDifferenceHours === 0) {
      return null;
    }

    const velocity = distance / timeDifferenceHours;
    
    let riskValue = 0;
    if (velocity > this.config.velocityThresholdKmh) {
      // Impossible travel speed detected
      riskValue = 100;
    } else if (velocity > this.config.velocityThresholdKmh * 0.7) {
      // Very high speed travel
      riskValue = 80;
    } else if (velocity > this.config.velocityThresholdKmh * 0.5) {
      // High speed travel (possible but unusual)
      riskValue = 60;
    }

    return {
      factor: 'travel_velocity',
      weight: 0.3,
      value: riskValue,
      description: `Travel velocity: ${velocity.toFixed(1)}km/h over ${timeDifferenceHours.toFixed(1)}h`,
      severity: riskValue > 80 ? 'critical' : riskValue > 60 ? 'high' : 'medium'
    };
  }

  /**
   * Assess IP reputation and hosting indicators
   */
  private assessIPReputation(location: GeolocationData): LocationRiskFactor {
    let riskValue = 0;
    const indicators: string[] = [];

    if (location.isVpn) {
      riskValue += 30;
      indicators.push('VPN');
    }
    
    if (location.isTor) {
      riskValue += 50;
      indicators.push('Tor');
    }
    
    if (location.isProxy) {
      riskValue += 40;
      indicators.push('Proxy');
    }
    
    if (location.isHosting) {
      riskValue += 25;
      indicators.push('Hosting Provider');
    }

    // Check if ASN is in blocked list
    if (location.asn && this.config.blockedASNs.includes(location.asn)) {
      riskValue += 60;
      indicators.push('Blocked ASN');
    }

    // Low confidence location data
    if (location.confidence < 0.5) {
      riskValue += 20;
      indicators.push('Low Confidence');
    }

    return {
      factor: 'ip_reputation',
      weight: 0.15,
      value: Math.min(100, riskValue),
      description: `IP indicators: ${indicators.join(', ') || 'Clean'}`,
      severity: riskValue > 75 ? 'high' : riskValue > 40 ? 'medium' : 'low'
    };
  }

  /**
   * Assess timezone consistency with user's typical patterns
   */
  private assessTimezoneConsistency(
    location: GeolocationData,
    userProfile: UserLocationProfile
  ): LocationRiskFactor {
    // This is a simplified implementation
    // In production, you'd analyze the user's typical login times vs current timezone
    
    const currentHour = new Date().getHours();
    const typicalHours = userProfile.travelPatterns.typicalLoginHours;
    
    let riskValue = 0;
    if (typicalHours.length > 0 && !typicalHours.includes(currentHour)) {
      riskValue = 30; // Unusual time for this user
    }

    return {
      factor: 'timezone_consistency',
      weight: 0.05,
      value: riskValue,
      description: `Login time consistency: ${currentHour}h (typical: ${typicalHours.join(', ')}h)`,
      severity: riskValue > 50 ? 'medium' : 'low'
    };
  }

  /**
   * Assess geopolitical risk of the location
   */
  private assessGeopoliticalRisk(location: GeolocationData): LocationRiskFactor {
    let riskValue = 0;
    
    // Check if country is in blocked list
    if (this.config.blockedCountries.includes(location.countryCode)) {
      riskValue = 90;
    }
    
    // Check if country is in trusted list
    if (this.config.trustedCountries.includes(location.countryCode)) {
      riskValue = Math.max(0, riskValue - 20);
    }

    // Add additional geopolitical risk logic here
    // This could include consulting threat intelligence feeds

    return {
      factor: 'geopolitical_risk',
      weight: 0.1,
      value: riskValue,
      description: `Country risk assessment: ${location.country} (${location.countryCode})`,
      severity: riskValue > 75 ? 'high' : riskValue > 50 ? 'medium' : 'low'
    };
  }

  /**
   * Assess behavioral consistency
   */
  private assessBehavioralConsistency(
    location: GeolocationData,
    userProfile: UserLocationProfile
  ): LocationRiskFactor {
    let riskValue = 0;

    // Check if user has exceeded typical country limit
    if (!userProfile.typicalCountries.includes(location.countryCode) &&
        userProfile.typicalCountries.length >= this.config.typicalCountryLimit) {
      riskValue += 40;
    }

    // Check if this matches the user's travel pattern
    if (!userProfile.travelPatterns.isFrequentTraveller && 
        !userProfile.typicalCountries.includes(location.countryCode)) {
      riskValue += 30;
    }

    return {
      factor: 'behavioral_consistency',
      weight: 0.1,
      value: riskValue,
      description: `Behavioral pattern match: ${userProfile.travelPatterns.isFrequentTraveller ? 'Frequent traveller' : 'Consistent location user'}`,
      severity: riskValue > 60 ? 'medium' : 'low'
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Determine risk level from risk score
   */
  private determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 90) return 'critical';
    if (riskScore >= 75) return 'high';
    if (riskScore >= 50) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendation based on risk assessment
   */
  private generateRecommendation(
    riskScore: number,
    riskFactors: LocationRiskFactor[]
  ): 'allow' | 'challenge' | 'block' {
    const criticalFactors = riskFactors.filter(f => f.severity === 'critical');
    
    if (criticalFactors.length > 0 || riskScore >= 90) {
      return 'block';
    }
    
    if (riskScore >= this.config.riskScoreThreshold) {
      return 'challenge';
    }
    
    return 'allow';
  }

  /**
   * Calculate confidence in the assessment
   */
  private calculateConfidence(
    location: GeolocationData,
    userProfile: UserLocationProfile,
    riskFactors: LocationRiskFactor[]
  ): number {
    let confidence = location.confidence;
    
    // Reduce confidence if we have limited user history
    if (userProfile.frequentLocations.length < 3) {
      confidence *= 0.8;
    }
    
    // Reduce confidence if location data is incomplete
    if (!location.coordinates) {
      confidence *= 0.7;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(riskFactors: LocationRiskFactor[], riskScore: number): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Overall risk score: ${riskScore.toFixed(1)}/100`);
    
    const highRiskFactors = riskFactors.filter(f => f.severity === 'high' || f.severity === 'critical');
    if (highRiskFactors.length > 0) {
      reasoning.push(`High-risk factors: ${highRiskFactors.map(f => f.factor).join(', ')}`);
    }
    
    const topFactor = riskFactors.reduce((max, factor) => 
      factor.weight * factor.value > max.weight * max.value ? factor : max
    );
    reasoning.push(`Primary concern: ${topFactor.description}`);
    
    return reasoning;
  }

  /**
   * Determine action based on risk assessment
   */
  private determineAction(riskAssessment: LocationRiskAssessment): 'allow' | 'challenge' | 'block' {
    if (this.config.autoBlockHighRisk && riskAssessment.riskLevel === 'critical') {
      return 'block';
    }
    
    return riskAssessment.recommendation;
  }

  /**
   * Map risk level to audit severity
   */
  private mapRiskLevelToSeverity(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    return riskLevel as 'low' | 'medium' | 'high' | 'critical';
  }

  /**
   * Get user's location profile
   */
  private async getUserLocationProfile(userId: string): Promise<UserLocationProfile> {
    // Try to get cached profile first
    const cacheKey = `user_location_profile:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error('Error parsing cached location profile:', error);
      }
    }

    // Generate profile from database
    const profile = await this.generateUserLocationProfile(userId);
    
    // Cache the profile for 1 hour
    await this.redis.setex(cacheKey, 3600, JSON.stringify(profile));
    
    return profile;
  }

  /**
   * Generate user location profile from historical data
   */
  private async generateUserLocationProfile(userId: string): Promise<UserLocationProfile> {
    const locationHistory = await this.geolocationService.getUserLocationHistory(userId);
    
    // Extract typical locations
    const typicalCountries = [...new Set(locationHistory
      .filter(lh => lh.isTypical)
      .map(lh => lh.location.countryCode))];
    
    const typicalRegions = [...new Set(locationHistory
      .filter(lh => lh.isTypical)
      .map(lh => lh.location.region))];
    
    const typicalCities = [...new Set(locationHistory
      .filter(lh => lh.isTypical)
      .map(lh => lh.location.city))];

    // Find most frequent location (likely home)
    const sortedByFrequency = locationHistory.sort((a, b) => b.frequency - a.frequency);
    const homeLocation = sortedByFrequency[0]?.location;
    const workLocation = sortedByFrequency[1]?.location;

    // Calculate travel patterns
    const uniqueCountriesCount = new Set(locationHistory.map(lh => lh.location.countryCode)).size;
    const isFrequentTraveller = uniqueCountriesCount > this.config.frequentTravellerThreshold;

    return {
      userId,
      typicalCountries,
      typicalRegions,
      typicalCities,
      homeLocation,
      workLocation,
      frequentLocations: locationHistory.slice(0, 10), // Top 10 frequent locations
      travelPatterns: {
        isFrequentTraveller,
        averageDistanceBetweenLogins: 0, // Would need to calculate
        uniqueCountriesCount,
        uniqueRegionsCount: new Set(locationHistory.map(lh => lh.location.region)).size,
        typicalLoginHours: [], // Would need to calculate from login times
        weekendTravelFrequency: 0 // Would need to calculate
      },
      riskProfile: {
        baselineRisk: 30, // Default baseline
        lastUpdated: new Date(),
        suspiciousLocationCount: 0,
        falsePosativeRate: 0.1 // Default 10%
      },
      lastAnalysis: new Date()
    };
  }

  /**
   * Get recent location history for velocity analysis
   */
  private async getRecentLocationHistory(userId: string, timeWindowMinutes: number): Promise<LocationHistory[]> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    const result = await this.db.query(`
      SELECT 
        location_data,
        last_seen
      FROM user_location_history 
      WHERE user_id = $1 AND last_seen >= $2
      ORDER BY last_seen DESC
      LIMIT 5
    `, [userId, cutoffTime]);

    return result.rows.map(row => ({
      userId,
      location: JSON.parse(row.location_data),
      firstSeen: row.last_seen,
      lastSeen: row.last_seen,
      frequency: 1,
      isTypical: false
    }));
  }

  /**
   * Create unusual location event record
   */
  private async createUnusualLocationEvent(
    userId: string,
    ipAddress: string,
    location: GeolocationData,
    riskAssessment: LocationRiskAssessment,
    previousLocation: GeolocationData | undefined,
    userAgent: string,
    sessionId: string,
    action: 'allow' | 'challenge' | 'block'
  ): Promise<UnusualLocationEvent> {
    const eventId = `ULE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let distanceFromPrevious: number | undefined;
    let timeSincePreviousLocation: number | undefined;
    let travelVelocity: number | undefined;

    if (previousLocation && location.coordinates && previousLocation.coordinates) {
      distanceFromPrevious = this.calculateDistance(
        location.coordinates.latitude,
        location.coordinates.longitude,
        previousLocation.coordinates.latitude,
        previousLocation.coordinates.longitude
      );
      
      // Note: This would need the actual previous location timestamp
      // For now, using a placeholder
      timeSincePreviousLocation = 60; // minutes
      travelVelocity = distanceFromPrevious / (timeSincePreviousLocation / 60);
    }

    const event: UnusualLocationEvent = {
      id: eventId,
      userId,
      timestamp: new Date(),
      ipAddress,
      location,
      riskAssessment,
      previousLocation,
      timeSincePreviousLocation,
      distanceFromPrevious,
      travelVelocity,
      userAgent,
      sessionId,
      action,
      resolved: action === 'allow',
      notes: `Automated risk assessment: ${riskAssessment.riskScore.toFixed(1)}/100`
    };

    // Store event in database
    await this.db.query(`
      INSERT INTO unusual_location_events (
        id, user_id, timestamp, ip_address, location_data,
        risk_assessment, user_agent, session_id, action,
        resolved, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      event.id,
      event.userId,
      event.timestamp,
      event.ipAddress,
      JSON.stringify(event.location),
      JSON.stringify(event.riskAssessment),
      event.userAgent,
      event.sessionId,
      event.action,
      event.resolved,
      event.notes
    ]);

    return event;
  }

  /**
   * Update user location profile with new data
   */
  private async updateUserLocationProfile(
    userId: string,
    location: GeolocationData,
    riskAssessment: LocationRiskAssessment
  ): Promise<void> {
    // Clear cached profile to force regeneration
    const cacheKey = `user_location_profile:${userId}`;
    await this.redis.del(cacheKey);
    
    // The profile will be regenerated next time it's requested
  }

  /**
   * Initialize database schema for unusual location detection
   */
  async initializeSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS unusual_location_events (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        ip_address INET NOT NULL,
        location_data JSONB NOT NULL,
        risk_assessment JSONB NOT NULL,
        previous_location_data JSONB,
        time_since_previous INTEGER,
        distance_from_previous DECIMAL(10,2),
        travel_velocity DECIMAL(10,2),
        user_agent TEXT,
        session_id VARCHAR(255),
        action VARCHAR(50) NOT NULL,
        resolved BOOLEAN DEFAULT false,
        resolved_by VARCHAR(255),
        resolved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_unusual_location_events_user_id 
      ON unusual_location_events(user_id);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_unusual_location_events_timestamp 
      ON unusual_location_events(timestamp);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_unusual_location_events_action 
      ON unusual_location_events(action);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_unusual_location_events_resolved 
      ON unusual_location_events(resolved);
    `);
  }
}