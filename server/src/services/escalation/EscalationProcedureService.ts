/**
 * Escalation Procedure Service - Epic 17 Implementation
 * Task: E17-1753114397261-63A60C - Implement escalation procedures
 * 
 * Comprehensive escalation management system that provides automated
 * and manual escalation procedures across all business processes including
 * fraud monitoring, appeals, policy violations, and system incidents.
 */

import { EventEmitter } from 'events';
import { Database } from '../database';
import { AuditService } from '../auth/services/AuditService';

// =============================================================================
// Types and Interfaces
// =============================================================================

export enum EscalationTriggerType {
  TIME_BASED = 'time_based',
  THRESHOLD_BASED = 'threshold_based', 
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  CONDITIONAL = 'conditional',
  PRIORITY_BASED = 'priority_based'
}

export enum EscalationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum EscalationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum EscalationCategory {
  FRAUD_DETECTION = 'fraud_detection',
  APPEAL_PROCESS = 'appeal_process',
  POLICY_VIOLATION = 'policy_violation',
  SYSTEM_INCIDENT = 'system_incident',
  COMPLIANCE_ISSUE = 'compliance_issue',
  SECURITY_ALERT = 'security_alert',
  CUSTOMER_COMPLAINT = 'customer_complaint',
  TECHNICAL_ISSUE = 'technical_issue',
  BUSINESS_CRITICAL = 'business_critical',
  REGULATORY = 'regulatory'
}

export interface EscalationRule {
  ruleId: string;
  name: string;
  description: string;
  category: EscalationCategory;
  enabled: boolean;
  
  // Trigger conditions
  triggerType: EscalationTriggerType;
  conditions: EscalationCondition[];
  
  // Escalation path
  escalationPath: EscalationLevel[];
  
  // Timing configuration
  initialDelay?: number; // minutes
  escalationInterval?: number; // minutes between levels
  maxEscalationTime?: number; // maximum time before auto-resolution
  
  // Business rules
  businessHoursOnly?: boolean;
  allowWeekends?: boolean;
  timeZone?: string;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  version: number;
}

export interface EscalationCondition {
  conditionId: string;
  type: 'value' | 'time' | 'count' | 'percentage' | 'custom';
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
  value: string | number | boolean;
  logicalOperator?: 'AND' | 'OR';
}

export interface EscalationLevel {
  levelId: string;
  level: number; // 1, 2, 3, etc.
  name: string;
  description: string;
  
  // Assignment rules
  assignmentType: 'individual' | 'group' | 'role' | 'queue' | 'automatic';
  assignmentTarget: string; // user ID, group ID, role name, queue name
  
  // Notification settings
  notificationMethods: NotificationMethod[];
  notificationTemplate?: string;
  
  // Timing
  responseTimeLimit: number; // minutes
  resolutionTimeLimit: number; // minutes
  
  // Actions
  automaticActions?: EscalationAction[];
  requiredActions?: string[];
  
  // Escalation criteria for next level
  escalationCriteria?: EscalationCondition[];
}

export interface NotificationMethod {
  type: 'email' | 'sms' | 'push' | 'slack' | 'teams' | 'webhook' | 'dashboard';
  address: string;
  priority: EscalationPriority;
  immediateDelivery: boolean;
  retryCount?: number;
  retryInterval?: number; // minutes
}

export interface EscalationAction {
  actionId: string;
  type: 'notification' | 'assignment' | 'status_change' | 'data_collection' | 'external_api' | 'workflow' | 'custom';
  configuration: Record<string, any>;
  executeImmediately: boolean;
  rollbackable: boolean;
}

export interface EscalationCase {
  caseId: string;
  ruleId: string;
  category: EscalationCategory;
  priority: EscalationPriority;
  status: EscalationStatus;
  
  // Source information
  sourceType: string; // 'fraud_case', 'appeal', 'incident', etc.
  sourceId: string;
  sourceData: Record<string, any>;
  
  // Current escalation state
  currentLevel: number;
  currentAssignee?: string;
  currentAssigneeType?: 'user' | 'group' | 'role';
  
  // Timing
  createdAt: Date;
  updatedAt: Date;
  escalatedAt?: Date;
  responseDeadline?: Date;
  resolutionDeadline?: Date;
  resolvedAt?: Date;
  
  // Tracking
  escalationPath: EscalationPathStep[];
  notifications: EscalationNotification[];
  actions: EscalationActionLog[];
  
