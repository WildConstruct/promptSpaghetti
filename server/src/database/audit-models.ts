// Epic 17.1.6 - Comprehensive Audit Logging System Models

export enum AuditEventType {
  // Feature Toggle Events
  TOGGLE_CREATED = 'toggle_created',
  TOGGLE_UPDATED = 'toggle_updated',
  TOGGLE_DELETED = 'toggle_deleted',
  TOGGLE_ENABLED = 'toggle_enabled',
  TOGGLE_DISABLED = 'toggle_disabled',
  TOGGLE_ARCHIVED = 'toggle_archived',
  TOGGLE_RESTORED = 'toggle_restored',
  
  // Schedule Events
  SCHEDULE_CREATED = 'schedule_created',
  SCHEDULE_UPDATED = 'schedule_updated',
  SCHEDULE_DELETED = 'schedule_deleted',
  SCHEDULE_EXECUTED = 'schedule_executed',
  SCHEDULE_FAILED = 'schedule_failed',
  SCHEDULE_CANCELLED = 'schedule_cancelled',
  SCHEDULE_PAUSED = 'schedule_paused',
  SCHEDULE_RESUMED = 'schedule_resumed',
  
  // User Management Events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_ASSIGNED = 'user_role_assigned',
  USER_ROLE_REMOVED = 'user_role_removed',
  USER_PERMISSION_GRANTED = 'user_permission_granted',
  USER_PERMISSION_REVOKED = 'user_permission_revoked',
  
  // Access Control Events
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PERMISSION_ESCALATION = 'permission_escalation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  
  // System Events
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  CONFIGURATION_CHANGED = 'configuration_changed',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  
  // Security Events
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  TOKEN_ISSUED = 'token_issued',
  TOKEN_REVOKED = 'token_revoked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_BREACH_DETECTED = 'security_breach_detected',
  
  // Data Events
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',
  DATA_PURGED = 'data_purged',
  DATA_ARCHIVED = 'data_archived',
  
  // API Events
  API_REQUEST = 'api_request',
  API_ERROR = 'api_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // Compliance Events
  GDPR_REQUEST = 'gdpr_request',
  DATA_RETENTION_APPLIED = 'data_retention_applied',
  COMPLIANCE_REPORT_GENERATED = 'compliance_report_generated'
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM_CONFIGURATION = 'system_configuration',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance',
  ERROR = 'error'
}

export enum ComplianceStandard {
  SOC2 = 'soc2',
  ISO27001 = 'iso27001',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  CCPA = 'ccpa',
  SOX = 'sox'
}

// Core audit event model
}
export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  
  // Actor information (who performed the action)
  actorId?: string;
  actorType: 'user' | 'system' | 'service' | 'anonymous';
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  
  // Subject information (what was acted upon)
  resourceType: string; // 'feature_toggle', 'schedule', 'user', etc.
  resourceId?: string;
  resourceName?: string;
  
  // Action details
  action: string;
  description: string;
  outcome: 'success' | 'failure' | 'partial';
  
  // Change tracking
  beforeValue?: Record<string, any>;
  afterValue?: Record<string, any>;
  changedFields?: string[];
  
  // Context information
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  
  // Technical context
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
}
    };
  };
  
  // Metadata and additional context
  metadata: Record<string, any>;
  tags: string[];
  
  // Compliance and retention
  complianceStandards: ComplianceStandard[];
  retentionPeriod?: number; // days
  
  // Integrity and security
  checksum?: string; // For tamper detection
  signature?: string; // Digital signature
  
  // Timing
  timestamp: Date;
  duration?: number; // milliseconds
  
  // Error information (for failed events)
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

// Audit trail for tracking changes over time
}
export interface AuditTrail {
  id: string;
  resourceType: string;
  resourceId: string;
  events: AuditEvent[];
  firstEvent: Date;
  lastEvent: Date;
  totalEvents: number;
  createdAt: Date;
  updatedAt: Date;
}
}

// Audit session for tracking user sessions
}
export interface AuditSession {
  id: string;
  sessionId: string;
  userId?: string;
  actorEmail?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Session context
  ipAddress: string;
  userAgent: string;
  location?: AuditEvent['location'];
  
  // Session statistics
  eventCount: number;
  successfulActions: number;
  failedActions: number;
  securityEvents: number;
  
  // Session metadata
  metadata: Record<string, any>;
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
}

// Compliance report model
}
export interface ComplianceReport {
  id: string;
  reportType: 'access_report' | 'change_report' | 'security_report' | 'retention_report';
  standard: ComplianceStandard;
  
