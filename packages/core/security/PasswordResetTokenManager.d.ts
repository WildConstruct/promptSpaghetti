/**
 * Password Reset Token Manager
 *
 * Comprehensive system for managing time-limited password reset tokens with
 * security features including expiration, single-use validation, rate limiting,
 * and secure token generation and verification.
 *
 * Features:
 * - Cryptographically secure token generation
 * - Time-limited token expiration
 * - Single-use token validation
 * - Rate limiting for reset requests
 * - Security audit logging
 * - Token revocation and cleanup
 * - Anti-enumeration protection
 * - Configurable security policies
 */
import { EventEmitter } from 'events';
export declare enum TokenType {
    PASSWORD_RESET = "password_reset",
    EMAIL_VERIFICATION = "email_verification",
    ACCOUNT_RECOVERY = "account_recovery",
    TWO_FACTOR_SETUP = "two_factor_setup",
    DEVICE_VERIFICATION = "device_verification"

export declare enum TokenStatus {
    ACTIVE = "active",
    USED = "used",
    EXPIRED = "expired",
    REVOKED = "revoked",
    INVALID = "invalid"

export declare enum SecurityLevel {
    STANDARD = "standard",// Normal security
    ENHANCED = "enhanced",// Higher security requirements
    MAXIMUM = "maximum"

}
export interface TokenConfig {
    defaultExpiration: number;
    maxExpiration: number;
    tokenLength: number;
    hashRounds: number;
    rateLimitWindow: number;
    rateLimitCount: number;
    cleanupInterval: number;
    securityLevel: SecurityLevel;
    antiEnumerationDelay: number;
    enableAuditLogging: boolean;
    requireEmailVerification: boolean;
    allowMultipleTokens: boolean;

}
export interface ResetToken {
    id: string;
    userId: string;
    email: string;
    type: TokenType;
    status: TokenStatus;
    hashedToken: string;
    salt: string;
    createdAt: Date;
    expiresAt: Date;
    usedAt?: Date;
    revokedAt?: Date;
    ipAddress: string;
    userAgent: string;
    securityLevel: SecurityLevel;
    metadata: {
        requestSource?: string;
        deviceFingerprint?: string;
        locationData?: any;
        additionalContext?: Record<string, any>;
}
    };
    usageCount: number;
    maxUsageCount: number;
    revocationReason?: string;

}
export interface TokenRequest {
    userId: string;
    email: string;
    type: TokenType;
    ipAddress: string;
    userAgent: string;
    expirationMinutes?: number;
    securityLevel?: SecurityLevel;
    metadata?: Record<string, any>;

}
export interface TokenValidation {
    valid: boolean;
    token?: ResetToken;
    reason?: string;
    securityEvents?: string[];
    riskScore?: number;

}
export interface RateLimitData {
    count: number;
    resetTime: number;
    lastRequest: Date;
    violationCount: number;

export declare enum SecurityEvent {
    TOKEN_CREATED = "token_created",
    TOKEN_VALIDATED = "token_validated",
    TOKEN_USED = "token_used",
    TOKEN_EXPIRED = "token_expired",
    TOKEN_REVOKED = "token_revoked",
    INVALID_TOKEN_ATTEMPT = "invalid_token_attempt",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    TOKEN_CLEANUP = "token_cleanup"

}
export interface AuditLogEntry {
    id: string;
    event: SecurityEvent;
    timestamp: Date;
    userId?: string;
    tokenId?: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, any>;
    riskScore: number;
    sessionId?: string;

}
export interface TokenStatistics {
    totalTokens: number;
    activeTokens: number;
    usedTokens: number;
    expiredTokens: number;
    revokedTokens: number;
    tokensByType: Record<TokenType, number>;
    tokensBySecurityLevel: Record<SecurityLevel, number>;
    averageTokenLifetime: number;
    usageRate: number;
    securityViolations: number;
    rateLimitViolations: number;
    cleanupStats: {
        lastCleanup: Date;
        tokensRemoved: number;
        auditLogsRemoved: number;
}
    };
/**
 * Comprehensive password reset token management service
 */
export declare class PasswordResetTokenManager extends EventEmitter {
    private tokens;
    private rateLimits;
    private auditLog;
    private config;
    private cleanupTimer?;
    constructor(config?: Partial<TokenConfig>);
    /**
     * Generate a new password reset token
     */
    generateToken(request: TokenRequest): Promise<{
        token: string;
        tokenId: string;
    } | null>;
    /**
     * Validate a password reset token
     */
    validateToken(tokenValue: string, ipAddress: string, userAgent: string): Promise<TokenValidation>;
    /**
     * Use a password reset token (marks it as used)
     */
    useToken(tokenValue: string, ipAddress: string, userAgent: string): Promise<{
        success: boolean;
        token?: ResetToken;
        reason?: string;
    }>;
    /**
     * Revoke a specific token
     */
    revokeToken(tokenId: string, reason: string, ipAddress?: string, userAgent?: string): Promise<boolean>;
    /**
     * Revoke all tokens for a user
     */
    revokeUserTokens(userId: string, type?: TokenType, reason?: string): Promise<number>;
    /**
     * Get token information (without sensitive data)
     */
    getTokenInfo(tokenId: string): Partial<ResetToken> | null;
    /**
     * Get tokens for a specific user
     */
    getUserTokens(userId: string, type?: TokenType): Partial<ResetToken>[];
    /**
     * Get comprehensive token statistics
     */
    getStatistics(): TokenStatistics;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<TokenConfig>): void;
    private mergeConfig;
    private generateSecureToken;
    private generateTokenId;
    private hashToken;
    private calculateExpiration;
    private performTokenValidation;
    private calculateRiskScore;
    private isRateLimited;
    private updateRateLimit;
    private antiEnumerationDelay;
    private logSecurityEvent;
    private startCleanupTimer;
    private performCleanup;
    /**
     * Destroy the token manager and clean up resources
     */
    destroy(): void;

export declare const passwordResetTokenManager: PasswordResetTokenManager;
export default PasswordResetTokenManager;
//# sourceMappingURL=PasswordResetTokenManager.d.ts.map