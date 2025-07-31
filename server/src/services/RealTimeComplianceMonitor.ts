/**
 * Real-Time Compliance Monitor Service
 * 
 * Provides comprehensive real-time compliance monitoring with event-driven
 * architecture, streaming rule evaluation, continuous violation detection,
 * and automated response capabilities.
 * 
 * Part of Epic 19 - Privacy & Compliance Framework
 * Task: T-1752989143998-286 - Create real-time compliance monitoring
 */

import { EventEmitter } from 'events';
import { 
  ComplianceMonitor,
  ComplianceCheck,
  ComplianceResult,
  ComplianceContext
} from '../../../../packages/core/services/ComplianceMonitor';
import { ComplianceRuleEngine } from './ComplianceRuleEngine';
import { AuditService } from '../auth/services/AuditService';
import { PolicyNotificationService } from './PolicyNotificationService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

}
}
export interface RealTimeMonitoringConfig {
  monitorId: string;
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  
  // Performance Configuration
  maxConcurrentEvaluations: number;
  evaluationTimeout: number; // milliseconds
  queueProcessingInterval: number; // milliseconds
  eventBufferSize: number;
  
  // Rule Evaluation
  ruleEvaluationMode: 'immediate' | 'batched' | 'hybrid';
  batchSize: number;
  batchInterval: number; // milliseconds
  
  // Alerting Configuration
  alertThresholds: AlertThreshold[];
  escalationRules: EscalationRule[];
  suppressionRules: SuppressionRule[];
  
  // Persistence Configuration
  persistViolations: boolean;
  persistResults: boolean;
  retentionPeriod: number; // days
  
  // Integration Configuration
  enableMetrics: boolean;
  enableAuditLogging: boolean;
  enableNotifications: boolean;
  enableAutoRemediation: boolean;
}
}
}

}
}
export interface RealTimeEvent {
  eventId: string;
  eventType: ComplianceEventType;
  timestamp: Date;
  source: EventSource;
  context: ComplianceContext;
  payload: EventPayload;
  priority: EventPriority;
  tags: string[];
  metadata: Record<string, any>;
}
}
}

}
}
export interface EventPayload {
  userId?: string;
  resourceId?: string;
  operation: string;
  dataAccessed?: DataAccessInfo;
  permissions?: string[];
  requestHeaders?: Record<string, string>;
  responseData?: unknown;
  duration?: number;
  error?: ErrorInfo;
}
}
}

}
}
export interface DataAccessInfo {
  dataType: string;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  recordCount: number;
  fields: string[];
  purpose: string;
  legalBasis?: string;
  consentId?: string;
}
}
}

}
}
export interface ComplianceViolationEvent {
  violationId: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  violationType: string;
  description: string;
  context: ComplianceContext;
  evidence: ViolationEvidence[];
  suggestedActions: string[];
  detectedAt: Date;
  requiresImmediateAction: boolean;
  metadata: Record<string, any>;
}
}
}

}
}
export interface ViolationEvidence {
  type: 'log' | 'metric' | 'configuration' | 'data_sample' | 'user_action';
  source: string;
  timestamp: Date;
  content: unknown;
  hash?: string;
  signature?: string;
}
}
}

}
}
export interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  value: number;
  timeWindow: number; // minutes
  consecutiveCount?: number;
}
}
}

}
}
export interface EscalationRule {
  ruleId: string;
  condition: string;
  delay: number; // minutes
  targetLevel: number;
  recipients: string[];
  actions: string[];
}
}
}

}
}
export interface SuppressionRule {
  ruleId: string;
  pattern: string;
  duration: number; // minutes
  reason: string;
  approvedBy: string;
}
}
}

}
}
export interface MonitoringMetrics {
  eventsProcessed: number;
  violationsDetected: number;
  averageProcessingTime: number;
  queueDepth: number;
  errorRate: number;
  alertsGenerated: number;
  remediationsTriggered: number;
  timestamp: Date;
}
}
}

export type ComplianceEventType = 
  | 'data_access' 
  | 'data_modification' 
  | 'user_authentication' 
  | 'permission_granted' 
  | 'policy_violation'
  | 'configuration_change'
  | 'system_error'
  | 'security_incident'
  | 'audit_event'
  | 'consent_change';

