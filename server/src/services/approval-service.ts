// Epic 9.4.2 - Advanced Approval Service
// Enhanced approval workflows with reviewer assignment and criteria management

import { WorkflowDAO } from '../database/workflow-dao';
import { Database } from '../database/connection';
import {
  WorkflowApproval,
  WorkflowApprovalReviewer,
  WorkflowTransition,
  WorkflowState,
  CreateWorkflowApprovalSchema,
  ApproveWorkflowSchema,
  RejectWorkflowSchema
} from '../database/workflow-models';

export interface ApprovalCriteria {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  conditions: Record<string, any>;
  weight: number;
  is_required: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ApprovalRule {
  id: string;
  workspace_id: string;
  transition_id: string;
  name: string;
  description?: string;
  
  // Reviewer assignment
  reviewer_assignment_type: 'manual' | 'automatic' | 'role_based' | 'round_robin';
  required_reviewers: number;
  minimum_approvals: number;
  allow_self_approval: boolean;
  
  // Criteria
  criteria_ids: string[];
  require_all_criteria: boolean;
  
  // Timeouts and escalation
  approval_timeout_hours: number;
  escalation_enabled: boolean;
  escalation_after_hours: number;
  escalation_reviewers: string[];
  
  // Auto-approval conditions
  auto_approval_enabled: boolean;
  auto_approval_conditions: Record<string, any>;
  
  created_at: Date;
  updated_at: Date;
}

export interface ApprovalRequest {
  id: string;
  workspace_id: string;
  resource_id: string;
  rule_id: string;
  transition_id: string;
  requester_id: string;
  
  // Request details
  title: string;
  description?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  business_justification?: string;
  
  // Status and timeline
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  requested_at: Date;
  due_date?: Date;
  completed_at?: Date;
  
  // Approval metadata
  current_approvals: number;
  required_approvals: number;
  approval_percentage: number;
  
  // Escalation
  escalated_at?: Date;
  escalation_reason?: string;
  
  created_at: Date;
  updated_at: Date;
}

export interface ReviewerAssignment {
  id: string;
  approval_request_id: string;
  reviewer_id: string;
  assignment_type: 'primary' | 'secondary' | 'escalated';
  assignment_reason?: string;
  assigned_at: Date;
  notified_at?: Date;
  
  // Review details
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'abstained';
  review_started_at?: Date;
  reviewed_at?: Date;
  review_comment?: string;
  
  // Criteria evaluation
  criteria_evaluations: Record<string, {
    criteria_id: string;
    passed: boolean;
    score: number;
    comment?: string;
  }>;
  
  created_at: Date;
  updated_at: Date;
}

export interface ApprovalNotification {
  id: string;
  approval_request_id: string;
  reviewer_id: string;
  notification_type: 'assignment' | 'reminder' | 'escalation' | 'completion';
  title: string;
  message: string;
  sent_at: Date;
  read_at?: Date;
  action_taken?: string;
  created_at: Date;
}

export class ApprovalService {
  private dao: WorkflowDAO;
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.dao = new WorkflowDAO(db);
  }

  // =============================================================================
  // APPROVAL CRITERIA MANAGEMENT
  // =============================================================================

