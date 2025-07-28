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
    duration: 0;
}
//# sourceMappingURL=ExtensionInterfaceTestUtils.d.ts.map