/**
 * Constraint Override Manager
 * Epic 8.8: Task 3 - Constraint Validation System
 *
 * Manages overrides for historical constraints to provide creative flexibility
 * while maintaining historical accuracy tracking
 */
import { HistoricalConstraint, Era } from '../types/UTDG';
export interface ConstraintOverride {
    id: string;
    constraint_id: string;
    user_id?: string;
    reason: string;
    created_at: string;
    expires_at?: string;
    scope: 'global' | 'era' | 'project' | 'session';
    conditions?: OverrideConditions;
}
export interface OverrideConditions {
    era?: Era[];
    node_types?: string[];
    social_classes?: string[];
    max_authenticity_impact?: number;
}
export interface OverrideReason {
    category: 'creative' | 'narrative' | 'technical' | 'artistic' | 'educational';
    description: string;
    justification: string;
    alternative_considered?: string;
}
export declare class ConstraintOverrideManager {
    private overrides;
    private overrideHistory;
    /**
     * Create a new constraint override
     */
    createOverride(constraintId: string, reason: OverrideReason, options?: {)
        userId?: string;
        duration?: number;
        scope?: 'global' | 'era' | 'project' | 'session';
        conditions?: OverrideConditions;
    }): ConstraintOverride;
    /**
     * Check if a constraint is currently overridden
     */
    isConstraintOverridden(constraintId: string, context?: {)
        era?: Era;
        nodeTypes?: string[];
        socialClasses?: string[];
    }): boolean;
    /**
     * Get all active overrides
     */
    getActiveOverrides(): ConstraintOverride[];
    /**
     * Remove a specific override
     */
    removeOverride(overrideId: string): boolean;
    /**
     * Remove all overrides for a specific constraint
     */
    removeConstraintOverrides(constraintId: string): number;
    /**
     * Get override history for audit purposes
     */
    getOverrideHistory(filters?: {)
        constraintId?: string;
        userId?: string;
        fromDate?: string;
        toDate?: string;
    }): ConstraintOverride[];
    /**
     * Calculate the authenticity impact of current overrides
     */
    calculateAuthenticityImpact(constraintIds: string[]): number;
    /**
     * Get suggested overrides for creative flexibility
     */
    getSuggestedOverrides(constraints: HistoricalConstraint[], context: {)
        era?: Era;
        creativeGoals?: string[];
        narrativeNeeds?: string[];
    }): {
        constraint: HistoricalConstraint;
        suggestedReason: OverrideReason;
    }[];
    /**
     * Export override configuration for sharing/backup
     */
    exportOverrides(): {
        active: ConstraintOverride[];
        history: ConstraintOverride[];
        export_date: string;
    };
    /**
     * Import override configuration
     */
    importOverrides(data: {)
        active: ConstraintOverride[];
        history?: ConstraintOverride[];
    }): void;
    /**
     * Check if override conditions match the given context
     */
    private matchesOverrideConditions;
    /**
     * Check if two eras overlap temporally
     */
    private erasOverlap;
    /**
     * Format override reason for display and storage
     */
    private formatOverrideReason;
}
export default ConstraintOverrideManager;
//# sourceMappingURL=ConstraintOverrideManager.d.ts.map