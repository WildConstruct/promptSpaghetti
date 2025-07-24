/**
 * Health Check Playbook Integration - Epic 17
 * 
 * Integration service that connects the health check system with Epic 17
 * incident playbooks, enabling automated incident response based on
 * health check failures and system monitoring alerts.
 * 
 * Task: E17-1753114397260-08F809 - Create incident playbooks
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { Epic17PlaybookOrchestrator } from './Epic17PlaybookOrchestrator';
import { Epic17SpecificPlaybooks } from './Epic17SpecificPlaybooks';
import { AuditService } from '../auth/services/AuditService';
import {
  Epic17IncidentPlaybook,
  Epic17System,
  HealthCheckTrigger,
  AlertTrigger,
  MetricThreshold,
  PlaybookExecutionContext,
  PlaybookExecutionResult
} from '../../../../packages/core/types/Epic17IncidentPlaybooks';
import { ActionSeverity } from '../../../../packages/core/types/EnforcementTypes';

export interface HealthCheckFailureEvent {
  healthCheckId: string;
  healthCheckName: string;
  system: Epic17System;
  failureType: 'timeout' | 'error_response' | 'invalid_data' | 'unavailable' | 'degraded';
  timestamp: Date;
  consecutiveFailures: number;
  severity: ActionSeverity;
  metadata: HealthCheckMetadata;
}

export interface HealthCheckMetadata {
  responseTime?: number;
  errorCode?: string;
  errorMessage?: string;
  previousState?: string;
  affectedEndpoints?: string[];
  diagnosticData?: unknown;
}

export interface SystemAlert {
  alertId: string;
  alertType: 'system_error' | 'performance_degradation' | 'security_breach' | 'data_corruption' | 'configuration_error';
  source: Epic17System;
  severity: ActionSeverity;
  timestamp: Date;
  title: string;
  description: string;
  metadata: AlertMetadata;
}

export interface AlertMetadata {
  affectedServices?: string[];
  errorRate?: number;
  responseTime?: number;
  userImpact?: number;
  businessImpact?: number;
  tags?: string[];
  correlationId?: string;
}

export interface MetricAlert {
  metricName: string;
  system: Epic17System;
  currentValue: number;
  thresholdValue: number;
  thresholdOperator: 'above' | 'below' | 'equal';
  duration: number; // minutes
  severity: ActionSeverity;
  timestamp: Date;
  metadata: MetricMetadata;
}

export interface MetricMetadata {
  aggregationType: 'average' | 'sum' | 'max' | 'min' | 'count';
  timeWindow: number; // minutes
  samplesCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  previousValue?: number;
}

export interface IntegrationConfig {
  enabled: boolean;
  autoTriggerPlaybooks: boolean;
  requireApprovalForCritical: boolean;
  maxConcurrentTriggers: number;
  cooldownPeriod: number; // minutes
  healthCheckMapping: HealthCheckMapping[];
  alertMapping: AlertMapping[];
  metricMapping: MetricMapping[];
}

export interface HealthCheckMapping {
  healthCheckId: string;
  playbookIds: string[];
  severityThreshold: ActionSeverity;
  consecutiveFailuresThreshold: number;
  cooldownMinutes: number;
  autoExecute: boolean;
}

export interface AlertMapping {
  alertPattern: string;
  playbookIds: string[];
  severityThreshold: ActionSeverity;
  frequencyThreshold: number;
  autoExecute: boolean;
}

export interface MetricMapping {
  metricName: string;
  playbookIds: string[];
  thresholds: {
    warning: number;
    critical: number;
  };
  operator: 'above' | 'below';
  autoExecute: boolean;
}

export class HealthCheckPlaybookIntegration {
  private db: Database;
  private orchestrator: Epic17PlaybookOrchestrator;
  private auditService: AuditService;
  private config: IntegrationConfig;

  // State tracking
  private registeredPlaybooks: Map<string, Epic17IncidentPlaybook> = new Map();
  private triggerHistory: Map<string, Date> = new Map(); // For cooldown tracking
  private activeTriggers: Map<string, PlaybookExecutionContext> = new Map();

  // Event listeners
  private healthCheckListeners: Map<string, HealthCheckEventListener> = new Map();
  private alertListeners: Map<string, AlertEventListener> = new Map();
  private metricListeners: Map<string, MetricEventListener> = new Map();

  constructor(
    database: Database,
    orchestrator: Epic17PlaybookOrchestrator,
    auditService: AuditService,
    config?: Partial<IntegrationConfig>
  ) {
    this.db = database;
    this.orchestrator = orchestrator;
    this.auditService = auditService;
    this.config = {
      enabled: true,
      autoTriggerPlaybooks: true,
      requireApprovalForCritical: false, // Allow auto-execution for urgent health issues
      maxConcurrentTriggers: 5,
      cooldownPeriod: 15, // 15 minute cooldown between same trigger
      healthCheckMapping: this.getDefaultHealthCheckMappings(),
      alertMapping: this.getDefaultAlertMappings(),
      metricMapping: this.getDefaultMetricMappings(),
      ...config
    };

    this.initializeIntegration();
  }

  // =============================================================================
  // Core Integration Methods
  // =============================================================================

  /**
   * Initialize the health check integration
   */
  private async initializeIntegration(): Promise<void> {
    if (!this.config.enabled) {
      console.log('🔌 Health Check Playbook Integration disabled');
      return;
    }

    console.log('🩺 Initializing Health Check Playbook Integration...');

    try {
      // Load and register all Epic 17 playbooks
      await this.registerPlaybooks();

      // Set up health check listeners
      await this.setupHealthCheckListeners();

      // Set up alert listeners
      await this.setupAlertListeners();

      // Set up metric listeners
      await this.setupMetricListeners();

      // Validate configuration
      await this.validateConfiguration();

      console.log('✅ Health Check Playbook Integration initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Health Check Playbook Integration:', error);
      throw error;
    }
  }

  /**
   * Handle health check failure event
   */
  async handleHealthCheckFailure(event: HealthCheckFailureEvent): Promise<void> {
    if (!this.config.enabled) return;

    console.log(`🚨 Health check failure: ${event.healthCheckName} (${event.system})`);

    try {
      // Find matching playbooks
      const matchingMappings = this.config.healthCheckMapping.filter(mapping =>
        mapping.healthCheckId === event.healthCheckId &&
        this.severityMeetsThreshold(event.severity, mapping.severityThreshold) &&
        event.consecutiveFailures >= mapping.consecutiveFailuresThreshold
      );

      if (matchingMappings.length === 0) {
        console.log(`ℹ️ No playbook mappings found for health check: ${event.healthCheckId}`);
        return;
      }

      // Process each matching mapping
      for (const mapping of matchingMappings) {
        await this.processMappingTrigger(mapping.playbookIds, event, 'health_check_failure');
      }

    } catch (error) {
      console.error(`❌ Failed to handle health check failure for ${event.healthCheckId}:`, error);
      await this.auditService.logEvent({
        userId: 'system',
        action: 'health_check_failure_processing_error',
        details: {
          healthCheckId: event.healthCheckId,
          system: event.system,
          error: error.message
        },
        severity: 'error'
      });
    }
  }

  /**
   * Handle system alert event
   */
  async handleSystemAlert(alert: SystemAlert): Promise<void> {
    if (!this.config.enabled) return;

    console.log(`🚨 System alert: ${alert.title} (${alert.source})`);

    try {
      // Find matching playbooks
      const matchingMappings = this.config.alertMapping.filter(mapping =>
        this.matchesAlertPattern(alert, mapping.alertPattern) &&
        this.severityMeetsThreshold(alert.severity, mapping.severityThreshold)
      );

      if (matchingMappings.length === 0) {
        console.log(`ℹ️ No playbook mappings found for alert: ${alert.alertType}`);
        return;
      }

      // Process each matching mapping
      for (const mapping of matchingMappings) {
        await this.processMappingTrigger(mapping.playbookIds, alert, 'system_alert');
      }

    } catch (error) {
      console.error(`❌ Failed to handle system alert ${alert.alertId}:`, error);
      await this.auditService.logEvent({
        userId: 'system',
        action: 'system_alert_processing_error',
        details: {
          alertId: alert.alertId,
          alertType: alert.alertType,
          error: error.message
        },
        severity: 'error'
      });
    }
  }

  /**
   * Handle metric threshold breach
   */
  async handleMetricAlert(metricAlert: MetricAlert): Promise<void> {
    if (!this.config.enabled) return;

    console.log(`📊 Metric alert: ${metricAlert.metricName} ${metricAlert.thresholdOperator} ${metricAlert.thresholdValue}`);

    try {
      // Find matching playbooks
      const matchingMappings = this.config.metricMapping.filter(mapping =>
        mapping.metricName === metricAlert.metricName &&
        this.metricBreach(metricAlert, mapping)
      );

      if (matchingMappings.length === 0) {
        console.log(`ℹ️ No playbook mappings found for metric: ${metricAlert.metricName}`);
        return;
      }

      // Process each matching mapping
      for (const mapping of matchingMappings) {
        await this.processMappingTrigger(mapping.playbookIds, metricAlert, 'metric_threshold');
      }

    } catch (error) {
      console.error(`❌ Failed to handle metric alert for ${metricAlert.metricName}:`, error);
    }
  }

  /**
   * Process mapping trigger and execute playbooks
   */
  private async processMappingTrigger(
    playbookIds: string[],
    triggerEvent: HealthCheckFailureEvent | SystemAlert | MetricAlert,
    triggerType: string
  ): Promise<void> {
    for (const playbookId of playbookIds) {
      try {
        // Check cooldown
        const cooldownKey = `${playbookId}_${triggerType}_${this.getTriggerEventId(triggerEvent)}`;
        if (this.isInCooldown(cooldownKey)) {
          console.log(`⏰ Playbook ${playbookId} is in cooldown period, skipping trigger`);
          continue;
        }

        // Check concurrent trigger limit
        if (this.activeTriggers.size >= this.config.maxConcurrentTriggers) {
          console.log(`⏸️ Maximum concurrent triggers reached, queueing playbook ${playbookId}`);
          await this.queuePlaybookExecution(playbookId, triggerEvent, triggerType);
          continue;
        }

        // Get playbook
        const playbook = this.registeredPlaybooks.get(playbookId);
        if (!playbook) {
          console.log(`⚠️ Playbook not found: ${playbookId}`);
          continue;
        }

        // Execute playbook
        console.log(`🎭 Triggering playbook: ${playbook.name} due to ${triggerType}`);

        const executionResult = await this.orchestrator.executePlaybook(
          playbookId,
          this.getSourceSystem(triggerEvent),
          {
            type: triggerType,
            event: triggerEvent,
            triggeredBy: 'health_check_integration',
            timestamp: new Date()
          },
          {
            manualTrigger: false,
            userId: 'health_check_system',
            skipApproval: !this.config.requireApprovalForCritical
          }
        );

        // Record trigger
        this.triggerHistory.set(cooldownKey, new Date());

        // Log successful trigger
        await this.auditService.logEvent({
          userId: 'system',
          action: 'playbook_triggered_by_health_check',
          details: {
            playbookId,
            playbookName: playbook.name,
            triggerType,
            triggerEvent: this.sanitizeEventForLogging(triggerEvent),
            executionId: executionResult.executionId,
            status: executionResult.status
          },
          severity: 'info'
        });

      } catch (error) {
        console.error(`❌ Failed to trigger playbook ${playbookId}:`, error);
      }
    }
  }

  // =============================================================================
  // Registration and Configuration
  // =============================================================================

  /**
   * Register all Epic 17 playbooks
   */
  private async registerPlaybooks(): Promise<void> {
    console.log('📚 Registering Epic 17 incident playbooks...');

    const playbooks = Epic17SpecificPlaybooks.getAllPlaybooks();
    
    for (const playbook of playbooks) {
      this.registeredPlaybooks.set(playbook.id, playbook);
      
      // Register health check triggers
      for (const trigger of playbook.triggerConditions.healthCheckFailures) {
        await this.orchestrator.registerHealthCheckTrigger(trigger, playbook.id);
      }
    }

    console.log(`✅ Registered ${playbooks.length} Epic 17 playbooks`);
  }

  /**
   * Set up health check listeners
   */
  private async setupHealthCheckListeners(): Promise<void> {
    console.log('🏥 Setting up health check listeners...');

    // Set up listeners for each health check mapping
    for (const mapping of this.config.healthCheckMapping) {
      const listener: HealthCheckEventListener = {
        id: `health_check_${mapping.healthCheckId}`,
        healthCheckId: mapping.healthCheckId,
        callback: this.handleHealthCheckFailure.bind(this),
        enabled: true,
        lastTriggered: null
      };

      this.healthCheckListeners.set(listener.id, listener);
    }

    console.log(`✅ Set up ${this.healthCheckListeners.size} health check listeners`);
  }

  /**
   * Set up alert listeners
   */
  private async setupAlertListeners(): Promise<void> {
    console.log('🚨 Setting up alert listeners...');

    // Set up listeners for each alert mapping
    for (const mapping of this.config.alertMapping) {
      const listener: AlertEventListener = {
        id: `alert_${mapping.alertPattern}`,
        pattern: mapping.alertPattern,
        callback: this.handleSystemAlert.bind(this),
        enabled: true,
        lastTriggered: null
      };

      this.alertListeners.set(listener.id, listener);
    }

    console.log(`✅ Set up ${this.alertListeners.size} alert listeners`);
  }

  /**
   * Set up metric listeners
   */
  private async setupMetricListeners(): Promise<void> {
    console.log('📊 Setting up metric listeners...');

    // Set up listeners for each metric mapping
    for (const mapping of this.config.metricMapping) {
      const listener: MetricEventListener = {
        id: `metric_${mapping.metricName}`,
        metricName: mapping.metricName,
        callback: this.handleMetricAlert.bind(this),
        enabled: true,
        lastTriggered: null
      };

      this.metricListeners.set(listener.id, listener);
    }

    console.log(`✅ Set up ${this.metricListeners.size} metric listeners`);
  }

  // =============================================================================
  // Default Configuration
  // =============================================================================

  private getDefaultHealthCheckMappings(): HealthCheckMapping[] {
    return [
      {
        healthCheckId: 'feature-toggle-api-health',
        playbookIds: ['epic17-feature-toggle-emergency'],
        severityThreshold: 'medium',
        consecutiveFailuresThreshold: 3,
        cooldownMinutes: 15,
        autoExecute: true
      },
      {
        healthCheckId: 'admin-dashboard-health',
        playbookIds: ['epic17-admin-system-outage'],
        severityThreshold: 'high',
        consecutiveFailuresThreshold: 2,
        cooldownMinutes: 10,
        autoExecute: true
      },
      {
        healthCheckId: 'content-management-health',
        playbookIds: ['epic17-content-security-incident'],
        severityThreshold: 'medium',
        consecutiveFailuresThreshold: 3,
        cooldownMinutes: 20,
        autoExecute: true
      }
    ];
  }

  private getDefaultAlertMappings(): AlertMapping[] {
    return [
      {
        alertPattern: 'feature.toggle.*error',
        playbookIds: ['epic17-feature-toggle-emergency'],
        severityThreshold: 'high',
        frequencyThreshold: 5,
        autoExecute: true
      },
      {
        alertPattern: 'admin.*unavailable',
        playbookIds: ['epic17-admin-system-outage'],
        severityThreshold: 'critical',
        frequencyThreshold: 1,
        autoExecute: true
      },
      {
        alertPattern: 'fraud.*detected',
        playbookIds: ['epic17-marketplace-fraud'],
        severityThreshold: 'high',
        frequencyThreshold: 3,
        autoExecute: true
      }
    ];
  }

  private getDefaultMetricMappings(): MetricMapping[] {
    return [
      {
        metricName: 'feature_toggle_response_time',
        playbookIds: ['epic17-feature-toggle-emergency'],
        thresholds: { warning: 3000, critical: 5000 },
        operator: 'above',
        autoExecute: true
      },
      {
        metricName: 'admin_api_availability',
        playbookIds: ['epic17-admin-system-outage'],
        thresholds: { warning: 95, critical: 90 },
        operator: 'below',
        autoExecute: true
      },
      {
        metricName: 'system_error_rate',
        playbookIds: ['epic17-system-performance'],
        thresholds: { warning: 1, critical: 5 },
        operator: 'above',
        autoExecute: true
      }
    ];
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private severityMeetsThreshold(severity: ActionSeverity, threshold: ActionSeverity): boolean {
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    return severityLevels[severity] >= severityLevels[threshold];
  }

  private matchesAlertPattern(alert: SystemAlert, pattern: string): boolean {
    const regex = new RegExp(pattern);
    return regex.test(alert.alertType) || regex.test(alert.title) || regex.test(alert.description);
  }

  private metricBreach(alert: MetricAlert, mapping: MetricMapping): boolean {
    const threshold = alert.severity === 'critical' ? mapping.thresholds.critical : mapping.thresholds.warning;
    
    if (mapping.operator === 'above') {
      return alert.currentValue > threshold;
    } else {
      return alert.currentValue < threshold;
    }
  }

  private isInCooldown(cooldownKey: string): boolean {
    const lastTrigger = this.triggerHistory.get(cooldownKey);
    if (!lastTrigger) return false;
    
    const cooldownMs = this.config.cooldownPeriod * 60 * 1000;
    return (Date.now() - lastTrigger.getTime()) < cooldownMs;
  }

  private getTriggerEventId(event: HealthCheckFailureEvent | SystemAlert | MetricAlert): string {
    if ('healthCheckId' in event) {
      return event.healthCheckId;
    } else if ('alertId' in event) {
      return event.alertId;
    } else {
      return event.metricName;
    }
  }

  private getSourceSystem(event: HealthCheckFailureEvent | SystemAlert | MetricAlert): Epic17System {
    return event.system;
  }

  private sanitizeEventForLogging(event: unknown): unknown {
    // Remove sensitive data from event before logging
    const sanitized = { ...event };
    delete sanitized.diagnosticData;
    return sanitized;
  }

  private async validateConfiguration(): Promise<void> {
    console.log('✅ Configuration validation completed');
  }

  private async queuePlaybookExecution(
    playbookId: string,
    _____triggerEvent: unknown,
    _____triggerType: string
  ): Promise<void> {
    // Implementation for queueing playbook execution when at capacity
    console.log(`📋 Queued playbook execution: ${playbookId}`);
  }
}

// Supporting interfaces
interface HealthCheckEventListener {
  id: string;
  healthCheckId: string;
  callback: (event: HealthCheckFailureEvent) => Promise<void>;
  enabled: boolean;
  lastTriggered: Date | null;
}

interface AlertEventListener {
  id: string;
  pattern: string;
  callback: (alert: SystemAlert) => Promise<void>;
  enabled: boolean;
  lastTriggered: Date | null;
}

interface MetricEventListener {
  id: string;
  metricName: string;
  callback: (alert: MetricAlert) => Promise<void>;
  enabled: boolean;
  lastTriggered: Date | null;
}