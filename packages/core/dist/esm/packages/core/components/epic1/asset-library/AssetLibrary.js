import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Asset Library Component for Epic 1
 * Provides a collapsible panel with categorized presets that can be dragged onto nodes
 */
import { useState, useCallback, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { medievalPresetCategories } from './medievalPresets';
import './AssetLibrary.css';
// Draggable preset item component
const PresetItem = ({ preset, category, onHover }) => {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: 'preset',
        item: { preset, sourceCategory: category },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [preset, category]);
    const handleMouseEnter = useCallback(() => {
        onHover?.(preset);
    }, [preset, onHover]);
    const handleMouseLeave = useCallback(() => {
        onHover?.(null);
    }, [onHover]);
    return (_jsxs("div", { ref: drag, className: `preset-item ${isDragging ? 'dragging' : ''}`, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, title: preset.metadata.description, children: [_jsx("span", { className: "preset-name", children: preset.name }), _jsx("span", { className: "preset-type", children: preset.nodeType }), preset.tags.length > 0 && (_jsx("div", { className: "preset-tags", children: preset.tags.slice(0, 2).map(tag => (_jsx("span", { className: "preset-tag", children: tag }, tag))) }))] }));
};
// Category section component
const CategorySection = ({ category, isExpanded, onToggle, searchQuery, onPresetHover }) => {
    // Filter presets based on search
    const filteredPresets = useMemo(() => {
        if (!searchQuery)
            return category.presets;
        const query = searchQuery.toLowerCase();
        return category.presets.filter(preset => preset.name.toLowerCase().includes(query) ||
            preset.tags.some(tag => tag.toLowerCase().includes(query)) ||
            preset.metadata.description?.toLowerCase().includes(query));
    }, [category.presets, searchQuery]);
    if (filteredPresets.length === 0 && searchQuery) {
        return null;
    }
    return (_jsxs("div", { className: "category-section", children: [_jsxs("div", { className: "category-header", onClick: onToggle, children: [_jsx("span", { className: "category-icon", children: category.icon }), _jsx("span", { className: "category-name", children: category.name }), _jsx("span", { className: "category-count", children: filteredPresets.length }), _jsx("span", { className: `category-arrow ${isExpanded ? 'expanded' : ''}`, children: "\u25B6" })] }), isExpanded && (_jsx("div", { className: "category-presets", children: filteredPresets.map(preset => (_jsx(PresetItem, { preset: preset, category: category.id, onHover: onPresetHover }, preset.id))) }))] }));
};
/**
 * Asset Library Component
 * Displays categorized presets that can be dragged onto graph nodes
 */
export const AssetLibrary = ({ onPresetDrag, position = 'left', defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set(['character-occupations']) // Default expand first category
    );
    const [hoveredPreset, setHoveredPreset] = useState(null);
    const toggleLibrary = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);
    const toggleCategory = useCallback((categoryId) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            }
            else {
                next.add(categoryId);
            }
            return next;
        });
    }, []);
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);
    const handlePresetHover = useCallback((preset) => {
        setHoveredPreset(preset);
    }, []);
    // Count total visible presets
    const totalPresets = useMemo(() => {
        return medievalPresetCategories.reduce((sum, cat) => sum + cat.presets.length, 0);
    }, []);
    return (_jsxs("div", { className: `asset-library ${position} ${isExpanded ? 'expanded' : 'collapsed'}`, children: [_jsxs("div", { className: "library-header", onClick: toggleLibrary, children: [_jsx("span", { className: "library-icon", children: "\uD83D\uDCDA" }), _jsx("span", { className: "library-title", children: "Asset Library" }), _jsx("span", { className: "library-count", children: totalPresets }), _jsx("span", { className: `library-toggle ${isExpanded ? 'expanded' : ''}`, children: "\u25C0" })] }), isExpanded && (_jsxs(_Fragment, { children: [_jsx("div", { className: "library-search", children: _jsx("input", { type: "text", placeholder: "Search presets...", value: searchQuery, onChange: handleSearchChange, className: "search-input", onClick: (e) => e.stopPropagation() }) }), _jsx("div", { className: "library-content", children: medievalPresetCategories.map(category => (_jsx(CategorySection, { category: category, isExpanded: expandedCategories.has(category.id), onToggle: () => toggleCategory(category.id), searchQuery: searchQuery, onPresetHover: handlePresetHover }, category.id))) }), hoveredPreset && (_jsxs("div", { className: "preset-preview", children: [_jsxs("div", { className: "preview-header", children: [_jsx("strong", { children: hoveredPreset.name }), _jsx("span", { className: "preview-type", children: hoveredPreset.nodeType })] }), hoveredPreset.metadata.description && (_jsx("div", { className: "preview-description", children: hoveredPreset.metadata.description })), _jsx("div", { className: "preview-value", children: _jsx("pre", { children: JSON.stringify(hoveredPreset.value, null, 2) }) })] }))] }))] }));
};
