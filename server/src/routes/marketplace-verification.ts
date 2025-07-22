import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import multer from 'fastify-multer';
import { 
  VerificationProcessService, 
  VerificationType, 
  DocumentType, 
  VerificationStatus, 
  VerificationDecision 
} from '../services/VerificationProcessService';
import { DocumentVerificationService } from '../services/DocumentVerificationService';

// Request interfaces
interface SubmitVerificationRequest {
  verification_type: VerificationType;
  user_info?: any;
  business_info?: any;
  notes?: string;
}

interface UploadDocumentRequest {
  document_type: DocumentType;
}

interface VerificationQueueQuery {
  status?: VerificationStatus;
  type?: VerificationType;
  limit?: number;
  offset?: number;
  sort_by?: 'submitted_at' | 'priority' | 'type';
  sort_order?: 'asc' | 'desc';
}

interface ProcessDecisionRequest extends VerificationDecision {
  // Extends the base decision interface
}

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Max 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

export async function marketplaceVerificationRoutes(fastify: FastifyInstance, pool: Pool) {
  const verificationService = new VerificationProcessService(pool);
  const documentService = new DocumentVerificationService(pool);

  // Initialize database schemas
  await verificationService.initializeSchema();
  await documentService.initializeSchema();

  // Register multer
  await fastify.register(multer.contentParser);

  // Submit verification request
  fastify.post<{
    Body: SubmitVerificationRequest;
  }>('/marketplace/verification/submit', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: SubmitVerificationRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { verification_type, user_info, business_info, notes } = request.body;

      if (!Object.values(VerificationType).includes(verification_type)) {
        reply.code(400).send({ error: 'Invalid verification type' });
        return;
      }

      const metadata = {
        user_info: user_info || {},
        business_info: business_info || {},
        notes: notes || '',
        documents: []
      };

      const verificationRequest = await verificationService.submitVerificationRequest(
        userId,
        verification_type,
        metadata
      );

      return {
        success: true,
        request: verificationRequest,
        message: 'Verification request submitted successfully',
        next_steps: [
          'Upload required documents',
          'Wait for admin review',
          'You will be notified of the decision via email'
        ]
      };

    } catch (error) {
      request.log.error('Verification submission error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to submit verification request',
        message: error.message
      });
    }
  });

  // Upload document
  fastify.post<{
    Params: { requestId: string };
    Body: UploadDocumentRequest;
  }>('/marketplace/verification/:requestId/upload', {
    preHandler: [fastify.jwtAuth, upload.single('document')]
  }, async (request: FastifyRequest<{
    Params: { requestId: string };
    Body: UploadDocumentRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const { requestId } = request.params;
      const { document_type } = request.body;
      const file = (request as any).file;

      if (!file) {
        reply.code(400).send({ error: 'No file uploaded' });
        return;
      }

      if (!Object.values(DocumentType).includes(document_type)) {
        reply.code(400).send({ error: 'Invalid document type' });
        return;
      }

      // Upload document
      const document = await verificationService.uploadDocument(
        requestId,
        userId,
        {
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size
        },
        document_type
      );

      // Validate and analyze document
      const validation = await documentService.validateDocument(document.id, document.file_path);
      
      // Determine analysis type based on document type
      let analysisType: 'identity' | 'business' | 'address' | 'financial' = 'identity';
      if ([DocumentType.BUSINESS_LICENSE, DocumentType.ARTICLES_OF_INCORPORATION].includes(document_type)) {
        analysisType = 'business';
      } else if ([DocumentType.UTILITY_BILL, DocumentType.BANK_STATEMENT].includes(document_type)) {
        analysisType = 'address';
      } else if ([DocumentType.TAX_DOCUMENT, DocumentType.BANK_STATEMENT].includes(document_type)) {
        analysisType = 'financial';
      }

      const analysis = await documentService.analyzeDocument(document.id, document.file_path, analysisType);

      return {
        success: true,
        document,
        validation: {
          is_valid: validation.is_valid,
          validation_score: validation.validation_score,
          issues: validation.issues,
          recommendations: validation.recommendations
        },
        analysis: {
          confidence_score: analysis.confidence_score,
          verification_status: analysis.verification_status,
          flags: analysis.flags
        }
      };

    } catch (error) {
      request.log.error('Document upload error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to upload document',
        message: error.message
      });
    }
  });

  // Get user's verification requests
  fastify.get('/marketplace/verification/my-requests', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      if (!userId) {
        reply.code(401).send({ error: 'User not authenticated' });
        return;
      }

      const requests = await verificationService.getUserVerificationRequests(userId);

      return {
        requests: requests.map(req => ({
          id: req.id,
          verification_type: req.verification_type,
          status: req.status,
          submitted_at: req.submitted_at,
          expiry_date: req.expiry_date,
          document_count: req.metadata.documents?.length || 0,
          rejection_reason: req.rejection_reason
        }))
      };

    } catch (error) {
      request.log.error('User requests retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve verification requests',
        message: error.message
      });
    }
  });

  // Admin: Get verification queue
  fastify.get<{
    Querystring: VerificationQueueQuery;
  }>('/marketplace/verification/admin/queue', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: VerificationQueueQuery;
  }>, reply: FastifyReply) => {
    try {
      const adminUserId = (request.user as any)?.id;
      const filters = request.query;

      const queue = await verificationService.getVerificationQueue(adminUserId, filters);

      return {
        ...queue,
        filters,
        summary: {
          total_items: queue.total,
          current_page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1,
          items_per_page: filters.limit || 50,
          total_pages: Math.ceil(queue.total / (filters.limit || 50))
        }
      };

    } catch (error) {
      request.log.error('Verification queue retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve verification queue',
        message: error.message
      });
    }
  });

  // Admin: Process verification decision
  fastify.post<{
    Body: ProcessDecisionRequest;
  }>('/marketplace/verification/admin/decision', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: ProcessDecisionRequest;
  }>, reply: FastifyReply) => {
    try {
      const adminUserId = (request.user as any)?.id;
      const decision = request.body;

      if (!decision.request_id) {
        reply.code(400).send({ error: 'Request ID is required' });
        return;
      }

      if (!['approve', 'reject'].includes(decision.decision)) {
        reply.code(400).send({ error: 'Decision must be "approve" or "reject"' });
        return;
      }

      if (decision.decision === 'reject' && !decision.rejection_reason) {
        reply.code(400).send({ error: 'Rejection reason is required for rejected requests' });
        return;
      }

      const updatedRequest = await verificationService.processVerificationDecision(adminUserId, decision);

      return {
        success: true,
        request: updatedRequest,
        message: `Verification request ${decision.decision}d successfully`,
        actions_taken: decision.decision === 'approve' 
          ? ['User verification status updated', 'Verification badges assigned']
          : ['User notified of rejection', 'Reason documented']
      };

    } catch (error) {
      request.log.error('Verification decision error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to process verification decision',
        message: error.message
      });
    }
  });

  // Admin: Get verification statistics
  fastify.get<{
    Querystring: { timeframe?: 'week' | 'month' | 'quarter' };
  }>('/marketplace/verification/admin/statistics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.some((role: string) => ['admin', 'security', 'ops'].includes(role))) {
        reply.code(403).send({ error: 'Admin or security role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Querystring: { timeframe?: 'week' | 'month' | 'quarter' };
  }>, reply: FastifyReply) => {
    try {
      const { timeframe = 'month' } = request.query;
      
      const statistics = await verificationService.getVerificationStatistics(timeframe);

      return {
        timeframe,
        statistics,
        insights: {
          queue_health: statistics.total_pending < 50 ? 'healthy' : 'needs_attention',
          processing_efficiency: statistics.avg_processing_time < 3 ? 'excellent' : 
                                statistics.avg_processing_time < 7 ? 'good' : 'needs_improvement',
          approval_trend: statistics.approval_rate > 80 ? 'high_approval' :
                         statistics.approval_rate > 60 ? 'moderate_approval' : 'high_rejection'
        },
        recommendations: this.generateRecommendations(statistics)
      };

    } catch (error) {
      request.log.error('Statistics retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve verification statistics',
        message: error.message
      });
    }
  });

  // Get document validation results
  fastify.get<{
    Params: { documentId: string };
  }>('/marketplace/verification/document/:documentId/validation', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { documentId: string };
  }>, reply: FastifyReply) => {
    try {
      const { documentId } = request.params;
      
      const validation = await documentService.getDocumentValidation(documentId);
      if (!validation) {
        reply.code(404).send({ error: 'Document validation not found' });
        return;
      }

      const analysis = await documentService.getDocumentAnalysis(documentId);

      return {
        validation,
        analysis,
        summary: {
          overall_status: validation.is_valid ? 'valid' : 'invalid',
          confidence_level: validation.validation_score > 0.8 ? 'high' :
                           validation.validation_score > 0.6 ? 'medium' : 'low',
          issues_count: validation.issues.length,
          recommendations_count: validation.recommendations.length
        }
      };

    } catch (error) {
      request.log.error('Document validation retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve document validation',
        message: error.message
      });
    }
  });

  // Health check endpoint
  fastify.get('/marketplace/verification/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connectivity
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      // Check upload directory
      const fs = await import('fs');
      const uploadDir = require('path').join(process.cwd(), 'uploads', 'verification');
      const uploadDirExists = fs.existsSync(uploadDir);

      return {
        status: 'healthy',
        checks: {
          database: 'connected',
          upload_directory: uploadDirExists ? 'accessible' : 'not_found',
          services: {
            verification_process: 'operational',
            document_verification: 'operational'
          }
        },
        configuration: {
          max_file_size: '10MB',
          supported_formats: ['PDF', 'JPEG', 'PNG', 'WebP'],
          verification_types: Object.values(VerificationType),
          document_types: Object.values(DocumentType)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      request.log.error('Verification system health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Helper function for generating recommendations
  function generateRecommendations(stats: any): string[] {
    const recommendations = [];

    if (stats.total_pending > 50) {
      recommendations.push('Consider hiring additional verification staff to reduce queue backlog');
    }

    if (stats.avg_processing_time > 7) {
      recommendations.push('Review verification processes to improve processing speed');
    }

    if (stats.approval_rate < 60) {
      recommendations.push('Investigate high rejection rate - may indicate unclear requirements or fraudulent attempts');
    }

    if (stats.approval_rate > 95) {
      recommendations.push('Review verification criteria - unusually high approval rate may indicate insufficient scrutiny');
    }

    return recommendations;
  }
}