/**
 * Epic 16 Marketplace - Content Curation Service
 * 
 * Advanced curation tools for marketplace content management with AI-assisted
 * quality assessment, automated categorization, and curator workflow management.
 * 
 * Features:
 * - AI-powered content quality assessment
 * - Automated categorization and tagging
 * - Curator assignment and workflow management  
 * - Quality scoring and ranking algorithms
 * - Trending content detection
 * - Curator performance analytics
 * - Community contribution validation
 */

import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

export interface CurationCriteria {
  originality: number;      // 0-1 - How original/unique is the content
  quality: number;          // 0-1 - Overall technical quality
  completeness: number;     // 0-1 - Is the content complete and usable
  documentation: number;    // 0-1 - Quality of documentation/examples
  marketFit: number;        // 0-1 - How well it fits market needs
  safety: number;           // 0-1 - Content safety and appropriateness
}

export interface CurationItem {
  id: string;
  templateId: string;
  submittedBy: string;
  submittedAt: Date;
  
  // Content analysis
  content: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    complexity: 'beginner' | 'intermediate' | 'advanced';
    estimatedUseTime: number; // minutes
  };
  
  // Curation assessment
  aiAssessment: {
    criteria: CurationCriteria;
    overallScore: number;
    confidence: number;
    flags: string[];
    suggestedCategory: string;
    suggestedTags: string[];
    reasoning: string;
  };
  
  // Curator review
  curatorReview?: {
    curatorId: string;
    assignedAt: Date;
    reviewedAt?: Date;
    decision: 'approved' | 'rejected' | 'needs_revision';
    feedback: string;
    qualityScore: number;
    modifications: string[];
    overriddenAI: boolean;
  };
  
  // Status tracking
  status: 'pending_ai' | 'pending_curator' | 'approved' | 'rejected' | 'revision_needed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Analytics
  metrics: {
    communityVotes: { up: number; down: number };
    curatorAgreement: number; // How often curators agree with AI
    appealCount: number;
    revisionCount: number;
  };
}

export interface CuratorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  
  // Specialization
  specializations: string[]; // Categories they're expert in
  languages: string[];
  timezone: string;
  
  // Performance metrics
  performance: {
    totalReviewed: number;
    averageReviewTime: number; // hours
    accuracyScore: number;     // Agreement with community feedback
    throughputScore: number;   // Reviews per week
    qualityScore: number;      // Quality of feedback provided
    overallRating: number;     // Combined performance score
  };
  
  // Workload
  currentLoad: {
    assigned: number;
    completed: number;
    pending: number;
    capacity: number; // Max items per week
  };
  
  // Status
  status: 'active' | 'away' | 'overloaded' | 'inactive';
  availableUntil?: Date;
  lastActive: Date;
}

export interface CurationQueue {
  highPriority: CurationItem[];
  standard: CurationItem[];
  lowPriority: CurationItem[];
  needsRevision: CurationItem[];
  appealed: CurationItem[];
  
  statistics: {
    totalPending: number;
    averageWaitTime: number;
    completionRate: number;
    curatorUtilization: number;
  };
}

export interface QualityTrend {
  period: 'day' | 'week' | 'month';
  timestamp: Date;
  metrics: {
    averageQuality: number;
    submissionCount: number;
    approvalRate: number;
    revisionRate: number;
    topCategories: Array<{ category: string; count: number; quality: number }>;
    curatorEfficiency: number;
  };
}

@Injectable()
export class CurationService {
  private redis: Redis;

