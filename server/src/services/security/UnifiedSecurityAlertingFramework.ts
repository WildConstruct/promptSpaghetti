/**
 * Unified Security Alerting Framework
 * 
 * Comprehensive security alerting system that integrates existing security infrastructure
 * including SecurityAlertingAnalytics, ProjectHealthAlertService, HealthMonitoringService,
 * and authentication systems to provide centralized security monitoring and response.
 * 
 * Features:
 * - Multi-source alert aggregation and correlation
 * - Real-time threat detection and response
 * - Customizable alert routing and escalation
 * - Integration with existing security services
 * - Comprehensive logging and audit trails
 * - Automated incident response workflows
 * 
 * Epic 19 - Data Protection & Privacy Controls
 * Task: E19-1753114711991-016644 - Design security alerting framework
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { 
  SecurityAlertingAnalytics,
  SecurityAlertingConfig
} from '../../../../packages/core/security/SecurityAlertingAnalytics';
import { ProjectHealthAlertService } from '../project-health-alert-service';
import { HealthMonitoringService, SystemHealthSummary, HealthStatus } from '../HealthMonitoringService';
// import { SecurityAlert } from '../../../../packages/core/security/CentralizedAccessControlService';

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export enum AlertCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
  SYSTEM_HEALTH = 'SYSTEM_HEALTH',
  PROJECT_HEALTH = 'PROJECT_HEALTH',
  THREAT_DETECTION = 'THREAT_DETECTION',
  COMPLIANCE = 'COMPLIANCE',
  PERFORMANCE = 'PERFORMANCE',
  AVAILABILITY = 'AVAILABILITY',
  SECURITY_INCIDENT = 'SECURITY_INCIDENT'
}

export enum AlertSource {
  SECURITY_ANALYTICS = 'SECURITY_ANALYTICS',
  HEALTH_MONITORING = 'HEALTH_MONITORING',
  PROJECT_MONITORING = 'PROJECT_MONITORING',
  AUTHENTICATION_SERVICE = 'AUTHENTICATION_SERVICE',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  SYSTEM_MONITOR = 'SYSTEM_MONITOR',
  EXTERNAL_THREAT_FEED = 'EXTERNAL_THREAT_FEED',
  USER_REPORT = 'USER_REPORT',
  AUTOMATED_SCAN = 'AUTOMATED_SCAN'
}

export enum AlertStatus {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  DISMISSED = 'DISMISSED',
  ESCALATED = 'ESCALATED'
}

export interface UnifiedAlert {
  id: string;
  title: string;
  description: string;
  priority: AlertPriority;
  category: AlertCategory;
  source: AlertSource;
  status: AlertStatus;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  escalatedAt?: Date;
  
  // Context
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  sessionId?: string;
  affectedResources: string[];
  
  // Details
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  confidenceScore: number; // 0-1, confidence in alert accuracy
  riskScore: number; // 0-100, assessed risk level
  
  // Assignee and ownership
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: Date;
  
  // Original alert data
  originalAlert?: unknown;
  correlatedAlerts: string[];
  
  // Response tracking
  responseActions: AlertResponseAction[];
  comments: AlertComment[];
  attachments: AlertAttachment[];
  
  // Tags and classification
  tags: string[];
  classification?: string;
  
  // Automation
  automatedResponse: boolean;
  requiresManualReview: boolean;
  escalationRules: string[];
}

export interface AlertResponseAction {
  id: string;
  alertId: string;
  actionType: 'INVESTIGATE' | 'BLOCK' | 'QUARANTINE' | 'NOTIFY' | 'ESCALATE' | 'AUTOFIX' | 'DISMISS';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  executedBy: string; // user or system
  executedAt: Date;
  completedAt?: Date;
  description: string;
  parameters: Record<string, any>;
  result?: {
    success: boolean;
    message: string;
    details?: unknown;
  };
}

export interface AlertComment {
  id: string;
  alertId: string;
  userId: string;
  content: string;
  createdAt: Date;
  isSystemGenerated: boolean;
  metadata?: Record<string, any>;
}

export interface AlertAttachment {
  id: string;
  alertId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Matching criteria
  conditions: AlertCondition[];
  sources: AlertSource[];
  categories: AlertCategory[];
  minimumPriority: AlertPriority;
  
  // Actions
  actions: RuleAction[];
  
  // Timing
  cooldownPeriod: number; // milliseconds
  maxExecutionsPerHour: number;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'REGEX';
  value: Error;
  weight: number; // 0-1, importance of this condition
}

export interface RuleAction {
  type: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'SLACK' | 'TEAMS' | 'PAGER' | 'EXECUTE_SCRIPT' | 'UPDATE_STATUS' | 'ASSIGN';
  parameters: Record<string, any>;
  conditions: ActionCondition[];
  enabled: boolean;
}

export interface ActionCondition {
  condition: string;
  value: Error;
  operator: string;
}

export interface AlertingConfiguration {
  // General settings
  enableRealTimeProcessing: boolean;
  enableCorrelation: boolean;
  enableAutomaticEscalation: boolean;
  enableMachineLearning: boolean;
  
  // Thresholds
  criticalAlertThreshold: number;
  highAlertThreshold: number;
  correlationTimeWindow: number; // milliseconds
  escalationTimeout: number; // milliseconds
  
  // Retention
  alertRetentionDays: number;
  logRetentionDays: number;
  archivedAlertRetentionDays: number;
  
  // Performance
  maxConcurrentProcessing: number;
  processingTimeout: number;
  batchSize: number;
  
  // Integration settings
  securityAnalyticsConfig: Partial<SecurityAlertingConfig>;
  healthMonitoringEnabled: boolean;
  projectHealthEnabled: boolean;
  
  // Notification settings
  notificationChannels: NotificationChannel[];
  escalationChain: EscalationRule[];
}

export interface NotificationChannel {
  id: string;
  type: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'SLACK' | 'TEAMS' | 'PAGER';
  name: string;
  enabled: boolean;
  configuration: Record<string, any>;
  conditions: ChannelCondition[];
  rateLimits: {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
}

export interface ChannelCondition {
  field: string;
  operator: string;
  value: Error;
}

export interface EscalationRule {
  level: number;
  triggerAfter: number; // milliseconds
  conditions: EscalationCondition[];
  actions: RuleAction[];
  assignTo?: string[];
}

export interface EscalationCondition {
  condition: string;
  value: Error;
}

export interface AlertMetrics {
  totalAlerts: number;
  alertsByPriority: Record<AlertPriority, number>;
  alertsByCategory: Record<AlertCategory, number>;
  alertsBySource: Record<AlertSource, number>;
  alertsByStatus: Record<AlertStatus, number>;
  
  averageResolutionTime: number;
  averageResponseTime: number;
  falsePositiveRate: number;
  escalationRate: number;
  automatedResolutionRate: number;
  
  recentTrends: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
  
  topAlertTypes: Array<{
    type: string;
    count: number;
    averageSeverity: number;
  }>;
  
  performanceMetrics: {
    processingTime: number;
    correlationAccuracy: number;
    systemLoad: number;
  };
}

export interface AlertDashboard {
  summary: {
    totalActive: number;
    critical: number;
    high: number;
    newAlerts: number;
    unassigned: number;
  };
  
  recentAlerts: UnifiedAlert[];
  topPriorities: UnifiedAlert[];
  systemHealth: SystemHealthSummary;
  trendAnalysis: {
    alertVolume: number[];
    resolutionTimes: number[];
    escalationRates: number[];
  };
  
  recommendations: {
    action: string;
    priority: AlertPriority;
    description: string;
    impact: string;
  }[];
}

/**
 * Main Unified Security Alerting Framework Service
 */
