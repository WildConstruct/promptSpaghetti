import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Knowledge Base Demo - Integration Example
 *
 * Comprehensive demo showcasing how Article Management and Knowledge Base Layouts
 * work together in the Epic 16 template marketplace ecosystem.
 */
import { useState, useMemo } from 'react';
import { ArticleManagement, KnowledgeBaseLayout } from './index';
// Demo data
const demoAuthors = [
    {
        id: 'author-1',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@example.com',
        role: 'admin',
        bio: 'AI researcher and prompt engineering expert with 10+ years of experience.',
        socialLinks: {},
        twitter: 'https://twitter.com/sarahchen',
        linkedin: 'https://linkedin.com/in/sarahchen',
    },
    {
        id: 'author-2',
        name: 'Marcus Rodriguez',
        email: 'marcus.r@example.com',
        role: 'editor',
        bio: 'Technical writer specializing in AI and machine learning documentation.',
        socialLinks: {},
        github: 'https://github.com/marcusr',
    },
    {
        id: 'author-3',
        name: 'Elena Kowalski',
        email: 'elena.k@example.com',
        role: 'contributor',
        bio: 'Content strategist and template marketplace specialist.'
    }
];
const demoCategories = [
    {
        id: 'getting-started',
        name: 'Getting Started',
        slug: 'getting-started',
        description: 'Essential guides for new users to get up and running quickly',
        color: '#3b82f6',
        articleCount: 12,
    },
    {
        id: 'template-creation',
        name: 'Template Creation',
        slug: 'template-creation',
        description: 'Learn how to create effective and reusable prompt templates',
        color: '#10b981',
        articleCount: 24,
    },
    {
        id: 'best-practices',
        name: 'Best Practices',
        slug: 'best-practices',
        description: 'Proven strategies and techniques for optimal results',
        color: '#8b5cf6',
        articleCount: 18,
    },
    {
        id: 'advanced-techniques',
        name: 'Advanced Techniques',
        slug: 'advanced-techniques',
        description: 'Deep dives into complex prompt engineering concepts',
        color: '#f59e0b',
        articleCount: 15,
    },
    {
        id: 'marketplace',
        name: 'Marketplace',
        slug: 'marketplace',
        description: 'Tips for selling and buying templates on the marketplace',
        color: '#ef4444',
        articleCount: 8,
    },
    {
        id: 'troubleshooting',
        name: 'Troubleshooting',
        slug: 'troubleshooting',
        description: 'Common issues and their solutions',
        color: '#6b7280',
        articleCount: 6
    }
];
const demoArticles = [
    {
        id: 'article-1',
        title: 'Getting Started with Prompt Engineering',
        content: `# Getting Started with Prompt Engineering,
  Prompt engineering is the art and science of crafting effective prompts for AI language models. This comprehensive guide will take you through the fundamentals and help you create your first effective prompts.
  ## What is Prompt Engineering?
  Prompt engineering involves designing inputs that guide AI models to produce desired outputs. It's both creative and technical, requiring understanding of how language models work and what makes prompts effective.
  ## Basic Principles
  ### 1. Clarity and Specificity
  - Be clear about what you want
  - Provide specific instructions
  - Avoid ambiguous language
  ### 2. Context and Examples
  - Provide relevant context
  - Include examples when helpful
  - Set the right tone and style
  ### 3. Iterative Improvement
  - Test and refine your prompts
  - Analyze the outputs
  - Make incremental improvements
  ## Your First Prompt
  Let's start with a simple example:,
  \`\`\`
  Write a professional email to a client explaining a project delay.
  Context: Software development project, 2-week delay due to technical challenges,
  Tone: Professional, apologetic, solution-focused,
  Length: 150-200 words,
  \`\`\`
  This prompt is effective because it:,
  - Clearly states the task
  - Provides necessary context
  - Specifies the desired tone
  - Sets length expectations
  ## Next Steps
  1. Practice with simple prompts
  2. Experiment with different approaches
  3. Study examples from the marketplace
  4. Join the community discussions
  Ready to dive deeper? Check out our Template Creation guide next!`,
        excerpt: 'Learn the fundamentals of prompt engineering and create your first effective prompts with this beginner-friendly guide.',
        slug: 'getting-started-prompt-engineering',
        status: 'published',
        category: demoCategories[0],
        tags: ['getting-started', 'fundamentals', 'beginner', 'prompt-engineering'],
        author: demoAuthors[0],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        publishedAt: new Date('2024-01-18'),
        viewCount: 1247,
        likeCount: 89,
        shareCount: 23,
        bookmarkCount: 156,
        readTime: 8,
        difficulty: 'beginner',
        featured: true,
        relatedArticles: ['article-2', 'article-3'],
        seo: {},
        metaTitle: 'Getting Started with Prompt Engineering - Complete Beginner Guide',
        metaDescription: 'Learn prompt engineering fundamentals with this comprehensive guide. Perfect for beginners looking to master AI prompts.',
        keywords: ['prompt engineering', 'AI prompts', 'beginner guide', 'getting started'],
    },
    analytics, {},
    averageRating, 4.7,
    ratingCount, 124,
    completionRate, 78,
    bounceRate, 22,
];
{
    id: 'article-2',
        title;
    'Advanced Template Optimization Techniques',
        content;
    `# Advanced Template Optimization Techniques,
  Take your template creation to the next level with these advanced optimization strategies...`,
        excerpt;
    'Discover advanced techniques for optimizing your prompt templates for better performance and reliability.',
        slug;
    'advanced-template-optimization',
        status;
    'published',
        category;
    demoCategories[3],
        tags;
    ['advanced', 'optimization', 'templates', 'performance'],
        author;
    demoAuthors[1],
        createdAt;
    new Date('2024-01-10'),
        updatedAt;
    new Date('2024-01-22'),
        publishedAt;
    new Date('2024-01-12'),
        viewCount;
    892,
        likeCount;
    67,
        shareCount;
    15,
        bookmarkCount;
    89,
        readTime;
    12,
        difficulty;
    'advanced',
        featured;
    true,
        seo;
    {
        metaTitle: 'Advanced Template Optimization Techniques',
            metaDescription;
        'Master advanced prompt template optimization with proven techniques for better performance.',
            keywords;
        ['template optimization', 'advanced prompts', 'performance tuning'],
        ;
    }
    analytics: {
        averageRating: 4.5,
            ratingCount;
        76,
            completionRate;
        65,
            bounceRate;
        28,
        ;
    }
    {
        id: 'article-3',
            title;
        'Marketplace Success Strategies',
            content;
        `# Marketplace Success Strategies,
  Learn how to maximize your success selling templates on the marketplace...`,
            excerpt;
        'Proven strategies for creating, pricing, and marketing your templates for marketplace success.',
            slug;
        'marketplace-success-strategies',
            status;
        'published',
            category;
        demoCategories[4],
            tags;
        ['marketplace', 'selling', 'marketing', 'success'],
            author;
        demoAuthors[2],
            createdAt;
        new Date('2024-01-08'),
            updatedAt;
        new Date('2024-01-25'),
            publishedAt;
        new Date('2024-01-10'),
            viewCount;
        654,
            likeCount;
        45,
            shareCount;
        12,
            bookmarkCount;
        78,
            readTime;
        10,
            difficulty;
        'intermediate',
            featured;
        false,
            seo;
        {
            metaTitle: 'Marketplace Success Strategies for Template Creators',
                metaDescription;
            'Learn proven strategies for selling templates and building a successful marketplace presence.',
                keywords;
            ['marketplace success', 'template selling', 'creator strategies'],
            ;
        }
        analytics: {
            averageRating: 4.3,
                ratingCount;
            52,
                completionRate;
            72,
                bounceRate;
            25,
            ;
        }
        {
            id: 'article-4',
                title;
            'Building Your First Template',
                content;
            `# Building Your First Template,
  A step-by-step guide to creating your first reusable prompt template...`,
                excerpt;
            'Step-by-step tutorial for creating your first effective and reusable prompt template.',
                slug;
            'building-first-template',
                status;
            'published',
                category;
            demoCategories[1],
                tags;
            ['template-creation', 'beginner', 'tutorial', 'step-by-step'],
                author;
            demoAuthors[0],
                createdAt;
            new Date('2024-01-12'),
                updatedAt;
            new Date('2024-01-19'),
                publishedAt;
            new Date('2024-01-14'),
                viewCount;
            1089,
                likeCount;
            78,
                shareCount;
            19,
                bookmarkCount;
            134,
                readTime;
            15,
                difficulty;
            'beginner',
                featured;
            false,
                seo;
            {
                metaTitle: 'Building Your First Template - Step by Step Guide',
                    metaDescription;
                'Create your first prompt template with this comprehensive step-by-step tutorial.',
                    keywords;
                ['template creation', 'first template', 'beginner tutorial'],
                ;
            }
            analytics: {
                averageRating: 4.6,
                    ratingCount;
                98,
                    completionRate;
                81,
                    bounceRate;
                19,
                ;
            }
            {
                id: 'article-5',
                    title;
                'Common Prompt Engineering Mistakes',
                    content;
                `# Common Prompt Engineering Mistakes,
  Avoid these common pitfalls when creating prompts...`,
                    excerpt;
                'Learn about the most common mistakes in prompt engineering and how to avoid them.',
                    slug;
                'common-prompt-mistakes',
                    status;
                'published',
                    category;
                demoCategories[5],
                    tags;
                ['troubleshooting', 'mistakes', 'best-practices', 'common-issues'],
                    author;
                demoAuthors[1],
                    createdAt;
                new Date('2024-01-05'),
                    updatedAt;
                new Date('2024-01-21'),
                    publishedAt;
                new Date('2024-01-07'),
                    viewCount;
                743,
                    likeCount;
                56,
                    shareCount;
                14,
                    bookmarkCount;
                67,
                    readTime;
                7,
                    difficulty;
                'intermediate',
                    featured;
                false,
                    seo;
                {
                    metaTitle: 'Common Prompt Engineering Mistakes to Avoid',
                        metaDescription;
                    'Avoid these common prompt engineering mistakes and improve your results.',
                        keywords;
                    ['prompt mistakes', 'common errors', 'troubleshooting prompts'],
                    ;
                }
                analytics: {
                    averageRating: 4.2,
                        ratingCount;
                    67,
                        completionRate;
                    69,
                        bounceRate;
                    31;
                    ;
                    const demoLearningPaths = [
                        {
                            id: 'path-1',
                            title: 'Complete Prompt Engineering Mastery',
                            description: 'Master prompt engineering from basics to advanced techniques with this comprehensive learning path.',
                            difficulty: 'beginner',
                            estimatedTime: 180,
                            steps: [
                                {
                                    id: 'step-1',
                                    title: 'Getting Started with Prompt Engineering',
                                    type: 'article',
                                    resourceId: 'article-1',
                                    estimatedTime: 8,
                                    required: true,
                                    completed: true,
                                    order: 1,
                                },
                                {
                                    id: 'step-2',
                                    title: 'Building Your First Template',
                                    type: 'article',
                                    resourceId: 'article-4',
                                    estimatedTime: 15,
                                    required: true,
                                    completed: false,
                                    order: 2,
                                },
                                {
                                    id: 'step-3',
                                    title: 'Template Creation Workshop',
                                    type: 'exercise',
                                    resourceId: 'workshop-1',
                                    estimatedTime: 45,
                                    required: true,
                                    completed: false,
                                    order: 3,
                                },
                                {
                                    id: 'step-4',
                                    title: 'Advanced Optimization Techniques',
                                    type: 'article',
                                    resourceId: 'article-2',
                                    estimatedTime: 12,
                                    required: false,
                                    completed: false,
                                    order: 4
                                }
                            ],
                            prerequisites: [],
                            completionRate: 65,
                            enrolledCount: 234,
                            completedCount: 152,
                            tags: ['prompt-engineering', 'complete-course', 'beginner-friendly'],
                            author: demoAuthors[0],
                            createdAt: new Date('2024-01-01'),
                            updatedAt: new Date('2024-01-20'),
                        },
                        {
                            id: 'path-2',
                            title: 'Marketplace Creator Bootcamp',
                            description: 'Learn everything you need to become a successful template creator and seller.',
                            difficulty: 'intermediate',
                            estimatedTime: 120,
                            steps: [
                                {
                                    id: 'step-5',
                                    title: 'Understanding the Marketplace',
                                    type: 'article',
                                    resourceId: 'article-3',
                                    estimatedTime: 10,
                                    required: true,
                                    completed: false,
                                    order: 1,
                                },
                                {
                                    id: 'step-6',
                                    title: 'Creating Marketable Templates',
                                    type: 'template',
                                    resourceId: 'template-1',
                                    estimatedTime: 30,
                                    required: true,
                                    completed: false,
                                    order: 2
                                }
                            ],
                            prerequisites: ['path-1'],
                            completionRate: 72,
                            enrolledCount: 189,
                            completedCount: 136,
                            tags: ['marketplace', 'selling', 'business'],
                            author: demoAuthors[2],
                            createdAt: new Date('2024-01-05'),
                            updatedAt: new Date('2024-01-18')
                        }
                    ];
                    const demoStats = {
                        totalArticles: demoArticles.length,
                        totalViews: demoArticles.reduce((sum, article) => sum + article.viewCount, 0),
                        totalCategories: demoCategories.length,
                        totalAuthors: demoAuthors.length,
                        recentlyUpdated: demoArticles.slice(0, 3),
                        popularArticles: [...demoArticles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3),
                        featuredContent: demoArticles.filter(a => a.featured),
                    };
                }
            }
        }
        export const KnowledgeBaseDemo = ({
            initialMode = 'browse',
            currentUser = demoAuthors[0],
            className = ''
        });
        {
            const [mode, setMode] = useState(initialMode);
            const [articles, setArticles] = useState(demoArticles);
            const [categories, setCategories] = useState(demoCategories);
            // Mock API functions for demonstration
            const handleCreateArticle = async (articleData) => {
                const newArticle = {
                    id: `article-${Date.now()}` };
            }, title;
             || 'New Article',
                content;
            articleData.content || '',
                excerpt;
            articleData.excerpt || '',
                slug;
            articleData.title?.toLowerCase().replace(/\s+/g, '-') || 'new-article',
                status;
            articleData.status || 'draft',
                category;
            articleData.category || categories[0],
                tags;
            articleData.tags || [],
                author;
            currentUser,
                createdAt;
            new Date(),
                updatedAt;
            new Date(),
                viewCount;
            0,
                likeCount;
            0,
                shareCount;
            0,
                bookmarkCount;
            0,
                readTime;
            Math.ceil((articleData.content?.length || 0) / 200),
                difficulty;
            articleData.difficulty || 'beginner',
                featured;
            articleData.featured || false,
                seo;
            articleData.seo || {},
                analytics;
            {
                averageRating: 0,
                    ratingCount;
                0,
                    completionRate;
                0,
                    bounceRate;
                0,
                ;
            }
            ;
            setArticles(prev => [newArticle, ...prev]);
            return newArticle;
        }
        ;
        const handleUpdateArticle = async (id, articleData) => {
            const updatedArticle = {
                ...articles.find(a => a.id === id),
                ...articleData,
                updatedAt: new Date(),
            };
            setArticles(prev => prev.map(a => a.id === id ? updatedArticle : a));
            return updatedArticle;
        };
        const handleDeleteArticle = async (id) => {
            setArticles(prev => prev.filter(a => a.id !== id));
        };
        const handlePublishArticle = async (id) => {
            await handleUpdateArticle(id, {});
            status: 'published',
                publishedAt;
            new Date(),
            ;
        };
    }
    ;
    const handleArchiveArticle = async (id) => {
        await handleUpdateArticle(id, { status: 'archived' });
    };
    const handleDuplicateArticle = async (id) => {
        const original = articles.find(a => a.id === id);
        return await handleCreateArticle({});
    };
    original,
        title;
    `${original.title} (Copy)`;
}
status: 'draft',
    publishedAt;
