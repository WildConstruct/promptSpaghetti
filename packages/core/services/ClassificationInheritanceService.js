/**
 * Classification Inheritance Service
 * Task T-1752989143998-418: Add classification inheritance rules
 *
 * Implements inheritance rules for data classification, allowing child elements
 * to inherit classifications from parent elements based on configurable rules
 */
import { CLASSIFICATION_LEVELS } from '../types/DataClassification';
/**
 * Service for managing classification inheritance rules and applying them
 */
export class ClassificationInheritanceService {
    rules = new Map();
    relationships = new Map(); // childId -> relationships[]
    constructor() {
        this.initializeDefaultRules();
    }
    /**
     * Initialize default inheritance rules
     */
    initializeDefaultRules() {
        const defaultRules = [
            {
                id: 'direct-containment-rule',
                name: 'Direct Containment Inheritance',
                description: 'Child elements inherit classification from direct parent containers',
                priority: 100,
                enabled: true,
                conditions: [
                    {
                        type: 'RELATIONSHIP_TYPE',
                        field: 'relationshipType',
                        operator: 'EQUALS',
                        value: 'CONTAINS',
                        required: true
                    },
                    {
                        type: 'RELATIONSHIP_TYPE',
                        field: 'strength',
                        operator: 'IN',
                        value: ['STRONG', 'ABSOLUTE'],
                        required: true
                    }
                ],
                action: {
                    type: 'INHERIT_EXACT',
                    rationale: 'Direct containment requires same classification level'
                },
                overridePolicy: {
                    allowManualOverride: true,
                    requireApprovalForOverride: false,
                    overrideReasons: ['Business justification', 'Technical limitation', 'Regulatory exception']
                }
            },
            {
                id: 'derived-data-elevation-rule',
                name: 'Derived Data Elevation',
                description: 'Derived data inherits parent classification or higher',
                priority: 90,
                enabled: true,
                conditions: [
                    {
                        type: 'RELATIONSHIP_TYPE',
                        field: 'relationshipType',
                        operator: 'EQUALS',
                        value: 'DERIVES_FROM',
                        required: true
                    }
                ],
                action: {
                    type: 'APPLY_MINIMUM',
                    rationale: 'Derived data should be at least as protected as source data'
                },
                overridePolicy: {
                    allowManualOverride: true,
                    requireApprovalForOverride: true,
                    maxOverrideLevel: 'INTERNAL',
                    overrideReasons: ['Data transformation reduces sensitivity', 'Aggregation removes personal identifiers']
                }
            },
            {
                id: 'aggregated-data-reduction-rule',
                name: 'Aggregated Data Classification',
                description: 'Aggregated data may have reduced classification if anonymized',
                priority: 80,
                enabled: true,
                conditions: [
                    {
                        type: 'RELATIONSHIP_TYPE',
                        field: 'relationshipType',
                        operator: 'EQUALS',
                        value: 'AGGREGATES',
                        required: true
                    },
                    {
                        type: 'CHILD_TYPE',
                        field: 'type',
                        operator: 'CONTAINS',
                        value: 'aggregated',
                        required: false
                    }
                ],
                action: {
                    type: 'INHERIT_REDUCED',
                    elevationLevel: -1,
                    rationale: 'Aggregation may reduce individual data sensitivity'
                },
                overridePolicy: {
                    allowManualOverride: true,
                    requireApprovalForOverride: true,
                    overrideReasons: ['Aggregation maintains individual identifiability', 'Small sample size']
                }
            },
            {
                id: 'processing-context-rule',
                name: 'Processing Context Inheritance',
                description: 'Data processed in secure contexts inherits elevated classification',
                priority: 70,
                enabled: true,
                conditions: [
                    {
                        type: 'RELATIONSHIP_TYPE',
                        field: 'relationshipType',
                        operator: 'EQUALS',
                        value: 'PROCESSES',
                        required: true
                    },
                    {
                        type: 'CONTEXT_MATCH',
                        field: 'environment',
                        operator: 'IN',
                        value: ['production', 'secure'],
                        required: false
                    }
                ],
                action: {
                    type: 'INHERIT_ELEVATED',
                    elevationLevel: 1,
                    rationale: 'Processing in production requires elevated protection'
                },
                overridePolicy: {
                    allowManualOverride: false,
                    requireApprovalForOverride: true,
                    overrideReasons: ['Approved security exception']
                }
            },
            {
                id: 'reference-minimum-rule',
                name: 'Reference Data Minimum Classification',
                description: 'Referenced data should be at least INTERNAL classification',
                priority: 60,
                enabled: true,
                conditions: [
                    {
                        type: 'RELATIONSHIP_TYPE',
                        field: 'relationshipType',
                        operator: 'EQUALS',
                        value: 'REFERENCES',
                        required: true
                    }
                ],
                action: {
                    type: 'APPLY_MINIMUM',
                    customClassification: 'INTERNAL',
                    rationale: 'Referenced data requires minimum INTERNAL classification'
                },
                overridePolicy: {
                    allowManualOverride: true,
                    requireApprovalForOverride: false,
                    maxOverrideLevel: 'PUBLIC',
                    overrideReasons: ['Public reference data', 'Open source documentation']
                }
            }
        ];
        defaultRules.forEach(rule => this.rules.set(rule.id, rule));
    }
    /**
     * Add or update an inheritance rule
     */
    addRule(rule) {
        this.rules.set(rule.id, rule);
    }
    /**
     * Get all inheritance rules
     */
    getRules() {
        return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
    }
    /**
     * Enable or disable a rule
     */
    setRuleEnabled(ruleId, enabled) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = enabled;
        }
    }
    /**
     * Register a data relationship
     */
    addRelationship(relationship) {
        const childRelationships = this.relationships.get(relationship.childId) || [];
        childRelationships.push(relationship);
        this.relationships.set(relationship.childId, childRelationships);
    }
    /**
     * Get relationships for a child element
     */
    getRelationships(childId) {
        return this.relationships.get(childId) || [];
    }
    /**
     * Apply inheritance rules to determine classification for a child element
     */
    async applyInheritanceRules(context) {
        const applicableRules = this.findApplicableRules(context);
        const appliedRules = [];
        let finalClassification = null;
        let highestPriority = -1;
        let requiresReview = false;
        let totalConfidence = 0;
        // Apply rules in priority order
        for (const rule of applicableRules) {
            if (!rule.enabled || rule.priority < highestPriority)
                continue;
            const ruleResult = this.applyRule(rule, context);
            if (ruleResult.classification) {
                finalClassification = ruleResult.classification;
                highestPriority = rule.priority;
                appliedRules.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    priority: rule.priority,
                    rationale: ruleResult.rationale,
                    confidence: ruleResult.confidence
                });
                totalConfidence = Math.max(totalConfidence, ruleResult.confidence);
                if (ruleResult.requiresReview) {
                    requiresReview = true;
                }
            }
        }
        // Use existing classification if no rules applied
        if (!finalClassification) {
            finalClassification = context.childElement.existingClassification?.classification || 'INTERNAL';
            totalConfidence = context.childElement.existingClassification ? 100 : 50;
        }
        // Create inherited classification
        const inheritedClassification = {
            id: `inherited-${context.childElement.id}-${Date.now()}`,
            dataElement: context.childElement.id,
            classification: finalClassification,
            rationale: this.buildInheritanceRationale(appliedRules, context),
            dataOwner: context.parentElement.classification?.dataOwner || 'inherited-owner',
            classifiedBy: 'inheritance-system',
            classificationDate: new Date(),
            reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            approvals: [],
            metadata: {
                businessJustification: 'Classification inherited from parent element',
                riskAssessment: 'Risk assessment inherited and may require review',
                regulatoryRequirements: context.businessContext?.regulatoryScope || [],
                dataLineage: [context.parentElement.id],
                relatedClassifications: context.parentElement.classification ? [context.parentElement.classification.id] : []
            }
        };
        // Validate the result
        const validationResult = this.validateInheritedClassification(inheritedClassification, context);
        return {
            elementId: context.childElement.id,
            inheritedClassification,
            appliedRules,
            confidence: totalConfidence,
            requiresReview: requiresReview || validationResult.warnings.length > 0,
            validationResult
        };
    }
    /**
     * Find rules that apply to the given context
     */
    findApplicableRules(context) {
        return Array.from(this.rules.values())
            .filter(rule => rule.enabled && this.ruleMatches(rule, context))
            .sort((a, b) => b.priority - a.priority);
    }
    /**
     * Check if a rule matches the given context
     */
    ruleMatches(rule, context) {
        return rule.conditions.every(condition => this.conditionMatches(condition, context));
    }
    /**
     * Check if a condition matches the context
     */
    conditionMatches(condition, context) {
        let value;
        switch (condition.type) {
            case 'PARENT_TYPE':
                value = context.parentElement.type;
                break;
            case 'PARENT_CLASSIFICATION':
                value = context.parentElement.classification?.classification;
                break;
            case 'CHILD_TYPE':
                value = context.childElement.type;
                break;
            case 'RELATIONSHIP_TYPE':
                value = context.relationship[condition.field];
                break;
            case 'CONTEXT_MATCH':
                value = context.businessContext?.[condition.field];
                break;
            default:
                return false;
        }
        if (!value && condition.required)
            return false;
        if (!value)
            return true; // Optional condition with no value
        switch (condition.operator) {
            case 'EQUALS':
                return value === condition.value;
            case 'CONTAINS':
                return typeof value === 'string' && value.toLowerCase().includes(String(condition.value).toLowerCase());
            case 'MATCHES':
                return new RegExp(String(condition.value), 'i').test(String(value));
            case 'IN':
                return Array.isArray(condition.value) && condition.value.includes(value);
            case 'NOT_IN':
                return Array.isArray(condition.value) && !condition.value.includes(value);
            default:
                return false;
        }
    }
    /**
     * Apply a specific rule to determine classification
     */
    applyRule(rule, context) {
        const parentClassification = context.parentElement.classification?.classification;
        if (!parentClassification) {
            return { classification: null, rationale: 'No parent classification available', confidence: 0, requiresReview: true };
        }
        const parentIndex = CLASSIFICATION_LEVELS.indexOf(parentClassification);
        let targetIndex = parentIndex;
        let requiresReview = false;
        switch (rule.action.type) {
            case 'INHERIT_EXACT':
                // Keep same classification
                break;
            case 'INHERIT_ELEVATED':
                targetIndex = Math.min(CLASSIFICATION_LEVELS.length - 1, parentIndex + (rule.action.elevationLevel || 1));
                requiresReview = true;
                break;
            case 'INHERIT_REDUCED':
                targetIndex = Math.max(0, parentIndex - Math.abs(rule.action.elevationLevel || 1));
                requiresReview = true;
                break;
            case 'APPLY_MINIMUM':
                if (rule.action.customClassification) {
                    const minIndex = CLASSIFICATION_LEVELS.indexOf(rule.action.customClassification);
                    targetIndex = Math.max(parentIndex, minIndex);
                }
                break;
            case 'APPLY_CUSTOM':
                if (rule.action.customClassification) {
                    targetIndex = CLASSIFICATION_LEVELS.indexOf(rule.action.customClassification);
                    requiresReview = true;
                }
                break;
        }
        const classification = CLASSIFICATION_LEVELS[targetIndex];
        const confidence = this.calculateRuleConfidence(rule, context);
        return {
            classification,
            rationale: rule.action.rationale,
            confidence,
            requiresReview
        };
    }
    /**
     * Calculate confidence score for rule application
     */
    calculateRuleConfidence(rule, context) {
        let confidence = 70; // Base confidence
        // Adjust based on relationship strength
        switch (context.relationship.strength) {
            case 'ABSOLUTE':
                confidence += 25;
                break;
            case 'STRONG':
                confidence += 15;
                break;
            case 'MODERATE':
                confidence += 5;
                break;
            case 'WEAK':
                confidence -= 10;
                break;
        }
        // Adjust based on rule priority
        confidence += Math.min(10, rule.priority / 10);
        // Adjust based on required conditions met
        const requiredConditions = rule.conditions.filter(c => c.required);
        const metRequiredConditions = requiredConditions.filter(c => this.conditionMatches(c, context));
        if (requiredConditions.length > 0) {
            confidence += (metRequiredConditions.length / requiredConditions.length) * 15;
        }
        return Math.min(100, Math.max(0, confidence));
    }
    /**
     * Build rationale text for inheritance result
     */
    buildInheritanceRationale(appliedRules, context) {
        if (appliedRules.length === 0) {
            return 'No inheritance rules applied - using default classification';
        }
        const primaryRule = appliedRules[0];
        let rationale = `Classification inherited using rule "${primaryRule.ruleName}": ${primaryRule.rationale}`;
        if (appliedRules.length > 1) {
            rationale += ` Additional rules considered: ${appliedRules.slice(1).map(r => r.ruleName).join(', ')}`;
        }
        rationale += ` Parent element: ${context.parentElement.id} (${context.parentElement.classification?.classification || 'unclassified'})`;
        rationale += ` Relationship: ${context.relationship.relationshipType} (${context.relationship.strength})`;
        return rationale;
    }
    /**
     * Validate inherited classification
     */
    validateInheritedClassification(classification, context) {
        const errors = [];
        const warnings = [];
        const recommendations = [];
        // Check for classification elevation without proper justification
        const parentLevel = context.parentElement.classification?.classification;
        if (parentLevel) {
            const parentIndex = CLASSIFICATION_LEVELS.indexOf(parentLevel);
            const childIndex = CLASSIFICATION_LEVELS.indexOf(classification.classification);
            if (childIndex > parentIndex) {
                warnings.push('Child element has higher classification than parent - verify this is appropriate');
            }
        }
        // Check for weak relationships with strong inheritance
        if (context.relationship.strength === 'WEAK' && classification.classification === 'RESTRICTED') {
            warnings.push('Weak relationship resulted in restricted classification - manual review recommended');
        }
        // Check for missing required metadata
        if (!classification.metadata.riskAssessment || classification.metadata.riskAssessment.includes('inherited')) {
            if (['CONFIDENTIAL', 'RESTRICTED'].includes(classification.classification)) {
                recommendations.push('Consider performing specific risk assessment for sensitive inherited classification');
            }
        }
        // Check for data lineage
        if (!classification.metadata.dataLineage || classification.metadata.dataLineage.length === 0) {
            warnings.push('Data lineage information is missing - this may impact compliance');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            recommendations
        };
    }
    /**
     * Get inheritance rules that would apply to a specific context
     */
    getApplicableRules(context) {
        return this.findApplicableRules(context);
    }
    /**
     * Preview inheritance result without applying
     */
    async previewInheritance(context) {
        return this.applyInheritanceRules(context);
    }
    /**
     * Batch apply inheritance to multiple child elements
     */
    async batchApplyInheritance(contexts) {
        const results = new Map();
        for (const context of contexts) {
            try {
                const result = await this.applyInheritanceRules(context);
                results.set(context.childElement.id, result);
            }
            catch (error) {
                console.error(`Error applying inheritance for ${context.childElement.id}:`, error);
            }
        }
        return results;
    }
}
