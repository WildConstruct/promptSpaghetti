/**
 * KPI Monitoring Service for Epic 18
 * Real-time monitoring and alerting system for performance KPIs
 */
import { EventEmitter } from 'events';
import { KPISnapshot } from './PerformanceKPIs';
import { BaselineSnapshot } from './PerformanceBaseline';
export interface KPIAlert {
    id: string;
    kpiId: string;
    kpiName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'excellent' | 'good' | 'warning' | 'critical';
    value: number;
    target: number;
    threshold: number;
    trend: 'improving' | 'stable' | 'degrading';
    message: string;
    recommendations: string[];
    timestamp: number;
    acknowledged: boolean;
}
export interface KPIMonitoringConfig {
    monitoringInterval: number;
    alertingEnabled: boolean;
    alertThresholds: {,
        critical: number;
        consecutive: number;
        degradationThreshold: number;
    };
    kpiFilters: {,
        categories: string[];
        priorities: string[];
        enabled: string[];
    };
    baseline: {,
        autoCapture: boolean;
        captureInterval: number;
        retentionPeriod: number;
    };
    reporting: {,
        enabled: boolean;
        interval: number;
        includeRecommendations: boolean;
        emailRecipients: string[];
    };
}
export interface KPITrendAnalysis {
    kpiId: string;
    trend: 'improving' | 'stable' | 'degrading';
    changePercent: number;
    periodDays: number;
    significance: 'minor' | 'moderate' | 'major';
    projection: {,
        nextWeek: number;
        nextMonth: number;
        confidence: number;
    };
}
/**
 * KPI Monitoring Service
 * Provides real-time monitoring, alerting, and trend analysis for performance KPIs
 */
export declare class KPIMonitoringService extends EventEmitter {
    private config;
    private baseline;
    private dashboard;
    private alerts;
    private kpiHistory;
    private isMonitoring;
    private monitoringInterval?;
    private baselineInterval?;
    private reportingInterval?;
    constructor(config?: Partial<KPIMonitoringConfig>);
    /**
     * Start KPI monitoring
     */
    startMonitoring(): Promise<void>;
    /**
     * Stop KPI monitoring
     */
    stopMonitoring(): void;
    /**
     * Perform a monitoring cycle
     */
    private performMonitoringCycle;
    /**
     * Process a KPI snapshot and generate alerts if needed
     */
    private processKPISnapshot;
    /**
     * Check alerting conditions for a KPI snapshot
     */
    private checkAlertingConditions;
    /**
     * Create a KPI alert
     */
    private createKPIAlert;
    /**
     * Analyze trend for a KPI
     */
    private analyzeTrend;
    /**
     * Get filtered KPIs based on configuration
     */
    private getFilteredKPIs;
    /**
     * Clean up old data
     */
    private cleanupOldData;
    /**
     * Capture scheduled baseline
     */
    private captureScheduledBaseline;
    /**
     * Generate scheduled report
     */
    private generateScheduledReport;
    /**
     * Generate comprehensive KPI report
     */
    generateKPIReport(): {
        timestamp: number;
        summary: {,
            totalKPIs: number;
            monitoredKPIs: number;
            alertsActive: number;
            averageScore: number;
        };
        kpiStatus: Array<{,
            kpiId: string;
            name: string;
            category: string;
            status: string;
            value: number;
            target: number;
            trend: string;
        }>;
        alerts: KPIAlert[];
        trends: KPITrendAnalysis[];
        recommendations: string[];
    };
    private calculateAverageKPIScore;
    private generateSystemRecommendations;
    private setupEventHandlers;
    /**
     * Get current KPI status
     */
    getCurrentKPIStatus(): Array<{
        kpiId: string;
        status: string;
        value: number;
        trend: string;
    }>;
    /**
     * Get active alerts
     */
    getActiveAlerts(): KPIAlert[];
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Get KPI history
     */
    getKPIHistory(kpiId: string, limit?: number): KPISnapshot[];
    /**
     * Get trend analysis for a KPI
     */
    getKPITrend(kpiId: string): KPITrendAnalysis;
    /**
     * Update monitoring configuration
     */
    updateConfig(newConfig: Partial<KPIMonitoringConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): KPIMonitoringConfig;
    /**
     * Force immediate monitoring cycle
     */
    triggerMonitoringCycle(): Promise<void>;
    /**
     * Export monitoring data
     */
    exportData(): {
        config: KPIMonitoringConfig;
        alerts: KPIAlert[];
        kpiHistory: Record<string, KPISnapshot[]>;
        baselines: BaselineSnapshot[];
    };
    /**
     * Get monitoring status
     */
    getMonitoringStatus(): {
        isRunning: boolean;
        uptime: number;
        kpisMonitored: number;
        activeAlerts: number;
        lastCycle?: number;
    };
}
export default KPIMonitoringService;
//# sourceMappingURL=KPIMonitoringService.d.ts.map