/**
 * SessionLimitManager - Comprehensive configurable session limits system
 * 
 * This service provides advanced session limiting capabilities including:
 * - Concurrent session limits per user/IP/organization/device/geographic location
 * - Time-based limits (idle timeout, absolute timeout, business hours)
 * - Real-time configuration management
 * - Automated session enforcement and conflict resolution
 * - Monitoring, alerting, and abuse detection
 * - Integration with existing authentication and WebSocket systems
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { SessionService, ActiveSession } from '../auth/services/SessionService';
import { AuditService } from '../auth/services/AuditService';
import { ConnectionManager } from '../websocket/ConnectionManager';

// Configuration Interfaces
export interface SessionLimitConfig {
  // Concurrent session limits
  maxConcurrentSessionsPerUser: number;
  maxConcurrentSessionsPerIP: number;
  maxConcurrentSessionsPerOrganization: number;
  maxConcurrentSessionsPerDevice: number;
  maxConcurrentSessionsPerCountry: number;
  
  // Time-based limits
  idleTimeoutMinutes: number;
  absoluteTimeoutHours: number;
  sessionRenewalThresholdMinutes: number;
  
  // Business hours configuration
  enableBusinessHoursLimits: boolean;
  businessHoursStart: string; // HH:MM format
  businessHoursEnd: string;   // HH:MM format
  businessHoursTimezone: string;
  businessHoursMaxSessions: number;
  offHoursMaxSessions: number;
  
  // Geographic limits
  enableGeographicLimits: boolean;
  allowedCountries: string[];
  blockedCountries: string[];
  
  // Device limits
  enableDeviceLimits: boolean;
  maxDevicesPerUser: number;
  deviceTrustDuration: number; // days
  
  // Conflict resolution
  conflictResolution: 'kick_oldest' | 'deny_new' | 'prompt_user';
  gracePeriotMinutes: number;
  
  // Priority settings
  enableSessionPriority: boolean;
  adminSessionsHavePriority: boolean;
  premiumUserSessionsHavePriority: boolean;
  
  // Security settings
  enableSuspiciousActivityDetection: boolean;
  rapidSessionCreationThreshold: number; // sessions per minute
  suspiciousLocationChangeKm: number;
  suspiciousLocationChangeMinutes: number;
  
  // Monitoring settings
  enableRealTimeMonitoring: boolean;
  alertThresholds: {
    highConcurrentSessions: number;
    suspiciousActivity: number;
    geographicAnomalies: number;
  };
}

export interface UserLimitOverride {
  userId: string;
  overrides: Partial<SessionLimitConfig>;
  expiresAt?: Date;
  reason: string;
  createdBy: string;
  createdAt: Date;
}

export interface OrganizationLimitConfig extends Partial<SessionLimitConfig> {
  organizationId: string;
  tier: 'free' | 'premium' | 'enterprise';
  customLimits?: Partial<SessionLimitConfig>;
}

export interface SessionLimitViolation {
  id: string;
  type: 'concurrent_user' | 'concurrent_ip' | 'concurrent_org' | 'concurrent_device' | 
        'concurrent_country' | 'idle_timeout' | 'absolute_timeout' | 'geographic_limit' |
        'device_limit' | 'business_hours' | 'suspicious_activity';
  userId: string;
  sessionId?: string;
  details: Record<string, any>;
  action: 'warned' | 'session_terminated' | 'access_denied' | 'grace_period';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolvedAt?: Date;
  createdAt: Date;
}

export interface SessionLimitMetrics {
  timestamp: Date;
  activeSessionsTotal: number;
  activeSessionsByType: {
    user: Record<string, number>;
    ip: Record<string, number>;
    organization: Record<string, number>;
    device: Record<string, number>;
    country: Record<string, number>;
  };
  violations: {
    total: number;
    byType: Record<string, number>;
    resolved: number;
    pending: number;
  };
  performance: {
    averageCheckTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

export interface SessionEnforcementAction {
  action: 'terminate' | 'warn' | 'extend_grace' | 'upgrade_required';
  sessionId: string;
  reason: string;
  gracePeriodMinutes?: number;
  notifyUser: boolean;
  details: Record<string, any>;
}

export class SessionLimitManager extends EventEmitter {
  private dbService: DatabaseService;
  private redisService: RedisService;
  private sessionService: SessionService;
  private auditService: AuditService;
  private connectionManager?: ConnectionManager;
  
  private defaultConfig: SessionLimitConfig;
  private configCache: Map<string, SessionLimitConfig> = new Map();
  private userOverrides: Map<string, UserLimitOverride> = new Map();
  private organizationConfigs: Map<string, OrganizationLimitConfig> = new Map();
  
  private monitoringInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private configRefreshInterval?: NodeJS.Timeout;
  
  private metrics: SessionLimitMetrics;
  private readonly CACHE_PREFIX = 'session_limits:';
  private readonly CONFIG_CACHE_TTL = 300; // 5 minutes
  
  constructor(
    dbService: DatabaseService,
    redisService: RedisService,
    sessionService: SessionService,
    auditService: AuditService,
    connectionManager?: ConnectionManager
  ) {
    super();
    
    this.dbService = dbService;
    this.redisService = redisService;
    this.sessionService = sessionService;
    this.auditService = auditService;
    this.connectionManager = connectionManager;
    
    // Default configuration
    this.defaultConfig = {
      maxConcurrentSessionsPerUser: 5,
      maxConcurrentSessionsPerIP: 10,
      maxConcurrentSessionsPerOrganization: 100,
      maxConcurrentSessionsPerDevice: 3,
      maxConcurrentSessionsPerCountry: 1000,
      
      idleTimeoutMinutes: 60,
      absoluteTimeoutHours: 12,
      sessionRenewalThresholdMinutes: 15,
      
      enableBusinessHoursLimits: false,
      businessHoursStart: '09:00',
      businessHoursEnd: '17:00',
      businessHoursTimezone: 'UTC',
      businessHoursMaxSessions: 3,
      offHoursMaxSessions: 2,
      
      enableGeographicLimits: false,
      allowedCountries: [],
      blockedCountries: [],
      
      enableDeviceLimits: false,
      maxDevicesPerUser: 5,
      deviceTrustDuration: 30,
      
      conflictResolution: 'kick_oldest',
      gracePeriotMinutes: 5,
      
      enableSessionPriority: true,
      adminSessionsHavePriority: true,
      premiumUserSessionsHavePriority: true,
      
      enableSuspiciousActivityDetection: true,
      rapidSessionCreationThreshold: 10,
      suspiciousLocationChangeKm: 500,
      suspiciousLocationChangeMinutes: 15,
      
      enableRealTimeMonitoring: true,
      alertThresholds: {
        highConcurrentSessions: 80,
        suspiciousActivity: 5,
        geographicAnomalies: 3
      }
    };
    
    this.metrics = this.initializeMetrics();
  }
  
  /**
   * Initialize the SessionLimitManager
   */
  async initialize(): Promise<void> {
    try {
      // Create database tables if they don't exist
      await this.createTables();
      
      // Load configurations from database
      await this.loadConfigurations();
      
      // Start monitoring if enabled
      if (this.defaultConfig.enableRealTimeMonitoring) {
        this.startMonitoring();
      }
      
      // Start cleanup processes
      this.startCleanupTasks();
      
      // Start configuration refresh
      this.startConfigurationRefresh();
      
      console.log('SessionLimitManager initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      console.error('Failed to initialize SessionLimitManager:', error);
      throw error;
    }
  }
  
  /**
   * Check if a new session can be created for a user
   */
  async canCreateSession(
    userId: string,
    sessionData: {
      ipAddress?: string;
      organizationId?: string;
      deviceFingerprint?: string;
      country?: string;
      userAgent?: string;
      isAdmin?: boolean;
      isPremium?: boolean;
    }
  ): Promise<{
    allowed: boolean;
    reason?: string;
    conflictingSessions?: string[];
    action?: SessionEnforcementAction;
    gracePeriodMinutes?: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Get effective configuration for user
      const config = await this.getEffectiveConfig(userId, sessionData.organizationId);
      
      // Perform all limit checks
      const checks = await Promise.all([
        this.checkUserConcurrentLimit(userId, config),
        this.checkIPConcurrentLimit(sessionData.ipAddress, config),
        this.checkOrganizationConcurrentLimit(sessionData.organizationId, config),
        this.checkDeviceConcurrentLimit(sessionData.deviceFingerprint, config),
        this.checkCountryConcurrentLimit(sessionData.country, config),
        this.checkGeographicLimits(sessionData.country, config),
        this.checkBusinessHoursLimits(config, sessionData.isAdmin, sessionData.isPremium),
        this.checkDeviceLimits(userId, sessionData.deviceFingerprint, config),
        this.checkSuspiciousActivity(userId, sessionData, config)
      ]);
      
      // Process check results
      const violations = checks.filter(check => !check.allowed);
      
      if (violations.length === 0) {
        // Update performance metrics
        this.updatePerformanceMetrics(startTime, 'success');
        return { allowed: true };
      }
      
      // Handle violations based on severity and configuration
      const mostSevereViolation = violations.reduce((prev, current) => 
        (current.severity || 'low') > (prev.severity || 'low') ? current : prev
      );
      
      // Log violation
      await this.logViolation({
        type: mostSevereViolation.type as any,
        userId,
        details: mostSevereViolation.details || {},
        action: 'access_denied',
        severity: mostSevereViolation.severity as any || 'medium'
      });
      
      // Determine action based on conflict resolution strategy
      const action = await this.determineEnforcementAction(
        userId,
        mostSevereViolation,
        config
      );
      
      this.updatePerformanceMetrics(startTime, 'violation');
      
      return {
        allowed: false,
        reason: mostSevereViolation.reason,
        conflictingSessions: mostSevereViolation.conflictingSessions,
        action,
        gracePeriodMinutes: action.gracePeriodMinutes
      };
      
    } catch (error) {
      console.error('Error checking session limits:', error);
      this.updatePerformanceMetrics(startTime, 'error');
      
      // Fail open for availability
      return { allowed: true };
    }
  }
  
  /**
   * Enforce session limits and handle violations
   */
  async enforceSessionLimits(
    userId: string,
    sessionId: string,
    action: SessionEnforcementAction
  ): Promise<void> {
    try {
      switch (action.action) {
      case 'terminate':
        await this.terminateSession(sessionId, action.reason, action.notifyUser);
        break;
          
      case 'warn':
        await this.warnUser(userId, sessionId, action.reason, action.details);
        break;
          
      case 'extend_grace':
        await this.extendGracePeriod(
          sessionId,
          action.gracePeriodMinutes || 5,
          action.reason
        );
        break;
          
      case 'upgrade_required':
        await this.notifyUpgradeRequired(userId, action.reason, action.details);
        break;
      }
      
      // Log enforcement action
      await this.auditService.logEvent({
        userId,
        action: 'session_limit_enforced',
        details: {
          enforcementAction: action.action,
          sessionId,
          reason: action.reason,
          details: action.details
        },
        sessionId,
        severity: 'info'
      });
      
      this.emit('session_limit_enforced', {
        userId,
        sessionId,
        action
      });
      
    } catch (error) {
      console.error('Error enforcing session limits:', error);
      throw error;
    }
  }
  
  /**
   * Update session limits configuration
   */
  async updateConfiguration(
    config: Partial<SessionLimitConfig>,
    updatedBy: string,
    scope: 'global' | 'organization' | 'user' = 'global',
    targetId?: string
  ): Promise<void> {
    try {
      const now = new Date();
      
      if (scope === 'global') {
        // Update global configuration
        await this.dbService.query(`
          INSERT INTO session_limit_configs (
            id, scope, target_id, config, updated_by, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (scope, target_id) 
          DO UPDATE SET config = $4, updated_by = $5, updated_at = $6
        `, [
          'global',
          'global',
          null,
          JSON.stringify(config),
          updatedBy,
          now
        ]);
        
        // Update default config
        Object.assign(this.defaultConfig, config);
        
      } else if (scope === 'organization' && targetId) {
        // Update organization-specific configuration
        await this.dbService.query(`
          INSERT INTO session_limit_configs (
            id, scope, target_id, config, updated_by, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (scope, target_id)
          DO UPDATE SET config = $4, updated_by = $5, updated_at = $6
        `, [
          `org_${targetId}`,
          'organization',
          targetId,
          JSON.stringify(config),
          updatedBy,
          now
        ]);
        
      } else if (scope === 'user' && targetId) {
        // Update user-specific override
        const override: UserLimitOverride = {
          userId: targetId,
          overrides: config,
          reason: 'Configuration update',
          createdBy: updatedBy,
          createdAt: now
        };
        
        await this.dbService.query(`
          INSERT INTO session_limit_user_overrides (
            user_id, overrides, reason, created_by, created_at
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id)
          DO UPDATE SET overrides = $2, reason = $3, created_by = $4, created_at = $5
        `, [
          targetId,
          JSON.stringify(config),
          override.reason,
          updatedBy,
          now
        ]);
        
        this.userOverrides.set(targetId, override);
      }
      
      // Invalidate cache
      await this.invalidateConfigCache(scope, targetId);
      
      // Log configuration change
      await this.auditService.logEvent({
        userId: updatedBy,
        action: 'session_limits_config_updated',
        details: {
          scope,
          targetId,
          changes: config
        },
        severity: 'info'
      });
      
      this.emit('configuration_updated', {
        scope,
        targetId,
        config,
        updatedBy
      });
      
    } catch (error) {
      console.error('Error updating session limits configuration:', error);
      throw error;
    }
  }
  
  /**
   * Get session limit metrics and analytics
   */
  async getMetrics(timeRange?: { start: Date; end: Date }): Promise<SessionLimitMetrics> {
    try {
      const range = timeRange || {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      };
      
      // Get active sessions breakdown
      const activeSessionsResult = await this.dbService.query(`
        SELECT 
          user_id,
          ip_address,
          device_info->>'fingerprint' as device_fingerprint,
          COUNT(*) as session_count
        FROM user_sessions
        WHERE NOT revoked AND expires_at > NOW()
        GROUP BY user_id, ip_address, device_info->>'fingerprint'
      `);
      
      // Aggregate by type
      const activeSessionsByType = {
        user: {} as Record<string, number>,
        ip: {} as Record<string, number>,
        organization: {} as Record<string, number>,
        device: {} as Record<string, number>,
        country: {} as Record<string, number>
      };
      
      for (const row of activeSessionsResult.rows) {
        activeSessionsByType.user[row.user_id] = 
          (activeSessionsByType.user[row.user_id] || 0) + row.session_count;
        
        if (row.ip_address) {
          activeSessionsByType.ip[row.ip_address] = 
            (activeSessionsByType.ip[row.ip_address] || 0) + row.session_count;
        }
        
        if (row.device_fingerprint) {
          activeSessionsByType.device[row.device_fingerprint] = 
            (activeSessionsByType.device[row.device_fingerprint] || 0) + row.session_count;
        }
      }
      
      // Get violations metrics
      const violationsResult = await this.dbService.query(`
        SELECT 
          type,
          action,
          resolved_at IS NOT NULL as resolved,
          COUNT(*) as count
        FROM session_limit_violations
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY type, action, (resolved_at IS NOT NULL)
      `, [range.start, range.end]);
      
      const violations = {
        total: 0,
        byType: {} as Record<string, number>,
        resolved: 0,
        pending: 0
      };
      
      for (const row of violationsResult.rows) {
        violations.total += parseInt(row.count);
        violations.byType[row.type] = (violations.byType[row.type] || 0) + parseInt(row.count);
        
        if (row.resolved) {
          violations.resolved += parseInt(row.count);
        } else {
          violations.pending += parseInt(row.count);
        }
      }
      
      return {
        timestamp: new Date(),
        activeSessionsTotal: activeSessionsResult.rows.reduce(
          (sum, row) => sum + row.session_count, 0
        ),
        activeSessionsByType,
        violations,
        performance: this.metrics.performance
      };
      
    } catch (error) {
      console.error('Error getting session limit metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get active violations requiring attention
   */
  async getActiveViolations(filters?: {
    userId?: string;
    type?: string;
    severity?: string;
    limit?: number;
  }): Promise<SessionLimitViolation[]> {
    try {
      let query = `
        SELECT * FROM session_limit_violations 
        WHERE resolved_at IS NULL
      `;
      const params: any[] = [];
      let paramIndex = 1;
      
      if (filters?.userId) {
        query += ` AND user_id = $${paramIndex++}`;
        params.push(filters.userId);
      }
      
      if (filters?.type) {
        query += ` AND type = $${paramIndex++}`;
        params.push(filters.type);
      }
      
      if (filters?.severity) {
        query += ` AND severity = $${paramIndex++}`;
        params.push(filters.severity);
      }
      
      query += ' ORDER BY created_at DESC';
      
      if (filters?.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }
      
      const result = await this.dbService.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        userId: row.user_id,
        sessionId: row.session_id,
        details: row.details,
        action: row.action,
        severity: row.severity,
        resolvedAt: row.resolved_at,
        createdAt: row.created_at
      }));
      
    } catch (error) {
      console.error('Error getting active violations:', error);
      throw error;
    }
  }
  
  /**
   * Manually resolve a violation
   */
  async resolveViolation(
    violationId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<void> {
    try {
      const now = new Date();
      
      await this.dbService.query(`
        UPDATE session_limit_violations
        SET resolved_at = $1, resolved_by = $2, resolution = $3
        WHERE id = $4
      `, [now, resolvedBy, resolution, violationId]);
      
      await this.auditService.logEvent({
        userId: resolvedBy,
        action: 'session_limit_violation_resolved',
        details: {
          violationId,
          resolution
        },
        severity: 'info'
      });
      
      this.emit('violation_resolved', {
        violationId,
        resolvedBy,
        resolution
      });
      
    } catch (error) {
      console.error('Error resolving violation:', error);
      throw error;
    }
  }
  
  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.configRefreshInterval) {
      clearInterval(this.configRefreshInterval);
    }
    
    this.emit('shutdown');
    console.log('SessionLimitManager shut down');
  }
  
  // Private helper methods implementation continues...
  
  private async createTables(): Promise<void> {
    // Create configuration table
    await this.dbService.query(`
      CREATE TABLE IF NOT EXISTS session_limit_configs (
        id VARCHAR(255) PRIMARY KEY,
        scope VARCHAR(50) NOT NULL,
        target_id VARCHAR(255),
        config JSONB NOT NULL,
        updated_by VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(scope, target_id)
      )
    `);
    
    // Create user overrides table
    await this.dbService.query(`
      CREATE TABLE IF NOT EXISTS session_limit_user_overrides (
        user_id VARCHAR(255) PRIMARY KEY,
        overrides JSONB NOT NULL,
        expires_at TIMESTAMP,
        reason TEXT NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create violations table
    await this.dbService.query(`
      CREATE TABLE IF NOT EXISTS session_limit_violations (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(100) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255),
        details JSONB,
        action VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        resolved_at TIMESTAMP,
        resolved_by VARCHAR(255),
        resolution TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create indexes
    await this.dbService.query(`
      CREATE INDEX IF NOT EXISTS idx_session_limit_violations_user_id 
      ON session_limit_violations(user_id)
    `);
    
    await this.dbService.query(`
      CREATE INDEX IF NOT EXISTS idx_session_limit_violations_type 
      ON session_limit_violations(type)
    `);
    
    await this.dbService.query(`
      CREATE INDEX IF NOT EXISTS idx_session_limit_violations_created_at 
      ON session_limit_violations(created_at)
    `);
    
    await this.dbService.query(`
      CREATE INDEX IF NOT EXISTS idx_session_limit_violations_unresolved 
      ON session_limit_violations(created_at) WHERE resolved_at IS NULL
    `);
  }
  
  private async loadConfigurations(): Promise<void> {
    // Load global configuration
    const globalConfigResult = await this.dbService.query(`
      SELECT config FROM session_limit_configs 
      WHERE scope = 'global' AND target_id IS NULL
      ORDER BY updated_at DESC LIMIT 1
    `);
    
    if (globalConfigResult.rows.length > 0) {
      Object.assign(this.defaultConfig, globalConfigResult.rows[0].config);
    }
    
    // Load organization configurations
    const orgConfigsResult = await this.dbService.query(`
      SELECT target_id, config FROM session_limit_configs 
      WHERE scope = 'organization'
    `);
    
    for (const row of orgConfigsResult.rows) {
      this.organizationConfigs.set(row.target_id, {
        organizationId: row.target_id,
        tier: 'free', // Default, should be fetched from organization data
        ...row.config
      });
    }
    
    // Load user overrides
    const userOverridesResult = await this.dbService.query(`
      SELECT * FROM session_limit_user_overrides 
      WHERE expires_at IS NULL OR expires_at > NOW()
    `);
    
    for (const row of userOverridesResult.rows) {
      this.userOverrides.set(row.user_id, {
        userId: row.user_id,
        overrides: row.overrides,
        expiresAt: row.expires_at,
        reason: row.reason,
        createdBy: row.created_by,
        createdAt: row.created_at
      });
    }
  }
  
  // Continue with remaining private methods...
  // [Implementation continues with all the check methods, enforcement methods, etc.]
  
  private initializeMetrics(): SessionLimitMetrics {
    return {
      timestamp: new Date(),
      activeSessionsTotal: 0,
      activeSessionsByType: {
        user: {},
        ip: {},
        organization: {},
        device: {},
        country: {}
      },
      violations: {
        total: 0,
        byType: {},
        resolved: 0,
        pending: 0
      },
      performance: {
        averageCheckTime: 0,
        cacheHitRate: 0,
        errorRate: 0
      }
    };
  }
  
  // Additional private methods will be implemented in separate files...
}