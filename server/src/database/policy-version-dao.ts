/**
 * Policy Version Data Access Object - E17-1753114397372-E7CDD1
 * 
 * Database access layer for policy versioning system.
 * Handles CRUD operations and complex queries for policy versions.
 */

import { Database } from './connection';
import {
  Policy,
  PolicyVersion,
  PolicyVersionChange,
  PolicyApproval,
  PolicyComplianceMapping,
  CreatePolicyRequest,
  CreatePolicyVersionRequest,
  UpdatePolicyVersionRequest,
  PolicyVersionSearchQuery,
  PolicyVersionListResponse,
  PolicyStatus,
  ChangeType
} from '../../packages/core/types/PolicyVersionTypes';

export class PolicyVersionDAO {
  constructor(private db: Database) {}

  // ============================================================================
  // Policy CRUD Operations
  // ============================================================================

  async createPolicy(request: CreatePolicyRequest, createdBy: string): Promise<Policy> {
    const query = `
      INSERT INTO policies (policy_key, name, description, category, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, policy_key, name, description, category, created_by, created_at, updated_at
    `;

    const result = await this.db.query(query, [
      request.policyKey,
      request.name,
      request.description || null,
      request.category,
      createdBy
    ]);

    return this.mapRowToPolicy(result.rows[0]);
  }

  async getPolicyById(policyId: string): Promise<Policy | null> {
    const query = `
      SELECT id, policy_key, name, description, category, created_by, created_at, updated_at
      FROM policies
      WHERE id = $1
    `;

    const result = await this.db.query(query, [policyId]);
    return result.rows[0] ? this.mapRowToPolicy(result.rows[0]) : null;
  }

  async getPolicyByKey(policyKey: string): Promise<Policy | null> {
    const query = `
      SELECT id, policy_key, name, description, category, created_by, created_at, updated_at
      FROM policies
      WHERE policy_key = $1
    `;

    const result = await this.db.query(query, [policyKey]);
    return result.rows[0] ? this.mapRowToPolicy(result.rows[0]) : null;
  }

  async listPolicies(
    offset: number = 0,
    limit: number = 50,
    category?: string
  ): Promise<{ policies: Policy[]; total: number }> {
    let query = `
      SELECT id, policy_key, name, description, category, created_by, created_at, updated_at
      FROM policies
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` WHERE category = $${paramIndex++}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC OFFSET $${paramIndex++} LIMIT $${paramIndex++}`;
    params.push(offset, limit);

    const [result, countResult] = await Promise.all([
      this.db.query(query, params),
      this.db.query(
        `SELECT COUNT(*) as total FROM policies${category ? ' WHERE category = $1' : ''}`,
        category ? [category] : []
      )
    ]);

    return {
      policies: result.rows.map(row => this.mapRowToPolicy(row)),
      total: parseInt(countResult.rows[0].total)
    };
  }

  // ============================================================================
  // Policy Version CRUD Operations
  // ============================================================================

  async createPolicyVersion(
    policyId: string,
    request: CreatePolicyVersionRequest,
    createdBy: string
  ): Promise<PolicyVersion> {
    // Generate next version number
    const version = await this.generateNextVersion(policyId, request.changeType || 'update');
    const [major, minor, patch] = version.split('.').map(Number);

    const query = `
      INSERT INTO policy_versions (
        policy_id, version, major_version, minor_version, patch_version,
        title, content, content_type, change_type, change_summary,
        compliance_frameworks, tags, severity_level, effective_date, expiration_date,
        metadata, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      policyId,
      version,
      major,
      minor,
      patch,
      request.title,
      JSON.stringify(request.content),
      request.contentType || 'markdown',
      request.changeType || 'update',
      request.changeSummary || null,
      request.complianceFrameworks || [],
      request.tags || [],
      request.severityLevel || 'medium',
      request.effectiveDate || null,
      request.expirationDate || null,
      JSON.stringify(request.metadata || {}),
      createdBy
    ]);

