/**
 * Epic 16 Knowledge Base Article Viewer
 *
 * Comprehensive article viewing component with table of contents,
 * interactive elements, feedback system, and accessibility features.
 */
import React from 'react';
import { KnowledgeBaseArticle, Epic16KnowledgeBaseService } from '../../services/Epic16KnowledgeBaseService';
interface KnowledgeBaseArticleViewerProps {
    article: KnowledgeBaseArticle;
    knowledgeService: Epic16KnowledgeBaseService;
    userId: string;
    onArticleSelect?: (articleId: string) => void;
    onClose?: () => void;
}
export declare const KnowledgeBaseArticleViewer: React.FC<KnowledgeBaseArticleViewerProps>;
export default KnowledgeBaseArticleViewer;
//# sourceMappingURL=KnowledgeBaseArticleViewer.d.ts.map