// Epic 9.4 - Workflow Orchestration Data Access Object
// Database operations for workflow state management

import { Database } from './connection';
import {
  WorkflowState,
  WorkflowTransition,
  WorkflowApproval,
  WorkflowApprovalReviewer,
  WorkflowLock,
  WorkflowHistoryEntry,
  WorkflowSchedule,
  WorkflowExecutionLog,
  WorkflowStateFilter,
  WorkflowApprovalFilter,
  WorkflowHistoryFilter,
  WorkflowLockFilter,
  WorkflowScheduleFilter,
  WorkflowStatistics,
  StateTransitionRequest,
  StateTransitionResult,
  CreateWorkflowStateSchema,
  CreateWorkflowTransitionSchema,
  CreateWorkflowApprovalSchema,
  CreateWorkflowLockSchema,
  CreateWorkflowScheduleSchema,
  ApproveWorkflowSchema,
  RejectWorkflowSchema
} from './workflow-models';

export class WorkflowDAO {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // =============================================================================
  // WORKFLOW STATE OPERATIONS
  // =============================================================================

  async createWorkflowState(data: Zod.infer<typeof CreateWorkflowStateSchema>): Promise<WorkflowState> {
    const validated = CreateWorkflowStateSchema.parse(data);
    
    const result = await this.db.query(`
      INSERT INTO workflow_states (
        workspace_id, name, description, color, icon, 
        is_initial, is_final, is_locked, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      validated.workspace_id,
      validated.name,
      validated.description,
      validated.color,
      validated.icon,
      validated.is_initial,
      validated.is_final,
      validated.is_locked,
      validated.sort_order
    ]);

    return result.rows[0];
  }

  async getWorkflowStates(filter: WorkflowStateFilter = {}): Promise<WorkflowState[]> {
    let query = `
      SELECT * FROM workflow_states
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filter.workspace_id) {
      query += ` AND workspace_id = $${paramIndex++}`;
      params.push(filter.workspace_id);
    }

    if (filter.is_initial !== undefined) {
      query += ` AND is_initial = $${paramIndex++}`;
      params.push(filter.is_initial);
    }

    if (filter.is_final !== undefined) {
      query += ` AND is_final = $${paramIndex++}`;
      params.push(filter.is_final);
    }

    if (filter.is_locked !== undefined) {
      query += ` AND is_locked = $${paramIndex++}`;
      params.push(filter.is_locked);
    }

    if (filter.name_contains) {
      query += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${filter.name_contains}%`);
    }

    query += ' ORDER BY sort_order, name';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async getWorkflowStateById(id: string): Promise<WorkflowState | null> {
    const result = await this.db.query(
      'SELECT * FROM workflow_states WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async updateWorkflowState(id: string, updates: Partial<WorkflowState>): Promise<WorkflowState | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const query = `
      UPDATE workflow_states 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [id, ...Object.values(updates)]);
    return result.rows[0] || null;
  }

  async deleteWorkflowState(id: string): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM workflow_states WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  // =============================================================================
  // WORKFLOW TRANSITION OPERATIONS
  // =============================================================================