    return this.mapRowToPolicyVersion(result.rows[0]);
  }

  async getPolicyVersionById(versionId: string): Promise<PolicyVersion | null> {
    const query = `
      SELECT *
      FROM policy_versions
      WHERE id = $1
    `;

    const result = await this.db.query(query, [versionId]);
    return result.rows[0] ? this.mapRowToPolicyVersion(result.rows[0]) : null;
  }

  async getPolicyVersionByNumber(policyId: string, version: string): Promise<PolicyVersion | null> {
    const query = `
      SELECT *
      FROM policy_versions
      WHERE policy_id = $1 AND version = $2
    `;

    const result = await this.db.query(query, [policyId, version]);
    return result.rows[0] ? this.mapRowToPolicyVersion(result.rows[0]) : null;
  }

  async updatePolicyVersion(
    versionId: string,
    request: UpdatePolicyVersionRequest,
    updatedBy: string
  ): Promise<PolicyVersion> {
    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (request.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      params.push(request.title);
    }

    if (request.content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      params.push(JSON.stringify(request.content));
    }

    if (request.contentType !== undefined) {
      updateFields.push(`content_type = $${paramIndex++}`);
      params.push(request.contentType);
    }

    if (request.changeSummary !== undefined) {
      updateFields.push(`change_summary = $${paramIndex++}`);
      params.push(request.changeSummary);
    }

    if (request.complianceFrameworks !== undefined) {
      updateFields.push(`compliance_frameworks = $${paramIndex++}`);
      params.push(request.complianceFrameworks);
    }

    if (request.tags !== undefined) {
      updateFields.push(`tags = $${paramIndex++}`);
      params.push(request.tags);
    }

    if (request.severityLevel !== undefined) {
      updateFields.push(`severity_level = $${paramIndex++}`);
      params.push(request.severityLevel);
    }

    if (request.effectiveDate !== undefined) {
      updateFields.push(`effective_date = $${paramIndex++}`);
      params.push(request.effectiveDate);
    }

    if (request.expirationDate !== undefined) {
      updateFields.push(`expiration_date = $${paramIndex++}`);
      params.push(request.expirationDate);
    }

    if (request.metadata !== undefined) {
      updateFields.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(request.metadata));
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) { // Only timestamp update
      throw new Error('No fields to update');
    }

    params.push(versionId);
    const query = `
      UPDATE policy_versions
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    if (result.rows.length === 0) {
      throw new Error(`Policy version with ID ${versionId} not found`);
    }

    return this.mapRowToPolicyVersion(result.rows[0]);
  }

  async deletePolicyVersion(versionId: string): Promise<boolean> {
    const query = `
      DELETE FROM policy_versions
      WHERE id = $1 AND status = 'draft'
    `;

    const result = await this.db.query(query, [versionId]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // Policy Version Listing and Search
  // ============================================================================

  async listPolicyVersions(
    policyId: string,
    searchQuery: Partial<PolicyVersionSearchQuery> = {}
  ): Promise<PolicyVersionListResponse> {
    const {
      status,
      complianceFrameworks,
      tags,
      createdBy,
      createdAfter,
      createdBefore,
      effectiveAfter,
      effectiveBefore,
      textSearch,
      page = 1,
      pageSize = 20,
      sortBy = 'version',
      sortOrder = 'desc'
    } = searchQuery;

    // Build WHERE clause
    const conditions: string[] = ['policy_id = $1'];
    const params: any[] = [policyId];
    let paramIndex = 2;

    if (status && status.length > 0) {
      conditions.push(`status = ANY($${paramIndex++})`);
      params.push(status);
    }

    if (complianceFrameworks && complianceFrameworks.length > 0) {
      conditions.push(`compliance_frameworks && $${paramIndex++}`);
      params.push(complianceFrameworks);
    }

    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramIndex++}`);
      params.push(tags);
    }

    if (createdBy) {
      conditions.push(`created_by = $${paramIndex++}`);
      params.push(createdBy);
    }

    if (createdAfter) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(createdAfter);
    }

    if (createdBefore) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(createdBefore);
    }

    if (effectiveAfter) {
      conditions.push(`effective_date >= $${paramIndex++}`);
      params.push(effectiveAfter);
    }

    if (effectiveBefore) {
      conditions.push(`effective_date <= $${paramIndex++}`);
      params.push(effectiveBefore);
    }

    if (textSearch) {
      conditions.push(`(title ILIKE $${paramIndex++} OR content::text ILIKE $${paramIndex-1})`);
      params.push(`%${textSearch}%`);
    }

    // Build ORDER BY clause
    const sortColumn = this.getSortColumn(sortBy);
    const orderDirection = sortOrder.toUpperCase();

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Main query
    const query = `
      SELECT *
      FROM policy_versions
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${sortColumn} ${orderDirection}
      OFFSET $${paramIndex++} LIMIT $${paramIndex++}
    `;
    params.push(offset, pageSize);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM policy_versions
      WHERE ${conditions.join(' AND ')}
    `;

    const [result, countResult, policy] = await Promise.all([
      this.db.query(query, params),
      this.db.query(countQuery, params.slice(0, -2)), // Remove offset and limit for count
      this.getPolicyById(policyId)
    ]);

    if (!policy) {
      throw new Error(`Policy with ID ${policyId} not found`);
    }

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return {
      versions: result.rows.map(row => this.mapRowToPolicyVersion(row)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      },
      policy
    };
  }

  // ============================================================================
  // Status Management
  // ============================================================================

  async updatePolicyVersionStatus(
    versionId: string,
    status: PolicyStatus,
    updatedBy: string,
    notes?: string
  ): Promise<PolicyVersion> {
    const updates = ['status = $2', 'updated_at = NOW()'];
    const params: any[] = [versionId, status];
    let paramIndex = 3;

    // Set specific timestamps based on status
    if (status === 'published') {
      updates.push(`published_at = NOW()`, `published_by = $${paramIndex++}`);
      params.push(updatedBy);
    }

    const query = `
      UPDATE policy_versions
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    if (result.rows.length === 0) {
      throw new Error(`Policy version with ID ${versionId} not found`);
    }

    return this.mapRowToPolicyVersion(result.rows[0]);
  }

  async getCurrentPolicyVersion(policyId: string): Promise<PolicyVersion | null> {
    const query = `
      SELECT get_current_policy_version($1) as current_version_id
    `;

    const result = await this.db.query(query, [policyId]);
    const currentVersionId = result.rows[0]?.current_version_id;

    if (!currentVersionId) {
      return null;
    }

    return this.getPolicyVersionById(currentVersionId);
  }

  // ============================================================================
  // Version Management
  // ============================================================================

  async generateNextVersion(policyId: string, changeType: ChangeType = 'update'): Promise<string> {
    const query = `SELECT generate_next_version($1, $2) as next_version`;
    const result = await this.db.query(query, [policyId, changeType]);
    return result.rows[0].next_version;
  }

  async getVersionHistory(policyId: string): Promise<PolicyVersion[]> {
    const query = `
      SELECT *
      FROM policy_versions
      WHERE policy_id = $1
      ORDER BY major_version DESC, minor_version DESC, patch_version DESC
    `;

    const result = await this.db.query(query, [policyId]);
    return result.rows.map(row => this.mapRowToPolicyVersion(row));
  }

  // ============================================================================
  // Change Tracking
  // ============================================================================

  async recordVersionChange(
    versionId: string,
    changeType: string,
    fieldPath: string,
    oldValue: any,
    newValue: any,
    changeReason: string,
    createdBy: string
  ): Promise<PolicyVersionChange> {
    const query = `
      INSERT INTO policy_version_changes (
        version_id, change_type, field_path, old_value, new_value, change_reason, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      versionId,
      changeType,
      fieldPath,
      JSON.stringify(oldValue),
      JSON.stringify(newValue),
      changeReason,
      createdBy
    ]);

    return this.mapRowToPolicyVersionChange(result.rows[0]);
  }

  async getVersionChanges(versionId: string): Promise<PolicyVersionChange[]> {
    const query = `
      SELECT *
      FROM policy_version_changes
      WHERE version_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [versionId]);
    return result.rows.map(row => this.mapRowToPolicyVersionChange(row));
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getSortColumn(sortBy: string): string {
    const columnMap: Record<string, string> = {
      version: 'major_version DESC, minor_version DESC, patch_version',
      title: 'title',
      status: 'status',
      createdAt: 'created_at',
      publishedAt: 'published_at',
      effectiveDate: 'effective_date',
      majorVersion: 'major_version',
      minorVersion: 'minor_version',
      patchVersion: 'patch_version'
    };

    return columnMap[sortBy] || 'created_at';
  }

  private mapRowToPolicy(row: any): Policy {
    return {
      id: row.id,
      policyKey: row.policy_key,
      name: row.name,
      description: row.description,
      category: row.category,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapRowToPolicyVersion(row: any): PolicyVersion {
    return {
      id: row.id,
      policyId: row.policy_id,
      version: row.version,
      majorVersion: row.major_version,
      minorVersion: row.minor_version,
      patchVersion: row.patch_version,
      title: row.title,
      content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
      contentType: row.content_type,
      status: row.status,
      publishedAt: row.published_at ? new Date(row.published_at) : undefined,
      effectiveDate: row.effective_date ? new Date(row.effective_date) : undefined,
      expirationDate: row.expiration_date ? new Date(row.expiration_date) : undefined,
      changeSummary: row.change_summary,
      changeType: row.change_type,
      parentVersionId: row.parent_version_id,
      createdBy: row.created_by,
      reviewedBy: row.reviewed_by,
      publishedBy: row.published_by,
      complianceFrameworks: row.compliance_frameworks || [],
      tags: row.tags || [],
      severityLevel: row.severity_level,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapRowToPolicyVersionChange(row: any): PolicyVersionChange {
    return {
      id: row.id,
      versionId: row.version_id,
      changeType: row.change_type,
      fieldPath: row.field_path,
      oldValue: row.old_value ? JSON.parse(row.old_value) : undefined,
      newValue: row.new_value ? JSON.parse(row.new_value) : undefined,
      changeReason: row.change_reason,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at)
    };
  }
}