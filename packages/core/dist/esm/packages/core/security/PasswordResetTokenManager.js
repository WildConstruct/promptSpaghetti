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
import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';
// Token Types and States
export var TokenType;
(function (TokenType) {
    TokenType["PASSWORD_RESET"] = "password_reset";
    TokenType["EMAIL_VERIFICATION"] = "email_verification";
    TokenType["ACCOUNT_RECOVERY"] = "account_recovery";
    TokenType["TWO_FACTOR_SETUP"] = "two_factor_setup";
    TokenType["DEVICE_VERIFICATION"] = "device_verification";
    TokenType[TokenType["export"] = void 0] = "export";
    TokenType[TokenType["enum"] = void 0] = "enum";
    TokenType[TokenType["TokenStatus"] = void 0] = "TokenStatus";
})(TokenType || (TokenType = {}));
{
    ACTIVE = 'active',
        USED = 'used',
        EXPIRED = 'expired',
        REVOKED = 'revoked',
        INVALID = 'invalid';
    export let SecurityLevel;
    (function (SecurityLevel) {
        SecurityLevel["STANDARD"] = "standard";
        SecurityLevel["ENHANCED"] = "enhanced";
        SecurityLevel["MAXIMUM"] = "maximum"; // Highest security for sensitive operations
        // Token Configuration
        SecurityLevel[SecurityLevel["export"] = void 0] = "export";
        SecurityLevel[SecurityLevel["interface"] = void 0] = "interface";
        SecurityLevel[SecurityLevel["TokenConfig"] = void 0] = "TokenConfig";
    })(SecurityLevel || (SecurityLevel = {}));
    {
        defaultExpiration: number; // Default expiration time in milliseconds,
        maxExpiration: number; // Maximum allowed expiration time,
        tokenLength: number; // Length of generated tokens,
        hashRounds: number; // Number of PBKDF2 rounds for hashing,
        rateLimitWindow: number; // Rate limit window in milliseconds,
        rateLimitCount: number; // Maximum requests per window,
        cleanupInterval: number; // Cleanup interval in milliseconds,
        securityLevel: SecurityLevel; // Default security level,
        antiEnumerationDelay: number; // Delay to prevent enumeration attacks,
        enableAuditLogging: boolean; // Enable detailed audit logging,
        requireEmailVerification: boolean; // Require email verification for tokens,
        allowMultipleTokens: boolean; // Allow multiple active tokens per user,
        // Token Data
    }
}
;
usageCount: number;
maxUsageCount: number;
revocationReason ?  : string;
export var SecurityEvent;
(function (SecurityEvent) {
    SecurityEvent["TOKEN_CREATED"] = "token_created";
    SecurityEvent["TOKEN_VALIDATED"] = "token_validated";
    SecurityEvent["TOKEN_USED"] = "token_used";
    SecurityEvent["TOKEN_EXPIRED"] = "token_expired";
    SecurityEvent["TOKEN_REVOKED"] = "token_revoked";
    SecurityEvent["INVALID_TOKEN_ATTEMPT"] = "invalid_token_attempt";
    SecurityEvent["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    SecurityEvent["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    SecurityEvent["TOKEN_CLEANUP"] = "token_cleanup";
    // Audit Log Entry
    SecurityEvent[SecurityEvent["export"] = void 0] = "export";
    SecurityEvent[SecurityEvent["interface"] = void 0] = "interface";
    SecurityEvent[SecurityEvent["AuditLogEntry"] = void 0] = "AuditLogEntry";
})(SecurityEvent || (SecurityEvent = {}));
{
    id: string;
    event: SecurityEvent;
    timestamp: Date;
    userId ?  : string;
    tokenId ?  : string;
    ipAddress: string;
    userAgent: string;
    details: Record;
    riskScore: number;
    sessionId ?  : string;
    // Statistics and Metrics
}
;
export class PasswordResetTokenManager extends EventEmitter {
    tokens = new Map();
    rateLimits = new Map();
    auditLog = [];
    config;
    cleanupTimer;
    constructor(config = {}) {
        super();
        this.config = this.mergeConfig(config);
        this.startCleanupTimer();
        /**
         * Generate a new password reset token
         */
    }
    /**
     * Generate a new password reset token
     */
    async generateToken(request) {
        try {
            // Check rate limiting
            if (this.isRateLimited(request.email, request.ipAddress)) {
                this.logSecurityEvent(SecurityEvent.RATE_LIMIT_EXCEEDED, {});
                email: request.email,
                    ipAddress;
                request.ipAddress,
                    userAgent;
                request.userAgent,
                ;
            }
            ;
            // Apply anti-enumeration delay
            await this.antiEnumerationDelay();
            return null;
            // Generate cryptographically secure token
            const rawToken = this.generateSecureToken();
            const salt = randomBytes(32).toString('hex');
            const hashedToken = this.hashToken(rawToken, salt);
            // Calculate expiration
            const expirationMs = this.calculateExpiration();
            ;
            request.expirationMinutes,
                request.securityLevel || this.config.securityLevel;
            ;
            // Create token record
            const tokenRecord = {
                id: this.generateTokenId(),
                userId: request.userId,
                email: request.email,
                type: request.type,
                status: TokenStatus.ACTIVE,
                hashedToken,
                salt,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + expirationMs),
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
                securityLevel: request.securityLevel || this.config.securityLevel,
                metadata: {
                    requestSource: 'password_reset_manager',
                    ...request.metadata
                },
                usageCount: 0,
                maxUsageCount: 1
            };
            // Revoke existing tokens if not allowed multiple
            if (!this.config.allowMultipleTokens) {
                await this.revokeUserTokens(request.userId, request.type, 'new_token_generated');
                // Store token
                this.tokens.set(tokenRecord.id, tokenRecord);
                // Update rate limiting
                this.updateRateLimit(request.email, request.ipAddress);
                // Log security event
                this.logSecurityEvent(SecurityEvent.TOKEN_CREATED, {});
                tokenId: tokenRecord.id,
                    userId;
                request.userId,
                    email;
                request.email,
                    type;
                request.type,
                    securityLevel;
                tokenRecord.securityLevel,
                    expiresAt;
                tokenRecord.expiresAt,
                ;
            }
            request.ipAddress, request.userAgent;
            ;
            this.emit('tokenGenerated', {});
            tokenId: tokenRecord.id,
                userId;
            request.userId,
                type;
            request.type,
                expiresAt;
            tokenRecord.expiresAt,
            ;
        }
        finally { }
        ;
        return {
            token: rawToken,
            tokenId: tokenRecord.id,
        };
    }
    catch(error) {
        this.logSecurityEvent(SecurityEvent.SUSPICIOUS_ACTIVITY, {});
        error: error instanceof Error ? error.message : 'Unknown error',
            request;
    }
    request;
    ipAddress;
    request;
    userAgent;
    ;
}
return null;
async;
validateToken(tokenValue, string, ipAddress, string, userAgent, string);
Promise < TokenValidation > {
    try: {
        const: validation = await this.performTokenValidation(tokenValue, ipAddress, userAgent),
        // Log validation attempt
        this: .logSecurityEvent(),
        validation, : .valid ? SecurityEvent.TOKEN_VALIDATED : SecurityEvent.INVALID_TOKEN_ATTEMPT,
    } };
{
    tokenValid: validation.valid,
        reason;
    validation.reason,
        riskScore;
    validation.riskScore,
    ;
}
ipAddress,
    userAgent;
