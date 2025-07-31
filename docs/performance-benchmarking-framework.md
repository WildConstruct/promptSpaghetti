# Performance Benchmarking Framework

**Task**: E18-1753114562053-6ACECA - Analyze node performance  
**Epic**: 18 - Technical Debt & Refactoring  
**Author**: Claude Code  
**Date**: 2025-07-22

## Executive Summary

This document defines a comprehensive performance benchmarking framework for the node execution system. The framework integrates with existing performance infrastructure while adding advanced benchmarking, regression detection, and optimization tracking capabilities.

## Current Performance Infrastructure Integration

### Existing Components ✅

- **Performance Utilities** (`packages/core/utils/performance.ts`)
- **Performance Baseline System** (`packages/core/performance/PerformanceBaseline.ts`)
- **Core Engine Performance Tests** (`tests/performance/core-engine-performance.test.ts`)
- **Analytics Integration** (`server/src/engine.ts`)

### Enhanced Framework Components 🆕

- **Automated Benchmark Suite**
- **Performance Regression Detection**
- **Optimization Impact Measurement**
- **Continuous Performance Monitoring**

## Benchmarking Framework Architecture

### 1. Core Benchmark Runner

```typescript
interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  benchmarks: Benchmark[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

interface Benchmark {
  id: string;
  name: string;
  category: BenchmarkCategory;
  iterations: number;
  warmupIterations: number;
  execute: (context: BenchmarkContext) => Promise<BenchmarkResult>;
  validate?: (result: any) => boolean;
}

enum BenchmarkCategory {
  NODE_EXECUTION = 'node-execution',
  GRAPH_PROCESSING = 'graph-processing',
  MEMORY_USAGE = 'memory-usage',
  SCHEMA_VALIDATION = 'schema-validation',
  CONTEXT_MANAGEMENT = 'context-management',
  CACHING_PERFORMANCE = 'caching-performance',
}

interface BenchmarkResult {
  benchmark: string;
  category: BenchmarkCategory;
  iterations: number;
  metrics: {
    executionTime: PerformanceMetrics;
    memoryUsage: MemoryMetrics;
    throughput: ThroughputMetrics;
    custom?: Record<string, number>;
  };
  environment: BenchmarkEnvironment;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceBenchmarkRunner {
  private suites = new Map<string, BenchmarkSuite>();
  private results: BenchmarkResult[] = [];
  private regressionDetector: RegressionDetector;

  async runBenchmarkSuite(suiteId: string): Promise<BenchmarkSuiteResult> {
    const suite = this.suites.get(suiteId);
    if (!suite) throw new Error(`Suite ${suiteId} not found`);

    console.log(`🚀 Running benchmark suite: ${suite.name}`);

    // Setup
    if (suite.setup) await suite.setup();

    const results: BenchmarkResult[] = [];

    try {
      for (const benchmark of suite.benchmarks) {
        console.log(`  📊 Running ${benchmark.name}...`);

        const result = await this.runSingleBenchmark(benchmark);
        results.push(result);

        // Check for performance regression
        await this.checkRegression(result);

        console.log(`    ✅ ${benchmark.name}: ${result.metrics.executionTime.average.toFixed(3)}ms avg`);
      }
    } finally {
      // Teardown
      if (suite.teardown) await suite.teardown();
    }

    return {
      suite: suite.id,
      results,
      summary: this.generateSuiteSummary(results),
      timestamp: Date.now(),
    };
  }

  private async runSingleBenchmark(benchmark: Benchmark): Promise<BenchmarkResult> {
    const context = new BenchmarkContext();
    const metrics = {
      executionTimes: [],
      memorySnapshots: [],
      throughputMeasurements: [],
    };

    // Warmup
    for (let i = 0; i < benchmark.warmupIterations; i++) {
      await benchmark.execute(context);
    }

    // Actual benchmark
    for (let i = 0; i < benchmark.iterations; i++) {
      const startMemory = process.memoryUsage();
      const startTime = performance.now();

      const result = await benchmark.execute(context);

      const endTime = performance.now();
      const endMemory = process.memoryUsage();

      // Validate result if validator provided
      if (benchmark.validate && !benchmark.validate(result)) {
        throw new Error(`Benchmark ${benchmark.id} produced invalid result`);
      }

      metrics.executionTimes.push(endTime - startTime);
      metrics.memorySnapshots.push({
        heapBefore: startMemory.heapUsed,
        heapAfter: endMemory.heapUsed,
        delta: endMemory.heapUsed - startMemory.heapUsed,
      });
    }

    return {
      benchmark: benchmark.id,
      category: benchmark.category,
      iterations: benchmark.iterations,
      metrics: this.calculateMetrics(metrics),
      environment: context.getEnvironment(),
      timestamp: Date.now(),
      success: true,
    };
  }
}
```

