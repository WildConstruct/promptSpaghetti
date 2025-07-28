/**
 * Epic 16 Interactive Elements Integration
 *
 * Main integration component that orchestrates all interactive elements
 * for the Epic 16 Marketplace & Community system.
 */
import React from 'react';
interface Epic16InteractiveElementsProps {
    userId: string;
    userName: string;
    userAvatar?: string;
    userRole: 'user' | 'creator' | 'admin';
    userTier: 'free' | 'premium' | 'enterprise';
    pageContext: {,
        pageUrl: string;
        pageType: 'marketplace' | 'community' | 'profile' | 'template' | 'learning';
        templateId?: string;
        categoryId?: string;
    };
    onElementInteraction?: (elementId: string, interaction: unknown) => void;
    onAnalyticsUpdate?: (analytics: unknown) => void;
}
export declare const Epic16InteractiveElements: React.FC<Epic16InteractiveElementsProps>;
export default Epic16InteractiveElements;
//# sourceMappingURL=Epic16InteractiveElements.d.ts.map