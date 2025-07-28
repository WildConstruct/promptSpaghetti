import { ExtensionValidationResult } from './interfaces/ExtensionInterfaces';
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
    validateInterfaceCompatibility(extension: any): any;
    requiredInterface: string;
    version?: string;
    ExtensionValidationResult: any;
}
//# sourceMappingURL=ExtensionInterfaceValidator.d.ts.map