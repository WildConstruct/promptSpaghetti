/**
 * Client-side rate limiter for auth operations
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

export class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  }) {
    this.config = config;
    
    // Clean up old entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }
  
  /**
   * Check if an action is rate limited
   */
  isRateLimited(key: string): { limited: boolean; retryAfter?: number } {
    const record = this.attempts.get(key);
    
    if (!record) {
      return { limited: false };
    }
    
    const now = Date.now();
    
    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        limited: true,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000)
      };
    }
    
    // Check if window has expired
    if (now - record.firstAttempt > this.config.windowMs) {
      this.attempts.delete(key);
      return { limited: false };
    }
    
    // Check if limit exceeded
    if (record.count >= this.config.maxAttempts) {
      // Block the user
      record.blockedUntil = now + (this.config.blockDurationMs || this.config.windowMs);
      return {
        limited: true,
        retryAfter: Math.ceil((this.config.blockDurationMs || this.config.windowMs) / 1000)
      };
    }
    
    return { limited: false };
  }
  
  /**
   * Record an attempt
   */
  recordAttempt(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
    } else {
      // Reset if window expired
      if (now - record.firstAttempt > this.config.windowMs) {
        this.attempts.set(key, {
          count: 1,
          firstAttempt: now
        });
      } else {
        record.count++;
      }
    }
  }
  
  /**
   * Reset attempts for a key (e.g., after successful login)
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.attempts.forEach((record, key) => {
      // Remove if window expired and not blocked
      if (now - record.firstAttempt > this.config.windowMs && 
          (!record.blockedUntil || now > record.blockedUntil)) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.attempts.delete(key));
  }
  
  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return this.config.maxAttempts;
    
    const now = Date.now();
    if (now - record.firstAttempt > this.config.windowMs) {
      return this.config.maxAttempts;
    }
    
    return Math.max(0, this.config.maxAttempts - record.count);
  }
}

// Singleton instance for auth rate limiting
export const authRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes
});