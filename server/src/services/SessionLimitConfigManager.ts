/**
 * SessionLimitConfigManager - Configuration management for session limits
 * 
 * Handles dynamic configuration loading, environment variable overrides,
 * real-time updates, and configuration validation
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { SessionLimitConfig, OrganizationLimitConfig, UserLimitOverride } from './SessionLimitManager';
import { z } from 'zod';

// Configuration schema for validation
const SessionLimitConfigSchema = z.object({
  maxConcurrentSessionsPerUser: z.number().min(1).max(100),
  maxConcurrentSessionsPerIP: z.number().min(1).max(1000),
  maxConcurrentSessionsPerOrganization: z.number().min(1).max(10000),
  maxConcurrentSessionsPerDevice: z.number().min(1).max(20),
  maxConcurrentSessionsPerCountry: z.number().min(1).max(100000),
  
  idleTimeoutMinutes: z.number().min(5).max(1440), // 5 min to 24 hours
  absoluteTimeoutHours: z.number().min(1).max(168), // 1 hour to 7 days
  sessionRenewalThresholdMinutes: z.number().min(1).max(60),
  
  enableBusinessHoursLimits: z.boolean(),
  businessHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  businessHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  businessHoursTimezone: z.string(),
  businessHoursMaxSessions: z.number().min(1).max(50),
  offHoursMaxSessions: z.number().min(1).max(50),
  
  enableGeographicLimits: z.boolean(),
  allowedCountries: z.array(z.string()),
  blockedCountries: z.array(z.string()),
  
  enableDeviceLimits: z.boolean(),
  maxDevicesPerUser: z.number().min(1).max(20),
  deviceTrustDuration: z.number().min(1).max(365),
  
  conflictResolution: z.enum(['kick_oldest', 'deny_new', 'prompt_user']),
  gracePeriotMinutes: z.number().min(0).max(60),
  
  enableSessionPriority: z.boolean(),
  adminSessionsHavePriority: z.boolean(),
  premiumUserSessionsHavePriority: z.boolean(),
  
  enableSuspiciousActivityDetection: z.boolean(),
  rapidSessionCreationThreshold: z.number().min(1).max(100),
  suspiciousLocationChangeKm: z.number().min(10).max(5000),
  suspiciousLocationChangeMinutes: z.number().min(1).max(120),
  
  enableRealTimeMonitoring: z.boolean(),
  alertThresholds: z.object({
    highConcurrentSessions: z.number().min(1).max(100),
    suspiciousActivity: z.number().min(1).max(50),
    geographicAnomalies: z.number().min(1).max(20)
  })
});

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'performance' | 'compliance' | 'custom';
  config: Partial<SessionLimitConfig>;
  tags: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationAuditLog {
  id: string;
  configId: string;
  action: 'created' | 'updated' | 'deleted' | 'applied';
  changes: Record<string, { old: any; new: any }>;
  userId: string;
  timestamp: Date;
  reason?: string;
}

export class SessionLimitConfigManager extends EventEmitter {
  private dbService: DatabaseService;
  private redisService: RedisService;
  
  private configCache = new Map<string, SessionLimitConfig>();
  private templateCache = new Map<string, ConfigurationTemplate>();
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CONFIG_VERSION_KEY = 'session_limits:config_version';
  
  constructor(
    dbService: DatabaseService,
    redisService: RedisService
  ) {
    super();
    this.dbService = dbService;
    this.redisService = redisService;
  }
  
  /**
   * Load configuration with environment variable overrides
   */
  async loadConfiguration(
    scope: 'global' | 'organization' | 'user',
    targetId?: string
  ): Promise<SessionLimitConfig> {
    try {
      const cacheKey = `${scope}:${targetId || 'default'}`;
      
      // Check cache first
      const cached = this.configCache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Load base configuration
      let config = this.getDefaultConfiguration();
      
      // Apply database configuration
      const dbConfig = await this.loadFromDatabase(scope, targetId);
      if (dbConfig) {
        config = { ...config, ...dbConfig };
      }
      
      // Apply environment variable overrides
      config = this.applyEnvironmentOverrides(config);
      
      // Validate configuration
      const validatedConfig = this.validateConfiguration(config);
      
      // Cache the configuration
      this.configCache.set(cacheKey, validatedConfig);
      
      return validatedConfig;
      
    } catch (error) {
      console.error(`Error loading configuration for ${scope}:${targetId}:`, error);
      return this.getDefaultConfiguration();
    }
  }
  
  /**
   * Save configuration with validation and audit logging
   */
  async saveConfiguration(
    config: Partial<SessionLimitConfig>,
    scope: 'global' | 'organization' | 'user',
    targetId: string | null,
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Validate configuration
      const validatedConfig = this.validateConfiguration(config);
      
      // Load existing configuration for comparison
      const existingConfig = await this.loadFromDatabase(scope, targetId);
      
      // Save to database
      await this.saveToDatabase(validatedConfig, scope, targetId, userId);
      
      // Clear cache
      const cacheKey = `${scope}:${targetId || 'default'}`;
      this.configCache.delete(cacheKey);
      
      // Invalidate Redis cache
      await this.invalidateRedisCache(scope, targetId);
      
      // Log changes
      if (existingConfig) {
        await this.logConfigurationChanges(
          existingConfig,
          validatedConfig,
          scope,
          targetId,
          userId,
          reason
        );
      }
      
      // Increment configuration version
      await this.incrementConfigVersion();
      
      // Emit configuration change event
      this.emit('configuration_changed', {
        scope,
        targetId,
        config: validatedConfig,
        userId,
        reason
      });
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }
  }
  
  /**
   * Get configuration templates
   */
  async getConfigurationTemplates(category?: string): Promise<ConfigurationTemplate[]> {
    try {
      let query = 'SELECT * FROM session_limit_config_templates';
      const params: any[] = [];
      
      if (category) {
        query += ' WHERE category = $1';
        params.push(category);
      }
      
      query += ' ORDER BY is_default DESC, name ASC';
      
      const result = await this.dbService.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        config: row.config,
        tags: row.tags || [],
        isDefault: row.is_default,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
    } catch (error) {
      console.error('Error getting configuration templates:', error);
      return [];
    }
  }
  
  /**
   * Create configuration template
   */
  async createTemplate(
    template: Omit<ConfigurationTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<string> {
    try {
      const templateId = require('crypto').randomUUID();
      const now = new Date();
      
      // Validate template configuration
      this.validateConfiguration(template.config);
      
      await this.dbService.query(`
        INSERT INTO session_limit_config_templates (
          id, name, description, category, config, tags, is_default, 
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        templateId,
        template.name,
        template.description,
        template.category,
        JSON.stringify(template.config),
        JSON.stringify(template.tags),
        template.isDefault,
        userId,
        now,
        now
      ]);
      
      this.emit('template_created', {
        templateId,
        template,
        userId
      });
      
      return templateId;
      
    } catch (error) {
      console.error('Error creating configuration template:', error);
      throw error;
    }
  }
  
  /**
   * Apply configuration template
   */
  async applyTemplate(
    templateId: string,
    scope: 'global' | 'organization' | 'user',
    targetId: string | null,
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Get template
      const templateResult = await this.dbService.query(
        'SELECT config FROM session_limit_config_templates WHERE id = $1',
        [templateId]
      );
      
      if (templateResult.rows.length === 0) {
        throw new Error('Template not found');
      }
      
      const templateConfig = templateResult.rows[0].config;
      
      // Apply template configuration
      await this.saveConfiguration(
        templateConfig,
        scope,
        targetId,
        userId,
        reason || `Applied template ${templateId}`
      );
      
      this.emit('template_applied', {
        templateId,
        scope,
        targetId,
        userId,
        reason
      });
      
    } catch (error) {
      console.error('Error applying configuration template:', error);
      throw error;
    }
  }
  
  /**
   * Get configuration history
   */
  async getConfigurationHistory(
    scope: string,
    targetId: string | null,
    limit: number = 50
  ): Promise<ConfigurationAuditLog[]> {
    try {
      const result = await this.dbService.query(`
        SELECT * FROM session_limit_config_audit_log
        WHERE scope = $1 AND (target_id = $2 OR ($2 IS NULL AND target_id IS NULL))
        ORDER BY timestamp DESC
        LIMIT $3
      `, [scope, targetId, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        configId: row.config_id,
        action: row.action,
        changes: row.changes,
        userId: row.user_id,
        timestamp: row.timestamp,
        reason: row.reason
      }));
      
    } catch (error) {
      console.error('Error getting configuration history:', error);
      return [];
    }
  }
  
  /**
   * Validate configuration against schema
   */
  validateConfiguration(config: Partial<SessionLimitConfig>): SessionLimitConfig {
    try {
      // Merge with defaults for validation
      const configWithDefaults = { ...this.getDefaultConfiguration(), ...config };
      
      // Validate using Zod schema
      const validatedConfig = SessionLimitConfigSchema.parse(configWithDefaults);
      
      // Additional business logic validation
      this.validateBusinessLogic(validatedConfig);
      
      return validatedConfig;
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Configuration validation failed: ${validationErrors}`);
      }
      throw error;
    }
  }
  
  /**
   * Get effective configuration for a user/organization
   */
  async getEffectiveConfiguration(
    userId: string,
    organizationId?: string
  ): Promise<SessionLimitConfig> {
    try {
      // Start with global configuration
      let config = await this.loadConfiguration('global');
      
      // Apply organization-specific configuration
      if (organizationId) {
        const orgConfig = await this.loadConfiguration('organization', organizationId);
        config = this.mergeConfigurations(config, orgConfig);
      }
      
      // Apply user-specific overrides
      const userConfig = await this.loadConfiguration('user', userId);
      config = this.mergeConfigurations(config, userConfig);
      
      return config;
      
    } catch (error) {
      console.error('Error getting effective configuration:', error);
      return this.getDefaultConfiguration();
    }
  }
  
  /**
   * Real-time configuration updates via WebSocket
   */
  async subscribeToConfigUpdates(
    connectionId: string,
    scope: string,
    targetId?: string
  ): Promise<void> {
    // Implementation would depend on WebSocket integration
    // This is a placeholder for the real-time update system
    console.log(`Subscribed ${connectionId} to config updates for ${scope}:${targetId}`);
  }
  
  private getDefaultConfiguration(): SessionLimitConfig {
    return {
      maxConcurrentSessionsPerUser: parseInt(process.env.MAX_SESSIONS_PER_USER || '5'),
      maxConcurrentSessionsPerIP: parseInt(process.env.MAX_SESSIONS_PER_IP || '10'),
      maxConcurrentSessionsPerOrganization: parseInt(process.env.MAX_SESSIONS_PER_ORG || '100'),
      maxConcurrentSessionsPerDevice: parseInt(process.env.MAX_SESSIONS_PER_DEVICE || '3'),
      maxConcurrentSessionsPerCountry: parseInt(process.env.MAX_SESSIONS_PER_COUNTRY || '1000'),
      
      idleTimeoutMinutes: parseInt(process.env.IDLE_TIMEOUT_MINUTES || '60'),
      absoluteTimeoutHours: parseInt(process.env.ABSOLUTE_TIMEOUT_HOURS || '12'),
      sessionRenewalThresholdMinutes: parseInt(process.env.SESSION_RENEWAL_THRESHOLD || '15'),
      
      enableBusinessHoursLimits: process.env.ENABLE_BUSINESS_HOURS === 'true',
      businessHoursStart: process.env.BUSINESS_HOURS_START || '09:00',
      businessHoursEnd: process.env.BUSINESS_HOURS_END || '17:00',
      businessHoursTimezone: process.env.BUSINESS_HOURS_TIMEZONE || 'UTC',
      businessHoursMaxSessions: parseInt(process.env.BUSINESS_HOURS_MAX_SESSIONS || '3'),
      offHoursMaxSessions: parseInt(process.env.OFF_HOURS_MAX_SESSIONS || '2'),
      
      enableGeographicLimits: process.env.ENABLE_GEOGRAPHIC_LIMITS === 'true',
      allowedCountries: process.env.ALLOWED_COUNTRIES?.split(',') || [],
      blockedCountries: process.env.BLOCKED_COUNTRIES?.split(',') || [],
      
      enableDeviceLimits: process.env.ENABLE_DEVICE_LIMITS === 'true',
      maxDevicesPerUser: parseInt(process.env.MAX_DEVICES_PER_USER || '5'),
      deviceTrustDuration: parseInt(process.env.DEVICE_TRUST_DURATION || '30'),
      
      conflictResolution: (process.env.CONFLICT_RESOLUTION as any) || 'kick_oldest',
      gracePeriotMinutes: parseInt(process.env.GRACE_PERIOD_MINUTES || '5'),
      
      enableSessionPriority: process.env.ENABLE_SESSION_PRIORITY !== 'false',
      adminSessionsHavePriority: process.env.ADMIN_SESSIONS_PRIORITY !== 'false',
      premiumUserSessionsHavePriority: process.env.PREMIUM_SESSIONS_PRIORITY !== 'false',
      
      enableSuspiciousActivityDetection: process.env.ENABLE_SUSPICIOUS_DETECTION !== 'false',
      rapidSessionCreationThreshold: parseInt(process.env.RAPID_SESSION_THRESHOLD || '10'),
      suspiciousLocationChangeKm: parseInt(process.env.SUSPICIOUS_LOCATION_CHANGE_KM || '500'),
      suspiciousLocationChangeMinutes: parseInt(process.env.SUSPICIOUS_LOCATION_CHANGE_MINUTES || '15'),
      
      enableRealTimeMonitoring: process.env.ENABLE_REALTIME_MONITORING !== 'false',
      alertThresholds: {
        highConcurrentSessions: parseInt(process.env.ALERT_HIGH_SESSIONS || '80'),
        suspiciousActivity: parseInt(process.env.ALERT_SUSPICIOUS_ACTIVITY || '5'),
        geographicAnomalies: parseInt(process.env.ALERT_GEOGRAPHIC_ANOMALIES || '3')
      }
    };
  }
  
  private applyEnvironmentOverrides(config: SessionLimitConfig): SessionLimitConfig {
    // Environment variables take precedence over database configuration
    const envConfig = this.getDefaultConfiguration();
    
    // Only override values that are explicitly set in environment
    Object.keys(envConfig).forEach(key => {
      const envKey = this.camelToSnakeCase(key).toUpperCase();
      if (process.env[envKey] !== undefined) {
        (config as any)[key] = (envConfig as any)[key];
      }
    });
    
    return config;
  }
  
  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
  
  private async loadFromDatabase(
    scope: string,
    targetId: string | null
  ): Promise<Partial<SessionLimitConfig> | null> {
    try {
      const result = await this.dbService.query(`
        SELECT config FROM session_limit_configs
        WHERE scope = $1 AND (target_id = $2 OR ($2 IS NULL AND target_id IS NULL))
        ORDER BY updated_at DESC
        LIMIT 1
      `, [scope, targetId]);
      
      return result.rows.length > 0 ? result.rows[0].config : null;
      
    } catch (error) {
      console.error('Error loading configuration from database:', error);
      return null;
    }
  }
  
  private async saveToDatabase(
    config: SessionLimitConfig,
    scope: string,
    targetId: string | null,
    userId: string
  ): Promise<void> {
    const configId = targetId ? `${scope}_${targetId}` : scope;
    const now = new Date();
    
    await this.dbService.query(`
      INSERT INTO session_limit_configs (
        id, scope, target_id, config, updated_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (scope, target_id)
      DO UPDATE SET config = $4, updated_by = $5, updated_at = $6
    `, [configId, scope, targetId, JSON.stringify(config), userId, now]);
  }
  
  private validateBusinessLogic(config: SessionLimitConfig): void {
    // Business hours validation
    if (config.enableBusinessHoursLimits) {
      const startTime = this.parseTime(config.businessHoursStart);
      const endTime = this.parseTime(config.businessHoursEnd);
      
      if (startTime >= endTime) {
        throw new Error('Business hours start time must be before end time');
      }
    }
    
    // Geographic limits validation
    if (config.enableGeographicLimits) {
      const hasAllowedCountries = config.allowedCountries.length > 0;
      const hasBlockedCountries = config.blockedCountries.length > 0;
      
      if (hasAllowedCountries && hasBlockedCountries) {
        throw new Error('Cannot specify both allowed and blocked countries');
      }
    }
    
    // Timeout validation
    if (config.idleTimeoutMinutes >= config.absoluteTimeoutHours * 60) {
      throw new Error('Idle timeout cannot be greater than absolute timeout');
    }
  }
  
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  private mergeConfigurations(
    base: SessionLimitConfig,
    override: Partial<SessionLimitConfig>
  ): SessionLimitConfig {
    return { ...base, ...override };
  }
  
  private async invalidateRedisCache(scope: string, targetId: string | null): Promise<void> {
    const pattern = `session_limits:config:${scope}:${targetId || '*'}`;
    await this.redisService.invalidateCache(pattern);
  }
  
  private async incrementConfigVersion(): Promise<void> {
    await this.redisService.incr(this.CONFIG_VERSION_KEY);
  }
  
  private async logConfigurationChanges(
    oldConfig: SessionLimitConfig,
    newConfig: SessionLimitConfig,
    scope: string,
    targetId: string | null,
    userId: string,
    reason?: string
  ): Promise<void> {
    const changes: Record<string, { old: any; new: any }> = {};
    
    Object.keys(newConfig).forEach(key => {
      const oldValue = (oldConfig as any)[key];
      const newValue = (newConfig as any)[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });
    
    if (Object.keys(changes).length > 0) {
      await this.dbService.query(`
        INSERT INTO session_limit_config_audit_log (
          id, config_id, action, changes, user_id, timestamp, reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        require('crypto').randomUUID(),
        targetId ? `${scope}_${targetId}` : scope,
        'updated',
        JSON.stringify(changes),
        userId,
        new Date(),
        reason
      ]);
    }
  }
}