import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Knowledge Base Search Component
 *
 * Advanced search interface with filters, suggestions, and AI-powered recommendations.
 * Supports real-time search, autocomplete, and intelligent result ranking.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { KnowledgeCategory, ArticleType, ReadingLevel, SuggestionType } from '../../services/Epic16KnowledgeBaseService';
{
    // State management
    const [searchState, setSearchState] = useState({});
    query: '',
        filters;
    {
        categories: [],
            types;
        [],
            tags;
        [],
            readingLevel;
        [],
            language;
        [],
            lastUpdated;
        { }
        minRating: 0,
            hasVideo;
        false,
            hasCode;
        false;
    }
    results: null,
        suggestions;
    [],
        loading;
    false,
        error;
    null,
        showFilters;
    false,
        showSuggestions;
    false;
}
;
// Refs
const searchInputRef = useRef(null);
const searchTimeoutRef = useRef();
const suggestionsRef = useRef(null);
// Popular searches for suggestions
const popularSearches = useMemo(() => [
    'getting started',
    'marketplace guide',
    'template creation',
    'selling templates',
    'community guidelines',
    'api documentation',
    'troubleshooting',
    'billing help',
    'account security'
], []);
// Debounced search
const performSearch = useCallback(async (query, filters) => {
    if (!query.trim()) {
        setSearchState(prev => ({ ...prev, results: null, loading: false }));
        return;
        setSearchState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const searchResults = await knowledgeService.searchArticles(query, filters, userId);
            setSearchState(prev => ({}), ...prev, results, searchResults, suggestions, searchResults.suggestions, loading, false);
        }
        finally { }
    }
});
onSearchPerformed?.(query, searchResults.totalResults);
try { }
catch (error) {
    setSearchState(prev => ({}), ...prev, error, error instanceof Error ? error.message : 'Search failed', loading, false);
}
;
[knowledgeService, userId, onSearchPerformed];
;
// Handle search input changes
const handleSearchInput = useCallback((value) => {
    setSearchState(prev => ({ ...prev, query: value, showSuggestions: value.length > 0 }));
    // Clear existing timeout
    if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        // Debounce search
        if (value.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                performSearch(value, searchState.filters);
            }, 300);
        }
        else {
            setSearchState(prev => ({ ...prev, results: null, suggestions: [] }));
        }
        [performSearch, searchState.filters];
    }
});
// Handle filter changes
const handleFilterChange = useCallback((newFilters) => {
    const updatedFilters = { ...searchState.filters, ...newFilters };
    setSearchState(prev => ({ ...prev, filters: updatedFilters }));
    if (searchState.query.trim()) {
        performSearch(searchState.query, updatedFilters);
    }
    [searchState.filters, searchState.query, performSearch];
});
// Handle suggestion selection
const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchState(prev => ({}), ...prev, query, suggestion.text, showSuggestions, false);
});
performSearch(suggestion.text, searchState.filters);
searchInputRef.current?.focus();
[performSearch, searchState.filters];
;
// Handle article selection
const handleArticleSelect = useCallback((articleId) => {
    onArticleSelect?.(articleId);
}, [onArticleSelect]);
// Clear filters
const clearFilters = useCallback(() => {
    const clearedFilters = {
        categories: [],
        types: [],
        tags: [],
        readingLevel: [],
        language: [],
        lastUpdated: {},
        minRating: 0,
        hasVideo: false,
        hasCode: false
    };
    handleFilterChange(clearedFilters);
}, [handleFilterChange]);
// Close suggestions when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
            setSearchState(prev => ({ ...prev, showSuggestions: false }));
        }
        ;
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [];
});
// Generate search suggestions
const searchSuggestions = useMemo(() => {
    if (!searchState.query || searchState.query.length < 2) {
        return popularSearches.slice(0, 5).map(search => ({}), text, search, type, SuggestionType.POPULAR_SEARCH, score, 0.8);
    }
});
const filtered = popularSearches.filter(search => );
;
search.toLowerCase().includes(searchState.query.toLowerCase());
;
return [
    ...filtered.map(search => ({}), text, search, type, SuggestionType.QUERY_COMPLETION, score, 0.9), ,
    ...searchState.suggestions
].slice(0, 8);
[searchState.query, searchState.suggestions, popularSearches];
;
// Highlight query in text
const highlightQuery = useCallback((text, query) => {
    if (!query)
        return text;
    const regex = new RegExp(`(${query})`, 'gi');
});
return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
[];
;
// Format category name
const formatCategoryName = useCallback((category) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}, []);
return;
_jsxs("div", { className: `knowledge-base-search ${className}`, children: ["}", _jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8", children: [_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "How can we help you?" }), _jsx("p", { className: "text-blue-100 mb-6", children: "Search our knowledge base for answers to your questions" }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { ref: searchInputRef, type: "text", value: searchState.query, onChange: (e) => handleSearchInput(e.target.value), onFocus: () => setSearchState(prev => ({ ...prev, showSuggestions: true })), placeholder: "Search for articles, guides, tutorials...", className: "w-full pl-12 pr-16 py-4 text-lg text-gray-900 bg-white rounded-lg shadow-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent" }), _jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none", children: _jsx("svg", { className: "h-6 w-6 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }), searchState.loading && ()
                                            < div, " className=\"absolute inset-y-0 right-0 pr-4 flex items-center\">", _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" })] }), ")}"] }), searchState.showSuggestions && searchSuggestions.length > 0 && ()
                            < div, "ref=", suggestionsRef, "className=\"absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto\" >", searchSuggestions.map((suggestion, index) => ()
                            < button, key = { index }, onClick = {}()), " => handleSuggestionSelect(suggestion)} className=\"w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0\" >", _jsxs("div", { className: "flex-shrink-0", children: [suggestion.type === SuggestionType.POPULAR_SEARCH && ()
                                    < svg, " className=\"w-5 h-5 text-orange-500\" fill=\"currentColor\" viewBox=\"0 0 20 20\">", _jsx("path", { fillRule: "evenodd", d: "M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z", clipRule: "evenodd" })] }), ")}", suggestion.type === SuggestionType.QUERY_COMPLETION && ()
                            < svg, " className=\"w-5 h-5 text-blue-500\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">", _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })] }), ")}"] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-gray-900", dangerouslySetInnerHTML: {
                        __html: highlightQuery(suggestion.text, searchState.query),
                    } }), _jsx("div", { className: "text-xs text-gray-500", children: suggestion.type === SuggestionType.POPULAR_SEARCH ? 'Popular search' : 'Search suggestion' })] })] });
