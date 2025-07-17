import { ExtensionManifest } from './ExtensionManifest';
import { CompatibilityIssue } from './ExtensionVersionManager';
export declare class ExtensionCompatibilityChecker {
    private static instance;
    private compatibilityRules;
    private platformFeatures;
    private systemCapabilities;
    private constructor();
    static getInstance(): ExtensionCompatibilityChecker;
    checkExtensionCompatibility(extension: ExtensionManifest, context: CompatibilityContext): ExtensionCompatibilityResult;
    private checkSystemCompatibility;
    private checkDependencyCompatibility;
    private checkPlatformCompatibility;
    private checkPermissionCompatibility;
    private checkSecurityCompatibility;
    private checkTransitiveDependencies;
    private findCircularDependencies;
    private generateRecommendations;
    addCompatibilityRule(rule: CompatibilityRule): void;
    private isDangerousPermission;
    private validateCSP;
    private isTrustedDomain;
    private initializeSystemCapabilities;
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
    check: (extension: ExtensionManifest) => {
        compatible: boolean;
        issues: CompatibilityIssue[];
    };
}
export declare const extensionCompatibilityChecker: ExtensionCompatibilityChecker;
export {};
//# sourceMappingURL=ExtensionCompatibilityChecker.d.ts.map