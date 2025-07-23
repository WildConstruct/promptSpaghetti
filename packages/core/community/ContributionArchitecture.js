/**
 * Epic 16 - Community Contribution Architecture
 * Task: E16-1753114247115-253BF0 - Design contribution architecture
 *
 * Foundational architecture for community members to contribute content to the knowledge base.
 * Integrates with existing version control and quality assessment systems.
 */
// ====================================
// Configuration and Templates
// ====================================
export const CONTRIBUTION_WORKFLOW_TEMPLATES = {
    // Simple workflow for trusted contributors
    trusted_contributor: {
        stages: ['submission', 'quality_check', 'final_approval', 'publication'],
        quality_gates: ['automated_quality', 'plagiarism_check'],
        review_requirements: { min_reviewers: 1, specialist_required: false },
        auto_publish_threshold: 85
    },
    // Standard workflow for regular contributors
    standard: {
        stages: ['submission', 'intake_review', 'quality_check', 'editorial_review', 'final_approval', 'publication'],
        quality_gates: ['automated_quality', 'editorial_review', 'technical_review'],
        review_requirements: { min_reviewers: 2, specialist_required: false },
        auto_publish_threshold: 90
    },
    // Comprehensive workflow for new contributors or complex content
    comprehensive: {
        stages: ['submission', 'intake_review', 'quality_check', 'editorial_review', 'technical_review', 'community_review', 'final_approval', 'publication'],
        quality_gates: ['automated_quality', 'editorial_review', 'technical_review', 'community_consensus'],
        review_requirements: { min_reviewers: 3, specialist_required: true },
        auto_publish_threshold: 95
    },
    // Express workflow for urgent content
    express: {
        stages: ['submission', 'quality_check', 'editorial_review', 'publication'],
        quality_gates: ['automated_quality', 'expedited_review'],
        review_requirements: { min_reviewers: 1, specialist_required: false },
        auto_publish_threshold: 80,
        max_review_time: 24 // hours
    }
};
export const QUALITY_GATE_PRESETS = {
    automated_basic: {
        minimum_score: 70,
        required_checks: ['grammar', 'spelling', 'readability'],
        blocking_issues: ['plagiarism_detected', 'policy_violation'],
        automated_thresholds: {
            grammar_score: 80,
            plagiarism_similarity: 15, // max 15% similarity
            readability_score: 70
        }
    },
    automated_comprehensive: {
        minimum_score: 80,
        required_checks: ['grammar', 'spelling', 'readability', 'seo', 'accessibility'],
        blocking_issues: ['plagiarism_detected', 'policy_violation', 'accessibility_violation'],
        automated_thresholds: {
            grammar_score: 85,
            plagiarism_similarity: 10,
            readability_score: 75,
            seo_score: 70,
            accessibility_score: 80
        }
    },
    editorial_standard: {
        minimum_score: 75,
        required_checks: ['content_accuracy', 'style_consistency', 'target_audience'],
        reviewer_consensus: 75, // 75% of reviewers must approve
        automated_thresholds: {
            editorial_score: 75,
            technical_accuracy: 80
        }
    }
};
