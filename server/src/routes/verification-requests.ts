/**
 * Verification Request API Routes - E17-1753114397395-B624E7
 * 
 * API endpoints for submitting and managing verification requests.
 * Handles document uploads, status tracking, and request management.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { 
  identityValidationService,
  IdentityValidationType,
  IdentityValidationData
} from '../../../packages/core/auth/IdentityValidation';

}
interface SubmitVerificationRequestBody {
  userId: string;
  verificationType: IdentityValidationType;
  data: Partial<IdentityValidationData>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestSource?: 'profile_setup' | 'manual_request' | 'system_triggered';
}
  };
}

}
interface GetVerificationStatusParams {
  userId: string;
  requestId?: string;
}
}

/**
 * Submit a new verification request
 */
export async function submitVerificationRequest(
  request: FastifyRequest<{ Body: SubmitVerificationRequestBody }>,
  reply: FastifyReply
) {
  try {
    const { userId, verificationType, data, metadata = {} } = request.body;
    
    // Input validation
    if (!userId || !verificationType || !data) {
      return reply.status(400).send({
        error: 'Missing required fields',
        message: 'userId, verificationType, and data are required'
      });
    }
    
    // Extract metadata from request
    const requestMetadata = {
      ipAddress: metadata.ipAddress || request.ip,
      userAgent: metadata.userAgent || request.headers['user-agent'] || 'Unknown',
      sessionId: metadata.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestSource: metadata.requestSource || 'manual_request'
    };
    
    // Submit verification request
    const result = await identityValidationService.submitValidationRequest(
      userId,
      verificationType,
      data,
      requestMetadata
    );
    
    // Log the submission
    console.log(`Verification request submitted: ${result.requestId} for user ${userId}, type: ${verificationType}`);
    
    reply.status(201).send({
      success: true,
      data: {
        requestId: result.requestId,
        status: result.status,
        verificationType,
        submittedAt: new Date().toISOString()
  }
      message: 'Verification request submitted successfully'
    });
    
  } catch (error) {
    console.error('Error submitting verification request:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to submit verification request'
    });
  }
}

/**
 * Get verification status for a user or specific request
 */
export async function getVerificationStatus(
  request: FastifyRequest<{ Params: GetVerificationStatusParams }>,
  reply: FastifyReply
) {
  try {
    const { userId, requestId } = request.params;
    
    if (!userId) {
      return reply.status(400).send({
        error: 'Missing userId parameter'
      });
    }
    
    if (requestId) {
      // Get specific request status
      const requestStatus = identityValidationService.getValidationStatus(requestId);
      const requestResult = identityValidationService.getValidationResult(requestId);
      
      if (!requestStatus) {
        return reply.status(404).send({
          error: 'Verification request not found'
        });
      }
      
      reply.send({
        success: true,
        data: {
          request: requestStatus,
          result: requestResult
        }
      });
    } else {
      // Get all verifications for user
      const userValidations = identityValidationService.getUserValidations(userId);
      const validationSummary = identityValidationService.getUserValidationSummary(userId);
      const trustScore = identityValidationService.getUserTrustScore(userId);
      
      reply.send({
        success: true,
        data: {
          summary: validationSummary,
          trustScore,
          requests: userValidations.map(request => ({
            requestId: request.requestId,
            type: request.type,
            status: request.status,
            timestamp: request.timestamp,
            metadata: request.metadata
          }))
        }
      });
    }
    
  } catch (error) {
    console.error('Error getting verification status:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve verification status'
    });
  }
}

/**
 * Get user's trust score
 */
export async function getUserTrustScore(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  try {
    const { userId } = request.params;
    
    if (!userId) {
      return reply.status(400).send({
        error: 'Missing userId parameter'
      });
    }
    
    const trustScore = identityValidationService.getUserTrustScore(userId);
    
    if (!trustScore) {
      return reply.status(404).send({
        error: 'Trust score not found',
        message: 'User has no completed verifications'
      });
    }
    
    reply.send({
      success: true,
      data: trustScore
    });
    
  } catch (error) {
    console.error('Error getting trust score:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve trust score'
    });
  }
}

/**
 * Get validation result details
 */
export async function getValidationResult(
  request: FastifyRequest<{ Params: { requestId: string } }>,
  reply: FastifyReply
) {
  try {
    const { requestId } = request.params;
    
    if (!requestId) {
      return reply.status(400).send({
        error: 'Missing requestId parameter'
      });
    }
    
    const result = identityValidationService.getValidationResult(requestId);
    
    if (!result) {
      return reply.status(404).send({
        error: 'Validation result not found'
      });
    }
    
    reply.send({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error getting validation result:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve validation result'
    });
  }
}

/**
 * Get verification types and requirements
 */
