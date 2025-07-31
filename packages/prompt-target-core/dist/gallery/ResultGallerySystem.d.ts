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
  rating?: number;
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
  topTags: Array<{
    tag: string;
    count: number;
  }>;
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
  maxSize?: number;
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
export declare class ResultGallerySystem {
  private items;
  private collections;
  private exports;
  private readonly maxItems;
  private readonly maxCollections;
  constructor();
  /**
   * Add a result to the gallery
   */
  addResult(result: PreviewResult, title?: string): Promise<string>;
  /**
   * Get gallery item by ID
   */
  getItem(itemId: string): GalleryItem | null;
  /**
   * Update gallery item
   */
  updateItem(itemId: string, updates: Partial<GalleryItem>): boolean;
  /**
   * Delete gallery item
   */
  deleteItem(itemId: string): boolean;
  /**
   * Search and filter gallery items
   */
  searchItems(filter?: GalleryFilter): GalleryItem[];
  /**
   * Create a new collection
   */
  createCollection(name: string, description?: string, color?: string, isPublic?: boolean): string;
  /**
   * Get collection by ID
   */
  getCollection(collectionId: string): GalleryCollection | null;
  /**
   * Get all collections
   */
  getCollections(): GalleryCollection[];
  /**
   * Update collection
   */
  updateCollection(collectionId: string, updates: Partial<GalleryCollection>): boolean;
  /**
   * Delete collection
   */
  deleteCollection(collectionId: string): boolean;
  /**
   * Add items to collection
   */
  addToCollection(itemIds: string[], collectionId: string): number;
  /**
   * Remove items from collection
   */
  removeFromCollection(itemIds: string[], collectionId: string): number;
  /**
   * Get gallery statistics
   */
  getStats(): GalleryStats;
  /**
   * Export gallery data
   */
  exportGallery(itemIds: string[], options: ExportOptions): Promise<string>;
  /**
   * Get export result
   */
  getExportResult(exportId: string): ExportResult | null;
  /**
   * Initialize default collections
   */
  private initializeDefaultCollections;
  /**
   * Update collection item counts
   */
  private updateCollectionCounts;
  /**
   * Extract tags from prompt content
   */
  private extractTags;
  /**
   * Estimate generation cost
   */
  private estimateCost;
  /**
   * Clean old items when approaching storage limit
   */
  private cleanOldItems;
  /**
   * Process export (mock implementation)
   */
  private processExport;
  /**
   * Get graph by ID (mock implementation)
   */
  private getGraphById;
  /**
   * Create empty graph
   */
  private createEmptyGraph;
  /**
   * Generate unique item ID
   */
  private generateItemId;
  /**
   * Generate unique collection ID
   */
  private generateCollectionId;
  /**
   * Generate unique export ID
   */
  private generateExportId;
}
/**
 * Global result gallery system instance
 */
export declare const resultGallerySystem: ResultGallerySystem;
