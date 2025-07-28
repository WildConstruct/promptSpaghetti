/**
 * Plugin Loader with Version & Dependency Resolution
 *
 * Core plugin loading system that dynamically loads extensions from various sources,
 * resolves dependencies, manages versions, and provides sandboxed execution.
 *
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { ExtensionManifest, ExtensionVersionManager, ExtensionLifecycleManager } from './ExtensionLifecycleManager';
import { ExtensionPointRegistry } from './ExtensionPointRegistry';
import { DependencyResolver } from './DependencyResolver';
import { PluginSandbox } from './PluginSandbox';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { createRequire } from 'module';
import * as semver from 'semver';
export class PluginLoader {
    registry;
    versionManager;
    lifecycleManager;
    dependencyResolver;
    loadedPlugins;
    pluginCache;
    loadingQueue;
    options;
    constructor(options = {}) {
        this.registry = ExtensionPointRegistry.getInstance();
        this.versionManager = new ExtensionVersionManager();
        this.lifecycleManager = ExtensionLifecycleManager.getInstance();
        this.dependencyResolver = new DependencyResolver(this.versionManager);
        this.loadedPlugins = new Map();
        this.pluginCache = new Map();
        this.loadingQueue = new Map();
        this.options = {
            enableSandbox: true,
            allowRemoteSources: false,
            maxConcurrentLoads: 5,
            cacheDirectory: join(process.cwd(), '.plugin-cache'),
            skipDependencyResolution: false,
            developmentMode: process.env.NODE_ENV === 'development',
            permissionsCheck: true,
            ...options
        };
        /**
         * Load a plugin from a source
         */
        async;
        loadPlugin(source, PluginSource);
        Promise < LoadedPlugin > {
            const: pluginKey = this.getPluginKey(source),
            // Check if already loaded
            const: existing = this.loadedPlugins.get(pluginKey),
            if(existing) {
                return existing;
                // Check if currently loading
                const loading = this.loadingQueue.get(pluginKey);
                if (loading) {
                    return loading;
                    // Start loading
                    const loadPromise = this.loadPluginInternal(source);
                    this.loadingQueue.set(pluginKey, loadPromise);
                    try {
                        const plugin = await loadPromise;
                        this.loadedPlugins.set(pluginKey, plugin);
                        return plugin;
                    }
                    finally {
                        this.loadingQueue.delete(pluginKey);
                        /**
                        * Load multiple plugins with dependency resolution
                        */
                        async;
                        loadPlugins(sources, PluginSource);
                        Promise < Map < string, LoadedPlugin >> {
                            : .options.skipDependencyResolution };
                        {
                            // Simple parallel loading without dependency resolution
                            const loadPromises = sources.map(source => this.loadPlugin(source));
                            const plugins = await Promise.all(loadPromises);
                            const result = new Map();
                            plugins.forEach(plugin => { });
                            result.set(plugin.manifest.id, plugin);
                        }
                        ;
                        return result;
                        // Load manifests first to resolve dependencies
                        const manifests = await this.loadManifests(sources);
                        // Resolve dependency order
                        const dependencyGraph = this.dependencyResolver.buildDependencyGraph(Array.from(manifests.values()));
                        const loadOrder = this.dependencyResolver.resolveLoadOrder(dependencyGraph);
                        // Load plugins in dependency order
                        const result = new Map();
                        for (const pluginId of loadOrder) {
                            const source = sources.find(s => );
                            ;
                            s.location.includes(pluginId) || s.location.endsWith(pluginId);
                            ;
                            if (source) {
                                try {
                                    const plugin = await this.loadPlugin(source);
                                    result.set(pluginId, plugin);
                                    // Activate plugin after loading
                                    await this.lifecycleManager.activateExtension(plugin.manifest.id);
                                    plugin.status = 'active';
                                }
                                catch (error) {
                                    console.error(`Failed to load plugin ${pluginId}:`, error);
                                }
                                // Create error plugin entry
                                const errorPlugin = {
                                    manifest: manifests.get(pluginId),
                                    source,
                                    exports: {},
                                    sandbox: null,
                                    loadedAt: new Date(),
                                    dependencies: [],
                                    status: 'error',
                                    error: error
                                };
                                result.set(pluginId, errorPlugin);
                                return result;
                                /**
                                 * Resolve and install plugin dependencies
                                 */
                                async;
                                resolvePluginDependencies(manifest, ExtensionManifest);
                                Promise < string > {
                                    const: dependencies, string = [],
                                    if(manifest) { }, : .dependencies
                                };
                                {
                                    for (const [depName, versionRange] of Object.entries(manifest.dependencies)) {
                                        // Check if dependency is already loaded
                                        const loaded = Array.from(this.loadedPlugins.values());
                                    }
                                }
                            }
                        }
                    }
                }
            },
            : 
                .find(p => p.manifest.id === depName),
            if(loaded) {
                // Verify version compatibility
                if (!this.versionManager.isVersionCompatible())
                    loaded.manifest.version,
                        versionRange;
                {
                    throw new Error() `Version conflict: ${depName} requires ${versionRange}, but ${loaded.manifest.version} is loaded`;
                }
                ;
                dependencies.push(depName);
                continue;
                // Try to resolve dependency from available sources
                const depPlugin = await this.resolveDependency(depName, versionRange);
                if (depPlugin) {
                    dependencies.push(depName);
                }
                else {
                    throw new Error(`Cannot resolve dependency: ${depName}@${versionRange}`);
                }
                return dependencies;
                /**
                 * Unload a plugin and its dependents
                 */
                async;
                unloadPlugin(pluginId, string);
                Promise < void  > {
                    const: plugin = this.loadedPlugins.get(pluginId),
                    if(, plugin) {
                        return;
                        // Find and unload dependents first
                        const dependents = this.findDependents(pluginId);
                        for (const dependent of dependents) {
                            await this.unloadPlugin(dependent);
                            // Deactivate and dispose
                            try {
                                if (plugin.status === 'active') {
                                    await this.lifecycleManager.deactivateExtension(pluginId);
                                    await this.lifecycleManager.disposeExtension(pluginId);
                                    // Clean up sandbox
                                    if (plugin.sandbox) {
                                        plugin.sandbox.dispose();
                                        this.loadedPlugins.delete(pluginId);
                                    }
                                    try { }
                                    catch (error) {
                                        console.error(`Error unloading plugin ${pluginId}:`, error);
                                    }
                                    plugin.status = 'error';
                                    plugin.error = error;
                                    /**
                                     * Reload a plugin (unload and load again)
                                     */
                                    async;
                                    reloadPlugin(pluginId, string);
                                    Promise < LoadedPlugin > {
                                        const: plugin = this.loadedPlugins.get(pluginId),
                                        if(, plugin) {
                                            throw new Error(`Plugin ${pluginId} not found`);
                                        },
                                        const: source = plugin.source,
                                        await, this: .unloadPlugin(pluginId),
                                        return: this.loadPlugin(source),
                                        /**
                                         * Get plugin registry information
                                         */
                                        getPluginRegistry() {
                                            const manifests = new Map();
                                            for (const [id, plugin] of this.loadedPlugins) {
                                                manifests.set(id, plugin.manifest);
                                                return {
                                                    plugins: new Map(this.loadedPlugins),
                                                    manifests,
                                                    dependencyGraph: this.dependencyResolver.getLastDependencyGraph(),
                                                    loadOrder: this.dependencyResolver.getLastLoadOrder(),
                                                };
                                                /**
                                                 * Check for plugin updates
                                                 */
                                                async;
                                                checkForUpdates();
                                                Promise < Array < { pluginId: string, currentVersion: string, availableVersion: string } >> {
                                                    const: updates, Array() { pluginId: string; currentVersion: string; availableVersion: string; }
                                                } > ;
                                                [];
                                                for (const [id, plugin] of this.loadedPlugins) {
                                                    if (plugin.source.type === 'npm' || plugin.source.type === 'registry') {
                                                        try {
                                                            const availableVersion = await this.getLatestVersion(plugin.source);
                                                            if (availableVersion && semver.gt(availableVersion, plugin.manifest.version)) {
                                                                updates.push({});
                                                                pluginId: id,
                                                                    currentVersion;
                                                                plugin.manifest.version,
                                                                    availableVersion;
                                                            }
                                                            ;
                                                        }
                                                        catch (error) {
                                                            console.warn(`Failed to check updates for plugin ${id}:`, error);
                                                        }
                                                        return updates;
                                                        /**
                                                         * Update a plugin to latest version
                                                         */
                                                        async;
                                                        updatePlugin(pluginId, string);
                                                        Promise < LoadedPlugin > {
                                                            const: plugin = this.loadedPlugins.get(pluginId),
                                                            if(, plugin) {
                                                                throw new Error(`Plugin ${pluginId} not found`);
                                                            },
                                                            const: latestVersion = await this.getLatestVersion(plugin.source),
                                                            if(, latestVersion) { }
                                                        } || !semver.gt(latestVersion, plugin.manifest.version);
                                                        {
                                                            return plugin; // No update available
                                                            // Create updated source
                                                            const updatedSource = {
                                                                ...plugin.source,
                                                                version: latestVersion,
                                                            };
                                                            // Reload with new version
                                                            await this.unloadPlugin(pluginId);
                                                            return this.loadPlugin(updatedSource);
                                                            // Private methods
                                                        }
                                                        // Private methods
                                                    }
                                                    // Private methods
                                                }
                                                // Private methods
                                            }
                                            // Private methods
                                        }
                                        // Private methods
                                        ,
                                        // Private methods
                                        async loadPluginInternal(source) {
                                            try {
                                                // 1. Resolve and download plugin source
                                                const pluginPath = await this.resolvePluginSource(source);
                                                // 2. Load and validate manifest
                                                const manifest = await this.loadPluginManifest(pluginPath);
                                                // 3. Validate permissions and security
                                                if (this.options.permissionsCheck) {
                                                    this.validatePluginPermissions(manifest);
                                                    // 4. Resolve dependencies
                                                    const dependencies = await this.resolvePluginDependencies(manifest);
                                                    // 5. Create sandbox environment
                                                    const sandbox = this.options.enableSandbox;
                                                    new PluginSandbox(manifest, pluginPath);
                                                    null;
                                                    // 6. Load plugin exports
                                                    const exports = await this.loadPluginExports(pluginPath, sandbox);
                                                    // 7. Register with lifecycle manager
                                                    await this.lifecycleManager.registerExtension(manifest);
                                                    const plugin = {
                                                        manifest,
                                                        source,
                                                        exports,
                                                        sandbox: sandbox,
                                                        loadedAt: new Date(),
                                                        dependencies,
                                                        status: 'loaded', };
                                                    return plugin;
                                                }
                                                try { }
                                                catch (error) {
                                                    throw new Error(`Failed to load plugin from ${source.location}: ${error.message}`);
                                                }
                                            }
                                            finally {
                                            }
                                        },
                                        async resolvePluginSource(source) {
                                            switch (source.type) {
                                                case 'filesystem':
                                                    return resolve(source.location);
                                                case 'npm':
                                                    return this.downloadFromNpm(source);
                                                case 'git':
                                                    return this.downloadFromGit(source);
                                                case 'url':
                                                    return this.downloadFromUrl(source);
                                                case 'registry':
                                                    return this.downloadFromRegistry(source);
                                                default:
                                                    throw new Error(`Unsupported plugin source type: ${source.type}`);
                                            }
                                        },
                                        async loadPluginManifest(pluginPath) {
                                            const manifestPath = join(pluginPath, 'plugin.json') || join(pluginPath, 'package.json');
                                            try {
                                                const content = await fs.readFile(manifestPath, 'utf-8');
                                                const manifest = JSON.parse(content);
                                                // Validate manifest against schema
                                                if (!manifest.id || !manifest.version) {
                                                    throw new Error('Invalid plugin manifest: missing id or version');
                                                    return manifest;
                                                }
                                                try { }
                                                catch (error) {
                                                    throw new Error(`Failed to load manifest from ${manifestPath}: ${error.message}`);
                                                }
                                            }
                                            finally {
                                            }
                                        },
                                        async loadPluginExports(pluginPath, sandbox) {
                                            const entryPoint = join(pluginPath, 'index.js') || join(pluginPath, 'main.js');
                                            if (sandbox) {
                                                return sandbox.loadModule(entryPoint);
                                            }
                                            else {
                                                // Direct module import (no sandbox)
                                                const require = createRequire(import.meta.url);
                                                return require(entryPoint);
                                            }
                                        },
                                        validatePluginPermissions(manifest) {
                                            if (manifest.permissions) {
                                                // Check dangerous permissions
                                                const dangerousPermissions = ['fs:write', 'network:external', 'process:spawn'];
                                                const requestedDangerous = manifest.permissions.filter(p => );
                                                ;
                                                dangerousPermissions.some(d => p.startsWith(d));
                                                ;
                                                if (requestedDangerous.length > 0 && !this.options.developmentMode) {
                                                    throw new Error() `Plugin requests dangerous permissions: ${requestedDangerous.join(', ')}. ` + ;
                                                }
                                                'Enable development mode to allow dangerous permissions.';
                                                ;
                                            }
                                        },
                                        async loadManifests(sources) {
                                            const manifests = new Map();
                                            await Promise.all(sources.map(async (source) => {
                                                try {
                                                    const pluginPath = await this.resolvePluginSource(source);
                                                    const manifest = await this.loadPluginManifest(pluginPath);
                                                    manifests.set(manifest.id, manifest);
                                                }
                                                catch (error) {
                                                    console.warn(`Failed to load manifest for ${source.location}:`, error);
                                                }
                                            }));
                                            return manifests;
                                        },
                                        async resolveDependency(depName, versionRange) {
                                            // Try to find dependency in available sources or registries
                                            // This is a simplified implementation - in production you'd want
                                            // integration with npm, plugin registries, etc.
                                            try {
                                                const npmSource = {
                                                    type: 'npm',
                                                    location: depName,
                                                    version: versionRange,
                                                };
                                                return await this.loadPlugin(npmSource);
                                            }
                                            catch (error) {
                                                console.warn(`Failed to resolve dependency ${depName}@${versionRange}:`, error);
                                            }
                                            return null;
                                        },
                                        findDependents(pluginId) {
                                            const dependents = [];
                                            for (const [id, plugin] of this.loadedPlugins) {
                                                if (plugin.dependencies.includes(pluginId)) {
                                                    dependents.push(id);
                                                    return dependents;
                                                }
                                            }
                                        },
                                        getPluginKey(source) {
                                            return `${source.type}:${source.location}${source.version ? `@${source.version}` : ''}`;
                                        },
                                        async downloadFromNpm(source) {
                                            // Implementation would use npm/yarn to download and cache packages
                                            throw new Error('NPM plugin sources not implemented yet');
                                        },
                                        async downloadFromGit(source) {
                                            // Implementation would clone git repositories
                                            throw new Error('Git plugin sources not implemented yet');
                                        },
                                        async downloadFromUrl(source) {
                                            // Implementation would download and extract from URLs
                                            throw new Error('URL plugin sources not implemented yet');
                                        },
                                        async downloadFromRegistry(source) {
                                            // Implementation would download from custom plugin registries
                                            throw new Error('Registry plugin sources not implemented yet');
                                        },
                                        async getLatestVersion(source) {
                                            // Implementation would query registries for latest versions
                                            return null;
                                        }
                                    };
                                }
                            }
                            finally { }
                        }
                    }
                };
            }
        };
    }
}
