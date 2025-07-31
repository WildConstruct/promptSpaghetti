/**
 * Extension Manifest Manager - Epic 8.4 Story 8.4.3
 * Manages extension manifests including loading, caching, and validation
 */
import { ExtensionManifest } from './ExtensionManifest';
import { ExtensionValidationResult } from './interfaces/ExtensionInterfaces';
export declare class ExtensionManifestManager {
    private static instance;
    private manifests;
    private manifestCache;
    private watchedFiles;
    private eventEmitter;
    private constructor();
    static getInstance(): ExtensionManifestManager;
    /**
     * Load manifest from file
     */
    loadManifest(filePath: string): Promise<ManifestLoadResult>;
    /**
     * Load multiple manifests from directory
     */
    loadManifestsFromDirectory(directoryPath: string): Promise<ManifestBatchLoadResult>;
    /**
     * Validate manifest with context
     */
    validateManifest();
      manifest: ExtensionManifest,
      systemVersion?: string,
      platform?: string,
      grantedPermissions?: string[]
    ): ExtensionValidationResult;
    /**
     * Get manifest by ID
     */
    getManifest(extensionId: string): ExtensionManifest | undefined;
    /**
     * Get all manifests
     */
    getAllManifests(): ExtensionManifest[];
    /**
     * Get manifests by type
     */
    getManifestsByType(extensionType: string): ExtensionManifest[];
    /**
     * Search manifests
     */
    searchManifests(query: string): ExtensionManifest[];
    /**
     * Get manifest dependencies
     */
    getManifestDependencies(extensionId: string): ManifestDependencyInfo;
    /**
     * Check manifest compatibility
     */
    checkCompatibility(manifest: ExtensionManifest, systemVersion: string, platform: string): ExtensionValidationResult;
    /**
     * Update manifest
     */
    updateManifest(extensionId: string, updatedManifest: ExtensionManifest): boolean;
    /**
     * Remove manifest
     */
    removeManifest(extensionId: string): boolean;
    /**
     * Refresh manifest from file
     */
    refreshManifest(extensionId: string): Promise<boolean>;
    /**
     * Get manifest statistics
     */
    getManifestStatistics(): ManifestStatistics;
    /**
     * Event handling
     */
    on(event: string, listener: (data: any) => void): void;
    off(event: string, listener: (data: any) => void): void;
    /**
     * Clear all manifests and cache
     */
    clear(): void;
    /**
     * Private helper methods
     */
    private emit;
    private isCacheExpired;
    private findManifestFiles;
    private watchFile;
    private stopWatchingFile;
    private resolveDependencies;
    private findDependents;
    private findMissingDependencies;
    private findCircularDependencies;
    private compareVersions;

export declare class ExtensionManifestBuilder {
    private manifest;
    constructor();
    setBasicInfo(info: {)
        id: string;
        name: string;
        version: string;
        description: string;
    }): ExtensionManifestBuilder;
    setAuthor(author: {)
        name: string;
        email?: string;
        url?: string;
    }): ExtensionManifestBuilder;
    setExtensionType(type: 'node' | 'ui' | 'transform' | 'storage'): ExtensionManifestBuilder;
    setMain(main: string): ExtensionManifestBuilder;
    setDependencies(dependencies: {)
        system?: string;
        extensions?: Record<string, string>;
        npm?: Record<string, string>;
    }): ExtensionManifestBuilder;
    setPermissions(permissions: string[]): ExtensionManifestBuilder;
    setCapabilities(capabilities: {)
        provides?: string[];
        requires?: string[];
        optional?: string[];
    }): ExtensionManifestBuilder;
    setUI(ui: {)
        icon?: string;
        category?: string;
        themes?: string[];
        css?: string[];
        components?: Record<string, string>;
    }): ExtensionManifestBuilder;
    setRuntime(runtime: {)
        node_types?: string[];
        transforms?: string[];
        storage_providers?: string[];
        background_tasks?: string[];
    }): ExtensionManifestBuilder;
    setMetadata(metadata: {)
        license?: string;
        repository?: string;
        homepage?: string;
        bugs?: string;
        keywords?: string[];
        categories?: string[];
    }): ExtensionManifestBuilder;
    setCompatibility(compatibility: {)
        min_system_version?: string;
        max_system_version?: string;
        platforms?: string[];
    }): ExtensionManifestBuilder;
    setSecurity(security: {)
        content_security_policy?: string;
        sandbox?: {
            enabled?: boolean;
            permissions?: string[];
        };
        trusted_domains?: string[];
    }): ExtensionManifestBuilder;
    build(): ExtensionManifest;
    buildJSON(): string;

}
interface ManifestLoadResult {
    success: boolean;
    manifest?: ExtensionManifest;
    source?: 'cache' | 'file';
    error?: string;
    details?: Array<{
        path: string;
        message: string;
        code: string;

}
    }>;

}
interface ManifestBatchLoadResult {
    success: boolean;
    results: ManifestLoadResult[];
    errors: string[];
    totalFound: number;
    totalLoaded: number;


}
interface ManifestDependencyInfo {
    manifest?: ExtensionManifest;
    dependencies: ExtensionManifest[];
    dependents: ExtensionManifest[];
    missingDependencies: string[];
    circularDependencies: string[];


}
interface ManifestStatistics {
    total: number;
    byType: Record<string, number>;
    byVersion: Record<string, number>;
    byAuthor: Record<string, number>;
    totalDependencies: number;
    averageDependencies: number;
    mostPopularDependencies: string[];
    oldestVersion: string;
    newestVersion: string;
    cached: number;

export declare const extensionManifestManager: ExtensionManifestManager;
export declare const extensionManifestBuilder: ExtensionManifestBuilder;
}
export {};
//# sourceMappingURL=ExtensionManifestManager.d.ts.map