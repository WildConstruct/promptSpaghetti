/**
 * Performance Baselines Framework
 * 
 * Comprehensive performance baseline management system for PromptScape.
 * Provides standardized performance measurement, tracking, and comparison capabilities.
 */

import { z } from 'zod';

// Performance baseline categories
export enum BaselineCategory {
  CORE_ENGINE = 'core_engine',
  API_PERFORMANCE = 'api_performance',
  UI_RENDERING = 'ui_rendering',
  MEMORY_USAGE = 'memory_usage',
  NETWORK_IO = 'network_io',
  DATABASE = 'database',
  BUILD_PERFORMANCE = 'build_performance',
  LOAD_TESTING = 'load_testing'
}

// Performance measurement types
export enum MeasurementType {
  DURATION = 'duration',           // milliseconds
  THROUGHPUT = 'throughput',       // operations per second
  MEMORY = 'memory',               // bytes
  PERCENTAGE = 'percentage',       // 0-100
  COUNT = 'count',                 // absolute numbers
  BYTES = 'bytes',                 // file/data sizes
  RATIO = 'ratio'                  // decimal ratios
}

// Performance test environments
export enum TestEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  CI_CD = 'ci_cd',
  LOCAL = 'local'
}

// Performance baseline measurement schema
export const PerformanceMeasurementSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.nativeEnum(BaselineCategory),
  type: z.nativeEnum(MeasurementType),
  value: z.number(),
  unit: z.string(),
  timestamp: z.date(),
  environment: z.nativeEnum(TestEnvironment),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional()
});

export type PerformanceMeasurement = z.infer<typeof PerformanceMeasurementSchema>;

// Performance baseline definition schema
export const PerformanceBaselineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(BaselineCategory),
  type: z.nativeEnum(MeasurementType),
  unit: z.string(),
  
  // Baseline thresholds
  target: z.number(),              // Target performance value
  warning: z.number(),             // Warning threshold
  critical: z.number(),            // Critical threshold
  
  // Baseline statistics
  baseline: z.number(),            // Current baseline value
  minimum: z.number().optional(),  // Minimum acceptable value
  maximum: z.number().optional(),  // Maximum acceptable value
  
  // Metadata
  environment: z.nativeEnum(TestEnvironment),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.string(),
  tags: z.array(z.string()),
  
  // Historical data
  measurements: z.array(PerformanceMeasurementSchema),
  
  // Configuration
  enabled: z.boolean(),
  alerting: z.boolean(),
  trending: z.boolean()
});

export type PerformanceBaseline = z.infer<typeof PerformanceBaselineSchema>;

// Performance baseline collection schema
export const PerformanceBaselineCollectionSchema = z.object({
  version: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  environment: z.nativeEnum(TestEnvironment),
  baselines: z.array(PerformanceBaselineSchema),
  metadata: z.object({
    systemInfo: z.record(z.unknown()),
    buildInfo: z.record(z.unknown()),
    testConfig: z.record(z.unknown())
  }).optional()
});

export type PerformanceBaselineCollection = z.infer<typeof PerformanceBaselineCollectionSchema>;

/**
 * Performance Baseline Manager
 * 
 * Central management system for performance baselines
 */
export class PerformanceBaselineManager {
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private measurements: PerformanceMeasurement[] = [];
  private environment: TestEnvironment;

  constructor(environment: TestEnvironment = TestEnvironment.DEVELOPMENT) {
    this.environment = environment;
  }

  /**
   * Create a new performance baseline
   */
  createBaseline(config: {
    id: string;
    name: string;
    description: string;
    category: BaselineCategory;
    type: MeasurementType;
    unit: string;
    target: number;
    warning: number;
    critical: number;
    tags?: string[];
  }): PerformanceBaseline {
    const baseline: PerformanceBaseline = {
      id: config.id,
      name: config.name,
      description: config.description,
      category: config.category,
      type: config.type,
      unit: config.unit,
      target: config.target,
      warning: config.warning,
      critical: config.critical,
      baseline: config.target, // Initial baseline equals target
      environment: this.environment,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      tags: config.tags || [],
      measurements: [],
      enabled: true,
      alerting: true,
      trending: true
    };

    this.baselines.set(baseline.id, baseline);
    return baseline;
  }

  /**
   * Add a measurement to a baseline
   */
  addMeasurement(baselineId: string, measurement: Omit<PerformanceMeasurement, 'id' | 'timestamp' | 'environment'>): void {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) {
      throw new Error(`Baseline not found: ${baselineId}`);
    }

