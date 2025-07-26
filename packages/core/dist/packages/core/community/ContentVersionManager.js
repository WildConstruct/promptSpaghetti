/**
 * Epic 16 - Content Version Manager
 * Task: E16-1753114247131-3FFAA7 - Implement version control
 *
 * Version control system for community contributions (articles, tutorials, case studies).
 * Adapts the proven TemplateVersionManager pattern for content versioning.
 */
export class ContentVersionManager {
    contentId;
    userId;
    versions = new Map();
    apiClient;
    constructor(apiClient, contentId, userId) {
        this.contentId = contentId;
        this.userId = userId;
        this.apiClient = apiClient;
    }
    // Core Version Management
    async createVersion(content, options = {}) {
        try {
            // Calculate content metrics
            const quality_metrics = await this.calculateQualityMetrics(content);
            const versionData = {
                content_id: this.contentId,
                content_data: content,
                version_number: options.version_number || await this.generateNextVersion(),
                version_tag: options.version_tag,
                title: options.title,
                description: options.description,
                changelog: options.changelog,
                branch_name: options.branch_name || 'main',
                revision_type: options.revision_type || 'minor',
                change_summary: options.change_summary || 'Content update',
                created_by: this.userId,
                status: options.target_status || 'draft',
                visibility: 'team',
                quality_metrics,
                contributors: [{
                        user_id: this.userId,
                        name: '', // Will be populated by API
                        role: 'author',
                        contribution: 'Content creation/update',
                        contribution_date: new Date().toISOString(),
                        attribution_visible: true
                    }]
            };
            const response = await this.apiClient.post('/api/content-versions', versionData);
            const version = response.data;
            this.versions.set(version.id, version);
            return version;
        }
        catch (error) {
            console.error('Failed to create content version:', error);
            throw error;
        }
    }
    async submitForReview(versionId, options = {}) {
        try {
            const response = await this.apiClient.put(`/api/content-versions/${versionId}/submit-review`, {
                reviewer_id: options.reviewer_id,
                review_notes: options.review_notes,
                priority: options.priority || 'normal'
            });
            const version = response.data;
            this.versions.set(versionId, version);
            return version;
        }
        catch (error) {
            console.error('Failed to submit content for review:', error);
            throw error;
        }
    }
    async publishVersion(versionId, options = {}) {
        try {
            const response = await this.apiClient.put(`/api/content-versions/${versionId}/publish`, {
                release_notes: options.release_notes,
                visibility: options.visibility || 'public',
                publish_date: options.publish_date,
                notify_subscribers: options.notify_subscribers || true
            });
            const version = response.data;
            this.versions.set(versionId, version);
            return version;
        }
        catch (error) {
            console.error('Failed to publish content version:', error);
            throw error;
        }
    }
    // Review and Editorial Workflow
    async addReviewFeedback(versionId, feedback) {
        try {
            const response = await this.apiClient.post(`/api/content-versions/${versionId}/feedback`, feedback);
            // Update local version data
            const version = this.versions.get(versionId);
            if (version) {
                version.content_data.editorial.reviewNotes = feedback.comment;
                version.content_data.editorial.lastReview = new Date().toISOString();
            }
            return response.data;
        }
        catch (error) {
            console.error('Failed to add review feedback:', error);
            throw error;
        }
    }
    async resolveFeedback(versionId, feedbackId, resolution) {
        try {
            await this.apiClient.put(`/api/content-versions/${versionId}/feedback/${feedbackId}/resolve`, {
                resolution
            });
            // Update local data
            const version = this.versions.get(versionId);
            if (version && version.review_feedback) {
                const feedback = version.review_feedback.find(f => f.id === feedbackId);
                if (feedback) {
                    feedback.status = 'addressed';
                    feedback.resolution = resolution;
                }
            }
        }
        catch (error) {
            console.error('Failed to resolve feedback:', error);
            throw error;
        }
    }
    async getReviewHistory(versionId) {
        try {
            const response = await this.apiClient.get(`/api/content-versions/${versionId}/reviews`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get review history:', error);
            throw error;
        }
    }
    // Collaboration Features
    async addContributor(versionId, contributor) {
        try {
            await this.apiClient.post(`/api/content-versions/${versionId}/contributors`, {
                ...contributor,
                contribution_date: new Date().toISOString()
            });
            // Update local data
            const version = this.versions.get(versionId);
            if (version) {
                version.contributors.push({
                    ...contributor,
                    contribution_date: new Date().toISOString()
                });
            }
        }
        catch (error) {
            console.error('Failed to add contributor:', error);
            throw error;
        }
    }
    async getCollaborationHistory(contentId) {
        try {
            const targetId = contentId || this.contentId;
            const response = await this.apiClient.get(`/api/content/${targetId}/collaboration-history`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get collaboration history:', error);
            throw error;
        }
    }
    // Content Import/Export
    async importContent(options) {
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
            formData.append('content_id', this.contentId);
            formData.append('options', JSON.stringify(options));
            const response = await this.apiClient.post('/api/content-versions/import', formData, {
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
            console.error('Failed to import content:', error);
            throw error;
        }
    }
    async exportContent(versionId, options) {
        try {
            const exportData = {
                version_id: versionId,
                content_id: this.contentId,
                options
            };
            const response = await this.apiClient.post('/api/content-versions/export', exportData, {
                responseType: options.format === 'content_bundle' ? 'blob' : 'json'
            });
            if (options.format === 'content_bundle') {
                return {
                    file_data: response.data,
                    filename: options.filename || `content-${versionId}.bundle`,
                    size: response.data.byteLength,
                    format: options.format
                };
            }
            else {
                return response.data;
            }
        }
        catch (error) {
            console.error('Failed to export content:', error);
            throw error;
        }
    }
    // Version Comparison and Diff
    async compareVersions(fromVersionId, toVersionId) {
        try {
            const response = await this.apiClient.get(`/api/content-versions/${fromVersionId}/compare/${toVersionId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to compare content versions:', error);
            throw error;
        }
    }
    async getVersionHistory(options = {}) {
        try {
            const params = new URLSearchParams();
            params.append('content_id', this.contentId);
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
            const response = await this.apiClient.get(`/api/content-versions?${params}`);
            const result = response.data;
            result.versions.forEach((version) => {
                this.versions.set(version.id, version);
            });
            return result;
        }
        catch (error) {
            console.error('Failed to get content version history:', error);
            throw error;
        }
    }
    // Quality Assessment Integration
    async runQualityAssessment(versionId, options = {}) {
        try {
            const response = await this.apiClient.post(`/api/content-versions/${versionId}/quality-assessment`, options);
            // Update local version data
            const version = this.versions.get(versionId);
            if (version) {
                version.quality_metrics = response.data;
            }
            return response.data;
        }
        catch (error) {
            console.error('Failed to run quality assessment:', error);
            throw error;
        }
    }
    // Utility Methods
    async generateNextVersion() {
        try {
            const { versions } = await this.getVersionHistory({ limit: 1 });
            if (versions.length === 0) {
                return '1.0.0';
            }
            const latest = versions[0].version_number;
            const parts = latest.split('.').map(Number);
            parts[2]++; // Increment patch version
            return parts.join('.');
        }
        catch (error) {
            return '1.0.0';
        }
    }
    async calculateQualityMetrics(content) {
        // Basic quality metrics calculation
        const wordCount = content.content.markdown.split(/\s+/).length;
        const hasImages = content.media.some(m => m.type === 'image');
        const hasToc = content.content.tableOfContents && content.content.tableOfContents.length > 0;
        return {
            overall_score: 75, // Default score, will be updated by quality service
            dimensions: {
                accuracy: 80,
                clarity: 75,
                completeness: wordCount > 500 ? 80 : 60,
                usefulness: 75,
                originality: 85,
                engagement: hasImages ? 80 : 70
            },
            automated_checks: {
                grammar_score: 75,
                readability_score: 70,
                seo_score: content.seo.metaDescription.length > 0 ? 80 : 60,
                formatting_score: hasToc ? 85 : 75
            }
        };
    }
}
