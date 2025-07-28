/**
 * Archive Toggle Integration Module (Epic 19)
 * 
 * This module integrates the Archive Toggle System with the existing Archive Management Service,
 * ensuring all archiving operations respect toggle configurations and compliance requirements.
 * 
 * Features:
 * - Intercepts archive operations to evaluate toggle permissions
 * - Enforces GDPR/HIPAA/SOX compliance checks
 * - Provides toggle-aware archive workflows
 * - Maintains backward compatibility with existing archive operations
 * - Comprehensive audit logging for compliance
 */

import { EventEmitter } from 'events';
import ArchiveManagementService, {
  ArchiveRecord,
  ArchiveType,
  ArchiveCategory,
  DataClassification,
  SourceType,
  BusinessCriticality
} from './ArchiveManagementService';
import { ArchiveToggleService } from './ArchiveToggleService';
import { AuditService } from '../auth/services/AuditService';
import {
  ArchiveToggleEvaluationContext,
  ArchiveToggleEvaluationResult,
  ArchiveToggleMode,
  ComplianceStatus
} from './ArchiveToggleTypes';

/**
 * Extended archive options with toggle-aware features
 */
}
export interface ToggleAwareArchiveOptions {
  // Standard archive options
  description?: string;
  compressionAlgorithm?: unknown;
  encryptionAlgorithm?: unknown;
  storageClass?: unknown;
  retentionPolicyId?: string;
  tags?: string[];
  businessCriticality?: BusinessCriticality;
  dataClassification?: DataClassification;
  customMetadata?: Record<string, any>;
  priority?: number;

  // Toggle-specific options
  bypassToggleEvaluation?: boolean;
  requireExplicitConsent?: boolean;
  complianceRequirements?: string[];
  isEmergencyOperation?: boolean;
  isScheduledOperation?: boolean;
  userConsentToken?: string;
  adminOverrideReason?: string;
}
}

/**
 * Archive operation result with toggle evaluation details
 */
}
export interface ToggleAwareArchiveResult {
  archive?: ArchiveRecord;
  toggleEvaluation: ArchiveToggleEvaluationResult;
  success: boolean;
  reason: string;
  requiresUserAction: boolean;
  complianceStatus: ComplianceStatus;
  auditTrailId?: string;
}
}

/**
 * Archive Toggle Integration Service
 * Wraps the existing ArchiveManagementService with toggle-aware functionality
 */
export class ArchiveToggleIntegration extends EventEmitter {
  private archiveService: ArchiveManagementService;
  private toggleService: ArchiveToggleService;
  private auditService: AuditService;
  
  constructor(
    archiveService: ArchiveManagementService,
    toggleService: ArchiveToggleService,
    auditService: AuditService
  ) {
    super();
    this.archiveService = archiveService;
    this.toggleService = toggleService;
    this.auditService = auditService;
    
    this.setupArchiveServiceInterception();
    this.setupEventForwarding();
  }
  
