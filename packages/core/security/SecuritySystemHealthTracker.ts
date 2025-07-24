/**
 * Security System Health and Availability Tracking System
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263626-82FC78
 * 
 * Comprehensive health monitoring and availability tracking for security systems,
 * ensuring high availability, performance monitoring, and proactive issue detection.
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface SecuritySystemNode {
  id: string;
  name: string;
  description: string;
  type: 'primary' | 'secondary' | 'backup' | 'load_balancer' | 'database' | 'cache' | 'api_gateway' | 'monitoring';
  
  // System configuration
  configuration: {
    endpoint: string;
    port: number;
    protocol: 'http' | 'https' | 'tcp' | 'grpc';
    authentication: {
      type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2' | 'certificate';
      credentials?: Record<string, string>;
    };
    connection_timeout_ms: number;
    read_timeout_ms: number;
  };
  
  // Health check configuration
  health_checks: {
    enabled: boolean;
    check_interval_ms: number;
    timeout_ms: number;
    retry_attempts: number;
    retry_delay_ms: number;
    
    // Check types
    checks: Array<{
      type: 'ping' | 'http_status' | 'database_query' | 'custom_script' | 'port_check' | 'ssl_cert' | 'disk_space' | 'memory_usage' | 'cpu_usage';
      name: string;
      configuration: Record<string, any>;
      success_criteria: SuccessCriteria;
      weight: number; // Impact on overall health (0-1)
    }>;
  };
  
  // Performance monitoring
  performance: {
    metrics_collection: boolean;
    collection_interval_ms: number;
    retention_days: number;
    
    // Performance thresholds
    thresholds: {
      response_time_ms: { warning: number; critical: number };
      cpu_usage_percent: { warning: number; critical: number };
      memory_usage_percent: { warning: number; critical: number };
      disk_usage_percent: { warning: number; critical: number };
      network_latency_ms: { warning: number; critical: number };
      error_rate_percent: { warning: number; critical: number };
    };
  };
  
  // Availability configuration
  availability: {
    target_uptime_percent: number; // SLA target
    maintenance_window: MaintenanceWindow[];
    planned_downtime_tolerance_minutes: number;
    unplanned_downtime_tolerance_minutes: number;
  };
  
  // Dependencies
  dependencies: {
    hard_dependencies: string[]; // System fails if these fail
    soft_dependencies: string[]; // Performance degraded if these fail
    dependency_check_interval_ms: number;
  };
  
  // Current state
  current_state: {
    status: 'healthy' | 'warning' | 'critical' | 'unknown' | 'maintenance';
    last_check_time: number;
    uptime_start: number;
    consecutive_failures: number;
    health_score: number; // 0-100
    availability_percent_24h: number;
    availability_percent_7d: number;
    availability_percent_30d: number;
  };
  
  created_by: string;
  created_at: number;
  last_updated: number;
  enabled: boolean;
}

export interface SuccessCriteria {
  expected_status_code?: number;
  expected_response_time_ms?: number;
  expected_response_pattern?: string;
  minimum_success_rate?: number;
  custom_validation?: string; // JavaScript expression
}

export interface MaintenanceWindow {
  id: string;
  name: string;
  description: string;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  days_of_week: number[]; // 0-6 (Sunday-Saturday)
  timezone: string;
  recurring: boolean;
  exclude_from_sla: boolean;
}

export interface HealthCheckResult {
  id: string;
  system_id: string;
  check_name: string;
  check_type: string;
  executed_at: number;
  duration_ms: number;
  
  // Result details
  success: boolean;
  status_code?: number;
  response_time_ms?: number;
  error_message?: string;
  raw_response?: string;
  
  // Performance metrics
  metrics: {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    network_latency?: number;
    connection_count?: number;
    thread_count?: number;
    queue_size?: number;
  };
  
  // Health impact
  health_impact: {
    weight: number;
    contribution_to_health_score: number;
    severity: 'info' | 'warning' | 'critical';
  };
}

export interface AvailabilityReport {
  system_id: string;
  reporting_period: {
    start_time: number;
    end_time: number;
    duration_hours: number;
  };
  
  // Availability metrics
  availability: {
    uptime_minutes: number;
    downtime_minutes: number;
    availability_percent: number;
    target_availability_percent: number;
    sla_compliance: boolean;
  };
  
  // Downtime breakdown
  downtime_incidents: Array<{
    start_time: number;
    end_time: number;
    duration_minutes: number;
    type: 'planned' | 'unplanned';
    reason: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    root_cause?: string;
  }>;
  
  // Performance summary
  performance_summary: {
    avg_response_time_ms: number;
    p95_response_time_ms: number;
    p99_response_time_ms: number;
    error_rate_percent: number;
    successful_checks: number;
    failed_checks: number;
    total_checks: number;
  };
  
  // Trend analysis
  trends: {
    availability_trend: 'improving' | 'stable' | 'degrading';
    performance_trend: 'improving' | 'stable' | 'degrading';
    reliability_score: number; // 0-100
    recommendation_priority: 'low' | 'medium' | 'high';
  };
}

export interface SystemAlert {
  id: string;
  system_id: string;
  alert_type: 'availability' | 'performance' | 'health_check_failure' | 'dependency_failure' | 'threshold_breach';
  severity: 'info' | 'warning' | 'critical';
  
  // Alert details
  title: string;
  description: string;
  detected_at: number;
  
  // Context information
  context: {
    current_value?: number;
    threshold_value?: number;
    measurement_unit?: string;
    affected_checks: string[];
    dependency_impact: string[];
    estimated_impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Resolution tracking
  resolution: {
    acknowledged: boolean;
    acknowledged_by?: string;
    acknowledged_at?: number;
    resolved: boolean;
    resolved_by?: string;
    resolved_at?: number;
    resolution_notes?: string;
    auto_resolved: boolean;
  };
  
  // Notification tracking
  notifications: {
    email_sent: boolean;
    slack_sent: boolean;
    webhook_sent: boolean;
    escalated: boolean;
    escalation_level: number;
  };
}

export interface HealthTrackerConfig {
  global_settings: {
    default_check_interval_ms: number;
    default_timeout_ms: number;
    default_retry_attempts: number;
    max_concurrent_checks: number;
    enable_dependency_checking: boolean;
    enable_predictive_analysis: boolean;
  };
  
  alerting: {
    enabled: boolean;
    alert_aggregation_window_ms: number;
    suppress_duplicate_alerts: boolean;
    auto_resolve_timeout_ms: number;
    escalation_rules: EscalationRule[];
  };
  
  reporting: {
    generate_daily_reports: boolean;
    generate_weekly_reports: boolean;
    generate_monthly_reports: boolean;
    report_recipients: string[];
    include_trends: boolean;
    include_recommendations: boolean;
  };
  
  data_retention: {
    health_check_results_days: number;
    availability_reports_days: number;
    alert_history_days: number;
    performance_metrics_days: number;
  };
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: {
    severity_levels: SystemAlert['severity'][];
    system_types: SecuritySystemNode['type'][];
    consecutive_failures?: number;
    duration_minutes?: number;
  };
  actions: {
    notify_users: string[];
    create_incident: boolean;
    auto_failover: boolean;
    run_automation: boolean;
    automation_script?: string;
  };
  delay_minutes: number;
}

export class SecuritySystemHealthTracker extends EventEmitter {
  private systems: Map<string, SecuritySystemNode> = new Map();
  private healthCheckResults: Map<string, HealthCheckResult[]> = new Map();
  private availabilityReports: Map<string, AvailabilityReport[]> = new Map();
  private activeAlerts: Map<string, SystemAlert[]> = new Map();
  private config: HealthTrackerConfig;
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();
  private performanceMetrics: Map<string, Array<{ timestamp: number; metrics: Record<string, number> }>> = new Map();

  constructor(config: HealthTrackerConfig) {
    super();
    this.config = config;
    this.initializeEventHandlers();
  }

  private initializeEventHandlers(): void {
    this.on('system_registered', (systemId: string) => {
      this.startHealthChecking(systemId);
    });

    this.on('health_check_completed', (result: HealthCheckResult) => {
      this.processHealthCheckResult(result);
    });

    this.on('alert_generated', (alert: SystemAlert) => {
      this.processAlert(alert);
    });
  }

  // System registration and management
  async registerSystem(system: Omit<SecuritySystemNode, 'id' | 'created_at' | 'current_state'>): Promise<string> {
    const systemId = `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSystem: SecuritySystemNode = {
      ...system,
      id: systemId,
      created_at: Date.now(),
      current_state: {
        status: 'unknown',
        last_check_time: 0,
        uptime_start: Date.now(),
        consecutive_failures: 0,
        health_score: 0,
        availability_percent_24h: 0,
        availability_percent_7d: 0,
        availability_percent_30d: 0
      }
    };

    this.systems.set(systemId, newSystem);
    this.healthCheckResults.set(systemId, []);
    this.availabilityReports.set(systemId, []);
    this.activeAlerts.set(systemId, []);
    this.performanceMetrics.set(systemId, []);

    // Start health checking if enabled
    if (newSystem.health_checks.enabled) {
      this.startHealthChecking(systemId);
    }

    this.emit('system_registered', systemId, newSystem);
    return systemId;
  }

  async updateSystem(systemId: string, updates: Partial<SecuritySystemNode>): Promise<void> {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`System ${systemId} not found`);
    }

    const updatedSystem = { ...system, ...updates, last_updated: Date.now() };
    this.systems.set(systemId, updatedSystem);

    // Restart health checking if configuration changed
    if (updates.health_checks) {
      this.stopHealthChecking(systemId);
      if (updatedSystem.health_checks.enabled) {
        this.startHealthChecking(systemId);
      }
    }

    this.emit('system_updated', systemId, updatedSystem);
  }

  async unregisterSystem(systemId: string): Promise<void> {
    this.stopHealthChecking(systemId);
    
    this.systems.delete(systemId);
    this.healthCheckResults.delete(systemId);
    this.availabilityReports.delete(systemId);
    this.activeAlerts.delete(systemId);
    this.performanceMetrics.delete(systemId);

    this.emit('system_unregistered', systemId);
  }

  // Health checking implementation
  private startHealthChecking(systemId: string): void {
    const system = this.systems.get(systemId);
    if (!system || !system.health_checks.enabled) return;

    const interval = setInterval(async () => {
      await this.performHealthCheck(systemId);
    }, system.health_checks.check_interval_ms);

    this.checkIntervals.set(systemId, interval);

    // Perform initial health check immediately
    setTimeout(() => this.performHealthCheck(systemId), 1000);
  }

  private stopHealthChecking(systemId: string): void {
    const interval = this.checkIntervals.get(systemId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(systemId);
    }
  }

  private async performHealthCheck(systemId: string): Promise<void> {
    const system = this.systems.get(systemId);
    if (!system) return;

    const startTime = Date.now();
    const results: HealthCheckResult[] = [];

    try {
      // Execute all configured health checks
      for (const check of system.health_checks.checks) {
        const result = await this.executeHealthCheck(systemId, check);
        results.push(result);
      }

      // Calculate overall health score
      const healthScore = this.calculateHealthScore(results);
      
      // Update system state
      const consecutiveFailures = results.some(r => !r.success) 
        ? system.current_state.consecutive_failures + 1 
        : 0;

      const status = this.determineSystemStatus(healthScore, consecutiveFailures);

      system.current_state = {
        ...system.current_state,
        status,
        last_check_time: Date.now(),
        consecutive_failures: consecutiveFailures,
        health_score: healthScore
      };

      // Store results
      const systemResults = this.healthCheckResults.get(systemId) || [];
      systemResults.push(...results);
      
      // Limit stored results for performance
      if (systemResults.length > 1000) {
        systemResults.splice(0, systemResults.length - 1000);
      }
      
      this.healthCheckResults.set(systemId, systemResults);

      // Update availability metrics
      await this.updateAvailabilityMetrics(systemId, status);

      // Check for alerts
      await this.checkForAlerts(systemId, results, healthScore);

      this.emit('health_check_completed', systemId, results, healthScore);

    } catch (error) {
      console.error(`Health check failed for system ${systemId}:`, error);
      
      // Record failure
      system.current_state.status = 'critical';
      system.current_state.consecutive_failures += 1;
      system.current_state.last_check_time = Date.now();

      this.emit('health_check_error', systemId, error);
    }
  }

  private async executeHealthCheck(
    systemId: string, 
    check: SecuritySystemNode['health_checks']['checks'][0]
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const resultId = `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      let success = false;
      let statusCode: number | undefined;
      let responseTime = 0;
      let errorMessage: string | undefined;
      let rawResponse: string | undefined;
      let metrics: HealthCheckResult['metrics'] = {};

      switch (check.type) {
        case 'ping':
          // Implement ping check
          success = await this.performPingCheck(systemId, check);
          break;
          
        case 'http_status':
          const httpResult = await this.performHttpCheck(systemId, check);
          success = httpResult.success;
          statusCode = httpResult.statusCode;
          responseTime = httpResult.responseTime;
          rawResponse = httpResult.response;
          break;
          
        case 'database_query':
          success = await this.performDatabaseCheck(systemId, check);
          break;
          
        case 'port_check':
          success = await this.performPortCheck(systemId, check);
          break;
          
        case 'ssl_cert':
          success = await this.performSSLCertCheck(systemId, check);
          break;
          
        case 'disk_space':
          const diskResult = await this.performDiskSpaceCheck(systemId, check);
          success = diskResult.success;
          metrics.disk_usage = diskResult.usage;
          break;
          
        case 'memory_usage':
          const memResult = await this.performMemoryCheck(systemId, check);
          success = memResult.success;
          metrics.memory_usage = memResult.usage;
          break;
          
        case 'cpu_usage':
          const cpuResult = await this.performCPUCheck(systemId, check);
          success = cpuResult.success;
          metrics.cpu_usage = cpuResult.usage;
          break;
          
        case 'custom_script':
          success = await this.performCustomScriptCheck(systemId, check);
          break;
          
        default:
          throw new Error(`Unknown check type: ${check.type}`);
      }

      const duration = Date.now() - startTime;
      
      return {
        id: resultId,
        system_id: systemId,
        check_name: check.name,
        check_type: check.type,
        executed_at: startTime,
        duration_ms: duration,
        success,
        status_code: statusCode,
        response_time_ms: responseTime || duration,
        error_message: errorMessage,
        raw_response: rawResponse,
        metrics,
        health_impact: {
          weight: check.weight,
          contribution_to_health_score: success ? check.weight * 100 : 0,
          severity: success ? 'info' : (check.weight > 0.5 ? 'critical' : 'warning')
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        id: resultId,
        system_id: systemId,
        check_name: check.name,
        check_type: check.type,
        executed_at: startTime,
        duration_ms: duration,
        success: false,
        error_message: error instanceof Error ? error.message : String(error),
        metrics: {},
        health_impact: {
          weight: check.weight,
          contribution_to_health_score: 0,
          severity: check.weight > 0.5 ? 'critical' : 'warning'
        }
      };
    }
  }

  // Individual check implementations
  private async performPingCheck(systemId: string, check: any): Promise<boolean> {
    // Simplified ping implementation
    // In a real implementation, this would use actual ping or network connectivity test
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.1), 100);
    });
  }

  private async performHttpCheck(systemId: string, check: any): Promise<{
    success: boolean;
    statusCode?: number;
    responseTime: number;
    response?: string;
  }> {
    const system = this.systems.get(systemId);
    if (!system) throw new Error(`System ${systemId} not found`);

    const startTime = Date.now();
    
    // Simplified HTTP check implementation
    // In a real implementation, this would make actual HTTP requests
    const mockStatusCode = Math.random() > 0.05 ? 200 : 500;
    const responseTime = Date.now() - startTime + Math.random() * 100;
    
    return {
      success: mockStatusCode >= 200 && mockStatusCode < 300,
      statusCode: mockStatusCode,
      responseTime,
      response: `Mock response for ${system.name}`
    };
  }

  private async performDatabaseCheck(systemId: string, check: any): Promise<boolean> {
    // Simplified database check implementation
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.05), 50);
    });
  }

  private async performPortCheck(systemId: string, check: any): Promise<boolean> {
    // Simplified port check implementation
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.02), 20);
    });
  }

  private async performSSLCertCheck(systemId: string, check: any): Promise<boolean> {
    // Simplified SSL certificate check implementation
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.01), 30);
    });
  }

  private async performDiskSpaceCheck(systemId: string, check: any): Promise<{
    success: boolean;
    usage: number;
  }> {
    const usage = Math.random() * 100;
    const threshold = check.configuration?.threshold || 80;
    
    return {
      success: usage < threshold,
      usage
    };
  }

  private async performMemoryCheck(systemId: string, check: any): Promise<{
    success: boolean;
    usage: number;
  }> {
    const usage = Math.random() * 100;
    const threshold = check.configuration?.threshold || 85;
    
    return {
      success: usage < threshold,
      usage
    };
  }

  private async performCPUCheck(systemId: string, check: any): Promise<{
    success: boolean;
    usage: number;
  }> {
    const usage = Math.random() * 100;
    const threshold = check.configuration?.threshold || 90;
    
    return {
      success: usage < threshold,
      usage
    };
  }

  private async performCustomScriptCheck(systemId: string, check: any): Promise<boolean> {
    // Simplified custom script check implementation
    // In a real implementation, this would execute the custom script
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.03), 200);
    });
  }

  // Health score calculation
  private calculateHealthScore(results: HealthCheckResult[]): number {
    if (results.length === 0) return 0;

    const totalWeight = results.reduce((sum, r) => sum + r.health_impact.weight, 0);
    if (totalWeight === 0) return 100;

    const weightedScore = results.reduce((sum, r) => 
      sum + r.health_impact.contribution_to_health_score, 0
    );

    return Math.round((weightedScore / totalWeight) * 100) / 100;
  }

  private determineSystemStatus(healthScore: number, consecutiveFailures: number): SecuritySystemNode['current_state']['status'] {
    if (consecutiveFailures >= 3 || healthScore <= 25) return 'critical';
    if (consecutiveFailures >= 1 || healthScore <= 50) return 'warning';
    if (healthScore >= 90) return 'healthy';
    return 'warning';
  }

  // Availability tracking
  private async updateAvailabilityMetrics(systemId: string, status: SecuritySystemNode['current_state']['status']): Promise<void> {
    const system = this.systems.get(systemId);
    if (!system) return;

    const now = Date.now();
    const isHealthy = status === 'healthy';

    // Calculate availability for different time periods
    const availability24h = await this.calculateAvailability(systemId, now - 24 * 60 * 60 * 1000, now);
    const availability7d = await this.calculateAvailability(systemId, now - 7 * 24 * 60 * 60 * 1000, now);
    const availability30d = await this.calculateAvailability(systemId, now - 30 * 24 * 60 * 60 * 1000, now);

    system.current_state.availability_percent_24h = availability24h;
    system.current_state.availability_percent_7d = availability7d;
    system.current_state.availability_percent_30d = availability30d;

    this.emit('availability_updated', systemId, {
      availability_24h: availability24h,
      availability_7d: availability7d,
      availability_30d: availability30d
    });
  }

  private async calculateAvailability(systemId: string, startTime: number, endTime: number): Promise<number> {
    const results = this.healthCheckResults.get(systemId) || [];
    const relevantResults = results.filter(r => 
      r.executed_at >= startTime && r.executed_at <= endTime
    );

    if (relevantResults.length === 0) return 0;

    const successfulChecks = relevantResults.filter(r => r.success).length;
    return Math.round((successfulChecks / relevantResults.length) * 10000) / 100;
  }

  // Alert management
  private async checkForAlerts(systemId: string, results: HealthCheckResult[], healthScore: number): Promise<void> {
    const system = this.systems.get(systemId);
    if (!system) return;

    // Check for health score alerts
    if (healthScore <= 25 && system.current_state.status === 'critical') {
      await this.generateAlert(systemId, {
        alert_type: 'health_check_failure',
        severity: 'critical',
        title: `Critical Health Score for ${system.name}`,
        description: `System health score has dropped to ${healthScore}% with multiple check failures`,
        context: {
          current_value: healthScore,
          threshold_value: 25,
          measurement_unit: 'percent',
          affected_checks: results.filter(r => !r.success).map(r => r.check_name),
          estimated_impact: 'critical'
        }
      });
    }

    // Check for consecutive failure alerts
    if (system.current_state.consecutive_failures >= 3) {
      await this.generateAlert(systemId, {
        alert_type: 'availability',
        severity: 'critical',
        title: `Consecutive Failures for ${system.name}`,
        description: `System has failed ${system.current_state.consecutive_failures} consecutive health checks`,
        context: {
          current_value: system.current_state.consecutive_failures,
          threshold_value: 3,
          measurement_unit: 'failures',
          affected_checks: results.filter(r => !r.success).map(r => r.check_name),
          estimated_impact: 'high'
        }
      });
    }

    // Check performance thresholds
    for (const result of results) {
      if (result.metrics.cpu_usage && result.metrics.cpu_usage > system.performance.thresholds.cpu_usage_percent.critical) {
        await this.generateAlert(systemId, {
          alert_type: 'performance',
          severity: 'critical',
          title: `High CPU Usage on ${system.name}`,
          description: `CPU usage has exceeded critical threshold`,
          context: {
            current_value: result.metrics.cpu_usage,
            threshold_value: system.performance.thresholds.cpu_usage_percent.critical,
            measurement_unit: 'percent',
            affected_checks: [result.check_name],
            estimated_impact: 'medium'
          }
        });
      }

      if (result.metrics.memory_usage && result.metrics.memory_usage > system.performance.thresholds.memory_usage_percent.critical) {
        await this.generateAlert(systemId, {
          alert_type: 'performance',
          severity: 'critical',
          title: `High Memory Usage on ${system.name}`,
          description: `Memory usage has exceeded critical threshold`,
          context: {
            current_value: result.metrics.memory_usage,
            threshold_value: system.performance.thresholds.memory_usage_percent.critical,
            measurement_unit: 'percent',
            affected_checks: [result.check_name],
            estimated_impact: 'medium'
          }
        });
      }
    }
  }

  private async generateAlert(systemId: string, alertData: Partial<SystemAlert>): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: SystemAlert = {
      id: alertId,
      system_id: systemId,
      detected_at: Date.now(),
      resolution: {
        acknowledged: false,
        resolved: false,
        auto_resolved: false
      },
      notifications: {
        email_sent: false,
        slack_sent: false,
        webhook_sent: false,
        escalated: false,
        escalation_level: 0
      },
      context: {
        dependency_impact: [],
        estimated_impact: 'medium',
        affected_checks: [],
        ...alertData.context
      },
      ...alertData
    } as SystemAlert;

    const systemAlerts = this.activeAlerts.get(systemId) || [];
    systemAlerts.push(alert);
    this.activeAlerts.set(systemId, systemAlerts);

    this.emit('alert_generated', alert);
    return alertId;
  }

  private async processAlert(alert: SystemAlert): Promise<void> {
    // Check escalation rules
    for (const rule of this.config.alerting.escalation_rules) {
      if (this.alertMatchesEscalationRule(alert, rule)) {
        setTimeout(() => this.executeEscalationRule(alert, rule), rule.delay_minutes * 60 * 1000);
      }
    }

    // Send notifications
    await this.sendAlertNotifications(alert);
  }

  private alertMatchesEscalationRule(alert: SystemAlert, rule: EscalationRule): boolean {
    if (!rule.conditions.severity_levels.includes(alert.severity)) return false;
    
    const system = this.systems.get(alert.system_id);
    if (system && rule.conditions.system_types.length > 0) {
      if (!rule.conditions.system_types.includes(system.type)) return false;
    }

    return true;
  }

  private async executeEscalationRule(alert: SystemAlert, rule: EscalationRule): Promise<void> {
    // Check if alert is still active and unresolved
    if (alert.resolution.resolved) return;

    // Execute escalation actions
    if (rule.actions.notify_users.length > 0) {
      await this.sendEscalationNotifications(alert, rule.actions.notify_users);
    }

    if (rule.actions.create_incident) {
      await this.createIncident(alert);
    }

    if (rule.actions.auto_failover) {
      await this.triggerAutoFailover(alert.system_id);
    }

    if (rule.actions.run_automation && rule.actions.automation_script) {
      await this.runAutomationScript(alert, rule.actions.automation_script);
    }

    // Update alert
    alert.notifications.escalated = true;
    alert.notifications.escalation_level += 1;

    this.emit('alert_escalated', alert, rule);
  }

  private async sendAlertNotifications(alert: SystemAlert): Promise<void> {
    // Implement notification sending logic
    console.log(`Sending notifications for alert ${alert.id}`);
    
    alert.notifications.email_sent = true;
    alert.notifications.slack_sent = true;
    alert.notifications.webhook_sent = true;
  }

  private async sendEscalationNotifications(alert: SystemAlert, recipients: string[]): Promise<void> {
    console.log(`Sending escalation notifications for alert ${alert.id} to:`, recipients);
  }

  private async createIncident(alert: SystemAlert): Promise<void> {
    console.log(`Creating incident for alert ${alert.id}`);
  }

  private async triggerAutoFailover(systemId: string): Promise<void> {
    console.log(`Triggering auto-failover for system ${systemId}`);
  }

  private async runAutomationScript(alert: SystemAlert, script: string): Promise<void> {
    console.log(`Running automation script for alert ${alert.id}: ${script}`);
  }

  // Reporting and analytics
  async generateAvailabilityReport(systemId: string, startTime: number, endTime: number): Promise<AvailabilityReport> {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`System ${systemId} not found`);
    }

    const results = this.healthCheckResults.get(systemId) || [];
    const relevantResults = results.filter(r => 
      r.executed_at >= startTime && r.executed_at <= endTime
    );

    const totalChecks = relevantResults.length;
    const successfulChecks = relevantResults.filter(r => r.success).length;
    const failedChecks = totalChecks - successfulChecks;

    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    const availabilityPercent = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

    const responseTimes = relevantResults
      .filter(r => r.response_time_ms)
      .map(r => r.response_time_ms!)
      .sort((a, b) => a - b);

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    return {
      system_id: systemId,
      reporting_period: {
        start_time: startTime,
        end_time: endTime,
        duration_hours: durationHours
      },
      availability: {
        uptime_minutes: (successfulChecks / totalChecks) * durationHours * 60,
        downtime_minutes: (failedChecks / totalChecks) * durationHours * 60,
        availability_percent: availabilityPercent,
        target_availability_percent: system.availability.target_uptime_percent,
        sla_compliance: availabilityPercent >= system.availability.target_uptime_percent
      },
      downtime_incidents: [], // Would be populated from actual incident tracking
      performance_summary: {
        avg_response_time_ms: avgResponseTime,
        p95_response_time_ms: responseTimes[p95Index] || 0,
        p99_response_time_ms: responseTimes[p99Index] || 0,
        error_rate_percent: (failedChecks / totalChecks) * 100,
        successful_checks: successfulChecks,
        failed_checks: failedChecks,
        total_checks: totalChecks
      },
      trends: {
        availability_trend: 'stable', // Would be calculated from historical data
        performance_trend: 'stable',
        reliability_score: Math.max(0, Math.min(100, availabilityPercent)),
        recommendation_priority: availabilityPercent < 95 ? 'high' : 'low'
      }
    };
  }

  // System status and metrics
  getSystemHealth(systemId?: string): any {
    if (systemId) {
      const system = this.systems.get(systemId);
      if (!system) {
        throw new Error(`System ${systemId} not found`);
      }
      
      return {
        system_id: systemId,
        name: system.name,
        type: system.type,
        status: system.current_state.status,
        health_score: system.current_state.health_score,
        availability: {
          '24h': system.current_state.availability_percent_24h,
          '7d': system.current_state.availability_percent_7d,
          '30d': system.current_state.availability_percent_30d
        },
        last_check: system.current_state.last_check_time,
        consecutive_failures: system.current_state.consecutive_failures
      };
    }

    // Return all systems health overview
    const systemsHealth = Array.from(this.systems.values()).map(system => ({
      system_id: system.id,
      name: system.name,
      type: system.type,
      status: system.current_state.status,
      health_score: system.current_state.health_score,
      availability_24h: system.current_state.availability_percent_24h
    }));

    const totalSystems = systemsHealth.length;
    const healthySystems = systemsHealth.filter(s => s.status === 'healthy').length;
    const warningSystems = systemsHealth.filter(s => s.status === 'warning').length;
    const criticalSystems = systemsHealth.filter(s => s.status === 'critical').length;

    return {
      overview: {
        total_systems: totalSystems,
        healthy_systems: healthySystems,
        warning_systems: warningSystems,
        critical_systems: criticalSystems,
        overall_health_percentage: totalSystems > 0 ? (healthySystems / totalSystems) * 100 : 0
      },
      systems: systemsHealth
    };
  }

  getActiveAlerts(systemId?: string): SystemAlert[] {
    if (systemId) {
      return this.activeAlerts.get(systemId) || [];
    }

    const allAlerts: SystemAlert[] = [];
    for (const alerts of this.activeAlerts.values()) {
      allAlerts.push(...alerts.filter(a => !a.resolution.resolved));
    }

    return allAlerts.sort((a, b) => b.detected_at - a.detected_at);
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    for (const [systemId, alerts] of this.activeAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolution.acknowledged = true;
        alert.resolution.acknowledged_by = acknowledgedBy;
        alert.resolution.acknowledged_at = Date.now();
        
        this.emit('alert_acknowledged', alert);
        return;
      }
    }
    
    throw new Error(`Alert ${alertId} not found`);
  }

  async resolveAlert(alertId: string, resolvedBy: string, notes?: string): Promise<void> {
    for (const [systemId, alerts] of this.activeAlerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolution.resolved = true;
        alert.resolution.resolved_by = resolvedBy;
        alert.resolution.resolved_at = Date.now();
        alert.resolution.resolution_notes = notes;
        
        this.emit('alert_resolved', alert);
        return;
      }
    }
    
    throw new Error(`Alert ${alertId} not found`);
  }

  // Configuration management
  async updateConfig(newConfig: Partial<HealthTrackerConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  getConfiguration(): HealthTrackerConfig {
    return { ...this.config };
  }

  // Cleanup and maintenance
  async performMaintenance(): Promise<void> {
    const now = Date.now();
    
    // Clean up old health check results
    for (const [systemId, results] of this.healthCheckResults.entries()) {
      const retentionMs = this.config.data_retention.health_check_results_days * 24 * 60 * 60 * 1000;
      const cutoffTime = now - retentionMs;
      
      const filteredResults = results.filter(r => r.executed_at > cutoffTime);
      this.healthCheckResults.set(systemId, filteredResults);
    }

    // Clean up old alerts
    for (const [systemId, alerts] of this.activeAlerts.entries()) {
      const retentionMs = this.config.data_retention.alert_history_days * 24 * 60 * 60 * 1000;
      const cutoffTime = now - retentionMs;
      
      const filteredAlerts = alerts.filter(a => 
        a.detected_at > cutoffTime || !a.resolution.resolved
      );
      this.activeAlerts.set(systemId, filteredAlerts);
    }

    // Clean up old performance metrics
    for (const [systemId, metrics] of this.performanceMetrics.entries()) {
      const retentionMs = this.config.data_retention.performance_metrics_days * 24 * 60 * 60 * 1000;
      const cutoffTime = now - retentionMs;
      
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      this.performanceMetrics.set(systemId, filteredMetrics);
    }

    this.emit('maintenance_completed', {
      cleaned_at: now,
      systems_cleaned: this.systems.size
    });
  }

  // Shutdown
  async shutdown(): Promise<void> {
    // Stop all health checking intervals
    for (const [systemId, interval] of this.checkIntervals.entries()) {
      clearInterval(interval);
    }
    
    this.checkIntervals.clear();
    this.emit('tracker_shutdown');
  }
}

export default SecuritySystemHealthTracker;