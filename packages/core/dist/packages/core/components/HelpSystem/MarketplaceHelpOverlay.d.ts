/**
 * Epic 16 - Marketplace Help Overlay System
 * Task: E16-1753114247197-8DC18E - Create help overlay system
 *
 * Extends the Epic 8.4 ContextualHelpSystem to provide marketplace-specific
 * help overlays, guided tours, and contextual assistance for Epic 16 features.
 *
 * Features:
 * - Marketplace-specific help overlays
 * - Template discovery guidance
 * - Purchase flow assistance
 * - Creator dashboard help
 * - Community features guidance
 */
import React from 'react';
import { HelpContent, HelpContentType } from '../ContextualHelp/ContextualHelpSystem';
import { HelpContentManager } from '../ContextualHelp/HelpContentManager';
export type MarketplaceHelpContentType = 'marketplace-discovery' | 'template-browsing' | 'purchase-flow' | 'template-preview' | 'rating-system' | 'creator-onboarding' | 'community-features' | 'profile-management' | 'monetization' | 'marketplace-navigation';
export interface MarketplaceHelpContent extends Omit<HelpContent, 'type'> {
    type: HelpContentType | MarketplaceHelpContentType;
    marketplaceContext: {
        page?: 'marketplace' | 'template-details' | 'creator-dashboard' | 'community' | 'profile';
        userRole?: 'buyer' | 'creator' | 'community-member' | 'new-user';
        templateCategory?: string;
        purchaseStage?: 'browsing' | 'preview' | 'cart' | 'checkout' | 'download';
        features?: string[];
    };
}
export interface MarketplaceHelpOverlayProps {
    currentPage?: 'marketplace' | 'template-details' | 'creator-dashboard' | 'community' | 'profile';
    userRole?: 'buyer' | 'creator' | 'community-member' | 'new-user';
    selectedTemplate?: {
        id: string;
        category: string;
        type: string;
        isPremium: boolean;
    };
    cartItems?: number;
    purchaseStage?: 'browsing' | 'preview' | 'cart' | 'checkout' | 'download';
    forumContext?: {
        category: string;
        hasPosted: boolean;
        reputation: number;
    };
    showMarketplaceHelp?: boolean;
    enableGuidedTours?: boolean;
    helpComplexity?: 'beginner' | 'advanced';
    coreHelpManager?: HelpContentManager;
    onHelpInteraction?: (action: string, context: Record<string, any>) => void;
    onTourCompleted?: (tourId: string) => void;
    onFeedbackSubmitted?: (feedback: {
        rating: number;
        comment: string;
        context: string;
    }) => void;
}
export declare const MarketplaceHelpOverlay: React.FC<MarketplaceHelpOverlayProps>;
export default MarketplaceHelpOverlay;
//# sourceMappingURL=MarketplaceHelpOverlay.d.ts.map