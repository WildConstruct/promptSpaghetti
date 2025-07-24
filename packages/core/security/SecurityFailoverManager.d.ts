/**
 * Security Analytics System Failover and Redundancy Manager
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263640-F9DF75
 *
 * Enterprise-grade failover and redundancy management for security analytics systems,
 * ensuring continuous monitoring and zero-downtime operations.
 */
import { EventEmitter } from 'events';
export interface SecuritySystemNode {
    id: string;
    name: string;
    type: 'primary' | 'secondary' | 'standby';
    role: 'monitor' | 'analytics' | 'alerting' | 'storage' | 'processing' | 'dashboard';
    config: {
        hostname: string;
        port: number;
        region: string;
        datacenter: string;
        availability_zone: string;
        capacity: {
            cpu_cores: number;
            memory_gb: number;
            storage_gb: number;
            network_bandwidth_mbps: number;
        };
    };
    status: 'healthy' | 'degraded' | 'unhealthy' | 'offline' | 'maintenance';
    health: {
        last_heartbeat: number;
        response_time: number;
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
        network_latency: number;
        error_rate: number;
        throughput: number;
    };
    failover: {
        priority: number;
        auto_failover_enabled: boolean;
        failover_timeout: number;
        recovery_timeout: number;
        max_failover_attempts: number;
        current_failover_attempts: number;
        last_failover: number;
        manual_override: boolean;
    };
    load_balancing: {
        weight: number;
        max_connections: number;
        current_connections: number;
        request_queue_size: number;
        processing_capacity: number;
    };
    dependencies: string[];
    dependents: string[];
    cluster_group: string;
    created_at: number;
    last_updated: number;
    maintenance_window?: {
        start: number;
        end: number;
        description: string;
    };
}
export interface FailoverPolicy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    triggers: {
        node_failure: {
            enabled: boolean;
            consecutive_failed_checks: number;
            check_interval: number;
            timeout_threshold: number;
        };
        performance_degradation: {
            enabled: boolean;
            cpu_threshold: number;
            memory_threshold: number;
            response_time_threshold: number;
            error_rate_threshold: number;
            duration_threshold: number;
        };
        capacity_limits: {
            enabled: boolean;
            connection_threshold: number;
            queue_threshold: number;
            throughput_threshold: number;
        };
        dependency_failure: {
            enabled: boolean;
            cascade_failover: boolean;
            dependency_timeout: number;
        };
    };
    strategy: {
        type: 'immediate' | 'graceful' | 'planned';
        target_selection: 'priority' | 'load_based' | 'geographic' | 'round_robin';
        data_synchronization: 'real_time' | 'eventual' | 'manual';
        session_handling: 'preserve' | 'reset' | 'migrate';
        rollback_enabled: boolean;
        rollback_conditions: string[];
    };
    notifications: {
        immediate: string[];
        escalation: string[];
        escalation_delay: number;
        channels: ('email' | 'sms' | 'slack' | 'webhook')[];
    };
    compliance: {
        require_approval: boolean;
        audit_all_actions: boolean;
        retention_period: number;
        compliance_frameworks: string[];
    };
    created_by: string;
    created_at: number;
    last_modified: number;
}
export interface FailoverEvent {
    id: string;
    policy_id: string;
    trigger_type: 'manual' | 'automatic' | 'scheduled';
    source_node: SecuritySystemNode;
    target_node?: SecuritySystemNode;
    trigger_reason: string;
    trigger_conditions: Record<string, any>;
    timeline: FailoverTimelineEntry[];
    status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
    start_time: number;
    end_time?: number;
    duration?: number;
    impact: {
        affected_services: string[];
        downtime: number;
        data_loss: boolean;
        performance_impact: 'none' | 'minimal' | 'moderate' | 'significant';
        users_affected: number;
        transactions_lost: number;
    };
    results: {
        success: boolean;
        error_message?: string;
        data_synchronized: boolean;
        sessions_migrated: number;
        rollback_performed: boolean;
        recovery_time_objective_met: boolean;
        recovery_point_objective_met: boolean;
    };
    analysis: {
        root_cause: string;
        lessons_learned: string[];
        improvement_actions: string[];
        policy_adjustments: string[];
    };
    created_by: string;
}
export interface FailoverTimelineEntry {
    id: string;
    timestamp: number;
    phase: 'detection' | 'decision' | 'preparation' | 'execution' | 'verification' | 'completion' | 'rollback';
    action: string;
    status: 'started' | 'completed' | 'failed' | 'skipped';
    details: Record<string, any>;
    duration?: number;
    error_message?: string;
}
export interface RedundancyGroup {
    id: string;
    name: string;
    description: string;
    type: 'active_active' | 'active_passive' | 'master_slave' | 'multi_master';
    nodes: string[];
    primary_node?: string;
    config: {
        min_healthy_nodes: number;
        max_nodes: number;
        auto_scaling_enabled: boolean;
        data_replication: 'synchronous' | 'asynchronous' | 'semi_synchronous';
        consistency_level: 'strong' | 'eventual' | 'weak';
        partition_tolerance: boolean;
    };
    health: {
        overall_status: 'healthy' | 'degraded' | 'critical' | 'offline';
        healthy_nodes: number;
        degraded_nodes: number;
        offline_nodes: number;
        last_health_check: number;
        data_consistency_score: number;
        replication_lag: number;
    };
    load_distribution: {
        strategy: 'round_robin' | 'weighted' | 'least_connections' | 'resource_based';
        current_distribution: Record<string, number>;
        auto_rebalancing: boolean;
        rebalancing_threshold: number;
    };
    created_at: number;
    last_updated: number;
}
export interface FailoverMetrics {
    availability: {
        uptime_percentage: number;
        downtime_minutes: number;
        mean_time_between_failures: number;
        mean_time_to_recovery: number;
        availability_sla_compliance: number;
    };
    failover_performance: {
        total_failovers: number;
        successful_failovers: number;
        failed_failovers: number;
        average_failover_time: number;
        fastest_failover_time: number;
        slowest_failover_time: number;
        automatic_failovers: number;
        manual_failovers: number;
    };
    system_health: {
        healthy_nodes: number;
        total_nodes: number;
        degraded_nodes: number;
        offline_nodes: number;
        average_response_time: number;
        average_cpu_usage: number;
        average_memory_usage: number;
        error_rate: number;
    };
    data_consistency: {
        replication_lag: number;
        consistency_violations: number;
        data_loss_incidents: number;
        sync_success_rate: number;
    };
    compliance: {
        rto_compliance: number;
        rpo_compliance: number;
        audit_events: number;
        policy_violations: number;
    };
    time_range: {
        start: number;
        end: number;
    };
}
export interface FailoverConfig {
    enabled: boolean;
    default_failover_timeout: number;
    default_recovery_timeout: number;
    max_concurrent_failovers: number;
    health_check: {
        interval: number;
        timeout: number;
        retries: number;
        parallel_checks: boolean;
    };
    load_balancing: {
        enabled: boolean;
        algorithm: 'round_robin' | 'weighted' | 'least_connections' | 'resource_based';
        health_check_weight: number;
        performance_weight: number;
        capacity_weight: number;
    };
    data_sync: {
        mode: 'real_time' | 'periodic' | 'on_demand';
        sync_interval: number;
        consistency_check_interval: number;
        max_replication_lag: number;
    };
    notifications: {
        enabled: boolean;
        immediate_recipients: string[];
        escalation_recipients: string[];
        escalation_delay: number;
        notification_channels: string[];
    };
    performance: {
        max_cpu_usage: number;
        max_memory_usage: number;
        max_disk_usage: number;
        max_network_latency: number;
        resource_check_interval: number;
    };
    geographic: {
        multi_region_enabled: boolean;
        preferred_regions: string[];
        cross_region_latency_threshold: number;
        region_failover_enabled: boolean;
    };
    security: {
        encrypt_inter_node_communication: boolean;
        require_authentication: boolean;
        audit_all_failovers: boolean;
        compliance_mode: boolean;
    };
}
/**
 * Security Analytics System Failover Manager
 */
