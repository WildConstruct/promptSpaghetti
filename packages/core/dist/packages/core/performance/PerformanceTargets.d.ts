/**
 * Performance Targets and Thresholds for Epic 18
 * Defines performance targets based on user requirements, industry standards, and business objectives
 */
export interface PerformanceTargetConfig {
    environment: 'development' | 'staging' | 'production';
    userSegment: 'power-users' | 'general' | 'enterprise';
    deviceProfile: 'high-end' | 'mid-range' | 'low-end';
    networkProfile: 'fast' | 'average' | 'slow';
}
export interface PerformanceTarget {
    kpiId: string;
    target: number;
    warning: number;
    critical: number;
    reasoning: string;
    source: 'user-requirement' | 'industry-standard' | 'business-objective' | 'technical-constraint';
    businessImpact: {
        userExperience: 'high' | 'medium' | 'low';
        businessValue: 'high' | 'medium' | 'low';
        technicalRisk: 'high' | 'medium' | 'low';
    };
}
export declare const performanceTargets: Record<string, PerformanceTarget>, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any;
/**
 * Device-specific adjustments
 */
export declare const deviceAdjustments: Record<string, Record<string, number>>;
//# sourceMappingURL=PerformanceTargets.d.ts.map