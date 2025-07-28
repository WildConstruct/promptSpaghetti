/**
 * Extension System Index - Epic 8.4 Story 8.4.2
 * Central export point for all extension system components
 */
export * from './interfaces/ExtensionInterfaces';
export * from './interfaces/NodeExtension';
export * from './interfaces/UIExtension';
export * from './interfaces/TransformExtension';
export * from './interfaces/StorageExtension';
export * from './ExtensionPointRegistry';
export * from './ExtensionPointDocumentationGenerator';
export * from './ExtensionPointVisualizer';
export * from './TypeDefinitions';
export * from './ExtensionInterfaceValidator';
export * from './ExtensionDevelopmentTools';
export * from './ExtensionInterfaceTestUtils';
export * from './ExtensionInterfaceDocumentationGenerator';
export * from './ExtensionLifecycleManager';
export * from './ExtensionManifest';
export * from './ExtensionManifestManager';
export * from './ExtensionManifestUtils';
export * from './ExtensionVersionManager';
export * from './ExtensionCompatibilityChecker';
export * from './ExtensionUpgradeAdvisor';
export { ExtensionTypeInfo } from './TypeDefinitions';
export declare const ExtensionSystemUtils: {
    /**
    * Get extension type from extension object
    */
    getExtensionType(extension: any): string;
    /**
     * Check if object is an extension
     */
    isExtension(obj: any): boolean;
    /**
     * Get extension metadata
     */
    getExtensionMetadata(extension: any): {
        id: string;
        name: string;
        version: string;
        type: string;
        author: string;
        description: string;
    };
    return: {
        id: any;
        name: any;
        version: any;
        type: any;
        author: any;
        description: any;
    };
};
//# sourceMappingURL=index.d.ts.map