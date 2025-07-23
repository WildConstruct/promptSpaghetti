// packages/core/services/TemplateService.ts
// Epic 8.7 Task 6: Template Library - Service Layer

// Browser-compatible UUID generation
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
import { Node, Edge } from 'reactflow';
import {
  Template,
  TemplateFilter,
  TemplateCategory,
  TemplateInstantiationOptions,
  TemplateSharing,
  Review,
  GraphData,
  TemplateValidation,
  TemplateSaveData
} from '../types/TemplateTypes';

/**
 * Template storage interface - can be implemented for local/server storage
 */
export interface TemplateStorage {
  save(template: Template): Promise<Template>;
  load(id: string): Promise<Template | null>;
  loadAll(): Promise<Template[]>;
  update(id: string, updates: Partial<Template>): Promise<Template>;
  delete(id: string): Promise<void>;
  search(filter: TemplateFilter): Promise<Template[]>;
}

/**
 * Local storage implementation
 */
export class LocalTemplateStorage implements TemplateStorage {
  private readonly storageKey = 'wild-construct-templates';

  private getStoredTemplates(): Template[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load templates from localStorage:', error);
      return [];
    }
  }

  private saveStoredTemplates(templates: Template[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save templates to localStorage:', error);
      throw new Error('Template storage failed: disk full or quota exceeded');
    }
  }

  async save(template: Template): Promise<Template> {
    const templates = this.getStoredTemplates();
    
    // Check for duplicate names
    const existing = templates.find(t => t.name === template.name && t.id !== template.id);
    if (existing) {
      throw new Error(`Template with name "${template.name}" already exists`);
    }

    templates.push(template);
    this.saveStoredTemplates(templates);
    
    return template;
  }

  async load(id: string): Promise<Template | null> {
    const templates = this.getStoredTemplates();
    return templates.find(t => t.id === id) || null;
  }

  async loadAll(): Promise<Template[]> {
    return this.getStoredTemplates();
  }

  async update(id: string, updates: Partial<Template>): Promise<Template> {
    const templates = this.getStoredTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Template with id "${id}" not found`);
    }

    const updated = { ...templates[index], ...updates };
    templates[index] = updated;
    this.saveStoredTemplates(templates);
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    const templates = this.getStoredTemplates();
    const filtered = templates.filter(t => t.id !== id);
    
    if (filtered.length === templates.length) {
      throw new Error(`Template with id "${id}" not found`);
    }
    
    this.saveStoredTemplates(filtered);
  }

  async search(filter: TemplateFilter): Promise<Template[]> {
    const templates = this.getStoredTemplates();
    
    let filtered = templates;

    // Apply filters
    if (filter.category) {
      filtered = filtered.filter(t => t.category === filter.category);
    }
    
    if (filter.author) {
      filtered = filtered.filter(t => 
        t.author.toLowerCase().includes(filter.author!.toLowerCase())
      );
    }
    
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(t => 
        filter.tags!.some(tag => t.metadata.tags.includes(tag))
      );
    }
    
    if (filter.minRating) {
      filtered = filtered.filter(t => t.rating >= filter.minRating!);
    }
    
    if (filter.complexity) {
      filtered = filtered.filter(t => t.metadata.complexity === filter.complexity);
    }
    
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.metadata.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    const sortBy = filter.sortBy || 'modified';
    const sortOrder = filter.sortOrder || 'desc';
    
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created':
        aValue = new Date(a.metadata.created).getTime();
        bValue = new Date(b.metadata.created).getTime();
        break;
      case 'modified':
        aValue = new Date(a.metadata.lastModified).getTime();
        bValue = new Date(b.metadata.lastModified).getTime();
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'usage':
        aValue = a.metadata.usageCount;
        bValue = b.metadata.usageCount;
        break;
      default:
        return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }
}

/**
 * Main Template Service
 */
export class TemplateService {
  private storage: TemplateStorage;

  constructor(storage?: TemplateStorage) {
    this.storage = storage || new LocalTemplateStorage();
  }

  /**
   * Create template from current graph data
   */
  async createFromGraph(
    nodes: Node[],
    edges: Edge[],
    saveData: TemplateSaveData,
    author: string
  ): Promise<Template> {
    // Extract annotations from nodes and edges
    const annotations = this.extractAnnotations(nodes, edges);
    
    // Create graph data with annotations
    const graphData: GraphData = {
      nodes: nodes.map(node => ({
        ...node,
        // Clean position data for template storage
        position: { ...node.position }
      })),
      edges: edges.map(edge => ({ ...edge })),
      annotations
    };

    // Calculate template metadata
    const metadata = {
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      usageCount: 0,
      tags: saveData.tags,
      complexity: this.calculateComplexity(nodes, edges),
      nodeCount: nodes.length,
      estimatedOutputLength: this.estimateOutputLength(nodes),
      isPublic: saveData.isPublic,
      language: 'en'
    };

    const template: Template = {
      id: uuidv4(),
      name: saveData.name,
      description: saveData.description,
      category: saveData.category,
      version: '1.0.0',
      author,
      rating: 0, // Initial rating
      reviews: [],
      graph: graphData,
      metadata
    };

    // Validate template before saving
    const validation = await this.validateTemplate(template);
    if (!validation.isValid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    return await this.storage.save(template);
  }

  /**
   * Load template by ID
   */
  async loadTemplate(id: string): Promise<Template | null> {
    return await this.storage.load(id);
  }

  /**
   * Search templates with filters
   */
  async searchTemplates(filter: TemplateFilter = {}): Promise<Template[]> {
    return await this.storage.search(filter);
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: TemplateCategory): Promise<Template[]> {
    return await this.searchTemplates({ category });
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit: number = 10): Promise<Template[]> {
    const templates = await this.searchTemplates({
      sortBy: 'rating',
      sortOrder: 'desc'
    });
    
    return templates.slice(0, limit);
  }

  /**
   * Get recent templates
   */
  async getRecentTemplates(limit: number = 10): Promise<Template[]> {
    const templates = await this.searchTemplates({
      sortBy: 'created',
      sortOrder: 'desc'
    });
    
    return templates.slice(0, limit);
  }

  /**
   * Instantiate template into current graph
   */
  async instantiateTemplate(
    templateId: string,
    options: TemplateInstantiationOptions
  ): Promise<GraphData> {
    const template = await this.storage.load(templateId);
    if (!template) {
      throw new Error(`Template with id "${templateId}" not found`);
    }

    // Increment usage count
    await this.storage.update(templateId, {
      metadata: {
        ...template.metadata,
        usageCount: template.metadata.usageCount + 1,
        lastModified: new Date().toISOString()
      }
    });

    // Clone template graph data
    const graphData: GraphData = JSON.parse(JSON.stringify(template.graph));

    // Apply instantiation options
    if (!options.preservePositions || options.offsetX || options.offsetY) {
      const offsetX = options.offsetX || 0;
      const offsetY = options.offsetY || 0;
      
      // Apply position offset to nodes
      graphData.nodes = graphData.nodes.map(node => ({
        ...node,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY
        }
      }));

      // Update sticky note positions
      graphData.annotations.stickyNotes = graphData.annotations.stickyNotes.map(note => ({
        ...note,
        position: {
          x: note.position.x + offsetX,
          y: note.position.y + offsetY
        }
      }));

      // Update region group bounds
      graphData.annotations.regionGroups = graphData.annotations.regionGroups.map(region => ({
        ...region,
        bounds: {
          ...region.bounds,
          x: region.bounds.x + offsetX,
          y: region.bounds.y + offsetY
        }
      }));
    }

    // Apply customization values
    if (options.customizationValues) {
      graphData.nodes = graphData.nodes.map(node => {
        if (node.data && options.customizationValues) {
          const customizations = options.customizationValues[node.id] || {};
          return {
            ...node,
            data: { ...node.data, ...customizations }
          };
        }
        return node;
      });
    }

    // Generate new IDs to avoid conflicts
    if (!options.mergeWithCurrent) {
      const idMap = new Map<string, string>();
      
      // Generate new node IDs
      graphData.nodes = graphData.nodes.map(node => {
        const newId = `${node.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        idMap.set(node.id, newId);
        return { ...node, id: newId };
      });

      // Update edge references
      graphData.edges = graphData.edges.map(edge => ({
        ...edge,
        id: `${edge.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target
      }));

      // Update annotation references
      graphData.annotations.nodeLabels = Object.fromEntries(
        Object.entries(graphData.annotations.nodeLabels).map(([nodeId, label]) => [
          idMap.get(nodeId) || nodeId,
          label
        ])
      );

      graphData.annotations.regionGroups = graphData.annotations.regionGroups.map(region => ({
        ...region,
        nodeIds: region.nodeIds.map(nodeId => idMap.get(nodeId) || nodeId)
      }));
    }

    return graphData;
  }

  /**
   * Add review to template
   */
  async addReview(templateId: string, review: Omit<Review, 'id' | 'timestamp'>): Promise<Review> {
    const template = await this.storage.load(templateId);
    if (!template) {
      throw new Error(`Template with id "${templateId}" not found`);
    }

    const newReview: Review = {
      ...review,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      helpful: 0
    };

    const updatedReviews = [...template.reviews, newReview];
    const newRating = this.calculateAverageRating(updatedReviews);

    await this.storage.update(templateId, {
      reviews: updatedReviews,
      rating: newRating
    });

    return newReview;
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  /**
   * Validate template structure
   */
  async validateTemplate(template: Template): Promise<TemplateValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.description || template.description.trim().length === 0) {
      warnings.push('Template description is recommended');
    }

    if (!template.graph.nodes || template.graph.nodes.length === 0) {
      errors.push('Template must contain at least one node');
    }

    // Node validation
    const nodeIds = new Set<string>();
    template.graph.nodes.forEach((node, index) => {
      if (!node.id) {
        errors.push(`Node at index ${index} missing ID`);
      } else if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      } else {
        nodeIds.add(node.id);
      }

      if (!node.type) {
        errors.push(`Node ${node.id} missing type`);
      }
    });

    // Edge validation
    template.graph.edges.forEach((edge, index) => {
      if (!edge.source || !nodeIds.has(edge.source)) {
        errors.push(`Edge at index ${index} has invalid source: ${edge.source}`);
      }
      
      if (!edge.target || !nodeIds.has(edge.target)) {
        errors.push(`Edge at index ${index} has invalid target: ${edge.target}`);
      }
    });

    // Check for at least one output node
    const hasOutput = template.graph.nodes.some(node => node.type === 'Output');
    if (!hasOutput) {
      warnings.push('Template should have at least one Output node');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      compatibility: {
        version: '1.0.0',
        features: ['basic-nodes', 'annotations'],
        missingFeatures: []
      }
    };
  }

  // Helper methods

  private extractAnnotations(nodes: Node[], edges: Edge[]) {
    return {
      stickyNotes: [], // Will be populated from actual annotation system
      nodeLabels: Object.fromEntries(
        nodes.map(node => [node.id, node.data?.label || node.id])
      ),
      regionGroups: [], // Will be populated from actual annotation system
      connectionLabels: Object.fromEntries(
        edges.filter(edge => edge.label).map(edge => [edge.id, edge.label!])
      ),
      metadata: {
        author: 'system',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private calculateComplexity(nodes: Node[], edges: Edge[]): 'simple' | 'medium' | 'complex' {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const totalElements = nodeCount + edgeCount;

    if (totalElements <= 5) return 'simple';
    if (totalElements <= 15) return 'medium';
    return 'complex';
  }

  private estimateOutputLength(nodes: Node[]): number {
    // Rough estimation based on node types and content
    let estimate = 0;
    
    nodes.forEach(node => {
      switch (node.type) {
      case 'WeightedChoice':
        estimate += (node.data?.choices?.length || 1) * 10;
        break;
      case 'Concat':
        estimate += 20;
        break;
      case 'Output':
        estimate += 50;
        break;
      default:
        estimate += 15;
      }
    });

    return Math.max(estimate, 50); // Minimum estimate
  }

  private calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
  }
}

// Export singleton instance
export const templateService = new TemplateService();