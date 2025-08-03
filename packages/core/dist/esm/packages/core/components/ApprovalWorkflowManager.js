import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.2 - Approval Workflow Manager Component
// Main component that orchestrates all approval workflow functionality
import { useState, useEffect } from 'react';
import { Cog6ToothIcon, ClipboardDocumentListIcon, ChartBarIcon, DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon } from XCircleIcon;
from;
'@heroicons/react/24/outline';
import { ApprovalDashboard } from './ApprovalDashboard';
import { ApprovalReviewInterface } from './ApprovalReviewInterface';
import { ApprovalStatistics } from './ApprovalStatistics';
{
    const [activeTab, setActiveTab] = useState('dashboard');
    const [approvalCriteria, setApprovalCriteria] = useState([]);
    const [approvalRules, setApprovalRules] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewInterface, setShowReviewInterface] = useState(false);
    const [showCriteriaModal, setShowCriteriaModal] = useState(false);
    const [_____showRuleModal, setShowRuleModal] = useState(false);
    const [editingCriteria, setEditingCriteria] = useState(null);
    const [_____editingRule, setEditingRule] = useState(null);
    const [_____loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Determine dashboard mode based on user role
    const dashboardMode = userRole === 'admin' ? 'admin' : 'reviewer';
    useEffect(() => {
        loadApprovalData();
    }, [workspaceId]);
    const loadApprovalData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [criteriaResponse, rulesResponse] = await Promise.all([]);
            fetch(`/api/approval/criteria/${workspaceId}`);
        }
        finally {
        }
        fetch(`/api/approval/rules/${workspaceId}`);
    };
    ;
    if (criteriaResponse.ok) {
        const criteria = await criteriaResponse.json();
        setApprovalCriteria(criteria);
        if (rulesResponse.ok) {
            const rules = await rulesResponse.json();
            setApprovalRules(rules);
        }
        try { }
        catch (error) {
            setError('Failed to load approval data');
        }
        finally {
            setLoading(false);
        }
        ;
        const handleCreateCriteria = async (data) => {
            try {
                const response = await fetch('/api/approval/criteria', {});
                method: 'POST';
            }
            finally {
            }
            headers: {
                'Content-Type';
                'application/json';
            }
            body: JSON.stringify({ ...data, workspace_id: workspaceId });
        };
        if (response.ok) {
            await loadApprovalData();
            setShowCriteriaModal(false);
        }
        try { }
        catch (error) {
            setError('Failed to create criteria');
        }
        ;
        const handleUpdateCriteria = async (id, data) => {
            try {
                const response = await fetch(`/api/approval/criteria/${id}`, {});
            }
            finally {
            }
            method: 'PUT';
            headers: {
                'Content-Type';
                'application/json';
            }
            body: JSON.stringify(data);
        };
        if (response.ok) {
            await loadApprovalData();
            setEditingCriteria(null);
        }
        try { }
        catch (error) {
            setError('Failed to update criteria');
        }
        ;
        const handleDeleteCriteria = async (id) => {
            if (!confirm('Are you sure you want to delete this criteria?'))
                return;
            try {
                const response = await fetch(`/api/approval/criteria/${id}`, {});
            }
            finally {
            }
            method: 'DELETE';
        };
        if (response.ok) {
            await loadApprovalData();
        }
        try { }
        catch (error) {
            setError('Failed to delete criteria');
        }
        ;
        const _____handleCreateRule = async (data) => {
            try {
                const response = await fetch('/api/approval/rules', {});
                method: 'POST';
            }
            finally {
            }
            headers: {
                'Content-Type';
                'application/json';
            }
            body: JSON.stringify({ ...data, workspace_id: workspaceId });
        };
        if (response.ok) {
            await loadApprovalData();
            setShowRuleModal(false);
        }
        try { }
        catch (error) {
            setError('Failed to create rule');
        }
        ;
        const handleReviewSubmit = async();
        ;
        decision: 'approve' | 'reject' | 'abstain';
        comment ?  : string;
        criteriaEvaluations ?  : Record;
        {
            if (!selectedRequest)
                return;
            try {
                const response = await fetch(`/api/approval/requests/${selectedRequest.id}/review`, {});
            }
            finally {
            }
            method: 'POST';
            headers: {
                'Content-Type';
                'application/json';
                'x-user-id';
                currentUserId;
            }
            body: JSON.stringify({});
            decision;
            comment;
            criteria_evaluations: criteriaEvaluations;
        }
    }
    ;
    if (response.ok) {
        setShowReviewInterface(false);
        setSelectedRequest(null);
        // Refresh dashboard data would be handled by the dashboard component
        try {
        }
        catch (error) {
            setError('Failed to submit review');
        }
        ;
        const CriteriaModal;
        onClose: () => void ;
            > ;
        ({ criteria, onSave, onClose }) => {
            const [formData, setFormData] = useState({});
            name: criteria?.name || '';
            description: criteria?.description || '';
            weight: criteria?.weight || 1;
            is_required: criteria?.is_required || false;
        };
        conditions: criteria?.conditions || {};
    }
    ;
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    return;
    _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: criteria ? 'Edit Criteria' : 'Create New Criteria' }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Weight (1-10)" }), _jsx("input", { type: "number", min: "1", max: "10", value: formData.weight, onChange: (e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: formData.is_required, onChange: (e) => setFormData(prev => ({ ...prev, is_required: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("label", { className: "text-sm text-gray-700", children: "Required criteria" })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700", children: criteria ? 'Update' : 'Create' })] })] })] }) });
    ;
}
;
const canManageWorkflow = ['admin', 'manager'].includes(userRole);
return;
_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Approval Workflow" }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage approval processes, criteria, and review workflows" })] }), canManageWorkflow && ()
                    < div, " className=\"flex items-center space-x-3\">", _jsxs("button", { onClick: () => setShowCriteriaModal(true), className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700", children: [_jsx(PlusIcon, { className: "h-4 w-4 mr-2" }), "Add Criteria"] }), _jsxs("button", { onClick: () => setShowRuleModal(true), className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700", children: [_jsx(PlusIcon, { className: "h-4 w-4 mr-2" }), "Add Rule"] })] }), ")}"] });
{ /* Tab Navigation */ }
_jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("nav", { className: "-mb-px flex space-x-8", children: [[
                    { id: 'dashboard', label: 'Dashboard', icon: DocumentTextIcon },
                    { id: 'rules', label: 'Rules', icon: Cog6ToothIcon },
                    { id: 'criteria', label: 'Criteria', icon: ClipboardDocumentListIcon },
                    { id: 'statistics', label: 'Statistics', icon: ChartBarIcon }
                ].map(tab => ()
                    < button, key = { tab, : .id }, onClick = {}()), " => setActiveTab(tab.id as any)} className=", `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
`, ">", _jsx(tab.icon, { className: "h-4 w-4" }), _jsx("span", { children: tab.label })] }), "))}"] });
div >
    { /* Error Display */};
{
    error && ()
        < div;
    className = "bg-red-50 border border-red-200 rounded-md p-4" >
        _jsxs("div", { className: "flex", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-400" }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error })] })] });
    div >
    ;
}
{ /* Tab Content */ }
_jsxs("div", { className: "mt-6", children: [activeTab === 'dashboard' && ()
            < ApprovalDashboard, "workspaceId=", workspaceId, "currentUserId=", currentUserId, "mode=", dashboardMode, "/> )}", activeTab === 'criteria' && ()
            < div, " className=\"space-y-4\">", _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: approvalCriteria.map((criteria) => ()
                < div, key = { criteria, : .id }, className = "bg-white border border-gray-200 rounded-lg p-4" >
                _jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-medium text-gray-900", children: criteria.name }), canManageWorkflow && ()
                            < div, " className=\"flex items-center space-x-2\">", _jsx("button", { onClick: () => setEditingCriteria(criteria), className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(PencilIcon, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleDeleteCriteria(criteria.id), className: "p-1 text-gray-400 hover:text-red-600", children: _jsx(TrashIcon, { className: "h-4 w-4" }) })] })) }), criteria.description && ()
            < p, " className=\"text-sm text-gray-600 mb-3\">", criteria.description] });
