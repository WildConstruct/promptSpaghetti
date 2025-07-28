// Epic 16 Story 16.4 - Knowledge Base & Learning Resources Service
// Comprehensive knowledge base system with articles, tutorials, case studies, and community contributions

import { Pool, PoolClient } from 'pg';

}
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  category: string;
  tags: string[];
  author_id: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
    creator_tier: string;
    verification_status: string;
}
  };
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time: number; // minutes
  views_count: number;
  likes_count: number;
  helpful_count: number;
  is_featured: boolean;
  is_community_contributed: boolean;
  last_updated_at: string;
  created_at: string;
  related_articles?: string[];
  attachments?: Array<{
    type: 'image' | 'video' | 'document' | 'template';
    url: string;
    title: string;
    description?: string;
  }>;
}

}
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  author_id: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
}
  };
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration: number; // minutes
  steps: TutorialStep[];
  prerequisites?: string[];
  learning_objectives: string[];
  completion_count: number;
  rating: number;
  review_count: number;
  is_interactive: boolean;
  created_at: string;
  updated_at: string;
}

}
export interface TutorialStep {
  id: string;
  order: number;
  title: string;
  content: string;
  step_type: 'instruction' | 'example' | 'exercise' | 'quiz' | 'checkpoint';
  media?: Array<{
    type: 'image' | 'video' | 'code' | 'template';
    url: string;
    caption?: string;
}
  }>;
  interactive_elements?: Array<{
    type: 'quiz' | 'code_editor' | 'template_builder';
    config: any;
  }>;
  estimated_duration: number;
}

}
export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  author_id: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
    company?: string;
    role?: string;
}
  };
  industry: string;
  use_case: string;
  challenge: string;
  solution: string;
  results: string;
  metrics?: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
  templates_used?: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  screenshots?: string[];
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

}
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration: number; // total minutes
  steps: Array<{
    id: string;
    type: 'article' | 'tutorial' | 'case_study';
    resource_id: string;
    order: number;
    is_required: boolean;
}
  }>;
  prerequisites?: string[];
  learning_objectives: string[];
  completion_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

}
export interface CreateArticleRequest {
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time?: number;
  related_articles?: string[];
  attachments?: Array<{
    type: 'image' | 'video' | 'document' | 'template';
    url: string;
    title: string;
    description?: string;
}
  }>;
}

}
export interface CreateTutorialRequest {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration: number;
  steps: Omit<TutorialStep, 'id'>[];
  prerequisites?: string[];
  learning_objectives: string[];
  is_interactive?: boolean;
}
}

}
export interface CreateCaseStudyRequest {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  industry: string;
  use_case: string;
  challenge: string;
  solution: string;
  results: string;
  metrics?: Array<{
    label: string;
    value: string;
    description?: string;
}
  }>;
  templates_used?: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  screenshots?: string[];
}

}
export interface SearchFilters {
  category?: string;
  difficulty_level?: string;
  content_type?: 'article' | 'tutorial' | 'case_study' | 'learning_path';
  tags?: string[];
  author_id?: string;
  is_featured?: boolean;
  is_community_contributed?: boolean;
}
}

export class KnowledgeBaseService {
  constructor(private db: Pool) {}

  // Article management
  async createArticle(authorId: string, articleData: CreateArticleRequest): Promise<KnowledgeArticle> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Generate slug from title
      const slug = this.generateSlug(articleData.title);

      // Insert article
      const articleResult = await client.query(`
        INSERT INTO knowledge_articles (
          title, content, summary, slug, category, tags, author_id,
          difficulty_level, estimated_read_time, related_articles, attachments
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at, last_updated_at
      `, [
        articleData.title,
        articleData.content,
        articleData.summary,
        slug,
        articleData.category,
        articleData.tags ? JSON.stringify(articleData.tags) : null,
        authorId,
        articleData.difficulty_level,
        articleData.estimated_read_time || this.estimateReadTime(articleData.content),
        articleData.related_articles ? JSON.stringify(articleData.related_articles) : null,
        articleData.attachments ? JSON.stringify(articleData.attachments) : null
      ]);

      const articleId = articleResult.rows[0].id;

      // Get full article with author details
      const article = await this.getArticleById(articleId);

