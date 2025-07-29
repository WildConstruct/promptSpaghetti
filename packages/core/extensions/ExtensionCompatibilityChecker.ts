/**
 * Extension Compatibility Checker - Epic 8.4 Story 8.4.4
 * Advanced compatibility checking and resolution for extensions
 */
import { ExtensionManifest } from './ExtensionManifest';
import { SemanticVersion, VersionRange, extensionVersionManager, CompatibilityResult, CompatibilityIssue } from './ExtensionVersionManager';

// Compatibility Checker
export class ExtensionCompatibilityChecker {
  private static instance: ExtensionCompatibilityChecker;
  private compatibilityRules: Map<string, CompatibilityRule> = new Map();
  private platformFeatures: Map<string, PlatformFeature> = new Map();
  private systemCapabilities: SystemCapabilities;
  private constructor() {
  this.systemCapabilities = this.initializeSystemCapabilities();
  this.initializeDefaultRules();
  public static getInstance(): ExtensionCompatibilityChecker {,
  if (!ExtensionCompatibilityChecker.instance) {
  ExtensionCompatibilityChecker.instance = new ExtensionCompatibilityChecker();
  return ExtensionCompatibilityChecker.instance;
  /**
  * Comprehensive compatibility check
  */
  public checkExtensionCompatibility(()
  extension: ExtensionManifest,
  context: CompatibilityContext): ExtensionCompatibilityResult {,
  const result: ExtensionCompatibilityResult = {,
  compatible: true,
  issues: [],
  warnings: [],
  recommendations: [],
  systemCheck: this.checkSystemCompatibility(extension, context),
  dependencyCheck: this.checkDependencyCompatibility(extension, context),
  platformCheck: this.checkPlatformCompatibility(extension, context),
  permissionCheck: this.checkPermissionCompatibility(extension, context),
  securityCheck: this.checkSecurityCompatibility(extension, context),
};
    // Aggregate results
    const checks = [result.systemCheck, result.dependencyCheck, result.platformCheck, result.permissionCheck, result.securityCheck];
    for (const check of checks) {
      result.issues.push(...check.issues);
      result.warnings.push(...check.warnings);
      if (!check.compatible) {
        result.compatible = false;
    // Generate recommendations
    result.recommendations = this.generateRecommendations(result);
    return result;
  /**
   * Check system compatibility
   */
  private checkSystemCompatibility(extension: ExtensionManifest, context: CompatibilityContext): CompatibilityCheck {
    const issues: CompatibilityIssue = [];
    const warnings: string = [];
    // Check system version
    const systemVersion = new SemanticVersion(context.systemVersion);
    if (extension.compatibility?.min_system_version) {
      const minVersion = new SemanticVersion(extension.compatibility.min_system_version);
      if (systemVersion.compareTo(minVersion) < 0) {
        issues.push({)
  type: 'system-version',
          severity: 'error',
          message: `System version ${context.systemVersion} is below minimum required ${extension.compatibility.min_system_version}`}
},
  currentVersion: context.systemVersion,
          requiredVersion: extension.compatibility.min_system_version;
  });
    if (extension.compatibility?.max_system_version) {
      const maxVersion = new SemanticVersion(extension.compatibility.max_system_version);
      if (systemVersion.compareTo(maxVersion) > 0) {
        issues.push({)
  type: 'system-version',
          severity: 'error',
          message: `System version ${context.systemVersion} is above maximum supported ${extension.compatibility.max_system_version}`}
},
  currentVersion: context.systemVersion,
          requiredVersion: extension.compatibility.max_system_version;
  });
    // Check system capabilities
    if (extension.capabilities?.requires) {
      for (const capability of extension.capabilities.requires) {
        if (!this.systemCapabilities.available.includes(capability)) {
          issues.push({)
  type: 'missing-dependency',
            severity: 'error',
            message: `Required system capability not available: ${capability}`}
},
  dependencyId: capability;
  });
    return {
  compatible: issues.filter(i => i.severity === 'error').length === 0,
  issues,
  warnings
};
  /**
   * Check dependency compatibility
   */
  private checkDependencyCompatibility(extension: ExtensionManifest, context: CompatibilityContext): CompatibilityCheck {
    const issues: CompatibilityIssue = [];
    const warnings: string = [];
    if (!extension.dependencies?.extensions) {
      return { compatible: true, issues: [], warnings: [] };
    for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
      const depExtension = context.availableExtensions.get(depId);
      if (!depExtension) {
        issues.push({)
  type: 'missing-dependency',
          severity: 'error',
          message: `Missing dependency: ${depId}`}
},
  dependencyId: depId,
          requiredVersion: versionRange;
  });
        continue;
      // Check version compatibility
      const depVersion = new SemanticVersion(depExtension.version);
      const range = VersionRange.parse(versionRange);
      if (!range.satisfies(depVersion)) {
        issues.push({)
  type: 'version-mismatch',
          severity: 'error',
          message: `Dependency ${depId} version ${depExtension.version} doesn't satisfy ${versionRange}`}
},
  dependencyId: depId,
          currentVersion: depExtension.version,
          requiredVersion: versionRange;
  });
      // Check for deprecated dependencies
      if (depExtension.compatibility?.deprecated) {
        warnings.push(`Dependency ${depId} is deprecated: ${depExtension.compatibility.deprecationMessage || 'No longer maintained'}`);}
      // Check transitive dependencies
      const transitiveCheck = this.checkTransitiveDependencies(depExtension, context, [extension.id]);
      if (!transitiveCheck.compatible) {
        issues.push(...transitiveCheck.issues);
        warnings.push(...transitiveCheck.warnings);
    // Check for circular dependencies
    const circularPath = this.findCircularDependencies(extension, context.availableExtensions);
    if (circularPath.length > 0) {
      issues.push({)
  type: 'circular-dependency',
        severity: 'error',
        message: `Circular dependency detected: ${circularPath.join(' -> ')}`}
}
        circularPath
      });
    return {
  compatible: issues.filter(i => i.severity === 'error').length === 0,
  issues,
  warnings
};
  /**
   * Check platform compatibility
   */
  private checkPlatformCompatibility(extension: ExtensionManifest, context: CompatibilityContext): CompatibilityCheck {
    const issues: CompatibilityIssue = [];
    const warnings: string = [];
    // Check platform support
    if (extension.compatibility?.platforms) {
      if (!extension.compatibility.platforms.includes(context.platform)) {
        issues.push({)
  type: 'system-version',
          severity: 'error',
          message: `Platform ${context.platform} is not supported. Supported platforms: ${extension.compatibility.platforms.join(', ')}`}
},
  currentVersion: context.platform,
          requiredVersion: extension.compatibility.platforms.join(' | ');
  });
    // Check browser compatibility
    if (extension.compatibility?.browsers && context.browserInfo) {
      for (const [browser, requiredVersion] of Object.entries(extension.compatibility.browsers)) {
        const currentVersion = context.browserInfo[browser];
        if (!currentVersion) {
          warnings.push(`Browser ${browser} support not detected`);}
          continue;
        const range = VersionRange.parse(requiredVersion);
        const browserVersion = new SemanticVersion(currentVersion);
        if (!range.satisfies(browserVersion)) {
          issues.push({)
  type: 'version-mismatch',
            severity: 'error',
            message: `Browser ${browser} version ${currentVersion} doesn't satisfy ${requiredVersion}`}
}
            currentVersion,
            requiredVersion
          });
    // Check platform features
    if (extension.capabilities?.requires) {
      for (const capability of extension.capabilities.requires) {
        const feature = this.platformFeatures.get(capability);
        if (feature && !feature.available) {
          issues.push({)
  type: 'missing-dependency',
            severity: 'error',
            message: `Required platform feature not available: ${capability}`}
},
  dependencyId: capability;
  });
    return {
  compatible: issues.filter(i => i.severity === 'error').length === 0,
  issues,
  warnings
};
  /**
   * Check permission compatibility
   */
  private checkPermissionCompatibility(extension: ExtensionManifest, context: CompatibilityContext): CompatibilityCheck {
    const issues: CompatibilityIssue = [];
    const warnings: string = [];
    if (!extension.permissions) {
      return { compatible: true, issues: [], warnings: [] };
    for (const permission of extension.permissions) {
      if (!context.grantedPermissions.includes(permission)) {
        issues.push({)
  type: 'missing-dependency',
          severity: 'error',
          message: `Required permission not granted: ${permission}`}
},
  dependencyId: permission;
  });
      // Check for dangerous permissions
      if (this.isDangerousPermission(permission)) {
        warnings.push(`Extension requests dangerous permission: ${permission}`);}
    return {
  compatible: issues.filter(i => i.severity === 'error').length === 0,
  issues,
  warnings
};
  /**
   * Check security compatibility
   */
  private checkSecurityCompatibility(extension: ExtensionManifest, context: CompatibilityContext): CompatibilityCheck {
  const issues: CompatibilityIssue = [];
  const warnings: string = [];
  // Check CSP compatibility
  if (extension.security?.content_security_policy) {
  if (!this.validateCSP(extension.security.content_security_policy)) {
  issues.push({)
  type: 'system-version',
  severity: 'error',
  message: 'Invalid or overly permissive Content Security Policy',
});
    // Check sandbox settings
    if (extension.security?.sandbox) {
      if (!extension.security.sandbox.enabled) {
        warnings.push('Extension runs without sandbox protection');
    } else {
      warnings.push('No sandbox configuration specified');
    // Check trusted domains
    if (extension.security?.trusted_domains) {
      for (const domain of extension.security.trusted_domains) {
        if (!this.isTrustedDomain(domain)) {
          warnings.push(`Untrusted domain in whitelist: ${domain}`);}
    return {
  compatible: issues.filter(i => i.severity === 'error').length === 0,
  issues,
  warnings
};
  /**
   * Check transitive dependencies
   */
  private checkTransitiveDependencies(extension: ExtensionManifest)
    context: CompatibilityContext,
    visited: string = []): CompatibilityCheck {,
    const issues: CompatibilityIssue = [];
    const warnings: string = [];
    if (!extension.dependencies?.extensions) {
      return { compatible: true, issues: [], warnings: [] };
    for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
  if (visited.includes(depId)) {
  continue; // Skip already visited to avoid infinite recursion
  const depExtension = context.availableExtensions.get(depId);
  if (!depExtension) {
  continue; // Already handled in main dependency check
  // Recursively check dependencies
  const transitiveCheck = this.checkTransitiveDependencies(;);
  depExtension,
  context,
  [...visited, extension.id]
  );
  issues.push(...transitiveCheck.issues);
  warnings.push(...transitiveCheck.warnings);
  return {
  compatible: issues.filter(i => i.severity === 'error').length === 0,
  issues,
  warnings
};
  /**
   * Find circular dependencies
   */
  private findCircularDependencies()
    extension: ExtensionManifest,
    availableExtensions: Map<string, ExtensionManifest>,
    visited: Set<string> = new Set(),
    path: string = []): string {,
  if (visited.has(extension.id)) {
  const circularStart = path.indexOf(extension.id);
  return circularStart >= 0 ? path.slice(circularStart).concat(extension.id) : [];
  visited.add(extension.id);
  path.push(extension.id);
  if (extension.dependencies?.extensions) {
  for (const depId of Object.keys(extension.dependencies.extensions)) {
  const depExtension = availableExtensions.get(depId);
  if (depExtension) {
  const circular = this.findCircularDependencies(;);
  depExtension,
  availableExtensions,
  new Set(visited),
  [...path]
  );
  if (circular.length > 0) {
  return circular;
  return [];
  /**
  * Generate recommendations based on compatibility issues
  */
  private generateRecommendations(result: ExtensionCompatibilityResult): string {,
  const recommendations: string = [];
  // System version recommendations
  const systemIssues = result.issues.filter(i => i.type === 'system-version');
  if (systemIssues.length > 0) {
  recommendations.push('Consider upgrading system to meet version requirements');
  // Dependency recommendations
  const depIssues = result.issues.filter(i => i.type === 'missing-dependency');
  if (depIssues.length > 0) {
  recommendations.push('Install missing dependencies before activating extension');
  const versionIssues = result.issues.filter(i => i.type === 'version-mismatch');
  if (versionIssues.length > 0) {
  recommendations.push('Update dependencies to compatible versions');
  // Circular dependency recommendations
  const circularIssues = result.issues.filter(i => i.type === 'circular-dependency');
  if (circularIssues.length > 0) {
  recommendations.push('Resolve circular dependencies by refactoring extension architecture');
  // Security recommendations
  if (result.warnings.some(w => w.includes('dangerous permission'))) {
  recommendations.push('Review dangerous permissions and ensure they are necessary');
  if (result.warnings.some(w => w.includes('sandbox'))) {
  recommendations.push('Enable sandbox protection for enhanced security');
  return recommendations;
  /**
  * Add custom compatibility rule
  */
  public addCompatibilityRule(rule: CompatibilityRule): void {,
  this.compatibilityRules.set(rule.id, rule);
  /**
  * Check if permission is dangerous
  */
  private isDangerousPermission(permission: string): boolean {,
  const dangerousPermissions = [;
  'file-system-write',
  'network',
  'process-spawn',
  'system-info',
  'extensions-api'
  ];
  return dangerousPermissions.includes(permission);
  /**
  * Validate CSP
  */
  private validateCSP(csp: string): boolean {,
  // Basic CSP validation
  const hasDefaultSrc = csp.includes('default-src');
  const hasScriptSrc = csp.includes('script-src');
  const hasUnsafeEval = csp.includes('\'unsafe-eval\'');
  const hasUnsafeInline = csp.includes('\'unsafe-inline\'');
  return (hasDefaultSrc || hasScriptSrc) && !hasUnsafeEval && !hasUnsafeInline;
  /**
  * Check if domain is trusted
  */
  private isTrustedDomain(domain: string): boolean {,
  const trustedDomains = [;
  'localhost',
  '127.0.0.1',
  'api.example.com',
  'cdn.example.com'
  ];
  return trustedDomains.includes(domain) || domain.endsWith('.example.com');
  /**
  * Initialize system capabilities
  */
  private initializeSystemCapabilities(): SystemCapabilities {,
  return {
  available: [,
  'runtime-nodes',
  'ui-components',
  'data-transforms',
  'storage-providers',
  'file-system-read',
  'network-restricted'
  ],
  version: '1.0.0',
  platform: 'web',
};
  /**
   * Initialize default compatibility rules
   */
  private initializeDefaultRules(): void {
    this.addCompatibilityRule({)
  id: 'semver-compatibility',
      name: 'Semantic Versioning Compatibility',
      description: 'Ensures extensions follow semantic versioning',
      check: (extension: ExtensionManifest) => {,
        try {
          new SemanticVersion(extension.version);
          return { compatible: true, issues: [] };
        } catch (error) {
          return {
            compatible: false,
            issues: [{,
  type: 'system-version',
              severity: 'error',
              message: `Invalid semantic version: ${extension.version}`}
            }]
          };
    });
    this.addCompatibilityRule({)
  id: 'extension-type-consistency',
  name: 'Extension Type Consistency',
  description: 'Ensures extension configuration matches declared type',
  check: (extension: ExtensionManifest) => {,
  const issues: CompatibilityIssue = [];
  if (extension.extension_type === 'ui' && !extension.ui) {
  issues.push({)
  type: 'missing-dependency',
  severity: 'error',
  message: 'UI extension must have ui configuration',
});
        if (extension.extension_type === 'node' && !extension.runtime?.node_types) {
  issues.push({)
  type: 'missing-dependency',
  severity: 'error',
  message: 'Node extension must specify node_types',
});
        return {
  compatible: issues.length === 0,
  issues
};
    });

// Types and Interfaces

export interface CompatibilityContext {
  systemVersion: string;
  platform: string;
  availableExtensions: Map<string, ExtensionManifest>;
  grantedPermissions: string;
  browserInfo?: Record<string, string>;
}
export interface ExtensionCompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue;
  warnings: string;
  recommendations: string;
  systemCheck: CompatibilityCheck;
  dependencyCheck: CompatibilityCheck;
  platformCheck: CompatibilityCheck;
  permissionCheck: CompatibilityCheck;
  securityCheck: CompatibilityCheck;
  interface CompatibilityCheck {
  compatible: boolean;
  issues: CompatibilityIssue;
  warnings: string;
  interface CompatibilityRule {
  id: string;
  name: string;
  description: string;
  check: (extension: ExtensionManifest) => {,
  compatible: boolean;
  issues: CompatibilityIssue;
};
interface PlatformFeature {
  id: string;
  name: string;
  available: boolean;
  version?: string;
  description?: string;
  interface SystemCapabilities {
  available: string;
  version: string;
  platform: string;
  // Export singleton
}
export const extensionCompatibilityChecker = ExtensionCompatibilityChecker.getInstance();