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
import { 
  Workflow,
  Play,
  Pause,
  Square,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Shield,
  FileText,
  Settings,
  ArrowRight,
  Eye,
  Edit3,
  RefreshCw,
  Zap,
  Target,
  Activity,
  Bell,
  Mail,
  MessageSquare
} from 'lucide-react';

export interface EnforcementAction {
  id: string;
  type: 'suspend_user' | 'restrict_access' | 'hide_template' | 'block_transaction' | 'send_warning' | 'require_verification';
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
  requiresApproval: boolean;
  reversible: boolean;
}

export interface EnforcementWorkflow {
  workflowId: string;
  name: string;
  description: string;
  policyId: string;
  policyName: string;
  trigger: {
    type: 'violation_detected' | 'manual_trigger' | 'scheduled_check';
    conditions: string[];
  };
  steps: EnforcementStep[];
  status: 'active' | 'paused' | 'disabled';
  executionCount: number;
  lastExecuted?: Date;
  successRate: number;
}

export interface EnforcementStep {
  stepId: string;
  name: string;
  type: 'condition_check' | 'enforcement_action' | 'notification' | 'human_review' | 'data_collection';
  config: {
    action?: EnforcementAction;
    approvers?: string[];
    timeout?: number; // minutes
    retryPolicy?: 'none' | 'linear' | 'exponential';
    notificationChannels?: ('email' | 'sms' | 'in_app' | 'webhook')[];
  };
  order: number;
  enabled: boolean;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  workflowName: string;
  triggeredBy: string;
  triggeredAt: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'pending_approval';
  currentStep: number;
  totalSteps: number;
  entityType: 'user' | 'template' | 'transaction';
  entityId: string;
  context: Record<string, any>;
}

export interface PolicyEnforcementWorkflowProps {
  className?: string;
}

