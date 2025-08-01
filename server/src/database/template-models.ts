/**
 * Epic 9.2.6 - Project Template Models
 * TypeScript models for project template functionality
 */

import { z } from 'zod';

// Template visibility levels
export const TemplateVisibility = {
  PRIVATE: 'private',
  WORKSPACE: 'workspace', 
  PUBLIC: 'public'
 as const;

// Template categories
export const TemplateCategory = {
  GENERAL: 'general',
  AI: 'ai',
  CREATIVE: 'creative', 
  BUSINESS: 'business',
  TECHNICAL: 'technical',
  EDUCATIONAL: 'educational',
  CUSTOM: 'custom'
 as const;

// Template difficulty levels
export const TemplateDifficulty = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
 as const;

// Template completion status
export const TemplateUsageStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
 as const;

// Template usage source
export const TemplateUsageSource = {
  MANUAL: 'manual',
  RECOMMENDED: 'recommended',
  SEARCH: 'search',
  FEATURED: 'featured',
  SHARED: 'shared'
 as const;

// Template download formats
export const TemplateDownloadFormat = {
  JSON: 'json',
  YAML: 'yaml',
  ZIP: 'zip'
 as const;

// Template customization field types
export const CustomizationFieldType = {
  TEXT: 'text',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  MULTI_SELECT: 'multi_select',
  COLOR: 'color',
  DATE: 'date',
  OBJECT: 'object',
  ARRAY: 'array'
 as const;

// Zod schemas for validation
export const ProjectTemplateSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  template_data: z.record(z.unknown()),
  thumbnail_url: z.string().url().optional(),
  category: z.enum(['general', 'ai', 'creative', 'business', 'technical', 'educational', 'custom']),
  tags: z.array(z.string()).default([]),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  version: z.string().default('1.0.0'),
  compatibility_version: z.string().optional(),
  estimated_time_minutes: z.number().int().positive().optional(),
  visibility: z.enum(['private', 'workspace', 'public']),
  is_featured: z.boolean().default(false),
  usage_count: z.number().int().min(0),
  rating_average: z.number().min(1).max(5).optional(),
  rating_count: z.number().int().min(0),
  customizable_fields: z.record(z.unknown()).default({}),
  default_values: z.record(z.unknown()).default({}),
  validation_rules: z.record(z.unknown()).default({}),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  published_at: z.date().optional(),
  archived_at: z.date().optional(),
  deprecated_at: z.date().optional(),
  replacement_template_id: z.string().uuid().optional()
});

export const CreateProjectTemplateSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  template_data: z.record(z.unknown()),
  thumbnail_url: z.string().url().optional(),
  category: z.enum(['general', 'ai', 'creative', 'business', 'technical', 'educational', 'custom']).default('general'),
  tags: z.array(z.string()).optional().default([]),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  version: z.string().optional().default('1.0.0'),
  compatibility_version: z.string().optional(),
  estimated_time_minutes: z.number().int().positive().optional(),
  visibility: z.enum(['private', 'workspace', 'public']).default('workspace'),
  is_featured: z.boolean().optional().default(false),
  customizable_fields: z.record(z.unknown()).optional().default({}),
  default_values: z.record(z.unknown()).optional().default({}),
  validation_rules: z.record(z.unknown()).optional().default({})
});

export const UpdateProjectTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  template_data: z.record(z.unknown()).optional(),
  thumbnail_url: z.string().url().optional(),
  category: z.enum(['general', 'ai', 'creative', 'business', 'technical', 'educational', 'custom']).optional(),
  tags: z.array(z.string()).optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  version: z.string().optional(),
  compatibility_version: z.string().optional(),
  estimated_time_minutes: z.number().int().positive().optional(),
  visibility: z.enum(['private', 'workspace', 'public']).optional(),
  is_featured: z.boolean().optional(),
  customizable_fields: z.record(z.unknown()).optional(),
  default_values: z.record(z.unknown()).optional(),
  validation_rules: z.record(z.unknown()).optional()
});

export const TemplateReviewSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  user_id: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  review_text: z.string().optional(),
  is_verified_purchase: z.boolean(),
  is_helpful_count: z.number().int().min(0),
  created_at: z.date(),
  updated_at: z.date()
});

export const CreateTemplateReviewSchema = z.object({
  template_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  review_text: z.string().optional()
});

export const UpdateTemplateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(255).optional(),
  review_text: z.string().optional()
});

