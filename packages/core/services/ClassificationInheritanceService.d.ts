/**
 * Classification Inheritance Service
 * Task T-1752989143998-418: Add classification inheritance rules
 *
 * Implements inheritance rules for data classification, allowing child elements
 * to inherit classifications from parent elements based on configurable rules
 */
import { 
  DataClassification,
  DataClassificationLevel,
  ClassificationContext,
  ValidationResult
} from '../types/DataClassification';

export interface InheritanceRule {
    id: string;
    name: string;
    description: string;
    priority: number;
    enabled: boolean;
    conditions: InheritanceCondition[];
    action: InheritanceAction;
    overridePolicy: OverridePolicy;

export interface InheritanceCondition {
    type: 'PARENT_TYPE' | 'PARENT_CLASSIFICATION' | 'CHILD_TYPE' | 'RELATIONSHIP_TYPE' | 'CONTEXT_MATCH';
    field: string;
    operator: 'EQUALS' | 'CONTAINS' | 'MATCHES' | 'IN' | 'NOT_IN';
    value: string | string[];
    required: boolean;

export interface InheritanceAction {
    type: 'INHERIT_EXACT' | 'INHERIT_ELEVATED' | 'INHERIT_REDUCED' | 'APPLY_MINIMUM' | 'APPLY_CUSTOM';
    customClassification?: DataClassificationLevel;
    elevationLevel?: number;
    rationale: string;

export interface OverridePolicy {
    allowManualOverride: boolean;
    requireApprovalForOverride: boolean;
    maxOverrideLevel?: DataClassificationLevel;
    overrideReasons: string[];

export interface DataRelationship {
    parentId: string;
    childId: string;
    relationshipType: 'CONTAINS' | 'DERIVES_FROM' | 'PROCESSES' | 'REFERENCES' | 'AGGREGATES';
    strength: 'WEAK' | 'MODERATE' | 'STRONG' | 'ABSOLUTE';
    metadata?: Record<string, any>;

export interface InheritanceContext {
    parentElement: {
        id: string;
        type: string;
        classification?: DataClassification;
        metadata?: Record<string, any>;
    };
    childElement: {
        id: string;
        type: string;
        existingClassification?: DataClassification;
        metadata?: Record<string, any>;
    };
    relationship: DataRelationship;
    businessContext?: ClassificationContext;

export interface InheritanceResult {
    elementId: string;
    inheritedClassification: DataClassification;
    appliedRules: AppliedRule[];
    confidence: number;
    requiresReview: boolean;
    validationResult: ValidationResult;

export interface AppliedRule {
    ruleId: string;
    ruleName: string;
    priority: number;
    rationale: string;
    confidence: number;
/**
 * Service for managing classification inheritance rules and applying them
 */
export declare class ClassificationInheritanceService {
    private rules;
    private relationships;
    constructor();
    /**
     * Initialize default inheritance rules
     */
    private initializeDefaultRules;
    /**
     * Add or update an inheritance rule
     */
    addRule(rule: InheritanceRule): void;
    /**
     * Get all inheritance rules
     */
    getRules(): InheritanceRule[];
    /**
     * Enable or disable a rule
     */
    setRuleEnabled(ruleId: string, enabled: boolean): void;
    /**
     * Register a data relationship
     */
    addRelationship(relationship: DataRelationship): void;
    /**
     * Get relationships for a child element
     */
    getRelationships(childId: string): DataRelationship[];
    /**
     * Apply inheritance rules to determine classification for a child element
     */
    applyInheritanceRules(context: InheritanceContext): Promise<InheritanceResult>;
    /**
     * Find rules that apply to the given context
     */
    private findApplicableRules;
    /**
     * Check if a rule matches the given context
     */
    private ruleMatches;
    /**
     * Check if a condition matches the context
     */
    private conditionMatches;
    /**
     * Apply a specific rule to determine classification
     */
    private applyRule;
    /**
     * Calculate confidence score for rule application
     */
    private calculateRuleConfidence;
    /**
     * Build rationale text for inheritance result
     */
    private buildInheritanceRationale;
    /**
     * Validate inherited classification
     */
    private validateInheritedClassification;
    /**
     * Get inheritance rules that would apply to a specific context
     */
    getApplicableRules(context: InheritanceContext): InheritanceRule[];
    /**
     * Preview inheritance result without applying
     */
    previewInheritance(context: InheritanceContext): Promise<InheritanceResult>;
    /**
     * Batch apply inheritance to multiple child elements
     */
    batchApplyInheritance(contexts: InheritanceContext[]): Promise<Map<string, InheritanceResult>>;

//# sourceMappingURL=ClassificationInheritanceService.d.ts.map