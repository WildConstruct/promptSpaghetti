visibility: 'private' | 'workspace' | 'public';
// Analytics
download_count: number;
usage_count: number;
rating: number;
// Dependencies and conflicts
dependencies: TemplateDependency;
conflicts: TemplateConflict;
source: string | File | ArrayBuffer;
// Import behavior
merge_strategy ?  : 'replace' | 'merge' | 'keep_both';
resolve_conflicts ?  : 'auto' | 'manual' | 'skip';
update_dependencies ?  : boolean;
create_backup ?  : boolean;
// Version handling
version_bump ?  : 'patch' | 'minor' | 'major' | 'custom';
custom_version ?  : string;
branch_name ?  : string;
// Validation
validate_schema ?  : boolean;
validate_dependencies ?  : boolean;
validate_compatibility ?  : boolean;
// Metadata
import_notes ?  : string;
tags ?  : string;
;
;
migration_required: boolean;
migration_complexity: 'simple' | 'moderate' | 'complex';
estimated_migration_time: number; // minutes
    > ;
variable_changes: Array < {
    variable_id: string,
    change_type: 'added' | 'removed' | 'modified',
    old_variable: TemplateVariable,
    new_variable: TemplateVariable } > ;
customization_changes: Array < {
    point_id: string,
    change_type: 'added' | 'removed' | 'modified',
    old_point: CustomizationPoint,
    new_point: CustomizationPoint } > ;