div >
;
div >
    { /* Quick Filters */}
    < div;
className = "flex flex-wrap gap-2 mt-4" >
    _jsxs("button", { onClick: () => setSearchState(prev => ({ ...prev, showFilters: !prev.showFilters })), className: "inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500 hover:bg-blue-600 transition-colors", children: [_jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" }) }), "Filters"] });
{
    Object.values(KnowledgeCategory).slice(0, 4).map(category => ()
        < button, key = { category }, onClick = {}(), handleFilterChange({ categories: [category] }));
}
className = "px-3 py-1 rounded-full text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
    >
        {};
button >
;
div >
;
div >
;
div >
    { /* Advanced Filters */};
{
    searchState.showFilters && ()
        < div;
    className = "bg-gray-50 border-b border-gray-200 p-6" >
        _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Categories" }), _jsxs("div", { className: "space-y-2 max-h-40 overflow-y-auto", children: [Object.values(KnowledgeCategory).map(category => ()
                                        < label, key = { category }, className = "flex items-center" >
                                        _jsx("input", { type: "checkbox", checked: searchState.filters.categories.includes(category), onChange: (e) => {
                                                const newCategories = e.target.checked;
                                            } })
                                        ? [...searchState.filters.categories, category]
                                        : searchState.filters.categories.filter(c => c !== category)), "; handleFilterChange(", categories, ": newCategories }); }} className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\" />", _jsx("span", { className: "ml-2 text-sm text-gray-600", children: formatCategoryName(category) })] }), "))}"] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Article Types" }), _jsxs("div", { className: "space-y-2 max-h-40 overflow-y-auto", children: [Object.values(ArticleType).map(type => ()
                                    < label, key = { type }, className = "flex items-center" >
                                    _jsx("input", { type: "checkbox", checked: searchState.filters.types.includes(type), onChange: (e) => {
                                            const newTypes = e.target.checked;
                                        } })
                                    ? [...searchState.filters.types, type]
                                    : searchState.filters.types.filter(t => t !== type)), "; handleFilterChange(", types, ": newTypes }); }} className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\" />", _jsx("span", { className: "ml-2 text-sm text-gray-600", children: formatCategoryName(type) })] }), "))}"] })] });
    { /* Reading Level */ }
    _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Reading Level" }), _jsxs("div", { className: "space-y-2", children: [Object.values(ReadingLevel).map(level => ()
                        < label, key = { level }, className = "flex items-center" >
                        _jsx("input", { type: "checkbox", checked: searchState.filters.readingLevel.includes(level), onChange: (e) => {
                                const newLevels = e.target.checked;
                            } })
                        ? [...searchState.filters.readingLevel, level]
                        : searchState.filters.readingLevel.filter(l => l !== level)), "; handleFilterChange(", readingLevel, ": newLevels }); }} className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\" />", _jsx("span", { className: "ml-2 text-sm text-gray-600 capitalize", children: level })] }), "))}"] });
    div >
        { /* Additional Filters */}
        < div >
        (_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Additional" })
            ,
                _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: searchState.filters.hasVideo, onChange: (e) => handleFilterChange({ hasVideo: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-600", children: "Has Video" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: searchState.filters.hasCode, onChange: (e) => handleFilterChange({ hasCode: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-600", children: "Has Code Examples" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "Min Rating" }), _jsxs("select", { value: searchState.filters.minRating, onChange: (e) => handleFilterChange({ minRating: Number(e.target.value) }), className: "w-full px-3 py-1 border border-gray-300 rounded-md text-sm", children: [_jsx("option", { value: 0, children: "Any Rating" }), _jsx("option", { value: 1, children: "1+ Stars" }), _jsx("option", { value: 2, children: "2+ Stars" }), _jsx("option", { value: 3, children: "3+ Stars" }), _jsx("option", { value: 4, children: "4+ Stars" }), _jsx("option", { value: 5, children: "5 Stars" })] })] })] }));
    div >
    ;
    div >
        _jsx("div", { className: "mt-4 flex justify-end", children: _jsx("button", { onClick: clearFilters, className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800", children: "Clear All Filters" }) });
    div >
    ;
    div >
    ;
}
{ /* Search Results */ }
_jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [searchState.error && ()
            < div, " className=\"bg-red-50 border border-red-200 rounded-md p-4 mb-6\">", _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: searchState.error }) })] })] });
{
    searchState.results && ();
    { /* Results Header */ }
    _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900", children: [searchState.results.totalResults, " results found"] }), searchState.results.didYouMean && ()
                        < p, " className=\"text-sm text-gray-600\"> Did you mean:", ' ', _jsx("button", { onClick: () => handleSearchInput(searchState.results.didYouMean), className: "text-blue-600 hover:text-blue-800 underline", children: searchState.results.didYouMean }), "?"] }), ")}"] })
        ,
            _jsxs("div", { className: "text-sm text-gray-500", children: ["Search took ", searchState.results.searchTime, "ms"] });
    div >
        { /* Results List */}
        < div;
    className = "space-y-6" >
        { searchState, : .results.results.map((result) => ()
                < div, key = { result, : .article.id }, className = "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer", onClick = {}(), handleArticleSelect(result.article.id)) }
        >
            _jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-600 hover:text-blue-800 mb-1", children: result.article.title }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500 mb-2", children: [_jsx("span", { className: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs", children: formatCategoryName(result.article.category) }), _jsx("span", { className: "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs", children: formatCategoryName(result.article.type) }), _jsxs("span", { children: [result.article.estimatedReadTime, " min read"] }), _jsxs("span", { children: [result.article.views, " views"] })] })] }), _jsxs("div", { className: "text-right text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center", children: [[...Array(5)].map((_, i) => ()
                                        < svg, key = { i }, className = {} `w-4 h-4 ${i < Math.round(result.article.ratings.reduce((sum, r) => sum + r.rating, 0) / result.article.ratings.length || 0)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300',
                                    }`), "fill=\"currentColor\" viewBox=\"0 0 20 20\" >", _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" })] }), "))}", _jsxs("span", { className: "ml-1 text-xs", children: ["(", result.article.ratings.length, ")"] })] })] });
    div >
        _jsx("div", { className: "text-gray-600 mb-3", dangerouslySetInnerHTML: {
                __html: result.highlightedContent,
            } });
    {
        result.relevanceReason.length > 0 && ()
            < div;
        className = "text-xs text-gray-500" >
            Relevant;
        because: {
            result.relevanceReason.join(', ');
        }
        div >
        ;
    }
    {
        result.matchedSections.length > 0 && ()
            < div;
        className = "mt-3 pt-3 border-t border-gray-100" >
            (_jsx("div", { className: "text-sm text-gray-700 font-medium mb-2", children: "Matching sections:" })
                ,
                    _jsx("div", { className: "space-y-1", children: result.matchedSections.slice(0, 2).map((section) => ()
                            < div, key = { section, : .sectionId }, className = "text-sm" >
                            (_jsx("span", { className: "font-medium text-gray-800", children: section.title })
                                ,
                                    _jsx("div", { className: "text-gray-600 text-xs mt-1", dangerouslySetInnerHTML: {
                                            __html: section.highlightedText,
                                        } }))) }));
    }
    div >
    ;
    div >
    ;
}
{
    result.article.tags.length > 0 && ()
        < div;
    className = "mt-3 flex flex-wrap gap-1" >
        { result, : .article.tags.slice(0, 5).map((tag) => ()
                < span, key = { tag }, className = "px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                    #, { tag }, span >
            ) };
    div >
    ;
}
div >
;
div >
    { searchState, : .results.results.length === 0 && ()
            < div, className = "text-center py-12" >
            (_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) })
                ,
                    _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No articles found" })
                        ,
                            _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Try adjusting your search terms or filters to find what you're looking for." })),
        div } >
;
 >
;
{
    !searchState.results && !searchState.loading && searchState.query && ()
        < div;
    className = "text-center py-12" >
        _jsx("p", { className: "text-gray-500", children: "Start typing to search our knowledge base..." });
    div >
    ;
}
div >
;
div >
;
;
;
export default KnowledgeBaseSearch;
