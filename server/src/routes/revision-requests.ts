/**
 * Revision Request API Routes - E17-1753114397311-674990
 * 
 * RESTful API endpoints for comprehensive revision request management
 * for Epic 17 - Backstage Admin Controls.
 * 
 * Following patterns from AppealProcessService routes and DocumentReviewInterface.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  RevisionRequestService 
} from '../services/RevisionRequestService';
import { Database } from '../database/connection';
import {
  RevisionRequest,
  RevisionRequestStatus,
  RevisionRequestPriority,
  RevisionContentType,
  RevisionRequestType,
  RevisionEvidenceType,
  RevisionRequestSearchQuery,
  RevisionRequestFormData,
  RevisionRequestReviewFormData,
  RevisionRequestExportRequest
} from '../../../packages/core/types/RevisionRequestTypes';

// Request type definitions
interface CreateRevisionRequestRequest {
  Body: {
    title: string;
    description: string;
    requestedChanges: string;
    businessJustification: string;
    contentType: RevisionContentType;
    contentId: string;
    contentTitle?: string;
    type: RevisionRequestType;
    priority: RevisionRequestPriority;
    dueDate?: string;
    estimatedHours?: number;
    tags?: string[];
  };
}

interface GetRevisionRequestRequest {
  Params: {
    requestId: string;
  };
}

interface UpdateRevisionRequestRequest {
  Params: {
    requestId: string;
  };
  Body: {
    title?: string;
    description?: string;
    requestedChanges?: string;
    businessJustification?: string;
    priority?: RevisionRequestPriority;
    dueDate?: string;
    estimatedHours?: number;
    tags?: string[];
    status?: RevisionRequestStatus;
    reviewNotes?: string;
    rejectionReason?: string;
    approvalNotes?: string;
    implementationNotes?: string;
  };
}

interface SearchRevisionRequestsRequest {
  Querystring: {
    // Basic filters
    status?: RevisionRequestStatus[];
    priority?: RevisionRequestPriority[];
    contentType?: RevisionContentType[];
    type?: RevisionRequestType[];
    
    // Assignment filters
    requesterId?: string;
    reviewerId?: string;
    unassigned?: boolean;
    
    // Date filters
    startDate?: string;
    endDate?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
    
    // Content filters
    contentId?: string;
    tags?: string[];
    
    // Text search
    search?: string;
    
    // Pagination and sorting
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

interface AssignReviewerRequest {
  Params: {
    requestId: string;
  };
  Body: {
    reviewerId: string;
    reviewerName: string;
  };
}

interface ReviewRevisionRequestRequest {
  Params: {
    requestId: string;
  };
  Body: {
    decision: 'approve' | 'reject' | 'request_info';
    reviewNotes: string;
    rejectionReason?: string;
    approvalNotes?: string;
    estimatedImplementationHours?: number;
    implementationPlan?: string;
    additionalRequirements?: string;
  };
}

interface AddEvidenceRequest {
  Params: {
    requestId: string;
  };
  Body: {
    evidenceType: RevisionEvidenceType;
    title: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

interface AddAnnotationRequest {
  Params: {
    evidenceId: string;
  };
  Body: {
    annotationType: 'highlight' | 'question' | 'note' | 'suggestion' | 'issue';
    content: string;
    coordinates?: {
      x: number;
      y: number;
      width?: number;
      height?: number;
    };
  };
}

interface AddCommentRequest {
  Params: {
    requestId: string;
  };
  Body: {
    content: string;
    parentCommentId?: string;
    isInternal?: boolean;
    mentions?: string[];
  };
}

interface ExportRevisionRequestsRequest {
  Body: {
    query?: RevisionRequestSearchQuery;
    format: 'csv' | 'json' | 'excel';
    fields?: string[];
    includeEvidence?: boolean;
    includeTimeline?: boolean;
    includeComments?: boolean;
  };
}

interface AnalyticsRequest {
  Querystring: {
    startDate: string;
    endDate: string;
    reviewerId?: string;
  };
}

export async function revisionRequestRoutes(fastify: FastifyInstance) {
  // Initialize service (in production, this would be properly dependency-injected)
  const database = new Database();
  const revisionRequestService = new RevisionRequestService(database);

  /**
   * Create a new revision request
   */
  fastify.post<CreateRevisionRequestRequest>(
    '/revision-requests',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Create a new revision request',
        body: {
          type: 'object',
          required: ['title', 'description', 'requestedChanges', 'businessJustification', 'contentType', 'contentId', 'type', 'priority'],
          properties: {
            title: { 
              type: 'string',
              minLength: 1,
              maxLength: 500,
              description: 'Title of the revision request'
            },
            description: { 
              type: 'string',
              minLength: 10,
              description: 'Detailed description of what needs to be revised'
            },
            requestedChanges: { 
              type: 'string',
              minLength: 10,
              description: 'Specific changes being requested'
            },
            businessJustification: { 
              type: 'string',
              minLength: 10,
              description: 'Business justification for the changes'
            },
            contentType: { 
              type: 'string',
              enum: Object.values(RevisionContentType),
              description: 'Type of content being revised'
            },
            contentId: { 
              type: 'string',
              minLength: 1,
              description: 'ID of the content being revised'
            },
            contentTitle: { 
              type: 'string',
              description: 'Title of the content being revised'
            },
            type: { 
              type: 'string',
              enum: Object.values(RevisionRequestType),
              description: 'Type of revision request'
            },
            priority: { 
              type: 'string',
              enum: Object.values(RevisionRequestPriority),
              description: 'Priority level of the request'
            },
            dueDate: { 
              type: 'string',
              format: 'date-time',
              description: 'Due date for the revision'
            },
            estimatedHours: { 
              type: 'number',
              minimum: 0,
              description: 'Estimated hours to complete the revision'
            },
            tags: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization'
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              revisionRequest: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<CreateRevisionRequestRequest>, reply: FastifyReply) => {
      try {
        // In production, get user info from authentication context
        const requesterId = request.headers['x-user-id'] as string || 'user-123';
        const requesterName = request.headers['x-user-name'] as string || 'Test User';
        const requesterEmail = request.headers['x-user-email'] as string || 'test@example.com';

        const formData: RevisionRequestFormData = {
          ...request.body,
          contentTitle: request.body.contentTitle || 'Unknown Content',
          dueDate: request.body.dueDate ? new Date(request.body.dueDate) : undefined,
          tags: request.body.tags || [],
          evidence: [] // File uploads would be handled separately
        };

        console.log(`📝 Creating revision request: ${request.body.title} by ${requesterName}`);

        const revisionRequest = await revisionRequestService.createRevisionRequest(
          formData,
          requesterId,
          requesterName,
          requesterEmail
        );

        reply.code(201).send({
          success: true,
          revisionRequest,
          message: `Revision request "${request.body.title}" created successfully`
        });

      } catch (error) {
        console.error('Create revision request failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to create revision request',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Get a specific revision request by ID
   */
  fastify.get<GetRevisionRequestRequest>(
    '/revision-requests/:requestId',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Get revision request by ID',
        params: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string', description: 'Revision request ID' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              revisionRequest: { type: 'object' },
              evidence: { type: 'array' },
              timeline: { type: 'array' },
              comments: { type: 'array' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<GetRevisionRequestRequest>, reply: FastifyReply) => {
      try {
        const { requestId } = request.params;

        console.log(`📖 Getting revision request: ${requestId}`);

        const revisionRequest = await revisionRequestService.getRevisionRequest(requestId);
        
        if (!revisionRequest) {
          return reply.code(404).send({
            success: false,
            error: 'Revision request not found',
            message: `Revision request ${requestId} was not found`
          });
        }

        // Get related data
        const [evidence, timeline, comments] = await Promise.all([
          revisionRequestService.getRevisionEvidence(requestId),
          revisionRequestService.getRevisionTimeline(requestId),
          revisionRequestService.getComments(requestId, true) // Include internal comments for now
        ]);

        reply.code(200).send({
          success: true,
          revisionRequest,
          evidence,
          timeline,
          comments,
          message: `Revision request retrieved successfully`
        });

      } catch (error) {
        console.error('Get revision request failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to retrieve revision request',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Update a revision request
   */
  fastify.put<UpdateRevisionRequestRequest>(
    '/revision-requests/:requestId',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Update revision request',
        params: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string', description: 'Revision request ID' }
          }
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 500 },
            description: { type: 'string', minLength: 10 },
            requestedChanges: { type: 'string', minLength: 10 },
            businessJustification: { type: 'string', minLength: 10 },
            priority: { type: 'string', enum: Object.values(RevisionRequestPriority) },
            dueDate: { type: 'string', format: 'date-time' },
            estimatedHours: { type: 'number', minimum: 0 },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: Object.values(RevisionRequestStatus) },
            reviewNotes: { type: 'string' },
            rejectionReason: { type: 'string' },
            approvalNotes: { type: 'string' },
            implementationNotes: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              revisionRequest: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<UpdateRevisionRequestRequest>, reply: FastifyReply) => {
      try {
        const { requestId } = request.params;
        const updates = request.body;

        // In production, get user info from authentication context
        const actorId = request.headers['x-user-id'] as string || 'user-123';
        const actorName = request.headers['x-user-name'] as string || 'Test User';

        console.log(`✏️ Updating revision request: ${requestId} by ${actorName}`);

        // Convert date strings to Date objects
        const processedUpdates = {
          ...updates,
          dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined
        };

        const revisionRequest = await revisionRequestService.updateRevisionRequest(
          requestId,
          processedUpdates,
          actorId,
          actorName
        );

        reply.code(200).send({
          success: true,
          revisionRequest,
          message: `Revision request updated successfully`
        });

      } catch (error) {
        console.error('Update revision request failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to update revision request',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Search and filter revision requests
   */
  fastify.get<SearchRevisionRequestsRequest>(
    '/revision-requests',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Search and filter revision requests',
        querystring: {
          type: 'object',
          properties: {
            status: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by status'
            },
            priority: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by priority'
            },
            contentType: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by content type'
            },
            type: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by request type'
            },
            requesterId: { type: 'string', description: 'Filter by requester ID' },
            reviewerId: { type: 'string', description: 'Filter by reviewer ID' },
            unassigned: { type: 'boolean', description: 'Filter unassigned requests' },
            startDate: { type: 'string', format: 'date-time', description: 'Filter by created date start' },
            endDate: { type: 'string', format: 'date-time', description: 'Filter by created date end' },
            dueDateStart: { type: 'string', format: 'date-time', description: 'Filter by due date start' },
            dueDateEnd: { type: 'string', format: 'date-time', description: 'Filter by due date end' },
            contentId: { type: 'string', description: 'Filter by content ID' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
            search: { type: 'string', description: 'Text search' },
            page: { type: 'number', minimum: 1, default: 1, description: 'Page number' },
            pageSize: { type: 'number', minimum: 1, maximum: 100, default: 50, description: 'Items per page' },
            sortBy: { type: 'string', default: 'created_at', description: 'Sort field' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Sort order' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              results: { type: 'object' },
              searchMetadata: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<SearchRevisionRequestsRequest>, reply: FastifyReply) => {
      try {
        const queryParams = request.query;

        console.log(`🔍 Searching revision requests with filters:`, Object.keys(queryParams));
        const startTime = Date.now();

        // Build search query
        const searchQuery: RevisionRequestSearchQuery = {
          page: queryParams.page || 1,
          pageSize: queryParams.pageSize || 50,
          sortBy: queryParams.sortBy as any || 'created_at',
          sortOrder: queryParams.sortOrder || 'desc'
        };

        // Apply filters
        if (queryParams.status) {
          searchQuery.status = Array.isArray(queryParams.status) 
            ? queryParams.status as RevisionRequestStatus[]
            : [queryParams.status as RevisionRequestStatus];
        }

        if (queryParams.priority) {
          searchQuery.priority = Array.isArray(queryParams.priority)
            ? queryParams.priority as RevisionRequestPriority[]
            : [queryParams.priority as RevisionRequestPriority];
        }

        if (queryParams.contentType) {
          searchQuery.contentType = Array.isArray(queryParams.contentType)
            ? queryParams.contentType as RevisionContentType[]
            : [queryParams.contentType as RevisionContentType];
        }

        if (queryParams.type) {
          searchQuery.type = Array.isArray(queryParams.type)
            ? queryParams.type as RevisionRequestType[]
            : [queryParams.type as RevisionRequestType];
        }

        if (queryParams.requesterId) {
          searchQuery.requesterId = queryParams.requesterId;
        }

        if (queryParams.reviewerId) {
          searchQuery.reviewerId = queryParams.reviewerId;
        }

        if (queryParams.unassigned) {
          searchQuery.unassigned = queryParams.unassigned;
        }

        if (queryParams.startDate && queryParams.endDate) {
          searchQuery.dateRange = {
            start: new Date(queryParams.startDate),
            end: new Date(queryParams.endDate)
          };
        }

        if (queryParams.dueDateStart && queryParams.dueDateEnd) {
          searchQuery.dueDateRange = {
            start: new Date(queryParams.dueDateStart),
            end: new Date(queryParams.dueDateEnd)
          };
        }

        if (queryParams.contentId) {
          searchQuery.contentId = queryParams.contentId;
        }

        if (queryParams.tags) {
          searchQuery.tags = Array.isArray(queryParams.tags)
            ? queryParams.tags
            : [queryParams.tags];
        }

        if (queryParams.search) {
          searchQuery.search = queryParams.search;
        }

        const results = await revisionRequestService.searchRevisionRequests(searchQuery);

        const searchTime = Date.now() - startTime;
        const searchMetadata = {
          searchTime,
          appliedFilters: results.filters.count,
          totalResults: results.pagination.total,
          resultPages: results.pagination.totalPages,
          searchQuery: Object.keys(queryParams)
        };

        reply.code(200).send({
          success: true,
          results,
          searchMetadata,
          message: `Found ${results.pagination.total} revision requests (${searchTime}ms)`
        });

      } catch (error) {
        console.error('Search revision requests failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Revision request search failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Assign reviewer to a revision request
   */
  fastify.post<AssignReviewerRequest>(
    '/revision-requests/:requestId/assign',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Assign reviewer to revision request',
        params: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string', description: 'Revision request ID' }
          }
        },
        body: {
          type: 'object',
          required: ['reviewerId', 'reviewerName'],
          properties: {
            reviewerId: { type: 'string', description: 'Reviewer user ID' },
            reviewerName: { type: 'string', description: 'Reviewer name' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              revisionRequest: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<AssignReviewerRequest>, reply: FastifyReply) => {
      try {
        const { requestId } = request.params;
        const { reviewerId, reviewerName } = request.body;

        // In production, get user info from authentication context
        const actorId = request.headers['x-user-id'] as string || 'admin-123';
        const actorName = request.headers['x-user-name'] as string || 'Admin User';

        console.log(`👤 Assigning reviewer ${reviewerName} to request: ${requestId}`);

        const revisionRequest = await revisionRequestService.assignReviewer(
          requestId,
          reviewerId,
          reviewerName,
          actorId,
          actorName
        );

        reply.code(200).send({
          success: true,
          revisionRequest,
          message: `Reviewer ${reviewerName} assigned successfully`
        });

      } catch (error) {
        console.error('Assign reviewer failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to assign reviewer',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Submit revision request for review
   */
  fastify.post<GetRevisionRequestRequest>(
    '/revision-requests/:requestId/submit',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Submit revision request for review',
        params: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string', description: 'Revision request ID' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              revisionRequest: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<GetRevisionRequestRequest>, reply: FastifyReply) => {
      try {
        const { requestId } = request.params;

        // In production, get user info from authentication context
        const actorId = request.headers['x-user-id'] as string || 'user-123';
        const actorName = request.headers['x-user-name'] as string || 'Test User';

        console.log(`📤 Submitting revision request: ${requestId} by ${actorName}`);

        const revisionRequest = await revisionRequestService.submitRevisionRequest(
          requestId,
          actorId,
          actorName
        );

        reply.code(200).send({
          success: true,
          revisionRequest,
          message: `Revision request submitted for review successfully`
        });

      } catch (error) {
        console.error('Submit revision request failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to submit revision request',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Review revision request (approve/reject/request more info)
   */
  fastify.post<ReviewRevisionRequestRequest>(
    '/revision-requests/:requestId/review',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Review revision request',
        params: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string', description: 'Revision request ID' }
          }
        },
        body: {
          type: 'object',
          required: ['decision', 'reviewNotes'],
          properties: {
            decision: { 
              type: 'string',
              enum: ['approve', 'reject', 'request_info'],
              description: 'Review decision'
            },
            reviewNotes: { 
              type: 'string',
              minLength: 10,
              description: 'Review notes and feedback'
            },
            rejectionReason: { type: 'string', description: 'Reason for rejection (if rejected)' },
            approvalNotes: { type: 'string', description: 'Approval notes (if approved)' },
            estimatedImplementationHours: { type: 'number', minimum: 0 },
            implementationPlan: { type: 'string' },
            additionalRequirements: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              revisionRequest: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<ReviewRevisionRequestRequest>, reply: FastifyReply) => {
      try {
        const { requestId } = request.params;
        const reviewData = request.body as RevisionRequestReviewFormData;

        // In production, get user info from authentication context
        const reviewerId = request.headers['x-user-id'] as string || 'reviewer-123';
        const reviewerName = request.headers['x-user-name'] as string || 'Test Reviewer';

        console.log(`⚖️ Reviewing revision request: ${requestId} - Decision: ${reviewData.decision}`);

        const revisionRequest = await revisionRequestService.reviewRevisionRequest(
          requestId,
          reviewData,
          reviewerId,
          reviewerName
        );

        const actionMessage = {
          'approve': 'approved',
          'reject': 'rejected',
          'request_info': 'additional information requested for'
        }[reviewData.decision];

        reply.code(200).send({
          success: true,
          revisionRequest,
          message: `Revision request ${actionMessage} successfully`
        });

      } catch (error) {
        console.error('Review revision request failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to review revision request',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Add evidence/attachment to revision request
   */
  fastify.post<AddEvidenceRequest>(
    '/revision-requests/:requestId/evidence',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Add evidence to revision request',
        params: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string', description: 'Revision request ID' }
          }
        },
        body: {
          type: 'object',
          required: ['evidenceType', 'title'],
          properties: {
            evidenceType: { 
              type: 'string',
              enum: Object.values(RevisionEvidenceType),
              description: 'Type of evidence'
            },
            title: { 
              type: 'string',
              minLength: 1,
              maxLength: 500,
              description: 'Evidence title'
            },
            description: { type: 'string', description: 'Evidence description' },
            fileUrl: { type: 'string', description: 'File URL (if file upload)' },
            fileName: { type: 'string', description: 'File name' },
            fileSize: { type: 'number', minimum: 0, description: 'File size in bytes' },
            mimeType: { type: 'string', description: 'File MIME type' }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              evidence: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<AddEvidenceRequest>, reply: FastifyReply) => {
      try {
        const { requestId } = request.params;
        const {
          evidenceType,
          title,
          description = '',
          fileUrl = '',
          fileName = '',
          fileSize = 0,
          mimeType = ''
        } = request.body;

        // In production, get user info from authentication context
        const uploadedBy = request.headers['x-user-id'] as string || 'user-123';

        console.log(`📎 Adding evidence to revision request: ${requestId} - ${title}`);

        const evidence = await revisionRequestService.addEvidence(
          requestId,
          evidenceType,
          title,
          description,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          uploadedBy
        );

        reply.code(201).send({
          success: true,
          evidence,
          message: `Evidence "${title}" added successfully`
        });

      } catch (error) {
        console.error('Add evidence failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to add evidence',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Add annotation to evidence
   */
  fastify.post<AddAnnotationRequest>(
    '/revision-evidence/:evidenceId/annotations',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Add annotation to evidence',
        params: {
          type: 'object',
          required: ['evidenceId'],
          properties: {
            evidenceId: { type: 'string', description: 'Evidence ID' }
          }
        },
        body: {
          type: 'object',
          required: ['annotationType', 'content'],
          properties: {
            annotationType: { 
              type: 'string',
              enum: ['highlight', 'question', 'note', 'suggestion', 'issue'],
              description: 'Type of annotation'
            },
            content: { 
              type: 'string',
              minLength: 1,
              description: 'Annotation content'
            },
            coordinates: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
                width: { type: 'number' },
                height: { type: 'number' }
              },
              description: 'Annotation coordinates (for image/document annotations)'
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              annotation: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<AddAnnotationRequest>, reply: FastifyReply) => {
      try {
        const { evidenceId } = request.params;
        const { annotationType, content, coordinates } = request.body;

        // In production, get user info from authentication context
        const createdBy = request.headers['x-user-id'] as string || 'user-123';

        console.log(`🖊️ Adding annotation to evidence: ${evidenceId} - ${annotationType}`);

        const annotation = await revisionRequestService.addEvidenceAnnotation(
          evidenceId,
          annotationType,
          content,
          coordinates,
          createdBy
        );

        reply.code(201).send({
          success: true,
          annotation,
          message: `Annotation added successfully`
        });

      } catch (error) {
        console.error('Add annotation failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to add annotation',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Add comment to revision request
   */
  fastify.post<AddCommentRequest>(
    '/revision-requests/:requestId/comments',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Add comment to revision request',
        params: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string', description: 'Revision request ID' }
          }
        },
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { 
              type: 'string',
              minLength: 1,
              description: 'Comment content'
            },
            parentCommentId: { 
              type: 'string',
              description: 'Parent comment ID (for threaded discussions)'
            },
            isInternal: { 
              type: 'boolean',
              default: false,
              description: 'Whether comment is internal/private'
            },
            mentions: { 
              type: 'array',
              items: { type: 'string' },
              description: 'User IDs mentioned in the comment'
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              comment: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<AddCommentRequest>, reply: FastifyReply) => {
      try {
        const { requestId } = request.params;
        const { content, parentCommentId, isInternal = false, mentions = [] } = request.body;

        // In production, get user info from authentication context
        const authorId = request.headers['x-user-id'] as string || 'user-123';
        const authorName = request.headers['x-user-name'] as string || 'Test User';

        console.log(`💬 Adding comment to revision request: ${requestId}`);

        const comment = await revisionRequestService.addComment(
          requestId,
          content,
          authorId,
          authorName,
          isInternal,
          parentCommentId,
          mentions
        );

        reply.code(201).send({
          success: true,
          comment,
          message: `Comment added successfully`
        });

      } catch (error) {
        console.error('Add comment failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to add comment',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Export revision requests
   */
  fastify.post<ExportRevisionRequestsRequest>(
    '/revision-requests/export',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Export revision requests',
        body: {
          type: 'object',
          required: ['format'],
          properties: {
            query: { type: 'object', description: 'Search query for filtering' },
            format: { 
              type: 'string',
              enum: ['csv', 'json', 'excel'],
              description: 'Export format'
            },
            fields: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Specific fields to include'
            },
            includeEvidence: { 
              type: 'boolean',
              default: false,
              description: 'Include evidence data'
            },
            includeTimeline: { 
              type: 'boolean',
              default: false,
              description: 'Include timeline events'
            },
            includeComments: { 
              type: 'boolean',
              default: false,
              description: 'Include comments'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              exportData: { type: 'string' },
              exportMetadata: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<ExportRevisionRequestsRequest>, reply: FastifyReply) => {
      try {
        const exportRequest = request.body as RevisionRequestExportRequest;

        console.log(`📤 Exporting revision requests in ${exportRequest.format} format`);
        const startTime = Date.now();

        const exportData = await revisionRequestService.exportRevisionRequests(exportRequest);

        const exportTime = Date.now() - startTime;
        const exportMetadata = {
          exportTime,
          format: exportRequest.format,
          fileSizeBytes: Buffer.byteLength(exportData, 'utf8'),
          generatedAt: new Date().toISOString()
        };

        reply.code(200).send({
          success: true,
          exportData,
          exportMetadata,
          message: `Revision requests export completed successfully (${exportTime}ms)`
        });

      } catch (error) {
        console.error('Export revision requests failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Export failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Get revision request analytics
   */
  fastify.get<AnalyticsRequest>(
    '/revision-requests/analytics',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Get revision request analytics',
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { 
              type: 'string',
              format: 'date-time',
              description: 'Analytics start date'
            },
            endDate: { 
              type: 'string',
              format: 'date-time',
              description: 'Analytics end date'
            },
            reviewerId: { 
              type: 'string',
              description: 'Filter analytics by reviewer'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              analytics: { type: 'object' },
              reviewerPerformance: { type: 'array' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<AnalyticsRequest>, reply: FastifyReply) => {
      try {
        const { startDate, endDate, reviewerId } = request.query;

        console.log(`📊 Generating revision request analytics from ${startDate} to ${endDate}`);
        const startTime = Date.now();

        const [analytics, reviewerPerformance] = await Promise.all([
          revisionRequestService.getRevisionRequestAnalytics(
            new Date(startDate),
            new Date(endDate)
          ),
          revisionRequestService.getReviewerPerformance(reviewerId)
        ]);

        const analyticsTime = Date.now() - startTime;

        reply.code(200).send({
          success: true,
          analytics,
          reviewerPerformance,
          message: `Analytics generated successfully (${analyticsTime}ms)`
        });

      } catch (error) {
        console.error('Get analytics failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to get analytics',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );

  /**
   * Get pending revision requests (dashboard view)
   */
  fastify.get(
    '/revision-requests/pending',
    {
      schema: {
        tags: ['Revision Requests'],
        summary: 'Get pending revision requests',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              pendingRequests: { type: 'array' },
              summary: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        console.log(`⏳ Getting pending revision requests`);

        const pendingRequests = await revisionRequestService.getPendingRevisionRequests();

        const summary = {
          total: pendingRequests.length,
          submitted: pendingRequests.filter(r => r.status === RevisionRequestStatus.SUBMITTED).length,
          underReview: pendingRequests.filter(r => r.status === RevisionRequestStatus.UNDER_REVIEW).length,
          additionalInfoRequested: pendingRequests.filter(r => r.status === RevisionRequestStatus.ADDITIONAL_INFO_REQUESTED).length,
          highPriority: pendingRequests.filter(r => r.priority === RevisionRequestPriority.HIGH || r.priority === RevisionRequestPriority.URGENT || r.priority === RevisionRequestPriority.CRITICAL).length,
          overdue: pendingRequests.filter(r => r.dueDate && r.dueDate < new Date()).length
        };

        reply.code(200).send({
          success: true,
          pendingRequests,
          summary,
          message: `Retrieved ${pendingRequests.length} pending revision requests`
        });

      } catch (error) {
        console.error('Get pending requests failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Failed to get pending requests',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );
}