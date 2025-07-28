/**
 * Epic 16 Marketplace Attribution Service
 * Task: E16-1753114247138-03634F - Add attribution system
 * 
 * Core service for managing marketplace template attribution, revenue sharing,
 * creator profiles, collaboration tracking, and attribution claims.
 */

import { Database } from '../database/connection';
import { EventEmitter } from 'events';
import {
  TemplateAttribution,
  RevenueAttribution,
  CreatorAttributionProfile,
  CreateTemplateAttributionRequest,
  CreateAttributionClaimRequest,
  UpdateRevenueAttributionRequest,
  TemplateAttributionResponse,
  CreatorDashboardResponse,
  MarketplaceAttributionAnalytics,
  MarketplaceAttributionFilter,
  validateCreateTemplateAttributionRequest,
  validateCreateAttributionClaimRequest,
  validateUpdateRevenueAttributionRequest,
  MARKETPLACE_ATTRIBUTION_DEFAULTS
} from '../../../packages/core/types/marketplaceAttribution';

// =============================================================================
// Service Types
// =============================================================================

}
export interface AttributionServiceConfig {
  database: Database;
  enableRealTimeUpdates?: boolean;
  enableAnalytics?: boolean;
  autoVerificationThreshold?: number;
  revenueHoldDays?: number;
}
}

}
export interface TemplateAttributionCreateResult {
  success: boolean;
  attributionId?: string;
  attribution?: TemplateAttribution;
  warnings?: string[];
  errors?: string[];
}
}

}
export interface AttributionClaimResult {
  success: boolean;
  claimId?: string;
  estimatedResolutionDate?: Date;
  requiresEvidence?: boolean;
  errors?: string[];
}
}

}
export interface RevenueDistributionResult {
  success: boolean;
  distributionId?: string;
  totalRecipients: number;
  totalAmount: number;
  holdAmount: number;
  immediateRelease: number;
  errors?: string[];
}
}

// =============================================================================
// Marketplace Attribution Service
// =============================================================================

export class MarketplaceAttributionService extends EventEmitter {
  private database: Database;
  private config: AttributionServiceConfig;
  private analyticsBuffer: unknown[] = [];

  constructor(config: AttributionServiceConfig) {
    super();
    this.database = config.database;
    this.config = {
      enableRealTimeUpdates: true,
      enableAnalytics: true,
      autoVerificationThreshold: MARKETPLACE_ATTRIBUTION_DEFAULTS.VERIFICATION_REQUIRED_THRESHOLD,
      revenueHoldDays: MARKETPLACE_ATTRIBUTION_DEFAULTS.REVENUE_HOLD_DAYS,
      ...config
    };

    // Set up analytics flushing if enabled
    if (this.config.enableAnalytics) {
      setInterval(() => this.flushAnalytics(), 30000);
    }
  }

  // =============================================================================
  // Template Attribution Management
  // =============================================================================

