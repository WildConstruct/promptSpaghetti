/**
 * Compliance Reporting Routes - Epic 19
 * 
 * REST API endpoints for compliance reporting, analytics, dashboard management,
 * and automated compliance assessment capabilities.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { jwtAuthMiddleware } from '../auth/routes';
import { 
  ComplianceReportingService,
  ComplianceFramework,
  ComplianceReportType,
  ComplianceReportRequest,
  MetricsTimeRange,
  ComplianceCertificationType
} from '../services/ComplianceReportingService';

// Request/Response Schemas
const GenerateReportRequestSchema = z.object({
  reportType: z.enum(['COMPLIANCE_ASSESSMENT', 'RISK_ASSESSMENT', 'AUDIT_READINESS', 'GAP_ANALYSIS', 'CERTIFICATION_PREP', 'POLICY_EFFECTIVENESS', 'INCIDENT_ANALYSIS', 'METRICS_DASHBOARD', 'CUSTOM']),
  framework: z.enum(['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI_DSS', 'ISO_27001', 'NIST', 'CUSTOM']),
  scope: z.object({
    scopeId: z.string().min(1),
    name: z.string().min(1),
    description: z.string(),
    includedSystems: z.array(z.string()),
    includedPolicies: z.array(z.string()),
    includedProcesses: z.array(z.string()),
    includedData: z.array(z.object({
      dataCategory: z.string(),
      dataTypes: z.array(z.string()),
      sources: z.array(z.string()),
      processing: z.array(z.object({
        purpose: z.string(),
        legalBasis: z.string(),
        processors: z.array(z.string()),
        methods: z.array(z.string()),
        automated: z.boolean(),
        profiling: z.boolean()
      })),
      retention: z.object({
        retentionPeriod: z.number(),
        retentionBasis: z.string(),
        deletionMethods: z.array(z.string()),
        archivalPolicy: z.string()
      }),
      transfers: z.array(z.object({
        recipientCountry: z.string(),
        adequacyDecision: z.boolean(),
        safeguards: z.array(z.string()),
        purposes: z.array(z.string())
      }))
    })),
    geographicScope: z.array(z.string()),
    timeScope: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      timezone: z.string(),
      includePastPeriods: z.boolean(),
      forecastPeriods: z.number()
    }),
    exclusions: z.array(z.object({
      exclusionType: z.enum(['SYSTEM', 'POLICY', 'PROCESS', 'DATA', 'GEOGRAPHIC']),
      identifier: z.string(),
      reason: z.string(),
      approvedBy: z.string(),
      temporary: z.boolean(),
      expiresAt: z.string().datetime().optional()
    }))
  }),
  period: z.object({
    periodType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    comparisonPeriods: z.array(z.object({
      periodId: z.string(),
      name: z.string(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      baseline: z.boolean()
    }))
  }),
  options: z.object({
    includeRecommendations: z.boolean().default(true),
    includeEvidence: z.boolean().default(true),
    includeBenchmarks: z.boolean().default(false),
    detailLevel: z.enum(['SUMMARY', 'DETAILED', 'COMPREHENSIVE']).default('DETAILED'),
    confidentialityLevel: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).default('INTERNAL'),
    outputFormat: z.enum(['PDF', 'HTML', 'DOCX', 'JSON', 'XML']).default('PDF'),
    customizations: z.record(z.any()).optional()
  }).default({})
});

const GetDashboardQuerySchema = z.object({
  framework: z.enum(['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI_DSS', 'ISO_27001', 'NIST', 'CUSTOM']).optional(),
  timeRange: z.enum(['7D', '30D', '90D', '1Y', 'CUSTOM']).default('30D'),
  customStartDate: z.string().datetime().optional(),
  customEndDate: z.string().datetime().optional(),
  includeMetrics: z.boolean().default(true),
  includeTrends: z.boolean().default(true),
  includeAlerts: z.boolean().default(true)
});

const GetMetricsQuerySchema = z.object({
  framework: z.enum(['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI_DSS', 'ISO_27001', 'NIST', 'CUSTOM']).optional(),
  timeRange: z.enum(['7D', '30D', '90D', '1Y', 'CUSTOM']).default('30D'),
  customStartDate: z.string().datetime().optional(),
  customEndDate: z.string().datetime().optional(),
  granularity: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  metrics: z.array(z.string()).optional()
});

const CreateCertificationRequestSchema = z.object({
  certificationType: z.enum(['SOC2_TYPE1', 'SOC2_TYPE2', 'ISO_27001', 'PCI_DSS', 'HIPAA_COMPLIANCE', 'GDPR_CERTIFICATION', 'CUSTOM']),
  framework: z.enum(['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI_DSS', 'ISO_27001', 'NIST', 'CUSTOM']),
  scope: z.string().min(1),
  targetDate: z.string().datetime(),
  auditor: z.object({
    organization: z.string(),
    contact: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    requirements: z.array(z.string())
  }),
  requirements: z.array(z.object({
    requirementId: z.string(),
    category: z.string(),
    description: z.string(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED']).default('NOT_STARTED'),
    evidence: z.array(z.string()).optional(),
    assignee: z.string().optional(),
    dueDate: z.string().datetime().optional()
  })),
  documentation: z.object({
    policies: z.array(z.string()),
    procedures: z.array(z.string()),
    controls: z.array(z.string()),
    evidenceRepository: z.string().optional()
  }),
  timeline: z.object({
    phases: z.array(z.object({
      phaseId: z.string(),
      name: z.string(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      deliverables: z.array(z.string()),
      dependencies: z.array(z.string()).optional()
    })),
    milestones: z.array(z.object({
      milestoneId: z.string(),
      name: z.string(),
      targetDate: z.string().datetime(),
      criteria: z.array(z.string()),
      responsible: z.string()
    }))
  })
});

const UpdateCertificationStatusRequestSchema = z.object({
  certificationId: z.string().min(1),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'EXPIRED', 'SUSPENDED']),
  progress: z.number().min(0).max(100),
  notes: z.string().optional(),
  evidence: z.array(z.string()).optional(),
  nextActions: z.array(z.object({
    actionId: z.string(),
    description: z.string(),
    assignee: z.string(),
    dueDate: z.string().datetime(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  })).optional()
});

const ScheduleReportRequestSchema = z.object({
  reportType: z.enum(['COMPLIANCE_ASSESSMENT', 'RISK_ASSESSMENT', 'AUDIT_READINESS', 'GAP_ANALYSIS', 'CERTIFICATION_PREP', 'POLICY_EFFECTIVENESS', 'INCIDENT_ANALYSIS', 'METRICS_DASHBOARD', 'CUSTOM']),
  framework: z.enum(['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI_DSS', 'ISO_27001', 'NIST', 'CUSTOM']),
  schedule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional()
  }),
  recipients: z.array(z.object({
    userId: z.string(),
    email: z.string().email(),
    role: z.string(),
    deliveryPreference: z.enum(['EMAIL', 'DOWNLOAD_LINK', 'API_WEBHOOK']).default('EMAIL')
  })),
  configuration: z.object({
    scope: z.string(),
    options: z.record(z.any()).optional(),
    template: z.string().optional()
  })
});

export async function complianceReportingRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  await fastify.register(jwtAuthMiddleware);

  const complianceReportingService = fastify.complianceReportingService as ComplianceReportingService;

  /**
   * Generate compliance report
   * POST /compliance-reporting/generate
   */
  fastify.post<{
    Body: z.infer<typeof GenerateReportRequestSchema>;
  }>('/generate', {
    schema: {
      description: 'Generate comprehensive compliance report',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      body: GenerateReportRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                reportId: { type: 'string' },
                status: { type: 'string' },
                estimatedCompletion: { type: 'string' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('compliance:report:generate')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const generatorId = request.user.userId;
        const reportRequest: ComplianceReportRequest = {
          reportType: request.body.reportType as ComplianceReportType,
          framework: request.body.framework as ComplianceFramework,
          scope: request.body.scope,
          period: request.body.period,
          options: request.body.options
        };

        const result = await complianceReportingService.generateReport(reportRequest, generatorId);

        reply.send({
          success: true,
          data: {
            reportId: result.reportId,
            status: 'GENERATING',
            estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
          }
        });

      } catch (error) {
        fastify.log.error('Error generating compliance report:', error);
        reply.code(500).send({
          error: 'Failed to generate compliance report',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get compliance dashboard
   * GET /compliance-reporting/dashboard
   */
  fastify.get<{
    Querystring: z.infer<typeof GetDashboardQuerySchema>;
  }>('/dashboard', {
    schema: {
      description: 'Get compliance dashboard with metrics and trends',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      querystring: GetDashboardQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('compliance:dashboard:view')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const { framework } = request.query;
        
        const dashboard = await complianceReportingService.getComplianceDashboard(framework as ComplianceFramework);

        reply.send({
          success: true,
          data: dashboard
        });

      } catch (error) {
        fastify.log.error('Error getting compliance dashboard:', error);
        reply.code(500).send({
          error: 'Failed to get compliance dashboard',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get compliance metrics
   * GET /compliance-reporting/metrics
   */
  fastify.get<{
    Querystring: z.infer<typeof GetMetricsQuerySchema>;
  }>('/metrics', {
    schema: {
      description: 'Get detailed compliance metrics and analytics',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      querystring: GetMetricsQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                metrics: { type: 'array' },
                timeRange: { type: 'object' },
                trends: { type: 'array' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { framework, timeRange, customStartDate, customEndDate, granularity, metrics } = request.query;
        
        const timeRangeParam: MetricsTimeRange = timeRange as MetricsTimeRange;
        const result = await complianceReportingService.getMetrics(
          framework as ComplianceFramework,
          timeRangeParam,
          granularity as any,
          metrics,
          customStartDate ? new Date(customStartDate) : undefined,
          customEndDate ? new Date(customEndDate) : undefined
        );

        reply.send({
          success: true,
          data: result
        });

      } catch (error) {
        fastify.log.error('Error getting compliance metrics:', error);
        reply.code(500).send({
          error: 'Failed to get compliance metrics',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Create certification tracking
   * POST /compliance-reporting/certification
   */
  fastify.post<{
    Body: z.infer<typeof CreateCertificationRequestSchema>;
  }>('/certification', {
    schema: {
      description: 'Create new certification tracking and management',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      body: CreateCertificationRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                certificationId: { type: 'string' },
                status: { type: 'string' },
                timeline: { type: 'object' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('compliance:certification:create')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const managerId = request.user.userId;
        const certificationData = {
          certificationType: request.body.certificationType as ComplianceCertificationType,
          framework: request.body.framework as ComplianceFramework,
          scope: request.body.scope,
          targetDate: new Date(request.body.targetDate),
          auditor: request.body.auditor,
          requirements: request.body.requirements,
          documentation: request.body.documentation,
          timeline: request.body.timeline
        };

        const result = await complianceReportingService.createCertification(certificationData, managerId);

        reply.send({
          success: true,
          data: {
            certificationId: result.certificationId,
            status: 'PLANNING',
            timeline: request.body.timeline
          }
        });

      } catch (error) {
        fastify.log.error('Error creating certification:', error);
        reply.code(500).send({
          error: 'Failed to create certification',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Update certification status
   * PUT /compliance-reporting/certification/status
   */
  fastify.put<{
    Body: z.infer<typeof UpdateCertificationStatusRequestSchema>;
  }>('/certification/status', {
    schema: {
      description: 'Update certification progress and status',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      body: UpdateCertificationStatusRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                updated: { type: 'boolean' },
                currentStatus: { type: 'string' },
                progress: { type: 'number' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('compliance:certification:update')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const updaterId = request.user.userId;
        const { certificationId, status, progress, notes, evidence, nextActions } = request.body;
        
        const result = await complianceReportingService.updateCertificationStatus(
          certificationId,
          status as any,
          progress,
          updaterId,
          notes,
          evidence,
          nextActions
        );

        reply.send({
          success: true,
          data: {
            updated: result.updated,
            currentStatus: status,
            progress
          }
        });

      } catch (error) {
        fastify.log.error('Error updating certification status:', error);
        reply.code(500).send({
          error: 'Failed to update certification status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Schedule automated report
   * POST /compliance-reporting/schedule
   */
  fastify.post<{
    Body: z.infer<typeof ScheduleReportRequestSchema>;
  }>('/schedule', {
    schema: {
      description: 'Schedule automated compliance report generation',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      body: ScheduleReportRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                scheduleId: { type: 'string' },
                nextExecution: { type: 'string' },
                status: { type: 'string' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('compliance:schedule:create')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
    },
    handler: async (request, reply) => {
      try {
        const schedulerId = request.user.userId;
        const scheduleData = {
          reportType: request.body.reportType as ComplianceReportType,
          framework: request.body.framework as ComplianceFramework,
          schedule: request.body.schedule,
          recipients: request.body.recipients,
          configuration: request.body.configuration
        };

        const result = await complianceReportingService.scheduleReport(scheduleData, schedulerId);

        // Calculate next execution time
        const nextExecution = new Date();
        switch (request.body.schedule.frequency) {
          case 'DAILY':
            nextExecution.setDate(nextExecution.getDate() + 1);
            break;
          case 'WEEKLY':
            nextExecution.setDate(nextExecution.getDate() + 7);
            break;
          case 'MONTHLY':
            nextExecution.setMonth(nextExecution.getMonth() + 1);
            break;
          case 'QUARTERLY':
            nextExecution.setMonth(nextExecution.getMonth() + 3);
            break;
          case 'ANNUALLY':
            nextExecution.setFullYear(nextExecution.getFullYear() + 1);
            break;
        }

        reply.send({
          success: true,
          data: {
            scheduleId: result.scheduleId,
            nextExecution: nextExecution.toISOString(),
            status: 'ACTIVE'
          }
        });

      } catch (error) {
        fastify.log.error('Error scheduling report:', error);
        reply.code(500).send({
          error: 'Failed to schedule report',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get report details
   * GET /compliance-reporting/report/:reportId
   */
  fastify.get<{
    Params: { reportId: string };
    Querystring: { includeEvidence?: boolean; format?: string };
  }>('/report/:reportId', {
    schema: {
      description: 'Get detailed compliance report information',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          reportId: { type: 'string' }
        },
        required: ['reportId']
      },
      querystring: {
        type: 'object',
        properties: {
          includeEvidence: { type: 'boolean', default: false },
          format: { type: 'string', enum: ['JSON', 'PDF', 'HTML'], default: 'JSON' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const { reportId } = request.params;
        const { includeEvidence, format } = request.query;
        
        const report = await complianceReportingService.getReport(reportId, includeEvidence, format as any);

        reply.send({
          success: true,
          data: report
        });

      } catch (error) {
        fastify.log.error('Error getting report details:', error);
        reply.code(500).send({
          error: 'Failed to get report details',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * List compliance reports
   * GET /compliance-reporting/reports
   */
  fastify.get<{
    Querystring: {
      framework?: string;
      reportType?: string;
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    };
  }>('/reports', {
    schema: {
      description: 'List compliance reports with filtering and pagination',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          framework: { type: 'string' },
          reportType: { type: 'string' },
          status: { type: 'string' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['generatedAt', 'framework', 'reportType'], default: 'generatedAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                reports: { type: 'array' },
                pagination: { type: 'object' },
                filters: { type: 'object' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const filters = request.query;
        
        const result = await complianceReportingService.listReports(filters);

        reply.send({
          success: true,
          data: result
        });

      } catch (error) {
        fastify.log.error('Error listing compliance reports:', error);
        reply.code(500).send({
          error: 'Failed to list compliance reports',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get available frameworks
   * GET /compliance-reporting/frameworks
   */
  fastify.get('/frameworks', {
    schema: {
      description: 'Get available compliance frameworks and their capabilities',
      tags: ['Compliance Reporting'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                frameworks: { type: 'array' },
                reportTypes: { type: 'array' },
                capabilities: { type: 'object' }
              }
            }
          }
        }
      }
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
    },
    handler: async (request, reply) => {
      try {
        const frameworks = await complianceReportingService.getAvailableFrameworks();

        reply.send({
          success: true,
          data: frameworks
        });

      } catch (error) {
        fastify.log.error('Error getting frameworks:', error);
        reply.code(500).send({
          error: 'Failed to get frameworks',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}