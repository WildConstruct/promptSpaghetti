/**
 * Password Breach Detection Service - Epic 19
 * 
 * Privacy-preserving password breach detection using HaveIBeenPwned API
 * with k-anonymity hash-prefix queries to protect user passwords.
 * 
 * Features:
 * - SHA-1 hash-prefix queries (k=5 anonymity)
 * - Rate limiting and caching
 * - Enhanced privacy with padding
 * - Comprehensive audit logging
 * - Integration with existing authentication services
 */

import crypto from 'crypto';
import { AuditService } from './AuditService';
import { RateLimitService } from './RateLimitService';
import { logger } from '../../utils/logger';

export interface BreachCheckResult {
  isBreached: boolean;
  occurrenceCount: number;
  source: string;
  checkedAt: Date;
  hashPrefix: string;
  cacheHit: boolean;
  responseTime: number;
}

export interface BreachCheckOptions {
  skipCache?: boolean;
  includeMetadata?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

export interface BreachMetadata {
  apiVersion: string;
  responseHeaders: Record<string, string>;
  requestId: string;
  paddingEnabled: boolean;
  anonymityLevel: number;
}

export class PasswordBreachService {
  private auditService: AuditService;
  private rateLimitService: RateLimitService;
  private cache: Map<string, { result: BreachCheckResult; expiresAt: number }> = new Map();
  private readonly API_BASE_URL = 'https://api.pwnedpasswords.com';
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly K_ANONYMITY_LEVEL = 5; // First 5 characters of SHA-1 hash
  private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds
  private readonly DEFAULT_RETRIES = 3;
  private readonly USER_AGENT = 'SecurePasswordChecker/1.0';

  constructor(auditService: AuditService, rateLimitService: RateLimitService) {
    this.auditService = auditService;
    this.rateLimitService = rateLimitService;
    this.initializeService();
  }

  /**
   * Initialize the breach detection service
   */
  private initializeService(): void {
    // Set up cache cleanup interval
    setInterval(() => this.cleanupExpiredCache(), 60 * 60 * 1000); // Every hour
    
    logger.log('PasswordBreachService initialized with k-anonymity level: ' + this.K_ANONYMITY_LEVEL);
  }

  /**
   * Check if a password has been found in known data breaches
   */
  async checkPasswordBreach(
    password: string, 
    userId?: string, 
    options: BreachCheckOptions = {}
  ): Promise<BreachCheckResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      // Apply rate limiting
      if (userId) {
        await this.checkRateLimit(userId);
      }

      // Generate SHA-1 hash for k-anonymity query
      const sha1Hash = this.generateSHA1Hash(password);
      const hashPrefix = sha1Hash.substring(0, this.K_ANONYMITY_LEVEL);
      const hashSuffix = sha1Hash.substring(this.K_ANONYMITY_LEVEL);

      // Check cache first (unless skipCache is true)
      if (!options.skipCache) {
        const cachedResult = this.getCachedResult(hashPrefix);
        if (cachedResult) {
          await this.logBreachCheck(userId, cachedResult, requestId);
          return cachedResult;
        }
      }

      // Perform privacy-preserving API query
      const apiResult = await this.queryBreachAPI(hashPrefix, options);
      
      // Parse response and check for password match
      const breachResult = this.parseBreachResponse(
        apiResult.response,
        hashSuffix,
        hashPrefix,
        startTime,
        requestId,
        apiResult.metadata
      );

      // Cache the result
      this.cacheResult(hashPrefix, breachResult);

      // Audit log the breach check
      await this.logBreachCheck(userId, breachResult, requestId);

