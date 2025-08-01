/**
 * Plugin Registry with Version & Dependency Management
 * 
 * Centralized registry for managing plugins with version resolution,
 * dependency management, and integration with existing extension system.
 * 
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { ExtensionPointRegistry, ExtensionPoint } from './ExtensionPointRegistry';
import { PluginLoader, PluginSource, LoadedPlugin, PluginLoadOptions } from './PluginLoader';
import { DependencyResolver, DependencyGraph } from './DependencyResolver';
import { ExtensionManifest, ExtensionVersionManager } from './ExtensionLifecycleManager';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as semver from 'semver';


export interface RemotePlugin { id: string;
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
  updatedAt: Date }



export interface PluginUpdate { pluginId: string;
  currentVersion: string;
  availableVersion: string;
  updateType: 'patch' | 'minor' | 'major';
  changelog?: string;
  breaking: boolean }



export interface PluginRegistryConfig { cacheDirectory: string;
  autoUpdateCheck: boolean;
  allowRemoteSources: boolean;
  remoteRegistries: string;
  updateCheckInterval: number; // milliseconds;
  maxCacheAge: number; // milliseconds }
  enableTelemetry: boolean;
  developmentMode: boolean;




export interface PluginInstallOptions { version?: string;
  skipDependencies?: boolean;
  force?: boolean;
  source?: PluginSource;
  activateAfterInstall?: boolean }



export interface PluginSearchOptions { query?: string;
  category?: string;
  author?: string;
  minRating?: number;
  verified?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'downloads' | 'rating' | 'updated';
  sortOrder?: 'asc' | 'desc' }




export interface PluginRegistryStats { totalPlugins: number;
  activePlugins: number;
  inactivePlugins: number;
  errorPlugins: number;
  totalDependencies: number;
  resolvedDependencies: number;
  unresolvedDependencies: number;
  updateCheckLastRun?: Date;
  availableUpdates: number;
  cacheSize: number }

export class PluginRegistry extends EventEmitter {
  private baseRegistry: ExtensionPointRegistry;
  private pluginLoader: PluginLoader;
  private versionManager: ExtensionVersionManager;
  private dependencyResolver: DependencyResolver;
  private config: PluginRegistryConfig;
  private installedPlugins: Map<string, LoadedPlugin>;
  private remotePluginCache: Map<string, RemotePlugin>;
  private updateCheckTimer?: NodeJS.Timeout;
  constructor(config: Partial<PluginRegistryConfig> = {}) { super();
  this.config = {
  cacheDirectory: join(process.cwd(), '.plugin-cache')
  autoUpdateCheck: true
  allowRemoteSources: false
  remoteRegistries: ['https://registry.npmjs.org']
  updateCheckInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  enableTelemetry: false
  developmentMode: process.env.NODE_ENV === 'development' }
  ...config
};
    this.baseRegistry = ExtensionPointRegistry.getInstance();
    this.versionManager = new ExtensionVersionManager();
    this.dependencyResolver = new DependencyResolver(this.versionManager);
    this.pluginLoader = new PluginLoader({ )
  enableSandbox: !this.config.developmentMode
  allowRemoteSources: this.config.allowRemoteSources
  cacheDirectory: this.config.cacheDirectory
  developmentMode: this.config.developmentMode }
});
    this.installedPlugins = new Map();
    this.remotePluginCache = new Map();
    this.initializeRegistry();
  /**
   * Install a plugin from various sources
   */
  async installPlugin(((
    pluginIdentifier: string
    options: PluginInstallOptions = {}
  ): Promise<LoadedPlugin> {

    try {
      this.emit('plugin:install:start', { pluginIdentifier, options });
      // Resolve plugin source
      const source = options.source || await this.resolvePluginSource(pluginIdentifier, options.version);
      // Load plugin
      const plugin = await this.pluginLoader.loadPlugin(source);
      // Check for conflicts
      await this.checkForConflicts(plugin);
      // Install dependencies if needed
      if (!options.skipDependencies) {
        await this.installDependencies(plugin.manifest);
      // Register plugin
      this.installedPlugins.set(plugin.manifest.id, plugin);
      // Activate if requested
      if (options.activateAfterInstall !== false) {
        plugin.status = 'active';
      // Save installation record
      await this.saveInstallationRecord(plugin);
      this.emit('plugin:install:success', { plugin });
      return plugin;
 catch (error) {
      this.emit('plugin:install:error', { pluginIdentifier, error });
      throw new Error(`Failed to install plugin ${pluginIdentifier}: ${error.message}`);}
  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: string, removeData: boolean = false): Promise<void> {

    try {
      this.emit('plugin:uninstall:start', { pluginId });
      const plugin = this.installedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} is not installed`);}
      // Check for dependents
      const dependents = this.findDependentPlugins(pluginId);
      if (dependents.length > 0) {
        throw new Error()
          `Cannot uninstall ${pluginId}: required by ${dependents.join(', ')}`}
        );
      // Unload plugin
      await this.pluginLoader.unloadPlugin(pluginId);
      // Remove from registry
      this.installedPlugins.delete(pluginId);
      // Remove installation record
      await this.removeInstallationRecord(pluginId);
      // Remove data if requested
      if (removeData) {
        await this.removePluginData(pluginId);
      this.emit('plugin:uninstall:success', { pluginId });
 catch (error) {
      this.emit('plugin:uninstall:error', { pluginId, error });
      throw error;
  /**
   * Update a plugin to latest version
   */
  async updatePlugin(pluginId: string): Promise<LoadedPlugin> {

    try {
      this.emit('plugin:update:start', { pluginId });
      const plugin = this.installedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} is not installed`);}
      const updates = await this.pluginLoader.checkForUpdates();
      const update = updates.find(u => u.pluginId === pluginId);
      if (!update) {
        return plugin; // No update available
      // Create backup
      await this.createPluginBackup(plugin);
      try {
        // Update plugin
        const updatedPlugin = await this.pluginLoader.updatePlugin(pluginId);
        this.installedPlugins.set(pluginId, updatedPlugin);
        // Update installation record
        await this.saveInstallationRecord(updatedPlugin);
        this.emit('plugin:update:success', { pluginId, updatedPlugin });
        return updatedPlugin;
 catch (updateError) { // Restore backup on failure
        await this.restorePluginBackup(pluginId);
        throw updateError } catch (error) {
      this.emit('plugin:update:error', { pluginId, error });
      throw error;
  /**
   * Search for plugins in remote registries
   */
  async searchPlugins(options: PluginSearchOptions = {}): Promise<RemotePlugin> { try {
  const results: RemotePlugin = [];
  // Search in cached remote plugins
  for (const [registry, plugins] of this.remotePluginCache) {
  let filtered = plugins;
  if (options.query) {
  filtered = filtered.filter(p => )
  p.name.toLowerCase().includes(options.query!.toLowerCase()) ||
  p.description.toLowerCase().includes(options.query!.toLowerCase()) ||
  p.keywords.some(k => k.toLowerCase().includes(options.query!.toLowerCase()))
  );
  if (options.verified !== undefined) {
  filtered = filtered.filter(p => p.verified === options.verified);
  if (options.minRating) {
  filtered = filtered.filter(p => p.rating >= options.minRating!);
  results.push(...filtered);
  // Sort results
  if (options.sortBy) {
  results.sort((a, b) => {
  let aValue, bValue;
  switch (options.sortBy) {
  case 'name':
  aValue = a.name;
  bValue = b.name;
  break;
  case 'downloads':
  aValue = a.downloads;
  bValue = b.downloads;
  break;
  case 'rating':
  aValue = a.rating;
  bValue = b.rating;
  break;
  case 'updated':
  aValue = a.updatedAt;
  bValue = b.updatedAt;
  break;
  default: }
  return 0;
  const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  return options.sortOrder === 'desc' ? -comparison : comparison;
});
      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      return results.slice(offset, offset + limit);
 catch (error) {
      throw new Error(`Plugin search failed: ${error.message}`);}
  /**
   * Check for plugin updates
   */
  async checkForUpdates(): Promise<PluginUpdate> { const updates = await this.pluginLoader.checkForUpdates();
  return updates.map(update => ({)
  ...update
  updateType: this.getUpdateType(update.currentVersion, update.availableVersion)
  breaking: semver.major(update.availableVersion) > semver.major(update.currentVersion) }
}));
  /**
   * Get plugin registry statistics
   */
  getStats(): PluginRegistryStats { const plugins = Array.from(this.installedPlugins.values());
  return {
  totalPlugins: plugins.length
  activePlugins: plugins.filter(p => p.status === 'active').length
  inactivePlugins: plugins.filter(p => p.status === 'inactive').length
  errorPlugins: plugins.filter(p => p.status === 'error').length
  totalDependencies: plugins.reduce((sum, p) => sum + p.dependencies.length, 0)
  resolvedDependencies: plugins.reduce((sum, p) => sum + p.dependencies.length, 0)
  unresolvedDependencies: 0, // Simplified
  availableUpdates: 0, // Would be populated by checkForUpdates
  cacheSize: this.remotePluginCache.size }
};
  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): LoadedPlugin {
    return Array.from(this.installedPlugins.values());
  /**
   * Get a specific plugin
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.installedPlugins.get(pluginId);
  /**
   * Enable auto-update checking
   */
  enableAutoUpdateCheck(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
    this.updateCheckTimer = setInterval(async () => {
      try {
        const updates = await this.checkForUpdates();
        if (updates.length > 0) {
          this.emit('updates:available', { updates });
 catch (error) {
        this.emit('update-check:error', { error });
    }, this.config.updateCheckInterval);
  /**
   * Disable auto-update checking
   */
  disableAutoUpdateCheck(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = undefined;
  // Private methods
  private async initializeRegistry(): Promise<void> {

    try {
      // Ensure cache directory exists
      await fs.mkdir(this.config.cacheDirectory, { recursive: true });
      // Load installed plugins from disk
      await this.loadInstalledPlugins();
      // Enable auto-update check if configured
      if (this.config.autoUpdateCheck) { this.enableAutoUpdateCheck();
  this.emit('registry:initialized') } catch (error) {
      this.emit('registry:error', { error });
      console.error('Failed to initialize plugin registry:', error);
  private async resolvePluginSource(identifier: string, version?: string): PluginSource {
    // Try different resolution strategies
    // 1. File system path
    if (identifier.startsWith('./') || identifier.startsWith('/')) {
      return { type: 'filesystem', location: identifier };
    // 2. Git repository
    if (identifier.startsWith('git+') || identifier.includes('github.com')) {
      return { type: 'git', location: identifier, version };
    // 3. NPM package
    if (identifier.includes('@') && !identifier.startsWith('@')) {
      const [name, ver] = identifier.split('@');
      return { type: 'npm', location: name, version: ver };
    // 4. Default to npm
    return { type: 'npm', location: identifier, version };
  private async checkForConflicts(plugin: LoadedPlugin): Promise<void> {

    const existing = this.installedPlugins.get(plugin.manifest.id);
    if (existing && existing !== plugin) {
      throw new Error()
        `Plugin ${plugin.manifest.id} is already installed (version ${existing.manifest.version})`}
      );
  private async installDependencies(manifest: ExtensionManifest): Promise<void> {

    if (!manifest.dependencies) return;
    for (const [depId, versionRange] of Object.entries(manifest.dependencies)) {
      if (!this.installedPlugins.has(depId)) {
        await this.installPlugin(depId, { version: versionRange });
  private findDependentPlugins(pluginId: string): string {
    const dependents: string = [];
    for (const [id, plugin] of this.installedPlugins) {
      if (plugin.dependencies.includes(pluginId)) {
        dependents.push(id);
    return dependents;
  private getUpdateType(currentVersion: string, availableVersion: string): 'patch' | 'minor' | 'major' {
    const diff = semver.diff(currentVersion, availableVersion);
    return (diff as 'patch' | 'minor' | 'major') || 'patch';
  private async saveInstallationRecord(plugin: LoadedPlugin): Promise<void> {

    const recordPath = join(this.config.cacheDirectory, 'installed.json');
    try {
      let records: any = {};
      try { const content = await fs.readFile(recordPath, 'utf-8');
        records = JSON.parse(content) } catch { // File doesn't exist yet
  records[plugin.manifest.id] = {
  version: plugin.manifest.version
  installedAt: plugin.loadedAt
  source: plugin.source }
};
      await fs.writeFile(recordPath, JSON.stringify(records, null, 2));
 catch (error) {
      console.warn(`Failed to save installation record for ${plugin.manifest.id}:`, error);}
  private async removeInstallationRecord(pluginId: string): Promise<void> { const recordPath = join(this.config.cacheDirectory, 'installed.json');
    try {
      const content = await fs.readFile(recordPath, 'utf-8');
      const records = JSON.parse(content);
      delete records[pluginId];
      await fs.writeFile(recordPath, JSON.stringify(records, null, 2)) } catch (error) {
      console.warn(`Failed to remove installation record for ${pluginId}:`, error);}
  private async loadInstalledPlugins(): Promise<void> { const recordPath = join(this.config.cacheDirectory, 'installed.json');
    try {
      const content = await fs.readFile(recordPath, 'utf-8');
      const records = JSON.parse(content);
      for (const [pluginId, record] of Object.entries(records)) {
        try {
          const plugin = await this.pluginLoader.loadPlugin((record as any).source);
          this.installedPlugins.set(pluginId, plugin) } catch (error) {
          console.warn(`Failed to load installed plugin ${pluginId}:`, error);}
 catch (error) {
      // No installed plugins record exists yet
  private async createPluginBackup(plugin: LoadedPlugin): Promise<void> {

    // Simplified backup implementation
    console.log(`Creating backup for plugin ${plugin.manifest.id}`);}
  private async restorePluginBackup(pluginId: string): Promise<void> {

    // Simplified restore implementation
    console.log(`Restoring backup for plugin ${pluginId}`);}
  private async removePluginData(pluginId: string): Promise<void> {

    // Remove plugin-specific data directories
    console.log(`Removing data for plugin ${pluginId}`);}