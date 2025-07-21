/**
 * Configurable Password Complexity Rules System
 * Task: T-1752989143997-524 - Implement configurable password complexity rules
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import { z } from 'zod';

// ========================================
// Types and Interfaces
// ========================================

export interface PasswordComplexityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  weight: number; // For scoring (1-10)
  category: 'length' | 'character' | 'pattern' | 'dictionary' | 'entropy' | 'history';
  severity: 'error' | 'warning' | 'info';
  validate: (password: string, context?: PasswordValidationContext) => PasswordRuleResult;
}

export interface PasswordValidationContext {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  previousPasswords?: string[];
  commonPasswords?: string[];
  personalInfo?: string[];
  organizationName?: string;
  userRole?: string;
  locale?: string;
}

export interface PasswordRuleResult {
  passed: boolean;
  score: number; // 0-10 scale
  message: string;
  suggestion?: string;
  details?: {
    expected?: any;
    actual?: any;
    examples?: string[];
  };
}

export interface PasswordComplexityConfig {
  enabled: boolean;
  mode: 'strict' | 'balanced' | 'lenient' | 'custom';
  minimumScore: number; // Overall minimum score required (0-100)
  rules: PasswordComplexityRule[];
  allowOverrides?: {
    enabled: boolean;
    roles: string[];
    requireJustification: boolean;
  };
  breachChecking?: {
    enabled: boolean;
    sources: ('hibp' | 'internal' | 'custom')[];
    cacheResults: boolean;
    timeoutMs: number;
  };
  customDictionaries?: {
    enabled: boolean;
    sources: string[];
    categories: string[];
  };
}

export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0-100 overall score
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  ruleResults: PasswordRuleResult[];
  errors: string[];
  warnings: string[];
  suggestions: string[];
  estimatedCrackTime?: {
    offline: string;
    online: string;
    unit: string;
  };
  entropy?: number;
  passedRules: number;
  totalRules: number;
}

// ========================================
// Validation Schemas
// ========================================

const PasswordComplexityRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean(),
  required: z.boolean(),
  weight: z.number().min(1).max(10),
  category: z.enum(['length', 'character', 'pattern', 'dictionary', 'entropy', 'history']),
  severity: z.enum(['error', 'warning', 'info'])
});

const PasswordComplexityConfigSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(['strict', 'balanced', 'lenient', 'custom']),
  minimumScore: z.number().min(0).max(100),
  rules: z.array(PasswordComplexityRuleSchema),
  allowOverrides: z.object({
    enabled: z.boolean(),
    roles: z.array(z.string()),
    requireJustification: z.boolean()
  }).optional(),
  breachChecking: z.object({
    enabled: z.boolean(),
    sources: z.array(z.enum(['hibp', 'internal', 'custom'])),
    cacheResults: z.boolean(),
    timeoutMs: z.number().min(1000).max(30000)
  }).optional(),
  customDictionaries: z.object({
    enabled: z.boolean(),
    sources: z.array(z.string()),
    categories: z.array(z.string())
  }).optional()
});

// ========================================
// Built-in Password Rules
// ========================================

export class PasswordRules {
  /**
   * Minimum length rule
   */
  static minLength(minLength: number): PasswordComplexityRule {
    return {
      id: 'min-length',
      name: 'Minimum Length',
      description: `Password must be at least ${minLength} characters long`,
      enabled: true,
      required: true,
      weight: 8,
      category: 'length',
      severity: 'error',
      validate: (password: string): PasswordRuleResult => {
        const passed = password.length >= minLength;
        const score = Math.min(10, (password.length / minLength) * 6);
        
        return {
          passed,
          score: passed ? score : 0,
          message: passed 
            ? `Length requirement met (${password.length} characters)`
            : `Password too short (${password.length}/${minLength} characters)`,
          suggestion: passed ? undefined : `Add ${minLength - password.length} more characters`,
          details: {
            expected: minLength,
            actual: password.length
          }
        };
      }
    };
  }

  /**
   * Maximum length rule (to prevent DoS attacks)
   */
  static maxLength(maxLength: number): PasswordComplexityRule {
    return {
      id: 'max-length',
      name: 'Maximum Length',
      description: `Password must not exceed ${maxLength} characters`,
      enabled: true,
      required: true,
      weight: 2,
      category: 'length',
      severity: 'error',
      validate: (password: string): PasswordRuleResult => {
        const passed = password.length <= maxLength;
        
        return {
          passed,
          score: passed ? 10 : 0,
          message: passed 
            ? 'Length within acceptable range'
            : `Password too long (${password.length}/${maxLength} characters)`,
          suggestion: passed ? undefined : `Remove ${password.length - maxLength} characters`,
          details: {
            expected: maxLength,
            actual: password.length
          }
        };
      }
    };
  }

  /**
   * Uppercase letter requirement
   */
  static requireUppercase(minCount: number = 1): PasswordComplexityRule {
    return {
      id: 'require-uppercase',
      name: 'Uppercase Letters',
      description: `Password must contain at least ${minCount} uppercase letter(s)`,
      enabled: true,
      required: true,
      weight: 6,
      category: 'character',
      severity: 'error',
      validate: (password: string): PasswordRuleResult => {
        const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
        const passed = uppercaseCount >= minCount;
        const score = Math.min(10, (uppercaseCount / minCount) * 7);
        
        return {
          passed,
          score: passed ? score : 0,
          message: passed 
            ? `Uppercase requirement met (${uppercaseCount} found)`
            : `Not enough uppercase letters (${uppercaseCount}/${minCount})`,
          suggestion: passed ? undefined : `Add ${minCount - uppercaseCount} uppercase letter(s)`,
          details: {
            expected: minCount,
            actual: uppercaseCount,
            examples: ['A', 'B', 'C', 'Z']
          }
        };
      }
    };
  }

  /**
   * Lowercase letter requirement
   */
  static requireLowercase(minCount: number = 1): PasswordComplexityRule {
    return {
      id: 'require-lowercase',
      name: 'Lowercase Letters',
      description: `Password must contain at least ${minCount} lowercase letter(s)`,
      enabled: true,
      required: true,
      weight: 6,
      category: 'character',
      severity: 'error',
      validate: (password: string): PasswordRuleResult => {
        const lowercaseCount = (password.match(/[a-z]/g) || []).length;
        const passed = lowercaseCount >= minCount;
        const score = Math.min(10, (lowercaseCount / minCount) * 7);
        
        return {
          passed,
          score: passed ? score : 0,
          message: passed 
            ? `Lowercase requirement met (${lowercaseCount} found)`
            : `Not enough lowercase letters (${lowercaseCount}/${minCount})`,
          suggestion: passed ? undefined : `Add ${minCount - lowercaseCount} lowercase letter(s)`,
          details: {
            expected: minCount,
            actual: lowercaseCount,
            examples: ['a', 'b', 'c', 'z']
          }
        };
      }
    };
  }

  /**
   * Numeric digit requirement
   */
  static requireDigits(minCount: number = 1): PasswordComplexityRule {
    return {
      id: 'require-digits',
      name: 'Numeric Digits',
      description: `Password must contain at least ${minCount} numeric digit(s)`,
      enabled: true,
      required: true,
      weight: 6,
      category: 'character',
      severity: 'error',
      validate: (password: string): PasswordRuleResult => {
        const digitCount = (password.match(/[0-9]/g) || []).length;
        const passed = digitCount >= minCount;
        const score = Math.min(10, (digitCount / minCount) * 7);
        
        return {
          passed,
          score: passed ? score : 0,
          message: passed 
            ? `Digit requirement met (${digitCount} found)`
            : `Not enough digits (${digitCount}/${minCount})`,
          suggestion: passed ? undefined : `Add ${minCount - digitCount} digit(s)`,
          details: {
            expected: minCount,
            actual: digitCount,
            examples: ['0', '1', '5', '9']
          }
        };
      }
    };
  }

  /**
   * Special character requirement
   */
  static requireSpecialChars(minCount: number = 1, customChars?: string): PasswordComplexityRule {
    const specialChars = customChars || '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    return {
      id: 'require-special-chars',
      name: 'Special Characters',
      description: `Password must contain at least ${minCount} special character(s)`,
      enabled: true,
      required: true,
      weight: 7,
      category: 'character',
      severity: 'error',
      validate: (password: string): PasswordRuleResult => {
        const specialCharPattern = new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
        const specialCharCount = (password.match(specialCharPattern) || []).length;
        const passed = specialCharCount >= minCount;
        const score = Math.min(10, (specialCharCount / minCount) * 8);
        
        return {
          passed,
          score: passed ? score : 0,
          message: passed 
            ? `Special character requirement met (${specialCharCount} found)`
            : `Not enough special characters (${specialCharCount}/${minCount})`,
          suggestion: passed ? undefined : `Add ${minCount - specialCharCount} special character(s)`,
          details: {
            expected: minCount,
            actual: specialCharCount,
            examples: ['!', '@', '#', '$', '%', '^', '&', '*']
          }
        };
      }
    };
  }

  /**
   * No consecutive identical characters
   */
  static noConsecutiveIdentical(maxCount: number = 2): PasswordComplexityRule {
    return {
      id: 'no-consecutive-identical',
      name: 'No Consecutive Identical Characters',
      description: `Password cannot contain more than ${maxCount} consecutive identical characters`,
      enabled: true,
      required: false,
      weight: 4,
      category: 'pattern',
      severity: 'warning',
      validate: (password: string): PasswordRuleResult => {
        const consecutivePattern = new RegExp(`(.)\\1{${maxCount},}`, 'g');
        const matches = password.match(consecutivePattern);
        const passed = !matches;
        
        return {
          passed,
          score: passed ? 10 : 3,
          message: passed 
            ? 'No consecutive identical characters found'
            : `Contains consecutive identical characters: ${matches?.join(', ')}`,
          suggestion: passed ? undefined : 'Replace consecutive identical characters with varied characters',
          details: {
            expected: `Max ${maxCount} consecutive`,
            actual: matches?.length || 0
          }
        };
      }
    };
  }

  /**
   * No common sequences (123, abc, qwerty, etc.)
   */
  static noCommonSequences(): PasswordComplexityRule {
    const sequences = [
      '123', '234', '345', '456', '567', '678', '789', '890',
      'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
      'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
      'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
      'zxc', 'xcv', 'cvb', 'vbn', 'bnm'
    ];
    
    return {
      id: 'no-common-sequences',
      name: 'No Common Sequences',
      description: 'Password cannot contain common sequences like 123, abc, or qwerty',
      enabled: true,
      required: false,
      weight: 5,
      category: 'pattern',
      severity: 'warning',
      validate: (password: string): PasswordRuleResult => {
        const lowerPassword = password.toLowerCase();
        const foundSequences = sequences.filter(seq => lowerPassword.includes(seq));
        const passed = foundSequences.length === 0;
        
        return {
          passed,
          score: passed ? 10 : Math.max(2, 10 - foundSequences.length * 2),
          message: passed 
            ? 'No common sequences found'
            : `Contains common sequences: ${foundSequences.join(', ')}`,
          suggestion: passed ? undefined : 'Replace common sequences with random character combinations',
          details: {
            expected: 'No common sequences',
            actual: foundSequences
          }
        };
      }
    };
  }

  /**
   * No personal information
   */
  static noPersonalInfo(): PasswordComplexityRule {
    return {
      id: 'no-personal-info',
      name: 'No Personal Information',
      description: 'Password cannot contain personal information like name, email, or username',
      enabled: true,
      required: true,
      weight: 8,
      category: 'dictionary',
      severity: 'error',
      validate: (password: string, context?: PasswordValidationContext): PasswordRuleResult => {
        if (!context) {
          return {
            passed: true,
            score: 10,
            message: 'No personal information to check against'
          };
        }

        const lowerPassword = password.toLowerCase();
        const personalInfo = [
          context.username,
          context.email?.split('@')[0],
          context.firstName,
          context.lastName,
          context.organizationName,
          ...(context.personalInfo || [])
        ].filter(Boolean).map(info => info!.toLowerCase());

        const foundInfo = personalInfo.filter(info => 
          info.length >= 3 && lowerPassword.includes(info)
        );

        const passed = foundInfo.length === 0;
        
        return {
          passed,
          score: passed ? 10 : Math.max(1, 10 - foundInfo.length * 3),
          message: passed 
            ? 'No personal information found'
            : `Contains personal information: ${foundInfo.join(', ')}`,
          suggestion: passed ? undefined : 'Remove personal information and use unrelated words or phrases',
          details: {
            expected: 'No personal information',
            actual: foundInfo
          }
        };
      }
    };
  }

  /**
   * Entropy/randomness check
   */
  static minimumEntropy(minEntropy: number = 50): PasswordComplexityRule {
    return {
      id: 'minimum-entropy',
      name: 'Minimum Entropy',
      description: `Password must have at least ${minEntropy} bits of entropy`,
      enabled: true,
      required: false,
      weight: 9,
      category: 'entropy',
      severity: 'warning',
      validate: (password: string): PasswordRuleResult => {
        const entropy = PasswordComplexityValidator.calculateEntropy(password);
        const passed = entropy >= minEntropy;
        const score = Math.min(10, (entropy / minEntropy) * 10);
        
        return {
          passed,
          score: passed ? score : Math.max(1, score),
          message: passed 
            ? `Entropy requirement met (${entropy.toFixed(1)} bits)`
            : `Low entropy (${entropy.toFixed(1)}/${minEntropy} bits)`,
          suggestion: passed ? undefined : 'Increase randomness by mixing character types and avoiding patterns',
          details: {
            expected: minEntropy,
            actual: Math.round(entropy * 10) / 10
          }
        };
      }
    };
  }

  /**
   * Password history check
   */
  static notInHistory(historyCount: number = 5): PasswordComplexityRule {
    return {
      id: 'not-in-history',
      name: 'Not in Password History',
      description: `Password cannot be the same as any of the last ${historyCount} passwords`,
      enabled: true,
      required: true,
      weight: 7,
      category: 'history',
      severity: 'error',
      validate: (password: string, context?: PasswordValidationContext): PasswordRuleResult => {
        if (!context?.previousPasswords || context.previousPasswords.length === 0) {
          return {
            passed: true,
            score: 10,
            message: 'No password history to check against'
          };
        }

        const recentPasswords = context.previousPasswords.slice(0, historyCount);
        const isReused = recentPasswords.includes(password);
        
        return {
          passed: !isReused,
          score: isReused ? 0 : 10,
          message: isReused 
            ? 'Password matches a recently used password'
            : 'Password is not in recent history',
          suggestion: isReused ? 'Choose a password you have not used recently' : undefined,
          details: {
            expected: `Not in last ${historyCount} passwords`,
            actual: isReused ? 'Found in history' : 'Not in history'
          }
        };
      }
    };
  }
}

