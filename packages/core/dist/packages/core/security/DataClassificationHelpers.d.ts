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
import { DataSensitivityLevel, type DataHandlingRequirements } from './DataSensitivityLevels';
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
export interface EnhancedDataElement extends DataElement {
    sensitivityLevel?: DataSensitivityLevel;
    handlingRequirements?: DataHandlingRequirements;
    securityMarkings?: {
        label: string;
        color: string;
        displayFormat: string;
    };
}
/**
 * Security policy enforcement result
 */
export interface SecurityPolicyEnforcementResult {
    compliant: boolean;
    violations: string;
    recommendations: string;
    requiredActions: {
        encryption: boolean;
        accessControl: string;
        monitoring: string;
        retention: string;
    };
    riskScore: number;
}
export interface DataFlowSecurityAssessment {
    sourceLevel: DataSensitivityLevel;
    targetLevel: DataSensitivityLevel;
    transferAllowed: boolean;
    requiredControls: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    complianceImpact: string;
}
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
    static enhanceDataElement(element: DataElement): any;
    sensitivityLevel?: DataSensitivityLevel;
    EnhancedDataElement: any;
}
//# sourceMappingURL=DataClassificationHelpers.d.ts.map