    const fullMeasurement: PerformanceMeasurement = {
      ...measurement,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      environment: this.environment
    };

    baseline.measurements.push(fullMeasurement);
    this.measurements.push(fullMeasurement);
    
    // Update baseline statistics
    this.updateBaselineStatistics(baselineId);
    baseline.updatedAt = new Date();
  }

  /**
   * Update baseline statistics based on recent measurements
   */
  private updateBaselineStatistics(baselineId: string): void {
    const baseline = this.baselines.get(baselineId);
    if (!baseline || baseline.measurements.length === 0) return;

    const recentMeasurements = baseline.measurements.slice(-50); // Last 50 measurements
    const values = recentMeasurements.map(m => m.value);

    // Calculate new baseline (moving average)
    baseline.baseline = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Update min/max
    baseline.minimum = Math.min(...values);
    baseline.maximum = Math.max(...values);
  }

  /**
   * Get baseline by ID
   */
  getBaseline(id: string): PerformanceBaseline | undefined {
    return this.baselines.get(id);
  }

  /**
   * Get all baselines by category
   */
  getBaselinesByCategory(category: BaselineCategory): PerformanceBaseline[] {
    return Array.from(this.baselines.values()).filter(b => b.category === category);
  }

  /**
   * Check if a measurement violates baseline thresholds
   */
  checkThreshold(baselineId: string, value: number): {
    status: 'ok' | 'warning' | 'critical';
    message: string;
    baseline: PerformanceBaseline;
  } {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) {
      throw new Error(`Baseline not found: ${baselineId}`);
    }

    let status: 'ok' | 'warning' | 'critical' = 'ok';
    let message = 'Performance within acceptable range';

    // Determine if higher values are better or worse
    const isLowerBetter = this.isLowerBetter(baseline.category, baseline.type);

    if (isLowerBetter) {
      if (value >= baseline.critical) {
        status = 'critical';
        message = `Critical: ${value}${baseline.unit} exceeds critical threshold of ${baseline.critical}${baseline.unit}`;
      } else if (value >= baseline.warning) {
        status = 'warning';
        message = `Warning: ${value}${baseline.unit} exceeds warning threshold of ${baseline.warning}${baseline.unit}`;
      }
    } else {
      if (value <= baseline.critical) {
        status = 'critical';
        message = `Critical: ${value}${baseline.unit} below critical threshold of ${baseline.critical}${baseline.unit}`;
      } else if (value <= baseline.warning) {
        status = 'warning';
        message = `Warning: ${value}${baseline.unit} below warning threshold of ${baseline.warning}${baseline.unit}`;
      }
    }

    return { status, message, baseline };
  }

  /**
   * Determine if lower values are better for a given metric
   */
  private isLowerBetter(category: BaselineCategory, type: MeasurementType): boolean {
    // For most performance metrics, lower values are better
    const lowerIsBetter = [
      MeasurementType.DURATION,
      MeasurementType.MEMORY,
      MeasurementType.BYTES
    ];

    // For some metrics, higher values are better
    const higherIsBetter = [
      MeasurementType.THROUGHPUT,
      MeasurementType.PERCENTAGE // usually for success rates, etc.
    ];

    if (lowerIsBetter.includes(type)) return true;
    if (higherIsBetter.includes(type)) return false;

    // Default based on category
    switch (category) {
    case BaselineCategory.CORE_ENGINE:
    case BaselineCategory.API_PERFORMANCE:
    case BaselineCategory.UI_RENDERING:
    case BaselineCategory.BUILD_PERFORMANCE:
      return type === MeasurementType.DURATION; // Lower duration is better
    case BaselineCategory.MEMORY_USAGE:
      return true; // Lower memory usage is better
    case BaselineCategory.LOAD_TESTING:
      return type !== MeasurementType.THROUGHPUT; // Higher throughput is better
    default:
      return true; // Default: lower is better
    }
  }

  /**
   * Get performance trend for a baseline
   */
  getTrend(baselineId: string, days: number = 7): {
    trend: 'improving' | 'stable' | 'degrading';
    percentage: number;
    measurements: PerformanceMeasurement[];
  } {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) {
      throw new Error(`Baseline not found: ${baselineId}`);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentMeasurements = baseline.measurements
      .filter(m => m.timestamp >= cutoffDate)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (recentMeasurements.length < 2) {
      return {
        trend: 'stable',
        percentage: 0,
        measurements: recentMeasurements
      };
    }

    // Calculate trend
    const firstHalf = recentMeasurements.slice(0, Math.floor(recentMeasurements.length / 2));
    const secondHalf = recentMeasurements.slice(Math.floor(recentMeasurements.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;

    const percentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    const isLowerBetter = this.isLowerBetter(baseline.category, baseline.type);

    let trend: 'improving' | 'stable' | 'degrading';
    if (Math.abs(percentage) < 5) {
      trend = 'stable';
    } else if (isLowerBetter) {
      trend = percentage < 0 ? 'improving' : 'degrading';
    } else {
      trend = percentage > 0 ? 'improving' : 'degrading';
    }

    return { trend, percentage: Math.abs(percentage), measurements: recentMeasurements };
  }

  /**
   * Generate baseline report
   */
  generateReport(): {
    summary: {
      totalBaselines: number;
      activeBaselines: number;
      categories: Record<BaselineCategory, number>;
      alerts: number;
    };
    baselines: Array<{
      baseline: PerformanceBaseline;
      status: 'ok' | 'warning' | 'critical';
      trend: 'improving' | 'stable' | 'degrading';
      lastMeasurement?: PerformanceMeasurement;
    }>;
    } {
    const baselines = Array.from(this.baselines.values());
    const categories = {} as Record<BaselineCategory, number>;
    let alerts = 0;

    // Count categories
    Object.values(BaselineCategory).forEach(cat => {
      categories[cat] = baselines.filter(b => b.category === cat).length;
    });

    const baselineReports = baselines.map(baseline => {
      const lastMeasurement = baseline.measurements[baseline.measurements.length - 1];
      const status = lastMeasurement 
        ? this.checkThreshold(baseline.id, lastMeasurement.value).status
        : 'ok';
      
      if (status !== 'ok') alerts++;

      const trend = this.getTrend(baseline.id).trend;

      return {
        baseline,
        status,
        trend,
        lastMeasurement
      };
    });

    return {
      summary: {
        totalBaselines: baselines.length,
        activeBaselines: baselines.filter(b => b.enabled).length,
        categories,
        alerts
      },
      baselines: baselineReports
    };
  }

  /**
   * Export baselines to JSON
   */
  export(): PerformanceBaselineCollection {
    return {
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      environment: this.environment,
      baselines: Array.from(this.baselines.values()),
      metadata: {
        systemInfo: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        },
        buildInfo: {
          timestamp: new Date().toISOString()
        },
        testConfig: {
          environment: this.environment
        }
      }
    };
  }

  /**
   * Import baselines from JSON
   */
  import(collection: PerformanceBaselineCollection): void {
    for (const baseline of collection.baselines) {
      this.baselines.set(baseline.id, baseline);
    }
  }

  /**
   * Clear all baselines and measurements
   */
  clear(): void {
    this.baselines.clear();
    this.measurements = [];
  }
}

