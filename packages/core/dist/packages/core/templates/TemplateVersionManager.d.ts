/**
 * Template Version Manager
 * Enhanced versioning system for templates with advanced import/export capabilities
 */
import { ProjectTemplate } from './ProjectTemplateManager';
export interface TemplateVersion {
    id: string;
    template_id: string;
    version_number: string;
    version_tag?: string;
    template_data: ProjectTemplate;
    title?: string;
    description?: string;
    changelog?: string;
    release_notes?: string;
    parent_version_id?: string;
    branch_name: string;
    commit_hash: string;
    api_version: string;
    compatibility_level: 'patch' | 'minor' | 'major';
    migration_required: boolean;
    migration_script?: string;
    created_by: string;
    created_at: string;
    published_at?: string;
    deprecated_at?: string;
    status: 'draft' | 'review' | 'published' | 'deprecated' | 'archived';
    visibility: 'private' | 'workspace' | 'public';
    download_count: number;
    usage_count: number;
    rating: number;
    dependencies: TemplateDependency;
    conflicts: TemplateConflict;
}
export interface TemplateDependency {
    template_id: string;
    version_constraint: string;
    dependency_type: 'required' | 'optional' | 'peer';
    description?: string;
}
export interface TemplateConflict {
    template_id: string;
    conflict_type: 'api_version' | 'node_type' | 'variable_name' | 'resource';
    description: string;
    severity: 'warning' | 'error';
}
export interface TemplateImportOptions {
    format: 'json' | 'yaml' | 'zip' | 'git' | 'template_bundle';
    source: string | File | ArrayBuffer;
    merge_strategy?: 'replace' | 'merge' | 'keep_both';
    resolve_conflicts?: 'auto' | 'manual' | 'skip';
    update_dependencies?: boolean;
    create_backup?: boolean;
    version_bump?: 'patch' | 'minor' | 'major' | 'custom';
    custom_version?: string;
    branch_name?: string;
    validate_schema?: boolean;
    validate_dependencies?: boolean;
    validate_compatibility?: boolean;
    import_notes?: string;
    tags?: string;
}
export interface TemplateExportOptions {
    format: 'json' | 'yaml' | 'zip' | 'template_bundle';
    include_version_history?: boolean;
    include_dependencies?: boolean;
    include_analytics?: boolean;
    include_reviews?: boolean;
    version_id?: string;
    version_range?: string;
    include_branches?: string;
    bundle_dependencies?: boolean;
    bundle_assets?: boolean;
    compress?: boolean;
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
    original_version?: string;
    new_version: string;
    changes_detected: number;
    conflicts_resolved: number;
    dependencies_updated: number;
    migration_applied: boolean;
    migration_log?: string;
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
    estimated_migration_time: number;
}
export interface TemplateDiff {
    metadata_changes: Array<{}, field>;
    string: any;
    old_value: any;
    new_value: any;
    change_type: 'added' | 'removed' | 'modified';
}
export declare class TemplateVersionManager {
    private versions;
    private branches;
    constructor();
    private apiClient;
    private templateId;
    private userId;
}
//# sourceMappingURL=TemplateVersionManager.d.ts.map