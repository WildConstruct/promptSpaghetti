/**
 * Rate Limiter Implementation
 * Task: T-1752989143997-184 - Create rate limiter implementation
 * Epic 19: Authentication Enhancement & Security Hardening
 */
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (context: RateLimitContext) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    resetExpiredHits?: boolean;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    store?: RateLimitStore;
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
    body?: unknown;
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
    increment(key: string, windowMs: number): Promise<{
        hits: number;
        resetTime: Date;
    }>;
    reset(key: string): Promise<void>;
    cleanup(): Promise<void>;
}
export interface RateLimitData {
    hits: number;
    resetTime: number;
    windowStart: number;
}
export declare enum RateLimitStrategyType {
    FIXED_WINDOW = "fixed_window",
    SLIDING_WINDOW = "sliding_window",
    TOKEN_BUCKET = "token_bucket",
    LEAKY_BUCKET = "leaky_bucket"
}
export declare enum RateLimitScope {
    GLOBAL = "global",
    IP = "ip",
    USER = "user",
    ENDPOINT = "endpoint",
    CUSTOM = "custom"
}
export declare class MemoryRateLimitStore implements RateLimitStore {
    private store;
    private cleanupInterval;
    constructor(cleanupIntervalMs?: number);
    get(key: string): Promise<RateLimitData | null>;
    set(key: string, data: RateLimitData, ttlMs: number): Promise<void>;
    increment(key: string, windowMs: number): Promise<{
        hits: number;
        resetTime: Date;
    }>;
    reset(key: string): Promise<void>;
    cleanup(): Promise<void>;
    destroy(): void;
    getStats(): {
        totalKeys: number;
        totalHits: number;
    };
}
export declare class RateLimitKeyGenerator {
    /**
     * Generate key based on IP address
     */
    static byIP(context: RateLimitContext): string;
    /**
     * Generate key based on user ID
     */
    static byUser(context: RateLimitContext): string;
    /**
     * Generate key based on endpoint
     */
    static byEndpoint(context: RateLimitContext): string;
    /**
     * Generate key based on IP and endpoint
     */
    static byIPAndEndpoint(context: RateLimitContext): string;
    /**
     * Generate key based on user and endpoint
     */
    static byUserAndEndpoint(context: RateLimitContext): string;
    /**
     * Generate key based on session
     */
    static bySession(context: RateLimitContext): string;
    /**
     * Generate key based on organization
     */
    static byOrganization(context: RateLimitContext): string;
    /**
     * Generate composite key with multiple factors
     */
    static composite(factors: string[]): (context: RateLimitContext) => string;
}
export declare abstract class RateLimitStrategy {
    protected config: RateLimitConfig;
    protected store: RateLimitStore;
    constructor(config: RateLimitConfig, store: RateLimitStore);
    abstract checkLimit(key: string, context: RateLimitContext): Promise<RateLimitResult>;
    abstract reset(key: string): Promise<void>;
}
export declare class FixedWindowStrategy extends RateLimitStrategy {
    checkLimit(key: string): Promise<RateLimitResult>;
    reset(key: string): Promise<void>;
    private generateHeaders;
    private generateErrorMessage;
}
export declare class RateLimiter {
    private config;
    private strategy;
    private keyGenerator;
    constructor(config?: Partial<RateLimitConfig>);
    private createConfig;
    /**
     * Check if request should be rate limited
     */
    checkLimit(context: RateLimitContext): Promise<RateLimitResult>;
    /**
     * Reset rate limit for a specific key
     */
    resetLimit(context: RateLimitContext): Promise<void>;
    /**
     * Get current rate limit info without incrementing
     */
    getCurrentInfo(context: RateLimitContext): Promise<RateLimitInfo | null>;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<RateLimitConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): RateLimitConfig;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
export declare class RateLimitPresets {
    /**
     * Strict rate limiting for authentication endpoints
     */
    static authentication(): Partial<RateLimitConfig>;
    /**
     * Moderate rate limiting for API endpoints
     */
    static api(): Partial<RateLimitConfig>;
    /**
     * Lenient rate limiting for public content
     */
    static public(): Partial<RateLimitConfig>;
    /**
     * Very strict rate limiting for password reset
     */
    static passwordReset(): Partial<RateLimitConfig>;
    /**
     * Rate limiting for email sending
     */
    static emailSending(): Partial<RateLimitConfig>;
    /**
     * Rate limiting for file uploads
     */
    static fileUpload(): Partial<RateLimitConfig>;
    /**
     * Rate limiting for search operations
     */
    static search(): Partial<RateLimitConfig>;
}
export declare class RateLimitUtils {
    /**
     * Create rate limiter from preset
     */
    static fromPreset(preset: string, customConfig?: Partial<RateLimitConfig>): RateLimiter;
    /**
     * Create multiple rate limiters for different endpoints
     */
    static createMultiple(configs: Record<string, Partial<RateLimitConfig>>): Record<string, RateLimiter>;
    /**
     * Extract IP address from various sources
     */
    static extractIP(headers: Record<string, string>): string | undefined;
    /**
     * Format rate limit info for logging
     */
    static formatInfoForLogging(info: RateLimitInfo, key: string): string;
    /**
     * Calculate optimal window size based on expected traffic
     */
    static calculateOptimalWindow(expectedRequestsPerHour: number): number;
}
export default RateLimiter;
//# sourceMappingURL=RateLimiter.d.ts.map