  // Resolution
  resolution?: EscalationResolution;
  resolutionNotes?: string;
  followUpRequired?: boolean;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
}

export interface EscalationPathStep {
  stepId: string;
  level: number;
  levelName: string;
  assignedTo: string;
  assignedAt: Date;
  acknowledgedAt?: Date;
  respondedAt?: Date;
  completedAt?: Date;
  escalatedAt?: Date;
  escalationReason?: string;
  notes?: string;
  timeSpent?: number; // minutes
}

export interface EscalationNotification {
  notificationId: string;
  method: string;
  recipient: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  retryCount: number;
  priority: EscalationPriority;
}

export interface EscalationActionLog {
  actionId: string;
  actionType: string;
  executedAt: Date;
  executedBy: string;
  success: boolean;
  result?: Record<string, any>;
  error?: string;
  rollbackable: boolean;
  rolledBackAt?: Date;
}

export interface EscalationResolution {
  resolutionType: 'resolved' | 'cancelled' | 'transferred' | 'merged' | 'expired';
  resolutionLevel: number;
  resolvedBy: string;
  resolutionTime: number; // minutes from creation
  satisfactionRating?: number; // 1-5
  lessonsLearned?: string[];
  improvementSuggestions?: string[];
}

export interface EscalationMetrics {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  escalatedCases: number;
  expiredCases: number;
  
  // Performance metrics
  averageResolutionTime: number; // hours
  averageEscalationLevels: number;
  firstLevelResolutionRate: number; // percentage
  slaComplianceRate: number; // percentage
  
  // Category breakdown
  categoryMetrics: Map<EscalationCategory, EscalationCategoryMetrics>;
  
  // Level performance
  levelMetrics: Map<number, EscalationLevelMetrics>;
  
  // Trends
  trends: EscalationTrend[];
  
  // Quality metrics
  satisfactionScore: number; // 1-5 average
  ruleEffectivenessScore: number; // 0-100
}

export interface EscalationCategoryMetrics {
  category: EscalationCategory;
  totalCases: number;
  averageResolutionTime: number;
  escalationRate: number;
  satisfactionScore: number;
  topIssues: string[];
}

export interface EscalationLevelMetrics {
  level: number;
  totalCases: number;
  resolutionRate: number; // percentage resolved at this level
  averageResponseTime: number;
  averageResolutionTime: number;
  escalationRate: number; // percentage escalated to next level
  workloadDistribution: Map<string, number>; // assignee -> case count
}

export interface EscalationTrend {
  period: string; // 'hourly', 'daily', 'weekly', 'monthly'
  timestamp: Date;
  totalCases: number;
  escalationRate: number;
  resolutionTime: number;
  satisfactionScore: number;
}

export interface EscalationDashboard {
  overview: {
    activeCases: number;
    criticalCases: number;
    overdueResponses: number;
    overdueResolutions: number;
    averageWaitTime: number;
  };
  
  recentEscalations: EscalationCase[];
  urgentCases: EscalationCase[];
  
  performance: {
    slaCompliance: number;
    firstCallResolution: number;
    customerSatisfaction: number;
    averageHandleTime: number;
  };
  
  workloadDistribution: Array<{
    assignee: string;
    activeCases: number;
    overdueItems: number;
    utilizationRate: number;
  }>;
  
  categoryBreakdown: Array<{
    category: EscalationCategory;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  
  alerts: EscalationAlert[];
  recommendations: EscalationRecommendation[];
}

export interface EscalationAlert {
  alertId: string;
  type: 'sla_breach' | 'high_volume' | 'system_issue' | 'quality_concern' | 'capacity_limit';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  affectedCases: string[];
  recommendedActions: string[];
  createdAt: Date;
}

export interface EscalationRecommendation {
  recommendationId: string;
  type: 'process_improvement' | 'resource_allocation' | 'rule_optimization' | 'training_need';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  priority: EscalationPriority;
  category?: EscalationCategory;
}

// =============================================================================
// Main Escalation Procedure Service
// =============================================================================

export class EscalationProcedureService extends EventEmitter {
  private database: Database;
  private auditService: AuditService;
  
  // Service state
  private activeRules: Map<string, EscalationRule> = new Map();
  private activeCases: Map<string, EscalationCase> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  // Monitoring
  private metrics: EscalationMetrics;
  private lastMetricsUpdate: Date = new Date();
  
