// Data Retention Audit Types
// Task: E17-1753114396831-B13C0D - Create audit schema
// Epic: 19 - Security & Compliance Framework

}
}
export interface DataRetentionAuditRecord {
  id: string;
  timestamp: Date;
  operationId: string;
  correlationId?: string;
  
  // Operation details
  operationType: DataRetentionOperationType;
  operationStatus: OperationStatus;
  
  // Subject information
  initiatedByUserId?: string;
  initiatedBySystemComponent?: string;
  affectedUserId?: string;
  affectedDataSubjectId?: string;
  
  // Target data information
  targetDataType: string;
  targetTableName?: string;
  targetRecordIds: string[];
  targetDataClassification?: string;
  targetDataSensitivity?: DataSensitivity;
  
  // Policy information
  retentionPolicyId?: string;
  retentionPolicyName?: string;
  retentionPeriodDays?: number;
  deletionMethod?: DeletionMethod;
  
  // Legal and compliance context
  legalBasis?: string;
  complianceFramework?: string;
  isSubjectRequest: boolean;
  requestReference?: string;
  legalHoldApplied: boolean;
  dataProcessingPurpose: string[];
  
  // Execution details
  recordsProcessed: number;
  recordsDeleted: number;
  recordsArchived: number;
  recordsAnonymized: number;
  recordsFailed: number;
  dataVolumeBytes?: number;
  executionDurationMs?: number;
  
  // Results and validation
  validationChecksPassed: string[];
  validationChecksFailed: string[];
  integrityHash?: string;
  backupLocation?: string;
  
  // Error and exception handling
  errorCode?: string;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  retryCount: number;
  exceptionGranted: boolean;
  exceptionReason?: string;
  
  // Audit and compliance metadata
  auditTrailHash?: string;
  previousAuditHash?: string;
  complianceVerified: boolean;
  complianceVerificationDate?: Date;
  complianceVerifierId?: string;
  
  // Data protection impact
  privacyImpactAssessmentRef?: string;
  dataProtectionMeasures: string[];
  riskAssessment?: RiskLevel;
  mitigationActions: string[];
  
  // Retention and archival
  auditRetentionPeriod: number;
  archiveAfterDays: number;
  permanentRetention: boolean;
  
