/**
 * Rate Limiting Middleware - Epic 19 Implementation
 * Advanced rate limiting with IP and account-based rules, sliding windows, and adaptive throttling
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

}
export interface RateLimitRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  // Targeting
  targets: {
    ipAddresses?: string[];
    ipRanges?: string[];
    userIds?: string[];
    userRoles?: string[];
    routes?: string[];
    methods?: string[];
    userAgents?: string[];
}
  };
  
  // Limits
  limits: {
    requests: number;
    windowMs: number; // milliseconds
    windowType: 'fixed' | 'sliding' | 'token_bucket';
    burst?: number; // max burst for token bucket
    refillRate?: number; // tokens per second for token bucket
  };
  
  // Actions
  actions: {
    blockRequest: boolean;
    delayRequest?: number; // milliseconds
    requireCaptcha?: boolean;
    requireMFA?: boolean;
    logAttempt?: boolean;
    notifyAdmin?: boolean;
    banDuration?: number; // milliseconds
    customResponse?: {
      statusCode: number;
      message: string;
      headers?: Record<string, string>;
    };
  };
  
  // Conditions
  conditions?: {
    timeOfDay?: { start: string; end: string; timezone: string };
    daysOfWeek?: number[];
    userAuthenticated?: boolean;
    headerPresent?: string;
    queryParamPresent?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

}
export interface RateLimitAttempt {
  id: string;
  identifier: string; // IP or user ID
  route: string;
  method: string;
  timestamp: Date;
  allowed: boolean;
  ruleApplied?: string;
  responseTime: number;
  userAgent: string;
  headers: Record<string, string>;
  blocked: boolean;
  banExpires?: Date;
}
}

}
export interface RateLimitStatus {
  identifier: string;
  currentWindow: {
    startTime: Date;
    requests: number;
    limit: number;
    remaining: number;
    resetTime: Date;
}
  };
  totalRequests: number;
  blockedRequests: number;
  lastRequest: Date;
  banned: boolean;
  banExpires?: Date;
  appliedRules: string[];
}

}
export interface AdaptiveConfig {
  enabled: boolean;
  baselineRequests: number;
  adaptationFactor: number; // 0.1 = 10% adjustment
  minLimit: number;
  maxLimit: number;
  learningPeriod: number; // hours
  adjustmentInterval: number; // minutes
}
}

export class RateLimitingMiddleware {
  private rules: Map<string, RateLimitRule> = new Map();
  private attempts: Map<string, RateLimitAttempt[]> = new Map();
  private statuses: Map<string, RateLimitStatus> = new Map();
  private tokenBuckets: Map<string, { tokens: number; lastRefill: Date }> = new Map();
  private bannedIdentifiers: Map<string, Date> = new Map();
  
  private adaptiveConfig: AdaptiveConfig = {
    enabled: true,
    baselineRequests: 100,
    adaptationFactor: 0.1,
    minLimit: 10,
    maxLimit: 1000,
    learningPeriod: 24,
    adjustmentInterval: 15
  };

  constructor() {
    this.initializeDefaultRules();
    this.startMaintenanceTasks();
  }

  /**
   * Create Express middleware for rate limiting
   */
  createMiddleware(options: {
    trustProxy?: boolean;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
  } = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      try {
        // Generate identifier for this request
        const identifier = options.keyGenerator 
          ? options.keyGenerator(req)
          : this.generateIdentifier(req, options.trustProxy);

        // Check if identifier is banned
        if (this.isBanned(identifier)) {
          const banExpires = this.bannedIdentifiers.get(identifier);
          return this.sendRateLimitResponse(res, {
            statusCode: 429,
            message: 'IP temporarily banned due to rate limit violations',
            headers: {
              'X-RateLimit-Banned': 'true',
              'X-RateLimit-Ban-Expires': banExpires?.toISOString() || '',
              'Retry-After': banExpires ? Math.ceil((banExpires.getTime() - Date.now()) / 1000).toString() : '3600'
            }
          });
        }

        // Get applicable rules for this request
        const applicableRules = await this.getApplicableRules(req, identifier);
        
        // Check each rule
        let blocked = false;
        let delayMs = 0;
        let appliedRule: RateLimitRule | null = null;
        let limitStatus: RateLimitStatus | null = null;

        for (const rule of applicableRules) {
          const result = await this.checkRule(rule, identifier, req);
          
          if (!result.allowed) {
            blocked = true;
            appliedRule = rule;
            limitStatus = result.status;
            
            if (rule.actions.delayRequest) {
              delayMs = Math.max(delayMs, rule.actions.delayRequest);
            }
            
            // If this rule blocks the request, stop checking other rules
            if (rule.actions.blockRequest) {
              break;
            }
          }
        }

        // Record the attempt
        await this.recordAttempt({
          id: this.generateAttemptId(),
          identifier,
          route: req.path,
          method: req.method,
          timestamp: new Date(),
          allowed: !blocked,
          ruleApplied: appliedRule?.id,
          responseTime: Date.now() - startTime,
          userAgent: req.headers['user-agent'] || '',
          headers: this.sanitizeHeaders(req.headers),
          blocked,
          banExpires: blocked && appliedRule?.actions.banDuration 
            ? new Date(Date.now() + appliedRule.actions.banDuration)
            : undefined
        });

        // Apply ban if needed
        if (blocked && appliedRule?.actions.banDuration) {
          this.bannedIdentifiers.set(identifier, new Date(Date.now() + appliedRule.actions.banDuration));
        }

        // Add rate limit headers
        if (limitStatus) {
          res.setHeader('X-RateLimit-Limit', limitStatus.currentWindow.limit.toString());
          res.setHeader('X-RateLimit-Remaining', limitStatus.currentWindow.remaining.toString());
          res.setHeader('X-RateLimit-Reset', Math.ceil(limitStatus.currentWindow.resetTime.getTime() / 1000).toString());
          res.setHeader('X-RateLimit-Window', '1');
        }

        // Handle blocked request
        if (blocked && appliedRule) {
          // Apply delay if specified
          if (delayMs > 0) {
            await this.delay(delayMs);
          }

          // Send custom response or default rate limit response
          const response = appliedRule.actions.customResponse || {
            statusCode: 429,
            message: 'Too many requests',
            headers: {
              'Retry-After': limitStatus ? Math.ceil(limitStatus.currentWindow.resetTime.getTime() / 1000).toString() : '60'
            }
          };

          return this.sendRateLimitResponse(res, response);
        }

        // Apply delay for non-blocking rules
        if (delayMs > 0) {
          await this.delay(delayMs);
        }

        next();
      } catch (error) {
        console.error('Rate limiting middleware error:', error);
        next(); // Allow request to proceed on error
      }
    };
  }

  /**
   * Add a new rate limiting rule
   */
  async addRule(rule: Omit<RateLimitRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<RateLimitRule> {

    const newRule: RateLimitRule = {
      ...rule,
      id: this.generateRuleId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.validateRule(newRule);
    this.rules.set(newRule.id, newRule);

    await this.logRateLimitEvent('rule_added', newRule.id, newRule.createdBy, {
      ruleName: newRule.name,
      limits: newRule.limits,
      targets: newRule.targets
    });

    return newRule;
  }

  /**
   * Get rate limit status for an identifier
   */
  async getStatus(identifier: string): Promise<RateLimitStatus | null> {

    return this.statuses.get(identifier) || null;
  }

  /**
   * Get rate limiting statistics
   */
  async getStatistics(timeRange: { start: Date; end: Date }): Promise<{
    totalRequests: number;
    blockedRequests: number;
    uniqueIdentifiers: number;
    topBlockedIPs: Array<{ ip: string; blocks: number }>;
    ruleEffectiveness: Array<{ ruleId: string; ruleName: string; blocks: number }>;
    averageResponseTime: number;
    peakRequestTime: Date;
    adaptiveAdjustments: number;
  }> {
    const allAttempts = Array.from(this.attempts.values()).flat()
      .filter(attempt => attempt.timestamp >= timeRange.start && attempt.timestamp <= timeRange.end);

    const totalRequests = allAttempts.length;
    const blockedRequests = allAttempts.filter(a => a.blocked).length;
    const uniqueIdentifiers = new Set(allAttempts.map(a => a.identifier)).size;

    // Calculate top blocked IPs
    const ipBlocks = new Map<string, number>();
    allAttempts.filter(a => a.blocked).forEach(attempt => {
      ipBlocks.set(attempt.identifier, (ipBlocks.get(attempt.identifier) || 0) + 1);
    });
    const topBlockedIPs = Array.from(ipBlocks.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, blocks]) => ({ ip, blocks }));

    // Calculate rule effectiveness
    const ruleBlocks = new Map<string, number>();
    allAttempts.filter(a => a.blocked && a.ruleApplied).forEach(attempt => {
      ruleBlocks.set(attempt.ruleApplied!, (ruleBlocks.get(attempt.ruleApplied!) || 0) + 1);
    });
    const ruleEffectiveness = Array.from(ruleBlocks.entries())
      .map(([ruleId, blocks]) => ({
        ruleId,
        ruleName: this.rules.get(ruleId)?.name || 'Unknown',
        blocks
      }))
      .sort((a, b) => b.blocks - a.blocks);

    const averageResponseTime = allAttempts.length > 0
      ? allAttempts.reduce((sum, a) => sum + a.responseTime, 0) / allAttempts.length
      : 0;

    // Find peak request time (hour with most requests)
    const hourlyRequests = new Map<string, number>();
    allAttempts.forEach(attempt => {
      const hour = new Date(attempt.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      hourlyRequests.set(hour, (hourlyRequests.get(hour) || 0) + 1);
    });
    const peakHour = Array.from(hourlyRequests.entries())
      .sort(([,a], [,b]) => b - a)[0];
    const peakRequestTime = peakHour ? new Date(peakHour[0]) : new Date();

    return {
      totalRequests,
      blockedRequests,
      uniqueIdentifiers,
      topBlockedIPs,
      ruleEffectiveness,
      averageResponseTime,
      peakRequestTime,
      adaptiveAdjustments: 0 // Would track actual adaptive adjustments
    };
  }

  // Private helper methods

  private initializeDefaultRules(): void {
    // General API rate limit
    const generalRule: RateLimitRule = {
      id: 'general-api-limit',
      name: 'General API Rate Limit',
      description: 'Basic rate limiting for all API endpoints',
      enabled: true,
      priority: 100,
      targets: {
        routes: ['/api/*']
  }
      limits: {
        requests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
        windowType: 'sliding'
  }
      actions: {
        blockRequest: true,
        logAttempt: true
  }
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    // Authentication endpoint strict limit
    const authRule: RateLimitRule = {
      id: 'auth-endpoint-limit',
      name: 'Authentication Rate Limit',
      description: 'Strict rate limiting for authentication endpoints',
      enabled: true,
      priority: 200,
      targets: {
        routes: ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password']
  }
      limits: {
        requests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        windowType: 'fixed'
  }
      actions: {
        blockRequest: true,
        delayRequest: 1000, // 1 second delay
        logAttempt: true,
        notifyAdmin: true,
        banDuration: 60 * 60 * 1000, // 1 hour ban after violations
        customResponse: {
          statusCode: 429,
          message: 'Too many authentication attempts. Please try again later.',
          headers: {
            'X-Security-Alert': 'true'
          }
        }
  }
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    // High-value operations limit
    const sensitiveRule: RateLimitRule = {
      id: 'sensitive-operations-limit',
      name: 'Sensitive Operations Rate Limit',
      description: 'Rate limiting for sensitive operations',
      enabled: true,
      priority: 300,
      targets: {
        routes: ['/api/admin/*', '/api/export/*', '/api/billing/*']
  }
      limits: {
        requests: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
        windowType: 'token_bucket',
        burst: 3,
        refillRate: 0.1 // 1 token every 10 seconds
  }
      actions: {
        blockRequest: true,
        requireMFA: true,
        logAttempt: true,
        notifyAdmin: true
  }
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.rules.set(generalRule.id, generalRule);
    this.rules.set(authRule.id, authRule);
    this.rules.set(sensitiveRule.id, sensitiveRule);
  }

  private generateIdentifier(req: Request, trustProxy: boolean = false): string {
    // Get IP address
    let ip = req.ip;
    if (trustProxy && req.headers['x-forwarded-for']) {
      ip = (req.headers['x-forwarded-for'] as string).split(',')[0].trim();
    }

    // Include user ID if authenticated
    const userId = (req as any).user?.id;
    
    return userId ? `user:${userId}` : `ip:${ip}`;
  }

  private async getApplicableRules(req: Request, identifier: string): Promise<RateLimitRule[]> {

    const applicableRules: RateLimitRule[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      if (await this.ruleApplies(rule, req, identifier)) {
        applicableRules.push(rule);
      }
    }

    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  private async ruleApplies(rule: RateLimitRule, req: Request, identifier: string): Promise<boolean> {

    const { targets, conditions } = rule;

    // Check route targeting
    if (targets.routes && !targets.routes.some(route => {
      const routePattern = route.replace(/\*/g, '.*');
      return new RegExp(`^${routePattern}$`).test(req.path);
    })) {
      return false;
    }

    // Check method targeting
    if (targets.methods && !targets.methods.includes(req.method)) {
      return false;
    }

    // Check IP targeting
    if (targets.ipAddresses || targets.ipRanges) {
      const ip = identifier.startsWith('ip:') ? identifier.slice(3) : null;
      if (ip) {
        if (targets.ipAddresses && !targets.ipAddresses.includes(ip)) {
          return false;
        }
        // IP range checking would be implemented here
      }
    }

    // Check user targeting
    if (targets.userIds || targets.userRoles) {
      const userId = identifier.startsWith('user:') ? identifier.slice(5) : null;
      if (userId) {
        if (targets.userIds && !targets.userIds.includes(userId)) {
          return false;
        }
        // User role checking would require user service integration
      }
    }

    // Check user agent targeting
    if (targets.userAgents) {
      const userAgent = req.headers['user-agent'] || '';
      if (!targets.userAgents.some(ua => userAgent.includes(ua))) {
        return false;
      }
    }

    // Check conditions
    if (conditions) {
      if (conditions.userAuthenticated !== undefined) {
        const isAuthenticated = !!(req as any).user;
        if (conditions.userAuthenticated !== isAuthenticated) {
          return false;
        }
      }

      if (conditions.headerPresent && !req.headers[conditions.headerPresent.toLowerCase()]) {
        return false;
      }

      if (conditions.queryParamPresent && !req.query[conditions.queryParamPresent]) {
        return false;
      }

      // Time-based conditions would be checked here
    }

    return true;
  }

  private async checkRule(
    rule: RateLimitRule, 
    identifier: string, 
    req: Request
  ): Promise<{ allowed: boolean; status: RateLimitStatus }> {

    const now = new Date();
    let status = this.statuses.get(identifier);

    if (!status) {
      status = this.createInitialStatus(identifier, rule, now);
      this.statuses.set(identifier, status);
    }

    // Update status based on window type
    switch (rule.limits.windowType) {
    case 'fixed':
      return this.checkFixedWindow(rule, status, now);
    case 'sliding':
      return this.checkSlidingWindow(rule, status, identifier, now);
    case 'token_bucket':
      return this.checkTokenBucket(rule, status, identifier, now);
    default:
      return { allowed: true, status };
    }
  }

  private checkFixedWindow(
    rule: RateLimitRule, 
    status: RateLimitStatus, 
    now: Date
  ): { allowed: boolean; status: RateLimitStatus } {
    const windowStart = new Date(Math.floor(now.getTime() / rule.limits.windowMs) * rule.limits.windowMs);
    
    // Reset if we're in a new window
    if (status.currentWindow.startTime < windowStart) {
      status.currentWindow = {
        startTime: windowStart,
        requests: 0,
        limit: rule.limits.requests,
        remaining: rule.limits.requests,
        resetTime: new Date(windowStart.getTime() + rule.limits.windowMs)
      };
    }

    const allowed = status.currentWindow.requests < rule.limits.requests;
    
    if (allowed) {
      status.currentWindow.requests++;
      status.currentWindow.remaining = rule.limits.requests - status.currentWindow.requests;
      status.totalRequests++;
      status.lastRequest = now;
    } else {
      status.blockedRequests++;
    }

    return { allowed, status };
  }

  private checkSlidingWindow(
    rule: RateLimitRule, 
    status: RateLimitStatus, 
    identifier: string, 
    now: Date
  ): { allowed: boolean; status: RateLimitStatus } {
    const attempts = this.attempts.get(identifier) || [];
    const windowStart = new Date(now.getTime() - rule.limits.windowMs);
    
    // Count requests in the sliding window
    const recentAttempts = attempts.filter(attempt => 
      attempt.timestamp >= windowStart && attempt.allowed
    );

    const allowed = recentAttempts.length < rule.limits.requests;
    
    // Update status
    status.currentWindow = {
      startTime: windowStart,
      requests: recentAttempts.length + (allowed ? 1 : 0),
      limit: rule.limits.requests,
      remaining: Math.max(0, rule.limits.requests - recentAttempts.length - (allowed ? 1 : 0)),
      resetTime: new Date(now.getTime() + rule.limits.windowMs)
    };

    if (allowed) {
      status.totalRequests++;
      status.lastRequest = now;
    } else {
      status.blockedRequests++;
    }

    return { allowed, status };
  }

  private checkTokenBucket(
    rule: RateLimitRule, 
    status: RateLimitStatus, 
    identifier: string, 
    now: Date
  ): { allowed: boolean; status: RateLimitStatus } {
    let bucket = this.tokenBuckets.get(identifier);
    
    if (!bucket) {
      bucket = {
        tokens: rule.limits.burst || rule.limits.requests,
        lastRefill: now
      };
      this.tokenBuckets.set(identifier, bucket);
    }

    // Refill tokens based on time elapsed
    const timeSinceRefill = now.getTime() - bucket.lastRefill.getTime();
    const tokensToAdd = (timeSinceRefill / 1000) * (rule.limits.refillRate || 1);
    bucket.tokens = Math.min(
      rule.limits.burst || rule.limits.requests,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;

    const allowed = bucket.tokens >= 1;
    
    if (allowed) {
      bucket.tokens--;
      status.totalRequests++;
      status.lastRequest = now;
    } else {
      status.blockedRequests++;
    }

    // Update status
    status.currentWindow = {
      startTime: now,
      requests: status.totalRequests,
      limit: rule.limits.requests,
      remaining: Math.floor(bucket.tokens),
      resetTime: new Date(now.getTime() + ((1 - (bucket.tokens % 1)) / (rule.limits.refillRate || 1)) * 1000)
    };

    return { allowed, status };
  }

  private createInitialStatus(identifier: string, rule: RateLimitRule, now: Date): RateLimitStatus {
    return {
      identifier,
      currentWindow: {
        startTime: now,
        requests: 0,
        limit: rule.limits.requests,
        remaining: rule.limits.requests,
        resetTime: new Date(now.getTime() + rule.limits.windowMs)
  }
      totalRequests: 0,
      blockedRequests: 0,
      lastRequest: now,
      banned: false,
      appliedRules: [rule.id]
    };
  }

  private isBanned(identifier: string): boolean {
    const banExpires = this.bannedIdentifiers.get(identifier);
    if (!banExpires) return false;
    
    if (banExpires <= new Date()) {
      this.bannedIdentifiers.delete(identifier);
      return false;
    }
    
    return true;
  }

  private async recordAttempt(attempt: RateLimitAttempt): Promise<void> {

    let attempts = this.attempts.get(attempt.identifier) || [];
    attempts.push(attempt);
    
    // Keep only recent attempts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    attempts = attempts.filter(a => a.timestamp >= oneDayAgo);
    
    this.attempts.set(attempt.identifier, attempts);
  }

  private sendRateLimitResponse(res: Response, response: {
    statusCode: number;
    message: string;
    headers?: Record<string, string>;
  }): void {
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    res.status(response.statusCode).json({
      error: 'Rate limit exceeded',
      message: response.message,
      timestamp: new Date().toISOString()
    });
  }

  private async delay(ms: number): Promise<void> {

    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const allowedHeaders = ['user-agent', 'accept', 'content-type', 'authorization'];
    
    allowedHeaders.forEach(header => {
      if (headers[header]) {
        sanitized[header] = typeof headers[header] === 'string' 
          ? headers[header] 
          : headers[header].toString();
      }
    });

    return sanitized;
  }

  private startMaintenanceTasks(): void {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);

    // Adaptive adjustments every 15 minutes
    if (this.adaptiveConfig.enabled) {
      setInterval(() => {
        this.performAdaptiveAdjustments();
      }, this.adaptiveConfig.adjustmentInterval * 60 * 1000);
    }
  }

  private cleanupOldData(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Clean up old attempts
    for (const [identifier, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(a => a.timestamp >= oneDayAgo);
      if (recentAttempts.length === 0) {
        this.attempts.delete(identifier);
      } else {
        this.attempts.set(identifier, recentAttempts);
      }
    }

    // Clean up expired bans
    for (const [identifier, banExpires] of this.bannedIdentifiers.entries()) {
      if (banExpires <= new Date()) {
        this.bannedIdentifiers.delete(identifier);
      }
    }
  }

  private performAdaptiveAdjustments(): void {
    // Analyze traffic patterns and adjust limits
    const now = new Date();
    const learningStart = new Date(now.getTime() - this.adaptiveConfig.learningPeriod * 60 * 60 * 1000);
    
    // This would implement machine learning-based adaptive adjustments
    // For now, just log that adaptive adjustment would occur
    console.log('Performing adaptive rate limit adjustments based on traffic patterns');
  }

  private async validateRule(rule: RateLimitRule): Promise<void> {

    if (rule.limits.requests <= 0) {
      throw new Error('Request limit must be positive');
    }

    if (rule.limits.windowMs <= 0) {
      throw new Error('Window duration must be positive');
    }

    if (rule.limits.windowType === 'token_bucket') {
      if (!rule.limits.burst || rule.limits.burst <= 0) {
        throw new Error('Token bucket burst size must be specified and positive');
      }
      if (!rule.limits.refillRate || rule.limits.refillRate <= 0) {
        throw new Error('Token bucket refill rate must be specified and positive');
      }
    }
  }

  private generateRuleId(): string {
    return `RL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateAttemptId(): string {
    return `RA-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  private async logRateLimitEvent(action: string, target: string, performedBy: string, metadata: any): Promise<void> {

    console.log(`Rate Limit Event: ${action} for ${target} by ${performedBy}`, metadata);
  }
}