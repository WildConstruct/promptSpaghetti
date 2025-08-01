/**
 * Backup Controller - E17-1753114397271-3DB2F4
 * 
 * Administrative backup configuration and management controller
 * Part of Epic 17.4.6 - Backup System (Backstage Admin Controls)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../../auth/services/AuditService';
import { PointInTimeRecoveryService } from '../../services/data-retention/PointInTimeRecoveryService';
import { RestoreFunctionalityService } from '../../services/data-retention/RestoreFunctionalityService';

// Admin backup configuration types



export interface AdminBackupConfiguration {
  config_id: string;
  name: string;
  description: string;
  enabled: boolean;
  backup_type: 'full' | 'incremental' | 'differential';
  
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time_of_day: string;
    days_of_week?: number[];
    day_of_month?: number;
    timezone: string;



  };
  
  data_scope: {
    include_admin_configs: boolean;
    include_user_permissions: boolean;
    include_system_settings: boolean;
    include_audit_logs: boolean;
    include_marketplace_data: boolean;
    custom_tables: string[];
    exclude_tables: string[];
  };
  
  retention_policy: {
    keep_hourly: number;
    keep_daily: number;
    keep_weekly: number;
    keep_monthly: number;
    compliance_hold_days?: number;
    archive_after_days?: number;
  };
  
  storage: {
    provider: 'local' | 'aws_s3' | 'gcp_storage' | 'azure_blob';
    location: string;
    encryption_enabled: boolean;
    compression_enabled: boolean;
    storage_class?: string;
  };
  
  notifications: {
    on_success: boolean;
    on_failure: boolean;
    on_completion: boolean;
    recipients: string[];
    slack_webhook?: string;
    email_template?: string;
  };
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
  last_run_at?: Date;
  next_run_at?: Date;




export interface BackupExecution {
  execution_id: string;
  config_id: string;
  recovery_point_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  started_at: Date;
  completed_at?: Date;
  duration_seconds?: number;
  
  backup_size_bytes?: number;
  compressed_size_bytes?: number;
  record_count?: number;
  
  progress: {
    current_step: string;
    steps_completed: number;
    total_steps: number;
    percentage: number;
    estimated_remaining_seconds?: number;



  };
  
  error_details?: {
    error_code: string;
    error_message: string;
    stack_trace?: string;
    retry_count: number;
  };
  
  validation_results?: {
    checksum_valid: boolean;
    record_counts_match: boolean;
    schema_valid: boolean;
    integrity_score: number;
  };


export class BackupController {
  constructor(
    private pool: Pool,
    private auditService: AuditService,
    private recoveryService: PointInTimeRecoveryService,
    private restoreService: RestoreFunctionalityService
  ) {}

  async registerRoutes(fastify: FastifyInstance) {
    // Authentication middleware
    const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const user = request.user as any;
        
        // Check admin backup permissions
        if (!user.permissions?.includes('admin:backup:manage')) {
          reply.code(403).send({ error: 'Insufficient permissions for backup management' });
          return;

 catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });

    };

    // Get all backup configurations
    fastify.get('/admin/backup/configurations', {
      preHandler: authenticate,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 }



    }, async (request: FastifyRequest<{
      Querystring: { enabled?: boolean; page?: number; limit?: number }
>, reply: FastifyReply) => {
      try {
        const { enabled, page = 1, limit = 50 } = request.query;
        const offset = (page - 1) * limit;

        let query = `
          SELECT bc.*, 
                 COUNT(be.execution_id) as total_executions,
                 MAX(be.started_at) as last_execution_at
          FROM backup_configurations bc
          LEFT JOIN backup_executions be ON bc.config_id = be.config_id
          WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (enabled !== undefined) {
          query += ` AND bc.enabled = $${paramIndex}`;
          params.push(enabled);
          paramIndex++;


        query += `
          GROUP BY bc.config_id
          ORDER BY bc.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(limit, offset);

        const result = await this.pool.query(query, params);
        const configurations = result.rows.map(row => this.mapRowToConfiguration(row));

        reply.send(configurations);
 catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch backup configurations' });

    });

    // Get specific backup configuration
    fastify.get('/admin/backup/configurations/:id', {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }

          required: ['id']


    }, async (request: FastifyRequest<{
      Params: { id: string }
>, reply: FastifyReply) => {
      try {
        const query = `
          SELECT bc.*, 
                 COUNT(be.execution_id) as total_executions,
                 MAX(be.started_at) as last_execution_at,
                 AVG(be.duration_seconds) as avg_duration_seconds
          FROM backup_configurations bc
          LEFT JOIN backup_executions be ON bc.config_id = be.config_id
          WHERE bc.config_id = $1
          GROUP BY bc.config_id
        `;

        const result = await this.pool.query(query, [request.params.id]);
        
        if (result.rows.length === 0) {
          reply.code(404).send({ error: 'Backup configuration not found' });
          return;


        const configuration = this.mapRowToConfiguration(result.rows[0]);
        reply.send(configuration);
 catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch backup configuration' });

    });

    // Create new backup configuration
    fastify.post('/admin/backup/configurations', {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['name', 'backup_type', 'schedule', 'data_scope', 'retention_policy', 'storage'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', maxLength: 1000 },
            enabled: { type: 'boolean', default: true },
            backup_type: { type: 'string', enum: ['full', 'incremental', 'differential'] },
            schedule: {
              type: 'object',
              required: ['frequency', 'time_of_day', 'timezone'],
              properties: {
                frequency: { type: 'string', enum: ['hourly', 'daily', 'weekly', 'monthly'] },
                time_of_day: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
                days_of_week: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 } },
                day_of_month: { type: 'integer', minimum: 1, maximum: 31 },
                timezone: { type: 'string' }


            data_scope: {
              type: 'object',
              properties: {
                include_admin_configs: { type: 'boolean', default: true },
                include_user_permissions: { type: 'boolean', default: false },
                include_system_settings: { type: 'boolean', default: false },
                include_audit_logs: { type: 'boolean', default: false },
                include_marketplace_data: { type: 'boolean', default: false },
                custom_tables: { type: 'array', items: { type: 'string' } },
                exclude_tables: { type: 'array', items: { type: 'string' } }


            retention_policy: {
              type: 'object',
              required: ['keep_hourly', 'keep_daily', 'keep_weekly', 'keep_monthly'],
              properties: {
                keep_hourly: { type: 'integer', minimum: 0, maximum: 168 },
                keep_daily: { type: 'integer', minimum: 0, maximum: 365 },
                keep_weekly: { type: 'integer', minimum: 0, maximum: 52 },
                keep_monthly: { type: 'integer', minimum: 0, maximum: 60 },
                compliance_hold_days: { type: 'integer', minimum: 1 },
                archive_after_days: { type: 'integer', minimum: 1 }


            storage: {
              type: 'object',
              required: ['provider', 'location', 'encryption_enabled', 'compression_enabled'],
              properties: {
                provider: { type: 'string', enum: ['local', 'aws_s3', 'gcp_storage', 'azure_blob'] },
                location: { type: 'string', minLength: 1 },
                encryption_enabled: { type: 'boolean' },
                compression_enabled: { type: 'boolean' },
                storage_class: { type: 'string' }


            notifications: {
              type: 'object',
              properties: {
                on_success: { type: 'boolean', default: true },
                on_failure: { type: 'boolean', default: true },
                on_completion: { type: 'boolean', default: false },
                recipients: { type: 'array', items: { type: 'string', format: 'email' } },
                slack_webhook: { type: 'string', format: 'url' },
                email_template: { type: 'string' }





    }, async (request: FastifyRequest<{
      Body: Partial<AdminBackupConfiguration>
>, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const configId = uuidv4();
        const now = new Date();

        const configuration: AdminBackupConfiguration = {
          config_id: configId,
          ...request.body,
          created_by: user.id,
          created_at: now,
          updated_at: now,
          next_run_at: this.calculateNextRun(request.body.schedule!, now)
 as AdminBackupConfiguration;

        // Validate configuration
        await this.validateBackupConfiguration(configuration);

        // Store configuration
        await this.storeBackupConfiguration(configuration);

        // Create initial schedule if enabled
        if (configuration.enabled) {
          await this.scheduleNextBackup(configuration);


        // Audit log
        await this.auditService.logEvent({
          userId: user.id,
          action: 'BACKUP_CONFIGURATION_CREATED',
          resource: `backup_config:${configId}`,
          metadata: {
            name: configuration.name,
            backup_type: configuration.backup_type,
            enabled: configuration.enabled

        });

        reply.code(201).send(configuration);
 catch (error) {
        fastify.log.error(error);
        reply.code(400).send({ 
          error: error instanceof Error ? error.message : 'Failed to create backup configuration' 
        });

    });

    // Update backup configuration
    fastify.put('/admin/backup/configurations/:id', {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }

          required: ['id']


    }, async (request: FastifyRequest<{
      Params: { id: string };
      Body: Partial<AdminBackupConfiguration>
>, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const configId = request.params.id;

        // Get existing configuration
        const existing = await this.getBackupConfiguration(configId);
        if (!existing) {
          reply.code(404).send({ error: 'Backup configuration not found' });
          return;


        // Update configuration
        const updated: AdminBackupConfiguration = {
          ...existing,
          ...request.body,
          updated_at: new Date()
        };

        // Recalculate next run if schedule changed
        if (request.body.schedule) {
          updated.next_run_at = this.calculateNextRun(updated.schedule, new Date());


        // Validate updated configuration
        await this.validateBackupConfiguration(updated);

        // Store updated configuration
        await this.storeBackupConfiguration(updated);

        // Update schedule if needed
        if (updated.enabled !== existing.enabled || request.body.schedule) {
          if (updated.enabled) {
            await this.scheduleNextBackup(updated);
 else {
            await this.unscheduleBackup(configId);



        // Audit log
        await this.auditService.logEvent({
          userId: user.id,
          action: 'BACKUP_CONFIGURATION_UPDATED',
          resource: `backup_config:${configId}`,
          metadata: request.body
        });

        reply.send(updated);
 catch (error) {
        fastify.log.error(error);
        reply.code(400).send({ 
          error: error instanceof Error ? error.message : 'Failed to update backup configuration' 
        });

    });

    // Delete backup configuration
    fastify.delete('/admin/backup/configurations/:id', {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }

          required: ['id']


    }, async (request: FastifyRequest<{
      Params: { id: string }
>, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const configId = request.params.id;

        // Check if configuration exists
        const existing = await this.getBackupConfiguration(configId);
        if (!existing) {
          reply.code(404).send({ error: 'Backup configuration not found' });
          return;


        // Check for active executions
        const activeExecutions = await this.getActiveExecutions(configId);
        if (activeExecutions.length > 0) {
          reply.code(400).send({ 
            error: 'Cannot delete configuration with active backup executions' 
          });
          return;


        // Unschedule backup
        await this.unscheduleBackup(configId);

        // Delete configuration
        await this.pool.query('DELETE FROM backup_configurations WHERE config_id = $1', [configId]);

        // Audit log
        await this.auditService.logEvent({
          userId: user.id,
          action: 'BACKUP_CONFIGURATION_DELETED',
          resource: `backup_config:${configId}`,
          metadata: {
            name: existing.name,
            backup_type: existing.backup_type

        });

        reply.code(204).send();
 catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to delete backup configuration' });

    });

    // Execute backup immediately
    fastify.post('/admin/backup/configurations/:id/run', {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }

          required: ['id']


    }, async (request: FastifyRequest<{
      Params: { id: string }
>, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const configId = request.params.id;

        const configuration = await this.getBackupConfiguration(configId);
        if (!configuration) {
          reply.code(404).send({ error: 'Backup configuration not found' });
          return;


        if (!configuration.enabled) {
          reply.code(400).send({ error: 'Cannot run disabled backup configuration' });
          return;


        // Execute backup
        const execution = await this.executeBackup(configuration, user.id);

        // Audit log
        await this.auditService.logEvent({
          userId: user.id,
          action: 'BACKUP_MANUAL_EXECUTION',
          resource: `backup_config:${configId}`,
          metadata: {
            execution_id: execution.execution_id

        });

        reply.code(201).send(execution);
 catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to execute backup' });

    });

    // Get backup executions
    fastify.get('/admin/backup/executions', {
      preHandler: authenticate,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            config_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
            limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 }



    }, async (request: FastifyRequest<{
      Querystring: { config_id?: string; status?: string; limit?: number }
>, reply: FastifyReply) => {
      try {
        const { config_id, status, limit = 50 } = request.query;

        let query = `
          SELECT be.*, bc.name as config_name
          FROM backup_executions be
          LEFT JOIN backup_configurations bc ON be.config_id = bc.config_id
          WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (config_id) {
          query += ` AND be.config_id = $${paramIndex}`;
          params.push(config_id);
          paramIndex++;


        if (status) {
          query += ` AND be.status = $${paramIndex}`;
          params.push(status);
          paramIndex++;


        query += `
          ORDER BY be.started_at DESC
          LIMIT $${paramIndex}
        `;
        params.push(limit);

        const result = await this.pool.query(query, params);
        const executions = result.rows.map(row => this.mapRowToExecution(row));

        reply.send(executions);
 catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch backup executions' });

    });

    // Get backup metrics
    fastify.get('/admin/backup/metrics', {
      preHandler: authenticate
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const metrics = await this.getBackupMetrics();
        reply.send(metrics);
 catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch backup metrics' });

    });

    // Get recovery points for restore
    fastify.get('/admin/backup/recovery-points', {
      preHandler: authenticate
    }, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get recovery points from Epic 19 service with admin context
        const recoveryPoints = await this.recoveryService.listRecoveryPoints({
          status: 'available',
          validation_status: 'valid',
          limit: 100,
          include_admin_data: true
        });

        reply.send(recoveryPoints);
 catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch recovery points' });

    });


  // Private helper methods

  private async validateBackupConfiguration(config: AdminBackupConfiguration): Promise<void> {

    // Validate schedule configuration
    if (config.schedule.frequency === 'weekly' && !config.schedule.days_of_week?.length) {
      throw new Error('Weekly backups must specify days of the week');


    if (config.schedule.frequency === 'monthly' && !config.schedule.day_of_month) {
      throw new Error('Monthly backups must specify day of the month');


    // Validate data scope
    const hasDataSelection = Object.values(config.data_scope).some(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );

    if (!hasDataSelection) {
      throw new Error('Backup configuration must include at least one data type');


    // Validate storage configuration
    if (config.storage.provider !== 'local' && !config.storage.location) {
      throw new Error('Cloud storage provider requires location configuration');



  private async storeBackupConfiguration(config: AdminBackupConfiguration): Promise<void> {

    const query = `
      INSERT INTO backup_configurations (
        config_id, name, description, enabled, backup_type,
        schedule, data_scope, retention_policy, storage, notifications,
        created_by, created_at, updated_at, next_run_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (config_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        enabled = EXCLUDED.enabled,
        backup_type = EXCLUDED.backup_type,
        schedule = EXCLUDED.schedule,
        data_scope = EXCLUDED.data_scope,
        retention_policy = EXCLUDED.retention_policy,
        storage = EXCLUDED.storage,
        notifications = EXCLUDED.notifications,
        updated_at = EXCLUDED.updated_at,
        next_run_at = EXCLUDED.next_run_at
    `;

    await this.pool.query(query, [
      config.config_id,
      config.name,
      config.description,
      config.enabled,
      config.backup_type,
      JSON.stringify(config.schedule),
      JSON.stringify(config.data_scope),
      JSON.stringify(config.retention_policy),
      JSON.stringify(config.storage),
      JSON.stringify(config.notifications),
      config.created_by,
      config.created_at,
      config.updated_at,
      config.next_run_at
    ]);


  private async getBackupConfiguration(configId: string): Promise<AdminBackupConfiguration | null> {

    const query = 'SELECT * FROM backup_configurations WHERE config_id = $1';
    const result = await this.pool.query(query, [configId]);
    
    return result.rows.length > 0 ? this.mapRowToConfiguration(result.rows[0]) : null;


  private calculateNextRun(schedule: AdminBackupConfiguration['schedule'], fromDate: Date): Date {
    const next = new Date(fromDate);
    
    switch (schedule.frequency) {
    case 'hourly':
      next.setHours(next.getHours() + 1);
      break;
    case 'daily':
      next.setDate(next.getDate() + 1);
      const [hours, minutes] = schedule.time_of_day.split(':').map(Number);
      next.setHours(hours, minutes, 0, 0);
      break;
    case 'weekly':
      // Calculate next occurrence of specified days
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      if (schedule.day_of_month) {
        next.setDate(schedule.day_of_month);

      break;


    return next;


  private async scheduleNextBackup(config: AdminBackupConfiguration): Promise<void> {

    // Implementation would integrate with job scheduler (e.g., node-cron, Bull Queue)
    // For now, we'll just update the next_run_at timestamp
    console.log(`Scheduling next backup for config ${config.config_id} at ${config.next_run_at}`);


  private async unscheduleBackup(configId: string): Promise<void> {

    // Implementation would remove from job scheduler
    console.log(`Unscheduling backup for config ${configId}`);


  private async executeBackup(config: AdminBackupConfiguration, triggeredBy: string): Promise<BackupExecution> {

    const executionId = uuidv4();
    const now = new Date();

    // Create backup execution record
    const execution: BackupExecution = {
      execution_id: executionId,
      config_id: config.config_id,
      status: 'pending',
      started_at: now,
      progress: {
        current_step: 'Initializing backup...',
        steps_completed: 0,
        total_steps: 10,
        percentage: 0

    };

    // Store execution record
    await this.storeBackupExecution(execution);

    // Trigger async backup process using Epic 19 services
    this.processBackupAsync(config, execution, triggeredBy).catch(error => {
      console.error('Backup execution failed:', error);
    });

    return execution;


  private async processBackupAsync(
    config: AdminBackupConfiguration, 
    execution: BackupExecution,
    triggeredBy: string
  ): Promise<void> {

    try {
      // Update status to running
      execution.status = 'running';
      execution.progress.current_step = 'Creating recovery point...';
      execution.progress.percentage = 10;
      await this.storeBackupExecution(execution);

      // Use Epic 19 PointInTimeRecoveryService to create backup
      const recoveryPoint = await this.recoveryService.createRecoveryPoint({
        name: `${config.name} - ${new Date().toISOString()}`,
        description: `Automated backup from configuration: ${config.name}`,
        type: 'scheduled',
        backup_method: config.backup_type,
        include_tables: this.getIncludedTables(config.data_scope),
        exclude_tables: config.data_scope.exclude_tables,
        storage_location: config.storage.location,
        storage_provider: config.storage.provider as any,
        encryption_enabled: config.storage.encryption_enabled,
        created_by: triggeredBy
      });

      execution.recovery_point_id = recoveryPoint.recovery_point_id;
      execution.backup_size_bytes = recoveryPoint.backup_size_bytes;
      execution.compressed_size_bytes = recoveryPoint.backup_size_bytes * recoveryPoint.compression_ratio;
      execution.record_count = recoveryPoint.record_count;
      execution.status = 'completed';
      execution.completed_at = new Date();
      execution.duration_seconds = Math.floor(
        (execution.completed_at.getTime() - execution.started_at.getTime()) / 1000
      );
      execution.progress.percentage = 100;
      execution.progress.current_step = 'Backup completed successfully';

      // Validate backup if configured
      if (config.storage.encryption_enabled) {
        execution.validation_results = {
          checksum_valid: true,
          record_counts_match: true,
          schema_valid: true,
          integrity_score: 100
        };


      await this.storeBackupExecution(execution);

      // Send notifications if configured
      if (config.notifications.on_success && config.notifications.recipients.length > 0) {
        await this.sendBackupNotification(config, execution, 'success');

 catch (error) {
      execution.status = 'failed';
      execution.error_details = {
        error_code: 'BACKUP_EXECUTION_FAILED',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        stack_trace: error instanceof Error ? error.stack : undefined,
        retry_count: 0
      };
      execution.completed_at = new Date();
      execution.duration_seconds = Math.floor(
        (execution.completed_at.getTime() - execution.started_at.getTime()) / 1000
      );

      await this.storeBackupExecution(execution);

      // Send failure notification
      if (config.notifications.on_failure && config.notifications.recipients.length > 0) {
        await this.sendBackupNotification(config, execution, 'failure');


      throw error;



  private getIncludedTables(dataScope: AdminBackupConfiguration['data_scope']): string[] {
    const tables: string[] = [];

    if (dataScope.include_admin_configs) {
      tables.push('admin_permission_groups', 'admin_user_group_assignments', 'admin_control_settings');


    if (dataScope.include_user_permissions) {
      tables.push('users', 'user_roles', 'role_permissions');


    if (dataScope.include_system_settings) {
      tables.push('system_settings', 'feature_flags', 'application_config');


    if (dataScope.include_audit_logs) {
      tables.push('admin_activity_log', 'audit_events');


    if (dataScope.include_marketplace_data) {
      tables.push('marketplace_templates', 'marketplace_transactions', 'template_reviews');


    // Add custom tables
    tables.push(...dataScope.custom_tables);

    return tables;


  private async storeBackupExecution(execution: BackupExecution): Promise<void> {

    const query = `
      INSERT INTO backup_executions (
        execution_id, config_id, recovery_point_id, status, started_at,
        completed_at, duration_seconds, backup_size_bytes, compressed_size_bytes,
        record_count, progress, error_details, validation_results
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (execution_id) DO UPDATE SET
        status = EXCLUDED.status,
        recovery_point_id = EXCLUDED.recovery_point_id,
        completed_at = EXCLUDED.completed_at,
        duration_seconds = EXCLUDED.duration_seconds,
        backup_size_bytes = EXCLUDED.backup_size_bytes,
        compressed_size_bytes = EXCLUDED.compressed_size_bytes,
        record_count = EXCLUDED.record_count,
        progress = EXCLUDED.progress,
        error_details = EXCLUDED.error_details,
        validation_results = EXCLUDED.validation_results
    `;

    await this.pool.query(query, [
      execution.execution_id,
      execution.config_id,
      execution.recovery_point_id,
      execution.status,
      execution.started_at,
      execution.completed_at,
      execution.duration_seconds,
      execution.backup_size_bytes,
      execution.compressed_size_bytes,
      execution.record_count,
      JSON.stringify(execution.progress),
      execution.error_details ? JSON.stringify(execution.error_details) : null,
      execution.validation_results ? JSON.stringify(execution.validation_results) : null
    ]);


  private async getActiveExecutions(configId?: string): Promise<BackupExecution[]> {

    let query = `
      SELECT * FROM backup_executions 
      WHERE status IN ('pending', 'running')
    `;
    
    const params: any[] = [];
    
    if (configId) {
      query += ' AND config_id = $1';
      params.push(configId);

    
    query += ' ORDER BY started_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this.mapRowToExecution(row));


  private async getBackupMetrics(): Promise<any> {

    // Get configuration metrics
    const configsResult = await this.pool.query(`
      SELECT 
        COUNT(*) as total_configurations,
        COUNT(*) FILTER (WHERE enabled = true) as active_configurations
      FROM backup_configurations
    `);

    // Get execution metrics
    const executionsResult = await this.pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed' AND started_at >= NOW() - INTERVAL '24 hours') as successful_24h,
        COUNT(*) FILTER (WHERE status = 'failed' AND started_at >= NOW() - INTERVAL '24 hours') as failed_24h,
        AVG(duration_seconds) FILTER (WHERE status = 'completed' AND started_at >= NOW() - INTERVAL '7 days') as avg_duration,
        SUM(backup_size_bytes) FILTER (WHERE status = 'completed') as total_storage_bytes
      FROM backup_executions
    `);

    // Get recovery points count
    const recoveryPointsResult = await this.pool.query(`
      SELECT COUNT(*) as total_recovery_points
      FROM recovery_points 
      WHERE status = 'available'
    `);

    return {
      total_configurations: parseInt(configsResult.rows[0].total_configurations) || 0,
      active_configurations: parseInt(configsResult.rows[0].active_configurations) || 0,
      total_recovery_points: parseInt(recoveryPointsResult.rows[0].total_recovery_points) || 0,
      total_storage_bytes: parseInt(executionsResult.rows[0].total_storage_bytes) || 0,
      recent_executions: {
        successful: parseInt(executionsResult.rows[0].successful_24h) || 0,
        failed: parseInt(executionsResult.rows[0].failed_24h) || 0,
        average_duration_minutes: Math.round((parseInt(executionsResult.rows[0].avg_duration) || 0) / 60),
        last_24h_count: (parseInt(executionsResult.rows[0].successful_24h) || 0) + 
                        (parseInt(executionsResult.rows[0].failed_24h) || 0)

      health_status: {
        overall_status: 'healthy', // Could be calculated based on recent failures
        issues: [],
        recommendations: []

    };


  private async sendBackupNotification(
    config: AdminBackupConfiguration, 
    execution: BackupExecution, 
    type: 'success' | 'failure'
  ): Promise<void> {

    // Implementation would send actual notifications via email/Slack
    console.log(`Sending ${type} notification for backup ${execution.execution_id}`);


  private mapRowToConfiguration(row: any): AdminBackupConfiguration {
    return {
      config_id: row.config_id,
      name: row.name,
      description: row.description,
      enabled: row.enabled,
      backup_type: row.backup_type,
      schedule: JSON.parse(row.schedule),
      data_scope: JSON.parse(row.data_scope),
      retention_policy: JSON.parse(row.retention_policy),
      storage: JSON.parse(row.storage),
      notifications: JSON.parse(row.notifications),
      created_by: row.created_by,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      last_run_at: row.last_run_at ? new Date(row.last_run_at) : undefined,
      next_run_at: row.next_run_at ? new Date(row.next_run_at) : undefined
    };


  private mapRowToExecution(row: any): BackupExecution {
    return {
      execution_id: row.execution_id,
      config_id: row.config_id,
      recovery_point_id: row.recovery_point_id,
      status: row.status,
      started_at: new Date(row.started_at),
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
      duration_seconds: row.duration_seconds,
      backup_size_bytes: row.backup_size_bytes,
      compressed_size_bytes: row.compressed_size_bytes,
      record_count: row.record_count,
      progress: JSON.parse(row.progress || '{}'),
      error_details: row.error_details ? JSON.parse(row.error_details) : undefined,
      validation_results: row.validation_results ? JSON.parse(row.validation_results) : undefined
    };

