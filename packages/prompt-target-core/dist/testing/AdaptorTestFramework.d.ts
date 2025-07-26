import { ModelAdaptor, PromptGraph, PluginContext } from '../types/index.js';
import { AdaptorLifecycle } from '../adaptors/AdaptorLifecycle.js';
/**
 * Comprehensive testing framework for adaptor compliance and performance
 */
export declare class AdaptorTestFramework {
    private logger;
    private metrics;
    private testResults;
    constructor(logger: unknown, metrics: unknown);
    /**
     * Run comprehensive test suite for an adaptor
     */
    testAdaptor(
      adaptor: ModelAdaptor & AdaptorLifecycle,
      context: PluginContext,
      options?: AdaptorTestOptions
    ): Promise<AdaptorTestResults>;
    /**
     * Test adaptor compliance with interfaces and specifications
     */
    private testCompliance;
    /**
     * Test interface compliance
     */
    private testInterfaceCompliance;
    /**
     * Test lifecycle compliance
     */
    private testLifecycleCompliance;
    /**
     * Test validation compliance
     */
    private testValidationCompliance;
    /**
     * Test transformation compliance
     */
    private testTransformationCompliance;
    /**
     * Test adaptor performance characteristics
     */
    private testPerformance;
    /**
     * Test validation performance
     */
    private testValidationPerformance;
    /**
     * Test transformation performance
     */
    private testTransformationPerformance;
    /**
     * Test memory usage patterns
     */
    private testMemoryUsage;
    /**
     * Test cache efficiency
     */
    private testCacheEfficiency;
    /**
     * Test functional capabilities
     */
    private testFunctionality;
    /**
     * Test basic functionality
     */
    private testBasicFunctionality;
    /**
     * Test error handling
     */
    private testErrorHandling;
    /**
     * Test edge cases
     */
    private testEdgeCases;
    /**
     * Test quality scoring accuracy
     */
    private testQualityScoring;
    /**
     * Calculate overall test results
     */
    private calculateOverallResults;
    /**
     * Generate test summary
     */
    private generateSummary;
    /**
     * Reset test results
     */
    private resetTestResults;
    private createTestGraph;
    private generateTestGraphs;
    private createSimpleTextGraph;
    private createMultiNodeGraph;
    private createComplexGraph;
    private createEmptyGraph;
    private createInvalidGraph;
    private createCyclicGraph;
    private createLargeGraph;
    private createDeepGraph;
    private createDisconnectedGraph;
    private createOptimalGraph;
    private createProblematicGraph;
}
/**
 * Test options for customizing test execution
 */
export interface AdaptorTestOptions {
    performanceIterations?: number;
    timeoutMs?: number;
    skipPerformanceTests?: boolean;
    skipFunctionalityTests?: boolean;
    customTestGraphs?: PromptGraph[];
}
/**
 * Comprehensive test results structure
 */
export interface AdaptorTestResults {
    compliance: {
        interfaceCompliance: boolean;
        lifecycleCompliance: boolean;
        validationCompliance: boolean;
        transformationCompliance: boolean;
        errors: TestError[];
    };
    performance: {
        validationTime: number;
        transformationTime: number;
        memoryUsage: number;
        cacheEfficiency: number;
        errors: TestError[];
    };
    functionality: {
        basicFunctionality: boolean;
        errorHandling: boolean;
        edgeCases: boolean;
        qualityScoring: boolean;
        errors: TestError[];
    };
    overall: {
        passed: boolean;
        score: number;
        summary: string;
    };
}
export interface TestError {
    test: string;
    error: string;
    timestamp: Date;
}
