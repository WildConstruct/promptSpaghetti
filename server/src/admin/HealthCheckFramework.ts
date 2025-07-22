/**
 * Health Check Framework - Epic 17.4.5
 * 
 * Comprehensive health check framework for Epic 17 admin controls.
 * Provides systematic health monitoring, automated dependency verification,
 * and intelligent health status aggregation across system components.
 * 
 * Task: E17-1753114397238-2ADFE4 - Design health check framework
 * Epic: 17 - Backstage Admin Controls (Story 17.4.5 - Health Check System)
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { performance } from 'perf_hooks';

// ==========================================
// HEALTH CHECK FRAMEWORK INTERFACES
// ==========================================

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export enum HealthCheckPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum HealthCheckCategory {
  INFRASTRUCTURE = 'infrastructure',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  BACKUP = 'backup',
  CONFIGURATION = 'configuration',
  ADMIN_OPERATIONS = 'admin_operations'
}

export interface HealthCheck {
  id: string;
  name: string;
  description: string;
  category: HealthCheckCategory;
  priority: HealthCheckPriority;
  enabled: boolean;
  timeout: number; // milliseconds
  interval: number; // milliseconds between checks
  retryAttempts: number;
  retryDelay: number; // milliseconds
  dependencies: string[]; // other health check IDs
  tags: string[];
  metadata: HealthCheckMetadata;
  execute: () => Promise<HealthCheckResult>;
}

export interface HealthCheckMetadata {
  version: string;
  maintainer: string;
  documentation: string;
  alerting: AlertConfiguration;
  thresholds: HealthThresholds;
  customData: Record<string, any>;
}

export interface AlertConfiguration {
  enabled: boolean;
  channels: AlertChannel[];
  cooldownPeriod: number; // minutes
  escalationRules: EscalationRule[];
  suppressDuringMaintenance: boolean;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  priority: HealthCheckPriority;
  enabled: boolean;
}

export interface EscalationRule {
  triggerAfter: number; // minutes
  action: 'notify_senior' | 'create_incident' | 'auto_remediate';
  parameters: Record<string, any>;
}

export interface HealthThresholds {
  responseTime: {
    warning: number;
    critical: number;
  };
  availability: {
    warning: number; // percentage
    critical: number; // percentage
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  custom: Record<string, { warning: number; critical: number }>;
}

export interface HealthCheckResult {
  checkId: string;
  status: HealthStatus;
  message: string;
  details: HealthCheckDetails;
  timestamp: Date;
  duration: number; // milliseconds
  attempt: number;
  metadata: ResultMetadata;
}

export interface HealthCheckDetails {
  measurements: Record<string, number>;
  diagnostics: Record<string, any>;
  dependencies: DependencyStatus[];
  recommendations: string[];
  affectedServices: string[];
  relatedIncidents: string[];
}

export interface DependencyStatus {
  dependencyId: string;
  status: HealthStatus;
  lastChecked: Date;
  impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface ResultMetadata {
  executionEnvironment: string;
  checkVersion: string;
  systemLoad: number;
  memoryUsage: number;
  networkLatency?: number;
  additionalContext: Record<string, any>;
}

export interface HealthCheckSuite {
  suiteId: string;
  name: string;
  description: string;
  checks: string[]; // health check IDs
  executionPolicy: ExecutionPolicy;
  reportingSettings: SuiteReportingSettings;
  schedule: ScheduleConfiguration;
}

export interface ExecutionPolicy {
  concurrent: boolean;
  maxConcurrency: number;
  failFast: boolean;
  continueOnError: boolean;
  dependencyValidation: boolean;
  timeoutPolicy: 'individual' | 'suite';
}

export interface SuiteReportingSettings {
  generateReport: boolean;
  reportFormat: 'json' | 'html' | 'xml';
  includeDetails: boolean;
  storageLocation: string;
  retentionDays: number;
}

export interface ScheduleConfiguration {
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  maintenanceWindows: MaintenanceWindow[];
  adaptiveScheduling: AdaptiveSchedulingConfig;
}

export interface MaintenanceWindow {
  id: string;
  startTime: Date;
  endTime: Date;
  skipChecks: boolean;
  suppressAlerts: boolean;
  description: string;
}

export interface AdaptiveSchedulingConfig {
  enabled: boolean;
  increaseFrequencyOnFailure: boolean;
  decreaseFrequencyOnSuccess: boolean;
  minInterval: number; // milliseconds
  maxInterval: number; // milliseconds
}

export interface HealthDashboard {
  dashboardId: string;
  name: string;
  widgets: DashboardWidget[];
  refreshInterval: number;
  accessControl: DashboardAccessControl;
}

export interface DashboardWidget {
  widgetId: string;
  type: 'status_summary' | 'trend_chart' | 'alert_list' | 'dependency_map' | 'performance_metrics';
  title: string;
  configuration: WidgetConfiguration;
  size: { width: number; height: number };
  position: { x: number; y: number };
}

export interface WidgetConfiguration {
  dataSource: string;
  timeRange: string;
  filters: Record<string, any>;
  displayOptions: Record<string, any>;
  alerting: boolean;
}

export interface DashboardAccessControl {
  public: boolean;
  roles: string[];
  users: string[];
  permissions: DashboardPermission[];
}

export interface DashboardPermission {
  principal: string;
  principalType: 'user' | 'role';
  permissions: ('view' | 'edit' | 'admin')[];
}

// ==========================================
// HEALTH CHECK FRAMEWORK IMPLEMENTATION
// ==========================================

export class HealthCheckFramework {
  private databaseService: DatabaseService;
  private auditService: AuditService;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private healthCheckSuites: Map<string, HealthCheckSuite> = new Map();
  private executionHistory: Map<string, HealthCheckResult[]> = new Map();
  private activeExecutions: Map<string, Promise<HealthCheckResult>> = new Map();
  private dashboards: Map<string, HealthDashboard> = new Map();

  constructor(databaseService?: DatabaseService) {
    this.databaseService = databaseService || new DatabaseService();
    this.auditService = new AuditService(this.databaseService);
    this.initializeBuiltInHealthChecks();
    this.initializeDefaultSuites();
    this.initializeDefaultDashboards();
  }

  // ==========================================
  // HEALTH CHECK REGISTRATION & MANAGEMENT
  // ==========================================

  async registerHealthCheck(healthCheck: HealthCheck): Promise<void> {
    // Validate health check configuration
    await this.validateHealthCheckConfiguration(healthCheck);

    // Store health check
    this.healthChecks.set(healthCheck.id, healthCheck);

    // Initialize execution history
    this.executionHistory.set(healthCheck.id, []);

    // Audit registration
    await this.auditService.logAction({
      userId: 'system',
      action: 'health_check_registered',
      resource: `health_check:${healthCheck.id}`,
      details: {
        name: healthCheck.name,
        category: healthCheck.category,
        priority: healthCheck.priority,
        enabled: healthCheck.enabled,
        timestamp: new Date()
      }
    });

    console.log(`Health check registered: ${healthCheck.id} (${healthCheck.name})`);
  }

  async unregisterHealthCheck(checkId: string, reason: string): Promise<void> {
    const healthCheck = this.healthChecks.get(checkId);
    if (!healthCheck) {
      throw new Error(`Health check not found: ${checkId}`);
    }

    // Cancel any active executions
    if (this.activeExecutions.has(checkId)) {
      this.activeExecutions.delete(checkId);
    }

    // Remove from registry
    this.healthChecks.delete(checkId);

    // Archive execution history
    const history = this.executionHistory.get(checkId) || [];
    await this.archiveExecutionHistory(checkId, history);
    this.executionHistory.delete(checkId);

    // Audit unregistration
    await this.auditService.logAction({
      userId: 'system',
      action: 'health_check_unregistered',
      resource: `health_check:${checkId}`,
      details: {
        reason,
        historicalExecutions: history.length,
        timestamp: new Date()
      }
    });

    console.log(`Health check unregistered: ${checkId} - ${reason}`);
  }

  // ==========================================
  // HEALTH CHECK EXECUTION
  // ==========================================

  async executeHealthCheck(checkId: string, attempt: number = 1): Promise<HealthCheckResult> {
    const healthCheck = this.healthChecks.get(checkId);
    if (!healthCheck) {
      throw new Error(`Health check not found: ${checkId}`);
    }

    if (!healthCheck.enabled) {
      return this.createSkippedResult(healthCheck, 'Health check is disabled');
    }

    // Check if already executing
    if (this.activeExecutions.has(checkId)) {
      const activeExecution = this.activeExecutions.get(checkId);
      if (activeExecution) {
        return await activeExecution;
      }
    }

    // Execute with timeout and retry logic
    const executionPromise = this.executeWithRetry(healthCheck, attempt);
    this.activeExecutions.set(checkId, executionPromise);

    try {
      const result = await executionPromise;
      
      // Store result in history
      this.addToExecutionHistory(checkId, result);

      // Handle alerting
      await this.processHealthCheckResult(healthCheck, result);

      return result;

    } finally {
      this.activeExecutions.delete(checkId);
    }
  }

  private async executeWithRetry(healthCheck: HealthCheck, attempt: number): Promise<HealthCheckResult> {
    const startTime = performance.now();
    let lastError: Error | null = null;

    for (let currentAttempt = attempt; currentAttempt <= healthCheck.retryAttempts + 1; currentAttempt++) {
      try {
        // Check dependencies first
        if (healthCheck.dependencies.length > 0) {
          const dependencyCheck = await this.validateDependencies(healthCheck);
          if (!dependencyCheck.allHealthy) {
            return this.createUnhealthyResult(
              healthCheck, 
              `Dependencies failed: ${dependencyCheck.failedDependencies.join(', ')}`,
              startTime,
              currentAttempt,
              dependencyCheck.statuses
            );
          }
        }

        // Execute the health check with timeout
        const result = await Promise.race([
          healthCheck.execute(),
          new Promise<HealthCheckResult>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout)
          )
        ]);

        // Enhance result with metadata
        result.timestamp = new Date();
        result.duration = performance.now() - startTime;
        result.attempt = currentAttempt;
        result.metadata = await this.generateResultMetadata(healthCheck);

        return result;

      } catch (error) {
        lastError = error as Error;
        console.warn(`Health check ${healthCheck.id} attempt ${currentAttempt} failed:`, error.message);

        // If not the last attempt, wait before retry
        if (currentAttempt < healthCheck.retryAttempts + 1) {
          await this.delay(healthCheck.retryDelay);
        }
      }
    }

    // All attempts failed
    return this.createErrorResult(
      healthCheck,
      `All ${healthCheck.retryAttempts + 1} attempts failed. Last error: ${lastError?.message}`,
      startTime,
      healthCheck.retryAttempts + 1
    );
  }

  async executeSuite(suiteId: string): Promise<HealthCheckResult[]> {
    const suite = this.healthCheckSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Health check suite not found: ${suiteId}`);
    }

    const startTime = performance.now();
    const results: HealthCheckResult[] = [];

    try {
      // Audit suite execution start
      await this.auditService.logAction({
        userId: 'system',
        action: 'health_check_suite_started',
        resource: `health_check_suite:${suiteId}`,
        details: {
          checksCount: suite.checks.length,
          concurrent: suite.executionPolicy.concurrent,
          timestamp: new Date()
        }
      });

      if (suite.executionPolicy.concurrent) {
        // Execute checks concurrently
        const checkPromises = suite.checks
          .slice(0, suite.executionPolicy.maxConcurrency || suite.checks.length)
          .map(checkId => this.executeHealthCheck(checkId));

        const concurrentResults = await Promise.allSettled(checkPromises);
        
        concurrentResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            const checkId = suite.checks[index];
            const healthCheck = this.healthChecks.get(checkId);
            if (healthCheck) {
              results.push(this.createErrorResult(
                healthCheck,
                `Suite execution failed: ${result.reason}`,
                startTime,
                1
              ));
            }
          }
        });

      } else {
        // Execute checks sequentially
        for (const checkId of suite.checks) {
          try {
            const result = await this.executeHealthCheck(checkId);
            results.push(result);

            // Check fail-fast policy
            if (suite.executionPolicy.failFast && result.status === HealthStatus.UNHEALTHY) {
              console.log(`Suite ${suiteId} stopping due to fail-fast policy after ${checkId} failed`);
              break;
            }

          } catch (error) {
            if (suite.executionPolicy.continueOnError) {
              console.warn(`Suite ${suiteId} continuing after error in ${checkId}:`, error);
            } else {
              throw error;
            }
          }
        }
      }

      // Generate suite report if configured
      if (suite.reportingSettings.generateReport) {
        await this.generateSuiteReport(suite, results);
      }

      // Audit suite execution completion
      await this.auditService.logAction({
        userId: 'system',
        action: 'health_check_suite_completed',
        resource: `health_check_suite:${suiteId}`,
        details: {
          executionTime: performance.now() - startTime,
          checksExecuted: results.length,
          healthyCount: results.filter(r => r.status === HealthStatus.HEALTHY).length,
          unhealthyCount: results.filter(r => r.status === HealthStatus.UNHEALTHY).length,
          degradedCount: results.filter(r => r.status === HealthStatus.DEGRADED).length,
          timestamp: new Date()
        }
      });

      return results;

    } catch (error) {
      await this.auditService.logAction({
        userId: 'system',
        action: 'health_check_suite_failed',
        resource: `health_check_suite:${suiteId}`,
        details: {
          error: error.message,
          executionTime: performance.now() - startTime,
          partialResults: results.length,
          timestamp: new Date()
        }
      });

      throw error;
    }
  }

  // ==========================================
  // DEPENDENCY VALIDATION
  // ==========================================

  private async validateDependencies(healthCheck: HealthCheck): Promise<{
    allHealthy: boolean;
    failedDependencies: string[];
    statuses: DependencyStatus[];
  }> {
    const statuses: DependencyStatus[] = [];
    const failedDependencies: string[] = [];

    for (const dependencyId of healthCheck.dependencies) {
      const dependency = this.healthChecks.get(dependencyId);
      if (!dependency) {
        failedDependencies.push(dependencyId);
        statuses.push({
          dependencyId,
          status: HealthStatus.UNKNOWN,
          lastChecked: new Date(),
          impact: 'critical'
        });
        continue;
      }

      try {
        const result = await this.executeHealthCheck(dependencyId);
        const status: DependencyStatus = {
          dependencyId,
          status: result.status,
          lastChecked: result.timestamp,
          impact: this.calculateDependencyImpact(dependency.priority, result.status)
        };

        statuses.push(status);

        if (result.status === HealthStatus.UNHEALTHY) {
          failedDependencies.push(dependencyId);
        }

      } catch (error) {
        failedDependencies.push(dependencyId);
        statuses.push({
          dependencyId,
          status: HealthStatus.UNKNOWN,
          lastChecked: new Date(),
          impact: 'critical'
        });
      }
    }

    return {
      allHealthy: failedDependencies.length === 0,
      failedDependencies,
      statuses
    };
  }

  private calculateDependencyImpact(priority: HealthCheckPriority, status: HealthStatus): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (status === HealthStatus.HEALTHY) return 'none';
    if (status === HealthStatus.DEGRADED) {
      return priority === HealthCheckPriority.CRITICAL ? 'medium' : 'low';
    }
    if (status === HealthStatus.UNHEALTHY) {
      switch (priority) {
        case HealthCheckPriority.CRITICAL: return 'critical';
        case HealthCheckPriority.HIGH: return 'high';
        case HealthCheckPriority.MEDIUM: return 'medium';
        case HealthCheckPriority.LOW: return 'low';
        default: return 'medium';
      }
    }
    return 'medium';
  }

  // ==========================================
  // ALERTING AND NOTIFICATIONS
  // ==========================================

  private async processHealthCheckResult(healthCheck: HealthCheck, result: HealthCheckResult): Promise<void> {
    const alertConfig = healthCheck.metadata.alerting;
    
    if (!alertConfig.enabled || result.status === HealthStatus.HEALTHY) {
      return;
    }

    // Check cooldown period
    const lastAlert = await this.getLastAlertTime(healthCheck.id);
    if (lastAlert && (Date.now() - lastAlert.getTime()) < (alertConfig.cooldownPeriod * 60 * 1000)) {
      return;
    }

    // Send alerts based on priority and channels
    for (const channel of alertConfig.channels) {
      if (!channel.enabled) continue;

      const shouldAlert = this.shouldSendAlert(channel.priority, healthCheck.priority, result.status);
      if (shouldAlert) {
        await this.sendAlert(channel, healthCheck, result);
      }
    }

    // Record alert time
    await this.recordAlertTime(healthCheck.id);

    // Process escalation rules
    await this.processEscalationRules(healthCheck, result, alertConfig.escalationRules);
  }

  private shouldSendAlert(channelPriority: HealthCheckPriority, checkPriority: HealthCheckPriority, status: HealthStatus): boolean {
    const priorityOrder = {
      [HealthCheckPriority.LOW]: 1,
      [HealthCheckPriority.MEDIUM]: 2,
      [HealthCheckPriority.HIGH]: 3,
      [HealthCheckPriority.CRITICAL]: 4
    };

    const checkPriorityLevel = priorityOrder[checkPriority];
    const channelPriorityLevel = priorityOrder[channelPriority];

    // Send alert if check priority meets or exceeds channel priority
    if (checkPriorityLevel >= channelPriorityLevel) {
      return status === HealthStatus.UNHEALTHY || 
             (status === HealthStatus.DEGRADED && checkPriority !== HealthCheckPriority.LOW);
    }

    return false;
  }

  private async sendAlert(channel: AlertChannel, healthCheck: HealthCheck, result: HealthCheckResult): Promise<void> {
    const alertPayload = {
      checkId: healthCheck.id,
      checkName: healthCheck.name,
      status: result.status,
      message: result.message,
      timestamp: result.timestamp,
      priority: healthCheck.priority,
      category: healthCheck.category,
      details: result.details
    };

    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(channel.target, alertPayload);
          break;
        case 'slack':
          await this.sendSlackAlert(channel.target, alertPayload);
          break;
        case 'webhook':
          await this.sendWebhookAlert(channel.target, alertPayload);
          break;
        case 'sms':
          await this.sendSMSAlert(channel.target, alertPayload);
          break;
      }

      // Audit alert sent
      await this.auditService.logAction({
        userId: 'system',
        action: 'health_check_alert_sent',
        resource: `health_check:${healthCheck.id}`,
        details: {
          channel: channel.type,
          target: channel.target,
          status: result.status,
          priority: healthCheck.priority,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error(`Failed to send alert via ${channel.type}:`, error);
      
      await this.auditService.logAction({
        userId: 'system',
        action: 'health_check_alert_failed',
        resource: `health_check:${healthCheck.id}`,
        details: {
          channel: channel.type,
          error: error.message,
          timestamp: new Date()
        }
      });
    }
  }

  // ==========================================
  // RESULT CREATION HELPERS
  // ==========================================

  private createSkippedResult(healthCheck: HealthCheck, reason: string): HealthCheckResult {
    return {
      checkId: healthCheck.id,
      status: HealthStatus.UNKNOWN,
      message: `Skipped: ${reason}`,
      details: {
        measurements: {},
        diagnostics: { skipReason: reason },
        dependencies: [],
        recommendations: [],
        affectedServices: [],
        relatedIncidents: []
      },
      timestamp: new Date(),
      duration: 0,
      attempt: 0,
      metadata: {
        executionEnvironment: process.env.NODE_ENV || 'development',
        checkVersion: healthCheck.metadata.version,
        systemLoad: 0,
        memoryUsage: 0,
        additionalContext: {}
      }
    };
  }

  private createUnhealthyResult(
    healthCheck: HealthCheck, 
    message: string, 
    startTime: number, 
    attempt: number,
    dependencies: DependencyStatus[] = []
  ): HealthCheckResult {
    return {
      checkId: healthCheck.id,
      status: HealthStatus.UNHEALTHY,
      message,
      details: {
        measurements: {},
        diagnostics: { failureReason: message },
        dependencies,
        recommendations: this.generateRecommendations(healthCheck, HealthStatus.UNHEALTHY),
        affectedServices: [],
        relatedIncidents: []
      },
      timestamp: new Date(),
      duration: performance.now() - startTime,
      attempt,
      metadata: {
        executionEnvironment: process.env.NODE_ENV || 'development',
        checkVersion: healthCheck.metadata.version,
        systemLoad: process.cpuUsage().system / 1000000, // Convert to seconds
        memoryUsage: process.memoryUsage().heapUsed,
        additionalContext: {}
      }
    };
  }

  private createErrorResult(healthCheck: HealthCheck, message: string, startTime: number, attempt: number): HealthCheckResult {
    return {
      checkId: healthCheck.id,
      status: HealthStatus.UNKNOWN,
      message: `Error: ${message}`,
      details: {
        measurements: {},
        diagnostics: { error: message },
        dependencies: [],
        recommendations: [
          'Check health check implementation for errors',
          'Verify system resources and dependencies',
          'Review health check timeout and retry configuration'
        ],
        affectedServices: [],
        relatedIncidents: []
      },
      timestamp: new Date(),
      duration: performance.now() - startTime,
      attempt,
      metadata: {
        executionEnvironment: process.env.NODE_ENV || 'development',
        checkVersion: healthCheck.metadata.version,
        systemLoad: 0,
        memoryUsage: process.memoryUsage().heapUsed,
        additionalContext: { error: true }
      }
    };
  }

  // ==========================================
  // INITIALIZATION METHODS
  // ==========================================

  private initializeBuiltInHealthChecks(): void {
    // System health checks will be registered here
    console.log('Health Check Framework initialized with built-in checks');
  }

  private initializeDefaultSuites(): void {
    // Default health check suites will be created here
    console.log('Default health check suites initialized');
  }

  private initializeDefaultDashboards(): void {
    // Default dashboards will be created here
    console.log('Default health dashboards initialized');
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validateHealthCheckConfiguration(healthCheck: HealthCheck): Promise<void> {
    if (!healthCheck.id || !healthCheck.name) {
      throw new Error('Health check must have id and name');
    }
    if (healthCheck.timeout <= 0) {
      throw new Error('Health check timeout must be positive');
    }
    if (healthCheck.interval <= 0) {
      throw new Error('Health check interval must be positive');
    }
    // Additional validation logic...
  }

  private addToExecutionHistory(checkId: string, result: HealthCheckResult): void {
    const history = this.executionHistory.get(checkId) || [];
    history.push(result);
    
    // Keep only last 100 results
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.executionHistory.set(checkId, history);
  }

  private generateRecommendations(healthCheck: HealthCheck, status: HealthStatus): string[] {
    const recommendations: string[] = [];
    
    if (status === HealthStatus.UNHEALTHY) {
      recommendations.push(`Investigate ${healthCheck.category} issues immediately`);
      recommendations.push('Check system logs for error details');
      
      if (healthCheck.priority === HealthCheckPriority.CRITICAL) {
        recommendations.push('Consider activating incident response procedures');
      }
    }
    
    return recommendations;
  }

  private async generateResultMetadata(healthCheck: HealthCheck): Promise<ResultMetadata> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      executionEnvironment: process.env.NODE_ENV || 'development',
      checkVersion: healthCheck.metadata.version,
      systemLoad: (cpuUsage.system + cpuUsage.user) / 1000000, // Convert to seconds
      memoryUsage: memUsage.heapUsed,
      additionalContext: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  }

  // Placeholder methods for alerting (would be implemented with actual services)
  private async sendEmailAlert(target: string, payload: any): Promise<void> {
    console.log(`Would send email alert to ${target}:`, payload.checkName, payload.status);
  }

  private async sendSlackAlert(target: string, payload: any): Promise<void> {
    console.log(`Would send Slack alert to ${target}:`, payload.checkName, payload.status);
  }

  private async sendWebhookAlert(target: string, payload: any): Promise<void> {
    console.log(`Would send webhook alert to ${target}:`, payload.checkName, payload.status);
  }

  private async sendSMSAlert(target: string, payload: any): Promise<void> {
    console.log(`Would send SMS alert to ${target}:`, payload.checkName, payload.status);
  }

  // Placeholder methods for alert tracking
  private async getLastAlertTime(checkId: string): Promise<Date | null> {
    // Would query database for last alert time
    return null;
  }

  private async recordAlertTime(checkId: string): Promise<void> {
    // Would record alert time in database
    console.log(`Recording alert time for ${checkId}`);
  }

  private async processEscalationRules(healthCheck: HealthCheck, result: HealthCheckResult, rules: EscalationRule[]): Promise<void> {
    // Would process escalation rules
    console.log(`Processing escalation rules for ${healthCheck.id}`);
  }

  private async archiveExecutionHistory(checkId: string, history: HealthCheckResult[]): Promise<void> {
    // Would archive execution history to long-term storage
    console.log(`Archiving execution history for ${checkId}: ${history.length} results`);
  }

  private async generateSuiteReport(suite: HealthCheckSuite, results: HealthCheckResult[]): Promise<void> {
    // Would generate and store suite report
    console.log(`Generating suite report for ${suite.suiteId}: ${results.length} results`);
  }

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  async getHealthCheck(checkId: string): Promise<HealthCheck | null> {
    return this.healthChecks.get(checkId) || null;
  }

  async listHealthChecks(filters?: { category?: HealthCheckCategory; enabled?: boolean }): Promise<HealthCheck[]> {
    let checks = Array.from(this.healthChecks.values());
    
    if (filters?.category) {
      checks = checks.filter(check => check.category === filters.category);
    }
    
    if (filters?.enabled !== undefined) {
      checks = checks.filter(check => check.enabled === filters.enabled);
    }
    
    return checks;
  }

  async getExecutionHistory(checkId: string, limit?: number): Promise<HealthCheckResult[]> {
    const history = this.executionHistory.get(checkId) || [];
    return limit ? history.slice(-limit) : history;
  }

  async getHealthCheckSuite(suiteId: string): Promise<HealthCheckSuite | null> {
    return this.healthCheckSuites.get(suiteId) || null;
  }

  async listHealthCheckSuites(): Promise<HealthCheckSuite[]> {
    return Array.from(this.healthCheckSuites.values());
  }
}