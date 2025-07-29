/**
 * Template Version Manager
 * Enhanced versioning system for templates with advanced import/export capabilities
 */
import { ProjectTemplate, TemplateVariable, CustomizationPoint } from './ProjectTemplateManager';
import { VersionSnapshot, Branch, VersionDiff } from '../version-history/VersionHistoryManager';

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: string; // Semantic version (e.g., "1.2.0"),
  version_tag?: string; // Human-readable tag (e.g., "stable", "beta"),
  // Template state at this version
  template_data: ProjectTemplate;
  // Version metadata
  title?: string;
  description?: string;
  changelog?: string;
  release_notes?: string;
  // Versioning information
  parent_version_id?: string;
  branch_name: string;
  commit_hash: string;
  // Compatibility and migration
  api_version: string;
  compatibility_level: 'patch' | 'minor' | 'major';
  migration_required: boolean;
  migration_script?: string;
  // Author and timing
  created_by: string;
  created_at: string;
  published_at?: string;
  deprecated_at?: string;
  // Status and lifecycle
  status: 'draft' | 'review' | 'published' | 'deprecated' | 'archived';
  visibility: 'private' | 'workspace' | 'public';
  // Analytics
  download_count: number;
  usage_count: number;
  rating: number;
  // Dependencies and conflicts
  dependencies: TemplateDependency;
  conflicts: TemplateConflict;
}
export interface TemplateDependency {
  template_id: string;
  version_constraint: string; // e.g., ">=1.0.0, <2.0.0",
  dependency_type: 'required' | 'optional' | 'peer';
  description?: string;
}
export interface TemplateConflict {
  template_id: string;
  conflict_type: 'api_version' | 'node_type' | 'variable_name' | 'resource';
  description: string;
  severity: 'warning' | 'error'
  }
