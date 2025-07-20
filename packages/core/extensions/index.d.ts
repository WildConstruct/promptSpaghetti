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
    /**
     * Compare extension versions
     */
    compareVersions(version1: string, version2: string): number;
    /**
     * Validate semantic version
     */
    isValidSemanticVersion(version: string): boolean;
    /**
     * Generate extension ID from name
     */
    generateExtensionId(name: string): string;
};
export declare const ExtensionSystemConstants: {
    EXTENSION_TYPES: readonly ["node", "ui", "transform", "storage"];
    LIFECYCLE_STATES: readonly ["uninitialized", "initializing", "initialized", "activating", "active", "deactivating", "deactivated", "disposing", "disposed", "error"];
    HEALTH_STATUS_VALUES: readonly ["healthy", "warning", "error", "unknown"];
    ERROR_TYPES: readonly ["initialization_error", "activation_error", "runtime_error", "validation_error", "dependency_error", "permission_error", "configuration_error"];
    VALIDATION_LEVELS: readonly ["error", "warning", "info"];
    CAPABILITIES: {
        readonly node: readonly ["node-creation", "node-validation", "advanced-nodes"];
        readonly ui: readonly ["components", "themes", "commands", "menus", "keybindings"];
        readonly transform: readonly ["data-transformation", "pipeline-support", "validation"];
        readonly storage: readonly ["data-storage", "migration", "backup", "queries"];
    };
};
export declare const EXTENSION_SYSTEM_VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map