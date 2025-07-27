import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Targeting UI Components (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive suite of targeting UI components
 * for building intuitive user targeting interfaces. Provides reusable
 * components for audience selection, condition building, user previews,
 * and targeting analytics.
 *
 * Features:
 * - Audience Selector with drag-and-drop segments
 * - Advanced Condition Builder with visual logic
 * - Real-time User Preview with filtering
 * - Targeting Performance Analytics
 * - Segment Management Interface
 * - A/B Test Configuration
 * - Geographic and Demographic Targeting
 * - Behavioral Targeting Controls
 */
import { useState, useMemo } from 'react';
export const [sortBy, setSortBy] = useState('name');
const filteredAudiences = useMemo(() => {
    const filtered = audiences.filter(audience => audience.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered.sort((a, b) => {
        switch (sortBy) {
            case 'reach':
                return b.estimatedReach - a.estimatedReach;
            case 'updated':
                return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
            default:
                return a.name.localeCompare(b.name);
        }
    });
}, [audiences, searchTerm, sortBy]);
return (_jsxs("div", { className: `audience-selector ${compact ? 'compact' : ''}`, children: [_jsxs("div", { className: "selector-header", children: [_jsxs("div", { className: "header-title", children: [_jsx(Target, { size: 20 }), _jsx("h3", { children: "Target Audience" })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "search-control", children: [_jsx(Search, { size: 16 }), _jsx("input", { type: "text", placeholder: "Search audiences...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "sort-select", children: [_jsx("option", { value: "name", children: "Sort by Name" }), _jsx("option", { value: "reach", children: "Sort by Reach" }), _jsx("option", { value: "updated", children: "Sort by Updated" })] }), onCreate && (_jsxs("button", { className: "btn btn-primary btn-sm", onClick: onCreate, children: [_jsx(Plus, { size: 16 }), "New Audience"] }))] })] }), _jsx("div", { className: "audiences-grid", children: filteredAudiences.map(audience => (_jsxs("div", { className: `audience-card ${selectedAudience?.id === audience.id ? 'selected' : ''} ${!audience.isActive ? 'inactive' : ''}`, onClick: () => onSelect(audience), children: [_jsxs("div", { className: "audience-header", children: [_jsxs("div", { className: "audience-title", children: [_jsx("h4", { children: audience.name }), _jsx("div", { className: "audience-status", children: audience.isActive ? (_jsx(CheckCircle, { size: 16, className: "text-green" })) : (_jsx(Pause, { size: 16, className: "text-gray" })) })] }), _jsxs("div", { className: "audience-actions", children: [onEdit && (_jsx("button", { className: "btn-icon", onClick: (e) => {
                                            e.stopPropagation();
                                            onEdit(audience);
                                        }, children: _jsx(Settings, { size: 14 }) })), onDelete && (_jsx("button", { className: "btn-icon btn-danger", onClick: (e) => {
                                            e.stopPropagation();
                                            onDelete(audience.id);
                                        }, children: _jsx(X, { size: 14 }) }))] })] }), _jsxs("div", { className: "audience-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx(Users, { size: 16 }), _jsxs("span", { children: [audience.estimatedReach.toLocaleString(), " users"] })] }), showAnalytics && (_jsxs("div", { className: "metric", children: [_jsx(TrendingUp, { size: 16 }), _jsxs("span", { children: [(audience.conversionRate * 100).toFixed(1), "% conversion"] })] })), _jsxs("div", { className: "metric", children: [_jsx(Target, { size: 16 }), _jsxs("span", { children: [audience.rolloutPercentage, "% rollout"] })] })] }), _jsx("div", { className: "audience-segments", children: _jsxs("div", { className: "segments-preview", children: [audience.segments.slice(0, 3).map(segment => (_jsx("div", { className: "segment-tag", style: { backgroundColor: segment.color + '20', borderColor: segment.color }, children: segment.name }, segment.id))), audience.segments.length > 3 && (_jsxs("div", { className: "segment-more", children: ["+", audience.segments.length - 3, " more"] }))] }) })] }, audience.id))) }), filteredAudiences.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx(Target, { size: 48 }), _jsx("h3", { children: "No audiences found" }), _jsx("p", { children: "Create your first audience to start targeting users" }), onCreate && (_jsxs("button", { className: "btn btn-primary", onClick: onCreate, children: [_jsx(Plus, { size: 16 }), "Create Audience"] }))] }))] }));
;
export const [previewLoading, setPreviewLoading] = useState(false);
const [showPreview, setShowPreview] = useState(false);
const [draggedCondition, setDraggedCondition] = useState(null);
const addCondition = (type = 'attribute') => {
    const newCondition = {
        id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        field: availableFields[0]?.key || '',
        operator: 'equals',
        value: '',
        logicalOperator: conditions.length > 0 ? 'AND' : undefined,
        weight: 1,
        isEnabled: true
    };
    onChange([...conditions, newCondition]);
};
const updateCondition = (id, updates) => {
    onChange(conditions.map(condition => condition.id === id ? { ...condition, ...updates } : condition));
};
const removeCondition = (id) => {
    const filtered = conditions.filter(c => c.id !== id);
    // Remove logical operator from first condition if needed
    if (filtered.length > 0 && filtered[0].logicalOperator) {
        filtered[0] = { ...filtered[0], logicalOperator: undefined };
    }
    onChange(filtered);
};
const generatePreview = async () => {
    if (!onPreview || conditions.length === 0)
        return;
    setPreviewLoading(true);
    try {
        const result = await onPreview(conditions);
        setPreview(result);
    }
    catch (error) {
        console.error('Failed to generate preview:', error);
    }
    finally {
        setPreviewLoading(false);
    }
};
const handleDragStart = (e, conditionId) => {
    setDraggedCondition(conditionId);
    e.dataTransfer.effectAllowed = 'move';
};
const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};
const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedCondition)
        return;
    const draggedIndex = conditions.findIndex(c => c.id === draggedCondition);
    if (draggedIndex === -1 || draggedIndex === targetIndex)
        return;
    const reorderedConditions = [...conditions];
    const [removed] = reorderedConditions.splice(draggedIndex, 1);
    reorderedConditions.splice(targetIndex, 0, removed);
    onChange(reorderedConditions);
    setDraggedCondition(null);
};
const conditionsByCategory = useMemo(() => {
    const categories = {};
    availableFields.forEach(field => {
        if (!categories[field.category]) {
            categories[field.category] = [];
        }
        categories[field.category].push(field);
    });
    return categories;
}, [availableFields]);
return (_jsxs("div", { className: "advanced-condition-builder", children: [_jsxs("div", { className: "builder-header", children: [_jsxs("div", { className: "header-title", children: [_jsx(Filter, { size: 20 }), _jsx("h3", { children: "Targeting Conditions" }), _jsxs("div", { className: "condition-count", children: [conditions.filter(c => c.isEnabled).length, " active conditions"] })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowPreview(!showPreview), children: [_jsx(Eye, { size: 16 }), showPreview ? 'Hide' : 'Show', " Preview"] }), onPreview && (_jsxs("button", { className: "btn btn-primary btn-sm", onClick: generatePreview, disabled: previewLoading || conditions.length === 0, children: [_jsx(Zap, { size: 16 }), previewLoading ? 'Loading...' : 'Test Conditions'] }))] })] }), showVisualBuilder && (_jsx("div", { className: "visual-logic-builder", children: _jsx("div", { className: "logic-canvas", children: conditions.map((condition, index) => (_jsxs("div", { className: `condition-node ${!condition.isEnabled ? 'disabled' : ''}`, draggable: true, onDragStart: (e) => handleDragStart(e, condition.id), onDragOver: handleDragOver, onDrop: (e) => handleDrop(e, index), children: [_jsxs("div", { className: "node-header", children: [_jsx("div", { className: "drag-handle", children: _jsx(Grip, { size: 14 }) }), _jsx("div", { className: "condition-type", children: _jsx("span", { className: `type-badge type-${condition.type}`, children: condition.type }) }), _jsxs("div", { className: "node-controls", children: [_jsx("button", { className: `toggle-btn ${condition.isEnabled ? 'enabled' : 'disabled'}`, onClick: () => updateCondition(condition.id, { isEnabled: !condition.isEnabled }), children: condition.isEnabled ? _jsx(CheckCircle, { size: 14 }) : _jsx(Pause, { size: 14 }) }), _jsx("button", { className: "btn-icon btn-danger", onClick: () => removeCondition(condition.id), children: _jsx(X, { size: 14 }) })] })] }), _jsxs("div", { className: "node-content", children: [_jsxs("div", { className: "condition-inputs", children: [_jsx("select", { value: condition.field, onChange: (e) => updateCondition(condition.id, { field: e.target.value }), className: "field-select", children: Object.entries(conditionsByCategory).map(([category, fields]) => (_jsx("optgroup", { label: category, children: fields.map(field => (_jsx("option", { value: field.key, children: field.label }, field.key))) }, category))) }), _jsxs("select", { value: condition.operator, onChange: (e) => updateCondition(condition.id, { operator: e.target.value }), className: "operator-select", children: [_jsx("option", { value: "equals", children: "Equals" }), _jsx("option", { value: "not_equals", children: "Not Equals" }), _jsx("option", { value: "in", children: "In List" }), _jsx("option", { value: "not_in", children: "Not In List" }), _jsx("option", { value: "greater_than", children: "Greater Than" }), _jsx("option", { value: "less_than", children: "Less Than" }), _jsx("option", { value: "contains", children: "Contains" }), _jsx("option", { value: "regex", children: "Regex Match" })] }), _jsx("input", { type: "text", value: condition.value, onChange: (e) => updateCondition(condition.id, { value: e.target.value }), placeholder: "Enter value...", className: "value-input" })] }), _jsxs("div", { className: "condition-weight", children: [_jsx("label", { children: "Weight:" }), _jsx("input", { type: "range", min: "0.1", max: "2", step: "0.1", value: condition.weight || 1, onChange: (e) => updateCondition(condition.id, { weight: parseFloat(e.target.value) }), className: "weight-slider" }), _jsxs("span", { children: [condition.weight || 1, "x"] })] })] }), index < conditions.length - 1 && (_jsx("div", { className: "logical-connector", children: _jsxs("select", { value: conditions[index + 1]?.logicalOperator || 'AND', onChange: (e) => updateCondition(conditions[index + 1].id, {
                                    logicalOperator: e.target.value
                                }), className: "logic-select", children: [_jsx("option", { value: "AND", children: "AND" }), _jsx("option", { value: "OR", children: "OR" }), _jsx("option", { value: "NOT", children: "NOT" })] }) }))] }, condition.id))) }) })), _jsx("div", { className: "add-condition-controls", children: _jsxs("div", { className: "condition-types", children: [_jsxs("button", { className: "condition-type-btn", onClick: () => addCondition('attribute'), children: [_jsx(Users, { size: 16 }), "User Attribute"] }), _jsxs("button", { className: "condition-type-btn", onClick: () => addCondition('behavior'), children: [_jsx(BarChart3, { size: 16 }), "Behavior"] }), _jsxs("button", { className: "condition-type-btn", onClick: () => addCondition('geography'), children: [_jsx(Globe, { size: 16 }), "Geography"] }), _jsxs("button", { className: "condition-type-btn", onClick: () => addCondition('time'), children: [_jsx(Clock, { size: 16 }), "Time Based"] }), _jsxs("button", { className: "condition-type-btn", onClick: () => addCondition('device'), children: [_jsx(Settings, { size: 16 }), "Device"] })] }) }), showPreview && preview && (_jsxs("div", { className: "preview-panel", children: [_jsxs("div", { className: "preview-header", children: [_jsx("h4", { children: "Targeting Preview" }), _jsxs("div", { className: "preview-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: preview.matchedUsers.toLocaleString() }), _jsx("span", { className: "stat-label", children: "Matched Users" })] }), _jsxs("div", { className: "stat", children: [_jsxs("span", { className: "stat-value", children: [preview.matchPercentage.toFixed(1), "%"] }), _jsx("span", { className: "stat-label", children: "Match Rate" })] })] })] }), _jsxs("div", { className: "preview-content", children: [_jsxs("div", { className: "demographics-breakdown", children: [_jsx("h5", { children: "Demographics Breakdown" }), _jsx("div", { className: "demo-charts", children: Object.entries(preview.demographics).map(([key, data]) => (_jsxs("div", { className: "demo-chart", children: [_jsx("h6", { children: key }), Object.entries(data).map(([label, count]) => (_jsxs("div", { className: "demo-item", children: [_jsx("span", { children: label }), _jsx("span", { children: count })] }, label)))] }, key))) })] }), _jsxs("div", { className: "sample-users", children: [_jsx("h5", { children: "Sample Matched Users" }), _jsx("div", { className: "users-list", children: preview.sampleUsers.map(user => (_jsx("div", { className: "user-item", children: _jsxs("div", { className: "user-info", children: [_jsx("span", { className: "user-email", children: user.email }), _jsx("div", { className: "match-reasons", children: user.matchReasons.map((reason, i) => (_jsx("span", { className: "reason-tag", children: reason }, i))) })] }) }, user.id))) })] })] })] })), conditions.length === 0 && (_jsxs("div", { className: "empty-conditions", children: [_jsx(Filter, { size: 48 }), _jsx("h3", { children: "No targeting conditions" }), _jsx("p", { children: "Add conditions to define who should be targeted" }), _jsxs("button", { className: "btn btn-primary", onClick: () => addCondition(), children: [_jsx(Plus, { size: 16 }), "Add First Condition"] })] }))] }));
;
export 
// Mock data - in real implementation, this would come from props or API
const countries = [
    { code: 'US', name: 'United States', userCount: 125000 },
    { code: 'GB', name: 'United Kingdom', userCount: 89000 },
    { code: 'CA', name: 'Canada', userCount: 67000 },
    { code: 'AU', name: 'Australia', userCount: 45000 },
    { code: 'DE', name: 'Germany', userCount: 78000 }
];
return (_jsxs("div", { className: "geographic-targeting", children: [_jsxs("div", { className: "geo-header", children: [_jsxs("div", { className: "header-title", children: [_jsx(Globe, { size: 20 }), _jsx("h3", { children: "Geographic Targeting" })] }), _jsx("div", { className: "exclude-toggle", children: _jsxs("label", { className: "toggle-label", children: [_jsx("input", { type: "checkbox", checked: excludeMode, onChange: (e) => onExcludeModeChange?.(e.target.checked) }), "Exclude selected locations"] }) })] }), _jsx("div", { className: "geo-tabs", children: ['countries', 'regions', 'cities'].map(tab => (_jsx("button", { className: `tab-btn ${activeTab === tab ? 'active' : ''}`, onClick: () => setActiveTab(tab), children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }), _jsxs("div", { className: "geo-search", children: [_jsx(Search, { size: 16 }), _jsx("input", { type: "text", placeholder: `Search ${activeTab}...`, value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsx("div", { className: "geo-content", children: activeTab === 'countries' && (_jsx("div", { className: "countries-grid", children: countries.filter(country => country.name.toLowerCase().includes(searchTerm.toLowerCase())).map(country => (_jsxs("div", { className: `country-item ${selectedCountries.includes(country.code) ? 'selected' : ''}`, onClick: () => {
                        const newSelection = selectedCountries.includes(country.code)
                            ? selectedCountries.filter(c => c !== country.code)
                            : [...selectedCountries, country.code];
                        onCountriesChange(newSelection);
                    }, children: [_jsx("div", { className: "country-flag", children: _jsx("div", { className: "flag-icon", children: country.code }) }), _jsxs("div", { className: "country-info", children: [_jsx("div", { className: "country-name", children: country.name }), _jsxs("div", { className: "user-count", children: [country.userCount.toLocaleString(), " users"] })] }), selectedCountries.includes(country.code) && (_jsx(CheckCircle, { size: 16, className: "selected-icon" }))] }, country.code))) })) }), _jsx("div", { className: "geo-summary", children: _jsxs("div", { className: "summary-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: selectedCountries.length }), _jsx("span", { className: "stat-label", children: "Countries" })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: selectedRegions.length }), _jsx("span", { className: "stat-label", children: "Regions" })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: selectedCities.length }), _jsx("span", { className: "stat-label", children: "Cities" })] })] }) })] }));
;
return (_jsxs("div", { className: "segment-management", children: [_jsxs("div", { className: "segments-header", children: [_jsxs("div", { className: "header-title", children: [_jsx(Layers, { size: 20 }), _jsx("h3", { children: "User Segments" }), _jsxs("div", { className: "segment-count", children: [segments.length, " segments"] })] }), _jsxs("button", { className: "btn btn-primary", onClick: () => onCreateSegment({
                        name: 'New Segment',
                        conditions: [],
                        userCount: 0,
                        isActive: true,
                        tags: [],
                        color: '#3B82F6'
                    }), children: [_jsx(Plus, { size: 16 }), "Create Segment"] })] }), _jsx("div", { className: "segments-list", children: segments.map(segment => (_jsxs("div", { className: `segment-card ${expandedSegment === segment.id ? 'expanded' : ''}`, children: [_jsxs("div", { className: "segment-header", onClick: () => setExpandedSegment(expandedSegment === segment.id ? null : segment.id), children: [_jsx("div", { className: "segment-indicator", children: _jsx("div", { className: "segment-color", style: { backgroundColor: segment.color } }) }), _jsxs("div", { className: "segment-info", children: [_jsxs("div", { className: "segment-title", children: [_jsx("h4", { children: segment.name }), _jsx("div", { className: "segment-status", children: segment.isActive ? (_jsx(CheckCircle, { size: 16, className: "text-green" })) : (_jsx(Pause, { size: 16, className: "text-gray" })) })] }), _jsx("div", { className: "segment-description", children: segment.description }), _jsxs("div", { className: "segment-metrics", children: [_jsxs("span", { className: "metric", children: [_jsx(Users, { size: 14 }), segment.userCount.toLocaleString(), " users"] }), _jsxs("span", { className: "metric", children: [_jsx(Filter, { size: 14 }), segment.conditions.length, " conditions"] }), _jsxs("span", { className: "metric", children: [_jsx(Calendar, { size: 14 }), "Updated ", new Date(segment.lastUpdated).toLocaleDateString()] })] })] }), _jsx("div", { className: "segment-actions", children: _jsx("button", { className: "expand-btn", children: expandedSegment === segment.id ?
                                        _jsx(ChevronDown, { size: 16 }) :
                                        _jsx(ChevronRight, { size: 16 }) }) })] }), expandedSegment === segment.id && (_jsxs("div", { className: "segment-details", children: [_jsxs("div", { className: "segment-conditions", children: [_jsx("h5", { children: "Targeting Conditions" }), segment.conditions.length === 0 ? (_jsx("p", { className: "no-conditions", children: "No conditions defined" })) : (_jsx("div", { className: "conditions-list", children: segment.conditions.map((condition, index) => (_jsxs("div", { className: "condition-item", children: [index > 0 && (_jsx("span", { className: "logical-op", children: condition.logicalOperator || 'AND' })), _jsxs("span", { className: "condition-text", children: [condition.field, " ", condition.operator, " ", condition.value] })] }, condition.id))) }))] }), _jsxs("div", { className: "segment-tags", children: [_jsx("h5", { children: "Tags" }), _jsx("div", { className: "tags-list", children: segment.tags.map(tag => (_jsx("span", { className: "tag", children: tag }, tag))) })] }), _jsxs("div", { className: "segment-controls", children: [_jsxs("button", { className: "btn btn-secondary btn-sm", onClick: () => setEditingSegment(segment.id), children: [_jsx(Settings, { size: 16 }), "Edit"] }), _jsxs("button", { className: "btn btn-secondary btn-sm", onClick: () => onDuplicateSegment(segment.id), children: [_jsx(Plus, { size: 16 }), "Duplicate"] }), _jsxs("button", { className: `btn btn-sm ${segment.isActive ? 'btn-secondary' : 'btn-primary'}`, onClick: () => onUpdateSegment(segment.id, { isActive: !segment.isActive }), children: [segment.isActive ? _jsx(Pause, { size: 16 }) : _jsx(Play, { size: 16 }), segment.isActive ? 'Deactivate' : 'Activate'] }), _jsxs("button", { className: "btn btn-danger btn-sm", onClick: () => onDeleteSegment(segment.id), children: [_jsx(X, { size: 16 }), "Delete"] })] })] }))] }, segment.id))) }), segments.length === 0 && (_jsxs("div", { className: "empty-segments", children: [_jsx(Layers, { size: 48 }), _jsx("h3", { children: "No segments created" }), _jsx("p", { children: "Create user segments to organize your targeting" }), _jsxs("button", { className: "btn btn-primary", onClick: () => onCreateSegment({
                        name: 'My First Segment',
                        conditions: [],
                        userCount: 0,
                        isActive: true,
                        tags: [],
                        color: '#3B82F6'
                    }), children: [_jsx(Plus, { size: 16 }), "Create First Segment"] })] }))] }));
;