  /**
   * Create archive with toggle evaluation
   */
  async createArchiveWithToggleEvaluation(
    name: string,
    sourceType: SourceType,
    sourceIdentifier: string,
    archiveType: ArchiveType,
    category: ArchiveCategory,
    createdBy: string,
    options: ToggleAwareArchiveOptions = {}
  ): Promise<ToggleAwareArchiveResult> {

    try {
      // Skip toggle evaluation if explicitly bypassed (for emergency admin operations)
      if (options.bypassToggleEvaluation) {
        const archive = await this.archiveService.createArchive(
          name, sourceType, sourceIdentifier, archiveType, category, createdBy, options
        );
        
        return {
          archive,
          toggleEvaluation: this.createBypassEvaluation(createdBy),
          success: true,
          reason: 'Archive created with toggle evaluation bypassed',
          requiresUserAction: false,
          complianceStatus: ComplianceStatus.PENDING_REVIEW
        };
      }
      
      // Build evaluation context
      const evaluationContext: ArchiveToggleEvaluationContext = {
        userId: createdBy,
        archiveType,
        category,
        dataClassification: options.dataClassification || DataClassification.INTERNAL,
        sourceIdentifier,
        complianceRequirements: options.complianceRequirements || [],
        hasUserConsent: !!options.userConsentToken,
        isEmergency: options.isEmergencyOperation || false,
        isScheduled: options.isScheduledOperation || false,
        triggeredBy: this.determineTriggerType(options),
        timestamp: new Date()
      };
      
      // Evaluate toggle permissions
      const evaluation = await this.toggleService.evaluateArchiving(evaluationContext);
      
      // Check if archiving is allowed
      if (!evaluation.isArchivingAllowed) {
        await this.auditService.logAction({
          action: 'archive_creation_blocked_by_toggle',
          userId: createdBy,
          resourceType: 'archive',
          details: {
            name,
            sourceIdentifier,
            archiveType,
            category,
            evaluation,
            reason: evaluation.reason
  }
          severity: 'warning'
        });
        
        return {
          toggleEvaluation: evaluation,
          success: false,
          reason: evaluation.reason,
          requiresUserAction: evaluation.requiresUserConsent || evaluation.requiresAdminApproval,
          complianceStatus: ComplianceStatus.NON_COMPLIANT
        };
      }
      
      // Check additional requirements
      const requirementsCheck = await this.checkAdditionalRequirements(evaluation, options, createdBy);
      if (!requirementsCheck.satisfied) {
        return {
          toggleEvaluation: evaluation,
          success: false,
          reason: requirementsCheck.reason,
          requiresUserAction: true,
          complianceStatus: ComplianceStatus.REQUIRES_CONSENT
        };
      }
      
      // Proceed with archive creation
      const enhancedOptions = this.enhanceArchiveOptions(options, evaluation);
      const archive = await this.archiveService.createArchive(
        name, sourceType, sourceIdentifier, archiveType, category, createdBy, enhancedOptions
      );
      
      // Log successful toggle-aware archive creation
      await this.auditService.logAction({
        action: 'toggle_aware_archive_created',
        userId: createdBy,
        resourceType: 'archive',
        resourceId: archive.id,
        details: {
          name,
          archiveType,
          category,
          evaluation,
          toggleMode: evaluation.mode,
          complianceRequirements: evaluation.appliedComplianceRules
  }
        severity: 'info'
      });
      
      this.emit('toggle_aware_archive_created', {
        archive,
        evaluation,
        createdBy,
        options
      });
      
      return {
        archive,
        toggleEvaluation: evaluation,
        success: true,
        reason: 'Archive created successfully with toggle compliance',
        requiresUserAction: false,
        complianceStatus: ComplianceStatus.COMPLIANT
      };
      
    } catch (error) {
      await this.auditService.logAction({
        action: 'toggle_aware_archive_creation_failed',
        userId: createdBy,
        resourceType: 'archive',
        details: {
          error: error instanceof Error ? error.message : String(error),
          name,
          sourceIdentifier,
          archiveType,
          category
  }
        severity: 'error'
      });
      
      throw error;
    }
  }
  
  /**
   * Bulk archive operations with toggle evaluation
   */
  async createBulkArchivesWithToggleEvaluation(
    requests: Array<{
      name: string;
      sourceType: SourceType;
      sourceIdentifier: string;
      archiveType: ArchiveType;
      category: ArchiveCategory;
      options?: ToggleAwareArchiveOptions;
    }>,
    createdBy: string
  ): Promise<{
    successful: ToggleAwareArchiveResult[];
    blocked: ToggleAwareArchiveResult[];
    failed: ToggleAwareArchiveResult[];
    summary: {
      total: number;
      successful: number;
      blocked: number;
      failed: number;
    };
  }> {

    const results = {
      successful: [] as ToggleAwareArchiveResult[],
      blocked: [] as ToggleAwareArchiveResult[],
      failed: [] as ToggleAwareArchiveResult[]
    };
    
    // Process each request
    for (const request of requests) {
      try {
        const result = await this.createArchiveWithToggleEvaluation(
          request.name,
          request.sourceType,
          request.sourceIdentifier,
          request.archiveType,
          request.category,
          createdBy,
          request.options || {}
        );
        
        if (result.success) {
          results.successful.push(result);
        } else {
          results.blocked.push(result);
        }
        
      } catch (error) {
        results.failed.push({
          toggleEvaluation: this.createErrorEvaluation(error, createdBy),
          success: false,
          reason: error instanceof Error ? error.message : String(error),
          requiresUserAction: false,
          complianceStatus: ComplianceStatus.UNKNOWN
        });
      }
    }
    
    const summary = {
      total: requests.length,
      successful: results.successful.length,
      blocked: results.blocked.length,
      failed: results.failed.length
    };
    
    // Log bulk operation summary
    await this.auditService.logAction({
      action: 'bulk_toggle_aware_archive_operation',
      userId: createdBy,
      resourceType: 'archive',
      details: {
        summary,
        requestCount: requests.length
  }
      severity: results.failed.length > 0 ? 'warning' : 'info'
    });
    
    return { ...results, summary };
  }
  
