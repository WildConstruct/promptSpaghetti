/**
 * ExpirationManagementService - Comprehensive authentication resource expiration management
 * 
 * Manages expiration of:
 * - JWT tokens and refresh tokens
 * - API keys and access tokens
 * - User sessions and temporary credentials
 * - Password reset tokens and verification codes
 * - TOTP backup codes and recovery tokens
 */

import { DatabaseConnection } from '../../database/connection';
import { AuditService } from './AuditService';
import { RedisService } from '../database/RedisService';
import cron from 'node-cron';

}
}
export interface ExpirationPolicy {
  id: string;
  name: string;
  resourceType: 'jwt_token' | 'api_key' | 'session' | 'reset_token' | 'verification_code' | 'backup_code' | 'refresh_token';
  defaultTtl: number; // seconds
  maxTtl?: number; // maximum allowed TTL
  minTtl?: number; // minimum allowed TTL
  gracePeriod?: number; // grace period before hard expiration
  warningThreshold: number; // warn when X seconds remain
  autoRenewal: boolean;
  renewalWindow: number; // seconds before expiration to allow renewal
  organizationId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface ExpirationRule {
  id: string;
  policyId: string;
  resourceId: string;
  resourceType: string;
  expiresAt: Date;
  gracePeriodEnds?: Date;
  lastWarningAt?: Date;
  renewalCount: number;
  maxRenewals?: number;
  metadata?: Record<string, unknown>;
  status: 'active' | 'warning' | 'expired' | 'grace_period' | 'renewed' | 'revoked';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface ExpirationEvent {
  id: string;
  ruleId: string;
  resourceId: string;
  resourceType: string;
  eventType: 'created' | 'warning' | 'expired' | 'renewed' | 'revoked' | 'extended';
  timestamp: Date;
  metadata?: Record<string, unknown>;
  processedAt?: Date;
  notificationSent: boolean;
}
}
}

}
}
export interface ExpirationWarning {
  resourceId: string;
  resourceType: string;
  expiresAt: Date;
  timeRemaining: number;
  warningLevel: 'info' | 'warning' | 'critical';
  canRenew: boolean;
  renewalUrl?: string;
  userId?: string;
  organizationId?: string;
}
}
}

}
}
export interface ExpirationStats {
  total: number;
  active: number;
  warning: number;
  expired: number;
  gracePeriod: number;
  renewed: number;
  revoked: number;
  byResourceType: Record<string, number>;
  upcomingExpirations: {
    next24Hours: number;
    next7Days: number;
    next30Days: number;
}
}
  };
}

}
}
export interface RenewalRequest {
  resourceId: string;
  resourceType: string;
  requestedTtl?: number;
  reason?: string;
  requestedBy: string;
  organizationId?: string;
}
}
}

}
}
export interface RenewalResult {
  success: boolean;
  newExpiresAt?: Date;
  newTtl?: number;
  error?: string;
  warningMessage?: string;
  renewalCount?: number;
}
}
}

export class ExpirationManagementService {
  private static instance: ExpirationManagementService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private warningInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(
    private db: DatabaseConnection,
    private auditService: AuditService,
    private redisService?: RedisService
  ) {}

  static getInstance(
    db: DatabaseConnection,
    auditService: AuditService,
    redisService?: RedisService
  ): ExpirationManagementService {
    if (!ExpirationManagementService.instance) {
      ExpirationManagementService.instance = new ExpirationManagementService(db, auditService, redisService);
    }
    return ExpirationManagementService.instance;
  }

  /**
   * Initialize the expiration management system
   */
  async initialize(): Promise<void> {

    if (this.isInitialized) {
      return;
    }

    try {
      // Load default expiration policies
      await this.ensureDefaultPolicies();

      // Start background cleanup and warning processes
      this.startBackgroundProcesses();

      // Set up Redis key expiration listeners if Redis is available
      if (this.redisService) {
        await this.setupRedisExpirationListeners();
      }

      this.isInitialized = true;
      console.log('ExpirationManagementService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ExpirationManagementService:', error);
      throw error;
    }
  }