### 2. Benchmark Categories and Test Suites

#### Node Execution Benchmarks

```typescript
const nodeExecutionSuite: BenchmarkSuite = {
  id: 'node-execution',
  name: 'Node Execution Performance',
  description: 'Benchmarks individual node execution performance',
  benchmarks: [
    {
      id: 'weighted-choice-basic',
      name: 'WeightedChoice Basic Execution',
      category: BenchmarkCategory.NODE_EXECUTION,
      iterations: 10000,
      warmupIterations: 1000,
      execute: async context => {
        const node = new WeightedChoiceNode('test', [
          { value: 'A', weight: 0.5 },
          { value: 'B', weight: 0.3 },
          { value: 'C', weight: 0.2 },
        ]);
        return node.run(context.getExecutionContext());
      },
      validate: result => ['A', 'B', 'C'].includes(result),
    },

    {
      id: 'weighted-advanced-complex',
      name: 'WeightedAdvanced Complex Distribution',
      category: BenchmarkCategory.NODE_EXECUTION,
      iterations: 5000,
      warmupIterations: 500,
      execute: async context => {
        const node = new WeightedAdvancedNode(
          'test',
          [
            { value: 'option1', weight: 1 },
            { value: 'option2', weight: 2 },
            { value: 'option3', weight: 3 },
            { value: 'option4', weight: 4 },
          ],
          {
            type: 'exponential',
            parameters: { base: 2, scale: 1.5 },
            normalize: true,
          }
        );
        return node.execute(context.getAdvancedExecutionContext());
      },
    },

    {
      id: 'conditional-expression',
      name: 'Conditional Expression Evaluation',
      category: BenchmarkCategory.NODE_EXECUTION,
      iterations: 5000,
      warmupIterations: 500,
      execute: async context => {
        const ctx = context.getAdvancedExecutionContext();
        ctx.setVariable('counter', Math.floor(Math.random() * 100));

        const node = new ConditionalNode(
          'test',
          [
            { condition: 'getValue("counter") > 50', output: 'high' },
            { condition: 'getValue("counter") > 25', output: 'medium' },
            { condition: 'getValue("counter") >= 0', output: 'low' },
          ],
          'default'
        );

        return node.execute(ctx);
      },
    },
  ],
};
```

#### Graph Processing Benchmarks

```typescript
const graphProcessingSuite: BenchmarkSuite = {
  id: 'graph-processing',
  name: 'Graph Processing Performance',
  description: 'Benchmarks end-to-end graph execution performance',
  benchmarks: [
    {
      id: 'small-graph-linear',
      name: 'Small Graph (10 nodes) - Linear',
      category: BenchmarkCategory.GRAPH_PROCESSING,
      iterations: 1000,
      warmupIterations: 100,
      execute: async context => {
        const graph = context.createLinearGraph(10);
        return executeGraph(graph);
      },
    },

    {
      id: 'medium-graph-mixed',
      name: 'Medium Graph (100 nodes) - Mixed Types',
      category: BenchmarkCategory.GRAPH_PROCESSING,
      iterations: 100,
      warmupIterations: 10,
      execute: async context => {
        const graph = context.createMixedGraph(100);
        return executeGraph(graph);
      },
    },

    {
      id: 'large-graph-parallel',
      name: 'Large Graph (1000 nodes) - Parallel Execution',
      category: BenchmarkCategory.GRAPH_PROCESSING,
      iterations: 10,
      warmupIterations: 2,
      execute: async context => {
        const graph = context.createParallelGraph(1000);
        return executeGraphParallel(graph);
      },
    },
  ],
};
```

#### Memory Usage Benchmarks

