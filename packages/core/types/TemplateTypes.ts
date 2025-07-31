// packages/core/types/TemplateTypes.ts
// Epic 8.7 Task 6: Template Library - Type Definitions
import { Node, Edge } from 'reactflow';
/**
 * Template data structure as defined in story requirements
 */

}
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  rating: number;
  reviews: Review;
  graph: GraphData; // Complete graph with annotations,
  metadata: TemplateMetadata;
  /**
  * Complete graph data including annotations from Epic 8.7
  */
}
}
}
export interface GraphData {
  nodes: Node;
  edges: Edge;
  annotations: GraphAnnotations;
  /**
  * Epic 8.7 annotation system as defined in story architecture
  */
}
}
}
export interface GraphAnnotations {
  stickyNotes: StickyNote;
  nodeLabels: Record<string, string>;
  regionGroups: RegionGroup;
  connectionLabels: Record<string, string>;
  metadata: {
  author: string;
  created: string;
  modified: string;
  version: string;
}
};
}
}
export interface StickyNote {
  id: string;
}
  position: { x: number; y: number };
  content: string;
  color: string;
  size: { width: number; height: number };
  author: string;
  timestamp: string;
}
}
export interface RegionGroup {
  id: string;
  label: string;
  color: string;
}
  bounds: { x: number; y: number; width: number; height: number };
  nodeIds: string;
  collapsed: boolean;

/**
 * Review system for templates
 */
}
}
export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5 stars,
  comment: string;
  timestamp: string;
  helpful: number; // helpful votes,
  /**
  * Template metadata
  */
}
}
}
export interface TemplateMetadata {
  created: string;
  lastModified: string;
  usageCount: number;
  tags: string;
  complexity: 'simple' | 'medium' | 'complex';
  nodeCount: number;
  estimatedOutputLength: number;
  isPublic: boolean;
  parentTemplateId?: string; // for version tracking,
  language: string;
  /**
  * Template category system
  */
}
}
export type TemplateCategory = 
  | 'character'
  | 'setting' 
  | 'mood'
  | 'action'
  | 'dialogue'
  | 'world-building'
  | 'narrative'
  | 'technical'
  | 'vfx'
  | 'general';
/**
 * Template sharing and permissions
 */

}
export interface TemplateSharing {
  isPublic: boolean;
  sharedWith: string; // user IDs,
  permissions: 'view' | 'edit' | 'admin';
  shareUrl?: string;
  team?: string; // team ID,
  /**
  * Template search and filtering
  */
}
}
}
export interface TemplateFilter {
  category?: TemplateCategory;
  author?: string;
  tags?: string;
  minRating?: number;
  complexity?: TemplateMetadata['complexity'];
  searchTerm?: string;
  sortBy?: 'name' | 'created' | 'rating' | 'usage' | 'modified';
  sortOrder?: 'asc' | 'desc';
  /**
  * Template instantiation options
  */
}
}
}
export interface TemplateInstantiationOptions {
  preservePositions: boolean;
  mergeWithCurrent: boolean;
  offsetX?: number;
  offsetY?: number;
  customizationValues?: Record<string, any>;
  /**
  * Template validation result
  */
}
}
}
export interface TemplateValidation {
  isValid: boolean;
  errors: string;
  warnings: string;
  compatibility: {
  version: string;
  features: string;
  missingFeatures: string;
}
};

/**
 * Template library state
 */
}
}
export interface TemplateLibraryState {
  templates: Template;
  categories: TemplateCategory;
  isLoading: boolean;
  error: string | null;
  filter: TemplateFilter;
  selectedTemplate: Template | null;
  /**
  * Template operations
  */
}
}
}
export interface TemplateOperations {
  // CRUD operations
  saveTemplate: (template: Omit<Template, 'id'>) => Promise<Template>;
  loadTemplate: (id: string) => Promise<Template>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  // Search and browse
  searchTemplates: (filter: TemplateFilter) => Promise<Template>;
  getTemplatesByCategory: (category: TemplateCategory) => Promise<Template>;
  getPopularTemplates: (limit?: number) => Promise<Template>;
  getRecentTemplates: (limit?: number) => Promise<Template>;
  // Instantiation
  instantiateTemplate: (),
  templateId: string,
  options: TemplateInstantiationOptions) => Promise<GraphData>;
  // Sharing
  shareTemplate: (templateId: string, sharing: TemplateSharing) => Promise<string>;
  importSharedTemplate: (shareUrl: string) => Promise<Template>;
  // Reviews
  addReview: (templateId: string, review: Omit<Review, 'id' | 'timestamp'>) => Promise<Review>;
  getReviews: (templateId: string) => Promise<Review>;
  // Validation
  validateTemplate: (template: Template) => Promise<TemplateValidation>;
  /**
  * Template save dialog data
  */
}
}
}
export interface TemplateSaveData {
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string;
  isPublic: boolean;
  includeAnnotations: boolean;
  /**
  * Template browser UI state
  */
}
}
}
export interface TemplateBrowserState {
  isOpen: boolean;
  viewMode: 'grid' | 'list';
  selectedCategory: TemplateCategory | 'all';
  searchQuery: string;
  sortBy: TemplateFilter['sortBy'];
  showOnlyMyTemplates: boolean;
  previewTemplate: Template | null;
  /**
  * Template event types for component communication
  */
}
}
export type TemplateEvent = 
  | { type: 'template-saved'; template: Template }
  | { type: 'template-applied'; templateId: string; options: TemplateInstantiationOptions }
  | { type: 'template-shared'; templateId: string; shareUrl: string }
  | { type: 'review-added'; templateId: string; review: Review };
/**
 * Template compatibility with existing graph system
 */

}
export interface TemplateCompatibility {
  supportsNodeTypes: string;
  requiredFeatures: string;
  minEditorVersion: string;
  annotations: {
  stickyNotes: boolean;
  nodeLabels: boolean;
  regionGroups: boolean;
  connectionLabels: boolean;
}
};
}