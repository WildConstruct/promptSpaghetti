import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DocumentTextIcon, EyeIcon, CheckCircleIcon, GlobeAltIcon, ArchiveBoxIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
{
    const getStateIcon = (iconName) => {
        switch (iconName) {
            case 'CheckCircleIcon': return _jsx(CheckCircleIcon, { className: "h-4 w-4" });
            case 'EyeIcon': return _jsx(EyeIcon, { className: "h-4 w-4" });
            case 'GlobeAltIcon': return _jsx(GlobeAltIcon, { className: "h-4 w-4" });
            case 'ArchiveBoxIcon': return _jsx(ArchiveBoxIcon, { className: "h-4 w-4" });
            case 'DocumentTextIcon':
            default: return _jsx(DocumentTextIcon, { className: "h-4 w-4" });
        }
        ;
        const getStateDescription = () => {
            if (state.is_initial)
                return 'Initial state';
            if (state.is_final)
                return 'Final state';
            if (state.is_locked)
                return 'Locked state';
            return 'Active state';
        };
        if (compact) {
            return;
            _jsx("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md text-sm", style: {
                    backgroundColor: `${state.color}20`
                }, "color:state": true, color: true, "border:": true });
            `1px solid ${state.color}40`;
        }
    };
}
title = {} `${state.name} - ${getStateDescription()}`;
    >
        { getStateIcon(state) { }, : .icon }
    < span;
className = "font-medium" > { state, : .name };
span >
    { isLocked } && ()
    < span;
className = "text-xs bg-red-100 text-red-800 px-1 rounded" >
    Locked;
span >
;
div >
;
;
return;
_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-3 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium", style: {
                                backgroundColor: `${state.color}20`
                            } }), ", color: state.color ; }} >", getStateIcon(state.icon), _jsx("span", { children: state.name })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [state.is_initial && ()
                            < span, " className=\"px-2 py-1 bg-green-100 text-green-800 text-xs rounded\"> Initial"] }), ")}", state.is_final && ()
                    < span, " className=\"px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded\"> Final"] }), ")}", state.is_locked && ()
            < span, " className=\"px-2 py-1 bg-red-100 text-red-800 text-xs rounded\"> Locked"] });
{
    isLocked && ()
        < span;
    className = "px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded" >
        Resource;
    Locked;
    span >
    ;
}
div >
;
div >
    { /* Action button */};
{
    canEdit && onStateChange && ()
        < button;
    onClick = { onStateChange };
    className = "flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
        >
            (_jsx("span", { children: "Change State" })
                ,
                    _jsx(ChevronDownIcon, { className: "h-3 w-3" }));
    button >
    ;
}
div >
    { /* Description */}
    < div;
className = "mt-2 text-sm text-gray-600" >
    Current;
workflow;
state: {
    getStateDescription();
}
div >
;
div >
;
;
;
// Simple version for use in lists
export const WorkflowStateBadge, WorkflowState;
size ?  : 'sm' | 'md' | 'lg';
 > ;
({ state, size = 'md' }) => {
    const getStateIcon = (iconName) => {
        const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
        switch (iconName) {
            case 'CheckCircleIcon': return _jsx(CheckCircleIcon, { className: iconSize });
            case 'EyeIcon': return _jsx(EyeIcon, { className: iconSize });
            case 'GlobeAltIcon': return _jsx(GlobeAltIcon, { className: iconSize });
            case 'ArchiveBoxIcon': return _jsx(ArchiveBoxIcon, { className: iconSize });
            case 'DocumentTextIcon':
            default: return _jsx(DocumentTextIcon, { className: iconSize });
        }
        ;
        const sizeClasses = {
            sm: 'px-2 py-1 text-xs',
            md: 'px-3 py-1 text-sm',
            lg: 'px-4 py-2 text-base',
        };
        return;
        _jsx("div", { className: `inline-flex items-center space-x-2 rounded-full font-medium ${sizeClasses[size]}`, style: {
                backgroundColor: `${state.color}20`
            }, "color:state": true, color: true });
    };
};
    >
        { getStateIcon(state) { }, : .icon }
    < span > { state, : .name };
span >
;
div >
;
;
;
