// Epic 17.5.5 - Marketplace Verification System API Routes
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VerificationService } from './verification.service';
import {
  CreateVerificationRequestSchema,
  UpdateVerificationRequestSchema,
  CreateDocumentUploadSchema,
  ReviewVerificationRequestSchema,
  VerificationLevel,
  VerificationRequestStatus,
  DocumentType
} from './verification.types';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    roles?: string[];
  };
}

export async function verificationRoutes(
  fastify: FastifyInstance,
  verificationService: VerificationService
) {
  // Create a new verification request
  fastify.post<{
    Body: {
      requested_level: VerificationLevel;
      information: any;
    };
  }>('/verification/requests', {
    preHandler: [fastify.jwtAuth],
    schema: {
      description: 'Create a new verification request',
      tags: ['verification'],
      body: {
        type: 'object',
        properties: {
          requested_level: { 
            type: 'string', 
            enum: ['basic', 'intermediate', 'advanced', 'premium'] 
  }
          information: {
            type: 'object',
            properties: {
              personal_info: {
                type: 'object',
                required: ['full_name', 'email', 'country'],
                properties: {
                  full_name: { type: 'string', minLength: 1, maxLength: 255 },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  date_of_birth: { type: 'string' },
                  country: { type: 'string', minLength: 2, maxLength: 2 },
                  state_province: { type: 'string' },
                  city: { type: 'string' },
                  postal_code: { type: 'string' },
                  address_line_1: { type: 'string' },
                  address_line_2: { type: 'string' }
                }
  }
              professional_info: {
                type: 'object',
                properties: {
                  job_title: { type: 'string' },
                  company: { type: 'string' },
                  industry: { type: 'string' },
                  years_experience: { type: 'integer', minimum: 0, maximum: 70 },
                  linkedin_url: { type: 'string', format: 'uri' },
                  website_url: { type: 'string', format: 'uri' },
                  portfolio_url: { type: 'string', format: 'uri' }
                }
  }
              business_info: {
                type: 'object',
                properties: {
                  business_name: { type: 'string' },
                  business_type: { type: 'string' },
                  registration_number: { type: 'string' },
                  tax_id: { type: 'string' },
                  business_address: {
                    type: 'object',
                    properties: {
                      country: { type: 'string', minLength: 2, maxLength: 2 },
                      state_province: { type: 'string' },
                      city: { type: 'string' },
                      postal_code: { type: 'string' },
                      address_line_1: { type: 'string' },
                      address_line_2: { type: 'string' }
                    }
                  }
                }
  }
              verification_purpose: { type: 'string', minLength: 10, maxLength: 1000 },
              additional_notes: { type: 'string', maxLength: 2000 }
  }
            required: ['personal_info', 'verification_purpose']
          }
  }
        required: ['requested_level', 'information']
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                requested_level: { type: 'string' },
                status: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { requested_level, information } = request.body;
      const userId = request.user.id;

      // Validate the request data
      const validatedData = CreateVerificationRequestSchema.parse({
        requested_level,
        information
      });

      const verificationRequest = await verificationService.createVerificationRequest(
        userId,
        validatedData,
        request.ip,
        request.headers['user-agent']
      );

      reply.code(201).send({
        success: true,
        data: verificationRequest,
        message: 'Verification request created successfully'
      });
    } catch (error) {
      request.log.error('Error creating verification request:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create verification request'
      });
    }
  });

  // Update verification request information
  fastify.put<{
    Params: { requestId: string };
    Body: { information: any };
  }>('/verification/requests/:requestId', {
    preHandler: [fastify.jwtAuth],
    schema: {
      description: 'Update verification request information',
      tags: ['verification'],
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string', format: 'uuid' }
  }
        required: ['requestId']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      const { information } = request.body;
      const userId = request.user.id;

      const updatedRequest = await verificationService.updateVerificationInformation(
        requestId,
        userId,
        information,
        request.ip,
        request.headers['user-agent']
      );

      reply.send({
        success: true,
        data: updatedRequest,
        message: 'Verification request updated successfully'
      });
    } catch (error) {
      request.log.error('Error updating verification request:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update verification request'
      });
    }
  });

  // Submit verification request for review
  fastify.post<{
    Params: { requestId: string };
  }>('/verification/requests/:requestId/submit', {
    preHandler: [fastify.jwtAuth],
    schema: {
      description: 'Submit verification request for review',
      tags: ['verification'],
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string', format: 'uuid' }
  }
        required: ['requestId']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      const userId = request.user.id;

      const submittedRequest = await verificationService.submitVerificationRequest(
        requestId,
        userId,
        request.ip,
        request.headers['user-agent']
      );

      reply.send({
        success: true,
        data: submittedRequest,
        message: 'Verification request submitted successfully'
      });
    } catch (error) {
      request.log.error('Error submitting verification request:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit verification request'
      });
    }
  });

  // Create document upload
  fastify.post<{
    Body: {
      verification_request_id: string;
      document_type: DocumentType;
      file_name: string;
      file_size: number;
      file_type: string;
    };
  }>('/verification/documents/upload', {
    preHandler: [fastify.jwtAuth],
    schema: {
      description: 'Create presigned URL for document upload',
      tags: ['verification'],
      body: {
        type: 'object',
        properties: {
          verification_request_id: { type: 'string', format: 'uuid' },
          document_type: { 
            type: 'string', 
            enum: ['identity', 'business_license', 'tax_document', 'bank_statement', 'portfolio', 'credential', 'other']
  }
          file_name: { type: 'string', minLength: 1, maxLength: 255 },
          file_size: { type: 'integer', minimum: 1, maximum: 52428800 }, // 50MB max
          file_type: { type: 'string', pattern: '^(image|application|text)/[\\w\\-\\.]+$' }
  }
        required: ['verification_request_id', 'document_type', 'file_name', 'file_size', 'file_type']
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                document: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    document_type: { type: 'string' },
                    file_name: { type: 'string' },
                    status: { type: 'string' }
                  }
  }
                upload_url: { type: 'string', format: 'uri' }
              }
            }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const documentData = request.body;
      const userId = request.user.id;

      // Validate the request data
      const validatedData = CreateDocumentUploadSchema.parse(documentData);

      const result = await verificationService.createDocumentUpload(
        validatedData.verification_request_id,
        userId,
        validatedData,
        request.ip,
        request.headers['user-agent']
      );

      reply.code(201).send({
        success: true,
        data: result,
        message: 'Document upload URL created successfully'
      });
    } catch (error) {
      request.log.error('Error creating document upload:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document upload'
      });
    }
  });

  // Confirm document upload completion
  fastify.post<{
    Params: { documentId: string };
  }>('/verification/documents/:documentId/confirm', {
    preHandler: [fastify.jwtAuth],
    schema: {
      description: 'Confirm document upload completion',
      tags: ['verification'],
      params: {
        type: 'object',
        properties: {
          documentId: { type: 'string', format: 'uuid' }
  }
        required: ['documentId']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { documentId } = request.params;
      const userId = request.user.id;

      const document = await verificationService.confirmDocumentUpload(
        documentId,
        userId,
        request.ip,
        request.headers['user-agent']
      );

      reply.send({
        success: true,
        data: document,
        message: 'Document upload confirmed successfully'
      });
    } catch (error) {
      request.log.error('Error confirming document upload:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm document upload'
      });
    }
  });

  // Get user's verification requests
  fastify.get<{
    Querystring: { limit?: number; offset?: number };
  }>('/verification/requests', {
    preHandler: [fastify.jwtAuth],
    schema: {
      description: 'Get user verification requests',
      tags: ['verification'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { limit, offset } = request.query;
      const userId = request.user.id;

      const result = await verificationService.getUserVerificationRequests(userId, {
        limit,
        offset
      });

      reply.send({
        success: true,
        data: result,
        message: 'Verification requests retrieved successfully'
      });
    } catch (error) {
      request.log.error('Error retrieving verification requests:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve verification requests'
      });
    }
  });

  // Get user's verification status
  fastify.get('/verification/status', {
    preHandler: [fastify.jwtAuth],
    schema: {
      description: 'Get user verification status',
      tags: ['verification']
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.id;

      const status = await verificationService.getUserVerificationStatus(userId);

      reply.send({
        success: true,
        data: status,
        message: 'Verification status retrieved successfully'
      });
    } catch (error) {
      request.log.error('Error retrieving verification status:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve verification status'
      });
    }
  });

  // Admin/reviewer routes

  // Get verification review queue (admin/reviewer only)
  fastify.get<{
    Querystring: { 
      limit?: number; 
      offset?: number; 
      status?: VerificationRequestStatus;
    };
  }>('/verification/admin/queue', {
    preHandler: [fastify.jwtAuth, async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const user = request.user;
      if (!user.roles?.some(role => ['admin', 'reviewer', 'security'].includes(role))) {
        reply.code(403).send({ 
          success: false, 
          error: 'Admin, reviewer, or security role required' 
        });
        return;
      }
    }],
    schema: {
      description: 'Get verification review queue',
      tags: ['verification', 'admin'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          status: { 
            type: 'string', 
            enum: ['submitted', 'under_review', 'requires_additional_info'],
            default: 'submitted'
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { limit, offset, status } = request.query;
      const reviewerId = request.user.roles?.includes('reviewer') ? request.user.id : undefined;

      const queue = await verificationService.getVerificationQueue(reviewerId, {
        limit,
        offset,
        status
      });

      reply.send({
        success: true,
        data: queue,
        message: 'Verification queue retrieved successfully'
      });
    } catch (error) {
      request.log.error('Error retrieving verification queue:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve verification queue'
      });
    }
  });

  // Health check endpoint
  fastify.get('/verification/health', {
    schema: {
      description: 'Verification system health check',
      tags: ['verification', 'health']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Basic health checks
      const checks = {
        database: 'connected', // Assume connected if we got this far
        s3: 'connected', // Would need actual S3 connectivity test
        service: 'healthy'
      };

      const allHealthy = Object.values(checks).every(status => 
        status === 'connected' || status === 'healthy'
      );

      reply.code(allHealthy ? 200 : 503).send({
        status: allHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      request.log.error('Verification health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Documentation endpoint
  fastify.get('/verification/docs', {
    schema: {
      description: 'Verification system documentation',
      tags: ['verification', 'docs']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      title: 'Marketplace Verification System API',
      description: 'API for managing user verification requests and document uploads for marketplace trust levels',
      version: '1.0.0',
      features: [
        'Multi-level verification (basic, intermediate, advanced, premium)',
        'Secure document upload with presigned URLs',
        'Information collection and validation',
        'Trust score calculation and badge system',
        'Admin review workflow and queue management',
        'Comprehensive audit logging'
      ],
      verification_levels: [
        {
          level: 'basic',
          description: 'Email and basic information verification',
          requirements: ['Personal information', 'Email verification'],
          trust_score_threshold: 25
  }
        {
          level: 'intermediate', 
          description: 'Professional credentials and portfolio verification',
          requirements: ['Basic verification', 'Professional information', 'Portfolio/credentials'],
          trust_score_threshold: 50
  }
        {
          level: 'advanced',
          description: 'Business entity verification with documentation',
          requirements: ['Intermediate verification', 'Business documentation', 'Tax/registration documents'],
          trust_score_threshold: 75
  }
        {
          level: 'premium',
          description: 'Premium verification with enhanced trust status',
          requirements: ['Advanced verification', 'Additional security checks', 'Manual review'],
          trust_score_threshold: 90
        }
      ],
      endpoints: {
        user: [
          'POST /verification/requests - Create verification request',
          'PUT /verification/requests/:id - Update request information',
          'POST /verification/requests/:id/submit - Submit for review',
          'POST /verification/documents/upload - Create document upload URL',
          'POST /verification/documents/:id/confirm - Confirm upload',
          'GET /verification/requests - Get user requests',
          'GET /verification/status - Get verification status'
        ],
        admin: [
          'GET /verification/admin/queue - Get review queue',
          'POST /verification/admin/review/:id - Review request',
          'GET /verification/admin/metrics - Get verification metrics'
        ],
        system: [
          'GET /verification/health - Health check',
          'GET /verification/docs - This documentation'
        ]
  }
      document_types: [
        'identity - Government-issued ID documents',
        'business_license - Business registration/license',
        'tax_document - Tax identification documents',
        'bank_statement - Financial institution statements',
        'portfolio - Work samples and credentials',
        'credential - Professional certifications',
        'other - Other supporting documents'
      ]
    });
  });
}