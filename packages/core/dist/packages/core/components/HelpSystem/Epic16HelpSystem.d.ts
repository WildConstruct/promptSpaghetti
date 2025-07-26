/**
 * Epic 16 - Integrated Marketplace Help System
 *
 * Master integration component that combines Epic 8.4 core help system
 * with Epic 16 marketplace-specific help overlay and contextual assistance.
 *
 * Features:
 * - Unified help experience across core editor and marketplace
 * - Smart context switching between help modes
 * - User journey tracking and optimization
 * - Help analytics and effectiveness measurement
 */
import React from 'react';
export interface Epic16HelpSystemProps {
    nodes?: unknown[];
    edges?: unknown[];
    selectedNodeId?: string;
    currentPage?: string;
    userRole?: 'buyer' | 'creator' | 'community-member' | 'new-user';
    userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    pageContext?: {
        template?: {
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
    };
    helpEnabled?: boolean;
    autoContextualHelp?: boolean;
    showGuidedTours?: boolean;
    helpComplexity?: 'beginner' | 'advanced';
    onHelpAnalytics?: (event: string, data: Record<string, any>) => void;
}
export declare const Epic16HelpSystem: React.FC<Epic16HelpSystemProps>;
export default Epic16HelpSystem;
//# sourceMappingURL=Epic16HelpSystem.d.ts.map