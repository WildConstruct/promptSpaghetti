/**
 * OWASP Security Test Suite
 * 
 * Comprehensive tests for OWASP Top 10 vulnerabilities in the expression evaluation system
 * Tests cover injection, broken access control, cryptographic failures, and more
 * 
 * References OWASP Top 10 2021:
 * - A01:2021 – Broken Access Control
 * - A02:2021 – Cryptographic Failures  
 * - A03:2021 – Injection
 * - A04:2021 – Insecure Design
 * - A05:2021 – Security Misconfiguration
 * - A06:2021 – Vulnerable and Outdated Components
 * - A07:2021 – Identification and Authentication Failures
 * - A08:2021 – Software and Data Integrity Failures
 * - A09:2021 – Security Logging and Monitoring Failures
 * - A10:2021 – Server-Side Request Forgery (SSRF)
 */
import { SafeExpressionEvaluator } from '../runtime/expression-evaluator';
import { ConditionalNode } from '../runtime/nodes/Conditional';
import { AdvancedExecutionContext } from '../runtime/advanced';
import { securityAudit, SecurityEventCategory, SecuritySeverity } from '../runtime/security-audit-logger';
describe('OWASP Security Test Suite', () => {
  beforeEach(() => {
    securityAudit.clearEvents();
  });
  afterEach(() => {
    (securityAudit as any).stopPeriodicCleanup();
  });
  describe('A01:2021 - Broken Access Control', () => {
    it('should prevent access to restricted properties', () => {
      const context = SafeExpressionEvaluator.createSafeContext({)
  user: {,
  name: 'John',
          role: 'user',
          __admin: true,  // Hidden property
          _internal: { secret: 'data' }
      });
      // Should allow normal property access
      expect(SafeExpressionEvaluator.evaluate('user.name', context)).toBe('John');
      expect(SafeExpressionEvaluator.evaluate('user.role', context)).toBe('user');
      // Should block prototype chain manipulation
      expect(() => {
        SafeExpressionEvaluator.evaluate('user.__proto__.isAdmin = true', context);
      }).toThrow();
      // Should block constructor access
      expect(() => {
        SafeExpressionEvaluator.evaluate('user.constructor', context);
      }).toThrow();
    });
    it('should prevent privilege escalation attempts', () => {
      const ctx = new AdvancedExecutionContext('test');
      ctx.variables = {
        currentUser: { role: 'guest', permissions: [] }
      };
      const privilegeEscalationAttempts = [;
        'currentUser.role = "admin"',
        'currentUser.permissions.push("delete")',
        'Object.assign(currentUser, { role: "admin" })',
        'currentUser["ro" + "le"] = "admin"',
        'delete currentUser.role'
      ];
      for (const attempt of privilegeEscalationAttempts) {
        const node = new ConditionalNode('test', [);
          { condition: attempt, output: 'escalated' }
        ], 'safe');
        expect(() => node.run(ctx)).toThrow();
    });
  });
  describe('A02:2021 - Cryptographic Failures', () => {
    it('should not expose cryptographic functions', () => {
      const context = SafeExpressionEvaluator.createSafeContext({});
      // Should not have access to crypto APIs
      const cryptoAttempts = [;
        'crypto.randomBytes(16)',
        'require("crypto").createHash("md5")',
        'window.crypto.getRandomValues',
        'Math.random()',  // Not cryptographically secure
        'Date.now()'      // Predictable
      ];
      for (const attempt of cryptoAttempts) {
        expect(() => {
          SafeExpressionEvaluator.evaluate(attempt, context);
        }).toThrow();
    });
    it('should prevent timing attack vectors', () => {
  const context = SafeExpressionEvaluator.createSafeContext({)
  password: 'secret123',
});
      // These comparison methods could be vulnerable to timing attacks
      // In a real implementation, we'd want constant-time comparison
      // For now, we just ensure no function access that could leak timing
      expect(() => {
        SafeExpressionEvaluator.evaluate('password.charCodeAt(0)', context);
      }).toThrow();
    });
  });
  describe('A03:2021 - Injection', () => {
    it('should prevent code injection', () => {
      const context = SafeExpressionEvaluator.createSafeContext({)
  userInput: 'alert("XSS")',
        data: { value: 42 }
      });
      // Direct eval injection
      expect(() => {
        SafeExpressionEvaluator.evaluate('eval(userInput)', context);
      }).toThrow();
      // Function constructor injection
      expect(() => {
        SafeExpressionEvaluator.evaluate('new Function(userInput)', context);
      }).toThrow();
      // Indirect eval
      expect(() => {
        SafeExpressionEvaluator.evaluate('(0, eval)(userInput)', context);
      }).toThrow();
      // Template literal injection attempt
      expect(() => {
        SafeExpressionEvaluator.evaluate('`${eval(userInput)}`', context);}
      }).toThrow();
    });
    it('should prevent command injection patterns', () => {
  const context = SafeExpressionEvaluator.createSafeContext({)
  filename: '../../../etc/passwd',
});
      // File system access attempts
      const fsAttempts = [;
        'require("fs").readFileSync(filename)',
        'process.binding("fs").open(filename)',
        '__dirname + "/" + filename',
        'import("fs").then(fs => fs.readFile(filename))'
      ];
      for (const attempt of fsAttempts) {
        expect(() => {
          SafeExpressionEvaluator.evaluate(attempt, context);
        }).toThrow();
    });
    it('should sanitize regex patterns', () => {
  const context = SafeExpressionEvaluator.createSafeContext({)
  pattern: '(a+)+$',  // ReDoS pattern,
  text: 'aaaaaaaaaaaaaaaaaaaaaaaab',
});
      // Should block regex constructor
      expect(() => {
        SafeExpressionEvaluator.evaluate('new RegExp(pattern)', context);
      }).toThrow();
      // Should block regex literal with variable
      expect(() => {
        SafeExpressionEvaluator.evaluate('eval(`/${pattern}/`)', context);}
      }).toThrow();
    });
  });
  describe('A04:2021 - Insecure Design', () => {
    it('should enforce secure defaults', () => {
      const ctx = new AdvancedExecutionContext('test');
      // Strict mode should be available as an option
      const strictNode = new ConditionalNode('strict', [);
        { condition: 'undefinedVar > 0', output: 'should fail' }
      ], 'default', { strictMode: true });
      expect(() => strictNode.run(ctx)).toThrow();
      // Non-strict mode logs warning but continues
      const nonStrictNode = new ConditionalNode('non-strict', [);
        { condition: 'undefinedVar > 0', output: 'should fail' }
      ], 'default', { strictMode: false });
      expect(nonStrictNode.run(ctx)).toBe('default');
      // Check warning was logged
      const warnings = securityAudit.getEvents({ )
        severity: SecuritySeverity.WARNING ;
  });
      expect(warnings.length).toBeGreaterThan(0);
    });
    it('should limit expression complexity by design', () => {
      // Create expression that would cause exponential parsing
      let complexExpr = 'x';
      for (let i = 0; i < 100; i++) {
        complexExpr = `(${complexExpr} || ${complexExpr})`;}
      const context = SafeExpressionEvaluator.createSafeContext({ x: true });
      // Should fail due to complexity
      expect(() => {
        SafeExpressionEvaluator.evaluate(complexExpr, context);
      }).toThrow();
    });
  });
  describe('A05:2021 - Security Misconfiguration', () => {
    it('should have secure configuration by default', () => {
      // Verify no dangerous functions in default context
      const context = SafeExpressionEvaluator.createSafeContext({});
      expect(context.eval).toBeUndefined();
      expect(context.Function).toBeUndefined();
      expect(context.require).toBeUndefined();
      expect(context.import).toBeUndefined();
      expect(context.process).toBeUndefined();
      expect(context.global).toBeUndefined();
      expect(context.window).toBeUndefined();
      // Verify safe Math configuration
      expect(context.Math).toBeDefined();
      expect(context.Math.min).toBeDefined();
      expect(context.Math.random).toBeUndefined();
      expect(context.Math.pow).toBeUndefined();
    });
    it('should not expose internal errors', () => {
      const context = SafeExpressionEvaluator.createSafeContext({});
      try {
        SafeExpressionEvaluator.evaluate('nonexistent.property.deep', context);
      } catch (error: Error) {
        // Error should not expose internal details
        expect(error.message).not.toContain('at Object.evaluate');
        expect(error.stack).toBeDefined(); // Stack trace is available for debugging
    });
  });
  describe('A08:2021 - Software and Data Integrity Failures', () => {
    it('should prevent prototype pollution', () => {
      const obj = {};
      const context = SafeExpressionEvaluator.createSafeContext({ obj });
      // Various prototype pollution attempts
      const pollutionVectors = [;
        'obj.__proto__.polluted = true',
        'obj.constructor.prototype.polluted = true',
        'Object.prototype.polluted = true',
        'Object.defineProperty(Object.prototype, "polluted", { value: true })',
        'Object.setPrototypeOf(obj, { polluted: true })'
      ];
      for (const vector of pollutionVectors) {
        expect(() => {
          SafeExpressionEvaluator.evaluate(vector, context);
        }).toThrow();
      // Verify prototype is clean
      expect((obj as any).polluted).toBeUndefined();
      expect(Object.prototype.hasOwnProperty('polluted')).toBe(false);
    });
    it('should prevent object mutation', () => {
      const frozenObj = Object.freeze({ value: 42 });
      const context = SafeExpressionEvaluator.createSafeContext({ )
        frozenObj,
        normalObj: { value: 10 }
      });
      // Should respect frozen objects
      expect(() => {
        SafeExpressionEvaluator.evaluate('frozenObj.value = 100', context);
      }).toThrow();
      // Should prevent adding properties
      expect(() => {
        SafeExpressionEvaluator.evaluate('frozenObj.newProp = "bad"', context);
      }).toThrow();
      // Should prevent property deletion  
      expect(() => {
        SafeExpressionEvaluator.evaluate('delete normalObj.value', context);
      }).toThrow();
    });
  });
  describe('A09:2021 - Security Logging and Monitoring Failures', () => {
    it('should log all security events', () => {
      const context = SafeExpressionEvaluator.createSafeContext({ x: 5 });
      // Successful operation
      SafeExpressionEvaluator.evaluate('x > 3', context);
      // Failed operations
      try {
        SafeExpressionEvaluator.evaluate('eval("bad")', context);
      } catch (e) {}
      try {
        SafeExpressionEvaluator.evaluate('x.__proto__', context);
      } catch (e) {}
      // Verify comprehensive logging
      const allEvents = securityAudit.getEvents();
      expect(allEvents.length).toBeGreaterThan(2);
      // Check for blocked events
      const blockedEvents = securityAudit.getEvents({ blocked: true });
      expect(blockedEvents.length).toBeGreaterThan(0);
      // Verify critical events are captured
      const criticalEvents = securityAudit.getEvents({ )
        severity: SecuritySeverity.CRITICAL ;
  });
      const hasCritical = criticalEvents.length > 0 || ;
        blockedEvents.some(e => e.message.includes('__proto__'));
      expect(hasCritical).toBe(true);
    });
    it('should provide actionable security metrics', () => {
      // Generate various security events
      const ctx = new AdvancedExecutionContext('test');
      ctx.variables = { value: 10 };
      // Mix of safe and dangerous operations
      const operations = [;
        { expr: 'value > 5', safe: true },
        { expr: 'Math.min(value, 20)', safe: true },
        { expr: 'eval(value)', safe: false },
        { expr: 'value.constructor', safe: false },
        { expr: 'value * 2', safe: true }
      ];
      for (const op of operations) {
        try {
          const node = new ConditionalNode('test', [);
            { condition: op.expr, output: 'result' }
          ], 'default');
          node.run(ctx);
        } catch (e) {
          // Expected for unsafe operations
      // Get security statistics
      const stats = securityAudit.getStatistics();
      expect(stats.totalEvents).toBeGreaterThan(0);
      expect(stats.blockedOperations).toBeGreaterThan(0);
      expect(stats.uniqueExpressions).toBeGreaterThan(0);
      // Should identify patterns in blocked operations
      if (stats.topBlockedPatterns.length > 0) {
        expect(stats.topBlockedPatterns[0].count).toBeGreaterThan(0);
    });
  });
  describe('A10:2021 - Server-Side Request Forgery (SSRF)', () => {
  it('should prevent network access', () => {
  const context = SafeExpressionEvaluator.createSafeContext({)
  url: 'http://internal.service/api/data',
});
      // Network access attempts
      const networkAttempts = [;
        'fetch(url)',
        'XMLHttpRequest.open("GET", url)',
        'require("http").get(url)',
        'import("node-fetch").then(f => f.default(url))',
        'new WebSocket(url)',
        'navigator.sendBeacon(url)'
      ];
      for (const attempt of networkAttempts) {
        expect(() => {
          SafeExpressionEvaluator.evaluate(attempt, context);
        }).toThrow();
    });
    it('should prevent DNS resolution', () => {
  const context = SafeExpressionEvaluator.createSafeContext({)
  hostname: 'internal.database.local',
});
      // DNS resolution attempts
      expect(() => {
        SafeExpressionEvaluator.evaluate('require("dns").resolve(hostname)', context);
      }).toThrow();
      expect(() => {
        SafeExpressionEvaluator.evaluate('require("net").connect(hostname)', context);
      }).toThrow();
    });
  });
  describe('Additional Security Patterns', () => {
    it('should prevent sandbox escape attempts', () => {
      const context = SafeExpressionEvaluator.createSafeContext({});
      // Common sandbox escape techniques
      const escapeAttempts = [;
        'this.constructor.constructor("return process")().exit()',
        '[].constructor.constructor("return global")()',
        'Function.prototype.constructor("return this")()',
        '(function(){}).constructor("return global")()',
        'Error.constructor("return process")().exit()',
        'Object.constructor.constructor("return require")()("fs")'
      ];
      for (const attempt of escapeAttempts) {
        expect(() => {
          SafeExpressionEvaluator.evaluate(attempt, context);
        }).toThrow();
        // Verify the attempt was logged
        const events = securityAudit.getEvents();
        expect(events[events.length - 1].blocked).toBe(true);
    });
    it('should handle Unicode and encoding attacks', () => {
      const context = SafeExpressionEvaluator.createSafeContext({});
      // Unicode normalization attacks
      const unicodeAttacks = [;
        'ev\\u0061l("code")',  // eval with Unicode escape
        'ev\\x61l("code")',    // eval with hex escape  
        'e\\u{76}al("code")',  // eval with Unicode code point
        '\\u0065\\u0076\\u0061\\u006c("code")',  // fully escaped eval
        'Object["\\x70\\x72\\x6f\\x74\\x6f\\x74\\x79\\x70\\x65"]'  // prototype
      ];
      for (const attack of unicodeAttacks) {
        expect(() => {
          SafeExpressionEvaluator.evaluate(attack, context);
        }).toThrow();
    });
  });
});