import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.3 - Lock Breaking Workflow Component
// Workflow for breaking existing locks with proper authorization
import { useState, useEffect } from 'react';
import { X, AlertTriangle, Shield, Clock, User, FileText } from 'lucide-react';
{
    const [currentStep, setCurrentStep] = useState('select');
    const [selectedLock, setSelectedLock] = useState(null);
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [locks, setLocks] = useState([]);
    const [userPermissions, setUserPermissions] = useState({});
    canBreakLocks: false,
        requiresJustification;
    true,
        roles;
    [],
    ;
}
;
// Mock data - in real implementation, this would come from API
useEffect(() => {
    if (isOpen && resourceId) {
        // Mock locks data
        setLocks([]);
        {
            id: 'lock-1',
                resource_id;
            resourceId,
                locked_by;
            'user-456',
                lock_type;
            'edit',
                lock_reason;
            'Working on content updates',
                locked_at;
            new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                expires_at;
            new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                auto_release;
            true,
                workspace_id;
            'workspace-123';
        }
    }
});
// Mock user permissions
setUserPermissions({});
canBreakLocks: true,
    requiresJustification;
true,
    roles;
['admin', 'editor'],
;
;
[isOpen, resourceId];
;
const handleLockSelect = (lock) => {
    setSelectedLock(lock);
    setCurrentStep('confirm');
};
const handleConfirmBreak = () => {
    if (userPermissions.requiresJustification) {
        setCurrentStep('justification');
    }
    else {
        handleBreakLock();
    }
    ;
    const handleBreakLock = async () => {
        if (!selectedLock)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            if (userPermissions.requiresJustification && !justification.trim()) {
                throw new Error('Justification is required');
                await onBreakLock(selectedLock.id, resourceId, justification);
                onClose();
            }
            try { }
            catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to break lock');
            }
            finally {
                setIsSubmitting(false);
            }
            ;
            const handleCancel = () => {
                setCurrentStep('select');
                setSelectedLock(null);
                setJustification('');
                setError(null);
                onClose();
            };
            const formatTimeRemaining = (expiresAt) => {
                const now = new Date();
                const expires = new Date(expiresAt);
                const diff = expires.getTime() - now.getTime();
                if (diff < 0)
                    return 'Expired';
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                if (hours > 0) {
                    return `${hours}h ${minutes}m`;
                }
                return `${minutes}m`;
            };
        }
        finally { }
        ;
        if (!isOpen)
            return null;
        return;
        _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-500" }), _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Break Lock" })] }), _jsx("button", { onClick: handleCancel, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "p-6", children: [error && ()
                                < div, " className=\"mb-4 p-3 bg-red-50 border border-red-200 rounded-md\">", _jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-400 mr-2" }), _jsx("span", { className: "text-sm text-red-700", children: error })] })] }), ")}", currentStep === 'select' && ()
                        < div, " className=\"space-y-4\">", _jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-md p-4", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-amber-400 mt-0.5" }), _jsxs("div", { className: "text-sm text-amber-700", children: [_jsx("p", { className: "font-medium mb-1", children: "Lock Breaking Warning" }), _jsx("p", { children: "Breaking a lock will immediately release it and notify the current owner. Only break locks when absolutely necessary." })] })] }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-3", children: "Select lock to break:" }), _jsxs("div", { className: "space-y-2", children: [locks.map((lock) => ()
                                        < div, key = { lock, : .id }, className = "border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50", onClick = {}()), " => handleLockSelect(lock)} >", _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "h-8 w-8 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" }) }) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900", children: [lock.lock_type.charAt(0).toUpperCase() + lock.lock_type.slice(1), " Lock"] }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(User, { className: "h-3 w-3 mr-1" }), lock.locked_by] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), formatTimeRemaining(lock.expires_at)] })] }), lock.lock_reason && ()
                                                            < p, " className=\"text-sm text-gray-600 mt-1\"> Reason: ", lock.lock_reason] }), ")}"] }) }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "text-sm text-gray-500", children: ["Created: ", new Date(lock.locked_at).toLocaleString()] }) })] })] }), "))}"] }) });
        { /* Permissions Info */ }
        _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-400 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-700", children: [_jsx("p", { className: "font-medium mb-1", children: "Your Permissions" }), _jsxs("ul", { className: "space-y-1", children: [_jsxs("li", { children: ["\u2022 Can break locks: ", userPermissions.canBreakLocks ? 'Yes' : 'No'] }), _jsxs("li", { children: ["\u2022 Justification required: ", userPermissions.requiresJustification ? 'Yes' : 'No'] }), _jsxs("li", { children: ["\u2022 Roles: ", userPermissions.roles.join(', ')] })] })] })] }) });
    };
};
div >
;
{ /* Step 2: Confirm Break */ }
{
    currentStep === 'confirm' && selectedLock && ()
        < div;
    className = "space-y-4" >
        (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-400 mt-0.5" }), _jsxs("div", { className: "text-sm text-red-700", children: [_jsx("p", { className: "font-medium mb-1", children: "Confirm Lock Breaking" }), _jsx("p", { children: "Are you sure you want to break this lock? This action cannot be undone." })] })] }) })
            ,
                _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Lock Details:" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Type:" }), _jsx("span", { className: "ml-2 font-medium", children: selectedLock.lock_type.charAt(0).toUpperCase() + selectedLock.lock_type.slice(1) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Owner:" }), _jsx("span", { className: "ml-2 font-medium", children: selectedLock.locked_by })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Created:" }), _jsx("span", { className: "ml-2 font-medium", children: new Date(selectedLock.locked_at).toLocaleString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Expires:" }), _jsx("span", { className: "ml-2 font-medium", children: formatTimeRemaining(selectedLock.expires_at) })] }), selectedLock.lock_reason && ()
                                    < div, " className=\"col-span-2\">", _jsx("span", { className: "text-gray-500", children: "Reason:" }), _jsx("span", { className: "ml-2 font-medium", children: selectedLock.lock_reason })] }), ")}"] }));
    div >
        _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: () => setCurrentStep('select'), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200", children: "Back" }), _jsx("button", { type: "button", onClick: handleConfirmBreak, className: "px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700", children: "Confirm Break" })] });
    div >
    ;
}
{ /* Step 3: Justification */ }
{
    currentStep === 'justification' && selectedLock && ()
        < div;
    className = "space-y-4" >
        (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(FileText, { className: "h-5 w-5 text-blue-400 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-700", children: [_jsx("p", { className: "font-medium mb-1", children: "Justification Required" }), _jsx("p", { children: "Please provide a detailed justification for breaking this lock. This will be logged and sent to the lock owner." })] })] }) })
            ,
                _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Justification ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: justification, onChange: (e) => setJustification(e.target.value), rows: 4, placeholder: "Please explain why you need to break this lock...", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Be specific about the urgency and business need" })] })
                    ,
                        _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: () => setCurrentStep('confirm'), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200", children: "Back" }), _jsx("button", { type: "button", onClick: handleBreakLock, disabled: isSubmitting || !justification.trim(), className: "px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? 'Breaking Lock...' : 'Break Lock' })] }));
    div >
    ;
}
div >
;
div >
;
div >
;
;
;
