/**
 * Enhanced Change Recording Service - Epic 17.1.6
 * 
 * Advanced change tracking system with field-level detection, change history,
 * and intelligent diff generation for comprehensive audit logging.
 * 
 * Task: E17-1753114396840-63D0F4 - Implement change recording
 * Epic: 17 - Backstage Admin Controls, Substory: 17.1.6 (Audit Logging)
 */

import { EventEmitter } from 'events';
import { AuditService } from './audit-service';
import {
  AuditEvent,
  AuditEventType,
  AuditCategory,
  AuditSeverity,
  AuditContext,
  CreateAuditEventRequest
} from '../database/audit-models';

export interface ChangeRecord {
  id: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  changeType: ChangeType;
  
  // Change details
  fieldChanges: FieldChange[];
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  changeHash: string; // For deduplication
  
  // Change context
  changeContext: ChangeContext;
  changeMetadata: ChangeMetadata;
  
  // Change analysis
  changeAnalysis: ChangeAnalysis;
  impactAssessment: ImpactAssessment;
  
  // Compliance tracking
  complianceRelevance: ComplianceRelevance;
  
  // Timing information
  timestamp: Date;
  duration?: number; // Time to apply change
  
  // Relationship tracking
  parentChangeId?: string; // For cascading changes
  childChangeIds: string[]; // Changes triggered by this change
  correlationId?: string; // Group related changes
  
  // Audit integration
  auditEventId?: string;
  