;
this.emit('tokenValidated', {});
valid: validation.valid,
    tokenId;
validation.token?.id,
    reason;
validation.reason,
    riskScore;
validation.riskScore,
;
;
return validation;
try { }
catch (error) {
    this.logSecurityEvent(SecurityEvent.SUSPICIOUS_ACTIVITY, {});
    error: error instanceof Error ? error.message : 'Token validation error',
        tokenValue;
    tokenValue.substring(0, 8) + '...'; // Log only prefix for security,
}
ipAddress, userAgent;
;
return {
    valid: false,
    reason: 'validation_error',
    riskScore: 90,
};
async;
useToken(tokenValue, string, ipAddress, string, userAgent, string);
Promise < { success: boolean, token: ResetToken, reason: string } > {
    try: {
        const: validation = await this.validateToken(tokenValue, ipAddress, userAgent),
        if(, validation) { }, : .valid || !validation.token
    }
};
{
    return {
        success: false,
        reason: validation.reason || 'invalid_token',
    };
    const token = validation.token;
    // Mark token as used
    token.status = TokenStatus.USED;
    token.usedAt = new Date();
    token.usageCount++;
    this.tokens.set(token.id, token);
    // Log usage
    this.logSecurityEvent(SecurityEvent.TOKEN_USED, {});
    tokenId: token.id,
        userId;
    token.userId,
        type;
    token.type,
        usageCount;
    token.usageCount,
    ;
}
ipAddress, userAgent;
;
this.emit('tokenUsed', {});
tokenId: token.id,
    userId;