// ========================================
// Password Complexity Validator
// ========================================

export class PasswordComplexityValidator {
  private config: PasswordComplexityConfig;
  private commonPasswords: Set<string> = new Set();

  constructor(config?: Partial<PasswordComplexityConfig>) {
    this.config = this.createConfig(config);
    this.loadCommonPasswords();
  }

  /**
   * Create configuration with defaults
   */
  private createConfig(customConfig?: Partial<PasswordComplexityConfig>): PasswordComplexityConfig {
    // Determine the mode first (custom config takes precedence)
    const mode = customConfig?.mode || 'balanced';
    
    const defaultConfig: PasswordComplexityConfig = {
      enabled: true,
      mode: 'balanced',
      minimumScore: 70,
      rules: this.getDefaultRules(mode), // Use the actual mode
      allowOverrides: {
        enabled: false,
        roles: ['admin', 'security-officer'],
        requireJustification: true
      },
      breachChecking: {
        enabled: true,
        sources: ['hibp'],
        cacheResults: true,
        timeoutMs: 5000
      },
      customDictionaries: {
        enabled: false,
        sources: [],
        categories: []
      }
    };

    const config = { ...defaultConfig, ...customConfig };
    
    // If rules weren't provided in customConfig, ensure they match the mode
    if (!customConfig?.rules) {
      config.rules = this.getDefaultRules(config.mode);
    }
    
    return config;
  }

