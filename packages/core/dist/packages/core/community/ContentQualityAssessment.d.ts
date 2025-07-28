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
    recommendations: QualityRecommendation;
    assessment_version: string;
    confidence_level: number;
    flags: QualityFlag;
}
export interface EditorialQualityMetrics {
    score: number;
    accuracy: {
        factual_correctness: number;
        source_reliability: number;
        claim_verification: number;
        up_to_date: number;
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
            detected_tone: string;
            tone_consistency: number;
            appropriateness: number;
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
        detected_categories: string;
        difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        content_type_confidence: number;
        topic_relevance_score: number;
    };
    issues: AutomatedIssue;
}
export interface AutomatedIssue {
    type: 'grammar' | 'spelling' | 'formatting' | 'accessibility' | 'seo' | 'structure' | 'plagiarism' | 'factual';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: {
        section?: string;
        line?: number;
        character_range?: [number, number];
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
    strengths: string;
    areas_for_improvement: string;
    factual_concerns: string;
    style_suggestions: string;
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
    implementation_steps?: string;
    resources?: Array<{}, title>;
    string: any;
    url: string;
    type: 'guide' | 'tool' | 'example' | 'reference';
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
    specialist_reviewers: string;
    final_approver?: string;
    submitted_date: string;
    target_completion_date?: string;
    actual_completion_date?: string;
    workflow_history: WorkflowStep;
    current_status: 'pending' | 'in_review' | 'revision_needed' | 'approved' | 'rejected' | 'on_hold';
    blocking_issues: QualityFlag;
    escalation_level: 'normal' | 'priority' | 'urgent';
    notification_settings: {
        notify_author: boolean;
        notify_reviewers: boolean;
        notify_community: boolean;
    };
}
export interface WorkflowStep {
    step_type: 'automated_check' | 'editorial_review' | 'author_revision' | 'approval' | 'rejection';
    completed_by: string;
    completed_date: string;
    duration_hours: number;
    notes?: string;
    attachments?: string;
}
export declare class ContentQualityAssessmentService {
    private apiClient;
    constructor(apiClient: any);
}
//# sourceMappingURL=ContentQualityAssessment.d.ts.map