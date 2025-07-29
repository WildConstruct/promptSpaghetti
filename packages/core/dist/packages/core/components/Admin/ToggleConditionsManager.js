import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 17 Toggle Conditions Manager
 *
 * Comprehensive UI for managing complex feature toggle conditions including:
 * - Condition creation and editing with visual builders
 * - Real-time condition testing and validation
 * - Advanced targeting and rollout configuration
 * - A/B testing and multivariate setup
 */
import { useState, useEffect, useCallback } from 'react';
import { ConditionType } from '../../services/ToggleConditionsService';
{
    // State management
    const [conditions, setConditions] = useState([]);
    const [editingCondition, setEditingCondition] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});
    name: '',
        description;
    '',
        conditionType;
    ConditionType.PERCENTAGE,
        expression;
    '',
        parameters;
    { }
    priority: 100,
        active;
    true,
        metadata;
    {
        category: 'feature_rollout',
            tags;
        [],
            riskLevel;
        'medium',
            businessImpact;
        '',
        ;
    }
    ;
    // Testing state
    const [testContext, setTestContext] = useState({});
    user: {
        id: 'test-user-123',
            email;
        'test@example.com',
            role;
        'user',
            segment;
        'beta_users',
            attributes;
        { }
        groups: [],
            permissions;
        [];
    }
    request: {
        ip: '192.168.1.100',
            country;
        'US',
            region;
        'CA',
            device;
        {
            type: 'desktop',
                platform;
            'Windows',
                browser;
            'Chrome',
            ;
        }
        environment: {
            environment: 'staging',
                region;
            'us-west-2',
                timezone;
            'America/Los_Angeles',
                version;
            '1.0.0',
            ;
        }
        timestamp: new Date();
    }
    ;
    const [testResults, setTestResults] = useState(null);
    const [testing, setTesting] = useState(false);
    // Load conditions on mount
    useEffect(() => {
        loadConditions();
    }, [toggleId]);
    const loadConditions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const toggleConditions = conditionsService.getToggleConditions(toggleId);
            setConditions(toggleConditions);
            onConditionsChange?.(toggleConditions);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load conditions');
        }
        finally {
            setLoading(false);
        }
        [conditionsService, toggleId, onConditionsChange];
    });
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingCondition) {
                // Update existing condition (simplified - would need update API)
                await handleDelete(editingCondition.id);
                await conditionsService.addCondition({});
                toggleId,
                ;
            }
        }
        finally {
        }
    };
    formData;
}
;
await loadConditions();
resetForm();
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to save condition');
}
;
// Handle condition deletion
const handleDelete = async (conditionId) => {
    try {
        await conditionsService.removeCondition(conditionId);
        await loadConditions();
    }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete condition');
    }
    ;
    // Handle condition testing
    const handleTest = async () => {
        setTesting(true);
        setError(null);
        try {
            const result = await conditionsService.evaluateToggle(toggleId, testContext);
            setTestResults(result);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to test conditions');
        }
        finally {
            setTesting(false);
        }
        ;
        // Reset form
        const resetForm = () => {
            setFormData({});
            name: '',
                description;
            '',
                conditionType;
            ConditionType.PERCENTAGE,
                expression;
            '',
                parameters;
            { }
            priority: 100,
                active;
            true,
                metadata;
            {
                category: 'feature_rollout',
                    tags;
                [],
                    riskLevel;
                'medium',
                    businessImpact;
                '',
                ;
            }
            ;
            setEditingCondition(null);
            setShowCreateForm(false);
        };
        // Start editing a condition
        const startEdit = (condition) => {
            setFormData({});
            name: condition.name,
                description;
            condition.description,
                conditionType;
            condition.conditionType,
                expression;
            condition.expression,
                parameters;
            condition.parameters,
                priority;
            condition.priority,
                active;
            condition.active,
                metadata;
            {
                category: condition.metadata.category,
                    tags;
                condition.metadata.tags,
                    riskLevel;
                condition.metadata.riskLevel,
                    businessImpact;
                condition.metadata.businessImpact,
                ;
            }
            ;
            setEditingCondition(condition);
            setShowCreateForm(true);
        };
        // Render condition type badge
        const renderConditionTypeBadge = (type) => {
            const colors = {
                [ConditionType.USER_ATTRIBUTE]: 'bg-blue-100 text-blue-800',
                [ConditionType.USER_SEGMENT]: 'bg-purple-100 text-purple-800',
                [ConditionType.PERCENTAGE]: 'bg-green-100 text-green-800',
                [ConditionType.TIME_WINDOW]: 'bg-yellow-100 text-yellow-800',
                [ConditionType.AB_TEST]: 'bg-pink-100 text-pink-800',
                [ConditionType.MULTIVARIATE]: 'bg-indigo-100 text-indigo-800',
                [ConditionType.CUSTOM_EXPRESSION]: 'bg-gray-100 text-gray-800',
                [ConditionType.DEPENDENCY]: 'bg-red-100 text-red-800',
                [ConditionType.GEOGRAPHIC]: 'bg-orange-100 text-orange-800',
                [ConditionType.DEVICE_TYPE]: 'bg-teal-100 text-teal-800',
                [ConditionType.TRAFFIC_SPLIT]: 'bg-cyan-100 text-cyan-800',
                [ConditionType.FEATURE_FLAG]: 'bg-lime-100 text-lime-800',
            };
            return;
            _jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`, children: ["}", type.replace('_', ' ').toUpperCase()] });
        };
    };
};
;
;
if (loading) {
    return;
    _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "text-gray-600", children: "Loading conditions..." })] }) });
    ;
    return;
    _jsxs("div", { className: "conditions-manager max-h-screen flex flex-col", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Toggle Conditions" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Manage complex conditions for toggle: ", toggleId] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: handleTest, disabled: testing, className: "px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 disabled:opacity-50", children: testing ? 'Testing...' : 'Test Conditions' }), _jsx("button", { onClick: () => setShowCreateForm(true), className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: "Add Condition" }), onClose && ()
                                    < button, "onClick=", onClose, "className=\"p-2 text-gray-400 hover:text-gray-600\" >", _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })] }), ")}"] }) }), error && ()
                < div, " className=\"mt-4 bg-red-50 border border-red-200 rounded-md p-4\">", _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) })] })] });
}
div >
    _jsxs("div", { className: "flex-1 flex", children: [_jsxs("div", { className: "flex-1 p-6", children: [conditions.length === 0 ? ()
                        < div : , " className=\"text-center py-12\">", _jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No conditions" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Get started by creating your first condition." }), _jsx("div", { className: "mt-6", children: _jsx("button", { onClick: () => setShowCreateForm(true), className: "inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700", children: "Add Condition" }) })] }), ") : ()", _jsxs("div", { className: "space-y-4", children: [conditions.map((condition) => ()
                        < div, key = { condition, : .id }, className = "bg-white border border-gray-200 rounded-lg p-6" >
                        _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: condition.name }), renderConditionTypeBadge(condition.conditionType), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${condition.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800',
                                                    }`, children: condition.active ? 'ACTIVE' : 'INACTIVE' }), _jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${condition.metadata.riskLevel === 'critical' ? 'bg-red-500 text-white' : ,
                                                        condition.metadata.riskLevel === 'high' ? 'bg-red-400 text-white' : ,
                                                        condition.metadata.riskLevel === 'medium' ? 'bg-yellow-400 text-gray-800' : ,
                                                        'bg-gray-400 text-white'}`, children: [condition.metadata.riskLevel.toUpperCase(), " RISK"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: condition.description }), _jsxs("div", { className: "flex items-center text-xs text-gray-500 space-x-4", children: [_jsxs("span", { children: ["Priority: ", condition.priority] }), _jsxs("span", { children: ["Category: ", condition.metadata.category] }), _jsxs("span", { children: ["Created: ", condition.created.toLocaleDateString()] })] }), condition.metadata.tags.length > 0 && ()
                                            < div, " className=\"mt-2 flex flex-wrap gap-1\">", condition.metadata.tags.map((tag) => ()
                                            < span, key = { tag }, className = "px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded" >
                                            { tag })] }), "))}"] })), _jsx("div", { className: "mt-4 p-3 bg-gray-50 rounded-md", children: _jsx(ConditionDetails, { condition: condition }) })] }), _jsxs("div", { className: "ml-4 flex items-center space-x-2", children: [_jsx("button", { onClick: () => startEdit(condition), className: "p-2 text-gray-400 hover:text-blue-600", title: "Edit condition", children: _jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) }), _jsx("button", { onClick: () => handleDelete(condition.id), className: "p-2 text-gray-400 hover:text-red-600", title: "Delete condition", children: _jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] })] });
div >
;
div >
;
div >
    { /* Sidebar */}
    < div;
className = "w-80 border-l border-gray-200 bg-gray-50" >
    { /* Test Results */};
{
    testResults && ()
        < div;
    className = "p-4" >
        (_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Test Results" })
            ,
                _jsxs("div", { className: "bg-white rounded-lg border p-4 mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("span", { className: "text-sm font-medium", children: "Toggle Status" }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${testResults.enabled
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800',
                                    }`, children: testResults.enabled ? 'ENABLED' : 'DISABLED' })] }), testResults.variant && ()
                            < div, " className=\"mb-3\">", _jsx("span", { className: "text-sm font-medium", children: "Variant: " }), _jsx("span", { className: "text-sm text-gray-600", children: testResults.variant })] }));
}
_jsxs("div", { className: "mb-3", children: [_jsx("span", { className: "text-sm font-medium", children: "Confidence: " }), _jsxs("span", { className: "text-sm text-gray-600", children: [(testResults.confidence * 100).toFixed(1), "%"] })] })
    ,
        _jsxs("div", { className: "text-xs text-gray-500", children: ["Execution Time: ", testResults.metadata.totalExecutionTime, "ms"] });
