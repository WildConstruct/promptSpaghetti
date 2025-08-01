/**
 * Content Management Service
 * Epic 17.2 - Content Management System
 * Task: E17-1753114397045-B8F2A1
 * 
 * Comprehensive content management system for backstage admin controls.
 * Handles templates, documentation, user content, and system content.
 */

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';

// Content Types
export type ContentType = 'template' | 'documentation' | 'user_content' | 'system_content' | 'announcement' | 'tutorial';
export type ContentStatus = 'draft' | 'published' | 'archived' | 'under_review' | 'rejected' | 'featured';
export type ContentVisibility = 'public' | 'private' | 'organization' | 'admin_only';



export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  content: any; // JSONB content data
  metadata: {
    tags: string[];
    category: string;
    version: number;
    author: string;
    authorId: string;
    lastEditor?: string;
    lastEditorId?: string;
    featured: boolean;
    priority: number;
    expiresAt?: string;
    publishedAt?: string;
    customFields: Record<string, any>;



  };
  organizationId?: string;
  parentId?: string; // For content hierarchies
  createdAt: string;
  updatedAt: string;




export interface ContentFilter {
  type?: ContentType;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  author?: string;
  organizationId?: string;
  tags?: string[];
  category?: string;
  featured?: boolean;
  search?: string;
  dateRange?: {
    start: string;
    end: string;



  };




export interface ContentCreateRequest {
  title: string;
  description?: string;
  type: ContentType;
  visibility: ContentVisibility;
  content: any;
  metadata: {
    tags: string[];
    category: string;
    featured?: boolean;
    priority?: number;
    expiresAt?: string;
    customFields?: Record<string, any>;



  };
  organizationId?: string;
  parentId?: string;
  publishImmediately?: boolean;




export interface ContentUpdateRequest {
  title?: string;
  description?: string;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  content?: any;
  metadata?: {
    tags?: string[];
    category?: string;
    featured?: boolean;
    priority?: number;
    expiresAt?: string;
    customFields?: Record<string, any>;



  };
  publishImmediately?: boolean;




export interface ContentStatistics {
  totalItems: number;
  byType: Record<ContentType, number>;
  byStatus: Record<ContentStatus, number>;
  byVisibility: Record<ContentVisibility, number>;
  featuredCount: number;
  recentActivity: {
    created24h: number;
    updated24h: number;
    published24h: number;



  };
  topCategories: Array<{
    category: string;
    count: number;
>;
  topAuthors: Array<{
    authorId: string;
    authorName: string;
    count: number;
>;




export interface ContentRevision {
  id: string;
  contentId: string;
  version: number;
  title: string;
  description?: string;
  content: any;
  metadata: any;
  author: string;
  authorId: string;
  createdAt: string;
  comment?: string;





export class ContentManagementService {};

      const insertParams = [
        contentId,
        request.title,
        request.description,
        request.type,
        initialStatus,
        request.visibility,
        JSON.stringify(request.content),
        JSON.stringify(metadata),
        request.organizationId,
        request.parentId
      ];

      const result = await client.query(insertQuery, insertParams);
      const contentItem = this.mapContentItem(result.rows[0]);

      // Create initial revision
      await this.createContentRevision(contentId, contentItem, userId, 'Initial creation');

      // Log audit event
      await this.auditService.logEvent({
        userId,
        action: 'content_created',
        resourceType: 'content',
        resourceId: contentId,
        details: {
          title: request.title,
          type: request.type,
          status: initialStatus,
          visibility: request.visibility

        severity: 'info'
      });

      await client.query('COMMIT');
      return contentItem;
 catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating content:', error);
      throw new Error('Failed to create content item');
 finally {
      client.release();



  // Update existing content item
  async updateContent(
    contentId: string, 
    request: ContentUpdateRequest, 
    userId: string, 
    userRole: string
  ): Promise<ContentItem> {

    const client = await this.database.getClient();
    
    try {
      await client.query('BEGIN');

      // Get existing content
      const existingContent = await this.getContentById(contentId);
      if (!existingContent) {
        throw new Error('Content item not found');


      // Validate permissions
      await this.validateContentPermissions(userId, userRole, 'update', existingContent.type, existingContent);

      const updateFields: string[] = [];
      const updateParams: any[] = [];
      let paramIndex = 1;

      // Build dynamic update query
      if (request.title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        updateParams.push(request.title);


      if (request.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateParams.push(request.description);


      if (request.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateParams.push(request.status);


      if (request.visibility !== undefined) {
        updateFields.push(`visibility = $${paramIndex++}`);
        updateParams.push(request.visibility);


      if (request.content !== undefined) {
        updateFields.push(`content = $${paramIndex++}`);
        updateParams.push(JSON.stringify(request.content));


      if (request.metadata !== undefined) {
        const updatedMetadata = {
          ...existingContent.metadata,
          ...request.metadata,
          version: existingContent.metadata.version + 1,
          lastEditor: await this.getUserName(userId),
          lastEditorId: userId
        };

        if (request.publishImmediately && existingContent.status !== 'published') {
          updatedMetadata.publishedAt = new Date().toISOString();


        updateFields.push(`metadata = $${paramIndex++}`);
        updateParams.push(JSON.stringify(updatedMetadata));


      if (updateFields.length === 0) {
        return existingContent;


      updateFields.push(`updated_at = NOW()`);
      updateParams.push(contentId);

      const updateQuery = `
        UPDATE content_items 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateParams);
      const updatedContent = this.mapContentItem(result.rows[0]);

      // Create revision
      await this.createContentRevision(contentId, updatedContent, userId, 'Content updated');

      // Log audit event
      await this.auditService.logEvent({
        userId,
        action: 'content_updated',
        resourceType: 'content',
        resourceId: contentId,
        details: {
          title: updatedContent.title,
          type: updatedContent.type,
          status: updatedContent.status,
          changes: Object.keys(request)

        severity: 'info'
      });

      await client.query('COMMIT');
      return updatedContent;
 catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating content:', error);
      throw new Error('Failed to update content item');
 finally {
      client.release();



  // Get content by ID
  async getContentById(contentId: string): Promise<ContentItem | null> {

    try {
      const query = 'SELECT * FROM content_items WHERE id = $1';
      const result = await this.database.query(query, [contentId]);
      
      if (result.rows.length === 0) {
        return null;


      return this.mapContentItem(result.rows[0]);
 catch (error) {
      console.error('Error getting content by ID:', error);
      throw new Error('Failed to retrieve content item');



  // Search and filter content
  async searchContent(
    filter: ContentFilter,
    userId: string,
    userRole: string,
    limit = 50,
    offset = 0
  ): Promise<{ items: ContentItem[]; totalCount: number }> {

    try {
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Apply visibility filters based on user role
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        whereConditions.push(`(visibility = 'public' OR (visibility = 'organization' AND organization_id = $${paramIndex++}))`);
        queryParams.push(await this.getUserOrganizationId(userId));


      // Apply filters
      if (filter.type) {
        whereConditions.push(`type = $${paramIndex++}`);
        queryParams.push(filter.type);


      if (filter.status) {
        whereConditions.push(`status = $${paramIndex++}`);
        queryParams.push(filter.status);


      if (filter.visibility) {
        whereConditions.push(`visibility = $${paramIndex++}`);
        queryParams.push(filter.visibility);


      if (filter.author) {
        whereConditions.push(`metadata->>'authorId' = $${paramIndex++}`);
        queryParams.push(filter.author);


      if (filter.organizationId) {
        whereConditions.push(`organization_id = $${paramIndex++}`);
        queryParams.push(filter.organizationId);


      if (filter.category) {
        whereConditions.push(`metadata->>'category' = $${paramIndex++}`);
        queryParams.push(filter.category);


      if (filter.featured !== undefined) {
        whereConditions.push(`(metadata->>'featured')::boolean = $${paramIndex++}`);
        queryParams.push(filter.featured);


      if (filter.tags && filter.tags.length > 0) {
        whereConditions.push(`metadata->'tags' ?| $${paramIndex++}`);
        queryParams.push(filter.tags);


      if (filter.search) {
        whereConditions.push(`(
          title ILIKE $${paramIndex} OR 
          description ILIKE $${paramIndex} OR
          content::text ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${filter.search}%`);
        paramIndex++;


      if (filter.dateRange) {
        whereConditions.push(`created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`);
        queryParams.push(filter.dateRange.start, filter.dateRange.end);


      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count query
      const countQuery = `SELECT COUNT(*) as total FROM content_items ${whereClause}`;
      const countResult = await this.database.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Data query
      const dataQuery = `
        SELECT * FROM content_items 
        ${whereClause}
        ORDER BY 
          (metadata->>'featured')::boolean DESC,
          (metadata->>'priority')::integer DESC,
          updated_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      queryParams.push(limit, offset);
      const dataResult = await this.database.query(dataQuery, queryParams);

      const items = dataResult.rows.map(row => this.mapContentItem(row));

      return { items, totalCount };
 catch (error) {
      console.error('Error searching content:', error);
      throw new Error('Failed to search content items');



  // Delete content item
  async deleteContent(contentId: string, userId: string, userRole: string): Promise<void> {

    const client = await this.database.getClient();
    
    try {
      await client.query('BEGIN');

      // Get existing content
      const existingContent = await this.getContentById(contentId);
      if (!existingContent) {
        throw new Error('Content item not found');


      // Validate permissions
      await this.validateContentPermissions(userId, userRole, 'delete', existingContent.type, existingContent);

      // Soft delete by updating status to archived
      const updateQuery = `
        UPDATE content_items 
        SET status = 'archived', updated_at = NOW()
        WHERE id = $1
      `;

      await client.query(updateQuery, [contentId]);

      // Log audit event
      await this.auditService.logEvent({
        userId,
        action: 'content_deleted',
        resourceType: 'content',
        resourceId: contentId,
        details: {
          title: existingContent.title,
          type: existingContent.type

        severity: 'warning'
      });

      await client.query('COMMIT');
 catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting content:', error);
      throw new Error('Failed to delete content item');
 finally {
      client.release();



  // Get content statistics
  async getContentStatistics(): Promise<ContentStatistics> {

    try {
      const queries = {
        totalItems: 'SELECT COUNT(*) as count FROM content_items WHERE status != \'archived\'',
        byType: `
          SELECT type, COUNT(*) as count 
          FROM content_items 
          WHERE status != 'archived'
          GROUP BY type
        `,
        byStatus: `
          SELECT status, COUNT(*) as count 
          FROM content_items 
          GROUP BY status
        `,
        byVisibility: `
          SELECT visibility, COUNT(*) as count 
          FROM content_items 
          WHERE status != 'archived'
          GROUP BY visibility
        `,
        featuredCount: `
          SELECT COUNT(*) as count 
          FROM content_items 
          WHERE (metadata->>'featured')::boolean = true AND status = 'published'
        `,
        recentActivity: `
          SELECT 
            COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as created24h,
            COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours' AND created_at <= NOW() - INTERVAL '24 hours') as updated24h,
            COUNT(*) FILTER (WHERE (metadata->>'publishedAt')::timestamp > NOW() - INTERVAL '24 hours') as published24h
          FROM content_items
        `,
        topCategories: `
          SELECT metadata->>'category' as category, COUNT(*) as count
          FROM content_items
          WHERE status != 'archived' AND metadata->>'category' IS NOT NULL
          GROUP BY metadata->>'category'
          ORDER BY count DESC
          LIMIT 10
        `,
        topAuthors: `
          SELECT 
            metadata->>'authorId' as authorId,
            metadata->>'author' as authorName,
            COUNT(*) as count
          FROM content_items
          WHERE status != 'archived'
          GROUP BY metadata->>'authorId', metadata->>'author'
          ORDER BY count DESC
          LIMIT 10
        `
      };

      const [
        totalResult,
        typeResult,
        statusResult,
        visibilityResult,
        featuredResult,
        activityResult,
        categoriesResult,
        authorsResult
      ] = await Promise.all([
        this.database.query(queries.totalItems),
        this.database.query(queries.byType),
        this.database.query(queries.byStatus),
        this.database.query(queries.byVisibility),
        this.database.query(queries.featuredCount),
        this.database.query(queries.recentActivity),
        this.database.query(queries.topCategories),
        this.database.query(queries.topAuthors)
      ]);

      // Process results
      const byType: Record<ContentType, number> = {
        template: 0,
        documentation: 0,
        user_content: 0,
        system_content: 0,
        announcement: 0,
        tutorial: 0
      };

      typeResult.rows.forEach(row => {
        byType[row.type as ContentType] = parseInt(row.count);
      });

      const byStatus: Record<ContentStatus, number> = {
        draft: 0,
        published: 0,
        archived: 0,
        under_review: 0,
        rejected: 0,
        featured: 0
      };

      statusResult.rows.forEach(row => {
        byStatus[row.status as ContentStatus] = parseInt(row.count);
      });

      const byVisibility: Record<ContentVisibility, number> = {
        public: 0,
        private: 0,
        organization: 0,
        admin_only: 0
      };

      visibilityResult.rows.forEach(row => {
        byVisibility[row.visibility as ContentVisibility] = parseInt(row.count);
      });

      const recentActivity = activityResult.rows[0] || { created24h: 0, updated24h: 0, published24h: 0 };

      return {
        totalItems: parseInt(totalResult.rows[0].count),
        byType,
        byStatus,
        byVisibility,
        featuredCount: parseInt(featuredResult.rows[0].count),
        recentActivity: {
          created24h: parseInt(recentActivity.created24h),
          updated24h: parseInt(recentActivity.updated24h),
          published24h: parseInt(recentActivity.published24h)

        topCategories: categoriesResult.rows.map(row => ({
          category: row.category,
          count: parseInt(row.count)
        })),
        topAuthors: authorsResult.rows.map(row => ({
          authorId: row.authorid,
          authorName: row.authorname,
          count: parseInt(row.count)
        }))
      };
 catch (error) {
      console.error('Error getting content statistics:', error);
      throw new Error('Failed to retrieve content statistics');



  // Get content revisions
  async getContentRevisions(contentId: string, limit = 20): Promise<ContentRevision[]> {

    try {
      const query = `
        SELECT * FROM content_revisions 
        WHERE content_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;

      const result = await this.database.query(query, [contentId, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        contentId: row.content_id,
        version: row.version,
        title: row.title,
        description: row.description,
        content: row.content,
        metadata: row.metadata,
        author: row.author,
        authorId: row.author_id,
        createdAt: row.created_at,
        comment: row.comment
      }));
 catch (error) {
      console.error('Error getting content revisions:', error);
      throw new Error('Failed to retrieve content revisions');



  // Bulk operations
  async bulkUpdateStatus(
    contentIds: string[], 
    newStatus: ContentStatus, 
    userId: string, 
    userRole: string
  ): Promise<{ success: number; failed: number }> {

    let success = 0;
    let failed = 0;

    for (const contentId of contentIds) {
      try {
        await this.updateContent(contentId, { status: newStatus }, userId, userRole);
        success++;
 catch (error) {
        console.error(`Failed to update content ${contentId}:`, error);
        failed++;



    // Log bulk operation
    await this.auditService.logEvent({
      userId,
      action: 'bulk_content_status_update',
      resourceType: 'content_bulk',
      resourceId: `bulk_${Date.now()}`,
      details: {
        contentIds,
        newStatus,
        success,
        failed

      severity: failed > 0 ? 'warning' : 'info'
    });

    return { success, failed };


  // Private helper methods
  private async validateContentPermissions(
    userId: string, 
    userRole: string, 
    action: string, 
    contentType: ContentType,
    existingContent?: ContentItem
  ): Promise<void> {

    // Super admins can do everything
    if (userRole === 'super_admin') {
      return;


    // Admins can manage most content
    if (userRole === 'admin') {
      if (['system_content'].includes(contentType) && action === 'delete') {
        throw new Error('Admins cannot delete system content');

      return;


    // Content creators can manage their own content
    if (userRole === 'content_creator' || userRole === 'creator') {
      if (action === 'create') {
        if (['system_content', 'announcement'].includes(contentType)) {
          throw new Error('Insufficient permissions to create this content type');

        return;


      if (existingContent && existingContent.metadata.authorId === userId) {
        return;



    throw new Error('Insufficient permissions for this operation');


  private async createContentRevision(
    contentId: string, 
    content: ContentItem, 
    userId: string, 
    comment?: string
  ): Promise<void> {

    const query = `
      INSERT INTO content_revisions (
        content_id, version, title, description, content, metadata, 
        author, author_id, comment, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;

    await this.database.query(query, [
      contentId,
      content.metadata.version,
      content.title,
      content.description,
      JSON.stringify(content.content),
      JSON.stringify(content.metadata),
      content.metadata.author,
      content.metadata.authorId,
      comment
    ]);


  private mapContentItem(row: any): ContentItem {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      visibility: row.visibility,
      content: row.content,
      metadata: row.metadata,
      organizationId: row.organization_id,
      parentId: row.parent_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };


  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private async getUserName(userId: string): Promise<string> {

    try {
      const result = await this.database.query(
        'SELECT COALESCE(first_name || \' \' || last_name, email) as name FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0]?.name || 'Unknown User';
 catch (error) {
      return 'Unknown User';



  private async getUserOrganizationId(userId: string): Promise<string | null> {

    try {
      const result = await this.database.query(
        'SELECT organization_id FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0]?.organization_id || null;  
 catch (error) {
      return null;




export default ContentManagementService;