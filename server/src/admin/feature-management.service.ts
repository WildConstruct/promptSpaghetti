// Epic 17 Story 17.1 - Feature Management & Toggle System
// Advanced administrative feature management with dashboard controls, scheduling, and user targeting

import { Pool, PoolClient } from 'pg';
import { EventEmitter } from 'events';
import { FeatureToggleService } from '../services/feature-toggle-service';
import { EnhancedToggleEvaluationService } from '../services/EnhancedToggleEvaluationService';



export interface FeatureToggleAdmin {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'percentage' | 'experiment';
  value: any;
  enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_updated_by?: string;
  
  // Advanced admin fields
  user_targeting?: {
    segments: string[];
    user_ids: string[];
    percentage: number;
    rules: TargetingRule[];



  };
  
  scheduling?: {
    enable_at?: string;
    disable_at?: string;
    rollout_strategy?: 'immediate' | 'gradual' | 'scheduled';
    rollout_percentage?: number;
    rollout_duration_hours?: number;
  };
  
  dependencies?: {
    requires: string[];
    conflicts_with: string[];
    affects: string[];
  };
  
  monitoring?: {
    track_usage: boolean;
    alert_on_change: boolean;
    health_check_enabled: boolean;
    rollback_conditions?: RollbackCondition[];
  };
  
  audit_log?: AuditLogEntry[];
  usage_stats?: FeatureUsageStats;
  health_status?: FeatureHealthStatus;




export interface TargetingRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'regex' | 'greater_than' | 'less_than';
  value: any;
  condition?: 'and' | 'or';







export interface RollbackCondition {
  metric: string;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  window_minutes: number;
  action: 'disable' | 'rollback' | 'alert';







export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: 'created' | 'updated' | 'enabled' | 'disabled' | 'deleted' | 'emergency_override';



