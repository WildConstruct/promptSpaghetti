// Epic 9.4.2 - Approval Workflow Manager Component
// Main component that orchestrates all approval workflow functionality
import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ApprovalDashboard } from './ApprovalDashboard';
import { ApprovalReviewInterface } from './ApprovalReviewInterface';
import { ApprovalStatistics } from './ApprovalStatistics';
interface ApprovalCriteria {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  conditions: Record<string, any>;
  weight: number;
  is_required: boolean;
  created_at: Date;
  updated_at: Date;
}
interface ApprovalRule {
  id: string;
  workspace_id: string;
  transition_id: string;
  name: string;
  description?: string;
  reviewer_assignment_type: 'manual' | 'automatic' | 'role_based' | 'round_robin';
  required_reviewers: number;
  minimum_approvals: number;
  allow_self_approval: boolean;
  criteria_ids: string[];
  require_all_criteria: boolean;
  approval_timeout_hours: number;
  escalation_enabled: boolean;
  escalation_after_hours: number;
  escalation_reviewers: string[];
  auto_approval_enabled: boolean;
  auto_approval_conditions: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
interface ApprovalWorkflowManagerProps {
  workspaceId: string;
  currentUserId: string;
  userRole: 'admin' | 'manager' | 'reviewer' | 'user';
}

export const ApprovalWorkflowManager: React.FC<ApprovalWorkflowManagerProps> = ({)
  workspaceId,
  currentUserId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'criteria' | 'statistics'>('dashboard');
  const [approvalCriteria, setApprovalCriteria] = useState<ApprovalCriteria[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<unknown>(null);
  const [showReviewInterface, setShowReviewInterface] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [_____showRuleModal, setShowRuleModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<ApprovalCriteria | null>(null);
  const [_____editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [_____loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Determine dashboard mode based on user role
  const dashboardMode = userRole === 'admin' ? 'admin' : 'reviewer';
  useEffect(() => {
    loadApprovalData();
  }, [workspaceId]);
  const loadApprovalData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [criteriaResponse, rulesResponse] = await Promise.all([)
        fetch(`/api/approval/criteria/${workspaceId}`),}
        fetch(`/api/approval/rules/${workspaceId}`)}
      ]);
      if (criteriaResponse.ok) {
        const criteria = await criteriaResponse.json();
        setApprovalCriteria(criteria);
      }
      if (rulesResponse.ok) {
        const rules = await rulesResponse.json();
        setApprovalRules(rules);
      }
    } catch (error) {
      setError('Failed to load approval data');
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCriteria = async (data: Partial<ApprovalCriteria>) => {
    try {
      const response = await fetch('/api/approval/criteria', {)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, workspace_id: workspaceId })
      });
      if (response.ok) {
        await loadApprovalData();
        setShowCriteriaModal(false);
      }
    } catch (error) {
      setError('Failed to create criteria');
    }
  };
  const handleUpdateCriteria = async (id: string, data: Partial<ApprovalCriteria>) => {
    try {
      const response = await fetch(`/api/approval/criteria/${id}`, {)}
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        await loadApprovalData();
        setEditingCriteria(null);
      }
    } catch (error) {
      setError('Failed to update criteria');
    }
  };
  const handleDeleteCriteria = async (id: string) => {
    if (!confirm('Are you sure you want to delete this criteria?')) return;
    try {
      const response = await fetch(`/api/approval/criteria/${id}`, {)}
        method: 'DELETE',
      });
      if (response.ok) {
        await loadApprovalData();
      }
    } catch (error) {
      setError('Failed to delete criteria');
    }
  };
  const _____handleCreateRule = async (data: Partial<ApprovalRule>) => {
    try {
      const response = await fetch('/api/approval/rules', {)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, workspace_id: workspaceId })
      });
      if (response.ok) {
        await loadApprovalData();
        setShowRuleModal(false);
      }
    } catch (error) {
      setError('Failed to create rule');
    }
  };
  const handleReviewSubmit = async (;);
    decision: 'approve' | 'reject' | 'abstain',
    comment?: string,
    criteriaEvaluations?: Record<string, any>
  ) => {
    if (!selectedRequest) return;
    try {
      const response = await fetch(`/api/approval/requests/${selectedRequest.id}/review`, {)}
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({),
          decision,
          comment,
          criteria_evaluations: criteriaEvaluations,
        })
      });
      if (response.ok) {
        setShowReviewInterface(false);
        setSelectedRequest(null);
        // Refresh dashboard data would be handled by the dashboard component
      }
    } catch (error) {
      setError('Failed to submit review');
    }
  };
  const CriteriaModal: React.FC<{
    criteria?: ApprovalCriteria;
    onSave: (data: Partial<ApprovalCriteria>) => void;
    onClose: () => void;
  }> = ({ criteria, onSave, onClose }) => {
    const [formData, setFormData] = useState({)
      name: criteria?.name || '',
      description: criteria?.description || '',
      weight: criteria?.weight || 1,
      is_required: criteria?.is_required || false,
      conditions: criteria?.conditions || {}
    });
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };
    return ();
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {criteria ? 'Edit Criteria' : 'Create New Criteria'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                Required criteria
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {criteria ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  const canManageWorkflow = ['admin', 'manager'].includes(userRole);
  return ();
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Workflow</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage approval processes, criteria, and review workflows
          </p>
        </div>
        {canManageWorkflow && ()
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCriteriaModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Criteria
            </button>
            <button
              onClick={() => setShowRuleModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Rule
            </button>
          </div>
        )}
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: DocumentTextIcon },
            { id: 'rules', label: 'Rules', icon: Cog6ToothIcon },
            { id: 'criteria', label: 'Criteria', icon: ClipboardDocumentListIcon },
            { id: 'statistics', label: 'Statistics', icon: ChartBarIcon }
          ].map(tab => ()
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && ()
          <ApprovalDashboard
            workspaceId={workspaceId}
            currentUserId={currentUserId}
            mode={dashboardMode}
          />
        )}
        {activeTab === 'criteria' && ()
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvalCriteria.map((criteria) => ()
                <div key={criteria.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{criteria.name}</h3>
                    {canManageWorkflow && ()
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingCriteria(criteria)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCriteria(criteria.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {criteria.description && ()
                    <p className="text-sm text-gray-600 mb-3">{criteria.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Weight: {criteria.weight}</span>
                    {criteria.is_required && ()
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'rules' && ()
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {approvalRules.map((rule) => ()
                <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                    {canManageWorkflow && ()
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {rule.description && ()
                    <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Assignment:</span>
                      <span className="ml-2 text-gray-600">{rule.reviewer_assignment_type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reviewers:</span>
                      <span className="ml-2 text-gray-600">{rule.required_reviewers}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Min. Approvals:</span>
                      <span className="ml-2 text-gray-600">{rule.minimum_approvals}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Timeout:</span>
                      <span className="ml-2 text-gray-600">{rule.approval_timeout_hours}h</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Escalation:</span>
                      <span className="ml-2 text-gray-600">{rule.escalation_enabled ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Auto-approval:</span>
                      <span className="ml-2 text-gray-600">{rule.auto_approval_enabled ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'statistics' && ()
          <ApprovalStatistics
            workspaceId={workspaceId}
            period="30d"
          />
        )}
      </div>
      {/* Modals */}
      {showCriteriaModal && ()
        <CriteriaModal
          onSave={handleCreateCriteria}
          onClose={() => setShowCriteriaModal(false)}
        />
      )}
      {editingCriteria && ()
        <CriteriaModal
          criteria={editingCriteria}
          onSave={(data) => handleUpdateCriteria(editingCriteria.id, data)}
          onClose={() => setEditingCriteria(null)}
        />
      )}
      {showReviewInterface && selectedRequest && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <ApprovalReviewInterface
              request={selectedRequest}
              workspaceId={workspaceId}
              currentUserId={currentUserId}
              onReviewSubmit={handleReviewSubmit}
              onClose={() => {
                setShowReviewInterface(false);
                setSelectedRequest(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};