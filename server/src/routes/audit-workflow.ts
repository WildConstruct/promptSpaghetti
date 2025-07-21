// Audit Workflow API Routes - Epic 19
// RESTful API for audit workflow management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  AuditWorkflowService, 
  WorkflowType, 
  WorkflowStatus, 
  WorkflowPriority,
  ReportType,
  StepType,
  EvidenceType,
  TriggerType
} from '../services/AuditWorkflowService';
import { z } from 'zod';

// Request schemas
const CreateWorkflowSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  workflowType: z.enum([
    'COMPLIANCE_AUDIT', 'SECURITY_ASSESSMENT', 'DATA_PRIVACY_REVIEW', 
    'ACCESS_REVIEW', 'INCIDENT_INVESTIGATION', 'PENETRATION_TEST', 
    'RISK_ASSESSMENT', 'VENDOR_AUDIT'
  ] as const),
  triggerConditions: z.array(z.object({
    conditionType: z.enum(['SCHEDULED', 'EVENT_BASED', 'THRESHOLD_BASED', 'MANUAL', 'COMPLIANCE_DATE'] as const),
    parameters: z.record(z.any()),
    frequency: z.string().optional(),
    threshold: z.number().optional(),
    enabled: z.boolean().default(true)
  })),
  steps: z.array(z.object({
    stepId: z.string(),
    name: z.string(),
    description: z.string(),
    stepType: z.enum([
      'DATA_COLLECTION', 'EVIDENCE_REVIEW', 'TESTING', 'INTERVIEW', 
      'DOCUMENTATION', 'APPROVAL', 'REMEDIATION', 'VERIFICATION'
    ] as const),
    assigneeRole: z.string(),
    estimatedDuration: z.number().min(1),
    dependencies: z.array(z.string()).default([]),
    approvalRequired: z.boolean().default(false),
    reviewRequirements: z.array(z.object({
      reviewType: z.enum(['TECHNICAL', 'BUSINESS', 'LEGAL', 'COMPLIANCE'] as const),
      requiredRole: z.string(),
      criteria: z.array(z.string()),
      signOffRequired: z.boolean().default(false)
    })).default([])
  })).min(1, 'At least one step is required'),
  assignees: z.array(z.string()).min(1, 'At least one assignee is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).default('MEDIUM'),
  scheduledDate: z.string().datetime().transform(val => new Date(val)).optional(),
  dueDate: z.string().datetime().transform(val => new Date(val)).optional(),
  metadata: z.record(z.any()).default({})
});

const StartExecutionSchema = z.object({
  workflowId: z.string()
});

const SubmitEvidenceSchema = z.object({
  stepId: z.string(),
  type: z.enum(['DOCUMENT', 'SCREENSHOT', 'LOG_DATA', 'CONFIGURATION', 'INTERVIEW_NOTES', 'TEST_RESULTS', 'METRICS'] as const),
  description: z.string().min(10),
  filePath: z.string().optional(),
  dataPoints: z.record(z.any()).default({})
});

const CompleteStepSchema = z.object({
  stepId: z.string(),
  findings: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([])
});

const GenerateReportSchema = z.object({
  reportType: z.enum(['EXECUTIVE_SUMMARY', 'DETAILED_FINDINGS', 'COMPLIANCE_REPORT', 'REMEDIATION_PLAN'] as const)
});

