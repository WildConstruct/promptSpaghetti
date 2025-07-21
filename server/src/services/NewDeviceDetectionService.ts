// New Device Detection Service
// Integrates device fingerprinting with authentication flow to detect and handle new devices

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { DeviceFingerprintingService } from './DeviceFingerprintingService';
import { VerificationThresholdService } from './VerificationThresholdService';
import { EmailService } from '../auth/services/EmailService';
import { EventEmitter } from 'events';

export interface NewDeviceContext {
  userId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  metadata?: {
    loginTime: Date;
    sessionId?: string;
    authMethod?: string;
  };
}

export interface NewDeviceDetectionResult {
  isNewDevice: boolean;
  deviceId?: string;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresVerification: boolean;
  verificationMethods: string[];
  similarDevices?: Array<{
    fingerprint: string;
    similarity: number;
    lastSeen: Date;
  }>;
  recommendations: string[];
}

export interface NewDevicePolicy {
  enabled: boolean;
  
  // Detection settings
  detection: {
    fingerprintSimilarityThreshold: number; // 0-100, below this is considered "new"
    considerLocationChange: boolean;
    considerUserAgentChange: boolean;
    maxSimilarDevices: number;
  };
  
  // Risk assessment
  riskAssessment: {
    newDeviceBaseRisk: number; // Base risk score for new devices
    trustedUserDiscount: number; // Risk reduction for users with good history
    suspiciousPatternMultiplier: number; // Risk increase for suspicious patterns
    recentBreachMultiplier: number; // Risk increase if recent breach detected
  };
  
  // Verification requirements
  verification: {
    lowRiskMethods: string[]; // e.g., ['email_code']
    mediumRiskMethods: string[]; // e.g., ['email_code', 'sms_code']
    highRiskMethods: string[]; // e.g., ['email_code', 'sms_code', 'totp']
    criticalRiskMethods: string[]; // e.g., ['email_code', 'totp', 'security_questions']
    
    gracePeriodHours: number; // Hours before requiring re-verification
    maxAttempts: number;
    lockoutDurationMinutes: number;
  };
  
  // Notification settings
  notifications: {
    notifyOnNewDevice: boolean;
    notifyOnSimilarDevice: boolean;
    notifyOnHighRisk: boolean;
    includeDeviceDetails: boolean;
    includeLocationDetails: boolean;
  };
  
  // Auto-approval settings
  autoApproval: {
    enabled: boolean;
    requireLowRisk: boolean;
    requireTrustedNetwork: boolean;
    requireBusinessHours: boolean;
    maxAutoApprovalsPerDay: number;
  };
  
  // Cache settings
  cache: {
    detectionResultTtl: number;
    deviceListTtl: number;
    riskAssessmentTtl: number;
  };
}

