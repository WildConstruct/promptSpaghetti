/**
 * Extension Development Tools - Epic 8.4 Story 8.4.2
 * Tools and utilities for extension development and testing
 */

import { z } from 'zod';
import { 
  BaseExtension, 
  ExtensionContext, 
  ExtensionValidationResult,
  ExtensionError,
  ExtensionErrorType
} from './interfaces/ExtensionInterfaces';
import { extensionTypeChecker, extensionInterfaceValidator } from './TypeDefinitions';

// Extension Development Kit
export class ExtensionDevelopmentKit {
  private static instance: ExtensionDevelopmentKit;

  private constructor() {}

  public static getInstance(): ExtensionDevelopmentKit {
    if (!ExtensionDevelopmentKit.instance) {
      ExtensionDevelopmentKit.instance = new ExtensionDevelopmentKit();
    }
    return ExtensionDevelopmentKit.instance;
  }

  /**
   * Create a new extension skeleton
   */
  public createExtensionSkeleton(config: ExtensionSkeletonConfig): string {
    const { id, name, type, author, description } = config;
    
    const baseClass = this.generateBaseClass(config);
    const extensionClass = this.generateExtensionClass(config);
    const exports = this.generateExports(config);
    
    return `/**
 * ${name} Extension
 * ${description}
 * 
 * @author ${author}
 * @version 1.0.0
 */

import { 
  BaseExtension, 
  ExtensionContext, 
  ExtensionValidationResult 
} from '@prompt-spaghetti/core/extensions';

${baseClass}

${extensionClass}

${exports}
`;
  }

  /**
   * Validate extension implementation
   */
  public validateExtension(extension: any): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Type validation
    const typeValidation = extensionTypeChecker.validateExtensionType(extension);
    if (!typeValidation.valid) {
      errors.push(...typeValidation.errors);
    }

    // Interface validation
    if (typeValidation.type) {
      const interfaceValidation = extensionInterfaceValidator.validateInterface(
        extension,
        `${typeValidation.type.charAt(0).toUpperCase() + typeValidation.type.slice(1)}Extension`
      );
      
      if (!interfaceValidation.valid) {
        errors.push(...interfaceValidation.missingMethods.map(m => `Missing method: ${m}`));
        errors.push(...interfaceValidation.invalidMethods.map(m => `Invalid method signature: ${m}`));
        
        if (interfaceValidation.extraMethods.length > 0) {
          warnings.push(`Extra methods detected: ${interfaceValidation.extraMethods.join(', ')}`);
        }
      }
    }

