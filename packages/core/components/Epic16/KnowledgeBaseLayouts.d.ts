/**
 * Epic 16 Knowledge Base UI Layouts - E16-1753114247069-7900C5
 *
 * Professional UI layouts for displaying knowledge content, articles, guides, and documentation
 * with excellent UX for discovery and reading across the template marketplace ecosystem.
 */
import React from 'react';
import type { Article, ArticleCategory, ArticleAuthor } from './ArticleManagement';
export interface KnowledgeBaseSection {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{,
        className?: string;
    }>;
    articles: Article[];
    color: string;
    featured: boolean;
}
export interface LearningPath {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    steps: LearningPathStep[];
    prerequisites?: string[];
    completionRate: number;
    enrolledCount: number;
    completedCount: number;
    tags: string[];
    author: ArticleAuthor;
    createdAt: Date;
    updatedAt: Date;
}
export interface LearningPathStep {
    id: string;
    title: string;
    type: 'article' | 'video' | 'quiz' | 'exercise' | 'template';
    resourceId: string;
    estimatedTime: number;
    required: boolean;
    completed?: boolean;
    order: number;
}
export interface SearchResult {
    id: string;
    title: string;
    excerpt: string;
    type: 'article' | 'learning-path' | 'template' | 'tutorial';
    url: string;
    relevanceScore: number;
    category: string;
    tags: string[];
    matchedTerms: string[];
}
export interface KnowledgeBaseStats {
    totalArticles: number;
    totalViews: number;
    totalCategories: number;
    totalAuthors: number;
    recentlyUpdated: Article[];
    popularArticles: Article[];
    featuredContent: Article[];
}
export interface KnowledgeBaseHeroProps {
    stats: KnowledgeBaseStats;
    onSearch: (query: string) => void;
    onBrowseCategory: (categoryId: string) => void;
    featuredSections: KnowledgeBaseSection[];
}
export interface ArticleCardProps {
    article: Article;
    variant?: 'compact' | 'detailed' | 'featured' | 'list';
    showAuthor?: boolean;
    showCategory?: boolean;
    showStats?: boolean;
    showExcerpt?: boolean;
    onClick?: (article: Article) => void;
    onBookmark?: (article: Article) => void;
    onLike?: (article: Article) => void;
    onShare?: (article: Article) => void;
    className?: string;
}
export interface CategoryBrowserProps {
    categories: ArticleCategory[];
    onSelectCategory: (category: ArticleCategory) => void;
    layout?: 'grid' | 'list' | 'tree';
    showArticleCount?: boolean;
}
export interface LearningPathCardProps {
    learningPath: LearningPath;
    variant?: 'compact' | 'detailed';
    showProgress?: boolean;
    currentUserProgress?: number;
    onClick?: (path: LearningPath) => void;
    onEnroll?: (path: LearningPath) => void;
}
export declare const KnowledgeBaseHero: React.FC<KnowledgeBaseHeroProps>;
export declare const ArticleCard: React.FC<ArticleCardProps>;
export declare const CategoryBrowser: React.FC<CategoryBrowserProps>;
export declare const LearningPathCard: React.FC<LearningPathCardProps>;
export interface KnowledgeBaseLayoutProps {
    articles: Article[];
    categories: ArticleCategory[];
    learningPaths?: LearningPath[];
    stats: KnowledgeBaseStats;
    layout?: 'grid' | 'list' | 'masonry';
    onSearch: (query: string) => void;
    onSelectCategory: (category: ArticleCategory) => void;
    onSelectArticle: (article: Article) => void;
    onSelectLearningPath?: (path: LearningPath) => void;
    className?: string;
}
export declare const KnowledgeBaseLayout: React.FC<KnowledgeBaseLayoutProps>;
export default KnowledgeBaseLayout;
//# sourceMappingURL=KnowledgeBaseLayouts.d.ts.map