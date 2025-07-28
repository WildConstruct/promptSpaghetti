/**
 * Extension Compatibility Checker - Epic 8.4 Story 8.4.4
 * Advanced compatibility checking and resolution for extensions
 */
import { ExtensionManifest } from './ExtensionManifest';
import { CompatibilityIssue } from './ExtensionVersionManager';
export declare class ExtensionCompatibilityChecker {
    private static instance;
    private compatibilityRules;
    private platformFeatures;
    private systemCapabilities;
    private constructor();
    static getInstance(): ExtensionCompatibilityChecker;
    /**
     * Comprehensive compatibility check
     */
    checkExtensionCompatibility();
      extension: ExtensionManifest,
      context: CompatibilityContext,
    ): ExtensionCompatibilityResult;
    /**
     * Check system compatibility
     */
    private checkSystemCompatibility;
    /**
     * Check dependency compatibility
     */
    private checkDependencyCompatibility;
    /**
     * Check platform compatibility
     */
    private checkPlatformCompatibility;
    /**
     * Check permission compatibility
     */
    private checkPermissionCompatibility;
    /**
     * Check security compatibility
     */
    private checkSecurityCompatibility;
    /**
     * Check transitive dependencies
     */
    private checkTransitiveDependencies;
    /**
     * Find circular dependencies
     */
    private findCircularDependencies;
    /**
     * Generate recommendations based on compatibility issues
     */
    private generateRecommendations;
    /**
     * Add custom compatibility rule
     */
    addCompatibilityRule(rule: CompatibilityRule): void;
    /**
     * Check if permission is dangerous
     */
    private isDangerousPermission;
    /**
     * Validate CSP
     */
    private validateCSP;
    /**
     * Check if domain is trusted
     */
    private isTrustedDomain;
    /**
     * Initialize system capabilities
     */
    private initializeSystemCapabilities;
    /**
     * Initialize default compatibility rules
     */
    private initializeDefaultRules;
}
export interface CompatibilityContext {
    systemVersion: string;
    platform: string;
    availableExtensions: Map<string, ExtensionManifest>;
    grantedPermissions: string[];
    browserInfo?: Record<string, string>;
}
export interface ExtensionCompatibilityResult {
    compatible: boolean;
    issues: CompatibilityIssue[];
    warnings: string[];
    recommendations: string[];
    systemCheck: CompatibilityCheck;
    dependencyCheck: CompatibilityCheck;
    platformCheck: CompatibilityCheck;
    permissionCheck: CompatibilityCheck;
    securityCheck: CompatibilityCheck;
}
interface CompatibilityCheck {
    compatible: boolean;
    issues: CompatibilityIssue[];
    warnings: string[];
}
interface CompatibilityRule {
    id: string;
    name: string;
    description: string;
    check: (extension: ExtensionManifest) => {,
        compatible: boolean;
        issues: CompatibilityIssue[];
    };
}
export declare const extensionCompatibilityChecker: ExtensionCompatibilityChecker;
export {};
//# sourceMappingURL=ExtensionCompatibilityChecker.d.ts.map