  async createWorkflowTransition(data: Zod.infer<typeof CreateWorkflowTransitionSchema>): Promise<WorkflowTransition> {
    const validated = CreateWorkflowTransitionSchema.parse(data);
    
    const result = await this.db.query(`
      INSERT INTO workflow_transitions (
        workspace_id, from_state_id, to_state_id, name, description,
        requires_approval, required_permissions, conditions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      validated.workspace_id,
      validated.from_state_id,
      validated.to_state_id,
      validated.name,
      validated.description,
      validated.requires_approval,
      validated.required_permissions,
      JSON.stringify(validated.conditions)
    ]);

    return result.rows[0];
  }

  async getWorkflowTransitions(workspaceId: string, fromStateId?: string): Promise<WorkflowTransition[]> {
    let query = `
      SELECT * FROM workflow_transitions
      WHERE workspace_id = $1
    `;
    const params = [workspaceId];

    if (fromStateId) {
      query += ' AND from_state_id = $2';
      params.push(fromStateId);
    }

    query += ' ORDER BY name';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async getWorkflowTransitionById(id: string): Promise<WorkflowTransition | null> {
    const result = await this.db.query(
      'SELECT * FROM workflow_transitions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async deleteWorkflowTransition(id: string): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM workflow_transitions WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  // =============================================================================
  // STATE TRANSITION OPERATIONS
  // =============================================================================

  async transitionResourceState(request: StateTransitionRequest, actorId: string): Promise<StateTransitionResult> {
    return this.db.transaction(async (client) => {
      // Get current state
      const currentStateResult = await client.query(
        'SELECT workflow_state_id FROM resources WHERE id = $1',
        [request.resource_id]
      );

      if (currentStateResult.rows.length === 0) {
        return { success: false, error: 'Resource not found' };
      }

      const currentStateId = currentStateResult.rows[0].workflow_state_id;

      // Get transition
      const transitionResult = await client.query(
        'SELECT * FROM workflow_transitions WHERE from_state_id = $1 AND to_state_id = $2',
        [currentStateId, request.to_state_id]
      );

      if (transitionResult.rows.length === 0) {
        return { success: false, error: 'Invalid state transition' };
      }

      const transition = transitionResult.rows[0];

      // Check if approval is required
      if (transition.requires_approval && !request.force) {
        // Create approval request
        const approvalResult = await client.query(`
          INSERT INTO workflow_approvals (
            workspace_id, resource_id, transition_id, requester_id, status
          ) VALUES (
            (SELECT workspace_id FROM resources JOIN projects ON resources.project_id = projects.id WHERE resources.id = $1),
            $2, $3, $4, 'pending'
          ) RETURNING id
        `, [request.resource_id, request.resource_id, transition.id, actorId]);

        // Log the approval request
        await this.logWorkflowHistory(client, {
          workspace_id: transition.workspace_id,
          resource_id: request.resource_id,
          action_type: 'approval_requested',
          new_state_id: request.to_state_id,
          actor_id: actorId,
          approval_id: approvalResult.rows[0].id,
          transition_id: transition.id,
          comment: request.comment,
          metadata: request.metadata || {}
        });

        return {
          success: true,
          approval_required: true,
          approval_id: approvalResult.rows[0].id
        };
      }

      // Perform direct state transition
      await client.query(
        'UPDATE resources SET workflow_state_id = $1 WHERE id = $2',
        [request.to_state_id, request.resource_id]
      );

      // Log the state change
      const historyResult = await this.logWorkflowHistory(client, {
        workspace_id: transition.workspace_id,
        resource_id: request.resource_id,
        action_type: 'state_changed',
        previous_state_id: currentStateId,
        new_state_id: request.to_state_id,
        actor_id: actorId,
        transition_id: transition.id,
        comment: request.comment,
        metadata: request.metadata || {}
      });

      return {
        success: true,
        new_state_id: request.to_state_id,
        workflow_history_id: historyResult.rows[0].id
      };
    });
  }

  // =============================================================================
  // WORKFLOW APPROVAL OPERATIONS
  // =============================================================================

  async createWorkflowApproval(data: Zod.infer<typeof CreateWorkflowApprovalSchema>): Promise<WorkflowApproval> {
    const validated = CreateWorkflowApprovalSchema.parse(data);
    
    const result = await this.db.query(`
      INSERT INTO workflow_approvals (
        workspace_id, resource_id, transition_id, requester_id,
        due_date, priority, auto_approve_after, auto_approve_conditions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      validated.workspace_id,
      validated.resource_id,
      validated.transition_id,
      validated.requester_id,
      validated.due_date,
      validated.priority,
      validated.auto_approve_after,
      JSON.stringify(validated.auto_approve_conditions)
    ]);

    return result.rows[0];
  }

