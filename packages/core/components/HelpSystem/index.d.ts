/**
 * Epic 16 - Marketplace Help System Exports
 *
 * Unified exports for all Epic 16 marketplace help system components.
 * Extends Epic 8.4 contextual help with marketplace-specific functionality.
 */
export { Epic16HelpSystem } from './Epic16HelpSystem';
export type { Epic16HelpSystemProps } from './Epic16HelpSystem';
export { MarketplaceHelpOverlay } from './MarketplaceHelpOverlay';
export type { MarketplaceHelpOverlayProps, MarketplaceHelpContent, MarketplaceHelpContentType } from './MarketplaceHelpOverlay';
export { MarketplaceContextualHelp } from './MarketplaceContextualHelp';
export type { MarketplaceContextualHelpProps, ContextualTriggerType, UserBehaviorContext, ContextualHelpRule } from './MarketplaceContextualHelp';
export { ContextualHelpSystem } from '../ContextualHelp/ContextualHelpSystem';
export type { HelpContent, HelpContentType, ContextualHelpProps } from '../ContextualHelp/ContextualHelpSystem';
export { HelpContentManager } from '../ContextualHelp/HelpContentManager';
export type { UserProfile, LearningPath } from '../ContextualHelp/HelpContentManager';
export declare const createMarketplaceHelpContext: (page: string, userRole: string, templateData?: any, userBehavior?: any) => {
    currentPage: string;
    userRole: string;
    pageContext: {
        template: any;
        cartItems: any;
        purchaseStage: any;
        forumContext: any;
    };
};
export declare const initializeHelpAnalytics: () => {
    trackEvent: (event: string, data: Record<string, any>) => void;
    getAnalytics: () => {
        helpInteractions: any[];
        userStruggles: any[];
        effectiveness: Record<string, {
            views: number;
            helpful: number;
        }>;
    };
    getHelpEffectivenessReport: () => {
        helpId: string;
        views: number;
        helpful: number;
        effectivenessRate: number;
    }[];
    getStruggleReport: () => {
        type: string;
        count: unknown;
    }[];
};
export declare const HELP_SYSTEM_DEFAULTS: {
    TRIGGER_SENSITIVITY: {
        LOW: {
            timeThreshold: number;
            interactionThreshold: number;
        };
        MEDIUM: {
            timeThreshold: number;
            interactionThreshold: number;
        };
        HIGH: {
            timeThreshold: number;
            interactionThreshold: number;
        };
    };
    COOLDOWN_PERIODS: {
        FIRST_TIME: number;
        QUICK_TIP: number;
        FEATURE_HELP: number;
        STRUGGLE_HELP: number;
        TOUR_PROMPT: number;
    };
    USER_LEVELS: {
        BEGINNER: {
            maxComplexity: string;
            autoTrigger: boolean;
        };
        INTERMEDIATE: {
            maxComplexity: string;
            autoTrigger: boolean;
        };
        ADVANCED: {
            maxComplexity: string;
            autoTrigger: boolean;
        };
        PROFESSIONAL: {
            maxComplexity: string;
            autoTrigger: boolean;
        };
    };
};
export default Epic16HelpSystem;
//# sourceMappingURL=index.d.ts.map