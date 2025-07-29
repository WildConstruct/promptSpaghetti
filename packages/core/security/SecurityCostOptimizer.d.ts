/**
 * Security Analytics Cost Optimization and Monitoring System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263633-8EC097
 *
 * Comprehensive cost optimization and monitoring for security analytics systems,
 * ensuring efficient resource utilization and cost-effective operations.
 */
import { EventEmitter } from 'events';

export interface CostCenter {
    id: string;
    name: string;
    description: string;
    department: string;
    allocation: {
        budget_monthly: number;
        budget_yearly: number;
        currency: string;
        cost_allocation_method: 'usage_based' | 'fixed' | 'weighted' | 'hybrid';
        allocation_weights: {
            compute: number;
            storage: number;
            network: number;
            licensing: number;
            personnel: number;
        };
    };
    tracking: {
        track_by_service: boolean;
        track_by_user: boolean;
        track_by_project: boolean;
        granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
        retention_days: number;
    };
    controls: {
        spending_limits: {
            daily_limit: number;
            weekly_limit: number;
            monthly_limit: number;
            auto_shutdown_on_limit: boolean;
        };
        approval_thresholds: {
            minor_threshold: number;
            major_threshold: number;
            critical_threshold: number;
        };
        cost_alerts: CostAlert[];
    };
    reporting: {
        automated_reports: boolean;
        report_frequency: 'daily' | 'weekly' | 'monthly';
        report_recipients: string[];
        include_recommendations: boolean;
        include_trending: boolean;
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    active: boolean;

export interface CostAlert {
    id: string;
    name: string;
    description: string;
    type: 'threshold' | 'anomaly' | 'trend' | 'budget_variance';
    conditions: {
        threshold?: {
            amount: number;
            percentage?: number;
            period: 'hourly' | 'daily' | 'weekly' | 'monthly';
            comparison: 'greater_than' | 'less_than' | 'percentage_increase'
  };
        anomaly?: {
            sensitivity: 'low' | 'medium' | 'high';
            historical_period_days: number;
            deviation_threshold: number;
        };
        trend?: {
            period_days: number;
            trend_direction: 'increasing' | 'decreasing';
            trend_threshold_percentage: number;
        };
        budget?: {
            variance_threshold_percentage: number;
            forecast_period_days: number;
        };
    };
    notifications: {
        channels: ('email' | 'slack' | 'webhook' | 'sms')[];
        recipients: string[];
        escalation_enabled: boolean;
        escalation_delay_minutes: number;
        escalation_recipients: string[];
        suppress_duplicates_minutes: number;
    };
    actions: {
        auto_actions: AutoCostAction[];
        manual_actions: string[];
        recommendation_actions: string[];
    };
    enabled: boolean;
    created_at: number;
    last_triggered?: number;
    trigger_count: number;

export interface AutoCostAction {
    id: string;
    name: string;
    type: 'scale_down' | 'shutdown' | 'migrate' | 'optimize' | 'notify' | 'throttle';
    description: string;
    parameters: {
        target_resources?: string[];
        scaling_factor?: number;
        delay_minutes?: number;
        confirmation_required?: boolean;
        rollback_conditions?: string[];
        max_executions_per_day?: number;
    };
    safety: {
        require_approval: boolean;
        dry_run_mode: boolean;
        business_hours_only: boolean;
        excluded_services: string[];
        minimum_capacity_percentage: number;
    };
    execution: {
        last_executed?: number;
        execution_count: number;
        success_count: number;
        failure_count: number;
        average_savings: number;
    };
    enabled: boolean;
    created_at: number;

export interface CostMetrics {
    id: string;
    cost_center_id: string;
    collection_period: {
        start: number;
        end: number;
        granularity: 'hourly' | 'daily' | 'weekly' | 'monthly'
  };
    costs: {
        total_cost: number;
        compute_cost: number;
        storage_cost: number;
        network_cost: number;
        licensing_cost: number;
        personnel_cost: number;
        miscellaneous_cost: number;
        currency: string;
    };
    utilization: {
        compute_utilization: number;
        storage_utilization: number;
        network_utilization: number;
        peak_utilization: number;
        average_utilization: number;
        idle_resource_cost: number;
    };
    efficiency: {
        cost_per_request: number;
        cost_per_user: number;
        cost_per_gb_processed: number;
        cost_per_alert_generated: number;
        efficiency_score: number;
        waste_percentage: number;
    };
    trends: {
        cost_trend_percentage: number;
        utilization_trend_percentage: number;
        efficiency_trend_percentage: number;
        forecasted_monthly_cost: number;
        forecasted_yearly_cost: number;
    };
    services: Array<{,
        service_name: string;
        cost: number;
        percentage: number;
        utilization: number;
        instances: number;
        cost_per_instance: number;
    }>;
    user_costs?: Array<{
        user_id: string;
        cost: number;
        requests: number;
        cost_per_request: number;
    }>;
    project_costs?: Array<{
        project_id: string;
        cost: number;
        resources: number;
        cost_per_resource: number;
    }>;
    collected_at: number;
    collection_method: 'automated' | 'manual';

export interface CostOptimizationRecommendation {
    id: string;
    title: string;
    description: string;
    category: 'resource_rightsizing' | 'reserved_instances' | 'spot_instances' | 'storage_optimization' | 'network_optimization' | 'licensing' | 'automation';
    priority: 'low' | 'medium' | 'high' | 'critical';
    cost_impact: {
        current_monthly_cost: number;
        projected_monthly_cost: number;
        estimated_savings_monthly: number;
        estimated_savings_yearly: number;
        savings_percentage: number;
        payback_period_months: number;
    };
    implementation: {
        complexity: 'low' | 'medium' | 'high';
        estimated_hours: number;
        required_skills: string[];
        prerequisites: string[];
        implementation_steps: string[];
        risks: string[];
        rollback_plan: string;
    };
    impact: {
        performance_impact: 'positive' | 'neutral' | 'negative';
        availability_impact: 'positive' | 'neutral' | 'negative';
        security_impact: 'positive' | 'neutral' | 'negative';
        operational_impact: 'positive' | 'neutral' | 'negative';
        impact_details: string;
    };
    validation: {
        testing_required: boolean;
        pilot_recommended: boolean;
        success_metrics: string[];
        monitoring_required: string[];
    };
    status: 'identified' | 'approved' | 'in_progress' | 'implemented' | 'rejected' | 'deferred';
    assigned_to?: string;
    due_date?: number;
    implemented_date?: number;
    actual_savings?: number;
    created_at: number;
    last_updated: number;

export interface CostBudget {
    id: string;
    name: string;
    description: string;
    cost_center_id: string;
    budget: {
        amount: number;
        currency: string;
        period: 'monthly' | 'quarterly' | 'yearly';
        start_date: number;
        end_date: number;
        rollover_unused: boolean;
    };
    allocation: {
        services: Array<{,
            service_name: string;
            allocated_amount: number;
            allocated_percentage: number;
            flexible: boolean;
        }>;
        categories: Array<{,
            category: 'compute' | 'storage' | 'network' | 'licensing' | 'personnel';
            allocated_amount: number;
            allocated_percentage: number;
        }>;
        contingency_percentage: number;
    };
    spending: {
        total_spent: number;
        remaining_budget: number;
        utilization_percentage: number;
        projected_spending: number;
        projected_overage: number;
        burn_rate: number;
    };
    controls: {
        auto_approval_limit: number;
        require_approval_above: number;
        hard_limit_enabled: boolean;
        hard_limit_amount: number;
        alert_thresholds: number[];
    };
    variance: {
        vs_planned_amount: number;
        vs_planned_percentage: number;
        vs_previous_period_amount: number;
        vs_previous_period_percentage: number;
        variance_reasons: string[];
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    active: boolean;

export interface CostReport {
    id: string;
    title: string;
    report_type: 'cost_summary' | 'utilization_analysis' | 'optimization_opportunities' | 'budget_variance' | 'trending_analysis';
    cost_center_id: string;
    period: {
        start: number;
        end: number;
        comparison_period_start?: number;
        comparison_period_end?: number;
    };
    summary: {
        total_cost: number;
        cost_change_percentage: number;
        utilization_average: number;
        efficiency_score: number;
        top_cost_drivers: string[];
        key_insights: string[];
        critical_recommendations: number;
    };
    analysis: {
        cost_breakdown: Array<{,
            category: string;
            current_cost: number;
            previous_cost: number;
            change_amount: number;
            change_percentage: number;
        }>;
        utilization_analysis: Array<{,
            service: string;
            utilization: number;
            cost: number;
            efficiency_rating: 'excellent' | 'good' | 'fair' | 'poor';
            optimization_potential: number;
        }>;
        trending_data: Array<{,
            metric: string;
            current_value: number;
            trend_direction: 'up' | 'down' | 'stable';
            trend_percentage: number;
            forecasted_value: number;
        }>;
    };
    recommendations: {
        immediate_actions: CostOptimizationRecommendation[];
        short_term_opportunities: CostOptimizationRecommendation[];
        long_term_strategies: CostOptimizationRecommendation[];
        total_potential_savings: number;
    };
    budget_analysis?: {
        budget_utilization: number;
        variance_amount: number;
        variance_percentage: number;
        projected_year_end: number;
        budget_health: 'on_track' | 'at_risk' | 'over_budget'
  };
    generated_by: string;
    generated_at: number;
    recipients?: string[];
    status: 'draft' | 'published' | 'archived';

export interface CostEvent {
    id: string;
    type: 'threshold_exceeded' | 'anomaly_detected' | 'budget_alert' | 'optimization_applied' | 'cost_spike' | 'efficiency_improvement';
    severity: 'info' | 'warning' | 'error' | 'critical';
    source: string;
    timestamp: number;
    title: string;
    description: string;
    cost_center_id: string;
    affected_services: string[];
    cost_impact: {
        amount: number;
        percentage: number;
        currency: string;
        period: string;
    };
    data: {
        threshold_value?: number;
        actual_value?: number;
        anomaly_score?: number;
        trend_data?: Record<string, number>;
        recommendations?: string[];
    };
    response: {
        acknowledged: boolean;
        acknowledged_by?: string;
        acknowledged_at?: number;
        actions_taken: string[];
        resolution_notes?: string;
        resolved_at?: number;
    };
    follow_up: {
        monitoring_required: boolean;
        review_date?: number;
        escalation_required: boolean;
        related_events: string[];
    };

export declare class SecurityCostOptimizer extends EventEmitter {
    private costCenters;
    private costAlerts;
    private metrics;
    private recommendations;
    private budgets;
    private reports;
    private events;
    private optimizationActions;
    private optimizationHistory;
    private metricsCollectionInterval?;
    private costMonitoringInterval?;
    private optimizationInterval?;
    private reportGenerationInterval?;
    constructor();
    createCostCenter(costCenter: Omit<CostCenter, 'id' | 'created_at' | 'last_updated'>): Promise<string>;
    createCostAlert(alert: Omit<CostAlert, 'id' | 'created_at' | 'trigger_count'>): Promise<string>;
    collectCostMetrics(costCenterId: string): Promise<string>;
    private generateRealisticCost;
    private calculateEfficiencyScore;
    private generateServiceBreakdown;
    private generateUserCostBreakdown;
    private generateProjectCostBreakdown;
    private evaluateCostAlerts;
    private evaluateAlert;
    private evaluateThresholdAlert;
    private evaluateAnomalyAlert;
    private evaluateTrendAlert;
    private evaluateBudgetAlert;
    private triggerCostAlert;
    private mapAlertTypeToEventType;
    private determineSeverity;
    private generateAlertRecommendations;
    private executeAutoAction;
    private executeScaleDownAction;
    private executeShutdownAction;
    private executeOptimizeAction;
    private executeThrottleAction;
    private executeNotifyAction;
    private isBusinessHours;
    private generateOptimizationRecommendations;
    private createResourceRightsizingRecommendation;
    private createStorageOptimizationRecommendation;
    private createReservedInstanceRecommendation;
    private createLicensingOptimizationRecommendation;
    generateCostReport(costCenterId: string, reportType: CostReport['report_type'], period: {)
        start: number;
        end: number;
    }): Promise<string>;
    private generateReportInsights;
    private generateCostBreakdownAnalysis;
    private generateUtilizationAnalysis;
    private rateEfficiency;
    private calculateOptimizationPotential;
    private generateTrendingAnalysis;
    private sendCostNotifications;
    private sendNotification;
    private sendEscalationNotification;
    private createCostNotificationMessage;
    private sendCostReport;
    private createReportSummaryMessage;
    getCostStatus(): {
        cost_centers: number;
        active_alerts: number;
        total_monthly_cost: number;
        total_potential_savings: number;
        efficiency_score: number;
        recent_events: CostEvent[];
        top_cost_drivers: Array<{,
            name: string;
            cost: number;
            percentage: number;
        }>;
    };
    private createDefaultCostAlertsForCenter;
    private initializeDefaultCostCenters;
    private startCostMonitoring;
    private startMetricsCollection;
    private startOptimizationEngine;
    private startReportGeneration;
    private updateSystemMetrics;
    private runOptimizationAnalysis;
    private generateScheduledReports;
    getCostCenters(): CostCenter[];
    getCostAlerts(): CostAlert[];
    getOptimizationRecommendations(): CostOptimizationRecommendation[];
    getCostReports(): CostReport[];
    getCostEvents(): CostEvent[];
    exportConfiguration(): Promise<string>;
    importConfiguration(configJson: string): Promise<void>;
    shutdown(): void;

export default SecurityCostOptimizer;
//# sourceMappingURL=SecurityCostOptimizer.d.ts.map