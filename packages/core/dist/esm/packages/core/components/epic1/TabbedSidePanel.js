import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Tabbed Side Panel for Epic 1
 * Combines Preview and Asset Browser in a collapsible tabbed interface
 */
import { useState, useCallback } from 'react';
import { PreviewPanel } from './preview/PreviewPanel';
import { AssetLibraryV2 } from './asset-library/AssetLibraryV2';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
import './TabbedSidePanel.css';
export const TabbedSidePanel = ({ previewEngine, onPresetDrag, onPresetSelect, position = 'right', defaultTab = null }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [hoveredTab, setHoveredTab] = useState(null);
    const handleTabClick = useCallback((tab) => {
        setActiveTab(activeTab === tab ? null : tab);
    }, [activeTab]);
    const isExpanded = activeTab !== null;
    return (_jsxs("div", { className: `tabbed-side-panel ${position} ${isExpanded ? 'expanded' : 'collapsed'}`, children: [_jsxs("div", { className: "tab-buttons", children: [_jsxs("button", { className: `tab-button ${activeTab === 'preview' ? 'active' : ''} ${hoveredTab === 'preview' ? 'hovered' : ''}`, onClick: () => handleTabClick('preview'), onMouseEnter: () => setHoveredTab('preview'), onMouseLeave: () => setHoveredTab(null), title: "Preview", children: [_jsx("span", { className: "tab-icon", children: "\uD83D\uDC41\uFE0F" }), _jsx("span", { className: "tab-label", children: "Preview" })] }), _jsxs("button", { className: `tab-button ${activeTab === 'assets' ? 'active' : ''} ${hoveredTab === 'assets' ? 'hovered' : ''}`, onClick: () => handleTabClick('assets'), onMouseEnter: () => setHoveredTab('assets'), onMouseLeave: () => setHoveredTab(null), title: "Asset Browser", children: [_jsx("span", { className: "tab-icon", children: "\uD83D\uDCDA" }), _jsx("span", { className: "tab-label", children: "Assets" })] })] }), _jsxs("div", { className: "panel-content", children: [activeTab === 'preview' && previewEngine && (_jsx("div", { className: "preview-container", children: _jsx(PreviewPanel, { previewEngine: previewEngine, className: "embedded-preview" }) })), activeTab === 'assets' && (_jsx("div", { className: "assets-container", children: _jsx(AssetLibraryErrorBoundary, { children: _jsx(AssetLibraryV2, { position: "right", onPresetDrag: onPresetDrag, onPresetSelect: onPresetSelect, defaultExpanded: true }) }) })), !activeTab && (_jsx("div", { className: "panel-hint", children: _jsx("div", { className: "hint-arrow", children: "\u25C0" }) }))] })] }));
};
export default TabbedSidePanel;
