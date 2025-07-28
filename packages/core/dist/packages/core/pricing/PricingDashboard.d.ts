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
    seasonalTrends: Array<{}, period>;
    string: any;
    revenue: number;
    growth: number;
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
    actionItems: string;
    dataPoints: Array<{}, metric>;
    string: any;
    current: number;
    previous: number;
    change: number;
}
export interface RevenueProjection {
    period: '1_month' | '3_months' | '6_months' | '1_year';
    projectedRevenue: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    assumptions: string;
    keyFactors: Array<{}>;
    factor: string;
    impact: number;
    confidence: number;
}
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
}
//# sourceMappingURL=PricingDashboard.d.ts.map