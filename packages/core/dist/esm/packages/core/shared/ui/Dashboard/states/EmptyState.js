import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Filter, Plus, BarChart3 } from 'lucide-react';
import './EmptyState.css';
;
variant ?  : 'default' | 'search' | 'filter' | 'create';
className ?  : string;
const VARIANT_CONFIGS = {}, search;
filter: {
    icon: Filter,
        title;
    'No matching results',
        description;
    'No items match your current filter criteria.';
}
create: {
    icon: Plus,
        title;
    'Get started',
        description;
    'Create your first item to see it here.';
}
;
export const EmptyState = ({
    icon,
    title,
    description,
    action,
    variant = 'default' });
className = '';
{
    const config = VARIANT_CONFIGS[variant];
    const Icon = icon || config.icon;
    const displayTitle = title || config.title;
    const displayDescription = description || config.description;
    return;
    _jsxs("div", { className: `empty-state ${variant} ${className}`, children: ["}", _jsxs("div", { className: "empty-content", children: [_jsx("div", { className: "empty-icon-container", children: _jsx(Icon, { size: 64, className: "empty-icon" }) }), _jsxs("div", { className: "empty-text", children: [_jsx("h3", { className: "empty-title", children: displayTitle }), _jsx("p", { className: "empty-description", children: displayDescription })] }), action && ()
                        < div, " className=\"empty-actions\">", _jsx("button", { onClick: action.onClick, className: `empty-action-btn ${action.variant || 'primary'}`, children: action.label })] }), ")}"] });
    div >
    ;
    ;
}
;
// Specialized empty state components for common use cases
export const EmptySearchState = (props) => ()
    < EmptyState, { ...props }, variant = "search" /  >
;
;
export const EmptyFilterState = (props) => ()
    < EmptyState, { ...props }, variant = "filter" /  >
;
;
export const EmptyCreateState = (props) => ()
    < EmptyState, { ...props }, variant = "create" /  >
;
;
export const EmptyChartState = (props) => ()
    < EmptyState, { ...props }, icon = { BarChart3 }, title = "No chart data" /  >
;
;
export default EmptyState;
