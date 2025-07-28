/**
 * KPI Monitoring Service for Epic 18
 * Real-time monitoring and alerting system for performance KPIs
 */
import { EventEmitter } from 'events';
import { KPIDefinition } from './PerformanceKPIs';
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
    recommendations: string;
    timestamp: number;
    acknowledged: boolean;
}
export interface KPIMonitoringConfig {
    monitoringInterval: number;
    alertingEnabled: boolean;
    alertThresholds: {
        critical: number;
        consecutive: number;
        degradationThreshold: number;
    };
    kpiFilters: {
        categories: string;
        priorities: string;
        enabled: string;
    };
    baseline: {
        autoCapture: boolean;
        captureInterval: number;
        retentionPeriod: number;
    };
    reporting: {
        enabled: boolean;
        interval: number;
        includeRecommendations: boolean;
        emailRecipients: string;
    };
}
export interface KPITrendAnalysis {
    kpiId: string;
    trend: 'improving' | 'stable' | 'degrading';
    changePercent: number;
    periodDays: number;
    significance: 'minor' | 'moderate' | 'major';
    projection: {
        nextWeek: number;
        nextMonth: number;
        confidence: number;
    };
}
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
    kpi: KPIDefinition;
    type: 'status_violation' | 'trend_degradation' | 'consecutive_violations';
    Promise(): any;
}
//# sourceMappingURL=KPIMonitoringService.d.ts.map