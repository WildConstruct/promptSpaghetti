/**
 * Constraint Suggestion Engine
 * Epic 8.8: Task 3 - Constraint Validation System
 *
 * Provides intelligent suggestions for resolving constraint violations
 * and improving historical accuracy
 */
import { UTDGNode, Era, HistoricalConstraint, SocialClass } from '../types/UTDG';
export interface ConstraintSuggestion {
    id: string;
    constraint_id: string;
    type: 'fix' | 'alternative' | 'educational' | 'creative';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    specific_actions: SpecificAction;
    historical_context: string;
    trade_offs?: string;
    example?: string;
}
export interface SpecificAction {
    action_type: 'replace_node' | 'add_node' | 'modify_attribute' | 'remove_node' | 'add_context';
    description: string;
    target_node_ids?: string;
    suggested_values?: any;
    rationale: string;
}
export interface SuggestionContext {
    era: Era;
    social_class?: SocialClass;
    scenario: 'daily_life' | 'ceremonial' | 'military' | 'religious' | 'artistic';
    region?: string;
    creative_flexibility: 'strict' | 'moderate' | 'flexible';
}
export declare class ConstraintSuggestionEngine {
    private historicalDatabase;
    constructor();
    /**
     * Generate suggestions for fixing constraint violations
     */
    private generateViolationSuggestions;
    constraint: HistoricalConstraint;
    nodes: UTDGNode;
    context: SuggestionContext;
    ConstraintSuggestion: any;
}
//# sourceMappingURL=ConstraintSuggestionEngine.d.ts.map