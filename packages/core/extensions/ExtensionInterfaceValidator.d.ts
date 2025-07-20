/**
 * Extension Interface Validator - Epic 8.4 Story 8.4.2
 * Advanced interface validation and runtime type checking for extensions
 */
import { z } from 'zod';
import { BaseExtension, ExtensionValidationResult } from './interfaces/ExtensionInterfaces';
export declare class ExtensionInterfaceValidator {
    private static instance;
    private validationCache;
    private schemaCache;
    private constructor();
    static getInstance(): ExtensionInterfaceValidator;
    /**
     * Comprehensive extension validation
     */
    validateExtension(extension: any): Promise<ExtensionValidationResult>;
    /**
     * Validate extension interface compatibility
     */
    validateInterfaceCompatibility(extension: any, requiredInterface: string, version?: string): ExtensionValidationResult;
    /**
     * Validate method signatures
     */
    validateMethodSignatures(extension: any, expectedSignatures: Record<string, MethodSignature>): ExtensionValidationResult;
    /**
     * Validate extension configuration
     */
    validateExtensionConfiguration(extension: any, configSchema?: z.ZodSchema<any>): ExtensionValidationResult;
    /**
     * Validate extension dependencies
     */
    validateExtensionDependencies(extension: any, availableExtensions: Map<string, BaseExtension>): ExtensionValidationResult;
    /**
     * Validate extension permissions
     */
    validateExtensionPermissions(extension: any, grantedPermissions: string[]): ExtensionValidationResult;
    /**
     * Generate validation report
     */
    generateValidationReport(extension: any): ExtensionValidationReport;
    /**
     * Clear validation cache
     */
    clearCache(): void;
    /**
     * Private helper methods
     */
    private performValidation;
    private validateVersionCompatibility;
    private getCacheKey;
    private isAsyncFunction;
    private isValidSemanticVersion;
    private getBaseMethodSignatures;
}
export declare class ExtensionRuntimeTypeChecker {
    private static instance;
    private typeCache;
    private constructor();
    static getInstance(): ExtensionRuntimeTypeChecker;
    /**
     * Check if object implements interface at runtime
     */
    implementsInterface(obj: any, interfaceName: string): boolean;
    /**
     * Get runtime type information
     */
    getTypeInfo(obj: any): RuntimeTypeInfo;
    /**
     * Validate method at runtime
     */
    validateMethod(obj: any, methodName: string, expectedSignature: MethodSignature): boolean;
    /**
     * Create runtime type guard
     */
    createTypeGuard<T>(interfaceName: string): (obj: any) => obj is T;
    private performInterfaceCheck;
    private getRequiredMethods;
    private getObjectMethods;
    private getObjectProperties;
    private isExtension;
    private isAsyncFunction;
}
interface MethodSignature {
    parameterCount?: number;
    parameterTypes?: string[];
    returnType?: string;
    async?: boolean;
}
interface ExtensionValidationReport {
    extensionId: string;
    extensionName: string;
    version: string;
    timestamp: Date;
    overallValid: boolean;
    validations: ValidationResult[];
}
interface ValidationResult {
    name: string;
    valid: boolean;
    errors: string[];
    warnings: string[];
}
interface RuntimeTypeInfo {
    type: string;
    constructor: string;
    prototype: string;
    methods: string[];
    properties: string[];
    isExtension: boolean;
}
export declare const extensionInterfaceValidator: ExtensionInterfaceValidator;
export declare const extensionRuntimeTypeChecker: ExtensionRuntimeTypeChecker;
export {};
//# sourceMappingURL=ExtensionInterfaceValidator.d.ts.map