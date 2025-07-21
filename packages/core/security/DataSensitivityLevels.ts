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

import { z } from 'zod';
import { SecurityValidation } from '../validation/security';

/**
 * Data Sensitivity Levels
 * 
 * These levels represent the degree of protection required for different types of data,
 * based on the potential impact of unauthorized disclosure, modification, or destruction.
 */
export enum DataSensitivityLevel {
  /**
   * PUBLIC: Information intended for public disclosure
   * - Can be shared freely without restriction
   * - No confidentiality protection required
   * - Example: Marketing materials, public documentation
   */
  PUBLIC = 'public',

  /**
   * INTERNAL: Information for internal organizational use
   * - Limited to organization members and authorized partners
   * - Basic access controls required
   * - Example: Internal policies, operational procedures
   */
  INTERNAL = 'internal',

  /**
   * CONFIDENTIAL: Sensitive business information
   * - Restricted access based on business need
   * - Unauthorized disclosure could harm the organization
   * - Example: Financial data, strategic plans, customer data
   */
  CONFIDENTIAL = 'confidential',

  /**
   * RESTRICTED: Highly sensitive information requiring maximum protection
   * - Access limited to specific individuals with explicit authorization
   * - Unauthorized disclosure could cause severe harm
   * - Example: Personal data (PII), authentication credentials, trade secrets
   */
  RESTRICTED = 'restricted'
}

/**
 * Data handling requirements for each sensitivity level
 */
export interface DataHandlingRequirements {
  /** Minimum access control requirements */
  accessControl: {
    authentication: 'none' | 'basic' | 'strong' | 'mfa';
    authorization: 'none' | 'role-based' | 'attribute-based' | 'need-to-know';
    monitoring: 'none' | 'basic' | 'enhanced' | 'continuous';
  };

  /** Encryption requirements */
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    algorithm: string;
    keyManagement: 'none' | 'basic' | 'advanced' | 'hsm';
    keyRotation: string;
  };

  /** Data retention and disposal */
  retention: {
    maximumPeriod: string;
    archivalRequired: boolean;
    disposalMethod: 'standard' | 'secure' | 'cryptographic-erasure' | 'physical-destruction';
    verificationRequired: boolean;
  };

  /** Audit and compliance requirements */
  audit: {
    logAccess: boolean;
    logModification: boolean;
    reviewFrequency: string;
    complianceFrameworks: string[];
  };

  /** Transfer and sharing restrictions */
  transfer: {
    allowedChannels: string[];
    approvalRequired: boolean;
    encryptionRequired: boolean;
    geographicRestrictions: string[];
  };

  /** Backup and recovery */
  backup: {
    encryptionRequired: boolean;
    offlineStorage: boolean;
    crossBorderRestrictions: boolean;
    retentionAlignment: boolean;
  };
}

/**
 * Comprehensive data sensitivity level definitions with handling requirements
 */
