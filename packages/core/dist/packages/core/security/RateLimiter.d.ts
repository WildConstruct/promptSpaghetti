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
    LEAKY_BUCKET = "leaky_bucket",
    export,
    enum,
    RateLimitScope
}
export declare class MemoryRateLimitStore implements RateLimitStore {
    private store;
    private cleanupInterval;
    constructor(cleanupIntervalMs?: number);
}
//# sourceMappingURL=RateLimiter.d.ts.map