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
export enum SecuritySeverity {
  INFO = 'INFO',           // Informational events (safe operations)
  WARNING = 'WARNING',     // Potentially suspicious but allowed
  ERROR = 'ERROR',         // Blocked operations
  CRITICAL = 'CRITICAL'    // Severe security violations
}
/**
 * Security event categories
 */
export enum SecurityEventCategory {
  // Expression validation
  EXPRESSION_VALIDATION = 'EXPRESSION_VALIDATION',
  DANGEROUS_PATTERN = 'DANGEROUS_PATTERN',
  // AST node filtering
  AST_NODE_BLOCKED = 'AST_NODE_BLOCKED',
  AST_DEPTH_EXCEEDED = 'AST_DEPTH_EXCEEDED',
  AST_COMPLEXITY_EXCEEDED = 'AST_COMPLEXITY_EXCEEDED',
  // Math function access
  MATH_FUNCTION_ALLOWED = 'MATH_FUNCTION_ALLOWED',
  MATH_FUNCTION_BLOCKED = 'MATH_FUNCTION_BLOCKED',
  MATH_VALIDATION_FAILED = 'MATH_VALIDATION_FAILED',
  // Property access
  PROPERTY_ACCESS_BLOCKED = 'PROPERTY_ACCESS_BLOCKED',
  PROTOTYPE_POLLUTION_ATTEMPT = 'PROTOTYPE_POLLUTION_ATTEMPT',
  // Function calls
  FUNCTION_CALL_BLOCKED = 'FUNCTION_CALL_BLOCKED',
  UNSAFE_FUNCTION_CALL = 'UNSAFE_FUNCTION_CALL',
  // Variable access
  RESERVED_KEYWORD_BLOCKED = 'RESERVED_KEYWORD_BLOCKED',
  VARIABLE_VALIDATION_FAILED = 'VARIABLE_VALIDATION_FAILED',
  // General security
  SECURITY_POLICY_VIOLATION = 'SECURITY_POLICY_VIOLATION',
  AUDIT_LOG_OVERFLOW = 'AUDIT_LOG_OVERFLOW'
}
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
  // DEPLOYMENT BLOCKER FIX: Add missing properties causing TypeScript errors
  strictMode?: boolean;
  error?: string;
}
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
}
/**
 * Event aggregation statistics
 */
export interface SecurityEventStats {
  totalEvents: number;
  eventsByCategory: Record<SecurityEventCategory, number>;
  eventsBySeverity: Record<SecuritySeverity, number>;
  blockedOperations: number;
  uniqueExpressions: number;
  topBlockedPatterns: Array<{ pattern: string; count: number }>;
  recentCriticalEvents: SecurityAuditEvent[];
}
/**
 * Security audit logger configuration
 */
export interface SecurityAuditConfig {
  maxEvents: number;
  enableConsoleLogging: boolean;
  enableStackTraces: boolean;
  eventRetentionMs: number;
  aggregationInterval: number;
}
/**
 * Main security audit logger class
 */
