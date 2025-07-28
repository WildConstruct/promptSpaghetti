export interface PasswordComplexityRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    required: boolean;
    weight: number;
    category: 'length' | 'character' | 'pattern' | 'dictionary' | 'entropy' | 'history';
    severity: 'error' | 'warning' | 'info';
    validate: (password: string, context?: PasswordValidationContext) => PasswordRuleResult;
}
export interface PasswordValidationContext {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    previousPasswords?: string;
    commonPasswords?: string;
    personalInfo?: string;
    organizationName?: string;
    userRole?: string;
    locale?: string;
}
export interface PasswordRuleResult {
    passed: boolean;
    score: number;
    message: string;
    suggestion?: string;
    details?: {
        expected?: unknown;
        actual?: unknown;
        examples?: string;
    };
}
export interface PasswordComplexityConfig {
    enabled: boolean;
    mode: 'strict' | 'balanced' | 'lenient' | 'custom';
    minimumScore: number;
    rules: PasswordComplexityRule;
    allowOverrides?: {
        enabled: boolean;
        roles: string;
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
        sources: string;
        categories: string;
    };
}
export interface PasswordValidationResult {
    valid: boolean;
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    ruleResults: PasswordRuleResult;
    errors: string;
    warnings: string;
    suggestions: string;
    estimatedCrackTime?: {
        offline: string;
        online: string;
        unit: string;
    };
    entropy?: number;
    passedRules: number;
    totalRules: number;
}
export declare class PasswordRules {
    /**
     * Minimum length rule
     */
    static minLength(minLength: number): PasswordComplexityRule;
    enabled: true;
    required: true;
    weight: 8;
    category: 'length';
    severity: 'error';
    validate: (password: string) => ;
    PasswordRuleResult: any;
}
export declare class PasswordComplexityValidator {
    private config;
    private commonPasswords;
    constructor(config?: Partial<PasswordComplexityConfig>);
    /**
    * Create configuration with defaults
    */
    private createConfig;
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
    const combinations: number;
    const avgCombinations: number;
    const offlineSeconds: number;
    const onlineSeconds: number;
    const formatTime: (seconds: number) => string;
    if(seconds: any, : any, : any): any;
}
//# sourceMappingURL=PasswordComplexityValidator.d.ts.map