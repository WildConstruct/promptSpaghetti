import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './connection';
import {
  CorrectionRule,
  CorrectionRuleHistory,
  CorrectionStatistics,
  CorrectionSet,
  CorrectionSetRule,
  CreateCorrectionRuleInput,
  UpdateCorrectionRuleInput,
  CreateCorrectionSetInput,
  RuleUsageStats,
  PerformanceMetrics,
} from './models';

/**
 * Data Access Object for Correction Rules
 */
export class CorrectionsDAO {
  private db: Database;

  constructor() {
    this.db = getDatabase();
  }

  // ========== CORRECTION RULES ==========

  /**
   * Create a new correction rule
   */
  createRule(input: CreateCorrectionRuleInput): CorrectionRule {
    const uuid = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO correction_rules (
        uuid, name, description, find_pattern, replace_with, is_regex, is_active, priority,
        user_id, project_id, scope, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      uuid,
      input.name,
      input.description || null,
      input.find_pattern,
      input.replace_with,
      input.is_regex ? 1 : 0,
      input.is_active ? 1 : 0,
      input.priority,
      input.user_id,
      input.project_id || null,
      input.scope,
      input.user_id,
      input.user_id
    );
    
    const rule = this.getRuleById(result.lastInsertRowid as number);
    if (!rule) {
      throw new Error('Failed to create correction rule');
    }
    
    // Create history entry
    this.createHistoryEntry(rule, 'created', 'Rule created', input.user_id);
    
    return rule;
  }

  /**
   * Get all correction rules for a user
   */
  getRulesByUser(userId: number, includeInactive: boolean = false): CorrectionRule[] {
    const whereClause = includeInactive 
      ? 'WHERE user_id = ?'
      : 'WHERE user_id = ? AND is_active = 1';
    
    const stmt = this.db.prepare(`
      SELECT * FROM correction_rules 
      ${whereClause}
      ORDER BY priority ASC, created_at ASC
    `);
    
    return stmt.all(userId) as CorrectionRule[];
  }

  /**
   * Get a correction rule by ID
   */
  getRuleById(id: number): CorrectionRule | null {
    const stmt = this.db.prepare('SELECT * FROM correction_rules WHERE id = ?');
    const result = stmt.get(id) as CorrectionRule | undefined;
    return result || null;
  }

  /**
   * Get a correction rule by UUID
   */
  getRuleByUuid(uuid: string): CorrectionRule | null {
    const stmt = this.db.prepare('SELECT * FROM correction_rules WHERE uuid = ?');
    const result = stmt.get(uuid) as CorrectionRule | undefined;
    return result || null;
  }

