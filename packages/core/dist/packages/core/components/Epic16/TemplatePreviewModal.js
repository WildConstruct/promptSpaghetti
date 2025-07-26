import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Template Preview Modal Component
 *
 * Modal component for previewing marketplace templates with Claude integration,
 * sandboxed content protection, and purchase flow integration.
 */
import { useState, useEffect, useRef } from 'react';
export const TemplatePreviewModal = ({ template, isOpen, onClose, onPurchase, onPreviewGenerate, isPurchased = false, currentUser }) => {
    const [activeTab, setActiveTab] = useState('preview');
    const [previewInput, setPreviewInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('claude-3-haiku');
    const [previewResult, setPreviewResult] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [usageCount, setUsageCount] = useState(0);
    const streamRef = useRef(null);
    // Rate limiting based on user tier
    const getRateLimit = () => {
        if (!currentUser)
            return 3;
        switch (currentUser.tier) {
            case 'enterprise': return 50;
            case 'pro': return 25;
            case 'free':
            default: return 3;
        }
    };
    const canGenerate = usageCount < getRateLimit();
    useEffect(() => {
        if (isOpen) {
            setActiveTab('preview');
            setPreviewInput('');
            setPreviewResult(null);
            setPreviewError(null);
            setUsageCount(0);
        }
    }, [isOpen]);
    const handlePreviewGenerate = async () => {
        if (!onPreviewGenerate || !canGenerate || !previewInput.trim())
            return;
        setIsGenerating(true);
        setPreviewError(null);
        setPreviewResult(null);
        try {
            const result = await onPreviewGenerate(template, previewInput, selectedModel);
            setPreviewResult(result);
            setUsageCount(prev => prev + 1);
        }
        catch (error) {
            setPreviewError(error instanceof Error ? error.message : 'Preview generation failed');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const formatCost = (cost) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(cost);
    };
    const formatPrice = (cents, currency) => {
        if (cents === 0)
            return 'Free';
        const amount = cents / 100;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden", children: [_jsxs("div", { className: "border-b border-gray-200 px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: template.title }), _jsxs("p", { className: "text-sm text-gray-500", children: ["by ", template.creatorName] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "text-lg font-bold text-gray-900", children: formatPrice(template.price, template.currency) }), template.isAiGenerated && (_jsx("span", { className: "px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full", children: "AI Generated" })), isPurchased && (_jsx("span", { className: "px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full", children: "Owned" }))] })] }), _jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("nav", { className: "flex space-x-8 mt-4", children: [_jsx("button", { onClick: () => setActiveTab('preview'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'preview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Live Preview" }), _jsx("button", { onClick: () => setActiveTab('details'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Template Details" }), _jsxs("button", { onClick: () => setActiveTab('reviews'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: ["Reviews (", template.reviewCount, ")"] })] })] }), _jsxs("div", { className: "overflow-y-auto", style: { maxHeight: 'calc(90vh - 200px)' }, children: [activeTab === 'preview' && (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Try it out with your input:" }), _jsx("textarea", { value: previewInput, onChange: (e) => setPreviewInput(e.target.value), placeholder: isPurchased
                                                            ? 'Enter your prompt input to see the full template in action...'
                                                            : 'Enter your prompt input to see a preview (some content will be masked until purchase)...', className: "w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Claude Model:" }), _jsx("select", { value: selectedModel, onChange: (e) => setSelectedModel(e.target.value), className: "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: template.compatibility.map((model) => (_jsx("option", { value: model, children: model }, model))) })] }), _jsx("div", { className: "flex-shrink-0 pt-6", children: _jsx("button", { onClick: handlePreviewGenerate, disabled: !canGenerate || !previewInput.trim() || isGenerating, className: `px-4 py-2 rounded-md font-medium ${canGenerate && previewInput.trim() && !isGenerating
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`, children: isGenerating ? 'Generating...' : 'Generate Preview' }) })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Preview generations remaining: ", _jsx("span", { className: "font-medium", children: getRateLimit() - usageCount }), currentUser?.tier === 'free' && (_jsx("span", { className: "text-blue-600", children: " (Upgrade for more previews)" }))] })] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Preview Output:" }), previewError ? (_jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded-md", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { className: "w-5 h-5 text-red-400 mt-0.5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Preview Error" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: previewError })] })] }) })) : previewResult ? (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "p-4 bg-gray-50 border border-gray-200 rounded-md", children: _jsx("div", { ref: streamRef, className: "whitespace-pre-wrap text-sm text-gray-900 font-mono max-h-64 overflow-y-auto", children: previewResult.output }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "bg-white p-3 border border-gray-200 rounded", children: [_jsx("div", { className: "text-gray-500", children: "Cost" }), _jsx("div", { className: "font-medium", children: formatCost(previewResult.cost) })] }), _jsxs("div", { className: "bg-white p-3 border border-gray-200 rounded", children: [_jsx("div", { className: "text-gray-500", children: "Quality Score" }), _jsxs("div", { className: "font-medium", children: [previewResult.qualityScore.toFixed(1), "/5"] })] }), _jsxs("div", { className: "bg-white p-3 border border-gray-200 rounded", children: [_jsx("div", { className: "text-gray-500", children: "Tokens" }), _jsx("div", { className: "font-medium", children: previewResult.tokens.toLocaleString() })] }), _jsxs("div", { className: "bg-white p-3 border border-gray-200 rounded", children: [_jsx("div", { className: "text-gray-500", children: "Execution Time" }), _jsxs("div", { className: "font-medium", children: [previewResult.executionTime, "ms"] })] })] }), !isPurchased && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { className: "w-5 h-5 text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-yellow-700", children: "This is a sandboxed preview with masked content. Purchase the template to access the full prompt and all features." }) })] }) }))] })) : (_jsx("div", { className: "h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("svg", { className: "mx-auto h-8 w-8 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Enter input above and click Generate to see a preview" })] }) }))] }) })] }) })), activeTab === 'details' && (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Description" }), _jsx("p", { className: "text-gray-700 leading-relaxed", children: template.description })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Tags" }), _jsx("div", { className: "flex flex-wrap gap-2", children: template.tags.map((tag) => (_jsx("span", { className: "px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm", children: tag }, tag))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Compatible Models" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: template.compatibility.map((model) => (_jsx("div", { className: "p-3 bg-gray-50 border border-gray-200 rounded-md", children: _jsx("div", { className: "font-medium text-sm", children: model }) }, model))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Statistics" }), _jsxs("div", { className: "grid grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: template.stats.downloads.toLocaleString() }), _jsx("div", { className: "text-sm text-gray-500", children: "Downloads" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: template.stats.views.toLocaleString() }), _jsx("div", { className: "text-sm text-gray-500", children: "Views" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: template.stats.likes.toLocaleString() }), _jsx("div", { className: "text-sm text-gray-500", children: "Likes" })] })] })] })] })), activeTab === 'reviews' && (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4L1 20l4-4 4-4a8 8 0 018-8c4.418 0 8 3.582 8 8z" }) }), _jsx("h3", { className: "mt-4 text-lg font-medium text-gray-900", children: "Reviews Coming Soon" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Review and rating system will be available in a future update." })] }) }))] }), _jsx("div", { className: "border-t border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Last updated: ", template.updatedAt.toLocaleDateString()] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50", children: "Close" }), !isPurchased && (_jsx("button", { onClick: () => onPurchase(template), className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium", children: template.price === 0 ? 'Get Free Template' : `Buy for ${formatPrice(template.price, template.currency)}` }))] })] }) })] }) }));
};
export default TemplatePreviewModal;
