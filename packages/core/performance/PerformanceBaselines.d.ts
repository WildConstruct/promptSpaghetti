/**
 * Performance Baselines Framework
 *
 * Comprehensive performance baseline management system for PromptScape.
 * Provides standardized performance measurement, tracking, and comparison capabilities.
 */
import { z } from 'zod';
export declare enum BaselineCategory {
    CORE_ENGINE = "core_engine",
    API_PERFORMANCE = "api_performance",
    UI_RENDERING = "ui_rendering",
    MEMORY_USAGE = "memory_usage",
    NETWORK_IO = "network_io",
    DATABASE = "database",
    BUILD_PERFORMANCE = "build_performance",
    LOAD_TESTING = "load_testing"
}
export declare enum MeasurementType {
    DURATION = "duration",// milliseconds
    THROUGHPUT = "throughput",// operations per second
    MEMORY = "memory",// bytes
    PERCENTAGE = "percentage",// 0-100
    COUNT = "count",// absolute numbers
    BYTES = "bytes",// file/data sizes
    RATIO = "ratio"
}
export declare enum TestEnvironment {
    DEVELOPMENT = "development",
    STAGING = "staging",
    PRODUCTION = "production",
    CI_CD = "ci_cd",
    LOCAL = "local"
}
export declare const PerformanceMeasurementSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodNativeEnum<typeof BaselineCategory>;
    type: z.ZodNativeEnum<typeof MeasurementType>;
    value: z.ZodNumber;
    unit: z.ZodString;
    timestamp: z.ZodDate;
    environment: z.ZodNativeEnum<typeof TestEnvironment>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    value: number;
    type: MeasurementType;
    category: BaselineCategory;
    timestamp: Date;
    environment: TestEnvironment;
    unit: string;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    id: string;
    name: string;
    value: number;
    type: MeasurementType;
    category: BaselineCategory;
    timestamp: Date;
    environment: TestEnvironment;
    unit: string;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type PerformanceMeasurement = z.infer<typeof PerformanceMeasurementSchema>;
