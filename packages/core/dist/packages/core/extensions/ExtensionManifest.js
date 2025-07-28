/**
 * Extension Manifest - Epic 8.4 Story 8.4.3
 * Standardized manifest format for extensions with validation and parsing
 */
import { z } from 'zod';
import { ExtensionValidationResult } from './interfaces/ExtensionInterfaces';
// Extension Manifest Schema
export const ExtensionManifestSchema = z.object({});
// Basic Information
manifest_version: z.literal('1.0'),
    id;
z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    name;
z.string().min(1).max(100),
    version;
z.string().regex(/^\d+\.\d+\.\d+$/),
    description;
z.string().min(1).max(500),
    // Author Information
    author;
z.object({});
name: z.string().min(1).max(100),
    email;
z.string().email().optional(),
    url;
z.string().url().optional(),
;
// Extension Type and Main Entry
extension_type: z.enum(['node', 'ui', 'transform', 'storage']),
    main;
z.string().min(1),
    // Dependencies
    dependencies;
z.object({});
system: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
    extensions;
z.record(z.string().regex(/^[>=<~^]?\d+\.\d+\.\d+$/)).optional(),
    npm;
z.record(z.string()).optional(),
;
optional(),
    // Permissions
    permissions;
z.array(z.enum([]), 'file-system-read', 'file-system-write', 'network', 'storage', 'ui-components', 'runtime-nodes', 'system-info', 'extensions-api');
optional(),
    // Capabilities
    capabilities;
z.object({});
provides: z.array(z.string()).optional(),
    requires;
z.array(z.string()).optional(),
    optional;
z.array(z.string()).optional(),
;
optional(),
    // UI Configuration
    ui;
z.object({});
icon: z.string().optional(),
    category;
z.string().optional(),
    themes;
z.array(z.string()).optional(),
    css;
z.array(z.string()).optional(),
    components;
z.record(z.string()).optional(),
;
optional(),
    // Runtime Configuration
    runtime;
z.object({});
node_types: z.array(z.string()).optional(),
    transforms;
z.array(z.string()).optional(),
    storage_providers;
z.array(z.string()).optional(),
    background_tasks;
z.array(z.string()).optional(),
;
optional(),
    // Build and Development
    build;
z.object({});
output_dir: z.string().default('dist'),
    entry_point;
z.string().optional(),
    externals;
z.array(z.string()).optional(),
    assets;
z.array(z.string()).optional(),
;
optional(),
    // Activation Events
    activation_events;
z.array(z.string()).optional(),
    // Configuration Schema
    configuration;
z.object({});
schema: z.record(z.any()).optional(),
    defaults;
z.record(z.any()).optional(),
    ui_schema;
z.record(z.any()).optional(),
;
optional(),
    // Metadata
    metadata;
z.object({});
license: z.string().optional(),
    repository;
z.string().url().optional(),
    homepage;
z.string().url().optional(),
    bugs;
z.string().url().optional(),
    keywords;
z.array(z.string()).optional(),
    categories;
z.array(z.string()).optional(),
    changelog;
z.string().optional(),
    readme;
z.string().optional(),
;
optional(),
    // Compatibility
    compatibility;
z.object({});
min_system_version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
    max_system_version;
z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
    platforms;
z.array(z.enum(['web', 'desktop', 'server'])).optional(),
    browsers;
z.record(z.string()).optional(),
;
optional(),
    // Security
    security;
z.object({});
content_security_policy: z.string().optional(),
    sandbox;
z.object({});
enabled: z.boolean().default(true),
    permissions;
z.array(z.string()).optional(),
;
optional(),
    trusted_domains;
z.array(z.string()).optional();
optional(),
    // Publishing
    publishing;
z.object({});
private: z.boolean().default(false),
    registry;
z.string().url().optional(),
    access;
z.enum(['public', 'private', 'restricted']).default('public'),
    tags;
