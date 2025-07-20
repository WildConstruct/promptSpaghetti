import { Platform, PromptGraph } from '../types/index.js';
import { PreviewImage, PreviewResult } from '../preview/PreviewGenerationSystem.js';

/**
 * Gallery item representing a generated image result
 */
export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  image: PreviewImage;
  originalGraph: PromptGraph;
  platform: Platform;
  prompt: string;
  parameters: Record<string, any>;
  metadata: GalleryItemMetadata;
  tags: string[];
  rating?: number; // 1-5 stars
  isFavorite: boolean;
  collections: string[];
}

/**
 * Gallery item metadata
 */
export interface GalleryItemMetadata {
  created: Date;
  modified: Date;
  generationTime: number;
  cost?: number;
  quality?: number;
  downloads: number;
  views: number;
  shares: number;
  sourceRequestId?: string;
}

/**
 * Gallery collection
 */
export interface GalleryCollection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  itemCount: number;
  created: Date;
  modified: Date;
  isPublic: boolean;
  tags: string[];
}

/**
 * Gallery filter options
 */
export interface GalleryFilter {
  platforms?: Platform[];
  tags?: string[];
  collections?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  rating?: {
    min: number;
    max: number;
  };
  favorites?: boolean;
  searchQuery?: string;
  sortBy?: 'created' | 'modified' | 'rating' | 'views' | 'quality';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Gallery statistics
 */
export interface GalleryStats {
  totalItems: number;
  totalCollections: number;
  platformBreakdown: Record<Platform, number>;
  averageRating: number;
  totalGenerated: number;
  totalCost: number;
  topTags: Array<{ tag: string; count: number }>;
  recentActivity: Array<{
    type: 'created' | 'rated' | 'favorited' | 'shared';
    itemId: string;
    timestamp: Date;
  }>;
}

/**
 * Gallery export options
 */
export interface ExportOptions {
  format: 'json' | 'csv' | 'zip';
  includeImages?: boolean;
  includeMetadata?: boolean;
  includePrompts?: boolean;
  compression?: 'none' | 'low' | 'medium' | 'high';
  maxSize?: number; // bytes
}

/**
 * Gallery export result
 */
export interface ExportResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: string;
  url?: string;
  size?: number;
  itemCount: number;
  created: Date;
  expiresAt?: Date;
  error?: string;
}

/**
 * Comprehensive result gallery system for managing generated images
 */
export class ResultGallerySystem {
  private items: Map<string, GalleryItem> = new Map();
  private collections: Map<string, GalleryCollection> = new Map();
  private exports: Map<string, ExportResult> = new Map();
  
  private readonly maxItems = 10000;
  private readonly maxCollections = 100;

  constructor() {
    this.initializeDefaultCollections();
  }

  /**
   * Add a result to the gallery
   */
  async addResult(result: PreviewResult, title?: string): Promise<string> {
    if (!result.images || result.images.length === 0) {
      throw new Error('No images in result to add to gallery');
    }

    const galleryItems: string[] = [];

    for (let i = 0; i < result.images.length; i++) {
      const image = result.images[i];
      const itemId = this.generateItemId();

      const galleryItem: GalleryItem = {
        id: itemId,
        title: title || `Generated Image ${i + 1}`,
        image,
        originalGraph: result.prompt.metadata.originalGraphId ? 
          await this.getGraphById(result.prompt.metadata.originalGraphId) : 
          this.createEmptyGraph(),
        platform: result.platform,
        prompt: result.prompt.content as string,
        parameters: result.prompt.parameters,
        metadata: {
          created: new Date(),
          modified: new Date(),
          generationTime: image.generationTime,
          cost: this.estimateCost(result.platform, image),
          quality: result.metadata.quality,
          downloads: 0,
          views: 0,
          shares: 0,
          sourceRequestId: result.id
        },
        tags: this.extractTags(result.prompt.content as string),
        isFavorite: false,
        collections: ['recent']
      };

      // Check storage limits
      if (this.items.size >= this.maxItems) {
        await this.cleanOldItems();
      }

      this.items.set(itemId, galleryItem);
      galleryItems.push(itemId);

      // Update collection counts
      this.updateCollectionCounts(['recent']);
    }

    return galleryItems[0]; // Return first item ID
  }

