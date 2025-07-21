/**
 * In-Memory Template Database for Testing
 * 
 * Provides a realistic database simulation with CRUD operations,
 * relationships, and data persistence across test scenarios.
 */

import { faker } from '@faker-js/faker';

export interface Template {
  id: number;
  name: string;
  description: string;
  category_id: number;
  tags: string[];
  author_id: number;
  version: string;
  is_public: boolean;
  graph_data: any;
  variables: any[];
  customization_points: any[];
  usage_count: number;
  average_rating: number;
  download_count: number;
  favorite_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateUsage {
  id: number;
  template_id: number;
  user_id: number;
  project_id?: number;
  customizations_applied: any;
  used_at: Date;
  success: boolean;
}

export interface TemplateReview {
  id: number;
  template_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
}

class TemplateDatabase {
  private templates: Map<number, Template> = new Map();
  private usages: Map<number, TemplateUsage> = new Map();
  private reviews: Map<number, TemplateReview> = new Map();
  private nextTemplateId = 1;
  private nextUsageId = 1;
  private nextReviewId = 1;

  constructor() {
    // Initialize with sample data
    this.seedData();
  }

  private seedData() {
    // Create sample categories data
    const sampleTemplates = [
      {
        name: 'AI Content Generator',
        description: 'Generate AI-powered content for various use cases',
        category_id: 1,
        tags: ['ai', 'content', 'generation'],
        author_id: 1,
        graph_data: {
          nodes: [
            { id: 'input-1', type: 'input', data: { label: 'Content Topic' } },
            { id: 'ai-1', type: 'ai-process', data: { label: 'AI Generator', model: 'gpt-4' } },
            { id: 'output-1', type: 'output', data: { label: 'Generated Content' } }
          ],
          edges: [
            { id: 'e1', source: 'input-1', target: 'ai-1' },
            { id: 'e2', source: 'ai-1', target: 'output-1' }
          ]
        },
        variables: [
          {
            id: 'var-1',
            name: 'topic',
            type: 'string',
            defaultValue: '',
            description: 'The topic to generate content about',
            required: true
          }
        ]
      },
      {
        name: 'Data Processing Pipeline',
        description: 'Process and transform data through multiple stages',
        category_id: 2,
        tags: ['data', 'processing', 'etl'],
        author_id: 2,
        graph_data: {
          nodes: [
            { id: 'input-1', type: 'data-input', data: { label: 'Raw Data' } },
            { id: 'transform-1', type: 'transform', data: { label: 'Data Cleaner' } },
            { id: 'transform-2', type: 'transform', data: { label: 'Data Validator' } },
            { id: 'output-1', type: 'data-output', data: { label: 'Clean Data' } }
          ],
          edges: [
            { id: 'e1', source: 'input-1', target: 'transform-1' },
            { id: 'e2', source: 'transform-1', target: 'transform-2' },
            { id: 'e3', source: 'transform-2', target: 'output-1' }
          ]
        },
        variables: [
          {
            id: 'var-1',
            name: 'cleaningRules',
            type: 'object',
            defaultValue: {},
            description: 'Rules for data cleaning',
            required: false
          }
        ]
      },
      {
        name: 'Creative Writing Assistant',
        description: 'AI-powered creative writing and storytelling tool',
        category_id: 3,
        tags: ['creative', 'writing', 'storytelling'],
        author_id: 1,
        graph_data: {
          nodes: [
            { id: 'input-1', type: 'input', data: { label: 'Story Prompt' } },
            { id: 'creative-1', type: 'creative-ai', data: { label: 'Story Generator' } },
            { id: 'enhance-1', type: 'enhance', data: { label: 'Style Enhancer' } },
            { id: 'output-1', type: 'output', data: { label: 'Creative Story' } }
          ],
          edges: [
            { id: 'e1', source: 'input-1', target: 'creative-1' },
            { id: 'e2', source: 'creative-1', target: 'enhance-1' },
            { id: 'e3', source: 'enhance-1', target: 'output-1' }
          ]
        },
        variables: [
          {
            id: 'var-1',
            name: 'genre',
            type: 'select',
            defaultValue: 'fiction',
            description: 'Story genre',
            required: true,
            validation: {
              allowedValues: ['fiction', 'mystery', 'romance', 'sci-fi', 'fantasy']
            }
          }
        ]
      }
    ];

    sampleTemplates.forEach(template => {
      this.createTemplate(template, template.author_id);
    });

    // Add some sample reviews and usage data
    this.addReview(1, 3, { rating: 5, comment: 'Excellent template!' });
    this.addReview(1, 4, { rating: 4, comment: 'Very useful for content creation' });
    this.addReview(2, 3, { rating: 4, comment: 'Great for data processing' });

    this.recordUsage(1, 3, 101, { topic: 'Machine Learning' }, true);
    this.recordUsage(1, 4, 102, { topic: 'Web Development' }, true);
    this.recordUsage(2, 3, 103, { cleaningRules: { removeNulls: true } }, true);
  }

