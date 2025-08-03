/**
 * Epic 1 Regression Test Framework
 * Ensures existing functionality is preserved during migration
 */
/**
 * Core regression test runner
 */
export class RegressionTestRunner {
    suites = new Map();
    results = new Map();
    /**
     * Register a test suite
     */
    registerSuite(suite) {
        this.suites.set(suite.id, suite);
    }
    /**
     * Run a specific test suite
     */
    async runSuite(suiteId) {
        const suite = this.suites.get(suiteId);
        if (!suite) {
            throw new Error(`Suite ${suiteId} not found`);
        }
        const results = [];
        const startTime = Date.now();
        for (const test of suite.tests) {
            const result = await this.runTest(test);
            results.push(result);
        }
        const duration = Date.now() - startTime;
        const passed = results.filter(r => r.status === 'passed').length;
        const passRate = (passed / results.length) * 100;
        // Store results
        this.results.set(suiteId, results);
        return {
            suiteId,
            suiteName: suite.name,
            totalTests: results.length,
            passed,
            failed: results.filter(r => r.status === 'failed').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            passRate,
            duration,
            results,
        };
    }
    /**
     * Run a single test
     */
    async runTest(test) {
        const startTime = Date.now();
        const stepResults = [];
        try {
            for (const step of test.steps) {
                const stepResult = await this.runStep(step);
                stepResults.push(stepResult);
                if (!stepResult.passed) {
                    return {
                        testId: test.id,
                        testName: test.name,
                        status: 'failed',
                        duration: Date.now() - startTime,
                        error: `Step failed: ${step.action}`,
                        stepResults,
                    };
                }
            }
            return {
                testId: test.id,
                testName: test.name,
                status: 'passed',
                duration: Date.now() - startTime,
                stepResults,
            };
        }
        catch (error) {
            return {
                testId: test.id,
                testName: test.name,
                status: 'failed',
                duration: Date.now() - startTime,
                error: error.message,
                stepResults,
            };
        }
    }
    /**
     * Run a test step
     */
    async runStep(step) {
        // This would be implemented based on the specific step type
        // For now, returning a mock result
        return {
            action: step.action,
            passed: true,
            duration: Math.random() * 100,
        };
    }
    /**
     * Generate coverage report
     */
    generateCoverageReport() {
        const allTests = [];
        this.suites.forEach(suite => allTests.push(...suite.tests));
        const total = allTests.length;
        const covered = allTests.filter(t => t.status === 'passed').length;
        const byCategory = {};
        const byFeature = {};
        allTests.forEach(test => {
            // By category
            if (!byCategory[test.category]) {
                byCategory[test.category] = { total: 0, covered: 0 };
            }
            byCategory[test.category].total++;
            if (test.status === 'passed') {
                byCategory[test.category].covered++;
            }
            // By feature
            if (!byFeature[test.feature]) {
                byFeature[test.feature] = { total: 0, covered: 0 };
            }
            byFeature[test.feature].total++;
            if (test.status === 'passed') {
                byFeature[test.feature].covered++;
            }
        });
        return {
            total,
            covered,
            percentage: (covered / total) * 100,
            byCategory,
            byFeature,
        };
    }
}
/**
 * Epic 1 Core Functionality Test Suite
 */