export const PolicyEnforcementWorkflow: React.FC<PolicyEnforcementWorkflowProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<EnforcementWorkflow | null>(null);
  const [_____isDesignerOpen, setIsDesignerOpen] = useState(false);

  // Mock enforcement actions
  const [enforcementActions] = useState<EnforcementAction[]>([
    {
      id: 'suspend-user',
      type: 'suspend_user',
      name: 'Suspend User Account',
      description: 'Temporarily suspend user account and marketplace access',
      severity: 'high',
      automated: true,
      requiresApproval: true,
      reversible: true
    },
    {
      id: 'restrict-access',
      type: 'restrict_access',
      name: 'Restrict Marketplace Access',
      description: 'Limit user access to specific marketplace features',
      severity: 'medium',
      automated: true,
      requiresApproval: false,
      reversible: true
    },
    {
      id: 'send-warning',
      type: 'send_warning',
      name: 'Send Warning Notification',
      description: 'Send warning notification to user about policy violation',
      severity: 'low',
      automated: true,
      requiresApproval: false,
      reversible: false
    }
  ]);

  // Mock workflows
  const [workflows] = useState<EnforcementWorkflow[]>([
    {
      workflowId: 'wf-trust-score-low',
      name: 'Low Trust Score Response',
      description: 'Automated response to users with critically low trust scores',
      policyId: 'policy-trust-001',
      policyName: 'Trust Score Minimum Threshold',
      trigger: {
        type: 'violation_detected',
        conditions: ['user.trustScore < 50', 'user.trustTrend == "declining"']
      },
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
          config: {
            action: enforcementActions[2],
            notificationChannels: ['email', 'in_app']
          },
          order: 2,
          enabled: true
        },
        {
          stepId: 'step-3',
          name: 'Human Review Required',
          type: 'human_review',
          config: {
            approvers: ['admin-trust', 'admin-security'],
            timeout: 120 // 2 hours
          },
          order: 3,
          enabled: true
        },
        {
          stepId: 'step-4',
          name: 'Restrict Access',
          type: 'enforcement_action',
          config: {
            action: enforcementActions[1]
          },
          order: 4,
          enabled: true
        }
      ],
      status: 'active',
      executionCount: 23,
      lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000),
      successRate: 87.5
    },
    {
      workflowId: 'wf-fraud-detection',
      name: 'Fraud Detection Response',
      description: 'Immediate response to detected fraudulent activity',
      policyId: 'policy-fraud-001',
      policyName: 'Suspicious Transaction Detection',
      trigger: {
        type: 'violation_detected',
        conditions: ['fraud.confidence > 0.8']
      },
      steps: [
        {
          stepId: 'step-1',
          name: 'Block Transaction',
          type: 'enforcement_action',
          config: {
            action: { id: 'block-txn', type: 'block_transaction', name: 'Block Transaction', description: 'Immediately block suspicious transaction', severity: 'critical', automated: true, requiresApproval: false, reversible: true }
          },
          order: 1,
          enabled: true
        },
        {
          stepId: 'step-2',
          name: 'Notify Security Team',
          type: 'notification',
          config: {
            notificationChannels: ['email', 'webhook']
          },
          order: 2,
          enabled: true
        }
      ],
      status: 'active',
      executionCount: 8,
      lastExecuted: new Date(Date.now() - 4 * 60 * 60 * 1000),
      successRate: 100
    }
  ]);

  // Mock executions
  const [executions] = useState<WorkflowExecution[]>([
    {
      executionId: 'exec-001',
      workflowId: 'wf-trust-score-low',
      workflowName: 'Low Trust Score Response',
      triggeredBy: 'system',
      triggeredAt: new Date(Date.now() - 30 * 60 * 1000),
      status: 'pending_approval',
      currentStep: 3,
      totalSteps: 4,
      entityType: 'user',
      entityId: 'user-123',
      context: {
        trustScore: 42,
        previousScore: 58,
        violationCount: 3
      }
    },
    {
      executionId: 'exec-002',
      workflowId: 'wf-fraud-detection',
      workflowName: 'Fraud Detection Response',
      triggeredBy: 'automated_detection',
      triggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'completed',
      currentStep: 2,
      totalSteps: 2,
      entityType: 'transaction',
      entityId: 'txn-456',
      context: {
        fraudScore: 0.92,
        suspiciousPatterns: ['multiple_cards', 'velocity_anomaly'],
        blockedAmount: 2500
      }
    }
  ]);

  const getStatusColor = (status: string) => {
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
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
    case 'enforcement_action': return Zap;
    case 'notification': return Bell;
    case 'human_review': return Users;
    case 'condition_check': return CheckCircle;
    case 'data_collection': return FileText;
    default: return Activity;
    }
  };

  const renderWorkflowsList = () => (
    <div className="workflows-section">
      <div className="workflows-header">
        <h3>Enforcement Workflows</h3>
        <div className="header-actions">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsDesignerOpen(true)}>
            <Workflow className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      <div className="workflows-grid">
        {workflows.map(workflow => (
          <Card key={workflow.workflowId} className="workflow-card">
            <CardHeader>
              <div className="workflow-header">
                <div className="workflow-info">
                  <h4>{workflow.name}</h4>
                  <p>{workflow.description}</p>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="workflow-details">
                <div className="detail-item">
                  <span className="detail-label">Policy</span>
                  <span className="detail-value">{workflow.policyName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Steps</span>
                  <span className="detail-value">{workflow.steps.length}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Executions</span>
                  <span className="detail-value">{workflow.executionCount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Success Rate</span>
                  <span className="detail-value">{workflow.successRate}%</span>
                </div>
              </div>

              <div className="workflow-steps-preview">
                <h5>Workflow Steps</h5>
                <div className="steps-flow">
                  {workflow.steps.slice(0, 3).map((step, index) => {
                    const StepIcon = getStepIcon(step.type);
                    return (
                      <React.Fragment key={step.stepId}>
                        <div className="step-preview">
                          <StepIcon className="w-4 h-4" />
                          <span>{step.name}</span>
                        </div>
                        {index < Math.min(workflow.steps.length - 1, 2) && (
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        )}
                      </React.Fragment>
                    );
                  })}
                  {workflow.steps.length > 3 && (
                    <span className="more-steps">+{workflow.steps.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="workflow-actions">
                <Button
                  onClick={() => setSelectedWorkflow(workflow)}
                  size="sm"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {workflow.status === 'active' ? (
                  <Button size="sm" variant="outline">
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderExecutionsList = () => (
    <div className="executions-section">
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="executions-list">
            {executions.map(execution => (
              <div key={execution.executionId} className="execution-item">
                <div className="execution-main">
                  <div className="execution-info">
                    <div className="execution-title">
                      {execution.workflowName}
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="execution-meta">
                      <span>{execution.entityType}: {execution.entityId}</span>
                      <span>•</span>
                      <span>Started: {execution.triggeredAt.toLocaleString()}</span>
                      <span>•</span>
                      <span>By: {execution.triggeredBy}</span>
                    </div>
                  </div>
                  
                  <div className="execution-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(execution.currentStep / execution.totalSteps) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      Step {execution.currentStep} of {execution.totalSteps}
                    </span>
                  </div>
                </div>

                {execution.status === 'pending_approval' && (
                  <div className="execution-actions">
                    <Button size="sm" className="approve-btn">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="reject-btn">
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                <div className="execution-context">
                  <h6>Execution Context</h6>
                  <div className="context-items">
                    {Object.entries(execution.context).map(([key, value]) => (
                      <div key={key} className="context-item">
                        <span className="context-key">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className="context-value">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWorkflowDetails = () => {
    if (!selectedWorkflow) return null;

    return (
      <div className="workflow-details-overlay">
        <Card className="workflow-details-modal">
          <CardHeader>
            <div className="details-header">
              <div className="header-info">
                <h3>{selectedWorkflow.name}</h3>
                <Badge className={getStatusColor(selectedWorkflow.status)}>
                  {selectedWorkflow.status.toUpperCase()}
                </Badge>
              </div>
              <Button
                onClick={() => setSelectedWorkflow(null)}
                variant="outline"
                size="sm"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="workflow-visualization">
              <h4>Workflow Steps</h4>
              <div className="steps-diagram">
                {selectedWorkflow.steps.map((step, index) => {
                  const StepIcon = getStepIcon(step.type);
                  return (
                    <React.Fragment key={step.stepId}>
                      <div className={`step-node ${step.enabled ? 'enabled' : 'disabled'}`}>
                        <div className="step-icon">
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div className="step-content">
                          <h5>{step.name}</h5>
                          <p>{step.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          {step.config.action && (
                            <Badge className={getSeverityColor(step.config.action.severity)}>
                              {step.config.action.severity.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {index < selectedWorkflow.steps.length - 1 && (
                        <div className="step-connector">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="workflow-config">
              <h4>Configuration</h4>
              <div className="config-grid">
                <div className="config-item">
                  <span className="config-label">Trigger Type</span>
                  <span className="config-value">{selectedWorkflow.trigger.type.replace('_', ' ')}</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Policy</span>
                  <span className="config-value">{selectedWorkflow.policyName}</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Success Rate</span>
                  <span className="config-value">{selectedWorkflow.successRate}%</span>
                </div>
                <div className="config-item">
                  <span className="config-label">Last Executed</span>
                  <span className="config-value">
                    {selectedWorkflow.lastExecuted?.toLocaleString() || 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`policy-enforcement-workflow ${className}`}>
      <div className="workflow-header">
        <div className="header-info">
          <h2>Policy Enforcement Workflows</h2>
          <p>Manage automated enforcement workflows and monitor executions</p>
        </div>
      </div>

      <div className="workflow-tabs">
        <div className="tab-buttons">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`tab-button ${activeTab === 'workflows' ? 'active' : ''}`}
          >
            <Workflow className="w-4 h-4" />
            Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className={`tab-button ${activeTab === 'executions' ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4" />
            Executions ({executions.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
          >
            <Target className="w-4 h-4" />
            Actions ({enforcementActions.length})
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'workflows' && renderWorkflowsList()}
        {activeTab === 'executions' && renderExecutionsList()}
        {activeTab === 'actions' && (
          <Card>
            <CardHeader>
              <CardTitle>Enforcement Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="actions-grid">
                {enforcementActions.map(action => (
                  <div key={action.id} className="action-card">
                    <div className="action-header">
                      <h5>{action.name}</h5>
                      <Badge className={getSeverityColor(action.severity)}>
                        {action.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p>{action.description}</p>
                    <div className="action-properties">
                      {action.automated && <Badge className="property-badge">Automated</Badge>}
                      {action.requiresApproval && <Badge className="property-badge">Requires Approval</Badge>}
                      {action.reversible && <Badge className="property-badge">Reversible</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedWorkflow && renderWorkflowDetails()}

      <style jsx>{`
        .policy-enforcement-workflow {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }

        .workflow-tabs {
          border-bottom: 1px solid #e5e7eb;
        }

        .tab-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          color: #374151;
        }

        .tab-button.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .workflows-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .workflows-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .workflows-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 1rem;
        }

        .workflow-card .card-content {
          padding-top: 0;
        }

        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .workflow-info h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .workflow-info p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .workflow-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 500;
        }

        .workflow-steps-preview h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .steps-flow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .step-preview {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.5rem;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #374151;
        }

        .more-steps {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }

        .workflow-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .executions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .execution-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        }

        .execution-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .execution-info {
          flex: 1;
        }

        .execution-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .execution-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .execution-progress {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          min-width: 120px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .execution-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .approve-btn {
          background: #059669;
          border-color: #059669;
        }

        .approve-btn:hover {
          background: #047857;
          border-color: #047857;
        }

        .reject-btn {
          color: #dc2626;
          border-color: #dc2626;
        }

        .reject-btn:hover {
          background: #dc2626;
          color: white;
        }

        .execution-context h6 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .context-items {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .context-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .context-key {
          color: #6b7280;
          font-weight: 500;
        }

        .context-value {
          color: #1f2937;
        }

        .workflow-details-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .workflow-details-modal {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-info h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .workflow-visualization h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .steps-diagram {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          overflow-x: auto;
        }

        .step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
        }

        .step-node.enabled {
          border-color: #3b82f6;
        }

        .step-node.disabled {
          opacity: 0.5;
        }

        .step-icon {
          padding: 0.5rem;
          background: #eff6ff;
          border-radius: 50%;
        }

        .step-content {
          text-align: center;
        }

        .step-content h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
        }

        .step-content p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
        }

        .step-connector {
          display: flex;
          align-items: center;
        }

        .workflow-config {
          margin-top: 1.5rem;
        }

        .workflow-config h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .config-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .config-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .config-label {
          font-weight: 500;
          color: #374151;
        }

        .config-value {
          color: #1f2937;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .action-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .action-header h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .action-card p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }

        .action-properties {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .property-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
        }

        @media (max-width: 1200px) {
          .workflows-grid {
            grid-template-columns: 1fr;
          }
          
          .workflow-details {
            grid-template-columns: 1fr;
          }
          
          .config-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .workflow-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .workflows-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .tab-buttons {
            flex-direction: column;
          }
          
          .steps-diagram {
            flex-direction: column;
            align-items: stretch;
          }
          
          .step-connector {
            transform: rotate(90deg);
            align-self: center;
          }
          
          .execution-main {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PolicyEnforcementWorkflow;