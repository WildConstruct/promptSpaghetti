/**
 * React Hook for Badge System Integration
 *
 * Provides easy-to-use React integration for the badge and achievement system.
 */
import { Badge, UserBadge, UserBadgeProgress, BadgeUnlockEvent, BadgeCategory } from '../gamification/BadgeSystem';
export interface BadgeSystemHookConfig {
    userId?: string;
    autoCheckBadges?: boolean;
    enableNotifications?: boolean;
    checkInterval?: number;
}
export declare const useBadgeSystem: (config?: BadgeSystemHookConfig) => {
    userProgress: UserBadgeProgress | null;
    userBadges: UserBadge[];
    availableBadges: Badge[];
    recentUnlocks: BadgeUnlockEvent[];
    isLoading: boolean;
    error: string | null;
    loadUserData: () => Promise<void>;
    refreshData: () => Promise<void>;
    getBadgeProgress: (badgeId: string) => number;
    getBadgesByCategory: (category: BadgeCategory) => Badge[];
    getBadgesByTier: (badges?: Badge[]) => Record<string, Badge[]>;
    getNextBadges: (limit?: number) => Array<Badge & {,
        progress: number;
    }>;
    getStatistics: () => {,
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
        level: number;
        experience: number;
        totalPoints: number;
        badgeCount: number;
        completionPercentage: number;
        streak: number;
        lastActivity: number;
    } | null;
    getLeaderboardPosition: () => number;
    markNotificationRead: (unlockEventIndex: number) => void;
    clearAllNotifications: () => void;
    hasUnreadNotifications: boolean;
    trackTemplateCreated: () => void;
    trackTemplateDownloaded: () => void;
    trackProjectCompleted: () => void;
    trackCollaboration: () => void;
    trackRatingGiven: () => void;
    trackHelpfulVote: () => void;
    trackMentoringSession: () => void;
    updateStatistics: (updates: Partial<UserBadgeProgress["statistics"]>) => Promise<BadgeUnlockEvent[]>;
    userLevel: number;
    userExperience: number;
    totalPoints: number;
    badgeCount: number;
    completionPercentage: number;
    hasBadge: (badgeId: string) => boolean;
    isEmailVerified: boolean;
    isIdentityVerified: boolean;
    isProfessionalVerified: boolean;
    hasFirstTemplate: boolean;
    hasFirstSale: boolean;
    badgeSystem: import("../gamification/BadgeSystem").BadgeSystem;
};
export default useBadgeSystem;
//# sourceMappingURL=useBadgeSystem.d.ts.map