const DATA_SENSITIVITY_DEFINITIONS: Record<DataSensitivityLevel, {
  level: DataSensitivityLevel;
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
    displayFormat: string;
  };
}> = {
  [DataSensitivityLevel.PUBLIC]: {
    level: DataSensitivityLevel.PUBLIC,
    name: 'Public',
    description: 'Information that is intended for public disclosure and can be shared freely without restriction.',
    riskLevel: 'low',
    examples: [
      'Marketing materials and brochures',
      'Public website content',
      'Press releases and public announcements',
      'Open source code and documentation',
      'Public research papers and reports'
    ],
    handlingRequirements: {
      accessControl: {
        authentication: 'none',
        authorization: 'none',
        monitoring: 'basic'
      },
      encryption: {
        atRest: false,
        inTransit: false,
        algorithm: 'none',
        keyManagement: 'none',
        keyRotation: 'N/A'
      },
      retention: {
        maximumPeriod: 'indefinite',
        archivalRequired: false,
        disposalMethod: 'standard',
        verificationRequired: false
      },
      audit: {
        logAccess: false,
        logModification: true,
        reviewFrequency: 'annual',
        complianceFrameworks: []
      },
      transfer: {
        allowedChannels: ['any'],
        approvalRequired: false,
        encryptionRequired: false,
        geographicRestrictions: []
      },
      backup: {
        encryptionRequired: false,
        offlineStorage: false,
        crossBorderRestrictions: false,
        retentionAlignment: false
      }
    },
    complianceFrameworks: [],
    markingRequirements: {
      required: false,
      label: 'PUBLIC',
      color: '#28a745',
      displayFormat: 'badge'
    }
  },

  [DataSensitivityLevel.INTERNAL]: {
    level: DataSensitivityLevel.INTERNAL,
    name: 'Internal',
    description: 'Information intended for use within the organization and by authorized partners.',
    riskLevel: 'medium',
    examples: [
      'Internal policies and procedures',
      'Organizational charts and contact lists',
      'Internal training materials',
      'Non-sensitive operational data',
      'Vendor contracts (non-confidential terms)'
    ],
    handlingRequirements: {
      accessControl: {
        authentication: 'basic',
        authorization: 'role-based',
        monitoring: 'basic'
      },
      encryption: {
        atRest: false,
        inTransit: true,
        algorithm: 'TLS 1.3',
        keyManagement: 'basic',
        keyRotation: 'annual'
      },
      retention: {
        maximumPeriod: '7 years',
        archivalRequired: false,
        disposalMethod: 'secure',
        verificationRequired: false
      },
      audit: {
        logAccess: true,
        logModification: true,
        reviewFrequency: 'semi-annual',
        complianceFrameworks: []
      },
      transfer: {
        allowedChannels: ['secure-email', 'secure-file-share', 'vpn'],
        approvalRequired: false,
        encryptionRequired: true,
        geographicRestrictions: []
      },
      backup: {
        encryptionRequired: false,
        offlineStorage: false,
        crossBorderRestrictions: false,
        retentionAlignment: true
      }
    },
    complianceFrameworks: ['ISO27001', 'SOC2'],
    markingRequirements: {
      required: true,
      label: 'INTERNAL',
      color: '#17a2b8',
      displayFormat: 'header'
    }
  },

  [DataSensitivityLevel.CONFIDENTIAL]: {
    level: DataSensitivityLevel.CONFIDENTIAL,
    name: 'Confidential',
    description: 'Sensitive business information requiring protection from unauthorized disclosure.',
    riskLevel: 'high',
    examples: [
      'Financial reports and business plans',
      'Customer data and contact information',
      'Proprietary algorithms and source code',
      'Contract terms and pricing information',
      'Employee performance reviews',
      'Strategic business plans'
    ],
    handlingRequirements: {
      accessControl: {
        authentication: 'strong',
        authorization: 'attribute-based',
        monitoring: 'enhanced'
      },
      encryption: {
        atRest: true,
        inTransit: true,
        algorithm: 'AES-256-GCM',
        keyManagement: 'advanced',
        keyRotation: 'quarterly'
      },
      retention: {
        maximumPeriod: '5 years',
        archivalRequired: true,
        disposalMethod: 'secure',
        verificationRequired: true
      },
      audit: {
        logAccess: true,
        logModification: true,
        reviewFrequency: 'quarterly',
        complianceFrameworks: ['SOC2', 'ISO27001']
      },
      transfer: {
        allowedChannels: ['encrypted-email', 'secure-portal', 'encrypted-storage'],
        approvalRequired: true,
        encryptionRequired: true,
        geographicRestrictions: ['data-residency-compliance']
      },
      backup: {
        encryptionRequired: true,
        offlineStorage: true,
        crossBorderRestrictions: true,
        retentionAlignment: true
      }
    },
    complianceFrameworks: ['GDPR', 'SOX', 'ISO27001', 'SOC2'],
    markingRequirements: {
      required: true,
      label: 'CONFIDENTIAL',
      color: '#fd7e14',
      displayFormat: 'watermark'
    }
  },

  [DataSensitivityLevel.RESTRICTED]: {
    level: DataSensitivityLevel.RESTRICTED,
    name: 'Restricted',
    description: 'Highly sensitive information requiring maximum protection and access controls.',
    riskLevel: 'critical',
    examples: [
      'Personally Identifiable Information (PII)',
      'Authentication credentials and passwords',
      'Cryptographic keys and certificates',
      'Medical records and health information',
      'Payment card data and financial account numbers',
      'Social Security Numbers and government IDs',
      'Biometric data and personal identifiers'
    ],
    handlingRequirements: {
      accessControl: {
        authentication: 'mfa',
        authorization: 'need-to-know',
        monitoring: 'continuous'
      },
      encryption: {
        atRest: true,
        inTransit: true,
        algorithm: 'AES-256-GCM',
        keyManagement: 'hsm',
        keyRotation: 'monthly'
      },
      retention: {
        maximumPeriod: 'minimal-necessary',
        archivalRequired: false,
        disposalMethod: 'cryptographic-erasure',
        verificationRequired: true
      },
      audit: {
        logAccess: true,
        logModification: true,
        reviewFrequency: 'monthly',
        complianceFrameworks: ['GDPR', 'HIPAA', 'PCI-DSS', 'NIST']
      },
      transfer: {
        allowedChannels: ['zero-trust-network', 'encrypted-api'],
        approvalRequired: true,
        encryptionRequired: true,
        geographicRestrictions: ['strict-data-residency', 'no-third-countries']
      },
      backup: {
        encryptionRequired: true,
        offlineStorage: true,
        crossBorderRestrictions: true,
        retentionAlignment: true
      }
    },
    complianceFrameworks: ['GDPR', 'HIPAA', 'PCI-DSS', 'NIST-800-53', 'SOX'],
    markingRequirements: {
      required: true,
      label: 'RESTRICTED',
      color: '#dc3545',
      displayFormat: 'banner'
    }
  }
};