  constructor(private pool: Pool) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      keyPrefix: 'curation:'
    });
  }

  /**
   * Submit content for curation
   */
  async submitForCuration(
    templateId: string,
    submittedBy: string,
    metadata?: any
  ): Promise<string> {
    try {
      // Get template content for analysis
      const templateData = await this.getTemplateData(templateId);
      
      // Perform AI assessment
      const aiAssessment = await this.performAIAssessment(templateData);
      
      // Create curation item
      const curationId = `curation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const curationItem: CurationItem = {
        id: curationId,
        templateId,
        submittedBy,
        submittedAt: new Date(),
        content: {
          title: templateData.title,
          description: templateData.description,
          tags: templateData.tags || [],
          category: templateData.category,
          complexity: this.assessComplexity(templateData),
          estimatedUseTime: this.estimateUseTime(templateData)
        },
        aiAssessment,
        status: aiAssessment.overallScore > 0.8 ? 'pending_curator' : 'pending_ai',
        priority: this.calculatePriority(aiAssessment, templateData),
        metrics: {
          communityVotes: { up: 0, down: 0 },
          curatorAgreement: 0,
          appealCount: 0,
          revisionCount: 0
        }
      };

      // Store curation item
      await this.storeCurationItem(curationItem);
      
      // Auto-assign to curator if high quality
      if (curationItem.status === 'pending_curator') {
        await this.assignToCurator(curationId);
      }

      // Update queue statistics
      await this.updateQueueStatistics();

      return curationId;
    } catch (error) {
      console.error('Failed to submit for curation:', error);
      throw error;
    }
  }

  /**
   * Get curation queue for management interface
   */
  async getCurationQueue(options: {
    curatorId?: string;
    category?: string;
    priority?: string;
    status?: string;
    limit?: number;
  } = {}): Promise<CurationQueue> {
    try {
      const { curatorId, category, priority, status, limit = 50 } = options;

      // Build base query
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (curatorId) {
        whereClause += ` AND curator_id = $${paramIndex}`;
        params.push(curatorId);
        paramIndex++;
      }

      if (category) {
        whereClause += ` AND content->>'category' = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (priority) {
        whereClause += ` AND priority = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }

      if (status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      // Get items by priority
      const [highPriorityResult, standardResult, lowPriorityResult, revisionResult, appealedResult, statsResult] = await Promise.all([
        this.pool.query(`
          SELECT * FROM marketplace_curation_queue 
          ${whereClause} AND priority = 'high' AND status IN ('pending_curator', 'pending_ai')
          ORDER BY submitted_at ASC 
          LIMIT $${paramIndex}
        `, [...params, Math.floor(limit / 4)]),
        
        this.pool.query(`
          SELECT * FROM marketplace_curation_queue 
          ${whereClause} AND priority = 'medium' AND status IN ('pending_curator', 'pending_ai')
          ORDER BY submitted_at ASC 
          LIMIT $${paramIndex}
        `, [...params, Math.floor(limit / 2)]),
        
        this.pool.query(`
          SELECT * FROM marketplace_curation_queue 
          ${whereClause} AND priority = 'low' AND status IN ('pending_curator', 'pending_ai')
          ORDER BY submitted_at ASC 
          LIMIT $${paramIndex}
        `, [...params, Math.floor(limit / 4)]),

        this.pool.query(`
          SELECT * FROM marketplace_curation_queue 
          ${whereClause} AND status = 'revision_needed'
          ORDER BY submitted_at ASC 
          LIMIT 20
        `, params),

        this.pool.query(`
          SELECT * FROM marketplace_curation_queue 
          ${whereClause} AND appeal_count > 0
          ORDER BY appeal_count DESC, submitted_at ASC 
          LIMIT 10
        `, params),

        this.getCurationStatistics()
      ]);

      return {
        highPriority: highPriorityResult.rows.map(this.mapRowToCurationItem),
        standard: standardResult.rows.map(this.mapRowToCurationItem),
        lowPriority: lowPriorityResult.rows.map(this.mapRowToCurationItem),
        needsRevision: revisionResult.rows.map(this.mapRowToCurationItem),
        appealed: appealedResult.rows.map(this.mapRowToCurationItem),
        statistics: statsResult
      };
    } catch (error) {
      console.error('Failed to get curation queue:', error);
      throw error;
    }
  }

  /**
   * Assign curation item to curator
   */
  async assignToCurator(curationId: string, curatorId?: string): Promise<void> {
    try {
      // Auto-select curator if not specified
      if (!curatorId) {
        curatorId = await this.selectOptimalCurator(curationId);
      }

      if (!curatorId) {
        throw new Error('No available curator found');
      }

      const query = `
        UPDATE marketplace_curation_queue 
        SET curator_id = $1, assigned_at = NOW(), status = 'pending_curator'
        WHERE id = $2
      `;

      await this.pool.query(query, [curatorId, curationId]);

      // Update curator workload
      await this.updateCuratorWorkload(curatorId, 'assigned');

      // Log assignment
      await this.logCurationAction(curationId, 'assigned', curatorId);
    } catch (error) {
      console.error('Failed to assign to curator:', error);
      throw error;
    }
  }

  /**
   * Complete curator review
   */
  async completeCuratorReview(
    curationId: string,
    curatorId: string,
    decision: 'approved' | 'rejected' | 'needs_revision',
    feedback: string,
    qualityScore: number,
    modifications: string[] = []
  ): Promise<void> {
    try {
      const overriddenAI = await this.checkAIOverride(curationId, decision);

      const review = {
        curatorId,
        assignedAt: new Date(), // Would get from existing record
        reviewedAt: new Date(),
        decision,
        feedback,
        qualityScore,
        modifications,
        overriddenAI
      };

      const query = `
        UPDATE marketplace_curation_queue 
        SET curator_review = $1, status = $2, reviewed_at = NOW()
        WHERE id = $3 AND curator_id = $4
      `;

      await this.pool.query(query, [
        JSON.stringify(review),
        decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'revision_needed',
        curationId,
        curatorId
      ]);

      // Update curator performance
      await this.updateCuratorPerformance(curatorId, decision, qualityScore);

      // Update curator workload
      await this.updateCuratorWorkload(curatorId, 'completed');

      // Log review completion
      await this.logCurationAction(curationId, `review_${decision}`, curatorId);

      // If approved, trigger publication process
      if (decision === 'approved') {
        await this.triggerPublication(curationId);
      }
    } catch (error) {
      console.error('Failed to complete curator review:', error);
      throw error;
    }
  }

  /**
   * Get curator performance analytics
   */
  async getCuratorAnalytics(curatorId: string): Promise<{
    profile: CuratorProfile;
    recentReviews: Array<{
      curationId: string;
      templateTitle: string;
      decision: string;
      reviewTime: number;
      accuracyScore: number;
      timestamp: Date;
    }>;
    trends: {
      weeklyThroughput: number[];
      qualityTrend: number[];
      categoryDistribution: Record<string, number>;
    };
  }> {
    try {
      const [profileResult, reviewsResult, trendsResult] = await Promise.all([
        this.getCuratorProfile(curatorId),
        this.getCuratorRecentReviews(curatorId),
        this.getCuratorTrends(curatorId)
      ]);

      return {
        profile: profileResult,
        recentReviews: reviewsResult,
        trends: trendsResult
      };
    } catch (error) {
      console.error('Failed to get curator analytics:', error);
      throw error;
    }
  }

  /**
   * Get quality trends and insights
   */
  async getQualityTrends(period: 'day' | 'week' | 'month' = 'week'): Promise<QualityTrend[]> {
    try {
      const intervalMap = {
        day: '1 day',
        week: '1 week', 
        month: '1 month'
      };

      const query = `
        SELECT 
          DATE_TRUNC($1, submitted_at) as period_start,
          COUNT(*) as submission_count,
          AVG((ai_assessment->>'overallScore')::float) as avg_quality,
          COUNT(*) FILTER (WHERE status = 'approved')::float / COUNT(*) as approval_rate,
          COUNT(*) FILTER (WHERE status = 'revision_needed')::float / COUNT(*) as revision_rate,
          AVG(EXTRACT(EPOCH FROM (reviewed_at - assigned_at))/3600) as avg_review_hours
        FROM marketplace_curation_queue 
        WHERE submitted_at >= NOW() - INTERVAL '${intervalMap[period]}' * 30
        GROUP BY DATE_TRUNC($1, submitted_at)
        ORDER BY period_start DESC
        LIMIT 30
      `;

      const result = await this.pool.query(query, [period]);

      return result.rows.map(row => ({
        period,
        timestamp: row.period_start,
        metrics: {
          averageQuality: parseFloat(row.avg_quality) || 0,
          submissionCount: parseInt(row.submission_count) || 0,
          approvalRate: parseFloat(row.approval_rate) || 0,
          revisionRate: parseFloat(row.revision_rate) || 0,
          topCategories: [], // Would calculate separately
          curatorEfficiency: row.avg_review_hours ? 24 / parseFloat(row.avg_review_hours) : 0
        }
      }));
    } catch (error) {
      console.error('Failed to get quality trends:', error);
      return [];
    }
  }

  // Private helper methods

  private async performAIAssessment(templateData: any): Promise<CurationItem['aiAssessment']> {
    // Simplified AI assessment - would integrate with actual ML service
    const criteria: CurationCriteria = {
      originality: this.assessOriginality(templateData),
      quality: this.assessQuality(templateData),
      completeness: this.assessCompleteness(templateData),
      documentation: this.assessDocumentation(templateData),
      marketFit: this.assessMarketFit(templateData),
      safety: this.assessSafety(templateData)
    };

    const overallScore = Object.values(criteria).reduce((sum, score) => sum + score, 0) / 6;
    const confidence = this.calculateConfidence(criteria);
    const flags = this.generateFlags(templateData, criteria);

    return {
      criteria,
      overallScore,
      confidence,
      flags,
      suggestedCategory: this.suggestCategory(templateData),
      suggestedTags: this.suggestTags(templateData),
      reasoning: this.generateReasoning(criteria, overallScore)
    };
  }

  private assessOriginality(templateData: any): number {
    // Simplified - would check against existing templates
    const uniqueWords = new Set(templateData.description?.toLowerCase().split(/\s+/) || []);
    return Math.min(uniqueWords.size / 100, 1);
  }

  private assessQuality(templateData: any): number {
    // Check for quality indicators
    let score = 0.5; // Base score
    
    if (templateData.description?.length > 100) score += 0.2;
    if (templateData.tags?.length >= 3) score += 0.1;
    if (templateData.examples?.length > 0) score += 0.2;
    
    return Math.min(score, 1);
  }

  private assessCompleteness(templateData: any): number {
    const requiredFields = ['title', 'description', 'category'];
    const presentFields = requiredFields.filter(field => templateData[field]).length;
    return presentFields / requiredFields.length;
  }

  private assessDocumentation(templateData: any): number {
    let score = 0;
    
    if (templateData.description?.length > 50) score += 0.4;
    if (templateData.examples?.length > 0) score += 0.3;
    if (templateData.usage_notes) score += 0.3;
    
    return Math.min(score, 1);
  }

  private assessMarketFit(templateData: any): number {
    // Simplified market fit assessment
    const popularCategories = ['business', 'creative', 'technical', 'educational'];
    const isPopularCategory = popularCategories.includes(templateData.category?.toLowerCase());
    return isPopularCategory ? 0.8 : 0.6;
  }

  private assessSafety(templateData: any): number {
    // Check for safety issues
    const unsafeTerms = ['harmful', 'dangerous', 'illegal'];
    const content = (templateData.description + ' ' + templateData.title).toLowerCase();
    const hasUnsafeTerms = unsafeTerms.some(term => content.includes(term));
    
    return hasUnsafeTerms ? 0.2 : 1.0;
  }

  private calculateConfidence(criteria: CurationCriteria): number {
    // Higher confidence when scores are consistent
    const scores = Object.values(criteria);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.max(0, 1 - variance);
  }

  private generateFlags(templateData: any, criteria: CurationCriteria): string[] {
    const flags: string[] = [];
    
    if (criteria.safety < 0.5) flags.push('safety_concern');
    if (criteria.quality < 0.4) flags.push('low_quality');
    if (criteria.completeness < 0.8) flags.push('incomplete');
    if (!templateData.description || templateData.description.length < 50) flags.push('poor_description');
    
    return flags;
  }

  private suggestCategory(templateData: any): string {
    // Simplified category suggestion
    const content = (templateData.title + ' ' + templateData.description).toLowerCase();
    
    if (content.includes('business') || content.includes('marketing')) return 'business';
    if (content.includes('creative') || content.includes('art')) return 'creative';
    if (content.includes('technical') || content.includes('code')) return 'technical';
    if (content.includes('education') || content.includes('learning')) return 'educational';
    
    return templateData.category || 'general';
  }

  private suggestTags(templateData: any): string[] {
    // Extract potential tags from content
    const content = (templateData.title + ' ' + templateData.description).toLowerCase();
    const commonTags = ['automation', 'productivity', 'creative', 'business', 'ai', 'writing'];
    
    return commonTags.filter(tag => content.includes(tag));
  }

  private generateReasoning(criteria: CurationCriteria, overallScore: number): string {
    if (overallScore >= 0.8) {
      return 'High-quality submission with strong scores across all criteria. Recommended for fast-track approval.';
    } else if (overallScore >= 0.6) {
      return 'Good quality submission with some areas for improvement. Standard curation process recommended.';
    } else {
      return 'Below-average submission requiring significant improvements before approval.';
    }
  }

  private assessComplexity(templateData: any): 'beginner' | 'intermediate' | 'advanced' {
    const content = (templateData.description || '').toLowerCase();
    
    if (content.includes('advanced') || content.includes('complex')) return 'advanced';
    if (content.includes('intermediate') || content.length > 200) return 'intermediate';
    return 'beginner';
  }

  private estimateUseTime(templateData: any): number {
    // Estimate based on content complexity
    const contentLength = (templateData.description || '').length;
    return Math.max(5, Math.min(contentLength / 20, 60)); // 5-60 minutes
  }

  private calculatePriority(aiAssessment: CurationItem['aiAssessment'], templateData: any): 'low' | 'medium' | 'high' | 'urgent' {
    if (aiAssessment.flags.includes('safety_concern')) return 'urgent';
    if (aiAssessment.overallScore >= 0.8) return 'high';
    if (aiAssessment.overallScore >= 0.6) return 'medium';
    return 'low';
  }

  private async getTemplateData(templateId: string): Promise<any> {
    const query = `
      SELECT title, description, category, tags, metadata
      FROM marketplace_templates 
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [templateId]);
    return result.rows[0] || {};
  }

  private async selectOptimalCurator(curationId: string): Promise<string | null> {
    // Find curator with lowest current load and matching specialization
    const query = `
      SELECT c.id, c.current_load, c.specializations, c.performance_rating
      FROM marketplace_curators c
      WHERE c.status = 'active' 
        AND c.current_load < c.capacity
      ORDER BY c.current_load ASC, c.performance_rating DESC
      LIMIT 1
    `;
    
    const result = await this.pool.query(query);
    return result.rows[0]?.id || null;
  }

  private async storeCurationItem(item: CurationItem): Promise<void> {
    const query = `
      INSERT INTO marketplace_curation_queue (
        id, template_id, submitted_by, submitted_at, content, ai_assessment,
        status, priority, metrics
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.pool.query(query, [
      item.id,
      item.templateId,
      item.submittedBy,
      item.submittedAt,
      JSON.stringify(item.content),
      JSON.stringify(item.aiAssessment),
      item.status,
      item.priority,
      JSON.stringify(item.metrics)
    ]);
  }

  private mapRowToCurationItem(row: any): CurationItem {
    return {
      id: row.id,
      templateId: row.template_id,
      submittedBy: row.submitted_by,
      submittedAt: row.submitted_at,
      content: JSON.parse(row.content),
      aiAssessment: JSON.parse(row.ai_assessment),
      curatorReview: row.curator_review ? JSON.parse(row.curator_review) : undefined,
      status: row.status,
      priority: row.priority,
      metrics: JSON.parse(row.metrics || '{}')
    };
  }

  private async getCuratorProfile(curatorId: string): Promise<CuratorProfile> {
    // Implementation would fetch from curator profiles table
    return {} as CuratorProfile;
  }

  private async getCuratorRecentReviews(curatorId: string): Promise<any[]> {
    // Implementation would fetch recent reviews
    return [];
  }

  private async getCuratorTrends(curatorId: string): Promise<any> {
    // Implementation would calculate trends
    return { weeklyThroughput: [], qualityTrend: [], categoryDistribution: {} };
  }

  private async getCurationStatistics(): Promise<CurationQueue['statistics']> {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('pending_curator', 'pending_ai')) as total_pending,
        AVG(EXTRACT(EPOCH FROM (NOW() - submitted_at))/3600) as avg_wait_hours,
        COUNT(*) FILTER (WHERE status = 'approved')::float / NULLIF(COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')), 0) as completion_rate
      FROM marketplace_curation_queue
      WHERE submitted_at >= NOW() - INTERVAL '7 days'
    `;

    const result = await this.pool.query(query);
    const row = result.rows[0];

    return {
      totalPending: parseInt(row.total_pending) || 0,
      averageWaitTime: parseFloat(row.avg_wait_hours) || 0,
      completionRate: parseFloat(row.completion_rate) || 0,
      curatorUtilization: 0.75 // Would calculate from curator workload
    };
  }

  private async updateQueueStatistics(): Promise<void> {
    // Update cached queue statistics
    const stats = await this.getCurationStatistics();
    await this.redis.setex('queue_stats', 300, JSON.stringify(stats));
  }

  private async updateCuratorWorkload(curatorId: string, action: 'assigned' | 'completed'): Promise<void> {
    const increment = action === 'assigned' ? 1 : -1;
    const query = `
      UPDATE marketplace_curators 
      SET current_load = current_load + $1
      WHERE id = $2
    `;
    await this.pool.query(query, [increment, curatorId]);
  }

  private async updateCuratorPerformance(curatorId: string, decision: string, qualityScore: number): Promise<void> {
    // Implementation would update curator performance metrics
  }

  private async logCurationAction(curationId: string, action: string, userId: string): Promise<void> {
    const query = `
      INSERT INTO marketplace_curation_log (curation_id, action, user_id, timestamp)
      VALUES ($1, $2, $3, NOW())
    `;
    await this.pool.query(query, [curationId, action, userId]);
  }

  private async checkAIOverride(curationId: string, decision: string): Promise<boolean> {
    // Check if curator decision differs from AI recommendation
    const query = `
      SELECT ai_assessment->>'overallScore' as ai_score
      FROM marketplace_curation_queue 
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [curationId]);
    const aiScore = parseFloat(result.rows[0]?.ai_score || '0');
    
    const aiRecommendation = aiScore > 0.7 ? 'approved' : 'rejected';
    return decision !== aiRecommendation;
  }

  private async triggerPublication(curationId: string): Promise<void> {
    // Implementation would trigger template publication workflow
    console.log(`Triggering publication for curation item: ${curationId}`);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    try {
      await this.redis.quit();
      console.log('CurationService destroyed successfully');
    } catch (error) {
      console.error('Error during CurationService destruction:', error);
    }
  }
}