  async createTemplateAttribution(request: CreateTemplateAttributionRequest): Promise<TemplateAttributionCreateResult> {

    try {
      // Validate request
      const validatedRequest = validateCreateTemplateAttributionRequest(request);
      
      // Check if attribution already exists
      const existingAttribution = await this.getTemplateAttribution(validatedRequest.templateId);
      if (existingAttribution) {
        return {
          success: false,
          errors: ['Template attribution already exists']
        };
      }

      // Validate collaborator percentages sum
      const totalCollaboratorPercentage = validatedRequest.collaborators
        .reduce((sum, collab) => sum + collab.contributionPercentage, 0);
      
      if (totalCollaboratorPercentage > 100) {
        return {
          success: false,
          errors: ['Total collaborator contribution percentages exceed 100%']
        };
      }

      // Calculate revenue sharing
      const derivationPercentage = validatedRequest.derivedFrom?.attributionPercentage || 0;
      const platformFee = MARKETPLACE_ATTRIBUTION_DEFAULTS.DEFAULT_PLATFORM_FEE;
      const primaryCreatorShare = 100 - platformFee - derivationPercentage - totalCollaboratorPercentage;

      if (primaryCreatorShare < 0) {
        return {
          success: false,
          errors: ['Revenue attribution percentages exceed 100%']
        };
      }

      // Begin transaction
      await this.database.query('BEGIN');

      try {
        // Create template attribution record
        const attributionId = await this.createAttributionRecord(validatedRequest, primaryCreatorShare);

        // Add collaborators
        if (validatedRequest.collaborators.length > 0) {
          await this.addCollaborators(attributionId, validatedRequest.collaborators);
        }

        // Add derivation record if applicable
        if (validatedRequest.derivedFrom) {
          await this.createDerivationRecord(validatedRequest.templateId, validatedRequest.derivedFrom);
        }

        // Create or update creator profile
        await this.updateCreatorProfile(validatedRequest.primaryCreatorId);

        await this.database.query('COMMIT');

        // Track analytics
        this.trackAttributionEvent('template_attribution_created', {
          templateId: validatedRequest.templateId,
          creatorId: validatedRequest.primaryCreatorId,
          collaboratorCount: validatedRequest.collaborators.length,
          hasDerviation: !!validatedRequest.derivedFrom
        });

        // Emit real-time update
        if (this.config.enableRealTimeUpdates) {
          this.emit('attribution_created', {
            attributionId,
            templateId: validatedRequest.templateId,
            creatorId: validatedRequest.primaryCreatorId
          });
        }

        const attribution = await this.getTemplateAttribution(validatedRequest.templateId);
        
        return {
          success: true,
          attributionId,
          attribution: attribution || undefined,
          warnings: primaryCreatorShare < 50 ? ['Primary creator share is less than 50%'] : []
        };
      } catch (error) {
        await this.database.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Failed to create template attribution:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  async getTemplateAttribution(templateId: string): Promise<TemplateAttribution | null> {

    try {
      const query = `
        SELECT 
          ta.*,
          json_agg(
            CASE WHEN tc.id IS NOT NULL THEN
              json_build_object(
                'userId', tc.user_id,
                'userName', tc.user_name,
                'userEmail', tc.user_email,
                'contributionType', tc.contribution_type,
                'contributionPercentage', tc.contribution_percentage,
                'contributionDescription', tc.contribution_description,
                'joinedAt', tc.joined_at,
                'verifiedAt', tc.verified_at

            END
          ) FILTER (WHERE tc.id IS NOT NULL) as collaborators,
          json_build_object(
            'originalTemplateId', td.original_template_id,
            'originalCreatorId', td.original_creator_id,
            'derivationType', td.derivation_type,
            'attributionPercentage', td.attribution_percentage,
            'acknowledgment', td.acknowledgment
          ) as derived_from
        FROM template_attributions ta
        LEFT JOIN template_collaborators tc ON ta.id = tc.template_attribution_id
        LEFT JOIN template_derivations td ON ta.template_id = td.derived_template_id
        WHERE ta.template_id = $1
        GROUP BY ta.id, td.original_template_id, td.original_creator_id, 
                 td.derivation_type, td.attribution_percentage, td.acknowledgment
      `;

      const result = await this.database.query(query, [templateId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      return {
        id: row.id,
        templateId: row.template_id,
        templateVersionId: row.template_version_id,
        primaryCreatorId: row.primary_creator_id,
        primaryCreatorName: row.primary_creator_name,
        primaryCreatorEmail: row.primary_creator_email,
        creationDate: new Date(row.creation_date),
        collaborators: row.collaborators || [],
        derivedFrom: row.derived_from?.originalTemplateId ? row.derived_from : undefined,
        revenueSharing: row.revenue_sharing,
        attributionClaims: [], // Would be loaded separately if needed
        isVerified: row.is_verified,
        verifiedBy: row.verified_by,
        verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
        confidenceScore: parseFloat(row.confidence_score),
        attributionMethod: row.attribution_method,
        sourceMetadata: row.source_metadata,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Failed to get template attribution:', error);
      return null;
    }
  }

  async getTemplateAttributionResponse(templateId: string): Promise<TemplateAttributionResponse | null> {

    try {
      const attribution = await this.getTemplateAttribution(templateId);
      if (!attribution) {
        return null;
      }

      // Get related templates
      const relatedTemplates = await this.getRelatedTemplates(templateId);
      
      // Get revenue statistics
      const revenueStats = await this.getTemplateRevenueStatistics(templateId);

      return {
        attribution,
        relatedTemplates,
        revenueStatistics: revenueStats
      };
    } catch (error) {
      console.error('Failed to get template attribution response:', error);
      return null;
    }
  }

  // =============================================================================
  // Revenue Attribution Management
  // =============================================================================

  async createRevenueAttribution(
    templateId: string,
    purchaseId: string,
    totalRevenueCents: number,
    buyerId: string,
    templateVersion: string
  ): Promise<RevenueDistributionResult> {

    try {
      // Check if revenue attribution already exists
      const existingQuery = 'SELECT id FROM revenue_attributions WHERE purchase_id = $1';
      const existingResult = await this.database.query(existingQuery, [purchaseId]);
      
      if (existingResult.rows.length > 0) {
        return {
          success: false,
          errors: ['Revenue attribution already exists for this purchase']
        };
      }

      // Create revenue attribution record - the trigger will handle distribution
      const insertQuery = `
        INSERT INTO revenue_attributions (
          template_id, purchase_id, total_revenue_cents, purchase_date,
          buyer_id, template_version, verification_required
        ) VALUES ($1, $2, $3, NOW(), $4, $5, $6)
        RETURNING id
      `;

      const verificationRequired = totalRevenueCents >= this.config.autoVerificationThreshold!;
      
      const result = await this.database.query(insertQuery, [
        templateId, purchaseId, totalRevenueCents, buyerId, templateVersion, verificationRequired
      ]);

      const distributionId = result.rows[0].id;

      // Get distribution summary
      const summaryQuery = `
        SELECT 
          COUNT(*) as recipient_count,
          SUM(amount_cents) as total_amount,
          SUM(CASE WHEN status = 'held' THEN amount_cents ELSE 0 END) as hold_amount,
          SUM(CASE WHEN status = 'released' THEN amount_cents ELSE 0 END) as immediate_release
        FROM revenue_attribution_records 
        WHERE revenue_attribution_id = $1
      `;

      const summaryResult = await this.database.query(summaryQuery, [distributionId]);
      const summary = summaryResult.rows[0];

      // Track analytics
      this.trackAttributionEvent('revenue_attributed', {
        templateId,
        purchaseId,
        amount: totalRevenueCents,
        recipientCount: summary.recipient_count,
        verificationRequired
      });

      // Emit real-time update
      if (this.config.enableRealTimeUpdates) {
        this.emit('revenue_attributed', {
          distributionId,
          templateId,
          purchaseId,
          amount: totalRevenueCents
        });
      }

      return {
        success: true,
        distributionId,
        totalRecipients: parseInt(summary.recipient_count),
        totalAmount: parseInt(summary.total_amount),
        holdAmount: parseInt(summary.hold_amount),
        immediateRelease: parseInt(summary.immediate_release)
      };
    } catch (error) {
      console.error('Failed to create revenue attribution:', error);
      return {
        success: false,
        totalRecipients: 0,
        totalAmount: 0,
        holdAmount: 0,
        immediateRelease: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  // =============================================================================
  // Attribution Claims Management
  // =============================================================================

  async createAttributionClaim(
    templateId: string,
    claimantId: string,
    request: CreateAttributionClaimRequest
  ): Promise<AttributionClaimResult> {

    try {
      const validatedRequest = validateCreateAttributionClaimRequest(request);

      // Get template attribution
      const attribution = await this.getTemplateAttribution(templateId);
      if (!attribution) {
        return {
          success: false,
          errors: ['Template attribution not found']
        };
      }

      // Check for duplicate claims
      const duplicateQuery = `
        SELECT id FROM attribution_claims 
        WHERE template_attribution_id = $1 AND claimant_id = $2 AND claim_type = $3 AND status = 'pending'
      `;
      const duplicateResult = await this.database.query(duplicateQuery, [
        attribution.id, claimantId, validatedRequest.claimType
      ]);

      if (duplicateResult.rows.length > 0) {
        return {
          success: false,
          errors: ['Similar claim already pending for this template']
        };
      }

      // Create claim record
      const insertQuery = `
        INSERT INTO attribution_claims (
          template_attribution_id, claimant_id, claim_type, claim_description, evidence_urls
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const result = await this.database.query(insertQuery, [
        attribution.id,
        claimantId,
        validatedRequest.claimType,
        validatedRequest.claimDescription,
        validatedRequest.evidenceUrls
      ]);

      const claimId = result.rows[0].id;

      // Calculate estimated resolution date
      const estimatedResolutionDate = new Date();
      estimatedResolutionDate.setDate(estimatedResolutionDate.getDate() + MARKETPLACE_ATTRIBUTION_DEFAULTS.CLAIM_RESOLUTION_DAYS);

      // Track analytics
      this.trackAttributionEvent('attribution_claim_created', {
        templateId,
        claimantId,
        claimType: validatedRequest.claimType,
        hasEvidence: validatedRequest.evidenceUrls.length > 0
      });

      // Emit real-time update
      if (this.config.enableRealTimeUpdates) {
        this.emit('claim_created', {
          claimId,
          templateId,
          claimantId,
          claimType: validatedRequest.claimType
        });
      }

      return {
        success: true,
        claimId,
        estimatedResolutionDate,
        requiresEvidence: validatedRequest.evidenceUrls.length === 0
      };
    } catch (error) {
      console.error('Failed to create attribution claim:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  // =============================================================================
  // Creator Profile Management
  // =============================================================================

  async getCreatorDashboard(userId: string): Promise<CreatorDashboardResponse | null> {

    try {
      // Get creator profile
      const profile = await this.getCreatorProfile(userId);
      if (!profile) {
        return null;
      }

      // Get creator's templates with attribution and performance data
      const templatesQuery = `
        SELECT 
          mt.id as template_id,
          mt.title,
          ta.id as attribution_id,
          COALESCE(SUM(ra.total_revenue_cents), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN rar.status = 'pending' THEN rar.amount_cents ELSE 0 END), 0) as pending_revenue,
          COALESCE(SUM(CASE WHEN rar.status = 'released' THEN rar.amount_cents ELSE 0 END), 0) as released_revenue,
          COUNT(DISTINCT mp.id) as total_purchases,
          COUNT(DISTINCT me.id) FILTER (WHERE me.event_type = 'view') as total_views,
          AVG(tr.stars) as avg_rating,
          COUNT(DISTINCT der.derived_template_id) as derivative_count
        FROM marketplace_templates mt
        JOIN template_attributions ta ON mt.id = ta.template_id
        LEFT JOIN revenue_attributions ra ON mt.id = ra.template_id
        LEFT JOIN revenue_attribution_records rar ON ra.id = rar.revenue_attribution_id AND rar.recipient_id = $1
        LEFT JOIN marketplace_purchases mp ON mt.id = mp.template_id
        LEFT JOIN marketplace_events me ON mt.id = me.template_id
        LEFT JOIN template_reviews tr ON mt.id = tr.template_id
        LEFT JOIN template_derivations der ON mt.id = der.original_template_id
        WHERE ta.primary_creator_id = $1
        GROUP BY mt.id, mt.title, ta.id
      `;

      const templatesResult = await this.database.query(templatesQuery, [userId]);

      const templates = templatesResult.rows.map(row => ({
        templateId: row.template_id,
        title: row.title,
        attribution: {} as TemplateAttribution, // Would load full attribution if needed
        revenue: {
          total: parseInt(row.total_revenue) || 0,
          pending: parseInt(row.pending_revenue) || 0,
          released: parseInt(row.released_revenue) || 0
  }
        performance: {
          views: parseInt(row.total_views) || 0,
          purchases: parseInt(row.total_purchases) || 0,
          rating: parseFloat(row.avg_rating) || 0,
          derivatives: parseInt(row.derivative_count) || 0
        }
      }));

      // Get collaborations
      const collaborationsQuery = `
        SELECT 
          mt.id as template_id,
          mt.title,
          tc.contribution_type as role,
          tc.contribution_percentage as contribution,
          COALESCE(SUM(rar.amount_cents), 0) as revenue,
          CASE 
            WHEN mt.status = 'listed' THEN 'active'
            WHEN mt.status = 'archived' THEN 'completed'
            ELSE 'active'
          END as status
        FROM template_collaborators tc
        JOIN template_attributions ta ON tc.template_attribution_id = ta.id
        JOIN marketplace_templates mt ON ta.template_id = mt.id
        LEFT JOIN revenue_attributions ra ON mt.id = ra.template_id
        LEFT JOIN revenue_attribution_records rar ON ra.id = rar.revenue_attribution_id AND rar.recipient_id = $1
        WHERE tc.user_id = $1
        GROUP BY mt.id, mt.title, tc.contribution_type, tc.contribution_percentage, mt.status
      `;

      const collaborationsResult = await this.database.query(collaborationsQuery, [userId]);

      const collaborations = collaborationsResult.rows.map(row => ({
        templateId: row.template_id,
        title: row.title,
        role: row.role,
        contribution: parseFloat(row.contribution),
        revenue: parseInt(row.revenue) || 0,
        status: row.status
      }));

      return {
        profile,
        templates,
        collaborations,
        analytics: undefined // Would load analytics if requested
      };
    } catch (error) {
      console.error('Failed to get creator dashboard:', error);
      return null;
    }
  }

  async getCreatorProfile(userId: string): Promise<CreatorAttributionProfile | null> {

    try {
      const query = 'SELECT * FROM creator_attribution_profiles WHERE user_id = $1';
      const result = await this.database.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      return {
        id: row.id,
        userId: row.user_id,
        displayName: row.display_name,
        profileBio: row.profile_bio,
        profileUrl: row.profile_url,
        verificationBadges: row.verification_badges,
        createdTemplates: row.created_templates,
        collaboratedTemplates: row.collaborated_templates,
        derivedTemplates: row.derived_templates,
        totalRevenue: parseFloat(row.total_revenue_cents) / 100,
        totalSales: row.total_sales,
        collaborationScore: parseFloat(row.collaboration_score),
        averageCollaborators: parseFloat(row.average_collaborators),
        successfulCollaborations: row.successful_collaborations,
        attributionSettings: row.attribution_settings,
        attributionReputation: row.attribution_reputation,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Failed to get creator profile:', error);
      return null;
    }
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async createAttributionRecord(
    request: CreateTemplateAttributionRequest,
    primaryCreatorShare: number
  ): Promise<string> {

    const user = await this.getUserInfo(request.primaryCreatorId);
    
    const insertQuery = `
      INSERT INTO template_attributions (
        template_id, template_version_id, primary_creator_id, primary_creator_name,
        primary_creator_email, creation_date, revenue_sharing, attribution_method, source_metadata
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)
      RETURNING id
    `;

    const revenueSharing = {
      primaryCreatorShare,
      collaboratorShares: Object.fromEntries(
        request.collaborators.map(c => [c.userId, c.contributionPercentage])
      ),
      originalCreatorShare: request.derivedFrom?.attributionPercentage || 0,
      platformFee: MARKETPLACE_ATTRIBUTION_DEFAULTS.DEFAULT_PLATFORM_FEE,
      totalPercentage: 100
    };

    const result = await this.database.query(insertQuery, [
      request.templateId,
      request.templateVersionId,
      request.primaryCreatorId,
      user.name,
      user.email,
      JSON.stringify(revenueSharing),
      request.attributionMethod,
      JSON.stringify(request.sourceMetadata)
    ]);

    return result.rows[0].id;
  }

  private async addCollaborators(attributionId: string, collaborators: unknown[]): Promise<void> {

    for (const collaborator of collaborators) {
      const user = await this.getUserInfo(collaborator.userId);
      
      const insertQuery = `
        INSERT INTO template_collaborators (
          template_attribution_id, user_id, user_name, user_email,
          contribution_type, contribution_percentage, contribution_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await this.database.query(insertQuery, [
        attributionId,
        collaborator.userId,
        user.name,
        user.email,
        collaborator.contributionType,
        collaborator.contributionPercentage,
        collaborator.contributionDescription
      ]);
    }
  }

  private async createDerivationRecord(templateId: string, derivedFrom: unknown): Promise<void> {

    const insertQuery = `
      INSERT INTO template_derivations (
        derived_template_id, original_template_id, original_creator_id,
        derivation_type, attribution_percentage
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    // Get original creator ID
    const originalCreatorQuery = 'SELECT primary_creator_id FROM template_attributions WHERE template_id = $1';
    const originalCreatorResult = await this.database.query(originalCreatorQuery, [derivedFrom.originalTemplateId]);
    const originalCreatorId = originalCreatorResult.rows[0]?.primary_creator_id;

    await this.database.query(insertQuery, [
      templateId,
      derivedFrom.originalTemplateId,
      originalCreatorId,
      derivedFrom.derivationType,
      derivedFrom.attributionPercentage
    ]);
  }

  private async updateCreatorProfile(userId: string): Promise<void> {

    const user = await this.getUserInfo(userId);
    
    const upsertQuery = `
      INSERT INTO creator_attribution_profiles (user_id, display_name, created_templates)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        created_templates = creator_attribution_profiles.created_templates + 1,
        updated_at = NOW()
    `;

    await this.database.query(upsertQuery, [userId, user.name]);
  }

  private async getUserInfo(userId: string): Promise<{ name: string; email: string }> {

    const query = 'SELECT name, email FROM users WHERE id = $1';
    const result = await this.database.query(query, [userId]);
    
    if (result.rows.length === 0) {
      throw new Error(`User not found: ${userId}`);
    }

    return {
      name: result.rows[0].name,
      email: result.rows[0].email
    };
  }

  private async getRelatedTemplates(_____templateId: string): Promise<any[]> {

    // Implementation would return related templates (derivatives, similar, etc.)
    return [];
  }

  private async getTemplateRevenueStatistics(templateId: string): Promise<unknown> {

    const query = `
      SELECT 
        COALESCE(SUM(ra.total_revenue_cents), 0) as total_revenue,
        COUNT(ra.id) as total_sales,
        AVG(ra.total_revenue_cents) as avg_revenue_per_sale
      FROM revenue_attributions ra
      WHERE ra.template_id = $1
    `;

    const result = await this.database.query(query, [templateId]);
    const row = result.rows[0];

    return {
      totalRevenue: parseInt(row.total_revenue) / 100,
      revenueByRecipient: {}, // Would calculate if needed
      averageRevenuePerSale: parseFloat(row.avg_revenue_per_sale) / 100 || 0,
      totalSales: parseInt(row.total_sales)
    };
  }

  private trackAttributionEvent(eventType: string, data: Record<string, unknown>): void {
    if (this.config.enableAnalytics) {
      this.analyticsBuffer.push({
        event_type: eventType,
        entity_type: 'attribution',
        entity_id: data.templateId || data.claimId || 'unknown',
        event_data: data,
        created_at: new Date()
      });
    }
  }

  private async flushAnalytics(): Promise<void> {

    if (this.analyticsBuffer.length === 0) return;

    try {
      const events = this.analyticsBuffer.splice(0);
      
      for (const event of events) {
        await this.database.query(
          `INSERT INTO attribution_analytics_events (event_type, entity_type, entity_id, event_data, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [event.event_type, event.entity_type, event.entity_id, JSON.stringify(event.event_data), event.created_at]
        );
      }
    } catch (error) {
      console.error('Failed to flush attribution analytics:', error);
    }
  }
}

export default MarketplaceAttributionService;