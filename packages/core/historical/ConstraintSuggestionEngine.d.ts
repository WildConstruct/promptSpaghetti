/**
 * Constraint Suggestion Engine
 * Epic 8.8: Task 3 - Constraint Validation System
 *
 * Provides intelligent suggestions for resolving constraint violations
 * and improving historical accuracy
 */
import { UTDGNode, Era, ConstraintValidationResult, SocialClass } from '../types/UTDG';
export interface ConstraintSuggestion {
    id: string;
    constraint_id: string;
    type: 'fix' | 'alternative' | 'educational' | 'creative';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    specific_actions: SpecificAction[];
    historical_context: string;
    trade_offs?: string[];
    example?: string;
}
export interface SpecificAction {
    action_type: 'replace_node' | 'add_node' | 'modify_attribute' | 'remove_node' | 'add_context';
    description: string;
    target_node_ids?: string[];
    suggested_values?: any;
    rationale: string;
}
export interface SuggestionContext {
    era: Era;
    social_class?: SocialClass[];
    scenario: 'daily_life' | 'ceremonial' | 'military' | 'religious' | 'artistic';
    region?: string;
    creative_flexibility: 'strict' | 'moderate' | 'flexible';
}
export declare class ConstraintSuggestionEngine {
    private historicalDatabase;
    constructor();
    /**
     * Generate suggestions for constraint violations
     */
    generateSuggestions();
      validationResult: ConstraintValidationResult,
      nodes: UTDGNode[],
      context: SuggestionContext,
    ): ConstraintSuggestion[];
    /**
     * Generate suggestions for fixing constraint violations
     */
    private generateViolationSuggestions;
    /**
     * Generate era compatibility suggestions
     */
    private generateEraCompatibilitySuggestions;
    /**
     * Generate social class suggestions
     */
    private generateSocialClassSuggestions;
    /**
     * Generate material availability suggestions
     */
    private generateMaterialAvailabilitySuggestions;
    /**
     * Generate cultural appropriateness suggestions
     */
    private generateCulturalSuggestions;
    /**
     * Generate temporal consistency suggestions
     */
    private generateTemporalSuggestions;
    /**
     * Generate regional authenticity suggestions
     */
    private generateRegionalSuggestions;
    /**
     * Generate proactive improvement suggestions
     */
    private generateImprovementSuggestions;
    private findConstraintById;
    private generateEraUnificationActions;
    private getEraExampleReplacement;
    private findCommonPeriod;
    private priorityOrder;
}
export default ConstraintSuggestionEngine;
//# sourceMappingURL=ConstraintSuggestionEngine.d.ts.map