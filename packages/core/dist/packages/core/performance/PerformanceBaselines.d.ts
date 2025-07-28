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
    LOAD_TESTING = "load_testing",
    export,
    enum,
    MeasurementType
}
export type PerformanceMeasurement = z.infer<typeof PerformanceMeasurementSchema>;
export declare const PerformanceBaselineSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type PerformanceBaseline = z.infer<typeof PerformanceBaselineSchema>;
export declare const PerformanceBaselineCollectionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
    PerformanceBaseline: any;
}
export declare const globalBaselineManager: PerformanceBaselineManager;
export default PerformanceBaselineManager;
//# sourceMappingURL=PerformanceBaselines.d.ts.map