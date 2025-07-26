/**
 * Visual Password Strength Indicator
 * Task: T-1752989143997-191 - Create visual password strength indicator
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import React from 'react';
import { 
  PasswordComplexityValidator,
  PasswordValidationResult,
  PasswordValidationContext
} from '../auth/PasswordComplexityValidator';
export interface PasswordStrengthIndicatorProps {
    password: string;
    context?: PasswordValidationContext;
    validator?: PasswordComplexityValidator;
    showDetails?: boolean;
    showSuggestions?: boolean;
    showCrackTime?: boolean;
    showEntropy?: boolean;
    compact?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    className?: string;
    onValidationChange?: (result: PasswordValidationResult) => void;
    debounceMs?: number;
}
export interface PasswordStrengthDisplayProps {
    result: PasswordValidationResult;
    showDetails: boolean;
    showSuggestions: boolean;
    showCrackTime: boolean;
    showEntropy: boolean;
    compact: boolean;
    theme: 'light' | 'dark';
}
export declare const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps>;
export declare const usePasswordStrength: (
  password: string,
  context?: PasswordValidationContext,
  validator?: PasswordComplexityValidator
) => {
    result: PasswordValidationResult | null;
    isValidating: boolean;
    isValid: boolean;
    score: number;
    strength: "strong" | "weak" | "good" | "very-weak" | "fair" | "very-strong";
    suggestions: string[];
    errors: string[];
};
export type { PasswordStrengthIndicatorProps, PasswordStrengthDisplayProps };
export default PasswordStrengthIndicator;
//# sourceMappingURL=PasswordStrengthIndicator.d.ts.map