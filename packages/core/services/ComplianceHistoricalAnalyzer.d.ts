/**
 * Compliance Historical Analysis Service
 * Provides historical trend analysis and reporting for compliance metrics
 */

}
export interface HistoricalDataPoint {
    timestamp: Date;
    value: number;
    baseline: number;
    deviation: number;
    status: 'compliant' | 'warning' | 'non_compliant';
    framework: string;
    category: string;
    metric: string;

}
export interface ComplianceTrendReport {
    reportId: string;
    generatedAt: Date;
    period: {
        startDate: Date;
        endDate: Date;
        duration: string;
}
    };
    framework: string;
    summary: {
        totalDataPoints: number;
        averageCompliance: number;
        bestPerformingMetric: string;
        worstPerformingMetric: string;
        improvementTrend: 'positive' | 'negative' | 'stable';
        criticalIncidents: number;
    };
    metrics: {
        name: string;
        currentValue: number;
        historicalAverage: number;
        trendDirection: 'up' | 'down' | 'stable';
        volatility: number;
        complianceRate: number;
        recommendations: string[];
    }[];
    keyEvents: {
        date: Date;
        event: string;
        impact: 'positive' | 'negative' | 'neutral';
        description: string;
    }[];
    periodicComparison: {
        currentPeriod: number;
        previousPeriod: number;
        change: number;
        changeType: 'improvement' | 'degradation' | 'stable'
  };

}
export interface ComplianceForecasting {
    baselineId: string;
    forecastHorizon: number;
    predictedValues: {
        date: Date;
        predictedValue: number;
        confidenceInterval: {
            lower: number;
            upper: number;
}
        };
        riskLevel: 'low' | 'medium' | 'high'
  }[];
    forecastAccuracy: number;
    assumptions: string[];
    riskFactors: {
        factor: string;
        impact: 'high' | 'medium' | 'low';
        likelihood: number;
    }[];

}
export interface ComplianceAuditTrail {
    auditId: string;
    auditPeriod: {
        startDate: Date;
        endDate: Date;
}
    };
    framework: string;
    auditType: 'internal' | 'external' | 'certification';
    findings: {
        category: 'strength' | 'weakness' | 'non_compliance' | 'improvement_opportunity';
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        remediation?: string;
        dueDate?: Date;
        status: 'open' | 'in_progress' | 'completed' | 'deferred'
  }[];
    overallRating: 'excellent' | 'satisfactory' | 'needs_improvement' | 'non_compliant';
    certificationStatus?: 'certified' | 'conditionally_certified' | 'not_certified';
    nextAuditDue: Date;

export declare class ComplianceHistoricalAnalyzer {
    private historicalData;
    private trendReports;
    private auditTrails;
    constructor();
    /**
     * Initialize with sample historical data for demonstration
     */
    private initializeHistoricalData;
    /**
     * Generate comprehensive trend report for a specific framework
     */
    generateTrendReport(framework: string, startDate: Date, endDate: Date): Promise<ComplianceTrendReport>;
    /**
     * Generate compliance forecasting
     */
    generateForecast(baselineId: string, forecastHorizon?: number): Promise<ComplianceForecasting>;
    /**
     * Create audit trail entry
     */
    createAuditTrail(auditData: Omit<ComplianceAuditTrail, 'auditId'>): Promise<ComplianceAuditTrail>;
    /**
     * Get compliance history for a specific metric
     */
    getMetricHistory(framework: string, metric: string, startDate?: Date, endDate?: Date): HistoricalDataPoint[];
    /**
     * Export historical data for external analysis
     */
    exportHistoricalData(framework?: string): {
        metadata: {
            exportDate: Date;
            framework?: string;
            totalDataPoints: number;
            dateRange: {
                earliest: Date;
                latest: Date;
            };
        };
        data: HistoricalDataPoint[];
    };
    private getBaselineForMetric;
    private getCategoryForMetric;
    private determineComplianceStatus;
    private calculateDuration;
    private groupDataPointsByMetric;
    private calculateVolatility;
    private calculateTrendDirection;
    private calculateLinearTrend;
    private generateMetricRecommendations;
    private identifyKeyEvents;
    private calculateForecastAccuracy;
    private findHistoricalKeyForBaseline;

export declare const complianceHistoricalAnalyzer: ComplianceHistoricalAnalyzer;
//# sourceMappingURL=ComplianceHistoricalAnalyzer.d.ts.map