/**
 * Epic 16 Marketplace - Template Categorization Service
 * 
 * Hierarchical categorization system for marketplace templates with intelligent
 * classification, tagging, and organization capabilities for the knowledge base.
 * 
 * Features:
 * - Hierarchical category tree with subcategories
 * - Intelligent auto-categorization using ML/NLP
 * - Dynamic tagging system with suggestions
 * - Category performance analytics
 * - Content classification and quality scoring
 * - Cross-category recommendations
 * - Category-based search optimization
 * - Admin tools for category management
 */

import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

}
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  depth: number;
  path: string[];              // Full path from root ['Business', 'Marketing', 'Email']
  icon?: string;
  color?: string;
  
  // Hierarchy
  children: Category[];
  parent?: Category;
  
  // Statistics
  stats: {
    templateCount: number;
    activeCount: number;
    totalDownloads: number;
    averageRating: number;
    trendingScore: number;
}
}
  };
  
  // Configuration
  config: {
    featured: boolean;
    visible: boolean;
    searchable: boolean;
    autoClassification: boolean;
    requireApproval: boolean;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    sortOrder: number;
    keywords: string[];         // For classification
    aliases: string[];          // Alternative names
  };
}

}
}
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;           // Associated category
  
  // Statistics
  usageCount: number;
  trendingScore: number;
  relatedTags: string[];
  
  // Classification
  type: 'functional' | 'topical' | 'industry' | 'technical' | 'style';
  confidence: number;          // AI confidence in tag relevance
  
  // Metadata
  createdAt: Date;
  approved: boolean;
  suggestedBy?: 'ai' | 'user' | 'admin';
}
}
}

}
}
export interface ClassificationResult {
  primaryCategory: {
    id: string;
    name: string;
    confidence: number;
    reasoning: string;
}
}
  };
  
  secondaryCategories: Array<{
    id: string;
    name: string;
    confidence: number;
  }>;
  
  suggestedTags: Array<{
    name: string;
    type: Tag['type'];
    confidence: number;
    source: 'content' | 'similar' | 'trending';
  }>;
  
  complexity: 'beginner' | 'intermediate' | 'advanced';
  qualityScore: number;        // 0-1 overall quality assessment
  
  flags: Array<{
    type: 'duplicate' | 'low_quality' | 'miscategorized' | 'inappropriate';
    confidence: number;
    reason: string;
  }>;
}

}
}
export interface CategoryTree {
  categories: Category[];
  totalCount: number;
  maxDepth: number;
  lastUpdated: Date;
}
}
}

}
}
export interface CategoryAnalytics {
  category: Category;
  performance: {
    growth: {
}
}
      templates: { current: number; previous: number; change: number };
      downloads: { current: number; previous: number; change: number };
      ratings: { current: number; previous: number; change: number };
    };
    topTemplates: Array<{
      id: string;
      title: string;
      downloads: number;
      rating: number;
    }>;
    userEngagement: {
      viewsPerTemplate: number;
      downloadRate: number;
      ratingParticipation: number;
    };
    trends: Array<{
      date: string;
      templates: number;
      downloads: number;
      rating: number;
    }>;
  };
  recommendations: {
    optimization: string[];
    content: string[];
    structure: string[];
  };
}

@Injectable()
export class CategorizationService {
  private redis: Redis;

