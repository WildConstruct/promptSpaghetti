// Enhanced Device Identification Service - Epic 19 Implementation
// Server-side orchestrator for comprehensive device identification and trust scoring

import { DeviceFingerprintingService } from './DeviceFingerprintingService';
import { GeolocationService, GeolocationData } from '../auth/services/GeolocationService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import crypto from 'crypto';

export interface EnhancedDeviceProfile {
  deviceId: string;
  fingerprint: string;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: Date;
  lastSeen: Date;
  
  // Identification components
  components: {
    browser: BrowserProfile;
    hardware: HardwareProfile;
    behavior: BehaviorProfile;
    network: NetworkProfile;
    security: SecurityProfile;
  };
  
  // Trust factors
  trustFactors: {
    age: number;              // Days since first seen
    consistency: number;      // Component stability score
    userAssociation: number;  // Number of verified users
    locationStability: number; // Location consistency
    securityEvents: number;   // Negative events count
    verificationLevel: number; // MFA, email verification, etc.
  };
  
  // History
  history: {
    users: UserAssociation[];
    locations: LocationHistory[];
    fingerprints: FingerprintHistory[];
    securityEvents: SecurityEvent[];
  };
  
  // Anomalies
  anomalies: AnomalyReport[];
  
  // Metadata
  metadata: {
    lastUpdated: Date;
    updateCount: number;
    dataQuality: number;
    collectionErrors: string[];
  };
}

export interface BrowserProfile {
  userAgent: string;
  userAgentParsed: {
    browser: string;
    version: string;
    os: string;
    osVersion: string;
    device: string;
  };
  language: string;
  languages: string[];
  timezone: string;
  plugins: string[];
  mimeTypes: string[];
  doNotTrack: boolean;
  cookieEnabled: boolean;
}

export interface HardwareProfile {
  screenResolution: string;
  screenColorDepth: number;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  maxTouchPoints: number;
  devicePixelRatio: number;
  gpu: {
    vendor: string;
    renderer: string;
  };
  battery: {
    level: number | null;
    charging: boolean | null;
  };
}

export interface BehaviorProfile {
  mouseMovement: MouseBehavior;
  keyboardDynamics: KeyboardBehavior;
  touchBehavior: TouchBehavior;
  scrollBehavior: ScrollBehavior;
  interactionPatterns: InteractionPattern[];
}

export interface NetworkProfile {
  ipAddress: string;
  ipHistory: string[];
  geolocation: GeolocationData;
  connectionType: string | null;
  bandwidth: number | null;
  latency: number | null;
  vpnDetected: boolean;
  proxyDetected: boolean;
  torDetected: boolean;
}

export interface SecurityProfile {
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  fontFingerprint: string;
  permissions: Record<string, string>;
  adBlockerDetected: boolean;
  incognitoDetected: boolean;
  automationDetected: boolean;
  spoofingDetected: boolean;
}

export interface UserAssociation {
  userId: string;
  firstSeen: Date;
  lastSeen: Date;
  loginCount: number;
  verified: boolean;
  trustLevel: number;
}

export interface LocationHistory {
  geolocation: GeolocationData;
  firstSeen: Date;
  lastSeen: Date;
  frequency: number;
}

export interface FingerprintHistory {
  fingerprint: string;
  components: any;
  firstSeen: Date;
  lastSeen: Date;
  transitionReason?: string;
}

export interface SecurityEvent {
  eventId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: any;
}

export interface AnomalyReport {
  anomalyId: string;
  type: 'fingerprint_change' | 'location_jump' | 'behavior_deviation' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: {
    description: string;
    oldValue?: any;
    newValue?: any;
    deviation?: number;
    recommendation?: string;
  };
}

// Behavioral biometrics interfaces
export interface MouseBehavior {
  averageSpeed: number;
  averageAcceleration: number;
  clickPatterns: ClickPattern[];
  movementPatterns: MovementPattern[];
}

export interface KeyboardBehavior {
  typingSpeed: number;
  dwellTime: number;    // Time key is held
  flightTime: number;   // Time between keystrokes
  patterns: KeystrokePattern[];
}

export interface TouchBehavior {
  touchPressure: number[];
  touchArea: number[];
  swipeVelocity: number[];
  multiTouchPatterns: any[];
}

export interface ScrollBehavior {
  scrollSpeed: number;
  scrollAcceleration: number;
  scrollPatterns: any[];
}

