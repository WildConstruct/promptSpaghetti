// Policy Update Workflow API Routes - Epic 19
// RESTful API for policy update workflow management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  PolicyUpdateWorkflowService,
  PolicyType,
  UpdatePriority,
  ChangeType,
  ApprovalDecision,
  UpdateStatus,
  DeploymentType,
  RolloutType
} from '../services/PolicyUpdateWorkflowService';
import { z } from 'zod';

// Request schemas
const SubmitUpdateRequestSchema = z.object({
  policyId: z.string().min(1, 'Policy ID is required'),
  policyType: z.enum([
    'PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'DATA_PROCESSING', 'COOKIE_POLICY',
    'SECURITY_POLICY', 'RETENTION_POLICY', 'ACCESS_POLICY', 'COMPLIANCE_POLICY'
  ] as const),
  currentVersion: z.string().min(1, 'Current version is required'),
  proposedVersion: z.string().min(1, 'Proposed version is required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  changes: z.array(z.object({
    changeId: z.string(),
    changeType: z.enum(['ADDITION', 'MODIFICATION', 'DELETION', 'RESTRUCTURE', 'CLARIFICATION'] as const),
    section: z.string(),
    oldContent: z.string(),
    newContent: z.string(),
    rationale: z.string().min(20, 'Rationale must be at least 20 characters'),
    legalBasis: z.string().optional(),
    affectedUsers: z.array(z.string()).default([]),
    breakingChange: z.boolean().default(false)
  })).min(1, 'At least one change is required'),
  justification: z.string().min(50, 'Justification must be at least 50 characters'),
  impactAssessment: z.object({
    userImpact: z.object({
      affectedUserCount: z.number().min(0),
      userSegments: z.array(z.string()).default([]),
      requiresReacceptance: z.boolean().default(false),
      notificationRequired: z.boolean().default(true),
      trainingRequired: z.boolean().default(false),
      communicationPlan: z.string()
    }),
    systemImpact: z.object({
      affectedSystems: z.array(z.string()).default([]),
      configurationChanges: z.array(z.string()).default([]),
      dataProcessingChanges: z.array(z.string()).default([]),
      integrationImpacts: z.array(z.string()).default([]),
      performanceImpact: z.object({
        expectedLoadIncrease: z.number().default(0),
        storageRequirements: z.number().default(0),
        processingOverhead: z.number().default(0),
        networkImpact: z.string().default('none'),
        scalabilityConsiderations: z.array(z.string()).default([])
      }),
      securityImplications: z.array(z.string()).default([])
    }),
    complianceImpact: z.object({
      regulatoryFrameworks: z.array(z.string()).default([]),
      complianceRequirements: z.array(z.string()).default([]),
      auditTrailRequirements: z.array(z.string()).default([]),
      reportingChanges: z.array(z.string()).default([]),
      certificationImpacts: z.array(z.string()).default([])
    }),
    riskAssessment: z.object({
      riskLevel: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const),
      identifiedRisks: z.array(z.object({
        riskId: z.string(),
        description: z.string(),
        category: z.enum(['COMPLIANCE', 'SECURITY', 'OPERATIONAL', 'FINANCIAL', 'REPUTATIONAL'] as const),
        probability: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const),
        impact: z.enum(['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const),
        mitigation: z.string()
      })).default([]),
      mitigationMeasures: z.array(z.string()).default([]),
      residualRisk: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const),
      acceptanceCriteria: z.array(z.string()).default([])
  }
  }),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL', 'EMERGENCY'] as const).default('NORMAL'),
  effectiveDate: z.string().datetime().transform(val => new Date(val)),
  reviewRequirements: z.array(z.object({
    reviewType: z.enum(
      ['LEGAL_REVIEW',
        'COMPLIANCE_REVIEW',
        'TECHNICAL_REVIEW',
        'BUSINESS_REVIEW',
        'SECURITY_REVIEW',
        'PRIVACY_REVIEW'] as const
    ),
    reviewerRole: z.string(),
    requiredQualifications: z.array(z.string()).default([]),
    estimatedHours: z.number().min(1),
    dependencies: z.array(z.string()).default([]),
    deadline: z.string().datetime().transform(val => new Date(val))
  })).default([]),
  metadata: z.record(z.any()).default({})
});

const ProcessApprovalSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'APPROVED_WITH_CONDITIONS'] as const),
  comments: z.string().optional()
});