  // Template CRUD operations
  createTemplate(templateData: Partial<Template>, authorId: number): Template {
    const template: Template = {
      id: this.nextTemplateId++,
      name: templateData.name || '',
      description: templateData.description || '',
      category_id: templateData.category_id || 1,
      tags: templateData.tags || [],
      author_id: authorId,
      version: templateData.version || '1.0.0',
      is_public: templateData.is_public !== false,
      graph_data: templateData.graph_data || { nodes: [], edges: [] },
      variables: templateData.variables || [],
      customization_points: templateData.customization_points || [],
      usage_count: 0,
      average_rating: 0,
      download_count: 0,
      favorite_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    this.templates.set(template.id, template);
    return template;
  }

  getTemplate(id: number): Template | null {
    return this.templates.get(id) || null;
  }

  updateTemplate(id: number, updates: Partial<Template>, userId: number): Template | null {
    const template = this.templates.get(id);
    if (!template) return null;

    if (template.author_id !== userId) {
      throw new Error('Permission denied: User is not the template author');
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      id: template.id, // Ensure ID doesn't change
      author_id: template.author_id, // Ensure author doesn't change
      created_at: template.created_at, // Ensure created date doesn't change
      updated_at: new Date()
    };

    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  deleteTemplate(id: number, userId: number): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    if (template.author_id !== userId) {
      throw new Error('Permission denied: User is not the template author');
    }

    this.templates.delete(id);
    // Also clean up related data
    Array.from(this.usages.values())
      .filter(usage => usage.template_id === id)
      .forEach(usage => this.usages.delete(usage.id));
    
    Array.from(this.reviews.values())
      .filter(review => review.template_id === id)
      .forEach(review => this.reviews.delete(review.id));

    return true;
  }

  searchTemplates(filters: {
    query?: string;
    categoryId?: number;
    tags?: string[];
    authorId?: number;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }) {
    let templates = Array.from(this.templates.values());

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.categoryId) {
      templates = templates.filter(t => t.category_id === filters.categoryId);
    }

    if (filters.tags && filters.tags.length > 0) {
      templates = templates.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filters.authorId) {
      templates = templates.filter(t => t.author_id === filters.authorId);
    }

    // Sort templates
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    templates.sort((a, b) => {
      let aVal = a[sortBy as keyof Template];
      let bVal = b[sortBy as keyof Template];

      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    const total = templates.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 10;
    const paginatedTemplates = templates.slice(offset, offset + limit);

    return {
      templates: paginatedTemplates,
      total
    };
  }

  // Template customization
  customizeTemplate(id: number, customizations: any): Template | null {
    const template = this.getTemplate(id);
    if (!template) return null;

    // Create a customized copy without modifying the original
    const customized = JSON.parse(JSON.stringify(template));

    // Apply variable customizations
    if (customizations.variables) {
      customized.variables = customized.variables.map((variable: any) => {
        if (customizations.variables[variable.name]) {
          return {
            ...variable,
            defaultValue: customizations.variables[variable.name]
          };
        }
        return variable;
      });
    }

    // Apply customization point changes
    if (customizations.customization_points) {
      // This would apply customizations to the graph data
      customized.graph_data = this.applyCustomizationPoints(
        customized.graph_data,
        customized.customization_points,
        customizations.customization_points
      );
    }

    return customized;
  }

  private applyCustomizationPoints(graphData: any, points: any[], customizations: any): any {
    const customizedGraph = JSON.parse(JSON.stringify(graphData));
    
    points.forEach(point => {
      if (customizations[point.id]) {
        const node = customizedGraph.nodes.find((n: any) => n.id === point.node_id);
        if (node) {
          node.data[point.property] = customizations[point.id];
        }
      }
    });

    return customizedGraph;
  }

  // Usage tracking
  recordUsage(templateId: number, userId: number, projectId: number | undefined, customizations: any, success: boolean): TemplateUsage {
    const usage: TemplateUsage = {
      id: this.nextUsageId++,
      template_id: templateId,
      user_id: userId,
      project_id: projectId,
      customizations_applied: customizations,
      used_at: new Date(),
      success
    };

    this.usages.set(usage.id, usage);

    // Update template usage count
    const template = this.templates.get(templateId);
    if (template) {
      template.usage_count++;
      template.updated_at = new Date();
    }

    return usage;
  }

  getUsage(templateId: number): TemplateUsage[] {
    return Array.from(this.usages.values())
      .filter(usage => usage.template_id === templateId)
      .sort((a, b) => b.used_at.getTime() - a.used_at.getTime());
  }

  // Reviews
  addReview(templateId: number, userId: number, reviewData: { rating: number; comment?: string }): TemplateReview {
    // Check for existing review
    const existingReview = Array.from(this.reviews.values())
      .find(r => r.template_id === templateId && r.user_id === userId);
    
    if (existingReview) {
      throw new Error('User has already reviewed this template');
    }

    const review: TemplateReview = {
      id: this.nextReviewId++,
      template_id: templateId,
      user_id: userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      created_at: new Date()
    };

    this.reviews.set(review.id, review);

    // Update template average rating
    this.updateTemplateRating(templateId);

    return review;
  }

  getReviews(templateId: number): TemplateReview[] {
    return Array.from(this.reviews.values())
      .filter(review => review.template_id === templateId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  private updateTemplateRating(templateId: number): void {
    const template = this.templates.get(templateId);
    if (!template) return;

    const reviews = this.getReviews(templateId);
    if (reviews.length === 0) {
      template.average_rating = 0;
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    template.average_rating = Number((totalRating / reviews.length).toFixed(2));
    template.updated_at = new Date();
  }

  // Analytics
  getAnalytics(templateId: number) {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const usages = this.getUsage(templateId);
    const reviews = this.getReviews(templateId);

    const uniqueUsers = new Set(usages.map(u => u.user_id)).size;
    const successfulUsages = usages.filter(u => u.success).length;
    const successRate = usages.length > 0 ? successfulUsages / usages.length : 0;

    // Analyze popular customizations
    const customizationAnalysis = this.analyzeCustomizations(usages);

    return {
      usage_count: template.usage_count,
      unique_users: uniqueUsers,
      success_rate: Number(successRate.toFixed(2)),
      average_rating: template.average_rating,
      total_reviews: reviews.length,
      recent_usages: usages.slice(0, 10),
      popular_customizations: customizationAnalysis,
      performance_metrics: {
        avg_creation_time: faker.number.int({ min: 500, max: 2000 }),
        avg_customization_time: faker.number.int({ min: 200, max: 800 })
      }
    };
  }

  private analyzeCustomizations(usages: TemplateUsage[]) {
    const customizations: { [key: string]: { [value: string]: number } } = {};

    usages.forEach(usage => {
      Object.entries(usage.customizations_applied).forEach(([key, value]) => {
        if (!customizations[key]) customizations[key] = {};
        const valueStr = String(value);
        customizations[key][valueStr] = (customizations[key][valueStr] || 0) + 1;
      });
    });

    return customizations;
  }

  // Export functionality
  exportTemplate(templateId: number, format: string) {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const exportData = {
      template,
      metadata: {
        exported_at: new Date().toISOString(),
        format,
        version: '1.0'
      }
    };

    const filename = `${template.name.replace(/\s+/g, '_')}_v${template.version}.${format}`;
    
    let content: string;
    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2);
    } else {
      // For zip format, we'll simulate the content
      content = `ZIP_CONTENT_${templateId}_${Date.now()}`;
    }

    return {
      filename,
      content,
      format
    };
  }

  // Validation
  validateTemplateName(name: string): boolean {
    return !Array.from(this.templates.values()).some(t => t.name === name);
  }

  // Reset for testing
  reset(): void {
    this.templates.clear();
    this.usages.clear();
    this.reviews.clear();
    this.nextTemplateId = 1;
    this.nextUsageId = 1;
    this.nextReviewId = 1;
    this.seedData();
  }

  // Get all data for testing
  getAllData() {
    return {
      templates: Array.from(this.templates.values()),
      usages: Array.from(this.usages.values()),
      reviews: Array.from(this.reviews.values())
    };
  }
}

// Singleton instance for consistent data across tests
export const templateDb = new TemplateDatabase();