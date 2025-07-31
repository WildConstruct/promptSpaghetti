/**
 * Extension Interface Test Utilities - Epic 8.4 Story 8.4.2
 * Testing utilities for extension interface validation and compliance
 */
import { BaseExtension } from './interfaces/ExtensionInterfaces';
export declare class ExtensionInterfaceTestSuite {
    private static instance;
    private testResults;
    private constructor();
    static getInstance(): ExtensionInterfaceTestSuite;
    /**
     * Run comprehensive interface tests for an extension
     */
    runInterfaceTests(extension: BaseExtension): Promise<TestSuiteResult>;
    /**
     * Run base interface compliance tests
     */
    private runBaseInterfaceTests;
    /**
     * Run lifecycle tests
     */
    private runLifecycleTests;
    /**
     * Run configuration tests
     */
    private runConfigurationTests;
    /**
     * Run health check tests
     */
    private runHealthCheckTests;
    /**
     * Run type-specific tests
     */
    private runTypeSpecificTests;
    /**
     * Run node extension tests
     */
    private runNodeExtensionTests;
    /**
     * Run UI extension tests
     */
    private runUIExtensionTests;
    /**
     * Run transform extension tests
     */
    private runTransformExtensionTests;
    /**
     * Run storage extension tests
     */
    private runStorageExtensionTests;
    /**
     * Run performance tests
     */
    private runPerformanceTests;
    /**
     * Run security tests
     */
    private runSecurityTests;
    /**
     * Helper method to run synchronous tests
     */
    private runTest;
    /**
     * Helper method to run asynchronous tests
     */
    private runAsyncTest;
    /**
     * Get cached test results
     */
    getTestResults(extensionId: string): TestSuiteResult | undefined;
    /**
     * Clear test results cache
     */
    clearTestResults(): void;
    /**
     * Generate test report
     */
    generateTestReport(extensionId: string): string;
    private isAsyncFunction;

}
interface TestSuiteResult {
    extensionId: string;
    extensionName: string;
    version: string;
    timestamp: Date;
    overallPassed: boolean;
    tests: TestCategoryResult[];


}
interface TestCategoryResult {
    category: string;
    results: TestResult[];


}
interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;

export declare class ExtensionInterfaceMockFactory {
    /**
     * Create mock extension for testing
     */
    static createMockExtension(type?: 'node' | 'ui' | 'transform' | 'storage'): BaseExtension;
    /**
     * Create invalid extension for testing validation
     */
    static createInvalidExtension(missingFields?: string[]): any;

export declare const extensionInterfaceTestSuite: ExtensionInterfaceTestSuite;
}
export {};
//# sourceMappingURL=ExtensionInterfaceTestUtils.d.ts.map