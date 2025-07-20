// Location Risk Integration Service
// Bridges GeolocationService with RiskScoringService for comprehensive security analysis

import { GeolocationService, GeolocationData } from './GeolocationService';
import { 
  RiskScoringService, 
  LoginAttempt as RiskLoginAttempt, 
  UserProfile, 
  RiskScore 
} from '../../services/RiskScoringService';
import { LoginAttempt } from './LoginService';
import { DatabaseService } from '../database/DatabaseService';

export interface EnhancedSecurityAnalysis {
  riskScore: RiskScore;
  geolocationData: GeolocationData;
  locationAnalysis: {
    isNewLocation: boolean;
    isTypicalLocation: boolean;
    distanceFromNearestKm?: number;
    suspiciousIndicators: string[];
  };
  recommendations: string[];
  requiresAdditionalVerification: boolean;
  shouldBlockLogin: boolean;
}

export class LocationRiskIntegrationService {
  private geolocationService: GeolocationService;
  private riskScoringService: RiskScoringService;
  private db: DatabaseService;

  constructor(
    geolocationService: GeolocationService,
    riskScoringService: RiskScoringService,
    db: DatabaseService
  ) {
    this.geolocationService = geolocationService;
    this.riskScoringService = riskScoringService;
    this.db = db;
  }

