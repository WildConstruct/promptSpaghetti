/**
 * Epic 16 - Content Quality Assessment System
 * Task: E16-1753114247130-02122C - Create quality assessment
 *
 * Quality control and assessment system for community-contributed content.
 * Adapts the proven ContentQualityMetricsService for editorial content.
 */

}
export interface CommunityContentQualityMetrics {
    contentId: string;
    versionId: string;
    assessmentDate: Date;
    assessorId?: string;
    assessmentType: 'automated' | 'editorial' | 'community' | 'comprehensive';
    overallQualityScore: number;
    qualityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    qualityStatus: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'rejected';
    publicationRecommendation: 'publish' | 'publish_with_edits' | 'major_revision' | 'reject';
    editorial: EditorialQualityMetrics;
    technical: TechnicalQualityMetrics;
    engagement: ContentEngagementMetrics;
    community: CommunityValueMetrics;
    automated: AutomatedContentAnalysis;
    editorial_review?: EditorialReview;
    recommendations: QualityRecommendation[];
    assessment_version: string;
    confidence_level: number;
    flags: QualityFlag[];

}
export interface EditorialQualityMetrics {
    score: number;
    accuracy: {
        factual_correctness: number;
        source_reliability: number;
        claim_verification: number;
        up_to_date: number;
}
    };
    clarity: {
        writing_quality: number;
        language_proficiency: number;
        structure_organization: number;
        readability: number;
    };
    completeness: {
        topic_coverage: number;
        depth_of_analysis: number;
        supporting_evidence: number;
        actionable_insights: number;
    };
    educational_value: {
        learning_objectives_clarity: number;
        skill_development_potential: number;
        practical_applicability: number;
        difficulty_appropriateness: number;
    };
    originality: {
        novelty_score: number;
        unique_perspective: number;
        creative_approach: number;
        plagiarism_risk: number;
    };

}
export interface TechnicalQualityMetrics {
    score: number;
    formatting: {
        markdown_quality: number;
        structure_consistency: number;
        visual_hierarchy: number;
        code_formatting: number;
}
    };
    media_quality: {
        image_quality: number;
        image_relevance: number;
        alt_text_quality: number;
        media_accessibility: number;
    };
    seo_optimization: {
        title_optimization: number;
        meta_description_quality: number;
        keyword_usage: number;
        internal_linking: number;
    };
    accessibility: {
        screen_reader_compatibility: number;
        language_accessibility: number;
        cognitive_accessibility: number;
        visual_accessibility: number;
    };
    technical_accuracy?: {
        code_correctness: number;
        best_practices_adherence: number;
        security_considerations: number;
        performance_implications: number;
    };

}
export interface ContentEngagementMetrics {
    score: number;
    engagement_potential: {
        hook_effectiveness: number;
        reader_retention_likelihood: number;
        interactive_elements: number;
        call_to_action_clarity: number;
}
    };
    shareability: {
        viral_potential: number;
        social_media_optimization: number;
        quotable_content: number;
        discussion_trigger_potential: number;
    };
    utility: {
        actionability: number;
        problem_solving_value: number;
        reference_value: number;
        time_investment_worthiness: number;
    };
    audience_fit: {
        difficulty_level_appropriateness: number;
        prerequisite_clarity: number;
        tone_consistency: number;
        cultural_sensitivity: number;
    };

}
export interface CommunityValueMetrics {
    score: number;
    contribution_value: {
        knowledge_gap_filling: number;
        community_need_alignment: number;
        expertise_sharing_quality: number;
        collaborative_potential: number;
}
    };
    sustainability: {
        evergreen_content_potential: number;
        maintenance_requirements: number;
        update_frequency_needs: number;
        deprecation_risk: number;
    };
    standards_compliance: {
        community_guidelines_adherence: number;
        code_of_conduct_compliance: number;
        content_policy_alignment: number;
        ethical_considerations: number;
    };
    knowledge_transfer: {
        teaching_effectiveness: number;
        mentorship_quality: number;
        skill_building_support: number;
        learning_path_contribution: number;
    };

}
export interface AutomatedContentAnalysis {
    language_analysis: {
        grammar_score: number;
        spelling_accuracy: number;
        style_consistency: number;
        tone_analysis: {
            detected_tone: string[];
            tone_consistency: number;
            appropriateness: number;
}
        };
    };
    readability: {
        flesch_reading_ease: number;
        flesch_kincaid_grade: number;
        average_sentence_length: number;
        complex_words_percentage: number;
        estimated_reading_time: number;
    };
    structure: {
        heading_hierarchy_score: number;
        paragraph_length_consistency: number;
        list_usage_effectiveness: number;
        table_of_contents_quality: number;
    };
    seo: {
        keyword_density: Record<string, number>;
        meta_data_completeness: number;
        internal_link_quality: number;
        external_link_authority: number;
    };
    classification: {
        detected_categories: string[];
        difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        content_type_confidence: number;
        topic_relevance_score: number;
    };
    issues: AutomatedIssue[];

}
export interface AutomatedIssue {
    type: 'grammar' | 'spelling' | 'formatting' | 'accessibility' | 'seo' | 'structure' | 'plagiarism' | 'factual';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: {
        section?: string;
        line?: number;
        character_range?: [number, number];
}
    };
    description: string;
    suggestion?: string;
    auto_fixable: boolean;

}
export interface EditorialReview {
    reviewer_id: string;
    reviewer_name: string;
    review_date: string;
    review_type: 'quick_review' | 'comprehensive_review' | 'specialist_review';
    content_quality: number;
    factual_accuracy: number;
    writing_quality: number;
    audience_appropriateness: number;
    educational_value: number;
    strengths: string[];
    areas_for_improvement: string[];
    factual_concerns: string[];
    style_suggestions: string[];
    recommendation: 'approve' | 'approve_with_minor_edits' | 'request_major_revision' | 'reject';
    publication_readiness: number;
    estimated_revision_time: number;
    requires_fact_check: boolean;
    requires_specialist_review: boolean;
    requires_legal_review: boolean;
    public_feedback: string;
    internal_notes: string;

}
export interface QualityRecommendation {
    id: string;
    type: 'critical' | 'improvement' | 'enhancement' | 'optimization';
    category: 'content' | 'structure' | 'style' | 'technical' | 'seo' | 'accessibility';
    priority: 'high' | 'medium' | 'low';
    issue: string;
    recommendation: string;
    expected_impact: string;
    estimated_effort: 'low' | 'medium' | 'high';
    implementation_steps?: string[];
    resources?: Array<{
        title: string;
        url: string;
        type: 'guide' | 'tool' | 'example' | 'reference'
}
  }>;
    auto_fix_available: boolean;
    auto_fix_confidence?: number;

}
export interface QualityFlag {
    type: 'plagiarism' | 'factual_error' | 'policy_violation' | 'accessibility_issue' | 'quality_concern';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence?: string;
    requires_human_review: boolean;
    auto_detected: boolean;

}
export interface QualityAssessmentWorkflow {
    content_id: string;
    version_id: string;
    workflow_stage: 'automated_analysis' | 'editorial_review' | 'specialist_review' | 'final_approval' | 'published';
    assigned_reviewer?: string;
    specialist_reviewers: string[];
    final_approver?: string;
    submitted_date: string;
    target_completion_date?: string;
    actual_completion_date?: string;
    workflow_history: WorkflowStep[];
    current_status: 'pending' | 'in_review' | 'revision_needed' | 'approved' | 'rejected' | 'on_hold';
    blocking_issues: QualityFlag[];
    escalation_level: 'normal' | 'priority' | 'urgent';
    notification_settings: {
        notify_author: boolean;
        notify_reviewers: boolean;
        notify_community: boolean;
}
    };

}
export interface WorkflowStep {
    step_type: 'automated_check' | 'editorial_review' | 'author_revision' | 'approval' | 'rejection';
    completed_by: string;
    completed_date: string;
    duration_hours: number;
    notes?: string;
    attachments?: string[];

export declare class ContentQualityAssessmentService {
    private apiClient;
    constructor(apiClient: any);
    runComprehensiveAssessment(contentId: string, versionId: string, options?: {)
        include_automated?: boolean;
        include_editorial?: boolean;
        include_community?: boolean;
        assigned_reviewer?: string;
        priority?: 'normal' | 'high' | 'urgent'
}
  }): Promise<CommunityContentQualityMetrics>;
    runAutomatedAnalysis(contentId: string, versionId: string, options?: {)
        include_plagiarism_check?: boolean;
        include_fact_checking?: boolean;
        include_accessibility_audit?: boolean;
        include_seo_analysis?: boolean;
        language?: string;
    }): Promise<AutomatedContentAnalysis>;
    assignEditorialReview(contentId: string, versionId: string, reviewerId: string, options?: {)
        review_type?: 'quick_review' | 'comprehensive_review' | 'specialist_review';
        target_completion?: string;
        special_instructions?: string;
    }): Promise<QualityAssessmentWorkflow>;
    submitEditorialReview(contentId: string, versionId: string, review: Omit<EditorialReview, 'reviewer_id' | 'reviewer_name' | 'review_date'>): Promise<EditorialReview>;
    getReviewWorkflow(contentId: string, versionId: string): Promise<QualityAssessmentWorkflow>;
    flagQualityIssue(contentId: string, versionId: string, flag: Omit<QualityFlag, 'auto_detected'>): Promise<QualityFlag>;
    resolveQualityIssue(contentId: string, versionId: string, flagId: string, resolution: {)
        resolution_type: 'fixed' | 'false_positive' | 'accepted_risk';
        resolution_notes: string;
        resolved_by: string;
    }): Promise<void>;
    getQualityBenchmarks(category?: string, contentType?: string, timeRange?: 'week' | 'month' | 'quarter' | 'year'): Promise<{
        overall_average: number;
        grade_distribution: Record<string, number>;
        common_issues: Array<{
            issue_type: string;
            frequency: number;
            avg_severity: number;
        }>;
        improvement_trends: Array<{
            metric: string;
            trend: 'improving' | 'stable' | 'declining';
            change_percentage: number;
        }>;
    }>;
    getQualityDashboard(userId?: string): Promise<{
        personal_stats?: {
            content_count: number;
            avg_quality_score: number;
            improvement_over_time: number;
            recent_reviews: EditorialReview[];
        };
        community_stats: {
            total_content_assessed: number;
            avg_community_quality: number;
            quality_distribution: Record<string, number>;
            top_contributors: Array<{
                user_id: string;
                username: string;
                avg_quality: number;
                content_count: number;
            }>;
        };
        review_queue: {
            pending_reviews: number;
            avg_review_time: number;
            urgent_items: number;
            reviewer_workload: Array<{
                reviewer_id: string;
                pending_count: number;
                avg_turnaround: number;
            }>;
        };
    }>;
    generateImprovementPlan(contentId: string, versionId: string, targetGrade: 'A+' | 'A' | 'B+' | 'B'): Promise<{
        current_score: number;
        target_score: number;
        improvement_needed: number;
        estimated_effort_hours: number;
        prioritized_recommendations: QualityRecommendation[];
        success_probability: number;
    }>;
    applyAutomatedFixes(contentId: string, versionId: string, fixTypes: Array<'grammar' | 'formatting' | 'seo' | 'accessibility'>, confidence_threshold?: number): Promise<{
        fixes_applied: number;
        fixes_available: number;
        new_version_id?: string;
        quality_improvement: number;
        applied_fixes: Array<{
            type: string;
            description: string;
            confidence: number;
        }>;
    }>;
    getQualityGuidelines(contentType?: string, difficultyLevel?: string): Promise<{
        general_guidelines: string[];
        specific_criteria: Record<string, string[]>;
        examples: Array<{
            title: string;
            description: string;
            quality_score: number;
            exemplary_aspects: string[];
        }>;
        common_mistakes: Array<{
            mistake: string;
            impact: string;
            how_to_avoid: string;
        }>;
    }>;

