// Epic 16.2.2 Enhanced Version Management Service
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { diff } from 'deep-diff';
import {
  EnhancedTemplateVersion,
  VersionComparison,
  VersionDifference,
  CompatibilityImpact,
  VersionDeployment,
  VersionAnalytics,
  VersionRollback,
  VersionStatus,
  VersionVisibility,
  CompatibilityLevel,
  ChangeType,
  CreateVersionSchema,
  UpdateVersionSchema,
  VersionDeploymentSchema,
  VersionRollbackSchema,
  VersionComparisonSchema
} from './version.types';
import { MarketplaceDAO } from './dao';

@Injectable()
export class VersionService {
  private dao: MarketplaceDAO;

  constructor(private pool: Pool) {
    this.dao = new MarketplaceDAO(pool);
  }

  // Create new version with enhanced metadata
  async createVersion(templateId: string, userId: string, versionData: any): Promise<EnhancedTemplateVersion> {

    const validated = CreateVersionSchema.parse(versionData);
    
    // Check if user has permission to create versions
    const template = await this.dao.getTemplate(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    
    if (template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to create versions for this template');
    }

    // Parse semantic version
    const versionParts = validated.version_number.split('.');
    const majorVersion = parseInt(versionParts[0]);
    const minorVersion = parseInt(versionParts[1]);
    const patchVersion = parseInt(versionParts[2].split('-')[0]);

    // Check for duplicate version numbers
    const existingVersion = await this.getVersionByNumber(templateId, validated.version_number);
    if (existingVersion) {
      throw new BadRequestException(`Version ${validated.version_number} already exists`);
    }

    // Generate hash for content integrity
    const hashContent = JSON.stringify(validated.graph_json) + (validated.prompt_yaml || '') + validated.release_notes;
    const hash = crypto.createHash('sha256').update(hashContent).digest('hex');

    const versionId = uuidv4();
    
    const version = await this.pool.query(`
      INSERT INTO enhanced_template_versions (
        id, template_id, version_number, major_version, minor_version, patch_version,
        status, visibility, claude_model, graph_json, prompt_yaml, hash,
        release_notes, compatibility_level, migration_guide, deprecated_features,
        new_features, breaking_changes, bug_fixes, known_issues,
        min_claude_version, max_claude_version, required_features, optional_features,
        token_per_run_estimate, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, NOW(), NOW()
      ) RETURNING *
    `, [
      versionId, templateId, validated.version_number, majorVersion, minorVersion, patchVersion,
      validated.status, validated.visibility, validated.claude_model, 
      JSON.stringify(validated.graph_json), validated.prompt_yaml, hash,
      validated.release_notes, validated.compatibility_level, validated.migration_guide,
      JSON.stringify(validated.deprecated_features), JSON.stringify(validated.new_features),
      JSON.stringify(validated.breaking_changes), JSON.stringify(validated.bug_fixes),
      JSON.stringify(validated.known_issues), validated.min_claude_version,
      validated.max_claude_version, JSON.stringify(validated.required_features),
      JSON.stringify(validated.optional_features), validated.token_per_run_estimate, userId
    ]);

    // If this is a published version, update template's current version
    if (validated.status === VersionStatus.PUBLISHED) {
      await this.dao.updateTemplate(templateId, {
        current_version_id: versionId
      });
    }

    return this.mapVersionResult(version.rows[0]);
  }

  // Get version by ID
  async getVersion(id: string, userId?: string): Promise<EnhancedTemplateVersion | null> {

    const result = await this.pool.query(`
      SELECT v.*, t.owner_id, u.name as creator_name
      FROM enhanced_template_versions v
      JOIN marketplace_templates t ON v.template_id = t.id
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const version = result.rows[0];
    
    // Check visibility permissions
    if (version.visibility === VersionVisibility.PRIVATE && 
        userId && version.owner_id !== userId && 
        !(await this.isUserAdmin(userId))) {
      throw new ForbiddenException('Version not accessible');
    }

    return this.mapVersionResult(version);
  }

  // Get version by semantic version number
  async getVersionByNumber(templateId: string, versionNumber: string): Promise<EnhancedTemplateVersion | null> {

    const result = await this.pool.query(`
      SELECT v.*, t.owner_id, u.name as creator_name
      FROM enhanced_template_versions v
      JOIN marketplace_templates t ON v.template_id = t.id
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.template_id = $1 AND v.version_number = $2
    `, [templateId, versionNumber]);

    return result.rows.length > 0 ? this.mapVersionResult(result.rows[0]) : null;
  }

  // Get all versions for a template
  async getTemplateVersions(templateId: string, userId?: string, includePrivate: boolean = false): Promise<EnhancedTemplateVersion[]> {

    const template = await this.dao.getTemplate(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const conditions = ['v.template_id = $1'];
    const params = [templateId];
    let paramIndex = 2;

    // Filter by visibility unless user is owner or admin
    if (!includePrivate || (userId && template.owner_id !== userId && !(await this.isUserAdmin(userId)))) {
      conditions.push(`v.visibility != $${paramIndex++}`);
      params.push(VersionVisibility.PRIVATE);
    }

    const result = await this.pool.query(`
      SELECT v.*, t.owner_id, u.name as creator_name
      FROM enhanced_template_versions v
      JOIN marketplace_templates t ON v.template_id = t.id
      LEFT JOIN users u ON v.created_by = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY v.major_version DESC, v.minor_version DESC, v.patch_version DESC
    `, params);

    return result.rows.map(this.mapVersionResult);
  }

  // Update version
  async updateVersion(id: string, userId: string, updates: any): Promise<EnhancedTemplateVersion> {

    const validated = UpdateVersionSchema.parse(updates);
    
    const version = await this.getVersion(id, userId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const template = await this.dao.getTemplate(version.template_id);
    if (!template || template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to update this version');
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          updateFields.push(`${key} = $${paramIndex++}`);
          updateValues.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramIndex++}`);
          updateValues.push(value);
        }
      }
    });

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const result = await this.pool.query(`
      UPDATE enhanced_template_versions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, updateValues);

    return this.mapVersionResult(result.rows[0]);
  }

  // Compare versions
  async compareVersions(fromVersionId: string, toVersionId: string, options: any = {}): Promise<VersionComparison> {

    const validated = VersionComparisonSchema.parse({ 
      from_version_id: fromVersionId, 
      to_version_id: toVersionId,
      ...options 
    });

    const fromVersion = await this.getVersion(validated.from_version_id);
    const toVersion = await this.getVersion(validated.to_version_id);

    if (!fromVersion || !toVersion) {
      throw new NotFoundException('One or both versions not found');
    }

    if (fromVersion.template_id !== toVersion.template_id) {
      throw new BadRequestException('Versions must belong to the same template');
    }

    // Generate differences
    const differences = this.generateVersionDifferences(fromVersion, toVersion, validated);
    
    // Assess compatibility impact
    const compatibilityImpact = this.assessCompatibilityImpact(differences, fromVersion, toVersion);
    
    // Estimate migration complexity
    const migrationComplexity = this.estimateMigrationComplexity(differences);
    const estimatedMigrationTime = this.estimateMigrationTime(differences);

    return {
      from_version: fromVersion,
      to_version: toVersion,
      differences,
      compatibility_impact: compatibilityImpact,
      migration_complexity,
      estimated_migration_time: estimatedMigrationTime
    };
  }

  // Deploy version
  async deployVersion(versionId: string, userId: string, deploymentData: any): Promise<VersionDeployment> {

    const validated = VersionDeploymentSchema.parse(deploymentData);
    
    const version = await this.getVersion(versionId, userId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const template = await this.dao.getTemplate(version.template_id);
    if (!template || template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to deploy this version');
    }

    if (version.status !== VersionStatus.PUBLISHED) {
      throw new BadRequestException('Only published versions can be deployed');
    }

    const deploymentId = uuidv4();
    
    const deployment = await this.pool.query(`
      INSERT INTO version_deployments (
        id, version_id, template_id, deployment_type, rollout_percentage,
        target_audience, deployment_status, deployment_config,
        deployed_by, deployed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, NOW())
      RETURNING *
    `, [
      deploymentId, versionId, version.template_id, validated.deployment_type,
      validated.rollout_percentage, JSON.stringify(validated.target_audience),
      JSON.stringify(validated.deployment_config), userId
    ]);

    // Start deployment process (async)
    this.processDeployment(deploymentId);

    return this.mapDeploymentResult(deployment.rows[0]);
  }

  // Rollback version
  async rollbackVersion(templateId: string, userId: string, rollbackData: any): Promise<VersionRollback> {

    const validated = VersionRollbackSchema.parse(rollbackData);
    
    const template = await this.dao.getTemplate(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.owner_id !== userId && !(await this.isUserAdmin(userId))) {
      throw new ForbiddenException('Not authorized to rollback this template');
    }

    const currentVersion = await this.getVersion(template.current_version_id || '');
    const targetVersion = await this.getVersion(validated.to_version_id);
    
    if (!currentVersion || !targetVersion) {
      throw new NotFoundException('Current or target version not found');
    }

    if (targetVersion.status !== VersionStatus.PUBLISHED) {
      throw new BadRequestException('Can only rollback to published versions');
    }

    const rollbackId = uuidv4();
    
    // Count affected users (approximate)
    const affectedUsersResult = await this.pool.query(`
      SELECT COUNT(DISTINCT buyer_id) as count
      FROM marketplace_purchases
      WHERE template_id = $1 AND status = 'succeeded'
    `, [templateId]);
    
    const affectedUsers = affectedUsersResult.rows[0]?.count || 0;

    const rollback = await this.pool.query(`
      INSERT INTO version_rollbacks (
        id, template_id, from_version_id, to_version_id, rollback_reason,
        rollback_type, affected_users, impact_assessment, rollback_plan,
        verification_steps, rollback_by, rollback_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [
      rollbackId, templateId, currentVersion.id, validated.to_version_id,
      validated.rollback_reason, validated.rollback_type, affectedUsers,
      validated.impact_assessment, validated.rollback_plan,
      JSON.stringify(validated.verification_steps), userId
    ]);

    // Execute rollback
    await this.executeRollback(rollbackId);

    return this.mapRollbackResult(rollback.rows[0]);
  }

  // Get version analytics
  async getVersionAnalytics(versionId: string, userId: string, periodDays: number = 30): Promise<VersionAnalytics> {

    const version = await this.getVersion(versionId, userId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const template = await this.dao.getTemplate(version.template_id);
    if (!template || template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to view analytics for this version');
    }

    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const periodEnd = new Date();

    // Get basic metrics
    const metricsResult = await this.pool.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_downloads,
        COUNT(DISTINCT p.buyer_id) as active_users,
        COALESCE(SUM(e.execution_count), 0) as execution_count,
        COALESCE(AVG(e.error_rate), 0) as error_rate,
        COALESCE(AVG(e.avg_execution_time), 0) as average_execution_time,
        COALESCE(AVG(r.stars), 0) as satisfaction_score
      FROM marketplace_purchases p
      LEFT JOIN version_execution_stats e ON p.version_id = e.version_id
      LEFT JOIN template_reviews r ON p.template_id = r.template_id
      WHERE p.version_id = $1 AND p.created_at >= $2 AND p.created_at <= $3
    `, [versionId, periodStart, periodEnd]);

    const metrics = metricsResult.rows[0];

    // Get performance trends
    const trendsResult = await this.pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as downloads,
        COALESCE(SUM(execution_count), 0) as executions,
        COALESCE(SUM(error_count), 0) as errors,
        COALESCE(AVG(avg_execution_time), 0) as avg_time
      FROM marketplace_purchases p
      LEFT JOIN version_execution_stats e ON p.id = e.purchase_id
      WHERE p.version_id = $1 AND p.created_at >= $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [versionId, periodStart]);

    // Get user feedback
    const feedbackResult = await this.pool.query(`
      SELECT r.stars as rating, r.comment, r.buyer_id as user_id, r.created_at
      FROM template_reviews r
      JOIN marketplace_purchases p ON r.template_id = p.template_id AND r.buyer_id = p.buyer_id
      WHERE p.version_id = $1 AND r.created_at >= $2
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [versionId, periodStart]);

    // Calculate adoption rate
    const totalUsersResult = await this.pool.query(`
      SELECT COUNT(DISTINCT buyer_id) as total
      FROM marketplace_purchases 
      WHERE template_id = $1
    `, [version.template_id]);
    
    const adoptionRate = totalUsersResult.rows[0]?.total > 0 
      ? (metrics.active_users / totalUsersResult.rows[0].total) * 100 
      : 0;

    return {
      version_id: versionId,
      period_start: periodStart,
      period_end: periodEnd,
      metrics: {
        total_downloads: parseInt(metrics.total_downloads) || 0,
        active_users: parseInt(metrics.active_users) || 0,
        execution_count: parseInt(metrics.execution_count) || 0,
        error_rate: parseFloat(metrics.error_rate) || 0,
        average_execution_time: parseFloat(metrics.average_execution_time) || 0,
        satisfaction_score: parseFloat(metrics.satisfaction_score) || 0,
        adoption_rate: adoptionRate
  }
      performance_trends: trendsResult.rows.map(row => ({
        date: row.date,
        downloads: parseInt(row.downloads),
        executions: parseInt(row.executions),
        errors: parseInt(row.errors),
        avg_time: parseFloat(row.avg_time)
      })),
      user_feedback: feedbackResult.rows.map(row => ({
        rating: row.rating,
        comment: row.comment,
        user_id: row.user_id,
        created_at: row.created_at
      }))
    };
  }

  // Private helper methods
  private generateVersionDifferences(
    fromVersion: EnhancedTemplateVersion, 
    toVersion: EnhancedTemplateVersion,
    options: any
  ): VersionDifference[] {
    const differences: VersionDifference[] = [];

    // Compare graph JSON
    if (options.include_content_diff) {
      const graphDiffs = diff(fromVersion.graph_json, toVersion.graph_json) || [];
      graphDiffs.forEach((d, index) => {
        differences.push({
          id: uuidv4(),
          path: d.path ? d.path.join('.') : 'root',
          type: d.kind === 'N' ? 'added' : d.kind === 'D' ? 'removed' : 'modified',
          old_value: d.lhs,
          new_value: d.rhs,
          description: this.describeDifference(d),
          impact: this.assessDifferenceImpact(d),
          category: 'structure'
        });
      });
    }

    // Compare metadata
    if (options.include_metadata_diff) {
      const metadataFields = [
        'claude_model', 'token_per_run_estimate', 'required_features', 
        'optional_features', 'min_claude_version', 'max_claude_version'
      ];

      metadataFields.forEach(field => {
        if (fromVersion[field as keyof EnhancedTemplateVersion] !== toVersion[field as keyof EnhancedTemplateVersion]) {
          differences.push({
            id: uuidv4(),
            path: field,
            type: 'modified',
            old_value: fromVersion[field as keyof EnhancedTemplateVersion],
            new_value: toVersion[field as keyof EnhancedTemplateVersion],
            description: `${field} changed`,
            impact: field === 'claude_model' ? 'breaking' : 'non-breaking',
            category: 'metadata'
          });
        }
      });
    }

    return differences;
  }

  private assessCompatibilityImpact(
    differences: VersionDifference[],
    fromVersion: EnhancedTemplateVersion,
    toVersion: EnhancedTemplateVersion
  ): CompatibilityImpact {
    const breakingChanges = differences.filter(d => d.impact === 'breaking');
    const affectedComponents = [...new Set(differences.map(d => d.path.split('.')[0]))];
    
    return {
      is_breaking: breakingChanges.length > 0 || toVersion.breaking_changes.length > 0,
      affected_components: affectedComponents,
      required_updates: toVersion.breaking_changes,
      optional_updates: toVersion.new_features,
      deprecation_warnings: toVersion.deprecated_features,
      risk_level: this.calculateRiskLevel(differences, fromVersion, toVersion)
    };
  }

  private estimateMigrationComplexity(differences: VersionDifference[]): 'simple' | 'moderate' | 'complex' {
    const breakingChanges = differences.filter(d => d.impact === 'breaking').length;
    const totalChanges = differences.length;

    if (breakingChanges === 0 && totalChanges <= 5) return 'simple';
    if (breakingChanges <= 2 && totalChanges <= 15) return 'moderate';
    return 'complex';
  }

  private estimateMigrationTime(differences: VersionDifference[]): number {
    const breakingChanges = differences.filter(d => d.impact === 'breaking').length;
    const nonBreakingChanges = differences.length - breakingChanges;
    
    // Estimate: 30 minutes per breaking change, 5 minutes per non-breaking change
    return breakingChanges * 30 + nonBreakingChanges * 5;
  }

  private describeDifference(diff: any): string {
    switch (diff.kind) {
    case 'N': return `Added ${diff.path?.join('.') || 'property'}`;
    case 'D': return `Removed ${diff.path?.join('.') || 'property'}`;
    case 'E': return `Modified ${diff.path?.join('.') || 'property'}`;
    default: return 'Unknown change';
    }
  }

  private assessDifferenceImpact(diff: any): 'breaking' | 'non-breaking' | 'improvement' {
    // Simple heuristic - in production, this would be more sophisticated
    if (diff.kind === 'D') return 'breaking'; // Removal is typically breaking
    if (diff.kind === 'N') return 'improvement'; // Addition is typically improvement
    return 'non-breaking'; // Modification is typically non-breaking
  }

  private calculateRiskLevel(
    differences: VersionDifference[],
    fromVersion: EnhancedTemplateVersion,
    toVersion: EnhancedTemplateVersion
  ): 'low' | 'medium' | 'high' {
    const breakingChanges = differences.filter(d => d.impact === 'breaking').length;
    const modelChange = fromVersion.claude_model !== toVersion.claude_model;
    
    if (breakingChanges > 5 || modelChange) return 'high';
    if (breakingChanges > 0) return 'medium';
    return 'low';
  }

  private async processDeployment(deploymentId: string): Promise<void> {

    // Simulate deployment process (in production, this would be more complex)
    setTimeout(async () => {
      await this.pool.query(`
        UPDATE version_deployments 
        SET deployment_status = 'in_progress', updated_at = NOW()
        WHERE id = $1
      `, [deploymentId]);

      // Simulate deployment completion
      setTimeout(async () => {
        await this.pool.query(`
          UPDATE version_deployments 
          SET deployment_status = 'completed', completed_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [deploymentId]);
      }, 5000);
    }, 1000);
  }

  private async executeRollback(rollbackId: string): Promise<void> {

    const rollback = await this.pool.query(`
      SELECT * FROM version_rollbacks WHERE id = $1
    `, [rollbackId]);

    if (rollback.rows.length === 0) return;

    const rollbackData = rollback.rows[0];

    try {
      // Update template's current version
      await this.dao.updateTemplate(rollbackData.template_id, {
        current_version_id: rollbackData.to_version_id
      });

      // Mark rollback as successful
      await this.pool.query(`
        UPDATE version_rollbacks 
        SET success = true, completed_at = NOW()
        WHERE id = $1
      `, [rollbackId]);
    } catch (error) {
      // Mark rollback as failed
      await this.pool.query(`
        UPDATE version_rollbacks 
        SET success = false, completed_at = NOW(), issues_encountered = $2
        WHERE id = $1
      `, [rollbackId, JSON.stringify([error instanceof Error ? error.message : 'Unknown error'])]);
    }
  }

  private async isUserAdmin(userId: string): Promise<boolean> {

    const result = await this.pool.query(`
      SELECT role FROM users WHERE id = $1
    `, [userId]);
    
    return result.rows.length > 0 && result.rows[0].role === 'admin';
  }

  private mapVersionResult(row: any): EnhancedTemplateVersion {
    return {
      id: row.id,
      template_id: row.template_id,
      version_number: row.version_number,
      major_version: row.major_version,
      minor_version: row.minor_version,
      patch_version: row.patch_version,
      status: row.status,
      visibility: row.visibility,
      claude_model: row.claude_model,
      graph_json: JSON.parse(row.graph_json),
      prompt_yaml: row.prompt_yaml,
      changelog_md: row.changelog_md,
      hash: row.hash,
      token_per_run_estimate: row.token_per_run_estimate,
      safety_score: parseFloat(row.safety_score) || 0,
      s3_asset_key: row.s3_asset_key,
      release_notes: row.release_notes,
      compatibility_level: row.compatibility_level,
      migration_guide: row.migration_guide,
      deprecated_features: JSON.parse(row.deprecated_features || '[]'),
      new_features: JSON.parse(row.new_features || '[]'),
      breaking_changes: JSON.parse(row.breaking_changes || '[]'),
      bug_fixes: JSON.parse(row.bug_fixes || '[]'),
      known_issues: JSON.parse(row.known_issues || '[]'),
      min_claude_version: row.min_claude_version,
      max_claude_version: row.max_claude_version,
      required_features: JSON.parse(row.required_features || '[]'),
      optional_features: JSON.parse(row.optional_features || '[]'),
      created_by: row.created_by,
      published_at: row.published_at,
      deprecated_at: row.deprecated_at,
      download_count: row.download_count || 0,
      usage_stats: JSON.parse(row.usage_stats || '{}'),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapDeploymentResult(row: any): VersionDeployment {
    return {
      id: row.id,
      version_id: row.version_id,
      template_id: row.template_id,
      deployment_type: row.deployment_type,
      rollout_percentage: row.rollout_percentage,
      target_audience: JSON.parse(row.target_audience || '[]'),
      deployment_status: row.deployment_status,
      rollback_version_id: row.rollback_version_id,
      deployment_config: JSON.parse(row.deployment_config || '{}'),
      success_metrics: JSON.parse(row.success_metrics || '{}'),
      deployed_by: row.deployed_by,
      deployed_at: row.deployed_at,
      completed_at: row.completed_at,
      rollback_at: row.rollback_at
    };
  }

  private mapRollbackResult(row: any): VersionRollback {
    return {
      id: row.id,
      template_id: row.template_id,
      from_version_id: row.from_version_id,
      to_version_id: row.to_version_id,
      rollback_reason: row.rollback_reason,
      rollback_type: row.rollback_type,
      affected_users: row.affected_users,
      impact_assessment: row.impact_assessment,
      rollback_plan: row.rollback_plan,
      verification_steps: JSON.parse(row.verification_steps || '[]'),
      rollback_by: row.rollback_by,
      rollback_at: row.rollback_at,
      completed_at: row.completed_at,
      success: row.success,
      issues_encountered: JSON.parse(row.issues_encountered || '[]')
    };
  }
}