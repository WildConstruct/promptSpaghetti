/**
 * Classification Handling Rules Service
 *
 * Implements handling rules and requirements for different data classification levels.
 * Enforces storage, transmission, processing, and monitoring requirements.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { 
  DataClassificationLevel,
  HandlingRequirements,
  OperationContext,
  ValidationResult
} from '../types/DataClassification';
export interface HandlingRule {
    id: string;
    name: string;
    description: string;
    classification: DataClassificationLevel;
    ruleType: 'STORAGE' | 'TRANSMISSION' | 'PROCESSING' | 'ACCESS' | 'MONITORING' | 'RETENTION';
    requirements: Record<string, any>;
    mandatory: boolean;
    priority: number;
    effectiveDate: Date;
    expirationDate?: Date;
    complianceFramework: string[];
}
export interface HandlingRuleViolation {
    id: string;
    ruleId: string;
    ruleName: string;
    classification: DataClassificationLevel;
    violationType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    detectedAt: Date;
    context: OperationContext;
    evidence: Record<string, any>;
    remediation: string[];
    status: 'OPEN' | 'INVESTIGATING' | 'REMEDIATED' | 'ACCEPTED_RISK';
}
export interface ComplianceCheck {
    ruleId: string;
    dataElement: string;
    classification: DataClassificationLevel;
    checkType: string;
    passed: boolean;
    details: Record<string, any>;
    timestamp: Date;
}
export declare class ClassificationHandlingRulesService {
    private handlingRequirements;
    private handlingRules;
    private violations;
    private complianceChecks;
    constructor();
    /**
     * Initialize default handling requirements for each classification level
     */
    private initializeDefaultHandlingRequirements;
    /**
     * Initialize default handling rules
     */
    private initializeDefaultHandlingRules;
    /**
     * Get handling requirements for a classification level
     */
    getHandlingRequirements(classification: DataClassificationLevel): HandlingRequirements | undefined;
    /**
     * Validate data handling against requirements
     */
    validateDataHandling()
      dataId: string,
      classification: DataClassificationLevel,
      operation: string,
      context: OperationContext,
    ): Promise<ValidationResult>;
    /**
     * Validate storage requirements
     */
    private validateStorageRequirements;
    /**
     * Validate transmission requirements
     */
    private validateTransmissionRequirements;
    /**
     * Validate processing requirements
     */
    private validateProcessingRequirements;
    /**
     * Validate monitoring requirements
     */
    private validateMonitoringRequirements;
    /**
     * Record handling rule violations
     */
    private recordViolations;
    /**
     * Get severity level based on classification
     */
    private getSeverityForClassification;
    /**
     * Get remediation steps for error
     */
    private getRemediationSteps;
    private checkEncryptionCompliance;
    private checkLocationCompliance;
    private checkBackupEncryptionCompliance;
    private checkTLSCompliance;
    private checkCertificatePinningCompliance;
    private checkEndToEndEncryptionCompliance;
    private checkNetworkRestrictionCompliance;
    private checkIsolationCompliance;
    private checkThirdPartyProcessingCompliance;
    private checkCachingCompliance;
    private checkRealtimeMonitoringCompliance;
    private checkAnomalyDetectionCompliance;
    /**
     * Get all handling rules for a classification level
     */
    getHandlingRules(classification?: DataClassificationLevel): HandlingRule[];
    /**
     * Get all violations
     */
    getViolations(classification?: DataClassificationLevel): HandlingRuleViolation[];
    /**
     * Get compliance checks
     */
    getComplianceChecks(classification?: DataClassificationLevel): ComplianceCheck[];
    /**
     * Add custom handling rule
     */
    addHandlingRule(rule: HandlingRule): void;
    /**
     * Update handling requirements for a classification level
     */
    updateHandlingRequirements(classification: DataClassificationLevel, requirements: HandlingRequirements): void;
    /**
     * Get compliance score for a classification level
     */
    getComplianceScore(classification: DataClassificationLevel): number;
}
export default ClassificationHandlingRulesService;
//# sourceMappingURL=ClassificationHandlingRulesService.d.ts.map