    // Configuration validation
    try {
      const config = extension.getConfiguration();
      if (typeof config !== 'object' || config === null) {
        warnings.push('Extension configuration should be an object');
      }
    } catch (error) {
      errors.push(`Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Health check validation
    try {
      const isHealthy = extension.isHealthy();
      if (typeof isHealthy !== 'boolean') {
        errors.push('isHealthy() must return a boolean');
      }
      
      const healthStatus = extension.getHealthStatus();
      if (!healthStatus || typeof healthStatus !== 'object') {
        errors.push('getHealthStatus() must return a health status object');
      }
    } catch (error) {
      errors.push(`Health check validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Test extension lifecycle
   */
  public async testExtensionLifecycle(extension: BaseExtension): Promise<LifecycleTestResult> {
    const result: LifecycleTestResult = {
      success: true,
      phases: [],
      errors: [],
      duration: 0
    };

    const startTime = Date.now();
    
    try {
      // Test initialization
      await this.testPhase(result, 'initialize', async () => {
        await extension.initialize();
      });

      // Test activation
      await this.testPhase(result, 'activate', async () => {
        await extension.activate();
      });

      // Test health check
      await this.testPhase(result, 'health', async () => {
        const isHealthy = extension.isHealthy();
        const healthStatus = extension.getHealthStatus();
        
        if (!isHealthy) {
          throw new Error('Extension reports unhealthy status');
        }
        
        if (healthStatus.status !== 'healthy') {
          throw new Error(`Extension health status is ${healthStatus.status}`);
        }
      });

      // Test deactivation
      await this.testPhase(result, 'deactivate', async () => {
        await extension.deactivate();
      });

      // Test disposal
      await this.testPhase(result, 'dispose', async () => {
        await extension.dispose();
      });

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Generate extension documentation
   */
  public generateExtensionDocumentation(extension: BaseExtension): string {
    const config = extension.getConfiguration();
    const type = (extension as any).extensionType || 'unknown';
    
    return `# ${extension.name}

${extension.description}

## Information
- **ID**: ${extension.id}
- **Version**: ${extension.version}
- **Author**: ${extension.author}
- **Type**: ${type}

## Dependencies
${extension.dependencies.length > 0 ? 
    extension.dependencies.map(dep => `- ${dep}`).join('\n') : 
    'No dependencies'
}

## Permissions
${extension.permissions.length > 0 ? 
    extension.permissions.map(perm => `- ${perm}`).join('\n') : 
    'No special permissions required'
}

## Configuration
\`\`\`json
${JSON.stringify(config, null, 2)}
\`\`\`

## API Reference
${this.generateAPIReference(extension, type)}

## Examples
${this.generateExamples(extension, type)}
`;
  }

  /**
   * Create test extension instance
   */
  public createTestExtension(config: Partial<TestExtensionConfig> = {}): BaseExtension {
    return new TestExtension(config);
  }

  /**
   * Create mock extension context
   */
  public createMockExtensionContext(extensionId: string): ExtensionContext {
    return {
      extensionId,
      systemVersion: '1.0.0',
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        trace: jest.fn()
      } as any,
      storage: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        keys: jest.fn(),
        getScoped: jest.fn()
      } as any,
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        once: jest.fn(),
        removeAllListeners: jest.fn()
      } as any,
      runtime: {
        version: '1.0.0',
        environment: 'test',
        getSystemInfo: jest.fn(),
        getPerformanceMetrics: jest.fn(),
        registerNode: jest.fn(),
        unregisterNode: jest.fn(),
        getRegisteredNodes: jest.fn()
      } as any,
      ui: {
        registerComponent: jest.fn(),
        unregisterComponent: jest.fn(),
        registerInspectorEditor: jest.fn(),
        unregisterInspectorEditor: jest.fn(),
        registerMenuItem: jest.fn(),
        unregisterMenuItem: jest.fn(),
        showNotification: jest.fn(),
        showModal: jest.fn()
      } as any,
      api: {
        createHttpClient: jest.fn(),
        registerEndpoint: jest.fn(),
        unregisterEndpoint: jest.fn(),
        registerMiddleware: jest.fn(),
        unregisterMiddleware: jest.fn()
      } as any
    };
  }

  // Private helper methods
  private generateBaseClass(config: ExtensionSkeletonConfig): string {
    return `
/**
 * Base extension class
 */
abstract class BaseExtensionImpl implements BaseExtension {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  public readonly description: string;
  public readonly author: string;
  public readonly dependencies: string[];
  public readonly permissions: string[];
  
  protected context?: ExtensionContext;
  protected config: any = {};
  protected healthy: boolean = true;
  
  constructor(
    id: string,
    name: string,
    version: string,
    description: string,
    author: string,
    dependencies: string[] = [],
    permissions: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.description = description;
    this.author = author;
    this.dependencies = dependencies;
    this.permissions = permissions;
  }
  
  public async initialize(): Promise<void> {
    // Override in subclass
  }
  
  public async activate(): Promise<void> {
    // Override in subclass
  }
  
  public async deactivate(): Promise<void> {
    // Override in subclass
  }
  
  public async dispose(): Promise<void> {
    // Override in subclass
  }
  
  public getConfiguration(): any {
    return this.config;
  }
  
  public setConfiguration(config: any): void {
    this.config = config;
  }
  
  public isHealthy(): boolean {
    return this.healthy;
  }
  
  public getHealthStatus(): any {
    return {
      status: this.healthy ? 'healthy' : 'error',
      message: this.healthy ? 'Extension is healthy' : 'Extension has errors',
      lastChecked: new Date()
    };
  }
}`;
  }

  private generateExtensionClass(config: ExtensionSkeletonConfig): string {
    const { id, name, type, author, description } = config;
    
    const typeSpecificMethods = this.generateTypeSpecificMethods(type);
    const interfaceName = `${type.charAt(0).toUpperCase() + type.slice(1)}Extension`;
    
    return `
/**
 * ${name} Extension Implementation
 */
export class ${this.toPascalCase(id)}Extension extends BaseExtensionImpl implements ${interfaceName} {
  public readonly extensionType = '${type}' as const;
  
  constructor() {
    super(
      '${id}',
      '${name}',
      '1.0.0',
      '${description}',
      '${author}',
      [], // dependencies
      []  // permissions
    );
  }
  
  public async initialize(): Promise<void> {
    // Initialize your extension here
    console.log('Initializing ${name} extension');
  }
  
  public async activate(): Promise<void> {
    // Activate your extension here
    console.log('Activating ${name} extension');
  }
  
  public async deactivate(): Promise<void> {
    // Deactivate your extension here
    console.log('Deactivating ${name} extension');
  }
  
  public async dispose(): Promise<void> {
    // Dispose of your extension here
    console.log('Disposing ${name} extension');
  }
  
  ${typeSpecificMethods}
}`;
  }

  private generateTypeSpecificMethods(type: string): string {
    switch (type) {
    case 'node':
      return `
  public getNodeDefinitions(): any[] {
    return [
      // Add your node definitions here
    ];
  }
  
  public createNodeInstance(nodeType: string, nodeId: string, config: any): any {
    // Create and return node instance
    throw new Error('Not implemented');
  }
  
  public validateNodeConfig(nodeType: string, config: any): ExtensionValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }
  
  public getNodeSchema(nodeType: string): any {
    // Return Zod schema for node configuration
    return z.object({});
  }
  
  public supportsAdvancedNodes(): boolean {
    return false;
  }`;
      
    case 'ui':
      return `
  public getComponentDefinitions(): any[] {
    return [
      // Add your component definitions here
    ];
  }
  
  public createComponentInstance(componentId: string, props: any): any {
    // Create and return component instance
    throw new Error('Not implemented');
  }
  
  public getThemeContributions(): any[] {
    return [];
  }
  
  public getCommandContributions(): any[] {
    return [];
  }
  
  public getMenuContributions(): any[] {
    return [];
  }
  
  public getKeybindingContributions(): any[] {
    return [];
  }`;
      
    case 'transform':
      return `
  public getTransformDefinitions(): any[] {
    return [
      // Add your transform definitions here
    ];
  }
  
  public createTransformInstance(transformId: string, config: any): any {
    // Create and return transform instance
    throw new Error('Not implemented');
  }
  
  public validateTransformConfig(transformId: string, config: any): ExtensionValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }
  
  public getTransformSchema(transformId: string): any {
    // Return Zod schema for transform configuration
    return z.object({});
  }
  
  public supportsPipeline(): boolean {
    return false;
  }`;
      
    case 'storage':
      return `
  public getStorageProviders(): any[] {
    return [
      // Add your storage provider definitions here
    ];
  }
  
  public createStorageProvider(providerId: string, config: any): any {
    // Create and return storage provider instance
    throw new Error('Not implemented');
  }
  
  public validateStorageConfig(providerId: string, config: any): ExtensionValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }
  
  public getStorageSchema(providerId: string): any {
    // Return Zod schema for storage configuration
    return z.object({});
  }
  
  public supportsMigration(): boolean {
    return false;
  }`;
      
    default:
      return '';
    }
  }

  private generateExports(config: ExtensionSkeletonConfig): string {
    const className = this.toPascalCase(config.id);
    
    return `
// Create extension instance
const extension = new ${className}Extension();

// Export extension
export { extension };
export default extension;

// Export types
export type { ${className}Extension };
`;
  }

  private generateAPIReference(extension: BaseExtension, type: string): string {
    // This would generate comprehensive API documentation
    return `
### Core Methods
- \`initialize(): Promise<void>\` - Initialize the extension
- \`activate(): Promise<void>\` - Activate the extension
- \`deactivate(): Promise<void>\` - Deactivate the extension
- \`dispose(): Promise<void>\` - Dispose of the extension

### Type-Specific Methods
${this.getTypeSpecificAPIDocs(type)}
`;
  }

  private getTypeSpecificAPIDocs(type: string): string {
    switch (type) {
    case 'node':
      return `
- \`getNodeDefinitions(): NodeDefinition[]\` - Get node definitions
- \`createNodeInstance(nodeType: string, nodeId: string, config: any): RuntimeNode\` - Create node instance
- \`validateNodeConfig(nodeType: string, config: any): ExtensionValidationResult\` - Validate node configuration
- \`getNodeSchema(nodeType: string): ZodSchema\` - Get node schema
- \`supportsAdvancedNodes(): boolean\` - Check advanced node support`;
      
    case 'ui':
      return `
- \`getComponentDefinitions(): UIComponentDefinition[]\` - Get component definitions
- \`createComponentInstance(componentId: string, props: any): React.ComponentType\` - Create component instance
- \`getThemeContributions(): ThemeContribution[]\` - Get theme contributions
- \`getCommandContributions(): CommandContribution[]\` - Get command contributions
- \`getMenuContributions(): MenuContribution[]\` - Get menu contributions
- \`getKeybindingContributions(): KeybindingContribution[]\` - Get keybinding contributions`;
      
    default:
      return 'See interface documentation for type-specific methods.';
    }
  }

  private generateExamples(extension: BaseExtension, type: string): string {
    return `
### Basic Usage
\`\`\`typescript
import { extension } from './${extension.id}';

// Initialize and activate
await extension.initialize();
await extension.activate();

// Use extension functionality
${this.getTypeSpecificExample(type)}

// Deactivate and dispose
await extension.deactivate();
await extension.dispose();
\`\`\`
`;
  }

  private getTypeSpecificExample(type: string): string {
    switch (type) {
    case 'node':
      return `
// Get available node definitions
const nodeDefinitions = extension.getNodeDefinitions();

// Create a node instance
const node = extension.createNodeInstance('my-node', 'node-1', {});`;
      
    case 'ui':
      return `
// Get available components
const components = extension.getComponentDefinitions();

// Create a component instance
const Component = extension.createComponentInstance('my-component', {});`;
      
    default:
      return '// Use extension-specific methods here';
    }
  }

  private async testPhase(result: LifecycleTestResult, phase: string, testFn: () => Promise<void>): Promise<void> {
    const phaseResult: LifecyclePhaseResult = {
      phase,
      success: true,
      duration: 0,
      error: undefined
    };

    const startTime = Date.now();
    
    try {
      await testFn();
    } catch (error) {
      phaseResult.success = false;
      phaseResult.error = error;
      result.success = false;
    }
    
    phaseResult.duration = Date.now() - startTime;
    result.phases.push(phaseResult);
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^|[-_])(.)/g, (_, char) => char.toUpperCase());
  }
}