export declare const QUALITY_ASSESSMENT_CONFIG: {
    readonly GRADE_THRESHOLDS: {
        readonly 'A+': 95;
        readonly A: 90;
        readonly 'B+': 85;
        readonly B: 80;
        readonly 'C+': 75;
        readonly C: 70;
        readonly D: 60;
        readonly F: 0;
    };
    readonly PUBLICATION_THRESHOLDS: {
        readonly community: 70;
        readonly featured: 85;
        readonly official: 90;
    };
    readonly AUTOMATED_CHECKS: {
        readonly grammar: {
            readonly weight: 0.15;
            readonly threshold: 80;
        };
        readonly readability: {
            readonly weight: 0.2;
            readonly threshold: 70;
        };
        readonly structure: {
            readonly weight: 0.15;
            readonly threshold: 75;
        };
        readonly seo: {
            readonly weight: 0.1;
            readonly threshold: 70;
        };
        readonly accessibility: {
            readonly weight: 0.15;
            readonly threshold: 80;
        };
        readonly plagiarism: {
            readonly weight: 0.25;
            readonly threshold: 95;
        };
    };
    readonly REVIEW_TIMEOUTS: {
        readonly quick_review: 24;
        readonly comprehensive_review: 72;
        readonly specialist_review: 120;
    };
};
//# sourceMappingURL=ContentQualityAssessment.d.ts.map