/**
 * Epic 8.4 - Help Content Management System
 *
 * Manages contextual help content with intelligent content delivery,
 * user proficiency tracking, and director-friendly guidance.
 *
 * Features:
 * - Dynamic help content management
 * - User proficiency level tracking
 * - Context-aware content delivery
 * - Film industry terminology integration
 * - Progressive learning path management
 */
import { HelpContent } from './ContextualHelpSystem';
export interface UserProfile {
    id: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    viewedContent: Set<string>;
    completedTours: Set<string>;
    preferences: {,
        showFilmTerminology: boolean;
        autoTriggerHelp: boolean;
        preferredComplexity: 'simple' | 'detailed' | 'comprehensive';
        filmIndustryRole?: 'director' | 'producer' | 'writer' | 'vfx-artist' | 'editor';
    };
    progress: {,
        nodesCreated: number;
        connectionsBuilt: number;
        previewsGenerated: number;
        projectsCompleted: number;
        advancedFeaturesUsed: string[];
    };
    lastActivity: Date;
}
export interface LearningPath {
    id: string;
    name: string;
    description: string;
    targetRole: string;
    steps: {,
        contentId: string;
        requiredProgress?: Record<string, number>;
        unlockConditions?: string[];
    }[];
}
export declare class HelpContentManager {
    private userProfile;
    private helpContent;
    private learningPaths;
    constructor(userId?: string);
    private initializeUserProfile;
    private saveUserProfile;
    private loadDefaultContent;
    private loadLearningPaths;
    getContextualHelp(context: {)
        nodeCount: number;
        edgeCount: number;
        selectedNodeType?: string;
        currentAction?: string;
        triggerElement?: string;
    }): HelpContent[];
    markContentViewed(contentId: string): void;
    updateProgress(progressType: keyof UserProfile['progress'], value: number | string): void;
    private checkLevelProgression;
    getCurrentLearningPath(): LearningPath | null;
    getNextLearningStep(): HelpContent | null;
    getUserProfile(): UserProfile;
    updateUserPreferences(preferences: Partial<UserProfile['preferences']>): void;
    onLevelUp?: (newLevel: string) => void;
    onProgressMilestone?: (milestone: string) => void;
}
export declare const helpContentManager: HelpContentManager;
export default helpContentManager;
//# sourceMappingURL=HelpContentManager.d.ts.map