export class NewDeviceDetectionService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private deviceService: DeviceFingerprintingService;
  private verificationService?: VerificationThresholdService;
  private emailService?: EmailService;
  private policy: NewDevicePolicy;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    deviceService: DeviceFingerprintingService,
    policy: NewDevicePolicy,
    verificationService?: VerificationThresholdService,
    emailService?: EmailService
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.deviceService = deviceService;
    this.policy = policy;
    this.verificationService = verificationService;
    this.emailService = emailService;
  }

  async detectNewDevice(context: NewDeviceContext): Promise<NewDeviceDetectionResult> {
    try {
      // Check cache first
      const cacheKey = `new_device:${context.userId}:${context.deviceFingerprint}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get user's device history
      const userDevices = await this.getUserDevices(context.userId);
      
      // Check if exact fingerprint exists
      const existingDevice = userDevices.find(d => d.fingerprint === context.deviceFingerprint);
      
      if (existingDevice && !this.isDeviceExpired(existingDevice)) {
        // Known device, but check for suspicious changes
        const suspiciousChanges = await this.detectSuspiciousChanges(context, existingDevice);
        
        if (!suspiciousChanges.suspicious) {
          // Known device, no suspicious activity
          const result: NewDeviceDetectionResult = {
            isNewDevice: false,
            deviceId: existingDevice.id,
            trustScore: existingDevice.trustScore || 50,
            riskLevel: this.calculateRiskLevel(20), // Low risk for known device
            requiresVerification: false,
            verificationMethods: [],
            recommendations: []
          };
          
          await this.cacheResult(cacheKey, result);
          return result;
        }
      }

      // Find similar devices
      const similarDevices = await this.findSimilarDevices(
        context.deviceFingerprint,
        userDevices
      );

      // Calculate risk score
      const riskScore = await this.calculateRiskScore(context, similarDevices);
      const riskLevel = this.calculateRiskLevel(riskScore);

      // Determine verification requirements
      const verificationMethods = this.getVerificationMethods(riskLevel);
      const requiresVerification = verificationMethods.length > 0 && 
        !this.canAutoApprove(context, riskLevel);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        context,
        riskLevel,
        similarDevices
      );

      const result: NewDeviceDetectionResult = {
        isNewDevice: true,
        trustScore: 30, // Low initial trust for new devices
        riskLevel,
        requiresVerification,
        verificationMethods,
        similarDevices: similarDevices.slice(0, this.policy.detection.maxSimilarDevices),
        recommendations
      };

      // Log new device detection
      await this.logNewDeviceDetection(context, result);

      // Send notifications if needed
      if (this.shouldNotify(result)) {
        await this.sendNewDeviceNotification(context, result);
      }

      // Cache result
      await this.cacheResult(cacheKey, result);

      // Emit event
      this.emit('new_device_detected', context, result);

      return result;
    } catch (error) {
      console.error('Error detecting new device:', error);
      throw error;
    }
  }

  private async getUserDevices(userId: string): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          df.id,
          df.fingerprint,
          df.trust_score,
          df.last_seen,
          df.components,
          dua.is_trusted,
          dua.is_primary,
          dua.last_accessed,
          dtp.verification_status
        FROM device_user_associations dua
        JOIN device_fingerprints df ON df.fingerprint = dua.device_fingerprint
        LEFT JOIN device_trust_profiles dtp ON dtp.fingerprint = df.fingerprint
        WHERE dua.user_id = $1
          AND df.is_blocked = false
        ORDER BY dua.last_accessed DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        fingerprint: row.fingerprint,
        trustScore: row.trust_score,
        lastSeen: row.last_seen,
        components: row.components,
        isTrusted: row.is_trusted,
        isPrimary: row.is_primary,
        lastAccessed: row.last_accessed,
        verificationStatus: row.verification_status
      }));
    } catch (error) {
      console.error('Error getting user devices:', error);
      return [];
    }
  }

  private isDeviceExpired(device: any): boolean {
    const gracePeriod = this.policy.verification.gracePeriodHours * 60 * 60 * 1000;
    const lastAccessed = new Date(device.lastAccessed).getTime();
    return Date.now() - lastAccessed > gracePeriod;
  }

  private async detectSuspiciousChanges(
    context: NewDeviceContext,
    existingDevice: any
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // Check location change
    if (this.policy.detection.considerLocationChange && context.location) {
      const lastLocation = existingDevice.components?.location;
      if (lastLocation && (
        lastLocation.country !== context.location.country ||
        lastLocation.city !== context.location.city
      )) {
        reasons.push('significant_location_change');
      }
    }

    // Check user agent change
    if (this.policy.detection.considerUserAgentChange) {
      const lastUserAgent = existingDevice.components?.userAgent;
      if (lastUserAgent && lastUserAgent !== context.userAgent) {
        const similarity = this.calculateUserAgentSimilarity(lastUserAgent, context.userAgent);
        if (similarity < 80) { // Significant change
          reasons.push('user_agent_change');
        }
      }
    }

    // Check for recent security events
    const recentEvents = await this.getRecentSecurityEvents(context.userId);
    if (recentEvents.length > 0) {
      reasons.push('recent_security_events');
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  private async findSimilarDevices(
    fingerprint: string,
    userDevices: any[]
  ): Promise<Array<{ fingerprint: string; similarity: number; lastSeen: Date }>> {
    const similar: Array<{ fingerprint: string; similarity: number; lastSeen: Date }> = [];

    for (const device of userDevices) {
      if (device.fingerprint !== fingerprint) {
        const similarity = await this.deviceService['calculateFingerprintSimilarity'](
          fingerprint,
          device.fingerprint
        );

        if (similarity >= this.policy.detection.fingerprintSimilarityThreshold) {
          similar.push({
            fingerprint: device.fingerprint,
            similarity,
            lastSeen: device.lastSeen
          });
        }
      }
    }

    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  private async calculateRiskScore(
    context: NewDeviceContext,
    similarDevices: any[]
  ): Promise<number> {
    let riskScore = this.policy.riskAssessment.newDeviceBaseRisk;

    // Check user trust level
    const userTrust = await this.getUserTrustLevel(context.userId);
    if (userTrust > 70) {
      riskScore -= this.policy.riskAssessment.trustedUserDiscount;
    }

    // Check for similar devices
    if (similarDevices.length === 0) {
      riskScore += 10; // Completely new device type
    } else if (similarDevices[0].similarity < 70) {
      riskScore += 5; // Somewhat different from known devices
    }

    // Check for suspicious patterns
    const suspiciousPatterns = await this.checkSuspiciousPatterns(context);
    if (suspiciousPatterns.length > 0) {
      riskScore *= this.policy.riskAssessment.suspiciousPatternMultiplier;
    }

    // Check for recent breaches
    const recentBreach = await this.checkRecentBreaches(context.userId);
    if (recentBreach) {
      riskScore *= this.policy.riskAssessment.recentBreachMultiplier;
    }

    // Location-based risk
    if (context.location) {
      const locationRisk = await this.assessLocationRisk(context.userId, context.location);
      riskScore += locationRisk;
    }

    // Time-based risk
    const timeRisk = this.assessTimeRisk(context.metadata?.loginTime);
    riskScore += timeRisk;

    // Normalize score
    return Math.max(0, Math.min(100, Math.round(riskScore)));
  }

  private calculateRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private getVerificationMethods(riskLevel: string): string[] {
    switch (riskLevel) {
    case 'low':
      return this.policy.verification.lowRiskMethods;
    case 'medium':
      return this.policy.verification.mediumRiskMethods;
    case 'high':
      return this.policy.verification.highRiskMethods;
    case 'critical':
      return this.policy.verification.criticalRiskMethods;
    default:
      return [];
    }
  }

  private canAutoApprove(context: NewDeviceContext, riskLevel: string): boolean {
    if (!this.policy.autoApproval.enabled) {
      return false;
    }

    if (this.policy.autoApproval.requireLowRisk && riskLevel !== 'low') {
      return false;
    }

    if (this.policy.autoApproval.requireBusinessHours) {
      const hour = new Date().getHours();
      if (hour < 8 || hour > 18) {
        return false;
      }
    }

    // Check auto-approval count for today
    // Implementation would check database for count

    return true;
  }

  private generateRecommendations(
    context: NewDeviceContext,
    riskLevel: string,
    similarDevices: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Enable multi-factor authentication');
      recommendations.push('Review recent account activity');
      recommendations.push('Update security contact information');
    }

    if (similarDevices.length === 0) {
      recommendations.push('This appears to be your first device of this type');
      recommendations.push('Consider setting this as a trusted device after verification');
    }

    if (context.location && this.isUnusualLocation(context.location)) {
      recommendations.push('Verify this login location is expected');
      recommendations.push('Enable location-based security alerts');
    }

    return recommendations;
  }

  private async getUserTrustLevel(userId: string): Promise<number> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(DISTINCT df.fingerprint) as device_count,
          AVG(df.trust_score) as avg_trust_score,
          MAX(u.created_at) as account_age,
          COUNT(DISTINCT CASE WHEN dse.severity = 'high' THEN dse.id END) as high_severity_events
        FROM users u
        LEFT JOIN device_user_associations dua ON dua.user_id = u.id
        LEFT JOIN device_fingerprints df ON df.fingerprint = dua.device_fingerprint
        LEFT JOIN device_security_events dse ON dse.device_fingerprint = df.fingerprint
        WHERE u.id = $1
        GROUP BY u.id
      `, [userId]);

      if (result.rows.length === 0) return 50;

      const data = result.rows[0];
      let trustLevel = 50;

      // Account age bonus
      const accountAge = Date.now() - new Date(data.account_age).getTime();
      const daysOld = accountAge / (1000 * 60 * 60 * 24);
      if (daysOld > 365) trustLevel += 20;
      else if (daysOld > 90) trustLevel += 10;

      // Device trust average
      if (data.avg_trust_score) {
        trustLevel += (data.avg_trust_score - 50) * 0.5;
      }

      // Penalty for security events
      trustLevel -= data.high_severity_events * 10;

      return Math.max(0, Math.min(100, trustLevel));
    } catch (error) {
      console.error('Error getting user trust level:', error);
      return 50;
    }
  }

  private async checkSuspiciousPatterns(context: NewDeviceContext): Promise<string[]> {
    const patterns: string[] = [];

    // Check for rapid device switching
    const recentDevices = await this.db.query(`
      SELECT COUNT(DISTINCT device_fingerprint) as device_count
      FROM device_user_associations
      WHERE user_id = $1
        AND last_accessed > NOW() - INTERVAL '1 hour'
    `, [context.userId]);

    if (recentDevices.rows[0]?.device_count > 3) {
      patterns.push('rapid_device_switching');
    }

    // Check for unusual access patterns
    const hour = new Date().getHours();
    const userPattern = await this.db.query(`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
      FROM audit_logs
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY count DESC
      LIMIT 5
    `, [context.userId]);

    const commonHours = userPattern.rows.map(r => parseInt(r.hour));
    if (!commonHours.includes(hour)) {
      patterns.push('unusual_access_time');
    }

    return patterns;
  }

  private async checkRecentBreaches(userId: string): Promise<boolean> {
    const result = await this.db.query(`
      SELECT COUNT(*) as breach_count
      FROM security_events
      WHERE user_id = $1
        AND event_type IN ('password_compromised', 'account_breach', 'unauthorized_access')
        AND created_at > NOW() - INTERVAL '30 days'
    `, [userId]);

    return result.rows[0]?.breach_count > 0;
  }

  private async assessLocationRisk(userId: string, location: any): Promise<number> {
    // This would integrate with LocationDetectionService
    // For now, simple implementation
    let risk = 0;

    // Check if new country
    const knownCountries = await this.db.query(`
      SELECT DISTINCT country
      FROM user_location_history
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '90 days'
    `, [userId]);

    const countries = knownCountries.rows.map(r => r.country);
    if (!countries.includes(location.country)) {
      risk += 20;
    }

    return risk;
  }

  private assessTimeRisk(loginTime?: Date): number {
    if (!loginTime) return 0;

    const hour = loginTime.getHours();
    const dayOfWeek = loginTime.getDay();

    // Higher risk for late night access
    if (hour >= 0 && hour <= 6) return 10;

    // Higher risk for weekend access (for business accounts)
    if (dayOfWeek === 0 || dayOfWeek === 6) return 5;

    return 0;
  }

  private calculateUserAgentSimilarity(ua1: string, ua2: string): number {
    // Simple similarity calculation
    const parts1 = ua1.toLowerCase().split(/[\s\/\(\)]+/);
    const parts2 = ua2.toLowerCase().split(/[\s\/\(\)]+/);
    
    const common = parts1.filter(p => parts2.includes(p)).length;
    const total = Math.max(parts1.length, parts2.length);
    
    return (common / total) * 100;
  }

  private isUnusualLocation(location: any): boolean {
    // Simple check - could be enhanced
    return location.country === 'Unknown' || location.city === 'Unknown';
  }

  private async getRecentSecurityEvents(userId: string): Promise<any[]> {
    const result = await this.db.query(`
      SELECT * FROM security_events
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '24 hours'
        AND severity IN ('medium', 'high')
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    return result.rows;
  }

  private shouldNotify(result: NewDeviceDetectionResult): boolean {
    if (!this.policy.notifications.notifyOnNewDevice && result.isNewDevice) {
      return false;
    }

    if (!this.policy.notifications.notifyOnHighRisk && 
        (result.riskLevel === 'high' || result.riskLevel === 'critical')) {
      return false;
    }

    return true;
  }

  private async sendNewDeviceNotification(
    context: NewDeviceContext,
    result: NewDeviceDetectionResult
  ): Promise<void> {
    if (!this.emailService) return;

    try {
      // Get user email
      const user = await this.db.query(
        'SELECT email, display_name FROM users WHERE id = $1',
        [context.userId]
      );

      if (user.rows.length === 0) return;

      const { email, display_name } = user.rows[0];

      let subject = 'New Device Login Detected';
      if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
        subject = 'URGENT: Suspicious Device Login Detected';
      }

      let body = `Hello ${display_name || 'User'},\n\n`;
      body += 'We detected a login to your account from a new device:\n\n';

      if (this.policy.notifications.includeDeviceDetails) {
        body += 'Device Details:\n';
        body += `- Browser/App: ${context.userAgent.substring(0, 50)}...\n`;
        body += `- Trust Score: ${result.trustScore}/100\n`;
        body += `- Risk Level: ${result.riskLevel.toUpperCase()}\n`;
      }

      if (this.policy.notifications.includeLocationDetails && context.location) {
        body += '\nLocation:\n';
        body += `- Country: ${context.location.country}\n`;
        body += `- City: ${context.location.city}\n`;
      }

      body += `\nLogin Time: ${context.metadata?.loginTime || new Date()}\n`;

      if (result.requiresVerification) {
        body += '\n⚠️ Additional verification is required for this device.\n';
        body += `Verification methods: ${result.verificationMethods.join(', ')}\n`;
      }

      if (result.recommendations.length > 0) {
        body += '\nSecurity Recommendations:\n';
        result.recommendations.forEach(rec => {
          body += `• ${rec}\n`;
        });
      }

      body += '\nIf this wasn\'t you, please secure your account immediately.\n';

      await this.emailService.sendEmail({
        to: email,
        subject,
        text: body,
        priority: result.riskLevel === 'critical' ? 'high' : 'normal'
      });

      await this.auditService.logEvent({
        userId: context.userId,
        action: 'new_device_notification_sent',
        details: {
          deviceFingerprint: context.deviceFingerprint,
          riskLevel: result.riskLevel,
          notificationType: 'email'
        },
        severity: 'info'
      });
    } catch (error) {
      console.error('Error sending new device notification:', error);
    }
  }

  private async logNewDeviceDetection(
    context: NewDeviceContext,
    result: NewDeviceDetectionResult
  ): Promise<void> {
    try {
      await this.auditService.logEvent({
        userId: context.userId,
        action: 'new_device_detected',
        details: {
          deviceFingerprint: context.deviceFingerprint,
          isNewDevice: result.isNewDevice,
          trustScore: result.trustScore,
          riskLevel: result.riskLevel,
          requiresVerification: result.requiresVerification,
          location: context.location,
          similarDevicesCount: result.similarDevices?.length || 0
        },
        severity: result.riskLevel === 'critical' ? 'error' : 
          result.riskLevel === 'high' ? 'warning' : 'info',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      });
    } catch (error) {
      console.error('Error logging new device detection:', error);
    }
  }

  private async cacheResult(key: string, result: NewDeviceDetectionResult): Promise<void> {
    try {
      await this.redis.setex(
        key,
        this.policy.cache.detectionResultTtl,
        JSON.stringify(result)
      );
    } catch (error) {
      console.error('Error caching detection result:', error);
    }
  }

  async approveDevice(
    userId: string,
    deviceFingerprint: string,
    approvalMethod: string
  ): Promise<boolean> {
    try {
      // Mark device as trusted
      await this.deviceService.markDeviceAsTrusted(deviceFingerprint, userId, userId);

      // Log approval
      await this.auditService.logEvent({
        userId,
        action: 'device_approved',
        details: {
          deviceFingerprint,
          approvalMethod
        },
        severity: 'info'
      });

      // Clear cache
      const cacheKey = `new_device:${userId}:${deviceFingerprint}`;
      await this.redis.del(cacheKey);

      // Emit event
      this.emit('device_approved', { userId, deviceFingerprint, approvalMethod });

      return true;
    } catch (error) {
      console.error('Error approving device:', error);
      return false;
    }
  }

  async rejectDevice(
    userId: string,
    deviceFingerprint: string,
    reason: string
  ): Promise<boolean> {
    try {
      // Block device
      await this.deviceService.blockDevice(deviceFingerprint, reason, userId);

      // Log rejection
      await this.auditService.logEvent({
        userId,
        action: 'device_rejected',
        details: {
          deviceFingerprint,
          reason
        },
        severity: 'warning'
      });

      // Clear cache
      const cacheKey = `new_device:${userId}:${deviceFingerprint}`;
      await this.redis.del(cacheKey);

      // Emit event
      this.emit('device_rejected', { userId, deviceFingerprint, reason });

      return true;
    } catch (error) {
      console.error('Error rejecting device:', error);
      return false;
    }
  }

  async getDeviceVerificationStatus(
    userId: string,
    deviceFingerprint: string
  ): Promise<{
    verified: boolean;
    verificationRequired: boolean;
    verificationMethods?: string[];
    attemptsRemaining?: number;
  }> {
    try {
      // Check if device is already verified
      const device = await this.db.query(`
        SELECT 
          dua.is_trusted,
          dtp.verification_status,
          df.trust_score
        FROM device_user_associations dua
        JOIN device_fingerprints df ON df.fingerprint = dua.device_fingerprint
        LEFT JOIN device_trust_profiles dtp ON dtp.fingerprint = df.fingerprint
        WHERE dua.user_id = $1 AND dua.device_fingerprint = $2
      `, [userId, deviceFingerprint]);

      if (device.rows.length === 0) {
        // New device, needs detection
        const context: NewDeviceContext = {
          userId,
          deviceFingerprint,
          ipAddress: '', // Would be provided in real scenario
          userAgent: '' // Would be provided in real scenario
        };
        
        const detection = await this.detectNewDevice(context);
        
        return {
          verified: false,
          verificationRequired: detection.requiresVerification,
          verificationMethods: detection.verificationMethods,
          attemptsRemaining: this.policy.verification.maxAttempts
        };
      }

      const row = device.rows[0];
      const verified = row.is_trusted || row.verification_status === 'verified';
      
      return {
        verified,
        verificationRequired: !verified && row.trust_score < this.policy.detection.fingerprintSimilarityThreshold
      };
    } catch (error) {
      console.error('Error getting device verification status:', error);
      return {
        verified: false,
        verificationRequired: true
      };
    }
  }

  async getRecentNewDevices(
    userId: string,
    days = 30
  ): Promise<Array<{
    fingerprint: string;
    detectedAt: Date;
    approved: boolean;
    riskLevel: string;
    location?: any;
  }>> {
    try {
      const result = await this.db.query(`
        SELECT 
          al.created_at as detected_at,
          al.details->>'deviceFingerprint' as fingerprint,
          al.details->>'riskLevel' as risk_level,
          al.details->'location' as location,
          dua.is_trusted as approved
        FROM audit_logs al
        LEFT JOIN device_user_associations dua ON 
          dua.user_id = al.user_id AND 
          dua.device_fingerprint = al.details->>'deviceFingerprint'
        WHERE al.user_id = $1
          AND al.action = 'new_device_detected'
          AND al.created_at > NOW() - INTERVAL '%s days'
        ORDER BY al.created_at DESC
      `, [userId, days]);

      return result.rows.map(row => ({
        fingerprint: row.fingerprint,
        detectedAt: row.detected_at,
        approved: row.approved || false,
        riskLevel: row.risk_level,
        location: row.location
      }));
    } catch (error) {
      console.error('Error getting recent new devices:', error);
      return [];
    }
  }
}