  // Report parameters
  startDate: Date;
  endDate: Date;
  scope: {
    userIds?: string[];
    resourceTypes?: string[];
    eventTypes?: AuditEventType[];
}
  };
  
  // Report data
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    criticalEvents: number;
    securityIncidents: number;
    complianceViolations: number;
  };
  
  events: AuditEvent[];
  violations: Array<{
    eventId: string;
    violationType: string;
    description: string;
    severity: AuditSeverity;
    remediation?: string;
  }>;
  
  // Report metadata
  generatedBy: string;
  generatedAt: Date;
  format: 'json' | 'pdf' | 'csv' | 'xml';
  fileSize?: number;
  filePath?: string;
  
  // Digital signature for integrity
  signature?: string;
  checksum?: string;
}

// Audit configuration
}
export interface AuditConfiguration {
  id: string;
  
  // Event filtering
  enabledEventTypes: AuditEventType[];
  excludedEventTypes: AuditEventType[];
  minimumSeverity: AuditSeverity;
  
  // Data retention
  defaultRetentionDays: number;
  retentionByCategory: Record<AuditCategory, number>;
  archiveAfterDays: number;
  deleteAfterDays: number;
  
  // Security settings
  enableIntegrityChecking: boolean;
  enableDigitalSignatures: boolean;
  enableEncryption: boolean;
  encryptionAlgorithm?: string;
  
  // Performance settings
  batchSize: number;
  flushInterval: number; // seconds
  maxMemoryBuffer: number; // MB
  
  // Compliance settings
  requiredStandards: ComplianceStandard[];
  automaticReportGeneration: boolean;
  reportSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string; // HH:mm format
}
  };
  
  // Notification settings
  alertOnCriticalEvents: boolean;
  alertOnSecurityEvents: boolean;
  alertRecipients: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Audit statistics
}
export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByCategory: Record<AuditCategory, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  
  // Time-based statistics
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  
  // User statistics
  uniqueUsers: number;
  topUsers: Array<{
    userId: string;
    userEmail: string;
    eventCount: number;
}
  }>;
  
  // Resource statistics
  topResources: Array<{
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    eventCount: number;
  }>;
  
  // Security statistics
  securityEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  
  // Performance statistics
  averageEventSize: number;
  totalStorageUsed: number;
  processingLatency: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  
  generatedAt: Date;
}

// Request/Response types for API
}
export interface CreateAuditEventRequest {
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  action: string;
  description: string;
  outcome: 'success' | 'failure' | 'partial';
  beforeValue?: Record<string, any>;
  afterValue?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
  complianceStandards?: ComplianceStandard[];
}
}

}
export interface AuditEventQuery {
  // Time filters
  startDate?: string;
  endDate?: string;
  
  // Event filters
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  outcomes?: ('success' | 'failure' | 'partial')[];
  
  // Actor filters
  actorIds?: string[];
  actorEmails?: string[];
  actorTypes?: ('user' | 'system' | 'service' | 'anonymous')[];
  
  // Resource filters
  resourceTypes?: string[];
  resourceIds?: string[];
  
  // Context filters
  ipAddress?: string;
  sessionId?: string;
  correlationId?: string;
  
  // Search
  searchTerm?: string;
  tags?: string[];
  
  // Compliance
  complianceStandards?: ComplianceStandard[];
  
  // Pagination
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'severity' | 'eventType' | 'actorEmail';
  sortOrder?: 'asc' | 'desc';
}
}

}
export interface AuditEventResponse {
  events: AuditEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
  };
  summary: {
    totalEvents: number;
    eventsByCategory: Record<AuditCategory, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    uniqueActors: number;
    timeRange: {
      start: Date;
      end: Date;
    };
  };
}

}
export interface CreateComplianceReportRequest {
  reportType: ComplianceReport['reportType'];
  standard: ComplianceStandard;
  startDate: string;
  endDate: string;
  scope?: ComplianceReport['scope'];
  format?: ComplianceReport['format'];
}
}

// Audit middleware context
}
export interface AuditContext {
  actorId?: string;
  actorType: 'user' | 'system' | 'service' | 'anonymous';
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
}

// Export configuration for different formats
}
export interface ExportConfiguration {
  format: 'json' | 'csv' | 'xml' | 'pdf';
  includeMetadata: boolean;
  includeIntegrityData: boolean;
  compression?: 'gzip' | 'zip';
  encryption?: {
    algorithm: string;
    keyId: string;
}
  };
  digitalSignature?: boolean;
}

export default {
  AuditEventType,
  AuditSeverity,
  AuditCategory,
  ComplianceStandard
};