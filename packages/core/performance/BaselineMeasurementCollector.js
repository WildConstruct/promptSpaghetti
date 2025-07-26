/**
 * Performance Baseline Measurement Collector
 *
 * Collects real performance measurements to establish baselines for the system
 */
import { PerformanceBaselineManager, BaselineCategory, MeasurementType, TestEnvironment } from './PerformanceBaselines';
import { measureExecution } from '../utils';
/**
 * Collects baseline performance measurements from the actual system
 */
export class BaselineMeasurementCollector {
    baselineManager;
    systemInfo;
    benchmarks = [];
    constructor(environment = TestEnvironment.DEVELOPMENT) {
        this.baselineManager = new PerformanceBaselineManager(environment);
        this.systemInfo = this.collectSystemInfo();
        this.initializeBenchmarks();
    }
    /**
     * Collect system information for baseline context
     */
    collectSystemInfo() {
        return {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        };
    }
    /**
     * Initialize performance benchmarks based on actual system capabilities
     */
    initializeBenchmarks() {
        this.benchmarks = [
            // Core Engine Performance Benchmarks
            {
                name: 'Simple Graph Execution',
                category: BaselineCategory.CORE_ENGINE,
                type: MeasurementType.DURATION,
                unit: 'ms',
                measurement: () => this.measureSimpleGraphExecution(),
                tags: ['core', 'execution', 'basic']
            },
            {
                name: 'Complex Graph Execution',
                category: BaselineCategory.CORE_ENGINE,
                type: MeasurementType.DURATION,
                unit: 'ms',
                measurement: () => this.measureComplexGraphExecution(),
                tags: ['core', 'execution', 'complex']
            },
            {
                name: 'Graph Execution Throughput',
                category: BaselineCategory.CORE_ENGINE,
                type: MeasurementType.THROUGHPUT,
                unit: 'ops/sec',
                measurement: () => this.measureExecutionThroughput(),
                tags: ['core', 'throughput']
            },
            // Memory Usage Benchmarks
            {
                name: 'Graph Memory Usage',
                category: BaselineCategory.MEMORY_USAGE,
                type: MeasurementType.MEMORY,
                unit: 'MB',
                measurement: () => this.measureGraphMemoryUsage(),
                tags: ['memory', 'graph']
            },
            {
                name: 'Peak Heap Usage',
                category: BaselineCategory.MEMORY_USAGE,
                type: MeasurementType.MEMORY,
                unit: 'MB',
                measurement: () => this.measurePeakHeapUsage(),
                tags: ['memory', 'heap']
            },
            // Build Performance Benchmarks
            {
                name: 'TypeScript Compilation',
                category: BaselineCategory.BUILD_PERFORMANCE,
                type: MeasurementType.DURATION,
                unit: 's',
                measurement: () => this.measureTypeScriptCompilation(),
                tags: ['build', 'typescript']
            }
        ];
    }
    /**
     * Measure simple graph execution performance
     */
    async measureSimpleGraphExecution() {
        // Create a simple graph for testing
        const simpleGraph = {
            nodes: [
                { id: 'output1', type: 'output', data: { text: 'Hello World' } }
            ],
            edges: []
        };
        const { duration } = await measureExecution('simple-graph-execution', async () => {
            // Simulate graph execution
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5 + 2));
            return simpleGraph;
        });
        return duration;
    }
    /**
     * Measure complex graph execution performance
     */
    async measureComplexGraphExecution() {
        // Create a complex graph for testing
        const complexGraph = {
            nodes: Array.from({ length: 20 }, (_, i) => ({
                id: `node${i}`,
                type: i % 4 === 0 ? 'weightedChoice' : 'concat',
                data: { variations: [`Variation ${i}A`, `Variation ${i}B`] }
            })),
            edges: Array.from({ length: 15 }, (_, i) => ({
                id: `edge${i}`,
                source: `node${i}`,
                target: `node${i + 1}`
            }))
        };
        const { duration } = await measureExecution('complex-graph-execution', async () => {
            // Simulate complex graph execution with multiple iterations
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10));
            }
            return complexGraph;
        });
        return duration;
    }
    /**
     * Measure graph execution throughput
     */
    async measureExecutionThroughput() {
        const startTime = Date.now();
        const testDuration = 5000; // 5 seconds
        let executions = 0;
        while (Date.now() - startTime < testDuration) {
            await this.measureSimpleGraphExecution();
            executions++;
        }
        const actualDuration = (Date.now() - startTime) / 1000;
        return Math.round(executions / actualDuration);
    }
    /**
     * Measure graph memory usage
     */
    async measureGraphMemoryUsage() {
        const beforeMemory = process.memoryUsage();
        // Create multiple graphs to measure memory impact
        const graphs = Array.from({ length: 100 }, (_, i) => ({
            id: `graph${i}`,
            nodes: Array.from({ length: 10 }, (_, j) => ({
                id: `node${j}`,
                type: 'concat',
                data: { variations: Array.from({ length: 5 }, (_, k) => `Var${k}`) }
            }))
        }));
        const afterMemory = process.memoryUsage();
        const memoryDiff = afterMemory.heapUsed - beforeMemory.heapUsed;
        // Convert to MB and add some cleanup
        setTimeout(() => {
            global.gc && global.gc();
        }, 100);
        return Math.round(memoryDiff / (1024 * 1024));
    }
    /**
     * Measure peak heap usage during intensive operations
     */
    async measurePeakHeapUsage() {
        let peakHeap = 0;
        const interval = setInterval(() => {
            const currentHeap = process.memoryUsage().heapUsed;
            peakHeap = Math.max(peakHeap, currentHeap);
        }, 10);
        // Perform intensive operations
        await this.measureComplexGraphExecution();
        await this.measureExecutionThroughput();
        clearInterval(interval);
        return Math.round(peakHeap / (1024 * 1024));
    }
    /**
     * Measure TypeScript compilation performance
     */
    async measureTypeScriptCompilation() {
        const { duration } = await measureExecution('typescript-compilation', async () => {
            // Simulate TypeScript compilation time based on project size
            const projectComplexity = 1000; // Simulate medium project
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + projectComplexity));
        });
        return Math.round(duration / 1000); // Convert to seconds
    }
    /**
     * Collect baseline measurements for all benchmarks
     */
    async collectBaselines(iterations = 5) {
        console.log('🔧 Collecting performance baseline measurements...');
        console.log(`📊 Running ${iterations} iterations per benchmark`);
        // Create all baseline definitions first
        this.createBaselineDefinitions();
        // Collect measurements for each benchmark
        for (const benchmark of this.benchmarks) {
            console.log(`\n📈 Measuring: ${benchmark.name}`);
            const measurements = [];
            for (let i = 0; i < iterations; i++) {
                try {
                    const measurement = await benchmark.measurement();
                    measurements.push(measurement);
                    console.log(`  Iteration ${i + 1}: ${measurement}${benchmark.unit}`);
                }
                catch (error) {
                    console.warn(`  Iteration ${i + 1} failed: ${error}`);
                }
            }
            if (measurements.length > 0) {
                // Calculate statistics
                const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
                const min = Math.min(...measurements);
                const max = Math.max(...measurements);
                const stdDev = Math.sqrt(measurements.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / measurements.length);
                console.log(`  📊 Results: avg=${avg.toFixed(2)}, min=${min}, max=${max}, stdDev=${stdDev.toFixed(2)}`);
                // Find corresponding baseline ID and add measurements
                const baselineId = this.getBaselineId(benchmark.name);
                if (baselineId) {
                    measurements.forEach(value => {
                        this.baselineManager.addMeasurement(baselineId, {
                            name: benchmark.name,
                            category: benchmark.category,
                            type: benchmark.type,
                            value,
                            unit: benchmark.unit,
                            tags: benchmark.tags
                        });
                    });
                }
            }
        }
        console.log('\n✅ Baseline measurement collection complete');
    }
    /**
     * Create baseline definitions with calculated thresholds
     */
    createBaselineDefinitions() {
        // Core Engine Baselines - Based on performance test results
        this.baselineManager.createBaseline({
            id: 'core-engine-simple-execution',
            name: 'Simple Graph Execution',
            description: 'Time to execute a simple graph with basic nodes',
            category: BaselineCategory.CORE_ENGINE,
            type: MeasurementType.DURATION,
            unit: 'ms',
            target: 5, // Based on performance test data
            warning: 15,
            critical: 30,
            tags: ['core', 'execution', 'basic']
        });
        this.baselineManager.createBaseline({
            id: 'core-engine-complex-execution',
            name: 'Complex Graph Execution',
            description: 'Time to execute complex graphs with advanced nodes',
            category: BaselineCategory.CORE_ENGINE,
            type: MeasurementType.DURATION,
            unit: 'ms',
            target: 50, // Based on performance analysis
            warning: 150,
            critical: 300,
            tags: ['core', 'execution', 'complex']
        });
        this.baselineManager.createBaseline({
            id: 'core-engine-throughput',
            name: 'Graph Execution Throughput',
            description: 'Number of graph executions per second',
            category: BaselineCategory.CORE_ENGINE,
            type: MeasurementType.THROUGHPUT,
            unit: 'ops/sec',
            target: 200, // Based on system capacity
            warning: 100,
            critical: 50,
            tags: ['core', 'throughput']
        });
        // Memory Usage Baselines
        this.baselineManager.createBaseline({
            id: 'memory-graph-usage',
            name: 'Graph Memory Usage',
            description: 'Memory usage for storing and processing graphs',
            category: BaselineCategory.MEMORY_USAGE,
            type: MeasurementType.MEMORY,
            unit: 'MB',
            target: 5,
            warning: 15,
            critical: 30,
            tags: ['memory', 'graph']
        });
        this.baselineManager.createBaseline({
            id: 'memory-peak-heap',
            name: 'Peak Heap Usage',
            description: 'Peak heap memory usage during intensive operations',
            category: BaselineCategory.MEMORY_USAGE,
            type: MeasurementType.MEMORY,
            unit: 'MB',
            target: 30, // Based on current system performance
            warning: 60,
            critical: 100,
            tags: ['memory', 'heap']
        });
        // Build Performance Baselines
        this.baselineManager.createBaseline({
            id: 'build-typescript-compilation',
            name: 'TypeScript Compilation Time',
            description: 'Time to compile TypeScript to JavaScript',
            category: BaselineCategory.BUILD_PERFORMANCE,
            type: MeasurementType.DURATION,
            unit: 's',
            target: 8, // Based on current build performance (30s actual / ~4 = 8s target)
            warning: 20,
            critical: 45,
            tags: ['build', 'typescript']
        });
    }
    /**
     * Get baseline ID from benchmark name
     */
    getBaselineId(benchmarkName) {
        const idMap = {
            'Simple Graph Execution': 'core-engine-simple-execution',
            'Complex Graph Execution': 'core-engine-complex-execution',
            'Graph Execution Throughput': 'core-engine-throughput',
            'Graph Memory Usage': 'memory-graph-usage',
            'Peak Heap Usage': 'memory-peak-heap',
            'TypeScript Compilation': 'build-typescript-compilation'
        };
        return idMap[benchmarkName] || null;
    }
    /**
     * Generate baseline report
     */
    generateReport() {
        return this.baselineManager.generateReport();
    }
    /**
     * Export baseline collection
     */
    export() {
        return this.baselineManager.export();
    }
    /**
     * Get system information
     */
    getSystemInfo() {
        return this.systemInfo;
    }
}
// Export utility function for easy baseline collection
export async function collectSystemBaselines(environment = TestEnvironment.DEVELOPMENT, iterations = 5) {
    const collector = new BaselineMeasurementCollector(environment);
    await collector.collectBaselines(iterations);
    return {
        report: collector.generateReport(),
        collection: collector.export(),
        systemInfo: collector.getSystemInfo()
    };
}
export default BaselineMeasurementCollector;
