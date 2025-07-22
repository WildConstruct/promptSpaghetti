import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Node-Level Annotations System - E17-1753114397305-79782A
 *
 * Professional annotation tools for individual nodes in the VFX pipeline.
 * Supports performance notes, creative direction, technical specs, and director approvals.
 */
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { MessageCircle, CheckCircle, Clock, User, Camera, Zap, Settings, FileText, Link, Image as ImageIcon, Pause, X, Eye, EyeOff, Edit3, Save, MoreHorizontal } from 'lucide-react';
// Annotation type configurations
const ANNOTATION_TYPES = {
    performance: {
        icon: _jsx(Zap, { className: "w-4 h-4" }),
        color: '#f59e0b',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        label: 'Performance'
    },
    creative: {
        icon: _jsx(Camera, { className: "w-4 h-4" }),
        color: '#8b5cf6',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: 'Creative'
    },
    technical: {
        icon: _jsx(Settings, { className: "w-4 h-4" }),
        color: '#6b7280',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Technical'
    },
    review: {
        icon: _jsx(Eye, { className: "w-4 h-4" }),
        color: '#3b82f6',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Review'
    },
    approval: {
        icon: _jsx(CheckCircle, { className: "w-4 h-4" }),
        color: '#10b981',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Approval'
    },
    question: {
        icon: _jsx(MessageCircle, { className: "w-4 h-4" }),
        color: '#06b6d4',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        label: 'Question'
    },
    reference: {
        icon: _jsx(FileText, { className: "w-4 h-4" }),
        color: '#84cc16',
        bgColor: 'bg-lime-50',
        borderColor: 'border-lime-200',
        label: 'Reference'
    }
};
const STATUS_CONFIGS = {
    open: { icon: _jsx(MessageCircle, { className: "w-3 h-3" }), color: '#6b7280', label: 'Open' },
    in_progress: { icon: _jsx(Clock, { className: "w-3 h-3" }), color: '#f59e0b', label: 'In Progress' },
    resolved: { icon: _jsx(CheckCircle, { className: "w-3 h-3" }), color: '#10b981', label: 'Resolved' },
    approved: { icon: _jsx(CheckCircle, { className: "w-3 h-3" }), color: '#059669', label: 'Approved' },
    rejected: { icon: _jsx(X, { className: "w-3 h-3" }), color: '#ef4444', label: 'Rejected' },
    on_hold: { icon: _jsx(Pause, { className: "w-3 h-3" }), color: '#8b5cf6', label: 'On Hold' }
};
const PRIORITY_CONFIGS = {
    low: { color: '#6b7280', bg: 'bg-gray-100', label: 'Low' },
    medium: { color: '#f59e0b', bg: 'bg-amber-100', label: 'Medium' },
    high: { color: '#ef4444', bg: 'bg-red-100', label: 'High' },
    critical: { color: '#dc2626', bg: 'bg-red-200', label: 'Critical' }
};
export const NodeAnnotationSystem = ({ nodeId, nodeName, nodeType, annotations, currentUser, onAnnotationCreate, onAnnotationUpdate, onAnnotationDelete, onReplyCreate, className = '', compact = false }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [sortBy, setSortBy] = useState('timestamp');
    const [showResolved, setShowResolved] = useState(false);
    // New annotation form state
    const [newAnnotation, setNewAnnotation] = useState({
        type: 'review',
        content: '',
        priority: 'medium',
        visibility: 'public',
        tags: [],
        estimatedTime: undefined,
        deadline: undefined,
        assignee: undefined
    });
    // Filter and sort annotations
    const filteredAndSortedAnnotations = useMemo(() => {
        let filtered = annotations.filter(annotation => {
            if (!showResolved && ['resolved', 'approved', 'rejected'].includes(annotation.status))
                return false;
            if (filterType !== 'all' && annotation.type !== filterType)
                return false;
            if (filterStatus !== 'all' && annotation.status !== filterStatus)
                return false;
            if (filterPriority !== 'all' && annotation.priority !== filterPriority)
                return false;
            return true;
        });
        // Sort annotations
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'timestamp':
                default:
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }
        });
        return filtered;
    }, [annotations, showResolved, filterType, filterStatus, filterPriority, sortBy]);
    // Statistics
    const stats = useMemo(() => {
        const total = annotations.length;
        const open = annotations.filter(a => a.status === 'open').length;
        const critical = annotations.filter(a => a.priority === 'critical').length;
        const myAnnotations = annotations.filter(a => a.author.id === currentUser.id).length;
        const assigned = annotations.filter(a => a.assignee?.id === currentUser.id).length;
        return { total, open, critical, myAnnotations, assigned };
    }, [annotations, currentUser.id]);
    const handleCreateAnnotation = useCallback(() => {
        if (!newAnnotation.content.trim())
            return;
        const annotation = {
            nodeId,
            type: newAnnotation.type,
            content: newAnnotation.content.trim(),
            author: currentUser,
            priority: newAnnotation.priority,
            status: 'open',
            attachments: [],
            tags: newAnnotation.tags,
            visibility: newAnnotation.visibility,
            linkedAnnotations: [],
            estimatedTime: newAnnotation.estimatedTime,
            deadline: newAnnotation.deadline,
            assignee: newAnnotation.assignee
        };
        onAnnotationCreate(annotation);
        // Reset form
        setNewAnnotation({
            type: 'review',
            content: '',
            priority: 'medium',
            visibility: 'public',
            tags: [],
            estimatedTime: undefined,
            deadline: undefined,
            assignee: undefined
        });
        setIsCreating(false);
    }, [newAnnotation, nodeId, currentUser, onAnnotationCreate]);
    const handleStatusChange = useCallback((annotationId, status) => {
        onAnnotationUpdate(annotationId, { status, lastModified: new Date().toISOString() });
    }, [onAnnotationUpdate]);
    const handlePriorityChange = useCallback((annotationId, priority) => {
        onAnnotationUpdate(annotationId, { priority, lastModified: new Date().toISOString() });
    }, [onAnnotationUpdate]);
    // Single Annotation Component
    const AnnotationCard = ({ annotation, expanded = false }) => {
        const [showReplies, setShowReplies] = useState(false);
        const [replyContent, setReplyContent] = useState('');
        const typeConfig = ANNOTATION_TYPES[annotation.type];
        const statusConfig = STATUS_CONFIGS[annotation.status];
        const priorityConfig = PRIORITY_CONFIGS[annotation.priority];
        const handleReplySubmit = () => {
            if (!replyContent.trim())
                return;
            onReplyCreate(annotation.id, {
                content: replyContent.trim(),
                author: currentUser
            });
            setReplyContent('');
        };
        return (_jsxs(Card, { className: `annotation-card ${typeConfig.borderColor} ${expanded ? 'ring-2 ring-blue-200' : ''}`, children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1.5 rounded-full", style: { backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }, children: typeConfig.icon }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: typeConfig.label }), _jsx(Badge, { variant: "secondary", className: `text-xs ${priorityConfig.bg}`, style: { color: priorityConfig.color }, children: priorityConfig.label })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 mt-1", children: [_jsx("span", { children: annotation.author.name }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(annotation.timestamp).toLocaleDateString() }), annotation.estimatedTime && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { children: [annotation.estimatedTime, "h est."] })] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: annotation.status, onValueChange: (value) => handleStatusChange(annotation.id, value), children: [_jsx(SelectTrigger, { className: "w-32 h-8", children: _jsxs("div", { className: "flex items-center gap-1", children: [statusConfig.icon, _jsx("span", { className: "text-xs", children: statusConfig.label })] }) }), _jsx(SelectContent, { children: Object.entries(STATUS_CONFIGS).map(([status, config]) => (_jsx(SelectItem, { value: status, children: _jsxs("div", { className: "flex items-center gap-2", children: [config.icon, _jsx("span", { children: config.label })] }) }, status))) })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id), children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) })] })] }) }), _jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-sm text-gray-700 whitespace-pre-wrap", children: annotation.content }), annotation.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1", children: annotation.tags.map(tag => (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["#", tag] }, tag))) })), annotation.attachments.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: annotation.attachments.map(attachment => (_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs", children: [attachment.type === 'image' && _jsx(ImageIcon, { className: "w-3 h-3" }), attachment.type === 'link' && _jsx(Link, { className: "w-3 h-3" }), _jsx("span", { children: attachment.name })] }, attachment.id))) })), (annotation.assignee || annotation.deadline) && (_jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [annotation.assignee && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(User, { className: "w-3 h-3" }), _jsx("span", { children: annotation.assignee.name })] })), annotation.deadline && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: new Date(annotation.deadline).toLocaleDateString() })] }))] })), annotation.replies.length > 0 && (_jsxs("div", { className: "border-t pt-3", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setShowReplies(!showReplies), className: "text-xs", children: [showReplies ? 'Hide' : 'Show', " ", annotation.replies.length, " replies"] }), showReplies && (_jsxs("div", { className: "mt-2 space-y-2", children: [annotation.replies.map(reply => (_jsxs("div", { className: "pl-4 border-l-2 border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 mb-1", children: [_jsx("span", { className: "font-medium", children: reply.author.name }), _jsx("span", { children: new Date(reply.timestamp).toLocaleDateString() })] }), _jsx("div", { className: "text-sm text-gray-700", children: reply.content })] }, reply.id))), _jsxs("div", { className: "flex gap-2 mt-3", children: [_jsx("input", { type: "text", placeholder: "Add a reply...", value: replyContent, onChange: (e) => setReplyContent(e.target.value), className: "flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", onKeyDown: (e) => e.key === 'Enter' && handleReplySubmit() }), _jsx(Button, { size: "sm", onClick: handleReplySubmit, disabled: !replyContent.trim(), children: "Reply" })] })] }))] }))] }) })] }));
    };
    if (compact) {
        // Compact view for inspector panels
        return (_jsxs("div", { className: `node-annotations-compact ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageCircle, { className: "w-4 h-4 text-gray-600" }), _jsxs("span", { className: "text-sm font-medium text-gray-900", children: ["Annotations (", filteredAndSortedAnnotations.length, ")"] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setIsCreating(true), children: _jsx("span", { className: "text-xs", children: "Add" }) })] }), _jsxs("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: [filteredAndSortedAnnotations.map(annotation => (_jsxs("div", { className: "p-2 border rounded text-xs", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [ANNOTATION_TYPES[annotation.type].icon, _jsx("span", { className: "font-medium", children: annotation.author.name }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: annotation.status })] }), _jsx("div", { className: "text-gray-600 line-clamp-2", children: annotation.content })] }, annotation.id))), filteredAndSortedAnnotations.length === 0 && (_jsx("div", { className: "text-xs text-gray-500 text-center py-4", children: "No annotations found" }))] })] }));
    }
    return (_jsx("div", { className: `node-annotation-system ${className}`, children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageCircle, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { children: "Node Annotations" })] }), _jsx(Badge, { variant: "secondary", className: "px-2", children: nodeName })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowResolved(!showResolved), children: showResolved ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) }), _jsxs(Button, { variant: "default", size: "sm", onClick: () => setIsCreating(true), children: [_jsx(Edit3, { className: "w-4 h-4 mr-2" }), "New Annotation"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3 mt-4", children: [_jsxs("div", { className: "bg-blue-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: stats.total }), _jsx("div", { className: "text-xs text-blue-700", children: "Total" })] }), _jsxs("div", { className: "bg-amber-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-amber-900", children: stats.open }), _jsx("div", { className: "text-xs text-amber-700", children: "Open" })] }), _jsxs("div", { className: "bg-red-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-red-900", children: stats.critical }), _jsx("div", { className: "text-xs text-red-700", children: "Critical" })] }), _jsxs("div", { className: "bg-green-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-green-900", children: stats.myAnnotations }), _jsx("div", { className: "text-xs text-green-700", children: "Mine" })] }), _jsxs("div", { className: "bg-purple-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-purple-900", children: stats.assigned }), _jsx("div", { className: "text-xs text-purple-700", children: "Assigned" })] })] })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "annotations", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "annotations", children: "Annotations" }), _jsx(TabsTrigger, { value: "create", children: "Create New" }), _jsx(TabsTrigger, { value: "filters", children: "Filters" })] }), _jsxs(TabsContent, { value: "annotations", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { children: "Sort by:" }), _jsxs(Select, { value: sortBy, onValueChange: (value) => setSortBy(value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "timestamp", children: "Recent" }), _jsx(SelectItem, { value: "priority", children: "Priority" }), _jsx(SelectItem, { value: "status", children: "Status" })] })] })] }), _jsxs("div", { className: "space-y-3", children: [filteredAndSortedAnnotations.map(annotation => (_jsx(AnnotationCard, { annotation: annotation, expanded: selectedAnnotation === annotation.id }, annotation.id))), filteredAndSortedAnnotations.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(MessageCircle, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }), _jsx("div", { children: "No annotations found" }), _jsx("div", { className: "text-sm", children: "Try adjusting your filters or create a new annotation" })] }))] })] }), _jsx(TabsContent, { value: "create", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Create New Annotation" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Type" }), _jsxs(Select, { value: newAnnotation.type, onValueChange: (value) => setNewAnnotation(prev => ({ ...prev, type: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(ANNOTATION_TYPES).map(([type, config]) => (_jsx(SelectItem, { value: type, children: _jsxs("div", { className: "flex items-center gap-2", children: [config.icon, _jsx("span", { children: config.label })] }) }, type))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Priority" }), _jsxs(Select, { value: newAnnotation.priority, onValueChange: (value) => setNewAnnotation(prev => ({ ...prev, priority: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(PRIORITY_CONFIGS).map(([priority, config]) => (_jsx(SelectItem, { value: priority, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: config.color } }), _jsx("span", { children: config.label })] }) }, priority))) })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Content" }), _jsx("textarea", { value: newAnnotation.content, onChange: (e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value })), placeholder: "Enter your annotation content...", rows: 4, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setIsCreating(false), children: "Cancel" }), _jsxs(Button, { onClick: handleCreateAnnotation, disabled: !newAnnotation.content.trim(), children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Create Annotation"] })] })] })] }) }), _jsx(TabsContent, { value: "filters", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Type" }), _jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), Object.entries(ANNOTATION_TYPES).map(([type, config]) => (_jsx(SelectItem, { value: type, children: _jsxs("div", { className: "flex items-center gap-2", children: [config.icon, _jsx("span", { children: config.label })] }) }, type)))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Status" }), _jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), Object.entries(STATUS_CONFIGS).map(([status, config]) => (_jsx(SelectItem, { value: status, children: _jsxs("div", { className: "flex items-center gap-2", children: [config.icon, _jsx("span", { children: config.label })] }) }, status)))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Priority" }), _jsxs(Select, { value: filterPriority, onValueChange: setFilterPriority, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Priorities" }), Object.entries(PRIORITY_CONFIGS).map(([priority, config]) => (_jsx(SelectItem, { value: priority, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: config.color } }), _jsx("span", { children: config.label })] }) }, priority)))] })] })] })] }) })] }) })] }) }));
};
export default NodeAnnotationSystem;
