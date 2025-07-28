/**
 * Epic 16 - Content Version Manager
 * Task: E16-1753114247131-3FFAA7 - Implement version control
 *
 * Version control system for community contributions (articles, tutorials, case studies).
 * Adapts the proven TemplateVersionManager pattern for content versioning.
 */

export interface CommunityContent {
    id: string;
    type: 'article' | 'tutorial' | 'case-study' | 'guide' | 'documentation';
    title: string;
    subtitle?: string;
    slug: string;
    content: {,
        markdown: string;
        html?: string;
        summary: string;
        tableOfContents?: ContentSection[];
        metadata: ContentMetadata;
    };
    media: ContentMediaAttachment[];
    category: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    seo: {,
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        canonicalUrl?: string;
    };
    editorial: {,
        status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
        assignedEditor?: string;
        reviewNotes?: string;
        publishSchedule?: string;
        lastReview?: string;
    };

export interface ContentSection {
    id: string;
    title: string;
    level: number;
    anchor: string;
    children?: ContentSection[];

export interface ContentMetadata {
    readingTime: number;
    wordCount: number;
    lastSignificantUpdate: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    prerequisites: string[];
    learningObjectives: string[];
    relatedContent: string[];

export interface ContentMediaAttachment {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document' | 'interactive';
    url: string;
    thumbnailUrl?: string;
    title: string;
    description?: string;
    altText?: string;
    caption?: string;
    fileSize?: number;
    mimeType?: string;
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    position: number;

export interface ContentVersion {
    id: string;
    content_id: string;
    version_number: string;
    version_tag?: string;
    content_data: CommunityContent;
    title?: string;
    description?: string;
    changelog?: string;
    release_notes?: string;
    editorial_notes?: string;
    review_feedback?: ReviewFeedback[];
    approval_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
    parent_version_id?: string;
    branch_name: string;
    commit_hash: string;
    contributors: ContentContributor[];
    revision_type: 'major' | 'minor' | 'patch' | 'editorial';
    change_summary: string;
    created_by: string;
    created_at: string;
    published_at?: string;
    deprecated_at?: string;
    status: 'draft' | 'review' | 'approved' | 'published' | 'deprecated' | 'archived';
    visibility: 'private' | 'team' | 'community' | 'public';
    view_count: number;
    engagement_score: number;
    feedback_score: number;
    quality_metrics: ContentQualityScore;
    plagiarism_check?: PlagiarismResult;
    fact_check?: FactCheckResult;

export interface ReviewFeedback {
    id: string;
    reviewer_id: string;
    reviewer_name: string;
    review_date: string;
    feedback_type: 'suggestion' | 'correction' | 'improvement' | 'approval' | 'rejection';
    section?: string;
    comment: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'addressed' | 'dismissed';
    resolution?: string;

export interface ContentContributor {
    user_id: string;
    name: string;
    role: 'author' | 'co-author' | 'editor' | 'reviewer' | 'illustrator' | 'fact-checker';
    contribution: string;
    contribution_date: string;
    attribution_visible: boolean;

export interface ContentQualityScore {
    overall_score: number;
    dimensions: {,
        accuracy: number;
        clarity: number;
        completeness: number;
        usefulness: number;
        originality: number;
        engagement: number;
    };
    automated_checks: {,
        grammar_score: number;
        readability_score: number;
        seo_score: number;
        formatting_score: number;
    };
    editorial_assessment?: {
        content_quality: number;
        factual_accuracy: number;
        style_consistency: number;
        target_audience_fit: number;
    };

export interface PlagiarismResult {
    overall_similarity: number;
    sources_found: Array<{,
        url: string;
        similarity: number;
        matched_text: string;
        context: string;
    }>;
    confidence_level: number;
    check_date: string;

export interface FactCheckResult {
    overall_accuracy: number;
    claims_checked: number;
    claims_verified: number;
    disputed_claims: Array<{,
        claim: string;
        status: 'verified' | 'disputed' | 'false' | 'unverifiable';
        sources: string[];
        explanation: string;
    }>;
    check_date: string;
    checker_id?: string;

export interface ContentImportOptions {
    format: 'markdown' | 'html' | 'docx' | 'pdf' | 'notion' | 'confluence';
    source: string | File | ArrayBuffer;
    merge_strategy?: 'replace' | 'merge' | 'create_version';
    preserve_formatting?: boolean;
    extract_media?: boolean;
    auto_generate_toc?: boolean;
    version_bump?: 'patch' | 'minor' | 'major' | 'custom';
    custom_version?: string;
    branch_name?: string;
    auto_tag?: boolean;
    detect_language?: boolean;
    extract_metadata?: boolean;
    run_quality_checks?: boolean;
    assign_reviewer?: string;
    target_status?: 'draft' | 'review';
    import_notes?: string;

export interface ContentExportOptions {
    format: 'markdown' | 'html' | 'pdf' | 'docx' | 'epub' | 'content_bundle';
    include_version_history?: boolean;
    include_media?: boolean;
    include_metadata?: boolean;
    include_reviews?: boolean;
    version_id?: string;
    version_range?: string;
    include_branches?: string[];
    bundle_media?: boolean;
    bundle_related_content?: boolean;
    compress?: boolean;
    filename?: string;
    template?: 'standard' | 'academic' | 'blog' | 'documentation';
    styling?: {
        theme?: string;
        custom_css?: string;
        include_toc?: boolean;
    };

export interface ContentVersionDiff {
    content_changes: Array<{,
        section: string;
        change_type: 'added' | 'removed' | 'modified';
        old_content?: string;
        new_content?: string;
        line_number?: number;
    }>;
    metadata_changes: Array<{,
        field: string;
        old_value: unknown;
        new_value: unknown;
        change_type: 'added' | 'removed' | 'modified';
    }>;
    media_changes: Array<{,
        media_id: string;
        change_type: 'added' | 'removed' | 'modified';
        old_media?: ContentMediaAttachment;
        new_media?: ContentMediaAttachment;
    }>;
    structure_changes: {,
        sections_added: number;
        sections_removed: number;
        sections_reordered: number;
        toc_changes: boolean;
    };
    editorial_changes: {,
        status_change?: {
            from: string;
            to: string;
        };
        reviewer_change?: {
            from?: string;
            to?: string;
        };
        feedback_added: number;
        feedback_resolved: number;
    };

export declare class ContentVersionManager {
    private contentId;
    private userId;
    private versions;
    private apiClient;
    constructor(apiClient: unknown, contentId: string, userId: string);
    createVersion(content: CommunityContent, options?: {)
        version_number?: string;
        version_tag?: string;
        title?: string;
        description?: string;
        changelog?: string;
        branch_name?: string;
        revision_type?: 'major' | 'minor' | 'patch' | 'editorial';
        change_summary?: string;
        target_status?: 'draft' | 'review';
    }): Promise<ContentVersion>;
    submitForReview(versionId: string, options?: {)
        reviewer_id?: string;
        review_notes?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
    }): Promise<ContentVersion>;
    publishVersion(versionId: string, options?: {)
        release_notes?: string;
        visibility?: 'private' | 'team' | 'community' | 'public';
        publish_date?: string;
        notify_subscribers?: boolean;
    }): Promise<ContentVersion>;
    addReviewFeedback();
      versionId: string,
      feedback: Omit<ReviewFeedback,
      'id' | 'reviewer_id' | 'reviewer_name' | 'review_date'>
    ): Promise<ReviewFeedback>;
    resolveFeedback(versionId: string, feedbackId: string, resolution: string): Promise<void>;
    getReviewHistory(versionId: string): Promise<ReviewFeedback[]>;
    addContributor(versionId: string, contributor: Omit<ContentContributor, 'contribution_date'>): Promise<void>;
    getCollaborationHistory(contentId?: string): Promise<Array<{
        version_id: string;
        version_number: string;
        contributors: ContentContributor[];
        created_at: string;
        change_summary: string;
    }>>;
    importContent(options: ContentImportOptions): Promise<{
        success: boolean;
        imported_version: ContentVersion;
        warnings: string[];
        errors: string[];
        quality_score?: ContentQualityScore;
    }>;
    exportContent(versionId: string, options: ContentExportOptions): Promise<{
        download_url?: string;
        file_data?: ArrayBuffer;
        filename: string;
        size: number;
        format: string;
    }>;
    compareVersions(fromVersionId: string, toVersionId: string): Promise<{
        from_version: ContentVersion;
        to_version: ContentVersion;
        diff: ContentVersionDiff;
        similarity_score: number;
        change_magnitude: 'trivial' | 'minor' | 'moderate' | 'major' | 'complete_rewrite';
    }>;
    getVersionHistory(options?: {)
        include_drafts?: boolean;
        branch_name?: string;
        limit?: number;
        offset?: number;
        contributor_id?: string;
    }): Promise<{
        versions: ContentVersion[];
        total: number;
    }>;
    runQualityAssessment(versionId: string, options?: {)
        include_plagiarism_check?: boolean;
        include_fact_check?: boolean;
        include_grammar_check?: boolean;
        include_seo_analysis?: boolean;
    }): Promise<ContentQualityScore>;
    private generateNextVersion;
    private calculateQualityMetrics;

export interface ContentBundle {
    format_version: string;
    created_at: string;
    created_by: string;
    content: ContentVersion;
    related_content: ContentVersion[];
    media_assets: ContentMediaAttachment[];
    documentation: {,
        readme: string;
        changelog: string;
        usage_guide?: string;
        examples?: Array<{
            name: string;
            description: string;
            preview: string;
        }>;
    };
    checksums: Record<string, string>;
    signature?: string;

//# sourceMappingURL=ContentVersionManager.d.ts.map