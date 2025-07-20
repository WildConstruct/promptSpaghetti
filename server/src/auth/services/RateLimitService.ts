// Epic 11 Rate Limiting Service
// Redis-based rate limiting with sliding window algorithm

import { IRateLimitService, RateLimitRule, RateLimitResult } from '../types';
import { RedisService } from '../database/RedisService';

export class RateLimitService implements IRateLimitService {
  private redis: RedisService;

  constructor(redis: RedisService) {
    this.redis = redis;
  }

  async checkRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const rateLimitKey = `rate_limit:${key}`;
    
    try {
      const result = await this.redis.checkRateLimit(
        rateLimitKey,
        rule.window,
        rule.max
      );

      return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
        totalRequests: result.count
      };
    } catch (error) {
      console.error(`Rate limit check error for key ${key}:`, error);
      
      // Default to allowing the request if Redis is down
      return {
        allowed: true,
        remaining: rule.max - 1,
        resetTime: new Date(Date.now() + rule.window * 1000),
        totalRequests: 1
      };
    }
  }

  async resetRateLimit(key: string): Promise<void> {
    const rateLimitKey = `rate_limit:${key}`;
    
    try {
      await this.redis.del(rateLimitKey);
    } catch (error) {
      console.error(`Rate limit reset error for key ${key}:`, error);
      throw error;
    }
  }

  // Advanced rate limiting with multiple rules
  async checkMultipleRateLimits(
    key: string,
    rules: Array<{ name: string; rule: RateLimitRule }>
  ): Promise<Record<string, RateLimitResult>> {
    const results: Record<string, RateLimitResult> = {};
    
    for (const { name, rule } of rules) {
      const ruleKey = `${key}:${name}`;
      results[name] = await this.checkRateLimit(ruleKey, rule);
    }
    
    return results;
  }

  // Get rate limit status without incrementing
  async getRateLimitStatus(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const rateLimitKey = `rate_limit:${key}`;
    
    try {
      const now = Date.now();
      const client = this.redis.getClient();
      
      // Count current entries without adding new one
      await client.zremrangebyscore(rateLimitKey, 0, now - rule.window * 1000);
      const count = await client.zcard(rateLimitKey);
      
      const remaining = Math.max(0, rule.max - count);
      const resetTime = new Date(now + rule.window * 1000);
      
      return {
        allowed: count < rule.max,
        remaining,
        resetTime,
        totalRequests: count
      };
    } catch (error) {
      console.error(`Rate limit status error for key ${key}:`, error);
      
      return {
        allowed: true,
        remaining: rule.max,
        resetTime: new Date(Date.now() + rule.window * 1000),
        totalRequests: 0
      };
    }
  }

  // IP-based rate limiting
  async checkIPRateLimit(
    ip: string,
    endpoint: string,
    rule: RateLimitRule
  ): Promise<RateLimitResult> {
    const key = `ip:${ip}:${endpoint}`;
    return this.checkRateLimit(key, rule);
  }

  // User-based rate limiting
  async checkUserRateLimit(
    userId: string,
    endpoint: string,
    rule: RateLimitRule
  ): Promise<RateLimitResult> {
    const key = `user:${userId}:${endpoint}`;
    return this.checkRateLimit(key, rule);
  }

  // Global rate limiting
  async checkGlobalRateLimit(
    endpoint: string,
    rule: RateLimitRule
  ): Promise<RateLimitResult> {
    const key = `global:${endpoint}`;
    return this.checkRateLimit(key, rule);
  }

  // Generic rate limiting with custom key (for PasswordResetService)
  async checkLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number
  ): Promise<void> {
    const rule: RateLimitRule = {
      window: windowSeconds,
      max: maxAttempts
    };

    const result = await this.checkRateLimit(key, rule);
    
    if (!result.allowed) {
      const resetInMinutes = Math.ceil((result.resetTime.getTime() - Date.now()) / (1000 * 60));
      throw new Error(`Rate limit exceeded. Try again in ${resetInMinutes} minutes.`);
    }
  }

  // Adaptive rate limiting based on response times
  async adaptiveRateLimit(
    key: string,
    baseRule: RateLimitRule,
    avgResponseTime: number,
    targetResponseTime: number = 200
  ): Promise<RateLimitResult> {
    // Adjust rate limit based on performance
    let adjustedMax = baseRule.max;
    
    if (avgResponseTime > targetResponseTime * 2) {
      // High response time - reduce limit by 50%
      adjustedMax = Math.max(1, Math.floor(baseRule.max * 0.5));
    } else if (avgResponseTime > targetResponseTime) {
      // Moderate response time - reduce limit by 25%
      adjustedMax = Math.max(1, Math.floor(baseRule.max * 0.75));
    } else if (avgResponseTime < targetResponseTime * 0.5) {
      // Fast response time - increase limit by 25%
      adjustedMax = Math.floor(baseRule.max * 1.25);
    }
    
    const adaptedRule: RateLimitRule = {
      ...baseRule,
      max: adjustedMax
    };
    
    return this.checkRateLimit(key, adaptedRule);
  }

  // Rate limiting with buckets (token bucket algorithm)
  async tokenBucketRateLimit(
    key: string,
    capacity: number,
    refillRate: number, // tokens per second
    tokensRequested: number = 1
  ): Promise<RateLimitResult> {
    const bucketKey = `bucket:${key}`;
    
    try {
      const client = this.redis.getClient();
      const now = Date.now() / 1000; // Convert to seconds
      
      // Get current bucket state
      const bucketData = await this.redis.get(bucketKey);
      let tokens = capacity;
      let lastRefill = now;
      
      if (bucketData) {
        const parsed = JSON.parse(bucketData);
        tokens = parsed.tokens;
        lastRefill = parsed.lastRefill;
      }
      
      // Calculate tokens to add based on time elapsed
      const timeElapsed = now - lastRefill;
      const tokensToAdd = timeElapsed * refillRate;
      tokens = Math.min(capacity, tokens + tokensToAdd);
      
      // Check if we have enough tokens
      const allowed = tokens >= tokensRequested;
      
      if (allowed) {
        tokens -= tokensRequested;
      }
      
      // Store updated bucket state
      await this.redis.setex(
        bucketKey,
        Math.ceil(capacity / refillRate) + 60, // TTL slightly longer than full refill time
        JSON.stringify({
          tokens,
          lastRefill: now
        })
      );
      
      return {
        allowed,
        remaining: Math.floor(tokens),
        resetTime: new Date((now + (capacity - tokens) / refillRate) * 1000),
        totalRequests: capacity - Math.floor(tokens)
      };
    } catch (error) {
      console.error(`Token bucket rate limit error for key ${key}:`, error);
      
      return {
        allowed: true,
        remaining: capacity - tokensRequested,
        resetTime: new Date(Date.now() + 60000),
        totalRequests: tokensRequested
      };
    }
  }

  // Clean up expired rate limit data
  async cleanup(): Promise<void> {
    try {
      const client = this.redis.getClient();
      const pattern = 'rate_limit:*';
      const keys = await client.keys(pattern);
      
      let cleanedCount = 0;
      
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          // Key exists but has no expiry - clean it up
          await this.redis.del(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired rate limit keys`);
      }
    } catch (error) {
      console.error('Rate limit cleanup error:', error);
    }
  }

  // Get rate limit statistics
  async getStats(pattern: string = 'rate_limit:*'): Promise<{
    totalKeys: number;
    activeKeys: number;
    topKeys: Array<{ key: string; count: number }>;
  }> {
    try {
      const client = this.redis.getClient();
      const keys = await client.keys(pattern);
      
      let activeKeys = 0;
      const keyCounts: Array<{ key: string; count: number }> = [];
      
      for (const key of keys) {
        const count = await client.zcard(key);
        if (count > 0) {
          activeKeys++;
          keyCounts.push({ key: key.replace('rate_limit:', ''), count });
        }
      }
      
      // Sort by count descending
      keyCounts.sort((a, b) => b.count - a.count);
      
      return {
        totalKeys: keys.length,
        activeKeys,
        topKeys: keyCounts.slice(0, 10)
      };
    } catch (error) {
      console.error('Rate limit stats error:', error);
      return {
        totalKeys: 0,
        activeKeys: 0,
        topKeys: []
      };
    }
  }
}