  async createApprovalCriteria(data: Omit<ApprovalCriteria, 'id' | 'created_at' | 'updated_at'>): Promise<ApprovalCriteria> {
    const result = await this.db.query(`
      INSERT INTO approval_criteria (
        workspace_id, name, description, conditions, weight, is_required
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.workspace_id,
      data.name,
      data.description,
      JSON.stringify(data.conditions),
      data.weight,
      data.is_required
    ]);

    return result.rows[0];
  }

  async getApprovalCriteria(workspaceId: string): Promise<ApprovalCriteria[]> {
    const result = await this.db.query(`
      SELECT * FROM approval_criteria 
      WHERE workspace_id = $1 
      ORDER BY weight DESC, name
    `, [workspaceId]);

    return result.rows.map(row => ({
      ...row,
      conditions: JSON.parse(row.conditions || '{}')
    }));
  }

  async updateApprovalCriteria(id: string, updates: Partial<ApprovalCriteria>): Promise<ApprovalCriteria | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.values(updates).map(value => 
      typeof value === 'object' ? JSON.stringify(value) : value
    );

    const result = await this.db.query(`
      UPDATE approval_criteria 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `, [id, ...values]);

    return result.rows[0] || null;
  }

  async deleteApprovalCriteria(id: string): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM approval_criteria WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  // =============================================================================
  // APPROVAL RULES MANAGEMENT
  // =============================================================================

  async createApprovalRule(data: Omit<ApprovalRule, 'id' | 'created_at' | 'updated_at'>): Promise<ApprovalRule> {
    const result = await this.db.query(`
      INSERT INTO approval_rules (
        workspace_id, transition_id, name, description,
        reviewer_assignment_type, required_reviewers, minimum_approvals, allow_self_approval,
        criteria_ids, require_all_criteria,
        approval_timeout_hours, escalation_enabled, escalation_after_hours, escalation_reviewers,
        auto_approval_enabled, auto_approval_conditions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      data.workspace_id,
      data.transition_id,
      data.name,
      data.description,
      data.reviewer_assignment_type,
      data.required_reviewers,
      data.minimum_approvals,
      data.allow_self_approval,
      JSON.stringify(data.criteria_ids),
      data.require_all_criteria,
      data.approval_timeout_hours,
      data.escalation_enabled,
      data.escalation_after_hours,
      JSON.stringify(data.escalation_reviewers),
      data.auto_approval_enabled,
      JSON.stringify(data.auto_approval_conditions)
    ]);

    return {
      ...result.rows[0],
      criteria_ids: JSON.parse(result.rows[0].criteria_ids || '[]'),
      escalation_reviewers: JSON.parse(result.rows[0].escalation_reviewers || '[]'),
      auto_approval_conditions: JSON.parse(result.rows[0].auto_approval_conditions || '{}')
    };
  }

