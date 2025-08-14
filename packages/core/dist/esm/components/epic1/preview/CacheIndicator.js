import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './CacheIndicator.css';
export const CacheIndicator = ({ cached, hitRate = 0, size = 0, maxSize = 100, className = '' }) => {
    const hitRatePercent = Math.round(hitRate * 100);
    const sizePercent = Math.round((size / maxSize) * 100);
    return (_jsxs("div", { className: `cache-indicator ${className}`, children: [cached && (_jsx("span", { className: "cache-badge cached", children: "\u26A1 Cached" })), _jsxs("div", { className: "cache-stats", children: [_jsxs("div", { className: "cache-stat", title: `Cache hit rate: ${hitRatePercent}%`, children: [_jsx("span", { className: "cache-stat-label", children: "Hit Rate:" }), _jsxs("span", { className: "cache-stat-value", children: [hitRatePercent, "%"] })] }), _jsxs("div", { className: "cache-stat", title: `Cache size: ${size}/${maxSize} entries`, children: [_jsx("span", { className: "cache-stat-label", children: "Size:" }), _jsxs("span", { className: "cache-stat-value", children: [size, "/", maxSize] }), _jsx("div", { className: "cache-size-bar", children: _jsx("div", { className: "cache-size-fill", style: { width: `${sizePercent}%` } }) })] })] })] }));
};
