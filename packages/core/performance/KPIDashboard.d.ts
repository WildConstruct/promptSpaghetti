/**
 * KPI Dashboard for Epic 18
 * Real-time visualization and reporting system for performance KPIs
 */
import { EventEmitter } from 'events';
import { KPIMonitoringService, KPITrendAnalysis } from './KPIMonitoringService';
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
    widgets: DashboardWidget[];
    columns: number;
    autoRefresh: boolean;
    refreshInterval: number;
}
export interface DashboardMetrics {
    overview: {,
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
        healthy: number;
        warning: number;
        critical: number;
        averageScore: number;
    }>;
    alerts: {,
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        acknowledged: number;
    };
    trends: {,
        improving: KPITrendAnalysis[];
        degrading: KPITrendAnalysis[];
        stable: KPITrendAnalysis[];
    };
}
export interface DashboardReport {
    id: string;
    timestamp: number;
    type: 'summary' | 'detailed' | 'trend' | 'alert';
    period: {,
        start: number;
        end: number;
        duration: string;
    };
    metrics: DashboardMetrics;
    insights: {,
        keyFindings: string[];
        recommendations: string[];
        riskAreas: string[];
        improvements: string[];
    };
    charts: {,
        performanceScore: Array<{,
            timestamp: number;
            score: number;
        }>;
        categoryBreakdown: Record<string, number>;
        alertsOverTime: Array<{,
            timestamp: number;
            count: number;
            severity: string;
        }>;
        topKPIs: Array<{,
            kpiId: string;
            name: string;
            score: number;
            trend: string;
        }>;
    };
}
/**
 * KPI Dashboard Service
 * Provides comprehensive dashboard functionality for performance monitoring
 */
export declare class KPIDashboard extends EventEmitter {
    private monitoringService;
    private baseline;
    private layouts;
    private reports;
    private config;
    private refreshIntervals;
    constructor();
      monitoringService: KPIMonitoringService,
      baseline: PerformanceBaseline,
      config?: PerformanceTargetConfig
    );
    /**
     * Setup default dashboard layouts
     */
    private setupDefaultLayouts;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Get dashboard layout
     */
    getDashboardLayout(layoutId: string): DashboardLayout | null;
    /**
     * Get all available layouts
     */
    getAvailableLayouts(): DashboardLayout[];
    /**
     * Get dashboard metrics
     */
    getDashboardMetrics(): DashboardMetrics;
    /**
     * Generate comprehensive dashboard report
     */
    generateDashboardReport(type?: DashboardReport['type'], periodHours?: number): DashboardReport;
    /**
     * Generate insights for dashboard report
     */
    private generateInsights;
    /**
     * Calculate score for a baseline
     */
    private calculateBaselineScore;
    /**
     * Convert status to numeric score
     */
    private statusToScore;
    /**
     * Generate alert timeline data
     */
    private generateAlertTimelineData;
    /**
     * Calculate average score from KPI status array
     */
    private calculateAverageScore;
    /**
     * Refresh dashboard data for all widgets
     */
    private refreshDashboardData;
    /**
     * Refresh alert-specific widgets
     */
    private refreshAlertWidgets;
    /**
     * Get widget data
     */
    getWidgetData(layoutId: string, widgetId: string): any;
    /**
     * Generate data for a specific widget
     */
    private generateWidgetData;
    private generateGaugeData;
    private generateMetricData;
    private generateTableData;
    private generateAlertData;
    private generateTrendData;
    /**
     * Start auto-refresh for a layout
     */
    startAutoRefresh(layoutId: string): void;
    /**
     * Stop auto-refresh for a layout
     */
    stopAutoRefresh(layoutId: string): void;
    /**
     * Export dashboard configuration
     */
    exportDashboardConfig(): string;
    /**
     * Import dashboard configuration
     */
    importDashboardConfig(configJson: string): void;
    /**
     * Get dashboard reports
     */
    getDashboardReports(limit?: number): DashboardReport[];
    /**
     * Get specific dashboard report
     */
    getDashboardReport(reportId: string): DashboardReport | null;
    /**
     * Clear old reports
     */
    clearOldReports(retentionDays?: number): number;
}
export default KPIDashboard;
//# sourceMappingURL=KPIDashboard.d.ts.map