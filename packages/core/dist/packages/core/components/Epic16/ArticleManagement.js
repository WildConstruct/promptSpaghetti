import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Article Management System - E16-1753114247073-332A94
 *
 * Comprehensive system for creating, editing, organizing, and managing knowledge base articles
 * for templates, tutorials, best practices, and marketplace documentation.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PencilIcon, DocumentIcon, EyeIcon, HeartIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon, ClockIcon, UserIcon, StarIcon } from '@heroicons/react/24/outline';
// Article List Component
export const ArticleList = ({ articles, filter, sort, onEdit, onDelete, onDuplicate, onView, currentUser }) => {
    const filteredAndSortedArticles = useMemo(() => {
        const filtered = articles.filter(article => {
            // Apply all filters
            if (filter.status?.length && !filter.status.includes(article.status))
                return false;
            if (filter.category?.length && !filter.category.includes(article.category.id))
                return false;
            if (filter.tags?.length && !filter.tags.some(tag => article.tags.includes(tag)))
                return false;
            if (filter.author?.length && !filter.author.includes(article.author.id))
                return false;
            if (filter.difficulty?.length && !filter.difficulty.includes(article.difficulty))
                return false;
            if (filter.featured !== undefined && article.featured !== filter.featured)
                return false;
            if (filter.searchQuery) {
                const query = filter.searchQuery.toLowerCase();
                const searchableText = `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLowerCase();
                if (!searchableText.includes(query))
                    return false;
            }
            if (filter.dateRange) {
                const articleDate = new Date(article.createdAt);
                if (articleDate < filter.dateRange.start || articleDate > filter.dateRange.end)
                    return false;
            }
            return true;
        });
        // Apply sorting
        filtered.sort((a, b) => {
            const multiplier = sort.direction === 'asc' ? 1 : -1;
            switch (sort.field) {
                case 'title':
                    return a.title.localeCompare(b.title) * multiplier;
                case 'createdAt':
                    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
                case 'updatedAt':
                    return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * multiplier;
                case 'publishedAt':
                    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                    return (aDate - bDate) * multiplier;
                case 'viewCount':
                    return (a.viewCount - b.viewCount) * multiplier;
                case 'likeCount':
                    return (a.likeCount - b.likeCount) * multiplier;
                case 'rating':
                    return (a.analytics.averageRating - b.analytics.averageRating) * multiplier;
                default:
                    return 0;
            }
        });
        return filtered;
    }, [articles, filter, sort]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'review': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-blue-100 text-blue-800';
            case 'intermediate': return 'bg-orange-100 text-orange-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [filteredAndSortedArticles.map((article) => (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [article.featured && (_jsx(StarIcon, { className: "h-5 w-5 text-yellow-500 fill-current" })), _jsx("h3", { className: "text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer", onClick: () => onView(article), children: article.title })] }), _jsx("p", { className: "text-gray-600 mb-3 line-clamp-2", children: article.excerpt }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-500 mb-3", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(UserIcon, { className: "h-4 w-4" }), _jsx("span", { children: article.author.name })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(ClockIcon, { className: "h-4 w-4" }), _jsxs("span", { children: [article.readTime, " min read"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(EyeIcon, { className: "h-4 w-4" }), _jsx("span", { children: article.viewCount.toLocaleString() })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(HeartIcon, { className: "h-4 w-4" }), _jsx("span", { children: article.likeCount })] })] }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`, children: article.status }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`, children: article.difficulty }), _jsx("span", { className: "px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium", children: article.category.name })] }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [article.tags.slice(0, 3).map((tag) => (_jsxs("span", { className: "px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs", children: ["#", tag] }, tag))), article.tags.length > 3 && (_jsxs("span", { className: "text-xs text-gray-500", children: ["+", article.tags.length - 3, " more"] }))] })] }), _jsxs("div", { className: "flex items-center gap-2 ml-4", children: [_jsx("button", { onClick: () => onView(article), className: "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded", title: "View Article", children: _jsx(EyeIcon, { className: "h-5 w-5" }) }), (currentUser.role === 'admin' || currentUser.id === article.author.id) && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => onEdit(article), className: "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded", title: "Edit Article", children: _jsx(PencilIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => onDuplicate(article), className: "p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded", title: "Duplicate Article", children: _jsx(DocumentIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => onDelete(article), className: "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded", title: "Delete Article", children: _jsx(TrashIcon, { className: "h-5 w-5" }) })] }))] })] }) }, article.id))), filteredAndSortedArticles.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(DocumentIcon, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500 text-lg", children: "No articles found" }), _jsx("p", { className: "text-gray-400", children: "Try adjusting your filters or search query" })] }))] }));
};
// Article Editor Component
export const ArticleEditor = ({ article, categories, onSave, onCancel, onUploadAttachment }) => {
    const [formData, setFormData] = useState(() => ({
        title: article?.title || '',
        content: article?.content || '',
        excerpt: article?.excerpt || '',
        status: article?.status || 'draft',
        category: article?.category || categories[0],
        tags: article?.tags || [],
        difficulty: article?.difficulty || 'beginner',
        featured: article?.featured || false,
        seo: article?.seo || {},
        ...article
    }));
    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);
    const handleAddTag = useCallback(() => {
        if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), newTag.trim()]
            }));
            setNewTag('');
        }
    }, [newTag, formData.tags]);
    const handleRemoveTag = useCallback((tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
        }));
    }, []);
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
        }
        finally {
            setIsSaving(false);
        }
    }, [formData, onSave]);
    return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: article ? 'Edit Article' : 'Create New Article' }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: onCancel, className: "px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md", disabled: isSaving, children: "Cancel" }), _jsx("button", { onClick: handleSave, disabled: isSaving || !formData.title?.trim(), className: "px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed", children: isSaving ? 'Saving...' : (article ? 'Update' : 'Create') })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Title *" }), _jsx("input", { type: "text", value: formData.title || '', onChange: (e) => handleInputChange('title', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter article title..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Excerpt" }), _jsx("textarea", { value: formData.excerpt || '', onChange: (e) => handleInputChange('excerpt', e.target.value), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Brief description of the article..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Content *" }), _jsx("textarea", { value: formData.content || '', onChange: (e) => handleInputChange('content', e.target.value), rows: 12, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Write your article content here... (Supports Markdown)" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }), _jsx("select", { value: formData.category?.id || '', onChange: (e) => {
                                            const category = categories.find(c => c.id === e.target.value);
                                            handleInputChange('category', category);
                                        }, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: categories.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Difficulty" }), _jsxs("select", { value: formData.difficulty || 'beginner', onChange: (e) => handleInputChange('difficulty', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }), _jsxs("select", { value: formData.status || 'draft', onChange: (e) => handleInputChange('status', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "review", children: "Under Review" }), _jsx("option", { value: "published", children: "Published" }), _jsx("option", { value: "archived", children: "Archived" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tags" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: formData.tags?.map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm", children: ["#", tag, _jsx("button", { onClick: () => handleRemoveTag(tag), className: "ml-1 hover:text-blue-600", children: "\u00D7" })] }, tag))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: newTag, onChange: (e) => setNewTag(e.target.value), onKeyPress: (e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag()), className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Add tag..." }), _jsx("button", { onClick: handleAddTag, disabled: !newTag.trim(), className: "px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50", children: "Add" })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "featured", checked: formData.featured || false, onChange: (e) => handleInputChange('featured', e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("label", { htmlFor: "featured", className: "ml-2 block text-sm text-gray-900", children: "Feature this article" })] })] })] }));
};
// Main ArticleManagement Component
export const ArticleManagement = ({ articles, categories, currentUser, onCreateArticle, onUpdateArticle, onDeleteArticle, onPublishArticle, onArchiveArticle, onDuplicateArticle, onUploadAttachment, onCreateCategory, onUpdateCategory, className = '' }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [editingArticle, setEditingArticle] = useState(null);
    const [filter, setFilter] = useState({});
    const [sort, setSort] = useState({ field: 'updatedAt', direction: 'desc' });
    const [searchQuery, setSearchQuery] = useState('');
    // Apply search query to filter
    useEffect(() => {
        setFilter(prev => ({ ...prev, searchQuery: searchQuery.trim() || undefined }));
    }, [searchQuery]);
    const handleCreateNew = useCallback(() => {
        setEditingArticle(null);
        setActiveTab('editor');
    }, []);
    const handleEdit = useCallback((article) => {
        setEditingArticle(article);
        setActiveTab('editor');
    }, []);
    const handleSaveArticle = useCallback(async (articleData) => {
        try {
            if (editingArticle) {
                await onUpdateArticle(editingArticle.id, articleData);
            }
            else {
                await onCreateArticle(articleData);
            }
            setActiveTab('list');
            setEditingArticle(null);
        }
        catch (error) {
            console.error('Failed to save article:', error);
            // Handle error (show toast, etc.)
        }
    }, [editingArticle, onCreateArticle, onUpdateArticle]);
    const handleCancel = useCallback(() => {
        setActiveTab('list');
        setEditingArticle(null);
    }, []);
    const handleView = useCallback((article) => {
        // Navigate to article view or open preview modal
        console.log('View article:', article);
    }, []);
    const handleDelete = useCallback(async (article) => {
        if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
            try {
                await onDeleteArticle(article.id);
            }
            catch (error) {
                console.error('Failed to delete article:', error);
            }
        }
    }, [onDeleteArticle]);
    const handleDuplicate = useCallback(async (article) => {
        try {
            const duplicated = await onDuplicateArticle(article.id);
            setEditingArticle(duplicated);
            setActiveTab('editor');
        }
        catch (error) {
            console.error('Failed to duplicate article:', error);
        }
    }, [onDuplicateArticle]);
    return (_jsx("div", { className: `bg-gray-50 min-h-screen ${className}`, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Knowledge Base Management" }), _jsxs("button", { onClick: handleCreateNew, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md", children: [_jsx(PlusIcon, { className: "h-5 w-5" }), "New Article"] })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [_jsxs("button", { onClick: () => setActiveTab('list'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'list'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: ["Articles (", articles.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('categories'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: ["Categories (", categories.length, ")"] })] }) })] }), activeTab === 'list' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4 mb-6", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(MagnifyingGlassIcon, { className: "h-5 w-5 absolute left-3 top-3 text-gray-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search articles...", className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("select", { value: `${sort.field}-${sort.direction}`, onChange: (e) => {
                                                const [field, direction] = e.target.value.split('-');
                                                setSort({ field, direction });
                                            }, className: "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "updatedAt-desc", children: "Recently Updated" }), _jsx("option", { value: "createdAt-desc", children: "Newest First" }), _jsx("option", { value: "title-asc", children: "Title A-Z" }), _jsx("option", { value: "viewCount-desc", children: "Most Viewed" }), _jsx("option", { value: "likeCount-desc", children: "Most Liked" }), _jsx("option", { value: "rating-desc", children: "Highest Rated" })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: () => setFilter(prev => ({ ...prev, status: prev.status?.includes('published') ? undefined : ['published'] })), className: `px-3 py-1 rounded-full text-sm border ${filter.status?.includes('published')
                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`, children: "Published" }), _jsx("button", { onClick: () => setFilter(prev => ({ ...prev, featured: prev.featured === true ? undefined : true })), className: `px-3 py-1 rounded-full text-sm border ${filter.featured === true
                                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`, children: "Featured" }), _jsx("button", { onClick: () => setFilter(prev => ({ ...prev, author: prev.author?.includes(currentUser.id) ? undefined : [currentUser.id] })), className: `px-3 py-1 rounded-full text-sm border ${filter.author?.includes(currentUser.id)
                                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`, children: "My Articles" })] })] }), _jsx(ArticleList, { articles: articles, filter: filter, sort: sort, onEdit: handleEdit, onDelete: handleDelete, onDuplicate: handleDuplicate, onView: handleView, currentUser: currentUser })] })), activeTab === 'editor' && (_jsx(ArticleEditor, { article: editingArticle || undefined, categories: categories, onSave: handleSaveArticle, onCancel: handleCancel, onUploadAttachment: onUploadAttachment })), activeTab === 'categories' && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Article Categories" }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md", children: [_jsx(PlusIcon, { className: "h-5 w-5" }), "New Category"] })] }), _jsx("div", { className: "space-y-4", children: categories.map((category) => (_jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-4 h-4 rounded-full", style: { backgroundColor: category.color } }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900", children: category.name }), _jsx("p", { className: "text-sm text-gray-500", children: category.description })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-gray-500", children: [category.articleCount, " articles"] }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded", children: _jsx(PencilIcon, { className: "h-4 w-4" }) })] })] }, category.id))) })] }))] }) }));
};
export default ArticleManagement;
