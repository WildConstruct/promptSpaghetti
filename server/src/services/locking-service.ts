// Epic 9.4.3 - Enhanced Locking Service
// Advanced resource locking with authorization and conflict resolution

import { WorkflowDAO } from '../database/workflow-dao';
import { Database } from '../database/connection';
import { WorkflowLock } from '../database/workflow-models';

export interface LockRequest {
  resource_id: string;
  user_id: string;
  lock_type: 'edit' | 'state_change' | 'delete' | 'admin' | 'custom';
  scope: 'resource' | 'project' | 'workspace';
  reason?: string;
  duration_minutes?: number;
  force?: boolean;
  metadata?: Record<string, any>;
}

export interface LockPolicy {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  
  // Lock rules
  max_locks_per_user: number;
  max_locks_per_resource: number;
  default_duration_minutes: number;
  max_duration_minutes: number;
  
  // Auto-lock settings
  auto_lock_on_edit: boolean;
  auto_lock_on_state_change: boolean;
  auto_lock_duration_minutes: number;
  
  // Lock breaking rules
  allow_lock_breaking: boolean;
  lock_breaking_roles: string[];
  require_justification: boolean;
  
  // Conflict resolution
  conflict_resolution_strategy: 'queue' | 'reject' | 'notify' | 'escalate';
  escalation_timeout_minutes: number;
  
  created_at: Date;
  updated_at: Date;
}

export interface LockConflict {
  id: string;
  resource_id: string;
  requesting_user_id: string;
  blocking_lock_id: string;
  conflict_type: 'same_type' | 'incompatible' | 'exclusive';
  resolution_strategy: 'queue' | 'reject' | 'notify' | 'escalate';
  status: 'pending' | 'resolved' | 'rejected';
  created_at: Date;
  resolved_at?: Date;
  resolution_action?: string;
}

export interface LockQueue {
  id: string;
  resource_id: string;
  user_id: string;
  lock_type: string;
  priority: number;
  queued_at: Date;
  estimated_wait_time?: number;
  notification_sent: boolean;
}

export interface LockNotification {
  id: string;
  user_id: string;
  lock_id?: string;
  resource_id: string;
  notification_type: 'acquired' | 'released' | 'broken' | 'conflict' | 'queue_position' | 'expiring';
  title: string;
  message: string;
  action_url?: string;
  sent_at: Date;
  read_at?: Date;
  metadata: Record<string, any>;
}

export interface LockingStatistics {
  total_locks: number;
  active_locks: number;
  expired_locks: number;
  broken_locks: number;
  by_type: Record<string, number>;
  by_user: Record<string, number>;
  avg_lock_duration_minutes: number;
  conflict_rate: number;
  most_contended_resources: Array<{
    resource_id: string;
    conflict_count: number;
    avg_wait_time: number;
  }>;
}

