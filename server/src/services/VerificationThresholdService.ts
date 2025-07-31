// Verification Threshold Service
// Determines when additional verification is required based on risk assessment

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

}
}
export interface RiskFactor {
  factor: string;
  weight: number;
  score: number;
  description: string;
  source: 'device' | 'location' | 'behavior' | 'time' | 'security';
}
}
}

}
}
export interface VerificationContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  sessionId?: string;
  requestedAction?: string;
  geoLocation?: {
    country?: string;
    city?: string;
    timezone?: string;
}
}
  };
  timestamp: Date;
}

}
}
export interface VerificationRequirement {
  required: boolean;
  level: 'none' | 'email' | 'sms' | 'totp' | 'hardware_key' | 'admin_approval';
  riskScore: number;
  threshold: number;
  factors: RiskFactor[];
  expires?: Date;
  bypass?: {
    available: boolean;
    reason?: string;
    requiresAdminApproval?: boolean;
}
}
  };
  recommendations: string[];
}

}
}
export interface ThresholdConfig {
  // Risk score thresholds (0-100 scale)
  lowRisk: number;        // 0-30: No additional verification
  mediumRisk: number;     // 31-60: Email or SMS verification
  highRisk: number;       // 61-80: TOTP or hardware key required
  criticalRisk: number;   // 81-100: Admin approval required

  // Factor weights (sum should equal 100)
  weights: {
    deviceTrust: number;      // Known vs unknown device
    locationRisk: number;     // Geographic anomalies
    behaviorAnomalies: number; // Unusual patterns
    timeFactors: number;      // Off-hours access
    securityEvents: number;   // Recent security incidents
}
}
  };

  // Time-based factors
  offHoursMultiplier: number;  // Risk multiplier for off-hours access
  weekendMultiplier: number;   // Risk multiplier for weekend access

  // Decay factors
  trustDecayDays: number;      // Days for device trust to decay
  riskDecayHours: number;      // Hours for risk scores to decay

  // Action-specific thresholds
  actionThresholds: {
    [action: string]: {
      baseThreshold: number;
      riskMultiplier: number;
    };
  };
}

