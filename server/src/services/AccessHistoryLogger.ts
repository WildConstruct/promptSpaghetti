/**
 * Access History Logger
 * Comprehensive access tracking and audit logging system
 * Part of Epic 19 - Security & Compliance Framework
 * Task: E19-1753114711794-54B5BE - Implement access history logging
 */

import { EventEmitter } from 'events';
import { DataProtectionEventLogger, DataProtectionEventType, ComplianceFramework } from '../../packages/core/security/DataProtectionEventLogger';
import { SecurityEventCoordinator } from './SecurityEventCoordinator';
import { AuditService } from '../auth/services/AuditService';
import { AccessControlFramework } from './security/AccessControlFramework';

export enum AccessEventType {
  // Authentication Events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_CREATED = 'session_created',
  SESSION_EXTENDED = 'session_extended',
  SESSION_EXPIRED = 'session_expired',
  SESSION_TERMINATED = 'session_terminated',
  
  // Authorization Events
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied',
  PERMISSION_ESCALATION = 'permission_escalation',
  
  // Resource Access Events
  RESOURCE_READ = 'resource_read',
  RESOURCE_WRITE = 'resource_write',
  RESOURCE_DELETE = 'resource_delete',
  RESOURCE_EXPORT = 'resource_export',
  RESOURCE_SHARE = 'resource_share',
  RESOURCE_DOWNLOAD = 'resource_download',
  
  // Data Access Events
  DATA_QUERY = 'data_query',
  DATA_MODIFICATION = 'data_modification',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_BACKUP = 'data_backup',
  DATA_RESTORE = 'data_restore',
  
  // Administrative Events
  ADMIN_ACCESS = 'admin_access',
  CONFIG_CHANGE = 'config_change',
  USER_IMPERSONATION = 'user_impersonation',
  ELEVATED_ACCESS = 'elevated_access',
  
  // API Events
  API_ACCESS = 'api_access',
  API_KEY_USED = 'api_key_used',
  WEBHOOK_TRIGGERED = 'webhook_triggered',
  
  // Compliance Events
  GDPR_ACCESS = 'gdpr_access',
  AUDIT_ACCESS = 'audit_access',
  COMPLIANCE_EXPORT = 'compliance_export'
}

export enum AccessResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  DENIED = 'denied',
  PARTIAL = 'partial',
  TIMEOUT = 'timeout',
  ERROR = 'error'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AccessContext {
  // User Context
  userId?: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  
  // Geographic Context
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    isp?: string;
    vpn_detected?: boolean;
  };
  
  // Device Context
  deviceInfo?: {
    deviceType?: string;
    browserName?: string;
    browserVersion?: string;
    osName?: string;
    osVersion?: string;
    screenResolution?: string;
    timezone?: string;
    fingerprint?: string;
  };
  
  // Request Context
  requestId?: string;
  endpoint?: string;
  method?: string;
  referrer?: string;
  correlationId?: string;
  
  // Security Context
  authMethod?: 'password' | 'mfa' | 'oauth' | 'sso' | 'api_key' | 'certificate';
  tlsVersion?: string;
  cipherSuite?: string;
  riskScore?: number;
  anomalyScore?: number;
  
  // Business Context
  workspaceId?: string;
  tenantId?: string;
  departmentId?: string;
  projectId?: string;
}

export interface AccessHistoryEvent {
  // Core Event Information
  eventId: string;
  eventType: AccessEventType;
  timestamp: Date;
  result: AccessResult;
  
  // Access Details
  resourceType: string;
  resourceId: string;
  resourcePath?: string;
  operation: string;
  permissions: string[];
  
  // Context Information
  context: AccessContext;
  
  // Risk Assessment
  riskLevel: RiskLevel;
  riskFactors: string[];
  anomalyDetected: boolean;
  
  // Compliance Information
  dataClassification?: string;
  complianceFrameworks: ComplianceFramework[];
  retentionPeriod?: number;
  
  // Audit Information
  auditRequired: boolean;
  sensitiveOperation: boolean;
  regulatoryImpact: boolean;
  
