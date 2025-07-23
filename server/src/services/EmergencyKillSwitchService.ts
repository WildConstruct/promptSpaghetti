/**
 * Emergency Kill Switch Service - Epic 17
 * Task: E17-1753114396769-A130B3 - Implement emergency kill switch
 * 
 * Provides emergency controls to rapidly disable feature toggles in crisis situations.
 * Critical safety mechanism to prevent system-wide issues from feature rollouts.
 */

import { Database } from '../database/connection';
import { // RetryUtils // Unused import, retryableDatabase } from '../utils/RetryUtils';

export interface EmergencyKillSwitchConfig {
  id: string;
  name: string;
  description: string;
  scope: 'ALL' | 'CLAUDE_IMPACT' | 'CRITICAL_FEATURES' | 'CUSTOM';
  targetToggles?: string[];
  claudeImpactLevels?: string[];
  enabled: boolean;
  createdAt: Date;
  createdBy: string;
  lastActivated?: Date;
  lastActivatedBy?: string;
  activationCount: number;
}

export interface KillSwitchActivation {
  id: string;
  killSwitchId: string;
  activatedBy: string;
  activatedAt: Date;
  reason: string;
  affectedToggles: string[];
  rollbackData: Record<string, any>;
  status: 'ACTIVE' | 'ROLLED_BACK' | 'EXPIRED';
  autoRollbackAt?: Date;
}

export interface EmergencyKillSwitchMetrics {
  totalKillSwitches: number;
  activeKillSwitches: number;
  totalActivations: number;
  avgActivationTime: number;
  togglesCurrentlyDisabled: number;
  lastActivation?: Date;
}

export class EmergencyKillSwitchService {
  private db: Database;
  private activeKillSwitches = new Map<string, KillSwitchActivation>();

  // Claude impact levels that trigger automatic kill switches
  private static readonly HIGH_RISK_CLAUDE_IMPACTS = [
    'HALLUCINATION_RISK',
    'MODEL_VERSION',
    'OUTPUT_QUALITY'
  ];

  // Critical toggle types that should be included in emergency shutdowns
  private static readonly CRITICAL_TOGGLE_TYPES = [
    'percentage_rollout',
    'multivariate',
    'scheduled'
  ];

  constructor(db: Database) {
    this.db = db;
    this.initializeDefaultKillSwitches();
  }

  // ==========================================
  // KILL SWITCH MANAGEMENT
  // ==========================================

  @retryableDatabase({ maxAttempts: 3, baseDelay: 500 })
  async createKillSwitch(config: Omit<EmergencyKillSwitchConfig, 'id' | 'createdAt' | 'activationCount'>): Promise<string> {
    const killSwitchId = `ks_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await this.db.query(`
      INSERT INTO emergency_kill_switches (
        id, name, description, scope, target_toggles, claude_impact_levels,
        enabled, created_at, created_by, activation_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      killSwitchId,
      config.name,
      config.description,
      config.scope,
      JSON.stringify(config.targetToggles || []),
      JSON.stringify(config.claudeImpactLevels || []),
      config.enabled,
      now,
      config.createdBy,
      0
    ]);

    await this.auditKillSwitchAction('CREATED', killSwitchId, config.createdBy, {
      name: config.name,
      scope: config.scope
    });

    return killSwitchId;
  }

  async listKillSwitches(): Promise<EmergencyKillSwitchConfig[]> {
    const result = await this.db.query(`
      SELECT * FROM emergency_kill_switches 
      ORDER BY created_at DESC
    `);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      targetToggles: JSON.parse(row.target_toggles || '[]'),
      claudeImpactLevels: JSON.parse(row.claude_impact_levels || '[]'),
      enabled: row.enabled,
      createdAt: row.created_at,
      createdBy: row.created_by,
      lastActivated: row.last_activated,
      lastActivatedBy: row.last_activated_by,
      activationCount: row.activation_count
    }));
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 400 })
  async updateKillSwitch(id: string, updates: Partial<EmergencyKillSwitchConfig>, updatedBy: string): Promise<void> {
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(updates.name);
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(updates.description);
    }

    if (updates.enabled !== undefined) {
      updateFields.push(`enabled = $${paramIndex++}`);
      updateValues.push(updates.enabled);
    }

    if (updates.targetToggles !== undefined) {
      updateFields.push(`target_toggles = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updates.targetToggles));
    }

    if (updates.claudeImpactLevels !== undefined) {
      updateFields.push(`claude_impact_levels = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updates.claudeImpactLevels));
    }

    if (updateFields.length === 0) return;

    updateFields.push(`updated_at = $${paramIndex++}`);
    updateValues.push(new Date());

    updateValues.push(id);

    await this.db.query(`
      UPDATE emergency_kill_switches 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `, updateValues);

    await this.auditKillSwitchAction('UPDATED', id, updatedBy, updates);
  }

  // ==========================================
  // EMERGENCY ACTIVATION
  // ==========================================

  @retryableDatabase({ maxAttempts: 5, baseDelay: 200 })
  async activateKillSwitch(
    killSwitchId: string, 
    activatedBy: string, 
    reason: string, 
    autoRollbackMinutes?: number
  ): Promise<KillSwitchActivation> {
    const killSwitch = await this.getKillSwitchById(killSwitchId);
    if (!killSwitch) {
      throw new Error(`Kill switch not found: ${killSwitchId}`);
    }

    if (!killSwitch.enabled) {
      throw new Error(`Kill switch is disabled: ${killSwitch.name}`);
    }

    // Get toggles to disable based on kill switch scope
    const affectedToggles = await this.getAffectedToggles(killSwitch);
    
    // Store current state for rollback
    const rollbackData = await this.captureToggleStates(affectedToggles);

    // Create activation record
    const activationId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const autoRollbackAt = autoRollbackMinutes ? 
      new Date(now.getTime() + (autoRollbackMinutes * 60 * 1000)) : undefined;

    const activation: KillSwitchActivation = {
      id: activationId,
      killSwitchId,
      activatedBy,
      activatedAt: now,
      reason,
      affectedToggles,
      rollbackData,
      status: 'ACTIVE',
      autoRollbackAt
    };

    // Begin transaction for atomic operation
    await this.db.query('BEGIN');

    try {
      // Insert activation record
      await this.db.query(`
        INSERT INTO kill_switch_activations (
          id, kill_switch_id, activated_by, activated_at, reason,
          affected_toggles, rollback_data, status, auto_rollback_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        activationId, killSwitchId, activatedBy, now, reason,
        JSON.stringify(affectedToggles), JSON.stringify(rollbackData),
        'ACTIVE', autoRollbackAt
      ]);

      // Disable affected toggles
      await this.disableToggles(affectedToggles, activatedBy, reason);

      // Update kill switch statistics
      await this.db.query(`
        UPDATE emergency_kill_switches 
        SET 
          activation_count = activation_count + 1,
          last_activated = $1,
          last_activated_by = $2
        WHERE id = $3
      `, [now, activatedBy, killSwitchId]);

      await this.db.query('COMMIT');

    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }

    // Store in memory for quick access
    this.activeKillSwitches.set(activationId, activation);

    // Schedule auto-rollback if specified
    if (autoRollbackAt) {
      this.scheduleAutoRollback(activationId, autoRollbackAt);
    }

    // Send emergency notifications
    await this.sendEmergencyNotification(killSwitch, activation);

    await this.auditKillSwitchAction('ACTIVATED', killSwitchId, activatedBy, {
      reason,
      affectedToggles: affectedToggles.length,
      autoRollbackMinutes
    });

    console.warn(`🚨 EMERGENCY KILL SWITCH ACTIVATED: ${killSwitch.name}`);
    console.warn(`   Reason: ${reason}`);
    console.warn(`   Affected toggles: ${affectedToggles.length}`);
    console.warn(`   Activated by: ${activatedBy}`);

    return activation;
  }

  @retryableDatabase({ maxAttempts: 3, baseDelay: 300 })
  async rollbackKillSwitch(activationId: string, rolledBackBy: string, reason?: string): Promise<void> {
    const activation = await this.getActivationById(activationId);
    if (!activation) {
      throw new Error(`Kill switch activation not found: ${activationId}`);
    }

    if (activation.status !== 'ACTIVE') {
      throw new Error(`Kill switch activation is not active: ${activation.status}`);
    }

    await this.db.query('BEGIN');

    try {
      // Restore toggle states
      await this.restoreToggleStates(activation.rollbackData, rolledBackBy);

      // Update activation status
      await this.db.query(`
        UPDATE kill_switch_activations 
        SET 
          status = 'ROLLED_BACK',
          rolled_back_at = $1,
          rolled_back_by = $2,
          rollback_reason = $3
        WHERE id = $4
      `, [new Date(), rolledBackBy, reason || 'Manual rollback', activationId]);

      await this.db.query('COMMIT');

    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }

    // Remove from active list
    this.activeKillSwitches.delete(activationId);

    await this.auditKillSwitchAction('ROLLED_BACK', activation.killSwitchId, rolledBackBy, {
      activationId,
      reason: reason || 'Manual rollback',
      restoredToggles: Object.keys(activation.rollbackData).length
    });

    console.log(`✅ Kill switch activation rolled back: ${activationId}`);
  }

  // ==========================================
  // QUICK EMERGENCY ACTIONS
  // ==========================================

  async emergencyDisableAllToggles(activatedBy: string, reason: string): Promise<KillSwitchActivation> {
    console.warn('🚨 EMERGENCY: Disabling ALL feature toggles!');
    
    // Use or create the "ALL" kill switch
    let allKillSwitch = await this.getKillSwitchByScope('ALL');
    if (!allKillSwitch) {
      const killSwitchId = await this.createKillSwitch({
        name: 'Emergency All Toggles Kill Switch',
        description: 'Emergency kill switch to disable all feature toggles',
        scope: 'ALL',
        enabled: true,
        createdBy: activatedBy
      });
      allKillSwitch = await this.getKillSwitchById(killSwitchId);
    }

    return await this.activateKillSwitch(allKillSwitch!.id, activatedBy, reason);
  }

  async emergencyDisableClaudeImpactToggles(activatedBy: string, reason: string): Promise<KillSwitchActivation> {
    console.warn('🚨 EMERGENCY: Disabling Claude-impacting feature toggles!');
    
    // Use or create the Claude impact kill switch
    let claudeKillSwitch = await this.getKillSwitchByScope('CLAUDE_IMPACT');
    if (!claudeKillSwitch) {
      const killSwitchId = await this.createKillSwitch({
        name: 'Emergency Claude Impact Kill Switch',
        description: 'Emergency kill switch to disable toggles affecting Claude behavior',
        scope: 'CLAUDE_IMPACT',
        claudeImpactLevels: EmergencyKillSwitchService.HIGH_RISK_CLAUDE_IMPACTS,
        enabled: true,
        createdBy: activatedBy
      });
      claudeKillSwitch = await this.getKillSwitchById(killSwitchId);
    }

    return await this.activateKillSwitch(claudeKillSwitch!.id, activatedBy, reason);
  }

  async emergencyDisableCriticalFeatures(activatedBy: string, reason: string): Promise<KillSwitchActivation> {
    console.warn('🚨 EMERGENCY: Disabling critical feature toggles!');
    
    // Use or create the critical features kill switch
    let criticalKillSwitch = await this.getKillSwitchByScope('CRITICAL_FEATURES');
    if (!criticalKillSwitch) {
      const killSwitchId = await this.createKillSwitch({
        name: 'Emergency Critical Features Kill Switch',
        description: 'Emergency kill switch to disable critical system toggles',
        scope: 'CRITICAL_FEATURES',
        enabled: true,
        createdBy: activatedBy
      });
      criticalKillSwitch = await this.getKillSwitchById(killSwitchId);
    }

    return await this.activateKillSwitch(criticalKillSwitch!.id, activatedBy, reason);
  }

  // ==========================================
  // MONITORING & METRICS
  // ==========================================

  async getKillSwitchMetrics(): Promise<EmergencyKillSwitchMetrics> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_kill_switches,
        COUNT(CASE WHEN enabled = true THEN 1 END) as active_kill_switches,
        COALESCE(SUM(activation_count), 0) as total_activations,
        MAX(last_activated) as last_activation
      FROM emergency_kill_switches
    `);

    const activationsResult = await this.db.query(`
      SELECT 
        COUNT(*) as active_activations,
        AVG(EXTRACT(EPOCH FROM (COALESCE(rolled_back_at, NOW()) - activated_at))) as avg_activation_time
      FROM kill_switch_activations
      WHERE status = 'ACTIVE'
    `);

    const disabledTogglesResult = await this.db.query(`
      SELECT COUNT(*) as disabled_toggles
      FROM feature_toggles
      WHERE enabled = false
      AND updated_by LIKE 'EMERGENCY_KILL_SWITCH_%'
    `);

    return {
      totalKillSwitches: parseInt(result.rows[0].total_kill_switches),
      activeKillSwitches: parseInt(result.rows[0].active_kill_switches),
      totalActivations: parseInt(result.rows[0].total_activations),
      avgActivationTime: parseFloat(activationsResult.rows[0].avg_activation_time || '0'),
      togglesCurrentlyDisabled: parseInt(disabledTogglesResult.rows[0].disabled_toggles),
      lastActivation: result.rows[0].last_activation
    };
  }

  async getActiveActivations(): Promise<KillSwitchActivation[]> {
    const result = await this.db.query(`
      SELECT * FROM kill_switch_activations
      WHERE status = 'ACTIVE'
      ORDER BY activated_at DESC
    `);

    return result.rows.map(row => ({
      id: row.id,
      killSwitchId: row.kill_switch_id,
      activatedBy: row.activated_by,
      activatedAt: row.activated_at,
      reason: row.reason,
      affectedToggles: JSON.parse(row.affected_toggles),
      rollbackData: JSON.parse(row.rollback_data),
      status: row.status,
      autoRollbackAt: row.auto_rollback_at
    }));
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async getKillSwitchById(id: string): Promise<EmergencyKillSwitchConfig | null> {
    const result = await this.db.query(
      'SELECT * FROM emergency_kill_switches WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      targetToggles: JSON.parse(row.target_toggles || '[]'),
      claudeImpactLevels: JSON.parse(row.claude_impact_levels || '[]'),
      enabled: row.enabled,
      createdAt: row.created_at,
      createdBy: row.created_by,
      lastActivated: row.last_activated,
      lastActivatedBy: row.last_activated_by,
      activationCount: row.activation_count
    };
  }

  private async getKillSwitchByScope(scope: string): Promise<EmergencyKillSwitchConfig | null> {
    const result = await this.db.query(
      'SELECT * FROM emergency_kill_switches WHERE scope = $1 AND enabled = true LIMIT 1',
      [scope]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      targetToggles: JSON.parse(row.target_toggles || '[]'),
      claudeImpactLevels: JSON.parse(row.claude_impact_levels || '[]'),
      enabled: row.enabled,
      createdAt: row.created_at,
      createdBy: row.created_by,
      lastActivated: row.last_activated,
      lastActivatedBy: row.last_activated_by,
      activationCount: row.activation_count
    };
  }

  private async getActivationById(id: string): Promise<KillSwitchActivation | null> {
    // Check memory first
    if (this.activeKillSwitches.has(id)) {
      return this.activeKillSwitches.get(id)!;
    }

    // Check database
    const result = await this.db.query(
      'SELECT * FROM kill_switch_activations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      killSwitchId: row.kill_switch_id,
      activatedBy: row.activated_by,
      activatedAt: row.activated_at,
      reason: row.reason,
      affectedToggles: JSON.parse(row.affected_toggles),
      rollbackData: JSON.parse(row.rollback_data),
      status: row.status,
      autoRollbackAt: row.auto_rollback_at
    };
  }

  private async getAffectedToggles(killSwitch: EmergencyKillSwitchConfig): Promise<string[]> {
    let query = 'SELECT key FROM feature_toggles WHERE enabled = true';
    const queryParams: any[] = [];

    switch (killSwitch.scope) {
    case 'ALL':
      // No additional filtering
      break;

    case 'CLAUDE_IMPACT':
      if (killSwitch.claudeImpactLevels && killSwitch.claudeImpactLevels.length > 0) {
        query += ' AND claude_impact = ANY($1)';
        queryParams.push(killSwitch.claudeImpactLevels);
      }
      break;

    case 'CRITICAL_FEATURES':
      query += ' AND type = ANY($1)';
      queryParams.push(EmergencyKillSwitchService.CRITICAL_TOGGLE_TYPES);
      break;

    case 'CUSTOM':
      if (killSwitch.targetToggles && killSwitch.targetToggles.length > 0) {
        query += ' AND key = ANY($1)';
        queryParams.push(killSwitch.targetToggles);
      }
      break;
    }

    const result = await this.db.query(query, queryParams);
    return result.rows.map(row => row.key);
  }

  private async captureToggleStates(toggleKeys: string[]): Promise<Record<string, any>> {
    if (toggleKeys.length === 0) return {};

    const result = await this.db.query(
      'SELECT key, enabled, value FROM feature_toggles WHERE key = ANY($1)',
      [toggleKeys]
    );

    const states: Record<string, any> = {};
    result.rows.forEach(row => {
      states[row.key] = {
        enabled: row.enabled,
        value: row.value
      };
    });

    return states;
  }

  private async disableToggles(toggleKeys: string[], disabledBy: string, reason: string): Promise<void> {
    if (toggleKeys.length === 0) return;

    await this.db.query(
      `UPDATE feature_toggles 
       SET enabled = false, 
           updated_by = $1, 
           updated_at = NOW(),
           disable_reason = $2
       WHERE key = ANY($3) AND enabled = true`,
      [`EMERGENCY_KILL_SWITCH_${disabledBy}`, reason, toggleKeys]
    );
  }

  private async restoreToggleStates(rollbackData: Record<string, any>, restoredBy: string): Promise<void> {
    for (const [toggleKey, state] of Object.entries(rollbackData)) {
      await this.db.query(
        `UPDATE feature_toggles 
         SET enabled = $1, 
             value = $2, 
             updated_by = $3, 
             updated_at = NOW(),
             disable_reason = NULL
         WHERE key = $4`,
        [state.enabled, state.value, `ROLLBACK_${restoredBy}`, toggleKey]
      );
    }
  }

  private scheduleAutoRollback(activationId: string, rollbackAt: Date): void {
    const delay = rollbackAt.getTime() - Date.now();
    if (delay <= 0) return;

    setTimeout(async () => {
      try {
        await this.rollbackKillSwitch(activationId, 'SYSTEM_AUTO_ROLLBACK', 'Automatic rollback timeout reached');
      } catch (error) {
        console.error(`Failed to auto-rollback kill switch activation ${activationId}:`, error);
      }
    }, delay);
  }

  private async sendEmergencyNotification(killSwitch: EmergencyKillSwitchConfig, activation: KillSwitchActivation): Promise<void> {
    // Implementation would send notifications via email, Slack, etc.
    console.warn('🚨 EMERGENCY NOTIFICATION SENT:');
    console.warn(`   Kill Switch: ${killSwitch.name}`);
    console.warn(`   Reason: ${activation.reason}`);
    console.warn(`   Affected Toggles: ${activation.affectedToggles.length}`);
    console.warn(`   Activated By: ${activation.activatedBy}`);
  }

  private async auditKillSwitchAction(action: string, killSwitchId: string, userId: string, details: any): Promise<void> {
    await this.db.query(`
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, details, severity, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      userId,
      `KILL_SWITCH_${action}`,
      'emergency_kill_switch',
      killSwitchId,
      JSON.stringify(details),
      action === 'ACTIVATED' ? 'critical' : 'warn'
    ]);
  }

  private async initializeDefaultKillSwitches(): Promise<void> {
    // This would be called during service startup to ensure default kill switches exist
    // Implementation would check for and create default kill switches if they don't exist
  }
}