import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Policy Management Dashboard - E17-1753114397370-5ABAA8
 *
 * Comprehensive UI for managing policies across all domains in Wild Construct.
 * Provides policy creation, editing, evaluation, and compliance monitoring.
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { usePolicyManagement } from '../../hooks/usePolicyManagement';
import { PolicyDomain, PolicyStatus } from '../../services/PolicyManagement';
import { Shield, FileText, Settings, AlertTriangle, CheckCircle, Clock, TrendingUp, Search, Plus, Edit, Trash2, Eye, AlertCircle, Activity, BarChart3, Users, Globe, Lock } from 'lucide-react';
export const PolicyManagementDashboard = ({
    userId,
    userRole,
    className = ''
});
{
    const { policies, evaluationResults, violations, isLoading, error, createPolicy, updatePolicy, deletePolicy, evaluatePolicies, generateComplianceReport, getPolicyStatistics, getFilteredPolicies, getRecentEvaluations, getPolicyViolations, domains, types, statuses, frameworks } = usePolicyManagement({});
    autoEvaluate: true,
        enableRealTimeUpdates;
    true,
    ;
}
;
const [activeTab, setActiveTab] = useState('overview');
const [__selectedPolicy, setSelectedPolicy] = useState(null);
const [__isCreatingPolicy, setIsCreatingPolicy] = useState(false);
const [__isEditingPolicy, setIsEditingPolicy] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [domainFilter, setDomainFilter] = useState('ALL');
const [statusFilter, setStatusFilter] = useState('ALL');
const statistics = useMemo(() => getPolicyStatistics(), [getPolicyStatistics]);
const filteredPolicies = useMemo(() => {
    return getFilteredPolicies({});
    domain: domainFilter !== 'ALL' ? domainFilter : undefined,
        status;
    statusFilter !== 'ALL' ? statusFilter : undefined,
        search;
    searchTerm,
    ;
});
[getFilteredPolicies, domainFilter, statusFilter, searchTerm];
;
const recentEvaluations = useMemo(() => getRecentEvaluations(10), [getRecentEvaluations]);
const recentViolations = useMemo(() => );
getPolicyViolations({ resolved: false, limit: 10 }),
    [getPolicyViolations];