  // Additional Metadata
  duration?: number; // milliseconds
  recordsAffected?: number;
  dataSize?: number; // bytes
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface SessionTracking {
  sessionId: string;
  userId?: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  geolocation?: Record<string, any>;
  deviceFingerprint?: string;
  authMethod: string;
  accessCount: number;
  riskScore: number;
  anomalyCount: number;
  metadata?: Record<string, any>;
}

export interface ResourceAccessSummary {
  resourceType: string;
  resourceId: string;
  userId?: string;
  totalAccesses: number;
  lastAccessDate: Date;
  accessMethods: string[];
  permissions: string[];
  riskScore: number;
  complianceFlags: string[];
}

export interface AccessPattern {
  patternId: string;
  userId?: string;
  patternType: 'temporal' | 'geographic' | 'behavioral' | 'access_volume' | 'permission_escalation';
  description: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  riskScore: number;
  anomalyScore: number;
  associatedEvents: string[];
  metadata?: Record<string, any>;
}

export interface AccessAnalytics {
  timeframe: {
    start: Date;
    end: Date;
  };
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  successRate: number;
  averageRiskScore: number;
  
  // Event Distribution
  eventTypeDistribution: Record<AccessEventType, number>;
  resultDistribution: Record<AccessResult, number>;
  riskLevelDistribution: Record<RiskLevel, number>;
  
  // Top Lists
  topUsers: Array<{ userId: string; accessCount: number }>;
  topResources: Array<{ resourceId: string; accessCount: number }>;
  topEndpoints: Array<{ endpoint: string; accessCount: number }>;
  
  // Security Metrics
  failedAttempts: number;
  suspiciousActivity: number;
  anomaliesDetected: number;
  complianceViolations: number;
  
  // Geographic Distribution
  geographicDistribution: Record<string, number>;
  
  // Temporal Patterns
  hourlyDistribution: number[];
  dailyDistribution: number[];
}

/**
 * Comprehensive Access History Logging Service
 * Extends Epic 19 security infrastructure with detailed access tracking
 */
export class AccessHistoryLogger extends EventEmitter {
  private dataProtectionLogger: DataProtectionEventLogger;
  private securityCoordinator: SecurityEventCoordinator;
  private auditService: AuditService;
  private accessControl: AccessControlFramework;
  
  private sessionCache: Map<string, SessionTracking> = new Map();
  private patternCache: Map<string, AccessPattern> = new Map();
  private recentEvents: AccessHistoryEvent[] = [];
  
  private config: AccessHistoryConfig;

  constructor(
    dataProtectionLogger: DataProtectionEventLogger,
    securityCoordinator: SecurityEventCoordinator,
    auditService: AuditService,
    accessControl: AccessControlFramework,
    config?: Partial<AccessHistoryConfig>
  ) {
    super();
    
    this.dataProtectionLogger = dataProtectionLogger;
    this.securityCoordinator = securityCoordinator;
    this.auditService = auditService;
    this.accessControl = accessControl;
    this.config = { ...this.getDefaultConfig(), ...config };
    
    this.initializeEventHandlers();
  }

  /**
   * Log an access history event with comprehensive validation
   */
  async logAccessEvent(event: Partial<AccessHistoryEvent>): Promise<void> {
    try {
      // Security validation: Validate input parameters
      this.validateAccessEvent(event);
      
      const completeEvent = await this.enrichEvent(event);
      
      // Store event for analysis
      this.recentEvents.push(completeEvent);
      if (this.recentEvents.length > this.config.maxRecentEvents) {
        this.recentEvents.shift();
      }
      
      // Update session tracking
      await this.updateSessionTracking(completeEvent);
      
      // Perform risk assessment
      const riskAssessment = await this.assessRisk(completeEvent);
      completeEvent.riskLevel = riskAssessment.riskLevel;
      completeEvent.riskFactors = riskAssessment.riskFactors;
      completeEvent.anomalyDetected = riskAssessment.anomalyDetected;
      
      // Pattern detection
      await this.detectPatterns(completeEvent);
      
      // Log to data protection logger
      await this.logToDataProtection(completeEvent);
      
      // Log to audit service
      await this.logToAuditService(completeEvent);
      
      // Send to security coordinator
      await this.sendToSecurityCoordinator(completeEvent);
      
      // Check for alerts
      await this.checkAlertConditions(completeEvent);
      
      // Emit event for real-time processing
      this.emit('accessEvent', completeEvent);
      
    } catch (error) {
      // Security logging: Log the error without exposing sensitive details
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Access logging failed:', { 
        error: errorMessage,
        eventType: event.eventType,
        resourceType: event.resourceType,
        timestamp: new Date().toISOString()
      });
      
