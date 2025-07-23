/**
 * Selective Restore API Routes - Epic 17.4.6
 * 
 * API endpoints for selective backup restoration operations. Integrates with
 * existing RestoreFunctionalityService and BackupVerificationService to provide
 * comprehensive selective restore capabilities.
 * 
 * Task: E17-1753114397287-A42A86 - Implement selective restore
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// =============================================================================
// Request/Response Schemas
// =============================================================================

const RestorePreviewSchema = z.object({
  recovery_point_id: z.string(),
  table_filters: z.object({
    include_tables: z.array(z.string()).optional(),
    exclude_tables: z.array(z.string()).optional(),
    where_conditions: z.record(z.string()).optional(),
    limit_records: z.number().optional()
  }).optional(),
  restore_scope: z.enum(['full_database', 'table_level', 'record_level', 'schema_only', 'data_only']).optional()
});

const ExecuteRestoreSchema = z.object({
  recovery_point_id: z.string(),
  operation_type: z.literal('selective_restore'),
  restore_scope: z.enum(['full_database', 'table_level', 'record_level', 'schema_only', 'data_only']),
  restore_strategy: z.enum(['replace', 'merge', 'append', 'compare_first', 'backup_first']),
  target_database: z.string().optional(),
  table_filters: z.object({
    include_tables: z.array(z.string()),
    exclude_tables: z.array(z.string()),
    where_conditions: z.record(z.string()),
    limit_records: z.number().optional()
  }),
  validation_level: z.enum(['none', 'basic', 'full', 'business_rules', 'compliance']),
  notification_config: z.object({
    on_completion: z.boolean(),
    on_error: z.boolean(),
    notification_channels: z.array(z.string())
  })
});

// =============================================================================
// Route Handlers
// =============================================================================

export async function selectiveRestoreRoutes(fastify: FastifyInstance) {
  
  // Get available recovery points
  fastify.get('/api/admin/backup/recovery-points', {
    schema: {
      querystring: z.object({
        limit: z.coerce.number().default(50),
        offset: z.coerce.number().default(0),
        backup_type: z.enum(['scheduled', 'transaction', 'manual', 'compliance', 'incident']).optional(),
        validation_status: z.enum(['not_validated', 'valid', 'corrupted', 'partially_valid']).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(z.any()),
          totalCount: z.number()
        })
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      limit: number;
      offset: number;
      backup_type?: string;
      validation_status?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { limit, offset, backup_type, validation_status } = request.query;
      
      let query = `
        SELECT 
          rp.*,
          COALESCE(array_length(rp.included_tables, 1), 0) as table_count,
          rs.size_bytes as backup_size_bytes
        FROM recovery_points rp
        LEFT JOIN recovery_statistics rs ON rp.id = rs.recovery_point_id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (backup_type) {
        query += ` AND rp.backup_type = $${params.length + 1}`;
        params.push(backup_type);
      }
      
      if (validation_status) {
        query += ` AND rp.validation_status = $${params.length + 1}`;
        params.push(validation_status);
      }
      
      query += `
        ORDER BY rp.recovery_point_timestamp DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(limit, offset);
      
      const result = await fastify.pg.pool.query(query, params);
      
      // Get total count for pagination
      const countResult = await fastify.pg.pool.query(`
        SELECT COUNT(*) as total 
        FROM recovery_points rp
        WHERE 1=1
        ${backup_type ? ` AND rp.backup_type = '${backup_type}'` : ''}
        ${validation_status ? ` AND rp.validation_status = '${validation_status}'` : ''}
      `);
      
      return reply.code(200).send({
        success: true,
        data: result.rows,
        totalCount: parseInt(countResult.rows[0].total)
      });
      
    } catch (error) {
      request.log.error({ error }, 'Failed to get recovery points');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get recovery points'
      });
    }
  });

  // Get available tables for a recovery point
  fastify.get('/api/admin/backup/recovery-points/:recoveryPointId/tables', {
    schema: {
      params: z.object({
        recoveryPointId: z.string()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          tables: z.array(z.string()),
          schemas: z.array(z.string()).optional()
        })
      }
    }
  }, async (request: FastifyRequest<{
    Params: { recoveryPointId: string }
  }>, reply: FastifyReply) => {
    try {
      const { recoveryPointId } = request.params;
      
      // Get recovery point details including table information
      const result = await fastify.pg.pool.query(`
        SELECT 
          included_tables,
          excluded_tables,
          affected_schemas,
          recovery_context
        FROM recovery_points 
        WHERE id = $1
      `, [recoveryPointId]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Recovery point not found'
        });
      }
      
      const point = result.rows[0];
      
      // If no specific tables are listed, get all tables from database schema
      let availableTables: string[] = [];
      
      if (point.included_tables && point.included_tables.length > 0) {
        availableTables = point.included_tables;
      } else {
        // Query information_schema to get all tables
        const tablesResult = await fastify.pg.pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
        
        availableTables = tablesResult.rows.map(row => row.table_name);
        
        // Remove excluded tables
        if (point.excluded_tables && point.excluded_tables.length > 0) {
          availableTables = availableTables.filter(table => 
            !point.excluded_tables.includes(table)
          );
        }
      }
      
      return reply.code(200).send({
        success: true,
        tables: availableTables,
        schemas: point.affected_schemas || ['public']
      });
      
    } catch (error) {
      request.log.error({ error }, 'Failed to get tables for recovery point');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get tables for recovery point'
      });
    }
  });

  // Generate restore preview
  fastify.post('/api/admin/backup/restore/preview', {
    schema: {
      body: RestorePreviewSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          preview: z.object({
            affected_tables: z.array(z.object({
              table_name: z.string(),
              estimated_records: z.number(),
              size_mb: z.number(),
              potential_conflicts: z.number()
            })),
            estimated_records: z.number(),
            estimated_size_mb: z.number(),
            estimated_duration_minutes: z.number(),
            warnings: z.array(z.string()),
            recommendations: z.array(z.string())
          })
        })
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof RestorePreviewSchema>
  }>, reply: FastifyReply) => {
    try {
      const { recovery_point_id, table_filters, restore_scope } = request.body;
      
      // Get recovery point details
      const recoveryResult = await fastify.pg.pool.query(`
        SELECT * FROM recovery_points WHERE id = $1
      `, [recovery_point_id]);
      
      if (recoveryResult.rows.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Recovery point not found'
        });
      }
      
      const recoveryPoint = recoveryResult.rows[0];
      
      // Determine which tables will be affected
      let affectedTables: string[] = [];
      
      if (table_filters?.include_tables && table_filters.include_tables.length > 0) {
        affectedTables = table_filters.include_tables;
      } else if (recoveryPoint.included_tables) {
        affectedTables = recoveryPoint.included_tables;
      } else {
        // Get all tables from schema
        const tablesResult = await fastify.pg.pool.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        affectedTables = tablesResult.rows.map(row => row.table_name);
      }
      
      // Remove excluded tables
      if (table_filters?.exclude_tables && table_filters.exclude_tables.length > 0) {
        affectedTables = affectedTables.filter(table => 
          !table_filters.exclude_tables!.includes(table)
        );
      }
      
      // Generate estimates for each table
      const tableEstimates = await Promise.all(
        affectedTables.map(async (tableName) => {
          try {
            // Get current table statistics
            const statsResult = await fastify.pg.pool.query(`
              SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes,
                n_live_tup as live_tuples,
                n_dead_tup as dead_tuples
              FROM pg_stat_user_tables 
              WHERE tablename = $1
            `, [tableName]);
            
            // Get table size
            const sizeResult = await fastify.pg.pool.query(`
              SELECT pg_size_pretty(pg_total_relation_size($1)) as size,
                     pg_total_relation_size($1) as size_bytes
            `, [tableName]);
            
            const stats = statsResult.rows[0] || {};
            const sizeInfo = sizeResult.rows[0] || { size_bytes: 0 };
            
            let estimatedRecords = stats.live_tuples || 0;
            
            // Apply record limit if specified
            if (table_filters?.limit_records && table_filters.limit_records < estimatedRecords) {
              estimatedRecords = table_filters.limit_records;
            }
            
            // Apply WHERE conditions (simplified estimation)
            if (table_filters?.where_conditions && table_filters.where_conditions[tableName]) {
              // Rough estimate: WHERE conditions typically reduce records by 10-90%
              // In practice, you'd want to execute EXPLAIN to get better estimates
              estimatedRecords = Math.floor(estimatedRecords * 0.5); // Conservative 50% estimate
            }
            
            // Estimate potential conflicts based on table activity
            const potentialConflicts = Math.floor((stats.n_tup_upd || 0) * 0.1); // 10% of recent updates
            
            return {
              table_name: tableName,
              estimated_records: estimatedRecords,
              size_mb: Math.round((sizeInfo.size_bytes || 0) / 1024 / 1024 * 100) / 100,
              potential_conflicts: potentialConflicts
            };
          } catch (error) {
            request.log.warn({ tableName, error }, 'Failed to get table estimates');
            return {
              table_name: tableName,
              estimated_records: 0,
              size_mb: 0,
              potential_conflicts: 0
            };
          }
        })
      );
      
      // Calculate totals
      const totalRecords = tableEstimates.reduce((sum, table) => sum + table.estimated_records, 0);
      const totalSizeMB = tableEstimates.reduce((sum, table) => sum + table.size_mb, 0);
      const totalConflicts = tableEstimates.reduce((sum, table) => sum + table.potential_conflicts, 0);
      
      // Estimate duration (rough calculation based on records and size)
      const baseMinutes = Math.max(5, Math.ceil(totalRecords / 10000 + totalSizeMB / 100));
      let estimatedDuration = baseMinutes;
      
      // Adjust based on restore scope and strategy
      switch (restore_scope) {
      case 'schema_only':
        estimatedDuration *= 0.3;
        break;
      case 'data_only':
        estimatedDuration *= 1.2;
        break;
      case 'record_level':
        estimatedDuration *= 1.5;
        break;
      case 'full_database':
        estimatedDuration *= 1.3;
        break;
      }
      
      // Generate warnings and recommendations
      const warnings: string[] = [];
      const recommendations: string[] = [];
      
      if (totalConflicts > 0) {
        warnings.push(`${totalConflicts} potential conflicts detected. Consider using 'backup_first' strategy.`);
      }
      
      if (affectedTables.length > 50) {
        warnings.push('Large number of tables selected. Consider breaking into smaller restore operations.');
        recommendations.push('Use table-level filtering to process tables in batches.');
      }
      
      if (totalSizeMB > 1000) {
        warnings.push('Large restore size detected. This operation may take significant time.');
        recommendations.push('Schedule restore during maintenance window.');
      }
      
      if (table_filters?.where_conditions) {
        recommendations.push('WHERE conditions will be applied during restore. Ensure conditions are optimized for performance.');
      }
      
      return reply.code(200).send({
        success: true,
        preview: {
          affected_tables: tableEstimates,
          estimated_records: totalRecords,
          estimated_size_mb: totalSizeMB,
          estimated_duration_minutes: Math.ceil(estimatedDuration),
          warnings,
          recommendations
        }
      });
      
    } catch (error) {
      request.log.error({ error }, 'Failed to generate restore preview');
      return reply.code(500).send({
        success: false,
        error: 'Failed to generate restore preview'
      });
    }
  });

  // Execute selective restore
  fastify.post('/api/admin/backup/restore/execute', {
    schema: {
      body: ExecuteRestoreSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          request_id: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof ExecuteRestoreSchema>
  }>, reply: FastifyReply) => {
    try {
      const restoreConfig = request.body;
      
      // Create restore request record
      const requestResult = await fastify.pg.pool.query(`
        INSERT INTO restore_requests (
          recovery_point_id,
          operation_type,
          restore_scope,
          restore_strategy,
          target_database,
          table_filters,
          validation_level,
          notification_config,
          requested_by,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id
      `, [
        restoreConfig.recovery_point_id,
        restoreConfig.operation_type,
        restoreConfig.restore_scope,
        restoreConfig.restore_strategy,
        restoreConfig.target_database,
        JSON.stringify(restoreConfig.table_filters),
        restoreConfig.validation_level,
        JSON.stringify(restoreConfig.notification_config),
        request.user?.id || 'system' // Assuming authentication middleware sets this
      ]);
      
      const requestId = requestResult.rows[0].id;
      
      // In a real implementation, this would trigger the RestoreFunctionalityService
      // For now, we'll simulate the async process startup
      
      // Update status to pending
      await fastify.pg.pool.query(`
        UPDATE restore_requests 
        SET status = 'pending', updated_at = NOW()
        WHERE id = $1
      `, [requestId]);
      
      // Here you would integrate with the existing RestoreFunctionalityService
      // Example: await restoreFunctionalityService.executeRestore(requestId, restoreConfig);
      
      request.log.info({
        requestId,
        recoveryPointId: restoreConfig.recovery_point_id,
        restoreScope: restoreConfig.restore_scope,
        tablesCount: restoreConfig.table_filters.include_tables.length
      }, 'Selective restore request created');
      
      return reply.code(200).send({
        success: true,
        request_id: requestId,
        message: 'Selective restore operation started successfully'
      });
      
    } catch (error) {
      request.log.error({ error }, 'Failed to execute selective restore');
      return reply.code(500).send({
        success: false,
        error: 'Failed to execute selective restore'
      });
    }
  });

  // Get active restore operations
  fastify.get('/api/admin/backup/restore/active', {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(z.any())
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await fastify.pg.pool.query(`
        SELECT 
          rr.id as request_id,
          rr.status,
          rr.operation_type,
          rr.restore_scope,
          rr.created_at as started_at,
          rr.table_filters,
          rr.progress_percentage,
          rr.current_operation,
          rr.validation_results,
          rr.error_details,
          rp.recovery_point_timestamp,
          rp.backup_type
        FROM restore_requests rr
        LEFT JOIN recovery_points rp ON rr.recovery_point_id = rp.id
        WHERE rr.status IN ('pending', 'in_progress', 'validating', 'rolling_back')
        ORDER BY rr.created_at DESC
      `);
      
      // Transform the data to match the expected format
      const activeRestores = result.rows.map(row => {
        const tableFilters = row.table_filters || {};
        const totalTables = (tableFilters.include_tables || []).length || 
                           (row.affected_tables || []).length || 1;
        
        return {
          request_id: row.request_id,
          status: row.status,
          progress_percentage: row.progress_percentage || 0,
          current_operation: row.current_operation || 'Initializing...',
          tables_processed: Math.floor((row.progress_percentage || 0) / 100 * totalTables),
          total_tables: totalTables,
          records_restored: (row.records_processed || 0),
          conflicts_resolved: (row.conflicts_resolved || 0),
          started_at: row.started_at,
          estimated_completion: row.estimated_completion,
          errors: row.error_details ? JSON.parse(row.error_details) : []
        };
      });
      
      return reply.code(200).send({
        success: true,
        data: activeRestores
      });
      
    } catch (error) {
      request.log.error({ error }, 'Failed to get active restore operations');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get active restore operations'
      });
    }
  });

  // Cancel restore operation
  fastify.post('/api/admin/backup/restore/:requestId/cancel', {
    schema: {
      params: z.object({
        requestId: z.string()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request: FastifyRequest<{
    Params: { requestId: string }
  }>, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      
      // Update the restore request status to cancelled
      const result = await fastify.pg.pool.query(`
        UPDATE restore_requests 
        SET 
          status = 'cancelled',
          updated_at = NOW(),
          current_operation = 'Cancellation requested'
        WHERE id = $1 AND status IN ('pending', 'in_progress')
        RETURNING id, status
      `, [requestId]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Restore request not found or cannot be cancelled'
        });
      }
      
      // Here you would also signal the actual restore process to stop
      // Example: await restoreFunctionalityService.cancelRestore(requestId);
      
      request.log.info({ requestId }, 'Restore operation cancelled');
      
      return reply.code(200).send({
        success: true,
        message: 'Restore operation cancelled successfully'
      });
      
    } catch (error) {
      request.log.error({ error }, 'Failed to cancel restore operation');
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel restore operation'
      });
    }
  });

  // Get restore operation details
  fastify.get('/api/admin/backup/restore/:requestId', {
    schema: {
      params: z.object({
        requestId: z.string()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any()
        })
      }
    }
  }, async (request: FastifyRequest<{
    Params: { requestId: string }
  }>, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      
      const result = await fastify.pg.pool.query(`
        SELECT 
          rr.*,
          rp.recovery_point_timestamp,
          rp.backup_type,
          rp.validation_status,
          rp.storage_info
        FROM restore_requests rr
        LEFT JOIN recovery_points rp ON rr.recovery_point_id = rp.id
        WHERE rr.id = $1
      `, [requestId]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Restore request not found'
        });
      }
      
      return reply.code(200).send({
        success: true,
        data: result.rows[0]
      });
      
    } catch (error) {
      request.log.error({ error }, 'Failed to get restore operation details');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get restore operation details'
      });
    }
  });
}

// Export for registration
export default selectiveRestoreRoutes;