  async getWorkflowApprovals(filter: WorkflowApprovalFilter = {}): Promise<WorkflowApproval[]> {
    let query = `
      SELECT wa.*, wt.name as transition_name, r.name as resource_name
      FROM workflow_approvals wa
      JOIN workflow_transitions wt ON wa.transition_id = wt.id
      JOIN resources r ON wa.resource_id = r.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filter.workspace_id) {
      query += ` AND wa.workspace_id = $${paramIndex++}`;
      params.push(filter.workspace_id);
    }

    if (filter.resource_id) {
      query += ` AND wa.resource_id = $${paramIndex++}`;
      params.push(filter.resource_id);
    }

    if (filter.requester_id) {
      query += ` AND wa.requester_id = $${paramIndex++}`;
      params.push(filter.requester_id);
    }

    if (filter.status) {
      query += ` AND wa.status = $${paramIndex++}`;
      params.push(filter.status);
    }

    if (filter.priority) {
      query += ` AND wa.priority = $${paramIndex++}`;
      params.push(filter.priority);
    }

    if (filter.overdue) {
      query += ' AND wa.due_date < CURRENT_TIMESTAMP AND wa.status = \'pending\'';
    }

    query += ' ORDER BY wa.requested_at DESC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async approveWorkflow(approvalId: string, data: Zod.infer<typeof ApproveWorkflowSchema>): Promise<StateTransitionResult> {
    const validated = ApproveWorkflowSchema.parse(data);

    return this.db.transaction(async (client) => {
      // Update approval status
      const approvalResult = await client.query(`
        UPDATE workflow_approvals 
        SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, approval_comment = $2
        WHERE id = $3 AND status = 'pending'
        RETURNING *
      `, [validated.approved_by, validated.approval_comment, approvalId]);

      if (approvalResult.rows.length === 0) {
        return { success: false, error: 'Approval not found or already processed' };
      }

      const approval = approvalResult.rows[0];

      // Get transition details
      const transitionResult = await client.query(
        'SELECT * FROM workflow_transitions WHERE id = $1',
        [approval.transition_id]
      );

      const transition = transitionResult.rows[0];

      // Update resource state
      await client.query(
        'UPDATE resources SET workflow_state_id = $1 WHERE id = $2',
        [transition.to_state_id, approval.resource_id]
      );

      // Log the approval
      await this.logWorkflowHistory(client, {
        workspace_id: approval.workspace_id,
        resource_id: approval.resource_id,
        action_type: 'approved',
        new_state_id: transition.to_state_id,
        actor_id: validated.approved_by,
        approval_id: approvalId,
        transition_id: approval.transition_id,
        comment: validated.approval_comment,
        metadata: {}
      });

      return {
        success: true,
        new_state_id: transition.to_state_id
      };
    });
  }

  async rejectWorkflow(approvalId: string, data: Zod.infer<typeof RejectWorkflowSchema>): Promise<boolean> {
    const validated = RejectWorkflowSchema.parse(data);

    return this.db.transaction(async (client) => {
      // Update approval status
      const approvalResult = await client.query(`
        UPDATE workflow_approvals 
        SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP, rejection_reason = $2
        WHERE id = $3 AND status = 'pending'
        RETURNING *
      `, [validated.approved_by, validated.rejection_reason, approvalId]);

      if (approvalResult.rows.length === 0) {
        return false;
      }

      const approval = approvalResult.rows[0];

      // Log the rejection
      await this.logWorkflowHistory(client, {
        workspace_id: approval.workspace_id,
        resource_id: approval.resource_id,
        action_type: 'rejected',
        actor_id: validated.approved_by,
        approval_id: approvalId,
        transition_id: approval.transition_id,
        comment: validated.rejection_reason,
        metadata: {}
      });

      return true;
    });
  }

  // =============================================================================
  // WORKFLOW LOCK OPERATIONS
  // =============================================================================

  async createWorkflowLock(data: Zod.infer<typeof CreateWorkflowLockSchema>): Promise<WorkflowLock> {
    const validated = CreateWorkflowLockSchema.parse(data);
    
    const result = await this.db.query(`
      INSERT INTO workflow_locks (
        workspace_id, resource_id, locked_by, lock_type, lock_reason,
        expires_at, auto_release, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      validated.workspace_id,
      validated.resource_id,
      validated.locked_by,
      validated.lock_type,
      validated.lock_reason,
      validated.expires_at,
      validated.auto_release,
      JSON.stringify(validated.metadata)
    ]);