export class UnifiedSecurityAlertingFramework extends EventEmitter {
  private config: AlertingConfiguration;
  private alerts: Map<string, UnifiedAlert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private notificationChannels: Map<string, NotificationChannel> = new Map();
  private escalationRules: EscalationRule[] = [];
  
  // External service integrations
  private securityAnalytics: SecurityAlertingAnalytics;
  private healthMonitoring: HealthMonitoringService;
  private projectHealthService: ProjectHealthAlertService;
  
  // Processing queues
  private processingQueue: UnifiedAlert[] = [];
  private isProcessing = false;
  private correlationMap: Map<string, string[]> = new Map();
  
  // Metrics
  private metrics: {
    totalProcessed: number;
    totalCorrelated: number;
    totalEscalated: number;
    totalResolved: number;
    averageProcessingTime: number;
    processingTimes: number[];
  };
  
  constructor(
    config: AlertingConfiguration,
    securityAnalytics: SecurityAlertingAnalytics,
    healthMonitoring: HealthMonitoringService,
    projectHealthService: ProjectHealthAlertService
  ) {
    super();
    
    this.config = config;
    this.securityAnalytics = securityAnalytics;
    this.healthMonitoring = healthMonitoring;
    this.projectHealthService = projectHealthService;
    
    this.initializeMetrics();
    this.setupServiceIntegrations();
    this.loadConfiguration();
    this.startProcessingLoop();
    
    logger.info('Unified Security Alerting Framework initialized');
  }
  
