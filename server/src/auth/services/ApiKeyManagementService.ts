/**
 * API Key Management Service - Epic 19 Security Enhancement
 * 
 * Advanced API key lifecycle management with scoped permissions, rate limiting,
 * rotation policies, and comprehensive audit logging for Epic 19 Security & 
 * Compliance Framework.
 * 
 * Task: T-1752989144571 - Implement backend API for Authentication Enhancement & Security Hardening
 */

import crypto from 'crypto';
import { DatabaseService } from '../../database/DatabaseService';
import { AuditService } from './AuditService';
import { RateLimitService } from './RateLimitService';

export interface ApiKeyConfig {
  keyLength: number;
  defaultExpirationDays: number;
  maxKeysPerUser: number;
  rotationWarningDays: number;
  enforceRotation: boolean;
  allowedScopes: string[];
  rateLimitDefaults: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export interface ApiKey {
  keyId: string;
  userId: string;
  keyHash: string; // Never store the actual key
  keyPrefix: string; // First 8 characters for identification
  name: string;
  description?: string;
  scopes: string[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  status: 'active' | 'revoked' | 'expired' | 'suspended';
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  ipWhitelist?: string[];
  metadata: {
    createdBy: string;
    environment: string;
    purpose: string;
    rotationCount: number;
  };
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  scopes: string[];
  expirationDays?: number;
  rateLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  ipWhitelist?: string[];
  purpose: string;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  keyId?: string;
  userId?: string;
  scopes?: string[];
  rateLimitStatus?: {
    allowed: boolean;
    remaining: {
      minute: number;
      hour: number;
      day: number;
    };
    resetTimes: {
      minute: Date;
      hour: Date;
      day: Date;
    };
  };
  error?: string;
}

export class ApiKeyManagementService {
  private config: ApiKeyConfig;
  private keyCache: Map<string, { key: ApiKey; cachedAt: Date }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private databaseService: DatabaseService,
    private auditService: AuditService,
    private rateLimitService: RateLimitService,
    config: Partial<ApiKeyConfig> = {}
  ) {
    this.config = {
      keyLength: config.keyLength || 64,
      defaultExpirationDays: config.defaultExpirationDays || 365,
      maxKeysPerUser: config.maxKeysPerUser || 10,
      rotationWarningDays: config.rotationWarningDays || 30,
      enforceRotation: config.enforceRotation ?? true,
      allowedScopes: config.allowedScopes || [
        'read:user',
        'write:user',
        'read:graphs',
        'write:graphs',
        'read:analytics',
        'admin:users',
        'admin:system'
      ],
      rateLimitDefaults: {
        requestsPerMinute: config.rateLimitDefaults?.requestsPerMinute || 100,
        requestsPerHour: config.rateLimitDefaults?.requestsPerHour || 3000,
        requestsPerDay: config.rateLimitDefaults?.requestsPerDay || 50000
      }
    };
  }

  /**
   * Create a new API key
   */
  async createApiKey(
    userId: string,
    request: CreateApiKeyRequest,
    createdBy: string
  ): Promise<{ apiKey: ApiKey; rawKey: string }> {
    // Validate scopes
    const invalidScopes = request.scopes.filter(scope => !this.config.allowedScopes.includes(scope));
    if (invalidScopes.length > 0) {
      throw new Error(`Invalid scopes: ${invalidScopes.join(', ')}`);
    }

    // Check key limit for user
    const existingKeys = await this.getUserApiKeys(userId, { includeInactive: false });
    if (existingKeys.length >= this.config.maxKeysPerUser) {
      throw new Error(`Maximum API keys limit reached (${this.config.maxKeysPerUser})`);
    }

    // Generate secure API key
    const rawKey = this.generateApiKey();
    const keyHash = this.hashApiKey(rawKey);
    const keyPrefix = rawKey.substring(0, 8);
    const keyId = crypto.randomUUID();

    const expirationDays = request.expirationDays || this.config.defaultExpirationDays;
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

    const apiKey: ApiKey = {
      keyId,
      userId,
      keyHash,
      keyPrefix,
      name: request.name,
      description: request.description,
      scopes: request.scopes,
      createdAt: new Date(),
      expiresAt,
      status: 'active',
      rateLimits: {
        requestsPerMinute: request.rateLimits?.requestsPerMinute || this.config.rateLimitDefaults.requestsPerMinute,
        requestsPerHour: request.rateLimits?.requestsPerHour || this.config.rateLimitDefaults.requestsPerHour,
        requestsPerDay: request.rateLimits?.requestsPerDay || this.config.rateLimitDefaults.requestsPerDay
      },
      ipWhitelist: request.ipWhitelist,
      metadata: {
        createdBy,
        environment: process.env.NODE_ENV || 'development',
        purpose: request.purpose,
        rotationCount: 0
      }
    };

    // Store in database
    await this.storeApiKey(apiKey);

    // Clear cache for user
    this.clearUserCache(userId);

    await this.auditService.logEvent({
      eventType: 'API_KEY_CREATED',
      userId,
      details: {
        keyId,
        keyPrefix,
        name: request.name,
        scopes: request.scopes,
        expiresAt: expiresAt.toISOString(),
        purpose: request.purpose,
        createdBy
      },
      riskLevel: 'MEDIUM',
      compliance: {
        frameworks: ['SOC2', 'ISO27001'],
        requirements: ['access_control', 'key_management'],
        evidenceLevel: 'ENHANCED'
      }
    });

    return { apiKey, rawKey };
  }

  /**
   * Validate API key and check permissions
   */
  async validateApiKey(
    rawKey: string,
    requiredScope?: string,
    ipAddress?: string
  ): Promise<ApiKeyValidationResult> {
    try {
      const keyHash = this.hashApiKey(rawKey);
      const keyPrefix = rawKey.substring(0, 8);

      // Try cache first
      const cachedKey = await this.getCachedKey(keyHash);
      let apiKey = cachedKey;

      if (!apiKey) {
        // Fetch from database
        apiKey = await this.getApiKeyByHash(keyHash);
        if (apiKey) {
          this.cacheKey(apiKey);
        }
      }

      if (!apiKey) {
        await this.auditService.logEvent({
          eventType: 'API_KEY_VALIDATION_FAILED',
          details: {
            keyPrefix,
            reason: 'key_not_found',
            ipAddress
          },
          riskLevel: 'HIGH',
          compliance: {
            frameworks: ['SOC2'],
            requirements: ['access_control'],
            evidenceLevel: 'STANDARD'
          }
        });
        return { valid: false, error: 'Invalid API key' };
      }

      // Check status
      if (apiKey.status !== 'active') {
        await this.auditService.logEvent({
          eventType: 'API_KEY_VALIDATION_FAILED',
          userId: apiKey.userId,
          details: {
            keyId: apiKey.keyId,
            keyPrefix,
            reason: 'key_inactive',
            status: apiKey.status,
            ipAddress
          },
          riskLevel: 'MEDIUM',
          compliance: {
            frameworks: ['SOC2'],
            requirements: ['access_control'],
            evidenceLevel: 'STANDARD'
          }
        });
        return { valid: false, error: `API key is ${apiKey.status}` };
      }

      // Check expiration
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        await this.updateApiKeyStatus(apiKey.keyId, 'expired');
        await this.auditService.logEvent({
          eventType: 'API_KEY_EXPIRED',
          userId: apiKey.userId,
          details: {
            keyId: apiKey.keyId,
            keyPrefix,
            expiresAt: apiKey.expiresAt.toISOString(),
            ipAddress
          },
          riskLevel: 'MEDIUM',
          compliance: {
            frameworks: ['SOC2'],
            requirements: ['access_control'],
            evidenceLevel: 'STANDARD'
          }
        });
        return { valid: false, error: 'API key has expired' };
      }

      // Check IP whitelist
      if (apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0 && ipAddress) {
        if (!apiKey.ipWhitelist.includes(ipAddress)) {
          await this.auditService.logEvent({
            eventType: 'API_KEY_IP_BLOCKED',
            userId: apiKey.userId,
            details: {
              keyId: apiKey.keyId,
              keyPrefix,
              ipAddress,
              allowedIPs: apiKey.ipWhitelist
            },
            riskLevel: 'HIGH',
            compliance: {
              frameworks: ['SOC2'],
              requirements: ['access_control'],
              evidenceLevel: 'ENHANCED'
            }
          });
          return { valid: false, error: 'IP address not allowed' };
        }
      }

      // Check scope if required
      if (requiredScope && !apiKey.scopes.includes(requiredScope)) {
        await this.auditService.logEvent({
          eventType: 'API_KEY_SCOPE_DENIED',
          userId: apiKey.userId,
          details: {
            keyId: apiKey.keyId,
            keyPrefix,
            requiredScope,
            availableScopes: apiKey.scopes,
            ipAddress
          },
          riskLevel: 'MEDIUM',
          compliance: {
            frameworks: ['SOC2'],
            requirements: ['access_control'],
            evidenceLevel: 'STANDARD'
          }
        });
        return { valid: false, error: 'Insufficient scope permissions' };
      }

      // Check rate limits
      const rateLimitStatus = await this.checkRateLimits(apiKey, ipAddress);
      if (!rateLimitStatus.allowed) {
        await this.auditService.logEvent({
          eventType: 'API_KEY_RATE_LIMITED',
          userId: apiKey.userId,
          details: {
            keyId: apiKey.keyId,
            keyPrefix,
            rateLimits: apiKey.rateLimits,
            ipAddress
          },
          riskLevel: 'LOW',
          compliance: {
            frameworks: ['SOC2'],
            requirements: ['access_control'],
            evidenceLevel: 'STANDARD'
          }
        });
        return { 
          valid: false, 
          error: 'Rate limit exceeded',
          rateLimitStatus
        };
      }

      // Update last used timestamp
      await this.updateLastUsed(apiKey.keyId);

      // Log successful usage (at INFO level to avoid spam)
      await this.auditService.logEvent({
        eventType: 'API_KEY_USED',
        userId: apiKey.userId,
        details: {
          keyId: apiKey.keyId,
          keyPrefix,
          scope: requiredScope,
          ipAddress
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['access_control'],
          evidenceLevel: 'STANDARD'
        }
      });

      return {
        valid: true,
        keyId: apiKey.keyId,
        userId: apiKey.userId,
        scopes: apiKey.scopes,
        rateLimitStatus
      };

    } catch (error) {
      await this.auditService.logEvent({
        eventType: 'API_KEY_VALIDATION_ERROR',
        details: {
          error: error.message,
          ipAddress
        },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['SOC2'],
          requirements: ['access_control'],
          evidenceLevel: 'ENHANCED'
        }
      });
      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Get user's API keys
   */
  async getUserApiKeys(
    userId: string, 
    options: { includeInactive?: boolean } = {}
  ): Promise<ApiKey[]> {
    try {
      let query = `
        SELECT key_id, user_id, key_hash, key_prefix, name, description,
               scopes, created_at, expires_at, last_used_at, status,
               rate_limits, ip_whitelist, metadata, updated_at
        FROM api_keys 
        WHERE user_id = $1
      `;
      
      if (!options.includeInactive) {
        query += ' AND status = \'active\'';
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await this.databaseService.query(query, [userId]);
      
      return result.rows.map(row => this.mapRowToApiKey(row));
    } catch (error) {
      console.error('Error fetching user API keys:', error);
      return [];
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(
    keyId: string,
    revokedBy: string,
    reason?: string
  ): Promise<boolean> {
    try {
      const apiKey = await this.getApiKeyById(keyId);
      if (!apiKey) {
        return false;
      }

      await this.updateApiKeyStatus(keyId, 'revoked');
      this.clearKeyFromCache(apiKey.keyHash);

      await this.auditService.logEvent({
        eventType: 'API_KEY_REVOKED',
        userId: apiKey.userId,
        details: {
          keyId,
          keyPrefix: apiKey.keyPrefix,
          name: apiKey.name,
          revokedBy,
          reason: reason || 'Manual revocation'
        },
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['SOC2', 'ISO27001'],
          requirements: ['access_control', 'key_management'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return true;
    } catch (error) {
      console.error('Error revoking API key:', error);
      return false;
    }
  }

  /**
   * Rotate API key (create new, mark old as deprecated)
   */
  async rotateApiKey(
    keyId: string,
    rotatedBy: string
  ): Promise<{ newApiKey: ApiKey; rawKey: string } | null> {
    try {
      const oldKey = await this.getApiKeyById(keyId);
      if (!oldKey || oldKey.status !== 'active') {
        return null;
      }

      // Create new key with same properties
      const { apiKey: newApiKey, rawKey } = await this.createApiKey(
        oldKey.userId,
        {
          name: `${oldKey.name} (Rotated)`,
          description: oldKey.description,
          scopes: oldKey.scopes,
          rateLimits: oldKey.rateLimits,
          ipWhitelist: oldKey.ipWhitelist,
          purpose: oldKey.metadata.purpose
        },
        rotatedBy
      );

      // Update rotation count
      newApiKey.metadata.rotationCount = oldKey.metadata.rotationCount + 1;

      // Mark old key as revoked after 24 hours grace period
      setTimeout(async () => {
        await this.updateApiKeyStatus(keyId, 'revoked');
      }, 24 * 60 * 60 * 1000);

      await this.auditService.logEvent({
        eventType: 'API_KEY_ROTATED',
        userId: oldKey.userId,
        details: {
          oldKeyId: keyId,
          newKeyId: newApiKey.keyId,
          rotatedBy,
          rotationCount: newApiKey.metadata.rotationCount
        },
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['SOC2', 'ISO27001'],
          requirements: ['key_management'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return { newApiKey, rawKey };
    } catch (error) {
      console.error('Error rotating API key:', error);
      return null;
    }
  }

  /**
   * Get API key statistics
   */
  async getStatistics(userId?: string): Promise<any> {
    try {
      const baseQuery = `
        SELECT 
          COUNT(*) as total_keys,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_keys,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_keys,
          COUNT(CASE WHEN status = 'revoked' THEN 1 END) as revoked_keys,
          COUNT(CASE WHEN last_used_at > NOW() - INTERVAL '24 hours' THEN 1 END) as keys_used_last_24_hours,
          AVG(EXTRACT(DAY FROM NOW() - created_at)) as average_key_age
        FROM api_keys
        ${userId ? 'WHERE user_id = $1' : ''}
      `;
      
      const statsResult = await this.databaseService.query(
        baseQuery, 
        userId ? [userId] : []
      );
      
      // Get top scopes
      const scopesQuery = `
        SELECT unnest(scopes::text[]::text[]) as scope, COUNT(*) as usage_count
        FROM api_keys
        ${userId ? 'WHERE user_id = $1' : ''}
        GROUP BY scope
        ORDER BY usage_count DESC
        LIMIT 10
      `;
      
      const scopesResult = await this.databaseService.query(
        scopesQuery,
        userId ? [userId] : []
      );
      
      const stats = statsResult.rows[0];
      const topScopes = scopesResult.rows.map(row => ({
        scope: row.scope.replace(/"/g, ''), // Clean JSON quotes
        count: parseInt(row.usage_count)
      }));
      
      return {
        totalKeys: parseInt(stats.total_keys),
        activeKeys: parseInt(stats.active_keys),
        expiredKeys: parseInt(stats.expired_keys),
        revokedKeys: parseInt(stats.revoked_keys),
        keysUsedLast24Hours: parseInt(stats.keys_used_last_24_hours),
        topScopes,
        averageKeyAge: Math.round(parseFloat(stats.average_key_age) || 0)
      };
    } catch (error) {
      console.error('Error fetching API key statistics:', error);
      return {
        totalKeys: 0,
        activeKeys: 0,
        expiredKeys: 0,
        revokedKeys: 0,
        keysUsedLast24Hours: 0,
        topScopes: [],
        averageKeyAge: 0
      };
    }
  }

  // Private helper methods

  private mapRowToApiKey(row: any): ApiKey {
    return {
      keyId: row.key_id,
      userId: row.user_id,
      keyHash: row.key_hash,
      keyPrefix: row.key_prefix,
      name: row.name,
      description: row.description,
      scopes: Array.isArray(row.scopes) ? row.scopes : JSON.parse(row.scopes || '[]'),
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
      status: row.status,
      rateLimits: typeof row.rate_limits === 'object' ? row.rate_limits : JSON.parse(row.rate_limits || '{}'),
      ipWhitelist: row.ip_whitelist ? (Array.isArray(row.ip_whitelist) ? row.ip_whitelist : JSON.parse(row.ip_whitelist)) : undefined,
      metadata: typeof row.metadata === 'object' ? row.metadata : JSON.parse(row.metadata || '{}')
    };
  }

  private generateApiKey(): string {
    return 'sk_' + crypto.randomBytes(this.config.keyLength).toString('hex');
  }

  private hashApiKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  private async storeApiKey(apiKey: ApiKey): Promise<void> {
    const query = `
      INSERT INTO api_keys (
        key_id, user_id, key_hash, key_prefix, name, description,
        scopes, created_at, expires_at, status, rate_limits, 
        ip_whitelist, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    
    const values = [
      apiKey.keyId,
      apiKey.userId,
      apiKey.keyHash,
      apiKey.keyPrefix,
      apiKey.name,
      apiKey.description || null,
      JSON.stringify(apiKey.scopes),
      apiKey.createdAt,
      apiKey.expiresAt || null,
      apiKey.status,
      JSON.stringify(apiKey.rateLimits),
      apiKey.ipWhitelist ? JSON.stringify(apiKey.ipWhitelist) : null,
      JSON.stringify(apiKey.metadata)
    ];
    
    await this.databaseService.query(query, values);
  }

  private async getApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
    const query = `
      SELECT key_id, user_id, key_hash, key_prefix, name, description,
             scopes, created_at, expires_at, last_used_at, status,
             rate_limits, ip_whitelist, metadata, updated_at
      FROM api_keys 
      WHERE key_hash = $1 AND status != 'revoked'
    `;
    
    const result = await this.databaseService.query(query, [keyHash]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return this.mapRowToApiKey(row);
  }

  private async getApiKeyById(keyId: string): Promise<ApiKey | null> {
    const query = `
      SELECT key_id, user_id, key_hash, key_prefix, name, description,
             scopes, created_at, expires_at, last_used_at, status,
             rate_limits, ip_whitelist, metadata, updated_at
      FROM api_keys 
      WHERE key_id = $1
    `;
    
    const result = await this.databaseService.query(query, [keyId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return this.mapRowToApiKey(row);
  }

  private async updateApiKeyStatus(keyId: string, status: ApiKey['status']): Promise<void> {
    const query = `
      UPDATE api_keys 
      SET status = $1, updated_at = NOW()
      WHERE key_id = $2
    `;
    
    await this.databaseService.query(query, [status, keyId]);
  }

  private async updateLastUsed(keyId: string): Promise<void> {
    // Update last used timestamp asynchronously for performance
    setImmediate(async () => {
      try {
        const query = `
          UPDATE api_keys 
          SET last_used_at = NOW(), updated_at = NOW()
          WHERE key_id = $1
        `;
        
        await this.databaseService.query(query, [keyId]);
      } catch (error) {
        console.warn('Failed to update API key last used timestamp:', error);
      }
    });
  }

  private cacheKey(apiKey: ApiKey): void {
    this.keyCache.set(apiKey.keyHash, {
      key: apiKey,
      cachedAt: new Date()
    });
  }

  private async getCachedKey(keyHash: string): Promise<ApiKey | null> {
    const cached = this.keyCache.get(keyHash);
    if (!cached) return null;

    // Check cache timeout
    if (Date.now() - cached.cachedAt.getTime() > this.cacheTimeout) {
      this.keyCache.delete(keyHash);
      return null;
    }

    return cached.key;
  }

  private clearKeyFromCache(keyHash: string): void {
    this.keyCache.delete(keyHash);
  }

  private clearUserCache(userId: string): void {
    // Clear all cached keys for user
    for (const [keyHash, cached] of this.keyCache.entries()) {
      if (cached.key.userId === userId) {
        this.keyCache.delete(keyHash);
      }
    }
  }

  private async checkRateLimits(
    apiKey: ApiKey,
    ipAddress?: string
  ): Promise<{
    allowed: boolean;
    remaining: { minute: number; hour: number; day: number };
    resetTimes: { minute: Date; hour: Date; day: Date };
  }> {
    // Use rate limit service to check limits
    const keyIdentifier = `apikey:${apiKey.keyId}`;
    
    const minuteCheck = await this.rateLimitService.checkRateLimit(
      keyIdentifier,
      apiKey.rateLimits.requestsPerMinute,
      60,
      'sliding_window'
    );

    const hourCheck = await this.rateLimitService.checkRateLimit(
      keyIdentifier,
      apiKey.rateLimits.requestsPerHour,
      3600,
      'sliding_window'
    );

    const dayCheck = await this.rateLimitService.checkRateLimit(
      keyIdentifier,
      apiKey.rateLimits.requestsPerDay,
      86400,
      'sliding_window'
    );

    const allowed = minuteCheck.allowed && hourCheck.allowed && dayCheck.allowed;

    return {
      allowed,
      remaining: {
        minute: minuteCheck.remainingRequests || 0,
        hour: hourCheck.remainingRequests || 0,
        day: dayCheck.remainingRequests || 0
      },
      resetTimes: {
        minute: minuteCheck.resetTime || new Date(),
        hour: hourCheck.resetTime || new Date(),
        day: dayCheck.resetTime || new Date()
      }
    };
  }

  // Admin-specific methods for Epic 17.4.4 API Management
  
  /**
   * Get all API keys with pagination and filtering (admin only)
   */
  async getAllApiKeys(options: {
    status?: 'active' | 'revoked' | 'expired' | 'suspended';
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{
    apiKeys: Array<ApiKey & { userName: string; userEmail: string; metadata: any }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    let whereClause = '';
    const params: any[] = [];
    
    if (options.status) {
      whereClause = 'WHERE ak.status = $1';
      params.push(options.status);
    }

    // Count total matching records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM api_keys ak
      ${whereClause}
    `;
    
    const countResult = await this.databaseService.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Main query with joins for user information
    const sortColumn = options.sortBy === 'createdAt' ? 'ak.created_at' : 
      options.sortBy === 'lastUsedAt' ? 'ak.last_used_at' : 
        'ak.created_at';
    
    const query = `
      SELECT 
        ak.*,
        u.name as user_name,
        u.email as user_email,
        COALESCE(usage.total_calls, 0) as total_calls,
        COALESCE(usage.last_month_calls, 0) as last_month_calls,
        COALESCE(usage.error_count, 0) as error_count
      FROM api_keys ak
      LEFT JOIN users u ON ak.user_id = u.id
      LEFT JOIN (
        SELECT 
          key_id,
          COUNT(*) as total_calls,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_month_calls,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
        FROM api_call_logs 
        GROUP BY key_id
      ) usage ON ak.key_id = usage.key_id
      ${whereClause}
      ORDER BY ${sortColumn} ${options.sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(options.limit, options.offset);
    
    const result = await this.databaseService.query(query, params);
    
    const apiKeys = result.rows.map(row => ({
      ...this.mapRowToApiKey(row),
      userName: row.user_name || 'Unknown',
      userEmail: row.user_email || 'unknown@example.com',
      metadata: {
        ...JSON.parse(row.metadata || '{}'),
        totalCalls: parseInt(row.total_calls) || 0,
        lastMonth: parseInt(row.last_month_calls) || 0,
        errorCount: parseInt(row.error_count) || 0
      },
      recentActivity: await this.getRecentActivity(row.key_id)
    }));

    return {
      apiKeys,
      pagination: {
        total,
        limit: options.limit,
        offset: options.offset,
        hasMore: options.offset + options.limit < total
      }
    };
  }

  /**
   * Get usage metrics for all API keys
   */
  async getUsageMetrics(timeRange: '1h' | '24h' | '7d' | '30d'): Promise<Record<string, any>> {
    const intervals = {
      '1h': 'NOW() - INTERVAL \'1 hour\'',
      '24h': 'NOW() - INTERVAL \'1 day\'',
      '7d': 'NOW() - INTERVAL \'7 days\'',
      '30d': 'NOW() - INTERVAL \'30 days\''
    };

    const since = intervals[timeRange];
    
    const query = `
      SELECT 
        ak.key_id,
        ak.name,
        u.email,
        COUNT(acl.id) as call_count,
        COUNT(CASE WHEN acl.status = 'error' THEN 1 END) as error_count,
        AVG(acl.response_time) as avg_response_time,
        COUNT(CASE WHEN acl.rate_limited THEN 1 END) as rate_limit_hits,
        array_agg(DISTINCT acl.endpoint) as endpoints
      FROM api_keys ak
      LEFT JOIN users u ON ak.user_id = u.id
      LEFT JOIN api_call_logs acl ON ak.key_id = acl.key_id AND acl.created_at >= ${since}
      GROUP BY ak.key_id, ak.name, u.email
      ORDER BY call_count DESC
    `;

    const result = await this.databaseService.query(query);
    
    const metrics: Record<string, any> = {};
    
    for (const row of result.rows) {
      const callCount = parseInt(row.call_count) || 0;
      const errorCount = parseInt(row.error_count) || 0;
      
      metrics[row.key_id] = {
        keyId: row.key_id,
        name: row.name,
        userEmail: row.email,
        [`calls${timeRange.toUpperCase()}`]: callCount,
        errorRate: callCount > 0 ? errorCount / callCount : 0,
        averageResponseTime: parseFloat(row.avg_response_time) || 0,
        rateLimitHits: parseInt(row.rate_limit_hits) || 0,
        topEndpoints: (row.endpoints || [])
          .filter(Boolean)
          .slice(0, 5)
          .map(endpoint => ({
            endpoint,
            calls: callCount, // Simplified - would need separate query for per-endpoint stats
            errorRate: callCount > 0 ? errorCount / callCount : 0
          }))
      };
    }

    return metrics;
  }

  /**
   * Get real-time security alerts
   */
  async getSecurityAlerts(): Promise<Array<{
    id: string;
    type: 'rate_limit' | 'error_spike' | 'unusual_activity' | 'security_threat';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    keyId?: string;
    resolved: boolean;
  }>> {
    // This would typically query an alerts table or monitoring system
    // For now, we'll generate some example alerts based on recent activity
    
    const alertsQuery = `
      SELECT 
        'alert_' || generate_random_uuid() as id,
        CASE 
          WHEN rate_limit_violations > 100 THEN 'rate_limit'
          WHEN error_rate > 0.5 THEN 'error_spike'
          WHEN unusual_patterns > 0 THEN 'unusual_activity'
          ELSE 'security_threat'
        END as type,
        CASE 
          WHEN rate_limit_violations > 1000 OR error_rate > 0.8 THEN 'critical'
          WHEN rate_limit_violations > 500 OR error_rate > 0.5 THEN 'high'
          WHEN rate_limit_violations > 100 OR error_rate > 0.2 THEN 'medium'
          ELSE 'low'
        END as severity,
        CASE 
          WHEN rate_limit_violations > 100 THEN 'High rate limit violations detected for key ' || key_id
          WHEN error_rate > 0.5 THEN 'Elevated error rate detected for key ' || key_id
          WHEN unusual_patterns > 0 THEN 'Unusual access patterns detected for key ' || key_id
          ELSE 'Security anomaly detected for key ' || key_id
        END as message,
        created_at as timestamp,
        key_id,
        false as resolved
      FROM (
        SELECT 
          key_id,
          COUNT(CASE WHEN rate_limited THEN 1 END) as rate_limit_violations,
          CASE 
            WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*)
            ELSE 0
          END as error_rate,
          COUNT(CASE WHEN ip_address NOT IN (
            SELECT DISTINCT ip_address 
            FROM api_call_logs acl2 
            WHERE acl2.key_id = acl.key_id 
              AND acl2.created_at >= NOW() - INTERVAL '7 days'
              AND acl2.created_at < NOW() - INTERVAL '1 day'
          ) THEN 1 END) as unusual_patterns,
          MAX(created_at) as created_at
        FROM api_call_logs acl
        WHERE created_at >= NOW() - INTERVAL '1 hour'
        GROUP BY key_id
        HAVING COUNT(CASE WHEN rate_limited THEN 1 END) > 10
          OR (CASE WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*) ELSE 0 END) > 0.1
      ) alerts
      ORDER BY created_at DESC
      LIMIT 50
    `;

    try {
      const result = await this.databaseService.query(alertsQuery);
      
      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        timestamp: new Date(row.timestamp),
        keyId: row.key_id,
        resolved: row.resolved
      }));
    } catch (error) {
      // If alerts table doesn't exist or query fails, return empty array
      console.warn('Failed to fetch security alerts:', error);
      return [];
    }
  }

  /**
   * Admin revoke API key with audit trail
   */
  async adminRevokeApiKey(keyId: string, revokedBy: string, reason: string): Promise<boolean> {
    try {
      const key = await this.getApiKeyById(keyId);
      if (!key || key.status === 'revoked') {
        return false;
      }

      // Update status in database
      const query = `
        UPDATE api_keys 
        SET status = 'revoked', 
            updated_at = NOW(),
            metadata = jsonb_set(
              metadata,
              '{revokedBy}',
              to_jsonb($2::text),
              true
            ),
            metadata = jsonb_set(
              metadata,
              '{revokedAt}',
              to_jsonb(NOW()::text),
              true
            ),
            metadata = jsonb_set(
              metadata,
              '{revocationReason}',
              to_jsonb($3::text),
              true
            )
        WHERE key_id = $1
      `;

      await this.databaseService.query(query, [keyId, revokedBy, reason]);

      // Clear from cache
      this.clearKeyFromCache(key.keyHash);

      // Log audit event
      await this.auditService.logEvent({
        eventType: 'api_key_admin_revoked',
        userId: key.userId,
        details: {
          keyId,
          keyName: key.name,
          revokedBy,
          reason,
          adminAction: true
        },
        ipAddress: undefined,
        userAgent: undefined
      });

      return true;
    } catch (error) {
      console.error('Failed to admin revoke API key:', error);
      return false;
    }
  }

  /**
   * Suspend API key
   */
  async suspendApiKey(keyId: string, suspendedBy: string, reason: string, duration?: string): Promise<boolean> {
    try {
      const key = await this.getApiKeyById(keyId);
      if (!key || key.status !== 'active') {
        return false;
      }

      // Calculate suspension end time if duration is specified
      let suspensionEnds: Date | null = null;
      if (duration && duration !== 'permanent') {
        const now = new Date();
        if (duration.endsWith('h')) {
          const hours = parseInt(duration.slice(0, -1));
          suspensionEnds = new Date(now.getTime() + hours * 60 * 60 * 1000);
        } else if (duration.endsWith('d')) {
          const days = parseInt(duration.slice(0, -1));
          suspensionEnds = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        }
      }

      const query = `
        UPDATE api_keys 
        SET status = 'suspended', 
            updated_at = NOW(),
            metadata = jsonb_set(
              metadata,
              '{suspendedBy}',
              to_jsonb($2::text),
              true
            ),
            metadata = jsonb_set(
              metadata,
              '{suspendedAt}',
              to_jsonb(NOW()::text),
              true
            ),
            metadata = jsonb_set(
              metadata,
              '{suspensionReason}',
              to_jsonb($3::text),
              true
            ),
            metadata = jsonb_set(
              metadata,
              '{suspensionEnds}',
              to_jsonb($4::text),
              true
            )
        WHERE key_id = $1
      `;

      await this.databaseService.query(query, [
        keyId, 
        suspendedBy, 
        reason, 
        suspensionEnds?.toISOString() || null
      ]);

      // Clear from cache
      this.clearKeyFromCache(key.keyHash);

      // Log audit event
      await this.auditService.logEvent({
        eventType: 'api_key_suspended',
        userId: key.userId,
        details: {
          keyId,
          keyName: key.name,
          suspendedBy,
          reason,
          duration: duration || 'permanent',
          suspensionEnds: suspensionEnds?.toISOString()
        },
        ipAddress: undefined,
        userAgent: undefined
      });

      return true;
    } catch (error) {
      console.error('Failed to suspend API key:', error);
      return false;
    }
  }

  /**
   * Update rate limits for API key
   */
  async updateRateLimits(
    keyId: string, 
    rateLimits: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    }, 
    updatedBy: string
  ): Promise<boolean> {
    try {
      const key = await this.getApiKeyById(keyId);
      if (!key) {
        return false;
      }

      const query = `
        UPDATE api_keys 
        SET rate_limits = $2,
            updated_at = NOW(),
            metadata = jsonb_set(
              metadata,
              '{lastRateLimitUpdate}',
              to_jsonb($3::text),
              true
            ),
            metadata = jsonb_set(
              metadata,
              '{lastRateLimitUpdatedBy}',
              to_jsonb($4::text),
              true
            )
        WHERE key_id = $1
      `;

      await this.databaseService.query(query, [
        keyId,
        JSON.stringify(rateLimits),
        new Date().toISOString(),
        updatedBy
      ]);

      // Clear from cache to force refresh
      this.clearKeyFromCache(key.keyHash);

      // Log audit event
      await this.auditService.logEvent({
        eventType: 'api_key_rate_limits_updated',
        userId: key.userId,
        details: {
          keyId,
          keyName: key.name,
          oldRateLimits: key.rateLimits,
          newRateLimits: rateLimits,
          updatedBy
        },
        ipAddress: undefined,
        userAgent: undefined
      });

      return true;
    } catch (error) {
      console.error('Failed to update rate limits:', error);
      return false;
    }
  }

  /**
   * Perform bulk operations on multiple API keys
   */
  async performBulkOperation(
    operation: 'revoke' | 'suspend' | 'rate_limit',
    keyIds: string[],
    parameters: any,
    performedBy: string
  ): Promise<{
    processedCount: number;
    failedCount: number;
    results: Array<{ keyId: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ keyId: string; success: boolean; error?: string }> = [];
    let processedCount = 0;
    let failedCount = 0;

    for (const keyId of keyIds) {
      try {
        let success = false;

        switch (operation) {
        case 'revoke':
          success = await this.adminRevokeApiKey(keyId, performedBy, parameters.reason || 'Bulk revocation');
          break;
        case 'suspend':
          success = await this.suspendApiKey(keyId, performedBy, parameters.reason || 'Bulk suspension', parameters.duration);
          break;
        case 'rate_limit':
          success = await this.updateRateLimits(keyId, parameters.rateLimits, performedBy);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
        }

        if (success) {
          processedCount++;
          results.push({ keyId, success: true });
        } else {
          failedCount++;
          results.push({ keyId, success: false, error: 'Operation failed' });
        }
      } catch (error) {
        failedCount++;
        results.push({ 
          keyId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Log bulk operation audit event
    await this.auditService.logEvent({
      eventType: `api_key_bulk_${operation}`,
      userId: performedBy,
      details: {
        operation,
        keyIds,
        parameters,
        processedCount,
        failedCount,
        results
      },
      ipAddress: undefined,
      userAgent: undefined
    });

    return {
      processedCount,
      failedCount,
      results
    };
  }

  /**
   * Get recent activity for an API key
   */
  private async getRecentActivity(keyId: string): Promise<Array<{
    timestamp: Date;
    action: 'call' | 'error' | 'rate_limit' | 'creation' | 'rotation' | 'revocation';
    details: string;
    ipAddress?: string;
    endpoint?: string;
  }>> {
    try {
      const query = `
        SELECT 
          created_at,
          status,
          endpoint,
          ip_address,
          rate_limited,
          response_time,
          error_message
        FROM api_call_logs 
        WHERE key_id = $1 
        ORDER BY created_at DESC 
        LIMIT 10
      `;

      const result = await this.databaseService.query(query, [keyId]);
      
      return result.rows.map(row => ({
        timestamp: new Date(row.created_at),
        action: row.rate_limited ? 'rate_limit' : (row.status === 'error' ? 'error' : 'call'),
        details: row.error_message || `${row.status.toUpperCase()} - ${row.response_time}ms`,
        ipAddress: row.ip_address,
        endpoint: row.endpoint
      }));
    } catch (error) {
      // If api_call_logs table doesn't exist, return empty array
      return [];
    }
  }
}