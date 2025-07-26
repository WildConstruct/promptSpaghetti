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
export var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["INFO"] = "INFO";
    SecuritySeverity["WARNING"] = "WARNING";
    SecuritySeverity["ERROR"] = "ERROR";
    SecuritySeverity["CRITICAL"] = "CRITICAL"; // Severe security violations
})(SecuritySeverity || (SecuritySeverity = {}));
/**
 * Security event categories
 */
export var SecurityEventCategory;
(function (SecurityEventCategory) {
    // Expression validation
    SecurityEventCategory["EXPRESSION_VALIDATION"] = "EXPRESSION_VALIDATION";
    SecurityEventCategory["DANGEROUS_PATTERN"] = "DANGEROUS_PATTERN";
    // AST node filtering
    SecurityEventCategory["AST_NODE_BLOCKED"] = "AST_NODE_BLOCKED";
    SecurityEventCategory["AST_DEPTH_EXCEEDED"] = "AST_DEPTH_EXCEEDED";
    SecurityEventCategory["AST_COMPLEXITY_EXCEEDED"] = "AST_COMPLEXITY_EXCEEDED";
    // Math function access
    SecurityEventCategory["MATH_FUNCTION_ALLOWED"] = "MATH_FUNCTION_ALLOWED";
    SecurityEventCategory["MATH_FUNCTION_BLOCKED"] = "MATH_FUNCTION_BLOCKED";
    SecurityEventCategory["MATH_VALIDATION_FAILED"] = "MATH_VALIDATION_FAILED";
    // Property access
    SecurityEventCategory["PROPERTY_ACCESS_BLOCKED"] = "PROPERTY_ACCESS_BLOCKED";
    SecurityEventCategory["PROTOTYPE_POLLUTION_ATTEMPT"] = "PROTOTYPE_POLLUTION_ATTEMPT";
    // Function calls
    SecurityEventCategory["FUNCTION_CALL_BLOCKED"] = "FUNCTION_CALL_BLOCKED";
    SecurityEventCategory["UNSAFE_FUNCTION_CALL"] = "UNSAFE_FUNCTION_CALL";
    // Variable access
    SecurityEventCategory["RESERVED_KEYWORD_BLOCKED"] = "RESERVED_KEYWORD_BLOCKED";
    SecurityEventCategory["VARIABLE_VALIDATION_FAILED"] = "VARIABLE_VALIDATION_FAILED";
    // General security
    SecurityEventCategory["SECURITY_POLICY_VIOLATION"] = "SECURITY_POLICY_VIOLATION";
    SecurityEventCategory["AUDIT_LOG_OVERFLOW"] = "AUDIT_LOG_OVERFLOW";
})(SecurityEventCategory || (SecurityEventCategory = {}));
/**
 * Main security audit logger class
 */