export class LockingService {
  private dao: WorkflowDAO;
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.dao = new WorkflowDAO(db);
  }

  // =============================================================================
  // LOCK POLICY MANAGEMENT
  // =============================================================================

  async createLockPolicy(data: Omit<LockPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<LockPolicy> {
    const result = await this.db.query(`
      INSERT INTO lock_policies (
        workspace_id, name, description, max_locks_per_user, max_locks_per_resource,
        default_duration_minutes, max_duration_minutes, auto_lock_on_edit,
        auto_lock_on_state_change, auto_lock_duration_minutes, allow_lock_breaking,
        lock_breaking_roles, require_justification, conflict_resolution_strategy,
        escalation_timeout_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      data.workspace_id,
      data.name,
      data.description,
      data.max_locks_per_user,
      data.max_locks_per_resource,
      data.default_duration_minutes,
      data.max_duration_minutes,
      data.auto_lock_on_edit,
      data.auto_lock_on_state_change,
      data.auto_lock_duration_minutes,
      data.allow_lock_breaking,
      JSON.stringify(data.lock_breaking_roles),
      data.require_justification,
      data.conflict_resolution_strategy,
      data.escalation_timeout_minutes
    ]);

    return {
      ...result.rows[0],
      lock_breaking_roles: JSON.parse(result.rows[0].lock_breaking_roles || '[]')
    };
  }

  async getLockPolicy(workspaceId: string): Promise<LockPolicy | null> {
    const result = await this.db.query(`
      SELECT * FROM lock_policies 
      WHERE workspace_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [workspaceId]);

    if (result.rows.length === 0) return null;

    return {
      ...result.rows[0],
      lock_breaking_roles: JSON.parse(result.rows[0].lock_breaking_roles || '[]')
    };
  }

  // =============================================================================
  // ENHANCED LOCK ACQUISITION
  // =============================================================================

  async acquireLock(request: LockRequest): Promise<{
    success: boolean;
    lock?: WorkflowLock;
    conflict?: LockConflict;
    queue_position?: number;
    error?: string;
  }> {
    return this.db.transaction(async (client) => {
      // Get lock policy
      const policy = await this.getLockPolicy(request.resource_id);
      
      // Check user's current locks
      const userLocks = await this.getUserLocks(request.user_id);
      if (policy && userLocks.length >= policy.max_locks_per_user) {
        return { success: false, error: 'Maximum locks per user exceeded' };
      }

      // Check resource locks
      const resourceLocks = await this.getResourceLocks(request.resource_id);
      
      // Check for conflicts
      const conflictingLock = this.findConflictingLock(resourceLocks, request);
      
      if (conflictingLock && !request.force) {
        // Handle conflict based on policy
        const conflict = await this.handleLockConflict(conflictingLock, request, policy);
        return { success: false, conflict };
      }

      // Acquire the lock
      const duration = request.duration_minutes || policy?.default_duration_minutes || 60;
      const expiresAt = new Date(Date.now() + duration * 60 * 1000);

      const lockResult = await client.query(`
        INSERT INTO workflow_locks (
          workspace_id, resource_id, locked_by, lock_type, lock_reason,
          expires_at, auto_release, metadata
        ) VALUES (
          (SELECT workspace_id FROM resources WHERE id = $1),
          $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
      `, [
        request.resource_id,
        request.resource_id,
        request.user_id,
        request.lock_type,
        request.reason,
        expiresAt,
        true,
        JSON.stringify(request.metadata || {})
      ]);

      const lock = lockResult.rows[0];

      // Send notification
      await this.sendLockNotification(request.user_id, lock, 'acquired');

      // Log the acquisition
      await this.logLockAction(lock.id, request.user_id, 'acquired', request.reason);

      return { success: true, lock };
    });
  }

  private findConflictingLock(existingLocks: WorkflowLock[], request: LockRequest): WorkflowLock | null {
    // Define lock compatibility matrix
    const incompatibleLocks: Record<string, string[]> = {
      'edit': ['edit', 'delete', 'admin'],
      'state_change': ['state_change', 'delete', 'admin'],
      'delete': ['edit', 'state_change', 'delete', 'admin'],
      'admin': ['edit', 'state_change', 'delete', 'admin'],
      'custom': ['admin']
    };

    const conflictingTypes = incompatibleLocks[request.lock_type] || [];
    
    return existingLocks.find(lock => 
      conflictingTypes.includes(lock.lock_type) && 
      lock.locked_by !== request.user_id
    ) || null;
  }

  private async handleLockConflict(
    conflictingLock: WorkflowLock,
    request: LockRequest,
    policy: LockPolicy | null
  ): Promise<LockConflict> {
    const strategy = policy?.conflict_resolution_strategy || 'reject';
    
    const conflict = await this.createLockConflict(
      request.resource_id,
      request.user_id,
      conflictingLock.id,
      strategy
    );

    switch (strategy) {
      case 'queue':
        await this.addToLockQueue(request);
        break;
      case 'notify':
        await this.notifyLockOwner(conflictingLock, request);
        break;
      case 'escalate':
        await this.escalateLockConflict(conflict, policy);
        break;
      case 'reject':
      default:
        // Already handled by returning conflict
        break;
    }

    return conflict;
  }

  private async createLockConflict(
    resourceId: string,
    requestingUserId: string,
    blockingLockId: string,
    strategy: string
  ): Promise<LockConflict> {
    const result = await this.db.query(`
      INSERT INTO lock_conflicts (
        resource_id, requesting_user_id, blocking_lock_id, 
        conflict_type, resolution_strategy, status
      ) VALUES ($1, $2, $3, 'incompatible', $4, 'pending')
      RETURNING *
    `, [resourceId, requestingUserId, blockingLockId, strategy]);

    return result.rows[0];
  }

  // =============================================================================
  // LOCK BREAKING
  // =============================================================================

  async breakLock(
    lockId: string,
    breakerUserId: string,
    justification?: string,
    force?: boolean
  ): Promise<{
    success: boolean;
    error?: string;
    notification_sent?: boolean;
  }> {
    return this.db.transaction(async (client) => {
      // Get the lock
      const lockResult = await client.query(
        'SELECT * FROM workflow_locks WHERE id = $1',
        [lockId]
      );

      if (lockResult.rows.length === 0) {
        return { success: false, error: 'Lock not found' };
      }

      const lock = lockResult.rows[0];

      // Check if user can break the lock
      if (!force && lock.locked_by === breakerUserId) {
        return { success: false, error: 'Cannot break your own lock' };
      }

      // Get lock policy
      const policy = await this.getLockPolicy(lock.workspace_id);
      
      if (!force && policy && !policy.allow_lock_breaking) {
        return { success: false, error: 'Lock breaking is not allowed' };
      }

      // Check user permissions
      if (!force && policy && !await this.canBreakLock(breakerUserId, lock, policy)) {
        return { success: false, error: 'Insufficient permissions to break lock' };
      }

      // Validate justification if required
      if (policy?.require_justification && !justification) {
        return { success: false, error: 'Justification is required to break lock' };
      }

      // Break the lock
      await client.query('DELETE FROM workflow_locks WHERE id = $1', [lockId]);

      // Log the break
      await this.logLockAction(lockId, breakerUserId, 'broken', justification);

      // Notify original owner
      await this.sendLockNotification(lock.locked_by, lock, 'broken', {
        broken_by: breakerUserId,
        justification
      });

      // Process lock queue if any
      await this.processLockQueue(lock.resource_id);

      return { success: true, notification_sent: true };
    });
  }

  private async canBreakLock(userId: string, lock: WorkflowLock, policy: LockPolicy): Promise<boolean> {
    // Check if user has required role
    const userRoles = await this.getUserRoles(userId, lock.workspace_id);
    const hasRequiredRole = policy.lock_breaking_roles.some(role => userRoles.includes(role));
    
    return hasRequiredRole;
  }

  private async getUserRoles(userId: string, workspaceId: string): Promise<string[]> {
    const result = await this.db.query(`
      SELECT ar.name as role_name
      FROM acl_assignments aa
      JOIN acl_roles ar ON aa.role_id = ar.id
      WHERE aa.user_id = $1 AND ar.workspace_id = $2
    `, [userId, workspaceId]);

    return result.rows.map(row => row.role_name);
  }

  // =============================================================================
  // LOCK QUEUE MANAGEMENT
  // =============================================================================

  private async addToLockQueue(request: LockRequest): Promise<LockQueue> {
    const priority = this.calculateQueuePriority(request);
    
    const result = await this.db.query(`
      INSERT INTO lock_queue (
        resource_id, user_id, lock_type, priority, estimated_wait_time
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      request.resource_id,
      request.user_id,
      request.lock_type,
      priority,
      await this.estimateWaitTime(request.resource_id)
    ]);

    const queueEntry = result.rows[0];

    // Notify user about queue position
    await this.sendQueueNotification(request.user_id, queueEntry);

    return queueEntry;
  }

  private calculateQueuePriority(request: LockRequest): number {
    // Higher priority for certain lock types
    const priorityMap = {
      'admin': 1,
      'delete': 2,
      'state_change': 3,
      'edit': 4,
      'custom': 5
    };

    return priorityMap[request.lock_type] || 5;
  }

  private async estimateWaitTime(resourceId: string): Promise<number> {
    // Get current locks on resource
    const locks = await this.getResourceLocks(resourceId);
    
    if (locks.length === 0) return 0;

    // Calculate average remaining time
    const now = new Date();
    const avgRemainingTime = locks.reduce((sum, lock) => {
      if (lock.expires_at) {
        const remaining = Math.max(0, new Date(lock.expires_at).getTime() - now.getTime());
        return sum + remaining;
      }
      return sum + (60 * 60 * 1000); // Default 1 hour
    }, 0) / locks.length;

    return Math.round(avgRemainingTime / (60 * 1000)); // Convert to minutes
  }

  private async processLockQueue(resourceId: string): Promise<void> {
    // Get next queued request
    const queueResult = await this.db.query(`
      SELECT * FROM lock_queue
      WHERE resource_id = $1
      ORDER BY priority ASC, queued_at ASC
      LIMIT 1
    `, [resourceId]);

    if (queueResult.rows.length === 0) return;

    const queueEntry = queueResult.rows[0];

    // Try to acquire lock for queued user
    const lockRequest: LockRequest = {
      resource_id: resourceId,
      user_id: queueEntry.user_id,
      lock_type: queueEntry.lock_type,
      scope: 'resource',
      reason: 'Processed from queue'
    };

    const result = await this.acquireLock(lockRequest);

    if (result.success) {
      // Remove from queue
      await this.db.query('DELETE FROM lock_queue WHERE id = $1', [queueEntry.id]);
      
      // Notify user
      await this.sendLockNotification(queueEntry.user_id, result.lock!, 'acquired', {
        from_queue: true
      });
    }
  }

  // =============================================================================
  // NOTIFICATION SYSTEM
  // =============================================================================

  private async sendLockNotification(
    userId: string,
    lock: WorkflowLock,
    type: 'acquired' | 'released' | 'broken' | 'expiring',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const titles = {
      acquired: 'Lock Acquired',
      released: 'Lock Released',
      broken: 'Lock Broken',
      expiring: 'Lock Expiring Soon'
    };

    const messages = {
      acquired: `You have acquired a ${lock.lock_type} lock on resource ${lock.resource_id}`,
      released: `Your ${lock.lock_type} lock on resource ${lock.resource_id} has been released`,
      broken: `Your ${lock.lock_type} lock on resource ${lock.resource_id} has been broken`,
      expiring: `Your ${lock.lock_type} lock on resource ${lock.resource_id} will expire soon`
    };

    await this.db.query(`
      INSERT INTO lock_notifications (
        user_id, lock_id, resource_id, notification_type, title, message, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      lock.id,
      lock.resource_id,
      type,
      titles[type],
      messages[type],
      JSON.stringify(metadata)
    ]);
  }

  private async sendQueueNotification(userId: string, queueEntry: LockQueue): Promise<void> {
    const position = await this.getQueuePosition(queueEntry.id);
    
    await this.db.query(`
      INSERT INTO lock_notifications (
        user_id, resource_id, notification_type, title, message, metadata
      ) VALUES ($1, $2, 'queue_position', $3, $4, $5)
    `, [
      userId,
      queueEntry.resource_id,
      'Added to Lock Queue',
      `You are #${position} in the queue for a ${queueEntry.lock_type} lock. Estimated wait time: ${queueEntry.estimated_wait_time || 0} minutes.`,
      JSON.stringify({ queue_position: position, estimated_wait_time: queueEntry.estimated_wait_time })
    ]);
  }

  private async getQueuePosition(queueEntryId: string): Promise<number> {
    const result = await this.db.query(`
      SELECT COUNT(*) + 1 as position
      FROM lock_queue lq1
      JOIN lock_queue lq2 ON lq1.resource_id = lq2.resource_id
      WHERE lq2.id = $1
      AND (lq1.priority < lq2.priority OR (lq1.priority = lq2.priority AND lq1.queued_at < lq2.queued_at))
    `, [queueEntryId]);

    return parseInt(result.rows[0].position);
  }

  // =============================================================================
  // MAINTENANCE AND CLEANUP
  // =============================================================================

  async releaseExpiredLocks(): Promise<number> {
    const result = await this.db.query(`
      DELETE FROM workflow_locks
      WHERE expires_at < NOW() AND auto_release = true
    `);

    // Process queues for released locks
    const expiredLocks = await this.db.query(`
      SELECT DISTINCT resource_id FROM workflow_locks
      WHERE expires_at < NOW()
    `);

    for (const row of expiredLocks.rows) {
      await this.processLockQueue(row.resource_id);
    }

    return result.rowCount;
  }

  async sendExpirationWarnings(): Promise<number> {
    const result = await this.db.query(`
      SELECT * FROM workflow_locks
      WHERE expires_at > NOW() 
      AND expires_at < NOW() + INTERVAL '15 minutes'
      AND NOT EXISTS (
        SELECT 1 FROM lock_notifications 
        WHERE lock_id = workflow_locks.id 
        AND notification_type = 'expiring'
        AND sent_at > NOW() - INTERVAL '1 hour'
      )
    `);

    for (const lock of result.rows) {
      await this.sendLockNotification(lock.locked_by, lock, 'expiring');
    }

    return result.rowCount;
  }

  // =============================================================================
  // STATISTICS AND REPORTING
  // =============================================================================

  async getLockingStatistics(workspaceId: string): Promise<LockingStatistics> {
    const [
      totalResult,
      activeResult,
      expiredResult,
      brokenResult,
      typeResult,
      userResult,
      durationResult,
      conflictResult,
      contentionResult
    ] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM workflow_locks WHERE workspace_id = $1', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM workflow_locks WHERE workspace_id = $1 AND (expires_at IS NULL OR expires_at > NOW())', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM workflow_locks WHERE workspace_id = $1 AND expires_at < NOW()', [workspaceId]),
      this.db.query('SELECT COUNT(*) as count FROM lock_actions WHERE workspace_id = $1 AND action_type = \'broken\'', [workspaceId]),
      this.db.query('SELECT lock_type, COUNT(*) as count FROM workflow_locks WHERE workspace_id = $1 GROUP BY lock_type', [workspaceId]),
      this.db.query('SELECT locked_by, COUNT(*) as count FROM workflow_locks WHERE workspace_id = $1 GROUP BY locked_by ORDER BY count DESC LIMIT 10', [workspaceId]),
      this.db.query('SELECT AVG(EXTRACT(EPOCH FROM (COALESCE(expires_at, NOW()) - locked_at)) / 60) as avg_minutes FROM workflow_locks WHERE workspace_id = $1', [workspaceId]),
      this.db.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'resolved\' THEN 1 END) as resolved FROM lock_conflicts WHERE resource_id IN (SELECT id FROM resources WHERE project_id IN (SELECT id FROM projects WHERE workspace_id = $1))', [workspaceId]),
      this.db.query(`
        SELECT lc.resource_id, COUNT(*) as conflict_count, AVG(lq.estimated_wait_time) as avg_wait_time
        FROM lock_conflicts lc
        LEFT JOIN lock_queue lq ON lc.resource_id = lq.resource_id
        WHERE lc.resource_id IN (SELECT id FROM resources WHERE project_id IN (SELECT id FROM projects WHERE workspace_id = $1))
        GROUP BY lc.resource_id
        ORDER BY conflict_count DESC
        LIMIT 10
      `, [workspaceId])
    ]);

    return {
      total_locks: parseInt(totalResult.rows[0].count),
      active_locks: parseInt(activeResult.rows[0].count),
      expired_locks: parseInt(expiredResult.rows[0].count),
      broken_locks: parseInt(brokenResult.rows[0].count),
      by_type: typeResult.rows.reduce((acc, row) => {
        acc[row.lock_type] = parseInt(row.count);
        return acc;
      }, {}),
      by_user: userResult.rows.reduce((acc, row) => {
        acc[row.locked_by] = parseInt(row.count);
        return acc;
      }, {}),
      avg_lock_duration_minutes: parseFloat(durationResult.rows[0].avg_minutes) || 0,
      conflict_rate: conflictResult.rows[0].total > 0 
        ? (parseInt(conflictResult.rows[0].resolved) / parseInt(conflictResult.rows[0].total)) * 100 
        : 0,
      most_contended_resources: contentionResult.rows.map(row => ({
        resource_id: row.resource_id,
        conflict_count: parseInt(row.conflict_count),
        avg_wait_time: parseFloat(row.avg_wait_time) || 0
      }))
    };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async getUserLocks(userId: string): Promise<WorkflowLock[]> {
    const result = await this.db.query(`
      SELECT * FROM workflow_locks 
      WHERE locked_by = $1 
      AND (expires_at IS NULL OR expires_at > NOW())
    `, [userId]);

    return result.rows;
  }

  private async getResourceLocks(resourceId: string): Promise<WorkflowLock[]> {
    const result = await this.db.query(`
      SELECT * FROM workflow_locks 
      WHERE resource_id = $1 
      AND (expires_at IS NULL OR expires_at > NOW())
    `, [resourceId]);

    return result.rows;
  }

  private async logLockAction(
    lockId: string,
    userId: string,
    actionType: string,
    reason?: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO lock_actions (lock_id, user_id, action_type, reason)
      VALUES ($1, $2, $3, $4)
    `, [lockId, userId, actionType, reason]);
  }

  private async notifyLockOwner(lock: WorkflowLock, request: LockRequest): Promise<void> {
    await this.db.query(`
      INSERT INTO lock_notifications (
        user_id, lock_id, resource_id, notification_type, title, message, metadata
      ) VALUES ($1, $2, $3, 'conflict', $4, $5, $6)
    `, [
      lock.locked_by,
      lock.id,
      lock.resource_id,
      'Lock Conflict',
      `User ${request.user_id} is requesting a ${request.lock_type} lock on resource ${request.resource_id}`,
      JSON.stringify({ requesting_user: request.user_id, requested_type: request.lock_type })
    ]);
  }

  private async escalateLockConflict(conflict: LockConflict, policy: LockPolicy | null): Promise<void> {
    // Implementation would escalate to administrators or managers
    // This is a placeholder for escalation logic
  }

  // =============================================================================
  // ADDITIONAL METHODS FOR API INTEGRATION
  // =============================================================================

  async releaseLock(lockId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.db.transaction(async (client) => {
      // Get the lock
      const lockResult = await client.query(
        'SELECT * FROM workflow_locks WHERE id = $1',
        [lockId]
      );

      if (lockResult.rows.length === 0) {
        return { success: false, error: 'Lock not found' };
      }

      const lock = lockResult.rows[0];

      // Check if user owns the lock
      if (lock.locked_by !== userId) {
        return { success: false, error: 'You can only release your own locks' };
      }

      // Release the lock
      await client.query('DELETE FROM workflow_locks WHERE id = $1', [lockId]);

      // Log the release
      await this.logLockAction(lockId, userId, 'released');

      // Send notification
      await this.sendLockNotification(userId, lock, 'released');

      // Process lock queue
      await this.processLockQueue(lock.resource_id);

      return { success: true };
    });
  }

  async updateLockPolicy(workspaceId: string, data: Omit<LockPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<LockPolicy> {
    const result = await this.db.query(`
      UPDATE lock_policies SET
        name = $2,
        description = $3,
        max_locks_per_user = $4,
        max_locks_per_resource = $5,
        default_duration_minutes = $6,
        max_duration_minutes = $7,
        auto_lock_on_edit = $8,
        auto_lock_on_state_change = $9,
        auto_lock_duration_minutes = $10,
        allow_lock_breaking = $11,
        lock_breaking_roles = $12,
        require_justification = $13,
        conflict_resolution_strategy = $14,
        escalation_timeout_minutes = $15,
        updated_at = NOW()
      WHERE workspace_id = $1
      RETURNING *
    `, [
      workspaceId,
      data.name,
      data.description,
      data.max_locks_per_user,
      data.max_locks_per_resource,
      data.default_duration_minutes,
      data.max_duration_minutes,
      data.auto_lock_on_edit,
      data.auto_lock_on_state_change,
      data.auto_lock_duration_minutes,
      data.allow_lock_breaking,
      JSON.stringify(data.lock_breaking_roles),
      data.require_justification,
      data.conflict_resolution_strategy,
      data.escalation_timeout_minutes
    ]);

    return {
      ...result.rows[0],
      lock_breaking_roles: JSON.parse(result.rows[0].lock_breaking_roles || '[]')
    };
  }

  async getLockQueue(resourceId: string): Promise<LockQueue[]> {
    const result = await this.db.query(`
      SELECT * FROM lock_queue
      WHERE resource_id = $1
      ORDER BY priority ASC, queued_at ASC
    `, [resourceId]);

    return result.rows;
  }

  async removeFromQueue(queueId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const result = await this.db.query(`
      DELETE FROM lock_queue
      WHERE id = $1 AND user_id = $2
    `, [queueId, userId]);

    if (result.rowCount === 0) {
      return { success: false, error: 'Queue entry not found or access denied' };
    }

    return { success: true };
  }

  async getLockConflicts(workspaceId: string, status?: string): Promise<LockConflict[]> {
    let query = `
      SELECT lc.*, r.name as resource_name, u.name as requesting_user_name
      FROM lock_conflicts lc
      JOIN resources r ON lc.resource_id = r.id
      JOIN users u ON lc.requesting_user_id = u.id
      WHERE r.project_id IN (SELECT id FROM projects WHERE workspace_id = $1)
    `;
    
    const params = [workspaceId];

    if (status) {
      query += ' AND lc.status = $2';
      params.push(status);
    }

    query += ' ORDER BY lc.created_at DESC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async resolveLockConflict(conflictId: string, resolution: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.db.transaction(async (client) => {
      // Get the conflict
      const conflictResult = await client.query(
        'SELECT * FROM lock_conflicts WHERE id = $1',
        [conflictId]
      );

      if (conflictResult.rows.length === 0) {
        return { success: false, error: 'Conflict not found' };
      }

      const conflict = conflictResult.rows[0];

      // Update conflict status
      await client.query(`
        UPDATE lock_conflicts 
        SET status = $2, resolved_at = NOW(), resolution_action = $3
        WHERE id = $1
      `, [conflictId, resolution === 'approve' ? 'resolved' : 'rejected', resolution]);

      // If approved, try to acquire lock for requesting user
      if (resolution === 'approve') {
        const lockRequest: LockRequest = {
          resource_id: conflict.resource_id,
          user_id: conflict.requesting_user_id,
          lock_type: 'edit', // Default type
          scope: 'resource',
          reason: 'Conflict resolution approved',
          force: true
        };

        await this.acquireLock(lockRequest);
      }

      // Log the resolution
      await this.logLockAction(conflict.blocking_lock_id, userId, 'conflict_resolved', `Resolution: ${resolution}`);

      return { success: true };
    });
  }

  async getLockNotifications(userId: string, unreadOnly: boolean = false): Promise<LockNotification[]> {
    let query = `
      SELECT * FROM lock_notifications
      WHERE user_id = $1
    `;

    if (unreadOnly) {
      query += ' AND read_at IS NULL';
    }

    query += ' ORDER BY sent_at DESC';

    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  async markNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const result = await this.db.query(`
      UPDATE lock_notifications 
      SET read_at = NOW()
      WHERE id = $1
    `, [notificationId]);

    if (result.rowCount === 0) {
      return { success: false, error: 'Notification not found' };
    }

    return { success: true };
  }
}