  /**
   * Process incoming alert from any source
   */
  async processAlert(
    title: string,
    description: string,
    priority: AlertPriority,
    category: AlertCategory,
    source: AlertSource,
    metadata: Partial<UnifiedAlert> = {}
  ): Promise<UnifiedAlert> {
    const startTime = Date.now();
    
    try {
      // Create unified alert
      const alert: UnifiedAlert = {
        id: this.generateAlertId(),
        title,
        description,
        priority,
        category,
        source,
        status: AlertStatus.NEW,
        createdAt: new Date(),
        updatedAt: new Date(),
        affectedResources: [],
        severity: this.mapPriorityToSeverity(priority),
        confidenceScore: 0.8, // Default confidence
        riskScore: this.calculateRiskScore(priority, category),
        correlatedAlerts: [],
        responseActions: [],
        comments: [],
        attachments: [],
        tags: [],
        automatedResponse: false,
        requiresManualReview: priority === AlertPriority.CRITICAL || priority === AlertPriority.EMERGENCY,
        escalationRules: [],
        ...metadata
      };
      
      // Store alert
      this.alerts.set(alert.id, alert);
      
      // Add to processing queue
      this.processingQueue.push(alert);
      
      // Emit alert created event
      this.emit('alertCreated', alert);
      
      // Process immediately if high priority
      if (priority === AlertPriority.CRITICAL || priority === AlertPriority.EMERGENCY) {
        await this.processAlertImmediate(alert);
      }
      
      // Update metrics
      this.updateProcessingMetrics(Date.now() - startTime);
      
      logger.info(`Alert created: ${alert.id}`, {
        title: alert.title,
        priority: alert.priority,
        category: alert.category,
        source: alert.source
      });
      
      return alert;
      
    } catch (error) {
      logger.error('Failed to process alert', {
        title,
        priority,
        category,
        source,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  /**
   * Get alert by ID
   */
  getAlert(alertId: string): UnifiedAlert | null {
    return this.alerts.get(alertId) || null;
  }
  
  /**
   * Get all alerts with filtering
   */
  getAlerts(
    filters: {
      status?: AlertStatus[];
      priority?: AlertPriority[];
      category?: AlertCategory[];
      source?: AlertSource[];
      workspaceId?: string;
      projectId?: string;
      userId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): UnifiedAlert[] {
    let alerts = Array.from(this.alerts.values());
    
    // Apply filters
    if (filters.status) {
      alerts = alerts.filter(a => filters.status!.includes(a.status));
    }
    if (filters.priority) {
      alerts = alerts.filter(a => filters.priority!.includes(a.priority));
    }
    if (filters.category) {
      alerts = alerts.filter(a => filters.category!.includes(a.category));
    }
    if (filters.source) {
      alerts = alerts.filter(a => filters.source!.includes(a.source));
    }
    if (filters.workspaceId) {
      alerts = alerts.filter(a => a.workspaceId === filters.workspaceId);
    }
    if (filters.projectId) {
      alerts = alerts.filter(a => a.projectId === filters.projectId);
    }
    if (filters.userId) {
      alerts = alerts.filter(a => a.userId === filters.userId);
    }
    
    // Sort by priority and creation time
    alerts.sort((a, b) => {
      const priorityOrder = {
        [AlertPriority.EMERGENCY]: 5,
        [AlertPriority.CRITICAL]: 4,
        [AlertPriority.HIGH]: 3,
        [AlertPriority.MEDIUM]: 2,
        [AlertPriority.LOW]: 1
      };
      
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    // Apply pagination
    const start = filters.offset || 0;
    const end = start + (filters.limit || alerts.length);
    
    return alerts.slice(start, end);
  }
  
  /**
   * Update alert status
   */
  async updateAlertStatus(
    alertId: string,
    status: AlertStatus,
    userId?: string,
    comment?: string
  ): Promise<UnifiedAlert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }
    
    const previousStatus = alert.status;
    alert.status = status;
    alert.updatedAt = new Date();
    
    // Set status-specific timestamps
    switch (status) {
    case AlertStatus.ACKNOWLEDGED:
      alert.acknowledgedAt = new Date();
      break;
    case AlertStatus.RESOLVED:
    case AlertStatus.CLOSED:
      alert.resolvedAt = new Date();
      break;
    case AlertStatus.ESCALATED:
      alert.escalatedAt = new Date();
      break;
    }
    
    // Add comment if provided
    if (comment && userId) {
      this.addAlertComment(alertId, userId, comment);
    }
    
    // Emit status change event
    this.emit('alertStatusChanged', {
      alert,
      previousStatus,
      newStatus: status,
      userId
    });
    
    logger.info(`Alert status updated: ${alertId}`, {
      previousStatus,
      newStatus: status,
      userId
    });
    
    return alert;
  }
  
  /**
   * Assign alert to user
   */
  async assignAlert(
    alertId: string,
    assigneeId: string,
    assignerId: string
  ): Promise<UnifiedAlert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }
    
    alert.assignedTo = assigneeId;
    alert.assignedBy = assignerId;
    alert.assignedAt = new Date();
    alert.updatedAt = new Date();
    
    // Automatically acknowledge if new
    if (alert.status === AlertStatus.NEW) {
      alert.status = AlertStatus.ACKNOWLEDGED;
      alert.acknowledgedAt = new Date();
    }
    
    this.emit('alertAssigned', {
      alert,
      assignee: assigneeId,
      assigner: assignerId
    });
    
    return alert;
  }
  
  /**
   * Add comment to alert
   */
  addAlertComment(
    alertId: string,
    userId: string,
    content: string,
    isSystemGenerated = false
  ): AlertComment {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }
    
    const comment: AlertComment = {
      id: this.generateCommentId(),
      alertId,
      userId,
      content,
      createdAt: new Date(),
      isSystemGenerated
    };
    
    alert.comments.push(comment);
    alert.updatedAt = new Date();
    
    this.emit('alertCommentAdded', { alert, comment });
    
    return comment;
  }
  
  /**
   * Execute response action
   */
  async executeResponseAction(
    alertId: string,
    actionType: AlertResponseAction['actionType'],
    parameters: Record<string, any>,
    executedBy: string
  ): Promise<AlertResponseAction> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }
    
    const action: AlertResponseAction = {
      id: this.generateActionId(),
      alertId,
      actionType,
      status: 'IN_PROGRESS',
      executedBy,
      executedAt: new Date(),
      description: `Executing ${actionType} action`,
      parameters
    };
    
    alert.responseActions.push(action);
    
    try {
      // Execute the action based on type
      const result = await this.performResponseAction(actionType, parameters, alert);
      
      action.status = 'COMPLETED';
      action.completedAt = new Date();
      action.result = result;
      
      this.emit('responseActionCompleted', { alert, action });
      
    } catch (error) {
      action.status = 'FAILED';
      action.completedAt = new Date();
      action.result = {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
      
      this.emit('responseActionFailed', { alert, action, error });
    }
    
    return action;
  }
  
  /**
   * Get alert dashboard data
   */
  getAlertDashboard(): AlertDashboard {
    const allAlerts = Array.from(this.alerts.values());
    const activeAlerts = allAlerts.filter(a => 
      a.status !== AlertStatus.RESOLVED && 
      a.status !== AlertStatus.CLOSED && 
      a.status !== AlertStatus.DISMISSED
    );
    
    const summary = {
      totalActive: activeAlerts.length,
      critical: activeAlerts.filter(a => 
        a.priority === AlertPriority.CRITICAL || 
        a.priority === AlertPriority.EMERGENCY
      ).length,
      high: activeAlerts.filter(a => a.priority === AlertPriority.HIGH).length,
      newAlerts: activeAlerts.filter(a => a.status === AlertStatus.NEW).length,
      unassigned: activeAlerts.filter(a => !a.assignedTo).length
    };
    
    const recentAlerts = allAlerts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
    
    const topPriorities = activeAlerts
      .filter(a => a.priority === AlertPriority.CRITICAL || a.priority === AlertPriority.EMERGENCY)
      .slice(0, 5);
    
    return {
      summary,
      recentAlerts,
      topPriorities,
      systemHealth: {} as SystemHealthSummary, // Would be populated from health monitoring
      trendAnalysis: this.generateTrendAnalysis(),
      recommendations: this.generateRecommendations()
    };
  }
  
  /**
   * Get alerting metrics
   */
  getMetrics(): AlertMetrics {
    const allAlerts = Array.from(this.alerts.values());
    
    // Calculate metrics
    const alertsByPriority = allAlerts.reduce((acc, alert) => {
      acc[alert.priority] = (acc[alert.priority] || 0) + 1;
      return acc;
    }, {} as Record<AlertPriority, number>);
    
    const alertsByCategory = allAlerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {} as Record<AlertCategory, number>);
    
    const alertsBySource = allAlerts.reduce((acc, alert) => {
      acc[alert.source] = (acc[alert.source] || 0) + 1;
      return acc;
    }, {} as Record<AlertSource, number>);
    
    const alertsByStatus = allAlerts.reduce((acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    }, {} as Record<AlertStatus, number>);
    
    // Calculate resolution times
    const resolvedAlerts = allAlerts.filter(a => a.resolvedAt);
    const avgResolutionTime = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((sum, alert) => {
        return sum + (alert.resolvedAt!.getTime() - alert.createdAt.getTime());
      }, 0) / resolvedAlerts.length
      : 0;
    
    return {
      totalAlerts: allAlerts.length,
      alertsByPriority,
      alertsByCategory,
      alertsBySource,
      alertsByStatus,
      averageResolutionTime: avgResolutionTime,
      averageResponseTime: this.metrics.averageProcessingTime,
      falsePositiveRate: 0, // Would be calculated based on dismissals
      escalationRate: this.metrics.totalEscalated / Math.max(this.metrics.totalProcessed, 1),
      automatedResolutionRate: 0, // Would be calculated based on automated responses
      recentTrends: {
        hourly: [],
        daily: [],
        weekly: []
      },
      topAlertTypes: [],
      performanceMetrics: {
        processingTime: this.metrics.averageProcessingTime,
        correlationAccuracy: 0, // Would be calculated
        systemLoad: 0 // Would be calculated
      }
    };
  }
  