z.array(z.string()).optional(),
;
optional();
;
// Extension Manifest Parser
export class ExtensionManifestParser {
    static instance;
    cache = new Map();
    constructor() { }
    static getInstance() {
        if (!ExtensionManifestParser.instance) {
            ExtensionManifestParser.instance = new ExtensionManifestParser();
            return ExtensionManifestParser.instance;
            /**
            * Parse manifest from JSON string
            */
        }
        /**
        * Parse manifest from JSON string
        */
    }
    /**
    * Parse manifest from JSON string
    */
    parseManifest(jsonString) {
        try {
            // Parse JSON
            const rawManifest = JSON.parse(jsonString);
            // Validate against schema
            const result = ExtensionManifestSchema.safeParse(rawManifest);
            if (!result.success) {
                return {
                    success: false,
                    error: 'Schema validation failed',
                    details: result.error.issues.map(issue => ({}), path, issue.path.join('.'), message, issue.message, code, issue.code)
                };
            }
            ;
            // Additional validation
            const additionalValidation = this.validateManifestLogic(result.data);
            if (!additionalValidation.valid) {
                return {
                    success: false,
                    error: 'Logical validation failed',
                    details: additionalValidation.errors.map(error => ({}), path, '', message, error, code, 'custom')
                };
            }
            ;
            return {
                success: true,
                data: result.data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'JSON parsing failed',
                details: [{},
                    path, '',
                    message, error.message,
                    code, 'json_parse_error',]
            };
        }
        ;
        /**
         * Parse manifest from file path
         */
    }
    /**
     * Parse manifest from file path
     */
    async parseManifestFromFile(filePath) {
        try {
            // Check cache first
            if (this.cache.has(filePath)) {
                return {
                    success: true,
                    data: this.cache.get(filePath),
                };
                // Read file (this would use fs in a real implementation)
                const fileContent = await this.readFile(filePath);
                // Parse manifest
                const result = this.parseManifest(fileContent);
                // Cache if successful
                if (result.success) {
                    this.cache.set(filePath, result.data);
                    return result;
                }
                try { }
                catch (error) {
                    return {
                        success: false,
                        error: 'File reading failed',
                        details: [{},
                            path, filePath,
                            message, error.message,
                            code, 'file_read_error',]
                    };
                }
                ;
                /**
                 * Validate manifest dependencies
                 */
            }
            /**
             * Validate manifest dependencies
             */
        }
        /**
         * Validate manifest dependencies
         */
        finally {
        }
        /**
         * Validate manifest dependencies
         */
    }
    availableExtensions;
    ExtensionValidationResult;
}
{
    const errors = [];
    const warnings = [];
    if (!manifest.dependencies) {
        return { valid: true, errors: [], warnings: [] };
        // Check extension dependencies
        if (manifest.dependencies.extensions) {
            for (const [depId, versionRange] of Object.entries(manifest.dependencies.extensions)) {
                const depExtension = availableExtensions.get(depId);
                if (!depExtension) {
                    errors.push(`Missing dependency: ${depId}`);
                }
                continue;
                if (!this.satisfiesVersionRange(depExtension.version, versionRange)) {
                    errors.push(`Dependency ${depId} version ${depExtension.version} does not satisfy ${versionRange}`);
                }
                return {
                    valid: errors.length === 0,
                    errors,
                    warnings
                };
                checkCompatibility(manifest, ExtensionManifest);
                systemVersion: string,
                    platform;
                string;
                ExtensionValidationResult;
                {
                    const errors = [];
                    const warnings = [];
                    if (!manifest.compatibility) {
                        return { valid: true, errors: [], warnings: [] };
                        // Check system version compatibility
                        if (manifest.compatibility.min_system_version) {
                            if (this.compareVersions(systemVersion, manifest.compatibility.min_system_version) < 0) {
                                errors.push(`System version ${systemVersion} is below minimum required ${manifest.compatibility.min_system_version}`);
                            }
                            if (manifest.compatibility.max_system_version) {
                                if (this.compareVersions(systemVersion, manifest.compatibility.max_system_version) > 0) {
                                    errors.push(`System version ${systemVersion} is above maximum supported ${manifest.compatibility.max_system_version}`);
                                }
                                // Check platform compatibility
                                if (manifest.compatibility.platforms) {
                                    if (!manifest.compatibility.platforms.includes(platform)) {
                                        errors.push(`Platform ${platform} is not supported`);
                                    }
                                    return {
                                        valid: errors.length === 0,
                                        errors,
                                        warnings
                                    };
                                    generateManifestTemplate(options, ManifestTemplateOptions);
                                    ExtensionManifest;
                                    {
                                        const template = {
                                            manifest_version: '1.0',
                                            id: options.id,
                                            name: options.name,
                                            version: options.version || '1.0.0',
                                            description: options.description || 'Extension description',
                                            author: {
                                                name: options.author || 'Author Name',
                                                email: options.authorEmail,
                                                url: options.authorUrl,
                                            },
                                            extension_type: options.extensionType,
                                            main: options.main || 'index.js',
                                            dependencies: {
                                                system: options.systemVersion || '1.0.0',
                                            },
                                            permissions: options.permissions || [],
                                            capabilities: {
                                                provides: options.provides || [],
                                                requires: options.requires || [],
                                            },
                                            metadata: {
                                                license: options.license || 'MIT',
                                                keywords: options.keywords || [],
                                                categories: options.categories || [],
                                            },
                                            compatibility: {
                                                min_system_version: options.minSystemVersion || '1.0.0',
                                                platforms: options.platforms || ['web'],
                                            },
                                            security: {
                                                sandbox: {
                                                    enabled: true,
                                                },
                                                // Add type-specific configurations
                                                switch(options) { }, : .extensionType } }, { case: , 'node': , template, runtime = {
                                            node_types: options.nodeTypes || [],
                                        } };
                                        break;
                                        'ui';
                                        template.ui = {
                                            category: options.uiCategory || 'general',
                                            components: options.uiComponents || {}
                                        };
                                        break;
                                        'transform';
                                        template.runtime = {
                                            transforms: options.transforms || [],
                                        };
                                        break;
                                        'storage';
                                        template.runtime = {
                                            storage_providers: options.storageProviders || [],
                                        };
                                        break;
                                        return template;
                                        clearCache();
                                        void {
                                            this: .cache.clear(),
                                            /**
                                            * Private helper methods
                                            */
                                            validateManifestLogic(manifest) {
                                                const errors = [];
                                                const warnings = [];
                                                // Check main file extension
                                                if (!manifest.main.endsWith('.js') && !manifest.main.endsWith('.ts')) {
                                                    warnings.push('Main file should have .js or .ts extension');
                                                    // Check extension type consistency
                                                    if (manifest.extension_type === 'node' && !manifest.runtime?.node_types) {
                                                        warnings.push('Node extensions should specify node_types in runtime configuration');
                                                        if (manifest.extension_type === 'ui' && !manifest.ui?.components) {
                                                            warnings.push('UI extensions should specify components in ui configuration');
                                                            // Check permissions consistency
                                                            if (manifest.permissions) {
                                                                if (manifest.permissions.includes('file-system-write') && !manifest.permissions.includes('file-system-read')) {
                                                                    warnings.push('file-system-write permission typically requires file-system-read permission');
                                                                    return {
                                                                        valid: errors.length === 0,
                                                                        errors,
                                                                        warnings
                                                                    };
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            satisfiesVersionRange(version, range) {
                                                // Simple version range checking (in a real implementation, use semver library)
                                                if (range.startsWith('>=')) {
                                                    return this.compareVersions(version, range.substring(2)) >= 0;
                                                    if (range.startsWith('>')) {
                                                        return this.compareVersions(version, range.substring(1)) > 0;
                                                        if (range.startsWith('<=')) {
                                                            return this.compareVersions(version, range.substring(2)) <= 0;
                                                            if (range.startsWith('<')) {
                                                                return this.compareVersions(version, range.substring(1)) < 0;
                                                                if (range.startsWith('~')) {
                                                                    // Tilde range (~1.2.3 := >=1.2.3 <1.3.0)
                                                                    const targetVersion = range.substring(1);
                                                                    const [major, minor] = targetVersion.split('.');
                                                                    const upperBound = `${major}.${parseInt(minor) + 1}.0`;
                                                                }
                                                                return this.compareVersions(version, targetVersion) >= 0 &&
                                                                    this.compareVersions(version, upperBound) < 0;
                                                                if (range.startsWith('^')) {
                                                                    // Caret range (^1.2.3 := >=1.2.3 <2.0.0)
                                                                    const targetVersion = range.substring(1);
                                                                    const [major] = targetVersion.split('.');
                                                                    const upperBound = `${parseInt(major) + 1}.0.0`;
                                                                }
                                                                return this.compareVersions(version, targetVersion) >= 0 &&
                                                                    this.compareVersions(version, upperBound) < 0;
                                                                // Exact match
                                                                return version === range;
                                                            }
                                                        }
                                                    }
                                                }
                                            },
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
                                                    return 0;
                                                }
                                            },
                                            async readFile(filePath) {
                                                // In a real implementation, this would use fs.readFile
                                                // For now, we'll simulate reading a file
                                                return Promise.resolve('{}');
                                                // Extension Manifest Validator
                                                export class ExtensionManifestValidator {
                                                    static instance;
                                                    parser;
                                                    constructor() {
                                                        this.parser = ExtensionManifestParser.getInstance();
                                                    }
                                                    static getInstance() {
                                                        if (!ExtensionManifestValidator.instance) {
                                                            ExtensionManifestValidator.instance = new ExtensionManifestValidator();
                                                            return ExtensionManifestValidator.instance;
                                                            /**
                                                            * Comprehensive manifest validation
                                                            */
                                                        }
                                                        /**
                                                        * Comprehensive manifest validation
                                                        */
                                                    }
                                                }
                                                ();
                                                manifest: ExtensionManifest,
                                                    context;
                                                ValidationContext;
                                                ExtensionValidationResult;
                                                {
                                                    const errors = [];
                                                    const warnings = [];
                                                    // Schema validation (already done during parsing)
                                                    // Dependency validation
                                                    const depValidation = this.parser.validateDependencies(manifest, context.availableExtensions);
                                                    errors.push(...depValidation.errors);
                                                    warnings.push(...depValidation.warnings);
                                                    // Compatibility validation
                                                    const compatValidation = this.parser.checkCompatibility(manifest, context.systemVersion, context.platform);
                                                    errors.push(...compatValidation.errors);
                                                    warnings.push(...compatValidation.warnings);
                                                    // Permission validation
                                                    const permValidation = this.validatePermissions(manifest, context.grantedPermissions);
                                                    errors.push(...permValidation.errors);
                                                    warnings.push(...permValidation.warnings);
                                                    // Security validation
                                                    const securityValidation = this.validateSecurity(manifest);
                                                    errors.push(...securityValidation.errors);
                                                    warnings.push(...securityValidation.warnings);
                                                    return {
                                                        valid: errors.length === 0,
                                                        errors,
                                                        warnings
                                                    };
                                                    /**
                                                     * Validate manifest permissions
                                                     */
                                                }
                                                /**
                                                 * Validate manifest permissions
                                                 */
                                            }
                                            /**
                                             * Validate manifest permissions
                                             */
                                        }();
                                        manifest: ExtensionManifest,
                                            grantedPermissions;
                                        string,
                                        ;
                                        ExtensionValidationResult;
                                        {
                                            const errors = [];
                                            const warnings = [];
                                            if (!manifest.permissions) {
                                                return { valid: true, errors: [], warnings: [] };
                                                for (const permission of manifest.permissions) {
                                                    if (!grantedPermissions.includes(permission)) {
                                                        errors.push(`Permission not granted: ${permission}`);
                                                    }
                                                    // Check for dangerous permissions
                                                    const dangerousPermissions = ['file-system-write', 'network'];
                                                    if (dangerousPermissions.includes(permission)) {
                                                        warnings.push(`Dangerous permission requested: ${permission}`);
                                                    }
                                                    return {
                                                        valid: errors.length === 0,
                                                        errors,
                                                        warnings
                                                    };
                                                    validateSecurity(manifest, ExtensionManifest);
                                                    ExtensionValidationResult;
                                                    {
                                                        const errors = [];
                                                        const warnings = [];
                                                        if (!manifest.security) {
                                                            warnings.push('No security configuration specified');
                                                            return { valid: true, errors: [], warnings: [] };
                                                            // Validate CSP
                                                            if (manifest.security.content_security_policy) {
                                                                if (!this.isValidCSP(manifest.security.content_security_policy)) {
                                                                    errors.push('Invalid Content Security Policy');
                                                                    // Validate sandbox settings
                                                                    if (manifest.security.sandbox) {
                                                                        if (!manifest.security.sandbox.enabled) {
                                                                            warnings.push('Sandbox is disabled - this may be a security risk');
                                                                            return {
                                                                                valid: errors.length === 0,
                                                                                errors,
                                                                                warnings
                                                                            };
                                                                            isValidCSP(csp, string);
                                                                            boolean;
                                                                            {
                                                                                // Basic CSP validation (in a real implementation, use proper CSP parser)
                                                                                return csp.includes('default-src') || csp.includes('script-src');
                                                                                 > ;
                                                                                // Export singletons
                                                                                export const extensionManifestParser = ExtensionManifestParser.getInstance();
                                                                                export const extensionManifestValidator = ExtensionManifestValidator.getInstance();
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
