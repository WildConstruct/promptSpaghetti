// Access Request Workflow Service - Epic 19
// Service for managing data access request workflows and approval processes

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { DataAccessControlService } from './DataAccessControlService';

export interface AccessRequest {
  requestId: string;
  requestorId: string;
  requestorEmail: string;
  resourceId: string;
  resourceType: string;
  resourceDescription: string;
  requestedOperations: Operation[];
  businessJustification: string;
  urgency: RequestUrgency;
  requestedAccess: AccessLevel;
  timeframe: AccessTimeframe;
  approvalWorkflow: ApprovalWorkflow;
  currentStage: WorkflowStage;
  status: RequestStatus;
  submittedAt: Date;
  requiredBy?: Date;
  expiresAt?: Date;
  metadata: Record<string, any>;
}

export interface ApprovalWorkflow {
  workflowId: string;
  stages: WorkflowStage[];
  currentStageIndex: number;
  escalationRules: EscalationRule[];
  autoApprovalRules: AutoApprovalRule[];
  timeoutSettings: TimeoutSettings;
}

export interface WorkflowStage {
  stageId: string;
  stageName: string;
  stageType: StageType;
  approvers: Approver[];
  requiredApprovals: number;
  approvalMode: ApprovalMode;
  timeoutHours: number;
  conditions: StageCondition[];
  actions: StageAction[];
  status: StageStatus;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface Approver {
  approverId: string;
  approverRole: string;
  approverType: ApproverType;
  delegateId?: string;
  status: ApprovalStatus;
  decision?: ApprovalDecision;
  comments?: string;
  decidedAt?: Date;
  notifiedAt?: Date;
  reminderCount: number;
}

export interface EscalationRule {
  ruleId: string;
  condition: EscalationCondition;
  action: EscalationAction;
  escalateTo: string[];
  delay: number; // hours
  maxEscalations: number;
  enabled: boolean;
}

export interface AutoApprovalRule {
  ruleId: string;
  name: string;
  conditions: AutoApprovalCondition[];
  maxAccessLevel: AccessLevel;
  maxDurationDays: number;
  requiredTags: string[];
  enabled: boolean;
}

export interface StageCondition {
  conditionType: ConditionType;
  parameters: Record<string, any>;
  operator: ConditionOperator;
  value: any;
}

export interface StageAction {
  actionType: ActionType;
  parameters: Record<string, any>;
  executeOn: ActionTrigger;
  enabled: boolean;
}

export interface AccessTimeframe {
  startDate?: Date;
  endDate?: Date;
  duration?: number; // days
  recurring?: RecurringPattern;
  timezone: string;
  businessHoursOnly: boolean;
}

export interface RecurringPattern {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  endAfter?: Date;
  maxOccurrences?: number;
}

export interface TimeoutSettings {
  stageTimeoutHours: number;
  workflowTimeoutDays: number;
  reminderIntervalHours: number;
  maxReminders: number;
  autoRejectOnTimeout: boolean;
}

export interface RequestAuditTrail {
  entryId: string;
  requestId: string;
  timestamp: Date;
  actorId: string;
  actorRole: string;
  action: AuditAction;
  fromState?: string;
  toState?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export enum Operation {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  ADMIN = 'ADMIN'
}

export enum RequestUrgency {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export enum AccessLevel {
  READ = 'READ',
  READ_WRITE = 'read_write',
  FULL_ACCESS = 'full_access',
  ADMIN = 'admin'
}

export enum RequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PROVISIONED = 'PROVISIONED'
}

export enum StageType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL_APPROVAL = 'MANUAL_APPROVAL',
  TECHNICAL_REVIEW = 'TECHNICAL_REVIEW',
  SECURITY_REVIEW = 'SECURITY_REVIEW',
  BUSINESS_APPROVAL = 'BUSINESS_APPROVAL',
  FINAL_APPROVAL = 'FINAL_APPROVAL'
}

export enum ApprovalMode {
  ANY = 'ANY', // Any one approver can approve
  ALL = 'ALL', // All approvers must approve
  MAJORITY = 'MAJORITY', // Majority of approvers must approve
  QUORUM = 'QUORUM' // Specific number of approvers must approve
}

export enum StageStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  TIMEOUT = 'TIMEOUT',
  SKIPPED = 'SKIPPED'
}

