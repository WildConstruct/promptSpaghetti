/**
 * Archive Toggle Types and Configuration (Epic 19)
 * 
 * This module provides types and constants for implementing toggle-based archiving
 * functionality as part of Epic 19's Data Protection & Privacy Controls.
 * 
 * Features:
 * - Toggle-controlled archiving policies
 * - Fine-grained archiving control per data type
 * - Compliance-aware archiving configuration
 * - Integration with Epic 17 Archive Management System
 * - Security event logging for audit trails
 */

import { ArchiveType, ArchiveCategory, DataClassification } from './ArchiveManagementService';

/**
 * Archive toggle states for different archiving modes
 */
export enum ArchiveToggleMode {
  DISABLED = 'disabled',           // All archiving disabled
  MANUAL_ONLY = 'manual_only',     // Only manual archiving allowed
  SCHEDULED = 'scheduled',         // Scheduled archiving only
  AUTOMATIC = 'automatic',         // Full automatic archiving
  COMPLIANCE_ONLY = 'compliance_only', // Only compliance-required archiving
  EMERGENCY = 'emergency'          // Emergency archiving mode
}

/**
 * Archive toggle scope for fine-grained control
 */
export enum ArchiveToggleScope {
  GLOBAL = 'global',                    // System-wide archiving control
  DATA_TYPE = 'data_type',              // Per data type archiving
  USER_DATA = 'user_data',              // User-specific data archiving
  COMPLIANCE_DATA = 'compliance_data',   // Compliance-required data
  TEMPORARY_DATA = 'temporary_data',     // Temporary/cache data
  LOG_DATA = 'log_data',                // Log and audit data
  SYSTEM_DATA = 'system_data',          // System configuration data
  BACKUP_DATA = 'backup_data'           // Backup and recovery data
}

/**
 * Archive toggle configuration for different data types
 */
export interface ArchiveToggleConfig {
  id: string;
  name: string;
  description: string;
  scope: ArchiveToggleScope;
  mode: ArchiveToggleMode;
  
  // Data type filters
  allowedArchiveTypes?: ArchiveType[];
  allowedCategories?: ArchiveCategory[];
  allowedClassifications?: DataClassification[];
  
  // Toggle behavior configuration
  enabledByDefault: boolean;
  requiresExplicitConsent: boolean;
  respectsRetentionPolicies: boolean;
  
  // Compliance and security settings
  complianceRequired: boolean;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  soxCompliant: boolean;
  
  // Notification and audit settings
  auditArchiveOperations: boolean;
  notifyOnToggleChange: boolean;
  securityEventLogging: boolean;
  
  // Emergency and override settings
  allowEmergencyOverride: boolean;
  emergencyOverrideTtlMinutes: number;
  requiresAdminApproval: boolean;
  
  // Integration settings
  integrateWithRetentionPolicies: boolean;
  respectUserConsentSettings: boolean;
  
  // Metadata
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  
  // Custom configuration
  customSettings?: Record<string, unknown>;
}

/**
 * Archive toggle state for runtime evaluation
 */
export interface ArchiveToggleState {
  configId: string;
  orgId?: string;
  userId?: string;
  
  // Current state
  isEnabled: boolean;
  currentMode: ArchiveToggleMode;
  
  // Context information
  lastToggleTime?: Date;
  toggledBy?: string;
  toggleReason?: string;
  
  // Emergency override state
  isOverridden: boolean;
  overrideExpiresAt?: Date;
  overrideReason?: string;
  overrideApprovedBy?: string;
  
  // Compliance and consent state
  hasUserConsent?: boolean;
  complianceStatus: ComplianceStatus;
  lastConsentCheck?: Date;
  
  // Statistics
  archiveOperationsCount: number;
  lastArchiveOperation?: Date;
  failedArchiveOperations: number;
  
  // Audit trail
  auditTrail: ArchiveToggleAuditEntry[];
}

/**
 * Compliance status for archiving operations
 */
export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review',
  REQUIRES_CONSENT = 'requires_consent',
  UNKNOWN = 'unknown'
}

/**
 * Audit trail entry for archive toggle operations
 */
export interface ArchiveToggleAuditEntry {
  id: string;
  timestamp: Date;
  action: ArchiveToggleAction;
  actorId: string;
  actorType: 'user' | 'system' | 'admin';
  
  // State changes
  previousState?: Partial<ArchiveToggleState>;
  newState?: Partial<ArchiveToggleState>;
  
  // Context
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  isEmergency: boolean;
  
  // Related operations
  relatedArchiveIds?: string[];
  impactedDataTypes?: string[];
  
  // Compliance context
  complianceContext?: {
    regulation: string;
    requirementId: string;
    justification: string;
  };
}

/**
 * Archive toggle actions for audit logging
 */
export enum ArchiveToggleAction {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  MODE_CHANGED = 'mode_changed',
  SCOPE_UPDATED = 'scope_updated',
  EMERGENCY_OVERRIDE = 'emergency_override',
  OVERRIDE_EXPIRED = 'override_expired',
  COMPLIANCE_CHECK = 'compliance_check',
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_REVOKED = 'consent_revoked',
  CONFIG_UPDATED = 'config_updated',
  ARCHIVE_OPERATION_TRIGGERED = 'archive_operation_triggered',
  ARCHIVE_OPERATION_BLOCKED = 'archive_operation_blocked'
}

/**
 * Request interface for creating archive toggles
 */
export interface CreateArchiveToggleRequest {
  name: string;
  description: string;
  scope: ArchiveToggleScope;
  mode: ArchiveToggleMode;
  enabledByDefault?: boolean;
  requiresExplicitConsent?: boolean;
  complianceRequired?: boolean;
  customSettings?: Record<string, unknown>;
  orgId?: string;
}