export async function getVerificationTypes(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const verificationTypes = [
      {
        type: 'email_verification',
        title: 'Email Verification',
        description: 'Verify your email address for account security',
        required: true,
        estimatedTime: '5 minutes',
        requirements: ['Valid email address'],
        fields: ['email']
  }
      {
        type: 'phone_verification',
        title: 'Phone Verification',
        description: 'Add phone number for two-factor authentication',
        required: false,
        estimatedTime: '10 minutes',
        requirements: ['Valid phone number with country code'],
        fields: ['phoneNumber']
  }
      {
        type: 'government_id',
        title: 'Government ID',
        description: 'Upload government-issued identification',
        required: false,
        estimatedTime: '2-3 business days',
        requirements: [
          'Clear photo of government ID (passport, driver\'s license, or national ID)',
          'ID must be current and not expired',
          'All text must be legible'
        ],
        fields: ['governmentId'],
        acceptedDocuments: ['passport', 'drivers_license', 'national_id']
  }
      {
        type: 'professional_credentials',
        title: 'Professional Credentials',
        description: 'Verify your film industry experience and credentials',
        required: false,
        estimatedTime: '3-5 business days',
        requirements: [
          'Professional credentials or certifications',
          'Portfolio of previous work',
          'Industry references or affiliations'
        ],
        fields: ['professionalCredentials'],
        acceptedDocuments: ['degree', 'certificate', 'award', 'credit']
  }
      {
        type: 'social_media_verification',
        title: 'Social Media Verification',
        description: 'Link your professional social media profiles',
        required: false,
        estimatedTime: '1-2 business days',
        requirements: [
          'Active professional social media profiles',
          'Consistent identity across platforms',
          'Public or professional content'
        ],
        fields: ['socialMediaProfiles'],
        supportedPlatforms: ['linkedin', 'twitter', 'instagram', 'imdb', 'website']
      }
    ];
    
    reply.send({
      success: true,
      data: verificationTypes
    });
    
  } catch (error) {
    console.error('Error getting verification types:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve verification types'
    });
  }
}

/**
 * Upload documents for verification
 */
export async function uploadVerificationDocuments(
  request: FastifyRequest<{ 
    Params: { requestId: string };
    Body: { files: { name: string; data: string; type: string }[] }
  }>,
  reply: FastifyReply
) {
  try {
    const { requestId } = request.params;
    const { files } = request.body;
    
    if (!requestId) {
      return reply.status(400).send({
        error: 'Missing requestId parameter'
      });
    }
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return reply.status(400).send({
        error: 'No files provided'
      });
    }
    
    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return reply.status(400).send({
          error: `File type ${file.type} is not allowed`,
          allowedTypes
        });
      }
      
      // Check base64 file size (approximate)
      const fileSize = (file.data.length * 3) / 4;
      if (fileSize > maxFileSize) {
        return reply.status(400).send({
          error: `File ${file.name} exceeds maximum size of 10MB`
        });
      }
    }
    
    // In a real implementation, you would:
    // 1. Store files in secure storage (S3, etc.)
    // 2. Run virus scanning
    // 3. Generate secure URLs
    // 4. Update verification request with document references
    
    // Mock file processing
    const processedFiles = files.map((file, index) => ({
      id: `doc_${requestId}_${index}_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: (file.data.length * 3) / 4,
      url: `https://secure-docs.example.com/${requestId}/${file.name}`,
      uploadedAt: new Date().toISOString()
    }));
    
    console.log(`Uploaded ${processedFiles.length} documents for request ${requestId}`);
    
    reply.status(201).send({
      success: true,
      data: {
        requestId,
        uploadedFiles: processedFiles,
        message: `Successfully uploaded ${processedFiles.length} document(s)`
      }
    });
    
  } catch (error) {
    console.error('Error uploading verification documents:', error);
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to upload documents'
    });
  }
}

/**
 * Register verification request routes
 */
export function registerVerificationRoutes(fastify: any) {
  // Submit verification request
  fastify.post('/api/verification/submit', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'verificationType', 'data'],
        properties: {
          userId: { type: 'string' },
          verificationType: { type: 'string' },
          data: { type: 'object' },
          metadata: { type: 'object' }
        }
      }
    }
  }, submitVerificationRequest);
  
  // Get verification status
  fastify.get('/api/verification/status/:userId', getVerificationStatus);
  fastify.get('/api/verification/status/:userId/:requestId', getVerificationStatus);
  
  // Get user trust score
  fastify.get('/api/verification/trust-score/:userId', getUserTrustScore);
  
  // Get validation result
  fastify.get('/api/verification/result/:requestId', getValidationResult);
  
  // Get verification types
  fastify.get('/api/verification/types', getVerificationTypes);
  
  // Upload documents
  fastify.post('/api/verification/upload/:requestId', uploadVerificationDocuments);
}