```typescript
const memoryUsageSuite: BenchmarkSuite = {
  id: 'memory-usage',
  name: 'Memory Usage Analysis',
  description: 'Benchmarks memory consumption and leak detection',
  benchmarks: [
    {
      id: 'context-pool-efficiency',
      name: 'Context Pool Memory Efficiency',
      category: BenchmarkCategory.MEMORY_USAGE,
      iterations: 1000,
      warmupIterations: 100,
      execute: async context => {
        const pool = new ExecutionContextPool();
        const contexts = [];

        // Allocate contexts
        for (let i = 0; i < 100; i++) {
          contexts.push(pool.getContext(false, i));
        }

        // Return contexts
        for (const ctx of contexts) {
          pool.returnContext(ctx);
        }

        return pool.getStatistics();
      },
    },

    {
      id: 'graph-memory-scaling',
      name: 'Graph Memory Scaling Analysis',
      category: BenchmarkCategory.MEMORY_USAGE,
      iterations: 50,
      warmupIterations: 5,
      execute: async context => {
        const sizes = [10, 50, 100, 500];
        const results = [];

        for (const size of sizes) {
          const beforeMemory = process.memoryUsage().heapUsed;
          const graph = context.createMixedGraph(size);
          await executeGraph(graph);
          const afterMemory = process.memoryUsage().heapUsed;

          results.push({
            size,
            memoryUsed: afterMemory - beforeMemory,
          });
        }

        return results;
      },
    },
  ],
};
```

### 3. Performance Regression Detection

```typescript
interface RegressionThreshold {
  metric: string;
  maxIncrease: number; // Percentage
  maxDecrease?: number; // For metrics where decrease is bad
  windowSize: number; // Number of historical results to compare
}

class RegressionDetector {
  private thresholds = new Map<string, RegressionThreshold>();
  private historicalResults = new Map<string, BenchmarkResult[]>();

  constructor() {
    // Define default regression thresholds
    this.setThreshold('execution-time', {
      metric: 'executionTime.average',
      maxIncrease: 15, // 15% increase triggers regression
      windowSize: 10,
    });

    this.setThreshold('memory-usage', {
      metric: 'memoryUsage.peak',
      maxIncrease: 20, // 20% memory increase triggers regression
      windowSize: 5,
    });

    this.setThreshold('throughput', {
      metric: 'throughput.operationsPerSecond',
      maxDecrease: 10, // 10% throughput decrease triggers regression
      windowSize: 5,
    });
  }

  async checkRegression(result: BenchmarkResult): Promise<RegressionAnalysis> {
    const benchmarkId = result.benchmark;
    const history = this.getHistory(benchmarkId);

    if (history.length < 3) {
      // Need at least 3 historical results for meaningful comparison
      return { hasRegression: false, reason: 'Insufficient historical data' };
    }

    const regressions: RegressionIssue[] = [];

    for (const [thresholdId, threshold] of this.thresholds) {
      const currentValue = this.extractMetricValue(result, threshold.metric);
      const historicalValues = history
        .slice(-threshold.windowSize)
        .map(r => this.extractMetricValue(r, threshold.metric));

      const baseline = this.calculateBaseline(historicalValues);
      const changePercent = ((currentValue - baseline) / baseline) * 100;

      if (threshold.maxIncrease && changePercent > threshold.maxIncrease) {
        regressions.push({
          metric: threshold.metric,
          type: 'increase',
          currentValue,
          baseline,
          changePercent,
          threshold: threshold.maxIncrease,
        });
      }

      if (threshold.maxDecrease && changePercent < -threshold.maxDecrease) {
        regressions.push({
          metric: threshold.metric,
          type: 'decrease',
          currentValue,
          baseline,
          changePercent,
          threshold: threshold.maxDecrease,
        });
      }
    }

    return {
      hasRegression: regressions.length > 0,
      regressions,
      confidence: this.calculateConfidence(history.length),
    };
  }

  private calculateBaseline(values: number[]): number {
    // Use median to reduce impact of outliers
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }
}
```

### 4. Continuous Performance Monitoring