// Pre-defined performance baselines for PromptScape
export const createDefaultBaselines = (manager: PerformanceBaselineManager): void => {
  // Core Engine Performance Baselines
  manager.createBaseline({
    id: 'core-engine-simple-execution',
    name: 'Simple Graph Execution',
    description: 'Time to execute a simple graph with basic nodes',
    category: BaselineCategory.CORE_ENGINE,
    type: MeasurementType.DURATION,
    unit: 'ms',
    target: 10,
    warning: 50,
    critical: 100,
    tags: ['core', 'execution', 'basic']
  });

  manager.createBaseline({
    id: 'core-engine-complex-execution',
    name: 'Complex Graph Execution',
    description: 'Time to execute complex graphs with advanced nodes',
    category: BaselineCategory.CORE_ENGINE,
    type: MeasurementType.DURATION,
    unit: 'ms',
    target: 100,
    warning: 500,
    critical: 1000,
    tags: ['core', 'execution', 'complex']
  });

  manager.createBaseline({
    id: 'core-engine-throughput',
    name: 'Graph Execution Throughput',
    description: 'Number of graph executions per second',
    category: BaselineCategory.CORE_ENGINE,
    type: MeasurementType.THROUGHPUT,
    unit: 'ops/sec',
    target: 100,
    warning: 50,
    critical: 10,
    tags: ['core', 'throughput']
  });

  // API Performance Baselines
  manager.createBaseline({
    id: 'api-preview-endpoint',
    name: 'Preview API Response Time',
    description: 'Time for preview endpoint to generate variants',
    category: BaselineCategory.API_PERFORMANCE,
    type: MeasurementType.DURATION,
    unit: 'ms',
    target: 200,
    warning: 400,
    critical: 800,
    tags: ['api', 'preview']
  });

  manager.createBaseline({
    id: 'api-validation-endpoint',
    name: 'Validation API Response Time',
    description: 'Time for graph validation endpoint',
    category: BaselineCategory.API_PERFORMANCE,
    type: MeasurementType.DURATION,
    unit: 'ms',
    target: 50,
    warning: 80,
    critical: 150,
    tags: ['api', 'validation']
  });

  // UI Rendering Baselines
  manager.createBaseline({
    id: 'ui-first-contentful-paint',
    name: 'First Contentful Paint',
    description: 'Time to first contentful paint (FCP)',
    category: BaselineCategory.UI_RENDERING,
    type: MeasurementType.DURATION,
    unit: 'ms',
    target: 800,
    warning: 1200,
    critical: 2000,
    tags: ['ui', 'web-vitals', 'fcp']
  });

  manager.createBaseline({
    id: 'ui-largest-contentful-paint',
    name: 'Largest Contentful Paint',
    description: 'Time to largest contentful paint (LCP)',
    category: BaselineCategory.UI_RENDERING,
    type: MeasurementType.DURATION,
    unit: 'ms',
    target: 1500,
    warning: 2000,
    critical: 4000,
    tags: ['ui', 'web-vitals', 'lcp']
  });

  manager.createBaseline({
    id: 'ui-cumulative-layout-shift',
    name: 'Cumulative Layout Shift',
    description: 'Cumulative layout shift score (CLS)',
    category: BaselineCategory.UI_RENDERING,
    type: MeasurementType.RATIO,
    unit: '',
    target: 0.05,
    warning: 0.08,
    critical: 0.15,
    tags: ['ui', 'web-vitals', 'cls']
  });

  // Memory Usage Baselines
  manager.createBaseline({
    id: 'memory-heap-usage',
    name: 'Heap Memory Usage',
    description: 'Peak heap memory usage during execution',
    category: BaselineCategory.MEMORY_USAGE,
    type: MeasurementType.MEMORY,
    unit: 'MB',
    target: 50,
    warning: 80,
    critical: 100,
    tags: ['memory', 'heap']
  });

  manager.createBaseline({
    id: 'memory-graph-storage',
    name: 'Graph Memory Storage',
    description: 'Memory usage for storing large graphs',
    category: BaselineCategory.MEMORY_USAGE,
    type: MeasurementType.MEMORY,
    unit: 'MB',
    target: 10,
    warning: 20,
    critical: 50,
    tags: ['memory', 'graph', 'storage']
  });

  // Build Performance Baselines
  manager.createBaseline({
    id: 'build-typescript-compilation',
    name: 'TypeScript Compilation Time',
    description: 'Time to compile TypeScript to JavaScript',
    category: BaselineCategory.BUILD_PERFORMANCE,
    type: MeasurementType.DURATION,
    unit: 's',
    target: 15,
    warning: 30,
    critical: 60,
    tags: ['build', 'typescript']
  });

  manager.createBaseline({
    id: 'build-bundle-size',
    name: 'Production Bundle Size',
    description: 'Size of production JavaScript bundle',
    category: BaselineCategory.BUILD_PERFORMANCE,
    type: MeasurementType.BYTES,
    unit: 'KB',
    target: 500,
    warning: 1000,
    critical: 2000,
    tags: ['build', 'bundle', 'size']
  });

  // Load Testing Baselines
  manager.createBaseline({
    id: 'load-concurrent-users',
    name: 'Concurrent Users Capacity',
    description: 'Maximum concurrent users supported',
    category: BaselineCategory.LOAD_TESTING,
    type: MeasurementType.COUNT,
    unit: 'users',
    target: 100,
    warning: 50,
    critical: 10,
    tags: ['load', 'concurrent', 'users']
  });

  manager.createBaseline({
    id: 'load-requests-per-second',
    name: 'Requests Per Second',
    description: 'Maximum requests per second under load',
    category: BaselineCategory.LOAD_TESTING,
    type: MeasurementType.THROUGHPUT,
    unit: 'req/s',
    target: 1000,
    warning: 500,
    critical: 100,
    tags: ['load', 'throughput', 'rps']
  });
};

// Global baseline manager instance
export const globalBaselineManager = new PerformanceBaselineManager();

// Initialize with default baselines
createDefaultBaselines(globalBaselineManager);

export default PerformanceBaselineManager;