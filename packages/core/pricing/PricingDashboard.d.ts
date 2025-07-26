/**
 * Pricing Dashboard Component
 * Epic 17 - Create Pricing Optimization Dashboard (E17-1753114397435-FAE0EA)
 *
 * Real-time pricing analytics and optimization dashboard for Wild Construct integration
 */
import { EventEmitter } from 'events';
import { PricingOptimizer } from './PricingOptimizer';
export interface DashboardConfig {
    refreshIntervalMs: number;
    showPredictiveAnalytics: boolean;
    enableRealTimeUpdates: boolean;
    maxHistoryDays: number;
    alertThresholds: {
        revenueDeclinePercent: number;
        demandDropPercent: number;
        competitiveThreatScore: number;
    };
    filmIndustryFocus: boolean;
}
export interface DashboardMetrics {
    totalRevenue: number;
    revenueGrowthRate: number;
    averageOrderValue: number;
    revenuePerModel: Record<string, number>;
    totalCalculations: number;
    averageResponseTime: number;
    successRate: number;
    aiOptimizationImpact: number;
    priceOptimalityScore: number;
    demandPredictionAccuracy: number;
    studioTierBreakdown: Record<string, number>;
    productionTypeDistribution: Record<string, number>;
    seasonalTrends: Array<{
        period: string;
        revenue: number;
        growth: number;
    }>;
    marketPosition: 'leader' | 'challenger' | 'follower';
    competitiveAdvantage: number;
    pricePositioning: 'premium' | 'competitive' | 'value';
    updatedAt: number;
}
export interface PricingAlert {
    id: string;
    type: 'revenue_decline' | 'demand_drop' | 'competitive_threat' | 'optimization_opportunity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    modelId?: string;
    value: number;
    threshold: number;
    recommendation: string;
    createdAt: number;
    acknowledged: boolean;
}
export interface PricingInsight {
    id: string;
    type: 'trend' | 'opportunity' | 'risk' | 'optimization';
    category: 'revenue' | 'demand' | 'competition' | 'seasonality' | 'film_industry';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    actionItems: string[];
    dataPoints: Array<{
        metric: string;
        current: number;
        previous: number;
        change: number;
    }>;
    createdAt: number;
}
export interface RevenueProjection {
    period: '1_month' | '3_months' | '6_months' | '1_year';
    projectedRevenue: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    assumptions: string[];
    keyFactors: Array<{
        factor: string;
        impact: number;
        confidence: number;
    }>;
}
/**
 * Real-time pricing dashboard for monitoring and optimization
 */
export declare class PricingDashboard extends EventEmitter {
    private optimizer;
    private config;
    private metrics;
    private alerts;
    private insights;
    private updateInterval?;
    private revenueHistory;
    private demandHistory;
    private competitiveHistory;
    constructor(optimizer: PricingOptimizer, config?: Partial<DashboardConfig>);
    /**
     * Get current dashboard metrics
     */
    getMetrics(): DashboardMetrics;
    /**
     * Get active alerts
     */
    getAlerts(severity?: PricingAlert['severity']): PricingAlert[];
    /**
     * Get insights
     */
    getInsights(category?: PricingInsight['category']): PricingInsight[];
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Generate revenue projections
     */
    generateRevenueProjections(): Promise<Record<RevenueProjection['period'], RevenueProjection>>;
    /**
     * Get competitive analysis dashboard data
     */
    getCompetitiveAnalysisDashboard(): Promise<{
        currentPosition: string;
        competitiveAdvantage: number;
        marketGaps: string[];
        pricingRecommendations: string[];
        threatLevel: 'low' | 'medium' | 'high';
    }>;
    /**
     * Get film industry specific dashboard data
     */
    getFilmIndustryDashboard(): {
        studioSegments: Array<{
            segment: string;
            revenue: number;
            growth: number;
        }>;
        productionTrends: Array<{
            type: string;
            volume: number;
            avgPrice: number;
        }>;
        seasonalPerformance: Array<{
            season: string;
            multiplier: number;
            revenue: number;
        }>;
        contentTypeAnalysis: Array<{
            type: string;
            demand: number;
            pricing: number;
        }>;
    };
    /**
     * Export dashboard data
     */
    exportDashboardData(format: 'json' | 'csv'): string;
    /**
     * Shutdown dashboard
     */
    shutdown(): void;
    private initializeEmptyMetrics;
    private setupRealTimeUpdates;
    private startPeriodicRefresh;
    private refreshMetrics;
    private updateMetricsFromPricingEvent;
    private updateOptimizationMetrics;
    private calculateRevenueGrowthRate;
    private addToRevenueHistory;
    private generateInsights;
    private checkAlerts;
    private calculateRevenueProjection;
    private getAllModels;
}
export default PricingDashboard;
//# sourceMappingURL=PricingDashboard.d.ts.map