div >
    { /* Condition Results */}
    < div;
className = "space-y-2" >
    { testResults, : .conditions.map((result) => ()
            < div, key = { result, : .conditionId }, className = "bg-white rounded border p-3" >
            (_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("span", { className: "text-xs font-medium text-gray-700", children: ["Condition ", result.conditionId.slice(-8)] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${result.result
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800',
                        }`, children: result.result ? 'MATCH' : 'NO MATCH' })] })
                ,
                    _jsx("p", { className: "text-xs text-gray-600", children: result.reason })
                        ,
                            _jsxs("div", { className: "text-xs text-gray-400 mt-1", children: [result.executionTime, "ms"] })), div >
        ) };
div >
;
div >
;
{ /* Test Context Editor */ }
_jsxs("div", { className: "p-4 border-t border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Test Context" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "User ID" }), _jsx("input", { type: "text", value: testContext.user?.id || '', onChange: (e) => setTestContext({}) }), "...testContext, user: ", ...(testContext.user, id), ": e.target.value } })} className=\"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm\" />"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "User Segment" }), _jsx("select", { value: testContext.user?.segment || '', onChange: (e) => setTestContext({}) }), "...testContext, user: ", ...(testContext.user, segment), ": e.target.value } })} className=\"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm\" >", _jsx("option", { value: "", children: "None" }), _jsx("option", { value: "beta_users", children: "Beta Users" }), _jsx("option", { value: "premium_users", children: "Premium Users" }), _jsx("option", { value: "enterprise", children: "Enterprise" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Country" }), _jsx("select", { value: testContext.request?.country || '', onChange: (e) => setTestContext({}) }), "...testContext, request: ", ...(testContext.request, country), ": e.target.value } })} className=\"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm\" >", _jsx("option", { value: "", children: "Unknown" }), _jsx("option", { value: "US", children: "United States" }), _jsx("option", { value: "CA", children: "Canada" }), _jsx("option", { value: "GB", children: "United Kingdom" }), _jsx("option", { value: "DE", children: "Germany" })] })] })
    ,
        _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Device Type" }), _jsx("select", { value: testContext.request?.device?.type || '', onChange: (e) => setTestContext({}) }), "...testContext, request: ", ...(testContext.request,
                    device), ": ", ...(testContext.request.device, type), ": e.target.value as any } })} className=\"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm\" >", _jsx("option", { value: "desktop", children: "Desktop" }), _jsx("option", { value: "mobile", children: "Mobile" }), _jsx("option", { value: "tablet", children: "Tablet" })] });
div >
;
div >
;
div >
;
div >
;
div >
    { /* Create/Edit Form Modal */};
{
    showCreateForm && ()
        < ConditionFormModal;
    formData = { formData };
    setFormData = { setFormData };
    onSubmit = { handleSubmit };
    onCancel = { resetForm };
    isEditing = {};
    editingCondition;
}
/>;
div >
;
;
;
{
    params.endTime && ()
        < div >
        (_jsx("span", { className: "font-medium", children: "End: " })
            ,
                _jsx("span", { children: params.endTime.toLocaleString() }));
    div >
    ;
}
div >
;
;
ConditionType.CUSTOM_EXPRESSION;
return;
_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Expression: " }), _jsx("code", { className: "bg-gray-100 px-2 py-1 rounded text-xs", children: condition.expression })] });
;
return;
_jsxs("div", { className: "text-sm text-gray-500", children: ["Configuration details for ", condition.conditionType] });
;
;
return;
_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Configuration" }), renderParameters()] });
;
;
{
    return;
    _jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: isEditing ? 'Edit Condition' : 'Create New Condition' }) }), _jsxs("form", { onSubmit: onSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Condition Type" }), _jsx("select", { value: formData.conditionType, onChange: (e) => setFormData({ ...formData, conditionType: e.target.value }), className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md", children: Object.values(ConditionType).map((type) => ()
                                            < option, key = { type }, value = { type } >
                                            { type, : .replace('_', ' ').toUpperCase() }) }), "))}"] })] })] }), formData.conditionType === ConditionType.PERCENTAGE && ()
                < div >
                (_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Rollout Percentage" })
                    ,
                        _jsx("input", { type: "number", min: "0", max: "100", value: formData.parameters.percentage || 0, onChange: (e) => setFormData({}) })), "...formData, parameters: ", ...(formData.parameters, percentage), ": Number(e.target.value) } })} className=\"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md\" />"] });
}
{
    formData.conditionType === ConditionType.CUSTOM_EXPRESSION && ()
        < div >
        (_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Expression" })
            ,
                _jsx("textarea", { value: formData.expression, onChange: (e) => setFormData({ ...formData, expression: e.target.value }), className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm", rows: 3, placeholder: "user.segment === 'beta' && user.attributes.tier === 'premium'" }));
    div >
    ;
}
_jsxs("div", { className: "flex items-center justify-end space-x-3 pt-4", children: [_jsx("button", { type: "button", onClick: onCancel, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: [isEditing ? 'Update' : 'Create', " Condition"] })] });
form >
;
div >
;
div >
;
;
;
export default ToggleConditionsManager;