export interface TemplateImportOptions {
  format: 'json' | 'yaml' | 'zip' | 'git' | 'template_bundle';
  source: string | File | ArrayBuffer;
  // Import behavior
  merge_strategy?: 'replace' | 'merge' | 'keep_both';
  resolve_conflicts?: 'auto' | 'manual' | 'skip';
  update_dependencies?: boolean;
  create_backup?: boolean;
  // Version handling
  version_bump?: 'patch' | 'minor' | 'major' | 'custom';
  custom_version?: string;
  branch_name?: string;
  // Validation
  validate_schema?: boolean;
  validate_dependencies?: boolean;
  validate_compatibility?: boolean;
  // Metadata
  import_notes?: string;
  tags?: string;
}
export interface TemplateExportOptions {
  format: 'json' | 'yaml' | 'zip' | 'template_bundle';
  // Export scope
  include_version_history?: boolean;
  include_dependencies?: boolean;
  include_analytics?: boolean;
  include_reviews?: boolean;
  // Version selection
  version_id?: string;
  version_range?: string; // e.g., "1.x.x" or ">=1.0.0",
  include_branches?: string;
  // Bundle options
  bundle_dependencies?: boolean;
  bundle_assets?: boolean;
  compress?: boolean;
  // Output customization
  filename?: string;
  metadata?: Record<string, any>;
  encryption?: {
  enabled: boolean;
  password?: string;
  algorithm?: string;
};
}
export interface TemplateImportResult {
  success: boolean;
  imported_version: TemplateVersion;
  warnings: string;
  errors: string;
  // Import details
  original_version?: string;
  new_version: string;
  changes_detected: number;
  conflicts_resolved: number;
  dependencies_updated: number;
  // Migration info
  migration_applied: boolean;
  migration_log?: string;
  // Rollback info
  backup_version_id?: string;
  can_rollback: boolean;
}
export interface VersionComparisonResult {
  from_version: TemplateVersion;
  to_version: TemplateVersion;
  diff: TemplateDiff;
  compatibility: {
  breaking_changes: boolean;
  api_changes: boolean;
  schema_changes: boolean;
  dependency_changes: boolean;
};
  migration_required: boolean;
  migration_complexity: 'simple' | 'moderate' | 'complex';
  estimated_migration_time: number; // minutes
}
export interface TemplateDiff {
  metadata_changes: Array<{,
  field: string;
  old_value: any;
  new_value: any;
  change_type: 'added' | 'removed' | 'modified'
  }>;
  variable_changes: Array<{,
  variable_id: string;
  change_type: 'added' | 'removed' | 'modified';
  old_variable?: TemplateVariable;
  new_variable?: TemplateVariable;
}>;
  customization_changes: Array<{,
  point_id: string;
  change_type: 'added' | 'removed' | 'modified';
  old_point?: CustomizationPoint;
  new_point?: CustomizationPoint;
}>;
  graph_changes: {
  nodes_added: number;
  nodes_removed: number;
  nodes_modified: number;
  edges_added: number;
  edges_removed: number;
  edges_modified: number;
};
}
export class TemplateVersionManager {
  private versions = new Map<string, TemplateVersion>();
  private branches = new Map<string, Branch>();
  constructor();
    private apiClient: any,
    private templateId: string,
    private userId: string
  ) {}
  // Version Management
  async createVersion(template: ProjectTemplate)
    options: {
  version_number?: string;
  version_tag?: string;
  title?: string;
  description?: string;
  changelog?: string;
  branch_name?: string;
  compatibility_level?: 'patch' | 'minor' | 'major'
  } = {}
  ): Promise<TemplateVersion> {
  try {
  const versionData = {
  template_id: this.templateId,
  template_data: template,
  version_number: options.version_number || this.generateNextVersion(),
  version_tag: options.version_tag,
  title: options.title,
  description: options.description,
  changelog: options.changelog,
  branch_name: options.branch_name || 'main',
  compatibility_level: options.compatibility_level || 'minor',
  api_version: this.getCurrentApiVersion(),
  created_by: this.userId,
  status: 'draft',
  visibility: 'workspace',
};
      const response = await this.apiClient.post('/api/template-versions', versionData);
      const version = response.data;
      this.versions.set(version.id, version);
      return version;
    } catch (error) {
  console.error('Failed to create template version:', error);
  throw error;
  async publishVersion(versionId: string, options: {)
  release_notes?: string;
  visibility?: 'private' | 'workspace' | 'public'
  } = {}): Promise<TemplateVersion> {
    try {
      const response = await this.apiClient.put(`/api/template-versions/${versionId}/publish`, {)}
  },
  release_notes: options.release_notes,
        visibility: options.visibility || 'public'
  });
      const version = response.data;
      this.versions.set(versionId, version);
      return version;
    } catch (error) {
  console.error('Failed to publish template version:', error);
  throw error;
  async getVersions(options: {)
  include_drafts?: boolean;
  branch_name?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ versions: TemplateVersion; total: number }> {
    try {
      const params = new URLSearchParams();
      params.append('template_id', this.templateId);
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
      });
      const response = await this.apiClient.get(`/api/template-versions?${params}`);}
      const result = response.data;
      result.versions.forEach((version: TemplateVersion) => {
        this.versions.set(version.id, version);
      });
      return result;
    } catch (error) {
      console.error('Failed to get template versions:', error);
      throw error;
  async getVersion(versionId: string): Promise<TemplateVersion> {
    try {
      if (this.versions.has(versionId)) {
        return this.versions.get(versionId)!;
      const response = await this.apiClient.get(`/api/template-versions/${versionId}`);}
      const version = response.data;
      this.versions.set(versionId, version);
      return version;
    } catch (error) {
      console.error('Failed to get template version:', error);
      throw error;
  async compareVersions(fromVersionId: string, toVersionId: string): Promise<VersionComparisonResult> {
    try {
      const response = await this.apiClient.get(;);
        `/api/template-versions/${fromVersionId}/compare/${toVersionId}`}
      );
      return response.data;
    } catch (error) {
  console.error('Failed to compare template versions:', error);
  throw error;
  // Advanced Import System
  async importTemplate(options: TemplateImportOptions): Promise<TemplateImportResult> {,
  try {
  const formData = new FormData();
  // Handle different source types
  if (typeof options.source === 'string') {
  formData.append('source_url', options.source);
} else if (options.source instanceof File) {
        formData.append('source_file', options.source);
      } else if (options.source instanceof ArrayBuffer) {
        const blob = new Blob([options.source]);
        formData.append('source_data', blob);
      // Add import options
      formData.append('format', options.format);
      formData.append('template_id', this.templateId);
      formData.append('options', JSON.stringify(options));
      const response = await this.apiClient.post('/api/template-versions/import', formData, {)
  headers: { 'Content-Type': 'multipart/form-data' }
      });
      const result = response.data;
      // Update local cache
      if (result.success && result.imported_version) {
        this.versions.set(result.imported_version.id, result.imported_version);
      return result;
    } catch (error) {
  console.error('Failed to import template:', error);
  throw error;
  async importFromGit(gitUrl: string, options: {)
  branch?: string;
  commit?: string;
  credentials?: {
  username?: string;
  token?: string;
};
    import_options?: Partial<TemplateImportOptions>;
  }): Promise<TemplateImportResult> {
  try {
  const importData = {
  git_url: gitUrl,
  branch: options.branch || 'main',
  commit: options.commit,
  credentials: options.credentials,
  template_id: this.templateId,
  options: options.import_options,
};
      const response = await this.apiClient.post('/api/template-versions/import-git', importData);
      const result = response.data;
      if (result.success && result.imported_version) {
        this.versions.set(result.imported_version.id, result.imported_version);
      return result;
    } catch (error) {
  console.error('Failed to import template from Git:', error);
  throw error;
  async importFromMarketplace(marketplaceId: string, options: {)
  version?: string;
  auto_update?: boolean;
  include_dependencies?: boolean;
}): Promise<TemplateImportResult> {
  try {
  const importData = {
  marketplace_id: marketplaceId,
  version: options.version || 'latest',
  auto_update: options.auto_update || false,
  include_dependencies: options.include_dependencies || true,
  template_id: this.templateId,
};
      const response = await this.apiClient.post('/api/template-versions/import-marketplace', importData);
      const result = response.data;
      if (result.success && result.imported_version) {
        this.versions.set(result.imported_version.id, result.imported_version);
      return result;
    } catch (error) {
  console.error('Failed to import template from marketplace:', error);
  throw error;
  // Advanced Export System
  async exportTemplate(versionId: string, options: TemplateExportOptions): Promise<{,
  download_url?: string;
  file_data?: ArrayBuffer;
  filename: string;
  size: number;
  checksum: string;
}> {
  try {
  const exportData = {
  version_id: versionId,
  template_id: this.templateId,
  options
};
      const response = await this.apiClient.post('/api/template-versions/export', exportData, {)
  responseType: options.format === 'template_bundle' ? 'blob' : 'json',
});
      if (options.format === 'template_bundle') {
        // Return file data for client-side download
        return {
          file_data: response.data,
          filename: options.filename || `template-${versionId}.bundle`}
},
  size: response.data.byteLength,
          checksum: await this.calculateChecksum(response.data);
  };
      } else {
        // Return download URL for server-hosted file
        return response.data;
    } catch (error) {
  console.error('Failed to export template:', error);
  throw error;
  async exportVersionHistory(options: {)
  branch_name?: string;
  start_version?: string;
  end_version?: string;
  format?: 'json' | 'csv' | 'timeline';
  include_diffs?: boolean;
} = {}): Promise<{
  download_url: string;
  filename: string;
}> {
  try {
  const exportData = {
  template_id: this.templateId,
  options
};
      const response = await this.apiClient.post('/api/template-versions/export-history', exportData);
      return response.data;
    } catch (error) {
  console.error('Failed to export version history:', error);
  throw error;
  // Dependency Management
  async checkDependencies(versionId: string): Promise<{,
  satisfied: boolean;
  missing: TemplateDependency;
  conflicts: TemplateConflict;
  recommendations: Array<{,
  template_id: string;
  recommended_version: string;
  reason: string;
}>;
  }> {
    try {
      const response = await this.apiClient.get(`/api/template-versions/${versionId}/dependencies`);}
      return response.data;
    } catch (error) {
  console.error('Failed to check dependencies:', error);
  throw error;
  async resolveDependencies(versionId: string, options: {)
  auto_install?: boolean;
  update_strategy?: 'conservative' | 'latest' | 'compatible'
  }): Promise<{
  resolved: TemplateDependency;
  installed: string;
  updated: string;
  conflicts: TemplateConflict;
}> {
    try {
      const response = await this.apiClient.post(`/api/template-versions/${versionId}/resolve-dependencies`, options);}
      return response.data;
    } catch (error) {
  console.error('Failed to resolve dependencies:', error);
  throw error;
  // Migration and Compatibility
  async generateMigrationScript(fromVersionId: string, toVersionId: string): Promise<{,
  script: string;
  instructions: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimated_time: number;
  breaking_changes: Array<{,
  type: string;
  description: string;
  action_required: string;
}>;
  }> {
    try {
      const response = await this.apiClient.get(;);
        `/api/template-versions/${fromVersionId}/migration/${toVersionId}`}
      );
      return response.data;
    } catch (error) {
  console.error('Failed to generate migration script:', error);
  throw error;
  async applyMigration(versionId: string, migrationScript: string): Promise<{,
  success: boolean;
  new_version_id: string;
  migration_log: string;
  rollback_script?: string;
}> {
    try {
      const response = await this.apiClient.post(`/api/template-versions/${versionId}/migrate`, {)}
  },
  migration_script: migrationScript;
  });
      const result = response.data;
      if (result.success && result.new_version_id) {
        // Refresh version data
        await this.getVersion(result.new_version_id);
      return result;
    } catch (error) {
  console.error('Failed to apply migration:', error);
  throw error;
  // Utility Methods
  private generateNextVersion(): string {,
  const versions = Array.from(this.versions.values());
  .filter(v => v.template_id === this.templateId)
  .map(v => v.version_number)
  .sort(this.compareVersions.bind(this));
  if (versions.length === 0) {
  return '1.0.0';
  const latest = versions[versions.length - 1];
  const parts = latest.split('.').map(Number);
  parts[2]++; // Increment patch version
  return parts.join('.');
  private compareVersions(a: string, b: string): number {,
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
  const aVal = aParts[i] || 0;
  const bVal = bParts[i] || 0;
  if (aVal !== bVal) {
  return aVal - bVal;
  return 0;
  private getCurrentApiVersion(): string {,
  return '2.0.0'; // Current API version
  private async calculateChecksum(data: ArrayBuffer): Promise<string> {,
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // Template Bundle Format
  export interface TemplateBundle {
  format_version: string;
  created_at: string;
  created_by: string;
  // Primary template
  template: TemplateVersion;
  // Dependencies and related templates
  dependencies: TemplateVersion;
  related_templates: TemplateVersion;
  // Assets and resources
  assets: Array<{,
  type: 'image' | 'document' | 'config' | 'script';
  filename: string;
  data: ArrayBuffer | string;
  mime_type: string;
}>;
  // Metadata and documentation
  documentation: {
  readme: string;
  changelog: string;
  api_docs?: string;
  examples?: Array<{,
  name: string;
  description: string;
  graph_data: any;
}>;
  };
  // Verification
  checksums: Record<string, string>;
  signature?: string;
}