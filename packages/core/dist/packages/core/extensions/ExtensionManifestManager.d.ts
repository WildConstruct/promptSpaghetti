/**
 * Extension Manifest Manager - Epic 8.4 Story 8.4.3
 * Manages extension manifests including loading, caching, and validation
 */
import { ExtensionManifest } from './ExtensionManifest';
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
    validateManifest(manifest: ExtensionManifest): any;
    systemVersion: string;
    platform: string;
    grantedPermissions: string;
    ExtensionValidationResult: any;
}
//# sourceMappingURL=ExtensionManifestManager.d.ts.map