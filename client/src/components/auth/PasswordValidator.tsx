/**
 * Real-time Password Validator - Epic 19 Implementation
 * Advanced password validation with strength meter, policy enforcement, and security recommendations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription } from '../ui/Alert';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Shield,
  Lock,
  Zap,
  Clock
} from 'lucide-react';

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPasswords: boolean;
  forbidPersonalInfo: boolean;
  maxConsecutiveChars: number;
  minUniqueChars: number;
  forbidRepeatingPatterns: boolean;
}

export interface UserContext {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  previousPasswords?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  checks: ValidationCheck[];
  suggestions: string[];
  estimatedCrackTime: string;
  entropy: number;
}

export interface ValidationCheck {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  weight: number;
  message?: string;
}

interface PasswordValidatorProps {
  password: string;
  policy?: Partial<PasswordPolicy>;
  userContext?: UserContext;
  showStrengthMeter?: boolean;
  showDetailedChecks?: boolean;
  showSuggestions?: boolean;
  showPassword?: boolean;
  onValidationChange?: (result: ValidationResult) => void;
  className?: string;
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidCommonPasswords: true,
  forbidPersonalInfo: true,
  maxConsecutiveChars: 3,
  minUniqueChars: 8,
  forbidRepeatingPatterns: true
};

const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
  'password1', 'admin', 'welcome', 'letmein', 'monkey', 'dragon',
  'passw0rd', 'Password1', 'iloveyou', 'princess', 'rockyou'
];

const STRENGTH_CONFIG = {
  'very-weak': { color: 'red', label: 'Very Weak', min: 0 },
  'weak': { color: 'red', label: 'Weak', min: 20 },
  'fair': { color: 'yellow', label: 'Fair', min: 40 },
  'good': { color: 'blue', label: 'Good', min: 60 },
  'strong': { color: 'green', label: 'Strong', min: 80 },
  'very-strong': { color: 'green', label: 'Very Strong', min: 95 }
};

export function PasswordValidator({
  password,
  policy: customPolicy,
  userContext,
  showStrengthMeter = true,
  showDetailedChecks = true,
  showSuggestions = true,
  showPassword = false,
  onValidationChange,
  className = ''
}: PasswordValidatorProps) {
  const [showPasswordVisible, setShowPasswordVisible] = useState(showPassword);
  const policy = { ...DEFAULT_POLICY, ...customPolicy };

  const validationResult = useMemo(() => {
    return validatePassword(password, policy, userContext);
  }, [password, policy, userContext]);

  useEffect(() => {
    onValidationChange?.(validationResult);
  }, [validationResult, onValidationChange]);

  const strengthConfig = STRENGTH_CONFIG[validationResult.strength];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Strength Meter */}
      {showStrengthMeter && password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Password Strength</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-${strengthConfig.color}-700 border-${strengthConfig.color}-300`}
              >
                {strengthConfig.label}
              </Badge>
              <span className="text-sm text-gray-500">{validationResult.score}/100</span>
            </div>
          </div>
          <Progress 
            value={validationResult.score} 
            className={'h-2 bg-gray-200'}
            indicatorClassName={`bg-${strengthConfig.color}-500`}
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Entropy: {validationResult.entropy.toFixed(1)} bits</span>
            <span>Crack time: {validationResult.estimatedCrackTime}</span>
          </div>
        </div>
      )}

      {/* Password Display */}
      {password && (
        <div className="relative">
          <div className="font-mono text-sm p-3 bg-gray-50 rounded-md border">
            {showPasswordVisible ? password : '•'.repeat(password.length)}
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordVisible(!showPasswordVisible)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Detailed Checks */}
      {showDetailedChecks && password && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Requirements
            </h4>
            <div className="space-y-2">
              {validationResult.checks.map((check) => (
                <div key={check.id} className="flex items-center gap-2">
                  {check.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${check.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {check.label}
                  </span>
                  {check.required && !check.passed && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                  {check.message && (
                    <span className="text-xs text-gray-500 ml-auto">{check.message}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {showSuggestions && validationResult.suggestions.length > 0 && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Suggestions to improve your password:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validationResult.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Warnings */}
      {validationResult.score < 40 && password && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Weak Password Detected!</strong> This password is vulnerable to attacks. 
            Please choose a stronger password to protect your account.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function validatePassword(
  password: string, 
  policy: PasswordPolicy, 
  userContext?: UserContext
): ValidationResult {
  const checks: ValidationCheck[] = [];
  const suggestions: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      isValid: false,
      score: 0,
      strength: 'very-weak',
      checks: [],
      suggestions: ['Enter a password to see strength analysis'],
      estimatedCrackTime: 'Instant',
      entropy: 0
    };
  }

  // Length checks
  const lengthCheck = {
    id: 'length',
    label: `At least ${policy.minLength} characters`,
    passed: password.length >= policy.minLength,
    required: true,
    weight: 20,
    message: `${password.length}/${policy.minLength}`
  };
  checks.push(lengthCheck);
  if (lengthCheck.passed) score += lengthCheck.weight;
  else suggestions.push(`Use at least ${policy.minLength} characters`);

  // Character type checks
  const uppercaseCheck = {
    id: 'uppercase',
    label: 'Contains uppercase letters',
    passed: /[A-Z]/.test(password),
    required: policy.requireUppercase,
    weight: 10
  };
  checks.push(uppercaseCheck);
  if (uppercaseCheck.passed) score += uppercaseCheck.weight;
  else if (policy.requireUppercase) suggestions.push('Add uppercase letters (A-Z)');

  const lowercaseCheck = {
    id: 'lowercase',
    label: 'Contains lowercase letters',
    passed: /[a-z]/.test(password),
    required: policy.requireLowercase,
    weight: 10
  };
  checks.push(lowercaseCheck);
  if (lowercaseCheck.passed) score += lowercaseCheck.weight;
  else if (policy.requireLowercase) suggestions.push('Add lowercase letters (a-z)');

  const numbersCheck = {
    id: 'numbers',
    label: 'Contains numbers',
    passed: /[0-9]/.test(password),
    required: policy.requireNumbers,
    weight: 10
  };
  checks.push(numbersCheck);
  if (numbersCheck.passed) score += numbersCheck.weight;
  else if (policy.requireNumbers) suggestions.push('Add numbers (0-9)');

  const specialCharsCheck = {
    id: 'special',
    label: 'Contains special characters',
    passed: /[^A-Za-z0-9]/.test(password),
    required: policy.requireSpecialChars,
    weight: 15
  };
  checks.push(specialCharsCheck);
  if (specialCharsCheck.passed) score += specialCharsCheck.weight;
  else if (policy.requireSpecialChars) suggestions.push('Add special characters (!@#$%^&*)');

  // Advanced security checks
  const commonPasswordCheck = {
    id: 'common',
    label: 'Not a common password',
    passed: !COMMON_PASSWORDS.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    ),
    required: policy.forbidCommonPasswords,
    weight: 15
  };
  checks.push(commonPasswordCheck);
  if (commonPasswordCheck.passed) score += commonPasswordCheck.weight;
  else suggestions.push('Avoid common passwords and dictionary words');

  // Personal info check
  if (userContext && policy.forbidPersonalInfo) {
    const personalInfo = [
      userContext.email?.split('@')[0],
      userContext.firstName,
      userContext.lastName,
      userContext.username
    ].filter(Boolean);

    const personalInfoCheck = {
      id: 'personal',
      label: 'Does not contain personal information',
      passed: !personalInfo.some(info => 
        info && password.toLowerCase().includes(info.toLowerCase())
      ),
      required: true,
      weight: 10
    };
    checks.push(personalInfoCheck);
    if (personalInfoCheck.passed) score += personalInfoCheck.weight;
    else suggestions.push('Avoid using your name, email, or username');
  }

  // Consecutive characters check
  const consecutiveCheck = {
    id: 'consecutive',
    label: `No more than ${policy.maxConsecutiveChars} consecutive identical characters`,
    passed: !hasConsecutiveChars(password, policy.maxConsecutiveChars),
    required: true,
    weight: 5
  };
  checks.push(consecutiveCheck);
  if (consecutiveCheck.passed) score += consecutiveCheck.weight;
  else suggestions.push('Avoid repeating the same character consecutively');

  // Unique characters check
  const uniqueChars = new Set(password).size;
  const uniqueCheck = {
    id: 'unique',
    label: `At least ${policy.minUniqueChars} unique characters`,
    passed: uniqueChars >= policy.minUniqueChars,
    required: true,
    weight: 10,
    message: `${uniqueChars}/${policy.minUniqueChars}`
  };
  checks.push(uniqueCheck);
  if (uniqueCheck.passed) score += uniqueCheck.weight;
  else suggestions.push('Use more unique characters');

  // Repeating patterns check
  if (policy.forbidRepeatingPatterns) {
    const patternCheck = {
      id: 'patterns',
      label: 'No obvious repeating patterns',
      passed: !hasRepeatingPatterns(password),
      required: true,
      weight: 5
    };
    checks.push(patternCheck);
    if (patternCheck.passed) score += patternCheck.weight;
    else suggestions.push('Avoid predictable patterns like "abc123" or "password1"');
  }

  // Calculate entropy
  const entropy = calculateEntropy(password);
  
  // Bonus points for length beyond minimum
  if (password.length > policy.minLength) {
    const lengthBonus = Math.min((password.length - policy.minLength) * 2, 15);
    score += lengthBonus;
  }

  // Determine strength based on score
  let strength: ValidationResult['strength'] = 'very-weak';
  if (score >= 95) strength = 'very-strong';
  else if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'good';
  else if (score >= 40) strength = 'fair';
  else if (score >= 20) strength = 'weak';

  // Estimate crack time
  const estimatedCrackTime = estimateCrackTime(entropy);

  // Final validation
  const requiredChecks = checks.filter(c => c.required);
  const passedRequiredChecks = requiredChecks.filter(c => c.passed);
  const isValid = passedRequiredChecks.length === requiredChecks.length;

  return {
    isValid,
    score: Math.min(score, 100),
    strength,
    checks,
    suggestions,
    estimatedCrackTime,
    entropy
  };
}

function hasConsecutiveChars(password: string, maxConsecutive: number): boolean {
  let count = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      count++;
      if (count > maxConsecutive) return true;
    } else {
      count = 1;
    }
  }
  return false;
}

function hasRepeatingPatterns(password: string): boolean {
  // Check for keyboard patterns, sequences, and simple repeating patterns
  const patterns = [
    'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'abcdef', '123456', '987654', 'abc123', '123abc'
  ];
  
  const lower = password.toLowerCase();
  return patterns.some(pattern => lower.includes(pattern));
}

function calculateEntropy(password: string): number {
  // Calculate character set size
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // Approximate special chars
  
  // Shannon entropy approximation
  return password.length * Math.log2(charsetSize);
}

function estimateCrackTime(entropy: number): string {
  // Approximate time for brute force attack (assuming 1 billion attempts per second)
  const attempts = Math.pow(2, entropy - 1); // Half the keyspace on average
  const secondsPerAttempt = 1e-9; // 1 nanosecond per attempt
  const seconds = attempts * secondsPerAttempt;
  
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
  return 'Centuries';
}