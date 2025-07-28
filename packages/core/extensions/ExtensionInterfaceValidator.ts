/**
 * Extension Interface Validator - Epic 8.4 Story 8.4.2
 * Advanced interface validation and runtime type checking for extensions
 */
import { z } from 'zod';
import { 
  BaseExtension, 
  ExtensionValidationResult,
  ExtensionError,
  ExtensionErrorType
} from './interfaces/ExtensionInterfaces';
import { extensionTypeChecker } from './TypeDefinitions';

// Enhanced Interface Validator
export class ExtensionInterfaceValidator {
  private static instance: ExtensionInterfaceValidator;
  private validationCache: Map<string, ExtensionValidationResult> = new Map();
  private schemaCache: Map<string, z.ZodSchema<any>> = new Map();
  private constructor() {}
  public static getInstance(): ExtensionInterfaceValidator {
    if (!ExtensionInterfaceValidator.instance) {
      ExtensionInterfaceValidator.instance = new ExtensionInterfaceValidator();
    }
    return ExtensionInterfaceValidator.instance;
  }
  /**
   * Comprehensive extension validation
   */
  public async validateExtension(extension: any): Promise<ExtensionValidationResult> {
    const cacheKey = this.getCacheKey(extension);
    // Check cache first
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }
    const result = await this.performValidation(extension);
    // Cache result
    this.validationCache.set(cacheKey, result);
    return result;
  }
  /**
   * Validate extension interface compatibility
   */
  public validateInterfaceCompatibility()
    extension: any,
    requiredInterface: string,
    version?: string
  ): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Type validation
    const typeValidation = extensionTypeChecker.validateExtensionType(extension);
    if (!typeValidation.valid) {
      errors.push(...typeValidation.errors);
    }
    // Interface validation
    const interfaceValidation = this.validateInterface(;)
      extension,
      requiredInterface
    );
    if (!interfaceValidation.valid) {
      errors.push(...interfaceValidation.missingMethods.map(m => `Missing method: ${m}`));}
      errors.push(...interfaceValidation.invalidMethods.map(m => `Invalid method: ${m}`));}
    }
    // Version compatibility
    if (version && extension.version) {
      const versionCompatibility = this.validateVersionCompatibility(extension.version, version);
      if (!versionCompatibility.valid) {
        errors.push(...versionCompatibility.errors);
        warnings.push(...versionCompatibility.warnings);
      }
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate method signatures
   */
  public validateMethodSignatures()
    extension: any,
    expectedSignatures: Record<string, MethodSignature>
  ): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    for (const [methodName, signature] of Object.entries(expectedSignatures)) {
      const method = extension[methodName];
      if (typeof method !== 'function') {
        errors.push(`Method ${methodName} is not a function`);}
        continue;
      }
      // Check parameter count
      if (signature.parameterCount !== undefined && method.length !== signature.parameterCount) {
        errors.push(`Method ${methodName} expects ${signature.parameterCount} parameters, got ${method.length}`);}
      }
      // Check return type (basic validation)
      if (signature.returnType) {
        // This would require more advanced runtime type checking
        // For now, we'll just validate that it's a function
        if (signature.async && !this.isAsyncFunction(method)) {
          warnings.push(`Method ${methodName} should be async`);}
        }
      }
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate extension configuration
   */
  public validateExtensionConfiguration()
    extension: any,
    configSchema?: z.ZodSchema<any>
  ): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    try {
      const config = extension.getConfiguration();
      if (configSchema) {
        const result = configSchema.safeParse(config);
        if (!result.success) {
          errors.push(...result.error.issues.map(issue => )
            `Config validation error: ${issue.path.join('.')} - ${issue.message}`}
          ));
        }
      }
      // Validate configuration structure
      if (config && typeof config === 'object') {
        // Check for common configuration patterns
        const commonFields = ['enabled', 'debug', 'timeout', 'retries'];
        for (const field of commonFields) {
          if (config.hasOwnProperty(field)) {
            const value = config[field];
            if (field === 'enabled' && typeof value !== 'boolean') {
              warnings.push(`Configuration field '${field}' should be boolean`);}
            }
            if ((field === 'timeout' || field === 'retries') && typeof value !== 'number') {
              warnings.push(`Configuration field '${field}' should be number`);}
            }
          }
        }
      }
    } catch (error) {
      errors.push(`Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`);}
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate extension dependencies
   */
  public validateExtensionDependencies()
    extension: any,
    availableExtensions: Map<string, BaseExtension>
  ): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!extension.dependencies || extension.dependencies.length === 0) {
      return { valid: true, errors: [], warnings: [] };
    }
    for (const dependency of extension.dependencies) {
      const dependencyExtension = availableExtensions.get(dependency);
      if (!dependencyExtension) {
        errors.push(`Missing dependency: ${dependency}`);}
        continue;
      }
      // Check dependency version compatibility
      const dependencyVersion = dependencyExtension.version;
      const extensionVersion = extension.version;
      if (dependencyVersion && extensionVersion) {
        const compatibility = this.validateVersionCompatibility(dependencyVersion, extensionVersion);
        if (!compatibility.valid) {
          warnings.push(`Dependency ${dependency} version compatibility issues: ${compatibility.errors.join(', ')}`);}
        }
      }
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate extension permissions
   */
  public validateExtensionPermissions()
    extension: any,
    grantedPermissions: string[],
  ): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!extension.permissions || extension.permissions.length === 0) {
      return { valid: true, errors: [], warnings: [] };
    }
    for (const permission of extension.permissions) {
      if (!grantedPermissions.includes(permission)) {
        errors.push(`Permission not granted: ${permission}`);}
      }
      // Check for dangerous permissions
      const dangerousPermissions = ['file-system', 'network', 'process', 'eval'];
      if (dangerousPermissions.includes(permission)) {
        warnings.push(`Dangerous permission requested: ${permission}`);}
      }
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Generate validation report
   */
  public generateValidationReport(extension: any): ExtensionValidationReport {
    const report: ExtensionValidationReport = {
      extensionId: extension.id || 'unknown',
      extensionName: extension.name || 'Unknown',
      version: extension.version || '0.0.0',
      timestamp: new Date(),
      overallValid: true,
      validations: [],
    };
    // Run all validations
    const validations = [;
      { name: 'Type Validation', result: extensionTypeChecker.validateExtensionType(extension) },
      { name: 'Interface Validation', result: this.validateInterfaceCompatibility(extension, 'BaseExtension') },
      { name: 'Configuration Validation', result: this.validateExtensionConfiguration(extension) },
      { name: 'Method Signatures', result: this.validateMethodSignatures(extension, this.getBaseMethodSignatures()) }
    ];
    for (const validation of validations) {
      report.validations.push({)
        name: validation.name,
        valid: validation.result.valid,
        errors: validation.result.errors || [],
        warnings: validation.result.warnings || []
      });
      if (!validation.result.valid) {
        report.overallValid = false;
      }
    }
    return report;
  }
  /**
   * Clear validation cache
   */
  public clearCache(): void {
    this.validationCache.clear();
    this.schemaCache.clear();
  }
  /**
   * Private helper methods
   */
  private async performValidation(extension: any): Promise<ExtensionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Basic structure validation
    if (!extension.id) errors.push('Extension ID is required');
    if (!extension.name) errors.push('Extension name is required');
    if (!extension.version) errors.push('Extension version is required');
    // Lifecycle method validation
    const requiredMethods = ['initialize', 'activate', 'deactivate', 'dispose'];
    for (const method of requiredMethods) {
      if (typeof extension[method] !== 'function') {
        errors.push(`Required method ${method} is missing or not a function`);}
      }
    }
    // Configuration method validation
    if (typeof extension.getConfiguration !== 'function') {
      errors.push('getConfiguration method is required');
    }
    if (typeof extension.setConfiguration !== 'function') {
      errors.push('setConfiguration method is required');
    }
    // Health check validation
    if (typeof extension.isHealthy !== 'function') {
      errors.push('isHealthy method is required');
    }
    if (typeof extension.getHealthStatus !== 'function') {
      errors.push('getHealthStatus method is required');
    }
    // Version format validation
    if (extension.version && !this.isValidSemanticVersion(extension.version)) {
      errors.push('Extension version must follow semantic versioning (x.y.z)');
    }
    // Dependencies validation
    if (extension.dependencies && !Array.isArray(extension.dependencies)) {
      errors.push('Dependencies must be an array');
    }
    // Permissions validation
    if (extension.permissions && !Array.isArray(extension.permissions)) {
      errors.push('Permissions must be an array');
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  private validateVersionCompatibility(version1: string, version2: string): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Basic semantic versioning comparison
    const [major1, minor1, patch1] = version1.split('.').map(Number);
    const [major2, minor2, patch2] = version2.split('.').map(Number);
    // Major version compatibility
    if (major1 !== major2) {
      errors.push(`Major version mismatch: ${version1} vs ${version2}`);}
    }
    // Minor version compatibility
    if (major1 === major2 && minor1 > minor2) {
      warnings.push(`Minor version compatibility issue: ${version1} vs ${version2}`);}
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  private getCacheKey(extension: any): string {
    return `${extension.id || 'unknown'}-${extension.version || '0.0.0'}-${Date.now()}`;}
  }
  private isAsyncFunction(fn: Function): boolean {
    return fn.constructor.name === 'AsyncFunction';
  }
  private isValidSemanticVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version);
  }
  private getBaseMethodSignatures(): Record<string, MethodSignature> {
    return {
      initialize: { parameterCount: 0, returnType: 'Promise<void>', async: true },
      activate: { parameterCount: 0, returnType: 'Promise<void>', async: true },
      deactivate: { parameterCount: 0, returnType: 'Promise<void>', async: true },
      dispose: { parameterCount: 0, returnType: 'Promise<void>', async: true },
      getConfiguration: { parameterCount: 0, returnType: 'any', async: false },
      setConfiguration: { parameterCount: 1, returnType: 'void', async: false },
      isHealthy: { parameterCount: 0, returnType: 'boolean', async: false },
      getHealthStatus: { parameterCount: 0, returnType: 'any', async: false }
    };
  }
}

