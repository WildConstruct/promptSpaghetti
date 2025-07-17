"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionCompatibilityChecker = exports.ExtensionCompatibilityChecker = void 0;
const ExtensionVersionManager_1 = require("./ExtensionVersionManager");
class ExtensionCompatibilityChecker {
    constructor() {
        this.compatibilityRules = new Map();
        this.platformFeatures = new Map();
        this.systemCapabilities = this.initializeSystemCapabilities();
        this.initializeDefaultRules();
    }
    static getInstance() {
        if (!ExtensionCompatibilityChecker.instance) {
            ExtensionCompatibilityChecker.instance = new ExtensionCompatibilityChecker();
        }
        return ExtensionCompatibilityChecker.instance;
    }
    checkExtensionCompatibility(extension, context) {
        const result = {
            compatible: true,
            issues: [],
            warnings: [],
            recommendations: [],
            systemCheck: this.checkSystemCompatibility(extension, context),
            dependencyCheck: this.checkDependencyCompatibility(extension, context),
            platformCheck: this.checkPlatformCompatibility(extension, context),
            permissionCheck: this.checkPermissionCompatibility(extension, context),
            securityCheck: this.checkSecurityCompatibility(extension, context)
        };
        const checks = [result.systemCheck, result.dependencyCheck, result.platformCheck, result.permissionCheck, result.securityCheck];
        for (const check of checks) {
            result.issues.push(...check.issues);
            result.warnings.push(...check.warnings);
            if (!check.compatible) {
                result.compatible = false;
            }
        }
        result.recommendations = this.generateRecommendations(result);
        return result;
    }
    checkSystemCompatibility(extension, context) {
        const issues = [];
        const warnings = [];
        const systemVersion = new ExtensionVersionManager_1.SemanticVersion(context.systemVersion);
        if (extension.compatibility?.min_system_version) {
            const minVersion = new ExtensionVersionManager_1.SemanticVersion(extension.compatibility.min_system_version);
            if (systemVersion.compareTo(minVersion) < 0) {
                issues.push({
                    type: 'system-version',
                    severity: 'error',
                    message: `System version ${context.systemVersion} is below minimum required ${extension.compatibility.min_system_version}`,
                    currentVersion: context.systemVersion,
                    requiredVersion: extension.compatibility.min_system_version
                });
            }
        }
        if (extension.compatibility?.max_system_version) {
            const maxVersion = new ExtensionVersionManager_1.SemanticVersion(extension.compatibility.max_system_version);
            if (systemVersion.compareTo(maxVersion) > 0) {
                issues.push({
                    type: 'system-version',
                    severity: 'error',
                    message: `System version ${context.systemVersion} is above maximum supported ${extension.compatibility.max_system_version}`,
                    currentVersion: context.systemVersion,
                    requiredVersion: extension.compatibility.max_system_version
                });
            }
        }
        if (extension.capabilities?.requires) {
            for (const capability of extension.capabilities.requires) {
                if (!this.systemCapabilities.available.includes(capability)) {
                    issues.push({
                        type: 'missing-dependency',
                        severity: 'error',
                        message: `Required system capability not available: ${capability}`,
                        dependencyId: capability
                    });
                }
            }
        }
        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings
        };
    }
    checkDependencyCompatibility(extension, context) {
        const issues = [];
        const warnings = [];
        if (!extension.dependencies?.extensions) {
            return { compatible: true, issues: [], warnings: [] };
        }
        for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
            const depExtension = context.availableExtensions.get(depId);
            if (!depExtension) {
                issues.push({
                    type: 'missing-dependency',
                    severity: 'error',
                    message: `Missing dependency: ${depId}`,
                    dependencyId: depId,
                    requiredVersion: versionRange
                });
                continue;
            }
            const depVersion = new ExtensionVersionManager_1.SemanticVersion(depExtension.version);
            const range = ExtensionVersionManager_1.VersionRange.parse(versionRange);
            if (!range.satisfies(depVersion)) {
                issues.push({
                    type: 'version-mismatch',
                    severity: 'error',
                    message: `Dependency ${depId} version ${depExtension.version} doesn't satisfy ${versionRange}`,
                    dependencyId: depId,
                    currentVersion: depExtension.version,
                    requiredVersion: versionRange
                });
            }
            if (depExtension.compatibility?.deprecated) {
                warnings.push(`Dependency ${depId} is deprecated: ${depExtension.compatibility.deprecationMessage || 'No longer maintained'}`);
            }
            const transitiveCheck = this.checkTransitiveDependencies(depExtension, context, [extension.id]);
            if (!transitiveCheck.compatible) {
                issues.push(...transitiveCheck.issues);
                warnings.push(...transitiveCheck.warnings);
            }
        }
        const circularPath = this.findCircularDependencies(extension, context.availableExtensions);
        if (circularPath.length > 0) {
            issues.push({
                type: 'circular-dependency',
                severity: 'error',
                message: `Circular dependency detected: ${circularPath.join(' -> ')}`,
                circularPath
            });
        }
        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings
        };
    }
    checkPlatformCompatibility(extension, context) {
        const issues = [];
        const warnings = [];
        if (extension.compatibility?.platforms) {
            if (!extension.compatibility.platforms.includes(context.platform)) {
                issues.push({
                    type: 'system-version',
                    severity: 'error',
                    message: `Platform ${context.platform} is not supported. Supported platforms: ${extension.compatibility.platforms.join(', ')}`,
                    currentVersion: context.platform,
                    requiredVersion: extension.compatibility.platforms.join(' | ')
                });
            }
        }
        if (extension.compatibility?.browsers && context.browserInfo) {
            for (const [browser, requiredVersion] of Object.entries(extension.compatibility.browsers)) {
                const currentVersion = context.browserInfo[browser];
                if (!currentVersion) {
                    warnings.push(`Browser ${browser} support not detected`);
                    continue;
                }
                const range = ExtensionVersionManager_1.VersionRange.parse(requiredVersion);
                const browserVersion = new ExtensionVersionManager_1.SemanticVersion(currentVersion);
                if (!range.satisfies(browserVersion)) {
                    issues.push({
                        type: 'version-mismatch',
                        severity: 'error',
                        message: `Browser ${browser} version ${currentVersion} doesn't satisfy ${requiredVersion}`,
                        currentVersion,
                        requiredVersion
                    });
                }
            }
        }
        if (extension.capabilities?.requires) {
            for (const capability of extension.capabilities.requires) {
                const feature = this.platformFeatures.get(capability);
                if (feature && !feature.available) {
                    issues.push({
                        type: 'missing-dependency',
                        severity: 'error',
                        message: `Required platform feature not available: ${capability}`,
                        dependencyId: capability
                    });
                }
            }
        }
        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings
        };
    }
    checkPermissionCompatibility(extension, context) {
        const issues = [];
        const warnings = [];
        if (!extension.permissions) {
            return { compatible: true, issues: [], warnings: [] };
        }
        for (const permission of extension.permissions) {
            if (!context.grantedPermissions.includes(permission)) {
                issues.push({
                    type: 'missing-dependency',
                    severity: 'error',
                    message: `Required permission not granted: ${permission}`,
                    dependencyId: permission
                });
            }
            if (this.isDangerousPermission(permission)) {
                warnings.push(`Extension requests dangerous permission: ${permission}`);
            }
        }
        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings
        };
    }
    checkSecurityCompatibility(extension, context) {
        const issues = [];
        const warnings = [];
        if (extension.security?.content_security_policy) {
            if (!this.validateCSP(extension.security.content_security_policy)) {
                issues.push({
                    type: 'system-version',
                    severity: 'error',
                    message: 'Invalid or overly permissive Content Security Policy'
                });
            }
        }
        if (extension.security?.sandbox) {
            if (!extension.security.sandbox.enabled) {
                warnings.push('Extension runs without sandbox protection');
            }
        }
        else {
            warnings.push('No sandbox configuration specified');
        }
        if (extension.security?.trusted_domains) {
            for (const domain of extension.security.trusted_domains) {
                if (!this.isTrustedDomain(domain)) {
                    warnings.push(`Untrusted domain in whitelist: ${domain}`);
                }
            }
        }
        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings
        };
    }
    checkTransitiveDependencies(extension, context, visited = []) {
        const issues = [];
        const warnings = [];
        if (!extension.dependencies?.extensions) {
            return { compatible: true, issues: [], warnings: [] };
        }
        for (const [depId, versionRange] of Object.entries(extension.dependencies.extensions)) {
            if (visited.includes(depId)) {
                continue;
            }
            const depExtension = context.availableExtensions.get(depId);
            if (!depExtension) {
                continue;
            }
            const transitiveCheck = this.checkTransitiveDependencies(depExtension, context, [...visited, extension.id]);
            issues.push(...transitiveCheck.issues);
            warnings.push(...transitiveCheck.warnings);
        }
        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings
        };
    }
    findCircularDependencies(extension, availableExtensions, visited = new Set(), path = []) {
        if (visited.has(extension.id)) {
            const circularStart = path.indexOf(extension.id);
            return circularStart >= 0 ? path.slice(circularStart).concat(extension.id) : [];
        }
        visited.add(extension.id);
        path.push(extension.id);
        if (extension.dependencies?.extensions) {
            for (const depId of Object.keys(extension.dependencies.extensions)) {
                const depExtension = availableExtensions.get(depId);
                if (depExtension) {
                    const circular = this.findCircularDependencies(depExtension, availableExtensions, new Set(visited), [...path]);
                    if (circular.length > 0) {
                        return circular;
                    }
                }
            }
        }
        return [];
    }
    generateRecommendations(result) {
        const recommendations = [];
        const systemIssues = result.issues.filter(i => i.type === 'system-version');
        if (systemIssues.length > 0) {
            recommendations.push('Consider upgrading system to meet version requirements');
        }
        const depIssues = result.issues.filter(i => i.type === 'missing-dependency');
        if (depIssues.length > 0) {
            recommendations.push('Install missing dependencies before activating extension');
        }
        const versionIssues = result.issues.filter(i => i.type === 'version-mismatch');
        if (versionIssues.length > 0) {
            recommendations.push('Update dependencies to compatible versions');
        }
        const circularIssues = result.issues.filter(i => i.type === 'circular-dependency');
        if (circularIssues.length > 0) {
            recommendations.push('Resolve circular dependencies by refactoring extension architecture');
        }
        if (result.warnings.some(w => w.includes('dangerous permission'))) {
            recommendations.push('Review dangerous permissions and ensure they are necessary');
        }
        if (result.warnings.some(w => w.includes('sandbox'))) {
            recommendations.push('Enable sandbox protection for enhanced security');
        }
        return recommendations;
    }
    addCompatibilityRule(rule) {
        this.compatibilityRules.set(rule.id, rule);
    }
    isDangerousPermission(permission) {
        const dangerousPermissions = [
            'file-system-write',
            'network',
            'process-spawn',
            'system-info',
            'extensions-api'
        ];
        return dangerousPermissions.includes(permission);
    }
    validateCSP(csp) {
        const hasDefaultSrc = csp.includes('default-src');
        const hasScriptSrc = csp.includes('script-src');
        const hasUnsafeEval = csp.includes("'unsafe-eval'");
        const hasUnsafeInline = csp.includes("'unsafe-inline'");
        return (hasDefaultSrc || hasScriptSrc) && !hasUnsafeEval && !hasUnsafeInline;
    }
    isTrustedDomain(domain) {
        const trustedDomains = [
            'localhost',
            '127.0.0.1',
            'api.example.com',
            'cdn.example.com'
        ];
        return trustedDomains.includes(domain) || domain.endsWith('.example.com');
    }
    initializeSystemCapabilities() {
        return {
            available: [
                'runtime-nodes',
                'ui-components',
                'data-transforms',
                'storage-providers',
                'file-system-read',
                'network-restricted'
            ],
            version: '1.0.0',
            platform: 'web'
        };
    }
    initializeDefaultRules() {
        this.addCompatibilityRule({
            id: 'semver-compatibility',
            name: 'Semantic Versioning Compatibility',
            description: 'Ensures extensions follow semantic versioning',
            check: (extension) => {
                try {
                    new ExtensionVersionManager_1.SemanticVersion(extension.version);
                    return { compatible: true, issues: [] };
                }
                catch (error) {
                    return {
                        compatible: false,
                        issues: [{
                                type: 'system-version',
                                severity: 'error',
                                message: `Invalid semantic version: ${extension.version}`
                            }]
                    };
                }
            }
        });
        this.addCompatibilityRule({
            id: 'extension-type-consistency',
            name: 'Extension Type Consistency',
            description: 'Ensures extension configuration matches declared type',
            check: (extension) => {
                const issues = [];
                if (extension.extension_type === 'ui' && !extension.ui) {
                    issues.push({
                        type: 'missing-dependency',
                        severity: 'error',
                        message: 'UI extension must have ui configuration'
                    });
                }
                if (extension.extension_type === 'node' && !extension.runtime?.node_types) {
                    issues.push({
                        type: 'missing-dependency',
                        severity: 'error',
                        message: 'Node extension must specify node_types'
                    });
                }
                return {
                    compatible: issues.length === 0,
                    issues
                };
            }
        });
    }
}
exports.ExtensionCompatibilityChecker = ExtensionCompatibilityChecker;
exports.extensionCompatibilityChecker = ExtensionCompatibilityChecker.getInstance();
//# sourceMappingURL=ExtensionCompatibilityChecker.js.map