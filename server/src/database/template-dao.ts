/**
 * Epic 9.2.6 - Template Data Access Object
 * Database operations for project template functionality
 */

import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import {
  ProjectTemplate,
  CreateProjectTemplate,
  UpdateProjectTemplate,
  TemplateReview,
  CreateTemplateReview,
  UpdateTemplateReview,
  TemplateUsage,
  CreateTemplateUsage,
  UpdateTemplateUsage,
  TemplateCategory,
  TemplateFavorite,
  TemplateDownload,
  ProjectTemplateWithStats,
  TemplateReviewWithAuthor,
  TemplateUsageWithTemplate,
  TemplateFilter,
  TemplateSort,
  TemplateReviewFilter,
  TemplateUsageFilter,
  TemplateAnalytics,
  PaginatedResult,
  PaginationOptions
} from './template-models';

export class TemplateDAO {
  constructor(private db: Database) {}

  // ====== TEMPLATE OPERATIONS ======

  async createTemplate(data: CreateProjectTemplate, userId: string): Promise<ProjectTemplate> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO project_templates (
        id, workspace_id, name, description, template_data, thumbnail_url,
        category, tags, difficulty_level, version, compatibility_version,
        estimated_time_minutes, visibility, is_featured, customizable_fields,
        default_values, validation_rules, created_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.workspace_id || null,
      data.name,
      data.description || null,
      JSON.stringify(data.template_data),
      data.thumbnail_url || null,
      data.category,
      JSON.stringify(data.tags),
      data.difficulty_level,
      data.version,
      data.compatibility_version || null,
      data.estimated_time_minutes || null,
      data.visibility,
      data.is_featured,
      JSON.stringify(data.customizable_fields),
      JSON.stringify(data.default_values),
      JSON.stringify(data.validation_rules),
      userId,
      now,
      now
    );

