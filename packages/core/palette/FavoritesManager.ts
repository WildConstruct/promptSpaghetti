// packages/core/palette/FavoritesManager.ts
// Favorites management system for Epic 7.2 Palette Categorization
/**
 * Favorites change listener function type
 */
export type FavoritesChangeListener = (favorites: string[]) => void;
/**
 * LocalStorage key for favorites persistence
 */
const FAVORITES_STORAGE_KEY = 'prompt-spaghetti-node-favorites';
/**
 * Favorites data structure
 */
export interface FavoritesData {
  nodeIds: string[];
  lastModified: string;
  version: string;
}
/**
 * Singleton favorites manager class
 */
export class FavoritesManager {
  private static instance: FavoritesManager;
  private favorites: Set<string> = new Set();
  private listeners: Set<FavoritesChangeListener> = new Set();
  private storageVersion = '1.0.0';
  private constructor() {
    this.loadFavorites();
    this.setupBeforeUnloadHandler();
  }
  /**
   * Get singleton instance
   */
  public static getInstance(): FavoritesManager {
    if (!FavoritesManager.instance) {
      FavoritesManager.instance = new FavoritesManager();
    }
    return FavoritesManager.instance;
  }
  /**
   * Get current favorites as array
   */
  public getFavorites(): string[] {
    return Array.from(this.favorites);
  }
  /**
   * Check if a node is favorited
   */
  public isFavorite(nodeId: string): boolean {
    return this.favorites.has(nodeId);
  }
  /**
   * Add node to favorites
   */
  public addFavorite(nodeId: string): boolean {
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
  public removeFavorite(nodeId: string): boolean {
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
  public toggleFavorite(nodeId: string): boolean {
    const isFavorited = this.isFavorite(nodeId);
    if (isFavorited) {
      this.removeFavorite(nodeId);
    } else {
      this.addFavorite(nodeId);
    }
    return !isFavorited;
  }
  /**
   * Clear all favorites
   */
  public clearFavorites(): void {
    this.favorites.clear();
    this.saveFavorites();
    this.notifyListeners();
  }
  /**
   * Set favorites from array (replaces existing)
   */
  public setFavorites(nodeIds: string[]): void {
    this.favorites = new Set(nodeIds);
    this.saveFavorites();
    this.notifyListeners();
  }
  /**
   * Reorder favorites
   */
  public reorderFavorites(orderedNodeIds: string[]): void {
    // Filter to only include actual favorites
    const validFavorites = orderedNodeIds.filter(id => this.favorites.has(id));
    // Add any favorites that weren't in the ordered list
    const missingFavorites = Array.from(this.favorites).filter(id => ;)
      !orderedNodeIds.includes(id)
    );
    this.setFavorites([...validFavorites, ...missingFavorites]);
  }
  /**
   * Get favorites count
   */
  public getFavoritesCount(): number {
    return this.favorites.size;
  }
  /**
   * Add change listener
   */
  public addChangeListener(listener: FavoritesChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Remove all listeners
   */
  public clearListeners(): void {
    this.listeners.clear();
  }
  /**
   * Export favorites data
   */
  public exportFavorites(): FavoritesData {
    return {
      nodeIds: this.getFavorites(),
      lastModified: new Date().toISOString(),
      version: this.storageVersion,
    };
  }
  /**
   * Import favorites data
   */
  public importFavorites(data: FavoritesData): boolean {
    try {
      if (!Array.isArray(data.nodeIds)) {
        return false;
      }
      // Validate node IDs are strings
      const validNodeIds = data.nodeIds.filter(id => ;)
        typeof id === 'string' && id.length > 0
      );
      this.setFavorites(validNodeIds);
      return true;
    } catch (error) {
      console.error('Failed to import favorites:', error);
      return false;
    }
  }
  /**
   * Load favorites from localStorage
   */
  private loadFavorites(): void {
    try {
      const savedData = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!savedData) {
        return;
      }
      const parsedData = JSON.parse(savedData) as FavoritesData;
      // Handle legacy format (simple array)
      if (Array.isArray(parsedData)) {
        this.favorites = new Set(parsedData.filter(id => typeof id === 'string'));
        return;
      }
      // Handle new format
      if (parsedData.nodeIds && Array.isArray(parsedData.nodeIds)) {
        this.favorites = new Set(parsedData.nodeIds.filter(id => typeof id === 'string'));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.favorites = new Set();
    }
  }
  /**
   * Save favorites to localStorage
   */
  private saveFavorites(): void {
    try {
      const data: FavoritesData = {
        nodeIds: this.getFavorites(),
        lastModified: new Date().toISOString(),
        version: this.storageVersion,
      };
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }
  /**
   * Notify change listeners
   */
  private notifyListeners(): void {
    const favorites = this.getFavorites();
    this.listeners.forEach(listener => {)
      try {
        listener(favorites);
      } catch (error) {
        console.error('Favorites change listener error:', error);
      }
    });
  }
  /**
   * Setup beforeunload handler to save favorites
   */
  private setupBeforeUnloadHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveFavorites();
      });
    }
  }
}

// Export singleton instance getter
export const getFavoritesManager = () => FavoritesManager.getInstance();