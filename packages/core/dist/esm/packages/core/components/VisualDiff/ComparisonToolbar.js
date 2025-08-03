import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
onZoomChange: (zoom) => void ;
className ?  : string;
export const ComparisonToolbar = ({
    viewMode,
    highlightMode,
    showUnchanged,
    showMetadata,
    zoomLevel,
    onViewModeChange,
    onHighlightModeChange,
    onShowUnchangedChange,
    onShowMetadataChange,
    onZoomChange });
className = '';
{
    return;
    _jsxs("div", { className: `bg-gray-50 px-4 py-3 ${className}`, children: ["}", _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "View:" }), _jsxs("select", { value: viewMode, onChange: (e) => onViewModeChange(e.target.value), className: "rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500", children: [_jsx("option", { value: "side-by-side", children: "Side by Side" }), _jsx("option", { value: "overlay", children: "Overlay" }), _jsx("option", { value: "unified", children: "Unified" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Highlight:" }), _jsxs("select", { value: highlightMode, onChange: (e) => onHighlightModeChange(e.target.value), className: "rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500", children: [_jsx("option", { value: "changes", children: "All Changes" }), _jsx("option", { value: "additions", children: "Additions Only" }), _jsx("option", { value: "deletions", children: "Deletions Only" }), _jsx("option", { value: "all", children: "Show All" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center space-x-1", children: [_jsx("input", { type: "checkbox", checked: showUnchanged, onChange: (e) => onShowUnchangedChange(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Show unchanged" })] }), _jsxs("label", { className: "flex items-center space-x-1", children: [_jsx("input", { type: "checkbox", checked: showMetadata, onChange: (e) => onShowMetadataChange(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Show metadata" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Zoom:" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { onClick: () => onZoomChange(Math.max(0.1, zoomLevel - 0.1)), className: "px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500", children: "\u2212" }), _jsxs("span", { className: "px-2 py-1 text-xs bg-white border border-gray-300 rounded min-w-[3rem] text-center", children: [Math.round(zoomLevel * 100), "%"] }), _jsx("button", { onClick: () => onZoomChange(Math.min(5.0, zoomLevel + 0.1)), className: "px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500", children: "+" })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { onClick: () => onZoomChange(0.5), className: "px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500", children: "50%" }), _jsx("button", { onClick: () => onZoomChange(1.0), className: "px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500", children: "100%" }), _jsx("button", { onClick: () => onZoomChange(1.5), className: "px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500", children: "150%" })] })] })] });
    ;
}
;
