/**
 * Trusted Device Manager Service
 * 
 * Manages trusted devices for users, allowing them to bypass MFA on recognized devices.
 * Integrates with DeviceFingerprintingService for device identification and risk assessment.
 * 
 * Features:
 * - Register and manage trusted devices
 * - Automatic device expiration and renewal
 * - Risk-based trust decisions
 * - Device verification workflows
 * - Trust revocation capabilities
 * - Device history and audit trails
 * - Geolocation-based validation
 * - Anomaly detection for device changes
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { 
  DeviceFingerprintingService, 
  DeviceFingerprint, 
  LocationData, 
  RiskLevel,
  FingerprintContext,
  FingerprintType
} from './DeviceFingerprintingService';

// Trust status for devices
export enum TrustStatus {
  TRUSTED = 'trusted',
  PENDING = 'pending',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPICIOUS = 'suspicious'
}

// Trust verification methods
export enum VerificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  MFA = 'mfa',
  ADMIN = 'admin'
}

// Device trust levels
export enum TrustLevel {
  FULL = 'full',         // Complete trust, bypass all MFA
  PARTIAL = 'partial',   // Bypass some MFA, still require for sensitive operations
  LIMITED = 'limited',   // Only remember device, still require MFA
  NONE = 'none'         // No trust
}

// Trusted device record
export interface TrustedDevice {
  id: string;
  userId: string;
  deviceId: string;
  fingerprintId: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'other';
  browser: string;
  platform: string;
  
  // Trust information
  trustStatus: TrustStatus;
  trustLevel: TrustLevel;
  trustScore: number; // 0-100
  verificationMethod: VerificationMethod;
  verifiedAt: Date;
  verificationToken?: string;
  
  // Timestamps
  createdAt: Date;
  lastUsed: Date;
  lastVerified: Date;
  expiresAt: Date;
  revokedAt?: Date;
  
  // Location and risk
  primaryLocation?: LocationData;
  lastLocation?: LocationData;
  riskLevel: RiskLevel;
  riskFactors: string[];
  
  // Usage statistics
  loginCount: number;
  failedAttempts: number;
  suspiciousActivities: number;
  
  // Configuration
  settings: {
    requireLocationCheck: boolean;
    allowRoaming: boolean;
    maxLocationRadius: number; // km
    notifyOnNewLogin: boolean;
    autoRenew: boolean;
    requirePeriodicVerification: boolean;
    verificationIntervalDays: number;
  };
  
  metadata: Record<string, any>;
}

// Device verification request
export interface DeviceVerificationRequest {
  userId: string;
  deviceFingerprint: DeviceFingerprint;
  location: LocationData;
  verificationMethod: VerificationMethod;
  challenge?: string;
  metadata?: Record<string, any>;
}

// Trust decision
export interface TrustDecision {
  trusted: boolean;
  device?: TrustedDevice;
  reason: string;
  riskScore: number;
  requiresVerification: boolean;
  verificationMethods?: VerificationMethod[];
  factors: {
    deviceMatch: boolean;
    locationMatch: boolean;
    riskAcceptable: boolean;
    notExpired: boolean;
    notRevoked: boolean;
    recentlyVerified: boolean;
  };
}

// Configuration
export interface TrustedDeviceConfig {
  maxDevicesPerUser: number;
  defaultTrustDurationDays: number;
  defaultVerificationIntervalDays: number;
  maxLocationRadiusKm: number;
  requireLocationCheck: boolean;
  allowRoaming: boolean;
  autoExpireInactiveDays: number;
  riskThreshold: {
    full: number;    // Risk score threshold for full trust
    partial: number; // Risk score threshold for partial trust
    deny: number;    // Risk score above which to deny trust
  };
  verificationMethods: VerificationMethod[];
  enableAnomalyDetection: boolean;
  enableAutoRenewal: boolean;
}

/**
 * Trusted Device Manager Service
 */
export class TrustedDeviceManager extends EventEmitter {
  private trustedDevices: Map<string, TrustedDevice[]> = new Map(); // userId -> devices
  private deviceLookup: Map<string, TrustedDevice> = new Map(); // deviceId -> device
  private verificationTokens: Map<string, { userId: string; deviceId: string; expires: Date }> = new Map();
  
