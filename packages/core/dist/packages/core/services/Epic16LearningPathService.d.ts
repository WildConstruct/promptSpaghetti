export interface LearningPath {
    id: string;
    title: string;
    description: string;
    category: LearningCategory;
    difficulty: DifficultyLevel;
    estimatedDuration: number;
    modules: LearningModule;
    prerequisites: string;
    outcomes: LearningOutcome;
    resources: LearningResource;
    assessments: Assessment;
    certification?: Certification;
    targetAudience: TargetAudience;
    tags: string;
    skillsRequired: Skill;
    skillsAcquired: Skill;
    interactiveElements: InteractiveElement;
    progressTracking: ProgressTracking;
    gamification: GamificationElements;
    author: string;
    version: string;
    status: ContentStatus;
    lastUpdated: Date;
    publishedAt?: Date;
    analytics: PathAnalytics;
    marketplaceIntegration: MarketplaceIntegration;
    communityIntegration: CommunityIntegration;
}
export declare enum LearningCategory {
    MARKETPLACE_BASICS = "marketplace_basics",
    TEMPLATE_CREATION = "template_creation",
    SELLING_STRATEGIES = "selling_strategies",
    BUYING_GUIDE = "buying_guide",
    COMMUNITY_ENGAGEMENT = "community_engagement",
    TECHNICAL_SKILLS = "technical_skills",
    BUSINESS_DEVELOPMENT = "business_development",
    DESIGN_FUNDAMENTALS = "design_fundamentals",
    MARKETING = "marketing",
    LEGAL_COMPLIANCE = "legal_compliance",
    ADVANCED_FEATURES = "advanced_features",
    CERTIFICATION_PREP = "certification_prep",
    export,
    enum,
    DifficultyLevel
}
//# sourceMappingURL=Epic16LearningPathService.d.ts.map