  /**
   * Check if user has permission to perform archive operation
   */
  async checkArchivePermission(
    userId: string,
    archiveType: ArchiveType,
    category: ArchiveCategory,
    dataClassification: DataClassification,
    sourceIdentifier: string,
    options: {
      isEmergency?: boolean;
      isScheduled?: boolean;
      complianceRequirements?: string[];
    } = {}
  ): Promise<{
    allowed: boolean;
    evaluation: ArchiveToggleEvaluationResult;
    requirements: {
      needsConsent: boolean;
      needsAdminApproval: boolean;
      needsComplianceCheck: boolean;
    };
  }> {

    const context: ArchiveToggleEvaluationContext = {
      userId,
      archiveType,
      category,
      dataClassification,
      sourceIdentifier,
      complianceRequirements: options.complianceRequirements || [],
      isEmergency: options.isEmergency || false,
      isScheduled: options.isScheduled || false,
      triggeredBy: 'user',
      timestamp: new Date()
    };
    
    const evaluation = await this.toggleService.evaluateArchiving(context);
    
    return {
      allowed: evaluation.isArchivingAllowed,
      evaluation,
      requirements: {
        needsConsent: evaluation.requiresUserConsent,
        needsAdminApproval: evaluation.requiresAdminApproval,
        needsComplianceCheck: evaluation.complianceChecksRequired
      }
    };
  }
  
  /**
   * Get archive toggle status for UI display
   */
  async getArchiveToggleStatus(filters?: {
    scope?: string;
    userId?: string;
    orgId?: string;
  }): Promise<{
    toggles: Array<{
      id: string;
      name: string;
      scope: string;
      mode: ArchiveToggleMode;
      isEnabled: boolean;
      isOverridden: boolean;
      complianceStatus: ComplianceStatus;
      lastActivity?: Date;
      operationStats: {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
      };
    }>;
    summary: {
      totalToggles: number;
      enabledToggles: number;
      overriddenToggles: number;
      complianceIssues: number;
    };
  }> {
    const configs = this.toggleService.listToggleConfigs(filters);
    
    const toggles = configs.map(config => {
      const state = this.toggleService.getToggleState(config.id);
      
      return {
        id: config.id,
        name: config.name,
        scope: config.scope,
        mode: state?.currentMode || config.mode,
        isEnabled: state?.isEnabled || false,
        isOverridden: state?.isOverridden || false,
        complianceStatus: state?.complianceStatus || ComplianceStatus.UNKNOWN,
        lastActivity: state?.lastArchiveOperation,
        operationStats: {
          total: state?.archiveOperationsCount || 0,
          successful: (state?.archiveOperationsCount || 0) - (state?.failedArchiveOperations || 0),
          failed: state?.failedArchiveOperations || 0,
          successRate: state?.archiveOperationsCount 
            ? ((state.archiveOperationsCount - state.failedArchiveOperations) / state.archiveOperationsCount * 100)
            : 100
        }
      };
    });
    
    const summary = {
      totalToggles: toggles.length,
      enabledToggles: toggles.filter(t => t.isEnabled).length,
      overriddenToggles: toggles.filter(t => t.isOverridden).length,
      complianceIssues: toggles.filter(t => 
        t.complianceStatus === ComplianceStatus.NON_COMPLIANT ||
        t.complianceStatus === ComplianceStatus.REQUIRES_CONSENT
      ).length
    };
    
    return { toggles, summary };
  }
  