  // Additional metadata
  systemContext: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  geographicLocation?: string;
  metadata: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface DataSubjectRightsAuditRecord {
  id: string;
  timestamp: Date;
  requestId: string;
  
  // Subject information
  dataSubjectId?: string;
  dataSubjectEmail?: string;
  dataSubjectIdentifier?: string;
  
  // Request details
  requestType: DataSubjectRequestType;
  requestStatus: DataSubjectRequestStatus;
  requestMethod?: RequestMethod;
  
  // Processing information
  receivedDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  processorUserId?: string;
  reviewerUserId?: string;
  
  // Legal basis and justification
  legalBasis?: string;
  processingLawfulness: string[];
  rejectionReason?: string;
  identityVerified: boolean;
  identityVerificationMethod?: string;
  
  // Data scope and impact
  dataCategoriesAffected: string[];
  systemsAffected: string[];
  thirdPartiesNotified: string[];
  dataVolumeAffectedBytes?: number;
  
  // Response and fulfillment
  responseMethod?: string;
  responseFormat?: string;
  dataDeliveredDate?: Date;
  deliveryConfirmation: boolean;
  deliveryTrackingRef?: string;
  
  // Compliance tracking
  regulatoryDeadlineMet?: boolean;
  escalationRequired: boolean;
  escalationReason?: string;
  complianceRiskLevel?: RiskLevel;
  
  // Documentation
  supportingDocuments: string[];
  communicationLog: CommunicationLogEntry[];
  auditNotes?: string;
  
  // Metadata
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface ComplianceMonitoringAuditRecord {
  id: string;
  timestamp: Date;
  monitoringEventId: string;
  
  // Monitoring details
  complianceFramework: string;
  monitoringType: ComplianceMonitoringType;
  
  // Scope and coverage
  scopeDescription?: string;
  systemsMonitored: string[];
  dataTypesMonitored: string[];
  monitoringPeriodStart?: Date;
  monitoringPeriodEnd?: Date;
  
  // Findings and results
  complianceStatus: ComplianceStatus;
  violationsDetected: number;
  violationsSeverity?: ViolationSeverity;
  violationsDetails: ComplianceViolation[];
  
  // Risk assessment
  riskScore?: number;
  riskFactors: string[];
  potentialImpact?: string;
  likelihoodAssessment?: string;
  
  // Remediation
  remediationRequired: boolean;
  remediationActions: RemediationAction[];
  remediationTimeline?: string; // ISO 8601 duration
  remediationStatus?: RemediationStatus;
  
  // Reporting and notification
  authoritiesNotified: string[];
  notificationRequired: boolean;
  notificationTimeline?: string; // ISO 8601 duration
  breachNotificationSent: boolean;
  
  // Audit trail
  performedByUserId?: string;
  performedBySystem?: string;
  monitoringTool?: string;
  evidenceCollected: string[];
  
  // Documentation
  assessmentReportLocation?: string;
  supportingEvidence: string[];
  recommendations: string[];
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpCompleted: boolean;
  
  // Metadata
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
}
}

// Supporting Types and Enums

export type DataRetentionOperationType = 
  | 'POLICY_EXECUTION'
  | 'DATA_DELETION' 
  | 'DATA_ARCHIVAL'
  | 'DATA_EXPORT'
  | 'RETENTION_HOLD'
  | 'POLICY_CREATE'
  | 'POLICY_UPDATE'
  | 'POLICY_DELETE'
  | 'CONSENT_WITHDRAWAL'
  | 'RIGHT_TO_ERASURE'
  | 'DATA_PORTABILITY'
  | 'RETENTION_REVIEW'
  | 'COMPLIANCE_SCAN'
  | 'AUDIT_EXPORT';

export type OperationStatus = 
  | 'INITIATED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PARTIALLY_COMPLETED';

export type DataSensitivity = 
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export type DeletionMethod = 
  | 'soft'
  | 'hard'
  | 'archive'
  | 'anonymize';

export type RiskLevel = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type DataSubjectRequestType = 
  | 'ACCESS'
  | 'RECTIFICATION'
  | 'ERASURE'
  | 'RESTRICTION'
  | 'PORTABILITY'
  | 'OBJECTION'
  | 'CONSENT_WITHDRAWAL';

export type DataSubjectRequestStatus = 
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'IDENTITY_VERIFICATION'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'PARTIALLY_FULFILLED'
  | 'ESCALATED';

export type RequestMethod = 
  | 'EMAIL'
  | 'FORM'
  | 'PHONE'
  | 'LETTER'
  | 'IN_PERSON'
  | 'API';

export type ComplianceMonitoringType = 
  | 'AUTOMATED_SCAN'
  | 'MANUAL_REVIEW'
  | 'INCIDENT_INVESTIGATION'
  | 'REGULAR_ASSESSMENT'
  | 'BREACH_DETECTION'
  | 'POLICY_COMPLIANCE_CHECK';

export type ComplianceStatus = 
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'PARTIAL'
  | 'UNKNOWN';

export type ViolationSeverity = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type RemediationStatus = 
  | 'NOT_REQUIRED'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED';

// Supporting Interfaces

}
}
export interface CommunicationLogEntry {
  timestamp: Date;
  method: string;
  direction: 'INBOUND' | 'OUTBOUND';
  subject?: string;
  summary: string;
  attachments?: string[];
}
}
}

}
}
export interface ComplianceViolation {
  id: string;
  violationType: string;
  description: string;
  severity: ViolationSeverity;
  affectedSystems: string[];
  evidenceRefs: string[];
  regulatoryReference?: string;
  potentialFines?: number;
}
}
}

}
}
export interface RemediationAction {
  id: string;
  actionType: string;
  description: string;
  assignedTo?: string;
  dueDate?: Date;
  completedDate?: Date;
  status: RemediationStatus;
  cost?: number;
  priority: number;
}
}
}

// Audit Summary Types

}
}
export interface DataRetentionAuditSummary {
  auditDate: Date;
  operationType: DataRetentionOperationType;
  complianceFramework?: string;
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  totalRecordsProcessed: number;
  totalRecordsDeleted: number;
  totalRecordsArchived: number;
  avgExecutionTime?: number;
  subjectRequests: number;
  legalHoldOperations: number;
  uniqueAffectedUsers: number;
}
}
}

}
}
export interface DataSubjectRightsSummary {
  requestMonth: Date;
  requestType: DataSubjectRequestType;
  totalRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  missedDeadlines: number;
  avgProcessingDays?: number;
  escalatedRequests: number;
}
}
}

}
}
export interface ComplianceViolationsSummary {
  complianceFramework: string;
  violationsSeverity: ViolationSeverity;
  violationCount: number;
  remediatedCount: number;
  reportedCount: number;
  avgRiskScore?: number;
  latestViolation: Date;
}
}
}

// Audit Service Configuration

}
}
export interface AuditConfiguration {
  enabledFrameworks: string[];
  retentionPeriods: {
    dataRetentionAudit: number;
    subjectRightsAudit: number;
    complianceMonitoringAudit: number;
}
}
  };
  integrityHashingEnabled: boolean;
  automaticArchivalEnabled: boolean;
  realTimeMonitoringEnabled: boolean;
  notificationThresholds: {
    criticalViolations: number;
    missedDeadlines: number;
    failedOperations: number;
  };
}

// Export Functions Interface

}
}
export interface AuditExportOptions {
  startDate?: Date;
  endDate?: Date;
  complianceFramework?: string;
  operationType?: string;
  includeMetadata?: boolean;
  format?: 'JSON' | 'CSV' | 'XML';
}
}
}

}
}
export interface AuditExportResult {
  auditType: 'data_retention' | 'subject_rights' | 'compliance_monitoring';
  auditData: Record<string, any>;
}
}
}