/**
 * Historical Constraint Validation System
 * Epic 8.8: Historical Data Integration Foundation
 *
 * Provides constraint validation for historically accurate content generation
 */
import { UTDGNode, Era, HistoricalConstraint, ConstraintValidationResult } from '../types/UTDG';
export declare class ConstraintValidator {
    private constraints;
    private enabledEnforcement;
    constructor(constraints?: HistoricalConstraint[]);
    /**
     * Add a new constraint to the validator
     */
    addConstraint(constraint: HistoricalConstraint): void;
    /**
     * Remove a constraint by ID
     */
    removeConstraint(constraintId: string): void;
    /**
     * Configure which enforcement levels are active
     */
    setEnforcement(levels: ('strict' | 'warning' | 'suggestion')[]): void;
    /**
     * Validate a set of UTDG nodes against historical constraints
     */
    validateNodes(nodes: UTDGNode[]): ConstraintValidationResult;
    /**
     * Validate nodes for a specific era
     */
    validateForEra(nodes: UTDGNode[], era: Era): ConstraintValidationResult;
    /**
     * Get suggestions for improving historical accuracy
     */
    getSuggestions(nodes: UTDGNode[], era: Era): string[];
    /**
     * Evaluate a single constraint against a set of nodes
     */
    private evaluateConstraint;
    /**
     * Check if items from different eras are inappropriately mixed
     */
    private checkEraCompatibility;
    /**
     * Check if items are appropriate for the specified social classes
     */
    private checkSocialClassAppropriateness;
    /**
     * Check if materials were actually available in the specified era/region
     */
    private checkMaterialAvailability;
    /**
     * Check for cultural appropriateness and sensitivity
     */
    private checkCulturalAppropriateness;
    /**
     * Check for temporal consistency within the same time period
     */
    private checkTemporalConsistency;
    /**
     * Check for regional authenticity
     */
    private checkRegionalAuthenticity;
    /**
     * Generic constraint evaluation for custom rules
     */
    private evaluateGenericConstraint;
    /**
     * Generate alternative suggestions for constraint violations
     */
    private generateAlternatives;
    /**
     * Check if two eras overlap temporally
     */
    private erasOverlap;
    /**
     * Check if two eras are considered incompatible
     */
    private areErasIncompatible;
    /**
     * Get default historical constraints
     */
    private getDefaultConstraints;

export default ConstraintValidator;
//# sourceMappingURL=ConstraintValidator.d.ts.map