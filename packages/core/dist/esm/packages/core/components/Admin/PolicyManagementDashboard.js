import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Policy Management Dashboard - E17-1753114397363-F12F4D
 *
 * Administrative interface for marketplace policy management
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Shield, AlertTriangle, CheckCircle, Clock, Plus, Edit3, Trash2, Eye, Flag, TrendingUp, Search, RefreshCw, Download } from 'lucide-react';
export const PolicyManagementDashboard = ({
    className = ''
});
{
    const [activeTab, setActiveTab] = useState('overview');
    const [_____selectedPolicy, _____setSelectedPolicy] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [_____isLoading, _____setIsLoading] = useState(false);
    // Mock data - in real implementation, this would come from PolicyManagementService
    const [policies, setPolicies] = useState([]);
    {
        id: 'policy-trust-001',
            name;
        'Trust Score Minimum Threshold',
            type;
        'trust_score',
            status;
        'active',
            severity;
        'high',
            enabled;
        true,
            violationsCount;
        12,
            lastTriggered;
        new Date(Date.now() - 2 * 60 * 60 * 1000),
            effectiveFrom;
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            description;
        'Enforces minimum trust score requirements for marketplace participation',
            version;
        '1.2.0',
            createdBy;
        'admin-jane',
            updatedAt;
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        ;
    }
    {
        id: 'policy-fraud-001',
            name;
        'Suspicious Transaction Detection',
            type;
        'fraud_detection',
            status;
        'active',
            severity;
        'critical',
            enabled;
        true,
            violationsCount;
        3,
            lastTriggered;
        new Date(Date.now() - 4 * 60 * 60 * 1000),
            effectiveFrom;
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            description;
        'Detects and flags potentially fraudulent transaction patterns',
            version;
        '2.1.0',
            createdBy;
        'admin-security',
            updatedAt;
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        ;
    }
    {
        id: 'policy-content-001',
            name;
        'Template Quality Standards',
            type;
        'content_quality',
            status;
        'active',
            severity;
        'medium',
            enabled;
        true,
            violationsCount;
        45,
            lastTriggered;
        new Date(Date.now() - 30 * 60 * 1000),
            effectiveFrom;
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            description;
        'Enforces quality standards for marketplace templates',
            version;
        '1.0.0',
            createdBy;
        'admin-content',
            updatedAt;
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        ;
        const [violations, _____setViolations] = useState([]);
        {
            violationId: 'violation-001',
                policyId;
            'policy-trust-001',
                policyName;
            'Trust Score Minimum Threshold',
                entityType;
            'user',
                entityId;
            'user-123',
                violationType;
            'trust_score_below_threshold',
                severity;
            'high',
                detectedAt;
            new Date(Date.now() - 2 * 60 * 60 * 1000),
                status;
            'pending',
                description;
            'User trust score (45) below minimum threshold (60)',
            ;
        }
        {
            violationId: 'violation-002',
                policyId;
            'policy-fraud-001',
                policyName;
            'Suspicious Transaction Detection',
                entityType;
            'transaction',
                entityId;
            'txn-456',
                violationType;
            'suspicious_payment_pattern',
                severity;
            'critical',
                detectedAt;
            new Date(Date.now() - 4 * 60 * 60 * 1000),
                status;
            'reviewed',
                reviewedBy;
            'admin-security',
                description;
            'Multiple failed payment attempts from different cards';
            ;
            const getStatusColor = (status) => {
                switch (status) {
                    case 'active': return 'text-green-600 bg-green-100';
                    case 'inactive': return 'text-gray-600 bg-gray-100';
                    case 'draft': return 'text-blue-600 bg-blue-100';
                    case 'suspended': return 'text-red-600 bg-red-100';
                    default: return 'text-gray-600 bg-gray-100';
                }
                ;
                const getSeverityColor = (severity) => {
                    switch (severity) {
                        case 'critical': return 'text-red-600 bg-red-100';
                        case 'high': return 'text-orange-600 bg-orange-100';
                        case 'medium': return 'text-yellow-600 bg-yellow-100';
                        case 'low': return 'text-blue-600 bg-blue-100';
                        default: return 'text-gray-600 bg-gray-100';
                    }
                    ;
                    const getViolationStatusColor = (status) => {
                        switch (status) {
                            case 'pending': return 'text-yellow-600 bg-yellow-100';
                            case 'reviewed': return 'text-blue-600 bg-blue-100';
                            case 'dismissed': return 'text-gray-600 bg-gray-100';
                            case 'enforced': return 'text-green-600 bg-green-100';
                            default: return 'text-gray-600 bg-gray-100';
                        }
                        ;
                        const handlePolicyToggle = (policyId) => {
                            setPolicies(prev => );
                            prev.map(policy => );
                            policy.id === policyId
                                ? { ...policy, enabled: !policy.enabled }
                                : policy;
                        };
                    };
                };
            };
            ;
        }
        ;
        const filteredPolicies = policies.filter(policy => { });
        const matchesSearch = searchTerm === '' || ;
        policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
        const matchesType = typeFilter === 'all' || policy.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    }
    ;
    const renderOverview = () => {
        const totalPolicies = policies.length;
        const activePolicies = policies.filter(p => p.enabled).length;
        const totalViolations = violations.length;
        const pendingViolations = violations.filter(v => v.status === 'pending').length;
        return;
        _jsxs("div", { className: "overview-section", children: [_jsxs("div", { className: "metrics-grid", children: [_jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Shield, { className: "w-6 h-6 text-blue-500" }), _jsxs("span", { className: "metric-trend positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+2"] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: totalPolicies }), _jsx("div", { className: "metric-label", children: "Total Policies" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(CheckCircle, { className: "w-6 h-6 text-green-500" }), _jsxs("span", { className: "metric-percentage", children: [Math.round((activePolicies / totalPolicies) * 100), "%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: activePolicies }), _jsx("div", { className: "metric-label", children: "Active Policies" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-orange-500" }), _jsxs("span", { className: "metric-trend negative", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+5"] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: totalViolations }), _jsx("div", { className: "metric-label", children: "Total Violations" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Clock, { className: "w-6 h-6 text-yellow-500" }), _jsx(Badge, { className: "text-red-600 bg-red-100", children: "URGENT" })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: pendingViolations }), _jsx("div", { className: "metric-label", children: "Pending Review" })] })] }) })] }), _jsx("div", { className: "recent-activity", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Policy Activity" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "activity-list", children: violations.slice(0, 5).map(violation => ()
                                            < div, key = { violation, : .violationId }, className = "activity-item" >
                                            (_jsx("div", { className: "activity-icon", children: _jsx(Flag, { className: "w-4 h-4 text-orange-500" }) })
                                                ,
                                                    _jsxs("div", { className: "activity-content", children: [_jsxs("div", { className: "activity-title", children: [violation.policyName, " violation"] }), _jsxs("div", { className: "activity-description", children: [violation.entityType, " ", violation.entityId, ": ", violation.description] }), _jsx("div", { className: "activity-time", children: violation.detectedAt.toLocaleString() })] })
                                                        ,
                                                            _jsx(Badge, { className: getViolationStatusColor(violation.status), children: violation.status.toUpperCase() }))) }), "))}"] })] }) })] });
    };
    div >
    ;
    ;
}
;
const renderPolicies = () => ();
;
_jsxs("div", { className: "policies-section", children: [_jsxs("div", { className: "policies-controls", children: [_jsxs("div", { className: "search-filters", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search policies...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "suspended", children: "Suspended" })] }), _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "trust_score", children: "Trust Score" }), _jsx("option", { value: "fraud_detection", children: "Fraud Detection" }), _jsx("option", { value: "content_quality", children: "Content Quality" }), _jsx("option", { value: "user_behavior", children: "User Behavior" }), _jsx("option", { value: "transaction_monitoring", children: "Transaction" })] })] }), _jsxs("div", { className: "action-buttons", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Policy"] })] })] }), _jsx("div", { className: "policies-list", children: filteredPolicies.map(policy => ()
                < Card, key = { policy, : .id }, className = "policy-card" >
                _jsxs(CardContent, { children: [_jsxs("div", { className: "policy-header", children: [_jsxs("div", { className: "policy-info", children: [_jsxs("div", { className: "policy-title", children: [_jsx("h4", { children: policy.name }), _jsxs("div", { className: "policy-badges", children: [_jsx(Badge, { className: getStatusColor(policy.status), children: policy.status.toUpperCase() }), _jsx(Badge, { className: getSeverityColor(policy.severity), children: policy.severity.toUpperCase() })] })] }), _jsx("p", { className: "policy-description", children: policy.description })] }), _jsx("div", { className: "policy-toggle", children: _jsxs("label", { className: "toggle-switch", children: [_jsx("input", { type: "checkbox", checked: policy.enabled, onChange: () => handlePolicyToggle(policy.id) }), _jsx("span", { className: "toggle-slider" })] }) })] }), _jsxs("div", { className: "policy-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Violations" }), _jsx("span", { className: "stat-value", children: policy.violationsCount })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Version" }), _jsx("span", { className: "stat-value", children: policy.version })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Last Triggered" }), _jsx("span", { className: "stat-value", children: policy.lastTriggered ? policy.lastTriggered.toLocaleDateString() : 'Never' })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Updated" }), _jsx("span", { className: "stat-value", children: policy.updatedAt.toLocaleDateString() })] })] }), _jsxs("div", { className: "policy-actions", children: [_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "View"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Edit3, { className: "w-4 h-4 mr-1" }), "Edit"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "text-red-600", children: [_jsx(Trash2, { className: "w-4 h-4 mr-1" }), "Delete"] })] })] })) }), "))}"] });
