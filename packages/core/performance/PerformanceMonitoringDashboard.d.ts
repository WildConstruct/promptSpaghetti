/**
 * Performance Monitoring Dashboard for Epic 18
 * Real-time performance monitoring and budget enforcement
 */
import { EventEmitter } from 'events';
import { PerformanceSnapshot, BudgetCheckResult } from './PerformanceBudget';

}
}
export interface DashboardConfig { updateInterval: number;
    historyLimit: number;
    alertThresholds: {
        violations: number;
        score: number }
}
    };
    autoOptimize: boolean;
    reporting: { enabled: boolean;
        interval: number;
        recipients: string[] };

}
}
export interface DashboardData { timestamp: number;
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    budgetResult: BudgetCheckResult;
    snapshot: PerformanceSnapshot;
    trends: {
        score: number[];
        violations: number[];
        bundleSize: number[];
        memoryUsage: number[];
        apiLatency: number[] }
}
    };
    alerts: DashboardAlert[];

}
}
export interface DashboardAlert { id: string;
    type: 'budget-violation' | 'performance-degradation' | 'system-health' | 'optimization-suggestion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: number;
    acknowledged: boolean;
    autoResolvable: boolean;
    actions: AlertAction[] }
}
}
export interface AlertAction { id: string;
    label: string;
    type: 'optimize' | 'ignore' | 'investigate' | 'escalate';
    description: string;
    automated: boolean }
}
}
export interface OptimizationSuggestion { id: string;
    category: 'bundle' | 'runtime' | 'api' | 'memory' | 'network' | 'build';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    estimatedImpact: {
        scoreImprovement: number;
        sizeReduction?: number;
        timeReduction?: number }
}
    };
    implementation: { effort: 'low' | 'medium' | 'high';
        steps: string[];
        codeExample?: string };
    metrics: string[];
/**
 * Performance Monitoring Dashboard
 * Centralized performance monitoring and optimization management
 */
export declare class PerformanceMonitoringDashboard extends EventEmitter {
    private budgetManager;
    private config;
    private snapshots;
    private alerts;
    private isMonitoring;
    private monitoringInterval?;
    private reportingInterval?;
    constructor(config?: Partial<DashboardConfig>);
    /**
     * Start performance monitoring
     */
    startMonitoring(): void;
    /**
     * Stop performance monitoring
     */
    stopMonitoring(): void;
    /**
     * Capture current performance snapshot
     */
    capturePerformanceSnapshot(): Promise<PerformanceSnapshot>;
    /**
     * Get current dashboard data
     */
    getDashboardData(): DashboardData;
    /**
     * Get optimization suggestions
     */
    getOptimizationSuggestions(): OptimizationSuggestion[];
    /**
     * Apply automatic optimization
     */
    applyOptimization(suggestionId: string): Promise<boolean>;
    private getBundleMetrics;
    private getRuntimeMetrics;
    private getApiMetrics;
    private getMemoryMetrics;
    private getNetworkMetrics;
    private setupBudgetManagerListeners;
    private processAlerts;
    private createAlert;
    private getScoreImprovementActions;
    private calculateSystemStatus;
    private getActiveAlerts;
    private getScoreTrend;
    private generatePerformanceReport;
    private applyBundleSplitting;
    private applyMemoryOptimization;
    private applyApiOptimization;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Get performance budget configuration
     */
    getBudgetConfig(): import("./PerformanceBudget").PerformanceBudgetConfig;
    /**
     * Update performance budget
     */
    updateBudget(newConfig: any): void;

export default PerformanceMonitoringDashboard;
//# sourceMappingURL=PerformanceMonitoringDashboard.d.ts.map