export class VerificationThresholdService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: ThresholdConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config?: Partial<ThresholdConfig>
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = this.buildConfig(config);
  }

  private buildConfig(override?: Partial<ThresholdConfig>): ThresholdConfig {
    const defaultConfig: ThresholdConfig = {
      lowRisk: 30,
      mediumRisk: 60,
      highRisk: 80,
      criticalRisk: 95,
      weights: {
        deviceTrust: 25,
        locationRisk: 20,
        behaviorAnomalies: 25,
        timeFactors: 15,
        securityEvents: 15
  }
      offHoursMultiplier: 1.5,
      weekendMultiplier: 1.2,
      trustDecayDays: 30,
      riskDecayHours: 24,
      actionThresholds: {
        'password_change': { baseThreshold: 40, riskMultiplier: 1.5 },
        'email_change': { baseThreshold: 50, riskMultiplier: 1.8 },
        'add_payment_method': { baseThreshold: 45, riskMultiplier: 1.3 },
        'withdraw_funds': { baseThreshold: 60, riskMultiplier: 2.0 },
        'admin_action': { baseThreshold: 70, riskMultiplier: 1.2 },
        'delete_account': { baseThreshold: 80, riskMultiplier: 1.0 },
        'export_data': { baseThreshold: 35, riskMultiplier: 1.4 },
        'api_key_creation': { baseThreshold: 55, riskMultiplier: 1.6 }
      }
    };

    return { ...defaultConfig, ...override };
  }

  async assessVerificationRequirement(context: VerificationContext): Promise<VerificationRequirement> {

    try {
      // Calculate risk factors
      const factors = await this.calculateRiskFactors(context);
      
      // Calculate total risk score
      const riskScore = this.calculateTotalRiskScore(factors);
      
      // Determine verification threshold
      const threshold = await this.determineThreshold(context, riskScore);
      
      // Determine required verification level
      const level = this.determineVerificationLevel(riskScore, threshold);
      
      // Check for bypass options
      const bypass = await this.checkBypassOptions(context, riskScore);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(factors, riskScore);

      const requirement: VerificationRequirement = {
        required: level !== 'none',
        level,
        riskScore: Math.round(riskScore * 100) / 100,
        threshold,
        factors,
        bypass,
        recommendations
      };

      // Set expiration for time-sensitive requirements
      if (requirement.required && level !== 'admin_approval') {
        requirement.expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      // Log the assessment
      await this.logAssessment(context, requirement);

      return requirement;
    } catch (error) {
      console.error('Error assessing verification requirement:', error);
      
      // Return conservative fallback
      return {
        required: true,
        level: 'totp',
        riskScore: 75,
        threshold: this.config.mediumRisk,
        factors: [{
          factor: 'assessment_error',
          weight: 100,
          score: 75,
          description: 'Risk assessment failed - using conservative approach',
          source: 'security'
        }],
        recommendations: ['Complete TOTP verification due to assessment error']
      };
    }
  }

  private async calculateRiskFactors(context: VerificationContext): Promise<RiskFactor[]> {

    const factors: RiskFactor[] = [];

    // Device Trust Factor
    const deviceTrust = await this.calculateDeviceTrust(context);
    factors.push({
      factor: 'device_trust',
      weight: this.config.weights.deviceTrust,
      score: deviceTrust.score,
      description: deviceTrust.description,
      source: 'device'
    });

    // Location Risk Factor
    const locationRisk = await this.calculateLocationRisk(context);
    factors.push({
      factor: 'location_risk',
      weight: this.config.weights.locationRisk,
      score: locationRisk.score,
      description: locationRisk.description,
      source: 'location'
    });

    // Behavior Anomalies
    const behaviorRisk = await this.calculateBehaviorRisk(context);
    factors.push({
      factor: 'behavior_anomalies',
      weight: this.config.weights.behaviorAnomalies,
      score: behaviorRisk.score,
      description: behaviorRisk.description,
      source: 'behavior'
    });

    // Time-based Factors
    const timeRisk = this.calculateTimeRisk(context);
    factors.push({
      factor: 'time_factors',
      weight: this.config.weights.timeFactors,
      score: timeRisk.score,
      description: timeRisk.description,
      source: 'time'
    });

    // Security Events
    const securityRisk = await this.calculateSecurityRisk(context);
    factors.push({
      factor: 'security_events',
      weight: this.config.weights.securityEvents,
      score: securityRisk.score,
      description: securityRisk.description,
      source: 'security'
    });

    return factors;
  }

  private async calculateDeviceTrust(context: VerificationContext): Promise<{ score: number; description: string }> {

    if (!context.deviceFingerprint) {
      return { score: 60, description: 'No device fingerprint available' };
    }

    // Check if device is known and trusted
    const deviceHistory = await this.db.query(`
      SELECT 
        COUNT(*) as login_count,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen,
        COUNT(*) FILTER (WHERE details->>'success' = 'true') as successful_logins
      FROM audit_logs 
      WHERE user_id = $1 
        AND details->>'deviceFingerprint' = $2
        AND action IN ('login_success', 'login_failed')
        AND created_at >= NOW() - INTERVAL '${this.config.trustDecayDays} days'
    `, [context.userId, context.deviceFingerprint]);

    const device = deviceHistory.rows[0];
    const loginCount = parseInt(device.login_count);
    const successfulLogins = parseInt(device.successful_logins);
    
    if (loginCount === 0) {
      return { score: 80, description: 'Unknown device - first time seen' };
    }

    const successRate = loginCount > 0 ? successfulLogins / loginCount : 0;
    const daysSinceFirstSeen = device.first_seen ? 
      (Date.now() - new Date(device.first_seen).getTime()) / (1000 * 60 * 60 * 24) : 0;

    // Calculate trust score
    let trustScore = 0;
    
    // Success rate factor (0-40 points)
    trustScore += successRate * 40;
    
    // History factor (0-30 points)
    trustScore += Math.min(daysSinceFirstSeen / 30, 1) * 30;
    
    // Usage frequency factor (0-30 points)
    trustScore += Math.min(loginCount / 10, 1) * 30;

    // Convert trust to risk (inverse relationship)
    const riskScore = Math.max(0, 100 - trustScore);

    let description = `Device trust: ${Math.round(trustScore)}%, `;
    description += `${loginCount} logins, ${Math.round(successRate * 100)}% success rate`;

    return { score: riskScore, description };
  }

  private async calculateLocationRisk(context: VerificationContext): Promise<{ score: number; description: string }> {

    if (!context.geoLocation?.country || !context.ipAddress) {
      return { score: 40, description: 'Location information unavailable' };
    }

    // Check historical locations for this user
    const locationHistory = await this.db.query(`
      SELECT 
        details->>'country' as country,
        details->>'city' as city,
        COUNT(*) as access_count,
        MAX(created_at) as last_access
      FROM audit_logs 
      WHERE user_id = $1 
        AND action = 'login_success'
        AND details->>'country' IS NOT NULL
        AND created_at >= NOW() - INTERVAL '90 days'
      GROUP BY details->>'country', details->>'city'
      ORDER BY access_count DESC
    `, [context.userId]);

    const currentCountry = context.geoLocation.country;
    const currentCity = context.geoLocation.city;

    // Check if location is known
    const knownLocation = locationHistory.rows.find(row => 
      row.country === currentCountry && row.city === currentCity
    );

    if (knownLocation) {
      const accessCount = parseInt(knownLocation.access_count);
      const daysSinceLastAccess = knownLocation.last_access ?
        (Date.now() - new Date(knownLocation.last_access).getTime()) / (1000 * 60 * 60 * 24) : 999;

      // Familiar location - lower risk
      const riskScore = Math.max(5, 25 - (accessCount * 2) + (daysSinceLastAccess * 0.5));
      return { 
        score: Math.min(riskScore, 100), 
        description: `Known location (${accessCount} previous visits, last: ${Math.round(daysSinceLastAccess)} days ago)` 
      };
    }

    // Check if country is known (even if city is different)
    const knownCountry = locationHistory.rows.find(row => row.country === currentCountry);
    if (knownCountry) {
      return { 
        score: 45, 
        description: `New city in known country (${currentCountry})` 
      };
    }

    // Completely new country
    return { 
      score: 75, 
      description: `New country: ${currentCountry}` 
    };
  }

  private async calculateBehaviorRisk(context: VerificationContext): Promise<{ score: number; description: string }> {

    // Analyze recent behavior patterns
    const _____recentActivity = await this.db.query(`
      SELECT 
        action,
        COUNT(*) as frequency,
        AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))) as avg_interval
      FROM audit_logs 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY action
      ORDER BY frequency DESC
    `, [context.userId]);

    // Check for unusual patterns
    let behaviorScore = 20; // Base score
    const anomalies: string[] = [];

    // Check for rapid successive actions
    const rapidActions = await this.db.query(`
      SELECT COUNT(*) as rapid_count
      FROM audit_logs 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '10 minutes'
    `, [context.userId]);

    const rapidCount = parseInt(rapidActions.rows[0]?.rapid_count || '0');
    if (rapidCount > 10) {
      behaviorScore += 30;
      anomalies.push(`${rapidCount} actions in last 10 minutes`);
    }

    // Check for off-pattern timing
    const currentHour = context.timestamp.getHours();
    const typicalHours = await this.db.query(`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as frequency
      FROM audit_logs 
      WHERE user_id = $1 
        AND action = 'login_success'
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY frequency DESC
      LIMIT 5
    `, [context.userId]);

    const isTypicalHour = typicalHours.rows.some(row => 
      Math.abs(parseInt(row.hour) - currentHour) <= 1
    );

    if (!isTypicalHour && typicalHours.rows.length > 0) {
      behaviorScore += 20;
      anomalies.push('unusual time of access');
    }

    const description = anomalies.length > 0 ? 
      `Behavioral anomalies: ${anomalies.join(', ')}` : 
      'Normal behavior patterns';

    return { score: Math.min(behaviorScore, 100), description };
  }

  private calculateTimeRisk(context: VerificationContext): { score: number; description: string } {
    const now = context.timestamp;
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    let timeScore = 0;
    const factors: string[] = [];

    // Off-hours risk (10 PM to 6 AM)
    if (hour >= 22 || hour <= 6) {
      timeScore += 25;
      factors.push('off-hours access');
    }

    // Weekend risk
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      timeScore += 15;
      factors.push('weekend access');
    }

    // Very early morning (2 AM to 5 AM)
    if (hour >= 2 && hour <= 5) {
      timeScore += 20;
      factors.push('very early morning');
    }

    const description = factors.length > 0 ? 
      `Time factors: ${factors.join(', ')}` : 
      'Normal access hours';

    return { score: timeScore, description };
  }

  private async calculateSecurityRisk(context: VerificationContext): Promise<{ score: number; description: string }> {

    // Check for recent security events
    const securityEvents = await this.db.query(`
      SELECT 
        action,
        COUNT(*) as event_count,
        MAX(created_at) as last_occurrence
      FROM audit_logs 
      WHERE user_id = $1 
        AND action IN ('login_failed', 'password_reset_requested', 'suspicious_activity', 'account_locked')
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY action
    `, [context.userId]);

    let securityScore = 0;
    const events: string[] = [];

    for (const event of securityEvents.rows) {
      const count = parseInt(event.event_count);
      const hoursAgo = event.last_occurrence ? 
        (Date.now() - new Date(event.last_occurrence).getTime()) / (1000 * 60 * 60) : 999;

      switch (event.action) {
      case 'login_failed':
        if (count > 3) {
          securityScore += Math.min(count * 5, 30);
          events.push(`${count} failed logins`);
        }
        break;
      case 'password_reset_requested':
        securityScore += 25;
        events.push('recent password reset');
        break;
      case 'suspicious_activity':
        securityScore += 40;
        events.push('suspicious activity detected');
        break;
      case 'account_locked':
        if (hoursAgo < 24) {
          securityScore += 50;
          events.push('recent account lockout');
        }
        break;
      }
    }

    const description = events.length > 0 ? 
      `Security events: ${events.join(', ')}` : 
      'No recent security events';

    return { score: Math.min(securityScore, 100), description };
  }

  private calculateTotalRiskScore(factors: RiskFactor[]): number {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = factors.reduce((sum, factor) => 
      sum + (factor.score * factor.weight), 0);

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  private async determineThreshold(context: VerificationContext, baseRiskScore: number): Promise<number> {

    // Get action-specific threshold
    const action = context.requestedAction || 'default';
    const actionConfig = this.config.actionThresholds[action];
    
    if (actionConfig) {
      return actionConfig.baseThreshold;
    }

    // Default threshold based on risk level
    if (baseRiskScore <= this.config.lowRisk) return this.config.lowRisk;
    if (baseRiskScore <= this.config.mediumRisk) return this.config.mediumRisk;
    if (baseRiskScore <= this.config.highRisk) return this.config.highRisk;
    return this.config.criticalRisk;
  }

  private determineVerificationLevel(riskScore: number, _____threshold: number): VerificationRequirement['level'] {
    if (riskScore <= this.config.lowRisk) {
      return 'none';
    } else if (riskScore <= this.config.mediumRisk) {
      return 'email';
    } else if (riskScore <= this.config.highRisk) {
      return 'totp';
    } else {
      return 'admin_approval';
    }
  }

  private async checkBypassOptions(
    context: VerificationContext, 
    riskScore: number
  ): Promise<VerificationRequirement['bypass']> {

    // Check if user has recent successful verification
    const recentVerification = await this.redis.get(`verification_bypass:${context.userId}`);
    if (recentVerification) {
      return {
        available: true,
        reason: 'Recent successful verification within grace period'
      };
    }

    // Admin users might have bypass options for lower risk scenarios
    const userRoles = await this.db.query(`
      SELECT roles FROM users WHERE id = $1
    `, [context.userId]);

    const roles = userRoles.rows[0]?.roles || [];
    if (roles.includes('admin') && riskScore < this.config.highRisk) {
      return {
        available: true,
        reason: 'Admin user with moderate risk score',
        requiresAdminApproval: false
      };
    }

    return { available: false };
  }

  private generateRecommendations(factors: RiskFactor[], riskScore: number): string[] {
    const recommendations: string[] = [];

    // Analyze each factor for specific recommendations
    factors.forEach(factor => {
      if (factor.score > 60) {
        switch (factor.factor) {
        case 'device_trust':
          recommendations.push('Consider adding this device to trusted devices after verification');
          break;
        case 'location_risk':
          recommendations.push('Verify this login location is legitimate');
          break;
        case 'behavior_anomalies':
          recommendations.push('Review recent account activity for suspicious behavior');
          break;
        case 'time_factors':
          recommendations.push('Off-hours access detected - verify this is expected');
          break;
        case 'security_events':
          recommendations.push('Recent security events require additional verification');
          break;
        }
      }
    });

    // Overall recommendations based on total risk
    if (riskScore > 80) {
      recommendations.push('High risk detected - consider temporary account restrictions');
    } else if (riskScore > 60) {
      recommendations.push('Moderate risk - monitor subsequent activities closely');
    }

    return recommendations.length > 0 ? recommendations : ['No specific recommendations'];
  }

  private async logAssessment(context: VerificationContext, requirement: VerificationRequirement): Promise<void> {

    await this.auditService.logEvent({
      userId: context.userId,
      action: 'verification_threshold_assessment',
      details: {
        riskScore: requirement.riskScore,
        threshold: requirement.threshold,
        verificationRequired: requirement.required,
        verificationLevel: requirement.level,
        requestedAction: context.requestedAction,
        factors: requirement.factors.map(f => ({
          factor: f.factor,
          score: f.score,
          weight: f.weight
        }))
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      severity: requirement.level === 'admin_approval' ? 'warning' : 'info'
    });
  }

  async recordVerificationCompletion(
    userId: string, 
    level: string, 
    success: boolean,
    method?: string
  ): Promise<void> {

    if (success) {
      // Set grace period for bypass (5 minutes for email, 30 minutes for TOTP)
      const gracePeriod = level === 'email' ? 300 : 1800;
      await this.redis.setex(`verification_bypass:${userId}`, gracePeriod, JSON.stringify({
        level,
        method,
        completedAt: new Date().toISOString()
      }));
    }

    await this.auditService.logEvent({
      userId,
      action: 'additional_verification_completed',
      details: {
        level,
        method,
        success,
        gracePeriodSeconds: success ? (level === 'email' ? 300 : 1800) : 0
  }
      severity: success ? 'info' : 'warning'
    });
  }

  async updateThresholdConfig(updates: Partial<ThresholdConfig>): Promise<ThresholdConfig> {

    this.config = { ...this.config, ...updates };
    
    await this.auditService.logEvent({
      action: 'verification_threshold_config_updated',
      details: { updates },
      severity: 'info'
    });

    return this.config;
  }

  getThresholdConfig(): ThresholdConfig {
    return { ...this.config };
  }

  async getVerificationStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<Record<string, unknown>> {
    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    const stats = await this.db.query(`
      SELECT 
        COUNT(*) as total_assessments,
        COUNT(*) FILTER (WHERE details->>'verificationRequired' = 'true') as verifications_required,
        COUNT(*) FILTER (WHERE details->>'verificationLevel' = 'email') as email_verifications,
        COUNT(*) FILTER (WHERE details->>'verificationLevel' = 'totp') as totp_verifications,
        COUNT(*) FILTER (WHERE details->>'verificationLevel' = 'admin_approval') as admin_approvals,
        AVG(CAST(details->>'riskScore' AS DECIMAL)) as avg_risk_score,
        MAX(CAST(details->>'riskScore' AS DECIMAL)) as max_risk_score
      FROM audit_logs 
      WHERE action = 'verification_threshold_assessment'
        AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
    `);

    return stats.rows[0];
  }
}