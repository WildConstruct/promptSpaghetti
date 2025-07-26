import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Unified Review Interface - E17-1753114397293-31FD2B
 *
 * Comprehensive review interface that consolidates all review workflows
 * Part of Epic 17.5.1 - Review Workflow (Backstage Admin Controls)
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Textarea } from '../ui/Textarea';
import { Eye, FileText, User, Clock, Star, CheckCircle, XCircle, AlertTriangle, Flag, Download, ZoomIn, ZoomOut, ArrowLeft, Save, Send, Info, Target, BarChart3 } from 'lucide-react';
const UnifiedReviewInterface = ({ reviewItem, onDecision, onSaveDraft, onBack, reviewerPermissions, className = '' }) => {
    // State management
    const [activeTab, setActiveTab] = useState('overview');
    const [reviewDecision, setReviewDecision] = useState({
        feedback: [],
        public_comments: '',
        private_notes: '',
        follow_up_required: false
    });
    const [_____currentDocumentIndex, _____setCurrentDocumentIndex] = useState(0);
    const [documentZoom, setDocumentZoom] = useState(100);
    const [_____mediaPlaying, _____setMediaPlaying] = useState({});
    const [_____selectedValidationRules, _____setSelectedValidationRules] = useState([]);
    const [_____customValidations, _____setCustomValidations] = useState([]);
    // Load any existing draft
    useEffect(() => {
        loadReviewDraft();
    }, [reviewItem.id]);
    const loadReviewDraft = async () => {
        try {
            const response = await fetch(`/api/admin/reviews/${reviewItem.id}/draft`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (response.ok) {
                const draft = await response.json();
                setReviewDecision(draft);
            }
        }
        catch (error) {
            console.error('Failed to load review draft:', error);
        }
    };
    const handleSaveDraft = async () => {
        await onSaveDraft(reviewDecision);
    };
    const handleSubmitDecision = async () => {
        if (!reviewDecision.decision) {
            alert('Please select a decision before submitting.');
            return;
        }
        if (!reviewDecision.public_comments?.trim()) {
            alert('Please provide public comments for the submitter.');
            return;
        }
        await onDecision(reviewDecision);
    };
    const updateFeedback = (category, updates) => {
        const existingIndex = reviewDecision.feedback?.findIndex(f => f.category === category) ?? -1;
        const updatedFeedback = [...(reviewDecision.feedback || [])];
        if (existingIndex >= 0) {
            updatedFeedback[existingIndex] = { ...updatedFeedback[existingIndex], ...updates };
        }
        else {
            updatedFeedback.push({
                category: category,
                rating: 3,
                comments: '',
                suggestions: [],
                is_blocking: false,
                ...updates
            });
        }
        setReviewDecision(prev => ({ ...prev, feedback: updatedFeedback }));
    };
    const calculateOverallScore = () => {
        if (!reviewDecision.feedback?.length)
            return 50;
        const weightedScore = reviewDecision.feedback.reduce((total, feedback) => {
            const weight = feedback.is_blocking ? 2 : 1;
            return total + (feedback.rating * 20 * weight); // Convert 1-5 to 0-100
        }, 0);
        const totalWeight = reviewDecision.feedback.reduce((total, feedback) => total + (feedback.is_blocking ? 2 : 1), 0);
        return Math.round(weightedScore / totalWeight);
    };
    const renderOverviewTab = () => (_jsxs("div", { className: "review-overview", children: [_jsxs("div", { className: "overview-header", children: [_jsxs("div", { className: "item-info", children: [_jsx("div", { className: "item-type-badge", children: _jsx(Badge, { className: getTypeColor(reviewItem.type), children: formatItemType(reviewItem.type) }) }), _jsx("h2", { className: "item-title", children: reviewItem.title }), reviewItem.description && (_jsx("p", { className: "item-description", children: reviewItem.description }))] }), _jsx("div", { className: "item-metadata", children: _jsxs("div", { className: "metadata-grid", children: [_jsxs("div", { className: "metadata-item", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { children: ["Submitted ", formatTimeAgo(reviewItem.submitted_at || reviewItem.created_at)] })] }), _jsxs("div", { className: "metadata-item", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { children: reviewItem.submitter.name }), _jsx(Badge, { variant: "outline", className: "ml-2", children: reviewItem.submitter.tier })] }), _jsxs("div", { className: "metadata-item", children: [_jsx(Target, { className: "w-4 h-4 text-gray-400" }), _jsx(Badge, { className: getPriorityColor(reviewItem.priority), children: reviewItem.priority })] }), reviewItem.estimated_review_time && (_jsxs("div", { className: "metadata-item", children: [_jsx(BarChart3, { className: "w-4 h-4 text-gray-400" }), _jsxs("span", { children: ["Est. ", reviewItem.estimated_review_time, "m review"] })] }))] }) })] }), reviewItem.template_data && (_jsxs(Card, { className: "template-insights", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Template Submission Details" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "insights-grid", children: [_jsxs("div", { className: "insight-item", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { children: [_jsx("span", { className: "insight-label", children: "Version" }), _jsxs("span", { className: "insight-value", children: ["v", reviewItem.template_data.version] })] })] }), _jsxs("div", { className: "insight-item", children: [_jsx(Star, { className: "w-5 h-5 text-yellow-500" }), _jsxs("div", { children: [_jsx("span", { className: "insight-label", children: "Price" }), _jsx("span", { className: "insight-value", children: reviewItem.template_data.price_cents === 0 ? 'Free' :
                                                        `$${(reviewItem.template_data.price_cents / 100).toFixed(2)}` })] })] }), _jsxs("div", { className: "insight-item", children: [_jsx(Flag, { className: "w-5 h-5 text-red-500" }), _jsxs("div", { children: [_jsx("span", { className: "insight-label", children: "Validation Issues" }), _jsxs("span", { className: "insight-value", children: [reviewItem.template_data.validation_results.filter(r => r.severity === 'error').length, " errors,", ' ', reviewItem.template_data.validation_results.filter(r => r.severity === 'warning').length, " warnings"] })] })] })] }) })] })), reviewItem.verification_data && (_jsxs(Card, { className: "verification-insights", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Verification Request Details" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "verification-progress", children: [_jsxs("div", { className: "progress-header", children: [_jsx("span", { children: "Verification Criteria" }), _jsxs("span", { children: [reviewItem.verification_data.verification_criteria.filter(c => c.status === 'passed').length, "/", reviewItem.verification_data.verification_criteria.length, " Complete"] })] }), _jsx("div", { className: "criteria-list", children: reviewItem.verification_data.verification_criteria.map(criterion => (_jsxs("div", { className: "criterion-item", children: [_jsxs("div", { className: "criterion-status", children: [criterion.status === 'passed' && _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }), criterion.status === 'failed' && _jsx(XCircle, { className: "w-4 h-4 text-red-500" }), criterion.status === 'manual_review' && _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500" }), criterion.status === 'pending' && _jsx(Clock, { className: "w-4 h-4 text-gray-400" })] }), _jsxs("div", { className: "criterion-info", children: [_jsx("span", { className: "criterion-name", children: criterion.name }), criterion.required && _jsx(Badge, { variant: "outline", className: "ml-2", children: "Required" })] })] }, criterion.id))) })] }) })] }))] }));
    const renderContentTab = () => (_jsxs("div", { className: "content-review", children: [reviewItem.template_data && (_jsx("div", { className: "template-content", children: _jsxs(Tabs, { defaultValue: "preview", className: "content-tabs", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "preview", children: "Preview" }), _jsx(TabsTrigger, { value: "validation", children: "Validation" }), _jsx(TabsTrigger, { value: "history", children: "History" })] }), _jsx(TabsContent, { value: "preview", className: "preview-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Template Graph Structure" }) }), _jsx(CardContent, { children: _jsx("div", { className: "graph-preview", children: _jsx("pre", { className: "graph-json", children: JSON.stringify(reviewItem.template_data.graph_json, null, 2) }) }) })] }) }), _jsx(TabsContent, { value: "validation", className: "validation-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: ["Validation Results", _jsxs(Badge, { variant: "outline", children: [reviewItem.template_data.validation_results.length, " rules checked"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "validation-list", children: reviewItem.template_data.validation_results.map((result, index) => (_jsxs("div", { className: `validation-item severity-${result.severity}`, children: [_jsxs("div", { className: "validation-icon", children: [result.severity === 'error' && _jsx(XCircle, { className: "w-4 h-4 text-red-500" }), result.severity === 'warning' && _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500" }), result.severity === 'info' && _jsx(Info, { className: "w-4 h-4 text-blue-500" })] }), _jsxs("div", { className: "validation-content", children: [_jsxs("div", { className: "validation-header", children: [_jsx("span", { className: "validation-category", children: result.category }), result.auto_fixable && _jsx(Badge, { variant: "outline", className: "ml-2", children: "Auto-fixable" })] }), _jsx("p", { className: "validation-message", children: result.message }), result.field && _jsxs("p", { className: "validation-field", children: ["Field: ", result.field] })] })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "history", className: "history-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Review History" }) }), _jsx(CardContent, { children: reviewItem.template_data.previous_reviews && reviewItem.template_data.previous_reviews.length > 0 ? (_jsx("div", { className: "history-list", children: reviewItem.template_data.previous_reviews.map((review, index) => (_jsxs("div", { className: "history-item", children: [_jsxs("div", { className: "review-meta", children: [_jsxs(Badge, { className: `rating-${review.rating}`, children: [review.rating, "/5 stars"] }), _jsx("span", { className: "review-category", children: review.category })] }), _jsx("p", { className: "review-comments", children: review.comments }), review.suggestions.length > 0 && (_jsx("ul", { className: "review-suggestions", children: review.suggestions.map((suggestion, i) => (_jsx("li", { children: suggestion }, i))) }))] }, index))) })) : (_jsx("p", { className: "text-gray-500", children: "No previous reviews available." })) })] }) })] }) })), reviewItem.verification_data && (_jsx("div", { className: "verification-documents", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: ["Verification Documents", _jsxs(Badge, { variant: "outline", children: [reviewItem.verification_data.documents.length, " files"] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "documents-grid", children: reviewItem.verification_data.documents.map((doc, index) => (_jsxs("div", { className: "document-card", children: [_jsx("div", { className: "document-preview", children: doc.type === 'image' ? (_jsx("img", { src: doc.thumbnailUrl || doc.url, alt: doc.fileName, className: "document-image", style: { transform: `scale(${documentZoom / 100})` } })) : (_jsxs("div", { className: "document-placeholder", children: [_jsx(FileText, { className: "w-8 h-8 text-gray-400" }), _jsx("span", { className: "document-type", children: doc.type.toUpperCase() })] })) }), _jsxs("div", { className: "document-info", children: [_jsx("h4", { className: "document-name", children: doc.fileName }), _jsx("p", { className: "document-size", children: formatFileSize(doc.fileSize) })] }), _jsxs("div", { className: "document-actions", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => window.open(doc.url, '_blank'), children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => { }, children: _jsx(Download, { className: "w-4 h-4" }) })] })] }, doc.id))) }), _jsx("div", { className: "document-controls", children: _jsxs("div", { className: "zoom-controls", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => setDocumentZoom(prev => Math.max(prev - 25, 25)), children: _jsx(ZoomOut, { className: "w-4 h-4" }) }), _jsxs("span", { className: "zoom-level", children: [documentZoom, "%"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setDocumentZoom(prev => Math.min(prev + 25, 200)), children: _jsx(ZoomIn, { className: "w-4 h-4" }) })] }) })] })] }) }))] }));
    const renderReviewTab = () => (_jsxs("div", { className: "review-decision", children: [_jsx("div", { className: "decision-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Review Decision" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "decision-options", children: [_jsxs("div", { className: "decision-buttons", children: [_jsxs(Button, { variant: reviewDecision.decision === 'approved' ? 'default' : 'outline', className: reviewDecision.decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : '', onClick: () => setReviewDecision(prev => ({ ...prev, decision: 'approved' })), children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Approve"] }), _jsxs(Button, { variant: reviewDecision.decision === 'changes_requested' ? 'default' : 'outline', className: reviewDecision.decision === 'changes_requested' ? 'bg-yellow-600 hover:bg-yellow-700' : '', onClick: () => setReviewDecision(prev => ({ ...prev, decision: 'changes_requested' })), children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-2" }), "Request Changes"] }), _jsxs(Button, { variant: reviewDecision.decision === 'rejected' ? 'default' : 'outline', className: reviewDecision.decision === 'rejected' ? 'bg-red-600 hover:bg-red-700' : '', onClick: () => setReviewDecision(prev => ({ ...prev, decision: 'rejected' })), children: [_jsx(XCircle, { className: "w-4 h-4 mr-2" }), "Reject"] })] }), _jsxs("div", { className: "overall-score", children: [_jsx("span", { className: "score-label", children: "Overall Score:" }), _jsxs("span", { className: "score-value", children: [calculateOverallScore(), "/100"] }), _jsx("div", { className: "score-bar", children: _jsx("div", { className: "score-fill", style: { width: `${calculateOverallScore()}%` } }) })] })] }) })] }) }), _jsx("div", { className: "feedback-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Detailed Feedback" }) }), _jsx(CardContent, { children: _jsx("div", { className: "feedback-categories", children: ['content', 'quality', 'compliance', 'usability', 'technical'].map(category => {
                                    const existingFeedback = reviewDecision.feedback?.find(f => f.category === category);
                                    return (_jsxs("div", { className: "feedback-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h4", { className: "category-title", children: category.charAt(0).toUpperCase() + category.slice(1) }), _jsx("div", { className: "rating-controls", children: [1, 2, 3, 4, 5].map(rating => (_jsx("button", { className: `rating-star ${(existingFeedback?.rating || 0) >= rating ? 'active' : ''}`, onClick: () => updateFeedback(category, { rating }), children: _jsx(Star, { className: "w-4 h-4" }) }, rating))) })] }), _jsx(Textarea, { placeholder: `Comments for ${category}...`, value: existingFeedback?.comments || '', onChange: (e) => updateFeedback(category, { comments: e.target.value }), className: "feedback-textarea", rows: 3 }), _jsx("div", { className: "feedback-options", children: _jsxs("label", { className: "blocking-checkbox", children: [_jsx("input", { type: "checkbox", checked: existingFeedback?.is_blocking || false, onChange: (e) => updateFeedback(category, { is_blocking: e.target.checked }) }), _jsx("span", { children: "Blocking issue" })] }) })] }, category));
                                }) }) })] }) }), _jsx("div", { className: "comments-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Comments" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "comment-inputs", children: [_jsxs("div", { className: "comment-group", children: [_jsx("label", { className: "comment-label", children: "Public Comments (visible to submitter)" }), _jsx(Textarea, { placeholder: "Provide clear feedback for the submitter...", value: reviewDecision.public_comments || '', onChange: (e) => setReviewDecision(prev => ({ ...prev, public_comments: e.target.value })), className: "public-comments", rows: 4, required: true })] }), _jsxs("div", { className: "comment-group", children: [_jsx("label", { className: "comment-label", children: "Private Notes (internal only)" }), _jsx(Textarea, { placeholder: "Internal notes for other reviewers or administrators...", value: reviewDecision.private_notes || '', onChange: (e) => setReviewDecision(prev => ({ ...prev, private_notes: e.target.value })), className: "private-notes", rows: 3 })] })] }) })] }) }), _jsx("div", { className: "follow-up-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Follow-up Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "follow-up-options", children: [_jsxs("label", { className: "follow-up-checkbox", children: [_jsx("input", { type: "checkbox", checked: reviewDecision.follow_up_required || false, onChange: (e) => setReviewDecision(prev => ({
                                                    ...prev,
                                                    follow_up_required: e.target.checked
                                                })) }), _jsx("span", { children: "Follow-up required" })] }), reviewDecision.follow_up_required && (_jsx("div", { className: "follow-up-details", children: _jsx("input", { type: "date", value: reviewDecision.follow_up_date ?
                                                reviewDecision.follow_up_date.toISOString().split('T')[0] : '', onChange: (e) => setReviewDecision(prev => ({
                                                ...prev,
                                                follow_up_date: e.target.value ? new Date(e.target.value) : undefined
                                            })), className: "follow-up-date" }) }))] }) })] }) })] }));
    // Helper functions
    const getTypeColor = (type) => {
        const colors = {
            template_submission: 'bg-blue-100 text-blue-800',
            verification_request: 'bg-green-100 text-green-800',
            policy_violation: 'bg-red-100 text-red-800',
            content_appeal: 'bg-purple-100 text-purple-800',
            marketplace_listing: 'bg-yellow-100 text-yellow-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };
    const getPriorityColor = (priority) => {
        const colors = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-gray-100 text-gray-800'
        };
        return colors[priority] || colors.medium;
    };
    const formatItemType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days}d ago`;
        if (hours > 0)
            return `${hours}h ago`;
        return 'Just now';
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    return (_jsxs("div", { className: `unified-review-interface ${className}`, children: [_jsx("div", { className: "review-header", children: _jsxs("div", { className: "header-nav", children: [_jsxs(Button, { variant: "outline", onClick: onBack, children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Queue"] }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", onClick: handleSaveDraft, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Draft"] }), _jsxs(Button, { onClick: handleSubmitDecision, disabled: !reviewDecision.decision || !reviewDecision.public_comments?.trim(), className: "submit-decision", children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Submit Decision"] })] })] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "review-tabs", children: [_jsxs(TabsList, { className: "review-tab-list", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "content", children: "Content" }), _jsx(TabsTrigger, { value: "review", children: "Review" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: renderOverviewTab() }), _jsx(TabsContent, { value: "content", className: "tab-content", children: renderContentTab() }), _jsx(TabsContent, { value: "review", className: "tab-content", children: renderReviewTab() })] }), _jsx("style", { jsx: true, children: `
        .unified-review-interface {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .review-header {
          background: white;
          border-radius: 12px;
          padding: 16px 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .submit-decision {
          background: #059669;
          color: white;
        }

        .submit-decision:hover {
          background: #047857;
        }

        .submit-decision:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .review-tabs {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .review-tab-list {
          grid-template-columns: repeat(3, 1fr);
          margin-bottom: 32px;
        }

        .tab-content {
          margin: 0;
          padding: 0;
        }

        /* Overview Tab Styles */
        .overview-header {
          margin-bottom: 24px;
        }

        .item-info {
          margin-bottom: 16px;
        }

        .item-type-badge {
          margin-bottom: 8px;
        }

        .item-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .item-description {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .template-insights, .verification-insights {
          margin-top: 24px;
          border: 1px solid #e5e7eb;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .insight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .insight-label {
          font-size: 14px;
          color: #6b7280;
          display: block;
        }

        .insight-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          display: block;
        }

        .verification-progress {
          space-y: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #1f2937;
        }

        .criteria-list {
          space-y: 8px;
        }

        .criterion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .criterion-status {
          flex-shrink: 0;
        }

        .criterion-info {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .criterion-name {
          font-size: 14px;
          color: #374151;
        }

        /* Content Tab Styles */
        .content-review {
          space-y: 24px;
        }

        .content-tabs {
          border: 1px solid #e5e7eb;
        }

        .graph-preview {
          max-height: 400px;
          overflow: auto;
          background: #f8fafc;
          border-radius: 6px;
          padding: 16px;
        }

        .graph-json {
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #374151;
          white-space: pre-wrap;
          margin: 0;
        }

        .validation-list {
          space-y: 12px;
        }

        .validation-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
        }

        .validation-item.severity-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .validation-item.severity-warning {
          background: #fffbeb;
          border: 1px solid #fed7aa;
        }

        .validation-item.severity-info {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        .validation-icon {
          flex-shrink: 0;
        }

        .validation-content {
          flex: 1;
        }

        .validation-header {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }

        .validation-category {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
        }

        .validation-message {
          font-size: 14px;
          color: #374151;
          margin: 4px 0;
        }

        .validation-field {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .document-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .document-preview {
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          overflow: hidden;
        }

        .document-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .document-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #9ca3af;
        }

        .document-type {
          font-size: 12px;
          font-weight: 600;
        }

        .document-info {
          padding: 12px;
        }

        .document-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          word-break: break-word;
        }

        .document-size {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .document-actions {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .document-controls {
          display: flex;
          justify-content: center;
          padding: 16px;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .zoom-level {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          min-width: 50px;
          text-align: center;
        }

        /* Review Tab Styles */
        .review-decision {
          space-y: 24px;
        }

        .decision-options {
          space-y: 16px;
        }

        .decision-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .overall-score {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .score-label {
          font-size: 14px;
          color: #6b7280;
        }

        .score-value {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .score-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
          transition: width 0.3s;
        }

        .feedback-categories {
          space-y: 20px;
        }

        .feedback-category {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .category-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .rating-controls {
          display: flex;
          gap: 4px;
        }

        .rating-star {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: color 0.2s;
          color: #d1d5db;
        }

        .rating-star:hover {
          color: #fbbf24;
        }

        .rating-star.active {
          color: #f59e0b;
        }

        .feedback-textarea {
          width: 100%;
          margin-bottom: 8px;
          resize: vertical;
        }

        .feedback-options {
          display: flex;
          align-items: center;
        }

        .blocking-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .comment-inputs {
          space-y: 20px;
        }

        .comment-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comment-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .public-comments, .private-notes {
          width: 100%;
          resize: vertical;
        }

        .follow-up-options {
          space-y: 12px;
        }

        .follow-up-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .follow-up-details {
          padding-left: 24px;
        }

        .follow-up-date {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }

        .history-list {
          space-y: 16px;
        }

        .history-item {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .review-comments {
          color: #374151;
          margin: 8px 0;
        }

        .review-suggestions {
          margin: 8px 0 0 20px;
          color: #6b7280;
          font-size: 14px;
        }

        .review-suggestions li {
          margin-bottom: 4px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .unified-review-interface {
            padding: 16px;
          }

          .header-nav {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .header-actions {
            justify-content: stretch;
          }

          .item-title {
            font-size: 20px;
          }

          .metadata-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .decision-buttons {
            flex-direction: column;
          }

          .overall-score {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .category-header {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
            text-align: center;
          }

          .documents-grid {
            grid-template-columns: 1fr;
          }
        }
      ` })] }));
};
export default UnifiedReviewInterface;