export enum ApproverType {
  INDIVIDUAL = 'INDIVIDUAL',
  ROLE_BASED = 'ROLE_BASED',
  GROUP = 'GROUP',
  DELEGATE = 'DELEGATE'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  NOTIFIED = 'NOTIFIED',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELEGATED = 'DELEGATED',
  TIMEOUT = 'TIMEOUT'
}

export enum ApprovalDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  APPROVED_WITH_CONDITIONS = 'APPROVED_WITH_CONDITIONS'
}

export enum EscalationCondition {
  TIMEOUT = 'TIMEOUT',
  NO_RESPONSE = 'NO_RESPONSE',
  REJECTED = 'REJECTED',
  HIGH_URGENCY = 'HIGH_URGENCY'
}

export enum EscalationAction {
  NOTIFY_MANAGER = 'NOTIFY_MANAGER',
  REASSIGN = 'REASSIGN',
  AUTO_APPROVE = 'AUTO_APPROVE',
  AUTO_REJECT = 'AUTO_REJECT'
}

export enum ConditionType {
  RESOURCE_TYPE = 'RESOURCE_TYPE',
  ACCESS_LEVEL = 'ACCESS_LEVEL',
  URGENCY = 'URGENCY',
  REQUESTOR_ROLE = 'REQUESTOR_ROLE',
  DATA_CLASSIFICATION = 'DATA_CLASSIFICATION'
}

export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN'
}

export enum ActionType {
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  CREATE_TICKET = 'CREATE_TICKET',
  PROVISION_ACCESS = 'PROVISION_ACCESS',
  REVOKE_ACCESS = 'REVOKE_ACCESS',
  LOG_EVENT = 'LOG_EVENT'
}

export enum ActionTrigger {
  STAGE_START = 'STAGE_START',
  STAGE_COMPLETE = 'STAGE_COMPLETE',
  APPROVAL_RECEIVED = 'APPROVAL_RECEIVED',
  REJECTION_RECEIVED = 'REJECTION_RECEIVED',
  TIMEOUT = 'TIMEOUT'
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum AuditAction {
  REQUEST_SUBMITTED = 'REQUEST_SUBMITTED',
  REQUEST_UPDATED = 'REQUEST_UPDATED',
  STAGE_STARTED = 'STAGE_STARTED',
  APPROVAL_RECEIVED = 'APPROVAL_RECEIVED',
  REJECTION_RECEIVED = 'REJECTION_RECEIVED',
  REQUEST_ESCALATED = 'REQUEST_ESCALATED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  ACCESS_PROVISIONED = 'ACCESS_PROVISIONED',
  ACCESS_REVOKED = 'ACCESS_REVOKED'
}

export class AccessRequestWorkflowService {
  private db: DatabaseService;
  private audit: AuditService;
  private accessControl: DataAccessControlService;

  constructor(
    db: DatabaseService,
    audit: AuditService,
    accessControl: DataAccessControlService
  ) {
    this.db = db;
    this.audit = audit;
    this.accessControl = accessControl;
  }

