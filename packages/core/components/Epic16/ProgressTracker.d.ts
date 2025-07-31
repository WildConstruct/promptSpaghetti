/**
 * Epic 16 Progress Tracker - E16-1753114247105-8F1F68
 *
 * Comprehensive progress tracking system for template marketplace user engagement.
 * Tracks discovery, usage, contributions, achievements, and learning milestones.
 */
import React from 'react';

}
export interface UserProgress {
    userId: string;
    level: number;
    totalXP: number;
    nextLevelXP: number;
    currentLevelXP: number;
    joinDate: Date;
    lastActivity: Date;
    streakDays: number;
    longestStreak: number;


}
export interface EngagementMetrics {
    templatesViewed: number;
    searchesPerformed: number;
    categoriesExplored: number;
    filtersUsed: number;
    templatesDownloaded: number;
    templatesPurchased: number;
    templatesImplemented: number;
    projectsCompleted: number;
    templatesCreated: number;
    templatesPublished: number;
    templatesShared: number;
    reviewsWritten: number;
    likesReceived: number;
    sharesReceived: number;
    followersGained: number;
    collaborationsJoined: number;
    tutorialsCompleted: number;
    skillsLearned: string[];
    certificationsEarned: number;
    learningPathsCompleted: number;


}
export interface Milestone {
    id: string;
    title: string;
    description: string;
    category: 'discovery' | 'usage' | 'creation' | 'social' | 'learning' | 'special';
    target: number;
    current: number;
    completed: boolean;
    completedAt?: Date;
    xpReward: number;
    badgeReward?: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';


}
export interface ProgressTrackerProps {
    userId: string;
    variant?: 'full' | 'compact' | 'dashboard';
    showDetailedMetrics?: boolean;
    enableAnimations?: boolean;
    onMilestoneComplete?: (milestone: Milestone) => void;
    onLevelUp?: (newLevel: number, oldLevel: number) => void;
    className?: string;

export declare const ProgressTracker: React.FC<ProgressTrackerProps>;
export default ProgressTracker;
//# sourceMappingURL=ProgressTracker.d.ts.map
}