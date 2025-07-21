/**
 * Mobile-optimized button component
 */
import React from 'react';
import { ButtonProps } from '../../components/Button';
export interface MobileButtonProps extends ButtonProps {
    /**
     * Make button full width on mobile
     */
    mobileFullWidth?: boolean;
    /**
     * Add haptic feedback on press (mobile only)
     */
    hapticFeedback?: boolean;
    /**
     * Show loading spinner inline on mobile
     */
    mobileLoading?: boolean;
}
export declare const MobileButton: React.FC<MobileButtonProps>;
/**
 * Mobile floating action button
 */
export interface MobileFABProps extends Omit<MobileButtonProps, 'variant'> {
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
    offset?: number;
}
export declare const MobileFAB: React.FC<MobileFABProps>;
//# sourceMappingURL=MobileButton.d.ts.map