  /**
   * Submit a new access request
   */
  async submitAccessRequest(request: Omit<AccessRequest, 'requestId' | 'submittedAt' | 'status' | 'currentStage'>): Promise<{ requestId: string }> {
    const requestId = await this.generateRequestId();

    try {
      // Validate request
      await this.validateAccessRequest(request);

      // Determine appropriate workflow
      const workflow = await this.determineWorkflow(request);

      // Check for auto-approval
      const autoApproval = await this.checkAutoApprovalRules(request);
      
      const accessRequest: AccessRequest = {
        ...request,
        requestId,
        submittedAt: new Date(),
        status: autoApproval ? RequestStatus.APPROVED : RequestStatus.SUBMITTED,
        currentStage: workflow.stages[0],
        approvalWorkflow: workflow
      };

      // Store request
      await this.db.query(`
        INSERT INTO access_requests (
          request_id, requestor_id, requestor_email, resource_id, resource_type,
          resource_description, requested_operations, business_justification,
          urgency, requested_access, timeframe, approval_workflow,
          current_stage, status, submitted_at, required_by, expires_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16, $17)
      `, [
        requestId,
        request.requestorId,
        request.requestorEmail,
        request.resourceId,
        request.resourceType,
        request.resourceDescription,
        JSON.stringify(request.requestedOperations),
        request.businessJustification,
        request.urgency,
        request.requestedAccess,
        JSON.stringify(request.timeframe),
        JSON.stringify(workflow),
        JSON.stringify(workflow.stages[0]),
        accessRequest.status,
        request.requiredBy,
        request.expiresAt,
        JSON.stringify(request.metadata)
      ]);

      // Log submission
      await this.logAuditEvent(requestId, request.requestorId, AuditAction.REQUEST_SUBMITTED, {
        resourceId: request.resourceId,
        requestedOperations: request.requestedOperations,
        urgency: request.urgency
      });

      if (autoApproval) {
        // Auto-approve and provision access
        await this.provisionAccess(requestId);
      } else {
        // Start workflow
        await this.startWorkflowStage(requestId, workflow.stages[0]);
      }

      return { requestId };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'ACCESS_REQUEST_SUBMISSION_ERROR',
        userId: request.requestorId,
        resourceId: requestId,
        ipAddress: undefined,
        userAgent: undefined,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      });