  // PRIVATE HELPER METHODS
  
  private initializeMetrics(): void {
    this.metrics = {
      totalProcessed: 0,
      totalCorrelated: 0,
      totalEscalated: 0,
      totalResolved: 0,
      averageProcessingTime: 0,
      processingTimes: []
    };
  }
  
  private setupServiceIntegrations(): void {
    // Listen to security analytics alerts
    this.securityAnalytics.on('alertProcessed', async (data) => {
      await this.processAlert(
        `Security Alert: ${data.alert.type}`,
        data.alert.description || 'Security event detected',
        this.mapSeverityToPriority(data.alert.severity),
        AlertCategory.THREAT_DETECTION,
        AlertSource.SECURITY_ANALYTICS,
        {
          originalAlert: data.alert,
          workspaceId: data.alert.workspaceId,
          userId: data.alert.userId,
          confidenceScore: data.alert.confidence || 0.8
        }
      );
    });
    
    // Listen to health monitoring alerts
    this.healthMonitoring.on('statusChange', async (data) => {
      if (data.to === HealthStatus.UNHEALTHY || data.to === HealthStatus.CRITICAL) {
        await this.processAlert(
          `System Health Alert: ${data.to}`,
          `System health status changed from ${data.from} to ${data.to}`,
          data.to === HealthStatus.CRITICAL ? AlertPriority.CRITICAL : AlertPriority.HIGH,
          AlertCategory.SYSTEM_HEALTH,
          AlertSource.HEALTH_MONITORING,
          {
            originalAlert: data,
            riskScore: data.to === HealthStatus.CRITICAL ? 90 : 70
          }
        );
      }
    });
  }
  
