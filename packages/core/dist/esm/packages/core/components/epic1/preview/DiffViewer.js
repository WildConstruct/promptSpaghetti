import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import './DiffViewer.css';
/**
 * Component for rendering diff results with visual highlighting
 */
export const DiffViewer = ({ diff, className = '', showInline = true }) => {
    // Render inline diff with colored segments
    const inlineContent = useMemo(() => {
        if (!showInline || !diff.hasChanges) {
            return null;
        }
        return diff.segments.map((segment, index) => {
            const key = `${segment.type}-${index}`;
            switch (segment.type) {
                case 'added':
                    return (_jsx("span", { className: "epic1-diff-added", title: "Added", children: segment.text }, key));
                case 'removed':
                    return (_jsx("span", { className: "epic1-diff-removed", title: "Removed", children: segment.text }, key));
                case 'unchanged':
                    return _jsx("span", { children: segment.text }, key);
                default:
                    return null;
            }
        });
    }, [diff, showInline]);
    // Show summary for significant changes
    const changeSummary = useMemo(() => {
        if (!diff.hasChanges)
            return null;
        const parts = [];
        if (diff.addedCount > 0) {
            parts.push(`+${diff.addedCount}`);
        }
        if (diff.removedCount > 0) {
            parts.push(`-${diff.removedCount}`);
        }
        return parts.length > 0 ? `(${parts.join(' ')})` : null;
    }, [diff]);
    if (!diff.hasChanges) {
        return null;
    }
    return (_jsxs("div", { className: `epic1-diff-viewer ${className}`, children: [changeSummary && (_jsx("div", { className: "epic1-diff-summary", children: changeSummary })), inlineContent && (_jsx("div", { className: "epic1-diff-content", children: inlineContent }))] }));
};
/**
 * Small indicator badge showing if content has changes
 */
export const DiffIndicator = ({ hasChanges, addedCount = 0, removedCount = 0, className = '' }) => {
    if (!hasChanges) {
        return null;
    }
    const title = `Changes: +${addedCount} -${removedCount}`;
    return (_jsxs("div", { className: `epic1-diff-indicator ${className}`, title: title, children: [_jsx("span", { className: "epic1-diff-indicator-dot" }), (addedCount > 0 || removedCount > 0) && (_jsxs("span", { className: "epic1-diff-indicator-text", children: [addedCount > 0 && _jsxs("span", { className: "epic1-diff-indicator-added", children: ["+", addedCount] }), removedCount > 0 && _jsxs("span", { className: "epic1-diff-indicator-removed", children: ["-", removedCount] })] }))] }));
};
/**
 * Wrapper component to highlight changed content
 */
export const ChangeHighlight = ({ isChanged, children, className = '' }) => {
    return (_jsx("div", { className: `epic1-change-highlight ${isChanged ? 'is-changed' : ''} ${className}`, children: children }));
};
