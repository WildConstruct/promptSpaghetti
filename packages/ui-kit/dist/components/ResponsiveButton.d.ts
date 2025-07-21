/**
 * Example of responsive button component using the new framework
 */
import React from 'react';
import { ButtonProps } from './Button';
import { ResponsiveValueEnhanced, ComponentSize } from '../types';
export interface ResponsiveButtonProps extends Omit<ButtonProps, 'size' | 'fullWidth'> {
    size?: ResponsiveValueEnhanced<ComponentSize>;
    fullWidth?: ResponsiveValueEnhanced<boolean>;
    hideOn?: string | string[];
    showOn?: string | string[];
}
export declare const ResponsiveButton: React.FC<ResponsiveButtonProps>;
//# sourceMappingURL=ResponsiveButton.d.ts.map