```typescript
class PerformanceMonitor {
  private benchmarkRunner: PerformanceBenchmarkRunner;
  private regressionDetector: RegressionDetector;
  private alertManager: AlertManager;

  async startContinuousMonitoring(config: MonitoringConfig) {
    console.log('🔄 Starting continuous performance monitoring...');

    setInterval(async () => {
      try {
        await this.runScheduledBenchmarks();
      } catch (error) {
        console.error('Scheduled benchmark failed:', error);
      }
    }, config.intervalMs);
  }

  private async runScheduledBenchmarks() {
    const criticalSuites = ['node-execution', 'graph-processing'];

    for (const suiteId of criticalSuites) {
      const result = await this.benchmarkRunner.runBenchmarkSuite(suiteId);

      // Check for regressions
      for (const benchmarkResult of result.results) {
        const regression = await this.regressionDetector.checkRegression(benchmarkResult);

        if (regression.hasRegression) {
          await this.alertManager.sendRegressionAlert({
            benchmark: benchmarkResult.benchmark,
            regressions: regression.regressions,
            timestamp: Date.now(),
          });
        }
      }

      // Store results for historical analysis
      await this.storeResults(result);
    }
  }
}
```

### 5. Performance Optimization Tracking

```typescript
interface OptimizationExperiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  implementation: string;
  targetMetrics: string[];
  expectedImprovement: Record<string, number>; // Metric -> expected % improvement
}

class OptimizationTracker {
  private experiments = new Map<string, OptimizationExperiment>();
  private results = new Map<string, OptimizationResult[]>();

  async runOptimizationExperiment(
    experimentId: string,
    beforeCallback: () => Promise<void>,
    afterCallback: () => Promise<void>
  ): Promise<OptimizationResult> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);

    console.log(`🧪 Running optimization experiment: ${experiment.name}`);

    // Run baseline benchmarks
    await beforeCallback();
    const baselineSuite = await this.benchmarkRunner.runBenchmarkSuite('optimization-baseline');

    // Apply optimization
    await afterCallback();
    const optimizedSuite = await this.benchmarkRunner.runBenchmarkSuite('optimization-test');

    // Calculate improvements
    const improvements = this.calculateImprovements(baselineSuite, optimizedSuite);

    const result: OptimizationResult = {
      experiment: experimentId,
      baseline: baselineSuite,
      optimized: optimizedSuite,
      improvements,
      success: this.evaluateSuccess(experiment, improvements),
      timestamp: Date.now(),
    };

    this.storeOptimizationResult(experimentId, result);

    console.log(
      `📊 Experiment results: ${Object.entries(improvements)
        .map(([metric, improvement]) => `${metric}: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`)
        .join(', ')}`
    );

    return result;
  }

  private calculateImprovements(
    baseline: BenchmarkSuiteResult,
    optimized: BenchmarkSuiteResult
  ): Record<string, number> {
    const improvements: Record<string, number> = {};

    for (const baselineResult of baseline.results) {
      const optimizedResult = optimized.results.find(r => r.benchmark === baselineResult.benchmark);
      if (!optimizedResult) continue;

      // Calculate improvement for each metric
      const executionTimeImprovement =
        ((baselineResult.metrics.executionTime.average - optimizedResult.metrics.executionTime.average) /
          baselineResult.metrics.executionTime.average) *
        100;

      const memoryImprovement =
        ((baselineResult.metrics.memoryUsage.peak - optimizedResult.metrics.memoryUsage.peak) /
          baselineResult.metrics.memoryUsage.peak) *
        100;

      improvements[`${baselineResult.benchmark}.executionTime`] = executionTimeImprovement;
      improvements[`${baselineResult.benchmark}.memoryUsage`] = memoryImprovement;
    }

    return improvements;
  }
}
```

## Benchmarking Framework Implementation

### 1. Framework Integration Script

```typescript
// benchmark-framework.ts
export class PerformanceBenchmarkFramework {
  private runner: PerformanceBenchmarkRunner;
  private monitor: PerformanceMonitor;
  private optimizer: OptimizationTracker;
  private reporter: PerformanceReporter;

  constructor() {
    this.runner = new PerformanceBenchmarkRunner();
    this.monitor = new PerformanceMonitor(this.runner);
    this.optimizer = new OptimizationTracker(this.runner);
    this.reporter = new PerformanceReporter();

    this.setupBenchmarkSuites();
  }

  private setupBenchmarkSuites() {
    // Register all benchmark suites
    this.runner.registerSuite(nodeExecutionSuite);
    this.runner.registerSuite(graphProcessingSuite);
    this.runner.registerSuite(memoryUsageSuite);
    this.runner.registerSuite(schemaValidationSuite);
  }

  async runFullBenchmarkSuite(): Promise<FrameworkReport> {
    console.log('🚀 Running comprehensive performance benchmark suite...');

    const suiteResults = [];
    const suiteIds = ['node-execution', 'graph-processing', 'memory-usage', 'schema-validation'];

    for (const suiteId of suiteIds) {
      const result = await this.runner.runBenchmarkSuite(suiteId);
      suiteResults.push(result);
    }

    const report = await this.reporter.generateReport(suiteResults);
    await this.reporter.saveReport(report);

    return report;
  }

  async startContinuousMonitoring() {
    await this.monitor.startContinuousMonitoring({
      intervalMs: 60 * 60 * 1000, // Every hour
      alertThresholds: {
        executionTime: 15, // 15% regression
        memoryUsage: 20, // 20% memory increase
        throughput: 10, // 10% throughput decrease
      },
    });
  }

  async runOptimizationExperiment(experimentId: string) {
    return this.optimizer.runOptimizationExperiment(
      experimentId,
      async () => {
        /* baseline setup */
      },
      async () => {
        /* optimization setup */
      }
    );
  }
}
```

