import { PluginSource } from './PluginLoader';
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
    keywords: string;
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
    remoteRegistries: string;
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
}
//# sourceMappingURL=PluginRegistry.d.ts.map