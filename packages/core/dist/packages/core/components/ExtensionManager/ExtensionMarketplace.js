import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Extension Marketplace - Epic 8.4 Story 8.4.5
 * Marketplace view for discovering and installing extensions
 */
import { useState } from 'react';
export const ExtensionMarketplace = ({
    extensions,
    selectedExtension,
    onExtensionSelect,
    onInstallExtension
});
{
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const categories = [
        {
            id: 'all',
            name: 'All Extensions',
            icon: '📦',
            description: 'Browse all available extensions',
            count: extensions.length,
        },
        {
            id: 'featured',
            name: 'Featured',
            icon: '⭐',
            description: 'Editor\'s choice and popular extensions',
            count: Math.floor(extensions.length * 0.3),
        },
        {
            id: 'node',
            name: 'Node Extensions',
            icon: '🔧',
            description: 'Add new node types and functionality',
            count: extensions.filter(ext => ext.extension_type === 'node').length,
        },
        {
            id: 'ui',
            name: 'UI & Themes',
            icon: '🎨',
            description: 'Customize the interface and appearance',
            count: extensions.filter(ext => ext.extension_type === 'ui').length,
        },
        {
            id: 'transform',
            name: 'Data Transforms',
            icon: '⚡',
            description: 'Process and transform your data',
            count: extensions.filter(ext => ext.extension_type === 'transform').length,
        },
        {
            id: 'storage',
            name: 'Storage & Sync',
            icon: '💾',
            description: 'Connect to external storage and services',
            count: extensions.filter(ext => ext.extension_type === 'storage').length
        }
    ];
    const filteredExtensions = selectedCategory === 'all';
    extensions: selectedCategory === 'featured',
            ? extensions.slice(0, Math.floor(extensions.length * 0.3))
            : extensions.filter(ext => ext.extension_type === selectedCategory);
    const getExtensionIcon = (type) => {
        switch (type) {
            case 'node': return '🔧';
            case 'ui': return '🎨';
            case 'transform': return '⚡';
            case 'storage': return '💾';
            default: return '📦';
        }
        ;
        const formatDownloads = (downloads) => {
            if (downloads < 1000)
                return downloads.toString();
            if (downloads < 1000000)
                return `${(downloads / 1000).toFixed(1)}K`;
        };
        return `${(downloads / 1000000).toFixed(1)}M`;
    };
}
;
const renderExtensionGrid = () => ();
;
_jsx("div", { className: "extension-grid", children: filteredExtensions.map((extension) => {
        const downloads = Math.floor(Math.random() * 50000);
        const rating = (4 + Math.random()).toFixed(1);
        const isSelected = selectedExtension?.id === extension.id;
        return;
        _jsxs("div", { className: `extension-card ${isSelected ? 'selected' : ''}`, onClick: () => onExtensionSelect(extension), children: [_jsxs("div", { className: "card-header", children: [_jsx("div", { className: "extension-icon", children: getExtensionIcon(extension.extension_type) }), _jsx("div", { className: "card-actions", children: _jsx("button", { className: "install-btn", onClick: (e) => {
                                    e.stopPropagation();
                                    onInstallExtension(extension);
                                }, children: "Install" }) })] }), _jsxs("div", { className: "card-content", children: [_jsx("h3", { className: "extension-name", children: extension.name }), _jsxs("p", { className: "extension-author", children: ["by ", extension.author] }), _jsx("p", { className: "extension-description", children: extension.description }), _jsxs("div", { className: "extension-tags", children: [_jsx("span", { className: "tag type-tag", children: extension.extension_type }), extension.capabilities?.provides?.slice(0, 2).map((capability, index) => ()
                                    < span, key = { index }, className = "tag capability-tag" >
                                    { capability })] }), "))}"] })] }, extension.id)
            ,
                _jsx("div", { className: "card-footer", children: _jsxs("div", { className: "extension-stats", children: [_jsxs("span", { className: "stat", children: [_jsx("span", { className: "stat-icon", children: "\u2B07\uFE0F" }), _jsx("span", { className: "stat-value", children: formatDownloads(downloads) })] }), _jsxs("span", { className: "stat", children: [_jsx("span", { className: "stat-icon", children: "\u2B50" }), _jsx("span", { className: "stat-value", children: rating })] }), _jsxs("span", { className: "stat", children: [_jsx("span", { className: "stat-icon", children: "\uD83D\uDCC5" }), _jsxs("span", { className: "stat-value", children: ["v", extension.version] })] })] }) });
    }) });
