import { z } from 'zod';
import { DatabaseClient } from '../database/client';
import { 
  ProjectBranch,
  BranchCommit,
  BranchMergeRequest,
  BranchMergeReview,
  BranchPermission,
  BranchConflict,
  BranchSyncOperation,
  CreateBranchRequest,
  UpdateBranchRequest,
  CreateCommitRequest,
  CreateMergeRequestRequest,
  UpdateMergeRequestRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  MergeBranchRequest,
  SyncBranchRequest,
  BranchFilter,
  MergeRequestFilter,
  BranchStatsResponse,
  BranchTimelineResponse,
  BranchComparisonResponse,
  BranchContext,
  MergeContext,
  BranchHierarchy,
  BranchMetrics,
  BranchType,
  BranchStatus,
  MergeRequestStatus,
  ReviewStatus,
  SyncOperationType,
  SyncOperationStatus,
  BRANCHING_DEFAULTS,
  validateCreateBranchRequest,
  validateUpdateBranchRequest,
  validateCreateMergeRequestRequest,
  validateMergeBranchRequest,
  validateBranchFilter,
  validateMergeRequestFilter,
} from '../../packages/core/types/branching';

export class BranchingService {
  private db: DatabaseClient;
  private readonly logger: any;

  constructor(db: DatabaseClient, logger: any) {
    this.db = db;
    this.logger = logger;
  }

