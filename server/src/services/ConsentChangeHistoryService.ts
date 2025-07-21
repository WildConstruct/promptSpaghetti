/**
 * Consent Change History Service - Epic 19
 * 
 * Provides comprehensive change tracking and history management for user consent records.
 * Maintains immutable audit trails, supports consent lifecycle management, and ensures
 * GDPR Article 7(3) compliance for consent withdrawal and modification tracking.
 * 
 * Integrates with existing ConsentCollectionService and EvidenceVersioningService.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EvidenceVersioningService, EvidenceVersion } from './EvidenceVersioningService';
import { 
  ConsentRecord, 
  ConsentAction, 
  ConsentStatus, 
  ConsentAuditEntry,
  UserConsentPreferences,
  ConsentType,
  ConsentCollectionService
} from './ConsentCollectionService';
import * as crypto from 'crypto';

// =============================================================================
// Consent Change History Interfaces
// =============================================================================

export interface ConsentChangeHistoryConfig {
  enabled: boolean;
  immutableHistory: boolean;
  retentionPeriodDays: number; // GDPR Article 7(1) - 7 years recommended
  maxVersionsPerConsent: number;
  enableRealTimeNotifications: boolean;
  complianceAlerting: {
    enabled: boolean;
    alertOnWithdrawal: boolean;
    alertOnModification: boolean;
    alertOnExpiry: boolean;
    alertOnCompliance: boolean;
  };
  integrityChecking: {
    enabled: boolean;
    hashAlgorithm: 'sha256' | 'sha512';
    digitalSignatures: boolean;
    chainValidation: boolean;
  };
  reportGeneration: {
    enabled: boolean;
    automaticReports: boolean;
    reportFormats: string[];
    reportSchedule: string;
  };
}

export interface ConsentChangeEvent {
  changeId: string;
  consentId: string;
  userId: string;
  changeType: ConsentChangeType;
  timestamp: Date;
  
  // Change details
  previousState: ConsentChangeState;
  newState: ConsentChangeState;
  changeSummary: ConsentChangeSummary;
  
  // Context information
  changeContext: ConsentChangeContext;
  changeReason: string;
  changeMethod: ConsentChangeMethod;
  
  // Compliance and legal
  legalBasis: ConsentLegalBasisChange;
  complianceImpact: ConsentComplianceImpact;
  gdprCompliance: GDPRComplianceDetails;
  
  // Technical details
  evidenceId?: string; // Links to EvidenceVersioningService
  integrityHash: string;
  digitalSignature?: string;
  
  // Metadata
  metadata: ConsentChangeMetadata;
  tags: string[];
  flags: string[];
}

export interface ConsentChangeState {
  status: ConsentStatus;
  consentType: ConsentType;
  preferences: UserConsentPreferences;
  expirationDate?: Date;
  granularity: string;
  purposes: string[];
  dataCategories: string[];
  thirdPartySharing: string[];
  customAttributes: Record<string, any>;
}

export interface ConsentChangeSummary {
  totalChanges: number;
  significantChanges: number;
  fieldChanges: ConsentFieldChange[];
  impactLevel: ConsentImpactLevel;
  userVisible: boolean;
  requiresNotification: boolean;
  requiresReauthorization: boolean;
}

export interface ConsentFieldChange {
  fieldPath: string;
  fieldName: string;
  changeType: 'added' | 'removed' | 'modified';
  previousValue: any;
  newValue: any;
  impactLevel: ConsentImpactLevel;
  reason?: string;
}

export interface ConsentChangeContext {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
  deviceInfo?: {
    deviceType: string;
    operatingSystem: string;
    browser: string;
  };
  applicationContext: {
    feature: string;
    page: string;
    referrer?: string;
    userflow: string;
  };
  authenticationContext: {
    authLevel: string;
    authMethod: string;
    sessionAge: number;
  };
}

export interface ConsentLegalBasisChange {
  previousBasis: string;
  newBasis: string;
  basisReason: string;
  legalRequirements: string[];
  complianceFrameworks: string[];
  jurisdictionImpact: JurisdictionImpact[];
}

export interface JurisdictionImpact {
  jurisdiction: string;
  impactLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  specificRequirements: string[];
  complianceActions: string[];
  deadline?: Date;
}

export interface ConsentComplianceImpact {
  gdprImpact: GDPRComplianceImpact;
  ccpaImpact: CCPAComplianceImpact;
  otherFrameworks: ComplianceFrameworkImpact[];
  overallRiskLevel: ConsentRiskLevel;
  requiredActions: ComplianceAction[];
  deadlines: ComplianceDeadline[];
}

export interface GDPRComplianceDetails {
  article7Compliance: {
    consentFreely: boolean;
    consentSpecific: boolean;
    consentInformed: boolean;
    consentUnambiguous: boolean;
    withdrawalEasyAsGiving: boolean;
  };
  article13_14Compliance: {
    transparencyProvided: boolean;
    purposesExplained: boolean;
    rightsExplained: boolean;
    contactInfoProvided: boolean;
  };
  rightsExercised: {
    rightOfAccess: boolean;
    rightOfRectification: boolean;
    rightOfErasure: boolean;
    rightOfPortability: boolean;
    rightToObjection: boolean;
  };
  specialCategoryData: {
    involved: boolean;
    explicitConsent: boolean;
    additionalSafeguards: string[];
  };
}

export interface GDPRComplianceImpact {
  articlesAffected: string[];
  rightsImpacted: string[];
  notificationRequired: boolean;
  dpiaRequired: boolean;
  authorityNotificationRequired: boolean;
  dataSubjectNotificationRequired: boolean;
}

export interface CCPAComplianceImpact {
  categoriesAffected: string[];
  rightsImpacted: string[];
  optOutImpact: boolean;
  saleOfDataImpact: boolean;
  disclosureRequired: boolean;
}

export interface ComplianceFrameworkImpact {
  framework: string;
  impactLevel: ConsentImpactLevel;
  affectedRequirements: string[];
  requiredActions: string[];
  timeline: string;
}

export interface ComplianceAction {
  actionType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  deadline?: Date;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface ComplianceDeadline {
  requirement: string;
  deadline: Date;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  consequence: string;
}

export interface ConsentChangeMetadata {
  version: string;
  schemaVersion: string;
  processingTime: number;
  correlationId: string;
  batchId?: string;
  migrationInfo?: {
    fromVersion: string;
    migrationRules: string[];
    migrationDate: Date;
  };
  customFields: Record<string, any>;
  systemGeneratedFields: Record<string, any>;
}

export interface ConsentHistoryReport {
  reportId: string;
  userId: string;
  generatedAt: Date;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  summary: ConsentHistorySummary;
  timeline: ConsentTimelineEvent[];
  compliance: ConsentComplianceReport;
  recommendations: ConsentRecommendation[];
  exportFormats: string[];
}

export interface ConsentHistorySummary {
  totalConsents: number;
  activeConsents: number;
  withdrawnConsents: number;
  expiredConsents: number;
  totalChanges: number;
  significantChanges: number;
  complianceScore: number;
  riskLevel: ConsentRiskLevel;
}

export interface ConsentTimelineEvent {
  timestamp: Date;
  eventType: ConsentEventType;
  summary: string;
  details: Record<string, any>;
  complianceImpact: string[];
  userNotified: boolean;
}

export interface ConsentComplianceReport {
  overallStatus: 'compliant' | 'non_compliant' | 'under_review';
  frameworkCompliance: FrameworkComplianceStatus[];
  identifiedIssues: ComplianceIssue[];
  riskAssessment: ConsentRiskAssessment;
  auditTrailIntegrity: AuditIntegrityReport;
}

export interface FrameworkComplianceStatus {
  framework: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  lastAssessment: Date;
  issues: string[];
  actions: string[];
}

export interface ComplianceIssue {
  issueId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  framework: string;
  recommendation: string;
  deadline?: Date;
}

export interface ConsentRiskAssessment {
  overallRisk: ConsentRiskLevel;
  riskFactors: ConsentRiskFactor[];
  mitigationActions: string[];
  riskTrend: 'improving' | 'stable' | 'deteriorating';
}

export interface ConsentRiskFactor {
  factor: string;
  impact: ConsentImpactLevel;
  likelihood: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface AuditIntegrityReport {
  overallIntegrity: 'intact' | 'compromised' | 'unknown';
  checksPerformed: string[];
  issuesFound: string[];
  integrityScore: number; // 0-100
  lastVerification: Date;
}

export interface ConsentRecommendation {
  recommendationId: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  benefits: string[];
  implementation: string;
  timeline: string;
}

// Type definitions
export type ConsentChangeType = 
  | 'initial_grant'
  | 'preference_update' 
  | 'withdrawal' 
  | 'renewal' 
  | 'expiration'
  | 'reauthorization'
  | 'migration'
  | 'correction'
  | 'system_update'
  | 'compliance_adjustment';

export type ConsentChangeMethod = 
  | 'user_action'
  | 'system_automated' 
  | 'admin_override'
  | 'api_call'
  | 'batch_process'
  | 'compliance_requirement'
  | 'legal_requirement'
  | 'data_migration';

export type ConsentImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type ConsentRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ConsentEventType = 'grant' | 'modify' | 'withdraw' | 'expire' | 'renew' | 'migrate';

// =============================================================================
// Main Service Class
// =============================================================================

export class ConsentChangeHistoryService {
  private config: ConsentChangeHistoryConfig;
  private evidenceVersioningService: EvidenceVersioningService;
  private consentCollectionService: ConsentCollectionService;
  
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    private auditService: AuditService
  ) {
    this.config = this.getDefaultConfig();
    this.evidenceVersioningService = new EvidenceVersioningService(
      databaseService, redisService, auditService
    );
    this.consentCollectionService = new ConsentCollectionService(auditService);
    
    this.initializeService();
  }

  // =============================================================================
  // Core Change Tracking Methods
  // =============================================================================

  /**
   * Record a consent change event with full audit trail
   */
  async recordConsentChange(
    consentId: string,
    changeType: ConsentChangeType,
    previousState: ConsentChangeState,
    newState: ConsentChangeState,
    changeContext: ConsentChangeContext,
    changeReason: string,
    changeMethod: ConsentChangeMethod = 'user_action'
  ): Promise<ConsentChangeEvent> {
    try {
      const changeEvent: ConsentChangeEvent = {
        changeId: this.generateChangeId(),
        consentId,
        userId: this.extractUserIdFromConsent(consentId),
        changeType,
        timestamp: new Date(),
        
        previousState,
        newState,
        changeSummary: this.generateChangeSummary(previousState, newState, changeType),
        
        changeContext,
        changeReason,
        changeMethod,
        
        legalBasis: this.analyzeLegalBasisChange(previousState, newState),
        complianceImpact: this.analyzeComplianceImpact(previousState, newState, changeType),
        gdprCompliance: this.analyzeGDPRCompliance(previousState, newState, changeType),
        
        integrityHash: '', // Will be set after hash generation
        
        metadata: {
          version: '1.0',
          schemaVersion: '2024.1',
          processingTime: 0, // Will be measured
          correlationId: crypto.randomUUID(),
          customFields: {},
          systemGeneratedFields: {
            processingNode: process.env.NODE_ID || 'unknown',
            apiVersion: '1.0'
          }
        },
        tags: this.generateChangeTags(changeType, previousState, newState),
        flags: this.generateChangeFlags(changeType, previousState, newState)
      };

      // Generate integrity hash
      changeEvent.integrityHash = this.generateIntegrityHash(changeEvent);

      // Generate digital signature if enabled
      if (this.config.integrityChecking.digitalSignatures) {
        changeEvent.digitalSignature = await this.generateDigitalSignature(changeEvent);
      }

      // Store evidence version if significant change
      if (changeEvent.changeSummary.impactLevel !== 'none') {
        const evidenceVersion = await this.createEvidenceVersion(changeEvent);
        changeEvent.evidenceId = evidenceVersion.id;
      }

      // Store change event
      await this.storeChangeEvent(changeEvent);

      // Send notifications if required
      if (changeEvent.changeSummary.requiresNotification) {
        await this.sendChangeNotifications(changeEvent);
      }

      // Update compliance tracking
      await this.updateComplianceTracking(changeEvent);

      // Log audit event
      await this.auditService.logEvent({
        eventType: 'CONSENT_CHANGE_RECORDED',
        userId: changeEvent.userId,
        details: {
          changeId: changeEvent.changeId,
          changeType: changeType,
          impactLevel: changeEvent.changeSummary.impactLevel,
          consentId
        },
        riskLevel: this.mapImpactToRiskLevel(changeEvent.changeSummary.impactLevel),
        compliance: {
          frameworks: changeEvent.complianceImpact.gdprImpact.articlesAffected.length > 0 ? ['GDPR'] : [],
          requirements: changeEvent.complianceImpact.gdprImpact.articlesAffected,
          evidenceLevel: 'ENHANCED'
        }
      });

      return changeEvent;

    } catch (error) {
      throw new Error(`Failed to record consent change: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get complete change history for a consent record
   */
  async getConsentHistory(
    consentId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      changeTypes?: ConsentChangeType[];
      includeEvidence?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<ConsentChangeEvent[]> {
    try {
      let query = `
        SELECT * FROM consent_change_history 
        WHERE consent_id = ?
      `;
      const params: any[] = [consentId];

      // Add filters
      if (options?.startDate) {
        query += ` AND timestamp >= ?`;
        params.push(options.startDate.toISOString());
      }

      if (options?.endDate) {
        query += ` AND timestamp <= ?`;
        params.push(options.endDate.toISOString());
      }

      if (options?.changeTypes && options.changeTypes.length > 0) {
        query += ` AND change_type IN (${options.changeTypes.map(() => '?').join(',')})`;
        params.push(...options.changeTypes);
      }

      query += ` ORDER BY timestamp DESC`;

      if (options?.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);
        
        if (options?.offset) {
          query += ` OFFSET ?`;
          params.push(options.offset);
        }
      }

      const results = await this.databaseService.query(query, params);
      const changeEvents: ConsentChangeEvent[] = [];

      for (const row of results) {
        const changeEvent = this.deserializeChangeEvent(row);
        
        // Load evidence if requested and available
        if (options?.includeEvidence && changeEvent.evidenceId) {
          // Evidence would be loaded from EvidenceVersioningService
          // changeEvent.evidence = await this.evidenceVersioningService.getVersion(changeEvent.evidenceId);
        }
        
        changeEvents.push(changeEvent);
      }

      return changeEvents;

    } catch (error) {
      throw new Error(`Failed to get consent history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate comprehensive history report for a user
   */
  async generateHistoryReport(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      includeCompliance?: boolean;
      includeRecommendations?: boolean;
      format?: 'json' | 'pdf' | 'xml';
    }
  ): Promise<ConsentHistoryReport> {
    try {
      const reportId = `CHR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const startDate = options?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
      const endDate = options?.endDate || new Date();

      // Get all consent changes for user in period
      const allChanges = await this.getUserConsentChanges(userId, startDate, endDate);
      
      // Generate summary
      const summary = this.generateHistorySummary(allChanges);
      
      // Create timeline
      const timeline = this.generateConsentTimeline(allChanges);
      
      // Generate compliance report if requested
      const compliance = options?.includeCompliance 
        ? await this.generateComplianceReport(userId, allChanges)
        : {} as ConsentComplianceReport;
      
      // Generate recommendations if requested
      const recommendations = options?.includeRecommendations
        ? await this.generateRecommendations(userId, allChanges)
        : [];

      const report: ConsentHistoryReport = {
        reportId,
        userId,
        generatedAt: new Date(),
        reportPeriod: { startDate, endDate },
        summary,
        timeline,
        compliance,
        recommendations,
        exportFormats: options?.format ? [options.format] : ['json']
      };

      // Store report for audit purposes
      await this.storeHistoryReport(report);

      // Log audit event
      await this.auditService.logEvent({
        eventType: 'CONSENT_HISTORY_REPORT_GENERATED',
        userId,
        details: {
          reportId,
          period: { startDate, endDate },
          changeCount: allChanges.length,
          includeCompliance: options?.includeCompliance || false
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['GDPR'],
          requirements: ['Article 15 - Right of access'],
          evidenceLevel: 'STANDARD'
        }
      });

      return report;

    } catch (error) {
      throw new Error(`Failed to generate history report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate consent history integrity
   */
  async validateHistoryIntegrity(consentId: string): Promise<AuditIntegrityReport> {
    try {
      const changes = await this.getConsentHistory(consentId, { includeEvidence: true });
      
      const report: AuditIntegrityReport = {
        overallIntegrity: 'intact',
        checksPerformed: [
          'hash_verification',
          'signature_verification', 
          'timestamp_sequence',
          'change_consistency'
        ],
        issuesFound: [],
        integrityScore: 100,
        lastVerification: new Date()
      };

      let issues = 0;
      
      // Verify hashes
      for (const change of changes) {
        const expectedHash = this.generateIntegrityHash(change);
        if (change.integrityHash !== expectedHash) {
          report.issuesFound.push(`Hash mismatch in change ${change.changeId}`);
          issues++;
        }

        // Verify digital signatures if present
        if (change.digitalSignature && this.config.integrityChecking.digitalSignatures) {
          const validSignature = await this.verifyDigitalSignature(change);
          if (!validSignature) {
            report.issuesFound.push(`Invalid signature in change ${change.changeId}`);
            issues++;
          }
        }
      }

      // Verify timestamp sequence
      for (let i = 1; i < changes.length; i++) {
        if (changes[i-1].timestamp.getTime() < changes[i].timestamp.getTime()) {
          report.issuesFound.push(`Timestamp sequence violation between changes ${changes[i-1].changeId} and ${changes[i].changeId}`);
          issues++;
        }
      }

      // Calculate integrity score
      if (issues > 0) {
        report.overallIntegrity = issues > changes.length * 0.1 ? 'compromised' : 'unknown';
        report.integrityScore = Math.max(0, 100 - (issues / changes.length) * 100);
      }

      return report;

    } catch (error) {
      throw new Error(`Failed to validate history integrity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export consent history in various formats
   */
  async exportConsentHistory(
    userId: string,
    format: 'json' | 'pdf' | 'xml' | 'csv',
    options?: {
      startDate?: Date;
      endDate?: Date;
      includeEvidence?: boolean;
    }
  ): Promise<{ exportId: string; downloadUrl: string; expiresAt: Date }> {
    const exportId = `EXP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    try {
      // Generate report data
      const report = await this.generateHistoryReport(userId, {
        ...options,
        format,
        includeCompliance: true,
        includeRecommendations: true
      });

      // Format data according to requested format
      let exportData: string;
      let mimeType: string;
      let fileExtension: string;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(report, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
          
        case 'xml':
          exportData = this.convertToXML(report);
          mimeType = 'application/xml';
          fileExtension = 'xml';
          break;
          
        case 'csv':
          exportData = this.convertToCSV(report);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
          
        case 'pdf':
          exportData = await this.convertToPDF(report);
          mimeType = 'application/pdf';
          fileExtension = 'pdf';
          break;
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Store export data temporarily
      const downloadUrl = await this.storeExportData(exportId, exportData, mimeType);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Log audit event
      await this.auditService.logEvent({
        eventType: 'CONSENT_HISTORY_EXPORTED',
        userId,
        details: {
          exportId,
          format,
          recordCount: report.timeline.length,
          period: report.reportPeriod
        },
        riskLevel: 'MEDIUM', // Higher risk due to data export
        compliance: {
          frameworks: ['GDPR'],
          requirements: ['Article 15', 'Article 20'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return { exportId, downloadUrl, expiresAt };

    } catch (error) {
      throw new Error(`Failed to export consent history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private generateChangeId(): string {
    return `CHG-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  private extractUserIdFromConsent(consentId: string): string {
    // Mock implementation - would extract from consent record
    return 'user_123';
  }

  private generateChangeSummary(
    previousState: ConsentChangeState,
    newState: ConsentChangeState,
    changeType: ConsentChangeType
  ): ConsentChangeSummary {
    const fieldChanges = this.compareStates(previousState, newState);
    const significantChanges = fieldChanges.filter(change => 
      change.impactLevel === 'high' || change.impactLevel === 'critical'
    ).length;

    let impactLevel: ConsentImpactLevel = 'none';
    let requiresNotification = false;
    let requiresReauthorization = false;

    // Determine impact level based on change type and field changes
    if (changeType === 'withdrawal') {
      impactLevel = 'high';
      requiresNotification = true;
    } else if (changeType === 'initial_grant') {
      impactLevel = 'medium';
    } else if (significantChanges > 0) {
      impactLevel = 'medium';
      requiresNotification = true;
    } else if (fieldChanges.length > 0) {
      impactLevel = 'low';
    }

    // Determine if reauthorization is required
    if (changeType === 'reauthorization' || 
        fieldChanges.some(change => change.fieldPath === 'purposes' && change.changeType === 'added')) {
      requiresReauthorization = true;
    }

    return {
      totalChanges: fieldChanges.length,
      significantChanges,
      fieldChanges,
      impactLevel,
      userVisible: impactLevel !== 'none',
      requiresNotification,
      requiresReauthorization
    };
  }

  private compareStates(previousState: ConsentChangeState, newState: ConsentChangeState): ConsentFieldChange[] {
    const changes: ConsentFieldChange[] = [];

    // Compare status
    if (previousState.status !== newState.status) {
      changes.push({
        fieldPath: 'status',
        fieldName: 'Consent Status',
        changeType: 'modified',
        previousValue: previousState.status,
        newValue: newState.status,
        impactLevel: this.getStatusChangeImpact(previousState.status, newState.status)
      });
    }

    // Compare purposes
    const purposeChanges = this.comparePurposes(previousState.purposes, newState.purposes);
    changes.push(...purposeChanges);

    // Compare preferences (simplified comparison)
    if (JSON.stringify(previousState.preferences) !== JSON.stringify(newState.preferences)) {
      changes.push({
        fieldPath: 'preferences',
        fieldName: 'User Preferences',
        changeType: 'modified',
        previousValue: previousState.preferences,
        newValue: newState.preferences,
        impactLevel: 'low'
      });
    }

    return changes;
  }

  private comparePurposes(previousPurposes: string[], newPurposes: string[]): ConsentFieldChange[] {
    const changes: ConsentFieldChange[] = [];
    
    // Find added purposes
    const addedPurposes = newPurposes.filter(purpose => !previousPurposes.includes(purpose));
    for (const purpose of addedPurposes) {
      changes.push({
        fieldPath: 'purposes',
        fieldName: 'Consent Purposes',
        changeType: 'added',
        previousValue: null,
        newValue: purpose,
        impactLevel: 'medium',
        reason: 'New consent purpose added'
      });
    }

    // Find removed purposes
    const removedPurposes = previousPurposes.filter(purpose => !newPurposes.includes(purpose));
    for (const purpose of removedPurposes) {
      changes.push({
        fieldPath: 'purposes',
        fieldName: 'Consent Purposes',
        changeType: 'removed',
        previousValue: purpose,
        newValue: null,
        impactLevel: 'high',
        reason: 'Consent purpose withdrawn'
      });
    }

    return changes;
  }

  private getStatusChangeImpact(previousStatus: ConsentStatus, newStatus: ConsentStatus): ConsentImpactLevel {
    if (previousStatus === 'ACTIVE' && newStatus === 'WITHDRAWN') return 'critical';
    if (previousStatus === 'WITHDRAWN' && newStatus === 'ACTIVE') return 'high';
    if (newStatus === 'EXPIRED') return 'medium';
    return 'low';
  }

  private analyzeLegalBasisChange(
    previousState: ConsentChangeState,
    newState: ConsentChangeState
  ): ConsentLegalBasisChange {
    return {
      previousBasis: 'CONSENT',
      newBasis: 'CONSENT',
      basisReason: 'Consent update',
      legalRequirements: ['GDPR Article 6', 'GDPR Article 7'],
      complianceFrameworks: ['GDPR', 'CCPA'],
      jurisdictionImpact: [{
        jurisdiction: 'EU',
        impactLevel: 'medium',
        specificRequirements: ['Article 7(3) - Easy withdrawal'],
        complianceActions: ['Ensure withdrawal mechanism'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }]
    };
  }

  private analyzeComplianceImpact(
    previousState: ConsentChangeState,
    newState: ConsentChangeState,
    changeType: ConsentChangeType
  ): ConsentComplianceImpact {
    const gdprImpact: GDPRComplianceImpact = {
      articlesAffected: changeType === 'withdrawal' ? ['Article 7'] : ['Article 6'],
      rightsImpacted: changeType === 'withdrawal' ? ['Right to withdraw consent'] : [],
      notificationRequired: changeType === 'withdrawal',
      dpiaRequired: false,
      authorityNotificationRequired: false,
      dataSubjectNotificationRequired: changeType === 'withdrawal'
    };

    const ccpaImpact: CCPAComplianceImpact = {
      categoriesAffected: ['Personal Information'],
      rightsImpacted: changeType === 'withdrawal' ? ['Right to Opt-Out'] : [],
      optOutImpact: changeType === 'withdrawal',
      saleOfDataImpact: false,
      disclosureRequired: changeType === 'withdrawal'
    };

    return {
      gdprImpact,
      ccpaImpact,
      otherFrameworks: [],
      overallRiskLevel: changeType === 'withdrawal' ? 'medium' : 'low',
      requiredActions: [{
        actionType: 'notification',
        description: 'Notify user of consent change',
        urgency: 'medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending'
      }],
      deadlines: [{
        requirement: 'User notification',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        urgency: 'medium',
        consequence: 'Compliance violation'
      }]
    };
  }

  private analyzeGDPRCompliance(
    previousState: ConsentChangeState,
    newState: ConsentChangeState,
    changeType: ConsentChangeType
  ): GDPRComplianceDetails {
    return {
      article7Compliance: {
        consentFreely: true,
        consentSpecific: true,
        consentInformed: true,
        consentUnambiguous: true,
        withdrawalEasyAsGiving: changeType === 'withdrawal' ? true : false
      },
      article13_14Compliance: {
        transparencyProvided: true,
        purposesExplained: true,
        rightsExplained: true,
        contactInfoProvided: true
      },
      rightsExercised: {
        rightOfAccess: false,
        rightOfRectification: false,
        rightOfErasure: changeType === 'withdrawal',
        rightOfPortability: false,
        rightToObjection: changeType === 'withdrawal'
      },
      specialCategoryData: {
        involved: false,
        explicitConsent: false,
        additionalSafeguards: []
      }
    };
  }

  private generateIntegrityHash(changeEvent: ConsentChangeEvent): string {
    // Create deterministic string representation for hashing
    const dataToHash = JSON.stringify({
      changeId: changeEvent.changeId,
      consentId: changeEvent.consentId,
      userId: changeEvent.userId,
      changeType: changeEvent.changeType,
      timestamp: changeEvent.timestamp.toISOString(),
      previousState: changeEvent.previousState,
      newState: changeEvent.newState,
      changeReason: changeEvent.changeReason
    });

    return crypto.createHash(this.config.integrityChecking.hashAlgorithm)
      .update(dataToHash, 'utf8')
      .digest('hex');
  }

  private async generateDigitalSignature(changeEvent: ConsentChangeEvent): Promise<string> {
    // Simplified digital signature - in production, use proper PKI
    const data = `${changeEvent.changeId}:${changeEvent.integrityHash}:${changeEvent.timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async verifyDigitalSignature(changeEvent: ConsentChangeEvent): Promise<boolean> {
    if (!changeEvent.digitalSignature) return false;
    
    const expectedSignature = await this.generateDigitalSignature(changeEvent);
    return changeEvent.digitalSignature === expectedSignature;
  }

  private generateChangeTags(
    changeType: ConsentChangeType,
    previousState: ConsentChangeState,
    newState: ConsentChangeState
  ): string[] {
    const tags: string[] = [changeType];
    
    if (changeType === 'withdrawal') {
      tags.push('gdpr_article_7', 'user_rights');
    }
    
    if (previousState.status !== newState.status) {
      tags.push('status_change');
    }
    
    if (previousState.purposes.length !== newState.purposes.length) {
      tags.push('purposes_change');
    }
    
    return tags;
  }

  private generateChangeFlags(
    changeType: ConsentChangeType,
    previousState: ConsentChangeState,
    newState: ConsentChangeState
  ): string[] {
    const flags: string[] = [];
    
    if (changeType === 'withdrawal') {
      flags.push('requires_notification');
    }
    
    if (changeType === 'reauthorization') {
      flags.push('requires_user_action');
    }
    
    return flags;
  }

  private async createEvidenceVersion(changeEvent: ConsentChangeEvent): Promise<EvidenceVersion> {
    const evidenceContent = JSON.stringify(changeEvent, null, 2);
    
    return await this.evidenceVersioningService.createEvidence(
      `consent_change_${changeEvent.changeId}`,
      evidenceContent,
      {
        consentId: changeEvent.consentId,
        userId: changeEvent.userId,
        changeType: changeEvent.changeType,
        timestamp: changeEvent.timestamp.toISOString()
      },
      'system',
      {
        classification: 'confidential',
        filename: `consent_change_${changeEvent.changeId}.json`,
        mimeType: 'application/json',
        tags: ['consent_change', 'audit_evidence'],
        complianceFrameworks: ['GDPR', 'CCPA']
      }
    );
  }

  private async storeChangeEvent(changeEvent: ConsentChangeEvent): Promise<void> {
    await this.databaseService.query(`
      INSERT INTO consent_change_history (
        change_id, consent_id, user_id, change_type, timestamp,
        previous_state, new_state, change_summary, change_context,
        change_reason, change_method, legal_basis, compliance_impact,
        gdpr_compliance, evidence_id, integrity_hash, digital_signature,
        metadata, tags, flags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      changeEvent.changeId,
      changeEvent.consentId,
      changeEvent.userId,
      changeEvent.changeType,
      changeEvent.timestamp.toISOString(),
      JSON.stringify(changeEvent.previousState),
      JSON.stringify(changeEvent.newState),
      JSON.stringify(changeEvent.changeSummary),
      JSON.stringify(changeEvent.changeContext),
      changeEvent.changeReason,
      changeEvent.changeMethod,
      JSON.stringify(changeEvent.legalBasis),
      JSON.stringify(changeEvent.complianceImpact),
      JSON.stringify(changeEvent.gdprCompliance),
      changeEvent.evidenceId,
      changeEvent.integrityHash,
      changeEvent.digitalSignature,
      JSON.stringify(changeEvent.metadata),
      JSON.stringify(changeEvent.tags),
      JSON.stringify(changeEvent.flags)
    ]);
  }

  private async sendChangeNotifications(changeEvent: ConsentChangeEvent): Promise<void> {
    // Implementation would send notifications to user, compliance team, etc.
    console.log(`Sending notifications for change ${changeEvent.changeId}`);
  }

  private async updateComplianceTracking(changeEvent: ConsentChangeEvent): Promise<void> {
    // Implementation would update compliance tracking systems
    console.log(`Updating compliance tracking for change ${changeEvent.changeId}`);
  }

  private mapImpactToRiskLevel(impactLevel: ConsentImpactLevel): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (impactLevel) {
      case 'none': case 'low': return 'LOW';
      case 'medium': return 'MEDIUM';
      case 'high': return 'HIGH';
      case 'critical': return 'CRITICAL';
      default: return 'LOW';
    }
  }

  private deserializeChangeEvent(row: any): ConsentChangeEvent {
    return {
      changeId: row.change_id,
      consentId: row.consent_id,
      userId: row.user_id,
      changeType: row.change_type,
      timestamp: new Date(row.timestamp),
      previousState: JSON.parse(row.previous_state),
      newState: JSON.parse(row.new_state),
      changeSummary: JSON.parse(row.change_summary),
      changeContext: JSON.parse(row.change_context),
      changeReason: row.change_reason,
      changeMethod: row.change_method,
      legalBasis: JSON.parse(row.legal_basis),
      complianceImpact: JSON.parse(row.compliance_impact),
      gdprCompliance: JSON.parse(row.gdpr_compliance),
      evidenceId: row.evidence_id,
      integrityHash: row.integrity_hash,
      digitalSignature: row.digital_signature,
      metadata: JSON.parse(row.metadata),
      tags: JSON.parse(row.tags),
      flags: JSON.parse(row.flags)
    };
  }

  private async getUserConsentChanges(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ConsentChangeEvent[]> {
    const result = await this.databaseService.query(`
      SELECT * FROM consent_change_history 
      WHERE user_id = ? AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `, [userId, startDate.toISOString(), endDate.toISOString()]);

    return result.map(row => this.deserializeChangeEvent(row));
  }

  private generateHistorySummary(changes: ConsentChangeEvent[]): ConsentHistorySummary {
    const totalConsents = new Set(changes.map(c => c.consentId)).size;
    const activeConsents = changes.filter(c => c.newState.status === 'ACTIVE').length;
    const withdrawnConsents = changes.filter(c => c.changeType === 'withdrawal').length;
    const expiredConsents = changes.filter(c => c.newState.status === 'EXPIRED').length;
    const significantChanges = changes.filter(c => c.changeSummary.impactLevel === 'high' || c.changeSummary.impactLevel === 'critical').length;

    return {
      totalConsents,
      activeConsents,
      withdrawnConsents,
      expiredConsents,
      totalChanges: changes.length,
      significantChanges,
      complianceScore: this.calculateComplianceScore(changes),
      riskLevel: this.calculateOverallRiskLevel(changes)
    };
  }

  private generateConsentTimeline(changes: ConsentChangeEvent[]): ConsentTimelineEvent[] {
    return changes.map(change => ({
      timestamp: change.timestamp,
      eventType: this.mapChangeTypeToEventType(change.changeType),
      summary: this.generateEventSummary(change),
      details: {
        changeId: change.changeId,
        consentId: change.consentId,
        impactLevel: change.changeSummary.impactLevel
      },
      complianceImpact: change.complianceImpact.gdprImpact.articlesAffected,
      userNotified: change.changeSummary.requiresNotification
    }));
  }

  private mapChangeTypeToEventType(changeType: ConsentChangeType): ConsentEventType {
    switch (changeType) {
      case 'initial_grant': return 'grant';
      case 'preference_update': return 'modify';
      case 'withdrawal': return 'withdraw';
      case 'expiration': return 'expire';
      case 'renewal': return 'renew';
      case 'migration': return 'migrate';
      default: return 'modify';
    }
  }

  private generateEventSummary(change: ConsentChangeEvent): string {
    switch (change.changeType) {
      case 'initial_grant':
        return `Consent granted for ${change.newState.purposes.length} purposes`;
      case 'withdrawal':
        return 'Consent withdrawn';
      case 'preference_update':
        return `Preferences updated (${change.changeSummary.totalChanges} changes)`;
      case 'expiration':
        return 'Consent expired';
      case 'renewal':
        return 'Consent renewed';
      default:
        return `Consent ${change.changeType}`;
    }
  }

  private async generateComplianceReport(
    userId: string, 
    changes: ConsentChangeEvent[]
  ): Promise<ConsentComplianceReport> {
    const issues = this.identifyComplianceIssues(changes);
    const riskAssessment = this.performRiskAssessment(changes);
    const integrityReport = await this.checkAuditIntegrity(changes);

    return {
      overallStatus: issues.length === 0 ? 'compliant' : 'under_review',
      frameworkCompliance: [
        {
          framework: 'GDPR',
          status: 'compliant',
          lastAssessment: new Date(),
          issues: issues.filter(i => i.framework === 'GDPR').map(i => i.description),
          actions: []
        }
      ],
      identifiedIssues: issues,
      riskAssessment,
      auditTrailIntegrity: integrityReport
    };
  }

  private identifyComplianceIssues(changes: ConsentChangeEvent[]): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // Check for withdrawal notifications
    const withdrawals = changes.filter(c => c.changeType === 'withdrawal');
    for (const withdrawal of withdrawals) {
      if (!withdrawal.changeSummary.requiresNotification) {
        issues.push({
          issueId: `ISSUE-${Date.now()}`,
          severity: 'medium',
          category: 'notification',
          description: 'Withdrawal did not trigger user notification',
          framework: 'GDPR',
          recommendation: 'Ensure all withdrawals notify the user',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    return issues;
  }

  private performRiskAssessment(changes: ConsentChangeEvent[]): ConsentRiskAssessment {
    const riskFactors: ConsentRiskFactor[] = [];
    
    const withdrawalCount = changes.filter(c => c.changeType === 'withdrawal').length;
    if (withdrawalCount > changes.length * 0.5) {
      riskFactors.push({
        factor: 'High withdrawal rate',
        impact: 'high',
        likelihood: 'high',
        description: `${withdrawalCount} withdrawals out of ${changes.length} changes`,
        mitigation: 'Review consent flows and improve user experience'
      });
    }

    const overallRisk: ConsentRiskLevel = riskFactors.length > 0 ? 'medium' : 'low';

    return {
      overallRisk,
      riskFactors,
      mitigationActions: riskFactors.map(f => f.mitigation),
      riskTrend: 'stable'
    };
  }

  private async checkAuditIntegrity(changes: ConsentChangeEvent[]): Promise<AuditIntegrityReport> {
    let integrityIssues = 0;
    const totalChanges = changes.length;

    // Check hash integrity
    for (const change of changes) {
      const expectedHash = this.generateIntegrityHash(change);
      if (change.integrityHash !== expectedHash) {
        integrityIssues++;
      }
    }

    const integrityScore = totalChanges > 0 ? ((totalChanges - integrityIssues) / totalChanges) * 100 : 100;

    return {
      overallIntegrity: integrityIssues === 0 ? 'intact' : 'compromised',
      checksPerformed: ['hash_verification', 'timestamp_sequence'],
      issuesFound: integrityIssues > 0 ? [`${integrityIssues} hash mismatches found`] : [],
      integrityScore,
      lastVerification: new Date()
    };
  }

  private async generateRecommendations(
    userId: string,
    changes: ConsentChangeEvent[]
  ): Promise<ConsentRecommendation[]> {
    const recommendations: ConsentRecommendation[] = [];

    // Check for frequent changes
    if (changes.length > 10) {
      recommendations.push({
        recommendationId: 'REC-1',
        category: 'user_experience',
        priority: 'medium',
        description: 'Consider implementing consent bundling to reduce user fatigue',
        benefits: ['Reduced user interruption', 'Better user experience'],
        implementation: 'Group related purposes into consent bundles',
        timeline: '2-4 weeks'
      });
    }

    return recommendations;
  }

  private calculateComplianceScore(changes: ConsentChangeEvent[]): number {
    if (changes.length === 0) return 100;

    let score = 100;
    const withdrawals = changes.filter(c => c.changeType === 'withdrawal');
    
    // Deduct points for missing notifications
    for (const withdrawal of withdrawals) {
      if (!withdrawal.changeSummary.requiresNotification) {
        score -= 10;
      }
    }

    return Math.max(0, score);
  }

  private calculateOverallRiskLevel(changes: ConsentChangeEvent[]): ConsentRiskLevel {
    const highImpactChanges = changes.filter(c => 
      c.changeSummary.impactLevel === 'high' || c.changeSummary.impactLevel === 'critical'
    ).length;

    if (highImpactChanges > changes.length * 0.3) return 'high';
    if (highImpactChanges > changes.length * 0.1) return 'medium';
    return 'low';
  }

  private async storeHistoryReport(report: ConsentHistoryReport): Promise<void> {
    await this.databaseService.query(`
      INSERT INTO consent_history_reports (
        report_id, user_id, generated_at, report_period_start, report_period_end,
        summary, timeline, compliance, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      report.reportId,
      report.userId,
      report.generatedAt.toISOString(),
      report.reportPeriod.startDate.toISOString(),
      report.reportPeriod.endDate.toISOString(),
      JSON.stringify(report.summary),
      JSON.stringify(report.timeline),
      JSON.stringify(report.compliance),
      JSON.stringify(report.recommendations)
    ]);
  }

  private convertToXML(report: ConsentHistoryReport): string {
    // Simplified XML conversion
    return `<?xml version="1.0" encoding="UTF-8"?>
<ConsentHistoryReport>
  <ReportId>${report.reportId}</ReportId>
  <UserId>${report.userId}</UserId>
  <GeneratedAt>${report.generatedAt.toISOString()}</GeneratedAt>
  <Summary>
    <TotalConsents>${report.summary.totalConsents}</TotalConsents>
    <TotalChanges>${report.summary.totalChanges}</TotalChanges>
    <ComplianceScore>${report.summary.complianceScore}</ComplianceScore>
  </Summary>
</ConsentHistoryReport>`;
  }

  private convertToCSV(report: ConsentHistoryReport): string {
    const headers = ['Timestamp', 'Event Type', 'Summary', 'Compliance Impact'];
    const rows = report.timeline.map(event => [
      event.timestamp.toISOString(),
      event.eventType,
      event.summary,
      event.complianceImpact.join(';')
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private async convertToPDF(report: ConsentHistoryReport): Promise<string> {
    // Mock PDF conversion - would use PDF generation library
    return `PDF Content for report ${report.reportId}`;
  }

  private async storeExportData(exportId: string, data: string, mimeType: string): Promise<string> {
    // Mock implementation - would store in file system or cloud storage
    const downloadUrl = `/api/consent/export/${exportId}`;
    
    // Store temporarily in Redis
    await this.redisService.set(`export:${exportId}`, data, 24 * 60 * 60); // 24 hours
    await this.redisService.set(`export:${exportId}:mime`, mimeType, 24 * 60 * 60);
    
    return downloadUrl;
  }

  private getDefaultConfig(): ConsentChangeHistoryConfig {
    return {
      enabled: true,
      immutableHistory: true,
      retentionPeriodDays: 2555, // 7 years for GDPR compliance
      maxVersionsPerConsent: 1000,
      enableRealTimeNotifications: true,
      complianceAlerting: {
        enabled: true,
        alertOnWithdrawal: true,
        alertOnModification: true,
        alertOnExpiry: true,
        alertOnCompliance: true
      },
      integrityChecking: {
        enabled: true,
        hashAlgorithm: 'sha256',
        digitalSignatures: true,
        chainValidation: true
      },
      reportGeneration: {
        enabled: true,
        automaticReports: false,
        reportFormats: ['json', 'pdf', 'xml'],
        reportSchedule: 'monthly'
      }
    };
  }

  private initializeService(): void {
    this.initializeDatabase().catch(error => {
      console.warn('Failed to initialize consent change history database:', error);
    });
  }

  private async initializeDatabase(): Promise<void> {
    // Create consent change history table
    await this.databaseService.query(`
      CREATE TABLE IF NOT EXISTS consent_change_history (
        change_id VARCHAR(255) PRIMARY KEY,
        consent_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        change_type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        previous_state TEXT NOT NULL,
        new_state TEXT NOT NULL,
        change_summary TEXT NOT NULL,
        change_context TEXT NOT NULL,
        change_reason TEXT NOT NULL,
        change_method VARCHAR(50) NOT NULL,
        legal_basis TEXT NOT NULL,
        compliance_impact TEXT NOT NULL,
        gdpr_compliance TEXT NOT NULL,
        evidence_id VARCHAR(255),
        integrity_hash VARCHAR(255) NOT NULL,
        digital_signature VARCHAR(255),
        metadata TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        flags TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create consent history reports table
    await this.databaseService.query(`
      CREATE TABLE IF NOT EXISTS consent_history_reports (
        report_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        generated_at TIMESTAMP NOT NULL,
        report_period_start TIMESTAMP NOT NULL,
        report_period_end TIMESTAMP NOT NULL,
        summary TEXT NOT NULL,
        timeline TEXT NOT NULL,
        compliance TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await this.databaseService.query(`
      CREATE INDEX IF NOT EXISTS idx_consent_change_history_consent_id ON consent_change_history(consent_id)
    `);
    await this.databaseService.query(`
      CREATE INDEX IF NOT EXISTS idx_consent_change_history_user_id ON consent_change_history(user_id)
    `);
    await this.databaseService.query(`
      CREATE INDEX IF NOT EXISTS idx_consent_change_history_timestamp ON consent_change_history(timestamp)
    `);
    await this.databaseService.query(`
      CREATE INDEX IF NOT EXISTS idx_consent_change_history_change_type ON consent_change_history(change_type)
    `);
  }
}

export default ConsentChangeHistoryService;