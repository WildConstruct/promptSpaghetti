/**
 * Performance Baseline Measurement Collector
 *
 * Collects real performance measurements to establish baselines for the system
 */
import { TestEnvironment } from './PerformanceBaselines';
interface SystemInfo {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
}
/**
 * Collects baseline performance measurements from the actual system
 */
export declare class BaselineMeasurementCollector {
    private baselineManager;
    private systemInfo;
    private benchmarks;
    constructor(environment?: TestEnvironment);
    /**
     * Collect system information for baseline context
     */
    private collectSystemInfo;
    /**
     * Initialize performance benchmarks based on actual system capabilities
     */
    private initializeBenchmarks;
    /**
     * Measure simple graph execution performance
     */
    private measureSimpleGraphExecution;
    /**
     * Measure complex graph execution performance
     */
    private measureComplexGraphExecution;
    /**
     * Measure graph execution throughput
     */
    private measureExecutionThroughput;
    /**
     * Measure graph memory usage
     */
    private measureGraphMemoryUsage;
    /**
     * Measure peak heap usage during intensive operations
     */
    private measurePeakHeapUsage;
    /**
     * Measure TypeScript compilation performance
     */
    private measureTypeScriptCompilation;
    /**
     * Collect baseline measurements for all benchmarks
     */
    collectBaselines(iterations?: number): Promise<void>;
    /**
     * Create baseline definitions with calculated thresholds
     */
    private createBaselineDefinitions;
    /**
     * Get baseline ID from benchmark name
     */
    private getBaselineId;
    /**
     * Generate baseline report
     */
    generateReport(): any;
    /**
     * Export baseline collection
     */
    export(): any;
    /**
     * Get system information
     */
    getSystemInfo(): SystemInfo;
}
export declare function collectSystemBaselines(environment?: TestEnvironment, iterations?: number): Promise<{
    report: any;
    collection: any;
    systemInfo: SystemInfo;
}>;
export default BaselineMeasurementCollector;
//# sourceMappingURL=BaselineMeasurementCollector.d.ts.map