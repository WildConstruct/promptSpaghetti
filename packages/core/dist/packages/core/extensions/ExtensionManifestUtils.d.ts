/**
 * Extension Manifest Utilities - Epic 8.4 Story 8.4.3
 * Utility functions for working with extension manifests
 */
import { ExtensionManifest } from './ExtensionManifest';
export declare class ExtensionManifestUtils {
    /**
    * Convert package.json to extension manifest
    */
    static convertPackageJsonToManifest(packageJson: any): ExtensionManifest;
    /**
    * Convert extension manifest to package.json
    */
    static convertManifestToPackageJson(manifest: ExtensionManifest): any;
    /**
     * Merge two manifests
     */
    static mergeManifests(base: ExtensionManifest, override: Partial<ExtensionManifest>): ExtensionManifest;
    /**
     * Validate manifest dependencies
     */
    static validateManifestDependencies(manifest: ExtensionManifest): {
        valid: boolean;
        errors: string;
        warnings: string;
        const: any;
        errors: string;
        const: any;
        warnings: string;
        if(: any, manifest: any, dependencies: any): any;
    };
    /**
     * Get manifest size information
     */
    static getManifestSize(manifest: ExtensionManifest): ManifestSizeInfo;
    /**
     * Extract manifest metadata
     */
    static extractMetadata(manifest: ExtensionManifest): ManifestMetadata;
    /**
     * Compare two manifests
     */
    static compareManifests(manifest1: ExtensionManifest, manifest2: ExtensionManifest): ManifestComparison;
    /**
     * Generate manifest diff
     */
    static generateManifestDiff(oldManifest: ExtensionManifest, newManifest: ExtensionManifest): string;
}
//# sourceMappingURL=ExtensionManifestUtils.d.ts.map