token.userId,
    type;
token.type,
    usedAt;
token.usedAt,
;
;
return {
    success: true,
    token
};
try { }
catch (error) {
    this.logSecurityEvent(SecurityEvent.SUSPICIOUS_ACTIVITY, {});
    error: error instanceof Error ? error.message : 'Token usage error',
    ;
}
ipAddress, userAgent;
;
return {
    success: false,
    reason: 'usage_error',
};
async;
revokeToken(tokenId, string, reason, string, ipAddress, string = 'system', userAgent, string = 'system');
Promise < boolean > {
    const: token = this.tokens.get(tokenId),
    if(, token) { } } || token.status !== TokenStatus.ACTIVE;
{
    return false;
    token.status = TokenStatus.REVOKED;
    token.revokedAt = new Date();
    token.revocationReason = reason;
    this.tokens.set(tokenId, token);
    this.logSecurityEvent(SecurityEvent.TOKEN_REVOKED, {});
    tokenId,
        userId;
    token.userId,
        reason,
        originalExpiration;
    token.expiresAt,
    ;
}
ipAddress, userAgent;
;
this.emit('tokenRevoked', {});
tokenId,
    userId;
token.userId,
    reason,
    revokedAt;
token.revokedAt,
;
;
return true;
async;
revokeUserTokens(userId, string, type ?  : TokenType, reason, string = 'user_requested');
Promise < number > {
    let, revokedCount = 0,
    : .tokens };
{
    if (token.userId === userId && )
        token.status === TokenStatus.ACTIVE &&
            (!type || token.type === type);
    {
        await this.revokeToken(tokenId, reason);
        revokedCount++;
        this.emit('userTokensRevoked', {});
        userId,
            type,
            reason,
            count;
        revokedCount,
        ;
    }
    ;
    return revokedCount;
    getTokenInfo(tokenId, string);
    (Partial) | null;
    {
        const token = this.tokens.get(tokenId);
        if (!token)
            return null;
        // Return safe subset of token data
        return {
            id: token.id,
            userId: token.userId,
            email: token.email,
            type: token.type,
            status: token.status,
            createdAt: token.createdAt,
            expiresAt: token.expiresAt,
            usedAt: token.usedAt,
            revokedAt: token.revokedAt,
            securityLevel: token.securityLevel,
            usageCount: token.usageCount,
            maxUsageCount: token.maxUsageCount,
            revocationReason: token.revocationReason,
        };
        getUserTokens(userId, string, type ?  : TokenType);
        Partial < ResetToken > [];
        {
            const userTokens = [];
            for (const token of this.tokens.values()) {
                if (token.userId === userId && (!type || token.type === type)) {
                    const tokenInfo = this.getTokenInfo(token.id);
                    if (tokenInfo) {
                        userTokens.push(tokenInfo);
                        return userTokens.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
                        getStatistics();
                        TokenStatistics;
                        {
                            const tokens = Array.from(this.tokens.values());
                            const now = new Date();
                            const stats = {
                                totalTokens: tokens.length,
                                activeTokens: 0,
                                usedTokens: 0,
                                expiredTokens: 0,
                                revokedTokens: 0,
                                tokensByType: {},
                                tokensBySecurityLevel: {},
                                averageTokenLifetime: 0,
                                usageRate: 0,
                                securityViolations: 0,
                                rateLimitViolations: 0,
                                cleanupStats: {
                                    lastCleanup: new Date(),
                                    tokensRemoved: 0,
                                    auditLogsRemoved: 0,
                                },
                                // Initialize counters
                                Object, : .values(TokenType).forEach(type => { }),
                                stats, : .tokensByType[type] = 0 };
                            Object.values(SecurityLevel).forEach(level => { });
                            stats.tokensBySecurityLevel[level] = 0;
                        }
                        ;
                        let totalLifetime = 0;
                        let usedTokensCount = 0;
                        // Calculate statistics
                        tokens.forEach(token => { });
                        // Status counts
                        switch (token.status) {
                            case TokenStatus.ACTIVE:
                                stats.activeTokens++;
                                break;
                            case TokenStatus.USED:
                                stats.usedTokens++;
                                usedTokensCount++;
                                break;
                            case TokenStatus.EXPIRED:
                                stats.expiredTokens++;
                                break;
                            case TokenStatus.REVOKED:
                                stats.revokedTokens++;
                                break;
                                // Type counts
                                stats.tokensByType[token.type]++;
                                // Security level counts
                                stats.tokensBySecurityLevel[token.securityLevel]++;
                                // Calculate lifetime for used/expired tokens
                                if (token.usedAt || token.status === TokenStatus.EXPIRED) {
                                    const endTime = token.usedAt || token.expiresAt;
                                    const lifetime = endTime.getTime() - token.createdAt.getTime();
                                    totalLifetime += lifetime;
                                }
                                ;
                                // Calculate averages
                                const lifetimeTokens = stats.usedTokens + stats.expiredTokens;
                                stats.averageTokenLifetime = lifetimeTokens > 0 ? totalLifetime / lifetimeTokens : 0;
                                stats.usageRate = stats.totalTokens > 0 ? (stats.usedTokens / stats.totalTokens) * 100 : 0;
                                // Count security events
                                stats.securityViolations = this.auditLog.filter(entry => );
                                entry.event === SecurityEvent.SUSPICIOUS_ACTIVITY;
                                length;
                                stats.rateLimitViolations = this.auditLog.filter(entry => );
                                entry.event === SecurityEvent.RATE_LIMIT_EXCEEDED;
                                length;
                                return stats;
                                updateConfig(newConfig, (Partial));
                                void {
                                    this: .config = this.mergeConfig(newConfig),
                                    this: .emit('configUpdated', { config: this.config }),
                                    // Private helper methods
                                    mergeConfig(config) {
                                        return {
                                            defaultExpiration: 60 * 60 * 1000, // 1 hour,
                                            maxExpiration: 24 * 60 * 60 * 1000, // 24 hours,
                                            tokenLength: 32,
                                            hashRounds: 100000,
                                            rateLimitWindow: 15 * 60 * 1000, // 15 minutes,
                                            rateLimitCount: 3,
                                            cleanupInterval: 60 * 60 * 1000, // 1 hour,
                                            securityLevel: SecurityLevel.STANDARD,
                                            antiEnumerationDelay: 1000, // 1 second,
                                            enableAuditLogging: true,
                                            requireEmailVerification: false,
                                            allowMultipleTokens: false,
                                            ...config
                                        };
                                    },
                                    generateSecureToken() {
                                        return randomBytes(this.config.tokenLength).toString('hex');
                                    },
                                    generateTokenId() {
                                        return `token_${Date.now()}_${randomBytes(8).toString('hex')}`;
                                    },
                                    hashToken(token, salt) {
                                        return pbkdf2Sync(token, salt, this.config.hashRounds, 64, 'sha512').toString('hex');
                                    },
                                    calculateExpiration(requestedMinutes, securityLevel = SecurityLevel.STANDARD) {
                                        let baseExpiration = this.config.defaultExpiration;
                                        // Adjust based on security level
                                        switch (securityLevel) {
                                            case SecurityLevel.ENHANCED:
                                                baseExpiration = Math.min(baseExpiration, 30 * 60 * 1000); // Max 30 minutes
                                                break;
                                            case SecurityLevel.MAXIMUM:
                                                baseExpiration = Math.min(baseExpiration, 15 * 60 * 1000); // Max 15 minutes
                                                break;
                                                if (requestedMinutes) {
                                                    const requestedMs = requestedMinutes * 60 * 1000;
                                                    baseExpiration = Math.min(requestedMs, this.config.maxExpiration);
                                                    return baseExpiration;
                                                }
                                        }
                                    },
                                    ipAddress: string,
                                    userAgent: string, Promise() {
                                        // Apply anti-enumeration delay
                                        await this.antiEnumerationDelay();
                                        // Find matching token by comparing hashes
                                        for (const token of this.tokens.values()) {
                                            // Check if token matches
                                            const hashedInput = this.hashToken(tokenValue, token.salt);
                                            if (!timingSafeEqual(Buffer.from(hashedInput, 'hex'), Buffer.from(token.hashedToken, 'hex'))) {
                                                continue;
                                                // Check if token is already used
                                                if (token.status === TokenStatus.USED) {
                                                    return {
                                                        valid: false,
                                                        reason: 'token_already_used',
                                                        riskScore: 40,
                                                    };
                                                    // Check if token is revoked
                                                    if (token.status === TokenStatus.REVOKED) {
                                                        return {
                                                            valid: false,
                                                            reason: 'token_revoked',
                                                            riskScore: 50,
                                                        };
                                                        // Check expiration
                                                        if (token.expiresAt < new Date()) {
                                                            token.status = TokenStatus.EXPIRED;
                                                            this.tokens.set(token.id, token);
                                                            this.logSecurityEvent(SecurityEvent.TOKEN_EXPIRED, {});
                                                            tokenId: token.id,
                                                                userId;
                                                            token.userId,
                                                            ;
                                                        }
                                                        ipAddress, userAgent;
                                                        ;
                                                        return {
                                                            valid: false,
                                                            reason: 'token_expired',
                                                            riskScore: 20,
                                                        };
                                                        // Check if not active
                                                        if (token.status !== TokenStatus.ACTIVE) {
                                                            return {
                                                                valid: false,
                                                                reason: 'token_inactive',
                                                                riskScore: 30,
                                                            };
                                                            // Check usage count
                                                            if (token.usageCount >= token.maxUsageCount) {
                                                                return {
                                                                    valid: false,
                                                                    reason: 'token_already_used',
                                                                    riskScore: 40,
                                                                };
                                                                // Calculate risk score
                                                                const riskScore = this.calculateRiskScore(token, ipAddress, userAgent);
                                                                return {
                                                                    valid: true,
                                                                    token,
                                                                    riskScore
                                                                };
                                                                return {
                                                                    valid: false,
                                                                    reason: 'token_not_found',
                                                                    riskScore: 60,
                                                                };
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    calculateRiskScore(token, ipAddress, userAgent) {
                                        let riskScore = 0;
                                        // Check IP address change
                                        if (token.ipAddress !== ipAddress) {
                                            riskScore += 30;
                                            // Check user agent change
                                            if (token.userAgent !== userAgent) {
                                                riskScore += 20;
                                                // Check token age
                                                const ageMinutes = (Date.now() - token.createdAt.getTime()) / (1000 * 60);
                                                if (ageMinutes > 30) {
                                                    riskScore += 10;
                                                    // Check security level
                                                    switch (token.securityLevel) {
                                                        case SecurityLevel.ENHANCED:
                                                            riskScore *= 0.8; // Lower base risk for enhanced security
                                                            break;
                                                        case SecurityLevel.MAXIMUM:
                                                            riskScore *= 0.6; // Even lower base risk for maximum security
                                                            break;
                                                            return Math.min(100, Math.max(0, riskScore));
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    isRateLimited(email, ipAddress) {
                                        const keys = [email, ipAddress];
                                        for (const key of keys) {
                                            const rateLimit = this.rateLimits.get(key);
                                            if (!rateLimit)
                                                continue;
                                            const now = Date.now();
                                            if (now < rateLimit.resetTime && rateLimit.count >= this.config.rateLimitCount) {
                                                return true;
                                                return false;
                                            }
                                        }
                                    },
                                    updateRateLimit(email, ipAddress) {
                                        const keys = [email, ipAddress];
                                        const now = Date.now();
                                        const resetTime = now + this.config.rateLimitWindow;
                                        for (const key of keys) {
                                            const existing = this.rateLimits.get(key);
                                            if (!existing || now >= existing.resetTime) {
                                                this.rateLimits.set(key, {});
                                                count: 1,
                                                    resetTime,
                                                    lastRequest;
                                                new Date(),
                                                    violationCount;
                                                existing?.violationCount || 0,
                                                ;
                                            }
                                            ;
                                        }
                                    }, else: {
                                        existing, : .count++,
                                        existing, : .lastRequest = new Date(),
                                        if(existing) { }, : .count > this.config.rateLimitCount
                                    }
                                };
                                {
                                    existing.violationCount++;
                                    async;
                                    antiEnumerationDelay();
                                    Promise < void  > {
                                        return: new Promise(resolve => { }),
                                        : .config.antiEnumerationDelay };
                                    ;
                                    logSecurityEvent(event, SecurityEvent);
                                    details: (Record),
                                        ipAddress;
                                    string = 'system',
                                        userAgent;
                                    string = 'system';
                                    void {
                                        : .config.enableAuditLogging, return: ,
                                        const: logEntry, AuditLogEntry = {
                                            id: `audit_${Date.now()}_${randomBytes(4).toString('hex')}` } };
                                    event,
                                        timestamp;
                                    new Date(),
                                        userId;
                                    details.userId,
                                        tokenId;
                                    details.tokenId,
                                        ipAddress,
                                        userAgent,
                                        details,
                                        riskScore;
                                    details.riskScore || 0;
                                }
                                ;
                                this.auditLog.push(logEntry);
                                this.emit('securityEvent', logEntry);
                                // Trim audit log if it gets too large
                                if (this.auditLog.length > 10000) {
                                    this.auditLog = this.auditLog.slice(-5000);
                                    startCleanupTimer();
                                    void {
                                        this: .cleanupTimer = setInterval(() => {
                                            this.performCleanup();
                                        }, this.config.cleanupInterval),
                                        performCleanup() {
                                            const now = new Date();
                                            const expiredThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago;
                                            let tokensRemoved = 0;
                                            let auditLogsRemoved = 0;
                                            // Clean up expired and used tokens
                                            for (const [tokenId, token] of this.tokens) {
                                                const shouldCleanup = ();
                                                ;
                                                token.status === TokenStatus.EXPIRED ||
                                                    token.status === TokenStatus.USED ||
                                                    token.status === TokenStatus.REVOKED;
                                                 && ();
                                                token.createdAt < expiredThreshold ||
                                                    (token.usedAt && token.usedAt < expiredThreshold) ||
                                                    (token.revokedAt && token.revokedAt < expiredThreshold);
                                                ;
                                                if (shouldCleanup) {
                                                    this.tokens.delete(tokenId);
                                                    tokensRemoved++;
                                                    // Clean up old audit logs
                                                    const oldAuditLogs = this.auditLog.filter(log => log.timestamp < expiredThreshold);
                                                    auditLogsRemoved = oldAuditLogs.length;
                                                    this.auditLog = this.auditLog.filter(log => log.timestamp >= expiredThreshold);
                                                    // Clean up old rate limit data
                                                    for (const [key, rateLimit] of this.rateLimits) {
                                                        if (now.getTime() > rateLimit.resetTime + this.config.rateLimitWindow) {
                                                            this.rateLimits.delete(key);
                                                            this.logSecurityEvent(SecurityEvent.TOKEN_CLEANUP, {});
                                                            tokensRemoved,
                                                                auditLogsRemoved,
                                                                activeTokens;
                                                            this.tokens.size,
                                                                auditLogSize;
                                                            this.auditLog.length,
                                                            ;
                                                        }
                                                        ;
                                                        this.emit('cleanupCompleted', {});
                                                        tokensRemoved,
                                                            auditLogsRemoved,
                                                            timestamp;
                                                        now,
                                                        ;
                                                    }
                                                    ;
                                                    /**
                                                     * Destroy the token manager and clean up resources
                                                     */
                                                }
                                                /**
                                                 * Destroy the token manager and clean up resources
                                                 */
                                            }
                                            /**
                                             * Destroy the token manager and clean up resources
                                             */
                                        }
                                        /**
                                         * Destroy the token manager and clean up resources
                                         */
                                        ,
                                        /**
                                         * Destroy the token manager and clean up resources
                                         */
                                        destroy() {
                                            if (this.cleanupTimer) {
                                                clearInterval(this.cleanupTimer);
                                                this.tokens.clear();
                                                this.rateLimits.clear();
                                                this.auditLog = [];
                                                this.emit('destroyed');
                                                // Export default instance
                                                export const passwordResetTokenManager = new PasswordResetTokenManager();
                                                export default PasswordResetTokenManager;
                                            }
                                        } };
                                }
                        }
                    }
                }
            }
        }
    }
}
