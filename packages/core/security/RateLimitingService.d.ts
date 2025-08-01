/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Comprehensive Rate Limiting Service
 *
 * Advanced rate limiting system for authentication endpoints with intelligent
 * backoff strategies, threat detection, and adaptive protection mechanisms.
 *
 * Features:
 * - Multi-tier rate limiting (IP, user, endpoint-specific)
 * - Intelligent backoff algorithms (exponential, linear, fibonacci)
 * - Threat-based adaptive limits
 * - Geographic and behavioral analysis
 * - Integration with security monitoring
 */
import { EventEmitter } from 'events';
export declare enum RateLimitStrategy { FIXED_WINDOW = "fixed_window",
    SLIDING_WINDOW = "sliding_window",
    TOKEN_BUCKET = "token_bucket",
    LEAKY_BUCKET = "leaky_bucket"

export declare enum BackoffStrategy {
    EXPONENTIAL = "exponential",
    LINEAR = "linear",
    FIBONACCI = "fibonacci",
    CUSTOM = "custom"

export declare enum EndpointCategory {
    AUTHENTICATION = "authentication",
    MFA_VERIFICATION = "mfa_verification",
    PASSWORD_RESET = "password_reset",
    REGISTRATION = "registration",
    PROFILE_UPDATE = "profile_update",
    ADMIN_OPERATIONS = "admin_operations"

export declare enum ThreatLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export declare enum RateLimitResult {
    ALLOWED = "allowed",
    BLOCKED = "blocked" }
    WARNING = "warning"

}
}
export interface RateLimitConfig { strategy: RateLimitStrategy;
    windowSize: number;
    maxRequests: number;
    backoffStrategy: BackoffStrategy;
    burstAllowance?: number;
    exemptionsEnabled: boolean;
    adaptiveEnabled: boolean;
    threatDetectionEnabled: boolean }
}
}
export interface EndpointLimits { category: EndpointCategory;
    endpoint: string;
    limits: {
        perSecond: number;
        perMinute: number;
        perHour: number;
        perDay: number }
}
    };
    backoff: { strategy: BackoffStrategy;
        baseDelay: number;
        maxDelay: number;
        multiplier: number };
    burst: { enabled: boolean;
        size: number;
        refillRate: number };
    adaptiveTriggers: { suspiciousActivityThreshold: number;
        threatLevelAdjustments: Record<ThreatLevel, number> };

}
}
export interface RateLimitAttempt { identifier: string;
    endpoint: string;
    timestamp: Date;
    success: boolean;
    metadata: {
        userAgent?: string;
        location?: string;
        sessionId?: string;
        userId?: string;
        threatLevel: ThreatLevel }
}
    };

}
}
export interface RateLimitStatus { identifier: string;
    endpoint: string;
    result: RateLimitResult;
    remainingRequests: number;
    resetTime: Date;
    retryAfter?: number;
    backoffLevel: number;
    threatLevel: ThreatLevel;
    adaptiveMultiplier: number }
}
}
export interface BackoffState { identifier: string;
    endpoint: string;
    level: number;
    nextAllowedTime: Date;
    consecutiveFailures: number;
    totalFailures: number;
    lastFailureTime: Date }
}
}
export interface ThreatContext { identifier: string;
    threatLevel: ThreatLevel;
    indicators: string[];
    geolocation?: {
        country: string;
        region: string;
        suspicious: boolean }
}
    };
    behaviorPattern: { rapidRequests: boolean;
        unusualTiming: boolean;
        multipleEndpoints: boolean;
        newDevice: boolean };
    confidence: number;
/**
 * Advanced rate limiting service with threat detection and adaptive protection
 */
export declare class RateLimitingService extends EventEmitter { private attempts;
    private backoffStates;
    private threatContexts;
    private endpointConfigs;
    private exemptions;
    constructor();
    /**
     * Check if request should be allowed based on rate limits
     */
    checkRateLimit();
      identifier: string
      endpoint: string
      metadata?: Partial<RateLimitAttempt['metadata']>
    ): Promise<RateLimitStatus>;
    /**
     * Record an authentication attempt
     */
    recordAttempt();
      identifier: string
      endpoint: string
      success: boolean }
      metadata?: Partial<RateLimitAttempt['metadata']>
    ): void;
    /**
     * Add rate limit exemption for identifier
     */
    addExemption(identifier: string, reason?: string): void;
    /**
     * Remove rate limit exemption
     */
    removeExemption(identifier: string): boolean;
    /**
     * Get current backoff delay for identifier
     */
    getBackoffDelay(identifier: string, endpoint: string): number;
    /**
     * Get the calculated backoff delay for the current level (for testing)
     */
    getCalculatedBackoffDelay(identifier: string, endpoint: string): number;
    /**
     * Reset rate limits and backoff for identifier
     */
    resetLimits(identifier: string, endpoint?: string): void;
    /**
     * Get recent attempts for integration purposes (public version)
     */
    getRecentAttemptsForIntegration(identifier: string, endpoint: string): RateLimitAttempt[];
    /**
     * Get rate limiting statistics
     */
    getStatistics(): { totalAttempts: number;
        blockedAttempts: number;
        activeBackoffs: number;
        threatLevels: Record<ThreatLevel, number>;
        topEndpoints: Array<{
            endpoint: string;
            attempts: number }>;
    };
    private initializeDefaultConfigs;
    private getEndpointConfig;
    private getDefaultConfig;
    private assessThreatLevel;
    private calculateAdaptiveMultiplier;
    private getBackoffState;
    private updateBackoffState;
    private calculateBackoffDelay;
    private fibonacci;
    private getRecentAttempts;
    private getAdjustedLimits;
    private evaluateRateLimits;
    private updateThreatContext;
    private createAllowedStatus;
    private getAttemptKey;
    private getBackoffKey;
    private startCleanupTimer;

export default RateLimitingService;
//# sourceMappingURL=RateLimitingService.d.ts.map