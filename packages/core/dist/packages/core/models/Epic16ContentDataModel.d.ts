/**
 * Epic 16 Content Data Model
 *
 * Comprehensive data models for Epic 16 marketplace and community content
 * including templates, versions, purchases, reviews, forum posts, and analytics.
 */
import { z } from 'zod';
export declare enum TemplateStatus {
    DRAFT = "draft",
    LISTED = "listed",
    BLOCKED = "blocked",
    ARCHIVED = "archived",
    UNDER_REVIEW = "under_review",
    REJECTED = "rejected",
    export,
    enum,
    PurchaseStatus
}
export type Template = z.infer<typeof TemplateSchema>;
export declare const TemplateVersionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;
export declare const PurchaseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export declare const ReviewSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Review = z.infer<typeof ReviewSchema>;
export declare const ForumPostSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ForumPost = z.infer<typeof ForumPostSchema>;
export declare const KnowledgeArticleSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
export declare const TutorialSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Tutorial = z.infer<typeof TutorialSchema>;
export declare const UserAnalyticsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
export declare const ContentAnalyticsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ContentAnalytics = z.infer<typeof ContentAnalyticsSchema>;
export declare const SearchQuerySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export declare const CollectionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Collection = z.infer<typeof CollectionSchema>;
export declare const NotificationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Epic16ContentModel = {
    UserProfile: UserProfile;
    Template: Template;
    TemplateVersion: TemplateVersion;
    Purchase: Purchase;
    Review: Review;
    ForumPost: ForumPost;
    KnowledgeArticle: KnowledgeArticle;
    Tutorial: Tutorial;
    UserAnalytics: UserAnalytics;
    ContentAnalytics: ContentAnalytics;
    SearchQuery: SearchQuery;
    Collection: Collection;
    Notification: Notification;
};
export declare const Epic16ContentSchemas: {
    UserProfile: any;
    Template: any;
    TemplateVersion: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    Purchase: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    Review: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    ForumPost: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    KnowledgeArticle: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    Tutorial: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    UserAnalytics: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    ContentAnalytics: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    SearchQuery: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    Collection: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    Notification: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
};
export declare function validateContentModel<T extends keyof Epic16ContentModel>(): any;
//# sourceMappingURL=Epic16ContentDataModel.d.ts.map