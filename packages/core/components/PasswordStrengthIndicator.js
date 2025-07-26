import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Visual Password Strength Indicator
 * Task: T-1752989143997-191 - Create visual password strength indicator
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import { useMemo, useEffect, useState } from 'react';
import { PasswordComplexityValidator } from '../auth/PasswordComplexityValidator';
// ========================================
// Strength Meter Component
// ========================================
const StrengthMeter = ({ score, strength, compact, theme }) => {
    const getStrengthColor = (strength) => {
        const colors = {
            'very-weak': '#dc2626', // red-600
            'weak': '#ea580c', // orange-600
            'fair': '#d97706', // amber-600
            'good': '#65a30d', // lime-600
            'strong': '#16a34a', // green-600
            'very-strong': '#059669' // emerald-600
        };
        return colors[strength];
    };
    const getStrengthLabel = (strength) => {
        const labels = {
            'very-weak': 'Very Weak',
            'weak': 'Weak',
            'fair': 'Fair',
            'good': 'Good',
            'strong': 'Strong',
            'very-strong': 'Very Strong'
        };
        return labels[strength];
    };
    const strengthColor = getStrengthColor(strength);
    const strengthLabel = getStrengthLabel(strength);
    const progressWidth = Math.max(5, score); // Minimum 5% width for visibility
    if (compact) {
        return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-16 h-2 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full transition-all duration-300 ease-in-out", style: {
                            width: `${progressWidth}%`,
                            backgroundColor: strengthColor
                        } }) }), _jsx("span", { className: "text-xs font-medium", style: { color: strengthColor }, children: strengthLabel })] }));
    }
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Password Strength" }), _jsxs("span", { className: "text-sm font-semibold", style: { color: strengthColor }, children: [strengthLabel, " (", score, "/100)"] })] }), _jsx("div", { className: "w-full h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full transition-all duration-300 ease-in-out rounded-full", style: {
                        width: `${progressWidth}%`,
                        backgroundColor: strengthColor
                    } }) })] }));
};
// ========================================
// Rule Results Display
// ========================================
const RuleResultsDisplay = ({ ruleResults, passedRules, totalRules, theme }) => {
    if (ruleResults.length === 0)
        return null;
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Requirements" }), _jsxs("span", { className: "text-xs text-gray-500", children: [passedRules, "/", totalRules, " met"] })] }), _jsx("div", { className: "space-y-1", children: ruleResults.map((result, index) => (_jsxs("div", { className: "flex items-center gap-2 text-xs", children: [_jsx("span", { className: `w-2 h-2 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}` }), _jsx("span", { className: `flex-1 ${result.passed ? 'text-green-700' : 'text-red-600'}`, children: result.message }), _jsxs("span", { className: "text-gray-400", children: [result.score, "/10"] })] }, index))) })] }));
};
// ========================================
// Suggestions Display
// ========================================
const SuggestionsDisplay = ({ suggestions, theme }) => {
    if (suggestions.length === 0)
        return null;
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Suggestions" }), _jsxs("div", { className: "space-y-1", children: [suggestions.slice(0, 3).map((suggestion, index) => (_jsxs("div", { className: "flex items-start gap-2 text-xs", children: [_jsx("span", { className: "text-blue-500 mt-0.5", children: "\u2022" }), _jsx("span", { className: "text-gray-600", children: suggestion })] }, index))), suggestions.length > 3 && (_jsxs("div", { className: "text-xs text-gray-500 italic", children: ["+", suggestions.length - 3, " more suggestions"] }))] })] }));
};
// ========================================
// Additional Info Display
// ========================================
const AdditionalInfoDisplay = ({ result, showCrackTime, showEntropy, theme }) => {
    if (!showCrackTime && !showEntropy)
        return null;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200", children: [showEntropy && result.entropy && (_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-xs font-medium text-gray-600", children: "Entropy" }), _jsxs("div", { className: "text-sm text-gray-800", children: [result.entropy.toFixed(1), " bits"] })] })), showCrackTime && result.estimatedCrackTime && (_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-xs font-medium text-gray-600", children: "Crack Time" }), _jsxs("div", { className: "text-sm text-gray-800", children: [_jsxs("div", { children: ["Online: ", result.estimatedCrackTime.online] }), _jsxs("div", { children: ["Offline: ", result.estimatedCrackTime.offline] })] })] }))] }));
};
// ========================================
// Main Password Strength Display
// ========================================
const PasswordStrengthDisplay = ({ result, showDetails, showSuggestions, showCrackTime, showEntropy, compact, theme }) => {
    const hasAdditionalInfo = showCrackTime || showEntropy;
    const hasDetails = showDetails || showSuggestions || hasAdditionalInfo;
    return (_jsxs("div", { className: `space-y-3 ${compact ? 'space-y-2' : ''}`, children: [_jsx(StrengthMeter, { score: result.score, strength: result.strength, compact: compact, theme: theme }), hasDetails && !compact && (_jsxs("div", { className: "space-y-3", children: [showDetails && (_jsx(RuleResultsDisplay, { ruleResults: result.ruleResults, passedRules: result.passedRules, totalRules: result.totalRules, theme: theme })), showSuggestions && (_jsx(SuggestionsDisplay, { suggestions: result.suggestions, theme: theme })), hasAdditionalInfo && (_jsx(AdditionalInfoDisplay, { result: result, showCrackTime: showCrackTime, showEntropy: showEntropy, theme: theme }))] })), result.errors.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-sm font-medium text-red-600", children: "Errors" }), _jsx("div", { className: "space-y-1", children: result.errors.map((error, index) => (_jsxs("div", { className: "text-xs text-red-600 flex items-start gap-2", children: [_jsx("span", { className: "text-red-500 mt-0.5", children: "\u26A0" }), _jsx("span", { children: error })] }, index))) })] })), result.warnings.length > 0 && !compact && (_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-sm font-medium text-amber-600", children: "Warnings" }), _jsx("div", { className: "space-y-1", children: result.warnings.map((warning, index) => (_jsxs("div", { className: "text-xs text-amber-600 flex items-start gap-2", children: [_jsx("span", { className: "text-amber-500 mt-0.5", children: "\u26A0" }), _jsx("span", { children: warning })] }, index))) })] }))] }));
};
// ========================================
// Custom Hook for Debounced Validation
// ========================================
const useDebounedValidation = (password, validator, context, debounceMs = 300) => {
    const [result, setResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    useEffect(() => {
        if (!password) {
            setResult(null);
            setIsValidating(false);
            return;
        }
        setIsValidating(true);
        const timeoutId = setTimeout(async () => {
            try {
                const validationResult = await validator.validatePassword(password, context);
                setResult(validationResult);
            }
            catch (error) {
                console.error('Password validation error:', error);
                setResult({
                    valid: false,
                    score: 0,
                    strength: 'very-weak',
                    ruleResults: [],
                    errors: ['Validation failed'],
                    warnings: [],
                    suggestions: [],
                    passedRules: 0,
                    totalRules: 0
                });
            }
            finally {
                setIsValidating(false);
            }
        }, debounceMs);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [password, validator, context, debounceMs]);
    return { result, isValidating };
};
// ========================================
// Main Password Strength Indicator Component
// ========================================
export const PasswordStrengthIndicator = ({ password, context, validator, showDetails = true, showSuggestions = true, showCrackTime = false, showEntropy = false, compact = false, theme = 'auto', className = '', onValidationChange, debounceMs = 300 }) => {
    // Create default validator if none provided
    const defaultValidator = useMemo(() => new PasswordComplexityValidator(), []);
    const passwordValidator = validator || defaultValidator;
    // Determine theme
    const resolvedTheme = useMemo(() => {
        if (theme === 'auto') {
            // Check for dark mode preference
            if (typeof window !== 'undefined') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'light';
        }
        return theme;
    }, [theme]);
    // Get validation result with debouncing
    const { result, isValidating } = useDebounedValidation(password, passwordValidator, context, debounceMs);
    // Notify parent of validation changes
    useEffect(() => {
        if (result && onValidationChange) {
            onValidationChange(result);
        }
    }, [result, onValidationChange]);
    // Don't render anything if no password
    if (!password) {
        return null;
    }
    // Show loading state during validation
    if (isValidating && !result) {
        return (_jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [_jsx("div", { className: "w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" }), _jsx("span", { className: "text-sm text-gray-500", children: "Analyzing password..." })] }));
    }
    // Don't render if no result available
    if (!result) {
        return null;
    }
    return (_jsx("div", { className: `password-strength-indicator ${className}`, children: _jsx(PasswordStrengthDisplay, { result: result, showDetails: showDetails, showSuggestions: showSuggestions, showCrackTime: showCrackTime, showEntropy: showEntropy, compact: compact, theme: resolvedTheme }) }));
};
// ========================================
// Simplified Hook for External Use
// ========================================
export const usePasswordStrength = (password, context, validator) => {
    const defaultValidator = useMemo(() => new PasswordComplexityValidator(), []);
    const passwordValidator = validator || defaultValidator;
    const { result, isValidating } = useDebounedValidation(password, passwordValidator, context);
    return {
        result,
        isValidating,
        isValid: result?.valid || false,
        score: result?.score || 0,
        strength: result?.strength || 'very-weak',
        suggestions: result?.suggestions || [],
        errors: result?.errors || []
    };
};
export default PasswordStrengthIndicator;
