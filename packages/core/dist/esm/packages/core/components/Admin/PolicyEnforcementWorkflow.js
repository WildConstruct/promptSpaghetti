import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Policy Enforcement Workflow - E17-1753114397363-F12F4D
 *
 * Integration system for policy enforcement workflows
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Workflow, Play, Pause, CheckCircle, XCircle, Users, FileText, ArrowRight, Eye, Edit3, RefreshCw, Zap, Target, Activity, Bell } from 'lucide-react';
;
steps: EnforcementStep;
status: 'active' | 'paused' | 'disabled';
executionCount: number;
lastExecuted ?  : Date;
successRate: number;
;
order: number;
enabled: boolean;
export const PolicyEnforcementWorkflow = ({
    className = ''
});
{
    const [activeTab, setActiveTab] = useState('workflows');
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [_____isDesignerOpen, setIsDesignerOpen] = useState(false);
    // Mock enforcement actions
    const [enforcementActions] = useState([]);
    {
        id: 'suspend-user',
            type;
        'suspend_user',
            name;
        'Suspend User Account',
            description;
        'Temporarily suspend user account and marketplace access',
            severity;
        'high',
            automated;
        true,
            requiresApproval;
        true,
            reversible;
        true,
        ;
    }
    {
        id: 'restrict-access',
            type;
        'restrict_access',
            name;
        'Restrict Marketplace Access',
            description;
        'Limit user access to specific marketplace features',
            severity;
        'medium',
            automated;
        true,
            requiresApproval;
        false,
            reversible;
        true,
        ;
    }
    {
        id: 'send-warning',
            type;
        'send_warning',
            name;
        'Send Warning Notification',
            description;
        'Send warning notification to user about policy violation',
            severity;
        'low',
            automated;
        true,
            requiresApproval;
        false,
            reversible;
        false;
        ;
        // Mock workflows
        const [workflows] = useState([]);
        {
            workflowId: 'wf-trust-score-low',
                name;
            'Low Trust Score Response',
                description;
            'Automated response to users with critically low trust scores',
                policyId;
            'policy-trust-001',
                policyName;
            'Trust Score Minimum Threshold',
                trigger;
            {
                type: 'violation_detected',
                    conditions;
                ['user.trustScore < 50', 'user.trustTrend == "declining"'],
                ;
            }
            steps: [
                {
                    stepId: 'step-1',
                    name: 'Collect User Data',
                    type: 'data_collection',
                    config: {},
                    order: 1,
                    enabled: true
                },
                {
                    stepId: 'step-2',
                    name: 'Send Warning Notification',
                    type: 'enforcement_action',
                    config: {},
                    action: enforcementActions[2],
                    notificationChannels: ['email', 'in_app'],
                },
                order, 2,
                enabled, true
            ];
        }
        {
            stepId: 'step-3',
                name;
            'Human Review Required',
                type;
            'human_review',
                config;
            {
                approvers: ['admin-trust', 'admin-security'],
                    timeout;
                120; // 2 hours,
            }
            order: 3,
                enabled;
            true;
        }
        {
            stepId: 'step-4',
                name;
            'Restrict Access',
                type;
            'enforcement_action',
                config;
            {
                action: enforcementActions[1],
                ;
            }
            order: 4,
                enabled;
            true;
            status: 'active',
                executionCount;
            23,
                lastExecuted;
            new Date(Date.now() - 2 * 60 * 60 * 1000),
                successRate;
            87.5;
        }
        {
            workflowId: 'wf-fraud-detection',
                name;
            'Fraud Detection Response',
                description;
            'Immediate response to detected fraudulent activity',
                policyId;
            'policy-fraud-001',
                policyName;
            'Suspicious Transaction Detection',
                trigger;
            {
                type: 'violation_detected',
                    conditions;
                ['fraud.confidence > 0.8'],
                ;
            }
            steps: [
                {
                    stepId: 'step-1',
                    name: 'Block Transaction',
                    type: 'enforcement_action',
                    config: {},
                    action: { id: 'block-txn', type: 'block_transaction', name: 'Block Transaction', description: 'Immediately block suspicious transaction', severity: 'critical', automated: true, requiresApproval: false, reversible: true }
                },
                order, 1,
                enabled, true
            ];
        }
        {
            stepId: 'step-2',
                name;
            'Notify Security Team',
                type;
            'notification',
                config;
            {
                notificationChannels: ['email', 'webhook'],
                ;
            }
            order: 2,
                enabled;
            true;
            status: 'active',
                executionCount;
            8,
                lastExecuted;
            new Date(Date.now() - 4 * 60 * 60 * 1000),
                successRate;
            100;
            ;
            // Mock executions
            const [executions] = useState([]);
            {
                executionId: 'exec-001',
                    workflowId;
                'wf-trust-score-low',
                    workflowName;
                'Low Trust Score Response',
                    triggeredBy;
                'system',
                    triggeredAt;
                new Date(Date.now() - 30 * 60 * 1000),
                    status;
                'pending_approval',
                    currentStep;
                3,
                    totalSteps;
                4,
                    entityType;
                'user',
                    entityId;
                'user-123',
                    context;
                {
                    trustScore: 42,
                        previousScore;
                    58,
                        violationCount;
                    3,
                    ;
                }
                {
                    executionId: 'exec-002',
                        workflowId;
                    'wf-fraud-detection',
                        workflowName;
                    'Fraud Detection Response',
                        triggeredBy;
                    'automated_detection',
                        triggeredAt;
                    new Date(Date.now() - 4 * 60 * 60 * 1000),
                        status;
                    'completed',
                        currentStep;
                    2,
                        totalSteps;
                    2,
                        entityType;
                    'transaction',
                        entityId;
                    'txn-456',
                        context;
                    {
                        fraudScore: 0.92,
                            suspiciousPatterns;
                        ['multiple_cards', 'velocity_anomaly'],
                            blockedAmount;
                        2500;
                        ;
                        const getStatusColor = (status) => {
                            switch (status) {
                                case 'active': return 'text-green-600 bg-green-100';
                                case 'paused': return 'text-yellow-600 bg-yellow-100';
                                case 'disabled': return 'text-gray-600 bg-gray-100';
                                case 'running': return 'text-blue-600 bg-blue-100';
                                case 'completed': return 'text-green-600 bg-green-100';
                                case 'failed': return 'text-red-600 bg-red-100';
                                case 'cancelled': return 'text-gray-600 bg-gray-100';
                                case 'pending_approval': return 'text-orange-600 bg-orange-100';
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
                                const getStepIcon = (type) => {
                                    switch (type) {
                                        case 'enforcement_action': return Zap;
                                        case 'notification': return Bell;
                                        case 'human_review': return Users;
                                        case 'condition_check': return CheckCircle;
                                        case 'data_collection': return FileText;
                                        default: return Activity;
                                    }
                                    ;
                                    const renderWorkflowsList = () => ();
                                    ;
                                    _jsxs("div", { className: "workflows-section", children: [_jsxs("div", { className: "workflows-header", children: [_jsx("h3", { children: "Enforcement Workflows" }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { onClick: () => setIsDesignerOpen(true), children: [_jsx(Workflow, { className: "w-4 h-4 mr-2" }), "Create Workflow"] })] })] }), _jsxs("div", { className: "workflows-grid", children: [workflows.map(workflow => ()
                                                        < Card, key = { workflow, : .workflowId }, className = "workflow-card" >
                                                        (_jsx(CardHeader, { children: _jsxs("div", { className: "workflow-header", children: [_jsxs("div", { className: "workflow-info", children: [_jsx("h4", { children: workflow.name }), _jsx("p", { children: workflow.description })] }), _jsx(Badge, { className: getStatusColor(workflow.status), children: workflow.status.toUpperCase() })] }) })
                                                            ,
                                                                _jsxs(CardContent, { children: [_jsxs("div", { className: "workflow-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Policy" }), _jsx("span", { className: "detail-value", children: workflow.policyName })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Steps" }), _jsx("span", { className: "detail-value", children: workflow.steps.length })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Executions" }), _jsx("span", { className: "detail-value", children: workflow.executionCount })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Success Rate" }), _jsxs("span", { className: "detail-value", children: [workflow.successRate, "%"] })] })] }), _jsxs("div", { className: "workflow-steps-preview", children: [_jsx("h5", { children: "Workflow Steps" }), _jsxs("div", { className: "steps-flow", children: [workflow.steps.slice(0, 3).map((step, index) => {
                                                                                            const StepIcon = getStepIcon(step.type);
                                                                                            return;
                                                                                            _jsxs(React.Fragment, { children: [_jsxs("div", { className: "step-preview", children: [_jsx(StepIcon, { className: "w-4 h-4" }), _jsx("span", { children: step.name })] }), index < Math.min(workflow.steps.length - 1, 2) && ()
                                                                                                        < ArrowRight, " className=\"w-3 h-3 text-gray-400\" /> )}"] }, step.stepId);
                                                                                        }), "; })}", workflow.steps.length > 3 && ()
                                                                                            < span, " className=\"more-steps\">+", workflow.steps.length - 3, " more"] }), ")}"] })] })
                                                                    ,
                                                                        _jsxs("div", { className: "workflow-actions", children: [_jsxs(Button, { onClick: () => setSelectedWorkflow(workflow), size: "sm", variant: "outline", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "View"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Edit3, { className: "w-4 h-4 mr-1" }), "Edit"] }), workflow.status === 'active' ? ()
                                                                                    < Button : , " size=\"sm\" variant=\"outline\">", _jsx(Pause, { className: "w-4 h-4 mr-1" }), "Pause"] }))), " : ()", _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Play, { className: "w-4 h-4 mr-1" }), "Start"] }), ")}"] })] });
                                };
                            };
                        };
                        Card >
                        ;
                    }
                    div >
                    ;
                    div >
                    ;
                    ;
                    const renderExecutionsList = () => ();
                    ;
                    _jsx("div", { className: "executions-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Executions" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "executions-list", children: executions.map(execution => ()
                                                < div, key = { execution, : .executionId }, className = "execution-item" >
                                                _jsxs("div", { className: "execution-main", children: [_jsxs("div", { className: "execution-info", children: [_jsxs("div", { className: "execution-title", children: [execution.workflowName, _jsx(Badge, { className: getStatusColor(execution.status), children: execution.status.replace('_', ' ').toUpperCase() })] }), _jsxs("div", { className: "execution-meta", children: [_jsxs("span", { children: [execution.entityType, ": ", execution.entityId] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Started: ", execution.triggeredAt.toLocaleString()] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["By: ", execution.triggeredBy] })] })] }), _jsx("div", { className: "execution-progress", children: _jsxs("div", { className: "progress-bar", children: [_jsx("div", { className: "progress-fill", style: {
                                                                            width: `${(execution.currentStep / execution.totalSteps) * 100}%`
                                                                        } }), "} >"] }) }), _jsxs("span", { className: "progress-text", children: ["Step ", execution.currentStep, " of ", execution.totalSteps] })] })) }), execution.status === 'pending_approval' && ()
                                            < div, " className=\"execution-actions\">", _jsxs(Button, { size: "sm", className: "approve-btn", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Approve"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "reject-btn", children: [_jsx(XCircle, { className: "w-4 h-4 mr-1" }), "Reject"] })] }), ")}", _jsxs("div", { className: "execution-context", children: [_jsx("h6", { children: "Execution Context" }), _jsx("div", { className: "context-items", children: Object.entries(execution.context).map(([key, value]) => ()
                                                < div, key = { key }, className = "context-item" >
                                                (_jsxs("span", { className: "context-key", children: [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), ":"] })
                                                    ,
                                                        _jsx("span", { className: "context-value", children: typeof value === 'object' ? JSON.stringify(value) : String(value) }))) }), "))}"] })] }) });
                    div >
                    ;
                }
                div >
                ;
                CardContent >
                ;
                Card >
                ;
                div >
                ;
                ;
                const renderWorkflowDetails = () => {
                    if (!selectedWorkflow)
                        return null;
                    return;
                    _jsx("div", { className: "workflow-details-overlay", children: _jsxs(Card, { className: "workflow-details-modal", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "details-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h3", { children: selectedWorkflow.name }), _jsx(Badge, { className: getStatusColor(selectedWorkflow.status), children: selectedWorkflow.status.toUpperCase() })] }), _jsx(Button, { onClick: () => setSelectedWorkflow(null), variant: "outline", size: "sm", children: _jsx(XCircle, { className: "w-4 h-4" }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "workflow-visualization", children: [_jsx("h4", { children: "Workflow Steps" }), _jsx("div", { className: "steps-diagram", children: selectedWorkflow.steps.map((step, index) => {
                                                        const StepIcon = getStepIcon(step.type);
                                                        return;
                                                        _jsx(React.Fragment, { children: _jsxs("div", { className: `step-node ${step.enabled ? 'enabled' : 'disabled'}`, children: ["}", _jsx("div", { className: "step-icon", children: _jsx(StepIcon, { className: "w-5 h-5" }) }), _jsxs("div", { className: "step-content", children: [_jsx("h5", { children: step.name }), _jsx("p", { children: step.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }), step.config.action && ()
                                                                                < Badge, " className=", getSeverityColor(step.config.action.severity), ">", step.config.action.severity.toUpperCase()] }), ")}"] }) }, step.stepId);
                                                        {
                                                            index < selectedWorkflow.steps.length - 1 && ()
                                                                < div;
                                                            className = "step-connector" >
                                                                _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" });
                                                        }
                                                    }) }), ")}"] }), "); })}"] })] }) })
                        ,
                            _jsxs("div", { className: "workflow-config", children: [_jsx("h4", { children: "Configuration" }), _jsxs("div", { className: "config-grid", children: [_jsxs("div", { className: "config-item", children: [_jsx("span", { className: "config-label", children: "Trigger Type" }), _jsx("span", { className: "config-value", children: selectedWorkflow.trigger.type.replace('_', ' ') })] }), _jsxs("div", { className: "config-item", children: [_jsx("span", { className: "config-label", children: "Policy" }), _jsx("span", { className: "config-value", children: selectedWorkflow.policyName })] }), _jsxs("div", { className: "config-item", children: [_jsx("span", { className: "config-label", children: "Success Rate" }), _jsxs("span", { className: "config-value", children: [selectedWorkflow.successRate, "%"] })] }), _jsxs("div", { className: "config-item", children: [_jsx("span", { className: "config-label", children: "Last Executed" }), _jsx("span", { className: "config-value", children: selectedWorkflow.lastExecuted?.toLocaleString() || 'Never' })] })] })] });
                };
                CardContent >
                ;
                Card >
                ;
                div >
                ;
                ;
            }
            ;
            return;
            _jsxs("div", { className: `policy-enforcement-workflow ${className}`, children: ["}", _jsx("div", { className: "workflow-header", children: _jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Policy Enforcement Workflows" }), _jsx("p", { children: "Manage automated enforcement workflows and monitor executions" })] }) }), _jsx("div", { className: "workflow-tabs", children: _jsxs("div", { className: "tab-buttons", children: [_jsxs("button", { onClick: () => setActiveTab('workflows'), className: `tab-button ${activeTab === 'workflows' ? 'active' : ''}`, children: [_jsx(Workflow, { className: "w-4 h-4" }), "Workflows (", workflows.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('executions'), className: `tab-button ${activeTab === 'executions' ? 'active' : ''}`, children: [_jsx(Activity, { className: "w-4 h-4" }), "Executions (", executions.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('actions'), className: `tab-button ${activeTab === 'actions' ? 'active' : ''}`, children: [_jsx(Target, { className: "w-4 h-4" }), "Actions (", enforcementActions.length, ")"] })] }) }), _jsxs("div", { className: "tab-content", children: [activeTab === 'workflows' && renderWorkflowsList(), activeTab === 'executions' && renderExecutionsList(), activeTab === 'actions' && ()
                                < Card >
                                (_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Enforcement Actions" }) })
                                    ,
                                        _jsxs(CardContent, { children: [_jsx("div", { className: "actions-grid", children: enforcementActions.map(action => ()
                                                        < div, key = { action, : .id }, className = "action-card" >
                                                        (_jsxs("div", { className: "action-header", children: [_jsx("h5", { children: action.name }), _jsx(Badge, { className: getSeverityColor(action.severity), children: action.severity.toUpperCase() })] })
                                                            ,
                                                                _jsx("p", { children: action.description })
                                                                    ,
                                                                        _jsxs("div", { className: "action-properties", children: [action.automated && _jsx(Badge, { className: "property-badge", children: "Automated" }), action.requiresApproval && _jsx(Badge, { className: "property-badge", children: "Requires Approval" }), action.reversible && _jsx(Badge, { className: "property-badge", children: "Reversible" })] }))) }), "))}"] }))] })] });
        }
        div >
            { selectedWorkflow } && renderWorkflowDetails();
    }
    _jsx("style", { children: `
        .policy-enforcement-workflow {
          max-width: 1400px;,
  margin: 0 auto;
          padding: 1.5rem;,
  display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .workflow-header {
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
        .workflow-tabs {
          border-bottom: 1px solid #e5e7eb;
        .tab-buttons {
          display: flex;,
  gap: 0.5rem;
        .tab-button {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          padding: 0.75rem 1rem;,
  border: none;
          background: none;,
  color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;,
  transition: all 0.2s ease;
        .tab-button:hover {,
  color: #374151;
        .tab-button.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        .workflows-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        .workflows-header h3 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0;
        .header-actions {
          display: flex;,
  gap: 0.5rem;
        .workflows-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 1rem;
        .workflow-card .card-content {
          padding-top: 0;
        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;,
  gap: 1rem;
        .workflow-info h4 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 0.5rem 0;
        .workflow-info p {
          color: #6b7280;
          font-size: 0.875rem;,
  margin: 0;
        .workflow-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;,
  padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        .detail-item {
          display: flex;
          justify-content: space-between;
        .detail-label {
          font-size: 0.875rem;,
  color: #6b7280;
        .detail-value {
          font-size: 0.875rem;,
  color: #1f2937;
          font-weight: 500;
        .workflow-steps-preview h5 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 0.75rem 0;
        .steps-flow {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          flex-wrap: wrap;
        .step-preview {
          display: flex;
          align-items: center;,
  gap: 0.375rem;
          padding: 0.375rem 0.5rem;,
  background: #f3f4f6;
          border-radius: 4px;
          font-size: 0.75rem;,
  color: #374151;
        .more-steps {
          font-size: 0.75rem;,
  color: #6b7280;
          font-style: italic;
        .workflow-actions {
          display: flex;,
  gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        .executions-list {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .execution-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;,
  padding: 1rem;
        .execution-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        .execution-info {
          flex: 1;
        .execution-title {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 0.5rem;
        .execution-meta {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          font-size: 0.75rem;,
  color: #6b7280;
        .execution-progress {
          display: flex;
          flex-direction: column;
          align-items: flex-end;,
  gap: 0.25rem;
          min-width: 120px;
        .progress-bar {
          width: 100%;,
  height: 6px;
          background: #e5e7eb;
          border-radius: 3px;,
  overflow: hidden;
        .progress-fill {
          height: 100%;,
  background: #3b82f6;
          transition: width 0.3s ease;
        .progress-text {
          font-size: 0.75rem;,
  color: #6b7280;
        .execution-actions {
          display: flex;,
  gap: 0.5rem;
          margin-bottom: 0.75rem;
        .approve-btn {
          background: #059669;
          border-color: #059669;
        .approve-btn:hover {,
  background: #047857;
          border-color: #047857;
        .reject-btn {
          color: #dc2626;
          border-color: #dc2626;
        .reject-btn:hover {,
  background: #dc2626;,
  color: white;
        .execution-context h6 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 0.5rem 0;
        .context-items {
          display: flex;
          flex-direction: column;,
  gap: 0.25rem;
        .context-item {
          display: flex;,
  gap: 0.5rem;
          font-size: 0.875rem;
        .context-key {
          color: #6b7280;
          font-weight: 500;
        .context-value {
          color: #1f2937;
        .workflow-details-overlay {
          position: fixed;,
  top: 0;
          left: 0;,
  right: 0;
          bottom: 0;,
  background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;,
  padding: 1rem;
        .workflow-details-modal {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .header-info {
          display: flex;
          align-items: center;,
  gap: 0.75rem;
        .header-info h3 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0;
        .workflow-visualization h4 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 1rem 0;
        .steps-diagram {
          display: flex;
          align-items: center;,
  gap: 1rem;
          padding: 1rem;,
  background: #f9fafb;
          border-radius: 8px;
          overflow-x: auto;
        .step-node {
          display: flex;
          flex-direction: column;
          align-items: center;,
  gap: 0.5rem;
          min-width: 120px;,
  padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;,
  background: white;
        .step-node.enabled {
          border-color: #3b82f6;
        .step-node.disabled {
          opacity: 0.5;
        .step-icon {
          padding: 0.5rem;,
  background: #eff6ff;
          border-radius: 50%;
        .step-content {
          text-align: center;
        .step-content h5 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
        .step-content p {
          font-size: 0.75rem;,
  color: #6b7280;
          margin: 0 0 0.5rem 0;
        .step-connector {
          display: flex;
          align-items: center;
        .workflow-config {
          margin-top: 1.5rem;
        .workflow-config h4 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 1rem 0;
        .config-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        .config-item {
          display: flex;
          justify-content: space-between;,
  padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        .config-label {
          font-weight: 500;,
  color: #374151;
        .config-value {
          color: #1f2937;
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        .action-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;,
  padding: 1rem;
        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        .action-header h5 {
          font-weight: 600;,
  color: #1f2937;
          margin: 0;
        .action-card p {
          color: #6b7280;
          font-size: 0.875rem;,
  margin: 0 0 1rem 0;
        .action-properties {
          display: flex;
          flex-wrap: wrap;,
  gap: 0.5rem;
        .property-badge {
          font-size: 0.75rem;,
  padding: 0.125rem 0.375rem;
        @media (max-width: 1200px) {
          .workflows-grid {
            grid-template-columns: 1fr;
          .workflow-details {
            grid-template-columns: 1fr;
          .config-grid {
            grid-template-columns: 1fr;
        @media (max-width: 768px) {
          .workflow-header {
            flex-direction: column;
            align-items: stretch;,
  gap: 1rem;
          .workflows-header {
            flex-direction: column;
            align-items: stretch;,
  gap: 1rem;
          .tab-buttons {
            flex-direction: column;
          .steps-diagram {
            flex-direction: column;
            align-items: stretch;
          .step-connector {
            transform: rotate(90deg);
            align-self: center;
          .execution-main {
            flex-direction: column;,
  gap: 1rem;
            align-items: stretch;
          .actions-grid {
            grid-template-columns: 1fr;
      ` });
    div >
    ;
    ;
}
;
export default PolicyEnforcementWorkflow;
