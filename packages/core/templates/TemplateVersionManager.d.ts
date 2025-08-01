/**
 * Template Version Manager
 * Enhanced versioning system for templates with advanced import/export capabilities
 */
import { ProjectTemplate, TemplateVariable, CustomizationPoint } from './ProjectTemplateManager';

}
}
export interface TemplateVersion { id: string;
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
    dependencies: TemplateDependency[];
    conflicts: TemplateConflict[] }
}
}
export interface TemplateDependency { template_id: string;
    version_constraint: string;
    dependency_type: 'required' | 'optional' | 'peer';
    description?: string }
}
}
export interface TemplateConflict { template_id: string;
    conflict_type: 'api_version' | 'node_type' | 'variable_name' | 'resource';
    description: string;
    severity: 'warning' | 'error' }
}
}
export interface TemplateImportOptions { format: 'json' | 'yaml' | 'zip' | 'git' | 'template_bundle';
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
    tags?: string[] }
}
}
export interface TemplateExportOptions { format: 'json' | 'yaml' | 'zip' | 'template_bundle';
    include_version_history?: boolean;
    include_dependencies?: boolean;
    include_analytics?: boolean;
    include_reviews?: boolean;
    version_id?: string;
    version_range?: string;
    include_branches?: string[];
    bundle_dependencies?: boolean;
    bundle_assets?: boolean;
    compress?: boolean;
    filename?: string;
    metadata?: Record<string, any>;
    encryption?: {
        enabled: boolean;
        password?: string;
        algorithm?: string }
}
    };

}
}
export interface TemplateImportResult { success: boolean;
    imported_version: TemplateVersion;
    warnings: string[];
    errors: string[];
    original_version?: string;
    new_version: string;
    changes_detected: number;
    conflicts_resolved: number;
    dependencies_updated: number;
    migration_applied: boolean;
    migration_log?: string[];
    backup_version_id?: string;
    can_rollback: boolean }
}
}
export interface VersionComparisonResult { from_version: TemplateVersion;
    to_version: TemplateVersion;
    diff: TemplateDiff;
    compatibility: {
        breaking_changes: boolean;
        api_changes: boolean;
        schema_changes: boolean;
        dependency_changes: boolean }
}
    };
    migration_required: boolean;
    migration_complexity: 'simple' | 'moderate' | 'complex';
    estimated_migration_time: number;

}
}
export interface TemplateDiff {
    metadata_changes: Array<{
        field: string;
        old_value: any;
        new_value: any;
        change_type: 'added' | 'removed' | 'modified'
}
}
  }>;
    variable_changes: Array<{ variable_id: string;
        change_type: 'added' | 'removed' | 'modified';
        old_variable?: TemplateVariable;
        new_variable?: TemplateVariable }>;
    customization_changes: Array<{ point_id: string;
        change_type: 'added' | 'removed' | 'modified';
        old_point?: CustomizationPoint;
        new_point?: CustomizationPoint }>;
    graph_changes: { nodes_added: number;
        nodes_removed: number;
        nodes_modified: number;
        edges_added: number;
        edges_removed: number;
        edges_modified: number };

export declare class TemplateVersionManager {
    private apiClient;
    private templateId;
    private userId;
    private versions;
    private branches;
    constructor(apiClient: any, templateId: string, userId: string);
    createVersion(template: ProjectTemplate, options?: {)
        version_number?: string;
        version_tag?: string;
        title?: string;
        description?: string;
        changelog?: string;
        branch_name?: string;
        compatibility_level?: 'patch' | 'minor' | 'major'
  }): Promise<TemplateVersion>;
    publishVersion(versionId: string, options?: {)
        release_notes?: string;
        visibility?: 'private' | 'workspace' | 'public'
  }): Promise<TemplateVersion>;
    getVersions(options?: { )
        include_drafts?: boolean;
        branch_name?: string;
        limit?: number;
        offset?: number }): Promise<{ versions: TemplateVersion[];
        total: number }>;
    getVersion(versionId: string): Promise<TemplateVersion>;
    importTemplate(options: TemplateImportOptions): Promise<TemplateImportResult>;
    importFromGit(gitUrl: string, options: { )
        branch?: string;
        commit?: string;
        credentials?: {
            username?: string;
            token?: string };
        import_options?: Partial<TemplateImportOptions>;
    }): Promise<TemplateImportResult>;
    importFromMarketplace(marketplaceId: string, options: { )
        version?: string;
        auto_update?: boolean;
        include_dependencies?: boolean }): Promise<TemplateImportResult>;
    exportTemplate(versionId: string, options: TemplateExportOptions): Promise<{ download_url?: string;
        file_data?: ArrayBuffer;
        filename: string;
        size: number;
        checksum: string }>;
    exportVersionHistory(options?: { )
        branch_name?: string;
        start_version?: string;
        end_version?: string;
        format?: 'json' | 'csv' | 'timeline';
        include_diffs?: boolean }): Promise<{ download_url: string;
        filename: string }>;
    checkDependencies(versionId: string): Promise<{ satisfied: boolean;
        missing: TemplateDependency[];
        conflicts: TemplateConflict[];
        recommendations: Array<{
            template_id: string;
            recommended_version: string;
            reason: string }>;
    }>;
    resolveDependencies(versionId: string, options: {)
        auto_install?: boolean;
        update_strategy?: 'conservative' | 'latest' | 'compatible'
  }): Promise<{ resolved: TemplateDependency[];
        installed: string[];
        updated: string[];
        conflicts: TemplateConflict[] }>;
    generateMigrationScript(fromVersionId: string, toVersionId: string): Promise<{ script: string;
        instructions: string;
        complexity: 'simple' | 'moderate' | 'complex';
        estimated_time: number;
        breaking_changes: Array<{
            type: string;
            description: string;
            action_required: string }>;
    }>;
    applyMigration(versionId: string, migrationScript: string): Promise<{ success: boolean;
        new_version_id: string;
        migration_log: string[];
        rollback_script?: string }>;
    private generateNextVersion;
    private getCurrentApiVersion;
    private calculateChecksum;

}
}
export interface TemplateBundle { format_version: string;
    created_at: string;
    created_by: string;
    template: TemplateVersion;
    dependencies: TemplateVersion[];
    related_templates: TemplateVersion[];
    assets: Array<{
        type: 'image' | 'document' | 'config' | 'script';
        filename: string;
        data: ArrayBuffer | string;
        mime_type: string }
}
    }>;
    documentation: { readme: string;
        changelog: string;
        api_docs?: string;
        examples?: Array<{
            name: string;
            description: string;
            graph_data: any }>;
    };
    checksums: Record<string, string>;
    signature?: string;

//# sourceMappingURL=TemplateVersionManager.d.ts.map