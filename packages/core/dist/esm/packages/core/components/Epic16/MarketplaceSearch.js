import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Marketplace Search Component
 *
 * Advanced search interface with autocomplete, filters, and category browsing
 * for the marketplace template discovery experience.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
export const MarketplaceSearch = ({
    onSearch,
    onFiltersChange,
    availableTags = [],
    availableCreators = [],
    availableModels = ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
    searchSuggestions = [],
    isLoading = false,
    resultCount,
    className = ''
});
{
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState(defaultFilters);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    // Filter suggestions based on query
    useEffect(() => {
        if (query.length > 0) {
            const filtered = searchSuggestions.filter(suggestion => );
        }
    });
    suggestion.text.toLowerCase().includes(query.toLowerCase());
    ;
    setFilteredSuggestions(filtered.slice(0, 8));
    setShowSuggestions(true);
}
{
    setFilteredSuggestions([]);
    setShowSuggestions(false);
}
[query, searchSuggestions];
;
// Handle clicks outside to close suggestions
useEffect(() => {
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowSuggestions(false);
        }
        ;
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [];
});
const handleSearch = () => {
    onSearch(query, filters);
    setShowSuggestions(false);
};
const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
    ;
    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'tag') {
            updateFilters({ tags: [...filters.tags, suggestion.text] });
            setQuery('');
        }
        else if (suggestion.type === 'creator') {
            const creator = availableCreators.find(c => c.name === suggestion.text);
            if (creator) {
                updateFilters({ creatorId: creator.id });
                setQuery('');
            }
            else {
                setQuery(suggestion.text);
                handleSearch();
                setShowSuggestions(false);
            }
            ;
            const updateFilters = (newFilters) => {
                const updatedFilters = { ...filters, ...newFilters };
                setFilters(updatedFilters);
                onFiltersChange?.(updatedFilters);
                onSearch(query, updatedFilters);
            };
            const clearFilters = () => {
                setFilters(defaultFilters);
                onFiltersChange?.(defaultFilters);
                onSearch(query, defaultFilters);
            };
            const removeTag = (tagToRemove) => {
                updateFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) });
            };
            const _____formatPrice = (cents) => {
                return `$${(cents / 100).toFixed(0)}`;
            };
        }
        ;
        const activeFilterCount = useMemo(() => {
            let count = 0;
            if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000)
                count++;
            if (filters.tags.length > 0)
                count++;
            if (filters.rating > 0)
                count++;
            if (filters.compatibility.length > 0)
                count++;
            if (filters.isAiGenerated !== undefined)
                count++;
            if (filters.creatorId)
                count++;
            if (filters.sortBy !== 'relevance')
                count++;
            return count;
        }, [filters]);
        return;
        _jsxs("div", { className: `bg-white border-b border-gray-200 ${className}`, children: ["}", _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4", children: [_jsx("div", { className: "relative", ref: searchRef, children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx("svg", { className: "h-5 w-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }), _jsx("input", { ref: inputRef, type: "text", value: query, onChange: (e) => setQuery(e.target.value), onKeyPress: handleKeyPress, onFocus: () => setShowSuggestions(filteredSuggestions.length > 0), placeholder: "Search templates, tags, creators...", className: "block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" }), _jsxs("div", { className: "absolute inset-y-0 right-0 flex items-center", children: [_jsxs("button", { onClick: handleSearch, disabled: isLoading, className: "h-full px-4 text-gray-400 hover:text-gray-600 focus:outline-none", children: [isLoading ? ()
                                                        < svg : , " className=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">", _jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), ") : ()", _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), ")}"] })] }) }), showSuggestions && filteredSuggestions.length > 0 && ()
                            < div, " className=\"absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg\">", filteredSuggestions.map((suggestion, index) => ()
                            < button, key = { index }, onClick = {}()), " => handleSuggestionClick(suggestion)} className=\"w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3\" >", _jsxs("div", { className: "flex-shrink-0", children: [suggestion.type === 'query' && ()
                                    < svg, " className=\"h-4 w-4 text-gray-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">", _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })] }), ")}", suggestion.type === 'tag' && ()
                            < svg, " className=\"h-4 w-4 text-blue-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">", _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" })] }), ")}", suggestion.type === 'creator' && ()
                    < svg, " className=\"h-4 w-4 text-green-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">", _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" })] });
    };
};
{
    suggestion.type === 'template' && ()
        < svg;
    className = "h-4 w-4 text-purple-400";
    fill = "none";
    viewBox = "0 0 24 24";
    stroke = "currentColor" >
        _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" });
    svg >
    ;
}
div >
    _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm text-gray-900 truncate", children: suggestion.text }), suggestion.count && ()
                < p, " className=\"text-xs text-gray-500\">", suggestion.count, " results"] });
