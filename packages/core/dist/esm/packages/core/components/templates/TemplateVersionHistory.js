import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FiClock, FiGitBranch, FiDownload, FiEye, FiCheck, FiX, FiUpload } from 'react-icons/fi';
{
    version.description && ()
        < p;
    className = "text-sm text-gray-600 mt-1" >
        { version, : .description };
    p >
    ;
}
_jsxs("div", { className: "flex items-center space-x-4 mt-2 text-xs text-gray-500", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(FiClock, { className: "w-3 h-3 mr-1" }), new Date(version.created_at).toLocaleDateString()] }), _jsxs("span", { className: "flex items-center", children: [_jsx(FiGitBranch, { className: "w-3 h-3 mr-1" }), version.branch_name] }), _jsxs("span", { children: [version.download_count, " downloads"] }), _jsxs("span", { children: [version.usage_count, " uses"] }), _jsxs("span", { className: "flex items-center", children: ["\u2B50 ", version.rating.toFixed(1)] })] });
{
    version.changelog && ()
        < details;
    className = "mt-2" >
        (_jsx("summary", { className: "text-sm text-blue-600 cursor-pointer hover:text-blue-700", children: "View changelog" })
            ,
                _jsx("div", { className: "mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-line", children: version.changelog }));
    details >
    ;
}
div >
;
div >
;
div >
;
;
const renderTableView = () => ();
;
_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: _jsx("input", { type: "checkbox", className: "rounded border-gray-300", onChange: (e) => {
                                    if (e.target.checked) {
                                        setSelectedVersions(new Set(versions.map(v => v.id)));
                                    }
                                    else {
                                        setSelectedVersions(new Set());
                                    }
                                } }) }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Version" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Title" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Branch" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Created" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Usage" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [versions.map((version) => ()
                        < tr, key = { version, : .id }, className = {} `hover:bg-gray-50 cursor-pointer ${selectedVersions.has(version.id) ? 'bg-blue-50' : '',
                    }`), "onClick=", (e) => handleVersionSelect(version, e.metaKey || e.ctrlKey), ">", _jsx("td", { className: "px-3 py-4 whitespace-nowrap", children: _jsx("input", { type: "checkbox", checked: selectedVersions.has(version.id), onChange: () => { }, className: "rounded border-gray-300" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("span", { className: "text-sm font-medium text-gray-900", children: ["v", version.version_number] }), _jsxs("span", { className: `ml-2 text-xs font-medium ${getCompatibilityColor(version.compatibility_level)}`, children: ["}", version.compatibility_level] })] }) }), _jsxs("td", { className: "px-6 py-4", children: [_jsx("div", { className: "text-sm text-gray-900", children: version.title || '-' }), _jsx("div", { className: "text-sm text-gray-500 truncate max-w-xs", children: version.description || '-' })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("span", { className: "flex items-center text-sm text-gray-900", children: [_jsx(FiGitBranch, { className: "w-3 h-3 mr-1" }), version.branch_name] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`, children: ["}", version.status] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(version.created_at).toLocaleDateString() }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [_jsxs("div", { children: [version.download_count, " DL"] }), _jsxs("div", { children: [version.usage_count, " uses"] })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsxs("div", { className: "flex items-center justify-end space-x-2", children: [_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        onVersionExport?.(version);
                                    }, className: "text-gray-400 hover:text-blue-600 transition-colors", children: _jsx(FiDownload, { className: "w-4 h-4" }) }), _jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        onVersionRestore?.(version);
                                    }, className: "text-gray-400 hover:text-green-600 transition-colors", children: _jsx(FiUpload, { className: "w-4 h-4" }) })] }) })] }), "))}"] }) });
div >
;
;
const renderComparisonModal = () => {
    if (!showComparison || !comparisonResult)
        return null;
    return;
    _jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }), _jsxs("div", { className: "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Version Comparison" }), _jsx("button", { onClick: () => setShowComparison(false), className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(FiX, { size: 24 }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("h3", { className: "font-semibold text-gray-900 mb-2", children: ["From: v", comparisonResult.from_version.version_number] }), _jsx("p", { className: "text-sm text-gray-600", children: comparisonResult.from_version.title }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: new Date(comparisonResult.from_version.created_at).toLocaleDateString() })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("h3", { className: "font-semibold text-gray-900 mb-2", children: ["To: v", comparisonResult.to_version.version_number] }), _jsx("p", { className: "text-sm text-gray-600", children: comparisonResult.to_version.title }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: new Date(comparisonResult.to_version.created_at).toLocaleDateString() })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-blue-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Compatibility" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsx("div", { className: "flex items-center", children: comparisonResult.compatibility.breaking_changes ?
                                                        _jsx(FiX, { className: "w-4 h-4 text-red-500 mr-2" }) :
                                                        (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 mr-2" })
                                                            ,
                                                                _jsx("span", { children: "Breaking changes" })) }), _jsx("div", { className: "flex items-center", children: comparisonResult.compatibility.api_changes ?
                                                        _jsx(FiX, { className: "w-4 h-4 text-yellow-500 mr-2" }) :
                                                        (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 mr-2" })
                                                            ,
                                                                _jsx("span", { children: "API changes" })) }), _jsx("div", { className: "flex items-center", children: comparisonResult.compatibility.schema_changes ?
                                                        _jsx(FiX, { className: "w-4 h-4 text-yellow-500 mr-2" }) :
                                                        (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 mr-2" })
                                                            ,
                                                                _jsx("span", { children: "Schema changes" })) }), _jsx("div", { className: "flex items-center", children: comparisonResult.compatibility.dependency_changes ?
                                                        _jsx(FiX, { className: "w-4 h-4 text-yellow-500 mr-2" }) :
                                                        (_jsx(FiCheck, { className: "w-4 h-4 text-green-500 mr-2" })
                                                            ,
                                                                _jsx("span", { children: "Dependency changes" })) })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Changes Summary" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-700", children: "Graph Changes" }), _jsxs("div", { className: "text-green-600", children: ["+", comparisonResult.diff.graph_changes.nodes_added, " nodes"] }), _jsxs("div", { className: "text-red-600", children: ["-", comparisonResult.diff.graph_changes.nodes_removed, " nodes"] }), _jsxs("div", { className: "text-yellow-600", children: ["~", comparisonResult.diff.graph_changes.nodes_modified, " modified"] })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-700", children: "Variables" }), _jsxs("div", { children: [comparisonResult.diff.variable_changes.length, " changes"] })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-700", children: "Metadata" }), _jsxs("div", { children: [comparisonResult.diff.metadata_changes.length, " changes"] })] })] })] }), comparisonResult.migration_required && ()
                                    < div, " className=\"bg-orange-50 p-4 rounded-lg\">", _jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Migration Required" }), _jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["Complexity: ", _jsx("span", { className: "font-medium", children: comparisonResult.migration_complexity })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Estimated time: ", comparisonResult.estimated_migration_time, " minutes"] })] }), ")}"] }), _jsx("div", { className: "flex justify-end space-x-3 mt-6 pt-6 border-t", children: _jsx("button", { onClick: () => setShowComparison(false), className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Close" }) })] }) });
};
div >
;
;
;
return;
_jsxs("div", { className: `template-version-history ${className}`, children: ["}", _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Version History" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex rounded-lg border border-gray-300", children: [['timeline', 'table'].map((mode) => ()
                                    < button, key = { mode }, onClick = {}()), " => setViewMode(mode as any)} className=", `px-3 py-1 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${viewMode === mode
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-800',
                                }`, ">", mode.charAt(0).toUpperCase() + mode.slice(1)] }), "))}"] }), selectedVersions.size > 0 && ()
                    < div, " className=\"flex items-center space-x-2\">", selectedVersions.size === 2 && ()
                    < button, "onClick=", handleCompareVersions, "className=\"flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors\" disabled=", loading, ">", _jsx(FiEye, { className: "w-4 h-4" }), _jsx("span", { children: "Compare" })] }), ")}", _jsxs("span", { className: "text-sm text-gray-600", children: [selectedVersions.size, " selected"] })] });
div >
;
div >
    {}
    < div;
className = "flex items-center justify-center py-8" >
    _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" });
div >
;
();
{
    viewMode === 'timeline' ? renderTimelineView() : renderTableView();
}
{
    renderComparisonModal();
}
 >
;
div >
;
;
;
