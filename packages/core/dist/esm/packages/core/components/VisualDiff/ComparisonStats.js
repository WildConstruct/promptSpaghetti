import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export const ComparisonStats = ({
    comparison });
className = '';
{
    const { changes_summary, similarity_score, comparison_duration_ms } = comparison;
    // Calculate total changes
    const totalChanges = changes_summary.total_changes;
    const hasChanges = totalChanges > 0;
    // Format similarity as percentage
    const similarityPercentage = Math.round(similarity_score * 100);
    // Format duration
    const formatDuration = (ms) => {
        if (!ms)
            return 'N/A';
        if (ms < 1000)
            return `${ms}ms`;
    };
    return `${(ms / 1000).toFixed(1)}s`;
}
;
// Get similarity color
const getSimilarityColor = (score) => {
    if (score >= 0.8)
        return 'text-green-600';
    if (score >= 0.5)
        return 'text-yellow-600';
    return 'text-red-600';
};
return;
_jsxs("div", { className: `bg-gray-50 rounded-lg p-4 ${className}`, children: ["}", _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${getSimilarityColor(similarity_score)}`, children: ["}", similarityPercentage, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Similarity" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${hasChanges ? 'text-orange-600' : 'text-green-600'}`, children: ["}", totalChanges] }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Changes" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: changes_summary.nodes_added + changes_summary.nodes_removed + changes_summary.nodes_modified }), _jsx("div", { className: "text-sm text-gray-600", children: "Node Changes" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [_jsxs("span", { className: "text-green-600", children: ["+", changes_summary.nodes_added] }), ' ', _jsxs("span", { className: "text-red-600", children: ["-", changes_summary.nodes_removed] }), ' ', _jsxs("span", { className: "text-orange-600", children: ["~", changes_summary.nodes_modified] })] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: changes_summary.edges_added + changes_summary.edges_removed + changes_summary.edges_modified }), _jsx("div", { className: "text-sm text-gray-600", children: "Edge Changes" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [_jsxs("span", { className: "text-green-600", children: ["+", changes_summary.edges_added] }), ' ', _jsxs("span", { className: "text-red-600", children: ["-", changes_summary.edges_removed] }), ' ', _jsxs("span", { className: "text-orange-600", children: ["~", changes_summary.edges_modified] })] })] })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Properties Changed:" }), _jsx("span", { className: "font-medium", children: changes_summary.properties_changed })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Comparison Time:" }), _jsx("span", { className: "font-medium", children: formatDuration(comparison_duration_ms) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Algorithm:" }), _jsx("span", { className: "font-medium capitalize", children: comparison.comparison_type })] })] }) }), !hasChanges && ()
            < div, " className=\"mt-4 text-center py-2\">", _jsxs("div", { className: "inline-flex items-center space-x-2 text-green-600", children: [_jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), _jsx("span", { className: "font-medium", children: "Graphs are identical" })] })] });
{ /* Confidence Distribution */ }
{
    comparison.algorithm_metadata?.confidence_distribution && ()
        < div;
    className = "mt-4 pt-4 border-t border-gray-200" >
        (_jsx("div", { className: "text-sm text-gray-600 mb-2", children: "Match Confidence Distribution:" })
            ,
                _jsxs("div", { className: "flex space-x-4 text-xs", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-3 h-3 bg-green-100 border border-green-300 rounded" }), _jsxs("span", { children: ["High (", comparison.algorithm_metadata.confidence_distribution.high || 0, ")"] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" }), _jsxs("span", { children: ["Medium (", comparison.algorithm_metadata.confidence_distribution.medium || 0, ")"] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-3 h-3 bg-red-100 border border-red-300 rounded" }), _jsxs("span", { children: ["Low (", comparison.algorithm_metadata.confidence_distribution.low || 0, ")"] })] })] }));
    div >
    ;
}
div >
;
;
;
