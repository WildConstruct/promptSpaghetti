import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.3 - Activity Filters Component
 * Filter controls for activity feed
 */
import { useState } from 'react';
export const ActivityFilters = ({ filters, eventTypes, onFilterChange, className = '', }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: filters.from_date ? filters.from_date.toISOString().split('T')[0] : '',
        to: filters.to_date ? filters.to_date.toISOString().split('T')[0] : '',
    });
    const handleEventTypeChange = (eventType, checked) => {
        const currentTypes = filters.event_types || [];
        const newTypes = checked
            ? [...currentTypes, eventType]
            : currentTypes.filter(t => t !== eventType);
        onFilterChange({ event_types: newTypes.length > 0 ? newTypes : undefined });
    };
    const handleDateRangeChange = (field, value) => {
        const newDateRange = { ...dateRange, [field]: value };
        setDateRange(newDateRange);
        onFilterChange({
            from_date: newDateRange.from ? new Date(newDateRange.from) : undefined,
            to_date: newDateRange.to ? new Date(newDateRange.to) : undefined,
        });
    };
    const clearFilters = () => {
        setDateRange({ from: '', to: '' });
        onFilterChange({
            actor_id: undefined,
            event_types: undefined,
            from_date: undefined,
            to_date: undefined,
        });
    };
    const hasActiveFilters = !!(filters.actor_id ||
        (filters.event_types && filters.event_types.length > 0) ||
        filters.from_date ||
        filters.to_date);
    const eventTypeGroups = {
        workspace: eventTypes.filter(t => t.startsWith('workspace.')),
        project: eventTypes.filter(t => t.startsWith('project.')),
        resource: eventTypes.filter(t => t.startsWith('resource.')),
        comment: eventTypes.filter(t => t.startsWith('comment.')),
        user: eventTypes.filter(t => t.startsWith('user.')),
        other: eventTypes.filter(t => !['workspace.', 'project.', 'resource.', 'comment.', 'user.'].some(prefix => t.startsWith(prefix))),
    };
    return (_jsxs("div", { className: `activity-filters ${className}`, children: [_jsxs("div", { className: "activity-filters__header", children: [_jsx("h4", { children: "Filter Activity" }), _jsxs("div", { className: "activity-filters__actions", children: [hasActiveFilters && (_jsx("button", { className: "btn btn--ghost btn--small", onClick: clearFilters, children: "Clear Filters" })), _jsx("button", { className: "btn btn--ghost btn--small", onClick: () => setShowAdvanced(!showAdvanced), children: showAdvanced ? 'Simple' : 'Advanced' })] })] }), _jsxs("div", { className: "activity-filters__content", children: [_jsxs("div", { className: "filter-group", children: [_jsx("label", { className: "filter-label", children: "Quick Filters" }), _jsxs("div", { className: "quick-filters", children: [_jsx("button", { className: `quick-filter ${!hasActiveFilters ? 'quick-filter--active' : ''}`, onClick: clearFilters, children: "All Activity" }), _jsx("button", { className: `quick-filter ${filters.event_types?.includes('comment.created') ? 'quick-filter--active' : ''}`, onClick: () => onFilterChange({ event_types: ['comment.created'] }), children: "Comments" }), _jsx("button", { className: `quick-filter ${filters.event_types?.some(t => t.includes('created')) ? 'quick-filter--active' : ''}`, onClick: () => onFilterChange({
                                            event_types: eventTypes.filter(t => t.includes('created'))
                                        }), children: "Created Items" }), _jsx("button", { className: `quick-filter ${filters.event_types?.some(t => t.startsWith('user.')) ? 'quick-filter--active' : ''}`, onClick: () => onFilterChange({
                                            event_types: eventTypes.filter(t => t.startsWith('user.'))
                                        }), children: "User Activity" })] })] }), _jsxs("div", { className: "filter-group", children: [_jsx("label", { className: "filter-label", children: "Date Range" }), _jsxs("div", { className: "date-range-inputs", children: [_jsx("input", { type: "date", value: dateRange.from, onChange: (e) => handleDateRangeChange('from', e.target.value), className: "form-input form-input--small", placeholder: "From date" }), _jsx("span", { className: "date-range-separator", children: "to" }), _jsx("input", { type: "date", value: dateRange.to, onChange: (e) => handleDateRangeChange('to', e.target.value), className: "form-input form-input--small", placeholder: "To date" })] })] }), _jsxs("div", { className: "filter-group", children: [_jsx("label", { className: "filter-label", children: "User" }), _jsx("input", { type: "text", value: filters.actor_id || '', onChange: (e) => onFilterChange({ actor_id: e.target.value || undefined }), placeholder: "Filter by user ID...", className: "form-input form-input--small" })] }), showAdvanced && (_jsxs("div", { className: "filter-group filter-group--advanced", children: [_jsx("label", { className: "filter-label", children: "Event Types" }), _jsx("div", { className: "event-type-filters", children: Object.entries(eventTypeGroups).map(([group, types]) => {
                                    if (types.length === 0)
                                        return null;
                                    return (_jsxs("div", { className: "event-type-group", children: [_jsxs("h5", { className: "event-type-group__title", children: [group.charAt(0).toUpperCase() + group.slice(1), " Events"] }), _jsx("div", { className: "event-type-checkboxes", children: types.map(eventType => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: filters.event_types?.includes(eventType) || false, onChange: (e) => handleEventTypeChange(eventType, e.target.checked) }), _jsx("span", { className: "checkbox-text", children: eventType.replace(/[._]/g, ' ') })] }, eventType))) })] }, group));
                                }) })] }))] }), hasActiveFilters && (_jsx("div", { className: "activity-filters__summary", children: _jsxs("div", { className: "active-filters", children: [_jsx("span", { className: "active-filters__label", children: "Active filters:" }), _jsxs("div", { className: "active-filters__tags", children: [filters.actor_id && (_jsxs("span", { className: "filter-tag", children: ["User: ", filters.actor_id, _jsx("button", { onClick: () => onFilterChange({ actor_id: undefined }), children: "\u00D7" })] })), filters.event_types?.map(type => (_jsxs("span", { className: "filter-tag", children: [type.replace(/[._]/g, ' '), _jsx("button", { onClick: () => handleEventTypeChange(type, false), children: "\u00D7" })] }, type))), filters.from_date && (_jsxs("span", { className: "filter-tag", children: ["From: ", filters.from_date.toLocaleDateString(), _jsx("button", { onClick: () => handleDateRangeChange('from', ''), children: "\u00D7" })] })), filters.to_date && (_jsxs("span", { className: "filter-tag", children: ["To: ", filters.to_date.toLocaleDateString(), _jsx("button", { onClick: () => handleDateRangeChange('to', ''), children: "\u00D7" })] }))] })] }) }))] }));
};
export default ActivityFilters;
