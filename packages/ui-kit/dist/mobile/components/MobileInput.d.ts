/**
 * Mobile-optimized input components
 */
import React from 'react';
import { InputProps } from '../../components/Input';
export interface MobileInputProps extends InputProps {
    /**
     * Show clear button when input has value
     */
    clearable?: boolean;
    /**
     * Auto-focus and scroll into view on mobile
     */
    mobileAutoFocus?: boolean;
    /**
     * Show character count for text inputs
     */
    showCount?: boolean;
    /**
     * Mobile-specific keyboard type hints
     */
    mobileInputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}
export declare const MobileInput: React.FC<MobileInputProps>;
/**
 * Mobile search input with built-in search icon and clear button
 */
export interface MobileSearchInputProps extends MobileInputProps {
    onSearch?: (value: string) => void;
    searchOnEnter?: boolean;
}
export declare const MobileSearchInput: React.FC<MobileSearchInputProps>;
/**
 * Mobile-optimized textarea
 */
export interface MobileTextAreaProps extends MobileInputProps {
    minRows?: number;
    maxRows?: number;
    autoResize?: boolean;
}
export declare const MobileTextArea: React.FC<MobileTextAreaProps>;
//# sourceMappingURL=MobileInput.d.ts.map