### 2. CLI Integration

```bash
# Performance benchmark commands
npm run benchmark                    # Run full benchmark suite
npm run benchmark:node-execution     # Run specific suite
npm run benchmark:memory            # Run memory benchmarks
npm run benchmark:regression        # Check for regressions
npm run benchmark:monitor          # Start continuous monitoring
npm run benchmark:optimize         # Run optimization experiments
npm run benchmark:report           # Generate performance report
```

### 3. CI/CD Integration

```yaml
# .github/workflows/performance.yml
name: Performance Benchmarks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run performance benchmarks
        run: npm run benchmark

      - name: Check for regressions
        run: npm run benchmark:regression

      - name: Upload benchmark results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: benchmark-results.json

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            // Post performance comparison comment on PR
```

## Usage Examples

### 1. Running Basic Benchmarks

```typescript
// Simple benchmark execution
const framework = new PerformanceBenchmarkFramework();

// Run specific benchmark
const nodeResults = await framework.runBenchmarkSuite('node-execution');
console.log(`Node execution average: ${nodeResults.summary.averageExecutionTime}ms`);

// Run full suite
const fullReport = await framework.runFullBenchmarkSuite();
console.log(`Overall performance score: ${fullReport.performanceScore}`);
```

### 2. Optimization Tracking

```typescript
// Test context pooling optimization
const framework = new PerformanceBenchmarkFramework();

framework.registerOptimizationExperiment({
  id: 'context-pooling',
  name: 'Context Pooling Optimization',
  description: 'Implement context object pooling to reduce allocation overhead',
  hypothesis: 'Context pooling will reduce execution time by 30-50%',
  targetMetrics: ['executionTime.average', 'memoryUsage.peak'],
  expectedImprovement: {
    'executionTime.average': 40, // 40% improvement expected
    'memoryUsage.peak': 25, // 25% memory reduction expected
  },
});

const result = await framework.runOptimizationExperiment('context-pooling');
console.log(`Context pooling result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
```

### 3. Continuous Monitoring

```typescript
// Start performance monitoring
const framework = new PerformanceBenchmarkFramework();
await framework.startContinuousMonitoring();

// Framework will automatically:
// - Run benchmarks every hour
// - Detect performance regressions
// - Send alerts for significant changes
// - Store historical performance data
```

## Success Metrics and Targets

### Benchmark Performance Targets

| Benchmark Category               | Current Performance | Target Performance | Improvement   |
| -------------------------------- | ------------------- | ------------------ | ------------- |
| **Simple Node Execution**        | 1M+ ops/sec         | 5M+ ops/sec        | 400%          |
| **Complex Node Execution**       | 200K ops/sec        | 1M+ ops/sec        | 400%          |
| **Graph Processing (100 nodes)** | 100 ops/sec         | 500 ops/sec        | 400%          |
| **Memory Usage (1000 nodes)**    | 100MB               | 50MB               | 50% reduction |
| **Schema Validation**            | 400K ops/sec        | 2M+ ops/sec        | 400%          |

### Framework Success Criteria

1. **Automated Regression Detection**: 95% accuracy in detecting performance regressions
2. **Optimization Tracking**: Measure and validate all optimization efforts
3. **Continuous Monitoring**: 24/7 performance monitoring with <5min alert latency
4. **Historical Analysis**: 12 months of performance trend data
5. **CI/CD Integration**: Performance gates in deployment pipeline

This comprehensive framework provides the foundation for maintaining and improving system performance while ensuring no regressions are introduced during development.
