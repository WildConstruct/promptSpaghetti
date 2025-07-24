/**
 * Extension Manifest Manager - Epic 8.4 Story 8.4.3
 * Manages extension manifests including loading, caching, and validation
 */
import { extensionManifestParser, extensionManifestValidator } from './ExtensionManifest.js';
// Extension Manifest Manager
export class ExtensionManifestManager {
    static instance;
    manifests = new Map();
    manifestCache = new Map();
    watchedFiles = new Set();
    eventEmitter = new EventTarget();
    constructor() { }
    static getInstance() {
        if (!ExtensionManifestManager.instance) {
            ExtensionManifestManager.instance = new ExtensionManifestManager();
        }
        return ExtensionManifestManager.instance;
    }
    /**
     * Load manifest from file
     */
    async loadManifest(filePath) {
        try {
            // Check cache first
            const cached = this.manifestCache.get(filePath);
            if (cached && !this.isCacheExpired(cached)) {
                return {
                    success: true,
                    manifest: cached.manifest,
                    source: 'cache'
                };
            }
            // Parse manifest
            const parseResult = await extensionManifestParser.parseManifestFromFile(filePath);
            if (!parseResult.success) {
                return {
                    success: false,
                    error: parseResult.error,
                    details: parseResult.details
                };
            }
            const manifest = parseResult.data;
            // Cache the manifest
            this.manifestCache.set(filePath, {
                manifest,
                filePath,
                loadedAt: new Date(),
                lastModified: new Date()
            });
            // Store in main collection
            this.manifests.set(manifest.id, manifest);
            // Start watching file for changes
            this.watchFile(filePath);
            // Emit event
            this.emit('manifest:loaded', { manifest, filePath });
            return {
                success: true,
                manifest,
                source: 'file'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    /**
     * Load multiple manifests from directory
     */
    async loadManifestsFromDirectory(directoryPath) {
        const results = [];
        const errors = [];
        try {
            // Get all manifest files in directory
            const manifestFiles = await this.findManifestFiles(directoryPath);
            // Load each manifest
            for (const filePath of manifestFiles) {
                const result = await this.loadManifest(filePath);
                results.push(result);
                if (!result.success) {
                    errors.push(`Failed to load ${filePath}: ${result.error}`);
                }
            }
            return {
                success: errors.length === 0,
                results,
                errors,
                totalFound: manifestFiles.length,
                totalLoaded: results.filter(r => r.success).length
            };
        }
        catch (error) {
            return {
                success: false,
                results: [],
                errors: [error.message],
                totalFound: 0,
                totalLoaded: 0
            };
        }
    }
    /**
     * Validate manifest with context
     */
    validateManifest(manifest, systemVersion = '1.0.0', platform = 'web', grantedPermissions = []) {
        return extensionManifestValidator.validateManifest(manifest, {
            systemVersion,
            platform,
            availableExtensions: this.manifests,
            grantedPermissions
        });
    }
    /**
     * Get manifest by ID
     */
    getManifest(extensionId) {
        return this.manifests.get(extensionId);
    }
    /**
     * Get all manifests
     */
    getAllManifests() {
        return Array.from(this.manifests.values());
    }
    /**
     * Get manifests by type
     */
    getManifestsByType(extensionType) {
        return Array.from(this.manifests.values())
            .filter(manifest => manifest.extension_type === extensionType);
    }
    /**
     * Search manifests
     */
    searchManifests(query) {
        const lowercaseQuery = query.toLowerCase();
        return Array.from(this.manifests.values())
            .filter(manifest => manifest.name.toLowerCase().includes(lowercaseQuery) ||
            manifest.description.toLowerCase().includes(lowercaseQuery) ||
            manifest.id.toLowerCase().includes(lowercaseQuery) ||
            (manifest.metadata?.keywords || []).some(keyword => keyword.toLowerCase().includes(lowercaseQuery)));
    }
    /**
     * Get manifest dependencies
     */
    getManifestDependencies(extensionId) {
        const manifest = this.manifests.get(extensionId);
        if (!manifest) {
            return {
                manifest: undefined,
                dependencies: [],
                dependents: [],
                missingDependencies: [],
                circularDependencies: []
            };
        }
        const dependencies = this.resolveDependencies(manifest);
        const dependents = this.findDependents(extensionId);
        const missingDependencies = this.findMissingDependencies(manifest);
        const circularDependencies = this.findCircularDependencies(extensionId);
        return {
            manifest,
            dependencies,
            dependents,
            missingDependencies,
            circularDependencies
        };
    }
    /**
     * Check manifest compatibility
     */
    checkCompatibility(manifest, systemVersion, platform) {
        return extensionManifestParser.checkCompatibility(manifest, systemVersion, platform);
    }
    /**
     * Update manifest
     */
    updateManifest(extensionId, updatedManifest) {
        if (!this.manifests.has(extensionId)) {
            return false;
        }
        // Validate updated manifest
        const validation = this.validateManifest(updatedManifest);
        if (!validation.valid) {
            return false;
        }
        // Update manifest
        this.manifests.set(extensionId, updatedManifest);
        // Update cache
        for (const [filePath, cached] of this.manifestCache.entries()) {
            if (cached.manifest.id === extensionId) {
                cached.manifest = updatedManifest;
                cached.lastModified = new Date();
                break;
            }
        }
        // Emit event
        this.emit('manifest:updated', { manifest: updatedManifest, extensionId });
        return true;
    }
    /**
     * Remove manifest
     */
    removeManifest(extensionId) {
        const manifest = this.manifests.get(extensionId);
        if (!manifest) {
            return false;
        }
        // Remove from main collection
        this.manifests.delete(extensionId);
        // Remove from cache
        for (const [filePath, cached] of this.manifestCache.entries()) {
            if (cached.manifest.id === extensionId) {
                this.manifestCache.delete(filePath);
                this.stopWatchingFile(filePath);
                break;
            }
        }
        // Emit event
        this.emit('manifest:removed', { manifest, extensionId });
        return true;
    }
    /**
     * Refresh manifest from file
     */
    async refreshManifest(extensionId) {
        // Find cached manifest
        let filePath;
        for (const [path, cached] of this.manifestCache.entries()) {
            if (cached.manifest.id === extensionId) {
                filePath = path;
                break;
            }
        }
        if (!filePath) {
            return false;
        }
        // Remove from cache to force reload
        this.manifestCache.delete(filePath);
        // Reload manifest
        const result = await this.loadManifest(filePath);
        return result.success;
    }
    /**
     * Get manifest statistics
     */
    getManifestStatistics() {
        const manifests = Array.from(this.manifests.values());
        const stats = {
            total: manifests.length,
            byType: {},
            byVersion: {},
            byAuthor: {},
            totalDependencies: 0,
            averageDependencies: 0,
            mostPopularDependencies: [],
            oldestVersion: '',
            newestVersion: '',
            cached: this.manifestCache.size
        };
        // Count by type
        manifests.forEach(manifest => {
            stats.byType[manifest.extension_type] = (stats.byType[manifest.extension_type] || 0) + 1;
        });
        // Count by version
        manifests.forEach(manifest => {
            stats.byVersion[manifest.version] = (stats.byVersion[manifest.version] || 0) + 1;
        });
        // Count by author
        manifests.forEach(manifest => {
            const author = manifest.author.name;
            stats.byAuthor[author] = (stats.byAuthor[author] || 0) + 1;
        });
        // Calculate dependency statistics
        const dependencyCounts = manifests.map(manifest => Object.keys(manifest.dependencies?.extensions || {}).length);
        stats.totalDependencies = dependencyCounts.reduce((sum, count) => sum + count, 0);
        stats.averageDependencies = stats.totalDependencies / manifests.length;
        // Find version range
        const versions = manifests.map(m => m.version).sort(this.compareVersions);
        stats.oldestVersion = versions[0] || '';
        stats.newestVersion = versions[versions.length - 1] || '';
        return stats;
    }
    /**
     * Event handling
     */
    on(event, listener) {
        this.eventEmitter.addEventListener(event, listener);
    }
    off(event, listener) {
        this.eventEmitter.removeEventListener(event, listener);
    }
    /**
     * Clear all manifests and cache
     */
    clear() {
        this.manifests.clear();
        this.manifestCache.clear();
        this.watchedFiles.clear();
        this.emit('manifests:cleared');
    }
    /**
     * Private helper methods
     */
    emit(event, data) {
        this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
    isCacheExpired(cached) {
        const cacheTimeout = 5 * 60 * 1000; // 5 minutes
        return Date.now() - cached.loadedAt.getTime() > cacheTimeout;
    }
    async findManifestFiles(directoryPath) {
        // In a real implementation, this would scan the directory for manifest files
        // For now, we'll return a mock list
        return [
            `${directoryPath}/manifest.json`,
            `${directoryPath}/package.json`
        ];
    }
    watchFile(filePath) {
        if (this.watchedFiles.has(filePath)) {
            return;
        }
        this.watchedFiles.add(filePath);
        // In a real implementation, this would use fs.watch or similar
        // For now, we'll simulate file watching
        this.emit('file:watching', { filePath });
    }
    stopWatchingFile(filePath) {
        this.watchedFiles.delete(filePath);
        this.emit('file:stopped-watching', { filePath });
    }
    resolveDependencies(manifest) {
        const dependencies = [];
        if (manifest.dependencies?.extensions) {
            for (const depId of Object.keys(manifest.dependencies.extensions)) {
                const depManifest = this.manifests.get(depId);
                if (depManifest) {
                    dependencies.push(depManifest);
                }
            }
        }
        return dependencies;
    }
    findDependents(extensionId) {
        const dependents = [];
        for (const manifest of this.manifests.values()) {
            if (manifest.dependencies?.extensions?.[extensionId]) {
                dependents.push(manifest);
            }
        }
        return dependents;
    }
    findMissingDependencies(manifest) {
        const missing = [];
        if (manifest.dependencies?.extensions) {
            for (const depId of Object.keys(manifest.dependencies.extensions)) {
                if (!this.manifests.has(depId)) {
                    missing.push(depId);
                }
            }
        }
        return missing;
    }
    findCircularDependencies(extensionId, visited = new Set()) {
        if (visited.has(extensionId)) {
            return [extensionId];
        }
        visited.add(extensionId);
        const manifest = this.manifests.get(extensionId);
        if (!manifest || !manifest.dependencies?.extensions) {
            return [];
        }
        for (const depId of Object.keys(manifest.dependencies.extensions)) {
            const circular = this.findCircularDependencies(depId, new Set(visited));
            if (circular.length > 0) {
                return [extensionId, ...circular];
            }
        }
        return [];
    }
    compareVersions(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aPart = aParts[i] || 0;
            const bPart = bParts[i] || 0;
            if (aPart > bPart)
                return 1;
            if (aPart < bPart)
                return -1;
        }
        return 0;
    }
}
// Extension Manifest Builder
export class ExtensionManifestBuilder {
    manifest = {};
    constructor() {
        this.manifest.manifest_version = '1.0';
    }
    setBasicInfo(info) {
        this.manifest.id = info.id;
        this.manifest.name = info.name;
        this.manifest.version = info.version;
        this.manifest.description = info.description;
        return this;
    }
    setAuthor(author) {
        this.manifest.author = author;
        return this;
    }
    setExtensionType(type) {
        this.manifest.extension_type = type;
        return this;
    }
    setMain(main) {
        this.manifest.main = main;
        return this;
    }
    setDependencies(dependencies) {
        this.manifest.dependencies = dependencies;
        return this;
    }
    setPermissions(permissions) {
        this.manifest.permissions = permissions;
        return this;
    }
    setCapabilities(capabilities) {
        this.manifest.capabilities = capabilities;
        return this;
    }
    setUI(ui) {
        this.manifest.ui = ui;
        return this;
    }
    setRuntime(runtime) {
        this.manifest.runtime = runtime;
        return this;
    }
    setMetadata(metadata) {
        this.manifest.metadata = metadata;
        return this;
    }
    setCompatibility(compatibility) {
        this.manifest.compatibility = compatibility;
        return this;
    }
    setSecurity(security) {
        this.manifest.security = security;
        return this;
    }
    build() {
        // Validate required fields
        if (!this.manifest.id || !this.manifest.name || !this.manifest.version ||
            !this.manifest.description || !this.manifest.author || !this.manifest.extension_type ||
            !this.manifest.main) {
            throw new Error('Missing required manifest fields');
        }
        return this.manifest;
    }
    buildJSON() {
        return JSON.stringify(this.build(), null, 2);
    }
}
// Export singletons
export const extensionManifestManager = ExtensionManifestManager.getInstance();
export const extensionManifestBuilder = new ExtensionManifestBuilder();
