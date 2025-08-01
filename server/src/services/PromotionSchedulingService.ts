/**
 * Promotion Scheduling Service - Epic 17.5.2
 * 
 * Manages featured content promotion scheduling, rotation, and performance tracking.
 * Builds on Epic 17.1.5 scheduling infrastructure and marketplace analytics.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../auth/services/AuditService';
import { SchedulingService } from './scheduling-service';

// Core promotion types
export type PromotionType = 
  'FEATURED_HOMEPAGE' | 'CATEGORY_SPOTLIGHT' | 'TRENDING_CAROUSEL' | 
  'EDITOR_CHOICE' | 'NEW_ARRIVALS' | 'SEASONAL_PROMOTION' | 'A_B_TEST_VARIANT';

export type PromotionStatus = 
  'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';

export type SelectionStrategy = 
  'MANUAL' | 'PERFORMANCE_BASED' | 'ALGORITHMIC' | 'HYBRID';

export type RotationPattern = 
  'FIXED_DURATION' | 'PERFORMANCE_THRESHOLD' | 'EQUAL_TIME' | 'WEIGHTED_ROTATION';

// Core interfaces



export interface PromotionSlot {
  id: string;
  name: string;
  type: PromotionType;
  location: string; // Homepage, Category page, etc.
  maxConcurrentPromotions: number;
  traffic_allocation: number; // Percentage of traffic
  priority: number;
  metadata: {



    dimensions?: { width: number; height: number };
    position?: string;
    styling?: Record<string, any>;
  };
  enabled: boolean;
  created_at: Date;
  updated_at: Date;




export interface PromotionSchedule {
  id: string;
  title: string;
  description: string;
  promotion_type: PromotionType;
  slot_id: string;
  status: PromotionStatus;
  
  // Content selection
  selection_strategy: SelectionStrategy;
  content_criteria: ContentCriteria;
  selected_content_ids: string[];
  
  // Scheduling
  start_date: Date;
  end_date: Date;
  timezone: string;
  rotation_pattern: RotationPattern;
  rotation_config: RotationConfig;
  
  // Performance tracking
  target_metrics: TargetMetrics;
  actual_metrics?: ActualMetrics;
  
  // A/B Testing
  ab_test_config?: ABTestConfig;
  
  // Management
  created_by: string;
  created_at: Date;
  updated_at: Date;
  approved_by?: string;
  approved_at?: Date;
  
  metadata: Record<string, any>;







export interface ContentCriteria {
  // Quality filters
  min_rating?: number;
  min_download_count?: number;
  quality_score_threshold?: number;
  
  // Category filters
  categories?: string[];
  tags?: string[];
  exclude_categories?: string[];
  
  // Time-based filters
  published_after?: Date;
  last_updated_after?: Date;
  
  // Creator filters
  creator_ids?: string[];
  creator_tiers?: string[];
  
  // Performance filters
  min_conversion_rate?: number;
  min_engagement_score?: number;
  
  // Content attributes
  content_types?: string[];
  languages?: string[];
  
  // Exclusions
  exclude_content_ids?: string[];
  exclude_recently_promoted?: boolean;
  exclude_current_promotions?: boolean;
  
  // Limits
  max_content_count?: number;
  diversification_rules?: DiversificationRule[];







export interface DiversificationRule {
  attribute: string; // 'category', 'creator', 'content_type'
  max_percentage: number; // Maximum percentage from same attribute
  enforce_uniqueness: boolean;







export interface RotationConfig {
  // Fixed duration rotation
  duration_per_content?: number; // minutes
  
  // Performance threshold rotation
  click_threshold?: number;
  conversion_threshold?: number;
  time_threshold?: number; // minimum time before rotation
  
  // Equal time rotation
  equal_time_duration?: number;
  
  // Weighted rotation
  weight_criteria?: WeightCriteria;
  
  // General settings
  randomize_order: boolean;
  allow_repeat: boolean;
  cooldown_period?: number; // hours before content can be promoted again







export interface WeightCriteria {
  performance_weight: number; // 0-1
  recency_weight: number;
  diversity_weight: number;
  creator_tier_weight: number;
  custom_weights?: Record<string, number>;







export interface TargetMetrics {
  target_impressions?: number;
  target_clicks?: number;
  target_conversions?: number;
  target_revenue?: number;
  target_ctr?: number; // Click-through rate
  target_conversion_rate?: number;
  min_engagement_time?: number; // seconds







export interface ActualMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
  engagement_time: number;
  bounce_rate: number;
  last_updated: Date;







export interface ABTestConfig {
  test_name: string;
  variants: ABTestVariant[];
  traffic_split: number[]; // Percentage for each variant
  success_metric: 'ctr' | 'conversion_rate' | 'revenue' | 'engagement';
  confidence_level: number; // 0.90, 0.95, 0.99
  minimum_sample_size: number;
  test_duration_days: number;
  early_stopping_enabled: boolean;







export interface ABTestVariant {
  id: string;
  name: string;
  content_ids: string[];
  config_overrides?: Partial<RotationConfig>;
  target_metrics?: Partial<TargetMetrics>;







export interface PromotionPerformanceReport {
  promotion_id: string;
  time_period: {
    start: Date;
    end: Date;



  };
  overall_performance: ActualMetrics;
  content_performance: ContentPerformanceMetrics[];
  slot_performance: SlotPerformanceMetrics;
  comparison_metrics?: ComparisonMetrics;
  insights: PerformanceInsight[];
  recommendations: PromotionRecommendation[];




export interface ContentPerformanceMetrics {
  content_id: string;
  content_title: string;
  time_promoted: number; // minutes
  metrics: ActualMetrics;
  performance_score: number; // 0-100
  rotation_efficiency: number;







export interface SlotPerformanceMetrics {
  slot_id: string;
  slot_name: string;
  total_impressions: number;
  average_ctr: number;
  conversion_rate: number;
  revenue_per_impression: number;
  utilization_rate: number; // Percentage of time slot was active







export interface ComparisonMetrics {
  vs_previous_promotion?: MetricComparison;
  vs_baseline?: MetricComparison;
  vs_target?: MetricComparison;







export interface MetricComparison {
  metric_name: string;
  current_value: number;
  comparison_value: number;
  percentage_change: number;
  is_improvement: boolean;







export interface PerformanceInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact_score: number; // 0-100
  confidence: number; // 0-1
  supporting_data: Record<string, any>;







export interface PromotionRecommendation {
  type: 'optimization' | 'content_selection' | 'scheduling' | 'rotation' | 'budget';
  title: string;
  description: string;
  expected_impact: string;
  effort_level: 'low' | 'medium' | 'high';
  priority_score: number; // 0-100
  implementation_steps: string[];





@Injectable()
export class PromotionSchedulingService {
  private readonly logger = new Logger(PromotionSchedulingService.name);

  constructor(
    private pool: Pool,
    private auditService: AuditService,
    private schedulingService: SchedulingService
  ) {}

  /**
   * Create a new promotion schedule
   */
  async createPromotionSchedule(
    scheduleData: Omit<PromotionSchedule, 'id' | 'created_at' | 'updated_at'>,
    createdBy: string
  ): Promise<PromotionSchedule> {

    const scheduleId = uuidv4();
    
    // Validate slot availability
    await this.validateSlotAvailability(scheduleData.slot_id, scheduleData.start_date, scheduleData.end_date);
    
    // Select content based on criteria if using automatic selection
    let selectedContentIds = scheduleData.selected_content_ids;
    if (scheduleData.selection_strategy !== 'MANUAL') {
      selectedContentIds = await this.selectContent(scheduleData.content_criteria);

    
    const schedule: PromotionSchedule = {
      ...scheduleData,
      id: scheduleId,
      selected_content_ids: selectedContentIds,
      created_by: createdBy,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Store in database
    await this.storePromotionSchedule(schedule);

    // Create underlying system schedule for execution
    await this.createSystemSchedule(schedule);

    await this.auditService.logEvent({
      userId: createdBy,
      action: 'PROMOTION_SCHEDULE_CREATED',
      resource: `promotion:${scheduleId}`,
      metadata: {
        promotion_type: schedule.promotion_type,
        slot_id: schedule.slot_id,
        content_count: schedule.selected_content_ids.length

    });

    this.logger.log(`Promotion schedule created: ${scheduleId}`);
    return schedule;


  /**
   * Update promotion schedule
   */
  async updatePromotionSchedule(
    scheduleId: string,
    updates: Partial<PromotionSchedule>,
    updatedBy: string
  ): Promise<PromotionSchedule> {

    const existingSchedule = await this.getPromotionSchedule(scheduleId);
    if (!existingSchedule) {
      throw new NotFoundException(`Promotion schedule ${scheduleId} not found`);


    // Validate changes if schedule is active
    if (existingSchedule.status === 'ACTIVE') {
      await this.validateActiveScheduleUpdates(updates);


    const updatedSchedule: PromotionSchedule = {
      ...existingSchedule,
      ...updates,
      updated_at: new Date()
    };

    await this.storePromotionSchedule(updatedSchedule);

    // Update system schedule if timing changed
    if (updates.start_date || updates.end_date || updates.rotation_config) {
      await this.updateSystemSchedule(updatedSchedule);


    await this.auditService.logEvent({
      userId: updatedBy,
      action: 'PROMOTION_SCHEDULE_UPDATED',
      resource: `promotion:${scheduleId}`,
      metadata: updates
    });

    return updatedSchedule;


  /**
   * Get promotion schedule with performance data
   */
  async getPromotionSchedule(scheduleId: string): Promise<PromotionSchedule | null> {

    const query = `
      SELECT * FROM promotion_schedules WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [scheduleId]);
    return result.rows[0] ? this.mapRowToSchedule(result.rows[0]) : null;


  /**
   * Get all promotion schedules with filtering
   */
  async getPromotionSchedules(filters: {
    status?: PromotionStatus;
    promotion_type?: PromotionType;
    slot_id?: string;
    created_by?: string;
    start_date_after?: Date;
    end_date_before?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ schedules: PromotionSchedule[]; total: number }> {

    let query = `
      SELECT ps.*, psl.name as slot_name, psl.location as slot_location
      FROM promotion_schedules ps
      LEFT JOIN promotion_slots psl ON psl.id = ps.slot_id
      WHERE 1=1
    `;
    
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND ps.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;


    if (filters.promotion_type) {
      query += ` AND ps.promotion_type = $${paramIndex}`;
      params.push(filters.promotion_type);
      paramIndex++;


    if (filters.slot_id) {
      query += ` AND ps.slot_id = $${paramIndex}`;
      params.push(filters.slot_id);
      paramIndex++;


    if (filters.start_date_after) {
      query += ` AND ps.start_date >= $${paramIndex}`;
      params.push(filters.start_date_after);
      paramIndex++;


    // Add pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query += ` ORDER BY ps.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(`SELECT COUNT(*) FROM promotion_schedules ps WHERE 1=1 ${this.buildWhereClause(filters)}`, 
        params.slice(0, -2)) // Exclude LIMIT/OFFSET params for count
    ]);

    return {
      schedules: dataResult.rows.map(row => this.mapRowToSchedule(row)),
      total: parseInt(countResult.rows[0].count)
    };


  /**
   * Select content based on criteria using intelligent algorithms
   */
  async selectContent(criteria: ContentCriteria): Promise<string[]> {

    let query = `
      SELECT DISTINCT t.id, t.title, t.category, t.creator_id,
             COALESCE(ta.avg_rating, 0) as rating,
             COALESCE(ta.download_count, 0) as downloads,
             COALESCE(ta.conversion_rate, 0) as conversion_rate,
             COALESCE(ta.engagement_score, 0) as engagement_score,
             t.created_at, t.updated_at
      FROM marketplace_templates t
      LEFT JOIN template_analytics ta ON ta.template_id = t.id
      WHERE t.status = 'active' AND t.is_published = true
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    // Apply filters
    if (criteria.min_rating) {
      query += ` AND COALESCE(ta.avg_rating, 0) >= $${paramIndex}`;
      params.push(criteria.min_rating);
      paramIndex++;


    if (criteria.min_download_count) {
      query += ` AND COALESCE(ta.download_count, 0) >= $${paramIndex}`;
      params.push(criteria.min_download_count);
      paramIndex++;


    if (criteria.categories && criteria.categories.length > 0) {
      query += ` AND t.category = ANY($${paramIndex})`;
      params.push(criteria.categories);
      paramIndex++;


    if (criteria.exclude_recently_promoted) {
      query += ` AND t.id NOT IN (
        SELECT DISTINCT content_id 
        FROM promotion_schedule_content psc
        JOIN promotion_schedules ps ON ps.id = psc.schedule_id
        WHERE ps.end_date >= NOW() - INTERVAL '7 days'
      )`;


    // Add performance-based ordering
    query += ` 
      ORDER BY 
        (COALESCE(ta.conversion_rate, 0) * 0.4 + 
         COALESCE(ta.engagement_score, 0) * 0.3 + 
         COALESCE(ta.avg_rating, 0) * 0.2 + 
         (CASE WHEN t.updated_at > NOW() - INTERVAL '30 days' THEN 0.1 ELSE 0 END)) DESC
      LIMIT $${paramIndex}
    `;
    params.push(criteria.max_content_count || 10);

    const result = await this.pool.query(query, params);
    
    // Apply diversification rules
    const selectedContent = this.applyDiversificationRules(result.rows, criteria.diversification_rules || []);
    
    return selectedContent.map(content => content.id);


  /**
   * Get performance report for a promotion
   */
  async getPromotionPerformanceReport(
    scheduleId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PromotionPerformanceReport> {

    const schedule = await this.getPromotionSchedule(scheduleId);
    if (!schedule) {
      throw new NotFoundException(`Promotion schedule ${scheduleId} not found`);


    const reportStartDate = startDate || schedule.start_date;
    const reportEndDate = endDate || schedule.end_date;

    // Get overall metrics
    const overallMetrics = await this.getPromotionMetrics(scheduleId, reportStartDate, reportEndDate);
    
    // Get content-level performance
    const contentPerformance = await this.getContentPerformanceMetrics(scheduleId, reportStartDate, reportEndDate);
    
    // Get slot performance
    const slotPerformance = await this.getSlotPerformanceMetrics(schedule.slot_id, reportStartDate, reportEndDate);
    
    // Generate insights and recommendations
    const insights = await this.generatePerformanceInsights(schedule, overallMetrics, contentPerformance);
    const recommendations = await this.generateRecommendations(schedule, overallMetrics, insights);

    return {
      promotion_id: scheduleId,
      time_period: {
        start: reportStartDate,
        end: reportEndDate

      overall_performance: overallMetrics,
      content_performance: contentPerformance,
      slot_performance: slotPerformance,
      insights,
      recommendations
    };


  // Private helper methods

  private async validateSlotAvailability(
    slotId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<void> {

    const query = `
      SELECT COUNT(*) as conflicts
      FROM promotion_schedules
      WHERE slot_id = $1 
        AND status IN ('SCHEDULED', 'ACTIVE')
        AND (
          (start_date <= $2 AND end_date >= $2) OR
          (start_date <= $3 AND end_date >= $3) OR
          (start_date >= $2 AND end_date <= $3)

    `;

    const result = await this.pool.query(query, [slotId, startDate, endDate]);
    
    if (parseInt(result.rows[0].conflicts) > 0) {
      throw new BadRequestException(`Slot ${slotId} has conflicting promotions in the specified time range`);



  private async createSystemSchedule(schedule: PromotionSchedule): Promise<void> {

    // Create schedule in the underlying scheduling system
    await this.schedulingService.createSchedule({
      name: `Promotion: ${schedule.title}`,
      description: `Automated promotion schedule for ${schedule.promotion_type}`,
      feature_flag_key: `promotion_${schedule.id}`,
      action_type: 'enable',
      start_time: schedule.start_date,
      end_time: schedule.end_date,
      timezone: schedule.timezone,
      recurrence_pattern: this.convertToRecurrencePattern(schedule.rotation_config),
      created_by: schedule.created_by,
      metadata: {
        promotion_id: schedule.id,
        promotion_type: schedule.promotion_type,
        slot_id: schedule.slot_id

    });


  private applyDiversificationRules(
    content: unknown[], 
    rules: DiversificationRule[]
  ): unknown[] {
    if (!rules.length) return content;

    const result = [...content];
    
    for (const rule of rules) {
      const attributeCounts = new Map<string, number>();
      const totalCount = result.length;
      
      // Count occurrences of each attribute value
      for (const item of result) {
        const attrValue = item[rule.attribute];
        if (attrValue) {
          attributeCounts.set(attrValue, (attributeCounts.get(attrValue) || 0) + 1);


      
      // Remove excess items that violate the percentage rule
      const maxAllowed = Math.floor((rule.max_percentage / 100) * totalCount);
      
      for (const [attrValue, count] of attributeCounts) {
        if (count > maxAllowed) {
          const excess = count - maxAllowed;
          let removed = 0;
          
          for (let i = result.length - 1; i >= 0 && removed < excess; i--) {
            if (result[i][rule.attribute] === attrValue) {
              result.splice(i, 1);
              removed++;





    
    return result;


  private async storePromotionSchedule(schedule: PromotionSchedule): Promise<void> {

    const query = `
      INSERT INTO promotion_schedules (
        id, title, description, promotion_type, slot_id, status,
        selection_strategy, content_criteria, selected_content_ids,
        start_date, end_date, timezone, rotation_pattern, rotation_config,
        target_metrics, ab_test_config, created_by, created_at, updated_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        selected_content_ids = EXCLUDED.selected_content_ids,
        rotation_config = EXCLUDED.rotation_config,
        updated_at = EXCLUDED.updated_at
    `;

    await this.pool.query(query, [
      schedule.id,
      schedule.title,
      schedule.description,
      schedule.promotion_type,
      schedule.slot_id,
      schedule.status,
      schedule.selection_strategy,
      JSON.stringify(schedule.content_criteria),
      JSON.stringify(schedule.selected_content_ids),
      schedule.start_date,
      schedule.end_date,
      schedule.timezone,
      schedule.rotation_pattern,
      JSON.stringify(schedule.rotation_config),
      JSON.stringify(schedule.target_metrics),
      schedule.ab_test_config ? JSON.stringify(schedule.ab_test_config) : null,
      schedule.created_by,
      schedule.created_at,
      schedule.updated_at,
      JSON.stringify(schedule.metadata)
    ]);


  private mapRowToSchedule(row: unknown): PromotionSchedule {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      promotion_type: row.promotion_type,
      slot_id: row.slot_id,
      status: row.status,
      selection_strategy: row.selection_strategy,
      content_criteria: JSON.parse(row.content_criteria || '{}'),
      selected_content_ids: JSON.parse(row.selected_content_ids || '[]'),
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      timezone: row.timezone,
      rotation_pattern: row.rotation_pattern,
      rotation_config: JSON.parse(row.rotation_config || '{}'),
      target_metrics: JSON.parse(row.target_metrics || '{}'),
      actual_metrics: row.actual_metrics ? JSON.parse(row.actual_metrics) : undefined,
      ab_test_config: row.ab_test_config ? JSON.parse(row.ab_test_config) : undefined,
      created_by: row.created_by,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      approved_by: row.approved_by,
      approved_at: row.approved_at ? new Date(row.approved_at) : undefined,
      metadata: JSON.parse(row.metadata || '{}')
    };


  // Additional helper methods would be implemented here for:
  // - validateActiveScheduleUpdates()
  // - updateSystemSchedule()
  // - getPromotionMetrics()
  // - getContentPerformanceMetrics()
  // - getSlotPerformanceMetrics()
  // - generatePerformanceInsights()
  // - generateRecommendations()
  // - convertToRecurrencePattern()
  // - buildWhereClause()
