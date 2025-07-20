/**
 * Rate Limiter Implementation
 * Task: T-1752989143997-184 - Create rate limiter implementation
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import { z } from 'zod';

// ========================================
// Types and Interfaces
// ========================================

export interface RateLimitConfig {
  windowMs: number;           // Time window in milliseconds
  maxRequests: number;        // Maximum requests per window
  keyGenerator?: (context: RateLimitContext) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  resetExpiredHits?: boolean;
  standardHeaders?: boolean;  // Send rate limit info in headers
  legacyHeaders?: boolean;    // Send X-RateLimit headers
  store?: RateLimitStore;     // Storage backend
  onLimitReached?: (context: RateLimitContext, info: RateLimitInfo) => void;
  message?: string | ((info: RateLimitInfo) => string);
  statusCode?: number;
}

export interface RateLimitContext {
  ip?: string;
  userId?: string;
  endpoint?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp?: number;
  sessionId?: string;
  organizationId?: string;
}

export interface RateLimitInfo {
  totalHits: number;
  totalHitsInWindow: number;
  remainingRequests: number;
  resetTime: Date;
  windowStart: Date;
  windowEnd: Date;
  exceeded: boolean;
  retryAfter?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  info: RateLimitInfo;
  headers: Record<string, string>;
  error?: string;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitData | null>;
  set(key: string, data: RateLimitData, ttlMs: number): Promise<void>;
  increment(key: string, windowMs: number): Promise<{ hits: number; resetTime: Date }>;
  reset(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

export interface RateLimitData {
  hits: number;
  resetTime: number;
  windowStart: number;
}

export enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket'
}

export enum RateLimitScope {
  GLOBAL = 'global',
  IP = 'ip',
  USER = 'user',
  ENDPOINT = 'endpoint',
  CUSTOM = 'custom'
}

// ========================================
// Validation Schemas
// ========================================

const RateLimitConfigSchema = z.object({
  windowMs: z.number().min(1000).max(86400000), // 1 second to 24 hours
  maxRequests: z.number().min(1).max(10000),
  skipSuccessfulRequests: z.boolean().optional(),
  skipFailedRequests: z.boolean().optional(),
  resetExpiredHits: z.boolean().optional(),
  standardHeaders: z.boolean().optional(),
  legacyHeaders: z.boolean().optional(),
  message: z.string().optional(),
  statusCode: z.number().min(400).max(599).optional()
});

// ========================================
// In-Memory Store Implementation
// ========================================

export class MemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, RateLimitData> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs: number = 60000) {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  async get(key: string): Promise<RateLimitData | null> {
    const data = this.store.get(key);
    if (!data) return null;

    // Check if expired
    if (Date.now() > data.resetTime) {
      this.store.delete(key);
      return null;
    }

    return data;
  }

  async set(key: string, data: RateLimitData, ttlMs: number): Promise<void> {
    this.store.set(key, {
      ...data,
      resetTime: Date.now() + ttlMs
    });
  }

  async increment(key: string, windowMs: number): Promise<{ hits: number; resetTime: Date }> {
    const now = Date.now();
    const existing = await this.get(key);

    if (!existing || now > existing.resetTime) {
      // Start new window
      const resetTime = now + windowMs;
      const data: RateLimitData = {
        hits: 1,
        resetTime,
        windowStart: now
      };
      
      this.store.set(key, data);
      
      return {
        hits: 1,
        resetTime: new Date(resetTime)
      };
    } else {
      // Increment existing
      existing.hits++;
      this.store.set(key, existing);
      
      return {
        hits: existing.hits,
        resetTime: new Date(existing.resetTime)
      };
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }

  getStats(): { totalKeys: number; totalHits: number } {
    let totalHits = 0;
    for (const data of this.store.values()) {
      totalHits += data.hits;
    }
    
    return {
      totalKeys: this.store.size,
      totalHits
    };
  }
}

// ========================================
// Key Generators
// ========================================

export class RateLimitKeyGenerator {
  /**
   * Generate key based on IP address
   */
  static byIP(context: RateLimitContext): string {
    return `ip:${context.ip || 'unknown'}`;
  }

  /**
   * Generate key based on user ID
   */
  static byUser(context: RateLimitContext): string {
    return `user:${context.userId || 'anonymous'}`;
  }

  /**
   * Generate key based on endpoint
   */
  static byEndpoint(context: RateLimitContext): string {
    const method = context.method || 'GET';
    const path = context.path || '/';
    return `endpoint:${method}:${path}`;
  }

  /**
   * Generate key based on IP and endpoint
   */
  static byIPAndEndpoint(context: RateLimitContext): string {
    const ip = context.ip || 'unknown';
    const method = context.method || 'GET';
    const path = context.path || '/';
    return `ip_endpoint:${ip}:${method}:${path}`;
  }

  /**
   * Generate key based on user and endpoint
   */
  static byUserAndEndpoint(context: RateLimitContext): string {
    const userId = context.userId || 'anonymous';
    const method = context.method || 'GET';
    const path = context.path || '/';
    return `user_endpoint:${userId}:${method}:${path}`;
  }

  /**
   * Generate key based on session
   */
  static bySession(context: RateLimitContext): string {
    return `session:${context.sessionId || 'unknown'}`;
  }

  /**
   * Generate key based on organization
   */
  static byOrganization(context: RateLimitContext): string {
    return `org:${context.organizationId || 'unknown'}`;
  }

  /**
   * Generate composite key with multiple factors
   */
  static composite(factors: string[]): (context: RateLimitContext) => string {
    return (context: RateLimitContext): string => {
      const parts: string[] = [];
      
      for (const factor of factors) {
        switch (factor) {
          case 'ip':
            parts.push(context.ip || 'unknown');
            break;
          case 'user':
            parts.push(context.userId || 'anonymous');
            break;
          case 'endpoint':
            parts.push(`${context.method || 'GET'}:${context.path || '/'}`);
            break;
          case 'session':
            parts.push(context.sessionId || 'unknown');
            break;
          case 'org':
            parts.push(context.organizationId || 'unknown');
            break;
          default:
            parts.push(factor);
        }
      }
      
      return parts.join(':');
    };
  }
}