const WorkflowFiltersSchema = z.object({
  workflowType: z.enum([
    'COMPLIANCE_AUDIT', 'SECURITY_ASSESSMENT', 'DATA_PRIVACY_REVIEW', 
    'ACCESS_REVIEW', 'INCIDENT_INVESTIGATION', 'PENETRATION_TEST', 
    'RISK_ASSESSMENT', 'VENDOR_AUDIT'
  ] as const).optional(),
  assignee: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SCHEDULED', 'SUSPENDED', 'COMPLETED', 'ARCHIVED'] as const).optional()
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface CreateWorkflowRequest extends AuthenticatedRequest {
  Body: z.infer<typeof CreateWorkflowSchema>;
}

interface StartExecutionRequest extends AuthenticatedRequest {
  Body: z.infer<typeof StartExecutionSchema>;
}

interface SubmitEvidenceRequest extends AuthenticatedRequest {
  Params: { executionId: string };
  Body: z.infer<typeof SubmitEvidenceSchema>;
}

interface CompleteStepRequest extends AuthenticatedRequest {
  Params: { executionId: string };
  Body: z.infer<typeof CompleteStepSchema>;
}

interface GenerateReportRequest extends AuthenticatedRequest {
  Params: { executionId: string };
  Body: z.infer<typeof GenerateReportSchema>;
}

interface WorkflowListRequest extends AuthenticatedRequest {
  Querystring: z.infer<typeof WorkflowFiltersSchema>;
}

interface ExecutionDetailRequest extends AuthenticatedRequest {
  Params: { executionId: string };
}

export async function auditWorkflowRoutes(fastify: FastifyInstance) {
  // Get the audit workflow service from the DI container
  const auditWorkflowService = fastify.auditWorkflowService as AuditWorkflowService;

  // Middleware to verify authentication
  const authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Valid authentication token required'
        });
      }

      const token = authHeader.slice(7);
      const user = await fastify.jwt.verify(token) as any;
      
      if (!user?.id) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid authentication token'
        });
      }

      request.user = user;
    } catch (error) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication failed'
      });
    }
  };

  // Rate limiting configuration
  const rateLimitConfig = {
    max: 50, // Maximum requests per window
    timeWindow: '1 hour'
  };

  /**
   * Create new audit workflow
   * POST /api/audit-workflow/workflows
   */
  fastify.post('/workflows', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
          description: { type: 'string', minLength: 10 },
          workflowType: { 
            type: 'string',
            enum: ['COMPLIANCE_AUDIT', 'SECURITY_ASSESSMENT', 'DATA_PRIVACY_REVIEW', 'ACCESS_REVIEW', 'INCIDENT_INVESTIGATION', 'PENETRATION_TEST', 'RISK_ASSESSMENT', 'VENDOR_AUDIT']
          },
          triggerConditions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                conditionType: { type: 'string', enum: ['SCHEDULED', 'EVENT_BASED', 'THRESHOLD_BASED', 'MANUAL', 'COMPLIANCE_DATE'] },
                parameters: { type: 'object' },
                frequency: { type: 'string' },
                threshold: { type: 'number' },
                enabled: { type: 'boolean', default: true }
              },
              required: ['conditionType', 'parameters']
            }
          },
          steps: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                stepId: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                stepType: { type: 'string', enum: ['DATA_COLLECTION', 'EVIDENCE_REVIEW', 'TESTING', 'INTERVIEW', 'DOCUMENTATION', 'APPROVAL', 'REMEDIATION', 'VERIFICATION'] },
                assigneeRole: { type: 'string' },
                estimatedDuration: { type: 'number', minimum: 1 },
                dependencies: { type: 'array', items: { type: 'string' }, default: [] },
                approvalRequired: { type: 'boolean', default: false }
              },
              required: ['stepId', 'name', 'description', 'stepType', 'assigneeRole', 'estimatedDuration']
            }
          },
          assignees: { type: 'array', items: { type: 'string' }, minItems: 1 },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
          scheduledDate: { type: 'string', format: 'date-time' },
          dueDate: { type: 'string', format: 'date-time' },
          metadata: { type: 'object', default: {} }
        },
        required: ['name', 'description', 'workflowType', 'triggerConditions', 'steps', 'assignees']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            workflowId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: CreateWorkflowRequest, reply: FastifyReply) => {
    try {
      const validatedBody = CreateWorkflowSchema.parse(request.body);

      const workflow = {
        ...validatedBody,
        status: WorkflowStatus.DRAFT,
        createdBy: request.user!.id
      };

      const result = await auditWorkflowService.createWorkflow(workflow);
      
      reply.send({
        workflowId: result.workflowId,
        message: 'Audit workflow created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error creating audit workflow:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to create audit workflow'
        });
      }
    }
  });

  /**
   * Start workflow execution
   * POST /api/audit-workflow/executions
   */
  fastify.post('/executions', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      body: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' }
        },
        required: ['workflowId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            executionId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: StartExecutionRequest, reply: FastifyReply) => {
    try {
      const validatedBody = StartExecutionSchema.parse(request.body);

      const result = await auditWorkflowService.startWorkflowExecution(
        validatedBody.workflowId,
        request.user!.id
      );
      
      reply.send({
        executionId: result.executionId,
        message: 'Workflow execution started successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error starting workflow execution:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to start workflow execution'
        });
      }
    }
  });

  /**
   * Submit evidence for workflow step
   * POST /api/audit-workflow/executions/:executionId/evidence
   */
  fastify.post('/executions/:executionId/evidence', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' }
        },
        required: ['executionId']
      },
      body: {
        type: 'object',
        properties: {
          stepId: { type: 'string' },
          type: { type: 'string', enum: ['DOCUMENT', 'SCREENSHOT', 'LOG_DATA', 'CONFIGURATION', 'INTERVIEW_NOTES', 'TEST_RESULTS', 'METRICS'] },
          description: { type: 'string', minLength: 10 },
          filePath: { type: 'string' },
          dataPoints: { type: 'object', default: {} }
        },
        required: ['stepId', 'type', 'description']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            evidenceId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: SubmitEvidenceRequest, reply: FastifyReply) => {
    try {
      const { executionId } = request.params;
      const validatedBody = SubmitEvidenceSchema.parse(request.body);

      const evidence = {
        ...validatedBody,
        collectedBy: request.user!.id
      };

      const result = await auditWorkflowService.submitEvidence(
        executionId,
        validatedBody.stepId,
        evidence
      );
      
      reply.send({
        evidenceId: result.evidenceId,
        message: 'Evidence submitted successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error submitting evidence:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to submit evidence'
        });
      }
    }
  });

  /**
   * Complete workflow step
   * POST /api/audit-workflow/executions/:executionId/complete-step
   */
  fastify.post('/executions/:executionId/complete-step', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' }
        },
        required: ['executionId']
      },
      body: {
        type: 'object',
        properties: {
          stepId: { type: 'string' },
          findings: { type: 'array', items: { type: 'string' }, default: [] },
          nextSteps: { type: 'array', items: { type: 'string' }, default: [] }
        },
        required: ['stepId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            nextStepId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: CompleteStepRequest, reply: FastifyReply) => {
    try {
      const { executionId } = request.params;
      const validatedBody = CompleteStepSchema.parse(request.body);

      const result = await auditWorkflowService.completeWorkflowStep(
        executionId,
        validatedBody.stepId,
        request.user!.id,
        validatedBody.findings,
        validatedBody.nextSteps
      );
      
      reply.send({
        nextStepId: result.nextStepId,
        message: result.nextStepId ? 
          'Step completed, next step started' : 
          'Step completed, workflow finished'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error completing workflow step:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to complete workflow step'
        });
      }
    }
  });

  /**
   * Generate audit report
   * POST /api/audit-workflow/executions/:executionId/reports
   */
  fastify.post('/executions/:executionId/reports', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' }
        },
        required: ['executionId']
      },
      body: {
        type: 'object',
        properties: {
          reportType: { type: 'string', enum: ['EXECUTIVE_SUMMARY', 'DETAILED_FINDINGS', 'COMPLIANCE_REPORT', 'REMEDIATION_PLAN'] }
        },
        required: ['reportType']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            reportId: { type: 'string' },
            reportContent: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: GenerateReportRequest, reply: FastifyReply) => {
    try {
      const { executionId } = request.params;
      const validatedBody = GenerateReportSchema.parse(request.body);

      const result = await auditWorkflowService.generateAuditReport(
        executionId,
        validatedBody.reportType as ReportType,
        request.user!.id
      );
      
      reply.send({
        reportId: result.reportId,
        reportContent: result.reportContent,
        message: 'Audit report generated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error generating audit report:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to generate audit report'
        });
      }
    }
  });

  /**
   * Get active workflows
   * GET /api/audit-workflow/workflows
   */
  fastify.get('/workflows', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          workflowType: { type: 'string', enum: ['COMPLIANCE_AUDIT', 'SECURITY_ASSESSMENT', 'DATA_PRIVACY_REVIEW', 'ACCESS_REVIEW', 'INCIDENT_INVESTIGATION', 'PENETRATION_TEST', 'RISK_ASSESSMENT', 'VENDOR_AUDIT'] },
          assignee: { type: 'string' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'SCHEDULED', 'SUSPENDED', 'COMPLETED', 'ARCHIVED'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            workflows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  workflowType: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  assignees: { type: 'array', items: { type: 'string' } },
                  scheduledDate: { type: 'string', format: 'date-time' },
                  dueDate: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: WorkflowListRequest, reply: FastifyReply) => {
    try {
      const filters = WorkflowFiltersSchema.parse(request.query);

      const workflows = await auditWorkflowService.getActiveWorkflows(filters);
      
      reply.send({
        workflows: workflows.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          workflowType: workflow.workflowType,
          status: workflow.status,
          priority: workflow.priority,
          assignees: workflow.assignees,
          scheduledDate: workflow.scheduledDate?.toISOString(),
          dueDate: workflow.dueDate?.toISOString(),
          createdAt: workflow.createdAt.toISOString()
        }))
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.errors
        });
      } else {
        fastify.log.error('Error getting workflows:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to get workflows'
        });
      }
    }
  });

  /**
   * Get workflow execution details
   * GET /api/audit-workflow/executions/:executionId
   */
  fastify.get('/executions/:executionId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' }
        },
        required: ['executionId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            execution: {
              type: 'object',
              properties: {
                executionId: { type: 'string' },
                workflowId: { type: 'string' },
                status: { type: 'string' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                currentStep: { type: 'string' },
                progress: { type: 'number' },
                findings: { type: 'array' },
                evidence: { type: 'array' },
                reports: { type: 'array' }
              }
            }
          }
        }
      }
    }
  }, async (request: ExecutionDetailRequest, reply: FastifyReply) => {
    try {
      const { executionId } = request.params;

      const execution = await auditWorkflowService.getWorkflowExecution(executionId);
      
      if (!execution) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Workflow execution not found'
        });
      }

      reply.send({
        execution: {
          executionId: execution.executionId,
          workflowId: execution.workflowId,
          status: execution.status,
          startDate: execution.startDate.toISOString(),
          endDate: execution.endDate?.toISOString(),
          currentStep: execution.currentStep,
          progress: execution.progress,
          findings: execution.findings,
          evidence: execution.evidence,
          reports: execution.reports
        }
      });

    } catch (error) {
      fastify.log.error('Error getting workflow execution:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get workflow execution'
      });
    }
  });

  /**
   * Health check endpoint
   * GET /api/audit-workflow/health
   */
  fastify.get('/health', {
    config: { rateLimit: { max: 200, timeWindow: '1 minute' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
}

// Register the plugin
export default async function (fastify: FastifyInstance) {
  await fastify.register(auditWorkflowRoutes, { prefix: '/api/audit-workflow' });
}