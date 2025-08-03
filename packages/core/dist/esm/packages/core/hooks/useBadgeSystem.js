/**
 * React Hook for Badge System Integration
 *
 * Provides easy-to-use React integration for the badge and achievement system.
 */
import { useEffect, useState, useCallback } from 'react';
import { badgeSystem } from BadgeCategory;
from;
'../gamification/BadgeSystem';
export const useBadgeSystem = (config = {}) => {
    const { userId, autoCheckBadges = true, enableNotifications = true };
    checkInterval = 30000 // 30 seconds
        = config;
    const [userProgress, setUserProgress] = useState(null);
    const [userBadges, setUserBadges] = useState([]);
    const [availableBadges, setAvailableBadges] = useState([]);
    const [recentUnlocks, setRecentUnlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Load user data
    const loadUserData = useCallback(async () => {
        if (!userId) {
            setUserProgress(null);
            setUserBadges([]);
            return;
            setIsLoading(true);
            setError(null);
            try {
                const progress = badgeSystem.getUserProgress(userId);
                const badges = badgeSystem.getUserBadges(userId);
                const available = badgeSystem.getAllBadges();
                setUserProgress(progress);
                setUserBadges(badges);
                setAvailableBadges(available);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load badge data');
            }
            finally {
                setIsLoading(false);
            }
            [userId];
        }
    });
    // Auto-check for new badges
    const checkForNewBadges = useCallback(async () => {
        if (!userId || !autoCheckBadges)
            return;
        try {
            const unlockedBadges = badgeSystem.checkAndAwardBadges(userId);
            if (unlockedBadges.length > 0) {
                setRecentUnlocks(prev => [...unlockedBadges, ...prev].slice(0, 10)); // Keep last 10
                await loadUserData(); // Refresh data after unlocks
                if (enableNotifications) {
                    unlockedBadges.forEach(unlock => { });
                    showBadgeNotification(unlock);
                }
            }
        }
        finally { }
    });
    try {
    }
    catch (err) {
        console.error('Error checking for new badges:', err);
    }
    [userId, autoCheckBadges, enableNotifications, loadUserData];
    ;
    // Show browser notification for badge unlock
    const showBadgeNotification = useCallback((unlockEvent) => {
        const badge = badgeSystem.getBadge(unlockEvent.badgeId);
        if (!badge)
            return;
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Badge Unlocked!', {});
            body: `${badge.name}: ${badge.description}`;
        }
        icon: '/badge-icon.png', // You'd provide this icon
            tag;
        `badge-${unlockEvent.badgeId}`;
    });
};
[];
;
// Request notification permission
const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    [];
});
// Update user statistics
const updateStatistics = useCallback(async (updates) => {
    if (!userId)
        return [];
    try {
        const unlockedBadges = badgeSystem.updateUserStatistics(userId, updates);
        if (unlockedBadges.length > 0) {
            setRecentUnlocks(prev => [...unlockedBadges, ...prev].slice(0, 10));
            await loadUserData();
            if (enableNotifications) {
                unlockedBadges.forEach(unlock => { });
                showBadgeNotification(unlock);
            }
        }
    }
    finally { }
});
return unlockedBadges;
try {
}
catch (err) {
    console.error('Error updating statistics:', err);
    return [];
}
[userId, loadUserData, enableNotifications, showBadgeNotification];
;
// Get badge progress
const getBadgeProgress = useCallback((badgeId) => {
    if (!userId)
        return 0;
    return badgeSystem.getBadgeProgress(userId, badgeId);
}, [userId]);
// Get badges by category
const getBadgesByCategory = useCallback((category) => { return badgeSystem.getBadgesByCategory(category); }, []);
// Get next badges to unlock
const getNextBadges = useCallback((limit = 5) => {
    if (!userId)
        return [];
    return availableBadges
        .filter(badge => !userBadges.some(ub => ub.badgeId === badge.id))
        .map(badge => ({}), ...badge, progress, getBadgeProgress(badge.id));
});
filter(badge => badge.progress > 0) // Only show badges with some progress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);
[userId, availableBadges, userBadges, getBadgeProgress];
;
// Get badges by tier
const getBadgesByTier = useCallback((badges = availableBadges) => {
    return badges.reduce((acc, badge) => {
        if (!acc[badge.tier])
            acc[badge.tier] = [];
        acc[badge.tier].push(badge);
        return acc;
    }, {});
}, [availableBadges]);
// Get user statistics
const getStatistics = useCallback(() => {
    if (!userProgress)
        return null;
    const stats = userProgress.statistics;
    const totalBadges = userBadges.length;
    const totalPossibleBadges = availableBadges.length;
    const completionPercentage = totalPossibleBadges > 0;
})
    ? Math.round((totalBadges / totalPossibleBadges) * 100)
    : 0;