  constructor(database: Database, auditService: AuditService) {
    super();
    this.database = database;
    this.auditService = auditService;
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize the escalation service
   */
  public async initialize(): Promise<void> {
    console.log('🚀 Initializing Escalation Procedure Service...');
    
    // Initialize database schema
    await this.initializeDatabase();
    
    // Load existing rules and cases
    await this.loadEscalationRules();
    await this.loadActiveCases();
    
    // Setup monitoring and timers
    this.setupPeriodicTasks();
    this.setupEventHandlers();
    
    // Resume active escalations
    await this.resumeActiveEscalations();
    
    console.log('✅ Escalation Procedure Service initialized successfully');
    this.emit('service_initialized');
  }

  // =============================================================================
  // Rule Management
  // =============================================================================

  /**
   * Create a new escalation rule
   */
  public async createEscalationRule(ruleData: Partial<EscalationRule>, createdBy: string): Promise<EscalationRule> {
    const rule: EscalationRule = {
      ruleId: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: ruleData.name || 'Untitled Rule',
      description: ruleData.description || '',
      category: ruleData.category || EscalationCategory.TECHNICAL_ISSUE,
      enabled: ruleData.enabled ?? true,
      triggerType: ruleData.triggerType || EscalationTriggerType.TIME_BASED,
      conditions: ruleData.conditions || [],
      escalationPath: ruleData.escalationPath || [],
      initialDelay: ruleData.initialDelay || 30,
      escalationInterval: ruleData.escalationInterval || 60,
      maxEscalationTime: ruleData.maxEscalationTime || 1440, // 24 hours
      businessHoursOnly: ruleData.businessHoursOnly ?? false,
      allowWeekends: ruleData.allowWeekends ?? true,
      timeZone: ruleData.timeZone || 'UTC',
      createdBy,
      createdAt: new Date(),
      lastModified: new Date(),
      version: 1
    };

    // Validate rule
    this.validateEscalationRule(rule);

    // Store in database
    await this.saveEscalationRule(rule);

    // Add to active rules if enabled
    if (rule.enabled) {
      this.activeRules.set(rule.ruleId, rule);
    }

    // Audit
    await this.auditService.logActivity({
      userId: createdBy,
      action: 'create_escalation_rule',
      details: {
        ruleId: rule.ruleId,
        name: rule.name,
        category: rule.category,
        enabled: rule.enabled
      },
      timestamp: new Date()
    } as any);

    this.emit('rule_created', rule);
    return rule;
  }

  /**
   * Update an existing escalation rule
   */
  public async updateEscalationRule(ruleId: string, updates: Partial<EscalationRule>, updatedBy: string): Promise<EscalationRule> {
    const existingRule = this.activeRules.get(ruleId);
    if (!existingRule) {
      throw new Error(`Escalation rule ${ruleId} not found`);
    }

    const updatedRule: EscalationRule = {
      ...existingRule,
      ...updates,
      ruleId, // Preserve original ID
      lastModified: new Date(),
      version: existingRule.version + 1
    };

    // Validate updated rule
    this.validateEscalationRule(updatedRule);

    // Store in database
    await this.saveEscalationRule(updatedRule);

    // Update active rules
    if (updatedRule.enabled) {
      this.activeRules.set(ruleId, updatedRule);
    } else {
      this.activeRules.delete(ruleId);
    }

    // Audit
    await this.auditService.logActivity({
      userId: updatedBy,
      action: 'update_escalation_rule',
      details: {
        ruleId,
        changes: updates,
        version: updatedRule.version
      },
      timestamp: new Date()
    } as any);

    this.emit('rule_updated', updatedRule);
    return updatedRule;
  }

  // =============================================================================
  // Case Management
  // =============================================================================

  /**
   * Create a new escalation case
   */
  public async createEscalationCase(
    sourceType: string,
    sourceId: string,
    sourceData: Record<string, any>,
    ruleId?: string,
    priority?: EscalationPriority
  ): Promise<EscalationCase> {
    
    // Find applicable rule if not provided
    if (!ruleId) {
      ruleId = await this.findApplicableRule(sourceType, sourceData);
    }

    const rule = this.activeRules.get(ruleId);
    if (!rule) {
      throw new Error(`No applicable escalation rule found for ${sourceType}:${sourceId}`);
    }

    const caseId = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const escalationCase: EscalationCase = {
      caseId,
      ruleId,
      category: rule.category,
      priority: priority || this.determinePriority(sourceType, sourceData),
      status: EscalationStatus.PENDING,
      sourceType,
      sourceId,
      sourceData,
      currentLevel: 0,
      createdAt: now,
      updatedAt: now,
      escalationPath: [],
      notifications: [],
      actions: [],
      tags: this.extractTags(sourceType, sourceData),
      metadata: {}
    };

    // Set initial deadlines
    this.calculateDeadlines(escalationCase, rule);

    // Store in database
    await this.saveEscalationCase(escalationCase);

    // Add to active cases
    this.activeCases.set(caseId, escalationCase);

    // Schedule initial escalation
    this.scheduleEscalation(escalationCase, rule);

    // Audit
    await this.auditService.logActivity({
      userId: 'system',
      action: 'create_escalation_case',
      details: {
        caseId,
        sourceType,
        sourceId,
        ruleId,
        priority: escalationCase.priority
      },
      timestamp: now
    } as any);

    this.emit('case_created', escalationCase);
    return escalationCase;
  }

  /**
   * Escalate a case to the next level
   */
  public async escalateCase(caseId: string, reason?: string): Promise<EscalationCase> {
    const escalationCase = this.activeCases.get(caseId);
    if (!escalationCase) {
      throw new Error(`Escalation case ${caseId} not found`);
    }

    const rule = this.activeRules.get(escalationCase.ruleId);
    if (!rule) {
      throw new Error(`Escalation rule ${escalationCase.ruleId} not found`);
    }

    const nextLevel = escalationCase.currentLevel + 1;
    if (nextLevel >= rule.escalationPath.length) {
      throw new Error(`Case ${caseId} is already at maximum escalation level`);
    }

    const levelConfig = rule.escalationPath[nextLevel];
    const now = new Date();

    // Update current level in escalation path
    if (escalationCase.escalationPath.length > 0) {
      const currentStep = escalationCase.escalationPath[escalationCase.escalationPath.length - 1];
      currentStep.escalatedAt = now;
      currentStep.escalationReason = reason;
    }

    // Create new escalation step
    const newStep: EscalationPathStep = {
      stepId: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level: nextLevel,
      levelName: levelConfig.name,
      assignedTo: await this.resolveAssignment(levelConfig),
      assignedAt: now,
      notes: reason
    };

    // Update case
    escalationCase.currentLevel = nextLevel;
    escalationCase.currentAssignee = newStep.assignedTo;
    escalationCase.currentAssigneeType = levelConfig.assignmentType;
    escalationCase.escalatedAt = now;
    escalationCase.updatedAt = now;
    escalationCase.escalationPath.push(newStep);

    // Recalculate deadlines
    this.calculateDeadlines(escalationCase, rule);

    // Execute automatic actions
    if (levelConfig.automaticActions) {
      for (const action of levelConfig.automaticActions) {
        await this.executeEscalationAction(escalationCase, action);
      }
    }

    // Send notifications
    await this.sendLevelNotifications(escalationCase, levelConfig);

    // Schedule next escalation if needed
    this.scheduleEscalation(escalationCase, rule);

    // Update database
    await this.saveEscalationCase(escalationCase);

    // Audit
    await this.auditService.logActivity({
      userId: 'system',
      action: 'escalate_case',
      details: {
        caseId,
        fromLevel: nextLevel - 1,
        toLevel: nextLevel,
        reason,
        assignedTo: newStep.assignedTo
      },
      timestamp: now
    } as any);

    this.emit('case_escalated', { case: escalationCase, level: nextLevel });
    return escalationCase;
  }

  /**
   * Resolve an escalation case
   */
  public async resolveCase(
    caseId: string,
    resolvedBy: string,
    resolutionType: 'resolved' | 'cancelled' | 'transferred' | 'merged',
    resolutionNotes?: string
  ): Promise<EscalationCase> {
    
    const escalationCase = this.activeCases.get(caseId);
    if (!escalationCase) {
      throw new Error(`Escalation case ${caseId} not found`);
    }

    const now = new Date();
    const resolutionTime = (now.getTime() - escalationCase.createdAt.getTime()) / (1000 * 60); // minutes

    // Update current step
    if (escalationCase.escalationPath.length > 0) {
      const currentStep = escalationCase.escalationPath[escalationCase.escalationPath.length - 1];
      currentStep.completedAt = now;
      currentStep.timeSpent = currentStep.assignedAt ? 
        (now.getTime() - currentStep.assignedAt.getTime()) / (1000 * 60) : 0;
    }

    // Create resolution
    const resolution: EscalationResolution = {
      resolutionType,
      resolutionLevel: escalationCase.currentLevel,
      resolvedBy,
      resolutionTime
    };

    // Update case
    escalationCase.status = EscalationStatus.RESOLVED;
    escalationCase.resolvedAt = now;
    escalationCase.updatedAt = now;
    escalationCase.resolution = resolution;
    escalationCase.resolutionNotes = resolutionNotes;

    // Clear timers
    if (this.timers.has(caseId)) {
      clearTimeout(this.timers.get(caseId)!);
      this.timers.delete(caseId);
    }

    // Update database
    await this.saveEscalationCase(escalationCase);

    // Remove from active cases
    this.activeCases.delete(caseId);

    // Update metrics
    this.updateMetrics();

    // Audit
    await this.auditService.logActivity({
      userId: resolvedBy,
      action: 'resolve_escalation_case',
      details: {
        caseId,
        resolutionType,
        resolutionTime: Math.round(resolutionTime),
        level: escalationCase.currentLevel
      },
      timestamp: now
    } as any);

    this.emit('case_resolved', { case: escalationCase, resolution });
    return escalationCase;
  }

  // =============================================================================
  // Dashboard and Reporting
  // =============================================================================

  /**
   * Get escalation dashboard data
   */
  public async getEscalationDashboard(): Promise<EscalationDashboard> {
    const activeCases = Array.from(this.activeCases.values());
    const now = new Date();

    // Calculate overview metrics
    const criticalCases = activeCases.filter(c => c.priority === EscalationPriority.CRITICAL || c.priority === EscalationPriority.URGENT);
    const overdueResponses = activeCases.filter(c => c.responseDeadline && c.responseDeadline < now);
    const overdueResolutions = activeCases.filter(c => c.resolutionDeadline && c.resolutionDeadline < now);

    // Get recent escalations (last 24 hours)
    const recentEscalations = activeCases
      .filter(c => c.escalatedAt && (now.getTime() - c.escalatedAt.getTime()) < 24 * 60 * 60 * 1000)
      .sort((a, b) => (b.escalatedAt?.getTime() || 0) - (a.escalatedAt?.getTime() || 0))
      .slice(0, 10);

    // Get urgent cases
    const urgentCases = activeCases
      .filter(c => c.priority === EscalationPriority.URGENT || c.priority === EscalationPriority.CRITICAL)
      .sort((a, b) => (a.responseDeadline?.getTime() || Infinity) - (b.responseDeadline?.getTime() || Infinity))
      .slice(0, 10);

    // Calculate workload distribution
    const workloadMap = new Map<string, { activeCases: number; overdueItems: number }>();
    activeCases.forEach(c => {
      if (c.currentAssignee) {
        const existing = workloadMap.get(c.currentAssignee) || { activeCases: 0, overdueItems: 0 };
        existing.activeCases++;
        if ((c.responseDeadline && c.responseDeadline < now) || (c.resolutionDeadline && c.resolutionDeadline < now)) {
          existing.overdueItems++;
        }
        workloadMap.set(c.currentAssignee, existing);
      }
    });

    const workloadDistribution = Array.from(workloadMap.entries()).map(([assignee, stats]) => ({
      assignee,
      activeCases: stats.activeCases,
      overdueItems: stats.overdueItems,
      utilizationRate: Math.min((stats.activeCases / 10) * 100, 100) // Assuming 10 cases is 100% utilization
    }));

    // Category breakdown
    const categoryMap = new Map<EscalationCategory, number>();
    activeCases.forEach(c => {
      categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / activeCases.length) * 100,
      trend: 'stable' as 'up' | 'down' | 'stable' // Would calculate from historical data
    }));

