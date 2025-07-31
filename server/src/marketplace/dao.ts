// Epic 16 Marketplace Data Access Object
import { Pool, PoolClient } from 'pg';
import {
  MarketplaceTemplate,
  TemplateVersion,
  MarketplacePurchase,
  TemplateReview,
  TemplateCategory,
  MarketplaceEvent,
  TemplateCollection,
  TemplateWithStats,
  PurchaseWithDetails,
  ReviewWithDetails,
  SearchFilters,
  SearchResult,
  TemplateStatus,
  PurchaseStatus,
  ModerationStatus,
  EventType,
} from './types';

export class MarketplaceDAO {
  constructor(private pool: Pool) {}

  // Template operations
  async createTemplate(template: Partial<MarketplaceTemplate>, client?: PoolClient): Promise<MarketplaceTemplate> {
    const useClient = client || this.pool;

    const query = `
      INSERT INTO marketplace_templates (
        owner_id, title, description, tags, price_cents, 
        is_ai_generated, claude_compat, status, stats
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      template.owner_id,
      template.title,
      template.description || null,
      template.tags || [],
      template.price_cents || 0,
      template.is_ai_generated || false,
      template.claude_compat || ['claude-3-sonnet'],
      template.status || TemplateStatus.DRAFT,
      template.stats || {},
    ];

    const result = await useClient.query(query, values);
    return result.rows[0];
  }

  async getTemplate(id: string): Promise<TemplateWithStats | null> {
    const query = `
      SELECT 
        t.*,
        stats.total_purchases,
        stats.total_reviews,
        stats.avg_rating,
        stats.total_revenue,
        stats.last_purchase_at,
        stats.total_views,
        stats.total_previews,
        array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as categories,
        tv.graph_json as current_version_graph,
        u.name as owner_name,
        u.email as owner_email
      FROM marketplace_templates t
      LEFT JOIN marketplace_template_stats stats ON t.id = stats.id
      LEFT JOIN template_category_mappings tcm ON t.id = tcm.template_id
      LEFT JOIN template_categories c ON tcm.category_id = c.id
      LEFT JOIN template_versions tv ON t.current_version_id = tv.id
      LEFT JOIN users u ON t.owner_id = u.id
      WHERE t.id = $1
      GROUP BY t.id, stats.total_purchases, stats.total_reviews, stats.avg_rating, 
               stats.total_revenue, stats.last_purchase_at, stats.total_views, 
               stats.total_previews, tv.graph_json, u.name, u.email
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      categories: row.categories || [],
      total_purchases: row.total_purchases || 0,
      total_reviews: row.total_reviews || 0,
      avg_rating: parseFloat(row.avg_rating) || 0,
      total_revenue: row.total_revenue || 0,
      total_views: row.total_views || 0,
      total_previews: row.total_previews || 0,
      owner: {
        id: row.owner_id,
        name: row.owner_name,
        email: row.owner_email,
        verified: true, // TODO: Add verification logic
      },
    };
  }

  async updateTemplate(
    id: string,
    updates: Partial<MarketplaceTemplate>,
    client?: PoolClient
  ): Promise<MarketplaceTemplate | null> {
    const useClient = client || this.pool;

    const setClause = [];
    const values = [];
    let valueIndex = 1;

    if (updates.title) {
      setClause.push(`title = $${valueIndex++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${valueIndex++}`);
      values.push(updates.description);
    }
    if (updates.tags) {
      setClause.push(`tags = $${valueIndex++}`);
      values.push(updates.tags);
    }
    if (updates.price_cents !== undefined) {
      setClause.push(`price_cents = $${valueIndex++}`);
      values.push(updates.price_cents);
    }
    if (updates.status) {
      setClause.push(`status = $${valueIndex++}`);
      values.push(updates.status);
    }
    if (updates.current_version_id !== undefined) {
      setClause.push(`current_version_id = $${valueIndex++}`);
      values.push(updates.current_version_id);
    }
    if (updates.featured_at !== undefined) {
      setClause.push(`featured_at = $${valueIndex++}`);
      values.push(updates.featured_at);
    }

    if (setClause.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE marketplace_templates 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await useClient.query(query, values);
    return result.rows[0] || null;
  }

  async deleteTemplate(id: string, client?: PoolClient): Promise<boolean> {
    const useClient = client || this.pool;

    const query = 'DELETE FROM marketplace_templates WHERE id = $1';
    const result = await useClient.query(query, [id]);
    return result.rowCount > 0;
  }

  // Search functionality
  async searchTemplates(filters: SearchFilters): Promise<SearchResult> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM marketplace_search_index t
      WHERE t.status = 'listed'
    `;

    const conditions = [];
    const values = [];
    let valueIndex = 1;

    // Text search
    if (filters.query) {
      conditions.push(`t.search_vector @@ plainto_tsquery('english', $${valueIndex++})`);
      values.push(filters.query);
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      conditions.push(`t.categories && $${valueIndex++}`);
      values.push(filters.categories);
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`t.tags && $${valueIndex++}`);
      values.push(filters.tags);
    }

    // Price filters
    if (filters.price_min !== undefined) {
      conditions.push(`t.price_cents >= $${valueIndex++}`);
      values.push(filters.price_min);
    }
    if (filters.price_max !== undefined) {
      conditions.push(`t.price_cents <= $${valueIndex++}`);
      values.push(filters.price_max);
    }

    // Rating filter
    if (filters.rating_min !== undefined) {
      conditions.push(`t.avg_rating >= $${valueIndex++}`);
      values.push(filters.rating_min);
    }

    // Free templates filter
    if (filters.is_free === true) {
      conditions.push('t.price_cents = 0');
    } else if (filters.is_free === false) {
      conditions.push('t.price_cents > 0');
    }

    // Featured filter
    if (filters.is_featured === true) {
      conditions.push('t.featured_at IS NOT NULL');
    }

    if (conditions.length > 0) {
      baseQuery += ' AND ' + conditions.join(' AND ');
    }

    // Sorting
    let orderBy = '';
    switch (filters.sort_by) {
      case 'price_asc':
        orderBy = 'ORDER BY t.price_cents ASC, t.created_at DESC';
        break;
      case 'price_desc':
        orderBy = 'ORDER BY t.price_cents DESC, t.created_at DESC';
        break;
      case 'rating':
        orderBy = 'ORDER BY t.avg_rating DESC, t.total_reviews DESC, t.created_at DESC';
        break;
      case 'popularity':
        orderBy = 'ORDER BY t.total_purchases DESC, t.avg_rating DESC, t.created_at DESC';
        break;
      case 'newest':
        orderBy = 'ORDER BY t.created_at DESC';
        break;
      case 'oldest':
        orderBy = 'ORDER BY t.created_at ASC';
        break;
      case 'relevance':
      default:
        if (filters.query) {
          orderBy =
            "ORDER BY ts_rank(t.search_vector, plainto_tsquery('english', $1)) DESC, t.featured_at DESC NULLS LAST, t.avg_rating DESC";
        } else {
          orderBy = 'ORDER BY t.featured_at DESC NULLS LAST, t.avg_rating DESC, t.total_purchases DESC';
        }
        break;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const countResult = await this.pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const selectQuery = `
      SELECT t.*, 
             t.avg_rating::DECIMAL(3,2) as avg_rating,
             t.total_purchases::INTEGER as total_purchases,
             t.total_reviews::INTEGER as total_reviews
      ${baseQuery}
      ${orderBy}
      LIMIT $${valueIndex++} OFFSET $${valueIndex++}
    `;

    values.push(limit, offset);
    const result = await this.pool.query(selectQuery, values);

    return {
      templates: result.rows,
      total,
      page,
      limit,
      has_more: page * limit < total,
    };
  }

  // Version operations
  async createVersion(version: Partial<TemplateVersion>, client?: PoolClient): Promise<TemplateVersion> {
    const useClient = client || this.pool;

    // Get next version number
    const versionQuery = `
      SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
      FROM template_versions 
      WHERE template_id = $1
    `;
    const versionResult = await useClient.query(versionQuery, [version.template_id]);
    const nextVersion = versionResult.rows[0].next_version;

    const query = `
      INSERT INTO template_versions (
        template_id, version_number, claude_model, graph_json, 
        prompt_yaml, changelog_md, hash, token_per_run_estimate, 
        safety_score, s3_asset_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      version.template_id,
      nextVersion,
      version.claude_model || 'claude-3-sonnet',
      version.graph_json,
      version.prompt_yaml || null,
      version.changelog_md || null,
      version.hash,
      version.token_per_run_estimate || 0,
      version.safety_score || 0.0,
      version.s3_asset_key || null,
    ];

    const result = await useClient.query(query, values);
    return result.rows[0];
  }

  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    const query = `
      SELECT * FROM template_versions 
      WHERE template_id = $1 
      ORDER BY version_number DESC
    `;

    const result = await this.pool.query(query, [templateId]);
    return result.rows;
  }

  async getVersion(id: string): Promise<TemplateVersion | null> {
    const query = 'SELECT * FROM template_versions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Purchase operations
  async createPurchase(purchase: Partial<MarketplacePurchase>, client?: PoolClient): Promise<MarketplacePurchase> {
    const useClient = client || this.pool;

    const query = `
      INSERT INTO marketplace_purchases (
        buyer_id, template_id, version_id, stripe_payment_intent_id,
        amount_cents, status, refund_amount_cents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      purchase.buyer_id,
      purchase.template_id,
      purchase.version_id,
      purchase.stripe_payment_intent_id || null,
      purchase.amount_cents,
      purchase.status || PurchaseStatus.PENDING,
      purchase.refund_amount_cents || 0,
    ];

    const result = await useClient.query(query, values);
    return result.rows[0];
  }

  async updatePurchase(
    id: string,
    updates: Partial<MarketplacePurchase>,
    client?: PoolClient
  ): Promise<MarketplacePurchase | null> {
    const useClient = client || this.pool;

    const setClause = [];
    const values = [];
    let valueIndex = 1;

    if (updates.status) {
      setClause.push(`status = $${valueIndex++}`);
      values.push(updates.status);
    }
    if (updates.refund_reason) {
      setClause.push(`refund_reason = $${valueIndex++}`);
      values.push(updates.refund_reason);
    }
    if (updates.refund_amount_cents !== undefined) {
      setClause.push(`refund_amount_cents = $${valueIndex++}`);
      values.push(updates.refund_amount_cents);
    }
    if (updates.escrow_released_at !== undefined) {
      setClause.push(`escrow_released_at = $${valueIndex++}`);
      values.push(updates.escrow_released_at);
    }

    if (setClause.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE marketplace_purchases 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await useClient.query(query, values);
    return result.rows[0] || null;
  }

  async getPurchaseByStripeIntent(stripeIntentId: string): Promise<MarketplacePurchase | null> {
    const query = 'SELECT * FROM marketplace_purchases WHERE stripe_payment_intent_id = $1';
    const result = await this.pool.query(query, [stripeIntentId]);
    return result.rows[0] || null;
  }

  async getUserPurchases(userId: string, limit: number = 50): Promise<PurchaseWithDetails[]> {
    const query = `
      SELECT 
        p.*,
        t.title as template_title,
        t.description as template_description,
        tv.version_number,
        tv.claude_model
      FROM marketplace_purchases p
      JOIN marketplace_templates t ON p.template_id = t.id
      LEFT JOIN template_versions tv ON p.version_id = tv.id
      WHERE p.buyer_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2
    `;

    const result = await this.pool.query(query, [userId, limit]);
    return result.rows.map(row => ({
      ...row,
      template: {
        id: row.template_id,
        title: row.template_title,
        description: row.template_description,
      },
    }));
  }

  // Review operations
  async createReview(review: Partial<TemplateReview>, client?: PoolClient): Promise<TemplateReview> {
    const useClient = client || this.pool;

    // Check if user has purchased the template
    const purchaseQuery = `
      SELECT id FROM marketplace_purchases 
      WHERE buyer_id = $1 AND template_id = $2 AND status = 'succeeded'
      LIMIT 1
    `;
    const purchaseResult = await useClient.query(purchaseQuery, [review.buyer_id, review.template_id]);
    const verifiedPurchase = purchaseResult.rows.length > 0;
    const purchaseId = verifiedPurchase ? purchaseResult.rows[0].id : null;

    const query = `
      INSERT INTO template_reviews (
        template_id, buyer_id, purchase_id, stars, comment,
        verified_purchase, moderation_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      review.template_id,
      review.buyer_id,
      purchaseId,
      review.stars,
      review.comment || null,
      verifiedPurchase,
      ModerationStatus.PENDING,
    ];

    const result = await useClient.query(query, values);
    return result.rows[0];
  }

  async getTemplateReviews(templateId: string, limit: number = 20): Promise<ReviewWithDetails[]> {
    const query = `
      SELECT 
        r.*,
        u.name as buyer_name
      FROM template_reviews r
      JOIN users u ON r.buyer_id = u.id
      WHERE r.template_id = $1 AND r.moderation_status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT $2
    `;

    const result = await this.pool.query(query, [templateId, limit]);
    return result.rows.map(row => ({
      ...row,
      buyer: {
        id: row.buyer_id,
        name: row.buyer_name,
        verified: row.verified_purchase,
      },
    }));
  }

  // Analytics and events
  async recordEvent(event: Partial<MarketplaceEvent>, client?: PoolClient): Promise<void> {
    const useClient = client || this.pool;

    const query = `
      INSERT INTO marketplace_events (
        event_type, user_id, template_id, version_id,
        session_id, metadata, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      event.event_type,
      event.user_id || null,
      event.template_id,
      event.version_id || null,
      event.session_id || null,
      event.metadata || {},
      event.ip_address || null,
      event.user_agent || null,
    ];

    await useClient.query(query, values);
  }

  // Categories
  async getCategories(): Promise<TemplateCategory[]> {
    const query = `
      SELECT * FROM template_categories 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  // Utility methods
  async refreshSearchIndex(): Promise<void> {
    await this.pool.query('SELECT refresh_marketplace_search_index()');
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
