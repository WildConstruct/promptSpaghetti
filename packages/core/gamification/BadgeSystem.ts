/**
 * Badge System - E17-1753114397409-C91176
 * 
 * Comprehensive badge and achievement system for Wild Construct creators
 * Gamifies the platform experience while highlighting professional accomplishments
 * and building trust through verified achievements.
 */
import { identityValidationService, IdentityValidationType } from '../auth/IdentityValidation';
import { marketplaceMetrics } from '../analytics/MarketplaceMetrics';
import { conversionTracker } from '../analytics/ConversionTracker';

export interface Badge {
  id: string;
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
  metadata: {,
    createdAt: number;
    updatedAt: number;
    version: string;
  };
}

export type BadgeCategory = 
  | 'verification'
  | 'creation'
  | 'collaboration'
  | 'marketplace'
  | 'community'
  | 'achievement'
  | 'milestone'
  | 'professional'
  | 'special';

export type BadgeTier = 
  | 'bronze'
  | 'silver' 
  | 'gold'
  | 'platinum'
  | 'diamond';

export type BadgeRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface BadgeCriteria {
  type: 'count' | 'threshold' | 'completion' | 'verification' | 'composite';
  metric?: string;
  target?: number;
  timeframe?: number; // milliseconds
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
  statistics: {,
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
  achievements: {,
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

export class BadgeSystem {
  private badges: Map<string, Badge> = new Map();
  private userProgress: Map<string, UserBadgeProgress> = new Map();
  private eventListeners: Map<string, ((event: BadgeUnlockEvent) => void)[]> = new Map();
  constructor() {
    this.initializeDefaultBadges();
    this.initializeMockUserData();
  }
  private initializeDefaultBadges(): void {
    const defaultBadges: Badge[] = [
      // Verification Badges
      {
        id: 'email-verified',
        name: 'Email Verified',
        description: 'Verified email address for secure account access',
        category: 'verification',
        tier: 'bronze',
        icon: '✉️',
        criteria: { type: 'verification', metric: 'email_verification' },
        requirements: ['Verify your email address'],
        unlockMessage: 'Your email has been verified! Your account is now more secure.',
        rarity: 'common',
        points: 50,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'identity-verified',
        name: 'Identity Verified',
        description: 'Government-issued ID verification completed',
        category: 'verification',
        tier: 'gold',
        icon: '🆔',
        criteria: { type: 'verification', metric: 'government_id' },
        requirements: ['Submit and verify government-issued ID'],
        unlockMessage: 'Identity verified! You now have access to premium features.',
        rarity: 'rare',
        points: 300,
        prerequisites: ['email-verified'],
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'professional-verified',
        name: 'Professional Verified',
        description: 'Professional credentials and experience verified',
        category: 'professional',
        tier: 'platinum',
        icon: '🎭',
        criteria: { type: 'verification', metric: 'professional_credentials' },
        requirements: ['Submit and verify professional credentials', 'Portfolio verification'],
        unlockMessage: 'Professional status verified! You\'re now recognized as an industry professional.',
        rarity: 'epic',
        points: 500,
        prerequisites: ['identity-verified'],
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      // Creation Badges  
      {
        id: 'first-template',
        name: 'Template Pioneer',
        description: 'Created your first template',
        category: 'creation',
        tier: 'bronze',
        icon: '🌟',
        criteria: { type: 'count', metric: 'templates_created', target: 1 },
        requirements: ['Create and publish your first template'],
        unlockMessage: 'Welcome to the creator community! Your first template is live.',
        rarity: 'common',
        points: 100,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'prolific-creator',
        name: 'Prolific Creator',
        description: 'Created 25+ templates',
        category: 'creation',
        tier: 'gold',
        icon: '🏆',
        criteria: { type: 'count', metric: 'templates_created', target: 25 },
        requirements: ['Create and publish 25 templates'],
        unlockMessage: 'You\'re a prolific creator! Your dedication to the community is appreciated.',
        rarity: 'uncommon',
        points: 750,
        prerequisites: ['first-template'],
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'template-master',
        name: 'Template Master',
        description: 'Created 100+ high-quality templates',
        category: 'creation',
        tier: 'diamond',
        icon: '💎',
        criteria: { ,
          type: 'composite',
          customLogic: (user) => {,
            return user.statistics.templatesCreated >= 100 && 
                   user.statistics.ratingsReceived >= 4.5;
          }
        },
        requirements: ['Create 100+ templates', 'Maintain 4.5+ average rating'],
        unlockMessage: 'Template Master achieved! You\'re among the elite creators on the platform.',
        rarity: 'legendary',
        points: 2000,
        prerequisites: ['prolific-creator'],
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      // Marketplace Badges
      {
        id: 'first-sale',
        name: 'First Sale',
        description: 'Made your first template sale',
        category: 'marketplace',
        tier: 'silver',
        icon: '💰',
        criteria: { type: 'count', metric: 'sales_count', target: 1 },
        requirements: ['Sell your first template'],
        unlockMessage: 'Congratulations on your first sale! Welcome to the marketplace.',
        rarity: 'common',
        points: 200,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'bestseller',
        name: 'Bestseller',
        description: 'Template reached 1000+ downloads',
        category: 'marketplace',
        tier: 'gold',
        icon: '🔥',
        criteria: { type: 'threshold', metric: 'max_template_downloads', target: 1000 },
        requirements: ['Have a template with 1000+ downloads'],
        unlockMessage: 'Bestseller status achieved! Your template is a community favorite.',
        rarity: 'rare',
        points: 1000,
        prerequisites: ['first-sale'],
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      // Community Badges
      {
        id: 'helpful-reviewer',
        name: 'Helpful Reviewer',
        description: 'Provided 50+ helpful reviews',
        category: 'community',
        tier: 'silver',
        icon: '⭐',
        criteria: { type: 'count', metric: 'helpful_reviews', target: 50 },
        requirements: ['Give 50 helpful reviews'],
        unlockMessage: 'Thank you for being a helpful community member!',
        rarity: 'uncommon',
        points: 400,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'mentor',
        name: 'Community Mentor',
        description: 'Helped 100+ fellow creators',
        category: 'community',
        tier: 'platinum',
        icon: '🎓',
        criteria: { type: 'count', metric: 'mentoring_sessions', target: 100 },
        requirements: ['Complete 100 mentoring sessions'],
        unlockMessage: 'Community Mentor status! You\'re making a real difference.',
        rarity: 'epic',
        points: 1500,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      // Achievement Badges
      {
        id: 'early-adopter',
        name: 'Early Adopter',
        description: 'Joined during the platform beta',
        category: 'special',
        tier: 'diamond',
        icon: '🚀',
        criteria: { ,
          type: 'completion', 
          conditions: { joined_before: Date.now() + (30 * 24 * 60 * 60 * 1000) } // 30 days from now
        },
        requirements: ['Join during the beta period'],
        unlockMessage: 'Welcome, Early Adopter! Thank you for believing in our vision.',
        rarity: 'legendary',
        points: 1000,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'collaboration-king',
        name: 'Collaboration King',
        description: 'Completed 25+ successful collaborations',
        category: 'collaboration',
        tier: 'gold',
        icon: '👥',
        criteria: { type: 'count', metric: 'collaborations', target: 25 },
        requirements: ['Complete 25 collaborative projects'],
        unlockMessage: 'Collaboration King! You excel at working with others.',
        rarity: 'rare',
        points: 800,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      // Milestone Badges
      {
        id: 'level-10',
        name: 'Experienced Creator',
        description: 'Reached level 10',
        category: 'milestone',
        tier: 'silver',
        icon: '🎯',
        criteria: { type: 'threshold', metric: 'level', target: 10 },
        requirements: ['Reach level 10'],
        unlockMessage: 'Level 10 achieved! You\'re becoming an experienced creator.',
        rarity: 'common',
        points: 500,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      },
      {
        id: 'level-50',
        name: 'Master Creator',
        description: 'Reached level 50',
        category: 'milestone',
        tier: 'diamond',
        icon: '👑',
        criteria: { type: 'threshold', metric: 'level', target: 50 },
        requirements: ['Reach level 50'],
        unlockMessage: 'Master Creator status! You\'re among the platform elite.',
        rarity: 'legendary',
        points: 2500,
        isVisible: true,
        isActive: true,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' }
      }
    ];
    defaultBadges.forEach(badge => {)
      this.badges.set(badge.id, badge);
    });
  }
  private initializeMockUserData(): void {
    // Initialize sample user progress
    const sampleUsers = [;
      {
        userId: 'creator-johnsmith',
        progress: {,
          templatesCreated: 15,
          templatesDownloaded: 47,
          projectsCompleted: 8,
          collaborations: 5,
          ratingsGiven: 23,
          ratingsReceived: 4.7,
          forumPosts: 12,
          helpfulVotes: 34,
          mentoringSessions: 3,
          workshopsAttended: 2,
        },
        badges: ['email-verified', 'first-template', 'first-sale']
      },
      {
        userId: 'creator-maryjones',
        progress: {,
          templatesCreated: 32,
          templatesDownloaded: 89,
          projectsCompleted: 18,
          collaborations: 12,
          ratingsGiven: 45,
          ratingsReceived: 4.5,
          forumPosts: 28,
          helpfulVotes: 67,
          mentoringSessions: 8,
          workshopsAttended: 5,
        },
        badges: ['email-verified', 'identity-verified', 'first-template', 'prolific-creator', 'first-sale', 'helpful-reviewer']
      }
    ];
    sampleUsers.forEach(user => {)
      const userProgress: UserBadgeProgress = {
        userId: user.userId,
        badges: new Map(),
        totalPoints: 0,
        level: this.calculateLevel(user.progress.templatesCreated * 100),
        experience: user.progress.templatesCreated * 100,
        streak: 5,
        lastActivity: Date.now(),
        statistics: {,
          templatesCreated: user.progress.templatesCreated,
          templatesDownloaded: user.progress.templatesDownloaded,
          projectsCompleted: user.progress.projectsCompleted,
          collaborations: user.progress.collaborations,
          ratingsGiven: user.progress.ratingsGiven,
          ratingsReceived: user.progress.ratingsReceived,
          forumPosts: user.progress.forumPosts,
          helpfulVotes: user.progress.helpfulVotes,
          mentoringSessions: user.progress.mentoringSessions,
          workshopsAttended: user.progress.workshopsAttended,
        },
        achievements: {,
          firstTemplate: user.progress.templatesCreated > 0,
          firstCollaboration: user.progress.collaborations > 0,
          firstSale: user.badges.includes('first-sale'),
          expertRating: user.progress.ratingsReceived >= 4.5,
          communityLeader: user.progress.helpfulVotes > 50,
        }
      };
      // Add badges
      user.badges.forEach(badgeId => {)
        const badge = this.badges.get(badgeId);
        if (badge) {
          userProgress.badges.set(badgeId, {)
            badgeId,
            userId: user.userId,
            unlockedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            tier: badge.tier,
            progress: 100,
            isDisplayed: true,
            isNotificationSent: true,
          });
          userProgress.totalPoints += badge.points;
        }
      });
      this.userProgress.set(user.userId, userProgress);
    });
  }
  /**
   * Check and award badges for a user based on their current progress
   */
  public checkAndAwardBadges(userId: string): BadgeUnlockEvent[] {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) return [];
    const unlockedBadges: BadgeUnlockEvent[] = [];
    for (const [badgeId, badge] of this.badges) {
      // Skip if already unlocked
      if (userProgress.badges.has(badgeId)) continue;
      // Check prerequisites
      if (badge.prerequisites) {
        const hasPrerequisites = badge.prerequisites.every(prereq => ;);
          userProgress.badges.has(prereq)
        );
        if (!hasPrerequisites) continue;
      }
      // Check criteria
      if (this.checkBadgeCriteria(badge, userProgress)) {
        const unlockEvent = this.awardBadge(userId, badgeId);
        if (unlockEvent) {
          unlockedBadges.push(unlockEvent);
        }
      }
    }
    return unlockedBadges;
  }
  private checkBadgeCriteria(badge: Badge, userProgress: UserBadgeProgress): boolean {
    const { criteria } = badge;
    switch (criteria.type) {
    case 'verification':
      return this.checkVerificationCriteria(criteria.metric!, userProgress.userId);
    case 'count':
      const currentValue = this.getStatisticValue(criteria.metric!, userProgress);
      return currentValue >= (criteria.target || 0);
    case 'threshold':
      const thresholdValue = this.getStatisticValue(criteria.metric!, userProgress);
      return thresholdValue >= (criteria.target || 0);
    case 'completion':
      return this.checkCompletionCriteria(criteria.conditions!, userProgress);
    case 'composite':
      return criteria.customLogic ? criteria.customLogic(userProgress) : false;
    default:
      return false;
    }
  }
  private checkVerificationCriteria(metric: string, userId: string): boolean {
    const validationSummary = identityValidationService.getUserValidationSummary(userId);
    return validationSummary.completedValidations.includes(metric as IdentityValidationType);
  }
  private getStatisticValue(metric: string, userProgress: UserBadgeProgress): number {
    const stats = userProgress.statistics;
    switch (metric) {
    case 'templates_created': return stats.templatesCreated;
    case 'templates_downloaded': return stats.templatesDownloaded;
    case 'projects_completed': return stats.projectsCompleted;
    case 'collaborations': return stats.collaborations;
    case 'ratings_given': return stats.ratingsGiven;
    case 'helpful_reviews': return stats.helpfulVotes;
    case 'mentoring_sessions': return stats.mentoringSessions;
    case 'level': return userProgress.level;
    case 'sales_count': return 5; // Mock data
    case 'max_template_downloads': return 500; // Mock data
    default: return 0;
    }
  }
  private checkCompletionCriteria(conditions: Record<string, any>, userProgress: UserBadgeProgress): boolean {
    // Check custom conditions
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
      case 'joined_before':
        // This would check user registration date
        return Date.now() < value;
      default:
        return false;
      }
    }
    return true;
  }
  private awardBadge(userId: string, badgeId: string): BadgeUnlockEvent | null {
    const badge = this.badges.get(badgeId);
    const userProgress = this.getUserProgress(userId);
    if (!badge || !userProgress) return null;
    // Create user badge
    const userBadge: UserBadge = {
      badgeId,
      userId,
      unlockedAt: Date.now(),
      tier: badge.tier,
      progress: 100,
      isDisplayed: true,
      isNotificationSent: false,
    };
    // Add to user progress
    userProgress.badges.set(badgeId, userBadge);
    userProgress.totalPoints += badge.points;
    userProgress.experience += badge.points;
    // Check for level up
    const newLevel = this.calculateLevel(userProgress.experience);
    const isLevelUp = newLevel > userProgress.level;
    if (isLevelUp) {
      userProgress.level = newLevel;
    }
    // Create unlock event
    const unlockEvent: BadgeUnlockEvent = {
      userId,
      badgeId,
      unlockedAt: Date.now(),
      progress: 100,
      isLevelUp,
      newLevel: isLevelUp ? newLevel : undefined,
      pointsEarned: badge.points,
    };
    // Trigger event listeners
    this.triggerBadgeUnlockEvent(unlockEvent);
    return unlockEvent;
  }
  private calculateLevel(experience: number): number {
    // Level progression: 100 XP for level 1, then +100 per level
    return Math.floor(experience / 100) + 1;
  }
  private triggerBadgeUnlockEvent(event: BadgeUnlockEvent): void {
    const listeners = this.eventListeners.get('badge_unlock') || [];
    listeners.forEach(listener => {)
      try {
        listener(event);
      } catch (error) {
        console.error('Error in badge unlock listener:', error);
      }
    });
  }
  /**
   * Get user's badge progress
   */
  public getUserProgress(userId: string): UserBadgeProgress | null {
    return this.userProgress.get(userId) || null;
  }
  /**
   * Get all available badges
   */
  public getAllBadges(): Badge[] {
    return Array.from(this.badges.values())
      .filter(badge => badge.isVisible && badge.isActive)
      .sort((a, b) => a.points - b.points);
  }
  /**
   * Get badges by category
   */
  public getBadgesByCategory(category: BadgeCategory): Badge[] {
    return this.getAllBadges().filter(badge => badge.category === category);
  }
  /**
   * Get user's earned badges
   */
  public getUserBadges(userId: string): UserBadge[] {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) return [];
    return Array.from(userProgress.badges.values())
      .sort((a, b) => b.unlockedAt - a.unlockedAt);
  }
  /**
   * Get badge by ID
   */
  public getBadge(badgeId: string): Badge | null {
    return this.badges.get(badgeId) || null;
  }
  /**
   * Get user's badge progress for a specific badge
   */
  public getBadgeProgress(userId: string, badgeId: string): number {
    const badge = this.badges.get(badgeId);
    const userProgress = this.getUserProgress(userId);
    if (!badge || !userProgress) return 0;
    // If already unlocked, return 100%
    if (userProgress.badges.has(badgeId)) return 100;
    // Calculate progress based on criteria
    if (badge.criteria.type === 'count' || badge.criteria.type === 'threshold') {
      const currentValue = this.getStatisticValue(badge.criteria.metric!, userProgress);
      const targetValue = badge.criteria.target || 1;
      return Math.min((currentValue / targetValue) * 100, 99); // Cap at 99% until actually unlocked
    }
    return 0;
  }
  /**
   * Get leaderboard data
   */
  public getLeaderboard(limit: number = 10): Array<{
    userId: string;
    totalPoints: number;
    level: number;
    badgeCount: number;
    rank: number;
  }> {
    return Array.from(this.userProgress.values())
      .map(progress => ({)
        userId: progress.userId,
        totalPoints: progress.totalPoints,
        level: progress.level,
        badgeCount: progress.badges.size,
        rank: 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({ ...item, rank: index + 1 }))
      .slice(0, limit);
  }
  /**
   * Update user statistics
   */
  public updateUserStatistics(userId: string, updates: Partial<UserBadgeProgress['statistics']>): BadgeUnlockEvent[] {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) return [];
    // Update statistics
    Object.assign(userProgress.statistics, updates);
    userProgress.lastActivity = Date.now();
    // Check for new badge unlocks
    return this.checkAndAwardBadges(userId);
  }
  /**
   * Add event listener for badge unlocks
   */
  public onBadgeUnlock(listener: (event: BadgeUnlockEvent) => void): void {
    const listeners = this.eventListeners.get('badge_unlock') || [];
    listeners.push(listener);
    this.eventListeners.set('badge_unlock', listeners);
  }
  /**
   * Remove event listener
   */
  public removeEventListener(listener: (event: BadgeUnlockEvent) => void): void {
    const listeners = this.eventListeners.get('badge_unlock') || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  /**
   * Get badge statistics
   */
  public getBadgeStatistics(): {
    totalBadges: number;
    totalUsers: number;
    mostPopularBadge: string;
    rarest: string;
    averageBadgesPerUser: number;
    const totalBadges = this.badges.size;
    const totalUsers = this.userProgress.size;
    // Count badge unlocks
    const badgeUnlockCounts = new Map<string, number>();
    for (const userProgress of this.userProgress.values()) {
      for (const badgeId of userProgress.badges.keys()) {
        badgeUnlockCounts.set(badgeId, (badgeUnlockCounts.get(badgeId) || 0) + 1);
      }
    }
    const mostPopular = Array.from(badgeUnlockCounts.entries());
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    const rarest = Array.from(badgeUnlockCounts.entries());
      .sort(([,a], [,b]) => a - b)[0]?.[0] || '';
    const totalBadgesUnlocked = Array.from(this.userProgress.values());
      .reduce((sum, progress) => sum + progress.badges.size, 0);
    const averageBadgesPerUser = totalUsers > 0 ? totalBadgesUnlocked / totalUsers : 0;
    return {
      totalBadges,
      totalUsers,
      mostPopularBadge: mostPopular,
      rarest,
      averageBadgesPerUser
    };
  }
}

// Global instance
export const badgeSystem = new BadgeSystem();

export default badgeSystem;