export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private events: SecurityAuditEvent[] = [];
  private config: SecurityAuditConfig;
  private eventCounter: number = 0;
  private blockedPatterns: Map<string, number> = new Map();
  private uniqueExpressions: Set<string> = new Set();
  private cleanupInterval?: NodeJS.Timeout;
  private constructor(config: Partial<SecurityAuditConfig> = {}) {
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
  static getInstance(config?: Partial<SecurityAuditConfig>): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger(config);
    }
    return SecurityAuditLogger.instance;
  }
  /**
   * Log a security event
   */
  logEvent()
    severity: SecuritySeverity,
    category: SecurityEventCategory,
    message: string,
    context: SecurityEventContext = {},
    blocked: boolean = false
  ): string {
    const eventId = this.generateEventId();
    const event: SecurityAuditEvent = {
      id: eventId,
      timestamp: Date.now(),
      severity,
      category,
      message,
      context: {,
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
  logExpressionBlocked(expression: string, reason: string, context: SecurityEventContext = {}): void {
    this.logEvent()
      SecuritySeverity.ERROR,
      SecurityEventCategory.EXPRESSION_VALIDATION,
      `Expression blocked: ${reason}`,}
      { ...context, expression },
      true
    );
  }
  logASTNodeBlocked(nodeType: string, reason: string, context: SecurityEventContext = {}): void {
    this.logEvent()
      SecuritySeverity.ERROR,
      SecurityEventCategory.AST_NODE_BLOCKED,
      `AST node '${nodeType}' blocked: ${reason}`,}
      { ...context, nodeType },
      true
    );
  }
  logMathFunctionBlocked(functionName: string, reason: string, context: SecurityEventContext = {}): void {
    this.logEvent()
      SecuritySeverity.WARNING,
      SecurityEventCategory.MATH_FUNCTION_BLOCKED,
      `Math.${functionName} blocked: ${reason}`,}
      { ...context, functionName },
      true
    );
  }
  logPrototypePollutionAttempt(propertyName: string, context: SecurityEventContext = {}): void {
    this.logEvent()
      SecuritySeverity.CRITICAL,
      SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT,
      `Prototype pollution attempt via property '${propertyName}'`,}
      { ...context, propertyName },
      true
    );
  }
  logSecurityPolicyViolation(policy: string, details: string, context: SecurityEventContext = {}): void {
    this.logEvent()
      SecuritySeverity.CRITICAL,
      SecurityEventCategory.SECURITY_POLICY_VIOLATION,
      `Security policy '${policy}' violated: ${details}`,}
      context,
      true
    );
  }
  /**
   * Get all events
   */
  getEvents(filter?: {)
    severity?: SecuritySeverity;
    category?: SecurityEventCategory;
    startTime?: number;
    endTime?: number;
    blocked?: boolean;
  }): SecurityAuditEvent[] {
    let filtered = [...this.events];
    if (filter) {
      if (filter.severity) {
        filtered = filtered.filter(e => e.severity === filter.severity);
      }
      if (filter.category) {
        filtered = filtered.filter(e => e.category === filter.category);
      }
      if (filter.startTime !== undefined) {
        filtered = filtered.filter(e => e.timestamp >= filter.startTime!);
      }
      if (filter.endTime !== undefined) {
        filtered = filtered.filter(e => e.timestamp <= filter.endTime!);
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
  getStatistics(): SecurityEventStats {
    const stats: SecurityEventStats = {
      totalEvents: this.events.length,
      eventsByCategory: {} as Record<SecurityEventCategory, number>,
      eventsBySeverity: {} as Record<SecuritySeverity, number>,
      blockedOperations: 0,
      uniqueExpressions: this.uniqueExpressions.size,
      topBlockedPatterns: [],
      recentCriticalEvents: [],
    };
    // Initialize counters
    Object.values(SecurityEventCategory).forEach(cat => {)
      stats.eventsByCategory[cat as SecurityEventCategory] = 0;
    });
    Object.values(SecuritySeverity).forEach(sev => {)
      stats.eventsBySeverity[sev as SecuritySeverity] = 0;
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
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2);
    } else {
      // CSV export
      const headers = ['id', 'timestamp', 'severity', 'category', 'message', 'blocked', 'expression', 'nodeType'];
      const rows = this.events.map(e => [;)
        e.id,
        new Date(e.timestamp).toISOString(),
        e.severity,
        e.category,
        e.message,
        e.blocked,
        e.context.expression || '',
        e.context.nodeType || ''
      ]);
      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');}
    }
  }
  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
    this.blockedPatterns.clear();
    this.uniqueExpressions.clear();
    this.eventCounter = 0;
  }
  /**
   * Stop periodic cleanup (for testing)
   */
  stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }
  /**
   * Get events for a specific expression
   */
  getEventsForExpression(expression: string): SecurityAuditEvent[] {
    return this.events.filter(e => e.context.expression === expression);
  }
  /**
   * Check if an expression has been blocked before
   */
  hasExpressionBeenBlocked(expression: string): boolean {
    return this.events.some(e => e.context.expression === expression && e.blocked);
  }
  /**
   * Private helper methods
   */
  private generateEventId(): string {
    return `SEC-${Date.now()}-${++this.eventCounter}`;}
  }
  private captureStackTrace(): string {
    const stack = new Error().stack || '';
    // Remove internal frames
    return stack.split('\n').slice(3).join('\n');
  }
  private extractPattern(expression: string): string {
    // Extract a simplified pattern from expression for aggregation
    return expression
      .replace(/["'].*?["']/g, '"..."')  // Replace string literals
      .replace(/\d+/g, 'N')               // Replace numbers
      .replace(/\s+/g, ' ')               // Normalize whitespace
      .trim();
  }
  private logToConsole(event: SecurityAuditEvent): void {
    const icon = {
      [SecuritySeverity.INFO]: 'ℹ️',
      [SecuritySeverity.WARNING]: '⚠️',
      [SecuritySeverity.ERROR]: '❌',
      [SecuritySeverity.CRITICAL]: '🚨'
    }[event.severity];
    const color = {
      [SecuritySeverity.INFO]: '\x1b[36m',      // Cyan
      [SecuritySeverity.WARNING]: '\x1b[33m',   // Yellow
      [SecuritySeverity.ERROR]: '\x1b[31m',     // Red
      [SecuritySeverity.CRITICAL]: '\x1b[35m'   // Magenta
    }[event.severity];
    const reset = '\x1b[0m';
    console.log()
      `${icon} ${color}[SECURITY ${event.severity}]${reset} ${event.message}`,}
      event.context.expression ? `\n   Expression: ${event.context.expression}` : ''}
    );
  }
  private enforceEventLimit(): void {
    if (this.events.length > this.config.maxEvents) {
      const eventsToRemove = this.events.length - this.config.maxEvents;
      this.events.splice(0, eventsToRemove);
      // Log that we hit the limit
      this.logEvent()
        SecuritySeverity.WARNING,
        SecurityEventCategory.AUDIT_LOG_OVERFLOW,
        `Audit log limit reached. Removed ${eventsToRemove} oldest events.`,}
        { additionalData: { maxEvents: this.config.maxEvents } }
      );
    }
  }
  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const cutoffTime = Date.now() - this.config.eventRetentionMs;
      const originalLength = this.events.length;
      this.events = this.events.filter(e => e.timestamp > cutoffTime);
      if (originalLength > this.events.length) {
        console.log(`[SecurityAudit] Cleaned up ${originalLength - this.events.length} expired events`);}
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
export function auditSecurityEvent()
  severity: SecuritySeverity = SecuritySeverity.INFO,
  category: SecurityEventCategory = SecurityEventCategory.EXPRESSION_VALIDATION
): MethodDecorator {
  return function ()
    target: unknown,
    propertyName: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const method = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      const startTime = Date.now();
      const context: SecurityEventContext = {
        functionName: `${target.constructor.name}.${String(propertyName)}`,}
        executionTime: 0,
      };
      try {
        const result = method.apply(this, args);
        context.executionTime = Date.now() - startTime;
        // Log successful execution (only for INFO level)
        if (severity === SecuritySeverity.INFO) {
          securityAudit.logEvent()
            severity,
            category,
            `${String(propertyName)} executed successfully`,}
            context,
            false
          );
        }
        return result;
      } catch (error) {
        context.executionTime = Date.now() - startTime;
        // Log error
        securityAudit.logEvent()
          SecuritySeverity.ERROR,
          category,
          `${String(propertyName)} failed: ${error}`,}
          context,
          true
        );
        throw error;
      }
    };
    return descriptor;
  };
}

export default SecurityAuditLogger;