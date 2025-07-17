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
  options?: string[]; // For enum types
  min?: number; // For number types
  max?: number; // For number types
  pattern?: string; // For string types
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
  // Core fields
  id: string;
  platform: Platform;
  model?: string;
  version?: string;
  created: Date;
  modified: Date;

  // Generation parameters
  prompt: string;
  parameters: Record<string, any>;
  seed?: number;
  
  // Quality metrics
  quality?: number;
  confidence?: number;
  
  // Performance data
  generationTime: number; // milliseconds
  cost?: number;
  
  // Content analysis
  dimensions?: { width: number; height: number };
  format?: string;
  size?: number; // bytes
  colorProfile?: string;
  dominantColors?: string[];
  
  // Usage tracking
  views: number;
  downloads: number;
  shares: number;
  rating?: number;
  
  // Classification
  tags: string[];
  categories: string[];
  style?: string;
  mood?: string;
  
  // Technical details
  adaptorVersion: string;
  transformations: string[];
  warnings: string[];
  
  // User data
  title?: string;
  description?: string;
  notes?: string;
  isFavorite: boolean;
  isPublic: boolean;
  
  // Custom fields
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
  fieldDistribution: Record<string, { count: number; percentage: number }>;
  popularTags: Array<{ tag: string; count: number }>;
  averageQuality: number;
  platformUsage: Record<Platform, number>;
  trendingStyles: Array<{ style: string; growth: number }>;
  qualityTrends: Array<{ date: Date; averageQuality: number }>;
  generationVolume: Array<{ date: Date; count: number }>;
}

/**
 * Comprehensive metadata management system
 */
export class MetadataManager {
  private metadata: Map<string, GenerationMetadata> = new Map();
  private schemas: Map<Platform, MetadataSchema> = new Map();
  private indices: Map<string, Map<any, Set<string>>> = new Map();
  
  constructor() {
    this.initializeDefaultSchemas();
  }

  /**
   * Register metadata schema for a platform
   */
  registerSchema(platform: Platform, schema: MetadataSchema): void {
    this.schemas.set(platform, schema);
    this.rebuildIndices(platform);
  }

  /**
   * Get metadata schema for platform
   */
  getSchema(platform: Platform): MetadataSchema | null {
    return this.schemas.get(platform) || null;
  }

  /**
   * Store metadata
   */
  storeMetadata(metadata: GenerationMetadata): void {
    const schema = this.schemas.get(metadata.platform);
    if (schema) {
      const validated = this.validateMetadata(metadata, schema);
      if (validated.errors.length > 0) {
        throw new Error(`Metadata validation failed: ${validated.errors.join(', ')}`);
      }
    }

    this.metadata.set(metadata.id, metadata);
    this.updateIndices(metadata);
  }

  /**
   * Get metadata by ID
   */
  getMetadata(id: string): GenerationMetadata | null {
    const metadata = this.metadata.get(id);
    if (metadata) {
      metadata.views++;
      metadata.modified = new Date();
    }
    return metadata || null;
  }

  /**
   * Update metadata
   */
  updateMetadata(id: string, updates: Partial<GenerationMetadata>): boolean {
    const existing = this.metadata.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates, modified: new Date() };
    
    const schema = this.schemas.get(updated.platform);
    if (schema) {
      const validated = this.validateMetadata(updated, schema);
      if (validated.errors.length > 0) {
        throw new Error(`Metadata validation failed: ${validated.errors.join(', ')}`);
      }
    }

    this.metadata.set(id, updated);
    this.updateIndices(updated);
    
