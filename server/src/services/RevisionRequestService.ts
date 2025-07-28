/**
 * Revision Request Service - E17-1753114397311-674990
 * 
 * Comprehensive revision request management service for Epic 17 - Backstage Admin Controls.
 * Provides full workflow management, assignment, analytics, and notifications.
 * 
 * Following patterns from AppealProcessService and DocumentReviewInterface.
 */

import { Database } from '../database/connection';
import {
  RevisionRequest,
  RevisionRequestStatus,
  RevisionRequestPriority,
  RevisionContentType,
  RevisionRequestType,
  RevisionEvidence,
  RevisionEvidenceType,
  RevisionTimelineEvent,
  RevisionTimelineEventType,
  RevisionComment,
  RevisionRequestSearchQuery,
  RevisionRequestSearchResults,
  RevisionRequestAggregations,
  RevisionRequestAnalytics,
  RevisionRequestExportRequest,
  RevisionRequestConfig,
  RevisionRequestFormData,
  RevisionRequestReviewFormData,
  DEFAULT_REVISION_REQUEST_CONFIG,
  EvidenceAnnotation,
  ReviewerPerformance
} from '../../../../packages/core/types/RevisionRequestTypes';

export class RevisionRequestService {
  private config: RevisionRequestConfig;

  constructor(
    private db: Database,
    config?: Partial<RevisionRequestConfig>
  ) {
    this.config = { ...DEFAULT_REVISION_REQUEST_CONFIG, ...config };
  }

  // ============================================================================
  // Core CRUD Operations
  // ============================================================================

