/**
 * SessionLimitChecks - Implementation of all session limit checking methods
 * 
 * This file contains the detailed implementation of all limit checking logic
 * used by the SessionLimitManager
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { SessionLimitConfig, SessionEnforcementAction } from './SessionLimitManager';

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  conflictingSessions?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  type?: string;
  details?: Record<string, any>;
}

export class SessionLimitChecks {
  private dbService: DatabaseService;
  private redisService: RedisService;
  
  constructor(dbService: DatabaseService, redisService: RedisService) {
    this.dbService = dbService;
    this.redisService = redisService;
  }
  
  /**
   * Check concurrent sessions per user limit
   */
  async checkUserConcurrentLimit(
    userId: string, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    try {
      const result = await this.dbService.query(`
        SELECT id, created_at FROM user_sessions
        WHERE user_id = $1 AND NOT revoked AND expires_at > NOW()
        ORDER BY created_at ASC
      `, [userId]);
      
      const activeSessions = result.rows;
      const currentCount = activeSessions.length;
      
      if (currentCount >= config.maxConcurrentSessionsPerUser) {
        return {
          allowed: false,
          reason: `User has reached maximum concurrent sessions limit (${config.maxConcurrentSessionsPerUser})`,
          conflictingSessions: activeSessions.slice(0, currentCount - config.maxConcurrentSessionsPerUser + 1)
            .map(row => row.id),
          severity: 'medium',
          type: 'concurrent_user',
          details: {
            currentCount,
            limit: config.maxConcurrentSessionsPerUser,
            userId
          }
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking user concurrent limit:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check concurrent sessions per IP address limit
   */
  async checkIPConcurrentLimit(
    ipAddress: string | undefined, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!ipAddress) {
      return { allowed: true };
    }
    
    try {
      const result = await this.dbService.query(`
        SELECT id, user_id, created_at FROM user_sessions
        WHERE ip_address = $1 AND NOT revoked AND expires_at > NOW()
        ORDER BY created_at ASC
      `, [ipAddress]);
      
      const activeSessions = result.rows;
      const currentCount = activeSessions.length;
      
      if (currentCount >= config.maxConcurrentSessionsPerIP) {
        return {
          allowed: false,
          reason: `IP address has reached maximum concurrent sessions limit (${config.maxConcurrentSessionsPerIP})`,
          conflictingSessions: activeSessions.slice(0, currentCount - config.maxConcurrentSessionsPerIP + 1)
            .map(row => row.id),
          severity: 'high',
          type: 'concurrent_ip',
          details: {
            currentCount,
            limit: config.maxConcurrentSessionsPerIP,
            ipAddress,
            affectedUsers: [...new Set(activeSessions.map(s => s.user_id))]
          }
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking IP concurrent limit:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check concurrent sessions per organization limit
   */
  async checkOrganizationConcurrentLimit(
    organizationId: string | undefined, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!organizationId) {
      return { allowed: true };
    }
    
    try {
      // This assumes user table has organization_id column
      const result = await this.dbService.query(`
        SELECT s.id, s.user_id, s.created_at 
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE u.organization_id = $1 AND NOT s.revoked AND s.expires_at > NOW()
        ORDER BY s.created_at ASC
      `, [organizationId]);
      
      const activeSessions = result.rows;
      const currentCount = activeSessions.length;
      
      if (currentCount >= config.maxConcurrentSessionsPerOrganization) {
        return {
          allowed: false,
          reason: `Organization has reached maximum concurrent sessions limit (${config.maxConcurrentSessionsPerOrganization})`,
          conflictingSessions: activeSessions.slice(0, currentCount - config.maxConcurrentSessionsPerOrganization + 1)
            .map(row => row.id),
          severity: 'medium',
          type: 'concurrent_org',
          details: {
            currentCount,
            limit: config.maxConcurrentSessionsPerOrganization,
            organizationId,
            affectedUsers: [...new Set(activeSessions.map(s => s.user_id))]
          }
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking organization concurrent limit:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check concurrent sessions per device limit
   */
  async checkDeviceConcurrentLimit(
    deviceFingerprint: string | undefined, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!deviceFingerprint || !config.enableDeviceLimits) {
      return { allowed: true };
    }
    
    try {
      const result = await this.dbService.query(`
        SELECT id, user_id, created_at FROM user_sessions
        WHERE device_info->>'fingerprint' = $1 AND NOT revoked AND expires_at > NOW()
        ORDER BY created_at ASC
      `, [deviceFingerprint]);
      
      const activeSessions = result.rows;
      const currentCount = activeSessions.length;
      
      if (currentCount >= config.maxConcurrentSessionsPerDevice) {
        return {
          allowed: false,
          reason: `Device has reached maximum concurrent sessions limit (${config.maxConcurrentSessionsPerDevice})`,
          conflictingSessions: activeSessions.slice(0, currentCount - config.maxConcurrentSessionsPerDevice + 1)
            .map(row => row.id),
          severity: 'medium',
          type: 'concurrent_device',
          details: {
            currentCount,
            limit: config.maxConcurrentSessionsPerDevice,
            deviceFingerprint,
            affectedUsers: [...new Set(activeSessions.map(s => s.user_id))]
          }
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking device concurrent limit:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check concurrent sessions per country limit
   */
  async checkCountryConcurrentLimit(
    country: string | undefined, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!country) {
      return { allowed: true };
    }
    
    try {
      // This would require a GeoIP lookup for existing sessions
      // For simplicity, we'll use a Redis counter for real-time tracking
      const cacheKey = `session_limits:country:${country}`;
      const currentCount = await this.redisService.get(cacheKey);
      const count = currentCount ? parseInt(currentCount) : 0;
      
      if (count >= config.maxConcurrentSessionsPerCountry) {
        return {
          allowed: false,
          reason: `Country has reached maximum concurrent sessions limit (${config.maxConcurrentSessionsPerCountry})`,
          severity: 'low',
          type: 'concurrent_country',
          details: {
            currentCount: count,
            limit: config.maxConcurrentSessionsPerCountry,
            country
          }
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking country concurrent limit:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check geographic limits (allowed/blocked countries)
   */
  async checkGeographicLimits(
    country: string | undefined, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!config.enableGeographicLimits || !country) {
      return { allowed: true };
    }
    
    // Check blocked countries
    if (config.blockedCountries.length > 0 && config.blockedCountries.includes(country)) {
      return {
        allowed: false,
        reason: `Access from ${country} is blocked`,
        severity: 'high',
        type: 'geographic_limit',
        details: {
          country,
          blockedCountries: config.blockedCountries
        }
      };
    }
    
    // Check allowed countries (if specified)
    if (config.allowedCountries.length > 0 && !config.allowedCountries.includes(country)) {
      return {
        allowed: false,
        reason: `Access from ${country} is not allowed`,
        severity: 'high',
        type: 'geographic_limit',
        details: {
          country,
          allowedCountries: config.allowedCountries
        }
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Check business hours limits
   */
  async checkBusinessHoursLimits(
    config: SessionLimitConfig, 
    isAdmin: boolean = false, 
    isPremium: boolean = false
  ): Promise<LimitCheckResult> {
    if (!config.enableBusinessHoursLimits) {
      return { allowed: true };
    }
    
    // Admins might bypass business hours limits
    if (isAdmin && config.adminSessionsHavePriority) {
      return { allowed: true };
    }
    
    try {
      const now = new Date();
      const currentTime = this.getTimeInTimezone(now, config.businessHoursTimezone);
      const isBusinessHours = this.isWithinBusinessHours(
        currentTime,
        config.businessHoursStart,
        config.businessHoursEnd
      );
      
      const maxSessions = isBusinessHours 
        ? config.businessHoursMaxSessions 
        : config.offHoursMaxSessions;
      
      // Get current user session count (this would need userId context)
      // For now, we'll assume this check is done elsewhere or combined with user limit check
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking business hours limits:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check device limits (trusted devices, max devices per user)
   */
  async checkDeviceLimits(
    userId: string, 
    deviceFingerprint: string | undefined, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!config.enableDeviceLimits || !deviceFingerprint) {
      return { allowed: true };
    }
    
    try {
      // Check if device is trusted
      const trustedDeviceResult = await this.dbService.query(`
        SELECT id, last_used FROM user_trusted_devices
        WHERE user_id = $1 AND device_fingerprint = $2 
        AND (expires_at IS NULL OR expires_at > NOW())
      `, [userId, deviceFingerprint]);
      
      const isTrustedDevice = trustedDeviceResult.rows.length > 0;
      
      if (!isTrustedDevice) {
        // Check total devices for user
        const userDevicesResult = await this.dbService.query(`
          SELECT COUNT(DISTINCT device_info->>'fingerprint') as device_count
          FROM user_sessions
          WHERE user_id = $1 AND device_info->>'fingerprint' IS NOT NULL
          AND created_at > NOW() - INTERVAL '${config.deviceTrustDuration} days'
        `, [userId]);
        
        const deviceCount = parseInt(userDevicesResult.rows[0]?.device_count || '0');
        
        if (deviceCount >= config.maxDevicesPerUser) {
          return {
            allowed: false,
            reason: `User has reached maximum devices limit (${config.maxDevicesPerUser})`,
            severity: 'medium',
            type: 'device_limit',
            details: {
              currentDeviceCount: deviceCount,
              limit: config.maxDevicesPerUser,
              deviceFingerprint,
              isTrustedDevice
            }
          };
        }
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking device limits:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check for suspicious activity patterns
   */
  async checkSuspiciousActivity(
    userId: string, 
    sessionData: any, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!config.enableSuspiciousActivityDetection) {
      return { allowed: true };
    }
    
    try {
      const checks = await Promise.all([
        this.checkRapidSessionCreation(userId, config),
        this.checkSuspiciousLocationChange(userId, sessionData, config),
        this.checkUnusualDevice(userId, sessionData, config),
        this.checkTimeBasedAnomalies(userId, sessionData)
      ]);
      
      const violations = checks.filter(check => !check.allowed);
      
      if (violations.length > 0) {
        const mostSevere = violations.reduce((prev, current) => 
          (current.severity || 'low') > (prev.severity || 'low') ? current : prev
        );
        
        return {
          allowed: false,
          reason: `Suspicious activity detected: ${mostSevere.reason}`,
          severity: 'high',
          type: 'suspicious_activity',
          details: {
            violations: violations.map(v => ({
              type: v.type,
              reason: v.reason,
              details: v.details
            }))
          }
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return { allowed: true }; // Fail open
    }
  }
  
  /**
   * Check for rapid session creation
   */
  private async checkRapidSessionCreation(
    userId: string, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    const result = await this.dbService.query(`
      SELECT COUNT(*) as session_count
      FROM user_sessions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 minute'
    `, [userId]);
    
    const recentSessions = parseInt(result.rows[0]?.session_count || '0');
    
    if (recentSessions >= config.rapidSessionCreationThreshold) {
      return {
        allowed: false,
        reason: 'Rapid session creation detected',
        severity: 'high',
        type: 'rapid_session_creation',
        details: {
          sessionCount: recentSessions,
          threshold: config.rapidSessionCreationThreshold,
          timeWindow: '1 minute'
        }
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Check for suspicious location changes
   */
  private async checkSuspiciousLocationChange(
    userId: string, 
    sessionData: any, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!sessionData.country) {
      return { allowed: true };
    }
    
    const result = await this.dbService.query(`
      SELECT ip_address, created_at
      FROM user_sessions
      WHERE user_id = $1 AND ip_address IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);
    
    if (result.rows.length === 0) {
      return { allowed: true };
    }
    
    const latestSession = result.rows[0];
    const timeDiff = new Date().getTime() - new Date(latestSession.created_at).getTime();
    const timeDiffMinutes = timeDiff / (1000 * 60);
    
    if (timeDiffMinutes < config.suspiciousLocationChangeMinutes) {
      // In a real implementation, you would calculate actual geographic distance
      // For now, we'll use a simplified check
      const previousCountry = await this.getCountryFromIP(latestSession.ip_address);
      
      if (previousCountry !== sessionData.country) {
        return {
          allowed: false,
          reason: 'Suspicious location change detected',
          severity: 'high',
          type: 'suspicious_location_change',
          details: {
            previousCountry,
            currentCountry: sessionData.country,
            timeDiffMinutes,
            threshold: config.suspiciousLocationChangeMinutes
          }
        };
      }
    }
    
    return { allowed: true };
  }
  
  /**
   * Check for unusual device characteristics
   */
  private async checkUnusualDevice(
    userId: string, 
    sessionData: any, 
    config: SessionLimitConfig
  ): Promise<LimitCheckResult> {
    if (!sessionData.userAgent && !sessionData.deviceFingerprint) {
      return { allowed: true };
    }
    
    // Get user's device history
    const result = await this.dbService.query(`
      SELECT device_info, user_agent, COUNT(*) as usage_count
      FROM user_sessions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '90 days'
      GROUP BY device_info, user_agent
    `, [userId]);
    
    const knownDevices = result.rows;
    
    // Simple heuristic for device suspiciousness
    const isKnownDevice = knownDevices.some(device => 
      device.user_agent === sessionData.userAgent ||
      JSON.stringify(device.device_info) === JSON.stringify(sessionData.deviceInfo)
    );
    
    if (!isKnownDevice && knownDevices.length > 0) {
      return {
        allowed: false,
        reason: 'Unusual device detected',
        severity: 'medium',
        type: 'unusual_device',
        details: {
          userAgent: sessionData.userAgent,
          deviceFingerprint: sessionData.deviceFingerprint,
          knownDeviceCount: knownDevices.length
        }
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Check for time-based anomalies
   */
  private async checkTimeBasedAnomalies(
    userId: string, 
    sessionData: any
  ): Promise<LimitCheckResult> {
    // Get user's typical session timing patterns
    const result = await this.dbService.query(`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
      FROM user_sessions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
    `, [userId]);
    
    if (result.rows.length === 0) {
      return { allowed: true };
    }
    
    const currentHour = new Date().getHours();
    const hourlyPattern = result.rows;
    const currentHourUsage = hourlyPattern.find(p => parseInt(p.hour) === currentHour);
    
    // If user has never logged in during this hour, it might be suspicious
    if (!currentHourUsage && hourlyPattern.length > 10) {
      return {
        allowed: false,
        reason: 'Unusual login time detected',
        severity: 'low',
        type: 'unusual_time',
        details: {
          currentHour,
          typicalHours: hourlyPattern.map(p => parseInt(p.hour))
        }
      };
    }
    
    return { allowed: true };
  }
  
  // Helper methods
  
  private getTimeInTimezone(date: Date, timezone: string): Date {
    // Simple timezone conversion - in production use a proper library like moment.js
    try {
      return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    } catch (error) {
      return date; // Fallback to UTC
    }
  }
  
  private isWithinBusinessHours(
    currentTime: Date, 
    startTime: string, 
    endTime: string
  ): boolean {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  
  private async getCountryFromIP(ipAddress: string): Promise<string> {
    // In production, this would use a GeoIP service
    // For now, return a placeholder
    return 'US';
  }
}