  // Status
  status: ChangeStatus;
  validationResults?: ValidationResult[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldChange {
  fieldPath: string; // Dot notation path (e.g., 'user.profile.email')
  fieldType: FieldType;
  oldValue: any;
  newValue: any;
  changeOperation: ChangeOperation;
  
  // Change analysis
  changeSignificance: ChangeSeverity;
  dataType: string;
  isSecurityRelevant: boolean;
  isComplianceRelevant: boolean;
  
  // Validation
  validationStatus: 'valid' | 'invalid' | 'warning';
  validationMessages: string[];
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface ChangeContext {
  actorId?: string;
  actorType: 'user' | 'system' | 'service' | 'automation';
  actorEmail?: string;
  actorRole?: string;
  
  // Change trigger
  trigger: ChangeTrigger;
  triggerDetails?: Record<string, any>;
  
  // Request context
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Business context
  businessReason?: string;
  changeRequest?: string;
  approvalRequired: boolean;
  approvedBy?: string[];
}

export interface ChangeMetadata {
  // Change classification
  category: ChangeCategory;
  criticality: ChangeCriticality;
  riskLevel: RiskLevel;
  
  // Impact scope
  affectedSystems: string[];
  affectedUsers: string[];
  affectedResources: string[];
  
  // Change characteristics
  isReversible: boolean;
  hasBackup: boolean;
  requiresDowntime: boolean;
  
  // Compliance flags
  requiresDataRetention: boolean;
  containsPII: boolean;
  containsSensitiveData: boolean;
  
  // Additional metadata
  tags: string[];
  customAttributes: Record<string, any>;
}

export interface ChangeAnalysis {
  // Change complexity
  complexity: 'simple' | 'moderate' | 'complex' | 'critical';
  changeScore: number; // 0-100 scale
  
  // Pattern analysis
  patterns: ChangePattern[];
  anomalies: ChangeAnomaly[];
  
  // Frequency analysis
  isFrequentChange: boolean;
  changeFrequency: number; // Changes per day
  lastSimilarChange?: Date;
  
  // Relationship analysis
  relatedChanges: string[];
  dependentChanges: string[];
  conflictingChanges: string[];
  
  // Risk analysis
  riskFactors: RiskFactor[];
  mitigationActions: string[];
}

export interface ImpactAssessment {
  // Impact scope
  scope: ImpactScope;
  severity: ImpactSeverity;
  
  // Affected entities
  affectedEntities: AffectedEntity[];
  
  // Business impact
  businessImpact: BusinessImpact;
  technicalImpact: TechnicalImpact;
  securityImpact: SecurityImpact;
  complianceImpact: ComplianceImpact;
  
  // Recovery information
  recoveryTime?: number; // Estimated minutes to recover
  rollbackPlan?: string;
  rollbackComplexity: 'simple' | 'moderate' | 'complex' | 'impossible';
}

export interface ComplianceRelevance {
  isComplianceRelevant: boolean;
  relevantStandards: string[];
  requiresDocumentation: boolean;
  requiresApproval: boolean;
  requiresNotification: boolean;
  
  // Data subject rights (GDPR)
  affectsDataSubjectRights: boolean;
  dataSubjects?: string[];
  
  // Retention requirements
  retentionPeriod?: number; // days
  specialRetentionRules?: string[];
  
  // Legal implications
  hasLegalImplications: boolean;
  legalReviewRequired: boolean;
  
  // Export restrictions
  requiresExportControl: boolean;
  exportClassification?: string;
}

export interface ValidationResult {
  validator: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  severity: ValidationSeverity;
  remediation?: string;
}

export interface ChangePattern {
  patternType: 'bulk_change' | 'cascading_change' | 'rollback' | 'configuration_drift' | 'data_migration';
  confidence: number;
  description: string;
  relatedChanges: string[];
}

export interface ChangeAnomaly {
  anomalyType: 'unusual_timing' | 'unexpected_actor' | 'suspicious_pattern' | 'high_volume' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  riskScore: number;
  recommendedAction: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  likelihood: number; // 0-100%
  impact: number; // 0-100
  mitigations: string[];
}

export interface AffectedEntity {
  entityType: string;
  entityId: string;
  entityName?: string;
  impactLevel: 'minimal' | 'moderate' | 'significant' | 'severe';
  impactDescription: string;
}

export interface BusinessImpact {
  severity: ImpactSeverity;
  description: string;
  affectedProcesses: string[];
  estimatedCost?: number;
  revenueImpact?: number;
  customerImpact: CustomerImpact;
}

export interface TechnicalImpact {
  severity: ImpactSeverity;
  description: string;
  affectedSystems: string[];
  performanceImpact?: PerformanceImpact;
  availabilityImpact?: AvailabilityImpact;
  dataIntegrityImpact?: DataIntegrityImpact;
}

export interface SecurityImpact {
  severity: ImpactSeverity;
  description: string;
  securityRisks: SecurityRisk[];
  privilegeChanges: PrivilegeChange[];
  accessChanges: AccessChange[];
}

export interface ComplianceImpact {
  severity: ImpactSeverity;
  description: string;
  affectedStandards: string[];
  violations: ComplianceViolation[];
  requiredActions: string[];
}

export interface ChangeHistory {
  resourceType: string;
  resourceId: string;
  changeRecords: ChangeRecord[];
  firstChange: Date;
  lastChange: Date;
  totalChanges: number;
  
  // Analysis
  changeFrequency: number;
  averageChangesPerMonth: number;
  mostActiveUsers: string[];
  mostCommonChangeTypes: ChangeType[];
  
  // Statistics
  statistics: ChangeStatistics;
  trends: ChangeTrend[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangeStatistics {
  totalChanges: number;
  changesByType: Record<ChangeType, number>;
  changesByCategory: Record<ChangeCategory, number>;
  changesByCriticality: Record<ChangeCriticality, number>;
  changesByActor: Record<string, number>;
  
  averageChangeComplexity: number;
  highRiskChanges: number;
  reversedChanges: number;
  failedChanges: number;
  
  complianceMetrics: {
    complianceRelevantChanges: number;
    gdprRelevantChanges: number;
    approvedChanges: number;
    auditedChanges: number;
  };
}

export interface ChangeTrend {
  period: 'daily' | 'weekly' | 'monthly';
  metric: string;
  values: Array<{
    timestamp: Date;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changePercent: number;
}

// Enums
export type ChangeType = 
  | 'create'
  | 'update' 
  | 'delete'
  | 'restore'
  | 'archive'
  | 'enable'
  | 'disable'
  | 'configure'
  | 'migrate'
  | 'bulk_update'
  | 'rollback';

export type FieldType = 
  | 'primitive'
  | 'object'
  | 'array'
  | 'complex'
  | 'encrypted'
  | 'sensitive'
  | 'computed'
  | 'reference';

export type ChangeOperation = 
  | 'set'
  | 'unset'
  | 'add'
  | 'remove'
  | 'update'
  | 'replace'
  | 'append'
  | 'prepend'
  | 'increment'
  | 'decrement';

export type ChangeSeverity = 
  | 'trivial'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'critical';

export type ChangeTrigger = 
  | 'user_action'
  | 'api_call'
  | 'scheduled_task'
  | 'automation'
  | 'system_event'
  | 'data_migration'
  | 'configuration_change'
  | 'emergency_fix';

export type ChangeCategory = 
  | 'configuration'
  | 'user_data'
  | 'system_data'
  | 'security'
  | 'permissions'
  | 'settings'
  | 'content'
  | 'metadata'
  | 'structure';

export type ChangeCriticality = 
  | 'routine'
  | 'standard'
  | 'high'
  | 'emergency';

export type RiskLevel = 
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

export type ImpactScope = 
  | 'single_resource'
  | 'multiple_resources'
  | 'system_wide'
  | 'cross_system'
  | 'organization_wide';

export type ImpactSeverity = 
  | 'negligible'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'severe';

export type ChangeStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rolled_back';

export type ValidationSeverity = 
  | 'info'
  | 'warning'
  | 'error'
  | 'critical';

export interface CustomerImpact {
  affectedCustomers: number;
  severity: ImpactSeverity;
  communicationRequired: boolean;
  compensationRequired: boolean;
}

export interface PerformanceImpact {
  responseTimeChange: number; // percentage
  throughputChange: number; // percentage
  resourceUtilizationChange: number; // percentage
  description: string;
}

export interface AvailabilityImpact {
  downtime: number; // minutes
  affectedServices: string[];
  userImpact: number; // affected users
  description: string;
}

export interface DataIntegrityImpact {
  dataConsistencyRisk: RiskLevel;
  backupRequired: boolean;
  validationRequired: boolean;
  description: string;
}

export interface SecurityRisk {
  riskType: string;
  severity: ImpactSeverity;
  description: string;
  mitigations: string[];
}

export interface PrivilegeChange {
  type: 'grant' | 'revoke' | 'modify';
  privilege: string;
  target: string;
  justification: string;
}

export interface AccessChange {
  type: 'grant' | 'revoke' | 'modify';
  resource: string;
  permissions: string[];
  target: string;
}

export interface ComplianceViolation {
  standard: string;
  violationType: string;
  severity: ImpactSeverity;
  description: string;
  remediation: string[];
}

/**
 * Change Recording Service
 * 
 * Provides advanced change tracking capabilities with detailed analysis,
 * impact assessment, and compliance tracking.
 */
export class ChangeRecordingService extends EventEmitter {
  private changeRecords: Map<string, ChangeRecord> = new Map();
  private changeHistories: Map<string, ChangeHistory> = new Map();
  private auditService: AuditService;

  constructor(auditService: AuditService) {
    super();
    this.auditService = auditService;
  }

  /**
   * Record a comprehensive change with full analysis
   */
  async recordChange(
    resourceType: string,
    resourceId: string,
    beforeState: Record<string, any>,
    afterState: Record<string, any>,
    context: ChangeContext,
    options: ChangeRecordingOptions = {}
  ): Promise<ChangeRecord> {
    const changeId = this.generateChangeId();
    
    // Generate field-level changes
    const fieldChanges = this.analyzeFieldChanges(beforeState, afterState);
    
    // Determine change type
    const changeType = this.determineChangeType(beforeState, afterState, context);
    
    // Generate change hash for deduplication
    const changeHash = this.generateChangeHash(resourceType, resourceId, fieldChanges);
    
    // Check for duplicate changes (within last 5 minutes)
    if (await this.isDuplicateChange(changeHash, options.deduplicationWindow || 300000)) {
      return this.getChangeByHash(changeHash)!;
    }
    
    // Analyze the change
    const changeAnalysis = await this.analyzeChange(
      resourceType, 
      resourceId, 
      fieldChanges, 
      beforeState, 
      afterState, 
      context
    );
    
    // Assess impact
    const impactAssessment = await this.assessImpact(
      resourceType, 
      resourceId, 
      fieldChanges, 
      changeAnalysis, 
      context
    );
    
    // Determine compliance relevance
    const complianceRelevance = await this.assessComplianceRelevance(
      resourceType, 
      fieldChanges, 
      impactAssessment, 
      context
    );
    
    // Create change metadata
    const changeMetadata = this.createChangeMetadata(
      resourceType, 
      fieldChanges, 
      impactAssessment, 
      complianceRelevance
    );
    
    // Validate the change
    const validationResults = await this.validateChange(
      resourceType, 
      resourceId, 
      fieldChanges, 
      context, 
      options
    );
    
    // Create the change record
    const changeRecord: ChangeRecord = {
      id: changeId,
      resourceType,
      resourceId,
      resourceName: context.triggerDetails?.resourceName,
      changeType,
      fieldChanges,
      beforeState,
      afterState,
      changeHash,
      changeContext: context,
      changeMetadata,
      changeAnalysis,
      impactAssessment,
      complianceRelevance,
      timestamp: new Date(),
      parentChangeId: options.parentChangeId,
      childChangeIds: [],
      correlationId: context.correlationId,
      status: 'completed',
      validationResults,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store the change record
    this.changeRecords.set(changeId, changeRecord);
    
    // Update change history
    await this.updateChangeHistory(resourceType, resourceId, changeRecord);
    
    // Link to parent change if specified
    if (options.parentChangeId) {
      await this.linkToParentChange(options.parentChangeId, changeId);
    }
    
    // Create audit event
    if (options.createAuditEvent !== false) {
      const auditEvent = await this.createAuditEvent(changeRecord, context);
      changeRecord.auditEventId = auditEvent;
    }
    
    // Emit change event
    this.emit('changeRecorded', {
      changeRecord,
      context,
      metadata: { 
        complexity: changeAnalysis.complexity,
        riskLevel: changeMetadata.riskLevel,
        complianceRelevant: complianceRelevance.isComplianceRelevant
      }
    });
    
    return changeRecord;
  }

  /**
   * Record a bulk change operation
   */
  async recordBulkChange(
    changes: Array<{
      resourceType: string;
      resourceId: string;
      beforeState: Record<string, any>;
      afterState: Record<string, any>;
    }>,
    context: ChangeContext,
    options: BulkChangeRecordingOptions = {}
  ): Promise<ChangeRecord[]> {
    const bulkChangeId = this.generateChangeId();
    const changeRecords: ChangeRecord[] = [];
    
    // Create parent bulk change record
    const bulkContext: ChangeContext = {
      ...context,
      correlationId: bulkChangeId,
      trigger: 'automation',
      triggerDetails: {
        ...context.triggerDetails,
        bulkOperation: true,
        totalChanges: changes.length
      }
    };
    
    // Process each change
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      
      try {
        const changeRecord = await this.recordChange(
          change.resourceType,
          change.resourceId,
          change.beforeState,
          change.afterState,
          {
            ...bulkContext,
            triggerDetails: {
              ...bulkContext.triggerDetails,
              bulkIndex: i,
              bulkTotal: changes.length
            }
          },
          {
            ...options,
            parentChangeId: bulkChangeId,
            createAuditEvent: i === 0 || options.auditEachChange // Only audit first change unless specified
          }
        );
        
        changeRecords.push(changeRecord);
        
      } catch (error) {
        console.error(`Failed to record change ${i}:`, error);
        
        // Create failed change record
        const failedRecord: ChangeRecord = {
          id: this.generateChangeId(),
          resourceType: change.resourceType,
          resourceId: change.resourceId,
          changeType: 'update',
          fieldChanges: [],
          beforeState: change.beforeState,
          afterState: change.afterState,
          changeHash: '',
          changeContext: bulkContext,
          changeMetadata: {
            category: 'user_data',
            criticality: 'routine',
            riskLevel: 'low',
            affectedSystems: [],
            affectedUsers: [],
            affectedResources: [],
            isReversible: false,
            hasBackup: false,
            requiresDowntime: false,
            requiresDataRetention: false,
            containsPII: false,
            containsSensitiveData: false,
            tags: ['bulk_change', 'failed'],
            customAttributes: {}
          },
          changeAnalysis: {
            complexity: 'simple',
            changeScore: 0,
            patterns: [],
            anomalies: [],
            isFrequentChange: false,
            changeFrequency: 0,
            relatedChanges: [],
            dependentChanges: [],
            conflictingChanges: [],
            riskFactors: [],
            mitigationActions: []
          },
          impactAssessment: {
            scope: 'single_resource',
            severity: 'negligible',
            affectedEntities: [],
            businessImpact: {
              severity: 'negligible',
              description: 'No business impact',
              affectedProcesses: [],
              customerImpact: {
                affectedCustomers: 0,
                severity: 'negligible',
                communicationRequired: false,
                compensationRequired: false
              }
            },
            technicalImpact: {
              severity: 'negligible',
              description: 'No technical impact',
              affectedSystems: []
            },
            securityImpact: {
              severity: 'negligible',
              description: 'No security impact',
              securityRisks: [],
              privilegeChanges: [],
              accessChanges: []
            },
            complianceImpact: {
              severity: 'negligible',
              description: 'No compliance impact',
              affectedStandards: [],
              violations: [],
              requiredActions: []
            },
            rollbackComplexity: 'impossible'
          },
          complianceRelevance: {
            isComplianceRelevant: false,
            relevantStandards: [],
            requiresDocumentation: false,
            requiresApproval: false,
            requiresNotification: false,
            affectsDataSubjectRights: false,
            hasLegalImplications: false,
            legalReviewRequired: false,
            requiresExportControl: false
          },
          timestamp: new Date(),
          parentChangeId: bulkChangeId,
          childChangeIds: [],
          status: 'failed',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        changeRecords.push(failedRecord);
      }
    }
    
    return changeRecords;
  }

  /**
   * Get change history for a resource
   */
  async getChangeHistory(
    resourceType: string, 
    resourceId: string,
    options: ChangeHistoryOptions = {}
  ): Promise<ChangeHistory | null> {
    const historyKey = `${resourceType}:${resourceId}`;
    let history = this.changeHistories.get(historyKey);
    
    if (!history) {
      // Create history from existing records
      const records = Array.from(this.changeRecords.values())
        .filter(r => r.resourceType === resourceType && r.resourceId === resourceId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (records.length === 0) {
        return null;
      }
      
      history = await this.buildChangeHistory(resourceType, resourceId, records);
      this.changeHistories.set(historyKey, history);
    }
    
    // Apply filters if specified
    if (options.startDate || options.endDate || options.changeTypes || options.actors) {
      history = this.filterChangeHistory(history, options);
    }
    
    return history;
  }

  /**
   * Get change records with filtering and pagination
   */
  async getChangeRecords(filter: ChangeRecordFilter = {}): Promise<ChangeRecordResponse> {
    let records = Array.from(this.changeRecords.values());
    
    // Apply filters
    if (filter.resourceTypes?.length) {
      records = records.filter(r => filter.resourceTypes!.includes(r.resourceType));
    }
    
    if (filter.resourceIds?.length) {
      records = records.filter(r => filter.resourceIds!.includes(r.resourceId));
    }
    
    if (filter.changeTypes?.length) {
      records = records.filter(r => filter.changeTypes!.includes(r.changeType));
    }
    
    if (filter.actors?.length) {
      records = records.filter(r => 
        r.changeContext.actorId && filter.actors!.includes(r.changeContext.actorId)
      );
    }
    
    if (filter.startDate) {
      records = records.filter(r => r.timestamp >= filter.startDate!);
    }
    
    if (filter.endDate) {
      records = records.filter(r => r.timestamp <= filter.endDate!);
    }
    
    if (filter.riskLevels?.length) {
      records = records.filter(r => filter.riskLevels!.includes(r.changeMetadata.riskLevel));
    }
    
    if (filter.complianceRelevant !== undefined) {
      records = records.filter(r => 
        r.complianceRelevance.isComplianceRelevant === filter.complianceRelevant
      );
    }
    
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      records = records.filter(r => 
        r.resourceName?.toLowerCase().includes(term) ||
        r.changeContext.businessReason?.toLowerCase().includes(term) ||
        r.fieldChanges.some(fc => fc.fieldPath.toLowerCase().includes(term))
      );
    }
    
    // Sort records
    const sortBy = filter.sortBy || 'timestamp';
    const sortOrder = filter.sortOrder || 'desc';
    
    records.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'timestamp':
          aVal = a.timestamp.getTime();
          bVal = b.timestamp.getTime();
          break;
        case 'riskLevel':
          aVal = this.getRiskLevelScore(a.changeMetadata.riskLevel);
          bVal = this.getRiskLevelScore(b.changeMetadata.riskLevel);
          break;
        case 'complexity':
          aVal = this.getComplexityScore(a.changeAnalysis.complexity);
          bVal = this.getComplexityScore(b.changeAnalysis.complexity);
          break;
        default:
          aVal = bVal = 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
    
    // Apply pagination
    const page = filter.page || 1;
    const limit = filter.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedRecords = records.slice(startIndex, endIndex);
    
    return {
      records: paginatedRecords,
      pagination: {
        page,
        limit,
        total: records.length,
        totalPages: Math.ceil(records.length / limit)
      },
      summary: {
        totalChanges: records.length,
        changesByType: this.groupBy(records, r => r.changeType),
        changesByRisk: this.groupBy(records, r => r.changeMetadata.riskLevel),
        complianceRelevantChanges: records.filter(r => r.complianceRelevance.isComplianceRelevant).length,
        highRiskChanges: records.filter(r => ['high', 'very_high'].includes(r.changeMetadata.riskLevel)).length
      }
    };
  }

  // Private helper methods
  
  private analyzeFieldChanges(
    beforeState: Record<string, any>, 
    afterState: Record<string, any>
  ): FieldChange[] {
    const changes: FieldChange[] = [];
    const allKeys = new Set([
      ...this.getNestedKeys(beforeState),
      ...this.getNestedKeys(afterState)
    ]);
    
    for (const key of allKeys) {
      const oldValue = this.getNestedValue(beforeState, key);
      const newValue = this.getNestedValue(afterState, key);
      
      if (!this.isEqual(oldValue, newValue)) {
        const operation = this.determineOperation(oldValue, newValue);
        const fieldType = this.determineFieldType(newValue || oldValue);
        const significance = this.assessFieldSignificance(key, oldValue, newValue);
        
        changes.push({
          fieldPath: key,
          fieldType,
          oldValue,
          newValue,
          changeOperation: operation,
          changeSignificance: significance,
          dataType: typeof (newValue || oldValue),
          isSecurityRelevant: this.isSecurityRelevantField(key),
          isComplianceRelevant: this.isComplianceRelevantField(key),
          validationStatus: 'valid',
          validationMessages: []
        });
      }
    }
    
    return changes;
  }

  private async analyzeChange(
    resourceType: string,
    resourceId: string,
    fieldChanges: FieldChange[],
    beforeState: Record<string, any>,
    afterState: Record<string, any>,
    context: ChangeContext
  ): Promise<ChangeAnalysis> {
    // Calculate complexity score
    const complexity = this.calculateComplexity(fieldChanges, beforeState, afterState);
    const changeScore = this.calculateChangeScore(fieldChanges, complexity);
    
    // Detect patterns
    const patterns = await this.detectPatterns(resourceType, resourceId, fieldChanges, context);
    
    // Detect anomalies
    const anomalies = await this.detectAnomalies(resourceType, resourceId, fieldChanges, context);
    
    // Analyze frequency
    const { isFrequentChange, changeFrequency, lastSimilarChange } = 
      await this.analyzeFrequency(resourceType, resourceId, fieldChanges);
    
    // Find relationships
    const relatedChanges = await this.findRelatedChanges(resourceType, resourceId, fieldChanges);
    
    // Assess risks
    const riskFactors = this.assessRiskFactors(fieldChanges, context, patterns, anomalies);
    
    return {
      complexity,
      changeScore,
      patterns,
      anomalies,
      isFrequentChange,
      changeFrequency,
      lastSimilarChange,
      relatedChanges,
      dependentChanges: [], // TODO: Implement dependency analysis
      conflictingChanges: [], // TODO: Implement conflict detection
      riskFactors,
      mitigationActions: riskFactors.flatMap(rf => rf.mitigations)
    };
  }

  private async assessImpact(
    resourceType: string,
    resourceId: string,
    fieldChanges: FieldChange[],
    analysis: ChangeAnalysis,
    context: ChangeContext
  ): Promise<ImpactAssessment> {
    // Determine scope
    const scope = this.determineImpactScope(resourceType, fieldChanges, analysis);
    
    // Assess severity
    const severity = this.assessImpactSeverity(fieldChanges, analysis, scope);
    
    // Find affected entities
    const affectedEntities = await this.findAffectedEntities(resourceType, resourceId, fieldChanges);
    
    // Assess different impact types
    const businessImpact = this.assessBusinessImpact(fieldChanges, analysis, affectedEntities);
    const technicalImpact = this.assessTechnicalImpact(fieldChanges, analysis, affectedEntities);
    const securityImpact = this.assessSecurityImpact(fieldChanges, analysis, context);
    const complianceImpact = this.assessComplianceImpact(fieldChanges, analysis, resourceType);
    
    // Determine rollback complexity
    const rollbackComplexity = this.assessRollbackComplexity(fieldChanges, analysis);
    
    return {
      scope,
      severity,
      affectedEntities,
      businessImpact,
      technicalImpact,
      securityImpact,
      complianceImpact,
      rollbackComplexity
    };
  }

  private async assessComplianceRelevance(
    resourceType: string,
    fieldChanges: FieldChange[],
    impact: ImpactAssessment,
    context: ChangeContext
  ): Promise<ComplianceRelevance> {
    const isComplianceRelevant = fieldChanges.some(fc => fc.isComplianceRelevant) ||
                                impact.complianceImpact.severity !== 'negligible';
    
    const relevantStandards = this.determineRelevantStandards(resourceType, fieldChanges);
    
    const requiresDocumentation = isComplianceRelevant && 
      ['high', 'very_high'].includes(impact.severity);
    
    const requiresApproval = context.approvalRequired || 
      (isComplianceRelevant && impact.severity === 'severe');
    
    const affectsDataSubjectRights = this.affectsDataSubjectRights(fieldChanges);
    
    return {
      isComplianceRelevant,
      relevantStandards,
      requiresDocumentation,
      requiresApproval,
      requiresNotification: requiresApproval,
      affectsDataSubjectRights,
      dataSubjects: affectsDataSubjectRights ? await this.getAffectedDataSubjects(fieldChanges) : [],
      retentionPeriod: this.calculateRetentionPeriod(relevantStandards, resourceType),
      hasLegalImplications: impact.complianceImpact.violations.length > 0,
      legalReviewRequired: impact.complianceImpact.violations.some(v => v.severity === 'severe'),
      requiresExportControl: this.requiresExportControl(fieldChanges, context)
    };
  }

  private createChangeMetadata(
    resourceType: string,
    fieldChanges: FieldChange[],
    impact: ImpactAssessment,
    compliance: ComplianceRelevance
  ): ChangeMetadata {
    return {
      category: this.categorizeChange(resourceType, fieldChanges),
      criticality: this.assessCriticality(impact, compliance),
      riskLevel: this.assessRiskLevel(fieldChanges, impact),
      affectedSystems: impact.affectedEntities
        .filter(e => e.entityType === 'system')
        .map(e => e.entityId),
      affectedUsers: impact.affectedEntities
        .filter(e => e.entityType === 'user')
        .map(e => e.entityId),
      affectedResources: impact.affectedEntities.map(e => e.entityId),
      isReversible: impact.rollbackComplexity !== 'impossible',
      hasBackup: true, // TODO: Check if backup exists
      requiresDowntime: impact.technicalImpact.availabilityImpact?.downtime > 0,
      requiresDataRetention: compliance.isComplianceRelevant,
      containsPII: this.containsPII(fieldChanges),
      containsSensitiveData: this.containsSensitiveData(fieldChanges),
      tags: this.generateTags(resourceType, fieldChanges, impact, compliance),
      customAttributes: {}
    };
  }

  private async createAuditEvent(
    changeRecord: ChangeRecord,
    context: ChangeContext
  ): Promise<string> {
    const auditRequest: CreateAuditEventRequest = {
      eventType: this.mapToAuditEventType(changeRecord.changeType),
      category: this.mapToAuditCategory(changeRecord.changeMetadata.category),
      severity: this.mapToAuditSeverity(changeRecord.changeMetadata.criticality),
      resourceType: changeRecord.resourceType,
      resourceId: changeRecord.resourceId,
      resourceName: changeRecord.resourceName,
      action: changeRecord.changeType,
      description: this.generateChangeDescription(changeRecord),
      outcome: changeRecord.status === 'completed' ? 'success' : 'failure',
      beforeValue: changeRecord.beforeState,
      afterValue: changeRecord.afterState,
      metadata: {
        changeRecordId: changeRecord.id,
        fieldCount: changeRecord.fieldChanges.length,
        complexity: changeRecord.changeAnalysis.complexity,
        riskLevel: changeRecord.changeMetadata.riskLevel,
        complianceRelevant: changeRecord.complianceRelevance.isComplianceRelevant,
        patterns: changeRecord.changeAnalysis.patterns.map(p => p.patternType),
        anomalies: changeRecord.changeAnalysis.anomalies.map(a => a.anomalyType)
      },
      complianceStandards: changeRecord.complianceRelevance.relevantStandards.map(s => s as any)
    };

    await this.auditService.logEvent(auditRequest, {
      actorId: context.actorId,
      actorType: context.actorType as any,
      actorEmail: context.actorEmail,
      actorRole: context.actorRole,
      sessionId: context.sessionId,
      requestId: context.requestId,
      correlationId: context.correlationId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: context.triggerDetails
    });

    return changeRecord.id; // Return change record ID as audit reference
  }

  // Additional helper methods would continue here...
  
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChangeHash(
    resourceType: string, 
    resourceId: string, 
    fieldChanges: FieldChange[]
  ): string {
    const hashInput = `${resourceType}:${resourceId}:${JSON.stringify(
      fieldChanges.map(fc => ({ path: fc.fieldPath, old: fc.oldValue, new: fc.newValue }))
    )}`;
    
    // Simple hash implementation (in production, use crypto)
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private async isDuplicateChange(changeHash: string, windowMs: number): Promise<boolean> {
    const cutoff = new Date(Date.now() - windowMs);
    return Array.from(this.changeRecords.values()).some(record => 
      record.changeHash === changeHash && record.timestamp >= cutoff
    );
  }

  private getChangeByHash(changeHash: string): ChangeRecord | undefined {
    return Array.from(this.changeRecords.values()).find(record => 
      record.changeHash === changeHash
    );
  }

  private getNestedKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);
        
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          keys.push(...this.getNestedKeys(obj[key], fullKey));
        }
      }
    }
    
    return keys;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private isEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private determineOperation(oldValue: any, newValue: any): ChangeOperation {
    if (oldValue === undefined && newValue !== undefined) return 'set';
    if (oldValue !== undefined && newValue === undefined) return 'unset';
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (newValue.length > oldValue.length) return 'add';
      if (newValue.length < oldValue.length) return 'remove';
    }
    return 'update';
  }

  private determineFieldType(value: any): FieldType {
    if (value === null || value === undefined) return 'primitive';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'primitive';
  }

  private assessFieldSignificance(
    fieldPath: string, 
    oldValue: any, 
    newValue: any
  ): ChangeSeverity {
    // Security-related fields are always major
    if (this.isSecurityRelevantField(fieldPath)) return 'major';
    
    // Compliance fields are significant
    if (this.isComplianceRelevantField(fieldPath)) return 'moderate';
    
    // Status/state changes are significant
    if (fieldPath.includes('status') || fieldPath.includes('state')) return 'moderate';
    
    // Default assessment based on data type and size
    if (typeof newValue === 'string' && newValue.length > 1000) return 'moderate';
    if (typeof newValue === 'object') return 'moderate';
    
    return 'minor';
  }

  private isSecurityRelevantField(fieldPath: string): boolean {
    const securityFields = [
      'password', 'token', 'key', 'secret', 'credential',
      'permission', 'role', 'access', 'auth', 'security',
      'privilege', 'admin', 'sudo'
    ];
    
    return securityFields.some(field => 
      fieldPath.toLowerCase().includes(field)
    );
  }

  private isComplianceRelevantField(fieldPath: string): boolean {
    const complianceFields = [
      'email', 'name', 'address', 'phone', 'ssn',
      'gdpr', 'consent', 'privacy', 'personal',
      'medical', 'health', 'financial', 'payment'
    ];
    
    return complianceFields.some(field => 
      fieldPath.toLowerCase().includes(field)
    );
  }

  // More helper methods would continue...
  
  private calculateComplexity(
    fieldChanges: FieldChange[],
    beforeState: Record<string, any>,
    afterState: Record<string, any>
  ): 'simple' | 'moderate' | 'complex' | 'critical' {
    const changeCount = fieldChanges.length;
    const securityChanges = fieldChanges.filter(fc => fc.isSecurityRelevant).length;
    const objectChanges = fieldChanges.filter(fc => fc.fieldType === 'object').length;
    
    if (securityChanges > 0 || changeCount > 50) return 'critical';
    if (objectChanges > 5 || changeCount > 20) return 'complex';
    if (changeCount > 5) return 'moderate';
    return 'simple';
  }

  private calculateChangeScore(
    fieldChanges: FieldChange[],
    complexity: string
  ): number {
    let score = fieldChanges.length * 5; // Base score
    
    // Add complexity multiplier
    const complexityMultiplier = {
      'simple': 1,
      'moderate': 1.5,
      'complex': 2,
      'critical': 3
    }[complexity] || 1;
    
    score *= complexityMultiplier;
    
    // Add significance bonus
    fieldChanges.forEach(fc => {
      const significanceBonus = {
        'trivial': 0,
        'minor': 1,
        'moderate': 3,
        'major': 5,
        'critical': 10
      }[fc.changeSignificance] || 0;
      
      score += significanceBonus;
    });
    
    return Math.min(score, 100); // Cap at 100
  }

  private async detectPatterns(
    resourceType: string,
    resourceId: string,
    fieldChanges: FieldChange[],
    context: ChangeContext
  ): Promise<ChangePattern[]> {
    const patterns: ChangePattern[] = [];
    
    // Detect bulk change pattern
    if (context.correlationId) {
      const relatedChanges = Array.from(this.changeRecords.values())
        .filter(r => r.correlationId === context.correlationId);
      
      if (relatedChanges.length > 10) {
        patterns.push({
          patternType: 'bulk_change',
          confidence: 0.9,
          description: `Part of bulk operation with ${relatedChanges.length} changes`,
          relatedChanges: relatedChanges.map(r => r.id)
        });
      }
    }
    
    return patterns;
  }

  private async detectAnomalies(
    resourceType: string,
    resourceId: string,
    fieldChanges: FieldChange[],
    context: ChangeContext
  ): Promise<ChangeAnomaly[]> {
    const anomalies: ChangeAnomaly[] = [];
    
    // Detect unusual timing (outside business hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 20) {
      anomalies.push({
        anomalyType: 'unusual_timing',
        severity: 'medium',
        description: 'Change made outside normal business hours',
        riskScore: 30,
        recommendedAction: 'Review change authorization'
      });
    }
    
    return anomalies;
  }

  private async analyzeFrequency(
    resourceType: string,
    resourceId: string,
    fieldChanges: FieldChange[]
  ): Promise<{
    isFrequentChange: boolean;
    changeFrequency: number;
    lastSimilarChange?: Date;
  }> {
    const recentChanges = Array.from(this.changeRecords.values())
      .filter(r => 
        r.resourceType === resourceType && 
        r.resourceId === resourceId &&
        r.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      );
    
    return {
      isFrequentChange: recentChanges.length > 5,
      changeFrequency: recentChanges.length,
      lastSimilarChange: recentChanges.length > 0 ? 
        recentChanges[recentChanges.length - 1].timestamp : undefined
    };
  }

  private async findRelatedChanges(
    resourceType: string,
    resourceId: string,
    fieldChanges: FieldChange[]
  ): Promise<string[]> {
    // Find changes to the same resource in the last hour
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    
    return Array.from(this.changeRecords.values())
      .filter(r => 
        r.resourceType === resourceType &&
        r.resourceId === resourceId &&
        r.timestamp >= cutoff
      )
      .map(r => r.id);
  }

  private assessRiskFactors(
    fieldChanges: FieldChange[],
    context: ChangeContext,
    patterns: ChangePattern[],
    anomalies: ChangeAnomaly[]
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // Security field changes
    const securityChanges = fieldChanges.filter(fc => fc.isSecurityRelevant);
    if (securityChanges.length > 0) {
      factors.push({
        factor: 'Security-related fields modified',
        severity: 'high',
        description: `${securityChanges.length} security-relevant fields changed`,
        likelihood: 80,
        impact: 90,
        mitigations: ['Review access logs', 'Verify authorization', 'Monitor for suspicious activity']
      });
    }
    
    // Anomaly-based risks
    anomalies.forEach(anomaly => {
      factors.push({
        factor: anomaly.anomalyType.replace('_', ' '),
        severity: anomaly.severity as any,
        description: anomaly.description,
        likelihood: anomaly.riskScore,
        impact: anomaly.riskScore,
        mitigations: [anomaly.recommendedAction]
      });
    });
    
    return factors;
  }

  // More implementation would continue...
  
  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getRiskLevelScore(riskLevel: RiskLevel): number {
    const scores = {
      'very_low': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'very_high': 5
    };
    return scores[riskLevel] || 0;
  }

  private getComplexityScore(complexity: string): number {
    const scores = {
      'simple': 1,
      'moderate': 2,
      'complex': 3,
      'critical': 4
    };
    return scores[complexity] || 0;
  }

  // Stub implementations for remaining methods
  private determineChangeType(beforeState: any, afterState: any, context: ChangeContext): ChangeType {
    if (!beforeState || Object.keys(beforeState).length === 0) return 'create';
    if (!afterState || Object.keys(afterState).length === 0) return 'delete';
    return 'update';
  }

  private async updateChangeHistory(
    resourceType: string, 
    resourceId: string, 
    changeRecord: ChangeRecord
  ): Promise<void> {
    const historyKey = `${resourceType}:${resourceId}`;
    let history = this.changeHistories.get(historyKey);
    
    if (!history) {
      history = {
        resourceType,
        resourceId,
        changeRecords: [],
        firstChange: changeRecord.timestamp,
        lastChange: changeRecord.timestamp,
        totalChanges: 0,
        changeFrequency: 0,
        averageChangesPerMonth: 0,
        mostActiveUsers: [],
        mostCommonChangeTypes: [],
        statistics: {
          totalChanges: 0,
          changesByType: {},
          changesByCategory: {},
          changesByCriticality: {},
          changesByActor: {},
          averageChangeComplexity: 0,
          highRiskChanges: 0,
          reversedChanges: 0,
          failedChanges: 0,
          complianceMetrics: {
            complianceRelevantChanges: 0,
            gdprRelevantChanges: 0,
            approvedChanges: 0,
            auditedChanges: 0
          }
        },
        trends: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // Add the change record
    history.changeRecords.push(changeRecord);
    history.lastChange = changeRecord.timestamp;
    history.totalChanges = history.changeRecords.length;
    history.updatedAt = new Date();
    
    // Update statistics
    this.updateHistoryStatistics(history);
    
    this.changeHistories.set(historyKey, history);
  }

  private updateHistoryStatistics(history: ChangeHistory): void {
    const records = history.changeRecords;
    
    history.statistics.totalChanges = records.length;
    history.statistics.changesByType = this.groupBy(records, r => r.changeType);
    history.statistics.changesByCategory = this.groupBy(records, r => r.changeMetadata.category);
    history.statistics.changesByCriticality = this.groupBy(records, r => r.changeMetadata.criticality);
    history.statistics.changesByActor = this.groupBy(records, r => r.changeContext.actorId || 'unknown');
    
    const complexityScores = records.map(r => this.getComplexityScore(r.changeAnalysis.complexity));
    history.statistics.averageChangeComplexity = complexityScores.length > 0 
      ? complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length 
      : 0;
    
    history.statistics.highRiskChanges = records.filter(r => 
      ['high', 'very_high'].includes(r.changeMetadata.riskLevel)
    ).length;
    
    history.statistics.complianceMetrics.complianceRelevantChanges = 
      records.filter(r => r.complianceRelevance.isComplianceRelevant).length;
  }

  private async linkToParentChange(parentChangeId: string, childChangeId: string): Promise<void> {
    const parentChange = this.changeRecords.get(parentChangeId);
    if (parentChange) {
      parentChange.childChangeIds.push(childChangeId);
      parentChange.updatedAt = new Date();
      this.changeRecords.set(parentChangeId, parentChange);
    }
  }

  private async buildChangeHistory(
    resourceType: string,
    resourceId: string,
    records: ChangeRecord[]
  ): Promise<ChangeHistory> {
    const history: ChangeHistory = {
      resourceType,
      resourceId,
      changeRecords: records,
      firstChange: records[0]?.timestamp || new Date(),
      lastChange: records[records.length - 1]?.timestamp || new Date(),
      totalChanges: records.length,
      changeFrequency: 0,
      averageChangesPerMonth: 0,
      mostActiveUsers: [],
      mostCommonChangeTypes: [],
      statistics: {
        totalChanges: records.length,
        changesByType: {},
        changesByCategory: {},
        changesByCriticality: {},
        changesByActor: {},
        averageChangeComplexity: 0,
        highRiskChanges: 0,
        reversedChanges: 0,
        failedChanges: 0,
        complianceMetrics: {
          complianceRelevantChanges: 0,
          gdprRelevantChanges: 0,
          approvedChanges: 0,
          auditedChanges: 0
        }
      },
      trends: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.updateHistoryStatistics(history);
    return history;
  }

  private filterChangeHistory(
    history: ChangeHistory,
    options: ChangeHistoryOptions
  ): ChangeHistory {
    let filteredRecords = [...history.changeRecords];

    if (options.startDate) {
      filteredRecords = filteredRecords.filter(r => r.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      filteredRecords = filteredRecords.filter(r => r.timestamp <= options.endDate!);
    }

    if (options.changeTypes?.length) {
      filteredRecords = filteredRecords.filter(r => options.changeTypes!.includes(r.changeType));
    }

    if (options.actors?.length) {
      filteredRecords = filteredRecords.filter(r => 
        r.changeContext.actorId && options.actors!.includes(r.changeContext.actorId)
      );
    }

    return {
      ...history,
      changeRecords: filteredRecords,
      totalChanges: filteredRecords.length
    };
  }

  // Remaining stub implementations...
  private determineImpactScope(): ImpactScope { return 'single_resource'; }
  private assessImpactSeverity(): ImpactSeverity { return 'minor'; }
  private async findAffectedEntities(): Promise<AffectedEntity[]> { return []; }
  private assessBusinessImpact(): BusinessImpact { 
    return {
      severity: 'minor',
      description: 'Minimal business impact',
      affectedProcesses: [],
      customerImpact: {
        affectedCustomers: 0,
        severity: 'negligible',
        communicationRequired: false,
        compensationRequired: false
      }
    };
  }
  private assessTechnicalImpact(): TechnicalImpact { 
    return {
      severity: 'minor',
      description: 'Minimal technical impact',
      affectedSystems: []
    };
  }
  private assessSecurityImpact(): SecurityImpact { 
    return {
      severity: 'minor',
      description: 'Minimal security impact',
      securityRisks: [],
      privilegeChanges: [],
      accessChanges: []
    };
  }
  private assessComplianceImpact(): ComplianceImpact { 
    return {
      severity: 'minor',
      description: 'Minimal compliance impact',
      affectedStandards: [],
      violations: [],
      requiredActions: []
    };
  }
  private assessRollbackComplexity(): 'simple' | 'moderate' | 'complex' | 'impossible' { 
    return 'simple'; 
  }
  private determineRelevantStandards(): string[] { return []; }
  private affectsDataSubjectRights(): boolean { return false; }
  private async getAffectedDataSubjects(): Promise<string[]> { return []; }
  private calculateRetentionPeriod(): number { return 2555; }
  private requiresExportControl(): boolean { return false; }
  private categorizeChange(): ChangeCategory { return 'user_data'; }
  private assessCriticality(): ChangeCriticality { return 'routine'; }
  private assessRiskLevel(): RiskLevel { return 'low'; }
  private containsPII(): boolean { return false; }
  private containsSensitiveData(): boolean { return false; }
  private generateTags(): string[] { return []; }
  private mapToAuditEventType(): AuditEventType { return AuditEventType.TOGGLE_UPDATED; }
  private mapToAuditCategory(): AuditCategory { return AuditCategory.DATA_MODIFICATION; }
  private mapToAuditSeverity(): AuditSeverity { return AuditSeverity.MEDIUM; }
  private generateChangeDescription(record: ChangeRecord): string {
    return `Changed ${record.fieldChanges.length} fields in ${record.resourceType} ${record.resourceId}`;
  }
  private async validateChange(): Promise<ValidationResult[]> { return []; }
}

// Supporting interfaces
export interface ChangeRecordingOptions {
  parentChangeId?: string;
  deduplicationWindow?: number; // milliseconds
  createAuditEvent?: boolean;
  skipValidation?: boolean;
  customMetadata?: Record<string, any>;
}

export interface BulkChangeRecordingOptions extends ChangeRecordingOptions {
  auditEachChange?: boolean;
  continueOnError?: boolean;
  batchSize?: number;
}

export interface ChangeHistoryOptions {
  startDate?: Date;
  endDate?: Date;
  changeTypes?: ChangeType[];
  actors?: string[];
  includeStatistics?: boolean;
  includeTrends?: boolean;
}

export interface ChangeRecordFilter {
  resourceTypes?: string[];
  resourceIds?: string[];
  changeTypes?: ChangeType[];
  actors?: string[];
  startDate?: Date;
  endDate?: Date;
  riskLevels?: RiskLevel[];
  complianceRelevant?: boolean;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'riskLevel' | 'complexity';
  sortOrder?: 'asc' | 'desc';
}

export interface ChangeRecordResponse {
  records: ChangeRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalChanges: number;
    changesByType: Record<string, number>;
    changesByRisk: Record<string, number>;
    complianceRelevantChanges: number;
    highRiskChanges: number;
  };
}

export default ChangeRecordingService;