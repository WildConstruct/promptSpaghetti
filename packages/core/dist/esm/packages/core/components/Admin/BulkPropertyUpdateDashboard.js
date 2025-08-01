import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Bulk Property Update Dashboard - Epic 17
 *
 * Comprehensive bulk operations interface for updating properties across multiple
 * entities with validation, progress tracking, and rollback capabilities.
 *
 * Task: E17-1753114396945-40F775 - Implement bulk property updates
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Settings, Play, RotateCcw, CheckCircle, XCircle, Clock, FileText, Users, Package, Tag, Archive, Workflow, Globe, Target, Plus, Search, Download, RefreshCw, Eye, Edit, Trash2, Save, Activity, Zap, History } from 'lucide-react';
import { bulkPropertyUpdateService } from '../../services/BulkPropertyUpdateService';
const TARGET_TYPE_CONFIG = {};
user: {
    color: 'text-blue-600 bg-blue-100', icon;
    Users;
}
content: {
    color: 'text-green-600 bg-green-100', icon;
    FileText;
}
product: {
    color: 'text-orange-600 bg-orange-100', icon;
    Package;
}
category: {
    color: 'text-purple-600 bg-purple-100', icon;
    Archive;
}
tag: {
    color: 'text-yellow-600 bg-yellow-100', icon;
    Tag;
}
collection: {
    color: 'text-indigo-600 bg-indigo-100', icon;
    Archive;
}
campaign: {
    color: 'text-red-600 bg-red-100', icon;
    Target;
}
workflow: {
    color: 'text-cyan-600 bg-cyan-100', icon;
    Workflow;
}
system_setting: {
    color: 'text-gray-600 bg-gray-100', icon;
    Settings;
}
custom_entity: {
    color: 'text-pink-600 bg-pink-100', icon;
    Globe;
}
;
const STATUS_CONFIG = {
    draft: { color: 'text-gray-600 bg-gray-100', icon: Edit },
    validating: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
    validated: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
    executing: { color: 'text-blue-600 bg-blue-100', icon: Play },
    completed: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
    failed: { color: 'text-red-600 bg-red-100', icon: XCircle },
    cancelled: { color: 'text-gray-600 bg-gray-100', icon: XCircle },
    rolling_back: { color: 'text-orange-600 bg-orange-100', icon: RotateCcw },
    rolled_back: { color: 'text-purple-600 bg-purple-100', icon: History }
};
const OPERATION_TYPE_CONFIG = {
    set: { label: 'Set Value', description: 'Set property to a specific value' },
    unset: { label: 'Remove Property', description: 'Remove property from entity' },
    append: { label: 'Append Text', description: 'Add text to end of property' },
    prepend: { label: 'Prepend Text', description: 'Add text to beginning of property' },
    increment: { label: 'Increment Number', description: 'Add to numeric property' },
    decrement: { label: 'Decrement Number', description: 'Subtract from numeric property' },
    multiply: { label: 'Multiply Number', description: 'Multiply numeric property' },
    divide: { label: 'Divide Number', description: 'Divide numeric property' },
    replace: { label: 'Replace Text', description: 'Replace text in property' },
    merge: { label: 'Merge Object', description: 'Merge with object property' },
    push: { label: 'Add to Array', description: 'Add item to array property' },
    pull: { label: 'Remove from Array', description: 'Remove item from array property' },
    toggle: { label: 'Toggle Boolean', description: 'Toggle boolean property' }
};
export const BulkPropertyUpdateDashboard = ({
    className = '',
    userId,
    userRole
});
{
    const [activeTab, setActiveTab] = useState('operations');
    const [operations, setOperations] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Filters
    const [_____filter, _____setFilter] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [targetTypeFilter, setTargetTypeFilter] = useState('all');
    // Create Operation Form
    const [isCreating, setIsCreating] = useState(false);
    const [newOperation, setNewOperation] = useState({});
    name: '',
        targetType;
    'user',
        targets;
    [],
        updates;
    [],
        dryRun;
    true,
        backupBeforeUpdate;
    true,
    ;
}
;
// Load data
useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds;
    return () => clearInterval(interval);
}, []);
const loadData = async () => {
    try {
        setIsLoading(true);
        // Build filter
        const operationFilter = {
            searchQuery: searchQuery || undefined,
            statuses: statusFilter !== 'all' ? [statusFilter] : undefined,
            targetTypes: targetTypeFilter !== 'all' ? [targetTypeFilter] : undefined,
        };
        // Load operations
        const operationsList = bulkPropertyUpdateService.getOperations(operationFilter);
        setOperations(operationsList);
        // Load templates
        const templatesList = bulkPropertyUpdateService.getTemplates();
        setTemplates(templatesList);
        // Load stats
        const statsData = bulkPropertyUpdateService.getBulkUpdateStats();
        setStats(statsData);
    }
    catch (error) {
        console.error('Failed to load bulk update data:', error);
    }
    finally {
        setIsLoading(false);
    }
    ;
    const handleExecuteOperation = async (operationId) => {
        try {
            await bulkPropertyUpdateService.executeOperation(operationId);
            loadData();
        }
        catch (error) {
            console.error('Failed to execute operation:', error);
        }
        ;
        const handleRollbackOperation = async (operationId) => {
            try {
                await bulkPropertyUpdateService.rollbackOperation(operationId);
                loadData();
            }
            catch (error) {
                console.error('Failed to rollback operation:', error);
            }
            ;
            const handleCreateOperation = async () => {
                try {
                    const _____operation = await bulkPropertyUpdateService.createOperation();
                    ;
                    newOperation.name,
                        newOperation.targets,
                        newOperation.updates,
                        {
                            execution: {
                                dryRun: newOperation.dryRun,
                                backupBeforeUpdate: newOperation.backupBeforeUpdate,
                            },
                            userId
                        } || 'admin';
                }
                finally {
                }
            };
        };
    };
};
;
setIsCreating(false);
setNewOperation({});
name: '',
    targetType;