      throw error;
    }
  }

  /**
   * Process approval decision
   */
  async processApprovalDecision(
    requestId: string,
    approverId: string,
    decision: ApprovalDecision,
    comments?: string,
    conditions?: string[]
  ): Promise<{ nextStage?: WorkflowStage; completed: boolean }> {
    try {
      const request = await this.getAccessRequest(requestId);
      if (!request) {
        throw new Error('Access request not found');
      }

      // Update approver decision
      const updatedStage = await this.updateApproverDecision(
        request.currentStage,
        approverId,
        decision,
        comments,
        conditions
      );

      // Check if stage is complete
      const stageComplete = await this.checkStageCompletion(updatedStage);
      
      if (stageComplete) {
        const stageApproved = decision === ApprovalDecision.APPROVED || 
                             decision === ApprovalDecision.APPROVED_WITH_CONDITIONS;

        if (stageApproved) {
          // Move to next stage or complete workflow
          const nextStage = await this.getNextWorkflowStage(request);
          
          if (nextStage) {
            await this.progressToNextStage(requestId, nextStage);
            return { nextStage, completed: false };
          } else {
            // Workflow complete - approve and provision
            await this.approveAndProvisionAccess(requestId);
            return { completed: true };
          }
        } else {
          // Stage rejected - reject entire request
          await this.rejectAccessRequest(requestId, `Rejected at stage: ${updatedStage.stageName}`);
          return { completed: true };
        }
      }

      // Stage not yet complete
      return { completed: false };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'ACCESS_APPROVAL_PROCESSING_ERROR',
        userId: approverId,
        resourceId: requestId,
        ipAddress: undefined,
        userAgent: undefined,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      });

      throw error;
    }
  }

  /**
   * Get pending requests for approval
   */
  async getPendingRequestsForApprover(approverId: string): Promise<AccessRequest[]> {
    const result = await this.db.query(`
      SELECT * FROM access_requests 
      WHERE status IN ($1, $2) 
      AND current_stage->'approvers' @> $3
      ORDER BY urgency DESC, submitted_at ASC
    `, [
      RequestStatus.SUBMITTED,
      RequestStatus.IN_REVIEW,
      JSON.stringify([{ approverId, status: ApprovalStatus.PENDING }])
    ]);

    return result.rows.map(this.mapToAccessRequest);
  }

  /**
   * Get request status and history
   */
  async getRequestDetails(requestId: string): Promise<{
    request: AccessRequest;
    auditTrail: RequestAuditTrail[];
  }> {
    const [requestResult, auditResult] = await Promise.all([
      this.db.query('SELECT * FROM access_requests WHERE request_id = $1', [requestId]),
      this.db.query(`
        SELECT * FROM request_audit_trail 
        WHERE request_id = $1 
        ORDER BY timestamp DESC
      `, [requestId])
    ]);

    if (requestResult.rows.length === 0) {
      throw new Error('Access request not found');
    }

    return {
      request: this.mapToAccessRequest(requestResult.rows[0]),
      auditTrail: auditResult.rows.map(this.mapToAuditTrail)
    };
  }

  /**
   * Cancel access request
   */
  async cancelAccessRequest(requestId: string, cancelledBy: string, reason: string): Promise<void> {
    try {
      await this.db.query(`
        UPDATE access_requests 
        SET status = $1, cancelled_at = NOW(), cancelled_by = $2, cancellation_reason = $3
        WHERE request_id = $4 AND status NOT IN ($5, $6, $7)
      `, [
        RequestStatus.CANCELLED,
        cancelledBy,
        reason,
        requestId,
        RequestStatus.APPROVED,
        RequestStatus.REJECTED,
        RequestStatus.PROVISIONED
      ]);

      await this.logAuditEvent(requestId, cancelledBy, AuditAction.REQUEST_REJECTED, {
        reason: 'Cancelled by requestor',
        details: reason
      });

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'ACCESS_REQUEST_CANCELLATION_ERROR',
        userId: cancelledBy,
        resourceId: requestId,
        ipAddress: undefined,
        userAgent: undefined,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      });

      throw error;
    }
  }

  /**
   * Process workflow timeouts
   */
  async processWorkflowTimeouts(): Promise<{ processedRequests: number; escalatedRequests: number }> {
    const timeoutRequests = await this.getTimedOutRequests();
    let processedRequests = 0;
    let escalatedRequests = 0;

    for (const request of timeoutRequests) {
      try {
        const escalationRule = await this.findApplicableEscalationRule(request);
        
        if (escalationRule) {
          await this.executeEscalationAction(request, escalationRule);
          escalatedRequests++;
        } else {
          // Default timeout action
          await this.rejectAccessRequest(request.requestId, 'Request timed out');
        }
        
        processedRequests++;
      } catch (error) {
        console.error(`Failed to process timeout for request ${request.requestId}:`, error);
      }
    }

    return { processedRequests, escalatedRequests };
  }

  // Private helper methods

  private async validateAccessRequest(request: any): Promise<void> {
    if (!request.requestorId) {
      throw new Error('Requestor ID is required');
    }

    if (!request.resourceId) {
      throw new Error('Resource ID is required');
    }

    if (!request.businessJustification || request.businessJustification.length < 20) {
      throw new Error('Business justification must be at least 20 characters');
    }

    if (!request.requestedOperations || request.requestedOperations.length === 0) {
      throw new Error('At least one operation must be requested');
    }
  }

  private async determineWorkflow(request: any): Promise<ApprovalWorkflow> {
    // Simplified workflow determination logic
    const stages: WorkflowStage[] = [];

    // Always include technical review for data access
    stages.push({
      stageId: 'technical-review',
      stageName: 'Technical Review',
      stageType: StageType.TECHNICAL_REVIEW,
      approvers: [{
        approverId: 'it-security-manager',
        approverRole: 'IT Security Manager',
        approverType: ApproverType.ROLE_BASED,
        status: ApprovalStatus.PENDING,
        reminderCount: 0
      }],
      requiredApprovals: 1,
      approvalMode: ApprovalMode.ANY,
      timeoutHours: 24,
      conditions: [],
      actions: [],
      status: StageStatus.PENDING
    });

    // Add business approval for sensitive data
    if (request.requestedAccess === AccessLevel.ADMIN || request.urgency === RequestUrgency.EMERGENCY) {
      stages.push({
        stageId: 'business-approval',
        stageName: 'Business Approval',
        stageType: StageType.BUSINESS_APPROVAL,
        approvers: [{
          approverId: 'business-unit-manager',
          approverRole: 'Business Unit Manager',
          approverType: ApproverType.ROLE_BASED,
          status: ApprovalStatus.PENDING,
          reminderCount: 0
        }],
        requiredApprovals: 1,
        approvalMode: ApprovalMode.ANY,
        timeoutHours: 48,
        conditions: [],
        actions: [],
        status: StageStatus.PENDING
      });
    }

    return {
      workflowId: `WF-${Date.now()}`,
      stages,
      currentStageIndex: 0,
      escalationRules: [],
      autoApprovalRules: [],
      timeoutSettings: {
        stageTimeoutHours: 72,
        workflowTimeoutDays: 7,
        reminderIntervalHours: 24,
        maxReminders: 3,
        autoRejectOnTimeout: true
      }
    };
  }

  private async checkAutoApprovalRules(request: any): Promise<boolean> {
    // Simple auto-approval logic for demo
    return request.requestedAccess === AccessLevel.read && 
           request.urgency === RequestUrgency.LOW;
  }

  private async startWorkflowStage(requestId: string, stage: WorkflowStage): Promise<void> {
    // Update stage status and notify approvers
    stage.status = StageStatus.IN_PROGRESS;
    stage.startedAt = new Date();

    await this.db.query(`
      UPDATE access_requests 
      SET current_stage = $1, status = $2
      WHERE request_id = $3
    `, [JSON.stringify(stage), RequestStatus.IN_REVIEW, requestId]);

    // Notify approvers
    for (const approver of stage.approvers) {
      await this.notifyApprover(requestId, approver);
    }
  }

  private async updateApproverDecision(
    stage: WorkflowStage,
    approverId: string,
    decision: ApprovalDecision,
    comments?: string,
    conditions?: string[]
  ): Promise<WorkflowStage> {
    const approver = stage.approvers.find(a => a.approverId === approverId);
    if (!approver) {
      throw new Error('Approver not found in current stage');
    }

    approver.decision = decision;
    approver.comments = comments;
    approver.decidedAt = new Date();
    approver.status = decision === ApprovalDecision.APPROVED || decision === ApprovalDecision.APPROVED_WITH_CONDITIONS
      ? ApprovalStatus.APPROVED
      : ApprovalStatus.REJECTED;

    return stage;
  }

  private async checkStageCompletion(stage: WorkflowStage): Promise<boolean> {
    const approvals = stage.approvers.filter(a => a.status === ApprovalStatus.APPROVED);
    const rejections = stage.approvers.filter(a => a.status === ApprovalStatus.REJECTED);

    switch (stage.approvalMode) {
      case ApprovalMode.ANY:
        return approvals.length > 0 || rejections.length > 0;
      case ApprovalMode.ALL:
        return approvals.length === stage.approvers.length || rejections.length > 0;
      case ApprovalMode.MAJORITY:
        const majority = Math.ceil(stage.approvers.length / 2);
        return approvals.length >= majority || rejections.length >= majority;
      case ApprovalMode.QUORUM:
        return approvals.length >= stage.requiredApprovals || rejections.length > 0;
      default:
        return false;
    }
  }

  private async getNextWorkflowStage(request: AccessRequest): Promise<WorkflowStage | null> {
    const currentIndex = request.approvalWorkflow.currentStageIndex;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < request.approvalWorkflow.stages.length) {
      return request.approvalWorkflow.stages[nextIndex];
    }
    
    return null;
  }

  private async progressToNextStage(requestId: string, nextStage: WorkflowStage): Promise<void> {
    await this.startWorkflowStage(requestId, nextStage);
  }

  private async approveAndProvisionAccess(requestId: string): Promise<void> {
    await this.db.query(`
      UPDATE access_requests 
      SET status = $1, approved_at = NOW()
      WHERE request_id = $2
    `, [RequestStatus.APPROVED, requestId]);

    await this.provisionAccess(requestId);
  }

  private async rejectAccessRequest(requestId: string, reason: string): Promise<void> {
    await this.db.query(`
      UPDATE access_requests 
      SET status = $1, rejected_at = NOW(), rejection_reason = $2
      WHERE request_id = $3
    `, [RequestStatus.REJECTED, reason, requestId]);
  }

  private async provisionAccess(requestId: string): Promise<void> {
    // Implementation for provisioning access through DataAccessControlService
    await this.db.query(`
      UPDATE access_requests 
      SET status = $1, provisioned_at = NOW()
      WHERE request_id = $2
    `, [RequestStatus.PROVISIONED, requestId]);
  }

  private async notifyApprover(requestId: string, approver: Approver): Promise<void> {
    // Implementation for sending notifications to approvers
    approver.notifiedAt = new Date();
  }

  private async getTimedOutRequests(): Promise<AccessRequest[]> {
    const result = await this.db.query(`
      SELECT * FROM access_requests 
      WHERE status = $1 
      AND submitted_at < NOW() - INTERVAL '72 hours'
    `, [RequestStatus.IN_REVIEW]);

    return result.rows.map(this.mapToAccessRequest);
  }

  private async findApplicableEscalationRule(request: AccessRequest): Promise<EscalationRule | null> {
    // Implementation for finding applicable escalation rules
    return null;
  }

  private async executeEscalationAction(request: AccessRequest, rule: EscalationRule): Promise<void> {
    // Implementation for executing escalation actions
  }

  private async logAuditEvent(
    requestId: string,
    actorId: string,
    action: AuditAction,
    details: Record<string, any>
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO request_audit_trail (
        request_id, actor_id, action, details, timestamp
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [requestId, actorId, action, JSON.stringify(details)]);
  }

  private async generateRequestId(): Promise<string> {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getAccessRequest(requestId: string): Promise<AccessRequest | null> {
    const result = await this.db.query(`
      SELECT * FROM access_requests WHERE request_id = $1
    `, [requestId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToAccessRequest(result.rows[0]);
  }

  private mapToAccessRequest(row: any): AccessRequest {
    return {
      requestId: row.request_id,
      requestorId: row.requestor_id,
      requestorEmail: row.requestor_email,
      resourceId: row.resource_id,
      resourceType: row.resource_type,
      resourceDescription: row.resource_description,
      requestedOperations: JSON.parse(row.requested_operations || '[]'),
      businessJustification: row.business_justification,
      urgency: row.urgency,
      requestedAccess: row.requested_access,
      timeframe: JSON.parse(row.timeframe || '{}'),
      approvalWorkflow: JSON.parse(row.approval_workflow || '{}'),
      currentStage: JSON.parse(row.current_stage || '{}'),
      status: row.status,
      submittedAt: row.submitted_at,
      requiredBy: row.required_by,
      expiresAt: row.expires_at,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  private mapToAuditTrail(row: any): RequestAuditTrail {
    return {
      entryId: row.entry_id,
      requestId: row.request_id,
      timestamp: row.timestamp,
      actorId: row.actor_id,
      actorRole: row.actor_role,
      action: row.action,
      fromState: row.from_state,
      toState: row.to_state,
      details: JSON.parse(row.details || '{}'),
      ipAddress: row.ip_address,
      userAgent: row.user_agent
    };
  }
}