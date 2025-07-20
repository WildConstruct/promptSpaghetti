/**
 * IP-based and Account-based Limiting Rules Service - Epic 19 Implementation
 * Advanced limiting with geolocation, device fingerprinting, and behavioral analysis
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

export interface IPLimitingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  ipTargets: {
    specificIPs?: string[];
    ipRanges?: Array<{ start: string; end: string; cidr?: string }>;
    countries?: string[];
    regions?: string[];
    asns?: number[]; // Autonomous System Numbers
    isps?: string[];
    vpnDetection?: boolean;
    proxyDetection?: boolean;
    torDetection?: boolean;
    hostingProviders?: boolean;
  };
  
  accountTargets: {
    userIds?: string[];
    userRoles?: string[];
    accountAges?: { min?: number; max?: number }; // days
    verificationLevels?: ('unverified' | 'email' | 'phone' | 'identity')[];
    riskScores?: { min?: number; max?: number }; // 0-100
    previousViolations?: number;
    deviceCount?: { min?: number; max?: number };
  };
  
  behaviorTriggers: {
    rapidRequests?: { requests: number; timeWindow: number }; // requests per seconds
    suspiciousPatterns?: string[]; // regex patterns
    locationChanges?: { distance: number; timeWindow: number }; // km in minutes
    deviceChanges?: { count: number; timeWindow: number }; // devices in hours
    failedLogins?: { attempts: number; timeWindow: number }; // attempts in minutes
    passwordChanges?: { count: number; timeWindow: number }; // changes in hours
    dataAccess?: { volume: number; timeWindow: number }; // MB in minutes
  };
  
  restrictions: {
    blockCompletely?: boolean;
    requireAdditionalAuth?: ('captcha' | 'mfa' | 'email_verification' | 'manual_review')[];
    limitConcurrentSessions?: number;
    limitRequestRate?: { requests: number; windowMs: number };
    allowedEndpoints?: string[];
    blockedEndpoints?: string[];
    allowedHours?: Array<{ start: string; end: string; timezone: string }>;
    maxUploadSize?: number; // bytes
    maxDownloadSize?: number; // bytes
  };
  
  actions: {
    immediate: Array<'block' | 'quarantine' | 'monitor' | 'flag' | 'captcha' | 'mfa'>;
    escalation?: Array<{
      threshold: number; // number of violations
      action: 'temp_ban' | 'perm_ban' | 'manual_review' | 'notify_admin';
      duration?: number; // milliseconds for temp bans
    }>;
    notifications?: Array<{
      trigger: 'first_violation' | 'repeat_violation' | 'escalation';
      recipients: ('user' | 'admin' | 'security_team')[];
      methods: ('email' | 'sms' | 'webhook' | 'dashboard')[];
    }>;
  };
  
  exemptions?: {
    trustedIPs?: string[];
    whitelistUsers?: string[];
    emergencyOverride?: boolean;
    businessHours?: boolean;
    maintenanceMode?: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface GeolocationData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  asn: number;
  asnOrg: string;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isHosting: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

export interface DeviceFingerprint {
  id: string;
  userId: string;
  fingerprint: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  trusted: boolean;
  firstSeen: Date;
  lastSeen: Date;
  violationCount: number;
}

export interface UserBehaviorProfile {
  userId: string;
  accountCreated: Date;
  verificationLevel: 'unverified' | 'email' | 'phone' | 'identity';
  riskScore: number; // 0-100
  
  loginPatterns: {
    commonHours: number[]; // 0-23
    commonDays: number[]; // 0-6
    commonLocations: Array<{ country: string; region: string; frequency: number }>;
    averageSessionDuration: number; // minutes
    deviceRotation: number; // devices per month
  };
  
  accessPatterns: {
    commonEndpoints: Array<{ endpoint: string; frequency: number }>;
    dataUsage: { upload: number; download: number }; // bytes per day average
    requestRate: number; // requests per minute average
    errorRate: number; // percentage
  };
  
  securityEvents: {
    totalViolations: number;
    recentViolations: number; // last 30 days
    failedLogins: number;
    passwordChanges: number;
    mfaChanges: number;
    accountLocks: number;
    lastSecurityEvent?: Date;
  };
  
  lastUpdated: Date;
}

export interface LimitingViolation {
  id: string;
  userId?: string;
  ip: string;
  ruleId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: {
    triggerData: Record<string, any>;
    userAgent: string;
    endpoint: string;
    method: string;
    geolocation?: GeolocationData;
    deviceFingerprint?: string;
    sessionId?: string;
  };
  actionTaken: string[];
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export class IPAccountLimitingService extends EventEmitter {
  private rules: Map<string, IPLimitingRule> = new Map();
  private geolocationCache: Map<string, GeolocationData> = new Map();
  private deviceFingerprints: Map<string, DeviceFingerprint> = new Map();
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private violations: Map<string, LimitingViolation[]> = new Map();
  private trustedIPs: Set<string> = new Set();
  private bannedIPs: Map<string, { reason: string; expiresAt?: Date }> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
    this.startMaintenanceTasks();
  }

  /**
   * Check if IP and account should be limited
   */
  async checkLimitations(request: {
    ip: string;
    userId?: string;
    userAgent: string;
    endpoint: string;
    method: string;
    sessionId?: string;
    headers: Record<string, string>;
  }): Promise<{
    allowed: boolean;
    restrictions: string[];
    violations: LimitingViolation[];
    requiresAuth: string[];
    message?: string;
    banDuration?: number;
  }> {
    const { ip, userId, userAgent, endpoint, method } = request;
    
    // Check if IP is explicitly banned
    if (this.bannedIPs.has(ip)) {
      const ban = this.bannedIPs.get(ip)!;
      if (!ban.expiresAt || ban.expiresAt > new Date()) {
        return {
          allowed: false,
          restrictions: ['ip_banned'],
          violations: [],
          requiresAuth: [],
          message: `IP banned: ${ban.reason}`,
          banDuration: ban.expiresAt ? ban.expiresAt.getTime() - Date.now() : undefined
        };
      } else {
        this.bannedIPs.delete(ip);
      }
    }

    // Check if IP is trusted
    if (this.trustedIPs.has(ip)) {
      return {
        allowed: true,
        restrictions: [],
        violations: [],
        requiresAuth: []
      };
    }

    // Get geolocation data
    const geoData = await this.getGeolocationData(ip);
    
    // Get device fingerprint if available
    let deviceFingerprint: DeviceFingerprint | undefined;
    if (userId) {
      deviceFingerprint = await this.getOrCreateDeviceFingerprint(userId, userAgent, request.headers);
    }

    // Get user behavior profile
    let userProfile: UserBehaviorProfile | undefined;
    if (userId) {
      userProfile = await this.getUserBehaviorProfile(userId);
    }

    // Get applicable rules
    const applicableRules = await this.getApplicableRules(request, geoData, userProfile);
    
    const violations: LimitingViolation[] = [];
    const restrictions: string[] = [];
    const requiresAuth: string[] = [];
    let allowed = true;

    // Check each rule
    for (const rule of applicableRules) {
      const ruleResult = await this.checkRule(rule, {
        ip,
        userId,
        geoData,
        deviceFingerprint,
        userProfile,
        request
      });

      if (ruleResult.violated) {
        violations.push(...ruleResult.violations);
        restrictions.push(...ruleResult.restrictions);
        requiresAuth.push(...ruleResult.requiresAuth);
        
        if (ruleResult.blocked) {
          allowed = false;
        }
      }
    }

    // Update user behavior profile
    if (userId && userProfile) {
      await this.updateUserBehaviorProfile(userId, request, violations.length > 0);
    }

    // Store violations
    for (const violation of violations) {
      await this.recordViolation(violation);
    }

    return {
      allowed,
      restrictions: [...new Set(restrictions)],
      violations,
      requiresAuth: [...new Set(requiresAuth)],
      message: violations.length > 0 ? this.generateViolationMessage(violations) : undefined
    };
  }

  /**
   * Add IP to trusted list
   */
  async addTrustedIP(ip: string, addedBy: string, reason: string): Promise<void> {
    this.trustedIPs.add(ip);
    
    await this.logSecurityEvent('ip_trusted', ip, addedBy, {
      reason,
      timestamp: new Date()
    });
  }

  /**
   * Ban IP address
   */
  async banIP(
    ip: string, 
    reason: string, 
    bannedBy: string,
    duration?: number
  ): Promise<void> {
    const ban = {
      reason,
      expiresAt: duration ? new Date(Date.now() + duration) : undefined
    };
    
    this.bannedIPs.set(ip, ban);
    
    await this.logSecurityEvent('ip_banned', ip, bannedBy, {
      reason,
      duration,
      expiresAt: ban.expiresAt?.toISOString()
    });
  }

  /**
   * Get user risk assessment
   */
  async getUserRiskAssessment(userId: string): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      factor: string;
      score: number;
      description: string;
    }>;
    recommendations: string[];
  }> {
    const profile = await this.getUserBehaviorProfile(userId);
    const recentViolations = await this.getRecentViolations(userId, 30); // Last 30 days
    
    const factors = [];
    let totalScore = 0;

    // Account age factor
    const accountAge = (Date.now() - profile.accountCreated.getTime()) / (24 * 60 * 60 * 1000);
    const ageScore = Math.max(0, 20 - (accountAge / 30) * 20); // Higher score for newer accounts
    factors.push({
      factor: 'Account Age',
      score: ageScore,
      description: `Account created ${Math.floor(accountAge)} days ago`
    });
    totalScore += ageScore;

    // Verification level factor
    const verificationScores = {
      'unverified': 30,
      'email': 15,
      'phone': 10,
      'identity': 0
    };
    const verificationScore = verificationScores[profile.verificationLevel];
    factors.push({
      factor: 'Verification Level',
      score: verificationScore,
      description: `Verification level: ${profile.verificationLevel}`
    });
    totalScore += verificationScore;

    // Violation history factor
    const violationScore = Math.min(40, profile.securityEvents.recentViolations * 5);
    factors.push({
      factor: 'Recent Violations',
      score: violationScore,
      description: `${profile.securityEvents.recentViolations} violations in last 30 days`
    });
    totalScore += violationScore;

    // Device rotation factor
    const deviceScore = Math.min(20, profile.loginPatterns.deviceRotation * 2);
    factors.push({
      factor: 'Device Usage',
      score: deviceScore,
      description: `${profile.loginPatterns.deviceRotation} devices per month`
    });
    totalScore += deviceScore;

    // Location variance factor
    const locationScore = Math.min(15, profile.loginPatterns.commonLocations.length * 3);
    factors.push({
      factor: 'Location Variance',
      score: locationScore,
      description: `Logins from ${profile.loginPatterns.commonLocations.length} different locations`
    });
    totalScore += locationScore;

    // Normalize score to 0-100
    const riskScore = Math.min(100, totalScore);
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 80) riskLevel = 'critical';
    else if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 40) riskLevel = 'medium';

    const recommendations = this.generateRiskRecommendations(riskScore, factors);

    return { riskScore, riskLevel, factors, recommendations };
  }

  // Private helper methods

  private initializeDefaultRules(): void {
    // High-risk country blocking
    const highRiskCountryRule: IPLimitingRule = {
      id: 'high-risk-countries',
      name: 'High Risk Country Blocking',
      description: 'Block access from high-risk countries',
      enabled: true,
      priority: 100,
      ipTargets: {
        countries: ['CN', 'RU', 'KP', 'IR'], // Example high-risk countries
        vpnDetection: true,
        torDetection: true
      },
      accountTargets: {},
      behaviorTriggers: {},
      restrictions: {
        requireAdditionalAuth: ['captcha', 'mfa']
      },
      actions: {
        immediate: ['flag', 'captcha']
      },
      exemptions: {
        emergencyOverride: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    // Rapid login attempts
    const rapidLoginRule: IPLimitingRule = {
      id: 'rapid-login-attempts',
      name: 'Rapid Login Attempt Detection',
      description: 'Detect and limit rapid login attempts',
      enabled: true,
      priority: 200,
      ipTargets: {},
      accountTargets: {},
      behaviorTriggers: {
        rapidRequests: { requests: 10, timeWindow: 60 }, // 10 requests in 60 seconds
        failedLogins: { attempts: 5, timeWindow: 300 } // 5 failed logins in 5 minutes
      },
      restrictions: {
        blockCompletely: false,
        requireAdditionalAuth: ['captcha', 'mfa']
      },
      actions: {
        immediate: ['monitor', 'captcha'],
        escalation: [
          { threshold: 3, action: 'temp_ban', duration: 15 * 60 * 1000 }, // 15 minutes
          { threshold: 5, action: 'temp_ban', duration: 60 * 60 * 1000 }, // 1 hour
          { threshold: 10, action: 'manual_review' }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    // Suspicious device changes
    const deviceChangeRule: IPLimitingRule = {
      id: 'suspicious-device-changes',
      name: 'Suspicious Device Changes',
      description: 'Monitor unusual device switching patterns',
      enabled: true,
      priority: 150,
      ipTargets: {},
      accountTargets: {
        verificationLevels: ['unverified', 'email']
      },
      behaviorTriggers: {
        deviceChanges: { count: 5, timeWindow: 24 }, // 5 different devices in 24 hours
        locationChanges: { distance: 1000, timeWindow: 60 } // 1000km in 60 minutes
      },
      restrictions: {
        requireAdditionalAuth: ['mfa', 'email_verification']
      },
      actions: {
        immediate: ['flag', 'monitor'],
        notifications: [{
          trigger: 'first_violation',
          recipients: ['user', 'security_team'],
          methods: ['email', 'dashboard']
        }]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.rules.set(highRiskCountryRule.id, highRiskCountryRule);
    this.rules.set(rapidLoginRule.id, rapidLoginRule);
    this.rules.set(deviceChangeRule.id, deviceChangeRule);
  }

  private async getGeolocationData(ip: string): Promise<GeolocationData> {
    // Check cache first
    let geoData = this.geolocationCache.get(ip);
    
    if (!geoData || geoData.lastUpdated < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      // Mock geolocation data - would integrate with real service
      geoData = {
        ip,
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
        isp: 'Example ISP',
        asn: 12345,
        asnOrg: 'Example Organization',
        isVPN: false,
        isProxy: false,
        isTor: false,
        isHosting: false,
        threatLevel: 'low',
        lastUpdated: new Date()
      };
      
      this.geolocationCache.set(ip, geoData);
    }
    
    return geoData;
  }

  private async getOrCreateDeviceFingerprint(
    userId: string, 
    userAgent: string, 
    headers: Record<string, string>
  ): Promise<DeviceFingerprint> {
    const fingerprintData = {
      userAgent,
      acceptLanguage: headers['accept-language'] || '',
      acceptEncoding: headers['accept-encoding'] || '',
      // Additional fingerprinting data would be collected client-side
    };
    
    const fingerprintHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex');
    
    let fingerprint = Array.from(this.deviceFingerprints.values())
      .find(fp => fp.userId === userId && fp.fingerprint === fingerprintHash);
    
    if (!fingerprint) {
      fingerprint = {
        id: this.generateFingerprintId(),
        userId,
        fingerprint: fingerprintHash,
        userAgent,
        screenResolution: 'unknown',
        timezone: 'unknown',
        language: headers['accept-language']?.split(',')[0] || 'unknown',
        platform: 'unknown',
        plugins: [],
        canvasFingerprint: 'unknown',
        webglFingerprint: 'unknown',
        audioFingerprint: 'unknown',
        trusted: false,
        firstSeen: new Date(),
        lastSeen: new Date(),
        violationCount: 0
      };
      
      this.deviceFingerprints.set(fingerprint.id, fingerprint);
    } else {
      fingerprint.lastSeen = new Date();
    }
    
    return fingerprint;
  }

  private async getUserBehaviorProfile(userId: string): Promise<UserBehaviorProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        accountCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        verificationLevel: 'email',
        riskScore: 25,
        loginPatterns: {
          commonHours: [9, 10, 11, 14, 15, 16],
          commonDays: [1, 2, 3, 4, 5],
          commonLocations: [{ country: 'US', region: 'CA', frequency: 0.8 }],
          averageSessionDuration: 45,
          deviceRotation: 2
        },
        accessPatterns: {
          commonEndpoints: [
            { endpoint: '/api/dashboard', frequency: 0.4 },
            { endpoint: '/api/profile', frequency: 0.2 }
          ],
          dataUsage: { upload: 1024 * 1024, download: 5 * 1024 * 1024 },
          requestRate: 2.5,
          errorRate: 0.05
        },
        securityEvents: {
          totalViolations: 0,
          recentViolations: 0,
          failedLogins: 0,
          passwordChanges: 0,
          mfaChanges: 0,
          accountLocks: 0
        },
        lastUpdated: new Date()
      };
      
      this.userProfiles.set(userId, profile);
    }
    
    return profile;
  }

  private async getApplicableRules(
    request: any,
    geoData: GeolocationData,
    userProfile?: UserBehaviorProfile
  ): Promise<IPLimitingRule[]> {
    const rules = [];
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      if (await this.ruleApplies(rule, request, geoData, userProfile)) {
        rules.push(rule);
      }
    }
    
    return rules.sort((a, b) => b.priority - a.priority);
  }

  private async ruleApplies(
    rule: IPLimitingRule,
    request: any,
    geoData: GeolocationData,
    userProfile?: UserBehaviorProfile
  ): Promise<boolean> {
    // Check IP targeting
    if (rule.ipTargets.countries?.includes(geoData.countryCode)) return true;
    if (rule.ipTargets.vpnDetection && geoData.isVPN) return true;
    if (rule.ipTargets.torDetection && geoData.isTor) return true;
    if (rule.ipTargets.proxyDetection && geoData.isProxy) return true;
    
    // Check account targeting
    if (userProfile && rule.accountTargets.verificationLevels?.includes(userProfile.verificationLevel)) {
      return true;
    }
    
    // Additional rule matching logic would be implemented here
    
    return false;
  }

  private async checkRule(
    rule: IPLimitingRule,
    context: {
      ip: string;
      userId?: string;
      geoData: GeolocationData;
      deviceFingerprint?: DeviceFingerprint;
      userProfile?: UserBehaviorProfile;
      request: any;
    }
  ): Promise<{
    violated: boolean;
    blocked: boolean;
    violations: LimitingViolation[];
    restrictions: string[];
    requiresAuth: string[];
  }> {
    const violations: LimitingViolation[] = [];
    const restrictions: string[] = [];
    const requiresAuth: string[] = [];
    let violated = false;
    let blocked = false;

    // Check behavior triggers
    if (rule.behaviorTriggers.rapidRequests) {
      const recentRequests = await this.getRecentRequests(context.ip, rule.behaviorTriggers.rapidRequests.timeWindow);
      if (recentRequests >= rule.behaviorTriggers.rapidRequests.requests) {
        violated = true;
        violations.push(this.createViolation(rule, context, 'rapid_requests', {
          requestCount: recentRequests,
          threshold: rule.behaviorTriggers.rapidRequests.requests
        }));
      }
    }

    // Apply restrictions if violated
    if (violated) {
      if (rule.restrictions.blockCompletely) {
        blocked = true;
        restrictions.push('blocked');
      }
      
      if (rule.restrictions.requireAdditionalAuth) {
        requiresAuth.push(...rule.restrictions.requireAdditionalAuth);
      }
    }

    return { violated, blocked, violations, restrictions, requiresAuth };
  }

  private createViolation(
    rule: IPLimitingRule,
    context: any,
    violationType: string,
    triggerData: Record<string, any>
  ): LimitingViolation {
    return {
      id: this.generateViolationId(),
      userId: context.userId,
      ip: context.ip,
      ruleId: rule.id,
      violationType,
      severity: this.calculateViolationSeverity(rule, violationType),
      timestamp: new Date(),
      details: {
        triggerData,
        userAgent: context.request.userAgent,
        endpoint: context.request.endpoint,
        method: context.request.method,
        geolocation: context.geoData,
        deviceFingerprint: context.deviceFingerprint?.fingerprint,
        sessionId: context.request.sessionId
      },
      actionTaken: rule.actions.immediate,
      resolved: false
    };
  }

  private calculateViolationSeverity(rule: IPLimitingRule, violationType: string): 'low' | 'medium' | 'high' | 'critical' {
    // Logic to determine severity based on rule priority and violation type
    if (rule.priority >= 200) return 'critical';
    if (rule.priority >= 150) return 'high';
    if (rule.priority >= 100) return 'medium';
    return 'low';
  }

  private generateViolationMessage(violations: LimitingViolation[]): string {
    const severityCount = violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (severityCount.critical) {
      return 'Critical security violations detected. Access restricted.';
    } else if (severityCount.high) {
      return 'High-risk activity detected. Additional verification required.';
    } else if (severityCount.medium) {
      return 'Suspicious activity detected. Please verify your identity.';
    } else {
      return 'Security check required. Please complete verification.';
    }
  }

  private generateRiskRecommendations(riskScore: number, factors: any[]): string[] {
    const recommendations = [];
    
    if (riskScore >= 60) {
      recommendations.push('Enable multi-factor authentication immediately');
      recommendations.push('Review and update password');
      recommendations.push('Check recent account activity');
    }
    
    if (riskScore >= 40) {
      recommendations.push('Verify email and phone number');
      recommendations.push('Review trusted devices');
    }
    
    if (riskScore >= 20) {
      recommendations.push('Enable login notifications');
      recommendations.push('Use trusted networks when possible');
    }
    
    return recommendations;
  }

  private async getRecentRequests(ip: string, timeWindowSeconds: number): Promise<number> {
    // Mock implementation - would count actual recent requests
    return Math.floor(Math.random() * 20);
  }

  private async getRecentViolations(userId: string, days: number): Promise<LimitingViolation[]> {
    const userViolations = this.violations.get(userId) || [];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return userViolations.filter(v => v.timestamp >= cutoff);
  }

  private async recordViolation(violation: LimitingViolation): Promise<void> {
    const key = violation.userId || violation.ip;
    const violations = this.violations.get(key) || [];
    violations.push(violation);
    this.violations.set(key, violations);
  }

  private async updateUserBehaviorProfile(
    userId: string,
    request: any,
    hasViolations: boolean
  ): Promise<void> {
    const profile = await this.getUserBehaviorProfile(userId);
    
    if (hasViolations) {
      profile.securityEvents.recentViolations++;
      profile.securityEvents.totalViolations++;
      profile.securityEvents.lastSecurityEvent = new Date();
    }
    
    profile.lastUpdated = new Date();
    this.userProfiles.set(userId, profile);
  }

  private startMaintenanceTasks(): void {
    // Clean up old data every 6 hours
    setInterval(() => {
      this.cleanupOldData();
    }, 6 * 60 * 60 * 1000);
  }

  private cleanupOldData(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Clean up old violations
    for (const [key, violations] of this.violations.entries()) {
      const recentViolations = violations.filter(v => v.timestamp >= thirtyDaysAgo);
      if (recentViolations.length === 0) {
        this.violations.delete(key);
      } else {
        this.violations.set(key, recentViolations);
      }
    }
    
    // Clean up old geolocation cache
    for (const [ip, geoData] of this.geolocationCache.entries()) {
      if (geoData.lastUpdated < thirtyDaysAgo) {
        this.geolocationCache.delete(ip);
      }
    }
  }

  private generateFingerprintId(): string {
    return `DF-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  private generateViolationId(): string {
    return `LV-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  private async logSecurityEvent(action: string, target: string, performedBy: string, metadata: any): Promise<void> {
    console.log(`Security Event: ${action} for ${target} by ${performedBy}`, metadata);
  }
}