/**
 * React Hook for Badge System Integration
 * 
 * Provides easy-to-use React integration for the badge and achievement system.
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  badgeSystem, 
  Badge, 
  UserBadge, 
  UserBadgeProgress, 
  BadgeUnlockEvent,
  BadgeCategory
} from '../gamification/BadgeSystem';

export interface BadgeSystemHookConfig {
  userId?: string;
  autoCheckBadges?: boolean;
  enableNotifications?: boolean;
  checkInterval?: number; // milliseconds
}

export const useBadgeSystem = (config: BadgeSystemHookConfig = {}) => {
  const { 
    userId, 
    autoCheckBadges = true, 
    enableNotifications = true,
    checkInterval = 30000 // 30 seconds
  } = config;

  const [userProgress, setUserProgress] = useState<UserBadgeProgress | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [recentUnlocks, setRecentUnlocks] = useState<BadgeUnlockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!userId) {
      setUserProgress(null);
      setUserBadges([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const progress = badgeSystem.getUserProgress(userId);
      const badges = badgeSystem.getUserBadges(userId);
      const available = badgeSystem.getAllBadges();

      setUserProgress(progress);
      setUserBadges(badges);
      setAvailableBadges(available);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load badge data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Auto-check for new badges
  const checkForNewBadges = useCallback(async () => {
    if (!userId || !autoCheckBadges) return;

    try {
      const unlockedBadges = badgeSystem.checkAndAwardBadges(userId);
      
      if (unlockedBadges.length > 0) {
        setRecentUnlocks(prev => [...unlockedBadges, ...prev].slice(0, 10)); // Keep last 10
        await loadUserData(); // Refresh data after unlocks
        
        if (enableNotifications) {
          unlockedBadges.forEach(unlock => {
            showBadgeNotification(unlock);
          });
        }
      }
    } catch (err) {
      console.error('Error checking for new badges:', err);
    }
  }, [userId, autoCheckBadges, enableNotifications, loadUserData]);

  // Show browser notification for badge unlock
  const showBadgeNotification = useCallback((unlockEvent: BadgeUnlockEvent) => {
    const badge = badgeSystem.getBadge(unlockEvent.badgeId);
    if (!badge) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Badge Unlocked!', {
        body: `${badge.name}: ${badge.description}`,
        icon: '/badge-icon.png', // You'd provide this icon
        tag: `badge-${unlockEvent.badgeId}`,
      });
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Update user statistics
  const updateStatistics = useCallback(async (updates: Partial<UserBadgeProgress['statistics']>) => {
    if (!userId) return [];

    try {
      const unlockedBadges = badgeSystem.updateUserStatistics(userId, updates);
      
      if (unlockedBadges.length > 0) {
        setRecentUnlocks(prev => [...unlockedBadges, ...prev].slice(0, 10));
        await loadUserData();
        
        if (enableNotifications) {
          unlockedBadges.forEach(unlock => {
            showBadgeNotification(unlock);
          });
        }
      }
      
      return unlockedBadges;
    } catch (err) {
      console.error('Error updating statistics:', err);
      return [];
    }
  }, [userId, loadUserData, enableNotifications, showBadgeNotification]);

  // Get badge progress
  const getBadgeProgress = useCallback((badgeId: string): number => {
    if (!userId) return 0;
    return badgeSystem.getBadgeProgress(userId, badgeId);
  }, [userId]);

  // Get badges by category
  const getBadgesByCategory = useCallback((category: BadgeCategory): Badge[] => {
    return badgeSystem.getBadgesByCategory(category);
  }, []);

  // Get next badges to unlock
  const getNextBadges = useCallback((limit: number = 5): Array<Badge & { progress: number }> => {
    if (!userId) return [];

    return availableBadges
      .filter(badge => !userBadges.some(ub => ub.badgeId === badge.id))
      .map(badge => ({
        ...badge,
        progress: getBadgeProgress(badge.id)
      }))
      .filter(badge => badge.progress > 0) // Only show badges with some progress
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  }, [userId, availableBadges, userBadges, getBadgeProgress]);

  // Get badges by tier
  const getBadgesByTier = useCallback((badges: Badge[] = availableBadges) => {
    return badges.reduce((acc, badge) => {
      if (!acc[badge.tier]) acc[badge.tier] = [];
      acc[badge.tier].push(badge);
      return acc;
    }, {} as Record<string, Badge[]>);
  }, [availableBadges]);

  // Get user statistics
  const getStatistics = useCallback(() => {
    if (!userProgress) return null;

    const stats = userProgress.statistics;
    const totalBadges = userBadges.length;
    const totalPossibleBadges = availableBadges.length;
    const completionPercentage = totalPossibleBadges > 0 
      ? Math.round((totalBadges / totalPossibleBadges) * 100) 
      : 0;

    return {
      level: userProgress.level,
      experience: userProgress.experience,
      totalPoints: userProgress.totalPoints,
      badgeCount: totalBadges,
      completionPercentage,
      streak: userProgress.streak,
      lastActivity: userProgress.lastActivity,
      ...stats
    };
  }, [userProgress, userBadges, availableBadges]);

  // Get leaderboard position
  const getLeaderboardPosition = useCallback((): number => {
    if (!userId) return 0;
    
    const leaderboard = badgeSystem.getLeaderboard(100);
    const position = leaderboard.findIndex(entry => entry.userId === userId);
    return position >= 0 ? position + 1 : 0;
  }, [userId]);

  // Mark notification as read
  const markNotificationRead = useCallback((unlockEventIndex: number) => {
    setRecentUnlocks(prev => prev.filter((_, index) => index !== unlockEventIndex));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setRecentUnlocks([]);
  }, []);

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
  }, [userId, loadUserData, requestNotificationPermission]);

  useEffect(() => {
    if (autoCheckBadges && userId) {
      const interval = setInterval(checkForNewBadges, checkInterval);
      return () => clearInterval(interval);
    }
  }, [autoCheckBadges, userId, checkForNewBadges, checkInterval]);

  // Badge unlock event listener
  useEffect(() => {
    const handleBadgeUnlock = (event: BadgeUnlockEvent) => {
      if (event.userId === userId) {
        setRecentUnlocks(prev => [event, ...prev].slice(0, 10));
        
        if (enableNotifications) {
          showBadgeNotification(event);
        }
      }
    };

    badgeSystem.onBadgeUnlock(handleBadgeUnlock);
    
    return () => {
      badgeSystem.removeEventListener(handleBadgeUnlock);
    };
  }, [userId, enableNotifications, showBadgeNotification]);

  return {
    // Core data
    userProgress,
    userBadges,
    availableBadges,
    recentUnlocks,
    isLoading,
    error,

    // Data management
    loadUserData,
    refreshData: () => loadUserData(),
    
    // Badge operations
    getBadgeProgress,
    getBadgesByCategory,
    getBadgesByTier,
    getNextBadges,
    
    // User statistics
    getStatistics,
    getLeaderboardPosition,
    
    // Notifications
    markNotificationRead,
    clearAllNotifications,
    hasUnreadNotifications: recentUnlocks.length > 0,
    
    // Tracking functions
    trackTemplateCreated,
    trackTemplateDownloaded,
    trackProjectCompleted,
    trackCollaboration,
    trackRatingGiven,
    trackHelpfulVote,
    trackMentoringSession,
    updateStatistics,
    
    // Quick access properties
    userLevel: userProgress?.level || 0,
    userExperience: userProgress?.experience || 0,
    totalPoints: userProgress?.totalPoints || 0,
    badgeCount: userBadges.length,
    completionPercentage: availableBadges.length > 0 
      ? Math.round((userBadges.length / availableBadges.length) * 100) 
      : 0,
    
    // Badge checking
    hasBadge: (badgeId: string) => userBadges.some(badge => badge.badgeId === badgeId),
    isEmailVerified: userBadges.some(badge => badge.badgeId === 'email-verified'),
    isIdentityVerified: userBadges.some(badge => badge.badgeId === 'identity-verified'),
    isProfessionalVerified: userBadges.some(badge => badge.badgeId === 'professional-verified'),
    hasFirstTemplate: userBadges.some(badge => badge.badgeId === 'first-template'),
    hasFirstSale: userBadges.some(badge => badge.badgeId === 'first-sale'),
    
    // Direct system access
    badgeSystem
  };
};

export default useBadgeSystem;