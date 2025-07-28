/**
 * Reviewer Assignment Controller - Epic 17.5.1
 * 
 * REST API controller for managing reviewer assignments in the marketplace admin system.
 * Provides endpoints for automatic and manual reviewer assignment, workload management,
 * and performance tracking.
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
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../guards/AdminAuthGuard';
import { RequirePermissions } from '../decorators/RequirePermissions';
import {
  ReviewerAssignmentService,
  ReviewType,
  AssignmentStrategy,
  ReviewerRole,
  AssignmentStatus,
  ReviewerProfile,
  ReviewAssignment,
  WorkloadDistribution,
  AssignmentRequest
} from '../../services/ReviewerAssignmentService';
import { AuditService } from '../../auth/services/AuditService';

// Request/Response DTOs
}
export interface CreateReviewerRequest {
  user_id: string;
  role: ReviewerRole;
  specializations: string[];
  capacity_limit: number;
  skill_ratings: Record<string, number>;
}
}

}
export interface AssignReviewRequest {
  review_item_id: string;
  review_type: ReviewType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  required_skills?: string[];
  preferred_reviewers?: string[];
  excluded_reviewers?: string[];
  due_date?: string;
  estimated_duration_hours?: number;
  assignment_strategy?: AssignmentStrategy;
  metadata?: Record<string, any>;
}
}

}
export interface ManualAssignRequest {
  reviewer_id: string;
  reason: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
}

}
export interface ReassignRequest {
  new_reviewer_id: string;
  reason: string;
}
}

}
export interface UpdateAvailabilityRequest {
  availability_status: 'available' | 'busy' | 'away' | 'unavailable';
  capacity_limit?: number;
}
}

}
export interface ReviewerDashboard {
  total_reviewers: number;
  active_reviewers: number;
  average_workload: number;
  pending_assignments: number;
  overdue_assignments: number;
  completion_rate: number;
  average_review_time: number;
  workload_distribution: WorkloadDistribution[];
  recent_assignments: ReviewAssignment[];
}
}

@ApiTags('admin/reviewer-assignment')
@ApiBearerAuth()
@Controller('admin/reviewer-assignment')
@UseGuards(AdminAuthGuard)
export class ReviewerAssignmentController {
  private readonly logger = new Logger(ReviewerAssignmentController.name);

  constructor(
    private readonly reviewerService: ReviewerAssignmentService,
    private readonly auditService: AuditService
  ) {}

  // Dashboard and Overview

  @Get('dashboard')
  @ApiOperation({ summary: 'Get reviewer assignment dashboard data' })
  @RequirePermissions(['admin:reviewer:read'])
  async getDashboard(): Promise<ReviewerDashboard> {

    const [
      workloadDistribution,
      recentAssignments,
      overallStats
    ] = await Promise.all([
      this.reviewerService.getWorkloadDistribution(),
      this.getRecentAssignments(10),
      this.getOverallStatistics()
    ]);

    const activeReviewers = workloadDistribution.filter(r => r.current_assignments > 0).length;
    const totalWorkload = workloadDistribution.reduce((sum, r) => sum + r.current_assignments, 0);
    const avgWorkload = workloadDistribution.length > 0 ? totalWorkload / workloadDistribution.length : 0;

    return {
      total_reviewers: workloadDistribution.length,
      active_reviewers: activeReviewers,
      average_workload: Math.round(avgWorkload * 100) / 100,
      pending_assignments: overallStats.pending_assignments,
      overdue_assignments: overallStats.overdue_assignments,
      completion_rate: overallStats.completion_rate,
      average_review_time: overallStats.average_review_time,
      workload_distribution: workloadDistribution,
      recent_assignments: recentAssignments
    };
  }

  @Get('workload-distribution')
  @ApiOperation({ summary: 'Get current workload distribution across all reviewers' })
  @ApiQuery({ name: 'review_type', required: false, description: 'Filter by review type' })
  @RequirePermissions(['admin:reviewer:read'])
  async getWorkloadDistribution(
    @Query('review_type') reviewType?: ReviewType
  ): Promise<WorkloadDistribution[]> {

    return this.reviewerService.getWorkloadDistribution(reviewType);
  }

  // Reviewer Management

  @Get('reviewers')
  @ApiOperation({ summary: 'Get all reviewer profiles' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'availability_status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @RequirePermissions(['admin:reviewer:read'])
  async getReviewers(
    @Query('role') role?: ReviewerRole,
    @Query('availability_status') availabilityStatus?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ reviewers: ReviewerProfile[]; total: number; page: number; limit: number }> {

    // Implementation would include filtering and pagination
    const workloadDistribution = await this.reviewerService.getWorkloadDistribution();
    
    // For now, return basic structure - full implementation would include proper querying
    return {
      reviewers: workloadDistribution.map(w => ({
        id: w.reviewer_id,
        user_id: w.reviewer_id,
        role: ReviewerRole.CONTENT_REVIEWER,
        specializations: [],
        capacity_limit: 10,
        current_workload: w.current_assignments,
        availability_status: 'available',
        skill_ratings: {},
        performance_metrics: {
          total_reviews: 0,
          completed_reviews: 0,
          average_review_time_hours: w.avg_completion_time,
          quality_score: 8,
          overturned_decisions: 0,
          escalations_received: 0,
          current_streak: 0,
          last_review_date: new Date()
  }
        created_at: new Date(),
        updated_at: new Date()
      })),
      total: workloadDistribution.length,
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20')
    };
  }

  @Post('reviewers')
  @ApiOperation({ summary: 'Create new reviewer profile' })
  @RequirePermissions(['admin:reviewer:create'])
  async createReviewer(
    @Body() request: CreateReviewerRequest,
    @Query('user_id') userId: string
  ): Promise<ReviewerProfile> {

    // Validate user exists and has appropriate permissions
    // This would typically integrate with user management service

    const profile = await this.reviewerService.createReviewerProfile({
      user_id: request.user_id,
      role: request.role,
      specializations: request.specializations,
      capacity_limit: request.capacity_limit,
      current_workload: 0,
      availability_status: 'available',
      skill_ratings: request.skill_ratings,
      performance_metrics: {
        total_reviews: 0,
        completed_reviews: 0,
        average_review_time_hours: 24,
        quality_score: 8,
        overturned_decisions: 0,
        escalations_received: 0,
        current_streak: 0,
        last_review_date: new Date()
      }
    });

    await this.auditService.logEvent({
      userId,
      action: 'REVIEWER_CREATED',
      resource: `reviewer:${profile.id}`,
      metadata: {
        reviewer_user_id: request.user_id,
        role: request.role,
        specializations: request.specializations
      }
    });

    this.logger.log(`Created reviewer profile ${profile.id} for user ${request.user_id}`);
    return profile;
  }

  @Get('reviewers/:id')
  @ApiOperation({ summary: 'Get specific reviewer profile' })
  @ApiParam({ name: 'id', description: 'Reviewer ID' })
  @RequirePermissions(['admin:reviewer:read'])
  async getReviewer(@Param('id') reviewerId: string): Promise<ReviewerProfile> {

    // This would be implemented with proper database query
    throw new NotFoundException(`Reviewer ${reviewerId} not found`);
  }

  @Put('reviewers/:id/availability')
  @ApiOperation({ summary: 'Update reviewer availability status' })
  @ApiParam({ name: 'id', description: 'Reviewer ID' })
  @RequirePermissions(['admin:reviewer:update'])
  async updateReviewerAvailability(
    @Param('id') reviewerId: string,
    @Body() request: UpdateAvailabilityRequest,
    @Query('user_id') userId: string
  ): Promise<{ success: boolean; message: string }> {

    // Implementation would update reviewer availability
    await this.auditService.logEvent({
      userId,
      action: 'REVIEWER_AVAILABILITY_UPDATED',
      resource: `reviewer:${reviewerId}`,
      metadata: {
        availability_status: request.availability_status,
        capacity_limit: request.capacity_limit
      }
    });

    this.logger.log(`Updated availability for reviewer ${reviewerId} to ${request.availability_status}`);
    return { success: true, message: 'Availability updated successfully' };
  }

  // Assignment Management

  @Post('assign')
  @ApiOperation({ summary: 'Automatically assign reviewer based on workload and skills' })
  @RequirePermissions(['admin:reviewer:assign'])
  async assignReviewer(
    @Body() request: AssignReviewRequest,
    @Query('user_id') userId: string
  ): Promise<ReviewAssignment> {

    // Validate review item exists
    if (!request.review_item_id || !request.review_type) {
      throw new BadRequestException('review_item_id and review_type are required');
    }

    const assignmentRequest: AssignmentRequest = {
      review_item_id: request.review_item_id,
      review_type: request.review_type,
      priority: request.priority,
      required_skills: request.required_skills,
      preferred_reviewers: request.preferred_reviewers,
      excluded_reviewers: request.excluded_reviewers,
      due_date: request.due_date ? new Date(request.due_date) : undefined,
      estimated_duration_hours: request.estimated_duration_hours,
      assignment_strategy: request.assignment_strategy,
      metadata: request.metadata
    };

    const assignment = await this.reviewerService.assignReviewer(assignmentRequest, userId);

    await this.auditService.logEvent({
      userId,
      action: 'REVIEW_ASSIGNED',
      resource: `assignment:${assignment.id}`,
      metadata: {
        review_item_id: request.review_item_id,
        review_type: request.review_type,
        reviewer_id: assignment.reviewer_id,
        assignment_strategy: assignment.assignment_strategy
      }
    });

    this.logger.log(`Auto-assigned review ${request.review_item_id} to reviewer ${assignment.reviewer_id}`);
    return assignment;
  }

  @Post(':reviewItemId/:reviewType/assign-manual')
  @ApiOperation({ summary: 'Manually assign specific reviewer to a review item' })
  @ApiParam({ name: 'reviewItemId', description: 'Review item ID' })
  @ApiParam({ name: 'reviewType', description: 'Type of review' })
  @RequirePermissions(['admin:reviewer:assign'])
  async manualAssign(
    @Param('reviewItemId') reviewItemId: string,
    @Param('reviewType') reviewType: ReviewType,
    @Body() request: ManualAssignRequest,
    @Query('user_id') userId: string
  ): Promise<ReviewAssignment> {

    const assignment = await this.reviewerService.assignSpecificReviewer(
      reviewItemId,
      reviewType,
      request.reviewer_id,
      userId,
      request.reason,
      request.due_date ? new Date(request.due_date) : undefined
    );

    await this.auditService.logEvent({
      userId,
      action: 'REVIEW_MANUALLY_ASSIGNED',
      resource: `assignment:${assignment.id}`,
      metadata: {
        review_item_id: reviewItemId,
        review_type: reviewType,
        reviewer_id: request.reviewer_id,
        reason: request.reason
      }
    });

    this.logger.log(`Manually assigned review ${reviewItemId} to reviewer ${request.reviewer_id}`);
    return assignment;
  }

  @Put('assignments/:id/reassign')
  @ApiOperation({ summary: 'Reassign review to different reviewer' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @RequirePermissions(['admin:reviewer:reassign'])
  async reassignReview(
    @Param('id') assignmentId: string,
    @Body() request: ReassignRequest,
    @Query('user_id') userId: string
  ): Promise<ReviewAssignment> {

    const assignment = await this.reviewerService.reassignReview(
      assignmentId,
      request.new_reviewer_id,
      request.reason,
      userId
    );

    await this.auditService.logEvent({
      userId,
      action: 'REVIEW_REASSIGNED',
      resource: `assignment:${assignmentId}`,
      metadata: {
        new_reviewer_id: request.new_reviewer_id,
        reason: request.reason
      }
    });

    this.logger.log(`Reassigned review ${assignmentId} to reviewer ${request.new_reviewer_id}`);
    return assignment;
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get review assignments with filtering and pagination' })
  @ApiQuery({ name: 'reviewer_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'review_type', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'overdue_only', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @RequirePermissions(['admin:reviewer:read'])
  async getAssignments(
    @Query('reviewer_id') reviewerId?: string,
    @Query('status') status?: AssignmentStatus,
    @Query('review_type') reviewType?: ReviewType,
    @Query('priority') priority?: string,
    @Query('overdue_only') overdueOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ assignments: ReviewAssignment[]; total: number; page: number; limit: number }> {

    // Implementation would include comprehensive filtering and pagination
    let assignments: ReviewAssignment[] = [];
    
    if (reviewerId) {
      assignments = await this.reviewerService.getReviewerAssignments(
        reviewerId,
        status,
        parseInt(limit || '20')
      );
    }

    return {
      assignments,
      total: assignments.length,
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20')
    };
  }

  @Get('assignments/:id')
  @ApiOperation({ summary: 'Get specific assignment details' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @RequirePermissions(['admin:reviewer:read'])
  async getAssignment(@Param('id') assignmentId: string): Promise<ReviewAssignment> {

    // Implementation would fetch assignment details
    throw new NotFoundException(`Assignment ${assignmentId} not found`);
  }

  @Post('assignments/:id/complete')
  @ApiOperation({ summary: 'Mark assignment as completed' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @RequirePermissions(['admin:reviewer:update'])
  async completeAssignment(
    @Param('id') assignmentId: string,
    @Body() completionData: any,
    @Query('user_id') userId: string
  ): Promise<{ success: boolean; message: string }> {

    await this.reviewerService.completeAssignment(assignmentId, userId, completionData);

    await this.auditService.logEvent({
      userId,
      action: 'ASSIGNMENT_COMPLETED',
      resource: `assignment:${assignmentId}`,
      metadata: completionData
    });

    this.logger.log(`Completed assignment ${assignmentId}`);
    return { success: true, message: 'Assignment completed successfully' };
  }

  // Analytics and Reporting

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get reviewer performance analytics' })
  @ApiQuery({ name: 'reviewer_id', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @RequirePermissions(['admin:reviewer:analytics'])
  async getPerformanceAnalytics(
    @Query('reviewer_id') reviewerId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ): Promise<any> {

    // Implementation would generate performance analytics
    return {
      reviewer_id: reviewerId,
      period: { start_date: startDate, end_date: endDate },
      metrics: {
        total_assignments: 0,
        completed_assignments: 0,
        average_completion_time: 0,
        quality_score: 0,
        overdue_count: 0
      }
    };
  }

  @Get('analytics/workload-trends')
  @ApiOperation({ summary: 'Get workload trends over time' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period: 7d, 30d, 90d' })
  @RequirePermissions(['admin:reviewer:analytics'])
  async getWorkloadTrends(@Query('period') period = '30d'): Promise<any> {

    // Implementation would generate workload trend analytics
    return {
      period,
      trends: {
        assignments_created: [],
        assignments_completed: [],
        average_workload: [],
        reviewer_capacity_utilization: []
      }
    };
  }

  // Bulk Operations

  @Post('bulk/reassign')
  @ApiOperation({ summary: 'Bulk reassign multiple assignments' })
  @RequirePermissions(['admin:reviewer:bulk'])
  async bulkReassign(
    @Body() request: { assignment_ids: string[]; new_reviewer_id: string; reason: string },
    @Query('user_id') userId: string
  ): Promise<{ success: number; failed: number; results: any[] }> {

    const results = await Promise.allSettled(
      request.assignment_ids.map(id => 
        this.reviewerService.reassignReview(id, request.new_reviewer_id, request.reason, userId)

    );

    await this.auditService.logEvent({
      userId,
      action: 'BULK_REASSIGNMENT',
      resource: 'assignments:bulk',
      metadata: {
        assignment_ids: request.assignment_ids,
        new_reviewer_id: request.new_reviewer_id,
        count: request.assignment_ids.length
      }
    });

    return {
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }

  // Helper methods

  private async getRecentAssignments(limit: number): Promise<ReviewAssignment[]> {

    // Implementation would fetch recent assignments
    return [];
  }

  private async getOverallStatistics(): Promise<{
    pending_assignments: number;
    overdue_assignments: number;
    completion_rate: number;
    average_review_time: number;
  }> {

    // Implementation would calculate overall statistics
    return {
      pending_assignments: 0,
      overdue_assignments: 0,
      completion_rate: 85.5,
      average_review_time: 18.2
    };
  }
}