// Test Extension Implementation
class TestExtension implements BaseExtension {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  public readonly description: string;
  public readonly author: string;
  public readonly dependencies: string[];
  public readonly permissions: string[];
  
  private config: any = {};
  private healthy: boolean = true;
  
  constructor(config: Partial<TestExtensionConfig> = {}) {
    this.id = config.id || 'test-extension';
    this.name = config.name || 'Test Extension';
    this.version = config.version || '1.0.0';
    this.description = config.description || 'A test extension';
    this.author = config.author || 'Test Author';
    this.dependencies = config.dependencies || [];
    this.permissions = config.permissions || [];
  }
  
  public async initialize(): Promise<void> {
    // Test initialization
  }
  
  public async activate(): Promise<void> {
    // Test activation
  }
  
  public async deactivate(): Promise<void> {
    // Test deactivation
  }
  
  public async dispose(): Promise<void> {
    // Test disposal
  }
  
  public getConfiguration(): any {
    return this.config;
  }
  
  public setConfiguration(config: any): void {
    this.config = config;
  }
  
  public isHealthy(): boolean {
    return this.healthy;
  }
  
  public getHealthStatus(): any {
    return {
      status: this.healthy ? 'healthy' : 'error',
      message: this.healthy ? 'Extension is healthy' : 'Extension has errors',
      lastChecked: new Date()
    };
  }
  
  public setHealthy(healthy: boolean): void {
    this.healthy = healthy;
  }
}

// Type definitions
interface ExtensionSkeletonConfig {
  id: string;
  name: string;
  type: 'node' | 'ui' | 'transform' | 'storage';
  author: string;
  description: string;
}

interface TestExtensionConfig {
  id?: string;
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  permissions?: string[];
}

interface LifecycleTestResult {
  success: boolean;
  phases: LifecyclePhaseResult[];
  errors: Error[];
  duration: number;
}

interface LifecyclePhaseResult {
  phase: string;
  success: boolean;
  duration: number;
  error?: Error;
}

// Export singleton
export const extensionDevelopmentKit = ExtensionDevelopmentKit.getInstance();