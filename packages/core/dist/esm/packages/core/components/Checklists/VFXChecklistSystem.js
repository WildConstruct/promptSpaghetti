import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * VFX Checklist System - E17-1753114397304-B22E55
 *
 * Professional checklist management for VFX director workflows.
 * Supports hierarchical tasks, team collaboration, asset tracking, and quality assurance.
 */
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { CheckSquare, Plus, Edit3, Trash2, RotateCw, Timer, Calendar, Users, FileText, AlertTriangle, CheckCircle, Clock, Eye, Filter, Search, BarChart3, Zap, Camera, Film, Palette } from 'lucide-react';
reactions: {
    [emoji, string];
    VFXTeamMember;
}
;
// Status configurations with VFX-specific colors and labels
const STATUS_CONFIG = {};
pending: {
    color: '#6b7280', label;
    'Pending', icon;
    Clock;
}
in_progress: {
    color: '#f59e0b', label;
    'In Progress', icon;
    Timer;
}
review: {
    color: '#3b82f6', label;
    'In Review', icon;
    Eye;
}
approved: {
    color: '#10b981', label;
    'Approved', icon;
    CheckCircle;
}
rejected: {
    color: '#ef4444', label;
    'Rejected', icon;
    AlertTriangle;
}
blocked: {
    color: '#8b5cf6', label;
    'Blocked', icon;
    AlertTriangle;
}
;
const PRIORITY_CONFIG = {
    low: { color: '#10b981', label: 'Low' },
    medium: { color: '#f59e0b', label: 'Medium' },
    high: { color: '#ef4444', label: 'High' },
    critical: { color: '#dc2626', label: 'Critical' }
};
const VFX_CATEGORIES = [
    { value: 'pre_production', label: 'Pre-Production', icon: FileText },
    { value: 'asset_creation', label: 'Asset Creation', icon: Palette },
    { value: 'animation', label: 'Animation', icon: Film },
    { value: 'fx', label: 'VFX', icon: Zap },
    { value: 'lighting', label: 'Lighting', icon: Camera },
    { value: 'compositing', label: 'Compositing', icon: Palette },
    { value: 'rendering', label: 'Rendering', icon: BarChart3 },
    { value: 'post_production', label: 'Post-Production', icon: Edit3 },
    { value: 'review', label: 'Review', icon: Eye },
    { value: 'delivery', label: 'Delivery', icon: CheckCircle }
];
const VFX_PRODUCTION_PHASES = [
    { value: 'concept', label: 'Concept' },
    { value: 'previs', label: 'Previz' },
    { value: 'asset_build', label: 'Asset Build' },
    { value: 'animation', label: 'Animation' },
    { value: 'fx', label: 'FX' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'comp', label: 'Compositing' },
    { value: 'render', label: 'Render' },
    { value: 'review', label: 'Review' },
    { value: 'final', label: 'Final' }
];
export const VFXChecklistSystem = ({
    checklist,
    currentUser,
    onChecklistUpdate,
    onItemCreate,
    onItemUpdate,
    onItemDelete,
    onCommentCreate,
    readonly = false,
    showStatistics = true,
    compactView = false,
    className = ''
});
{
    // UI state
    const [_____selectedTab, _____setSelectedTab] = useState('overview');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [assigneeFilter, _____setAssigneeFilter] = useState('all');
    const [showCompleted, setShowCompleted] = useState(true);
    const [sortBy, setSortBy] = useState('priority');
    const [sortOrder, setSortOrder] = useState('desc');
    // Creation state
    const [isCreating, setIsCreating] = useState(false);
    const [newItemTemplate, setNewItemTemplate] = useState({});
    title: '',
        description;
    '',
        priority;
    'medium',
        category;
    'asset_creation',
        vfxPhase;
    'asset_build',
        subtasks;
    [],
        tags;
    [],
        dependencies;
    [],
    ;
}
;
// Filtered and sorted items
const filteredItems = useMemo(() => {
    const filtered = checklist.items.filter(item => { });
    // Search filter
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
        // Status filter
        if (statusFilter !== 'all' && item.status !== statusFilter)
            return false;
        // Priority filter
        if (priorityFilter !== 'all' && item.priority !== priorityFilter)
            return false;
        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter)
            return false;
        // Assignee filter
        if (assigneeFilter !== 'all' && item.assignee?.id !== assigneeFilter)
            return false;
        // Completed items filter
        if (!showCompleted && item.status === 'approved')
            return false;
        return true;
    }
});
// Sort items
filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
        case 'priority':
            const priorityOrder = ['critical', 'high', 'medium', 'low'];
            comparison = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
            break;
        case 'dueDate':
            const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            comparison = aDate - bDate;
            break;
        case 'status':
            const statusOrder = ['blocked', 'rejected', 'pending', 'in_progress', 'review', 'approved'];
            comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
            break;
        case 'progress':
            comparison = a.completion - b.completion;
            break;
            return sortOrder === 'asc' ? comparison : -comparison;
    }
});
return filtered;
[checklist.items, searchTerm, statusFilter, priorityFilter, categoryFilter, assigneeFilter, showCompleted, sortBy, sortOrder];
;
// Statistics
const statistics = useMemo(() => {
    const total = checklist.items.length;
    const completed = checklist.items.filter(item => item.status === 'approved').length;
    const inProgress = checklist.items.filter(item => item.status === 'in_progress').length;
    const review = checklist.items.filter(item => item.status === 'review').length;
    const blocked = checklist.items.filter(item => item.status === 'blocked').length;
    const critical = checklist.items.filter(item => item.priority === 'critical').length;
    const overdue = checklist.items.filter(item => );
});
item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'approved';
length;
const totalEstimated = checklist.items.reduce((sum, item) => sum + (item.estimatedHours || 0), 0);
const totalActual = checklist.items.reduce((sum, item) => sum + (item.actualHours || 0), 0);
const avgProgress = total > 0 ? checklist.items.reduce((sum, item) => sum + item.completion, 0) / total : 0;
return {
    total,
    completed,
    inProgress,
    review,
    blocked,
    critical,
    overdue,
    totalEstimated,
    totalActual,
    avgProgress,
    efficiency: totalEstimated > 0 ? ((totalEstimated - totalActual) / totalEstimated) * 100 : 0,
};
[checklist.items];
;
// Handle item status change
const handleStatusChange = useCallback((itemId, newStatus) => {
    const updates = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
    };
    // Auto-complete when approved
    if (newStatus === 'approved') {
        updates.completion = 100;
        onItemUpdate(itemId, updates);
    }
    [onItemUpdate];
});
// Handle priority change
const handlePriorityChange = useCallback((itemId, newPriority) => {
    onItemUpdate(itemId, {});
    priority: newPriority,
        updatedAt;
    new Date().toISOString(),
    ;
});
[onItemUpdate];
;
// Handle assignee change
const handleAssigneeChange = useCallback((itemId, assigneeId) => {
    const assignee = checklist.team.find(member => member.id === assigneeId);
    onItemUpdate(itemId, {});
    assignee,
        updatedAt;
    new Date().toISOString(),
    ;
});
[checklist.team, onItemUpdate];
;
// Handle progress change
const handleProgressChange = useCallback((itemId, completion) => {
    const updates = {
        completion,
        updatedAt: new Date().toISOString(),
    };
    // Auto-approve when 100% complete
    if (completion === 100 && currentUser.permissions.canApprove) {
        updates.status = 'approved';
        onItemUpdate(itemId, updates);
    }
    [currentUser.permissions.canApprove, onItemUpdate];
});
// Create new item
const handleCreateItem = useCallback(() => {
    if (!newItemTemplate.title?.trim())
        return;
    const newItem = {
        ...newItemTemplate,
        title: newItemTemplate.title.trim(),
        status: 'pending',
        completion: 0,
        author: currentUser,
        subtasks: [],
        attachments: [],
        assets: [],
        qualityGates: [],
        comments: [],
        dependencies: newItemTemplate.dependencies || [],
        tags: newItemTemplate.tags || [],
    };
    onItemCreate(newItem);
    setIsCreating(false);
    setNewItemTemplate({});
    title: '',
        description;
    '',
        priority;
    'medium',
        category;
    'asset_creation',
        vfxPhase;
    'asset_build',
        subtasks;
    [],
        tags;
    [],
        dependencies;
    [],
    ;
});
[newItemTemplate, currentUser, onItemCreate];
;
return;
_jsxs("div", { className: `vfx-checklist-system ${className}`, children: ["}", _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckSquare, { className: "w-6 h-6 text-blue-600" }), _jsxs("div", { children: [_jsx("span", { className: "text-xl", children: checklist.name }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [checklist.project, checklist.scene && ` • Scene: ${checklist.scene}`, checklist.shot && ` • Shot: ${checklist.shot}`] })] }), _jsxs(Badge, { variant: "secondary", className: "ml-2", children: [statistics.completed, "/", statistics.total, " Complete"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowFilters(!showFilters), children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Filters"] }), !readonly && currentUser.permissions.canCreate && ()
                                        < Button, "variant=\"default\" size=\"sm\" onClick=", () => setIsCreating(true), ">", _jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Item"] }), ")}"] }) }), showStatistics && ()
                    < div, " className=\"grid grid-cols-2 md:grid-cols-6 gap-3 mt-4\">", _jsxs("div", { className: "bg-blue-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: statistics.total }), _jsx("div", { className: "text-xs text-blue-700", children: "Total Items" })] }), _jsxs("div", { className: "bg-green-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-green-900", children: statistics.completed }), _jsx("div", { className: "text-xs text-green-700", children: "Completed" })] }), _jsxs("div", { className: "bg-amber-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-amber-900", children: statistics.inProgress }), _jsx("div", { className: "text-xs text-amber-700", children: "In Progress" })] }), _jsxs("div", { className: "bg-red-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-red-900", children: statistics.critical }), _jsx("div", { className: "text-xs text-red-700", children: "Critical" })] }), _jsxs("div", { className: "bg-purple-50 p-3 rounded-lg text-center", children: [_jsxs("div", { className: "text-lg font-bold text-purple-900", children: [Math.round(statistics.avgProgress), "%"] }), _jsx("div", { className: "text-xs text-purple-700", children: "Avg Progress" })] }), _jsxs("div", { className: "bg-gray-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-gray-900", children: statistics.overdue }), _jsx("div", { className: "text-xs text-gray-700", children: "Overdue" })] })] })] });
CardHeader >
    (_jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: showFilters && ()
                < Card >
                (_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Filters & Search" }) })
                    ,
                        _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Search" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search items...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Status" }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), Object.entries(STATUS_CONFIG).map(([status, config]) => ()
                                                                    < SelectItem, key = { status }, value = { status } > { config, : .label })] }), "))}"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Priority" }), _jsxs(Select, { value: priorityFilter, onValueChange: setPriorityFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Priorities" }), Object.entries(PRIORITY_CONFIG).map(([priority, config]) => ()
                                                            < SelectItem, key = { priority }, value = { priority } > { config, : .label })] }), "))}"] })] })] })
                            ,
                                _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Category" }), _jsxs(Select, { value: categoryFilter, onValueChange: setCategoryFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), VFX_CATEGORIES.map(category => ()
                                                            < SelectItem, key = { category, : .value }, value = { category, : .value } > { category, : .label })] }), "))}"] })] })) }) })
        ,
            _jsxs("div", { className: "flex items-center gap-6 mt-4 pt-4 border-t", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: showCompleted, onCheckedChange: setShowCompleted }), _jsx("span", { className: "text-sm", children: "Show Completed" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm", children: "Sort by:" }), _jsxs(Select, { value: sortBy, onValueChange: (value) => setSortBy(value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "priority", children: "Priority" }), _jsx(SelectItem, { value: "dueDate", children: "Due Date" }), _jsx(SelectItem, { value: "status", children: "Status" }), _jsx(SelectItem, { value: "progress", children: "Progress" })] })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'), children: [_jsx(RotateCw, { className: `w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}` }), "}"] })] })] }));
CardContent >
;
Card >
;
{ /* Create New Item */ }
{
    isCreating && ()
        < Card >
        (_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Create New Checklist Item" }) })
            ,
                _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Title*" }), _jsx("input", { type: "text", value: newItemTemplate.title || '', onChange: (e) => setNewItemTemplate(prev => ({ ...prev, title: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm", placeholder: "Enter checklist item title" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Priority" }), _jsxs(Select, { value: newItemTemplate.priority, onValueChange: (value) => setNewItemTemplate(prev => ({ ...prev, priority: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(PRIORITY_CONFIG).map(([priority, config]) => ()
                                                        < SelectItem, key = { priority }, value = { priority } > { config, : .label }) }), "))}"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Category" }), _jsxs(Select, { value: newItemTemplate.category, onValueChange: (value) => setNewItemTemplate(prev => ({ ...prev, category: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: VFX_CATEGORIES.map(category => ()
                                                < SelectItem, key = { category, : .value }, value = { category, : .value } > { category, : .label }) }), "))}"] })] })] })
                    ,
                        _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "VFX Phase" }), _jsxs(Select, { value: newItemTemplate.vfxPhase, onValueChange: (value) => setNewItemTemplate(prev => ({ ...prev, vfxPhase: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: VFX_PRODUCTION_PHASES.map(phase => ()
                                                < SelectItem, key = { phase, : .value }, value = { phase, : .value } > { phase, : .label }) }), "))}"] })] }));
    div >
    ;
    div >
        (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Description" }), _jsx("textarea", { value: newItemTemplate.description || '', onChange: (e) => setNewItemTemplate(prev => ({ ...prev, description: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20", placeholder: "Optional description..." })] })
            ,
                _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setIsCreating(false), children: "Cancel" }), _jsx(Button, { variant: "default", size: "sm", onClick: handleCreateItem, disabled: !newItemTemplate.title?.trim(), children: "Create Item" })] }));
    CardContent >
    ;
    Card >
    ;
}
{ /* Checklist Items */ }
_jsxs("div", { className: "space-y-3", children: [filteredItems.length === 0 ? ()
            < Card >
            _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [_jsx(CheckSquare, { className: "w-16 h-16 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Items Found" }), _jsx("p", { className: "text-gray-600 text-center", children: checklist.items.length === 0
                            ? 'This checklist doesn\'t have any items yet.'
                            : 'No items match your current filters.' }), checklist.items.length === 0 && !readonly && currentUser.permissions.canCreate && ()
                        < Button, "variant=\"default\" onClick=", () => setIsCreating(true), "className=\"mt-4\" >", _jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add First Item"] })
            :
        , ")}"] });
Card >
;
();
filteredItems.map(item => ()
    < VFXChecklistItemCard, key = { item, : .id }, item = { item }, checklist = { checklist }, currentUser = { currentUser }, onStatusChange = { handleStatusChange }, onPriorityChange = { handlePriorityChange }, onAssigneeChange = { handleAssigneeChange }, onProgressChange = { handleProgressChange }, onCommentCreate = { onCommentCreate }, onItemUpdate = { onItemUpdate }, onItemDelete = { onItemDelete }, readonly = { readonly }, compact = { compactView }, isSelected = { selectedItem } === item.id, onSelect = {}(), setSelectedItem(selectedItem === item.id ? null : item.id), />);
div >
;
div >
;
CardContent >
;
Card >
;
div >
;
;
;
{
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const statusConfig = STATUS_CONFIG[item.status];
    const priorityConfig = PRIORITY_CONFIG[item.priority];
    const StatusIcon = statusConfig.icon;
    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'approved';
    const canEdit = !readonly && (currentUser.permissions.canEdit || item.author.id === currentUser.id);
    const ___canApprove = !readonly && currentUser.permissions.___canApprove;
    const handleCommentSubmit = useCallback(() => {
        if (!newComment.trim())
            return;
        onCommentCreate(item.id, {});
        content: newComment.trim(),
            author;
        currentUser,
            type;
        'comment',
            mentions;
        [],
            reactions;
        { }
    });
    setNewComment('');
}
[newComment, item.id, currentUser, onCommentCreate];
;
return;
_jsxs(Card, { className: `checklist-item ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isOverdue ? 'border-red-300' : ''}`, children: ["}", _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: _jsx("button", { onClick: () => onStatusChange(item.id, item.status === 'approved' ? 'pending' : 'approved'), disabled: readonly, className: `w-5 h-5 border-2 rounded flex items-center justify-center ${item.status === 'approved'
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-gray-400',
                                }`, children: item.status === 'approved' && _jsx(CheckSquare, { className: "w-3 h-3" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: `font-medium ${item.status === 'approved' ? 'line-through text-gray-500' : 'text-gray-900'}`, children: ["}", item.title] }), item.description && ()
                                                    < p, " className=\"text-sm text-gray-600 mt-1\">", item.description] }), ")}"] }), _jsxs("div", { className: "flex items-center gap-2 ml-4", children: [_jsxs(Badge, { variant: "secondary", style: { backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }, className: "flex items-center gap-1", children: [_jsx(StatusIcon, { className: "w-3 h-3" }), statusConfig.label] }), _jsx(Badge, { variant: "secondary", style: { backgroundColor: `${priorityConfig.color}20`, color: priorityConfig.color }, children: priorityConfig.label }), isOverdue && ()
                                            < Badge, " variant=\"destructive\" className=\"flex items-center gap-1\">", _jsx(AlertTriangle, { className: "w-3 h-3" }), "Overdue"] }), ")}"] })] }), !compact && ()
                    < div, " className=\"mt-3\">", _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-600 mb-1", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [item.completion, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all", style: { width: `${item.completion}%` } }) })] }), ")}", !compact && ()
            < div, " className=\"flex items-center gap-4 mt-3 text-xs text-gray-500\">", item.assignee && ()
            < div, " className=\"flex items-center gap-1\">", _jsx(Users, { className: "w-3 h-3" }), _jsx("span", { children: item.assignee.name })] });
{
    item.dueDate && ()
        < div;
    className = "flex items-center gap-1" >
        (_jsx(Calendar, { className: "w-3 h-3" })
            ,
                _jsx("span", { children: new Date(item.dueDate).toLocaleDateString() }));
    div >
    ;
}
{
    item.estimatedHours && ()
        < div;
    className = "flex items-center gap-1" >
        (_jsx(Timer, { className: "w-3 h-3" })
            ,
                _jsxs("span", { children: [item.estimatedHours, "h est."] }));
    div >
    ;
}
{
    item.comments.length > 0 && ()
        < div;
    className = "flex items-center gap-1" >
        (_jsx(FileText, { className: "w-3 h-3" })
            ,
                _jsxs("span", { children: [item.comments.length, " comments"] }));
    div >
    ;
}
{
    item.subtasks.length > 0 && ()
        < div;
    className = "flex items-center gap-1" >
        (_jsx(CheckSquare, { className: "w-3 h-3" })
            ,
                _jsxs("span", { children: [item.subtasks.filter(t => t.completed).length, "/", item.subtasks.length, " subtasks"] }));
    div >
    ;
}
div >
;
{ /* Subtasks */ }
{
    !compact && item.subtasks.length > 0 && ()
        < div;
    className = "mt-3 pl-4 border-l-2 border-gray-200" >
        _jsxs("div", { className: "space-y-1", children: [item.subtasks.slice(0, 3).map(subtask => ()
                    < div, key = { subtask, : .id }, className = "flex items-center gap-2 text-sm" >
                    _jsx("input", { type: "checkbox", checked: subtask.completed, onChange: () => {
                            const updatedSubtasks = item.subtasks.map(st => );
                        } })), "; st.id === subtask.id ? ", ...(st, completed), ": !st.completed } : st ); onItemUpdate(item.id, ", subtasks, ": updatedSubtasks }); }} disabled=", readonly, "className=\"w-3 h-3\" />", _jsx("span", { className: subtask.completed ? 'line-through text-gray-500' : 'text-gray-700', children: subtask.title })] });
}
{
    item.subtasks.length > 3 && ()
        < div;
    className = "text-xs text-gray-500" >
        +{ item, : .subtasks.length - 3 };
    more;
    subtasks;
    div >
    ;
}
div >
;
div >
;
{ /* Actions */ }
{
    !compact && ()
        < div;
    className = "flex items-center justify-between mt-3" >
        _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setShowComments(!showComments), children: [_jsx(FileText, { className: "w-4 h-4 mr-1" }), "Comments (", item.comments.length, ")"] }), onSelect && ()
                    < Button, "variant=\"ghost\" size=\"sm\" onClick=", onSelect, ">", _jsx(Eye, { className: "w-4 h-4 mr-1" }), isSelected ? 'Hide' : 'Details'] });
}
div >
    { canEdit } && ()
    < div;