'user',
    targets;
[],
    updates;
[],
    dryRun;
true,
    backupBeforeUpdate;
true,
;
;
loadData();
try { }
catch (error) {
    console.error('Failed to create operation:', error);
}
;
const filteredOperations = useMemo(() => {
    return operations.filter(op => { });
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!op.name.toLowerCase().includes(query) &&
            !op.description?.toLowerCase().includes(query)) {
            return false;
            if (statusFilter !== 'all' && op.status !== statusFilter) {
                return false;
                if (targetTypeFilter !== 'all' && )
                    !op.targets.some(target => target.type === targetTypeFilter);
            }
        }
    }
}), { return: , false:  };
return true;
;
[operations, searchQuery, statusFilter, targetTypeFilter];
;
const renderOperations = () => ();
;
_jsxs("div", { className: "operations-section", children: [_jsxs("div", { className: "operations-controls", children: [_jsxs("div", { className: "search-filters", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx(Input, { placeholder: "Search operations...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input" })] }), _jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "validating", children: "Validating" }), _jsx("option", { value: "validated", children: "Validated" }), _jsx("option", { value: "executing", children: "Executing" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "failed", children: "Failed" }), _jsx("option", { value: "cancelled", children: "Cancelled" }), _jsx("option", { value: "rolling_back", children: "Rolling Back" }), _jsx("option", { value: "rolled_back", children: "Rolled Back" })] }), _jsxs(Select, { value: targetTypeFilter, onValueChange: (value) => setTargetTypeFilter(value), children: [_jsx("option", { value: "all", children: "All Target Types" }), _jsx("option", { value: "user", children: "Users" }), _jsx("option", { value: "content", children: "Content" }), _jsx("option", { value: "product", children: "Products" }), _jsx("option", { value: "category", children: "Categories" }), _jsx("option", { value: "tag", children: "Tags" }), _jsx("option", { value: "collection", children: "Collections" }), _jsx("option", { value: "campaign", children: "Campaigns" }), _jsx("option", { value: "workflow", children: "Workflows" }), _jsx("option", { value: "system_setting", children: "System Settings" }), _jsx("option", { value: "custom_entity", children: "Custom Entities" })] })] }), _jsxs("div", { className: "action-buttons", children: [_jsxs(Button, { onClick: loadData, disabled: isLoading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isLoading ? 'animate-spin' : ''}` }), "} Refresh"] }), _jsxs(Button, { onClick: () => setIsCreating(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Operation"] })] })] }), _jsxs("div", { className: "operations-list", children: [filteredOperations.map(operation => ()
                    < OperationCard, key = { operation, : .id }, operation = { operation }, onSelect = { setSelectedOperation }, onExecute = { handleExecuteOperation }, onRollback = { handleRollbackOperation }, userRole = { userRole }
                    /  >
                ), ")}"] }), filteredOperations.length === 0 && ()
            < div, " className=\"empty-state\">", _jsx(Settings, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No operations found" }), _jsx("p", { className: "text-gray-500", children: "Create a bulk operation to update multiple entities." })] });
div >
;
;
const renderTemplates = () => ();
;
_jsxs("div", { className: "templates-section", children: [_jsxs("div", { className: "templates-header", children: [_jsx("h3", { children: "Operation Templates" }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Template"] })] }), _jsxs("div", { className: "templates-grid", children: [templates.map(template => ()
                    < TemplateCard, key = { template, : .id }, template = { template }, onUse = {}(templateId)), " => console.log('Use template:', templateId)} onEdit=", (templateId) => console.log('Edit template:', templateId), "onDelete=", (templateId) => console.log('Delete template:', templateId), "/> ))}"] }), templates.length === 0 && ()
            < div, " className=\"empty-state\">", _jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No templates found" }), _jsx("p", { className: "text-gray-500", children: "Create reusable templates for common bulk operations." })] });
div >
;
;
const renderAnalytics = () => {
    if (!stats)
        return _jsx("div", { children: "Loading analytics..." });
    return;
    _jsxs("div", { className: "analytics-section", children: [_jsxs("div", { className: "analytics-grid", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(Activity, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Total Operations" }), _jsx("div", { className: "metric-value", children: stats.totalOperations }), _jsx("div", { className: "metric-change", children: "All time" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Success Rate" }), _jsxs("div", { className: "metric-value", children: [((stats.completedOperations / Math.max(stats.totalOperations, 1)) * 100).toFixed(1), "%"] }), _jsxs("div", { className: "metric-change positive", children: [stats.completedOperations, " completed"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(Target, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Targets Processed" }), _jsx("div", { className: "metric-value", children: stats.totalTargetsProcessed.toLocaleString() }), _jsx("div", { className: "metric-change", children: "Across all operations" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "metric-item", children: [_jsx(Zap, { className: "w-8 h-8 text-yellow-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Avg Speed" }), _jsx("div", { className: "metric-value", children: stats.performanceMetrics.averageItemsPerSecond.toFixed(1) }), _jsx("div", { className: "metric-change", children: "Items per second" })] })] }) }) })] }), _jsxs("div", { className: "charts-section", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Success Rate by Target Type" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "success-rate-chart", children: [Object.entries(stats.successRateByType).map(([type, typeStats]) => {
                                            const config = TARGET_TYPE_CONFIG[type];
                                            const Icon = config.icon;
                                            return;
                                            _jsxs("div", { className: "chart-item", children: [_jsxs("div", { className: "chart-label", children: [_jsx(Icon, { className: `w-4 h-4 ${config.color.split(' ')[0]}` }), "}", _jsx("span", { children: type.replace('_', ' ') })] }), _jsx("div", { className: "chart-bar", children: _jsx("div", { className: `chart-fill ${config.color.split(' ')[1]}`, style: { width: `${typeStats.rate}%` } }) }), _jsxs("div", { className: "chart-value", children: [typeStats.rate.toFixed(1), "%", _jsxs("span", { className: "chart-details", children: ["(", typeStats.successful, "/", typeStats.total, ")"] })] })] }, type);
                                        }), "; })}"] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Common Errors" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "errors-list", children: stats.commonErrors.slice(0, 5).map((error, index) => ()
                                            < div, key = { index }, className = "error-item" >
                                            (_jsxs("div", { className: "error-info", children: [_jsx("div", { className: "error-type", children: error.type }), _jsx("div", { className: "error-message", children: error.message })] })
                                                ,
                                                    _jsxs("div", { className: "error-stats", children: [_jsxs("div", { className: "error-count", children: [error.count, " occurrences"] }), _jsxs("div", { className: "error-targets", children: [error.affectedTargets, " targets"] })] }))) }), "))}"] })] })] })] });
};
div >
;
;
;
const renderCreateOperation = () => ();
;
_jsxs("div", { className: "create-operation-modal", children: [_jsx("div", { className: "modal-overlay", onClick: () => setIsCreating(false) }), _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: "Create Bulk Operation" }), _jsx(Button, { onClick: () => setIsCreating(false), variant: "outline", size: "sm", children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "form-section", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Operation Name" }), _jsx(Input, { value: newOperation.name, onChange: (e) => setNewOperation(prev => ({ ...prev, name: e.target.value })), placeholder: "Enter operation name..." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Target Type" }), _jsxs(Select, { value: newOperation.targetType, onValueChange: (value) => setNewOperation(prev => ({ ...prev, targetType: value })), children: [_jsx("option", { value: "user", children: "Users" }), _jsx("option", { value: "content", children: "Content" }), _jsx("option", { value: "product", children: "Products" }), _jsx("option", { value: "category", children: "Categories" }), _jsx("option", { value: "tag", children: "Tags" }), _jsx("option", { value: "collection", children: "Collections" }), _jsx("option", { value: "campaign", children: "Campaigns" }), _jsx("option", { value: "workflow", children: "Workflows" }), _jsx("option", { value: "system_setting", children: "System Settings" }), _jsx("option", { value: "custom_entity", children: "Custom Entities" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Settings" }), _jsxs("div", { className: "form-checkboxes", children: [_jsxs("div", { className: "checkbox-item", children: [_jsx(Switch, { checked: newOperation.dryRun, onCheckedChange: (checked) => setNewOperation(prev => ({ ...prev, dryRun: checked })) }), _jsx("span", { children: "Dry Run (Preview only)" })] }), _jsxs("div", { className: "checkbox-item", children: [_jsx(Switch, { checked: newOperation.backupBeforeUpdate, onCheckedChange: (checked) => setNewOperation(prev => ({ ...prev, backupBeforeUpdate: checked })) }), _jsx("span", { children: "Backup before update" })] })] })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Property Updates" }), _jsx("div", { className: "updates-list", children: newOperation.updates.map((update, index) => ()
                                        < div, key = { index }, className = "update-item" >
                                        (_jsxs("div", { className: "update-fields", children: [_jsx(Input, { placeholder: "Property name", value: update.property, onChange: (e) => {
                                                        const updates = [...newOperation.updates];
                                                        updates[index] = { ...updates[index], property: e.target.value };
                                                        setNewOperation(prev => ({ ...prev, updates }));
                                                    } }), _jsx(Select, { value: update.operation, onValueChange: (value) => {
                                                        const updates = [...newOperation.updates];
                                                        updates[index] = { ...updates[index], operation: value };
                                                        setNewOperation(prev => ({ ...prev, updates }));
                                                    }, children: Object.entries(OPERATION_TYPE_CONFIG).map(([op, config]) => ()
                                                        < option, key = { op }, value = { op } >
                                                        { config, : .label }) }), "))}"] })
                                            ,
                                                _jsx(Input, { placeholder: "Value", value: update.value || '', onChange: (e) => {
                                                        const updates = [...newOperation.updates];
                                                        updates[index] = { ...updates[index], value: e.target.value };
                                                        setNewOperation(prev => ({ ...prev, updates }));
                                                    } })
                                                    ,
                                                        _jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                const updates = newOperation.updates.filter((_, i) => i !== index);
                                                                setNewOperation(prev => ({ ...prev, updates }));
                                                            }, children: _jsx(Trash2, { className: "w-4 h-4" }) }))) })] }), "))}", _jsxs(Button, { onClick: () => {
                                const updates = [...newOperation.updates, {
                                        property: '',
                                        operation: 'set',
                                        value: '',
                                    }];
                                setNewOperation(prev => ({ ...prev, updates }));
                            }, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Update"] })] })] })] })
    ,
        _jsxs("div", { className: "modal-footer", children: [_jsx(Button, { onClick: () => setIsCreating(false), variant: "outline", children: "Cancel" }), _jsxs(Button, { onClick: handleCreateOperation, disabled: !newOperation.name || newOperation.updates.length === 0, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Create Operation"] })] });
div >
;
div >
;
;
return;
_jsxs("div", { className: `bulk-update-dashboard ${className}`, children: ["}", _jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Bulk Property Updates" }), _jsx("p", { children: "Update properties across multiple entities with validation and rollback" })] }), _jsx("div", { className: "header-actions", children: _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid grid-cols-3 w-full", children: [_jsxs(TabsTrigger, { value: "operations", children: ["Operations", _jsx(Badge, { className: "ml-2 text-xs", children: operations.length })] }), _jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "operations", className: "tab-content", children: renderOperations() }), _jsx(TabsContent, { value: "templates", className: "tab-content", children: renderTemplates() }), _jsx(TabsContent, { value: "analytics", className: "tab-content", children: renderAnalytics() })] }), selectedOperation && ()
            < OperationDetailModal, "operation=", selectedOperation, "onClose=", () => setSelectedOperation(null), "onExecute=", handleExecuteOperation, "onRollback=", handleRollbackOperation, "userRole=", userRole, "/> )}", isCreating && renderCreateOperation(), _jsx("style", { children: `
        .bulk-update-dashboard {
          max-width: 1400px;,
  margin: 0 auto;
          padding: 1.5rem;,
  display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;,
  gap: 1rem;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;,
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .operations-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;,
  gap: 1rem;
          padding: 1rem;,
  background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        .search-filters {
          display: flex;
          align-items: center;,
  gap: 0.75rem;
        .search-bar {
          position: relative;,
  display: flex;
          align-items: center;
        .search-bar .lucide {
          position: absolute;,
  left: 0.75rem;
          z-index: 1;
        .search-input {
          padding-left: 2.25rem;
          min-width: 300px;
        .action-buttons {
          display: flex;,
  gap: 0.5rem;
        .operations-list {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .templates-section {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .templates-header h3 {
          font-size: 1.25rem;
          font-weight: 600;,
  color: #1f2937;
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        .analytics-section {
          display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        .metric-item {
          display: flex;
          align-items: flex-start;,
  gap: 0.75rem;
        .metric-info {
          flex: 1;
        .metric-label {
          font-size: 0.875rem;,
  color: #6b7280;
          margin-bottom: 0.25rem;
        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;,
  color: #1f2937;
          margin-bottom: 0.25rem;
        .metric-change {
          font-size: 0.75rem;,
  color: #6b7280;
        .metric-change.positive {
          color: #059669;
        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;,
  gap: 1rem;
        .success-rate-chart {
          display: flex;
          flex-direction: column;,
  gap: 0.75rem;
        .chart-item {
          display: flex;
          align-items: center;,
  gap: 1rem;
        .chart-label {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          min-width: 120px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        .chart-bar {
          flex: 1;,
  height: 8px;
          background: #e5e7eb;
          border-radius: 4px;,
  overflow: hidden;
        .chart-fill {
          height: 100%;,
  transition: width 0.3s ease;
        .chart-value {
          min-width: 80px;
          text-align: right;
          font-weight: 600;
          font-size: 0.875rem;
        .chart-details {
          font-size: 0.75rem;,
  color: #6b7280;
          margin-left: 0.25rem;
        .errors-list {
          display: flex;
          flex-direction: column;,
  gap: 0.75rem;
        .error-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;,
  padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        .error-type {
          font-weight: 600;,
  color: #dc2626;
          margin-bottom: 0.25rem;
        .error-message {
          font-size: 0.875rem;,
  color: #374151;
        .error-stats {
          text-align: right;
          font-size: 0.75rem;,
  color: #6b7280;
        .error-count {
          font-weight: 500;,
  color: #1f2937;
        .create-operation-modal {
          position: fixed;,
  inset: 0;
          z-index: 1000;
        .modal-overlay {
          position: absolute;,
  inset: 0;
          background: rgba(0, 0, 0, 0.5);
        .modal-content {
          position: absolute;,
  top: 50%;
          left: 50%;,
  transform: translate(-50%, -50%);
          background: white;
          border-radius: 8px;,
  width: 90vw;
          max-width: 800px;
          max-height: 80vh;,
  overflow: auto;
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;,
  padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;,
  color: #1f2937;
        .modal-body {
          padding: 1.5rem;
        .form-section {
          margin-bottom: 1.5rem;
        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 1rem;
        .form-group {
          margin-bottom: 1rem;
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;,
  color: #374151;
          margin-bottom: 0.5rem;
        .form-checkboxes {
          display: flex;
          flex-direction: column;,
  gap: 0.5rem;
        .checkbox-item {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          font-size: 0.875rem;
        .updates-list {
          display: flex;
          flex-direction: column;,
  gap: 0.75rem;
        .update-item {
          padding: 0.75rem;,
  border: 1px solid #e5e7eb;
          border-radius: 6px;
        .update-fields {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;,
  gap: 0.5rem;
          align-items: center;
        .modal-footer {
          display: flex;
          justify-content: flex-end;,
  gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        .empty-state {
          text-align: center;,
  padding: 4rem 2rem;
          color: #6b7280;
        .empty-state h3 {
          color: #1f2937;
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          .operations-controls {
            flex-direction: column;
            align-items: stretch;,
  gap: 0.75rem;
          .search-filters {
            flex-direction: column;
            align-items: stretch;
          .search-input {
            min-width: auto;
          .charts-section {
            grid-template-columns: 1fr;
          .analytics-grid {
            grid-template-columns: repeat(2, 1fr);
          .templates-grid {
            grid-template-columns: 1fr;
          .update-fields {
            grid-template-columns: 1fr;,
  gap: 0.5rem;
          .chart-item {
            flex-direction: column;
            align-items: stretch;,
  gap: 0.5rem;
          .chart-label {
            min-width: auto;
          .chart-value {
            min-width: auto;
            text-align: left;
        @media (max-width: 480px) {
          .analytics-grid {
            grid-template-columns: 1fr;
      ` })] });
;
;
{
    const statusConfig = STATUS_CONFIG[operation.status];
    const StatusIcon = statusConfig.icon;
    const progressPercentage = operation.progress.total > 0;
    (operation.progress.completed / operation.progress.total) * 100;
    0;
    const canExecute = userRole === 'admin' && operation.status === 'validated';
    const canRollback = userRole === 'admin' && operation.status === 'completed' && operation.rollback.enabled;
    return;
    _jsxs(Card, { className: "operation-card", children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "operation-header", children: [_jsxs("div", { className: "operation-info", children: [_jsx("div", { className: "operation-name", children: operation.name }), _jsxs("div", { className: "operation-description", children: [operation.targets.length, " targets, ", operation.updates.length, " updates"] })] }), _jsxs(Badge, { className: statusConfig.color, children: [_jsx(StatusIcon, { className: "w-3 h-3 mr-1" }), operation.status.replace('_', ' ').toUpperCase()] })] }), operation.status === 'executing' && ()
                        < div, " className=\"operation-progress\">", _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${progressPercentage}%` } }) }), _jsxs("div", { className: "progress-text", children: [operation.progress.completed, " / ", operation.progress.total, " completed"] })] }), ")}", _jsxs("div", { className: "operation-actions", children: [_jsxs(Button, { onClick: () => onSelect(operation), variant: "outline", size: "sm", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "Details"] }), canExecute && ()
                        < Button, " onClick=", () => onExecute(operation.id), " size=\"sm\">", _jsx(Play, { className: "w-4 h-4 mr-1" }), "Execute"] }), ")}", canRollback && ()
                < Button, " onClick=", () => onRollback(operation.id), " size=\"sm\" variant=\"outline\">", _jsx(RotateCcw, { className: "w-4 h-4 mr-1" }), "Rollback"] });
}
div >
;
CardContent >
    _jsx("style", { children: `
        .operation-card {
          transition: box-shadow 0.2s ease;
        .operation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        .operation-name {
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 0.25rem;
        .operation-description {
          font-size: 0.875rem;,
  color: #6b7280;
        .operation-progress {
          margin-bottom: 1rem;
        .progress-bar {
          height: 4px;,
  background: #e5e7eb;
          border-radius: 2px;,
  overflow: hidden;
          margin-bottom: 0.5rem;
        .progress-fill {
          height: 100%;,
  background: #3b82f6;
          transition: width 0.3s ease;
        .progress-text {
          font-size: 0.875rem;,
  color: #6b7280;
        .operation-actions {
          display: flex;,
  gap: 0.5rem;
      ` });
Card >
;
;
;
const TemplateCard = ({ template, onUse, onEdit, onDelete }) => {
    const typeConfig = TARGET_TYPE_CONFIG[template.targetType];
    const TypeIcon = typeConfig.icon;
    return;
    _jsxs(Card, { className: "template-card", children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "template-header", children: [_jsxs("div", { className: "template-info", children: [_jsx("div", { className: "template-name", children: template.name }), _jsx("div", { className: "template-description", children: template.description })] }), _jsxs(Badge, { className: typeConfig.color, children: [_jsx(TypeIcon, { className: "w-3 h-3 mr-1" }), template.targetType] })] }), _jsxs("div", { className: "template-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Updates:" }), _jsx("span", { className: "stat-value", children: template.updates.length })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Used:" }), _jsxs("span", { className: "stat-value", children: [template.usageCount, " times"] })] })] }), _jsxs("div", { className: "template-actions", children: [_jsx(Button, { onClick: () => onUse(template.id), size: "sm", children: "Use Template" }), _jsxs(Button, { onClick: () => onEdit(template.id), size: "sm", variant: "outline", children: [_jsx(Edit, { className: "w-4 h-4 mr-1" }), "Edit"] }), _jsx(Button, { onClick: () => onDelete(template.id), size: "sm", variant: "outline", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }), _jsx("style", { children: `
        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        .template-name {
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 0.25rem;
        .template-description {
          font-size: 0.875rem;,
  color: #6b7280;
        .template-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;,
  padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        .stat-item {
          font-size: 0.875rem;
        .stat-label {
          color: #6b7280;
        .stat-value {
          color: #1f2937;
          font-weight: 500;
          margin-left: 0.25rem;
        .template-actions {
          display: flex;,
  gap: 0.5rem;
      ` })] });
};
;
;
{
    const statusConfig = STATUS_CONFIG[operation.status];
    const StatusIcon = statusConfig.icon;
    return;
    _jsxs("div", { className: "modal-overlay", children: [_jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: [_jsx("h2", { children: operation.name }), _jsxs(Badge, { className: statusConfig.color, children: [_jsx(StatusIcon, { className: "w-4 h-4 mr-1" }), operation.status.replace('_', ' ').toUpperCase()] })] }), _jsx(Button, { onClick: onClose, variant: "outline", size: "sm", children: "\u2715" })] }), _jsx("div", { className: "modal-body", children: _jsxs("div", { className: "operation-details", children: [_jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Operation Info" }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Name:" }), _jsx("span", { children: operation.name })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Status:" }), _jsx(Badge, { className: statusConfig.color, children: operation.status })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Targets:" }), _jsx("span", { children: operation.targets.length })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Updates:" }), _jsx("span", { children: operation.updates.length })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Created:" }), _jsx("span", { children: operation.createdAt.toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Created By:" }), _jsx("span", { children: operation.createdBy })] })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Progress" }), _jsx("div", { className: "progress-details", children: _jsxs("div", { className: "progress-stats", children: [_jsxs("div", { className: "progress-stat", children: [_jsx("span", { className: "stat-label", children: "Total:" }), _jsx("span", { className: "stat-value", children: operation.progress.total })] }), _jsxs("div", { className: "progress-stat", children: [_jsx("span", { className: "stat-label", children: "Completed:" }), _jsx("span", { className: "stat-value success", children: operation.progress.completed })] }), _jsxs("div", { className: "progress-stat", children: [_jsx("span", { className: "stat-label", children: "Failed:" }), _jsx("span", { className: "stat-value error", children: operation.progress.failed })] })] }) })] })] }) }), _jsxs("div", { className: "modal-footer", children: [_jsx(Button, { onClick: onClose, variant: "outline", children: "Close" }), userRole === 'admin' && operation.status === 'validated' && ()
                                < Button, " onClick=", () => { onExecute(operation.id); onClose(); }, "> Execute Operation"] }), ")}", userRole === 'admin' && operation.status === 'completed' && operation.rollback.enabled && ()
                        < Button, " onClick=", () => { onRollback(operation.id); onClose(); }, " variant=\"outline\"> Rollback Operation"] }), ")}"] });
    div >
        _jsx("style", { children: `
        .modal-overlay {
          position: fixed;,
  inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        .modal-content {
          background: white;
          border-radius: 8px;,
  width: 90vw;
          max-width: 700px;
          max-height: 80vh;,
  overflow: auto;
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;,
  padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        .modal-title {
          display: flex;
          align-items: center;,
  gap: 1rem;
        .modal-title h2 {
          font-size: 1.25rem;
          font-weight: 600;,
  color: #1f2937;
        .modal-body {
          padding: 1.5rem;
        .operation-details {
          display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;,
  gap: 1rem;
        .detail-item {
          display: flex;
          flex-direction: column;,
  gap: 0.25rem;
        .detail-item label {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
        .detail-item span {
          color: #1f2937;
          font-size: 0.875rem;
        .progress-stats {
          display: flex;,
  gap: 1rem;
        .progress-stat {
          display: flex;
          align-items: center;,
  gap: 0.25rem;
          font-size: 0.875rem;
        .stat-label {
          color: #6b7280;
        .stat-value {
          font-weight: 600;
        .stat-value.success {
          color: #059669;
        .stat-value.error {
          color: #dc2626;
        .modal-footer {
          display: flex;
          justify-content: flex-end;,
  gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          .modal-content {
            width: 95vw;
            max-height: 90vh;
          .progress-stats {
            flex-direction: column;
            align-items: stretch;
      ` });
    div >
    ;
    ;
}
;
export default BulkPropertyUpdateDashboard;
