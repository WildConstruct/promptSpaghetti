// Epic 16 Marketplace - Recommendation Engine Service
import { Injectable } from '@nestjs/common';
import { MarketplaceDAO } from './dao';
import { TemplateWithStats, EventType } from './types';
import { Pool } from 'pg';

}
interface RecommendationScore {
  templateId: string;
  score: number;
  reasons: string[];
}
}

}
interface UserBehavior {
  userId: string;
  viewedTemplates: string[];
  purchasedTemplates: string[];
  previewedTemplates: string[];
  searchQueries: string[];
  categories: string[];
  tags: string[];
}
}

}
interface SimilarityMatrix {
  [templateId: string]: {
    [otherTemplateId: string]: number;
}
  };
}

@Injectable()
export class RecommendationService {
  private dao: MarketplaceDAO;
  private similarityMatrix: SimilarityMatrix = {};
  private lastMatrixUpdate: Date = new Date(0);
  private readonly MATRIX_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private pool: Pool) {
    this.dao = new MarketplaceDAO(pool);
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10,
    excludeOwned: boolean = true
  ): Promise<TemplateWithStats[]> {

    try {
      const userBehavior = await this.getUserBehavior(userId);
      const ownedTemplates = excludeOwned ? userBehavior.purchasedTemplates : [];
      
      const recommendations = await this.calculatePersonalizedScores(userBehavior, ownedTemplates);
      const topRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Fetch full template details
      const templateIds = topRecommendations.map(r => r.templateId);
      return this.getTemplatesByIds(templateIds);
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Get similar templates based on content and user behavior
   */
  async getSimilarTemplates(
    templateId: string, 
    limit: number = 5
  ): Promise<TemplateWithStats[]> {

    try {
      await this.updateSimilarityMatrixIfNeeded();
      
      const similarities = this.similarityMatrix[templateId] || {};
      const similarTemplateIds = Object.entries(similarities)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, limit)
        .map(([id]) => id);

      return this.getTemplatesByIds(similarTemplateIds);
    } catch (error) {
      console.error('Error getting similar templates:', error);
      return this.getFallbackSimilarTemplates(templateId, limit);
    }
  }

  /**
   * Get trending templates based on recent activity
   */
  async getTrendingTemplates(
    timeWindow: number = 7, // days
    limit: number = 10
  ): Promise<TemplateWithStats[]> {

    const query = `
      WITH recent_activity AS (
        SELECT 
          template_id,
          COUNT(*) FILTER (WHERE event_type = 'view') as views,
          COUNT(*) FILTER (WHERE event_type = 'preview') as previews,
          COUNT(*) FILTER (WHERE event_type = 'purchase') as purchases,
          COUNT(DISTINCT user_id) as unique_users
        FROM marketplace_events 
        WHERE created_at >= NOW() - INTERVAL '${timeWindow} days'
        GROUP BY template_id
      ),
      trending_scores AS (
        SELECT 
          ra.template_id,
          (
            (ra.views * 1.0) + 
            (ra.previews * 3.0) + 
            (ra.purchases * 10.0) + 
            (ra.unique_users * 2.0)
          ) / GREATEST(EXTRACT(epoch FROM (NOW() - t.created_at)) / 86400, 1) as trend_score
        FROM recent_activity ra
        JOIN marketplace_templates t ON ra.template_id = t.id
        WHERE t.status = 'listed'

      SELECT template_id, trend_score
      FROM trending_scores
      WHERE trend_score > 0
      ORDER BY trend_score DESC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [limit]);
    const templateIds = result.rows.map(row => row.template_id);
    return this.getTemplatesByIds(templateIds);
  }

  /**
   * Get recommendations for new users (cold start problem)
   */
  async getNewUserRecommendations(limit: number = 10): Promise<TemplateWithStats[]> {

    // For new users, recommend:
    // 1. Featured templates
    // 2. High-rated templates
    // 3. Popular templates
    // 4. Free templates

    const query = `
      WITH template_scores AS (
        SELECT 
          t.id,
          (
            CASE WHEN t.featured_at IS NOT NULL THEN 50 ELSE 0 END +
            COALESCE(stats.avg_rating * 10, 0) +
            COALESCE(LN(GREATEST(stats.total_purchases, 1)) * 5, 0) +
            CASE WHEN t.price_cents = 0 THEN 20 ELSE 0 END
          ) as score
        FROM marketplace_templates t
        LEFT JOIN marketplace_template_stats stats ON t.id = stats.id
        WHERE t.status = 'listed'

      SELECT id, score
      FROM template_scores
      WHERE score > 0
      ORDER BY score DESC, RANDOM()
      LIMIT $1
    `;

    const result = await this.pool.query(query, [limit]);
    const templateIds = result.rows.map(row => row.id);
    return this.getTemplatesByIds(templateIds);
  }

  /**
   * Get category-based recommendations
   */
  async getCategoryRecommendations(
    categoryId: string, 
    limit: number = 10,
    excludeTemplateIds: string[] = []
  ): Promise<TemplateWithStats[]> {

    const excludeClause = excludeTemplateIds.length > 0 
      ? `AND t.id NOT IN (${excludeTemplateIds.map((_, i) => `$${i + 3}`).join(', ')})`
      : '';

    const query = `
      SELECT t.id
      FROM marketplace_templates t
      JOIN template_category_mappings tcm ON t.id = tcm.template_id
      LEFT JOIN marketplace_template_stats stats ON t.id = stats.id
      WHERE tcm.category_id = $1 
        AND t.status = 'listed'
        ${excludeClause}
      ORDER BY 
        COALESCE(stats.avg_rating, 0) DESC,
        COALESCE(stats.total_purchases, 0) DESC,
        t.created_at DESC
      LIMIT $2
    `;

    const params = [categoryId, limit, ...excludeTemplateIds];
    const result = await this.pool.query(query, params);
    const templateIds = result.rows.map(row => row.id);
    return this.getTemplatesByIds(templateIds);
  }

  /**
   * Get recommendations based on user's search history
   */
  async getSearchBasedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<TemplateWithStats[]> {

    const userBehavior = await this.getUserBehavior(userId);
    
    if (userBehavior.searchQueries.length === 0) {
      return this.getNewUserRecommendations(limit);
    }

    // Combine all search terms
    const searchTerms = userBehavior.searchQueries.join(' ');
    
    const query = `
      SELECT t.id, ts_rank(t.search_vector, plainto_tsquery('english', $1)) as rank
      FROM marketplace_templates t
      LEFT JOIN marketplace_template_stats stats ON t.id = stats.id
      WHERE t.status = 'listed'
        AND t.search_vector @@ plainto_tsquery('english', $1)
      ORDER BY 
        rank DESC,
        COALESCE(stats.avg_rating, 0) DESC,
        COALESCE(stats.total_purchases, 0) DESC
      LIMIT $2
    `;

    const result = await this.pool.query(query, [searchTerms, limit]);
    const templateIds = result.rows.map(row => row.id);
    return this.getTemplatesByIds(templateIds);
  }

  /**
   * Get user behavior data for recommendations
   */
  private async getUserBehavior(userId: string): Promise<UserBehavior> {

    const query = `
      SELECT 
        event_type,
        template_id,
        metadata
      FROM marketplace_events 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '90 days'
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [userId]);
    
    const behavior: UserBehavior = {
      userId,
      viewedTemplates: [],
      purchasedTemplates: [],
      previewedTemplates: [],
      searchQueries: [],
      categories: [],
      tags: []
    };

    for (const row of result.rows) {
      switch (row.event_type) {
      case EventType.VIEW:
        if (!behavior.viewedTemplates.includes(row.template_id)) {
          behavior.viewedTemplates.push(row.template_id);
        }
        break;
      case EventType.PURCHASE:
        if (!behavior.purchasedTemplates.includes(row.template_id)) {
          behavior.purchasedTemplates.push(row.template_id);
        }
        break;
      case EventType.PREVIEW:
        if (!behavior.previewedTemplates.includes(row.template_id)) {
          behavior.previewedTemplates.push(row.template_id);
        }
        break;
      }

      // Extract search queries from metadata
      if (row.metadata?.query && !behavior.searchQueries.includes(row.metadata.query)) {
        behavior.searchQueries.push(row.metadata.query);
      }
    }

    return behavior;
  }

  /**
   * Calculate personalized recommendation scores
   */
  private async calculatePersonalizedScores(
    userBehavior: UserBehavior,
    excludeTemplateIds: string[]
  ): Promise<RecommendationScore[]> {

    // Get all available templates
    const templates = await this.dao.searchTemplates({
      limit: 1000 // Get all templates for scoring
    });

    const scores: RecommendationScore[] = [];

    for (const template of templates.templates) {
      if (excludeTemplateIds.includes(template.id)) continue;

      let score = 0;
      const reasons: string[] = [];

      // Base popularity score
      score += Math.log(template.total_purchases + 1) * 2;
      score += template.avg_rating * 5;

      // User behavior matching
      if (userBehavior.viewedTemplates.length > 0) {
        // Similar templates based on viewed history
        const similarityScore = await this.calculateContentSimilarity(
          template.id, 
          userBehavior.viewedTemplates
        );
        score += similarityScore * 10;
        
        if (similarityScore > 0.3) {
          reasons.push('Similar to templates you viewed');
        }
      }

      // Category preference
      const categoryMatch = template.categories?.some(cat => 
        userBehavior.categories.includes(cat)
      );
      if (categoryMatch) {
        score += 15;
        reasons.push('Matches your interests');
      }

      // Tag preference
      const tagMatch = template.tags.some(tag => 
        userBehavior.tags.includes(tag)
      );
      if (tagMatch) {
        score += 10;
        reasons.push('Related to your preferences');
      }

      // Boost newer templates slightly
      const daysSinceCreated = (Date.now() - new Date(template.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 30) {
        score += 5;
        reasons.push('Recently added');
      }

      // Boost free templates for new users
      if (template.price_cents === 0) {
        score += 8;
        reasons.push('Free to try');
      }

      if (score > 0) {
        scores.push({
          templateId: template.id,
          score,
          reasons
        });
      }
    }

    return scores;
  }

  /**
   * Calculate content similarity between templates
   */
  private async calculateContentSimilarity(
    templateId: string, 
    comparisonTemplateIds: string[]
  ): Promise<number> {

    // Simplified similarity calculation based on tags and categories
    // In production, this could use more sophisticated NLP/embedding techniques
    
    const template = await this.dao.getTemplate(templateId);
    if (!template) return 0;

    let maxSimilarity = 0;

    for (const compareId of comparisonTemplateIds) {
      const compareTemplate = await this.dao.getTemplate(compareId);
      if (!compareTemplate) continue;

      let similarity = 0;
      let totalFeatures = 0;

      // Tag similarity
      const commonTags = template.tags.filter(tag => 
        compareTemplate.tags.includes(tag)
      ).length;
      const totalTags = new Set([...template.tags, ...compareTemplate.tags]).size;
      if (totalTags > 0) {
        similarity += (commonTags / totalTags) * 0.4;
        totalFeatures++;
      }

      // Category similarity
      const commonCategories = template.categories?.filter(cat => 
        compareTemplate.categories?.includes(cat)
      ).length || 0;
      const totalCategories = new Set([
        ...(template.categories || []), 
        ...(compareTemplate.categories || [])
      ]).size;
      if (totalCategories > 0) {
        similarity += (commonCategories / totalCategories) * 0.6;
        totalFeatures++;
      }

      if (totalFeatures > 0) {
        similarity /= totalFeatures;
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }

    return maxSimilarity;
  }

  /**
   * Update the similarity matrix (run periodically)
   */
  private async updateSimilarityMatrixIfNeeded(): Promise<void> {

    const now = new Date();
    if (now.getTime() - this.lastMatrixUpdate.getTime() < this.MATRIX_UPDATE_INTERVAL) {
      return;
    }

    await this.buildSimilarityMatrix();
    this.lastMatrixUpdate = now;
  }

  /**
   * Build similarity matrix for all templates
   */
  private async buildSimilarityMatrix(): Promise<void> {

    const templates = await this.dao.searchTemplates({ limit: 1000 });
    const matrix: SimilarityMatrix = {};

    for (const template of templates.templates) {
      matrix[template.id] = {};
      
      for (const otherTemplate of templates.templates) {
        if (template.id !== otherTemplate.id) {
          const similarity = await this.calculateContentSimilarity(
            template.id, 
            [otherTemplate.id]
          );
          matrix[template.id][otherTemplate.id] = similarity;
        }
      }
    }

    this.similarityMatrix = matrix;
  }

  /**
   * Get templates by IDs while preserving order
   */
  private async getTemplatesByIds(templateIds: string[]): Promise<TemplateWithStats[]> {

    if (templateIds.length === 0) return [];

    const placeholders = templateIds.map((_, i) => `$${i + 1}`).join(', ');
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
        u.name as owner_name,
        u.email as owner_email
      FROM marketplace_templates t
      LEFT JOIN marketplace_template_stats stats ON t.id = stats.id
      LEFT JOIN template_category_mappings tcm ON t.id = tcm.template_id
      LEFT JOIN template_categories c ON tcm.category_id = c.id
      LEFT JOIN users u ON t.owner_id = u.id
      WHERE t.id IN (${placeholders}) AND t.status = 'listed'
      GROUP BY t.id, stats.total_purchases, stats.total_reviews, stats.avg_rating, 
               stats.total_revenue, stats.last_purchase_at, stats.total_views, 
               stats.total_previews, u.name, u.email
    `;

    const result = await this.pool.query(query, templateIds);
    
    // Preserve order
    const templateMap = new Map(result.rows.map(row => [row.id, {
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
        verified: true
      }
    }]));

    return templateIds.map(id => templateMap.get(id)).filter(Boolean);
  }

  /**
   * Fallback recommendations when personalization fails
   */
  private async getFallbackRecommendations(limit: number): Promise<TemplateWithStats[]> {

    return this.getNewUserRecommendations(limit);
  }

  /**
   * Fallback similar templates when similarity calculation fails
   */
  private async getFallbackSimilarTemplates(
    templateId: string, 
    limit: number
  ): Promise<TemplateWithStats[]> {

    const template = await this.dao.getTemplate(templateId);
    if (!template || !template.categories?.length) {
      return this.getFallbackRecommendations(limit);
    }

    return this.getCategoryRecommendations(template.categories[0], limit, [templateId]);
  }
}