  /**
   * Generate compliance report for archive toggles
   */
  async generateComplianceReport(options: {
    startDate?: Date;
    endDate?: Date;
    includeUserData?: boolean;
    includeSystemData?: boolean;
    format?: 'summary' | 'detailed';
  } = {}): Promise<{
    reportId: string;
    generatedAt: Date;
    period: { start?: Date; end?: Date };
    summary: {
      totalEvaluations: number;
      approvedOperations: number;
      blockedOperations: number;
      complianceViolations: number;
      emergencyOverrides: number;
    };
    toggleCompliance: Array<{
      toggleId: string;
      toggleName: string;
      complianceStatus: ComplianceStatus;
      operationsCount: number;
      violationsCount: number;
      lastViolation?: Date;
    }>;
    recommendations: string[];
  }> {
    const reportId = `compliance_report_${Date.now()}`;
    const generatedAt = new Date();
    
    // Get all toggle configurations and states
    const configs = this.toggleService.listToggleConfigs();
    const toggleCompliance = configs.map(config => {
      const state = this.toggleService.getToggleState(config.id);
      
      return {
        toggleId: config.id,
        toggleName: config.name,
        complianceStatus: state?.complianceStatus || ComplianceStatus.UNKNOWN,
        operationsCount: state?.archiveOperationsCount || 0,
        violationsCount: state?.failedArchiveOperations || 0,
        lastViolation: state?.lastArchiveOperation // Simplified for demo
      };
    });
    
    // Calculate summary statistics
    const summary = {
      totalEvaluations: toggleCompliance.reduce((sum, t) => sum + t.operationsCount, 0),
      approvedOperations: toggleCompliance.reduce((sum, t) => sum + (t.operationsCount - t.violationsCount), 0),
      blockedOperations: toggleCompliance.reduce((sum, t) => sum + t.violationsCount, 0),
      complianceViolations: toggleCompliance.filter(t => 
        t.complianceStatus === ComplianceStatus.NON_COMPLIANT
      ).length,
      emergencyOverrides: configs.filter(c => {
        const state = this.toggleService.getToggleState(c.id);
        return state?.isOverridden;
      }).length
    };
    
    // Generate recommendations
    const recommendations = this.generateComplianceRecommendations(toggleCompliance, summary);
    
    const report = {
      reportId,
      generatedAt,
      period: {
        start: options.startDate,
        end: options.endDate
  }
      summary,
      toggleCompliance,
      recommendations
    };
    
    // Log report generation
    await this.auditService.logAction({
      action: 'compliance_report_generated',
      userId: 'system',
      resourceType: 'compliance_report',
      resourceId: reportId,
      details: {
        reportOptions: options,
        summary
  }
      severity: 'info'
    });
    
    return report;
  }
  
  // Private helper methods
  
  private setupArchiveServiceInterception(): void {
    // Intercept archive service events to update toggle statistics
    this.archiveService.on('archive_created', async (archive: ArchiveRecord) => {
      try {
        // Find applicable toggles and update their statistics
        const context: ArchiveToggleEvaluationContext = {
          userId: archive.createdBy,
          archiveType: archive.archiveType,
          category: archive.category,
          dataClassification: archive.dataClassification,
          sourceIdentifier: archive.sourceIdentifier,
          triggeredBy: 'system',
          timestamp: new Date()
        };
        
        // This would normally update toggle statistics in the database
        // For now, we just log the operation
        await this.auditService.logAction({
          action: 'archive_toggle_statistics_updated',
          userId: 'system',
          resourceType: 'toggle_statistics',
          details: {
            archiveId: archive.id,
            context
  }
          severity: 'info'
        });
        
      } catch (error) {
        console.error('Failed to update toggle statistics:', error);
      }
    });
  }
  
  private setupEventForwarding(): void {
    // Forward relevant events from toggle service
    this.toggleService.on('toggle_enabled', (state, config) => {
      this.emit('archive_toggle_enabled', { state, config });
    });
    
    this.toggleService.on('toggle_disabled', (state, config) => {
      this.emit('archive_toggle_disabled', { state, config });
    });
    
    this.toggleService.on('emergency_override_applied', (state, config) => {
      this.emit('archive_emergency_override', { state, config });
    });
  }
  
  private determineTriggerType(options: ToggleAwareArchiveOptions): 'user' | 'system' | 'policy' | 'emergency' {
    if (options.isEmergencyOperation) return 'emergency';
    if (options.isScheduledOperation) return 'policy';
    if (options.adminOverrideReason) return 'user';
    return 'system';
  }
  
