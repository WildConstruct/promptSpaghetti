/**
 * Rate Limiting Analytics Dashboard System
 * Task: E31-1753313263523-692B39 - Create rate limiting analytics dashboard
 * Epic 31: Security Intelligence Platform
 *
 * Advanced analytics dashboard that provides comprehensive security intelligence,
 * predictive analytics, and actionable insights for rate limiting systems.
 */
import { EventEmitter } from 'events';
import { RateLimitingService, ThreatLevel } from './RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from './AdaptiveThrottlingRules';
import { RateLimitingPerformanceMetrics } from './RateLimitingPerformanceMetrics';
export interface AnalyticsDashboardConfig {
    enableRealTimeAnalytics: boolean;
    enablePredictiveAnalytics: boolean;
    enableAnomalyDetection: boolean;
    enableThreatIntelligence: boolean;
    enableBusinessIntelligence: boolean;
    dataRetentionDays: number;
    analyticsProcessingInterval: number;
    mlModelUpdateInterval: number;
}
export interface SecurityAnalytics {
    threatAnalysis: {
        currentThreatLevel: ThreatLevel;
        threatTrends: Array<{}, timestamp>;
        Date: any;
        level: ThreatLevel;
        confidence: number;
        indicators: string;
    };
}
export interface PredictiveInsights {
    threatPredictions: Array<{}, predictionId>;
    string: any;
    predictedThreatType: string;
    probability: number;
    timeframe: string;
    impactEstimate: 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string;
    modelConfidence: number;
}
export interface DashboardVisualization {
    chartConfigurations: Array<{}, chartId>;
    string: any;
    chartType: 'line' | 'bar' | 'pie' | 'heatmap' | 'gauge' | 'scatter' | 'waterfall';
    title: string;
    dataSource: string;
    refreshInterval: number;
    interactivity: {
        drillDown: boolean;
        filtering: boolean;
        timeRangeSelector: boolean;
        exportOptions: string;
    };
    styling: {
        colorScheme: string;
        theme: 'light' | 'dark' | 'auto';
        dimensions: {
            width: number;
            height: number;
        };
    };
}
export declare class RateLimitingAnalyticsDashboard extends EventEmitter {
    private rateLimitingService;
    private throttlingEngine?;
    private performanceMetrics?;
    private config;
    private securityAnalytics;
    private predictiveInsights;
    private dashboardVisualization;
    private analyticsTimer?;
    private mlUpdateTimer?;
    private historicalData;
    private startTime;
    constructor();
    rateLimitingService: RateLimitingService;
    throttlingEngine?: AdaptiveThrottlingRulesEngine;
    performanceMetrics?: RateLimitingPerformanceMetrics;
    config?: Partial<AnalyticsDashboardConfig>;
    super(): any;
}
//# sourceMappingURL=RateLimitingAnalyticsDashboard.d.ts.map