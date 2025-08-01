/**
 * Epic 16 Knowledge Base Integration
 *
 * Main integration component that brings together the knowledge base
 * search, article viewing, and management capabilities for Epic 16
 * Marketplace & Community features.
 */
import React from 'react';

}
}
interface Epic16KnowledgeBaseProps {
    userId: string;
    userRole: 'user' | 'creator' | 'admin';
    initialView?: 'search' | 'browse' | 'article';
    initialArticleId?: string;
    onAnalytics?: (analytics: unknown) => void;

export declare const Epic16KnowledgeBase: React.FC<Epic16KnowledgeBaseProps>;
export default Epic16KnowledgeBase;
//# sourceMappingURL=Epic16KnowledgeBase.d.ts.map
}
}