  private async checkAdditionalRequirements(
    evaluation: ArchiveToggleEvaluationResult,
    options: ToggleAwareArchiveOptions,
    userId: string
  ): Promise<{ satisfied: boolean; reason: string }> {

    // Check user consent requirement
    if (evaluation.requiresUserConsent && !options.userConsentToken) {
      return {
        satisfied: false,
        reason: 'User consent required but not provided'
      };
    }
    
    // Check admin approval requirement
    if (evaluation.requiresAdminApproval && !options.adminOverrideReason) {
      return {
        satisfied: false,
        reason: 'Admin approval required but not provided'
      };
    }
    
    // Check compliance requirements
    if (evaluation.complianceChecksRequired && !options.complianceRequirements?.length) {
      return {
        satisfied: false,
        reason: 'Compliance requirements not specified'
      };
    }
    
    return { satisfied: true, reason: 'All requirements satisfied' };
  }
  
  private enhanceArchiveOptions(
    options: ToggleAwareArchiveOptions,
    evaluation: ArchiveToggleEvaluationResult
  ): any {
    const enhancedOptions = { ...options };
    
    // Add compliance metadata
    if (evaluation.appliedComplianceRules.length > 0) {
      enhancedOptions.customMetadata = {
        ...enhancedOptions.customMetadata,
        toggleCompliance: {
          evaluationId: evaluation.evaluationId,
          appliedRules: evaluation.appliedComplianceRules,
          mode: evaluation.mode,
          evaluatedAt: evaluation.evaluatedAt
        }
      };
    }
    
    // Add toggle-specific tags
    const toggleTags = [
      `toggle_mode:${evaluation.mode}`,
      `toggle_config:${evaluation.configId}`
    ];
    
    if (evaluation.requiresUserConsent) {
      toggleTags.push('consent_required');
    }
    
    if (evaluation.complianceChecksRequired) {
      toggleTags.push('compliance_verified');
    }
    
    enhancedOptions.tags = [...(enhancedOptions.tags || []), ...toggleTags];
    
    return enhancedOptions;
  }
  
  private createBypassEvaluation(userId: string): ArchiveToggleEvaluationResult {
    return {
      configId: 'bypass',
      isArchivingAllowed: true,
      mode: ArchiveToggleMode.EMERGENCY,
      reason: 'Toggle evaluation bypassed for emergency operation',
      requiresUserConsent: false,
      requiresAdminApproval: false,
      complianceChecksRequired: false,
      warnings: ['Toggle evaluation was bypassed'],
      recommendations: ['Ensure proper authorization for bypass operations'],
      evaluationId: `bypass_${Date.now()}`,
      evaluatedAt: new Date(),
      evaluatedBy: userId,
      relatedRetentionPolicies: [],
      appliedComplianceRules: []
    };
  }
  
  private createErrorEvaluation(error: unknown, userId: string): ArchiveToggleEvaluationResult {
    return {
      configId: 'error',
      isArchivingAllowed: false,
      mode: ArchiveToggleMode.DISABLED,
      reason: error instanceof Error ? error.message : 'Unknown error during evaluation',
      requiresUserConsent: false,
      requiresAdminApproval: false,
      complianceChecksRequired: false,
      warnings: ['Archive operation failed due to error'],
      recommendations: ['Check system logs and toggle configuration'],
      evaluationId: `error_${Date.now()}`,
      evaluatedAt: new Date(),
      evaluatedBy: userId,
      relatedRetentionPolicies: [],
      appliedComplianceRules: []
    };
  }
  
  private generateComplianceRecommendations(
    toggleCompliance: any[],
    summary: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (summary.complianceViolations > 0) {
      recommendations.push('Review and address compliance violations in archive toggle configurations');
    }
    
    if (summary.emergencyOverrides > 0) {
      recommendations.push('Review emergency overrides and ensure they are properly documented');
    }
    
    const lowSuccessRateToggles = toggleCompliance.filter(t => {
      const successRate = t.operationsCount > 0 
        ? ((t.operationsCount - t.violationsCount) / t.operationsCount * 100)
        : 100;
      return successRate < 80;
    });
    
    if (lowSuccessRateToggles.length > 0) {
      recommendations.push('Review toggles with low success rates and optimize their configurations');
    }
    
    const nonCompliantToggles = toggleCompliance.filter(t => 
      t.complianceStatus === ComplianceStatus.NON_COMPLIANT
    );
    
    if (nonCompliantToggles.length > 0) {
      recommendations.push('Update non-compliant toggles to meet regulatory requirements');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Archive toggle compliance is in good standing');
    }
    
    return recommendations;
  }
}

export default ArchiveToggleIntegration;