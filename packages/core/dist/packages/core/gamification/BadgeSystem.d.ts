export interface Badge {
    id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    tier: BadgeTier;
    icon: string;
    criteria: BadgeCriteria;
    requirements: string;
    unlockMessage: string;
    rarity: BadgeRarity;
    points: number;
    prerequisites?: string;
    isVisible: boolean;
    isActive: boolean;
    metadata: {
        createdAt: number;
        updatedAt: number;
        version: string;
    };
}
export type BadgeCategory = 'verification' | 'creation' | 'collaboration' | 'marketplace' | 'community' | 'achievement' | 'milestone' | 'professional' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export interface BadgeCriteria {
    type: 'count' | 'threshold' | 'completion' | 'verification' | 'composite';
    metric?: string;
    target?: number;
    timeframe?: number;
    conditions?: Record<string, any>;
    customLogic?: (user: UserBadgeProgress) => boolean;
}
export interface UserBadge {
    badgeId: string;
    userId: string;
    unlockedAt: number;
    tier: BadgeTier;
    progress?: number;
    metadata?: Record<string, any>;
    isDisplayed: boolean;
    isNotificationSent: boolean;
}
export interface UserBadgeProgress {
    userId: string;
    badges: Map<string, UserBadge>;
    totalPoints: number;
    level: number;
    experience: number;
    streak: number;
    lastActivity: number;
    statistics: {
        templatesCreated: number;
        templatesDownloaded: number;
        projectsCompleted: number;
        collaborations: number;
        ratingsGiven: number;
        ratingsReceived: number;
        forumPosts: number;
        helpfulVotes: number;
        mentoringSessions: number;
        workshopsAttended: number;
    };
    achievements: {
        firstTemplate: boolean;
        firstCollaboration: boolean;
        firstSale: boolean;
        expertRating: boolean;
        communityLeader: boolean;
    };
}
export interface BadgeUnlockEvent {
    userId: string;
    badgeId: string;
    unlockedAt: number;
    progress: number;
    isLevelUp: boolean;
    newLevel?: number;
    pointsEarned: number;
}
export declare class BadgeSystem {
    private badges;
    private userProgress;
    private eventListeners;
    constructor();
    private initializeDefaultBadges;
}
//# sourceMappingURL=BadgeSystem.d.ts.map