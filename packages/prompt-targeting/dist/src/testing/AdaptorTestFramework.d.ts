/**
 * Comprehensive testing framework for adaptors
 * Epic 10.2.1 - Testing Framework for Adaptors
 */
import { ModelAdaptor, PlatformCapabilities, ValidationResult, PlatformPrompt, AdaptorConfig } from '../types';
/**
 * Test case interface
 */
export interface AdaptorTestCase {
    name: string;
    description: string;
    graph: any;
    config?: AdaptorConfig;
    expectedValid?: boolean;
    expectedErrors?: string[];
    expectedWarnings?: string[];
    minCompatibilityScore?: number;
    shouldTranslate?: boolean;
    expectedPromptContains?: string[];
    expectedParameters?: Record<string, unknown>;
    timeout?: number;
}
/**
 * Test suite configuration
 */
export interface TestSuiteConfig {
    /** Name of the test suite */
    name: string;
    /** Adaptor to test */
    adaptor: ModelAdaptor;
    /** Test cases to run */
    testCases: AdaptorTestCase[];
    /** Global timeout in ms */
    timeout?: number;
    /** Skip initialization */
    skipInitialization?: boolean;
    /** Custom setup function */
    setup?: () => Promise<void>;
    /** Custom teardown function */
    teardown?: () => Promise<void>;
}
/**
 * Test result interface
 */
export interface TestResult {
    testCase: string;
    passed: boolean;
    duration: number;
    error?: Error;
    details: {
        validation?: ValidationResult;
        translation?: PlatformPrompt;
        capabilities?: PlatformCapabilities;
    };
    assertions: {
        name: string;
        passed: boolean;
        expected: unknown;
        actual: unknown;
        message?: string;
    }[];
}
/**
 * Test suite results
 */
export interface TestSuiteResult {
    suiteName: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    results: TestResult[];
    summary: {
        validationTests: number;
        translationTests: number;
        capabilityTests: number;
        performanceTests: number;
    };
}
/**
 * Comprehensive testing framework for adaptors
 */
export declare class AdaptorTestFramework {
    private logger;
    /**
     * Run a complete test suite for an adaptor
     */
    runTestSuite(config: TestSuiteConfig): Promise<TestSuiteResult>;
    /**
     * Run a single test case
     */
    runTestCase(adaptor: ModelAdaptor, testCase: AdaptorTestCase): Promise<TestResult>;
    /**
     * Create standard test cases for any adaptor
     */
    createStandardTestCases(): AdaptorTestCase[];
    /**
     * Create platform-specific test cases
     */
    createOpenAITestCases(): AdaptorTestCase[];
    /**
     * Create Midjourney-specific test cases
     */
    createMidjourneyTestCases(): AdaptorTestCase[];
    /**
     * Assert a condition and record the result
     */
    private assert;
    /**
     * Deep equality check
     */
    private deepEqual;
    /**
     * Print test suite summary
     */
    private printSummary;
    /**
     * Generate performance report
     */
    generatePerformanceReport(results: TestSuiteResult[]): {
        averageDuration: number;
        slowestTest: string;
        fastestTest: string;
        performanceScore: number;
    };
}
//# sourceMappingURL=AdaptorTestFramework.d.ts.map