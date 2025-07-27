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
        threatTrends: Array<{
            timestamp: Date;
            level: ThreatLevel;
            confidence: number;
            indicators: string[];
        }>;
        attackPatterns: Array<{
            patternId: string;
            patternType: 'brute_force' | 'ddos' | 'credential_stuffing' | 'bot_activity' | 'anomalous_behavior';
            frequency: number;
            severity: 'low' | 'medium' | 'high' | 'critical';
            firstSeen: Date;
            lastSeen: Date;
            affectedEndpoints: string[];
            sourceIPs: string[];
            countermeasures: string[];
        }>;
        geographicThreats: Array<{
            country: string;
            region: string;
            threatCount: number;
            threatLevel: ThreatLevel;
            suspiciousActivities: string[];
        }>;
    };
    performanceAnalytics: {
        systemHealth: {
            overallScore: number;
            componentScores: {
                rateLimiting: number;
                throttling: number;
                dataProcessing: number;
                alerting: number;
            };
            degradationFactors: Array<{
                factor: string;
                impact: number;
                recommendation: string;
            }>;
        };
        capacityAnalysis: {
            currentCapacity: number;
            peakCapacity: number;
            averageUtilization: number;
            bottlenecks: Array<{
                component: string;
                utilizationLevel: number;
                impactScore: number;
                scalingRecommendation: string;
            }>;
        };
        slaCompliance: {
            responseTimeSLA: {
                target: number;
                current: number;
                compliance: number;
                violations: number;
            };
            availabilitySLA: {
                target: number;
                current: number;
                downtime: number;
                incidents: number;
            };
            throughputSLA: {
                target: number;
                current: number;
                compliance: number;
            };
        };
    };
    businessIntelligence: {
        userBehaviorAnalytics: Array<{
            segment: string;
            userCount: number;
            avgSessionDuration: number;
            requestPatterns: Record<string, number>;
            conversionRate: number;
            riskScore: number;
        }>;
        endpointAnalytics: Array<{
            endpoint: string;
            totalRequests: number;
            uniqueUsers: number;
            averageResponseTime: number;
            errorRate: number;
            businessValue: number;
            optimizationPotential: number;
        }>;
        revenueImpact: {
            totalRequests: number;
            blockedRequests: number;
            estimatedRevenueLoss: number;
            falsePositiveImpact: number;
            securityROI: number;
        };
    };
}
export interface PredictiveInsights {
    threatPredictions: Array<{
        predictionId: string;
        predictedThreatType: string;
        probability: number;
        timeframe: string;
        impactEstimate: 'low' | 'medium' | 'high' | 'critical';
        recommendedActions: string[];
        modelConfidence: number;
    }>;
    capacityForecasts: Array<{
        forecastId: string;
        metric: 'cpu' | 'memory' | 'throughput' | 'connections';
        currentValue: number;
        predictedValue: number;
        forecastHorizon: number;
        confidence: number;
        scalingRecommendation: string;
    }>;
    anomalyDetections: Array<{
        anomalyId: string;
        anomalyType: 'statistical' | 'behavioral' | 'temporal' | 'pattern-based';
        description: string;
        severity: number;
        affectedMetrics: string[];
        detectionTime: Date;
        possibleCauses: string[];
        investigationSteps: string[];
    }>;
}
export interface DashboardVisualization {
    chartConfigurations: Array<{
        chartId: string;
        chartType: 'line' | 'bar' | 'pie' | 'heatmap' | 'gauge' | 'scatter' | 'waterfall';
        title: string;
        dataSource: string;
        refreshInterval: number;
        interactivity: {
            drillDown: boolean;
            filtering: boolean;
            timeRangeSelector: boolean;
            exportOptions: string[];
        };
        styling: {
            colorScheme: string;
            theme: 'light' | 'dark' | 'auto';
            dimensions: {
                width: number;
                height: number;
            };
        };
    }>;
    alertPanels: Array<{
        panelId: string;
        alertType: 'security' | 'performance' | 'business';
        severity: 'info' | 'warning' | 'error' | 'critical';
        message: string;
        timestamp: Date;
        actionable: boolean;
        quickActions: string[];
    }>;
    keyMetrics: Array<{
        metricId: string;
        displayName: string;
        currentValue: number | string;
        unit?: string;
        trend: 'up' | 'down' | 'stable';
        changePercent: number;
        status: 'good' | 'warning' | 'critical';
        target?: number;
    }>;
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
    constructor(rateLimitingService: RateLimitingService, throttlingEngine?: AdaptiveThrottlingRulesEngine, performanceMetrics?: RateLimitingPerformanceMetrics, config?: Partial<AnalyticsDashboardConfig>);
    /**
     * Start the analytics processing engine
     */
    startAnalyticsProcessing(): void;
    /**
     * Stop analytics processing
     */
    stopAnalyticsProcessing(): void;
    /**
     * Main analytics processing function
     */
    private processAnalytics;
    /**
     * Update security analytics data
     */
    private updateSecurityAnalytics;
    /**
     * Calculate current overall threat level
     */
    private calculateCurrentThreatLevel;
    /**
     * Analyze threat trends over time
     */
    private analyzeThreatTrends;
    /**
     * Detect attack patterns
     */
    private detectAttackPatterns;
    /**
     * Analyze geographic threat distribution
     */
    private analyzeGeographicThreats;
    /**
     * Update performance analytics
     */
    private updatePerformanceAnalytics;
    /**
     * Calculate system health scores
     */
    private calculateSystemHealth;
    /**
     * Analyze system capacity
     */
    private analyzeCapacity;
    /**
     * Calculate SLA compliance
     */
    private calculateSLACompliance;
    /**
     * Update business intelligence analytics
     */
    private updateBusinessIntelligence;
    /**
     * Analyze user behavior patterns
     */
    private analyzeUserBehavior;
    /**
     * Analyze endpoint performance and business metrics
     */
    private analyzeEndpoints;
    /**
     * Calculate revenue impact of security measures
     */
    private calculateRevenueImpact;
    /**
     * Update predictive insights
     */
    private updatePredictiveInsights;
    /**
     * Generate threat predictions using ML models
     */
    private generateThreatPredictions;
    /**
     * Generate capacity forecasts
     */
    private generateCapacityForecasts;
    /**
     * Detect anomalies in system behavior
     */
    private detectAnomalies;
    /**
     * Run anomaly detection algorithms
     */
    private runAnomalyDetection;
    /**
     * Update dashboard visualization configurations
     */
    private updateDashboardVisualization;
    /**
     * Generate chart configurations for visualization
     */
    private generateChartConfigurations;
    /**
     * Generate alert panels
     */
    private generateAlertPanels;
    /**
     * Generate key metrics for dashboard
     */
    private generateKeyMetrics;
    /**
     * Store historical data for trend analysis
     */
    private storeHistoricalData;
    /**
     * Get historical data for analysis
     */
    getHistoricalData(dataType: string): unknown[];
    /**
     * Update machine learning models
     */
    private updateMachineLearningModels;
    /**
     * Get current security analytics
     */
    getSecurityAnalytics(): SecurityAnalytics;
    /**
     * Get current predictive insights
     */
    getPredictiveInsights(): PredictiveInsights;
    /**
     * Get dashboard visualization configuration
     */
    getDashboardVisualization(): DashboardVisualization;
    /**
     * Get comprehensive analytics summary
     */
    getAnalyticsSummary(): {
        securityAnalytics: SecurityAnalytics;
        predictiveInsights: PredictiveInsights;
        dashboardVisualization: DashboardVisualization;
        systemStatus: {
            uptime: number;
            processingStatus: 'active' | 'inactive';
            lastUpdate: Date;
            dataRetention: number;
        };
    };
    /**
     * Initialize security analytics structure
     */
    private initializeSecurityAnalytics;
    /**
     * Initialize predictive insights structure
     */
    private initializePredictiveInsights;
    /**
     * Initialize dashboard visualization structure
     */
    private initializeDashboardVisualization;
    /**
     * Setup event listeners for external services
     */
    private setupEventListeners;
    /**
     * Generate threat indicators
     */
    private generateThreatIndicators;
    /**
     * Get total data points count
     */
    private getDataPointsCount;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export default RateLimitingAnalyticsDashboard;
//# sourceMappingURL=RateLimitingAnalyticsDashboard.d.ts.map