undefined;
;
;
const handleUploadAttachment = async (file) => {
    // Mock file upload
    return {
        id: `attachment-${Date.now()}`
    };
}, name, url;
(file),
    type;
file.type.startsWith('image/') ? 'image' : 'document',
    size;
file.size,
    mimeType;
file.type;
;
;
const handleCreateCategory = async (categoryData) => {
    const newCategory = {
        id: `category-${Date.now()}` };
}, name;
 || 'New Category',
    slug;
categoryData.name?.toLowerCase().replace(/\s+/g, '-') || 'new-category',
    description;
categoryData.description || '',
    color;
categoryData.color || '#6b7280',
    articleCount;
0;
;
setCategories(prev => [...prev, newCategory]);
return newCategory;
;
const handleUpdateCategory = async (id, categoryData) => {
    const updatedCategory = {
        ...categories.find(c => c.id === id),
        ...categoryData
    };
    setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
    return updatedCategory;
};
const handleSearch = (query) => {
    console.log('Searching for:', query);
    // In a real app, this would trigger a search API call
};
const handleSelectCategory = (category) => {
    console.log('Selected category:', category);
    // In a real app, this would filter articles or navigate
};
const handleSelectArticle = (article) => {
    console.log('Selected article:', article);
    // In a real app, this would navigate to the article view
};
const handleSelectLearningPath = (path) => {
    console.log('Selected learning path:', path);
    // In a real app, this would navigate to the learning path
};
const updatedStats = useMemo(() => ({}), ...demoStats, totalArticles, articles.length, totalViews, articles.reduce((sum, article) => sum + article.viewCount, 0), recentlyUpdated, [...articles].sort((a, b) => , new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3), popularArticles, [...articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3), featuredContent, articles.filter(a => a.featured));
[articles];
;
return;
_jsxs("div", { className: `min-h-screen bg-gray-50 ${className}`, children: ["}", _jsx("div", { className: "bg-white border-b border-gray-200 px-4 py-3", children: _jsxs("div", { className: "max-w-7xl mx-auto flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Epic 16 Knowledge Base Demo" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setMode('browse'), className: `px-4 py-2 rounded-md text-sm font-medium ${mode === 'browse'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200',
                                }`, children: "Browse Mode" }), _jsx("button", { onClick: () => setMode('manage'), className: `px-4 py-2 rounded-md text-sm font-medium ${mode === 'manage'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200',
                                }`, children: "Manage Mode" })] })] }) }), mode === 'browse' ? ()
            < KnowledgeBaseLayout
            :
        , "articles=", articles, "categories=", categories, "learningPaths=", demoLearningPaths, "stats=", updatedStats, "onSearch=", handleSearch, "onSelectCategory=", handleSelectCategory, "onSelectArticle=", handleSelectArticle, "onSelectLearningPath=", handleSelectLearningPath, "/> ) : ()", _jsx(ArticleManagement, { articles: articles, categories: categories, currentUser: currentUser, onCreateArticle: handleCreateArticle, onUpdateArticle: handleUpdateArticle, onDeleteArticle: handleDeleteArticle, onPublishArticle: handlePublishArticle, onArchiveArticle: handleArchiveArticle, onDuplicateArticle: handleDuplicateArticle, onUploadAttachment: handleUploadAttachment, onCreateCategory: handleCreateCategory, onUpdateCategory: handleUpdateCategory }), ")}"] });
;
;
export default KnowledgeBaseDemo;
