import { Platform } from '../types/index.js';
/**
 * Metadata schema definition
 */
export interface MetadataSchema {
  version: string;
  fields: MetadataField[];
  validation?: MetadataValidation;
}
/**
 * Metadata field definition
 */
export interface MetadataField {
  key: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'enum';
  required?: boolean;
  default?: any;
  description?: string;
  options?: string[];
  min?: number;
  max?: number;
  pattern?: string;
  searchable?: boolean;
  indexed?: boolean;
  category?: string;
}
/**
 * Metadata validation rules
 */
export interface MetadataValidation {
  rules: ValidationRule[];
  customValidators?: Record<string, (value: any, metadata: GenerationMetadata) => boolean>;
}
/**
 * Validation rule
 */
export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
/**
 * Generation metadata
 */
export interface GenerationMetadata {
  id: string;
  platform: Platform;
  model?: string;
  version?: string;
  created: Date;
  modified: Date;
  prompt: string;
  parameters: Record<string, any>;
  seed?: number;
  quality?: number;
  confidence?: number;
  generationTime: number;
  cost?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  format?: string;
  size?: number;
  colorProfile?: string;
  dominantColors?: string[];
  views: number;
  downloads: number;
  shares: number;
  rating?: number;
  tags: string[];
  categories: string[];
  style?: string;
  mood?: string;
  adaptorVersion: string;
  transformations: string[];
  warnings: string[];
  title?: string;
  description?: string;
  notes?: string;
  isFavorite: boolean;
  isPublic: boolean;
  [key: string]: any;
}
/**
 * Metadata extraction result
 */
export interface ExtractionResult {
  metadata: Partial<GenerationMetadata>;
  confidence: number;
  errors: string[];
  warnings: string[];
}
/**
 * Metadata search options
 */
export interface MetadataSearchOptions {
  query?: string;
  fields?: string[];
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  fuzzy?: boolean;
}
/**
 * Metadata search result
 */
export interface MetadataSearchResult {
  items: GenerationMetadata[];
  total: number;
  aggregations?: Record<string, any>;
  suggestions?: string[];
}
/**
 * Metadata analytics data
 */
export interface MetadataAnalytics {
  totalItems: number;
  fieldDistribution: Record<
    string,
    {
      count: number;
      percentage: number;
    }
  >;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
  averageQuality: number;
  platformUsage: Record<Platform, number>;
  trendingStyles: Array<{
    style: string;
    growth: number;
  }>;
  qualityTrends: Array<{
    date: Date;
    averageQuality: number;
  }>;
  generationVolume: Array<{
    date: Date;
    count: number;
  }>;
}
/**
 * Comprehensive metadata management system
 */
export declare class MetadataManager {
  private metadata;
  private schemas;
  private indices;
  constructor();
  /**
   * Register metadata schema for a platform
   */
  registerSchema(platform: Platform, schema: MetadataSchema): void;
  /**
   * Get metadata schema for platform
   */
  getSchema(platform: Platform): MetadataSchema | null;
  /**
   * Store metadata
   */
  storeMetadata(metadata: GenerationMetadata): void;
  /**
   * Get metadata by ID
   */
  getMetadata(id: string): GenerationMetadata | null;
  /**
   * Update metadata
   */
  updateMetadata(id: string, updates: Partial<GenerationMetadata>): boolean;
  /**
   * Delete metadata
   */
  deleteMetadata(id: string): boolean;
  /**
   * Extract metadata from generation result
   */
  extractMetadata(result: any, platform: Platform, baseMetadata?: Partial<GenerationMetadata>): ExtractionResult;
  /**
   * Search metadata
   */
  searchMetadata(options: MetadataSearchOptions): MetadataSearchResult;
  /**
   * Get metadata analytics
   */
  getAnalytics(): MetadataAnalytics;
  /**
   * Bulk update metadata
   */
  bulkUpdateMetadata(
    updates: Array<{
      id: string;
      updates: Partial<GenerationMetadata>;
    }>
  ): {
    successful: string[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  };
  /**
   * Export metadata
   */
  exportMetadata(format: 'json' | 'csv' | 'xml', filter?: MetadataSearchOptions): string;
  /**
   * Initialize default schemas
   */
  private initializeDefaultSchemas;
  /**
   * Validate metadata against schema
   */
  private validateMetadata;
  /**
   * Auto-generate tags from prompt
   */
  private autoGenerateTags;
  /**
   * Auto-generate categories
   */
  private autoGenerateCategories;
  /**
   * Get nested object value by path
   */
  private getNestedValue;
  /**
   * Update search indices
   */
  private updateIndices;
  /**
   * Remove from search indices
   */
  private removeFromIndices;
  /**
   * Rebuild indices for platform
   */
  private rebuildIndices;
  /**
   * Build search aggregations
   */
  private buildAggregations;
  /**
   * Generate search suggestions
   */
  private generateSearchSuggestions;
  /**
   * Convert to CSV format
   */
  private convertToCSV;
  /**
   * Convert to XML format
   */
  private convertToXML;
  /**
   * Escape XML special characters
   */
  private escapeXML;
  /**
   * Generate unique ID
   */
  private generateId;
}
/**
 * Global metadata manager instance
 */
export declare const metadataManager: MetadataManager;