  constructor(private pool: Pool) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      keyPrefix: 'categorization:'
    });
  }

  /**
   * Get complete category tree with statistics
   */
  async getCategoryTree(includeStats: boolean = true): Promise<CategoryTree> {

    try {
      const cacheKey = `tree:${includeStats ? 'with-stats' : 'basic'}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        WITH RECURSIVE category_hierarchy AS (
          -- Base case: root categories
          SELECT 
            c.*,
            ARRAY[c.name] as path,
            0 as depth,
            c.name as full_path
          FROM marketplace_categories c 
          WHERE parent_id IS NULL
          
          UNION ALL
          
          -- Recursive case: child categories
          SELECT 
            c.*,
            ch.path || c.name as path,
            ch.depth + 1 as depth,
            ch.full_path || ' > ' || c.name as full_path
          FROM marketplace_categories c
          JOIN category_hierarchy ch ON c.parent_id = ch.id

        SELECT 
          ch.*,
          ${includeStats ? `
          COALESCE(stats.template_count, 0) as template_count,
          COALESCE(stats.active_count, 0) as active_count,
          COALESCE(stats.total_downloads, 0) as total_downloads,
          COALESCE(stats.average_rating, 0) as average_rating,
          COALESCE(stats.trending_score, 0) as trending_score
          ` : '0 as template_count, 0 as active_count, 0 as total_downloads, 0 as average_rating, 0 as trending_score'}
        FROM category_hierarchy ch
        ${includeStats ? `
        LEFT JOIN marketplace_category_stats stats ON ch.id = stats.category_id
        ` : ''}
        ORDER BY ch.depth, ch.sort_order, ch.name
      `;

      const result = await this.pool.query(query);
      const flatCategories = result.rows.map(this.mapRowToCategory);

      // Build hierarchical tree
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      // First pass: create all categories
      flatCategories.forEach(category => {
        categoryMap.set(category.id, category);
      });

      // Second pass: build hierarchy
      flatCategories.forEach(category => {
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(category);
            category.parent = parent;
          }
        } else {
          rootCategories.push(category);
        }
      });

      const tree: CategoryTree = {
        categories: rootCategories,
        totalCount: flatCategories.length,
        maxDepth: Math.max(...flatCategories.map(c => c.depth)),
        lastUpdated: new Date()
      };

      // Cache for 10 minutes
      await this.redis.setex(cacheKey, 600, JSON.stringify(tree));

      return tree;
    } catch (error) {
      console.error('Failed to get category tree:', error);
      throw error;
    }
  }

  /**
   * Automatically classify template content
   */
  async classifyTemplate(
    title: string,
    description: string,
    content?: any,
    existingTags?: string[]
  ): Promise<ClassificationResult> {

    try {
      // Analyze content for classification
      const analysis = await this.analyzeContent(title, description, content);
      
      // Get category suggestions based on content
      const categoryResults = await this.suggestCategories(analysis);
      
      // Get tag suggestions
      const tagResults = await this.suggestTags(analysis, existingTags);
      
      // Assess complexity
      const complexity = this.assessComplexity(analysis);
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(analysis);
      
      // Detect potential issues
      const flags = await this.detectContentFlags(analysis);

      return {
        primaryCategory: categoryResults[0] || {
          id: 'general',
          name: 'General',
          confidence: 0.5,
          reasoning: 'Default category assigned due to unclear content classification'
  }
        secondaryCategories: categoryResults.slice(1, 4),
        suggestedTags: tagResults,
        complexity,
        qualityScore,
        flags
      };
    } catch (error) {
      console.error('Classification failed:', error);
      throw error;
    }
  }

  /**
   * Get or create tags with intelligent suggestions
   */
  async getOrCreateTags(
    tagNames: string[],
    context?: {
      templateId?: string;
      category?: string;
      title?: string;
      description?: string;
    }
  ): Promise<Tag[]> {

    try {
      const results: Tag[] = [];

      for (const tagName of tagNames) {
        // Check if tag exists
        let tag = await this.getTagByName(tagName);
        
        if (!tag) {
          // Create new tag with AI classification
          tag = await this.createTag(tagName, context);
        } else {
          // Update usage statistics
          await this.updateTagUsage(tag.id);
        }
        
        results.push(tag);
      }

      return results;
    } catch (error) {
      console.error('Failed to get or create tags:', error);
      throw error;
    }
  }

  /**
   * Get category analytics and performance insights
   */
  async getCategoryAnalytics(
    categoryId: string,
    timeframe: '7d' | '30d' | '90d' = '30d'
  ): Promise<CategoryAnalytics> {

    try {
      const category = await this.getCategoryById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      const intervalMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days'
      };

      // Get performance data
      const [growthData, topTemplates, engagementData, trendsData] = await Promise.all([
        this.getCategoryGrowthData(categoryId, intervalMap[timeframe]),
        this.getCategoryTopTemplates(categoryId, 10),
        this.getCategoryEngagementData(categoryId, intervalMap[timeframe]),
        this.getCategoryTrendsData(categoryId, intervalMap[timeframe])
      ]);

      // Generate recommendations
      const recommendations = await this.generateCategoryRecommendations(
        category,
        growthData,
        engagementData
      );

      return {
        category,
        performance: {
          growth: growthData,
          topTemplates,
          userEngagement: engagementData,
          trends: trendsData
  }
        recommendations
      };
    } catch (error) {
      console.error('Failed to get category analytics:', error);
      throw error;
    }
  }

  /**
   * Suggest category reorganization and optimization
   */
  async suggestCategoryOptimization(): Promise<{
    underutilized: Category[];
    oversaturated: Category[];
    suggested: Array<{
      action: 'merge' | 'split' | 'move' | 'create';
      target: string;
      reason: string;
      impact: string;
    }>;
  }> {
    try {
      const tree = await this.getCategoryTree(true);
      const allCategories = this.flattenCategoryTree(tree.categories);

      // Find underutilized categories (< 5 templates, low engagement)
      const underutilized = allCategories.filter(cat => 
        cat.stats.templateCount < 5 && 
        cat.stats.averageRating < 3.5
      );

      // Find oversaturated categories (> 100 templates, consider splitting)
      const oversaturated = allCategories.filter(cat => 
        cat.stats.templateCount > 100
      );

      // Generate optimization suggestions
      const suggestions = await this.generateOptimizationSuggestions(
        allCategories,
        underutilized,
        oversaturated
      );

      return {
        underutilized,
        oversaturated,
        suggested: suggestions
      };
    } catch (error) {
      console.error('Failed to suggest category optimization:', error);
      throw error;
    }
  }

  // Private helper methods

  private async analyzeContent(title: string, description: string, content?: any): Promise<{
    keywords: string[];
    topics: string[];
    sentiment: number;
    complexity: number;
    quality: number;
    language: string;
    wordCount: number;
    readability: number;
  }> {

    // Simplified content analysis - would integrate with NLP service
    const text = (title + ' ' + description).toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 2);
    
    return {
      keywords: this.extractKeywords(words),
      topics: this.extractTopics(words),
      sentiment: this.analyzeSentiment(text),
      complexity: this.analyzeComplexity(text),
      quality: this.analyzeQuality(text, title, description),
      language: 'en', // Would detect language
      wordCount: words.length,
      readability: this.calculateReadability(text)
    };
  }

  private extractKeywords(words: string[]): string[] {
    // Simplified keyword extraction
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return [...new Set(words.filter(word => !stopWords.has(word)))]
      .slice(0, 10);
  }

  private extractTopics(words: string[]): string[] {
    // Simplified topic extraction
    const topicWords = ['business', 'marketing', 'technical', 'creative', 'education', 'automation', 'design'];
    return topicWords.filter(topic => words.some(word => word.includes(topic)));
  }

  private analyzeSentiment(text: string): number {
    // Simplified sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'helpful', 'useful'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'useless', 'broken'];
    
    const positive = positiveWords.filter(word => text.includes(word)).length;
    const negative = negativeWords.filter(word => text.includes(word)).length;
    
    return (positive - negative) / Math.max(positive + negative, 1);
  }

  private analyzeComplexity(text: string): number {
    // Simplified complexity analysis based on text characteristics
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
    // Normalize to 0-1 scale
    return Math.min(avgWordsPerSentence / 20, 1);
  }

  private analyzeQuality(text: string, title: string, description: string): number {
    let score = 0.5; // Base score
    
    // Title quality
    if (title.length > 10 && title.length < 100) score += 0.1;
    if (title.split(' ').length >= 3) score += 0.1;
    
    // Description quality
    if (description.length > 50) score += 0.1;
    if (description.length > 200) score += 0.1;
    
    // Content structure
    if (description.includes('\n') || description.includes('.')) score += 0.1;
    
    return Math.min(score, 1);
  }

  private calculateReadability(text: string): number {
    // Simplified readability score
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
    // Higher score = more readable (shorter sentences)
    return Math.max(0, 1 - (avgWordsPerSentence - 10) / 20);
  }

  private async suggestCategories(analysis: any): Promise<Array<{
    id: string;
    name: string;
    confidence: number;
    reasoning: string;
  }>> {
    // Simplified category suggestion based on keywords and topics
    const suggestions = [];
    
    // Business-related
    if (analysis.topics.includes('business') || analysis.keywords.includes('business')) {
      suggestions.push({
        id: 'business',
        name: 'Business',
        confidence: 0.8,
        reasoning: 'Content contains business-related keywords and topics'
      });
    }
    
    // Technical content
    if (analysis.topics.includes('technical') || analysis.keywords.some((k: string) => ['code', 'api', 'technical'].includes(k))) {
      suggestions.push({
        id: 'technical',
        name: 'Technical',
        confidence: 0.7,
        reasoning: 'Content appears to be technical in nature'
      });
    }
    
    return suggestions.slice(0, 5);
  }

  private async suggestTags(analysis: any, existingTags?: string[]): Promise<Array<{
    name: string;
    type: Tag['type'];
    confidence: number;
    source: 'content' | 'similar' | 'trending';
  }>> {
    const suggestions = [];
    
    // Content-based tags
    for (const keyword of analysis.keywords.slice(0, 5)) {
      if (!existingTags?.includes(keyword)) {
        suggestions.push({
          name: keyword,
          type: 'topical' as const,
          confidence: 0.6,
          source: 'content' as const
        });
      }
    }
    
    return suggestions;
  }

  private assessComplexity(analysis: any): 'beginner' | 'intermediate' | 'advanced' {
    if (analysis.complexity < 0.3) return 'beginner';
    if (analysis.complexity < 0.7) return 'intermediate';
    return 'advanced';
  }

  private calculateQualityScore(analysis: any): number {
    return analysis.quality;
  }

  private async detectContentFlags(analysis: any): Promise<Array<{
    type: 'duplicate' | 'low_quality' | 'miscategorized' | 'inappropriate';
    confidence: number;
    reason: string;
  }>> {
    const flags = [];
    
    if (analysis.quality < 0.3) {
      flags.push({
        type: 'low_quality' as const,
        confidence: 0.8,
        reason: 'Content appears to be low quality based on text analysis'
      });
    }
    
    return flags;
  }

  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parentId: row.parent_id,
      depth: row.depth,
      path: row.path,
      icon: row.icon,
      color: row.color,
      children: [],
      stats: {
        templateCount: parseInt(row.template_count) || 0,
        activeCount: parseInt(row.active_count) || 0,
        totalDownloads: parseInt(row.total_downloads) || 0,
        averageRating: parseFloat(row.average_rating) || 0,
        trendingScore: parseFloat(row.trending_score) || 0
  }
      config: {
        featured: row.featured || false,
        visible: row.visible !== false,
        searchable: row.searchable !== false,
        autoClassification: row.auto_classification !== false,
        requireApproval: row.require_approval || false
  }
      metadata: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
        sortOrder: row.sort_order || 0,
        keywords: row.keywords || [],
        aliases: row.aliases || []
      }
    };
  }

  private async getCategoryById(categoryId: string): Promise<Category | null> {

    const query = `
      SELECT * FROM marketplace_categories WHERE id = $1
    `;
    const result = await this.pool.query(query, [categoryId]);
    return result.rows.length > 0 ? this.mapRowToCategory(result.rows[0]) : null;
  }

  private async getTagByName(name: string): Promise<Tag | null> {

    const query = `
      SELECT * FROM marketplace_tags WHERE name = $1
    `;
    const result = await this.pool.query(query, [name]);
    return result.rows.length > 0 ? this.mapRowToTag(result.rows[0]) : null;
  }

  private async createTag(name: string, context?: any): Promise<Tag> {

    const slug = this.slugify(name);
    const type = this.classifyTagType(name, context);
    
    const query = `
      INSERT INTO marketplace_tags (name, slug, type, usage_count, created_at, approved)
      VALUES ($1, $2, $3, 1, NOW(), true)
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [name, slug, type]);
    return this.mapRowToTag(result.rows[0]);
  }

  private async updateTagUsage(tagId: string): Promise<void> {

    await this.pool.query(`
      UPDATE marketplace_tags 
      SET usage_count = usage_count + 1 
      WHERE id = $1
    `, [tagId]);
  }

  private mapRowToTag(row: any): Tag {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      category: row.category,
      usageCount: row.usage_count || 0,
      trendingScore: row.trending_score || 0,
      relatedTags: row.related_tags || [],
      type: row.type || 'topical',
      confidence: row.confidence || 0.5,
      createdAt: row.created_at,
      approved: row.approved !== false,
      suggestedBy: row.suggested_by
    };
  }

  private classifyTagType(name: string, context?: any): Tag['type'] {
    const functionalKeywords = ['api', 'function', 'method', 'tool', 'utility'];
    const technicalKeywords = ['code', 'programming', 'database', 'server'];
    const industryKeywords = ['healthcare', 'finance', 'education', 'retail'];
    
    const lowerName = name.toLowerCase();
    
    if (functionalKeywords.some(keyword => lowerName.includes(keyword))) return 'functional';
    if (technicalKeywords.some(keyword => lowerName.includes(keyword))) return 'technical';
    if (industryKeywords.some(keyword => lowerName.includes(keyword))) return 'industry';
    
    return 'topical';
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private flattenCategoryTree(categories: Category[]): Category[] {
    const result: Category[] = [];
    
    function traverse(cats: Category[]) {
      for (const cat of cats) {
        result.push(cat);
        if (cat.children.length > 0) {
          traverse(cat.children);
        }
      }
    }
    
    traverse(categories);
    return result;
  }

  private async getCategoryGrowthData(categoryId: string, interval: string): Promise<any> {

    // Simplified growth data
    return {
      templates: { current: 50, previous: 45, change: 11.1 },
      downloads: { current: 1200, previous: 1000, change: 20.0 },
      ratings: { current: 4.2, previous: 4.0, change: 5.0 }
    };
  }

  private async getCategoryTopTemplates(categoryId: string, limit: number): Promise<any[]> {

    // Simplified top templates
    return [];
  }

  private async getCategoryEngagementData(categoryId: string, interval: string): Promise<any> {

    // Simplified engagement data
    return {
      viewsPerTemplate: 25.5,
      downloadRate: 0.15,
      ratingParticipation: 0.08
    };
  }

  private async getCategoryTrendsData(categoryId: string, interval: string): Promise<any[]> {

    // Simplified trends data
    return [];
  }

  private async generateCategoryRecommendations(category: Category, growth: any, engagement: any): Promise<any> {

    return {
      optimization: ['Improve category description', 'Add more featured templates'],
      content: ['Need more beginner-level templates', 'Consider adding video tutorials'],
      structure: ['Consider creating subcategories', 'Merge with related categories']
    };
  }

  private async generateOptimizationSuggestions(all: Category[], underutilized: Category[], oversaturated: Category[]): Promise<any[]> {

    return [];
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {

    try {
      await this.redis.quit();
      console.log('CategorizationService destroyed successfully');
    } catch (error) {
      console.error('Error during CategorizationService destruction:', error);
    }
  }
}