import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Contribution UI Components - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Comprehensive contribution interface with error handling,
 * form validation, and user experience optimization.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Save, Send, AlertTriangle, CheckCircle, XCircle, RefreshCw, Star, ThumbsUp, MessageSquare, Share2, Edit, Trash2, Eye, Clock, User } from 'lucide-react';
// Security and validation utilities
export class ContributionValidator {
    static validateTitle(title) {
        const errors = [];
        if (!title || title.trim().length === 0) {
            errors.push({
                field: 'title',
                message: 'Title is required',
                code: 'REQUIRED'
            });
        }
        if (title.length > 200) {
            errors.push({
                field: 'title',
                message: 'Title must be less than 200 characters',
                code: 'MAX_LENGTH'
            });
        }
        // Security: Check for malicious content
        if (/<script|javascript:|data:|eval\(/i.test(title)) {
            errors.push({
                field: 'title',
                message: 'Title contains potentially dangerous content',
                code: 'SECURITY_VIOLATION'
            });
        }
        return errors;
    }
    static validateDescription(description) {
        const errors = [];
        if (!description || description.trim().length === 0) {
            errors.push({
                field: 'description',
                message: 'Description is required',
                code: 'REQUIRED'
            });
        }
        if (description.length < 50) {
            errors.push({
                field: 'description',
                message: 'Description must be at least 50 characters',
                code: 'MIN_LENGTH'
            });
        }
        if (description.length > 2000) {
            errors.push({
                field: 'description',
                message: 'Description must be less than 2000 characters',
                code: 'MAX_LENGTH'
            });
        }
        return errors;
    }
    static validateContent(content) {
        const errors = [];
        if (!content || content.trim().length === 0) {
            errors.push({
                field: 'content',
                message: 'Content is required',
                code: 'REQUIRED'
            });
        }
        if (content.length < 100) {
            errors.push({
                field: 'content',
                message: 'Content must be at least 100 characters',
                code: 'MIN_LENGTH'
            });
        }
        if (content.length > 50000) {
            errors.push({
                field: 'content',
                message: 'Content exceeds maximum length (50,000 characters)',
                code: 'MAX_LENGTH'
            });
        }
        // Security checks
        const scriptTags = (content.match(/<script/gi) || []).length;
        if (scriptTags > 0) {
            errors.push({
                field: 'content',
                message: 'Script tags are not allowed in content',
                code: 'SECURITY_VIOLATION'
            });
        }
        return errors;
    }
    static validateTags(tags) {
        const errors = [];
        if (tags.length === 0) {
            errors.push({
                field: 'tags',
                message: 'At least one tag is required',
                code: 'REQUIRED'
            });
        }
        if (tags.length > 10) {
            errors.push({
                field: 'tags',
                message: 'Maximum 10 tags allowed',
                code: 'MAX_COUNT'
            });
        }
        tags.forEach((tag, index) => {
            if (tag.length > 30) {
                errors.push({
                    field: `tags[${index}]`,
                    message: 'Each tag must be less than 30 characters',
                    code: 'MAX_LENGTH'
                });
            }
            if (!/^[a-zA-Z0-9\-_\s]+$/.test(tag)) {
                errors.push({
                    field: `tags[${index}]`,
                    message: 'Tags can only contain letters, numbers, hyphens, and underscores',
                    code: 'INVALID_FORMAT'
                });
            }
        });
        return errors;
    }
    static validateFormData(formData) {
        const errors = [];
        errors.push(...this.validateTitle(formData.title));
        errors.push(...this.validateDescription(formData.description));
        errors.push(...this.validateContent(formData.content));
        errors.push(...this.validateTags(formData.tags));
        // Validate estimated time
        if (formData.estimatedTime <= 0 || formData.estimatedTime > 600) {
            errors.push({
                field: 'estimatedTime',
                message: 'Estimated time must be between 1 and 600 minutes',
                code: 'INVALID_RANGE'
            });
        }
        // Validate category
        if (!formData.category || formData.category.trim().length === 0) {
            errors.push({
                field: 'category',
                message: 'Category is required',
                code: 'REQUIRED'
            });
        }
        return errors;
    }
}
export class ContributionErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log error for monitoring
        console.error('ContributionErrorBoundary caught an error:', error, errorInfo);
        // Call parent error handler if provided
        this.props.onError?.(error);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx(Card, { className: "error-boundary", children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(AlertTriangle, { className: "h-12 w-12 text-red-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-gray-600 mb-4", children: "We encountered an unexpected error. Please try refreshing the page." }), _jsxs(Button, { onClick: () => window.location.reload(), variant: "outline", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh Page"] })] }) }));
        }
        return this.props.children;
    }
}
export const ContributionForm = ({ initialData = {}, onSubmit, onSaveDraft, isLoading = false, className = '' }) => {
    // Form state with comprehensive initialization
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        description: initialData.description || '',
        content: initialData.content || '',
        category: initialData.category || '',
        tags: initialData.tags || [],
        difficulty: initialData.difficulty || 'beginner',
        estimatedTime: initialData.estimatedTime || 60,
        prerequisites: initialData.prerequisites || [],
        resources: initialData.resources || [],
        license: initialData.license || 'cc-by'
    });
    // Error state management
    const [_____errors, setErrors] = useState([]);
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDraftSaving, setIsDraftSaving] = useState(false);
    // Auto-save draft functionality
    const [lastSaved, setLastSaved] = useState(null);
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    // Validation state
    const validationErrors = useMemo(() => {
        return ContributionValidator.validateFormData(formData);
    }, [formData]);
    // Auto-save draft every 30 seconds if there are changes
    useEffect(() => {
        if (onSaveDraft && !isSubmitting && !isDraftSaving) {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
            const timer = setTimeout(async () => {
                try {
                    setIsDraftSaving(true);
                    await onSaveDraft(formData);
                    setLastSaved(new Date());
                }
                catch (error) {
                    console.error('Auto-save failed:', error);
                }
                finally {
                    setIsDraftSaving(false);
                }
            }, 30000);
            setAutoSaveTimer(timer);
        }
        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [formData, onSaveDraft, isSubmitting, isDraftSaving]);
    // Form update handlers with error handling
    const updateFormData = useCallback((field, value) => {
        try {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            // Clear specific field errors when user makes changes
            setErrors(prev => prev.filter(error => error.field !== field));
            setSubmitError(null);
        }
        catch (error) {
            console.error('Error updating form data:', error);
        }
    }, []);
    // Tag management with validation
    const addTag = useCallback((tag) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (!trimmedTag)
            return;
        if (formData.tags.includes(trimmedTag)) {
            setErrors(prev => [...prev, {
                    field: 'tags',
                    message: 'Tag already exists',
                    code: 'DUPLICATE'
                }]);
            return;
        }
        if (formData.tags.length >= 10) {
            setErrors(prev => [...prev, {
                    field: 'tags',
                    message: 'Maximum 10 tags allowed',
                    code: 'MAX_COUNT'
                }]);
            return;
        }
        updateFormData('tags', [...formData.tags, trimmedTag]);
    }, [formData.tags, updateFormData]);
    const removeTag = useCallback((index) => {
        updateFormData('tags', formData.tags.filter((_, i) => i !== index));
    }, [formData.tags, updateFormData]);
    // Submit handler with comprehensive error handling
    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        try {
            setIsSubmitting(true);
            setSubmitError(null);
            setErrors([]);
            // Validate form data
            const validationErrors = ContributionValidator.validateFormData(formData);
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }
            // Submit to parent component
            const result = await onSubmit(formData);
            if (!result.success && result.error) {
                setSubmitError(result.error);
            }
        }
        catch (error) {
            console.error('Submit error:', error);
            setSubmitError({
                type: 'unknown',
                message: 'An unexpected error occurred while submitting',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit]);
    // Save draft handler
    const handleSaveDraft = useCallback(async () => {
        if (!onSaveDraft)
            return;
        try {
            setIsDraftSaving(true);
            const result = await onSaveDraft(formData);
            if (result.success) {
                setLastSaved(new Date());
            }
            else if (result.error) {
                setSubmitError(result.error);
            }
        }
        catch (error) {
            console.error('Save draft error:', error);
            setSubmitError({
                type: 'unknown',
                message: 'Failed to save draft',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        finally {
            setIsDraftSaving(false);
        }
    }, [formData, onSaveDraft]);
    // Error display component
    const ErrorDisplay = ({ error }) => (_jsx("div", { className: "error-display bg-red-50 border border-red-200 rounded-lg p-4 mb-4", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(XCircle, { className: "h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("h4", { className: "text-red-800 font-medium", children: error.message }), error.details && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: error.details })), error.code && (_jsxs("p", { className: "text-red-500 text-xs mt-1", children: ["Error Code: ", error.code] }))] })] }) }));
    // Field error display
    const getFieldError = (fieldName) => {
        return validationErrors.find(error => error.field === fieldName);
    };
    const renderFieldError = (fieldName) => {
        const error = getFieldError(fieldName);
        if (!error)
            return null;
        return (_jsxs("div", { className: "field-error text-red-600 text-sm mt-1 flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1" }), error.message] }));
    };
    return (_jsx(ContributionErrorBoundary, { children: _jsxs("form", { onSubmit: handleSubmit, className: `contribution-form ${className}`, children: [submitError && _jsx(ErrorDisplay, { error: submitError }), _jsx("div", { className: "auto-save-indicator mb-4 text-sm text-gray-600 flex items-center", children: isDraftSaving ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-1 animate-spin" }), "Saving draft..."] })) : lastSaved ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1 text-green-600" }), "Last saved: ", lastSaved.toLocaleTimeString()] })) : (_jsx(Clock, { className: "h-4 w-4 mr-1" })) }), _jsxs("div", { className: "form-sections space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Basic Information" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-1", children: "Title *" }), _jsx(Input, { id: "title", value: formData.title, onChange: (e) => updateFormData('title', e.target.value), className: getFieldError('title') ? 'border-red-500' : '', placeholder: "Enter a descriptive title for your contribution", maxLength: 200, required: true }), renderFieldError('title'), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [formData.title.length, "/200 characters"] })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-1", children: "Description *" }), _jsx("textarea", { id: "description", value: formData.description, onChange: (e) => updateFormData('description', e.target.value), className: `w-full p-3 border rounded-lg resize-vertical min-h-[100px] ${getFieldError('description') ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Provide a detailed description of your contribution", maxLength: 2000, required: true }), renderFieldError('description'), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [formData.description.length, "/2000 characters"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: "category", className: "block text-sm font-medium text-gray-700 mb-1", children: "Category *" }), _jsxs("select", { id: "category", value: formData.category, onChange: (e) => updateFormData('category', e.target.value), className: `w-full p-3 border rounded-lg ${getFieldError('category') ? 'border-red-500' : 'border-gray-300'}`, required: true, children: [_jsx("option", { value: "", children: "Select a category" }), _jsx("option", { value: "tutorial", children: "Tutorial" }), _jsx("option", { value: "template", children: "Template" }), _jsx("option", { value: "tool", children: "Tool" }), _jsx("option", { value: "guide", children: "Guide" }), _jsx("option", { value: "resource", children: "Resource" }), _jsx("option", { value: "example", children: "Example" })] }), renderFieldError('category')] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: "difficulty", className: "block text-sm font-medium text-gray-700 mb-1", children: "Difficulty Level" }), _jsxs("select", { id: "difficulty", value: formData.difficulty, onChange: (e) => updateFormData('difficulty', e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" }), _jsx("option", { value: "expert", children: "Expert" })] })] })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: "estimatedTime", className: "block text-sm font-medium text-gray-700 mb-1", children: "Estimated Time (minutes)" }), _jsx(Input, { id: "estimatedTime", type: "number", value: formData.estimatedTime, onChange: (e) => updateFormData('estimatedTime', parseInt(e.target.value) || 0), className: getFieldError('estimatedTime') ? 'border-red-500' : '', min: 1, max: 600, placeholder: "60" }), renderFieldError('estimatedTime')] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Content" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: "content", className: "block text-sm font-medium text-gray-700 mb-1", children: "Main Content *" }), _jsx("textarea", { id: "content", value: formData.content, onChange: (e) => updateFormData('content', e.target.value), className: `w-full p-3 border rounded-lg resize-vertical min-h-[300px] ${getFieldError('content') ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Enter the main content of your contribution. Use markdown formatting for better presentation.", maxLength: 50000, required: true }), renderFieldError('content'), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [formData.content.length, "/50000 characters \u2022 Markdown supported"] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Tags" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tags * (Press Enter to add)" }), _jsxs("div", { className: "tag-input-container", children: [_jsx(Input, { placeholder: "Add tags...", onKeyPress: (e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addTag(e.currentTarget.value);
                                                                e.currentTarget.value = '';
                                                            }
                                                        }, className: getFieldError('tags') ? 'border-red-500' : '' }), _jsx("div", { className: "tags-display mt-2 flex flex-wrap gap-2", children: formData.tags.map((tag, index) => (_jsxs(Badge, { variant: "secondary", className: "tag-badge cursor-pointer", onClick: () => removeTag(index), children: [tag, _jsx(XCircle, { className: "h-3 w-3 ml-1" })] }, index))) }), renderFieldError('tags'), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [formData.tags.length, "/10 tags"] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "License" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "form-field", children: [_jsx("label", { htmlFor: "license", className: "block text-sm font-medium text-gray-700 mb-1", children: "License Type" }), _jsxs("select", { id: "license", value: formData.license, onChange: (e) => updateFormData('license', e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "cc0", children: "Creative Commons Zero (Public Domain)" }), _jsx("option", { value: "cc-by", children: "Creative Commons Attribution" }), _jsx("option", { value: "cc-by-sa", children: "Creative Commons Attribution-ShareAlike" }), _jsx("option", { value: "proprietary", children: "Proprietary" })] })] }) })] })] }), _jsxs("div", { className: "form-actions mt-6 flex flex-col sm:flex-row gap-3", children: [_jsx(Button, { type: "submit", disabled: isSubmitting || isLoading || validationErrors.length > 0, className: "primary-submit", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Submit Contribution"] })) }), onSaveDraft && (_jsx(Button, { type: "button", variant: "outline", onClick: handleSaveDraft, disabled: isDraftSaving || isLoading, children: isDraftSaving ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Draft"] })) }))] }), validationErrors.length > 0 && (_jsxs("div", { className: "validation-summary mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsxs("h4", { className: "text-yellow-800 font-medium mb-2 flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Please fix the following issues:"] }), _jsx("ul", { className: "text-yellow-700 text-sm space-y-1", children: validationErrors.map((error, index) => (_jsxs("li", { children: ["\u2022 ", error.message] }, index))) })] }))] }) }));
};
export const ContributionList = ({ contributions, onView, onEdit, onDelete, _____onRate, currentUserId, isLoading = false, error, className = '' }) => {
    const [loadingActions, setLoadingActions] = useState(new Set());
    const handleAction = useCallback(async (contributionId, action) => {
        try {
            setLoadingActions(prev => new Set(prev).add(contributionId));
            await action();
        }
        catch (error) {
            console.error('Action failed:', error);
        }
        finally {
            setLoadingActions(prev => {
                const newSet = new Set(prev);
                newSet.delete(contributionId);
                return newSet;
            });
        }
    }, []);
    if (error) {
        return (_jsxs("div", { className: "error-state p-6 text-center", children: [_jsx(XCircle, { className: "h-12 w-12 text-red-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Failed to load contributions" }), _jsx("p", { className: "text-gray-600 mb-4", children: error.message }), _jsxs(Button, { onClick: () => window.location.reload(), variant: "outline", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Try Again"] })] }));
    }
    if (isLoading) {
        return (_jsxs("div", { className: "loading-state p-6 text-center", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading contributions..." })] }));
    }
    if (contributions.length === 0) {
        return (_jsxs("div", { className: "empty-state p-6 text-center", children: [_jsx(MessageSquare, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No contributions found" }), _jsx("p", { className: "text-gray-600", children: "Be the first to contribute to the community!" })] }));
    }
    return (_jsx(ContributionErrorBoundary, { children: _jsx("div", { className: `contribution-list ${className}`, children: _jsx("div", { className: "contributions-grid space-y-4", children: contributions.map(contribution => (_jsx(Card, { className: "contribution-card hover:shadow-lg transition-shadow", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "contribution-header flex justify-between items-start mb-4", children: [_jsxs("div", { className: "contribution-info flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: contribution.title }), _jsx("p", { className: "text-gray-600 text-sm mb-3 line-clamp-2", children: contribution.description }), _jsxs("div", { className: "contribution-meta flex flex-wrap items-center gap-4 text-sm text-gray-500", children: [_jsxs("div", { className: "author-info flex items-center", children: [_jsx(User, { className: "h-4 w-4 mr-1" }), _jsx("span", { children: contribution.author.name }), _jsxs(Badge, { variant: "outline", className: "ml-2 text-xs", children: [contribution.author.reputation, " rep"] })] }), _jsx("div", { className: "category", children: _jsx(Badge, { variant: "secondary", children: contribution.category }) }), _jsx("div", { className: "difficulty", children: _jsx(Badge, { variant: contribution.difficulty === 'beginner' ? 'default' : 'outline', children: contribution.difficulty }) }), _jsxs("div", { className: "date", children: [_jsx(Clock, { className: "h-4 w-4 mr-1" }), contribution.updatedAt.toLocaleDateString()] })] })] }), _jsx("div", { className: "contribution-status", children: _jsx(Badge, { variant: contribution.status === 'published' ? 'default' : 'outline', className: contribution.status === 'published' ? 'bg-green-100 text-green-800' :
                                                contribution.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                    contribution.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800', children: contribution.status }) })] }), _jsxs("div", { className: "contribution-stats flex items-center gap-6 mb-4", children: [_jsxs("div", { className: "stat-item flex items-center text-sm text-gray-600", children: [_jsx(Star, { className: "h-4 w-4 mr-1 text-yellow-500" }), _jsx("span", { children: contribution.rating.toFixed(1) }), _jsxs("span", { className: "ml-1", children: ["(", contribution.reviewCount, " reviews)"] })] }), _jsxs("div", { className: "stat-item flex items-center text-sm text-gray-600", children: [_jsx(ThumbsUp, { className: "h-4 w-4 mr-1" }), _jsxs("span", { children: [contribution.downloadCount, " downloads"] })] }), _jsxs("div", { className: "stat-item flex items-center text-sm text-gray-600", children: [_jsx(MessageSquare, { className: "h-4 w-4 mr-1" }), _jsxs("span", { children: [contribution.comments, " comments"] })] })] }), _jsx("div", { className: "contribution-tags mb-4", children: _jsxs("div", { className: "tags-container flex flex-wrap gap-2", children: [contribution.tags.slice(0, 5).map((tag, index) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: tag }, index))), contribution.tags.length > 5 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", contribution.tags.length - 5, " more"] }))] }) }), _jsxs("div", { className: "contribution-actions flex gap-2", children: [onView && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleAction(contribution.id, () => onView(contribution)), disabled: loadingActions.has(contribution.id), children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "View"] })), onEdit && currentUserId === contribution.author.id && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleAction(contribution.id, () => onEdit(contribution)), disabled: loadingActions.has(contribution.id), children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Edit"] })), onDelete && currentUserId === contribution.author.id && (_jsxs(Button, { size: "sm", variant: "destructive", onClick: () => handleAction(contribution.id, () => onDelete(contribution)), disabled: loadingActions.has(contribution.id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Delete"] })), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Share2, { className: "h-4 w-4 mr-1" }), "Share"] })] })] }) }, contribution.id))) }) }) }));
};
// Export all components and utilities
export default ContributionForm;
