/**
 * Epic 9.2.6 - Project Templates Implementation
 * Manages project templates with versioning, categorization, and sharing capabilities
 */
export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string;
    version: string;
    preview_image?: string;
    author: {
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
    variables: TemplateVariable;
    customization_points: CustomizationPoint;
    complexity_level: 'beginner' | 'intermediate' | 'advanced';
    estimated_time: number;
    prerequisites: string;
    learning_objectives: string;
}
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
        options?: string;
    };
}
export interface CustomizationPoint {
    id: string;
    name: string;
    type: 'node_properties' | 'graph_structure' | 'styling' | 'behavior';
    target_nodes: string;
    properties: string;
    description: string;
    ui_component: 'input' | 'select' | 'color_picker' | 'slider' | 'toggle';
}
export interface TemplateCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    parent_id?: string;
}
export interface TemplateUsageAnalytics {
    template_id: string;
    total_uses: number;
    unique_users: number;
    success_rate: number;
    average_rating: number;
    completion_rate: number;
    most_used_customizations: string;
    trend_data: {
        date: string;
        uses: number;
    }[];
}
export declare class ProjectTemplateManager {
    private apiClient;
    private templates;
    private categories;
    private analytics;
    constructor(apiClient: any);
}
//# sourceMappingURL=ProjectTemplateManager.d.ts.map