export const TemplateUsageSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  user_id: z.string(),
  project_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid(),
  customizations_applied: z.record(z.unknown()),
  completion_status: z.enum(['in_progress', 'completed', 'abandoned']),
  time_to_complete_minutes: z.number().int().positive().optional(),
  user_rating: z.number().int().min(1).max(5).optional(),
  user_feedback: z.string().optional(),
  started_at: z.date(),
  completed_at: z.date().optional(),
  last_accessed_at: z.date(),
  source: z.enum(['manual', 'recommended', 'search', 'featured', 'shared'])
});

export const CreateTemplateUsageSchema = z.object({
  template_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid(),
  customizations_applied: z.record(z.unknown()).optional().default({}),
  source: z.enum(['manual', 'recommended', 'search', 'featured', 'shared']).default('manual')
});

export const UpdateTemplateUsageSchema = z.object({
  customizations_applied: z.record(z.unknown()).optional(),
  completion_status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
  time_to_complete_minutes: z.number().int().positive().optional(),
  user_rating: z.number().int().min(1).max(5).optional(),
  user_feedback: z.string().optional(),
  completed_at: z.date().optional()
});

export const TemplateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon_name: z.string().max(50).optional(),
  sort_order: z.number().int(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});

export const TemplateFavoriteSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  user_id: z.string(),
  workspace_id: z.string().uuid().optional(),
  created_at: z.date()
});

export const TemplateDownloadSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  user_id: z.string(),
  download_format: z.enum(['json', 'yaml', 'zip']),
  download_size_bytes: z.number().int().optional(),
  user_agent: z.string().optional(),
  ip_address: z.string().optional(),
  downloaded_at: z.date()
});

// TypeScript types inferred from schemas
export type ProjectTemplate = z.infer<typeof ProjectTemplateSchema>;
export type CreateProjectTemplate = z.infer<typeof CreateProjectTemplateSchema>;
export type UpdateProjectTemplate = z.infer<typeof UpdateProjectTemplateSchema>;

export type TemplateReview = z.infer<typeof TemplateReviewSchema>;
export type CreateTemplateReview = z.infer<typeof CreateTemplateReviewSchema>;
export type UpdateTemplateReview = z.infer<typeof UpdateTemplateReviewSchema>;

export type TemplateUsage = z.infer<typeof TemplateUsageSchema>;
export type CreateTemplateUsage = z.infer<typeof CreateTemplateUsageSchema>;
export type UpdateTemplateUsage = z.infer<typeof UpdateTemplateUsageSchema>;

export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;
export type TemplateFavorite = z.infer<typeof TemplateFavoriteSchema>;
export type TemplateDownload = z.infer<typeof TemplateDownloadSchema>;

// Extended types with additional data



export interface ProjectTemplateWithStats extends ProjectTemplate {
  review_count?: number;
  favorite_count?: number;
  recent_usage_count?: number;
  is_favorited?: boolean;
  user_rating?: number;
  can_edit?: boolean;
  can_delete?: boolean;




export interface TemplateReviewWithAuthor extends TemplateReview {
  author_name?: string;
  author_avatar?: string;
  is_author?: boolean;




export interface TemplateUsageWithTemplate extends TemplateUsage {
  template_name?: string;
  template_thumbnail?: string;
  template_category?: string;


// Filter and query types



export interface TemplateFilter {
  search?: string;
  category?: string;
  tags?: string[];
  difficulty_level?: string[];
  visibility?: string[];
  min_rating?: number;
  is_featured?: boolean;
  created_by?: string;
  workspace_id?: string;







export interface TemplateSort {
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'rating_average' | 'usage_count' | 'relevance';
  sort_order?: 'asc' | 'desc';







export interface TemplateReviewFilter {
  template_id?: string;
  user_id?: string;
  min_rating?: number;
  max_rating?: number;
  has_text?: boolean;







export interface TemplateUsageFilter {
  template_id?: string;
  user_id?: string;
  workspace_id?: string;
  completion_status?: string[];
  source?: string[];
  from_date?: Date;
  to_date?: Date;





// Customization field definition



export interface CustomizationField {
  type: keyof typeof CustomizationFieldType;
  label: string;
  description?: string;
  required?: boolean;
  default_value?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;



