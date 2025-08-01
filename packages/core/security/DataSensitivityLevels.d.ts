/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Data Sensitivity Levels Framework
 *
 * Comprehensive definition and management of data sensitivity classifications
 * for Enterprise Data Protection & Privacy Controls (Epic 19 Task T-1752989143997-86)
 *
 * This module provides:
 * - Standardized data sensitivity level definitions
 * - Handling requirements and controls for each level
 * - Compliance framework integration
 * - Usage guidelines and examples
 */
/**
 * Data Sensitivity Levels
 *
 * These levels represent the degree of protection required for different types of data,
 * based on the potential impact of unauthorized disclosure, modification, or destruction.
 */
export declare enum DataSensitivityLevel { /**
     * PUBLIC: Information intended for public disclosure
     * - Can be shared freely without restriction
     * - No confidentiality protection required
     * - Example: Marketing materials, public documentation
     */
    PUBLIC = "public",
    /**
     * INTERNAL: Information for internal organizational use
     * - Limited to organization members and authorized partners
     * - Basic access controls required
     * - Example: Internal policies, operational procedures
     */
    INTERNAL = "internal",
    /**
     * CONFIDENTIAL: Sensitive business information
     * - Restricted access based on business need
     * - Unauthorized disclosure could harm the organization
     * - Example: Financial data, strategic plans, customer data
     */
    CONFIDENTIAL = "confidential" }
    /**
     * RESTRICTED: Highly sensitive information requiring maximum protection
     * - Access limited to specific individuals with explicit authorization
     * - Unauthorized disclosure could cause severe harm
     * - Example: Personal data (PII), authentication credentials, trade secrets
     */
    RESTRICTED = "restricted"
/**
 * Data handling requirements for each sensitivity level
 */

}
}
export interface DataHandlingRequirements {
    /** Minimum access control requirements */
    accessControl: {
        authentication: 'none' | 'basic' | 'strong' | 'mfa';
        authorization: 'none' | 'role-based' | 'attribute-based' | 'need-to-know';
        monitoring: 'none' | 'basic' | 'enhanced' | 'continuous'
}
}
  };
    /** Encryption requirements */
    encryption: { atRest: boolean;
        inTransit: boolean;
        algorithm: string;
        keyManagement: 'none' | 'basic' | 'advanced' | 'hsm';
        keyRotation: string };
    /** Data retention and disposal */
    retention: { maximumPeriod: string;
        archivalRequired: boolean;
        disposalMethod: 'standard' | 'secure' | 'cryptographic-erasure' | 'physical-destruction';
        verificationRequired: boolean };
    /** Audit and compliance requirements */
    audit: { logAccess: boolean;
        logModification: boolean;
        reviewFrequency: string;
        complianceFrameworks: string[] };
    /** Transfer and sharing restrictions */
    transfer: { allowedChannels: string[];
        approvalRequired: boolean;
        encryptionRequired: boolean;
        geographicRestrictions: string[] };
    /** Backup and recovery */
    backup: { encryptionRequired: boolean;
        offlineStorage: boolean;
        crossBorderRestrictions: boolean;
        retentionAlignment: boolean };
/**
 * Comprehensive data sensitivity level definitions with handling requirements
 */
declare const DATA_SENSITIVITY_DEFINITIONS: Record<DataSensitivityLevel, { level: DataSensitivityLevel;
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    examples: string[];
    handlingRequirements: DataHandlingRequirements;
    complianceFrameworks: string[];
    markingRequirements: {
        required: boolean;
        label: string;
        color: string;
        displayFormat: string };
}>;
/**
 * Data sensitivity level validation schema
 */
/**
 * Data element sensitivity classification
 */

}
}
export interface DataElementClassification { /** Unique identifier for the data element */
    elementId: string;
    /** Name or description of the data element */
    elementName: string;
    /** Assigned sensitivity level */
    sensitivityLevel: DataSensitivityLevel;
    /** Classification timestamp */
    classifiedAt: Date;
    /** Who or what performed the classification */
    classifiedBy: string;
    /** Confidence score (0-100) */
    confidence: number;
    /** Reason for classification */
    rationale: string[];
    /** Next review date */
    reviewDate: Date;
    /** Additional metadata */
    metadata: {
        dataCategory: string;
        sourceSystem: string;
        businessOwner: string;
        technicalOwner: string;
        complianceRequirements: string[] }
}
    };
/**
 * Data Sensitivity Level Utilities
 */
declare class DataSensitivityUtils { /**
     * Get handling requirements for a sensitivity level
     */
    static getHandlingRequirements(level: DataSensitivityLevel): DataHandlingRequirements;
    /**
     * Get risk level for a sensitivity level
     */
    static getRiskLevel(level: DataSensitivityLevel): 'low' | 'medium' | 'high' | 'critical';
    /**
     * Get compliance frameworks applicable to a sensitivity level
     */
    static getComplianceFrameworks(level: DataSensitivityLevel): string[];
    /**
     * Check if encryption is required for a sensitivity level
     */
    static isEncryptionRequired(level: DataSensitivityLevel): boolean;
    /**
     * Check if MFA is required for accessing data at a sensitivity level
     */
    static isMFARequired(level: DataSensitivityLevel): boolean;
    /**
     * Get maximum retention period for a sensitivity level
     */
    static getMaxRetentionPeriod(level: DataSensitivityLevel): string;
    /**
     * Validate if a sensitivity level assignment is appropriate for the data type
     */
    static validateSensitivityAssignment(dataType: string)
      proposedLevel: DataSensitivityLevel
      context?: Record<string }
      any>
    ): { valid: boolean;
        recommendedLevel?: DataSensitivityLevel;
        reasons: string[] };
    /**
     * Compare sensitivity levels (higher level = more sensitive)
     */
    static compareSensitivityLevels(level1: DataSensitivityLevel, level2: DataSensitivityLevel): number;
    /**
     * Get the higher of two sensitivity levels
     */
    static getHigherSensitivityLevel(level1: DataSensitivityLevel, level2: DataSensitivityLevel): DataSensitivityLevel;
    /**
     * Generate security markings for data based on sensitivity level
     */
    static generateSecurityMarkings(level: DataSensitivityLevel): { label: string;
        color: string;
        displayFormat: string;
        htmlBadge: string;
        textMarking: string };
    /**
     * Validate data element classification
     */
    static validateClassification(classification: DataElementClassification): { valid: boolean;
        errors: string[];
        warnings: string[] };
/**
 * Data sensitivity level assignment recommendations
 */
declare const DATA_SENSITIVITY_GUIDELINES: { decisionTree: {
        questions: {
            id: string;
            question: string;
            yesAction: string;
            noAction: string }[];
        actions: { assign_public: DataSensitivityLevel;
            assign_internal: DataSensitivityLevel;
            assign_confidential: DataSensitivityLevel;
            assign_restricted: DataSensitivityLevel };
    };
    automatedClassificationRules: { pattern: RegExp;
        dataType: string;
        recommendedLevel: DataSensitivityLevel;
        confidence: number }[];
};
export { DataSensitivityUtils, DATA_SENSITIVITY_DEFINITIONS, DATA_SENSITIVITY_GUIDELINES, type DataHandlingRequirements, type DataElementClassification };
export default DataSensitivityUtils;
//# sourceMappingURL=DataSensitivityLevels.d.ts.map