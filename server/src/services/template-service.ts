/**
 * Epic 9.2.6 - Template Service Layer
 * Business logic for project template operations
 */

import { TemplateDAO } from '../database/template-dao';
import { WorkspaceDAO } from '../database/workspace-dao';
import {
  ProjectTemplate,
  CreateProjectTemplate,
  UpdateProjectTemplate,
  TemplateReview,
  CreateTemplateReview,
  UpdateTemplateReview,
  TemplateUsage,
  CreateTemplateUsage,
  UpdateTemplateUsage,
  TemplateCategory,
  TemplateFavorite,
  TemplateDownload,
  ProjectTemplateWithStats,
  TemplateReviewWithAuthor,
  TemplateUsageWithTemplate,
  TemplateFilter,
  TemplateSort,
  TemplateReviewFilter,
  TemplateUsageFilter,
  TemplateAnalytics,
  TemplateExport,
  PaginatedResult,
  PaginationOptions,
  canUserAccessTemplate,
  validateCustomizations,
  applyTemplateCustomizations
} from '../database/template-models';

export interface TemplateServiceOptions {
  getUserInfo?: (userId: string) => Promise<{ name: string; avatar?: string } | null>;
  checkWorkspaceAccess?: (workspaceId: string, userId: string, permission: number) => Promise<boolean>;
  generateThumbnail?: (templateData: Record<string, any>) => Promise<string>;
  sendNotification?: (userId: string, notification: unknown) => Promise<void>;
}

export class TemplateService {
  constructor(
    private templateDAO: TemplateDAO,
    private workspaceDAO: WorkspaceDAO,
    private options: TemplateServiceOptions = {}
  ) {}

  // ====== TEMPLATE OPERATIONS ======

  async createTemplate(data: CreateProjectTemplate, userId: string): Promise<ProjectTemplate> {
    // Validate template name
    if (!data.name.trim()) {
      throw new Error('Template name is required');
    }

    // Validate template data
    if (!data.template_data || Object.keys(data.template_data).length === 0) {
      throw new Error('Template data is required');
    }

    // Check workspace access if workspace_id is provided
    if (data.workspace_id) {
      if (this.options.checkWorkspaceAccess) {
        const hasAccess = await this.options.checkWorkspaceAccess(data.workspace_id, userId, 1); // WORKSPACE_READ permission
        if (!hasAccess) {
          throw new Error('Access denied to workspace');
        }
      }
    }

    // Generate thumbnail if service is available
    if (this.options.generateThumbnail && !data.thumbnail_url) {
      try {
        data.thumbnail_url = await this.options.generateThumbnail(data.template_data);
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error);
      }
    }

    const template = await this.templateDAO.createTemplate(data, userId);

    // Log activity if this is a workspace template
    if (template.workspace_id) {
      await this.workspaceDAO.createActivityEvent({
        workspace_id: template.workspace_id,
        actor_id: userId,
        event_type: 'template.created',
        event_data: {
          template_id: template.id,
          template_name: template.name,
          category: template.category
        }
      });
    }

