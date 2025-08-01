/**
 * Promotion Controller - Epic 17.5.2
 * 
 * REST API controller for promotion scheduling and preview functionality.
 * Integrates with PromotionSchedulingService and marketplace analytics.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException
 from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam
 from '@nestjs/swagger';
import { AdminAuthGuard } from '../guards/AdminAuthGuard';
import { RequirePermissions } from '../decorators/RequirePermissions';
import { PromotionSchedulingService } from '../../services/PromotionSchedulingService';
import { AuditService } from '../../auth/services/AuditService';

// Request/Response DTOs



export interface CreatePromotionRequest {
  title: string;
  description?: string;
  promotion_type: string;
  slot_id: string;
  selection_strategy: 'MANUAL' | 'PERFORMANCE_BASED' | 'ALGORITHMIC' | 'HYBRID';
  content_criteria?: any;
  selected_content_ids?: string[];
  start_date: string;
  end_date: string;
  timezone?: string;
  rotation_pattern: string;
  rotation_config: any;
  target_metrics?: any;
  ab_test_config?: any;







export interface UpdatePromotionRequest {
  title?: string;
  description?: string;
  status?: string;
  rotation_config?: any;
  target_metrics?: any;
  end_date?: string;







export interface PromotionPreviewRequest {
  content_ids: string[];
  slot_id: string;
  rotation_config?: any;
  ab_test_config?: any;







export interface PromotionPreviewResponse {
  schedule: {
    id: string;
    title: string;
    promotion_type: string;
    slot: any;
    start_date: Date;
    end_date: Date;
    status: string;



  };
  content: Array<{
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    rating: number;
    downloads: number;
    performance_score: number;
>;
  rotation_config: any;
  predicted_performance: {
    estimated_impressions: number;
    estimated_ctr: number;
    estimated_conversions: number;
    estimated_revenue: number;
    confidence_level: number;
  };
  ab_test_config?: any;




export interface PromotionDashboard {
  active_promotions: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  average_ctr: number;
  top_performing_slots: any[];
  recent_promotions: any[];
  performance_trends: any[];





@ApiTags('admin/promotions')
@ApiBearerAuth()
@Controller('admin/promotions')
@UseGuards(AdminAuthGuard)
export class PromotionController {
  private readonly logger = new Logger(PromotionController.name);

  constructor(
    private readonly promotionService: PromotionSchedulingService,
    private readonly auditService: AuditService
  ) {}

  // Dashboard and Analytics

  @Get('dashboard')
  @ApiOperation({ summary: 'Get promotion management dashboard data' })
  @RequirePermissions(['admin:promotion:read'])
  async getDashboard(): Promise<PromotionDashboard> {

    const [activePromotions, performanceMetrics, slots] = await Promise.all([
      this.promotionService.getPromotionSchedules({ status: 'ACTIVE' }),
      this.getOverallPerformanceMetrics(),
      this.promotionService.getPromotionSlots()
    ]);

    const topPerformingSlots = slots.slice(0, 5).map(slot => ({
      ...slot,
      performance: performanceMetrics[slot.id] || {}
    }));

    return {
      active_promotions: activePromotions.schedules.length,
      total_impressions: performanceMetrics.total_impressions || 0,
      total_clicks: performanceMetrics.total_clicks || 0,
      total_conversions: performanceMetrics.total_conversions || 0,
      average_ctr: performanceMetrics.average_ctr || 0,
      top_performing_slots: topPerformingSlots,
      recent_promotions: activePromotions.schedules.slice(0, 10),
      performance_trends: performanceMetrics.trends || []
    };


  // Promotion Slots Management

  @Get('slots')
  @ApiOperation({ summary: 'Get all promotion slots' })
  @RequirePermissions(['admin:promotion:read'])
  async getPromotionSlots() {
    return this.promotionService.getPromotionSlots();


  @Get('slots/:id')
  @ApiOperation({ summary: 'Get specific promotion slot' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  @RequirePermissions(['admin:promotion:read'])
  async getPromotionSlot(@Param('id') slotId: string) {
    const slot = await this.promotionService.getPromotionSlot(slotId);
    if (!slot) {
      throw new NotFoundException(`Promotion slot ${slotId} not found`);

    return slot;


  // Promotion Schedules Management

  @Get('schedules')
  @ApiOperation({ summary: 'Get promotion schedules with filtering' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'promotion_type', required: false })
  @ApiQuery({ name: 'slot_id', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @RequirePermissions(['admin:promotion:read'])
  async getPromotionSchedules(
    @Query('status') status?: string,
    @Query('promotion_type') promotionType?: string,
    @Query('slot_id') slotId?: string,
    @Query('created_by') createdBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.promotionService.getPromotionSchedules({
      status: status as any,
      promotion_type: promotionType as any,
      slot_id: slotId,
      created_by: createdBy,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });


  @Get('schedules/:id')
  @ApiOperation({ summary: 'Get specific promotion schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @RequirePermissions(['admin:promotion:read'])
  async getPromotionSchedule(@Param('id') scheduleId: string) {
    const schedule = await this.promotionService.getPromotionSchedule(scheduleId);
    if (!schedule) {
      throw new NotFoundException(`Promotion schedule ${scheduleId} not found`);

    return schedule;


  @Post('schedules')
  @ApiOperation({ summary: 'Create new promotion schedule' })
  @RequirePermissions(['admin:promotion:create'])
  async createPromotionSchedule(
    @Body() request: CreatePromotionRequest,
    @Query('user_id') userId: string
  ) {
    // Validate required fields
    if (!request.title || !request.slot_id || !request.start_date || !request.end_date) {
      throw new BadRequestException('Missing required fields: title, slot_id, start_date, end_date');


    const schedule = await this.promotionService.createPromotionSchedule(
      {
        ...request,
        start_date: new Date(request.start_date),
        end_date: new Date(request.end_date),
        timezone: request.timezone || 'UTC',
        status: 'DRAFT',
        created_by: userId,
        metadata: {}

      userId
    );

    this.logger.log(`Promotion schedule created: ${schedule.id} by ${userId}`);
    return schedule;


  @Put('schedules/:id')
  @ApiOperation({ summary: 'Update promotion schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @RequirePermissions(['admin:promotion:update'])
  async updatePromotionSchedule(
    @Param('id') scheduleId: string,
    @Body() request: UpdatePromotionRequest,
    @Query('user_id') userId: string
  ) {
    const updates: any = { ...request };
    if (request.end_date) {
      updates.end_date = new Date(request.end_date);


    const schedule = await this.promotionService.updatePromotionSchedule(
      scheduleId,
      updates,
      userId
    );

    return schedule;


  @Delete('schedules/:id')
  @ApiOperation({ summary: 'Delete promotion schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @RequirePermissions(['admin:promotion:delete'])
  async deletePromotionSchedule(
    @Param('id') scheduleId: string,
    @Query('user_id') userId: string
  ) {
    await this.promotionService.deletePromotionSchedule(scheduleId, userId);
    
    await this.auditService.logEvent({
      userId,
      action: 'PROMOTION_SCHEDULE_DELETED',
      resource: `promotion:${scheduleId}`,
      metadata: {}
    });

    return { success: true };


  // Promotion Control Actions

  @Post('schedules/:id/start')
  @ApiOperation({ summary: 'Start promotion schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @RequirePermissions(['admin:promotion:control'])
  async startPromotionSchedule(
    @Param('id') scheduleId: string,
    @Query('user_id') userId: string
  ) {
    const schedule = await this.promotionService.updatePromotionSchedule(
      scheduleId,
      { status: 'ACTIVE' },
      userId
    );

    await this.auditService.logEvent({
      userId,
      action: 'PROMOTION_STARTED',
      resource: `promotion:${scheduleId}`,
      metadata: { previous_status: 'SCHEDULED' }
    });

    return schedule;


  @Post('schedules/:id/pause')
  @ApiOperation({ summary: 'Pause promotion schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @RequirePermissions(['admin:promotion:control'])
  async pausePromotionSchedule(
    @Param('id') scheduleId: string,
    @Query('user_id') userId: string
  ) {
    const schedule = await this.promotionService.updatePromotionSchedule(
      scheduleId,
      { status: 'PAUSED' },
      userId
    );

    await this.auditService.logEvent({
      userId,
      action: 'PROMOTION_PAUSED',
      resource: `promotion:${scheduleId}`,
      metadata: { previous_status: 'ACTIVE' }
    });

    return schedule;


  @Post('schedules/:id/stop')
  @ApiOperation({ summary: 'Stop promotion schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @RequirePermissions(['admin:promotion:control'])
  async stopPromotionSchedule(
    @Param('id') scheduleId: string,
    @Query('user_id') userId: string
  ) {
    const schedule = await this.promotionService.updatePromotionSchedule(
      scheduleId,
      { status: 'COMPLETED' },
      userId
    );

    await this.auditService.logEvent({
      userId,
      action: 'PROMOTION_STOPPED',
      resource: `promotion:${scheduleId}`,
      metadata: { completed_early: true }
    });

    return schedule;


  // Content Selection and Preview

  @Post('content/select')
  @ApiOperation({ summary: 'Select content based on criteria' })
  @RequirePermissions(['admin:promotion:create'])
  async selectContent(
    @Body() criteria: any,
    @Query('user_id') userId: string
  ) {
    const contentIds = await this.promotionService.selectContent(criteria);
    
    // Get full content details for the selected IDs
    const contentDetails = await this.getContentDetails(contentIds);

    return {
      selected_content_ids: contentIds,
      content_details: contentDetails,
      selection_criteria: criteria
    };


  @Post('preview')
  @ApiOperation({ summary: 'Preview promotion before scheduling' })
  @RequirePermissions(['admin:promotion:read'])
  async previewPromotion(
    @Body() request: PromotionPreviewRequest,
    @Query('user_id') userId: string
  ): Promise<PromotionPreviewResponse> {

    // Get slot details
    const slot = await this.promotionService.getPromotionSlot(request.slot_id);
    if (!slot) {
      throw new BadRequestException(`Invalid slot ID: ${request.slot_id}`);


    // Get content details
    const contentDetails = await this.getContentDetails(request.content_ids);

    // Generate performance predictions
    const predictedPerformance = await this.predictPromotionPerformance(
      request.content_ids,
      request.slot_id,
      request.rotation_config
    );

    return {
      schedule: {
        id: 'preview',
        title: 'Preview Promotion',
        promotion_type: slot.type,
        slot,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        status: 'PREVIEW'

      content: contentDetails,
      rotation_config: request.rotation_config || {},
      predicted_performance: predictedPerformance,
      ab_test_config: request.ab_test_config
    };


  // Performance and Analytics

  @Get('schedules/:id/performance')
  @ApiOperation({ summary: 'Get promotion performance report' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @RequirePermissions(['admin:promotion:read'])
  async getPromotionPerformance(
    @Param('id') scheduleId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ) {
    return this.promotionService.getPromotionPerformanceReport(
      scheduleId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );


  @Get('analytics/performance-trends')
  @ApiOperation({ summary: 'Get promotion performance trends' })
  @ApiQuery({ name: 'period', required: false })
  @RequirePermissions(['admin:promotion:read'])
  async getPerformanceTrends(@Query('period') period = '30d') {
    return this.getPromotionTrends(period);


  @Get('analytics/slot-utilization')
  @ApiOperation({ summary: 'Get slot utilization analytics' })
  @RequirePermissions(['admin:promotion:read'])
  async getSlotUtilization() {
    return this.getSlotUtilizationMetrics();


  // Templates

  @Get('templates')
  @ApiOperation({ summary: 'Get promotion templates' })
  @RequirePermissions(['admin:promotion:read'])
  async getPromotionTemplates() {
    return this.promotionService.getPromotionTemplates();


  @Post('templates')
  @ApiOperation({ summary: 'Create promotion template' })
  @RequirePermissions(['admin:promotion:create'])
  async createPromotionTemplate(
    @Body() templateData: any,
    @Query('user_id') userId: string
  ) {
    return this.promotionService.createPromotionTemplate(templateData, userId);


  // Bulk Operations

  @Post('schedules/bulk/start')
  @ApiOperation({ summary: 'Start multiple promotion schedules' })
  @RequirePermissions(['admin:promotion:bulk'])
  async bulkStartPromotions(
    @Body('schedule_ids') scheduleIds: string[],
    @Query('user_id') userId: string
  ) {
    const results = await Promise.allSettled(
      scheduleIds.map(id => this.promotionService.updatePromotionSchedule(id, { status: 'ACTIVE' }, userId))
    );

    await this.auditService.logEvent({
      userId,
      action: 'PROMOTIONS_BULK_STARTED',
      resource: 'promotions:bulk',
      metadata: { schedule_ids: scheduleIds, count: scheduleIds.length }
    });

    return {
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };


  @Post('schedules/bulk/pause')
  @ApiOperation({ summary: 'Pause multiple promotion schedules' })
  @RequirePermissions(['admin:promotion:bulk'])
  async bulkPausePromotions(
    @Body('schedule_ids') scheduleIds: string[],
    @Query('user_id') userId: string
  ) {
    const results = await Promise.allSettled(
      scheduleIds.map(id => this.promotionService.updatePromotionSchedule(id, { status: 'PAUSED' }, userId))
    );

    await this.auditService.logEvent({
      userId,
      action: 'PROMOTIONS_BULK_PAUSED',
      resource: 'promotions:bulk',
      metadata: { schedule_ids: scheduleIds, count: scheduleIds.length }
    });

    return {
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };


  // Helper methods

  private async getContentDetails(contentIds: string[]): Promise<any[]> {

    // Mock implementation - would integrate with actual content service
    return contentIds.map(id => ({
      id,
      title: `Template ${id.slice(-4)}`,
      category: 'Video Editing',
      thumbnail: '/api/placeholder/200/150',
      rating: 4.2 + Math.random() * 0.8,
      downloads: Math.floor(Math.random() * 1000) + 100,
      performance_score: Math.floor(Math.random() * 30) + 70
    }));


  private async predictPromotionPerformance(
    contentIds: string[],
    slotId: string,
    rotationConfig?: any
  ): Promise<any> {

    // Mock performance prediction - would use ML models in production
    const baseImpressions = 10000;
    const baseCtr = 2.5;
    
    return {
      estimated_impressions: baseImpressions + Math.floor(Math.random() * 5000),
      estimated_ctr: baseCtr + Math.random() * 2,
      estimated_conversions: Math.floor((baseImpressions * baseCtr / 100) * 0.8),
      estimated_revenue: Math.floor(Math.random() * 3000) + 1000,
      confidence_level: 75 + Math.floor(Math.random() * 20)
    };


  private async getOverallPerformanceMetrics(): Promise<any> {

    // Mock implementation - would query actual metrics
    return {
      total_impressions: 150000,
      total_clicks: 3750,
      total_conversions: 420,
      average_ctr: 2.5,
      trends: []
    };


  private async getPromotionTrends(period: string): Promise<any> {

    // Mock implementation
    return {
      period,
      impressions_trend: [],
      ctr_trend: [],
      conversion_trend: []
    };


  private async getSlotUtilizationMetrics(): Promise<any> {

    // Mock implementation
    return {
      slots: [],
      utilization_rates: {}
    };

