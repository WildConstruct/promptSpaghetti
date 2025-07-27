/**
 * LoadingState - Consistent loading indicators for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides standardized loading states with optional overlay
 */
import React from 'react';
import './LoadingState.css';
export interface LoadingStateProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
    overlay?: boolean;
    showSpinner?: boolean;
    className?: string;
}
export declare const LoadingState: React.FC<LoadingStateProps>;
export default LoadingState;
//# sourceMappingURL=LoadingState.d.ts.map