/**
 * Epic 16 Knowledge Base Search Component
 *
 * Advanced search interface with filters, suggestions, and AI-powered recommendations.
 * Supports real-time search, autocomplete, and intelligent result ranking.
 */
import React from 'react';
import { Epic16KnowledgeBaseService } from '../../services/Epic16KnowledgeBaseService';

}
interface KnowledgeBaseSearchProps {
    knowledgeService: Epic16KnowledgeBaseService;
    userId: string;
    onArticleSelect?: (articleId: string) => void;
    onSearchPerformed?: (query: string, resultCount: number) => void;
    className?: string;

export declare const KnowledgeBaseSearch: React.FC<KnowledgeBaseSearchProps>;
export default KnowledgeBaseSearch;
//# sourceMappingURL=KnowledgeBaseSearch.d.ts.map
}