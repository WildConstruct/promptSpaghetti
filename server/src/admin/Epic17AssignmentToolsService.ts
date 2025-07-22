/**
 * Epic 17 Assignment Tools Service - API Management System  
 * Task: E17-1753114396894-B567EC - Create assignment tools
 * 
 * Comprehensive assignment and delegation tools for Epic 17 API Management System.
 * Handles API key assignments, permission delegation, role assignments, team management,
 * automated assignment rules, and access control delegation workflows.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { Epic17BulkStatusChangeService } from './Epic17BulkStatusChangeService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// =============================================================================
// Assignment Tools Types and Interfaces
// =============================================================================

export interface AssignmentToolsConfig {
  // Assignment limits
  maxAssignmentsPerUser: number;
  maxAssignmentsPerKey: number;
  maxDelegationDepth: number;
  
  // Auto-assignment
  autoAssignment: {
    enabled: boolean;
    rules: AutoAssignmentRule[];
    evaluationInterval: number; // minutes
  };
  
  // Approval workflows
  approval: {
    enabled: boolean;
    requireApproval: {
      highValueKeys: boolean;
      crossOrgAssignments: boolean;
      adminRoleAssignments: boolean;
    };
    approvalTimeout: number; // hours
  };
  
  // Delegation settings
  delegation: {
    enabled: boolean;
    allowSubDelegation: boolean;
    maxDelegationDuration: number; // days
    requireJustification: boolean;
  };
  
  // Assignment validation
  validation: {
    strictMode: boolean;
    conflictDetection: boolean;
    capacityChecking: boolean;
    dependencyValidation: boolean;
  };
  
  // Notifications
  notifications: {
    onAssignment: boolean;
    onRevocation: boolean;
    onExpiration: boolean;
    reminderDays: number[];
  };
  
  // Audit and compliance
  audit: {
    logAllAssignments: boolean;
    complianceReporting: boolean;
    retentionDays: number;
  };
}

export enum AssignmentType {
  API_KEY_ASSIGNMENT = 'api_key_assignment',
  PERMISSION_ASSIGNMENT = 'permission_assignment', 
  ROLE_ASSIGNMENT = 'role_assignment',
  TEAM_ASSIGNMENT = 'team_assignment',
  RESOURCE_ASSIGNMENT = 'resource_assignment',
  DELEGATION = 'delegation'
}

export enum AssignmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected'
}

export interface Assignment {
  assignmentId: string;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  
  // Assignment details
  assigneeId: string; // User/team/service receiving the assignment
  assigneeType: 'user' | 'team' | 'service' | 'role';
  resourceId: string; // What is being assigned (key, permission, role, etc.)
  resourceType: string;
  
  // Assignment scope and context
  scope: AssignmentScope;
  context: AssignmentContext;
  permissions: AssignmentPermission[];
  
  // Lifecycle management
  assignedBy: string;
  assignedAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  
  // Delegation chain
  delegatedFrom?: string; // Parent assignment ID if this is a delegation
  delegationLevel: number; // 0 = direct, 1+ = delegated
  isDelegation: boolean;
  canDelegate: boolean;
  
  // Assignment configuration
  conditions: AssignmentCondition[];
  restrictions: AssignmentRestriction[];
  allowedActions: string[];
  
  // Approval workflow
  requiresApproval: boolean;
  approvalRequest?: AssignmentApprovalRequest;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Monitoring and usage
  usageTracking: AssignmentUsageTracking;
  lastAccessInfo?: AssignmentAccessInfo;
  
  // Metadata
  reason: string;
  tags: string[];
  metadata: Record<string, any>;
  notes?: string;
  
  // Compliance and audit
  complianceFlags: string[];
  auditTrail: AssignmentAuditEntry[];
}

export interface AssignmentScope {
  organizationId?: string;
  teamIds: string[];
  projectIds: string[];
  environmentIds: string[];
  
  // Geographical scope
  regions: string[];
  countries: string[];
  
  // Temporal scope
  timeZones: string[];
  businessHours?: {
    start: string; // HH:MM
    end: string;   // HH:MM
    days: number[]; // 0-6, Sunday = 0
  };
  
  // Custom scope attributes
  customScope: Record<string, any>;
}

export interface AssignmentContext {
  purpose: string;
  businessJustification: string;
  technicalRequirements: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Compliance context
  complianceFrameworks: string[];
  dataClassification: string;
  regulatoryRequirements: string[];
  
  // Operational context
  supportLevel: 'basic' | 'standard' | 'premium' | 'critical';
  availabilityRequirement: string;
  performanceRequirement: string;
  
  // Integration context
  integratedSystems: string[];
  dependencies: string[];
  downstreamImpact: string[];
}

export interface AssignmentPermission {
  permissionId: string;
  action: string;
  resource: string;
  effect: 'allow' | 'deny';
  conditions?: Record<string, any>;
}

export interface AssignmentCondition {
  conditionId: string;
  type: 'time' | 'location' | 'device' | 'network' | 'usage' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
  value: any;
  description: string;
  enabled: boolean;
}

export interface AssignmentRestriction {
  restrictionId: string;
  type: 'time_based' | 'usage_based' | 'location_based' | 'device_based' | 'custom';
  parameters: Record<string, any>;
  description: string;
  enforced: boolean;
}

export interface AssignmentApprovalRequest {
  requestId: string;
  requestedAt: Date;
  requestedBy: string;
  assignmentId: string;
  
  // Approval details
  approvers: string[];
  approvalsRequired: number;
  approvalsReceived: number;
  approvals: AssignmentApproval[];
  
  // Request context
  justification: string;
  impactAssessment: string;
  riskMitigation: string;
  
  // Status and timing
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt: Date;
  processedAt?: Date;
  
  // Decision details
  finalDecision?: 'approved' | 'rejected';
  decisionReason?: string;
  conditions?: string[];
}

export interface AssignmentApproval {
  approvalId: string;
  approvedBy: string;
  approvedAt: Date;
  decision: 'approve' | 'reject';
  comments?: string;
  conditions?: string[];
}

export interface AssignmentUsageTracking {
  totalAccesses: number;
  lastAccessAt?: Date;
  accessFrequency: number; // accesses per day
  
  // Usage patterns
  dailyUsage: Record<string, number>; // date -> access count
  peakUsageHours: number[]; // hours of day with peak usage
  commonActions: Array<{
    action: string;
    count: number;
    lastUsed: Date;
  }>;
  
  // Performance metrics
  averageResponseTime: number; // milliseconds
  errorRate: number; // percentage
  quotaUtilization: number; // percentage
  
  // Compliance metrics
  complianceViolations: number;
  lastComplianceCheck: Date;
  complianceScore: number; // 0-100
}

export interface AssignmentAccessInfo {
  accessId: string;
  accessedAt: Date;
  accessedBy: string;
  action: string;
  resource: string;
  sourceIP: string;
  userAgent?: string;
  success: boolean;
  responseTime: number; // milliseconds
  details: Record<string, any>;
}

export interface AssignmentAuditEntry {
  entryId: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  details: Record<string, any>;
}

export interface AutoAssignmentRule {
  ruleId: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // Higher number = higher priority
  
  // Trigger conditions
  triggers: AutoAssignmentTrigger[];
  
  // Assignment template
  assignmentTemplate: Partial<Assignment>;
  
  // Rule configuration
  conditions: AutoAssignmentCondition[];
  actions: AutoAssignmentAction[];
  
  // Rule metadata
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  usage: {
    timesTriggered: number;
    lastTriggered?: Date;
    successRate: number;
  };
}

export interface AutoAssignmentTrigger {
  type: 'user_created' | 'team_joined' | 'role_granted' | 'key_created' | 'project_assigned' | 'custom';
  filters: Record<string, any>;
  conditions: Record<string, any>;
}

export interface AutoAssignmentCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutoAssignmentAction {
  type: 'assign_key' | 'assign_permission' | 'assign_role' | 'create_team' | 'send_notification' | 'custom';
  parameters: Record<string, any>;
  conditions?: Record<string, any>;
}

export interface AssignmentTemplate {
  templateId: string;
  name: string;
  description: string;
  category: string;
  
  // Template configuration
  assignmentType: AssignmentType;
  defaultScope: Partial<AssignmentScope>;
  defaultContext: Partial<AssignmentContext>;
  defaultPermissions: AssignmentPermission[];
  defaultConditions: AssignmentCondition[];
  defaultRestrictions: AssignmentRestriction[];
  
  // Template metadata
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  usage: {
    timesUsed: number;
    lastUsed?: Date;
    averageRating: number;
  };
  
  // Template settings
  isActive: boolean;
  isSystemTemplate: boolean;
  allowedRoles: string[];
  requiredApproval: boolean;
}

export interface BulkAssignmentOperation {
  operationId: string;
  operationType: 'assign' | 'revoke' | 'update' | 'transfer';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Operation scope
  assignments: string[]; // Assignment IDs or criteria
  totalCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  
  // Operation details
  batchSize: number;
  currentBatch: number;
  totalBatches: number;
  
  // Parameters
  parameters: Record<string, any>;
  template?: string; // Template ID for bulk assignments
  
  // Results
  results: BulkAssignmentResult[];
  errors: BulkAssignmentError[];
  
  // Metadata
  initiatedBy: string;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  reason: string;
}

export interface BulkAssignmentResult {
  assignmentId: string;
  success: boolean;
  message: string;
  details?: Record<string, any>;
  processedAt: Date;
}

export interface BulkAssignmentError {
  assignmentId: string;
  errorType: string;
  errorMessage: string;
  errorDetails: Record<string, any>;
  retryable: boolean;
}

// =============================================================================
// Assignment Tools Service Implementation
// =============================================================================

export class Epic17AssignmentToolsService extends EventEmitter {
  private config: AssignmentToolsConfig;
  private activeAssignments: Map<string, Assignment> = new Map();
  private autoAssignmentRules: Map<string, AutoAssignmentRule> = new Map();
  private assignmentTemplates: Map<string, AssignmentTemplate> = new Map();
  private bulkOperations: Map<string, BulkAssignmentOperation> = new Map();
  private autoAssignmentInterval?: NodeJS.Timeout;

  constructor(
    private database: DatabaseService,
    private redis: RedisService,
    private auditService: AuditService,
    private bulkService: Epic17BulkStatusChangeService,
    config: Partial<AssignmentToolsConfig> = {}
  ) {
    super();
    
    this.config = {
      // Assignment limits
      maxAssignmentsPerUser: 100,
      maxAssignmentsPerKey: 50,
      maxDelegationDepth: 3,
      
      // Auto-assignment
      autoAssignment: {
        enabled: true,
        rules: [],
        evaluationInterval: 15 // 15 minutes
      },
      
      // Approval workflows  
      approval: {
        enabled: true,
        requireApproval: {
          highValueKeys: true,
          crossOrgAssignments: true,
          adminRoleAssignments: true
        },
        approvalTimeout: 72 // 72 hours
      },
      
      // Delegation settings
      delegation: {
        enabled: true,
        allowSubDelegation: true,
        maxDelegationDuration: 30, // 30 days
        requireJustification: true
      },
      
      // Assignment validation
      validation: {
        strictMode: true,
        conflictDetection: true,
        capacityChecking: true,
        dependencyValidation: true
      },
      
      // Notifications
      notifications: {
        onAssignment: true,
        onRevocation: true,
        onExpiration: true,
        reminderDays: [30, 7, 1]
      },
      
      // Audit and compliance
      audit: {
        logAllAssignments: true,
        complianceReporting: true,
        retentionDays: 2557 // 7 years
      },
      
      ...config
    };

    this.initializeAssignmentTools();
  }

  // =============================================================================
  // Core Assignment Operations
  // =============================================================================

  /**
   * Create new assignment
   */
  async createAssignment(
    assignmentType: AssignmentType,
    assigneeId: string,
    assigneeType: Assignment['assigneeType'],
    resourceId: string,
    resourceType: string,
    assignedBy: string,
    options: {
      scope?: Partial<AssignmentScope>;
      context?: Partial<AssignmentContext>;
      permissions?: AssignmentPermission[];
      conditions?: AssignmentCondition[];
      restrictions?: AssignmentRestriction[];
      expiresAt?: Date;
      canDelegate?: boolean;
      reason?: string;
      tags?: string[];
      metadata?: Record<string, any>;
      templateId?: string;
      skipApproval?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const assignmentId = crypto.randomUUID();
      
      // Load template if specified
      let templateConfig: Partial<Assignment> = {};
      if (options.templateId) {
        const template = this.assignmentTemplates.get(options.templateId);
        if (template) {
          templateConfig = this.applyTemplate(template);
        }
      }
      
      // Validate assignment request
      const validation = await this.validateAssignmentRequest(
        assignmentType,
        assigneeId,
        assigneeType, 
        resourceId,
        resourceType,
        assignedBy
      );
      
      if (!validation.valid) {
        throw new Error(`Assignment validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Check if approval is required
      const requiresApproval = this.shouldRequireApproval(
        assignmentType,
        assigneeId,
        resourceId,
        options.scope,
        options.skipApproval
      );
      
      // Create assignment
      const assignment: Assignment = {
        assignmentId,
        assignmentType,
        status: requiresApproval ? AssignmentStatus.PENDING_APPROVAL : AssignmentStatus.PENDING,
        
        // Assignment details
        assigneeId,
        assigneeType,
        resourceId,
        resourceType,
        
        // Scope and context
        scope: {
          organizationId: options.scope?.organizationId,
          teamIds: options.scope?.teamIds || [],
          projectIds: options.scope?.projectIds || [],
          environmentIds: options.scope?.environmentIds || [],
          regions: options.scope?.regions || [],
          countries: options.scope?.countries || [],
          timeZones: options.scope?.timeZones || [],
          businessHours: options.scope?.businessHours,
          customScope: options.scope?.customScope || {},
          ...templateConfig.scope
        },
        context: {
          purpose: options.context?.purpose || 'Standard assignment',
          businessJustification: options.context?.businessJustification || options.reason || 'No justification provided',
          technicalRequirements: options.context?.technicalRequirements || [],
          riskLevel: options.context?.riskLevel || 'medium',
          complianceFrameworks: options.context?.complianceFrameworks || [],
          dataClassification: options.context?.dataClassification || 'internal',
          regulatoryRequirements: options.context?.regulatoryRequirements || [],
          supportLevel: options.context?.supportLevel || 'standard',
          availabilityRequirement: options.context?.availabilityRequirement || '99.9%',
          performanceRequirement: options.context?.performanceRequirement || 'standard',
          integratedSystems: options.context?.integratedSystems || [],
          dependencies: options.context?.dependencies || [],
          downstreamImpact: options.context?.downstreamImpact || [],
          ...templateConfig.context
        },
        permissions: options.permissions || templateConfig.permissions || [],
        
        // Lifecycle
        assignedBy,
        assignedAt: new Date(),
        expiresAt: options.expiresAt,
        
        // Delegation
        delegationLevel: 0,
        isDelegation: false,
        canDelegate: options.canDelegate !== false,
        
        // Configuration
        conditions: options.conditions || templateConfig.conditions || [],
        restrictions: options.restrictions || templateConfig.restrictions || [],
        allowedActions: this.getDefaultAllowedActions(assignmentType, resourceType),
        
        // Approval
        requiresApproval,
        
        // Usage tracking
        usageTracking: {
          totalAccesses: 0,
          accessFrequency: 0,
          dailyUsage: {},
          peakUsageHours: [],
          commonActions: [],
          averageResponseTime: 0,
          errorRate: 0,
          quotaUtilization: 0,
          complianceViolations: 0,
          lastComplianceCheck: new Date(),
          complianceScore: 100
        },
        
        // Metadata
        reason: options.reason || 'Assignment created',
        tags: options.tags || [],
        metadata: options.metadata || {},
        notes: options.reason,
        
        // Compliance
        complianceFlags: await this.assessComplianceFlags(assignmentType, assigneeId, resourceId),
        auditTrail: [{
          entryId: crypto.randomUUID(),
          timestamp: new Date(),
          action: 'assignment_created',
          performedBy: assignedBy,
          newState: { status: requiresApproval ? 'pending_approval' : 'pending' },
          reason: options.reason,
          details: { assignmentType, assigneeId, resourceId }
        }]
      };
      
      // Store assignment
      await this.storeAssignment(assignment);
      
      // Add to active assignments
      this.activeAssignments.set(assignmentId, assignment);
      
      // Create approval request if required
      if (requiresApproval) {
        const approvalRequest = await this.createApprovalRequest(assignment);
        assignment.approvalRequest = approvalRequest;
      } else {
        // Activate assignment immediately
        await this.activateAssignment(assignmentId);
      }
      
      await this.auditService.logAction({
        userId: assignedBy,
        action: 'assignment_created',
        resource: `${assignmentType}:${resourceId}`,
        details: {
          assignmentId,
          assigneeId,
          assigneeType,
          resourceId,
          resourceType,
          requiresApproval,
          expiresAt: options.expiresAt
        }
      });
      
      this.emit('assignment_created', assignment);
      
      return assignmentId;
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Activate assignment (either approved or direct activation)
   */
  async activateAssignment(assignmentId: string): Promise<boolean> {
    try {
      const assignment = this.activeAssignments.get(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      
      if (assignment.status === AssignmentStatus.ACTIVE) {
        return true; // Already active
      }
      
      if (assignment.requiresApproval && !assignment.approvedBy) {
        throw new Error('Assignment requires approval before activation');
      }
      
      // Perform pre-activation checks
      const preChecks = await this.performPreActivationChecks(assignment);
      if (!preChecks.passed) {
        throw new Error(`Pre-activation checks failed: ${preChecks.errors.join(', ')}`);
      }
      
      // Activate the assignment
      assignment.status = AssignmentStatus.ACTIVE;
      assignment.activatedAt = new Date();
      
      // Add audit entry
      assignment.auditTrail.push({
        entryId: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'assignment_activated',
        performedBy: assignment.approvedBy || 'system',
        previousState: { status: 'pending' },
        newState: { status: 'active', activatedAt: assignment.activatedAt },
        reason: 'Assignment activated',
        details: {}
      });
      
      // Update in database
      await this.updateAssignmentStatus(assignmentId, AssignmentStatus.ACTIVE);
      
      // Execute the actual assignment (e.g., grant API key access)
      await this.executeAssignment(assignment);
      
      // Send activation notification
      if (this.config.notifications.onAssignment) {
        await this.sendAssignmentNotification(assignment, 'activated');
      }
      
      await this.auditService.logAction({
        userId: assignment.approvedBy || 'system',
        action: 'assignment_activated',
        resource: `${assignment.assignmentType}:${assignment.resourceId}`,
        details: {
          assignmentId,
          assigneeId: assignment.assigneeId,
          activatedAt: assignment.activatedAt
        }
      });
      
      this.emit('assignment_activated', assignment);
      
      return true;
      
    } catch (error) {
      console.error('Error activating assignment:', error);
      throw error;
    }
  }

  /**
   * Revoke assignment
   */
  async revokeAssignment(
    assignmentId: string,
    revokedBy: string,
    reason: string,
    options: {
      gracePeriod?: number; // minutes
      notifyAssignee?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      const assignment = this.activeAssignments.get(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      
      if (assignment.status === AssignmentStatus.REVOKED) {
        return true; // Already revoked
      }
      
      // Apply grace period if specified
      if (options.gracePeriod && options.gracePeriod > 0) {
        setTimeout(async () => {
          await this.finalizeRevocation(assignment, revokedBy, reason);
        }, options.gracePeriod * 60 * 1000);
        
        // Set status to suspended during grace period
        assignment.status = AssignmentStatus.SUSPENDED;
        await this.updateAssignmentStatus(assignmentId, AssignmentStatus.SUSPENDED);
        
        if (options.notifyAssignee) {
          await this.sendAssignmentNotification(assignment, 'grace_period_started', {
            gracePeriod: options.gracePeriod,
            reason
          });
        }
        
      } else {
        // Revoke immediately
        await this.finalizeRevocation(assignment, revokedBy, reason);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error revoking assignment:', error);
      throw error;
    }
  }

  /**
   * Delegate assignment to another user
   */
  async delegateAssignment(
    originalAssignmentId: string,
    delegateToId: string,
    delegatedBy: string,
    options: {
      duration?: number; // days
      permissions?: AssignmentPermission[];
      restrictions?: AssignmentRestriction[];
      reason?: string;
      canSubDelegate?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const originalAssignment = this.activeAssignments.get(originalAssignmentId);
      if (!originalAssignment) {
        throw new Error('Original assignment not found');
      }
      
      if (!originalAssignment.canDelegate) {
        throw new Error('Assignment cannot be delegated');
      }
      
      if (originalAssignment.status !== AssignmentStatus.ACTIVE) {
        throw new Error('Can only delegate active assignments');
      }
      
      // Check delegation depth
      if (originalAssignment.delegationLevel >= this.config.maxDelegationDepth) {
        throw new Error('Maximum delegation depth exceeded');
      }
      
      // Validate delegate
      const delegateValidation = await this.validateDelegate(delegateToId, originalAssignment);
      if (!delegateValidation.valid) {
        throw new Error(`Delegate validation failed: ${delegateValidation.errors.join(', ')}`);
      }
      
      // Create delegation assignment
      const delegationId = crypto.randomUUID();
      const expirationDate = options.duration 
        ? new Date(Date.now() + options.duration * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + this.config.delegation.maxDelegationDuration * 24 * 60 * 60 * 1000);
      
      const delegationAssignment: Assignment = {
        ...originalAssignment,
        assignmentId: delegationId,
        assigneeId: delegateToId,
        delegatedFrom: originalAssignmentId,
        delegationLevel: originalAssignment.delegationLevel + 1,
        isDelegation: true,
        canDelegate: options.canSubDelegate && this.config.delegation.allowSubDelegation,
        assignedBy: delegatedBy,
        assignedAt: new Date(),
        activatedAt: new Date(),
        expiresAt: expirationDate,
        permissions: options.permissions || originalAssignment.permissions,
        restrictions: [...(originalAssignment.restrictions || []), ...(options.restrictions || [])],
        reason: options.reason || 'Delegation assignment',
        status: AssignmentStatus.ACTIVE,
        requiresApproval: false, // Delegations are auto-approved if original is approved
        auditTrail: [{
          entryId: crypto.randomUUID(),
          timestamp: new Date(),
          action: 'assignment_delegated',
          performedBy: delegatedBy,
          newState: { status: 'active', delegatedFrom: originalAssignmentId },
          reason: options.reason,
          details: { originalAssignmentId, delegateToId, duration: options.duration }
        }]
      };
      
      // Store delegation
      await this.storeAssignment(delegationAssignment);
      this.activeAssignments.set(delegationId, delegationAssignment);
      
      // Update original assignment audit trail
      originalAssignment.auditTrail.push({
        entryId: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'delegation_created',
        performedBy: delegatedBy,
        newState: { delegationId },
        reason: options.reason,
        details: { delegateToId, duration: options.duration }
      });
      
      await this.updateAssignment(originalAssignmentId, originalAssignment);
      
      // Execute delegation
      await this.executeAssignment(delegationAssignment);
      
      // Send notifications
      if (this.config.notifications.onAssignment) {
        await this.sendAssignmentNotification(delegationAssignment, 'delegated');
      }
      
      await this.auditService.logAction({
        userId: delegatedBy,
        action: 'assignment_delegated',
        resource: `${originalAssignment.assignmentType}:${originalAssignment.resourceId}`,
        details: {
          originalAssignmentId,
          delegationId,
          delegateToId,
          duration: options.duration,
          reason: options.reason
        }
      });
      
      this.emit('assignment_delegated', {
        originalAssignment,
        delegationAssignment,
        delegatedBy
      });
      
      return delegationId;
      
    } catch (error) {
      console.error('Error delegating assignment:', error);
      throw error;
    }
  }

  // =============================================================================
  // Bulk Assignment Operations
  // =============================================================================

  /**
   * Execute bulk assignment operation
   */
  async executeBulkAssignment(
    operationType: BulkAssignmentOperation['operationType'],
    assignments: Array<{
      assigneeId: string;
      assigneeType: Assignment['assigneeType'];
      resourceId: string;
      resourceType: string;
    }> | string[], // Either assignment data or existing assignment IDs
    parameters: Record<string, any>,
    initiatedBy: string,
    options: {
      templateId?: string;
      batchSize?: number;
      reason?: string;
      skipApproval?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const operationId = crypto.randomUUID();
      
      const bulkOperation: BulkAssignmentOperation = {
        operationId,
        operationType,
        status: 'pending',
        assignments: typeof assignments[0] === 'string' 
          ? assignments as string[]
          : (assignments as any[]).map(() => 'pending'), // Will be populated after creation
        totalCount: assignments.length,
        processedCount: 0,
        successCount: 0,
        failureCount: 0,
        batchSize: options.batchSize || 50,
        currentBatch: 0,
        totalBatches: Math.ceil(assignments.length / (options.batchSize || 50)),
        parameters,
        template: options.templateId,
        results: [],
        errors: [],
        initiatedBy,
        reason: options.reason || 'Bulk assignment operation'
      };
      
      this.bulkOperations.set(operationId, bulkOperation);
      
      // Store bulk operation
      await this.storeBulkOperation(bulkOperation);
      
      // Execute bulk operation asynchronously
      setImmediate(() => this.processBulkAssignment(operationId, assignments as any));
      
      await this.auditService.logAction({
        userId: initiatedBy,
        action: 'bulk_assignment_started',
        resource: 'bulk_assignments',
        details: {
          operationId,
          operationType,
          totalCount: assignments.length,
          templateId: options.templateId
        }
      });
      
      this.emit('bulk_assignment_started', bulkOperation);
      
      return operationId;
      
    } catch (error) {
      console.error('Error executing bulk assignment:', error);
      throw error;
    }
  }

  // =============================================================================
  // Auto-Assignment System
  // =============================================================================

  /**
   * Create auto-assignment rule
   */
  async createAutoAssignmentRule(
    name: string,
    description: string,
    triggers: AutoAssignmentTrigger[],
    assignmentTemplate: Partial<Assignment>,
    conditions: AutoAssignmentCondition[],
    actions: AutoAssignmentAction[],
    createdBy: string,
    options: {
      priority?: number;
      enabled?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const ruleId = crypto.randomUUID();
      
      const rule: AutoAssignmentRule = {
        ruleId,
        name,
        description,
        enabled: options.enabled !== false,
        priority: options.priority || 100,
        triggers,
        assignmentTemplate,
        conditions,
        actions,
        createdBy,
        createdAt: new Date(),
        lastModified: new Date(),
        usage: {
          timesTriggered: 0,
          successRate: 0
        }
      };
      
      // Store rule
      await this.storeAutoAssignmentRule(rule);
      this.autoAssignmentRules.set(ruleId, rule);
      
      await this.auditService.logAction({
        userId: createdBy,
        action: 'auto_assignment_rule_created',
        resource: 'auto_assignment_rules',
        details: {
          ruleId,
          name,
          enabled: rule.enabled,
          priority: rule.priority
        }
      });
      
      this.emit('auto_assignment_rule_created', rule);
      
      return ruleId;
      
    } catch (error) {
      console.error('Error creating auto-assignment rule:', error);
      throw error;
    }
  }

  /**
   * Evaluate auto-assignment rules for trigger event
   */
  async evaluateAutoAssignmentRules(
    triggerType: AutoAssignmentTrigger['type'],
    eventData: Record<string, any>
  ): Promise<string[]> {
    try {
      const triggeredRules: string[] = [];
      
      // Get applicable rules sorted by priority
      const applicableRules = Array.from(this.autoAssignmentRules.values())
        .filter(rule => rule.enabled)
        .filter(rule => rule.triggers.some(trigger => trigger.type === triggerType))
        .sort((a, b) => b.priority - a.priority);
      
      for (const rule of applicableRules) {
        try {
          // Check if trigger conditions match
          const triggerMatches = await this.evaluateRuleTriggers(rule, triggerType, eventData);
          if (!triggerMatches) continue;
          
          // Check additional conditions
          const conditionsMatch = await this.evaluateRuleConditions(rule.conditions, eventData);
          if (!conditionsMatch) continue;
          
          // Execute rule actions
          await this.executeAutoAssignmentActions(rule, eventData);
          
          // Update rule usage statistics
          rule.usage.timesTriggered++;
          rule.usage.lastTriggered = new Date();
          await this.updateAutoAssignmentRuleUsage(rule.ruleId, rule.usage);
          
          triggeredRules.push(rule.ruleId);
          
          this.emit('auto_assignment_rule_triggered', {
            ruleId: rule.ruleId,
            triggerType,
            eventData
          });
          
        } catch (error) {
          console.error(`Error executing auto-assignment rule ${rule.ruleId}:`, error);
          
          // Update failure statistics
          const currentSuccessRate = rule.usage.successRate;
          const totalTriggers = rule.usage.timesTriggered + 1;
          rule.usage.successRate = ((currentSuccessRate * rule.usage.timesTriggered) / totalTriggers) || 0;
          rule.usage.timesTriggered++;
          
          await this.updateAutoAssignmentRuleUsage(rule.ruleId, rule.usage);
        }
      }
      
      return triggeredRules;
      
    } catch (error) {
      console.error('Error evaluating auto-assignment rules:', error);
      return [];
    }
  }

  // =============================================================================
  // Assignment Templates Management
  // =============================================================================

  /**
   * Create assignment template
   */
  async createAssignmentTemplate(
    name: string,
    description: string,
    category: string,
    assignmentType: AssignmentType,
    templateConfig: {
      defaultScope?: Partial<AssignmentScope>;
      defaultContext?: Partial<AssignmentContext>;
      defaultPermissions?: AssignmentPermission[];
      defaultConditions?: AssignmentCondition[];
      defaultRestrictions?: AssignmentRestriction[];
    },
    createdBy: string,
    options: {
      isSystemTemplate?: boolean;
      allowedRoles?: string[];
      requireApproval?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const templateId = crypto.randomUUID();
      
      const template: AssignmentTemplate = {
        templateId,
        name,
        description,
        category,
        assignmentType,
        defaultScope: templateConfig.defaultScope || {},
        defaultContext: templateConfig.defaultContext || {},
        defaultPermissions: templateConfig.defaultPermissions || [],
        defaultConditions: templateConfig.defaultConditions || [],
        defaultRestrictions: templateConfig.defaultRestrictions || [],
        createdBy,
        createdAt: new Date(),
        lastModified: new Date(),
        usage: {
          timesUsed: 0,
          averageRating: 0
        },
        isActive: true,
        isSystemTemplate: options.isSystemTemplate || false,
        allowedRoles: options.allowedRoles || [],
        requiredApproval: options.requireApproval || false
      };
      
      // Store template
      await this.storeAssignmentTemplate(template);
      this.assignmentTemplates.set(templateId, template);
      
      await this.auditService.logAction({
        userId: createdBy,
        action: 'assignment_template_created',
        resource: 'assignment_templates',
        details: {
          templateId,
          name,
          category,
          assignmentType
        }
      });
      
      this.emit('assignment_template_created', template);
      
      return templateId;
      
    } catch (error) {
      console.error('Error creating assignment template:', error);
      throw error;
    }
  }

  // =============================================================================
  // Helper Methods and Utilities
  // =============================================================================

  private async initializeAssignmentTools(): Promise<void> {
    try {
      // Load existing assignments
      await this.loadActiveAssignments();
      
      // Load auto-assignment rules
      await this.loadAutoAssignmentRules();
      
      // Load assignment templates
      await this.loadAssignmentTemplates();
      
      // Start auto-assignment evaluation if enabled
      if (this.config.autoAssignment.enabled) {
        this.startAutoAssignmentEvaluation();
      }
      
      // Start expiration monitoring
      this.startExpirationMonitoring();
      
      console.log('✅ Epic 17 Assignment Tools Service initialized');
      
    } catch (error) {
      console.error('Error initializing assignment tools service:', error);
      throw error;
    }
  }

  private async validateAssignmentRequest(
    assignmentType: AssignmentType,
    assigneeId: string,
    assigneeType: Assignment['assigneeType'],
    resourceId: string,
    resourceType: string,
    assignedBy: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Check assignment limits
    const currentAssignments = await this.getUserAssignmentCount(assigneeId);
    if (currentAssignments >= this.config.maxAssignmentsPerUser) {
      errors.push(`User has reached maximum assignments limit (${this.config.maxAssignmentsPerUser})`);
    }
    
    // Check resource assignment limits
    const resourceAssignments = await this.getResourceAssignmentCount(resourceId);
    if (resourceAssignments >= this.config.maxAssignmentsPerKey) {
      errors.push(`Resource has reached maximum assignments limit (${this.config.maxAssignmentsPerKey})`);
    }
    
    // Check for conflicts if conflict detection is enabled
    if (this.config.validation.conflictDetection) {
      const conflicts = await this.detectAssignmentConflicts(assigneeId, resourceId, assignmentType);
      if (conflicts.length > 0) {
        errors.push(`Assignment conflicts detected: ${conflicts.join(', ')}`);
      }
    }
    
    // Validate assignee exists and is active
    const assigneeValid = await this.validateAssignee(assigneeId, assigneeType);
    if (!assigneeValid.valid) {
      errors.push(`Invalid assignee: ${assigneeValid.reason}`);
    }
    
    // Validate resource exists and is assignable
    const resourceValid = await this.validateResource(resourceId, resourceType);
    if (!resourceValid.valid) {
      errors.push(`Invalid resource: ${resourceValid.reason}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private shouldRequireApproval(
    assignmentType: AssignmentType,
    assigneeId: string,
    resourceId: string,
    scope?: Partial<AssignmentScope>,
    skipApproval?: boolean
  ): boolean {
    if (skipApproval || !this.config.approval.enabled) {
      return false;
    }
    
    // Check high-value keys
    if (this.config.approval.requireApproval.highValueKeys) {
      // Implementation would check if resource is high-value
      return true; // Simplified - assume approval needed
    }
    
    // Check cross-org assignments
    if (this.config.approval.requireApproval.crossOrgAssignments && scope?.organizationId) {
      // Implementation would check if cross-org
    }
    
    // Check admin role assignments
    if (this.config.approval.requireApproval.adminRoleAssignments && assignmentType === AssignmentType.ROLE_ASSIGNMENT) {
      // Implementation would check if admin role
    }
    
    return false;
  }

  // Database and storage operations
  private async storeAssignment(assignment: Assignment): Promise<void> {
    await this.database.query(`
      INSERT INTO epic17_assignments (
        assignment_id, assignment_type, status, assignee_id, assignee_type,
        resource_id, resource_type, assigned_by, expires_at, is_delegation,
        can_delegate, scope, context, permissions, conditions, restrictions,
        reason, tags, metadata, compliance_flags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `, [
      assignment.assignmentId, assignment.assignmentType, assignment.status,
      assignment.assigneeId, assignment.assigneeType, assignment.resourceId,
      assignment.resourceType, assignment.assignedBy, assignment.expiresAt,
      assignment.isDelegation, assignment.canDelegate,
      JSON.stringify(assignment.scope), JSON.stringify(assignment.context),
      JSON.stringify(assignment.permissions), JSON.stringify(assignment.conditions),
      JSON.stringify(assignment.restrictions), assignment.reason,
      JSON.stringify(assignment.tags), JSON.stringify(assignment.metadata),
      JSON.stringify(assignment.complianceFlags)
    ]);
  }

  // Additional helper methods...
  private getDefaultAllowedActions(assignmentType: AssignmentType, resourceType: string): string[] {
    const defaultActions: Record<string, string[]> = {
      [AssignmentType.API_KEY_ASSIGNMENT]: ['read', 'use'],
      [AssignmentType.PERMISSION_ASSIGNMENT]: ['execute'],
      [AssignmentType.ROLE_ASSIGNMENT]: ['assume'],
      [AssignmentType.TEAM_ASSIGNMENT]: ['member_access'],
      [AssignmentType.RESOURCE_ASSIGNMENT]: ['access'],
      [AssignmentType.DELEGATION]: ['delegate']
    };
    
    return defaultActions[assignmentType] || ['read'];
  }

  private async assessComplianceFlags(assignmentType: AssignmentType, assigneeId: string, resourceId: string): Promise<string[]> {
    // Implementation would assess compliance requirements
    return [];
  }

  // Placeholder implementations for various operations...
  private async loadActiveAssignments(): Promise<void> { }
  private async loadAutoAssignmentRules(): Promise<void> { }
  private async loadAssignmentTemplates(): Promise<void> { }
  private async getUserAssignmentCount(userId: string): Promise<number> { return 0; }
  private async getResourceAssignmentCount(resourceId: string): Promise<number> { return 0; }
  private async detectAssignmentConflicts(assigneeId: string, resourceId: string, type: AssignmentType): Promise<string[]> { return []; }
  private async validateAssignee(assigneeId: string, type: string): Promise<{ valid: boolean; reason?: string }> { return { valid: true }; }
  private async validateResource(resourceId: string, type: string): Promise<{ valid: boolean; reason?: string }> { return { valid: true }; }
  private async performPreActivationChecks(assignment: Assignment): Promise<{ passed: boolean; errors: string[] }> { return { passed: true, errors: [] }; }
  private async executeAssignment(assignment: Assignment): Promise<void> { }
  private async finalizeRevocation(assignment: Assignment, revokedBy: string, reason: string): Promise<void> { }
  private async validateDelegate(delegateId: string, assignment: Assignment): Promise<{ valid: boolean; errors: string[] }> { return { valid: true, errors: [] }; }
  private async sendAssignmentNotification(assignment: Assignment, event: string, data?: any): Promise<void> { }
  private async updateAssignmentStatus(assignmentId: string, status: AssignmentStatus): Promise<void> { }
  private async updateAssignment(assignmentId: string, assignment: Assignment): Promise<void> { }
  private async createApprovalRequest(assignment: Assignment): Promise<AssignmentApprovalRequest> { 
    return {} as AssignmentApprovalRequest; 
  }
  private async processBulkAssignment(operationId: string, assignments: any): Promise<void> { }
  private async storeBulkOperation(operation: BulkAssignmentOperation): Promise<void> { }
  private async storeAutoAssignmentRule(rule: AutoAssignmentRule): Promise<void> { }
  private async storeAssignmentTemplate(template: AssignmentTemplate): Promise<void> { }
  private async updateAutoAssignmentRuleUsage(ruleId: string, usage: any): Promise<void> { }
  private async evaluateRuleTriggers(rule: AutoAssignmentRule, triggerType: string, eventData: any): Promise<boolean> { return true; }
  private async evaluateRuleConditions(conditions: AutoAssignmentCondition[], eventData: any): Promise<boolean> { return true; }
  private async executeAutoAssignmentActions(rule: AutoAssignmentRule, eventData: any): Promise<void> { }
  private applyTemplate(template: AssignmentTemplate): Partial<Assignment> { return {}; }
  
  private startAutoAssignmentEvaluation(): void {
    this.autoAssignmentInterval = setInterval(() => {
      // Evaluate pending auto-assignment triggers
    }, this.config.autoAssignment.evaluationInterval * 60 * 1000);
  }
  
  private startExpirationMonitoring(): void {
    setInterval(() => {
      // Check for expiring assignments
    }, 60 * 60 * 1000); // Every hour
  }

  // Public API methods
  getActiveAssignments(): Assignment[] {
    return Array.from(this.activeAssignments.values());
  }

  async getAssignment(assignmentId: string): Promise<Assignment | null> {
    return this.activeAssignments.get(assignmentId) || null;
  }

  getAutoAssignmentRules(): AutoAssignmentRule[] {
    return Array.from(this.autoAssignmentRules.values());
  }

  getAssignmentTemplates(): AssignmentTemplate[] {
    return Array.from(this.assignmentTemplates.values());
  }

  async getBulkOperationStatus(operationId: string): Promise<BulkAssignmentOperation | null> {
    return this.bulkOperations.get(operationId) || null;
  }
}

export default Epic17AssignmentToolsService;