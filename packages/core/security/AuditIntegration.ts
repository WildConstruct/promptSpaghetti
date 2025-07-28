/**
 * AuditIntegration - Integrates audit logging with classification enforcement
 * 
 * Automatically logs all classification enforcement decisions and data access
 * operations, providing a complete audit trail for security and compliance.
 * 
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */
import { AuditLogger, AuditOperation, type AuditLogEntry } from './AuditLogger';
import { ClassificationEnforcer } from './ClassificationEnforcer';
import { DataClassifier } from './DataClassifier';
import {
  DataClassificationLevel,
  type OperationContext,
  type ClassificationResult
} from '../types/DataClassification';
/**
 * Configuration for audit integration
 */
export interface AuditIntegrationConfig {
  auditLogger: AuditLogger;
  classificationEnforcer?: ClassificationEnforcer;
  dataClassifier?: DataClassifier;
  // Options
  logAllOperations?: boolean;
  logDeniedAccess?: boolean;
  logClassificationChanges?: boolean;
  enrichWithClassification?: boolean;
}
/**
 * Audit integration service
 */
export class AuditIntegration {
  private logger: AuditLogger;
  private enforcer?: ClassificationEnforcer;
  private classifier?: DataClassifier;
  private config: Required<Omit<AuditIntegrationConfig, 'classificationEnforcer' | 'dataClassifier'>>;
  constructor(config: AuditIntegrationConfig) {
    this.logger = config.auditLogger;
    this.enforcer = config.classificationEnforcer;
    this.classifier = config.dataClassifier;
    this.config = {
      auditLogger: config.auditLogger,
      logAllOperations: config.logAllOperations ?? true,
      logDeniedAccess: config.logDeniedAccess ?? true,
      logClassificationChanges: config.logClassificationChanges ?? true,
      enrichWithClassification: config.enrichWithClassification ?? true
    };
    // Set up event listeners if components are provided
    this.setupEventListeners();
  }
  /**
   * Log a data access operation with automatic classification enrichment
   */
  async logDataAccess()
    context: OperationContext,
    resourceType: string,
    resourceId: string,
    data?: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    let classification = DataClassificationLevel.PUBLIC;
    let classificationMetadata: Record<string, any> = {};
    // Classify the data if classifier is available
    if (this.classifier && data && this.config.enrichWithClassification) {
      const result = await this.classifier.classifyData(data);
      classification = result.level;
      classificationMetadata = {
        confidenceScore: result.confidence,
        matchedPatterns: result.matchedPatterns,
        fieldClassifications: result.fieldClassifications,
      };
    }
    // Check if access is allowed if enforcer is available
    let enforcementResult;
    if (this.enforcer) {
      enforcementResult = await this.enforcer.enforceClassification()
        classification,
        context
      );
    }
    // Log the access
    await this.logger.logDataAccess()
      context,
      resourceType,
      resourceId,
      classification,
      enforcementResult?.allowed ?? true,
      {
        ...metadata,
        ...classificationMetadata,
        enforcementResult: enforcementResult ? {
          allowed: enforcementResult.allowed,
          riskScore: enforcementResult.riskScore,
          appliedControls: enforcementResult.appliedControls,
          missingControls: enforcementResult.missingControls,
        } : undefined
      }
    );
    // Log denied access separately if configured
    if (!enforcementResult?.allowed && this.config.logDeniedAccess) {
      await this.logSecurityEvent()
        'ACCESS_DENIED',
        context,
        {
          resourceType,
          resourceId,
          classification,
          reason: enforcementResult?.reason,
          missingControls: enforcementResult?.missingControls,
        }
      );
    }
  }
  /**
   * Log an administrative operation
   */
  async logAdminOperation()
    operation: 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'CHANGE_CLASSIFICATION',
    context: OperationContext,
    target: {,
      userId?: string;
      resourceType: string;
      resourceId: string;
      classification?: DataClassificationLevel;
    },
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logger.log({)
      userId: context.userId,
      userRole: context.userRole,
      operation: AuditOperation[operation],
      resourceType: target.resourceType,
      resourceId: target.resourceId,
      dataClassification: target.classification || DataClassificationLevel.PUBLIC,
      ipAddress: context.ipAddress,
      sessionId: context.sessionId,
      authorized: true,
      success: true,
      sensitiveAccess: target.classification ? 
        this.isSensitiveClassification(target.classification) : false,
      metadata: {,
        targetUserId: target.userId,
        ...metadata
      }
    });
  }
  /**
   * Log a security event
   */
  async logSecurityEvent()
    eventType: string,
    context: OperationContext,
    details: Record<string, any>
  ): Promise<void> {
    await this.logger.log({)
      userId: context.userId,
      userRole: context.userRole,
      operation: AuditOperation.AUTHORIZATION,
      resourceType: 'security_event',
      resourceId: eventType,
      dataClassification: DataClassificationLevel.INTERNAL,
      ipAddress: context.ipAddress,
      sessionId: context.sessionId,
      authorized: false,
      success: false,
      anomalyDetected: true,
      metadata: {,
        eventType,
        ...details
      }
    });
  }
  /**
   * Log a batch operation
   */
  async logBatchOperation()
    context: OperationContext,
    operation: AuditOperation,
    resources: Array<{,
      type: string;
      id: string;
      classification?: DataClassificationLevel;
    }>,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    const highestClassification = resources.reduce((highest, resource) => {
      const level = resource.classification || DataClassificationLevel.PUBLIC;
      return this.getClassificationPriority(level) > this.getClassificationPriority(highest)
        ? level : highest;
    }, DataClassificationLevel.PUBLIC);
    await this.logger.log({)
      userId: context.userId,
      userRole: context.userRole,
      operation: AuditOperation.BATCH_OPERATION,
      resourceType: 'batch',
      resourceId: `batch_${Date.now()}`,}
      dataClassification: highestClassification,
      ipAddress: context.ipAddress,
      sessionId: context.sessionId,
      authorized: true,
      success,
      recordCount: resources.length,
      sensitiveAccess: this.isSensitiveClassification(highestClassification),
      metadata: {,
        batchOperation: operation,
        resourceTypes: [...new Set(resources.map(r => r.type))],
        resourceCount: resources.length,
        ...metadata
      }
    });
  }
  /**
   * Create an audit trail for a workflow
   */
  async startAuditTrail()
    workflowId: string,
    context: OperationContext,
    metadata?: Record<string, any>
  ): Promise<string> {
    const correlationId = `workflow_${workflowId}_${Date.now()}`;}
    await this.logger.log({)
      userId: context.userId,
      userRole: context.userRole,
      operation: AuditOperation.API_CALL,
      resourceType: 'workflow',
      resourceId: workflowId,
      dataClassification: DataClassificationLevel.INTERNAL,
      correlationId,
      ipAddress: context.ipAddress,
      sessionId: context.sessionId,
      authorized: true,
      success: true,
      metadata: {,
        workflowStart: true,
        ...metadata
      }
    });
    return correlationId;
  }
  /**
   * Set up event listeners for automatic logging
   */
  private setupEventListeners(): void {
    // Listen to enforcement events
    if (this.enforcer) {
      this.enforcer.on('enforcement', async (event) => {
        if (this.config.logAllOperations || !event.allowed) {
          await this.logger.log({)
            userId: event.context.userId,
            userRole: event.context.userRole,
            operation: AuditOperation.AUTHORIZATION,
            resourceType: 'data_access',
            resourceId: event.context.resourceId || 'unknown',
            dataClassification: event.classification,
            ipAddress: event.context.ipAddress,
            sessionId: event.context.sessionId,
            authorized: event.allowed,
            success: event.allowed,
            denialReason: event.reason,
            riskScore: event.riskScore,
            sensitiveAccess: this.isSensitiveClassification(event.classification),
            metadata: {,
              appliedControls: event.appliedControls,
              missingControls: event.missingControls,
              recommendations: event.recommendations,
            }
          });
        }
      });
      this.enforcer.on('anomaly', async (event) => {
        await this.logSecurityEvent('ANOMALY_DETECTED', event.context, {)
          anomalyType: event.type,
          details: event.details,
        });
      });
    }
    // Listen to classification events
    if (this.classifier) {
      this.classifier.on('classification', async (event) => {
        if (this.config.logClassificationChanges) {
          await this.logger.log({)
            userId: event.userId || 'system',
            operation: AuditOperation.CHANGE_CLASSIFICATION,
            resourceType: event.resourceType || 'data',
            resourceId: event.resourceId || 'unknown',
            dataClassification: event.newLevel,
            authorized: true,
            success: true,
            sensitiveAccess: this.isSensitiveClassification(event.newLevel),
            metadata: {,
              previousLevel: event.previousLevel,
              confidence: event.confidence,
              reason: event.reason,
            }
          });
        }
      });
    }
  }
  /**
   * Check if classification level is sensitive
   */
  private isSensitiveClassification(level: DataClassificationLevel): boolean {
    return [
      DataClassificationLevel.CONFIDENTIAL,
      DataClassificationLevel.RESTRICTED,
      DataClassificationLevel.TOP_SECRET
    ].includes(level);
  }
  /**
   * Get classification priority for comparison
   */
  private getClassificationPriority(level: DataClassificationLevel): number {
    const priorities: Record<DataClassificationLevel, number> = {
      [DataClassificationLevel.PUBLIC]: 0,
      [DataClassificationLevel.INTERNAL]: 1,
      [DataClassificationLevel.CONFIDENTIAL]: 2,
      [DataClassificationLevel.RESTRICTED]: 3,
      [DataClassificationLevel.TOP_SECRET]: 4
    };
    return priorities[level] || 0;
  }
  /**
   * Generate compliance report
   */
  async generateComplianceReport()
    startDate: Date,
    endDate: Date,
    options?: {
      groupBy?: 'user' | 'classification' | 'operation';
      includeDetails?: boolean;
    }
  ): Promise<ComplianceReport> {
    const logs = await this.logger.query({)
      startDate,
      endDate
    });
    const report: ComplianceReport = {
      period: {,
        start: startDate,
        end: endDate,
      },
      totalAccess: logs.length,
      sensitiveAccess: logs.filter(log => log.sensitiveAccess).length,
      deniedAccess: logs.filter(log => !log.authorized).length,
      uniqueUsers: new Set(logs.map(log => log.userId)).size,
      classificationBreakdown: {},
      operationBreakdown: {},
      anomalies: logs.filter(log => log.anomalyDetected).length,
      riskMetrics: {,
        averageRiskScore: 0,
        highRiskOperations: 0,
      }
    };
    // Calculate breakdowns
    for (const log of logs) {
      // Classification breakdown
      report.classificationBreakdown[log.dataClassification] = 
        (report.classificationBreakdown[log.dataClassification] || 0) + 1;
      // Operation breakdown
      report.operationBreakdown[log.operation] = 
        (report.operationBreakdown[log.operation] || 0) + 1;
      // Risk metrics
      if (log.riskScore) {
        report.riskMetrics.averageRiskScore += log.riskScore;
        if (log.riskScore > 70) {
          report.riskMetrics.highRiskOperations++;
        }
      }
    }
    // Calculate average risk score
    const logsWithRisk = logs.filter(log => log.riskScore !== undefined);
    if (logsWithRisk.length > 0) {
      report.riskMetrics.averageRiskScore /= logsWithRisk.length;
    }
    // Add details if requested
    if (options?.includeDetails) {
      report.details = logs;
    }
    return report;
  }
}
/**
 * Compliance report structure
 */
export interface ComplianceReport {
  period: {,
    start: Date;
    end: Date;
  };
  totalAccess: number;
  sensitiveAccess: number;
  deniedAccess: number;
  uniqueUsers: number;
  classificationBreakdown: Record<string, number>;
  operationBreakdown: Record<string, number>;
  anomalies: number;
  riskMetrics: {,
    averageRiskScore: number;
    highRiskOperations: number;
  };
  details?: AuditLogEntry[];
}
/**
 * Factory function to create audit integration
 */
export function createAuditIntegration()
  config: AuditIntegrationConfig,
): AuditIntegration {
  return new AuditIntegration(config);
}