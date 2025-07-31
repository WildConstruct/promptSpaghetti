/**
 * Breach Detection Service - Epic 19 Implementation
 * Advanced security monitoring system for detecting unauthorized access attempts and security breaches
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

}
}
export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  sourceIP: string;
  userAgent: string;
  metadata: Record<string, any>;
  riskScore: number;
  actionTaken?: SecurityAction;
}
}
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure', 
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILURE = 'mfa_failure',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_LOCATION = 'suspicious_location',
  DEVICE_CHANGE = 'device_change',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  BRUTE_FORCE_DETECTED = 'brute_force_detected',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  ACCOUNT_TAKEOVER = 'account_takeover',
  DATA_BREACH_INDICATOR = 'data_breach_indicator'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SecurityAction {
  NONE = 'none',
  LOG_ONLY = 'log_only',
  NOTIFY_USER = 'notify_user',
  REQUIRE_MFA = 'require_mfa',
  LOCK_ACCOUNT = 'lock_account',
  BLOCK_IP = 'block_ip',
  FORCE_PASSWORD_RESET = 'force_password_reset'
}

}
}
interface RiskProfile {
  userId: string;
  baselineScore: number;
  recentEvents: SecurityEvent[];
  knownDevices: DeviceFingerprint[];
  trustedLocations: GeolocationData[];
  riskFactors: RiskFactor[];
  lastAssessment: Date;
}
}
}

}
}
interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  hash: string;
  trusted: boolean;
  firstSeen: Date;
  lastSeen: Date;
}
}
}

}
}
interface GeolocationData {
  ip: string;
  country: string;
  region: string;
  city: string;
}
}
  coordinates?: { lat: number; lng: number };
  isp: string;
  isVPN: boolean;
  isProxy: boolean;
  trusted: boolean;
}

}
}
interface RiskFactor {
  type: string;
  value: number;
  description: string;
  weight: number;
}
}
}

}
}
interface BreachPattern {
  name: string;
  description: string;
  indicators: SecurityEventType[];
  timeWindow: number; // minutes
  threshold: number;
  riskScore: number;
  action: SecurityAction;
}
}
}

export class BreachDetectionService extends EventEmitter {
  private riskProfiles: Map<string, RiskProfile> = new Map();
  private ipBlacklist: Set<string> = new Set();
  private breachPatterns: BreachPattern[] = [];
  private securityEvents: SecurityEvent[] = [];

  constructor() {
    super();
    this.initializeBreachPatterns();
    this.startBackgroundTasks();
  }

  private initializeBreachPatterns() {
    this.breachPatterns = [
      {
        name: 'Brute Force Attack',
        description: 'Multiple failed login attempts from same IP',
        indicators: [SecurityEventType.LOGIN_FAILURE],
        timeWindow: 15,
        threshold: 5,
        riskScore: 80,
        action: SecurityAction.BLOCK_IP
  }
      {
        name: 'Credential Stuffing',
        description: 'Failed logins across multiple accounts from same source',
        indicators: [SecurityEventType.LOGIN_FAILURE],
        timeWindow: 60,
        threshold: 20,
        riskScore: 90,
        action: SecurityAction.BLOCK_IP
  }
      {
        name: 'Account Takeover Pattern',
        description: 'Successful login followed by suspicious changes',
        indicators: [
          SecurityEventType.LOGIN_SUCCESS,
          SecurityEventType.PASSWORD_RESET,
          SecurityEventType.DEVICE_CHANGE
        ],
        timeWindow: 30,
        threshold: 1,
        riskScore: 95,
        action: SecurityAction.LOCK_ACCOUNT
  }
      {
        name: 'Location Anomaly',
        description: 'Login from geographically impossible location',
        indicators: [SecurityEventType.SUSPICIOUS_LOCATION],
        timeWindow: 5,
        threshold: 1,
        riskScore: 70,
        action: SecurityAction.REQUIRE_MFA
  }
      {
        name: 'MFA Bypass Attempt',
        description: 'Multiple MFA failures followed by different method',
        indicators: [SecurityEventType.MFA_FAILURE],
        timeWindow: 10,
        threshold: 3,
        riskScore: 85,
        action: SecurityAction.LOCK_ACCOUNT
      }
    ];
  }

  private startBackgroundTasks() {
    // Clean up old events every hour
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60 * 60 * 1000);

    // Update risk profiles every 5 minutes  
    setInterval(() => {
      this.updateRiskProfiles();
    }, 5 * 60 * 1000);

    // Check for breach patterns every minute
    setInterval(() => {
      this.detectBreachPatterns();
    }, 60 * 1000);
  }

  async recordSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp' | 'riskScore'>): Promise<SecurityEvent> {

    const event: SecurityEvent = {
      ...eventData,
      id: this.generateEventId(),
      timestamp: new Date(),
      riskScore: await this.calculateRiskScore(eventData)
    };

    this.securityEvents.push(event);
    
    // Update user's risk profile
    await this.updateUserRiskProfile(event.userId, event);
    
    // Check for immediate threats
    const threatLevel = await this.assessThreatLevel(event);
    if (threatLevel >= 80) {
      await this.handleHighRiskEvent(event);
    }

    // Emit event for real-time monitoring
    this.emit('securityEvent', event);
    
    return event;
  }

  private async calculateRiskScore(eventData: Partial<SecurityEvent>): Promise<number> {

    let score = 0;

    // Base scores by event type
    const baseScores: Record<SecurityEventType, number> = {
      [SecurityEventType.LOGIN_SUCCESS]: 10,
      [SecurityEventType.LOGIN_FAILURE]: 30,
      [SecurityEventType.MFA_SUCCESS]: 5,
      [SecurityEventType.MFA_FAILURE]: 40,
      [SecurityEventType.PASSWORD_RESET]: 25,
      [SecurityEventType.ACCOUNT_LOCKED]: 60,
      [SecurityEventType.SUSPICIOUS_LOCATION]: 70,
      [SecurityEventType.DEVICE_CHANGE]: 50,
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: 45,
      [SecurityEventType.BRUTE_FORCE_DETECTED]: 85,
      [SecurityEventType.CREDENTIAL_STUFFING]: 90,
      [SecurityEventType.ACCOUNT_TAKEOVER]: 95,
      [SecurityEventType.DATA_BREACH_INDICATOR]: 100
    };

    score += baseScores[eventData.eventType!] || 0;

    // Check IP reputation
    if (this.ipBlacklist.has(eventData.sourceIP!)) {
      score += 50;
    }

    // Check for VPN/Proxy
    const geoData = await this.getGeolocationData(eventData.sourceIP!);
    if (geoData.isVPN || geoData.isProxy) {
      score += 30;
    }

    // Check device fingerprint
    const deviceRisk = await this.assessDeviceRisk(eventData.userId!, eventData.userAgent!);
    score += deviceRisk;

    // Check recent activity patterns
    const recentEvents = this.getRecentEvents(eventData.userId!, 60); // Last hour
    const failureRate = recentEvents.filter(e => 
      e.eventType === SecurityEventType.LOGIN_FAILURE || 
      e.eventType === SecurityEventType.MFA_FAILURE
    ).length;
    
    score += Math.min(failureRate * 10, 50);

    return Math.min(score, 100);
  }

  private async assessThreatLevel(event: SecurityEvent): Promise<number> {

    const recentEvents = this.getRecentEvents(event.userId, 30);
    
    // Check for patterns in recent events
    let threatLevel = event.riskScore;
    
    // Escalate if multiple high-risk events in short timeframe
    const highRiskEvents = recentEvents.filter(e => e.riskScore >= 70);
    if (highRiskEvents.length >= 3) {
      threatLevel += 30;
    }

    // Check for known attack patterns
    for (const pattern of this.breachPatterns) {
      if (this.matchesPattern(recentEvents, pattern)) {
        threatLevel = Math.max(threatLevel, pattern.riskScore);
      }
    }

    return Math.min(threatLevel, 100);
  }

  private matchesPattern(events: SecurityEvent[], pattern: BreachPattern): boolean {
    const windowStart = new Date(Date.now() - pattern.timeWindow * 60 * 1000);
    const relevantEvents = events.filter(e => 
      e.timestamp >= windowStart && 
      pattern.indicators.includes(e.eventType)
    );

    return relevantEvents.length >= pattern.threshold;
  }

  private async handleHighRiskEvent(event: SecurityEvent): Promise<void> {

    // Determine appropriate response based on risk score and event type
    let action = SecurityAction.LOG_ONLY;

    if (event.riskScore >= 95) {
      action = SecurityAction.LOCK_ACCOUNT;
    } else if (event.riskScore >= 85) {
      action = SecurityAction.REQUIRE_MFA;
    } else if (event.riskScore >= 70) {
      action = SecurityAction.NOTIFY_USER;
    }

    // Execute security action
    await this.executeSecurityAction(event.userId, action, event);

    // Update event with action taken
    event.actionTaken = action;

    // Emit high-risk event for immediate attention
    this.emit('highRiskEvent', event);
  }

  private async executeSecurityAction(userId: string, action: SecurityAction, event: SecurityEvent): Promise<void> {

    switch (action) {
    case SecurityAction.LOCK_ACCOUNT:
      await this.lockUserAccount(userId, event.id);
      break;
        
    case SecurityAction.BLOCK_IP:
      this.ipBlacklist.add(event.sourceIP);
      break;
        
    case SecurityAction.REQUIRE_MFA:
      await this.requireAdditionalMFA(userId);
      break;
        
    case SecurityAction.NOTIFY_USER:
      await this.notifyUserOfSuspiciousActivity(userId, event);
      break;
        
    case SecurityAction.FORCE_PASSWORD_RESET:
      await this.forcePasswordReset(userId);
      break;
    }
  }

  private async lockUserAccount(userId: string, eventId: string): Promise<void> {

    // Implementation would interact with user management system
    console.log(`🔒 SECURITY: Locking account ${userId} due to high-risk event ${eventId}`);
    
    // Record the lock event
    await this.recordSecurityEvent({
      userId,
      eventType: SecurityEventType.ACCOUNT_LOCKED,
      severity: SecuritySeverity.HIGH,
      sourceIP: '127.0.0.1', // System action
      userAgent: 'BreachDetectionService',
      metadata: { reason: 'automated_lock', triggerEvent: eventId }
    });
  }

  private async requireAdditionalMFA(userId: string): Promise<void> {

    console.log(`🛡️ SECURITY: Requiring additional MFA for user ${userId}`);
    // Implementation would update user session requirements
  }

  private async notifyUserOfSuspiciousActivity(userId: string, event: SecurityEvent): Promise<void> {

    console.log(`📧 SECURITY: Notifying user ${userId} of suspicious activity`);
    // Implementation would send notification via email/SMS
  }

  private async forcePasswordReset(userId: string): Promise<void> {

    console.log(`🔑 SECURITY: Forcing password reset for user ${userId}`);
    // Implementation would invalidate current password and require reset
  }

  private getRecentEvents(userId: string, minutes: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.securityEvents.filter(e => 
      e.userId === userId && e.timestamp >= cutoff
    );
  }

  private async getGeolocationData(ip: string): Promise<GeolocationData> {

    // Mock implementation - would integrate with real geolocation service
    return {
      ip,
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      isp: 'Example ISP',
      isVPN: false,
      isProxy: false,
      trusted: true
    };
  }

  private async assessDeviceRisk(userId: string, userAgent: string): Promise<number> {

    const profile = this.riskProfiles.get(userId);
    if (!profile) return 20; // Unknown user, medium risk

    const deviceHash = this.hashUserAgent(userAgent);
    const knownDevice = profile.knownDevices.find(d => d.hash === deviceHash);
    
    if (!knownDevice) {
      return 40; // New device, higher risk
    }
    
    return knownDevice.trusted ? 0 : 20;
  }

  private hashUserAgent(userAgent: string): string {
    return crypto.createHash('sha256').update(userAgent).digest('hex');
  }

  private async updateUserRiskProfile(userId: string, event: SecurityEvent): Promise<void> {

    let profile = this.riskProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        baselineScore: 20,
        recentEvents: [],
        knownDevices: [],
        trustedLocations: [],
        riskFactors: [],
        lastAssessment: new Date()
      };
      this.riskProfiles.set(userId, profile);
    }

    // Add event to recent events (keep last 100)
    profile.recentEvents.push(event);
    if (profile.recentEvents.length > 100) {
      profile.recentEvents.shift();
    }

    // Update device fingerprint
    const deviceHash = this.hashUserAgent(event.userAgent);
    let device = profile.knownDevices.find(d => d.hash === deviceHash);
    
    if (!device) {
      device = {
        id: this.generateEventId(),
        userAgent: event.userAgent,
        screenResolution: 'unknown',
        timezone: 'unknown',
        language: 'unknown',
        platform: 'unknown',
        plugins: [],
        hash: deviceHash,
        trusted: false,
        firstSeen: new Date(),
        lastSeen: new Date()
      };
      profile.knownDevices.push(device);
    } else {
      device.lastSeen = new Date();
    }

    profile.lastAssessment = new Date();
  }

  private detectBreachPatterns(): void {
    for (const pattern of this.breachPatterns) {
      const recentEvents = this.securityEvents.filter(e => {
        const windowStart = new Date(Date.now() - pattern.timeWindow * 60 * 1000);
        return e.timestamp >= windowStart && pattern.indicators.includes(e.eventType);
      });

      if (recentEvents.length >= pattern.threshold) {
        this.emit('breachPatternDetected', {
          pattern,
          events: recentEvents,
          severity: SecuritySeverity.HIGH
        });
      }
    }
  }

  private updateRiskProfiles(): void {
    for (const [userId, profile] of this.riskProfiles) {
      // Remove events older than 24 hours from recent events
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      profile.recentEvents = profile.recentEvents.filter(e => e.timestamp >= cutoff);
      
      // Update baseline score based on recent activity
      const riskEvents = profile.recentEvents.filter(e => e.riskScore >= 50);
      profile.baselineScore = Math.min(20 + riskEvents.length * 5, 80);
    }
  }

  private cleanupOldEvents(): void {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    this.securityEvents = this.securityEvents.filter(e => e.timestamp >= cutoff);
  }

  private generateEventId(): string {
    return `SEC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  // Public API methods
  async getUserRiskProfile(userId: string): Promise<RiskProfile | null> {

    return this.riskProfiles.get(userId) || null;
  }

  async getSecurityEvents(userId: string, hours: number = 24): Promise<SecurityEvent[]> {

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.securityEvents.filter(e => 
      e.userId === userId && e.timestamp >= cutoff
    );
  }

  async isIPBlacklisted(ip: string): Promise<boolean> {

    return this.ipBlacklist.has(ip);
  }

  async getSecuritySummary(userId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recentThreats: number;
    suspiciousActivity: boolean;
    breachDetected: boolean;
    recommendations: string[];
  }> {

    const profile = this.riskProfiles.get(userId);
    const recentEvents = this.getRecentEvents(userId, 24);
    
    const highRiskEvents = recentEvents.filter(e => e.riskScore >= 70);
    const criticalEvents = recentEvents.filter(e => e.riskScore >= 90);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalEvents.length > 0) riskLevel = 'critical';
    else if (highRiskEvents.length >= 3) riskLevel = 'high';
    else if (highRiskEvents.length >= 1) riskLevel = 'medium';

    const recommendations: string[] = [];
    if (profile && profile.knownDevices.length > 5) {
      recommendations.push('Review and remove unused devices');
    }
    if (highRiskEvents.length > 0) {
      recommendations.push('Enable additional MFA methods');
    }

    return {
      riskLevel,
      recentThreats: highRiskEvents.length,
      suspiciousActivity: highRiskEvents.length > 0,
      breachDetected: criticalEvents.length > 0,
      recommendations
    };
  }
}