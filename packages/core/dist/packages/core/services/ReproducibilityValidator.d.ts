export interface ReproducibilityValidationOptions {
    strictMode?: boolean;
    allowApproximate?: boolean;
    validateChecksums?: boolean;
    checkVersionCompatibility?: boolean;
    requirePerformanceData?: boolean;
}
export interface ReproducibilityValidationReport {
    isValid: boolean;
    exactReproducible: boolean;
    approximateReproducible: boolean;
    errors: ValidationError;
    warnings: ValidationWarning;
    suggestions: ValidationSuggestion;
    integrity: {
        configurationValid: boolean;
        seedsValid: boolean;
        versionCompatible: boolean;
        checksumValid: boolean;
    };
    performance: {
        estimatedReproductionTime: number;
        complexityScore: number;
        memoryRequirement: number;
    };
}
export interface ValidationError {
    code: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    field?: string;
    suggestion?: string;
}
export interface ValidationWarning {
    code: string;
    message: string;
    impact: 'reproducibility' | 'performance' | 'compatibility' | 'quality';
    suggestion?: string;
}
export interface ValidationSuggestion {
    code: string;
    message: string;
    category: 'optimization' | 'enhancement' | 'compatibility' | 'debugging';
    priority: 'high' | 'medium' | 'low';
}
export declare class ReproducibilityValidator {
    private static instance;
    static getInstance(): ReproducibilityValidator;
    if(extraSeeds: any, length: any): any;
}
//# sourceMappingURL=ReproducibilityValidator.d.ts.map