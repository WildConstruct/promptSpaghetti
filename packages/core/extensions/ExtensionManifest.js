"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionManifestValidator = exports.extensionManifestParser = exports.ExtensionManifestValidator = exports.ExtensionManifestParser = exports.ExtensionManifestSchema = void 0;
const zod_1 = require("zod");
exports.ExtensionManifestSchema = zod_1.z.object({
    manifest_version: zod_1.z.literal('1.0'),
    id: zod_1.z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    name: zod_1.z.string().min(1).max(100),
    version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/),
    description: zod_1.z.string().min(1).max(500),
    author: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        email: zod_1.z.string().email().optional(),
        url: zod_1.z.string().url().optional()
    }),
    extension_type: zod_1.z.enum(['node', 'ui', 'transform', 'storage']),
    main: zod_1.z.string().min(1),
    dependencies: zod_1.z.object({
        system: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
        extensions: zod_1.z.record(zod_1.z.string().regex(/^[>=<~^]?\d+\.\d+\.\d+$/)).optional(),
        npm: zod_1.z.record(zod_1.z.string()).optional()
    }).optional(),
    permissions: zod_1.z.array(zod_1.z.enum([
        'file-system-read',
        'file-system-write',
        'network',
        'storage',
        'ui-components',
        'runtime-nodes',
        'system-info',
        'extensions-api'
    ])).optional(),
    capabilities: zod_1.z.object({
        provides: zod_1.z.array(zod_1.z.string()).optional(),
        requires: zod_1.z.array(zod_1.z.string()).optional(),
        optional: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    ui: zod_1.z.object({
        icon: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        themes: zod_1.z.array(zod_1.z.string()).optional(),
        css: zod_1.z.array(zod_1.z.string()).optional(),
        components: zod_1.z.record(zod_1.z.string()).optional()
    }).optional(),
    runtime: zod_1.z.object({
        node_types: zod_1.z.array(zod_1.z.string()).optional(),
        transforms: zod_1.z.array(zod_1.z.string()).optional(),
        storage_providers: zod_1.z.array(zod_1.z.string()).optional(),
        background_tasks: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    build: zod_1.z.object({
        output_dir: zod_1.z.string().default('dist'),
        entry_point: zod_1.z.string().optional(),
        externals: zod_1.z.array(zod_1.z.string()).optional(),
        assets: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    activation_events: zod_1.z.array(zod_1.z.string()).optional(),
    configuration: zod_1.z.object({
        schema: zod_1.z.record(zod_1.z.any()).optional(),
        defaults: zod_1.z.record(zod_1.z.any()).optional(),
        ui_schema: zod_1.z.record(zod_1.z.any()).optional()
    }).optional(),
    metadata: zod_1.z.object({
        license: zod_1.z.string().optional(),
        repository: zod_1.z.string().url().optional(),
        homepage: zod_1.z.string().url().optional(),
        bugs: zod_1.z.string().url().optional(),
        keywords: zod_1.z.array(zod_1.z.string()).optional(),
        categories: zod_1.z.array(zod_1.z.string()).optional(),
        changelog: zod_1.z.string().optional(),
        readme: zod_1.z.string().optional()
    }).optional(),
    compatibility: zod_1.z.object({
        min_system_version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
        max_system_version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
        platforms: zod_1.z.array(zod_1.z.enum(['web', 'desktop', 'server'])).optional(),
        browsers: zod_1.z.record(zod_1.z.string()).optional()
    }).optional(),
    security: zod_1.z.object({
        content_security_policy: zod_1.z.string().optional(),
        sandbox: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            permissions: zod_1.z.array(zod_1.z.string()).optional()
        }).optional(),
        trusted_domains: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    publishing: zod_1.z.object({
        private: zod_1.z.boolean().default(false),
        registry: zod_1.z.string().url().optional(),
        access: zod_1.z.enum(['public', 'private', 'restricted']).default('public'),
        tags: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
class ExtensionManifestParser {
    constructor() {
        this.cache = new Map();
    }
    static getInstance() {
        if (!ExtensionManifestParser.instance) {
            ExtensionManifestParser.instance = new ExtensionManifestParser();
        }
        return ExtensionManifestParser.instance;
    }
    parseManifest(jsonString) {
        try {
            const rawManifest = JSON.parse(jsonString);
            const result = exports.ExtensionManifestSchema.safeParse(rawManifest);
            if (!result.success) {
                return {
                    success: false,
                    error: 'Schema validation failed',
                    details: result.error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                        code: issue.code
                    }))
                };
            }
            const additionalValidation = this.validateManifestLogic(result.data);
            if (!additionalValidation.valid) {
                return {
                    success: false,
                    error: 'Logical validation failed',
                    details: additionalValidation.errors.map(error => ({
                        path: '',
                        message: error,
                        code: 'custom'
                    }))
                };
            }
            return {
                success: true,
                data: result.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'JSON parsing failed',
                details: [{
                        path: '',
                        message: error.message,
                        code: 'json_parse_error'
                    }]
            };
        }
    }
    async parseManifestFromFile(filePath) {
        try {
            if (this.cache.has(filePath)) {
                return {
                    success: true,
                    data: this.cache.get(filePath)
                };
            }
            const fileContent = await this.readFile(filePath);
            const result = this.parseManifest(fileContent);
            if (result.success) {
                this.cache.set(filePath, result.data);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: 'File reading failed',
                details: [{
                        path: filePath,
                        message: error.message,
                        code: 'file_read_error'
                    }]
            };
        }
    }
    validateDependencies(manifest, availableExtensions) {
        const errors = [];
        const warnings = [];
        if (!manifest.dependencies) {
            return { valid: true, errors: [], warnings: [] };
        }
        if (manifest.dependencies.extensions) {
            for (const [depId, versionRange] of Object.entries(manifest.dependencies.extensions)) {
                const depExtension = availableExtensions.get(depId);
                if (!depExtension) {
                    errors.push(`Missing dependency: ${depId}`);
                    continue;
                }
                if (!this.satisfiesVersionRange(depExtension.version, versionRange)) {
                    errors.push(`Dependency ${depId} version ${depExtension.version} does not satisfy ${versionRange}`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    checkCompatibility(manifest, systemVersion, platform) {
        const errors = [];
        const warnings = [];
        if (!manifest.compatibility) {
            return { valid: true, errors: [], warnings: [] };
        }
        if (manifest.compatibility.min_system_version) {
            if (this.compareVersions(systemVersion, manifest.compatibility.min_system_version) < 0) {
                errors.push(`System version ${systemVersion} is below minimum required ${manifest.compatibility.min_system_version}`);
            }
        }
        if (manifest.compatibility.max_system_version) {
            if (this.compareVersions(systemVersion, manifest.compatibility.max_system_version) > 0) {
                errors.push(`System version ${systemVersion} is above maximum supported ${manifest.compatibility.max_system_version}`);
            }
        }
        if (manifest.compatibility.platforms) {
            if (!manifest.compatibility.platforms.includes(platform)) {
                errors.push(`Platform ${platform} is not supported`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateManifestTemplate(options) {
        const template = {
            manifest_version: '1.0',
            id: options.id,
            name: options.name,
            version: options.version || '1.0.0',
            description: options.description || 'Extension description',
            author: {
                name: options.author || 'Author Name',
                email: options.authorEmail,
                url: options.authorUrl
            },
            extension_type: options.extensionType,
            main: options.main || 'index.js',
            dependencies: {
                system: options.systemVersion || '1.0.0'
            },
            permissions: options.permissions || [],
            capabilities: {
                provides: options.provides || [],
                requires: options.requires || []
            },
            metadata: {
                license: options.license || 'MIT',
                keywords: options.keywords || [],
                categories: options.categories || []
            },
            compatibility: {
                min_system_version: options.minSystemVersion || '1.0.0',
                platforms: options.platforms || ['web']
            },
            security: {
                sandbox: {
                    enabled: true
                }
            }
        };
        switch (options.extensionType) {
            case 'node':
                template.runtime = {
                    node_types: options.nodeTypes || []
                };
                break;
            case 'ui':
                template.ui = {
                    category: options.uiCategory || 'general',
                    components: options.uiComponents || {}
                };
                break;
            case 'transform':
                template.runtime = {
                    transforms: options.transforms || []
                };
                break;
            case 'storage':
                template.runtime = {
                    storage_providers: options.storageProviders || []
                };
                break;
        }
        return template;
    }
    clearCache() {
        this.cache.clear();
    }
    validateManifestLogic(manifest) {
        const errors = [];
        const warnings = [];
        if (!manifest.main.endsWith('.js') && !manifest.main.endsWith('.ts')) {
            warnings.push('Main file should have .js or .ts extension');
        }
        if (manifest.extension_type === 'node' && !manifest.runtime?.node_types) {
            warnings.push('Node extensions should specify node_types in runtime configuration');
        }
        if (manifest.extension_type === 'ui' && !manifest.ui?.components) {
            warnings.push('UI extensions should specify components in ui configuration');
        }
        if (manifest.permissions) {
            if (manifest.permissions.includes('file-system-write') && !manifest.permissions.includes('file-system-read')) {
                warnings.push('file-system-write permission typically requires file-system-read permission');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    satisfiesVersionRange(version, range) {
        if (range.startsWith('>=')) {
            return this.compareVersions(version, range.substring(2)) >= 0;
        }
        if (range.startsWith('>')) {
            return this.compareVersions(version, range.substring(1)) > 0;
        }
        if (range.startsWith('<=')) {
            return this.compareVersions(version, range.substring(2)) <= 0;
        }
        if (range.startsWith('<')) {
            return this.compareVersions(version, range.substring(1)) < 0;
        }
        if (range.startsWith('~')) {
            const targetVersion = range.substring(1);
            const [major, minor] = targetVersion.split('.');
            const upperBound = `${major}.${parseInt(minor) + 1}.0`;
            return this.compareVersions(version, targetVersion) >= 0 &&
                this.compareVersions(version, upperBound) < 0;
        }
        if (range.startsWith('^')) {
            const targetVersion = range.substring(1);
            const [major] = targetVersion.split('.');
            const upperBound = `${parseInt(major) + 1}.0.0`;
            return this.compareVersions(version, targetVersion) >= 0 &&
                this.compareVersions(version, upperBound) < 0;
        }
        return version === range;
    }
    compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            if (v1Part > v2Part)
                return 1;
            if (v1Part < v2Part)
                return -1;
        }
        return 0;
    }
    async readFile(filePath) {
        return Promise.resolve('{}');
    }
}
exports.ExtensionManifestParser = ExtensionManifestParser;
class ExtensionManifestValidator {
    constructor() {
        this.parser = ExtensionManifestParser.getInstance();
    }
    static getInstance() {
        if (!ExtensionManifestValidator.instance) {
            ExtensionManifestValidator.instance = new ExtensionManifestValidator();
        }
        return ExtensionManifestValidator.instance;
    }
    validateManifest(manifest, context) {
        const errors = [];
        const warnings = [];
        const depValidation = this.parser.validateDependencies(manifest, context.availableExtensions);
        errors.push(...depValidation.errors);
        warnings.push(...depValidation.warnings);
        const compatValidation = this.parser.checkCompatibility(manifest, context.systemVersion, context.platform);
        errors.push(...compatValidation.errors);
        warnings.push(...compatValidation.warnings);
        const permValidation = this.validatePermissions(manifest, context.grantedPermissions);
        errors.push(...permValidation.errors);
        warnings.push(...permValidation.warnings);
        const securityValidation = this.validateSecurity(manifest);
        errors.push(...securityValidation.errors);
        warnings.push(...securityValidation.warnings);
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    validatePermissions(manifest, grantedPermissions) {
        const errors = [];
        const warnings = [];
        if (!manifest.permissions) {
            return { valid: true, errors: [], warnings: [] };
        }
        for (const permission of manifest.permissions) {
            if (!grantedPermissions.includes(permission)) {
                errors.push(`Permission not granted: ${permission}`);
            }
            const dangerousPermissions = ['file-system-write', 'network'];
            if (dangerousPermissions.includes(permission)) {
                warnings.push(`Dangerous permission requested: ${permission}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    validateSecurity(manifest) {
        const errors = [];
        const warnings = [];
        if (!manifest.security) {
            warnings.push('No security configuration specified');
            return { valid: true, errors: [], warnings: [] };
        }
        if (manifest.security.content_security_policy) {
            if (!this.isValidCSP(manifest.security.content_security_policy)) {
                errors.push('Invalid Content Security Policy');
            }
        }
        if (manifest.security.sandbox) {
            if (!manifest.security.sandbox.enabled) {
                warnings.push('Sandbox is disabled - this may be a security risk');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    isValidCSP(csp) {
        return csp.includes('default-src') || csp.includes('script-src');
    }
}
exports.ExtensionManifestValidator = ExtensionManifestValidator;
exports.extensionManifestParser = ExtensionManifestParser.getInstance();
exports.extensionManifestValidator = ExtensionManifestValidator.getInstance();
//# sourceMappingURL=ExtensionManifest.js.map