export declare const PerformanceBaselineSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodNativeEnum<typeof BaselineCategory>;
    type: z.ZodNativeEnum<typeof MeasurementType>;
    unit: z.ZodString;
    target: z.ZodNumber;
    warning: z.ZodNumber;
    critical: z.ZodNumber;
    baseline: z.ZodNumber;
    minimum: z.ZodOptional<z.ZodNumber>;
    maximum: z.ZodOptional<z.ZodNumber>;
    environment: z.ZodNativeEnum<typeof TestEnvironment>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    version: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    measurements: z.ZodArray<z.ZodObject<{,
        id: z.ZodString;
        name: z.ZodString;
        category: z.ZodNativeEnum<typeof BaselineCategory>;
        type: z.ZodNativeEnum<typeof MeasurementType>;
        value: z.ZodNumber;
        unit: z.ZodString;
        timestamp: z.ZodDate;
        environment: z.ZodNativeEnum<typeof TestEnvironment>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        value: number;
        type: MeasurementType;
        category: BaselineCategory;
        timestamp: Date;
        environment: TestEnvironment;
        unit: string;
        tags?: string[] | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        id: string;
        name: string;
        value: number;
        type: MeasurementType;
        category: BaselineCategory;
        timestamp: Date;
        environment: TestEnvironment;
        unit: string;
        tags?: string[] | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
    enabled: z.ZodBoolean;
    alerting: z.ZodBoolean;
    trending: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    type: MeasurementType;
    category: BaselineCategory;
    tags: string[];
    version: string;
    target: number;
    baseline: number;
    critical: number;
    warning: number;
    environment: TestEnvironment;
    enabled: boolean;
    alerting: boolean;
    unit: string;
    measurements: {,
        id: string;
        name: string;
        value: number;
        type: MeasurementType;
        category: BaselineCategory;
        timestamp: Date;
        environment: TestEnvironment;
        unit: string;
        tags?: string[] | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
    trending: boolean;
    minimum?: number | undefined;
    maximum?: number | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    type: MeasurementType;
    category: BaselineCategory;
    tags: string[];
    version: string;
    target: number;
    baseline: number;
    critical: number;
    warning: number;
    environment: TestEnvironment;
    enabled: boolean;
    alerting: boolean;
    unit: string;
    measurements: {,
        id: string;
        name: string;
        value: number;
        type: MeasurementType;
        category: BaselineCategory;
        timestamp: Date;
        environment: TestEnvironment;
        unit: string;
        tags?: string[] | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
    trending: boolean;
    minimum?: number | undefined;
    maximum?: number | undefined;
}>;
export type PerformanceBaseline = z.infer<typeof PerformanceBaselineSchema>;
export declare const PerformanceBaselineCollectionSchema: z.ZodObject<{
    version: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    environment: z.ZodNativeEnum<typeof TestEnvironment>;
    baselines: z.ZodArray<z.ZodObject<{,
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        category: z.ZodNativeEnum<typeof BaselineCategory>;
        type: z.ZodNativeEnum<typeof MeasurementType>;
        unit: z.ZodString;
        target: z.ZodNumber;
        warning: z.ZodNumber;
        critical: z.ZodNumber;
        baseline: z.ZodNumber;
        minimum: z.ZodOptional<z.ZodNumber>;
        maximum: z.ZodOptional<z.ZodNumber>;
        environment: z.ZodNativeEnum<typeof TestEnvironment>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        version: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        measurements: z.ZodArray<z.ZodObject<{,
            id: z.ZodString;
            name: z.ZodString;
            category: z.ZodNativeEnum<typeof BaselineCategory>;
            type: z.ZodNativeEnum<typeof MeasurementType>;
            value: z.ZodNumber;
            unit: z.ZodString;
            timestamp: z.ZodDate;
            environment: z.ZodNativeEnum<typeof TestEnvironment>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            value: number;
            type: MeasurementType;
            category: BaselineCategory;
            timestamp: Date;
            environment: TestEnvironment;
            unit: string;
            tags?: string[] | undefined;
            metadata?: Record<string, unknown> | undefined;
        }, {
            id: string;
            name: string;
            value: number;
            type: MeasurementType;
            category: BaselineCategory;
            timestamp: Date;
            environment: TestEnvironment;
            unit: string;
            tags?: string[] | undefined;
            metadata?: Record<string, unknown> | undefined;
        }>, "many">;
        enabled: z.ZodBoolean;
        alerting: z.ZodBoolean;
        trending: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        type: MeasurementType;
        category: BaselineCategory;
        tags: string[];
        version: string;
        target: number;
        baseline: number;
        critical: number;
        warning: number;
        environment: TestEnvironment;
        enabled: boolean;
        alerting: boolean;
        unit: string;
        measurements: {,
            id: string;
            name: string;
            value: number;
            type: MeasurementType;
            category: BaselineCategory;
            timestamp: Date;
            environment: TestEnvironment;
            unit: string;
            tags?: string[] | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[];
        trending: boolean;
        minimum?: number | undefined;
        maximum?: number | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        type: MeasurementType;
        category: BaselineCategory;
        tags: string[];
        version: string;
        target: number;
        baseline: number;
        critical: number;
        warning: number;
        environment: TestEnvironment;
        enabled: boolean;
        alerting: boolean;
        unit: string;
        measurements: {,
            id: string;
            name: string;
            value: number;
            type: MeasurementType;
            category: BaselineCategory;
            timestamp: Date;
            environment: TestEnvironment;
            unit: string;
            tags?: string[] | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[];
        trending: boolean;
        minimum?: number | undefined;
        maximum?: number | undefined;
    }>, "many">;
    metadata: z.ZodOptional<z.ZodObject<{,
        systemInfo: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        buildInfo: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        testConfig: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        systemInfo: Record<string, unknown>;
        buildInfo: Record<string, unknown>;
        testConfig: Record<string, unknown>;
    }, {
        systemInfo: Record<string, unknown>;
        buildInfo: Record<string, unknown>;
        testConfig: Record<string, unknown>;
    }>>;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    environment: TestEnvironment;
    baselines: {,
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        type: MeasurementType;
        category: BaselineCategory;
        tags: string[];
        version: string;
        target: number;
        baseline: number;
        critical: number;
        warning: number;
        environment: TestEnvironment;
        enabled: boolean;
        alerting: boolean;
        unit: string;
        measurements: {,
            id: string;
            name: string;
            value: number;
            type: MeasurementType;
            category: BaselineCategory;
            timestamp: Date;
            environment: TestEnvironment;
            unit: string;
            tags?: string[] | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[];
        trending: boolean;
        minimum?: number | undefined;
        maximum?: number | undefined;
    }[];
    metadata?: {
        systemInfo: Record<string, unknown>;
        buildInfo: Record<string, unknown>;
        testConfig: Record<string, unknown>;
    } | undefined;
}, {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    environment: TestEnvironment;
    baselines: {,
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        type: MeasurementType;
        category: BaselineCategory;
        tags: string[];
        version: string;
        target: number;
        baseline: number;
        critical: number;
        warning: number;
        environment: TestEnvironment;
        enabled: boolean;
        alerting: boolean;
        unit: string;
        measurements: {,
            id: string;
            name: string;
            value: number;
            type: MeasurementType;
            category: BaselineCategory;
            timestamp: Date;
            environment: TestEnvironment;
            unit: string;
            tags?: string[] | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[];
        trending: boolean;
        minimum?: number | undefined;
        maximum?: number | undefined;
    }[];
    metadata?: {
        systemInfo: Record<string, unknown>;
        buildInfo: Record<string, unknown>;
        testConfig: Record<string, unknown>;
    } | undefined;
}>;
export type PerformanceBaselineCollection = z.infer<typeof PerformanceBaselineCollectionSchema>;
/**
 * Performance Baseline Manager
 *
 * Central management system for performance baselines
 */
export declare class PerformanceBaselineManager {
    private baselines;
    private measurements;
    private environment;
    constructor(environment?: TestEnvironment);
    /**
     * Create a new performance baseline
     */
    createBaseline(config: {)
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
    }): PerformanceBaseline;
    /**
     * Add a measurement to a baseline
     */
    addMeasurement()
      baselineId: string,
      measurement: Omit<PerformanceMeasurement,
      'id' | 'timestamp' | 'environment'>
    ): void;
    /**
     * Update baseline statistics based on recent measurements
     */
    private updateBaselineStatistics;
    /**
     * Get baseline by ID
     */
    getBaseline(id: string): PerformanceBaseline | undefined;
    /**
     * Get all baselines by category
     */
    getBaselinesByCategory(category: BaselineCategory): PerformanceBaseline[];
    /**
     * Check if a measurement violates baseline thresholds
     */
    checkThreshold(baselineId: string, value: number): {
        status: 'ok' | 'warning' | 'critical';
        message: string;
        baseline: PerformanceBaseline;
    };
    /**
     * Determine if lower values are better for a given metric
     */
    private isLowerBetter;
    /**
     * Get performance trend for a baseline
     */
    getTrend(baselineId: string, days?: number): {
        trend: 'improving' | 'stable' | 'degrading';
        percentage: number;
        measurements: PerformanceMeasurement[];
    };
    /**
     * Generate baseline report
     */
    generateReport(): {
        summary: {,
            totalBaselines: number;
            activeBaselines: number;
            categories: Record<BaselineCategory, number>;
            alerts: number;
        };
        baselines: Array<{,
            baseline: PerformanceBaseline;
            status: 'ok' | 'warning' | 'critical';
            trend: 'improving' | 'stable' | 'degrading';
            lastMeasurement?: PerformanceMeasurement;
        }>;
    };
    /**
     * Export baselines to JSON
     */
    export(): PerformanceBaselineCollection;
    /**
     * Import baselines from JSON
     */
    import(collection: PerformanceBaselineCollection): void;
    /**
     * Clear all baselines and measurements
     */
    clear(): void;
}
export declare export declare const globalBaselineManager: PerformanceBaselineManager;
export default PerformanceBaselineManager;
//# sourceMappingURL=PerformanceBaselines.d.ts.map