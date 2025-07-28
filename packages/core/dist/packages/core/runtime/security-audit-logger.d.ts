/**
 * Security Audit Logging System
 *
 * Comprehensive security event logging for the expression evaluation system.
 * Tracks all security-related events including blocked operations, validation
 * failures, and suspicious patterns.
 *
 * Features:
 * - Centralized security event tracking
 * - Multiple severity levels
 * - Structured event data with context
 * - Memory-bounded event storage
 * - Event aggregation and analytics
 * - Export capabilities for security analysis
 *
 * Addresses P0 security requirements for Epic 18 - Conditional Node Security (DEBT-002)
 */
/**
 * Security event severity levels
 */
export declare enum SecuritySeverity {
    INFO = "INFO",// Informational events (safe operations)
    WARNING = "WARNING",// Potentially suspicious but allowed
    ERROR = "ERROR",// Blocked operations
    CRITICAL = "CRITICAL"
    /**
    * Security event categories
    */
    ,// Severe security violations
    /**
    * Security event categories
    */
    export,
    enum,
    SecurityEventCategory
}
//# sourceMappingURL=security-audit-logger.d.ts.map