/**
 * Extension Type Definitions - Epic 8.4 Story 8.4.2
 * Comprehensive TypeScript type definitions for extension development
 */
import { z } from 'zod';
export * from './interfaces/ExtensionInterfaces';
export * from './interfaces/NodeExtension';
export * from './interfaces/UIExtension';
export * from './interfaces/TransformExtension';
export * from './interfaces/StorageExtension';
export declare const ExtensionTypeSchemas: {
    BaseExtension: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        version: z.ZodString;
        description: z.ZodString;
        author: z.ZodString;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        initialize: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        activate: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        deactivate: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        dispose: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getConfiguration: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        setConfiguration: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        isHealthy: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getHealthStatus: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        description?: string;
        version?: string;
        author?: string;
        permissions?: string[];
        activate?: (...args: unknown[]) => unknown;
        deactivate?: (...args: unknown[]) => unknown;
        dependencies?: string[];
        initialize?: (...args: unknown[]) => unknown;
        dispose?: (...args: unknown[]) => unknown;
        getConfiguration?: (...args: unknown[]) => unknown;
        setConfiguration?: (...args: unknown[]) => unknown;
        isHealthy?: (...args: unknown[]) => unknown;
        getHealthStatus?: (...args: unknown[]) => unknown;
    }, {
        id?: string;
        name?: string;
        description?: string;
        version?: string;
        author?: string;
        permissions?: string[];
        activate?: (...args: unknown[]) => unknown;
        deactivate?: (...args: unknown[]) => unknown;
        dependencies?: string[];
        initialize?: (...args: unknown[]) => unknown;
        dispose?: (...args: unknown[]) => unknown;
        getConfiguration?: (...args: unknown[]) => unknown;
        setConfiguration?: (...args: unknown[]) => unknown;
        isHealthy?: (...args: unknown[]) => unknown;
        getHealthStatus?: (...args: unknown[]) => unknown;
    }>;
    NodeExtension: z.ZodObject<{
        extensionType: z.ZodLiteral<"node">;
        getNodeDefinitions: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        createNodeInstance: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        validateNodeConfig: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getNodeSchema: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        supportsAdvancedNodes: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        onNodeCreated: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onNodeExecuted: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onNodeDestroyed: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        createAdvancedNodeInstance: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        onNodeExecuted?: (...args: unknown[]) => unknown;
        extensionType?: "node";
        getNodeDefinitions?: (...args: unknown[]) => unknown;
        createNodeInstance?: (...args: unknown[]) => unknown;
        validateNodeConfig?: (...args: unknown[]) => unknown;
        getNodeSchema?: (...args: unknown[]) => unknown;
        supportsAdvancedNodes?: (...args: unknown[]) => unknown;
        onNodeCreated?: (...args: unknown[]) => unknown;
        onNodeDestroyed?: (...args: unknown[]) => unknown;
        createAdvancedNodeInstance?: (...args: unknown[]) => unknown;
    }, {
        onNodeExecuted?: (...args: unknown[]) => unknown;
        extensionType?: "node";
        getNodeDefinitions?: (...args: unknown[]) => unknown;
        createNodeInstance?: (...args: unknown[]) => unknown;
        validateNodeConfig?: (...args: unknown[]) => unknown;
        getNodeSchema?: (...args: unknown[]) => unknown;
        supportsAdvancedNodes?: (...args: unknown[]) => unknown;
        onNodeCreated?: (...args: unknown[]) => unknown;
        onNodeDestroyed?: (...args: unknown[]) => unknown;
        createAdvancedNodeInstance?: (...args: unknown[]) => unknown;
    }>;
    UIExtension: z.ZodObject<{
        extensionType: z.ZodLiteral<"ui">;
        getComponentDefinitions: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        createComponentInstance: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getThemeContributions: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getCommandContributions: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getMenuContributions: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getKeybindingContributions: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        onUIInitialized: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onUIDestroyed: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onThemeChanged: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        extensionType?: "ui";
        getComponentDefinitions?: (...args: unknown[]) => unknown;
        createComponentInstance?: (...args: unknown[]) => unknown;
        getThemeContributions?: (...args: unknown[]) => unknown;
        getCommandContributions?: (...args: unknown[]) => unknown;
        getMenuContributions?: (...args: unknown[]) => unknown;
        getKeybindingContributions?: (...args: unknown[]) => unknown;
        onUIInitialized?: (...args: unknown[]) => unknown;
        onUIDestroyed?: (...args: unknown[]) => unknown;
        onThemeChanged?: (...args: unknown[]) => unknown;
    }, {
        extensionType?: "ui";
        getComponentDefinitions?: (...args: unknown[]) => unknown;
        createComponentInstance?: (...args: unknown[]) => unknown;
        getThemeContributions?: (...args: unknown[]) => unknown;
        getCommandContributions?: (...args: unknown[]) => unknown;
        getMenuContributions?: (...args: unknown[]) => unknown;
        getKeybindingContributions?: (...args: unknown[]) => unknown;
        onUIInitialized?: (...args: unknown[]) => unknown;
        onUIDestroyed?: (...args: unknown[]) => unknown;
        onThemeChanged?: (...args: unknown[]) => unknown;
    }>;
    TransformExtension: z.ZodObject<{
        extensionType: z.ZodLiteral<"transform">;
        getTransformDefinitions: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        createTransformInstance: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        validateTransformConfig: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getTransformSchema: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        supportsPipeline: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        onTransformCreated: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onTransformExecuted: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onTransformError: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        createPipeline: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        extensionType?: "transform";
        getTransformDefinitions?: (...args: unknown[]) => unknown;
        createTransformInstance?: (...args: unknown[]) => unknown;
        validateTransformConfig?: (...args: unknown[]) => unknown;
        getTransformSchema?: (...args: unknown[]) => unknown;
        supportsPipeline?: (...args: unknown[]) => unknown;
        onTransformCreated?: (...args: unknown[]) => unknown;
        onTransformExecuted?: (...args: unknown[]) => unknown;
        onTransformError?: (...args: unknown[]) => unknown;
        createPipeline?: (...args: unknown[]) => unknown;
    }, {
        extensionType?: "transform";
        getTransformDefinitions?: (...args: unknown[]) => unknown;
        createTransformInstance?: (...args: unknown[]) => unknown;
        validateTransformConfig?: (...args: unknown[]) => unknown;
        getTransformSchema?: (...args: unknown[]) => unknown;
        supportsPipeline?: (...args: unknown[]) => unknown;
        onTransformCreated?: (...args: unknown[]) => unknown;
        onTransformExecuted?: (...args: unknown[]) => unknown;
        onTransformError?: (...args: unknown[]) => unknown;
        createPipeline?: (...args: unknown[]) => unknown;
    }>;
    StorageExtension: z.ZodObject<{
        extensionType: z.ZodLiteral<"storage">;
        getStorageProviders: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        createStorageProvider: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        validateStorageConfig: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        getStorageSchema: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        supportsMigration: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
        onStorageCreated: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onStorageConnected: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onStorageDisconnected: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        onStorageError: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
        createMigration: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        extensionType?: "storage";
        getStorageProviders?: (...args: unknown[]) => unknown;
        createStorageProvider?: (...args: unknown[]) => unknown;
        validateStorageConfig?: (...args: unknown[]) => unknown;
        getStorageSchema?: (...args: unknown[]) => unknown;
        supportsMigration?: (...args: unknown[]) => unknown;
        onStorageCreated?: (...args: unknown[]) => unknown;
        onStorageConnected?: (...args: unknown[]) => unknown;
        onStorageDisconnected?: (...args: unknown[]) => unknown;
        onStorageError?: (...args: unknown[]) => unknown;
        createMigration?: (...args: unknown[]) => unknown;
    }, {
        extensionType?: "storage";
        getStorageProviders?: (...args: unknown[]) => unknown;
        createStorageProvider?: (...args: unknown[]) => unknown;
        validateStorageConfig?: (...args: unknown[]) => unknown;
        getStorageSchema?: (...args: unknown[]) => unknown;
        supportsMigration?: (...args: unknown[]) => unknown;
        onStorageCreated?: (...args: unknown[]) => unknown;
        onStorageConnected?: (...args: unknown[]) => unknown;
        onStorageDisconnected?: (...args: unknown[]) => unknown;
        onStorageError?: (...args: unknown[]) => unknown;
        createMigration?: (...args: unknown[]) => unknown;
    }>;
};
export declare const ExtensionTypeGuards: {
    isBaseExtension(obj: any): obj is import("./interfaces/ExtensionInterfaces").BaseExtension;
    isNodeExtension(obj: any): obj is import("./interfaces/NodeExtension").NodeExtension;
    isUIExtension(obj: any): obj is import("./interfaces/UIExtension").UIExtension;
    isTransformExtension(obj: any): obj is import("./interfaces/TransformExtension").TransformExtension;
    isStorageExtension(obj: any): obj is import("./interfaces/StorageExtension").StorageExtension;
};
export declare class ExtensionTypeChecker {
    private static instance;
    private constructor();
    static getInstance(): ExtensionTypeChecker;
    /**
     * Validate extension type at runtime
     */
    validateExtensionType(extension: any): {
        valid: boolean;
        type?: string;
        errors: string[];
    };
    /**
     * Validate method signature
     */
    validateMethodSignature(obj: any, methodName: string, expectedSignature: {
        parameterCount?: number;
        parameterTypes?: string[];
        returnType?: string;
    }): boolean;
    /**
     * Generate TypeScript declaration file
     */
    generateTypeDeclaration(extensionId: string): string;
    /**
     * Generate JSDoc documentation
     */
    generateJSDoc(extensionType: string): string;
    private getTypeSpecificJSDoc;
    private toPascalCase;
}
export declare class ExtensionInterfaceValidator {
    private static instance;
    private constructor();
    static getInstance(): ExtensionInterfaceValidator;
    /**
     * Validate extension interface implementation
     */
    validateInterface(extension: any, expectedInterface: string): {
        valid: boolean;
        missingMethods: string[];
        invalidMethods: string[];
        extraMethods: string[];
    };
    private getRequiredMethods;
    private getActualMethods;
    private getMethodSignature;
    private validateMethodSignature;
}
export declare const extensionTypeChecker: ExtensionTypeChecker;
export declare const extensionInterfaceValidator: ExtensionInterfaceValidator;
export type ExtensionType = 'node' | 'ui' | 'transform' | 'storage';
export type AnyExtension = import('./interfaces/NodeExtension').NodeExtension | import('./interfaces/UIExtension').UIExtension | import('./interfaces/TransformExtension').TransformExtension | import('./interfaces/StorageExtension').StorageExtension;
export declare function isNodeExtension(extension: any): extension is import('./interfaces/NodeExtension').NodeExtension;
export declare function isUIExtension(extension: any): extension is import('./interfaces/UIExtension').UIExtension;
export declare function isTransformExtension(extension: any): extension is import('./interfaces/TransformExtension').TransformExtension;
export declare function isStorageExtension(extension: any): extension is import('./interfaces/StorageExtension').StorageExtension;
export declare const ExtensionTypeInfo: {
    readonly node: {
        readonly name: "Node Extension";
        readonly description: "Extends the runtime node system";
        readonly interfaces: readonly ["BaseExtension", "NodeExtension"];
        readonly capabilities: readonly ["node-creation", "node-validation", "advanced-nodes"];
    };
    readonly ui: {
        readonly name: "UI Extension";
        readonly description: "Extends the user interface system";
        readonly interfaces: readonly ["BaseExtension", "UIExtension"];
        readonly capabilities: readonly ["components", "themes", "commands", "menus", "keybindings"];
    };
    readonly transform: {
        readonly name: "Transform Extension";
        readonly description: "Extends the data transformation system";
        readonly interfaces: readonly ["BaseExtension", "TransformExtension"];
        readonly capabilities: readonly ["data-transformation", "pipeline-support", "validation"];
    };
    readonly storage: {
        readonly name: "Storage Extension";
        readonly description: "Extends the storage and persistence system";
        readonly interfaces: readonly ["BaseExtension", "StorageExtension"];
        readonly capabilities: readonly ["data-storage", "migration", "backup", "queries"];
    };
};
//# sourceMappingURL=TypeDefinitions.d.ts.map