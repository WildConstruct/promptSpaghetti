/**
 * Test suite exports for UI Kit
 */
export * from './setup/test-framework';
import './responsive/responsive-components.test';
import './touch/touch-interactions.test';
import './platform/platform-adaptations.test';
import './visual/visual-regression.test';
import './performance/performance-benchmarks.test';
/**
 * Test suite configuration
 */
export declare const testConfig: {
    visualRegression: {
        service: any;
        projectId: any;
        token: any;
        branch: any;
    };
    performance: {
        renderBudget: number;
        interactionBudget: number;
        bundleSizeBudget: number;
        memorySizeBudget: number;
    };
    coverage: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
    };
    platforms: {
        name: string;
        os: string;
        browser: string;
    }[];
    viewports: {
        name: string;
        width: number;
        height: number;
    }[];
};
/**
 * Run all test suites
 */
export declare function runAllTests(): Promise<void>;
/**
 * Generate test report
 */
export declare function generateTestReport(results: any): {
    summary: {
        total: any;
        passed: any;
        failed: any;
        pending: any;
        duration: any;
    };
    coverage: {
        statements: any;
        branches: any;
        functions: any;
        lines: any;
    };
    performance: {
        slowestTests: any;
    };
};
//# sourceMappingURL=index.d.ts.map