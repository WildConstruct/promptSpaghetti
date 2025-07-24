/**
 * Extension Type Definitions - Epic 8.4 Story 8.4.2
 * Comprehensive TypeScript type definitions for extension development
 */
import { z } from 'zod';
// Re-export all interface types
export * from './interfaces/ExtensionInterfaces.js';
export * from './interfaces/NodeExtension.js';
export * from './interfaces/UIExtension.js';
export * from './interfaces/TransformExtension.js';
export * from './interfaces/StorageExtension.js';
// Runtime Type Validation Schemas
export const ExtensionTypeSchemas = {
    // Base Extension Schema
    BaseExtension: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        version: z.string().regex(/^\d+\.\d+\.\d+$/),
        description: z.string().min(1),
        author: z.string().min(1),
        dependencies: z.array(z.string()).default([]),
        permissions: z.array(z.string()).default([]),
        // Methods are validated at runtime
        initialize: z.function(),
        activate: z.function(),
        deactivate: z.function(),
        dispose: z.function(),
        getConfiguration: z.function(),
        setConfiguration: z.function(),
        isHealthy: z.function(),
        getHealthStatus: z.function()
    }),
    // Node Extension Schema
    NodeExtension: z.object({
        extensionType: z.literal('node'),
        getNodeDefinitions: z.function(),
        createNodeInstance: z.function(),
        validateNodeConfig: z.function(),
        getNodeSchema: z.function(),
        supportsAdvancedNodes: z.function(),
        // Optional lifecycle hooks
        onNodeCreated: z.function().optional(),
        onNodeExecuted: z.function().optional(),
        onNodeDestroyed: z.function().optional(),
        createAdvancedNodeInstance: z.function().optional()
    }),
    // UI Extension Schema
    UIExtension: z.object({
        extensionType: z.literal('ui'),
        getComponentDefinitions: z.function(),
        createComponentInstance: z.function(),
        getThemeContributions: z.function(),
        getCommandContributions: z.function(),
        getMenuContributions: z.function(),
        getKeybindingContributions: z.function(),
        // Optional lifecycle hooks
        onUIInitialized: z.function().optional(),
        onUIDestroyed: z.function().optional(),
        onThemeChanged: z.function().optional()
    }),
    // Transform Extension Schema
    TransformExtension: z.object({
        extensionType: z.literal('transform'),
        getTransformDefinitions: z.function(),
        createTransformInstance: z.function(),
        validateTransformConfig: z.function(),
        getTransformSchema: z.function(),
        supportsPipeline: z.function(),
        // Optional lifecycle hooks
        onTransformCreated: z.function().optional(),
        onTransformExecuted: z.function().optional(),
        onTransformError: z.function().optional(),
        createPipeline: z.function().optional()
    }),
    // Storage Extension Schema
    StorageExtension: z.object({
        extensionType: z.literal('storage'),
        getStorageProviders: z.function(),
        createStorageProvider: z.function(),
        validateStorageConfig: z.function(),
        getStorageSchema: z.function(),
        supportsMigration: z.function(),
        // Optional lifecycle hooks
        onStorageCreated: z.function().optional(),
        onStorageConnected: z.function().optional(),
        onStorageDisconnected: z.function().optional(),
        onStorageError: z.function().optional(),
        createMigration: z.function().optional()
    })
};
// Type Guards
export const ExtensionTypeGuards = {
    isBaseExtension(obj) {
        try {
            ExtensionTypeSchemas.BaseExtension.parse(obj);
            return true;
        }
        catch {
            return false;
        }
    },
    isNodeExtension(obj) {
        try {
            ExtensionTypeSchemas.NodeExtension.parse(obj);
            return true;
        }
        catch {
            return false;
        }
    },
    isUIExtension(obj) {
        try {
            ExtensionTypeSchemas.UIExtension.parse(obj);
            return true;
        }
        catch {
            return false;
        }
    },
    isTransformExtension(obj) {
        try {
            ExtensionTypeSchemas.TransformExtension.parse(obj);
            return true;
        }
        catch {
            return false;
        }
    },
    isStorageExtension(obj) {
        try {
            ExtensionTypeSchemas.StorageExtension.parse(obj);
            return true;
        }
        catch {
            return false;
        }
    }
};
// Runtime Type Checker
export class ExtensionTypeChecker {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ExtensionTypeChecker.instance) {
            ExtensionTypeChecker.instance = new ExtensionTypeChecker();
        }
        return ExtensionTypeChecker.instance;
    }
    /**
     * Validate extension type at runtime
     */
    validateExtensionType(extension) {
        const errors = [];
        // Check base extension
        if (!ExtensionTypeGuards.isBaseExtension(extension)) {
            errors.push('Object does not implement BaseExtension interface');
            return { valid: false, errors };
        }
        // Determine extension type
        const extensionType = extension.extensionType;
        if (!extensionType) {
            errors.push('Extension type is not specified');
            return { valid: false, errors };
        }
        // Validate specific extension type
        switch (extensionType) {
            case 'node':
                if (!ExtensionTypeGuards.isNodeExtension(extension)) {
                    errors.push('Object does not implement NodeExtension interface');
                }
                break;
            case 'ui':
                if (!ExtensionTypeGuards.isUIExtension(extension)) {
                    errors.push('Object does not implement UIExtension interface');
                }
                break;
            case 'transform':
                if (!ExtensionTypeGuards.isTransformExtension(extension)) {
                    errors.push('Object does not implement TransformExtension interface');
                }
                break;
            case 'storage':
                if (!ExtensionTypeGuards.isStorageExtension(extension)) {
                    errors.push('Object does not implement StorageExtension interface');
                }
                break;
            default:
                errors.push(`Unknown extension type: ${extensionType}`);
        }
        return {
            valid: errors.length === 0,
            type: extensionType,
            errors
        };
    }
    /**
     * Validate method signature
     */
    validateMethodSignature(obj, methodName, expectedSignature) {
        const method = obj[methodName];
        if (typeof method !== 'function') {
            return false;
        }
        // Check parameter count
        if (expectedSignature.parameterCount !== undefined) {
            if (method.length !== expectedSignature.parameterCount) {
                return false;
            }
        }
        // Additional signature validation would go here
        // For now, we just check that it's a function
        return true;
    }
    /**
     * Generate TypeScript declaration file
     */
    generateTypeDeclaration(extensionId) {
        return `
// Auto-generated TypeScript declarations for ${extensionId}
// Generated on ${new Date().toISOString()}

declare module '${extensionId}' {
  import { BaseExtension } from '@prompt-spaghetti/core/extensions';
  
  export interface ${this.toPascalCase(extensionId)}Extension extends BaseExtension {
    // Extension-specific methods and properties
  }
  
  export const extension: ${this.toPascalCase(extensionId)}Extension;
  export default extension;
}
`;
    }
    /**
     * Generate JSDoc documentation
     */
    generateJSDoc(extensionType) {
        const baseDoc = `
/**
 * @typedef {Object} BaseExtension
 * @property {string} id - Unique extension identifier
 * @property {string} name - Human-readable extension name
 * @property {string} version - Semantic version string
 * @property {string} description - Extension description
 * @property {string} author - Extension author
 * @property {string[]} dependencies - Required extension dependencies
 * @property {string[]} permissions - Required permissions
 * @property {Function} initialize - Initialize the extension
 * @property {Function} activate - Activate the extension
 * @property {Function} deactivate - Deactivate the extension
 * @property {Function} dispose - Dispose of the extension
 * @property {Function} getConfiguration - Get extension configuration
 * @property {Function} setConfiguration - Set extension configuration
 * @property {Function} isHealthy - Check extension health
 * @property {Function} getHealthStatus - Get detailed health status
 */
`;
        const typeSpecificDoc = this.getTypeSpecificJSDoc(extensionType);
        return baseDoc + typeSpecificDoc;
    }
    getTypeSpecificJSDoc(extensionType) {
        switch (extensionType) {
            case 'node':
                return `
/**
 * @typedef {Object} NodeExtension
 * @extends BaseExtension
 * @property {'node'} extensionType - Extension type identifier
 * @property {Function} getNodeDefinitions - Get node definitions
 * @property {Function} createNodeInstance - Create node instance
 * @property {Function} validateNodeConfig - Validate node configuration
 * @property {Function} getNodeSchema - Get node schema
 * @property {Function} supportsAdvancedNodes - Check advanced node support
 */
`;
            case 'ui':
                return `
/**
 * @typedef {Object} UIExtension
 * @extends BaseExtension
 * @property {'ui'} extensionType - Extension type identifier
 * @property {Function} getComponentDefinitions - Get UI component definitions
 * @property {Function} createComponentInstance - Create component instance
 * @property {Function} getThemeContributions - Get theme contributions
 * @property {Function} getCommandContributions - Get command contributions
 * @property {Function} getMenuContributions - Get menu contributions
 * @property {Function} getKeybindingContributions - Get keybinding contributions
 */
`;
            case 'transform':
                return `
/**
 * @typedef {Object} TransformExtension
 * @extends BaseExtension
 * @property {'transform'} extensionType - Extension type identifier
 * @property {Function} getTransformDefinitions - Get transform definitions
 * @property {Function} createTransformInstance - Create transform instance
 * @property {Function} validateTransformConfig - Validate transform configuration
 * @property {Function} getTransformSchema - Get transform schema
 * @property {Function} supportsPipeline - Check pipeline support
 */
`;
            case 'storage':
                return `
/**
 * @typedef {Object} StorageExtension
 * @extends BaseExtension
 * @property {'storage'} extensionType - Extension type identifier
 * @property {Function} getStorageProviders - Get storage provider definitions
 * @property {Function} createStorageProvider - Create storage provider instance
 * @property {Function} validateStorageConfig - Validate storage configuration
 * @property {Function} getStorageSchema - Get storage schema
 * @property {Function} supportsMigration - Check migration support
 */
`;
            default:
                return '';
        }
    }
    toPascalCase(str) {
        return str.replace(/(?:^|[-_])(.)/g, (_, char) => char.toUpperCase());
    }
}
// Extension Interface Validation Tools
export class ExtensionInterfaceValidator {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ExtensionInterfaceValidator.instance) {
            ExtensionInterfaceValidator.instance = new ExtensionInterfaceValidator();
        }
        return ExtensionInterfaceValidator.instance;
    }
    /**
     * Validate extension interface implementation
     */
    validateInterface(extension, expectedInterface) {
        const result = {
            valid: true,
            missingMethods: [],
            invalidMethods: [],
            extraMethods: []
        };
        const requiredMethods = this.getRequiredMethods(expectedInterface);
        const actualMethods = this.getActualMethods(extension);
        // Check for missing methods
        for (const method of requiredMethods) {
            if (!actualMethods.includes(method)) {
                result.missingMethods.push(method);
                result.valid = false;
            }
        }
        // Check for invalid method signatures
        for (const method of requiredMethods) {
            if (actualMethods.includes(method)) {
                const expectedSignature = this.getMethodSignature(expectedInterface, method);
                if (!this.validateMethodSignature(extension, method, expectedSignature)) {
                    result.invalidMethods.push(method);
                    result.valid = false;
                }
            }
        }
        // Check for extra methods (informational only)
        for (const method of actualMethods) {
            if (!requiredMethods.includes(method) && !method.startsWith('_')) {
                result.extraMethods.push(method);
            }
        }
        return result;
    }
    getRequiredMethods(interfaceName) {
        const interfaces = {
            'BaseExtension': [
                'initialize',
                'activate',
                'deactivate',
                'dispose',
                'getConfiguration',
                'setConfiguration',
                'isHealthy',
                'getHealthStatus'
            ],
            'NodeExtension': [
                'getNodeDefinitions',
                'createNodeInstance',
                'validateNodeConfig',
                'getNodeSchema',
                'supportsAdvancedNodes'
            ],
            'UIExtension': [
                'getComponentDefinitions',
                'createComponentInstance',
                'getThemeContributions',
                'getCommandContributions',
                'getMenuContributions',
                'getKeybindingContributions'
            ],
            'TransformExtension': [
                'getTransformDefinitions',
                'createTransformInstance',
                'validateTransformConfig',
                'getTransformSchema',
                'supportsPipeline'
            ],
            'StorageExtension': [
                'getStorageProviders',
                'createStorageProvider',
                'validateStorageConfig',
                'getStorageSchema',
                'supportsMigration'
            ]
        };
        return interfaces[interfaceName] || [];
    }
    getActualMethods(obj) {
        const methods = [];
        for (const prop in obj) {
            if (typeof obj[prop] === 'function') {
                methods.push(prop);
            }
        }
        return methods;
    }
    getMethodSignature(interfaceName, methodName) {
        // This would return the expected method signature
        // For now, we'll return a minimal signature
        return {
            parameterCount: 0,
            parameterTypes: [],
            returnType: 'any'
        };
    }
    validateMethodSignature(obj, methodName, expectedSignature) {
        const method = obj[methodName];
        if (typeof method !== 'function') {
            return false;
        }
        // Basic validation - in a real implementation, this would be more thorough
        return true;
    }
}
// Export singletons
export const extensionTypeChecker = ExtensionTypeChecker.getInstance();
export const extensionInterfaceValidator = ExtensionInterfaceValidator.getInstance();
// Type predicates
export function isNodeExtension(extension) {
    return extension?.extensionType === 'node';
}
export function isUIExtension(extension) {
    return extension?.extensionType === 'ui';
}
export function isTransformExtension(extension) {
    return extension?.extensionType === 'transform';
}
export function isStorageExtension(extension) {
    return extension?.extensionType === 'storage';
}
// Runtime type information
export const ExtensionTypeInfo = {
    node: {
        name: 'Node Extension',
        description: 'Extends the runtime node system',
        interfaces: ['BaseExtension', 'NodeExtension'],
        capabilities: ['node-creation', 'node-validation', 'advanced-nodes']
    },
    ui: {
        name: 'UI Extension',
        description: 'Extends the user interface system',
        interfaces: ['BaseExtension', 'UIExtension'],
        capabilities: ['components', 'themes', 'commands', 'menus', 'keybindings']
    },
    transform: {
        name: 'Transform Extension',
        description: 'Extends the data transformation system',
        interfaces: ['BaseExtension', 'TransformExtension'],
        capabilities: ['data-transformation', 'pipeline-support', 'validation']
    },
    storage: {
        name: 'Storage Extension',
        description: 'Extends the storage and persistence system',
        interfaces: ['BaseExtension', 'StorageExtension'],
        capabilities: ['data-storage', 'migration', 'backup', 'queries']
    }
};
