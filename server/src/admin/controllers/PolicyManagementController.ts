/**
 * Policy Management Controller - Epic 17.5.4
 * 
 * Unified API controller for marketplace policy management and enforcement,
 * bridging MarketplacePolicyPublishingService and MarketplacePolicyEnforcementService
 * for Epic 17 Backstage Admin Controls.
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
  BadRequestException
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiQuery
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../guards/AdminAuthGuard';
import { RequirePermissions } from '../decorators/RequirePermissions';
import { MarketplacePolicyPublishingService } from '../../services/MarketplacePolicyPublishingService';
import { MarketplacePolicyEnforcementService } from '../../services/MarketplacePolicyEnforcementService';
import { AuditService } from '../../auth/services/AuditService';

// Request/Response DTOs
}
}
export interface CreatePolicyRequest {
  policy_type: string;
  title: string;
  description: string;
  content: any;
  compliance_frameworks: string[];
  target_audience: string[];
  effective_date?: Date;
  notification_channels?: string[];
}
}
}

}
}
export interface UpdatePolicyRequest {
  title?: string;
  description?: string;
  content?: any;
  compliance_frameworks?: string[];
  target_audience?: string[];
  effective_date?: Date;
}
}
}

}
}
export interface PublishPolicyRequest {
  publication_channels: string[];
  rollout_strategy: {
    type: 'immediate' | 'phased' | 'canary' | 'scheduled';
    parameters?: any;
}
}
  };
  notification_settings: {
    notify_users: boolean;
    channels: string[];
    message?: string;
  };
}

}
}
export interface CreateEnforcementRuleRequest {
  policy_id: string;
  violation_type: string;
  rule_name: string;
  description: string;
  detection_criteria: any;
  severity: string;
  automated_actions: any[];
  enabled: boolean;
}
}
}

}
}
export interface ViolationReviewRequest {
  action: 'uphold' | 'dismiss' | 'escalate';
  enforcement_actions?: string[];
  resolution_notes?: string;
  follow_up_required?: boolean;
}
}
}

}
}
export interface PolicyManagementDashboard {
  statistics: {
    total_policies: number;
    active_policies: number;
    pending_approvals: number;
    total_violations: number;
    open_violations: number;
    appeal_rate: number;
}
}
  };
  recent_activities: any[];
  policy_compliance_scores: Record<string, number>;
  enforcement_metrics: any;
  trending_violations: any[];
}

@ApiTags('admin/policy-management')
@ApiBearerAuth()
@Controller('admin/policy-management')
@UseGuards(AdminAuthGuard)
export class PolicyManagementController {
  private readonly logger = new Logger(PolicyManagementController.name);

  constructor(
    private readonly publishingService: MarketplacePolicyPublishingService,
    private readonly enforcementService: MarketplacePolicyEnforcementService,
    private readonly auditService: AuditService
  ) {}

  // Policy Management Endpoints

  @Get('dashboard')
  @ApiOperation({ summary: 'Get policy management dashboard data' })
  @RequirePermissions(['admin:policy:read'])
  async getDashboard(): Promise<PolicyManagementDashboard> {

    const [
      policies,
      violations,
      enforcementMetrics
    ] = await Promise.all([
      this.publishingService.getAllPolicies(),
      this.enforcementService.getViolationsSummary(),
      this.enforcementService.getEnforcementMetrics(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date()

    ]);

    return {
      statistics: {
        total_policies: policies.length,
        active_policies: policies.filter(p => p.status === 'active').length,
        pending_approvals: policies.filter(p => p.status === 'under_review').length,
        total_violations: violations.total,
        open_violations: violations.open,
        appeal_rate: violations.appeal_rate || 0
  }
      recent_activities: await this.getRecentActivities(),
      policy_compliance_scores: await this.calculateComplianceScores(),
      enforcement_metrics,
      trending_violations: violations.trending || []
    };
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all marketplace policies with filtering' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @RequirePermissions(['admin:policy:read'])
  async getPolicies(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    return this.publishingService.getPoliciesWithFilters({
      status,
      policy_type: type,
      page: Number(page),
      limit: Number(limit)
    });
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get specific policy with version history' })
  @RequirePermissions(['admin:policy:read'])
  async getPolicy(@Param('id') policyId: string) {
    const [policy, versions, enforcement_rules] = await Promise.all([
      this.publishingService.getPolicyById(policyId),
      this.publishingService.getPolicyVersionHistory(policyId),
      this.enforcementService.getEnforcementRules(policyId)
    ]);

    return {
      policy,
      versions,
      enforcement_rules,
      compliance_status: await this.publishingService.getPolicyComplianceStatus(policyId)
    };
  }

  @Post('policies')
  @ApiOperation({ summary: 'Create new marketplace policy' })
  @RequirePermissions(['admin:policy:create'])
  async createPolicy(
    @Body() request: CreatePolicyRequest,
    @Query('user_id') userId: string
  ) {
    // Validate policy data
    if (!request.title || !request.policy_type || !request.content) {
      throw new BadRequestException('Missing required fields: title, policy_type, content');
    }

    const policy = await this.publishingService.createPolicy({
      ...request,
      created_by: userId
    });

    await this.auditService.logEvent({
      userId,
      action: 'POLICY_CREATED',
      resource: `policy:${policy.id}`,
      metadata: { 
        policy_type: request.policy_type,
        title: request.title 
      }
    });

    this.logger.log(`Policy created: ${policy.id} by ${userId}`);
    return policy;
  }

  @Put('policies/:id')
  @ApiOperation({ summary: 'Update policy content and create new version' })
  @RequirePermissions(['admin:policy:update'])
  async updatePolicy(
    @Param('id') policyId: string,
    @Body() request: UpdatePolicyRequest,
    @Query('user_id') userId: string
  ) {
    const updatedPolicy = await this.publishingService.updatePolicy(
      policyId,
      { ...request, updated_by: userId }
    );

    await this.auditService.logEvent({
      userId,
      action: 'POLICY_UPDATED',
      resource: `policy:${policyId}`,
      metadata: request
    });

    return updatedPolicy;
  }

  @Post('policies/:id/versions/:version/publish')
  @ApiOperation({ summary: 'Publish specific policy version' })
  @RequirePermissions(['admin:policy:publish'])
  async publishPolicy(
    @Param('id') policyId: string,
    @Param('version') version: string,
    @Body() request: PublishPolicyRequest,
    @Query('user_id') userId: string
  ) {
    const publishResult = await this.publishingService.publishPolicyVersion(
      policyId,
      version,
      {
        ...request,
        published_by: userId
      }
    );

    await this.auditService.logEvent({
      userId,
      action: 'POLICY_PUBLISHED',
      resource: `policy:${policyId}:${version}`,
      metadata: request
    });

    this.logger.log(`Policy published: ${policyId}:${version} by ${userId}`);
    return publishResult;
  }

  @Post('policies/:id/versions/:version/rollback')
  @ApiOperation({ summary: 'Rollback policy to previous version' })
  @RequirePermissions(['admin:policy:rollback'])
  async rollbackPolicy(
    @Param('id') policyId: string,
    @Param('version') version: string,
    @Query('user_id') userId: string,
    @Body('reason') reason: string
  ) {
    const rollbackResult = await this.publishingService.rollbackToVersion(
      policyId,
      version,
      { reason, rolled_back_by: userId }
    );

    await this.auditService.logEvent({
      userId,
      action: 'POLICY_ROLLED_BACK',
      resource: `policy:${policyId}:${version}`,
      metadata: { reason }
    });

    this.logger.warn(`Policy rolled back: ${policyId} to ${version} by ${userId}`);
    return rollbackResult;
  }

  // Enforcement Management Endpoints

  @Get('violations')
  @ApiOperation({ summary: 'Get policy violations with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'type', required: false })
  @RequirePermissions(['admin:enforcement:read'])
  async getViolations(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('type') violationType?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    return this.enforcementService.getViolations({
      status,
      severity,
      violation_type: violationType,
      page: Number(page),
      limit: Number(limit)
    });
  }

  @Get('violations/:id')
  @ApiOperation({ summary: 'Get specific violation with full details' })
  @RequirePermissions(['admin:enforcement:read'])
  async getViolation(@Param('id') violationId: string) {
    const [violation, actions, appeals] = await Promise.all([
      this.enforcementService.getViolationById(violationId),
      this.enforcementService.getEnforcementActions(violationId),
      this.enforcementService.getViolationAppeals(violationId)
    ]);

    return { violation, actions, appeals };
  }

  @Post('violations/:id/review')
  @ApiOperation({ summary: 'Review and resolve policy violation' })
  @RequirePermissions(['admin:enforcement:review'])
  async reviewViolation(
    @Param('id') violationId: string,
    @Body() request: ViolationReviewRequest,
    @Query('user_id') userId: string
  ) {
    const reviewResult = await this.enforcementService.reviewViolation(
      violationId,
      {
        ...request,
        reviewed_by: userId
      }
    );

    await this.auditService.logEvent({
      userId,
      action: 'VIOLATION_REVIEWED',
      resource: `violation:${violationId}`,
      metadata: request
    });

    return reviewResult;
  }

  @Post('enforcement-rules')
  @ApiOperation({ summary: 'Create new enforcement rule' })
  @RequirePermissions(['admin:enforcement:create'])
  async createEnforcementRule(
    @Body() request: CreateEnforcementRuleRequest,
    @Query('user_id') userId: string
  ) {
    const rule = await this.enforcementService.createEnforcementRule({
      ...request,
      created_by: userId
    });

    await this.auditService.logEvent({
      userId,
      action: 'ENFORCEMENT_RULE_CREATED',
      resource: `rule:${rule.id}`,
      metadata: request
    });

    return rule;
  }

  @Get('enforcement-rules')
  @ApiOperation({ summary: 'Get all enforcement rules' })
  @RequirePermissions(['admin:enforcement:read'])
  async getEnforcementRules() {
    return this.enforcementService.getAllEnforcementRules();
  }

  @Put('enforcement-rules/:id/toggle')
  @ApiOperation({ summary: 'Enable/disable enforcement rule' })
  @RequirePermissions(['admin:enforcement:update'])
  async toggleEnforcementRule(
    @Param('id') ruleId: string,
    @Body('enabled') enabled: boolean,
    @Query('user_id') userId: string
  ) {
    const result = await this.enforcementService.toggleEnforcementRule(ruleId, enabled);

    await this.auditService.logEvent({
      userId,
      action: enabled ? 'ENFORCEMENT_RULE_ENABLED' : 'ENFORCEMENT_RULE_DISABLED',
      resource: `rule:${ruleId}`,
      metadata: { enabled }
    });

    return result;
  }

  // Analytics and Reporting

  @Get('analytics/policy-compliance')
  @ApiOperation({ summary: 'Get policy compliance analytics' })
  @RequirePermissions(['admin:analytics:read'])
  async getPolicyComplianceAnalytics(
    @Query('period') period: string = '30d'
  ) {
    return this.publishingService.getComplianceAnalytics(period);
  }

  @Get('analytics/enforcement-metrics')
  @ApiOperation({ summary: 'Get enforcement effectiveness metrics' })
  @RequirePermissions(['admin:analytics:read'])
  async getEnforcementMetrics(
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string
  ) {
    const from = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = toDate ? new Date(toDate) : new Date();

    return this.enforcementService.getDetailedMetrics(from, to);
  }

  @Get('analytics/violation-trends')
  @ApiOperation({ summary: 'Get violation trend analysis' })
  @RequirePermissions(['admin:analytics:read'])
  async getViolationTrends(
    @Query('period') period: string = '90d'
  ) {
    return this.enforcementService.getViolationTrends(period);
  }

  // Bulk Operations

  @Post('bulk/policies/archive')
  @ApiOperation({ summary: 'Archive multiple policies' })
  @RequirePermissions(['admin:policy:archive'])
  async archivePolicies(
    @Body('policy_ids') policyIds: string[],
    @Body('reason') reason: string,
    @Query('user_id') userId: string
  ) {
    const results = await this.publishingService.bulkArchivePolicies(
      policyIds,
      { reason, archived_by: userId }
    );

    await this.auditService.logEvent({
      userId,
      action: 'POLICIES_BULK_ARCHIVED',
      resource: 'policies:bulk',
      metadata: { policy_ids: policyIds, reason }
    });

    return results;
  }

  @Post('bulk/violations/resolve')
  @ApiOperation({ summary: 'Bulk resolve violations' })
  @RequirePermissions(['admin:enforcement:bulk-resolve'])
  async bulkResolveViolations(
    @Body('violation_ids') violationIds: string[],
    @Body('resolution_type') resolutionType: string,
    @Body('resolution_notes') resolutionNotes: string,
    @Query('user_id') userId: string
  ) {
    const results = await this.enforcementService.bulkResolveViolations(
      violationIds,
      {
        resolution_type: resolutionType,
        resolution_notes: resolutionNotes,
        resolved_by: userId
      }
    );

    await this.auditService.logEvent({
      userId,
      action: 'VIOLATIONS_BULK_RESOLVED',
      resource: 'violations:bulk',
      metadata: { 
        violation_ids: violationIds, 
        resolution_type: resolutionType,
        count: violationIds.length
      }
    });

    return results;
  }

  // Helper methods
  private async getRecentActivities() {
    // Implementation would fetch recent policy and enforcement activities
    return [];
  }

  private async calculateComplianceScores() {
    // Implementation would calculate compliance scores by framework
    return {};
  }
}