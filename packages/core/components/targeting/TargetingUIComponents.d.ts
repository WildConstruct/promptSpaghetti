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
    conditions: TargetingCondition[];
    userCount: number;
    isActive: boolean;
    createdAt: Date;
    lastUpdated: Date;
    tags: string[];
    color: string;
}
export interface TargetingAudience {
    id: string;
    name: string;
    segments: UserSegment[];
    conditions: TargetingCondition[];
    estimatedReach: number;
    conversionRate: number;
    isActive: boolean;
    rolloutPercentage: number;
}
export interface TargetingPreview {
    totalUsers: number;
    matchedUsers: number;
    matchPercentage: number;
    sampleUsers: Array<{
        id: string;
        email: string;
        attributes: Record<string, any>;
        matchReasons: string[];
    }>;
    demographics: {
        age: Record<string, number>;
        location: Record<string, number>;
        userType: Record<string, number>;
    };
}
interface AudienceSelectorProps {
    audiences: TargetingAudience[];
    selectedAudience?: TargetingAudience;
    onSelect: (audience: TargetingAudience) => void;
    onCreate?: () => void;
    onEdit?: (audience: TargetingAudience) => void;
    onDelete?: (audienceId: string) => void;
    showAnalytics?: boolean;
    compact?: boolean;
}
export declare     availableFields: Array<{
        key: string;
        label: string;
        type: string;
        category: string;
        options?: unknown[];
    }>;
    onPreview?: (conditions: TargetingCondition[]) => Promise<TargetingPreview>;
    showVisualBuilder?: boolean;
}
export declare     onUpdateSegment: (id: string, updates: Partial<UserSegment>) => void;
    onDeleteSegment: (id: string) => void;
    onDuplicateSegment: (id: string) => void;
}
export declare const SegmentManagement: React.FC<SegmentManagementProps>;
export { type TargetingCondition, type UserSegment, type TargetingAudience, type TargetingPreview };
//# sourceMappingURL=TargetingUIComponents.d.ts.map