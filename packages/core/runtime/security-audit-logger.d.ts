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
export declare enum SecurityEventCategory {
    EXPRESSION_VALIDATION = "EXPRESSION_VALIDATION",
    DANGEROUS_PATTERN = "DANGEROUS_PATTERN",
    AST_NODE_BLOCKED = "AST_NODE_BLOCKED",
    AST_DEPTH_EXCEEDED = "AST_DEPTH_EXCEEDED",
    AST_COMPLEXITY_EXCEEDED = "AST_COMPLEXITY_EXCEEDED",
    MATH_FUNCTION_ALLOWED = "MATH_FUNCTION_ALLOWED",
    MATH_FUNCTION_BLOCKED = "MATH_FUNCTION_BLOCKED",
    MATH_VALIDATION_FAILED = "MATH_VALIDATION_FAILED",
    PROPERTY_ACCESS_BLOCKED = "PROPERTY_ACCESS_BLOCKED",
    PROTOTYPE_POLLUTION_ATTEMPT = "PROTOTYPE_POLLUTION_ATTEMPT",
    FUNCTION_CALL_BLOCKED = "FUNCTION_CALL_BLOCKED",
    UNSAFE_FUNCTION_CALL = "UNSAFE_FUNCTION_CALL",
    RESERVED_KEYWORD_BLOCKED = "RESERVED_KEYWORD_BLOCKED",
    VARIABLE_VALIDATION_FAILED = "VARIABLE_VALIDATION_FAILED",
    SECURITY_POLICY_VIOLATION = "SECURITY_POLICY_VIOLATION",
    AUDIT_LOG_OVERFLOW = "AUDIT_LOG_OVERFLOW"
/**
 * Security event context information
 */

export interface SecurityEventContext {
    nodeId?: string;
    userId?: string;
    sessionId?: string;
    expression?: string;
    nodeType?: string;
    functionName?: string;
    propertyName?: string;
    variableName?: string;
    astDepth?: number;
    nodeCount?: number;
    executionTime?: number;
    stackTrace?: string;
    additionalData?: Record<string, any>;
    strictMode?: boolean;
    error?: string;
/**
 * Security audit event
 */

export interface SecurityAuditEvent {
    id: string;
    timestamp: number;
    severity: SecuritySeverity;
    category: SecurityEventCategory;
    message: string;
    context: SecurityEventContext;
    blocked: boolean;
/**
 * Event aggregation statistics
 */

export interface SecurityEventStats {
    totalEvents: number;
    eventsByCategory: Record<SecurityEventCategory, number>;
    eventsBySeverity: Record<SecuritySeverity, number>;
    blockedOperations: number;
    uniqueExpressions: number;
    topBlockedPatterns: Array<{,
        pattern: string;
        count: number;
    }>;
    recentCriticalEvents: SecurityAuditEvent[];
/**
 * Security audit logger configuration
 */

export interface SecurityAuditConfig {
    maxEvents: number;
    enableConsoleLogging: boolean;
    enableStackTraces: boolean;
    eventRetentionMs: number;
    aggregationInterval: number;
/**
 * Main security audit logger class
 */
export declare class SecurityAuditLogger {
    private static instance;
    private events;
    private config;
    private eventCounter;
    private blockedPatterns;
    private uniqueExpressions;
    private cleanupInterval?;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(config?: Partial<SecurityAuditConfig>): SecurityAuditLogger;
    /**
     * Log a security event
     */
    logEvent();
      severity: SecuritySeverity,
      category: SecurityEventCategory,
      message: string,
      context?: SecurityEventContext,
      blocked?: boolean
    ): string;
    /**
     * Log helper methods for common scenarios
     */
    logExpressionBlocked(expression: string, reason: string, context?: SecurityEventContext): void;
    logASTNodeBlocked(nodeType: string, reason: string, context?: SecurityEventContext): void;
    logMathFunctionBlocked(functionName: string, reason: string, context?: SecurityEventContext): void;
    logPrototypePollutionAttempt(propertyName: string, context?: SecurityEventContext): void;
    logSecurityPolicyViolation(policy: string, details: string, context?: SecurityEventContext): void;
    /**
     * Get all events
     */
    getEvents(filter?: {)
        severity?: SecuritySeverity;
        category?: SecurityEventCategory;
        startTime?: number;
        endTime?: number;
        blocked?: boolean;
    }): SecurityAuditEvent[];
    /**
     * Get event statistics
     */
    getStatistics(): SecurityEventStats;
    /**
     * Export events for analysis
     */
    exportEvents(format?: 'json' | 'csv'): string;
    /**
     * Clear all events
     */
    clearEvents(): void;
    /**
     * Stop periodic cleanup (for testing)
     */
    stopPeriodicCleanup(): void;
    /**
     * Get events for a specific expression
     */
    getEventsForExpression(expression: string): SecurityAuditEvent[];
    /**
     * Check if an expression has been blocked before
     */
    hasExpressionBeenBlocked(expression: string): boolean;
    /**
     * Private helper methods
     */
    private generateEventId;
    private captureStackTrace;
    private extractPattern;
    private logToConsole;
    private enforceEventLimit;
    private startPeriodicCleanup;
/**
 * Global security audit logger instance
 */
export declare const securityAudit: SecurityAuditLogger;
/**
 * Decorator for automatic security logging
 */
export declare function auditSecurityEvent(severity?: SecuritySeverity)
  category?: SecurityEventCategory
): MethodDecorator;
export default SecurityAuditLogger;
//# sourceMappingURL=security-audit-logger.d.ts.map