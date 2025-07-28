/**
 * Epic 16 Contribution Data Model
 * Task: E16-1753114247117-36F668 - Create contribution data model
 *
 * Comprehensive data types for all Epic 16 contribution types including
 * templates, knowledge base articles, case studies, and community content.
 */
import { z } from 'zod';
export declare const ContributionTypeSchema: z.ZodEnum<[string, ...string[]]>;
export declare const ContributionStatusSchema: z.ZodEnum<[string, ...string[]]>;
export declare const ContributionQualityRatingSchema: z.ZodEnum<[string, ...string[]]>;
export declare const ContributorLevelSchema: z.ZodEnum<[string, ...string[]]>;
export declare const BaseContributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const TemplateContributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const KnowledgeArticleContributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const TutorialContributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CaseStudyContributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const PatternLibraryContributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CommunityPostContributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateContributionRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateContributionRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ContributionReviewRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ContributionFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ContributorProfileSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ContributionType = z.infer<typeof ContributionTypeSchema>;
export type ContributionStatus = z.infer<typeof ContributionStatusSchema>;
export type ContributionQualityRating = z.infer<typeof ContributionQualityRatingSchema>;
export type ContributorLevel = z.infer<typeof ContributorLevelSchema>;
export type BaseContribution = z.infer<typeof BaseContributionSchema>;
export type TemplateContribution = z.infer<typeof TemplateContributionSchema>;
export type KnowledgeArticleContribution = z.infer<typeof KnowledgeArticleContributionSchema>;
export type TutorialContribution = z.infer<typeof TutorialContributionSchema>;
export type CaseStudyContribution = z.infer<typeof CaseStudyContributionSchema>;
export type PatternLibraryContribution = z.infer<typeof PatternLibraryContributionSchema>;
export type CommunityPostContribution = z.infer<typeof CommunityPostContributionSchema>;
export type Contribution = TemplateContribution | KnowledgeArticleContribution | TutorialContribution | CaseStudyContribution | PatternLibraryContribution | CommunityPostContribution;
export type CreateContributionRequest = z.infer<typeof CreateContributionRequestSchema>;
export type UpdateContributionRequest = z.infer<typeof UpdateContributionRequestSchema>;
export type ContributionReviewRequest = z.infer<typeof ContributionReviewRequestSchema>;
export type ContributionFilter = z.infer<typeof ContributionFilterSchema>;
export type ContributorProfile = z.infer<typeof ContributorProfileSchema>;
export declare const validateContribution: (contribution: unknown) => Contribution;
export declare const validateCreateContributionRequest: (request: unknown) => CreateContributionRequest;
export declare const validateUpdateContributionRequest: (request: unknown) => UpdateContributionRequest;
export declare const validateContributionReviewRequest: (request: unknown) => ContributionReviewRequest;
export declare const validateContributionFilter: (filter: unknown) => ContributionFilter;
export declare const validateContributorProfile: (profile: unknown) => ContributorProfile;
export declare const CONTRIBUTION_TYPE_DESCRIPTIONS: {
    readonly template: "Reusable prompt templates for the marketplace";
    readonly knowledge_article: "Educational articles and guides";
    readonly tutorial: "Step-by-step learning content";
    readonly case_study: "Real-world implementation stories";
    readonly pattern_library: "Reusable design and prompt patterns";
    readonly community_post: "Community discussions and questions";
    readonly documentation: "Technical documentation";
    readonly review: "Reviews and feedback on templates";
};
export declare const CONTRIBUTION_STATUS_DESCRIPTIONS: {
    readonly draft: "Work in progress, not yet submitted";
    readonly submitted: "Submitted for review";
    readonly under_review: "Currently being reviewed by moderators";
    readonly revision_requested: "Changes requested before approval";
    readonly approved: "Approved but not yet published";
    readonly published: "Live and publicly available";
    readonly rejected: "Rejected and will not be published";
    readonly archived: "Removed from public view";
};
export declare const CONTRIBUTOR_LEVEL_DESCRIPTIONS: {
    readonly newcomer: "New to the platform";
    readonly contributor: "Has made initial contributions";
    readonly regular: "Regular contributor with good quality";
    readonly trusted: "Trusted contributor with high quality work";
    readonly expert: "Expert contributor with exceptional content";
    readonly moderator: "Community moderator and content reviewer";
};
export declare const CONTRIBUTION_DEFAULTS: {
    readonly QUALITY_THRESHOLD_PUBLISH: 70;
    readonly MIN_TITLE_LENGTH: 5;
    readonly MAX_TITLE_LENGTH: 200;
    readonly MIN_DESCRIPTION_LENGTH: 20;
    readonly MAX_DESCRIPTION_LENGTH: 2000;
    readonly MAX_TAGS: 20;
    readonly MAX_ASSETS_PER_CONTRIBUTION: 50;
    readonly MAX_ASSET_SIZE_MB: 10;
    readonly AUTO_PUBLISH_SCORE_THRESHOLD: 90;
    readonly FEATURED_CONTRIBUTION_THRESHOLD: 95;
};
//# sourceMappingURL=contributions.d.ts.map