  /**
   * Get default rules for different modes
   */
  private getDefaultRules(mode: string): PasswordComplexityRule[] {
    switch (mode) {
    case 'strict':
      return [
        PasswordRules.minLength(12),
        PasswordRules.maxLength(128),
        PasswordRules.requireUppercase(2),
        PasswordRules.requireLowercase(2),
        PasswordRules.requireDigits(2),
        PasswordRules.requireSpecialChars(2),
        PasswordRules.noConsecutiveIdentical(2),
        PasswordRules.noCommonSequences(),
        PasswordRules.noPersonalInfo(),
        PasswordRules.minimumEntropy(60),
        PasswordRules.notInHistory(10)
      ];

    case 'balanced':
      return [
        PasswordRules.minLength(8),
        PasswordRules.maxLength(128),
        PasswordRules.requireUppercase(1),
        PasswordRules.requireLowercase(1),
        PasswordRules.requireDigits(1),
        PasswordRules.requireSpecialChars(1),
        PasswordRules.noConsecutiveIdentical(3),
        PasswordRules.noCommonSequences(),
        PasswordRules.noPersonalInfo(),
        PasswordRules.minimumEntropy(40),
        PasswordRules.notInHistory(5)
      ];

    case 'lenient':
      return [
        PasswordRules.minLength(6),
        PasswordRules.maxLength(128),
        PasswordRules.requireUppercase(1),
        PasswordRules.requireLowercase(1),
        PasswordRules.requireDigits(1),
        PasswordRules.noPersonalInfo(),
        PasswordRules.notInHistory(3)
      ];

    default:
      return [];
    }
  }