;
const getDomainIcon = (domain) => {
    const iconMap = {
        [PolicyDomain.SECURITY]: Shield,
        [PolicyDomain.CONTENT]: FileText,
        [PolicyDomain.QUALITY]: CheckCircle,
        [PolicyDomain.COMPLIANCE]: Settings,
        [PolicyDomain.VFX_PIPELINE]: Activity,
        [PolicyDomain.DATA_PROTECTION]: Lock,
        [PolicyDomain.ACCESS_CONTROL]: Users,
        [PolicyDomain.MARKETPLACE]: Globe,
    };
    return iconMap[domain] || Settings;
};
const getStatusColor = (status) => {
    switch (status) {
        case PolicyStatus.ACTIVE: return 'bg-green-100 text-green-800';
        case PolicyStatus.INACTIVE: return 'bg-gray-100 text-gray-800';
        case PolicyStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
        case PolicyStatus.DEPRECATED: return 'bg-red-100 text-red-800';
        case PolicyStatus.EMERGENCY: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
    ;
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-600';
            case 'HIGH': return 'text-orange-600';
            case 'MEDIUM': return 'text-yellow-600';
            case 'LOW': return 'text-green-600';
            default: return 'text-gray-600';
        }
        ;
    };
    try { }
    catch (err) {
        console.error('Failed to create policy:', err);
    }
    ;
    setSelectedPolicy(null);
};
try { }
catch (err) {
    console.error('Failed to update policy:', err);
}
;
const handleDeletePolicy = async (policyId) => {
    if (confirm('Are you sure you want to delete this policy?')) {
        try {
            await deletePolicy(policyId, userId);
        }
        catch (err) {
            console.error('Failed to delete policy:', err);
        }
        ;
        const renderOverview = () => ();
        ;
        _jsxs("div", { className: "policy-overview space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Policies" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: statistics.totalPolicies })] }), _jsx(Shield, { className: "w-8 h-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Policies" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: statistics.activePolicies })] }), _jsx(CheckCircle, { className: "w-8 h-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Recent Evaluations" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: statistics.evaluationMetrics.totalEvaluations })] }), _jsx(Activity, { className: "w-8 h-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Avg Eval Time" }), _jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [Math.round(statistics.evaluationMetrics.averageEvaluationTime), "ms"] })] }), _jsx(Clock, { className: "w-8 h-8 text-purple-600" })] }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Policies by Domain"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [Object.entries(statistics.byDomain).map(([domain, count]) => {
                                                const Icon = getDomainIcon(domain);
                                                return;
                                                _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { className: "w-4 h-4 text-gray-600" }), _jsx("span", { className: "text-sm font-medium", children: domain })] }), _jsx(Badge, { variant: "secondary", children: count })] }, domain);
                                            }), "; })}"] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5" }), "Recent Violations"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: recentViolations.slice(0, 5).map((violation) => ()
                                                < div, key = { violation, : .id }, className = "flex items-start justify-between p-3 bg-red-50 rounded-lg" >
                                                (_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-red-900", children: violation.policyName }), _jsx("p", { className: "text-xs text-red-700 mt-1", children: violation.violation.description }), _jsx("p", { className: "text-xs text-red-600 mt-1", children: new Date(violation.metadata.detectedAt).toLocaleString() })] })
                                                    ,
                                                        _jsxs(Badge, { className: `text-xs ${getSeverityColor(violation.violation.severity)}`, children: ["}", violation.violation.severity] }))) }), "))}"] })] })] })] });
    }
};
div >
;
;
const renderPolicyList = () => ();
;
_jsx("div", { className: "policy-list space-y-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-3 flex-1", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx(Input, { placeholder: "Search policies...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-9 w-full sm:w-64" })] }), _jsxs(Select, { value: domainFilter, onValueChange: (value) => setDomainFilter(value), children: [_jsx(SelectTrigger, { className: "w-full sm:w-48", children: _jsx(SelectValue, { placeholder: "All Domains" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ALL", children: "All Domains" }), domains.map(domain => ()
                                        < SelectItem, key = { domain }, value = { domain } > { domain })] }), "))}"] })] }), _jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [_jsx(SelectTrigger, { className: "w-full sm:w-48", children: _jsx(SelectValue, { placeholder: "All Statuses" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ALL", children: "All Statuses" }), statuses.map(status => ()
                                < SelectItem, key = { status }, value = { status } > { status })] }), "))}"] })] }) })
    ,
        _jsxs(Button, { onClick: () => setIsCreatingPolicy(true), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create Policy"] });
div >
    { /* Policy Cards */}
    < div;
className = "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" >
    { filteredPolicies, : .map((policy) => {
            const Icon = getDomainIcon(policy.domain);
            return;
            _jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { className: "w-5 h-5 text-gray-600" }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: policy.name }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: policy.type })] })] }), _jsx(Badge, { className: getStatusColor(policy.status), children: policy.status })] }) }), _jsxs(CardContent, { className: "pt-0", children: [_jsx("p", { className: "text-sm text-gray-700 mb-4 line-clamp-2", children: policy.description }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-gray-500", children: "Domain:" }), _jsx("span", { className: "font-medium", children: policy.domain })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-gray-500", children: "Enforcement:" }), _jsx(Badge, { variant: policy.enforcement.mode === 'ENFORCE' ? 'default' : 'secondary', children: policy.enforcement.mode })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-gray-500", children: "Rules:" }), _jsx("span", { className: "font-medium", children: policy.configuration.rules.length })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-gray-500", children: "Evaluations:" }), _jsx("span", { className: "font-medium", children: policy.metadata.evaluationCount })] })] }), policy.compliance.frameworks.length > 0 && ()
                                < div, " className=\"mb-4\">", _jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Compliance:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: policy.compliance.frameworks.map(framework => ()
                                    < Badge, key = { framework }, variant = "outline", className = "text-xs" >
                                    { framework }) }), "))}"] })] }, policy.id);
        }) };
{ /* Actions */ }
_jsxs("div", { className: "flex items-center justify-between pt-3 border-t", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedPolicy(policy), children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                        setSelectedPolicy(policy);
                        setIsEditingPolicy(true);
                    }, children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeletePolicy(policy.id), className: "text-red-600 hover:text-red-800", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["v", policy.metadata.version] })] });
