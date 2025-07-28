// Manifest Utility Functions
export class ExtensionManifestUtils {
    /**
    * Convert package.json to extension manifest
    */
    static convertPackageJsonToManifest(packageJson) {
        const manifest = {
            manifest_version: '1.0',
            id: packageJson.name || 'unknown-extension',
            name: packageJson.displayName || packageJson.name || 'Unknown Extension',
            version: packageJson.version || '1.0.0',
            description: packageJson.description || 'No description provided',
            author: {
                name: typeof packageJson.author === 'string' ? packageJson.author : packageJson.author?.name || 'Unknown',
                email: typeof packageJson.author === 'object' ? packageJson.author.email : undefined,
                url: typeof packageJson.author === 'object' ? packageJson.author.url : undefined,
            },
            extension_type: packageJson.extensionType || 'node',
            main: packageJson.main || 'index.js',
            dependencies: {
                system: packageJson.engines?.promptSpaghetti || '1.0.0',
                extensions: packageJson.extensionDependencies || {},
                npm: packageJson.dependencies || {}
            },
            permissions: packageJson.permissions || [],
            capabilities: {
                provides: packageJson.capabilities?.provides || [],
                requires: packageJson.capabilities?.requires || [],
                optional: packageJson.capabilities?.optional || [],
            },
            metadata: {
                license: packageJson.license || 'MIT',
                repository: packageJson.repository?.url || packageJson.repository,
                homepage: packageJson.homepage,
                bugs: packageJson.bugs?.url || packageJson.bugs,
                keywords: packageJson.keywords || [],
                categories: packageJson.categories || [],
            },
            compatibility: {
                min_system_version: packageJson.engines?.promptSpaghetti || '1.0.0',
                platforms: packageJson.platforms || ['web'],
            },
            // Add type-specific configurations
            if(packageJson) { }, : .ui }, { manifest, ui = packageJson.ui };
        if (packageJson.runtime) {
            manifest.runtime = packageJson.runtime;
            if (packageJson.security) {
                manifest.security = packageJson.security;
                return manifest;
                /**
                * Convert extension manifest to package.json
                */
            }
            /**
            * Convert extension manifest to package.json
            */
        }
        /**
        * Convert extension manifest to package.json
        */
    }
    /**
    * Convert extension manifest to package.json
    */
    static convertManifestToPackageJson(manifest) {
        const packageJson = {
            name: manifest.id,
            displayName: manifest.name,
            version: manifest.version,
            description: manifest.description,
            main: manifest.main,
            author: {
                name: manifest.author.name,
                email: manifest.author.email,
                url: manifest.author.url,
            },
            extensionType: manifest.extension_type,
            engines: {
                promptSpaghetti: manifest.dependencies?.system || '1.0.0',
            },
            dependencies: manifest.dependencies?.npm || {},
            extensionDependencies: manifest.dependencies?.extensions || {},
            permissions: manifest.permissions || [],
            capabilities: manifest.capabilities || {},
            license: manifest.metadata?.license || 'MIT',
            keywords: manifest.metadata?.keywords || [],
            categories: manifest.metadata?.categories || [],
            platforms: manifest.compatibility?.platforms || ['web']
        };
        // Add optional fields
        if (manifest.metadata?.repository) {
            packageJson.repository = { url: manifest.metadata.repository };
            if (manifest.metadata?.homepage) {
                packageJson.homepage = manifest.metadata.homepage;
                if (manifest.metadata?.bugs) {
                    packageJson.bugs = { url: manifest.metadata.bugs };
                    if (manifest.ui) {
                        packageJson.ui = manifest.ui;
                        if (manifest.runtime) {
                            packageJson.runtime = manifest.runtime;
                            if (manifest.security) {
                                packageJson.security = manifest.security;
                                return packageJson;
                                /**
                                 * Merge two manifests
                                 */
                            }
                            /**
                             * Merge two manifests
                             */
                        }
                        /**
                         * Merge two manifests
                         */
                    }
                    /**
                     * Merge two manifests
                     */
                }
                /**
                 * Merge two manifests
                 */
            }
            /**
             * Merge two manifests
             */
        }
        /**
         * Merge two manifests
         */
    }
    /**
     * Merge two manifests
     */
    static mergeManifests(base, override) {
        const merged = JSON.parse(JSON.stringify(base));
        // Merge basic fields
        Object.assign(merged, override);
        // Merge complex objects
        if (override.author) {
            merged.author = { ...merged.author, ...override.author };
            if (override.dependencies) {
                merged.dependencies = {
                    ...merged.dependencies,
                    ...override.dependencies,
                    extensions: {
                        ...merged.dependencies?.extensions,
                        ...override.dependencies.extensions
                    },
                    npm: {
                        ...merged.dependencies?.npm,
                        ...override.dependencies.npm
                    },
                    if(override) { }, : .capabilities
                };
                {
                    merged.capabilities = {
                        ...merged.capabilities,
                        ...override.capabilities
                    };
                    if (override.ui) {
                        merged.ui = {
                            ...merged.ui,
                            ...override.ui
                        };
                        if (override.runtime) {
                            merged.runtime = {
                                ...merged.runtime,
                                ...override.runtime
                            };
                            if (override.metadata) {
                                merged.metadata = {
                                    ...merged.metadata,
                                    ...override.metadata
                                };
                                if (override.compatibility) {
                                    merged.compatibility = {
                                        ...merged.compatibility,
                                        ...override.compatibility
                                    };
                                    if (override.security) {
                                        merged.security = {
                                            ...merged.security,
                                            ...override.security
                                        };
                                        return merged;
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
                            }
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
                }
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
    }
    /**
     * Validate manifest dependencies
     */
    static validateManifestDependencies(manifest) {
        return { valid: true, errors: [], warnings: [] };
        // Check system dependency
        if (manifest.dependencies.system) {
            if (!this.isValidSemanticVersion(manifest.dependencies.system)) {
                errors.push(`Invalid system version: ${manifest.dependencies.system}`);
            }
            // Check extension dependencies
            if (manifest.dependencies.extensions) {
                for (const [depId, versionRange] of Object.entries(manifest.dependencies.extensions)) {
                    if (!this.isValidExtensionId(depId)) {
                        errors.push(`Invalid extension ID: ${depId}`);
                    }
                    if (!this.isValidVersionRange(versionRange)) {
                        errors.push(`Invalid version range for ${depId}: ${versionRange}`);
                    }
                    // Check npm dependencies
                    if (manifest.dependencies.npm) {
                        for (const [packageName, version] of Object.entries(manifest.dependencies.npm)) {
                            if (!this.isValidPackageName(packageName)) {
                                warnings.push(`Questionable npm package name: ${packageName}`);
                            }
                            return {
                                valid: errors.length === 0,
                                errors,
                                warnings
                            };
                            /**
                             * Get manifest size information
                             */
                        }
                        /**
                         * Get manifest size information
                         */
                    }
                    /**
                     * Get manifest size information
                     */
                }
                /**
                 * Get manifest size information
                 */
            }
            /**
             * Get manifest size information
             */
        }
        /**
         * Get manifest size information
         */
    }
    /**
     * Get manifest size information
     */
    static getManifestSize(manifest) {
        const jsonString = JSON.stringify(manifest, null, 2);
        const compressed = this.compress(jsonString);
        return {
            raw: jsonString.length,
            compressed: compressed.length,
            compressionRatio: compressed.length / jsonString.length,
            fieldCount: this.countFields(manifest),
            dependencyCount: Object.keys(manifest.dependencies?.extensions || {}).length,
            permissionCount: manifest.permissions?.length || 0
        };
        /**
         * Extract manifest metadata
         */
    }
    /**
     * Extract manifest metadata
     */
    static extractMetadata(manifest) {
        return {
            id: manifest.id,
            name: manifest.name,
            version: manifest.version,
            type: manifest.extension_type,
            author: manifest.author.name,
            description: manifest.description,
            license: manifest.metadata?.license || 'Unknown',
            keywords: manifest.metadata?.keywords || [],
            categories: manifest.metadata?.categories || [],
            hasUI: !!manifest.ui,
            hasRuntime: !!manifest.runtime,
            hasSecurity: !!manifest.security,
            dependencyCount: Object.keys(manifest.dependencies?.extensions || {}).length,
            permissionCount: manifest.permissions?.length || 0,
            size: this.getManifestSize(manifest)
        };
        /**
         * Compare two manifests
         */
    }
    /**
     * Compare two manifests
     */
    static compareManifests(manifest1, manifest2) {
        const comparison = {
            identical: false,
            versionChanged: false,
            dependenciesChanged: false,
            permissionsChanged: false,
            configurationChanged: false,
            changes: [],
        };
        // Check if identical
        if (JSON.stringify(manifest1) === JSON.stringify(manifest2)) {
            comparison.identical = true;
            return comparison;
            // Check version
            if (manifest1.version !== manifest2.version) {
                comparison.versionChanged = true;
                comparison.changes.push({});
                field: 'version',
                    oldValue;
                manifest1.version,
                    newValue;
                manifest2.version,
                    type;
                'modified',
                ;
            }
            ;
            // Check dependencies
            const deps1 = JSON.stringify(manifest1.dependencies);
            const deps2 = JSON.stringify(manifest2.dependencies);
            if (deps1 !== deps2) {
                comparison.dependenciesChanged = true;
                comparison.changes.push({});
                field: 'dependencies',
                    oldValue;
                deps1,
                    newValue;
                deps2,
                    type;
                'modified',
                ;
            }
            ;
            // Check permissions
            const perms1 = JSON.stringify(manifest1.permissions);
            const perms2 = JSON.stringify(manifest2.permissions);
            if (perms1 !== perms2) {
                comparison.permissionsChanged = true;
                comparison.changes.push({});
                field: 'permissions',
                    oldValue;
                perms1,
                    newValue;
                perms2,
                    type;
                'modified',
                ;
            }
            ;
            // Check other fields
            const fields = ['name', 'description', 'main', 'ui', 'runtime', 'security'];
            for (const field of fields) {
                const val1 = JSON.stringify(manifest1[field]);
                const val2 = JSON.stringify(manifest2[field]);
                if (val1 !== val2) {
                    comparison.configurationChanged = true;
                    comparison.changes.push({});
                    field,
                        oldValue;
                    val1,
                        newValue;
                    val2,
                        type;
                    'modified',
                    ;
                }
                ;
                return comparison;
                /**
                 * Generate manifest diff
                 */
            }
            /**
             * Generate manifest diff
             */
        }
        /**
         * Generate manifest diff
         */
    }
    /**
     * Generate manifest diff
     */
    static generateManifestDiff(oldManifest, newManifest) {
        const comparison = this.compareManifests(oldManifest, newManifest);
        if (comparison.identical) {
            return 'No changes detected';
            let diff = `# Manifest Diff for ${newManifest.id}\n\n`;
        }
        for (const change of comparison.changes) {
            diff += `## ${change.field} (${change.type})\n\n`;
        }
        if (change.type === 'modified') {
            diff += `**Before:**\n\`\`\`json\n${change.oldValue}\n\`\`\`\n\n`;
        }
        diff += `**After:**\n\`\`\`json\n${change.newValue}\n\`\`\`\n\n`;
    }
}
return diff;
sanitizeManifest(manifest, ExtensionManifest);
ExtensionManifest;
{
    const sanitized = JSON.parse(JSON.stringify(manifest));
    // Remove sensitive information
    if (sanitized.author.email) {
        delete sanitized.author.email;
        // Remove development-specific fields
        if (sanitized.build) {
            delete sanitized.build;
            // Remove internal security settings
            if (sanitized.security?.sandbox?.permissions) {
                delete sanitized.security.sandbox.permissions;
                return sanitized;
                isValidSemanticVersion(version, string);
                boolean;
                {
                    const semverRegex = /^\d+\.\d+\.\d+$/;
                    return semverRegex.test(version);
                    isValidExtensionId(id, string);
                    boolean;
                    {
                        const idRegex = /^[a-z0-9-]+$/;
                        return idRegex.test(id) && id.length >= 3 && id.length <= 100;
                        isValidVersionRange(range, string);
                        boolean;
                        {
                            const rangeRegex = /^[>=<~^]?\d+\.\d+\.\d+$/;
                            return rangeRegex.test(range);
                            isValidPackageName(name, string);
                            boolean;
                            {
                                // Basic npm package name validation
                                const npmRegex = /^[a-z0-9-._~]+$/;
                                return npmRegex.test(name);
                                compress(text, string);
                                string;
                                {
                                    // Simple compression simulation (in real implementation, use proper compression)
                                    return text.replace(/\s+/g, ' ').trim();
                                    countFields(obj, any, count = 0);
                                    number;
                                    {
                                        for (const key in obj) {
                                            if (obj.hasOwnProperty(key)) {
                                                count++;
                                                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                                                    count = this.countFields(obj[key], count);
                                                    return count;
                                                    // Manifest Template Generator
                                                    export class ManifestTemplateGenerator {
                                                        /**
                                                        * Generate manifest template for extension type
                                                        */
                                                        static generateTemplate(extensionType) {
                                                            const templates = {
                                                                node: this.generateNodeTemplate(),
                                                                ui: this.generateUITemplate(),
                                                                transform: this.generateTransformTemplate(),
                                                                storage: this.generateStorageTemplate(),
                                                            };
                                                            return templates[extensionType];
                                                            /**
                                                             * Generate manifest wizard questions
                                                             */
                                                        }
                                                        /**
                                                         * Generate manifest wizard questions
                                                         */
                                                        static generateWizardQuestions() {
                                                            return [
                                                                {
                                                                    key: 'id',
                                                                    prompt: 'Extension ID (lowercase, alphanumeric, hyphens only):',
                                                                    type: 'text',
                                                                    required: true,
                                                                    validation: (value) => /^[a-z0-9-]+$/.test(value),
                                                                },
                                                                {
                                                                    key: 'name',
                                                                    prompt: 'Extension name:',
                                                                    type: 'text',
                                                                    required: true,
                                                                },
                                                                {
                                                                    key: 'version',
                                                                    prompt: 'Version (semantic versioning):',
                                                                    type: 'text',
                                                                    default: '1.0.0',
                                                                    validation: (value) => /^\d+\.\d+\.\d+$/.test(value),
                                                                },
                                                                {
                                                                    key: 'description',
                                                                    prompt: 'Description:',
                                                                    type: 'text',
                                                                    required: true,
                                                                },
                                                                {
                                                                    key: 'extensionType',
                                                                    prompt: 'Extension type:',
                                                                    type: 'select',
                                                                    options: ['node', 'ui', 'transform', 'storage'],
                                                                    required: true,
                                                                },
                                                                {
                                                                    key: 'authorName',
                                                                    prompt: 'Author name:',
                                                                    type: 'text',
                                                                    required: true,
                                                                },
                                                                {
                                                                    key: 'authorEmail',
                                                                    prompt: 'Author email (optional):',
                                                                    type: 'text',
                                                                },
                                                                {
                                                                    key: 'license',
                                                                    prompt: 'License:',
                                                                    type: 'select',
                                                                    options: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'Other'],
                                                                    default: 'MIT',
                                                                },
                                                                {
                                                                    key: 'permissions',
                                                                    prompt: 'Required permissions (comma-separated):',
                                                                    type: 'text',
                                                                    transform: (value) => value.split(',').map(p => p.trim()).filter(p => p)
                                                                }
                                                            ];
                                                        }
                                                        static generateNodeTemplate() {
                                                            return JSON.stringify({});
                                                            manifest_version: '1.0',
                                                                id;
                                                            'my-node-extension',
                                                                name;
                                                            'My Node Extension',
                                                                version;
                                                            '1.0.0',
                                                                description;
                                                            'A custom node extension',
                                                                author;
                                                            {
                                                                name: 'Your Name',
                                                                    email;
                                                                'your.email@example.com',
                                                                ;
                                                            }
                                                            extension_type: 'node',
                                                                main;
                                                            'index.js',
                                                                dependencies;
                                                            {
                                                                system: '1.0.0',
                                                                ;
                                                            }
                                                            permissions: [,
                                                                'runtime-nodes'
                                                            ],
                                                                runtime;
                                                            {
                                                                node_types: [,
                                                                    'custom-node'
                                                                ];
                                                            }
                                                            metadata: {
                                                                license: 'MIT',
                                                                    keywords;
                                                                ['node', 'custom'],
                                                                    categories;
                                                                ['workflow'],
                                                                ;
                                                            }
                                                            null, 2;
                                                            ;
                                                        }
                                                        static generateUITemplate() {
                                                            return JSON.stringify({});
                                                            manifest_version: '1.0',
                                                                id;
                                                            'my-ui-extension',
                                                                name;
                                                            'My UI Extension',
                                                                version;
                                                            '1.0.0',
                                                                description;
                                                            'A custom UI extension',
                                                                author;
                                                            {
                                                                name: 'Your Name',
                                                                    email;
                                                                'your.email@example.com',
                                                                ;
                                                            }
                                                            extension_type: 'ui',
                                                                main;
                                                            'index.js',
                                                                dependencies;
                                                            {
                                                                system: '1.0.0',
                                                                ;
                                                            }
                                                            permissions: [,
                                                                'ui-components'
                                                            ],
                                                                ui;
                                                            {
                                                                category: 'general',
                                                                    components;
                                                                {
                                                                    'custom-component';
                                                                    './components/CustomComponent.js',
                                                                    ;
                                                                }
                                                                metadata: {
                                                                    license: 'MIT',
                                                                        keywords;
                                                                    ['ui', 'components'],
                                                                        categories;
                                                                    ['interface'],
                                                                    ;
                                                                }
                                                                null, 2;
                                                                ;
                                                            }
                                                        }
                                                        static generateTransformTemplate() {
                                                            return JSON.stringify({});
                                                            manifest_version: '1.0',
                                                                id;
                                                            'my-transform-extension',
                                                                name;
                                                            'My Transform Extension',
                                                                version;
                                                            '1.0.0',
                                                                description;
                                                            'A custom transform extension',
                                                                author;
                                                            {
                                                                name: 'Your Name',
                                                                    email;
                                                                'your.email@example.com',
                                                                ;
                                                            }
                                                            extension_type: 'transform',
                                                                main;
                                                            'index.js',
                                                                dependencies;
                                                            {
                                                                system: '1.0.0',
                                                                ;
                                                            }
                                                            runtime: {
                                                                transforms: [,
                                                                    'custom-transform'
                                                                ];
                                                            }
                                                            metadata: {
                                                                license: 'MIT',
                                                                    keywords;
                                                                ['transform', 'data'],
                                                                    categories;
                                                                ['processing'],
                                                                ;
                                                            }
                                                            null, 2;
                                                            ;
                                                        }
                                                        static generateStorageTemplate() {
                                                            return JSON.stringify({});
                                                            manifest_version: '1.0',
                                                                id;
                                                            'my-storage-extension',
                                                                name;
                                                            'My Storage Extension',
                                                                version;
                                                            '1.0.0',
                                                                description;
                                                            'A custom storage extension',
                                                                author;
                                                            {
                                                                name: 'Your Name',
                                                                    email;
                                                                'your.email@example.com',
                                                                ;
                                                            }
                                                            extension_type: 'storage',
                                                                main;
                                                            'index.js',
                                                                dependencies;
                                                            {
                                                                system: '1.0.0',
                                                                ;
                                                            }
                                                            permissions: [,
                                                                'storage'
                                                            ],
                                                                runtime;
                                                            {
                                                                storage_providers: [,
                                                                    'custom-storage'
                                                                ];
                                                            }
                                                            metadata: {
                                                                license: 'MIT',
                                                                    keywords;
                                                                ['storage', 'persistence'],
                                                                    categories;
                                                                ['data'],
                                                                ;
                                                            }
                                                            null, 2;
                                                            ;
                                                             > ;
                                                            // Export utilities
                                                            export { ManifestTemplateGenerator };
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