  /**
   * Load common passwords list
   */
  private loadCommonPasswords(): void {
    // In a real implementation, this would load from a file or API
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'hello', 'freedom', 'whatever',
      'qazwsx', 'trustno1', 'jordan23', 'harley', 'robert'
    ];

    commonPasswords.forEach(pwd => this.commonPasswords.add(pwd.toLowerCase()));
  }

  /**
   * Validate password against all configured rules
   */
  async validatePassword(
    password: string, 
    context?: PasswordValidationContext
  ): Promise<PasswordValidationResult> {
    if (!this.config.enabled) {
      return {
        valid: true,
        score: 100,
        strength: 'very-strong',
        ruleResults: [],
        errors: [],
        warnings: [],
        suggestions: [],
        passedRules: 0,
        totalRules: 0
      };
    }

    const ruleResults: PasswordRuleResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate against all enabled rules
    for (const rule of this.config.rules) {
      if (!rule.enabled) continue;

      try {
        const result = rule.validate(password, context);
        ruleResults.push(result);

        if (!result.passed) {
          if (rule.severity === 'error' && rule.required) {
            errors.push(result.message);
          } else if (rule.severity === 'warning') {
            warnings.push(result.message);
          }

          if (result.suggestion) {
            suggestions.push(result.suggestion);
          }
        }
      } catch (error) {
        console.error(`Error validating rule ${rule.id}:`, error);
        ruleResults.push({
          passed: false,
          score: 0,
          message: `Rule validation failed: ${rule.name}`
        });
      }
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common');
      suggestions.push('Choose a more unique password');
    }

    // Calculate overall score
    const score = this.calculateOverallScore(ruleResults);
    const strength = this.determineStrength(score);
    const valid = errors.length === 0 && score >= this.config.minimumScore;

    // Calculate entropy and crack time estimates
    const entropy = PasswordComplexityValidator.calculateEntropy(password);
    const crackTime = this.estimateCrackTime(entropy);

    const passedRules = ruleResults.filter(r => r.passed).length;
    const totalRules = ruleResults.length;

    return {
      valid,
      score,
      strength,
      ruleResults,
      errors,
      warnings,
      suggestions: [...new Set(suggestions)], // Remove duplicates
      estimatedCrackTime: crackTime,
      entropy,
      passedRules,
      totalRules
    };
  }

  /**
   * Calculate password entropy
   */
  static calculateEntropy(password: string): number {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

    return password.length * Math.log2(charsetSize);
  }

  /**
   * Check if password is in common passwords list
   */
  private isCommonPassword(password: string): boolean {
    return this.commonPasswords.has(password.toLowerCase());
  }

  /**
   * Calculate overall score from rule results
   */
  private calculateOverallScore(ruleResults: PasswordRuleResult[]): number {
    if (ruleResults.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    for (const result of ruleResults) {
      const rule = this.config.rules.find(r => r.id === result.message.split(' ')[0]);
      const weight = rule?.weight || 5;
      
      totalScore += result.score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 10) : 0;
  }

  /**
   * Determine password strength category
   */
  private determineStrength(score: number): PasswordValidationResult['strength'] {
    if (score >= 90) return 'very-strong';
    if (score >= 75) return 'strong';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'weak';
    return 'very-weak';
  }

  /**
   * Estimate crack time based on entropy
   */
  private estimateCrackTime(entropy: number): {
    offline: string;
    online: string;
    unit: string;
  } {
    const combinations = Math.pow(2, entropy);
    const avgCombinations = combinations / 2;

    // Offline cracking (1 billion guesses per second)
    const offlineSeconds = avgCombinations / 1e9;
    
    // Online cracking (1000 guesses per second with rate limiting)
    const onlineSeconds = avgCombinations / 1000;

    const formatTime = (seconds: number): string => {
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
      return `${Math.round(seconds / 31536000)} years`;
    };

    return {
      offline: formatTime(offlineSeconds),
      online: formatTime(onlineSeconds),
      unit: 'average time'
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PasswordComplexityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): PasswordComplexityConfig {
    return { ...this.config };
  }

  /**
   * Add custom rule
   */
  addRule(rule: PasswordComplexityRule): void {
    const existingIndex = this.config.rules.findIndex(r => r.id === rule.id);
    if (existingIndex >= 0) {
      this.config.rules[existingIndex] = rule;
    } else {
      this.config.rules.push(rule);
    }
  }

  /**
   * Remove rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.config.rules.findIndex(r => r.id === ruleId);
    if (index >= 0) {
      this.config.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Enable/disable rule
   */
  toggleRule(ruleId: string, enabled: boolean): boolean {
    const rule = this.config.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): PasswordComplexityRule | undefined {
    return this.config.rules.find(r => r.id === ruleId);
  }

  /**
   * Get all rules by category
   */
  getRulesByCategory(category: PasswordComplexityRule['category']): PasswordComplexityRule[] {
    return this.config.rules.filter(r => r.category === category);
  }

  /**
   * Validate configuration
   */
  validateConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      PasswordComplexityConfigSchema.parse(this.config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `Configuration error: ${e.path.join('.')} - ${e.message}`));
      }
    }

    // Check for conflicting rules
    const lengthRules = this.getRulesByCategory('length');
    const minLengthRule = lengthRules.find(r => r.id === 'min-length');
    const maxLengthRule = lengthRules.find(r => r.id === 'max-length');

    if (minLengthRule && maxLengthRule) {
      const minLength = 8; // Would extract from rule configuration
      const maxLength = 128; // Would extract from rule configuration
      if (minLength >= maxLength) {
        errors.push('Minimum length cannot be greater than or equal to maximum length');
      }
    }

    // Check for missing required rules
    const requiredCategories = ['length', 'character'];
    for (const category of requiredCategories) {
      const categoryRules = this.getRulesByCategory(category as any);
      if (categoryRules.length === 0) {
        warnings.push(`No rules defined for required category: ${category}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default PasswordComplexityValidator;