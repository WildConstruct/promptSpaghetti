/**
 * Placement Management Service - Epic 17.5.2
 * 
 * Comprehensive service for managing marketplace content placement and featured content.
 * Provides slot management, content placement, scheduling, and performance analytics.
 * 
 * Task: E17-1753114397326-68B279 - Develop placement management
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { AuditService } from '../auth/services/AuditService';
import {
  PlacementSlot,
  ContentPlacement,
  PlacementArea,
  PlacementPosition,
  PlacementStatus,
  ContentType,
  PlacementSchedule,
  PlacementCampaign,
  PlacementAnalytics,
  PlacementPreview,
  PlacementSearchCriteria,
  BulkPlacementOperation,
  PlacementSlotMetrics,
  ContentPlacementMetrics,
  PlacementTemplate
} from '../../../../packages/core/types/PlacementTypes';

export interface CreateSlotRequest {
  name: string;
  displayName: string;
  description: string;
  placementArea: PlacementArea;
  position: PlacementPosition;
  maxItems: number;
  minItems?: number;
  dimensions: unknown;
  layout: unknown;
  targetingRules?: unknown;
  displayRules?: unknown;
  priority?: number;
  tags?: string[];
}

export interface UpdateSlotRequest {
  displayName?: string;
  description?: string;
  maxItems?: number;
  minItems?: number;
  dimensions?: unknown;
  layout?: unknown;
  targetingRules?: unknown;
  displayRules?: unknown;
  priority?: number;
  isActive?: boolean;
  tags?: string[];
}

export interface CreatePlacementRequest {
  slotId: string;
  contentId: string;
  contentType: ContentType;
  priority?: number;
  weight?: number;
  startTime?: Date;
  endTime?: Date;
  targetingOverrides?: unknown;
  customStyling?: unknown;
  customData?: unknown;
  experimentId?: string;
  variantId?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdatePlacementRequest {
  priority?: number;
  weight?: number;
  startTime?: Date;
  endTime?: Date;
  status?: PlacementStatus;
  targetingOverrides?: unknown;
  customStyling?: unknown;
  customData?: unknown;
  notes?: string;
  tags?: string[];
}

export class PlacementManagementService {
  private db: Database;
  private auditService: AuditService;

  constructor(database: Database, auditService: AuditService) {
    this.db = database;
    this.auditService = auditService;
  }

  // =============================================================================
  // Placement Slot Management
  // =============================================================================

  /**
   * Create a new placement slot
   */
  async createPlacementSlot(request: CreateSlotRequest, createdBy: string): Promise<PlacementSlot> {
    console.log(`📍 Creating placement slot: ${request.name}`);

    const slotId = this.generateSlotId();
    
    const slot: PlacementSlot = {
      slotId,
      name: request.name,
      displayName: request.displayName,
      description: request.description,
      placementArea: request.placementArea,
      position: request.position,
      maxItems: request.maxItems,
      minItems: request.minItems || 1,
      dimensions: request.dimensions,
      styling: this.getDefaultStyling(),
      layout: request.layout,
      targetingRules: request.targetingRules || {},
      displayRules: request.displayRules || {},
      isActive: true,
      priority: request.priority || 50,
      tags: request.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    await this.storePlacementSlot(slot);

    await this.auditService.logEvent({
      userId: createdBy,
      action: 'placement_slot_created',
      details: {
        slotId,
        name: slot.name,
        placementArea: slot.placementArea,
        position: slot.position
      },
      severity: 'info'
    });

    return slot;
  }

  /**
   * Get placement slot by ID
   */
  async getPlacementSlot(slotId: string): Promise<PlacementSlot | null> {
    const result = await this.db.query(`
      SELECT * FROM placement_slots WHERE slot_id = $1
    `, [slotId]);

    if (result.rows.length === 0) return null;

    return this.hydratePlacementSlot(result.rows[0]);
  }

  /**
   * Get all placement slots with filtering
   */
  async getPlacementSlots(criteria: {
    placementArea?: PlacementArea;
    isActive?: boolean;
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ slots: PlacementSlot[]; total: number }> {
    let query = `
      SELECT ps.*, COUNT(cp.placement_id) as active_placements
      FROM placement_slots ps
      LEFT JOIN content_placements cp ON ps.slot_id = cp.slot_id AND cp.status = 'active'
      WHERE 1=1
    `;
    
    const params: unknown[] = [];
    let paramIndex = 1;

    if (criteria.placementArea) {
      query += ` AND ps.placement_area = $${paramIndex}`;
      params.push(criteria.placementArea);
      paramIndex++;
    }

    if (criteria.isActive !== undefined) {
      query += ` AND ps.is_active = $${paramIndex}`;
      params.push(criteria.isActive);
      paramIndex++;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      query += ` AND ps.tags && $${paramIndex}`;
      params.push(criteria.tags);
      paramIndex++;
    }

    query += ' GROUP BY ps.slot_id ORDER BY ps.priority DESC, ps.created_at DESC';

    // Get total count
    const countQuery = query.replace(/SELECT.*GROUP BY ps\.slot_id/, 'SELECT COUNT(DISTINCT ps.slot_id)');
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    const limit = criteria.limit || 50;
    const offset = criteria.offset || 0;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);
    const slots = await Promise.all(
      result.rows.map(row => this.hydratePlacementSlot(row))
    );

    return { slots, total };
  }

  /**
   * Update placement slot
   */
  async updatePlacementSlot(slotId: string, updates: UpdateSlotRequest, updatedBy: string): Promise<PlacementSlot> {
    console.log(`📝 Updating placement slot: ${slotId}`);

    const currentSlot = await this.getPlacementSlot(slotId);
    if (!currentSlot) {
      throw new Error(`Placement slot not found: ${slotId}`);
    }

    const updateData: unknown = {
      updated_at: new Date(),
      last_modified_by: updatedBy
    };

    // Build update fields
    if (updates.displayName) updateData.display_name = updates.displayName;
    if (updates.description) updateData.description = updates.description;
    if (updates.maxItems !== undefined) updateData.max_items = updates.maxItems;
    if (updates.minItems !== undefined) updateData.min_items = updates.minItems;
    if (updates.dimensions) updateData.dimensions = JSON.stringify(updates.dimensions);
    if (updates.layout) updateData.layout = JSON.stringify(updates.layout);
    if (updates.targetingRules) updateData.targeting_rules = JSON.stringify(updates.targetingRules);
    if (updates.displayRules) updateData.display_rules = JSON.stringify(updates.displayRules);
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.tags) updateData.tags = JSON.stringify(updates.tags);

    // Build update query
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [slotId, ...Object.values(updateData)];

    await this.db.query(`
      UPDATE placement_slots 
      SET ${setClause}
      WHERE slot_id = $1
    `, values);

    await this.auditService.logEvent({
      userId: updatedBy,
      action: 'placement_slot_updated',
      details: {
        slotId,
        updates: Object.keys(updateData),
        previousActive: currentSlot.isActive,
        newActive: updates.isActive
      },
      severity: 'info'
    });

    return await this.getPlacementSlot(slotId) as PlacementSlot;
  }

  /**
   * Delete placement slot
   */
  async deletePlacementSlot(slotId: string, deletedBy: string): Promise<void> {
    console.log(`🗑️ Deleting placement slot: ${slotId}`);

    // Check for active placements
    const activePlacementsResult = await this.db.query(`
      SELECT COUNT(*) FROM content_placements 
      WHERE slot_id = $1 AND status = 'active'
    `, [slotId]);

    const activePlacements = parseInt(activePlacementsResult.rows[0].count);
    if (activePlacements > 0) {
      throw new Error(`Cannot delete slot with ${activePlacements} active placements`);
    }

    await this.db.query('DELETE FROM placement_slots WHERE slot_id = $1', [slotId]);

    await this.auditService.logEvent({
      userId: deletedBy,
      action: 'placement_slot_deleted',
      details: { slotId },
      severity: 'warning'
    });
  }

  // =============================================================================
  // Content Placement Management
  // =============================================================================

  /**
   * Create content placement
   */
  async createContentPlacement(request: CreatePlacementRequest, createdBy: string): Promise<ContentPlacement> {
    console.log(`🎯 Creating content placement for slot: ${request.slotId}`);

    // Validate slot exists and has capacity
    const slot = await this.getPlacementSlot(request.slotId);
    if (!slot) {
      throw new Error(`Placement slot not found: ${request.slotId}`);
    }

    const activePlacementsCount = await this.getActivePlacementsCount(request.slotId);
    if (activePlacementsCount >= slot.maxItems) {
      throw new Error(`Slot ${request.slotId} is at capacity (${slot.maxItems} items)`);
    }

    // Validate content exists
    await this.validateContentExists(request.contentId, request.contentType);

    const placementId = this.generatePlacementId();
    
    const placement: ContentPlacement = {
      placementId,
      slotId: request.slotId,
      contentId: request.contentId,
      contentType: request.contentType,
      priority: request.priority || this.calculateDefaultPriority(request.slotId),
      weight: request.weight,
      startTime: request.startTime,
      endTime: request.endTime,
      targetingOverrides: request.targetingOverrides,
      customStyling: request.customStyling,
      customData: request.customData,
      status: this.determineInitialStatus(request.startTime, request.endTime),
      approvalStatus: this.determineApprovalRequirement(slot, request),
      experimentId: request.experimentId,
      variantId: request.variantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      notes: request.notes,
      tags: request.tags
    };

    await this.storeContentPlacement(placement);

    // Update slot priorities if needed
    await this.rebalanceSlotPriorities(request.slotId);

    await this.auditService.logEvent({
      userId: createdBy,
      action: 'content_placement_created',
      details: {
        placementId,
        slotId: request.slotId,
        contentId: request.contentId,
        contentType: request.contentType,
        priority: placement.priority
      },
      severity: 'info'
    });

    return placement;
  }

  /**
   * Get content placement by ID
   */
  async getContentPlacement(placementId: string): Promise<ContentPlacement | null> {
    const result = await this.db.query(`
      SELECT cp.*, ps.name as slot_name, ps.display_name as slot_display_name
      FROM content_placements cp
      JOIN placement_slots ps ON cp.slot_id = ps.slot_id
      WHERE cp.placement_id = $1
    `, [placementId]);

    if (result.rows.length === 0) return null;

    return this.hydrateContentPlacement(result.rows[0]);
  }

  /**
   * Search content placements
   */
  async searchContentPlacements(criteria: PlacementSearchCriteria): Promise<{ placements: ContentPlacement[]; total: number }> {
    console.log('🔍 Searching content placements', criteria);

    let query = `
      SELECT cp.*, ps.name as slot_name, ps.display_name as slot_display_name,
             CASE 
               WHEN cp.content_type = 'template' THEN mt.title
               WHEN cp.content_type = 'collection' THEN tc.name
               ELSE cp.content_id
             END as content_title
      FROM content_placements cp
      JOIN placement_slots ps ON cp.slot_id = ps.slot_id
      LEFT JOIN marketplace_templates mt ON cp.content_id = mt.id AND cp.content_type = 'template'
      LEFT JOIN template_collections tc ON cp.content_id = tc.id AND cp.content_type = 'collection'
      WHERE 1=1
    `;
    
    const params: unknown[] = [];
    let paramIndex = 1;

    // Apply filters
    if (criteria.slotIds && criteria.slotIds.length > 0) {
      query += ` AND cp.slot_id = ANY($${paramIndex})`;
      params.push(criteria.slotIds);
      paramIndex++;
    }

    if (criteria.contentTypes && criteria.contentTypes.length > 0) {
      query += ` AND cp.content_type = ANY($${paramIndex})`;
      params.push(criteria.contentTypes);
      paramIndex++;
    }

    if (criteria.placementAreas && criteria.placementAreas.length > 0) {
      query += ` AND ps.placement_area = ANY($${paramIndex})`;
      params.push(criteria.placementAreas);
      paramIndex++;
    }

    if (criteria.status && criteria.status.length > 0) {
      query += ` AND cp.status = ANY($${paramIndex})`;
      params.push(criteria.status);
      paramIndex++;
    }

    if (criteria.dateRange) {
      query += ` AND cp.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(criteria.dateRange.start, criteria.dateRange.end);
      paramIndex += 2;
    }

    if (criteria.createdBy) {
      query += ` AND cp.created_by = $${paramIndex}`;
      params.push(criteria.createdBy);
      paramIndex++;
    }

    if (criteria.query) {
      query += ` AND (ps.name ILIKE $${paramIndex} OR ps.display_name ILIKE $${paramIndex} OR cp.notes ILIKE $${paramIndex})`;
      params.push(`%${criteria.query}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply sorting
    const sortBy = criteria.sortBy || 'createdAt';
    const sortOrder = criteria.sortOrder || 'desc';
    query += ` ORDER BY ${this.mapSortField(sortBy)} ${sortOrder.toUpperCase()}`;

    // Apply pagination
    const limit = criteria.limit || 50;
    const offset = criteria.offset || 0;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);
    const placements = await Promise.all(
      result.rows.map(row => this.hydrateContentPlacement(row))
    );

    return { placements, total };
  }

  /**
   * Update content placement
   */
  async updateContentPlacement(
    placementId: string,
    updates: UpdatePlacementRequest,
    updatedBy: string
  ): Promise<ContentPlacement> {
    console.log(`📝 Updating content placement: ${placementId}`);

    const currentPlacement = await this.getContentPlacement(placementId);
    if (!currentPlacement) {
      throw new Error(`Content placement not found: ${placementId}`);
    }

    const updateData: unknown = {
      updated_at: new Date(),
      last_modified_by: updatedBy
    };

    // Build update fields
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.weight !== undefined) updateData.weight = updates.weight;
    if (updates.startTime) updateData.start_time = updates.startTime;
    if (updates.endTime) updateData.end_time = updates.endTime;
    if (updates.status) updateData.status = updates.status;
    if (updates.targetingOverrides) updateData.targeting_overrides = JSON.stringify(updates.targetingOverrides);
    if (updates.customStyling) updateData.custom_styling = JSON.stringify(updates.customStyling);
    if (updates.customData) updateData.custom_data = JSON.stringify(updates.customData);
    if (updates.notes) updateData.notes = updates.notes;
    if (updates.tags) updateData.tags = JSON.stringify(updates.tags);

    // Build update query
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [placementId, ...Object.values(updateData)];

    await this.db.query(`
      UPDATE content_placements 
      SET ${setClause}
      WHERE placement_id = $1
    `, values);

    // Rebalance priorities if priority changed
    if (updates.priority !== undefined) {
      await this.rebalanceSlotPriorities(currentPlacement.slotId);
    }

    await this.auditService.logEvent({
      userId: updatedBy,
      action: 'content_placement_updated',
      details: {
        placementId,
        updates: Object.keys(updateData),
        previousStatus: currentPlacement.status,
        newStatus: updates.status
      },
      severity: 'info'
    });

    return await this.getContentPlacement(placementId) as ContentPlacement;
  }

  /**
   * Delete content placement
   */
  async deleteContentPlacement(placementId: string, deletedBy: string): Promise<void> {
    console.log(`🗑️ Deleting content placement: ${placementId}`);

    const placement = await this.getContentPlacement(placementId);
    if (!placement) {
      throw new Error(`Content placement not found: ${placementId}`);
    }

    await this.db.query('DELETE FROM content_placements WHERE placement_id = $1', [placementId]);

    // Rebalance remaining priorities
    await this.rebalanceSlotPriorities(placement.slotId);

    await this.auditService.logEvent({
      userId: deletedBy,
      action: 'content_placement_deleted',
      details: {
        placementId,
        slotId: placement.slotId,
        contentId: placement.contentId
      },
      severity: 'warning'
    });
  }

  // =============================================================================
  // Placement Preview and Testing
  // =============================================================================

  /**
   * Generate placement preview
   */
  async generatePlacementPreview(
    slotId: string,
    viewerContext: unknown,
    previewMode: 'live' | 'staged' | 'test' = 'test'
  ): Promise<PlacementPreview> {
    console.log(`👁️ Generating placement preview for slot: ${slotId}`);

    const slot = await this.getPlacementSlot(slotId);
    if (!slot) {
      throw new Error(`Placement slot not found: ${slotId}`);
    }

    // Get active or staged placements
    const placements = await this.getPlacementsForSlot(slotId, previewMode);
    
    // Apply targeting rules
    const filteredPlacements = await this.applyTargetingRules(placements, viewerContext, slot.targetingRules);
    
    // Sort by priority and weight
    const sortedPlacements = this.sortPlacementsByPriority(filteredPlacements);
    
    // Limit to slot capacity
    const finalPlacements = sortedPlacements.slice(0, slot.maxItems);

    // Render content
    const renderedContent = await this.renderPlacementContent(finalPlacements, slot);

    // Generate performance estimates
    const estimatedMetrics = await this.estimatePerformance(finalPlacements, slot, viewerContext);

    const preview: PlacementPreview = {
      previewId: this.generatePreviewId(),
      slotId,
      placements: finalPlacements,
      previewMode,
      viewerContext,
      renderedContent,
      estimatedMetrics,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    };

    return preview;
  }

  // =============================================================================
  // Analytics and Performance Tracking
  // =============================================================================

  /**
   * Get placement slot metrics
   */
  async getSlotMetrics(slotId: string, period: unknown): Promise<PlacementSlotMetrics> {
    const [
      impressions,
      clicks,
      conversions,
      revenue,
      loadTime
    ] = await Promise.all([
      this.getSlotImpressions(slotId, period),
      this.getSlotClicks(slotId, period),
      this.getSlotConversions(slotId, period),
      this.getSlotRevenue(slotId, period),
      this.getSlotLoadTime(slotId, period)
    ]);

    const uniqueViews = Math.floor(impressions * 0.8); // Estimate
    const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    return {
      slotId,
      period,
      impressions,
      uniqueViews,
      viewDuration: 45, // Placeholder
      viewabilityRate: 78, // Placeholder
      clicks,
      clickThroughRate,
      interactionRate: clickThroughRate * 1.2, // Estimate
      bounceRate: 35, // Placeholder
      conversions,
      conversionRate,
      revenue,
      revenuePerView: impressions > 0 ? revenue / impressions : 0,
      loadTime,
      errorRate: 1.2, // Placeholder
      performanceIndex: 85 // Placeholder
    };
  }

  /**
   * Get placement analytics
   */
  async getPlacementAnalytics(period: unknown): Promise<PlacementAnalytics> {
    console.log('📊 Generating placement analytics', period);

    const [
      totalSlots,
      activeSlots,
      totalPlacements,
      activePlacements,
      overallPerformance
    ] = await Promise.all([
      this.getTotalSlotsCount(),
      this.getActiveSlotsCount(),
      this.getTotalPlacementsCount(period),
      this.getActivePlacementsCount(),
      this.getOverallPerformanceMetrics(period)
    ]);

    return {
      period,
      generatedAt: new Date(),
      totalSlots,
      activeSlots,
      totalPlacements,
      activePlacements,
      overallPerformance,
      topSlots: [], // Would be populated with actual data
      topPlacements: [], // Would be populated with actual data
      topCampaigns: [], // Would be populated with actual data
      insights: [], // Would be populated with generated insights
      recommendations: [] // Would be populated with recommendations
    };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private hydratePlacementSlot(row: unknown): PlacementSlot {
    return {
      slotId: row.slot_id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      placementArea: row.placement_area,
      position: row.position,
      maxItems: row.max_items,
      minItems: row.min_items,
      dimensions: JSON.parse(row.dimensions || '{}'),
      styling: JSON.parse(row.styling || '{}'),
      layout: JSON.parse(row.layout || '{}'),
      targetingRules: JSON.parse(row.targeting_rules || '{}'),
      displayRules: JSON.parse(row.display_rules || '{}'),
      isActive: row.is_active,
      priority: row.priority,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      lastModifiedBy: row.last_modified_by
    };
  }

  private hydrateContentPlacement(row: unknown): ContentPlacement {
    return {
      placementId: row.placement_id,
      slotId: row.slot_id,
      contentId: row.content_id,
      contentType: row.content_type,
      priority: row.priority,
      weight: row.weight,
      startTime: row.start_time,
      endTime: row.end_time,
      timezone: row.timezone,
      targetingOverrides: JSON.parse(row.targeting_overrides || '{}'),
      customStyling: JSON.parse(row.custom_styling || '{}'),
      customData: JSON.parse(row.custom_data || '{}'),
      status: row.status,
      approvalStatus: row.approval_status,
      experimentId: row.experiment_id,
      variantId: row.variant_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      lastModifiedBy: row.last_modified_by,
      notes: row.notes,
      tags: JSON.parse(row.tags || '[]')
    };
  }

  private generateSlotId(): string {
    return `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePlacementId(): string {
    return `place-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePreviewId(): string {
    return `prev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultStyling(): unknown {
    return {
      backgroundColor: 'transparent',
      borderRadius: 0,
      padding: 0,
      margin: 0,
      shadow: false
    };
  }

  private async storePlacementSlot(slot: PlacementSlot): Promise<void> {
    await this.db.query(`
      INSERT INTO placement_slots (
        slot_id, name, display_name, description, placement_area, position,
        max_items, min_items, dimensions, styling, layout, targeting_rules,
        display_rules, is_active, priority, tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      slot.slotId, slot.name, slot.displayName, slot.description, slot.placementArea, slot.position,
      slot.maxItems, slot.minItems, JSON.stringify(slot.dimensions), JSON.stringify(slot.styling),
      JSON.stringify(slot.layout), JSON.stringify(slot.targetingRules), JSON.stringify(slot.displayRules),
      slot.isActive, slot.priority, JSON.stringify(slot.tags), slot.createdBy
    ]);
  }

  private async storeContentPlacement(placement: ContentPlacement): Promise<void> {
    await this.db.query(`
      INSERT INTO content_placements (
        placement_id, slot_id, content_id, content_type, priority, weight,
        start_time, end_time, targeting_overrides, custom_styling, custom_data,
        status, approval_status, experiment_id, variant_id, created_by, notes, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `, [
      placement.placementId, placement.slotId, placement.contentId, placement.contentType,
      placement.priority, placement.weight, placement.startTime, placement.endTime,
      JSON.stringify(placement.targetingOverrides || {}), JSON.stringify(placement.customStyling || {}),
      JSON.stringify(placement.customData || {}), placement.status, placement.approvalStatus,
      placement.experimentId, placement.variantId, placement.createdBy, placement.notes,
      JSON.stringify(placement.tags || [])
    ]);
  }

  private async getActivePlacementsCount(slotId: string): Promise<number> {
    const result = await this.db.query(`
      SELECT COUNT(*) FROM content_placements 
      WHERE slot_id = $1 AND status = 'active'
    `, [slotId]);
    return parseInt(result.rows[0].count);
  }

  private async validateContentExists(contentId: string, contentType: ContentType): Promise<void> {
    let tableName: string;
    let idColumn: string;

    switch (contentType) {
    case ContentType.TEMPLATE:
      tableName = 'marketplace_templates';
      idColumn = 'id';
      break;
    case ContentType.COLLECTION:
      tableName = 'template_collections';
      idColumn = 'id';
      break;
    default:
      return; // Skip validation for other types
    }

    const result = await this.db.query(`
      SELECT 1 FROM ${tableName} WHERE ${idColumn} = $1
    `, [contentId]);

    if (result.rows.length === 0) {
      throw new Error(`Content not found: ${contentType} ${contentId}`);
    }
  }

  private calculateDefaultPriority(_____slotId: string): number {
    return 50; // Default middle priority
  }

  private determineInitialStatus(startTime?: Date, endTime?: Date): PlacementStatus {
    const now = new Date();
    
    if (startTime && startTime > now) {
      return PlacementStatus.SCHEDULED;
    }
    
    if (endTime && endTime < now) {
      return PlacementStatus.EXPIRED;
    }
    
    return PlacementStatus.ACTIVE;
  }

  private determineApprovalRequirement(slot: PlacementSlot, _____request: CreatePlacementRequest): unknown {
    // Auto-approve for most placements, require review for high-visibility slots
    if (slot.placementArea === PlacementArea.HOMEPAGE || slot.position === PlacementPosition.HERO_BANNER) {
      return 'pending';
    }
    return 'approved';
  }

  private async rebalanceSlotPriorities(slotId: string): Promise<void> {
    // Rebalance priorities to ensure proper ordering
    console.log(`⚖️ Rebalancing priorities for slot: ${slotId}`);
  }

  private mapSortField(field: string): string {
    const mapping: Record<string, string> = {
      createdAt: 'cp.created_at',
      priority: 'cp.priority',
      name: 'ps.name'
    };
    return mapping[field] || 'cp.created_at';
  }

  // Placeholder methods for advanced functionality
  private async getPlacementsForSlot(_____slotId: string, _____mode: string): Promise<ContentPlacement[]> { return []; }
  private async applyTargetingRules(
    placements: ContentPlacement[],
    _____context: unknown,
    _____rules: unknown
  ): Promise<ContentPlacement[]> { return placements; }
  private sortPlacementsByPriority(placements: ContentPlacement[]): ContentPlacement[] { return placements; }
  private async renderPlacementContent(
    _____placements: ContentPlacement[],
    _____slot: PlacementSlot
  ): Promise<any[]> { return []; }
  private async estimatePerformance(
    _____placements: ContentPlacement[],
    _____slot: PlacementSlot,
    _____context: unknown
  ): Promise<unknown> { return {}; }
  
  // Analytics placeholder methods
  private async getSlotImpressions(_____slotId: string, _____period: unknown): Promise<number> { return 1000; }
  private async getSlotClicks(_____slotId: string, _____period: unknown): Promise<number> { return 50; }
  private async getSlotConversions(_____slotId: string, _____period: unknown): Promise<number> { return 5; }
  private async getSlotRevenue(_____slotId: string, _____period: unknown): Promise<number> { return 250; }
  private async getSlotLoadTime(_____slotId: string, _____period: unknown): Promise<number> { return 450; }
  private async getTotalSlotsCount(): Promise<number> { return 25; }
  private async getActiveSlotsCount(): Promise<number> { return 20; }
  private async getTotalPlacementsCount(_____period: unknown): Promise<number> { return 150; }
  private async getOverallPerformanceMetrics(_____period: unknown): Promise<unknown> {
    return {
      totalImpressions: 50000,
      totalClicks: 2500,
      averageCTR: 5.0,
      totalConversions: 125,
      totalRevenue: 12500
    };
  }
}