  changes: Record<string, { old: any; new: any }>;
  reason?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;




export interface FeatureUsageStats {
  total_evaluations: number;
  evaluations_last_24h: number;
  unique_users_last_24h: number;
  avg_response_time_ms: number;
  error_rate_percentage: number;
  last_evaluation: string;







export interface FeatureHealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'disabled';
  issues: string[];
  last_check: string;
  performance_score: number;
  availability_percentage: number;







export interface FeatureDashboardStats {
  total_features: number;
  enabled_features: number;
  disabled_features: number;
  scheduled_features: number;
  targeted_features: number;
  features_with_issues: number;
  total_evaluations_24h: number;
  unique_users_24h: number;
  avg_response_time: number;
  recent_changes: AuditLogEntry[];







export interface CreateFeatureRequest {
  key: string;
  name: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'percentage' | 'experiment';
  value: any;
  enabled?: boolean;
  user_targeting?: {
    segments?: string[];
    user_ids?: string[];
    percentage?: number;
    rules?: TargetingRule[];



  };
  scheduling?: {
    enable_at?: string;
    disable_at?: string;
    rollout_strategy?: 'immediate' | 'gradual' | 'scheduled';
    rollout_percentage?: number;
    rollout_duration_hours?: number;
  };
  dependencies?: {
    requires?: string[];
    conflicts_with?: string[];
  };
  monitoring?: {
    track_usage?: boolean;
    alert_on_change?: boolean;
    health_check_enabled?: boolean;
    rollback_conditions?: RollbackCondition[];
  };




export interface UpdateFeatureRequest {
  name?: string;
  description?: string;
  value?: any;
  enabled?: boolean;
  user_targeting?: {
    segments?: string[];
    user_ids?: string[];
    percentage?: number;
    rules?: TargetingRule[];



  };
  scheduling?: {
    enable_at?: string;
    disable_at?: string;
    rollout_strategy?: 'immediate' | 'gradual' | 'scheduled';
    rollout_percentage?: number;
    rollout_duration_hours?: number;
  };
  dependencies?: {
    requires?: string[];
    conflicts_with?: string[];
  };
  monitoring?: {
    track_usage?: boolean;
    alert_on_change?: boolean;
    health_check_enabled?: boolean;
    rollback_conditions?: RollbackCondition[];
  };
  reason?: string;


export class FeatureManagementService extends EventEmitter {
  constructor(
    private db: Pool,
    private featureToggleService: FeatureToggleService,
    private enhancedEvaluationService: EnhancedToggleEvaluationService
  ) {
    super();
    this.setupScheduledTasks();
    this.setupHealthMonitoring();


  // Feature CRUD operations
  async createFeature(adminUserId: string, featureData: CreateFeatureRequest): Promise<FeatureToggleAdmin> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Validate feature key uniqueness
      const existingFeature = await client.query(
        'SELECT id FROM admin_feature_toggles WHERE key = $1',
        [featureData.key]
      );

      if (existingFeature.rows.length > 0) {
        throw new Error(`Feature key '${featureData.key}' already exists`);


      // Validate dependencies
      if (featureData.dependencies) {
        await this.validateDependencies(featureData.dependencies);


      // Insert feature
      const featureResult = await client.query(`
        INSERT INTO admin_feature_toggles (
          key, name, description, type, value, enabled, created_by,
          user_targeting, scheduling, dependencies, monitoring
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at, updated_at
      `, [
        featureData.key,
        featureData.name,
        featureData.description,
        featureData.type,
        JSON.stringify(featureData.value),
        featureData.enabled ?? false,
        adminUserId,
        featureData.user_targeting ? JSON.stringify(featureData.user_targeting) : null,
        featureData.scheduling ? JSON.stringify(featureData.scheduling) : null,
        featureData.dependencies ? JSON.stringify(featureData.dependencies) : null,
        featureData.monitoring ? JSON.stringify(featureData.monitoring) : null
      ]);

      const featureId = featureResult.rows[0].id;

      // Log audit entry
      await this.logAuditEntry(client, featureId, adminUserId, 'created', {
        feature_data: { old: null, new: featureData }
      }, 'Feature created');

      // Initialize usage stats
      await client.query(`
        INSERT INTO feature_usage_stats (feature_id, total_evaluations, evaluations_last_24h, unique_users_last_24h)
        VALUES ($1, 0, 0, 0)
      `, [featureId]);

      // Initialize health status
      await client.query(`
        INSERT INTO feature_health_status (feature_id, status, performance_score, availability_percentage)
        VALUES ($1, 'healthy', 100, 100)
      `, [featureId]);

      const feature = await this.getFeatureById(featureId);

      await client.query('COMMIT');

      // Emit event for real-time updates
      this.emit('featureCreated', feature);

      return feature;
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  async updateFeature(
    featureId: string,
    adminUserId: string,
    updates: UpdateFeatureRequest
  ): Promise<FeatureToggleAdmin> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get current feature for audit log
      const currentFeature = await this.getFeatureById(featureId);
      if (!currentFeature) {
        throw new Error('Feature not found');


      // Validate dependencies if updated
      if (updates.dependencies) {
        await this.validateDependencies(updates.dependencies);


      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        updateValues.push(updates.name);

      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        updateValues.push(updates.description);

      if (updates.value !== undefined) {
        updateFields.push(`value = $${paramCount++}`);
        updateValues.push(JSON.stringify(updates.value));

      if (updates.enabled !== undefined) {
        updateFields.push(`enabled = $${paramCount++}`);
        updateValues.push(updates.enabled);

      if (updates.user_targeting !== undefined) {
        updateFields.push(`user_targeting = $${paramCount++}`);
        updateValues.push(JSON.stringify(updates.user_targeting));

      if (updates.scheduling !== undefined) {
        updateFields.push(`scheduling = $${paramCount++}`);  
        updateValues.push(JSON.stringify(updates.scheduling));

      if (updates.dependencies !== undefined) {
        updateFields.push(`dependencies = $${paramCount++}`);
        updateValues.push(JSON.stringify(updates.dependencies));

      if (updates.monitoring !== undefined) {
        updateFields.push(`monitoring = $${paramCount++}`);
        updateValues.push(JSON.stringify(updates.monitoring));


      updateFields.push(`last_updated_by = $${paramCount++}`);
      updateValues.push(adminUserId);
      updateFields.push(`updated_at = NOW()`);

      updateValues.push(featureId);

      const updateQuery = `
        UPDATE admin_feature_toggles 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING updated_at
      `;

      await client.query(updateQuery, updateValues);

      // Log audit entry
      const changes: Record<string, { old: any; new: any }> = {};
      Object.keys(updates).forEach(key => {
        if (key !== 'reason' && updates[key as keyof UpdateFeatureRequest] !== undefined) {
          changes[key] = {
            old: (currentFeature as any)[key],
            new: updates[key as keyof UpdateFeatureRequest]
          };

      });

      await this.logAuditEntry(client, featureId, adminUserId, 'updated', changes, updates.reason);

      const updatedFeature = await this.getFeatureById(featureId);

      await client.query('COMMIT');

      // Emit event for real-time updates
      this.emit('featureUpdated', updatedFeature);

      return updatedFeature;
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  async toggleFeature(featureId: string, adminUserId: string, enabled: boolean, reason?: string): Promise<void> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const currentFeature = await this.getFeatureById(featureId);
      if (!currentFeature) {
        throw new Error('Feature not found');


      await client.query(
        'UPDATE admin_feature_toggles SET enabled = $1, last_updated_by = $2, updated_at = NOW() WHERE id = $3',
        [enabled, adminUserId, featureId]
      );

      await this.logAuditEntry(client, featureId, adminUserId, enabled ? 'enabled' : 'disabled', {
        enabled: { old: currentFeature.enabled, new: enabled }
      }, reason);

      await client.query('COMMIT');

      // Emit event for real-time updates
      this.emit('featureToggled', { featureId, enabled, adminUserId });
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  async deleteFeature(featureId: string, adminUserId: string, reason?: string): Promise<void> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const currentFeature = await this.getFeatureById(featureId);
      if (!currentFeature) {
        throw new Error('Feature not found');


      // Check for dependencies
      const dependentFeatures = await client.query(
        `SELECT key, name FROM admin_feature_toggles 
         WHERE dependencies IS NOT NULL 
         AND dependencies::jsonb -> 'requires' ? $1`,
        [currentFeature.key]
      );

      if (dependentFeatures.rows.length > 0) {
        const dependentKeys = dependentFeatures.rows.map(f => f.name).join(', ');
        throw new Error(`Cannot delete feature: required by ${dependentKeys}`);


      // Log audit entry before deletion
      await this.logAuditEntry(client, featureId, adminUserId, 'deleted', {
        feature: { old: currentFeature, new: null }
      }, reason);

      // Delete feature (cascade will handle related records)
      await client.query('DELETE FROM admin_feature_toggles WHERE id = $1', [featureId]);

      await client.query('COMMIT');

      // Emit event for real-time updates
      this.emit('featureDeleted', { featureId, adminUserId });
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // Feature retrieval and dashboard
  async getAllFeatures(filters?: {
    enabled?: boolean;
    type?: string;
    has_targeting?: boolean;
    has_scheduling?: boolean;
    search?: string;
  }): Promise<FeatureToggleAdmin[]> {

    let query = `
      SELECT 
        f.*,
        us.total_evaluations, us.evaluations_last_24h, us.unique_users_last_24h,
        us.avg_response_time_ms, us.error_rate_percentage, us.last_evaluation,
        hs.status as health_status_status, hs.issues, hs.last_check as health_last_check,
        hs.performance_score, hs.availability_percentage
      FROM admin_feature_toggles f
      LEFT JOIN feature_usage_stats us ON f.id = us.feature_id
      LEFT JOIN feature_health_status hs ON f.id = hs.feature_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.enabled !== undefined) {
      query += ` AND f.enabled = $${params.length + 1}`;
      params.push(filters.enabled);


    if (filters?.type) {
      query += ` AND f.type = $${params.length + 1}`;
      params.push(filters.type);


    if (filters?.has_targeting) {
      query += ` AND f.user_targeting IS NOT NULL`;


    if (filters?.has_scheduling) {
      query += ` AND f.scheduling IS NOT NULL`;


    if (filters?.search) {
      query += ` AND (f.name ILIKE $${params.length + 1} OR f.key ILIKE $${params.length + 1} OR f.description ILIKE $${params.length + 1})`;
      params.push(`%${filters.search}%`);


    query += ` ORDER BY f.created_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows.map(this.mapRowToFeature);


  async getFeatureById(featureId: string): Promise<FeatureToggleAdmin | null> {

    const result = await this.db.query(`
      SELECT 
        f.*,
        us.total_evaluations, us.evaluations_last_24h, us.unique_users_last_24h,
        us.avg_response_time_ms, us.error_rate_percentage, us.last_evaluation,
        hs.status as health_status_status, hs.issues, hs.last_check as health_last_check,
        hs.performance_score, hs.availability_percentage
      FROM admin_feature_toggles f
      LEFT JOIN feature_usage_stats us ON f.id = us.feature_id
      LEFT JOIN feature_health_status hs ON f.id = hs.feature_id
      WHERE f.id = $1
    `, [featureId]);

    return result.rows.length > 0 ? this.mapRowToFeature(result.rows[0]) : null;


  async getFeatureAuditLog(featureId: string, limit = 50): Promise<AuditLogEntry[]> {

    const result = await this.db.query(`
      SELECT 
        al.*,
        u.display_name as user_name
      FROM feature_audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.feature_id = $1
      ORDER BY al.timestamp DESC
      LIMIT $2
    `, [featureId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      user_name: row.user_name || 'Unknown User',
      action: row.action,
      changes: row.changes,
      reason: row.reason,
      timestamp: row.timestamp,
      ip_address: row.ip_address,
      user_agent: row.user_agent
    }));


  async getDashboardStats(): Promise<FeatureDashboardStats> {

    const [featuresResult, evaluationsResult, changesResult] = await Promise.all([
      this.db.query(`
        SELECT 
          COUNT(*) as total_features,
          COUNT(*) FILTER (WHERE enabled = true) as enabled_features,
          COUNT(*) FILTER (WHERE enabled = false) as disabled_features,
          COUNT(*) FILTER (WHERE scheduling IS NOT NULL) as scheduled_features,
          COUNT(*) FILTER (WHERE user_targeting IS NOT NULL) as targeted_features
        FROM admin_feature_toggles
      `),
      this.db.query(`
        SELECT 
          COALESCE(SUM(evaluations_last_24h), 0) as total_evaluations_24h,
          COALESCE(SUM(unique_users_last_24h), 0) as unique_users_24h,
          COALESCE(AVG(avg_response_time_ms), 0) as avg_response_time
        FROM feature_usage_stats
      `),
      this.db.query(`
        SELECT 
          al.*,
          u.display_name as user_name
        FROM feature_audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.timestamp > NOW() - INTERVAL '24 hours'
        ORDER BY al.timestamp DESC
        LIMIT 10
      `)
    ]);

    const healthResult = await this.db.query(`
      SELECT COUNT(*) as features_with_issues
      FROM feature_health_status
      WHERE status IN ('warning', 'critical')
    `);

    const features = featuresResult.rows[0];
    const evaluations = evaluationsResult.rows[0];
    const health = healthResult.rows[0];

    return {
      total_features: parseInt(features.total_features),
      enabled_features: parseInt(features.enabled_features),
      disabled_features: parseInt(features.disabled_features),
      scheduled_features: parseInt(features.scheduled_features),
      targeted_features: parseInt(features.targeted_features),
      features_with_issues: parseInt(health.features_with_issues),
      total_evaluations_24h: parseInt(evaluations.total_evaluations_24h),
      unique_users_24h: parseInt(evaluations.unique_users_24h),
      avg_response_time: parseFloat(evaluations.avg_response_time),
      recent_changes: changesResult.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name || 'Unknown User',
        action: row.action,
        changes: row.changes,
        reason: row.reason,
        timestamp: row.timestamp,
        ip_address: row.ip_address,
        user_agent: row.user_agent
      }))
    };


  // Emergency controls
  async emergencyDisableFeature(featureId: string, adminUserId: string, reason: string): Promise<void> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE admin_feature_toggles SET enabled = false, last_updated_by = $1, updated_at = NOW() WHERE id = $2',
        [adminUserId, featureId]
      );

      await this.logAuditEntry(client, featureId, adminUserId, 'emergency_override', {
        enabled: { old: true, new: false }
      }, `EMERGENCY DISABLE: ${reason}`);

      await client.query('COMMIT');

      // Emit high-priority event
      this.emit('emergencyDisable', { featureId, adminUserId, reason });
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // Private helper methods
  private async validateDependencies(dependencies: { requires?: string[]; conflicts_with?: string[] }): Promise<void> {

    if (dependencies.requires) {
      const existingFeatures = await this.db.query(
        'SELECT key FROM admin_feature_toggles WHERE key = ANY($1)',
        [dependencies.requires]
      );
      
      const existingKeys = existingFeatures.rows.map(f => f.key);
      const missingKeys = dependencies.requires.filter(key => !existingKeys.includes(key));
      
      if (missingKeys.length > 0) {
        throw new Error(`Required features not found: ${missingKeys.join(', ')}`);



    if (dependencies.conflicts_with) {
      const conflictingFeatures = await this.db.query(
        'SELECT key FROM admin_feature_toggles WHERE key = ANY($1) AND enabled = true',
        [dependencies.conflicts_with]
      );
      
      if (conflictingFeatures.rows.length > 0) {
        const conflictingKeys = conflictingFeatures.rows.map(f => f.key);
        throw new Error(`Conflicting features are enabled: ${conflictingKeys.join(', ')}`);




  private async logAuditEntry(
    client: PoolClient,
    featureId: string,
    userId: string,
    action: string,
    changes: Record<string, { old: any; new: any }>,
    reason?: string
  ): Promise<void> {

    await client.query(`
      INSERT INTO feature_audit_log (feature_id, user_id, action, changes, reason)
      VALUES ($1, $2, $3, $4, $5)
    `, [featureId, userId, action, JSON.stringify(changes), reason]);


  private mapRowToFeature(row: any): FeatureToggleAdmin {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      type: row.type,
      value: JSON.parse(row.value),
      enabled: row.enabled,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_updated_by: row.last_updated_by,
      user_targeting: row.user_targeting ? JSON.parse(row.user_targeting) : undefined,
      scheduling: row.scheduling ? JSON.parse(row.scheduling) : undefined,
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : undefined,
      monitoring: row.monitoring ? JSON.parse(row.monitoring) : undefined,
      usage_stats: {
        total_evaluations: row.total_evaluations || 0,
        evaluations_last_24h: row.evaluations_last_24h || 0,
        unique_users_last_24h: row.unique_users_last_24h || 0,
        avg_response_time_ms: row.avg_response_time_ms || 0,
        error_rate_percentage: row.error_rate_percentage || 0,
        last_evaluation: row.last_evaluation

      health_status: {
        status: row.health_status_status || 'healthy',
        issues: row.issues ? JSON.parse(row.issues) : [],
        last_check: row.health_last_check,
        performance_score: row.performance_score || 100,
        availability_percentage: row.availability_percentage || 100

    };


  private setupScheduledTasks(): void {
    // Process scheduled feature toggles every minute
    setInterval(async () => {
      try {
        await this.processScheduledToggles();
 catch (error) {
        console.error('Error processing scheduled toggles:', error);

    }, 60000);

    // Update usage statistics every 5 minutes
    setInterval(async () => {
      try {
        await this.updateUsageStatistics();
 catch (error) {
        console.error('Error updating usage statistics:', error);

    }, 300000);


  private setupHealthMonitoring(): void {
    // Health check every 2 minutes
    setInterval(async () => {
      try {
        await this.performHealthChecks();
 catch (error) {
        console.error('Error performing health checks:', error);

    }, 120000);


  private async processScheduledToggles(): Promise<void> {

    const now = new Date().toISOString();
    
    const scheduledFeatures = await this.db.query(`
      SELECT id, key, scheduling FROM admin_feature_toggles
      WHERE scheduling IS NOT NULL
      AND (
        (scheduling::jsonb ->> 'enable_at')::timestamp <= $1 OR
        (scheduling::jsonb ->> 'disable_at')::timestamp <= $1

    `, [now]);

    for (const feature of scheduledFeatures.rows) {
      const scheduling = JSON.parse(feature.scheduling);
      
      if (scheduling.enable_at && new Date(scheduling.enable_at) <= new Date(now)) {
        await this.toggleFeature(feature.id, 'system', true, `Scheduled enable at ${scheduling.enable_at}`);

      
      if (scheduling.disable_at && new Date(scheduling.disable_at) <= new Date(now)) {
        await this.toggleFeature(feature.id, 'system', false, `Scheduled disable at ${scheduling.disable_at}`);




  private async updateUsageStatistics(): Promise<void> {

    // This would integrate with actual usage tracking system
    // For now, we'll just update the last_check timestamps
    await this.db.query(`
      UPDATE feature_usage_stats
      SET last_updated = NOW()
      WHERE last_updated < NOW() - INTERVAL '5 minutes'
    `);


  private async performHealthChecks(): Promise<void> {

    const features = await this.db.query(`
      SELECT id, key, enabled, monitoring FROM admin_feature_toggles
      WHERE monitoring IS NOT NULL
      AND (monitoring::jsonb ->> 'health_check_enabled')::boolean = true
    `);

    for (const feature of features.rows) {
      try {
        // Perform basic health check - check if feature is responding
        const healthScore = await this.calculateHealthScore(feature.id);
        const issues: string[] = [];

        if (healthScore < 70) {
          issues.push('Performance degradation detected');


        const status = issues.length === 0 ? 'healthy' : 
                      issues.length <= 2 ? 'warning' : 'critical';

        await this.db.query(`
          UPDATE feature_health_status
          SET status = $1, issues = $2, last_check = NOW(), performance_score = $3
          WHERE feature_id = $4
        `, [status, JSON.stringify(issues), healthScore, feature.id]);
 catch (error) {
        await this.db.query(`
          UPDATE feature_health_status
          SET status = 'critical', issues = $1, last_check = NOW()
          WHERE feature_id = $2
        `, [JSON.stringify([`Health check failed: ${error.message}`]), feature.id]);




  private async calculateHealthScore(featureId: string): Promise<number> {

    // Simplified health score calculation
    // In a real implementation, this would check response times, error rates, etc.
    const stats = await this.db.query(
      'SELECT avg_response_time_ms, error_rate_percentage FROM feature_usage_stats WHERE feature_id = $1',
      [featureId]
    );

    if (stats.rows.length === 0) return 100;

    const responseTime = stats.rows[0].avg_response_time_ms || 0;
    const errorRate = stats.rows[0].error_rate_percentage || 0;

    let score = 100;
    
    // Penalize high response times
    if (responseTime > 100) score -= Math.min(30, (responseTime - 100) / 10);
    
    // Penalize high error rates
    if (errorRate > 1) score -= Math.min(40, errorRate * 10);

    return Math.max(0, Math.round(score));