return {
    level: userProgress.level,
    experience: userProgress.experience,
    totalPoints: userProgress.totalPoints,
    badgeCount: totalBadges,
    completionPercentage,
    streak: userProgress.streak,
    lastActivity: userProgress.lastActivity
};
stats;
;
[userProgress, userBadges, availableBadges];
;
// Get leaderboard position
const getLeaderboardPosition = useCallback(() => {
    if (!userId)
        return 0;
    const leaderboard = badgeSystem.getLeaderboard(100);
    const position = leaderboard.findIndex(entry => entry.userId === userId);
    return position >= 0 ? position + 1 : 0;
}, [userId]);
// Mark notification as read
const markNotificationRead = useCallback((unlockEventIndex) => { setRecentUnlocks(prev => prev.filter((_, index) => index !== unlockEventIndex)); }, []);
// Clear all notifications
const clearAllNotifications = useCallback(() => { setRecentUnlocks([]); }, []);
// Track specific achievements
const trackTemplateCreated = useCallback(() => {
    updateStatistics({ templatesCreated: (userProgress?.statistics.templatesCreated || 0) + 1 });
}, [updateStatistics, userProgress]);
const trackTemplateDownloaded = useCallback(() => {
    updateStatistics({ templatesDownloaded: (userProgress?.statistics.templatesDownloaded || 0) + 1 });
}, [updateStatistics, userProgress]);
const trackProjectCompleted = useCallback(() => {
    updateStatistics({ projectsCompleted: (userProgress?.statistics.projectsCompleted || 0) + 1 });
}, [updateStatistics, userProgress]);
const trackCollaboration = useCallback(() => {
    updateStatistics({ collaborations: (userProgress?.statistics.collaborations || 0) + 1 });
}, [updateStatistics, userProgress]);
const trackRatingGiven = useCallback(() => {
    updateStatistics({ ratingsGiven: (userProgress?.statistics.ratingsGiven || 0) + 1 });
}, [updateStatistics, userProgress]);
const trackHelpfulVote = useCallback(() => {
    updateStatistics({ helpfulVotes: (userProgress?.statistics.helpfulVotes || 0) + 1 });
}, [updateStatistics, userProgress]);
const trackMentoringSession = useCallback(() => {
    updateStatistics({ mentoringSessions: (userProgress?.statistics.mentoringSessions || 0) + 1 });
}, [updateStatistics, userProgress]);
// Setup effects
useEffect(() => {
    if (userId) {
        loadUserData();
        requestNotificationPermission();
    }
    [userId, loadUserData, requestNotificationPermission];
});
useEffect(() => {
    if (autoCheckBadges && userId) {
        const interval = setInterval(checkForNewBadges, checkInterval);
        return () => clearInterval(interval);
    }
    [autoCheckBadges, userId, checkForNewBadges, checkInterval];
});
// Badge unlock event listener
useEffect(() => {
    const handleBadgeUnlock = (event) => { };
    if (event.userId === userId) {
        setRecentUnlocks(prev => [event, ...prev].slice(0, 10));
        if (enableNotifications) {
            showBadgeNotification(event);
        }
        ;
        badgeSystem.onBadgeUnlock(handleBadgeUnlock);
        return () => { badgeSystem.removeEventListener(handleBadgeUnlock); };
    }
    [userId, enableNotifications, showBadgeNotification];
});
return {
    userProgress,
    userBadges,
    availableBadges,
    recentUnlocks,
    isLoading,
    error
    // Data management
    ,
    // Data management
    loadUserData,
    refreshData: () => loadUserData()
    // Badge operations
    ,
    // Badge operations
    getBadgeProgress,
    getBadgesByCategory,
    getBadgesByTier,
    getNextBadges
    // User statistics
    ,
    // User statistics
    getStatistics,
    getLeaderboardPosition
    // Notifications
    ,
    // Notifications
    markNotificationRead,
    clearAllNotifications,
    hasUnreadNotifications: recentUnlocks.length > 0
    // Tracking functions
    ,
    // Tracking functions
    trackTemplateCreated,
    trackTemplateDownloaded,
    trackProjectCompleted,
    trackCollaboration,
    trackRatingGiven,
    trackHelpfulVote,
    trackMentoringSession,
    updateStatistics
    // Quick access properties
    ,
    // Quick access properties
    userLevel: userProgress?.level || 0,
    userExperience: userProgress?.experience || 0,
    totalPoints: userProgress?.totalPoints || 0,
    badgeCount: userBadges.length,
    completionPercentage: availableBadges.length > 0
        ? Math.round((userBadges.length / availableBadges.length) * 100)
        : 0
    // Badge checking
    ,
    // Badge checking
    hasBadge: (badgeId) => userBadges.some(badge => badge.badgeId === badgeId),
    isEmailVerified: userBadges.some(badge => badge.badgeId === 'email-verified'),
    isIdentityVerified: userBadges.some(badge => badge.badgeId === 'identity-verified'),
    isProfessionalVerified: userBadges.some(badge => badge.badgeId === 'professional-verified'),
    hasFirstTemplate: userBadges.some(badge => badge.badgeId === 'first-template'),
    hasFirstSale: userBadges.some(badge => badge.badgeId === 'first-sale')
};
// Direct system access
badgeSystem;
;
;
export default useBadgeSystem;
