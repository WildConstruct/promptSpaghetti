/**
 * Template Version Manager
 * Enhanced versioning system for templates with advanced import/export capabilities
 */
export class TemplateVersionManager {
    apiClient;
    templateId;
    userId;
    versions = new Map();
    branches = new Map();
    constructor(apiClient, templateId, userId) {
        this.apiClient = apiClient;
        this.templateId = templateId;
        this.userId = userId;
    }
    // Version Management
    async createVersion(template, options = {}) {
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
                visibility: 'workspace'
            };
            const response = await this.apiClient.post('/api/template-versions', versionData);
            const version = response.data;
            this.versions.set(version.id, version);
            return version;
        }
        catch (error) {
            console.error('Failed to create template version:', error);
            throw error;
        }
    }
    async publishVersion(versionId, options = {}) {
        try {
            const response = await this.apiClient.put(`/api/template-versions/${versionId}/publish`, {
                release_notes: options.release_notes,
                visibility: options.visibility || 'public'
            });
            const version = response.data;
            this.versions.set(versionId, version);
            return version;
        }
        catch (error) {
            console.error('Failed to publish template version:', error);
            throw error;
        }
    }
    async getVersions(options = {}) {
        try {
            const params = new URLSearchParams();
            params.append('template_id', this.templateId);
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
            const response = await this.apiClient.get(`/api/template-versions?${params}`);
            const result = response.data;
            result.versions.forEach((version) => {
                this.versions.set(version.id, version);
            });
            return result;
        }
        catch (error) {
            console.error('Failed to get template versions:', error);
            throw error;
        }
    }
    async getVersion(versionId) {
        try {
            if (this.versions.has(versionId)) {
                return this.versions.get(versionId);
            }
            const response = await this.apiClient.get(`/api/template-versions/${versionId}`);
            const version = response.data;
            this.versions.set(versionId, version);
            return version;
        }
        catch (error) {
            console.error('Failed to get template version:', error);
            throw error;
        }
    }
    async compareVersions(fromVersionId, toVersionId) {
        try {
            const response = await this.apiClient.get(`/api/template-versions/${fromVersionId}/compare/${toVersionId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to compare template versions:', error);
            throw error;
        }
    }
    // Advanced Import System
    async importTemplate(options) {
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
            }
            // Add import options
            formData.append('format', options.format);
            formData.append('template_id', this.templateId);
            formData.append('options', JSON.stringify(options));
            const response = await this.apiClient.post('/api/template-versions/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const result = response.data;
            // Update local cache
            if (result.success && result.imported_version) {
                this.versions.set(result.imported_version.id, result.imported_version);
            }
            return result;
        }
        catch (error) {
            console.error('Failed to import template:', error);
            throw error;
        }
    }
    async importFromGit(gitUrl, options) {
        try {
            const importData = {
                git_url: gitUrl,
                branch: options.branch || 'main',
                commit: options.commit,
                credentials: options.credentials,
                template_id: this.templateId,
                options: options.import_options
            };
            const response = await this.apiClient.post('/api/template-versions/import-git', importData);
            const result = response.data;
            if (result.success && result.imported_version) {
                this.versions.set(result.imported_version.id, result.imported_version);
            }
            return result;
        }
        catch (error) {
            console.error('Failed to import template from Git:', error);
            throw error;
        }
    }
    async importFromMarketplace(marketplaceId, options) {
        try {
            const importData = {
                marketplace_id: marketplaceId,
                version: options.version || 'latest',
                auto_update: options.auto_update || false,
                include_dependencies: options.include_dependencies || true,
                template_id: this.templateId
            };
            const response = await this.apiClient.post('/api/template-versions/import-marketplace', importData);
            const result = response.data;
            if (result.success && result.imported_version) {
                this.versions.set(result.imported_version.id, result.imported_version);
            }
            return result;
        }
        catch (error) {
            console.error('Failed to import template from marketplace:', error);
            throw error;
        }
    }
    // Advanced Export System  
    async exportTemplate(versionId, options) {
        try {
            const exportData = {
                version_id: versionId,
                template_id: this.templateId,
                options
            };
            const response = await this.apiClient.post('/api/template-versions/export', exportData, {
                responseType: options.format === 'template_bundle' ? 'blob' : 'json'
            });
            if (options.format === 'template_bundle') {
                // Return file data for client-side download
                return {
                    file_data: response.data,
                    filename: options.filename || `template-${versionId}.bundle`,
                    size: response.data.byteLength,
                    checksum: await this.calculateChecksum(response.data)
                };
            }
            else {
                // Return download URL for server-hosted file
                return response.data;
            }
        }
        catch (error) {
            console.error('Failed to export template:', error);
            throw error;
        }
    }
    async exportVersionHistory(options = {}) {
        try {
            const exportData = {
                template_id: this.templateId,
                options
            };
            const response = await this.apiClient.post('/api/template-versions/export-history', exportData);
            return response.data;
        }
        catch (error) {
            console.error('Failed to export version history:', error);
            throw error;
        }
    }
    // Dependency Management
    async checkDependencies(versionId) {
        try {
            const response = await this.apiClient.get(`/api/template-versions/${versionId}/dependencies`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to check dependencies:', error);
            throw error;
        }
    }
    async resolveDependencies(versionId, options) {
        try {
            const response = await this.apiClient.post(`/api/template-versions/${versionId}/resolve-dependencies`, options);
            return response.data;
        }
        catch (error) {
            console.error('Failed to resolve dependencies:', error);
            throw error;
        }
    }
    // Migration and Compatibility
    async generateMigrationScript(fromVersionId, toVersionId) {
        try {
            const response = await this.apiClient.get(`/api/template-versions/${fromVersionId}/migration/${toVersionId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to generate migration script:', error);
            throw error;
        }
    }
    async applyMigration(versionId, migrationScript) {
        try {
            const response = await this.apiClient.post(`/api/template-versions/${versionId}/migrate`, {
                migration_script: migrationScript
            });
            const result = response.data;
            if (result.success && result.new_version_id) {
                // Refresh version data
                await this.getVersion(result.new_version_id);
            }
            return result;
        }
        catch (error) {
            console.error('Failed to apply migration:', error);
            throw error;
        }
    }
    // Utility Methods
    generateNextVersion() {
        const versions = Array.from(this.versions.values())
            .filter(v => v.template_id === this.templateId)
            .map(v => v.version_number)
            .sort(this.compareVersions.bind(this));
        if (versions.length === 0) {
            return '1.0.0';
        }
        const latest = versions[versions.length - 1];
        const parts = latest.split('.').map(Number);
        parts[2]++; // Increment patch version
        return parts.join('.');
    }
    compareVersions(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) {
                return aVal - bVal;
            }
        }
        return 0;
    }
    getCurrentApiVersion() {
        return '2.0.0'; // Current API version
    }
    async calculateChecksum(data) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