  /**
   * Create a new branch
   */
  async createBranch(request: CreateBranchRequest, userId: string): Promise<ProjectBranch> {
    const validatedRequest = validateCreateBranchRequest(request);
    
    this.logger.info('Creating new branch', {
      projectId: request.projectId,
      name: request.name,
      branchType: request.branchType,
      parentBranchId: request.parentBranchId,
      userId,
    });

    // Check if branch name already exists
    const existingBranch = await this.db.query(`
      SELECT id FROM project_branches 
      WHERE project_id = $1 AND name = $2
    `, [request.projectId, request.name]);

    if (existingBranch.rows.length > 0) {
      throw new Error(`Branch with name "${request.name}" already exists`);
    }

    // Get base snapshot (from parent branch or specified)
    let baseSnapshotId = validatedRequest.baseSnapshotId;
    if (!baseSnapshotId && validatedRequest.parentBranchId) {
      const parentBranch = await this.getBranchById(validatedRequest.parentBranchId);
      baseSnapshotId = parentBranch.headSnapshotId;
    }

    if (!baseSnapshotId) {
      // Get the latest snapshot from the project
      const latestSnapshot = await this.db.query(`
        SELECT id FROM version_snapshots 
        WHERE project_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [request.projectId]);

      if (latestSnapshot.rows.length === 0) {
        throw new Error('No snapshots available to create branch from');
      }
      baseSnapshotId = latestSnapshot.rows[0].id;
    }

    // Create the branch
    const result = await this.db.query(`
      INSERT INTO project_branches (
        project_id, name, display_name, description, parent_branch_id,
        base_snapshot_id, head_snapshot_id, branch_type, created_by,
        auto_merge_enabled, requires_review, allow_force_push, delete_on_merge
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      validatedRequest.projectId,
      validatedRequest.name,
      validatedRequest.displayName,
      validatedRequest.description,
      validatedRequest.parentBranchId,
      baseSnapshotId,
      baseSnapshotId, // Initially head is same as base
      validatedRequest.branchType,
      userId,
      validatedRequest.autoMergeEnabled,
      validatedRequest.requiresReview,
      validatedRequest.allowForcePush,
      validatedRequest.deleteOnMerge,
    ]);

    const branch = this.mapDatabaseRowToBranch(result.rows[0]);

    // Create initial commit
    await this.createCommit({
      branchId: branch.id,
      snapshotId: baseSnapshotId,
      commitMessage: `Initial commit for branch ${branch.name}`,
    }, userId);

    return branch;
  }

  /**
   * Update branch settings
   */
  async updateBranch(branchId: string, request: UpdateBranchRequest, userId: string): Promise<ProjectBranch> {
    const validatedRequest = validateUpdateBranchRequest(request);
    
    this.logger.info('Updating branch', {
      branchId,
      updates: validatedRequest,
      userId,
    });

    // Check permissions
    const hasPermission = await this.checkBranchPermission(branchId, userId, 'can_admin');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to update branch');
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (validatedRequest.displayName !== undefined) {
      updateFields.push(`display_name = $${paramIndex}`);
      updateValues.push(validatedRequest.displayName);
      paramIndex++;
    }

    if (validatedRequest.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(validatedRequest.description);
      paramIndex++;
    }

    if (validatedRequest.protectionLevel !== undefined) {
      updateFields.push(`protection_level = $${paramIndex}`);
      updateValues.push(validatedRequest.protectionLevel);
      paramIndex++;
    }

    if (validatedRequest.autoMergeEnabled !== undefined) {
      updateFields.push(`auto_merge_enabled = $${paramIndex}`);
      updateValues.push(validatedRequest.autoMergeEnabled);
      paramIndex++;
    }

    if (validatedRequest.requiresReview !== undefined) {
      updateFields.push(`requires_review = $${paramIndex}`);
      updateValues.push(validatedRequest.requiresReview);
      paramIndex++;
    }

    if (validatedRequest.allowForcePush !== undefined) {
      updateFields.push(`allow_force_push = $${paramIndex}`);
      updateValues.push(validatedRequest.allowForcePush);
      paramIndex++;
    }

    if (validatedRequest.deleteOnMerge !== undefined) {
      updateFields.push(`delete_on_merge = $${paramIndex}`);
      updateValues.push(validatedRequest.deleteOnMerge);
      paramIndex++;
    }

    if (validatedRequest.metadata !== undefined) {
      updateFields.push(`metadata = $${paramIndex}`);
      updateValues.push(JSON.stringify(validatedRequest.metadata));
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(branchId);

    const result = await this.db.query(`
      UPDATE project_branches 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, updateValues);

    if (result.rows.length === 0) {
      throw new Error(`Branch not found: ${branchId}`);
    }

    return this.mapDatabaseRowToBranch(result.rows[0]);
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchId: string, userId: string): Promise<void> {
    this.logger.info('Deleting branch', { branchId, userId });

    // Check permissions
    const hasPermission = await this.checkBranchPermission(branchId, userId, 'can_delete');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to delete branch');
    }

    // Check if branch is main branch
    const branch = await this.getBranchById(branchId);
    if (branch.branchType === 'main') {
      throw new Error('Cannot delete main branch');
    }

    // Check if branch has active merge requests
    const activeMergeRequests = await this.db.query(`
      SELECT COUNT(*) as count FROM branch_merge_requests 
      WHERE (source_branch_id = $1 OR target_branch_id = $1) 
      AND status IN ('open', 'draft')
    `, [branchId]);

    if (parseInt(activeMergeRequests.rows[0].count) > 0) {
      throw new Error('Cannot delete branch with active merge requests');
    }

    // Delete the branch
    await this.db.query(`
      DELETE FROM project_branches WHERE id = $1
    `, [branchId]);
  }

  /**
   * Get branch by ID
   */
  async getBranchById(branchId: string): Promise<ProjectBranch> {
    const result = await this.db.query(`
      SELECT * FROM project_branches WHERE id = $1
    `, [branchId]);

    if (result.rows.length === 0) {
      throw new Error(`Branch not found: ${branchId}`);
    }

    return this.mapDatabaseRowToBranch(result.rows[0]);
  }

  /**
   * List branches with filtering
   */
  async listBranches(filter: BranchFilter): Promise<ProjectBranch[]> {
    const validatedFilter = validateBranchFilter(filter);
    
    let query = `
      SELECT * FROM project_branches
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic query based on filter
    if (validatedFilter.projectId) {
      query += ` AND project_id = $${paramIndex}`;
      params.push(validatedFilter.projectId);
      paramIndex++;
    }

    if (validatedFilter.branchType) {
      query += ` AND branch_type = $${paramIndex}`;
      params.push(validatedFilter.branchType);
      paramIndex++;
    }

    if (validatedFilter.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(validatedFilter.status);
      paramIndex++;
    }

    if (validatedFilter.protectionLevel) {
      query += ` AND protection_level = $${paramIndex}`;
      params.push(validatedFilter.protectionLevel);
      paramIndex++;
    }

    if (validatedFilter.createdBy) {
      query += ` AND created_by = $${paramIndex}`;
      params.push(validatedFilter.createdBy);
      paramIndex++;
    }

    if (validatedFilter.parentBranchId) {
      query += ` AND parent_branch_id = $${paramIndex}`;
      params.push(validatedFilter.parentBranchId);
      paramIndex++;
    }

    if (validatedFilter.namePattern) {
      query += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${validatedFilter.namePattern}%`);
      paramIndex++;
    }

    if (validatedFilter.createdAfter) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(validatedFilter.createdAfter);
      paramIndex++;
    }

    if (validatedFilter.createdBefore) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(validatedFilter.createdBefore);
      paramIndex++;
    }

    query += ` ORDER BY ${validatedFilter.sortBy} ${validatedFilter.sortOrder}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(validatedFilter.limit, validatedFilter.offset);

    const result = await this.db.query(query, params);
    return result.rows.map(row => this.mapDatabaseRowToBranch(row));
  }

  /**
   * Create a commit in a branch
   */
  async createCommit(request: CreateCommitRequest, userId: string): Promise<BranchCommit> {
    this.logger.info('Creating commit', {
      branchId: request.branchId,
      snapshotId: request.snapshotId,
      userId,
    });

    // Check branch write permissions
    const hasPermission = await this.checkBranchPermission(request.branchId, userId, 'can_write');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to create commit');
    }

    // Get next commit order
    const nextOrderResult = await this.db.query(`
      SELECT COALESCE(MAX(commit_order), 0) + 1 as next_order
      FROM branch_commits
      WHERE branch_id = $1
    `, [request.branchId]);

    const nextOrder = nextOrderResult.rows[0].next_order;

    // Create the commit
    const result = await this.db.query(`
      INSERT INTO branch_commits (
        branch_id, snapshot_id, commit_order, commit_message, commit_author,
        parent_commit_ids, commit_metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      request.branchId,
      request.snapshotId,
      nextOrder,
      request.commitMessage,
      userId,
      request.parentCommitIds,
      JSON.stringify(request.commitMetadata),
    ]);

    // Update branch head snapshot
    await this.db.query(`
      UPDATE project_branches 
      SET head_snapshot_id = $1, last_activity_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [request.snapshotId, request.branchId]);

    return this.mapDatabaseRowToCommit(result.rows[0]);
  }

  /**
   * Create a merge request
   */
  async createMergeRequest(request: CreateMergeRequestRequest, userId: string): Promise<BranchMergeRequest> {
    const validatedRequest = validateCreateMergeRequestRequest(request);
    
    this.logger.info('Creating merge request', {
      sourceBranchId: request.sourceBranchId,
      targetBranchId: request.targetBranchId,
      title: request.title,
      userId,
    });

    // Check if source and target branches exist
    const sourceBranch = await this.getBranchById(validatedRequest.sourceBranchId);
    const targetBranch = await this.getBranchById(validatedRequest.targetBranchId);

    if (sourceBranch.projectId !== targetBranch.projectId) {
      throw new Error('Source and target branches must be from the same project');
    }

    // Check for existing open merge request
    const existingMR = await this.db.query(`
      SELECT id FROM branch_merge_requests 
      WHERE source_branch_id = $1 AND target_branch_id = $2 AND status IN ('open', 'draft')
    `, [validatedRequest.sourceBranchId, validatedRequest.targetBranchId]);

    if (existingMR.rows.length > 0) {
      throw new Error('An open merge request already exists for these branches');
    }

    // Create the merge request
    const result = await this.db.query(`
      INSERT INTO branch_merge_requests (
        project_id, source_branch_id, target_branch_id, title, description,
        created_by, assigned_to, reviewers, allow_squash_merge, allow_merge_commit,
        allow_rebase_merge, delete_source_branch
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      sourceBranch.projectId,
      validatedRequest.sourceBranchId,
      validatedRequest.targetBranchId,
      validatedRequest.title,
      validatedRequest.description,
      userId,
      validatedRequest.assignedTo,
      validatedRequest.reviewers,
      validatedRequest.allowSquashMerge,
      validatedRequest.allowMergeCommit,
      validatedRequest.allowRebaseMerge,
      validatedRequest.deleteSourceBranch,
    ]);

    return this.mapDatabaseRowToMergeRequest(result.rows[0]);
  }

  /**
   * Merge a branch
   */
  async mergeBranch(request: MergeBranchRequest, userId: string): Promise<BranchMergeRequest> {
    const validatedRequest = validateMergeBranchRequest(request);
    
    this.logger.info('Merging branch', {
      mergeRequestId: request.mergeRequestId,
      strategy: request.mergeStrategy,
      userId,
    });

    // Get merge request
    const mergeRequest = await this.getMergeRequestById(validatedRequest.mergeRequestId);
    
    if (mergeRequest.status !== 'open') {
      throw new Error('Merge request is not open');
    }

    // Check permissions
    const hasPermission = await this.checkBranchPermission(mergeRequest.targetBranchId, userId, 'can_merge');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to merge');
    }

    // Check if reviews are required and satisfied
    if (await this.branchRequiresReview(mergeRequest.targetBranchId)) {
      const approvedReviews = await this.db.query(`
        SELECT COUNT(*) as count FROM branch_merge_reviews 
        WHERE merge_request_id = $1 AND status = 'approved'
      `, [validatedRequest.mergeRequestId]);

      if (parseInt(approvedReviews.rows[0].count) === 0) {
        throw new Error('Merge request requires at least one approval');
      }
    }

    // Check for conflicts
    const conflicts = await this.detectConflicts(mergeRequest.sourceBranchId, mergeRequest.targetBranchId);
    if (conflicts.length > 0) {
      throw new Error('Merge request has unresolved conflicts');
    }

    // Perform the merge based on strategy
    const mergeCommitId = await this.performMerge(mergeRequest, validatedRequest.mergeStrategy, userId);

    // Update merge request
    const result = await this.db.query(`
      UPDATE branch_merge_requests 
      SET 
        status = 'merged',
        merge_commit_id = $1,
        merged_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [mergeCommitId, validatedRequest.mergeRequestId]);

    // Update source branch status if delete_source_branch is true
    if (validatedRequest.deleteSourceBranch || mergeRequest.deleteSourceBranch) {
      await this.db.query(`
        UPDATE project_branches 
        SET status = 'merged', merged_at = CURRENT_TIMESTAMP, merged_by = $1
        WHERE id = $2
      `, [userId, mergeRequest.sourceBranchId]);
    }

    return this.mapDatabaseRowToMergeRequest(result.rows[0]);
  }

  /**
   * Get branch statistics
   */
  async getBranchStats(projectId: string): Promise<BranchStatsResponse> {
    const stats = await this.db.query(`
      SELECT 
        COUNT(*) as total_branches,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_branches,
        COUNT(CASE WHEN status = 'merged' THEN 1 END) as merged_branches,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_branches
      FROM project_branches
      WHERE project_id = $1
    `, [projectId]);

    const byType = await this.db.query(`
      SELECT branch_type, COUNT(*) as count
      FROM project_branches
      WHERE project_id = $1
      GROUP BY branch_type
    `, [projectId]);

    const byStatus = await this.db.query(`
      SELECT status, COUNT(*) as count
      FROM project_branches
      WHERE project_id = $1
      GROUP BY status
    `, [projectId]);

    const recentActivity = await this.db.query(`
      SELECT 
        b.id as branch_id,
        b.name as branch_name,
        'commit' as activity_type,
        bc.commit_timestamp as activity_date,
        bc.commit_author as user_id,
        u.name as user_name
      FROM project_branches b
      JOIN branch_commits bc ON b.id = bc.branch_id
      JOIN users u ON bc.commit_author = u.id
      WHERE b.project_id = $1
      ORDER BY bc.commit_timestamp DESC
      LIMIT 20
    `, [projectId]);

    return {
      totalBranches: parseInt(stats.rows[0].total_branches),
      activeBranches: parseInt(stats.rows[0].active_branches),
      mergedBranches: parseInt(stats.rows[0].merged_branches),
      abandonedBranches: parseInt(stats.rows[0].abandoned_branches),
      byType: byType.rows.reduce((acc, row) => {
        acc[row.branch_type] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>),
      recentActivity: recentActivity.rows.map(row => ({
        branchId: row.branch_id,
        branchName: row.branch_name,
        activityType: row.activity_type,
        activityDate: row.activity_date,
        userId: row.user_id,
        userName: row.user_name,
      })),
    };
  }

  /**
   * Get branch hierarchy
   */
  async getBranchHierarchy(projectId: string): Promise<BranchHierarchy[]> {
    const branches = await this.listBranches({ projectId, limit: 1000 });
    
    const buildHierarchy = (
      parentId: string | null, 
      depth: number = 0, 
      path: string[] = []
    ): BranchHierarchy[] => {
      return branches
        .filter(branch => branch.parentBranchId === parentId)
        .map(branch => ({
          branch,
          children: buildHierarchy(branch.id, depth + 1, [...path, branch.name]),
          depth,
          path: [...path, branch.name],
        }));
    };

    return buildHierarchy(null);
  }

  /**
   * Compare branches
   */
  async compareBranches(sourceBranchId: string, targetBranchId: string): Promise<BranchComparisonResponse> {
    const sourceBranch = await this.getBranchById(sourceBranchId);
    const targetBranch = await this.getBranchById(targetBranchId);

    // Get commit counts
    const sourceCommits = await this.db.query(`
      SELECT COUNT(*) as count FROM branch_commits WHERE branch_id = $1
    `, [sourceBranchId]);

    const targetCommits = await this.db.query(`
      SELECT COUNT(*) as count FROM branch_commits WHERE branch_id = $1
    `, [targetBranchId]);

    // Find common ancestor (simplified - would need more complex logic)
    const commonAncestor = await this.findCommonAncestor(sourceBranchId, targetBranchId);

    // Calculate ahead/behind
    const ahead = parseInt(sourceCommits.rows[0].count) - (commonAncestor ? 1 : 0);
    const behind = parseInt(targetCommits.rows[0].count) - (commonAncestor ? 1 : 0);

    // Check for conflicts
    const conflicts = await this.detectConflicts(sourceBranchId, targetBranchId);

    return {
      sourceBranch,
      targetBranch,
      commonAncestor,
      ahead,
      behind,
      conflicts,
      canMerge: conflicts.length === 0,
      mergeStrategy: conflicts.length === 0 ? 'merge' : undefined,
      estimatedMergeTime: this.estimateMergeTime(ahead, behind, conflicts.length),
    };
  }

  // Private helper methods

  private async checkBranchPermission(branchId: string, userId: string, permission: string): Promise<boolean> {
    const result = await this.db.query(`
      SELECT ${permission} FROM branch_permissions 
      WHERE branch_id = $1 AND user_id = $2
    `, [branchId, userId]);

    if (result.rows.length > 0) {
      return result.rows[0][permission];
    }

    // Default permissions based on project membership
    // This would integrate with the existing ACL system
    return true; // Simplified for now
  }

  private async branchRequiresReview(branchId: string): Promise<boolean> {
    const result = await this.db.query(`
      SELECT requires_review FROM project_branches WHERE id = $1
    `, [branchId]);

    return result.rows.length > 0 ? result.rows[0].requires_review : false;
  }

  private async detectConflicts(sourceBranchId: string, targetBranchId: string): Promise<BranchConflict[]> {
    // Simplified conflict detection - would need more sophisticated logic
    const result = await this.db.query(`
      SELECT * FROM branch_conflicts 
      WHERE source_branch_id = $1 AND target_branch_id = $2 AND conflict_status = 'unresolved'
    `, [sourceBranchId, targetBranchId]);

    return result.rows.map(row => this.mapDatabaseRowToConflict(row));
  }

  private async performMerge(mergeRequest: BranchMergeRequest, strategy: string, userId: string): Promise<string> {
    // Simplified merge implementation - would need actual merge logic
    const mergeCommitId = await this.createCommit({
      branchId: mergeRequest.targetBranchId,
      snapshotId: mergeRequest.sourceCommitId || mergeRequest.sourceBranchId,
      commitMessage: `Merge ${strategy}: ${mergeRequest.title}`,
      parentCommitIds: [mergeRequest.sourceCommitId || mergeRequest.sourceBranchId],
    }, userId);

    return mergeCommitId.id;
  }

  private async findCommonAncestor(sourceBranchId: string, targetBranchId: string): Promise<BranchCommit | null> {
    // Simplified common ancestor finding - would need graph traversal
    return null;
  }

  private estimateMergeTime(ahead: number, behind: number, conflicts: number): number {
    // Simple estimation based on commits and conflicts
    return (ahead + behind) * 1000 + conflicts * 30000; // milliseconds
  }

  private async getMergeRequestById(mergeRequestId: string): Promise<BranchMergeRequest> {
    const result = await this.db.query(`
      SELECT * FROM branch_merge_requests WHERE id = $1
    `, [mergeRequestId]);

    if (result.rows.length === 0) {
      throw new Error(`Merge request not found: ${mergeRequestId}`);
    }

    return this.mapDatabaseRowToMergeRequest(result.rows[0]);
  }

  // Database row mapping methods
  private mapDatabaseRowToBranch(row: any): ProjectBranch {
    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      parentBranchId: row.parent_branch_id,
      baseSnapshotId: row.base_snapshot_id,
      headSnapshotId: row.head_snapshot_id,
      branchType: row.branch_type,
      status: row.status,
      protectionLevel: row.protection_level,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      mergedAt: row.merged_at,
      mergedBy: row.merged_by,
      mergedIntoBranchId: row.merged_into_branch_id,
      autoMergeEnabled: row.auto_merge_enabled,
      requiresReview: row.requires_review,
      allowForcePush: row.allow_force_push,
      deleteOnMerge: row.delete_on_merge,
      commitCount: row.commit_count,
      contributorCount: row.contributor_count,
      lastActivityAt: row.last_activity_at,
      metadata: row.metadata || {},
    };
  }

  private mapDatabaseRowToCommit(row: any): BranchCommit {
    return {
      id: row.id,
      branchId: row.branch_id,
      snapshotId: row.snapshot_id,
      commitOrder: row.commit_order,
      commitMessage: row.commit_message,
      commitAuthor: row.commit_author,
      commitTimestamp: row.commit_timestamp,
      parentCommitIds: row.parent_commit_ids || [],
      changesCount: row.changes_count,
      additionsCount: row.additions_count,
      deletionsCount: row.deletions_count,
      commitMetadata: row.commit_metadata || {},
    };
  }

  private mapDatabaseRowToMergeRequest(row: any): BranchMergeRequest {
    return {
      id: row.id,
      projectId: row.project_id,
      sourceBranchId: row.source_branch_id,
      targetBranchId: row.target_branch_id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdBy: row.created_by,
      assignedTo: row.assigned_to,
      reviewers: row.reviewers || [],
      sourceCommitId: row.source_commit_id,
      targetCommitId: row.target_commit_id,
      mergeCommitId: row.merge_commit_id,
      allowSquashMerge: row.allow_squash_merge,
      allowMergeCommit: row.allow_merge_commit,
      allowRebaseMerge: row.allow_rebase_merge,
      deleteSourceBranch: row.delete_source_branch,
      commitsCount: row.commits_count,
      filesChanged: row.files_changed,
      additionsCount: row.additions_count,
      deletionsCount: row.deletions_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      mergedAt: row.merged_at,
      closedAt: row.closed_at,
      metadata: row.metadata || {},
    };
  }

  private mapDatabaseRowToConflict(row: any): BranchConflict {
    return {
      id: row.id,
      sourceBranchId: row.source_branch_id,
      targetBranchId: row.target_branch_id,
      conflictType: row.conflict_type,
      conflictStatus: row.conflict_status,
      conflictedResources: row.conflicted_resources || [],
      conflictResolution: row.conflict_resolution,
      detectedAt: row.detected_at,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by,
    };
  }
}