const DeployRequestSchema = z.object({
  policyVersionId: z.string(),
  deploymentType: z.enum(['IMMEDIATE', 'SCHEDULED', 'PHASED', 'CANARY', 'BLUE_GREEN'] as const),
  targetEnvironments: z.array(z.string()).min(1, 'At least one target environment is required'),
  rolloutStrategy: z.object({
    strategyType: z.enum(['IMMEDIATE', 'CANARY', 'BLUE_GREEN', 'FEATURE_FLAG', 'PHASED'] as const),
    parameters: z.record(z.any()).default({}),
    canaryPercentage: z.number().min(1).max(100).optional(),
    blueGreenConfig: z.object({
      environmentA: z.string(),
      environmentB: z.string(),
      switchoverCriteria: z.array(z.string()).default([]),
      rollbackTime: z.number().min(1).default(30)
    }).optional(),
    featureFlagConfig: z.object({
      flagName: z.string(),
      defaultValue: z.boolean().default(false),
      rolloutRules: z.array(z.object({
        ruleId: z.string(),
        condition: z.string(),
        percentage: z.number().min(0).max(100),
        userSegments: z.array(z.string()).default([])
      })).default([]),
      killSwitchEnabled: z.boolean().default(true)
    }).optional()
  }),
  schedule: z.object({
    phases: z.array(z.object({
      phaseId: z.string(),
      phaseName: z.string(),
      targetPercentage: z.number().min(0).max(100),
      duration: z.number().min(1),
      successThreshold: z.number().min(0).max(100).default(95),
      rollbackThreshold: z.number().min(0).max(100).default(5),
      validationChecks: z.array(z.string()).default([])
    })).default([]),
    rollbackTriggers: z.array(z.string()).default([]),
    successCriteria: z.array(z.string()).default([]),
    monitoringPeriod: z.number().min(1).default(24)
  }),
  validationResults: z.array(z.object({
    validationType: z.enum(['SYNTAX', 'LEGAL', 'COMPLIANCE', 'ACCESSIBILITY', 'INTEGRATION'] as const),
    status: z.enum(['PASS', 'FAIL', 'WARNING', 'SKIP'] as const),
    findings: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
    validatedAt: z.string().datetime().transform(val => new Date(val)),
    validatorId: z.string()
  })).default([])
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface SubmitUpdateRequest extends AuthenticatedRequest {
  Body: z.infer<typeof SubmitUpdateRequestSchema>;
}

interface ProcessApprovalRequest extends AuthenticatedRequest {
  Params: { requestId: string };
  Body: z.infer<typeof ProcessApprovalSchema>;
}

interface DeployRequest extends AuthenticatedRequest {
  Params: { requestId: string };
  Body: z.infer<typeof DeployRequestSchema>;
}

interface RequestDetailParams extends AuthenticatedRequest {
  Params: { requestId: string };
}

export async function policyUpdateWorkflowRoutes(fastify: FastifyInstance) {
  // Get the policy update workflow service from the DI container
  const policyUpdateService = fastify.policyUpdateWorkflowService as PolicyUpdateWorkflowService;

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
    max: 30, // Maximum requests per window
    timeWindow: '1 hour'
  };

  /**
   * Submit new policy update request
   * POST /api/policy-update-workflow/requests
   */
  fastify.post('/requests', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      body: {
        type: 'object',
        properties: {
          policyId: { type: 'string', minLength: 1 },
          policyType: { 
            type: 'string',
            enum: ['PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'DATA_PROCESSING', 'COOKIE_POLICY', 'SECURITY_POLICY', 'RETENTION_POLICY', 'ACCESS_POLICY', 'COMPLIANCE_POLICY']
  }
          currentVersion: { type: 'string', minLength: 1 },
          proposedVersion: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 5 },
          description: { type: 'string', minLength: 50 },
          changes: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                changeId: { type: 'string' },
                changeType: { type: 'string', enum: ['ADDITION', 'MODIFICATION', 'DELETION', 'RESTRUCTURE', 'CLARIFICATION'] },
                section: { type: 'string' },
                oldContent: { type: 'string' },
                newContent: { type: 'string' },
                rationale: { type: 'string', minLength: 20 },
                legalBasis: { type: 'string' },
                affectedUsers: { type: 'array', items: { type: 'string' }, default: [] },
                breakingChange: { type: 'boolean', default: false }
  }
              required: ['changeId', 'changeType', 'section', 'oldContent', 'newContent', 'rationale']
            }
  }
          justification: { type: 'string', minLength: 50 },
          priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL', 'EMERGENCY'], default: 'NORMAL' },
          effectiveDate: { type: 'string', format: 'date-time' },
          metadata: { type: 'object', default: {} }
  }
        required: ['policyId', 'policyType', 'currentVersion', 'proposedVersion', 'title', 'description', 'changes', 'justification', 'effectiveDate']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: SubmitUpdateRequest, reply: FastifyReply) => {
    try {
      const validatedBody = SubmitUpdateRequestSchema.parse(request.body);

      const updateRequest = {
        ...validatedBody,
        requestorId: request.user!.id,
        requestorRole: request.user!.roles?.[0] || 'user'
      };

      const result = await policyUpdateService.submitPolicyUpdateRequest(updateRequest);
      
      reply.send({
        requestId: result.requestId,
        message: 'Policy update request submitted successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error submitting policy update request:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to submit policy update request'
        });
      }
    }
  });

  /**
   * Process approval decision
   * POST /api/policy-update-workflow/requests/:requestId/approve
   */
  fastify.post('/requests/:requestId/approve', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
  }
        required: ['requestId']
  }
      body: {
        type: 'object',
        properties: {
          decision: { type: 'string', enum: ['APPROVED', 'REJECTED', 'APPROVED_WITH_CONDITIONS'] },
          comments: { type: 'string' }
  }
        required: ['decision']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            workflowComplete: { type: 'boolean' },
            approved: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: ProcessApprovalRequest, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      const validatedBody = ProcessApprovalSchema.parse(request.body);

      const result = await policyUpdateService.processApprovalDecision(
        requestId,
        request.user!.id,
        validatedBody.decision as ApprovalDecision,
        validatedBody.comments
      );
      
      const message = result.workflowComplete
        ? (result.approved ? 'Policy update approved and ready for deployment' : 'Policy update rejected')
        : 'Approval decision recorded, workflow continuing';

      reply.send({
        workflowComplete: result.workflowComplete,
        approved: result.approved,
        message
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error processing approval decision:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process approval decision'
        });
      }
    }
  });

  /**
   * Deploy approved policy update
   * POST /api/policy-update-workflow/requests/:requestId/deploy
   */
  fastify.post('/requests/:requestId/deploy', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
  }
        required: ['requestId']
  }
      body: {
        type: 'object',
        properties: {
          policyVersionId: { type: 'string' },
          deploymentType: { type: 'string', enum: ['IMMEDIATE', 'SCHEDULED', 'PHASED', 'CANARY', 'BLUE_GREEN'] },
          targetEnvironments: { type: 'array', items: { type: 'string' }, minItems: 1 },
          rolloutStrategy: {
            type: 'object',
            properties: {
              strategyType: { type: 'string', enum: ['IMMEDIATE', 'CANARY', 'BLUE_GREEN', 'FEATURE_FLAG', 'PHASED'] },
              parameters: { type: 'object', default: {} },
              canaryPercentage: { type: 'number', minimum: 1, maximum: 100 }
  }
            required: ['strategyType']
  }
          schedule: {
            type: 'object',
            properties: {
              phases: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    phaseId: { type: 'string' },
                    phaseName: { type: 'string' },
                    targetPercentage: { type: 'number', minimum: 0, maximum: 100 },
                    duration: { type: 'number', minimum: 1 },
                    successThreshold: { type: 'number', minimum: 0, maximum: 100, default: 95 },
                    rollbackThreshold: { type: 'number', minimum: 0, maximum: 100, default: 5 }
  }
                  required: ['phaseId', 'phaseName', 'targetPercentage', 'duration']
  }
                default: []
  }
              rollbackTriggers: { type: 'array', items: { type: 'string' }, default: [] },
              successCriteria: { type: 'array', items: { type: 'string' }, default: [] },
              monitoringPeriod: { type: 'number', minimum: 1, default: 24 }
            }
  }
          validationResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                validationType: { type: 'string', enum: ['SYNTAX', 'LEGAL', 'COMPLIANCE', 'ACCESSIBILITY', 'INTEGRATION'] },
                status: { type: 'string', enum: ['PASS', 'FAIL', 'WARNING', 'SKIP'] },
                findings: { type: 'array', items: { type: 'string' }, default: [] },
                recommendations: { type: 'array', items: { type: 'string' }, default: [] },
                validatedAt: { type: 'string', format: 'date-time' },
                validatorId: { type: 'string' }
  }
              required: ['validationType', 'status', 'validatedAt', 'validatorId']
  }
            default: []
          }
  }
        required: ['policyVersionId', 'deploymentType', 'targetEnvironments', 'rolloutStrategy', 'schedule']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            deploymentId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: DeployRequest, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      const validatedBody = DeployRequestSchema.parse(request.body);

      const result = await policyUpdateService.deployPolicyUpdate(requestId, validatedBody);
      
      reply.send({
        deploymentId: result.deploymentId,
        message: 'Policy deployment initiated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error deploying policy update:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to deploy policy update'
        });
      }
    }
  });

  /**
   * Get pending approvals for user
   * GET /api/policy-update-workflow/approvals/pending
   */
  fastify.get('/approvals/pending', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            requests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  requestId: { type: 'string' },
                  policyId: { type: 'string' },
                  policyType: { type: 'string' },
                  title: { type: 'string' },
                  priority: { type: 'string' },
                  submittedAt: { type: 'string', format: 'date-time' },
                  effectiveDate: { type: 'string', format: 'date-time' },
                  changesCount: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const requests = await policyUpdateService.getPendingApprovals(request.user!.id);
      
      reply.send({
        requests: requests.map(req => ({
          requestId: req.requestId,
          policyId: req.policyId,
          policyType: req.policyType,
          title: req.title,
          priority: req.priority,
          submittedAt: req.submittedAt.toISOString(),
          effectiveDate: req.effectiveDate.toISOString(),
          changesCount: req.changes.length
        }))
      });

    } catch (error) {
      fastify.log.error('Error getting pending approvals:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get pending approvals'
      });
    }
  });

  /**
   * Get policy update history
   * GET /api/policy-update-workflow/policies/:policyId/history
   */
  fastify.get('/policies/:policyId/history', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          policyId: { type: 'string' }
  }
        required: ['policyId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            history: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  requestId: { type: 'string' },
                  currentVersion: { type: 'string' },
                  proposedVersion: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  submittedAt: { type: 'string', format: 'date-time' },
                  effectiveDate: { type: 'string', format: 'date-time' },
                  requestorRole: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: RequestDetailParams, reply: FastifyReply) => {
    try {
      const { policyId } = request.params;

      const history = await policyUpdateService.getPolicyUpdateHistory(policyId);
      
      reply.send({
        history: history.map(req => ({
          requestId: req.requestId,
          currentVersion: req.currentVersion,
          proposedVersion: req.proposedVersion,
          title: req.title,
          status: req.status,
          priority: req.priority,
          submittedAt: req.submittedAt.toISOString(),
          effectiveDate: req.effectiveDate.toISOString(),
          requestorRole: req.requestorRole
        }))
      });

    } catch (error) {
      fastify.log.error('Error getting policy update history:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get policy update history'
      });
    }
  });

  /**
   * Get request details
   * GET /api/policy-update-workflow/requests/:requestId
   */
  fastify.get('/requests/:requestId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
  }
        required: ['requestId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            request: {
              type: 'object',
              properties: {
                requestId: { type: 'string' },
                policyId: { type: 'string' },
                policyType: { type: 'string' },
                currentVersion: { type: 'string' },
                proposedVersion: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                changes: { type: 'array' },
                justification: { type: 'string' },
                impactAssessment: { type: 'object' },
                priority: { type: 'string' },
                status: { type: 'string' },
                submittedAt: { type: 'string', format: 'date-time' },
                effectiveDate: { type: 'string', format: 'date-time' },
                approvalWorkflow: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request: RequestDetailParams, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;

      // This would normally fetch from the service, but for now return structure
      reply.send({
        request: {
          requestId,
          policyId: 'example-policy',
          policyType: 'PRIVACY_POLICY',
          currentVersion: '1.0',
          proposedVersion: '1.1',
          title: 'Example Policy Update',
          description: 'Example description',
          changes: [],
          justification: 'Example justification',
          impactAssessment: {},
          priority: 'NORMAL',
          status: 'SUBMITTED',
          submittedAt: new Date().toISOString(),
          effectiveDate: new Date().toISOString(),
          approvalWorkflow: {}
        }
      });

    } catch (error) {
      fastify.log.error('Error getting request details:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get request details'
      });
    }
  });

  /**
   * Health check endpoint
   * GET /api/policy-update-workflow/health
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
  await fastify.register(policyUpdateWorkflowRoutes, { prefix: '/api/policy-update-workflow' });
}