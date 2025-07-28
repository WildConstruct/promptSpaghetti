/**
 * OAuth Guidance Routes - Epic 19
 * 
 * REST API endpoints for OAuth 2.0 guidance, configuration generation,
 * security assessments, and compliance validation.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls - Secure API & Integration Framework
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { jwtAuthMiddleware } from '../auth/routes';
import { 
  OAuthGuidanceService,
  OAuthClientType,
  OAuthGrantType,
  ConfigurationStatus
} from '../services/OAuthGuidanceService';

// Request/Response Schemas
const GenerateConfigurationRequestSchema = z.object({
  clientType: z.enum(['CONFIDENTIAL', 'PUBLIC', 'NATIVE', 'WEB_APPLICATION', 'SINGLE_PAGE_APPLICATION', 'MACHINE_TO_MACHINE', 'SERVICE_ACCOUNT']),
  useCase: z.string().min(1).max(500),
  dataClassifications: z.array(z.string()).min(1),
  complianceRequirements: z.array(z.string()).default([])
});

const ValidateConfigurationRequestSchema = z.object({
  configId: z.string().min(1)
});

const SecurityAssessmentRequestSchema = z.object({
  clientId: z.string().min(1),
  assessmentType: z.enum(['PRE_DEPLOYMENT', 'PERIODIC_REVIEW', 'INCIDENT_RESPONSE', 'COMPLIANCE_AUDIT']),
  scope: z.object({
    configurationReview: z.boolean().default(true),
    securityTesting: z.boolean().default(true),
    complianceValidation: z.boolean().default(true),
    dataFlowAnalysis: z.boolean().default(false),
    threatModeling: z.boolean().default(false),
    penetrationTesting: z.boolean().default(false)
  }
});

const UpdateConfigurationRequestSchema = z.object({
  configId: z.string().min(1),
  updates: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'REVOKED', 'SUSPENDED']).optional(),
    redirectUris: z.array(z.string().url()).optional(),
    scopes: z.array(z.object({
      name: z.string(),
      description: z.string(),
      requiresConsent: z.boolean(),
      dataClassification: z.string()
    })).optional(),
    securityConfiguration: z.object({
      pkceRequired: z.boolean().optional(),
      mtlsRequired: z.boolean().optional(),
      dpopRequired: z.boolean().optional()
    }).optional()
  }
});

const GenerateGuidanceRequestSchema = z.object({
  configId: z.string().min(1),
  guidanceType: z.enum(['IMPLEMENTATION_GUIDE', 'SECURITY_BEST_PRACTICES', 'COMPLIANCE_GUIDANCE', 'TROUBLESHOOTING', 'API_REFERENCE', 'MIGRATION_GUIDE', 'TESTING_GUIDELINES']),
  includeCodeExamples: z.boolean().default(true),
  includeSecurityConsiderations: z.boolean().default(true),
  includeComplianceNotes: z.boolean().default(true)
});

const ListConfigurationsQuerySchema = z.object({
  clientType: z.enum(['CONFIDENTIAL', 'PUBLIC', 'NATIVE', 'WEB_APPLICATION', 'SINGLE_PAGE_APPLICATION', 'MACHINE_TO_MACHINE', 'SERVICE_ACCOUNT']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'REVOKED', 'SUSPENDED']).optional(),
  environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

const AssessmentQuerySchema = z.object({
  clientId: z.string().optional(),
  assessmentType: z.enum(['PRE_DEPLOYMENT', 'PERIODIC_REVIEW', 'INCIDENT_RESPONSE', 'COMPLIANCE_AUDIT']).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

export async function oauthGuidanceRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  await fastify.register(jwtAuthMiddleware);

  const oauthGuidanceService = fastify.oauthGuidanceService as OAuthGuidanceService;

  /**
   * Generate OAuth configuration and implementation guidance
   * POST /oauth-guidance/generate-configuration
   */
  fastify.post<{
    Body: z.infer<typeof GenerateConfigurationRequestSchema>;
  }>('/generate-configuration', {
    schema: {
      description: 'Generate OAuth configuration with security recommendations',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      body: GenerateConfigurationRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                configId: { type: 'string' },
                documentId: { type: 'string' },
                securityLevel: { type: 'string' },
                recommendedGrantTypes: { type: 'array', items: { type: 'string' } },
                securityFeatures: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      // Check permissions
      if (!request.user.permissions.includes('oauth:configure')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;
      }
  }
    handler: async (request, reply) => {
      try {
        const { clientType, useCase, dataClassifications, complianceRequirements } = request.body;

        const result = await oauthGuidanceService.generateOAuthConfiguration(
          clientType as OAuthClientType,
          useCase,
          dataClassifications,
          complianceRequirements
        );

        reply.send({
          success: true,
          data: {
            configId: result.configuration.configId,
            documentId: result.guidance.documentId,
            securityLevel: result.guidance.securityLevel,
            recommendedGrantTypes: result.configuration.grantTypes,
            securityFeatures: [
              result.configuration.securityConfiguration.pkceRequired ? 'PKCE' : null,
              result.configuration.securityConfiguration.mtlsRequired ? 'mTLS' : null,
              result.configuration.securityConfiguration.dpopRequired ? 'DPoP' : null
            ].filter(Boolean)
          }
        });

      } catch (error) {
        fastify.log.error('Error generating OAuth configuration:', error);
        reply.code(500).send({
          error: 'Failed to generate OAuth configuration',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Validate OAuth configuration
   * POST /oauth-guidance/validate-configuration
   */
  fastify.post<{
    Body: z.infer<typeof ValidateConfigurationRequestSchema>;
  }>('/validate-configuration', {
    schema: {
      description: 'Validate OAuth configuration against security and compliance requirements',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      body: ValidateConfigurationRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                isValid: { type: 'boolean' },
                securityScore: { type: 'number' },
                criticalIssues: { type: 'number' },
                highIssues: { type: 'number' },
                complianceStatus: { type: 'object' }
              }
            }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
  }
    handler: async (request, reply) => {
      try {
        const { configId } = request.body;

        const validation = await oauthGuidanceService.validateConfiguration(configId);

        const criticalIssues = validation.securityIssues.filter(i => i.severity === 'CRITICAL').length +
                             validation.complianceIssues.filter(i => i.severity === 'CRITICAL').length;

        const highIssues = validation.securityIssues.filter(i => i.severity === 'HIGH').length +
                          validation.complianceIssues.filter(i => i.severity === 'HIGH').length;

        const securityScore = Math.max(0, 100 - (criticalIssues * 25) - (highIssues * 15));

        reply.send({
          success: true,
          data: {
            isValid: validation.isValid,
            securityScore,
            criticalIssues,
            highIssues,
            securityIssues: validation.securityIssues,
            complianceIssues: validation.complianceIssues,
            recommendations: validation.recommendations
          }
        });

      } catch (error) {
        fastify.log.error('Error validating OAuth configuration:', error);
        reply.code(500).send({
          error: 'Failed to validate OAuth configuration',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Conduct security assessment
   * POST /oauth-guidance/security-assessment
   */
  fastify.post<{
    Body: z.infer<typeof SecurityAssessmentRequestSchema>;
  }>('/security-assessment', {
    schema: {
      description: 'Conduct comprehensive security assessment of OAuth integration',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      body: SecurityAssessmentRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                assessmentId: { type: 'string' },
                status: { type: 'string' },
                estimatedCompletion: { type: 'string' }
              }
            }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      // Check permissions for security assessments
      if (!request.user.permissions.includes('oauth:assess')) {
        reply.code(403).send({ error: 'Insufficient permissions for security assessments' });
        return;
      }
  }
    handler: async (request, reply) => {
      try {
        const { clientId, assessmentType, scope } = request.body;
        const assessor = request.user.userId;

        const result = await oauthGuidanceService.conductSecurityAssessment(
          clientId,
          assessmentType,
          assessor,
          scope
        );

        // Estimate completion time based on scope
        const scopeItems = Object.values(scope).filter(Boolean).length;
        const estimatedHours = scopeItems * 2; // 2 hours per scope item
        const estimatedCompletion = new Date();
        estimatedCompletion.setHours(estimatedCompletion.getHours() + estimatedHours);

        reply.send({
          success: true,
          data: {
            assessmentId: result.assessmentId,
            status: 'IN_PROGRESS',
            estimatedCompletion: estimatedCompletion.toISOString()
          }
        });

      } catch (error) {
        fastify.log.error('Error conducting security assessment:', error);
        reply.code(500).send({
          error: 'Failed to conduct security assessment',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Generate implementation guidance
   * POST /oauth-guidance/generate-guidance
   */
  fastify.post<{
    Body: z.infer<typeof GenerateGuidanceRequestSchema>;
  }>('/generate-guidance', {
    schema: {
      description: 'Generate detailed implementation guidance for OAuth configuration',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      body: GenerateGuidanceRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                documentId: { type: 'string' },
                title: { type: 'string' },
                version: { type: 'string' },
                sections: { type: 'number' },
                codeExamples: { type: 'number' }
              }
            }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
  }
    handler: async (request, reply) => {
      try {
        const { configId, guidanceType, includeCodeExamples, includeSecurityConsiderations, includeComplianceNotes } = request.body;

        // This would generate specific guidance based on the request
        // For now, returning a placeholder response
        reply.send({
          success: true,
          data: {
            documentId: `GUIDE-${Date.now()}`,
            title: `OAuth ${guidanceType} - Configuration ${configId}`,
            version: '1.0',
            sections: 8,
            codeExamples: includeCodeExamples ? 12 : 0
          }
        });

      } catch (error) {
        fastify.log.error('Error generating guidance:', error);
        reply.code(500).send({
          error: 'Failed to generate guidance',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Update OAuth configuration
   * PUT /oauth-guidance/configuration/:configId
   */
  fastify.put<{
    Params: { configId: string };
    Body: z.infer<typeof UpdateConfigurationRequestSchema>['updates'];
  }>('/configuration/:configId', {
    schema: {
      description: 'Update OAuth configuration settings',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          configId: { type: 'string' }
  }
        required: ['configId']
  }
      body: UpdateConfigurationRequestSchema.shape.updates,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                configId: { type: 'string' },
                updated: { type: 'boolean' },
                validationRequired: { type: 'boolean' }
              }
            }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      // Check permissions for configuration updates
      if (!request.user.permissions.includes('oauth:configure')) {
        reply.code(403).send({ error: 'Insufficient permissions for configuration updates' });
        return;
      }
  }
    handler: async (request, reply) => {
      try {
        const { configId } = request.params;
        const updates = request.body;

        // Implementation would update the configuration
        // For now, returning success response
        reply.send({
          success: true,
          data: {
            configId,
            updated: true,
            validationRequired: true
          }
        });

      } catch (error) {
        fastify.log.error('Error updating OAuth configuration:', error);
        reply.code(500).send({
          error: 'Failed to update OAuth configuration',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * List OAuth configurations
   * GET /oauth-guidance/configurations
   */
  fastify.get<{
    Querystring: z.infer<typeof ListConfigurationsQuerySchema>;
  }>('/configurations', {
    schema: {
      description: 'List OAuth configurations with filtering and pagination',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      querystring: ListConfigurationsQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                configurations: { type: 'array' },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    pages: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
  }
    handler: async (request, reply) => {
      try {
        const { clientType, status, environment, page, limit } = request.query;

        // Implementation would fetch configurations from database
        // For now, returning placeholder response
        const configurations = [
          {
            configId: 'CFG-001',
            clientType: 'WEB_APPLICATION',
            status: 'ACTIVE',
            environment: 'PRODUCTION',
            createdAt: new Date().toISOString(),
            securityLevel: 'ENHANCED'
          }
        ];

        const total = configurations.length;
        const pages = Math.ceil(total / limit);

        reply.send({
          success: true,
          data: {
            configurations,
            pagination: {
              page,
              limit,
              total,
              pages
            }
          }
        });

      } catch (error) {
        fastify.log.error('Error listing OAuth configurations:', error);
        reply.code(500).send({
          error: 'Failed to list OAuth configurations',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get configuration details
   * GET /oauth-guidance/configuration/:configId
   */
  fastify.get<{
    Params: { configId: string };
  }>('/configuration/:configId', {
    schema: {
      description: 'Get detailed OAuth configuration information',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          configId: { type: 'string' }
  }
        required: ['configId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
  }
    handler: async (request, reply) => {
      try {
        const { configId } = request.params;

        // Implementation would fetch configuration details
        // For now, returning placeholder response
        reply.send({
          success: true,
          data: {
            configId,
            clientType: 'WEB_APPLICATION',
            status: 'ACTIVE',
            securityConfiguration: {
              pkceRequired: true,
              mtlsRequired: false,
              dpopRequired: true
  }
            complianceSettings: {
              gdprCompliance: { enabled: true },
              ccpaCompliance: { enabled: true }
            }
          }
        });

      } catch (error) {
        fastify.log.error('Error getting OAuth configuration:', error);
        reply.code(500).send({
          error: 'Failed to get OAuth configuration',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * List security assessments
   * GET /oauth-guidance/assessments
   */
  fastify.get<{
    Querystring: z.infer<typeof AssessmentQuerySchema>;
  }>('/assessments', {
    schema: {
      description: 'List security assessments with filtering and pagination',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      querystring: AssessmentQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                assessments: { type: 'array' },
                pagination: { type: 'object' }
              }
            }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
  }
    handler: async (request, reply) => {
      try {
        const { clientId, assessmentType, dateRange, page, limit } = request.query;

        // Implementation would fetch assessments from database
        // For now, returning placeholder response
        const assessments = [
          {
            assessmentId: 'ASS-001',
            clientId: 'client-123',
            assessmentType: 'PERIODIC_REVIEW',
            assessmentDate: new Date().toISOString(),
            riskScore: 25,
            status: 'COMPLETED'
          }
        ];

        reply.send({
          success: true,
          data: {
            assessments,
            pagination: {
              page,
              limit,
              total: assessments.length,
              pages: Math.ceil(assessments.length / limit)
            }
          }
        });

      } catch (error) {
        fastify.log.error('Error listing security assessments:', error);
        reply.code(500).send({
          error: 'Failed to list security assessments',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get assessment details
   * GET /oauth-guidance/assessment/:assessmentId
   */
  fastify.get<{
    Params: { assessmentId: string };
  }>('/assessment/:assessmentId', {
    schema: {
      description: 'Get detailed security assessment results',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          assessmentId: { type: 'string' }
  }
        required: ['assessmentId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
  }
    handler: async (request, reply) => {
      try {
        const { assessmentId } = request.params;

        // Implementation would fetch assessment details
        // For now, returning placeholder response
        reply.send({
          success: true,
          data: {
            assessmentId,
            clientId: 'client-123',
            assessmentType: 'PERIODIC_REVIEW',
            riskScore: 25,
            findings: [],
            recommendations: [],
            complianceStatus: {
              gdprCompliant: true,
              ccpaCompliant: true
            }
          }
        });

      } catch (error) {
        fastify.log.error('Error getting security assessment:', error);
        reply.code(500).send({
          error: 'Failed to get security assessment',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Export configuration documentation
   * GET /oauth-guidance/configuration/:configId/export
   */
  fastify.get<{
    Params: { configId: string };
    Querystring: { format?: 'PDF' | 'HTML' | 'MARKDOWN' };
  }>('/configuration/:configId/export', {
    schema: {
      description: 'Export OAuth configuration documentation',
      tags: ['OAuth Guidance'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          configId: { type: 'string' }
  }
        required: ['configId']
  }
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['PDF', 'HTML', 'MARKDOWN'], default: 'PDF' }
        }
      }
  }
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
  }
    handler: async (request, reply) => {
      try {
        const { configId } = request.params;
        const { format = 'PDF' } = request.query;

        // Implementation would generate and return documentation
        // For now, returning success response
        reply.send({
          success: true,
          data: {
            downloadUrl: `/api/downloads/oauth-config-${configId}.${format.toLowerCase()}`,
            format,
            generatedAt: new Date().toISOString()
          }
        });

      } catch (error) {
        fastify.log.error('Error exporting OAuth configuration:', error);
        reply.code(500).send({
          error: 'Failed to export OAuth configuration',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}