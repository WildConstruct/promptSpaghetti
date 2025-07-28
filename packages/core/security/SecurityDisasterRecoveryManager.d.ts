/**
 * Security Analytics Disaster Recovery and Backup Manager
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263638-3D0FFA
 *
 * Comprehensive disaster recovery and backup strategies for security analytics systems,
 * ensuring business continuity and data protection in catastrophic scenarios.
 */
import { EventEmitter } from 'events';
export interface DisasterRecoveryPlan {
    id: string;
    name: string;
    description: string;
    version: string;
    classification: {,
        disaster_type: 'natural' | 'cyber_attack' | 'hardware_failure' | 'human_error' | 'power_outage' | 'network_failure' | 'pandemic' | 'terrorism';
        severity_level: 'minor' | 'major' | 'critical' | 'catastrophic';
        scope: 'single_system' | 'datacenter' | 'region' | 'global';
        impact_category: 'availability' | 'integrity' | 'confidentiality' | 'all';
    };
    objectives: {,
        recovery_time_objective: number;
        recovery_point_objective: number;
        maximum_tolerable_outage: number;
        minimum_service_level: number;
    };
    strategies: RecoveryStrategy[];
    backup_requirements: {,
        backup_frequency: 'continuous' | 'hourly' | 'daily' | 'weekly';
        retention_policy: {,
            daily_backups: number;
            weekly_backups: number;
            monthly_backups: number;
            yearly_backups: number;
        };
        backup_types: ('full' | 'incremental' | 'differential' | 'continuous')[];
        compression_enabled: boolean;
        encryption_enabled: boolean;
        offsite_storage: boolean;
        cloud_storage: boolean;
        geographic_distribution: string[];
    };
    testing: {,
        test_frequency: 'monthly' | 'quarterly' | 'biannually' | 'annually';
        last_test_date: number;
        next_test_date: number;
        test_results: TestResult[];
        automated_testing: boolean;
        test_scenarios: string[];
    };
    communication: {,
        notification_tree: NotificationTreeNode[];
        communication_channels: ('email' | 'sms' | 'phone' | 'slack' | 'teams' | 'public_announcement')[];
        escalation_procedures: EscalationProcedure[];
        stakeholder_groups: StakeholderGroup[];
    };
    dependencies: {,
        required_systems: string[];
        required_personnel: string[];
        required_resources: string[];
        external_dependencies: ExternalDependency[];
    };
    compliance: {,
        frameworks: string[];
        regulatory_requirements: string[];
        audit_requirements: string[];
        documentation_requirements: string[];
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    approved_by?: string;
    approved_at?: number;
    next_review_date: number;
    status: 'draft' | 'approved' | 'active' | 'archived';
}
export interface RecoveryStrategy {
    id: string;
    name: string;
    description: string;
    priority: number;
    type: 'hot_standby' | 'warm_standby' | 'cold_standby' | 'pilot_light' | 'backup_restore' | 'multi_site' | 'cloud_failover';
    automation_level: 'manual' | 'semi_automatic' | 'automatic';
    target: {,
        location: string;
        datacenter: string;
        region: string;
        availability_zone?: string;
        capacity_percentage: number;
    };
    procedures: RecoveryProcedure[];
    resources: {,
        infrastructure: {,
            compute_instances: number;
            storage_gb: number;
            network_bandwidth_mbps: number;
            database_instances: number;
        };
        personnel: {,
            required_roles: string[];
            minimum_staff: number;
            on_call_requirements: boolean;
        };
        estimated_cost: {,
            setup_cost: number;
            monthly_cost: number;
            activation_cost: number;
        };
    };
    success_criteria: {,
        rto_compliance: boolean;
        rpo_compliance: boolean;
        data_integrity_verified: boolean;
        service_functionality_verified: boolean;
        performance_acceptable: boolean;
    };
    created_at: number;
    last_tested: number;
    test_success_rate: number;
}
export interface RecoveryProcedure {
    id: string;
    name: string;
    description: string;
    order: number;
    type: 'preparation' | 'activation' | 'recovery' | 'validation' | 'communication' | 'rollback';
    automation: {,
        automated: boolean;
        script_path?: string;
        manual_steps?: string[];
        approval_required: boolean;
        timeout: number;
    };
    dependencies: string[];
    parallel_execution: boolean;
    validation: {,
        success_criteria: string[];
        validation_script?: string;
        manual_verification: boolean;
        rollback_on_failure: boolean;
    };
    estimated_duration: number;
    last_execution_duration?: number;
    success_rate: number;
}
export interface BackupJob {
    id: string;
    name: string;
    description: string;
    type: 'full' | 'incremental' | 'differential' | 'continuous';
    source: {,
        system_id: string;
        data_types: ('security_events' | 'audit_logs' | 'configurations' | 'user_data' | 'analytics_data' | 'system_state')[];
        include_patterns: string[];
        exclude_patterns: string[];
    };
    destination: {,
        primary_location: string;
        secondary_location?: string;
        storage_type: 'file_system' | 'object_storage' | 'database' | 'tape' | 'cloud';
        encryption: {,
            enabled: boolean;
            algorithm: string;
            key_management: 'local' | 'hsm' | 'cloud_kms';
        };
        compression: {,
            enabled: boolean;
            algorithm: 'gzip' | 'lz4' | 'zstd';
            level: number;
        };
    };
    schedule: {,
        enabled: boolean;
        frequency: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'monthly';
        cron_expression?: string;
        time_window: {,
            start: string;
            end: string;
            timezone: string;
        };
        retry_policy: {,
            max_retries: number;
            retry_delay: number;
            backoff_strategy: 'linear' | 'exponential';
        };
    };
    performance: {,
        max_bandwidth_mbps: number;
        max_cpu_usage: number;
        max_memory_usage: number;
        parallelism: number;
        throttling: boolean;
    };
    validation: {,
        verify_after_backup: boolean;
        checksum_validation: boolean;
        test_restore: boolean;
        test_restore_frequency: 'daily' | 'weekly' | 'monthly';
    };
    retention: {,
        keep_daily: number;
        keep_weekly: number;
        keep_monthly: number;
        keep_yearly: number;
        auto_cleanup: boolean;
    };
    created_by: string;
    created_at: number;
    last_updated: number;
    last_run: number;
    next_run: number;
    enabled: boolean;
}
export interface BackupExecution {
    id: string;
    job_id: string;
    start_time: number;
    end_time?: number;
    duration?: number;
    status: 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';
    progress: {,
        total_items: number;
        processed_items: number;
        failed_items: number;
        current_item?: string;
        percentage_complete: number;
        estimated_time_remaining?: number;
    };
    metrics: {,
        data_size_bytes: number;
        compressed_size_bytes: number;
        compression_ratio: number;
        transfer_rate_mbps: number;
        checksum: string;
        file_count: number;
    };
    results: {,
        success: boolean;
        error_message?: string;
        validation_results: {,
            checksum_verified: boolean;
            restore_test_passed: boolean;
            integrity_check_passed: boolean;
        };
        backup_location: string;
        backup_files: string[];
    };
    resource_usage: {,
        cpu_usage_avg: number;
        memory_usage_peak: number;
        network_usage_mbps: number;
        disk_io_mbps: number;
    };
    triggered_by: 'schedule' | 'manual' | 'event' | 'disaster_recovery';
    execution_log: string[];
}
export interface DisasterRecoveryEvent {
    id: string;
    plan_id: string;
    disaster_type: DisasterRecoveryPlan['classification']['disaster_type'];
    severity: DisasterRecoveryPlan['classification']['severity_level'];
    scope: DisasterRecoveryPlan['classification']['scope'];
    detected_at: number;
    declared_at?: number;
    recovery_started_at?: number;
    recovery_completed_at?: number;
    business_resumed_at?: number;
    impact: {,
        affected_systems: string[];
        affected_users: number;
        affected_regions: string[];
        data_loss_estimate: number;
        revenue_impact: number;
        compliance_impact: string[];
        reputation_impact: 'minimal' | 'moderate' | 'significant' | 'severe';
    };
    execution: {,
        strategy_used: string;
        procedures_executed: string[];
        timeline: RecoveryTimelineEntry[];
        resources_utilized: {,
            personnel: string[];
            infrastructure: string[];
            external_services: string[];
        };
    };
    results: {,
        recovery_successful: boolean;
        actual_rto: number;
        actual_rpo: number;
        service_level_achieved: number;
        data_recovery_percentage: number;
        systems_recovered: number;
        systems_total: number;
    };
    analysis: {,
        root_cause: string;
        contributing_factors: string[];
        what_worked_well: string[];
        areas_for_improvement: string[];
        action_items: ActionItem[];
        plan_updates_required: string[];
    };
    communications: {,
        stakeholders_notified: string[];
        public_communications: string[];
        regulatory_notifications: string[];
        media_statements: string[];
    };
    status: 'active' | 'resolved' | 'under_investigation';
    incident_commander: string;
    created_by: string;
}
export interface RecoveryTimelineEntry {
    id: string;
    timestamp: number;
    phase: 'detection' | 'assessment' | 'declaration' | 'activation' | 'recovery' | 'validation' | 'communication' | 'closure';
    action: string;
    responsible_party: string;
    status: 'started' | 'completed' | 'failed' | 'skipped';
    duration?: number;
    details: Record<string, any>;
    notes?: string;
}
export interface TestResult {
    id: string;
    plan_id: string;
    test_date: number;
    test_type: 'tabletop' | 'walkthrough' | 'simulation' | 'full_test' | 'partial_test';
    scope: {,
        strategies_tested: string[];
        procedures_tested: string[];
        systems_involved: string[];
        scenarios_tested: string[];
    };
    execution: {,
        duration: number;
        participants: string[];
        test_lead: string;
        environment: 'production' | 'staging' | 'test' | 'isolated';
    };
    results: {,
        overall_success: boolean;
        rto_achieved: boolean;
        rpo_achieved: boolean;
        procedures_successful: number;
        procedures_failed: number;
        issues_identified: Issue[];
        improvements_identified: string[];
    };
    metrics: {,
        actual_rto: number;
        actual_rpo: number;
        data_recovery_percentage: number;
        system_recovery_percentage: number;
        communication_effectiveness: number;
    };
    follow_up: {,
        action_items: ActionItem[];
        plan_updates: string[];
        retesting_required: boolean;
        next_test_date?: number;
    };
    test_report: string;
    conducted_by: string;
}
export interface NotificationTreeNode {
    id: string;
    name: string;
    role: string;
    contact_methods: {,
        primary: {,
            type: 'email' | 'sms' | 'phone';
            value: string;
        };
        secondary?: {
            type: 'email' | 'sms' | 'phone';
            value: string;
        };
        backup?: {
            type: 'email' | 'sms' | 'phone';
            value: string;
        };
    };
    notification_order: number;
    escalation_timeout: number;
    decision_authority: boolean;
    geographic_location: string;
    availability_schedule?: {
        timezone: string;
        business_hours: {,
            start: string;
            end: string;
        };
        on_call_schedule?: string;
    };
}
export interface EscalationProcedure {
    id: string;
    name: string;
    trigger_conditions: string[];
    escalation_levels: {,
        level: number;
        timeout: number;
        recipients: string[];
        communication_method: 'email' | 'sms' | 'phone' | 'all';
        authorization_required: boolean;
    }[];
    max_escalation_level: number;
}
export interface StakeholderGroup {
    id: string;
    name: string;
    type: 'internal' | 'external' | 'regulatory' | 'customer' | 'partner' | 'media';
    members: string[];
    communication_preferences: {,
        frequency: 'immediate' | 'hourly' | 'daily' | 'milestone';
        methods: ('email' | 'sms' | 'phone' | 'portal' | 'public_announcement')[];
        information_level: 'summary' | 'detailed' | 'technical';
    };
    notification_triggers: string[];
}
export interface ExternalDependency {
    id: string;
    name: string;
    type: 'vendor' | 'partner' | 'cloud_provider' | 'utility' | 'government' | 'third_party_service';
    contact_information: {,
        primary_contact: string;
        support_phone: string;
        emergency_contact: string;
        account_manager?: string;
    };
    dependency_level: 'critical' | 'important' | 'optional';
    sla_commitments: {,
        availability: number;
        response_time: number;
        recovery_time: number;
    };
}
export interface ActionItem {
    id: string;
    title: string;
    description: string;
    assigned_to: string;
    due_date: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    category: 'process' | 'technology' | 'training' | 'documentation' | 'testing';
    estimated_effort: string;
    completion_criteria: string;
    created_at: number;
    completed_at?: number;
}
export interface Issue {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'procedure' | 'technology' | 'communication' | 'resource' | 'training';
    impact: string;
    root_cause?: string;
    recommendations: string[];
}
export interface DisasterRecoveryMetrics {
    availability: {,
        system_uptime: number;
        planned_downtime: number;
        unplanned_downtime: number;
        mtbf: number;
        mttr: number;
    };
    backup_performance: {,
        backup_success_rate: number;
        average_backup_duration: number;
        backup_size_trend: {,
            date: string;
            size_gb: number;
        }[];
        restore_test_success_rate: number;
        data_corruption_incidents: number;
    };
    recovery_readiness: {,
        plans_current: number;
        plans_total: number;
        last_test_results: {,
            plan_id: string;
            success: boolean;
            date: number;
        }[];
        rto_compliance: number;
        rpo_compliance: number;
        staff_training_completion: number;
    };
    dr_events: {,
        total_events: number;
        events_by_type: Record<string, number>;
        events_by_severity: Record<string, number>;
        successful_recoveries: number;
        average_recovery_time: number;
        total_downtime: number;
    };
    cost_metrics: {,
        backup_storage_cost: number;
        dr_infrastructure_cost: number;
        testing_cost: number;
        total_dr_investment: number;
        cost_per_gb_protected: number;
        roi_calculation: number;
    };
    time_range: {,
        start: number;
        end: number;
    };
}
export interface DisasterRecoveryConfig {
    enabled: boolean;
    default_rto: number;
    default_rpo: number;
    backup: {,
        enabled: boolean;
        default_retention_days: number;
        encryption_required: boolean;
        compression_enabled: boolean;
        offsite_replication: boolean;
        cloud_backup_enabled: boolean;
        backup_verification_enabled: boolean;
    };
    testing: {,
        mandatory_testing: boolean;
        test_frequency_days: number;
        automated_testing: boolean;
        test_data_anonymization: boolean;
        test_environment_isolation: boolean;
    };
    geographic: {,
        multi_region_backup: boolean;
        preferred_backup_regions: string[];
        cross_region_replication: boolean;
        disaster_declaration_threshold: number;
    };
    communication: {,
        enabled: boolean;
        emergency_notification_channels: string[];
        stakeholder_notification_enabled: boolean;
        public_communication_approval_required: boolean;
        regulatory_notification_required: boolean;
    };
    compliance: {,
        audit_all_activities: boolean;
        compliance_frameworks: string[];
        regulatory_reporting_required: boolean;
        documentation_retention_years: number;
        immutable_audit_trail: boolean;
    };
    resources: {,
        dedicated_dr_team: boolean;
        cross_training_required: boolean;
        external_vendor_support: boolean;
        resource_reservation_percentage: number;
    };
    security: {,
        encrypt_backups: boolean;
        encrypt_dr_communications: boolean;
        require_multi_factor_auth: boolean;
        background_check_required: boolean;
    };
}
/**
 * Security Analytics Disaster Recovery Manager
 */
export declare class SecurityDisasterRecoveryManager extends EventEmitter {
    private config;
    private recoveryPlans;
    private backupJobs;
    private activeExecutions;
    private drEvents;
    private testResults;
    private activeRecoveries;
    private backupScheduler?;
    private testScheduler?;
    private healthCheckInterval?;
    private metrics;
    private executionHistory;
    constructor(config?: Partial<DisasterRecoveryConfig>);
    /**
     * Initialize the disaster recovery system
     */
    private initialize;
    /**
     * Create a disaster recovery plan
     */
    createRecoveryPlan(plan: Omit<DisasterRecoveryPlan, 'id' | 'created_at' | 'last_updated' | 'next_review_date' | 'status'>): Promise<string>;
    /**
     * Create a backup job
     */
    createBackupJob(job: Omit<BackupJob, 'id' | 'created_at' | 'last_updated' | 'last_run' | 'next_run'>): Promise<string>;
    /**
     * Execute a backup job manually
     */
    executeBackupJob(jobId: string, triggeredBy?: 'schedule' | 'manual' | 'event' | 'disaster_recovery'): Promise<string>;
    /**
     * Declare a disaster and initiate recovery
     */
    declareDisaster(planId: string, disasterType: DisasterRecoveryPlan['classification']['disaster_type'], severity: DisasterRecoveryPlan['classification']['severity_level'], description: string, incidentCommander: string): Promise<string>;
    /**
     * Execute disaster recovery test
     */
    executeRecoveryTest(planId: string, testType: TestResult['test_type'], scope: Partial<TestResult['scope']>, testLead: string): Promise<string>;
    /**
     * Get disaster recovery metrics
     */
    getDisasterRecoveryMetrics(): DisasterRecoveryMetrics;
    /**
     * Get system status
     */
    getSystemStatus(): {
        recovery_plans: number;
        active_backup_jobs: number;
        running_backups: number;
        active_recoveries: number;
        recent_tests: TestResult[];
        backup_health: 'healthy' | 'degraded' | 'critical';
        last_successful_backup: number;
        next_scheduled_test: number;
    };
    private performBackup;
    private prepareBackup;
    private collectBackupData;
    private processBackupData;
    private transferBackupData;
    private validateBackup;
    private cleanupBackup;
    private executeDisasterRecovery;
    private selectRecoveryStrategy;
    private executeRecoveryProcedure;
    private validateRecovery;
    private performRecoveryTest;
    private getTestDuration;
    private sendDisasterNotifications;
    private createDisasterNotificationMessage;
    private startBackupScheduler;
    private startTestScheduler;
    private startHealthMonitoring;
    private processScheduledBackups;
    private processScheduledTests;
    private performHealthChecks;
    private calculateNextRun;
    private calculateNextTestDate;
    private estimateBackupItems;
    private getCompressionRatio;
    private generateChecksum;
    private performTestRestore;
    private performIntegrityCheck;
    private applyRetentionPolicy;
    private scheduleBackupRetry;
    private executeAutomatedProcedure;
    private rollbackProcedure;
    private updateBackupMetrics;
    private updateMetrics;
    private loadDefaultPlans;
    private loadDefaultBackupJobs;
    private initializeMetrics;
    private generatePlanId;
    private generateJobId;
    private generateExecutionId;
    private generateEventId;
    private generateTestId;
    private generateTimelineId;
    private generateIssueId;
    private generateActionItemId;
    /**
     * Shutdown the disaster recovery manager
     */
    shutdown(): void;
}
export default SecurityDisasterRecoveryManager;
//# sourceMappingURL=SecurityDisasterRecoveryManager.d.ts.map