CardContent >
;
Card >
;
;
div >
    { filteredPolicies, : .length === 0 && ()
            < div, className = "text-center py-12" >
            (_jsx(Shield, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })
                ,
                    _jsx("p", { className: "text-gray-600 text-lg mb-2", children: "No policies found" })
                        ,
                            _jsx("p", { className: "text-gray-500 text-sm mb-6", children: searchTerm || domainFilter !== 'ALL' || statusFilter !== 'ALL'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first policy to get started' })) };
{
    (!searchTerm && domainFilter === 'ALL' && statusFilter === 'ALL') && ()
        < Button;
    onClick = {}();
    setIsCreatingPolicy(true);
}
 >
    Create;
First;
Policy;
Button >
;
div >
;
div >
;
;
const renderEvaluations = () => ();
;
_jsx("div", { className: "evaluations space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5" }), "Recent Policy Evaluations"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: recentEvaluations.map((evaluation) => ()
                            < div, key = { evaluation, : .evaluationId }, className = "flex items-center justify-between p-4 border rounded-lg" >
                            (_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("p", { className: "font-medium", children: evaluation.policyName }), _jsx(Badge, { className: evaluation.result === 'ALLOW' ? 'bg-green-100 text-green-800' :
                                                evaluation.result === 'DENY' ? 'bg-red-100 text-red-800' :
                                                    evaluation.result === 'RESTRICT' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                            >
                                                                { evaluation, : .result } })] }) })
                                ,
                                    _jsxs("p", { className: "text-sm text-gray-600", children: ["Entity: ", evaluation.requestId, " \u2022 Time: ", evaluation.performance.evaluationTimeMs, "ms \u2022 Confidence: ", Math.round(evaluation.confidence * 100), "%"] })
                                        ,
                                            _jsx("p", { className: "text-xs text-gray-500 mt-1", children: new Date(evaluation.timestamp).toLocaleString() }))) }), _jsxs("div", { className: "flex items-center gap-2", children: [evaluation.metadata.reviewRequired && ()
                                < Badge, " variant=\"outline\" className=\"text-yellow-600\"> Review Required"] }), ")}", evaluation.metadata.escalationRequired && ()
                        < Badge, " variant=\"outline\" className=\"text-red-600\"> Escalation Required"] }), ")}"] }) });
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
const renderCompliance = () => ();
;
_jsxs("div", { className: "compliance space-y-4", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: frameworks.map(framework => ()
                < Card, key = { framework } >
                _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "font-medium text-sm", children: framework }), _jsx(CheckCircle, { className: "w-5 h-5 text-green-600" })] }), _jsxs("p", { className: "text-xs text-gray-600", children: [policies.filter(p => p.compliance.frameworks.includes(framework)).length, " policies"] }), _jsx(Button, { variant: "outline", size: "sm", className: "w-full mt-3", children: "Generate Report" })] })) }), "))}"] });
div >
;
;
if (error) {
    return;
    _jsxs("div", { className: "p-6 text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-600 mx-auto mb-4" }), _jsx("p", { className: "text-red-800 text-lg mb-2", children: "Policy Management Error" }), _jsx("p", { className: "text-red-600 text-sm", children: error })] });
    ;
    return;
    _jsxs("div", { className: `policy-management-dashboard ${className}`, children: ["}", _jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Policy Management" }), _jsx("p", { className: "text-gray-600", children: "Manage security, compliance, and governance policies across the Wild Construct platform" })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "overview", className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "Overview"] }), _jsxs(TabsTrigger, { value: "policies", className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "Policies"] }), _jsxs(TabsTrigger, { value: "evaluations", className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4" }), "Evaluations"] }), _jsxs(TabsTrigger, { value: "compliance", className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Compliance"] })] }), _jsx(TabsContent, { value: "overview", children: renderOverview() }), _jsx(TabsContent, { value: "policies", children: renderPolicyList() }), _jsx(TabsContent, { value: "evaluations", children: renderEvaluations() }), _jsx(TabsContent, { value: "compliance", children: renderCompliance() })] }), isLoading && ()
                < div, " className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50\">", _jsxs("div", { className: "bg-white p-6 rounded-lg", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "text-center mt-2", children: "Processing..." })] })] });
}
_jsx("style", { children: `
        .policy-management-dashboard {
          max-width: 1400px;,
  margin: 0 auto;
          padding: 1rem;
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;,
  overflow: hidden;
        .policy-overview .grid {
          gap: 1rem;
        .policy-list .policy-card {
          transition: all 0.2s ease;
        .policy-list .policy-card:hover {,
  transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        @media (max-width: 768px) {
          .policy-management-dashboard {
            padding: 0.5rem;
          .grid {
            grid-template-columns: 1fr;
      ` });
div >
;
;
;
export default PolicyManagementDashboard;
