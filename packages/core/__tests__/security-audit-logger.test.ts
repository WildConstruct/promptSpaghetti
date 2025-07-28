/**
 * Security Audit Logger Tests
 * 
 * Comprehensive test suite for the security audit logging system
 * Tests event logging, filtering, statistics, and memory management
 */
import {
  SecurityAuditLogger,
  securityAudit,
  SecuritySeverity,
  SecurityEventCategory,
  SecurityEventContext,
  SecurityAuditEvent,
  SecurityEventStats,
  auditSecurityEvent
} from '../runtime/security-audit-logger';
describe('SecurityAuditLogger', () => {
  let logger: SecurityAuditLogger;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  beforeEach(() => {
  // Get fresh instance
  logger = SecurityAuditLogger.getInstance({)
  enableConsoleLogging: false, // Disable for cleaner tests,
  enableStackTraces: false,
  maxEvents: 100,
});
    // Clear any existing events
    logger.clearEvents();
    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    // Stop periodic cleanup to prevent test interference
    (logger as any).stopPeriodicCleanup();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });
  describe('Event Logging', () => {
    it('should log basic security event', () => {
      const eventId = logger.logEvent(;);
        SecuritySeverity.INFO,
        SecurityEventCategory.EXPRESSION_VALIDATION,
        'Test expression validated',
        { expression: 'x > 5' }
      );
      expect(eventId).toMatch(/^SEC-\d+-\d+$/);
      const events = logger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({)
  id: eventId,
        severity: SecuritySeverity.INFO,
        category: SecurityEventCategory.EXPRESSION_VALIDATION,
        message: 'Test expression validated',
        context: { expression: 'x > 5' },
        blocked: false;
  });
    });
    it('should log blocked operations', () => {
  logger.logExpressionBlocked('eval("code")', 'Contains eval', {
  nodeId: 'node-1',
});
      const events = logger.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({)
  severity: SecuritySeverity.ERROR,
        category: SecurityEventCategory.EXPRESSION_VALIDATION,
        message: 'Expression blocked: Contains eval',
        context: { expression: 'eval("code")', nodeId: 'node-1' },
        blocked: true;
  });
    });
    it('should log different severity levels', () => {
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.MATH_FUNCTION_ALLOWED, 'Math.min allowed');
      logger.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_FUNCTION_BLOCKED, 'Math.random blocked');
      logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.AST_NODE_BLOCKED, 'FunctionExpression blocked');
      logger.logEvent(SecuritySeverity.CRITICAL, SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT, 'Prototype pollution');
      const events = logger.getEvents();
      expect(events).toHaveLength(4);
      expect(events.map(e => e.severity)).toEqual([)
        SecuritySeverity.INFO,
        SecuritySeverity.WARNING,
        SecuritySeverity.ERROR,
        SecuritySeverity.CRITICAL
      ]);
    });
    it('should include timestamps', () => {
      const before = Date.now();
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Test');
      const after = Date.now();
      const event = logger.getEvents()[0];
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });
    it('should generate unique event IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const id = logger.logEvent(;);
          SecuritySeverity.INFO,
          SecurityEventCategory.EXPRESSION_VALIDATION,
          `Event ${i}`}
        );
        ids.add(id);
      expect(ids.size).toBe(10);
    });
  });
  describe('Helper Methods', () => {
  it('should log AST node blocks', () => {
  logger.logASTNodeBlocked('CallExpression', 'Function calls not allowed', {)
  astDepth: 5,
  nodeCount: 20,
});
      const event = logger.getEvents()[0];
      expect(event).toMatchObject({)
  severity: SecuritySeverity.ERROR,
        category: SecurityEventCategory.AST_NODE_BLOCKED,
        message: 'AST node \'CallExpression\' blocked: Function calls not allowed',
        context: { nodeType: 'CallExpression', astDepth: 5, nodeCount: 20 },
        blocked: true;
  });
    });
    it('should log Math function blocks', () => {
  logger.logMathFunctionBlocked('random', 'Non-deterministic', {)
  functionName: 'random',
});
      const event = logger.getEvents()[0];
      expect(event).toMatchObject({)
  severity: SecuritySeverity.WARNING,
        category: SecurityEventCategory.MATH_FUNCTION_BLOCKED,
        message: 'Math.random blocked: Non-deterministic',
        context: { functionName: 'random' },
        blocked: true;
  });
    });
    it('should log prototype pollution attempts', () => {
  logger.logPrototypePollutionAttempt('__proto__', {)
  expression: 'obj.__proto__.polluted = true',
});
      const event = logger.getEvents()[0];
      expect(event).toMatchObject({)
  severity: SecuritySeverity.CRITICAL,
        category: SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT,
        message: 'Prototype pollution attempt via property \'__proto__\'',
        context: { propertyName: '__proto__', expression: 'obj.__proto__.polluted = true' },
        blocked: true;
  });
    });
    it('should log security policy violations', () => {
  logger.logSecurityPolicyViolation('max-depth', 'Exceeded maximum AST depth of 20', {)
  astDepth: 25,
});
      const event = logger.getEvents()[0];
      expect(event).toMatchObject({)
  severity: SecuritySeverity.CRITICAL,
        category: SecurityEventCategory.SECURITY_POLICY_VIOLATION,
        message: 'Security policy \'max-depth\' violated: Exceeded maximum AST depth of 20',
        context: { astDepth: 25 },
        blocked: true;
  });
    });
  });
  describe('Event Filtering', () => {
    beforeEach(() => {
      // Add variety of events
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.MATH_FUNCTION_ALLOWED, 'Math.min');
      logger.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_FUNCTION_BLOCKED, 'Math.random');
      logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.AST_NODE_BLOCKED, 'CallExpression');
      logger.logEvent(SecuritySeverity.CRITICAL, SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT, '__proto__');
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'x > 5', {}, false);
      logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'eval()', {}, true);
    });
    it('should filter by severity', () => {
      const errors = logger.getEvents({ severity: SecuritySeverity.ERROR });
      expect(errors).toHaveLength(2);
      expect(errors.every(e => e.severity === SecuritySeverity.ERROR)).toBe(true);
    });
    it('should filter by category', () => {
      const mathEvents = logger.getEvents({ category: SecurityEventCategory.MATH_FUNCTION_BLOCKED });
      expect(mathEvents).toHaveLength(1);
      expect(mathEvents[0].message).toContain('Math.random');
    });
    it('should filter by blocked status', () => {
      const blocked = logger.getEvents({ blocked: true });
      expect(blocked).toHaveLength(4);
      const allowed = logger.getEvents({ blocked: false });
      expect(allowed).toHaveLength(2);
    });
    it('should filter by time range', () => {
      const midTime = logger.getEvents()[2].timestamp;
      const before = logger.getEvents({ endTime: midTime });
      expect(before).toHaveLength(3);
      const after = logger.getEvents({ startTime: midTime });
      expect(after).toHaveLength(4);
    });
    it('should combine multiple filters', () => {
  const filtered = logger.getEvents({)
  severity: SecuritySeverity.ERROR,
  category: SecurityEventCategory.EXPRESSION_VALIDATION,
  blocked: true,
});
      expect(filtered).toHaveLength(1);
      expect(filtered[0].message).toContain('eval()');
    });
  });
  describe('Expression Tracking', () => {
    it('should track unique expressions', () => {
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Test')
        { expression: 'x > 5' });
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Test')
        { expression: 'y < 10' });
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Test')
        { expression: 'x > 5' }); // Duplicate
      const stats = logger.getStatistics();
      expect(stats.uniqueExpressions).toBe(2);
    });
    it('should get events for specific expression', () => {
      const expr = 'dangerous.eval()';
      logger.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.EXPRESSION_VALIDATION, 'Warning')
        { expression: expr });
      logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Blocked')
        { expression: expr }, true);
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Other')
        { expression: 'safe.value' });
      const events = logger.getEventsForExpression(expr);
      expect(events).toHaveLength(2);
    });
    it('should check if expression has been blocked', () => {
      const safeExpr = 'x > 5';
      const dangerousExpr = 'eval(code)';
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Safe')
        { expression: safeExpr }, false);
      logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Dangerous')
        { expression: dangerousExpr }, true);
      expect(logger.hasExpressionBeenBlocked(safeExpr)).toBe(false);
      expect(logger.hasExpressionBeenBlocked(dangerousExpr)).toBe(true);
      expect(logger.hasExpressionBeenBlocked('unknown')).toBe(false);
    });
  });
  describe('Statistics', () => {
    beforeEach(() => {
      // Add comprehensive test data
      for (let i = 0; i < 5; i++) {
        logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.MATH_FUNCTION_ALLOWED, `Math.min ${i}`);}
      for (let i = 0; i < 3; i++) {
        logger.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_FUNCTION_BLOCKED, `Math.random ${i}`)}
          { expression: 'Math.random()' }, true);
      for (let i = 0; i < 2; i++) {
        logger.logEvent(SecuritySeverity.CRITICAL, SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT, `__proto__ ${i}`)}
          { expression: 'obj.__proto__' }, true);
    });
    it('should calculate event statistics', () => {
      const stats = logger.getStatistics();
      expect(stats.totalEvents).toBe(10);
      expect(stats.blockedOperations).toBe(5);
      expect(stats.uniqueExpressions).toBe(2);
      expect(stats.eventsBySeverity[SecuritySeverity.INFO]).toBe(5);
      expect(stats.eventsBySeverity[SecuritySeverity.WARNING]).toBe(3);
      expect(stats.eventsBySeverity[SecuritySeverity.CRITICAL]).toBe(2);
      expect(stats.eventsByCategory[SecurityEventCategory.MATH_FUNCTION_ALLOWED]).toBe(5);
      expect(stats.eventsByCategory[SecurityEventCategory.MATH_FUNCTION_BLOCKED]).toBe(3);
      expect(stats.eventsByCategory[SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT]).toBe(2);
    });
    it('should track top blocked patterns', () => {
      // Add more blocked patterns
      for (let i = 0; i < 5; i++) {
        logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Blocked')
          { expression: `eval(${i})` }, true);}
      for (let i = 0; i < 3; i++) {
        logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Blocked')
          { expression: `new Function(${i})` }, true);}
      const stats = logger.getStatistics();
      expect(stats.topBlockedPatterns).toHaveLength(4);
      expect(stats.topBlockedPatterns[0].pattern).toBe('eval(N)');
      expect(stats.topBlockedPatterns[0].count).toBe(5);
    });
    it('should track recent critical events', () => {
      const stats = logger.getStatistics();
      expect(stats.recentCriticalEvents).toHaveLength(2);
      expect(stats.recentCriticalEvents.every(e => e.severity === SecuritySeverity.CRITICAL)).toBe(true);
    });
  });
  describe('Memory Management', () => {
  it('should enforce max events limit', () => {
  const maxEvents = 10;
  const testLogger = SecurityAuditLogger.getInstance({ )
  maxEvents,
  enableConsoleLogging: false,
});
      testLogger.clearEvents();
      // Add more than max events
      for (let i = 0; i < 15; i++) {
        testLogger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, `Event ${i}`);}
      const events = testLogger.getEvents();
      expect(events).toHaveLength(maxEvents + 1); // +1 for overflow warning
      expect(events[events.length - 1].category).toBe(SecurityEventCategory.AUDIT_LOG_OVERFLOW);
    });
    it('should handle blocked pattern memory limits', () => {
      // Generate many unique blocked patterns
      for (let i = 0; i < 1000; i++) {
        logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Blocked')
          { expression: `dangerous_${i}_pattern` }, true);}
      // Should not throw and should maintain reasonable memory usage
      const stats = logger.getStatistics();
      expect(stats.topBlockedPatterns).toBeDefined();
      expect(stats.topBlockedPatterns.length).toBeLessThanOrEqual(10);
    });
  });
  describe('Export Functionality', () => {
    beforeEach(() => {
      logger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Test 1')
        { expression: 'x > 5', nodeType: 'Conditional' });
      logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.AST_NODE_BLOCKED, 'Test 2')
        { expression: 'eval()', nodeType: 'CallExpression' }, true);
    });
    it('should export events as JSON', () => {
  const json = logger.exportEvents('json');
  const parsed = JSON.parse(json);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed).toHaveLength(2);
  expect(parsed[0]).toMatchObject({)
  severity: SecuritySeverity.INFO,
  message: 'Test 1',
});
    });
    it('should export events as CSV', () => {
      const csv = logger.exportEvents('csv');
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3); // Header + 2 events
      expect(lines[0]).toContain('"id","timestamp","severity","category","message","blocked","expression","nodeType"');
      expect(lines[1]).toContain('"INFO"');
      expect(lines[1]).toContain('"x > 5"');
      expect(lines[2]).toContain('"ERROR"');
      expect(lines[2]).toContain('"eval()"');
    });
  });
  describe('Console Logging', () => {
  it('should log to console when enabled', () => {
  const consoleLogger = SecurityAuditLogger.getInstance({ )
  enableConsoleLogging: true,
});
      consoleLogger.clearEvents();
      consoleLogger.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.MATH_FUNCTION_BLOCKED, 'Test warning');
      expect(consoleLogSpy).toHaveBeenCalledWith()
        expect.stringContaining('[SECURITY WARNING]'),
        expect.any(String)
      );
    });
    it('should use appropriate console colors and icons', () => {
  const consoleLogger = SecurityAuditLogger.getInstance({ )
  enableConsoleLogging: true,
});
      consoleLogger.clearEvents();
      // Test different severity levels
      consoleLogger.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'Info');
      expect(consoleLogSpy).toHaveBeenLastCalledWith()
        expect.stringContaining('ℹ️'),
        expect.any(String)
      );
      consoleLogger.logEvent(SecuritySeverity.WARNING, SecurityEventCategory.EXPRESSION_VALIDATION, 'Warning');
      expect(consoleLogSpy).toHaveBeenLastCalledWith()
        expect.stringContaining('⚠️'),
        expect.any(String)
      );
      consoleLogger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Error');
      expect(consoleLogSpy).toHaveBeenLastCalledWith()
        expect.stringContaining('❌'),
        expect.any(String)
      );
      consoleLogger.logEvent(SecuritySeverity.CRITICAL, SecurityEventCategory.EXPRESSION_VALIDATION, 'Critical');
      expect(consoleLogSpy).toHaveBeenLastCalledWith()
        expect.stringContaining('🚨'),
        expect.any(String)
      );
    });
  });
  describe('Stack Trace Support', () => {
  it('should capture stack traces when enabled', () => {
  const traceLogger = SecurityAuditLogger.getInstance({ )
  enableStackTraces: true,
  enableConsoleLogging: false,
});
      traceLogger.clearEvents();
      traceLogger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Test');
      const event = traceLogger.getEvents()[0];
      expect(event.context.stackTrace).toBeDefined();
      expect(event.context.stackTrace).toContain('at ');
    });
    it('should not capture stack traces when disabled', () => {
      logger.logEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION, 'Test');
      const event = logger.getEvents()[0];
      expect(event.context.stackTrace).toBeUndefined();
    });
  });
  describe('Decorator', () => {
  class TestClass {
  @auditSecurityEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION)
  successMethod(): string {,
  return 'success';
  @auditSecurityEvent(SecuritySeverity.ERROR, SecurityEventCategory.EXPRESSION_VALIDATION)
  errorMethod(): void {,
  throw new Error('Test error');
  it('should audit successful method execution', () => {
  const instance = new TestClass();
  logger.clearEvents();
  const result = instance.successMethod();
  expect(result).toBe('success');
  const events = logger.getEvents();
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({)
  severity: SecuritySeverity.INFO,
  message: 'successMethod executed successfully',
  context: {,
  functionName: 'TestClass.successMethod',
},
  blocked: false;
  });
    });
    it('should audit method execution errors', () => {
  const instance = new TestClass();
  logger.clearEvents();
  expect(() => instance.errorMethod()).toThrow('Test error');
  const events = logger.getEvents();
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({)
  severity: SecuritySeverity.ERROR,
  message: expect.stringContaining('errorMethod failed'),
  blocked: true,
});
    });
    it('should track execution time', () => {
      const instance = new TestClass();
      logger.clearEvents();
      instance.successMethod();
      const event = logger.getEvents()[0];
      expect(event.context.executionTime).toBeGreaterThanOrEqual(0);
    });
  });
  describe('Singleton Behavior', () => {
    it('should return same instance', () => {
      const instance1 = SecurityAuditLogger.getInstance();
      const instance2 = SecurityAuditLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
    it('should share events across getInstance calls', () => {
      const instance1 = SecurityAuditLogger.getInstance();
      instance1.clearEvents();
      instance1.logEvent(SecuritySeverity.INFO, SecurityEventCategory.EXPRESSION_VALIDATION, 'From instance 1');
      const instance2 = SecurityAuditLogger.getInstance();
      const events = instance2.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].message).toBe('From instance 1');
    });
  });
  describe('Global Instance', () => {
    it('should provide global securityAudit instance', () => {
      expect(securityAudit).toBeDefined();
      expect(securityAudit).toBeInstanceOf(SecurityAuditLogger);
    });
    it('should work with global instance', () => {
      securityAudit.clearEvents();
      securityAudit.logExpressionBlocked('eval()', 'Contains eval');
      const events = securityAudit.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].message).toContain('Contains eval');
    });
  });
});