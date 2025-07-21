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
      // In full implementation, would query database
      // For now, return empty array as foundation
      return [];
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
    return {
      totalKeys: 0, // Would query database
      activeKeys: 0,
      expiredKeys: 0,
      revokedKeys: 0,
      keysUsedLast24Hours: 0,
      topScopes: [],
      averageKeyAge: 0
    };
  }

  // Private helper methods

  private generateApiKey(): string {
    return 'sk_' + crypto.randomBytes(this.config.keyLength).toString('hex');
  }

  private hashApiKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  private async storeApiKey(apiKey: ApiKey): Promise<void> {
    // In full implementation, would store in database
    console.log('Storing API key:', {
      keyId: apiKey.keyId,
      userId: apiKey.userId,
      name: apiKey.name
    });
  }

  private async getApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
    // In full implementation, would query database
    return null;
  }

  private async getApiKeyById(keyId: string): Promise<ApiKey | null> {
    // In full implementation, would query database
    return null;
  }

  private async updateApiKeyStatus(keyId: string, status: ApiKey['status']): Promise<void> {
    // In full implementation, would update database
    console.log(`Updating API key ${keyId} status to ${status}`);
  }

  private async updateLastUsed(keyId: string): Promise<void> {
    // In full implementation, would update database
    // Could be done async to not impact performance
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
}