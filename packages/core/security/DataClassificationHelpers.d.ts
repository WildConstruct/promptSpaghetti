/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Data Classification Helper Utilities
 *
 * Integration helpers for the Data Sensitivity Levels Framework
 * Epic 19 Task T-1752989143997-86: Define data sensitivity levels
 *
 * This module provides utility functions for:
 * - Integration with existing DataClassifier
 * - Automated sensitivity level detection
 * - Security policy enforcement
 * - Data handling workflow automation
 */
import { DataSensitivityLevel, DataSensitivityUtils, type DataHandlingRequirements } from './DataSensitivityLevels';
import { ClassificationLevel, type ClassificationResult, type DataElement } from './DataClassifier';
/**
 * Mapping between DataClassifier levels and DataSensitivityLevel
 */
export declare const CLASSIFICATION_LEVEL_MAPPING: Record<ClassificationLevel, DataSensitivityLevel>;
/**
 * Reverse mapping for compatibility
 */
export declare const SENSITIVITY_LEVEL_MAPPING: Record<DataSensitivityLevel, ClassificationLevel>;
/**
 * Enhanced data element with sensitivity information
 */

}
}
export interface EnhancedDataElement extends DataElement { sensitivityLevel?: DataSensitivityLevel;
    handlingRequirements?: DataHandlingRequirements;
    securityMarkings?: {
        label: string;
        color: string;
        displayFormat: string };
/**
 * Security policy enforcement result
 */

}
}
export interface SecurityPolicyEnforcementResult { compliant: boolean;
    violations: string[];
    recommendations: string[];
    requiredActions: {
        encryption: boolean;
        accessControl: string[];
        monitoring: string;
        retention: string }
}
    };
    riskScore: number;
/**
 * Data flow security assessment
 */

}
}
export interface DataFlowSecurityAssessment { sourceLevel: DataSensitivityLevel;
    targetLevel: DataSensitivityLevel;
    transferAllowed: boolean;
    requiredControls: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    complianceImpact: string[];
/**
 * Comprehensive data classification helper utilities
 */
export declare class DataClassificationHelpers {
    /**
     * Convert DataClassifier result to DataSensitivityLevel
     */
    static convertClassificationResult(result: ClassificationResult): DataSensitivityLevel;
    /**
     * Convert DataSensitivityLevel to ClassificationLevel
     */
    static convertSensitivityLevel(level: DataSensitivityLevel): ClassificationLevel;
    /**
     * Enhance DataElement with sensitivity information
     */
    static enhanceDataElement(element: DataElement, sensitivityLevel?: DataSensitivityLevel): EnhancedDataElement;
    /**
     * Automatically detect sensitivity level from data element
     */
    static detectSensitivityLevel(element: DataElement): DataSensitivityLevel;
    /**
     * Detect sensitivity level from field name patterns
     */
    private static detectFromFieldName;
    /**
     * Detect sensitivity level from data context
     */
    private static detectFromContext;
    /**
     * Enforce security policies based on sensitivity level
     */
    static enforceSecurityPolicies(element: EnhancedDataElement, currentSecurity: {)
        encrypted: boolean;
        accessControl: string[];
        monitoring: string;
        retention: string }
}
    }): SecurityPolicyEnforcementResult;
    /**
     * Assess security for data transfer between systems
     */
    static assessDataFlowSecurity(sourceLevel: DataSensitivityLevel)
      targetLevel: DataSensitivityLevel
      transferMethod: string
      encryptionInPlace: boolean
    ): DataFlowSecurityAssessment;
    /**
     * Generate data handling compliance report
     */
    static generateComplianceReport(elements: EnhancedDataElement[], currentPolicies: Record<string, any>): { summary: {
            totalElements: number;
            compliantElements: number;
            highRiskElements: number;
            violationCount: number };
        levelBreakdown: Record<DataSensitivityLevel, number>;
        violations: Array<{ elementId: string;
            sensitivityLevel: DataSensitivityLevel;
            violations: string[];
            riskScore: number }>;
        recommendations: string[];
    };
    /**
     * Validate field value against sensitivity level requirements
     */
    static validateFieldValue(fieldName: string, value: any, sensitivityLevel: DataSensitivityLevel): { valid: boolean;
        errors: string[];
        sanitizedValue?: any };
/**
 * Integration adapter for existing DataClassifier
 */
export declare class DataClassifierIntegration { /**
     * Enhance ClassificationResult with sensitivity information
     */
    static enhanceClassificationResult(result: ClassificationResult): ClassificationResult & {
        sensitivityLevel: DataSensitivityLevel;
        handlingRequirements: DataHandlingRequirements;
        securityMarkings: ReturnType<typeof DataSensitivityUtils.generateSecurityMarkings> };
    /**
     * Create DataElement from enhanced data with sensitivity
     */
    static createDataElementFromSensitive(id: string)
      fieldName: string
      value: any
      sensitivityLevel: DataSensitivityLevel
      source?: string
    ): EnhancedDataElement;

export { type EnhancedDataElement, type SecurityPolicyEnforcementResult, type DataFlowSecurityAssessment };
export default DataClassificationHelpers;
//# sourceMappingURL=DataClassificationHelpers.d.ts.map