  /**
   * Perform comprehensive security analysis for a login attempt
   */
  async analyzeLoginSecurity(
    loginAttempt: LoginAttempt,
    context: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      geoLocation?: {
        country?: string;
        city?: string;
        timezone?: string;
      };
    }
  ): Promise<EnhancedSecurityAnalysis> {
    // Get comprehensive geolocation data
    const geolocationData = await this.geolocationService.getGeolocationData(
      context.ipAddress || '',
      context.geoLocation ? {
        'cf-ipcountry': context.geoLocation.country,
        'cf-timezone': context.geoLocation.timezone
      } : undefined
    );

    // Track location for the user
    const locationAnalysis = loginAttempt.userId 
      ? await this.geolocationService.trackLoginLocation(
          loginAttempt.userId,
          context.ipAddress || '',
          geolocationData
        )
      : {
          isNewLocation: true,
          isTypicalLocation: false,
          suspiciousIndicators: []
        };

    // Get user profile for risk scoring
    const userProfile = loginAttempt.userId 
      ? await this.buildUserProfile(loginAttempt.userId)
      : this.createGuestUserProfile();

    // Get recent login attempts for pattern analysis
    const recentAttempts = await this.getRecentLoginAttempts(
      loginAttempt.userId,
      context.ipAddress || ''
    );

    // Convert login attempt to risk scoring format
    const riskLoginAttempt: RiskLoginAttempt = {
      userId: loginAttempt.userId,
      ipAddress: context.ipAddress || '',
      userAgent: context.userAgent || '',
      location: {
        country: geolocationData.country,
        region: geolocationData.region,
        city: geolocationData.city,
        coordinates: geolocationData.coordinates
      },
      timestamp: loginAttempt.timestamp,
      success: loginAttempt.success,
      sessionId: undefined, // Not available in this context
      deviceFingerprint: loginAttempt.deviceFingerprint,
      twoFactorUsed: false // Would need to be passed from login context
    };

    // Calculate risk score
    const riskScore = await this.riskScoringService.calculateRiskScore(
      riskLoginAttempt,
      userProfile,
      recentAttempts
    );

    // Generate comprehensive recommendations
    const recommendations = this.generateSecurityRecommendations(
      riskScore,
      locationAnalysis,
      geolocationData
    );

    // Determine security actions
    const requiresAdditionalVerification = this.shouldRequireAdditionalVerification(
      riskScore,
      locationAnalysis
    );

    const shouldBlockLogin = this.shouldBlockLogin(riskScore, locationAnalysis);

    return {
      riskScore,
      geolocationData,
      locationAnalysis,
      recommendations,
      requiresAdditionalVerification,
      shouldBlockLogin
    };
  }

  /**
   * Build user profile for risk scoring from database
   */
  private async buildUserProfile(userId: string): Promise<UserProfile> {
    // Get user's location history
    const locationHistory = await this.geolocationService.getUserLocationHistory(userId);
    
    // Convert to risk scoring format
    const typicalLocations = locationHistory
      .filter(loc => loc.isTypical)
      .map(loc => ({
        country: loc.location.country,
        region: loc.location.region,
        frequency: loc.frequency
      }));

    // Get device history from login attempts
    const deviceHistory = await this.getUserDeviceHistory(userId);
    
    // Get login time patterns
    const loginTimePatterns = await this.getUserLoginTimePatterns(userId);
    
    // Get user account info
    const userInfo = await this.getUserAccountInfo(userId);

    return {
      userId,
      typicalLocations,
      typicalDevices: deviceHistory,
      typicalLoginTimes: loginTimePatterns,
      accountAge: userInfo.accountAge,
      mfaEnabled: userInfo.mfaEnabled,
      riskLevel: userInfo.riskLevel
    };
  }

  /**
   * Create guest user profile for users without history
   */
  private createGuestUserProfile(): UserProfile {
    return {
      userId: 'guest',
      typicalLocations: [],
      typicalDevices: [],
      typicalLoginTimes: [],
      accountAge: 0,
      mfaEnabled: false,
      riskLevel: 'medium'
    };
  }

  /**
   * Get recent login attempts for pattern analysis
   */
  private async getRecentLoginAttempts(
    userId?: string,
    ipAddress?: string
  ): Promise<RiskLoginAttempt[]> {
    let query = `
      SELECT 
        user_id,
        ip_address,
        user_agent,
        created_at,
        action,
        details
      FROM audit_logs 
      WHERE action IN ('login_success', 'login_failed')
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;
    const params: any[] = [];

    if (userId) {
      query += ` AND user_id = $${params.length + 1}`;
      params.push(userId);
    }

    if (ipAddress) {
      query += ` AND ip_address = $${params.length + 1}`;
      params.push(ipAddress);
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      location: this.extractLocationFromDetails(row.details),
      timestamp: row.created_at,
      success: row.action === 'login_success',
      deviceFingerprint: row.details?.deviceFingerprint
    }));
  }

  /**
   * Get user's device history
   */
  private async getUserDeviceHistory(userId: string): Promise<Array<{
    fingerprint: string;
    lastSeen: Date;
    frequency: number;
  }>> {
    const result = await this.db.query(`
      SELECT 
        details->>'deviceFingerprint' as fingerprint,
        MAX(created_at) as last_seen,
        COUNT(*) as frequency
      FROM audit_logs 
      WHERE user_id = $1 
        AND action IN ('login_success', 'login_failed')
        AND details->>'deviceFingerprint' IS NOT NULL
        AND created_at >= NOW() - INTERVAL '90 days'
      GROUP BY details->>'deviceFingerprint'
      ORDER BY frequency DESC
    `, [userId]);

    return result.rows.map(row => ({
      fingerprint: row.fingerprint,
      lastSeen: row.last_seen,
      frequency: parseInt(row.frequency)
    }));
  }

  /**
   * Get user's login time patterns
   */
  private async getUserLoginTimePatterns(userId: string): Promise<Array<{
    hourOfDay: number;
    dayOfWeek: number;
    frequency: number;
  }>> {
    const result = await this.db.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour_of_day,
        EXTRACT(DOW FROM created_at) as day_of_week,
        COUNT(*) as frequency
      FROM audit_logs 
      WHERE user_id = $1 
        AND action = 'login_success'
        AND created_at >= NOW() - INTERVAL '90 days'
      GROUP BY EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at)
      HAVING COUNT(*) >= 2
      ORDER BY frequency DESC
    `, [userId]);

    return result.rows.map(row => ({
      hourOfDay: parseInt(row.hour_of_day),
      dayOfWeek: parseInt(row.day_of_week),
      frequency: parseInt(row.frequency)
    }));
  }

  /**
   * Get user account information
   */
  private async getUserAccountInfo(userId: string): Promise<{
    accountAge: number;
    mfaEnabled: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const result = await this.db.query(`
      SELECT 
        created_at,
        two_factor_enabled,
        risk_level
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return {
        accountAge: 0,
        mfaEnabled: false,
        riskLevel: 'medium'
      };
    }

    const user = result.rows[0];
    const accountAge = Math.floor(
      (Date.now() - user.created_at.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      accountAge,
      mfaEnabled: user.two_factor_enabled || false,
      riskLevel: user.risk_level || 'medium'
    };
  }

  /**
   * Extract location data from audit log details
   */
  private extractLocationFromDetails(details: any): {
    country: string;
    region: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  } | undefined {
    if (!details?.geolocationData) return undefined;

    const geo = details.geolocationData;
    return {
      country: geo.country || 'Unknown',
      region: geo.region || 'Unknown',
      city: geo.city || 'Unknown',
      coordinates: geo.coordinates
    };
  }

  /**
   * Generate comprehensive security recommendations
   */
  private generateSecurityRecommendations(
    riskScore: RiskScore,
    locationAnalysis: any,
    geolocationData: GeolocationData
  ): string[] {
    const recommendations: string[] = [...riskScore.recommendations];

    // Add location-specific recommendations
    if (locationAnalysis.isNewLocation) {
      recommendations.push('Send location verification email to user');
    }

    if (locationAnalysis.suspiciousIndicators.includes('vpn_detected')) {
      recommendations.push('Consider additional identity verification for VPN usage');
    }

    if (locationAnalysis.suspiciousIndicators.includes('tor_exit_node')) {
      recommendations.push('Block or require manual review for Tor exit node usage');
    }

    if (geolocationData.confidence < 0.5) {
      recommendations.push('Use additional verification methods due to low location confidence');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Determine if additional verification is required
   */
  private shouldRequireAdditionalVerification(
    riskScore: RiskScore,
    locationAnalysis: any
  ): boolean {
    return (
      riskScore.overallScore >= 40 ||
      riskScore.severity === 'high' ||
      riskScore.severity === 'critical' ||
      locationAnalysis.isNewLocation ||
      locationAnalysis.suspiciousIndicators.length > 1
    );
  }

  /**
   * Determine if login should be blocked
   */
  private shouldBlockLogin(
    riskScore: RiskScore,
    locationAnalysis: any
  ): boolean {
    return (
      riskScore.overallScore >= 85 ||
      riskScore.severity === 'critical' ||
      locationAnalysis.suspiciousIndicators.includes('tor_exit_node') ||
      (locationAnalysis.suspiciousIndicators.length >= 3)
    );
  }
}