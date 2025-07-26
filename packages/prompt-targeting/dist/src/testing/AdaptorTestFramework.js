/**
 * Comprehensive testing framework for adaptors
 * Epic 10.2.1 - Testing Framework for Adaptors
 */
/**
 * Comprehensive testing framework for adaptors
 */
export class AdaptorTestFramework {
    logger = console;
    /**
     * Run a complete test suite for an adaptor
     */
    async runTestSuite(config) {
        const startTime = Date.now();
        const results = [];
        this.logger.log(`\n🧪 Running test suite: ${config.name}`);
        this.logger.log(`   Adaptor: ${config.adaptor.name} v${config.adaptor.version}`);
        this.logger.log(`   Test cases: ${config.testCases.length}`);
        try {
            // Setup
            if (config.setup) {
                await config.setup();
            }
            // Initialize adaptor if needed
            if (!config.skipInitialization) {
                await config.adaptor.initialize?.();
            }
            // Run test cases
            for (let i = 0; i < config.testCases.length; i++) {
                const testCase = config.testCases[i];
                this.logger.log(`\n   [${i + 1}/${config.testCases.length}] ${testCase.name}`);
                const result = await this.runTestCase(config.adaptor, testCase);
                results.push(result);
                if (result.passed) {
                    this.logger.log(`     ✅ PASSED (${result.duration}ms)`);
                }
                else {
                    this.logger.log(`     ❌ FAILED (${result.duration}ms): ${result.error?.message}`);
                }
            }
            // Teardown
            if (config.teardown) {
                await config.teardown();
            }
            // Cleanup adaptor
            if (!config.skipInitialization) {
                await config.adaptor.cleanup?.();
            }
        }
        catch (error) {
            this.logger.error('Test suite setup/teardown failed:', error);
        }
        // Calculate summary
        const passedTests = results.filter(r => r.passed).length;
        const failedTests = results.length - passedTests;
        const duration = Date.now() - startTime;
        const summary = {
            validationTests: results.filter(r => r.details.validation).length,
            translationTests: results.filter(r => r.details.translation).length,
            capabilityTests: results.filter(r => r.details.capabilities).length,
            performanceTests: results.filter(r => r.duration > 1000).length
        };
        const suiteResult = {
            suiteName: config.name,
            totalTests: results.length,
            passedTests,
            failedTests,
            duration,
            results,
            summary
        };
        this.printSummary(suiteResult);
        return suiteResult;
    }
    /**
     * Run a single test case
     */
    async runTestCase(adaptor, testCase) {
        const startTime = Date.now();
        const assertions = [];
        let error;
        const details = {};
        try {
            // Test validation if expected
            if (testCase.expectedValid !== undefined || testCase.expectedErrors || testCase.expectedWarnings) {
                const validation = await adaptor.validate(testCase.graph, testCase.config);
                details.validation = validation;
                // Assert validation result
                if (testCase.expectedValid !== undefined) {
                    this.assert(assertions, 'validation.valid', validation.valid, testCase.expectedValid, `Expected validation to be ${testCase.expectedValid}`);
                }
                // Assert expected errors
                if (testCase.expectedErrors) {
                    for (const expectedError of testCase.expectedErrors) {
                        const hasError = validation.errors.some(e => e.code === expectedError);
                        this.assert(assertions, `validation.errors.${expectedError}`, hasError, true, `Expected error code '${expectedError}'`);
                    }
                }
                // Assert expected warnings
                if (testCase.expectedWarnings) {
                    for (const expectedWarning of testCase.expectedWarnings) {
                        const hasWarning = validation.warnings.some(w => w.code === expectedWarning);
                        this.assert(assertions, `validation.warnings.${expectedWarning}`, hasWarning, true, `Expected warning code '${expectedWarning}'`);
                    }
                }
                // Assert minimum compatibility score
                if (testCase.minCompatibilityScore !== undefined) {
                    this.assert(assertions, 'validation.compatibilityScore', validation.compatibilityScore >= testCase.minCompatibilityScore, true, `Expected compatibility score >= ${testCase.minCompatibilityScore}, got ${validation.compatibilityScore}`);
                }
            }
            // Test translation if expected
            if (testCase.shouldTranslate || testCase.expectedPromptContains || testCase.expectedParameters) {
                const translation = await adaptor.transform(testCase.graph, testCase.config);
                details.translation = translation;
                // Assert prompt contains expected strings
                if (testCase.expectedPromptContains) {
                    for (const expectedString of testCase.expectedPromptContains) {
                        const contains = translation.prompt.includes(expectedString);
                        this.assert(assertions, `translation.prompt.contains.${expectedString}`, contains, true, `Expected prompt to contain '${expectedString}'`);
                    }
                }
                // Assert expected parameters
                if (testCase.expectedParameters) {
                    for (const [key, expectedValue] of Object.entries(testCase.expectedParameters)) {
                        const actualValue = translation.parameters[key];
                        this.assert(assertions, `translation.parameters.${key}`, actualValue, expectedValue, `Expected parameter '${key}' to be ${expectedValue}, got ${actualValue}`);
                    }
                }
                // Assert basic translation properties
                this.assert(assertions, 'translation.platform', translation.platform, adaptor.platforms[0], `Expected platform to be ${adaptor.platforms[0]}`);
                this.assert(assertions, 'translation.metadata.sourceHash', !!translation.metadata.sourceHash, true, 'Expected translation to have source hash');
            }
            // Test capabilities
            const capabilities = await adaptor.capabilities();
            details.capabilities = capabilities;
            // Assert basic capabilities
            this.assert(assertions, 'capabilities.platform', !!capabilities.platform, true, 'Expected capabilities to have platform');
            this.assert(assertions, 'capabilities.features', Array.isArray(capabilities.features) && capabilities.features.length > 0, true, 'Expected capabilities to have features array');
        }
        catch (err) {
            error = err;
        }
        const duration = Date.now() - startTime;
        const passed = !error && assertions.every(a => a.passed);
        return {
            testCase: testCase.name,
            passed,
            duration,
            error,
            details,
            assertions
        };
    }
    /**
     * Create standard test cases for any adaptor
     */
    createStandardTestCases() {
        return [
            {
                name: 'Empty Graph Validation',
                description: 'Test validation of empty graph',
                graph: { nodes: [], edges: [] },
                expectedValid: true,
                expectedWarnings: ['EMPTY_GRAPH']
            },
            {
                name: 'Simple Text Content',
                description: 'Test basic text content translation',
                graph: {
                    nodes: [
                        { id: '1', type: 'output', data: { text: 'Hello, world!' } }
                    ],
                    edges: []
                },
                expectedValid: true,
                shouldTranslate: true,
                expectedPromptContains: ['Hello, world!'],
                minCompatibilityScore: 0.8
            },
            {
                name: 'Complex Graph Structure',
                description: 'Test complex graph with multiple nodes',
                graph: {
                    nodes: [
                        { id: '1', type: 'subject', data: { text: 'A robot' } },
                        { id: '2', type: 'action', data: { text: 'walking in a garden' } },
                        { id: '3', type: 'style', data: { text: 'futuristic' } }
                    ],
                    edges: [
                        { id: 'e1', source: '1', target: '2' },
                        { id: 'e2', source: '2', target: '3' }
                    ]
                },
                expectedValid: true,
                shouldTranslate: true,
                expectedPromptContains: ['robot', 'walking', 'garden'],
                minCompatibilityScore: 0.7
            },
            {
                name: 'High Quality Configuration',
                description: 'Test high quality preference',
                graph: {
                    nodes: [
                        { id: '1', type: 'output', data: { text: 'Write a detailed analysis' } }
                    ],
                    edges: []
                },
                config: {
                    qualityPreference: 0.9,
                    enableOptimizations: true
                },
                expectedValid: true,
                shouldTranslate: true,
                minCompatibilityScore: 0.8
            },
            {
                name: 'Long Content Warning',
                description: 'Test very long content generates warnings',
                graph: {
                    nodes: [
                        {
                            id: '1',
                            type: 'output',
                            data: {
                                text: 'Lorem ipsum '.repeat(1000) // Very long text
                            }
                        }
                    ],
                    edges: []
                },
                expectedValid: true,
                expectedWarnings: ['CONTENT_TOO_LONG', 'CONTENT_NEAR_LIMIT']
            },
            {
                name: 'Invalid Graph Structure',
                description: 'Test invalid graph structure',
                graph: null,
                expectedValid: false,
                expectedErrors: ['MISSING_GRAPH']
            },
            {
                name: 'Performance Test',
                description: 'Test performance with medium complexity',
                graph: {
                    nodes: Array.from({ length: 50 }, (_, i) => ({
                        id: `node-${i}`,
                        type: 'text',
                        data: { text: `Content ${i}` }
                    })),
                    edges: Array.from({ length: 40 }, (_, i) => ({
                        id: `edge-${i}`,
                        source: `node-${i}`,
                        target: `node-${i + 1}`
                    }))
                },
                expectedValid: true,
                shouldTranslate: true,
                timeout: 5000
            }
        ];
    }
    /**
     * Create platform-specific test cases
     */
    createOpenAITestCases() {
        return [
            ...this.createStandardTestCases(),
            {
                name: 'System Message Handling',
                description: 'Test OpenAI system message support',
                graph: {
                    nodes: [
                        { id: '1', type: 'system', data: { text: 'You are a helpful assistant' } },
                        { id: '2', type: 'user', data: { text: 'Hello!' } }
                    ],
                    edges: [{ id: 'e1', source: '1', target: '2' }]
                },
                expectedValid: true,
                shouldTranslate: true,
                expectedParameters: {
                    system: 'You are a helpful assistant'
                }
            },
            {
                name: 'Function Calling',
                description: 'Test function calling capabilities',
                graph: {
                    nodes: [
                        {
                            id: '1',
                            type: 'function',
                            data: {
                                name: 'get_weather',
                                description: 'Get current weather',
                                parameters: { location: { type: 'string' } }
                            }
                        }
                    ],
                    edges: []
                },
                expectedValid: true,
                shouldTranslate: true
            },
            {
                name: 'JSON Output Request',
                description: 'Test JSON output format',
                graph: {
                    nodes: [
                        {
                            id: '1',
                            type: 'output',
                            data: {
                                text: 'Return the result in JSON format',
                                outputFormat: 'json'
                            }
                        }
                    ],
                    edges: []
                },
                expectedValid: true,
                shouldTranslate: true
            }
        ];
    }
    /**
     * Create Midjourney-specific test cases
     */
    createMidjourneyTestCases() {
        return [
            ...this.createStandardTestCases(),
            {
                name: 'Style Parameter Mapping',
                description: 'Test style keyword mapping',
                graph: {
                    nodes: [
                        { id: '1', type: 'subject', data: { text: 'A dragon' } },
                        { id: '2', type: 'style', data: { style: 'fantasy' } }
                    ],
                    edges: [{ id: 'e1', source: '1', target: '2' }]
                },
                expectedValid: true,
                shouldTranslate: true,
                expectedPromptContains: ['/imagine prompt:', 'dragon', 'fantasy', 'magical']
            },
            {
                name: 'Aspect Ratio Handling',
                description: 'Test aspect ratio parameter',
                graph: {
                    nodes: [
                        { id: '1', type: 'subject', data: { text: 'A landscape' } },
                        { id: '2', type: 'aspectRatio', data: { aspectRatio: 'landscape' } }
                    ],
                    edges: [{ id: 'e1', source: '1', target: '2' }]
                },
                expectedValid: true,
                shouldTranslate: true,
                expectedPromptContains: ['--ar 16:9'],
                expectedParameters: {
                    aspect: '16:9'
                }
            },
            {
                name: 'Quality Configuration',
                description: 'Test quality parameter mapping',
                graph: {
                    nodes: [
                        { id: '1', type: 'subject', data: { text: 'A portrait' } }
                    ],
                    edges: []
                },
                config: {
                    qualityPreference: 0.9,
                    stylePreference: 'photorealistic'
                },
                expectedValid: true,
                shouldTranslate: true
            },
            {
                name: 'Text-Only Content Warning',
                description: 'Test warning for text-focused content',
                graph: {
                    nodes: [
                        {
                            id: '1',
                            type: 'output',
                            data: {
                                text: 'Write a detailed article about economic policy and financial markets'
                            }
                        }
                    ],
                    edges: []
                },
                expectedValid: true,
                expectedWarnings: ['TEXT_ONLY_CONTENT']
            }
        ];
    }
    /**
     * Assert a condition and record the result
     */
    assert(assertions, name, actual, expected, message) {
        const passed = this.deepEqual(actual, expected);
        assertions.push({
            name,
            passed,
            actual,
            expected,
            message
        });
    }
    /**
     * Deep equality check
     */
    deepEqual(a, b) {
        if (a === b)
            return true;
        if (a == null || b == null)
            return a === b;
        if (typeof a !== typeof b)
            return false;
        if (typeof a === 'object') {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length)
                return false;
            for (const key of aKeys) {
                if (!bKeys.includes(key))
                    return false;
                if (!this.deepEqual(a[key], b[key]))
                    return false;
            }
            return true;
        }
        return false;
    }
    /**
     * Print test suite summary
     */
    printSummary(result) {
        this.logger.log(`\n📊 Test Suite Results: ${result.suiteName}`);
        this.logger.log(`   Total Tests: ${result.totalTests}`);
        this.logger.log(`   ✅ Passed: ${result.passedTests}`);
        this.logger.log(`   ❌ Failed: ${result.failedTests}`);
        this.logger.log(`   ⏱️  Duration: ${result.duration}ms`);
        this.logger.log(`   📈 Success Rate: ${((result.passedTests / result.totalTests) * 100).toFixed(1)}%`);
        this.logger.log('\n📋 Test Breakdown:');
        this.logger.log(`   Validation Tests: ${result.summary.validationTests}`);
        this.logger.log(`   Translation Tests: ${result.summary.translationTests}`);
        this.logger.log(`   Capability Tests: ${result.summary.capabilityTests}`);
        this.logger.log(`   Performance Tests: ${result.summary.performanceTests}`);
        if (result.failedTests > 0) {
            this.logger.log('\n❌ Failed Tests:');
            result.results
                .filter(r => !r.passed)
                .forEach(r => {
                this.logger.log(`   • ${r.testCase}: ${r.error?.message || 'Assertion failed'}`);
                // Show failed assertions
                const failedAssertions = r.assertions.filter(a => !a.passed);
                if (failedAssertions.length > 0) {
                    failedAssertions.forEach(a => {
                        this.logger.log(`     - ${a.name}: expected ${a.expected}, got ${a.actual}`);
                    });
                }
            });
        }
    }
    /**
     * Generate performance report
     */
    generatePerformanceReport(results) {
        const allResults = results.flatMap(suite => suite.results);
        const durations = allResults.map(r => r.duration);
        const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const slowestResult = allResults.reduce((slowest, current) => current.duration > slowest.duration ? current : slowest);
        const fastestResult = allResults.reduce((fastest, current) => current.duration < fastest.duration ? current : fastest);
        // Performance score: higher is better, based on speed and consistency
        const maxDuration = Math.max(...durations);
        const performanceScore = Math.max(0, 100 - (averageDuration / 10) - (maxDuration / 100));
        return {
            averageDuration,
            slowestTest: slowestResult.testCase,
            fastestTest: fastestResult.testCase,
            performanceScore
        };
    }
}
//# sourceMappingURL=AdaptorTestFramework.js.map