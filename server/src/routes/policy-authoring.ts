/**
 * Policy Authoring Routes - Epic 19
 * 
 * REST API endpoints for policy authoring, management, versioning,
 * and deployment capabilities.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { jwtAuthMiddleware } from '../auth/routes';
import { 
  PolicyAuthoringService,
  PolicyType,
  PolicyStatus,
  PolicyAuthoringRequest,
  PolicyUpdateRequest,
  PolicyDeploymentRequest
 from '../services/PolicyAuthoringService';

// Request/Response Schemas
const CreatePolicyRequestSchema = z.object({
  policyType: z.enum(['PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'COOKIE_POLICY', 'DATA_PROCESSING_AGREEMENT', 'CONSENT_POLICY', 'RETENTION_POLICY', 'SECURITY_POLICY', 'ACCEPTABLE_USE_POLICY', 'GDPR_POLICY', 'CCPA_POLICY', 'CUSTOM']),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(1000),
  jurisdiction: z.array(z.string()).min(1),
  complianceFrameworks: z.array(z.string()).default([]),
  audience: z.array(z.string()).min(1),
  templateId: z.string().optional(),
  variables: z.record(z.any()).optional(),
  customizations: z.array(z.any()).optional()
});

const UpdatePolicyRequestSchema = z.object({
  policyId: z.string().min(1),
  version: z.string().min(1),
  changes: z.array(z.object({
    changeId: z.string(),
    type: z.enum(['CONTENT', 'STRUCTURE', 'METADATA', 'VARIABLE', 'TRANSLATION']),
    location: z.string(),
    description: z.string(),
    oldValue: z.any().optional(),
    newValue: z.any().optional(),
    impact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    requiresReacceptance: z.boolean()
  })),
  description: z.string().min(10),
  impact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  requiresApproval: z.boolean(),
  notificationRequired: z.boolean()
});

const DeployPolicyRequestSchema = z.object({
  policyId: z.string().min(1),
  version: z.string().min(1),
  environment: z.enum(['STAGING', 'PRODUCTION']),
  channels: z.array(z.string()).min(1),
  rolloutStrategy: z.object({
    type: z.enum(['IMMEDIATE', 'PHASED', 'CANARY', 'BLUE_GREEN']),
    phases: z.array(z.object({
      phaseId: z.string(),
      name: z.string(),
      percentage: z.number().min(0).max(100),
      audience: z.array(z.string()),
      startDate: z.string().datetime(),
      duration: z.number().min(1),
      successCriteria: z.array(z.any()),
      dependencies: z.array(z.string())
    })),
    rollbackCriteria: z.array(z.any()),
    monitoringPeriod: z.number().min(1)
  }),
  notificationSettings: z.object({
    enabled: z.boolean(),
    channels: z.array(z.object({
      type: z.enum(['EMAIL', 'SMS', 'IN_APP', 'PUSH', 'WEBHOOK']),
      configuration: z.record(z.any()),
      enabled: z.boolean()
    })),
    audiences: z.array(z.string()),
    template: z.string(),
    scheduling: z.object({
      immediate: z.boolean(),
      scheduled: z.string().datetime().optional(),
      recurring: z.object({
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
        interval: z.number().min(1),
        endDate: z.string().datetime().optional(),
        occurrences: z.number().optional()
      }).optional(),
      reminders: z.array(z.object({
        daysBefore: z.number().min(0),
        channel: z.string(),
        template: z.string()
      })).optional()


});

const GenerateFromComplianceRequestSchema = z.object({
  framework: z.string().min(1),
  jurisdiction: z.string().min(1),
  customizations: z.record(z.any()).default({})
});

const ValidateComplianceRequestSchema = z.object({
  policyId: z.string().min(1),
  frameworks: z.array(z.string()).min(1)
});

const CompareVersionsRequestSchema = z.object({
  policyId: z.string().min(1),
  version1: z.string().min(1),
  version2: z.string().min(1)
});

const ExportPolicyRequestSchema = z.object({
  policyId: z.string().min(1),
  version: z.string().min(1),
  format: z.enum(['PDF', 'HTML', 'DOCX', 'JSON', 'XML']),
  options: z.object({
    includeMetadata: z.boolean().default(true),
    includeVersionHistory: z.boolean().default(false),
    customStyling: z.record(z.any()).optional(),
    watermark: z.string().optional(),
    audience: z.string().optional(),
    language: z.string().optional()
  }).default({})
});

const ListPoliciesQuerySchema = z.object({
  policyType: z.enum(['PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'COOKIE_POLICY', 'DATA_PROCESSING_AGREEMENT', 'CONSENT_POLICY', 'RETENTION_POLICY', 'SECURITY_POLICY', 'ACCEPTABLE_USE_POLICY', 'GDPR_POLICY', 'CCPA_POLICY', 'CUSTOM']).optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'DEPRECATED', 'ARCHIVED', 'SUSPENDED']).optional(),
  jurisdiction: z.string().optional(),
  framework: z.string().optional(),
  author: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['title', 'createdAt', 'lastModified', 'status']).default('lastModified'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export async function policyAuthoringRoutes(fastify: FastifyInstance) {
  // Add authentication middleware
  await fastify.register(jwtAuthMiddleware);

  const policyAuthoringService = fastify.policyAuthoringService as PolicyAuthoringService;

  /**
   * Create new policy
   * POST /policy-authoring/create
   */
  fastify.post<{
    Body: z.infer<typeof CreatePolicyRequestSchema>;
>('/create', {
    schema: {
      description: 'Create new policy document',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      body: CreatePolicyRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                policyId: { type: 'string' },
                version: { type: 'string' },
                status: { type: 'string' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('policy:create')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;


    handler: async (request, reply) => {
      try {
        const authorId = request.user.userId;
        const result = await policyAuthoringService.createPolicy(request.body, authorId);

        reply.send({
          success: true,
          data: {
            policyId: result.policyId,
            version: '1.0.0',
            status: 'DRAFT'

        });
 catch (error) {
        fastify.log.error('Error creating policy:', error);
        reply.code(500).send({
          error: 'Failed to create policy',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Update existing policy
   * PUT /policy-authoring/update
   */
  fastify.put<{
    Body: z.infer<typeof UpdatePolicyRequestSchema>;
>('/update', {
    schema: {
      description: 'Update existing policy document',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      body: UpdatePolicyRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                versionId: { type: 'string' },
                newVersion: { type: 'string' },
                requiresApproval: { type: 'boolean' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('policy:update')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;


    handler: async (request, reply) => {
      try {
        const authorId = request.user.userId;
        const result = await policyAuthoringService.updatePolicy(request.body, authorId);

        reply.send({
          success: true,
          data: {
            versionId: result.versionId,
            newVersion: 'auto-incremented',
            requiresApproval: request.body.requiresApproval

        });
 catch (error) {
        fastify.log.error('Error updating policy:', error);
        reply.code(500).send({
          error: 'Failed to update policy',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Deploy policy
   * POST /policy-authoring/deploy
   */
  fastify.post<{
    Body: z.infer<typeof DeployPolicyRequestSchema>;
>('/deploy', {
    schema: {
      description: 'Deploy policy to specified environment',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      body: DeployPolicyRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                deploymentId: { type: 'string' },
                status: { type: 'string' },
                estimatedCompletion: { type: 'string' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      const requiredPermission = request.body.environment === 'PRODUCTION' 
        ? 'policy:deploy:production' 
        : 'policy:deploy:staging';
        
      if (!request.user.permissions.includes(requiredPermission)) {
        reply.code(403).send({ error: 'Insufficient permissions for deployment' });
        return;


    handler: async (request, reply) => {
      try {
        const deployerId = request.user.userId;
        const result = await policyAuthoringService.deployPolicy(request.body, deployerId);

        // Calculate estimated completion time
        const phases = request.body.rolloutStrategy.phases;
        const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
        const estimatedCompletion = new Date();
        estimatedCompletion.setHours(estimatedCompletion.getHours() + totalDuration);

        reply.send({
          success: true,
          data: {
            deploymentId: result.deploymentId,
            status: 'IN_PROGRESS',
            estimatedCompletion: estimatedCompletion.toISOString()

        });
 catch (error) {
        fastify.log.error('Error deploying policy:', error);
        reply.code(500).send({
          error: 'Failed to deploy policy',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Generate policy from compliance framework
   * POST /policy-authoring/generate-compliance
   */
  fastify.post<{
    Body: z.infer<typeof GenerateFromComplianceRequestSchema>;
>('/generate-compliance', {
    schema: {
      description: 'Generate policy from compliance framework template',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      body: GenerateFromComplianceRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                policyId: { type: 'string' },
                suggestions: { type: 'array', items: { type: 'string' } },
                complianceScore: { type: 'number' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user.permissions.includes('policy:generate')) {
        reply.code(403).send({ error: 'Insufficient permissions' });
        return;


    handler: async (request, reply) => {
      try {
        const { framework, jurisdiction, customizations } = request.body;
        const authorId = request.user.userId;

        const result = await policyAuthoringService.generateFromCompliance(
          framework,
          jurisdiction,
          customizations,
          authorId
        );

        reply.send({
          success: true,
          data: {
            policyId: result.policyId,
            suggestions: result.suggestions,
            complianceScore: 95 // Initial score for generated policies

        });
 catch (error) {
        fastify.log.error('Error generating compliance policy:', error);
        reply.code(500).send({
          error: 'Failed to generate compliance policy',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Validate policy compliance
   * POST /policy-authoring/validate-compliance
   */
  fastify.post<{
    Body: z.infer<typeof ValidateComplianceRequestSchema>;
>('/validate-compliance', {
    schema: {
      description: 'Validate policy against compliance frameworks',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      body: ValidateComplianceRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                overallCompliance: { type: 'number' },
                frameworkResults: { type: 'array' },
                recommendations: { type: 'array' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { policyId, frameworks } = request.body;
        
        const result = await policyAuthoringService.validateCompliance(policyId, frameworks);

        reply.send({
          success: true,
          data: result
        });
 catch (error) {
        fastify.log.error('Error validating policy compliance:', error);
        reply.code(500).send({
          error: 'Failed to validate policy compliance',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Compare policy versions
   * POST /policy-authoring/compare-versions
   */
  fastify.post<{
    Body: z.infer<typeof CompareVersionsRequestSchema>;
>('/compare-versions', {
    schema: {
      description: 'Compare two policy versions',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      body: CompareVersionsRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                previousVersion: { type: 'string' },
                changes: { type: 'array' },
                addedSections: { type: 'array' },
                removedSections: { type: 'array' },
                modifiedSections: { type: 'array' },
                impact: { type: 'object' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { policyId, version1, version2 } = request.body;
        
        const comparison = await policyAuthoringService.compareVersions(policyId, version1, version2);

        reply.send({
          success: true,
          data: comparison
        });
 catch (error) {
        fastify.log.error('Error comparing policy versions:', error);
        reply.code(500).send({
          error: 'Failed to compare policy versions',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Export policy
   * POST /policy-authoring/export
   */
  fastify.post<{
    Body: z.infer<typeof ExportPolicyRequestSchema>;
>('/export', {
    schema: {
      description: 'Export policy in specified format',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      body: ExportPolicyRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                downloadUrl: { type: 'string' },
                size: { type: 'number' },
                format: { type: 'string' },
                generatedAt: { type: 'string' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { policyId, version, format, options } = request.body;
        
        const result = await policyAuthoringService.exportPolicy(policyId, version, format, options);

        reply.send({
          success: true,
          data: {
            downloadUrl: result.downloadUrl,
            size: result.size,
            format,
            generatedAt: new Date().toISOString()

        });
 catch (error) {
        fastify.log.error('Error exporting policy:', error);
        reply.code(500).send({
          error: 'Failed to export policy',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * List policies
   * GET /policy-authoring/policies
   */
  fastify.get<{
    Querystring: z.infer<typeof ListPoliciesQuerySchema>;
>('/policies', {
    schema: {
      description: 'List policies with filtering and pagination',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      querystring: ListPoliciesQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                policies: { type: 'array' },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    pages: { type: 'number' }


                filters: { type: 'object' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const filters = request.query;

        // Mock implementation - would fetch from database
        const policies = [
          {
            policyId: 'POL-001',
            title: 'Privacy Policy',
            policyType: 'PRIVACY_POLICY',
            status: 'ACTIVE',
            version: '2.1.0',
            lastModified: new Date().toISOString(),
            createdBy: 'john.doe',
            jurisdiction: ['US', 'EU'],
            complianceFrameworks: ['GDPR', 'CCPA']

          {
            policyId: 'POL-002',
            title: 'Cookie Policy',
            policyType: 'COOKIE_POLICY',
            status: 'DRAFT',
            version: '1.0.0',
            lastModified: new Date().toISOString(),
            createdBy: 'jane.smith',
            jurisdiction: ['US'],
            complianceFrameworks: ['CCPA']

        ];

        const total = policies.length;
        const pages = Math.ceil(total / filters.limit);

        reply.send({
          success: true,
          data: {
            policies,
            pagination: {
              page: filters.page,
              limit: filters.limit,
              total,
              pages

            filters: {
              applied: Object.keys(filters).filter(key => 
                !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) && filters[key]
              ),
              available: ['policyType', 'status', 'jurisdiction', 'framework', 'author']


        });
 catch (error) {
        fastify.log.error('Error listing policies:', error);
        reply.code(500).send({
          error: 'Failed to list policies',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Get policy details
   * GET /policy-authoring/policy/:policyId
   */
  fastify.get<{
    Params: { policyId: string };
    Querystring: { version?: string; includeContent?: boolean };
>('/policy/:policyId', {
    schema: {
      description: 'Get detailed policy information',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          policyId: { type: 'string' }

        required: ['policyId']

      querystring: {
        type: 'object',
        properties: {
          version: { type: 'string' },
          includeContent: { type: 'boolean', default: false }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }




    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { policyId } = request.params;
        const { version, includeContent } = request.query;

        // Mock implementation - would fetch from database
        const policy = {
          policyId,
          title: 'Privacy Policy',
          description: 'Comprehensive privacy policy for data protection',
          policyType: 'PRIVACY_POLICY',
          version: version || '2.1.0',
          status: 'ACTIVE',
          effectiveDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          createdBy: 'john.doe',
          modifiedBy: 'jane.smith',
          jurisdiction: ['US', 'EU'],
          complianceFrameworks: ['GDPR', 'CCPA'],
          audience: ['all-users'],
          languages: ['en', 'es', 'fr'],
          metadata: {
            riskLevel: 'HIGH',
            reviewCycle: 365,
            nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

        };

        if (includeContent) {
          (policy as any).content = {
            sections: [
              {
                sectionId: 'introduction',
                title: 'Introduction',
                order: 1,
                content: 'This privacy policy describes how we collect, use, and protect your personal information.',
                mandatory: true,
                editable: true

            ],
            variables: [],
            attachments: []
          };


        reply.send({
          success: true,
          data: policy
        });
 catch (error) {
        fastify.log.error('Error getting policy details:', error);
        reply.code(500).send({
          error: 'Failed to get policy details',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Get policy versions
   * GET /policy-authoring/policy/:policyId/versions
   */
  fastify.get<{
    Params: { policyId: string };
>('/policy/:policyId/versions', {
    schema: {
      description: 'Get all versions of a policy',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          policyId: { type: 'string' }

        required: ['policyId']

      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                versions: { type: 'array' },
                currentVersion: { type: 'string' },
                totalVersions: { type: 'number' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { policyId } = request.params;

        // Mock implementation - would fetch from database
        const versions = [
          {
            versionId: 'VER-001',
            version: '2.1.0',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdBy: 'jane.smith',
            changeLog: 'Updated privacy rights section for GDPR compliance',
            deploymentInfo: {
              environment: 'PRODUCTION',
              deployedAt: new Date().toISOString(),
              status: 'COMPLETED'


          {
            versionId: 'VER-002',
            version: '2.0.0',
            status: 'DEPRECATED',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'john.doe',
            changeLog: 'Major update for CCPA compliance',
            deploymentInfo: {
              environment: 'PRODUCTION',
              deployedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'COMPLETED'


        ];

        reply.send({
          success: true,
          data: {
            versions,
            currentVersion: '2.1.0',
            totalVersions: versions.length

        });
 catch (error) {
        fastify.log.error('Error getting policy versions:', error);
        reply.code(500).send({
          error: 'Failed to get policy versions',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });

  /**
   * Get available templates
   * GET /policy-authoring/templates
   */
  fastify.get<{
    Querystring: { framework?: string; policyType?: string };
>('/templates', {
    schema: {
      description: 'Get available policy templates',
      tags: ['Policy Authoring'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          framework: { type: 'string' },
          policyType: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                templates: { type: 'array' },
                frameworks: { type: 'array' },
                policyTypes: { type: 'array' }






    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);

    handler: async (request, reply) => {
      try {
        const { framework, policyType } = request.query;

        // Mock implementation - would fetch from database
        const templates = [
          {
            templateId: 'TPL-GDPR-001',
            name: 'GDPR Privacy Policy Template',
            description: 'Comprehensive GDPR-compliant privacy policy template',
            category: 'Privacy',
            framework: 'GDPR',
            policyType: 'PRIVACY_POLICY',
            version: '2.0',
            status: 'ACTIVE',
            variables: [
              { name: 'company_name', type: 'TEXT', required: true },
              { name: 'contact_email', type: 'EMAIL', required: true },
              { name: 'data_retention_period', type: 'NUMBER', required: true }
            ]

          {
            templateId: 'TPL-CCPA-001',
            name: 'CCPA Privacy Policy Template',
            description: 'CCPA-compliant privacy policy for California residents',
            category: 'Privacy',
            framework: 'CCPA',
            policyType: 'PRIVACY_POLICY',
            version: '1.5',
            status: 'ACTIVE',
            variables: [
              { name: 'business_name', type: 'TEXT', required: true },
              { name: 'contact_method', type: 'TEXT', required: true }
            ]

        ];

        const filteredTemplates = templates.filter(template => {
          if (framework && template.framework !== framework) return false;
          if (policyType && template.policyType !== policyType) return false;
          return true;
        });

        reply.send({
          success: true,
          data: {
            templates: filteredTemplates,
            frameworks: ['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI-DSS'],
            policyTypes: ['PRIVACY_POLICY', 'COOKIE_POLICY', 'TERMS_OF_SERVICE', 'DATA_PROCESSING_AGREEMENT']

        });
 catch (error) {
        fastify.log.error('Error getting templates:', error);
        reply.code(500).send({
          error: 'Failed to get templates',
          message: error instanceof Error ? error.message : 'Unknown error'
        });


  });
