import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Help Request Form
 *
 * Intelligent help request submission form with auto-suggestions,
 * knowledge base integration, and smart categorization.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HelpRequestType, HelpCategory, HelpPriority } from '../../services/Epic16HelpRequestService';
const categorySubcategories = {
    [HelpCategory.GETTING_STARTED]: ['account_setup', 'first_purchase', 'navigation', 'basic_features'],
    [HelpCategory.TEMPLATES]: ['submission', 'approval', 'licensing', 'customization', 'downloads'],
    [HelpCategory.MARKETPLACE]: ['selling', 'buying', 'payments', 'disputes', 'reviews'],
    [HelpCategory.BILLING]: ['payments', 'refunds', 'subscriptions', 'invoices', 'taxes'],
    [HelpCategory.ACCOUNT]: ['profile', 'security', 'preferences', 'deletion'],
    [HelpCategory.TECHNICAL]: ['bugs', 'performance', 'compatibility', 'api'],
    [HelpCategory.COMMUNITY]: ['forums', 'moderation', 'guidelines', 'events'],
    [HelpCategory.PARTNERSHIPS]: ['affiliate', 'integration', 'business_development'],
    [HelpCategory.COMPLIANCE]: ['dmca', 'privacy', 'terms_of_service', 'licensing'],
    [HelpCategory.GENERAL]: ['feedback', 'feature_request', 'other']
};
export const HelpRequestForm = ({ helpService, userId, userType, userTier, context, onSubmitted, onCancel }) => {
    // Form state
    const [formData, setFormData] = useState({
        type: HelpRequestType.QUESTION,
        category: HelpCategory.GENERAL,
        subcategory: 'other',
        priority: HelpPriority.MEDIUM,
        title: '',
        description: '',
        tags: [],
        attachments: []
    });
    // UI state
    const [step, setStep] = useState('category');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestedArticles, setSuggestedArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showArticlePreview, setShowArticlePreview] = useState(false);
    // Auto-suggestions and validation
    const [titleSuggestions, setTitleSuggestions] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    // Get available subcategories for selected category
    const availableSubcategories = useMemo(() => {
        return categorySubcategories[formData.category] || [];
    }, [formData.category]);
    // Auto-update subcategory when category changes
    useEffect(() => {
        if (availableSubcategories.length > 0 && !availableSubcategories.includes(formData.subcategory)) {
            setFormData(prev => ({ ...prev, subcategory: availableSubcategories[0] }));
        }
    }, [formData.category, availableSubcategories, formData.subcategory]);
    // Search for suggestions when title/description changes
    const searchSuggestions = useCallback(async (query) => {
        if (query.length < 3) {
            setSuggestedArticles([]);
            return;
        }
        try {
            const articles = await helpService.searchKnowledgeBase({
                query,
                categories: [formData.category],
                limit: 5
            });
            setSuggestedArticles(articles);
        }
        catch (err) {
            console.error('Failed to search suggestions:', err);
        }
    }, [helpService, formData.category]);
    useEffect(() => {
        const searchQuery = `${formData.title} ${formData.description}`.trim();
        if (searchQuery.length >= 3) {
            const timer = setTimeout(() => searchSuggestions(searchQuery), 500);
            return () => clearTimeout(timer);
        }
    }, [formData.title, formData.description, searchSuggestions]);
    // Generate title suggestions based on category and type
    const generateTitleSuggestions = useCallback(() => {
        const suggestions = {
            [HelpRequestType.QUESTION]: [
                'How do I...?',
                'What is the best way to...?',
                'Can you help me understand...?',
                'I need help with...'
            ],
            [HelpRequestType.TECHNICAL_ISSUE]: [
                'Unable to...',
                'Error when trying to...',
                'Feature not working...',
                'Performance issue with...'
            ],
            [HelpRequestType.BUG_REPORT]: [
                'Bug: Unable to...',
                'Bug: Error in...',
                'Bug: Unexpected behavior when...',
                'Bug: Feature not functioning...'
            ],
            [HelpRequestType.FEATURE_REQUEST]: [
                'Feature Request: Add ability to...',
                'Enhancement: Improve...',
                'Suggestion: New feature for...',
                'Request: Better...'
            ]
        };
        setTitleSuggestions(suggestions[formData.type] || []);
    }, [formData.type]);
    useEffect(() => {
        generateTitleSuggestions();
    }, [generateTitleSuggestions]);
    // Form validation
    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }
        else if (formData.title.length < 5) {
            errors.title = 'Title must be at least 5 characters';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }
        else if (formData.description.length < 20) {
            errors.description = 'Description must be at least 20 characters';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            setError('Please fix the validation errors before submitting.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const requestContext = {
                userAgent: navigator.userAgent,
                ipAddress: '0.0.0.0', // Would be filled by backend
                location: {
                    country: 'US', // Would be detected
                    region: 'CA',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                sessionId: `session_${Date.now()}`,
                pageUrl: window.location.href,
                referrer: document.referrer,
                userJourney: [], // Would be tracked
                feature: context?.feature || 'help_form',
                section: context?.section || 'help_center',
                templateId: context?.templateId,
                marketplaceListingId: context?.marketplaceListingId,
                browserInfo: {
                    name: 'Chrome', // Would be detected
                    version: '120.0',
                    platform: navigator.platform
                },
                screenResolution: `${screen.width}x${screen.height}`,
                errorLogs: context?.errorLogs,
                subscriptionPlan: userTier,
                accountAge: 30, // Would be calculated
                previousTickets: 0, // Would be queried
                successfulTransactions: 0, // Would be queried
                ...context
            };
            const helpRequest = await helpService.submitHelpRequest({
                type: formData.type,
                category: formData.category,
                subcategory: formData.subcategory,
                priority: formData.priority,
                title: formData.title,
                description: formData.description,
                context: requestContext,
                userId,
                userType,
                userTier,
                routingDecision: {
                    strategy: 'support_agent',
                    confidence: 0.5,
                    reasoning: 'Initial submission',
                    estimatedResolutionTime: 240
                },
                escalationLevel: 0,
                suggestedArticles: [],
                responses: [],
                tags: formData.tags,
                attachments: [], // Would handle file uploads
                relatedRequests: []
            });
            onSubmitted?.(helpRequest);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit help request');
        }
        finally {
            setLoading(false);
        }
    };
    // Handle article selection
    const handleArticleSelect = (article) => {
        setSelectedArticle(article);
        setShowArticlePreview(true);
    };
    // Handle file upload
    const handleFileUpload = (files) => {
        if (!files)
            return;
        const newFiles = Array.from(files).filter(file => {
            // Validate file type and size
            const allowedTypes = ['image/', 'text/', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            return allowedTypes.some(type => file.type.startsWith(type)) && file.size <= maxSize;
        });
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newFiles]
        }));
    };
    // Remove attachment
    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };
    // Add tag
    const addTag = (tag) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
    };
    // Remove tag
    const removeTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };
    // Render category selection step
    const renderCategoryStep = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "What do you need help with?" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: Object.values(HelpRequestType).map((type) => (_jsxs("label", { className: `relative flex cursor-pointer rounded-lg border p-4 ${formData.type === type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 bg-white hover:bg-gray-50'}`, children: [_jsx("input", { type: "radio", value: type, checked: formData.type === type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "sr-only" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [type === HelpRequestType.QUESTION && 'General questions about features or processes', type === HelpRequestType.TECHNICAL_ISSUE && 'Problems with functionality or performance', type === HelpRequestType.BUG_REPORT && 'Report bugs or unexpected behavior', type === HelpRequestType.FEATURE_REQUEST && 'Suggest new features or improvements', type === HelpRequestType.ACCOUNT_ISSUE && 'Account-related problems or questions', type === HelpRequestType.BILLING_INQUIRY && 'Billing, payments, or subscription questions'] })] })] }, type))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }), _jsx("select", { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: Object.values(HelpCategory).map((category) => (_jsx("option", { value: category, children: category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }, category))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Subcategory" }), _jsx("select", { value: formData.subcategory, onChange: (e) => setFormData({ ...formData, subcategory: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: availableSubcategories.map((subcategory) => (_jsx("option", { value: subcategory, children: subcategory.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }, subcategory))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority" }), _jsx("select", { value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: Object.values(HelpPriority).map((priority) => (_jsx("option", { value: priority, children: priority.charAt(0).toUpperCase() + priority.slice(1) }, priority))) })] })] }));
    // Render details step
    const renderDetailsStep = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Title ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "Brief description of your issue or question", className: `w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validationErrors.title ? 'border-red-300' : 'border-gray-300'}` }), validationErrors.title && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.title })), titleSuggestions.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Suggested formats:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: titleSuggestions.map((suggestion, index) => (_jsx("button", { type: "button", onClick: () => setFormData({ ...formData, title: suggestion }), className: "px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200", children: suggestion }, index))) })] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Description ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Please provide detailed information about your issue, including steps to reproduce if applicable...", rows: 6, className: `w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validationErrors.description ? 'border-red-300' : 'border-gray-300'}` }), validationErrors.description && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: validationErrors.description })), _jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [formData.description.length, " characters (minimum 20 required)"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Attachments" }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-md p-4", children: [_jsx("input", { type: "file", multiple: true, accept: "image/*,text/*,.pdf", onChange: (e) => handleFileUpload(e.target.files), className: "hidden", id: "file-upload" }), _jsxs("label", { htmlFor: "file-upload", className: "cursor-pointer flex flex-col items-center", children: [_jsx("svg", { className: "h-8 w-8 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) }), _jsx("span", { className: "mt-2 text-sm text-gray-600", children: "Click to upload or drag and drop" }), _jsx("span", { className: "text-xs text-gray-500", children: "Images, text files, PDFs (max 10MB each)" })] })] }), formData.attachments.length > 0 && (_jsx("div", { className: "mt-3 space-y-2", children: formData.attachments.map((file, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm text-gray-700", children: file.name }), _jsx("button", { type: "button", onClick: () => removeAttachment(index), className: "text-red-500 hover:text-red-700", children: "Remove" })] }, index))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tags (optional)" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: formData.tags.map((tag) => (_jsxs("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center", children: [tag, _jsx("button", { type: "button", onClick: () => removeTag(tag), className: "ml-1 text-blue-600 hover:text-blue-800", children: "\u00D7" })] }, tag))) }), _jsx("input", { type: "text", placeholder: "Add tags to help categorize your request", onKeyPress: (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                            }
                        }, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Press Enter to add tags" })] })] }));
    // Render suggestions step
    const renderSuggestionsStep = () => (_jsx("div", { className: "space-y-6", children: suggestedArticles.length > 0 ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "We found some articles that might help" }), _jsx("p", { className: "text-sm text-gray-600", children: "Please review these before submitting your request. They might resolve your issue immediately." })] }), _jsx("div", { className: "space-y-3", children: suggestedArticles.map((article) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer", onClick: () => handleArticleSelect(article), children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-1", children: article.title }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: article.summary }), _jsxs("div", { className: "flex items-center space-x-4 text-xs text-gray-500", children: [_jsxs("span", { children: ["Relevance: ", (article.relevanceScore * 100).toFixed(0), "%"] }), _jsxs("span", { children: ["Rating: ", article.helpfulnessRating, "/5"] }), _jsxs("span", { children: [article.viewCount, " views"] })] })] }), _jsx("button", { className: "text-blue-600 hover:text-blue-800 text-sm", children: "View \u2192" })] }) }, article.id))) }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-blue-700", children: "If none of these articles solve your issue, you can continue with submitting your help request. Our support team will be notified and will respond as soon as possible." }) })] }) })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.322-1.1l-.548-.547z" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No matching articles found" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "We'll route your request to our support team for personalized assistance." })] })) }));
    // Render review step
    const renderReviewStep = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Review your request" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Type:" }), _jsx("span", { className: "ml-2 text-sm text-gray-900", children: formData.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Category:" }), _jsxs("span", { className: "ml-2 text-sm text-gray-900", children: [formData.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), " \u203A", formData.subcategory.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Priority:" }), _jsx("span", { className: "ml-2 text-sm text-gray-900 capitalize", children: formData.priority })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Title:" }), _jsx("p", { className: "text-sm text-gray-900 mt-1", children: formData.title })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Description:" }), _jsx("p", { className: "text-sm text-gray-900 mt-1 whitespace-pre-wrap", children: formData.description })] }), formData.tags.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Tags:" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: formData.tags.map((tag) => (_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full", children: tag }, tag))) })] })), formData.attachments.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Attachments:" }), _jsx("ul", { className: "text-sm text-gray-900 mt-1", children: formData.attachments.map((file, index) => (_jsxs("li", { children: ["\u2022 ", file.name] }, index))) })] }))] })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h4", { className: "text-sm font-medium text-blue-900", children: "What happens next?" }), _jsx("div", { className: "mt-2 text-sm text-blue-700", children: _jsxs("ul", { className: "list-disc list-inside space-y-1", children: [_jsx("li", { children: "Your request will be automatically categorized and routed" }), _jsx("li", { children: "You'll receive a confirmation email with your request ID" }), _jsx("li", { children: "Our team will respond within our SLA timeframes" }), _jsx("li", { children: "You can track progress in your help center dashboard" })] }) })] })] }) })] }));
    return (_jsxs("div", { className: "help-request-form max-w-2xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex items-center", children: ['category', 'details', 'suggestions', 'review'].map((stepName, index) => (_jsxs(React.Fragment, { children: [_jsx("div", { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === stepName
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : index < ['category', 'details', 'suggestions', 'review'].indexOf(step)
                                            ? 'bg-green-600 border-green-600 text-white'
                                            : 'border-gray-300 text-gray-500'}`, children: index < ['category', 'details', 'suggestions', 'review'].indexOf(step) ? (_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })) : (index + 1) }), index < 3 && (_jsx("div", { className: `flex-1 h-0.5 mx-2 ${index < ['category', 'details', 'suggestions', 'review'].indexOf(step) ? 'bg-green-600' : 'bg-gray-300'}` }))] }, stepName))) }), _jsxs("div", { className: "flex justify-between mt-2 text-sm text-gray-600", children: [_jsx("span", { children: "Category" }), _jsx("span", { children: "Details" }), _jsx("span", { children: "Suggestions" }), _jsx("span", { children: "Review" })] })] }), _jsxs("div", { className: "bg-white", children: [step === 'category' && renderCategoryStep(), step === 'details' && renderDetailsStep(), step === 'suggestions' && renderSuggestionsStep(), step === 'review' && renderReviewStep()] }), error && (_jsx("div", { className: "mt-6 bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) })] }) })), _jsxs("div", { className: "mt-8 flex items-center justify-between", children: [_jsx("div", { children: step !== 'category' && (_jsx("button", { type: "button", onClick: () => {
                                const steps = ['category', 'details', 'suggestions', 'review'];
                                const currentIndex = steps.indexOf(step);
                                if (currentIndex > 0) {
                                    setStep(steps[currentIndex - 1]);
                                }
                            }, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "Back" })) }), _jsxs("div", { className: "flex items-center space-x-3", children: [onCancel && (_jsx("button", { type: "button", onClick: onCancel, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" })), step === 'review' ? (_jsx("button", { type: "button", onClick: handleSubmit, disabled: loading, className: "px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50", children: loading ? 'Submitting...' : 'Submit Request' })) : (_jsx("button", { type: "button", onClick: () => {
                                    if (step === 'details' && !validateForm()) {
                                        return;
                                    }
                                    const steps = ['category', 'details', 'suggestions', 'review'];
                                    const currentIndex = steps.indexOf(step);
                                    if (currentIndex < steps.length - 1) {
                                        setStep(steps[currentIndex + 1]);
                                    }
                                }, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: step === 'suggestions' && suggestedArticles.length === 0 ? 'Continue to Review' : 'Next' }))] })] }), showArticlePreview && selectedArticle && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: selectedArticle.title }), _jsx("button", { onClick: () => setShowArticlePreview(false), className: "p-2 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "prose max-w-none", children: [_jsx("p", { className: "text-gray-600 mb-4", children: selectedArticle.summary }), _jsx("div", { className: "whitespace-pre-wrap", children: selectedArticle.content })] }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Rating: ", selectedArticle.helpfulnessRating, "/5 \u2022 ", selectedArticle.viewCount, " views"] }), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { onClick: () => setShowArticlePreview(false), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Close" }), _jsx("button", { onClick: () => window.open(selectedArticle.url, '_blank'), className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: "Open Full Article" })] })] })] })] }) }))] }));
};
export default HelpRequestForm;