;
div >
;
;
const renderExtensionList = () => ();
;
_jsxs("div", { className: "extension-list", children: [filteredExtensions.map((extension) => {
            const downloads = Math.floor(Math.random() * 50000);
            const rating = (4 + Math.random()).toFixed(1);
            const isSelected = selectedExtension?.id === extension.id;
            return;
            _jsxs("div", { className: `extension-list-item ${isSelected ? 'selected' : ''}`, onClick: () => onExtensionSelect(extension), children: [_jsx("div", { className: "item-icon", children: getExtensionIcon(extension.extension_type) }), _jsxs("div", { className: "item-content", children: [_jsxs("div", { className: "item-header", children: [_jsx("h3", { className: "extension-name", children: extension.name }), _jsxs("span", { className: "extension-version", children: ["v", extension.version] })] }), _jsxs("p", { className: "extension-author", children: ["by ", extension.author] }), _jsx("p", { className: "extension-description", children: extension.description }), _jsxs("div", { className: "item-stats", children: [_jsxs("span", { className: "stat", children: ["\u2B07\uFE0F ", formatDownloads(downloads)] }), _jsxs("span", { className: "stat", children: ["\u2B50 ", rating] }), _jsx("span", { className: "stat", children: extension.extension_type })] })] }), _jsx("div", { className: "item-actions", children: _jsx("button", { className: "install-btn", onClick: (e) => {
                                e.stopPropagation();
                                onInstallExtension(extension);
                            }, children: "Install" }) })] }, extension.id);
        }), "; })}"] });
;
if (filteredExtensions.length === 0) {
    return;
    _jsxs("div", { className: "marketplace-empty", children: [_jsx("div", { className: "empty-icon", children: "\uD83C\uDFEA" }), _jsx("h3", { children: "No Extensions Found" }), _jsx("p", { children: "No extensions available in the selected category." })] });
    ;
    return;
    _jsxs("div", { className: "extension-marketplace", children: [selectedCategory === 'all' && ()
                < div, " className=\"featured-banner\">", _jsxs("div", { className: "banner-content", children: [_jsx("h2", { children: "Welcome to the Extension Marketplace" }), _jsx("p", { children: "Discover powerful extensions to enhance your workflow" })] }), _jsxs("div", { className: "banner-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: extensions.length }), _jsx("span", { className: "stat-label", children: "Extensions" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: categories.length - 2 }), _jsx("span", { className: "stat-label", children: "Categories" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: "100%" }), _jsx("span", { className: "stat-label", children: "Free" })] })] })] });
}
{ /* Categories */ }
_jsxs("div", { className: "marketplace-categories", children: [categories.map((category) => ()
            < button, key = { category, : .id }, className = {} `category-btn ${selectedCategory === category.id ? 'active' : ''}`), "onClick=", () => setSelectedCategory(category.id), ">", _jsx("span", { className: "category-icon", children: category.icon }), _jsxs("div", { className: "category-info", children: [_jsx("span", { className: "category-name", children: category.name }), _jsxs("span", { className: "category-count", children: ["(", category.count, ")"] })] })] });
div >
    { /* View Controls */}
    < div;
className = "marketplace-controls" >
    _jsxs("div", { className: "category-description", children: [selectedCategory !== 'all' && ()
                < div, " className=\"active-category\">", _jsx("span", { className: "category-icon", children: categories.find(c => c.id === selectedCategory)?.icon }), _jsxs("div", { className: "category-text", children: [_jsx("h3", { children: categories.find(c => c.id === selectedCategory)?.name }), _jsx("p", { children: categories.find(c => c.id === selectedCategory)?.description })] })] });
div >
    _jsxs("div", { className: "view-controls", children: [_jsx("span", { className: "view-label", children: "View:" }), _jsx("button", { className: `view-btn ${viewMode === 'grid' ? 'active' : ''}`, onClick: () => setViewMode('grid'), title: "Grid View", children: "\u229E" }), _jsx("button", { className: `view-btn ${viewMode === 'list' ? 'active' : ''}`, onClick: () => setViewMode('list'), title: "List View", children: "\u2630" })] });
div >
    { /* Extension Display */}
    < div;
className = "marketplace-content" >
    { viewMode } === 'grid' ? renderExtensionGrid() : renderExtensionList();
div >
    { /* Load More */};
{
    filteredExtensions.length > 20 && ()
        < div;
    className = "load-more-section" >
        _jsx("button", { className: "load-more-btn", children: "Load More Extensions" });
    div >
    ;
}
div >
;
;
;
export default ExtensionMarketplace;