div >
;
;
const renderViolations = () => ();
;
_jsx("div", { className: "violations-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "violations-header", children: [_jsx(CardTitle, { children: "Policy Violations" }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "violations-list", children: violations.map(violation => ()
                            < div, key = { violation, : .violationId }, className = "violation-item" >
                            (_jsx("div", { className: "violation-main", children: _jsxs("div", { className: "violation-info", children: [_jsxs("div", { className: "violation-title", children: [violation.policyName, _jsx(Badge, { className: getSeverityColor(violation.severity), children: violation.severity.toUpperCase() })] }), _jsx("div", { className: "violation-description", children: violation.description }), _jsxs("div", { className: "violation-meta", children: [_jsxs("span", { children: [violation.entityType, ": ", violation.entityId] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Detected: ", violation.detectedAt.toLocaleString()] }), violation.reviewedBy && ()
                                                    <  >
                                                    (_jsx("span", { children: "\u2022" })
                                                        ,
                                                            _jsxs("span", { children: ["Reviewed by: ", violation.reviewedBy] }))] }), ")}"] }) })
                                ,
                                    _jsx("div", { className: "violation-status", children: _jsx(Badge, { className: getViolationStatusColor(violation.status), children: violation.status.toUpperCase() }) }))) }), violation.status === 'pending' && ()
                        < div, " className=\"violation-actions\">", _jsx(Button, { size: "sm", className: "approve-btn", children: "Dismiss" }), _jsx(Button, { size: "sm", variant: "outline", className: "enforce-btn", children: "Enforce" }), _jsx(Button, { size: "sm", variant: "outline", children: "Review" })] }), ")}"] }) });
