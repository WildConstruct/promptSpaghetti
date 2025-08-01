/**
 * Extension Manifest Manager - Epic 8.4 Story 8.4.3
 * Manages extension manifests including loading, caching, and validation
 */
import { ExtensionManifest, extensionManifestParser, extensionManifestValidator } from './ExtensionManifest';
import { ExtensionValidationResult } from './interfaces/ExtensionInterfaces';

// Extension Manifest Manager
export class ExtensionManifestManager {
  private static instance: ExtensionManifestManager;
  private manifests: Map<string, ExtensionManifest> = new Map();
  private manifestCache: Map<string, CachedManifest> = new Map();
  private watchedFiles: Set<string> = new Set();
  private eventEmitter = new EventTarget();
  private constructor() {}
  public static getInstance(): ExtensionManifestManager { if (!ExtensionManifestManager.instance) {
  ExtensionManifestManager.instance = new ExtensionManifestManager();
  return ExtensionManifestManager.instance;
  /**
  * Load manifest from file
  */
  public async loadManifest(filePath: string): Promise<ManifestLoadResult> {
  try {
  // Check cache first
  const cached = this.manifestCache.get(filePath);
  if (cached && !this.isCacheExpired(cached)) {
  return {
  success: true
  manifest: cached.manifest
  source: 'cache' }
};
      // Parse manifest
      const parseResult = await extensionManifestParser.parseManifestFromFile(filePath);
      if (!parseResult.success) { return {
  success: false
  error: parseResult.error
  details: parseResult.details }
};
      const manifest = parseResult.data!;
      // Cache the manifest
      this.manifestCache.set(filePath, { )
  manifest
  filePath
  loadedAt: new Date()
  lastModified: new Date() }
});
      // Store in main collection
      this.manifests.set(manifest.id, manifest);
      // Start watching file for changes
      this.watchFile(filePath);
      // Emit event
      this.emit('manifest:loaded', { manifest, filePath });
      return { success: true
  manifest
  source: 'file' }
};
 catch (error) { return {
  success: false
  error: error.message }
};
  /**
   * Load multiple manifests from directory
   */
  public async loadManifestsFromDirectory(directoryPath: string): Promise<ManifestBatchLoadResult> {

    const results: ManifestLoadResult = [];
    const errors: string = [];
    try {
      // Get all manifest files in directory
      const manifestFiles = await this.findManifestFiles(directoryPath);
      // Load each manifest
      for (const filePath of manifestFiles) {
        const result = await this.loadManifest(filePath);
        results.push(result);
        if (!result.success) {
          errors.push(`Failed to load ${filePath}: ${result.error}`);}
      return { success: errors.length === 0
  results
  errors
  totalFound: manifestFiles.length
  totalLoaded: results.filter(r => r.success).length }
};
 catch (error) { return {
  success: false
  results: []
  errors: [error.message]
  totalFound: 0
  totalLoaded: 0 }
};
  /**
   * Validate manifest with context
   */
  public validateManifest(manifest: ExtensionManifest)
  systemVersion: string = '1.0.0'
    platform: string = 'web'
    grantedPermissions: string = []): ExtensionValidationResult { 
  return extensionManifestValidator.validateManifest(manifest, {)
  systemVersion
  platform
  availableExtensions: this.manifests }
  grantedPermissions
});
  /**
   * Get manifest by ID
   */
  public getManifest(extensionId: string): ExtensionManifest | undefined { return this.manifests.get(extensionId);
  /**
  * Get all manifests
  */
  public getAllManifests(): ExtensionManifest {
  return Array.from(this.manifests.values());
  /**
  * Get manifests by type
  */
  public getManifestsByType(extensionType: string): ExtensionManifest {
  return Array.from(this.manifests.values())
  .filter(manifest => manifest.extension_type === extensionType);
  /**
  * Search manifests
  */
  public searchManifests(query: string): ExtensionManifest {
  const lowercaseQuery = query.toLowerCase();
  return Array.from(this.manifests.values())
  .filter(manifest => )
  manifest.name.toLowerCase().includes(lowercaseQuery) ||
  manifest.description.toLowerCase().includes(lowercaseQuery) ||
  manifest.id.toLowerCase().includes(lowercaseQuery) ||
  (manifest.metadata?.keywords || []).some(keyword => )
  keyword.toLowerCase().includes(lowercaseQuery)
  );
  /**
  * Get manifest dependencies
  */
  public getManifestDependencies(extensionId: string): ManifestDependencyInfo {
  const manifest = this.manifests.get(extensionId);
  if (!manifest) {
  return {
  manifest: undefined
  dependencies: []
  dependents: []
  missingDependencies: []
  circularDependencies: [] }
};
    const dependencies = this.resolveDependencies(manifest);
    const dependents = this.findDependents(extensionId);
    const missingDependencies = this.findMissingDependencies(manifest);
    const circularDependencies = this.findCircularDependencies(extensionId);
    return { manifest
      dependencies
      dependents
      missingDependencies }
      circularDependencies
    };
  /**
   * Check manifest compatibility
   */
  public checkCompatibility(manifest: ExtensionManifest)
  systemVersion: string
    platform: string): ExtensionValidationResult {
    return extensionManifestParser.checkCompatibility(manifest, systemVersion, platform);
  /**
   * Update manifest
   */
  public updateManifest(extensionId: string, updatedManifest: ExtensionManifest): boolean {
    if (!this.manifests.has(extensionId)) {
      return false;
    // Validate updated manifest
    const validation = this.validateManifest(updatedManifest);
    if (!validation.valid) {
      return false;
    // Update manifest
    this.manifests.set(extensionId, updatedManifest);
    // Update cache
    for (const [filePath, cached] of this.manifestCache.entries()) {
      if (cached.manifest.id === extensionId) {
        cached.manifest = updatedManifest;
        cached.lastModified = new Date();
        break;
    // Emit event
    this.emit('manifest:updated', { manifest: updatedManifest, extensionId });
    return true;
  /**
   * Remove manifest
   */
  public removeManifest(extensionId: string): boolean {
    const manifest = this.manifests.get(extensionId);
    if (!manifest) {
      return false;
    // Remove from main collection
    this.manifests.delete(extensionId);
    // Remove from cache
    for (const [filePath, cached] of this.manifestCache.entries()) {
      if (cached.manifest.id === extensionId) {
        this.manifestCache.delete(filePath);
        this.stopWatchingFile(filePath);
        break;
    // Emit event
    this.emit('manifest:removed', { manifest, extensionId });
    return true;
  /**
   * Refresh manifest from file
   */
  public async refreshManifest(extensionId: string): Promise<boolean> { // Find cached manifest
    let filePath: string | undefined;
    for (const [path, cached] of this.manifestCache.entries()) {
      if (cached.manifest.id === extensionId) {
        filePath = path;
        break;
    if (!filePath) {
      return false;
    // Remove from cache to force reload
    this.manifestCache.delete(filePath);
    // Reload manifest
    const result = await this.loadManifest(filePath);
    return result.success;
  /**
   * Get manifest statistics
   */
  public getManifestStatistics(): ManifestStatistics {
    const manifests = Array.from(this.manifests.values());
    const stats: ManifestStatistics = {
  total: manifests.length }
      byType: {}
      byVersion: {}
      byAuthor: {}
      totalDependencies: 0
      averageDependencies: 0
      mostPopularDependencies: []
      oldestVersion: ''
      newestVersion: ''
      cached: this.manifestCache.size;
  };
    // Count by type
    manifests.forEach(manifest => { )
  stats.byType[manifest.extension_type] = (stats.byType[manifest.extension_type] || 0) + 1 });
    // Count by version
    manifests.forEach(manifest => { )
  stats.byVersion[manifest.version] = (stats.byVersion[manifest.version] || 0) + 1 });
    // Count by author
    manifests.forEach(manifest => { )
  const author = manifest.author.name;
      stats.byAuthor[author] = (stats.byAuthor[author] || 0) + 1 });
    // Calculate dependency statistics
    const dependencyCounts = manifests.map(manifest => ;);
      Object.keys(manifest.dependencies?.extensions || {}).length
    );
    stats.totalDependencies = dependencyCounts.reduce((sum, count) => sum + count, 0);
    stats.averageDependencies = stats.totalDependencies / manifests.length;
    // Find version range
    const versions = manifests.map(m => m.version).sort(this.compareVersions);
    stats.oldestVersion = versions[0] || '';
    stats.newestVersion = versions[versions.length - 1] || '';
    return stats;
  /**
   * Event handling
   */
  public on(event: string, listener: (data: any) => void): void {
    this.eventEmitter.addEventListener(event, listener as EventListener);
  public off(event: string, listener: (data: any) => void): void {
    this.eventEmitter.removeEventListener(event, listener as EventListener);
  /**
   * Clear all manifests and cache
   */
  public clear(): void {
    this.manifests.clear();
    this.manifestCache.clear();
    this.watchedFiles.clear();
    this.emit('manifests:cleared');
  /**
   * Private helper methods
   */
  private emit(event: string, data?: any): void {
    this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
  private isCacheExpired(cached: CachedManifest): boolean {
    const cacheTimeout = 5 * 60 * 1000; // 5 minutes;
    return Date.now() - cached.loadedAt.getTime() > cacheTimeout;
  private async findManifestFiles(directoryPath: string): Promise<string> {

    // In a real implementation, this would scan the directory for manifest files
    // For now, we'll return a mock list
    return [
      `${directoryPath}/manifest.json`}

      `${directoryPath}/package.json`}
    ];
  private watchFile(filePath: string): void {
    if (this.watchedFiles.has(filePath)) {
      return;
    this.watchedFiles.add(filePath);
    // In a real implementation, this would use fs.watch or similar
    // For now, we'll simulate file watching
    this.emit('file:watching', { filePath });
  private stopWatchingFile(filePath: string): void {
    this.watchedFiles.delete(filePath);
    this.emit('file:stopped-watching', { filePath });
  private resolveDependencies(manifest: ExtensionManifest): ExtensionManifest {
    const dependencies: ExtensionManifest = [];
    if (manifest.dependencies?.extensions) {
      for (const depId of Object.keys(manifest.dependencies.extensions)) {
        const depManifest = this.manifests.get(depId);
        if (depManifest) {
          dependencies.push(depManifest);
    return dependencies;
  private findDependents(extensionId: string): ExtensionManifest {
    const dependents: ExtensionManifest = [];
    for (const manifest of this.manifests.values()) {
      if (manifest.dependencies?.extensions?.[extensionId]) {
        dependents.push(manifest);
    return dependents;
  private findMissingDependencies(manifest: ExtensionManifest): string {
    const missing: string = [];
    if (manifest.dependencies?.extensions) {
      for (const depId of Object.keys(manifest.dependencies.extensions)) {
        if (!this.manifests.has(depId)) {
          missing.push(depId);
    return missing;
  private findCircularDependencies(extensionId: string, visited: Set<string> = new Set()): string {
    if (visited.has(extensionId)) {
      return [extensionId];
    visited.add(extensionId);
    const manifest = this.manifests.get(extensionId);
    if (!manifest || !manifest.dependencies?.extensions) {
      return [];
    for (const depId of Object.keys(manifest.dependencies.extensions)) {
      const circular = this.findCircularDependencies(depId, new Set(visited));
      if (circular.length > 0) {
        return [extensionId, ...circular];
    return [];
  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    return 0;

// Extension Manifest Builder
export class ExtensionManifestBuilder {
  private manifest: Partial<ExtensionManifest> = {};
  constructor() { this.manifest.manifest_version = '1.0';
  public setBasicInfo(info: {) }
  id: string;
  name: string;
  version: string;
  description: string;
}): ExtensionManifestBuilder { this.manifest.id = info.id;
  this.manifest.name = info.name;
  this.manifest.version = info.version;
  this.manifest.description = info.description;
  return this;
  public setAuthor(author: {) }
  name: string;
  email?: string;
  url?: string;
}): ExtensionManifestBuilder { this.manifest.author = author;
  return this;
  public setExtensionType(type: 'node' | 'ui' | 'transform' | 'storage'): ExtensionManifestBuilder {
  this.manifest.extension_type = type;
  return this;
  public setMain(main: string): ExtensionManifestBuilder {
  this.manifest.main = main;
  return this;
  public setDependencies(dependencies: {) }
  system?: string;
  extensions?: Record<string, string>;
  npm?: Record<string, string>;
}): ExtensionManifestBuilder { this.manifest.dependencies = dependencies;
  return this;
  public setPermissions(permissions: string): ExtensionManifestBuilder {
  this.manifest.permissions = permissions;
  return this;
  public setCapabilities(capabilities: {) }
  provides?: string;
  requires?: string;
  optional?: string;
}): ExtensionManifestBuilder { this.manifest.capabilities = capabilities;
  return this;
  public setUI(ui: {) }
  icon?: string;
  category?: string;
  themes?: string;
  css?: string;
  components?: Record<string, string>;
}): ExtensionManifestBuilder { this.manifest.ui = ui;
  return this;
  public setRuntime(runtime: {) }
  node_types?: string;
  transforms?: string;
  storage_providers?: string;
  background_tasks?: string;
}): ExtensionManifestBuilder { this.manifest.runtime = runtime;
  return this;
  public setMetadata(metadata: {) }
  license?: string;
  repository?: string;
  homepage?: string;
  bugs?: string;
  keywords?: string;
  categories?: string;
}): ExtensionManifestBuilder { this.manifest.metadata = metadata;
  return this;
  public setCompatibility(compatibility: {) }
  min_system_version?: string;
  max_system_version?: string;
  platforms?: string;
}): ExtensionManifestBuilder { this.manifest.compatibility = compatibility;
  return this;
  public setSecurity(security: {)
  content_security_policy?: string;
  sandbox?: { }
  enabled?: boolean;
  permissions?: string;
};
    trusted_domains?: string;
  }): ExtensionManifestBuilder { this.manifest.security = security;
  return this;
  public build(): ExtensionManifest {
  // Validate required fields
  if (!this.manifest.id || !this.manifest.name || !this.manifest.version || )
  !this.manifest.description || !this.manifest.author || !this.manifest.extension_type ||
  !this.manifest.main) {
  throw new Error('Missing required manifest fields');
  return this.manifest as ExtensionManifest;
  public buildJSON(): string {
  return JSON.stringify(this.build(), null, 2);
  // Types and Interfaces
  interface CachedManifest {
  manifest: ExtensionManifest;
  filePath: string;
  loadedAt: Date;
  lastModified: Date;
  interface ManifestLoadResult {
  success: boolean;
  manifest?: ExtensionManifest;
  source?: 'cache' | 'file';
  error?: string;
  details?: Array<{ }
  path: string;
  message: string;
  code: string;


>;


interface ManifestBatchLoadResult { success: boolean;
  results: ManifestLoadResult;
  errors: string;
  totalFound: number;
  totalLoaded: number }


interface ManifestDependencyInfo { manifest?: ExtensionManifest;
  dependencies: ExtensionManifest;
  dependents: ExtensionManifest;
  missingDependencies: string;
  circularDependencies: string }


interface ManifestStatistics { total: number;
  byType: Record<string, number>;
  byVersion: Record<string, number>;
  byAuthor: Record<string, number>;
  totalDependencies: number;
  averageDependencies: number;
  mostPopularDependencies: string;
  oldestVersion: string;
  newestVersion: string;
  cached: number;
  // Export singletons
  export const extensionManifestManager = ExtensionManifestManager.getInstance();
  export const extensionManifestBuilder = new ExtensionManifestBuilder() }
