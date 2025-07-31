/**
 * Favorites change listener function type
 */
export type FavoritesChangeListener = (favorites: string[]) => void;
/**
 * Favorites data structure
 */

}
export interface FavoritesData {
    nodeIds: string[];
    lastModified: string;
    version: string;


/**
 * Singleton favorites manager class
 */
export declare class FavoritesManager {
    private static instance;
    private favorites;
    private listeners;
    private storageVersion;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): FavoritesManager;
    /**
     * Get current favorites as array
     */
    getFavorites(): string[];
    /**
     * Check if a node is favorited
     */
    isFavorite(nodeId: string): boolean;
    /**
     * Add node to favorites
     */
    addFavorite(nodeId: string): boolean;
    /**
     * Remove node from favorites
     */
    removeFavorite(nodeId: string): boolean;
    /**
     * Toggle favorite status
     */
    toggleFavorite(nodeId: string): boolean;
    /**
     * Clear all favorites
     */
    clearFavorites(): void;
    /**
     * Set favorites from array (replaces existing)
     */
    setFavorites(nodeIds: string[]): void;
    /**
     * Reorder favorites
     */
    reorderFavorites(orderedNodeIds: string[]): void;
    /**
     * Get favorites count
     */
    getFavoritesCount(): number;
    /**
     * Add change listener
     */
    addChangeListener(listener: FavoritesChangeListener): () => void;
    /**
     * Remove all listeners
     */
    clearListeners(): void;
    /**
     * Export favorites data
     */
    exportFavorites(): FavoritesData;
    /**
     * Import favorites data
     */
    importFavorites(data: FavoritesData): boolean;
    /**
     * Load favorites from localStorage
     */
    private loadFavorites;
    /**
     * Save favorites to localStorage
     */
    private saveFavorites;
    /**
     * Notify change listeners
     */
    private notifyListeners;
    /**
     * Setup beforeunload handler to save favorites
     */
    private setupBeforeUnloadHandler;

export declare //# sourceMappingURL=FavoritesManager.d.ts.map
}