className = "flex items-center gap-1" >
    (_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit3, { className: "w-4 h-4" }) })
        ,
            _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onItemDelete(item.id), children: _jsx(Trash2, { className: "w-4 h-4" }) }));
div >
;
div >
;
{ /* Comments Section */ }
{
    showComments && ()
        < div;
    className = "mt-4 pt-4 border-t space-y-3" >
        { item, : .comments.map(comment => ()
                < div, key = { comment, : .id }, className = "flex gap-3" >
                (_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white", style: { backgroundColor: comment.author.color }, children: comment.author.name.charAt(0) }) })
                    ,
                        _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium", children: comment.author.name }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(comment.timestamp).toLocaleDateString() })] }), _jsx("p", { className: "text-sm text-gray-700 mt-1", children: comment.content })] })), div >
            ) };
    {
        !readonly && ()
            < div;
        className = "flex gap-3" >
            (_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white", style: { backgroundColor: currentUser.color }, children: currentUser.name.charAt(0) }) })
                ,
                    _jsxs("div", { className: "flex-1", children: [_jsx("textarea", { value: newComment, onChange: (e) => setNewComment(e.target.value), placeholder: "Add a comment...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-16" }), _jsx("div", { className: "flex justify-end mt-2", children: _jsx(Button, { variant: "default", size: "sm", onClick: handleCommentSubmit, disabled: !newComment.trim(), children: "Comment" }) })] }));
        div >
        ;
    }
    div >
    ;
}
div >
;
div >
;
CardContent >
;
Card >
;
;
;
export default VFXChecklistSystem;
