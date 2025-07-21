/**
 * React Native-specific Button implementation
 */
import React from 'react';
import { ButtonProps } from '../../components/Button';
export interface RNButtonProps extends ButtonProps {
    hapticFeedback?: 'light' | 'medium' | 'heavy';
    accessibilityRole?: string;
    accessibilityHint?: string;
    testID?: string;
}
export declare const RNButton: React.FC<RNButtonProps>;
//# sourceMappingURL=RNButton.d.ts.map