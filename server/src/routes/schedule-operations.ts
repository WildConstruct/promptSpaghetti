/**
 * Schedule Operations API Routes
 * Epic 17.1.5 - Feature Toggle Scheduling System
 * Routes for schedule cancellation and modification operations
 */

import { FastifyPluginAsync } from 'fastify';
import {
  ScheduleCancellationService,
  CancellationRequest,
  BulkCancellationRequest,
} from '../services/ScheduleCancellationService';
import {
  ScheduleModificationService,
  ModificationRequest,
  BatchModificationRequest,
} from '../services/ScheduleModificationService';
import { SchedulingDAO } from '../database/scheduling-dao';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';

// Initialize services
const schedulingDAO = new SchedulingDAO();
const featureToggleDAO = new FeatureToggleDAO();
const cancellationService = new ScheduleCancellationService(schedulingDAO, featureToggleDAO);
const modificationService = new ScheduleModificationService(schedulingDAO, featureToggleDAO);

const scheduleOperationsRoutes: FastifyPluginAsync = async fastify => {
  // Schedule Cancellation Routes

  // Cancel single schedule
  fastify.post<{
    Body: {
      scheduleId: string;
      reason: string;
      mode?: 'immediate' | 'graceful' | 'after_completion' | 'scheduled';
      comment?: string;
      scheduledTime?: string;
      rollbackPreviousExecutions?: boolean;
    };
  }>('/schedules/:scheduleId/cancel', async (request, reply) => {
    try {
      const { scheduleId } = request.params as { scheduleId: string };
      const { reason, mode, comment, scheduledTime, rollbackPreviousExecutions } = request.body;

      const result = await cancellationService.cancelSchedule({
        scheduleId,
        reason: reason as any,
        mode: mode || 'immediate',
        comment,
        rollbackPreviousExecutions: rollbackPreviousExecutions || false,
        cancelledBy: request.user?.id || 'system',
      });

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Schedule cancellation failed:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'CANCELLATION_FAILED',
          message: error instanceof Error ? error.message : 'Schedule cancellation failed',
        },
      });
    }
  });

  // Cancel multiple schedules
  fastify.post<{
    Body: CancellationRequest;
  }>('/schedules/cancel-multiple', async (request, reply) => {
    try {
      const cancellationRequest = {
        ...request.body,
        cancelledBy: request.user?.id || 'system',
      };

      const results = await cancellationService.cancelMultipleSchedules(cancellationRequest);

      reply.code(200).send({
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
          },
        },
      });
    } catch (error) {
      fastify.log.error('Bulk cancellation failed:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'BULK_CANCELLATION_FAILED',
          message: error instanceof Error ? error.message : 'Bulk cancellation failed',
        },
      });
    }
  });

  // Bulk cancel schedules with filters
  fastify.post<{
    Body: BulkCancellationRequest;
  }>('/schedules/bulk-cancel', async (request, reply) => {
    try {
      const bulkRequest = {
        ...request.body,
        cancelledBy: request.user?.id || 'system',
      };

      const result = await cancellationService.bulkCancelSchedules(bulkRequest);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Bulk cancel operation failed:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'BULK_CANCEL_FAILED',
          message: error instanceof Error ? error.message : 'Bulk cancel operation failed',
        },
      });
    }
  });

  // Schedule Modification Routes

  // Modify single schedule
  fastify.post<{
    Body: ModificationRequest;
  }>('/schedules/:scheduleId/modify', async (request, reply) => {
    try {
      const { scheduleId } = request.params as { scheduleId: string };
      const modificationRequest = {
        ...request.body,
        scheduleId,
        requestedBy: request.user?.id || 'system',
      };

      const result = await modificationService.modifySchedule(modificationRequest);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Schedule modification failed:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'MODIFICATION_FAILED',
          message: error instanceof Error ? error.message : 'Schedule modification failed',
        },
      });
    }
  });

  // Modify multiple schedules
  fastify.post<{
    Body: BatchModificationRequest;
  }>('/schedules/modify-batch', async (request, reply) => {
    try {
      const batchRequest = {
        ...request.body,
        requestedBy: request.user?.id || 'system',
      };

      const result = await modificationService.modifyMultipleSchedules(batchRequest);

      reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error('Batch modification failed:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'BATCH_MODIFICATION_FAILED',
          message: error instanceof Error ? error.message : 'Batch modification failed',
        },
      });
    }
  });

  // Get modification impact analysis
  fastify.post<{
    Body: {
      scheduleId: string;
      changes: Record<string, any>;
      modificationType: string;
    };
  }>('/schedules/:scheduleId/analyze-modification', async (request, reply) => {
    try {
      const { scheduleId } = request.params as { scheduleId: string };
      const { changes, modificationType } = request.body;

      // Get the schedule first
      const schedule = await schedulingDAO.getSchedule(scheduleId);
      if (!schedule) {
        return reply.code(404).send({
          success: false,
          error: { code: 'SCHEDULE_NOT_FOUND', message: 'Schedule not found' },
        });
      }

      const mockRequest = {
        scheduleId,
        modificationType: modificationType as any,
        changes,
        reason: 'Analysis request',
        requestedBy: request.user?.id || 'system',
      };

      const analysis = await modificationService.analyzeModificationImpact(schedule, mockRequest);

      reply.code(200).send({
        success: true,
        data: analysis,
      });
    } catch (error) {
      fastify.log.error('Impact analysis failed:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error instanceof Error ? error.message : 'Impact analysis failed',
        },
      });
    }
  });

  // Get modification history for a schedule
  fastify.get<{
    Params: { scheduleId: string };
  }>('/schedules/:scheduleId/modification-history', async (request, reply) => {
    try {
      const { scheduleId } = request.params;

      const history = await modificationService.getModificationHistory(scheduleId);

      reply.code(200).send({
        success: true,
        data: history,
      });
    } catch (error) {
      fastify.log.error('Failed to get modification history:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'HISTORY_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get modification history',
        },
      });
    }
  });

  // Utility Routes

  // Get cancellation reasons (for UI dropdowns)
  fastify.get('/schedules/cancellation-reasons', async (request, reply) => {
    reply.code(200).send({
      success: true,
      data: [
        { value: 'user_requested', label: 'User Requested', description: 'Manually cancelled by user' },
        { value: 'schedule_conflict', label: 'Schedule Conflict', description: 'Conflicts with other schedules' },
        { value: 'emergency_stop', label: 'Emergency Stop', description: 'Emergency cancellation' },
        { value: 'business_requirement', label: 'Business Requirement', description: 'Business requirement change' },
        { value: 'technical_issue', label: 'Technical Issue', description: 'Technical problem detected' },
        { value: 'compliance_violation', label: 'Compliance Violation', description: 'Compliance policy violation' },
        { value: 'resource_unavailable', label: 'Resource Unavailable', description: 'Required resources unavailable' },
        { value: 'policy_change', label: 'Policy Change', description: 'Organization policy change' },
        { value: 'maintenance_window', label: 'Maintenance Window', description: 'System maintenance required' },
        { value: 'rollback_request', label: 'Rollback Request', description: 'Rollback to previous state' },
      ],
    });
  });

  // Get modification types (for UI dropdowns)
  fastify.get('/schedules/modification-types', async (request, reply) => {
    reply.code(200).send({
      success: true,
      data: [
        { value: 'time_change', label: 'Time Change', description: 'Change start/end times' },
        { value: 'recurrence_change', label: 'Recurrence Change', description: 'Modify recurrence pattern' },
        { value: 'action_change', label: 'Action Change', description: 'Change the action performed' },
        { value: 'config_change', label: 'Config Change', description: 'Modify action configuration' },
        { value: 'priority_change', label: 'Priority Change', description: 'Adjust execution priority' },
        { value: 'metadata_change', label: 'Metadata Change', description: 'Update metadata/tags' },
        { value: 'enable_disable', label: 'Enable/Disable', description: 'Enable/disable schedule' },
        { value: 'reschedule', label: 'Reschedule', description: 'Move to different time' },
        { value: 'extend', label: 'Extend', description: 'Extend end time' },
        { value: 'truncate', label: 'Truncate', description: 'Reduce end time' },
      ],
    });
  });

  // Validate schedule operations (dry-run check)
  fastify.post<{
    Body: {
      operation: 'cancel' | 'modify';
      scheduleIds: string[];
      parameters: Record<string, any>;
    };
  }>('/schedules/validate-operation', async (request, reply) => {
    try {
      const { operation, scheduleIds, parameters } = request.body;
      const userId = request.user?.id || 'system';

      const validationResults = [];

      for (const scheduleId of scheduleIds) {
        const schedule = await schedulingDAO.getSchedule(scheduleId);
        if (!schedule) {
          validationResults.push({
            scheduleId,
            valid: false,
            error: 'Schedule not found',
          });
          continue;
        }

        // Basic validation
        let valid = true;
        let error = '';

        if (operation === 'cancel') {
          if (schedule.status === 'cancelled') {
            valid = false;
            error = 'Schedule is already cancelled';
          } else if (schedule.status === 'completed') {
            valid = false;
            error = 'Cannot cancel completed schedule';
          }
        } else if (operation === 'modify') {
          if (schedule.status === 'cancelled') {
            valid = false;
            error = 'Cannot modify cancelled schedule';
          } else if (schedule.status === 'completed') {
            valid = false;
            error = 'Cannot modify completed schedule';
          }
        }

        validationResults.push({
          scheduleId,
          scheduleName: schedule.name,
          currentStatus: schedule.status,
          valid,
          error: valid ? undefined : error,
          warnings: valid ? [] : undefined,
        });
      }

      reply.code(200).send({
        success: true,
        data: {
          operation,
          totalSchedules: scheduleIds.length,
          validSchedules: validationResults.filter(r => r.valid).length,
          invalidSchedules: validationResults.filter(r => !r.valid).length,
          results: validationResults,
        },
      });
    } catch (error) {
      fastify.log.error('Operation validation failed:', error);
      reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: error instanceof Error ? error.message : 'Operation validation failed',
        },
      });
    }
  });
};

export default scheduleOperationsRoutes;