    options?: Array<{ value: Error; label: string }>;
  };
  help_text?: string;
  group?: string;


// Template customization interface



export interface TemplateCustomization {
  fields: Record<string, CustomizationField>;
  groups?: Array<{
    id: string;
    label: string;
    description?: string;
    order: number;



>;


// Template analytics types



export interface TemplateAnalytics {
  usage_stats: {
    total_usages: number;
    completed_usages: number;
    completion_rate: number;
    average_completion_time: number;
    usage_by_source: Record<string, number>;



    usage_trend: Array<{ date: string; count: number }>;
  };
  rating_stats: {
    average_rating: number;
    rating_distribution: Record<number, number>;
    review_count: number;
    recent_reviews: TemplateReview[];
  };
  performance_metrics: {
    conversion_rate: number; // Views to usage ratio
    retention_rate: number; // Users who come back
    recommendation_score: number; // Algorithm score
  };


// Template export format



export interface TemplateExport {
  metadata: {
    template_id: string;
    name: string;
    version: string;
    exported_at: string;
    exported_by: string;
    export_format: string;



  };
  template: ProjectTemplate;
  customizations?: Record<string, any>;
  usage_analytics?: Partial<TemplateAnalytics>;


// Utility functions
export function isTemplatePublic(template: ProjectTemplate): boolean {
  return template.visibility === TemplateVisibility.PUBLIC && !template.archived_at;


export function canUserAccessTemplate(
  template: ProjectTemplate,
  userId: string,
  userWorkspaceIds: string[]
): boolean {
  // Template is archived
  if (template.archived_at) return false;
  
  // User is the creator
  if (template.created_by === userId) return true;
  
  // Template is public
  if (template.visibility === TemplateVisibility.PUBLIC) return true;
  
  // Template is workspace-visible and user has access to workspace
  if (template.visibility === TemplateVisibility.WORKSPACE && 
      template.workspace_id && 
      userWorkspaceIds.includes(template.workspace_id)) {
    return true;

  
  return false;


export function validateCustomizations(
  customizations: Record<string, any>,
  template: ProjectTemplate
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fields = template.customizable_fields as Record<string, CustomizationField>;
  
  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    const value = customizations[fieldName];
    
    // Check required fields
    if (fieldDef.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${fieldName}' is required`);
      continue;

    
    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) continue;
    
    // Type validation
    if (fieldDef.type === CustomizationFieldType.NUMBER && typeof value !== 'number') {
      errors.push(`Field '${fieldName}' must be a number`);

    
    if (fieldDef.type === CustomizationFieldType.BOOLEAN && typeof value !== 'boolean') {
      errors.push(`Field '${fieldName}' must be a boolean`);

    
    // Range validation for numbers
    if (fieldDef.type === CustomizationFieldType.NUMBER && typeof value === 'number') {
      if (fieldDef.validation?.min !== undefined && value < fieldDef.validation.min) {
        errors.push(`Field '${fieldName}' must be at least ${fieldDef.validation.min}`);

      if (fieldDef.validation?.max !== undefined && value > fieldDef.validation.max) {
        errors.push(`Field '${fieldName}' must be at most ${fieldDef.validation.max}`);


    
    // Pattern validation for strings
    if (fieldDef.type === CustomizationFieldType.TEXT && typeof value === 'string') {
      if (fieldDef.validation?.pattern) {
        const regex = new RegExp(fieldDef.validation.pattern);
        if (!regex.test(value)) {
          errors.push(`Field '${fieldName}' does not match required pattern`);



    
    // Options validation for select fields
    if ((fieldDef.type === CustomizationFieldType.SELECT || 
         fieldDef.type === CustomizationFieldType.MULTI_SELECT) && 
        fieldDef.validation?.options) {
      const validValues = fieldDef.validation.options.map(opt => opt.value);
      if (fieldDef.type === CustomizationFieldType.SELECT) {
        if (!validValues.includes(value)) {
          errors.push(`Field '${fieldName}' must be one of: ${validValues.join(', ')}`);

 else if (Array.isArray(value)) {
        const invalidValues = value.filter(v => !validValues.includes(v));
        if (invalidValues.length > 0) {
          errors.push(`Field '${fieldName}' contains invalid values: ${invalidValues.join(', ')}`);




  
  return { valid: errors.length === 0, errors };


export function applyTemplateCustomizations(
  templateData: Record<string, any>,
  customizations: Record<string, any>,
  template: ProjectTemplate
): Record<string, any> {
  // Deep clone the template data
  const result = JSON.parse(JSON.stringify(templateData));
  
  // Apply default values first
  const defaultValues = template.default_values as Record<string, any>;
  for (const [key, defaultValue] of Object.entries(defaultValues)) {
    if (customizations[key] === undefined) {
      customizations[key] = defaultValue;


  
  // Apply customizations to the template data
  // This is a simplified version - in practice, you'd need more sophisticated
  // template variable replacement logic
  function replaceInObject(obj: unknown, replacements: Record<string, any>): unknown {
    if (typeof obj === 'string') {
      let result = obj;
      for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(value));

      return result;
 else if (Array.isArray(obj)) {
      return obj.map(item => replaceInObject(item, replacements));
 else if (obj && typeof obj === 'object') {
      const newObj: unknown = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceInObject(value, replacements);

      return newObj;

    return obj;

  
  return replaceInObject(result, customizations);