    return template;
  }

  async getTemplate(id: string, userId: string): Promise<ProjectTemplateWithStats | null> {
    const template = await this.templateDAO.getTemplateWithStats(id, userId);
    if (!template) return null;

    // Check access permissions
    const userWorkspaces = await this.getUserWorkspaceIds(userId);
    if (!canUserAccessTemplate(template, userId, userWorkspaces)) {
      throw new Error('Access denied to template');
    }

    return template;
  }

  async getTemplates(
    filter: TemplateFilter = {},
    sort: TemplateSort = {},
    pagination: PaginationOptions = {},
    userId?: string
  ): Promise<PaginatedResult<ProjectTemplateWithStats>> {
    // If user is provided, filter to only accessible templates
    if (userId) {
      const userWorkspaces = await this.getUserWorkspaceIds(userId);
      
      // Modify filter to include accessibility check
      const accessibleFilter = { ...filter };
      
      // For non-admins, restrict visibility
      if (!accessibleFilter.visibility) {
        accessibleFilter.visibility = ['public'];
        if (userWorkspaces.length > 0) {
          accessibleFilter.visibility.push('workspace');
        }
      }
    }

    return this.templateDAO.getTemplates(filter, sort, pagination, userId);
  }

  async updateTemplate(
    id: string,
    data: UpdateProjectTemplate,
    userId: string
  ): Promise<ProjectTemplate | null> {
    const template = await this.templateDAO.getTemplate(id);
    if (!template) return null;

    // Check permissions - only creator or workspace admin can edit
    if (template.created_by !== userId) {
      if (template.workspace_id && this.options.checkWorkspaceAccess) {
        const hasAccess = await this.options.checkWorkspaceAccess(template.workspace_id, userId, 2); // WORKSPACE_WRITE permission
        if (!hasAccess) {
          throw new Error('Insufficient permissions to update template');
        }
      } else {
        throw new Error('Insufficient permissions to update template');
      }
    }

    // Regenerate thumbnail if template data changed
    if (data.template_data && this.options.generateThumbnail && !data.thumbnail_url) {
      try {
        data.thumbnail_url = await this.options.generateThumbnail(data.template_data);
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error);
      }
    }

    const updatedTemplate = await this.templateDAO.updateTemplate(id, data, userId);

    if (updatedTemplate && template.workspace_id) {
      // Log activity
      await this.workspaceDAO.createActivityEvent({
        workspace_id: template.workspace_id,
        actor_id: userId,
        event_type: 'template.updated',
        event_data: {
          template_id: id,
          template_name: updatedTemplate.name,
          changes: Object.keys(data)
        }
      });
    }

    return updatedTemplate;
  }

  async archiveTemplate(id: string, userId: string): Promise<boolean> {
    const template = await this.templateDAO.getTemplate(id);
    if (!template) return false;

    // Check permissions - only creator or workspace admin can archive
    if (template.created_by !== userId) {
      if (template.workspace_id && this.options.checkWorkspaceAccess) {
        const hasAccess = await this.options.checkWorkspaceAccess(template.workspace_id, userId, 8); // WORKSPACE_DELETE permission
        if (!hasAccess) {
          throw new Error('Insufficient permissions to archive template');
        }
      } else {
        throw new Error('Insufficient permissions to archive template');
      }
    }

    const success = await this.templateDAO.archiveTemplate(id);

    if (success && template.workspace_id) {
      // Log activity
      await this.workspaceDAO.createActivityEvent({
        workspace_id: template.workspace_id,
        actor_id: userId,
        event_type: 'template.archived',
        event_data: {
          template_id: id,
          template_name: template.name
        }
      });
    }

    return success;
  }

  async publishTemplate(id: string, userId: string): Promise<boolean> {
    const template = await this.templateDAO.getTemplate(id);
    if (!template) return false;

    // Check permissions - only creator can publish
    if (template.created_by !== userId) {
      throw new Error('Only the template creator can publish templates');
    }

    // Validate template before publishing
    const validationErrors = this.validateTemplateForPublishing(template);
    if (validationErrors.length > 0) {
      throw new Error(`Template validation failed: ${validationErrors.join(', ')}`);
    }

    const success = await this.templateDAO.publishTemplate(id);

    if (success && template.workspace_id) {
      // Log activity
      await this.workspaceDAO.createActivityEvent({
        workspace_id: template.workspace_id,
        actor_id: userId,
        event_type: 'template.published',
        event_data: {
          template_id: id,
          template_name: template.name
        }
      });
    }

    return success;
  }

  // ====== TEMPLATE USAGE OPERATIONS ======

  async useTemplate(
    templateId: string,
    customizations: Record<string, any>,
    projectData: { name: string; description?: string; workspace_id: string },
    userId: string
  ): Promise<{ project: unknown; usage: TemplateUsage }> {
    const template = await this.templateDAO.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check access
    const userWorkspaces = await this.getUserWorkspaceIds(userId);
    if (!canUserAccessTemplate(template, userId, userWorkspaces)) {
      throw new Error('Access denied to template');
    }

    // Validate customizations
    const validation = validateCustomizations(customizations, template);
    if (!validation.valid) {
      throw new Error(`Customization validation failed: ${validation.errors.join(', ')}`);
    }

    // Apply customizations to template
    const customizedData = applyTemplateCustomizations(
      template.template_data,
      customizations,
      template
    );

    // Create project from template
    const project = await this.workspaceDAO.createProject({
      workspace_id: projectData.workspace_id,
      name: projectData.name,
      description: projectData.description,
      metadata: {
        ...customizedData,
        template_id: templateId,
        template_version: template.version,
        customizations_applied: customizations
      }
    }, userId);

    // Create usage record
    const usage = await this.templateDAO.createTemplateUsage({
      template_id: templateId,
      project_id: project.id,
      workspace_id: projectData.workspace_id,
      customizations_applied: customizations,
      source: 'manual'
    }, userId);

    // Log activity
    await this.workspaceDAO.createActivityEvent({
      workspace_id: projectData.workspace_id,
      project_id: project.id,
      actor_id: userId,
      event_type: 'template.used',
      event_data: {
        template_id: templateId,
        template_name: template.name,
        project_name: project.name
      }
    });

    return { project, usage };
  }

  async completeTemplateUsage(
    usageId: string,
    completionData: {
      completion_status: 'completed' | 'abandoned';
      time_to_complete_minutes?: number;
      user_rating?: number;
      user_feedback?: string;
    },
    userId: string
  ): Promise<TemplateUsage | null> {
    const data: UpdateTemplateUsage = {
      ...completionData,
      completed_at: completionData.completion_status === 'completed' ? new Date() : undefined
    };

    return this.templateDAO.updateTemplateUsage(usageId, data, userId);
  }

  // ====== TEMPLATE REVIEWS OPERATIONS ======

  async createTemplateReview(data: CreateTemplateReview, userId: string): Promise<TemplateReview> {
    const template = await this.templateDAO.getTemplate(data.template_id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if user has access to template
    const userWorkspaces = await this.getUserWorkspaceIds(userId);
    if (!canUserAccessTemplate(template, userId, userWorkspaces)) {
      throw new Error('Access denied to template');
    }

    // Check if user has used the template (for verified reviews)
    // This could be implemented by checking template_usages table

    const review = await this.templateDAO.createTemplateReview(data, userId);

    // Send notification to template creator (if different user)
    if (template.created_by !== userId && this.options.sendNotification) {
      await this.options.sendNotification(template.created_by, {
        type: 'template_review',
        title: 'New review on your template',
        message: `${userId} left a ${data.rating}-star review on "${template.name}"`,
        template_id: template.id,
        review_id: review.id
      });
    }

    return review;
  }

  async getTemplateReviews(
    templateId: string,
    filter: TemplateReviewFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<TemplateReviewWithAuthor>> {
    const filterWithTemplate = { ...filter, template_id: templateId };
    return this.templateDAO.getTemplateReviews(filterWithTemplate, pagination);
  }

  // ====== TEMPLATE FAVORITES OPERATIONS ======

  async addTemplateFavorite(templateId: string, userId: string): Promise<TemplateFavorite> {
    const template = await this.templateDAO.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check access
    const userWorkspaces = await this.getUserWorkspaceIds(userId);
    if (!canUserAccessTemplate(template, userId, userWorkspaces)) {
      throw new Error('Access denied to template');
    }

    return this.templateDAO.addTemplateFavorite(templateId, userId, template.workspace_id);
  }

  async removeTemplateFavorite(templateId: string, userId: string): Promise<boolean> {
    return this.templateDAO.removeTemplateFavorite(templateId, userId);
  }

  async getUserFavoriteTemplates(
    userId: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ProjectTemplateWithStats>> {
    return this.templateDAO.getUserFavoriteTemplates(userId, pagination);
  }

  // ====== TEMPLATE CATEGORIES OPERATIONS ======

  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return this.templateDAO.getTemplateCategories();
  }

  // ====== ANALYTICS AND REPORTING ======

  async getTemplateAnalytics(templateId: string, userId: string, days = 30): Promise<TemplateAnalytics> {
    const template = await this.templateDAO.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check permissions - only creator or workspace admin can view analytics
    if (template.created_by !== userId) {
      if (template.workspace_id && this.options.checkWorkspaceAccess) {
        const hasAccess = await this.options.checkWorkspaceAccess(template.workspace_id, userId, 1); // WORKSPACE_READ permission
        if (!hasAccess) {
          throw new Error('Access denied to template analytics');
        }
      } else {
        throw new Error('Access denied to template analytics');
      }
    }

    return this.templateDAO.getTemplateAnalytics(templateId, days);
  }

  // ====== TEMPLATE EXPORT/IMPORT ======

  async exportTemplate(
    templateId: string,
    userId: string,
    format: 'json' | 'yaml' | 'zip' = 'json',
    includeAnalytics = false
  ): Promise<TemplateExport> {
    const template = await this.templateDAO.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check access
    const userWorkspaces = await this.getUserWorkspaceIds(userId);
    if (!canUserAccessTemplate(template, userId, userWorkspaces)) {
      throw new Error('Access denied to template');
    }

    const exportData: TemplateExport = {
      metadata: {
        template_id: template.id,
        name: template.name,
        version: template.version,
        exported_at: new Date().toISOString(),
        exported_by: userId,
        export_format: format
      },
      template
    };

    // Include analytics if requested and user has permission
    if (includeAnalytics && (template.created_by === userId || template.workspace_id)) {
      try {
        exportData.usage_analytics = await this.templateDAO.getTemplateAnalytics(templateId);
      } catch (error) {
        console.warn('Failed to include analytics in export:', error);
      }
    }

    // Record download for analytics
    await this.recordTemplateDownload(templateId, userId, format);

    return exportData;
  }

  async importTemplate(
    templateData: TemplateExport,
    userId: string,
    workspaceId?: string
  ): Promise<ProjectTemplate> {
    const createData: CreateProjectTemplate = {
      ...templateData.template,
      workspace_id: workspaceId,
      name: `${templateData.template.name} (Imported)`,
      version: '1.0.0' // Reset version for imported template
    };

    // Remove id and other auto-generated fields
    delete (createData as any).id;
    delete (createData as any).created_at;
    delete (createData as any).updated_at;
    delete (createData as any).usage_count;
    delete (createData as any).rating_average;
    delete (createData as any).rating_count;

    return this.createTemplate(createData, userId);
  }

  // ====== HELPER METHODS ======

  private async getUserWorkspaceIds(userId: string): Promise<string[]> {
    try {
      const result = await this.workspaceDAO.getWorkspacesForUser(userId);
      return result.data.map(w => w.id);
    } catch (error) {
      console.warn('Failed to get user workspaces:', error);
      return [];
    }
  }

  private async recordTemplateDownload(
    _____templateId: string,
    _____userId: string,
    _____format: 'json' | 'yaml' | 'zip'
  ): Promise<void> {
    // This would be implemented to track downloads for analytics
    // For now, we'll skip the implementation
  }

  private validateTemplateForPublishing(template: ProjectTemplate): string[] {
    const errors: string[] = [];

    // Basic validation
    if (!template.name.trim()) {
      errors.push('Template name is required');
    }

    if (!template.description || template.description.trim().length < 20) {
      errors.push('Template description must be at least 20 characters');
    }

    if (!template.template_data || Object.keys(template.template_data).length === 0) {
      errors.push('Template data is required');
    }

    if (template.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    if (!template.thumbnail_url) {
      errors.push('Template thumbnail is required for publishing');
    }

    // Validate customizable fields
    const customizableFields = template.customizable_fields as Record<string, any>;
    for (const [fieldName, fieldDef] of Object.entries(customizableFields)) {
      if (!fieldDef.type) {
        errors.push(`Customizable field '${fieldName}' is missing type`);
      }
      if (!fieldDef.label) {
        errors.push(`Customizable field '${fieldName}' is missing label`);
      }
    }

    return errors;
  }
}