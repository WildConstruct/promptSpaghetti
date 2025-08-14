import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Asset Library V2 Component for Epic 1
 * Enhanced multi-column browser for hundreds of presets
 */
import { useState, useCallback, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { medievalPresetCategories } from './medievalPresets';
import './AssetLibraryV2.css';
// Preset list item component
const PresetListItem = ({ preset, onSelect, isSelected }) => {
    // Safely initialize drag hook with error handling
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'preset',
        item: { preset },
        collect: (monitor) => ({
            isDragging: monitor?.isDragging() || false,
        }),
    }), [preset]);
    return (_jsxs("div", { ref: drag, className: `preset-list-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`, onClick: onSelect, children: [_jsxs("div", { className: "preset-rating", children: ['★'.repeat(preset.metadata.rating || 4), _jsx("span", { className: "preset-rating-empty", children: '★'.repeat(5 - (preset.metadata.rating || 4)) })] }), _jsx("div", { className: "preset-name", children: preset.name })] }));
};
// Navigation column component
const NavigationColumn = ({ title, items, selectedId, onSelect, highlightColor = '#2196F3' }) => {
    return (_jsxs("div", { className: "nav-column", children: [_jsx("div", { className: "nav-column-header", children: title }), _jsx("div", { className: "nav-column-items", children: items.map(item => (_jsxs("div", { className: `nav-item ${selectedId === item.id ? 'selected' : ''}`, onClick: () => onSelect(item.id), style: selectedId === item.id ? { backgroundColor: highlightColor } : {}, children: [_jsx("span", { className: "nav-item-name", children: item.name }), item.count !== undefined && (_jsx("span", { className: "nav-item-count", children: item.count }))] }, item.id))) })] }));
};
/**
 * Enhanced Asset Library with multi-column navigation
 */
export const AssetLibraryV2 = ({ onPresetDrag, onPresetSelect, position = 'bottom', defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [searchQuery, setSearchQuery] = useState('');
    const [navigation, setNavigation] = useState({
        category: 'All',
        subcategory: null,
        genre: null,
        timbre: null
    });
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [userTags, setUserTags] = useState([]);
    // Mock enhanced category structure for demonstration
    const categories = useMemo(() => [
        { id: 'All', name: 'All', count: 47 },
        { id: 'character-occupations', name: 'Characters', count: 12 },
        { id: 'environments', name: 'Environments', count: 8 },
        { id: 'clothing', name: 'Clothing', count: 10 },
        { id: 'actions', name: 'Actions', count: 7 },
        { id: 'traits', name: 'Traits', count: 5 },
        { id: 'items', name: 'Items', count: 5 }
    ], []);
    // Mock subcategories based on selected category
    const subcategories = useMemo(() => {
        if (navigation.category === 'Characters') {
            return [
                { id: 'All', name: 'All' },
                { id: 'medieval', name: 'Medieval' },
                { id: 'fantasy', name: 'Fantasy' },
                { id: 'modern', name: 'Modern' },
                { id: 'scifi', name: 'Sci-Fi' }
            ];
        }
        return [{ id: 'All', name: 'All' }];
    }, [navigation.category]);
    // Mock genres
    const genres = useMemo(() => [
        { id: 'All', name: 'All' },
        { id: 'hero', name: 'Hero' },
        { id: 'villain', name: 'Villain' },
        { id: 'neutral', name: 'Neutral' },
        { id: 'comic', name: 'Comic' }
    ], []);
    // Mock timbres
    const timbres = useMemo(() => [
        { id: 'All', name: 'All' },
        { id: 'simple', name: 'Simple' },
        { id: 'complex', name: 'Complex' },
        { id: 'detailed', name: 'Detailed' },
        { id: 'minimal', name: 'Minimal' }
    ], []);
    // Filter presets based on navigation and search
    const filteredPresets = useMemo(() => {
        let presets = [];
        // Collect all presets from categories
        medievalPresetCategories.forEach(cat => {
            if (navigation.category === 'All' || cat.id === navigation.category) {
                presets = presets.concat(cat.presets);
            }
        });
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            presets = presets.filter(preset => preset.name.toLowerCase().includes(query) ||
                preset.tags.some(tag => tag.toLowerCase().includes(query)) ||
                preset.metadata.description?.toLowerCase().includes(query));
        }
        return presets;
    }, [navigation, searchQuery]);
    const handleCategorySelect = useCallback((categoryId) => {
        setNavigation({
            category: categoryId,
            subcategory: 'All',
            genre: 'All',
            timbre: 'All'
        });
    }, []);
    const handlePresetSelect = useCallback((preset) => {
        setSelectedPreset(preset);
        onPresetSelect?.(preset);
    }, [onPresetSelect]);
    const toggleLibrary = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);
    return (_jsxs("div", { className: `asset-library-v2 ${position} ${isExpanded ? 'expanded' : 'collapsed'}`, children: [_jsxs("div", { className: "library-header-v2", onClick: toggleLibrary, children: [_jsx("span", { className: "library-icon", children: "\uD83D\uDCDA" }), _jsx("span", { className: "library-title", children: "Asset Browser" }), _jsxs("span", { className: "preset-count", children: [filteredPresets.length, " Presets"] }), _jsx("button", { className: "library-toggle-btn", children: isExpanded ? '▼' : '▲' })] }), isExpanded && (_jsxs("div", { className: "library-body-v2", children: [_jsxs("div", { className: "navigation-section", children: [_jsx(NavigationColumn, { title: "Category", items: categories, selectedId: navigation.category, onSelect: handleCategorySelect }), _jsx(NavigationColumn, { title: "Subcategory", items: subcategories, selectedId: navigation.subcategory, onSelect: (id) => setNavigation({ ...navigation, subcategory: id }) })] }), _jsxs("div", { className: "results-section", children: [_jsxs("div", { className: "search-section", children: [_jsx("input", { type: "text", placeholder: "Search presets...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input-v2" }), _jsx("button", { className: "search-btn", children: "\uD83D\uDD0D" })] }), _jsxs("div", { className: "preset-list", children: [_jsxs("div", { className: "preset-list-header", children: [_jsx("span", { children: "Rating" }), _jsx("span", { children: "Preset" })] }), _jsx("div", { className: "preset-list-content", children: filteredPresets.map((preset, index) => (_jsx(PresetListItem, { preset: preset, onSelect: () => handlePresetSelect(preset), isSelected: selectedPreset?.id === preset.id }, `${preset.id}-${index}`))) })] }), _jsxs("div", { className: "tags-section", children: [_jsxs("div", { className: "tags-header", children: [_jsx("span", { children: "User Tags" }), _jsx("button", { className: "edit-tags-btn", children: "Edit" })] }), _jsx("div", { className: "tags-content", children: userTags.length === 0 ? (_jsx("div", { className: "no-tags", children: "No tags added" })) : (userTags.map(tag => (_jsx("span", { className: "user-tag", children: tag }, tag)))) })] })] }), selectedPreset && (_jsxs("div", { className: "preview-section", children: [_jsx("h3", { children: selectedPreset.name }), _jsx("div", { className: "preview-type", children: selectedPreset.nodeType }), _jsx("div", { className: "preview-description", children: selectedPreset.metadata.description || 'No description available' }), _jsx("div", { className: "preview-tags", children: selectedPreset.tags.map(tag => (_jsx("span", { className: "preset-tag", children: tag }, tag))) }), _jsx("div", { className: "preview-actions", children: _jsx("button", { className: "use-preset-btn", onClick: () => onPresetDrag?.(selectedPreset), children: "Use Preset" }) })] }))] }))] }));
};
export default AssetLibraryV2;