/**
 * Request interface for updating archive toggles
 */
export interface UpdateArchiveToggleRequest {
  id: string;
  name?: string;
  description?: string;
  mode?: ArchiveToggleMode;
  enabledByDefault?: boolean;
  requiresExplicitConsent?: boolean;
  complianceRequired?: boolean;
  reason: string;
  customSettings?: Record<string, unknown>;
}

/**
 * Archive toggle evaluation context for runtime decisions
 */
export interface ArchiveToggleEvaluationContext {
  userId?: string;
  orgId?: string;
  archiveType: ArchiveType;
  category: ArchiveCategory;
  dataClassification: DataClassification;
  sourceIdentifier: string;
  
  // Compliance context
  complianceRequirements?: string[];
  hasUserConsent?: boolean;
  
  // Operational context
  isEmergency?: boolean;
  isScheduled?: boolean;
  triggeredBy: 'user' | 'system' | 'policy' | 'emergency';
  
  // Metadata
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Archive toggle evaluation result
 */
export interface ArchiveToggleEvaluationResult {
  configId: string;
  isArchivingAllowed: boolean;
  mode: ArchiveToggleMode;
  reason: string;
  
  // Conditions that must be met
  requiresUserConsent: boolean;
  requiresAdminApproval: boolean;
  complianceChecksRequired: boolean;
  
  // Warnings and recommendations
  warnings: string[];
  recommendations: string[];
  
  // Audit information
  evaluationId: string;
  evaluatedAt: Date;
  evaluatedBy: string;
  
  // Related policies and configurations
  relatedRetentionPolicies: string[];
  appliedComplianceRules: string[];
}

/**
 * Pre-defined archive toggle configurations for common scenarios
 */
export const PREDEFINED_ARCHIVE_TOGGLE_CONFIGS = {
  // GDPR Compliant User Data Archiving
  GDPR_USER_DATA: {
    name: 'GDPR User Data Archive Toggle',
    description: 'Controls archiving of user data in compliance with GDPR regulations',
    scope: ArchiveToggleScope.USER_DATA,
    mode: ArchiveToggleMode.MANUAL_ONLY,
    enabledByDefault: false,
    requiresExplicitConsent: true,
    complianceRequired: true,
    gdprCompliant: true,
    respectsRetentionPolicies: true,
    auditArchiveOperations: true,
    allowedCategories: ['user_data', 'application_data'],
    allowedClassifications: ['internal', 'confidential']
  },
  
  // System Logs Archiving
  SYSTEM_LOGS: {
    name: 'System Logs Archive Toggle',
    description: 'Controls automated archiving of system logs and audit trails',
    scope: ArchiveToggleScope.LOG_DATA,
    mode: ArchiveToggleMode.AUTOMATIC,
    enabledByDefault: true,
    requiresExplicitConsent: false,
    complianceRequired: true,
    soxCompliant: true,
    respectsRetentionPolicies: true,
    auditArchiveOperations: true,
    allowedCategories: ['log_data', 'system_data'],
    allowedTypes: ['log_archive', 'system_snapshot']
  },
  
  // Emergency Backup Archiving
  EMERGENCY_BACKUP: {
    name: 'Emergency Backup Archive Toggle',
    description: 'Emergency archiving for critical system data and backups',
    scope: ArchiveToggleScope.BACKUP_DATA,
    mode: ArchiveToggleMode.EMERGENCY,
    enabledByDefault: false,
    requiresExplicitConsent: false,
    complianceRequired: false,
    allowEmergencyOverride: true,
    emergencyOverrideTtlMinutes: 60,
    requiresAdminApproval: true,
    auditArchiveOperations: true,
    allowedCategories: ['backup_data', 'system_data'],
    allowedTypes: ['full_backup', 'incremental_backup']
  },
  
  // Compliance Data Archiving
  COMPLIANCE_DATA: {
    name: 'Compliance Data Archive Toggle',
    description: 'Archiving of data required for regulatory compliance',
    scope: ArchiveToggleScope.COMPLIANCE_DATA,
    mode: ArchiveToggleMode.SCHEDULED,
    enabledByDefault: true,
    requiresExplicitConsent: false,
    complianceRequired: true,
    gdprCompliant: true,
    hipaaCompliant: true,
    soxCompliant: true,
    respectsRetentionPolicies: true,
    integrateWithRetentionPolicies: true,
    auditArchiveOperations: true,
    allowedCategories: ['compliance_data', 'analytics_data'],
    allowedClassifications: ['confidential', 'restricted']
  }
} as const;

/**
 * Default toggle configuration values
 */
export const DEFAULT_ARCHIVE_TOGGLE_CONFIG: Partial<ArchiveToggleConfig> = {
  enabledByDefault: false,
  requiresExplicitConsent: true,
  respectsRetentionPolicies: true,
  complianceRequired: false,
  gdprCompliant: false,
  hipaaCompliant: false,
  soxCompliant: false,
  auditArchiveOperations: true,
  notifyOnToggleChange: true,
  securityEventLogging: true,
  allowEmergencyOverride: false,
  emergencyOverrideTtlMinutes: 60,
  requiresAdminApproval: false,
  integrateWithRetentionPolicies: true,
  respectUserConsentSettings: true,
  version: 1
};

export default {
  ArchiveToggleMode,
  ArchiveToggleScope,
  ComplianceStatus,
  ArchiveToggleAction,
  PREDEFINED_ARCHIVE_TOGGLE_CONFIGS,
  DEFAULT_ARCHIVE_TOGGLE_CONFIG
};