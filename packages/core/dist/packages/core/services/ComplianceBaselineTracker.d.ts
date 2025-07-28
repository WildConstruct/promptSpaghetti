/**
 * Compliance Baseline Tracking Service
 * Tracks and analyzes compliance metrics against established baselines
 * for GDPR, SOC2, MPA, and internal security standards
 */
export interface ComplianceBaseline {
    id: string;
    framework: 'GDPR' | 'CCPA' | 'SOC2' | 'ISO27001' | 'MPA' | 'INTERNAL';
    category: 'security' | 'privacy' | 'regulatory' | 'operational';
    name: string;
    description: string;
    targetValue: number;
    toleranceThreshold: number;
    measurementUnit: 'percentage' | 'count' | 'time' | 'score';
    measurementFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    baselineEstablishedAt: Date;
    lastUpdatedAt: Date;
    isActive: boolean;
}
export interface ComplianceMeasurement {
    id: string;
    baselineId: string;
    actualValue: number;
    targetValue: number;
    deviation: number;
    status: 'above_baseline' | 'at_baseline' | 'below_baseline' | 'critical_deviation';
    measuredAt: Date;
    context?: Record<string, any>;
    notes?: string;
}
export interface BaselineTrend {
    baselineId: string;
    framework: string;
    category: string;
    name: string;
    measurements: ComplianceMeasurement;
    trendDirection: 'improving' | 'stable' | 'declining' | 'critical';
    averageDeviation: number;
    consistencyScore: number;
    lastMeasurement: ComplianceMeasurement;
    recommendedActions: string;
}
export interface BaselineDashboard {
    overallHealthScore: number;
    frameworkHealth: Record<string, {}, score>;
    number: any;
    status: 'healthy' | 'warning' | 'critical';
    baselinesTracked: number;
    baselinesMet: number;
    criticalDeviations: number;
}
export declare class ComplianceBaselineTracker {
    private baselines;
    private measurements;
    private alerts;
    constructor();
    /**
    * Initialize default compliance baselines
    */
    private initializeBaselines;
    console: any;
    log(: any, defaultBaselines: any, length: any): any;
}
//# sourceMappingURL=ComplianceBaselineTracker.d.ts.map