div >
;
button >
;
div >
;
div >
    { /* Filter Bar */}
    < div;
className = "mt-4 flex items-center justify-between" >
    _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: `flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium ${showFilters || activeFilterCount > 0
                    ? 'border-blue-300 text-blue-700 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50',
                }`, children: [_jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.414.914l-4-2A1 1 0 018 18.586v-4.586a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4z" }) }), _jsx("span", { children: "Filters" }), activeFilterCount > 0 && ()
                        < span, " className=\"bg-blue-600 text-white text-xs rounded-full px-2 py-0.5\">", activeFilterCount] }), ")}"] });
{
    activeFilterCount > 0 && ()
        < button;
    onClick = { clearFilters };
    className = "text-sm text-gray-500 hover:text-gray-700"
        >
            Clear;
    all;
    button >
    ;
}
{ /* Active filters */ }
_jsxs("div", { className: "flex items-center space-x-2", children: [filters.tags.map((tag) => ()
            < span, key = { tag }, className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
                { tag }
            < button, onClick = {}()), " => removeTag(tag)} className=\"ml-1 text-blue-600 hover:text-blue-800\" >", _jsx("svg", { className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })] });
span >
;
div >
;
div >
    { /* Sort and Results */}
    < div;
className = "flex items-center space-x-4" >
    { resultCount } !== undefined && ()
    < span;
className = "text-sm text-gray-500" >
    { resultCount, : .toLocaleString() };
results;
span >
;
_jsxs("select", { value: filters.sortBy, onChange: (e) => updateFilters({ sortBy: e.target.value }), className: "text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "relevance", children: "Most Relevant" }), _jsx("option", { value: "price_low", children: "Price: Low to High" }), _jsx("option", { value: "price_high", children: "Price: High to Low" }), _jsx("option", { value: "rating", children: "Highest Rated" }), _jsx("option", { value: "downloads", children: "Most Downloaded" }), _jsx("option", { value: "newest", children: "Newest" }), _jsx("option", { value: "oldest", children: "Oldest" })] });
div >
;
div >
    { /* Advanced Filters */};
{
    showFilters && ()
        < div;
    className = "mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50" >
        _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Price Range" }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "number", value: filters.priceRange[0] / 100, onChange: (e) => updateFilters({}), "priceRange:": true }), " [parseInt(e.target.value) * 100 || 0, filters.priceRange[1]] })} placeholder=\"Min\" className=\"w-full px-3 py-2 border border-gray-300 rounded-md text-sm\" />", _jsx("span", { className: "text-gray-500", children: "to" }), _jsx("input", { type: "number", value: filters.priceRange[1] / 100, onChange: (e) => updateFilters({}), "priceRange:": true }), " [filters.priceRange[0], parseInt(e.target.value) * 100 || 10000] })} placeholder=\"Max\" className=\"w-full px-3 py-2 border border-gray-300 rounded-md text-sm\" />"] }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Minimum Rating" }), _jsxs("select", { value: filters.rating, onChange: (e) => updateFilters({ rating: parseFloat(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm", children: [_jsx("option", { value: 0, children: "Any Rating" }), _jsx("option", { value: 4, children: "4+ Stars" }), _jsx("option", { value: 3, children: "3+ Stars" }), _jsx("option", { value: 2, children: "2+ Stars" }), _jsx("option", { value: 1, children: "1+ Stars" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Claude Models" }), _jsxs("div", { className: "space-y-1 max-h-32 overflow-y-auto", children: [availableModels.map((model) => ()
                                    < label, key = { model }, className = "flex items-center" >
                                    _jsx("input", { type: "checkbox", checked: filters.compatibility.includes(model), onChange: (e) => {
                                            if (e.target.checked) {
                                                updateFilters({ compatibility: [...filters.compatibility, model] });
                                            }
                                            else {
                                                updateFilters({});
                                                compatibility: filters.compatibility.filter(m => m !== model),
                                                ;
                                            }
                                        } })), "; }} className=\"mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\" />", _jsx("span", { className: "text-sm text-gray-700", children: model })] }), "))}"] })] });
    { /* AI Generated */ }
    _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Content Type" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "aiGenerated", checked: filters.isAiGenerated === undefined, onChange: () => updateFilters({ isAiGenerated: undefined }), className: "mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "All Templates" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "aiGenerated", checked: filters.isAiGenerated === true, onChange: () => updateFilters({ isAiGenerated: true }), className: "mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "AI Generated" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "aiGenerated", checked: filters.isAiGenerated === false, onChange: () => updateFilters({ isAiGenerated: false }), className: "mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Human Created" })] })] })] });
    div >
    ;
    div >
    ;
}
div >
;
div >
;
;
;
export default MarketplaceSearch;