      // Rethrow with sanitized message
      throw new Error(`Access logging failed: ${errorMessage}`);
    }
  }

  /**
   * Log authentication events
   */
  async logAuthenticationEvent(
    eventType: AccessEventType,
    userId: string | undefined,
    context: AccessContext,
    result: AccessResult,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAccessEvent({
      eventType,
      resourceType: 'authentication',
      resourceId: 'auth_system',
      operation: eventType,
      permissions: [],
      context,
      result,
      auditRequired: true,
      sensitiveOperation: true,
      regulatoryImpact: eventType === AccessEventType.LOGIN_FAILURE,
      complianceFrameworks: [ComplianceFramework.GDPR, ComplianceFramework.SOX],
      metadata
    });
  }

  /**
   * Log resource access events
   */
  async logResourceAccess(
    resourceType: string,
    resourceId: string,
    operation: string,
    userId: string | undefined,
    context: AccessContext,
    result: AccessResult,
    permissions: string[],
    metadata?: Record<string, any>
  ): Promise<void> {
    const dataClassification = await this.getDataClassification(resourceType, resourceId);
    const complianceFrameworks = this.getComplianceFrameworks(dataClassification);
    
    await this.logAccessEvent({
      eventType: this.mapOperationToEventType(operation),
      resourceType,
      resourceId,
      operation,
      permissions,
      context,
      result,
      dataClassification,
      complianceFrameworks,
      auditRequired: this.isAuditRequired(dataClassification, operation),
      sensitiveOperation: this.isSensitiveOperation(dataClassification, operation),
      regulatoryImpact: this.hasRegulatoryImpact(dataClassification, operation),
      metadata
    });
  }

  /**
   * Log API access events
   */
  async logAPIAccess(
    endpoint: string,
    method: string,
    userId: string | undefined,
    context: AccessContext,
    result: AccessResult,
    duration: number,
    statusCode: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAccessEvent({
      eventType: AccessEventType.API_ACCESS,
      resourceType: 'api',
      resourceId: endpoint,
      operation: method,
      permissions: await this.getEndpointPermissions(endpoint),
      context: {
        ...context,
        endpoint,
        method
      },
      result,
      duration,
      complianceFrameworks: [ComplianceFramework.GDPR],
      auditRequired: this.isAuditRequiredForAPI(endpoint, statusCode),
      sensitiveOperation: this.isSensitiveEndpoint(endpoint),
      regulatoryImpact: false,
      metadata: {
        ...metadata,
        statusCode,
        responseTime: duration
      }
    });
  }

  /**
   * Get session tracking information
   */
  async getSessionTracking(sessionId: string): Promise<SessionTracking | null> {
    return this.sessionCache.get(sessionId) || null;
  }

  /**
   * Get access history for a user
   */
  async getUserAccessHistory(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      eventTypes?: AccessEventType[];
      resourceTypes?: string[];
      limit?: number;
    } = {}
  ): Promise<AccessHistoryEvent[]> {
    // In a real implementation, this would query the database
    return this.recentEvents.filter(event => 
      event.context.userId === userId &&
      (!options.startDate || event.timestamp >= options.startDate) &&
      (!options.endDate || event.timestamp <= options.endDate) &&
      (!options.eventTypes || options.eventTypes.includes(event.eventType)) &&
      (!options.resourceTypes || options.resourceTypes.includes(event.resourceType))
    ).slice(0, options.limit || 100);
  }

  /**
   * Get resource access summary
   */
  async getResourceAccessSummary(
    resourceType: string,
    resourceId: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<ResourceAccessSummary> {
    const relevantEvents = this.recentEvents.filter(event =>
      event.resourceType === resourceType &&
      event.resourceId === resourceId &&
      (!timeframe || (event.timestamp >= timeframe.start && event.timestamp <= timeframe.end))
    );

    const users = [...new Set(relevantEvents.map(e => e.context.userId).filter(Boolean))];
    const permissions = [...new Set(relevantEvents.flatMap(e => e.permissions))];
    const accessMethods = [...new Set(relevantEvents.map(e => e.context.authMethod).filter(Boolean))];
    const riskScores = relevantEvents.map(e => e.riskScore || 0).filter(Boolean);
    const complianceFlags = [...new Set(relevantEvents.flatMap(e => e.complianceFrameworks))];

    return {
      resourceType,
      resourceId,
      userId: users.length === 1 ? users[0] : undefined,
      totalAccesses: relevantEvents.length,
      lastAccessDate: new Date(Math.max(...relevantEvents.map(e => e.timestamp.getTime()))),
      accessMethods,
      permissions,
      riskScore: riskScores.length > 0 ? riskScores.reduce((a, b) => a + b) / riskScores.length : 0,
      complianceFlags
    };
  }

  /**
   * Generate access analytics
   */
  async generateAccessAnalytics(
    timeframe: { start: Date; end: Date },
    filters?: {
      userIds?: string[];
      resourceTypes?: string[];
      eventTypes?: AccessEventType[];
    }
  ): Promise<AccessAnalytics> {
    let events = this.recentEvents.filter(event =>
      event.timestamp >= timeframe.start &&
      event.timestamp <= timeframe.end
    );

    if (filters) {
      if (filters.userIds) {
        events = events.filter(e => filters.userIds!.includes(e.context.userId || ''));
      }
      if (filters.resourceTypes) {
        events = events.filter(e => filters.resourceTypes!.includes(e.resourceType));
      }
      if (filters.eventTypes) {
        events = events.filter(e => filters.eventTypes!.includes(e.eventType));
      }
    }

    const uniqueUsers = new Set(events.map(e => e.context.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map(e => e.context.sessionId)).size;
    const successfulEvents = events.filter(e => e.result === AccessResult.SUCCESS).length;
    const riskScores = events.map(e => e.riskScore || 0).filter(Boolean);

    return {
      timeframe,
      totalEvents: events.length,
      uniqueUsers,
      uniqueSessions,
      successRate: events.length > 0 ? (successfulEvents / events.length) * 100 : 0,
      averageRiskScore: riskScores.length > 0 ? riskScores.reduce((a, b) => a + b) / riskScores.length : 0,
      
      eventTypeDistribution: this.getDistribution(events, e => e.eventType),
      resultDistribution: this.getDistribution(events, e => e.result),
      riskLevelDistribution: this.getDistribution(events, e => e.riskLevel),
      
      topUsers: this.getTopEntries(events, e => e.context.userId || 'anonymous', 10),
      topResources: this.getTopEntries(events, e => e.resourceId, 10),
      topEndpoints: this.getTopEntries(events, e => e.context.endpoint || 'unknown', 10),
      
      failedAttempts: events.filter(e => e.result === AccessResult.FAILURE).length,
      suspiciousActivity: events.filter(e => e.riskLevel === RiskLevel.HIGH || e.riskLevel === RiskLevel.CRITICAL).length,
      anomaliesDetected: events.filter(e => e.anomalyDetected).length,
      complianceViolations: events.filter(e => e.regulatoryImpact).length,
      
      geographicDistribution: this.getDistribution(events, e => e.context.geolocation?.country || 'unknown'),
      
      hourlyDistribution: this.getHourlyDistribution(events),
      dailyDistribution: this.getDailyDistribution(events)
    };
  }

  // Private helper methods

  private async enrichEvent(event: Partial<AccessHistoryEvent>): Promise<AccessHistoryEvent> {
    const enriched: AccessHistoryEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date(),
      result: AccessResult.SUCCESS,
      riskLevel: RiskLevel.LOW,
      riskFactors: [],
      anomalyDetected: false,
      auditRequired: false,
      sensitiveOperation: false,
      regulatoryImpact: false,
      complianceFrameworks: [],
      ...event,
      eventType: event.eventType!,
      resourceType: event.resourceType!,
      resourceId: event.resourceId!,
      operation: event.operation!,
      permissions: event.permissions || [],
      context: event.context!
    };

    // Enrich with additional context if available
    if (enriched.context.userId) {
      enriched.context = await this.enrichUserContext(enriched.context);
    }

    if (enriched.context.ipAddress) {
      enriched.context = await this.enrichGeolocationContext(enriched.context);
    }

    return enriched;
  }

  private async enrichUserContext(context: AccessContext): Promise<AccessContext> {
    // In a real implementation, this would fetch user details
    return context;
  }

  private async enrichGeolocationContext(context: AccessContext): Promise<AccessContext> {
    // In a real implementation, this would perform IP geolocation lookup
    return context;
  }

  private async updateSessionTracking(event: AccessHistoryEvent): Promise<void> {
    const sessionId = event.context.sessionId;
    let session = this.sessionCache.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        userId: event.context.userId,
        createdAt: event.timestamp,
        lastActivityAt: event.timestamp,
        expiresAt: new Date(event.timestamp.getTime() + this.config.sessionTimeout),
        isActive: true,
        ipAddress: event.context.ipAddress,
        userAgent: event.context.userAgent,
        geolocation: event.context.geolocation,
        deviceFingerprint: event.context.deviceInfo?.fingerprint,
        authMethod: event.context.authMethod || 'unknown',
        accessCount: 0,
        riskScore: 0,
        anomalyCount: 0
      };
    }

    session.lastActivityAt = event.timestamp;
    session.accessCount++;
    session.riskScore = ((session.riskScore * (session.accessCount - 1)) + (event.riskScore || 0)) / session.accessCount;
    if (event.anomalyDetected) {
      session.anomalyCount++;
    }

    this.sessionCache.set(sessionId, session);
  }

  private async assessRisk(event: AccessHistoryEvent): Promise<{
    riskLevel: RiskLevel;
    riskFactors: string[];
    anomalyDetected: boolean;
  }> {
    const riskFactors: string[] = [];
    let riskScore = 0;
    let anomalyDetected = false;

    // Geographic risk factors
    if (event.context.geolocation?.vpn_detected) {
      riskFactors.push('VPN_DETECTED');
      riskScore += 30;
    }

    if (event.context.geolocation?.country && this.config.highRiskCountries.includes(event.context.geolocation.country)) {
      riskFactors.push('HIGH_RISK_COUNTRY');
      riskScore += 40;
    }

    // Time-based risk factors
    const hour = event.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      riskFactors.push('OFF_HOURS_ACCESS');
      riskScore += 20;
    }

    // Access pattern risk factors
    const recentEvents = this.recentEvents.filter(e => 
      e.context.sessionId === event.context.sessionId &&
      e.timestamp > new Date(event.timestamp.getTime() - 300000) // Last 5 minutes
    );

    if (recentEvents.length > this.config.rapidAccessThreshold) {
      riskFactors.push('RAPID_ACCESS_PATTERN');
      riskScore += 25;
      anomalyDetected = true;
    }

    // Permission escalation risk
    if (event.eventType === AccessEventType.PERMISSION_ESCALATION) {
      riskFactors.push('PERMISSION_ESCALATION');
      riskScore += 50;
    }

    // Failed access attempts
    if (event.result === AccessResult.FAILURE || event.result === AccessResult.DENIED) {
      riskFactors.push('ACCESS_FAILURE');
      riskScore += 35;
    }

    // Determine risk level
    let riskLevel: RiskLevel;
    if (riskScore >= 80) riskLevel = RiskLevel.CRITICAL;
    else if (riskScore >= 60) riskLevel = RiskLevel.HIGH;
    else if (riskScore >= 30) riskLevel = RiskLevel.MEDIUM;
    else riskLevel = RiskLevel.LOW;

    return { riskLevel, riskFactors, anomalyDetected };
  }

  private async detectPatterns(_____event: AccessHistoryEvent): Promise<void> {
    // Pattern detection logic would be implemented here
    // For now, just a placeholder
  }

  private async logToDataProtection(event: AccessHistoryEvent): Promise<void> {
    await this.dataProtectionLogger.logDataProtectionEvent({
      eventType: this.mapAccessEventToDataProtectionEvent(event.eventType),
      timestamp: event.timestamp,
      correlationId: event.eventId,
      userId: event.context.userId || 'anonymous',
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      dataClassification: event.dataClassification as any,
      operation: event.operation as any,
      automatedDecision: false,
      complianceFrameworks: event.complianceFrameworks,
      metadata: {
        accessResult: event.result,
        riskLevel: event.riskLevel,
        permissions: event.permissions,
        duration: event.duration,
        ...event.metadata
      }
    });
  }

  private async logToAuditService(event: AccessHistoryEvent): Promise<void> {
    await this.auditService.logEvent({
      timestamp: event.timestamp,
      userId: event.context.userId || 'anonymous',
      action: event.eventType,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      outcome: event.result,
      details: {
        operation: event.operation,
        permissions: event.permissions,
        riskLevel: event.riskLevel,
        riskFactors: event.riskFactors,
        context: event.context,
        metadata: event.metadata
      },
      correlationId: event.eventId
    });
  }

  private async sendToSecurityCoordinator(event: AccessHistoryEvent): Promise<void> {
    // Integration with SecurityEventCoordinator
    this.securityCoordinator.emit('accessEvent', {
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      riskLevel: event.riskLevel,
      anomalyDetected: event.anomalyDetected,
      context: event.context,
      metadata: event.metadata
    });
  }

  private async checkAlertConditions(event: AccessHistoryEvent): Promise<void> {
    if (event.riskLevel === RiskLevel.CRITICAL || event.riskLevel === RiskLevel.HIGH) {
      this.emit('highRiskAccess', event);
    }

    if (event.anomalyDetected) {
      this.emit('accessAnomaly', event);
    }

    if (event.regulatoryImpact) {
      this.emit('complianceAlert', event);
    }
  }

  private mapOperationToEventType(operation: string): AccessEventType {
    const mapping: Record<string, AccessEventType> = {
      'read': AccessEventType.RESOURCE_READ,
      'write': AccessEventType.RESOURCE_WRITE,
      'delete': AccessEventType.RESOURCE_DELETE,
      'export': AccessEventType.RESOURCE_EXPORT,
      'share': AccessEventType.RESOURCE_SHARE,
      'download': AccessEventType.RESOURCE_DOWNLOAD
    };
    return mapping[operation.toLowerCase()] || AccessEventType.RESOURCE_READ;
  }

  private mapAccessEventToDataProtectionEvent(eventType: AccessEventType): DataProtectionEventType {
    const mapping: Record<AccessEventType, DataProtectionEventType> = {
      [AccessEventType.GDPR_ACCESS]: DataProtectionEventType.DATA_SUBJECT_ACCESS,
      [AccessEventType.RESOURCE_EXPORT]: DataProtectionEventType.DATA_PORTABILITY_REQUEST,
      [AccessEventType.COMPLIANCE_EXPORT]: DataProtectionEventType.COMPLIANCE_AUDIT_ACCESS
    };
    return mapping[eventType] || DataProtectionEventType.COMPLIANCE_AUDIT_ACCESS;
  }

  private async getDataClassification(_____resourceType: string, _____resourceId: string): Promise<string> {
    // Implementation would determine data classification based on resource
    return 'internal';
  }

  private getComplianceFrameworks(dataClassification: string): ComplianceFramework[] {
    const mapping: Record<string, ComplianceFramework[]> = {
      'pii': [ComplianceFramework.GDPR, ComplianceFramework.CCPA],
      'financial': [ComplianceFramework.SOX],
      'health': [ComplianceFramework.HIPAA],
      'confidential': [ComplianceFramework.GDPR],
      'internal': [ComplianceFramework.GDPR]
    };
    return mapping[dataClassification] || [ComplianceFramework.GDPR];
  }

  private isAuditRequired(dataClassification: string, operation: string): boolean {
    return dataClassification === 'pii' || dataClassification === 'confidential' || 
           operation === 'delete' || operation === 'export';
  }

  private isSensitiveOperation(dataClassification: string, operation: string): boolean {
    return dataClassification === 'pii' || dataClassification === 'confidential' ||
           ['delete', 'export', 'share'].includes(operation);
  }

  private hasRegulatoryImpact(dataClassification: string, operation: string): boolean {
    return dataClassification === 'pii' && ['delete', 'export'].includes(operation);
  }

  private async getEndpointPermissions(_____endpoint: string): Promise<string[]> {
    // Implementation would determine required permissions for endpoint
    return ['read'];
  }

  private isAuditRequiredForAPI(endpoint: string, statusCode: number): boolean {
    return endpoint.includes('/admin') || statusCode >= 400;
  }

  private isSensitiveEndpoint(endpoint: string): boolean {
    return endpoint.includes('/admin') || endpoint.includes('/user') || endpoint.includes('/auth');
  }

  private generateEventId(): string {
    return `access_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private initializeEventHandlers(): void {
    // Set up cleanup intervals
    setInterval(() => this.cleanupOldEvents(), this.config.cleanupInterval);
    setInterval(() => this.cleanupExpiredSessions(), this.config.sessionCleanupInterval);
  }

  private cleanupOldEvents(): void {
    const cutoff = new Date(Date.now() - this.config.eventRetentionPeriod);
    this.recentEvents = this.recentEvents.filter(event => event.timestamp > cutoff);
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessionCache) {
      if (session.expiresAt < now || !session.isActive) {
        this.sessionCache.delete(sessionId);
      }
    }
  }

  private getDistribution<T>(events: AccessHistoryEvent[], mapper: (event: AccessHistoryEvent) => T): Record<string, number> {
    return events.reduce((acc, event) => {
      const key = String(mapper(event));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopEntries(events: AccessHistoryEvent[], mapper: (event: AccessHistoryEvent) => string, limit: number): Array<{ userId: string; accessCount: number }> {
    const distribution = this.getDistribution(events, mapper);
    return Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([userId, accessCount]) => ({ userId, accessCount }));
  }

  private getHourlyDistribution(events: AccessHistoryEvent[]): number[] {
    const hours = new Array(24).fill(0);
    events.forEach(event => {
      hours[event.timestamp.getHours()]++;
    });
    return hours;
  }

  private getDailyDistribution(events: AccessHistoryEvent[]): number[] {
    const days = new Array(7).fill(0);
    events.forEach(event => {
      days[event.timestamp.getDay()]++;
    });
    return days;
  }

  /**
   * Security validation for access events - prevents injection and validates required fields
   */
  private validateAccessEvent(event: Partial<AccessHistoryEvent>): void {
    if (!event) {
      throw new Error('Access event cannot be null or undefined');
    }

    // Validate required fields
    if (!event.eventType) {
      throw new Error('Event type is required');
    }
    if (!event.resourceType) {
      throw new Error('Resource type is required');
    }
    if (!event.resourceId) {
      throw new Error('Resource ID is required');
    }
    if (!event.operation) {
      throw new Error('Operation is required');
    }
    if (!event.context?.sessionId) {
      throw new Error('Session ID in context is required');
    }

    // Security validation: Sanitize string inputs
    const sanitizeString = (str: string): string => {
      if (typeof str !== 'string') return String(str);
      return str.replace(/[\x00-\x1f\x7f-\x9f]/g, ''); // Remove control characters
    };

    // Validate and sanitize resource type and ID to prevent injection
    if (typeof event.resourceType === 'string') {
      if (event.resourceType.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(event.resourceType)) {
        throw new Error('Invalid resource type format');
      }
    }

    if (typeof event.resourceId === 'string') {
      if (event.resourceId.length > 255) {
        throw new Error('Resource ID too long');
      }
      event.resourceId = sanitizeString(event.resourceId);
    }

    // Validate operation
    if (typeof event.operation === 'string') {
      if (event.operation.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(event.operation)) {
        throw new Error('Invalid operation format');
      }
    }

    // Validate permissions array
    if (event.permissions && Array.isArray(event.permissions)) {
      event.permissions.forEach(permission => {
        if (typeof permission === 'string') {
          if (permission.length > 100 || !/^[a-zA-Z0-9:_-]+$/.test(permission)) {
            throw new Error('Invalid permission format');
          }
        }
      });
    }

    // Validate IP address format if present
    if (event.context?.ipAddress) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      if (!ipRegex.test(event.context.ipAddress)) {
        throw new Error('Invalid IP address format');
      }
    }

    // Validate session ID format
    if (event.context?.sessionId && typeof event.context.sessionId === 'string') {
      if (event.context.sessionId.length > 255 || !/^[a-zA-Z0-9_-]+$/.test(event.context.sessionId)) {
        throw new Error('Invalid session ID format');
      }
    }
  }

  private getDefaultConfig(): AccessHistoryConfig {
    return {
      maxRecentEvents: 10000,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      sessionCleanupInterval: 30 * 60 * 1000, // 30 minutes
      eventRetentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      rapidAccessThreshold: 10,
      highRiskCountries: ['CN', 'RU', 'KP', 'IR']
    };
  }
}

export interface AccessHistoryConfig {
  maxRecentEvents: number;
  sessionTimeout: number;
  cleanupInterval: number;
  sessionCleanupInterval: number;
  eventRetentionPeriod: number;
  rapidAccessThreshold: number;
  highRiskCountries: string[];
}