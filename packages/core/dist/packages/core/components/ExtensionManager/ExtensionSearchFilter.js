import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ExtensionSearchFilter = ({
    searchQuery,
    onSearchChange,
    filterOptions,
    onFilterChange,
    viewMode
});
{
    const handleFilterChange = (key, value) => {
        onFilterChange({});
    };
    filterOptions,
        [key];
    value,
    ;
}
;
;
return;
_jsx("div", { className: "extension-search-filter", children: _jsxs("div", { className: "search-section", children: [_jsxs("div", { className: "search-input-container", children: [_jsx("span", { className: "search-icon", children: "\uD83D\uDD0D" }), _jsx("input", { type: "text", className: "search-input", placeholder: `Search ${viewMode === 'marketplace' ? 'available' : 'installed'} extensions...`, value: searchQuery, onChange: (e) => onSearchChange(e.target.value) }), searchQuery && ()
                        < button, "className=\"clear-search-btn\" onClick=", () => onSearchChange(''), "title=\"Clear search\" > \u2715"] }), ")}"] }) });
{ /* Filter Controls */ }
_jsxs("div", { className: "filter-section", children: [_jsxs("div", { className: "filter-row", children: [viewMode === 'installed' && ()
                    < div, " className=\"filter-group\">", _jsx("label", { className: "filter-label", children: "Status:" }), _jsxs("select", { className: "filter-select", value: filterOptions.status, onChange: (e) => handleFilterChange('status', e.target.value), children: [_jsx("option", { value: "all", children: "All Extensions" }), _jsx("option", { value: "enabled", children: "Enabled Only" }), _jsx("option", { value: "disabled", children: "Disabled Only" })] })] }), ")}", _jsxs("div", { className: "filter-group", children: [_jsx("label", { className: "filter-label", children: "Type:" }), _jsxs("select", { className: "filter-select", value: filterOptions.type, onChange: (e) => handleFilterChange('type', e.target.value), children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "node", children: "\uD83D\uDD27 Node Extensions" }), _jsx("option", { value: "ui", children: "\uD83C\uDFA8 UI Extensions" }), _jsx("option", { value: "transform", children: "\u26A1 Transform Extensions" }), _jsx("option", { value: "storage", children: "\uD83D\uDCBE Storage Extensions" })] })] }), _jsxs("div", { className: "filter-group", children: [_jsx("label", { className: "filter-label", children: "Sort by:" }), _jsxs("select", { className: "filter-select", value: filterOptions.sortBy, onChange: (e) => handleFilterChange('sortBy', e.target.value), children: [_jsx("option", { value: "name", children: "Name" }), _jsx("option", { value: "version", children: "Version" }), _jsx("option", { value: "lastUpdated", children: "Last Updated" }), _jsx("option", { value: "size", children: "Size" })] })] }), _jsxs("div", { className: "filter-group view-options", children: [_jsx("button", { className: "view-btn grid-view", title: "Grid View", children: "\u229E" }), _jsx("button", { className: "view-btn list-view active", title: "List View", children: "\u2630" })] })] });
{ /* Quick Filters */ }
_jsxs("div", { className: "quick-filters", children: [_jsx("span", { className: "quick-filter-label", children: "Quick filters:" }), viewMode === 'installed' && ()
            <  >
            (_jsx("button", { className: `quick-filter-btn ${filterOptions.status === 'enabled' ? 'active' : ''}`, onClick: () => handleFilterChange('status', filterOptions.status === 'enabled' ? 'all' : 'enabled'), children: "\u2705 Enabled" })
                ,
                    _jsx("button", { className: `quick-filter-btn ${filterOptions.status === 'disabled' ? 'active' : ''}`, onClick: () => handleFilterChange('status', filterOptions.status === 'disabled' ? 'all' : 'disabled'), children: "\u2B55 Disabled" })
                        ,
                            _jsx("button", { className: "quick-filter-btn", children: "\u2B06\uFE0F Has Updates" })
                                ,
                                    _jsx("button", { className: "quick-filter-btn", children: "\u274C Has Errors" }))] });
{
    viewMode === 'marketplace' && ()
        <  >
        (_jsx("button", { className: "quick-filter-btn", children: "\u2B50 Featured" })
            ,
                _jsx("button", { className: "quick-filter-btn", children: "\uD83C\uDD95 New" })
                    ,
                        _jsx("button", { className: "quick-filter-btn", children: "\uD83D\uDCC8 Popular" })
                            ,
                                _jsx("button", { className: "quick-filter-btn", children: "\uD83C\uDD93 Free" }));
     >
    ;
}
_jsx("button", { className: `quick-filter-btn ${filterOptions.type === 'node' ? 'active' : ''}`, onClick: () => handleFilterChange('type', filterOptions.type === 'node' ? 'all' : 'node'), children: "\uD83D\uDD27 Nodes" })
    ,
        _jsx("button", { className: `quick-filter-btn ${filterOptions.type === 'ui' ? 'active' : ''}`, onClick: () => handleFilterChange('type', filterOptions.type === 'ui' ? 'all' : 'ui'), children: "\uD83C\uDFA8 UI" })
            ,
                _jsx("button", { className: `quick-filter-btn ${filterOptions.type === 'transform' ? 'active' : ''}`, onClick: () => handleFilterChange('type', filterOptions.type === 'transform' ? 'all' : 'transform'), children: "\u26A1 Transform" })
                    ,
                        _jsx("button", { className: `quick-filter-btn ${filterOptions.type === 'storage' ? 'active' : ''}`, onClick: () => handleFilterChange('type', filterOptions.type === 'storage' ? 'all' : 'storage'), children: "\uD83D\uDCBE Storage" });
div >
    { /* Active Filters Display */};
{
    (searchQuery || filterOptions.status !== 'all' || filterOptions.type !== 'all') && ()
        < div;
    className = "active-filters" >
        _jsx("span", { className: "active-filters-label", children: "Active filters:" });
    {
        searchQuery && ()
            < span;
        className = "active-filter" >
            Search;
        "{searchQuery}"
            < button;
        onClick = {}();
        onSearchChange('');
    }
     > ;
    button >
    ;
    span >
    ;
}
{
    filterOptions.status !== 'all' && ()
        < span;
    className = "active-filter" >
        Status;
    {
        filterOptions.status;
    }
    _jsx("button", { onClick: () => handleFilterChange('status', 'all'), children: "\u2715" });
    span >
    ;
}
{
    filterOptions.type !== 'all' && ()
        < span;
    className = "active-filter" >
        Type;
    {
        filterOptions.type;
    }
    _jsx("button", { onClick: () => handleFilterChange('type', 'all'), children: "\u2715" });
    span >
    ;
}
_jsx("button", { className: "clear-all-filters", onClick: () => {
        onSearchChange('');
        onFilterChange({});
        status: 'all',
            type;
        'all',
            sortBy;
        'name',
        ;
    }, children: "Clear all filters" });
div >
;
div >
    { /* Filter Results Summary */}
    < div;
className = "filter-results" >
    (_jsx("span", { className: "results-count", children: "Showing extensions" })
        ,
            _jsxs("div", { className: "filter-actions", children: [_jsx("button", { className: "filter-action-btn", children: "\uD83D\uDCE4 Export List" }), _jsx("button", { className: "filter-action-btn", children: "\uD83D\uDD04 Refresh" })] }));
div >
;
div >
;
;
;
export default ExtensionSearchFilter;