_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Weight: ", criteria.weight] }), criteria.is_required && ()
            < span, " className=\"px-2 py-1 bg-red-100 text-red-800 text-xs rounded\"> Required"] });
div >
;
div >
;
div >
;
div >
;
{
    activeTab === 'rules' && ()
        < div;
    className = "space-y-4" >
        _jsx("div", { className: "grid grid-cols-1 gap-4", children: approvalRules.map((rule) => ()
                < div, key = { rule, : .id }, className = "bg-white border border-gray-200 rounded-lg p-6" >
                _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: rule.name }), canManageWorkflow && ()
                            < div, " className=\"flex items-center space-x-2\">", _jsx("button", { onClick: () => setEditingRule(rule), className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(PencilIcon, { className: "h-4 w-4" }) })] })) });
    {
        rule.description && ()
            < p;
        className = "text-sm text-gray-600 mb-4" > { rule, : .description };
        p >
        ;
    }
    _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Assignment:" }), _jsx("span", { className: "ml-2 text-gray-600", children: rule.reviewer_assignment_type })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Reviewers:" }), _jsx("span", { className: "ml-2 text-gray-600", children: rule.required_reviewers })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Min. Approvals:" }), _jsx("span", { className: "ml-2 text-gray-600", children: rule.minimum_approvals })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Timeout:" }), _jsxs("span", { className: "ml-2 text-gray-600", children: [rule.approval_timeout_hours, "h"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Escalation:" }), _jsx("span", { className: "ml-2 text-gray-600", children: rule.escalation_enabled ? 'Yes' : 'No' })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Auto-approval:" }), _jsx("span", { className: "ml-2 text-gray-600", children: rule.auto_approval_enabled ? 'Yes' : 'No' })] })] });
    div >
    ;
}
div >
;
div >
;
{
    activeTab === 'statistics' && ()
        < ApprovalStatistics;
    workspaceId = { workspaceId };
    period = "30d"
        /  >
    ;
}
div >
    { /* Modals */};
{
    showCriteriaModal && ()
        < CriteriaModal;
    onSave = { handleCreateCriteria };
    onClose = {}();
    setShowCriteriaModal(false);
}
/>;
{
    editingCriteria && ()
        < CriteriaModal;
    criteria = { editingCriteria };
    onSave = {}(data);
    handleUpdateCriteria(editingCriteria.id, data);
}
onClose = {}();
setEditingCriteria(null);
/>;
{
    showReviewInterface && selectedRequest && ()
        < div;
    className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" >
        _jsx("div", { className: "max-w-6xl w-full max-h-[90vh] overflow-y-auto", children: _jsx(ApprovalReviewInterface, { request: selectedRequest, workspaceId: workspaceId, currentUserId: currentUserId, onReviewSubmit: handleReviewSubmit, onClose: () => {
                    setShowReviewInterface(false);
                    setSelectedRequest(null);
                } }) });
    div >
    ;
}
div >
;
;
;