export declare class SecurityFailoverManager extends EventEmitter {
    private config;
    private nodes;
    private policies;
    private redundancyGroups;
    private failoverEvents;
    private activeFailovers;
    private healthCheckInterval?;
    private loadBalancingInterval?;
    private metricsCollectionInterval?;
    private metrics;
    private healthCheckResults;
    private loadBalancer;
    private connectionPools;
    constructor(config?: Partial<FailoverConfig>);
    /**
     * Initialize the failover management system
     */
    private initialize;
    /**
     * Register a security system node
     */
    registerNode(node: Omit<SecuritySystemNode, 'created_at' | 'last_updated'>): Promise<string>;
    /**
     * Register a failover policy
     */
    registerFailoverPolicy(policy: Omit<FailoverPolicy, 'id' | 'created_at' | 'last_modified'>): Promise<string>;
    /**
     * Create a redundancy group
     */
    createRedundancyGroup(group: Omit<RedundancyGroup, 'id' | 'created_at' | 'last_updated'>): Promise<string>;
    /**
     * Trigger manual failover
     */
    triggerFailover(sourceNodeId: string, targetNodeId?: string, reason?: string, policyId?: string): Promise<string>;
    /**
     * Get current system status
     */
    getSystemStatus(): {
        overall_health: 'healthy' | 'degraded' | 'critical';
        total_nodes: number;
        healthy_nodes: number;
        degraded_nodes: number;
        offline_nodes: number;
        active_failovers: number;
        redundancy_groups: number;
        load_distribution: Record<string, number>;
        recent_events: FailoverEvent[];
    };
    /**
     * Get failover metrics
     */
    getFailoverMetrics(): FailoverMetrics;
    /**
     * Get node health status
     */
    getNodeHealth(nodeId: string): SecuritySystemNode['health'] | null;
    /**
     * Route request to best available node
     */
    routeRequest(request: {
        type: 'query' | 'write' | 'analytics' | 'alert';
        priority: 'low' | 'normal' | 'high' | 'critical';
        size_estimate: number;
        timeout: number;
    }): Promise<string>;
    private executeFailover;
    private executeFailoverPhase;
    private prepareFailover;
    private performFailover;
    private verifyFailover;
    private completeFailover;
    private rollbackFailover;
    private selectFailoverTarget;
    private selectBestCandidate;
    private findBestFailoverPolicy;
    private startHealthMonitoring;
    private performAllHealthChecks;
    private performHealthCheck;
    private handleNodeFailure;
    private handleNodeRecovery;
    private shouldTriggerFailover;
    private startLoadBalancing;
    private updateLoadBalancingWeights;
    private calculateNodeHealthScore;
    private calculateNodePerformanceScore;
    private calculateNodeCapacityScore;
    private startMetricsCollection;
    private updateMetrics;
    private startNodeMonitoring;
    private configureGroupLoadBalancing;
    private startGroupMonitoring;
    private checkGroupHealth;
    private handleGroupFailure;
    private scaleUpGroup;
    private prepareTargetNode;
    private synchronizeData;
    private migrateSessions;
    private verifyDataConsistency;
    private verifyRecoveryPointObjective;
    private updateRedundancyGroups;
    private cleanupFailoverResources;
    private generateFailoverAnalysis;
    private updateFailoverMetrics;
    private sendFailoverNotification;
    private createFailoverNotificationMessage;
    private setupClusterManagement;
    private handleWorkerHealthCheck;
    private loadDefaultPolicies;
    private initializeMetrics;
    private generatePolicyId;
    private generateGroupId;
    private generateEventId;
    private generateTimelineId;
    /**
     * Shutdown the failover manager
     */
    shutdown(): void;
}
export default SecurityFailoverManager;
//# sourceMappingURL=SecurityFailoverManager.d.ts.map