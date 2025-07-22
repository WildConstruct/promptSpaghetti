/**
 * Professional Loading States and Spinners
 * Epic 8.1: Task 4 - Professional loading states for Cinema 4D quality
 *
 * Cinema 4D and Substance Designer inspired loading animations
 */
import React from 'react';
import '../../styles/smoothAnimations.css';
export interface ProfessionalSpinnerProps {
    size?: 'small' | 'medium' | 'large' | 'xl';
    variant?: 'primary' | 'secondary' | 'accent' | 'cinema4d';
    type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
    message?: string;
    progress?: number;
}
export declare const ProfessionalSpinner: React.FC<ProfessionalSpinnerProps>;
/**
 * Full-screen professional loading overlay
 */
export interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
    progress?: number;
    variant?: 'primary' | 'secondary' | 'accent' | 'cinema4d';
    backdrop?: 'blur' | 'solid' | 'transparent';
    onCancel?: () => void;
}
export declare const getBackdropStyle: () => React.CSSProperties;
/**
 * Inline loading state for smaller components
 */
export interface InlineLoaderProps {
    loading: boolean;
    size?: 'small' | 'medium';
    text?: string;
    children: React.ReactNode;
}
//# sourceMappingURL=ProfessionalSpinner.d.ts.map