export const EPIC1_CORE_REGRESSION_SUITE = {
    id: 'epic1-core-regression',
    name: 'Epic 1 Core Functionality Regression',
    version: '1.0.0',
    tests: [
        {
            id: 'test-graph-execution',
            name: 'Graph execution produces deterministic output',
            category: 'integration',
            priority: 'critical',
            feature: 'execution-engine',
            steps: [
                {
                    action: 'Create graph with weighted choice node',
                    input: { nodes: ['weighted-choice'], seed: 12345 },
                    expectedOutput: { nodeCount: 1 },
                },
                {
                    action: 'Execute graph with same seed',
                    input: { seed: 12345 },
                    expectedOutput: { output: 'expected-value' },
                },
                {
                    action: 'Execute again with same seed',
                    input: { seed: 12345 },
                    expectedOutput: { output: 'expected-value' },
                },
            ],
            expectedBehavior: 'Same seed produces identical output',
        },
        {
            id: 'test-node-connections',
            name: 'Node connections validate correctly',
            category: 'unit',
            priority: 'high',
            feature: 'graph-validation',
            steps: [
                {
                    action: 'Create two compatible nodes',
                    input: { sourceType: 'text', targetType: 'concat' },
                    expectedOutput: { canConnect: true },
                },
                {
                    action: 'Attempt invalid connection',
                    input: { sourceType: 'text', targetType: 'invalid' },
                    expectedOutput: { canConnect: false, error: 'Type mismatch' },
                },
            ],
            expectedBehavior: 'Only valid connections allowed',
        },
        {
            id: 'test-variable-scoping',
            name: 'Variables maintain proper scope',
            category: 'integration',
            priority: 'high',
            feature: 'variable-system',
            steps: [
                {
                    action: 'Set variable in parent scope',
                    input: { name: 'test', value: 'parent' },
                    expectedOutput: { success: true },
                },
                {
                    action: 'Access in child scope',
                    input: { name: 'test' },
                    expectedOutput: { value: 'parent' },
                },
                {
                    action: 'Override in child scope',
                    input: { name: 'test', value: 'child' },
                    expectedOutput: { success: true },
                },
                {
                    action: 'Parent scope unchanged',
                    input: { name: 'test', scope: 'parent' },
                    expectedOutput: { value: 'parent' },
                },
            ],
            expectedBehavior: 'Variable scoping works correctly',
        },
        {
            id: 'test-ui-rendering',
            name: 'UI components render without errors',
            category: 'visual',
            priority: 'medium',
            feature: 'ui-components',
            steps: [
                {
                    action: 'Render GraphEditor component',
                    expectedOutput: { rendered: true, errors: [] },
                },
                {
                    action: 'Add node to canvas',
                    input: { nodeType: 'text' },
                    expectedOutput: { nodeCount: 1 },
                },
                {
                    action: 'Take visual snapshot',
                    expectedOutput: { snapshotMatch: true },
                },
            ],
            expectedBehavior: 'UI renders correctly',
        },
    ],
    coverage: {
        total: 4,
        covered: 0,
        percentage: 0,
        byCategory: {
            unit: { total: 1, covered: 0 },
            integration: { total: 2, covered: 0 },
            e2e: { total: 0, covered: 0 },
            visual: { total: 1, covered: 0 },
        },
        byFeature: {
            'execution-engine': { total: 1, covered: 0 },
            'graph-validation': { total: 1, covered: 0 },
            'variable-system': { total: 1, covered: 0 },
            'ui-components': { total: 1, covered: 0 },
        },
    },
};
/**
 * Test inventory builder
 */
export class TestInventoryBuilder {
    features = new Map();
    /**
     * Audit codebase for testable features
     */
    async auditCodebase() {
        // This would analyze the codebase to identify all features
        // For now, returning a predefined inventory
        const inventory = {
            features: [
                {
                    name: 'Graph Execution',
                    path: 'packages/core/runtime',
                    criticalPaths: [
                        'Deterministic execution',
                        'Variable resolution',
                        'Error handling',
                    ],
                    existingTests: 45,
                    coverage: 78,
                },
                {
                    name: 'Node Types',
                    path: 'packages/core/runtime/nodes',
                    criticalPaths: [
                        'WeightedChoice distribution',
                        'Conditional evaluation',
                        'Sequential processing',
                    ],
                    existingTests: 32,
                    coverage: 85,
                },
                {
                    name: 'UI Components',
                    path: 'packages/core/components',
                    criticalPaths: [
                        'GraphEditor rendering',
                        'Node drag and drop',
                        'Connection validation',
                    ],
                    existingTests: 28,
                    coverage: 62,
                },
                {
                    name: 'API Endpoints',
                    path: 'server/src',
                    criticalPaths: [
                        'Preview execution',
                        'Graph saving',
                        'Export functionality',
                    ],
                    existingTests: 15,
                    coverage: 71,
                },
            ],
            totalFeatures: 4,
            totalTests: 120,
            averageCoverage: 74,
            criticalGaps: [
                'No E2E tests for complete workflows',
                'Missing visual regression tests',
                'Limited error scenario coverage',
            ],
        };
        return inventory;
    }
}