  async getApprovalRules(workspaceId: string, transitionId?: string): Promise<ApprovalRule[]> {
    let query = `
      SELECT * FROM approval_rules 
      WHERE workspace_id = $1
    `;
    const params = [workspaceId];

    if (transitionId) {
      query += ' AND transition_id = $2';
      params.push(transitionId);
    }

    query += ' ORDER BY name';

    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      ...row,
      criteria_ids: JSON.parse(row.criteria_ids || '[]'),
      escalation_reviewers: JSON.parse(row.escalation_reviewers || '[]'),
      auto_approval_conditions: JSON.parse(row.auto_approval_conditions || '{}')
    }));
  }

  // =============================================================================
  // REVIEWER ASSIGNMENT
  // =============================================================================

  async assignReviewers(
    approvalRequestId: string,
    rule: ApprovalRule,
    resourceId: string,
    requesterId: string
  ): Promise<ReviewerAssignment[]> {
    const assignments: ReviewerAssignment[] = [];

    switch (rule.reviewer_assignment_type) {
    case 'automatic':
      // Assign based on resource ownership or project roles
      const resourceOwners = await this.getResourceOwners(resourceId);
      for (const owner of resourceOwners.slice(0, rule.required_reviewers)) {
        if (owner !== requesterId || rule.allow_self_approval) {
          assignments.push(await this.createReviewerAssignment(
            approvalRequestId,
            owner,
            'primary',
            'Automatic assignment based on resource ownership'
          ));
        }
      }
      break;

    case 'role_based':
      // Assign based on workspace roles
      const roleBasedReviewers = await this.getRoleBasedReviewers(rule.workspace_id, resourceId);
      for (const reviewer of roleBasedReviewers.slice(0, rule.required_reviewers)) {
        if (reviewer !== requesterId || rule.allow_self_approval) {
          assignments.push(await this.createReviewerAssignment(
            approvalRequestId,
            reviewer,
            'primary',
            'Role-based assignment'
          ));
        }
      }
      break;

    case 'round_robin':
      // Assign using round-robin algorithm
      const roundRobinReviewers = await this.getRoundRobinReviewers(rule.workspace_id, rule.required_reviewers);
      for (const reviewer of roundRobinReviewers) {
        if (reviewer !== requesterId || rule.allow_self_approval) {
          assignments.push(await this.createReviewerAssignment(
            approvalRequestId,
            reviewer,
            'primary',
            'Round-robin assignment'
          ));
        }
      }
      break;

    case 'manual':
    default:
      // Manual assignment will be handled separately
      break;
    }

    return assignments;
  }

  private async createReviewerAssignment(
    approvalRequestId: string,
    reviewerId: string,
    assignmentType: 'primary' | 'secondary' | 'escalated',
    reason?: string
  ): Promise<ReviewerAssignment> {
    const result = await this.db.query(`
      INSERT INTO reviewer_assignments (
        approval_request_id, reviewer_id, assignment_type, assignment_reason
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [approvalRequestId, reviewerId, assignmentType, reason]);

    return {
      ...result.rows[0],
      criteria_evaluations: {}
    };
  }

  private async getResourceOwners(resourceId: string): Promise<string[]> {
    const result = await this.db.query(`
      SELECT DISTINCT created_by as owner
      FROM resources r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = $1
      UNION
      SELECT DISTINCT created_by as owner
      FROM projects p
      JOIN resources r ON p.id = r.project_id
      WHERE r.id = $1
    `, [resourceId]);

    return result.rows.map(row => row.owner);
  }

  private async getRoleBasedReviewers(workspaceId: string, resourceId: string): Promise<string[]> {
    const result = await this.db.query(`
      SELECT DISTINCT aa.user_id
      FROM acl_assignments aa
      JOIN acl_roles ar ON aa.role_id = ar.id
      JOIN resources r ON aa.scope_id = r.project_id
      WHERE r.id = $1 
      AND aa.scope_type = 'project'
      AND (ar.permissions & 1024) = 1024  -- Assuming 1024 is approval permission
      ORDER BY aa.granted_at
    `, [resourceId]);

    return result.rows.map(row => row.user_id);
  }

  private async getRoundRobinReviewers(workspaceId: string, count: number): Promise<string[]> {
    const result = await this.db.query(`
      SELECT DISTINCT aa.user_id, 
             COUNT(ra.id) as recent_assignments
      FROM acl_assignments aa
      JOIN acl_roles ar ON aa.role_id = ar.id
      LEFT JOIN reviewer_assignments ra ON aa.user_id = ra.reviewer_id 
        AND ra.assigned_at > NOW() - INTERVAL '30 days'
      WHERE aa.scope_type = 'workspace'
      AND aa.scope_id = $1
      AND (ar.permissions & 1024) = 1024  -- Approval permission
      GROUP BY aa.user_id
      ORDER BY recent_assignments, RANDOM()
      LIMIT $2
    `, [workspaceId, count]);

    return result.rows.map(row => row.user_id);
  }

  // =============================================================================
  // APPROVAL REQUEST MANAGEMENT
  // =============================================================================

  async createApprovalRequest(
    workspaceId: string,
    resourceId: string,
    transitionId: string,
    requesterId: string,
    data: {
      title: string;
      description?: string;
      urgency?: 'low' | 'medium' | 'high' | 'critical';
      business_justification?: string;
      due_date?: Date;
    }
  ): Promise<ApprovalRequest> {
    return this.db.transaction(async (client) => {
      // Get applicable approval rules
      const rules = await this.getApprovalRules(workspaceId, transitionId);
      const rule = rules[0]; // Use first matching rule for now

      if (!rule) {
        throw new Error('No approval rule found for this transition');
      }

      // Create approval request
      const result = await client.query(`
        INSERT INTO approval_requests (
          workspace_id, resource_id, rule_id, transition_id, requester_id,
          title, description, urgency, business_justification, due_date,
          required_approvals
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        workspaceId,
        resourceId,
        rule.id,
        transitionId,
        requesterId,
        data.title,
        data.description,
        data.urgency || 'medium',
        data.business_justification,
        data.due_date || new Date(Date.now() + rule.approval_timeout_hours * 60 * 60 * 1000),
        rule.minimum_approvals
      ]);

      const approvalRequest = result.rows[0];

      // Assign reviewers
      const assignments = await this.assignReviewers(
        approvalRequest.id,
        rule,
        resourceId,
        requesterId
      );

      // Send notifications
      await this.sendApprovalNotifications(approvalRequest, assignments);

      return approvalRequest;
    });
  }

  async getApprovalRequests(
    workspaceId: string,
    filters: {
      status?: string;
      requester_id?: string;
      reviewer_id?: string;
      resource_id?: string;
      overdue?: boolean;
      urgency?: string;
    } = {}
  ): Promise<ApprovalRequest[]> {
    let query = `
      SELECT ar.*, 
             COUNT(ra.id) as total_reviewers,
             COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) as approved_count
      FROM approval_requests ar
      LEFT JOIN reviewer_assignments ra ON ar.id = ra.approval_request_id
      WHERE ar.workspace_id = $1
    `;
    const params = [workspaceId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND ar.status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.requester_id) {
      query += ` AND ar.requester_id = $${paramIndex++}`;
      params.push(filters.requester_id);
    }

    if (filters.reviewer_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM reviewer_assignments ra2 
        WHERE ra2.approval_request_id = ar.id 
        AND ra2.reviewer_id = $${paramIndex++}
      )`;
      params.push(filters.reviewer_id);
    }

    if (filters.resource_id) {
      query += ` AND ar.resource_id = $${paramIndex++}`;
      params.push(filters.resource_id);
    }

    if (filters.urgency) {
      query += ` AND ar.urgency = $${paramIndex++}`;
      params.push(filters.urgency);
    }

    if (filters.overdue) {
      query += ' AND ar.due_date < NOW() AND ar.status IN (\'pending\', \'in_review\')';
    }

    query += `
      GROUP BY ar.id
      ORDER BY ar.created_at DESC
    `;

    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      ...row,
      current_approvals: parseInt(row.approved_count),
      approval_percentage: row.required_approvals > 0 
        ? (parseInt(row.approved_count) / row.required_approvals) * 100 
        : 0
    }));
  }

  async getReviewerAssignments(approvalRequestId: string): Promise<ReviewerAssignment[]> {
    const result = await this.db.query(`
      SELECT ra.*, u.name as reviewer_name
      FROM reviewer_assignments ra
      LEFT JOIN users u ON ra.reviewer_id = u.id
      WHERE ra.approval_request_id = $1
      ORDER BY ra.assignment_type, ra.assigned_at
    `, [approvalRequestId]);

    return result.rows.map(row => ({
      ...row,
      criteria_evaluations: JSON.parse(row.criteria_evaluations || '{}')
    }));
  }

  // =============================================================================
  // APPROVAL ACTIONS
  // =============================================================================

  async submitReview(
    approvalRequestId: string,
    reviewerId: string,
    data: {
      decision: 'approve' | 'reject' | 'abstain';
      comment?: string;
      criteria_evaluations?: Record<string, any>;
    }
  ): Promise<{ success: boolean; approved?: boolean; rejected?: boolean }> {
    return this.db.transaction(async (client) => {
      // Update reviewer assignment
      await client.query(`
        UPDATE reviewer_assignments 
        SET status = $1, reviewed_at = NOW(), review_comment = $2, 
            criteria_evaluations = $3
        WHERE approval_request_id = $4 AND reviewer_id = $5
      `, [
        data.decision === 'approve' ? 'approved' : 
          data.decision === 'reject' ? 'rejected' : 'abstained',
        data.comment,
        JSON.stringify(data.criteria_evaluations || {}),
        approvalRequestId,
        reviewerId
      ]);

      // Get approval request and check if complete
      const requestResult = await client.query(`
        SELECT ar.*, 
               COUNT(CASE WHEN ra.status = 'approved' THEN 1 END) as approved_count,
               COUNT(CASE WHEN ra.status = 'rejected' THEN 1 END) as rejected_count
        FROM approval_requests ar
        LEFT JOIN reviewer_assignments ra ON ar.id = ra.approval_request_id
        WHERE ar.id = $1
        GROUP BY ar.id
      `, [approvalRequestId]);

      const request = requestResult.rows[0];
      const approvedCount = parseInt(request.approved_count);
      const rejectedCount = parseInt(request.rejected_count);

      let newStatus = request.status;
      let completed = false;

      // Check if approval is complete
      if (approvedCount >= request.required_approvals) {
        newStatus = 'approved';
        completed = true;
      } else if (rejectedCount > 0) {
        newStatus = 'rejected';
        completed = true;
      }

      // Update approval request status
      if (completed) {
        await client.query(`
          UPDATE approval_requests 
          SET status = $1, completed_at = NOW(), current_approvals = $2
          WHERE id = $3
        `, [newStatus, approvedCount, approvalRequestId]);

        // If approved, execute the state transition
        if (newStatus === 'approved') {
          await this.executeApprovedTransition(request);
        }
      } else {
        await client.query(`
          UPDATE approval_requests 
          SET status = 'in_review', current_approvals = $1
          WHERE id = $2
        `, [approvedCount, approvalRequestId]);
      }

      return {
        success: true,
        approved: newStatus === 'approved',
        rejected: newStatus === 'rejected'
      };
    });
  }

  private async executeApprovedTransition(request: ApprovalRequest): Promise<void> {
    // Execute the approved state transition
    await this.dao.transitionResourceState({
      resource_id: request.resource_id,
      to_state_id: request.transition_id, // This should be the target state ID
      comment: `Approved transition - ${request.title}`,
      metadata: {
        approval_request_id: request.id,
        approved_by: 'system'
      }
    }, 'system');
  }

  // =============================================================================
  // ESCALATION MANAGEMENT
  // =============================================================================

  async processEscalations(): Promise<void> {
    const overdueRequests = await this.db.query(`
      SELECT ar.*, aru.escalation_after_hours, aru.escalation_reviewers
      FROM approval_requests ar
      JOIN approval_rules aru ON ar.rule_id = aru.id
      WHERE ar.status IN ('pending', 'in_review')
      AND ar.escalated_at IS NULL
      AND aru.escalation_enabled = true
      AND ar.requested_at < NOW() - INTERVAL '1 hour' * aru.escalation_after_hours
    `);

    for (const request of overdueRequests.rows) {
      await this.escalateApprovalRequest(request);
    }
  }

  private async escalateApprovalRequest(request: any): Promise<void> {
    const escalationReviewers = JSON.parse(request.escalation_reviewers || '[]');

    // Add escalation reviewers
    for (const reviewerId of escalationReviewers) {
      await this.createReviewerAssignment(
        request.id,
        reviewerId,
        'escalated',
        'Escalated due to timeout'
      );
    }

    // Update request status
    await this.db.query(`
      UPDATE approval_requests 
      SET escalated_at = NOW(), escalation_reason = $1
      WHERE id = $2
    `, ['Escalated due to timeout', request.id]);

    // Send escalation notifications
    await this.sendEscalationNotifications(request, escalationReviewers);
  }

  // =============================================================================
  // NOTIFICATION SYSTEM
  // =============================================================================

  private async sendApprovalNotifications(
    request: ApprovalRequest,
    assignments: ReviewerAssignment[]
  ): Promise<void> {
    for (const assignment of assignments) {
      await this.db.query(`
        INSERT INTO approval_notifications (
          approval_request_id, reviewer_id, notification_type, title, message
        ) VALUES ($1, $2, 'assignment', $3, $4)
      `, [
        request.id,
        assignment.reviewer_id,
        `Approval Required: ${request.title}`,
        `You have been assigned to review an approval request for ${request.title}. Please review and provide your decision.`
      ]);
    }
  }

  private async sendEscalationNotifications(
    request: any,
    escalationReviewers: string[]
  ): Promise<void> {
    for (const reviewerId of escalationReviewers) {
      await this.db.query(`
        INSERT INTO approval_notifications (
          approval_request_id, reviewer_id, notification_type, title, message
        ) VALUES ($1, $2, 'escalation', $3, $4)
      `, [
        request.id,
        reviewerId,
        `Escalated Approval: ${request.title}`,
        'An approval request has been escalated to you due to timeout. Please review urgently.'
      ]);
    }
  }

  // =============================================================================
  // STATISTICS AND REPORTING
  // =============================================================================

  async getApprovalStatistics(workspaceId: string): Promise<{
    total_requests: number;
    pending_requests: number;
    overdue_requests: number;
    avg_approval_time_hours: number;
    approval_rate: number;
    by_urgency: Record<string, number>;
    by_status: Record<string, number>;
    top_reviewers: Array<{ reviewer_id: string; count: number }>;
  }> {
    const [
      totalResult,
      pendingResult,
      overdueResult,
      avgTimeResult,
      approvalRateResult,
      urgencyResult,
      statusResult,
      reviewersResult
    ] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM approval_requests WHERE workspace_id = $1', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM approval_requests WHERE workspace_id = $1 AND status IN (\'pending\', \'in_review\')', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM approval_requests WHERE workspace_id = $1 AND status IN (\'pending\', \'in_review\') AND due_date < NOW()', [workspaceId]),
      this.db.query('SELECT AVG(EXTRACT(EPOCH FROM (completed_at - requested_at)) / 3600) as avg_hours FROM approval_requests WHERE workspace_id = $1 AND completed_at IS NOT NULL', [workspaceId]),
      this.db.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'approved\' THEN 1 END) as approved FROM approval_requests WHERE workspace_id = $1 AND status IN (\'approved\', \'rejected\')', [workspaceId]),
      this.db.query('SELECT urgency, COUNT(*) as count FROM approval_requests WHERE workspace_id = $1 GROUP BY urgency', [workspaceId]),
      this.db.query('SELECT status, COUNT(*) as count FROM approval_requests WHERE workspace_id = $1 GROUP BY status', [workspaceId]),
      this.db.query('SELECT ra.reviewer_id, COUNT(*) as count FROM reviewer_assignments ra JOIN approval_requests ar ON ra.approval_request_id = ar.id WHERE ar.workspace_id = $1 GROUP BY ra.reviewer_id ORDER BY count DESC LIMIT 10', [workspaceId])
    ]);

    return {
      total_requests: parseInt(totalResult.rows[0].count),
      pending_requests: parseInt(pendingResult.rows[0].count),
      overdue_requests: parseInt(overdueResult.rows[0].count),
      avg_approval_time_hours: parseFloat(avgTimeResult.rows[0].avg_hours) || 0,
      approval_rate: approvalRateResult.rows[0].total > 0 
        ? (parseInt(approvalRateResult.rows[0].approved) / parseInt(approvalRateResult.rows[0].total)) * 100 
        : 0,
      by_urgency: urgencyResult.rows.reduce((acc, row) => {
        acc[row.urgency] = parseInt(row.count);
        return acc;
      }, {}),
      by_status: statusResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      top_reviewers: reviewersResult.rows.map(row => ({
        reviewer_id: row.reviewer_id,
        count: parseInt(row.count)
      }))
    };
  }
}