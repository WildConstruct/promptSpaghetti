import { Node, Edge } from 'reactflow';
import { 
  Template,
  TemplateFilter,
  TemplateCategory,
  TemplateInstantiationOptions,
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
export declare class LocalTemplateStorage implements TemplateStorage {
    private readonly storageKey;
    private getStoredTemplates;
    private saveStoredTemplates;
    save(template: Template): Promise<Template>;
    load(id: string): Promise<Template | null>;
    loadAll(): Promise<Template[]>;
    update(id: string, updates: Partial<Template>): Promise<Template>;
    delete(id: string): Promise<void>;
    search(filter: TemplateFilter): Promise<Template[]>;
}
/**
 * Main Template Service
 */
export declare class TemplateService {
    private storage;
    constructor(storage?: TemplateStorage);
    /**
     * Create template from current graph data
     */
    createFromGraph(nodes: Node[], edges: Edge[], saveData: TemplateSaveData, author: string): Promise<Template>;
    /**
     * Load template by ID
     */
    loadTemplate(id: string): Promise<Template | null>;
    /**
     * Search templates with filters
     */
    searchTemplates(filter?: TemplateFilter): Promise<Template[]>;
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category: TemplateCategory): Promise<Template[]>;
    /**
     * Get popular templates
     */
    getPopularTemplates(limit?: number): Promise<Template[]>;
    /**
     * Get recent templates
     */
    getRecentTemplates(limit?: number): Promise<Template[]>;
    /**
     * Instantiate template into current graph
     */
    instantiateTemplate(templateId: string, options: TemplateInstantiationOptions): Promise<GraphData>;
    /**
     * Add review to template
     */
    addReview(templateId: string, review: Omit<Review, 'id' | 'timestamp'>): Promise<Review>;
    /**
     * Delete template
     */
    deleteTemplate(id: string): Promise<void>;
    /**
     * Validate template structure
     */
    validateTemplate(template: Template): Promise<TemplateValidation>;
    private extractAnnotations;
    private calculateComplexity;
    private estimateOutputLength;
    private calculateAverageRating;
}
export declare const templateService: TemplateService;
//# sourceMappingURL=TemplateService.d.ts.map