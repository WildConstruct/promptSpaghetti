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
import { DataSensitivityLevel, DataSensitivityUtils, DATA_SENSITIVITY_GUIDELINES } from './DataSensitivityLevels';
import { ClassificationLevel } from './DataClassifier';
import { SecurityValidation } from '../validation/security';
/**
 * Mapping between DataClassifier levels and DataSensitivityLevel
 */
export const CLASSIFICATION_LEVEL_MAPPING = {
    [ClassificationLevel.PUBLIC]: DataSensitivityLevel.PUBLIC,
    [ClassificationLevel.INTERNAL]: DataSensitivityLevel.INTERNAL,
    [ClassificationLevel.CONFIDENTIAL]: DataSensitivityLevel.CONFIDENTIAL,
    [ClassificationLevel.RESTRICTED]: DataSensitivityLevel.RESTRICTED
};
/**
 * Reverse mapping for compatibility
 */
export const SENSITIVITY_LEVEL_MAPPING = {
    [DataSensitivityLevel.PUBLIC]: ClassificationLevel.PUBLIC,
    [DataSensitivityLevel.INTERNAL]: ClassificationLevel.INTERNAL,
    [DataSensitivityLevel.CONFIDENTIAL]: ClassificationLevel.CONFIDENTIAL,
    [DataSensitivityLevel.RESTRICTED]: ClassificationLevel.RESTRICTED
};
/**
 * Comprehensive data classification helper utilities
 */
