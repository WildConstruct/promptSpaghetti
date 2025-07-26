/**
 * Epic 16 - Content Quality Assessment System
 * Task: E16-1753114247130-02122C - Create quality assessment
 *
 * Quality control and assessment system for community-contributed content.
 * Adapts the proven ContentQualityMetricsService for editorial content.
 */
export class ContentQualityAssessmentService {
    apiClient;
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    // Primary Quality Assessment Methods
    async runComprehensiveAssessment(contentId, versionId, options = {}) {
        try {
            const response = await this.apiClient.post(`/api/content/${contentId}/versions/${versionId}/quality-assessment`, {
                assessment_type: 'comprehensive',
                options
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to run comprehensive quality assessment:', error);
            throw error;
        }
    }
    async runAutomatedAnalysis(contentId, versionId, options = {}) {
        try {
            const response = await this.apiClient.post(`/api/content/${contentId}/versions/${versionId}/automated-analysis`, options);
            return response.data;
        }
        catch (error) {
            console.error('Failed to run automated analysis:', error);
            throw error;
        }
    }
    // Editorial Review Management
    async assignEditorialReview(contentId, versionId, reviewerId, options = {}) {
        try {
            const response = await this.apiClient.post(`/api/content/${contentId}/versions/${versionId}/assign-review`, {
                reviewer_id: reviewerId,
                ...options
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to assign editorial review:', error);
            throw error;
        }
    }
    async submitEditorialReview(contentId, versionId, review) {
        try {
            const response = await this.apiClient.post(`/api/content/${contentId}/versions/${versionId}/editorial-review`, review);
            return response.data;
        }
        catch (error) {
            console.error('Failed to submit editorial review:', error);
            throw error;
        }
    }
    async getReviewWorkflow(contentId, versionId) {
        try {
            const response = await this.apiClient.get(`/api/content/${contentId}/versions/${versionId}/workflow`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get review workflow:', error);
            throw error;
        }
    }
    // Quality Issue Management
    async flagQualityIssue(contentId, versionId, flag) {
        try {
            const response = await this.apiClient.post(`/api/content/${contentId}/versions/${versionId}/flag-issue`, {
                ...flag,
                auto_detected: false
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to flag quality issue:', error);
            throw error;
        }
    }
    async resolveQualityIssue(contentId, versionId, flagId, resolution) {
        try {
            await this.apiClient.put(`/api/content/${contentId}/versions/${versionId}/flags/${flagId}/resolve`, resolution);
        }
        catch (error) {
            console.error('Failed to resolve quality issue:', error);
            throw error;
        }
    }
    // Quality Benchmarking and Analytics
    async getQualityBenchmarks(category, contentType, timeRange) {
        try {
            const params = new URLSearchParams();
            if (category)
                params.append('category', category);
            if (contentType)
                params.append('content_type', contentType);
            if (timeRange)
                params.append('time_range', timeRange);
            const response = await this.apiClient.get(`/api/quality/benchmarks?${params}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get quality benchmarks:', error);
            throw error;
        }
    }
    async getQualityDashboard(userId) {
        try {
            const params = new URLSearchParams();
            if (userId)
                params.append('user_id', userId);
            const response = await this.apiClient.get(`/api/quality/dashboard?${params}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get quality dashboard:', error);
            throw error;
        }
    }
    // Quality Improvement Tools
    async generateImprovementPlan(contentId, versionId, targetGrade) {
        try {
            const response = await this.apiClient.post(`/api/content/${contentId}/versions/${versionId}/improvement-plan`, {
                target_grade: targetGrade
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to generate improvement plan:', error);
            throw error;
        }
    }
    async applyAutomatedFixes(contentId, versionId, fixTypes, confidence_threshold = 80) {
        try {
            const response = await this.apiClient.post(`/api/content/${contentId}/versions/${versionId}/auto-fix`, {
                fix_types: fixTypes,
                confidence_threshold
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to apply automated fixes:', error);
            throw error;
        }
    }
    // Quality Training and Guidelines
    async getQualityGuidelines(contentType, difficultyLevel) {
        try {
            const params = new URLSearchParams();
            if (contentType)
                params.append('content_type', contentType);
            if (difficultyLevel)
                params.append('difficulty_level', difficultyLevel);
            const response = await this.apiClient.get(`/api/quality/guidelines?${params}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get quality guidelines:', error);
            throw error;
        }
    }
}
// Quality Assessment Configuration
export const QUALITY_ASSESSMENT_CONFIG = {
    // Score thresholds for different grades
    GRADE_THRESHOLDS: {
        'A+': 95,
        'A': 90,
        'B+': 85,
        'B': 80,
        'C+': 75,
        'C': 70,
        'D': 60,
        'F': 0
    },
    // Minimum scores for publication
    PUBLICATION_THRESHOLDS: {
        community: 70,
        featured: 85,
        official: 90
    },
    // Automated check configurations
    AUTOMATED_CHECKS: {
        grammar: { weight: 0.15, threshold: 80 },
        readability: { weight: 0.20, threshold: 70 },
        structure: { weight: 0.15, threshold: 75 },
        seo: { weight: 0.10, threshold: 70 },
        accessibility: { weight: 0.15, threshold: 80 },
        plagiarism: { weight: 0.25, threshold: 95 } // Higher is better (less plagiarism)
    },
    // Review workflow timeouts
    REVIEW_TIMEOUTS: {
        quick_review: 24, // hours
        comprehensive_review: 72,
        specialist_review: 120
    }
};
