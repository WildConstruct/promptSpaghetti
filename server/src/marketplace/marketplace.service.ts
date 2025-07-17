// Epic 16 Marketplace Service Layer
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { MarketplaceDAO } from './dao';
import { 
  MarketplaceTemplate, 
  TemplateVersion, 
  MarketplacePurchase, 
  TemplateReview,
  TemplateWithStats,
  SearchFilters,
  SearchResult,
  TemplateStatus,
  PurchaseStatus,
  EventType,
  CreateTemplateSchema,
  UpdateTemplateSchema,
  CreateVersionSchema,
  CreateReviewSchema,
  CreatePurchaseSchema,
  PreviewRequest,
  PreviewResponse
} from './types';
import { Pool } from 'pg';
import * as crypto from 'crypto';

@Injectable()
export class MarketplaceService {
  private dao: MarketplaceDAO;

  constructor(private pool: Pool) {
    this.dao = new MarketplaceDAO(pool);
  }

  // Template operations
  async createTemplate(ownerId: string, templateData: any): Promise<MarketplaceTemplate> {
    const validated = CreateTemplateSchema.parse(templateData);
    
    const template = await this.dao.createTemplate({
      ...validated,
      owner_id: ownerId,
      status: TemplateStatus.DRAFT
    });

    // Record creation event
    await this.dao.recordEvent({
      event_type: EventType.VIEW,
      user_id: ownerId,
      template_id: template.id,
      metadata: { action: 'created' }
    });

    return template;
  }

  async getTemplate(id: string, userId?: string): Promise<TemplateWithStats | null> {
    const template = await this.dao.getTemplate(id);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Only return listed templates to non-owners
    if (template.status !== TemplateStatus.LISTED && template.owner_id !== userId) {
      throw new ForbiddenException('Template not accessible');
    }

    // Record view event
    if (userId) {
      await this.dao.recordEvent({
        event_type: EventType.VIEW,
        user_id: userId,
        template_id: id,
        metadata: { page: 'detail' }
      });
    }

    return template;
  }

  async updateTemplate(id: string, userId: string, updates: any): Promise<MarketplaceTemplate> {
    const template = await this.dao.getTemplate(id);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to update this template');
    }

    const validated = UpdateTemplateSchema.parse(updates);
    const updatedTemplate = await this.dao.updateTemplate(id, validated);
    
    if (!updatedTemplate) {
      throw new NotFoundException('Template not found');
    }

