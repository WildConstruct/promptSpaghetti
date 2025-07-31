/**
 * Plugin Loader with Version & Dependency Resolution
 *
 * Core plugin loading system that dynamically loads extensions from various sources,
 * resolves dependencies, manages versions, and provides sandboxed execution.
 *
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { ExtensionManifest } from './ExtensionLifecycleManager';
import { DependencyGraph, LoadOrder } from './DependencyResolver';
import { PluginSandbox } from './PluginSandbox';

}
export interface PluginSource {
    type: 'filesystem' | 'npm' | 'git' | 'url' | 'registry';
    location: string;
    version?: string;
    credentials?: {
        token?: string;
        username?: string;
        password?: string;

}
    };
    options?: {
        cache?: boolean;
        timeout?: number;
        allowPrerelease?: boolean;
    };

}
export interface LoadedPlugin {
    manifest: ExtensionManifest;
    source: PluginSource;
    exports: any;
    sandbox: PluginSandbox;
    loadedAt: Date;
    dependencies: string[];
    status: 'loaded' | 'active' | 'inactive' | 'error';
    error?: Error;


}
export interface PluginLoadOptions {
    enableSandbox: boolean;
    allowRemoteSources: boolean;
    maxConcurrentLoads: number;
    cacheDirectory?: string;
    skipDependencyResolution?: boolean;
    developmentMode?: boolean;
    permissionsCheck?: boolean;


}
export interface PluginRegistry {
    plugins: Map<string, LoadedPlugin>;
    manifests: Map<string, ExtensionManifest>;
    dependencyGraph: DependencyGraph;
    loadOrder: LoadOrder;

export declare class PluginLoader {
    private registry;
    private versionManager;
    private lifecycleManager;
    private dependencyResolver;
    private loadedPlugins;
    private pluginCache;
    private loadingQueue;
    private options;
    constructor(options?: Partial<PluginLoadOptions>);
    /**
     * Load a plugin from a source
     */
    loadPlugin(source: PluginSource): Promise<LoadedPlugin>;
    /**
     * Load multiple plugins with dependency resolution
     */
    loadPlugins(sources: PluginSource[]): Promise<Map<string, LoadedPlugin>>;
    /**
     * Resolve and install plugin dependencies
     */
    resolvePluginDependencies(manifest: ExtensionManifest): Promise<string[]>;
    /**
     * Unload a plugin and its dependents
     */
    unloadPlugin(pluginId: string): Promise<void>;
    /**
     * Reload a plugin (unload and load again)
     */
    reloadPlugin(pluginId: string): Promise<LoadedPlugin>;
    /**
     * Get plugin registry information
     */
    getPluginRegistry(): PluginRegistry;
    /**
     * Check for plugin updates
     */
    checkForUpdates(): Promise<Array<{
        pluginId: string;
        currentVersion: string;
        availableVersion: string;
}
    }>>;
    /**
     * Update a plugin to latest version
     */
    updatePlugin(pluginId: string): Promise<LoadedPlugin>;
    private loadPluginInternal;
    private resolvePluginSource;
    private loadPluginManifest;
    private loadPluginExports;
    private validatePluginPermissions;
    private loadManifests;
    private resolveDependency;
    private findDependents;
    private getPluginKey;
    private downloadFromNpm;
    private downloadFromGit;
    private downloadFromUrl;
    private downloadFromRegistry;
    private getLatestVersion;

//# sourceMappingURL=PluginLoader.d.ts.map