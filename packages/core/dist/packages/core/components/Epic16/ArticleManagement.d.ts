/**
 * Epic 16 Article Management System - E16-1753114247073-332A94
 *
 * Comprehensive system for creating, editing, organizing, and managing knowledge base articles
 * for templates, tutorials, best practices, and marketplace documentation.
 */
import React from 'react';
export interface Article {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    status: 'draft' | 'published' | 'archived' | 'review';
    category: ArticleCategory;
    tags: string;
    author: ArticleAuthor;
    collaborators?: ArticleAuthor;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    viewCount: number;
    likeCount: number;
    shareCount: number;
    bookmarkCount: number;
    readTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    featured: boolean;
    attachments?: ArticleAttachment;
    relatedArticles?: string;
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string;
    };
    analytics: {
        averageRating: number;
        ratingCount: number;
        completionRate: number;
        bounceRate: number;
    };
}
export interface ArticleCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    icon?: string;
    parentId?: string;
    articleCount: number;
}
export interface ArticleAuthor {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'editor' | 'contributor' | 'guest';
    bio?: string;
    socialLinks?: {
        twitter?: string;
        github?: string;
        linkedin?: string;
    };
}
export interface ArticleAttachment {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document' | 'video' | 'audio' | 'archive';
    size: number;
    mimeType: string;
}
export interface ArticleFilter {
    status?: Article['status'][];
    category?: string;
    tags?: string;
    author?: string;
    difficulty?: Article['difficulty'][];
    dateRange?: {
        start: Date;
        end: Date;
    };
    featured?: boolean;
    searchQuery?: string;
}
export interface ArticleSort {
    field: 'title' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount' | 'rating';
    direction: 'asc' | 'desc';
}
export interface ArticleManagementProps {
    articles: Article;
    categories: ArticleCategory;
    currentUser: ArticleAuthor;
    onCreateArticle: (article: Partial<Article>) => Promise<Article>;
    onUpdateArticle: (id: string, article: Partial<Article>) => Promise<Article>;
    onDeleteArticle: (id: string) => Promise<void>;
    onPublishArticle: (id: string) => Promise<void>;
    onArchiveArticle: (id: string) => Promise<void>;
    onDuplicateArticle: (id: string) => Promise<Article>;
    onUploadAttachment: (file: File) => Promise<ArticleAttachment>;
    onCreateCategory: (category: Partial<ArticleCategory>) => Promise<ArticleCategory>;
    onUpdateCategory: (id: string, category: Partial<ArticleCategory>) => Promise<ArticleCategory>;
    className?: string;
}
export declare const ArticleList: React.FC<{}, articles>, Article: any;
export declare const ArticleEditor: React.FC<{
    article?: Article;
    categories: ArticleCategory;
}, onSave>;
export declare const ArticleManagement: React.FC<ArticleManagementProps>;
export default ArticleManagement;
//# sourceMappingURL=ArticleManagement.d.ts.map