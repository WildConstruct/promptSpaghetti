/**
 * Archive Toggle Service (Epic 19)
 * 
 * This service manages toggle-based archiving functionality as part of Epic 19's
 * Data Protection & Privacy Controls. It integrates with the existing Archive Management
 * Service and Feature Toggle System to provide fine-grained control over archiving operations.
 * 
 * Features:
 * - Toggle-controlled archiving policies
 * - GDPR/HIPAA/SOX compliance checks
 * - User consent management
 * - Emergency override capabilities
 * - Security event logging
 * - Integration with retention policies
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import ArchiveManagementService, { 
  ArchiveType, 
  ArchiveCategory, 
  DataClassification,
  ArchiveRecord 
} from './ArchiveManagementService';
import {
  ArchiveToggleConfig,
  ArchiveToggleState,
  ArchiveToggleMode,
  ArchiveToggleScope,
  ArchiveToggleAction,
  ArchiveToggleAuditEntry,
  ArchiveToggleEvaluationContext,
  ArchiveToggleEvaluationResult,
  CreateArchiveToggleRequest,
  UpdateArchiveToggleRequest,
  ComplianceStatus,
  DEFAULT_ARCHIVE_TOGGLE_CONFIG,
  PREDEFINED_ARCHIVE_TOGGLE_CONFIGS
} from './ArchiveToggleTypes';

export class ArchiveToggleService extends EventEmitter {
  private dbService: DatabaseService;
  private auditService: AuditService;
  private archiveService: ArchiveManagementService;
  private toggleConfigs: Map<string, ArchiveToggleConfig> = new Map();
  private toggleStates: Map<string, ArchiveToggleState> = new Map();
  
  constructor(
    dbService: DatabaseService,
    auditService: AuditService,
    archiveService: ArchiveManagementService
  ) {
    super();
    this.dbService = dbService;
    this.auditService = auditService;
    this.archiveService = archiveService;
    
    this.setupEventHandlers();
    this.loadToggleConfigurations();
    this.initializePredefinedToggles();
  }
  
  /**
   * Create a new archive toggle configuration
   */
  async createArchiveToggle(
    request: CreateArchiveToggleRequest,
    createdBy: string
  ): Promise<ArchiveToggleConfig> {

    try {
      const config: ArchiveToggleConfig = {
        id: this.generateToggleId(),
        name: request.name,
        description: request.description,
        scope: request.scope,
        mode: request.mode,
        ...DEFAULT_ARCHIVE_TOGGLE_CONFIG,
        enabledByDefault: request.enabledByDefault ?? false,
        requiresExplicitConsent: request.requiresExplicitConsent ?? true,
        complianceRequired: request.complianceRequired ?? false,
        customSettings: request.customSettings || {},
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        lastModifiedBy: createdBy
      };
      
      // Store in database
      await this.storeToggleConfig(config);
      
      // Cache configuration
      this.toggleConfigs.set(config.id, config);
      
      // Initialize toggle state
      const initialState: ArchiveToggleState = {
        configId: config.id,
        orgId: request.orgId,
        isEnabled: config.enabledByDefault,
        currentMode: config.mode,
        isOverridden: false,
        complianceStatus: ComplianceStatus.PENDING_REVIEW,
        archiveOperationsCount: 0,
        failedArchiveOperations: 0,
        auditTrail: []
      };
      
      await this.storeToggleState(initialState);
      this.toggleStates.set(config.id, initialState);
      
      // Audit log
      await this.auditService.logAction({
        action: 'archive_toggle_created',
        userId: createdBy,
        resourceType: 'archive_toggle',
        resourceId: config.id,
        details: {
          name: config.name,
          scope: config.scope,
          mode: config.mode,
          complianceRequired: config.complianceRequired
  }
        severity: 'info'
      });
      
      // Create audit trail entry
      await this.createAuditEntry(config.id, {
        id: this.generateAuditId(),
        timestamp: new Date(),
        action: ArchiveToggleAction.CONFIG_UPDATED,
        actorId: createdBy,
        actorType: 'admin',
        newState: { isEnabled: config.enabledByDefault, currentMode: config.mode },
        reason: 'Initial toggle configuration created',
        isEmergency: false
      });
      
      this.emit('toggle_created', config);
      
      return config;
      
    } catch (error) {
      await this.auditService.logAction({
        action: 'archive_toggle_creation_failed',
        userId: createdBy,
        resourceType: 'archive_toggle',
        details: {
          error: error instanceof Error ? error.message : String(error),
          request
  }
        severity: 'error'
      });
      throw error;
    }
  }
  
  /**
   * Update an existing archive toggle configuration
   */
  async updateArchiveToggle(
    request: UpdateArchiveToggleRequest,
    updatedBy: string
  ): Promise<ArchiveToggleConfig> {

    try {
      const existingConfig = this.toggleConfigs.get(request.id);
      if (!existingConfig) {
        throw new Error('Archive toggle configuration not found');
      }
      
      const previousState = { ...existingConfig };
      
      // Update configuration
      const updatedConfig: ArchiveToggleConfig = {
        ...existingConfig,
        name: request.name ?? existingConfig.name,
        description: request.description ?? existingConfig.description,
        mode: request.mode ?? existingConfig.mode,
        enabledByDefault: request.enabledByDefault ?? existingConfig.enabledByDefault,
        requiresExplicitConsent: request.requiresExplicitConsent ?? existingConfig.requiresExplicitConsent,
        complianceRequired: request.complianceRequired ?? existingConfig.complianceRequired,
        customSettings: { ...existingConfig.customSettings, ...request.customSettings },
        version: existingConfig.version + 1,
        updatedAt: new Date(),
        lastModifiedBy: updatedBy
      };
      
      // Store updated configuration
      await this.storeToggleConfig(updatedConfig);
      this.toggleConfigs.set(request.id, updatedConfig);
      
      // Update toggle state if mode changed
      const currentState = this.toggleStates.get(request.id);
      if (currentState && request.mode && request.mode !== currentState.currentMode) {
        const updatedState: ArchiveToggleState = {
          ...currentState,
          currentMode: request.mode
        };
        
        await this.storeToggleState(updatedState);
        this.toggleStates.set(request.id, updatedState);
      }
      
      // Create audit trail entry
      await this.createAuditEntry(request.id, {
        id: this.generateAuditId(),
        timestamp: new Date(),
        action: ArchiveToggleAction.CONFIG_UPDATED,
        actorId: updatedBy,
        actorType: 'admin',
        previousState: { currentMode: previousState.mode },
        newState: { currentMode: updatedConfig.mode },
        reason: request.reason,
        isEmergency: false
      });
      
      // Audit log
      await this.auditService.logAction({
        action: 'archive_toggle_updated',
        userId: updatedBy,
        resourceType: 'archive_toggle',
        resourceId: request.id,
        details: {
          changes: this.getConfigurationChanges(previousState, updatedConfig),
          reason: request.reason
  }
        severity: 'info'
      });
      
      this.emit('toggle_updated', updatedConfig, previousState);
      
      return updatedConfig;
      
    } catch (error) {
      await this.auditService.logAction({
        action: 'archive_toggle_update_failed',
        userId: updatedBy,
        resourceType: 'archive_toggle',
        resourceId: request.id,
        details: {
          error: error instanceof Error ? error.message : String(error),
          request
  }
        severity: 'error'
      });
      throw error;
    }
  }
  
  /**
   * Evaluate whether archiving is allowed for a given context
   */
  async evaluateArchiving(
    context: ArchiveToggleEvaluationContext
  ): Promise<ArchiveToggleEvaluationResult> {

    try {
      const evaluationId = this.generateEvaluationId();
      const evaluatedAt = new Date();
      
      // Find applicable toggle configurations
      const applicableToggles = this.findApplicableToggles(context);
      
      if (applicableToggles.length === 0) {
        // No specific toggle found, allow archiving with warnings
        return {
          configId: 'default',
          isArchivingAllowed: true,
          mode: ArchiveToggleMode.AUTOMATIC,
          reason: 'No specific archive toggle configuration found, using default policy',
          requiresUserConsent: false,
          requiresAdminApproval: false,
          complianceChecksRequired: false,
          warnings: ['No specific archiving toggle configured for this context'],
          recommendations: ['Consider configuring specific archiving toggles for better control'],
          evaluationId,
          evaluatedAt,
          evaluatedBy: context.triggeredBy,
          relatedRetentionPolicies: [],
          appliedComplianceRules: []
        };
      }
      
      // Use the most specific toggle (first in priority order)
      const primaryToggle = applicableToggles[0];
      const toggleConfig = this.toggleConfigs.get(primaryToggle);
      const toggleState = this.toggleStates.get(primaryToggle);
      
      if (!toggleConfig || !toggleState) {
        throw new Error('Toggle configuration or state not found');
      }
      
      // Check if archiving is enabled
      if (!toggleState.isEnabled && toggleState.currentMode !== ArchiveToggleMode.EMERGENCY) {
        return {
          configId: primaryToggle,
          isArchivingAllowed: false,
          mode: toggleState.currentMode,
          reason: 'Archiving is disabled by toggle configuration',
          requiresUserConsent: false,
          requiresAdminApproval: false,
          complianceChecksRequired: false,
          warnings: ['Archiving is currently disabled'],
          recommendations: ['Enable archiving toggle or use emergency override if necessary'],
          evaluationId,
          evaluatedAt,
          evaluatedBy: context.triggeredBy,
          relatedRetentionPolicies: [],
          appliedComplianceRules: []
        };
      }
      
      // Evaluate based on current mode
      const evaluation = await this.evaluateByMode(toggleConfig, toggleState, context);
      
      // Log evaluation for audit trail
      await this.createAuditEntry(primaryToggle, {
        id: this.generateAuditId(),
        timestamp: evaluatedAt,
        action: ArchiveToggleAction.ARCHIVE_OPERATION_TRIGGERED,
        actorId: context.userId || 'system',
        actorType: context.triggeredBy === 'user' ? 'user' : 'system',
        reason: `Archive operation evaluated: ${evaluation.isArchivingAllowed ? 'ALLOWED' : 'BLOCKED'}`,
        isEmergency: context.isEmergency || false,
        relatedArchiveIds: [],
        impactedDataTypes: [context.archiveType]
      });
      
      // Security event logging if required
      if (toggleConfig.securityEventLogging) {
        await this.auditService.logAction({
          action: evaluation.isArchivingAllowed ? 'archive_operation_allowed' : 'archive_operation_blocked',
          userId: context.userId || 'system',
          resourceType: 'archive_toggle',
          resourceId: primaryToggle,
          details: {
            evaluationId,
            context: {
              archiveType: context.archiveType,
              category: context.category,
              dataClassification: context.dataClassification,
              sourceIdentifier: context.sourceIdentifier
  }
            result: evaluation
  }
          severity: evaluation.isArchivingAllowed ? 'info' : 'warning'
        });
      }
      
      return {
        ...evaluation,
        configId: primaryToggle,
        evaluationId,
        evaluatedAt,
        evaluatedBy: context.triggeredBy
      };
      
    } catch (error) {
      await this.auditService.logAction({
        action: 'archive_toggle_evaluation_failed',
        userId: context.userId || 'system',
        resourceType: 'archive_toggle',
        details: {
          error: error instanceof Error ? error.message : String(error),
          context
  }
        severity: 'error'
      });
      throw error;
    }
  }
  
  /**
   * Enable or disable an archive toggle
   */
  async setToggleState(
    toggleId: string,
    enabled: boolean,
    reason: string,
    actorId: string
  ): Promise<ArchiveToggleState> {

    try {
      const currentState = this.toggleStates.get(toggleId);
      const config = this.toggleConfigs.get(toggleId);
      
      if (!currentState || !config) {
        throw new Error('Toggle not found');
      }
      
      if (currentState.isEnabled === enabled) {
        throw new Error(`Toggle is already ${enabled ? 'enabled' : 'disabled'}`);
      }
      
      const previousState = { ...currentState };
      
      // Update toggle state
      const updatedState: ArchiveToggleState = {
        ...currentState,
        isEnabled: enabled,
        lastToggleTime: new Date(),
        toggledBy: actorId,
        toggleReason: reason
      };
      
      // Store updated state
      await this.storeToggleState(updatedState);
      this.toggleStates.set(toggleId, updatedState);
      
      // Create audit trail entry
      await this.createAuditEntry(toggleId, {
        id: this.generateAuditId(),
        timestamp: new Date(),
        action: enabled ? ArchiveToggleAction.ENABLED : ArchiveToggleAction.DISABLED,
        actorId,
        actorType: 'admin',
        previousState: { isEnabled: previousState.isEnabled },
        newState: { isEnabled: enabled },
        reason,
        isEmergency: false
      });
      
      // Audit log
      await this.auditService.logAction({
        action: enabled ? 'archive_toggle_enabled' : 'archive_toggle_disabled',
        userId: actorId,
        resourceType: 'archive_toggle',
        resourceId: toggleId,
        details: {
          toggleName: config.name,
          reason,
          previousState: previousState.isEnabled,
          newState: enabled
  }
        severity: 'info'
      });
      
      this.emit(enabled ? 'toggle_enabled' : 'toggle_disabled', updatedState, config);
      
      return updatedState;
      
    } catch (error) {
      await this.auditService.logAction({
        action: 'archive_toggle_state_change_failed',
        userId: actorId,
        resourceType: 'archive_toggle',
        resourceId: toggleId,
        details: {
          error: error instanceof Error ? error.message : String(error),
          enabled,
          reason
  }
        severity: 'error'
      });
      throw error;
    }
  }
  
  /**
   * Apply emergency override to a toggle
   */
  async applyEmergencyOverride(
    toggleId: string,
    enabled: boolean,
    reason: string,
    ttlMinutes: number,
    actorId: string
  ): Promise<ArchiveToggleState> {

    try {
      const config = this.toggleConfigs.get(toggleId);
      const currentState = this.toggleStates.get(toggleId);
      
      if (!config || !currentState) {
        throw new Error('Toggle not found');
      }
      
      if (!config.allowEmergencyOverride) {
        throw new Error('Emergency override not allowed for this toggle');
      }
      
      const overrideExpiresAt = new Date(Date.now() + ttlMinutes * 60000);
      
      // Update state with override
      const updatedState: ArchiveToggleState = {
        ...currentState,
        isEnabled: enabled,
        isOverridden: true,
        overrideExpiresAt,
        overrideReason: reason,
        overrideApprovedBy: actorId,
        lastToggleTime: new Date(),
        toggledBy: actorId,
        toggleReason: `EMERGENCY OVERRIDE: ${reason}`
      };
      
      // Store updated state
      await this.storeToggleState(updatedState);
      this.toggleStates.set(toggleId, updatedState);
      
      // Schedule override expiration
      this.scheduleOverrideExpiration(toggleId, overrideExpiresAt);
      
      // Create audit trail entry
      await this.createAuditEntry(toggleId, {
        id: this.generateAuditId(),
        timestamp: new Date(),
        action: ArchiveToggleAction.EMERGENCY_OVERRIDE,
        actorId,
        actorType: 'admin',
        previousState: { 
          isEnabled: currentState.isEnabled,
          isOverridden: currentState.isOverridden 
  }
        newState: { 
          isEnabled: enabled,
          isOverridden: true 
  }
        reason,
        isEmergency: true
      });
      
      // Critical audit log
      await this.auditService.logAction({
        action: 'archive_toggle_emergency_override',
        userId: actorId,
        resourceType: 'archive_toggle',
        resourceId: toggleId,
        details: {
          toggleName: config.name,
          reason,
          enabled,
          ttlMinutes,
          expiresAt: overrideExpiresAt.toISOString()
  }
        severity: 'critical'
      });
      
      this.emit('emergency_override_applied', updatedState, config);
      
      return updatedState;
      
    } catch (error) {
      await this.auditService.logAction({
        action: 'archive_toggle_emergency_override_failed',
        userId: actorId,
        resourceType: 'archive_toggle',
        resourceId: toggleId,
        details: {
          error: error instanceof Error ? error.message : String(error),
          enabled,
          reason,
          ttlMinutes
  }
        severity: 'error'
      });
      throw error;
    }
  }
  
  /**
   * Get toggle configuration by ID
   */
  getToggleConfig(toggleId: string): ArchiveToggleConfig | undefined {
    return this.toggleConfigs.get(toggleId);
  }
  
  /**
   * Get toggle state by ID
   */
  getToggleState(toggleId: string): ArchiveToggleState | undefined {
    return this.toggleStates.get(toggleId);
  }
  
  /**
   * List all toggle configurations
   */
  listToggleConfigs(filters?: {
    scope?: ArchiveToggleScope;
    mode?: ArchiveToggleMode;
    enabled?: boolean;
    orgId?: string;
  }): ArchiveToggleConfig[] {
    let configs = Array.from(this.toggleConfigs.values());
    
    if (filters) {
      if (filters.scope) {
        configs = configs.filter(c => c.scope === filters.scope);
      }
      if (filters.mode) {
        configs = configs.filter(c => c.mode === filters.mode);
      }
      if (filters.orgId) {
        const states = Array.from(this.toggleStates.values())
          .filter(s => s.orgId === filters.orgId)
          .map(s => s.configId);
        configs = configs.filter(c => states.includes(c.id));
      }
      if (filters.enabled !== undefined) {
        const enabledStates = Array.from(this.toggleStates.values())
          .filter(s => s.isEnabled === filters.enabled)
          .map(s => s.configId);
        configs = configs.filter(c => enabledStates.includes(c.id));
      }
    }
    
    return configs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  // Private helper methods
  
  private generateToggleId(): string {
    return `archive_toggle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateEvaluationId(): string {
    return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private findApplicableToggles(context: ArchiveToggleEvaluationContext): string[] {
    const applicableToggles: Array<{ id: string; priority: number }> = [];
    
    for (const [id, config] of this.toggleConfigs.entries()) {
      let priority = 0;
      let isApplicable = false;
      
      // Check scope applicability
      switch (config.scope) {
      case ArchiveToggleScope.GLOBAL:
        isApplicable = true;
        priority = 1;
        break;
      case ArchiveToggleScope.DATA_TYPE:
        if (config.allowedArchiveTypes?.includes(context.archiveType) ||
              config.allowedCategories?.includes(context.category)) {
          isApplicable = true;
          priority = 5;
        }
        break;
      case ArchiveToggleScope.USER_DATA:
        if (context.category === ArchiveCategory.USER_DATA ||
              context.category === ArchiveCategory.APPLICATION_DATA) {
          isApplicable = true;
          priority = 4;
        }
        break;
      case ArchiveToggleScope.COMPLIANCE_DATA:
        if (context.complianceRequirements && context.complianceRequirements.length > 0) {
          isApplicable = true;
          priority = 6;
        }
        break;
      case ArchiveToggleScope.LOG_DATA:
        if (context.category === ArchiveCategory.LOG_DATA) {
          isApplicable = true;
          priority = 3;
        }
        break;
      case ArchiveToggleScope.SYSTEM_DATA:
        if (context.category === ArchiveCategory.SYSTEM_DATA) {
          isApplicable = true;
          priority = 3;
        }
        break;
      }
      
      // Additional classification-based filtering
      if (isApplicable && config.allowedClassifications) {
        if (!config.allowedClassifications.includes(context.dataClassification)) {
          isApplicable = false;
        }
      }
      
      if (isApplicable) {
        applicableToggles.push({ id, priority });
      }
    }
    
    // Sort by priority (highest first)
    return applicableToggles
      .sort((a, b) => b.priority - a.priority)
      .map(t => t.id);
  }
  
  private async evaluateByMode(
    config: ArchiveToggleConfig,
    state: ArchiveToggleState,
    context: ArchiveToggleEvaluationContext
  ): Promise<Partial<ArchiveToggleEvaluationResult>> {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    switch (state.currentMode) {
    case ArchiveToggleMode.DISABLED:
      return {
        isArchivingAllowed: false,
        mode: state.currentMode,
        reason: 'Archiving is disabled',
        requiresUserConsent: false,
        requiresAdminApproval: false,
        complianceChecksRequired: false,
        warnings: ['All archiving operations are disabled'],
        recommendations: ['Enable archiving or use emergency mode if necessary']
      };
        
    case ArchiveToggleMode.MANUAL_ONLY:
      const isManualTrigger = context.triggeredBy === 'user';
      if (!isManualTrigger) {
        warnings.push('Automatic archiving is disabled, only manual operations allowed');
      }
      return {
        isArchivingAllowed: isManualTrigger,
        mode: state.currentMode,
        reason: isManualTrigger 
          ? 'Manual archiving operation allowed'
          : 'Only manual archiving operations are permitted',
        requiresUserConsent: config.requiresExplicitConsent,
        requiresAdminApproval: false,
        complianceChecksRequired: config.complianceRequired,
        warnings,
        recommendations: isManualTrigger ? [] : ['Switch to scheduled or automatic mode for automated archiving']
      };
        
    case ArchiveToggleMode.SCHEDULED:
      const isScheduledOrManual = context.isScheduled || context.triggeredBy === 'user';
      if (!isScheduledOrManual) {
        warnings.push('Only scheduled and manual archiving operations are allowed');
      }
      return {
        isArchivingAllowed: isScheduledOrManual,
        mode: state.currentMode,
        reason: isScheduledOrManual
          ? 'Scheduled archiving operation allowed'
          : 'Only scheduled or manual operations are permitted',
        requiresUserConsent: config.requiresExplicitConsent,
        requiresAdminApproval: false,
        complianceChecksRequired: config.complianceRequired,
        warnings,
        recommendations: []
      };
        
    case ArchiveToggleMode.AUTOMATIC:
      return {
        isArchivingAllowed: true,
        mode: state.currentMode,
        reason: 'Full automatic archiving enabled',
        requiresUserConsent: config.requiresExplicitConsent,
        requiresAdminApproval: false,
        complianceChecksRequired: config.complianceRequired,
        warnings: [],
        recommendations: []
      };
        
    case ArchiveToggleMode.COMPLIANCE_ONLY:
      const hasComplianceRequirement = context.complianceRequirements && 
          context.complianceRequirements.length > 0;
      if (!hasComplianceRequirement) {
        warnings.push('Only compliance-required archiving is allowed');
      }
      return {
        isArchivingAllowed: hasComplianceRequirement || false,
        mode: state.currentMode,
        reason: hasComplianceRequirement
          ? 'Compliance-required archiving allowed'
          : 'No compliance requirement found',
        requiresUserConsent: config.requiresExplicitConsent,
        requiresAdminApproval: false,
        complianceChecksRequired: true,
        warnings,
        recommendations: hasComplianceRequirement ? [] : ['Add compliance requirements or change mode']
      };
        
    case ArchiveToggleMode.EMERGENCY:
      return {
        isArchivingAllowed: true,
        mode: state.currentMode,
        reason: 'Emergency archiving mode active',
        requiresUserConsent: false,
        requiresAdminApproval: config.requiresAdminApproval,
        complianceChecksRequired: false,
        warnings: ['Emergency mode bypasses normal constraints'],
        recommendations: ['Switch back to normal mode when emergency is resolved']
      };
        
    default:
      throw new Error(`Unknown archive toggle mode: ${state.currentMode}`);
    }
  }
  
  private getConfigurationChanges(
    previous: ArchiveToggleConfig, 
    updated: ArchiveToggleConfig
  ): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};
    
    const keys: (keyof ArchiveToggleConfig)[] = [
      'name', 'description', 'mode', 'enabledByDefault', 
      'requiresExplicitConsent', 'complianceRequired'
    ];
    
    for (const key of keys) {
      if (previous[key] !== updated[key]) {
        changes[key] = { from: previous[key], to: updated[key] };
      }
    }
    
    return changes;
  }
  
  private scheduleOverrideExpiration(toggleId: string, expiresAt: Date): void {
    const timeout = expiresAt.getTime() - Date.now();
    
    if (timeout > 0) {
      setTimeout(async () => {
        try {
          await this.expireOverride(toggleId);
        } catch (error) {
          console.error('Failed to expire override:', error);
        }
      }, timeout);
    }
  }
  
  private async expireOverride(toggleId: string): Promise<void> {

    const state = this.toggleStates.get(toggleId);
    const config = this.toggleConfigs.get(toggleId);
    
    if (!state || !config || !state.isOverridden) {
      return;
    }
    
    // Reset override
    const updatedState: ArchiveToggleState = {
      ...state,
      isEnabled: config.enabledByDefault,
      isOverridden: false,
      overrideExpiresAt: undefined,
      overrideReason: undefined,
      overrideApprovedBy: undefined,
      lastToggleTime: new Date(),
      toggledBy: 'system',
      toggleReason: 'Emergency override expired'
    };
    
    await this.storeToggleState(updatedState);
    this.toggleStates.set(toggleId, updatedState);
    
    // Create audit entry
    await this.createAuditEntry(toggleId, {
      id: this.generateAuditId(),
      timestamp: new Date(),
      action: ArchiveToggleAction.OVERRIDE_EXPIRED,
      actorId: 'system',
      actorType: 'system',
      previousState: { isOverridden: true },
      newState: { isOverridden: false },
      reason: 'Emergency override TTL expired',
      isEmergency: false
    });
    
    this.emit('override_expired', updatedState, config);
  }
  
  private async initializePredefinedToggles(): Promise<void> {

    try {
      for (const [key, presetConfig] of Object.entries(PREDEFINED_ARCHIVE_TOGGLE_CONFIGS)) {
        // Check if toggle already exists
        const existingToggle = Array.from(this.toggleConfigs.values())
          .find(c => c.name === presetConfig.name);
          
        if (!existingToggle) {
          await this.createArchiveToggle({
            name: presetConfig.name,
            description: presetConfig.description,
            scope: presetConfig.scope,
            mode: presetConfig.mode,
            enabledByDefault: presetConfig.enabledByDefault,
            requiresExplicitConsent: presetConfig.requiresExplicitConsent,
            complianceRequired: presetConfig.complianceRequired
          }, 'system');
        }
      }
    } catch (error) {
      console.error('Failed to initialize predefined toggles:', error);
    }
  }
  
  private setupEventHandlers(): void {
    // Listen to archive service events
    this.archiveService.on('archive_created', async (archive: ArchiveRecord) => {
      // Update statistics for related toggles
      const applicableToggles = this.findApplicableToggles({
        userId: archive.createdBy,
        archiveType: archive.archiveType,
        category: archive.category,
        dataClassification: archive.dataClassification,
        sourceIdentifier: archive.sourceIdentifier,
        triggeredBy: 'system',
        timestamp: new Date()
      });
      
      for (const toggleId of applicableToggles) {
        const state = this.toggleStates.get(toggleId);
        if (state) {
          const updatedState = {
            ...state,
            archiveOperationsCount: state.archiveOperationsCount + 1,
            lastArchiveOperation: new Date()
          };
          this.toggleStates.set(toggleId, updatedState);
          await this.storeToggleState(updatedState);
        }
      }
    });
  }
  
  private async loadToggleConfigurations(): Promise<void> {

    // Implementation would load from database
    // For now, this is a placeholder
  }
  
  private async storeToggleConfig(config: ArchiveToggleConfig): Promise<void> {

    // Implementation would store in database
    // Placeholder for database integration
  }
  
  private async storeToggleState(state: ArchiveToggleState): Promise<void> {

    // Implementation would store in database
    // Placeholder for database integration
  }
  
  private async createAuditEntry(toggleId: string, entry: ArchiveToggleAuditEntry): Promise<void> {

    // Implementation would store audit entry
    // For now, add to in-memory trail
    const state = this.toggleStates.get(toggleId);
    if (state) {
      state.auditTrail.push(entry);
      // Keep only last 100 entries in memory
      if (state.auditTrail.length > 100) {
        state.auditTrail = state.auditTrail.slice(-100);
      }
    }
  }
}

export default ArchiveToggleService;