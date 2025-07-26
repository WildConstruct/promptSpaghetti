/**
 * Epic 16 Help Integration Architecture
 * Task: E16-1753114247189-025428 - Create integration architecture
 *
 * Integration architecture for connecting Epic 8 Contextual Help System
 * with Epic 16 Marketplace & Community Features, providing seamless
 * help experience across graph editing and marketplace workflows.
 */
import { HelpContent } from '../components/ContextualHelp/ContextualHelpSystem';
import { HelpContentManager, UserProfile } from '../components/ContextualHelp/HelpContentManager';
import { MarketplaceTicket } from './Epic16TicketIntegrationService';
export interface MarketplaceHelpContext {
    currentView: MarketplaceView;
    templateId?: string;
    searchQuery?: string;
    selectedCategory?: string;
    userRole: 'buyer' | 'seller' | 'admin';
    userId: string;
    isFirstVisit: boolean;
    recentActivity: string[];
    marketplace: {
        templateCount: number;
        purchaseHistory: number;
        favoriteCategories: string[];
        searchHistory: string[];
        currentFilters: Record<string, any>;
    };
}
export type MarketplaceView = 'home' | 'search' | 'template-detail' | 'purchase-flow' | 'user-profile' | 'seller-dashboard' | 'transaction-history' | 'support' | 'getting-started';
export interface IntegratedHelpSystem {
    graphContext?: {
        nodes: any[];
        edges: any[];
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
    completedActions: string[];
    skippedContent: string[];
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
    /**
     * Core integration architecture that bridges Epic 8 and Epic 16 help systems
     */
    getIntegratedHelpContent(context: IntegratedHelpSystem, userProfile: UserProfile): Promise<HelpContent[]>;
    /**
     * Architecture for seamless transitions between graph editing and marketplace
     */
    handleSystemTransition(
      fromContext: 'graph-editor' | 'marketplace',
      toContext: 'graph-editor' | 'marketplace',
      userId: string,
      preserveHelp?: boolean
    ): Promise<TransitionContext>;
    /**
     * Integration with Epic 16 support escalation system
     */
    escalateToSupport(
      helpSession: HelpSession,
      escalationReason: string,
      additionalContext?: Record<string,
      any>
    ): Promise<MarketplaceTicket>;
    private setupIntegrationPoints;
    /**
     * Architecture for cross-system help content management
     */
    private initializeMarketplaceContent;
    private determinePrimaryContext;
    private getMarketplaceHelpContent;
    private getTransitionHelpContent;
    private prioritizeHelpContent;
    private isContentRelevantToView;
    private detectTransitionReason;
    private generateEscalationDescription;
    private determineSupportPriority;
    private mapHelpCategoryToTicketCategory;
}
export interface IntegrationPoint {
    id: string;
    fromSystem: 'graph-editor' | 'marketplace';
    toSystem: 'graph-editor' | 'marketplace';
    triggerCondition: string;
    helpContent: string;
    priority: 'low' | 'medium' | 'high';
}
export default Epic16HelpIntegrationArchitecture;
//# sourceMappingURL=Epic16HelpIntegrationArchitecture.d.ts.map