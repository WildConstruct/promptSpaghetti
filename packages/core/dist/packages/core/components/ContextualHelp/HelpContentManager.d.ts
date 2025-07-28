export interface UserProfile {
    id: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    viewedContent: Set<string>;
    completedTours: Set<string>;
    preferences: {
        showFilmTerminology: boolean;
        autoTriggerHelp: boolean;
        preferredComplexity: 'simple' | 'detailed' | 'comprehensive';
        filmIndustryRole?: 'director' | 'producer' | 'writer' | 'vfx-artist' | 'editor';
    };
    progress: {
        nodesCreated: number;
        connectionsBuilt: number;
        previewsGenerated: number;
        projectsCompleted: number;
        advancedFeaturesUsed: string;
    };
    lastActivity: Date;
}
export interface LearningPath {
    id: string;
    name: string;
    description: string;
    targetRole: string;
    steps: {
        contentId: string;
        requiredProgress?: Record<string, number>;
        unlockConditions?: string;
    }[];
}
export declare class HelpContentManager {
    private userProfile;
    private helpContent;
    private learningPaths;
    constructor(userId?: string);
    private initializeUserProfile;
    if(saved: any): any;
    private saveUserProfile;
    private loadDefaultContent;
    private loadLearningPaths;
    getContextualHelp(context: {}): any;
    nodeCount: number;
    edgeCount: number;
    selectedNodeType?: string;
    currentAction?: string;
    triggerElement?: string;
}
//# sourceMappingURL=HelpContentManager.d.ts.map