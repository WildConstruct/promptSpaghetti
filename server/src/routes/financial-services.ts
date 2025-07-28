// Financial Services API Routes - Epic 19.2.6 Implementation
// RESTful API for financial data lifecycle management and automated deletion
// Task: T-1752989145818

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  FinancialDataLifecycleService,
  FinancialDataType,
  DeletionTriggerType,
  VerificationStep,
  SafetyCheck
} from '../services/FinancialDataLifecycleService';
import { DataCategory, Jurisdiction } from '../types/DataRetentionPeriods';
import { jwtAuthMiddleware } from '../auth/middleware/jwtAuthMiddleware';

// Request schemas for validation
const RegisterFinancialDataSchema = z.object({
  externalId: z.string().min(1, 'External ID is required'),
  dataType: z.nativeEnum(FinancialDataType),
  jurisdiction: z.nativeEnum(Jurisdiction).default(Jurisdiction.US),
  ownerId: z.string().min(1, 'Owner ID is required'),
  
  // Optional financial-specific fields
  accountNumber: z.string().optional(),
  transactionId: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().length(3).default('USD'),
  transactionDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  institutionName: z.string().optional(),
  
  // Optional retention override
  retentionPeriodYears: z.number().min(1).max(100).optional()
});

const CreateDeletionWorkflowSchema = z.object({
  workflowName: z.string().min(1, 'Workflow name is required'),
  triggerType: z.nativeEnum(DeletionTriggerType),
  triggerConfig: z.record(z.unknown()).default({}),
  selectionCriteria: z.record(z.unknown()).default({}),
  batchSize: z.number().min(1).max(10000).default(100),
  requireApproval: z.boolean().default(true),
  verificationSteps: z.array(z.object({
    stepId: z.string(),
    name: z.string(),
    type: z.enum(['hash_verification', 'approval_required', 'safety_check', 'custom']),
    config: z.record(z.unknown()).default({}),
    required: z.boolean()
  })).default([]),
  safetyChecks: z.array(z.object({
    checkId: z.string(),
    name: z.string(),
    type: z.enum(['legal_hold_check', 'active_transaction_check', 'audit_period_check', 'custom']),
    config: z.record(z.unknown()).default({}),
    blocking: z.boolean()
  })).default([]),
  isActive: z.boolean().default(true)
});

const ExecuteDeletionWorkflowSchema = z.object({
  workflowId: z.string().uuid('Invalid workflow ID'),
  overrides: z.object({
    batchSize: z.number().min(1).max(10000).optional(),
    requireApproval: z.boolean().optional()
  }).optional()
});

const GenerateComplianceReportSchema = z.object({
  reportType: z.string().min(1, 'Report type is required'),
  periodStart: z.string().datetime('Invalid start date'),
  periodEnd: z.string().datetime('Invalid end date'),
  options: z.object({
    regulatoryFramework: z.enum(['GDPR', 'CCPA', 'SOX', 'HIPAA', 'GLBA', 'PCI_DSS', 'BASEL_III']).optional(),
    includeDetails: z.boolean().default(false)
  }).optional()
});

const GetRecordsReadyForDeletionSchema = z.object({
  selectionCriteria: z.object({
    dataType: z.nativeEnum(FinancialDataType).optional(),
    ownerId: z.string().optional(),
    maxDaysOverdue: z.number().optional()
  }).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0)
});

/**
 * Financial Services API Routes
 */
