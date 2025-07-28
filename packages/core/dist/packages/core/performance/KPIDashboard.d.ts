/**
 * KPI Dashboard for Epic 18
 * Real-time visualization and reporting system for performance KPIs
 */
import { EventEmitter } from 'events';
import { KPIMonitoringService } from './KPIMonitoringService';
import { PerformanceBaseline } from './PerformanceBaseline';
import { PerformanceTargetConfig } from './PerformanceTargets';
export interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'alert' | 'trend' | 'gauge' | 'table';
    title: string;
    description: string;
    size: 'small' | 'medium' | 'large';
    config: Record<string, any>;
    data: any;
    refreshRate: number;
    lastUpdated: number;
}
export interface DashboardLayout {
    id: string;
    name: string;
    description: string;
    widgets: DashboardWidget;
    columns: number;
    autoRefresh: boolean;
    refreshInterval: number;
}
export interface DashboardMetrics {
    overview: {
        totalKPIs: number;
        monitoredKPIs: number;
        healthyKPIs: number;
        warningKPIs: number;
        criticalKPIs: number;
        averageScore: number;
        trendsImproving: number;
        trendsStable: number;
        trendsDegrading: number;
    };
    categories: Record<string, {
        total: number;
    }, healthy>;
    number: any;
    warning: number;
    critical: number;
    averageScore: number;
}
export interface DashboardReport {
    id: string;
    timestamp: number;
    type: 'summary' | 'detailed' | 'trend' | 'alert';
    period: {
        start: number;
        end: number;
        duration: string;
    };
    metrics: DashboardMetrics;
    insights: {
        keyFindings: string;
        recommendations: string;
        riskAreas: string;
        improvements: string;
    };
    charts: {
        performanceScore: Array<{
            timestamp: number;
            score: number;
        }>;
        categoryBreakdown: Record<string, number>;
        alertsOverTime: Array<{
            timestamp: number;
            count: number;
            severity: string;
        }>;
        topKPIs: Array<{
            kpiId: string;
            name: string;
            score: number;
            trend: string;
        }>;
    };
}
export declare class KPIDashboard extends EventEmitter {
    private monitoringService;
    private baseline;
    private layouts;
    private reports;
    private config;
    private refreshIntervals;
    constructor();
    monitoringService: KPIMonitoringService;
    baseline: PerformanceBaseline;
    config: PerformanceTargetConfig;
}
//# sourceMappingURL=KPIDashboard.d.ts.map