export type EventSource = 
  | 'api_gateway' 
  | 'database' 
  | 'file_system' 
  | 'user_interface'
  | 'external_integration'
  | 'system_monitor'
  | 'security_scanner'
  | 'audit_logger';

export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export class RealTimeComplianceMonitor extends EventEmitter {
  private config: RealTimeMonitoringConfig;
  private complianceMonitor: ComplianceMonitor;
  private ruleEngine: ComplianceRuleEngine;
  private auditService: AuditService;
  private notificationService: PolicyNotificationService;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private analyticsCollector: AnalyticsCollector;

  // State Management
  private isRunning = false;
  private eventQueue: RealTimeEvent[] = [];
  private processingQueue: RealTimeEvent[] = [];
  private activeEvaluations = 0;
  private metrics: MonitoringMetrics;
  
  // Processing Controls
  private queueProcessor?: NodeJS.Timeout;
  private metricsReporter?: NodeJS.Timeout;
  private healthChecker?: NodeJS.Timeout;
  
  // Caching and State
  private violationCache = new Map<string, ComplianceViolationEvent>();
  private suppressionState = new Map<string, Date>();
  private escalationState = new Map<string, number>();

  constructor(
    config: RealTimeMonitoringConfig,
    dependencies: {
      complianceMonitor: ComplianceMonitor;
      ruleEngine: ComplianceRuleEngine;
      auditService: AuditService;
      notificationService: PolicyNotificationService;
      databaseService: DatabaseService;
      redisService: RedisService;
      analyticsCollector: AnalyticsCollector;
    }
  ) {
    super();
    this.config = config;
    
    // Initialize dependencies
    this.complianceMonitor = dependencies.complianceMonitor;
    this.ruleEngine = dependencies.ruleEngine;
    this.auditService = dependencies.auditService;
    this.notificationService = dependencies.notificationService;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;
    this.analyticsCollector = dependencies.analyticsCollector;

    // Initialize metrics
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize the real-time compliance monitor
   */
  public async initialize(): Promise<void> {

    if (this.isRunning) {
      throw new Error('Real-time compliance monitor is already running');
    }

    // Load existing state from Redis if available
    await this.loadState();

    // Start queue processing
    this.startQueueProcessor();

    // Start metrics reporting
    this.startMetricsReporting();

    // Start health monitoring
    this.startHealthMonitoring();

    this.isRunning = true;

    await this.auditService.logEvent({
      type: 'REALTIME_MONITOR_STARTED',
      userId: 'system',
      details: {
        monitorId: this.config.monitorId,
        environment: this.config.environment,
        timestamp: new Date()
      }
    });

    this.emit('monitor_started', { monitorId: this.config.monitorId });
  }

  /**
   * Process a real-time compliance event
   */
  public async processEvent(event: RealTimeEvent): Promise<void> {

    if (!this.isRunning) {
      throw new Error('Real-time compliance monitor is not running');
    }

    // Validate event
    this.validateEvent(event);

    // Add to queue based on priority
    if (event.priority === 'critical') {
      // Process critical events immediately
      await this.processEventImmediate(event);
    } else {
      // Queue for batch processing
      this.enqueueEvent(event);
    }

    this.metrics.eventsProcessed++;
  }

  /**
   * Process multiple events in batch
   */
  public async processEventBatch(events: RealTimeEvent[]): Promise<void> {

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  /**
   * Process event immediately for critical violations
   */
  private async processEventImmediate(event: RealTimeEvent): Promise<void> {

    const startTime = Date.now();

    try {
      this.activeEvaluations++;

      // Evaluate against all applicable rules
      const violations = await this.evaluateEventAgainstRules(event);

      // Process any violations found
      for (const violation of violations) {
        await this.processViolation(violation, event);
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateProcessingMetrics(processingTime);

    } catch (error) {
      await this.handleProcessingError(error, event);
    } finally {
      this.activeEvaluations--;
    }
  }

  /**
   * Evaluate event against compliance rules
   */
  private async evaluateEventAgainstRules(event: RealTimeEvent): Promise<ComplianceViolationEvent[]> {

    const violations: ComplianceViolationEvent[] = [];

    try {
      // Get applicable rules for this event type
      const applicableRules = await this.ruleEngine.getRulesForEventType(event.eventType);

      for (const rule of applicableRules) {
        // Skip if rule is suppressed
        if (this.isRuleSuppressed(rule.id)) {
          continue;
        }

        // Evaluate rule against event
        const ruleResult = await this.ruleEngine.evaluateRule(rule, event);

        if (ruleResult.violated) {
          const violation: ComplianceViolationEvent = {
            violationId: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            severity: ruleResult.severity,
            violationType: ruleResult.violationType,
            description: ruleResult.description,
            context: event.context,
            evidence: this.extractEvidence(event, ruleResult),
            suggestedActions: ruleResult.suggestedActions || [],
            detectedAt: new Date(),
            requiresImmediateAction: ruleResult.severity === 'critical',
            metadata: {
              eventId: event.eventId,
              ruleVersion: rule.version,
              evaluationTime: new Date()
            }
          };

          violations.push(violation);
        }
      }
    } catch (error) {
      console.error('Error evaluating event against rules:', error);
      throw error;
    }

    return violations;
  }

  /**
   * Process detected violation
   */
  private async processViolation(
    violation: ComplianceViolationEvent, 
    _____originalEvent: RealTimeEvent
  ): Promise<void> {

    // Store violation
    this.violationCache.set(violation.violationId, violation);

    if (this.config.persistViolations) {
      await this.persistViolation(violation);
    }

    // Emit violation event
    this.emit('violation_detected', violation);

    // Update metrics
    this.metrics.violationsDetected++;

    // Check alert thresholds
    await this.checkAlertThresholds(violation);

    // Handle notifications
    if (this.config.enableNotifications) {
      await this.sendViolationNotification(violation);
    }

    // Handle auto-remediation
    if (this.config.enableAutoRemediation && violation.requiresImmediateAction) {
      await this.triggerAutoRemediation(violation);
    }

    // Handle escalation
    await this.handleEscalation(violation);

    // Audit logging
    if (this.config.enableAuditLogging) {
      await this.auditService.logEvent({
        type: 'COMPLIANCE_VIOLATION_DETECTED',
        userId: violation.context.userId || 'system',
        details: {
          violationId: violation.violationId,
          ruleId: violation.ruleId,
          severity: violation.severity,
          violationType: violation.violationType,
          requiresImmediateAction: violation.requiresImmediateAction
        }
      });
    }
  }

  /**
   * Extract evidence from event and rule result
   */
  private extractEvidence(event: RealTimeEvent, ruleResult: unknown): ViolationEvidence[] {
    const evidence: ViolationEvidence[] = [];

    // Event payload evidence
    evidence.push({
      type: 'log',
      source: `event_${event.source}`,
      timestamp: event.timestamp,
      content: {
        eventType: event.eventType,
        payload: event.payload,
        context: event.context
      }
    });

    // Rule evaluation evidence
    if (ruleResult.evidence) {
      evidence.push({
        type: 'metric',
        source: 'rule_engine',
        timestamp: new Date(),
        content: ruleResult.evidence
      });
    }

    // Additional context evidence
    if (event.payload.dataAccessed) {
      evidence.push({
        type: 'data_sample',
        source: 'data_access_monitor',
        timestamp: event.timestamp,
        content: {
          dataType: event.payload.dataAccessed.dataType,
          classification: event.payload.dataAccessed.dataClassification,
          recordCount: event.payload.dataAccessed.recordCount,
          purpose: event.payload.dataAccessed.purpose
        }
      });
    }

    return evidence;
  }

  /**
   * Check if alert thresholds are exceeded
   */
  private async checkAlertThresholds(violation: ComplianceViolationEvent): Promise<void> {

    for (const threshold of this.config.alertThresholds) {
      const exceeded = await this.evaluateThreshold(threshold, violation);
      if (exceeded) {
        await this.triggerAlert(threshold, violation);
      }
    }
  }

  /**
   * Evaluate a specific threshold against current metrics
   */
  private async evaluateThreshold(
    threshold: AlertThreshold, 
    _____violation: ComplianceViolationEvent
  ): Promise<boolean> {

    // Get metric value for the specified time window
    const timeWindow = new Date(Date.now() - (threshold.timeWindow * 60 * 1000));
    const metricValue = await this.getMetricValue(threshold.metric, timeWindow);

    // Evaluate threshold condition
    switch (threshold.operator) {
    case 'gt':
      return metricValue > threshold.value;
    case 'gte':
      return metricValue >= threshold.value;
    case 'lt':
      return metricValue < threshold.value;
    case 'lte':
      return metricValue <= threshold.value;
    case 'eq':
      return metricValue === threshold.value;
    case 'ne':
      return metricValue !== threshold.value;
    default:
      return false;
    }
  }

  /**
   * Get metric value for threshold evaluation
   */
  private async getMetricValue(metric: string, since: Date): Promise<number> {

    switch (metric) {
    case 'violations_per_hour':
      return await this.getViolationCount(since);
    case 'critical_violations_per_hour':
      return await this.getCriticalViolationCount(since);
    case 'error_rate':
      return this.metrics.errorRate;
    case 'processing_time':
      return this.metrics.averageProcessingTime;
    default:
      return 0;
    }
  }

  /**
   * Get violation count since specified time
   */
  private async getViolationCount(since: Date): Promise<number> {

    let count = 0;
    for (const violation of this.violationCache.values()) {
      if (violation.detectedAt >= since) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get critical violation count since specified time
   */
  private async getCriticalViolationCount(since: Date): Promise<number> {

    let count = 0;
    for (const violation of this.violationCache.values()) {
      if (violation.detectedAt >= since && violation.severity === 'critical') {
        count++;
      }
    }
    return count;
  }

  /**
   * Trigger alert when threshold is exceeded
   */
  private async triggerAlert(
    threshold: AlertThreshold, 
    violation: ComplianceViolationEvent
  ): Promise<void> {

    const alert = {
      alertId: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      threshold: threshold.metric,
      violationId: violation.violationId,
      severity: violation.severity,
      timestamp: new Date()
    };

    this.emit('alert_triggered', alert);
    this.metrics.alertsGenerated++;

    // Send alert notification
    await this.notificationService.sendNotification({
      type: 'compliance_alert',
      recipient: 'compliance_team',
      subject: `Compliance Alert: ${threshold.metric} threshold exceeded`,
      content: `Alert triggered for violation ${violation.violationId}`,
      priority: violation.severity,
      metadata: alert
    });
  }

  /**
   * Send violation notification
   */
  private async sendViolationNotification(violation: ComplianceViolationEvent): Promise<void> {

    await this.notificationService.sendNotification({
      type: 'violation_detected',
      recipient: 'compliance_team',
      subject: `Compliance Violation Detected: ${violation.violationType}`,
      content: violation.description,
      priority: violation.severity,
      metadata: {
        violationId: violation.violationId,
        ruleId: violation.ruleId,
        detectedAt: violation.detectedAt
      }
    });
  }

  /**
   * Trigger automated remediation
   */
  private async triggerAutoRemediation(violation: ComplianceViolationEvent): Promise<void> {

    try {
      for (const action of violation.suggestedActions) {
        await this.executeRemediationAction(action, violation);
      }
      
      this.metrics.remediationsTriggered++;
      
      await this.auditService.logEvent({
        type: 'AUTO_REMEDIATION_TRIGGERED',
        userId: 'system',
        details: {
          violationId: violation.violationId,
          actions: violation.suggestedActions
        }
      });
    } catch (error) {
      console.error('Auto-remediation failed:', error);
    }
  }

  /**
   * Execute a specific remediation action
   */
  private async executeRemediationAction(
    action: string, 
    violation: ComplianceViolationEvent
  ): Promise<void> {

    // This would integrate with specific remediation systems
    console.log(`Executing remediation action: ${action} for violation: ${violation.violationId}`);
    
    // Example implementations:
    switch (action) {
    case 'block_user_access':
      // Implement user access blocking
      break;
    case 'quarantine_data':
      // Implement data quarantine
      break;
    case 'revoke_permissions':
      // Implement permission revocation
      break;
    case 'send_security_alert':
      // Send security team alert
      break;
    default:
      console.warn(`Unknown remediation action: ${action}`);
    }
  }

  /**
   * Handle escalation rules
   */
  private async handleEscalation(violation: ComplianceViolationEvent): Promise<void> {

    for (const rule of this.config.escalationRules) {
      if (this.shouldEscalate(rule, violation)) {
        await this.escalateViolation(rule, violation);
      }
    }
  }

  /**
   * Check if violation should be escalated
   */
  private shouldEscalate(rule: EscalationRule, violation: ComplianceViolationEvent): boolean {
    // Implementation would check rule conditions against violation
    return violation.severity === 'critical' && violation.requiresImmediateAction;
  }

  /**
   * Escalate violation
   */
  private async escalateViolation(
    rule: EscalationRule, 
    violation: ComplianceViolationEvent
  ): Promise<void> {

    const escalationLevel = (this.escalationState.get(violation.violationId) || 0) + 1;
    this.escalationState.set(violation.violationId, escalationLevel);

    this.emit('violation_escalated', { 
      violation, 
      rule, 
      escalationLevel 
    });

    // Send escalation notifications
    for (const recipient of rule.recipients) {
      await this.notificationService.sendNotification({
        type: 'compliance_escalation',
        recipient,
        subject: `Compliance Violation Escalation - Level ${escalationLevel}`,
        content: `Violation ${violation.violationId} has been escalated`,
        priority: 'critical',
        metadata: { violation, escalationLevel }
      });
    }
  }

  /**
   * Enqueue event for batch processing
   */
  private enqueueEvent(event: RealTimeEvent): void {
    // Check queue capacity
    if (this.eventQueue.length >= this.config.eventBufferSize) {
      // Remove oldest events if buffer is full
      this.eventQueue.splice(0, this.eventQueue.length - this.config.eventBufferSize + 1);
    }

    this.eventQueue.push(event);
  }

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    this.queueProcessor = setInterval(async () => {
      await this.processEventQueue();
    }, this.config.queueProcessingInterval);
  }

  /**
   * Process queued events
   */
  private async processEventQueue(): Promise<void> {

    if (this.eventQueue.length === 0 || 
        this.activeEvaluations >= this.config.maxConcurrentEvaluations) {
      return;
    }

    // Get batch of events to process
    const batchSize = Math.min(this.config.batchSize, this.eventQueue.length);
    const batch = this.eventQueue.splice(0, batchSize);
    
    this.processingQueue.push(...batch);
    this.metrics.queueDepth = this.eventQueue.length;

    // Process batch
    const processingPromises = batch.map(event => 
      this.processEventImmediate(event).catch(error => 
        this.handleProcessingError(error, event)

    );

    await Promise.allSettled(processingPromises);
  }

  /**
   * Handle processing errors
   */
  private async handleProcessingError(error: Error, event: RealTimeEvent): Promise<void> {

    console.error('Event processing error:', error, 'Event:', event);
    
    this.metrics.errorRate = (this.metrics.errorRate * 0.9) + (1 * 0.1); // Exponential moving average
    
    this.emit('processing_error', { error, event });

    await this.auditService.logEvent({
      type: 'REALTIME_MONITOR_ERROR',
      userId: 'system',
      details: {
        error: error.message,
        eventId: event.eventId,
        timestamp: new Date()
      }
    });
  }

  /**
   * Start metrics reporting
   */
  private startMetricsReporting(): void {
    this.metricsReporter = setInterval(async () => {
      await this.reportMetrics();
    }, 60000); // Report every minute
  }

  /**
   * Report current metrics
   */
  private async reportMetrics(): Promise<void> {

    this.metrics.timestamp = new Date();

    if (this.config.enableMetrics) {
      await this.analyticsCollector.trackMetrics('realtime_compliance_monitor', this.metrics);
    }

    this.emit('metrics_updated', this.metrics);

    // Save metrics to Redis
    await this.redisService.setWithExpiry(
      `compliance_monitor_metrics:${this.config.monitorId}`,
      JSON.stringify(this.metrics),
      3600 // 1 hour expiry
    );
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthChecker = setInterval(async () => {
      await this.performHealthCheck();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {

    const health = {
      healthy: true,
      issues: [] as string[],
      metrics: this.metrics,
      timestamp: new Date()
    };

    // Check queue depth
    if (this.eventQueue.length > this.config.eventBufferSize * 0.8) {
      health.healthy = false;
      health.issues.push('Event queue nearly full');
    }

    // Check error rate
    if (this.metrics.errorRate > 0.1) {
      health.healthy = false;
      health.issues.push('High error rate detected');
    }

    // Check processing time
    if (this.metrics.averageProcessingTime > this.config.evaluationTimeout * 0.8) {
      health.healthy = false;
      health.issues.push('High processing latency');
    }

    this.emit('health_check', health);

    if (!health.healthy) {
      console.warn('Real-time compliance monitor health issues:', health.issues);
    }
  }

  /**
   * Initialize metrics structure
   */
  private initializeMetrics(): MonitoringMetrics {
    return {
      eventsProcessed: 0,
      violationsDetected: 0,
      averageProcessingTime: 0,
      queueDepth: 0,
      errorRate: 0,
      alertsGenerated: 0,
      remediationsTriggered: 0,
      timestamp: new Date(};
  }

  /**
   * Update processing metrics
   */
  private updateProcessingMetrics(processingTime: number): void {
    // Update average processing time using exponential moving average
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * 0.9) + (processingTime * 0.1);
  }

  /**
   * Validate event structure
   */
  private validateEvent(event: RealTimeEvent): void {
    if (!event.eventId || !event.eventType || !event.timestamp) {
      throw new Error('Invalid event: missing required fields');
    }

    if (!event.context || !event.payload) {
      throw new Error('Invalid event: missing context or payload');
    }
  }

  /**
   * Check if rule is currently suppressed
   */
  private isRuleSuppressed(ruleId: string): boolean {
    const suppressedUntil = this.suppressionState.get(ruleId);
    return suppressedUntil ? suppressedUntil > new Date() : false;
  }

  /**
   * Persist violation to database
   */
  private async persistViolation(violation: ComplianceViolationEvent): Promise<void> {

    try {
      await this.databaseService.execute(`
        INSERT INTO compliance_violations (
          violation_id, rule_id, severity, violation_type, 
          description, context, evidence, detected_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        violation.violationId,
        violation.ruleId,
        violation.severity,
        violation.violationType,
        violation.description,
        JSON.stringify(violation.context),
        JSON.stringify(violation.evidence),
        violation.detectedAt,
        JSON.stringify(violation.metadata)
      ]);
    } catch (error) {
      console.error('Failed to persist violation:', error);
    }
  }

  /**
   * Load previous state from Redis
   */
  private async loadState(): Promise<void> {

    try {
      const metricsData = await this.redisService.get(`compliance_monitor_metrics:${this.config.monitorId}`);
      if (metricsData) {
        const savedMetrics = JSON.parse(metricsData);
        this.metrics = { ...this.metrics, ...savedMetrics };
      }
    } catch (error) {
      console.warn('Failed to load previous state:', error);
    }
  }

  /**
   * Get current monitor status
   */
  public getMonitorStatus(): {
    monitorId: string;
    running: boolean;
    config: RealTimeMonitoringConfig;
    metrics: MonitoringMetrics;
    queueStatus: {
      eventQueue: number;
      processingQueue: number;
      activeEvaluations: number;
    };
    } {
    return {
      monitorId: this.config.monitorId,
      running: this.isRunning,
      config: this.config,
      metrics: this.metrics,
      queueStatus: {
        eventQueue: this.eventQueue.length,
        processingQueue: this.processingQueue.length,
        activeEvaluations: this.activeEvaluations
      }
    };
  }

  /**
   * Stop the real-time monitor
   */
  public async stop(): Promise<void> {

    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clear intervals
    if (this.queueProcessor) {
      clearInterval(this.queueProcessor);
      this.queueProcessor = undefined;
    }

    if (this.metricsReporter) {
      clearInterval(this.metricsReporter);
      this.metricsReporter = undefined;
    }

    if (this.healthChecker) {
      clearInterval(this.healthChecker);
      this.healthChecker = undefined;
    }

    // Process remaining events
    if (this.eventQueue.length > 0) {
      console.log(`Processing ${this.eventQueue.length} remaining events...`);
      await this.processEventQueue();
    }

    // Save final metrics
    await this.reportMetrics();

    await this.auditService.logEvent({
      type: 'REALTIME_MONITOR_STOPPED',
      userId: 'system',
      details: {
        monitorId: this.config.monitorId,
        finalMetrics: this.metrics,
        timestamp: new Date()
      }
    });

    this.emit('monitor_stopped', { monitorId: this.config.monitorId });
  }
}