// ========================================
// Rate Limit Strategies
// ========================================

export abstract class RateLimitStrategy {
  protected config: RateLimitConfig;
  protected store: RateLimitStore;

  constructor(config: RateLimitConfig, store: RateLimitStore) {
    this.config = config;
    this.store = store;
  }

  abstract checkLimit(key: string, context: RateLimitContext): Promise<RateLimitResult>;
  abstract reset(key: string): Promise<void>;
}

export class FixedWindowStrategy extends RateLimitStrategy {
  async checkLimit(key: string, context: RateLimitContext): Promise<RateLimitResult> {
    try {
      const { hits, resetTime } = await this.store.increment(key, this.config.windowMs);
      
      const now = new Date();
      const windowStart = new Date(resetTime.getTime() - this.config.windowMs);
      const remainingRequests = Math.max(0, this.config.maxRequests - hits);
      const exceeded = hits > this.config.maxRequests;

      const info: RateLimitInfo = {
        totalHits: hits,
        totalHitsInWindow: hits,
        remainingRequests,
        resetTime,
        windowStart,
        windowEnd: resetTime,
        exceeded,
        retryAfter: exceeded ? Math.ceil((resetTime.getTime() - now.getTime()) / 1000) : undefined
      };

      const headers = this.generateHeaders(info);

      return {
        allowed: !exceeded,
        info,
        headers,
        error: exceeded ? this.generateErrorMessage(info) : undefined
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      
      // Fail open - allow request if store is unavailable
      const now = new Date();
      const defaultInfo: RateLimitInfo = {
        totalHits: 0,
        totalHitsInWindow: 0,
        remainingRequests: this.config.maxRequests,
        resetTime: new Date(now.getTime() + this.config.windowMs),
        windowStart: now,
        windowEnd: new Date(now.getTime() + this.config.windowMs),
        exceeded: false
      };

      return {
        allowed: true,
        info: defaultInfo,
        headers: this.generateHeaders(defaultInfo),
        error: 'Rate limit store unavailable'
      };
    }
  }

  async reset(key: string): Promise<void> {
    await this.store.reset(key);
  }

  private generateHeaders(info: RateLimitInfo): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.standardHeaders) {
      headers['RateLimit-Limit'] = this.config.maxRequests.toString();
      headers['RateLimit-Remaining'] = Math.max(0, info.remainingRequests).toString();
      headers['RateLimit-Reset'] = Math.ceil(info.resetTime.getTime() / 1000).toString();
    }