  constructor(
    private fingerprintService: DeviceFingerprintingService,
    private config: TrustedDeviceConfig = {
      maxDevicesPerUser: 5,
      defaultTrustDurationDays: 30,
      defaultVerificationIntervalDays: 7,
      maxLocationRadiusKm: 50,
      requireLocationCheck: true,
      allowRoaming: false,
      autoExpireInactiveDays: 90,
      riskThreshold: {
        full: 20,
        partial: 50,
        deny: 80
      },
      verificationMethods: [VerificationMethod.EMAIL, VerificationMethod.SMS],
      enableAnomalyDetection: true,
      enableAutoRenewal: true
    }
  ) {
    super();
    this.startMaintenanceTimer();
  }

  /**
   * Check if a device is trusted for a user
   */
  public async checkDeviceTrust(
    userId: string,
    context: FingerprintContext,
    location?: LocationData
  ): Promise<TrustDecision> {
    try {
      // Generate fingerprint for the current device
      const fingerprint = await this.fingerprintService.generateFingerprint(
        context,
        FingerprintType.ENHANCED
      );

      // Get user's trusted devices
      const userDevices = this.trustedDevices.get(userId) || [];
      
      // Find matching device
      const matchingDevice = this.findMatchingDevice(userDevices, fingerprint, location);
      
      if (!matchingDevice) {
        return {
          trusted: false,
          reason: 'Device not recognized',
          riskScore: 100,
          requiresVerification: true,
          verificationMethods: this.config.verificationMethods,
          factors: {
            deviceMatch: false,
            locationMatch: false,
            riskAcceptable: false,
            notExpired: false,
            notRevoked: false,
            recentlyVerified: false
          }
        };
      }

      // Evaluate trust factors
      const factors = this.evaluateTrustFactors(matchingDevice, fingerprint, location);
      const decision = this.makeTrustDecision(matchingDevice, factors);

      // Update device usage
      if (decision.trusted) {
        matchingDevice.lastUsed = new Date();
        matchingDevice.loginCount++;
        
        if (location) {
          matchingDevice.lastLocation = location;
        }
        
        this.emit('deviceTrusted', {
          userId,
          device: matchingDevice,
          decision,
          timestamp: new Date()
        });
      } else {
        matchingDevice.failedAttempts++;
        
        this.emit('deviceUntrusted', {
          userId,
          device: matchingDevice,
          decision,
          timestamp: new Date()
        });
      }

      return decision;
    } catch (error) {
      this.emit('error', {
        operation: 'checkDeviceTrust',
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        trusted: false,
        reason: 'Error checking device trust',
        riskScore: 100,
        requiresVerification: true,
        verificationMethods: this.config.verificationMethods,
        factors: {
          deviceMatch: false,
          locationMatch: false,
          riskAcceptable: false,
          notExpired: false,
          notRevoked: false,
          recentlyVerified: false
        }
      };
    }
  }

  /**
   * Register a new trusted device
   */
  public async registerTrustedDevice(
    request: DeviceVerificationRequest
  ): Promise<TrustedDevice> {
    const { userId, deviceFingerprint, location, verificationMethod } = request;

    // Check device limit
    const userDevices = this.trustedDevices.get(userId) || [];
    if (userDevices.length >= this.config.maxDevicesPerUser) {
      // Remove oldest inactive device
      const oldestInactive = userDevices
        .filter(d => d.trustStatus !== TrustStatus.TRUSTED)
        .sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime())[0];
      
      if (oldestInactive) {
        await this.revokeDevice(oldestInactive.id, 'Exceeded device limit');
        // Remove from arrays
        const updatedDevices = userDevices.filter(d => d.id !== oldestInactive.id);
        this.trustedDevices.set(userId, updatedDevices);
        this.deviceLookup.delete(oldestInactive.id);
      } else {
        throw new Error('Maximum number of trusted devices reached');
      }
    }

    // Create trusted device record
    const deviceId = this.generateDeviceId();
    const device: TrustedDevice = {
      id: deviceId,
      userId,
      deviceId,
      fingerprintId: deviceFingerprint.id,
      name: this.generateDeviceName(deviceFingerprint),
      type: this.detectDeviceType(deviceFingerprint),
      browser: deviceFingerprint.enhanced?.browser.name || 'Unknown',
      platform: deviceFingerprint.basic.platform,
      
      trustStatus: TrustStatus.PENDING,
      trustLevel: TrustLevel.LIMITED,
      trustScore: 0,
      verificationMethod,
      verifiedAt: new Date(),
      
      createdAt: new Date(),
      lastUsed: new Date(),
      lastVerified: new Date(),
      expiresAt: new Date(Date.now() + this.config.defaultTrustDurationDays * 24 * 60 * 60 * 1000),
      
      primaryLocation: location,
      lastLocation: location,
      riskLevel: RiskLevel.LOW,
      riskFactors: [],
      
      loginCount: 0,
      failedAttempts: 0,
      suspiciousActivities: 0,
      
      settings: {
        requireLocationCheck: this.config.requireLocationCheck,
        allowRoaming: this.config.allowRoaming,
        maxLocationRadius: this.config.maxLocationRadiusKm,
        notifyOnNewLogin: true,
        autoRenew: this.config.enableAutoRenewal,
        requirePeriodicVerification: true,
        verificationIntervalDays: this.config.defaultVerificationIntervalDays
      },
      
      metadata: request.metadata || {}
    };

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    device.verificationToken = verificationToken;
    
    this.verificationTokens.set(verificationToken, {
      userId,
      deviceId,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Store device
    if (!this.trustedDevices.has(userId)) {
      this.trustedDevices.set(userId, []);
    }
    this.trustedDevices.get(userId)!.push(device);
    this.deviceLookup.set(deviceId, device);

    this.emit('deviceRegistered', {
      userId,
      device,
      timestamp: new Date()
    });

    return device;
  }

  /**
   * Verify a pending device
   */
  public async verifyDevice(verificationToken: string): Promise<TrustedDevice> {
    const tokenData = this.verificationTokens.get(verificationToken);
    
    if (!tokenData) {
      throw new Error('Invalid verification token');
    }
    
    if (new Date() > tokenData.expires) {
      this.verificationTokens.delete(verificationToken);
      throw new Error('Verification token expired');
    }

    const device = this.deviceLookup.get(tokenData.deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    // Update device status
    device.trustStatus = TrustStatus.TRUSTED;
    device.trustLevel = TrustLevel.FULL;
    device.trustScore = 100;
    device.verifiedAt = new Date();
    device.lastVerified = new Date();
    device.verificationToken = undefined;

    // Clean up token
    this.verificationTokens.delete(verificationToken);

    this.emit('deviceVerified', {
      userId: device.userId,
      device,
      timestamp: new Date()
    });

    return device;
  }

  /**
   * Revoke device trust
   */
  public async revokeDevice(deviceId: string, reason: string): Promise<void> {
    const device = this.deviceLookup.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    device.trustStatus = TrustStatus.REVOKED;
    device.trustLevel = TrustLevel.NONE;
    device.trustScore = 0;
    device.revokedAt = new Date();

    this.emit('deviceRevoked', {
      userId: device.userId,
      device,
      reason,
      timestamp: new Date()
    });
  }

  /**
   * Get user's trusted devices
   */
  public getUserDevices(userId: string): TrustedDevice[] {
    return this.trustedDevices.get(userId) || [];
  }

  /**
   * Update device settings
   */
  public updateDeviceSettings(
    deviceId: string,
    settings: Partial<TrustedDevice['settings']>
  ): TrustedDevice {
    const device = this.deviceLookup.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    device.settings = { ...device.settings, ...settings };

    this.emit('deviceSettingsUpdated', {
      userId: device.userId,
      device,
      settings,
      timestamp: new Date()
    });

    return device;
  }

  /**
   * Rename a trusted device
   */
  public renameDevice(deviceId: string, newName: string): TrustedDevice {
    const device = this.deviceLookup.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    device.name = newName;

    this.emit('deviceRenamed', {
      userId: device.userId,
      device,
      newName,
      timestamp: new Date()
    });

    return device;
  }

  // Private methods

  private findMatchingDevice(
    devices: TrustedDevice[],
    fingerprint: DeviceFingerprint,
    location?: LocationData
  ): TrustedDevice | null {
    // Find devices with matching fingerprint
    const matches = devices.filter(device => {
      // Basic matching by fingerprint ID
      if (device.fingerprintId === fingerprint.id) {
        return true;
      }

      // Fuzzy matching for similar devices
      const similarity = this.calculateFingerprintSimilarity(device, fingerprint);
      return similarity > 0.85; // 85% similarity threshold
    });

    if (matches.length === 0) {
      return null;
    }

    // If multiple matches, select best one based on location and recent usage
    if (matches.length > 1) {
      return matches.sort((a, b) => {
        // Prefer recently used devices
        const timeDiff = b.lastUsed.getTime() - a.lastUsed.getTime();
        if (Math.abs(timeDiff) > 24 * 60 * 60 * 1000) { // More than 1 day difference
          return timeDiff;
        }

        // Then prefer devices with matching location
        if (location && a.lastLocation && b.lastLocation) {
          const distA = this.calculateDistance(a.lastLocation, location);
          const distB = this.calculateDistance(b.lastLocation, location);
          return distA - distB;
        }

        return 0;
      })[0];
    }

    return matches[0];
  }

  private evaluateTrustFactors(
    device: TrustedDevice,
    fingerprint: DeviceFingerprint,
    location?: LocationData
  ): TrustDecision['factors'] {
    const factors: TrustDecision['factors'] = {
      deviceMatch: device.fingerprintId === fingerprint.id,
      locationMatch: true,
      riskAcceptable: true,
      notExpired: new Date() < device.expiresAt,
      notRevoked: device.trustStatus !== TrustStatus.REVOKED,
      recentlyVerified: this.isRecentlyVerified(device)
    };

    // Check location if required
    if (device.settings.requireLocationCheck && location) {
      factors.locationMatch = this.isLocationTrusted(device, location);
    }

    // Check risk assessment
    if (location) {
      const riskAssessment = this.fingerprintService.assessRisk(fingerprint, location);
      factors.riskAcceptable = riskAssessment.riskScore <= this.config.riskThreshold.partial;
    }

    return factors;
  }

  private makeTrustDecision(
    device: TrustedDevice,
    factors: TrustDecision['factors']
  ): TrustDecision {
    // Calculate overall trust score starting from 100
    let trustScore = 100;
    let trusted = true;
    const reasons: string[] = [];

    if (!factors.notRevoked) {
      trusted = false;
      trustScore = 0;
      reasons.push('Device has been revoked');
    }

    if (!factors.notExpired) {
      trusted = false;
      trustScore = Math.max(trustScore - 50, 0);
      reasons.push('Device trust has expired');
    }

    if (!factors.deviceMatch) {
      trustScore = Math.max(trustScore - 30, 0);
      reasons.push('Device fingerprint mismatch');
    }

    if (!factors.locationMatch) {
      trustScore = Math.max(trustScore - 20, 0);
      reasons.push('Location outside trusted zone');
    }

    if (!factors.riskAcceptable) {
      trusted = false;
      trustScore = Math.max(trustScore - 40, 0);
      reasons.push('Risk level too high');
    }

    if (!factors.recentlyVerified && device.settings.requirePeriodicVerification) {
      trustScore = Math.max(trustScore - 10, 0);
      reasons.push('Periodic verification required');
    }

    // For basic checks, still allow trust if score is reasonable
    if (factors.notRevoked && factors.notExpired && factors.deviceMatch && factors.riskAcceptable) {
      trusted = true;
    }

    // Determine if verification is required
    const requiresVerification = !trusted || trustScore < this.config.riskThreshold.full;

    return {
      trusted: trusted && trustScore >= this.config.riskThreshold.partial,
      device,
      reason: reasons.length > 0 ? reasons.join('; ') : 'Device trusted',
      riskScore: 100 - trustScore,
      requiresVerification,
      verificationMethods: requiresVerification ? this.config.verificationMethods : undefined,
      factors
    };
  }

  private calculateFingerprintSimilarity(
    device: TrustedDevice,
    fingerprint: DeviceFingerprint
  ): number {
    // Simple similarity calculation based on key attributes
    let matchCount = 0;
    let totalChecks = 0;

    // Check browser
    if (device.browser === fingerprint.enhanced?.browser.name) {
      matchCount++;
    }
    totalChecks++;

    // Check platform
    if (device.platform === fingerprint.basic.platform) {
      matchCount++;
    }
    totalChecks++;

    // Additional checks could be added here

    return matchCount / totalChecks;
  }

  private calculateDistance(loc1: LocationData, loc2: LocationData): number {
    // Haversine formula for distance between two points
    const R = 6371; // Earth's radius in km
    const lat1 = loc1.coordinates.latitude * Math.PI / 180;
    const lat2 = loc2.coordinates.latitude * Math.PI / 180;
    const deltaLat = (loc2.coordinates.latitude - loc1.coordinates.latitude) * Math.PI / 180;
    const deltaLon = (loc2.coordinates.longitude - loc1.coordinates.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private isLocationTrusted(
    device: TrustedDevice,
    location: LocationData
  ): boolean {
    if (!device.primaryLocation) {
      return true; // No location restriction
    }

    const distance = this.calculateDistance(device.primaryLocation, location);
    
    if (distance <= device.settings.maxLocationRadius) {
      return true;
    }

    // Check if roaming is allowed
    if (device.settings.allowRoaming) {
      // Additional checks for roaming scenarios
      return true;
    }

    return false;
  }

  private isRecentlyVerified(device: TrustedDevice): boolean {
    const daysSinceVerification = 
      (Date.now() - device.lastVerified.getTime()) / (24 * 60 * 60 * 1000);
    
    return daysSinceVerification <= device.settings.verificationIntervalDays;
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateDeviceName(fingerprint: DeviceFingerprint): string {
    const browser = fingerprint.enhanced?.browser.name || 'Unknown Browser';
    const platform = fingerprint.basic.platform || 'Unknown Platform';
    const date = new Date().toLocaleDateString();
    
    return `${browser} on ${platform} (Added ${date})`;
  }

  private detectDeviceType(fingerprint: DeviceFingerprint): TrustedDevice['type'] {
    const userAgent = fingerprint.basic.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod/.test(userAgent)) {
      return 'mobile';
    }
    if (/ipad|tablet/.test(userAgent)) {
      return 'tablet';
    }
    if (/windows|mac|linux/.test(userAgent)) {
      return 'desktop';
    }
    
    return 'other';
  }

  private startMaintenanceTimer(): void {
    // Run maintenance every hour
    setInterval(() => {
      this.performMaintenance();
    }, 60 * 60 * 1000);
  }

  private performMaintenance(): void {
    const now = new Date();
    
    // Clean up expired verification tokens
    for (const [token, data] of this.verificationTokens) {
      if (now > data.expires) {
        this.verificationTokens.delete(token);
        // Also mark device as expired if it was never verified
        const device = this.deviceLookup.get(data.deviceId);
        if (device && device.trustStatus === TrustStatus.PENDING) {
          device.trustStatus = TrustStatus.EXPIRED;
          device.trustLevel = TrustLevel.NONE;
        }
      }
    }

    // Update device statuses
    for (const [userId, devices] of this.trustedDevices) {
      for (const device of devices) {
        // Check for expired devices
        if (device.trustStatus === TrustStatus.TRUSTED && now > device.expiresAt) {
          device.trustStatus = TrustStatus.EXPIRED;
          device.trustLevel = TrustLevel.NONE;
          
          this.emit('deviceExpired', {
            userId,
            device,
            timestamp: now
          });
        }

        // Check for inactive devices
        const daysSinceLastUse = (now.getTime() - device.lastUsed.getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceLastUse > this.config.autoExpireInactiveDays) {
          device.trustStatus = TrustStatus.EXPIRED;
          device.trustLevel = TrustLevel.NONE;
          
          this.emit('deviceInactive', {
            userId,
            device,
            daysSinceLastUse,
            timestamp: now
          });
        }

        // Auto-renew eligible devices
        if (device.settings.autoRenew && 
            device.trustStatus === TrustStatus.TRUSTED &&
            this.shouldAutoRenew(device)) {
          device.expiresAt = new Date(now.getTime() + this.config.defaultTrustDurationDays * 24 * 60 * 60 * 1000);
          
          this.emit('deviceAutoRenewed', {
            userId,
            device,
            timestamp: now
          });
        }
      }
    }
  }

  private shouldAutoRenew(device: TrustedDevice): boolean {
    const now = new Date();
    const daysUntilExpiry = (device.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    
    // Auto-renew if expiring within 7 days and recently used
    if (daysUntilExpiry <= 7) {
      const daysSinceLastUse = (now.getTime() - device.lastUsed.getTime()) / (24 * 60 * 60 * 1000);
      return daysSinceLastUse <= 7;
    }
    
    return false;
  }
}

// Export default instance
export 
export default TrustedDeviceManager;