/**
 * Targeting UI Components (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive suite of targeting UI components
 * for building intuitive user targeting interfaces. Provides reusable
 * components for audience selection, condition building, user previews,
 * and targeting analytics.
 *
 * Features:
 * - Audience Selector with drag-and-drop segments
 * - Advanced Condition Builder with visual logic
 * - Real-time User Preview with filtering
 * - Targeting Performance Analytics
 * - Segment Management Interface
 * - A/B Test Configuration
 * - Geographic and Demographic Targeting
 * - Behavioral Targeting Controls
 */
import React from 'react';
export interface TargetingCondition {
    id: string;
    type: 'attribute' | 'behavior' | 'segment' | 'geography' | 'device' | 'time';
    field: string;
    operator: string;
    value: Error;
    logicalOperator?: 'AND' | 'OR' | 'NOT';
    weight?: number;
    isEnabled: boolean;
}
export interface UserSegment {
    id: string;
    name: string;
    description?: string;
    conditions: TargetingCondition;
    userCount: number;
    isActive: boolean;
    createdAt: Date;
    lastUpdated: Date;
    tags: string;
    color: string;
}
export interface TargetingAudience {
    id: string;
    name: string;
    segments: UserSegment;
    conditions: TargetingCondition;
    estimatedReach: number;
    conversionRate: number;
    isActive: boolean;
    rolloutPercentage: number;
}
export interface TargetingPreview {
    totalUsers: number;
    matchedUsers: number;
    matchPercentage: number;
    sampleUsers: Array<{}, id>;
    string: any;
    email: string;
    attributes: Record<string, any>;
    matchReasons: string;
}
export declare const sortBy: "name" | "updated" | "reach", setSortBy: React.Dispatch<React.SetStateAction<"name" | "updated" | "reach">>;
export declare const previewLoading: boolean, setPreviewLoading: React.Dispatch<React.SetStateAction<boolean>>;
export { type TargetingCondition, type UserSegment, type TargetingAudience, type TargetingPreview };
//# sourceMappingURL=TargetingUIComponents.d.ts.map