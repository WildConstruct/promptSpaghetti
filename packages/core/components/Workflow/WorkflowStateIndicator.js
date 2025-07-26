import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FileText, Eye, CheckCircle, Globe, Archive, XCircle, Clock, AlertCircle } from 'lucide-react';
const DEFAULT_STATE_CONFIGS = {
    draft: {
        id: 'draft',
        name: 'Draft',
        description: 'Work in progress',
        color: 'gray',
        icon: 'FileText',
        is_initial: true,
        is_final: false,
        required_permissions: []
    },
    review: {
        id: 'review',
        name: 'In Review',
        description: 'Under review',
        color: 'yellow',
        icon: 'Eye',
        is_initial: false,
        is_final: false,
        required_permissions: []
    },
    approved: {
        id: 'approved',
        name: 'Approved',
        description: 'Approved for publication',
        color: 'green',
        icon: 'CheckCircle',
        is_initial: false,
        is_final: false,
        required_permissions: []
    },
    published: {
        id: 'published',
        name: 'Published',
        description: 'Live and public',
        color: 'blue',
        icon: 'Globe',
        is_initial: false,
        is_final: true,
        required_permissions: []
    },
    archived: {
        id: 'archived',
        name: 'Archived',
        description: 'No longer active',
        color: 'gray',
        icon: 'Archive',
        is_initial: false,
        is_final: true,
        required_permissions: []
    },
    rejected: {
        id: 'rejected',
        name: 'Rejected',
        description: 'Rejected during review',
        color: 'red',
        icon: 'XCircle',
        is_initial: false,
        is_final: false,
        required_permissions: []
    }
};
const STATE_ICONS = {
    FileText,
    Eye,
    CheckCircle,
    Globe,
    Archive,
    XCircle,
    Clock,
    AlertCircle
};
const getStateColors = (color) => {
    switch (color) {
        case 'gray':
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-300',
                icon: 'text-gray-600'
            };
        case 'yellow':
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                border: 'border-yellow-300',
                icon: 'text-yellow-600'
            };
        case 'green':
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-300',
                icon: 'text-green-600'
            };
        case 'blue':
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-300',
                icon: 'text-blue-600'
            };
        case 'red':
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                border: 'border-red-300',
                icon: 'text-red-600'
            };
        case 'purple':
            return {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                border: 'border-purple-300',
                icon: 'text-purple-600'
            };
        case 'indigo':
            return {
                bg: 'bg-indigo-100',
                text: 'text-indigo-800',
                border: 'border-indigo-300',
                icon: 'text-indigo-600'
            };
        default:
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-300',
                icon: 'text-gray-600'
            };
    }
};
const getSizeClasses = (size) => {
    switch (size) {
        case 'sm':
            return {
                container: 'px-2 py-1 text-xs',
                icon: 'w-3 h-3',
                gap: 'space-x-1'
            };
        case 'lg':
            return {
                container: 'px-4 py-2 text-base',
                icon: 'w-5 h-5',
                gap: 'space-x-3'
            };
        default: // md
            return {
                container: 'px-3 py-1 text-sm',
                icon: 'w-4 h-4',
                gap: 'space-x-2'
            };
    }
};
export const WorkflowStateIndicator = ({ state, stateConfig, showLabel = true, size = 'md', className = '' }) => {
    const config = stateConfig || DEFAULT_STATE_CONFIGS[state];
    const colors = getStateColors(config.color);
    const sizes = getSizeClasses(size);
    // Get icon component
    const IconComponent = STATE_ICONS[config.icon] || FileText;
    if (!showLabel) {
        return (_jsx("div", { className: `inline-flex items-center justify-center rounded-full border ${colors.bg} ${colors.border} ${sizes.container} ${className}`, title: `${config.name}${config.description ? ` - ${config.description}` : ''}`, children: _jsx(IconComponent, { className: `${sizes.icon} ${colors.icon}` }) }));
    }
    return (_jsxs("div", { className: `inline-flex items-center rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border} ${sizes.container} ${sizes.gap} ${className}`, title: config.description, children: [_jsx(IconComponent, { className: `${sizes.icon} ${colors.icon}` }), _jsx("span", { children: config.name })] }));
};
export const isCurrent = (stateId) => stateId === currentState;
return (_jsx("div", { className: `flex items-center space-x-2 ${className}`, children: states.map((state, index) => {
        const isLast = index === states.length - 1;
        const completed = isCompleted(state.id);
        const current = isCurrent(state.id);
        return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx(WorkflowStateIndicator, { state: state.id, stateConfig: state, showLabel: false, size: "sm", className: `${current ? 'ring-2 ring-blue-500 ring-offset-2' : ''}` }), _jsx("span", { className: `text-xs mt-1 ${current ? 'font-medium text-gray-900' : 'text-gray-500'}`, children: state.name })] }), !isLast && (_jsx("div", { className: "flex-1 mx-2", children: _jsx("div", { className: `h-0.5 ${completed ? 'bg-green-400' : 'bg-gray-200'}` }) }))] }, state.id));
    }) }));
;
export const WorkflowStateHistory = ({ history, className }) => {
    return (_jsx("div", { className: `workflow-state-history ${className || ''}`, children: history.map((entry, index) => (_jsxs("div", { className: "history-entry", children: [_jsx(WorkflowStateIndicator, { state: entry.state, stateConfig: entry.stateConfig, showLabel: true, size: "sm" }), _jsxs("div", { className: "entry-details", children: [_jsx("span", { className: "timestamp", children: entry.timestamp }), entry.actor && _jsxs("span", { className: "actor", children: ["by ", entry.actor] }), entry.comment && _jsx("span", { className: "comment", children: entry.comment })] })] }, index))) }));
};
