/**
 * Epic 16 Marketplace Attribution API Routes
 * Task: E16-1753114247138-03634F - Add attribution system
 * 
 * RESTful API endpoints for marketplace template attribution, revenue sharing,
 * creator profiles, collaboration tracking, and attribution claims.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MarketplaceAttributionService } from '../services/MarketplaceAttributionService';
import { Database } from '../database/connection';
import {
  CreateTemplateAttributionRequestSchema,
  CreateAttributionClaimRequestSchema,
  UpdateRevenueAttributionRequestSchema,
  MarketplaceAttributionFilterSchema
} from '../../../packages/core/types/marketplaceAttribution';

}
}
interface AttributionRouteOptions {
  database: Database;
}
}
}

// =============================================================================
// Request/Response Schemas for Validation
// =============================================================================

const templateAttributionResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    attribution: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        templateId: { type: 'string' },
        primaryCreatorId: { type: 'string' },
        primaryCreatorName: { type: 'string' },
        collaborators: { type: 'array' },
        revenueSharing: { type: 'object' },
        isVerified: { type: 'boolean' }
      }
  }
    relatedTemplates: { type: 'array' },
    revenueStatistics: { type: 'object' }
  }
};

const createAttributionRequestSchema = {
  type: 'object',
  required: ['templateId', 'primaryCreatorId'],
  properties: {
    templateId: { type: 'string', format: 'uuid' },
    templateVersionId: { type: 'string', format: 'uuid' },
    primaryCreatorId: { type: 'string', format: 'uuid' },
    collaborators: {
      type: 'array',
      items: {
        type: 'object',
        required: ['userId', 'contributionType', 'contributionPercentage'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          contributionType: {
            type: 'string',
            enum: ['co-creator', 'contributor', 'reviewer', 'editor', 'advisor']
  }
          contributionPercentage: { type: 'number', minimum: 0, maximum: 100 },
          contributionDescription: { type: 'string' }
        }
      }
  }
    derivedFrom: {
      type: 'object',
      required: ['originalTemplateId', 'derivationType', 'attributionPercentage'],
      properties: {
        originalTemplateId: { type: 'string', format: 'uuid' },
        derivationType: {
          type: 'string',
          enum: ['fork', 'remix', 'inspired', 'adaptation']
  }
        attributionPercentage: { type: 'number', minimum: 0, maximum: 100 }
      }
  }
    attributionMethod: {
      type: 'string',
      enum: ['manual', 'git_history', 'session_tracking', 'ai_analysis', 'user_declaration'],
      default: 'manual'
  }
    sourceMetadata: { type: 'object' }
  }
};

const attributionClaimRequestSchema = {
  type: 'object',
  required: ['claimType', 'claimDescription'],
  properties: {
    claimType: {
      type: 'string',
      enum: ['ownership', 'collaboration', 'derivation', 'inspiration']
  }
    claimDescription: { type: 'string', minLength: 10, maxLength: 1000 },
    evidenceUrls: {
      type: 'array',
      items: { type: 'string', format: 'uri' }
  }
    metadata: { type: 'object' }
  }
};

const revenueDistributionRequestSchema = {
  type: 'object',
  required: ['totalRevenueCents', 'buyerId', 'templateVersion'],
  properties: {
    totalRevenueCents: { type: 'integer', minimum: 0 },
    buyerId: { type: 'string', format: 'uuid' },
    templateVersion: { type: 'string' }
  }
};

export default async function marketplaceAttributionRoutes(
  fastify: FastifyInstance,
  options: AttributionRouteOptions
) {
  const attributionService = new MarketplaceAttributionService({
    database: options.database,
    enableRealTimeUpdates: true,
    enableAnalytics: true
  });

  // Middleware for authentication
  const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
  };

  // Middleware for admin/creator verification
  const requireCreatorAccess = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || (!user.permissions?.includes('creator') && !user.permissions?.includes('admin'))) {
      return reply.code(403).send({ error: 'Creator or admin access required' });
    }
  };

  // =============================================================================
  // Template Attribution Endpoints
  // =============================================================================

  // POST /api/marketplace-attribution/templates/:templateId/attribution
  // Create template attribution
  fastify.post('/templates/:templateId/attribution', {
    preHandler: [requireAuth, requireCreatorAccess],
    schema: {
      params: {
        type: 'object',
        required: ['templateId'],
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        }
  }
      body: createAttributionRequestSchema
    }
  }, async (request, reply) => {
    try {
      const { templateId } = request.params as { templateId: string };
      const requestBody = request.body as any;
      const user = (request as any).user;

      // Verify template ownership or admin permissions
      const templateQuery = 'SELECT owner_id FROM marketplace_templates WHERE id = $1';
      const templateResult = await options.database.query(templateQuery, [templateId]);
      
      if (templateResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Template not found' });
      }

      const templateOwnerId = templateResult.rows[0].owner_id;
      if (templateOwnerId !== user.id && !user.permissions?.includes('admin')) {
        return reply.code(403).send({ error: 'Only template owner or admin can create attribution' });
      }

      // Create attribution
      const result = await attributionService.createTemplateAttribution({
        templateId,
        ...requestBody
      });

      if (!result.success) {
        return reply.code(400).send({
          success: false,
          errors: result.errors
        });
      }

      return reply.send({
        success: true,
        attributionId: result.attributionId,
        attribution: result.attribution,
        warnings: result.warnings
      });
    } catch (error) {
      fastify.log.error('Failed to create template attribution:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/marketplace-attribution/templates/:templateId/attribution
  // Get template attribution details
  fastify.get('/templates/:templateId/attribution', {
    schema: {
      params: {
        type: 'object',
        required: ['templateId'],
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        }
  }
      response: {
        200: templateAttributionResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { templateId } = request.params as { templateId: string };
      
      const attribution = await attributionService.getTemplateAttributionResponse(templateId);
      
      if (!attribution) {
        return reply.code(404).send({
          success: false,
          error: 'Template attribution not found'
        });
      }

      return reply.send({
        success: true,
        ...attribution
      });
    } catch (error) {
      fastify.log.error('Failed to get template attribution:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // PUT /api/marketplace-attribution/templates/:templateId/attribution/verify
  // Verify template attribution (admin only)
  fastify.put('/templates/:templateId/attribution/verify', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['templateId'],
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        }
  }
      body: {
        type: 'object',
        properties: {
          verified: { type: 'boolean' },
          notes: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { templateId } = request.params as { templateId: string };
      const { verified, notes } = request.body as { verified: boolean; notes?: string };
      const user = (request as any).user;

      if (!user.permissions?.includes('admin')) {
        return reply.code(403).send({ error: 'Admin access required' });
      }

      const updateQuery = `
        UPDATE template_attributions 
        SET is_verified = $1, verified_by = $2, verified_at = NOW(), updated_at = NOW()
        WHERE template_id = $3
        RETURNING id
      `;

      const result = await options.database.query(updateQuery, [verified, user.id, templateId]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Template attribution not found' });
      }

      return reply.send({
        success: true,
        verified,
        verifiedBy: user.id,
        verifiedAt: new Date()
      });
    } catch (error) {
      fastify.log.error('Failed to verify template attribution:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Revenue Attribution Endpoints
  // =============================================================================

  // POST /api/marketplace-attribution/templates/:templateId/revenue/:purchaseId
  // Create revenue attribution for a purchase
  fastify.post('/templates/:templateId/revenue/:purchaseId', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['templateId', 'purchaseId'],
        properties: {
          templateId: { type: 'string', format: 'uuid' },
          purchaseId: { type: 'string', format: 'uuid' }
        }
  }
      body: revenueDistributionRequestSchema
    }
  }, async (request, reply) => {
    try {
      const { templateId, purchaseId } = request.params as { templateId: string; purchaseId: string };
      const { totalRevenueCents, buyerId, templateVersion } = request.body as any;
      const user = (request as any).user;

      // Verify purchase exists and user has permission
      if (!user.permissions?.includes('admin') && !user.permissions?.includes('revenue_system')) {
        return reply.code(403).send({ error: 'Revenue system or admin access required' });
      }

      const result = await attributionService.createRevenueAttribution(
        templateId,
        purchaseId,
        totalRevenueCents,
        buyerId,
        templateVersion
      );

      if (!result.success) {
        return reply.code(400).send({
          success: false,
          errors: result.errors
        });
      }

      return reply.send({
        success: true,
        distributionId: result.distributionId,
        summary: {
          totalRecipients: result.totalRecipients,
          totalAmount: result.totalAmount,
          holdAmount: result.holdAmount,
          immediateRelease: result.immediateRelease
        }
      });
    } catch (error) {
      fastify.log.error('Failed to create revenue attribution:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/marketplace-attribution/revenue/:distributionId
  // Get revenue distribution details
  fastify.get('/revenue/:distributionId', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['distributionId'],
        properties: {
          distributionId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { distributionId } = request.params as { distributionId: string };
      const user = (request as any).user;

      // Get revenue attribution with records
      const query = `
        SELECT 
          ra.id,
          ra.template_id,
          ra.purchase_id,
          ra.total_revenue_cents,
          ra.purchase_date,
          ra.is_verified,
          json_agg(
            json_build_object(
              'recipientId', rar.recipient_id,
              'recipientType', rar.recipient_type,
              'attribution', rar.attribution_type,
              'percentage', rar.percentage,
              'amountCents', rar.amount_cents,
              'status', rar.status,
              'releasedAt', rar.released_at

          ) as attributions
        FROM revenue_attributions ra
        LEFT JOIN revenue_attribution_records rar ON ra.id = rar.revenue_attribution_id
        WHERE ra.id = $1
        GROUP BY ra.id, ra.template_id, ra.purchase_id, ra.total_revenue_cents, 
                 ra.purchase_date, ra.is_verified
      `;

      const result = await options.database.query(query, [distributionId]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Revenue distribution not found' });
      }

      const row = result.rows[0];

      // Check permission to view revenue details
      const canViewRevenue = user.permissions?.includes('admin') || 
                           row.attributions.some((attr: any) => attr.recipientId === user.id);

      if (!canViewRevenue) {
        return reply.code(403).send({ error: 'Access denied to revenue details' });
      }

      return reply.send({
        success: true,
        distribution: {
          id: row.id,
          templateId: row.template_id,
          purchaseId: row.purchase_id,
          totalRevenueCents: row.total_revenue_cents,
          purchaseDate: row.purchase_date,
          isVerified: row.is_verified,
          attributions: row.attributions
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get revenue distribution:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Attribution Claims Endpoints
  // =============================================================================

  // POST /api/marketplace-attribution/templates/:templateId/claims
  // Create attribution claim
  fastify.post('/templates/:templateId/claims', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['templateId'],
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        }
  }
      body: attributionClaimRequestSchema
    }
  }, async (request, reply) => {
    try {
      const { templateId } = request.params as { templateId: string };
      const requestBody = request.body as any;
      const user = (request as any).user;

      const result = await attributionService.createAttributionClaim(
        templateId,
        user.id,
        {
          templateId,
          ...requestBody
        }
      );

      if (!result.success) {
        return reply.code(400).send({
          success: false,
          errors: result.errors
        });
      }

      return reply.send({
        success: true,
        claimId: result.claimId,
        estimatedResolutionDate: result.estimatedResolutionDate,
        requiresEvidence: result.requiresEvidence
      });
    } catch (error) {
      fastify.log.error('Failed to create attribution claim:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/marketplace-attribution/templates/:templateId/claims
  // Get template attribution claims
  fastify.get('/templates/:templateId/claims', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['templateId'],
        properties: {
          templateId: { type: 'string', format: 'uuid' }
        }
  }
      querystring: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected', 'disputed']
  }
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { templateId } = request.params as { templateId: string };
      const { status, limit, offset } = request.query as any;
      const user = (request as any).user;

      let whereClause = 'WHERE ta.template_id = $1';
      const queryParams: any[] = [templateId];

      if (status) {
        whereClause += ' AND ac.status = $2';
        queryParams.push(status);
      }

      const query = `
        SELECT 
          ac.id,
          ac.claimant_id,
          u.name as claimant_name,
          ac.claim_type,
          ac.claim_description,
          ac.evidence_urls,
          ac.status,
          ac.priority,
          ac.created_at,
          ac.reviewed_at,
          ac.resolved_at
        FROM attribution_claims ac
        JOIN template_attributions ta ON ac.template_attribution_id = ta.id
        JOIN users u ON ac.claimant_id = u.id
        ${whereClause}
        ORDER BY ac.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      queryParams.push(limit, offset);

      const result = await options.database.query(query, queryParams);

      return reply.send({
        success: true,
        claims: result.rows,
        pagination: {
          limit,
          offset,
          hasMore: result.rows.length === limit
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get attribution claims:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Creator Dashboard Endpoints
  // =============================================================================

  // GET /api/marketplace-attribution/creators/:userId/dashboard
  // Get creator attribution dashboard
  fastify.get('/creators/:userId/dashboard', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const user = (request as any).user;

      // Verify access to dashboard
      if (userId !== user.id && !user.permissions?.includes('admin')) {
        return reply.code(403).send({ error: 'Access denied to this dashboard' });
      }

      const dashboard = await attributionService.getCreatorDashboard(userId);
      
      if (!dashboard) {
        return reply.code(404).send({ error: 'Creator profile not found' });
      }

      return reply.send({
        success: true,
        ...dashboard
      });
    } catch (error) {
      fastify.log.error('Failed to get creator dashboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // PUT /api/marketplace-attribution/creators/:userId/profile
  // Update creator profile
  fastify.put('/creators/:userId/profile', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' }
        }
  }
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string', minLength: 1, maxLength: 100 },
          profileBio: { type: 'string', maxLength: 500 },
          profileUrl: { type: 'string', format: 'uri' },
          attributionSettings: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const updates = request.body as any;
      const user = (request as any).user;

      // Verify access to profile
      if (userId !== user.id) {
        return reply.code(403).send({ error: 'Can only update your own profile' });
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 0;

      if (updates.displayName) {
        updateFields.push(`display_name = $${++paramCount}`);
        updateValues.push(updates.displayName);
      }

      if (updates.profileBio !== undefined) {
        updateFields.push(`profile_bio = $${++paramCount}`);
        updateValues.push(updates.profileBio);
      }

      if (updates.profileUrl !== undefined) {
        updateFields.push(`profile_url = $${++paramCount}`);
        updateValues.push(updates.profileUrl);
      }

      if (updates.attributionSettings) {
        updateFields.push(`attribution_settings = $${++paramCount}`);
        updateValues.push(JSON.stringify(updates.attributionSettings));
      }

      if (updateFields.length === 0) {
        return reply.code(400).send({ error: 'No valid fields to update' });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(userId);

      const updateQuery = `
        UPDATE creator_attribution_profiles 
        SET ${updateFields.join(', ')}
        WHERE user_id = $${++paramCount}
        RETURNING id
      `;

      const result = await options.database.query(updateQuery, updateValues);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Creator profile not found' });
      }

      return reply.send({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      fastify.log.error('Failed to update creator profile:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Analytics and Reporting Endpoints
  // =============================================================================

  // GET /api/marketplace-attribution/analytics/summary
  // Get attribution system analytics summary
  fastify.get('/analytics/summary', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['24h', '7d', '30d', '90d'],
            default: '30d'
  }
          templateId: { type: 'string', format: 'uuid' },
          creatorId: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, templateId, creatorId } = request.query as any;
      const user = (request as any).user;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      }

      // Build analytics query based on filters
      let whereClause = 'WHERE created_at BETWEEN $1 AND $2';
      const queryParams = [startDate, endDate];

      if (templateId) {
        whereClause += ` AND template_id = $${queryParams.length + 1}`;
        queryParams.push(templateId);
      }

      if (creatorId) {
        whereClause += ` AND primary_creator_id = $${queryParams.length + 1}`;
        queryParams.push(creatorId);
      }

      // Mock analytics response - would implement actual analytics queries
      const analyticsData = {
        timeframe,
        period: { startDate, endDate },
        summary: {
          totalAttributions: 150,
          totalRevenue: 45000, // in cents
          totalClaims: 8,
          averageResolutionTime: '3.2 days',
          verificationRate: 92.5
  }
        trends: {
          attributionsCreated: [10, 15, 12, 18, 14, 16, 20],
          revenueDistributed: [2500, 3200, 2800, 3600, 3100, 3400, 4200],
          claimsResolved: [2, 1, 3, 0, 1, 2, 1]
  }
        topCreators: [
          { creatorId: 'creator-1', templatesCreated: 25, totalRevenue: 15000 },
          { creatorId: 'creator-2', templatesCreated: 18, totalRevenue: 12000 }
        ]
      };

      return reply.send({
        success: true,
        analytics: analyticsData
      });
    } catch (error) {
      fastify.log.error('Failed to get attribution analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Health Check Endpoint
  // =============================================================================

  // GET /api/marketplace-attribution/health
  fastify.get('/health', async (request, reply) => {
    try {
      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'marketplace-attribution',
        version: '1.0.0'
      });
    } catch (error) {
      return reply.code(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

export { marketplaceAttributionRoutes };