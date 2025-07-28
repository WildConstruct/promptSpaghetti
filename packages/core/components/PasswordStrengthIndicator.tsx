/**
 * Visual Password Strength Indicator
 * Task: T-1752989143997-191 - Create visual password strength indicator
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import React, { useMemo, useEffect, useState } from 'react';
import { 
  PasswordComplexityValidator, 
  PasswordValidationResult, 
  PasswordValidationContext 
} from '../auth/PasswordComplexityValidator';

// ========================================
// Types and Interfaces
// ========================================

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

// ========================================
// Strength Meter Component
// ========================================
const StrengthMeter: React.FC<{
  score: number;
  strength: PasswordValidationResult['strength'];
  compact: boolean;
  theme: 'light' | 'dark';
}> = ({ score, strength, compact, theme }) => {
  const getStrengthColor = (strength: PasswordValidationResult['strength']): string => {
    const colors = {
      'very-weak': '#dc2626', // red-600
      'weak': '#ea580c',      // orange-600
      'fair': '#d97706',      // amber-600
      'good': '#65a30d',      // lime-600
      'strong': '#16a34a',    // green-600
      'very-strong': '#059669' // emerald-600
    };
    return colors[strength];
  };
  const getStrengthLabel = (strength: PasswordValidationResult['strength']): string => {
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
  const progressWidth = Math.max(5, score); // Minimum 5% width for visibility;
  if (compact) {
    return ();
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-in-out"
            style={{
              width: `${progressWidth}%`,}
              backgroundColor: strengthColor,
            }}
          />
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: strengthColor }}
        >
          {strengthLabel}
        </span>
      </div>
    );
  }
  return ();
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Password Strength</span>
        <span
          className="text-sm font-semibold"
          style={{ color: strengthColor }}
        >
          {strengthLabel} ({score}/100)
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-in-out rounded-full"
          style={{
            width: `${progressWidth}%`,}
            backgroundColor: strengthColor,
          }}
        />
      </div>
    </div>
  );
};

// ========================================
// Rule Results Display
// ========================================
const RuleResultsDisplay: React.FC<{
  ruleResults: PasswordValidationResult['ruleResults'];
  passedRules: number;
  totalRules: number;
  theme: 'light' | 'dark';
}> = ({ ruleResults, passedRules, totalRules, theme }) => {
  if (ruleResults.length === 0) return null;
  return ();
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Requirements</span>
        <span className="text-xs text-gray-500">
          {passedRules}/{totalRules} met
        </span>
      </div>
      <div className="space-y-1">
        {ruleResults.map((result, index) => ()
          <div key={index} className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${
              result.passed ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`flex-1 ${
              result.passed ? 'text-green-700' : 'text-red-600'
            }`}>
              {result.message}
            </span>
            <span className="text-gray-400">
              {result.score}/10
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================
// Suggestions Display
// ========================================
const SuggestionsDisplay: React.FC<{
  suggestions: string[];
  theme: 'light' | 'dark';
}> = ({ suggestions, theme }) => {
  if (suggestions.length === 0) return null;
  return ();
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">Suggestions</span>
      <div className="space-y-1">
        {suggestions.slice(0, 3).map((suggestion, index) => ()
          <div key={index} className="flex items-start gap-2 text-xs">
            <span className="text-blue-500 mt-0.5">•</span>
            <span className="text-gray-600">{suggestion}</span>
          </div>
        ))}
        {suggestions.length > 3 && ()
          <div className="text-xs text-gray-500 italic">
            +{suggestions.length - 3} more suggestions
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// Additional Info Display
// ========================================
const AdditionalInfoDisplay: React.FC<{
  result: PasswordValidationResult;
  showCrackTime: boolean;
  showEntropy: boolean;
  theme: 'light' | 'dark';
}> = ({ result, showCrackTime, showEntropy, theme }) => {
  if (!showCrackTime && !showEntropy) return null;
  return ();
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
      {showEntropy && result.entropy && ()
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-600">Entropy</span>
          <div className="text-sm text-gray-800">
            {result.entropy.toFixed(1)} bits
          </div>
        </div>
      )}
      {showCrackTime && result.estimatedCrackTime && ()
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-600">Crack Time</span>
          <div className="text-sm text-gray-800">
            <div>Online: {result.estimatedCrackTime.online}</div>
            <div>Offline: {result.estimatedCrackTime.offline}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// Main Password Strength Display
// ========================================
const PasswordStrengthDisplay: React.FC<PasswordStrengthDisplayProps> = ({)
  result,
  showDetails,
  showSuggestions,
  showCrackTime,
  showEntropy,
  compact,
  theme
}) => {
  const hasAdditionalInfo = showCrackTime || showEntropy;
  const hasDetails = showDetails || showSuggestions || hasAdditionalInfo;
  return ();
    <div className={`space-y-3 ${compact ? 'space-y-2' : ''}`}>}
      <StrengthMeter
        score={result.score}
        strength={result.strength}
        compact={compact}
        theme={theme}
      />
      {hasDetails && !compact && ()
        <div className="space-y-3">
          {showDetails && ()
            <RuleResultsDisplay
              ruleResults={result.ruleResults}
              passedRules={result.passedRules}
              totalRules={result.totalRules}
              theme={theme}
            />
          )}
          {showSuggestions && ()
            <SuggestionsDisplay
              suggestions={result.suggestions}
              theme={theme}
            />
          )}
          {hasAdditionalInfo && ()
            <AdditionalInfoDisplay
              result={result}
              showCrackTime={showCrackTime}
              showEntropy={showEntropy}
              theme={theme}
            />
          )}
        </div>
      )}
      {result.errors.length > 0 && ()
        <div className="space-y-1">
          <span className="text-sm font-medium text-red-600">Errors</span>
          <div className="space-y-1">
            {result.errors.map((error, index) => ()
              <div key={index} className="text-xs text-red-600 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.warnings.length > 0 && !compact && ()
        <div className="space-y-1">
          <span className="text-sm font-medium text-amber-600">Warnings</span>
          <div className="space-y-1">
            {result.warnings.map((warning, index) => ()
              <div key={index} className="text-xs text-amber-600 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">⚠</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// Custom Hook for Debounced Validation
// ========================================
const useDebounedValidation = (;);
  password: string,
  validator: PasswordComplexityValidator,
  context?: PasswordValidationContext,
  debounceMs: number = 300,
) => {
  const [result, setResult] = useState<PasswordValidationResult | null>(null);
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
      } catch (error) {
        console.error('Password validation error:', error);
        setResult({)
          valid: false,
          score: 0,
          strength: 'very-weak',
          ruleResults: [],
          errors: ['Validation failed'],
          warnings: [],
          suggestions: [],
          passedRules: 0,
          totalRules: 0,
        });
      } finally {
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

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({)
  password,
  context,
  validator,
  showDetails = true,
  showSuggestions = true,
  showCrackTime = false,
  showEntropy = false,
  compact = false,
  theme = 'auto',
  className = '',
  onValidationChange,
  debounceMs = 300
}) => {
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
  const { result, isValidating } = useDebounedValidation()
    password, 
    passwordValidator, 
    context, 
    debounceMs
  );
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
    return ();
      <div className={`flex items-center gap-2 ${className}`}>}
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Analyzing password...</span>
      </div>
    );
  }
  // Don't render if no result available
  if (!result) {
    return null;
  }
  return ();
    <div className={`password-strength-indicator ${className}`}>}
      <PasswordStrengthDisplay
        result={result}
        showDetails={showDetails}
        showSuggestions={showSuggestions}
        showCrackTime={showCrackTime}
        showEntropy={showEntropy}
        compact={compact}
        theme={resolvedTheme}
      />
    </div>
  );
};

// ========================================
// Simplified Hook for External Use
// ========================================

export const usePasswordStrength = ()
  password: string,
  context?: PasswordValidationContext,
  validator?: PasswordComplexityValidator
) => {
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
    errors: result?.errors || [],
  };
};

// ========================================
// Export Types for External Use
// ========================================

export type {
  PasswordStrengthIndicatorProps,
  PasswordStrengthDisplayProps
};

export default PasswordStrengthIndicator;