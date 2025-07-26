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
    measurements: ComplianceMeasurement[];
    trendDirection: 'improving' | 'stable' | 'declining' | 'critical';
    averageDeviation: number;
    consistencyScore: number;
    lastMeasurement: ComplianceMeasurement;
    recommendedActions: string[];
}
export interface BaselineDashboard {
    overallHealthScore: number;
    frameworkHealth: Record<string, {
        score: number;
        status: 'healthy' | 'warning' | 'critical';
        baselinesTracked: number;
        baselinesMet: number;
        criticalDeviations: number;
    }>;
    recentDeviations: ComplianceMeasurement[];
    trendAnalysis: BaselineTrend[];
    improvementOpportunities: {
        baselineId: string;
        name: string;
        currentGap: number;
        potentialImpact: string;
        difficulty: 'low' | 'medium' | 'high';
        estimatedTimeframe: string;
    }[];
    alerts: {
        id: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        baselineId: string;
        triggeredAt: Date;
        acknowledged: boolean;
    }[];
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
    /**
     * Record a new measurement against a baseline
     */
    recordMeasurement(
      baselineId: string,
      actualValue: number,
      context?: Record<string,
      any>,
      notes?: string
    ): Promise<ComplianceMeasurement>;
    /**
     * Get baseline trend analysis
     */
    getBaselineTrend(baselineId: string, daysPeriod?: number): BaselineTrend | null;
    /**
     * Generate comprehensive baseline dashboard
     */
    generateDashboard(): Promise<BaselineDashboard>;
    /**
     * Update baseline target or tolerance
     */
    updateBaseline(
      baselineId: string,
      updates: Partial<Pick<ComplianceBaseline,
      'targetValue' | 'toleranceThreshold' | 'isActive'>>
    ): Promise<void>;
    /**
     * Create custom baseline
     */
    createCustomBaseline(
      baseline: Omit<ComplianceBaseline,
      'id' | 'baselineEstablishedAt' | 'lastUpdatedAt'>
    ): Promise<ComplianceBaseline>;
    /**
     * Get all active baselines
     */
    getActiveBaselines(): ComplianceBaseline[];
    /**
     * Export baseline data for reporting
     */
    exportBaselineData(framework?: string, daysPeriod?: number): {
        baselines: ComplianceBaseline[];
        measurements: ComplianceMeasurement[];
        summary: Record<string, any>;
    };
    private calculateDeviation;
    private determineStatus;
    private calculateConsistencyScore;
    private analyzeTrendDirection;
    private generateRecommendations;
    private identifyImprovementOpportunities;
    private createAlert;
    private getUnitSymbol;
}
export declare const complianceBaselineTracker: ComplianceBaselineTracker;
//# sourceMappingURL=ComplianceBaselineTracker.d.ts.map