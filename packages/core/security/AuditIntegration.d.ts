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
import { DataClassificationLevel, type OperationContext } from '../types/DataClassification';
/**
 * Configuration for audit integration
 */

}
export interface AuditIntegrationConfig {
    auditLogger: AuditLogger;
    classificationEnforcer?: ClassificationEnforcer;
    dataClassifier?: DataClassifier;
    logAllOperations?: boolean;
    logDeniedAccess?: boolean;
    logClassificationChanges?: boolean;
    enrichWithClassification?: boolean;
/**
 * Audit integration service
 */
export declare class AuditIntegration {
    private logger;
    private enforcer?;
    private classifier?;
    private config;
    constructor(config: AuditIntegrationConfig);
    /**
     * Log a data access operation with automatic classification enrichment
     */
    logDataAccess();
      context: OperationContext,
      resourceType: string,
      resourceId: string,
      data?: any,
      metadata?: Record<string,
      any>
    ): Promise<void>;
    /**
     * Log an administrative operation
     */
    logAdminOperation(operation: 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'CHANGE_CLASSIFICATION', context: OperationContext, target: {)
        userId?: string;
        resourceType: string;
        resourceId: string;
        classification?: DataClassificationLevel;
}
    }, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log a security event
     */
    logSecurityEvent(eventType: string, context: OperationContext, details: Record<string, any>): Promise<void>;
    /**
     * Log a batch operation
     */
    logBatchOperation(context: OperationContext, operation: AuditOperation, resources: Array<{)
        type: string;
        id: string;
        classification?: DataClassificationLevel;
    }>, success: boolean, metadata?: Record<string, any>): Promise<void>;
    /**
     * Create an audit trail for a workflow
     */
    startAuditTrail(workflowId: string, context: OperationContext, metadata?: Record<string, any>): Promise<string>;
    /**
     * Set up event listeners for automatic logging
     */
    private setupEventListeners;
    /**
     * Check if classification level is sensitive
     */
    private isSensitiveClassification;
    /**
     * Get classification priority for comparison
     */
    private getClassificationPriority;
    /**
     * Generate compliance report
     */
    generateComplianceReport(startDate: Date, endDate: Date, options?: {)
        groupBy?: 'user' | 'classification' | 'operation';
        includeDetails?: boolean;
    }): Promise<ComplianceReport>;
/**
 * Compliance report structure
 */

}
export interface ComplianceReport {
    period: {
        start: Date;
        end: Date;
}
    };
    totalAccess: number;
    sensitiveAccess: number;
    deniedAccess: number;
    uniqueUsers: number;
    classificationBreakdown: Record<string, number>;
    operationBreakdown: Record<string, number>;
    anomalies: number;
    riskMetrics: {
        averageRiskScore: number;
        highRiskOperations: number;
    };
    details?: AuditLogEntry[];
/**
 * Factory function to create audit integration
 */
export declare function createAuditIntegration(config: AuditIntegrationConfig): AuditIntegration;
//# sourceMappingURL=AuditIntegration.d.ts.map