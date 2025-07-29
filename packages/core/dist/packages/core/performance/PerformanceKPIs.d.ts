/**
 * Performance Key Performance Indicators (KPIs) for Epic 18
 * Defines measurable performance metrics and targets for the prompt graph system
 */
export interface KPIDefinition {
    id: string;
    name: string;
    description: string;
    category: 'runtime' | 'api' | 'bundle' | 'memory' | 'network' | 'build' | 'user-experience';
    unit: string;
    target: number;
    warning: number;
    critical: number;
    measurement: {
        method: string;
        frequency: 'realtime' | 'interval' | 'on-demand';
        source: string;
    };
    businessImpact: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
}
export interface KPISnapshot {
    kpiId: string;
    value: number;
    timestamp: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    trend: 'improving' | 'stable' | 'degrading';
    metadata?: Record<string, any>;
}
export interface KPIThresholds {
    excellent: {
        min: number;
        max?: number;
    };
    good: {
        min: number;
        max: number;
    };
    warning: {
        min: number;
        max: number;
    };
    critical: {
        min?: number;
        max: number;
    };
}
export declare const corePerformanceKPIs: KPIDefinition;
/**
 * KPI threshold definitions for status calculation
 */
export declare const kpiThresholds: Record<string, KPIThresholds>, thresholds: KPIThresholds;
//# sourceMappingURL=PerformanceKPIs.d.ts.map