export class DataClassificationHelpers {
    /**
     * Convert DataClassifier result to DataSensitivityLevel
     */
    static convertClassificationResult(result) {
        return CLASSIFICATION_LEVEL_MAPPING[result.level];
    }
    /**
     * Convert DataSensitivityLevel to ClassificationLevel
     */
    static convertSensitivityLevel(level) {
        return SENSITIVITY_LEVEL_MAPPING[level];
    }
    /**
     * Enhance DataElement with sensitivity information
     */
    static enhanceDataElement(element, sensitivityLevel) {
        const level = sensitivityLevel || this.detectSensitivityLevel(element);
        const handlingRequirements = DataSensitivityUtils.getHandlingRequirements(level);
        const securityMarkings = DataSensitivityUtils.generateSecurityMarkings(level);
        return {
            ...element,
            sensitivityLevel: level,
            handlingRequirements,
            securityMarkings
        };
    }
    /**
     * Automatically detect sensitivity level from data element
     */
    static detectSensitivityLevel(element) {
        const valueStr = String(element.value);
        const fieldName = element.fieldName.toLowerCase();
        // Apply automated classification rules
        for (const rule of DATA_SENSITIVITY_GUIDELINES.automatedClassificationRules) {
            if (rule.pattern.test(valueStr)) {
                return rule.recommendedLevel;
            }
        }
        // Apply field name-based detection
        const fieldBasedLevel = this.detectFromFieldName(fieldName);
        if (fieldBasedLevel) {
            return fieldBasedLevel;
        }
        // Check context for additional clues
        if (element.context) {
            const contextLevel = this.detectFromContext(element.context);
            if (contextLevel) {
                return contextLevel;
            }
        }
        // Default to internal if no specific classification found
        return DataSensitivityLevel.INTERNAL;
    }
    /**
     * Detect sensitivity level from field name patterns
     */
    static detectFromFieldName(fieldName) {
        const fieldPatterns = [
            // PII patterns
            { pattern: /email/i, level: DataSensitivityLevel.RESTRICTED },
            { pattern: /phone|mobile|tel/i, level: DataSensitivityLevel.RESTRICTED },
            { pattern: /ssn|social.?security/i, level: DataSensitivityLevel.RESTRICTED },
            { pattern: /credit.?card|payment/i, level: DataSensitivityLevel.RESTRICTED },
            { pattern: /password|passwd|pwd/i, level: DataSensitivityLevel.RESTRICTED },
            { pattern: /name|address|zip|postal/i, level: DataSensitivityLevel.RESTRICTED },
            // Authentication patterns
            { pattern: /token|secret|key|auth/i, level: DataSensitivityLevel.RESTRICTED },
            { pattern: /session|cookie/i, level: DataSensitivityLevel.RESTRICTED },
            // Business patterns
            { pattern: /financial|revenue|profit|salary/i, level: DataSensitivityLevel.CONFIDENTIAL },
            { pattern: /customer|client|contract/i, level: DataSensitivityLevel.CONFIDENTIAL },
            { pattern: /strategic|plan|roadmap/i, level: DataSensitivityLevel.CONFIDENTIAL },
            // Internal patterns
            { pattern: /internal|employee|staff/i, level: DataSensitivityLevel.INTERNAL },
            { pattern: /policy|procedure|process/i, level: DataSensitivityLevel.INTERNAL },
            // Public patterns
            { pattern: /public|marketing|press|blog/i, level: DataSensitivityLevel.PUBLIC },
            { pattern: /website|announcement|news/i, level: DataSensitivityLevel.PUBLIC }
        ];
        for (const { pattern, level } of fieldPatterns) {
            if (pattern.test(fieldName)) {
                return level;
            }
        }
        return null;
    }
    /**
     * Detect sensitivity level from data context
     */
    static detectFromContext(context) {
        // Check for explicit sensitivity indicators
        if (context.containsPII === true) {
            return DataSensitivityLevel.RESTRICTED;
        }
        if (context.publiclyAvailable === true) {
            return DataSensitivityLevel.PUBLIC;
        }
        if (context.customerData === true) {
            return DataSensitivityLevel.CONFIDENTIAL;
        }
        if (context.internalOnly === true) {
            return DataSensitivityLevel.INTERNAL;
        }
        // Check source system patterns
        if (context.source) {
            const source = String(context.source).toLowerCase();
            if (source.includes('hr') || source.includes('payroll')) {
                return DataSensitivityLevel.RESTRICTED;
            }
            if (source.includes('customer') || source.includes('crm')) {
                return DataSensitivityLevel.CONFIDENTIAL;
            }
            if (source.includes('public') || source.includes('website')) {
                return DataSensitivityLevel.PUBLIC;
            }
        }
        return null;
    }
    /**
     * Enforce security policies based on sensitivity level
     */
    static enforceSecurityPolicies(element, currentSecurity) {
        if (!element.sensitivityLevel || !element.handlingRequirements) {
            throw new Error('Element must have sensitivity level and handling requirements');
        }
        const violations = [];
        const recommendations = [];
        const requiredActions = {
            encryption: false,
            accessControl: [],
            monitoring: '',
            retention: ''
        };
        const requirements = element.handlingRequirements;
        // Check encryption requirements
        if (requirements.encryption.atRest && !currentSecurity.encrypted) {
            violations.push('Data requires at-rest encryption but is not encrypted');
            requiredActions.encryption = true;
            recommendations.push(`Implement ${requirements.encryption.algorithm} encryption`);
        }
        // Check access control requirements
        const requiredAuth = requirements.accessControl.authentication;
        if (requiredAuth !== 'none') {
            const hasAppropriateAuth = currentSecurity.accessControl.some(control => {
                switch (requiredAuth) {
                    case 'mfa':
                        return control.includes('mfa') || control.includes('multi-factor');
                    case 'strong':
                        return control.includes('strong') || control.includes('2fa') || control.includes('mfa');
                    case 'basic':
                        return control.includes('auth') || control.includes('login');
                    default:
                        return true;
                }
            });
            if (!hasAppropriateAuth) {
                violations.push(`Data requires ${requiredAuth} authentication but current controls are insufficient`);
                requiredActions.accessControl.push(requiredAuth);
            }
        }
        // Check monitoring requirements
        const requiredMonitoring = requirements.accessControl.monitoring;
        if (requiredMonitoring !== 'none' && currentSecurity.monitoring !== requiredMonitoring) {
            violations.push(`Data requires ${requiredMonitoring} monitoring but current level is ${currentSecurity.monitoring}`);
            requiredActions.monitoring = requiredMonitoring;
        }
        // Check retention requirements
        const maxRetention = requirements.retention.maximumPeriod;
        if (maxRetention !== 'indefinite' && currentSecurity.retention === 'indefinite') {
            violations.push(`Data has maximum retention period of ${maxRetention} but current policy is indefinite`);
            requiredActions.retention = maxRetention;
        }
        // Calculate risk score
        const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        const riskLevel = DataSensitivityUtils.getRiskLevel(element.sensitivityLevel);
        const baseRisk = riskLevels[riskLevel];
        const violationPenalty = violations.length * 0.5;
        const riskScore = Math.min(4, baseRisk + violationPenalty);
        return {
            compliant: violations.length === 0,
            violations,
            recommendations,
            requiredActions,
            riskScore
        };
    }
    /**
     * Assess security for data transfer between systems
     */
    static assessDataFlowSecurity(sourceLevel, targetLevel, transferMethod, encryptionInPlace) {
        const sourceRequirements = DataSensitivityUtils.getHandlingRequirements(sourceLevel);
        // Data can only flow to equal or higher security levels
        const levelComparison = DataSensitivityUtils.compareSensitivityLevels(sourceLevel, targetLevel);
        let transferAllowed = levelComparison <= 0; // source <= target
        const requiredControls = [];
        const complianceImpact = [];
        // Check transfer method against requirements
        const allowedChannels = sourceRequirements.transfer.allowedChannels;
        if (!allowedChannels.includes('any') && !allowedChannels.includes(transferMethod)) {
            transferAllowed = false;
            requiredControls.push(`Transfer method must be one of: ${allowedChannels.join(', ')}`);
        }
        // Check encryption requirements
        if (sourceRequirements.transfer.encryptionRequired && !encryptionInPlace) {
            transferAllowed = false;
            requiredControls.push('Transfer requires encryption');
        }
        // Check approval requirements
        if (sourceRequirements.transfer.approvalRequired) {
            requiredControls.push('Transfer requires approval');
        }
        // Assess compliance impact
        const sourceFrameworks = DataSensitivityUtils.getComplianceFrameworks(sourceLevel);
        const targetFrameworks = DataSensitivityUtils.getComplianceFrameworks(targetLevel);
        const allFrameworks = new Set([...sourceFrameworks, ...targetFrameworks]);
        complianceImpact.push(...Array.from(allFrameworks));
        // Determine risk level
        const riskLevel = DataSensitivityUtils.getRiskLevel(DataSensitivityUtils.getHigherSensitivityLevel(sourceLevel, targetLevel));
        return {
            sourceLevel,
            targetLevel,
            transferAllowed,
            requiredControls,
            riskLevel,
            complianceImpact
        };
    }
    /**
     * Generate data handling compliance report
     */
    static generateComplianceReport(elements, currentPolicies) {
        const summary = {
            totalElements: elements.length,
            compliantElements: 0,
            highRiskElements: 0,
            violationCount: 0
        };
        const levelBreakdown = {
            [DataSensitivityLevel.PUBLIC]: 0,
            [DataSensitivityLevel.INTERNAL]: 0,
            [DataSensitivityLevel.CONFIDENTIAL]: 0,
            [DataSensitivityLevel.RESTRICTED]: 0
        };
        const violations = [];
        const recommendationSet = new Set();
        // Analyze each element
        for (const element of elements) {
            if (!element.sensitivityLevel)
                continue;
            levelBreakdown[element.sensitivityLevel]++;
            // Check compliance
            const policyResult = this.enforceSecurityPolicies(element, {
                encrypted: currentPolicies.encryption || false,
                accessControl: currentPolicies.accessControl || [],
                monitoring: currentPolicies.monitoring || 'none',
                retention: currentPolicies.retention || 'indefinite'
            });
            if (policyResult.compliant) {
                summary.compliantElements++;
            }
            else {
                summary.violationCount += policyResult.violations.length;
                violations.push({
                    elementId: element.id,
                    sensitivityLevel: element.sensitivityLevel,
                    violations: policyResult.violations,
                    riskScore: policyResult.riskScore
                });
            }
            if (policyResult.riskScore >= 3) {
                summary.highRiskElements++;
            }
            // Collect recommendations
            policyResult.recommendations.forEach(rec => recommendationSet.add(rec));
        }
        return {
            summary,
            levelBreakdown,
            violations,
            recommendations: Array.from(recommendationSet)
        };
    }
    /**
     * Validate field value against sensitivity level requirements
     */
    static validateFieldValue(fieldName, value, sensitivityLevel) {
        const errors = [];
        let sanitizedValue = value;
        // Apply security validation based on sensitivity level
        if (sensitivityLevel === DataSensitivityLevel.RESTRICTED) {
            // Strict validation for restricted data
            if (typeof value === 'string') {
                if (!SecurityValidation.validateSafeString(value)) {
                    errors.push('String contains dangerous patterns for restricted data');
                    sanitizedValue = SecurityValidation.sanitizeString(value);
                }
            }
            if (fieldName.toLowerCase().includes('password') && typeof value === 'string') {
                if (value.length < 8) {
                    errors.push('Password must be at least 8 characters for restricted data');
                }
            }
        }
        // Validate field name for all levels
        if (!SecurityValidation.validateSafePropertyKey(fieldName)) {
            errors.push('Field name contains unsafe characters');
        }
        // Validate value size limits based on sensitivity level
        if (typeof value === 'string') {
            const maxLength = sensitivityLevel === DataSensitivityLevel.PUBLIC ? 50000 : 10000;
            if (value.length > maxLength) {
                errors.push(`Value exceeds maximum length of ${maxLength} characters for ${sensitivityLevel} data`);
                sanitizedValue = value.substring(0, maxLength);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            sanitizedValue
        };
    }
}
/**
 * Integration adapter for existing DataClassifier
 */
export class DataClassifierIntegration {
    /**
     * Enhance ClassificationResult with sensitivity information
     */
    static enhanceClassificationResult(result) {
        const sensitivityLevel = DataClassificationHelpers.convertClassificationResult(result);
        const handlingRequirements = DataSensitivityUtils.getHandlingRequirements(sensitivityLevel);
        const securityMarkings = DataSensitivityUtils.generateSecurityMarkings(sensitivityLevel);
        return {
            ...result,
            sensitivityLevel,
            handlingRequirements,
            securityMarkings
        };
    }
    /**
     * Create DataElement from enhanced data with sensitivity
     */
    static createDataElementFromSensitive(id, fieldName, value, sensitivityLevel, source = 'unknown') {
        const baseElement = {
            id,
            fieldName,
            value,
            dataType: typeof value,
            context: {
                sensitivityLevel,
                detectedAt: new Date().toISOString()
            },
            source,
            timestamp: new Date()
        };
        return DataClassificationHelpers.enhanceDataElement(baseElement, sensitivityLevel);
    }
}
// Export all utilities (classes already exported with their declarations)
export default DataClassificationHelpers;