export interface ClickPattern {
  averageInterval: number;
  doubleClickSpeed: number;
  rightClickRatio: number;
}

export interface MovementPattern {
  curvature: number;
  jitter: number;
  straightness: number;
}

export interface KeystrokePattern {
  digraph: string;  // Two-key combination
  averageTime: number;
  standardDeviation: number;
}

export interface InteractionPattern {
  action: string;
  frequency: number;
  timing: number[];
}

export interface DeviceIdentificationConfig {
  // Trust scoring weights
  trustWeights: {
    age: number;
    consistency: number;
    userAssociation: number;
    locationStability: number;
    securityEvents: number;
    verificationLevel: number;
  };
  
  // Thresholds
  thresholds: {
    highTrust: number;
    mediumTrust: number;
    lowTrust: number;
    suspiciousChange: number;
    criticalAnomaly: number;
  };
  
  // Feature flags
  features: {
    behavioralBiometrics: boolean;
    machineLearnin
: boolean;
    crossDeviceLinking: boolean;
    realTimeMonitoring: boolean;
  };
  
  // Cache settings
  cache: {
    deviceProfileTTL: number;
    behaviorDataTTL: number;
    anomalyDataTTL: number;
  };
}

export class EnhancedDeviceIdentificationService {
  private config: DeviceIdentificationConfig;

  constructor(
    private deviceFingerprintingService: DeviceFingerprintingService,
    private geolocationService: GeolocationService,
    private db: DatabaseService,
    private redis: RedisService,
    private auditService: AuditService,
    config?: Partial<DeviceIdentificationConfig>
  ) {
    this.config = {
      trustWeights: {
        age: 0.15,
        consistency: 0.25,
        userAssociation: 0.20,
        locationStability: 0.15,
        securityEvents: 0.15,
        verificationLevel: 0.10
      },
      thresholds: {
        highTrust: 80,
        mediumTrust: 60,
        lowTrust: 40,
        suspiciousChange: 30,
        criticalAnomaly: 50
      },
      features: {
        behavioralBiometrics: true,
        machineLearnin
: false,
        crossDeviceLinking: true,
        realTimeMonitoring: true
      },
      cache: {
        deviceProfileTTL: 3600,        // 1 hour
        behaviorDataTTL: 300,          // 5 minutes
        anomalyDataTTL: 86400          // 24 hours
      },
      ...config
    };
  }

  /**
   * Process device identification request
   */
  async identifyDevice(request: {
    fingerprint: string;
    components: any;
    ipAddress: string;
    userId?: string;
    sessionId?: string;
    behaviorData?: any;
  }): Promise<{
    deviceProfile: EnhancedDeviceProfile;
    isNewDevice: boolean;
    trustDecision: TrustDecision;
    anomalies: AnomalyReport[];
    recommendations: string[];
  }> {
    try {
      // Check cache first
      const cachedProfile = await this.getCachedDeviceProfile(request.fingerprint);
      if (cachedProfile && !this.requiresUpdate(cachedProfile)) {
        return this.processExistingDevice(cachedProfile, request);
      }

      // Get or create device profile
      const deviceProfile = await this.getOrCreateDeviceProfile(request);
      
      // Update components
      await this.updateDeviceComponents(deviceProfile, request);
      
      // Analyze behavior if enabled
      if (this.config.features.behavioralBiometrics && request.behaviorData) {
        await this.analyzeBehavior(deviceProfile, request.behaviorData);
      }
      
      // Detect anomalies
      const anomalies = await this.detectAnomalies(deviceProfile, request);
      
      // Calculate trust score
      const trustScore = await this.calculateTrustScore(deviceProfile);
      deviceProfile.trustScore = trustScore;
      deviceProfile.riskLevel = this.getRiskLevel(trustScore);
      
      // Make trust decision
      const trustDecision = await this.makeTrustDecision(deviceProfile, anomalies);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(deviceProfile, anomalies);
      
      // Cache updated profile
      await this.cacheDeviceProfile(deviceProfile);
      
      // Log device identification
      await this.logDeviceIdentification(deviceProfile, request, trustDecision);
      
      return {
        deviceProfile,
        isNewDevice: deviceProfile.history.fingerprints.length === 1,
        trustDecision,
        anomalies,
        recommendations
      };
    } catch (error) {
      await this.auditService.logEvent({
        action: 'device_identification_error',
        details: {
          fingerprint: request.fingerprint,
          error: error instanceof Error ? error.message : String(error)
        },
        ipAddress: request.ipAddress,
        severity: 'error'
      });
      
      throw error;
    }
  }

