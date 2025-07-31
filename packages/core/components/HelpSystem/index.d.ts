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
import { Epic16HelpSystem } from './Epic16HelpSystem';
export type { UserProfile, LearningPath } from '../ContextualHelp/HelpContentManager';
export declare     getAnalytics: () => {
        helpInteractions: Array<{
            event: string;
            data: any;
            timestamp: number;
            sessionId: string;
        }>;
        userStruggles: Array<{
            event: string;
            data: any;
            timestamp: number;
            sessionId: string;
        }>;
        effectiveness: Record<string, {
            views: number;
            helpful: number;
        }>;
    };
    getHelpEffectivenessReport: () => {,
        helpId: string;
        views: number;
        helpful: number;
        effectivenessRate: number;
    }[];
    getStruggleReport: () => {,
        type: string;
        count: number;
    }[];
};
export declare const HELP_SYSTEM_CONFIG: {
    ANALYTICS_ENABLED: boolean;
    CONTEXTUAL_TRIGGERS_ENABLED: boolean;
    MARKETPLACE_HELP_ENABLED: boolean;
    DEFAULT_HELP_DELAY: number;
    MAX_HELP_CONTENT_CACHE: number;
};
export default Epic16HelpSystem;
//# sourceMappingURL=index.d.ts.map