  /**
   * Create an expiration policy
   */
  async createPolicy(policy: Omit<ExpirationPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpirationPolicy> {

    const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newPolicy: ExpirationPolicy = {
      ...policy,
      id: policyId,
      createdAt: now,
      updatedAt: now
    };

    await this.db.query(`
      INSERT INTO expiration_policies (
        id, name, resource_type, default_ttl, max_ttl, min_ttl, grace_period,
        warning_threshold, auto_renewal, renewal_window, organization_id, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      policyId, policy.name, policy.resourceType, policy.defaultTtl,
      policy.maxTtl, policy.minTtl, policy.gracePeriod, policy.warningThreshold,
      policy.autoRenewal, policy.renewalWindow, policy.organizationId,
      policy.isActive, now, now
    ]);

    await this.auditService.logPolicyChange({
      policyId,
      action: 'created',
      changes: newPolicy,
      changedBy: 'system'
    });

    return newPolicy;
  }

  /**
   * Create an expiration rule for a resource
   */
  async createExpirationRule(
    resourceId: string,
    resourceType: string,
    policyId: string,
    customTtl?: number,
    createdBy?: string,
    metadata?: Record<string, unknown>
  ): Promise<ExpirationRule> {

    const policy = await this.getPolicy(policyId);
    if (!policy) {
      throw new Error(`Expiration policy ${policyId} not found`);
    }

    const ttl = customTtl || policy.defaultTtl;
    
    // Validate TTL against policy limits
    if (policy.maxTtl && ttl > policy.maxTtl) {
      throw new Error(`TTL ${ttl} exceeds maximum allowed TTL ${policy.maxTtl}`);
    }
    if (policy.minTtl && ttl < policy.minTtl) {
      throw new Error(`TTL ${ttl} is below minimum allowed TTL ${policy.minTtl}`);
    }

    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl * 1000));
    const gracePeriodEnds = policy.gracePeriod 
      ? new Date(expiresAt.getTime() + (policy.gracePeriod * 1000))
      : undefined;

    const rule: ExpirationRule = {
      id: ruleId,
      policyId,
      resourceId,
      resourceType,
      expiresAt,
      gracePeriodEnds,
      renewalCount: 0,
      metadata,
      status: 'active',
      createdBy,
      createdAt: now,
      updatedAt: now
    };

    // Store in database
    await this.db.query(`
      INSERT INTO expiration_rules (
        id, policy_id, resource_id, resource_type, expires_at, grace_period_ends,
        renewal_count, metadata, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ruleId, policyId, resourceId, resourceType, expiresAt, gracePeriodEnds,
      0, JSON.stringify(metadata || {}), 'active', createdBy, now, now
    ]);

    // Store in Redis for fast lookup if available
    if (this.redisService) {
      const redisClient = await this.redisService.getClient();
      await redisClient.setex(
        `expiration:${resourceType}:${resourceId}`,
        ttl,
        JSON.stringify(rule)
      );
    }

    // Create initial event
    await this.createExpirationEvent(ruleId, resourceId, resourceType, 'created', {
      ttl,
      expiresAt: expiresAt.toISOString()
    });

    await this.auditService.logExpirationRule({
      ruleId,
      action: 'created',
      resourceId,
      resourceType,
      expiresAt,
      createdBy
    });

    return rule;
  }

  /**
   * Check if a resource is expired
   */
  async isExpired(resourceId: string, resourceType: string): Promise<boolean> {

    // Try Redis first for fast lookup
    if (this.redisService) {
      const redisClient = await this.redisService.getClient();
      const exists = await redisClient.exists(`expiration:${resourceType}:${resourceId}`);
      if (exists === 0) {
        return true; // Redis key expired = resource expired
      }
    }

    // Fallback to database
    const rule = await this.getExpirationRule(resourceId, resourceType);
    if (!rule) {
      return true; // No rule = expired
    }

    const now = new Date();
    
    // Check if in grace period
    if (rule.gracePeriodEnds && now <= rule.gracePeriodEnds) {
      return false;
    }

    return now > rule.expiresAt;
  }

  /**
   * Get expiration info for a resource
   */
  async getExpirationInfo(resourceId: string, resourceType: string): Promise<{
    isExpired: boolean;
    expiresAt: Date | null;
    timeRemaining: number;
    status: string;
    canRenew: boolean;
  }> {

    const rule = await this.getExpirationRule(resourceId, resourceType);
    
    if (!rule) {
      return {
        isExpired: true,
        expiresAt: null,
        timeRemaining: 0,
        status: 'not_found',
        canRenew: false
      };
    }

    const now = new Date();
    const timeRemaining = Math.max(0, rule.expiresAt.getTime() - now.getTime()) / 1000;
    const isExpired = await this.isExpired(resourceId, resourceType);
    
    const policy = await this.getPolicy(rule.policyId);
    const canRenew = policy?.autoRenewal && 
                    timeRemaining <= (policy.renewalWindow || 0) && 
                    !isExpired;

    return {
      isExpired,
      expiresAt: rule.expiresAt,
      timeRemaining,
      status: rule.status,
      canRenew
    };
  }

  /**
   * Renew a resource's expiration
   */
  async renewResource(request: RenewalRequest): Promise<RenewalResult> {

    const rule = await this.getExpirationRule(request.resourceId, request.resourceType);
    
    if (!rule) {
      return {
        success: false,
        error: 'Expiration rule not found'
      };
    }

    const policy = await this.getPolicy(rule.policyId);
    if (!policy) {
      return {
        success: false,
        error: 'Expiration policy not found'
      };
    }

    // Check if renewal is allowed
    const now = new Date();
    const timeUntilExpiration = rule.expiresAt.getTime() - now.getTime();
    
    if (timeUntilExpiration > (policy.renewalWindow * 1000)) {
      return {
        success: false,
        error: 'Resource not within renewal window',
        warningMessage: `Renewal only allowed within ${policy.renewalWindow} seconds of expiration`
      };
    }

    // Check maximum renewals
    if (rule.maxRenewals && rule.renewalCount >= rule.maxRenewals) {
      return {
        success: false,
        error: 'Maximum renewal limit reached'
      };
    }

    // Determine new TTL
    const requestedTtl = request.requestedTtl || policy.defaultTtl;
    let newTtl = requestedTtl;

    // Validate against policy limits
    if (policy.maxTtl && newTtl > policy.maxTtl) {
      newTtl = policy.maxTtl;
    }
    if (policy.minTtl && newTtl < policy.minTtl) {
      newTtl = policy.minTtl;
    }

    const newExpiresAt = new Date(now.getTime() + (newTtl * 1000));
    const newGracePeriodEnds = policy.gracePeriod 
      ? new Date(newExpiresAt.getTime() + (policy.gracePeriod * 1000))
      : undefined;

    // Update database
    await this.db.query(`
      UPDATE expiration_rules 
      SET expires_at = ?, grace_period_ends = ?, renewal_count = renewal_count + 1,
          status = 'active', updated_at = ?
      WHERE id = ?
    `, [newExpiresAt, newGracePeriodEnds, now, rule.id]);

    // Update Redis if available
    if (this.redisService) {
      const redisClient = await this.redisService.getClient();
      const updatedRule = { ...rule, expiresAt: newExpiresAt, renewalCount: rule.renewalCount + 1 };
      await redisClient.setex(
        `expiration:${request.resourceType}:${request.resourceId}`,
        newTtl,
        JSON.stringify(updatedRule)
      );
    }

    // Create renewal event
    await this.createExpirationEvent(rule.id, request.resourceId, request.resourceType, 'renewed', {
      oldExpiresAt: rule.expiresAt.toISOString(),
      newExpiresAt: newExpiresAt.toISOString(),
      renewedBy: request.requestedBy,
      reason: request.reason
    });

    await this.auditService.logResourceRenewal({
      resourceId: request.resourceId,
      resourceType: request.resourceType,
      oldExpiresAt: rule.expiresAt,
      newExpiresAt,
      renewedBy: request.requestedBy,
      reason: request.reason
    });

    return {
      success: true,
      newExpiresAt,
      newTtl,
      renewalCount: rule.renewalCount + 1
    };
  }

  /**
   * Revoke a resource (mark as expired immediately)
   */
  async revokeResource(
    resourceId: string, 
    resourceType: string, 
    revokedBy: string, 
    reason?: string
  ): Promise<boolean> {

    const rule = await this.getExpirationRule(resourceId, resourceType);
    
    if (!rule) {
      return false;
    }

    const now = new Date();

    // Update database
    await this.db.query(`
      UPDATE expiration_rules 
      SET status = 'revoked', expires_at = ?, updated_at = ?
      WHERE id = ?
    `, [now, now, rule.id]);

    // Remove from Redis
    if (this.redisService) {
      const redisClient = await this.redisService.getClient();
      await redisClient.del(`expiration:${resourceType}:${resourceId}`);
    }

    // Create revocation event
    await this.createExpirationEvent(rule.id, resourceId, resourceType, 'revoked', {
      revokedBy,
      reason,
      originalExpiresAt: rule.expiresAt.toISOString()
    });

    await this.auditService.logResourceRevocation({
      resourceId,
      resourceType,
      revokedBy,
      reason,
      originalExpiresAt: rule.expiresAt
    });

    return true;
  }

  /**
   * Get expiration statistics
   */
  async getExpirationStats(organizationId?: string): Promise<ExpirationStats> {

    const whereClause = organizationId 
      ? 'WHERE ep.organization_id = ? OR ep.organization_id IS NULL'
      : '';
    const params = organizationId ? [organizationId] : [];

    const [totalStats] = await this.db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN er.status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN er.status = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN er.status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN er.status = 'grace_period' THEN 1 ELSE 0 END) as grace_period,
        SUM(CASE WHEN er.status = 'renewed' THEN 1 ELSE 0 END) as renewed,
        SUM(CASE WHEN er.status = 'revoked' THEN 1 ELSE 0 END) as revoked
      FROM expiration_rules er
      JOIN expiration_policies ep ON er.policy_id = ep.id
      ${whereClause}
    `, params);

    const resourceTypeStats = await this.db.query(`
      SELECT 
        er.resource_type,
        COUNT(*) as count
      FROM expiration_rules er
      JOIN expiration_policies ep ON er.policy_id = ep.id
      ${whereClause}
      GROUP BY er.resource_type
    `, params);

    const upcomingStats = await this.db.query(`
      SELECT
        SUM(CASE WHEN er.expires_at <= DATE_ADD(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as next24Hours,
        SUM(CASE WHEN er.expires_at <= DATE_ADD(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as next7Days,
        SUM(CASE WHEN er.expires_at <= DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as next30Days
      FROM expiration_rules er
      JOIN expiration_policies ep ON er.policy_id = ep.id
      ${whereClause}
      AND er.status = 'active'
    `, params);

    const byResourceType: Record<string, number> = {};
    resourceTypeStats.forEach((stat: any) => {
      byResourceType[stat.resource_type] = stat.count;
    });

    return {
      total: totalStats.total || 0,
      active: totalStats.active || 0,
      warning: totalStats.warning || 0,
      expired: totalStats.expired || 0,
      gracePeriod: totalStats.grace_period || 0,
      renewed: totalStats.renewed || 0,
      revoked: totalStats.revoked || 0,
      byResourceType,
      upcomingExpirations: {
        next24Hours: upcomingStats[0]?.next24Hours || 0,
        next7Days: upcomingStats[0]?.next7Days || 0,
        next30Days: upcomingStats[0]?.next30Days || 0
      }
    };
  }

  /**
   * Get upcoming expiration warnings
   */
  async getUpcomingWarnings(organizationId?: string, limit = 100): Promise<ExpirationWarning[]> {

    const whereClause = organizationId 
      ? 'AND (ep.organization_id = ? OR ep.organization_id IS NULL)'
      : '';
    const params = organizationId ? [organizationId, limit] : [limit];

    const warnings = await this.db.query(`
      SELECT 
        er.resource_id,
        er.resource_type,
        er.expires_at,
        TIMESTAMPDIFF(SECOND, NOW(), er.expires_at) as time_remaining,
        ep.warning_threshold,
        ep.auto_renewal,
        ep.renewal_window,
        er.created_by as user_id,
        ep.organization_id
      FROM expiration_rules er
      JOIN expiration_policies ep ON er.policy_id = ep.id
      WHERE er.status = 'active' 
        AND er.expires_at > NOW()
        AND TIMESTAMPDIFF(SECOND, NOW(), er.expires_at) <= ep.warning_threshold
        ${whereClause}
      ORDER BY er.expires_at ASC
      LIMIT ?
    `, params);

    return warnings.map((w: any) => {
      const timeRemaining = w.time_remaining;
      let warningLevel: 'info' | 'warning' | 'critical' = 'info';
      
      if (timeRemaining <= 3600) { // 1 hour
        warningLevel = 'critical';
      } else if (timeRemaining <= 86400) { // 1 day
        warningLevel = 'warning';
      }

      return {
        resourceId: w.resource_id,
        resourceType: w.resource_type,
        expiresAt: w.expires_at,
        timeRemaining,
        warningLevel,
        canRenew: w.auto_renewal && timeRemaining <= w.renewal_window,
        renewalUrl: w.auto_renewal ? `/api/auth/renew/${w.resource_type}/${w.resource_id}` : undefined,
        userId: w.user_id,
        organizationId: w.organization_id
      };
    });
  }

  /**
   * Clean up expired resources
   */
  async cleanupExpiredResources(): Promise<{ cleaned: number; errors: number }> {

    let cleaned = 0;
    let errors = 0;

    try {
      // Get all expired rules
      const expiredRules = await this.db.query(`
        SELECT er.*, ep.grace_period
        FROM expiration_rules er
        JOIN expiration_policies ep ON er.policy_id = ep.id
        WHERE er.status IN ('active', 'warning', 'grace_period')
          AND (
            (ep.grace_period IS NULL AND er.expires_at <= NOW()) 
            OR (ep.grace_period IS NOT NULL AND er.grace_period_ends <= NOW())

      `);

      for (const rule of expiredRules) {
        try {
          // Mark as expired
          await this.db.query(`
            UPDATE expiration_rules 
            SET status = 'expired', updated_at = NOW()
            WHERE id = ?
          `, [rule.id]);

          // Remove from Redis
          if (this.redisService) {
            const redisClient = await this.redisService.getClient();
            await redisClient.del(`expiration:${rule.resource_type}:${rule.resource_id}`);
          }

          // Create expiration event
          await this.createExpirationEvent(
            rule.id, 
            rule.resource_id, 
            rule.resource_type, 
            'expired', 
            { cleanupTime: new Date().toISOString() }
          );

          cleaned++;
        } catch (error) {
          console.error(`Failed to cleanup expired rule ${rule.id}:`, error);
          errors++;
        }
      }

      console.log(`Cleanup completed: ${cleaned} resources cleaned, ${errors} errors`);
    } catch (error) {
      console.error('Failed to cleanup expired resources:', error);
      errors++;
    }

    return { cleaned, errors };
  }

  /**
   * Private helper methods
   */

  private async getPolicy(policyId: string): Promise<ExpirationPolicy | null> {

    const results = await this.db.query(
      'SELECT * FROM expiration_policies WHERE id = ? AND is_active = 1',
      [policyId]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return {
      id: row.id,
      name: row.name,
      resourceType: row.resource_type,
      defaultTtl: row.default_ttl,
      maxTtl: row.max_ttl,
      minTtl: row.min_ttl,
      gracePeriod: row.grace_period,
      warningThreshold: row.warning_threshold,
      autoRenewal: Boolean(row.auto_renewal),
      renewalWindow: row.renewal_window,
      organizationId: row.organization_id,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private async getExpirationRule(resourceId: string, resourceType: string): Promise<ExpirationRule | null> {

    const results = await this.db.query(`
      SELECT * FROM expiration_rules 
      WHERE resource_id = ? AND resource_type = ?
      ORDER BY created_at DESC 
      LIMIT 1
    `, [resourceId, resourceType]);
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return {
      id: row.id,
      policyId: row.policy_id,
      resourceId: row.resource_id,
      resourceType: row.resource_type,
      expiresAt: row.expires_at,
      gracePeriodEnds: row.grace_period_ends,
      lastWarningAt: row.last_warning_at,
      renewalCount: row.renewal_count,
      maxRenewals: row.max_renewals,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private async createExpirationEvent(
    ruleId: string, 
    resourceId: string, 
    resourceType: string,
    eventType: ExpirationEvent['eventType'],
    metadata?: Record<string, unknown>
  ): Promise<void> {

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await this.db.query(`
      INSERT INTO expiration_events (
        id, rule_id, resource_id, resource_type, event_type, timestamp, metadata, notification_sent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [eventId, ruleId, resourceId, resourceType, eventType, now, JSON.stringify(metadata || {}), false]);
  }

  private async ensureDefaultPolicies(): Promise<void> {

    const defaultPolicies = [
      {
        name: 'Default JWT Token Policy',
        resourceType: 'jwt_token' as const,
        defaultTtl: 3600, // 1 hour
        maxTtl: 86400, // 24 hours
        minTtl: 300, // 5 minutes
        gracePeriod: 300, // 5 minutes
        warningThreshold: 600, // 10 minutes
        autoRenewal: true,
        renewalWindow: 1800, // 30 minutes
        isActive: true
  }
      {
        name: 'Default API Key Policy',
        resourceType: 'api_key' as const,
        defaultTtl: 2592000, // 30 days
        maxTtl: 31536000, // 1 year
        minTtl: 86400, // 1 day
        warningThreshold: 604800, // 7 days
        autoRenewal: false,
        renewalWindow: 1209600, // 14 days
        isActive: true
  }
      {
        name: 'Default Session Policy',
        resourceType: 'session' as const,
        defaultTtl: 7200, // 2 hours
        maxTtl: 43200, // 12 hours
        minTtl: 900, // 15 minutes
        gracePeriod: 300, // 5 minutes
        warningThreshold: 900, // 15 minutes
        autoRenewal: true,
        renewalWindow: 3600, // 1 hour
        isActive: true
      }
    ];

    for (const policy of defaultPolicies) {
      const existing = await this.db.query(
        'SELECT id FROM expiration_policies WHERE resource_type = ? AND organization_id IS NULL',
        [policy.resourceType]
      );
      
      if (existing.length === 0) {
        await this.createPolicy(policy);
      }
    }
  }

  private startBackgroundProcesses(): void {
    // Cleanup expired resources every hour
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupExpiredResources();
    }, 60 * 60 * 1000);

    // Check for warnings every 15 minutes
    this.warningInterval = setInterval(async () => {
      await this.processExpirationWarnings();
    }, 15 * 60 * 1000);

    // Set up cron job for daily cleanup at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.cleanupExpiredResources();
      await this.cleanupOldEvents();
    });
  }

  private async processExpirationWarnings(): Promise<void> {

    try {
      const warnings = await this.getUpcomingWarnings(undefined, 50);
      
      for (const warning of warnings) {
        // Create warning event if not already warned recently
        const rule = await this.getExpirationRule(warning.resourceId, warning.resourceType);
        if (rule && (!rule.lastWarningAt || 
            Date.now() - rule.lastWarningAt.getTime() > 3600000)) { // 1 hour
          
          await this.createExpirationEvent(
            rule.id, 
            warning.resourceId, 
            warning.resourceType, 
            'warning',
            { 
              warningLevel: warning.warningLevel,
              timeRemaining: warning.timeRemaining
            }
          );

          // Update last warning time
          await this.db.query(
            'UPDATE expiration_rules SET last_warning_at = NOW() WHERE id = ?',
            [rule.id]
          );
        }
      }
    } catch (error) {
      console.error('Failed to process expiration warnings:', error);
    }
  }

  private async cleanupOldEvents(): Promise<void> {

    try {
      // Delete events older than 90 days
      const result = await this.db.query(`
        DELETE FROM expiration_events 
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY)
      `);
      
      console.log(`Cleaned up ${result.affectedRows} old expiration events`);
    } catch (error) {
      console.error('Failed to cleanup old events:', error);
    }
  }

  private async setupRedisExpirationListeners(): Promise<void> {

    if (!this.redisService) return;

    try {
      const redisClient = await this.redisService.getClient();
      
      // Enable keyspace notifications for expired events
      await redisClient.config('SET', 'notify-keyspace-events', 'Ex');
      
      // Subscribe to expiration events
      const subscriber = redisClient.duplicate();
      await subscriber.psubscribe('__keyevent@*__:expired');
      
      subscriber.on('pmessage', async (pattern, channel, key) => {
        if (key.startsWith('expiration:')) {
          const [, resourceType, resourceId] = key.split(':');
          console.log(`Redis key expired: ${resourceType}:${resourceId}`);
          
          // Mark as expired in database
          const rule = await this.getExpirationRule(resourceId, resourceType);
          if (rule) {
            await this.db.query(`
              UPDATE expiration_rules 
              SET status = 'expired', updated_at = NOW()
              WHERE id = ?
            `, [rule.id]);
            
            await this.createExpirationEvent(
              rule.id, resourceId, resourceType, 'expired',
              { source: 'redis_expiration' }
            );
          }
        }
      });
    } catch (error) {
      console.error('Failed to setup Redis expiration listeners:', error);
    }
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.warningInterval) {
      clearInterval(this.warningInterval);
    }
    
    this.isInitialized = false;
    console.log('ExpirationManagementService shut down');
  }
}

export default ExpirationManagementService;