export class SecurityAuditLogger {
    static instance;
    events = [];
    config;
    eventCounter = 0;
    blockedPatterns = new Map();
    uniqueExpressions = new Set();
    cleanupInterval;
    constructor(config = {}) {
        this.config = {
            maxEvents: 10000,
            enableConsoleLogging: true,
            enableStackTraces: false,
            eventRetentionMs: 24 * 60 * 60 * 1000, // 24 hours
            aggregationInterval: 60 * 1000, // 1 minute
            ...config
        };
        // Start periodic cleanup
        this.startPeriodicCleanup();
    }
    /**
     * Get singleton instance
     */
    static getInstance(config) {
        if (!SecurityAuditLogger.instance) {
            SecurityAuditLogger.instance = new SecurityAuditLogger(config);
        }
        return SecurityAuditLogger.instance;
    }
    /**
     * Log a security event
     */
    logEvent(severity, category, message, context = {}, blocked = false) {
        const eventId = this.generateEventId();
        const event = {
            id: eventId,
            timestamp: Date.now(),
            severity,
            category,
            message,
            context: {
                ...context,
                stackTrace: this.config.enableStackTraces ? this.captureStackTrace() : undefined
            },
            blocked
        };
        // Add to events array
        this.events.push(event);
        // Update tracking data
        if (context.expression) {
            this.uniqueExpressions.add(context.expression);
        }
        if (blocked && context.expression) {
            const pattern = this.extractPattern(context.expression);
            this.blockedPatterns.set(pattern, (this.blockedPatterns.get(pattern) || 0) + 1);
        }
        // Console logging
        if (this.config.enableConsoleLogging) {
            this.logToConsole(event);
        }
        // Enforce max events limit
        this.enforceEventLimit();
        return eventId;
    }
    /**
     * Log helper methods for common scenarios
     */
    logExpressionBlocked(expression, reason, context = {}) {
        this.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, `Expression blocked: ${reason}`, { ...context, expression }, true);
    }
    logASTNodeBlocked(nodeType, reason, context = {}) {
        this.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.AST_NODE_BLOCKED, `AST node '${nodeType}' blocked: ${reason}`, { ...context, nodeType }, true);
    }
    logMathFunctionBlocked(functionName, reason, context = {}) {
        this.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_FUNCTION_BLOCKED, `Math.${functionName} blocked: ${reason}`, { ...context, functionName }, true);
    }
    logPrototypePollutionAttempt(propertyName, context = {}) {
        this.logEvent(SecuritySeverity.CRITICAL, SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT, `Prototype pollution attempt via property '${propertyName}'`, { ...context, propertyName }, true);
    }
    logSecurityPolicyViolation(policy, details, context = {}) {
        this.logEvent(SecuritySeverity.CRITICAL, SecurityEventCategory.SECURITY_POLICY_VIOLATION, `Security policy '${policy}' violated: ${details}`, context, true);
    }
    /**
     * Get all events
     */
    getEvents(filter) {
        let filtered = [...this.events];
        if (filter) {
            if (filter.severity) {
                filtered = filtered.filter(e => e.severity === filter.severity);
            }
            if (filter.category) {
                filtered = filtered.filter(e => e.category === filter.category);
            }
            if (filter.startTime !== undefined) {
                filtered = filtered.filter(e => e.timestamp >= filter.startTime);
            }
            if (filter.endTime !== undefined) {
                filtered = filtered.filter(e => e.timestamp <= filter.endTime);
            }
            if (filter.blocked !== undefined) {
                filtered = filtered.filter(e => e.blocked === filter.blocked);
            }
        }
        return filtered;
    }
    /**
     * Get event statistics
     */
    getStatistics() {
        const stats = {
            totalEvents: this.events.length,
            eventsByCategory: {},
            eventsBySeverity: {},
            blockedOperations: 0,
            uniqueExpressions: this.uniqueExpressions.size,
            topBlockedPatterns: [],
            recentCriticalEvents: []
        };
        // Initialize counters
        Object.values(SecurityEventCategory).forEach(cat => {
            stats.eventsByCategory[cat] = 0;
        });
        Object.values(SecuritySeverity).forEach(sev => {
            stats.eventsBySeverity[sev] = 0;
        });
        // Count events
        for (const event of this.events) {
            stats.eventsByCategory[event.category]++;
            stats.eventsBySeverity[event.severity]++;
            if (event.blocked) {
                stats.blockedOperations++;
            }
        }
        // Get top blocked patterns
        stats.topBlockedPatterns = Array.from(this.blockedPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([pattern, count]) => ({ pattern, count }));
        // Get recent critical events
        stats.recentCriticalEvents = this.events
            .filter(e => e.severity === SecuritySeverity.CRITICAL)
            .slice(-10);
        return stats;
    }
    /**
     * Export events for analysis
     */
    exportEvents(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.events, null, 2);
        }
        else {
            // CSV export
            const headers = ['id', 'timestamp', 'severity', 'category', 'message', 'blocked', 'expression', 'nodeType'];
            const rows = this.events.map(e => [
                e.id,
                new Date(e.timestamp).toISOString(),
                e.severity,
                e.category,
                e.message,
                e.blocked,
                e.context.expression || '',
                e.context.nodeType || ''
            ]);
            return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        }
    }
    /**
     * Clear all events
     */
    clearEvents() {
        this.events = [];
        this.blockedPatterns.clear();
        this.uniqueExpressions.clear();
        this.eventCounter = 0;
    }
    /**
     * Stop periodic cleanup (for testing)
     */
    stopPeriodicCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
    /**
     * Get events for a specific expression
     */
    getEventsForExpression(expression) {
        return this.events.filter(e => e.context.expression === expression);
    }
    /**
     * Check if an expression has been blocked before
     */
    hasExpressionBeenBlocked(expression) {
        return this.events.some(e => e.context.expression === expression && e.blocked);
    }
    /**
     * Private helper methods
     */
    generateEventId() {
        return `SEC-${Date.now()}-${++this.eventCounter}`;
    }
    captureStackTrace() {
        const stack = new Error().stack || '';
        // Remove internal frames
        return stack.split('\n').slice(3).join('\n');
    }
    extractPattern(expression) {
        // Extract a simplified pattern from expression for aggregation
        return expression
            .replace(/["'].*?["']/g, '"..."') // Replace string literals
            .replace(/\d+/g, 'N') // Replace numbers
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    logToConsole(event) {
        const icon = {
            [SecuritySeverity.INFO]: 'ℹ️',
            [SecuritySeverity.WARNING]: '⚠️',
            [SecuritySeverity.ERROR]: '❌',
            [SecuritySeverity.CRITICAL]: '🚨'
        }[event.severity];
        const color = {
            [SecuritySeverity.INFO]: '\x1b[36m', // Cyan
            [SecuritySeverity.WARNING]: '\x1b[33m', // Yellow
            [SecuritySeverity.ERROR]: '\x1b[31m', // Red
            [SecuritySeverity.CRITICAL]: '\x1b[35m' // Magenta
        }[event.severity];
        const reset = '\x1b[0m';
        console.log(`${icon} ${color}[SECURITY ${event.severity}]${reset} ${event.message}`, event.context.expression ? `\n   Expression: ${event.context.expression}` : '');
    }
    enforceEventLimit() {
        if (this.events.length > this.config.maxEvents) {
            const eventsToRemove = this.events.length - this.config.maxEvents;
            this.events.splice(0, eventsToRemove);
            // Log that we hit the limit
            this.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.AUDIT_LOG_OVERFLOW, `Audit log limit reached. Removed ${eventsToRemove} oldest events.`, { additionalData: { maxEvents: this.config.maxEvents } });
        }
    }
    startPeriodicCleanup() {
        this.cleanupInterval = setInterval(() => {
            const cutoffTime = Date.now() - this.config.eventRetentionMs;
            const originalLength = this.events.length;
            this.events = this.events.filter(e => e.timestamp > cutoffTime);
            if (originalLength > this.events.length) {
                console.log(`[SecurityAudit] Cleaned up ${originalLength - this.events.length} expired events`);
            }
        }, this.config.aggregationInterval);
    }
}
/**
 * Global security audit logger instance
 */
export const securityAudit = SecurityAuditLogger.getInstance();
/**
 * Decorator for automatic security logging
 */
export function auditSecurityEvent(severity = SecuritySeverity.INFO, category = SecurityEventCategory.EXPRESSION_VALIDATION) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const startTime = Date.now();
            const context = {
                functionName: `${target.constructor.name}.${String(propertyName)}`,
                executionTime: 0
            };
            try {
                const result = method.apply(this, args);
                context.executionTime = Date.now() - startTime;
                // Log successful execution (only for INFO level)
                if (severity === SecuritySeverity.INFO) {
                    securityAudit.logEvent(severity, category, `${String(propertyName)} executed successfully`, context, false);
                }
                return result;
            }
            catch (error) {
                context.executionTime = Date.now() - startTime;
                // Log error
                securityAudit.logEvent(SecuritySeverity.ERROR, category, `${String(propertyName)} failed: ${error}`, context, true);
                throw error;
            }
        };
        return descriptor;
    };
}
export default SecurityAuditLogger;