  /**
   * Get device trust score
   */
  async getDeviceTrustScore(fingerprint: string): Promise<{
    trustScore: number;
    factors: Record<string, number>;
    riskLevel: string;
  }> {
    const deviceProfile = await this.getDeviceProfile(fingerprint);
    if (!deviceProfile) {
      return {
        trustScore: 0,
        factors: {},
        riskLevel: 'critical'
      };
    }

    const trustScore = await this.calculateTrustScore(deviceProfile);
    const factors = await this.getTrustFactorBreakdown(deviceProfile);
    
    return {
      trustScore,
      factors,
      riskLevel: this.getRiskLevel(trustScore)
    };
  }

  /**
   * Link device to user
   */
  async linkDeviceToUser(
    fingerprint: string,
    userId: string,
    verified: boolean = false
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO device_user_associations (
        device_fingerprint, user_id, first_seen, last_seen, 
        login_count, verified, trust_level
      ) VALUES ($1, $2, NOW(), NOW(), 1, $3, 50)
      ON CONFLICT (device_fingerprint, user_id) 
      DO UPDATE SET 
        last_seen = NOW(),
        login_count = device_user_associations.login_count + 1,
        verified = GREATEST(device_user_associations.verified, EXCLUDED.verified)
    `, [fingerprint, userId, verified]);

    // Update device profile cache
    const deviceProfile = await this.getDeviceProfile(fingerprint);
    if (deviceProfile) {
      await this.updateUserAssociations(deviceProfile);
      await this.cacheDeviceProfile(deviceProfile);
    }
  }

  /**
   * Get device history for user
   */
  async getUserDevices(userId: string): Promise<EnhancedDeviceProfile[]> {
    const result = await this.db.query(`
      SELECT DISTINCT device_fingerprint 
      FROM device_user_associations 
      WHERE user_id = $1 
      ORDER BY last_seen DESC
    `, [userId]);

    const devices: EnhancedDeviceProfile[] = [];
    for (const row of result.rows) {
      const profile = await this.getDeviceProfile(row.device_fingerprint);
      if (profile) {
        devices.push(profile);
      }
    }

    return devices;
  }

  /**
   * Mark device as trusted/untrusted
   */
  async setDeviceTrust(
    fingerprint: string,
    trusted: boolean,
    reason: string,
    adminId?: string
  ): Promise<void> {
    const trustLevel = trusted ? 90 : 10;
    
    await this.db.query(`
      UPDATE device_fingerprints 
      SET trust_level = $1, manually_verified = $2 
      WHERE fingerprint = $3
    `, [trustLevel, trusted, fingerprint]);

    await this.auditService.logEvent({
      action: 'device_trust_updated',
      userId: adminId,
      details: {
        fingerprint,
        trusted,
        trustLevel,
        reason
      },
      severity: 'info'
    });

    // Clear cache
    await this.redis.del(`device_profile:${fingerprint}`);
  }

  /**
   * Detect device cloning
   */
  async detectDeviceCloning(fingerprint: string): Promise<{
    possibleCloning: boolean;
    indicators: string[];
    relatedDevices: string[];
  }> {
    // Check for devices with similar fingerprints
    const result = await this.db.query(`
      SELECT fingerprint, components, last_seen 
      FROM device_fingerprints 
      WHERE fingerprint != $1 
        AND components->>'canvasFingerprint' = (
          SELECT components->>'canvasFingerprint' 
          FROM device_fingerprints 
          WHERE fingerprint = $1
        )
    `, [fingerprint]);

    const indicators: string[] = [];
    const relatedDevices: string[] = [];

    if (result.rows.length > 0) {
      indicators.push('Duplicate canvas fingerprint detected');
      relatedDevices.push(...result.rows.map(r => r.fingerprint));
    }

    // Check for rapid location changes
    const locationHistory = await this.db.query(`
      SELECT location_data, timestamp 
      FROM device_location_history 
      WHERE device_fingerprint = $1 
      ORDER BY timestamp DESC 
      LIMIT 10
    `, [fingerprint]);

    if (locationHistory.rows.length >= 2) {
      for (let i = 0; i < locationHistory.rows.length - 1; i++) {
        const loc1 = JSON.parse(locationHistory.rows[i].location_data);
        const loc2 = JSON.parse(locationHistory.rows[i + 1].location_data);
        const timeDiff = (new Date(locationHistory.rows[i].timestamp).getTime() - 
                         new Date(locationHistory.rows[i + 1].timestamp).getTime()) / 1000 / 60; // minutes
        
        if (loc1.country !== loc2.country && timeDiff < 60) {
          indicators.push(`Impossible travel: ${loc2.country} to ${loc1.country} in ${timeDiff} minutes`);
        }
      }
    }

    return {
      possibleCloning: indicators.length > 0,
      indicators,
      relatedDevices
    };
  }

  // Private helper methods

  private async getOrCreateDeviceProfile(request: any): Promise<EnhancedDeviceProfile> {
    let profile = await this.getDeviceProfile(request.fingerprint);
    
    if (!profile) {
      profile = await this.createNewDeviceProfile(request);
    }
    
    return profile;
  }

  private async createNewDeviceProfile(request: any): Promise<EnhancedDeviceProfile> {
    const deviceId = this.generateDeviceId();
    const now = new Date();
    
    // Get geolocation data
    const geolocation = await this.geolocationService.getGeolocationData(request.ipAddress);
    
    // Parse components
    const components = this.parseDeviceComponents(request.components);
    
    // Create profile
    const profile: EnhancedDeviceProfile = {
      deviceId,
      fingerprint: request.fingerprint,
      trustScore: 50, // Default trust score
      riskLevel: 'medium',
      firstSeen: now,
      lastSeen: now,
      components,
      trustFactors: {
        age: 0,
        consistency: 100,
        userAssociation: 0,
        locationStability: 100,
        securityEvents: 0,
        verificationLevel: 0
      },
      history: {
        users: [],
        locations: [{
          geolocation,
          firstSeen: now,
          lastSeen: now,
          frequency: 1
        }],
        fingerprints: [{
          fingerprint: request.fingerprint,
          components: request.components,
          firstSeen: now,
          lastSeen: now
        }],
        securityEvents: []
      },
      anomalies: [],
      metadata: {
        lastUpdated: now,
        updateCount: 1,
        dataQuality: 100,
        collectionErrors: []
      }
    };

    // Store in database
    await this.storeDeviceProfile(profile);
    
    return profile;
  }

  private async getDeviceProfile(fingerprint: string): Promise<EnhancedDeviceProfile | null> {
    const result = await this.db.query(`
      SELECT * FROM device_fingerprints WHERE fingerprint = $1
    `, [fingerprint]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    // Build complete profile
    const profile: EnhancedDeviceProfile = {
      deviceId: row.device_id,
      fingerprint: row.fingerprint,
      trustScore: row.trust_score,
      riskLevel: this.getRiskLevel(row.trust_score),
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      components: JSON.parse(row.components),
      trustFactors: JSON.parse(row.trust_factors || '{}'),
      history: {
        users: await this.getUserAssociations(fingerprint),
        locations: await this.getLocationHistory(fingerprint),
        fingerprints: await this.getFingerprintHistory(row.device_id),
        securityEvents: await this.getSecurityEvents(fingerprint)
      },
      anomalies: await this.getRecentAnomalies(fingerprint),
      metadata: {
        lastUpdated: row.last_updated,
        updateCount: row.update_count,
        dataQuality: row.data_quality || 100,
        collectionErrors: JSON.parse(row.collection_errors || '[]')
      }
    };

    return profile;
  }

  private parseDeviceComponents(components: any): EnhancedDeviceProfile['components'] {
    return {
      browser: {
        userAgent: components.userAgent || '',
        userAgentParsed: this.parseUserAgent(components.userAgent),
        language: components.language || '',
        languages: components.languages || [],
        timezone: components.timezone || '',
        plugins: components.plugins || [],
        mimeTypes: components.mimeTypes || [],
        doNotTrack: components.doNotTrack || false,
        cookieEnabled: components.cookieEnabled || false
      },
      hardware: {
        screenResolution: components.screenResolution || '',
        screenColorDepth: components.screenColorDepth || 0,
        hardwareConcurrency: components.hardwareConcurrency || 0,
        deviceMemory: components.deviceMemory || null,
        maxTouchPoints: components.maxTouchPoints || 0,
        devicePixelRatio: components.devicePixelRatio || 1,
        gpu: {
          vendor: components.webglVendor || '',
          renderer: components.webglRenderer || ''
        },
        battery: {
          level: components.batteryLevel || null,
          charging: components.charging || null
        }
      },
      behavior: {
        mouseMovement: { averageSpeed: 0, averageAcceleration: 0, clickPatterns: [], movementPatterns: [] },
        keyboardDynamics: { typingSpeed: 0, dwellTime: 0, flightTime: 0, patterns: [] },
        touchBehavior: { touchPressure: [], touchArea: [], swipeVelocity: [], multiTouchPatterns: [] },
        scrollBehavior: { scrollSpeed: 0, scrollAcceleration: 0, scrollPatterns: [] },
        interactionPatterns: []
      },
      network: {
        ipAddress: components.ipAddress || '',
        ipHistory: [],
        geolocation: {} as GeolocationData,
        connectionType: components.connectionType || null,
        bandwidth: null,
        latency: null,
        vpnDetected: false,
        proxyDetected: false,
        torDetected: false
      },
      security: {
        canvasFingerprint: components.canvasFingerprint || '',
        webglFingerprint: components.webglFingerprint || '',
        audioFingerprint: components.audioFingerprint || '',
        fontFingerprint: crypto.createHash('sha256').update((components.availableFonts || []).join(',')).digest('hex'),
        permissions: components.permissions || {},
        adBlockerDetected: components.hasAdBlocker || false,
        incognitoDetected: components.isIncognito || false,
        automationDetected: components.isBot || false,
        spoofingDetected: components.spoofingDetected || false
      }
    };
  }

  private parseUserAgent(userAgent: string): any {
    // Simple user agent parsing - in production use a library like ua-parser-js
    if (!userAgent) {
      return {
        browser: 'Unknown',
        version: '0',
        os: 'Unknown',
        osVersion: '0',
        device: 'Desktop'
      };
    }
    
    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/([0-9.]+)/);
    const os = userAgent.match(/(Windows NT|Mac OS X|Linux|Android|iOS) ([0-9._]+)/);
    
    return {
      browser: browser?.[1] || 'Unknown',
      version: browser?.[2] || '0',
      os: os?.[1] || 'Unknown',
      osVersion: os?.[2] || '0',
      device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
    };
  }

  private async detectAnomalies(profile: EnhancedDeviceProfile, request: any): Promise<AnomalyReport[]> {
    const anomalies: AnomalyReport[] = [];
    
    // Check for fingerprint changes
    const lastFingerprint = profile.history.fingerprints[profile.history.fingerprints.length - 1];
    if (lastFingerprint.fingerprint !== request.fingerprint) {
      const changeScore = this.calculateFingerprintChangeScore(lastFingerprint.components, request.components);
      
      if (changeScore > this.config.thresholds.suspiciousChange) {
        anomalies.push({
          anomalyId: this.generateAnomalyId(),
          type: 'fingerprint_change',
          severity: changeScore > this.config.thresholds.criticalAnomaly ? 'critical' : 'high',
          timestamp: new Date(),
          details: {
            description: 'Significant device fingerprint change detected',
            oldValue: lastFingerprint.fingerprint,
            newValue: request.fingerprint,
            deviation: changeScore,
            recommendation: 'Require additional authentication'
          }
        });
      }
    }
    
    // Check for location jumps
    const lastLocation = profile.history.locations[profile.history.locations.length - 1];
    const currentGeo = await this.geolocationService.getGeolocationData(request.ipAddress);
    
    if (lastLocation && currentGeo.coordinates && lastLocation.geolocation.coordinates) {
      const distance = this.calculateDistance(
        lastLocation.geolocation.coordinates,
        currentGeo.coordinates
      );
      
      const timeDiff = (Date.now() - lastLocation.lastSeen.getTime()) / 1000 / 60; // minutes
      const speed = distance / timeDiff; // km/minute
      
      if (speed > 10) { // Impossible travel speed
        anomalies.push({
          anomalyId: this.generateAnomalyId(),
          type: 'location_jump',
          severity: 'critical',
          timestamp: new Date(),
          details: {
            description: `Impossible travel detected: ${distance}km in ${timeDiff} minutes`,
            oldValue: `${lastLocation.geolocation.city}, ${lastLocation.geolocation.country}`,
            newValue: `${currentGeo.city}, ${currentGeo.country}`,
            deviation: speed,
            recommendation: 'Block access and notify user'
          }
        });
      }
    }
    
    // Check for security violations
    if (request.components.spoofingDetected) {
      anomalies.push({
        anomalyId: this.generateAnomalyId(),
        type: 'security_violation',
        severity: 'high',
        timestamp: new Date(),
        details: {
          description: 'Device fingerprint spoofing detected',
          recommendation: 'Require multi-factor authentication'
        }
      });
    }
    
    return anomalies;
  }

  private calculateFingerprintChangeScore(oldComponents: any, newComponents: any): number {
    let changeScore = 0;
    const weights = {
      canvasFingerprint: 30,
      webglFingerprint: 25,
      audioFingerprint: 20,
      userAgent: 15,
      screenResolution: 10,
      timezone: 5,
      language: 5
    };
    
    for (const [key, weight] of Object.entries(weights)) {
      if (oldComponents[key] !== newComponents[key]) {
        changeScore += weight;
      }
    }
    
    return changeScore;
  }

  private calculateDistance(coord1: any, coord2: any): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(coord2.latitude - coord1.latitude);
    const dLon = this.toRad(coord2.longitude - coord1.longitude);
    const lat1 = this.toRad(coord1.latitude);
    const lat2 = this.toRad(coord2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async calculateTrustScore(profile: EnhancedDeviceProfile): Promise<number> {
    const factors = await this.calculateTrustFactors(profile);
    profile.trustFactors = factors;
    
    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += value * this.config.trustWeights[factor as keyof typeof this.config.trustWeights];
    }
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private async calculateTrustFactors(profile: EnhancedDeviceProfile): Promise<typeof profile.trustFactors> {
    const now = Date.now();
    const ageInDays = (now - profile.firstSeen.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      age: Math.min(100, ageInDays * 2), // Max at 50 days
      consistency: this.calculateConsistencyScore(profile),
      userAssociation: Math.min(100, profile.history.users.filter(u => u.verified).length * 20),
      locationStability: this.calculateLocationStability(profile),
      securityEvents: Math.max(0, 100 - profile.history.securityEvents.length * 10),
      verificationLevel: this.calculateVerificationLevel(profile)
    };
  }

  private calculateConsistencyScore(profile: EnhancedDeviceProfile): number {
    // Check how stable the fingerprint has been
    const changes = profile.history.fingerprints.length - 1;
    return Math.max(0, 100 - changes * 20);
  }

  private calculateLocationStability(profile: EnhancedDeviceProfile): number {
    const locations = profile.history.locations.length;
    if (locations === 0) return 100;
    
    // Higher score for fewer locations
    return Math.max(0, 100 - (locations - 1) * 15);
  }

  private calculateVerificationLevel(profile: EnhancedDeviceProfile): number {
    let level = 0;
    
    // Check verified users
    const verifiedUsers = profile.history.users.filter(u => u.verified).length;
    level += verifiedUsers * 30;
    
    // Check manual verification
    if (profile.trustScore >= 90) level += 20;
    
    return Math.min(100, level);
  }

  private getRiskLevel(trustScore: number): EnhancedDeviceProfile['riskLevel'] {
    if (trustScore >= this.config.thresholds.highTrust) return 'low';
    if (trustScore >= this.config.thresholds.mediumTrust) return 'medium';
    if (trustScore >= this.config.thresholds.lowTrust) return 'high';
    return 'critical';
  }

  private async makeTrustDecision(
    profile: EnhancedDeviceProfile,
    anomalies: AnomalyReport[]
  ): Promise<TrustDecision> {
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    const highAnomalies = anomalies.filter(a => a.severity === 'high');
    
    if (criticalAnomalies.length > 0) {
      return {
        decision: 'block',
        reason: 'Critical security anomalies detected',
        requiresAction: ['manual_review', 'notify_user']
      };
    }
    
    if (profile.riskLevel === 'critical' || highAnomalies.length > 1) {
      return {
        decision: 'challenge',
        reason: 'High risk device',
        requiresAction: ['mfa', 'email_verification']
      };
    }
    
    if (profile.riskLevel === 'high' || highAnomalies.length === 1) {
      return {
        decision: 'monitor',
        reason: 'Elevated risk detected',
        requiresAction: ['increased_logging', 'rate_limiting']
      };
    }
    
    return {
      decision: 'allow',
      reason: 'Device trust acceptable',
      requiresAction: []
    };
  }

  private generateRecommendations(
    profile: EnhancedDeviceProfile,
    anomalies: AnomalyReport[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Based on trust score
    if (profile.trustScore < 40) {
      recommendations.push('Require multi-factor authentication for this device');
      recommendations.push('Monitor all activities from this device closely');
    }
    
    // Based on anomalies
    if (anomalies.some(a => a.type === 'fingerprint_change')) {
      recommendations.push('Verify device ownership through email confirmation');
    }
    
    if (anomalies.some(a => a.type === 'location_jump')) {
      recommendations.push('Check for VPN or proxy usage');
      recommendations.push('Consider temporary access restriction');
    }
    
    // Based on history
    if (profile.history.securityEvents.length > 3) {
      recommendations.push('Consider permanent device ban');
    }
    
    if (profile.history.users.length > 5) {
      recommendations.push('Investigate potential device sharing');
    }
    
    return recommendations;
  }

  // Database operations
  
  private async storeDeviceProfile(profile: EnhancedDeviceProfile): Promise<void> {
    await this.db.query(`
      INSERT INTO device_fingerprints (
        device_id, fingerprint, components, trust_score,
        first_seen, last_seen, trust_factors, data_quality
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      profile.deviceId,
      profile.fingerprint,
      JSON.stringify(profile.components),
      profile.trustScore,
      profile.firstSeen,
      profile.lastSeen,
      JSON.stringify(profile.trustFactors),
      profile.metadata.dataQuality
    ]);
  }

  private async updateDeviceComponents(profile: EnhancedDeviceProfile, request: any): Promise<void> {
    profile.components = this.parseDeviceComponents(request.components);
    profile.lastSeen = new Date();
    profile.metadata.updateCount++;
    
    await this.db.query(`
      UPDATE device_fingerprints 
      SET components = $1, last_seen = $2, update_count = $3 
      WHERE fingerprint = $4
    `, [
      JSON.stringify(profile.components),
      profile.lastSeen,
      profile.metadata.updateCount,
      profile.fingerprint
    ]);
  }

  private async getUserAssociations(fingerprint: string): Promise<UserAssociation[]> {
    const result = await this.db.query(`
      SELECT * FROM device_user_associations 
      WHERE device_fingerprint = $1 
      ORDER BY last_seen DESC
    `, [fingerprint]);
    
    return result.rows.map(row => ({
      userId: row.user_id,
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      loginCount: row.login_count,
      verified: row.verified,
      trustLevel: row.trust_level
    }));
  }

  private async getLocationHistory(fingerprint: string): Promise<LocationHistory[]> {
    const result = await this.db.query(`
      SELECT * FROM device_location_history 
      WHERE device_fingerprint = $1 
      ORDER BY last_seen DESC 
      LIMIT 10
    `, [fingerprint]);
    
    return result.rows.map(row => ({
      geolocation: JSON.parse(row.location_data),
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      frequency: row.frequency
    }));
  }

  private async getFingerprintHistory(deviceId: string): Promise<FingerprintHistory[]> {
    const result = await this.db.query(`
      SELECT * FROM device_fingerprint_history 
      WHERE device_id = $1 
      ORDER BY first_seen DESC 
      LIMIT 10
    `, [deviceId]);
    
    return result.rows.map(row => ({
      fingerprint: row.fingerprint,
      components: JSON.parse(row.components),
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      transitionReason: row.transition_reason
    }));
  }

  private async getSecurityEvents(fingerprint: string): Promise<SecurityEvent[]> {
    const result = await this.db.query(`
      SELECT * FROM device_security_events 
      WHERE device_fingerprint = $1 
      ORDER BY timestamp DESC 
      LIMIT 20
    `, [fingerprint]);
    
    return result.rows.map(row => ({
      eventId: row.event_id,
      type: row.event_type,
      severity: row.severity,
      timestamp: row.timestamp,
      details: JSON.parse(row.details)
    }));
  }

  private async getRecentAnomalies(fingerprint: string): Promise<AnomalyReport[]> {
    const result = await this.db.query(`
      SELECT * FROM device_anomalies 
      WHERE device_fingerprint = $1 
        AND timestamp >= NOW() - INTERVAL '7 days'
      ORDER BY timestamp DESC
    `, [fingerprint]);
    
    return result.rows.map(row => ({
      anomalyId: row.anomaly_id,
      type: row.anomaly_type,
      severity: row.severity,
      timestamp: row.timestamp,
      details: JSON.parse(row.details)
    }));
  }

  // Caching methods
  
  private async getCachedDeviceProfile(fingerprint: string): Promise<EnhancedDeviceProfile | null> {
    const cached = await this.redis.get(`device_profile:${fingerprint}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  private async cacheDeviceProfile(profile: EnhancedDeviceProfile): Promise<void> {
    await this.redis.setex(
      `device_profile:${profile.fingerprint}`,
      this.config.cache.deviceProfileTTL,
      JSON.stringify(profile)
    );
  }

  private requiresUpdate(profile: EnhancedDeviceProfile): boolean {
    const lastUpdated = typeof profile.metadata.lastUpdated === 'string' 
      ? new Date(profile.metadata.lastUpdated) 
      : profile.metadata.lastUpdated;
    const age = Date.now() - lastUpdated.getTime();
    return age > this.config.cache.deviceProfileTTL * 1000;
  }

  // Utility methods
  
  private generateDeviceId(): string {
    return `dev_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateAnomalyId(): string {
    return `anom_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private async logDeviceIdentification(
    profile: EnhancedDeviceProfile,
    request: any,
    decision: TrustDecision
  ): Promise<void> {
    await this.auditService.logEvent({
      action: 'device_identified',
      userId: request.userId,
      details: {
        deviceId: profile.deviceId,
        fingerprint: profile.fingerprint,
        trustScore: profile.trustScore,
        riskLevel: profile.riskLevel,
        decision: decision.decision,
        anomalyCount: profile.anomalies.length
      },
      ipAddress: request.ipAddress,
      sessionId: request.sessionId,
      severity: 'info'
    });
  }

  private async updateUserAssociations(profile: EnhancedDeviceProfile): Promise<void> {
    profile.history.users = await this.getUserAssociations(profile.fingerprint);
  }

  private async analyzeBehavior(profile: EnhancedDeviceProfile, behaviorData: any): Promise<void> {
    // Placeholder for behavioral analysis
    // Would implement mouse movement, keyboard dynamics, etc.
    console.log('Analyzing behavior for device:', profile.deviceId);
  }

  private async processExistingDevice(
    profile: EnhancedDeviceProfile,
    request: any
  ): Promise<any> {
    // Quick processing for cached devices
    const anomalies = await this.detectAnomalies(profile, request);
    const trustDecision = await this.makeTrustDecision(profile, anomalies);
    const recommendations = this.generateRecommendations(profile, anomalies);
    
    return {
      deviceProfile: profile,
      isNewDevice: false,
      trustDecision,
      anomalies,
      recommendations
    };
  }

  private async getTrustFactorBreakdown(profile: EnhancedDeviceProfile): Promise<Record<string, number>> {
    const factors = await this.calculateTrustFactors(profile);
    const breakdown: Record<string, number> = {};
    
    for (const [factor, value] of Object.entries(factors)) {
      const weight = this.config.trustWeights[factor as keyof typeof this.config.trustWeights];
      breakdown[factor] = value * weight;
    }
    
    return breakdown;
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    // Extended schema for enhanced device identification
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS device_anomalies (
        anomaly_id VARCHAR(50) PRIMARY KEY,
        device_fingerprint VARCHAR(64) NOT NULL,
        anomaly_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        details JSONB,
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        resolution_notes TEXT
      )
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_device_anomalies_fingerprint 
      ON device_anomalies(device_fingerprint);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_device_anomalies_timestamp 
      ON device_anomalies(timestamp);
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS device_fingerprint_history (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL,
        fingerprint VARCHAR(64) NOT NULL,
        components JSONB NOT NULL,
        first_seen TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW(),
        transition_reason TEXT
      )
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_fingerprint_history_device 
      ON device_fingerprint_history(device_id);
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS device_location_history (
        id SERIAL PRIMARY KEY,
        device_fingerprint VARCHAR(64) NOT NULL,
        location_data JSONB NOT NULL,
        first_seen TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW(),
        frequency INTEGER DEFAULT 1
      )
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_location_history_fingerprint 
      ON device_location_history(device_fingerprint);
    `);
  }
}

export interface TrustDecision {
  decision: 'allow' | 'monitor' | 'challenge' | 'block';
  reason: string;
  requiresAction: string[];
}