    return this.getTemplate(id)!;
  }

  async getTemplate(id: string): Promise<ProjectTemplate | null> {
    const stmt = this.db.prepare(`
      SELECT 
        id, workspace_id, name, description, template_data, thumbnail_url,
        category, tags, difficulty_level, version, compatibility_version,
        estimated_time_minutes, visibility, is_featured, usage_count,
        rating_average, rating_count, customizable_fields, default_values,
        validation_rules, created_by, created_at, updated_at, published_at,
        archived_at, deprecated_at, replacement_template_id
      FROM project_templates
      WHERE id = ? AND archived_at IS NULL
    `);

    const row = stmt.get(id) as ProjectTemplate | undefined;
    if (!row) return null;

    return this.mapTemplateRow(row);
  }

  async getTemplateWithStats(id: string, userId?: string): Promise<ProjectTemplateWithStats | null> {
    const stmt = this.db.prepare(`
      SELECT 
        t.id, t.workspace_id, t.name, t.description, t.template_data, t.thumbnail_url,
        t.category, t.tags, t.difficulty_level, t.version, t.compatibility_version,
        t.estimated_time_minutes, t.visibility, t.is_featured, t.usage_count,
        t.rating_average, t.rating_count, t.customizable_fields, t.default_values,
        t.validation_rules, t.created_by, t.created_at, t.updated_at, t.published_at,
        t.archived_at, t.deprecated_at, t.replacement_template_id,
        COUNT(DISTINCT tr.id) as review_count,
        COUNT(DISTINCT tf.id) as favorite_count,
        COUNT(DISTINCT CASE WHEN tu.started_at >= datetime('now', '-30 days') THEN tu.id END) as recent_usage_count,
        CASE WHEN ufd.template_id IS NOT NULL THEN 1 ELSE 0 END as is_favorited,
        ur.rating as user_rating
      FROM project_templates t
      LEFT JOIN template_reviews tr ON t.id = tr.template_id
      LEFT JOIN template_favorites tf ON t.id = tf.template_id
      LEFT JOIN template_usages tu ON t.id = tu.template_id
      LEFT JOIN template_favorites ufd ON t.id = ufd.template_id AND ufd.user_id = ?
      LEFT JOIN template_reviews ur ON t.id = ur.template_id AND ur.user_id = ?
      WHERE t.id = ? AND t.archived_at IS NULL
      GROUP BY t.id
    `);

    const row = stmt.get(userId || '', userId || '', id) as ProjectTemplateWithStats | undefined;
    if (!row) return null;

    const template = this.mapTemplateRow(row);
    return {
      ...template,
      review_count: row.review_count || 0,
      favorite_count: row.favorite_count || 0,
      recent_usage_count: row.recent_usage_count || 0,
      is_favorited: Boolean(row.is_favorited),
      user_rating: row.user_rating || undefined,
      can_edit: template.created_by === userId || template.workspace_id === userId, // Simplified permission check
      can_delete: template.created_by === userId
    };
  }

  async getTemplates(
    filter: TemplateFilter = {},
    sort: TemplateSort = {},
    pagination: PaginationOptions = {},
    userId?: string
  ): Promise<PaginatedResult<ProjectTemplateWithStats>> {
    const { page = 1, limit = 20 } = pagination;
    const { sort_by = 'created_at', sort_order = 'desc' } = sort;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE t.archived_at IS NULL';
    const params: unknown[] = [];

    if (filter.search) {
      whereClause += ' AND (t.name ILIKE ? OR t.description ILIKE ? OR ? = ANY(t.tags))';
      params.push(`%${filter.search}%`, `%${filter.search}%`, filter.search);
    }

    if (filter.category) {
      whereClause += ' AND t.category = ?';
      params.push(filter.category);
    }

    if (filter.tags && filter.tags.length > 0) {
      whereClause += ' AND t.tags && ?';
      params.push(JSON.stringify(filter.tags));
    }

    if (filter.difficulty_level && filter.difficulty_level.length > 0) {
      const placeholders = filter.difficulty_level.map(() => '?').join(',');
      whereClause += ` AND t.difficulty_level IN (${placeholders})`;
      params.push(...filter.difficulty_level);
    }

    if (filter.visibility && filter.visibility.length > 0) {
      const placeholders = filter.visibility.map(() => '?').join(',');
      whereClause += ` AND t.visibility IN (${placeholders})`;
      params.push(...filter.visibility);
    }

    if (filter.min_rating) {
      whereClause += ' AND t.rating_average >= ?';
      params.push(filter.min_rating);
    }

    if (filter.is_featured !== undefined) {
      whereClause += ' AND t.is_featured = ?';
      params.push(filter.is_featured);
    }

    if (filter.created_by) {
      whereClause += ' AND t.created_by = ?';
      params.push(filter.created_by);
    }

    if (filter.workspace_id) {
      whereClause += ' AND t.workspace_id = ?';
      params.push(filter.workspace_id);
    }

    // Build ORDER BY clause
    let orderClause = '';
    switch (sort_by) {
    case 'name':
      orderClause = `ORDER BY t.name ${sort_order.toUpperCase()}`;
      break;
    case 'rating_average':
      orderClause = `ORDER BY t.rating_average ${sort_order.toUpperCase()} NULLS LAST, t.rating_count ${sort_order.toUpperCase()}`;
      break;
    case 'usage_count':
      orderClause = `ORDER BY t.usage_count ${sort_order.toUpperCase()}, t.created_at ${sort_order.toUpperCase()}`;
      break;
    case 'updated_at':
      orderClause = `ORDER BY t.updated_at ${sort_order.toUpperCase()}`;
      break;
    case 'relevance':
      // For search relevance - simplified scoring
      if (filter.search) {
        orderClause = `ORDER BY (
            CASE WHEN t.name ILIKE ? THEN 3 ELSE 0 END +
            CASE WHEN t.description ILIKE ? THEN 2 ELSE 0 END +
            CASE WHEN ? = ANY(t.tags) THEN 4 ELSE 0 END +
            t.rating_average * 0.5 + 
            LOG(t.usage_count + 1) * 0.3
          ) DESC, t.created_at DESC`;
        params.push(`%${filter.search}%`, `%${filter.search}%`, filter.search);
      } else {
        orderClause = `ORDER BY t.created_at ${sort_order.toUpperCase()}`;
      }
      break;
    default:
      orderClause = `ORDER BY t.created_at ${sort_order.toUpperCase()}`;
    }

    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM project_templates t
      ${whereClause}
    `);

    const dataStmt = this.db.prepare(`
      SELECT 
        t.id, t.workspace_id, t.name, t.description, t.template_data, t.thumbnail_url,
        t.category, t.tags, t.difficulty_level, t.version, t.compatibility_version,
        t.estimated_time_minutes, t.visibility, t.is_featured, t.usage_count,
        t.rating_average, t.rating_count, t.customizable_fields, t.default_values,
        t.validation_rules, t.created_by, t.created_at, t.updated_at, t.published_at,
        t.archived_at, t.deprecated_at, t.replacement_template_id,
        COUNT(DISTINCT tr.id) as review_count,
        COUNT(DISTINCT tf.id) as favorite_count,
        COUNT(DISTINCT CASE WHEN tu.started_at >= datetime('now', '-30 days') THEN tu.id END) as recent_usage_count,
        CASE WHEN ufd.template_id IS NOT NULL THEN 1 ELSE 0 END as is_favorited,
        ur.rating as user_rating
      FROM project_templates t
      LEFT JOIN template_reviews tr ON t.id = tr.template_id
      LEFT JOIN template_favorites tf ON t.id = tf.template_id
      LEFT JOIN template_usages tu ON t.id = tu.template_id
      LEFT JOIN template_favorites ufd ON t.id = ufd.template_id AND ufd.user_id = ?
      LEFT JOIN template_reviews ur ON t.id = ur.template_id AND ur.user_id = ?
      ${whereClause}
      GROUP BY t.id
      ${orderClause}
      LIMIT ? OFFSET ?
    `);

    const { total } = countStmt.get(...params) as { total: number };
    const rows = dataStmt.all(userId || '', userId || '', ...params, limit, offset) as ProjectTemplateWithStats[];

    const data: ProjectTemplateWithStats[] = rows.map(row => {
      const template = this.mapTemplateRow(row);
      return {
        ...template,
        review_count: row.review_count || 0,
        favorite_count: row.favorite_count || 0,
        recent_usage_count: row.recent_usage_count || 0,
        is_favorited: Boolean(row.is_favorited),
        user_rating: row.user_rating || undefined,
        can_edit: template.created_by === userId || template.workspace_id === userId,
        can_delete: template.created_by === userId
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1
      }
    };
  }

  async updateTemplate(
    id: string,
    data: UpdateProjectTemplate,
    ___userId: string
  ): Promise<ProjectTemplate | null> {
    const setClause: string[] = [];
    const params: unknown[] = [];

    if (data.name) {
      setClause.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      setClause.push('description = ?');
      params.push(data.description);
    }
    if (data.template_data) {
      setClause.push('template_data = ?');
      params.push(JSON.stringify(data.template_data));
    }
    if (data.thumbnail_url !== undefined) {
      setClause.push('thumbnail_url = ?');
      params.push(data.thumbnail_url);
    }
    if (data.category) {
      setClause.push('category = ?');
      params.push(data.category);
    }
    if (data.tags) {
      setClause.push('tags = ?');
      params.push(JSON.stringify(data.tags));
    }
    if (data.difficulty_level) {
      setClause.push('difficulty_level = ?');
      params.push(data.difficulty_level);
    }
    if (data.version) {
      setClause.push('version = ?');
      params.push(data.version);
    }
    if (data.compatibility_version !== undefined) {
      setClause.push('compatibility_version = ?');
      params.push(data.compatibility_version);
    }
    if (data.estimated_time_minutes !== undefined) {
      setClause.push('estimated_time_minutes = ?');
      params.push(data.estimated_time_minutes);
    }
    if (data.visibility) {
      setClause.push('visibility = ?');
      params.push(data.visibility);
    }
    if (data.is_featured !== undefined) {
      setClause.push('is_featured = ?');
      params.push(data.is_featured);
    }
    if (data.customizable_fields) {
      setClause.push('customizable_fields = ?');
      params.push(JSON.stringify(data.customizable_fields));
    }
    if (data.default_values) {
      setClause.push('default_values = ?');
      params.push(JSON.stringify(data.default_values));
    }
    if (data.validation_rules) {
      setClause.push('validation_rules = ?');
      params.push(JSON.stringify(data.validation_rules));
    }

    if (setClause.length === 0) {
      return this.getTemplate(id);
    }

    setClause.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE project_templates
      SET ${setClause.join(', ')}
      WHERE id = ? AND archived_at IS NULL
    `);

    stmt.run(...params);
    return this.getTemplate(id);
  }

  async archiveTemplate(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE project_templates
      SET archived_at = ?, updated_at = ?
      WHERE id = ? AND archived_at IS NULL
    `);

    const now = new Date().toISOString();
    const result = stmt.run(now, now, id);
    return result.changes > 0;
  }

  async publishTemplate(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE project_templates
      SET published_at = ?, updated_at = ?
      WHERE id = ? AND published_at IS NULL AND archived_at IS NULL
    `);

    const now = new Date().toISOString();
    const result = stmt.run(now, now, id);
    return result.changes > 0;
  }

  // ====== TEMPLATE USAGE OPERATIONS ======

  async createTemplateUsage(data: CreateTemplateUsage, userId: string): Promise<TemplateUsage> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO template_usages (
        id, template_id, user_id, project_id, workspace_id,
        customizations_applied, source, started_at, last_accessed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.template_id,
      userId,
      data.project_id || null,
      data.workspace_id,
      JSON.stringify(data.customizations_applied),
      data.source,
      now,
      now
    );

    return this.getTemplateUsage(id)!;
  }

  async getTemplateUsage(id: string): Promise<TemplateUsage | null> {
    const stmt = this.db.prepare(`
      SELECT 
        id, template_id, user_id, project_id, workspace_id,
        customizations_applied, completion_status, time_to_complete_minutes,
        user_rating, user_feedback, started_at, completed_at, last_accessed_at, source
      FROM template_usages
      WHERE id = ?
    `);

    const row = stmt.get(id) as ProjectTemplate | undefined;
    if (!row) return null;

    return this.mapUsageRow(row);
  }

  async updateTemplateUsage(
    id: string,
    data: UpdateTemplateUsage,
    userId: string
  ): Promise<TemplateUsage | null> {
    const setClause: string[] = [];
    const params: unknown[] = [];

    if (data.customizations_applied) {
      setClause.push('customizations_applied = ?');
      params.push(JSON.stringify(data.customizations_applied));
    }
    if (data.completion_status) {
      setClause.push('completion_status = ?');
      params.push(data.completion_status);
    }
    if (data.time_to_complete_minutes !== undefined) {
      setClause.push('time_to_complete_minutes = ?');
      params.push(data.time_to_complete_minutes);
    }
    if (data.user_rating !== undefined) {
      setClause.push('user_rating = ?');
      params.push(data.user_rating);
    }
    if (data.user_feedback !== undefined) {
      setClause.push('user_feedback = ?');
      params.push(data.user_feedback);
    }
    if (data.completed_at !== undefined) {
      setClause.push('completed_at = ?');
      params.push(data.completed_at ? data.completed_at.toISOString() : null);
    }

    if (setClause.length === 0) {
      return this.getTemplateUsage(id);
    }

    setClause.push('last_accessed_at = ?');
    params.push(new Date().toISOString());
    params.push(id);
    params.push(userId);

    const stmt = this.db.prepare(`
      UPDATE template_usages
      SET ${setClause.join(', ')}
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(...params);
    return this.getTemplateUsage(id);
  }

  // ====== TEMPLATE REVIEWS OPERATIONS ======

  async createTemplateReview(data: CreateTemplateReview, userId: string): Promise<TemplateReview> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO template_reviews (
        id, template_id, user_id, rating, title, review_text, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.template_id,
      userId,
      data.rating,
      data.title || null,
      data.review_text || null,
      now,
      now
    );

    return this.getTemplateReview(id)!;
  }

  async getTemplateReview(id: string): Promise<TemplateReview | null> {
    const stmt = this.db.prepare(`
      SELECT 
        id, template_id, user_id, rating, title, review_text,
        is_verified_purchase, is_helpful_count, created_at, updated_at
      FROM template_reviews
      WHERE id = ?
    `);

    const row = stmt.get(id) as ProjectTemplate | undefined;
    if (!row) return null;

    return this.mapReviewRow(row);
  }

  async getTemplateReviews(
    filter: TemplateReviewFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<TemplateReviewWithAuthor>> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (filter.template_id) {
      whereClause += ' AND tr.template_id = ?';
      params.push(filter.template_id);
    }

    if (filter.user_id) {
      whereClause += ' AND tr.user_id = ?';
      params.push(filter.user_id);
    }

    if (filter.min_rating) {
      whereClause += ' AND tr.rating >= ?';
      params.push(filter.min_rating);
    }

    if (filter.max_rating) {
      whereClause += ' AND tr.rating <= ?';
      params.push(filter.max_rating);
    }

    if (filter.has_text !== undefined) {
      if (filter.has_text) {
        whereClause += ' AND tr.review_text IS NOT NULL AND LENGTH(tr.review_text) > 0';
      } else {
        whereClause += ' AND (tr.review_text IS NULL OR LENGTH(tr.review_text) = 0)';
      }
    }

    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM template_reviews tr
      ${whereClause}
    `);

    const dataStmt = this.db.prepare(`
      SELECT 
        tr.id, tr.template_id, tr.user_id, tr.rating, tr.title, tr.review_text,
        tr.is_verified_purchase, tr.is_helpful_count, tr.created_at, tr.updated_at
      FROM template_reviews tr
      ${whereClause}
      ORDER BY tr.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const { total } = countStmt.get(...params) as { total: number };
    const rows = dataStmt.all(...params, limit, offset) as TemplateReviewWithAuthor[];

    const data: TemplateReviewWithAuthor[] = rows.map(row => ({
      ...this.mapReviewRow(row),
      author_name: `User ${row.user_id}`, // TODO: Get actual user name
      author_avatar: undefined,
      is_author: false // TODO: Check if current user is author
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1
      }
    };
  }

  // ====== TEMPLATE FAVORITES OPERATIONS ======

  async addTemplateFavorite(templateId: string, userId: string, workspaceId?: string): Promise<TemplateFavorite> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO template_favorites (id, template_id, user_id, workspace_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, templateId, userId, workspaceId || null, now);

    return {
      id,
      template_id: templateId,
      user_id: userId,
      workspace_id: workspaceId,
      created_at: new Date(now)
    };
  }

  async removeTemplateFavorite(templateId: string, userId: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM template_favorites
      WHERE template_id = ? AND user_id = ?
    `);

    const result = stmt.run(templateId, userId);
    return result.changes > 0;
  }

  async getUserFavoriteTemplates(
    userId: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ProjectTemplateWithStats>> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM template_favorites tf
      JOIN project_templates t ON tf.template_id = t.id
      WHERE tf.user_id = ? AND t.archived_at IS NULL
    `);

    const dataStmt = this.db.prepare(`
      SELECT 
        t.id, t.workspace_id, t.name, t.description, t.template_data, t.thumbnail_url,
        t.category, t.tags, t.difficulty_level, t.version, t.compatibility_version,
        t.estimated_time_minutes, t.visibility, t.is_featured, t.usage_count,
        t.rating_average, t.rating_count, t.customizable_fields, t.default_values,
        t.validation_rules, t.created_by, t.created_at, t.updated_at, t.published_at,
        t.archived_at, t.deprecated_at, t.replacement_template_id,
        tf.created_at as favorited_at
      FROM template_favorites tf
      JOIN project_templates t ON tf.template_id = t.id
      WHERE tf.user_id = ? AND t.archived_at IS NULL
      ORDER BY tf.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const { total } = countStmt.get(userId) as { total: number };
    const rows = dataStmt.all(userId, limit, offset) as TemplateUsageWithTemplate[];

    const data: ProjectTemplateWithStats[] = rows.map(row => ({
      ...this.mapTemplateRow(row),
      is_favorited: true,
      can_edit: row.created_by === userId,
      can_delete: row.created_by === userId
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1
      }
    };
  }

  // ====== TEMPLATE CATEGORIES OPERATIONS ======

  async getTemplateCategories(): Promise<TemplateCategory[]> {
    const stmt = this.db.prepare(`
      SELECT id, name, description, icon_name, sort_order, is_active, created_at, updated_at
      FROM template_categories
      WHERE is_active = TRUE
      ORDER BY sort_order, name
    `);

    const rows = stmt.all() as TemplateCategory[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon_name: row.icon_name,
      sort_order: row.sort_order,
      is_active: Boolean(row.is_active),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));
  }

  // ====== ANALYTICS AND REPORTING ======

  async getTemplateAnalytics(templateId: string, days = 30): Promise<TemplateAnalytics> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Usage statistics
    const usageStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_usages,
        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed_usages,
        AVG(time_to_complete_minutes) as avg_completion_time,
        source,
        COUNT(*) as source_count,
        DATE(started_at) as usage_date
      FROM template_usages
      WHERE template_id = ? AND started_at >= ?
      GROUP BY source, DATE(started_at)
    `);

    const usageRows = usageStmt.all(templateId, since.toISOString()) as Array<{ date: string; count: number }>;

    // Rating statistics
    const ratingStmt = this.db.prepare(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as review_count,
        rating,
        COUNT(*) as rating_count
      FROM template_reviews
      WHERE template_id = ?
      GROUP BY rating
    `);

    const ratingRows = ratingStmt.all(templateId) as Array<{ rating: number; count: number }>;

    // Process usage data
    const totalUsages = usageRows.reduce((sum, row) => sum + row.source_count, 0);
    const completedUsages = usageRows.reduce((sum, row) => sum + (row.completed_usages || 0), 0);
    const usageBySource: Record<string, number> = {};
    const usageTrend: Array<{ date: string; count: number }> = [];

    usageRows.forEach(row => {
      usageBySource[row.source] = (usageBySource[row.source] || 0) + row.source_count;
      const existingTrend = usageTrend.find(t => t.date === row.usage_date);
      if (existingTrend) {
        existingTrend.count += row.source_count;
      } else {
        usageTrend.push({ date: row.usage_date, count: row.source_count });
      }
    });

    // Process rating data
    const averageRating = ratingRows.length > 0 ? ratingRows[0].average_rating : 0;
    const reviewCount = ratingRows.reduce((sum, row) => sum + row.rating_count, 0);
    const ratingDistribution: Record<number, number> = {};
    ratingRows.forEach(row => {
      ratingDistribution[row.rating] = row.rating_count;
    });

    return {
      usage_stats: {
        total_usages: totalUsages,
        completed_usages: completedUsages,
        completion_rate: totalUsages > 0 ? completedUsages / totalUsages : 0,
        average_completion_time: usageRows.length > 0 ? usageRows[0].avg_completion_time || 0 : 0,
        usage_by_source: usageBySource,
        usage_trend: usageTrend.sort((a, b) => a.date.localeCompare(b.date))
      },
      rating_stats: {
        average_rating: averageRating,
        rating_distribution: ratingDistribution,
        review_count: reviewCount,
        recent_reviews: [] // TODO: Implement recent reviews
      },
      performance_metrics: {
        conversion_rate: 0.85, // TODO: Calculate actual conversion rate
        retention_rate: 0.65, // TODO: Calculate actual retention rate
        recommendation_score: averageRating * 0.4 + (totalUsages / 100) * 0.6 // Simplified scoring
      }
    };
  }

  // ====== UTILITY METHODS ======

  private mapTemplateRow(row: unknown): ProjectTemplate {
    return {
      id: row.id,
      workspace_id: row.workspace_id,
      name: row.name,
      description: row.description,
      template_data: JSON.parse(row.template_data || '{}'),
      thumbnail_url: row.thumbnail_url,
      category: row.category,
      tags: JSON.parse(row.tags || '[]'),
      difficulty_level: row.difficulty_level,
      version: row.version,
      compatibility_version: row.compatibility_version,
      estimated_time_minutes: row.estimated_time_minutes,
      visibility: row.visibility,
      is_featured: Boolean(row.is_featured),
      usage_count: row.usage_count || 0,
      rating_average: row.rating_average,
      rating_count: row.rating_count || 0,
      customizable_fields: JSON.parse(row.customizable_fields || '{}'),
      default_values: JSON.parse(row.default_values || '{}'),
      validation_rules: JSON.parse(row.validation_rules || '{}'),
      created_by: row.created_by,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      published_at: row.published_at ? new Date(row.published_at) : undefined,
      archived_at: row.archived_at ? new Date(row.archived_at) : undefined,
      deprecated_at: row.deprecated_at ? new Date(row.deprecated_at) : undefined,
      replacement_template_id: row.replacement_template_id
    };
  }

  private mapUsageRow(row: unknown): TemplateUsage {
    return {
      id: row.id,
      template_id: row.template_id,
      user_id: row.user_id,
      project_id: row.project_id,
      workspace_id: row.workspace_id,
      customizations_applied: JSON.parse(row.customizations_applied || '{}'),
      completion_status: row.completion_status,
      time_to_complete_minutes: row.time_to_complete_minutes,
      user_rating: row.user_rating,
      user_feedback: row.user_feedback,
      started_at: new Date(row.started_at),
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
      last_accessed_at: new Date(row.last_accessed_at),
      source: row.source
    };
  }

  private mapReviewRow(row: unknown): TemplateReview {
    return {
      id: row.id,
      template_id: row.template_id,
      user_id: row.user_id,
      rating: row.rating,
      title: row.title,
      review_text: row.review_text,
      is_verified_purchase: Boolean(row.is_verified_purchase),
      is_helpful_count: row.is_helpful_count || 0,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }
}