    return updatedTemplate;
  }

  async deleteTemplate(id: string, userId: string): Promise<void> {
    const template = await this.dao.getTemplate(id);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this template');
    }

    // Soft delete by archiving
    await this.dao.updateTemplate(id, { status: TemplateStatus.ARCHIVED });
  }

  async searchTemplates(filters: SearchFilters, userId?: string): Promise<SearchResult> {
    const result = await this.dao.searchTemplates(filters);

    // Record search event
    if (userId) {
      await this.dao.recordEvent({
        event_type: EventType.VIEW,
        user_id: userId,
        template_id: '', // No specific template for search
        metadata: { 
          action: 'search',
          query: filters.query,
          filters: {
            categories: filters.categories,
            price_range: [filters.price_min, filters.price_max],
            sort_by: filters.sort_by
          }
        }
      });
    }

    return result;
  }

  // Version management
  async createVersion(templateId: string, userId: string, versionData: any): Promise<TemplateVersion> {
    const template = await this.dao.getTemplate(templateId);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to create versions for this template');
    }

    const validated = CreateVersionSchema.parse(versionData);
    
    // Generate hash for the version
    const hashContent = JSON.stringify(validated.graph_json) + (validated.prompt_yaml || '');
    const hash = crypto.createHash('sha256').update(hashContent).digest('hex');

    const version = await this.dao.transaction(async (client) => {
      const newVersion = await this.dao.createVersion({
        ...validated,
        template_id: templateId,
        hash
      }, client);

      // Update template's current version
      await this.dao.updateTemplate(templateId, {
        current_version_id: newVersion.id
      }, client);

      return newVersion;
    });

    return version;
  }

  async getTemplateVersions(templateId: string, userId?: string): Promise<TemplateVersion[]> {
    const template = await this.dao.getTemplate(templateId);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Only owners can see all versions
    if (template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to view template versions');
    }

    return this.dao.getTemplateVersions(templateId);
  }

  async getVersion(id: string): Promise<TemplateVersion | null> {
    return this.dao.getVersion(id);
  }

  // Purchase operations
  async createPurchase(userId: string, purchaseData: any): Promise<MarketplacePurchase> {
    const validated = CreatePurchaseSchema.parse(purchaseData);
    
    const template = await this.dao.getTemplate(validated.template_id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.status !== TemplateStatus.LISTED) {
      throw new BadRequestException('Template is not available for purchase');
    }

    // Check if user already owns this template
    const existingPurchases = await this.dao.getUserPurchases(userId, 1000);
    const alreadyOwned = existingPurchases.some(p => 
      p.template_id === validated.template_id && p.status === PurchaseStatus.SUCCEEDED
    );

    if (alreadyOwned) {
      throw new BadRequestException('You already own this template');
    }

    // Use current version if not specified
    const versionId = validated.version_id || template.current_version_id;
    if (!versionId) {
      throw new BadRequestException('No version available for this template');
    }

    // Handle free templates
    if (template.price_cents === 0) {
      const purchase = await this.dao.createPurchase({
        buyer_id: userId,
        template_id: validated.template_id,
        version_id: versionId,
        amount_cents: 0,
        status: PurchaseStatus.SUCCEEDED
      });

      // Record purchase event
      await this.dao.recordEvent({
        event_type: EventType.PURCHASE,
        user_id: userId,
        template_id: validated.template_id,
        version_id: versionId,
        metadata: { amount: 0, type: 'free' }
      });

      return purchase;
    }

    // For paid templates, create pending purchase (will be completed via Stripe webhook)
    const purchase = await this.dao.createPurchase({
      buyer_id: userId,
      template_id: validated.template_id,
      version_id: versionId,
      amount_cents: template.price_cents,
      status: PurchaseStatus.PENDING
    });

    return purchase;
  }

  async completePurchase(stripeIntentId: string, status: PurchaseStatus): Promise<MarketplacePurchase | null> {
    const purchase = await this.dao.getPurchaseByStripeIntent(stripeIntentId);
    
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    const updatedPurchase = await this.dao.updatePurchase(purchase.id, { status });
    
    if (status === PurchaseStatus.SUCCEEDED && updatedPurchase) {
      // Record successful purchase event
      await this.dao.recordEvent({
        event_type: EventType.PURCHASE,
        user_id: updatedPurchase.buyer_id,
        template_id: updatedPurchase.template_id,
        version_id: updatedPurchase.version_id,
        metadata: { 
          amount: updatedPurchase.amount_cents,
          stripe_intent: stripeIntentId
        }
      });
    }

    return updatedPurchase;
  }

  async getUserPurchases(userId: string): Promise<any[]> {
    return this.dao.getUserPurchases(userId);
  }

  // Review operations
  async createReview(userId: string, reviewData: any): Promise<TemplateReview> {
    const validated = CreateReviewSchema.parse(reviewData);
    
    const template = await this.dao.getTemplate(validated.template_id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if user has purchased the template
    const purchases = await this.dao.getUserPurchases(userId);
    const hasPurchased = purchases.some(p => 
      p.template_id === validated.template_id && p.status === PurchaseStatus.SUCCEEDED
    );

    if (!hasPurchased) {
      throw new BadRequestException('You must purchase the template before reviewing');
    }

    const review = await this.dao.createReview({
      ...validated,
      buyer_id: userId
    });

    // Record review event
    await this.dao.recordEvent({
      event_type: EventType.RATING,
      user_id: userId,
      template_id: validated.template_id,
      metadata: { stars: validated.stars }
    });

    return review;
  }

  async getTemplateReviews(templateId: string): Promise<any[]> {
    return this.dao.getTemplateReviews(templateId);
  }

  // Preview system
  async previewTemplate(userId: string, request: PreviewRequest): Promise<PreviewResponse> {
    const template = await this.dao.getTemplate(request.template_id);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.status !== TemplateStatus.LISTED) {
      throw new BadRequestException('Template preview not available');
    }

    const versionId = request.version_id || template.current_version_id;
    if (!versionId) {
      throw new BadRequestException('No version available for preview');
    }

    const version = await this.dao.getVersion(versionId);
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    // Record preview event
    await this.dao.recordEvent({
      event_type: EventType.PREVIEW,
      user_id: userId,
      template_id: request.template_id,
      version_id: versionId,
      metadata: { claude_model: request.claude_model_override || version.claude_model }
    });

    // TODO: Implement actual Claude API preview with IP protection
    // For now, return a mock response
    const mockResponse: PreviewResponse = {
      output: '[PREVIEW] This is a sample output from the template. Purchase to see full results.',
      cost_estimate: version.token_per_run_estimate * 0.002, // Mock cost calculation
      quality_score: 4.2,
      token_usage: {
        input_tokens: 150,
        output_tokens: 75
      },
      cached: false,
      redacted_sections: ['sensitive_prompt_section', 'proprietary_logic']
    };

    return mockResponse;
  }

  // Categories
  async getCategories() {
    return this.dao.getCategories();
  }

  // Analytics
  async getTemplateAnalytics(templateId: string, userId: string) {
    const template = await this.dao.getTemplate(templateId);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.owner_id !== userId) {
      throw new ForbiddenException('Not authorized to view analytics for this template');
    }

    // TODO: Implement comprehensive analytics
    return {
      template_id: templateId,
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      period_end: new Date(),
      metrics: {
        views: template.total_views || 0,
        previews: template.total_previews || 0,
        purchases: template.total_purchases || 0,
        revenue_cents: template.total_revenue || 0,
        conversion_rate: template.total_views > 0 ? (template.total_purchases / template.total_views) * 100 : 0,
        avg_rating: template.avg_rating || 0,
        total_reviews: template.total_reviews || 0,
        refund_rate: 0 // TODO: Calculate from refunds
      }
    };
  }

  // Utility methods
  async refreshSearchIndex(): Promise<void> {
    await this.dao.refreshSearchIndex();
  }
}