      return breachResult;

    } catch (error) {
      const errorResult = this.createErrorResult(hashPrefix || '', startTime, requestId, error);
      
      if (userId) {
        await this.logBreachCheckError(userId, error, requestId);
      }
      
      return errorResult;
    }
  }

  /**
   * Generate SHA-1 hash of password (required by HaveIBeenPwned API)
   */
  private generateSHA1Hash(password: string): string {
    return crypto
      .createHash('sha1')
      .update(password, 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Query HaveIBeenPwned API using k-anonymity hash prefix
   */
  private async queryBreachAPI(
    hashPrefix: string, 
    options: BreachCheckOptions
  ): Promise<{ response: string; metadata: BreachMetadata }> {
    const url = `${this.API_BASE_URL}/range/${hashPrefix}`;
    const timeout = options.timeout || this.DEFAULT_TIMEOUT;
    const requestId = this.generateRequestId();

    const requestHeaders = {
      'User-Agent': this.USER_AGENT,
      'Add-Padding': 'true', // Enhanced privacy feature
      'X-Request-ID': requestId
    };

    let attempt = 0;
    const maxAttempts = options.retryAttempts || this.DEFAULT_RETRIES;

    while (attempt < maxAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          headers: requestHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited by API - wait and retry
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
            if (attempt < maxAttempts - 1) {
              await this.sleep(retryAfter * 1000);
              attempt++;
              continue;
            }
          }
          
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        
        const metadata: BreachMetadata = {
          apiVersion: response.headers.get('X-API-Version') || 'unknown',
          responseHeaders: this.extractRelevantHeaders(response.headers),
          requestId,
          paddingEnabled: true,
          anonymityLevel: this.K_ANONYMITY_LEVEL
        };

        return {
          response: responseText,
          metadata
        };

      } catch (error) {
        attempt++;
        
        if (attempt >= maxAttempts) {
          throw error;
        }

        // Exponential backoff for retries
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await this.sleep(backoffMs);
      }
    }

    throw new Error('Max retry attempts exceeded');
  }

  /**
   * Parse HaveIBeenPwned API response and check for password match
   */
  private parseBreachResponse(
    response: string,
    hashSuffix: string,
    hashPrefix: string,
    startTime: number,
    requestId: string,
    metadata: BreachMetadata
  ): BreachCheckResult {
    const responseTime = Date.now() - startTime;
    
    try {
      // Parse response format: SUFFIX:COUNT\r\n
      const lines = response.split(/\r?\n/);
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const [suffix, countStr] = line.split(':');
        
        if (suffix === hashSuffix) {
          const occurrenceCount = parseInt(countStr, 10);
          
          return {
            isBreached: true,
            occurrenceCount,
            source: 'HaveIBeenPwned',
            checkedAt: new Date(),
            hashPrefix,
            cacheHit: false,
            responseTime
          };
        }
      }

      // Password not found in breached databases
      return {
        isBreached: false,
        occurrenceCount: 0,
        source: 'HaveIBeenPwned',
        checkedAt: new Date(),
        hashPrefix,
        cacheHit: false,
        responseTime
      };

    } catch (error) {
      throw new Error(`Failed to parse API response: ${error}`);
    }
  }

  /**
   * Check rate limit for user
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const rateLimitKey = `password_breach_check:${userId}`;
    const isAllowed = await this.rateLimitService.checkRateLimit(rateLimitKey, {
      window: 60, // 1 minute
      max: 10     // 10 requests per minute
    });

    if (!isAllowed) {
      throw new Error('Rate limit exceeded for password breach checking');
    }
  }

  /**
   * Cache management
   */
  private getCachedResult(hashPrefix: string): BreachCheckResult | null {
    const cached = this.cache.get(hashPrefix);
    
    if (cached && cached.expiresAt > Date.now()) {
      return {
        ...cached.result,
        cacheHit: true
      };
    }

    if (cached) {
      this.cache.delete(hashPrefix);
    }

    return null;
  }

  private cacheResult(hashPrefix: string, result: BreachCheckResult): void {
    this.cache.set(hashPrefix, {
      result,
      expiresAt: Date.now() + this.CACHE_TTL_MS
    });
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (cached.expiresAt <= now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Audit logging
   */
  private async logBreachCheck(
    userId: string | undefined,
    result: BreachCheckResult,
    requestId: string
  ): Promise<void> {
    if (!userId) return;

    try {
      await this.auditService.logEvent({
        eventType: 'PASSWORD_BREACH_CHECK',
        userId,
        details: {
          requestId,
          isBreached: result.isBreached,
          occurrenceCount: result.occurrenceCount,
          source: result.source,
          responseTime: result.responseTime,
          cacheHit: result.cacheHit,
          hashPrefix: result.hashPrefix // Safe to log prefix for debugging
        },
        riskLevel: result.isBreached ? 'HIGH' : 'LOW',
        compliance: {
          frameworks: ['GDPR', 'OWASP'],
          requirements: ['password_security', 'breach_detection'],
          evidenceLevel: 'ENHANCED'
        }
      });
    } catch (error) {
      logger.log(`Failed to log breach check audit: ${error}`);
    }
  }

  private async logBreachCheckError(
    userId: string,
    error: any,
    requestId: string
  ): Promise<void> {
    try {
      await this.auditService.logEvent({
        eventType: 'PASSWORD_BREACH_CHECK_ERROR',
        userId,
        details: {
          requestId,
          error: error.message || 'Unknown error',
          errorType: error.name || 'Error'
        },
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['GDPR', 'OWASP'],
          requirements: ['password_security', 'breach_detection'],
          evidenceLevel: 'ENHANCED'
        }
      });
    } catch (auditError) {
      logger.log(`Failed to log breach check error audit: ${auditError}`);
    }
  }

  /**
   * Utility methods
   */
  private generateRequestId(): string {
    return `BREACH-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private extractRelevantHeaders(headers: Headers): Record<string, string> {
    const relevantHeaders: Record<string, string> = {};
    
    const headerKeys = [
      'x-api-version',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'retry-after',
      'content-length'
    ];

    headerKeys.forEach(key => {
      const value = headers.get(key);
      if (value) {
        relevantHeaders[key] = value;
      }
    });

    return relevantHeaders;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createErrorResult(
    hashPrefix: string,
    startTime: number,
    requestId: string,
    error: any
  ): BreachCheckResult {
    return {
      isBreached: false, // Fail safe - assume not breached on error
      occurrenceCount: 0,
      source: 'HaveIBeenPwned',
      checkedAt: new Date(),
      hashPrefix,
      cacheHit: false,
      responseTime: Date.now() - startTime
    };
  }

  /**
   * Public utility methods
   */

  /**
   * Get service statistics
   */
  public getServiceStats(): {
    cacheSize: number;
    cacheHitRate: number;
    totalChecks: number;
    averageResponseTime: number;
    } {
    // This would typically be implemented with persistent metrics
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0, // Would calculate from historical data
      totalChecks: 0,  // Would track in persistent storage
      averageResponseTime: 0 // Would calculate from historical data
    };
  }

  /**
   * Clear cache (for testing or maintenance)
   */
  public clearCache(): void {
    this.cache.clear();
    logger.log('Password breach detection cache cleared');
  }

  /**
   * Test API connectivity
   */
  public async testAPIConnectivity(): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Use a known breached password hash prefix for testing
      const testPrefix = '21BD1'; // From "password"
      await this.queryBreachAPI(testPrefix, { timeout: 3000, retryAttempts: 1 });
      
      return {
        success: true,
        responseTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate hash prefix format
   */
  public isValidHashPrefix(prefix: string): boolean {
    return /^[A-F0-9]{5}$/.test(prefix);
  }

  /**
   * Generate test data for development
   */
  public generateTestHashPrefix(): string {
    // Generate random 5-character hex prefix for testing
    return Array.from({ length: 5 }, () => 
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
  }
}