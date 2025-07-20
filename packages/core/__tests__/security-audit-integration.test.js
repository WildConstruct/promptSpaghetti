/**
 * Security Audit Logger Integration Tests
 *
 * Tests the integration of security audit logging with other security components
 */
import { SafeExpressionEvaluator } from '../runtime/expression-evaluator';
import { createAuditedSafeMathContext, MathFunctionAuditor } from '../runtime/safe-math-context';
import { createConditionalNodeFilter } from '../runtime/ast-node-whitelist';
import { securityAudit, SecuritySeverity, SecurityEventCategory } from '../runtime/security-audit-logger';
import { ConditionalNode } from '../runtime/nodes/Conditional';
describe('Security Audit Logger Integration', () => {
    beforeEach(() => {
        // Clear audit logs
        securityAudit.clearEvents();
        MathFunctionAuditor.clearAuditLog();
    });
    afterEach(() => {
        // Stop periodic cleanup
        securityAudit.stopPeriodicCleanup();
    });
    describe('Math Function Auditing', () => {
        it('should log allowed Math function calls', () => {
            const safeMath = createAuditedSafeMathContext('test-context');
            // Call allowed functions
            const result1 = safeMath.min(5, 3);
            const result2 = safeMath.max(10, 20);
            const result3 = safeMath.floor(3.7);
            expect(result1).toBe(3);
            expect(result2).toBe(20);
            expect(result3).toBe(3);
            // Check audit logs
            const events = securityAudit.getEvents({ category: SecurityEventCategory.MATH_FUNCTION_ALLOWED });
            expect(events).toHaveLength(3);
            expect(events[0].message).toContain('Math.min accessed');
            expect(events[1].message).toContain('Math.max accessed');
            expect(events[2].message).toContain('Math.floor accessed');
        });
        it('should log blocked Math function attempts', () => {
            const safeMath = createAuditedSafeMathContext('test-context');
            // Try to access blocked function
            expect(() => safeMath.random).toThrow('Math.random is not allowed');
            expect(() => safeMath.pow).toThrow('Math.pow is not allowed');
            // Check audit logs
            const events = securityAudit.getEvents({ category: SecurityEventCategory.MATH_FUNCTION_BLOCKED });
            expect(events).toHaveLength(2);
            expect(events[0].message).toContain('Math.random blocked');
            expect(events[1].message).toContain('Math.pow blocked');
        });
        it('should log Math validation failures', () => {
            const safeMath = createAuditedSafeMathContext('test-context');
            // Try invalid inputs
            expect(() => safeMath.min('not a number')).toThrow();
            expect(() => safeMath.max(Infinity)).toThrow();
            // Check audit logs
            const events = securityAudit.getEvents({ category: SecurityEventCategory.MATH_VALIDATION_FAILED });
            expect(events).toHaveLength(2);
            expect(events[0].severity).toBe(SecuritySeverity.WARNING);
            expect(events[1].severity).toBe(SecuritySeverity.WARNING);
        });
    });
    describe('AST Node Filtering', () => {
        it('should log blocked AST nodes', () => {
            const filter = createConditionalNodeFilter();
            // Create a dangerous AST node
            const dangerousNode = {
                type: 'FunctionExpression',
                loc: { start: { line: 1, column: 0 } }
            };
            const result = filter.filterAST(dangerousNode);
            expect(result.allowed).toBe(false);
            // Check audit logs
            const events = securityAudit.getEvents({ category: SecurityEventCategory.AST_NODE_BLOCKED });
            expect(events).toHaveLength(1);
            expect(events[0].message).toContain('AST node \'FunctionExpression\' blocked');
            expect(events[0].context.nodeType).toBe('FunctionExpression');
        });
    });
    describe('Expression Evaluation', () => {
        it('should log prototype pollution attempts', () => {
            const context = SafeExpressionEvaluator.createSafeContext({ x: 5 });
            // Try prototype pollution
            expect(() => {
                SafeExpressionEvaluator.evaluate('x.__proto__.polluted = true', context);
            }).toThrow('Access to property \'__proto__\' is not allowed');
            // Check audit logs
            const events = securityAudit.getEvents({ category: SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT });
            expect(events).toHaveLength(1);
            expect(events[0].severity).toBe(SecuritySeverity.CRITICAL);
            expect(events[0].message).toContain('Prototype pollution attempt');
        });
        it('should log dangerous expression patterns', () => {
            const context = SafeExpressionEvaluator.createSafeContext({ x: 5 });
            // Try dangerous expressions
            expect(() => {
                SafeExpressionEvaluator.evaluate('eval("alert(1)")', context);
            }).toThrow();
            // Check audit logs - should have multiple events
            const allEvents = securityAudit.getEvents();
            const dangerousEvents = allEvents.filter(e => e.category === SecurityEventCategory.DANGEROUS_PATTERN ||
                e.category === SecurityEventCategory.AST_NODE_BLOCKED);
            expect(dangerousEvents.length).toBeGreaterThan(0);
        });
    });
    describe('Conditional Node Integration', () => {
        it('should log expression evaluation in Conditional nodes', () => {
            const ctx = new AdvancedExecutionContext('test-seed');
            ctx.variables.x = 10;
            ctx.variables.y = 5;
            const conditional = new ConditionalNode('test-node', [
                { condition: 'x > y', output: 'x is greater' },
                { condition: 'x < y', output: 'y is greater' }
            ], 'equal');
            const result = conditional.run(ctx);
            expect(result).toBe('x is greater');
            // Check audit logs
            const events = securityAudit.getEvents({ category: SecurityEventCategory.EXPRESSION_VALIDATION });
            const conditionalEvents = events.filter(e => e.context.nodeId === 'test-node');
            expect(conditionalEvents.length).toBeGreaterThan(0);
            expect(conditionalEvents[0].message).toContain('Evaluating conditional expression');
        });
        it('should log dangerous patterns in Conditional expressions', () => {
            const ctx = new AdvancedExecutionContext('test-seed');
            const conditional = new ConditionalNode('test-node', [
                { condition: 'eval("malicious code")', output: 'bad' }
            ], 'default');
            expect(() => conditional.run(ctx)).toThrow('Dangerous pattern detected');
            // Check audit logs
            const events = securityAudit.getEvents({
                category: SecurityEventCategory.EXPRESSION_VALIDATION,
                blocked: true
            });
            expect(events.length).toBeGreaterThan(0);
            const blockedEvent = events.find(e => e.context.nodeId === 'test-node');
            expect(blockedEvent).toBeDefined();
            expect(blockedEvent?.message).toContain('Dangerous pattern detected');
        });
    });
    describe('Comprehensive Security Monitoring', () => {
        it('should track security events across multiple components', () => {
            const ctx = new AdvancedExecutionContext('test-seed');
            ctx.variables.value = 15;
            // 1. Create conditional node with Math operations
            const conditional = new ConditionalNode('math-node', [
                { condition: 'Math.min(value, 10) === 10', output: 'capped at 10' },
                { condition: 'Math.max(value, 20) === 20', output: 'at least 20' }
            ], 'in range');
            // 2. Run the conditional (should use first condition)
            const result = conditional.run(ctx);
            expect(result).toBe('capped at 10');
            // 3. Try some dangerous operations
            const dangerousConditional = new ConditionalNode('danger-node', [
                { condition: 'value.constructor.name === "Number"', output: 'dangerous' }
            ], 'safe');
            expect(() => dangerousConditional.run(ctx)).toThrow();
            // 4. Check comprehensive audit log
            const stats = securityAudit.getStatistics();
            expect(stats.totalEvents).toBeGreaterThan(3);
            expect(stats.eventsByCategory[SecurityEventCategory.EXPRESSION_VALIDATION]).toBeGreaterThan(0);
            expect(stats.eventsByCategory[SecurityEventCategory.MATH_FUNCTION_ALLOWED]).toBeGreaterThan(0);
            expect(stats.blockedOperations).toBeGreaterThan(0);
            // 5. Export events for analysis
            const jsonExport = securityAudit.exportEvents('json');
            const events = JSON.parse(jsonExport);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBe(stats.totalEvents);
        });
    });
    describe('Event Filtering and Analysis', () => {
        it('should support complex event queries', () => {
            // Generate variety of events
            const ctx = new AdvancedExecutionContext('test-seed');
            ctx.variables.a = 5;
            ctx.variables.b = 10;
            // Safe operations
            const safeConditional = new ConditionalNode('safe-node', [
                { condition: 'a < b', output: 'a is less' },
                { condition: 'Math.abs(a - b) > 0', output: 'different' }
            ], 'same');
            safeConditional.run(ctx);
            // Dangerous operations
            const dangerousConditional = new ConditionalNode('danger-node', [
                { condition: 'a.__proto__', output: 'proto' },
                { condition: 'eval(a)', output: 'eval' }
            ], 'safe');
            try {
                dangerousConditional.run(ctx);
            }
            catch (e) {
                // Expected
            }
            // Query events
            const allEvents = securityAudit.getEvents();
            const criticalEvents = securityAudit.getEvents({ severity: SecuritySeverity.CRITICAL });
            const blockedEvents = securityAudit.getEvents({ blocked: true });
            const mathEvents = securityAudit.getEvents({
                category: SecurityEventCategory.MATH_FUNCTION_ALLOWED
            });
            expect(allEvents.length).toBeGreaterThan(4);
            expect(criticalEvents.length).toBeGreaterThan(0);
            expect(blockedEvents.length).toBeGreaterThan(0);
            expect(mathEvents.length).toBeGreaterThan(0);
            // Check CSV export
            const csvExport = securityAudit.exportEvents('csv');
            const lines = csvExport.split('\n');
            expect(lines[0]).toContain('"id","timestamp","severity","category"');
            expect(lines.length).toBe(allEvents.length + 1); // +1 for header
        });
    });
});