/**
 * Data sensitivity level validation schema
 */
export 
/**
 * Data element sensitivity classification
 */
export interface DataElementClassification {
  /** Unique identifier for the data element */
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
    complianceRequirements: string[];
  };
}

/**
 * Data Sensitivity Level Utilities
 */
class DataSensitivityUtils {
  /**
   * Get handling requirements for a sensitivity level
   */
  static getHandlingRequirements(level: DataSensitivityLevel): DataHandlingRequirements {
    return DATA_SENSITIVITY_DEFINITIONS[level].handlingRequirements;
  }

  /**
   * Get risk level for a sensitivity level
   */
  static getRiskLevel(level: DataSensitivityLevel): 'low' | 'medium' | 'high' | 'critical' {
    return DATA_SENSITIVITY_DEFINITIONS[level].riskLevel;
  }

  /**
   * Get compliance frameworks applicable to a sensitivity level
   */
  static getComplianceFrameworks(level: DataSensitivityLevel): string[] {
    return DATA_SENSITIVITY_DEFINITIONS[level].complianceFrameworks;
  }

  /**
   * Check if encryption is required for a sensitivity level
   */
  static isEncryptionRequired(level: DataSensitivityLevel): boolean {
    const requirements = this.getHandlingRequirements(level);
    return requirements.encryption.atRest || requirements.encryption.inTransit;
  }

  /**
   * Check if MFA is required for accessing data at a sensitivity level
   */
  static isMFARequired(level: DataSensitivityLevel): boolean {
    const requirements = this.getHandlingRequirements(level);
    return requirements.accessControl.authentication === 'mfa';
  }

  /**
   * Get maximum retention period for a sensitivity level
   */
  static getMaxRetentionPeriod(level: DataSensitivityLevel): string {
    return this.getHandlingRequirements(level).retention.maximumPeriod;
  }

  /**
   * Validate if a sensitivity level assignment is appropriate for the data type
   */
  static validateSensitivityAssignment(
    dataType: string,
    proposedLevel: DataSensitivityLevel,
    context?: Record<string, any>
  ): {
    valid: boolean;
    recommendedLevel?: DataSensitivityLevel;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let recommendedLevel: DataSensitivityLevel | undefined;

    // Define data type mappings
    const dataTypeMappings: Record<string, DataSensitivityLevel[]> = {
      'email': [DataSensitivityLevel.RESTRICTED],
      'phone': [DataSensitivityLevel.RESTRICTED],
      'ssn': [DataSensitivityLevel.RESTRICTED],
      'credit_card': [DataSensitivityLevel.RESTRICTED],
      'password': [DataSensitivityLevel.RESTRICTED],
      'api_key': [DataSensitivityLevel.CONFIDENTIAL, DataSensitivityLevel.RESTRICTED],
      'financial': [DataSensitivityLevel.CONFIDENTIAL, DataSensitivityLevel.RESTRICTED],
      'personal': [DataSensitivityLevel.CONFIDENTIAL, DataSensitivityLevel.RESTRICTED],
      'public': [DataSensitivityLevel.PUBLIC],
      'marketing': [DataSensitivityLevel.PUBLIC, DataSensitivityLevel.INTERNAL]
    };

    const allowedLevels = dataTypeMappings[dataType.toLowerCase()];
    
    if (allowedLevels && !allowedLevels.includes(proposedLevel)) {
      reasons.push(`Data type '${dataType}' typically requires ${allowedLevels.join(' or ')} sensitivity level`);
      recommendedLevel = allowedLevels[0];
      return { valid: false, recommendedLevel, reasons };
    }

    // Additional context-based validation
    if (context?.containsPII && proposedLevel !== DataSensitivityLevel.RESTRICTED) {
      reasons.push('Data containing PII should be classified as RESTRICTED');
      recommendedLevel = DataSensitivityLevel.RESTRICTED;
      return { valid: false, recommendedLevel, reasons };
    }

    if (context?.publiclyAvailable && proposedLevel !== DataSensitivityLevel.PUBLIC) {
      reasons.push('Publicly available data should be classified as PUBLIC');
      recommendedLevel = DataSensitivityLevel.PUBLIC;
      return { valid: false, recommendedLevel, reasons };
    }

    reasons.push('Sensitivity level assignment is appropriate');
    return { valid: true, reasons };
  }