    if (this.config.legacyHeaders) {
      headers['X-RateLimit-Limit'] = this.config.maxRequests.toString();
      headers['X-RateLimit-Remaining'] = Math.max(0, info.remainingRequests).toString();
      headers['X-RateLimit-Reset'] = Math.ceil(info.resetTime.getTime() / 1000).toString();
    }

    if (info.exceeded && info.retryAfter) {
      headers['Retry-After'] = info.retryAfter.toString();
    }

    return headers;
  }

  private generateErrorMessage(info: RateLimitInfo): string {
    if (typeof this.config.message === 'function') {
      return this.config.message(info);
    }
    
    if (typeof this.config.message === 'string') {
      return this.config.message;
    }

    return `Rate limit exceeded. Try again in ${info.retryAfter} seconds.`;
  }
}

// ========================================
// Main Rate Limiter Class
// ========================================

export class RateLimiter {
  private config: RateLimitConfig;
  private strategy: RateLimitStrategy;
  private keyGenerator: (context: RateLimitContext) => string;

  constructor(config: Partial<RateLimitConfig> = {}) {
    // Validate and set default configuration
    this.config = this.createConfig(config);
    
    // Create store if not provided
    const store = this.config.store || new MemoryRateLimitStore();
    
    // Create strategy (currently only fixed window implemented)
    this.strategy = new FixedWindowStrategy(this.config, store);
    
    // Set key generator
    this.keyGenerator = this.config.keyGenerator || RateLimitKeyGenerator.byIP;
  }

  private createConfig(customConfig: Partial<RateLimitConfig>): RateLimitConfig {
    const defaultConfig: RateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      resetExpiredHits: true,
      standardHeaders: true,
      legacyHeaders: false,
      statusCode: 429,
      message: 'Too many requests from this IP, please try again later.'
    };

    const config = { ...defaultConfig, ...customConfig };
    