div >
;
CardContent >
;
Card >
;
div >
;
;
return;
_jsxs("div", { className: `policy-management-dashboard ${className}`, children: ["}", _jsx("div", { className: "dashboard-header", children: _jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Policy Management" }), _jsx("p", { children: "Configure and monitor marketplace policies and enforcement" })] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "dashboard-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsxs(TabsTrigger, { value: "policies", children: ["Policies", _jsx(Badge, { className: "ml-2 text-xs", children: policies.length })] }), _jsxs(TabsTrigger, { value: "violations", children: ["Violations", _jsx(Badge, { className: "ml-2 text-xs bg-orange-100 text-orange-600", children: violations.filter(v => v.status === 'pending').length })] }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: renderOverview() }), _jsx(TabsContent, { value: "policies", className: "tab-content", children: renderPolicies() }), _jsx(TabsContent, { value: "violations", className: "tab-content", children: renderViolations() }), _jsx(TabsContent, { value: "analytics", className: "tab-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Policy Analytics" }) }), _jsx(CardContent, { children: _jsx("p", { children: "Policy performance analytics and trends coming soon..." }) })] }) })] }), _jsx("style", { children: `
        .policy-management-dashboard {
          max-width: 1400px;,
  margin: 0 auto;
          padding: 1.5rem;,
  display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;,
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .overview-section {
          display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        .metric-card .card-content {
          padding: 1.5rem;
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        .metric-trend {
          display: flex;
          align-items: center;,
  gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;,
  padding: 0.25rem 0.5rem;
          border-radius: 4px;
        .metric-trend.positive {
          color: #059669;,
  background: #d1fae5;
        .metric-trend.negative {
          color: #dc2626;,
  background: #fee2e2;
        .metric-percentage {
          font-size: 0.875rem;
          font-weight: 600;,
  color: #059669;
        .metric-content {
          text-align: center;
        .metric-value {
          font-size: 2rem;
          font-weight: 700;,
  color: #1f2937;
          line-height: 1;
        .metric-label {
          font-size: 0.875rem;,
  color: #6b7280;
          margin-top: 0.5rem;
        .activity-list {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .activity-item {
          display: flex;
          align-items: flex-start;,
  gap: 0.75rem;
          padding: 0.75rem;,
  border: 1px solid #e5e7eb;
          border-radius: 6px;
        .activity-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        .activity-content {
          flex: 1;
        .activity-title {
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 0.25rem;
        .activity-description {
          font-size: 0.875rem;,
  color: #6b7280;
          margin-bottom: 0.5rem;
        .activity-time {
          font-size: 0.75rem;,
  color: #9ca3af;
        .policies-section {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .policies-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;,
  gap: 1rem;
          padding: 1rem;,
  background: #f9fafb;
          border-radius: 8px;
        .search-filters {
          display: flex;,
  gap: 0.75rem;
          flex: 1;
        .search-bar {
          position: relative;,
  flex: 1;
          max-width: 300px;
        .search-bar .lucide {
          position: absolute;,
  left: 0.75rem;
          top: 50%;,
  transform: translateY(-50%);
          z-index: 1;
        .search-input {
          width: 100%;,
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .search-input:focus {,
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        .filter-select {
          padding: 0.5rem;,
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;,
  background: white;
          min-width: 120px;
        .action-buttons {
          display: flex;,
  gap: 0.5rem;
        .policies-list {
          display: flex;
          flex-direction: column;,
  gap: 0.75rem;
        .policy-card .card-content {
          padding: 1.5rem;
        .policy-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        .policy-info {
          flex: 1;
        .policy-title {
          display: flex;
          align-items: center;,
  gap: 0.75rem;
          margin-bottom: 0.5rem;
        .policy-title h4 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0;
        .policy-badges {
          display: flex;,
  gap: 0.5rem;
        .policy-description {
          color: #6b7280;
          font-size: 0.875rem;,
  margin: 0;
        .policy-toggle {
          margin-left: 1rem;
        .toggle-switch {
          position: relative;,
  display: inline-block;
          width: 50px;,
  height: 24px;
        .toggle-switch input {
          opacity: 0;,
  width: 0;
          height: 0;
        .toggle-slider {
          position: absolute;,
  cursor: pointer;
          top: 0;,
  left: 0;
          right: 0;,
  bottom: 0;
          background-color: #ccc;,
  transition: 0.3s;
          border-radius: 24px;
        .toggle-slider:before {,
  position: absolute;,
  content: "";
  height: 18px;,
  width: 18px;
  left: 3px;,
  bottom: 3px;
          background-color: white;,
  transition: 0.3s;
          border-radius: 50%;,
  input:checked + .toggle-slider {,
          background-color: #3b82f6;,
  input:checked + .toggle-slider:before {,
  transform: translateX(26px);
        .policy-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;,
  padding: 1rem 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        .stat-item {
          display: flex;
          flex-direction: column;,
  gap: 0.25rem;
          text-align: center;
        .stat-label {
          font-size: 0.75rem;,
  color: #6b7280;
          font-weight: 500;
        .stat-value {
          font-size: 0.875rem;,
  color: #1f2937;
          font-weight: 600;
        .policy-actions {
          display: flex;,
  gap: 0.5rem;
          justify-content: flex-end;
        .violations-section {
          display: flex;
          flex-direction: column;
        .violations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .violations-list {
          display: flex;
          flex-direction: column;,
  gap: 0.75rem;
        .violation-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;,
  padding: 1rem;
        .violation-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        .violation-info {
          flex: 1;
        .violation-title {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 0.5rem;
        .violation-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        .violation-meta {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          font-size: 0.75rem;,
  color: #9ca3af;
        .violation-actions {
          display: flex;,
  gap: 0.5rem;
          justify-content: flex-end;
        .approve-btn {
          background: #059669;
          border-color: #059669;
        .approve-btn:hover {,
  background: #047857;
          border-color: #047857;
        .enforce-btn {
          color: #dc2626;
          border-color: #dc2626;
        .enforce-btn:hover {,
  background: #dc2626;,
  color: white;
        @media (max-width: 1200px) {
          .policy-stats {
            grid-template-columns: repeat(2, 1fr);
          .policies-controls {
            flex-direction: column;
            align-items: stretch;
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          .search-filters {
            flex-direction: column;
          .search-bar {
            max-width: none;
          .policy-header {
            flex-direction: column;,
  gap: 1rem;
            align-items: stretch;
          .policy-stats {
            grid-template-columns: repeat(2, 1fr);
          .violation-main {
            flex-direction: column;,
  gap: 1rem;
        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          .policy-stats {
            grid-template-columns: 1fr;
      ` })] });
;
;
export default PolicyManagementDashboard;
