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
        errors: string[];
        warnings: string[];
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
    /**
     * Sanitize manifest for distribution
     */
    static sanitizeManifest(manifest: ExtensionManifest): ExtensionManifest;
    /**
     * Private utility methods
     */
    private static isValidSemanticVersion;
    private static isValidExtensionId;
    private static isValidVersionRange;
    private static isValidPackageName;
    private static compress;
    private static countFields;

export declare class ManifestTemplateGenerator {
    /**
     * Generate manifest template for extension type
     */
    static generateTemplate(extensionType: 'node' | 'ui' | 'transform' | 'storage'): string;
    /**
     * Generate manifest wizard questions
     */
    static generateWizardQuestions(): ManifestWizardQuestion[];
    private static generateNodeTemplate;
    private static generateUITemplate;
    private static generateTransformTemplate;
    private static generateStorageTemplate;
interface ManifestSizeInfo {
    raw: number;
    compressed: number;
    compressionRatio: number;
    fieldCount: number;
    dependencyCount: number;
    permissionCount: number;
interface ManifestMetadata {
    id: string;
    name: string;
    version: string;
    type: string;
    author: string;
    description: string;
    license: string;
    keywords: string[];
    categories: string[];
    hasUI: boolean;
    hasRuntime: boolean;
    hasSecurity: boolean;
    dependencyCount: number;
    permissionCount: number;
    size: ManifestSizeInfo;
interface ManifestComparison {
    identical: boolean;
    versionChanged: boolean;
    dependenciesChanged: boolean;
    permissionsChanged: boolean;
    configurationChanged: boolean;
    changes: Array<{,
        field: string;
        oldValue: string;
        newValue: string;
        type: 'added' | 'removed' | 'modified'
  }>;
interface ManifestWizardQuestion {
    key: string;
    prompt: string;
    type: 'text' | 'select' | 'boolean';
    required?: boolean;
    default?: any;
    options?: string[];
    validation?: (value: any) => boolean;
    transform?: (value: any) => any;

export { ManifestTemplateGenerator };
//# sourceMappingURL=ExtensionManifestUtils.d.ts.map