    return true;
  }

  /**
   * Delete metadata
   */
  deleteMetadata(id: string): boolean {
    const metadata = this.metadata.get(id);
    if (!metadata) return false;

    this.removeFromIndices(metadata);
    this.metadata.delete(id);
    
    return true;
  }

  /**
   * Extract metadata from generation result
   */
  extractMetadata(
    result: any,
    platform: Platform,
    baseMetadata?: Partial<GenerationMetadata>
  ): ExtractionResult {
    const extraction: ExtractionResult = {
      metadata: { ...baseMetadata },
      confidence: 0.8,
      errors: [],
      warnings: []
    };

    try {
      // Extract core metadata
      extraction.metadata.id = result.id || this.generateId();
      extraction.metadata.platform = platform;
      extraction.metadata.created = new Date();
      extraction.metadata.modified = new Date();

      // Extract image-specific metadata
      if (result.images && result.images.length > 0) {
        const image = result.images[0];
        extraction.metadata.dimensions = {
          width: image.width,
          height: image.height
        };
        extraction.metadata.format = image.format;
        extraction.metadata.size = image.size;
        extraction.metadata.generationTime = image.generationTime;
      }

      // Extract prompt and parameters
      if (result.prompt) {
        extraction.metadata.prompt = result.prompt.content;
        extraction.metadata.parameters = result.prompt.parameters;
        extraction.metadata.adaptorVersion = result.prompt.metadata.adaptorVersion;
        extraction.metadata.transformations = result.prompt.metadata.transformations?.map(
          (t: any) => t.action
        ) || [];
        extraction.metadata.warnings = result.prompt.metadata.warnings?.map(
          (w: any) => w.message
        ) || [];
      }

      // Extract quality metrics
      if (result.metadata?.quality) {
        extraction.metadata.quality = result.metadata.quality.overall || result.metadata.quality;
      }

      // Auto-generate tags and categories
      extraction.metadata.tags = this.autoGenerateTags(extraction.metadata.prompt || '');
      extraction.metadata.categories = this.autoGenerateCategories(extraction.metadata);

      // Initialize counters
      extraction.metadata.views = 0;
      extraction.metadata.downloads = 0;
      extraction.metadata.shares = 0;
      extraction.metadata.isFavorite = false;
      extraction.metadata.isPublic = false;

    } catch (error) {
      extraction.errors.push(`Extraction failed: ${error}`);
      extraction.confidence = 0.3;
    }

    return extraction;
  }

  /**
   * Search metadata
   */
  searchMetadata(options: MetadataSearchOptions): MetadataSearchResult {
    let items = Array.from(this.metadata.values());

    // Apply filters
    if (options.filters) {
      items = items.filter(item => {
        return Object.entries(options.filters!).every(([key, value]) => {
          const itemValue = this.getNestedValue(item, key);
          
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          if (typeof value === 'object' && value !== null) {
            if ('min' in value && itemValue < value.min) return false;
            if ('max' in value && itemValue > value.max) return false;
            if ('equals' in value && itemValue !== value.equals) return false;
            if ('contains' in value && !String(itemValue).includes(value.contains)) return false;
          }
          
          return itemValue === value;
        });
      });
    }

    // Apply text search
    if (options.query) {
      const query = options.query.toLowerCase();
      const searchFields = options.fields || ['title', 'description', 'prompt', 'tags'];
      
      items = items.filter(item => {
        return searchFields.some(field => {
          const value = this.getNestedValue(item, field);
          if (Array.isArray(value)) {
            return value.some(v => String(v).toLowerCase().includes(query));
          }
          return String(value || '').toLowerCase().includes(query);
        });
      });
    }

    // Sort results
    if (options.sortBy) {
      items.sort((a, b) => {
        const aVal = this.getNestedValue(a, options.sortBy!);
        const bVal = this.getNestedValue(b, options.sortBy!);
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    const total = items.length;

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      items = items.slice(start, end);
    }

    return {
      items,
      total,
      aggregations: this.buildAggregations(items),
      suggestions: this.generateSearchSuggestions(options.query)
    };
  }

  /**
   * Get metadata analytics
   */
  getAnalytics(): MetadataAnalytics {
    const items = Array.from(this.metadata.values());
    
    // Field distribution
    const fieldDistribution: Record<string, { count: number; percentage: number }> = {};
    const totalItems = items.length;
    
    // Popular tags
    const tagCounts: Record<string, number> = {};
    items.forEach(item => {
      item.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    // Platform usage
    const platformUsage: Record<Platform, number> = {} as Record<Platform, number>;
    items.forEach(item => {
      platformUsage[item.platform] = (platformUsage[item.platform] || 0) + 1;
    });

    // Average quality
    const qualityItems = items.filter(item => item.quality !== undefined);
    const averageQuality = qualityItems.length > 0
      ? qualityItems.reduce((sum, item) => sum + (item.quality || 0), 0) / qualityItems.length
      : 0;

    // Generate time-based trends (simplified)
    const now = new Date();
    const qualityTrends = [];
    const generationVolume = [];
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayItems = items.filter(item => 
        item.created.toDateString() === date.toDateString()
      );
      
      const dayQualityItems = dayItems.filter(item => item.quality !== undefined);
      const dayAverageQuality = dayQualityItems.length > 0
        ? dayQualityItems.reduce((sum, item) => sum + (item.quality || 0), 0) / dayQualityItems.length
        : 0;
      
      qualityTrends.push({ date, averageQuality: dayAverageQuality });
      generationVolume.push({ date, count: dayItems.length });
    }

    return {
      totalItems,
      fieldDistribution,
      popularTags,
      averageQuality,
      platformUsage,
      trendingStyles: [], // Would be calculated from recent data
      qualityTrends,
      generationVolume
    };
  }

  /**
   * Bulk update metadata
   */
  bulkUpdateMetadata(updates: Array<{ id: string; updates: Partial<GenerationMetadata> }>): {
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  } {
    const result = {
      successful: [] as string[],
      failed: [] as Array<{ id: string; error: string }>
    };

    for (const { id, updates: itemUpdates } of updates) {
      try {
        if (this.updateMetadata(id, itemUpdates)) {
          result.successful.push(id);
        } else {
          result.failed.push({ id, error: 'Item not found' });
        }
      } catch (error) {
        result.failed.push({ 
          id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return result;
  }

  /**
   * Export metadata
   */
  exportMetadata(
    format: 'json' | 'csv' | 'xml',
    filter?: MetadataSearchOptions
  ): string {
    const searchResult = filter ? this.searchMetadata(filter) : {
      items: Array.from(this.metadata.values()),
      total: this.metadata.size
    };

    switch (format) {
      case 'json':
        return JSON.stringify(searchResult.items, null, 2);
        
      case 'csv':
        return this.convertToCSV(searchResult.items);
        
      case 'xml':
        return this.convertToXML(searchResult.items);
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Initialize default schemas
   */
  private initializeDefaultSchemas(): void {
    // Midjourney schema
    this.registerSchema('midjourney', {
      version: '1.0.0',
      fields: [
        { key: 'prompt', name: 'Prompt', type: 'string', required: true, searchable: true },
        { key: 'aspect_ratio', name: 'Aspect Ratio', type: 'enum', options: ['1:1', '2:3', '3:2', '16:9'] },
        { key: 'stylize', name: 'Stylize', type: 'number', min: 0, max: 1000 },
        { key: 'quality', name: 'Quality', type: 'number', min: 0.25, max: 2 },
        { key: 'chaos', name: 'Chaos', type: 'number', min: 0, max: 100 },
        { key: 'version', name: 'Version', type: 'enum', options: ['v6', 'v5.2', 'v5', 'v4'] }
      ]
    });

    // DALL-E schema
    this.registerSchema('openai-dalle', {
      version: '1.0.0',
      fields: [
        { key: 'prompt', name: 'Prompt', type: 'string', required: true, searchable: true },
        { key: 'model', name: 'Model', type: 'enum', options: ['dall-e-2', 'dall-e-3'] },
        { key: 'size', name: 'Size', type: 'enum', options: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'] },
        { key: 'quality', name: 'Quality', type: 'enum', options: ['standard', 'hd'] },
        { key: 'style', name: 'Style', type: 'enum', options: ['vivid', 'natural'] },
        { key: 'n', name: 'Number of Images', type: 'number', min: 1, max: 10 }
      ]
    });
  }

  /**
   * Validate metadata against schema
   */
  private validateMetadata(
    metadata: GenerationMetadata, 
    schema: MetadataSchema
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const field of schema.fields) {
      const value = this.getNestedValue(metadata, field.key);

      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`Required field '${field.name}' is missing`);
        continue;
      }

      if (value === undefined || value === null) continue;

      // Type validation
      if (field.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
        errors.push(`Field '${field.name}' must be a number`);
        continue;
      }

      if (field.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Field '${field.name}' must be a boolean`);
        continue;
      }

      if (field.type === 'date' && !(value instanceof Date)) {
        errors.push(`Field '${field.name}' must be a date`);
        continue;
      }

      // Range validation for numbers
      if (field.type === 'number' && typeof value === 'number') {
        if (field.min !== undefined && value < field.min) {
          warnings.push(`Field '${field.name}' is below minimum value ${field.min}`);
        }
        if (field.max !== undefined && value > field.max) {
          warnings.push(`Field '${field.name}' is above maximum value ${field.max}`);
        }
      }

      // Enum validation
      if (field.type === 'enum' && field.options && !field.options.includes(value)) {
        errors.push(`Field '${field.name}' must be one of: ${field.options.join(', ')}`);
      }

      // Pattern validation for strings
      if (field.type === 'string' && field.pattern && typeof value === 'string') {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          warnings.push(`Field '${field.name}' does not match expected pattern`);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Auto-generate tags from prompt
   */
  private autoGenerateTags(prompt: string): string[] {
    const tags: string[] = [];
    const promptLower = prompt.toLowerCase();

    // Style tags
    const styles = ['photorealistic', 'artistic', 'abstract', 'minimalist', 'vintage', 'modern'];
    styles.forEach(style => {
      if (promptLower.includes(style)) tags.push(style);
    });

    // Subject tags
    if (promptLower.includes('person') || promptLower.includes('human')) tags.push('portrait');
    if (promptLower.includes('landscape') || promptLower.includes('scenery')) tags.push('landscape');
    if (promptLower.includes('animal')) tags.push('animal');
    if (promptLower.includes('building')) tags.push('architecture');

    // Color tags
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white'];
    colors.forEach(color => {
      if (promptLower.includes(color)) tags.push(color);
    });

    return tags;
  }

  /**
   * Auto-generate categories
   */
  private autoGenerateCategories(metadata: Partial<GenerationMetadata>): string[] {
    const categories: string[] = [];
    
    if (metadata.platform === 'openai-dalle' || metadata.platform === 'midjourney') {
      categories.push('text-to-image');
    }
    
    if (metadata.quality && metadata.quality > 0.8) {
      categories.push('high-quality');
    }
    
    return categories;
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Update search indices
   */
  private updateIndices(metadata: GenerationMetadata): void {
    const schema = this.schemas.get(metadata.platform);
    if (!schema) return;

    // Update indices for indexed fields
    schema.fields.forEach(field => {
      if (field.indexed) {
        const value = this.getNestedValue(metadata, field.key);
        if (value !== undefined) {
          const fieldIndex = this.indices.get(field.key) || new Map();
          const valueSet = fieldIndex.get(value) || new Set();
          valueSet.add(metadata.id);
          fieldIndex.set(value, valueSet);
          this.indices.set(field.key, fieldIndex);
        }
      }
    });
  }

  /**
   * Remove from search indices
   */
  private removeFromIndices(metadata: GenerationMetadata): void {
    for (const [fieldKey, fieldIndex] of this.indices.entries()) {
      for (const [value, idSet] of fieldIndex.entries()) {
        idSet.delete(metadata.id);
        if (idSet.size === 0) {
          fieldIndex.delete(value);
        }
      }
    }
  }

  /**
   * Rebuild indices for platform
   */
  private rebuildIndices(platform: Platform): void {
    const schema = this.schemas.get(platform);
    if (!schema) return;

    // Clear existing indices for indexed fields
    schema.fields.forEach(field => {
      if (field.indexed) {
        this.indices.delete(field.key);
      }
    });

    // Rebuild indices
    Array.from(this.metadata.values())
      .filter(item => item.platform === platform)
      .forEach(item => this.updateIndices(item));
  }

  /**
   * Build search aggregations
   */
  private buildAggregations(items: GenerationMetadata[]): Record<string, any> {
    const aggregations: Record<string, any> = {};

    // Platform aggregation
    aggregations.platforms = {};
    items.forEach(item => {
      aggregations.platforms[item.platform] = (aggregations.platforms[item.platform] || 0) + 1;
    });

    // Tags aggregation
    aggregations.tags = {};
    items.forEach(item => {
      item.tags?.forEach(tag => {
        aggregations.tags[tag] = (aggregations.tags[tag] || 0) + 1;
      });
    });

    return aggregations;
  }

  /**
   * Generate search suggestions
   */
  private generateSearchSuggestions(query?: string): string[] {
    if (!query || query.length < 2) return [];

    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    // Get suggestions from tags
    const allTags = new Set<string>();
    this.metadata.forEach(item => {
      item.tags?.forEach(tag => allTags.add(tag));
    });

    for (const tag of allTags) {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.push(tag);
      }
    }

    return suggestions.slice(0, 10);
  }

  /**
   * Convert to CSV format
   */
  private convertToCSV(items: GenerationMetadata[]): string {
    if (items.length === 0) return '';

    const headers = Object.keys(items[0]).filter(key => 
      typeof items[0][key] !== 'object' || items[0][key] instanceof Date
    );

    const rows = [headers.join(',')];
    
    items.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value || '');
      });
      rows.push(values.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Convert to XML format
   */
  private convertToXML(items: GenerationMetadata[]): string {
    const xmlItems = items.map(item => {
      const fields = Object.entries(item)
        .filter(([, value]) => typeof value !== 'object' || value instanceof Date)
        .map(([key, value]) => {
          const xmlValue = value instanceof Date ? value.toISOString() : String(value || '');
          return `    <${key}>${this.escapeXML(xmlValue)}</${key}>`;
        })
        .join('\n');
      
      return `  <item>\n${fields}\n  </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n${xmlItems}\n</metadata>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `metadata-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global metadata manager instance
 */
export const metadataManager = new MetadataManager();