    // Validate configuration
    try {
      RateLimitConfigSchema.parse(config);
    } catch (error) {
      throw new Error(`Invalid rate limit configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return config;
  }

  /**
   * Check if request should be rate limited
   */
  async checkLimit(context: RateLimitContext): Promise<RateLimitResult> {
    const key = this.keyGenerator(context);
    return await this.strategy.checkLimit(key, context);
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetLimit(context: RateLimitContext): Promise<void> {
    const key = this.keyGenerator(context);
    await this.strategy.reset(key);
  }

  /**
   * Get current rate limit info without incrementing
   */
  async getCurrentInfo(context: RateLimitContext): Promise<RateLimitInfo | null> {
    const key = this.keyGenerator(context);
    const data = await this.config.store?.get(key);
    
    if (!data) return null;

    const now = new Date();
    const resetTime = new Date(data.resetTime);
    const windowStart = new Date(data.windowStart);
    
    return {
      totalHits: data.hits,
      totalHitsInWindow: data.hits,
      remainingRequests: Math.max(0, this.config.maxRequests - data.hits),
      resetTime,
      windowStart,
      windowEnd: resetTime,
      exceeded: data.hits > this.config.maxRequests
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update key generator if provided
    if (newConfig.keyGenerator) {
      this.keyGenerator = newConfig.keyGenerator;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.config.store) {
      await this.config.store.cleanup();
    }
    
    // Cleanup memory store if it's the default one
    if (this.config.store instanceof MemoryRateLimitStore) {
      this.config.store.destroy();
    }
  }
}

// ========================================
// Predefined Rate Limit Configurations
// ========================================

export class RateLimitPresets {
  /**
   * Strict rate limiting for authentication endpoints
   */
  static authentication(): Partial<RateLimitConfig> {
    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      keyGenerator: RateLimitKeyGenerator.byIP,
      message: 'Too many authentication attempts. Please try again later.',
      standardHeaders: true
    };
  }

  /**
   * Moderate rate limiting for API endpoints
   */
  static api(): Partial<RateLimitConfig> {
    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
      keyGenerator: RateLimitKeyGenerator.byUserAndEndpoint,
      standardHeaders: true,
      skipSuccessfulRequests: false
    };
  }

  /**
   * Lenient rate limiting for public content
   */
  static public(): Partial<RateLimitConfig> {
    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5000,
      keyGenerator: RateLimitKeyGenerator.byIP,
      standardHeaders: true,
      skipSuccessfulRequests: true
    };
  }

  /**
   * Very strict rate limiting for password reset
   */
  static passwordReset(): Partial<RateLimitConfig> {
    return {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      keyGenerator: RateLimitKeyGenerator.byIP,
      message: 'Too many password reset attempts. Please try again later.',
      standardHeaders: true
    };
  }

  /**
   * Rate limiting for email sending
   */
  static emailSending(): Partial<RateLimitConfig> {
    return {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      keyGenerator: RateLimitKeyGenerator.byUser,
      message: 'Email sending limit reached. Please try again later.',
      standardHeaders: true
    };
  }

  /**
   * Rate limiting for file uploads
   */
  static fileUpload(): Partial<RateLimitConfig> {
    return {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50,
      keyGenerator: RateLimitKeyGenerator.byUser,
      message: 'File upload limit reached. Please try again later.',
      standardHeaders: true
    };
  }

  /**
   * Rate limiting for search operations
   */
  static search(): Partial<RateLimitConfig> {
    return {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyGenerator: RateLimitKeyGenerator.byUser,
      skipSuccessfulRequests: false,
      standardHeaders: true
    };
  }
}

// ========================================
// Utility Functions
// ========================================

export class RateLimitUtils {
  /**
   * Create rate limiter from preset
   */
  static fromPreset(preset: keyof typeof RateLimitPresets, customConfig?: Partial<RateLimitConfig>): RateLimiter {
    const presetConfig = RateLimitPresets[preset]();
    const finalConfig = { ...presetConfig, ...customConfig };
    return new RateLimiter(finalConfig);
  }

  /**
   * Create multiple rate limiters for different endpoints
   */
  static createMultiple(configs: Record<string, Partial<RateLimitConfig>>): Record<string, RateLimiter> {
    const limiters: Record<string, RateLimiter> = {};
    
    for (const [name, config] of Object.entries(configs)) {
      limiters[name] = new RateLimiter(config);
    }
    
    return limiters;
  }

  /**
   * Extract IP address from various sources
   */
  static extractIP(headers: Record<string, string>): string | undefined {
    // Check common proxy headers
    const possibleHeaders = [
      'cf-connecting-ip',      // Cloudflare
      'x-forwarded-for',       // Standard proxy header
      'x-real-ip',             // Nginx
      'x-client-ip',           // Apache
      'true-client-ip',        // Cloudflare Enterprise
      'fastly-client-ip'       // Fastly
    ];

    for (const header of possibleHeaders) {
      const value = headers[header];
      if (value) {
        // Handle comma-separated IPs (take the first one)
        const ip = value.split(',')[0].trim();
        if (ip && ip !== 'unknown') {
          return ip;
        }
      }
    }

    return undefined;
  }

  /**
   * Format rate limit info for logging
   */
  static formatInfoForLogging(info: RateLimitInfo, key: string): string {
    return `Rate limit ${info.exceeded ? 'EXCEEDED' : 'OK'} for key="${key}" ` +
           `hits=${info.totalHits}/${info.totalHitsInWindow} ` +
           `remaining=${info.remainingRequests} ` +
           `reset=${info.resetTime.toISOString()}`;
  }

  /**
   * Calculate optimal window size based on expected traffic
   */
  static calculateOptimalWindow(expectedRequestsPerHour: number, maxConcurrentUsers: number): number {
    // Simple heuristic: window should be long enough to smooth traffic spikes
    // but short enough to be responsive to attacks
    const requestsPerMinute = expectedRequestsPerHour / 60;
    const baseWindow = 15 * 60 * 1000; // 15 minutes
    
    if (requestsPerMinute > 1000) {
      return 5 * 60 * 1000; // 5 minutes for high traffic
    } else if (requestsPerMinute > 100) {
      return baseWindow; // 15 minutes for moderate traffic
    } else {
      return 30 * 60 * 1000; // 30 minutes for low traffic
    }
  }
}

export default RateLimiter;