  /**
   * Compare sensitivity levels (higher level = more sensitive)
   */
  static compareSensitivityLevels(level1: DataSensitivityLevel, level2: DataSensitivityLevel): number {
    const levelOrder = [
      DataSensitivityLevel.PUBLIC,
      DataSensitivityLevel.INTERNAL,
      DataSensitivityLevel.CONFIDENTIAL,
      DataSensitivityLevel.RESTRICTED
    ];

    const index1 = levelOrder.indexOf(level1);
    const index2 = levelOrder.indexOf(level2);
    
    return index1 - index2;
  }

  /**
   * Get the higher of two sensitivity levels
   */
  static getHigherSensitivityLevel(
    level1: DataSensitivityLevel,
    level2: DataSensitivityLevel
  ): DataSensitivityLevel {
    return this.compareSensitivityLevels(level1, level2) > 0 ? level1 : level2;
  }

  /**
   * Generate security markings for data based on sensitivity level
   */
  static generateSecurityMarkings(level: DataSensitivityLevel): {
    label: string;
    color: string;
    displayFormat: string;
    htmlBadge: string;
    textMarking: string;
  } {
    const definition = DATA_SENSITIVITY_DEFINITIONS[level];
    const marking = definition.markingRequirements;
    
    return {
      label: marking.label,
      color: marking.color,
      displayFormat: marking.displayFormat,
      htmlBadge: `<span class="sensitivity-badge" style="background-color: ${marking.color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${marking.label}</span>`,
      textMarking: `[${marking.label}]`
    };
  }

  /**
   * Validate data element classification
   */
  static validateClassification(classification: DataElementClassification): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!classification.elementId) {
      errors.push('Element ID is required');
    }

    if (!classification.elementName) {
      errors.push('Element name is required');
    }

    if (!Object.values(DataSensitivityLevel).includes(classification.sensitivityLevel)) {
      errors.push('Invalid sensitivity level');
    }

    // Validate confidence score
    if (classification.confidence < 0 || classification.confidence > 100) {
      errors.push('Confidence score must be between 0 and 100');
    }

    if (classification.confidence < 70) {
      warnings.push('Low confidence score - classification may need review');
    }

    // Validate review date
    if (classification.reviewDate <= new Date()) {
      warnings.push('Review date is in the past - classification should be reviewed');
    }

    // Validate metadata
    if (!classification.metadata.businessOwner) {
      warnings.push('Business owner should be specified');
    }

    if (!classification.metadata.technicalOwner) {
      warnings.push('Technical owner should be specified');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Data sensitivity level assignment recommendations
 */
const DATA_SENSITIVITY_GUIDELINES = {
  decisionTree: {
    questions: [
      {
        id: 'public_availability',
        question: 'Is this information intended for public disclosure?',
        yesAction: 'assign_public',
        noAction: 'continue_assessment'
      },
      {
        id: 'personal_data',
        question: 'Does this information contain personal data or PII?',
        yesAction: 'assign_restricted',
        noAction: 'continue_assessment'
      },
      {
        id: 'authentication_data',
        question: 'Does this information contain authentication credentials or cryptographic material?',
        yesAction: 'assign_restricted',
        noAction: 'continue_assessment'
      },
      {
        id: 'business_sensitive',
        question: 'Could unauthorized disclosure harm the business or competitive position?',
        yesAction: 'assign_confidential',
        noAction: 'assign_internal'
      }
    ],
    actions: {
      assign_public: DataSensitivityLevel.PUBLIC,
      assign_internal: DataSensitivityLevel.INTERNAL,
      assign_confidential: DataSensitivityLevel.CONFIDENTIAL,
      assign_restricted: DataSensitivityLevel.RESTRICTED
    }
  },
  
  automatedClassificationRules: [
    {
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      dataType: 'email',
      recommendedLevel: DataSensitivityLevel.RESTRICTED,
      confidence: 95
    },
    {
      pattern: /\b\d{3}-\d{2}-\d{4}\b/,
      dataType: 'ssn',
      recommendedLevel: DataSensitivityLevel.RESTRICTED,
      confidence: 99
    },
    {
      pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/,
      dataType: 'credit_card',
      recommendedLevel: DataSensitivityLevel.RESTRICTED,
      confidence: 99
    }
  ]
};

// Export everything
export {
  DataSensitivityLevel,
  DataSensitivityUtils,
  DATA_SENSITIVITY_DEFINITIONS,
  DATA_SENSITIVITY_GUIDELINES,
  type DataHandlingRequirements,
  type DataElementClassification
};

export default DataSensitivityUtils;