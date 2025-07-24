import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Audit Log Dashboard - Epic 17.1.6
 *
 * Advanced audit log viewing interface with comprehensive filtering,
 * search, and analytics capabilities.
 *
 * Task: E17-1753114396844-90FA2F - Create filtering and search
 * Epic: 17 - Backstage Admin Controls, Substory: 17.1.6 (Audit Logging)
 */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.js';
import { Input } from '../ui/Input.js';
import { Select } from '../ui/Select.js';
import { Search, Filter, Download, RefreshCw, Clock, User, Shield, AlertTriangle, CheckCircle, XCircle, Settings, BarChart3, FileText, Save, ChevronDown, ChevronUp, Activity, Zap, Target, Database, Lock, Unlock, AlertCircle, Minus } from 'lucide-react';
import { AuditEventType, AuditCategory, AuditSeverity, ComplianceStandard } from '../../services/audit-service.js';
const SEVERITY_CONFIG = {
    low: { color: 'text-blue-600 bg-blue-100', icon: Minus, label: 'Low' },
    medium: { color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle, label: 'Medium' },
    high: { color: 'text-orange-600 bg-orange-100', icon: AlertTriangle, label: 'High' },
    critical: { color: 'text-red-600 bg-red-100', icon: AlertCircle, label: 'Critical' }
};
const CATEGORY_CONFIG = {
    authentication: { color: 'text-blue-600 bg-blue-100', icon: Lock },
    authorization: { color: 'text-purple-600 bg-purple-100', icon: Unlock },
    data_modification: { color: 'text-green-600 bg-green-100', icon: Database },
    system_configuration: { color: 'text-orange-600 bg-orange-100', icon: Settings },
    security: { color: 'text-red-600 bg-red-100', icon: Shield },
    compliance: { color: 'text-indigo-600 bg-indigo-100', icon: FileText },
    performance: { color: 'text-cyan-600 bg-cyan-100', icon: Activity },
    error: { color: 'text-gray-600 bg-gray-100', icon: XCircle }
};
const OUTCOME_CONFIG = {
    success: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
    failure: { color: 'text-red-600 bg-red-100', icon: XCircle },
    partial: { color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle }
};
const TIME_PRESETS = [
    { value: 'last_hour', label: 'Last Hour' },
    { value: 'last_24_hours', label: 'Last 24 Hours' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' }
];
export const AuditLogDashboard = ({ className = '', userId, userRole }) => {
    const [activeTab, setActiveTab] = useState('logs');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Filter state
    const [currentFilter, setCurrentFilter] = useState({});
    const [_____savedFilters, setSavedFilters] = useState([]);
    const [_____filterPresets, _____setFilterPresets] = useState({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, _____setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    // UI state
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [expandedEvents, setExpandedEvents] = useState([]);
    const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);
    const [filterName, setFilterName] = useState('');
    // Analytics state
    const [_____analytics, _____setAnalytics] = useState(null);
    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);
    // Auto-search when filter changes
    useEffect(() => {
        if (Object.keys(currentFilter).length > 0 || searchQuery) {
            const timeoutId = setTimeout(() => {
                performSearch();
            }, 500); // Debounce search
            return () => clearTimeout(timeoutId);
        }
    }, [currentFilter, searchQuery]);
    const loadInitialData = async () => {
        try {
            setLoading(true);
            // Load filter presets, saved filters, and perform initial search
            // This would integrate with the AuditFilteringService
            // Perform initial search with default filter
            await performSearch();
        }
        catch (err) {
            setError('Failed to load audit data');
            console.error('Load error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const performSearch = async () => {
        try {
            setLoading(true);
            setError(null);
            const filter = {
                ...currentFilter,
                search: searchQuery ? {
                    query: searchQuery,
                    fields: ['description', 'action', 'actor_email', 'resource_name'],
                    operator: 'OR',
                    highlight: true
                } : undefined,
                output: {
                    page: 1,
                    limit: 50,
                    sortBy: 'timestamp',
                    sortOrder: 'desc',
                    includeMetadata: true,
                    includeContext: true
                }
            };
            // This would call the AuditFilteringService
            const mockResults = {
                events: generateMockEvents(20),
                pagination: {
                    page: 1,
                    limit: 50,
                    total: 150,
                    totalPages: 3
                },
                summary: {
                    totalEvents: 150,
                    eventsByCategory: {
                        authentication: 45,
                        authorization: 32,
                        data_modification: 28,
                        security: 15,
                        system_configuration: 20,
                        compliance: 6,
                        performance: 3,
                        error: 1
                    },
                    eventsBySeverity: {
                        low: 85,
                        medium: 45,
                        high: 15,
                        critical: 5
                    },
                    uniqueActors: 12,
                    timeRange: {
                        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        end: new Date()
                    }
                },
                performance: {
                    queryTime: 234,
                    totalRecords: 1250,
                    filteredRecords: 150,
                    cacheHit: false
                },
                filterSummary: {
                    appliedFilters: Object.keys(filter).filter(key => filter[key] !== undefined),
                    filterCount: Object.keys(filter).length,
                    resultReduction: 88
                }
            };
            setSearchResults(mockResults);
        }
        catch (err) {
            setError('Search failed');
            console.error('Search error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockEvents = (count) => {
        const events = [];
        const eventTypes = Object.values(AuditEventType);
        const categories = Object.values(AuditCategory);
        const severities = Object.values(AuditSeverity);
        const outcomes = ['success', 'failure', 'partial'];
        for (let i = 0; i < count; i++) {
            events.push({
                id: `audit_${Date.now()}_${i}`,
                eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
                actorId: `user_${Math.floor(Math.random() * 10)}`,
                actorType: 'user',
                actorEmail: `user${Math.floor(Math.random() * 10)}@example.com`,
                actorRole: 'admin',
                resourceType: 'feature_toggle',
                resourceId: `toggle_${Math.floor(Math.random() * 100)}`,
                resourceName: `Feature ${Math.floor(Math.random() * 100)}`,
                action: 'update',
                description: `User performed ${eventTypes[Math.floor(Math.random() * eventTypes.length)]} action`,
                outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
                beforeValue: { enabled: false },
                afterValue: { enabled: true },
                changedFields: ['enabled'],
                sessionId: `session_${Math.floor(Math.random() * 20)}`,
                ipAddress: `192.168.1.${Math.floor(Math.random() * 254)}`,
                userAgent: 'Mozilla/5.0 (compatible)',
                metadata: {
                    source: 'admin_panel',
                    version: '1.0.0'
                },
                tags: [],
                complianceStandards: [ComplianceStandard.SOC2],
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                duration: Math.floor(Math.random() * 1000)
            });
        }
        return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };
    const applyTimeFilter = (preset) => {
        setCurrentFilter(prev => ({
            ...prev,
            timeRange: { preset }
        }));
    };
    const applySeverityFilter = (severities) => {
        setCurrentFilter(prev => ({
            ...prev,
            severities: severities.length > 0 ? severities : undefined
        }));
    };
    const applyCategoryFilter = (categories) => {
        setCurrentFilter(prev => ({
            ...prev,
            categories: categories.length > 0 ? categories : undefined
        }));
    };
    const clearFilters = () => {
        setCurrentFilter({});
        setSearchQuery('');
    };
    const exportResults = async (format) => {
        try {
            // This would call the AuditFilteringService export functionality
            console.log(`Exporting ${searchResults?.events.length} events as ${format}`);
        }
        catch (err) {
            setError('Export failed');
        }
    };
    const saveCurrentFilter = async () => {
        if (!filterName.trim())
            return;
        try {
            // This would call the AuditFilteringService saveFilter method
            const savedFilter = {
                id: `filter_${Date.now()}`,
                name: filterName,
                filter: currentFilter,
                createdBy: userId || 'unknown',
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic: false,
                tags: [],
                usageCount: 0
            };
            setSavedFilters(prev => [savedFilter, ...prev]);
            setShowSaveFilterDialog(false);
            setFilterName('');
        }
        catch (err) {
            setError('Failed to save filter');
        }
    };
    const toggleEventExpansion = (eventId) => {
        setExpandedEvents(prev => prev.includes(eventId)
            ? prev.filter(id => id !== eventId)
            : [...prev, eventId]);
    };
    const toggleEventSelection = (eventId) => {
        setSelectedEvents(prev => prev.includes(eventId)
            ? prev.filter(id => id !== eventId)
            : [...prev, eventId]);
    };
    const formatTimestamp = (timestamp) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        }).format(timestamp);
    };
    const renderEventCard = (event) => {
        const SeverityIcon = SEVERITY_CONFIG[event.severity].icon;
        const CategoryIcon = CATEGORY_CONFIG[event.category].icon;
        const OutcomeIcon = OUTCOME_CONFIG[event.outcome].icon;
        const isExpanded = expandedEvents.includes(event.id);
        const isSelected = selectedEvents.includes(event.id);
        return (_jsx(Card, { className: `mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`, children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3 flex-1", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: () => toggleEventSelection(event.id), className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsxs(Badge, { className: SEVERITY_CONFIG[event.severity].color, children: [_jsx(SeverityIcon, { className: "w-3 h-3 mr-1" }), SEVERITY_CONFIG[event.severity].label] }), _jsxs(Badge, { className: CATEGORY_CONFIG[event.category].color, children: [_jsx(CategoryIcon, { className: "w-3 h-3 mr-1" }), event.category.replace('_', ' ')] }), _jsxs(Badge, { className: OUTCOME_CONFIG[event.outcome].color, children: [_jsx(OutcomeIcon, { className: "w-3 h-3 mr-1" }), event.outcome] })] }), _jsx("h4", { className: "font-semibold text-sm text-gray-900 mb-1", children: event.description }), _jsxs("div", { className: "flex items-center space-x-4 text-xs text-gray-500", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(User, { className: "w-3 h-3 mr-1" }), event.actorEmail] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), formatTimestamp(event.timestamp)] }), event.resourceName && (_jsxs("span", { className: "flex items-center", children: [_jsx(Target, { className: "w-3 h-3 mr-1" }), event.resourceName] }))] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [event.duration && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [event.duration, "ms"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleEventExpansion(event.id), children: isExpanded ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })) })] })] }), isExpanded && (_jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900 mb-2", children: "Event Details" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Event Type:" }), " ", event.eventType] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Action:" }), " ", event.action] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Resource Type:" }), " ", event.resourceType] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Resource ID:" }), " ", event.resourceId] })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-900 mb-2", children: "Context" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Session ID:" }), " ", event.sessionId] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "IP Address:" }), " ", event.ipAddress] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "User Agent:" }), _jsx("span", { className: "text-xs ml-1", children: event.userAgent })] })] })] })] }), (event.beforeValue || event.afterValue) && (_jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium text-gray-900 mb-2", children: "Changes" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [event.beforeValue && (_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Before" }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 rounded overflow-auto", children: JSON.stringify(event.beforeValue, null, 2) })] })), event.afterValue && (_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "After" }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 rounded overflow-auto", children: JSON.stringify(event.afterValue, null, 2) })] }))] })] })), event.metadata && Object.keys(event.metadata).length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium text-gray-900 mb-2", children: "Metadata" }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 rounded overflow-auto", children: JSON.stringify(event.metadata, null, 2) })] }))] }))] }) }, event.id));
    };
    const renderFilterBar = () => (_jsx(Card, { className: "mb-6", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-4 mb-4", children: [_jsxs("div", { className: "flex-1 min-w-0 relative", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx(Input, { type: "text", placeholder: "Search audit logs...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onFocus: () => setShowSuggestions(true), onBlur: () => setTimeout(() => setShowSuggestions(false), 200), className: "pl-10" })] }), showSuggestions && searchSuggestions.length > 0 && (_jsx("div", { className: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1", children: searchSuggestions.map((suggestion, index) => (_jsx("button", { onClick: () => {
                                            setSearchQuery(suggestion);
                                            setShowSuggestions(false);
                                        }, className: "w-full text-left px-3 py-2 hover:bg-gray-50 text-sm", children: suggestion }, index))) }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Select, { value: currentFilter.timeRange?.preset || '', onValueChange: (value) => applyTimeFilter(value), children: [_jsx("option", { value: "", children: "All Time" }), TIME_PRESETS.map(preset => (_jsx("option", { value: preset.value, children: preset.label }, preset.value)))] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowAdvancedFilters(!showAdvancedFilters), children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Advanced"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: clearFilters, disabled: Object.keys(currentFilter).length === 0 && !searchQuery, children: "Clear" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: performSearch, disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh"] })] })] }), showAdvancedFilters && (_jsxs("div", { className: "border-t pt-4 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Severity" }), _jsx("div", { className: "space-y-2", children: Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: currentFilter.severities?.includes(severity) || false, onChange: (e) => {
                                                            const severities = currentFilter.severities || [];
                                                            if (e.target.checked) {
                                                                applySeverityFilter([...severities, severity]);
                                                            }
                                                            else {
                                                                applySeverityFilter(severities.filter(s => s !== severity));
                                                            }
                                                        }, className: "rounded border-gray-300 mr-2" }), _jsx("span", { className: "text-sm", children: config.label })] }, severity))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }), _jsx("div", { className: "space-y-2", children: Object.entries(CATEGORY_CONFIG).map(([category, config]) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: currentFilter.categories?.includes(category) || false, onChange: (e) => {
                                                            const categories = currentFilter.categories || [];
                                                            if (e.target.checked) {
                                                                applyCategoryFilter([...categories, category]);
                                                            }
                                                            else {
                                                                applyCategoryFilter(categories.filter(c => c !== category));
                                                            }
                                                        }, className: "rounded border-gray-300 mr-2" }), _jsx("span", { className: "text-sm", children: category.replace('_', ' ') })] }, category))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Outcome" }), _jsx("div", { className: "space-y-2", children: Object.entries(OUTCOME_CONFIG).map(([outcome, config]) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: currentFilter.outcomes?.includes(outcome) || false, onChange: (e) => {
                                                            const outcomes = currentFilter.outcomes || [];
                                                            if (e.target.checked) {
                                                                setCurrentFilter(prev => ({
                                                                    ...prev,
                                                                    outcomes: [...outcomes, outcome]
                                                                }));
                                                            }
                                                            else {
                                                                setCurrentFilter(prev => ({
                                                                    ...prev,
                                                                    outcomes: outcomes.filter(o => o !== outcome)
                                                                }));
                                                            }
                                                        }, className: "rounded border-gray-300 mr-2" }), _jsx("span", { className: "text-sm", children: outcome })] }, outcome))) })] })] }), _jsx("div", { className: "flex justify-end space-x-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowSaveFilterDialog(true), disabled: Object.keys(currentFilter).length === 0, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Filter"] }) })] }))] }) }));
    const renderSummaryStats = () => {
        if (!searchResults)
            return null;
        return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Events" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: searchResults.summary.totalEvents.toLocaleString() })] }), _jsx(BarChart3, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Unique Users" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: searchResults.summary.uniqueActors })] }), _jsx(User, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Security Events" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: searchResults.summary.eventsByCategory.security || 0 })] }), _jsx(Shield, { className: "h-8 w-8 text-red-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Query Time" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [searchResults.performance?.queryTime || 0, "ms"] })] }), _jsx(Zap, { className: "h-8 w-8 text-yellow-600" })] }) }) })] }));
    };
    const renderActionBar = () => (_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: "flex items-center space-x-2", children: selectedEvents.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("span", { className: "text-sm text-gray-600", children: [selectedEvents.length, " event", selectedEvents.length !== 1 ? 's' : '', " selected"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedEvents([]), children: "Clear Selection" })] })) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportResults('csv'), disabled: !searchResults?.events.length, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export CSV"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportResults('json'), disabled: !searchResults?.events.length, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export JSON"] })] })] }));
    return (_jsxs("div", { className: `audit-log-dashboard ${className}`, children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Audit Logs" }), _jsx("p", { className: "text-gray-600", children: "Comprehensive audit trail with advanced filtering and search capabilities" })] }), error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-md", children: _jsxs("div", { className: "flex items-center", children: [_jsx(XCircle, { className: "h-5 w-5 text-red-600 mr-2" }), _jsx("span", { className: "text-red-800", children: error })] }) })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "mb-6", children: [_jsx(TabsTrigger, { value: "logs", children: "Audit Logs" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "logs", children: [renderFilterBar(), renderSummaryStats(), renderActionBar(), loading ? (_jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin mr-2" }), _jsx("span", { children: "Loading audit events..." })] })) : searchResults?.events.length > 0 ? (_jsxs("div", { children: [searchResults.events.map(renderEventCard), searchResults.pagination.totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center mt-6 space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: searchResults.pagination.page === 1, children: "Previous" }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Page ", searchResults.pagination.page, " of ", searchResults.pagination.totalPages] }), _jsx(Button, { variant: "outline", size: "sm", disabled: searchResults.pagination.page === searchResults.pagination.totalPages, children: "Next" })] }))] })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No audit events found" }), _jsx("p", { className: "text-gray-600", children: "Try adjusting your filters or search terms to find relevant events." })] }))] }), _jsx(TabsContent, { value: "analytics", children: _jsxs("div", { className: "text-center py-12", children: [_jsx(BarChart3, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Analytics Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Advanced analytics and reporting features coming soon." })] }) }), _jsx(TabsContent, { value: "compliance", children: _jsxs("div", { className: "text-center py-12", children: [_jsx(Shield, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Compliance Reports" }), _jsx("p", { className: "text-gray-600", children: "Generate compliance reports for various standards." })] }) }), _jsx(TabsContent, { value: "settings", children: _jsxs("div", { className: "text-center py-12", children: [_jsx(Settings, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Audit Settings" }), _jsx("p", { className: "text-gray-600", children: "Configure audit logging and retention policies." })] }) })] }), showSaveFilterDialog && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Save Filter" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Filter Name" }), _jsx(Input, { type: "text", value: filterName, onChange: (e) => setFilterName(e.target.value), placeholder: "Enter filter name...", className: "w-full" })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowSaveFilterDialog(false), children: "Cancel" }), _jsx(Button, { onClick: saveCurrentFilter, disabled: !filterName.trim(), children: "Save Filter" })] })] }) }))] }));
};
export default AuditLogDashboard;
