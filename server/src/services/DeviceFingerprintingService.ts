// Device Fingerprinting Service
// Advanced device identification and tracking for enhanced security

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import crypto from 'crypto';

}
export interface DeviceFingerprint {
  fingerprint: string;
  components: {
    userAgent: string;
    screenResolution?: string;
    timezone: string;
    language: string;
    platform: string;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    colorDepth?: number;
    pixelRatio?: number;
    touchSupport?: boolean;
    webGLVendor?: string;
    webGLRenderer?: string;
    fonts?: string[];
    plugins?: string[];
    canvas?: string; // Canvas fingerprint hash
    audio?: string; // Audio fingerprint hash
    webRTC?: {
      localIP?: string;
      publicIP?: string;
}
    };
  };
  metadata: {
    createdAt: Date;
    lastSeen: Date;
    seenCount: number;
    trustScore: number;
    riskFactors: string[];
  };
}

}
export interface DeviceTrustProfile {
  deviceId: string;
  fingerprint: string;
  trustScore: number; // 0-100
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'suspicious' | 'blocked';
  firstSeen: Date;
  lastSeen: Date;
  associatedUsers: string[];
  locationHistory: Array<{
    country: string;
    city: string;
    timestamp: Date;
}
  }>;
  behaviorMetrics: {
    consistencyScore: number;
    anomalyCount: number;
    avgSessionDuration: number;
    accessPatterns: Record<string, number>; // hour -> count
  };
  securityEvents: Array<{
    eventType: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
    resolved: boolean;
  }>;
}

}
export interface DeviceFingerprintConfig {
  enabled: boolean;
  
  // Fingerprinting components
  components: {
    collectCanvas: boolean;
    collectAudio: boolean;
    collectWebGL: boolean;
    collectFonts: boolean;
    collectPlugins: boolean;
    collectWebRTC: boolean;
    collectHardware: boolean;
}
  };
  
  // Trust scoring
  trustScoring: {
    newDevicePenalty: number;
    consistencyBonus: number;
    anomalyPenalty: number;
    verificationBonus: number;
    ageBonus: number; // Bonus for older, consistent devices
  };
  
  // Security thresholds
  thresholds: {
    minimumTrustScore: number;
    suspiciousActivityThreshold: number;
    autoBlockThreshold: number;
    fingerprintChangeThreshold: number; // Similarity threshold for fingerprint changes
  };
  
  // Caching
  cache: {
    deviceProfileTtl: number;
    fingerprintTtl: number;
    trustScoreTtl: number;
  };
  
  // Privacy settings
  privacy: {
    hashSensitiveData: boolean;
    excludeFields: string[];
    anonymizeIPs: boolean;
  };
}

