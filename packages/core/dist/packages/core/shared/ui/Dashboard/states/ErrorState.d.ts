/**
 * ErrorState - Consistent error displays for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides standardized error states with retry functionality
 */
import React from 'react';
import './ErrorState.css';
export interface ErrorStateProps {
    error?: string | Error;
    title?: string;
    description?: string;
    onRetry?: () => void;
    retryText?: string;
    showIcon?: boolean;
    variant?: 'default' | 'minimal' | 'detailed';
    className?: string;
}
export declare const ErrorState: React.FC<ErrorStateProps>;
export default ErrorState;
//# sourceMappingURL=ErrorState.d.ts.map