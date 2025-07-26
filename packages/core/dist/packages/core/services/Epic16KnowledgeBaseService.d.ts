/**
 * Epic 16 Knowledge Base Service
 *
 * Comprehensive knowledge base architecture for Epic 16 Marketplace & Community.
 * Supports articles, FAQs, tutorials, API docs, troubleshooting guides,
 * and intelligent search with AI-powered recommendations.
 */
import { EventEmitter } from 'events';
export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: KnowledgeCategory;
    subcategory: string;
    type: ArticleType;
    tags: string[];
    keywords: string[];
    sections: ArticleSection[];
    attachments: ArticleAttachment[];
    relatedArticles: string[];
    prerequisites: string[];
    author: string;
    authorId: string;
    contributors: string[];
    version: string;
    lastUpdated: Date;
    publishedAt: Date;
    status: ArticleStatus;
    views: number;
    ratings: ArticleRating[];
    feedback: ArticleFeedback[];
    helpfulVotes: number;
    unhelpfulVotes: number;
    seoTitle?: string;
    metaDescription?: string;
    searchableText: string;
    searchScore: number;
    accessibilityFeatures: AccessibilityFeature[];
    readingLevel: ReadingLevel;
    estimatedReadTime: number;
    language: string;
    translations: Record<string, string>;
    interactiveElements: InteractiveKBElement[];
    codeExamples: CodeExample[];
    videos: VideoContent[];
    images: ImageContent[];
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
    ADVANCED_FEATURES = "advanced_features"
}
export declare enum ArticleType {
    GUIDE = "guide",
    TUTORIAL = "tutorial",
    FAQ = "faq",
    REFERENCE = "reference",
    TROUBLESHOOTING = "troubleshooting",
    HOW_TO = "how_to",
    BEST_PRACTICE = "best_practice",
    CASE_STUDY = "case_study",
    VIDEO_GUIDE = "video_guide",
    API_DOC = "api_doc",
    CHANGELOG = "changelog",
    POLICY = "policy"
}
export declare enum ArticleStatus {
    DRAFT = "draft",
    UNDER_REVIEW = "under_review",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    NEEDS_UPDATE = "needs_update",
    DEPRECATED = "deprecated"
}
export declare enum ReadingLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    EXPERT = "expert"
}
export interface ArticleSection {
    id: string;
    title: string;
    content: string;
    order: number;
    type: SectionType;
    anchor: string;
    isCollapsible: boolean;
    metadata: Record<string, any>;
}
export declare enum SectionType {
    TEXT = "text",
    CODE = "code",
    IMAGE = "image",
    VIDEO = "video",
    CHECKLIST = "checklist",
    WARNING = "warning",
    TIP = "tip",
    NOTE = "note",
    QUOTE = "quote",
    TABLE = "table",
    INTERACTIVE = "interactive"
}
export interface ArticleAttachment {
    id: string;
    name: string;
    description: string;
    url: string;
    type: string;
    size: number;
    downloadCount: number;
    isPublic: boolean;
}
export interface ArticleRating {
    userId: string;
    rating: number;
    comment?: string;
    timestamp: Date;
    helpful: boolean;
}
export interface ArticleFeedback {
    id: string;
    userId: string;
    type: FeedbackType;
    message: string;
    status: FeedbackStatus;
    response?: string;
    timestamp: Date;
    resolved: boolean;
}
export declare enum FeedbackType {
    IMPROVEMENT = "improvement",
    ERROR_REPORT = "error_report",
    CONTENT_REQUEST = "content_request",
    POSITIVE = "positive",
    NEGATIVE = "negative",
    QUESTION = "question"
}
export declare enum FeedbackStatus {
    NEW = "new",
    ACKNOWLEDGED = "acknowledged",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    REJECTED = "rejected"
}
export interface AccessibilityFeature {
    type: AccessibilityType;
    description: string;
    enabled: boolean;
}
export declare enum AccessibilityType {
    SCREEN_READER = "screen_reader",
    HIGH_CONTRAST = "high_contrast",
    LARGE_TEXT = "large_text",
    KEYBOARD_NAV = "keyboard_navigation",
    ALT_TEXT = "alt_text",
    CAPTIONS = "captions",
    TRANSCRIPT = "transcript"
}
export interface InteractiveKBElement {
    id: string;
    type: InteractiveElementType;
    config: Record<string, any>;
    position: ElementPosition;
}
export declare enum InteractiveElementType {
    COLLAPSIBLE_SECTION = "collapsible_section",
    TABBED_CONTENT = "tabbed_content",
    ACCORDION = "accordion",
    TOOLTIP = "tooltip",
    MODAL = "modal",
    CAROUSEL = "carousel",
    INTERACTIVE_DEMO = "interactive_demo",
    CODE_SANDBOX = "code_sandbox",
    QUIZ = "quiz",
    CHECKLIST = "checklist"
}
export interface ElementPosition {
    sectionId: string;
    order: number;
    placement: 'before' | 'after' | 'replace' | 'inline';
}
export interface CodeExample {
    id: string;
    language: string;
    title: string;
    description: string;
    code: string;
    output?: string;
    runnable: boolean;
    githubLink?: string;
}
export interface VideoContent {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnail: string;
    duration: number;
    transcript?: string;
    captions?: string;
    chapters: VideoChapter[];
}
export interface VideoChapter {
    title: string;
    startTime: number;
    endTime: number;
    description?: string;
}
export interface ImageContent {
    id: string;
    url: string;
    alt: string;
    caption?: string;
    width: number;
    height: number;
    format: string;
    zoomable: boolean;
}
export interface ArticleAnalytics {
    totalViews: number;
    uniqueViews: number;
    averageReadTime: number;
    bounceRate: number;
    completionRate: number;
    shareCount: number;
    downloadCount: number;
    searchImpressions: number;
    searchClicks: number;
    conversionRate: number;
    dailyViews: Record<string, number>;
    popularSections: SectionAnalytics[];
    userJourney: UserJourneyStep[];
    helpfulnessScore: number;
    accuracyScore: number;
    freshnessScore: number;
    seoScore: number;
}
export interface SectionAnalytics {
    sectionId: string;
    views: number;
    timeSpent: number;
    exitRate: number;
}
export interface UserJourneyStep {
    fromArticle?: string;
    toArticle?: string;
    timestamp: Date;
    sessionId: string;
}
export interface KnowledgeBaseSearch {
    query: string;
    filters: SearchFilters;
    results: SearchResult[];
    suggestions: SearchSuggestion[];
    totalResults: number;
    searchTime: number;
    didYouMean?: string;
}
export interface SearchFilters {
    categories: KnowledgeCategory[];
    types: ArticleType[];
    tags: string[];
    readingLevel: ReadingLevel[];
    language: string[];
    lastUpdated: DateRange;
    minRating: number;
    hasVideo: boolean;
    hasCode: boolean;
}
export interface DateRange {
    start?: Date;
    end?: Date;
}
export interface SearchResult {
    article: KnowledgeBaseArticle;
    score: number;
    matchedSections: MatchedSection[];
    highlightedContent: string;
    relevanceReason: string[];
}
export interface MatchedSection {
    sectionId: string;
    title: string;
    matchScore: number;
    highlightedText: string;
}
export interface SearchSuggestion {
    text: string;
    type: SuggestionType;
    score: number;
    category?: KnowledgeCategory;
}
export declare enum SuggestionType {
    QUERY_COMPLETION = "query_completion",
    SPELLING_CORRECTION = "spelling_correction",
    RELATED_TOPIC = "related_topic",
    POPULAR_SEARCH = "popular_search"
}
export interface AIRecommendation {
    articleId: string;
    score: number;
    reason: RecommendationReason;
    context: RecommendationContext;
    personalizedFactors: PersonalizationFactor[];
}
export declare enum RecommendationReason {
    SIMILAR_CONTENT = "similar_content",
    USER_BEHAVIOR = "user_behavior",
    POPULAR_IN_CATEGORY = "popular_in_category",
    FREQUENTLY_VIEWED_TOGETHER = "frequently_viewed_together",
    BASED_ON_SEARCH = "based_on_search",
    TRENDING = "trending",
    PERSONALIZED = "personalized"
}
export interface RecommendationContext {
    currentArticleId?: string;
    userSearchHistory: string[];
    viewedArticles: string[];
    userRole: string;
    userExperience: string;
    timestamp: Date;
}
export interface PersonalizationFactor {
    type: PersonalizationType;
    weight: number;
    value: any;
}
export declare enum PersonalizationType {
    USER_ROLE = "user_role",
    SKILL_LEVEL = "skill_level",
    INTERESTS = "interests",
    BEHAVIOR_PATTERN = "behavior_pattern",
    LOCATION = "location",
    DEVICE_TYPE = "device_type",
    TIME_OF_DAY = "time_of_day"
}
export interface KnowledgeBaseConfig {
    searchConfig: SearchConfig;
    aiConfig: AIConfig;
    contentConfig: ContentConfig;
    analyticsConfig: AnalyticsConfig;
    localizationConfig: LocalizationConfig;
    integrationConfig: IntegrationConfig;
}
export interface SearchConfig {
    enableAISearch: boolean;
    enableAutoComplete: boolean;
    enableSpellCheck: boolean;
    maxResults: number;
    searchTimeout: number;
    indexUpdateInterval: number;
    boostFactors: Record<string, number>;
    stopWords: string[];
    synonyms: Record<string, string[]>;
}
export interface AIConfig {
    enableRecommendations: boolean;
    enableContentGeneration: boolean;
    enableSentimentAnalysis: boolean;
    recommendationModel: string;
    confidenceThreshold: number;
    maxRecommendations: number;
    personalizedWeight: number;
}
export interface ContentConfig {
    autoPublish: boolean;
    requireReview: boolean;
    versionControl: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
    contentModeration: boolean;
    duplicateDetection: boolean;
}
export interface AnalyticsConfig {
    trackingEnabled: boolean;
    retentionPeriod: number;
    anonymizeData: boolean;
    realTimeTracking: boolean;
    heatmapTracking: boolean;
    performanceTracking: boolean;
}
export interface LocalizationConfig {
    defaultLanguage: string;
    supportedLanguages: string[];
    autoTranslation: boolean;
    translationService: string;
    fallbackLanguage: string;
}
export interface IntegrationConfig {
    crmIntegration: boolean;
    helpDeskIntegration: boolean;
    slackIntegration: boolean;
    discordIntegration: boolean;
    emailIntegration: boolean;
    apiAccess: boolean;
    webhookSupport: boolean;
}
export declare class Epic16KnowledgeBaseService extends EventEmitter {
    private articles;
    private searchIndex;
    private userSessions;
    private analytics;
    private config;
    constructor(config?: Partial<KnowledgeBaseConfig>);
    createArticle(
      articleData: Omit<KnowledgeBaseArticle,
      'id' | 'publishedAt' | 'analytics'>
    ): Promise<KnowledgeBaseArticle>;
    updateArticle(articleId: string, updates: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle | null>;
    deleteArticle(articleId: string): Promise<boolean>;
    getArticle(articleId: string, userId?: string): Promise<KnowledgeBaseArticle | null>;
    getArticleBySlug(slug: string, userId?: string): Promise<KnowledgeBaseArticle | null>;
    searchArticles(query: string, filters?: Partial<SearchFilters>, userId?: string): Promise<KnowledgeBaseSearch>;
    getPopularArticles(category?: KnowledgeCategory, limit?: number): Promise<KnowledgeBaseArticle[]>;
    getRecentArticles(limit?: number): Promise<KnowledgeBaseArticle[]>;
    getRecommendations(context: RecommendationContext, limit?: number): Promise<AIRecommendation[]>;
    trackArticleView(articleId: string, userId: string): Promise<void>;
    trackSearch(userId: string, query: string): Promise<void>;
    submitFeedback(articleId: string, feedback: Omit<ArticleFeedback, 'id' | 'timestamp'>): Promise<ArticleFeedback>;
    rateArticle(articleId: string, rating: Omit<ArticleRating, 'timestamp'>): Promise<void>;
    private initializeConfig;
    private initializeAnalytics;
    private updateSearchIndex;
    private removeFromSearchIndex;
    private performSearch;
    private matchesFilters;
    private calculateSearchScore;
    private calculateAverageRating;
    private findMatchedSections;
    private generateHighlightedContent;
    private generateRelevanceReasons;
    private generateSearchSuggestions;
    private generateDidYouMean;
    private levenshteinDistance;
    private calculateRecommendationScore;
    private determineRecommendationReason;
    private getPersonalizationFactors;
    private getUserSession;
    private updateHelpfulnessScore;
    private incrementVersion;
}
export interface UserKBSession {
    userId: string;
    sessionStart: Date;
    viewedArticles: Set<string>;
    searchHistory: SearchHistoryItem[];
    preferences: UserKBPreferences;
}
export interface SearchHistoryItem {
    query: string;
    timestamp: Date;
    results: number;
}
export interface UserKBPreferences {
    favoriteCategories?: KnowledgeCategory[];
    preferredReadingLevel?: ReadingLevel;
    language?: string;
    emailNotifications?: boolean;
    darkMode?: boolean;
}
export default Epic16KnowledgeBaseService;
//# sourceMappingURL=Epic16KnowledgeBaseService.d.ts.map