graph_changes: {
    nodes_added: number;
    nodes_removed: number;
    nodes_modified: number;
    edges_added: number;
    edges_removed: number;
    edges_modified: number;
}
;
export class TemplateVersionManager {
    versions = new Map();
    branches = new Map();
    apiClient;
    templateId;
}
userId: string;
{ }
// Version Management
async;
createVersion(template, ProjectTemplate);
options: {
    version_number ?  : string;
    version_tag ?  : string;
    title ?  : string;
    description ?  : string;
    changelog ?  : string;
    branch_name ?  : string;
    compatibility_level ?  : 'patch' | 'minor' | 'major';
}
{ }
Promise < TemplateVersion > { try: {
        const: versionData = {
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
            visibility: 'workspace'
        }
    },
    const: response = await this.apiClient.post('/api/template-versions', versionData),
    const: version = response.data,
    this: .versions.set(version.id, version),
    return: version,
    catch(error) {
        console.error('Failed to create template version:', error);
        throw error;
        async;
        publishVersion(versionId, string, options, {});
        release_notes ?  : string;
        visibility ?  : 'private' | 'workspace' | 'public';
    } };
{ }
Promise < TemplateVersion > {
    try: {
        const: response = await this.apiClient.put(`/api/template-versions/${versionId}/publish`, {})
    },
    release_notes: options.release_notes,
    visibility: options.visibility || 'public'
};
;
const version = response.data;
this.versions.set(versionId, version);
return version;
try {
}
catch (error) {
    console.error('Failed to publish template version:', error);
    throw error;
    async;
    getVersions(options, {});
}
include_drafts ?  : boolean;
branch_name ?  : string;
limit ?  : number;
offset ?  : number;
{ }
Promise < { versions: TemplateVersion, total: number } > { try: {
        const: params = new URLSearchParams(),
        params, : .append('template_id', this.templateId),
        Object, : .entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, String(value));
            }
        }),
        const: response = await this.apiClient.get(`/api/template-versions?${params}`)
    },
    const: result = response.data,
    result, : .versions.forEach((version) => { this.versions.set(version.id, version); }),
    return: result,
    catch(error) {
        console.error('Failed to get template versions:', error);
        throw error;
        async;
        getVersion(versionId, string);
        Promise < TemplateVersion > {
            try: {
                : .versions.has(versionId)
            }
        };
        {
            return this.versions.get(versionId);
            const response = await this.apiClient.get(`/api/template-versions/${versionId}`);
        }
        const version = response.data;
        this.versions.set(versionId, version);
        return version;
        try {
        }
        catch (error) {
            console.error('Failed to get template version:', error);
            throw error;
            async;
            compareVersions(fromVersionId, string, toVersionId, string);
            Promise < VersionComparisonResult > {
                try: {
                    const: response = await this.apiClient.get()
                } `/api/template-versions/${fromVersionId}/compare/${toVersionId}`
            };
            ;
            return response.data;
            try {
            }
            catch (error) {
                console.error('Failed to compare template versions:', error);
                throw error;
                // Advanced Import System
                async;
                importTemplate(options, TemplateImportOptions);
                Promise < TemplateImportResult > {};
                try {
                    const formData = new FormData();
                    // Handle different source types
                    if (typeof options.source === 'string') {
                        formData.append('source_url', options.source);
                    }
                    else if (options.source instanceof File) {
                        formData.append('source_file', options.source);
                    }
                    else if (options.source instanceof ArrayBuffer) {
                        const blob = new Blob([options.source]);
                        formData.append('source_data', blob);
                        // Add import options
                        formData.append('format', options.format);
                        formData.append('template_id', this.templateId);
                        formData.append('options', JSON.stringify(options));
                        const response = await this.apiClient.post('/api/template-versions/import', formData, {});
                        headers: {
                            'Content-Type';
                            'multipart/form-data';
                        }
                    }
                    ;
                    const result = response.data;
                    // Update local cache
                    if (result.success && result.imported_version) {
                        this.versions.set(result.imported_version.id, result.imported_version);
                        return result;
                    }
                    try { }
                    catch (error) {
                        console.error('Failed to import template:', error);
                        throw error;
                        async;
                        importFromGit(gitUrl, string, options, {});
                        branch ?  : string;
                        commit ?  : string;
                        credentials ?  : {};
                        username ?  : string;
                        token ?  : string;
                    }
                    ;
                    import_options ?  : Partial;
                }
                finally { }
                Promise < TemplateImportResult > { try: {
                        const: importData = {
                            git_url: gitUrl,
                            branch: options.branch || 'main',
                            commit: options.commit,
                            credentials: options.credentials,
                            template_id: this.templateId,
                            options: options.import_options
                        }
                    },
                    const: response = await this.apiClient.post('/api/template-versions/import-git', importData),
                    const: result = response.data,
                    if(result) { }, : .success && result.imported_version };
                {
                    this.versions.set(result.imported_version.id, result.imported_version);
                    return result;
                }
                try { }
                catch (error) {
                    console.error('Failed to import template from Git:', error);
                    throw error;
                    async;
                    importFromMarketplace(marketplaceId, string, options, {});
                }
                version ?  : string;
                auto_update ?  : boolean;
                include_dependencies ?  : boolean;
            }
            Promise < TemplateImportResult > { try: {
                    const: importData = {
                        marketplace_id: marketplaceId,
                        version: options.version || 'latest',
                        auto_update: options.auto_update || false,
                        include_dependencies: options.include_dependencies || true,
                        template_id: this.templateId
                    }
                },
                const: response = await this.apiClient.post('/api/template-versions/import-marketplace', importData),
                const: result = response.data,
                if(result) { }, : .success && result.imported_version };
            {
                this.versions.set(result.imported_version.id, result.imported_version);
                return result;
            }
            try { }
            catch (error) {
                console.error('Failed to import template from marketplace:', error);
                throw error;
                // Advanced Export System
                async;
                exportTemplate(versionId, string, options, TemplateExportOptions);
                Promise < {};
                download_url ?  : string;
                file_data ?  : ArrayBuffer;
                filename: string;
                size: number;
                checksum: string;
                    > { try: {
                            const: exportData = {
                                version_id: versionId,
                                template_id: this.templateId
                            },
                            options
                        },
                        const: response = await this.apiClient.post('/api/template-versions/export', exportData, {}),
                        responseType: options.format === 'template_bundle' ? 'blob' : 'json' };
            }
            ;
            if (options.format === 'template_bundle') { // Return file data for client-side download
                return {
                    file_data: response.data
                };
                filename: options.filename || `template-${versionId}.bundle`;
            }
        }
        size: response.data.byteLength,
            checksum;
        await this.calculateChecksum(response.data);
    },
    else: {
        return: response.data
    }, catch(error) {
        console.error('Failed to export template:', error);
        throw error;
        async;
        exportVersionHistory(options, {});
    },
    branch_name: string,
    start_version: string,
    end_version: string,
    format: 'json' | 'csv' | 'timeline',
    include_diffs: boolean };
{ }
Promise < { download_url: string,
    filename: string } > { try: {
        const: exportData = {
            template_id: this.templateId
        },
        options
    },
    const: response = await this.apiClient.post('/api/template-versions/export-history', exportData),
    return: response.data,
    catch(error) {
        console.error('Failed to export version history:', error);
        throw error;
        // Dependency Management
        async;
        checkDependencies(versionId, string);
        Promise < {
            satisfied: boolean,
            missing: TemplateDependency,
            conflicts: TemplateConflict,
            recommendations: Array < {},
            template_id: string,
            recommended_version: string,
            reason: string }
            > ;
            > {
                try: {
                    const: response = await this.apiClient.get(`/api/template-versions/${versionId}/dependencies`)
                },
                return: response.data,
                catch(error) {
                    console.error('Failed to check dependencies:', error);
                    throw error;
                    async;
                    resolveDependencies(versionId, string, options, {}),
                        auto_install ?  : boolean;
                    update_strategy ?  : 'conservative' | 'latest' | 'compatible';
                }
            };
        Promise < { resolved: TemplateDependency,
            installed: string,
            updated: string,
            conflicts: TemplateConflict } > {
            try: {
                const: response = await this.apiClient.post(`/api/template-versions/${versionId}/resolve-dependencies`, options)
            },
            return: response.data,
            catch(error) {
                console.error('Failed to resolve dependencies:', error);
                throw error;
                // Migration and Compatibility
                async;
                generateMigrationScript(fromVersionId, string, toVersionId, string);
                Promise < {
                    script: string,
                    instructions: string,
                    complexity: 'simple' | 'moderate' | 'complex',
                    estimated_time: number,
                    breaking_changes: Array < {},
                    type: string,
                    description: string,
                    action_required: string }
                    > ;
                    > {
                        try: {
                            const: response = await this.apiClient.get()
                        } `/api/template-versions/${fromVersionId}/migration/${toVersionId}`
                    };
                ;
                return response.data;
                try {
                }
                catch (error) {
                    console.error('Failed to generate migration script:', error);
                    throw error;
                    async;
                    applyMigration(versionId, string, migrationScript, string);
                    Promise < {};
                    success: boolean;
                    new_version_id: string;
                    migration_log: string;
                    rollback_script ?  : string;
                        > {
                            try: {
                                const: response = await this.apiClient.post(`/api/template-versions/${versionId}/migrate`, {})
                            }
                        },
                        migration_script;
                    migrationScript;
                }
                ;
                const result = response.data;
                if (result.success && result.new_version_id) { // Refresh version data
                    await this.getVersion(result.new_version_id);
                    return result;
                }
                try { }
                catch (error) {
                    console.error('Failed to apply migration:', error);
                    throw error;
                    // Utility Methods
                }
                // Utility Methods
            }
            // Utility Methods
            ,
            // Utility Methods
            generateNextVersion() {
                const versions = Array.from(this.versions.values());
            },
            : 
                .filter(v => v.template_id === this.templateId)
                .map(v => v.version_number)
                .sort(this.compareVersions.bind(this)),
            if(versions) { }, : .length === 0
        };
        {
            return '1.0.0';
            const latest = versions[versions.length - 1];
            const parts = latest.split('.').map(Number);
            parts[2]++; // Increment patch version
            return parts.join('.');
        }
    },
    compareVersions(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) {
                return aVal - bVal;
                return 0;
            }
        }
    },
    getCurrentApiVersion() {
        return '2.0.0';
    } // Current API version
    , // Current API version
    async calculateChecksum(data) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        mime_type: string;
            > ;
        // Metadata and documentation
        documentation: {
            readme: string;
            changelog: string;
            api_docs ?  : string;
            examples ?  : Array < {};
            name: string;
            description: string;
            graph_data: any;
                > ;
        }
        ;
        // Verification
        checksums: Record;
        signature ?  : string;
    } };
