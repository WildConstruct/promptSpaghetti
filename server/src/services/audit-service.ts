// Epic 17.1.6 - Comprehensive Audit Service

import { EventEmitter } from 'events';
import { AuditDAO } from '../database/audit-dao';
import {
  AuditEvent,
  AuditEventType,
  AuditCategory,
  AuditSeverity,
  ComplianceStandard,
  CreateAuditEventRequest,
  CreateComplianceReportRequest,
  AuditEventQuery,
  AuditEventResponse,
  AuditStatistics,
  ComplianceReport,
  AuditContext,
  AuditConfiguration
} from '../database/audit-models';

export class AuditService extends EventEmitter {
  private eventQueue: CreateAuditEventRequest[] = [];
  private isProcessing = false;
  private flushTimer?: NodeJS.Timeout;
  private config: AuditConfiguration | null = null;

  constructor(private auditDAO: AuditDAO) {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    // Load configuration
    await this.loadConfiguration();
    
    // Start flush timer
    this.startFlushTimer();
    
    // Listen for configuration changes
    this.on('configurationChanged', () => {
      this.loadConfiguration();
    });
  }

  private async loadConfiguration(): Promise<void> {
    try {
      // In a real implementation, this would load from database
      this.config = {
        id: 'default',
        enabledEventTypes: Object.values(AuditEventType),
        excludedEventTypes: [],
        minimumSeverity: AuditSeverity.LOW,
        defaultRetentionDays: 2555, // 7 years
        retentionByCategory: {
          [AuditCategory.SECURITY]: 3650, // 10 years
          [AuditCategory.COMPLIANCE]: 2555, // 7 years
          [AuditCategory.AUTHENTICATION]: 1095, // 3 years
          [AuditCategory.AUTHORIZATION]: 1095, // 3 years
          [AuditCategory.DATA_MODIFICATION]: 2555, // 7 years
          [AuditCategory.SYSTEM_CONFIGURATION]: 1095, // 3 years
          [AuditCategory.PERFORMANCE]: 90, // 3 months
          [AuditCategory.ERROR]: 365 // 1 year
        },
        archiveAfterDays: 365,
        deleteAfterDays: 2555,
        enableIntegrityChecking: true,
        enableDigitalSignatures: false,
        enableEncryption: false,
        batchSize: 100,
        flushInterval: 30, // seconds
        maxMemoryBuffer: 10, // MB
        requiredStandards: [ComplianceStandard.SOC2, ComplianceStandard.GDPR],
        automaticReportGeneration: false,
        alertOnCriticalEvents: true,
        alertOnSecurityEvents: true,
        alertRecipients: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to load audit configuration:', error);
      // Use default configuration if loading fails
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    const interval = (this.config?.flushInterval || 30) * 1000;
    this.flushTimer = setInterval(() => {
      this.flushEventQueue();
    }, interval);
  }

  // Public API methods

  /**
   * Log an audit event
   */
  async logEvent(request: CreateAuditEventRequest, context: AuditContext): Promise<void> {
    // Check if event type is enabled
    if (!this.isEventTypeEnabled(request.eventType)) {
      return;
    }

    // Check minimum severity
    if (!this.meetsSeverityThreshold(request.severity)) {
      return;
    }

    // Add to queue for batch processing
    this.eventQueue.push(request);

    // Check if we need to flush immediately
    if (this.shouldFlushImmediately(request)) {
      await this.flushEventQueue();
    } else if (this.eventQueue.length >= (this.config?.batchSize || 100)) {
      await this.flushEventQueue();
    }

    // Emit real-time event for immediate processing (e.g., alerts)
    this.emit('auditEvent', { request, context });
  }

  /**
   * Log feature toggle events
   */
  async logToggleCreated(toggleId: string, toggleData: any, context: AuditContext): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.TOGGLE_CREATED,
      category: AuditCategory.DATA_MODIFICATION,
      severity: AuditSeverity.MEDIUM,
      resourceType: 'feature_toggle',
      resourceId: toggleId,
      resourceName: toggleData.name,
      action: 'create',
      description: `Feature toggle "${toggleData.name}" was created`,
      outcome: 'success',
      afterValue: toggleData,
      metadata: {
        toggleType: toggleData.type,
        claudeImpact: toggleData.claudeImpact
      },
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  async logToggleUpdated(toggleId: string, beforeData: any, afterData: any, context: AuditContext): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.TOGGLE_UPDATED,
      category: AuditCategory.DATA_MODIFICATION,
      severity: AuditSeverity.MEDIUM,
      resourceType: 'feature_toggle',
      resourceId: toggleId,
      resourceName: afterData.name,
      action: 'update',
      description: `Feature toggle "${afterData.name}" was updated`,
      outcome: 'success',
      beforeValue: beforeData,
      afterValue: afterData,
      metadata: {
        toggleType: afterData.type,
        claudeImpact: afterData.claudeImpact
      },
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  async logToggleEnabled(toggleId: string, toggleName: string, context: AuditContext): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.TOGGLE_ENABLED,
      category: AuditCategory.SYSTEM_CONFIGURATION,
      severity: AuditSeverity.HIGH,
      resourceType: 'feature_toggle',
      resourceId: toggleId,
      resourceName: toggleName,
      action: 'enable',
      description: `Feature toggle "${toggleName}" was enabled`,
      outcome: 'success',
      afterValue: { enabled: true },
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  async logToggleDisabled(toggleId: string, toggleName: string, context: AuditContext): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.TOGGLE_DISABLED,
      category: AuditCategory.SYSTEM_CONFIGURATION,
      severity: AuditSeverity.HIGH,
      resourceType: 'feature_toggle',
      resourceId: toggleId,
      resourceName: toggleName,
      action: 'disable',
      description: `Feature toggle "${toggleName}" was disabled`,
      outcome: 'success',
      afterValue: { enabled: false },
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  /**
   * Log schedule events
   */
  async logScheduleCreated(scheduleId: string, scheduleData: any, context: AuditContext): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.SCHEDULE_CREATED,
      category: AuditCategory.DATA_MODIFICATION,
      severity: AuditSeverity.MEDIUM,
      resourceType: 'schedule',
      resourceId: scheduleId,
      resourceName: scheduleData.name,
      action: 'create',
      description: `Schedule "${scheduleData.name}" was created`,
      outcome: 'success',
      afterValue: scheduleData,
      metadata: {
        scheduleType: scheduleData.type,
        scheduleAction: scheduleData.action,
        toggleId: scheduleData.toggleId
      },
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  async logScheduleExecuted(scheduleId: string, scheduleName: string, execution: any, context: AuditContext): Promise<void> {
    const severity = execution.status === 'success' ? AuditSeverity.MEDIUM : AuditSeverity.HIGH;
    
    await this.logEvent({
      eventType: AuditEventType.SCHEDULE_EXECUTED,
      category: AuditCategory.SYSTEM_CONFIGURATION,
      severity,
      resourceType: 'schedule',
      resourceId: scheduleId,
      resourceName: scheduleName,
      action: 'execute',
      description: `Schedule "${scheduleName}" was executed with status: ${execution.status}`,
      outcome: execution.status === 'success' ? 'success' : 'failure',
      beforeValue: execution.beforeValue,
      afterValue: execution.afterValue,
      metadata: {
        executionId: execution.id,
        duration: execution.duration,
        affectedUsers: execution.affectedUsers,
        triggeredBy: execution.triggeredBy
      },
      error: execution.error,
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  /**
   * Log authentication events
   */
  async logUserLogin(userId: string, userEmail: string, success: boolean, context: AuditContext, error?: any): Promise<void> {
    const eventType = success ? AuditEventType.USER_LOGIN : AuditEventType.LOGIN_FAILED;
    const severity = success ? AuditSeverity.LOW : AuditSeverity.HIGH;
    const category = AuditCategory.AUTHENTICATION;

    await this.logEvent({
      eventType,
      category,
      severity,
      resourceType: 'user',
      resourceId: userId,
      resourceName: userEmail,
      action: 'login',
      description: success 
        ? `User ${userEmail} logged in successfully`
        : `Failed login attempt for user ${userEmail}`,
      outcome: success ? 'success' : 'failure',
      metadata: {
        loginMethod: context.metadata?.loginMethod || 'unknown',
        deviceType: context.metadata?.deviceType || 'unknown'
      },
      error: error ? {
        code: error.code || 'LOGIN_FAILED',
        message: error.message || 'Login failed'
      } : undefined,
      complianceStandards: [ComplianceStandard.SOC2, ComplianceStandard.GDPR]
    }, context);
  }

  async logUserLogout(userId: string, userEmail: string, context: AuditContext): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.USER_LOGOUT,
      category: AuditCategory.AUTHENTICATION,
      severity: AuditSeverity.LOW,
      resourceType: 'user',
      resourceId: userId,
      resourceName: userEmail,
      action: 'logout',
      description: `User ${userEmail} logged out`,
      outcome: 'success',
      complianceStandards: [ComplianceStandard.SOC2, ComplianceStandard.GDPR]
    }, context);
  }

  /**
   * Log access control events
   */
  async logAccessGranted(userId: string, resource: string, permission: string, context: AuditContext): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.ACCESS_GRANTED,
      category: AuditCategory.AUTHORIZATION,
      severity: AuditSeverity.LOW,
      resourceType: 'permission',
      resourceId: resource,
      resourceName: permission,
      action: 'grant_access',
      description: `Access granted to ${resource} for user ${userId}`,
      outcome: 'success',
      metadata: {
        permission,
        resource
      },
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  async logAccessDenied(userId: string, resource: string, permission: string, context: AuditContext, reason?: string): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.ACCESS_DENIED,
      category: AuditCategory.AUTHORIZATION,
      severity: AuditSeverity.HIGH,
      resourceType: 'permission',
      resourceId: resource,
      resourceName: permission,
      action: 'deny_access',
      description: `Access denied to ${resource} for user ${userId}${reason ? `: ${reason}` : ''}`,
      outcome: 'failure',
      metadata: {
        permission,
        resource,
        reason: reason || 'insufficient_permissions'
      },
      complianceStandards: [ComplianceStandard.SOC2]
    }, context);
  }

  /**
   * Log security events
   */
  async logSuspiciousActivity(description: string, context: AuditContext, metadata?: any): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.CRITICAL,
      resourceType: 'system',
      action: 'suspicious_activity',
      description,
      outcome: 'failure',
      metadata: {
        ...metadata,
        detectionTime: new Date().toISOString(),
        riskLevel: 'high'
      },
      complianceStandards: [ComplianceStandard.SOC2, ComplianceStandard.ISO27001]
    }, context);
  }

  async logSecurityBreach(description: string, context: AuditContext, metadata?: any): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.SECURITY_BREACH_DETECTED,
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.CRITICAL,
      resourceType: 'system',
      action: 'security_breach',
      description,
      outcome: 'failure',
      metadata: {
        ...metadata,
        detectionTime: new Date().toISOString(),
        riskLevel: 'critical',
        requiresImmedateAction: true
      },
      complianceStandards: [ComplianceStandard.SOC2, ComplianceStandard.ISO27001]
    }, context);

    // Emit immediate alert for critical security events
    this.emit('criticalSecurityEvent', { description, context, metadata });
  }

  /**
   * Log API events
   */
  async logAPIRequest(endpoint: string, method: string, statusCode: number, context: AuditContext, duration?: number): Promise<void> {
    const severity = statusCode >= 400 ? AuditSeverity.MEDIUM : AuditSeverity.LOW;
    const outcome = statusCode < 400 ? 'success' : 'failure';

    await this.logEvent({
      eventType: AuditEventType.API_REQUEST,
      category: statusCode >= 400 ? AuditCategory.ERROR : AuditCategory.PERFORMANCE,
      severity,
      resourceType: 'api_endpoint',
      resourceId: `${method}_${endpoint}`,
      resourceName: endpoint,
      action: method.toLowerCase(),
      description: `${method} request to ${endpoint} returned ${statusCode}`,
      outcome,
      metadata: {
        endpoint,
        method,
        statusCode,
        duration,
        responseTime: duration
      }
    }, context);
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditEventQuery): Promise<AuditEventResponse> {
    return this.auditDAO.queryAuditEvents(query);
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<AuditStatistics> {
    return this.auditDAO.getAuditStatistics(startDate, endDate);
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(request: CreateComplianceReportRequest, generatedBy: string): Promise<ComplianceReport> {
    return this.auditDAO.createComplianceReport(request, generatedBy);
  }

  /**
   * Create audit context from request
   */
  createContext(req: any): AuditContext {
    return {
      actorId: req.user?.id,
      actorType: req.user ? 'user' : 'anonymous',
      actorEmail: req.user?.email,
      actorName: req.user?.name,
      actorRole: req.user?.role,
      sessionId: req.sessionID,
      requestId: req.id || req.headers['x-request-id'],
      correlationId: req.headers['x-correlation-id'],
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata: {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Private helper methods

  private isEventTypeEnabled(eventType: AuditEventType): boolean {
    if (!this.config) return true;
    
    return this.config.enabledEventTypes.includes(eventType) && 
           !this.config.excludedEventTypes.includes(eventType);
  }

  private meetsSeverityThreshold(severity: AuditSeverity): boolean {
    if (!this.config) return true;
    
    const severityLevels = {
      [AuditSeverity.LOW]: 1,
      [AuditSeverity.MEDIUM]: 2,
      [AuditSeverity.HIGH]: 3,
      [AuditSeverity.CRITICAL]: 4
    };
    
    return severityLevels[severity] >= severityLevels[this.config.minimumSeverity];
  }

  private shouldFlushImmediately(request: CreateAuditEventRequest): boolean {
    // Flush immediately for critical events or security events
    return request.severity === AuditSeverity.CRITICAL || 
           request.category === AuditCategory.SECURITY;
  }

  private async flushEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Process events in batches
      const batchSize = this.config?.batchSize || 100;
      for (let i = 0; i < eventsToProcess.length; i += batchSize) {
        const batch = eventsToProcess.slice(i, i + batchSize);
        await this.processBatch(batch);
      }
    } catch (error) {
      console.error('Failed to process audit event batch:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...eventsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBatch(events: CreateAuditEventRequest[]): Promise<void> {
    for (const event of events) {
      try {
        // Create a basic context for queued events
        const context: AuditContext = {
          actorType: 'system',
          metadata: { batchProcessed: true, processedAt: new Date().toISOString() }
        };
        
        await this.auditDAO.createAuditEvent(event, context);
      } catch (error) {
        console.error('Failed to create audit event:', error);
        // Continue processing other events
      }
    }
  }

  /**
   * Middleware for automatic request logging
   */
  getAuditMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const context = this.createContext(req);

      // Log request completion
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.logAPIRequest(req.route?.path || req.url, req.method, res.statusCode, context, duration);
      });

      // Add audit context to request
      req.auditContext = context;
      req.audit = {
        log: (eventRequest: CreateAuditEventRequest) => this.logEvent(eventRequest, context),
        logToggleCreated: (toggleId: string, toggleData: any) => this.logToggleCreated(toggleId, toggleData, context),
        logToggleUpdated: (toggleId: string, before: any, after: any) => this.logToggleUpdated(toggleId, before, after, context),
        logAccessGranted: (resource: string, permission: string) => this.logAccessGranted(context.actorId || 'unknown', resource, permission, context),
        logAccessDenied: (resource: string, permission: string, reason?: string) => this.logAccessDenied(context.actorId || 'unknown', resource, permission, context, reason)
      };

      next();
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush any remaining events
    await this.flushEventQueue();
  }
}