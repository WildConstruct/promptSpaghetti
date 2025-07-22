/**
 * Plugin Registry with Version & Dependency Management
 *
 * Centralized registry for managing plugins with version resolution,
 * dependency management, and integration with existing extension system.
 *
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { PluginSource, LoadedPlugin } from './PluginLoader';
import { EventEmitter } from 'events';
export interface RemotePlugin {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    downloadUrl: string;
    repository?: string;
    homepage?: string;
    keywords: string[];
    dependencies?: Record<string, string>;
    verified: boolean;
    downloads: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface PluginUpdate {
    pluginId: string;
    currentVersion: string;
    availableVersion: string;
    updateType: 'patch' | 'minor' | 'major';
    changelog?: string;
    breaking: boolean;
}
export interface PluginRegistryConfig {
    cacheDirectory: string;
    autoUpdateCheck: boolean;
    allowRemoteSources: boolean;
    remoteRegistries: string[];
    updateCheckInterval: number;
    maxCacheAge: number;
    enableTelemetry: boolean;
    developmentMode: boolean;
}
export interface PluginInstallOptions {
    version?: string;
    skipDependencies?: boolean;
    force?: boolean;
    source?: PluginSource;
    activateAfterInstall?: boolean;
}
export interface PluginSearchOptions {
    query?: string;
    category?: string;
    author?: string;
    minRating?: number;
    verified?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'downloads' | 'rating' | 'updated';
    sortOrder?: 'asc' | 'desc';
}
export interface PluginRegistryStats {
    totalPlugins: number;
    activePlugins: number;
    inactivePlugins: number;
    errorPlugins: number;
    totalDependencies: number;
    resolvedDependencies: number;
    unresolvedDependencies: number;
    updateCheckLastRun?: Date;
    availableUpdates: number;
    cacheSize: number;
}
export declare class PluginRegistry extends EventEmitter {
    private baseRegistry;
    private pluginLoader;
    private versionManager;
    private dependencyResolver;
    private config;
    private installedPlugins;
    private remotePluginCache;
    private updateCheckTimer?;
    constructor(config?: Partial<PluginRegistryConfig>);
    /**
     * Install a plugin from various sources
     */
    installPlugin(pluginIdentifier: string, options?: PluginInstallOptions): Promise<LoadedPlugin>;
    /**
     * Uninstall a plugin
     */
    uninstallPlugin(pluginId: string, removeData?: boolean): Promise<void>;
    /**
     * Update a plugin to latest version
     */
    updatePlugin(pluginId: string): Promise<LoadedPlugin>;
    /**
     * Search for plugins in remote registries
     */
    searchPlugins(options?: PluginSearchOptions): Promise<RemotePlugin[]>;
    /**
     * Check for plugin updates
     */
    checkForUpdates(): Promise<PluginUpdate[]>;
    /**
     * Get plugin registry statistics
     */
    getStats(): PluginRegistryStats;
    /**
     * Get all installed plugins
     */
    getInstalledPlugins(): LoadedPlugin[];
    /**
     * Get a specific plugin
     */
    getPlugin(pluginId: string): LoadedPlugin | undefined;
    /**
     * Enable auto-update checking
     */
    enableAutoUpdateCheck(): void;
    /**
     * Disable auto-update checking
     */
    disableAutoUpdateCheck(): void;
    private initializeRegistry;
    private resolvePluginSource;
    private checkForConflicts;
    private installDependencies;
    private findDependentPlugins;
    private getUpdateType;
    private saveInstallationRecord;
    private removeInstallationRecord;
    private loadInstalledPlugins;
    private createPluginBackup;
    private restorePluginBackup;
    private removePluginData;
}
//# sourceMappingURL=PluginRegistry.d.ts.map