export class DeviceFingerprintingService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: DeviceFingerprintConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config: DeviceFingerprintConfig
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = config;
  }

  async initialize(): Promise<void> {

    // Create database tables for device fingerprinting
    await this.initializeTables();
    
    console.log('Device Fingerprinting Service initialized');
  }

  private async initializeTables(): Promise<void> {

    // Device fingerprints table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS device_fingerprints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fingerprint VARCHAR(128) UNIQUE NOT NULL,
        components JSONB NOT NULL,
        first_seen TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW(),
        seen_count INTEGER DEFAULT 1,
        trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
        risk_factors JSONB DEFAULT '[]'::jsonb,
        is_blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()

    `);

    // Device-user associations table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS device_user_associations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_fingerprint VARCHAR(128) NOT NULL,
        user_id UUID NOT NULL,
        first_associated TIMESTAMP DEFAULT NOW(),
        last_accessed TIMESTAMP DEFAULT NOW(),
        access_count INTEGER DEFAULT 1,
        is_primary BOOLEAN DEFAULT false,
        is_trusted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()

    `);

    // Device trust profiles table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS device_trust_profiles (
        device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fingerprint VARCHAR(128) UNIQUE NOT NULL,
        trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
        verification_status VARCHAR(20) DEFAULT 'unverified',
        behavior_metrics JSONB,
        location_history JSONB DEFAULT '[]'::jsonb,
        security_events JSONB DEFAULT '[]'::jsonb,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()

    `);

    // Device security events table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS device_security_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_fingerprint VARCHAR(128) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
        description TEXT,
        context_data JSONB,
        resolved BOOLEAN DEFAULT false,
        resolved_by VARCHAR(255),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()

    `);

    // Create indexes for performance
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_device_fingerprints_fingerprint ON device_fingerprints(fingerprint);
      CREATE INDEX IF NOT EXISTS idx_device_fingerprints_trust_score ON device_fingerprints(trust_score);
      CREATE INDEX IF NOT EXISTS idx_device_fingerprints_blocked ON device_fingerprints(is_blocked);
      CREATE INDEX IF NOT EXISTS idx_device_fingerprints_last_seen ON device_fingerprints(last_seen);
      
      CREATE INDEX IF NOT EXISTS idx_device_user_device ON device_user_associations(device_fingerprint);
      CREATE INDEX IF NOT EXISTS idx_device_user_user ON device_user_associations(user_id);
      CREATE INDEX IF NOT EXISTS idx_device_user_trusted ON device_user_associations(is_trusted);
      
      CREATE INDEX IF NOT EXISTS idx_device_trust_fingerprint ON device_trust_profiles(fingerprint);
      CREATE INDEX IF NOT EXISTS idx_device_trust_status ON device_trust_profiles(verification_status);
      CREATE INDEX IF NOT EXISTS idx_device_trust_score ON device_trust_profiles(trust_score);
      
      CREATE INDEX IF NOT EXISTS idx_device_security_device ON device_security_events(device_fingerprint);
      CREATE INDEX IF NOT EXISTS idx_device_security_type ON device_security_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_device_security_severity ON device_security_events(severity);
      CREATE INDEX IF NOT EXISTS idx_device_security_resolved ON device_security_events(resolved);
    `);
  }

  async generateFingerprint(components: Partial<DeviceFingerprint['components']>): Promise<string> {

    // Validate required components
    if (!components.userAgent || !components.timezone || !components.language) {
      throw new Error('Missing required fingerprint components');
    }

    // Create a deterministic fingerprint from device components
    const fingerprintData = {
      // Core components (always included)
      userAgent: components.userAgent,
      timezone: components.timezone,
      language: components.language,
      platform: components.platform || 'unknown',
      
      // Optional hardware components
      ...(this.config.components.collectHardware && {
        screenResolution: components.screenResolution,
        hardwareConcurrency: components.hardwareConcurrency,
        deviceMemory: components.deviceMemory,
        colorDepth: components.colorDepth,
        pixelRatio: components.pixelRatio,
        touchSupport: components.touchSupport
      }),
      
      // WebGL components
      ...(this.config.components.collectWebGL && {
        webGLVendor: components.webGLVendor,
        webGLRenderer: components.webGLRenderer
      }),
      
      // Canvas fingerprint
      ...(this.config.components.collectCanvas && {
        canvas: components.canvas
      }),
      
      // Audio fingerprint
      ...(this.config.components.collectAudio && {
        audio: components.audio
      }),
      
      // Font list (sorted for consistency)
      ...(this.config.components.collectFonts && {
        fonts: components.fonts?.sort()
      }),
      
      // Plugin list (sorted for consistency)
      ...(this.config.components.collectPlugins && {
        plugins: components.plugins?.sort()
  }
    };

    // Apply privacy settings
    if (this.config.privacy.anonymizeIPs && components.webRTC) {
      delete fingerprintData['webRTC'];
    }

    // Create stable hash
    const fingerprintString = JSON.stringify(fingerprintData, Object.keys(fingerprintData).sort());
    const hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');
    
    return hash;
  }

  async recordDeviceAccess(
    fingerprint: string,
    components: Partial<DeviceFingerprint['components']>,
    userId?: string,
    context?: {
      ipAddress?: string;
      location?: { country: string; city: string };
    }
  ): Promise<DeviceTrustProfile> {

    try {
      // Check if device exists
      const existingDevice = await this.getDeviceByFingerprint(fingerprint);
      
      if (existingDevice) {
        // Update existing device
        await this.updateDeviceAccess(fingerprint, components);
        
        // Update user association if provided
        if (userId) {
          await this.updateUserAssociation(fingerprint, userId);
        }
        
        // Update location history if provided
        if (context?.location) {
          await this.updateLocationHistory(fingerprint, context.location);
        }
      } else {
        // Create new device record
        await this.createDeviceRecord(fingerprint, components);
        
        // Create user association if provided
        if (userId) {
          await this.createUserAssociation(fingerprint, userId);
        }
        
        // Create trust profile
        await this.createTrustProfile(fingerprint);
        
        // Log new device event
        await this.logSecurityEvent(fingerprint, 'new_device', 'low', 'New device detected');
      }
      
      // Calculate trust score
      const trustProfile = await this.calculateDeviceTrust(fingerprint, userId);
      
      // Cache the profile
      await this.cacheDeviceProfile(fingerprint, trustProfile);
      
      return trustProfile;
    } catch (error) {
      console.error('Error recording device access:', error);
      throw error;
    }
  }

  private async getDeviceByFingerprint(fingerprint: string): Promise<unknown> {

    const result = await this.db.query(
      'SELECT * FROM device_fingerprints WHERE fingerprint = $1',
      [fingerprint]
    );
    return result.rows[0];
  }

  private async updateDeviceAccess(
    fingerprint: string,
    components: Partial<DeviceFingerprint['components']>
  ): Promise<void> {

    await this.db.query(`
      UPDATE device_fingerprints 
      SET 
        last_seen = NOW(),
        seen_count = seen_count + 1,
        components = $2,
        updated_at = NOW()
      WHERE fingerprint = $1
    `, [fingerprint, JSON.stringify(components)]);
  }

  private async createDeviceRecord(
    fingerprint: string,
    components: Partial<DeviceFingerprint['components']>
  ): Promise<void> {

    await this.db.query(`
      INSERT INTO device_fingerprints (fingerprint, components)
      VALUES ($1, $2)
    `, [fingerprint, JSON.stringify(components)]);
  }

  private async updateUserAssociation(fingerprint: string, userId: string): Promise<void> {

    await this.db.query(`
      INSERT INTO device_user_associations (device_fingerprint, user_id)
      VALUES ($1, $2)
      ON CONFLICT (device_fingerprint, user_id)
      DO UPDATE SET
        last_accessed = NOW(),
        access_count = device_user_associations.access_count + 1
    `, [fingerprint, userId]);
  }

  private async createUserAssociation(fingerprint: string, userId: string): Promise<void> {

    await this.db.query(`
      INSERT INTO device_user_associations (device_fingerprint, user_id)
      VALUES ($1, $2)
    `, [fingerprint, userId]);
  }

  private async updateLocationHistory(
    fingerprint: string,
    location: { country: string; city: string }
  ): Promise<void> {

    const profile = await this.db.query(
      'SELECT location_history FROM device_trust_profiles WHERE fingerprint = $1',
      [fingerprint]
    );
    
    if (profile.rows.length > 0) {
      const history = profile.rows[0].location_history || [];
      history.push({
        ...location,
        timestamp: new Date()
      });
      
      // Keep only last 50 locations
      const trimmedHistory = history.slice(-50);
      
      await this.db.query(`
        UPDATE device_trust_profiles
        SET location_history = $2, updated_at = NOW()
        WHERE fingerprint = $1
      `, [fingerprint, JSON.stringify(trimmedHistory)]);
    }
  }

  private async createTrustProfile(fingerprint: string): Promise<void> {

    await this.db.query(`
      INSERT INTO device_trust_profiles (fingerprint, trust_score, verification_status)
      VALUES ($1, $2, 'unverified')
    `, [fingerprint, this.config.thresholds.minimumTrustScore]);
  }

  private async calculateDeviceTrust(
    fingerprint: string,
    userId?: string
  ): Promise<DeviceTrustProfile> {

    // Get device data
    const device = await this.getDeviceByFingerprint(fingerprint);
    const profile = await this.getTrustProfile(fingerprint);
    const associations = await this.getUserAssociations(fingerprint);
    const securityEvents = await this.getSecurityEvents(fingerprint);
    
    let trustScore = profile?.trust_score || this.config.thresholds.minimumTrustScore;
    
    // Age bonus - older devices are more trusted
    const ageInDays = (Date.now() - new Date(device.first_seen).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 30) {
      trustScore += Math.min(this.config.trustScoring.ageBonus, ageInDays / 10);
    } else {
      trustScore -= this.config.trustScoring.newDevicePenalty;
    }
    
    // Consistency bonus - regular access patterns
    if (device.seen_count > 10) {
      trustScore += this.config.trustScoring.consistencyBonus;
    }
    
    // User association bonus - multiple verified users
    const verifiedUsers = associations.filter((a: unknown) => a.is_trusted).length;
    trustScore += verifiedUsers * 5;
    
    // Security event penalties
    const recentEvents = securityEvents.filter((e: Error) => 
      !e.resolved && new Date(e.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    trustScore -= recentEvents.length * this.config.trustScoring.anomalyPenalty;
    
    // Verification status bonus
    if (profile?.verification_status === 'verified') {
      trustScore += this.config.trustScoring.verificationBonus;
    }
    
    // Normalize score
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));
    
    // Update trust score in database
    await this.updateTrustScore(fingerprint, trustScore);
    
    // Determine verification status based on score and events
    let verificationStatus = profile?.verification_status || 'unverified';
    if (trustScore < this.config.thresholds.autoBlockThreshold) {
      verificationStatus = 'blocked';
    } else if (trustScore < this.config.thresholds.suspiciousActivityThreshold) {
      verificationStatus = 'suspicious';
    }
    
    const trustProfile: DeviceTrustProfile = {
      deviceId: device.id,
      fingerprint,
      trustScore,
      verificationStatus: verificationStatus as any,
      firstSeen: device.first_seen,
      lastSeen: device.last_seen,
      associatedUsers: associations.map((a: unknown) => a.user_id),
      locationHistory: profile?.location_history || [],
      behaviorMetrics: await this.calculateBehaviorMetrics(fingerprint),
      securityEvents: securityEvents.map((e: Error) => ({
        eventType: e.event_type,
        severity: e.severity,
        timestamp: e.created_at,
        resolved: e.resolved
      }))
    };
    
    return trustProfile;
  }

  private async getTrustProfile(fingerprint: string): Promise<unknown> {

    const result = await this.db.query(
      'SELECT * FROM device_trust_profiles WHERE fingerprint = $1',
      [fingerprint]
    );
    return result.rows[0];
  }

  private async getUserAssociations(fingerprint: string): Promise<any[]> {

    const result = await this.db.query(
      'SELECT * FROM device_user_associations WHERE device_fingerprint = $1',
      [fingerprint]
    );
    return result.rows;
  }

  private async getSecurityEvents(fingerprint: string): Promise<any[]> {

    const result = await this.db.query(
      'SELECT * FROM device_security_events WHERE device_fingerprint = $1 ORDER BY created_at DESC',
      [fingerprint]
    );
    return result.rows;
  }

  private async updateTrustScore(fingerprint: string, trustScore: number): Promise<void> {

    await this.db.query(`
      UPDATE device_trust_profiles
      SET trust_score = $2, updated_at = NOW()
      WHERE fingerprint = $1
    `, [fingerprint, trustScore]);
    
    await this.db.query(`
      UPDATE device_fingerprints
      SET trust_score = $2, updated_at = NOW()
      WHERE fingerprint = $1
    `, [fingerprint, trustScore]);
  }

  private async calculateBehaviorMetrics(fingerprint: string): Promise<DeviceTrustProfile['behaviorMetrics']> {

    // Get access patterns from audit logs
    const accessPatterns = await this.db.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM device_user_associations dua
      JOIN audit_logs al ON al.user_id = dua.user_id
      WHERE dua.device_fingerprint = $1
        AND al.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
    `, [fingerprint]);
    
    const patterns: Record<string, number> = {};
    accessPatterns.rows.forEach((row: unknown) => {
      patterns[row.hour] = parseInt(row.count);
    });
    
    // Calculate consistency score based on access pattern variance
    const hours = Object.values(patterns);
    const avgAccess = hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0;
    const variance = hours.length > 0 
      ? hours.reduce((sum, val) => sum + Math.pow(val - avgAccess, 2), 0) / hours.length 
      : 0;
    const consistencyScore = Math.max(0, 100 - (variance * 10));
    
    // Get anomaly count
    const anomalies = await this.db.query(`
      SELECT COUNT(*) as count
      FROM device_security_events
      WHERE device_fingerprint = $1
        AND severity IN ('medium', 'high')
        AND created_at >= NOW() - INTERVAL '30 days'
    `, [fingerprint]);
    
    return {
      consistencyScore: Math.round(consistencyScore),
      anomalyCount: parseInt(anomalies.rows[0]?.count || '0'),
      avgSessionDuration: 0, // Would calculate from session data
      accessPatterns: patterns
    };
  }

  private async logSecurityEvent(
    fingerprint: string,
    eventType: string,
    severity: 'low' | 'medium' | 'high',
    description: string,
    contextData?: Record<string, unknown>
  ): Promise<void> {

    await this.db.query(`
      INSERT INTO device_security_events (
        device_fingerprint, event_type, severity, description, context_data
      ) VALUES ($1, $2, $3, $4, $5)
    `, [fingerprint, eventType, severity, description, JSON.stringify(contextData || {})]);
    
    // Also log to audit service
    await this.auditService.logEvent({
      action: `device_${eventType}`,
      details: {
        fingerprint,
        severity,
        description,
        ...contextData
  }
      severity: severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info'
    });
  }

  private async cacheDeviceProfile(fingerprint: string, profile: DeviceTrustProfile): Promise<void> {

    try {
      const cacheKey = `device_profile:${fingerprint}`;
      await this.redis.setex(
        cacheKey,
        this.config.cache.deviceProfileTtl,
        JSON.stringify(profile)
      );
    } catch (error) {
      // Log cache errors but don't propagate them
      console.warn('Failed to cache device profile:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async verifyDevice(
    fingerprint: string,
    expectedFingerprint?: string,
    userId?: string
  ): Promise<{
    isValid: boolean;
    trustScore: number;
    riskFactors: string[];
    requiresAdditionalVerification: boolean;
  }> {

    try {
      // Check if device is blocked
      const device = await this.getDeviceByFingerprint(fingerprint);
      if (!device) {
        return {
          isValid: false,
          trustScore: 0,
          riskFactors: ['unknown_device'],
          requiresAdditionalVerification: true
        };
      }
      
      if (device.is_blocked) {
        return {
          isValid: false,
          trustScore: device.trust_score,
          riskFactors: ['device_blocked'],
          requiresAdditionalVerification: true
        };
      }
      
      // Check fingerprint change if expected fingerprint provided
      const riskFactors: string[] = [];
      if (expectedFingerprint && expectedFingerprint !== fingerprint) {
        const similarity = this.calculateFingerprintSimilarity(fingerprint, expectedFingerprint);
        if (similarity < this.config.thresholds.fingerprintChangeThreshold) {
          riskFactors.push('significant_fingerprint_change');
          await this.logSecurityEvent(
            fingerprint,
            'fingerprint_change',
            'medium',
            'Significant device fingerprint change detected',
            { previousFingerprint: expectedFingerprint, similarity }
          );
        }
      }
      
      // Get trust profile
      const trustProfile = await this.calculateDeviceTrust(fingerprint, userId);
      
      // Check for risk factors
      if (trustProfile.trustScore < this.config.thresholds.suspiciousActivityThreshold) {
        riskFactors.push('low_trust_score');
      }
      
      if (trustProfile.verificationStatus === 'suspicious') {
        riskFactors.push('suspicious_device');
      }
      
      // Check recent security events
      const recentHighSeverityEvents = trustProfile.securityEvents.filter(
        e => e.severity === 'high' && !e.resolved
      );
      if (recentHighSeverityEvents.length > 0) {
        riskFactors.push('recent_security_events');
      }
      
      // Check user association
      if (userId && !trustProfile.associatedUsers.includes(userId)) {
        riskFactors.push('new_user_device_pairing');
        await this.logSecurityEvent(
          fingerprint,
          'new_user_association',
          'low',
          'New user accessing from existing device',
          { userId }
        );
      }
      
      return {
        isValid: trustProfile.verificationStatus !== 'blocked',
        trustScore: trustProfile.trustScore,
        riskFactors,
        requiresAdditionalVerification: riskFactors.length > 0 || 
          trustProfile.trustScore < this.config.thresholds.minimumTrustScore
      };
    } catch (error) {
      console.error('Device verification error:', error);
      return {
        isValid: false,
        trustScore: 0,
        riskFactors: ['verification_error'],
        requiresAdditionalVerification: true
      };
    }
  }

  private calculateFingerprintSimilarity(fp1: string, fp2: string): number {
    // Simple similarity based on character matching
    // In production, this would use more sophisticated algorithms
    let matches = 0;
    const maxLength = Math.max(fp1.length, fp2.length);
    
    for (let i = 0; i < Math.min(fp1.length, fp2.length); i++) {
      if (fp1[i] === fp2[i]) matches++;
    }
    
    return (matches / maxLength) * 100;
  }

  async getDeviceHistory(
    fingerprint: string,
    limit = 50
  ): Promise<{
    device: Error;
    users: unknown[];
    locations: unknown[];
    securityEvents: unknown[];
  }> {

    const device = await this.getDeviceByFingerprint(fingerprint);
    if (!device) {
      throw new Error('Device not found');
    }
    
    const users = await this.db.query(`
      SELECT 
        dua.*,
        u.email,
        u.display_name
      FROM device_user_associations dua
      JOIN users u ON u.id = dua.user_id
      WHERE dua.device_fingerprint = $1
      ORDER BY dua.last_accessed DESC
      LIMIT $2
    `, [fingerprint, limit]);
    
    const profile = await this.getTrustProfile(fingerprint);
    const locations = profile?.location_history || [];
    
    const securityEvents = await this.db.query(`
      SELECT * FROM device_security_events
      WHERE device_fingerprint = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [fingerprint, limit]);
    
    return {
      device,
      users: users.rows,
      locations: locations.slice(-limit),
      securityEvents: securityEvents.rows
    };
  }

  async markDeviceAsTrusted(
    fingerprint: string,
    userId: string,
    trustedBy: string
  ): Promise<void> {

    // Update device trust status
    await this.db.query(`
      UPDATE device_user_associations
      SET is_trusted = true
      WHERE device_fingerprint = $1 AND user_id = $2
    `, [fingerprint, userId]);
    
    // Update verification status
    await this.db.query(`
      UPDATE device_trust_profiles
      SET verification_status = 'verified', updated_at = NOW()
      WHERE fingerprint = $1
    `, [fingerprint]);
    
    // Log trust event
    await this.logSecurityEvent(
      fingerprint,
      'device_trusted',
      'low',
      'Device marked as trusted',
      { userId, trustedBy }
    );
    
    // Recalculate trust score
    await this.calculateDeviceTrust(fingerprint, userId);
  }

  async blockDevice(
    fingerprint: string,
    reason: string,
    blockedBy: string
  ): Promise<void> {

    // Update device block status
    await this.db.query(`
      UPDATE device_fingerprints
      SET is_blocked = true, updated_at = NOW()
      WHERE fingerprint = $1
    `, [fingerprint]);
    
    // Update verification status
    await this.db.query(`
      UPDATE device_trust_profiles
      SET verification_status = 'blocked', trust_score = 0, updated_at = NOW()
      WHERE fingerprint = $1
    `, [fingerprint]);
    
    // Log block event
    await this.logSecurityEvent(
      fingerprint,
      'device_blocked',
      'high',
      `Device blocked: ${reason}`,
      { blockedBy, reason }
    );
    
    // Clear cache
    await this.redis.del(`device_profile:${fingerprint}`);
  }

  async getDeviceStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<Record<string, any>> {
    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };
    
    const stats = await this.db.query(`
      SELECT
        COUNT(DISTINCT fingerprint) as total_devices,
        COUNT(DISTINCT fingerprint) FILTER (WHERE first_seen >= NOW() - INTERVAL '${timeframes[timeframe]}') as new_devices,
        COUNT(DISTINCT fingerprint) FILTER (WHERE is_blocked = true) as blocked_devices,
        AVG(trust_score) as avg_trust_score,
        COUNT(DISTINCT fingerprint) FILTER (WHERE trust_score < ${this.config.thresholds.suspiciousActivityThreshold}) as suspicious_devices
      FROM device_fingerprints
    `);
    
    const eventStats = await this.db.query(`
      SELECT
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE severity = 'high') as high_severity_events,
        COUNT(*) FILTER (WHERE resolved = false) as unresolved_events
      FROM device_security_events
      WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
    `);
    
    const userDeviceStats = await this.db.query(`
      SELECT
        COUNT(DISTINCT user_id) as users_with_devices,
        AVG(device_count) as avg_devices_per_user
      FROM (
        SELECT user_id, COUNT(DISTINCT device_fingerprint) as device_count
        FROM device_user_associations
        GROUP BY user_id
      ) user_devices
    `);
    
    return {
      timeframe,
      devices: stats.rows[0],
      securityEvents: eventStats.rows[0],
      userMetrics: userDeviceStats.rows[0],
      generatedAt: new Date()
    };
  }
}