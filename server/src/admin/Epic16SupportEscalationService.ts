/**
 * Epic 16 Support Escalation Service - API Management System
 * Task: E16-1753114247206-7FAF6C - Create support escalation
 * 
 * Comprehensive support escalation system for Epic 16 API Management System that provides
 * automated escalation workflows, SLA management, priority-based routing, multi-channel
 * communication, and comprehensive tracking with audit trails and performance metrics.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// =============================================================================
// Support Escalation Types and Interfaces
// =============================================================================

}
export interface SupportEscalationConfig {
  // General settings
  enabled: boolean;
  defaultPriority: TicketPriority;
  autoEscalationEnabled: boolean;
  maxEscalationLevel: number;
  
  // SLA configuration
  slaSettings: {
    enabled: boolean;
    responseTimeMinutes: Record<TicketPriority, number>;
    resolutionTimeHours: Record<TicketPriority, number>;
    businessHoursOnly: boolean;
    businessHours: BusinessHours;
    holidays: Date[];
}
  };
  
  // Escalation rules
  escalationRules: {
    enableTimeBasedEscalation: boolean;
    enablePriorityEscalation: boolean;
    enableVolumeBasedEscalation: boolean;
    escalationIntervals: Record<TicketPriority, number>; // minutes
    maxRetryAttempts: number;
  };
  
  // Routing and assignment
  routing: {
    enableIntelligentRouting: boolean;
    routingStrategies: RoutingStrategy[];
    loadBalancing: 'round_robin' | 'skill_based' | 'workload_based' | 'random';
    autoAssignment: boolean;
    reassignmentThreshold: number; // minutes
  };
  
  // Notification settings
  notifications: {
    enableRealTimeNotifications: boolean;
    notificationChannels: NotificationChannel[];
    escalationNotifications: boolean;
    reminderIntervals: number[]; // minutes
    digestReports: boolean;
  };
  
  // Performance monitoring
  monitoring: {
    enableMetrics: boolean;
    performanceTracking: boolean;
    slaMonitoring: boolean;
    alertThresholds: AlertThreshold[];
  };
  
  // Integration settings
  integration: {
    emailIntegration: EmailIntegrationConfig;
    slackIntegration: SlackIntegrationConfig;
    webhookIntegration: WebhookIntegrationConfig;
    ticketingSystemIntegration: TicketingSystemConfig;
  };
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum TicketStatus {
  NEW = 'new',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled'
}

export enum EscalationType {
  TIME_BASED = 'time_based',
  PRIORITY_BASED = 'priority_based',
  VOLUME_BASED = 'volume_based',
  MANUAL = 'manual',
  SLA_BREACH = 'sla_breach',
  CUSTOMER_REQUEST = 'customer_request'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
  PHONE = 'phone'
}

}
export interface BusinessHours {
  monday: { start: string; end: string; enabled: boolean };
  tuesday: { start: string; end: string; enabled: boolean };
  wednesday: { start: string; end: string; enabled: boolean };
  thursday: { start: string; end: string; enabled: boolean };
  friday: { start: string; end: string; enabled: boolean };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
  timezone: string;
}

}
export interface RoutingStrategy {
  strategyId: string;
  strategyName: string;
  description: string;
  criteria: RoutingCriteria[];
  priority: number;
  enabled: boolean;
}
}

}
export interface RoutingCriteria {
  criteriaType: 'priority' | 'category' | 'skill' | 'workload' | 'availability' | 'experience';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
  value: string | number;
  weight: number; // 0-1 scale for scoring
}
}

}
export interface AlertThreshold {
  metricName: string;
  thresholdType: 'warning' | 'critical';
  thresholdValue: number;
  comparisonOperator: 'greater_than' | 'less_than' | 'equals';
  enabled: boolean;
}
}

}
export interface EmailIntegrationConfig {
  enabled: boolean;
  smtpSettings: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
}
  };
  templates: Record<string, EmailTemplate>;
}

}
export interface SlackIntegrationConfig {
  enabled: boolean;
  webhookUrl: string;
  channels: Record<TicketPriority, string>;
  mentionGroups: string[];
}
}

}
export interface WebhookIntegrationConfig {
  enabled: boolean;
  endpoints: WebhookEndpoint[];
  authentication: WebhookAuth;
  retryPolicy: RetryPolicy;
}
}

}
export interface TicketingSystemConfig {
  enabled: boolean;
  systemType: 'jira' | 'servicenow' | 'zendesk' | 'freshdesk' | 'custom';
  apiEndpoint: string;
  authentication: any;
  fieldMapping: Record<string, string>;
}
}

}
export interface EmailTemplate {
  templateId: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
}
}

}
export interface WebhookEndpoint {
  endpointId: string;
  url: string;
  events: string[];
  enabled: boolean;
  timeout: number;
}
}

}
export interface WebhookAuth {
  type: 'none' | 'basic' | 'bearer' | 'api_key';
  credentials: Record<string, string>;
}
}

}
export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
}
}

}
export interface SupportTicket {
  ticketId: string;
  ticketNumber: string; // Human-readable ticket number
  
  // Ticket details
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: TicketPriority;
  status: TicketStatus;
  
  // Reporter information
  reportedBy: string;
  reporterEmail: string;
  reporterName: string;
  customerOrganization?: string;
  
  // Assignment and routing
  assignedTo?: string;
  assignedTeam?: string;
  routingScore: number;
  
  // Escalation tracking
  escalationLevel: number;
  escalationHistory: EscalationEvent[];
  lastEscalatedAt?: Date;
  escalationReason?: string;
  
  // SLA tracking
  slaSettings: SLASettings;
  slaStatus: SLAStatus;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Additional metadata
  tags: string[];
  customFields: Record<string, any>;
  attachments: TicketAttachment[];
  
  // Communication tracking
  communications: TicketCommunication[];
  lastCommunicationAt?: Date;
  
  // Resolution information
  resolutionSummary?: string;
  resolutionCategory?: string;
  satisfactionRating?: number;
  satisfactionFeedback?: string;
}
}

}
export interface EscalationEvent {
  escalationId: string;
  escalationType: EscalationType;
  escalationLevel: number;
  
  // Escalation details
  escalatedAt: Date;
  escalatedBy: string;
  escalatedFrom?: string;
  escalatedTo: string;
  escalationReason: string;
  
  // Context
  triggerCondition: string;
  previousAssignee?: string;
  newAssignee: string;
  
  // Notifications sent
  notificationsSent: EscalationNotification[];
  
  // Status tracking
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  
  // Resolution
  resolved: boolean;
  resolvedAt?: Date;
  resolutionNotes?: string;
}
}

}
export interface EscalationNotification {
  notificationId: string;
  channel: NotificationChannel;
  recipient: string;
  sentAt: Date;
  delivered: boolean;
  deliveredAt?: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  errorMessage?: string;
}
}

}
export interface SLASettings {
  responseTimeMinutes: number;
  resolutionTimeHours: number;
  businessHoursOnly: boolean;
  startTime: Date;
  pausedTime: number; // Total paused time in minutes
}
}

}
export interface SLAStatus {
  responseTimeRemaining: number; // minutes
  resolutionTimeRemaining: number; // hours
  responseBreached: boolean;
  resolutionBreached: boolean;
  responseBreachedAt?: Date;
  resolutionBreachedAt?: Date;
  warningsSent: number;
  lastWarningAt?: Date;
}
}

}
export interface TicketAttachment {
  attachmentId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  filePath: string;
  checksum: string;
}
}

}
export interface TicketCommunication {
  communicationId: string;
  communicationType: 'comment' | 'email' | 'phone' | 'chat' | 'system';
  direction: 'inbound' | 'outbound' | 'internal';
  
  // Content
  subject?: string;
  content: string;
  htmlContent?: string;
  
  // Sender information
  fromName: string;
  fromEmail?: string;
  fromUserId?: string;
  
  // Recipient information
  recipients: CommunicationRecipient[];
  
  // Metadata
  createdAt: Date;
  isPublic: boolean;
  attachments: TicketAttachment[];
  
  // Status tracking
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  deliveredAt?: Date;
  errorMessage?: string;
}
}

}
export interface CommunicationRecipient {
  recipientType: 'to' | 'cc' | 'bcc';
  name: string;
  email?: string;
  userId?: string;
}
}

}
export interface EscalationRule {
  ruleId: string;
  ruleName: string;
  description: string;
  
  // Rule configuration
  enabled: boolean;
  priority: number;
  
  // Trigger conditions
  triggerConditions: EscalationTrigger[];
  
  // Actions to take
  escalationActions: EscalationAction[];
  
  // Scope and filters
  applicableCategories: string[];
  applicablePriorities: TicketPriority[];
  applicableTeams: string[];
  
  // Timing and frequency
  evaluationInterval: number; // minutes
  maxExecutions: number; // per ticket
  cooldownPeriod: number; // minutes between executions
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  usageCount: number;
  successRate: number;
}
}

}
export interface EscalationTrigger {
  triggerId: string;
  triggerType: 'time_based' | 'status_change' | 'priority_change' | 'sla_breach' | 'no_response' | 'custom';
  condition: string; // Condition expression
  parameters: Record<string, any>;
  enabled: boolean;
}
}

}
export interface EscalationAction {
  actionId: string;
  actionType: 'reassign' | 'notify' | 'change_priority' | 'add_comment' | 'webhook' | 'custom';
  actionConfig: Record<string, any>;
  order: number;
  required: boolean;
}
}

}
export interface SupportAgent {
  agentId: string;
  userId: string;
  agentName: string;
  email: string;
  
  // Agent details
  team: string;
  role: string;
  skillSet: string[];
  experience: number; // years
  
  // Availability and workload
  availability: AgentAvailability;
  currentWorkload: number;
  maxConcurrentTickets: number;
  averageResponseTime: number; // minutes
  
  // Performance metrics
  performanceMetrics: AgentPerformanceMetrics;
  
  // Status
  status: 'available' | 'busy' | 'offline' | 'in_meeting' | 'break';
  lastActiveAt: Date;
  
  // Preferences
  notificationPreferences: NotificationPreferences;
  workingHours: BusinessHours;
}
}

}
export interface AgentAvailability {
  currentlyAvailable: boolean;
  nextAvailableAt?: Date;
  unavailableUntil?: Date;
  unavailableReason?: string;
  scheduledBreaks: ScheduledBreak[];
}
}

}
export interface ScheduledBreak {
  breakId: string;
  startTime: Date;
  endTime: Date;
  breakType: 'lunch' | 'meeting' | 'training' | 'personal' | 'other';
  description?: string;
}
}

}
export interface AgentPerformanceMetrics {
  totalTicketsHandled: number;
  averageResolutionTime: number; // hours
  customerSatisfactionScore: number; // 1-5
  slaComplianceRate: number; // percentage
  escalationRate: number; // percentage of tickets escalated
  responseTime: {
    average: number;
    percentile95: number;
}
  };
  workloadEfficiency: number; // percentage
}

}
export interface NotificationPreferences {
  emailNotifications: boolean;
  slackNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  digestFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
}
  quietHours: { start: string; end: string; enabled: boolean };
}

}
export interface EscalationMetrics {
  totalEscalations: number;
  escalationsByType: Record<EscalationType, number>;
  escalationsByPriority: Record<TicketPriority, number>;
  averageEscalationTime: number; // minutes
  escalationResolutionRate: number; // percentage
  
  // SLA metrics
  slaBreaches: number;
  slaComplianceRate: number; // percentage
  averageResponseTime: Record<TicketPriority, number>; // minutes
  averageResolutionTime: Record<TicketPriority, number>; // hours
  
  // Agent performance
  topPerformingAgents: AgentMetric[];
  agentWorkloadDistribution: Record<string, number>;
  
  // System performance
  ticketVolumeByHour: Record<string, number>;
  resolutionTrends: TrendData[];
  customerSatisfactionTrend: TrendData[];
}
}

}
export interface AgentMetric {
  agentId: string;
  agentName: string;
  ticketsHandled: number;
  averageResponseTime: number;
  customerSatisfactionScore: number;
  escalationRate: number;
}
}

}
export interface TrendData {
  timestamp: Date;
  value: number;
  period: 'hour' | 'day' | 'week' | 'month';
}
}

// =============================================================================
// Epic 16 Support Escalation Service Implementation
// =============================================================================

export class Epic16SupportEscalationService extends EventEmitter {
  private config: SupportEscalationConfig;
  private database: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private activeTickets: Map<string, SupportTicket> = new Map();
  private escalationRules: Map<string, EscalationRule> = new Map();
  private supportAgents: Map<string, SupportAgent> = new Map();
  private escalationInterval?: NodeJS.Timeout;
  private slaMonitoringInterval?: NodeJS.Timeout;

  constructor(
    config: SupportEscalationConfig,
    database: DatabaseService,
    redis: RedisService,
    auditService: AuditService
  ) {
    super();
    
    this.config = config;
    this.database = database;
    this.redis = redis;
    this.auditService = auditService;
    
    this.initializeService();
  }

  /**
   * Initialize the support escalation service
   */
  private async initializeService(): Promise<void> {

    try {
      // Load active tickets
      await this.loadActiveTickets();
      
      // Load escalation rules
      await this.loadEscalationRules();
      
      // Load support agents
      await this.loadSupportAgents();
      
      // Start automated processes
      if (this.config.autoEscalationEnabled) {
        this.startEscalationMonitoring();
      }
      
      if (this.config.slaSettings.enabled) {
        this.startSLAMonitoring();
      }
      
      this.emit('service:initialized', { timestamp: new Date() });
      
    } catch (error) {
      this.emit('service:error', { error: error.message, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Create a new support ticket
   */
  async createSupportTicket(
    ticketData: {
      title: string;
      description: string;
      category: string;
      subcategory?: string;
      priority?: TicketPriority;
      reportedBy: string;
      reporterEmail: string;
      reporterName: string;
      customerOrganization?: string;
      tags?: string[];
      customFields?: Record<string, any>;
    }
  ): Promise<{ ticketId: string; ticket: SupportTicket }> {

    try {
      const ticketId = crypto.randomUUID();
      const ticketNumber = await this.generateTicketNumber();
      
      // Determine priority if not specified
      const priority = ticketData.priority || this.determinePriority(ticketData);
      
      // Calculate SLA settings
      const slaSettings = this.calculateSLASettings(priority);
      
      const ticket: SupportTicket = {
        ticketId,
        ticketNumber,
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        subcategory: ticketData.subcategory || '',
        priority,
        status: TicketStatus.NEW,
        
        reportedBy: ticketData.reportedBy,
        reporterEmail: ticketData.reporterEmail,
        reporterName: ticketData.reporterName,
        customerOrganization: ticketData.customerOrganization,
        
        routingScore: 0,
        escalationLevel: 0,
        escalationHistory: [],
        
        slaSettings,
        slaStatus: {
          responseTimeRemaining: slaSettings.responseTimeMinutes,
          resolutionTimeRemaining: slaSettings.resolutionTimeHours,
          responseBreached: false,
          resolutionBreached: false,
          warningsSent: 0
  }
        createdAt: new Date(),
        updatedAt: new Date(),
        
        tags: ticketData.tags || [],
        customFields: ticketData.customFields || {},
        attachments: [],
        communications: []
      };
      
      // Save to database
      await this.saveTicket(ticket);
      
      // Add to active tickets cache
      this.activeTickets.set(ticketId, ticket);
      
      // Route the ticket
      await this.routeTicket(ticketId);
      
      // Send notifications
      await this.sendTicketCreatedNotifications(ticket);
      
      // Audit the creation
      await this.auditService.logAction('support_ticket_created', ticketData.reportedBy, {
        ticketId,
        ticketNumber,
        priority,
        category: ticketData.category
      });
      
      this.emit('ticket:created', { ticketId, ticket });
      
      return { ticketId, ticket };
      
    } catch (error) {
      this.emit('ticket:creation_error', { error: error.message, ticketData });
      throw new Error(`Failed to create support ticket: ${error.message}`);
    }
  }

  /**
   * Escalate a ticket to the next level
   */
  async escalateTicket(
    ticketId: string,
    escalationType: EscalationType,
    escalatedBy: string,
    options: {
      reason?: string;
      targetAgent?: string;
      targetTeam?: string;
      notify?: boolean;
      addComment?: string;
    } = {}
  ): Promise<{ escalationId: string; escalation: EscalationEvent }> {

    try {
      const ticket = await this.getTicket(ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      
      // Check if escalation is allowed
      if (ticket.escalationLevel >= this.config.maxEscalationLevel) {
        throw new Error(`Maximum escalation level reached for ticket ${ticket.ticketNumber}`);
      }
      
      // Determine escalation target
      const escalationTarget = await this.determineEscalationTarget(ticket, options);
      
      // Create escalation event
      const escalationId = crypto.randomUUID();
      const escalation: EscalationEvent = {
        escalationId,
        escalationType,
        escalationLevel: ticket.escalationLevel + 1,
        
        escalatedAt: new Date(),
        escalatedBy,
        escalatedFrom: ticket.assignedTo,
        escalatedTo: escalationTarget.agentId,
        escalationReason: options.reason || `${escalationType} escalation`,
        
        triggerCondition: this.buildTriggerCondition(escalationType, ticket),
        previousAssignee: ticket.assignedTo,
        newAssignee: escalationTarget.agentId,
        
        notificationsSent: [],
        acknowledged: false,
        resolved: false
      };
      
      // Update ticket
      ticket.escalationLevel += 1;
      ticket.escalationHistory.push(escalation);
      ticket.lastEscalatedAt = new Date();
      ticket.escalationReason = escalation.escalationReason;
      ticket.assignedTo = escalationTarget.agentId;
      ticket.assignedTeam = escalationTarget.team;
      ticket.status = TicketStatus.ESCALATED;
      ticket.updatedAt = new Date();
      
      // Save updated ticket
      await this.saveTicket(ticket);
      
      // Send notifications if requested
      if (options.notify !== false) {
        const notifications = await this.sendEscalationNotifications(escalation, ticket);
        escalation.notificationsSent = notifications;
      }
      
      // Add system comment if specified
      if (options.addComment) {
        await this.addTicketComment(ticketId, options.addComment, 'system', true);
      }
      
      // Update escalation in database
      await this.saveEscalation(escalation);
      
      // Audit the escalation
      await this.auditService.logAction('ticket_escalated', escalatedBy, {
        ticketId,
        ticketNumber: ticket.ticketNumber,
        escalationType,
        escalationLevel: escalation.escalationLevel,
        escalatedTo: escalationTarget.agentId
      });
      
      this.emit('ticket:escalated', { ticketId, ticket, escalation, escalatedBy });
      
      return { escalationId, escalation };
      
    } catch (error) {
      this.emit('escalation:error', { error: error.message, ticketId, escalationType, escalatedBy });
      throw new Error(`Failed to escalate ticket: ${error.message}`);
    }
  }

  /**
   * Route ticket to appropriate agent or team
   */
  async routeTicket(
    ticketId: string,
    options: {
      forceReassign?: boolean;
      targetAgent?: string;
      routingStrategy?: string;
    } = {}
  ): Promise<{ assignedTo: string; routingScore: number; reason: string }> {

    try {
      const ticket = await this.getTicket(ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      
      // Skip routing if already assigned and not forcing reassignment
      if (ticket.assignedTo && !options.forceReassign) {
        return {
          assignedTo: ticket.assignedTo,
          routingScore: ticket.routingScore,
          reason: 'Already assigned'
        };
      }
      
      let bestAgent: SupportAgent | null = null;
      let bestScore = -1;
      let routingReason = 'No suitable agent found';
      
      // Use target agent if specified
      if (options.targetAgent) {
        const targetAgent = this.supportAgents.get(options.targetAgent);
        if (targetAgent && this.isAgentAvailable(targetAgent)) {
          bestAgent = targetAgent;
          bestScore = 1.0;
          routingReason = 'Manually assigned';
        }
      } else {
        // Apply routing strategies
        const routingResult = await this.applyRoutingStrategies(ticket, options.routingStrategy);
        bestAgent = routingResult.agent;
        bestScore = routingResult.score;
        routingReason = routingResult.reason;
      }
      
      if (!bestAgent) {
        // Fallback to any available agent
        for (const agent of this.supportAgents.values()) {
          if (this.isAgentAvailable(agent) && agent.currentWorkload < agent.maxConcurrentTickets) {
            bestAgent = agent;
            bestScore = 0.5;
            routingReason = 'Fallback assignment';
            break;
          }
        }
      }
      
      if (!bestAgent) {
        throw new Error('No available agents for ticket assignment');
      }
      
      // Update ticket assignment
      ticket.assignedTo = bestAgent.agentId;
      ticket.assignedTeam = bestAgent.team;
      ticket.routingScore = bestScore;
      ticket.status = TicketStatus.OPEN;
      ticket.updatedAt = new Date();
      
      // Update agent workload
      bestAgent.currentWorkload += 1;
      
      // Save changes
      await this.saveTicket(ticket);
      await this.saveSupportAgent(bestAgent);
      
      // Send assignment notification
      await this.sendTicketAssignmentNotification(ticket, bestAgent);
      
      // Audit the routing
      await this.auditService.logAction('ticket_routed', 'system', {
        ticketId,
        ticketNumber: ticket.ticketNumber,
        assignedTo: bestAgent.agentId,
        routingScore: bestScore,
        reason: routingReason
      });
      
      this.emit('ticket:routed', { ticketId, ticket, agent: bestAgent, score: bestScore });
      
      return {
        assignedTo: bestAgent.agentId,
        routingScore: bestScore,
        reason: routingReason
      };
      
    } catch (error) {
      this.emit('routing:error', { error: error.message, ticketId, options });
      throw new Error(`Failed to route ticket: ${error.message}`);
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    updatedBy: string,
    options: {
      comment?: string;
      notifyReporter?: boolean;
      notifyAgent?: boolean;
      resolutionSummary?: string;
      resolutionCategory?: string;
    } = {}
  ): Promise<void> {

    try {
      const ticket = await this.getTicket(ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      
      const previousStatus = ticket.status;
      ticket.status = newStatus;
      ticket.updatedAt = new Date();
      
      // Handle status-specific updates
      switch (newStatus) {
      case TicketStatus.IN_PROGRESS:
        if (!ticket.firstResponseAt) {
          ticket.firstResponseAt = new Date();
          // Update SLA response time tracking
          ticket.slaStatus.responseTimeRemaining = 0;
          ticket.slaStatus.responseBreached = false;
        }
        break;
          
      case TicketStatus.RESOLVED:
        ticket.resolvedAt = new Date();
        if (options.resolutionSummary) {
          ticket.resolutionSummary = options.resolutionSummary;
        }
        if (options.resolutionCategory) {
          ticket.resolutionCategory = options.resolutionCategory;
        }
        break;
          
      case TicketStatus.CLOSED:
        ticket.closedAt = new Date();
        // Release agent workload
        if (ticket.assignedTo) {
          const agent = this.supportAgents.get(ticket.assignedTo);
          if (agent) {
            agent.currentWorkload = Math.max(0, agent.currentWorkload - 1);
            await this.saveSupportAgent(agent);
          }
        }
        break;
      }
      
      // Add system comment if provided
      if (options.comment) {
        await this.addTicketComment(ticketId, options.comment, updatedBy, false);
      }
      
      // Save updated ticket
      await this.saveTicket(ticket);
      
      // Send notifications
      if (options.notifyReporter) {
        await this.sendStatusUpdateNotification(ticket, 'reporter');
      }
      
      if (options.notifyAgent && ticket.assignedTo) {
        await this.sendStatusUpdateNotification(ticket, 'agent');
      }
      
      // Audit the status update
      await this.auditService.logAction('ticket_status_updated', updatedBy, {
        ticketId,
        ticketNumber: ticket.ticketNumber,
        previousStatus,
        newStatus,
        resolutionSummary: options.resolutionSummary
      });
      
      this.emit('ticket:status_updated', { ticketId, ticket, previousStatus, newStatus, updatedBy });
      
    } catch (error) {
      this.emit('ticket:status_error', { error: error.message, ticketId, newStatus, updatedBy });
      throw new Error(`Failed to update ticket status: ${error.message}`);
    }
  }

  /**
   * Add comment to ticket
   */
  async addTicketComment(
    ticketId: string,
    content: string,
    authorId: string,
    isInternal: boolean = false,
    options: {
      htmlContent?: string;
      attachments?: TicketAttachment[];
      notifyParticipants?: boolean;
    } = {}
  ): Promise<string> {

    try {
      const ticket = await this.getTicket(ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      
      const communicationId = crypto.randomUUID();
      const communication: TicketCommunication = {
        communicationId,
        communicationType: 'comment',
        direction: 'internal',
        
        content,
        htmlContent: options.htmlContent,
        
        fromName: await this.getUserName(authorId),
        fromUserId: authorId,
        
        recipients: [],
        
        createdAt: new Date(),
        isPublic: !isInternal,
        attachments: options.attachments || [],
        
        status: 'sent'
      };
      
      // Add to ticket communications
      ticket.communications.push(communication);
      ticket.lastCommunicationAt = new Date();
      ticket.updatedAt = new Date();
      
      // Save updated ticket
      await this.saveTicket(ticket);
      
      // Send notifications if requested
      if (options.notifyParticipants && !isInternal) {
        await this.sendCommentNotifications(ticket, communication);
      }
      
      // Audit the comment
      await this.auditService.logAction('ticket_comment_added', authorId, {
        ticketId,
        ticketNumber: ticket.ticketNumber,
        communicationId,
        isInternal,
        contentLength: content.length
      });
      
      this.emit('ticket:comment_added', { ticketId, ticket, communication, authorId });
      
      return communicationId;
      
    } catch (error) {
      this.emit('comment:error', { error: error.message, ticketId, authorId });
      throw new Error(`Failed to add ticket comment: ${error.message}`);
    }
  }

  /**
   * Get escalation metrics for reporting
   */
  async getEscalationMetrics(
    timeRange: { start: Date; end: Date },
    filters: {
      priority?: TicketPriority[];
      categories?: string[];
      teams?: string[];
      agents?: string[];
    } = {}
  ): Promise<EscalationMetrics> {

    try {
      // This would typically query the database for metrics
      // For now, returning a basic structure
      
      const metrics: EscalationMetrics = {
        totalEscalations: 0,
        escalationsByType: {
          [EscalationType.TIME_BASED]: 0,
          [EscalationType.PRIORITY_BASED]: 0,
          [EscalationType.VOLUME_BASED]: 0,
          [EscalationType.MANUAL]: 0,
          [EscalationType.SLA_BREACH]: 0,
          [EscalationType.CUSTOMER_REQUEST]: 0
  }
        escalationsByPriority: {
          [TicketPriority.LOW]: 0,
          [TicketPriority.MEDIUM]: 0,
          [TicketPriority.HIGH]: 0,
          [TicketPriority.URGENT]: 0,
          [TicketPriority.CRITICAL]: 0
  }
        averageEscalationTime: 0,
        escalationResolutionRate: 0,
        
        slaBreaches: 0,
        slaComplianceRate: 0,
        averageResponseTime: {
          [TicketPriority.LOW]: 0,
          [TicketPriority.MEDIUM]: 0,
          [TicketPriority.HIGH]: 0,
          [TicketPriority.URGENT]: 0,
          [TicketPriority.CRITICAL]: 0
  }
        averageResolutionTime: {
          [TicketPriority.LOW]: 0,
          [TicketPriority.MEDIUM]: 0,
          [TicketPriority.HIGH]: 0,
          [TicketPriority.URGENT]: 0,
          [TicketPriority.CRITICAL]: 0
  }
        topPerformingAgents: [],
        agentWorkloadDistribution: {},
        
        ticketVolumeByHour: {},
        resolutionTrends: [],
        customerSatisfactionTrend: []
      };
      
      // Implementation would calculate actual metrics from database
      
      return metrics;
      
    } catch (error) {
      this.emit('metrics:error', { error: error.message, timeRange, filters });
      throw new Error(`Failed to get escalation metrics: ${error.message}`);
    }
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async loadActiveTickets(): Promise<void> {

    // Implementation would load active tickets from database
  }

  private async loadEscalationRules(): Promise<void> {

    // Implementation would load escalation rules from database
  }

  private async loadSupportAgents(): Promise<void> {

    // Implementation would load support agents from database
  }

  private startEscalationMonitoring(): void {
    // Monitor tickets for escalation conditions every 5 minutes
    this.escalationInterval = setInterval(async () => {
      await this.processEscalationRules();
    }, 5 * 60 * 1000);
  }

  private startSLAMonitoring(): void {
    // Monitor SLA compliance every minute
    this.slaMonitoringInterval = setInterval(async () => {
      await this.processSLAMonitoring();
    }, 60 * 1000);
  }

  private async processEscalationRules(): Promise<void> {

    try {
      for (const ticket of this.activeTickets.values()) {
        if (this.shouldEvaluateTicketForEscalation(ticket)) {
          await this.evaluateTicketEscalationRules(ticket);
        }
      }
    } catch (error) {
      this.emit('escalation:monitoring_error', { error: error.message });
    }
  }

  private async processSLAMonitoring(): Promise<void> {

    try {
      for (const ticket of this.activeTickets.values()) {
        await this.updateTicketSLAStatus(ticket);
        
        if (this.shouldSendSLAWarning(ticket)) {
          await this.sendSLAWarningNotification(ticket);
        }
        
        if (this.isSLABreached(ticket)) {
          await this.handleSLABreach(ticket);
        }
      }
    } catch (error) {
      this.emit('sla:monitoring_error', { error: error.message });
    }
  }

  private shouldEvaluateTicketForEscalation(ticket: SupportTicket): boolean {
    // Only evaluate open tickets that aren't already at max escalation level
    return ticket.status !== TicketStatus.CLOSED &&
           ticket.status !== TicketStatus.RESOLVED &&
           ticket.escalationLevel < this.config.maxEscalationLevel;
  }

  private async evaluateTicketEscalationRules(ticket: SupportTicket): Promise<void> {

    for (const rule of this.escalationRules.values()) {
      if (this.isRuleApplicableToTicket(rule, ticket)) {
        const shouldEscalate = await this.evaluateEscalationRule(rule, ticket);
        if (shouldEscalate) {
          await this.executeEscalationRule(rule, ticket);
        }
      }
    }
  }

  private isRuleApplicableToTicket(rule: EscalationRule, ticket: SupportTicket): boolean {
    if (!rule.enabled) return false;
    
    // Check category filter
    if (rule.applicableCategories.length > 0 && !rule.applicableCategories.includes(ticket.category)) {
      return false;
    }
    
    // Check priority filter
    if (rule.applicablePriorities.length > 0 && !rule.applicablePriorities.includes(ticket.priority)) {
      return false;
    }
    
    // Check team filter
    if (rule.applicableTeams.length > 0 && ticket.assignedTeam && !rule.applicableTeams.includes(ticket.assignedTeam)) {
      return false;
    }
    
    return true;
  }

  private async evaluateEscalationRule(rule: EscalationRule, ticket: SupportTicket): Promise<boolean> {

    // Implementation would evaluate trigger conditions
    // This is a simplified version
    return false;
  }

  private async executeEscalationRule(rule: EscalationRule, ticket: SupportTicket): Promise<void> {

    // Implementation would execute escalation actions
  }

  private async generateTicketNumber(): Promise<string> {

    // Generate human-readable ticket number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TK-${timestamp}-${random}`;
  }

  private determinePriority(ticketData: any): TicketPriority {
    // Simple priority determination logic
    // In practice, this could be more sophisticated with ML or rule-based systems
    
    const title = ticketData.title.toLowerCase();
    const description = ticketData.description.toLowerCase();
    const content = `${title} ${description}`;
    
    if (content.includes('critical') || content.includes('urgent') || content.includes('down')) {
      return TicketPriority.CRITICAL;
    }
    
    if (content.includes('important') || content.includes('asap') || content.includes('high')) {
      return TicketPriority.HIGH;
    }
    
    return this.config.defaultPriority;
  }

  private calculateSLASettings(priority: TicketPriority): SLASettings {
    return {
      responseTimeMinutes: this.config.slaSettings.responseTimeMinutes[priority],
      resolutionTimeHours: this.config.slaSettings.resolutionTimeHours[priority],
      businessHoursOnly: this.config.slaSettings.businessHoursOnly,
      startTime: new Date(),
      pausedTime: 0
    };
  }

  private async determineEscalationTarget(
    ticket: SupportTicket,
    options: any
  ): Promise<{ agentId: string; team: string }> {

    // Implementation would determine best escalation target
    // For now, return a placeholder
    return {
      agentId: options.targetAgent || 'manager-agent-id',
      team: options.targetTeam || 'management-team'
    };
  }

  private buildTriggerCondition(escalationType: EscalationType, ticket: SupportTicket): string {
    switch (escalationType) {
    case EscalationType.TIME_BASED:
      return 'Ticket open for more than configured threshold';
    case EscalationType.SLA_BREACH:
      return 'SLA response/resolution time exceeded';
    case EscalationType.PRIORITY_BASED:
      return 'Ticket priority requires escalation';
    default:
      return 'Manual escalation requested';
    }
  }

  private async applyRoutingStrategies(
    ticket: SupportTicket,
    strategyId?: string
  ): Promise<{ agent: SupportAgent | null; score: number; reason: string }> {

    // Implementation would apply routing strategies to find best agent
    return {
      agent: null,
      score: 0,
      reason: 'No routing strategy implemented'
    };
  }

  private isAgentAvailable(agent: SupportAgent): boolean {
    return agent.status === 'available' && 
           agent.availability.currentlyAvailable &&
           agent.currentWorkload < agent.maxConcurrentTickets;
  }

  private async updateTicketSLAStatus(ticket: SupportTicket): Promise<void> {

    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - ticket.createdAt.getTime()) / (60 * 1000));
    
    // Update response time remaining
    if (!ticket.firstResponseAt) {
      ticket.slaStatus.responseTimeRemaining = Math.max(0, ticket.slaSettings.responseTimeMinutes - elapsedMinutes);
      ticket.slaStatus.responseBreached = ticket.slaStatus.responseTimeRemaining === 0;
    }
    
    // Update resolution time remaining
    if (!ticket.resolvedAt) {
      const elapsedHours = Math.floor(elapsedMinutes / 60);
      ticket.slaStatus.resolutionTimeRemaining = Math.max(0, ticket.slaSettings.resolutionTimeHours - elapsedHours);
      ticket.slaStatus.resolutionBreached = ticket.slaStatus.resolutionTimeRemaining === 0;
    }
  }

  private shouldSendSLAWarning(ticket: SupportTicket): boolean {
    // Send warning when 80% of SLA time has elapsed
    const responseWarningThreshold = ticket.slaSettings.responseTimeMinutes * 0.8;
    const resolutionWarningThreshold = ticket.slaSettings.resolutionTimeHours * 0.8;
    
    return (ticket.slaStatus.responseTimeRemaining <= responseWarningThreshold && !ticket.firstResponseAt) ||
           (ticket.slaStatus.resolutionTimeRemaining <= resolutionWarningThreshold && !ticket.resolvedAt);
  }

  private isSLABreached(ticket: SupportTicket): boolean {
    return ticket.slaStatus.responseBreached || ticket.slaStatus.resolutionBreached;
  }

  private async handleSLABreach(ticket: SupportTicket): Promise<void> {

    // Automatically escalate on SLA breach
    await this.escalateTicket(ticket.ticketId, EscalationType.SLA_BREACH, 'system', {
      reason: 'SLA breach detected',
      notify: true,
      addComment: `SLA breach: ${ticket.slaStatus.responseBreached ? 'Response time' : 'Resolution time'} exceeded`
    });
  }

  private async getUserName(userId: string): Promise<string> {

    // Implementation would get user name from database
    return `User ${userId}`;
  }

  // Notification methods
  private async sendTicketCreatedNotifications(ticket: SupportTicket): Promise<void> {

    // Implementation would send various notifications
  }

  private async sendEscalationNotifications(
    escalation: EscalationEvent,
    ticket: SupportTicket
  ): Promise<EscalationNotification[]> {

    // Implementation would send escalation notifications
    return [];
  }

  private async sendTicketAssignmentNotification(ticket: SupportTicket, agent: SupportAgent): Promise<void> {

    // Implementation would send assignment notification
  }

  private async sendStatusUpdateNotification(ticket: SupportTicket, recipientType: 'reporter' | 'agent'): Promise<void> {

    // Implementation would send status update notification
  }

  private async sendCommentNotifications(ticket: SupportTicket, communication: TicketCommunication): Promise<void> {

    // Implementation would send comment notifications
  }

  private async sendSLAWarningNotification(ticket: SupportTicket): Promise<void> {

    // Implementation would send SLA warning notification
  }

  // Database methods
  private async getTicket(ticketId: string): Promise<SupportTicket | null> {

    return this.activeTickets.get(ticketId) || null;
  }

  private async saveTicket(ticket: SupportTicket): Promise<void> {

    // Implementation would save ticket to database
    this.activeTickets.set(ticket.ticketId, ticket);
  }

  private async saveEscalation(escalation: EscalationEvent): Promise<void> {

    // Implementation would save escalation to database
  }

  private async saveSupportAgent(agent: SupportAgent): Promise<void> {

    // Implementation would save agent to database
    this.supportAgents.set(agent.agentId, agent);
  }

  /**
   * Cleanup service resources
   */
  async cleanup(): Promise<void> {

    if (this.escalationInterval) {
      clearInterval(this.escalationInterval);
    }
    
    if (this.slaMonitoringInterval) {
      clearInterval(this.slaMonitoringInterval);
    }
    
    this.activeTickets.clear();
    this.escalationRules.clear();
    this.supportAgents.clear();
    this.removeAllListeners();
  }
}

// Export service for Epic 16 implementation
export default Epic16SupportEscalationService;