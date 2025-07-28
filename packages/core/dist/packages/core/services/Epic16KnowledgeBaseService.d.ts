export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: KnowledgeCategory;
    subcategory: string;
    type: ArticleType;
    tags: string;
    keywords: string;
    sections: ArticleSection;
    attachments: ArticleAttachment;
    relatedArticles: string;
    prerequisites: string;
    author: string;
    authorId: string;
    contributors: string;
    version: string;
    lastUpdated: Date;
    publishedAt: Date;
    status: ArticleStatus;
    views: number;
    ratings: ArticleRating;
    feedback: ArticleFeedback;
    helpfulVotes: number;
    unhelpfulVotes: number;
    seoTitle?: string;
    metaDescription?: string;
    searchableText: string;
    searchScore: number;
    accessibilityFeatures: AccessibilityFeature;
    readingLevel: ReadingLevel;
    estimatedReadTime: number;
    language: string;
    translations: Record<string, string>;
    interactiveElements: InteractiveKBElement;
    codeExamples: CodeExample;
    videos: VideoContent;
    images: ImageContent;
    analytics: ArticleAnalytics;
}
export declare enum KnowledgeCategory {
    GETTING_STARTED = "getting_started",
    MARKETPLACE_GUIDE = "marketplace_guide",
    TEMPLATE_CREATION = "template_creation",
    SELLING_BUYING = "selling_buying",
    COMMUNITY_HELP = "community_help",
    TECHNICAL_DOCS = "technical_docs",
    API_REFERENCE = "api_reference",
    TROUBLESHOOTING = "troubleshooting",
    BEST_PRACTICES = "best_practices",
    POLICIES_LEGAL = "policies_legal",
    BILLING_PAYMENTS = "billing_payments",
    ACCOUNT_SECURITY = "account_security",
    INTEGRATIONS = "integrations",
    MOBILE_APP = "mobile_app",
    ADVANCED_FEATURES = "advanced_features",
    export,
    enum,
    ArticleType
}
//# sourceMappingURL=Epic16KnowledgeBaseService.d.ts.map