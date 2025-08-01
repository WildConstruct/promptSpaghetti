/**
 * Badge System - E17-1753114397409-C91176
 *
 * Comprehensive badge and achievement system for Wild Construct creators
 * Gamifies the platform experience while highlighting professional accomplishments
 * and building trust through verified achievements.
 */

}
}
export interface Badge { id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    tier: BadgeTier;
    icon: string;
    criteria: BadgeCriteria;
    requirements: string[];
    unlockMessage: string;
    rarity: BadgeRarity;
    points: number;
    prerequisites?: string[];
    isVisible: boolean;
    isActive: boolean;
    metadata: {
        createdAt: number;
        updatedAt: number;
        version: string }
}
    };

export type BadgeCategory = 'verification' | 'creation' | 'collaboration' | 'marketplace' | 'community' | 'achievement' | 'milestone' | 'professional' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

}
}
export interface BadgeCriteria { type: 'count' | 'threshold' | 'completion' | 'verification' | 'composite';
    metric?: string;
    target?: number;
    timeframe?: number;
    conditions?: Record<string, any>;
    customLogic?: (user: UserBadgeProgress) => boolean }
}
}
export interface UserBadge { badgeId: string;
    userId: string;
    unlockedAt: number;
    tier: BadgeTier;
    progress?: number;
    metadata?: Record<string, any>;
    isDisplayed: boolean;
    isNotificationSent: boolean }
}
}
export interface UserBadgeProgress { userId: string;
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
        workshopsAttended: number }
}
    };
    achievements: { firstTemplate: boolean;
        firstCollaboration: boolean;
        firstSale: boolean;
        expertRating: boolean;
        communityLeader: boolean };

}
}
export interface BadgeUnlockEvent { userId: string;
    badgeId: string;
    unlockedAt: number;
    progress: number;
    isLevelUp: boolean;
    newLevel?: number;
    pointsEarned: number;

export declare class BadgeSystem {
    private badges;
    private userProgress;
    private eventListeners;
    constructor();
    private initializeDefaultBadges;
    private initializeMockUserData;
    /**
     * Check and award badges for a user based on their current progress
     */
    checkAndAwardBadges(userId: string): BadgeUnlockEvent[];
    private checkBadgeCriteria;
    private checkVerificationCriteria;
    private getStatisticValue;
    private checkCompletionCriteria;
    private awardBadge;
    private calculateLevel;
    private triggerBadgeUnlockEvent;
    /**
     * Get user's badge progress
     */
    getUserProgress(userId: string): UserBadgeProgress | null;
    /**
     * Get all available badges
     */
    getAllBadges(): Badge[];
    /**
     * Get badges by category
     */
    getBadgesByCategory(category: BadgeCategory): Badge[];
    /**
     * Get user's earned badges
     */
    getUserBadges(userId: string): UserBadge[];
    /**
     * Get badge by ID
     */
    getBadge(badgeId: string): Badge | null;
    /**
     * Get user's badge progress for a specific badge
     */
    getBadgeProgress(userId: string, badgeId: string): number;
    /**
     * Get leaderboard data
     */
    getLeaderboard(limit?: number): Array<{
        userId: string;
        totalPoints: number;
        level: number;
        badgeCount: number;
        rank: number }
}
    }>;
    /**
     * Update user statistics
     */
    updateUserStatistics(userId: string, updates: Partial<UserBadgeProgress['statistics']>): BadgeUnlockEvent[];
    /**
     * Add event listener for badge unlocks
     */
    onBadgeUnlock(listener: (event: BadgeUnlockEvent) => void): void;
    /**
     * Remove event listener
     */
    removeEventListener(listener: (event: BadgeUnlockEvent) => void): void;
    /**
     * Get badge statistics
     */
    getBadgeStatistics(): { totalBadges: number;
        totalUsers: number;
        mostPopularBadge: string;
        rarest: string;
        averageBadgesPerUser: number };

export declare const badgeSystem: BadgeSystem;
export default badgeSystem;
//# sourceMappingURL=BadgeSystem.d.ts.map