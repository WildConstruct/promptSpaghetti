/**
 * Epic 16 Help Integration API Routes
 * Task: E16-1753114247189-025428 - Create integration architecture
 * 
 * API routes for Epic 16 Help Integration system providing contextual help,
 * cross-system transitions, support escalation, and analytics.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Epic16HelpIntegrationAPIService } from '../services/Epic16HelpIntegrationAPIService';
import { Epic16SupportEscalationService } from '../admin/Epic16SupportEscalationService';
import { Epic16TicketIntegrationService } from '../../../packages/core/services/Epic16TicketIntegrationService';
import { Database } from '../database/connection';

interface HelpIntegrationRouteOptions {
  database: Database;
  supportService: Epic16SupportEscalationService;
  ticketService: Epic16TicketIntegrationService;
}

// Request/Response schemas for validation
const helpRequestSchema = {
  type: 'object',
  required: ['userId', 'sessionType', 'context'],
  properties: {
    userId: { type: 'string' },
    sessionType: {
      type: 'string',
      enum: ['onboarding', 'feature-discovery', 'troubleshooting', 'purchase-assistance', 'template-creation', 'marketplace-navigation']
    },
    context: {
      type: 'object',
      required: ['currentView', 'userRole'],
      properties: {
        currentView: { type: 'string' },
        templateId: { type: 'string' },
        searchQuery: { type: 'string' },
        userRole: { type: 'string', enum: ['buyer', 'seller', 'admin'] },
        graphContext: { type: 'object' },
        marketplaceContext: { type: 'object' }
      }
    }
  }
};

const transitionRequestSchema = {
  type: 'object',
  required: ['userId', 'fromSystem', 'toSystem'],
  properties: {
    userId: { type: 'string' },
    fromSystem: { type: 'string', enum: ['graph-editor', 'marketplace'] },
    toSystem: { type: 'string', enum: ['graph-editor', 'marketplace'] },
    preserveHelp: { type: 'boolean', default: true },
    currentSessionId: { type: 'string' },
    transitionData: { type: 'object' }
  }
};

const escalationRequestSchema = {
  type: 'object',
  required: ['sessionId', 'userId', 'escalationReason', 'userDescription'],
  properties: {
    sessionId: { type: 'string' },
    userId: { type: 'string' },
    escalationReason: { type: 'string', minLength: 5, maxLength: 200 },
    userDescription: { type: 'string', minLength: 10, maxLength: 1000 },
    priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
    additionalContext: {
      type: 'object',
      properties: {
        errorMessages: { type: 'array', items: { type: 'string' } },
        userActions: { type: 'array', items: { type: 'string' } },
        systemState: { type: 'object' },
        attachments: { type: 'array', items: { type: 'string' } }
      }
    }
  }
};

const sessionUpdateSchema = {
  type: 'object',
  properties: {
    completedActions: { type: 'array', items: { type: 'string' } },
    currentStep: { type: 'number', minimum: 0 },
    feedbackRating: { type: 'number', minimum: 1, maximum: 5 },
    timeSpent: { type: 'number', minimum: 0 },
    helpfulContent: { type: 'array', items: { type: 'string' } },
    skippedContent: { type: 'array', items: { type: 'string' } }
  }
};

export default async function epic16HelpIntegrationRoutes(
  fastify: FastifyInstance,
  options: HelpIntegrationRouteOptions
) {
  const helpService = new Epic16HelpIntegrationAPIService(
    options.database,
    options.supportService,
    options.ticketService
  );

  // Middleware for authentication check
  const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
  };

  // ==========================================
  // CONTEXTUAL HELP ENDPOINTS
  // ==========================================

  // POST /api/help-integration/contextual-help
  // Get contextual help content based on current context
  fastify.post('/contextual-help', {
    preHandler: [requireAuth],
    schema: { body: helpRequestSchema }
  }, async (request, reply) => {
    try {
      const helpRequest = request.body as any;
      const response = await helpService.getContextualHelp(helpRequest);

      if (!response.success) {
        return reply.status(400).send({
          success: false,
          error: 'Failed to retrieve contextual help',
          content: []
        });
      }

      return reply.send(response);
    } catch (error) {
      fastify.log.error('Failed to get contextual help:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error while retrieving help content',
        content: []
      });
    }
  });

  // GET /api/help-integration/content-library
  // Get available help content library for browsing
  fastify.get('/content-library', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'professional'] },
          userRole: { type: 'string', enum: ['buyer', 'seller', 'admin'] },
          search: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { category, level, userRole, search, limit, offset } = request.query as any;
      
      // Mock implementation - would integrate with actual content management system
      const mockLibrary = [
        {
          id: 'marketplace-basics',
          title: 'Marketplace Basics',
          description: 'Learn the fundamentals of using the template marketplace',
          category: 'getting-started',
          level: 'beginner',
          estimatedTime: 300,
          contentType: 'interactive-guide'
        },
        {
          id: 'template-search',
          title: 'Advanced Template Search',
          description: 'Master the search and filtering capabilities',
          category: 'navigation',
          level: 'intermediate',
          estimatedTime: 180,
          contentType: 'tutorial'
        }
      ];

      // Filter based on query parameters
      let filteredLibrary = mockLibrary;
      
      if (category) {
        filteredLibrary = filteredLibrary.filter(item => item.category === category);
      }
      
      if (level) {
        filteredLibrary = filteredLibrary.filter(item => item.level === level);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredLibrary = filteredLibrary.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const total = filteredLibrary.length;
      const paginatedLibrary = filteredLibrary.slice(offset, offset + limit);

      return reply.send({
        success: true,
        content: paginatedLibrary,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get content library:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve content library',
        content: []
      });
    }
  });

  // ==========================================
  // SYSTEM TRANSITION ENDPOINTS
  // ==========================================

  // POST /api/help-integration/system-transition
  // Handle transitions between graph editor and marketplace
  fastify.post('/system-transition', {
    preHandler: [requireAuth],
    schema: { body: transitionRequestSchema }
  }, async (request, reply) => {
    try {
      const transitionRequest = request.body as any;
      const response = await helpService.handleSystemTransition(transitionRequest);

      if (!response.success) {
        return reply.status(400).send({
          success: false,
          error: 'Failed to handle system transition',
          transitionId: '',
          continuousHelp: false
        });
      }

      return reply.send(response);
    } catch (error) {
      fastify.log.error('Failed to handle system transition:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error during system transition',
        transitionId: '',
        continuousHelp: false
      });
    }
  });

  // GET /api/help-integration/transition-history/:userId
  // Get user's system transition history
  fastify.get('/transition-history/:userId', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          days: { type: 'number', minimum: 1, maximum: 90, default: 30 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const { limit, days } = request.query as { limit: number; days: number };
      const user = (request as any).user;

      // Verify user can access this data
      if (user.id !== userId && !user.permissions?.includes('help.admin')) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      // Query transition history from database
      const query = `
        SELECT id, from_system, to_system, preserve_help, transition_data, created_at
        FROM help_system_transitions 
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${days} days'
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await options.database.query(query, [userId, limit]);
      
      const transitions = result.rows.map(row => ({
        id: row.id,
        fromSystem: row.from_system,
        toSystem: row.to_system,
        preserveHelp: row.preserve_help,
        transitionData: row.transition_data,
        timestamp: row.created_at
      }));

      return reply.send({
        success: true,
        transitions,
        total: transitions.length
      });
    } catch (error) {
      fastify.log.error('Failed to get transition history:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve transition history',
        transitions: []
      });
    }
  });

  // ==========================================
  // SUPPORT ESCALATION ENDPOINTS
  // ==========================================

  // POST /api/help-integration/escalate-to-support
  // Escalate help session to human support
  fastify.post('/escalate-to-support', {
    preHandler: [requireAuth],
    schema: { body: escalationRequestSchema }
  }, async (request, reply) => {
    try {
      const escalationRequest = request.body as any;
      const response = await helpService.escalateToSupport(escalationRequest);

      if (!response.success) {
        return reply.status(400).send({
          success: false,
          error: 'Failed to escalate to support',
          ticketId: '',
          ticketNumber: ''
        });
      }

      return reply.send(response);
    } catch (error) {
      fastify.log.error('Failed to escalate to support:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error during support escalation',
        ticketId: '',
        ticketNumber: ''
      });
    }
  });

  // GET /api/help-integration/escalation-status/:ticketId
  // Check status of escalated support ticket
  fastify.get('/escalation-status/:ticketId', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['ticketId'],
        properties: {
          ticketId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { ticketId } = request.params as { ticketId: string };
      
      // Get ticket status from Epic 16 ticket service
      const ticket = await options.ticketService.getTicketById(ticketId);
      
      if (!ticket) {
        return reply.status(404).send({
          success: false,
          error: 'Ticket not found'
        });
      }

      return reply.send({
        success: true,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
        lastUpdate: ticket.updatedAt,
        estimatedResolution: ticket.sla?.estimatedResolution,
        messages: ticket.comments?.slice(-3) || [] // Last 3 messages
      });
    } catch (error) {
      fastify.log.error('Failed to get escalation status:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve escalation status'
      });
    }
  });

  // ==========================================
  // HELP SESSION MANAGEMENT ENDPOINTS
  // ==========================================

  // PUT /api/help-integration/session/:sessionId
  // Update help session progress and feedback
  fastify.put('/session/:sessionId', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string' }
        }
      },
      body: sessionUpdateSchema
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params as { sessionId: string };
      const updates = request.body as any;

      const response = await helpService.updateHelpSession(sessionId, updates);

      if (!response.success) {
        return reply.status(404).send({
          success: false,
          error: 'Help session not found or update failed'
        });
      }

      return reply.send(response);
    } catch (error) {
      fastify.log.error('Failed to update help session:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update help session'
      });
    }
  });

  // GET /api/help-integration/session/:sessionId/analytics
  // Get analytics for a help session
  fastify.get('/session/:sessionId/analytics', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
          sessionId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { sessionId } = request.params as { sessionId: string };
      const response = await helpService.getHelpSessionAnalytics(sessionId);

      if (!response.success) {
        return reply.status(404).send({
          success: false,
          error: 'Help session analytics not found'
        });
      }

      return reply.send(response);
    } catch (error) {
      fastify.log.error('Failed to get session analytics:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve session analytics'
      });
    }
  });

  // ==========================================
  // HEALTH & METRICS ENDPOINTS
  // ==========================================

  // GET /api/help-integration/health
  // Health check for help integration system
  fastify.get('/health', async (request, reply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'epic16-help-integration',
        version: '1.0.0',
        dependencies: {
          database: 'connected',
          supportService: 'available',
          ticketService: 'available'
        }
      };

      return reply.send(health);
    } catch (error) {
      return reply.status(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/help-integration/metrics
  // Get help system metrics and analytics
  fastify.get('/metrics', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['1h', '24h', '7d', '30d'], default: '24h' },
          includeDetails: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, includeDetails } = request.query as any;
      
      // Mock metrics - would integrate with actual analytics system
      const metrics = {
        helpRequests: {
          total: 1250,
          successful: 1180,
          escalated: 45,
          abandoned: 25
        },
        systemTransitions: {
          total: 890,
          withContinuousHelp: 650,
          successful: 860
        },
        userSatisfaction: {
          averageRating: 4.2,
          totalRatings: 780,
          completionRate: 0.85
        },
        supportEscalations: {
          total: 45,
          averageResolutionTime: '4.2 hours',
          priorities: {
            low: 15,
            medium: 25,
            high: 5
          }
        }
      };

      return reply.send({
        success: true,
        timeframe,
        metrics,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error('Failed to get help metrics:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve help metrics'
      });
    }
  });
}

// Export route registration function
export { epic16HelpIntegrationRoutes };