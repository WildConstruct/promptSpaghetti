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
    measurement: {,
        method: string;
        frequency: 'realtime' | 'interval' | 'on-demand';
        source: string;
    };
    businessImpact: string;
    priority: 'critical' | 'high' | 'medium' | 'low';

export interface KPISnapshot {
    kpiId: string;
    value: number;
    timestamp: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    trend: 'improving' | 'stable' | 'degrading';
    metadata?: Record<string, any>;

export interface KPIThresholds {
    excellent: {,
        min: number;
        max?: number;
    };
    good: {,
        min: number;
        max: number;
    };
    warning: {,
        min: number;
        max: number;
    };
    critical: {,
        min?: number;
        max: number;
    };
/**
 * Core Performance KPIs for the Prompt Graph System
 */
export declare const corePerformanceKPIs: KPIDefinition[];
/**
 * KPI threshold definitions for status calculation
 */
export declare const kpiThresholds: Record<string, KPIThresholds>;
/**
 * Calculate KPI status based on current value and thresholds
 */
export declare function calculateKPIStatus(kpiId: string, value: number): 'excellent' | 'good' | 'warning' | 'critical';
/**
 * Calculate KPI trend based on historical values
 */
export declare function calculateKPITrend(snapshots: KPISnapshot[]): 'improving' | 'stable' | 'degrading';
/**
 * Generate KPI recommendations based on current status
 */
export declare function generateKPIRecommendations(kpiId: string, value: number, status: string): string[];
/**
 * Get KPI by ID
 */
export declare function getKPIDefinition(kpiId: string): KPIDefinition | undefined;
/**
 * Get KPIs by category
 */
export declare function getKPIsByCategory(category: string): KPIDefinition[];
/**
 * Get high-priority KPIs
 */
export declare function getCriticalKPIs(): KPIDefinition[];
declare const _default: {
    corePerformanceKPIs: KPIDefinition[];
    kpiThresholds: Record<string, KPIThresholds>;
    calculateKPIStatus: typeof calculateKPIStatus;
    calculateKPITrend: typeof calculateKPITrend;
    generateKPIRecommendations: typeof generateKPIRecommendations;
    getKPIDefinition: typeof getKPIDefinition;
    getKPIsByCategory: typeof getKPIsByCategory;
    getCriticalKPIs: typeof getCriticalKPIs;
};
export default _default;
//# sourceMappingURL=PerformanceKPIs.d.ts.map