  private loadConfiguration(): void {
    // Load notification channels
    this.config.notificationChannels.forEach(channel => {
      this.notificationChannels.set(channel.id, channel);
    });
    
    // Load escalation rules
    this.escalationRules = [...this.config.escalationChain];
  }
  
  private async startProcessingLoop(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    const processAlerts = async () => {
      if (this.processingQueue.length === 0) {
        setTimeout(processAlerts, 1000);
        return;
      }
      
      const alertsToProcess = this.processingQueue.splice(0, this.config.batchSize);
      
      for (const alert of alertsToProcess) {
        try {
          await this.processAlertFull(alert);
        } catch (error) {
          logger.error(`Failed to process alert ${alert.id}`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      setTimeout(processAlerts, 100);
    };
    
    processAlerts();
  }
  
  private async processAlertImmediate(alert: UnifiedAlert): Promise<void> {
    await this.processAlertFull(alert);
  }
  
  private async processAlertFull(alert: UnifiedAlert): Promise<void> {
    // Correlation analysis
    if (this.config.enableCorrelation) {
      await this.performCorrelationAnalysis(alert);
    }
    
    // Apply alert rules
    await this.applyAlertRules(alert);
    
    // Check escalation conditions
    await this.checkEscalationConditions(alert);
    
    // Send notifications
    await this.sendNotifications(alert);
    
    this.metrics.totalProcessed++;
  }
  
  private async performCorrelationAnalysis(alert: UnifiedAlert): Promise<void> {
    const correlationWindow = this.config.correlationTimeWindow;
    const cutoff = Date.now() - correlationWindow;
    
    const recentAlerts = Array.from(this.alerts.values())
      .filter(a => 
        a.id !== alert.id &&
        a.createdAt.getTime() > cutoff &&
        this.shouldCorrelate(alert, a)
      );
    
    if (recentAlerts.length > 0) {
      const correlatedIds = recentAlerts.map(a => a.id);
      alert.correlatedAlerts.push(...correlatedIds);
      
      // Update correlated alerts
      recentAlerts.forEach(a => {
        if (!a.correlatedAlerts.includes(alert.id)) {
          a.correlatedAlerts.push(alert.id);
        }
      });
      
      this.metrics.totalCorrelated++;
      
      this.emit('alertsCorrelated', {
        primaryAlert: alert,
        correlatedAlerts: recentAlerts
      });
    }
  }
  
  private shouldCorrelate(alert1: UnifiedAlert, alert2: UnifiedAlert): boolean {
    // Correlation logic
    return (
      alert1.category === alert2.category ||
      alert1.workspaceId === alert2.workspaceId ||
      alert1.projectId === alert2.projectId ||
      alert1.userId === alert2.userId ||
      alert1.affectedResources.some(r => alert2.affectedResources.includes(r))
    );
  }
  
  private async applyAlertRules(alert: UnifiedAlert): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;
      
      if (this.ruleMatches(alert, rule)) {
        await this.executeRuleActions(alert, rule);
        
        rule.lastTriggered = new Date();
        rule.triggerCount++;
      }
    }
  }
  
  private ruleMatches(alert: UnifiedAlert, rule: AlertRule): boolean {
    // Check if rule applies to this alert
    if (!rule.sources.includes(alert.source)) return false;
    if (!rule.categories.includes(alert.category)) return false;
    
    const priorityOrder = {
      [AlertPriority.LOW]: 1,
      [AlertPriority.MEDIUM]: 2,
      [AlertPriority.HIGH]: 3,
      [AlertPriority.CRITICAL]: 4,
      [AlertPriority.EMERGENCY]: 5
    };
    
    if (priorityOrder[alert.priority] < priorityOrder[rule.minimumPriority]) return false;
    
    // Check conditions
    return rule.conditions.every(condition => this.conditionMatches(alert, condition));
  }
  
  private conditionMatches(alert: UnifiedAlert, condition: AlertCondition): boolean {
    const alertValue = this.getAlertFieldValue(alert, condition.field);
    
    switch (condition.operator) {
    case 'EQUALS':
      return alertValue === condition.value;
    case 'NOT_EQUALS':
      return alertValue !== condition.value;
    case 'CONTAINS':
      return String(alertValue).includes(String(condition.value));
    case 'NOT_CONTAINS':
      return !String(alertValue).includes(String(condition.value));
    case 'GREATER_THAN':
      return Number(alertValue) > Number(condition.value);
    case 'LESS_THAN':
      return Number(alertValue) < Number(condition.value);
    case 'IN':
      return Array.isArray(condition.value) && condition.value.includes(alertValue);
    case 'NOT_IN':
      return Array.isArray(condition.value) && !condition.value.includes(alertValue);
    case 'REGEX':
      return new RegExp(String(condition.value)).test(String(alertValue));
    default:
      return false;
    }
  }
  
  private getAlertFieldValue(alert: UnifiedAlert, field: string): unknown {
    // Navigate nested fields like 'originalAlert.type'
    const parts = field.split('.');
    let value: Error = alert;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  private async executeRuleActions(alert: UnifiedAlert, rule: AlertRule): Promise<void> {
    for (const action of rule.actions) {
      if (!action.enabled) continue;
      
      try {
        await this.executeAction(alert, action);
      } catch (error) {
        logger.error(`Failed to execute rule action for alert ${alert.id}`, {
          ruleId: rule.id,
          actionType: action.type,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
  
  private async executeAction(alert: UnifiedAlert, action: RuleAction): Promise<void> {
    switch (action.type) {
    case 'EMAIL':
      await this.sendEmailNotification(alert, action.parameters);
      break;
    case 'WEBHOOK':
      await this.sendWebhookNotification(alert, action.parameters);
      break;
    case 'UPDATE_STATUS':
      await this.updateAlertStatus(alert.id, action.parameters.status);
      break;
    case 'ASSIGN':
      await this.assignAlert(alert.id, action.parameters.assignee, 'system');
      break;
      // Additional action types would be implemented here
    }
  }
  
  private async checkEscalationConditions(____alert: UnifiedAlert): Promise<void> {
    // Escalation logic would be implemented here
  }
  
  private async sendNotifications(alert: UnifiedAlert): Promise<void> {
    for (const channel of this.notificationChannels.values()) {
      if (!channel.enabled) continue;
      
      if (this.shouldNotifyChannel(alert, channel)) {
        await this.sendChannelNotification(alert, channel);
      }
    }
  }
  
  private shouldNotifyChannel(alert: UnifiedAlert, channel: NotificationChannel): boolean {
    return channel.conditions.every(condition => 
      this.conditionMatches(alert, {
        field: condition.field,
        operator: condition.operator as any,
        value: condition.value,
        weight: 1
      })
    );
  }
  
  private async sendChannelNotification(alert: UnifiedAlert, channel: NotificationChannel): Promise<void> {
    // Channel-specific notification logic would be implemented here
    logger.info(`Sending notification via ${channel.type}`, {
      alertId: alert.id,
      channelId: channel.id
    });
  }
  
  private async performResponseAction(
    actionType: AlertResponseAction['actionType'],
    ____parameters: Record<string, any>,
    ____alert: UnifiedAlert
  ): Promise<{ success: boolean; message: string; details?: unknown }> {
    // Response action implementation would go here
    return { success: true, message: `${actionType} executed successfully` };
  }
  
  private async sendEmailNotification(____alert: UnifiedAlert, ____parameters: unknown): Promise<void> {
    // Email notification implementation
  }
  
  private async sendWebhookNotification(____alert: UnifiedAlert, ____parameters: unknown): Promise<void> {
    // Webhook notification implementation
  }
  
  private generateTrendAnalysis(): unknown {
    return {
      alertVolume: [],
      resolutionTimes: [],
      escalationRates: []
    };
  }
  
  private generateRecommendations(): unknown[] {
    return [];
  }
  
  private updateProcessingMetrics(processingTime: number): void {
    this.metrics.processingTimes.push(processingTime);
    if (this.metrics.processingTimes.length > 100) {
      this.metrics.processingTimes.shift();
    }
    
    this.metrics.averageProcessingTime = 
      this.metrics.processingTimes.reduce((sum, time) => sum + time, 0) / 
      this.metrics.processingTimes.length;
  }
  
  private mapPriorityToSeverity(priority: AlertPriority): 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' {
    switch (priority) {
    case AlertPriority.LOW:
      return 'INFO';
    case AlertPriority.MEDIUM:
      return 'WARNING';
    case AlertPriority.HIGH:
      return 'ERROR';
    case AlertPriority.CRITICAL:
    case AlertPriority.EMERGENCY:
      return 'CRITICAL';
    }
  }
  
  private mapSeverityToPriority(severity: string): AlertPriority {
    switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return AlertPriority.CRITICAL;
    case 'HIGH':
      return AlertPriority.HIGH;
    case 'MEDIUM':
      return AlertPriority.MEDIUM;
    case 'LOW':
      return AlertPriority.LOW;
    default:
      return AlertPriority.MEDIUM;
    }
  }
  
  private calculateRiskScore(priority: AlertPriority, category: AlertCategory): number {
    const baseScores = {
      [AlertPriority.EMERGENCY]: 95,
      [AlertPriority.CRITICAL]: 85,
      [AlertPriority.HIGH]: 70,
      [AlertPriority.MEDIUM]: 50,
      [AlertPriority.LOW]: 25
    };
    
    const categoryMultipliers = {
      [AlertCategory.SECURITY_INCIDENT]: 1.2,
      [AlertCategory.THREAT_DETECTION]: 1.15,
      [AlertCategory.DATA_ACCESS]: 1.1,
      [AlertCategory.AUTHENTICATION]: 1.1,
      [AlertCategory.AUTHORIZATION]: 1.1,
      [AlertCategory.SYSTEM_HEALTH]: 1.0,
      [AlertCategory.PROJECT_HEALTH]: 0.8,
      [AlertCategory.PERFORMANCE]: 0.9,
      [AlertCategory.AVAILABILITY]: 1.0,
      [AlertCategory.COMPLIANCE]: 1.05
    };
    
    return Math.min(100, Math.round(baseScores[priority] * categoryMultipliers[category]));
  }
  
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateCommentId(): string {
    return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Cleanup resources and stop processing
   */
  destroy(): void {
    this.isProcessing = false;
    this.removeAllListeners();
    logger.info('Unified Security Alerting Framework destroyed');
  }
}

export default UnifiedSecurityAlertingFramework;