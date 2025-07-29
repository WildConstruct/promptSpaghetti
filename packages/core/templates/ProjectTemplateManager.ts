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
  // Template content
  graph_data: any; // The actual graph structure,
  variables: TemplateVariable;
  customization_points: CustomizationPoint;
  // Metadata
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: number; // minutes
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
  ui_component: 'input' | 'select' | 'color_picker' | 'slider' | 'toggle'
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
export class ProjectTemplateManager {
  private templates = new Map<string, ProjectTemplate>();
  private categories = new Map<string, TemplateCategory>();
  private analytics = new Map<string, TemplateUsageAnalytics>();
  constructor(private apiClient: any) {,
  this.initializeDefaultCategories();
  // Template Management
  async createTemplate(template: Omit<ProjectTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'rating'>): Promise<ProjectTemplate> {,
  const newTemplate: ProjectTemplate = {,
  ...template,
  id: crypto.randomUUID(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  usage_count: 0,
  rating: 0,
};
    // Validate template structure
    this.validateTemplate(newTemplate);
    // Store template
    this.templates.set(newTemplate.id, newTemplate);
    // Send to server
    await this.apiClient.post('/api/templates', newTemplate);
    return newTemplate;
  async updateTemplate(id: string, updates: Partial<ProjectTemplate>): Promise<ProjectTemplate> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template ${id} not found`);}
    const updatedTemplate = {
  ...template,
  ...updates,
  updated_at: new Date().toISOString(),
};
    this.validateTemplate(updatedTemplate);
    this.templates.set(id, updatedTemplate);
    await this.apiClient.put(`/api/templates/${id}`, updatedTemplate);}
    return updatedTemplate;
  async deleteTemplate(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template ${id} not found`);}
    this.templates.delete(id);
    this.analytics.delete(id);
    await this.apiClient.delete(`/api/templates/${id}`);}
  // Template Discovery
  async searchTemplates(criteria: {)
  query?: string;
  category?: string;
  tags?: string;
  complexity?: string;
  author?: string;
  min_rating?: number;
  sort_by?: 'popularity' | 'rating' | 'newest' | 'name';
  limit?: number;
  offset?: number;
}): Promise<{ templates: ProjectTemplate; total: number }> {
  let filteredTemplates = Array.from(this.templates.values());
  // Apply filters
  if (criteria.query) {
  const query = criteria.query.toLowerCase();
  filteredTemplates = filteredTemplates.filter(t => )
  t.name.toLowerCase().includes(query) ||
  t.description.toLowerCase().includes(query) ||
  t.tags.some(tag => tag.toLowerCase().includes(query))
  );
  if (criteria.category) {
  filteredTemplates = filteredTemplates.filter(t => t.category === criteria.category);
  if (criteria.tags?.length) {
  filteredTemplates = filteredTemplates.filter(t => )
  criteria.tags!.some(tag => t.tags.includes(tag))
  );
  if (criteria.complexity) {
  filteredTemplates = filteredTemplates.filter(t => t.complexity_level === criteria.complexity);
  if (criteria.author) {
  filteredTemplates = filteredTemplates.filter(t => t.author.id === criteria.author);
  if (criteria.min_rating) {
  filteredTemplates = filteredTemplates.filter(t => t.rating >= criteria.min_rating!);
  // Sort results
  this.sortTemplates(filteredTemplates, criteria.sort_by || 'popularity');
  // Apply pagination
  const offset = criteria.offset || 0;
  const limit = criteria.limit || 20;
  const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);
  return {
  templates: paginatedTemplates,
  total: filteredTemplates.length,
};
  async getFeaturedTemplates(): Promise<ProjectTemplate> {
    return Array.from(this.templates.values())
      .filter(t => t.is_featured && t.is_public)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  async getRecommendedTemplates(userId: string): Promise<ProjectTemplate> {
    // Simple recommendation based on user's previous template usage
    const userAnalytics = await this.getUserTemplateAnalytics(userId);
    const userCategories = userAnalytics.most_used_categories || [];
    return Array.from(this.templates.values())
      .filter(t => t.is_public && userCategories.includes(t.category))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  // Template Usage
  async instantiateTemplate(templateId: string, customizations: Record<string, any>): Promise<any> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);}
    // Clone the template graph data
    let graphData = JSON.parse(JSON.stringify(template.graph_data));
    // Apply customizations
    graphData = this.applyCustomizations(graphData, template, customizations);
    // Record usage
    await this.recordTemplateUsage(templateId);
    return graphData;
  async previewTemplate(templateId: string, customizations: Record<string, any>): Promise<any> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);}
    // Generate preview without recording usage
    const graphData = JSON.parse(JSON.stringify(template.graph_data));
    return this.applyCustomizations(graphData, template, customizations);
  // Template Import/Export
  async exportTemplate(templateId: string, format: 'json' | 'yaml' | 'bundle'): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);}
    switch (format) {
    case 'json':
      return JSON.stringify(template, null, 2);
    case 'yaml':
      // Convert to YAML format
      return this.convertToYaml(template);
    case 'bundle':
      // Create a complete bundle with dependencies
      return this.createTemplateBundle(template);
    default:
      throw new Error(`Unsupported export format: ${format}`);}
  async importTemplate(templateData: string, format: 'json' | 'yaml' | 'bundle'): Promise<ProjectTemplate> {
    let template: ProjectTemplate;
    switch (format) {
    case 'json':
      template = JSON.parse(templateData);
      break;
    case 'yaml':
      template = this.parseYamlTemplate(templateData);
      break;
    case 'bundle':
      template = this.extractFromBundle(templateData);
      break;
    default:
      throw new Error(`Unsupported import format: ${format}`);}
    // Validate and store
    this.validateTemplate(template);
    template.id = crypto.randomUUID(); // Generate new ID
    template.created_at = new Date().toISOString();
    template.updated_at = new Date().toISOString();
    this.templates.set(template.id, template);
    await this.apiClient.post('/api/templates', template);
    return template;
  // Analytics and Ratings
  async rateTemplate(templateId: string, userId: string, rating: number, review?: string): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    await this.apiClient.post(`/api/templates/${templateId}/ratings`, {)}
  },
  user_id: userId,
      rating,
      review
    });
    // Update local cache
    await this.refreshTemplateRating(templateId);
  async getTemplateAnalytics(templateId: string): Promise<TemplateUsageAnalytics> {
    const analytics = this.analytics.get(templateId);
    if (analytics) {
      return analytics;
    // Fetch from server
    const response = await this.apiClient.get(`/api/templates/${templateId}/analytics`);}
    const fetchedAnalytics = response.data;
    this.analytics.set(templateId, fetchedAnalytics);
    return fetchedAnalytics;
  // Category Management
  async createCategory(category: Omit<TemplateCategory, 'id'>): Promise<TemplateCategory> {
  const newCategory: TemplateCategory = {,
  ...category,
  id: crypto.randomUUID(),
};
    this.categories.set(newCategory.id, newCategory);
    await this.apiClient.post('/api/template-categories', newCategory);
    return newCategory;
  getCategories(): TemplateCategory {
    return Array.from(this.categories.values());
  getCategoryHierarchy(): TemplateCategory {
    const categories = Array.from(this.categories.values());
    const rootCategories = categories.filter(c => !c.parent_id);
    // Build hierarchy recursively
    return rootCategories.map(root => this.buildCategoryTree(root, categories));
  // Private helper methods
  private validateTemplate(template: ProjectTemplate): void {
    if (!template.name?.trim()) {
      throw new Error('Template name is required');
    if (!template.graph_data) {
      throw new Error('Template graph data is required');
    if (!template.category) {
      throw new Error('Template category is required');
    // Validate variables
    for (const variable of template.variables) {
      if (!variable.name || !variable.type) {
        throw new Error(`Invalid variable definition: ${variable.name}`);}
    // Validate customization points
    for (const point of template.customization_points) {
      if (!point.name || !point.type) {
        throw new Error(`Invalid customization point: ${point.name}`);}
  private applyCustomizations(graphData: any, template: ProjectTemplate, customizations: Record<string, any>): any {
    // Apply variable substitutions
    let dataStr = JSON.stringify(graphData);
    for (const variable of template.variables) {
      const value = customizations[variable.id] ?? variable.default_value;
      const placeholder = `{{${variable.name}}}`;}
      dataStr = dataStr.replace(new RegExp(placeholder, 'g'), String(value));
    graphData = JSON.parse(dataStr);
    // Apply customization points
    for (const point of template.customization_points) {
  if (customizations[point.id] !== undefined) {
  this.applyCustomizationPoint(graphData, point, customizations[point.id]);
  return graphData;
  private applyCustomizationPoint(graphData: any, point: CustomizationPoint, value: any): void {,
  // Apply customization based on type
  switch (point.type) {
  case 'node_properties':,
  this.updateNodeProperties(graphData, point.target_nodes, point.properties, value);
  break;
  case 'graph_structure':,
  this.updateGraphStructure(graphData, point, value);
  break;
  case 'styling':,
  this.updateStyling(graphData, point.target_nodes, value);
  break;
  case 'behavior':,
  this.updateBehavior(graphData, point.target_nodes, value);
  break;
  private updateNodeProperties(graphData: any, nodeIds: string, properties: string, value: any): void {,
  if (!graphData.nodes) return;
  graphData.nodes.forEach((node: any) => {,
  if (nodeIds.includes(node.id)) {
  properties.forEach(prop => {)
  node[prop] = value;
});
    });
  private updateGraphStructure(graphData: any, point: CustomizationPoint, value: any): void {
    // Implementation depends on specific graph structure modifications
    // This would be customized based on the graph format
  private updateStyling(graphData: any, nodeIds: string, value: any): void {
    if (!graphData.nodes) return;
    graphData.nodes.forEach((node: any) => {
      if (nodeIds.includes(node.id)) {
        node.style = { ...node.style, ...value };
    });
  private updateBehavior(graphData: any, nodeIds: string, value: any): void {
    if (!graphData.nodes) return;
    graphData.nodes.forEach((node: any) => {
      if (nodeIds.includes(node.id)) {
        node.behavior = { ...node.behavior, ...value };
    });
  private sortTemplates(templates: ProjectTemplate, sortBy: string): void {
  switch (sortBy) {
  case 'popularity':,
  templates.sort((a, b) => b.usage_count - a.usage_count);
  break;
  case 'rating':,
  templates.sort((a, b) => b.rating - a.rating);
  break;
  case 'newest':,
  templates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  break;
  case 'name':,
  templates.sort((a, b) => a.name.localeCompare(b.name));
  break;
  private buildCategoryTree(category: TemplateCategory, allCategories: TemplateCategory): any {,
  const children = allCategories.filter(c => c.parent_id === category.id);
  return {
  ...category,
  children: children.map(child => this.buildCategoryTree(child, allCategories)),
};
  private async recordTemplateUsage(templateId: string): Promise<void> {
    await this.apiClient.post(`/api/templates/${templateId}/usage`);}
    // Update local cache
    const template = this.templates.get(templateId);
    if (template) {
      template.usage_count++;
  private async refreshTemplateRating(templateId: string): Promise<void> {
    const response = await this.apiClient.get(`/api/templates/${templateId}/rating`);}
    const template = this.templates.get(templateId);
    if (template) {
      template.rating = response.data.average_rating;
  private async getUserTemplateAnalytics(userId: string): Promise<any> {
    const response = await this.apiClient.get(`/api/users/${userId}/template-analytics`);}
    return response.data;
  private convertToYaml(template: ProjectTemplate): string {
  // Convert template to YAML format
  // This would use a YAML library in a real implementation
  return JSON.stringify(template, null, 2); // Placeholder
  private parseYamlTemplate(yamlData: string): ProjectTemplate {,
  // Parse YAML template data
  // This would use a YAML library in a real implementation
  return JSON.parse(yamlData); // Placeholder
  private createTemplateBundle(template: ProjectTemplate): string {,
  // Create a complete template bundle with all dependencies
  const bundle = {
  template,
  dependencies: this.extractDependencies(template),
  metadata: {
  created_at: new Date().toISOString(),
  version: '1.0.0',
};
    return JSON.stringify(bundle, null, 2);
  private extractFromBundle(bundleData: string): ProjectTemplate {
  const bundle = JSON.parse(bundleData);
  return bundle.template;
  private extractDependencies(template: ProjectTemplate): any {,
  // Extract any dependencies needed for the template
  return [];
  private initializeDefaultCategories(): void {,
  const defaultCategories: TemplateCategory = [
  {
  id: 'workflow',
  name: 'Workflow Templates',
  description: 'Pre-built workflow patterns and processes',
  icon: 'workflow',
  color: '#3B82F6',
}
      {
  id: 'data-processing',
  name: 'Data Processing',
  description: 'Templates for data transformation and analysis',
  icon: 'database',
  color: '#10B981',
}
      {
  id: 'automation',
  name: 'Automation',
  description: 'Automated task and process templates',
  icon: 'robot',
  color: '#F59E0B',
}
      {
  id: 'content',
  name: 'Content Generation',
  description: 'Templates for content creation and management',
  icon: 'document',
  color: '#8B5CF6',
}
      {
  id: 'analysis',
  name: 'Analysis & Reporting',
  description: 'Templates for analysis and reporting workflows',
  icon: 'chart',
  color: '#EF4444'];
  defaultCategories.forEach(category => {)
  this.categories.set(category.id, category);
});