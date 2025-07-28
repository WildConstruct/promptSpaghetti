/**
 * Performance Baseline Measurement Collector
 *
 * Collects real performance measurements to establish baselines for the system
 */
import { TestEnvironment } from './PerformanceBaselines';
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
    type: i;
}
//# sourceMappingURL=BaselineMeasurementCollector.d.ts.map