  /**
   * Update a correction rule
   */
  updateRule(id: number, input: UpdateCorrectionRuleInput, updatedBy: number): CorrectionRule | null {
    const currentRule = this.getRuleById(id);
    if (!currentRule) {
      return null;
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    // Build dynamic update query
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'is_regex' || key === 'is_active') {
          updates.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (updates.length === 0) {
      return currentRule;
    }
    
    // Add metadata updates
    updates.push('updated_by = ?', 'updated_at = CURRENT_TIMESTAMP');
    values.push(updatedBy);
    values.push(id); // For WHERE clause
    
    const stmt = this.db.prepare(`
      UPDATE correction_rules 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    const updatedRule = this.getRuleById(id);
    if (updatedRule) {
      // Create history entry
      this.createHistoryEntry(updatedRule, 'updated', 'Rule updated', updatedBy);
    }
    
    return updatedRule;
  }

  /**
   * Delete a correction rule
   */
  deleteRule(id: number, deletedBy: number): boolean {
    const rule = this.getRuleById(id);
    if (!rule) {
      return false;
    }
    
    // Create history entry before deletion
    this.createHistoryEntry(rule, 'deleted', 'Rule deleted', deletedBy);
    
    const stmt = this.db.prepare('DELETE FROM correction_rules WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  /**
   * Toggle rule active state
   */
  toggleRuleActive(id: number, updatedBy: number): CorrectionRule | null {
    const rule = this.getRuleById(id);
    if (!rule) {
      return null;
    }
    
    const newActiveState = !rule.is_active;
    const stmt = this.db.prepare(`
      UPDATE correction_rules 
      SET is_active = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(newActiveState ? 1 : 0, updatedBy, id);
    
    const updatedRule = this.getRuleById(id);
    if (updatedRule) {
      const changeType = newActiveState ? 'activated' : 'deactivated';
      this.createHistoryEntry(updatedRule, changeType, `Rule ${changeType}`, updatedBy);
    }
    
    return updatedRule;
  }

  /**
   * Reorder rules
   */
  reorderRules(ruleIds: number[], userId: number): boolean {
    const transaction = this.db.transaction((ids: number[]) => {
      ids.forEach((id, index) => {
        const stmt = this.db.prepare(`
          UPDATE correction_rules 
          SET priority = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND user_id = ?
        `);
        stmt.run(index, userId, id, userId);
      });
    });
    
    try {
      transaction(ruleIds);
      return true;
    } catch (error) {
      console.error('Failed to reorder rules:', error);
      return false;
    }
  }

  /**
   * Search rules by pattern or name
   */
  searchRules(query: string, userId: number): CorrectionRule[] {
    const stmt = this.db.prepare(`
      SELECT * FROM correction_rules 
      WHERE user_id = ? AND (
        name LIKE ? OR 
        description LIKE ? OR 
        find_pattern LIKE ?
      )
      ORDER BY priority ASC
    `);
    
    const searchTerm = `%${query}%`;
    return stmt.all(userId, searchTerm, searchTerm, searchTerm) as CorrectionRule[];
  }

  // ========== HISTORY TRACKING ==========

  /**
   * Create a history entry for a rule change
   */
  private createHistoryEntry(
    rule: CorrectionRule, 
    changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated',
    summary: string,
    changedBy: number
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO correction_rule_history (
        rule_id, rule_uuid, name, description, find_pattern, replace_with,
        is_regex, is_active, priority, change_type, change_summary, changed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      rule.id,
      rule.uuid,
      rule.name,
      rule.description || null,
      rule.find_pattern,
      rule.replace_with,
      rule.is_regex ? 1 : 0,
      rule.is_active ? 1 : 0,
      rule.priority,
      changeType,
      summary,
      changedBy
    );
  }

  /**
   * Get history for a rule
   */
  getRuleHistory(ruleId: number): CorrectionRuleHistory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM correction_rule_history 
      WHERE rule_id = ? 
      ORDER BY changed_at DESC
    `);
    
    return stmt.all(ruleId) as CorrectionRuleHistory[];
  }

  // ========== STATISTICS ==========

  /**
   * Record rule usage statistics with enhanced effectiveness metrics
   */
  recordRuleUsage(
    ruleId: number,
    executionTimeMs: number,
    charactersProcessed: number,
    success: boolean,
    options: {
      charactersAfter?: number;
      qualityScore?: number;
      impactRating?: number;
      isFalsePositive?: boolean;
      userFeedback?: number;
    } = {}
  ): void {
    const rule = this.getRuleById(ruleId);
    if (!rule) return;
    
    const now = new Date();
    const dateBucket = now.toISOString().split('T')[0];
    const hourBucket = now.getHours();
    
    // Calculate enhanced metrics
    const charactersAfter = options.charactersAfter || charactersProcessed;
    const charactersSaved = charactersProcessed - charactersAfter;
    const qualityScore = options.qualityScore || this.calculateQualityScore(rule, charactersSaved, success);
    const impactRating = options.impactRating || this.calculateImpactRating(rule, charactersSaved);
    const complexityScore = this.calculateComplexityScore(rule);
    
    // Update or insert statistics
    const stmt = this.db.prepare(`
      INSERT INTO correction_statistics (
        rule_id, rule_uuid, date_bucket, hour_bucket, application_count,
        character_count_before, character_count_after, execution_time_ms,
        success_rate, error_count, quality_score, impact_rating,
        false_positive_count, user_feedback_score, avg_characters_saved, complexity_score
      ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(rule_id, date_bucket, hour_bucket) DO UPDATE SET
        application_count = application_count + 1,
        character_count_before = character_count_before + excluded.character_count_before,
        character_count_after = character_count_after + excluded.character_count_after,
        execution_time_ms = (execution_time_ms + excluded.execution_time_ms) / 2,
        success_rate = (success_rate * (application_count - 1) + excluded.success_rate) / application_count,
        error_count = error_count + excluded.error_count,
        quality_score = (quality_score * (application_count - 1) + excluded.quality_score) / application_count,
        impact_rating = (impact_rating * (application_count - 1) + excluded.impact_rating) / application_count,
        false_positive_count = false_positive_count + excluded.false_positive_count,
        user_feedback_score = COALESCE(excluded.user_feedback_score, user_feedback_score),
        avg_characters_saved = (avg_characters_saved * (application_count - 1) + excluded.avg_characters_saved) / application_count,
        complexity_score = excluded.complexity_score,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(
      ruleId,
      rule.uuid,
      dateBucket,
      hourBucket,
      charactersProcessed,
      charactersAfter,
      executionTimeMs,
      success ? 100 : 0,
      success ? 0 : 1,
      qualityScore,
      impactRating,
      options.isFalsePositive ? 1 : 0,
      options.userFeedback || null,
      charactersSaved,
      complexityScore
    );
    
    // Update last_used_at
    const updateStmt = this.db.prepare(`
      UPDATE correction_rules 
      SET last_used_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    updateStmt.run(ruleId);
  }

  /**
   * Get usage statistics for a rule
   */
  getRuleStats(ruleId: number, days: number = 30): CorrectionStatistics[] {
    const stmt = this.db.prepare(`
      SELECT * FROM correction_statistics 
      WHERE rule_id = ? AND date_bucket >= date('now', '-${days} days')
      ORDER BY date_bucket DESC, hour_bucket DESC
    `);
    
    return stmt.all(ruleId) as CorrectionStatistics[];
  }

  /**
   * Get enhanced performance metrics for all rules
   */
  getPerformanceMetrics(userId: number, days: number = 30): PerformanceMetrics {
    const totalRulesStmt = this.db.prepare('SELECT COUNT(*) as count FROM correction_rules WHERE user_id = ?');
    const activeRulesStmt = this.db.prepare('SELECT COUNT(*) as count FROM correction_rules WHERE user_id = ? AND is_active = 1');
    
    const totalRules = totalRulesStmt.get(userId) as { count: number };
    const activeRules = activeRulesStmt.get(userId) as { count: number };
    
    // Get aggregated statistics with enhanced metrics
    const statsStmt = this.db.prepare(`
      SELECT 
        SUM(application_count) as total_executions,
        AVG(execution_time_ms) as avg_execution_time,
        AVG(success_rate) as avg_success_rate,
        SUM(error_count) as total_errors,
        AVG(quality_score) as avg_quality_score,
        AVG(impact_rating) as avg_impact_rating,
        SUM(avg_characters_saved * application_count) as total_characters_saved,
        AVG(CASE WHEN false_positive_count > 0 THEN (false_positive_count * 100.0 / application_count) ELSE 0 END) as false_positive_rate,
        AVG(user_feedback_score) as user_satisfaction_score
      FROM correction_statistics cs
      JOIN correction_rules cr ON cs.rule_id = cr.id
      WHERE cr.user_id = ? AND cs.date_bucket >= date('now', '-${days} days')
    `);
    
    const stats = statsStmt.get(userId) as any;
    
    // Get most used rules with enhanced metrics
    const mostUsedStmt = this.db.prepare(`
      SELECT 
        cr.id as rule_id,
        cr.name as rule_name,
        SUM(cs.application_count) as total_applications,
        SUM(cs.character_count_before) as total_characters_processed,
        AVG(cs.execution_time_ms) as average_execution_time,
        AVG(cs.success_rate) as success_rate,
        MAX(cs.date_bucket) as last_used,
        AVG(cs.quality_score) as quality_score,
        AVG(cs.impact_rating) as impact_rating,
        AVG(CASE WHEN cs.false_positive_count > 0 THEN (cs.false_positive_count * 100.0 / cs.application_count) ELSE 0 END) as false_positive_rate,
        AVG(cs.user_feedback_score) as user_feedback_score,
        AVG(cs.avg_characters_saved) as avg_characters_saved,
        AVG(cs.complexity_score) as complexity_score,
        CASE 
          WHEN SUM(cs.application_count) > LAG(SUM(cs.application_count), 7) OVER (ORDER BY cr.id) THEN 'increasing'
          WHEN SUM(cs.application_count) < LAG(SUM(cs.application_count), 7) OVER (ORDER BY cr.id) THEN 'decreasing'
          ELSE 'stable'
        END as usage_trend,
        CASE 
          WHEN AVG(cs.execution_time_ms) < LAG(AVG(cs.execution_time_ms), 7) OVER (ORDER BY cr.id) THEN 'improving'
          WHEN AVG(cs.execution_time_ms) > LAG(AVG(cs.execution_time_ms), 7) OVER (ORDER BY cr.id) THEN 'degrading'
          ELSE 'stable'
        END as performance_trend
      FROM correction_statistics cs
      JOIN correction_rules cr ON cs.rule_id = cr.id
      WHERE cr.user_id = ? AND cs.date_bucket >= date('now', '-${days} days')
      GROUP BY cr.id, cr.name
      ORDER BY total_applications DESC
      LIMIT 10
    `);
    
    const mostUsedRules = mostUsedStmt.all(userId) as RuleUsageStats[];
    
    // Get performance trends with enhanced metrics
    const trendsStmt = this.db.prepare(`
      SELECT 
        cs.date_bucket as date,
        SUM(cs.application_count) as executions,
        AVG(cs.execution_time_ms) as avg_time,
        SUM(cs.error_count) as error_count,
        AVG(cs.quality_score) as quality_score,
        AVG(cs.impact_rating) as impact_rating
      FROM correction_statistics cs
      JOIN correction_rules cr ON cs.rule_id = cr.id
      WHERE cr.user_id = ? AND cs.date_bucket >= date('now', '-${days} days')
      GROUP BY cs.date_bucket
      ORDER BY cs.date_bucket ASC
    `);
    
    const trends = trendsStmt.all(userId) as any[];
    
    // Get rule effectiveness distribution
    const distributionStmt = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN AVG(cs.impact_rating) >= 4 THEN 1 ELSE 0 END) as high_impact,
        SUM(CASE WHEN AVG(cs.impact_rating) >= 2 AND AVG(cs.impact_rating) < 4 THEN 1 ELSE 0 END) as medium_impact,
        SUM(CASE WHEN AVG(cs.impact_rating) < 2 THEN 1 ELSE 0 END) as low_impact,
        SUM(CASE WHEN AVG(cs.execution_time_ms) < 10 THEN 1 ELSE 0 END) as fast_rules,
        SUM(CASE WHEN AVG(cs.execution_time_ms) > 100 THEN 1 ELSE 0 END) as slow_rules,
        SUM(CASE WHEN AVG(cs.quality_score) >= 80 THEN 1 ELSE 0 END) as excellent_rules,
        SUM(CASE WHEN AVG(cs.quality_score) >= 60 AND AVG(cs.quality_score) < 80 THEN 1 ELSE 0 END) as good_rules,
        SUM(CASE WHEN AVG(cs.quality_score) < 60 THEN 1 ELSE 0 END) as poor_rules
      FROM correction_statistics cs
      JOIN correction_rules cr ON cs.rule_id = cr.id
      WHERE cr.user_id = ? AND cs.date_bucket >= date('now', '-${days} days')
      GROUP BY cr.id
    `);
    
    const distribution = distributionStmt.get(userId) as any;
    
    return {
      total_rules: totalRules.count,
      active_rules: activeRules.count,
      total_executions: stats.total_executions || 0,
      average_execution_time: stats.avg_execution_time || 0,
      error_rate: stats.total_errors && stats.total_executions 
        ? (stats.total_errors / stats.total_executions) * 100 
        : 0,
      most_used_rules: mostUsedRules,
      performance_trends: trends,
      overall_quality_score: stats.avg_quality_score || 0,
      average_impact_rating: stats.avg_impact_rating || 0,
      total_characters_saved: stats.total_characters_saved || 0,
      false_positive_rate: stats.false_positive_rate || 0,
      user_satisfaction_score: stats.user_satisfaction_score,
      high_impact_rules: distribution.high_impact || 0,
      medium_impact_rules: distribution.medium_impact || 0,
      low_impact_rules: distribution.low_impact || 0,
      fast_rules: distribution.fast_rules || 0,
      slow_rules: distribution.slow_rules || 0,
      excellent_rules: distribution.excellent_rules || 0,
      good_rules: distribution.good_rules || 0,
      poor_rules: distribution.poor_rules || 0,
    };
  }

  // ========== MIGRATION FROM LOCALSTORAGE ==========

  /**
   * Import rules from localStorage format
   */
  importFromLocalStorage(localStorageRules: any[], userId: number = 1): number {
    let importedCount = 0;
    
    const transaction = this.db.transaction((rules: any[]) => {
      for (const rule of rules) {
        try {
          const input: CreateCorrectionRuleInput = {
            name: rule.name,
            description: rule.description,
            find_pattern: rule.findPattern,
            replace_with: rule.replaceWith,
            is_regex: rule.isRegex,
            is_active: rule.isActive,
            priority: rule.priority,
            user_id: userId,
            scope: 'private',
          };
          
          this.createRule(input);
          importedCount++;
        } catch (error) {
          console.error('Failed to import rule:', rule.name, error);
        }
      }
    });
    
    transaction(localStorageRules);
    return importedCount;
  }

  /**
   * Export rules to localStorage format
   */
  exportToLocalStorage(userId: number): any[] {
    const rules = this.getRulesByUser(userId, true);
    
    return rules.map(rule => ({
      id: rule.uuid, // Use UUID for external ID
      name: rule.name,
      description: rule.description,
      findPattern: rule.find_pattern,
      replaceWith: rule.replace_with,
      isRegex: rule.is_regex,
      isActive: rule.is_active,
      priority: rule.priority,
      createdAt: rule.created_at,
      updatedAt: rule.updated_at,
    }));
  }

  /**
   * Clear all rules for a user
   */
  clearAllRules(userId: number): number {
    const stmt = this.db.prepare('DELETE FROM correction_rules WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes;
  }
}