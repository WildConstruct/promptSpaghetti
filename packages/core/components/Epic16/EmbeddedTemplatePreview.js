import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Embedded Template Preview - E16-1753114247039-7095F5
 *
 * Embeddable template preview component for social sharing and external site integration.
 * Builds upon existing TemplatePreviewModal and EmbeddableContent infrastructure.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { EyeIcon, ShareIcon, HeartIcon, StarIcon, DownloadIcon, CodeBracketIcon, LinkIcon, PhotoIcon, PlayIcon, ArrowsPointingOutIcon, ClipboardDocumentIcon, CheckIcon, Cog6ToothIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, TabletIcon, PaintBrushIcon, AdjustmentsHorizontalIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
// Predefined preview sizes
export const PREVIEW_SIZES = [
    { width: 320, height: 568, label: 'Mobile', icon: DevicePhoneMobileIcon, description: 'iPhone/Android portrait' },
    { width: 768, height: 1024, label: 'Tablet', icon: TabletIcon, description: 'iPad portrait' },
    { width: 1024, height: 768, label: 'Tablet Landscape', icon: TabletIcon, description: 'iPad landscape' },
    { width: 1200, height: 630, label: 'Desktop', icon: ComputerDesktopIcon, description: 'Standard desktop view' },
    { width: 400, height: 600, label: 'Widget', icon: ArrowsPointingOutIcon, description: 'Sidebar widget' },
    { width: 800, height: 400, label: 'Banner', icon: PhotoIcon, description: 'Header banner' }
];
// Embed code generation component
export const EmbedCodeGenerator = ({ template, customization, _____onCustomizationChange }) => {
    const [activeTab, setActiveTab] = useState('iframe');
    const [copied, setCopied] = useState(false);
    const embedCode = useMemo(() => {
        const baseUrl = `${window.location.origin}/embed/template/${template.id}`;
        const params = new URLSearchParams({
            theme: customization.theme.name,
            size: `${customization.size.width}x${customization.size.height}`,
            features: JSON.stringify(customization.features),
            layout: JSON.stringify(customization.layout),
            branding: JSON.stringify(customization.branding),
            social: JSON.stringify(customization.social)
        });
        switch (activeTab) {
            case 'iframe':
                return `<iframe
  src="${baseUrl}?${params}"
  width="${customization.size.width}"
  height="${customization.size.height}"
  frameborder="0"
  scrolling="no"
  allowtransparency="true"
  sandbox="allow-scripts allow-same-origin allow-popups"
  title="${template.title} - Template Preview"
></iframe>`;
            case 'javascript':
                return `<div id="template-embed-${template.id}"></div>
<script>
(function() {
  const embed = document.createElement('iframe');
  embed.src = '${baseUrl}?${params}';
  embed.width = '${customization.size.width}';
  embed.height = '${customization.size.height}';
  embed.frameBorder = '0';
  embed.scrolling = 'no';
  embed.allowTransparency = true;
  embed.sandbox = 'allow-scripts allow-same-origin allow-popups';
  embed.title = '${template.title} - Template Preview';
  
  document.getElementById('template-embed-${template.id}').appendChild(embed);
})();
</script>`;
            case 'react':
                return `import { EmbeddedTemplatePreview } from '@promptspaghetti/components';

<EmbeddedTemplatePreview
  template={{
    id: "${template.id}",
    title: "${template.title}",
    description: "${template.description}"
  }}
  embedConfig={{
    theme: "${customization.theme.name}",
    size: { width: ${customization.size.width}, height: ${customization.size.height} },
    features: ${JSON.stringify(customization.features, null, 2)},
    layout: ${JSON.stringify(customization.layout, null, 2)},
    branding: ${JSON.stringify(customization.branding, null, 2)},
    social: ${JSON.stringify(customization.social, null, 2)}
  }}
  variant="standard"
  interactive={true}
  showSocialActions={true}
/>`;
            default:
                return '';
        }
    }, [template, customization, activeTab]);
    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(embedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (err) {
            console.error('Failed to copy code:', err);
        }
    }, [embedCode]);
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Embed Code" }), _jsxs("button", { onClick: copyToClipboard, className: "flex items-center gap-2 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm", children: [copied ? _jsx(CheckIcon, { className: "h-4 w-4" }) : _jsx(ClipboardDocumentIcon, { className: "h-4 w-4" }), copied ? 'Copied!' : 'Copy'] })] }), _jsx("nav", { className: "flex space-x-8 px-4", children: [
                            { id: 'iframe', label: 'HTML (iframe)', description: 'Standard embed code' },
                            { id: 'javascript', label: 'JavaScript', description: 'Dynamic loading' },
                            { id: 'react', label: 'React', description: 'Component usage' }
                        ].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.id), className: `py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: tab.label }, tab.id))) })] }), _jsx("div", { className: "p-4", children: _jsx("pre", { className: "bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-64", children: _jsx("code", { children: embedCode }) }) })] }));
};
// Customization panel component
export const EmbedCustomizationPanel = ({ customization, onCustomizationChange, previewSize, onPreviewSizeChange }) => {
    const [activeSection, setActiveSection] = useState('size');
    const updateSize = useCallback((updates) => {
        onCustomizationChange({
            size: { ...customization.size, ...updates }
        });
    }, [customization.size, onCustomizationChange]);
    const updateTheme = useCallback((updates) => {
        onCustomizationChange({
            theme: { ...customization.theme, ...updates }
        });
    }, [customization.theme, onCustomizationChange]);
    const updateLayout = useCallback((updates) => {
        onCustomizationChange({
            layout: { ...customization.layout, ...updates }
        });
    }, [customization.layout, onCustomizationChange]);
    const updateFeatures = useCallback((updates) => {
        onCustomizationChange({
            features: { ...customization.features, ...updates }
        });
    }, [customization.features, onCustomizationChange]);
    const updateBranding = useCallback((updates) => {
        onCustomizationChange({
            branding: { ...customization.branding, ...updates }
        });
    }, [customization.branding, onCustomizationChange]);
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "border-b border-gray-200", children: [_jsx("h3", { className: "font-semibold text-gray-900 p-4", children: "Customize Embed" }), _jsx("nav", { className: "flex space-x-6 px-4", children: [
                            { id: 'size', label: 'Size', icon: ArrowsPointingOutIcon },
                            { id: 'theme', label: 'Theme', icon: PaintBrushIcon },
                            { id: 'layout', label: 'Layout', icon: AdjustmentsHorizontalIcon },
                            { id: 'features', label: 'Features', icon: Cog6ToothIcon },
                            { id: 'branding', label: 'Branding', icon: PaintBrushIcon }
                        ].map((section) => {
                            const Icon = section.icon;
                            return (_jsxs("button", { onClick: () => setActiveSection(section.id), className: `flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${activeSection === section.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), section.label] }, section.id));
                        }) })] }), _jsxs("div", { className: "p-4 space-y-6", children: [activeSection === 'size' && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Preview Size" }), _jsx("div", { className: "grid grid-cols-2 gap-3 mb-4", children: PREVIEW_SIZES.map((size) => {
                                    const Icon = size.icon;
                                    return (_jsxs("button", { onClick: () => onPreviewSizeChange(size), className: `flex items-center gap-3 p-3 border rounded-lg text-left hover:bg-gray-50 ${previewSize.label === size.label ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`, children: [_jsx(Icon, { className: "h-5 w-5 text-gray-600" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: size.label }), _jsxs("div", { className: "text-sm text-gray-600", children: [size.width, " \u00D7 ", size.height] }), _jsx("div", { className: "text-xs text-gray-500", children: size.description })] })] }, size.label));
                                }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Width" }), _jsx("input", { type: "number", value: customization.size.width, onChange: (e) => updateSize({ width: parseInt(e.target.value) || 0 }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", min: "200", max: "1920" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Height" }), _jsx("input", { type: "number", value: customization.size.height, onChange: (e) => updateSize({ height: parseInt(e.target.value) || 0 }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", min: "200", max: "1080" })] })] })] })), activeSection === 'theme' && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Theme" }), _jsx("div", { className: "grid grid-cols-3 gap-3 mb-4", children: ['light', 'dark', 'auto'].map((theme) => (_jsx("button", { onClick: () => updateTheme({ name: theme }), className: `p-3 border rounded-lg text-center capitalize ${customization.theme.name === theme ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`, children: theme }, theme))) }), customization.branding.customColors && (_jsxs("div", { className: "space-y-3", children: [_jsx("h5", { className: "font-medium text-gray-700", children: "Custom Colors" }), Object.entries(customization.branding.customColors).map(([key, value]) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("label", { className: "w-20 text-sm text-gray-600 capitalize", children: key }), _jsx("input", { type: "color", value: value, onChange: (e) => updateBranding({
                                                    customColors: {
                                                        ...customization.branding.customColors,
                                                        [key]: e.target.value
                                                    }
                                                }), className: "w-12 h-10 border border-gray-300 rounded cursor-pointer" }), _jsx("input", { type: "text", value: value, onChange: (e) => updateBranding({
                                                    customColors: {
                                                        ...customization.branding.customColors,
                                                        [key]: e.target.value
                                                    }
                                                }), className: "flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" })] }, key)))] }))] })), activeSection === 'layout' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Orientation" }), _jsx("div", { className: "flex gap-2", children: ['horizontal', 'vertical', 'grid'].map((orientation) => (_jsx("button", { onClick: () => updateLayout({ orientation: orientation }), className: `px-3 py-2 border rounded-md text-sm capitalize ${customization.layout.orientation === orientation
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:bg-gray-50'}`, children: orientation }, orientation))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Content Alignment" }), _jsx("div", { className: "flex gap-2", children: ['left', 'center', 'right'].map((alignment) => (_jsx("button", { onClick: () => updateLayout({ contentAlignment: alignment }), className: `px-3 py-2 border rounded-md text-sm capitalize ${customization.layout.contentAlignment === alignment
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:bg-gray-50'}`, children: alignment }, alignment))) })] }), _jsx("div", { className: "space-y-3", children: [
                                    { key: 'showHeader', label: 'Show Header' },
                                    { key: 'showFooter', label: 'Show Footer' },
                                    { key: 'showSidebar', label: 'Show Sidebar' }
                                ].map((option) => (_jsxs("label", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: customization.layout[option.key], onChange: (e) => updateLayout({ [option.key]: e.target.checked }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700", children: option.label })] }, option.key))) })] })), activeSection === 'features' && (_jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Features" }), Object.entries(customization.features).map(([key, value]) => (_jsxs("label", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: value, onChange: (e) => updateFeatures({ [key]: e.target.checked }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700 capitalize", children: key.replace(/([A-Z])/g, ' $1').toLowerCase() })] }, key)))] })), activeSection === 'branding' && (_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Branding Options" }), _jsx("div", { className: "space-y-3", children: [
                                    { key: 'showLogo', label: 'Show Logo' },
                                    { key: 'showTitle', label: 'Show Title' },
                                    { key: 'showAuthor', label: 'Show Author' },
                                    { key: 'showPoweredBy', label: 'Show "Powered by" Link' }
                                ].map((option) => (_jsxs("label", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: customization.branding[option.key], onChange: (e) => updateBranding({ [option.key]: e.target.checked }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "text-sm text-gray-700", children: option.label })] }, option.key))) })] }))] })] }));
};
// Main embedded template preview component
export const EmbeddedTemplatePreview = ({ template, embedConfig, showCustomization = false, onCustomize, onShare, onPreview, onPurchase, onLike, _____onRate, className = '', variant = 'standard', interactive = true, _____autoPlay = false, showMetrics = true, showSocialActions = true, showPurchaseButton = true, maxWidth, maxHeight }) => {
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [previewSize, setPreviewSize] = useState(PREVIEW_SIZES[1]); // Default to tablet
    const [customization, setCustomization] = useState({
        size: { width: previewSize.width, height: previewSize.height, responsive: true },
        theme: { name: 'light', colors: {}, fonts: {} },
        features: {
            showPreview: true,
            showMetadata: true,
            showActions: showSocialActions,
            showComments: false,
            enableInteraction: interactive,
            enableSharing: true,
            enablePurchase: showPurchaseButton,
            showRating: true
        },
        layout: {
            orientation: 'vertical',
            showHeader: true,
            showFooter: true,
            showSidebar: false,
            contentAlignment: 'center',
            spacing: 'normal',
            borderRadius: 8,
            shadow: 'md'
        },
        branding: {
            showLogo: true,
            showTitle: true,
            showAuthor: true,
            showPoweredBy: true,
            customColors: {
                primary: '#3B82F6',
                secondary: '#64748B',
                accent: '#10B981',
                background: '#FFFFFF',
                text: '#1F2937'
            }
        },
        social: {
            showLikes: true,
            showShares: true,
            showComments: false,
            showRating: true,
            showDownloads: true,
            enableInteraction: interactive,
            showAuthorInfo: true,
            showStats: showMetrics
        }
    });
    // Update customization when preview size changes
    useEffect(() => {
        setCustomization(prev => ({
            ...prev,
            size: { ...prev.size, width: previewSize.width, height: previewSize.height }
        }));
    }, [previewSize]);
    const handleCustomizationChange = useCallback((updates) => {
        const newCustomization = { ...customization, ...updates };
        setCustomization(newCustomization);
        onCustomize?.({ ...embedConfig, ...newCustomization });
    }, [customization, embedConfig, onCustomize]);
    const handleShare = useCallback((method) => {
        onShare?.({ ...method, customization });
    }, [onShare, customization]);
    const getVariantStyles = () => {
        switch (variant) {
            case 'compact':
                return 'p-3 text-sm';
            case 'detailed':
                return 'p-6 text-base';
            case 'showcase':
                return 'p-8 text-lg';
            default:
                return 'p-4 text-sm';
        }
    };
    return (_jsxs("div", { className: `bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`, children: [_jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(PhotoIcon, { className: "h-6 w-6 text-blue-500" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Embedded Template Preview" }), _jsx("p", { className: "text-sm text-gray-600", children: template.title })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [showCustomization && (_jsxs("button", { onClick: () => setIsCustomizing(!isCustomizing), className: "flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded", children: [_jsx(Cog6ToothIcon, { className: "h-4 w-4" }), "Customize"] })), _jsxs("button", { onClick: () => handleShare({ type: 'embed' }), className: "flex items-center gap-2 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded", children: [_jsx(ShareIcon, { className: "h-4 w-4" }), "Share"] })] })] }) }), _jsxs("div", { className: isCustomizing ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 p-6' : 'p-6', children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Live Preview" }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx("span", { children: previewSize.label }), _jsx("span", { className: "text-gray-400", children: "\u2022" }), _jsxs("span", { children: [customization.size.width, " \u00D7 ", customization.size.height] })] })] }), _jsx("div", { className: "border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center", style: {
                                    maxWidth: maxWidth || 'none',
                                    maxHeight: maxHeight || 'none',
                                    minHeight: '400px'
                                }, children: _jsx("div", { className: "bg-white border border-gray-200 rounded shadow-md overflow-hidden", style: {
                                        width: Math.min(customization.size.width, maxWidth || customization.size.width),
                                        height: Math.min(customization.size.height, maxHeight || customization.size.height),
                                        maxWidth: '100%',
                                        maxHeight: '100%'
                                    }, children: _jsxs("div", { className: `h-full flex flex-col ${getVariantStyles()}`, children: [customization.layout.showHeader && customization.branding.showTitle && (_jsxs("div", { className: "border-b border-gray-100 pb-2 mb-3", children: [_jsx("h5", { className: "font-semibold text-gray-900 truncate", children: template.title }), customization.branding.showAuthor && (_jsxs("p", { className: "text-xs text-gray-600", children: ["by ", template.author.name] }))] })), _jsx("div", { className: "flex-1 flex items-center justify-center bg-gray-50 rounded mb-3", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx(PlayIcon, { className: "h-8 w-8 mx-auto mb-2" }), _jsx("p", { className: "text-sm", children: "Template Preview" }), _jsx("p", { className: "text-xs", children: template.description })] }) }), customization.social.showStats && showMetrics && (_jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-600 mb-3", children: [customization.social.showLikes && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(HeartIcon, { className: "h-3 w-3" }), _jsx("span", { children: template.metrics?.likes || 0 })] })), customization.social.showDownloads && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(DownloadIcon, { className: "h-3 w-3" }), _jsx("span", { children: template.metrics?.downloads || 0 })] })), customization.social.showRating && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(StarIcon, { className: "h-3 w-3" }), _jsx("span", { children: template.rating?.average.toFixed(1) || '0.0' })] }))] })), showSocialActions && customization.features.showActions && (_jsxs("div", { className: "flex items-center gap-2", children: [customization.social.enableInteraction && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => onLike?.(template), className: "flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-500 rounded", children: [_jsx(HeartIcon, { className: "h-3 w-3" }), "Like"] }), _jsxs("button", { onClick: () => handleShare({ type: 'social', platform: 'twitter' }), className: "flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-500 rounded", children: [_jsx(ShareIcon, { className: "h-3 w-3" }), "Share"] })] })), showPurchaseButton && customization.features.enablePurchase && (_jsxs("button", { onClick: () => onPurchase?.(template), className: "flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded ml-auto", children: [_jsx(DownloadIcon, { className: "h-3 w-3" }), "$", template.price] }))] })), customization.layout.showFooter && customization.branding.showPoweredBy && (_jsx("div", { className: "border-t border-gray-100 pt-2 mt-3", children: _jsxs("p", { className: "text-xs text-gray-500 text-center", children: ["Powered by ", _jsx("span", { className: "text-blue-600", children: "PromptSpaghetti" })] }) }))] }) }) })] }), isCustomizing && (_jsxs("div", { className: "space-y-6", children: [_jsx(EmbedCustomizationPanel, { customization: customization, onCustomizationChange: handleCustomizationChange, previewSize: previewSize, onPreviewSizeChange: setPreviewSize }), _jsx(EmbedCodeGenerator, { template: template, customization: customization, onCustomizationChange: handleCustomizationChange })] }))] }), !isCustomizing && (_jsx("div", { className: "border-t border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsx("span", { children: "Share this template:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleShare({ type: 'link' }), className: "p-1 text-gray-400 hover:text-blue-600 rounded", title: "Copy Link", children: _jsx(LinkIcon, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleShare({ type: 'embed' }), className: "p-1 text-gray-400 hover:text-green-600 rounded", title: "Embed Code", children: _jsx(CodeBracketIcon, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleShare({ type: 'social', platform: 'twitter' }), className: "p-1 text-gray-400 hover:text-blue-400 rounded", title: "Share on Twitter", children: _jsx(ChatBubbleLeftIcon, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => onPreview?.(template), className: "flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm", children: [_jsx(EyeIcon, { className: "h-4 w-4" }), "Full Preview"] }), showPurchaseButton && (_jsxs("button", { onClick: () => onPurchase?.(template), className: "flex items-center gap-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm", children: [_jsx(DownloadIcon, { className: "h-4 w-4" }), "Purchase $", template.price] }))] })] }) }))] }));
};
export default EmbeddedTemplatePreview;
