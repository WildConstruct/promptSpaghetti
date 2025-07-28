/**
 * Constraint Override Manager
 * Epic 8.8: Task 3 - Constraint Validation System
 *
 * Manages overrides for historical constraints to provide creative flexibility
 * while maintaining historical accuracy tracking
 */
import { Era } from '../types/UTDG';
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
    era?: Era;
    node_types?: string;
    social_classes?: string;
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
    createOverride(): any;
    constraintId: string;
    reason: OverrideReason;
    options: {
        userId?: string;
        duration?: number;
        scope?: 'global' | 'era' | 'project' | 'session';
        conditions?: OverrideConditions;
    };
    ConstraintOverride: any;
}
//# sourceMappingURL=ConstraintOverrideManager.d.ts.map