  /**
   * Get gallery item by ID
   */
  getItem(itemId: string): GalleryItem | null {
    const item = this.items.get(itemId);
    if (item) {
      // Increment view count
      item.metadata.views++;
      item.metadata.modified = new Date();
    }
    return item || null;
  }

  /**
   * Update gallery item
   */
  updateItem(itemId: string, updates: Partial<GalleryItem>): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    const oldCollections = [...item.collections];

    Object.assign(item, updates);
    item.metadata.modified = new Date();

    // Update collection counts if collections changed
    if (updates.collections && JSON.stringify(oldCollections) !== JSON.stringify(updates.collections)) {
      this.updateCollectionCounts(oldCollections, -1);
      this.updateCollectionCounts(updates.collections, 1);
    }

    return true;
  }

  /**
   * Delete gallery item
   */
  deleteItem(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    // Update collection counts
    this.updateCollectionCounts(item.collections, -1);
    
    this.items.delete(itemId);
    return true;
  }

  /**
   * Search and filter gallery items
   */
  searchItems(filter: GalleryFilter = {}): GalleryItem[] {
    let items = Array.from(this.items.values());

    // Apply filters
    if (filter.platforms?.length) {
      items = items.filter(item => filter.platforms!.includes(item.platform));
    }

    if (filter.tags?.length) {
      items = items.filter(item => 
        filter.tags!.some(tag => item.tags.includes(tag))
      );
    }

    if (filter.collections?.length) {
      items = items.filter(item => 
        filter.collections!.some(collection => item.collections.includes(collection))
      );
    }

    if (filter.dateRange) {
      items = items.filter(item => 
        item.metadata.created >= filter.dateRange!.start &&
        item.metadata.created <= filter.dateRange!.end
      );
    }

    if (filter.rating) {
      items = items.filter(item => 
        item.rating !== undefined &&
        item.rating >= filter.rating!.min &&
        item.rating <= filter.rating!.max
      );
    }

    if (filter.favorites === true) {
      items = items.filter(item => item.isFavorite);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.prompt.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort items
    const sortBy = filter.sortBy || 'created';
    const sortOrder = filter.sortOrder || 'desc';

    items.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
      case 'created':
        aVal = a.metadata.created.getTime();
        bVal = b.metadata.created.getTime();
        break;
      case 'modified':
        aVal = a.metadata.modified.getTime();
        bVal = b.metadata.modified.getTime();
        break;
      case 'rating':
        aVal = a.rating || 0;
        bVal = b.rating || 0;
        break;
      case 'views':
        aVal = a.metadata.views;
        bVal = b.metadata.views;
        break;
      case 'quality':
        aVal = a.metadata.quality || 0;
        bVal = b.metadata.quality || 0;
        break;
      default:
        aVal = a.metadata.created.getTime();
        bVal = b.metadata.created.getTime();
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    if (filter.offset || filter.limit) {
      const start = filter.offset || 0;
      const end = filter.limit ? start + filter.limit : undefined;
      items = items.slice(start, end);
    }

    return items;
  }

  /**
   * Create a new collection
   */
  createCollection(
    name: string,
    description?: string,
    color?: string,
    isPublic = false
  ): string {
    if (this.collections.size >= this.maxCollections) {
      throw new Error('Maximum number of collections reached');
    }

    const collectionId = this.generateCollectionId();
    const collection: GalleryCollection = {
      id: collectionId,
      name,
      description,
      color,
      itemCount: 0,
      created: new Date(),
      modified: new Date(),
      isPublic,
      tags: []
    };

    this.collections.set(collectionId, collection);
    return collectionId;
  }

  /**
   * Get collection by ID
   */
  getCollection(collectionId: string): GalleryCollection | null {
    return this.collections.get(collectionId) || null;
  }

  /**
   * Get all collections
   */
  getCollections(): GalleryCollection[] {
    return Array.from(this.collections.values());
  }

  /**
   * Update collection
   */
  updateCollection(collectionId: string, updates: Partial<GalleryCollection>): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;

    Object.assign(collection, updates);
    collection.modified = new Date();

    return true;
  }

  /**
   * Delete collection
   */
  deleteCollection(collectionId: string): boolean {
    // Cannot delete default collections
    if (['recent', 'favorites', 'top-rated'].includes(collectionId)) {
      return false;
    }

    // Remove collection from all items
    for (const item of this.items.values()) {
      const index = item.collections.indexOf(collectionId);
      if (index >= 0) {
        item.collections.splice(index, 1);
      }
    }

    this.collections.delete(collectionId);
    return true;
  }

  /**
   * Add items to collection
   */
  addToCollection(itemIds: string[], collectionId: string): number {
    let added = 0;
    
    for (const itemId of itemIds) {
      const item = this.items.get(itemId);
      if (item && !item.collections.includes(collectionId)) {
        item.collections.push(collectionId);
        item.metadata.modified = new Date();
        added++;
      }
    }

    if (added > 0) {
      this.updateCollectionCounts([collectionId], added);
    }

    return added;
  }

  /**
   * Remove items from collection
   */
  removeFromCollection(itemIds: string[], collectionId: string): number {
    let removed = 0;
    
    for (const itemId of itemIds) {
      const item = this.items.get(itemId);
      if (item) {
        const index = item.collections.indexOf(collectionId);
        if (index >= 0) {
          item.collections.splice(index, 1);
          item.metadata.modified = new Date();
          removed++;
        }
      }
    }

    if (removed > 0) {
      this.updateCollectionCounts([collectionId], -removed);
    }

    return removed;
  }

  /**
   * Get gallery statistics
   */
  getStats(): GalleryStats {
    const items = Array.from(this.items.values());
    
    // Platform breakdown
    const platformBreakdown: Record<Platform, number> = {} as Record<Platform, number>;
    items.forEach(item => {
      platformBreakdown[item.platform] = (platformBreakdown[item.platform] || 0) + 1;
    });

    // Average rating
    const ratedItems = items.filter(item => item.rating !== undefined);
    const averageRating = ratedItems.length > 0 
      ? ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length
      : 0;

    // Top tags
    const tagCounts: Record<string, number> = {};
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Recent activity (simplified)
    const recentActivity = items
      .sort((a, b) => b.metadata.modified.getTime() - a.metadata.modified.getTime())
      .slice(0, 10)
      .map(item => ({
        type: 'created' as const,
        itemId: item.id,
        timestamp: item.metadata.created
      }));

    return {
      totalItems: items.length,
      totalCollections: this.collections.size,
      platformBreakdown,
      averageRating,
      totalGenerated: items.length,
      totalCost: items.reduce((sum, item) => sum + (item.metadata.cost || 0), 0),
      topTags,
      recentActivity
    };
  }

  /**
   * Export gallery data
   */
  async exportGallery(
    itemIds: string[],
    options: ExportOptions
  ): Promise<string> {
    const exportId = this.generateExportId();
    
    const exportResult: ExportResult = {
      id: exportId,
      status: 'pending',
      format: options.format,
      itemCount: itemIds.length,
      created: new Date()
    };

    this.exports.set(exportId, exportResult);

    // Start export process (async)
    this.processExport(exportId, itemIds, options);

    return exportId;
  }

  /**
   * Get export result
   */
  getExportResult(exportId: string): ExportResult | null {
    return this.exports.get(exportId) || null;
  }

  /**
   * Initialize default collections
   */
  private initializeDefaultCollections(): void {
    this.collections.set('recent', {
      id: 'recent',
      name: 'Recent',
      description: 'Recently generated images',
      color: '#3b82f6',
      itemCount: 0,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: []
    });

    this.collections.set('favorites', {
      id: 'favorites',
      name: 'Favorites',
      description: 'Your favorite images',
      color: '#ef4444',
      itemCount: 0,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: []
    });

    this.collections.set('top-rated', {
      id: 'top-rated',
      name: 'Top Rated',
      description: 'Highest rated images',
      color: '#f59e0b',
      itemCount: 0,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: []
    });
  }

  /**
   * Update collection item counts
   */
  private updateCollectionCounts(collectionIds: string[], delta = 1): void {
    for (const collectionId of collectionIds) {
      const collection = this.collections.get(collectionId);
      if (collection) {
        collection.itemCount = Math.max(0, collection.itemCount + delta);
        collection.modified = new Date();
      }
    }
  }

  /**
   * Extract tags from prompt content
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];
    
    // Extract style-related keywords
    const styleKeywords = [
      'photorealistic', 'artistic', 'abstract', 'minimalist',
      'vintage', 'modern', 'cyberpunk', 'fantasy', 'sci-fi'
    ];
    
    const contentLower = content.toLowerCase();
    styleKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        tags.push(keyword);
      }
    });

    // Extract subject matter
    if (contentLower.includes('person') || contentLower.includes('human')) {
      tags.push('portrait');
    }
    if (contentLower.includes('landscape') || contentLower.includes('scenery')) {
      tags.push('landscape');
    }
    if (contentLower.includes('animal')) {
      tags.push('animal');
    }
    if (contentLower.includes('building') || contentLower.includes('architecture')) {
      tags.push('architecture');
    }

    return tags;
  }

  /**
   * Estimate generation cost
   */
  private estimateCost(platform: Platform, image: PreviewImage): number {
    // Simplified cost estimation
    const baseCosts: Record<Platform, number> = {
      'openai-dalle': 0.02,
      'midjourney': 0.01,
      'stable-diffusion': 0.005,
      'openai-gpt': 0,
      'claude': 0,
      'custom': 0
    };

    let cost = baseCosts[platform] || 0;
    
    // Adjust for resolution
    if (image.width * image.height > 1024 * 1024) {
      cost *= 2; // HD pricing
    }

    return cost;
  }

  /**
   * Clean old items when approaching storage limit
   */
  private async cleanOldItems(): Promise<void> {
    const items = Array.from(this.items.values());
    
    // Sort by creation date (oldest first)
    items.sort((a, b) => a.metadata.created.getTime() - b.metadata.created.getTime());
    
    // Remove oldest 10% of items
    const toRemove = Math.floor(items.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.deleteItem(items[i].id);
    }
  }

  /**
   * Process export (mock implementation)
   */
  private async processExport(
    exportId: string,
    itemIds: string[],
    options: ExportOptions
  ): Promise<void> {
    const exportResult = this.exports.get(exportId);
    if (!exportResult) return;

    exportResult.status = 'processing';

    try {
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      exportResult.status = 'completed';
      exportResult.url = `https://example.com/exports/${exportId}.${options.format}`;
      exportResult.size = itemIds.length * 1024 * 1024; // 1MB per item
      exportResult.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    } catch (error) {
      exportResult.status = 'failed';
      exportResult.error = error instanceof Error ? error.message : 'Export failed';
    }
  }

  /**
   * Get graph by ID (mock implementation)
   */
  private async getGraphById(graphId: string): Promise<PromptGraph> {
    // In real implementation, this would fetch from storage
    return this.createEmptyGraph();
  }

  /**
   * Create empty graph
   */
  private createEmptyGraph(): PromptGraph {
    return {
      id: 'empty',
      nodes: [],
      edges: [],
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: '1.0.0'
      },
      version: '1.0.0'
    };
  }

  /**
   * Generate unique item ID
   */
  private generateItemId(): string {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique collection ID
   */
  private generateCollectionId(): string {
    return `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique export ID
   */
  private generateExportId(): string {
    return `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global result gallery system instance
 */
export const resultGallerySystem = new ResultGallerySystem();