/**
 * Recovery Automation API Routes - Epic 17
 * 
 * RESTful API endpoints for automated recovery system management
 * for Epic 17 - Backstage Admin Controls.
 * 
 * Task: E17-1753114397258-697892 - Create recovery automation
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  RecoveryAutomationService,
  RecoveryAutomationRule,
  RecoveryAutomationExecution,
  RecoveryTriggerType,
  RecoveryStrategy,
  RecoveryUrgency,
  RecoveryAutomationStatus
} from '../admin/RecoveryAutomationService';
import { Database } from '../database/connection';

// Request type definitions
interface CreateRecoveryRuleRequest {
  Body: {
    name: string;
    description?: string;
    trigger_type: RecoveryTriggerType;
    trigger_conditions: Record<string, any>;
    recovery_strategy: RecoveryStrategy;
    urgency: RecoveryUrgency;
    auto_execute: boolean;
    max_attempts: number;
    cooldown_period: number;
    notification_recipients: string[];
    escalation_policy: {
      escalate_after_minutes: number;
      escalation_recipients: string[];
      escalation_actions: string[];
    };
  };
}

interface UpdateRecoveryRuleRequest {
  Params: {
    ruleId: string;
  };
  Body: Partial<CreateRecoveryRuleRequest['Body']>;
}

interface GetRecoveryRuleRequest {
  Params: {
    ruleId: string;
  };
}

interface ListRecoveryRulesRequest {
  Querystring: {
    enabled?: boolean;
    trigger_type?: RecoveryTriggerType;
    urgency?: RecoveryUrgency;
    page?: number;
    pageSize?: number;
  };
}

interface TriggerRecoveryRequest {
  Body: {
    trigger_type: RecoveryTriggerType;
    trigger_details: {
      detected_at: string;
      trigger_source: string;
      severity: string;
      affected_components: string[];
      metrics?: Record<string, any>;
      error_details?: string;
    };
  };
}

interface GetRecoveryExecutionRequest {
  Params: {
    executionId: string;
  };
}

interface ListRecoveryExecutionsRequest {
  Querystring: {
    status?: RecoveryAutomationStatus;
    trigger_type?: RecoveryTriggerType;
    urgency?: RecoveryUrgency;
    rule_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    pageSize?: number;
  };
}

interface GetRecoveryAnalyticsRequest {
  Querystring: {
    start_date: string;
    end_date: string;
  };
}

export async function recoveryAutomationRoutes(fastify: FastifyInstance) {
  // Initialize Recovery Automation Service
  const db = new Database();
  const recoveryService = new RecoveryAutomationService(
    db,
    fastify.auditService,
    fastify.pointInTimeRecoveryService,
    fastify.restoreFunctionalityService
  );

  // ==========================================
  // RECOVERY RULE MANAGEMENT ENDPOINTS
  // ==========================================

  // Create Recovery Rule
  fastify.post<CreateRecoveryRuleRequest>('/recovery-automation/rules', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:manage')],
    schema: {
      description: 'Create a new recovery automation rule',
      tags: ['Recovery Automation'],
      body: {
        type: 'object',
        required: ['name', 'trigger_type', 'trigger_conditions', 'recovery_strategy', 'urgency'],
        properties: {
          name: { type: 'string', maxLength: 500 },
          description: { type: 'string' },
          trigger_type: { 
            type: 'string', 
            enum: ['system_failure', 'data_corruption', 'performance_degradation', 
              'security_incident', 'compliance_violation', 'scheduled_maintenance', 
              'manual_trigger', 'cascade_failure']
          },
          trigger_conditions: { type: 'object' },
          recovery_strategy: { 
            type: 'string', 
            enum: ['immediate_rollback', 'selective_recovery', 'phased_recovery',
              'full_system_recovery', 'failover_recovery', 'hybrid_recovery']
          },
          urgency: { 
            type: 'string', 
            enum: ['critical', 'high', 'medium', 'low', 'maintenance']
          },
          auto_execute: { type: 'boolean', default: false },
          max_attempts: { type: 'integer', minimum: 1, maximum: 10, default: 3 },
          cooldown_period: { type: 'integer', minimum: 0, default: 300 },
          notification_recipients: { 
            type: 'array', 
            items: { type: 'string', format: 'email' }
          },
          escalation_policy: {
            type: 'object',
            required: ['escalate_after_minutes', 'escalation_recipients', 'escalation_actions'],
            properties: {
              escalate_after_minutes: { type: 'integer', minimum: 1 },
              escalation_recipients: { 
                type: 'array', 
                items: { type: 'string', format: 'email' }
              },
              escalation_actions: { 
                type: 'array', 
                items: { type: 'string' }
              }
            }
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            rule: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      const rule = await recoveryService.createRecoveryRule(request.body, user.id);

      reply.code(201).send({
        success: true,
        rule,
        message: 'Recovery rule created successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create recovery rule'
      });
    }
  });

  // Update Recovery Rule
  fastify.put<UpdateRecoveryRuleRequest>('/recovery-automation/rules/:ruleId', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:manage')],
    schema: {
      description: 'Update an existing recovery automation rule',
      tags: ['Recovery Automation'],
      params: {
        type: 'object',
        properties: {
          ruleId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            rule: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { ruleId } = request.params;
      const rule = await recoveryService.updateRecoveryRule(ruleId, request.body, user.id);

      reply.send({
        success: true,
        rule,
        message: 'Recovery rule updated successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      reply.code(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recovery rule'
      });
    }
  });

  // Get Recovery Rule
  fastify.get<GetRecoveryRuleRequest>('/recovery-automation/rules/:ruleId', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:view')],
    schema: {
      description: 'Get details of a specific recovery automation rule',
      tags: ['Recovery Automation'],
      params: {
        type: 'object',
        properties: {
          ruleId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            rule: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { ruleId } = request.params;
      const rule = await recoveryService.getRecoveryRule(ruleId);

      if (!rule) {
        reply.code(404).send({
          success: false,
          error: 'Recovery rule not found'
        });
        return;
      }

      reply.send({
        success: true,
        rule
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recovery rule'
      });
    }
  });

  // List Recovery Rules
  fastify.get<ListRecoveryRulesRequest>('/recovery-automation/rules', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:view')],
    schema: {
      description: 'List recovery automation rules with optional filters',
      tags: ['Recovery Automation'],
      querystring: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          trigger_type: { 
            type: 'string', 
            enum: ['system_failure', 'data_corruption', 'performance_degradation', 
              'security_incident', 'compliance_violation', 'scheduled_maintenance', 
              'manual_trigger', 'cascade_failure']
          },
          urgency: { 
            type: 'string', 
            enum: ['critical', 'high', 'medium', 'low', 'maintenance']
          },
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            rules: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { enabled, trigger_type, urgency, page = 1, pageSize = 20 } = request.query;
      
      const rules = await recoveryService.listRecoveryRules({
        enabled,
        trigger_type,
        urgency
      });

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRules = rules.slice(startIndex, endIndex);

      reply.send({
        success: true,
        rules: paginatedRules,
        pagination: {
          page,
          pageSize,
          total: rules.length,
          totalPages: Math.ceil(rules.length / pageSize)
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list recovery rules'
      });
    }
  });

  // ==========================================
  // RECOVERY EXECUTION ENDPOINTS
  // ==========================================

  // Trigger Recovery
  fastify.post<TriggerRecoveryRequest>('/recovery-automation/trigger', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:execute')],
    schema: {
      description: 'Manually trigger a recovery process',
      tags: ['Recovery Automation'],
      body: {
        type: 'object',
        required: ['trigger_type', 'trigger_details'],
        properties: {
          trigger_type: { 
            type: 'string', 
            enum: ['system_failure', 'data_corruption', 'performance_degradation', 
              'security_incident', 'compliance_violation', 'scheduled_maintenance', 
              'manual_trigger', 'cascade_failure']
          },
          trigger_details: {
            type: 'object',
            required: ['detected_at', 'trigger_source', 'severity', 'affected_components'],
            properties: {
              detected_at: { type: 'string', format: 'date-time' },
              trigger_source: { type: 'string' },
              severity: { type: 'string' },
              affected_components: { 
                type: 'array', 
                items: { type: 'string' }
              },
              metrics: { type: 'object' },
              error_details: { type: 'string' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            execution_id: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user;
      const { trigger_type, trigger_details } = request.body;

      // Convert string date to Date object
      const processedTriggerDetails = {
        ...trigger_details,
        detected_at: new Date(trigger_details.detected_at)
      };

      const execution_id = await recoveryService.triggerRecovery(
        trigger_type,
        processedTriggerDetails,
        user.id
      );

      reply.send({
        success: true,
        execution_id,
        message: 'Recovery process triggered successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger recovery'
      });
    }
  });

  // Get Recovery Execution
  fastify.get<GetRecoveryExecutionRequest>('/recovery-automation/executions/:executionId', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:view')],
    schema: {
      description: 'Get details of a specific recovery execution',
      tags: ['Recovery Automation'],
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            execution: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { executionId } = request.params;
      const execution = await recoveryService.getRecoveryExecution(executionId);

      if (!execution) {
        reply.code(404).send({
          success: false,
          error: 'Recovery execution not found'
        });
        return;
      }

      reply.send({
        success: true,
        execution
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recovery execution'
      });
    }
  });

  // List Recovery Executions
  fastify.get<ListRecoveryExecutionsRequest>('/recovery-automation/executions', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:view')],
    schema: {
      description: 'List recovery executions with optional filters',
      tags: ['Recovery Automation'],
      querystring: {
        type: 'object',
        properties: {
          status: { 
            type: 'string', 
            enum: ['monitoring', 'analyzing', 'preparing', 'executing', 'validating',
              'completed', 'failed', 'requires_intervention', 'cancelled']
          },
          trigger_type: { 
            type: 'string', 
            enum: ['system_failure', 'data_corruption', 'performance_degradation', 
              'security_incident', 'compliance_violation', 'scheduled_maintenance', 
              'manual_trigger', 'cascade_failure']
          },
          urgency: { 
            type: 'string', 
            enum: ['critical', 'high', 'medium', 'low', 'maintenance']
          },
          rule_id: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            executions: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { 
        status, trigger_type, urgency, rule_id, start_date, end_date, 
        page = 1, pageSize = 20 
      } = request.query;

      const executions = await recoveryService.listRecoveryExecutions({
        status,
        trigger_type,
        urgency,
        rule_id,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined
      });

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedExecutions = executions.slice(startIndex, endIndex);

      reply.send({
        success: true,
        executions: paginatedExecutions,
        pagination: {
          page,
          pageSize,
          total: executions.length,
          totalPages: Math.ceil(executions.length / pageSize)
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list recovery executions'
      });
    }
  });

  // ==========================================
  // RECOVERY CONTROL ENDPOINTS
  // ==========================================

  // Cancel Recovery
  fastify.post('/recovery-automation/executions/:executionId/cancel', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:manage')],
    schema: {
      description: 'Cancel an active recovery execution',
      tags: ['Recovery Automation'],
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { executionId } = request.params;
      const user = request.user;

      await recoveryService.cancelRecovery(executionId, user.id);

      reply.send({
        success: true,
        message: 'Recovery execution cancelled successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      reply.code(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel recovery execution'
      });
    }
  });

  // Retry Recovery
  fastify.post('/recovery-automation/executions/:executionId/retry', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:execute')],
    schema: {
      description: 'Retry a failed recovery execution',
      tags: ['Recovery Automation'],
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            execution_id: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { executionId } = request.params;
      const user = request.user;

      const new_execution_id = await recoveryService.retryRecovery(executionId, user.id);

      reply.send({
        success: true,
        execution_id: new_execution_id,
        message: 'Recovery execution retried successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      reply.code(statusCode).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retry recovery execution'
      });
    }
  });

  // ==========================================
  // MONITORING AND ANALYTICS ENDPOINTS
  // ==========================================

  // Get Recovery Analytics
  fastify.get<GetRecoveryAnalyticsRequest>('/recovery-automation/analytics', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:view')],
    schema: {
      description: 'Get recovery automation analytics and metrics',
      tags: ['Recovery Automation'],
      querystring: {
        type: 'object',
        required: ['start_date', 'end_date'],
        properties: {
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            analytics: { type: 'object' },
            period: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { start_date, end_date } = request.query;
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      const analytics = await recoveryService.getRecoveryAnalytics(startDate, endDate);

      reply.send({
        success: true,
        analytics,
        period: {
          start: start_date,
          end: end_date
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recovery analytics'
      });
    }
  });

  // Get System Health
  fastify.get('/recovery-automation/health', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:view')],
    schema: {
      description: 'Get recovery automation system health status',
      tags: ['Recovery Automation'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            health: {
              type: 'object',
              properties: {
                monitoring_active: { type: 'boolean' },
                active_recoveries: { type: 'integer' },
                system_status: { type: 'string' },
                last_check: { type: 'string', format: 'date-time' },
                alerts: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const health = await recoveryService.getSystemHealth();

      reply.send({
        success: true,
        health
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get system health'
      });
    }
  });

  // Start/Stop Monitoring
  fastify.post('/recovery-automation/monitoring/:action', {
    preHandler: [fastify.authenticate, fastify.requirePermission('recovery:manage')],
    schema: {
      description: 'Start or stop recovery automation monitoring',
      tags: ['Recovery Automation'],
      params: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['start', 'stop'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { action } = request.params;
      const user = request.user;

      if (action === 'start') {
        await recoveryService.startMonitoring();
      } else {
        await recoveryService.stopMonitoring();
      }

      await fastify.auditService.logActivity(`recovery_monitoring_${action}`, user.id, {
        action
      });

      reply.send({
        success: true,
        message: `Recovery automation monitoring ${action}ed successfully`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : `Failed to ${request.params.action} monitoring`
      });
    }
  });
}

export default recoveryAutomationRoutes;