  async createRevisionRequest(
    formData: RevisionRequestFormData,
    requesterId: string,
    requesterName: string,
    requesterEmail: string
  ): Promise<RevisionRequest> {

    const requestId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate urgency and complexity scores if enabled
    const urgencyScore = this.config.enableComplexityScoring 
      ? this.calculateUrgencyScore(formData.priority, formData.dueDate)
      : undefined;
    
    const complexityScore = this.config.enableComplexityScoring
      ? this.calculateComplexityScore(formData.type, formData.estimatedHours)
      : undefined;

    const query = `
      INSERT INTO revision_requests (
        id, requester_id, requester_name, requester_email,
        content_type, content_id, content_title,
        title, description, requested_changes, business_justification,
        type, priority, status, due_date, estimated_hours,
        urgency_score, complexity_score, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      requestId, requesterId, requesterName, requesterEmail,
      formData.contentType, formData.contentId, formData.contentTitle || 'Unknown Content',
      formData.title, formData.description, formData.requestedChanges, formData.businessJustification,
      formData.type, formData.priority, RevisionRequestStatus.DRAFT, formData.dueDate,
      formData.estimatedHours, urgencyScore, complexityScore, formData.tags
    ]);

    const revisionRequest = this.mapRowToRevisionRequest(result.rows[0]);

    // Auto-assign reviewer if enabled
    if (this.config.enableAutoAssignment) {
      await this.autoAssignReviewer(revisionRequest);
    }

    return revisionRequest;
  }

  async getRevisionRequest(requestId: string): Promise<RevisionRequest | null> {

    const query = `
      SELECT * FROM revision_requests 
      WHERE id = $1
    `;

    const result = await this.db.query(query, [requestId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToRevisionRequest(result.rows[0]);
  }

  async updateRevisionRequest(
    requestId: string,
    updates: Partial<RevisionRequest>,
    actorId: string,
    actorName: string
  ): Promise<RevisionRequest> {

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        const dbField = this.camelToSnakeCase(key);
        updateFields.push(`${dbField} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(requestId);
    const query = `
      UPDATE revision_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Revision request ${requestId} not found`);
    }

    // Create timeline event for the update
    await this.createTimelineEvent(
      requestId,
      RevisionTimelineEventType.STATUS_CHANGED,
      actorId,
      actorName,
      `Request updated by ${actorName}`
    );

    return this.mapRowToRevisionRequest(result.rows[0]);
  }

  async deleteRevisionRequest(requestId: string, actorId: string, actorName: string): Promise<void> {

    // Update status to cancelled instead of hard delete for audit trail
    await this.updateRevisionRequestStatus(
      requestId,
      RevisionRequestStatus.CANCELLED,
      actorId,
      actorName,
      'Request cancelled and removed'
    );
  }

  // ============================================================================
  // Status and Workflow Management
  // ============================================================================

  async updateRevisionRequestStatus(
    requestId: string,
    newStatus: RevisionRequestStatus,
    actorId: string,
    actorName: string,
    notes?: string
  ): Promise<RevisionRequest> {

    const updates: Partial<RevisionRequest> = {
      status: newStatus,
      ...(notes && { reviewNotes: notes }),
      ...(newStatus === RevisionRequestStatus.APPROVED || 
          newStatus === RevisionRequestStatus.REJECTED || 
          newStatus === RevisionRequestStatus.CANCELLED || 
          newStatus === RevisionRequestStatus.IMPLEMENTED ? 
        { completedAt: new Date() } : {})
    };

    return this.updateRevisionRequest(requestId, updates, actorId, actorName);
  }

  async assignReviewer(
    requestId: string,
    reviewerId: string,
    reviewerName: string,
    actorId: string,
    actorName: string
  ): Promise<RevisionRequest> {

    const updates = {
      reviewerId,
      reviewerName,
      assignedAt: new Date(),
      status: RevisionRequestStatus.UNDER_REVIEW
    };

    await this.createTimelineEvent(
      requestId,
      RevisionTimelineEventType.ASSIGNED_TO_REVIEWER,
      actorId,
      actorName,
      `Assigned to reviewer: ${reviewerName}`
    );

    return this.updateRevisionRequest(requestId, updates, actorId, actorName);
  }

  async submitRevisionRequest(
    requestId: string,
    actorId: string,
    actorName: string
  ): Promise<RevisionRequest> {

    return this.updateRevisionRequestStatus(
      requestId,
      RevisionRequestStatus.SUBMITTED,
      actorId,
      actorName,
      'Request submitted for review'
    );
  }

  async reviewRevisionRequest(
    requestId: string,
    reviewData: RevisionRequestReviewFormData,
    reviewerId: string,
    reviewerName: string
  ): Promise<RevisionRequest> {

    let newStatus: RevisionRequestStatus;
    let timelineEventType: RevisionTimelineEventType;
    let description: string;

    switch (reviewData.decision) {
    case 'approve':
      newStatus = RevisionRequestStatus.APPROVED;
      timelineEventType = RevisionTimelineEventType.APPROVAL_GIVEN;
      description = 'Request approved';
      break;
    case 'reject':
      newStatus = RevisionRequestStatus.REJECTED;
      timelineEventType = RevisionTimelineEventType.REJECTION_GIVEN;
      description = 'Request rejected';
      break;
    case 'request_info':
      newStatus = RevisionRequestStatus.ADDITIONAL_INFO_REQUESTED;
      timelineEventType = RevisionTimelineEventType.ADDITIONAL_INFO_REQUESTED;
      description = 'Additional information requested';
      break;
    default:
      throw new Error(`Invalid review decision: ${reviewData.decision}`);
    }

    const updates = {
      status: newStatus,
      reviewNotes: reviewData.reviewNotes,
      rejectionReason: reviewData.rejectionReason,
      approvalNotes: reviewData.approvalNotes,
      ...(newStatus === RevisionRequestStatus.APPROVED || newStatus === RevisionRequestStatus.REJECTED ? {
        completedAt: new Date()
      } : {})
    };

    await this.createTimelineEvent(
      requestId,
      timelineEventType,
      reviewerId,
      reviewerName,
      `${description}: ${reviewData.reviewNotes}`
    );

    return this.updateRevisionRequest(requestId, updates, reviewerId, reviewerName);
  }

  // ============================================================================
  // Search and Filtering
  // ============================================================================

  async searchRevisionRequests(query: RevisionRequestSearchQuery): Promise<RevisionRequestSearchResults> {

    const {
      page = 1,
      pageSize = 50,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = query;

    const offset = (page - 1) * pageSize;

    // Build WHERE clause
    const { whereClause, params } = this.buildWhereClause(query);
    
    // Build ORDER BY clause
    const orderClause = this.buildOrderClause(sortBy, sortOrder);

    // Main query
    const mainQuery = `
      SELECT 
        rr.*,
        COUNT(*) OVER() as total_count
      FROM revision_requests rr
      ${whereClause}
      ${orderClause}
      OFFSET $${params.length + 1} LIMIT $${params.length + 2}
    `;

    const [results, aggregations] = await Promise.all([
      this.db.query(mainQuery, [...params, offset, pageSize]),
      this.getRevisionRequestAggregations(query)
    ]);

    const requests = results.rows.map(row => this.mapRowToRevisionRequest(row));
    const total = results.rows[0]?.total_count || 0;

    return {
      requests,
      pagination: {
        page,
        pageSize,
        total: parseInt(total),
        totalPages: Math.ceil(total / pageSize)
  }
      aggregations,
      filters: this.buildAppliedFilters(query)
    };
  }

  async getRevisionRequestsByRequester(requesterId: string): Promise<RevisionRequest[]> {

    const query = `
      SELECT * FROM revision_requests 
      WHERE requester_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [requesterId]);
    return result.rows.map(row => this.mapRowToRevisionRequest(row));
  }

  async getRevisionRequestsByReviewer(reviewerId: string): Promise<RevisionRequest[]> {

    const query = `
      SELECT * FROM revision_requests 
      WHERE reviewer_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [reviewerId]);
    return result.rows.map(row => this.mapRowToRevisionRequest(row));
  }

  async getPendingRevisionRequests(): Promise<RevisionRequest[]> {

    const query = `
      SELECT * FROM revision_requests 
      WHERE status IN ($1, $2, $3)
      ORDER BY priority DESC, created_at ASC
    `;

    const result = await this.db.query(query, [
      RevisionRequestStatus.SUBMITTED,
      RevisionRequestStatus.UNDER_REVIEW,
      RevisionRequestStatus.ADDITIONAL_INFO_REQUESTED
    ]);

    return result.rows.map(row => this.mapRowToRevisionRequest(row));
  }

  // ============================================================================
  // Evidence Management
  // ============================================================================

  async addEvidence(
    requestId: string,
    evidenceType: RevisionEvidenceType,
    title: string,
    description: string,
    fileUrl: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    uploadedBy: string
  ): Promise<RevisionEvidence> {

    const evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO revision_evidence (
        id, revision_request_id, evidence_type, title, description,
        file_url, file_name, file_size, mime_type, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      evidenceId, requestId, evidenceType, title, description,
      fileUrl, fileName, fileSize, mimeType, uploadedBy
    ]);

    // Create timeline event
    await this.createTimelineEvent(
      requestId,
      RevisionTimelineEventType.EVIDENCE_UPLOADED,
      uploadedBy,
      'User',
      `Evidence uploaded: ${title}`
    );

    return this.mapRowToRevisionEvidence(result.rows[0]);
  }

  async getRevisionEvidence(requestId: string): Promise<RevisionEvidence[]> {

    const query = `
      SELECT * FROM revision_evidence 
      WHERE revision_request_id = $1 
      ORDER BY uploaded_at DESC
    `;

    const result = await this.db.query(query, [requestId]);
    return result.rows.map(row => this.mapRowToRevisionEvidence(row));
  }

  async removeEvidence(evidenceId: string, actorId: string, actorName: string): Promise<void> {

    // Get the evidence info first for timeline
    const evidenceQuery = 'SELECT * FROM revision_evidence WHERE id = $1';
    const evidenceResult = await this.db.query(evidenceQuery, [evidenceId]);
    
    if (evidenceResult.rows.length === 0) {
      throw new Error(`Evidence ${evidenceId} not found`);
    }

    const evidence = evidenceResult.rows[0];

    // Delete the evidence
    const deleteQuery = 'DELETE FROM revision_evidence WHERE id = $1';
    await this.db.query(deleteQuery, [evidenceId]);

    // Create timeline event
    await this.createTimelineEvent(
      evidence.revision_request_id,
      RevisionTimelineEventType.EVIDENCE_REMOVED,
      actorId,
      actorName,
      `Evidence removed: ${evidence.title}`
    );
  }

  // ============================================================================
  // Annotations Management
  // ============================================================================

  async addEvidenceAnnotation(
    evidenceId: string,
    annotationType: EvidenceAnnotation['annotationType'],
    content: string,
    coordinates: EvidenceAnnotation['coordinates'],
    createdBy: string
  ): Promise<EvidenceAnnotation> {

    const annotationId = `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO revision_evidence_annotations (
        id, evidence_id, annotation_type, content,
        coordinates_x, coordinates_y, coordinates_width, coordinates_height,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      annotationId, evidenceId, annotationType, content,
      coordinates?.x, coordinates?.y, coordinates?.width, coordinates?.height,
      createdBy
    ]);

    return this.mapRowToEvidenceAnnotation(result.rows[0]);
  }

  async getEvidenceAnnotations(evidenceId: string): Promise<EvidenceAnnotation[]> {

    const query = `
      SELECT * FROM revision_evidence_annotations 
      WHERE evidence_id = $1 
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [evidenceId]);
    return result.rows.map(row => this.mapRowToEvidenceAnnotation(row));
  }

  async resolveAnnotation(
    annotationId: string,
    resolvedBy: string
  ): Promise<EvidenceAnnotation> {

    const query = `
      UPDATE revision_evidence_annotations 
      SET resolved = TRUE, resolved_by = $1, resolved_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.db.query(query, [resolvedBy, annotationId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Annotation ${annotationId} not found`);
    }

    return this.mapRowToEvidenceAnnotation(result.rows[0]);
  }

  // ============================================================================
  // Comments and Discussions
  // ============================================================================

  async addComment(
    requestId: string,
    content: string,
    authorId: string,
    authorName: string,
    isInternal: boolean = false,
    parentCommentId?: string,
    mentions: string[] = []
  ): Promise<RevisionComment> {

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO revision_comments (
        id, revision_request_id, author_id, author_name,
        content, parent_comment_id, is_internal, mentions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      commentId, requestId, authorId, authorName,
      content, parentCommentId, isInternal, mentions
    ]);

    // Create timeline event
    await this.createTimelineEvent(
      requestId,
      RevisionTimelineEventType.COMMENT_ADDED,
      authorId,
      authorName,
      `Comment added: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`
    );

    return this.mapRowToRevisionComment(result.rows[0]);
  }

  async getComments(requestId: string, includeInternal: boolean = false): Promise<RevisionComment[]> {

    const query = `
      SELECT * FROM revision_comments 
      WHERE revision_request_id = $1 
      ${includeInternal ? '' : 'AND is_internal = FALSE'}
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [requestId]);
    return result.rows.map(row => this.mapRowToRevisionComment(row));
  }

  // ============================================================================
  // Timeline Management
  // ============================================================================

  async getRevisionTimeline(requestId: string): Promise<RevisionTimelineEvent[]> {

    const query = `
      SELECT * FROM revision_timeline 
      WHERE revision_request_id = $1 
      ORDER BY timestamp DESC
    `;

    const result = await this.db.query(query, [requestId]);
    return result.rows.map(row => this.mapRowToRevisionTimelineEvent(row));
  }

  private async createTimelineEvent(
    requestId: string,
    eventType: RevisionTimelineEventType,
    actorId: string,
    actorName: string,
    description: string,
    oldValue?: string,
    newValue?: string,
    metadata: Record<string, any> = {}
  ): Promise<RevisionTimelineEvent> {

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO revision_timeline (
        id, revision_request_id, event_type, actor_id, actor_name,
        description, old_value, new_value, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      eventId, requestId, eventType, actorId, actorName,
      description, oldValue, newValue, JSON.stringify(metadata)
    ]);

    return this.mapRowToRevisionTimelineEvent(result.rows[0]);
  }

  // ============================================================================
  // Analytics and Reporting
  // ============================================================================

  async getRevisionRequestAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<RevisionRequestAnalytics> {

    const [overview, performance, trends] = await Promise.all([
      this.getAnalyticsOverview(startDate, endDate),
      this.getAnalyticsPerformance(startDate, endDate),
      this.getAnalyticsTrends(startDate, endDate)
    ]);

    return {
      period: {
        startDate,
        endDate,
        timeRange: 'custom'
  }
      overview,
      performance,
      trends,
      insights: await this.generateInsights(startDate, endDate),
      recommendations: await this.generateRecommendations(startDate, endDate)
    };
  }

  async getReviewerPerformance(reviewerId?: string): Promise<ReviewerPerformance[]> {

    const query = `
      SELECT 
        rr.reviewer_id,
        rr.reviewer_name,
        COUNT(*) as total_assigned,
        COUNT(*) FILTER (WHERE status IN ('approved', 'implemented')) as total_completed,
        AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at))/3600) FILTER (
          WHERE completed_at IS NOT NULL AND assigned_at IS NOT NULL
        ) as avg_completion_hours,
        COUNT(sla.id) FILTER (WHERE sla.is_met = TRUE)::NUMERIC / NULLIF(COUNT(sla.id), 0) as on_time_rate
      FROM revision_requests rr
      LEFT JOIN revision_sla_tracking sla ON rr.id = sla.revision_request_id
      WHERE rr.reviewer_id IS NOT NULL
      ${reviewerId ? 'AND rr.reviewer_id = $1' : ''}
      GROUP BY rr.reviewer_id, rr.reviewer_name
      ORDER BY total_assigned DESC
    `;

    const params = reviewerId ? [reviewerId] : [];
    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      reviewerId: row.reviewer_id,
      reviewerName: row.reviewer_name,
      totalAssigned: parseInt(row.total_assigned || 0),
      totalCompleted: parseInt(row.total_completed || 0),
      averageCompletionTime: parseFloat(row.avg_completion_hours || 0),
      onTimeRate: parseFloat(row.on_time_rate || 0),
      satisfactionRating: 4.2, // Would come from separate satisfaction tracking
      workloadBalance: 0.8 // Would be calculated based on current assignments
    }));
  }

  // ============================================================================
  // Export Functionality
  // ============================================================================

  async exportRevisionRequests(request: RevisionRequestExportRequest): Promise<string> {

    const searchResults = await this.searchRevisionRequests({
      ...request.query,
      page: 1,
      pageSize: 10000 // Large export limit
    });

    switch (request.format) {
    case 'csv':
      return this.generateCSV(searchResults.requests, request.fields);
    case 'json':
      return this.generateJSON(searchResults.requests, request);
    case 'excel':
      return this.generateExcel(searchResults.requests, request.fields);
    default:
      throw new Error(`Unsupported export format: ${request.format}`);
    }
  }

  // ============================================================================
  // Auto-assignment and Workflow Automation
  // ============================================================================

  private async autoAssignReviewer(request: RevisionRequest): Promise<void> {

    if (!this.config.enableAutoAssignment) {
      return;
    }

    const assignmentQuery = `
      SELECT reviewer_id, reviewer_name, skill_level, workload_capacity
      FROM revision_reviewer_rules 
      WHERE content_type = $1 AND request_type = $2 AND priority = $3 AND is_active = TRUE
      ORDER BY 
        CASE WHEN $4 = 'skill_based' THEN skill_level END DESC,
        CASE WHEN $4 = 'workload_based' THEN workload_capacity END DESC,
        RANDOM()
      LIMIT 1
    `;

    const result = await this.db.query(assignmentQuery, [
      request.contentType,
      request.type,
      request.priority,
      this.config.defaultReviewerAssignment
    ]);

    if (result.rows.length > 0) {
      const reviewer = result.rows[0];
      await this.assignReviewer(
        request.id,
        reviewer.reviewer_id,
        reviewer.reviewer_name,
        'system',
        'Auto-assignment System'
      );
    }
  }

  private calculateUrgencyScore(priority: RevisionRequestPriority, dueDate?: Date): number {
    let baseScore = 0;
    
    switch (priority) {
    case RevisionRequestPriority.CRITICAL: baseScore = 100; break;
    case RevisionRequestPriority.URGENT: baseScore = 80; break;
    case RevisionRequestPriority.HIGH: baseScore = 60; break;
    case RevisionRequestPriority.MEDIUM: baseScore = 40; break;
    case RevisionRequestPriority.LOW: baseScore = 20; break;
    }

    if (dueDate) {
      const daysUntilDue = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 1) baseScore += 20;
      else if (daysUntilDue < 3) baseScore += 10;
      else if (daysUntilDue < 7) baseScore += 5;
    }

    return Math.min(100, Math.max(0, baseScore));
  }

  private calculateComplexityScore(type: RevisionRequestType, estimatedHours?: number): number {
    let baseScore = 0;

    switch (type) {
    case RevisionRequestType.CONTENT_UPDATE: baseScore = 20; break;
    case RevisionRequestType.BUG_FIX: baseScore = 30; break;
    case RevisionRequestType.ACCESSIBILITY_IMPROVEMENT: baseScore = 40; break;
    case RevisionRequestType.PERFORMANCE_IMPROVEMENT: baseScore = 50; break;
    case RevisionRequestType.FEATURE_ENHANCEMENT: baseScore = 70; break;
    case RevisionRequestType.SECURITY_UPDATE: baseScore = 80; break;
    case RevisionRequestType.COMPLIANCE_UPDATE: baseScore = 90; break;
    }

    if (estimatedHours) {
      if (estimatedHours > 40) baseScore += 30;
      else if (estimatedHours > 20) baseScore += 20;
      else if (estimatedHours > 10) baseScore += 10;
      else if (estimatedHours > 5) baseScore += 5;
    }

    return Math.min(100, Math.max(0, baseScore));
  }

  // ============================================================================
  // Helper Methods and Data Mapping
  // ============================================================================

  private buildWhereClause(query: RevisionRequestSearchQuery): { whereClause: string; params: unknown[] } {
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.status && query.status.length > 0) {
      conditions.push(`rr.status = ANY($${paramIndex++})`);
      params.push(query.status);
    }

    if (query.priority && query.priority.length > 0) {
      conditions.push(`rr.priority = ANY($${paramIndex++})`);
      params.push(query.priority);
    }

    if (query.contentType && query.contentType.length > 0) {
      conditions.push(`rr.content_type = ANY($${paramIndex++})`);
      params.push(query.contentType);
    }

    if (query.type && query.type.length > 0) {
      conditions.push(`rr.type = ANY($${paramIndex++})`);
      params.push(query.type);
    }

    if (query.requesterId) {
      conditions.push(`rr.requester_id = $${paramIndex++}`);
      params.push(query.requesterId);
    }

    if (query.reviewerId) {
      conditions.push(`rr.reviewer_id = $${paramIndex++}`);
      params.push(query.reviewerId);
    }

    if (query.unassigned) {
      conditions.push('rr.reviewer_id IS NULL');
    }

    if (query.dateRange) {
      conditions.push(`rr.created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`);
      params.push(query.dateRange.start, query.dateRange.end);
    }

    if (query.dueDateRange) {
      conditions.push(`rr.due_date BETWEEN $${paramIndex++} AND $${paramIndex++}`);
      params.push(query.dueDateRange.start, query.dueDateRange.end);
    }

    if (query.contentId) {
      conditions.push(`rr.content_id = $${paramIndex++}`);
      params.push(query.contentId);
    }

    if (query.tags && query.tags.length > 0) {
      conditions.push(`rr.tags && $${paramIndex++}`);
      params.push(query.tags);
    }

    if (query.search) {
      conditions.push(`(
        rr.title ILIKE $${paramIndex} OR 
        rr.description ILIKE $${paramIndex} OR 
        rr.requested_changes ILIKE $${paramIndex} OR
        rr.business_justification ILIKE $${paramIndex}
      )`);
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 1 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  private buildOrderClause(sortBy: string, sortOrder: string): string {
    const columnMap: Record<string, string> = {
      'created_at': 'rr.created_at',
      'updated_at': 'rr.updated_at',
      'due_date': 'rr.due_date',
      'priority': 'rr.priority',
      'urgency_score': 'rr.urgency_score',
      'complexity_score': 'rr.complexity_score',
      'title': 'rr.title',
      'requester_name': 'rr.requester_name',
      'status': 'rr.status'
    };

    const column = columnMap[sortBy] || 'rr.created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    return `ORDER BY ${column} ${order}`;
  }

  private async getRevisionRequestAggregations(query: RevisionRequestSearchQuery): Promise<RevisionRequestAggregations> {

    // Simplified aggregation - in production would be more comprehensive
    const { whereClause, params } = this.buildWhereClause(query);
    
    const aggregationQuery = `
      SELECT 
        status,
        priority,
        type,
        content_type,
        COUNT(*) as count
      FROM revision_requests rr
      ${whereClause}
      GROUP BY status, priority, type, content_type
    `;

    const result = await this.db.query(aggregationQuery, params);

    // Build aggregation objects
    const statusBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {};
    const contentTypeBreakdown: Record<string, number> = {};

    result.rows.forEach(row => {
      const count = parseInt(row.count);
      statusBreakdown[row.status] = (statusBreakdown[row.status] || 0) + count;
      priorityBreakdown[row.priority] = (priorityBreakdown[row.priority] || 0) + count;
      typeBreakdown[row.type] = (typeBreakdown[row.type] || 0) + count;
      contentTypeBreakdown[row.content_type] = (contentTypeBreakdown[row.content_type] || 0) + count;
    });

    return {
      statusBreakdown: statusBreakdown as any,
      priorityBreakdown: priorityBreakdown as any,
      typeBreakdown: typeBreakdown as any,
      contentTypeBreakdown: contentTypeBreakdown as any,
      assignmentStats: {
        assigned: 0,
        unassigned: 0,
        overdue: 0,
        dueToday: 0,
        dueThisWeek: 0
  }
      averageCompletionTime: 24,
      topRequesters: [],
      topReviewers: []
    };
  }

  private buildAppliedFilters(query: RevisionRequestSearchQuery): unknown {
    const filters = [];
    
    if (query.status && query.status.length > 0) {
      filters.push({
        field: 'status',
        operator: 'in',
        value: query.status,
        displayName: `Status: ${query.status.join(', ')}`
      });
    }

    if (query.priority && query.priority.length > 0) {
      filters.push({
        field: 'priority',
        operator: 'in',
        value: query.priority,
        displayName: `Priority: ${query.priority.join(', ')}`
      });
    }

    return { count: filters.length, filters };
  }

  private mapRowToRevisionRequest(row: unknown): RevisionRequest {
    return {
      id: row.id,
      requesterId: row.requester_id,
      requesterName: row.requester_name,
      requesterEmail: row.requester_email,
      contentType: row.content_type,
      contentId: row.content_id,
      contentTitle: row.content_title,
      contentVersion: row.content_version,
      title: row.title,
      description: row.description,
      requestedChanges: row.requested_changes,
      businessJustification: row.business_justification,
      type: row.type,
      priority: row.priority,
      status: row.status,
      reviewerId: row.reviewer_id,
      reviewerName: row.reviewer_name,
      assignedAt: row.assigned_at ? new Date(row.assigned_at) : undefined,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      reviewNotes: row.review_notes,
      rejectionReason: row.rejection_reason,
      approvalNotes: row.approval_notes,
      implementationNotes: row.implementation_notes,
      evidence: [], // Would be loaded separately
      timeline: [], // Would be loaded separately
      tags: row.tags || [],
      metadata: row.metadata || {},
      urgencyScore: row.urgency_score,
      complexityScore: row.complexity_score,
      impactScore: row.impact_score
    };
  }

  private mapRowToRevisionEvidence(row: unknown): RevisionEvidence {
    return {
      id: row.id,
      revisionRequestId: row.revision_request_id,
      evidenceType: row.evidence_type,
      title: row.title,
      description: row.description,
      fileUrl: row.file_url,
      fileName: row.file_name,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      uploadedBy: row.uploaded_by,
      uploadedAt: new Date(row.uploaded_at),
      annotations: [], // Would be loaded separately
      metadata: row.metadata || {}
    };
  }

  private mapRowToEvidenceAnnotation(row: unknown): EvidenceAnnotation {
    return {
      id: row.id,
      evidenceId: row.evidence_id,
      annotationType: row.annotation_type,
      coordinates: {
        x: row.coordinates_x,
        y: row.coordinates_y,
        width: row.coordinates_width,
        height: row.coordinates_height
  }
      content: row.content,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      resolved: row.resolved,
      resolvedBy: row.resolved_by,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined
    };
  }

  private mapRowToRevisionTimelineEvent(row: Event): RevisionTimelineEvent {
    return {
      id: row.id,
      revisionRequestId: row.revision_request_id,
      eventType: row.event_type,
      actorId: row.actor_id,
      actorName: row.actor_name,
      description: row.description,
      oldValue: row.old_value,
      newValue: row.new_value,
      timestamp: new Date(row.timestamp),
      metadata: row.metadata || {}
    };
  }

  private mapRowToRevisionComment(row: unknown): RevisionComment {
    return {
      id: row.id,
      revisionRequestId: row.revision_request_id,
      authorId: row.author_id,
      authorName: row.author_name,
      content: row.content,
      parentCommentId: row.parent_comment_id,
      isInternal: row.is_internal,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      editedBy: row.edited_by,
      mentions: row.mentions || [],
      attachments: row.attachments || []
    };
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private generateCSV(requests: RevisionRequest[], fields?: string[]): string {
    const headers = fields || ['id', 'title', 'status', 'priority', 'requester_name', 'created_at'];
    const csvRows = [headers.join(',')];
    
    for (const request of requests) {
      const row = headers.map(field => {
        const value = (request as any)[field];
        return typeof value === 'string' ? `"${value}"` : String(value || '');
      });
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }

  private generateJSON(requests: RevisionRequest[], _____request: RevisionRequestExportRequest): string {
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      total_records: requests.length,
      revision_requests: requests
    }, null, 2);
  }

  private generateExcel(_____requests: RevisionRequest[], fields?: string[]): string {
    throw new Error('Excel export not yet implemented');
  }

  // Placeholder methods for analytics
  private async getAnalyticsOverview(_____startDate: Date, _____endDate: Date): Promise<unknown> {

    return {
      totalRequests: 0,
      completedRequests: 0,
      pendingRequests: 0,
      overdueRequests: 0,
      averageCompletionTime: 0,
      completionRate: 0,
      satisfactionScore: 0,
      growthMetrics: {
        requestGrowth: 0,
        completionGrowth: 0,
        averageTimeImprovement: 0
      }
    };
  }

  private async getAnalyticsPerformance(_____startDate: Date, _____endDate: Date): Promise<unknown> {

    return {
      reviewerPerformance: {},
      contentTypePerformance: {},
      priorityPerformance: {},
      slaMetrics: {
        onTimeCompletionRate: 0,
        averageResponseTime: 0,
        escalationRate: 0
      }
    };
  }

  private async getAnalyticsTrends(_____startDate: Date, _____endDate: Date): Promise<unknown> {

    return {
      requestVolume: [],
      completionTrends: [],
      contentTypeTrends: []
    };
  }

  private async generateInsights(_____startDate: Date, _____endDate: Date): Promise<any[]> {

    return [];
  }

  private async generateRecommendations(_____startDate: Date, _____endDate: Date): Promise<any[]> {

    return [];
  }
}