      await client.query('COMMIT');
      return article;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getArticles(filters: SearchFilters = {}, limit = 20, offset = 0): Promise<KnowledgeArticle[]> {

    let query = `
      SELECT 
        a.id, a.title, a.content, a.summary, a.slug, a.category, a.tags,
        a.difficulty_level, a.estimated_read_time, a.views_count, a.likes_count, a.helpful_count,
        a.is_featured, a.is_community_contributed, a.last_updated_at, a.created_at,
        a.related_articles, a.attachments,
        u.id as author_id, u.display_name, u.avatar_url, u.creator_tier, u.verification_status
      FROM knowledge_articles a
      JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters.category) {
      query += ` AND a.category = $${params.length + 1}`;
      params.push(filters.category);
    }

    if (filters.difficulty_level) {
      query += ` AND a.difficulty_level = $${params.length + 1}`;
      params.push(filters.difficulty_level);
    }

    if (filters.is_featured !== undefined) {
      query += ` AND a.is_featured = $${params.length + 1}`;
      params.push(filters.is_featured);
    }

    if (filters.is_community_contributed !== undefined) {
      query += ` AND a.is_community_contributed = $${params.length + 1}`;
      params.push(filters.is_community_contributed);
    }

    if (filters.author_id) {
      query += ` AND a.author_id = $${params.length + 1}`;
      params.push(filters.author_id);
    }

    if (filters.tags && filters.tags.length > 0) {
      query += ` AND a.tags ?| $${params.length + 1}`;
      params.push(filters.tags);
    }

    query += ` ORDER BY a.is_featured DESC, a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);
    return result.rows.map(this.mapRowToArticle);
  }

  async searchArticles(searchTerm: string, filters: SearchFilters = {}, limit = 20): Promise<KnowledgeArticle[]> {

    let query = `
      SELECT 
        a.id, a.title, a.content, a.summary, a.slug, a.category, a.tags,
        a.difficulty_level, a.estimated_read_time, a.views_count, a.likes_count, a.helpful_count,
        a.is_featured, a.is_community_contributed, a.last_updated_at, a.created_at,
        a.related_articles, a.attachments,
        u.id as author_id, u.display_name, u.avatar_url, u.creator_tier, u.verification_status,
        ts_rank(
          to_tsvector('english',
          a.title || ' ' || a.content || ' ' || COALESCE(a.summary,
          ''
        )), plainto_tsquery('english', $1)) as rank
      FROM knowledge_articles a
      JOIN users u ON a.author_id = u.id
      WHERE to_tsvector(
        'english',
        a.title || ' ' || a.content || ' ' || COALESCE(a.summary,
        ''
      )) @@ plainto_tsquery('english', $1)
    `;

    const params: any[] = [searchTerm];

    if (filters.category) {
      query += ` AND a.category = $${params.length + 1}`;
      params.push(filters.category);
    }

    if (filters.difficulty_level) {
      query += ` AND a.difficulty_level = $${params.length + 1}`;
      params.push(filters.difficulty_level);
    }

    query += ` ORDER BY rank DESC, a.is_featured DESC, a.views_count DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await this.db.query(query, params);
    return result.rows.map(this.mapRowToArticle);
  }

  // Tutorial management
  async createTutorial(authorId: string, tutorialData: CreateTutorialRequest): Promise<Tutorial> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const slug = this.generateSlug(tutorialData.title);

      const tutorialResult = await client.query(`
        INSERT INTO knowledge_tutorials (
          title, description, slug, category, tags, author_id,
          difficulty_level, estimated_duration, prerequisites, learning_objectives, is_interactive
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at, updated_at
      `, [
        tutorialData.title,
        tutorialData.description,
        slug,
        tutorialData.category,
        tutorialData.tags ? JSON.stringify(tutorialData.tags) : null,
        authorId,
        tutorialData.difficulty_level,
        tutorialData.estimated_duration,
        tutorialData.prerequisites ? JSON.stringify(tutorialData.prerequisites) : null,
        JSON.stringify(tutorialData.learning_objectives),
        tutorialData.is_interactive || false
      ]);

      const tutorialId = tutorialResult.rows[0].id;

      // Insert tutorial steps
      for (let i = 0; i < tutorialData.steps.length; i++) {
        const step = tutorialData.steps[i];
        await client.query(`
          INSERT INTO tutorial_steps (
            tutorial_id, order_number, title, content, step_type, media, interactive_elements, estimated_duration
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          tutorialId,
          step.order,
          step.title,
          step.content,
          step.step_type,
          step.media ? JSON.stringify(step.media) : null,
          step.interactive_elements ? JSON.stringify(step.interactive_elements) : null,
          step.estimated_duration
        ]);
      }

      const tutorial = await this.getTutorialById(tutorialId);

      await client.query('COMMIT');
      return tutorial;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTutorials(filters: SearchFilters = {}, limit = 20, offset = 0): Promise<Tutorial[]> {

    let query = `
      SELECT 
        t.id, t.title, t.description, t.slug, t.category, t.tags,
        t.difficulty_level, t.estimated_duration, t.prerequisites, t.learning_objectives,
        t.completion_count, t.rating, t.review_count, t.is_interactive, t.created_at, t.updated_at,
        u.id as author_id, u.display_name, u.avatar_url
      FROM knowledge_tutorials t
      JOIN users u ON t.author_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters.category) {
      query += ` AND t.category = $${params.length + 1}`;
      params.push(filters.category);
    }

    if (filters.difficulty_level) {
      query += ` AND t.difficulty_level = $${params.length + 1}`;
      params.push(filters.difficulty_level);
    }

    query += ` ORDER BY t.rating DESC, t.completion_count DESC, t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);
    
    // Get steps for each tutorial
    const tutorials = await Promise.all(result.rows.map(async (row) => {
      const steps = await this.getTutorialSteps(row.id);
      return this.mapRowToTutorial(row, steps);
    }));

    return tutorials;
  }

  // Case study management
  async createCaseStudy(authorId: string, caseStudyData: CreateCaseStudyRequest): Promise<CaseStudy> {

    const slug = this.generateSlug(caseStudyData.title);

    const result = await this.db.query(`
      INSERT INTO knowledge_case_studies (
        title, description, slug, category, tags, author_id, industry, use_case,
        challenge, solution, results, metrics, templates_used, screenshots
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, created_at, updated_at
    `, [
      caseStudyData.title,
      caseStudyData.description,
      slug,
      caseStudyData.category,
      caseStudyData.tags ? JSON.stringify(caseStudyData.tags) : null,
      authorId,
      caseStudyData.industry,
      caseStudyData.use_case,
      caseStudyData.challenge,
      caseStudyData.solution,
      caseStudyData.results,
      caseStudyData.metrics ? JSON.stringify(caseStudyData.metrics) : null,
      caseStudyData.templates_used ? JSON.stringify(caseStudyData.templates_used) : null,
      caseStudyData.screenshots ? JSON.stringify(caseStudyData.screenshots) : null
    ]);

    const caseStudyId = result.rows[0].id;
    return this.getCaseStudyById(caseStudyId);
  }

  async getCaseStudies(filters: SearchFilters = {}, limit = 20, offset = 0): Promise<CaseStudy[]> {

    let query = `
      SELECT 
        cs.id, cs.title, cs.description, cs.slug, cs.category, cs.tags,
        cs.industry, cs.use_case, cs.challenge, cs.solution, cs.results,
        cs.metrics, cs.templates_used, cs.screenshots, cs.views_count, cs.likes_count,
        cs.is_featured, cs.created_at, cs.updated_at,
        u.id as author_id, u.display_name, u.avatar_url
      FROM knowledge_case_studies cs
      JOIN users u ON cs.author_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters.category) {
      query += ` AND cs.category = $${params.length + 1}`;
      params.push(filters.category);
    }

    if (filters.is_featured !== undefined) {
      query += ` AND cs.is_featured = $${params.length + 1}`;
      params.push(filters.is_featured);
    }

    query += ` ORDER BY cs.is_featured DESC, cs.views_count DESC, cs.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);
    return result.rows.map(this.mapRowToCaseStudy);
  }

  // Analytics and engagement
  async recordView(
    contentType: 'article' | 'tutorial' | 'case_study',
    contentId: string,
    userId?: string
  ): Promise<void> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Record view
      await client.query(`
        INSERT INTO knowledge_views (content_type, content_id, user_id)
        VALUES ($1, $2, $3)
      `, [contentType, contentId, userId]);

      // Update view count
      const table = this.getTableName(contentType);
      await client.query(`
        UPDATE ${table} SET views_count = views_count + 1 WHERE id = $1
      `, [contentId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rateContent(
    contentType: 'article' | 'tutorial' | 'case_study',
    contentId: string,
    userId: string,
    helpful: boolean
  ): Promise<void> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Upsert rating
      await client.query(`
        INSERT INTO knowledge_ratings (content_type, content_id, user_id, is_helpful)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (content_type, content_id, user_id)
        DO UPDATE SET is_helpful = $4, updated_at = NOW()
      `, [contentType, contentId, userId, helpful]);

      // Update helpful count
      const table = this.getTableName(contentType);
      const countResult = await client.query(`
        SELECT COUNT(*) as helpful_count FROM knowledge_ratings
        WHERE content_type = $1 AND content_id = $2 AND is_helpful = true
      `, [contentType, contentId]);

      await client.query(`
        UPDATE ${table} SET helpful_count = $1 WHERE id = $2
      `, [countResult.rows[0].helpful_count, contentId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Helper methods
  private async getArticleById(articleId: string): Promise<KnowledgeArticle> {

    const result = await this.db.query(`
      SELECT 
        a.id, a.title, a.content, a.summary, a.slug, a.category, a.tags,
        a.difficulty_level, a.estimated_read_time, a.views_count, a.likes_count, a.helpful_count,
        a.is_featured, a.is_community_contributed, a.last_updated_at, a.created_at,
        a.related_articles, a.attachments,
        u.id as author_id, u.display_name, u.avatar_url, u.creator_tier, u.verification_status
      FROM knowledge_articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = $1
    `, [articleId]);

    return this.mapRowToArticle(result.rows[0]);
  }

  private async getTutorialById(tutorialId: string): Promise<Tutorial> {

    const result = await this.db.query(`
      SELECT 
        t.id, t.title, t.description, t.slug, t.category, t.tags,
        t.difficulty_level, t.estimated_duration, t.prerequisites, t.learning_objectives,
        t.completion_count, t.rating, t.review_count, t.is_interactive, t.created_at, t.updated_at,
        u.id as author_id, u.display_name, u.avatar_url
      FROM knowledge_tutorials t
      JOIN users u ON t.author_id = u.id
      WHERE t.id = $1
    `, [tutorialId]);

    const steps = await this.getTutorialSteps(tutorialId);
    return this.mapRowToTutorial(result.rows[0], steps);
  }

  private async getCaseStudyById(caseStudyId: string): Promise<CaseStudy> {

    const result = await this.db.query(`
      SELECT 
        cs.id, cs.title, cs.description, cs.slug, cs.category, cs.tags,
        cs.industry, cs.use_case, cs.challenge, cs.solution, cs.results,
        cs.metrics, cs.templates_used, cs.screenshots, cs.views_count, cs.likes_count,
        cs.is_featured, cs.created_at, cs.updated_at,
        u.id as author_id, u.display_name, u.avatar_url
      FROM knowledge_case_studies cs
      JOIN users u ON cs.author_id = u.id
      WHERE cs.id = $1
    `, [caseStudyId]);

    return this.mapRowToCaseStudy(result.rows[0]);
  }

  private async getTutorialSteps(tutorialId: string): Promise<TutorialStep[]> {

    const result = await this.db.query(`
      SELECT id, order_number, title, content, step_type, media, interactive_elements, estimated_duration
      FROM tutorial_steps
      WHERE tutorial_id = $1
      ORDER BY order_number
    `, [tutorialId]);

    return result.rows.map(row => ({
      id: row.id,
      order: row.order_number,
      title: row.title,
      content: row.content,
      step_type: row.step_type,
      media: row.media ? JSON.parse(row.media) : undefined,
      interactive_elements: row.interactive_elements ? JSON.parse(row.interactive_elements) : undefined,
      estimated_duration: row.estimated_duration
    }));
  }

  private mapRowToArticle(row: any): KnowledgeArticle {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      summary: row.summary,
      slug: row.slug,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      author_id: row.author_id,
      author: {
        id: row.author_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        creator_tier: row.creator_tier,
        verification_status: row.verification_status
  }
      difficulty_level: row.difficulty_level,
      estimated_read_time: row.estimated_read_time,
      views_count: row.views_count,
      likes_count: row.likes_count,
      helpful_count: row.helpful_count,
      is_featured: row.is_featured,
      is_community_contributed: row.is_community_contributed,
      last_updated_at: row.last_updated_at,
      created_at: row.created_at,
      related_articles: row.related_articles ? JSON.parse(row.related_articles) : undefined,
      attachments: row.attachments ? JSON.parse(row.attachments) : undefined
    };
  }

  private mapRowToTutorial(row: any, steps: TutorialStep[]): Tutorial {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      slug: row.slug,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      author_id: row.author_id,
      author: {
        id: row.author_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url
  }
      difficulty_level: row.difficulty_level,
      estimated_duration: row.estimated_duration,
      steps,
      prerequisites: row.prerequisites ? JSON.parse(row.prerequisites) : undefined,
      learning_objectives: JSON.parse(row.learning_objectives),
      completion_count: row.completion_count,
      rating: row.rating,
      review_count: row.review_count,
      is_interactive: row.is_interactive,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapRowToCaseStudy(row: any): CaseStudy {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      slug: row.slug,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      author_id: row.author_id,
      author: {
        id: row.author_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url
  }
      industry: row.industry,
      use_case: row.use_case,
      challenge: row.challenge,
      solution: row.solution,
      results: row.results,
      metrics: row.metrics ? JSON.parse(row.metrics) : undefined,
      templates_used: row.templates_used ? JSON.parse(row.templates_used) : undefined,
      screenshots: row.screenshots ? JSON.parse(row.screenshots) : undefined,
      views_count: row.views_count,
      likes_count: row.likes_count,
      is_featured: row.is_featured,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')  
      .trim();
  }

  private estimateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private getTableName(contentType: 'article' | 'tutorial' | 'case_study'): string {
    switch (contentType) {
      case 'article': return 'knowledge_articles';
      case 'tutorial': return 'knowledge_tutorials';
      case 'case_study': return 'knowledge_case_studies';
      default: throw new Error(`Unknown content type: ${contentType}`);
    }
  }
}