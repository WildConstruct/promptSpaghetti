/**
 * EmptyState - Consistent empty data displays for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides standardized empty states with optional actions
 */
import React from 'react';
import './EmptyState.css';
export interface EmptyStateProps {
    icon?: React.ComponentType<{
        size?: number;
    }>;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    };
    variant?: 'default' | 'search' | 'filter' | 'create';
    className?: string;
}
export declare const EmptyState: React.FC<EmptyStateProps>;
export declare const EmptySearchState: React.FC<Omit<EmptyStateProps, 'variant'>>;
export declare const EmptyFilterState: React.FC<Omit<EmptyStateProps, 'variant'>>;
export declare const EmptyCreateState: React.FC<Omit<EmptyStateProps, 'variant'>>;
export declare const EmptyChartState: React.FC<Omit<EmptyStateProps, 'variant' | 'icon'>>;
export default EmptyState;
//# sourceMappingURL=EmptyState.d.ts.map