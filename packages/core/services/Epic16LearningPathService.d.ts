/**
 * Epic 16 Learning Path Service
 *
 * Comprehensive learning path system for Epic 16 Marketplace & Community Features.
 * Provides adaptive learning experiences, skill tracking, certification paths,
 * and personalized content recommendations.
 */
import { EventEmitter } from 'events';

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    category: LearningCategory;
    difficulty: DifficultyLevel;
    estimatedDuration: number;
    modules: LearningModule[];
    prerequisites: string[];
    outcomes: LearningOutcome[];
    resources: LearningResource[];
    assessments: Assessment[];
    certification?: Certification;
    targetAudience: TargetAudience[];
    tags: string[];
    skillsRequired: Skill[];
    skillsAcquired: Skill[];
    interactiveElements: InteractiveElement[];
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
    CERTIFICATION_PREP = "certification_prep"

export declare enum DifficultyLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    EXPERT = "expert"

export declare enum TargetAudience {
    NEW_USERS = "new_users",
    TEMPLATE_CREATORS = "template_creators",
    MARKETPLACE_SELLERS = "marketplace_sellers",
    BUYERS = "buyers",
    COMMUNITY_MODERATORS = "community_moderators",
    DEVELOPERS = "developers",
    DESIGNERS = "designers",
    BUSINESS_USERS = "business_users",
    ENTERPRISE_USERS = "enterprise_users"

export declare enum ContentStatus {
    DRAFT = "draft",
    REVIEW = "review",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    DEPRECATED = "deprecated"

export interface LearningModule {
    id: string;
    title: string;
    description: string;
    type: ModuleType;
    duration: number;
    order: number;
    content: ModuleContent[];
    activities: LearningActivity[];
    quiz?: Quiz;
    prerequisites: string[];
    mandatory: boolean;
    completionCriteria: CompletionCriteria;
    progressWeight: number;

export declare enum ModuleType {
    INTRODUCTION = "introduction",
    LESSON = "lesson",
    TUTORIAL = "tutorial",
    HANDS_ON = "hands_on",
    ASSESSMENT = "assessment",
    PROJECT = "project",
    DISCUSSION = "discussion",
    REVIEW = "review"

export interface ModuleContent {
    id: string;
    type: ContentType;
    title: string;
    content: string;
    url?: string;
    metadata: ContentMetadata;
    interactive: boolean;
    duration: number;

export declare enum ContentType {
    TEXT = "text",
    VIDEO = "video",
    AUDIO = "audio",
    IMAGE = "image",
    INTERACTIVE_DEMO = "interactive_demo",
    CODE_EXAMPLE = "code_example",
    TEMPLATE_SHOWCASE = "template_showcase",
    CASE_STUDY = "case_study",
    WEBINAR = "webinar",
    WORKSHEET = "worksheet",
    CHECKLIST = "checklist",
    SIMULATION = "simulation"

export interface ContentMetadata {
    transcriptAvailable: boolean;
    captionsAvailable: boolean;
    downloadable: boolean;
    offlineAccess: boolean;
    mobileOptimized: boolean;
    accessibility: AccessibilityFeatures;
    language: string;
    alternativeFormats: string[];


export interface AccessibilityFeatures {
    screenReaderFriendly: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
    audioDescriptions: boolean;
    signLanguage: boolean;


export interface LearningActivity {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    instructions: string[];
    estimatedTime: number;
    config: ActivityConfig;
    resources: ActivityResource[];
    validation: ActivityValidation;
    feedback: ActivityFeedback;
    attempts: number;
    completionRequired: boolean;

export declare enum ActivityType {
    MULTIPLE_CHOICE = "multiple_choice",
    TRUE_FALSE = "true_false",
    FILL_IN_BLANK = "fill_in_blank",
    DRAG_DROP = "drag_drop",
    CODING_EXERCISE = "coding_exercise",
    TEMPLATE_CREATION = "template_creation",
    MARKETPLACE_SIMULATION = "marketplace_simulation",
    COMMUNITY_INTERACTION = "community_interaction",
    REFLECTION = "reflection",
    PEER_REVIEW = "peer_review",
    PORTFOLIO_SUBMISSION = "portfolio_submission",
    CASE_STUDY_ANALYSIS = "case_study_analysis"

export interface ActivityConfig {
    parameters: Record<string, any>;
    timeLimit?: number;
    attemptsAllowed: number;
    passingScore?: number;
    randomizeOptions: boolean;
    showHints: boolean;
    allowCollaboration: boolean;


export interface ActivityResource {
    type: 'template' | 'tool' | 'reference' | 'example';
    name: string;
    url: string;
    description: string;
    downloadable: boolean;


export interface ActivityValidation {
    type: 'automatic' | 'manual' | 'peer_review' | 'instructor';
    criteria: ValidationCriteria[];
    rubric?: AssessmentRubric;


export interface ValidationCriteria {
    name: string;
    description: string;
    weight: number;
    required: boolean;
    measurable: boolean;


export interface ActivityFeedback {
    immediate: FeedbackItem[];
    onCompletion: FeedbackItem[];
    onFailure: FeedbackItem[];
    personalized: boolean;
    adaptive: boolean;


export interface FeedbackItem {
    type: 'text' | 'video' | 'link' | 'tip' | 'correction';
    content: string;
    url?: string;
    condition?: string;


export interface Quiz {
    id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    timeLimit?: number;
    passingScore: number;
    attemptsAllowed: number;
    randomizeQuestions: boolean;
    showResults: boolean;
    certificateEligible: boolean;


export interface QuizQuestion {
    id: string;
    type: QuestionType;
    question: string;
    explanation?: string;
    points: number;
    difficulty: DifficultyLevel;
    options?: QuestionOption[];
    correctAnswer: any;
    hints: string[];
    tags: string[];

export declare enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    MULTIPLE_SELECT = "multiple_select",
    TRUE_FALSE = "true_false",
    FILL_IN_BLANK = "fill_in_blank",
    SHORT_ANSWER = "short_answer",
    ESSAY = "essay",
    MATCHING = "matching",
    ORDERING = "ordering",
    HOTSPOT = "hotspot"

export interface QuestionOption {
    id: string;
    text: string;
    correct: boolean;
    explanation?: string;


export interface CompletionCriteria {
    type: 'time_based' | 'activity_based' | 'score_based' | 'custom';
    requirements: CompletionRequirement[];
    allRequired: boolean;


export interface CompletionRequirement {
    type: string;
    value: any;
    description: string;
    weight: number;


export interface LearningOutcome {
    id: string;
    description: string;
    measurable: boolean;
    assessmentMethod: string;
    skillsAcquired: string[];
    bloomLevel: BloomLevel;

export declare enum BloomLevel {
    REMEMBER = "remember",
    UNDERSTAND = "understand",
    APPLY = "apply",
    ANALYZE = "analyze",
    EVALUATE = "evaluate",
    CREATE = "create"

export interface LearningResource {
    id: string;
    title: string;
    type: ResourceType;
    url: string;
    description: string;
    format: string;
    size?: number;
    duration?: number;
    downloadable: boolean;
    external: boolean;
    lastUpdated: Date;

export declare enum ResourceType {
    TEMPLATE = "template",
    DOCUMENT = "document",
    VIDEO = "video",
    AUDIO = "audio",
    TOOL = "tool",
    REFERENCE = "reference",
    EXAMPLE = "example",
    WORKSHEET = "worksheet",
    CHECKLIST = "checklist",
    CASE_STUDY = "case_study"

export interface Assessment {
    id: string;
    title: string;
    type: AssessmentType;
    description: string;
    weight: number;
    passingScore: number;
    timeLimit?: number;
    attemptsAllowed: number;
    items: AssessmentItem[];
    rubric?: AssessmentRubric;
    randomizeItems: boolean;
    showFeedback: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
    proctored: boolean;
    proctoringSettings?: ProctoringSettings;

export declare enum AssessmentType {
    FORMATIVE = "formative",
    SUMMATIVE = "summative",
    DIAGNOSTIC = "diagnostic",
    PEER_ASSESSMENT = "peer_assessment",
    SELF_ASSESSMENT = "self_assessment",
    PORTFOLIO = "portfolio",
    PROJECT = "project",
    PRESENTATION = "presentation"

export interface AssessmentItem {
    id: string;
    type: string;
    content: any;
    points: number;
    rubricCriteria?: string[];


export interface AssessmentRubric {
    id: string;
    name: string;
    description: string;
    criteria: RubricCriterion[];
    levels: RubricLevel[];


export interface RubricCriterion {
    id: string;
    name: string;
    description: string;
    weight: number;


export interface RubricLevel {
    id: string;
    name: string;
    description: string;
    points: number;


export interface ProctoringSettings {
    recordVideo: boolean;
    recordAudio: boolean;
    recordScreen: boolean;
    preventCopyPaste: boolean;
    blockNavigation: boolean;
    requireWebcam: boolean;
    faceDetection: boolean;
    environmentScan: boolean;


export interface Certification {
    id: string;
    name: string;
    description: string;
    issuer: string;
    validityPeriod: number;
    renewalRequired: boolean;
    renewalProcess: string[];
    prerequisites: CertificationRequirement[];
    assessmentRequirements: AssessmentRequirement[];
    verifiable: boolean;
    blockchainBacked: boolean;
    digitalBadge: DigitalBadge;
    industryRecognition: string[];
    cpeCredits?: number;
    accreditation: string[];


export interface CertificationRequirement {
    type: 'course_completion' | 'assessment_score' | 'portfolio_submission' | 'experience';
    description: string;
    value: any;
    mandatory: boolean;


export interface AssessmentRequirement {
    assessmentId: string;
    minimumScore: number;
    attemptsAllowed: number;
    timeframe?: number;


export interface DigitalBadge {
    id: string;
    imageUrl: string;
    metadataUrl: string;
    openBadgeCompliant: boolean;
    shareableUrl: string;
    verificationUrl: string;


export interface Skill {
    id: string;
    name: string;
    category: SkillCategory;
    level: SkillLevel;
    description: string;
    verifiable: boolean;
    marketValue: number;

export declare enum SkillCategory {
    TECHNICAL = "technical",
    DESIGN = "design",
    BUSINESS = "business",
    COMMUNICATION = "communication",
    LEADERSHIP = "leadership",
    CREATIVE = "creative",
    ANALYTICAL = "analytical",
    MARKETPLACE = "marketplace",
    COMMUNITY = "community"

export declare enum SkillLevel {
    NOVICE = "novice",
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    EXPERT = "expert",
    MASTER = "master"

export interface InteractiveElement {
    id: string;
    type: InteractiveType;
    title: string;
    description: string;
    configuration: InteractiveConfig;
    triggers: InteractiveTrigger[];
    analytics: InteractiveAnalytics;

export declare enum InteractiveType {
    TOOLTIP = "tooltip",
    HOTSPOT = "hotspot",
    GUIDED_TOUR = "guided_tour",
    INTERACTIVE_DIAGRAM = "interactive_diagram",
    SIMULATION = "simulation",
    VIRTUAL_LAB = "virtual_lab",
    BRANCHING_SCENARIO = "branching_scenario",
    GAME_ELEMENT = "game_element",
    AR_EXPERIENCE = "ar_experience",
    VR_EXPERIENCE = "vr_experience"

export interface InteractiveConfig {
    parameters: Record<string, any>;
    responsive: boolean;
    accessibility: boolean;
    offlineSupport: boolean;
    mobileOptimized: boolean;


export interface InteractiveTrigger {
    event: string;
    condition: string;
    action: string;
    parameters: Record<string, any>;


export interface InteractiveAnalytics {
    trackInteractions: boolean;
    trackTime: boolean;
    trackProgress: boolean;
    trackErrors: boolean;
    customEvents: string[];


export interface ProgressTracking {
    enableTracking: boolean;
    trackingGranularity: 'module' | 'activity' | 'detailed';
    syncAcrossDevices: boolean;
    offlineSync: boolean;
    trackTimeSpent: boolean;
    trackAttempts: boolean;
    trackPaths: boolean;
    trackInteractions: boolean;
    generateReports: boolean;
    reportingInterval: 'real_time' | 'daily' | 'weekly' | 'monthly';
    stakeholderReports: string[];


export interface GamificationElements {
    enabled: boolean;
    pointsSystem: PointsSystem;
    badges: Badge[];
    leaderboards: Leaderboard[];
    achievements: Achievement[];
    challenges: Challenge[];
    streaks: StreakTracking;


export interface PointsSystem {
    enabled: boolean;
    pointTypes: PointType[];
    conversion: PointConversion[];
    redemption: PointRedemption[];


export interface PointType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    value: number;


export interface PointConversion {
    fromType: string;
    toType: string;
    ratio: number;
    conditions: string[];


export interface PointRedemption {
    item: string;
    cost: number;
    description: string;
    availability: 'limited' | 'unlimited';
    conditions: string[];


export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: BadgeRarity;
    criteria: BadgeCriteria[];
    stackable: boolean;
    shareable: boolean;

export declare enum BadgeRarity {
    COMMON = "common",
    UNCOMMON = "uncommon",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary"

export interface BadgeCriteria {
    type: string;
    condition: string;
    value: any;
    timeframe?: number;


export interface Leaderboard {
    id: string;
    name: string;
    description: string;
    metric: string;
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
    scope: 'global' | 'cohort' | 'path' | 'module';
    maxEntries: number;
    anonymous: boolean;


export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    difficulty: DifficultyLevel;
    criteria: AchievementCriteria[];
    rewards: AchievementReward[];
    hidden: boolean;
    oneTime: boolean;

export declare enum AchievementCategory {
    COMPLETION = "completion",
    PERFORMANCE = "performance",
    ENGAGEMENT = "engagement",
    SOCIAL = "social",
    STREAK = "streak",
    MILESTONE = "milestone",
    SPECIAL = "special"

export interface AchievementCriteria {
    type: string;
    condition: string;
    value: any;
    cumulative: boolean;


export interface AchievementReward {
    type: 'points' | 'badge' | 'certificate' | 'unlock' | 'discount' | 'item';
    value: any;
    description: string;


export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    difficulty: DifficultyLevel;
    duration: number;
    startDate: Date;
    endDate: Date;
    eligibilityCriteria: string[];
    prerequisites: string[];
    rewards: ChallengeReward[];
    leaderboard: boolean;
    maxParticipants?: number;
    teamBased: boolean;
    publicResults: boolean;

export declare enum ChallengeType {
    COMPLETION = "completion",
    SPEED = "speed",
    ACCURACY = "accuracy",
    CREATIVITY = "creativity",
    COLLABORATION = "collaboration",
    COMMUNITY = "community",
    MILESTONE = "milestone"

export interface ChallengeReward {
    rank: number;
    type: string;
    value: any;
    description: string;


export interface StreakTracking {
    enabled: boolean;
    types: StreakType[];
    rewards: StreakReward[];
    resetConditions: string[];


export interface StreakType {
    id: string;
    name: string;
    description: string;
    activity: string;
    frequency: 'daily' | 'weekly' | 'custom';
    minRequirement: number;


export interface StreakReward {
    streakType: string;
    milestones: StreakMilestone[];


export interface StreakMilestone {
    days: number;
    reward: AchievementReward;
    special: boolean;


export interface PathAnalytics {
    enrollments: number;
    completions: number;
    completionRate: number;
    averageTimeToComplete: number;
    averageScore: number;
    satisfactionRating: number;
    averageTimeSpent: number;
    dropoffPoints: DropoffPoint[];
    popularModules: ModulePopularity[];
    audienceBreakdown: AudienceMetrics;
    deviceUsage: DeviceMetrics;
    geographicDistribution: GeographicMetrics;
    difficultyRating: number;
    helpRequestRate: number;
    retakeRate: number;
    improvementSuggestions: ImprovementSuggestion[];
    contentGaps: ContentGap[];


export interface DropoffPoint {
    moduleId: string;
    activityId?: string;
    percentage: number;
    commonReasons: string[];


export interface ModulePopularity {
    moduleId: string;
    viewCount: number;
    completionRate: number;
    rating: number;
    timeSpent: number;


export interface AudienceMetrics {
    byRole: Record<TargetAudience, number>;
    byExperience: Record<DifficultyLevel, number>;
    byGoal: Record<string, number>;


export interface DeviceMetrics {
    desktop: number;
    mobile: number;
    tablet: number;
    preferredPlatform: string;


export interface GeographicMetrics {
    countries: Record<string, number>;
    timezones: Record<string, number>;
    languages: Record<string, number>;


export interface ImprovementSuggestion {
    area: string;
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;


export interface ContentGap {
    topic: string;
    requestedBy: number;
    difficulty: DifficultyLevel;
    urgency: 'high' | 'medium' | 'low';


export interface MarketplaceIntegration {
    enabled: boolean;
    linkedTemplates: string[];
    sellingOpportunities: SellingOpportunity[];
    buyingRecommendations: BuyingRecommendation[];
    earningPotential: EarningPotential;
    marketplaceTools: MarketplaceTool[];


export interface SellingOpportunity {
    type: 'template' | 'service' | 'consultation' | 'course';
    description: string;
    potentialEarnings: number;
    difficulty: DifficultyLevel;
    timeInvestment: number;
    marketDemand: 'high' | 'medium' | 'low';


export interface BuyingRecommendation {
    itemType: 'template' | 'tool' | 'service' | 'course';
    itemId: string;
    reason: string;
    relevanceScore: number;
    priceRange: string;


export interface EarningPotential {
    skillLevel: SkillLevel;
    averageHourlyRate: number;
    marketDemand: number;
    competitionLevel: number;
    growthProjection: string;


export interface MarketplaceTool {
    name: string;
    description: string;
    url: string;
    type: 'free' | 'premium' | 'trial';
    relevantModules: string[];


export interface CommunityIntegration {
    enabled: boolean;
    forumLinks: ForumLink[];
    discussionTopics: DiscussionTopic[];
    mentorshipProgram: MentorshipProgram;
    peerLearning: PeerLearning;
    communityEvents: CommunityEvent[];


export interface ForumLink {
    title: string;
    url: string;
    relevantModules: string[];
    activityLevel: 'high' | 'medium' | 'low';


export interface DiscussionTopic {
    id: string;
    title: string;
    description: string;
    category: string;
    moduleId?: string;
    participantCount: number;
    messageCount: number;


export interface MentorshipProgram {
    enabled: boolean;
    availableMentors: Mentor[];
    matchingCriteria: MatchingCriteria[];
    sessionFormats: SessionFormat[];


export interface Mentor {
    id: string;
    name: string;
    expertise: string[];
    rating: number;
    availability: string;
    languages: string[];
    price?: number;


export interface MatchingCriteria {
    type: 'skill' | 'experience' | 'goal' | 'industry' | 'language';
    weight: number;
    required: boolean;


export interface SessionFormat {
    type: '1-on-1' | 'group' | 'workshop' | 'office_hours';
    duration: number;
    maxParticipants: number;
    price?: number;


export interface PeerLearning {
    enabled: boolean;
    studyGroups: StudyGroup[];
    peerReview: PeerReview;
    collaborativeProjects: CollaborativeProject[];


export interface StudyGroup {
    id: string;
    name: string;
    description: string;
    pathId: string;
    memberCount: number;
    maxMembers: number;
    schedule: string;
    language: string;


export interface PeerReview {
    enabled: boolean;
    reviewCriteria: string[];
    reviewersPerSubmission: number;
    anonymousReview: boolean;
    qualityControl: boolean;


export interface CollaborativeProject {
    id: string;
    title: string;
    description: string;
    skills: string[];
    teamSize: number;
    duration: number;
    outcome: string;


export interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    type: 'webinar' | 'workshop' | 'challenge' | 'showcase' | 'networking';
    date: Date;
    duration: number;
    capacity?: number;
    price?: number;
    relatedPaths: string[];


export interface UserEnrollment {
    userId: string;
    pathId: string;
    enrolledAt: Date;
    status: EnrollmentStatus;
    progress: UserProgress;
    settings: UserSettings;
    analytics: UserAnalytics;

export declare enum EnrollmentStatus {
    ENROLLED = "enrolled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    PAUSED = "paused",
    DROPPED = "dropped",
    CERTIFIED = "certified"

export interface UserProgress {
    overallProgress: number;
    currentModule: string;
    completedModules: string[];
    completedActivities: string[];
    timeSpent: number;
    lastAccessed: Date;
    moduleProgress: Record<string, ModuleProgress>;
    assessmentScores: Record<string, number>;
    quizAttempts: Record<string, QuizAttempt[]>;
    skillsProgress: Record<string, SkillProgress>;
    certifications: UserCertification[];


export interface ModuleProgress {
    progress: number;
    timeSpent: number;
    completedActivities: string[];
    lastAccessed: Date;
    attempts: number;
    score?: number;


export interface QuizAttempt {
    attemptNumber: number;
    score: number;
    timeSpent: number;
    completedAt: Date;
    answers: Record<string, any>;


export interface SkillProgress {
    currentLevel: SkillLevel;
    experience: number;
    nextLevelRequirement: number;
    lastUpdated: Date;
    verificationStatus: 'pending' | 'verified' | 'expired';


export interface UserCertification {
    certificationId: string;
    issuedAt: Date;
    expiresAt?: Date;
    verificationCode: string;
    digitalBadgeUrl: string;
    status: 'active' | 'expired' | 'revoked';


export interface UserSettings {
    notifications: NotificationSettings;
    preferences: LearningPreferences;
    accessibility: AccessibilitySettings;
    privacy: PrivacySettings;


export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: NotificationType[];

export declare enum NotificationType {
    PROGRESS_UPDATES = "progress_updates",
    REMINDERS = "reminders",
    NEW_CONTENT = "new_content",
    ACHIEVEMENTS = "achievements",
    COMMUNITY_ACTIVITY = "community_activity",
    MENTOR_MESSAGES = "mentor_messages",
    DEADLINES = "deadlines"

export interface LearningPreferences {
    learningStyle: LearningStyle[];
    pace: 'self_paced' | 'structured' | 'intensive';
    contentFormat: ContentType[];
    language: string;
    timezone: string;
    studyTime: StudyTimePreference[];

export declare enum LearningStyle {
    VISUAL = "visual",
    AUDITORY = "auditory",
    KINESTHETIC = "kinesthetic",
    READING = "reading",
    SOCIAL = "social",
    SOLITARY = "solitary"

export interface StudyTimePreference {
    day: string;
    startTime: string;
    endTime: string;
    timezone: string;


export interface AccessibilitySettings {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    captionsEnabled: boolean;
    audioDescriptions: boolean;
    keyboardNavigation: boolean;


export interface PrivacySettings {
    profileVisibility: 'public' | 'community' | 'private';
    progressSharing: boolean;
    leaderboardParticipation: boolean;
    mentorshipAvailability: boolean;
    dataCollection: boolean;
    marketingCommunications: boolean;


export interface UserAnalytics {
    totalTimeSpent: number;
    averageSessionTime: number;
    completionRate: number;
    streaks: UserStreak[];
    achievements: UserAchievement[];
    badges: UserBadge[];
    preferredTimes: TimePattern[];
    deviceUsage: Record<string, number>;
    contentPreferences: Record<ContentType, number>;
    averageScore: number;
    improvementRate: number;
    strengthAreas: string[];
    improvementAreas: string[];


export interface UserStreak {
    type: string;
    current: number;
    longest: number;
    startDate: Date;
    lastActivity: Date;


export interface UserAchievement {
    achievementId: string;
    unlockedAt: Date;
    progress: number;
    tier?: number;


export interface UserBadge {
    badgeId: string;
    earnedAt: Date;
    count: number;
    shareCount: number;


export interface TimePattern {
    hour: number;
    dayOfWeek: number;
    frequency: number;
    avgDuration: number;


/**
 * Epic 16 Learning Path Service
 *
 * Comprehensive learning management system with adaptive paths,
 * skill tracking, gamification, and marketplace integration.
 */
export declare class Epic16LearningPathService extends EventEmitter {
    private learningPaths;
    private userEnrollments;
    private userProgress;
    private analytics;
    constructor();
    /**
     * Create a new learning path
     */
    createLearningPath(pathData: Omit<LearningPath, 'id' | 'lastUpdated' | 'analytics'>): Promise<LearningPath>;
    /**
     * Enroll user in learning path
     */
    enrollUser(userId: string, pathId: string, settings?: Partial<UserSettings>): Promise<UserEnrollment | null>;
    /**
     * Update user progress
     */
    updateProgress(userId: string, pathId: string, moduleId: string, activityId?: string, data?: any): Promise<UserProgress | null>;
    /**
     * Get user's learning paths
     */
    getUserPaths(userId: string): Promise<UserEnrollment[]>;
    /**
     * Get learning path by ID
     */
    getLearningPath(pathId: string): Promise<LearningPath | null>;
    /**
     * Search learning paths
     */
    searchLearningPaths(query: string, filters?: {)
        category?: LearningCategory[];
        difficulty?: DifficultyLevel[];
        audience?: TargetAudience[];
        duration?: {
            min?: number;
            max?: number;
        };
        certification?: boolean;
    }): Promise<LearningPath[]>;
    /**
     * Get recommendations for user
     */
    getRecommendations(userId: string, limit?: number): Promise<LearningPath[]>;
    /**
     * Get learning analytics
     */
    getAnalytics(pathId?: string, userId?: string): Promise<any>;
    private generatePathId;
    private calculateUserAnalytics;
    private calculatePlatformAnalytics;
    private calculateSkillsAcquired;
    private calculateAverageRating;
    private getPopularCategories;
    private calculateGrowthMetrics;
    private initializeSamplePaths;

export default Epic16LearningPathService;
//# sourceMappingURL=Epic16LearningPathService.d.ts.map