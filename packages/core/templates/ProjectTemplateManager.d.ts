/**
 * Epic 9.2.6 - Project Templates Implementation
 * Manages project templates with versioning, categorization, and sharing capabilities
 */

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    version: string;
    preview_image?: string;
    author: {,
        id: string;
        name: string;
        avatar?: string;
    };
    created_at: string;
    updated_at: string;
    usage_count: number;
    rating: number;
    is_public: boolean;
    is_featured: boolean;
    graph_data: any;
    variables: TemplateVariable[];
    customization_points: CustomizationPoint[];
    complexity_level: 'beginner' | 'intermediate' | 'advanced';
    estimated_time: number;
    prerequisites: string[];
    learning_objectives: string[];

export interface TemplateVariable {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
    description: string;
    default_value: any;
    required: boolean;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
    };

export interface CustomizationPoint {
    id: string;
    name: string;
    type: 'node_properties' | 'graph_structure' | 'styling' | 'behavior';
    target_nodes: string[];
    properties: string[];
    description: string;
    ui_component: 'input' | 'select' | 'color_picker' | 'slider' | 'toggle';

export interface TemplateCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    parent_id?: string;

export interface TemplateUsageAnalytics {
    template_id: string;
    total_uses: number;
    unique_users: number;
    success_rate: number;
    average_rating: number;
    completion_rate: number;
    most_used_customizations: string[];
    trend_data: {,
        date: string;
        uses: number;
    }[];

export declare class ProjectTemplateManager {
    private apiClient;
    private templates;
    private categories;
    private analytics;
    constructor(apiClient: any);
    createTemplate();
      template: Omit<ProjectTemplate,
      'id' | 'created_at' | 'updated_at' | 'usage_count' | 'rating'>
    ): Promise<ProjectTemplate>;
    updateTemplate(id: string, updates: Partial<ProjectTemplate>): Promise<ProjectTemplate>;
    deleteTemplate(id: string): Promise<void>;
    searchTemplates(criteria: {)
        query?: string;
        category?: string;
        tags?: string[];
        complexity?: string;
        author?: string;
        min_rating?: number;
        sort_by?: 'popularity' | 'rating' | 'newest' | 'name';
        limit?: number;
        offset?: number;
    }): Promise<{
        templates: ProjectTemplate[];
        total: number;
    }>;
    getFeaturedTemplates(): Promise<ProjectTemplate[]>;
    getRecommendedTemplates(userId: string): Promise<ProjectTemplate[]>;
    instantiateTemplate(templateId: string, customizations: Record<string, any>): Promise<any>;
    previewTemplate(templateId: string, customizations: Record<string, any>): Promise<any>;
    exportTemplate(templateId: string, format: 'json' | 'yaml' | 'bundle'): Promise<string>;
    importTemplate(templateData: string, format: 'json' | 'yaml' | 'bundle'): Promise<ProjectTemplate>;
    rateTemplate(templateId: string, userId: string, rating: number, review?: string): Promise<void>;
    getTemplateAnalytics(templateId: string): Promise<TemplateUsageAnalytics>;
    createCategory(category: Omit<TemplateCategory, 'id'>): Promise<TemplateCategory>;
    getCategories(): TemplateCategory[];
    getCategoryHierarchy(): TemplateCategory[];
    private validateTemplate;
    private applyCustomizations;
    private applyCustomizationPoint;
    private updateNodeProperties;
    private updateGraphStructure;
    private updateStyling;
    private updateBehavior;
    private sortTemplates;
    private buildCategoryTree;
    private recordTemplateUsage;
    private refreshTemplateRating;
    private getUserTemplateAnalytics;
    private convertToYaml;
    private parseYamlTemplate;
    private createTemplateBundle;
    private extractFromBundle;
    private extractDependencies;
    private initializeDefaultCategories;

//# sourceMappingURL=ProjectTemplateManager.d.ts.map