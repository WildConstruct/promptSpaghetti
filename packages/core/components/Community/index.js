/**
 * Epic 16 - Community Components Export Index
 * Tasks: E16-1753114247131-3FFAA7 (Version Control) & E16-1753114247130-02122C (Quality Assessment)
 *
 * Central export file for all community content management components.
 */
// Version Control Components
export { ContentVersionControl } from './ContentVersionControl.js';
// Quality Assessment Components  
export { QualityAssessmentDashboard } from './QualityAssessmentDashboard.js';
export { ContentVersionManager } from '../../community/ContentVersionManager.js';
export { ContentQualityAssessmentService, QUALITY_ASSESSMENT_CONFIG } from '../../community/ContentQualityAssessment.js';
// Default configurations
export const CONTENT_VERSION_DEFAULTS = {
    showEditorialWorkflow: true,
    readOnly: false,
    defaultBranch: 'main',
    autoSave: true,
    versioningStrategy: 'semantic'
};
export const QUALITY_ASSESSMENT_DEFAULTS = {
    showReviewInterface: false,
    readOnly: false,
    assessmentType: 'automated',
    autoRunChecks: true,
    confidenceThreshold: 80
};
// Workflow presets for common scenarios
export const CONTENT_WORKFLOWS = {
    // Simple author workflow
    author: {
        stages: ['draft', 'review', 'published'],
        permissions: ['create', 'edit', 'submit_review'],
        assessmentType: 'automated'
    },
    // Editorial workflow with quality gates
    editorial: {
        stages: ['draft', 'automated_check', 'editorial_review', 'approved', 'published'],
        permissions: ['create', 'edit', 'review', 'approve', 'publish'],
        assessmentType: 'comprehensive',
        qualityGates: {
            minimum_score: 70,
            required_checks: ['grammar', 'plagiarism', 'factual']
        }
    },
    // Enterprise workflow with specialist review
    enterprise: {
        stages: ['draft', 'automated_check', 'editorial_review', 'specialist_review', 'legal_review', 'approved', 'published'],
        permissions: ['create', 'edit', 'review', 'specialist_review', 'legal_review', 'approve', 'publish'],
        assessmentType: 'comprehensive',
        qualityGates: {
            minimum_score: 85,
            required_checks: ['grammar', 'plagiarism', 'factual', 'legal', 'accessibility']
        },
        escalation: {
            auto_escalate_threshold: 'high',
            specialist_required_topics: ['technical', 'legal', 'medical', 'financial']
        }
    }
};
// Quality thresholds by content type
export const QUALITY_THRESHOLDS_BY_TYPE = {
    'article': {
        minimum_publication_score: 75,
        recommended_score: 85,
        dimensions: {
            editorial: 80,
            technical: 70,
            engagement: 75,
            community: 70
        }
    },
    'tutorial': {
        minimum_publication_score: 80,
        recommended_score: 90,
        dimensions: {
            editorial: 85,
            technical: 85,
            engagement: 80,
            community: 75
        }
    },
    'case-study': {
        minimum_publication_score: 75,
        recommended_score: 85,
        dimensions: {
            editorial: 80,
            technical: 70,
            engagement: 85,
            community: 80
        }
    },
    'guide': {
        minimum_publication_score: 85,
        recommended_score: 90,
        dimensions: {
            editorial: 90,
            technical: 80,
            engagement: 80,
            community: 85
        }
    },
    'documentation': {
        minimum_publication_score: 90,
        recommended_score: 95,
        dimensions: {
            editorial: 95,
            technical: 95,
            engagement: 70,
            community: 80
        }
    }
};
// Integration helpers for Epic 16 components
export const COMMUNITY_INTEGRATIONS = {
    // Integration with Epic 16 marketplace components
    marketplace: {
        template_integration: true,
        case_study_showcase: true,
        community_ratings: true,
        creator_profiles: true
    },
    // Integration with Epic 17 admin controls
    admin: {
        policy_enforcement: true,
        compliance_monitoring: true,
        content_moderation: true,
        analytics_tracking: true
    },
    // Integration with core platform features
    platform: {
        user_authentication: true,
        notification_system: true,
        search_indexing: true,
        analytics_collection: true
    }
};
// Utility functions for common operations
export const CommunityUtils = {
    // Version comparison utilities
    compareVersions: (a, b) => {
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
    },
    // Quality score calculation
    calculateOverallScore: (dimensions) => {
        const weights = {
            editorial: 0.3,
            technical: 0.25,
            engagement: 0.25,
            community: 0.2
        };
        let totalScore = 0;
        let totalWeight = 0;
        Object.entries(dimensions).forEach(([dimension, score]) => {
            const weight = weights[dimension] || 0.1;
            totalScore += score * weight;
            totalWeight += weight;
        });
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    },
    // Grade calculation
    calculateGrade: (score) => {
        if (score >= 95)
            return 'A+';
        if (score >= 90)
            return 'A';
        if (score >= 85)
            return 'B+';
        if (score >= 80)
            return 'B';
        if (score >= 75)
            return 'C+';
        if (score >= 70)
            return 'C';
        if (score >= 60)
            return 'D';
        return 'F';
    },
    // Workflow stage validation
    validateWorkflowTransition: (currentStage, targetStage, userRole) => {
        const allowedTransitions = {
            'automated_analysis': ['editorial_review'],
            'editorial_review': ['specialist_review', 'final_approval'],
            'specialist_review': ['final_approval'],
            'final_approval': ['published'],
            'published': []
        };
        const rolePermissions = {
            'author': ['automated_analysis'],
            'editor': ['automated_analysis', 'editorial_review'],
            'reviewer': ['editorial_review', 'specialist_review'],
            'admin': ['automated_analysis', 'editorial_review', 'specialist_review', 'final_approval', 'published']
        };
        return allowedTransitions[currentStage]?.includes(targetStage) &&
            rolePermissions[userRole]?.includes(targetStage);
    }
};