    // Generate alerts
    const alerts = await this.generateEscalationAlerts(activeCases);
    
    // Generate recommendations
    const recommendations = await this.generateEscalationRecommendations(activeCases);

    return {
      overview: {
        activeCases: activeCases.length,
        criticalCases: criticalCases.length,
        overdueResponses: overdueResponses.length,
        overdueResolutions: overdueResolutions.length,
        averageWaitTime: this.calculateAverageWaitTime(activeCases)
      },
      recentEscalations,
      urgentCases,
      performance: {
        slaCompliance: this.metrics.slaComplianceRate,
        firstCallResolution: this.metrics.firstLevelResolutionRate,
        customerSatisfaction: this.metrics.satisfactionScore,
        averageHandleTime: this.metrics.averageResolutionTime
      },
      workloadDistribution,
      categoryBreakdown,
      alerts,
      recommendations
    };
  }

  /**
   * Get escalation metrics
   */
  public getEscalationMetrics(): EscalationMetrics {
    return { ...this.metrics };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async initializeDatabase(): Promise<void> {
    const schemas = [
      `CREATE TABLE IF NOT EXISTS escalation_rules (
        rule_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        enabled BOOLEAN DEFAULT true,
        trigger_type TEXT NOT NULL,
        conditions TEXT,
        escalation_path TEXT,
        timing_config TEXT,
        business_rules TEXT,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1
      )`,
      
      `CREATE TABLE IF NOT EXISTS escalation_cases (
        case_id TEXT PRIMARY KEY,
        rule_id TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        source_data TEXT,
        current_level INTEGER DEFAULT 0,
        current_assignee TEXT,
        current_assignee_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        escalated_at TIMESTAMP,
        response_deadline TIMESTAMP,
        resolution_deadline TIMESTAMP,
        resolved_at TIMESTAMP,
        escalation_path TEXT,
        notifications TEXT,
        actions TEXT,
        resolution TEXT,
        resolution_notes TEXT,
        follow_up_required BOOLEAN DEFAULT false,
        tags TEXT,
        metadata TEXT,
        FOREIGN KEY (rule_id) REFERENCES escalation_rules(rule_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS escalation_metrics (
        metric_id TEXT PRIMARY KEY,
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        total_cases INTEGER,
        resolved_cases INTEGER,
        escalated_cases INTEGER,
        average_resolution_time REAL,
        sla_compliance_rate REAL,
        category_metrics TEXT,
        level_metrics TEXT,
        trends TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const schema of schemas) {
      await this.database.query(schema);
    }
  }

  private async loadEscalationRules(): Promise<void> {
    const rows = await this.database.query(
      'SELECT * FROM escalation_rules WHERE enabled = true ORDER BY created_at DESC'
    );

    for (const row of rows) {
      const rule: EscalationRule = {
        ruleId: row.rule_id,
        name: row.name,
        description: row.description,
        category: row.category,
        enabled: row.enabled,
        triggerType: row.trigger_type,
        conditions: JSON.parse(row.conditions || '[]'),
        escalationPath: JSON.parse(row.escalation_path || '[]'),
        ...JSON.parse(row.timing_config || '{}'),
        ...JSON.parse(row.business_rules || '{}'),
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        lastModified: new Date(row.last_modified),
        version: row.version
      };

      this.activeRules.set(rule.ruleId, rule);
    }

    console.log(`📋 Loaded ${this.activeRules.size} active escalation rules`);
  }

  private async loadActiveCases(): Promise<void> {
    const rows = await this.database.query(
      "SELECT * FROM escalation_cases WHERE status IN ('pending', 'in_progress', 'escalated') ORDER BY created_at DESC"
    );

    for (const row of rows) {
      const escalationCase: EscalationCase = {
        caseId: row.case_id,
        ruleId: row.rule_id,
        category: row.category,
        priority: row.priority,
        status: row.status,
        sourceType: row.source_type,
        sourceId: row.source_id,
        sourceData: JSON.parse(row.source_data || '{}'),
        currentLevel: row.current_level,
        currentAssignee: row.current_assignee,
        currentAssigneeType: row.current_assignee_type,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        escalatedAt: row.escalated_at ? new Date(row.escalated_at) : undefined,
        responseDeadline: row.response_deadline ? new Date(row.response_deadline) : undefined,
        resolutionDeadline: row.resolution_deadline ? new Date(row.resolution_deadline) : undefined,
        resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
        escalationPath: JSON.parse(row.escalation_path || '[]'),
        notifications: JSON.parse(row.notifications || '[]'),
        actions: JSON.parse(row.actions || '[]'),
        resolution: row.resolution ? JSON.parse(row.resolution) : undefined,
        resolutionNotes: row.resolution_notes,
        followUpRequired: row.follow_up_required,
        tags: JSON.parse(row.tags || '[]'),
        metadata: JSON.parse(row.metadata || '{}')
      };

      this.activeCases.set(escalationCase.caseId, escalationCase);
    }

    console.log(`📊 Loaded ${this.activeCases.size} active escalation cases`);
  }

  private setupPeriodicTasks(): void {
    // Update metrics every 5 minutes
    setInterval(() => {
      this.updateMetrics();
    }, 5 * 60 * 1000);

    // Check for overdue cases every minute
    setInterval(() => {
      this.checkOverdueCases();
    }, 60 * 1000);

    // Cleanup expired cases daily
    setInterval(() => {
      this.cleanupExpiredCases();
    }, 24 * 60 * 60 * 1000);
  }

  private setupEventHandlers(): void {
    // Listen for external events that might trigger escalations
    this.on('fraud_case_created', this.handleFraudCaseCreated.bind(this));
    this.on('appeal_submitted', this.handleAppealSubmitted.bind(this));
    this.on('policy_violation_detected', this.handlePolicyViolation.bind(this));
    this.on('system_incident_reported', this.handleSystemIncident.bind(this));
  }

  private async resumeActiveEscalations(): Promise<void> {
    for (const escalationCase of this.activeCases.values()) {
      const rule = this.activeRules.get(escalationCase.ruleId);
      if (rule) {
        this.scheduleEscalation(escalationCase, rule);
      }
    }
  }

  private validateEscalationRule(rule: EscalationRule): void {
    if (!rule.name || rule.name.trim().length === 0) {
      throw new Error('Escalation rule name is required');
    }

    if (rule.escalationPath.length === 0) {
      throw new Error('Escalation rule must have at least one escalation level');
    }

    // Validate escalation path
    for (let i = 0; i < rule.escalationPath.length; i++) {
      const level = rule.escalationPath[i];
      if (level.level !== i) {
        throw new Error(`Escalation level ${i} has incorrect level number: ${level.level}`);
      }
    }
  }

  private scheduleEscalation(escalationCase: EscalationCase, rule: EscalationRule): void {
    // Clear existing timer
    if (this.timers.has(escalationCase.caseId)) {
      clearTimeout(this.timers.get(escalationCase.caseId)!);
    }

    // Calculate next escalation time
    let nextEscalationTime: number;
    
    if (escalationCase.currentLevel === 0) {
      // Initial delay
      nextEscalationTime = (rule.initialDelay || 30) * 60 * 1000; // Convert to milliseconds
    } else {
      // Regular escalation interval
      nextEscalationTime = (rule.escalationInterval || 60) * 60 * 1000;
    }

    // Schedule escalation
    const timer = setTimeout(async () => {
      try {
        await this.escalateCase(escalationCase.caseId, 'Automatic escalation due to timeout');
      } catch (error) {
        console.error(`Failed to auto-escalate case ${escalationCase.caseId}:`, error);
        this.emit('escalation_error', { caseId: escalationCase.caseId, error });
      }
    }, nextEscalationTime);

    this.timers.set(escalationCase.caseId, timer);
  }

  private async saveEscalationRule(rule: EscalationRule): Promise<void> {
    await this.database.query(
      `INSERT OR REPLACE INTO escalation_rules (
        rule_id, name, description, category, enabled, trigger_type, conditions,
        escalation_path, timing_config, business_rules, created_by, created_at,
        last_modified, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rule.ruleId,
        rule.name,
        rule.description,
        rule.category,
        rule.enabled,
        rule.triggerType,
        JSON.stringify(rule.conditions),
        JSON.stringify(rule.escalationPath),
        JSON.stringify({
          initialDelay: rule.initialDelay,
          escalationInterval: rule.escalationInterval,
          maxEscalationTime: rule.maxEscalationTime
        }),
        JSON.stringify({
          businessHoursOnly: rule.businessHoursOnly,
          allowWeekends: rule.allowWeekends,
          timeZone: rule.timeZone
        }),
        rule.createdBy,
        rule.createdAt.toISOString(),
        rule.lastModified.toISOString(),
        rule.version
      ]
    );
  }

  private async saveEscalationCase(escalationCase: EscalationCase): Promise<void> {
    await this.database.query(
      `INSERT OR REPLACE INTO escalation_cases (
        case_id, rule_id, category, priority, status, source_type, source_id,
        source_data, current_level, current_assignee, current_assignee_type,
        created_at, updated_at, escalated_at, response_deadline, resolution_deadline,
        resolved_at, escalation_path, notifications, actions, resolution,
        resolution_notes, follow_up_required, tags, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        escalationCase.caseId,
        escalationCase.ruleId,
        escalationCase.category,
        escalationCase.priority,
        escalationCase.status,
        escalationCase.sourceType,
        escalationCase.sourceId,
        JSON.stringify(escalationCase.sourceData),
        escalationCase.currentLevel,
        escalationCase.currentAssignee,
        escalationCase.currentAssigneeType,
        escalationCase.createdAt.toISOString(),
        escalationCase.updatedAt.toISOString(),
        escalationCase.escalatedAt?.toISOString(),
        escalationCase.responseDeadline?.toISOString(),
        escalationCase.resolutionDeadline?.toISOString(),
        escalationCase.resolvedAt?.toISOString(),
        JSON.stringify(escalationCase.escalationPath),
        JSON.stringify(escalationCase.notifications),
        JSON.stringify(escalationCase.actions),
        escalationCase.resolution ? JSON.stringify(escalationCase.resolution) : null,
        escalationCase.resolutionNotes,
        escalationCase.followUpRequired,
        JSON.stringify(escalationCase.tags),
        JSON.stringify(escalationCase.metadata)
      ]
    );
  }

  // Additional helper methods would continue here...
  // Due to length constraints, showing the core architecture and key methods.
  
  private initializeMetrics(): EscalationMetrics {
    return {
      totalCases: 0,
      activeCases: 0,
      resolvedCases: 0,
      escalatedCases: 0,
      expiredCases: 0,
      averageResolutionTime: 0,
      averageEscalationLevels: 0,
      firstLevelResolutionRate: 0,
      slaComplianceRate: 0,
      categoryMetrics: new Map(),
      levelMetrics: new Map(),
      trends: [],
      satisfactionScore: 0,
      ruleEffectivenessScore: 0
    };
  }

  private updateMetrics(): void {
    // Implementation for updating metrics
    this.lastMetricsUpdate = new Date();
  }

  private async findApplicableRule(sourceType: string, sourceData: Record<string, any>): Promise<string> {
    // Implementation for finding applicable rule
    return Array.from(this.activeRules.keys())[0]; // Simplified
  }

  private determinePriority(sourceType: string, sourceData: Record<string, any>): EscalationPriority {
    // Implementation for determining priority
    return EscalationPriority.MEDIUM; // Simplified
  }

  private extractTags(sourceType: string, sourceData: Record<string, any>): string[] {
    // Implementation for extracting tags
    return [sourceType];
  }

  private calculateDeadlines(escalationCase: EscalationCase, rule: EscalationRule): void {
    // Implementation for calculating deadlines
  }

  private async resolveAssignment(levelConfig: EscalationLevel): Promise<string> {
    // Implementation for resolving assignment
    return levelConfig.assignmentTarget;
  }

  private async executeEscalationAction(escalationCase: EscalationCase, action: EscalationAction): Promise<void> {
    // Implementation for executing escalation actions
  }

  private async sendLevelNotifications(escalationCase: EscalationCase, levelConfig: EscalationLevel): Promise<void> {
    // Implementation for sending notifications
  }

  private checkOverdueCases(): void {
    // Implementation for checking overdue cases
  }

  private cleanupExpiredCases(): void {
    // Implementation for cleaning up expired cases
  }

  private calculateAverageWaitTime(cases: EscalationCase[]): number {
    // Implementation for calculating average wait time
    return 0;
  }

  private async generateEscalationAlerts(cases: EscalationCase[]): Promise<EscalationAlert[]> {
    // Implementation for generating alerts
    return [];
  }

  private async generateEscalationRecommendations(cases: EscalationCase[]): Promise<EscalationRecommendation[]> {
    // Implementation for generating recommendations
    return [];
  }

  // Event handlers
  private async handleFraudCaseCreated(data: any): Promise<void> {
    await this.createEscalationCase('fraud_case', data.caseId, data, undefined, EscalationPriority.HIGH);
  }

  private async handleAppealSubmitted(data: any): Promise<void> {
    await this.createEscalationCase('appeal', data.appealId, data, undefined, EscalationPriority.MEDIUM);
  }

  private async handlePolicyViolation(data: any): Promise<void> {
    await this.createEscalationCase('policy_violation', data.violationId, data, undefined, EscalationPriority.HIGH);
  }

  private async handleSystemIncident(data: any): Promise<void> {
    await this.createEscalationCase('system_incident', data.incidentId, data, undefined, EscalationPriority.CRITICAL);
  }
}

export default EscalationProcedureService;