import { HelpContentManager } from '../components/ContextualHelp/HelpContentManager';
export interface MarketplaceHelpContext {
    currentView: MarketplaceView;
    templateId?: string;
    searchQuery?: string;
    selectedCategory?: string;
    userRole: 'buyer' | 'seller' | 'admin';
    userId: string;
    isFirstVisit: boolean;
    recentActivity: string;
    marketplace: {
        templateCount: number;
        purchaseHistory: number;
        favoriteCategories: string;
        searchHistory: string;
        currentFilters: Record<string, any>;
    };
}
export type MarketplaceView = 'home' | 'search' | 'template-detail' | 'purchase-flow' | 'user-profile' | 'seller-dashboard' | 'transaction-history' | 'support' | 'getting-started';
export interface IntegratedHelpSystem {
    graphContext?: {
        nodes: any;
        edges: any;
        selectedNodeId?: string;
        isEditing: boolean;
        currentTool?: string;
    };
    marketplaceContext?: MarketplaceHelpContext;
    activeHelpSession?: HelpSession;
    transitionContext?: TransitionContext;
}
export interface HelpSession {
    id: string;
    userId: string;
    startTime: Date;
    currentStep: number;
    totalSteps: number;
    sessionType: HelpSessionType;
    context: IntegratedHelpSystem;
    completedActions: string;
    skippedContent: string;
    helpfulnessRatings: Record<string, number>;
    supportTicketId?: string;
    escalationLevel: number;
    requiresHumanAssistance: boolean;
}
export type HelpSessionType = 'onboarding' | 'feature-discovery' | 'troubleshooting' | 'purchase-assistance' | 'template-creation' | 'marketplace-navigation';
export interface TransitionContext {
    fromSystem: 'graph-editor' | 'marketplace';
    toSystem: 'graph-editor' | 'marketplace';
    transitionReason: string;
    preserveContext: boolean;
    continuousHelp: boolean;
}
export declare class Epic16HelpIntegrationArchitecture {
    private graphHelpManager;
    private marketplaceHelpContent;
    private activeHelpSessions;
    private integrationPoints;
    constructor(graphHelpManager: HelpContentManager);
    private setupIntegrationPoints;
    /**
    * Architecture for cross-system help content management
    */
    private initializeMarketplaceContent;
    private determinePrimaryContext;
    private getMarketplaceHelpContent;
}
//# sourceMappingURL=Epic16HelpIntegrationArchitecture.d.ts.map