// packages/core/palette/FavoritesManager.ts
// Favorites management system for Epic 7.2 Palette Categorization
/**
 * LocalStorage key for favorites persistence
 */
const FAVORITES_STORAGE_KEY = 'prompt-spaghetti-node-favorites';
/**
 * Singleton favorites manager class
 */
export class FavoritesManager {
    static instance;
    favorites = new Set();
    listeners = new Set();
    storageVersion = '1.0.0';
    constructor() {
        this.loadFavorites();
        this.setupBeforeUnloadHandler();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!FavoritesManager.instance) {
            FavoritesManager.instance = new FavoritesManager();
        }
        return FavoritesManager.instance;
    }
    /**
     * Get current favorites as array
     */
    getFavorites() {
        return Array.from(this.favorites);
    }
    /**
     * Check if a node is favorited
     */
    isFavorite(nodeId) {
        return this.favorites.has(nodeId);
    }
    /**
     * Add node to favorites
     */
    addFavorite(nodeId) {
        if (this.favorites.has(nodeId)) {
            return false; // Already favorited
        }
        this.favorites.add(nodeId);
        this.saveFavorites();
        this.notifyListeners();
        return true;
    }
    /**
     * Remove node from favorites
     */
    removeFavorite(nodeId) {
        if (!this.favorites.has(nodeId)) {
            return false; // Not favorited
        }
        this.favorites.delete(nodeId);
        this.saveFavorites();
        this.notifyListeners();
        return true;
    }
    /**
     * Toggle favorite status
     */
    toggleFavorite(nodeId) {
        const isFavorited = this.isFavorite(nodeId);
        if (isFavorited) {
            this.removeFavorite(nodeId);
        }
        else {
            this.addFavorite(nodeId);
        }
        return !isFavorited;
    }
    /**
     * Clear all favorites
     */
    clearFavorites() {
        this.favorites.clear();
        this.saveFavorites();
        this.notifyListeners();
    }
    /**
     * Set favorites from array (replaces existing)
     */
    setFavorites(nodeIds) {
        this.favorites = new Set(nodeIds);
        this.saveFavorites();
        this.notifyListeners();
    }
    /**
     * Reorder favorites
     */
    reorderFavorites(orderedNodeIds) {
        // Filter to only include actual favorites
        const validFavorites = orderedNodeIds.filter(id => this.favorites.has(id));
        // Add any favorites that weren't in the ordered list
        const missingFavorites = Array.from(this.favorites).filter(id => !orderedNodeIds.includes(id));
        this.setFavorites([...validFavorites, ...missingFavorites]);
    }
    /**
     * Get favorites count
     */
    getFavoritesCount() {
        return this.favorites.size;
    }
    /**
     * Add change listener
     */
    addChangeListener(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * Remove all listeners
     */
    clearListeners() {
        this.listeners.clear();
    }
    /**
     * Export favorites data
     */
    exportFavorites() {
        return {
            nodeIds: this.getFavorites(),
            lastModified: new Date().toISOString(),
            version: this.storageVersion
        };
    }
    /**
     * Import favorites data
     */
    importFavorites(data) {
        try {
            if (!Array.isArray(data.nodeIds)) {
                return false;
            }
            // Validate node IDs are strings
            const validNodeIds = data.nodeIds.filter(id => typeof id === 'string' && id.length > 0);
            this.setFavorites(validNodeIds);
            return true;
        }
        catch (error) {
            console.error('Failed to import favorites:', error);
            return false;
        }
    }
    /**
     * Load favorites from localStorage
     */
    loadFavorites() {
        try {
            const savedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (!savedData) {
                return;
            }
            const parsedData = JSON.parse(savedData);
            // Handle legacy format (simple array)
            if (Array.isArray(parsedData)) {
                this.favorites = new Set(parsedData.filter(id => typeof id === 'string'));
                return;
            }
            // Handle new format
            if (parsedData.nodeIds && Array.isArray(parsedData.nodeIds)) {
                this.favorites = new Set(parsedData.nodeIds.filter(id => typeof id === 'string'));
            }
        }
        catch (error) {
            console.error('Failed to load favorites:', error);
            this.favorites = new Set();
        }
    }
    /**
     * Save favorites to localStorage
     */
    saveFavorites() {
        try {
            const data = {
                nodeIds: this.getFavorites(),
                lastModified: new Date().toISOString(),
                version: this.storageVersion
            };
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data));
        }
        catch (error) {
            console.error('Failed to save favorites:', error);
        }
    }
    /**
     * Notify change listeners
     */
    notifyListeners() {
        const favorites = this.getFavorites();
        this.listeners.forEach(listener => {
            try {
                listener(favorites);
            }
            catch (error) {
                console.error('Favorites change listener error:', error);
            }
        });
    }
    /**
     * Setup beforeunload handler to save favorites
     */
    setupBeforeUnloadHandler() {
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.saveFavorites();
            });
        }
    }
}
// Export singleton instance getter
export const getFavoritesManager = () => FavoritesManager.getInstance();
