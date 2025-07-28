/**
 * Classification Handling Rules Service
 *
 * Implements handling rules and requirements for different data classification levels.
 * Enforces storage, transmission, processing, and monitoring requirements.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, OperationContext } from '../types/DataClassification';
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
    complianceFramework: string;
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
    remediation: string;
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
}
//# sourceMappingURL=ClassificationHandlingRulesService.d.ts.map