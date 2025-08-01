/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Configurable Password Complexity Rules System
 * Task: T-1752989143997-524 - Implement configurable password complexity rules
 * Epic 19: Authentication Enhancement & Security Hardening
 */

}
}
export interface PasswordComplexityRule { id: string;
    name: string;
    description: string;
    enabled: boolean;
    required: boolean;
    weight: number;
    category: 'length' | 'character' | 'pattern' | 'dictionary' | 'entropy' | 'history';
    severity: 'error' | 'warning' | 'info';
    validate: (password: string, context?: PasswordValidationContext) => PasswordRuleResult }
}
}
export interface PasswordValidationContext { username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    previousPasswords?: string[];
    commonPasswords?: string[];
    personalInfo?: string[];
    organizationName?: string;
    userRole?: string;
    locale?: string }
}
}
export interface PasswordRuleResult { passed: boolean;
    score: number;
    message: string;
    suggestion?: string;
    details?: {
        expected?: unknown;
        actual?: unknown;
        examples?: string[] }
}
    };

}
}
export interface PasswordComplexityConfig { enabled: boolean;
    mode: 'strict' | 'balanced' | 'lenient' | 'custom';
    minimumScore: number;
    rules: PasswordComplexityRule[];
    allowOverrides?: {
        enabled: boolean;
        roles: string[];
        requireJustification: boolean }
}
    };
    breachChecking?: { enabled: boolean;
        sources: ('hibp' | 'internal' | 'custom')[];
        cacheResults: boolean;
        timeoutMs: number };
    customDictionaries?: { enabled: boolean;
        sources: string[];
        categories: string[] };

}
}
export interface PasswordValidationResult { valid: boolean;
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    ruleResults: PasswordRuleResult[];
    errors: string[];
    warnings: string[];
    suggestions: string[];
    estimatedCrackTime?: {
        offline: string;
        online: string;
        unit: string }
}
    };
    entropy?: number;
    passedRules: number;
    totalRules: number;

export declare class PasswordRules { /**
     * Minimum length rule
     */
    static minLength(minLength: number): PasswordComplexityRule;
    /**
     * Maximum length rule (to prevent DoS attacks)
     */
    static maxLength(maxLength: number): PasswordComplexityRule;
    /**
     * Uppercase letter requirement
     */
    static requireUppercase(minCount?: number): PasswordComplexityRule;
    /**
     * Lowercase letter requirement
     */
    static requireLowercase(minCount?: number): PasswordComplexityRule;
    /**
     * Numeric digit requirement
     */
    static requireDigits(minCount?: number): PasswordComplexityRule;
    /**
     * Special character requirement
     */
    static requireSpecialChars(minCount?: number, customChars?: string): PasswordComplexityRule;
    /**
     * No consecutive identical characters
     */
    static noConsecutiveIdentical(maxCount?: number): PasswordComplexityRule;
    /**
     * No common sequences (123, abc, qwerty, etc.)
     */
    static noCommonSequences(): PasswordComplexityRule;
    /**
     * No personal information
     */
    static noPersonalInfo(): PasswordComplexityRule;
    /**
     * Entropy/randomness check
     */
    static minimumEntropy(minEntropy?: number): PasswordComplexityRule;
    /**
     * Password history check
     */
    static notInHistory(historyCount?: number): PasswordComplexityRule;

export declare class PasswordComplexityValidator {
    private config;
    private commonPasswords;
    constructor(config?: Partial<PasswordComplexityConfig>);
    /**
     * Create configuration with defaults
     */
    private createConfig;
    /**
     * Get default rules for different modes
     */
    private getDefaultRules;
    /**
     * Load common passwords list
     */
    private loadCommonPasswords;
    /**
     * Validate password against all configured rules
     */
    validatePassword(password: string, context?: PasswordValidationContext): Promise<PasswordValidationResult>;
    /**
     * Calculate password entropy
     */
    static calculateEntropy(password: string): number;
    /**
     * Check if password is in common passwords list
     */
    private isCommonPassword;
    /**
     * Calculate overall score from rule results
     */
    private calculateOverallScore;
    /**
     * Determine password strength category
     */
    private determineStrength;
    /**
     * Estimate crack time based on entropy
     */
    private estimateCrackTime;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<PasswordComplexityConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): PasswordComplexityConfig;
    /**
     * Add custom rule
     */
    addRule(rule: PasswordComplexityRule): void;
    /**
     * Remove rule
     */
    removeRule(ruleId: string): boolean;
    /**
     * Enable/disable rule
     */
    toggleRule(ruleId: string, enabled: boolean): boolean;
    /**
     * Get rule by ID
     */
    getRule(ruleId: string): PasswordComplexityRule | undefined;
    /**
     * Get all rules by category
     */
    getRulesByCategory(category: PasswordComplexityRule['category']): PasswordComplexityRule[];
    /**
     * Validate configuration
     */
    validateConfig(): {
        valid: boolean;
        errors: string[];
        warnings: string[] };

export default PasswordComplexityValidator;
//# sourceMappingURL=PasswordComplexityValidator.d.ts.map