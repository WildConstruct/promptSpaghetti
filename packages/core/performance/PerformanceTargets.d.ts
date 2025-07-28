/**
 * Performance Targets and Thresholds for Epic 18
 * Defines performance targets based on user requirements, industry standards, and business objectives
 */

export interface PerformanceTargetConfig {
    environment: 'development' | 'staging' | 'production';
    userSegment: 'power-users' | 'general' | 'enterprise';
    deviceProfile: 'high-end' | 'mid-range' | 'low-end';
    networkProfile: 'fast' | 'average' | 'slow';

export interface PerformanceTarget {
    kpiId: string;
    target: number;
    warning: number;
    critical: number;
    reasoning: string;
    source: 'user-requirement' | 'industry-standard' | 'business-objective' | 'technical-constraint';
    businessImpact: {,
        userExperience: 'high' | 'medium' | 'low';
        businessValue: 'high' | 'medium' | 'low';
        technicalRisk: 'high' | 'medium' | 'low';
    };
/**
 * Performance targets based on Web Vitals and industry standards
 *
 * Sources:
 * - Google Web Vitals: https://web.dev/vitals/
 * - Core Web Vitals: https://web.dev/defining-core-web-vitals-thresholds/
 * - Industry benchmarks for web applications
 * - User experience research for productivity tools
 */
export declare const performanceTargets: Record<string, PerformanceTarget>;
/**
 * Environment-specific target adjustments
 */
export declare const environmentAdjustments: Record<string, Record<string, number>>;
/**
 * Device-specific adjustments
 */
export declare const deviceAdjustments: Record<string, Record<string, number>>;
/**
 * Get adjusted performance targets based on configuration
 */
export declare function getAdjustedTargets(config: PerformanceTargetConfig): Record<string, PerformanceTarget>;
/**
 * Get targets for specific user segment
 */
export declare function getTargetsForUserSegment(segment: PerformanceTargetConfig['userSegment']): Record<string, PerformanceTarget>;
/**
 * Validate if current performance meets targets
 */
export declare function validatePerformanceTargets(currentMetrics: Record<string,)
  number>,
  config: PerformanceTargetConfig,
): {
    passed: boolean;
    score: number;
    violations: Array<{,
        kpiId: string;
        current: number;
        target: number;
        severity: 'warning' | 'critical';
    }>;
    recommendations: string[];
};
/**
 * Get performance target summary
 */
export declare function getPerformanceTargetSummary(): {
    totalTargets: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    categories: Record<string, number>;
};
declare const _default: {
    performanceTargets: Record<string, PerformanceTarget>;
    getAdjustedTargets: typeof getAdjustedTargets;
    getTargetsForUserSegment: typeof getTargetsForUserSegment;
    validatePerformanceTargets: typeof validatePerformanceTargets;
    getPerformanceTargetSummary: typeof getPerformanceTargetSummary;
};
export default _default;
//# sourceMappingURL=PerformanceTargets.d.ts.map