    return result.rows[0];
  }

  async getWorkflowLocks(filter: WorkflowLockFilter = {}): Promise<WorkflowLock[]> {
    let query = `
      SELECT wl.*, r.name as resource_name
      FROM workflow_locks wl
      JOIN resources r ON wl.resource_id = r.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filter.workspace_id) {
      query += ` AND wl.workspace_id = $${paramIndex++}`;
      params.push(filter.workspace_id);
    }

    if (filter.resource_id) {
      query += ` AND wl.resource_id = $${paramIndex++}`;
      params.push(filter.resource_id);
    }

    if (filter.locked_by) {
      query += ` AND wl.locked_by = $${paramIndex++}`;
      params.push(filter.locked_by);
    }

    if (filter.lock_type) {
      query += ` AND wl.lock_type = $${paramIndex++}`;
      params.push(filter.lock_type);
    }

    if (filter.expired) {
      query += ' AND wl.expires_at < CURRENT_TIMESTAMP';
    }

    query += ' ORDER BY wl.locked_at DESC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async releaseWorkflowLock(lockId: string, actorId: string): Promise<boolean> {
    return this.db.transaction(async (client) => {
      const result = await client.query(
        'DELETE FROM workflow_locks WHERE id = $1 RETURNING *',
        [lockId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const lock = result.rows[0];

      // Log the lock release
      await this.logWorkflowHistory(client, {
        workspace_id: lock.workspace_id,
        resource_id: lock.resource_id,
        action_type: 'lock_released',
        actor_id: actorId,
        comment: `Released ${lock.lock_type} lock`,
        metadata: { lock_id: lockId, lock_type: lock.lock_type }
      });

      return true;
    });
  }

  async releaseExpiredLocks(): Promise<number> {
    const result = await this.db.query(`
      DELETE FROM workflow_locks 
      WHERE expires_at < CURRENT_TIMESTAMP AND auto_release = true
    `);
    return result.rowCount;
  }

  // =============================================================================
  // WORKFLOW HISTORY OPERATIONS
  // =============================================================================

  private async logWorkflowHistory(client: unknown, data: Partial<WorkflowHistoryEntry>): Promise<unknown> {
    return client.query(`
      INSERT INTO workflow_history (
        workspace_id, resource_id, action_type, previous_state_id, new_state_id,
        actor_id, approval_id, transition_id, comment, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.workspace_id,
      data.resource_id,
      data.action_type,
      data.previous_state_id,
      data.new_state_id,
      data.actor_id,
      data.approval_id,
      data.transition_id,
      data.comment,
      JSON.stringify(data.metadata || {})
    ]);
  }

  async getWorkflowHistory(filter: WorkflowHistoryFilter = {}): Promise<WorkflowHistoryEntry[]> {
    let query = `
      SELECT wh.*, r.name as resource_name,
             ps.name as previous_state_name, ns.name as new_state_name
      FROM workflow_history wh
      JOIN resources r ON wh.resource_id = r.id
      LEFT JOIN workflow_states ps ON wh.previous_state_id = ps.id
      LEFT JOIN workflow_states ns ON wh.new_state_id = ns.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filter.workspace_id) {
      query += ` AND wh.workspace_id = $${paramIndex++}`;
      params.push(filter.workspace_id);
    }

    if (filter.resource_id) {
      query += ` AND wh.resource_id = $${paramIndex++}`;
      params.push(filter.resource_id);
    }

    if (filter.actor_id) {
      query += ` AND wh.actor_id = $${paramIndex++}`;
      params.push(filter.actor_id);
    }

    if (filter.action_type) {
      query += ` AND wh.action_type = $${paramIndex++}`;
      params.push(filter.action_type);
    }

    if (filter.date_from) {
      query += ` AND wh.action_timestamp >= $${paramIndex++}`;
      params.push(filter.date_from);
    }

    if (filter.date_to) {
      query += ` AND wh.action_timestamp <= $${paramIndex++}`;
      params.push(filter.date_to);
    }

    query += ' ORDER BY wh.action_timestamp DESC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  // =============================================================================
  // WORKFLOW STATISTICS
  // =============================================================================

  async getWorkflowStatistics(workspaceId: string): Promise<WorkflowStatistics> {
    const [
      statesResult,
      transitionsResult,
      approvalsResult,
      locksResult,
      schedulesResult,
      resourcesResult,
      approvalStatsResult,
      lockStatsResult,
      scheduleStatsResult
    ] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM workflow_states WHERE workspace_id = $1', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM workflow_transitions WHERE workspace_id = $1', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM workflow_approvals WHERE workspace_id = $1 AND status = \'pending\'', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM workflow_locks WHERE workspace_id = $1', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM workflow_schedules WHERE workspace_id = $1 AND enabled = true', [workspaceId]),
      this.db.query(`
        SELECT ws.name as state_name, COUNT(r.id) as count
        FROM workflow_states ws
        LEFT JOIN resources r ON ws.id = r.workflow_state_id
        WHERE ws.workspace_id = $1
        GROUP BY ws.id, ws.name
      `, [workspaceId]),
      this.db.query(`
        SELECT status, COUNT(*) as count,
               AVG(EXTRACT(EPOCH FROM (COALESCE(approved_at, CURRENT_TIMESTAMP) - requested_at)) / 3600) as avg_hours
        FROM workflow_approvals 
        WHERE workspace_id = $1 
        GROUP BY status
      `, [workspaceId]),
      this.db.query(`
        SELECT lock_type, COUNT(*) as count,
               AVG(EXTRACT(EPOCH FROM (COALESCE(expires_at, CURRENT_TIMESTAMP) - locked_at)) / 3600) as avg_hours
        FROM workflow_locks 
        WHERE workspace_id = $1 
        GROUP BY lock_type
      `, [workspaceId]),
      this.db.query(`
        SELECT ws.schedule_type, COUNT(*) as count,
               SUM(CASE WHEN wel.status = 'completed' THEN 1 ELSE 0 END) as successful,
               SUM(CASE WHEN wel.status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM workflow_schedules ws
        LEFT JOIN workflow_execution_logs wel ON ws.id = wel.schedule_id
        WHERE ws.workspace_id = $1
        GROUP BY ws.schedule_type
      `, [workspaceId])
    ]);

    return {
      total_states: parseInt(statesResult.rows[0].count),
      total_transitions: parseInt(transitionsResult.rows[0].count),
      pending_approvals: parseInt(approvalsResult.rows[0].count),
      active_locks: parseInt(locksResult.rows[0].count),
      scheduled_executions: parseInt(schedulesResult.rows[0].count),
      
      resources_by_state: resourcesResult.rows.reduce((acc, row) => {
        acc[row.state_name] = parseInt(row.count);
        return acc;
      }, {}),
      
      approval_stats: approvalStatsResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        if (row.status === 'approved') {
          acc.avg_approval_time_hours = parseFloat(row.avg_hours) || 0;
        }
        return acc;
      }, { pending: 0, approved: 0, rejected: 0, cancelled: 0, avg_approval_time_hours: 0 }),
      
      lock_stats: {
        total_active: parseInt(locksResult.rows[0].count),
        by_type: lockStatsResult.rows.reduce((acc, row) => {
          acc[row.lock_type] = parseInt(row.count);
          return acc;
        }, {}),
        avg_lock_duration_hours: lockStatsResult.rows.reduce((sum, row) => sum + (parseFloat(row.avg_hours) || 0), 0) / lockStatsResult.rows.length || 0
      },
      
      schedule_stats: {
        total_active: parseInt(schedulesResult.rows[0].count),
        by_type: scheduleStatsResult.rows.reduce((acc, row) => {
          acc[row.schedule_type] = parseInt(row.count);
          return acc;
        }, {}),
        successful_executions: scheduleStatsResult.rows.reduce((sum, row) => sum + parseInt(row.successful), 0),
        failed_executions: scheduleStatsResult.rows.reduce((sum, row) => sum + parseInt(row.failed), 0)
      }
    };
  }
}