// Runtime Type Checker
export class ExtensionRuntimeTypeChecker {
  private static instance: ExtensionRuntimeTypeChecker;
  private typeCache: Map<string, any> = new Map();
  private constructor() {}
  public static getInstance(): ExtensionRuntimeTypeChecker {
    if (!ExtensionRuntimeTypeChecker.instance) {
      ExtensionRuntimeTypeChecker.instance = new ExtensionRuntimeTypeChecker();
    }
    return ExtensionRuntimeTypeChecker.instance;
  }
  /**
   * Check if object implements interface at runtime
   */
  public implementsInterface(obj: any, interfaceName: string): boolean {
    const cacheKey = `${interfaceName}-${obj.constructor.name}`;}
    if (this.typeCache.has(cacheKey)) {
      return this.typeCache.get(cacheKey);
    }
    const result = this.performInterfaceCheck(obj, interfaceName);
    this.typeCache.set(cacheKey, result);
    return result;
  }
  /**
   * Get runtime type information
   */
  public getTypeInfo(obj: any): RuntimeTypeInfo {
    return {
      type: typeof obj,
      constructor: obj.constructor?.name || 'unknown',
      prototype: Object.getPrototypeOf(obj)?.constructor?.name || 'unknown',
      methods: this.getObjectMethods(obj),
      properties: this.getObjectProperties(obj),
      isExtension: this.isExtension(obj),
    };
  }
  /**
   * Validate method at runtime
   */
  public validateMethod(obj: any, methodName: string, expectedSignature: MethodSignature): boolean {
    const method = obj[methodName];
    if (typeof method !== 'function') {
      return false;
    }
    // Check parameter count
    if (expectedSignature.parameterCount !== undefined && method.length !== expectedSignature.parameterCount) {
      return false;
    }
    // Check async nature
    if (expectedSignature.async !== undefined && this.isAsyncFunction(method) !== expectedSignature.async) {
      return false;
    }
    return true;
  }
  /**
   * Create runtime type guard
   */
  public createTypeGuard<T>(interfaceName: string): (obj: any) => obj is T {
    return (obj: any): obj is T => {
      return this.implementsInterface(obj, interfaceName);
    };
  }
  private performInterfaceCheck(obj: any, interfaceName: string): boolean {
    const requiredMethods = this.getRequiredMethods(interfaceName);
    for (const method of requiredMethods) {
      if (typeof obj[method] !== 'function') {
        return false;
      }
    }
    return true;
  }
  private getRequiredMethods(interfaceName: string): string[] {
    const interfaces: Record<string, string[]> = {
      'BaseExtension': ['initialize', 'activate', 'deactivate', 'dispose', 'getConfiguration', 'setConfiguration', 'isHealthy', 'getHealthStatus'],
      'NodeExtension': ['getNodeDefinitions', 'createNodeInstance', 'validateNodeConfig', 'getNodeSchema', 'supportsAdvancedNodes'],
      'UIExtension': ['getComponentDefinitions', 'createComponentInstance', 'getThemeContributions', 'getCommandContributions', 'getMenuContributions', 'getKeybindingContributions'],
      'TransformExtension': ['getTransformDefinitions', 'createTransformInstance', 'validateTransformConfig', 'getTransformSchema', 'supportsPipeline'],
      'StorageExtension': ['getStorageProviders', 'createStorageProvider', 'validateStorageConfig', 'getStorageSchema', 'supportsMigration']
    };
    return interfaces[interfaceName] || [];
  }
  private getObjectMethods(obj: any): string[] {
    const methods: string[] = [];
    let current = obj;
    while (current && current !== Object.prototype) {
      Object.getOwnPropertyNames(current).forEach(name => {)
        if (typeof current[name] === 'function' && !methods.includes(name)) {
          methods.push(name);
        }
      });
      current = Object.getPrototypeOf(current);
    }
    return methods;
  }
  private getObjectProperties(obj: any): string[] {
    const properties: string[] = [];
    let current = obj;
    while (current && current !== Object.prototype) {
      Object.getOwnPropertyNames(current).forEach(name => {)
        if (typeof current[name] !== 'function' && !properties.includes(name)) {
          properties.push(name);
        }
      });
      current = Object.getPrototypeOf(current);
    }
    return properties;
  }
  private isExtension(obj: any): boolean {
    return obj && 
           typeof obj.id === 'string' && 
           typeof obj.name === 'string' && 
           typeof obj.version === 'string' && 
           typeof obj.initialize === 'function' && 
           typeof obj.activate === 'function';
  }
  private isAsyncFunction(fn: Function): boolean {
    return fn.constructor.name === 'AsyncFunction';
  }
}

// Interface Types
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

// Export singletons
export export const runtimeTypeChecker = ExtensionRuntimeTypeChecker.getInstance(); 