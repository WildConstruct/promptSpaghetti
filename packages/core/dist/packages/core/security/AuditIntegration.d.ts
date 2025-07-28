/**
 * AuditIntegration - Integrates audit logging with classification enforcement
 *
 * Automatically logs all classification enforcement decisions and data access
 * operations, providing a complete audit trail for security and compliance.
 *
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */
import { AuditLogger } from './AuditLogger';
import { ClassificationEnforcer } from './ClassificationEnforcer';
import { DataClassifier } from './DataClassifier';
/**
 * Configuration for audit integration
 */
export interface AuditIntegrationConfig {
    auditLogger: AuditLogger;
    classificationEnforcer?: ClassificationEnforcer;
    dataClassifier?: DataClassifier;
    logAllOperations?: boolean;
    logDeniedAccess?: boolean;
    logClassificationChanges?: boolean;
    enrichWithClassification?: boolean;
}
export declare class AuditIntegration {
    private logger;
    private enforcer?;
    private classifier?;
    private config;
    constructor(config: AuditIntegrationConfig);
    /**
     * Check if classification level is sensitive
     */
    private isSensitiveClassification;
    /**
    * Get classification priority for comparison
    */
    private getClassificationPriority;
}
//# sourceMappingURL=AuditIntegration.d.ts.map