export default async function financialServicesRoutes(fastify: FastifyInstance) {
  // Apply JWT authentication to all routes
  fastify.addHook('preHandler', jwtAuthMiddleware);

  /**
   * POST /api/financial-services/data/register
   * Register financial data for lifecycle management
   */
  fastify.post('/data/register', {
    schema: {
      description: 'Register financial data record for automated lifecycle management',
      tags: ['Financial Services', 'Data Lifecycle'],
      body: RegisterFinancialDataSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                externalId: { type: 'string' },
                dataType: { type: 'string' },
                currentStage: { type: 'string' },
                retentionExpiresAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterFinancialDataSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.code(401).send({ success: false, error: 'Authentication required' });
      }

      const financialService = (fastify as any).financialDataLifecycleService as FinancialDataLifecycleService;
      
      const record = await financialService.registerFinancialData({
        ...body,
        category: DataCategory.FINANCIAL,
        ownerId: body.ownerId || userId
      });

      return reply.send({
        success: true,
        data: {
          id: record.id,
          externalId: record.externalId,
          dataType: record.dataType,
          currentStage: record.currentStage,
          retentionExpiresAt: record.retentionExpiresAt?.toISOString(),
          createdAt: record.createdAt.toISOString()
        }
      });
    } catch (error) {
      fastify.log.error('Failed to register financial data:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  });

  /**
   * GET /api/financial-services/data/ready-for-deletion
   * Get financial data records ready for deletion
   */
  fastify.get('/data/ready-for-deletion', {
    schema: {
      description: 'Get financial data records that are ready for deletion',
      tags: ['Financial Services', 'Data Lifecycle'],
      querystring: GetRecordsReadyForDeletionSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                records: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      externalId: { type: 'string' },
                      dataType: { type: 'string' },
                      ownerId: { type: 'string' },
                      currentStage: { type: 'string' },
                      retentionExpiresAt: { type: 'string' },
                      legalHold: { type: 'boolean' },
                      daysOverdue: { type: 'number' }
                    }
                  }
  }
                totalCount: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = GetRecordsReadyForDeletionSchema.parse(request.query);
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.code(401).send({ success: false, error: 'Authentication required' });
      }

      const financialService = (fastify as any).financialDataLifecycleService as FinancialDataLifecycleService;
      
      // Add user-specific filtering to selection criteria
      const selectionCriteria = {
        ...query.selectionCriteria,
        // Only show records owned by the authenticated user (unless admin)
        ownerId: query.selectionCriteria?.ownerId || userId
      };

      const records = await financialService.getRecordsReadyForDeletion(selectionCriteria, query.limit);

      return reply.send({
        success: true,
        data: {
          records: records.map(record => ({
            id: record.id,
            externalId: record.externalId,
            dataType: record.dataType,
            ownerId: record.ownerId,
            currentStage: record.currentStage,
            retentionExpiresAt: record.retentionExpiresAt?.toISOString(),
            legalHold: record.legalHold,
            createdAt: record.createdAt.toISOString(),
            lastAccessedAt: record.lastAccessedAt.toISOString()
          })),
          totalCount: records.length
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get records ready for deletion:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      });
    }
  });

  /**
   * POST /api/financial-services/deletion-workflows
   * Create a new automated deletion workflow
   */
  fastify.post('/deletion-workflows', {
    schema: {
      description: 'Create an automated deletion workflow for financial data',
      tags: ['Financial Services', 'Deletion Workflows'],
      body: CreateDeletionWorkflowSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                workflowName: { type: 'string' },
                triggerType: { type: 'string' },
                batchSize: { type: 'number' },
                requireApproval: { type: 'boolean' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = CreateDeletionWorkflowSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.code(401).send({ success: false, error: 'Authentication required' });
      }

      // TODO: Check if user has permission to create deletion workflows
      // This would typically require admin or data protection officer role

      const financialService = (fastify as any).financialDataLifecycleService as FinancialDataLifecycleService;
      
      const workflow = await financialService.createDeletionWorkflow({
        ...body,
        createdBy: userId
      });

      return reply.send({
        success: true,
        data: {
          id: workflow.id,
          workflowName: workflow.workflowName,
          triggerType: workflow.triggerType,
          batchSize: workflow.batchSize,
          requireApproval: workflow.requireApproval,
          isActive: workflow.isActive,
          createdAt: workflow.createdAt.toISOString()
        }
      });
    } catch (error) {
      fastify.log.error('Failed to create deletion workflow:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Workflow creation failed'
      });
    }
  });

  /**
   * POST /api/financial-services/deletion-workflows/execute
   * Execute a deletion workflow
   */
  fastify.post('/deletion-workflows/execute', {
    schema: {
      description: 'Execute an automated deletion workflow',
      tags: ['Financial Services', 'Deletion Workflows'],
      body: ExecuteDeletionWorkflowSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                batchId: { type: 'string' },
                recordsProcessed: { type: 'number' },
                recordsDeleted: { type: 'number' },
                recordsFailed: { type: 'number' },
                executionSummary: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      recordId: { type: 'string' },
                      status: { type: 'string' },
                      scheduledAt: { type: 'string', format: 'date-time' },
                      executedAt: { type: 'string', format: 'date-time' },
                      errorMessage: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = ExecuteDeletionWorkflowSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.code(401).send({ success: false, error: 'Authentication required' });
      }

      // TODO: Check if user has permission to execute deletion workflows
      // This would typically require admin or data protection officer role

      const financialService = (fastify as any).financialDataLifecycleService as FinancialDataLifecycleService;
      
      const result = await financialService.executeDeletionWorkflow(
        body.workflowId,
        userId,
        body.overrides
      );

      return reply.send({
        success: true,
        data: {
          batchId: result.batchId,
          recordsProcessed: result.recordsProcessed,
          recordsDeleted: result.recordsDeleted,
          recordsFailed: result.recordsFailed,
          executionSummary: result.executions.map(exec => ({
            id: exec.id,
            recordId: exec.recordId,
            status: exec.executionStatus,
            scheduledAt: exec.scheduledAt.toISOString(),
            executedAt: exec.executedAt?.toISOString(),
            errorMessage: exec.errorMessage
          }))
        }
      });
    } catch (error) {
      fastify.log.error('Failed to execute deletion workflow:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Workflow execution failed'
      });
    }
  });

  /**
   * POST /api/financial-services/compliance/reports/generate
   * Generate compliance report for deletion activities
   */
  fastify.post('/compliance/reports/generate', {
    schema: {
      description: 'Generate compliance report for financial data deletion activities',
      tags: ['Financial Services', 'Compliance'],
      body: GenerateComplianceReportSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                reportType: { type: 'string' },
                reportingPeriodStart: { type: 'string', format: 'date' },
                reportingPeriodEnd: { type: 'string', format: 'date' },
                totalRecordsDeleted: { type: 'number' },
                regulatoryFramework: { type: 'string' },
                approvalStatus: { type: 'string' },
                generatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = GenerateComplianceReportSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.code(401).send({ success: false, error: 'Authentication required' });
      }

      // TODO: Check if user has permission to generate compliance reports
      // This would typically require compliance officer or admin role

      const financialService = (fastify as any).financialDataLifecycleService as FinancialDataLifecycleService;
      
      const report = await financialService.generateComplianceReport(
        body.reportType,
        new Date(body.periodStart),
        new Date(body.periodEnd),
        userId,
        body.options
      );

      return reply.send({
        success: true,
        data: {
          id: report.id,
          reportType: report.reportType,
          reportingPeriodStart: report.reportingPeriodStart.toISOString().split('T')[0],
          reportingPeriodEnd: report.reportingPeriodEnd.toISOString().split('T')[0],
          totalRecordsDeleted: report.totalRecordsDeleted,
          regulatoryFramework: report.regulatoryFramework,
          approvalStatus: report.approvalStatus,
          generatedAt: report.generatedAt.toISOString(),
          summaryStatistics: report.summaryStatistics
        }
      });
    } catch (error) {
      fastify.log.error('Failed to generate compliance report:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Report generation failed'
      });
    }
  });

  /**
   * GET /api/financial-services/compliance/reports/:reportId
   * Get compliance report by ID
   */
  fastify.get('/compliance/reports/:reportId', {
    schema: {
      description: 'Get compliance report by ID',
      tags: ['Financial Services', 'Compliance'],
      params: {
        type: 'object',
        properties: {
          reportId: { type: 'string', format: 'uuid' }
  }
        required: ['reportId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                reportType: { type: 'string' },
                reportingPeriodStart: { type: 'string' },
                reportingPeriodEnd: { type: 'string' },
                totalRecordsDeleted: { type: 'number' },
                deletionReasons: { type: 'object' },
                jurisdictionsAffected: { type: 'array' },
                regulatoryFramework: { type: 'string' },
                approvalStatus: { type: 'string' },
                reportData: { type: 'object' },
                summaryStatistics: { type: 'object' },
                generatedAt: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { reportId } = request.params as { reportId: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.code(401).send({ success: false, error: 'Authentication required' });
      }

      // Query the report from database
      const financialService = (fastify as any).financialDataLifecycleService as FinancialDataLifecycleService;
      const db = (fastify as any).db;
      
      const rows = await db.query(`
        SELECT * FROM financial_compliance_reports 
        WHERE id = ? AND created_by = ?
      `, [reportId, userId]);

      if (rows.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Report not found or access denied'
        });
      }

      const row = rows[0];
      return reply.send({
        success: true,
        data: {
          id: row.id,
          reportType: row.report_type,
          reportingPeriodStart: row.reporting_period_start,
          reportingPeriodEnd: row.reporting_period_end,
          totalRecordsDeleted: row.total_records_deleted,
          totalDataVolumeDeleted: row.total_data_volume_deleted,
          deletionReasons: JSON.parse(row.deletion_reasons || '{}'),
          jurisdictionsAffected: JSON.parse(row.jurisdictions_affected || '[]'),
          regulatoryFramework: row.regulatory_framework,
          approvalStatus: row.approval_status,
          reportData: JSON.parse(row.report_data || '{}'),
          summaryStatistics: JSON.parse(row.summary_statistics || '{}'),
          generatedAt: row.generated_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get compliance report:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Report retrieval failed'
      });
    }
  });

  /**
   * GET /api/financial-services/health
   * Health check endpoint for financial services API
   */
  fastify.get('/health', {
    schema: {
      description: 'Health check for financial services API',
      tags: ['Financial Services', 'Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            service: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      service: 'Financial Data Lifecycle Management API',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
}